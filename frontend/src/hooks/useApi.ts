import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { AxiosError } from 'axios';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: AxiosError) => void;
}

export function useApi<T = any>(url: string, options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AxiosError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(
    async (config?: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<T>(url, config);
        setData(response.data);
        options?.onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [url, options]
  );

  const postData = useCallback(
    async (body: any, config?: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post<T>(url, body, config);
        setData(response.data);
        options?.onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [url, options]
  );

  const putData = useCallback(
    async (body: any, config?: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.put<T>(url, body, config);
        setData(response.data);
        options?.onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [url, options]
  );

  const deleteData = useCallback(
    async (config?: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.delete<T>(url, config);
        setData(response.data);
        options?.onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [url, options]
  );

  return {
    data,
    error,
    isLoading,
    fetchData,
    postData,
    putData,
    deleteData,
  };
}
