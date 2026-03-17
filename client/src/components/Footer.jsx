import { BookOpen, Twitter, Linkedin, Github, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Brand Info */}
                    <div className="col-span-1 md:col-span-1 border-b md:border-b-0 border-gray-800 pb-8 md:pb-0">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="bg-gradient-to-r from-fuchsia-600 to-violet-600 p-2 rounded-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">EduSure</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">
                            Empowering students with centralized academic resources, verified notes, and college updates.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-violet-400 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-violet-400 transition-colors">How it Works</a></li>
                            <li><a href="#" className="hover:text-violet-400 transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-violet-400 transition-colors">Upload Notes</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-violet-400 transition-colors">Notice Board</a></li>
                            <li><a href="#" className="hover:text-violet-400 transition-colors">Placement Guides</a></li>
                            <li><a href="#" className="hover:text-violet-400 transition-colors">Community Forum</a></li>
                            <li><a href="#" className="hover:text-violet-400 transition-colors">Help Center</a></li>
                        </ul>
                    </div>

                    {/* Legal / Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-violet-400 transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-violet-400 transition-colors">Contact</a></li>
                            <li><a href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-violet-400 transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>

                </div>

                <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} EduSure Platform. Built for standard viva presentation.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
