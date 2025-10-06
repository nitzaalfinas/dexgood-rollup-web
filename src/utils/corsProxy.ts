// CORS Proxy utility for development
export const CORS_PROXY_ENDPOINTS = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?',
] as const;

export const createProxiedUrl = (originalUrl: string, proxyIndex: number = 0): string => {
  const proxy = CORS_PROXY_ENDPOINTS[proxyIndex];
  
  if (proxy.includes('allorigins')) {
    return `${proxy}${encodeURIComponent(originalUrl)}`;
  }
  
  return `${proxy}${originalUrl}`;
};

// Custom fetch with CORS proxy fallback
export const corsProxyFetch = async (
  url: string, 
  options: RequestInit = {},
  maxRetries: number = 2
): Promise<Response> => {
  // First try direct request (works in production)
  try {
    const response = await fetch(url, options);
    if (response.ok) return response;
  } catch (error) {
    console.log('Direct fetch failed, trying CORS proxy...', error);
  }

  // Try CORS proxies
  for (let i = 0; i < Math.min(maxRetries, CORS_PROXY_ENDPOINTS.length); i++) {
    try {
      const proxiedUrl = createProxiedUrl(url, i);
      console.log(`Trying CORS proxy ${i + 1}:`, proxiedUrl);
      
      const response = await fetch(proxiedUrl, {
        ...options,
        headers: {
          ...options.headers,
          'Origin': window.location.origin,
        },
      });
      
      if (response.ok) {
        console.log(`CORS proxy ${i + 1} succeeded`);
        return response;
      }
    } catch (error) {
      console.log(`CORS proxy ${i + 1} failed:`, error);
    }
  }

  throw new Error('All CORS proxy attempts failed');
};

// RPC call with CORS proxy support
export const rpcCallWithProxy = async (
  rpcUrl: string,
  method: string,
  params: any[] = [],
  id: number = 1
): Promise<any> => {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    method,
    params,
    id,
  });

  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  };

  const response = await corsProxyFetch(rpcUrl, options);
  const result = await response.json();
  
  // Handle allorigins.win response format
  if (result.contents) {
    return JSON.parse(result.contents);
  }
  
  return result;
};