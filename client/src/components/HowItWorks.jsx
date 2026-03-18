import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle, Users, Upload, Award, BookOpen } from 'lucide-react';

const steps = [
    {
        title: 'Create an Account',
        description: 'Sign up securely as a student. All accounts are college-specific.',
        number: '01',
        icon: <Users className="w-5 h-5 text-white" />,
        color: 'from-violet-500 to-purple-500'
    },
    {
        title: 'Upload or Access Materials',
        description: 'Share your well-written notes or download verified PYQs from others.',
        number: '02',
        icon: <Upload className="w-5 h-5 text-white" />,
        color: 'from-blue-500 to-indigo-500'
    },
    {
        title: 'Earn EduCoins',
        description: 'Once your uploaded notes are verified by admins, you earn coins.',
        number: '03',
        icon: <Award className="w-5 h-5 text-white" />,
        color: 'from-yellow-500 to-amber-500'
    },
    {
        title: 'Unlock Premium Prep',
        description: 'Use your earned coins to unlock placement roadmaps and premium questions.',
        number: '04',
        icon: <BookOpen className="w-5 h-5 text-white" />,
        color: 'from-emerald-500 to-green-500'
    }
];

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 via-violet-50/20 to-blue-50/20 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-violet-200/40 to-purple-200/40 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl" />
            
            {/* Decorative Borders */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 opacity-30" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-30" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Enhanced Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-6 py-3 rounded-full mb-6 font-medium text-sm border border-violet-200/50"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Simple Process</span>
                        <CheckCircle className="w-4 h-4" />
                    </motion.div>
                    
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6"
                    >
                        How <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">EduSure</span> Works
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                    >
                        Get started in minutes and transform your academic journey with our streamlined process.
                    </motion.p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Enhanced Vertical Connecting Line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gray-200/50 transform md:-translate-x-1/2 rounded-full"></div>

                    <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: '100%' }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute left-8 md:left-1/2 top-0 w-1 bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 transform md:-translate-x-1/2 z-0 origin-top rounded-full shadow-lg"
                    ></motion.div>

                    <div className="space-y-16">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`flex flex-col md:flex-row items-start md:items-center relative z-10 
                  ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}
                `}
                            >
                                {/* Enhanced Number Indicator */}
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                    className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 border-4 border-white shadow-xl text-white font-bold text-lg relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="relative z-10">{step.number}</span>
                                    {/* Decorative corner accents */}
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full opacity-60" />
                                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full opacity-40" />
                                </motion.div>

                                {/* Enhanced Content Box */}
                                <motion.div
                                    initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
                                    className={`ml-20 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pl-16' : 'md:pr-16 text-left md:text-right'}`}
                                >
                                    <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-violet-300 overflow-hidden">
                                        {/* Decorative background pattern */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                        {/* Enhanced Header */}
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                {step.icon}
                                            </div>
                                            <h4 className="text-2xl font-bold text-gray-900 group-hover:text-violet-700 transition-colors duration-300">
                                                {step.title}
                                            </h4>
                                        </div>
                                        
                                        <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                                            {step.description}
                                        </p>
                                        
                                        {/* Enhanced Bottom Accent */}
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                        
                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                        {/* Decorative corner accents */}
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute bottom-0 left-0 w-6 h-6 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enhanced CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-20 text-center"
                >
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-violet-500/50 transition-all hover:scale-105 border border-violet-400/30">
                        <span>Get Started Now</span>
                        <ArrowRight className="w-5 h-5" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HowItWorks;
