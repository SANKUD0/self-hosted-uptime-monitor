import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.MONOLITH_API_URL! || 'http://localhost:3004';
/**
 * A custom React hook that establishes a WebSocket connection to the specified socket URL and listens for events. 
 * It takes a record of event names and their corresponding handler functions, 
 * which will be called with the payload received from the socket for that event.
 */
export function useRealtimeSocket(
    handlers: Record<string, (payload: unknown) => void>
) {
    const socketRef = useRef<Socket | null>(null);

    // Establish the WebSocket connection and set up event listeners when the component mounts
    useEffect(() => {
        const socket = io(`${SOCKET_URL}/realtime`, {
            transports: ['websocket'],
        });

        // Store the socket instance in the ref so it can be accessed later if needed
        socketRef.current = socket;

        // Register each event handler provided in the handlers object
        Object.entries(handlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        })

        // Clean up the socket connection and event listeners when the component unmounts
        return () => {
            socket.disconnect();
        }

    }, []);

    // Return the socket reference so that the component using this hook can access it if needed
    return socketRef;
}