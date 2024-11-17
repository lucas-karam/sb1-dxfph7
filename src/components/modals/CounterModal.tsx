import React from 'react';

interface CounterModalProps {
  onSelect: (counter: number) => void;
  onClose: () => void;
  totalCounters: number;
}

export function CounterModal({ onSelect, onClose, totalCounters }: CounterModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Selecione o Guichê</h3>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: totalCounters }, (_, i) => i + 1).map((counter) => (
            <button
              key={counter}
              onClick={() => onSelect(counter)}
              className="btn btn-secondary hover:bg-indigo-50 text-lg py-6"
            >
              Guichê {counter}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="btn btn-secondary w-full mt-4"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}