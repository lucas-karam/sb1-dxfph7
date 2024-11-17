import React, { useState } from 'react';
import { Note } from '../../types/queue';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Plus } from 'lucide-react';

interface NoteModalProps {
  ticketId: string;
  notes: Note[];
  onClose: () => void;
  onSave: (note: string) => void;
}

export function NoteModal({ ticketId, notes, onClose, onSave }: NoteModalProps) {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      onSave(newNote.trim());
      setNewNote('');
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Observações</h3>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Observação
            </button>
          )}
        </div>

        {isAdding ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Digite sua observação..."
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewNote('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary flex-1">
                Salvar
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-gray-50 rounded-lg p-4 space-y-2"
                  >
                    <p className="text-gray-900">{note.content}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MessageSquare className="w-4 h-4" />
                      <span>
                        {format(new Date(note.timestamp), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma observação registrada
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="btn btn-secondary w-full mt-6"
            >
              Fechar
            </button>
          </>
        )}
      </div>
    </div>
  );
}