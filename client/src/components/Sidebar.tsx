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

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  isMobile?: boolean
  onClose?: () => void
}

const Sidebar = ({ collapsed, setCollapsed, isMobile, onClose }: SidebarProps) => {
  const { signOut } = useAuth(); // Use Clerk's signOut function

  return (
    <div 
      className={`
        ${collapsed ? 'w-20' : 'w-64'}
        bg-white h-screen flex flex-col shadow-soft
        transition-all duration-300
      `}
    >
      <div className="p-4 border-b border-surface-100 flex items-center justify-between">
        <div className="flex items-center">
          {!collapsed && (
            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">LockAIn</span>
            </h1>
          )}
          {collapsed && <span className="text-xl font-bold text-primary-600">AI</span>}
        </div>
        <div className="flex items-center gap-2">
          {isMobile && (
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500"
            >
              <X size={18} />
            </button>
          )}
          {!isMobile && (
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-surface-200 scrollbar-track-transparent">
        <nav className="px-3 space-y-1.5">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-primary-50 text-primary-600' 
                : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'
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
                ? 'bg-primary-50 text-primary-600' 
                : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'
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
                ? 'bg-primary-50 text-primary-600' 
                : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'
              }
            `}
          >
            <Settings size={20} />
            {!collapsed && <span className="ml-3 font-medium">Settings</span>}
          </NavLink>
        </nav>
      </div>
      
      <div className="p-4 border-t border-surface-100">
        <button
          onClick={() => signOut({ redirectUrl: '/' })} // Trigger logout on click
          className="flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-surface-500 hover:text-surface-900 hover:bg-surface-50"
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
