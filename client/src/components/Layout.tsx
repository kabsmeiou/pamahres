"use client"

import { useState, useEffect } from "react"
import { Outlet, Link } from "react-router-dom"
import Sidebar from "./Sidebar"
import { Menu, User, Search } from "react-feather"
import { NAME_PLACEHOLDER } from "./dummies"

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* Mobile Sidebar Overlay */}
      {isMobile && showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-surface-900/50 z-40 backdrop-blur-sm"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed z-50' : 'relative'}
        ${isMobile && !showMobileSidebar ? '-translate-x-full' : 'translate-x-0'}
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar 
          collapsed={collapsed} 
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          onClose={() => setShowMobileSidebar(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-surface-200 flex items-center px-4 sticky top-0 z-15 shadow-sm">
          <div className="flex items-center gap-4 w-full max-w-screen-2xl mx-auto">
            {isMobile && (
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="p-2 hover:bg-surface-100 rounded-lg mr-2 text-surface-600 hover:text-surface-900 transition-colors"
              >
                <Menu size={24} />
              </button>
            )}

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
                <Search className="absolute left-3 top-2.5 text-surface-400" size={20} />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Link 
                to="/settings" 
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                  <User size={18} />
                </div>
                <span className="text-sm font-medium text-surface-900 hidden sm:block">{NAME_PLACEHOLDER}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 py-8 max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout
