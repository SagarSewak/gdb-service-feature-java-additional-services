import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statementService } from '../services/mockStatementService';
import { 
  ArrowLeft, Download, FileText, Printer, Search, ArrowUpDown, 
  Wallet, ArrowDownRight, ArrowUpRight, Filter
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#22c55e', '#ef4444']; // Green for credit, Red for debit

const StatementPreview = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  
  // Table state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc' by date
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchStatement = async () => {
      try {
        const stmt = await statementService.getCurrentStatement();
        setData(stmt);
      } catch (err) {
        toast.error('No statement available. Please generate one.');
        navigate('/statements');
      } finally {
        setLoading(false);
      }
    };
    fetchStatement();
  }, [navigate]);

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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) return null;

  // Prepare chart data
  const pieData = [
    { name: 'Total Credits', value: data.summary.totalCredits },
    { name: 'Total Debits', value: data.summary.totalDebits }
  ];

  // Prepare daily trend data (aggregate transactions by day)
  const dailyDataMap = {};
  data.transactions.forEach(tx => {
    const dateStr = new Date(tx.date).toLocaleDateString('en-GB');
    if (!dailyDataMap[dateStr]) dailyDataMap[dateStr] = { date: dateStr, credit: 0, debit: 0 };
    if (tx.type === 'CREDIT') dailyDataMap[dateStr].credit += tx.credit;
    if (tx.type === 'DEBIT') dailyDataMap[dateStr].debit += tx.debit;
  });
  const trendData = Object.values(dailyDataMap).slice(0, 15); // Show up to 15 days on chart

  // Filter and Sort Table
  let filteredTxns = data.transactions.filter(tx => 
    tx.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  filteredTxns.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(filteredTxns.length / itemsPerPage);
  const paginatedTxns = filteredTxns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 print:bg-white print:p-0">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/statements')} 
            className="p-2.5 bg-white shadow-sm hover:bg-gray-50 rounded-full transition-all border border-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Statement Preview</h1>
            <p className="text-gray-500">
              {new Date(data.period.fromDate).toLocaleDateString()} to {new Date(data.period.toDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handlePrint}
            className="btn-secondary flex items-center gap-2 bg-white"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button 
            onClick={() => handleDownload('CSV')}
            disabled={downloading}
            className="btn-secondary flex items-center gap-2 bg-white"
          >
            <FileText className="w-4 h-4" /> CSV
          </button>
          <button 
            onClick={() => handleDownload('PDF')}
            disabled={downloading}
            className="btn-primary flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block text-center border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold">Global Digital Bank</h1>
        <h2 className="text-xl mt-2">Account Statement</h2>
        <p className="text-gray-600">{data.accountDetails.accountNumber} - {data.accountDetails.accountName}</p>
        <p className="text-gray-600">Period: {new Date(data.period.fromDate).toLocaleDateString()} to {new Date(data.period.toDate).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Summary Metrics & Charts */}
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
              <span className="font-semibold text-gray-900">₹{data.summary.openingBalance.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-green-600">
              <div className="flex items-center gap-1 text-sm"><ArrowDownRight className="w-4 h-4"/> Total Credits</div>
              <span className="font-semibold">+ ₹{data.summary.totalCredits.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-red-500">
              <div className="flex items-center gap-1 text-sm"><ArrowUpRight className="w-4 h-4"/> Total Debits</div>
              <span className="font-semibold">- ₹{data.summary.totalDebits.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <span className="text-sm font-semibold text-gray-900">Closing Balance</span>
              <span className="font-bold text-lg text-primary-600">₹{data.summary.closingBalance.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Charts (Hidden on print to save ink/space) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:hidden">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">Inflow vs Outflow</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-sm mt-2">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Credits</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Debits</div>
            </div>
          </div>

        </div>

        {/* Right Column: Transaction Table & Trend Chart */}
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
                  <RechartsTooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Bar dataKey="credit" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="debit" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Table Toolbar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  maxLength={100}
                  className="pl-9 block w-full rounded-lg border-gray-200 shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={toggleSort}>
                      <div className="flex items-center gap-1">
                        Date <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Debit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(tx.date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                          {tx.debit ? `₹${tx.debit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                          {tx.credit ? `₹${tx.credit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-bold">
                          ₹{tx.balance.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between print:hidden">
                <span className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTxns.length)} of {filteredTxns.length}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatementPreview;
