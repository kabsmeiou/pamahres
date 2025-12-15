import axios, { AxiosRequestHeaders } from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";

export const useApiClient = () => {
  // check time of getting token
  const { getToken } = useAuth();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: "/api/",
      timeout: 20000,
    });

    instance.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          } as AxiosRequestHeaders;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return instance;
  }, [getToken]);

  return api;
};
