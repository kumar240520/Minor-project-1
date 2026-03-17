import { motion } from 'framer-motion';
import { FileCheck, Upload, Coins, CalendarDays, ShieldAlert, GraduationCap } from 'lucide-react';

const features = [
    {
        icon: <FileCheck className="w-6 h-6 text-violet-600" />,
        title: 'Verified PYQs & Notes',
        description: 'Access high-quality, admin-verified previous year questions and study materials.',
        bgColor: 'bg-violet-50'
    },
    {
        icon: <Upload className="w-6 h-6 text-blue-600" />,
        title: 'Seamless Sharing',
        description: 'Upload your notes effortlessly and help your juniors succeed academically.',
        bgColor: 'bg-blue-50'
    },
    {
        icon: <Coins className="w-6 h-6 text-yellow-600" />,
        title: 'Earn Rewards',
        description: 'Get rewarded with coins for every verified upload and spend them on premium resources.',
        bgColor: 'bg-yellow-50'
    },
    {
        icon: <CalendarDays className="w-6 h-6 text-emerald-600" />,
        title: 'College Events',
        description: 'Stay updated with the latest college events, hackathons, and notice board updates.',
        bgColor: 'bg-emerald-50'
    },
    {
        icon: <ShieldAlert className="w-6 h-6 text-purple-600" />,
        title: 'Admin Verification',
        description: 'No spam or duplicate files. Everything goes through a strict moderation process.',
        bgColor: 'bg-purple-50'
    },
    {
        icon: <GraduationCap className="w-6 h-6 text-rose-600" />,
        title: 'Placement Prep',
        description: 'Unlock affordable, curated placement preparation roadmaps and interview questions.',
        bgColor: 'bg-rose-50'
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
    }
};

const Features = () => {
    return (
        <section id="features" className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-violet-600 font-bold tracking-wide uppercase text-sm mb-3"
                    >
                        Why Choose EduSure?
                    </motion.h2>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6"
                    >
                        Everything you need to ace your semesters.
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-600"
                    >
                        Built by students, for students. We solve the chaos of scattered notes and provide a structured path to academic success.
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
};

export default Features;
