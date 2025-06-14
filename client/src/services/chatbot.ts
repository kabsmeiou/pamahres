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
    return callApi(() => api.post(`api-courses/chat/${courseId}/`, message), setLoading, setError);
  };

  const getHistory = async (courseId: number) => {
    return callApi(() => api.get(`api-courses/chat/${courseId}/history/`), setLoading, setError);
  }

  return { sendMessage, getHistory, loading, error };
}