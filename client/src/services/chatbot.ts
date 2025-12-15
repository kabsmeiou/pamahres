import { useState } from "react";
import { useApiClient } from "./api";
import callApi from "../lib/apiHelper";

interface Message {
    previous_messages: {
        role: string;
        content: string;
    }[];
    new_message: string;
}

export const useChatbot = () => {
  const api = useApiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: Message, courseId: number) => {
    return callApi(() => api.post(`courses/chat/${courseId}/`, message), setLoading, setError);
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