import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { loanService } from '../../services/loanService';
import { useSettingsStore } from '../../store/settingsStore';
import {
  ChevronLeft, CheckCircle, XCircle, RefreshCw,
  Landmark, Clock, TrendingUp, Loader2, DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  APPROVED:'bg-blue-100 text-blue-800 border-blue-200',
  ACTIVE:  'bg-emerald-100 text-emerald-800 border-emerald-200',
  REJECTED:'bg-red-100 text-red-800 border-red-200',
  CLOSED:  'bg-gray-100 text-gray-700 border-gray-200',
};

const LoanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuthStore();
  const formatCurrency = useSettingsStore(state => state.formatCurrency);
  const formatDate = useSettingsStore(state => state.formatDate);
  const currencySymbol = useSettingsStore(state => state.getCurrencySymbol());
  const isStaff = hasRole('ADMIN') || hasRole('MANAGER');

  const [loan, setLoan] = useState(null);
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [showDecision, setShowDecision] = useState(null);
  const [remarks, setRemarks] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [loanData, repData] = await Promise.all([
        loanService.getLoan(id),
        loanService.getRepayments(id),
      ]);
      setLoan(loanData);
      setRepayments(repData);
    } catch {
      toast.error('Failed to load loan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleDecision = async (decision) => {
    setActionLoading(true);
    try {
      if (decision === 'approve') {
        await loanService.approveLoan(id, { remarks });
        toast.success('Loan approved!');
      } else {
        await loanService.rejectLoan(id, { remarks });
        toast.success('Loan rejected');
      }
      setShowDecision(null);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRepayment = async () => {
    const amt = parseFloat(repayAmount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    setActionLoading(true);
    try {
      await loanService.makeRepayment(id, amt);
      toast.success('Repayment recorded!');
      setRepayAmount('');
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Repayment failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  );
  if (!loan) return <div className="text-center py-16 text-gray-500">Loan not found</div>;

  const progress = loan.amount > 0
    ? Math.min(100, ((loan.total_paid || 0) / loan.amount) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/loans')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">Loan #{loan.id}</h1>
          <p className="text-gray-500">{loan.loan_type} Loan · Applied {loan.applied_date ? formatDate(loan.applied_date, false) : '—'}</p>
        </div>
        <span className={`ml-auto badge border ${STATUS_STYLES[loan.status]}`}>{loan.status}</span>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Loan Amount', value: formatCurrency(loan.amount), icon: Landmark },
          { label: 'Monthly EMI', value: formatCurrency(loan.emi_amount), icon: Clock },
          { label: 'Total Paid', value: formatCurrency(loan.total_paid || 0), icon: CheckCircle },
          { label: 'Remaining', value: formatCurrency(loan.remaining_amount || 0), icon: TrendingUp },
        ].map(c => (
          <div key={c.label} className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <c.icon className="w-4 h-4 text-primary-600" />
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
            <p className="font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      {(loan.status === 'ACTIVE' || loan.status === 'CLOSED') && (
        <div className="card p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Repayment Progress</span>
            <span className="font-semibold text-primary-600">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Loan Info */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Loan Details</h3>
          <dl className="space-y-3">
            {[
              ['Account Number', loan.account_number],
              ['Loan Type', loan.loan_type],
              ['Interest Rate', `${loan.interest_rate}% p.a.`],
              ['Tenure', `${loan.tenure_months} months`],
              ['Purpose', loan.purpose],
              ['Approved Date', loan.approved_date ? formatDate(loan.approved_date, false) : '—'],
              loan.remarks && ['Remarks', loan.remarks],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <dt className="text-gray-500">{k}</dt>
                <dd className="font-medium text-gray-900 max-w-[55%] text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {isStaff && loan.status === 'PENDING' && !showDecision && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Decision</h3>
              <div className="flex gap-3">
                <button onClick={() => setShowDecision('approve')} className="btn-success flex-1 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => setShowDecision('reject')} className="btn-danger flex-1 flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          )}

          {showDecision && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-3 capitalize">{showDecision} Loan</h3>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)}
                className="input w-full h-20 mb-3 resize-none" placeholder="Remarks (optional)" />
              <div className="flex gap-3">
                <button onClick={() => setShowDecision(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => handleDecision(showDecision)} disabled={actionLoading}
                  className={`flex-1 flex items-center justify-center gap-2 ${showDecision === 'approve' ? 'btn-success' : 'btn-danger'}`}>
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirm
                </button>
              </div>
            </div>
          )}

          {(loan.status === 'ACTIVE' || loan.status === 'APPROVED') && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" /> Make Repayment
              </h3>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                  <input type="number" min="1" value={repayAmount}
                    onChange={e => setRepayAmount(e.target.value)}
                    className="input w-full pl-8" placeholder={`EMI: ${formatCurrency(loan.emi_amount)}`} />
                </div>
                <button onClick={handleRepayment} disabled={actionLoading} className="btn-success flex-1 flex items-center justify-center gap-2">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Pay
                </button>
              </div>
              <button className="text-sm text-primary-600 mt-2 hover:underline"
                onClick={() => setRepayAmount(String(loan.emi_amount))}>Use EMI amount</button>
            </div>
          )}
        </div>
      </div>

      {/* Repayment History */}
      {repayments.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Repayment History</h3>
          </div>
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3">EMI #</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {repayments.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="table-cell text-gray-500">#{r.emi_number}</td>
                  <td className="table-cell font-semibold text-emerald-600">{formatCurrency(r.amount)}</td>
                  <td className="table-cell text-gray-500">
                    {r.paid_date ? formatDate(r.paid_date) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LoanDetailsPage;
