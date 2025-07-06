"use client"

import { useState, useEffect } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"
import { Home, Plus, Settings, Menu, X } from "react-feather"
import { useQuery } from '@tanstack/react-query';
import { createContext } from "react"
import { Course as CourseType } from "../types/course";
import { useCoursesApi } from "../services/courses";
import Toast from "../components/Toast";

type LayoutContext = {  
  courses: CourseType[] | null;
  isFetchingCourses?: boolean;
  setShowToast?: (show: boolean) => void;
};

export const LayoutContext = createContext<LayoutContext | null>(null); 

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
    { name: 'Dashboard', href: '/', icon: Home, current: location.pathname === '/' },
    { name: 'Create Course', href: '/create-course', icon: Plus, current: location.pathname === '/create-course' },
    { name: 'Settings', href: '/settings', icon: Settings, current: location.pathname === '/settings' },
  ]

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
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