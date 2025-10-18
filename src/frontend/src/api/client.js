const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = {
  async checkHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  },

  async getConfig() {
    const response = await fetch(`${API_BASE_URL}/config`);
    if (!response.ok) throw new Error('Config fetch failed');
    return response.json();
  },

  async analyzeTariff(tnvedCode) {
    const response = await fetch(`${API_BASE_URL}/analyze/tariff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tnved_code: tnvedCode })
    });
    if (!response.ok) throw new Error('Tariff analysis failed');
    return response.json();
  },

  async analyzeFullRAG(tnvedCode) {
    const response = await fetch(`${API_BASE_URL}/analyze/full`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tnved_code: tnvedCode })
    });
    if (!response.ok) throw new Error('Full RAG analysis failed');
    return response.json();
  }
};
