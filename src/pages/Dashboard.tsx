import React, { useEffect, useState } from 'react';
import { useQueueStore } from '../store/queueStore';
import { Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Dashboard() {
  const { sectors, tickets } = useQueueStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getSectorStats = (sectorId: string) => {
    const sectorTickets = tickets.filter(t => t.sectorId === sectorId);
    const waiting = sectorTickets.filter(t => t.status === 'waiting');
    const serving = sectorTickets.filter(t => t.status === 'serving');
    
    return {
      waiting: waiting.length,
      serving: serving.length,
      completed: sectorTickets.filter(t => t.status === 'completed').length,
      forwarded: sectorTickets.filter(t => t.status === 'forwarded').length,
      avgWaitTime: waiting.length > 0
        ? waiting.reduce((acc, t) => 
            acc + (currentTime.getTime() - new Date(t.createdAt).getTime()), 0
          ) / waiting.length / 1000 / 60
        : 0
    };
  };

  if (sectors.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bem-vindo ao Sistema de Filas</h2>
        <p className="text-gray-600 mb-8">Para começar, adicione setores na página de configurações.</p>
        <a href="/settings" className="btn btn-primary">
          Ir para Configurações
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="text-sm text-gray-500">
          Atualizado: {currentTime.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectors.map(sector => {
          const stats = getSectorStats(sector.id);
          
          return (
            <div
              key={sector.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              style={{ borderLeftColor: sector.color, borderLeftWidth: '4px' }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {sector.name}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Em espera</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{stats.waiting}</span>
                    {stats.avgWaitTime > 0 && (
                      <div className="text-xs text-gray-500">
                        ~{Math.round(stats.avgWaitTime)}min de espera
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Em atendimento</span>
                  </div>
                  <span className="font-semibold">{stats.serving}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Finalizados</span>
                  </div>
                  <span className="font-semibold">{stats.completed}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Encaminhados</span>
                  </div>
                  <span className="font-semibold">{stats.forwarded}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}