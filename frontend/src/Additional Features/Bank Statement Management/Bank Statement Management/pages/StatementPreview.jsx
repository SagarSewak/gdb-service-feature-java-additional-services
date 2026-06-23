import React, { useState, useEffect } from 'react';
import { statementService } from '../services/mockStatementService';
import { 
  ArrowLeft, Download, FileText, Printer, Search, ArrowUpDown, 
  Wallet, ArrowDownRight, ArrowUpRight, Filter, Calendar, Building2, AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#22c55e', '#ef4444'];

const formatMoney = (amount) => {
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const StatementPreview = () => {
  // Filter States
  const [accounts, setAccounts] = useState([]);
  const [filters, setFilters] = useState({
    accountId: '',
    fromDate: '',
    toDate: ''
  });
  const [filterErrors, setFilterErrors] = useState({});
  
  // Data States
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Table state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load Accounts on Mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accs = await statementService.getEligibleAccounts();
        setAccounts(accs);
        if (accs.length > 0) {
          // Default to last 30 days for the first account
          const today = new Date();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(today.getDate() - 30);
          
          setFilters({
            accountId: accs[0].id,
            fromDate: thirtyDaysAgo.toISOString().split('T')[0],
            toDate: today.toISOString().split('T')[0]
          });
        }
      } catch (err) {
        toast.error("Failed to load accounts");
      } finally {
        setInitialLoad(false);
      }
    };
    fetchAccounts();
  }, []);

  const validateFilters = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!filters.accountId) errors.accountId = 'Required';
    
    if (!filters.fromDate) errors.fromDate = 'Required';
    else if (new Date(filters.fromDate) > today) errors.fromDate = 'No future dates';

    if (!filters.toDate) errors.toDate = 'Required';
    else if (new Date(filters.toDate) > today) errors.toDate = 'No future dates';

    if (filters.fromDate && filters.toDate) {
      const fromD = new Date(filters.fromDate);
      const toD = new Date(filters.toDate);
      if (fromD > toD) errors.fromDate = 'From > To';
      else if ((toD - fromD) / (1000 * 60 * 60 * 24) > 365) errors.toDate = 'Max 1 year';
    }
    return errors;
  };

  const handleFetchStatement = async () => {
    const errors = validateFilters();
    if (Object.keys(errors).length > 0) {
      setFilterErrors(errors);
      toast.error('Please fix the date filter errors');
      return;
    }
    setFilterErrors({});

    try {
      setLoading(true);
      // Generate statement behind the scenes and then fetch it
      await statementService.generateStatement(filters.accountId, filters.fromDate, filters.toDate, 'PDF');
      const stmt = await statementService.getCurrentStatement();
      setData(stmt);
      setCurrentPage(1); // reset pagination
      setSearchQuery(''); // reset search
    } catch (err) {
      toast.error('Unable to fetch statement for this period');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      setDownloading(true);
      toast.loading(`Preparing ${format}...`, { id: 'download' });
      await statementService.downloadStatement(format);
      toast.success(`${format} downloaded successfully!`, { id: 'download' });
    } catch (err) {
      toast.error(`Failed to download ${format}`, { id: 'download' });
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  if (initialLoad) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Derived Chart Data
  let pieData = [];
  let trendData = [];
  let paginatedTxns = [];
  let totalPages = 0;
  let filteredTxns = [];

  if (data) {
    pieData = [
      { name: 'Total Credits', value: data.summary.totalCredits },
      { name: 'Total Debits', value: data.summary.totalDebits }
    ];

    const dailyDataMap = {};
    data.transactions.forEach(tx => {
      const dateStr = new Date(tx.date).toLocaleDateString('en-GB');
      if (!dailyDataMap[dateStr]) dailyDataMap[dateStr] = { date: dateStr, credit: 0, debit: 0 };
      if (tx.type === 'CREDIT') dailyDataMap[dateStr].credit += tx.credit;
      if (tx.type === 'DEBIT') dailyDataMap[dateStr].debit += tx.debit;
    });
    trendData = Object.values(dailyDataMap).slice(0, 15);

    filteredTxns = data.transactions.filter(tx => 
      tx.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filteredTxns.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    totalPages = Math.ceil(filteredTxns.length / itemsPerPage);
    paginatedTxns = filteredTxns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 print:bg-white print:p-0">
      
      {/* Page Header */}
      <div className="flex justify-between items-end print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Statements</h1>
          <p className="text-gray-500">View and download your account transaction history.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 print:hidden">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Account</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-gray-400" />
              </div>
              <select
                className={`pl-9 block w-full rounded-lg shadow-sm text-sm py-2.5 transition-colors ${filterErrors.accountId ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500'}`}
                value={filters.accountId}
                onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
              >
                <option value="" disabled>Select account...</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.accountNumber} - {acc.type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full md:w-1/4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">From Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                className={`pl-9 block w-full rounded-lg shadow-sm text-sm py-2.5 transition-colors ${filterErrors.fromDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500'}`}
                value={filters.fromDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              />
            </div>
            {filterErrors.fromDate && <p className="text-xs text-red-500 mt-1 absolute">{filterErrors.fromDate}</p>}
          </div>

          <div className="w-full md:w-1/4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">To Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                className={`pl-9 block w-full rounded-lg shadow-sm text-sm py-2.5 transition-colors ${filterErrors.toDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500'}`}
                value={filters.toDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              />
            </div>
            {filterErrors.toDate && <p className="text-xs text-red-500 mt-1 absolute">{filterErrors.toDate}</p>}
          </div>

          <div className="w-full md:w-auto md:ml-auto">
            <button
              onClick={handleFetchStatement}
              disabled={loading}
              className="w-full md:w-auto btn-primary py-2.5 px-6 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Filter className="w-4 h-4" />
              )}
              Fetch Statement
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!data && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center print:hidden">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Statement Loaded</h3>
          <p className="text-gray-500 mt-2">Select an account and date range above to fetch your statement.</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-48 print:hidden">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Main Statement Content */}
      {data && !loading && (
        <div className="space-y-6">
          
          {/* Action Bar */}
          <div className="flex justify-end gap-3 print:hidden">
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 bg-white">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={() => handleDownload('CSV')} disabled={downloading} className="btn-secondary flex items-center gap-2 bg-white">
              <FileText className="w-4 h-4" /> CSV
            </button>
            <button onClick={() => handleDownload('PDF')} disabled={downloading} className="btn-primary flex items-center gap-2 shadow-sm">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>

          {/* Print Header (Only visible when printing) */}
          <div className="hidden print:block text-center border-b pb-4 mb-6">
            <h1 className="text-3xl font-bold">Global Digital Bank</h1>
            <h2 className="text-xl mt-2">Account Statement</h2>
            <p className="text-gray-600">{data.accountDetails.accountNumber} - {data.accountDetails.accountName}</p>
            <p className="text-gray-600">Period: {new Date(data.period.fromDate).toLocaleDateString()} to {new Date(data.period.toDate).toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Account Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4 text-primary-600">
                  <Wallet className="w-6 h-6" />
                  <h3 className="font-semibold text-gray-900">Account Details</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Account Name</p>
                    <p className="font-semibold text-gray-900">{data.accountDetails.accountName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Account Number</p>
                    <p className="font-semibold tracking-wider text-gray-900">{data.accountDetails.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Account Type</p>
                    <p className="font-semibold text-gray-900">{data.accountDetails.type}</p>
                  </div>
                </div>
              </div>

              {/* Metrics Widget */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Summary</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Opening Balance</span>
                  <span className="font-semibold text-gray-900">₹{formatMoney(data.summary.openingBalance)}</span>
                </div>
                <div className="flex justify-between items-center text-green-600">
                  <div className="flex items-center gap-1 text-sm"><ArrowDownRight className="w-4 h-4"/> Total Credits</div>
                  <span className="font-semibold">+ ₹{formatMoney(data.summary.totalCredits)}</span>
                </div>
                <div className="flex justify-between items-center text-red-500">
                  <div className="flex items-center gap-1 text-sm"><ArrowUpRight className="w-4 h-4"/> Total Debits</div>
                  <span className="font-semibold">- ₹{formatMoney(data.summary.totalDebits)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                  <span className="text-sm font-semibold text-gray-900">Closing Balance</span>
                  <span className="font-bold text-lg text-primary-600">₹{formatMoney(data.summary.closingBalance)}</span>
                </div>
              </div>

              {/* Charts (Hidden on print) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:hidden">
                <h3 className="font-semibold text-gray-900 mb-4 text-center">Inflow vs Outflow</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `₹${formatMoney(value)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-sm mt-2">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Credits</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Debits</div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Trend Chart (Hidden on print) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:hidden">
                <h3 className="font-semibold text-gray-900 mb-4">Daily Transaction Trend</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                      <RechartsTooltip formatter={(value) => `₹${formatMoney(value)}`} />
                      <Bar dataKey="credit" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="debit" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                  <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      maxLength={100}
                      className="pl-9 block w-full rounded-lg border-gray-200 shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500 py-2"
                      placeholder="Search description..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Filter className="w-4 h-4" />
                    <span>{filteredTxns.length} records found</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setSortOrder(p => p === 'desc' ? 'asc' : 'desc')}>
                          <div className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedTxns.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p>No Transactions Found</p>
                          </td>
                        </tr>
                      ) : (
                        paginatedTxns.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(tx.date).toLocaleDateString('en-GB')}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{tx.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                              {tx.debit ? `₹${formatMoney(tx.debit)}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                              {tx.credit ? `₹${formatMoney(tx.credit)}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-bold">
                              ₹{formatMoney(tx.balance)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between print:hidden">
                    <span className="text-sm text-gray-500">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTxns.length)} of {filteredTxns.length}
                    </span>
                    <div className="flex gap-2">
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Previous</button>
                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Next</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatementPreview;
