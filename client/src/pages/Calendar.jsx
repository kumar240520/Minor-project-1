import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import Sidebar, { SidebarProvider } from '../components/Sidebar';
import ResponsiveHeader from '../components/ResponsiveHeader';
import { supabase } from '../supabaseClient';

const Calendar = () => {
    const [events, setEvents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showAddForm, setShowAddForm] = React.useState(false);
    
    // Dynamic month/year state
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Form state
    const [newEvent, setNewEvent] = React.useState({
        title: '', date: '', time: '', location: '', type: 'Event', color: 'bg-violet-500'
    });

    // Navigation functions
    const previousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    React.useEffect(() => {
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
            if (!user) return alert("You must be logged in.");

            const { error } = await supabase
                .from('calendar_events')
                .insert([{ ...newEvent, user_id: user.id, is_global: false }]);

            if (error) throw error;
            
            setNewEvent({ title: '', date: '', time: '', location: '', type: 'Event', color: 'bg-violet-500' });
            setShowAddForm(false);
            fetchEvents();
        } catch (error) {
            console.error("Error adding event:", error);
            alert("Could not add event: " + (error.message || error.details || 'Unknown error'));
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Delete this event?")) return;
        try {
            const { error } = await supabase
                .from('calendar_events')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setEvents(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />

                <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
                    <ResponsiveHeader 
                        title="Academic Calendar"
                        showSearch={true}
                        showNotifications={true}
                        showProfile={true}
                    />

                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Main Calendar View Section (Placeholder UI for now) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </h2>
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={previousMonth}
                                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                                        </button>
                                        <button 
                                            onClick={nextMonth}
                                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <ChevronRight className="h-5 w-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Placeholder Calendar Grid */}
                                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="bg-gray-50 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                                            {day}
                                        </div>
                                    ))}
                                    {/* Generating calendar days with real events */}
                                    {(() => {
                                        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                                        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
                                        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
                                        
                                        return Array.from({ length: totalCells }).map((_, i) => {
                                            const dayNumber = i - firstDay + 1;
                                            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                                            const isToday = new Date().getDate() === dayNumber && 
                                                          new Date().getMonth() === currentMonth && 
                                                          new Date().getFullYear() === currentYear;
                                            
                                            const displayDate = isCurrentMonth ? dayNumber : 
                                                              dayNumber <= 0 ? daysInPrevMonth + dayNumber : 
                                                              dayNumber - daysInMonth;
                                            
                                            // Check if this date has any events
                                            const dayEvents = events.filter(event => {
                                                const eventDate = new Date(event.date);
                                                return eventDate.getDate() === dayNumber && 
                                                       eventDate.getMonth() === currentMonth && 
                                                       eventDate.getFullYear() === currentYear;
                                            });
                                            const hasEvent = dayEvents.length > 0;
                                            
                                            return (
                                                <div key={i} className={`bg-white min-h-[100px] p-2 ${!isCurrentMonth ? 'opacity-50' : ''}`}>
                                                    <div className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-violet-600 text-white' : 'text-gray-700'}`}>
                                                        {displayDate}
                                                    </div>
                                                    {hasEvent && isCurrentMonth && (
                                                        <div className="mt-2 space-y-1">
                                                            {dayEvents.slice(0, 2).map((event, idx) => (
                                                                <div key={idx} className="text-[10px] font-bold text-white bg-violet-500 px-1.5 py-0.5 rounded truncate">
                                                                    {event.title}
                                                                </div>
                                                            ))}
                                                            {dayEvents.length > 2 && (
                                                                <div className="text-[9px] text-gray-500">
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
                            </div>
                        </div>

                        {/* Upcoming List Section */}
                        <div className="space-y-6">
                            <button 
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center transition-colors shadow-sm"
                            >
                                <Plus className="h-5 w-5 mr-2" /> {showAddForm ? 'Cancel' : 'Add Custom Event'}
                            </button>

                            {showAddForm && (
                                <motion.form 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    onSubmit={handleAddEvent}
                                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4"
                                >
                                    <input required placeholder="Event Title" className="w-full p-2 border rounded-lg" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input required type="date" className="w-full p-2 border rounded-lg text-sm" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                                        <input required type="time" className="w-full p-2 border rounded-lg text-sm" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                                    </div>
                                    <input required placeholder="Location" className="w-full p-2 border rounded-lg" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
                                    <select className="w-full p-2 border rounded-lg" value={newEvent.color} onChange={e => setNewEvent({...newEvent, color: e.target.value})}>
                                        <option value="bg-violet-500">Event (Purple)</option>
                                        <option value="bg-red-500">Exam (Red)</option>
                                        <option value="bg-amber-500">Deadline (Yellow)</option>
                                        <option value="bg-emerald-500">Other (Green)</option>
                                    </select>
                                    <button type="submit" className="w-full bg-gray-900 text-white p-2 rounded-lg font-bold hover:bg-gray-800 transition-colors">Save Event</button>
                                </motion.form>
                            )}

                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                    <CalendarIcon className="h-5 w-5 mr-2 text-violet-600" />
                                    Upcoming Schedule
                                </h3>
                                
                                <div className="space-y-6">
                                    {loading ? (
                                        <div className="text-center text-sm text-gray-500 py-4">Loading schedule...</div>
                                    ) : events.length === 0 ? (
                                        <div className="text-center text-sm text-gray-500 py-4">No events scheduled.</div>
                                    ) : events.map((event, index) => (
                                        <motion.div 
                                            key={event.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:bottom-0 before:w-px before:bg-gray-200 last:before:hidden"
                                        >
                                            <div className={`absolute left-[-4px] top-1.5 w-2 h-2 rounded-full ${event.color} ring-4 ring-white`}></div>
                                            <div className="mb-1">
                                                <span className="text-xs font-bold text-gray-500">{event.date}</span>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative group">
                                                <h4 className="font-bold text-gray-800 mb-2">{event.title}</h4>
                                                <button 
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Clock className="h-3.5 w-3.5 mr-2 text-gray-400" />
                                                        {event.time}
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <MapPin className="h-3.5 w-3.5 mr-2 text-gray-400" />
                                                        {event.location}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
            </div>
        </SidebarProvider>
    );
};

export default Calendar;
