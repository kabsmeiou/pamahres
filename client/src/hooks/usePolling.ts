import { useEffect } from "react";

const usePolling = (callback: () => Promise<boolean>, interval: number) => {
  useEffect(() => {
    const poll = async () => {
      const shouldStop = await callback();
      if (!shouldStop) {
        const timer = setTimeout(poll, interval);
        return () => clearTimeout(timer);
      }
    };
    poll();
  }, [callback, interval]);
};

export default usePolling;