import React from 'react';
import { Ticket as TicketType } from '../../types/queue';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CurrentTicketsProps {
  tickets: TicketType[];
  sectors: Array<{ id: string; name: string; color: string; isReception?: boolean; }>;
}

export function CurrentTickets({ tickets, sectors }: CurrentTicketsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Em Atendimento</h2>
      {tickets.map(ticket => {
        const sector = sectors.find(s => s.id === ticket.sectorId);
        const startedAt = ticket.startedAt ? new Date(ticket.startedAt) : null;

        return (
          <div
            key={ticket.id}
            className="bg-gray-800 rounded-lg p-6 border-l-4 animate-fade-in"
            style={{ borderColor: sector?.color }}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-3xl font-bold">{ticket.number}</span>
                <p className="text-gray-400 mt-1">
                  {sector?.name}
                  {ticket.counter && sector?.isReception && (
                    <span className="ml-2">- Guichê {ticket.counter}</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  {startedAt ? (
                    <>
                      Chamado há{' '}
                      {formatDistanceToNow(startedAt, {
                        locale: ptBR,
                        addSuffix: false
                      })}
                    </>
                  ) : (
                    'Aguardando'
                  )}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      {tickets.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          Nenhum atendimento em andamento
        </p>
      )}
    </div>
  );
}