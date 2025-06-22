"use client"
import { NavLink } from "react-router-dom"
import { 
  Home, 
  Plus,
  Settings,
  LogOut,
  ChevronLeft, 
  ChevronRight,
  X
} from "react-feather"
import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { Loader2 } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  isMobile?: boolean
  onClose?: () => void
}

import ReactDOM from 'react-dom';

type ConfirmLogoutProps = {
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmLogout({ onConfirm, onCancel }: ConfirmLogoutProps) {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 dark:bg-surface-900/60 animate-fadeIn">
      <div className="bg-white dark:bg-surface-800 rounded-2xl w-full max-w-md shadow-xl border border-surface-100/50 dark:border-surface-700/50 overflow-hidden animate-scaleIn transition-all duration-300">
        {/* Header with gradient border bottom */}
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400"></div>
          <div className="flex items-start justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-full">
                <LogOut size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                Logout Confirmation
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:text-surface-100 dark:hover:bg-surface-700 p-1.5 rounded-full transition-colors"
              aria-label="Close confirmation modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-5">
          <p className="text-surface-600 dark:text-surface-300">
            Time for a rest? You can always come back later!
          </p>
        </div>
        
        <div className="px-6 py-5 flex justify-end gap-3 bg-surface-50/70 dark:bg-surface-700/20">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100 hover:text-surface-900 rounded-lg transition dark:text-surface-300 dark:hover:bg-surface-700 dark:hover:text-surface-100 border border-surface-200 dark:border-surface-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition shadow-sm dark:from-red-600 dark:to-red-700 dark:hover:from-red-500 dark:hover:to-red-600"
          >
            Yes, logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
function LogoutAnimation() {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/60 px-4 animate-fade-in dark:bg-surface-800/60">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-soft animate-scale-in transition-all duration-500 border border-surface-100 dark:bg-surface-800 dark:border-surface-700">
        {/* Header with icon */}
        <div className="flex items-center justify-center px-8 py-6 border-b border-surface-100 dark:border-surface-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 rounded-full dark:bg-primary-900">
              <LogOut className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Signing out</h3>
          </div>
        </div>
        
        {/* Content with spinner */}
        <div className="p-10 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-primary-600 dark:text-primary-400 animate-spin" />
              <span className="absolute inset-0 w-10 h-10 rounded-full border-2 border-primary-100 dark:border-primary-700 animate-pulse"></span>
            </div>
            <div className="space-y-3">
              <p className="text-surface-800 font-medium text-lg dark:text-surface-100">Securely logging you out...</p>
              <p className="text-surface-500 dark:text-surface-400">This will only take a moment</p>
            </div>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-8">
            <span className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce dark:bg-primary-400"></span>
            <span className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce dark:bg-primary-400" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce dark:bg-primary-400" style={{ animationDelay: '0.2s' }}></span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

const Sidebar = ({ collapsed, setCollapsed, isMobile, onClose }: SidebarProps) => {
  const { signOut } = useAuth(); // Use Clerk's signOut function
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setShowConfirmation(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      setShowConfirmation(false);
      // set a 1 second delay to show the logout animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      await signOut({ redirectUrl: '/' }); // Sign out and redirect to home
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div 
      className={`
        ${collapsed ? 'w-20' : 'w-72'}
        ${isLoggingOut ? 'bg-surface-800' : 'bg-white'}
        h-screen flex flex-col shadow-xl
        transition-all duration-300 ease-in-out
        dark:bg-surface-800 relative
        border-r border-surface-100/60 dark:border-surface-700/40
      `}
    >

      {isLoggingOut && <LogoutAnimation />}
      {showConfirmation && (
        ConfirmLogout({
          onConfirm: handleConfirmLogout,
          onCancel: () => setShowConfirmation(false)
        })
      )}
      
      <div className="p-5 border-b border-surface-100 dark:border-surface-700 flex items-center justify-between">
        <div className="flex items-center">
          {!collapsed && (
            <h1 className="text-xl font-bold flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-900 flex items-center justify-center text-white shadow-md ring-2 ring-primary-200 dark:ring-primary-900/50">
                <span className="text-lg font-bold">P</span>
              </div>
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent font-extrabold tracking-tight">Pamahres</span>
            </h1>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-900 flex items-center justify-center text-white shadow-md ring-2 ring-primary-200 dark:ring-primary-900/50">
              <span className="text-lg font-bold">P</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isMobile && (
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 dark:text-surface-300 transition-all hover:shadow-sm"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
          {!isMobile && (
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 dark:text-surface-300 transition-all hover:shadow-sm"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-surface-200 dark:scrollbar-thumb-surface-600 scrollbar-track-transparent">
        <nav className="px-4 space-y-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-gradient-to-r from-primary-50/90 to-primary-100/90 text-primary-600 dark:from-primary-900/90 dark:to-primary-800/90 dark:text-primary-400 shadow-sm' 
                : 'text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100/80 dark:hover:bg-surface-800/60'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                  <Home size={20} className={`${isActive ? 'animate-subtle-bounce' : ''}`} />
                </div>
                {!collapsed && <span className={`ml-3 font-medium ${isActive ? 'font-semibold' : ''}`}>Dashboard</span>}
              </>
            )}
          </NavLink>
          
          <NavLink
            to="/create-course"
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-gradient-to-r from-primary-50/90 to-primary-100/90 text-primary-600 dark:from-primary-900/90 dark:to-primary-800/90 dark:text-primary-400 shadow-sm' 
                : 'text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100/80 dark:hover:bg-surface-800/60'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                  <Plus size={20} className={`${isActive ? 'animate-subtle-bounce' : ''}`} />
                </div>
                {!collapsed && <span className={`ml-3 font-medium ${isActive ? 'font-semibold' : ''}`}>Create Course</span>}
              </>
            )}
          </NavLink>
          
          <NavLink
            to="/settings"
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-gradient-to-r from-primary-50/90 to-primary-100/90 text-primary-600 dark:from-primary-900/90 dark:to-primary-800/90 dark:text-primary-400 shadow-sm' 
                : 'text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100/80 dark:hover:bg-surface-800/60'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                  <Settings size={20} className={`${isActive ? 'animate-subtle-bounce' : ''}`} />
                </div>
                {!collapsed && <span className={`ml-3 font-medium ${isActive ? 'font-semibold' : ''}`}>Settings</span>}
              </>
            )}
          </NavLink>
        </nav>
      </div>
      
      <div className="p-4 border-t border-surface-100 dark:border-surface-700/50">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200
            text-surface-600 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200
            hover:bg-red-50 dark:hover:bg-red-900/20 group
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <div className="relative">
            <LogOut size={20} className="group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </div>
          {!collapsed && <span className="ml-3 font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Logout</span>}
        </button>
      </div>
    </div>
  )
}
export default Sidebar;

