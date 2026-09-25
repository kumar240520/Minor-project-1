import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Trash2,
  X,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';
import { formatLocalDate } from '../utils/auth';
import {
  DashboardCard,
  DashboardButton,
  DashboardBadge,
  FeedbackState
} from '../components/dashboard';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'Exam',
    color: 'bg-rose-500'
  });

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .or(`user_id.eq.${user.id},is_global.eq.true`)
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert('You must be logged in.');

      let colorClass = 'bg-[#2563EB]';
      if (newEvent.type === 'Exam') colorClass = 'bg-rose-500';
      else if (newEvent.type === 'Deadline') colorClass = 'bg-amber-500';
      else if (newEvent.type === 'Holiday') colorClass = 'bg-emerald-500';
      else if (newEvent.type === 'Event') colorClass = 'bg-[#5B20E8]';

      const { error } = await supabase
        .from('calendar_events')
        .insert([{
          ...newEvent,
          color: colorClass,
          user_id: user.id,
          is_global: false
        }]);

      if (error) throw error;

      setNewEvent({ title: '', date: '', time: '', location: '', type: 'Exam', color: 'bg-rose-500' });
      setShowAddForm(false);
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Could not add event: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <Layout
      title="Academic Calendar"
      subtitle="Semester dates, assignment deadlines, and event schedule"
    >
      <div className="max-w-[1720px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Controls Bar */}
        <DashboardCard className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {monthName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {events.length} tracked academic events and deadlines
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-x border-slate-200 dark:border-slate-800 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <DashboardButton
                variant="primary"
                onClick={() => setShowAddForm(!showAddForm)}
                icon={showAddForm ? X : Plus}
              >
                {showAddForm ? 'Cancel' : 'Add Event'}
              </DashboardButton>
            </div>
          </div>
        </DashboardCard>

        {/* Add Event Panel */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DashboardCard className="p-5 sm:p-6 border-blue-200 dark:border-blue-900/50 bg-blue-50/20 dark:bg-blue-950/10">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#2563EB]" /> Schedule New Academic Event
                </h3>
                <form onSubmit={handleAddEvent} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Event Title
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Midterm Lab Viva"
                      value={newEvent.title}
                      onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      required
                      type="date"
                      value={newEvent.date}
                      onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Time & Location
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        required
                        type="time"
                        value={newEvent.time}
                        onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                      <input
                        required
                        type="text"
                        placeholder="Room 402"
                        value={newEvent.location}
                        onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={newEvent.type}
                        onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                      >
                        <option value="Exam">Exam</option>
                        <option value="Deadline">Deadline</option>
                        <option value="Event">Event</option>
                        <option value="Holiday">Holiday</option>
                      </select>
                      <DashboardButton variant="primary" type="submit" size="sm">
                        Save
                      </DashboardButton>
                    </div>
                  </div>
                </form>
              </DashboardCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2-Column Calendar & Upcoming Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* Main Month Grid View */}
          <div className="xl:col-span-2 space-y-4">
            <DashboardCard className="p-4 sm:p-6 overflow-hidden">
              {/* Day header */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Month cell generation */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {(() => {
                  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
                  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

                  return Array.from({ length: totalCells }).map((_, i) => {
                    const dayNumber = i - firstDay + 1;
                    const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                    const isToday =
                      new Date().getDate() === dayNumber &&
                      new Date().getMonth() === currentMonth &&
                      new Date().getFullYear() === currentYear;

                    const displayDate = isCurrentMonth
                      ? dayNumber
                      : dayNumber <= 0
                      ? daysInPrevMonth + dayNumber
                      : dayNumber - daysInMonth;

                    const dayEvents = isCurrentMonth
                      ? events.filter(event => {
                          const eventDate = new Date(event.date);
                          return (
                            eventDate.getDate() === dayNumber &&
                            eventDate.getMonth() === currentMonth &&
                            eventDate.getFullYear() === currentYear
                          );
                        })
                      : [];

                    return (
                      <div
                        key={i}
                        className={`min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-xl border transition-colors ${
                          !isCurrentMonth
                            ? 'bg-slate-50/50 dark:bg-slate-900/30 border-transparent opacity-40 text-slate-400'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                              isToday
                                ? 'bg-[#2563EB] text-white font-bold'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {displayDate}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                          )}
                        </div>

                        {dayEvents.length > 0 && (
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((evt, idx) => (
                              <div
                                key={idx}
                                className={`text-[10px] sm:text-[11px] font-medium text-white ${
                                  evt.color || 'bg-[#2563EB]'
                                } px-1.5 py-0.5 rounded truncate shadow-xs`}
                                title={`${evt.title} (${evt.time})`}
                              >
                                {evt.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-[9px] text-slate-400 font-medium px-1">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </DashboardCard>
          </div>

          {/* Upcoming Schedule Sidebar */}
          <div className="space-y-4">
            <DashboardCard className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2563EB]" /> Upcoming Deadlines & Events
                </h3>
                <DashboardBadge variant="neutral">
                  {events.length} Total
                </DashboardBadge>
              </div>

              {loading ? (
                <FeedbackState
                  type="loading"
                  title="Loading Events"
                  description="Retrieving your upcoming deadlines and exam schedule..."
                />
              ) : events.length === 0 ? (
                <FeedbackState
                  type="empty"
                  title="No Upcoming Events"
                  description="Add an event or exam date to stay organized."
                  actionText="Add Event"
                  onAction={() => setShowAddForm(true)}
                />
              ) : (
                <div className="space-y-3">
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.3) }}
                      className="group p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition-all hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${event.color || 'bg-[#2563EB]'}`} />
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              {event.date}
                            </span>
                          </div>
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                            {event.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {event.time}
                              </span>
                            )}
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>

                        {!event.is_global && (
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </DashboardCard>
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Calendar;
