'use client';
import { useEffect, useRef } from 'react';

export interface ReservationAlertPayload {
  id: string;
  customerName: string;
  customerPhone: string;
  scheduledTime: string;
  room?: string;
  roomType: 'Standard' | 'Premium' | 'VIP';
  minutesAway: number;
}

/**
 * useReservationSocket
 * Connects to the Zoox Hub WebSocket server (port 3099).
 * Calls onAlert() when an upcoming_reservation_alert event fires.
 * Gracefully no-ops when the server is offline (client-side cron fallback in AppContext takes over).
 */
export function useReservationSocket(onAlert: (payload: ReservationAlertPayload) => void) {
  const onAlertRef = useRef(onAlert);
  onAlertRef.current = onAlert;

  useEffect(() => {
    let socket: any = null;

    const connect = async () => {
      try {
        const { io } = await import('socket.io-client' as any);
        socket = io('http://localhost:3099', {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 4000,
          timeout: 5000,
        });

        socket.on('connect', () => {
          console.info('[ZooxWS] Connected to reservation alert server');
        });

        socket.on('upcoming_reservation_alert', (payload: ReservationAlertPayload) => {
          onAlertRef.current(payload);
        });

        socket.on('connect_error', () => {
          // Server offline — AppContext client-side cron is the fallback
        });
      } catch {
        // socket.io-client not available in this environment — silent fallback
      }
    };

    connect();
    return () => {
      if (socket) {
        try {
          socket.disconnect();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);
}
