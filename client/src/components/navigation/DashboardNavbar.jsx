// DashboardNavbar with deep-link search navigation
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  FileText,
  BookOpen,
  MessageSquare,
  Calendar,
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Clock3,
  ReceiptText,
  Users,
  X,
  Download,
  Check,
  Loader2,
  Sparkles,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useSidebar } from './SidebarContext';
import ThemeToggle from '../ThemeToggle';
import { downloadMaterialFile } from '../../utils/materials';
import { searchAPI } from '../../services/api';

export default function DashboardNavbar({
  title = 'Overview',
  subtitle,
  role = 'student',
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  user: initialUser,
  onLogout
}) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { toggleSidebar, isDesktop, desktopWidth, springTransition } = useSidebar();

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ pages: [], pyqs: [], materials: [], all: [] });
  const [suggestions, setSuggestions] = useState({ subjects: [], trendingPyqs: [], trendingMaterials: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchTab, setSearchTab] = useState('all'); // 'all' | 'pyqs' | 'materials'
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState(null);

  // Notifications states
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef(null);

  // Profile states
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(initialUser || {
    name: role === 'admin' ? 'System Admin' : 'Student Member',
    email: '',
    role: role === 'admin' ? 'Administrator' : 'Student'
  });
  const [userId, setUserId] = useState(null);

  // Fetch user data & notifications (adapted to role)
  useEffect(() => {
    let isMounted = true;
    const fetchUserAndNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          setUserId(user.id);
          
          // Fetch verified user profile from public.users table
          const { data: dbUser } = await supabase
            .from('users')
            .select('id, name, full_name, role, avatar_url, email')
            .eq('id', user.id)
            .maybeSingle();

          const resolvedName = dbUser?.full_name || 
                               dbUser?.name || 
                               user.user_metadata?.full_name || 
                               user.user_metadata?.name || 
                               user.email?.split('@')[0] || 
                               'Student';

          const actualRole = dbUser?.role || role || 'student';
          const formattedRole = actualRole === 'admin' ? 'Administrator' : 'Student';
          const resolvedAvatar = dbUser?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture;

          setCurrentUser({
            email: dbUser?.email || user.email || '',
            name: resolvedName,
            role: formattedRole,
            avatar_url: resolvedAvatar
          });
        }

        if (role === 'admin') {
          // Admin live notifications: pending materials, transactions, recent signups
          const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          const [
            { data: pendingMaterials },
            { data: recentTxns },
            { data: recentUsers }
          ] = await Promise.all([
            supabase.from('materials').select('id, title, subject, created_at').eq('status', 'pending').limit(4),
            supabase.from('transactions').select('id, amount, description, created_at').gte('created_at', cutoff).limit(3),
            supabase.from('users').select('id, name, email, created_at').gte('created_at', cutoff).limit(3)
          ]);

          if (isMounted) {
            const adminNotifs = [];
            if (pendingMaterials) {
              pendingMaterials.forEach(m => adminNotifs.push({
                id: `mat-${m.id}`,
                title: 'Material Pending Approval',
                message: m.title || 'New study resource submitted',
                link: '/admin/materials',
                time: 'Pending'
              }));
            }
            if (recentTxns) {
              recentTxns.forEach(t => adminNotifs.push({
                id: `tx-${t.id}`,
                title: 'New Transaction',
                message: `${t.description || 'EduCoins activity'}`,
                link: '/admin/transactions',
                time: 'Recent'
              }));
            }
            if (recentUsers) {
              recentUsers.forEach(u => adminNotifs.push({
                id: `u-${u.id}`,
                title: 'New User Registered',
                message: u.name || u.email || 'Student joined platform',
                link: '/admin/users',
                time: 'Recent'
              }));
            }
            setNotifications(adminNotifs);
            setUnreadCount(adminNotifs.length);
          }
        } else {
          // Student / Patient notifications
          if (user) {
            const { count, data } = await supabase
              .from('notifications')
              .select('*', { count: 'exact' })
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(5);

            if (isMounted) {
              setUnreadCount(count || 0);
              if (data && data.length > 0) {
                setNotifications(data);
              } else {
                setNotifications([
                  { id: '1', title: 'Welcome to EduSure', message: 'Explore past year questions, study guides, and campus notes.', link: '/pyqs', time: 'Just now' },
                  { id: '2', title: 'Rewards Active', message: 'Earn EduCoins by sharing approved academic notes.', link: '/rewards', time: 'Today' }
                ]);
              }
            }
          }
        }
      } catch (err) {
        console.error('Navbar fetch error:', err);
      }
    };

    fetchUserAndNotifications();
    return () => { isMounted = false; };
  }, [role]);

  // Fetch search suggestions and trending resources on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSuggestions = async () => {
      try {
        const res = await searchAPI.getSuggestions();
        if (isMounted && res?.success && res.suggestions) {
          setSuggestions(res.suggestions);
        }
      } catch (err) {
        console.warn('Failed to fetch search suggestions:', err);
      }
    };
    fetchSuggestions();
    return () => { isMounted = false; };
  }, []);

  // Click outside listener for all dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      const isInsideDesktopSearch = searchRef.current && searchRef.current.contains(e.target);
      const isInsideMobileSearch = mobileSearchRef.current && mobileSearchRef.current.contains(e.target);

      if (!isInsideDesktopSearch && !isInsideMobileSearch) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        executeSearch(searchQuery);
      } else {
        setSearchResults({ pages: [], pyqs: [], materials: [], all: [] });
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const executeSearch = async (query) => {
    setIsSearching(true);
    const qLower = query.toLowerCase();

    const appPages = role === 'admin' ? [
      { id: 'p1', title: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
      { id: 'p2', title: 'Pending Approvals', path: '/admin/approvals', icon: Clock3 },
      { id: 'p3', title: 'Materials Approval', path: '/admin/materials', icon: BookOpen },
      { id: 'p4', title: 'User Directory', path: '/admin/users', icon: Users },
      { id: 'p5', title: 'Transactions Ledger', path: '/admin/transactions', icon: ReceiptText },
      { id: 'p6', title: 'Access Control', path: '/admin/auth-settings', icon: ShieldCheck },
    ] : [
      { id: 'p1', title: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard },
      { id: 'p2', title: 'PYQs & Question Papers', path: '/pyqs', icon: FileText },
      { id: 'p3', title: 'Placement & Lecture Materials', path: '/placement-materials', icon: BookOpen },
      { id: 'p4', title: 'Community Doubt Solving', path: '/community', icon: MessageSquare },
      { id: 'p5', title: 'Calendar & Schedules', path: '/calendar', icon: Calendar },
      { id: 'p6', title: 'Rewards & EduCoins', path: '/rewards', icon: Award },
    ];

    const matchedPages = appPages.filter((p) => p.title.toLowerCase().includes(qLower)).slice(0, 3);
    let matchedPyqs = [];
    let matchedMaterials = [];
    let matchedAll = [];

    try {
      // 1. Call Backend Search API
      const searchRes = await searchAPI.search(query, { limit: 25 });
      if (searchRes?.success && searchRes.results) {
        matchedPyqs = searchRes.results.pyqs || [];
        matchedMaterials = searchRes.results.materials || [];
        matchedAll = searchRes.results.all || [];
      } else {
        throw new Error('Fallback to client query');
      }
    } catch (apiErr) {
      console.warn('Backend search API unreachable or failed, falling back to direct Supabase:', apiErr);
      try {
        const { data: records } = await supabase
          .from('materials')
          .select('*')
          .eq('status', 'approved')
          .or(`title.ilike.%${query}%,subject.ilike.%${query}%,category.ilike.%${query}%`)
          .limit(25);

        if (records) {
          records.forEach((r) => {
            const isPyq = r.type === 'pyq' || (r.category && String(r.category).toLowerCase().includes('pyq')) || /pyq|paper|sem/i.test(r.title);
            const bucket = r.storage_bucket || 'Storage';
            const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(r.file_url);
            const ext = (r.file_name || r.file_url || '').split('.').pop().toLowerCase();
            const formatted = {
              ...r,
              is_pyq: isPyq,
              computed_type: isPyq ? 'pyq' : 'material',
              badge_label: isPyq ? 'PYQ' : (r.category || 'Notes'),
              preview_url: pubData?.publicUrl || '',
              preview_kind: ext === 'pdf' ? 'pdf' : ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? 'image' : 'unsupported',
              download_url: pubData?.publicUrl || '',
              direct_download_url: `/api/materials/${r.id}/download`,
              file_type: r.file_type || ext.toUpperCase() || 'PDF'
            };
            matchedAll.push(formatted);
            if (isPyq) matchedPyqs.push(formatted);
            else matchedMaterials.push(formatted);
          });
        }
      } catch (sbErr) {
        console.error('Supabase fallback search error:', sbErr);
      }
    } finally {
      setSearchResults({
        pages: matchedPages,
        pyqs: matchedPyqs,
        materials: matchedMaterials,
        all: matchedAll
      });
      setIsSearching(false);
      setShowSearchDropdown(true);
    }
  };

  // Navigate directly to PYQs or Materials space filtered to show only that material
  const handleItemClick = (item, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!item) return;

    setShowSearchDropdown(false);
    setMobileSearchOpen(false);
    setSearchQuery('');

    const isPyq = item.is_pyq || item.type === 'pyq' || String(item.category || '').toLowerCase().includes('pyq') || /pyq|paper/i.test(item.title || '');

    if (isPyq) {
      navigate(`/pyqs?id=${item.id}&search=${encodeURIComponent(item.title || '')}`);
    } else {
      navigate(`/placement-materials?id=${item.id}&search=${encodeURIComponent(item.title || '')}`);
    }
  };

  // Download Material / PYQ with reliable dual fallback
  const handleDownloadMaterial = async (item, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!item) return;
    const id = item.id;
    setDownloadingId(id);

    try {
      const viewerRole = currentUser?.role === 'Administrator' ? 'admin' : 'student';

      // Attempt authenticated download
      try {
        await downloadMaterialFile(item, { viewerRole });
      } catch (authOrClientErr) {
        console.warn('Client-side download encountered exception, triggering direct backend streaming download:', authOrClientErr);
        // Direct backend streaming download endpoint (forces Content-Disposition attachment)
        const downloadUrl = `/api/materials/${id}/download`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', item.file_name || `${item.title || 'material'}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        await searchAPI.recordDownload(id).catch(() => {});
      }

      setDownloadSuccessId(id);
      setTimeout(() => setDownloadSuccessId(null), 2500);
    } catch (err) {
      console.error('Download execution failed:', err);
      alert('Could not download file right now. Please try opening the file preview.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSignOut = async () => {
    if (onLogout) {
      await onLogout();
      return;
    }
    await supabase.auth.signOut();
    navigate('/login');
  };

  const hasSearchResults =
    searchResults.pages.length > 0 ||
    searchResults.pyqs.length > 0 ||
    searchResults.materials.length > 0 ||
    searchResults.all.length > 0;

  return (
    <header
      aria-label="Dashboard Top Bar"
      className="sticky top-0 z-30 h-16 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between px-3 sm:px-6 lg:px-8 select-none"
    >
      {/* ── Zone 1: Left (Mobile / Touch Hamburger Menu + Workspace Context) ── */}
      <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 min-w-0">
        {/* Mobile / Touch Hamburger menu trigger */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Open navigation sidebar"
          className={`${isDesktop ? 'hidden' : 'flex'} p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 shrink-0`}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workspace context */}
        <div className="flex flex-col min-w-0">
          <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100 truncate tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate hidden md:block mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── Zone 2: Center (Global Search Control) ── */}
      {showSearch && (
        <div className="relative flex-1 max-w-xs md:max-w-md lg:max-w-lg mx-3 lg:mx-8 hidden sm:block" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowSearchDropdown(false);
                } else if (e.key === 'Enter') {
                  if (searchQuery.trim()) {
                    setShowSearchDropdown(false);
                    if (searchTab === 'pyqs' || searchResults.pyqs.length > searchResults.materials.length) {
                      navigate(`/pyqs?search=${encodeURIComponent(searchQuery.trim())}`);
                    } else {
                      navigate(`/placement-materials?search=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }
                }
              }}
              placeholder={role === 'admin' ? 'Search admin records, users, logs...' : 'Search PYQs, study notes, subjects (e.g. DSA, ADA, OOPS)...'}
              className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm rounded-xl bg-slate-100/70 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-150 shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-10 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {/* Trailing shortcut indicator */}
            <div className="absolute right-3 hidden lg:flex items-center gap-1 pointer-events-none">
              <kbd className="text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 shadow-xs">
                esc
              </kbd>
            </div>
          </div>

          {/* Search Dropdown Popover */}
          <AnimatePresence>
            {showSearchDropdown && (
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-12 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/15 overflow-hidden z-50 py-2.5 max-h-[460px] flex flex-col"
              >
                {/* 1. When search query is empty: Suggestions & Popular Subjects */}
                {!searchQuery.trim() ? (
                  <div className="overflow-y-auto no-scrollbar p-3 space-y-3.5">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Popular Subjects
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(suggestions.subjects.length > 0
                          ? suggestions.subjects
                          : ['DSA', 'ADA', 'OOPS', 'Computer Networks', 'Probability & Statistics', 'Operating System', 'Sensors']
                        ).slice(0, 8).map((subject) => (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => {
                              setSearchQuery(subject);
                              executeSearch(subject);
                            }}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-violet-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 border border-slate-200/70 dark:border-slate-700 transition-colors"
                          >
                            {subject}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Trending PYQs */}
                    {suggestions.trendingPyqs && suggestions.trendingPyqs.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-violet-500" />
                            Trending PYQs
                          </span>
                          <Link
                            to="/pyqs"
                            onClick={() => setShowSearchDropdown(false)}
                            className="text-violet-600 dark:text-violet-400 hover:underline text-[10px] lowercase first-letter:uppercase"
                          >
                            view all
                          </Link>
                        </div>
                        <div className="space-y-1">
                          {suggestions.trendingPyqs.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              onClick={(e) => handleItemClick(item, e)}
                              className="group flex items-center justify-between p-2 rounded-xl hover:bg-violet-50/70 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-violet-100 dark:hover:border-slate-700"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                                  <FileText className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400">
                                    {item.title}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {item.subject} • {item.downloads || 0} downloads
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <button
                                  type="button"
                                  onClick={(e) => handleDownloadMaterial(item, e)}
                                  title="Download PYQ"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-950/50 transition-colors"
                                >
                                  {downloadingId === item.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-600" />
                                  ) : downloadSuccessId === item.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Download className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 2. When search query is entered: Filter Tabs & Results */
                  <div className="flex flex-col h-full min-h-0">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 px-3 pb-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
                      <button
                        type="button"
                        onClick={() => setSearchTab('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                          searchTab === 'all'
                            ? 'bg-violet-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        All ({searchResults.all.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchTab('pyqs')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1 ${
                          searchTab === 'pyqs'
                            ? 'bg-violet-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <FileText className="w-3 h-3" />
                        PYQs ({searchResults.pyqs.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchTab('materials')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1 ${
                          searchTab === 'materials'
                            ? 'bg-violet-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <BookOpen className="w-3 h-3" />
                        Notes ({searchResults.materials.length})
                      </button>
                      {searchResults.pages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchTab('pages')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                            searchTab === 'pages'
                              ? 'bg-violet-600 text-white'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          Pages ({searchResults.pages.length})
                        </button>
                      )}
                    </div>

                    {/* Results Container */}
                    <div className="overflow-y-auto no-scrollbar flex-1 p-2 space-y-1">
                      {isSearching ? (
                        <div className="px-4 py-8 text-center text-xs text-slate-400">
                          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          Searching study materials & PYQs...
                        </div>
                      ) : hasSearchResults ? (
                        <>
                          {/* PYQs Section */}
                          {(searchTab === 'all' || searchTab === 'pyqs') && searchResults.pyqs.length > 0 && (
                            <div className="mb-2">
                              {searchTab === 'all' && (
                                <div className="px-2 py-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center justify-between">
                                  <span>Previous Year Questions ({searchResults.pyqs.length})</span>
                                  <Link
                                    to={`/pyqs?search=${encodeURIComponent(searchQuery)}`}
                                    onClick={() => setShowSearchDropdown(false)}
                                    className="hover:underline lowercase first-letter:uppercase"
                                  >
                                    view in pyqs →
                                  </Link>
                                </div>
                              )}
                              {(searchTab === 'all' ? searchResults.pyqs.slice(0, 4) : searchResults.pyqs).map((item) => (
                                <div
                                  key={item.id}
                                  onClick={(e) => handleItemClick(item, e)}
                                  className="group flex items-center justify-between p-2 rounded-xl hover:bg-violet-50/70 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-violet-100 dark:hover:border-slate-700"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400">
                                          {item.title}
                                        </p>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 shrink-0">
                                          PYQ
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                        {item.subject || 'Previous Paper'} {item.year ? `• ${item.year}` : ''} • {item.downloads || 0} downloads
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                    <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400 group-hover:underline hidden sm:inline">
                                      Open in PYQs →
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleDownloadMaterial(item, e)}
                                      title="Download PYQ directly"
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-violet-600 dark:hover:bg-violet-600 transition-colors"
                                    >
                                      {downloadingId === item.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-600" />
                                      ) : downloadSuccessId === item.id ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <Download className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Materials / Notes Section */}
                          {(searchTab === 'all' || searchTab === 'materials') && searchResults.materials.length > 0 && (
                            <div className="mb-2">
                              {searchTab === 'all' && (
                                <div className="px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                                  <span>Study Materials & Notes ({searchResults.materials.length})</span>
                                  <Link
                                    to={`/placement-materials?search=${encodeURIComponent(searchQuery)}`}
                                    onClick={() => setShowSearchDropdown(false)}
                                    className="hover:underline lowercase first-letter:uppercase"
                                  >
                                    view in notes →
                                  </Link>
                                </div>
                              )}
                              {(searchTab === 'all' ? searchResults.materials.slice(0, 4) : searchResults.materials).map((item) => (
                                <div
                                  key={item.id}
                                  onClick={(e) => handleItemClick(item, e)}
                                  className="group flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-emerald-100 dark:hover:border-slate-700"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                      <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                          {item.title}
                                        </p>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                                          {item.category || 'Notes'}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                        {item.subject || 'Study Guide'} • {item.downloads || 0} downloads
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline hidden sm:inline">
                                      Open in Notes →
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleDownloadMaterial(item, e)}
                                      title="Download notes directly"
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-600 dark:hover:bg-emerald-600 transition-colors"
                                    >
                                      {downloadingId === item.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                      ) : downloadSuccessId === item.id ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <Download className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* App Pages / Modules */}
                          {(searchTab === 'all' || searchTab === 'pages') && searchResults.pages.length > 0 && (
                            <div>
                              {searchTab === 'all' && (
                                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  App Modules
                                </div>
                              )}
                              {searchResults.pages.map((p) => {
                                const Icon = p.icon;
                                return (
                                  <Link
                                    key={p.id}
                                    to={p.path}
                                    onClick={() => {
                                      setShowSearchDropdown(false);
                                      setSearchQuery('');
                                    }}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                                  >
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex-1 truncate">
                                      {p.title}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" />
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="px-4 py-8 text-center text-xs text-slate-400">
                          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            No study materials or PYQs found for "{searchQuery}"
                          </p>
                          <p className="text-[11px] text-slate-400 mb-3">
                            Try searching for common subjects like DSA, ADA, OOPS, CN, or OS.
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to="/pyqs"
                              onClick={() => setShowSearchDropdown(false)}
                              className="px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 font-semibold text-xs hover:bg-violet-100"
                            >
                              Browse PYQs
                            </Link>
                            <Link
                              to="/placement-materials"
                              onClick={() => setShowSearchDropdown(false)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200"
                            >
                              Browse Materials
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dropdown Footer */}
                    <div className="px-3 pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Click any row to preview and download</span>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/pyqs?search=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
                        >
                          All PYQs
                        </Link>
                        <span>•</span>
                        <Link
                          to={`/placement-materials?search=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
                        >
                          All Notes
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Zone 3: Right (Contextual Utilities, Alerts, Profile) ── */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Mobile Search Trigger (< sm) */}
        {showSearch && (
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Toggle search"
            className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Theme Toggle Utility */}
        <ThemeToggle />

        {/* Notifications Control & Popover */}
        {showNotifications && (
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-label="Notifications"
              className="relative w-10 h-10 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-xs sm:max-w-sm sm:w-88 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden z-50 py-3"
                >
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-full">
                        {unreadCount} New
                      </span>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto no-scrollbar py-1">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (n.link) navigate(n.link);
                            setNotificationsOpen(false);
                          }}
                          className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800/40 last:border-none"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{n.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.time || 'Today'}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                            {n.message || n.body || 'New platform update available.'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-xs text-slate-400">
                        No new notifications.
                      </div>
                    )}
                  </div>

                  <div className="px-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Link
                      to={role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      {role === 'admin' ? 'View Admin Logs →' : 'View All Alerts →'}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Profile Pill & Popover Menu */}
        {showProfile && (
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="User Profile Menu"
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-2xl bg-slate-100/70 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              {/* Compact Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-violet-200 dark:border-violet-500/30 shrink-0 bg-violet-100 flex items-center justify-center">
                <img
                  src={currentUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || currentUser.name}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Identity text (hidden on constrained screens) */}
              <div className="hidden md:flex flex-col text-left pr-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-tight">
                  {currentUser.role}
                </span>
              </div>
            </button>

            {/* Profile Dropdown Popover */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden z-50 p-1.5 space-y-1"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email || `${currentUser.role} Account`}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-violet-500" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </Link>

                  <Link
                    to="/help"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>Help & Guides</span>
                  </Link>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Mobile Search Input Drawer (< sm) */}
      <AnimatePresence>
        {mobileSearchOpen && showSearch && (
          <motion.div
            ref={mobileSearchRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sm:hidden absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-2xl z-40 max-h-[80vh] flex flex-col"
          >
            <div className="relative flex items-center mb-2.5">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={role === 'admin' ? 'Search records, logs...' : 'Search PYQs, study notes, subjects...'}
                className="w-full pl-9 pr-16 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(false)}
                  className="px-2 py-0.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Mobile Search Results or Suggestions */}
            <div className="overflow-y-auto no-scrollbar max-h-[60vh] space-y-2">
              {!searchQuery.trim() ? (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Popular Subjects
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(suggestions.subjects.length > 0
                      ? suggestions.subjects
                      : ['DSA', 'ADA', 'OOPS', 'Computer Networks', 'Probability & Statistics', 'Sensors']
                    ).slice(0, 6).map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          setSearchQuery(sub);
                          executeSearch(sub);
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              ) : isSearching ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Searching...
                </div>
              ) : hasSearchResults ? (
                <div className="space-y-2">
                  {/* Mobile PYQs */}
                  {searchResults.pyqs.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
                        PYQs ({searchResults.pyqs.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.pyqs.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            onClick={(e) => handleItemClick(item, e)}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer active:scale-[0.99] transition-all"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-violet-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                  {item.title}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {item.subject} • {item.downloads || 0} dl
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <button
                                type="button"
                                onClick={(e) => handleDownloadMaterial(item, e)}
                                className="p-1.5 rounded-lg bg-violet-600 text-white"
                              >
                                {downloadingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : downloadSuccessId === item.id ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile Materials */}
                  {searchResults.materials.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                        Notes ({searchResults.materials.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.materials.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            onClick={(e) => handleItemClick(item, e)}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer active:scale-[0.99] transition-all"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                  {item.title}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {item.subject} • {item.downloads || 0} dl
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <button
                                type="button"
                                onClick={(e) => handleDownloadMaterial(item, e)}
                                className="p-1.5 rounded-lg bg-emerald-600 text-white"
                              >
                                {downloadingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : downloadSuccessId === item.id ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  No matching resources for "{searchQuery}".
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
