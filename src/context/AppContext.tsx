'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translate } from '@/i18n';
import type {
  UserRole,
  LiveSession,
  Product,
  Controller,
  LostFoundItem,
  Reservation,
  AuditLog,
  SessionProduct,
  CafeTable,
  CafeTableItem,
  CustomerProfile,
  LoyaltyTier,
  ReservationAlert,
  Employee,
  AttendanceRecord,
  Shift,
  EmployeeWithdrawal,
  Expense,
  CashTransaction,
  PayrollPeriod,
  InventoryMovement,
  ActionAlert,
  AuditRecord
} from '../types';

interface AppContextProps {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  sessions: LiveSession[];
  products: Product[];
  controllers: Controller[];
  lostFoundItems: LostFoundItem[];
  reservations: Reservation[];
  waitingList: {
    id: string;
    name: string;
    phone: string;
    roomType: 'Standard' | 'Premium' | 'VIP';
    note?: string;
  }[];
  auditLogs: AuditLog[];

  // Café Tables
  cafeTables: CafeTable[];
  openCafeTable: (tableId: string, customerName?: string, customerPhone?: string) => void;
  closeCafeTable: (tableId: string) => void;
  addItemToTable: (tableId: string, item: CafeTableItem) => void;
  removeItemFromTable: (tableId: string, itemId: string) => void;
  reserveCafeTable: (tableId: string) => void;
  settleTable: (
    tableId: string,
    paymentMethod: 'Cash' | 'Card' | 'Vodafone Cash',
    discount?: number
  ) => { total: number; items: CafeTableItem[]; tableName: string };
  transferTableToSession: (tableId: string, sessionId: string) => void;

  // Customers CRM
  customers: CustomerProfile[];
  adjustPoints: (customerId: string, delta: number, reason: string) => void;

  // Reservation Alerts
  upcomingAlerts: ReservationAlert[];
  dismissReservationAlert: (id: string) => void;
  snoozeReservationAlert: (id: string) => void;
  checkInFromAlert: (alert: ReservationAlert) => void;

  // PS Session Actions
  addSession: (
    session: Omit<
      LiveSession,
      | 'id'
      | 'elapsedSeconds'
      | 'runningBill'
      | 'products'
      | 'modeHistory'
      | 'openingTimestamp'
      | 'status'
    >
  ) => void;
  extendSession: (id: string, minutes: number) => void;
  convertToOpenEnded: (id: string) => void;
  togglePauseSession: (id: string) => void;
  switchSessionMode: (id: string, newMode: 'single' | 'multi') => void;
  addCafeOrder: (
    sessionId: string,
    productId: string,
    qty: number,
    manualPrice?: number
  ) => { success: boolean; message?: string };
  voidCafeItem: (sessionId: string, productId: string) => void;
  checkoutSession: (
    sessionId: string,
    controllersLog: { id: string; status: Controller['status'] }[],
    discount: number,
    paymentMethod: 'Cash' | 'Card' | 'Vodafone Cash'
  ) => void;
  logFoundItem: (roomName: string, description: string) => void;
  logLostTicket: (
    description: string,
    roomName: string,
    customerName: string,
    customerPhone: string
  ) => void;
  claimLostItem: (id: string) => void;
  assignRoomFromWaitlist: (waitlistId: string, roomName: string) => void;
  updateProductPrice: (id: string, newPrice: number) => { success: boolean; message?: string };
  updateProductStock: (id: string, change: number) => void;
  updateControllerStatus: (id: string, status: Controller['status']) => void;
  triggerProfitIntegrityAlert: (message: string) => void;
  alerts: {
    id: string;
    message: string;
    timestamp: string;
    type: 'profit' | 'inventory' | 'noshow';
  }[];
  dismissAlert: (id: string) => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;

  // ─── Operational Extension Properties ──────────────────────────────────────────
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;

  attendanceRecords: AttendanceRecord[];
  clockIn: (employeeId: string, coords: { lat: number; lng: number }) => { success: boolean; message: string };
  clockOut: (employeeId: string, coords: { lat: number; lng: number }) => { success: boolean; message: string };
  addManualAttendanceCorrection: (employeeId: string, date: string, checkInTime: string, checkOutTime: string, reason: string) => void;

  shifts: Shift[];
  openShift: (assignedEmployeeIds: string[], openingCash: number) => void;
  closeShift: (shiftId: string, closingData: ShiftClosingData) => void;
  approveShift: (shiftId: string) => void;

  withdrawals: EmployeeWithdrawal[];
  requestWithdrawal: (employeeId: string, amount: number, reason: string) => void;
  approveWithdrawal: (withdrawalId: string) => void;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'status'>) => void;
  approveExpense: (expenseId: string) => void;

  cashTransactions: CashTransaction[];
  recordCashTransaction: (type: 'In' | 'Out', amount: number, source: CashTransaction['source'], referenceId: string, description: string) => void;
  cashOnHand: number;

  payrollPeriods: PayrollPeriod[];
  calculatePayroll: (month: number, year: number) => void;
  payPayrollItem: (periodId: string, employeeId: string, paymentMethod: string) => void;

  inventoryMovements: InventoryMovement[];
  recordInventoryMovement: (productId: string, qty: number, type: InventoryMovement['type'], reason: string) => void;

  actionAlerts: ActionAlert[];
  createActionAlert: (type: ActionAlert['type'], severity: ActionAlert['severity'], message: string, referenceId: string) => void;
  resolveActionAlert: (alertId: string) => void;

  auditRecords: AuditRecord[];
  writeAuditRecord: (action: string, details: string, prev?: string, next?: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Helper helper to get current rate based on room type & player mode
const getRate = (roomType: 'Standard' | 'Premium' | 'VIP', mode: 'single' | 'multi'): number => {
  if (roomType === 'VIP') return mode === 'single' ? 150 : 220;
  if (roomType === 'Premium') return mode === 'single' ? 100 : 150;
  return mode === 'single' ? 80 : 120;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setRoleState] = useState<UserRole>('owner'); // Default to Owner so the user has full dashboard power initially
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [alerts, setAlerts] = useState<AppContextProps['alerts']>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // ─── Extended Operations States & Seed Data ───────────────────────────────────────
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 'emp-1', name: 'Omar Mansour', phone: '0155-222-3344', role: 'staff', jobTitle: 'Gaming Lounge Host', department: 'Operations', hireDate: '2026-01-15', status: 'Active', baseSalary: 6000, salaryType: 'Monthly', workingDays: 26, workingHours: 8 },
    { id: 'emp-2', name: 'Ahmed Samir', phone: '0112-987-8834', role: 'staff', jobTitle: 'Café Barista & Cashier', department: 'Operations', hireDate: '2026-02-10', status: 'Active', baseSalary: 5500, salaryType: 'Monthly', workingDays: 26, workingHours: 8 },
    { id: 'emp-3', name: 'Hassan Nour', phone: '0115-321-3312', role: 'manager', jobTitle: 'Lounge Manager', department: 'Operations', hireDate: '2025-08-01', status: 'Active', baseSalary: 9000, salaryType: 'Monthly', workingDays: 26, workingHours: 8 },
  ]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: 'att-1',
      employeeId: 'emp-1',
      date: new Date().toISOString().split('T')[0],
      checkInTime: '08:02',
      checkInCoords: { lat: 30.0444, lng: 31.2357 },
      inRange: true,
      lateMinutes: 2,
      earlyDepartureMinutes: 0,
      totalWorkingHours: 0,
      overtimeHours: 0,
      status: 'Late',
      verifiedLocation: 'Zoox Hub Lounge Branch A'
    }
  ]);

  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: 'sh-1',
      date: new Date().toISOString().split('T')[0],
      status: 'Active',
      startTime: '08:00',
      assignedEmployeeIds: ['emp-1'],
      openingCash: 500,
      sessionsHandledCount: 2,
      salesCount: 3,
      revenue: 350,
      expenses: 0,
      withdrawals: 0,
    }
  ]);

  const [withdrawals, setWithdrawals] = useState<EmployeeWithdrawal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([
    {
      id: 'tx-1',
      timestamp: new Date().toISOString(),
      type: 'In',
      amount: 500,
      source: 'Shift Open',
      referenceId: 'sh-1',
      actorId: 'emp-3',
      description: 'Opening Cash Float for Shift #1',
      runningBalance: 500
    }
  ]);

  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [actionAlerts, setActionAlerts] = useState<ActionAlert[]>([
    {
      id: 'al-1',
      type: 'Low Stock',
      severity: 'Warning',
      message: 'Chipsy XL stock is low (12 units remaining). Minimum threshold is 15.',
      referenceId: 'p-2',
      resolved: false,
      createdAt: new Date().toISOString(),
    }
  ]);

  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);

  const cashOnHand = cashTransactions.reduce((acc, tx) => {
    return tx.type === 'In' ? acc + tx.amount : acc - tx.amount;
  }, 0);


  // 1. Live Sessions State
  const [sessions, setSessions] = useState<LiveSession[]>([
    {
      id: 's-1',
      room: 'Room VIP-1',
      roomType: 'VIP',
      consoleTier: 'PS5 PRO',
      customer: 'Mohamed Khalil',
      phone: '0100-123-4521',
      customerId: 'cust-1',
      openingStaff: 'Omar M.',
      openingTimestamp: new Date(Date.now() - 47 * 60 * 1000).toISOString(),
      startTime: '14:30',
      elapsedSeconds: 47 * 60,
      isOpenEnded: true,
      hourlyRate: 150,
      runningBill: 0,
      products: [{ id: 'p-1', name: 'Pepsi', price: 25, costPrice: 15, qty: 2 }],
      status: 'active',
      controllers: ['Pad #1', 'Pad #2'],
      modeHistory: [
        {
          timestamp: new Date(Date.now() - 47 * 60 * 1000).toISOString(),
          mode: 'single',
          ratePerHour: 150,
        },
      ],
    },
    {
      id: 's-2',
      room: 'Room 3',
      roomType: 'Standard',
      consoleTier: 'PS5 Slim',
      customer: 'Ahmed Samir & Group',
      phone: '0112-987-8834',
      openingStaff: 'Sherif K.',
      openingTimestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
      startTime: '13:45',
      elapsedSeconds: 95 * 60,
      durationMinutes: 120,
      isOpenEnded: false,
      hourlyRate: 120,
      runningBill: 0,
      products: [
        { id: 'p-1', name: 'Pepsi', price: 25, costPrice: 15, qty: 4 },
        { id: 'p-2', name: 'Chipsy XL', price: 20, costPrice: 10, qty: 2 },
      ],
      status: 'active',
      controllers: ['Pad #12', 'Pad #13', 'Pad #14', 'Pad #15'],
      modeHistory: [
        {
          timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
          mode: 'multi',
          ratePerHour: 120,
        },
      ],
    },
  ]);

  // 2. Inventory / Cafe Products State
  const [products, setProducts] = useState<Product[]>([
    { id: 'p-1', name: 'Pepsi', costPrice: 15, sellingPrice: 25, stock: 45, minProfitMargin: 0.35 },
    {
      id: 'p-2',
      name: 'Chipsy XL',
      costPrice: 10,
      sellingPrice: 20,
      stock: 12,
      minProfitMargin: 0.4,
    },
    {
      id: 'p-3',
      name: 'Mineral Water',
      costPrice: 5,
      sellingPrice: 15,
      stock: 80,
      minProfitMargin: 0.5,
    },
    {
      id: 'p-4',
      name: 'Red Bull',
      costPrice: 45,
      sellingPrice: 70,
      stock: 24,
      minProfitMargin: 0.3,
    },
    {
      id: 'p-5',
      name: 'Indomie Special',
      costPrice: 18,
      sellingPrice: 30,
      stock: 15,
      minProfitMargin: 0.3,
    },
  ]);

  // 3. Hardware / Controllers State (Pad #1 to #50)
  const [controllers, setControllers] = useState<Controller[]>(() => {
    const list: Controller[] = [];
    for (let i = 1; i <= 50; i++) {
      let status: Controller['status'] = 'Good';
      if (i === 4) status = 'Stick Drift';
      if (i === 15) status = 'Under Repair / Checkup';
      if (i === 32) status = 'Broken Buttons';
      list.push({
        id: `Pad #${i}`,
        status,
        currentRoomId: i === 1 || i === 2 ? 's-1' : i >= 12 && i <= 15 ? 's-2' : undefined,
        lastInspectedAt: new Date().toLocaleDateString(),
      });
    }
    return list;
  });

  // 4. Lost & Found Items State
  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>([
    {
      id: 'lf-1',
      roomName: 'Room VIP-1',
      description: 'Silver Casio Analog Watch left on VIP couch',
      dateFound: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      suggestedCustomerId: 'cust-1',
      suggestedCustomerName: 'Mohamed Khalil',
      suggestedCustomerPhone: '0100-123-4521',
      status: 'Found',
      notificationSent: false,
    },
  ]);

  // 5. Reservations & Waitlist
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 'res-1',
      customerName: 'Hassan Nour',
      customerPhone: '0115-321-3312',
      dateTime: '2026-08-28T18:00:00',
      roomType: 'Standard',
      customerHistoryNotes: 'Missed reservation on 2026-08-25 without notice.',
      status: 'Pending',
      previousNoShowFlag: true, // Prominent warning badge required
    },
    {
      id: 'res-2',
      customerName: 'Youssef Mahmoud',
      customerPhone: '0100-888-9901',
      dateTime: '2026-08-28T19:30:00',
      roomType: 'Premium',
      customerHistoryNotes: 'Regular guest, prefers DualSense Edge controllers.',
      status: 'Confirmed',
      previousNoShowFlag: false,
    },
  ]);

  const [waitingList, setWaitingList] = useState<AppContextProps['waitingList']>([
    {
      id: 'wl-1',
      name: 'Kareem Aly',
      phone: '0122-111-0099',
      roomType: 'VIP',
      note: 'Wants VIP for a party',
    },
    { id: 'wl-2', name: 'Omar Mansour', phone: '0155-222-3344', roomType: 'Standard' },
  ]);

  // 6. Café Tables State (15 tables, timer-driven)
  const [cafeTables, setCafeTables] = useState<CafeTable[]>(() => {
    const list: CafeTable[] = [];
    for (let i = 1; i <= 15; i++) {
      let status: CafeTable['status'] = 'Available';
      let items: CafeTable['items'] = [];
      let openedAt: string | null = null;
      let elapsedSeconds = 0;
      if (i === 1) {
        status = 'Occupied';
        openedAt = new Date(Date.now() - 22 * 60 * 1000).toISOString();
        elapsedSeconds = 22 * 60;
        items = [
          { id: 'p-1', name: 'Pepsi', price: 25, qty: 2 },
          { id: 'p-4', name: 'Red Bull', price: 70, qty: 1 },
        ];
      }
      if (i === 4) {
        status = 'Reserved';
      }
      if (i === 7) {
        status = 'Occupied';
        openedAt = new Date(Date.now() - 8 * 60 * 1000).toISOString();
        elapsedSeconds = 8 * 60;
        items = [{ id: 'p-3', name: 'Mineral Water', price: 15, qty: 3 }];
      }
      list.push({
        id: `ct-${i}`,
        name: `Café Table ${i}`,
        status,
        items,
        openedAt,
        elapsedSeconds,
        seatChargePerHour: 0, // timer-only, no seat fee
      });
    }
    return list;
  });

  // 7. Customer CRM Profiles
  const [customers, setCustomers] = useState<CustomerProfile[]>([
    {
      id: 'c-1',
      name: 'Mohamed Khalil',
      phone: '0100-123-4521',
      tier: 'Gold',
      visits: 15,
      spent: 1280,
      lastVisit: '2026-08-27',
      points: 150,
      history: [
        { date: '2026-08-27', action: 'PlayStation Room VIP-1', amount: 150 },
        { date: '2026-08-25', action: 'PlayStation Room 4', amount: 80 },
        { date: '2026-08-20', action: 'Billiards Table 1', amount: 120 },
      ],
      lostItems: [{ desc: 'Silver Casio Analog Watch', date: '2026-08-28', status: 'Found' }],
    },
    {
      id: 'c-2',
      name: 'Youssef Mahmoud',
      phone: '0100-888-9901',
      tier: 'Silver',
      visits: 8,
      spent: 650,
      lastVisit: '2026-08-26',
      points: 80,
      history: [
        { date: '2026-08-26', action: 'PlayStation Room 5', amount: 80 },
        { date: '2026-08-18', action: 'PlayStation Room VIP-2', amount: 220 },
      ],
      lostItems: [],
    },
    {
      id: 'c-3',
      name: 'Sara & Nadia',
      phone: '0106-777-7741',
      tier: 'Platinum',
      visits: 24,
      spent: 3420,
      lastVisit: '2026-08-28',
      points: 420,
      history: [
        { date: '2026-08-28', action: 'PlayStation Room VIP-2', amount: 440 },
        { date: '2026-08-26', action: 'Lounge Café Order', amount: 180 },
        { date: '2026-08-24', action: 'PlayStation Room VIP-1', amount: 320 },
      ],
      lostItems: [],
    },
    {
      id: 'c-4',
      name: 'Omar Mansour',
      phone: '0155-222-3344',
      tier: 'Bronze',
      visits: 2,
      spent: 160,
      lastVisit: '2026-08-21',
      points: 15,
      history: [
        { date: '2026-08-21', action: 'PlayStation Room 3', amount: 80 },
        { date: '2026-08-14', action: 'PlayStation Room 3', amount: 80 },
      ],
      lostItems: [],
    },
    {
      id: 'c-5',
      name: 'Hassan Nour',
      phone: '0115-321-3312',
      tier: 'Silver',
      visits: 6,
      spent: 540,
      lastVisit: '2026-08-28',
      points: 60,
      history: [{ date: '2026-08-28', action: 'Reservation — Room 5', amount: 100 }],
      lostItems: [],
    },
  ]);

  // 8. Upcoming Reservation Alerts (client-side cron)
  const [upcomingAlerts, setUpcomingAlerts] = useState<ReservationAlert[]>([]);

  // Role management with audit logging
  const setRole = (role: UserRole) => {
    setRoleState(role);
    addAuditLog('System', 'ROLE_SWITCH', `Switched active preview role to ${role}`);
  };

  const addAuditLog = (actor: string, action: string, details: string) => {
    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        actorName: actor,
        actorRole: currentRole,
        action,
        details,
      },
      ...prev,
    ]);
  };

  // Helper alert notifier
  const triggerProfitIntegrityAlert = (message: string) => {
    setAlerts((prev) => [
      {
        id: `alert-${Date.now()}`,
        message,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'profit',
      },
      ...prev,
    ]);
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Real-time ticking system updating elapsed times and recalculating bills
  useEffect(() => {
    const timer = setInterval(() => {
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.status !== 'active') return session;

          const updatedSeconds = session.elapsedSeconds + 10;

          // Calculate precise bill total including modes history
          const totalSessionMinutes = updatedSeconds / 60;
          let timeCost = 0;

          // Process mode history intervals
          for (let i = 0; i < session.modeHistory.length; i++) {
            const currentItem = session.modeHistory[i];
            const startTimeVal = new Date(currentItem.timestamp).getTime();
            const endTimeVal =
              i + 1 < session.modeHistory.length
                ? new Date(session.modeHistory[i + 1].timestamp).getTime()
                : Date.now();

            const durationHrs = Math.max(0, endTimeVal - startTimeVal) / (1000 * 3600);
            timeCost += durationHrs * currentItem.ratePerHour;
          }

          // Check for overtime per-minute accrual
          // If session is fixed duration and elapsed is more than duration:
          if (!session.isOpenEnded && session.durationMinutes) {
            const currentDurationMin = updatedSeconds / 60;
            if (currentDurationMin > session.durationMinutes) {
              const overtimeMins = currentDurationMin - session.durationMinutes;
              // Overtime is billed at the latest active hourly rate per minute
              const currentRate = session.modeHistory[session.modeHistory.length - 1].ratePerHour;
              const baseCost = (session.durationMinutes / 60) * session.modeHistory[0].ratePerHour;
              const overtimeCost = (overtimeMins / 60) * currentRate;
              timeCost = baseCost + overtimeCost;
            }
          }

          const productsCost = session.products.reduce((sum, p) => sum + p.price * p.qty, 0);
          const runningBill = Math.round(timeCost + productsCost);

          return {
            ...session,
            elapsedSeconds: updatedSeconds,
            runningBill,
          };
        })
      );
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  // Café table live timer tick (every second)
  useEffect(() => {
    const cafeTimer = setInterval(() => {
      setCafeTables((prev) =>
        prev.map((table) => {
          if (table.status !== 'Occupied') return table;
          return { ...table, elapsedSeconds: table.elapsedSeconds + 1 };
        })
      );
    }, 1000);
    return () => clearInterval(cafeTimer);
  }, []);

  // Client-side reservation alert cron — checks every 30s for reservations within 15 min
  useEffect(() => {
    const checkReservations = () => {
      const now = Date.now();
      const alertWindowMs = 15 * 60 * 1000; // 15 minutes

      setReservations((prevRes) => {
        const activeReservations = prevRes.filter(
          (r) => r.status === 'Confirmed' || r.status === 'Pending'
        );

        setUpcomingAlerts((prevAlerts) => {
          const newAlerts: ReservationAlert[] = [];
          for (const res of activeReservations) {
            const resTime = new Date(res.dateTime).getTime();
            const diff = resTime - now;
            if (diff > 0 && diff <= alertWindowMs) {
              const already = prevAlerts.find((a) => a.id === res.id);
              const snoozed = already?.snoozedUntil && already.snoozedUntil > now;
              if (!already && !snoozed) {
                newAlerts.push({
                  id: res.id,
                  customerName: res.customerName,
                  customerPhone: res.customerPhone,
                  scheduledTime: new Date(res.dateTime).toLocaleTimeString('en-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  }),
                  room: res.assignedRoom,
                  roomType: res.roomType,
                  minutesAway: Math.round(diff / 60000),
                });
              }
            }
          }
          if (newAlerts.length === 0) return prevAlerts;
          return [...prevAlerts, ...newAlerts];
        });

        return prevRes;
      });
    };

    checkReservations(); // run immediately on mount
    const cron = setInterval(checkReservations, 30000);
    return () => clearInterval(cron);
  }, []);

  // Action: Add new session
  const addSession = (
    sessionInit: Omit<
      LiveSession,
      | 'id'
      | 'elapsedSeconds'
      | 'runningBill'
      | 'products'
      | 'modeHistory'
      | 'openingTimestamp'
      | 'status'
    >
  ) => {
    const id = `s-${Date.now()}`;
    const startRate = sessionInit.hourlyRate;
    const openingTimestamp = new Date().toISOString();

    const newSession: LiveSession = {
      ...sessionInit,
      id,
      status: 'active',
      elapsedSeconds: 0,
      runningBill: 0,
      products: [],
      openingTimestamp,
      modeHistory: [
        {
          timestamp: openingTimestamp,
          mode: 'single',
          ratePerHour: startRate,
        },
      ],
    };

    setSessions((prev) => [...prev, newSession]);

    // Lock controllers
    setControllers((prev) =>
      prev.map((c) => (sessionInit.controllers.includes(c.id) ? { ...c, currentRoomId: id } : c))
    );

    addAuditLog(
      sessionInit.openingStaff,
      'START_SESSION',
      `Opened ${sessionInit.room} for ${sessionInit.customer}`
    );
  };

  // Action: Extend session
  const extendSession = (id: string, minutes: number) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newDuration = (s.durationMinutes || 0) + minutes;
        return {
          ...s,
          durationMinutes: newDuration,
          isOpenEnded: false,
        };
      })
    );
    addAuditLog('Staff', 'EXTEND_SESSION', `Extended session ${id} by ${minutes} minutes`);
  };

  const convertToOpenEnded = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          isOpenEnded: true,
          durationMinutes: undefined,
        };
      })
    );
    addAuditLog('Staff', 'CONVERT_OPEN_ENDED', `Converted session ${id} to open-ended`);
  };

  const togglePauseSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const isPausing = s.status === 'active';
        return {
          ...s,
          status: isPausing ? 'paused' : 'active',
        };
      })
    );
    addAuditLog('Staff', 'TOGGLE_PAUSE', `Toggled session ${id} state`);
  };

  // Action: Switch session mode (Single vs Multi-Player) mid-session
  const switchSessionMode = (id: string, newMode: 'single' | 'multi') => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newRate = getRate(s.roomType, newMode);

        // Add mode transition to modeHistory
        const newTransition = {
          timestamp: new Date().toISOString(),
          mode: newMode,
          ratePerHour: newRate,
        };

        return {
          ...s,
          hourlyRate: newRate,
          modeHistory: [...s.modeHistory, newTransition],
        };
      })
    );
    addAuditLog('Staff', 'SWITCH_MODE', `Switched session ${id} mode to ${newMode}`);
  };

  // Action: Add Cafe Order with inventory deduction & profit Integrity alerts
  const addCafeOrder = (
    sessionId: string,
    productId: string,
    qty: number,
    manualPrice?: number
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, message: translate(language, 'Product not found') };

    // Check stock
    if (product.stock < qty) {
      return {
        success: false,
        message:
          translate(language, 'Insufficient stock. Only ') +
          product.stock +
          translate(language, ' left.'),
      };
    }

    const sellPrice = manualPrice !== undefined ? manualPrice : product.sellingPrice;

    // Check profit margin: Margin = (Sell - Cost) / Sell
    const cost = product.costPrice;
    const profitMargin = sellPrice > 0 ? (sellPrice - cost) / sellPrice : 0;

    if (profitMargin < product.minProfitMargin) {
      const msg =
        translate(language, 'Profit Warning: ') +
        product.name +
        translate(language, ' sold at EGP ') +
        sellPrice +
        translate(language, ' (Margin ') +
        Math.round(profitMargin * 100) +
        translate(language, '% is below target ') +
        Math.round(product.minProfitMargin * 100) +
        translate(language, '%).');
      triggerProfitIntegrityAlert(msg);
      addAuditLog(
        'System',
        'PROFIT_WARNING',
        `Product ${product.name} sold below target margin to Session ${sessionId}`
      );
    }

    // Decrement stock
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock - qty } : p))
    );

    // Add to session products
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const existing = s.products.find((p) => p.id === productId);
        let updatedProducts;
        if (existing) {
          updatedProducts = s.products.map((p) =>
            p.id === productId ? { ...p, qty: p.qty + qty } : p
          );
        } else {
          updatedProducts = [
            ...s.products,
            { id: product.id, name: product.name, price: sellPrice, costPrice: cost, qty },
          ];
        }
        return {
          ...s,
          products: updatedProducts,
        };
      })
    );

    addAuditLog('Staff', 'ADD_CAFE_ITEM', `Added ${qty}x ${product.name} to session ${sessionId}`);
    return { success: true };
  };

  // Action: Void cafe item (requires audit trail)
  const voidCafeItem = (sessionId: string, productId: string) => {
    // Only Managers or Owners can void
    if (currentRole !== 'owner' && currentRole !== 'manager') {
      alert(
        translate(
          language,
          'Restricted Action: Manager authorization required to void billed items.'
        )
      );
      return;
    }

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const item = s.products.find((p) => p.id === productId);
        if (!item) return s;

        // Return stock
        setProducts((prods) =>
          prods.map((p) => (p.id === productId ? { ...p, stock: p.stock + item.qty } : p))
        );

        addAuditLog(
          'Manager',
          'VOID_CAFE_ITEM',
          `Voided ${item.qty}x ${item.name} from session ${sessionId}`
        );

        return {
          ...s,
          products: s.products.filter((p) => p.id !== productId),
        };
      })
    );
  };

  // Action: End & Checkout session with Controller quality inspection
  const checkoutSession = (
    sessionId: string,
    controllersLog: { id: string; status: Controller['status'] }[],
    discount: number,
    paymentMethod: 'Cash' | 'Card' | 'Vodafone Cash'
  ) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    // Apply controllers checkout inspection status to main controllers state
    setControllers((prev) =>
      prev.map((c) => {
        const log = controllersLog.find((l) => l.id === c.id);
        if (log) {
          return {
            ...c,
            status: log.status,
            currentRoomId: undefined, // Free controller
            lastInspectedAt: new Date().toLocaleDateString(),
          };
        }
        return c.currentRoomId === sessionId ? { ...c, currentRoomId: undefined } : c;
      })
    );

    // Save history / log found suggested customer
    // We add to Lost & Found history cache (room, customer, checkout timestamp)
    const mockFoundTriggerHistory = {
      roomName: session.room,
      customerName: session.customer,
      customerPhone: session.phone,
      checkoutTime: new Date().toISOString(),
    };

    // Remove from active list
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));

    addAuditLog(
      'Staff',
      'CHECKOUT_COMPLETE',
      `Checked out ${session.room}. Total Paid: EGP ${session.runningBill - discount} (Discount EGP ${discount}) via ${paymentMethod}`
    );
  };

  // Lost & Found Logging with smart auto-suggest
  const logFoundItem = (roomName: string, description: string) => {
    // Look up who was last in this room from sessions or logs.
    // In our live setup, we'll check if there is an active session or look up the mocked history.
    const activeMatch = sessions.find((s) => s.room === roomName);

    const suggestedCustomerName = activeMatch ? activeMatch.customer : 'Mohamed Khalil';
    const suggestedCustomerPhone = activeMatch ? activeMatch.phone : '0100-123-4521';
    const suggestedCustomerId = activeMatch ? activeMatch.customerId : 'cust-1';

    const newItem: LostFoundItem = {
      id: `lf-${Date.now()}`,
      roomName,
      description,
      dateFound: new Date().toISOString(),
      suggestedCustomerId,
      suggestedCustomerName,
      suggestedCustomerPhone,
      status: 'Found',
      notificationSent: false,
    };

    setLostFoundItems((prev) => [newItem, ...prev]);
    addAuditLog('Staff', 'LOG_FOUND_ITEM', `Logged found ${description} in ${roomName}`);
  };

  const logLostTicket = (
    description: string,
    roomName: string,
    customerName: string,
    customerPhone: string
  ) => {
    const newItem: LostFoundItem = {
      id: `lf-${Date.now()}`,
      roomName,
      description,
      dateFound: new Date().toISOString(),
      suggestedCustomerName: customerName,
      suggestedCustomerPhone: customerPhone,
      status: 'Found', // Set as found so it appears in the list
      notificationSent: false,
    };
    setLostFoundItems((prev) => [newItem, ...prev]);
    addAuditLog(
      'Customer',
      'SUBMIT_LOST_CLAIM',
      `Customer claimed lost ${description} in ${roomName}`
    );
  };

  const claimLostItem = (id: string) => {
    setLostFoundItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Returned' as const } : item))
    );
    addAuditLog('Staff', 'CLAIM_LOST_ITEM', `Returned item ${id} to customer`);
  };

  // Assign Room from Waitlist
  const assignRoomFromWaitlist = (waitlistId: string, roomName: string) => {
    const wl = waitingList.find((w) => w.id === waitlistId);
    if (!wl) return;

    // Remove from waiting list
    setWaitingList((prev) => prev.filter((w) => w.id !== waitlistId));

    // Get hourly rate
    const startRate = getRate(wl.roomType, 'single');

    // Create session
    addSession({
      room: roomName,
      roomType: wl.roomType,
      consoleTier:
        wl.roomType === 'VIP'
          ? 'PS5 PRO'
          : wl.roomType === 'Premium'
            ? 'PS5 Pro/Slim'
            : 'PS5 Standard',
      customer: wl.name,
      phone: wl.phone,
      openingStaff: 'System Allocation',
      startTime: new Date().toLocaleTimeString('en-EG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      isOpenEnded: true,
      hourlyRate: startRate,
      controllers: ['Pad #30', 'Pad #31'],
    });

    addAuditLog(
      'System',
      'ASSIGN_WAITLIST',
      `Assigned ${roomName} to waitlisted customer ${wl.name}`
    );
  };

  // Edit price (Requires Owner/Manager privilege)
  const updateProductPrice = (productId: string, newPrice: number) => {
    if (currentRole !== 'owner' && currentRole !== 'manager') {
      return {
        success: false,
        message: translate(
          language,
          'Unauthorized: Owner or Manager level required to edit base prices.'
        ),
      };
    }

    const prod = products.find((p) => p.id === productId);
    if (!prod) return { success: false, message: translate(language, 'Product not found.') };

    const cost = prod.costPrice;
    const profitMargin = (newPrice - cost) / newPrice;

    if (profitMargin < prod.minProfitMargin) {
      const msg =
        translate(language, 'Base Price Override Warning: ') +
        prod.name +
        translate(language, ' selling price updated to EGP ') +
        newPrice +
        translate(language, ' resulting in a profit margin of ') +
        Math.round(profitMargin * 100) +
        translate(language, ' (Below standard ') +
        Math.round(prod.minProfitMargin * 100) +
        translate(language, '%).');
      triggerProfitIntegrityAlert(msg);
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, sellingPrice: newPrice } : p))
    );

    addAuditLog('Manager', 'UPDATE_PRICE', `Updated price of ${prod.name} to EGP ${newPrice}`);
    return { success: true };
  };

  const updateProductStock = (id: string, change: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newStock = p.stock + change;
        if (change < 0 && newStock < 0) return p; // prevent negative stock manually
        return { ...p, stock: newStock };
      })
    );
    addAuditLog('Manager', 'RESTOCK_ITEM', `Adjusted stock of ${id} by ${change}`);
  };

  const updateControllerStatus = (id: string, status: Controller['status']) => {
    setControllers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status, lastInspectedAt: new Date().toLocaleDateString() } : c
      )
    );
    addAuditLog(
      'Staff',
      'REPORT_HARDWARE',
      `Reported hardware issue on ${id}: marked as ${status}`
    );
  };

  // ─── Café Table Actions ────────────────────────────────────────────────────

  const openCafeTable = (tableId: string, customerName?: string, customerPhone?: string) => {
    setCafeTables((prev) =>
      prev.map((t) =>
        t.id !== tableId
          ? t
          : {
              ...t,
              status: 'Occupied',
              openedAt: new Date().toISOString(),
              elapsedSeconds: 0,
              items: [],
              customerName,
              customerPhone,
            }
      )
    );
    addAuditLog(
      'Staff',
      'OPEN_CAFE_TABLE',
      `Opened ${tableId}${customerName ? ` for ${customerName}` : ''}`
    );
  };

  const closeCafeTable = (tableId: string) => {
    setCafeTables((prev) =>
      prev.map((t) =>
        t.id !== tableId
          ? t
          : {
              ...t,
              status: 'Available',
              openedAt: null,
              elapsedSeconds: 0,
              items: [],
              customerName: undefined,
              customerPhone: undefined,
            }
      )
    );
    addAuditLog('Staff', 'CLOSE_CAFE_TABLE', `Closed/reset ${tableId}`);
  };

  const reserveCafeTable = (tableId: string) => {
    setCafeTables((prev) =>
      prev.map((t) =>
        t.id !== tableId ? t : { ...t, status: t.status === 'Reserved' ? 'Available' : 'Reserved' }
      )
    );
  };

  const addItemToTable = (tableId: string, item: CafeTableItem) => {
    setCafeTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const exists = t.items.find((i) => i.id === item.id);
        const updated = exists
          ? t.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + item.qty } : i))
          : [...t.items, item];
        return { ...t, items: updated };
      })
    );
    // Deduct from product stock
    setProducts((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p))
    );
    addAuditLog('Staff', 'ADD_CAFE_TABLE_ITEM', `Added ${item.qty}x ${item.name} to ${tableId}`);
  };

  const removeItemFromTable = (tableId: string, itemId: string) => {
    setCafeTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const item = t.items.find((i) => i.id === itemId);
        // Return stock
        if (item) {
          setProducts((prev) =>
            prev.map((p) => (p.id === itemId ? { ...p, stock: p.stock + item.qty } : p))
          );
        }
        return { ...t, items: t.items.filter((i) => i.id !== itemId) };
      })
    );
  };

  const settleTable = (
    tableId: string,
    paymentMethod: 'Cash' | 'Card' | 'Vodafone Cash',
    discount = 0
  ) => {
    const table = cafeTables.find((t) => t.id === tableId);
    if (!table) return { total: 0, items: [], tableName: '' };

    const subtotal = table.items.reduce((s, i) => s + i.price * i.qty, 0);
    const serviceTax = Math.round(subtotal * 0.12);
    const total = Math.max(0, subtotal + serviceTax - discount);

    addAuditLog(
      'Staff',
      'SETTLE_CAFE_TABLE',
      `Settled ${table.name} — Total: ${total} EGP via ${paymentMethod}`
    );

    setCafeTables((prev) =>
      prev.map((t) =>
        t.id !== tableId
          ? t
          : {
              ...t,
              status: 'Available',
              openedAt: null,
              elapsedSeconds: 0,
              items: [],
              customerName: undefined,
              customerPhone: undefined,
            }
      )
    );

    return { total, items: table.items, tableName: table.name };
  };

  const transferTableToSession = (tableId: string, sessionId: string) => {
    const table = cafeTables.find((t) => t.id === tableId);
    if (!table) return;

    table.items.forEach((item) => {
      addCafeOrder(sessionId, item.id, item.qty, item.price);
    });

    setCafeTables((prev) =>
      prev.map((t) =>
        t.id !== tableId
          ? t
          : {
              ...t,
              status: 'Available',
              openedAt: null,
              elapsedSeconds: 0,
              items: [],
              customerName: undefined,
              customerPhone: undefined,
            }
      )
    );

    addAuditLog(
      'Staff',
      'TRANSFER_CAFE_TABLE',
      `Transferred ${table.name} bill to PS session ${sessionId}`
    );
  };

  // ─── Customer CRM Actions ──────────────────────────────────────────────────

  const adjustPoints = (customerId: string, delta: number, reason: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id !== customerId ? c : { ...c, points: Math.max(0, c.points + delta) }))
    );
    addAuditLog(
      currentRole,
      'ADJUST_LOYALTY_POINTS',
      `${delta > 0 ? '+' : ''}${delta} points for customer ${customerId} — ${reason}`
    );
  };

  // ─── Reservation Alert Actions ─────────────────────────────────────────────

  const dismissReservationAlert = (id: string) => {
    setUpcomingAlerts((prev) => prev.filter((a) => a.id !== id));
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'No-Show' as const } : r))
    );
  };

  const snoozeReservationAlert = (id: string) => {
    const snoozeUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
    setUpcomingAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, snoozedUntil: snoozeUntil } : a))
    );
    // Temporarily hide snoozed alerts
    setTimeout(
      () => {
        setUpcomingAlerts((prev) =>
          prev.filter((a) => !(a.id === id && a.snoozedUntil && a.snoozedUntil <= Date.now()))
        );
      },
      5 * 60 * 1000
    );
  };

  const checkInFromAlert = (alert: ReservationAlert) => {
    // Mark reservation as checked in
    setReservations((prev) =>
      prev.map((r) => (r.id === alert.id ? { ...r, status: 'CheckedIn' as const } : r))
    );
    // Open a session
    addSession({
      room: alert.room || `Room-${alert.roomType}`,
      roomType: alert.roomType,
      consoleTier: alert.roomType === 'VIP' ? 'PS5 PRO' : 'PS5 Pro/Slim',
      customer: alert.customerName,
      phone: alert.customerPhone,
      openingStaff: 'Staff (Auto Check-in)',
      startTime: new Date().toLocaleTimeString('en-EG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      isOpenEnded: true,
      hourlyRate: getRate(alert.roomType, 'single'),
      controllers: ['Pad #20', 'Pad #21'],
    });
    // Remove the alert
    setUpcomingAlerts((prev) => prev.filter((a) => a.id !== alert.id));
    addAuditLog(
      'Staff',
      'CHECKIN_FROM_ALERT',
      `Checked in ${alert.customerName} to ${alert.room || alert.roomType}`
    );
  };

  // ─── Extended Operations Logic ──────────────────────────────────────────────

  const writeAuditRecord = (action: string, details: string, prev?: string, next?: string) => {
    const rec: AuditRecord = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user: currentRole === 'owner' ? 'Owner Admin' : currentRole === 'manager' ? 'Hassan N. (Manager)' : 'Omar M. (Staff)',
      role: currentRole,
      action,
      details,
      previousValue: prev,
      newValue: next
    };
    setAuditRecords((prevList) => [rec, ...prevList]);
  };

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const id = `emp-${Date.now()}`;
    const newEmp: Employee = { ...empData, id };
    setEmployees((prev) => [...prev, newEmp]);
    writeAuditRecord('ADD_EMPLOYEE', `Added employee ${empData.name} (${empData.jobTitle})`);
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
    writeAuditRecord('UPDATE_EMPLOYEE', `Updated employee profile for ${emp.name}`, JSON.stringify(emp));
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const clockIn = (employeeId: string, coords: { lat: number; lng: number }) => {
    const branchLat = 30.0444;
    const branchLng = 31.2357;
    const dist = getDistance(coords.lat, coords.lng, branchLat, branchLng);
    const inRange = dist <= 200; // 200 meters radius

    if (!inRange) {
      return { success: false, message: `Check-in failed: You are ${Math.round(dist)}m away from the lounge. Allowed range is 200m.` };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Calculate late minutes if check in is after 08:00 AM
    const checkInHour = parseInt(nowTime.split(':')[0]);
    const checkInMin = parseInt(nowTime.split(':')[1]);
    const expectedHour = 8;
    const expectedMin = 0;
    let lateMin = 0;
    if (checkInHour > expectedHour || (checkInHour === expectedHour && checkInMin > expectedMin)) {
      lateMin = (checkInHour - expectedHour) * 60 + (checkInMin - expectedMin);
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId,
      date: todayStr,
      checkInTime: nowTime,
      checkInCoords: coords,
      inRange: true,
      lateMinutes: lateMin,
      earlyDepartureMinutes: 0,
      totalWorkingHours: 0,
      overtimeHours: 0,
      status: lateMin > 5 ? 'Late' : 'Present',
      verifiedLocation: `Verified Lounge Range (${Math.round(dist)}m)`
    };

    setAttendanceRecords((prev) => [...prev, newRecord]);
    
    if (lateMin > 5) {
      createActionAlert('Late Employee', 'Warning', `${employees.find(e => e.id === employeeId)?.name || 'Employee'} arrived ${lateMin} mins late today.`, newRecord.id);
    }

    writeAuditRecord('CLOCK_IN', `Employee ${employeeId} clocked in at ${nowTime} (Late: ${lateMin}m)`);
    return { success: true, message: `Successfully clocked in! Verified in range.` };
  };

  const clockOut = (employeeId: string, coords: { lat: number; lng: number }) => {
    const branchLat = 30.0444;
    const branchLng = 31.2357;
    const dist = getDistance(coords.lat, coords.lng, branchLat, branchLng);
    const inRange = dist <= 200;

    if (!inRange) {
      return { success: false, message: `Check-out failed: You are ${Math.round(dist)}m away from the lounge. Please verify location.` };
    }

    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    setAttendanceRecords((prev) => prev.map((rec) => {
      if (rec.employeeId !== employeeId || rec.checkOutTime) return rec;

      const inH = parseInt(rec.checkInTime.split(':')[0]);
      const inM = parseInt(rec.checkInTime.split(':')[1]);
      const outH = parseInt(nowTime.split(':')[0]);
      const outM = parseInt(nowTime.split(':')[1]);
      const workingHours = parseFloat(((outH * 60 + outM - (inH * 60 + inM)) / 60).toFixed(2));
      
      const expectedHours = 8;
      const overtime = Math.max(0, workingHours - expectedHours);

      return {
        ...rec,
        checkOutTime: nowTime,
        checkOutCoords: coords,
        totalWorkingHours: workingHours,
        overtimeHours: overtime,
      };
    }));

    writeAuditRecord('CLOCK_OUT', `Employee ${employeeId} clocked out at ${nowTime}`);
    return { success: true, message: `Successfully clocked out! Verified in range.` };
  };

  const addManualAttendanceCorrection = (employeeId: string, date: string, checkInTime: string, checkOutTime: string, reason: string) => {
    const inH = parseInt(checkInTime.split(':')[0]);
    const inM = parseInt(checkInTime.split(':')[1]);
    const outH = parseInt(checkOutTime.split(':')[0]);
    const outM = parseInt(checkOutTime.split(':')[1]);
    const workingHours = parseFloat(((outH * 60 + outM - (inH * 60 + inM)) / 60).toFixed(2));

    const rec: AttendanceRecord = {
      id: `att-manual-${Date.now()}`,
      employeeId,
      date,
      checkInTime,
      checkOutTime,
      checkInCoords: { lat: 30.0444, lng: 31.2357 },
      checkOutCoords: { lat: 30.0444, lng: 31.2357 },
      inRange: true,
      lateMinutes: 0,
      earlyDepartureMinutes: 0,
      totalWorkingHours: workingHours,
      overtimeHours: Math.max(0, workingHours - 8),
      status: 'Present',
      verifiedLocation: 'Manual Correction (Admin)'
    };

    setAttendanceRecords((prev) => {
      // Remove any existing record for this employee and date
      const filtered = prev.filter(r => !(r.employeeId === employeeId && r.date === date));
      return [...filtered, rec];
    });

    writeAuditRecord('ATTENDANCE_CORRECTION', `Manual attendance correction for ${employeeId} on ${date}. Reason: ${reason}`);
  };

  const openShift = (assignedEmployeeIds: string[], openingCash: number) => {
    const newShift: Shift = {
      id: `sh-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Active',
      startTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      assignedEmployeeIds,
      openingCash,
      sessionsHandledCount: 0,
      salesCount: 0,
      revenue: 0,
      expenses: 0,
      withdrawals: 0
    };

    setShifts((prev) => [...prev, newShift]);
    recordCashTransaction('In', openingCash, 'Shift Open', newShift.id, `Opening Cash Float for Shift #${newShift.id}`);
    writeAuditRecord('SHIFT_OPEN', `Shift opened with opening float of ${openingCash} EGP`);
  };

  const closeShift = (shiftId: string, closingData: ShiftClosingData) => {
    setShifts((prev) => prev.map((s) => {
      if (s.id !== shiftId) return s;
      return {
        ...s,
        status: 'Pending Review',
        endTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        closingData
      };
    }));

    if (closingData.difference !== 0) {
      createActionAlert('Cash Discrepancy', 'Critical', `Shift #${shiftId} has a cash discrepancy of ${closingData.difference} EGP.`, shiftId);
    }

    const hasInventoryDiff = closingData.inventoryCounts.some(c => c.diff !== 0);
    if (hasInventoryDiff) {
      createActionAlert('Inventory Discrepancy', 'Warning', `Shift #${shiftId} completed with inventory discrepancies.`, shiftId);
    }

    writeAuditRecord('SHIFT_CLOSE_SUBMIT', `Shift #${shiftId} submitted for review with difference: ${closingData.difference} EGP`);
  };

  const approveShift = (shiftId: string) => {
    const managerName = currentRole === 'owner' ? 'Owner Admin' : 'Hassan N. (Manager)';
    setShifts((prev) => prev.map((s) => {
      if (s.id !== shiftId) return s;
      return {
        ...s,
        status: 'Closed',
        approvedBy: managerName,
        approvedAt: new Date().toISOString()
      };
    }));

    // Resolve unclosed shift alerts
    setActionAlerts(prev => prev.map(a => a.referenceId === shiftId ? { ...a, resolved: true } : a));

    writeAuditRecord('SHIFT_APPROVE', `Shift #${shiftId} approved and closed by ${managerName}`);
  };

  const requestWithdrawal = (employeeId: string, amount: number, reason: string) => {
    const activeShift = shifts.find(s => s.status === 'Active');
    const withdrawal: EmployeeWithdrawal = {
      id: `wth-${Date.now()}`,
      employeeId,
      amount,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      reason,
      shiftId: activeShift ? activeShift.id : 'sh-1',
      requestedBy: 'Staff Cashier',
      status: 'Pending'
    };

    setWithdrawals((prev) => [...prev, withdrawal]);
    createActionAlert('Withdrawal Pending', 'Warning', `${employees.find(e => e.id === employeeId)?.name || 'Employee'} requested a withdrawal of ${amount} EGP.`, withdrawal.id);
    writeAuditRecord('WITHDRAWAL_REQUEST', `Employee ${employeeId} requested ${amount} EGP advance.`);
  };

  const approveWithdrawal = (withdrawalId: string) => {
    const managerName = currentRole === 'owner' ? 'Owner Admin' : 'Hassan N. (Manager)';
    setWithdrawals((prev) => prev.map((w) => {
      if (w.id !== withdrawalId) return w;
      
      // Update shift cash totals & record cash transactions
      setShifts(shiftsList => shiftsList.map(s => {
        if (s.id !== w.shiftId) return s;
        return { ...s, withdrawals: s.withdrawals + w.amount };
      }));

      recordCashTransaction('Out', w.amount, 'Withdrawal', w.id, `Approved advance withdrawal for ${w.employeeId}`);

      return {
        ...w,
        status: 'Approved',
        approvedBy: managerName
      };
    }));

    setActionAlerts(prev => prev.map(a => a.referenceId === withdrawalId ? { ...a, resolved: true } : a));
    writeAuditRecord('WITHDRAWAL_APPROVE', `Advance withdrawal #${withdrawalId} approved by ${managerName}`);
  };

  const addExpense = (expData: Omit<Expense, 'id' | 'status'>) => {
    const activeShift = shifts.find(s => s.status === 'Active');
    const newExpense: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      shiftId: activeShift ? activeShift.id : 'sh-1',
      status: 'Pending'
    };

    setExpenses((prev) => [...prev, newExpense]);
    createActionAlert('Expense Pending', 'Info', `New pending expense for ${expData.category}: ${expData.amount} EGP.`, newExpense.id);
    writeAuditRecord('EXPENSE_ADD', `Added pending expense of ${expData.amount} EGP for ${expData.category}`);
  };

  const approveExpense = (expenseId: string) => {
    const managerName = currentRole === 'owner' ? 'Owner Admin' : 'Hassan N. (Manager)';
    setExpenses((prev) => prev.map((e) => {
      if (e.id !== expenseId) return e;

      setShifts(shiftsList => shiftsList.map(s => {
        if (s.id !== e.shiftId) return s;
        return { ...s, expenses: s.expenses + e.amount };
      }));

      recordCashTransaction('Out', e.amount, 'Expense', e.id, `${e.category}: ${e.description}`);

      return {
        ...e,
        status: 'Approved',
        approvedBy: managerName
      };
    }));

    setActionAlerts(prev => prev.map(a => a.referenceId === expenseId ? { ...a, resolved: true } : a));
    writeAuditRecord('EXPENSE_APPROVE', `Approved expense #${expenseId} by ${managerName}`);
  };

  const recordCashTransaction = (type: 'In' | 'Out', amount: number, source: CashTransaction['source'], referenceId: string, description: string) => {
    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      amount,
      source,
      referenceId,
      actorId: currentRole === 'owner' ? 'emp-3' : 'emp-1',
      description,
      runningBalance: type === 'In' ? cashOnHand + amount : cashOnHand - amount
    };
    setCashTransactions((prev) => [newTx, ...prev]);
  };

  const recordInventoryMovement = (productId: string, qty: number, type: InventoryMovement['type'], reason: string) => {
    const activeShift = shifts.find(s => s.status === 'Active');
    const move: InventoryMovement = {
      id: `inv-${Date.now()}`,
      productId,
      qty,
      type,
      user: currentRole === 'owner' ? 'Owner Admin' : 'Staff Cashier',
      timestamp: new Date().toISOString(),
      shiftId: activeShift ? activeShift.id : 'sh-1',
      reason
    };
    setInventoryMovements((prev) => [move, ...prev]);
    
    // Dynamically adjust inventory stock
    setProducts((prevProd) => prevProd.map(p => {
      if (p.id !== productId) return p;
      const nextStock = p.stock + qty;
      
      // Auto trigger low stock alert
      if (nextStock < 15) {
        createActionAlert('Low Stock', 'Warning', `${p.name} stock is low (${nextStock} units remaining).`, productId);
      }
      return { ...p, stock: nextStock };
    }));
  };

  const createActionAlert = (type: ActionAlert['type'], severity: ActionAlert['severity'], message: string, referenceId: string) => {
    const newAlert: ActionAlert = {
      id: `al-${Date.now()}`,
      type,
      severity,
      message,
      referenceId,
      resolved: false,
      createdAt: new Date().toISOString()
    };
    setActionAlerts((prev) => [newAlert, ...prev]);
  };

  const resolveActionAlert = (alertId: string) => {
    setActionAlerts((prev) => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
  };

  const calculatePayroll = (month: number, year: number) => {
    const periodId = `${year}-${String(month).padStart(2, '0')}`;
    
    const items = employees.map(emp => {
      const basic = emp.baseSalary;
      const empAttendance = attendanceRecords.filter(r => r.employeeId === emp.id && r.date.startsWith(periodId));
      
      const present = empAttendance.filter(r => r.status === 'Present' || r.status === 'Late').length;
      const lateMinutes = empAttendance.reduce((sum, r) => sum + r.lateMinutes, 0);
      const overtime = empAttendance.reduce((sum, r) => sum + r.overtimeHours, 0);
      const overtimePay = Math.round(overtime * ((emp.baseSalary / 26 / 8) * 1.5));
      
      const absenceDeduction = Math.max(0, (26 - present) * (emp.baseSalary / 26));
      const lateDeduction = Math.round(lateMinutes * 1.5); // 1.5 EGP per late minute
      
      const empWithdrawals = withdrawals.filter(w => w.employeeId === emp.id && w.date.startsWith(periodId) && w.status === 'Approved');
      const advances = empWithdrawals.reduce((sum, w) => sum + w.amount, 0);

      const netSalary = Math.round(basic + overtimePay - absenceDeduction - lateDeduction - advances);

      return {
        id: `payitem-${emp.id}-${periodId}`,
        employeeId: emp.id,
        basicSalary: basic,
        workingDays: 26,
        presentDays: present,
        absentDays: Math.max(0, 26 - present),
        lateMinutes,
        overtimeHours: overtime,
        overtimePay,
        bonuses: 0,
        commissions: 0,
        advances,
        deductions: Math.round(absenceDeduction + lateDeduction),
        netSalary,
        status: 'Unpaid' as const
      };
    });

    const newPeriod: PayrollPeriod = {
      id: periodId,
      startDate: `${periodId}-01`,
      endDate: `${periodId}-28`,
      status: 'Draft',
      items
    };

    setPayrollPeriods((prev) => {
      const filtered = prev.filter(p => p.id !== periodId);
      return [...filtered, newPeriod];
    });

    createActionAlert('Payroll Pending', 'Info', `Payroll calculations for ${periodId} are ready for review.`, periodId);
    writeAuditRecord('PAYROLL_CALCULATE', `Generated monthly payroll draft for period ${periodId}`);
  };

  const payPayrollItem = (periodId: string, employeeId: string, paymentMethod: string) => {
    setPayrollPeriods((prev) => prev.map((period) => {
      if (period.id !== periodId) return period;
      return {
        ...period,
        items: period.items.map(item => {
          if (item.employeeId !== employeeId) return item;
          
          recordCashTransaction('Out', item.netSalary, 'Salaries', item.id, `Paid Net Salary to ${employeeId} via ${paymentMethod}`);
          return {
            ...item,
            status: 'Paid',
            paidAt: new Date().toISOString(),
            paymentMethod
          };
        })
      };
    }));

    writeAuditRecord('PAYROLL_PAY_ITEM', `Paid employee ${employeeId} payroll for period ${periodId}`);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setRole,
        sessions,
        products,
        controllers,
        lostFoundItems,
        reservations,
        waitingList,
        auditLogs,
        alerts,
        // Café Tables
        cafeTables,
        openCafeTable,
        closeCafeTable,
        addItemToTable,
        removeItemFromTable,
        reserveCafeTable,
        settleTable,
        transferTableToSession,
        // Customers CRM
        customers,
        adjustPoints,
        // Reservation Alerts
        upcomingAlerts,
        dismissReservationAlert,
        snoozeReservationAlert,
        checkInFromAlert,
        // PS Session Actions
        addSession,
        extendSession,
        convertToOpenEnded,
        togglePauseSession,
        switchSessionMode,
        addCafeOrder,
        voidCafeItem,
        checkoutSession,
        logFoundItem,
        logLostTicket,
        claimLostItem,
        assignRoomFromWaitlist,
        updateProductPrice,
        updateProductStock,
        updateControllerStatus,
        triggerProfitIntegrityAlert,
        dismissAlert,
        language,
        setLanguage,

        // ─── Extended Operations Properties
        employees,
        addEmployee,
        updateEmployee,
        attendanceRecords,
        clockIn,
        clockOut,
        addManualAttendanceCorrection,
        shifts,
        openShift,
        closeShift,
        approveShift,
        withdrawals,
        requestWithdrawal,
        approveWithdrawal,
        expenses,
        addExpense,
        approveExpense,
        cashTransactions,
        recordCashTransaction,
        cashOnHand,
        payrollPeriods,
        calculatePayroll,
        payPayrollItem,
        inventoryMovements,
        recordInventoryMovement,
        actionAlerts,
        createActionAlert,
        resolveActionAlert,
        auditRecords,
        writeAuditRecord,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
