// Reusable API call helper
async function callApi<T>(
  apiCall: () => Promise<{ data: T }>,
  setLoading: (v: boolean) => void,
  setError: (v: string | null) => void
): Promise<T> {
  setLoading(true);
  setError(null);
  try {
    const response = await apiCall();
    return response.data;
  } catch (err: any) {
    setError(err.message || "Something went wrong");
    throw err;
  } finally {
    setLoading(false);
  }
}

export default callApi;