import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Sector, Ticket, Note } from '../types/queue';

interface QueueStore {
  sectors: Sector[];
  tickets: Ticket[];
  addSector: (sector: Omit<Sector, 'id'>) => void;
  removeSector: (id: string) => void;
  updateSector: (id: string, sector: Partial<Sector>) => void;
  createTicket: (sectorId: string) => Ticket;
  updateTicketStatus: (
    ticketId: string,
    status: Ticket['status'],
    userId: string,
    targetSectorId?: string,
    note?: string,
    counter?: number
  ) => void;
  addTicketNote: (ticketId: string, content: string, userId: string) => void;
  updateTicketTags: (ticketId: string, tags: string[]) => void;
}

const INITIAL_SECTORS: Sector[] = [
  {
    id: 'reception',
    name: 'Recepção',
    prefix: 'REC',
    color: '#6366f1',
    isVisible: true,
    isReception: true,
    counters: 2,
    tags: []
  }
];

function generateTicketNumber(sectorId: string, sectors: Sector[], tickets: Ticket[]): string {
  const sector = sectors.find(s => s.id === sectorId);
  if (!sector) return 'UNKNOWN';

  const sectorTickets = tickets.filter(t => t.sectorId === sectorId);
  const number = (sectorTickets.length + 1).toString().padStart(3, '0');
  return `${sector.prefix}${number}`;
}

export const useQueueStore = create<QueueStore>()(
  persist(
    (set, get) => ({
      sectors: INITIAL_SECTORS,
      tickets: [],
      
      addSector: (sectorData) => set((state) => ({
        sectors: [...state.sectors, { ...sectorData, id: crypto.randomUUID() }]
      })),
      
      removeSector: (id) => set((state) => ({
        sectors: state.sectors.filter((sector) => sector.id !== id)
      })),
      
      updateSector: (id, sectorData) => set((state) => ({
        sectors: state.sectors.map((sector) => 
          sector.id === id ? { ...sector, ...sectorData } : sector
        )
      })),
      
      createTicket: (sectorId) => {
        const state = get();
        const newTicket: Ticket = {
          id: crypto.randomUUID(),
          number: generateTicketNumber(sectorId, state.sectors, state.tickets),
          sectorId,
          status: 'waiting',
          createdAt: new Date(),
          history: [{
            sectorId,
            status: 'waiting',
            timestamp: new Date()
          }],
          notes: [],
          tags: []
        };
        
        set((state) => ({
          tickets: [...state.tickets, newTicket]
        }));
        
        return newTicket;
      },
      
      updateTicketStatus: (ticketId, status, userId, targetSectorId, note, counter) => set((state) => ({
        tickets: state.tickets.map((ticket) => {
          if (ticket.id !== ticketId) return ticket;
          
          const newSectorId = targetSectorId || ticket.sectorId;
          const now = new Date();
          
          const history = [...ticket.history, {
            sectorId: newSectorId,
            status,
            timestamp: now,
            note,
            userId,
            counter
          }];
          
          let updates: Partial<Ticket> = {};
          
          if (status === 'serving' && !ticket.startedAt) {
            updates.startedAt = now;
          } else if (status === 'completed' && !ticket.completedAt) {
            updates.completedAt = now;
          }
          
          return {
            ...ticket,
            ...updates,
            status,
            sectorId: newSectorId,
            counter,
            history
          };
        })
      })),

      addTicketNote: (ticketId, content, userId) => set((state) => ({
        tickets: state.tickets.map((ticket) => {
          if (ticket.id !== ticketId) return ticket;
          const notes = [...(ticket.notes || [])];
          notes.push({
            id: crypto.randomUUID(),
            content,
            timestamp: new Date(),
            userId
          });
          return { ...ticket, notes };
        })
      })),

      updateTicketTags: (ticketId, tags) => set((state) => ({
        tickets: state.tickets.map((ticket) => {
          if (ticket.id !== ticketId) return ticket;
          return { ...ticket, tags };
        })
      })),
    }),
    {
      name: 'queue-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            sectors: INITIAL_SECTORS,
            tickets: [],
          };
        }
        return persistedState;
      }
    }
  )
);