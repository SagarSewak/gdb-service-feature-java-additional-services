import React from 'react';
import { CreditCard as CardIcon, Wifi } from 'lucide-react';

const CreditCardWidget = ({ data }) => {
  if (!data) return null;

  // Determine card style based on type
  const getCardStyle = (type) => {
    switch (type) {
      case 'Platinum':
        return 'from-gray-900 to-gray-700 text-white';
      case 'Gold':
        return 'from-yellow-500 to-yellow-300 text-yellow-900';
      case 'Silver':
      default:
        return 'from-gray-300 to-gray-100 text-gray-800';
    }
  };

  const cardStyle = getCardStyle(data.cardType);

  return (
    <div className={`relative w-full max-w-sm rounded-2xl p-6 shadow-xl bg-gradient-to-br ${cardStyle} overflow-hidden`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white opacity-10"></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-sm font-semibold opacity-80 uppercase tracking-wider">{data.cardType}</span>
            <span className="text-xs opacity-75 mt-1">Global Digital Bank</span>
          </div>
          <Wifi className="w-6 h-6 transform rotate-90 opacity-80" />
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-8 bg-yellow-200 rounded-md opacity-80"></div>
          <div className="tracking-[0.2em] font-mono text-lg lg:text-xl font-medium">
            {data.cardNumber}
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase opacity-75 tracking-wider">Card Holder</span>
            <span className="font-medium tracking-wide">CARDHOLDER NAME</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase opacity-75 tracking-wider">Status</span>
            <span className="font-medium tracking-wide">{data.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardWidget;
