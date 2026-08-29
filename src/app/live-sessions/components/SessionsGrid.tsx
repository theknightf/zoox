'use client';
import React from 'react';
import type { LiveSession } from '@/types';
import RoomSessionCard from './RoomSessionCard';

interface SessionsGridProps {
  sessions: LiveSession[];
  onAddProduct: (session: LiveSession) => void;
  onEndSession: (session: LiveSession) => void;
}

const STATIONS = [
  { id: 'st-1', name: 'Room VIP-1', type: 'VIP', console: 'PS5 PRO', rate: 150 },
  { id: 'st-2', name: 'Room VIP-2', type: 'VIP', console: 'PS5 PRO', rate: 150 },
  { id: 'st-3', name: 'Room 3', type: 'Standard', console: 'PS5 Slim', rate: 80 },
  { id: 'st-4', name: 'Room 4', type: 'Standard', console: 'PS5 Slim', rate: 80 },
  { id: 'st-5', name: 'Room 5', type: 'Standard', console: 'PS5 Slim', rate: 80 },
  { id: 'st-6', name: 'Room 6', type: 'Premium', console: 'PS5 PRO', rate: 100 },
  { id: 'st-7', name: 'Room 7', type: 'Premium', console: 'PS5 PRO', rate: 100 },
  { id: 'st-8', name: 'Room 8', type: 'Premium', console: 'PS5 PRO', rate: 100 },
  { id: 'st-9', name: 'Room 9', type: 'Standard', console: 'PS5 Standard', rate: 80 },
  { id: 'st-10', name: 'Room 10', type: 'Standard', console: 'PS5 Standard', rate: 80 },
  { id: 'st-11', name: 'Room 11', type: 'Standard', console: 'PS4 Pro', rate: 60 },
  { id: 'st-12', name: 'Room 12', type: 'Standard', console: 'PS4 Pro', rate: 60 },
] as const;

export default function SessionsGrid({ sessions, onAddProduct, onEndSession }: SessionsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-hidden">
      {STATIONS.map((station) => {
        // Find if there is an active session for this station name
        const activeSession = sessions.find((s) => s.room === station.name);

        return (
          <RoomSessionCard
            key={station.id}
            stationName={station.name}
            stationType={station.type}
            consoleTier={station.console}
            baseRate={station.rate}
            session={activeSession}
            onAddDrinks={onAddProduct}
            onEndSession={onEndSession}
          />
        );
      })}
    </div>
  );
}
