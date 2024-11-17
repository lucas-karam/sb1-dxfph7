import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  PieChart, 
  Ticket, 
  LogOut, 
  Monitor, 
  BarChart, 
  Clock, 
  History,
  ChevronLeft,
  ChevronRight,
  Printer
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/issue', icon: Ticket, label: 'Emitir Senha' },
  { path: '/service', icon: Users, label: 'Atendimento' },
  { 
    path: '/reports', 
    icon: PieChart, 
    label: 'Relatórios',
    subItems: [
      { path: '/reports', label: 'Relatórios Básicos', icon: PieChart },
      { path: '/reports/advanced', label: 'Relatórios Avançados', icon: BarChart },
      { path: '/reports/inactivity', label: 'Relatórios de Inatividade', icon: Clock }
    ]
  },
  { 
    path: '/settings', 
    icon: Settings, 
    label: 'Configurações', 
    roles: ['admin'],
    subItems: [
      { path: '/settings', label: 'Configurações Gerais', icon: Settings },
      { path: '/settings/logs', label: 'Logs do Sistema', icon: History }
    ]
  },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );
  
  return (
    <div className="min-h-screen flex">
      <nav className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 transition-all duration-300 ${
        isMenuCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="h-full flex flex-col">
          <div className={`p-4 flex items-center ${isMenuCollapsed ? 'justify-center' : 'gap-2'}`}>
            <Ticket className="w-8 h-8 text-indigo-600 flex-shrink-0" />
            {!isMenuCollapsed && (
              <h1 className="text-xl font-bold text-gray-900">RadiobrasDigital</h1>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1 p-2">
              {filteredNavItems.map((item) => (
                <div key={item.path}>
                  {item.subItems ? (
                    <>
                      <div className={`flex items-center gap-2 px-2 py-2 text-sm font-medium text-gray-700 ${
                        isMenuCollapsed ? 'justify-center' : ''
                      }`}>
                        <item.icon className="w-5 h-5" />
                        {!isMenuCollapsed && item.label}
                      </div>
                      {!isMenuCollapsed && (
                        <div className="ml-6 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                location.pathname === subItem.path
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <subItem.icon className="w-4 h-4" />
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === item.path
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${isMenuCollapsed ? 'justify-center' : ''}`}
                      title={isMenuCollapsed ? item.label : undefined}
                    >
                      <item.icon className="w-5 h-5" />
                      {!isMenuCollapsed && item.label}
                    </Link>
                  )}
                </div>
              ))}

              <Link
                to="/display"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                  isMenuCollapsed ? 'justify-center' : ''
                }`}
                title={isMenuCollapsed ? 'Painel Público' : undefined}
              >
                <Monitor className="w-5 h-5" />
                {!isMenuCollapsed && 'Painel Público'}
              </Link>

              <Link
                to="/kiosk"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                  isMenuCollapsed ? 'justify-center' : ''
                }`}
                title={isMenuCollapsed ? 'Kiosk' : undefined}
              >
                <Printer className="w-5 h-5" />
                {!isMenuCollapsed && 'Kiosk'}
              </Link>
            </div>
          </div>

          <div className={`p-4 ${isMenuCollapsed ? 'items-center' : ''}`}>
            {!isMenuCollapsed && (
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
                isMenuCollapsed ? 'justify-center' : ''
              }`}
              title={isMenuCollapsed ? 'Sair' : undefined}
            >
              <LogOut className="w-5 h-5" />
              {!isMenuCollapsed && 'Sair'}
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-gray-600"
        >
          {isMenuCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </nav>
      
      <main className={`flex-1 transition-all duration-300 ${
        isMenuCollapsed ? 'ml-16' : 'ml-64'
      } p-8 bg-gray-50`}>
        <Outlet />
      </main>
    </div>
  );
}