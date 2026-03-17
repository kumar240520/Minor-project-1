import { motion } from 'framer-motion';

const steps = [
    {
        title: 'Create an Account',
        description: 'Sign up securely as a student. All accounts are college-specific.',
        number: '01'
    },
    {
        title: 'Upload or Access Materials',
        description: 'Share your well-written notes or download verified PYQs from others.',
        number: '02'
    },
    {
        title: 'Earn EduCoins',
        description: 'Once your uploaded notes are verified by admins, you earn coins.',
        number: '03'
    },
    {
        title: 'Unlock Premium Prep',
        description: 'Use your earned coins to unlock placement roadmaps and premium questions.',
        number: '04'
    }
];

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-24 bg-gray-50 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-violet-600 font-bold tracking-wide uppercase text-sm mb-3"
                    >
                        Simple Process
                    </motion.h2>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl md:text-4xl font-extrabold text-gray-900"
                    >
                        How EduSure Works
                    </motion.h3>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform md:-translate-x-1/2"></div>

                    <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: '100%' }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute left-8 md:left-1/2 top-0 w-0.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 transform md:-translate-x-1/2 z-0 origin-top"
                    ></motion.div>

                    <div className="space-y-12">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`flex flex-col md:flex-row items-start md:items-center relative z-10 
                  ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}
                `}
                            >
                                {/* Number Indicator */}
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                    className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 border-4 border-white shadow-md text-white font-bold"
                                >
                                    {step.number}
                                </motion.div>

                                {/* Content Box */}
                                <motion.div
                                    initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
                                    className={`ml-20 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pl-16' : 'md:pr-16 text-left md:text-right'}`}
                                >
                                    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                                        <p className="text-gray-600">{step.description}</p>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default HowItWorks;
