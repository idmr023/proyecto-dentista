import { useState, useEffect } from 'react';
import { api } from '../lib/api.ts';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface Appointment {
  id: string;
  patient_id: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string;
  patient_name: string;
  patient_phone: string;
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await api('/appointments');
      setAppointments(data.appointments || []);
    } catch (e) {
      console.error('Error loading appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday is 0

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getAppointmentsForDay = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(///g, '-');
    return appointments.filter(apt => apt.appointment_date === dateStr);
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const days = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <CalendarIcon className="w-8 h-8 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/[0.06] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-cyan-400" /> Calendario de Citas
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-white transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold text-slate-300">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-2 text-slate-400 hover:text-white transition">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayAppointments = day ? getAppointmentsForDay(day) : [];
          const isToday = day ? day.toDateString() === new Date().toDateString() : false;
          const isSelected = day ? day.toDateString() === currentDate.toDateString() : false;

          return (
            <div
              key={index}
              className={`min-h-[80px] p-1 rounded-lg transition-colors border ${day
                ? 'bg-white/[0.03] hover:bg-white/[0.05] cursor-pointer'
                : 'bg-transparent'}
                ${isToday ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-transparent'}
                ${isSelected ? 'ring-2 ring-cyan-500' : ''}`}
            >
              {day && (
                <div className="flex flex-col h-full">
                  <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-cyan-300' : 'text-white'}`}>{day.getDate()}</div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayAppointments.slice(0, 3).map(apt => (
                      <div
                        key={apt.id}
                        className={`text-xs px-1 py-0.5 rounded truncate font-medium ${apt.status === 'confirmada'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : apt.status === 'pendiente'
                              ? 'bg-amber-500/20 text-amber-300'
                              : apt.status === 'cancelada'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                      >
                        {apt.service} - {apt.patient_name}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-slate-500 font-medium">+{dayAppointments.length - 3} más</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
