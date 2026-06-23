import React from 'react';

const UtilizationBar = ({ available, limit }) => {
  const utilizationPercentage = ((limit - available) / limit) * 100;
  const availablePercentage = (available / limit) * 100;

  // Visual Indicators based on available credit percentage
  let barColor = 'bg-red-500'; // Default Red (< 20%)
  if (availablePercentage > 50) {
    barColor = 'bg-green-500';
  } else if (availablePercentage >= 20 && availablePercentage <= 50) {
    barColor = 'bg-orange-500';
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="font-medium text-gray-700">Credit Utilization</span>
        <span className="font-bold text-gray-900">{utilizationPercentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ease-in-out ${barColor}`} 
          style={{ width: `${utilizationPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
        <span>₹0</span>
        <span>Limit: ₹{limit.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

export default UtilizationBar;
