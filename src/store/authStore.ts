import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, UserRole } from '../types/auth';

const DEFAULT_PERMISSIONS = {
  admin: {
    canManageUsers: true,
    canManageSectors: true,
    canViewReports: true,
    canIssueTickets: true,
    canServeTickets: true,
    canForwardTickets: true,
    canViewDisplayPanel: true,
  },
  attendant: {
    canManageUsers: false,
    canManageSectors: false,
    canViewReports: false,
    canIssueTickets: false,
    canServeTickets: true,
    canForwardTickets: true,
    canViewDisplayPanel: true,
  },
  receptionist: {
    canManageUsers: false,
    canManageSectors: false,
    canViewReports: false,
    canIssueTickets: true,
    canServeTickets: false,
    canForwardTickets: false,
    canViewDisplayPanel: true,
  },
};

interface Session {
  id: string;
  userId: string;
  loginTime: Date;
  logoutTime?: Date;
}

interface UserWithSessions extends User {
  sessions: Session[];
  password: string;
}

// Initial demo users
const DEMO_USERS: UserWithSessions[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@example.com',
    role: 'admin',
    active: true,
    permissions: DEFAULT_PERMISSIONS.admin,
    createdAt: new Date(),
    updatedAt: new Date(),
    password: 'NovoPass01',
    sessions: [],
  },
  {
    id: '2',
    name: 'Atendente',
    email: 'attendant@example.com',
    role: 'attendant',
    sectorId: '1',
    active: true,
    permissions: DEFAULT_PERMISSIONS.attendant,
    createdAt: new Date(),
    updatedAt: new Date(),
    password: 'NovoPass01',
    sessions: [],
  },
  {
    id: '3',
    name: 'Recepcionista',
    email: 'receptionist@example.com',
    role: 'receptionist',
    active: true,
    permissions: DEFAULT_PERMISSIONS.receptionist,
    createdAt: new Date(),
    updatedAt: new Date(),
    password: 'NovoPass01',
    sessions: [],
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      users: DEMO_USERS,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const users = get().users;
        const user = users.find(u => u.email === email && u.active && u.password === password);
        
        if (!user) {
          throw new Error('Credenciais inválidas ou usuário inativo');
        }

        const sessionId = crypto.randomUUID();
        const loginTime = new Date();

        set(state => ({
          users: state.users.map(u => 
            u.id === user.id 
              ? {
                  ...u,
                  sessions: [...(u.sessions || []), { id: sessionId, userId: u.id, loginTime }],
                  lastLogin: loginTime,
                  updatedAt: loginTime
                }
              : u
          ),
          user: { ...user, password: undefined, sessions: undefined },
          token: sessionId,
          isAuthenticated: true
        }));
      },

      logout: () => {
        const { user, token } = get();
        if (user) {
          const logoutTime = new Date();
          
          set(state => ({
            users: state.users.map(u => 
              u.id === user.id 
                ? {
                    ...u,
                    sessions: (u.sessions || []).map(session => 
                      session.id === token ? { ...session, logoutTime } : session
                    ),
                    updatedAt: logoutTime
                  }
                : u
            ),
            user: null,
            token: null,
            isAuthenticated: false
          }));
        }
      },

      addUser: (userData) => {
        const newUser: UserWithSessions = {
          ...userData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          permissions: DEFAULT_PERMISSIONS[userData.role],
          password: 'NovoPass01', // Default password for new users
          sessions: [],
        };

        set(state => ({
          users: [...state.users, newUser]
        }));
      },

      updateUser: (id, data) => {
        set(state => ({
          users: state.users.map(user => {
            if (user.id !== id) return user;
            
            const permissions = data.role 
              ? DEFAULT_PERMISSIONS[data.role]
              : user.permissions;

            return {
              ...user,
              ...data,
              permissions,
              updatedAt: new Date()
            };
          })
        }));
      },

      deleteUser: (id) => {
        set(state => ({
          users: state.users.filter(user => user.id !== id)
        }));
      },

      changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
        const { users } = get();
        const user = users.find(u => u.id === userId);

        if (!user || user.password !== currentPassword) {
          throw new Error('Senha atual incorreta');
        }

        set(state => ({
          users: state.users.map(u => 
            u.id === userId
              ? { ...u, password: newPassword, updatedAt: new Date() }
              : u
          )
        }));
      },
    }),
    {
      name: 'auth-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            user: null,
            token: null,
            users: DEMO_USERS,
            isAuthenticated: false
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        users: state.users,
        user: state.user ? { ...state.user, password: undefined, sessions: undefined } : null,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);