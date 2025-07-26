const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const fetchWithRetry = async (fetchFunction, retries = MAX_RETRIES) => {
  try {
    return await fetchFunction();
  } catch (error) {
    if (retries > 0 && error.message.includes('network request failed')) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(fetchFunction, retries - 1);
    }
    throw error;
  }
};

export const isNetworkError = (error) => {
  return error.message.includes('network request failed');
};