export type Interceptor = (
  config: RequestInit
) => RequestInit | Promise<RequestInit>;

const interceptors: Interceptor[] = [];

/**
 * @example
 * addInterceptor(async (config) => {
 *   return {
 *     ...config,
 *     headers: {
 *       ...config.headers,
 *       'X-Request-ID': generateRequestId(),
 *     },
 *   }
 * })
 */
export function addInterceptor(fn: Interceptor): void {
  interceptors.push(fn);
}

export async function applyInterceptors(
  config: RequestInit
): Promise<RequestInit> {
  let finalConfig = config;

  for (const interceptor of interceptors) {
    finalConfig = await interceptor(finalConfig);
  }

  return finalConfig;
}
