// Mock data and service for Credit Card Management

// Initial default card
let mockCards = [
  {
    id: 'CARD_1001',
    cardNumber: '**** **** **** 4589',
    cardType: 'Platinum',
    creditLimit: 500000,
    availableCredit: 125000,
    outstandingAmount: 375000,
    minimumDue: 18750,
    nextDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Active',
  }
];

// Generate some mock transactions
const generateMockTransactions = () => {
  const types = ['Purchase', 'Payment', 'Refund'];
  const merchants = ['Amazon', 'Flipkart', 'Swiggy', 'Zomato', 'Uber', 'Bill Payment', 'Refund - Myntra'];
  const statuses = ['Completed', 'Pending'];
  
  const transactions = [];
  let currentDate = new Date();
  
  for (let i = 0; i < 45; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const amount = Math.floor(Math.random() * 10000) + 100;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    currentDate = new Date(currentDate.getTime() - Math.floor(Math.random() * 5 + 1) * 24 * 60 * 60 * 1000);
    
    transactions.push({
      id: `TXN${10000 + i}`,
      cardId: 'CARD_1001', // Link to default card
      date: currentDate.toISOString(),
      merchant: type === 'Payment' ? 'Credit Card Bill Payment' : merchant,
      amount: amount,
      type: type,
      status: status
    });
  }
  return transactions;
};

let mockTransactions = generateMockTransactions();

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const creditCardService = {
  // Get all cards for the user
  getAllCards: async () => {
    await delay(600);
    return mockCards;
  },

  // Get specific card or default to first active
  getDashboardData: async (cardId = null) => {
    await delay(800);
    if (mockCards.length === 0) return null;
    if (cardId) {
      return mockCards.find(c => c.id === cardId) || mockCards[0];
    }
    return mockCards[0];
  },
  
  applyForCard: async (applicationData) => {
    await delay(1500);
    if (!applicationData.employmentType || !applicationData.salary || !applicationData.cardType) {
      throw new Error("Missing required fields");
    }

    // Generate new mock card based on application
    const limits = {
      'Silver': 100000,
      'Gold': 250000,
      'Platinum': 500000
    };

    const newLimit = limits[applicationData.cardType] || 100000;
    const newCard = {
      id: `CARD_${Math.floor(Math.random() * 10000)}`,
      cardNumber: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
      cardType: applicationData.cardType,
      creditLimit: newLimit,
      availableCredit: newLimit,
      outstandingAmount: 0, // Fresh card has 0 outstanding!
      minimumDue: 0,
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Active',
    };

    mockCards.push(newCard);

    return { 
      success: true, 
      message: "Application submitted successfully", 
      applicationId: "APP" + Math.floor(Math.random() * 100000) 
    };
  },

  getTransactions: async (filters, cardId = null) => {
    await delay(800);
    // Default to CARD_1001 if not specified to keep existing logic working
    const targetCardId = cardId || mockCards[0]?.id;
    let filtered = mockTransactions.filter(t => t.cardId === targetCardId);
    
    if (filters) {
      if (filters.type && filters.type !== 'All') {
        filtered = filtered.filter(t => t.type === filters.type);
      }
      if (filters.fromDate) {
        filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.fromDate));
      }
      if (filters.toDate) {
        const toDateEnd = new Date(filters.toDate);
        toDateEnd.setDate(toDateEnd.getDate() + 1);
        filtered = filtered.filter(t => new Date(t.date) < toDateEnd);
      }
    }
    return filtered;
  },

  payBill: async (paymentData, cardId = null) => {
    await delay(1200);
    
    const targetCardId = cardId || mockCards[0]?.id;
    const cardIndex = mockCards.findIndex(c => c.id === targetCardId);
    
    if (cardIndex === -1) throw new Error("Card not found");
    const card = mockCards[cardIndex];

    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error("Invalid payment amount");
    }
    if (!paymentData.debitAccount) {
      throw new Error("Debit account is required");
    }
    if (paymentData.amount > card.outstandingAmount) {
      throw new Error("Payment cannot exceed outstanding amount");
    }

    card.outstandingAmount -= paymentData.amount;
    card.availableCredit += paymentData.amount;
    if (card.outstandingAmount === 0) {
      card.minimumDue = 0;
    }
    
    mockTransactions.unshift({
      id: `TXN${Math.floor(Math.random() * 100000)}`,
      cardId: targetCardId,
      date: new Date().toISOString(),
      merchant: 'Credit Card Bill Payment',
      amount: paymentData.amount,
      type: 'Payment',
      status: 'Completed'
    });

    return { success: true, transactionId: `PAY${Math.floor(Math.random() * 100000)}` };
  }
};
