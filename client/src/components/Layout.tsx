"use client"

import { useState, useEffect } from "react"
import { Outlet, Link } from "react-router-dom"
import Sidebar from "./Sidebar"
import { ThemeToggle } from "./ThemeToggle"
import { Menu, User } from "react-feather"

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="flex min-h-screen bg-surface-50 dark:bg-surface-900 transition-colors">
      {/* Mobile Sidebar Overlay */}
      {isMobile && showMobileSidebar && (
        <div
          className="fixed inset-0 bg-surface-900/50 dark:bg-surface-950/70 z-40 backdrop-blur-sm"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${isMobile ? "fixed z-50" : "relative"}
        ${isMobile && !showMobileSidebar ? "-translate-x-full" : "translate-x-0"}
        transition-transform duration-300 ease-in-out
      `}
      >
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
        <header className="h-16 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex items-center px-4 sticky top-0 z-40 shadow-sm transition-colors">
          <div className="flex items-center gap-4 w-full max-w-screen-2xl mx-auto">
            {isMobile && (
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg mr-2 text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-surface-100 transition-colors"
              >
                <Menu size={24} />
              </button>
            )}

            {/* Search Bar - Uncomment and update when needed
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-100 placeholder-surface-500 dark:placeholder-surface-400 focus:bg-white dark:focus:bg-surface-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
                <Search className="absolute left-3 top-2.5 text-surface-400 dark:text-surface-500" size={20} />
              </div>
            </div> */}

            <div className="flex items-center gap-2 ml-auto">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Profile */}
              <Link
                to="/settings"
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center">
                  <User size={18} />
                </div>
                <span className="text-sm font-medium text-surface-900 dark:text-surface-100 hidden sm:block">USER</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-surface-50 dark:bg-surface-900 transition-colors">
          <div className="container mx-auto px-4 sm:px-6 py-8 max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout;