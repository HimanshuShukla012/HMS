// src/components/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Settings, Menu, X, Droplets } from 'lucide-react';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <Home size={18} /> },
    { label: 'Users', path: '/admin/users', icon: <Users size={18} /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
  ];

  // Close sidebar when clicking on a nav item (mobile)
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const menuButton = document.getElementById('menu-button');
      
      if (
        isOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node) &&
        window.innerWidth < 768
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Close sidebar on window resize if it becomes desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        id="menu-button"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-2 rounded-lg shadow-lg hover:from-cyan-500 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-60 z-30 backdrop-blur-sm" />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`
          bg-gradient-to-b from-slate-900 via-blue-900 to-cyan-900 text-white h-screen w-64 p-5 flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out shadow-2xl border-r border-cyan-500/20
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
            radial-gradient(circle at top right, rgba(14, 165, 233, 0.1) 0%, transparent 70%)
          `
        }}
      >
        {/* Decorative Water Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-4 w-8 h-8 border-2 border-cyan-300 rounded-full"></div>
          <div className="absolute top-20 right-6 w-4 h-4 border border-blue-300 rounded-full"></div>
          <div className="absolute top-32 left-8 w-6 h-6 border border-cyan-400 rounded-full"></div>
          <div className="absolute bottom-32 right-4 w-10 h-10 border-2 border-blue-400 rounded-full"></div>
          <div className="absolute bottom-20 left-6 w-5 h-5 border border-cyan-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="flex items-center gap-3 flex-1 justify-center">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg shadow-lg">
              <Droplets size={24} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                HMS
              </h1>
              <p className="text-xs text-cyan-200/80 font-medium">
                Handpump System
              </p>
            </div>
          </div>
          
          {/* Close button for mobile - only visible when sidebar is open */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-white hover:text-cyan-300 transition-colors p-1 rounded hover:bg-white/10"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                to={item.path}
                key={item.path}
                onClick={handleNavClick}
                className={`
                  group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 transform hover:scale-105
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white shadow-lg border border-cyan-400/30' 
                    : 'hover:bg-gradient-to-r hover:from-cyan-600/20 hover:to-blue-600/20 text-cyan-100 hover:text-white'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-r-full"></div>
                )}
                
                {/* Icon container */}
                <div className={`
                  p-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md' 
                    : 'bg-white/10 text-cyan-300 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-500 group-hover:text-white'
                  }
                `}>
                  {item.icon}
                </div>
                
                {/* Label */}
                <span className={`
                  font-medium transition-colors duration-200
                  ${isActive ? 'text-white' : 'group-hover:text-white'}
                `}>
                  {item.label}
                </span>
                
                {/* Hover effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 rounded-xl transition-all duration-200"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer with UP Government branding */}
        <div className="mt-auto pt-6 border-t border-cyan-500/20">
          <div className="text-center">
            <p className="text-xs text-cyan-200/70 font-medium">
              Government of
            </p>
            <p className="text-sm font-bold bg-gradient-to-r from-orange-300 to-green-300 bg-clip-text text-transparent">
              UTTAR PRADESH
            </p>
            <div className="flex justify-center items-center gap-1 mt-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for desktop - pushes main content to the right */}
      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  );
};

export default Sidebar;