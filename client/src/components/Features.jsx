import { motion } from 'framer-motion';
import { FileCheck, Upload, Coins, CalendarDays, ShieldAlert, GraduationCap, Sparkles, Star } from 'lucide-react';

const features = [
    {
        icon: <FileCheck className="w-6 h-6 text-white" />,
        title: 'Verified PYQs & Notes',
        description: 'Access high-quality, admin-verified previous year questions and study materials.',
        bgColor: 'bg-gradient-to-br from-sky-50 to-blue-50',
        borderColor: 'border-sky-200',
        hoverColor: 'hover:border-sky-400',
        iconBg: 'bg-gradient-to-r from-sky-500 to-blue-500'
    },
    {
        icon: <Upload className="w-6 h-6 text-white" />,
        title: 'Seamless Sharing',
        description: 'Upload your notes effortlessly and help your juniors succeed academically.',
        bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        borderColor: 'border-blue-200',
        hoverColor: 'hover:border-blue-400',
        iconBg: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    {
        icon: <Coins className="w-6 h-6 text-white" />,
        title: 'Earn Rewards',
        description: 'Get rewarded with coins for every verified upload and spend them on premium resources.',
        bgColor: 'bg-gradient-to-br from-cyan-50 to-sky-50',
        borderColor: 'border-cyan-200',
        hoverColor: 'hover:border-cyan-400',
        iconBg: 'bg-gradient-to-r from-cyan-500 to-sky-500'
    },
    {
        icon: <CalendarDays className="w-6 h-6 text-white" />,
        title: 'College Events',
        description: 'Stay updated with the latest college events, hackathons, and notice board updates.',
        bgColor: 'bg-gradient-to-br from-sky-50 to-blue-50',
        borderColor: 'border-sky-200',
        hoverColor: 'hover:border-sky-400',
        iconBg: 'bg-gradient-to-r from-sky-500 to-blue-500'
    },
    {
        icon: <ShieldAlert className="w-6 h-6 text-white" />,
        title: 'Admin Verification',
        description: 'No spam or duplicate files. Everything goes through a strict moderation process.',
        bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        borderColor: 'border-blue-200',
        hoverColor: 'hover:border-blue-400',
        iconBg: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    {
        icon: <GraduationCap className="w-6 h-6 text-white" />,
        title: 'Placement Prep',
        description: 'Unlock affordable, curated placement preparation roadmaps and interview questions.',
        bgColor: 'bg-gradient-to-br from-cyan-50 to-sky-50',
        borderColor: 'border-cyan-200',
        hoverColor: 'hover:border-cyan-400',
        iconBg: 'bg-gradient-to-r from-cyan-500 to-sky-500'
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
        <section id="features" className="py-24 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-sky-200/30 to-blue-200/30 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-sky-100/40 to-blue-100/40 rounded-full blur-3xl opacity-60 animate-pulse" />
            
            {/* Decorative Borders */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 opacity-40" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-400 opacity-40" />
            
            {/* Additional Decorative Elements */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-sky-300/20 to-blue-300/20 rounded-full blur-2xl animate-pulse delay-1000" />
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-blue-300/20 to-cyan-300/20 rounded-full blur-2xl animate-pulse delay-500" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Enhanced Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 px-6 py-3 rounded-full mb-6 font-medium text-sm border border-sky-200/50"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Why Choose EduSure?</span>
                        <Star className="w-4 h-4" />
                    </motion.div>
                    
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6"
                    >
                        Everything you need to <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">ace your semesters</span>.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-gray-700 leading-relaxed"
                    >
                        Built by students, for students. We solve the chaos of scattered notes and provide a structured path to academic success.
                    </motion.p>
                </div>

                {/* Enhanced Feature Cards */}
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
                            className={`group relative bg-white rounded-3xl p-8 border-2 ${feature.borderColor} ${feature.hoverColor} shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden`}
                        >
                            {/* Decorative Corner Accents */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-sky-100/50 to-blue-100/50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-blue-100/50 to-cyan-100/50 rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                            
                            {/* Enhanced Icon Container */}
                            <div className="relative mb-8">
                                <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl border-2 border-white/50`}>
                                    <div className={`w-8 h-8 rounded-xl ${feature.iconBg} flex items-center justify-center text-white shadow-md`}>
                                        {feature.icon}
                                    </div>
                                </div>
                                {/* Floating Badge */}
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-sky-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                            </div>
                            
                            {/* Enhanced Content */}
                            <h4 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-sky-600 transition-colors duration-300">
                                {feature.title}
                            </h4>
                            <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                                {feature.description}
                            </p>
                            
                            {/* Enhanced Bottom Accent */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            
                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-sky-50/50 to-blue-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
};

export default Features;
