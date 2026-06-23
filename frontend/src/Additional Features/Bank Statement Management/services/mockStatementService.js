const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const mockAccounts = [
  { id: 'ACC_001', accountNumber: '100012345678', accountName: 'John Doe', type: 'Savings', balance: 54000.50 },
  { id: 'ACC_002', accountNumber: '200098765432', accountName: 'John Doe', type: 'Current', balance: 125000.00 },
];

const generateMockTransactions = (fromDate, toDate, accountId) => {
  const transactions = [];
  const start = new Date(fromDate).getTime();
  const end = new Date(toDate).getTime();
  
  // Ensure we have at least 10 and max 50 transactions
  const numTxns = Math.floor(Math.random() * 40) + 10;
  
  let currentBalance = Math.random() * 100000 + 10000; // Random starting balance

  const descriptions = [
    'Amazon Purchase', 'Salary Credit', 'Zomato Food', 'Netflix Sub', 'ATM Withdrawal', 
    'Grocery Store', 'Electricity Bill', 'Phone Bill', 'Rent Payment', 'Fund Transfer'
  ];

  for (let i = 0; i < numTxns; i++) {
    const randomTime = start + Math.random() * (end - start);
    const date = new Date(randomTime);
    
    const isCredit = Math.random() > 0.7; // 30% chance of credit
    const amount = isCredit 
      ? Math.floor(Math.random() * 50000) + 1000  // Credits are larger
      : Math.floor(Math.random() * 5000) + 100;   // Debits are smaller

    currentBalance = isCredit ? currentBalance + amount : currentBalance - amount;

    transactions.push({
      id: `TXN${Math.floor(Math.random() * 1000000)}`,
      date: date.toISOString(),
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      type: isCredit ? 'CREDIT' : 'DEBIT',
      debit: isCredit ? null : amount,
      credit: isCredit ? amount : null,
      balance: currentBalance
    });
  }

  // Sort by date descending
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Internal store for the current active statement so it can be shared between Preview and Download
let currentStatementData = null;

export const statementService = {
  getEligibleAccounts: async () => {
    await delay(500);
    return mockAccounts;
  },

  generateStatement: async (accountId, fromDate, toDate, format) => {
    await delay(1500); // Simulate processing time
    
    const account = mockAccounts.find(a => a.id === accountId || a.accountNumber === accountId);
    if (!account) throw new Error("Account not found");

    const transactions = generateMockTransactions(fromDate, toDate, accountId);
    
    const totalCredits = transactions.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + t.credit, 0);
    const totalDebits = transactions.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + t.debit, 0);
    
    // Sort ascending to get opening/closing
    const sortedAsc = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const openingBalance = sortedAsc.length > 0 ? sortedAsc[0].balance - (sortedAsc[0].type === 'CREDIT' ? sortedAsc[0].credit : -sortedAsc[0].debit) : account.balance;
    const closingBalance = sortedAsc.length > 0 ? sortedAsc[sortedAsc.length - 1].balance : account.balance;

    const statementData = {
      accountDetails: account,
      period: { fromDate, toDate },
      format,
      summary: {
        openingBalance,
        closingBalance,
        totalCredits,
        totalDebits,
        transactionCount: transactions.length
      },
      transactions
    };

    currentStatementData = statementData;
    
    return {
      success: true,
      statementId: `STMT_${Math.floor(Math.random() * 100000)}`,
      message: 'Statement generated successfully.'
    };
  },

  getCurrentStatement: async () => {
    await delay(300);
    if (!currentStatementData) throw new Error("No statement generated");
    return currentStatementData;
  },

  downloadStatement: async (format) => {
    await delay(2000);
    if (!currentStatementData) throw new Error("No statement available to download");
    return { success: true, url: `/mock-download-url.${format.toLowerCase()}` };
  }
};
