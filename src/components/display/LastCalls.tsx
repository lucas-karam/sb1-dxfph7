import React from 'react';
import { Ticket } from '../../types/queue';

interface LastCallsProps {
  tickets: Ticket[];
  sectors: Array<{ id: string; name: string; }>;
}

export function LastCalls({ tickets, sectors }: LastCallsProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Últimas Chamadas</h2>
      <div className="bg-gray-800 rounded-lg p-6">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-left">
              <th className="pb-4">Senha</th>
              <th className="pb-4">Setor</th>
              <th className="pb-4">Horário</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {tickets.map(ticket => {
              const sector = sectors.find(s => s.id === ticket.sectorId);
              return (
                <tr key={ticket.id} className="animate-fade-in">
                  <td className="py-2">{ticket.number}</td>
                  <td className="py-2">{sector?.name}</td>
                  <td className="py-2">
                    {new Date(ticket.completedAt!).toLocaleTimeString()}
                  </td>
                </tr>
              );
            })}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  Nenhuma chamada realizada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}