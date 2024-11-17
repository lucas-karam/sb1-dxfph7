import React, { useState } from 'react';
import { useQueueStore } from '../store/queueStore';
import { useAuthStore } from '../store/authStore';
import { Clock, ArrowRight, Forward, CheckCircle, Tag, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NoteModal } from '../components/modals/NoteModal';
import { TagModal } from '../components/modals/TagModal';
import { CounterModal } from '../components/modals/CounterModal';
import { Sector } from '../types/queue';

export function ServiceDesk() {
  const { sectors, tickets, updateTicketStatus, updateTicketTags, addTicketNote } = useQueueStore();
  const { user } = useAuthStore();
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [selectedTicketForCounter, setSelectedTicketForCounter] = useState<string | null>(null);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSector = !selectedSector || ticket.sectorId === selectedSector;
    return matchesSector && (ticket.status === 'waiting' || ticket.status === 'serving');
  });

  const handleCallNext = (ticketId: string, sector: Sector) => {
    if (!user) return;
    
    if (sector.isReception) {
      setSelectedTicketForCounter(ticketId);
      setCounterModalOpen(true);
    } else {
      updateTicketStatus(ticketId, 'serving', user.id);
    }
  };

  const handleSelectCounter = (counter: number) => {
    if (!user || !selectedTicketForCounter) return;
    
    updateTicketStatus(selectedTicketForCounter, 'serving', user.id, undefined, undefined, counter);
    setCounterModalOpen(false);
    setSelectedTicketForCounter(null);
  };

  const handleComplete = (ticketId: string) => {
    if (!user) return;
    updateTicketStatus(ticketId, 'completed', user.id);
  };

  const handleForward = (ticketId: string, targetSectorId: string) => {
    if (!user) return;
    
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || targetSectorId === ticket.sectorId) return;

    // Atualiza o status para 'waiting' no novo setor
    updateTicketStatus(ticketId, 'waiting', user.id, targetSectorId, 'Encaminhado para outro setor');
    setForwardModalOpen(false);
    setSelectedTicket(null);
  };

  const handleAddNote = (note: string) => {
    if (selectedTicket && user) {
      addTicketNote(selectedTicket, note, user.id);
      setNoteModalOpen(false);
      setSelectedTicket(null);
    }
  };

  const handleUpdateTags = (tags: string[]) => {
    if (selectedTicket) {
      updateTicketTags(selectedTicket, tags);
      setTagModalOpen(false);
      setSelectedTicket(null);
    }
  };

  if (sectors.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuração Necessária</h2>
        <p className="text-gray-600 mb-8">Para iniciar o atendimento, primeiro adicione setores na página de configurações.</p>
        <a href="/settings" className="btn btn-primary">
          Ir para Configurações
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Atendimento</h2>
        <select
          value={selectedSector || ''}
          onChange={(e) => setSelectedSector(e.target.value || null)}
          className="input max-w-xs"
        >
          <option value="">Todos os setores</option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sectors
          .filter((s) => !selectedSector || s.id === selectedSector)
          .map((sector) => {
            const sectorTickets = filteredTickets.filter(t => t.sectorId === sector.id);

            return (
              <div
                key={sector.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                style={{ borderLeftColor: sector.color, borderLeftWidth: '4px' }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {sector.name}
                  {sector.isReception && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({sector.counters} guichês)
                    </span>
                  )}
                </h3>

                {sectorTickets.length > 0 ? (
                  <div className="space-y-4">
                    {sectorTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-indigo-600" />
                          <div>
                            <span className="font-medium">{ticket.number}</span>
                            {ticket.counter && (
                              <span className="ml-2 text-sm text-gray-600">
                                (Guichê {ticket.counter})
                              </span>
                            )}
                            <div className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(ticket.createdAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </div>
                            {ticket.tags && ticket.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {ticket.tags.map(tag => (
                                  <span
                                    key={tag}
                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {ticket.status === 'waiting' ? (
                            <button
                              onClick={() => handleCallNext(ticket.id, sector)}
                              className="btn btn-primary flex items-center gap-2"
                            >
                              <span>Chamar</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedTicket(ticket.id);
                                  setTagModalOpen(true);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                title="Adicionar Tag"
                              >
                                <Tag className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTicket(ticket.id);
                                  setNoteModalOpen(true);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                title="Adicionar Observação"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTicket(ticket.id);
                                  setForwardModalOpen(true);
                                }}
                                className="btn btn-secondary flex items-center gap-2"
                              >
                                <Forward className="w-4 h-4" />
                                <span>Encaminhar</span>
                              </button>
                              <button
                                onClick={() => handleComplete(ticket.id)}
                                className="btn btn-primary flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Finalizar</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Não há senhas em espera
                  </p>
                )}
              </div>
            );
          })}
      </div>

      {/* Forward Modal */}
      {forwardModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Encaminhar para:</h3>
            <div className="space-y-2">
              {sectors
                .filter(sector => sector.id !== tickets.find(t => t.id === selectedTicket)?.sectorId)
                .map((sector) => (
                  <button
                    key={sector.id}
                    onClick={() => handleForward(selectedTicket, sector.id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {sector.name}
                  </button>
                ))}
            </div>
            <button
              onClick={() => {
                setForwardModalOpen(false);
                setSelectedTicket(null);
              }}
              className="btn btn-secondary w-full mt-4"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {noteModalOpen && selectedTicket && (
        <NoteModal
          ticketId={selectedTicket}
          notes={tickets.find(t => t.id === selectedTicket)?.notes || []}
          onClose={() => {
            setNoteModalOpen(false);
            setSelectedTicket(null);
          }}
          onSave={handleAddNote}
        />
      )}

      {/* Tag Modal */}
      {tagModalOpen && selectedTicket && (
        <TagModal
          selectedTags={tickets.find(t => t.id === selectedTicket)?.tags || []}
          onClose={() => {
            setTagModalOpen(false);
            setSelectedTicket(null);
          }}
          onSave={handleUpdateTags}
        />
      )}

      {/* Counter Modal */}
      {counterModalOpen && selectedTicketForCounter && (
        <CounterModal
          onSelect={handleSelectCounter}
          onClose={() => {
            setCounterModalOpen(false);
            setSelectedTicketForCounter(null);
          }}
          totalCounters={sectors.find(s => 
            s.id === tickets.find(t => t.id === selectedTicketForCounter)?.sectorId
          )?.counters || 2}
        />
      )}
    </div>
  );
}