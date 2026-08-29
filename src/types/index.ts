export type UserRole = 'owner' | 'manager' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  loyaltyPoints: number;
  missedReservationsCount: number;
}

export interface SessionProduct {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  qty: number;
}

export interface SessionModeTransition {
  timestamp: string; // ISO string
  mode: 'single' | 'multi';
  ratePerHour: number;
}

export interface LiveSession {
  id: string;
  room: string;
  roomType: 'Standard' | 'Premium' | 'VIP';
  consoleTier: string; // e.g. PS5 PRO, XBOX SERIES X
  customer: string;
  phone: string;
  customerId?: string; // empty if quick walk-in
  openingStaff: string;
  openingTimestamp: string; // ISO string
  startTime: string; // e.g. "14:30"
  game?: string; // e.g. "FC 26"
  elapsedSeconds: number; // to track precise ticking
  durationMinutes?: number; // undefined means open-ended
  isOpenEnded: boolean;
  hourlyRate: number;
  runningBill: number;
  products: SessionProduct[];
  status: 'active' | 'paused';
  controllers: string[]; // e.g. ["Pad #1", "Pad #2"]
  modeHistory: SessionModeTransition[];
}

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minProfitMargin: number; // e.g. 0.30 for 30%
}

export interface Controller {
  id: string; // e.g. "Pad #1"
  status: 'Good' | 'Stick Drift' | 'Broken Buttons' | 'Under Repair / Checkup';
  currentRoomId?: string;
  lastInspectedAt?: string;
}

export interface LostFoundItem {
  id: string;
  roomName: string;
  description: string;
  dateFound: string; // ISO string or simple date
  suggestedCustomerId?: string;
  suggestedCustomerName?: string;
  suggestedCustomerPhone?: string;
  status: 'Found' | 'Claimed' | 'Returned';
  notificationSent: boolean;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  dateTime: string;
  roomType: 'Standard' | 'Premium' | 'VIP';
  customerHistoryNotes: string;
  status: 'Confirmed' | 'Pending' | 'No-Show' | 'CheckedIn';
  previousNoShowFlag: boolean;
  assignedRoom?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
}

// ─── Café Table Types ─────────────────────────────────────────────────────────

export interface CafeTableItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export type CafeTableStatus = 'Available' | 'Occupied' | 'Reserved';

export interface CafeTable {
  id: string;
  name: string;
  status: CafeTableStatus;
  items: CafeTableItem[];
  openedAt: string | null;
  elapsedSeconds: number;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  seatChargePerHour: number; // 0 = informational only
}

// ─── Customer CRM Types ───────────────────────────────────────────────────────

export type LoyaltyTier = 'Platinum' | 'Gold' | 'Silver' | 'Bronze';

export interface CustomerHistoryEntry {
  date: string;
  action: string;
  amount: number;
}

export interface CustomerLostItem {
  desc: string;
  date: string;
  status: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: LoyaltyTier;
  visits: number;
  spent: number;
  lastVisit: string;
  points: number;
  history: CustomerHistoryEntry[];
  lostItems: CustomerLostItem[];
}

// ─── Reservation Alert Type ───────────────────────────────────────────────────

export interface ReservationAlert {
  id: string;
  customerName: string;
  customerPhone: string;
  scheduledTime: string;
  room?: string;
  roomType: 'Standard' | 'Premium' | 'VIP';
  minutesAway: number;
  snoozedUntil?: number;
}

// ─── Extended HR, Shift, Cash & Payroll Types ─────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  jobTitle: string;
  department: string;
  hireDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  baseSalary: number;
  salaryType: 'Monthly' | 'Hourly';
  workingDays?: number; // e.g. 26 days/month expected
  workingHours?: number; // e.g. 8 hours/day expected
  assignedShiftId?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  checkInCoords: { lat: number; lng: number };
  checkOutCoords?: { lat: number; lng: number };
  inRange: boolean;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  totalWorkingHours: number;
  overtimeHours: number;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  verifiedLocation: string;
}

export type ShiftStatus = 'Scheduled' | 'Open' | 'Active' | 'Closing' | 'Pending Review' | 'Closed';

export interface ShiftClosingData {
  openingCash: number;
  cashSales: number;
  otherIncome: number;
  expensesPaid: number;
  withdrawalsPaid: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  explanation?: string;
  inventoryCounts: { productId: string; expected: number; actual: number; diff: number }[];
  hardwareStatusConfirmed: boolean;
  notes?: string;
}

export interface Shift {
  id: string;
  date: string;
  status: ShiftStatus;
  startTime: string;
  endTime?: string;
  assignedEmployeeIds: string[];
  managerId?: string;
  openingCash: number;
  closingData?: ShiftClosingData;
  sessionsHandledCount: number;
  salesCount: number;
  revenue: number;
  expenses: number;
  withdrawals: number;
  approvedBy?: string;
  approvedAt?: string;
}

export interface EmployeeWithdrawal {
  id: string;
  employeeId: string;
  amount: number;
  date: string;
  time: string;
  reason: string;
  shiftId: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected' | 'Deducted';
}

export interface Expense {
  id: string;
  amount: number;
  category: 'Maintenance' | 'Electricity' | 'Internet' | 'Cleaning' | 'Supplies' | 'Inventory purchase' | 'Transportation' | 'Salaries' | 'Other';
  description: string;
  date: string;
  employeeId: string;
  shiftId: string;
  paymentMethod: 'Cash' | 'Card' | 'Vodafone Cash';
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
}

export interface CashTransaction {
  id: string;
  timestamp: string;
  type: 'In' | 'Out';
  amount: number;
  source: 'Gaming Session' | 'Cafe POS' | 'Expense' | 'Withdrawal' | 'Manual' | 'Shift Open' | 'Shift Settle';
  referenceId: string;
  actorId: string;
  description: string;
  runningBalance: number;
}

export interface PayrollPeriod {
  id: string; // e.g. "2026-08"
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Calculated' | 'Reviewed' | 'Approved' | 'Paid';
  items: PayrollItem[];
  approvedBy?: string;
  approvedAt?: string;
}

export interface PayrollItem {
  id: string;
  employeeId: string;
  basicSalary: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  lateMinutes: number;
  overtimeHours: number;
  overtimePay: number;
  bonuses: number;
  commissions: number;
  advances: number;
  deductions: number;
  netSalary: number;
  status: 'Unpaid' | 'Paid';
  paidAt?: string;
  paymentMethod?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  qty: number; // positive for stock-in, negative for stock-out
  type: 'Purchase' | 'Sale' | 'Adjustment' | 'Wastage' | 'Damaged' | 'Transfer';
  user: string;
  timestamp: string;
  shiftId: string;
  reason: string;
}

export interface ActionAlert {
  id: string;
  type: 'Cash Discrepancy' | 'Inventory Discrepancy' | 'Unclosed Shift' | 'Payroll Pending' | 'Expense Pending' | 'Withdrawal Pending' | 'Low Stock' | 'Hardware Issue' | 'Late Employee';
  severity: 'Critical' | 'Warning' | 'Info';
  message: string;
  referenceId: string;
  resolved: boolean;
  createdAt: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

