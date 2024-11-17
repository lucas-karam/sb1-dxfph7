import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useQueueStore } from '../store/queueStore';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileDown, Download, Search } from 'lucide-react';

type LogType = 'all' | 'login' | 'ticket' | 'system';

interface SystemLog {
  id: string;
  timestamp: Date;
  type: LogType;
  action: string;
  userId?: string;
  details: string;
}

export function SystemLogs() {
  const { users } = useAuthStore();
  const { tickets } = useQueueStore();
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7),
    end: new Date()
  });
  const [selectedType, setSelectedType] = useState<LogType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Gera logs do sistema baseado nas ações dos usuários
  const systemLogs = useMemo(() => {
    const logs: SystemLog[] = [];

    // Logs de login/logout
    users.forEach(user => {
      user.sessions?.forEach(session => {
        logs.push({
          id: crypto.randomUUID(),
          timestamp: new Date(session.loginTime),
          type: 'login',
          action: 'Login',
          userId: user.id,
          details: `Usuário ${user.name} realizou login no sistema`
        });

        if (session.logoutTime) {
          logs.push({
            id: crypto.randomUUID(),
            timestamp: new Date(session.logoutTime),
            type: 'login',
            action: 'Logout',
            userId: user.id,
            details: `Usuário ${user.name} realizou logout do sistema`
          });
        }
      });
    });

    // Logs de tickets
    tickets.forEach(ticket => {
      logs.push({
        id: crypto.randomUUID(),
        timestamp: new Date(ticket.createdAt),
        type: 'ticket',
        action: 'Criação de Senha',
        details: `Senha ${ticket.number} criada para o setor ${ticket.sectorId}`
      });

      ticket.history.forEach(entry => {
        if (entry.userId) {
          const user = users.find(u => u.id === entry.userId);
          logs.push({
            id: crypto.randomUUID(),
            timestamp: new Date(entry.timestamp),
            type: 'ticket',
            action: `Alteração de Status`,
            userId: entry.userId,
            details: `Senha ${ticket.number} - ${entry.status} por ${user?.name || 'Usuário Desconhecido'}`
          });
        }
      });
    });

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [users, tickets]);

  const filteredLogs = useMemo(() => {
    return systemLogs.filter(log => {
      const matchesType = selectedType === 'all' || log.type === selectedType;
      const matchesDate = log.timestamp >= dateRange.start && log.timestamp <= dateRange.end;
      const matchesSearch = searchTerm === '' || 
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesDate && matchesSearch;
    });
  }, [systemLogs, selectedType, dateRange, searchTerm]);

  const handleDownloadPDF = () => {
    // Implementar exportação PDF
  };

  const handleDownloadExcel = () => {
    // Implementar exportação Excel
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Logs do Sistema</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar logs..."
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as LogType)}
            className="input"
          >
            <option value="all">Todos os tipos</option>
            <option value="login">Login/Logout</option>
            <option value="ticket">Senhas</option>
            <option value="system">Sistema</option>
          </select>
          <input
            type="date"
            value={format(dateRange.start, 'yyyy-MM-dd')}
            onChange={(e) => setDateRange(prev => ({
              ...prev,
              start: new Date(e.target.value)
            }))}
            className="input"
          />
          <input
            type="date"
            value={format(dateRange.end, 'yyyy-MM-dd')}
            onChange={(e) => setDateRange(prev => ({
              ...prev,
              end: new Date(e.target.value)
            }))}
            className="input"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-3 font-semibold text-gray-600">Data/Hora</th>
                <th className="pb-3 font-semibold text-gray-600">Tipo</th>
                <th className="pb-3 font-semibold text-gray-600">Ação</th>
                <th className="pb-3 font-semibold text-gray-600">Usuário</th>
                <th className="pb-3 font-semibold text-gray-600">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const user = log.userId ? users.find(u => u.id === log.userId) : null;
                return (
                  <tr key={log.id} className="border-b border-gray-100">
                    <td className="py-3">
                      {format(log.timestamp, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.type === 'login' ? 'bg-blue-100 text-blue-800' :
                        log.type === 'ticket' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.type === 'login' ? 'Login/Logout' :
                         log.type === 'ticket' ? 'Senha' : 'Sistema'}
                      </span>
                    </td>
                    <td className="py-3">{log.action}</td>
                    <td className="py-3">{user?.name || '-'}</td>
                    <td className="py-3">{log.details}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nenhum log encontrado para os filtros selecionados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}