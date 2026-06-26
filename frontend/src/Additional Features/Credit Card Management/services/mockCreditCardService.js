import { creditCardsApi } from '../../../services/apiConfig';
import { useAuthStore } from '../../../store/authStore';

export const creditCardService = {
  // Get all cards for the user
  getAllCards: async () => {
    try {
      const userId = useAuthStore.getState().user?.user_id;
      if (!userId) throw new Error("User not authenticated");
      const response = await creditCardsApi.get(`/api/v1/credit-cards/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch cards');
    }
  },

  // Get specific card or default to first active
  getDashboardData: async (cardId = null) => {
    try {
      if (cardId) {
        const response = await creditCardsApi.get(`/api/v1/credit-cards/${cardId}`);
        return response.data;
      }
      // If no cardId, get all cards first and return the first one
      const userId = useAuthStore.getState().user?.user_id;
      if (!userId) throw new Error("User not authenticated");
      const response = await creditCardsApi.get(`/api/v1/credit-cards/user/${userId}`);
      if (response.data && response.data.length > 0) {
        return response.data[0];
      }
      return null;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch dashboard data');
    }
  },
  
  applyForCard: async (applicationData) => {
    try {
      const response = await creditCardsApi.post('/api/v1/credit-cards/apply', {
        cardType: applicationData.cardType,
        name: applicationData.name,
        mobileNumber: applicationData.mobileNumber,
        salary: Number(applicationData.salary)
      });
      return { 
        success: true, 
        message: "Application submitted successfully", 
        applicationId: response.data.id
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Application failed');
    }
  },

  createTransaction: async (cardId, transactionData) => {
    try {
      const response = await creditCardsApi.post(`/api/v1/credit-cards/${cardId}/transactions`, {
        merchant: transactionData.merchant,
        amount: Number(transactionData.amount),
        type: transactionData.type || 'Purchase'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Transaction failed');
    }
  },

  getTransactions: async (filters, cardId = null) => {
    try {
      let targetCardId = cardId;
      if (!targetCardId) {
        // Fallback to first card of the user if cardId is not provided
        const userId = useAuthStore.getState().user?.user_id;
        if (!userId) throw new Error("User not authenticated");
        const cardsResponse = await creditCardsApi.get(`/api/v1/credit-cards/user/${userId}`);
        if (cardsResponse.data && cardsResponse.data.length > 0) {
          targetCardId = cardsResponse.data[0].id;
        } else {
          return [];
        }
      }

      // Build parameters
      const params = {};
      if (filters) {
        if (filters.type && filters.type !== 'All') {
          params.type = filters.type;
        }
        if (filters.fromDate) {
          params.fromDate = filters.fromDate;
        }
        if (filters.toDate) {
          params.toDate = filters.toDate;
        }
      }

      const response = await creditCardsApi.get(`/api/v1/credit-cards/${targetCardId}/transactions`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch transactions');
    }
  },

  payBill: async (paymentData, cardId = null) => {
    try {
      let targetCardId = cardId;
      if (!targetCardId) {
        // Fallback to first card
        const userId = useAuthStore.getState().user?.user_id;
        if (!userId) throw new Error("User not authenticated");
        const cardsResponse = await creditCardsApi.get(`/api/v1/credit-cards/user/${userId}`);
        if (cardsResponse.data && cardsResponse.data.length > 0) {
          targetCardId = cardsResponse.data[0].id;
        } else {
          throw new Error("No active credit card found");
        }
      }

      const response = await creditCardsApi.post(`/api/v1/credit-cards/${targetCardId}/pay`, {
        amount: paymentData.amount,
        debitAccount: paymentData.debitAccount
      });

      return { success: true, transactionId: response.data.transactionId };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Payment failed');
    }
  }
};
