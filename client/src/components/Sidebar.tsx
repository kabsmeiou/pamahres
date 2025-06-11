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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 dark:bg-surface-900/60">
      <div className="bg-white dark:bg-surface-800 rounded-2xl w-full max-w-md shadow-lg animate-fadeIn transition-all duration-300">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-surface-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Logout Confirmation
            </h3>
            <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-surface-700 p-1 rounded-full transition-colors"
            aria-label="Close confirmation modal"
            >
            <X size={20} />
            </button>
        </div>  
        <div>
            <p className="text-gray-600 dark:text-gray-300 px-6 py-4">
                Time for a rest? You can always come back later!
            </p>
        </div>
        <div className="px-6 py-4 flex justify-end gap-2">
            <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition dark:text-gray-300 dark:hover:bg-surface-700"
            >
            Cancel
            </button>
              <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition dark:bg-red-600 dark:hover:bg-red-700"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/60 backdrop-blur-md px-4 animate-fade-in dark:bg-surface-800/60">
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
              <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-primary-100 dark:border-primary-700 animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <p className="text-surface-800 font-medium text-lg dark:text-surface-100">Securely logging you out...</p>
              <p className="text-surface-500 dark:text-surface-400">This will only take a moment</p>
            </div>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce dark:bg-primary-400"></div>
            <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce dark:bg-primary-400" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce dark:bg-primary-400" style={{ animationDelay: '0.2s' }}></div>
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
        ${collapsed ? 'w-20' : 'w-64'}
        ${isLoggingOut ? 'bg-surface-800' : 'bg-white'}
        h-screen flex flex-col shadow-soft
        transition-all duration-300
        dark:bg-surface-800
      `}
    >
      {isLoggingOut && <LogoutAnimation />}
      {showConfirmation && (
        ConfirmLogout({
          onConfirm: handleConfirmLogout,
          onCancel: () => setShowConfirmation(false)
        })
      )}
      <div className="p-4 border-surface-100 dark:border-surface-700 flex items-center justify-between">
        <div className="flex items-center">
          {!collapsed && (
            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Pamahres</span>
            </h1>
          )}
          {collapsed && <span className="text-xl font-bold text-primary-600 dark:text-primary-400">P</span>}
        </div>
        <div className="flex items-center gap-2">
          {isMobile && (
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 dark:text-surface-300"
            >
              <X size={18} />
            </button>
          )}
          {!isMobile && (
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 dark:text-surface-300"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-surface-200 dark:scrollbar-thumb-surface-600 scrollbar-track-transparent">
        <nav className="px-3 space-y-1.5">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400' 
                : 'text-surface-500 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800'
              }
            `}
          >
            <Home size={20} />
            {!collapsed && <span className="ml-3 font-medium">Dashboard</span>}
          </NavLink>
          
          <NavLink
            to="/create-course"
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400' 
                : 'text-surface-500 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800'
              }
            `}
          >
            <Plus size={20} />
            {!collapsed && <span className="ml-3 font-medium">Create Course</span>}
          </NavLink>
          
          <NavLink
            to="/settings"
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400' 
                : 'text-surface-500 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800'
              }
            `}
          >
            <Settings size={20} />
            {!collapsed && <span className="ml-3 font-medium">Settings</span>}
          </NavLink>
        </nav>
      </div>
      
      <div className="p-4 border-t border-surface-100 dark:border-surface-600">
        <button
          onClick={handleLogout} // Trigger logout on click
          className="flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-surface-500 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800"
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </div>
  )
}
export default Sidebar;

