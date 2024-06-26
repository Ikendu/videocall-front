/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};
// "localhost:8000";
function SocketProvider({ children }) {
  const socket = useMemo(
    () => io("https://videocall-api-1xxh.onrender.com"),
    []
  );

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
export default SocketProvider;
