import React, { useState, useMemo } from 'react';
import { useQueueStore } from '../store/queueStore';
import { useAuthStore } from '../store/authStore';
import { format, differenceInMinutes, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, FileSpreadsheet, BarChart3, Clock, Users } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { LineChart } from '../components/charts/LineChart';
import { BarChart } from '../components/charts/BarChart';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function AdvancedReports() {
  const { sectors, tickets } = useQueueStore();
  const { users } = useAuthStore();
  const [dateRange, setDateRange] = useState({
    start: startOfDay(subDays(new Date(), 30)),
    end: endOfDay(new Date())
  });

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      return ticketDate >= dateRange.start && ticketDate <= dateRange.end;
    });
  }, [tickets, dateRange]);

  const stats = useMemo(() => {
    const completedTickets = filteredTickets.filter(t => t.status === 'completed');
    const totalWaitTime = completedTickets.reduce((acc, ticket) => {
      if (ticket.startedAt) {
        return acc + differenceInMinutes(new Date(ticket.startedAt), new Date(ticket.createdAt));
      }
      return acc;
    }, 0);

    const totalServiceTime = completedTickets.reduce((acc, ticket) => {
      if (ticket.startedAt && ticket.completedAt) {
        return acc + differenceInMinutes(new Date(ticket.completedAt), new Date(ticket.startedAt));
      }
      return acc;
    }, 0);

    return {
      totalTickets: filteredTickets.length,
      completedTickets: completedTickets.length,
      avgWaitTime: completedTickets.length ? Math.round(totalWaitTime / completedTickets.length) : 0,
      avgServiceTime: completedTickets.length ? Math.round(totalServiceTime / completedTickets.length) : 0
    };
  }, [filteredTickets]);

  const sectorStats = useMemo(() => {
    return sectors.map(sector => {
      const sectorTickets = filteredTickets.filter(t => t.sectorId === sector.id);
      const completed = sectorTickets.filter(t => t.status === 'completed');
      
      return {
        name: sector.name,
        total: sectorTickets.length,
        completed: completed.length,
        forwarded: sectorTickets.filter(t => t.status === 'forwarded').length,
        avgWaitTime: completed.length ? Math.round(
          completed.reduce((acc, t) => {
            if (t.startedAt) {
              return acc + differenceInMinutes(new Date(t.startedAt), new Date(t.createdAt));
            }
            return acc;
          }, 0) / completed.length
        ) : 0
      };
    });
  }, [sectors, filteredTickets]);

  const userStats = useMemo(() => {
    return users.map(user => {
      const userTickets = filteredTickets.filter(t => 
        t.history.some(h => h.userId === user.id)
      );

      return {
        name: user.name,
        total: userTickets.length,
        avgServiceTime: userTickets.length ? Math.round(
          userTickets.reduce((acc, t) => {
            const userHistory = t.history.filter(h => h.userId === user.id);
            return acc + userHistory.reduce((time, h, i, arr) => {
              if (i < arr.length - 1) {
                return time + differenceInMinutes(new Date(arr[i + 1].timestamp), new Date(h.timestamp));
              }
              return time;
            }, 0);
          }, 0) / userTickets.length
        ) : 0
      };
    });
  }, [users, filteredTickets]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Relatório Avançado de Atendimentos', 14, 20);
    doc.setFontSize(12);
    doc.text(`Período: ${format(dateRange.start, 'dd/MM/yyyy')} a ${format(dateRange.end, 'dd/MM/yyyy')}`, 14, 30);

    // Stats
    doc.autoTable({
      startY: 40,
      head: [['Estatísticas Gerais']],
      body: [
        ['Total de Atendimentos', stats.totalTickets.toString()],
        ['Atendimentos Concluídos', stats.completedTickets.toString()],
        ['Tempo Médio de Espera', `${stats.avgWaitTime} minutos`],
        ['Tempo Médio de Atendimento', `${stats.avgServiceTime} minutos`]
      ]
    });

    // Sector Stats
    doc.autoTable({
      startY: doc.lastAutoTable?.finalY! + 10,
      head: [['Setor', 'Total', 'Concluídos', 'Encaminhados', 'T.M. Espera']],
      body: sectorStats.map(s => [
        s.name,
        s.total.toString(),
        s.completed.toString(),
        s.forwarded.toString(),
        `${s.avgWaitTime} min`
      ])
    });

    // User Stats
    doc.autoTable({
      startY: doc.lastAutoTable?.finalY! + 10,
      head: [['Atendente', 'Atendimentos', 'T.M. Atendimento']],
      body: userStats.map(u => [
        u.name,
        u.total.toString(),
        `${u.avgServiceTime} min`
      ])
    });

    doc.save('relatorio-avancado.pdf');
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // General Stats
    const statsSheet = XLSX.utils.aoa_to_sheet([
      ['Estatísticas Gerais'],
      ['Total de Atendimentos', stats.totalTickets],
      ['Atendimentos Concluídos', stats.completedTickets],
      ['Tempo Médio de Espera', `${stats.avgWaitTime} minutos`],
      ['Tempo Médio de Atendimento', `${stats.avgServiceTime} minutos`]
    ]);
    XLSX.utils.book_append_sheet(wb, statsSheet, 'Estatísticas Gerais');

    // Sector Stats
    const sectorSheet = XLSX.utils.json_to_sheet(sectorStats);
    XLSX.utils.book_append_sheet(wb, sectorSheet, 'Estatísticas por Setor');

    // User Stats
    const userSheet = XLSX.utils.json_to_sheet(userStats);
    XLSX.utils.book_append_sheet(wb, userSheet, 'Estatísticas por Atendente');

    XLSX.writeFile(wb, 'relatorio-avancado.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Relatório Avançado</h2>
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
            onClick={handleExportPDF}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Atendimentos"
          value={stats.totalTickets}
          icon={Users}
          description="No período selecionado"
        />
        <StatCard
          title="Atendimentos Concluídos"
          value={stats.completedTickets}
          icon={BarChart3}
          description={`${Math.round((stats.completedTickets / stats.totalTickets) * 100)}% do total`}
        />
        <StatCard
          title="Tempo Médio de Espera"
          value={`${stats.avgWaitTime}min`}
          icon={Clock}
          description="Até início do atendimento"
        />
        <StatCard
          title="Tempo Médio de Atendimento"
          value={`${stats.avgServiceTime}min`}
          icon={Clock}
          description="Duração do atendimento"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-6">Atendimentos por Setor</h3>
          <BarChart
            data={sectorStats}
            dataKey="total"
            xAxisKey="name"
            height={300}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-6">Tempo Médio de Espera por Setor</h3>
          <BarChart
            data={sectorStats}
            dataKey="avgWaitTime"
            xAxisKey="name"
            height={300}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">Desempenho por Atendente</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-3 font-semibold text-gray-600">Atendente</th>
                <th className="pb-3 font-semibold text-gray-600">Total de Atendimentos</th>
                <th className="pb-3 font-semibold text-gray-600">Tempo Médio de Atendimento</th>
              </tr>
            </thead>
            <tbody>
              {userStats.map((user) => (
                <tr key={user.name} className="border-b border-gray-100">
                  <td className="py-3">{user.name}</td>
                  <td className="py-3">{user.total}</td>
                  <td className="py-3">{user.avgServiceTime} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}