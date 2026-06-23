import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';

const ApplicationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { applicationId } = location.state || {};

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center p-10">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-primary-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
        <p className="text-gray-500 mb-8">Your credit card application has been received and is under review. You will be notified once it is approved.</p>
        
        {applicationId && (
          <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto text-left mb-8 space-y-4">
            <div className="flex justify-between items-center pb-1">
              <span className="text-sm text-gray-500">Application Reference ID</span>
              <span className="font-mono text-sm font-bold text-gray-900">{applicationId}</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Please keep this reference ID for tracking your application status. Standard processing time is 2-3 business days.
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn-outline flex items-center justify-center gap-2 px-6"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </button>
          <button 
            onClick={() => navigate('/credit-cards')} 
            className="btn-primary flex items-center justify-center gap-2 px-6"
          >
            Credit Cards Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccess;
