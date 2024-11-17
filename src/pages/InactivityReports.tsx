import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useQueueStore } from '../store/queueStore';
import { format, subDays, differenceInMinutes, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, FileSpreadsheet } from 'lucide-react';

export function InactivityReports() {
  // ... (rest of the code remains the same)
}