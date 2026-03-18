import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Sparkles, Bell, Users, Trophy } from 'lucide-react';

const events = [
    {
        id: 1,
        title: 'HackTheCampus 2026',
        date: 'March 15, 2026',
        time: '09:00 AM - 05:00 PM',
        location: 'Main Auditorium',
        category: 'Hackathon',
        color: 'from-blue-500 to-indigo-500',
        bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
        borderColor: 'border-blue-200',
        icon: <Trophy className="w-4 h-4 text-white" />
    },
    {
        id: 2,
        title: 'Google Cloud Workshop',
        date: 'March 22, 2026',
        time: '10:00 AM - 01:00 PM',
        location: 'Lab 4, CS Block',
        category: 'Workshop',
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        icon: <Users className="w-4 h-4 text-white" />
    },
    {
        id: 3,
        title: 'Placement Talk: Amazon',
        date: 'April 05, 2026',
        time: '02:00 PM - 04:00 PM',
        location: 'Seminar Hall B',
        category: 'Placement',
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
        borderColor: 'border-purple-200',
        icon: <Trophy className="w-4 h-4 text-white" />
    }
];

const Events = () => {
    return (
        <section id="events" className="py-24 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            {/* Decorative Borders */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-30" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-30" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Enhanced Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-6 py-3 rounded-full mb-6 font-medium text-sm border border-blue-200/50"
                        >
                            <Bell className="w-4 h-4" />
                            <span>Notice Board</span>
                            <Sparkles className="w-4 h-4" />
                        </motion.div>
                        
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
                        >
                            Upcoming <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">College Events</span>
                        </motion.h2>
                        
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-gray-600"
                        >
                            Stay updated with the latest happenings and opportunities on campus.
                        </motion.p>
                    </div>
                    
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05 }}
                        className="mt-6 md:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/50 border border-blue-400/30"
                    >
                        View All Events
                    </motion.button>
                </div>

                {/* Enhanced Event Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className={`group relative bg-white rounded-3xl p-8 border-2 ${event.borderColor} hover:border-blue-400 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer`}
                        >
                            {/* Decorative Corner Accents */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                            
                            {/* Enhanced Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${event.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {event.icon}
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r ${event.color} text-white shadow-md`}>
                                        {event.category}
                                    </span>
                                </div>
                                
                                <div className={`relative bg-gradient-to-br ${event.bgColor} p-3 rounded-2xl text-center min-w-[70px] border-2 border-white/50 shadow-md group-hover:scale-110 transition-all duration-300`}>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
                                    <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold text-xl leading-none">
                                        {event.date.split(' ')[1].replace(',', '')}
                                    </span>
                                    <span className="block text-gray-600 text-xs font-medium uppercase mt-1">
                                        {event.date.split(' ')[0].substring(0, 3)}
                                    </span>
                                </div>
                            </div>

                            {/* Enhanced Content */}
                            <h4 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                                {event.title}
                            </h4>

                            <div className="space-y-4 text-sm text-gray-600">
                                <div className="flex items-center p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors duration-300">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${event.color} flex items-center justify-center mr-3 shadow-md`}>
                                        <Clock className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="font-medium">{event.time}</span>
                                </div>
                                
                                <div className="flex items-center p-3 bg-gray-50 rounded-xl group-hover:bg-purple-50 transition-colors duration-300">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${event.color} flex items-center justify-center mr-3 shadow-md`}>
                                        <MapPin className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="font-medium">{event.location}</span>
                                </div>
                            </div>
                            
                            {/* Enhanced Bottom Accent */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            
                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Events;
