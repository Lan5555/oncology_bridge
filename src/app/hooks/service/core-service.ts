import { Net, NetResponse } from "./net-response";


export class CoreService {
  private BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

  private fallback: Net = {
    success: false,
    message: 'An error occurred.',
    data: null
  };

  public setBaseUrl(url: string): void {
    this.BASE_URL = url;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    const userSession = localStorage.getItem("userSession");
    if (!userSession) return null;
    try {
      const parsed = JSON.parse(userSession);
      return parsed?.token || null;
    } catch {
      return null;
    }
  }
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public async send(endpoint: string, payload: Record<string, any>): Promise<NetResponse> {
    try {
      const res = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return new NetResponse({
        success: data.success ?? res.ok,
        message: data.message || '',
        data: data.data ?? null
      });
    } catch (e: any) {
      console.error(e);
    }
    return new NetResponse(this.fallback);
  }

  public async update(endpoint: string, payload: Record<string, any>): Promise<NetResponse> {
    try {
      const res = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return new NetResponse({
        success: data.success ?? res.ok,
        message: data.message || '',
        data: data.data ?? null
      });
    } catch (e: any) {
      console.error(e);
    }
    return new NetResponse(this.fallback);
  }

  public async delete(endpoint: string, payload?: Record<string, any>): Promise<NetResponse> {
    try {
      const res = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: payload ? JSON.stringify(payload) : null
      });
      const data = await res.json();
      return new NetResponse({
        success: data.success ?? res.ok,
        message: data.message || '',
        data: data.data ?? null
      });
    } catch (e: any) {
      console.error(e);
    }
    return new NetResponse(this.fallback);
  }

  public async get(endpoint: string): Promise<NetResponse> {
    try {
      const res = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      const data = await res.json();
      return new NetResponse({
        success: data.success ?? res.ok,
        message: data.message || '',
        data: data.data ?? null
      });
    } catch (e: any) {
      console.error(e);
    }
    return new NetResponse(this.fallback);
  }
}
