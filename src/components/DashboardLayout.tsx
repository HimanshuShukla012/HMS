import React, { useState } from "react";
import BubblesBackground from "./BubblesBackground";
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
  Building2 as Building2Icon,
  Droplet,
  DropletIcon,
  BookAIcon,
  ChevronDown,
  ChevronRight,
  LogOut,
  Satellite,
  CheckSquare,
  Eye,
  Settings,
  MapPin,
} from "lucide-react";
import { BiBuildingHouse, BiDroplet, BiMoney } from "react-icons/bi";

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
      { name: "Dashboard", to: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "GMAS", to: "/admin/gmas", icon: <Satellite size={16} /> },
      { name: "User Management", to: "/admin/user-management", icon: <Users size={18} /> },
      { name: "Role Management", to: "/admin/role-management", icon: <Users size={18} /> },
      { name: "Manage Handpump", to: "/admin/manage-handpump", icon: <Calendar size={16} /> },
      { name: "Complaint Status", to: "/gp/manage-complaint", icon: <ClipboardList size={16} /> },
      { name: "Finance Management", to: "/admin/fee-management", icon: <BiMoney size={18} /> },
    ];
  } else if (role === "gp" || role === "gram_panchayat_sachiv") {
    return [
      { name: "Dashboard", to: "/gp/dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "Raise Requisition", to: "/gp/raise-requisition", icon: <UserPlus size={16} /> },
      { name: "View Estimation", to: "/gp/manage-beneficiary", icon: <Users2 size={16} /> },
      { name: "Attach Completion", to: "/gp/attach-completion", icon: <Users2 size={16} /> },
      { name: "View Closure Updates", to: "/gp/view-closure", icon: <Users2 size={16} /> },
      { name: "Manage Handpump", to: "/gp/manage-handpump", icon: <Calendar size={16} /> },
      { name: "Manage Pump House", to: "/gp/gmas", icon: <Satellite size={16} /> },
      { name: "Lodge Complaint", to: "/gp/lodge-complaint", icon: <Megaphone size={16} /> },
      { name: "Complaint Status", to: "/gp/manage-complaint", icon: <ClipboardList size={16} /> },
      { name: "User Manual", to: "/gp/user-manual", icon: <BookAIcon size={18} /> },
    ];
  } else if (role === "assistant_development_officer") {
    return [
      { name: "Dashboard", to: "/ado/dashboard", icon: <LayoutDashboard size={18} /> },
      {
        name: "Project Management",
        icon: <Building2 size={18} />,
        children: [
          { name: "Review Requisitions", to: "/ado/review-requisitions", icon: <Eye size={16} /> },
          { name: "Approve Estimates", to: "/ado/approve-estimates", icon: <CheckSquare size={16} /> },
          { name: "Monitor Progress", to: "/ado/monitor-progress", icon: <BarChart3 size={16} /> },
        ],
      },
      {
        name: "Quality Control",
        icon: <Settings size={18} />,
        children: [
          { name: "Water Quality Reports", to: "/ado/water-quality", icon: <BiDroplet size={16} /> },
          { name: "Inspection Reports", to: "/ado/inspection-reports", icon: <ClipboardList size={16} /> },
        ],
      },
      { name: "Area Management", to: "/ado/area-management", icon: <MapPin size={18} /> },
      { name: "Reports", to: "/ado/reporting", icon: <FileText size={18} /> },
    ];
  } else if (role === "district_panchayati_raj_officer") {
    return [
      { name: "Dashboard", to: "/dpro/dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "GMAS", to: "/dpro/gmas", icon: <Satellite size={16} /> },
      {
        name: "District Overview",
        icon: <MapPin size={18} />,
        children: [
          { name: "Block Management", to: "/dpro/block-management", icon: <Building2 size={16} /> },
          { name: "GP Performance", to: "/dpro/gp-performance", icon: <BarChart3 size={16} /> },
          { name: "Resource Allocation", to: "/dpro/resource-allocation", icon: <CreditCard size={16} /> },
        ],
      },
      {
        name: "Approvals & Reviews",
        icon: <CheckSquare size={18} />,
        children: [
          { name: "Project Approvals", to: "/dpro/project-approvals", icon: <CheckSquare size={16} /> },
          { name: "Budget Reviews", to: "/dpro/budget-reviews", icon: <BiMoney size={16} /> },
          { name: "Quality Audits", to: "/dpro/quality-audits", icon: <ClipboardList size={16} /> },
        ],
      },
      {
        name: "Monitoring",
        icon: <Eye size={18} />,
        children: [
          { name: "Project Status", to: "/dpro/project-status", icon: <BarChart3 size={16} /> },
          { name: "Complaint Overview", to: "/dpro/complaint-overview", icon: <Megaphone size={16} /> },
          { name: "Performance Metrics", to: "/dpro/performance-metrics", icon: <BarChart3 size={16} /> },
        ],
      },
      { name: "District Reports", to: "/dpro/reporting", icon: <FileText size={18} /> },
    ];
  } else if (role === "consultingengineer" || role === "consulting_engineer") {
    // Both consultingengineer and consulting_engineer use the same menu
    return [
      { name: "Dashboard", to: "/consultingengineer/dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "Create Estimate", to: "/consultingengineer/create-estimate", icon: <Megaphone size={16} /> },
      { name: "Raise MB & Visit Report", to: "/consultingengineer/mb-visit-report", icon: <ClipboardList size={16} /> },
    ];
  }
};

const DashboardLayout = ({ role }: { children?: React.ReactNode; role: Role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the actual role from localStorage to determine correct menu
  const actualRole = localStorage.getItem("role");
  
  // Determine which role to use for menu generation
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
    // Clear localStorage and navigate to login
    localStorage.clear();
    navigate("/login");
  };

  const renderMenuItems = (items: MenuItem[], level: number = 0) => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        const isOpen = openMenus[item.name];
        return (
          <div key={item.name} className="mb-1">
            <div
              onClick={() => toggleMenu(item.name)}
              className={`group cursor-pointer flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white hover:bg-opacity-15 transition-all duration-200 ${
                level > 0 ? `ml-${level * 4}` : ""
              } hover:shadow-lg backdrop-blur-sm`}
            >
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="flex items-center justify-center w-6 h-6 text-white/80 group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <span className="text-white/90 group-hover:text-white transition-colors">
                  {item.name}
                </span>
              </div>
              <div className="transition-transform duration-200 text-white/60 group-hover:text-white">
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </div>
            {isOpen && (
              <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
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
          className={`group flex items-center gap-3 text-sm px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${
            level > 0 ? `ml-${level * 4}` : ""
          } ${
            location.pathname === item.to
              ? "bg-white bg-opacity-25 font-semibold shadow-lg backdrop-blur-sm border border-white/20"
              : "hover:bg-white hover:bg-opacity-15 hover:shadow-md"
          }`}
        >
          <div className={`flex items-center justify-center w-6 h-6 transition-colors ${
            location.pathname === item.to 
              ? "text-white" 
              : "text-white/80 group-hover:text-white"
          }`}>
            {item.icon}
          </div>
          <span className={`transition-colors ${
            location.pathname === item.to 
              ? "text-white font-semibold" 
              : "text-white/90 group-hover:text-white"
          }`}>
            {item.name}
          </span>
        </Link>
      );
    });
  };

  return (
    <div className="relative h-screen overflow-visible">
      <BubblesBackground />

      {/* Main Layout */}
      <div className="flex h-full bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Enhanced Sidebar */}
        <div className="w-80 bg-gradient-to-b from-slate-800 via-gray-800 to-blue-900 text-white shadow-2xl flex flex-col relative overflow-hidden">
          {/* Decorative overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 via-gray-300 to-blue-400"></div>
          
          <div className="relative z-10 p-6 pb-4">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md"></div>
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="relative h-20 w-28 rounded-2xl object-cover shadow-xl ring-2 ring-white/30" 
                />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-wider bg-gradient-to-r from-white to-slate-100 bg-clip-text text-transparent mb-1">
                  Handpump Management System
                </h1>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mb-2"></div>
                <span className="text-sm text-slate-200 font-medium px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                  {roleLabels[menuRole]}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="relative z-10 flex-1 px-4 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <nav className="space-y-2">
              {renderMenuItems(links)}
            </nav>
          </div>

          {/* Enhanced Logout Button */}
          <div className="relative z-10 p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="group w-full flex items-center justify-center gap-3 text-sm px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-200" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;