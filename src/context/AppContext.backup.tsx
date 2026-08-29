'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserRole,
  LiveSession,
  Product,
  Controller,
  LostFoundItem,
  Reservation,
  AuditLog,
  SessionProduct,
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

  // Actions
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
    if (!product) return { success: false, message: 'Product not found' };

    // Check stock
    if (product.stock < qty) {
      return { success: false, message: `Insufficient stock. Only ${product.stock} left.` };
    }

    const sellPrice = manualPrice !== undefined ? manualPrice : product.sellingPrice;

    // Check profit margin: Margin = (Sell - Cost) / Sell
    const cost = product.costPrice;
    const profitMargin = sellPrice > 0 ? (sellPrice - cost) / sellPrice : 0;

    if (profitMargin < product.minProfitMargin) {
      const msg = `Profit Warning: ${product.name} sold at EGP ${sellPrice} (Margin ${Math.round(profitMargin * 100)}% is below target ${Math.round(product.minProfitMargin * 100)}%).`;
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
      alert('Restricted Action: Manager authorization required to void billed items.');
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
        message: 'Unauthorized: Owner or Manager level required to edit base prices.',
      };
    }

    const prod = products.find((p) => p.id === productId);
    if (!prod) return { success: false, message: 'Product not found.' };

    const cost = prod.costPrice;
    const profitMargin = (newPrice - cost) / newPrice;

    if (profitMargin < prod.minProfitMargin) {
      const msg = `Base Price Override Warning: ${prod.name} selling price updated to EGP ${newPrice} resulting in a profit margin of ${Math.round(profitMargin * 100)}% (Below standard ${Math.round(prod.minProfitMargin * 100)}%).`;
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
