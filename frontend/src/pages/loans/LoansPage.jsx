import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { loanService } from '../../services/loanService';
import { useSettingsStore } from '../../store/settingsStore';
import {
  Landmark, Plus, Eye, CheckCircle, XCircle,
  Clock, RefreshCw, ChevronRight, TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  PENDING:  'bg-amber-100 text-amber-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  ACTIVE:   'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  CLOSED:   'bg-gray-100 text-gray-700',
  DEFAULTED:'bg-red-200 text-red-900',
};

const TYPE_LABELS = {
  PERSONAL: 'Personal', HOME: 'Home', CAR: 'Car',
  BUSINESS: 'Business', EDUCATION: 'Education',
};

const TYPE_COLORS = {
  PERSONAL: 'bg-purple-100 text-purple-800',
  HOME:     'bg-blue-100 text-blue-800',
  CAR:      'bg-green-100 text-green-800',
  BUSINESS: 'bg-orange-100 text-orange-800',
  EDUCATION:'bg-pink-100 text-pink-800',
};

const LoansPage = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuthStore();
  const formatCurrency = useSettingsStore(state => state.formatCurrency);
  const formatDate = useSettingsStore(state => state.formatDate);
  const isStaff = hasRole('ADMIN') || hasRole('MANAGER');
  const canApply = !hasRole('ADMIN');

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const data = isStaff ? await loanService.getAllLoans() : await loanService.getMyLoans();
      setLoans(data);
    } catch {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans(); }, []);

  const filtered = filter === 'ALL' ? loans : loans.filter(l => l.status === filter);

  const stats = {
    total: loans.length,
    pending: loans.filter(l => l.status === 'PENDING').length,
    active: loans.filter(l => l.status === 'ACTIVE' || l.status === 'APPROVED').length,
    totalAmount: loans.reduce((s, l) => s + (l.amount || 0), 0),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">{isStaff ? 'Loan Management' : 'My Loans'}</h1>
          <p className="text-gray-500 mt-1">{isStaff ? 'Review and manage all loan applications' : 'Track your loan applications and repayments'}</p>
        </div>
        {canApply && (
          <button onClick={() => navigate('/loans/apply')} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Apply for Loan
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Loans', value: stats.total, icon: Landmark, color: 'text-primary-600 bg-primary-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Active', value: stats.active, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Total Value', value: formatCurrency(stats.totalAmount), icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card p-4 flex items-center gap-2 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'ACTIVE', 'REJECTED', 'CLOSED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>{s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</button>
        ))}
        <button onClick={fetchLoans} className="ml-auto btn-secondary flex items-center gap-2 py-1.5">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{filter === 'ALL' ? (isStaff ? 'No loan applications yet.' : 'No loans found. Apply for your first loan!') : `No ${filter.toLowerCase()} loans.`}</p>
            {canApply && (
              <button onClick={() => navigate('/loans/apply')} className="btn-primary mt-4 inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Apply Now
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  {isStaff && <th className="px-6 py-4">Applicant</th>}
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">EMI</th>
                  <th className="px-6 py-4">Tenure</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Applied</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(loan => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-mono text-sm">#{loan.id}</td>
                    {isStaff && <td className="table-cell font-medium">{loan.login_id}</td>}
                    <td className="table-cell">
                      <span className={`badge ${TYPE_COLORS[loan.loan_type]}`}>{TYPE_LABELS[loan.loan_type]}</span>
                    </td>
                    <td className="table-cell font-semibold">{formatCurrency(loan.amount)}</td>
                    <td className="table-cell text-gray-600">{formatCurrency(loan.emi_amount)}/mo</td>
                    <td className="table-cell text-gray-600">{loan.tenure_months}m</td>
                    <td className="table-cell">
                      <span className={`badge ${STATUS_STYLES[loan.status]}`}>{loan.status}</span>
                    </td>
                    <td className="table-cell text-gray-500">
                      {loan.applied_date ? formatDate(loan.applied_date, false) : '—'}
                    </td>
                    <td className="table-cell text-right">
                      <button onClick={() => navigate(`/loans/${loan.id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-1 text-sm text-primary-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoansPage;
