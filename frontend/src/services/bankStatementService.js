import { bankStatementsApi, accountsApi, transactionsApi } from './apiConfig';

/**
 * Bank Statements Service
 * Handles all bank statement-related API calls to the backend.
 * Mirrors the mock service interface but calls real backend API.
 */

/**
 * Build a fully-enriched statement object from:
 *  - a StatementDto returned by the backend (id, accountId, fromDate, toDate, status, downloadUrl)
 *  - account details from the accounts service
 *  - transaction logs from the transactions service filtered by the date range
 */
const enrichStatement = async (dto) => {
  // 1. Fetch account details (backend returns snake_case)
  let accountDetails = { accountNumber: dto.accountId, accountName: 'Unknown', type: 'N/A' };
  try {
    const accResp = await accountsApi.get(`/api/v1/accounts/${dto.accountId}`);
    const a = accResp.data;
    accountDetails = {
      accountNumber: String(a.account_number || dto.accountId),
      accountName: a.name || 'Account',
      type: a.account_type || 'Account',
      balance: parseFloat(a.balance || 0),
    };
  } catch (e) {
    console.warn('Could not fetch account details for statement enrichment:', e.message);
  }

  // 2. Fetch transaction logs for this account
  let rawLogs = [];
  try {
    const txnResp = await transactionsApi.get(
      `/api/v1/transactions/account/${dto.accountId}`,
      { params: { limit: 500 } }
    );
    // Backend returns { logs: [...] } or array directly
    rawLogs = Array.isArray(txnResp.data)
      ? txnResp.data
      : txnResp.data?.logs || txnResp.data?.transactions || [];
  } catch (e) {
    console.warn('Could not fetch transactions for statement enrichment:', e.message);
  }

  // 3. Filter logs to the statement period
  const fromMs = new Date(dto.fromDate).setHours(0, 0, 0, 0);
  const toMs = new Date(dto.toDate).setHours(23, 59, 59, 999);
  const periodLogs = rawLogs.filter((log) => {
    const ts = new Date(log.created_at || log.timestamp || log.date).getTime();
    return ts >= fromMs && ts <= toMs;
  });

  // 4. Map to UI transaction shape and compute running balance
  //    We walk logs sorted oldest-first and compute balance forward.
  //    Current account balance is the "balance after all transactions".
  const currentBalance = accountDetails.balance || 0;

  // Sort all raw logs descending (newest first) to compute running balance backwards
  const allSorted = [...rawLogs].sort(
    (a, b) =>
      new Date(b.created_at || b.timestamp || b.date) -
      new Date(a.created_at || a.timestamp || a.date)
  );

  // Build a map: log.id -> balance_after for each log using the current balance
  let runningBalance = currentBalance;
  const balanceAfter = {};
  for (const log of allSorted) {
    balanceAfter[log.id] = runningBalance;
    const amt = parseFloat(log.amount || 0);
    const type = (log.transaction_type || '').toUpperCase();
    if (type === 'DEPOSIT' || type === 'TRANSFER') {
      if (type === 'DEPOSIT') {
        runningBalance -= amt;
      } else {
        // TRANSFER - check direction from description
        const desc = (log.description || '').toLowerCase();
        if (desc.startsWith('transfer from')) {
          // Credit to this account
          runningBalance -= amt;
        } else {
          // Debit from this account
          runningBalance += amt;
        }
      }
    } else if (type === 'WITHDRAW') {
      runningBalance += amt;
    }
  }

  // 5. Build UI transaction objects for period logs
  const transactions = periodLogs
    .sort(
      (a, b) =>
        new Date(b.created_at || b.timestamp || b.date) -
        new Date(a.created_at || a.timestamp || a.date)
    )
    .map((log) => {
      const amt = parseFloat(log.amount || 0);
      const type = (log.transaction_type || '').toUpperCase();
      let isCredit = type === 'DEPOSIT';
      if (type === 'TRANSFER') {
        const desc = (log.description || '').toLowerCase();
        isCredit = desc.startsWith('transfer from');
      }
      return {
        id: log.id || log.reference_id,
        date: log.created_at || log.timestamp || log.date,
        description: log.description || type,
        type: isCredit ? 'CREDIT' : 'DEBIT',
        credit: isCredit ? amt : 0,
        debit: isCredit ? 0 : amt,
        balance: parseFloat((balanceAfter[log.id] || 0).toFixed(2)),
      };
    });

  // 6. Compute summary
  const totalCredits = transactions.reduce((s, t) => s + (t.credit || 0), 0);
  const totalDebits = transactions.reduce((s, t) => s + (t.debit || 0), 0);

  // Opening balance = closing balance - net change
  const closingBalance =
    transactions.length > 0
      ? transactions[transactions.length - 1].balance
      : currentBalance;
  const openingBalance = closingBalance - totalCredits + totalDebits;

  return {
    statementId: dto.id,
    downloadUrl: dto.downloadUrl,
    accountDetails,
    period: {
      fromDate: dto.fromDate,
      toDate: dto.toDate,
    },
    summary: {
      openingBalance: parseFloat(openingBalance.toFixed(2)),
      closingBalance: parseFloat(closingBalance.toFixed(2)),
      totalCredits: parseFloat(totalCredits.toFixed(2)),
      totalDebits: parseFloat(totalDebits.toFixed(2)),
      transactionCount: transactions.length,
    },
    transactions,
  };
};

export const bankStatementService = {
  /**
   * Get list of eligible accounts for statement generation.
   * Calls the real accounts backend and maps to the shape the UI expects.
   */
  getEligibleAccounts: async () => {
    try {
      const response = await accountsApi.get('/api/v1/accounts');
      const accounts = Array.isArray(response.data) ? response.data : [];
      return accounts.map((a) => ({
        id: String(a.account_number),
        accountNumber: String(a.account_number),
        accountName: a.name || 'Account',
        type: a.account_type || 'Account',
        balance: parseFloat(a.balance || 0),
      }));
    } catch (error) {
      console.error('Error fetching eligible accounts:', error);
      return [];
    }
  },

  /**
   * Generate a new statement for an account.
   * Calls POST /api/v1/statements/generate, then enriches the result
   * with account details and transactions so the UI can render a full preview.
   */
  generateStatement: async (accountId, fromDate, toDate, format = 'PDF') => {
    try {
      const payload = {
        accountId: String(accountId),
        fromDate,
        toDate,
        format,
      };
      const response = await bankStatementsApi.post('/api/v1/statements/generate', payload);
      const dto = response.data;

      // Persist the statement ID so download can use it later
      if (dto && dto.id) {
        try {
          localStorage.setItem('lastStatementId', dto.id);
        } catch (e) {
          console.warn('localStorage unavailable, statement ID not persisted.');
        }
      }

      // Enrich with account + transaction data for full preview
      return await enrichStatement(dto);
    } catch (error) {
      console.error('Error generating statement:', error);
      throw error;
    }
  },

  /**
   * Get the most recently generated statement by ID (from localStorage).
   * Used by the download flow.
   */
  getCurrentStatement: async () => {
    try {
      let statementId = null;
      try {
        statementId = localStorage.getItem('lastStatementId');
      } catch (e) {
        // ignore
      }
      if (!statementId) {
        throw new Error('No statement available. Please generate one first.');
      }
      const response = await bankStatementsApi.get(`/api/v1/statements/${statementId}`);
      return await enrichStatement(response.data);
    } catch (error) {
      console.error('Error fetching current statement:', error);
      throw error;
    }
  },

  /**
   * Download a statement file.
   * Retrieves the download URL from the backend and opens it in a new tab.
   */
  downloadStatement: async (format = 'PDF') => {
    try {
      let statementId = null;
      try {
        statementId = localStorage.getItem('lastStatementId');
      } catch (e) {
        // ignore
      }
      if (!statementId) {
        throw new Error('No statement available to download.');
      }
      const response = await bankStatementsApi.get(`/api/v1/statements/${statementId}/download`);
      const downloadUrl = typeof response.data === 'string' ? response.data : response.data?.url;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
      return { success: true, url: downloadUrl };
    } catch (error) {
      console.error('Error downloading statement:', error);
      throw error;
    }
  },
};

export default bankStatementService;
