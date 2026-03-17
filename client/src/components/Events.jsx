import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock } from 'lucide-react';

const events = [
    {
        id: 1,
        title: 'HackTheCampus 2026',
        date: 'March 15, 2026',
        time: '09:00 AM - 05:00 PM',
        location: 'Main Auditorium',
        category: 'Hackathon',
        color: 'bg-blue-100 text-blue-700'
    },
    {
        id: 2,
        title: 'Google Cloud Workshop',
        date: 'March 22, 2026',
        time: '10:00 AM - 01:00 PM',
        location: 'Lab 4, CS Block',
        category: 'Workshop',
        color: 'bg-green-100 text-green-700'
    },
    {
        id: 3,
        title: 'Placement Talk: Amazon',
        date: 'April 05, 2026',
        time: '02:00 PM - 04:00 PM',
        location: 'Seminar Hall B',
        category: 'Placement',
        color: 'bg-purple-100 text-purple-700'
    }
];

const Events = () => {
    return (
        <section id="events" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
                    <div className="max-w-2xl">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-violet-600 font-bold tracking-wide uppercase text-sm mb-3"
                        >
                            Notice Board
                        </motion.h2>
                        <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-extrabold text-gray-900"
                        >
                            Upcoming College Events
                        </motion.h3>
                    </div>
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="mt-6 md:mt-0 bg-white border-2 border-violet-100 text-violet-700 hover:bg-violet-50 hover:border-violet-200 px-6 py-2.5 rounded-full font-semibold transition-all duration-300"
                    >
                        View All Events
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${event.color}`}>
                                    {event.category}
                                </span>
                                <div className="bg-gray-50 p-2 rounded-lg text-center min-w-[60px] group-hover:bg-violet-50 transition-colors">
                                    <span className="block text-violet-600 font-bold text-xl leading-none">{event.date.split(' ')[1].replace(',', '')}</span>
                                    <span className="block text-gray-500 text-xs font-medium uppercase mt-1">{event.date.split(' ')[0].substring(0, 3)}</span>
                                </div>
                            </div>

                            <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-violet-600 transition-colors">{event.title}</h4>

                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                    {event.time}
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                    {event.location}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Events;
