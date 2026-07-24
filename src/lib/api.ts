// Safe API fetch helper to prevent raw JSON parse errors (like HTML 404/500 responses)

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
  isJson: boolean;
  error?: string;
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return {
        ok: res.ok,
        status: res.status,
        data,
        isJson: true,
        error: !res.ok ? (data.error || data.message || "Erro no servidor") : undefined,
      };
    }

    // Response is not JSON (e.g. HTML 404/500 page from host/proxy)
    const text = await res.text();
    console.warn(`[API] Response from ${url} is non-JSON (${res.status}):`, text.slice(0, 120));
    
    return {
      ok: false,
      status: res.status,
      data: {} as T,
      isJson: false,
      error: "O servidor de API não respondeu em formato Válido. Alternando para modo offline.",
    };
  } catch (err: any) {
    console.warn(`[API] Network or fetch error for ${url}:`, err);
    return {
      ok: false,
      status: 0,
      data: {} as T,
      isJson: false,
      error: "Falha de conexão com o servidor.",
    };
  }
}
