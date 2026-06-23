import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, FileText } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactionId, amount, account } = location.state || {};

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center p-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful</h1>
        <p className="text-gray-500 mb-8">Your credit card bill payment has been processed successfully.</p>
        
        {transactionId && (
          <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto text-left mb-8 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-sm text-gray-500">Transaction ID</span>
              <span className="font-mono text-sm font-medium text-gray-900">{transactionId}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-sm text-gray-500">Paid Amount</span>
              <span className="text-sm font-bold text-gray-900">₹{parseFloat(amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-sm text-gray-500">Paid From</span>
              <span className="text-sm font-medium text-gray-900">Account ending in {account}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/credit-cards/transactions')} 
            className="btn-outline flex items-center justify-center gap-2 px-6"
          >
            <FileText className="w-4 h-4" />
            View Transactions
          </button>
          <button 
            onClick={() => navigate('/credit-cards')} 
            className="btn-primary flex items-center justify-center gap-2 px-6"
          >
            Back to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
