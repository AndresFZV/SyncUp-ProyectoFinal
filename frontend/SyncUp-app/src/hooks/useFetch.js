/**
 * USEFETCH.JS - Custom hook para peticiones HTTP
 */

import { useState, useEffect, useCallback } from 'react';

export const useFetch = (serviceFunction, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await serviceFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Error en la petición');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [serviceFunction]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    reset,
  };
};

export default useFetch;