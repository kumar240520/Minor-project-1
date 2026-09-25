import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const SidebarContext = createContext(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    // Provide a resilient fallback so any component outside provider doesn't crash
    return {
      isHovered: false,
      isDesktopExpanded: false,
      isMobileOpen: false,
      isSidebarOpen: false,
      isDesktop: true,
      setIsHovered: () => {},
      setIsMobileOpen: () => {},
      toggleSidebar: () => {},
      closeSidebar: () => {},
      openMobile: () => {},
      closeMobile: () => {},
      toggleMobile: () => {},
      desktopWidth: 72,
      springTransition: { type: 'spring', stiffness: 350, damping: 30 }
    };
  }
  return context;
};

// Internal listener to auto-close drawer on route change
const NavigationListener = ({ onClose }) => {
  try {
    const location = useLocation();
    useEffect(() => {
      onClose();
    }, [location.pathname, onClose]);
  } catch (err) {
    // Graceful fallback if rendered outside a React Router context
  }
  return null;
};

const determineIsDesktop = () => {
  if (typeof window === 'undefined') return true;
  // Screen size check (desktop is 1024px and wider)
  const isLargeScreen = window.innerWidth >= 1024;
  // Touch / hover capability check:
  // Devices without hover capability (e.g. phones, tablets, iPads, touchscreen devices)
  // must NOT follow sidebar hovering; hovering is strictly for desktop mouse devices.
  const cannotHover = window.matchMedia && window.matchMedia('(hover: none)').matches;
  return isLargeScreen && !cannotHover;
};

export const SidebarProvider = ({ children }) => {
  // If already inside an existing SidebarProvider, avoid duplicating state
  const existingContext = useContext(SidebarContext);
  if (existingContext) {
    return <>{children}</>;
  }

  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(determineIsDesktop);

  useEffect(() => {
    const handleResize = () => {
      const desktop = determineIsDesktop();
      setIsDesktop(desktop);
      if (desktop) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktopExpanded = isDesktop && isHovered;
  const desktopWidth = isDesktop ? (isDesktopExpanded ? 260 : 72) : 0;

  // Synchronize CSS variable for seamless global layout alignment
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const widthVal = isDesktop ? `${desktopWidth}px` : '0px';
      document.documentElement.style.setProperty('--sidebar-width', widthVal);
    }
  }, [desktopWidth, isDesktop]);

  const springTransition = {
    type: 'spring',
    stiffness: 350,
    damping: 30
  };

  const toggleSidebar = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const openMobile = useCallback(() => {
    setIsMobileOpen(true);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isHovered,
        setIsHovered,
        isDesktopExpanded,
        isMobileOpen,
        setIsMobileOpen,
        isDesktop,
        desktopWidth,
        springTransition,
        // Backward-compatibility aliases
        isSidebarOpen: isMobileOpen,
        toggleSidebar,
        closeSidebar,
        openMobile,
        closeMobile,
        toggleMobile
      }}
    >
      <NavigationListener onClose={closeMobile} />
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;

