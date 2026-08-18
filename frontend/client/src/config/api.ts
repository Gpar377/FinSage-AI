export const getApiUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    console.warn("VITE_API_URL not configured, defaulting to localhost:8000");
    return "http://localhost:8000";
  }
  return url.replace(/\/$/, ""); // Remove trailing slash
};

export const apiClient = {
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${getApiUrl()}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  get: async (endpoint: string) => {
    const response = await fetch(`${getApiUrl()}${endpoint}`);
    return response.json();
  },
};
