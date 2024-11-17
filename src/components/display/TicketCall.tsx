import React, { useEffect, useRef } from 'react';
import { Ticket } from '../../types/queue';

interface TicketCallProps {
  ticket: Ticket;
  sectorName: string;
  isReception?: boolean;
  onCallComplete?: () => void;
}

export function TicketCall({ ticket, sectorName, isReception, onCallComplete }: TicketCallProps) {
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const text = `Senha ${ticket.number.split('').join(' ')}, ${
        isReception && ticket.counter
          ? `dirija-se ao guichê ${ticket.counter}`
          : `dirija-se ao setor ${sectorName}`
      }`;
      
      synthRef.current = new SpeechSynthesisUtterance(text);
      synthRef.current.lang = 'pt-BR';
      synthRef.current.rate = 0.9;
      synthRef.current.onend = onCallComplete;
      
      const timeoutId = setTimeout(() => {
        window.speechSynthesis.speak(synthRef.current!);
      }, 500);

      return () => {
        clearTimeout(timeoutId);
        if (synthRef.current) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [ticket.number, sectorName, isReception, ticket.counter, onCallComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 animate-bounce-gentle">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          {ticket.number}
        </h2>
        <p className="text-xl text-center text-gray-600">
          {isReception && ticket.counter ? (
            <>
              Dirija-se ao<br />
              <span className="font-semibold">Guichê {ticket.counter}</span>
            </>
          ) : (
            <>
              Dirija-se ao setor<br />
              <span className="font-semibold">{sectorName}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}