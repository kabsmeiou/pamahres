"use client"

import { useState, useEffect } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"
import { Home, Plus, Settings, Menu, X, LogOut } from "react-feather"
import { Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { createContext } from "react"
import { Course as CourseType } from "../types/course";
import { useCoursesApi } from "../services/courses";
import Toast from "../components/Toast";
import ReactDOM from 'react-dom';
import { useAuth } from "@clerk/clerk-react";
type LayoutContext = {  
  courses: CourseType[] | null;
  isFetchingCourses?: boolean;
  setShowToast?: (show: boolean) => void;
};

export const LayoutContext = createContext<LayoutContext | null>(null); 

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

const Layout = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const location = useLocation()
  
  const { getCourses } = useCoursesApi();
  
  const { data: courses, isLoading: isFetchingCourses } = useQuery<CourseType[]>({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
    enabled: true,
  });

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false)
  }, [location])

  const [showToast, setShowToast] = useState(false);

  function onCloseToast() {
    setShowToast(false);
  }

  const navigation = [
    { name: 'Dashboard', href: '/pamahres', icon: Home, current: location.pathname === '/' },
    { name: 'Create Course', href: '/pamahres/create-course', icon: Plus, current: location.pathname === '/create-course' },
    { name: 'Settings', href: '/pamahres/settings', icon: Settings, current: location.pathname === '/settings' },
  ]
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
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {isLoggingOut && <LogoutAnimation />}
      {showConfirmation && (
        ConfirmLogout({
          onConfirm: handleConfirmLogout,
          onCancel: () => setShowConfirmation(false)
        })
      )}
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-surface-900/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-900 flex items-center justify-center text-white shadow-sm">
                  <span className="text-sm font-bold">P</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent tracking-tight">
                  Pamahres
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1 ml-10">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      item.current
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`}
                  >
                    <item.icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side - Theme toggle and mobile menu */}
            <div className="flex items-center space-x-3">
              {/* logout button here */}
              <div className="border-surface-100 dark:border-surface-600">
                <button
                  onClick={handleLogout} // Trigger logout on click
                  className="flex items-center p-2 rounded-xl transition-all duration-200 text-surface-500 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800 gap-2"
                >
                  Logout<LogOut size={16} />
                </button>
              </div>
              
              <ThemeToggle />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <LayoutContext.Provider value={{ courses: courses ?? null, isFetchingCourses, setShowToast }}>
        <main className="flex-1">
          {showToast && (
            <Toast 
              message="This feature is currently unavailable. Please try again later." 
              type="error"
              title="Error"
              onClose={onCloseToast}
            />
          )}
          <Outlet />
        </main>
      </LayoutContext.Provider>
    </div>
  )
}

export default Layout;