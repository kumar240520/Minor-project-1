import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, Menu, X, FileText, Calendar, LayoutDashboard, 
  BookOpen, MessageSquare, Folder, Award, Settings as SettingsIcon, 
  HelpCircle, ChevronRight
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useSidebar } from './Sidebar';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ResponsiveHeader = ({ 
  title, 
  showSearch = true, 
  showNotifications = true,
  showProfile = true,
  className = "",
  onSearch = null
}) => {
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  
  // States
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ pages: [], materials: [], events: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [userId, setUserId] = useState(null);
  
  const searchRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchUnreadCount(user.id);
      }
    };
    fetchUserData();
  }, []);

  const fetchUnreadCount = async (uid) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('is_read', false);
        
      if (!error) setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        executeSearch(searchQuery);
      } else {
        setSearchResults({ pages: [], materials: [], events: [] });
        setShowSearchDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const executeSearch = async (query) => {
    setIsSearching(true);
    
    // 1. Search Static App Pages/Routes
    const appPages = [
      { id: 'p1', title: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', desc: 'Overview and stats' },
      { id: 'p2', title: 'PYQs', path: '/pyqs', icon: 'FileText', desc: 'Previous Year Questions' },
      { id: 'p3', title: 'Placement Materials', path: '/placement-materials', icon: 'BookOpen', desc: 'Study guides & resources' },
      { id: 'p4', title: 'Community Post', path: '/community', icon: 'MessageSquare', desc: 'Discussions & Q&A' },
      { id: 'p5', title: 'My Materials', path: '/my-materials', icon: 'Folder', desc: 'Your uploaded files' },
      { id: 'p6', title: 'Calendar', path: '/calendar', icon: 'Calendar', desc: 'Events and schedules' },
      { id: 'p7', title: 'Rewards', path: '/rewards', icon: 'Award', desc: 'EduCoins & Leaderboard' },
      { id: 'p8', title: 'Settings', path: '/settings', icon: 'Settings', desc: 'Profile and preferences' },
      { id: 'p9', title: 'Help & Support', path: '/help', icon: 'HelpCircle', desc: 'Tickets and assistance' },
      { id: 'p10', title: 'Notifications', path: '/dashboard', icon: 'Bell', desc: 'Your recent alerts' },
    ];
    
    const pageResults = appPages
      .filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3);
      
    let materialResults = [];
    let eventResults = [];

    try {
      // 2. Search Materials Table
      const { data: materials, error: matError } = await supabase
        .from('materials')
        .select('id, title, subject')
        .eq('status', 'approved')
        .ilike('title', `%${query}%`)
        .limit(4);

      if (!matError && materials) {
        materialResults = materials;
      }

      // 3. Search Calendar Events Table
      const { data: { user } } = await supabase.auth.getUser();
      const { data: events, error: evError } = await supabase
        .from('calendar_events')
        .select('id, title, date, type')
        .or(`is_global.eq.true,user_id.eq.${user?.id}`)  // Global events OR user's own events
        .ilike('title', `%${query}%`)
        .limit(3);

      if (!evError && events) {
        eventResults = events;
      }

    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearchResults({
        pages: pageResults,
        materials: materialResults,
        events: eventResults
      });
      setIsSearching(false);
      setShowSearchDropdown(true);
    }
  };

  const getPageIcon = (iconName) => {
    switch(iconName) {
      case 'LayoutDashboard': return <LayoutDashboard className="h-4 w-4" />;
      case 'FileText': return <FileText className="h-4 w-4" />;
      case 'BookOpen': return <BookOpen className="h-4 w-4" />;
      case 'MessageSquare': return <MessageSquare className="h-4 w-4" />;
      case 'Folder': return <Folder className="h-4 w-4" />;
      case 'Calendar': return <Calendar className="h-4 w-4" />;
      case 'Award': return <Award className="h-4 w-4" />;
      case 'Settings': return <SettingsIcon className="h-4 w-4" />;
      case 'HelpCircle': return <HelpCircle className="h-4 w-4" />;
      case 'Bell': return <Bell className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const hasResults = searchResults.pages.length > 0 || searchResults.materials.length > 0 || searchResults.events.length > 0;

  return (
    <header className={`bg-white border-b border-gray-200 h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 z-40 shrink-0 ${className}`}>
      <div className="flex items-center space-x-3 lg:space-x-0">
        <button 
          onClick={() => {
            console.log('Mobile menu button clicked');
            toggleSidebar();
          }} 
          className="lg:hidden p-3 rounded-lg hover:bg-gray-100 transition-colors relative z-50 cursor-pointer active:scale-95"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-lg lg:text-2xl font-bold text-gray-800 truncate">{title}</h1>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-6">
        
        {/* Universal Search Bar */}
        {showSearch && (
          <div className="relative hidden md:block" ref={searchRef}>
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              onFocus={() => { if(hasResults || searchQuery.trim().length > 1) setShowSearchDropdown(true); }}
              placeholder="Search everything..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-48 lg:w-64 xl:w-80 bg-gray-50 transition-all focus:bg-white"
            />
            
            {/* Mega Dropdown Results */}
            <AnimatePresence>
              {showSearchDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-12 left-0 w-full min-w-[320px] bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50 py-2"
                >
                  {isSearching ? (
                    <div className="px-4 py-6 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-sm">Searching EduSure...</span>
                    </div>
                  ) : hasResults ? (
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      
                      {/* Pages / Modules Section */}
                      {searchResults.pages.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 text-xs font-bold tracking-wider text-gray-400 uppercase bg-gray-50/50">App Modules</div>
                          {searchResults.pages.map((item) => (
                            <Link 
                              key={item.id} 
                              to={item.path} 
                              className="flex items-center px-4 py-2.5 hover:bg-violet-50 transition-colors group border-l-2 border-transparent hover:border-violet-500"
                              onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); }}
                            >
                              <div className="bg-violet-100 text-violet-600 p-2 rounded-lg mr-3 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                {getPageIcon(item.icon)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.title}</h4>
                                <p className="text-xs text-gray-400 line-clamp-1">{item.desc}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-violet-500 transition-colors" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Materials Section */}
                      {searchResults.materials.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 text-xs font-bold tracking-wider text-gray-400 uppercase bg-gray-50/50">Materials & PYQs</div>
                          {searchResults.materials.map((item) => (
                            <Link 
                              key={item.id} 
                              to="/placement-materials" 
                              className="flex items-center px-4 py-2.5 hover:bg-blue-50 transition-colors group border-l-2 border-transparent hover:border-blue-500"
                              onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); }}
                            >
                              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.title}</h4>
                                <p className="text-xs text-gray-500 line-clamp-1">{item.subject || 'Material'}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Events Section */}
                      {searchResults.events.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 text-xs font-bold tracking-wider text-gray-400 uppercase bg-gray-50/50">Calendar Events</div>
                          {searchResults.events.map((item) => (
                            <Link 
                              key={item.id} 
                              to="/calendar" 
                              className="flex items-center px-4 py-2.5 hover:bg-amber-50 transition-colors group border-l-2 border-transparent hover:border-amber-500"
                              onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); }}
                            >
                              <div className="bg-amber-100 text-amber-600 p-2 rounded-lg mr-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                <Calendar className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.title}</h4>
                                <p className="text-xs text-gray-500 line-clamp-1">
                                    {new Date(item.date).toLocaleDateString()} &bull; {item.type}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center flex flex-col items-center">
                        <div className="bg-gray-50 p-3 rounded-full mb-3">
                            <Search className="h-6 w-6 text-gray-300" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">No results found</span>
                        <span className="text-xs text-gray-400 mt-1">Try tweaking your search term.</span>
                    </div>
                  )}
                  
                  {/* Search Footer Indicator */}
                  {hasResults && !isSearching && (
                      <div className="px-4 py-2.5 bg-gray-50/50 border-t border-gray-100 text-center">
                          <span className="text-xs text-gray-400 font-medium">Press <kbd className="font-mono bg-white border border-gray-200 rounded px-1 min-w-[20px] inline-block shadow-sm">esc</kbd> to close</span>
                      </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Mobile Search Icon */}
        {showSearch && (
          <button className="md:hidden p-2 text-gray-400 hover:text-violet-600 transition-colors">
            <Search className="h-5 w-5" />
          </button>
        )}

        {showNotifications && (
          <Link to="/dashboard" className="relative p-2 text-gray-400 hover:text-violet-600 transition-colors rounded-full hover:bg-violet-50 block">
            <Bell className="h-5 w-5 lg:h-6 lg:w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white flex items-center justify-center text-[9px] font-bold rounded-full border-2 border-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        )}

        {showProfile && (
          <Link to="/profile" className="h-8 w-8 lg:h-10 lg:w-10 rounded-full border-2 border-violet-200 overflow-hidden cursor-pointer shadow-sm hover:border-violet-500 transition-colors block">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || "default"}`} 
              alt="Profile" 
              className="h-full w-full object-cover bg-violet-100" 
            />
          </Link>
        )}
      </div>
    </header>
  );
};

export default ResponsiveHeader;
