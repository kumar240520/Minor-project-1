import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Plus, Trash2 } from 'lucide-react';
import ResponsiveAdminSidebar from '../../components/admin/ResponsiveAdminSidebar';
import ResponsiveAdminHeader from '../../components/admin/ResponsiveAdminHeader';
import { supabase } from '../../supabaseClient';

const initialEvent = {
  title: '',
  date: '',
  time: '',
  location: '',
  type: 'Event',
  color: 'bg-violet-500',
};

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState(initialEvent);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching admin events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (event) => {
    event.preventDefault();
    setCreating(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from('calendar_events').insert([
        {
          ...newEvent,
          user_id: user?.id || null,
          is_global: true,
        },
      ]);

      if (error) throw error;

      setNewEvent(initialEvent);
      await fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create the event: ' + (error.message || error.details || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;

    try {
      const { error } = await supabase.from('calendar_events').delete().eq('id', eventId);

      if (error) throw error;

      setEvents((prev) => prev.filter((item) => item.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete the event.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <ResponsiveAdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 xl:ml-72 overflow-hidden">
        <ResponsiveAdminHeader 
          title="Event Management" 
          subtitle="Publish campus events, deadlines, and engagement campaigns"
          onMobileMenuToggle={() => {}}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-[380px,1fr] gap-8">
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-semibold text-slate-800 flex items-center mb-6">
                  <Plus className="w-5 h-5 mr-2 text-violet-500" />
                  Create Event
                </h2>

                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <input
                    required
                    type="text"
                    value={newEvent.title}
                    onChange={(event) => setNewEvent({ ...newEvent, title: event.target.value })}
                    placeholder="Event title"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      type="date"
                      value={newEvent.date}
                      onChange={(event) => setNewEvent({ ...newEvent, date: event.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <input
                      required
                      type="time"
                      value={newEvent.time}
                      onChange={(event) => setNewEvent({ ...newEvent, time: event.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <input
                    required
                    type="text"
                    value={newEvent.location}
                    onChange={(event) => setNewEvent({ ...newEvent, location: event.target.value })}
                    placeholder="Location"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={newEvent.type}
                    onChange={(event) => setNewEvent({ ...newEvent, type: event.target.value })}
                    placeholder="Type"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <select
                    value={newEvent.color}
                    onChange={(event) => setNewEvent({ ...newEvent, color: event.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="bg-violet-500">Purple</option>
                    <option value="bg-emerald-500">Green</option>
                    <option value="bg-amber-500">Amber</option>
                    <option value="bg-rose-500">Rose</option>
                  </select>
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {creating ? 'Creating...' : 'Create Event'}
                  </button>
                </form>
              </section>

              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                  <h2 className="font-semibold text-slate-800 flex items-center">
                    <CalendarDays className="w-5 h-5 mr-2 text-violet-500" />
                    Scheduled Events
                  </h2>
                </div>

                <div className="divide-y divide-slate-100">
                  {loading ? (
                    <div className="p-6 text-slate-500">Loading events...</div>
                  ) : events.length === 0 ? (
                    <div className="p-6 text-slate-500">No admin events have been scheduled yet.</div>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="p-6 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 h-3 w-3 rounded-full ${event.color || 'bg-violet-500'}`} />
                          <div>
                            <p className="font-semibold text-slate-900">{event.title}</p>
                            <p className="text-sm text-slate-500 mt-1">
                              {event.date || 'No date'} at {event.time || 'No time'}
                            </p>
                            <p className="text-sm text-slate-500 mt-1 flex items-center">
                              <MapPin className="w-4 h-4 mr-1.5" />
                              {event.location || 'No location'}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 mt-3">
                              {event.type || 'Event'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminEvents;
