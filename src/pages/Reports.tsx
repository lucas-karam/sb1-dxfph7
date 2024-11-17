import React, { useState, useMemo } from 'react';
import { useQueueStore } from '../store/queueStore';
import { useAuthStore } from '../store/authStore';
import { BarChart3, Clock, Users, TrendingUp, FileText, FileSpreadsheet } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { LineChart } from '../components/charts/LineChart';
import { BarChart } from '../components/charts/BarChart';
import { format, startOfDay, endOfDay, eachDayOfInterval, subDays, differenceInMinutes, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function Reports() {
  const { tickets, sectors } = useQueueStore();
  const { users } = useAuthStore();
  const [dateRange, setDateRange] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date())
  });

  const stats = useMemo(() => {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    
    const todayTickets = tickets.filter(t => 
      new Date(t.createdAt) >= todayStart && 
      new Date(t.createdAt) <= todayEnd
    );

    const completedTickets = todayTickets.filter(t => t.status === 'completed');
    const avgWaitTime = completedTickets.reduce((acc, t) => {
      if (t.startedAt) {
        const start = new Date(t.createdAt);
        const end = new Date(t.startedAt);
        return acc + (end.getTime() - start.getTime());
      }
      return acc;
    }, 0) / (completedTickets.length || 1);

    return {
      totalToday: todayTickets.length,
      avgWaitMinutes: Math.round(avgWaitTime / 1000 / 60),
      completionRate: Math.round((completedTickets.length / (todayTickets.length || 1)) * 100)
    };
  }, [tickets]);

  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayTickets = tickets.filter(t => 
        new Date(t.createdAt) >= dayStart && 
        new Date(t.createdAt) <= dayEnd
      );

      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        total: dayTickets.length
      };
    });
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(ticket => 
        isWithinInterval(new Date(ticket.createdAt), {
          start: dateRange.start,
          end: dateRange.end
        })
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tickets, dateRange]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.autoTable({
      head: [['Senha', 'Início', 'Fim', 'Tempo Total', 'Timeline']],
      body: filteredTickets.map(ticket => {
        const timeline = ticket.history.map((entry, index, arr) => {
          const sector = sectors.find(s => s.id === entry.sectorId);
          const user = users.find(u => u.id === entry.userId);
          
          // Calculate time in this status
          let timeInStatus = 0;
          const startTime = new Date(entry.timestamp);
          const endTime = index < arr.length - 1 
            ? new Date(arr[index + 1].timestamp)
            : entry.status === 'completed' 
              ? new Date(ticket.completedAt!)
              : new Date();
          
          timeInStatus = differenceInMinutes(endTime, startTime);

          // For completed status, show total time in sector
          if (entry.status === 'completed') {
            const sectorEntries = arr.filter(e => e.sectorId === entry.sectorId);
            const sectorStartTime = new Date(sectorEntries[0].timestamp);
            const sectorEndTime = new Date(entry.timestamp);
            timeInStatus = differenceInMinutes(sectorEndTime, sectorStartTime);
          }

          return `${sector?.name || 'Desconhecido'} (${entry.status}) ${timeInStatus}min${user ? ` - ${user.name}` : ''}`;
        }).join(' → ');

        return [
          ticket.number,
          format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm'),
          ticket.completedAt ? format(new Date(ticket.completedAt), 'dd/MM/yyyy HH:mm') : '-',
          ticket.completedAt ? `${differenceInMinutes(new Date(ticket.completedAt), new Date(ticket.createdAt))}min` : '-',
          timeline
        ];
      })
    });
    
    doc.save('relatorio-atendimentos.pdf');
  };

  const handleDownloadExcel = () => {
    const data = filteredTickets.map(ticket => {
      const timeline = ticket.history.map((entry, index, arr) => {
        const sector = sectors.find(s => s.id === entry.sectorId);
        const user = users.find(u => u.id === entry.userId);
        
        // Calculate time in this status
        let timeInStatus = 0;
        const startTime = new Date(entry.timestamp);
        const endTime = index < arr.length - 1 
          ? new Date(arr[index + 1].timestamp)
          : entry.status === 'completed' 
            ? new Date(ticket.completedAt!)
            : new Date();
        
        timeInStatus = differenceInMinutes(endTime, startTime);

        // For completed status, show total time in sector
        if (entry.status === 'completed') {
          const sectorEntries = arr.filter(e => e.sectorId === entry.sectorId);
          const sectorStartTime = new Date(sectorEntries[0].timestamp);
          const sectorEndTime = new Date(entry.timestamp);
          timeInStatus = differenceInMinutes(sectorEndTime, sectorStartTime);
        }

        return `${sector?.name || 'Desconhecido'} (${entry.status}) ${timeInStatus}min${user ? ` - ${user.name}` : ''}`;
      }).join(' → ');

      return {
        'Senha': ticket.number,
        'Início': format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm'),
        'Fim': ticket.completedAt ? format(new Date(ticket.completedAt), 'dd/MM/yyyy HH:mm') : '-',
        'Tempo Total': ticket.completedAt ? `${differenceInMinutes(new Date(ticket.completedAt), new Date(ticket.createdAt))}min` : '-',
        'Timeline': timeline
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Atendimentos');
    XLSX.writeFile(wb, 'relatorio-atendimentos.xlsx');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Relatórios</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total de Atendimentos"
            value={stats.totalToday}
            icon={Users}
            description="Hoje"
            trend={{ value: 12, isPositive: true }}
          />

          <StatCard
            title="Tempo Médio de Espera"
            value={`${stats.avgWaitMinutes}min`}
            icon={Clock}
            description="Média do dia"
            trend={{ value: 5, isPositive: false }}
          />

          <StatCard
            title="Taxa de Conclusão"
            value={`${stats.completionRate}%`}
            icon={TrendingUp}
            description="Atendimentos finalizados"
            trend={{ value: 3, isPositive: true }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Atendimentos por Dia</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <LineChart
            data={dailyData}
            dataKey="total"
            xAxisKey="date"
            height={300}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Atendimentos por Setor</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <BarChart
            data={sectors.map(sector => ({
              name: sector.name,
              total: tickets.filter(t => t.sectorId === sector.id).length
            }))}
            dataKey="total"
            xAxisKey="name"
            height={300}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Detalhamento por Atendimento</h3>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <input
                type="date"
                value={format(dateRange.start, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange(prev => ({
                  ...prev,
                  start: startOfDay(new Date(e.target.value))
                }))}
                className="input"
              />
              <input
                type="date"
                value={format(dateRange.end, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange(prev => ({
                  ...prev,
                  end: endOfDay(new Date(e.target.value))
                }))}
                className="input"
              />
            </div>
            <button
              onClick={handleDownloadPDF}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleDownloadExcel}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-3 font-semibold text-gray-600">Senha</th>
                <th className="pb-3 font-semibold text-gray-600">Início</th>
                <th className="pb-3 font-semibold text-gray-600">Fim</th>
                <th className="pb-3 font-semibold text-gray-600">Tempo Total</th>
                <th className="pb-3 font-semibold text-gray-600">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-100">
                  <td className="py-3">{ticket.number}</td>
                  <td className="py-3">{format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                  <td className="py-3">
                    {ticket.completedAt ? format(new Date(ticket.completedAt), 'dd/MM/yyyy HH:mm') : '-'}
                  </td>
                  <td className="py-3">
                    {ticket.completedAt 
                      ? `${differenceInMinutes(new Date(ticket.completedAt), new Date(ticket.createdAt))}min`
                      : '-'
                    }
                  </td>
                  <td className="py-3">
                    <div className="space-y-1">
                      {ticket.history.map((entry, index, arr) => {
                        const sector = sectors.find(s => s.id === entry.sectorId);
                        const user = users.find(u => u.id === entry.userId);
                        
                        // Calculate time in this status
                        let timeInStatus = 0;
                        const startTime = new Date(entry.timestamp);
                        const endTime = index < arr.length - 1 
                          ? new Date(arr[index + 1].timestamp)
                          : entry.status === 'completed' 
                            ? new Date(ticket.completedAt!)
                            : new Date();
                        
                        timeInStatus = differenceInMinutes(endTime, startTime);

                        // For completed status, show total time in sector
                        if (entry.status === 'completed') {
                          const sectorEntries = arr.filter(e => e.sectorId === entry.sectorId);
                          const sectorStartTime = new Date(sectorEntries[0].timestamp);
                          const sectorEndTime = new Date(entry.timestamp);
                          timeInStatus = differenceInMinutes(sectorEndTime, sectorStartTime);
                        }

                        return (
                          <div key={`${ticket.id}-${index}`} className="flex items-center gap-2 text-sm">
                            <span 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: sector?.color }}
                            />
                            <span className="font-medium">{sector?.name}</span>
                            <span className="text-gray-500">
                              ({entry.status}) {timeInStatus}min
                              {user && ` - ${user.name}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTickets.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nenhum atendimento encontrado no período selecionado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}