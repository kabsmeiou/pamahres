import React from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

export default function SimpleTest() {
  const { getToken } = useAuth();
  const [status, setStatus] = React.useState("");

  const testApi = async () => {
    setStatus("Testing...");
    try {
      // Get token from Clerk
      const token = await getToken();
      
      // Create axios instance with the token
      const api = axios.create({
        baseURL: "http://127.0.0.1:8000/",
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Make the API call
      const response = await api.post("api-user/sync-user/");
      
      // Log and update status
      console.log("API call successful:", response.data);
      setStatus("Success! Check console for details.");
    } catch (error: any) {
      console.error("API call failed:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4">
      <button 
        onClick={testApi}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test API
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}