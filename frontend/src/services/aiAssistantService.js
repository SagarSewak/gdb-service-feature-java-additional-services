import { aiAssistantApi } from './apiConfig';

export const aiAssistantService = {
  chat: (message, currentRoute = '', role = '') =>
    aiAssistantApi
      .post('/api/v1/assistant/chat', { message, current_route: currentRoute, role })
      .then(r => r.data),
};

export default aiAssistantService;
