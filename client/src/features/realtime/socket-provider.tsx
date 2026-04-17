import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react';
import { io, type Socket } from 'socket.io-client';

export type LiveConnectionState = 'live' | 'reconnecting' | 'polling';

type SocketContextValue = {
  socket: Socket | null;
  connectionState: LiveConnectionState;
};

const socketUrl =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) || 'http://localhost:3001';

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: PropsWithChildren) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<LiveConnectionState>('reconnecting');

  useEffect(() => {
    const nextSocket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity
    });

    const handleConnect = () => {
      setConnectionState('live');
    };

    const handleReconnectAttempt = () => {
      setConnectionState('reconnecting');
    };

    const handleConnectError = () => {
      setConnectionState('polling');
    };

    const handleDisconnect = (reason: string) => {
      setConnectionState(reason === 'io client disconnect' ? 'polling' : 'reconnecting');
    };

    const handleWindowFocus = () => {
      if (!nextSocket.connected) {
        setConnectionState('reconnecting');
        nextSocket.connect();
      }
    };

    setSocket(nextSocket);

    nextSocket.on('connect', handleConnect);
    nextSocket.on('disconnect', handleDisconnect);
    nextSocket.on('connect_error', handleConnectError);
    nextSocket.io.on('reconnect_attempt', handleReconnectAttempt);
    nextSocket.io.on('reconnect_error', handleConnectError);
    nextSocket.io.on('reconnect_failed', handleConnectError);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      nextSocket.off('connect', handleConnect);
      nextSocket.off('disconnect', handleDisconnect);
      nextSocket.off('connect_error', handleConnectError);
      nextSocket.io.off('reconnect_attempt', handleReconnectAttempt);
      nextSocket.io.off('reconnect_error', handleConnectError);
      nextSocket.io.off('reconnect_failed', handleConnectError);
      nextSocket.disconnect();
    };
  }, []);

  const value = useMemo<SocketContextValue>(
    () => ({
      socket,
      connectionState
    }),
    [connectionState, socket]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider.');
  }

  return context;
}
