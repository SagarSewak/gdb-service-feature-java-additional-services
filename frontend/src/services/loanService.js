import { loanApi } from './apiConfig';

export const loanService = {
  applyForLoan: (data) => loanApi.post('/api/v1/loans/apply', data).then(r => r.data),
  getMyLoans: () => loanApi.get('/api/v1/loans/my').then(r => r.data),
  getAllLoans: () => loanApi.get('/api/v1/loans').then(r => r.data),
  getLoan: (id) => loanApi.get(`/api/v1/loans/${id}`).then(r => r.data),
  getLoansByUser: (loginId) => loanApi.get(`/api/v1/loans/user/${loginId}`).then(r => r.data),
  approveLoan: (id, data) => loanApi.put(`/api/v1/loans/${id}/approve`, data).then(r => r.data),
  rejectLoan: (id, data) => loanApi.put(`/api/v1/loans/${id}/reject`, data).then(r => r.data),
  makeRepayment: (id, amount) => loanApi.post(`/api/v1/loans/${id}/repay`, { amount }).then(r => r.data),
  getRepayments: (id) => loanApi.get(`/api/v1/loans/${id}/repayments`).then(r => r.data),
};

export default loanService;
