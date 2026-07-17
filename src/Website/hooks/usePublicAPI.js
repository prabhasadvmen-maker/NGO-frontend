import { useState, useEffect } from 'react';
import API_BASE_URL from '../../shared/apiConfig';

export const usePublicAPI = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          signal: controller.signal
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data !== undefined ? json.data : json);
        } else {
          setError(json.message || 'Failed to fetch data');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Network error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [endpoint]);

  return { data, loading, error };
};

export default usePublicAPI;
