import React, { useState, useEffect } from 'react';
import { useQueueStore } from '../store/queueStore';
import { Ticket, Printer, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function IssueTicket() {
  const { sectors, createTicket } = useQueueStore();
  const [lastTicket, setLastTicket] = useState<{
    number: string;
    timestamp: Date;
  } | null>(null);
  const visibleSectors = sectors.filter(sector => sector.isVisible);

  useEffect(() => {
    const handleAfterPrint = () => {
      setTimeout(() => setLastTicket(null), 500);
    };
    
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handleCreateTicket = async (sectorId: string) => {
    const ticket = createTicket(sectorId);
    setLastTicket({
      number: ticket.number,
      timestamp: new Date(ticket.createdAt)
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (visibleSectors.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nenhum setor disponível</h2>
        <p className="text-gray-600 mb-8">Não há setores visíveis para emissão de senhas no momento.</p>
        {sectors.length === 0 && (
          <a href="/settings" className="btn btn-primary">
            Ir para Configurações
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Emitir Senha</h2>
          <p className="text-gray-600 mt-1">Selecione um setor para gerar uma nova senha</p>
        </div>
        {lastTicket && (
          <button
            onClick={() => setLastTicket(null)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Senha
          </button>
        )}
      </div>

      {lastTicket ? (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-center space-y-4 print-content">
              <Ticket className="w-16 h-16 text-indigo-600 mx-auto" />
              
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{lastTicket.number}</h3>
                <p className="text-base text-gray-600 mt-1">
                  {format(lastTicket.timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>

              <div className="text-gray-600">
                Seja bem-vindo à<br />RadiobrasDigital
              </div>

              <div className="text-sm text-gray-500">
                Aguarde a exibição de<br />sua senha no telão
              </div>

              <button
                onClick={handlePrint}
                className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 no-print"
              >
                <Printer className="w-5 h-5" />
                Imprimir Senha
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleSectors.map((sector) => (
            <button
              key={sector.id}
              onClick={() => handleCreateTicket(sector.id)}
              className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-indigo-500 transition-colors group"
              style={{ borderLeftColor: sector.color, borderLeftWidth: '4px' }}
            >
              <Ticket className="w-16 h-16 text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-gray-900">{sector.name}</h3>
            </button>
          ))}
        </div>
      )}

      {/* Print-only styles */}
      <style>{`
        @media screen {
          .print-content {
            display: block !important;
          }
        }

        @media print {
          @page {
            size: 58mm 100mm;
            margin: 0;
          }

          html, body {
            width: 58mm;
            height: 100mm;
            margin: 0;
            padding: 0;
          }

          body * {
            visibility: hidden;
          }

          .print-content, .print-content * {
            visibility: visible !important;
            display: block !important;
          }

          .print-content {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 58mm !important;
            padding: 8mm 4mm !important;
            margin: 0 !important;
          }

          .bg-white {
            box-shadow: none !important;
            border: none !important;
          }

          .no-print {
            display: none !important;
          }

          .w-16 {
            width: 15mm !important;
            height: 15mm !important;
          }

          .text-3xl {
            font-size: 8mm !important;
            line-height: 10mm !important;
          }

          .text-base {
            font-size: 3mm !important;
            line-height: 4mm !important;
          }

          .text-sm {
            font-size: 2.5mm !important;
            line-height: 3.5mm !important;
          }

          .space-y-4 > * + * {
            margin-top: 4mm !important;
          }

          .text-center {
            text-align: center !important;
          }

          .mx-auto {
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }
      `}</style>
    </div>
  );
}