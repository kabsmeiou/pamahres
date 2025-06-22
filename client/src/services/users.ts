import { useState } from "react";
import { useApiClient } from "./api";
import callApi from "../lib/apiHelper";

export const useUserApi = () => {
    const api = useApiClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getUserProfile = async () => {
        return callApi(() => api.get('api-user/profile/'), setLoading, setError);
    };

    const getUserDetails = async () => {
        return callApi(() => api.get(`api-user/user/`), setLoading, setError);
    };

    const updateUserProfile = async (data: any) => {
        return callApi(() => api.put('api-user/profile/', data), setLoading, setError);
    };

    return { getUserProfile, getUserDetails, updateUserProfile, loading, error };
}
