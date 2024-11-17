import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { IssueTicket } from './pages/IssueTicket';
import { ServiceDesk } from './pages/ServiceDesk';
import { Reports } from './pages/Reports';
import { AdvancedReports } from './pages/AdvancedReports';
import { InactivityReports } from './pages/InactivityReports';
import { Settings } from './pages/Settings';
import { SystemLogs } from './pages/SystemLogs';
import { DisplayPanel } from './pages/DisplayPanel';
import { Kiosk } from './pages/Kiosk';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';

export default function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <Routes>
      {/* Redirect root to login if not authenticated, otherwise to dashboard */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />

      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/display" element={<DisplayPanel />} />
      <Route path="/kiosk" element={<Kiosk />} />
      
      {/* Protected routes */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/issue" element={<IssueTicket />} />
        <Route path="/service" element={<ServiceDesk />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/advanced" element={<AdvancedReports />} />
        <Route path="/reports/inactivity" element={<InactivityReports />} />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/settings/logs" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SystemLogs />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}