import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, FileText, CalendarCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
    { id: 1, name: 'Active Students', value: 2500, suffix: '+', icon: <Users className="w-6 h-6" /> },
    { id: 2, name: 'Verified Notes', value: 850, suffix: '+', icon: <FileText className="w-6 h-6" /> },
    { id: 3, name: 'Events Hosted', value: 120, suffix: '+', icon: <CalendarCheck className="w-6 h-6" /> },
    { id: 4, name: 'Coins Rewarded', value: 50, suffix: 'k+', icon: <Award className="w-6 h-6" /> },
];

const Counter = ({ from, to, duration = 2, suffix = "" }) => {
    const [count, setCount] = useState(from);
    const nodeRef = useRef(null);
    const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView) {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
                setCount(Math.floor(progress * (to - from) + from));
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }
    }, [isInView, from, to, duration]);

    return <span ref={nodeRef}>{count}{suffix}</span>;
};

const StatsAndCTA = () => {
    return (
        <div className="bg-white">
            {/* Statistics Section */}
            <section className="py-20 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.id}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-center flex flex-col items-center group cursor-default"
                            >
                                <div className="w-12 h-12 bg-violet-50 rounded-full flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 group-hover:bg-gradient-to-r from-fuchsia-600 to-violet-600 group-hover:text-white transition-all duration-300">
                                    {stat.icon}
                                </div>
                                <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
                                    <Counter from={0} to={stat.value} duration={2.5} suffix={stat.suffix} />
                                </div>
                                <div className="text-sm sm:text-base font-medium text-gray-500 uppercase tracking-wide">
                                    {stat.name}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3 -z-10" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/3 -z-10" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Ready to Upgrade Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
                                Academic Journey?
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                            Join thousands of students who are already using EduSure to share knowledge and ace their exams.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register" className="w-full sm:w-auto bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white hover:bg-violet-700 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-violet-600/40 hover:-translate-y-1 text-center">
                                Create Free Account
                            </Link>
                            <p className="sm:hidden text-sm text-gray-500 mt-2">No credit card required.</p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default StatsAndCTA;
