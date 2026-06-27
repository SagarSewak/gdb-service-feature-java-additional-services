import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { loanService } from '../../services/loanService';
import { accountsService } from '../../services/accountsService';
import { useSettingsStore } from '../../store/settingsStore';
import { Landmark, Calculator, ChevronLeft, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const LOAN_TYPES = [
  { value: 'PERSONAL',  label: 'Personal Loan',  rate: 12.0, icon: '👤', desc: 'For personal expenses, medical bills, travel' },
  { value: 'HOME',      label: 'Home Loan',       rate: 8.5,  icon: '🏠', desc: 'Purchase or construct your dream home' },
  { value: 'CAR',       label: 'Car Loan',        rate: 9.0,  icon: '🚗', desc: 'Finance your vehicle purchase' },
  { value: 'BUSINESS',  label: 'Business Loan',   rate: 14.0, icon: '💼', desc: 'Grow your business with capital' },
  { value: 'EDUCATION', label: 'Education Loan',  rate: 7.5,  icon: '🎓', desc: 'Invest in your future education' },
];

const calculateEMI = (principal, annualRate, months) => {
  if (!principal || !annualRate || !months) return 0;
  const r = annualRate / 1200;
  const power = Math.pow(1 + r, months);
  return (principal * r * power) / (power - 1);
};

const LoanApplicationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const formatCurrency = useSettingsStore(state => state.formatCurrency);
  const currencySymbol = useSettingsStore(state => state.getCurrencySymbol());

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    loanType: '',
    account_number: '',
    amount: '',
    tenure_months: '36',
    purpose: '',
  });

  const selectedType = LOAN_TYPES.find(t => t.value === form.loanType);
  const emi = calculateEMI(parseFloat(form.amount), selectedType?.rate || 12, parseInt(form.tenure_months));
  const totalPayable = emi * parseInt(form.tenure_months || 1);
  const totalInterest = totalPayable - parseFloat(form.amount || 0);

  useEffect(() => {
    accountsService.getAll()
      .then(data => setAccounts(Array.isArray(data) ? data : data?.accounts || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.loanType || !form.account_number || !form.amount || !form.purpose) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await loanService.applyForLoan({
        account_number: form.account_number,
        loan_type: form.loanType,
        amount: parseFloat(form.amount),
        tenure_months: parseInt(form.tenure_months),
        purpose: form.purpose,
      });
      toast.success('Loan application submitted successfully!');
      navigate('/loans');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/loans')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">Apply for Loan</h1>
          <p className="text-gray-500">Quick approval, competitive rates</p>
        </div>
      </div>

      {/* Step 1 — Choose loan type */}
      {step === 1 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Loan Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LOAN_TYPES.map(type => (
              <button key={type.value}
                onClick={() => { setForm(f => ({ ...f, loanType: type.value })); setStep(2); }}
                className="p-5 rounded-xl border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all text-left group">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{type.icon}</span>
                  <span className="font-semibold text-gray-900 group-hover:text-primary-700">{type.label}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{type.desc}</p>
                <p className="text-sm font-medium text-primary-600">Interest: {type.rate}% p.a.</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Details */}
      {step === 2 && selectedType && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{selectedType.icon}</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedType.label}</h2>
                <p className="text-sm text-primary-600">{selectedType.rate}% per annum</p>
              </div>
              <button type="button" onClick={() => setStep(1)}
                className="ml-auto text-sm text-primary-600 hover:underline">Change Type</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="label">Linked Account <span className="text-red-500">*</span></label>
                <select value={form.account_number}
                  onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))}
                  className="input w-full" required>
                  <option value="">Select account</option>
                  {accounts.map(a => (
                    <option key={a.account_number} value={a.account_number}>
                      #{a.account_number} — {a.name || a.account_type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Loan Amount ({currencySymbol}) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">{currencySymbol}</span>
                  <input type="number" min="10000" max="10000000" step="1000"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="input w-full pl-8" placeholder="e.g. 500000" required />
                </div>
                <p className="text-xs text-gray-400 mt-1">Min {currencySymbol}10,000 — Max {currencySymbol}1,00,00,000</p>
              </div>

              <div>
                <label className="label">Tenure: <span className="font-semibold text-primary-600">{form.tenure_months} months</span></label>
                <input type="range" min="6" max="360" step="6"
                  value={form.tenure_months}
                  onChange={e => setForm(f => ({ ...f, tenure_months: e.target.value }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>6 months</span><span>30 years</span>
                </div>
              </div>

              <div>
                <label className="label">Purpose <span className="text-red-500">*</span></label>
                <textarea value={form.purpose}
                  onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                  className="input w-full h-24 resize-none"
                  placeholder="Briefly describe why you need this loan..." required maxLength={500} />
              </div>
            </div>
          </div>

          {/* EMI Calculator preview */}
          {form.amount && parseInt(form.amount) >= 10000 && (
            <div className="card p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-primary-900">Loan Summary</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Monthly EMI', value: formatCurrency(emi) },
                  { label: 'Total Interest', value: formatCurrency(Math.max(0, totalInterest)) },
                  { label: 'Total Payable', value: formatCurrency(totalPayable) },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className="font-bold text-primary-700 text-lg">{item.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-3">
                <Info className="w-3 h-3" /> EMI is indicative. Final rate subject to credit assessment.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Landmark className="w-4 h-4" />}
              Submit Application
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoanApplicationPage;
