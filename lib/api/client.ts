type ApiClientOptions = RequestInit & {
  retryOnUnauthorized?: boolean;
};

async function refreshSession(): Promise<boolean> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  return response.ok;
}

export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { retryOnUnauthorized = true, ...init } = options;

  const hasBody = "body" in init && init.body !== undefined;
  const mergedHeaders: Record<string, string> = {
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
  };
  if (hasBody) {
    mergedHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(`/api/proxy${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...mergedHeaders,
      ...init.headers,
    },
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiClient<T>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = typeof error.message === "string"
      ? error.message
      : Array.isArray(error.message)
        ? error.message.join("; ")
        : JSON.stringify(error);
    throw new Error(
      detail.length > 0 && detail !== "{}"
        ? detail
        : `Request failed with status ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
