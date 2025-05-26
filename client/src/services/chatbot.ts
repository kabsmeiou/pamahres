import { useState } from "react";
import { useApiClient } from "./api";

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
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`api-courses/chat/${courseId}/`, message);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { sendMessage, loading, error };
}