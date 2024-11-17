import React, { useState, useEffect } from 'react';
import { useQueueStore } from '../store/queueStore';
import { TicketCall } from '../components/display/TicketCall';
import { CurrentTickets } from '../components/display/CurrentTickets';
import { LastCalls } from '../components/display/LastCalls';
import { Ticket } from '../types/queue';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DisplayPanel() {
  const { tickets, sectors } = useQueueStore();
  const [callingTicket, setCallingTicket] = useState<Ticket | null>(null);
  const [lastCalledIds, setLastCalledIds] = useState<Set<string>>(new Set());

  const servingTickets = tickets
    .filter(t => t.status === 'serving')
    .sort((a, b) => new Date(b.startedAt!).getTime() - new Date(a.startedAt!).getTime())
    .slice(0, 4);

  const completedTickets = tickets
    .filter(t => t.status === 'completed')
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 10);

  useEffect(() => {
    const newServingTickets = servingTickets.filter(
      ticket => !lastCalledIds.has(ticket.id)
    );

    if (newServingTickets.length > 0 && !callingTicket) {
      const ticketToCall = newServingTickets[0];
      setCallingTicket(ticketToCall);
      setLastCalledIds(prev => new Set([...prev, ticketToCall.id]));
    }
  }, [servingTickets, lastCalledIds, callingTicket]);

  const handleCallComplete = () => {
    setCallingTicket(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-lg">Voltar ao Sistema</span>
          </Link>
          <h1 className="text-4xl font-bold text-center">Painel de Chamadas</h1>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CurrentTickets tickets={servingTickets} sectors={sectors} />
          <LastCalls tickets={completedTickets} sectors={sectors} />
        </div>

        {callingTicket && (
          <TicketCall
            ticket={callingTicket}
            sectorName={sectors.find(s => s.id === callingTicket.sectorId)?.name || ''}
            isReception={sectors.find(s => s.id === callingTicket.sectorId)?.isReception}
            onCallComplete={handleCallComplete}
          />
        )}
      </div>
    </div>
  );
}