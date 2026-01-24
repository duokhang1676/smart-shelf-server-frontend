import axios from "axios";

const API_URL = import.meta.env.VITE_API_ENDPOINT || "/api";

export interface SepayConfig {
  _id?: string;
  apiKey: string;
  apiSecret: string;
  merchantCode?: string;
  webhookUrl?: string;
  callbackUrl?: string;
  sandbox?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function getSepayConfig(signal?: AbortSignal): Promise<SepayConfig | null> {
  try {
    const { data } = await axios.get<SepayConfig>(`${API_URL}/sepay-config`, { signal });
    return data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

export async function upsertSepayConfig(payload: Partial<SepayConfig>): Promise<SepayConfig> {
  const { data } = await axios.put<SepayConfig>(`${API_URL}/sepay-config`, payload);
  return data;
}
