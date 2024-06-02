import webSocket from "react-use-websocket";
import { API_URL } from "../constants/api";
import { useEffect, useState } from "react";

export const useWebSocket = () => {
  const [socket, setSocket] = useState<any>();

  useEffect(() => {
    const ws = new WebSocket(`${API_URL.replace(/^http/, "ws")}`);
    setSocket(ws);

    return () => {
      //   ws.close();
    };
  }, []);

  return { socket };
};
