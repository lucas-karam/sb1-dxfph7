export type UserRole = 'admin' | 'attendant' | 'receptionist';

export interface UserSession {
  loginTime: Date;
  logoutTime?: Date;
}

export interface UserPermissions {
  canManageUsers: boolean;
  canManageSectors: boolean;
  canViewReports: boolean;
  canIssueTickets: boolean;
  canServeTickets: boolean;
  canForwardTickets: boolean;
  canViewDisplayPanel: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sectorId?: string;
  active: boolean;
  permissions: UserPermissions;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  sessions: UserSession[];
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  users: User[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'sessions'>) => void;
  updateUser: (id: string, data: Partial<Omit<User, 'id'>>) => void;
  deleteUser: (id: string) => void;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
}