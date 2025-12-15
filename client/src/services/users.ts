import { useState } from "react";
import { useApiClient } from "./api";
import callApi from "../lib/apiHelper";

export const useUserApi = () => {
    const api = useApiClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getUserProfile = async () => {
        return callApi(() => api.get('user/profile/'), setLoading, setError);
    };

    const getUserDetails = async () => {
        return callApi(() => api.get(`user/`), setLoading, setError);
    };

    const updateUserProfile = async (data: any) => {
        return callApi(() => api.put('user/profile/', data), setLoading, setError);
    };

    return { getUserProfile, getUserDetails, updateUserProfile, loading, error };
}
