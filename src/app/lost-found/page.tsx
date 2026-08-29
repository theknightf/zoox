'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import { PackageSearch, Plus, Send, Check, CheckCircle2, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';

const ROOMS_LIST = [
  'Room VIP-1',
  'Room VIP-2',
  'Room 3',
  'Room 4',
  'Room 5',
  'Room 6',
  'Room 7',
  'Room 8',
  'Room 9',
  'Room 10',
  'Room 11',
  'Room 12',
  'Billiards Table 1',
  'Billiards Table 2',
  'Billiards Table 3',
  'Café',
];

export default function LostFoundPage() {
  const {
    currentRole,
    lostFoundItems,
    logFoundItem,
    logLostTicket,
    claimLostItem,
    sessions,
    auditLogs,
  } = useApp();
  const { t } = useTranslation();

  // Staff found logging form
  const [roomName, setRoomName] = useState('Room VIP-1');
  const [description, setDescription] = useState('');

  // Customer lost form
  const [custDescription, setCustDescription] = useState('');
  const [custRoom, setCustRoom] = useState('Room 3');
  const [custName, setCustName] = useState('Mohamed Khalil');
  const [custPhone, setCustPhone] = useState('0100-123-4521');

  // Auto-suggest logic based on selected room
  // Checks active sessions first, then suggestions from completed checkouts in audit logs
  let suggestedName = 'Mohamed Khalil';
  let suggestedPhone = '0100-123-4521';

  const activeMatch = sessions.find((s) => s.room === roomName);
  if (activeMatch) {
    suggestedName = activeMatch.customer;
    suggestedPhone = activeMatch.phone;
  } else {
    // Find the last checkout for this room in audit logs
    const completedMatch = auditLogs
      ?.slice()
      .reverse()
      .find((log) => log.action === 'CHECKOUT_SESSION' && log.details.includes(roomName));
    if (completedMatch) {
      const matchName = completedMatch.details.match(/Checked out session for (.+?) in/);
      if (matchName && matchName[1]) {
        suggestedName = matchName[1];
        suggestedPhone = '0115-321-3312'; // Matched phone reference
      }
    }
  }

  const handleLogFoundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error(t('Please enter item description.'));
      return;
    }
    logFoundItem(roomName, description);
    setDescription('');
    toast.success(`${t('Logged found item! Suggested owner:')} ${suggestedName}`);
  };

  const handleCustomerClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custDescription.trim()) {
      toast.error(t('Please describe what you lost.'));
      return;
    }
    logLostTicket(custDescription, custRoom, custName, custPhone);
    setCustDescription('');
    toast.success(t('Lost item ticket submitted to support staff.'));
  };

  const triggerWhatsApp = (phone: string, customer: string, desc: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('01')
      ? `20${cleanPhone.substring(1)}`
      : cleanPhone;
    const textMsg = `${t('Hi')} ${customer}${t(', this is Zoox Gaming Cafe. We found your lost item:')} "${desc}"${t('. It is safe at our front counter. Please present your ID to claim it during your next visit!')}`;
    const encoded = encodeURIComponent(textMsg);
    window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encoded}`, '_blank');
    toast.success(t('WhatsApp alert generated.'));
  };

  return (
    <AppLayout currentPath="/lost-found">
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('Smart Lost & Found Hub')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('Log found items, notify suggested guests via WhatsApp, or submit lost claims.')}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Form Column */}
          <div className="xl:col-span-1 space-y-6">
            {currentRole !== 'customer' ? (
              <div className="card-base p-5 space-y-4">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Plus size={16} className="text-primary" />
                  {t('Log Found Item (Staff)')}
                </h2>

                <form onSubmit={handleLogFoundSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      {t('Found Room / Table')}
                    </label>
                    <select
                      className="input-field"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      required
                    >
                      {ROOMS_LIST.map((room) => (
                        <option key={room} value={room}>
                          {room}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      {t('Item Description')}
                    </label>
                    <textarea
                      className="input-field min-h-20"
                      placeholder={t('e.g. Red iPhone 14 with black casing')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  {/* Smart Auto-Suggest Panel */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-2">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      💡 {t('Smart Owner Suggestion')}
                    </p>
                    <p className="text-xs text-foreground">
                      {t('Last playing in')} <strong>{roomName}</strong>:
                    </p>
                    <div className="text-xs bg-card p-2 rounded border border-border">
                      <p className="font-bold text-foreground">{suggestedName}</p>
                      <p className="text-muted-foreground">{suggestedPhone}</p>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary w-full py-2.5">
                    {t('Log found item')}
                  </button>
                </form>
              </div>
            ) : (
              <div className="card-base p-5 space-y-4">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Ticket size={16} className="text-accent" />
                  {t('Submit Lost Claim (Client)')}
                </h2>

                <form onSubmit={handleCustomerClaimSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">{t('Name')}</label>
                    <input
                      type="text"
                      className="input-field"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      {t('Phone Number')}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      {t('Approximate Room / Couch')}
                    </label>
                    <select
                      className="input-field"
                      value={custRoom}
                      onChange={(e) => setCustRoom(e.target.value)}
                      required
                    >
                      {ROOMS_LIST.map((room) => (
                        <option key={room} value={room}>
                          {room}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      {t('Describe Lost Item')}
                    </label>
                    <textarea
                      className="input-field min-h-20"
                      placeholder={t('Color, brand, special marks...')}
                      value={custDescription}
                      onChange={(e) => setCustDescription(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full bg-accent hover:opacity-90 border-accent py-2.5"
                  >
                    {t('Submit ticket')}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* List Column */}
          <div className="xl:col-span-2 card-base p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {t('Lost & Found Logs')}
            </h2>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase font-bold">
                    <th className="py-2.5 px-2">{t('Date')}</th>
                    <th className="py-2.5 px-2">{t('Location')}</th>
                    <th className="py-2.5 px-2">{t('Description')}</th>
                    <th className="py-2.5 px-2">{t('Suggested Owner')}</th>
                    <th className="py-2.5 px-2">{t('Status')}</th>
                    <th className="py-2.5 px-2 text-right">{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {lostFoundItems.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/10">
                      <td className="py-3 px-2 font-mono text-muted-foreground">
                        {new Date(item.dateFound).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 font-bold text-foreground">{item.roomName}</td>
                      <td className="py-3 px-2 font-medium text-foreground/90 max-w-xs truncate">
                        {item.description}
                      </td>
                      <td className="py-3 px-2">
                        {item.suggestedCustomerName ? (
                          <div>
                            <p className="font-semibold text-foreground">
                              {item.suggestedCustomerName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {item.suggestedCustomerPhone}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">{t('Anonymous')}</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.status === 'Returned'
                              ? 'bg-accent/10 border-accent/20 text-accent'
                              : 'bg-warning/10 border-warning/20 text-warning'
                          }`}
                        >
                          {t(item.status)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right space-x-1.5 whitespace-nowrap">
                        {item.status !== 'Returned' && (
                          <>
                            {currentRole !== 'customer' && item.suggestedCustomerPhone && (
                              <button
                                onClick={() =>
                                  triggerWhatsApp(
                                    item.suggestedCustomerPhone!,
                                    item.suggestedCustomerName || 'Guest',
                                    item.description
                                  )
                                }
                                className="px-2.5 py-1 bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 rounded font-bold text-[10px] inline-flex items-center gap-1"
                              >
                                <Send size={10} />
                                {t('WhatsApp Alert')}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                claimLostItem(item.id);
                                toast.success(t('Item marked as claimed.'));
                              }}
                              className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 rounded font-bold text-[10px] inline-flex items-center gap-1"
                            >
                              <Check size={10} />
                              {t('Handover Item')}
                            </button>
                          </>
                        )}
                        {item.status === 'Returned' && (
                          <span className="text-muted-foreground italic text-[11px] inline-flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-accent" /> {t('Returned')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
