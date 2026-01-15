import { useState } from "react";
import { useApiClient } from "./api";
import callApi from "../lib/apiHelper";
import { useAuth } from "@clerk/clerk-react";

interface Message {
    previous_messages: {
        role: string;
        content: string;
    }[];
    new_message: string;
}

export const useChatbot = () => {
  const api = useApiClient();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: Message, courseId: number) => {
    // Use fetch for streaming instead of axios
    const token = await getToken();
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';
    
    return fetch(`${baseURL}courses/chat/${courseId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(message),
    });
  };

  const getHistory = async (courseId: number) => {
    return callApi(() => api.get(`courses/chat/${courseId}/history/`), setLoading, setError);
  }

  const getHistoryMessages = async (courseId: number, chatId: number) => {
    return callApi(() => api.get(`courses/chat/${courseId}/history/${chatId}/`), setLoading, setError);
  };

  const getHistoryToday = async (courseId: number) => {
    return callApi(() => api.get(`courses/chat/${courseId}/history/today/`), setLoading, setError);
  };

  return { sendMessage, getHistory, getHistoryMessages, getHistoryToday, loading, error };
}