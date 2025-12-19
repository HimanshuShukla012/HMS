import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  UserPlus,
  Users2,
  Building2,
  Calendar,
  Megaphone,
  ClipboardList,
  CreditCard,
  FileText,
  Droplet,
  BookOpen,
  ChevronDown,
  ChevronRight,
  LogOut,
  Satellite,
  CheckSquare,
  Eye,
  Settings,
  MapPin,
  Menu,
  X,
  Bell,
  Search,
  User,
  Home,
} from "lucide-react";
import { BiDroplet, BiMoney } from "react-icons/bi";
import { useUserInfo } from '../utils/userInfo';
import GlobalSearch from './GlobalSearch';


type Role = "admin" | "gp" | "consultingengineer" | "gram_panchayat_sachiv" | "assistant_development_officer" | "district_panchayati_raj_officer" | "consulting_engineer";

type MenuItem = {
  name: string;
  to?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
};

const roleLabels: Record<Role, string> = {
  admin: "Admin Dashboard",
  gp: "Gram Panchayat Dashboard",
  consultingengineer: "Consulting Engineer Dashboard",
  consulting_engineer: "Consulting Engineer Dashboard",
  gram_panchayat_sachiv: "Gram Panchayat Sachiv Dashboard",
  assistant_development_officer: "Assistant Development Officer Dashboard",
  district_panchayati_raj_officer: "District Panchayati Raj Officer Dashboard",
};

const getMenuLinks = (role: Role): MenuItem[] => {
  if (role === "admin") {
    return [
      { name: "Dashboard", to: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "GMAS", to: "/admin/gmas", icon: <Satellite size={20} /> },
      // { name: "User Management", to: "/admin/user-management", icon: <Users size={20} /> },
      { name: "View Estimation", to: "/admin/manage-beneficiary", icon: <Users2 size={20} /> },
      { name: "View Closure Updates", to: "/admin/view-closure", icon: <Users2 size={20} /> },
      { name: "Manage Handpump", to: "/admin/manage-handpump", icon: <Calendar size={20} /> },
      { name: "Complaint Status", to: "/admin/manage-complaint", icon: <ClipboardList size={20} /> },
      // { name: "Finance Management", to: "/admin/fee-management", icon: <BiMoney size={20} /> },
    ];
  } else if (role === "gp" || role === "gram_panchayat_sachiv") {
    return [
      { name: "Dashboard", to: "/gp/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "GMAS", to: "/gp/gmas", icon: <Satellite size={20} /> },
      { name: "Raise Requisition", to: "/gp/raise-requisition", icon: <UserPlus size={20} /> },
      { name: "View Estimation", to: "/gp/manage-beneficiary", icon: <Users2 size={20} /> },
      { name: "Attach Completion", to: "/gp/attach-completion", icon: <Users2 size={20} /> },
      { name: "View Closure Updates", to: "/gp/view-closure", icon: <Users2 size={20} /> },
      { name: "Manage Handpump", to: "/gp/manage-handpump", icon: <Calendar size={20} /> },
      { name: "Lodge Complaint", to: "/gp/lodge-complaint", icon: <Megaphone size={20} /> },
      { name: "Complaint Status", to: "/gp/manage-complaint", icon: <ClipboardList size={20} /> },
      { name: "User Manual", to: "/gp/user-manual", icon: <BookOpen size={20} /> },
    ];
  } else if (role === "assistant_development_officer") {
    return [
      { name: "Dashboard", to: "/ado/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "GMAS", to: "/ado/gmas", icon: <Satellite size={20} /> },
      // { name: "User Management", to: "/admin/user-management", icon: <Users size={20} /> },
      { name: "View Estimation", to: "/ado/manage-beneficiary", icon: <Users2 size={20} /> },
      { name: "View Closure Updates", to: "/ado/view-closure", icon: <Users2 size={20} /> },
      { name: "Manage Handpump", to: "/ado/manage-handpump", icon: <Calendar size={20} /> },
      { name: "Complaint Status", to: "/ado/manage-complaint", icon: <ClipboardList size={20} /> },
    ];
  } else if (role === "district_panchayati_raj_officer") {
    return [
      { name: "Dashboard", to: "/dpro/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "GMAS", to: "/dpro/gmas", icon: <Satellite size={20} /> },
      // { name: "User Management", to: "/admin/user-management", icon: <Users size={20} /> },
      { name: "View Estimation", to: "/dpro/manage-beneficiary", icon: <Users2 size={20} /> },
      { name: "View Closure Updates", to: "/dpro/view-closure", icon: <Users2 size={20} /> },
      { name: "Manage Handpump", to: "/dpro/manage-handpump", icon: <Calendar size={20} /> },
      { name: "Complaint Status", to: "/dpro/manage-complaint", icon: <ClipboardList size={20} /> },
    ];
  } else if (role === "consultingengineer" || role === "consulting_engineer") {
    return [
      { name: "Dashboard", to: "/consultingengineer/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "Create Estimate", to: "/consultingengineer/create-estimate", icon: <Megaphone size={20} /> },
      { name: "Raise MB & Visit Report", to: "/consultingengineer/mb-visit-report", icon: <ClipboardList size={20} /> },
    ];
  }
};

const DashboardLayout = ({ role }: { children?: React.ReactNode; role: Role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Fetch user info from token
  const { userId, role: userRole, loading, error } = useUserInfo();
  
  const actualRole = localStorage.getItem("role");
  
  let menuRole: Role = role;
  if (actualRole === "Gram_Panchayat_Sachiv") {
    menuRole = "gram_panchayat_sachiv";
  } else if (actualRole === "Admin") {
    menuRole = "admin";
  } else if (actualRole === "Assistant_Development_Officer") {
    menuRole = "assistant_development_officer";
  } else if (actualRole === "District_Panchayati_Raj_Officer") {
    menuRole = "district_panchayati_raj_officer";
  } else if (actualRole === "Consulting_Engineer") {
    menuRole = "consulting_engineer";
  } else if (actualRole === "call center") {
    menuRole = "consultingengineer";
  }
  
  const links = getMenuLinks(menuRole);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Helper function to format role for display
  const formatRoleForDisplay = (role: string) => {
    if (!role) return "User";
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper function to generate email from role
  const generateEmailFromRole = (role: string, userId: number | null) => {
    if (!role) return "user@system.com";
    const rolePrefix = role.toLowerCase().replace(/_/g, '');
    return userId ? `${rolePrefix}${userId}@system.com` : `${rolePrefix}@system.com`;
  };

  const renderMenuItems = (items: MenuItem[], level: number = 0) => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        const isOpen = openMenus[item.name];
        return (
          <div key={item.name} className="mb-1">
            <div
              onClick={() => toggleMenu(item.name)}
              className={`group cursor-pointer flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                level > 0 ? "ml-4" : ""
              } hover:bg-indigo-50`}
            >
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="flex items-center justify-center text-gray-600 group-hover:text-indigo-600 transition-colors">
                  {item.icon}
                </div>
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                  {item.name}
                </span>
              </div>
              <div className="transition-transform duration-200 text-gray-400 group-hover:text-indigo-600">
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </div>
            </div>
            {isOpen && (
              <div className="mt-1 space-y-1 pl-2">
                {renderMenuItems(item.children, level + 1)}
              </div>
            )}
          </div>
        );
      }

      return (
        <Link
          key={item.to}
          to={item.to!}
          className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${
            level > 0 ? "ml-4" : ""
          } ${
            location.pathname === item.to
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200"
              : "hover:bg-indigo-50 text-gray-700"
          }`}
        >
          <div className={`flex items-center justify-center transition-colors ${
            location.pathname === item.to 
              ? "text-white" 
              : "text-gray-600 group-hover:text-indigo-600"
          }`}>
            {item.icon}
          </div>
          <span className={`text-sm font-medium transition-colors ${
            location.pathname === item.to 
              ? "text-white" 
              : "group-hover:text-gray-900"
          }`}>
            {item.name}
          </span>
        </Link>
      );
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-xl`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl blur-md opacity-50"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Droplet className="text-white" size={24} />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">Handpump</h1>
                  <p className="text-xs text-gray-500">Management System</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Role Badge */}
        {isSidebarOpen && (
          <div className="px-6 py-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Role</span>
              </div>
              <p className="text-sm font-bold text-gray-800">{roleLabels[menuRole]}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <nav className="space-y-1">
            {isSidebarOpen ? (
              renderMenuItems(links)
            ) : (
              links.map((item) => (
                <Link
                  key={item.to || item.name}
                  to={item.to || "#"}
                  className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 mb-1 ${
                    location.pathname === item.to
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "hover:bg-indigo-50 text-gray-600"
                  }`}
                  title={item.name}
                >
                  {item.icon}
                </Link>
              ))
            )}
          </nav>
        </div>

        {/* User Section & Logout */}
        <div className="p-4 border-t border-gray-200">
          {isSidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  {loading ? (
                    <>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </>
                  ) : error ? (
                    <>
                      <p className="text-sm font-semibold text-gray-800 truncate">User</p>
                      <p className="text-xs text-red-500 truncate">Error loading info</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {formatRoleForDisplay(userRole || actualRole || "User")}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {generateEmailFromRole(userRole || actualRole || "", userId)}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg shadow-red-200 hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 shadow-lg transform hover:scale-105 active:scale-95"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Breadcrumb / Page Title */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Home size={16} />
                  <ChevronRight size={14} />
                  <span className="text-gray-700 font-medium">
                    {location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'}
                  </span>
                </div>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <GlobalSearch />

                {/* Notifications */}
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell size={20} className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Settings */}
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings size={20} className="text-gray-600" />
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <User size={20} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;