import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { immediate = true, ...fetchOptions } = options;
  
  const execute = useCallback(async (requestOptions = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get(url, { ...fetchOptions, ...requestOptions });
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, fetchOptions]);
  
  useEffect(() => {
    if (immediate && url) {
      execute();
    }
  }, [execute, immediate, url]);
  
  return { data, loading, error, execute };
};

export const useApiMutation = (method = 'post') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const execute = useCallback(async (url, requestData = {}, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      switch (method.toLowerCase()) {
        case 'post':
          response = await apiService.post(url, requestData, options);
          break;
        case 'put':
          response = await apiService.put(url, requestData, options);
          break;
        case 'patch':
          response = await apiService.patch(url, requestData, options);
          break;
        case 'delete':
          response = await apiService.delete(url, options);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [method]);
  
  return { data, loading, error, execute };
};
