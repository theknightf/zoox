'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import {
  MapPin, Clock, CheckCircle, AlertTriangle, Users,
  PlusCircle, RefreshCw, Star, Play, Settings, Navigation
} from 'lucide-react';
import { toast } from 'sonner';

export default function AttendancePage() {
  const {
    currentRole,
    employees,
    attendanceRecords,
    clockIn,
    clockOut,
    addManualAttendanceCorrection
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('emp-1');
  
  const [coords, setCoords] = useState(null);
  const [simulateOnSite, setSimulateOnSite] = useState(true);
  const [distance, setDistance] = useState(0);

  const [corrStaffId, setCorrStaffId] = useState('emp-1');
  const [corrDate, setCorrDate] = useState(new Date().toISOString().split('T')[0]);
  const [corrCheckIn, setCorrCheckIn] = useState('08:00');
  const [corrCheckOut, setCorrCheckOut] = useState('17:00');
  const [corrReason, setCorrReason] = useState('');

  const LOUNGE_LAT = 30.0444;
  const LOUNGE_LNG = 31.2357;

  useEffect(() => {
    if (simulateOnSite) {
      setCoords({ lat: LOUNGE_LAT, lng: LOUNGE_LNG });
      setDistance(0);
    } else {
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setCoords({ lat: latitude, lng: longitude });
            const R = 6371e3;
            const dLat = (LOUNGE_LAT - latitude) * Math.PI / 180;
            const dLon = (LOUNGE_LNG - longitude) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(latitude * Math.PI / 180) * Math.cos(LOUNGE_LAT * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            setDistance(R * c);
          },
          (err) => {
            toast.error("Unable to retrieve GPS coordinates. Auto fallback to Simulated Coordinates.");
            setSimulateOnSite(true);
          }
        );
      }
    }
  }, [simulateOnSite]);

  const handleCheckIn = () => {
    if (!coords) {
      toast.error('Location coordinates are not ready.');
      return;
    }
    setLoading(true);
    const res = clockIn(selectedStaffId, coords);
    setLoading(false);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleCheckOut = () => {
    if (!coords) return;
    setLoading(true);
    const res = clockOut(selectedStaffId, coords);
    setLoading(false);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleCorrectionSubmit = (e) => {
    e.preventDefault();
    if (currentRole !== 'owner' && currentRole !== 'manager') {
      toast.error('Restricted access.');
      return;
    }
    if (!corrReason.trim()) {
      toast.error('Correction reason is required.');
      return;
    }
    addManualAttendanceCorrection(corrStaffId, corrDate, corrCheckIn, corrCheckOut, corrReason);
    toast.success('Attendance records corrected.');
    setCorrReason('');
  };

  const activeRecord = attendanceRecords.find(r => r.employeeId === selectedStaffId && !r.checkOutTime);
  const completedRecord = attendanceRecords.find(r => r.employeeId === selectedStaffId && r.checkOutTime);

  return (
    <AppLayout currentPath="/attendance">
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary"><MapPin size={18} /></span>
            GPS Attendance System
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Clock in/out verified within configured branch geofence radius.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-1 bg-[#0B0F19] border border-[#1F293D] p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={15} className="text-primary" /> Clock Station
              </h2>
              <button
                onClick={() => setSimulateOnSite(!simulateOnSite)}
                className={"px-2 py-0.5 rounded text-[8px] font-bold border transition-colors " + (simulateOnSite ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 border-white/10 text-slate-300")}
              >
                {simulateOnSite ? 'Simulating On-Site' : 'Using Real GPS'}
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-bold uppercase">Active Employee</label>
              <select
                className="input-field py-2 w-full text-xs"
                value={selectedStaffId}
                onChange={e => setSelectedStaffId(e.target.value)}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.jobTitle})</option>
                ))}
              </select>
            </div>

            <div className="bg-[#131722] border border-[#1F293D] p-4 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Navigation size={12} className="text-primary" /> Location status
              </span>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Geofence Range</span>
                <span className={"px-2 py-0.5 rounded text-[9px] font-bold border " + (distance !== null && distance <= 200 ? "text-primary bg-primary/10 border-primary/20" : "text-red-400 bg-red-500/10 border-red-500/20")}>
                  {distance !== null && distance <= 200 ? 'IN RANGE (<=200m)' : "OUT OF RANGE (" + Math.round(distance || 0) + "m)"}
                </span>
              </div>

              {coords && (
                <p className="text-[9px] text-muted-foreground font-mono leading-none pt-1">
                  Verified Coordinates: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                </p>
              )}
            </div>

            <div className="space-y-2 pt-2">
              {!activeRecord ? (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="w-full py-3 bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,255,163,0.1)]"
                >
                  Check In (Start Shift)
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  Check Out (End Shift)
                </button>
              )}

              {activeRecord && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-center text-xs text-primary font-bold">
                  Active check-in record since {activeRecord.checkInTime}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-[#0B0F19] border border-[#1F293D] rounded-2xl overflow-hidden p-5 space-y-4">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users size={15} className="text-primary" /> Live Attendance Board
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1F293D] text-muted-foreground uppercase text-[10px] tracking-wider">
                      <th className="py-2 px-2 font-bold">Employee</th>
                      <th className="py-2 px-2 font-bold">Date</th>
                      <th className="py-2 px-2 font-bold">Check In</th>
                      <th className="py-2 px-2 font-bold">Check Out</th>
                      <th className="py-2 px-2 font-bold">Work Hours</th>
                      <th className="py-2 px-2 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F293D]/50">
                    {attendanceRecords.length === 0 ? (
                      <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No logs recorded today.</td></tr>
                    ) : (
                      attendanceRecords.map(rec => {
                        const emp = employees.find(e => e.id === rec.employeeId);
                        return (
                          <tr key={rec.id} className="hover:bg-white/[0.025]">
                            <td className="py-3 px-2">
                              <p className="font-bold text-white">{emp ? emp.name : 'Unknown Employee'}</p>
                              <p className="text-[9px] text-muted-foreground font-mono">{rec.verifiedLocation}</p>
                            </td>
                            <td className="py-3 px-2 font-mono text-muted-foreground">{rec.date}</td>
                            <td className="py-3 px-2 font-mono text-white">{rec.checkInTime}</td>
                            <td className="py-3 px-2 font-mono text-white">{rec.checkOutTime || '--:--'}</td>
                            <td className="py-3 px-2 font-mono text-slate-300">{rec.totalWorkingHours ? rec.totalWorkingHours + " hrs" : 'Running...'}</td>
                            <td className="py-3 px-2 text-right">
                              <span className={"px-2 py-0.5 rounded text-[9px] font-bold border " + (rec.status === 'Present' ? "text-primary bg-primary/10 border-primary/20" : rec.status === 'Late' ? "text-warning bg-warning/10 border-warning/20" : "text-red-400 bg-red-500/10 border-red-500/20")}>
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {(currentRole === 'owner' || currentRole === 'manager') && (
              <form onSubmit={handleCorrectionSubmit} className="bg-[#0B0F19] border border-[#1F293D] p-5 rounded-2xl space-y-4">
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <PlusCircle size={15} className="text-primary" /> Log Missing Attendance Correction
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Staff</label>
                    <select className="input-field py-1.5 w-full text-xs" value={corrStaffId} onChange={e => setCorrStaffId(e.target.value)}>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Date</label>
                    <input type="date" className="input-field py-1.5 w-full text-xs" value={corrDate} onChange={e => setCorrDate(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Check In</label>
                    <input type="time" className="input-field py-1.5 w-full text-xs" value={corrCheckIn} onChange={e => setCorrCheckIn(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Check Out</label>
                    <input type="time" className="input-field py-1.5 w-full text-xs" value={corrCheckOut} onChange={e => setCorrCheckOut(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase">Reason for manual logging</label>
                  <input
                    type="text"
                    className="input-field py-2 w-full text-xs"
                    placeholder="e.g. Forgot phone in vehicle, late clock-in due to internet failure"
                    value={corrReason}
                    onChange={e => setCorrReason(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs transition-colors">
                  Apply Attendance Log Corrective Settle
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </AppLayout>
  );
}
