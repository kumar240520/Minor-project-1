import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, BookOpen, MessageCircle, FileQuestion, Mail, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Sidebar, { SidebarProvider } from '../components/Sidebar';

const Help = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        if (openFaq === index) {
            setOpenFaq(null);
        } else {
            setOpenFaq(index);
        }
    };

    const faqs = [
        { 
            q: "How do I earn Edu Coins?", 
            a: "You can earn Edu Coins by uploading verified study materials, answering questions in the Community Post section, and logging in daily. High quality materials that get many downloads earn bonus coins." 
        },
        { 
            q: "What types of files can I upload?", 
            a: "We currently support PDF, DOC, DOCX, PPT, PPTX, and TXT files. For code or multiple files, please use ZIP format. The maximum file size allowed is 50MB per upload." 
        },
        { 
            q: "How do I redeem my Edu Coins?", 
            a: "Navigate to the Rewards center using the sidebar. There you will see a list of available rewards like gift cards and premium subscriptions. If you have enough coins, click the redeem button on the item." 
        },
        { 
            q: "Can I delete or edit a material after uploading?", 
            a: "Yes, you can manage your uploads in the 'My Materials' section. From there, you can edit the title, description, and category, or delete the file entirely if needed." 
        },
        { 
            q: "Who can see my community posts?", 
            a: "All registered students on the EduSure platform can view and interact with your posts in the Community section. Keep your posts academic and respectful." 
        }
    ];

    const resources = [
        { title: "Getting Started Guide", icon: BookOpen, desc: "Learn the basics of using EduSure effectively.", color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Content Guidelines", icon: FileQuestion, desc: "Rules for uploading notes and community behavior.", color: "text-violet-500", bg: "bg-violet-50" },
        { title: "Community Forums", icon: MessageCircle, desc: "Join discussions with other students and mentors.", color: "text-emerald-500", bg: "bg-emerald-50" },
    ];

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
                <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 z-10 shrink-0">
                    <h1 className="text-2xl font-bold text-gray-800">Help & Support</h1>
                    <div className="flex items-center space-x-6">
                        <div className="relative hidden md:block">
                            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search help articles..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-64 bg-gray-50"
                            />
                        </div>
                        <button className="relative p-2 text-gray-400 hover:text-violet-600 transition-colors">
                            <Bell className="h-6 w-6" />
                        </button>
                        <div className="h-10 w-10 rounded-full border-2 border-violet-200 overflow-hidden cursor-pointer shadow-sm">
                            <img src="https://i.pravatar.cc/150?u=12" alt="Profile" className="h-full w-full object-cover" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
                    <div className="max-w-5xl mx-auto space-y-8">
                        
                        {/* Hero Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-3xl p-10 text-white shadow-xl text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                            
                            <div className="relative z-10 max-w-2xl mx-auto">
                                <h2 className="text-4xl font-extrabold mb-4">How can we help you?</h2>
                                <p className="text-indigo-200 text-lg mb-8">Browse our guides, FAQs, or contact support to resolve any issues quickly.</p>
                                
                                <div className="relative max-w-xl mx-auto">
                                    <Search className="h-6 w-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search for answers (e.g., 'upload limits', 'edu coins')"
                                        className="w-full pl-14 pr-4 py-4 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 shadow-lg"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Helpful Resources */}
                            <div className="md:col-span-1 space-y-6">
                                <h3 className="text-xl font-bold text-gray-800">Quick Guides</h3>
                                <div className="space-y-4">
                                    {resources.map((res, index) => (
                                        <motion.a 
                                            href="#"
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="block bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className={`p-3 rounded-xl ${res.bg} ${res.color} shrink-0 group-hover:scale-110 transition-transform`}>
                                                    <res.icon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 flex items-center">
                                                        {res.title}
                                                        <ExternalLink className="h-3.5 w-3.5 ml-1.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mt-1">{res.desc}</p>
                                                </div>
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center mt-8">
                                    <div className="mx-auto w-12 h-12 bg-indigo-50 flex items-center justify-center rounded-full mb-4">
                                        <Mail className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-800 mb-2">Still need help?</h4>
                                    <p className="text-sm text-gray-500 mb-4">Our support team is here for you.</p>
                                    <button className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
                                        Contact Support
                                    </button>
                                </div>
                            </div>

                            {/* FAQs */}
                            <div className="md:col-span-2">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
                                    
                                    <div className="space-y-4">
                                        {faqs.map((faq, index) => (
                                            <div 
                                                key={index} 
                                                className={`border rounded-xl overflow-hidden transition-colors ${openFaq === index ? 'border-violet-200 bg-violet-50/30' : 'border-gray-200 hover:border-violet-200'}`}
                                            >
                                                <button 
                                                    onClick={() => toggleFaq(index)}
                                                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                                                >
                                                    <span className={`font-bold ${openFaq === index ? 'text-violet-900' : 'text-gray-800'}`}>
                                                        {faq.q}
                                                    </span>
                                                    {openFaq === index ? (
                                                        <ChevronUp className="h-5 w-5 text-violet-600 shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                                                    )}
                                                </button>
                                                
                                                {openFaq === index && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="p-5 pt-0 text-gray-600"
                                                    >
                                                        {faq.a}
                                                    </motion.div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
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

export default Help;
