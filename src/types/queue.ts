export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Sector {
  id: string;
  name: string;
  prefix: string;
  color: string;
  isVisible: boolean;
  tags?: string[];
  allowedForwardTo?: string[];
  isReception?: boolean; // Indica se é o setor de recepção
  counters?: number; // Número de guichês disponíveis
}

export interface Ticket {
  id: string;
  number: string;
  sectorId: string;
  status: 'waiting' | 'serving' | 'forwarded' | 'completed';
  counter?: number; // Número do guichê
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  history: TicketHistory[];
  notes?: Note[];
  tags?: string[];
}

export interface Note {
  id: string;
  content: string;
  timestamp: Date;
  userId: string;
}

export interface TicketHistory {
  sectorId: string;
  status: Ticket['status'];
  counter?: number; // Número do guichê
  timestamp: Date;
  note?: string;
  userId?: string;
}