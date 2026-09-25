import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  LayoutDashboard,
  FileText,
  Calendar,
  Award,
  MessageSquare,
  Folder,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Clock3,
  FileCheck,
  BookOpenCheck,
  Users,
  ShieldCheck,
  ReceiptText,
  AlertOctagon,
  CalendarDays,
  BarChart3,
  Mail,
  Hospital,
  HeartPulse,
  Pill,
  Microscope,
  Activity,
  User,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useSidebar } from './SidebarContext';

// ── Built-in Role Navigation Presets ──────────────────────────────────────────
export const ROLE_PRESETS = {
  // Student / Patient Portal
  student: {
    brand: {
      name: 'EduSure',
      roleContext: 'Student Portal',
      icon: BookOpen,
      homePath: '/dashboard'
    },
    defaultUser: {
      name: 'Student Member',
      role: 'Student',
      email: 'student@edusure.edu'
    },
    groups: [
      {
        id: 'core',
        heading: 'Core Learning',
        items: [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/pyqs', label: 'PYQs Archive', icon: FileText, badge: { label: 'Updated', variant: 'blue' } },
          { path: '/placement-materials', label: 'Study Materials', icon: BookOpen },
        ]
      },
      {
        id: 'activity',
        heading: 'Campus & Activity',
        items: [
          { path: '/community', label: 'Community Hub', icon: MessageSquare, badge: { label: 'Live', variant: 'emerald' } },
          { path: '/my-materials', label: 'My Uploads', icon: Folder },
          { path: '/calendar', label: 'Academic Calendar', icon: Calendar },
        ]
      },
      {
        id: 'account',
        heading: 'Preferences',
        items: [
          { path: '/rewards', label: 'EduCoins & Rewards', icon: Award, badge: { label: 'New', variant: 'amber' } },
          { path: '/settings', label: 'Account Settings', icon: Settings },
          { path: '/help', label: 'Help & Support', icon: HelpCircle },
        ]
      }
    ]
  },

  // Patient Healthcare Portal
  patient: {
    brand: {
      name: 'EduHealth',
      roleContext: 'Patient Portal',
      icon: HeartPulse,
      homePath: '/dashboard'
    },
    defaultUser: {
      name: 'Patient Account',
      role: 'Patient',
      email: 'patient@clinic.org'
    },
    groups: [
      {
        id: 'care',
        heading: 'Clinical Records',
        items: [
          { path: '/dashboard', label: 'Health Overview', icon: LayoutDashboard },
          { path: '/my-materials', label: 'Lab & Diagnostics', icon: FileText, badge: { label: 'New', variant: 'blue' } },
          { path: '/calendar', label: 'Appointments', icon: Calendar },
        ]
      },
      {
        id: 'communication',
        heading: 'Care Team',
        items: [
          { path: '/community', label: 'Care Messages', icon: MessageSquare, badge: { label: 'Live', variant: 'emerald' } },
          { path: '/placement-materials', label: 'Health Guides', icon: BookOpen },
        ]
      },
      {
        id: 'account',
        heading: 'Account & Billing',
        items: [
          { path: '/rewards', label: 'Wellness Rewards', icon: Award },
          { path: '/settings', label: 'Privacy & Security', icon: Settings },
          { path: '/help', label: 'Support & Hotline', icon: HelpCircle },
        ]
      }
    ]
  },

  // Hospital / Healthcare Facility Portal
  hospital: {
    brand: {
      name: 'EduClinic',
      roleContext: 'Hospital Operations',
      icon: Hospital,
      homePath: '/admin/dashboard'
    },
    defaultUser: {
      name: 'Facility Supervisor',
      role: 'Staff Lead',
      email: 'supervisor@hospital.org'
    },
    groups: [
      {
        id: 'clinical',
        heading: 'Clinical Operations',
        items: [
          { path: '/admin/dashboard', label: 'Operations Overview', icon: Hospital },
          { path: '/admin/approvals', label: 'Triage Admissions', icon: HeartPulse, badge: { label: '12 Queue', variant: 'amber' } },
          { path: '/admin/events', label: 'Surgery Schedule', icon: CalendarDays },
          { path: '/admin/users', label: 'Medical Staff', icon: Users },
        ]
      },
      {
        id: 'diagnostics',
        heading: 'Diagnostics & Pharmacy',
        items: [
          { path: '/admin/materials', label: 'EHR Records', icon: FileText },
          { path: '/admin/rewards', label: 'Pharmacy Stock', icon: Pill, badge: { label: 'Low', variant: 'amber' } },
          { path: '/admin/tickets', label: 'Lab Dispatch', icon: Microscope },
        ]
      },
      {
        id: 'administration',
        heading: 'Administration',
        items: [
          { path: '/admin/transactions', label: 'Billing & Claims', icon: ReceiptText },
          { path: '/admin/reports', label: 'Emergency Alert', icon: Activity, isCritical: true },
          { path: '/admin/auth-settings', label: 'HIPAA & Access', icon: ShieldCheck },
        ]
      }
    ]
  },

  // Administrator Dashboard
  admin: {
    brand: {
      name: 'EduAdmin',
      roleContext: 'Control Console',
      icon: ShieldCheck,
      homePath: '/admin/dashboard'
    },
    defaultUser: {
      name: 'System Admin',
      role: 'Superadmin',
      email: 'admin@edusure.edu'
    },
    groups: [
      {
        id: 'management',
        heading: 'Management',
        items: [
          { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
          { path: '/admin/approvals', label: 'Pending Approvals', icon: Clock3, badge: { label: 'Active', variant: 'amber' } },
          { path: '/admin/materials', label: 'Materials Approval', icon: FileCheck },
          { path: '/admin/pyqs', label: 'PYQ Approval', icon: BookOpenCheck },
        ]
      },
      {
        id: 'users-platform',
        heading: 'Users & Platform',
        items: [
          { path: '/admin/users', label: 'User Directory', icon: Users },
          { path: '/admin/auth-settings', label: 'Access Control', icon: ShieldCheck },
          { path: '/admin/rewards', label: 'Rewards Manager', icon: Award },
          { path: '/admin/transactions', label: 'Transactions', icon: ReceiptText },
        ]
      },
      {
        id: 'communications',
        heading: 'Communication & Data',
        items: [
          { path: '/admin/reports', label: 'System Reports', icon: AlertOctagon },
          { path: '/admin/events', label: 'Events Hub', icon: CalendarDays },
          { path: '/admin/committee-posts', label: 'Committee Posts', icon: MessageSquare },
          { path: '/admin/tickets', label: 'Support Tickets', icon: HelpCircle, badge: { label: 'Open', variant: 'blue' } },
          { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
          { path: '/admin/bulk-email', label: 'Bulk Email', icon: Mail },
        ]
      }
    ]
  }
};

export default function DashboardSidebar({
  role = 'student',
  groups: customGroups,
  brand: customBrand,
  user: customUser,
  onLogout
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Context for sidebar interaction
  const {
    isHovered,
    setIsHovered,
    isMobileOpen,
    closeMobile,
    isDesktop
  } = useSidebar();

  // Effective preset configuration
  const preset = ROLE_PRESETS[role] || ROLE_PRESETS.student;
  const brand = customBrand || preset.brand;
  const groups = customGroups || preset.groups;

  // User state
  const [currentUser, setCurrentUser] = useState(customUser || preset.defaultUser);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          setUserId(user.id);
          
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
      } catch (err) {
        console.error('Error fetching user for sidebar:', err);
      }
    };

    fetchUser();
    return () => { isMounted = false; };
  }, [role]);

  const handleSignOut = async () => {
    if (onLogout) {
      await onLogout();
      return;
    }
    await supabase.auth.signOut();
    navigate('/login');
  };

  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 350, damping: 30 };

  const BrandIcon = brand.icon;

  // Active status matcher
  const isItemActive = (path) => {
    if (path === '/dashboard' || path === '/admin/dashboard') {
      return location.pathname === path;
    }
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  const renderBadge = (badge) => {
    if (!badge) return null;
    let badgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    if (badge.variant === 'emerald') {
      badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    } else if (badge.variant === 'amber') {
      badgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    }

    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tracking-wide uppercase ${badgeClass}`}>
        {badge.label}
      </span>
    );
  };

  // Content for both Desktop and Mobile views
  const renderSidebarContent = (isExpandedView, isMobileView = false) => {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 select-none">

        {/* ── 1. Fixed Brand Header (Roughly 72px high with bottom divider) ── */}
        <div className="h-[72px] shrink-0 border-b border-slate-200/80 dark:border-slate-800 px-4 flex items-center justify-between bg-white dark:bg-slate-900">
          <Link
            to={brand.homePath}
            onClick={() => isMobileView && closeMobile()}
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl"
            aria-label={`${brand.name} Home`}
          >
            {/* 40px Rounded Logo Tile (Scales to 1.05 on hover) */}
            <motion.div
              whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20 shrink-0 cursor-pointer"
            >
              <BrandIcon className="w-5 h-5 text-white" />
            </motion.div>

            {/* Revealed Brand & Context Stack */}
            {isExpandedView && (
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="flex flex-col min-w-0 overflow-hidden"
              >
                <span className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight truncate">
                  {brand.name}
                </span>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide truncate">
                  {brand.roleContext}
                </span>
              </motion.div>
            )}
          </Link>

          {/* Mobile Close Control (Visible in mobile drawer) */}
          {isMobileView && (
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Close Sidebar"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ── 2. Independently Scrollable Navigation Region (No visible scrollbar) ── */}
        <nav
          aria-label="Sidebar Navigation"
          className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-4 no-scrollbar [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {groups.map((group) => (
            <div key={group.id} className="space-y-1">
              
              {/* Group Heading (compact uppercase label, only appears when expanded) */}
              {isExpandedView && (
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate"
                >
                  {group.heading}
                </motion.div>
              )}

              {/* Group Rows (Standard row height: 44px (h-11), 12px rounding) */}
              {group.items.map((item) => {
                const isActive = isItemActive(item.path);
                const isCritical = item.isCritical;
                const Icon = item.icon;

                // State treatments adhering strictly to project design & colors
                let rowClasses = '';
                if (isCritical) {
                  rowClasses = isActive
                    ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-500/25'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30';
                } else {
                  rowClasses = isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-md shadow-violet-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/90 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100 font-semibold';
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => isMobileView && closeMobile()}
                    title={!isExpandedView ? item.label : undefined}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group relative flex items-center h-11 w-full rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 overflow-hidden ${rowClasses} ${
                      isExpandedView ? 'px-3 gap-3' : 'justify-center'
                    }`}
                  >
                    {/* Icon (20px icon-first) */}
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform duration-150 ${
                        isActive
                          ? 'text-white'
                          : isCritical
                          ? 'text-rose-500'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                      }`}
                    />

                    {/* Revealed Label & Badge (Only after/while rail expands) */}
                    {isExpandedView && (
                      <motion.div
                        initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="flex items-center justify-between w-full min-w-0 overflow-hidden truncate"
                      >
                        <span className="text-sm truncate">
                          {item.label}
                        </span>
                        {renderBadge(item.badge)}
                      </motion.div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── 3. Fixed Lower Identity & Action Region ── */}
        <div className="shrink-0 p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
          
          {/* Identity Card */}
          <div
            title={!isExpandedView ? `${currentUser.name} (${currentUser.role})` : undefined}
            className={`flex items-center rounded-xl p-1.5 transition-colors ${
              isExpandedView ? 'gap-3 bg-white dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 shadow-sm' : 'justify-center'
            }`}
          >
            {/* Compact 36px Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-violet-200 dark:border-violet-500/30 shrink-0 bg-violet-100 flex items-center justify-center">
              <img
                src={currentUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || currentUser.name || 'EduUser'}`}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <User className="w-4 h-4 text-violet-600 hidden group-hover:block" />
            </div>

            {/* Revealed Role & Account Info */}
            {isExpandedView && (
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col min-w-0 flex-1 truncate"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
                  {currentUser.role}
                </span>
              </motion.div>
            )}
          </div>

          {/* Destructive / Session-Ending Action (Fine divider & red text + pale-red hover) */}
          <div className="border-t border-slate-200/60 dark:border-slate-800 pt-1.5">
            <button
              type="button"
              onClick={handleSignOut}
              title={!isExpandedView ? 'Sign Out' : undefined}
              aria-label="Sign Out"
              className={`flex items-center h-10 w-full rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                isExpandedView ? 'px-3 gap-3' : 'justify-center'
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {isExpandedView && (
                <motion.span
                  initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-xs font-semibold truncate"
                >
                  Sign Out
                </motion.span>
              )}
            </button>
          </div>

        </div>

      </div>
    );
  };

  return (
    <>
      {/* ── Desktop Rail: Only for desktop mouse/pointer devices with hover support (>= 1024px) ── */}
      {isDesktop && (
        <motion.aside
          aria-label="Desktop Navigation Rail"
          initial={false}
          animate={{ width: isHovered ? 260 : 72 }}
          transition={springTransition}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="hidden lg:block fixed top-0 left-0 bottom-0 h-screen z-40 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shadow-[4px_0_24px_rgba(16,26,99,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.35)] overflow-hidden"
        >
          {renderSidebarContent(isHovered, false)}
        </motion.aside>
      )}

      {/* ── Mobile / Tablet / Touch Off-Canvas Drawer (Simple hamburger click opens from left) ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Dim Slate Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
              aria-label="Close Navigation Backdrop"
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
            />

            {/* Complete Expanded Sidebar (280px - 300px width) sliding in from left */}
            <motion.aside
              aria-label="Navigation Drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={springTransition}
              className="fixed top-0 left-0 bottom-0 w-[280px] sm:w-[300px] h-screen z-50 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border-r border-slate-200/80 dark:border-slate-800 flex flex-col"
            >
              {renderSidebarContent(true, true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
