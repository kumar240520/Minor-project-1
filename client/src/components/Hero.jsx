import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, UploadCloud, ShieldCheck } from 'lucide-react';
import { Link } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';

const Hero = () => {
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-white -z-10" />
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-violet-100 rounded-full blur-3xl opacity-50 -translate-y-1/4 translate-x-1/4 -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-100 rounded-full blur-3xl opacity-50 translate-y-1/4 -translate-x-1/4 -z-10 animate-pulse delay-1000" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Left Column: Text & CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center lg:text-left pt-12 lg:pt-0"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center space-x-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full mb-6 font-medium text-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>The #1 Student Academic Platform</span>
                        </motion.div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Academics</span><br />
                            Together.
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                            Stop hunting for notes in chaotic WhatsApp groups. EduSure centralizes verified PYQs, study materials, and college notices all in one powerful ecosystem.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                            <RouterLink
                                to="/register"
                                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-violet-600/30 transform hover:-translate-y-1"
                            >
                                <span>Get Started Free</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </RouterLink>

                            <Link
                                to="features"
                                smooth={true}
                                className="w-full sm:w-auto flex items-center justify-center bg-white border border-gray-200 hover:border-violet-200 text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-8 py-4 rounded-full font-semibold transition-all cursor-pointer"
                            >
                                Explore Resources
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Column: Floating UI Elements */}
                    <div className="relative h-[500px] w-full hidden lg:block perspective-1000">
                        <motion.div
                            initial={{ opacity: 0, x: 50, rotateY: 15 }}
                            animate={{ opacity: 1, x: 0, rotateY: 0 }}
                            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                            className="absolute top-10 right-0 w-full max-w-md"
                        >
                            {/* Main Mockup Card */}
                            <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-6 relative z-20">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-800">Operating Systems</h3>
                                        <p className="text-sm text-gray-500">Unit 3 Notes • 6th Semester</p>
                                    </div>
                                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                        <ShieldCheck className="w-3 h-3 mr-1" />
                                        Verified
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs">AK</div>
                                            <span className="text-sm text-gray-600 font-medium">Uploaded by Aman</span>
                                        </div>
                                        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">Download Pdfs</button>
                                    </div>
                                </div>
                            </div>

                            {/* Upload Floating Card */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -left-12 top-32 bg-white p-4 rounded-xl shadow-xl border border-gray-50 flex items-center space-x-3 z-30"
                            >
                                <div className="bg-violet-100 p-2 rounded-lg text-violet-600">
                                    <UploadCloud className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Upload Notes</p>
                                    <p className="text-xs text-violet-600 font-medium">+50 Coins Earned</p>
                                </div>
                            </motion.div>

                            {/* Notification Floating Card */}
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                className="absolute -right-8 bottom-12 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-50 z-10"
                            >
                                <p className="text-sm font-bold text-gray-800 mb-1">New Notice 📢</p>
                                <p className="text-xs text-gray-600 w-40 truncate">Mid-term exam schedule updated...</p>
                            </motion.div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;
