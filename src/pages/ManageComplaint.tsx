import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useUserInfo } from '../utils/userInfo';
import * as XLSX from 'xlsx';
import { 
  Filter, 
  Search, 
  Download, 
  Eye, 
  Calendar, 
  FileText, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Phone, 
  User, 
  Droplets, 
  Wrench,
  AlertTriangle,
  Settings,
  ToolCase,
} from 'lucide-react';
import { useJurisdiction } from '../utils/useJurisdiction';
import { useSearchData } from '../components/SearchDataContext';



// Toast notification system (in-memory implementation)
const useToast = () => {
  const [toasts, setToasts] = useState<Array<{id: number, message: string, type: 'success' | 'error' | 'info'}>>([]);
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return { toasts, success: (msg: string) => showToast(msg, 'success'), error: (msg: string) => showToast(msg, 'error'), info: (msg: string) => showToast(msg, 'info') };
};

const ToastContainer = ({ toasts }: { toasts: Array<{id: number, message: string, type: string}> }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {toasts.map(toast => (
      <div key={toast.id} className={`p-4 rounded-xl shadow-xl text-white max-w-sm backdrop-blur-sm ${
        toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
        toast.type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
      }`}>
        {toast.message}
      </div>
    ))}
  </div>
);

// API Response Interface
interface ApiComplaint {
  ComplaintId: number;
  H_Id: number;
  HandpumpId: string;
  DistrictName: string;
  BlockName: string;
  GpName: string;
  VillageName: string;
  ComplainantName: string;
  ContactNumber: string;
  Landmark: string;
  IssueCategory: string;
  UrgencyLevel: string;
  ResolutionTimelineDays: number;
  IssueDescription: string;
  Status: string;
  CreatedBy: number;
  CreateddateStr: string;
}

type HandpumpComplaint = {
  id: number;
  complaintId: string;
  handpumpId: number;
  handpumpCode: string;
  district: string;
  block: string;
  gramPanchayat: string;
  village: string;
  handpumpLocation: string;
  complainantName: string;
  complainantContact: string;
  landmark: string;
  category: string;
  otherCategory: string;
  description: string;
  urgency: string;
  complaintStatus: string;
  resolutionDays: number;
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  handpumpStatus: string;
};

interface DistrictApi {
  DistrictId: number;
  DistrictName: string;
  DistrictNameHidi?: string;
}

interface BlockApi {
  BlockId: number;
  DistrictId: number;
  BlockName: string;
  BlockNameHindi?: string;
  Code?: string;
}

interface GramPanchayatApi {
  Id: number;
  BlockId: number;
  GramPanchayatName: string;
  GramPanchayatHindi?: string;
  Code?: string;
}

interface VillageApi {
  Id: number;
  VillageName: string;
}

const ManageHandpumpComplaints = () => {
  const { userId, role } = useUserInfo();
  const { jurisdiction, loading: jurisdictionLoading, error: jurisdictionError } = useJurisdiction(userId);

  const navigate = useNavigate();
  
  const toast = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [search, setSearch] = useState("");
  const [complaints, setComplaints] = useState<HandpumpComplaint[]>([]);
  const { setComplaints: setGlobalComplaints } = useSearchData(); // Add this

  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<HandpumpComplaint | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  const [districts, setDistricts] = useState<DistrictApi[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<BlockApi[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayatApi[]>([]);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);
  const [villages, setVillages] = useState<VillageApi[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);
  
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [authToken, setAuthToken] = useState<string | null>(null);

  // Initialize auth data
  useEffect(() => {
    const token = localStorage.getItem("authToken") || null;
    setAuthToken(token);
  }, []);

  // Load data when component mounts
  useEffect(() => {
    if (userId && authToken) {
      fetchDistricts();
      fetchComplaints();
    }
  }, [userId, authToken]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDistrictId, selectedBlockId, selectedGramPanchayatId, selectedVillageId, filterStatus, filterUrgency, filterCategory]);

  useEffect(() => {
  if (userId && authToken && jurisdiction) {
    // Auto-populate based on jurisdiction
    if (jurisdiction.districtId) {
      setDistricts([{
        DistrictId: jurisdiction.districtId,
        DistrictName: jurisdiction.districtName || ''
      }]);
      setSelectedDistrictId(jurisdiction.districtId);
    } else {
      fetchDistricts();
    }
    
    fetchComplaints();
  }
}, [userId, authToken, jurisdiction]);

  // Update useEffect for blocks to consider jurisdiction
useEffect(() => {
  if (selectedDistrictId && userId) {
    if (jurisdiction?.blockId) {
      // Auto-populate block for ADO
      setBlocks([{
        BlockId: jurisdiction.blockId,
        DistrictId: jurisdiction.districtId!,
        BlockName: jurisdiction.blockName || ''
      }]);
      setSelectedBlockId(jurisdiction.blockId);
    } else {
      fetchBlocks(selectedDistrictId);
    }
  } else {
    setBlocks([]);
    setSelectedBlockId(null);
  }
}, [selectedDistrictId, userId, jurisdiction]);

  // Update useEffect for gram panchayats to consider jurisdiction
useEffect(() => {
  if (selectedBlockId && userId) {
    if (jurisdiction?.gramPanchayatId) {
      // Auto-populate GP for GP Sachiv
      setGramPanchayats([{
        Id: jurisdiction.gramPanchayatId,
        BlockId: jurisdiction.blockId!,
        GramPanchayatName: jurisdiction.gramPanchayatName || ''
      }]);
      setSelectedGramPanchayatId(jurisdiction.gramPanchayatId);
    } else {
      fetchGramPanchayats(selectedBlockId);
    }
  } else {
    setGramPanchayats([]);
    setSelectedGramPanchayatId(null);
  }
}, [selectedBlockId, userId, jurisdiction]);

useEffect(() => {
    if (selectedBlockId && selectedGramPanchayatId) {
      fetchVillages(selectedBlockId, selectedGramPanchayatId);
    } else {
      setVillages([]);
      setSelectedVillageId(null);
    }
  }, [selectedBlockId, selectedGramPanchayatId]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (showViewModal && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowViewModal(false);
        setSelectedComplaint(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showViewModal]);

  // Transform API data to internal format
  const transformApiData = (apiData: ApiComplaint[]): HandpumpComplaint[] => {
    return apiData.map((item) => ({
      id: item.ComplaintId,
      complaintId: item.ComplaintId.toString(),
      handpumpId: item.H_Id,
      handpumpCode: item.HandpumpId,
      district: item.DistrictName,
      block: item.BlockName,
      gramPanchayat: item.GpName,
      village: item.VillageName,
      handpumpLocation: item.Landmark,
      complainantName: item.ComplainantName,
      complainantContact: item.ContactNumber,
      landmark: item.Landmark,
      category: item.IssueCategory,
      otherCategory: "",
      description: item.IssueDescription,
      urgency: item.UrgencyLevel || "Medium",
      complaintStatus: item.Status === "Open" ? "Pending" : item.Status,
      resolutionDays: item.ResolutionTimelineDays,
      createdDate: parseDateString(item.CreateddateStr),
      updatedDate: parseDateString(item.CreateddateStr),
      createdBy: item.ComplainantName,
      handpumpStatus: "Working"
    }));
  };

  // Parse date string from DD-MM-YYYY to ISO format
  const parseDateString = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString();
    
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(`${year}-${month}-${day}`).toISOString();
    }
    return new Date().toISOString();
  };

  // Fetch complaints from API
  const fetchComplaints = async () => {
    if (!userId || !authToken) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://hmsapi.kdsgroup.co.in/api/HandpumpRegistration/GetHandpumpComplaintsList?UserId=${userId}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.Status && data.Data) {
        const transformedData = transformApiData(data.Data);
        setComplaints(transformedData);
        setGlobalComplaints(data.Data); // Add this line - use raw data

        toast.success(`Loaded ${transformedData.length} handpump complaint records`);
      } else {
        toast.error(data.Message || 'Failed to fetch complaints');
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints. Please try again.');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch districts from API
// Update fetchDistricts to respect jurisdiction
const fetchDistricts = async () => {
  if (!userId || !authToken) return;
  
  // If user has a specific district (not Admin), don't fetch all districts
  if (jurisdiction?.districtId) {
    return; // Already set in useEffect
  }
  
  try {
    const response = await fetch(
      `https://hmsapi.kdsgroup.co.in/api/Master/GetDistrictByUserId?UserId=${userId}`,
      {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Status && data.Data && data.Data.length > 0) {
      const transformedDistricts = data.Data.map((d: any) => ({
        DistrictId: d.Id || d.DistrictId,
        DistrictName: d.DistrictName || d.Name,
        DistrictNameHidi: d.DistrictNameHidi
      }));
      setDistricts(transformedDistricts);
    }
  } catch (error) {
    console.error('Error fetching districts:', error);
    toast.error('Failed to load districts');
  }
};

// Fetch blocks from API
const fetchBlocks = async (districtId: number) => {
  if (!userId || !authToken) return;
  
  try {
    const response = await fetch(
      'https://hmsapi.kdsgroup.co.in/api/Master/GetBlockListByDistrict',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ Id: districtId })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Status && data.Data && data.Data.length > 0) {
      // Transform to match BlockApi interface
      const transformedBlocks = data.Data.map((b: any) => ({
        BlockId: b.Id || b.BlockId,
        DistrictId: b.DistrictId,
        BlockName: b.BlockName || b.Name,
        BlockNameHindi: b.BlockNameHindi,
        Code: b.Code
      }));
      setBlocks(transformedBlocks);
    } else {
      setBlocks([]);
    }
  } catch (error) {
    console.error('Error fetching blocks:', error);
    toast.error('Failed to load blocks');
    setBlocks([]);
  }
};

// Fetch gram panchayats from API
const fetchGramPanchayats = async (blockId: number) => {
  if (!userId || !authToken) return;
  
  try {
    const response = await fetch(
      'https://hmsapi.kdsgroup.co.in/api/Master/GetGramPanchayatByBlock',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ Id: blockId })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Status && data.Data && data.Data.length > 0) {
      setGramPanchayats(data.Data);
    } else {
      setGramPanchayats([]);
    }
  } catch (error) {
    console.error('Error fetching gram panchayats:', error);
    toast.error('Failed to load gram panchayats');
    setGramPanchayats([]);
  }
};

// Fetch villages from API
const fetchVillages = async (blockId: number, gramPanchayatId: number) => {
  if (!authToken) return;
  
  try {
    const response = await fetch(
      'https://hmsapi.kdsgroup.co.in/api/Master/GetVillegeByGramPanchayat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ Id: gramPanchayatId })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Status && data.Data && data.Data.length > 0) {
      setVillages(data.Data);
    } else {
      setVillages([]);
    }
  } catch (error) {
    console.error('Error fetching villages:', error);
    toast.error('Failed to load villages');
    setVillages([]);
  }
};
  const handleViewComplaint = (complaint: HandpumpComplaint) => {
    setSelectedComplaint(complaint);
    setShowViewModal(true);
  };

  const handleTakeAction = (complaint: HandpumpComplaint) => {
    const params = new URLSearchParams({
      complaintId: complaint.complaintId,
      handpumpCode: complaint.handpumpCode,
      handpumpId: complaint.handpumpId.toString(),
      village: complaint.village,
      category: complaint.category,
      urgency: complaint.urgency
    });
    
    navigate(`/gp/raise-requisition?${params.toString()}`);
    toast.info(`Redirecting to Raise Requisition for Complaint COMP-${complaint.complaintId}`);

  };

  const handleDownload = () => {
    try {
      const exportData = filteredData.map((c) => ({
        'Complaint ID': c.complaintId,
        'Handpump Code': c.handpumpCode,
        'District': c.district,
        'Block': c.block,
        'Gram Panchayat': c.gramPanchayat,
        'Village': c.village,
        'Handpump Location': c.handpumpLocation,
        'Complainant Name': c.complainantName,
        'Contact': c.complainantContact,
        'Landmark': c.landmark,
        'Category': c.category,
        'Other Category': c.otherCategory,
        'Description': c.description,
        'Urgency': c.urgency,
        'Status': c.complaintStatus,
        'Resolution Days': c.resolutionDays,
        'Handpump Status': c.handpumpStatus,
        'Created Date': new Date(c.createdDate).toLocaleDateString(),
        'Updated Date': new Date(c.updatedDate).toLocaleDateString(),
        'Created By': c.createdBy,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(
          key.length,
          ...exportData.map(row => String(row[key as keyof typeof row]).length)
        )
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Handpump_Complaints');

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `handpump_complaints_export_${dateStr}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success("Excel file downloaded successfully");
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };

  const clearFilters = () => {
    setSelectedDistrictId(null);
    setSelectedBlockId(null);
    setSelectedGramPanchayatId(null);
    setSelectedVillageId(null);
    setFilterStatus("");
    setFilterUrgency("");
    setFilterCategory("");
    setSearch("");
  };

  const getSelectedLocationName = () => {
    if (selectedVillageId) {
      const village = villages.find(v => v.Id === selectedVillageId);
      return village?.VillageName || `Village ID: ${selectedVillageId}`;
    }
    if (selectedGramPanchayatId) {
      const gp = gramPanchayats.find(gp => gp.Id === selectedGramPanchayatId);
      return gp?.GramPanchayatName || "Selected Gram Panchayat";
    }
    if (selectedBlockId) {
      const block = blocks.find(b => b.BlockId === selectedBlockId);
      return block?.BlockName || "Selected Block";
    }
    if (selectedDistrictId) {
      const district = districts.find(d => d.DistrictId === selectedDistrictId);
      return district?.DistrictName || "Selected District";
    }
    return "All Areas";
  };

  const filteredData = complaints.filter((c) => {
  const matchesSearch = 
    c.complainantName.toLowerCase().includes(search.toLowerCase()) ||
    c.complainantContact.toLowerCase().includes(search.toLowerCase()) ||
    c.handpumpCode.toLowerCase().includes(search.toLowerCase()) ||
    c.complaintId.toLowerCase().includes(search.toLowerCase()) ||
    c.district.toLowerCase().includes(search.toLowerCase()) ||
    c.block.toLowerCase().includes(search.toLowerCase()) ||
    c.gramPanchayat.toLowerCase().includes(search.toLowerCase()) ||
    c.village.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.handpumpLocation.toLowerCase().includes(search.toLowerCase());
  
  const matchesStatus = !filterStatus || c.complaintStatus === filterStatus;
  const matchesUrgency = !filterUrgency || c.urgency === filterUrgency;
  const matchesCategory = !filterCategory || c.category === filterCategory;
  
  // Location filtering
  const matchesDistrict = !selectedDistrictId || 
    c.district === districts.find(d => d.DistrictId === selectedDistrictId)?.DistrictName;
  const matchesBlock = !selectedBlockId || 
    c.block === blocks.find(b => b.BlockId === selectedBlockId)?.BlockName;
  const matchesGramPanchayat = !selectedGramPanchayatId || 
    c.gramPanchayat === gramPanchayats.find(gp => gp.Id === selectedGramPanchayatId)?.GramPanchayatName;
  const matchesVillage = !selectedVillageId || 
    c.village === villages.find(v => v.Id === selectedVillageId)?.VillageName;
  
  return matchesSearch && matchesStatus && matchesUrgency && matchesCategory && 
         matchesDistrict && matchesBlock && matchesGramPanchayat && matchesVillage;
});

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md border";
    switch (status) {
      case "Pending":
        return `${baseClasses} text-yellow-700 bg-yellow-100 border-yellow-200`;
      case "In Progress":
        return `${baseClasses} text-blue-700 bg-blue-100 border-blue-200`;
      case "Resolved":
        return `${baseClasses} text-green-700 bg-green-100 border-green-200`;
      case "Closed":
        return `${baseClasses} text-gray-700 bg-gray-100 border-gray-200`;
      default:
        return `${baseClasses} text-blue-700 bg-blue-100 border-blue-200`;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const baseClasses = "inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md border";
    switch (urgency) {
      case "High":
        return `${baseClasses} text-red-700 bg-red-100 border-red-200`;
      case "Medium":
        return `${baseClasses} text-yellow-700 bg-yellow-100 border-yellow-200`;
      case "Low":
        return `${baseClasses} text-green-700 bg-green-100 border-green-200`;
      default:
        return `${baseClasses} text-gray-700 bg-gray-100 border-gray-200`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending": return <Clock size={14} />;
      case "In Progress": return <Settings size={14} />;
      case "Resolved": return <CheckCircle size={14} />;
      case "Closed": return <X size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "High": return <AlertTriangle size={14} />;
      case "Medium": return <Clock size={14} />;
      case "Low": return <CheckCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const uniqueCategories = [...new Set(complaints.map(c => c.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 p-6">
      <ToastContainer toasts={toast.toasts} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-blue-900 rounded-xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                <ToolCase size={24} />
              </div>
              Handpump Complaints Management
            </h1>
            <p className="text-slate-200 mb-6">
              Monitor and manage handpump maintenance complaints across districts. Track status, urgency, and take corrective actions.
            </p>

            {loading && (
              <div className="mb-4 p-3 bg-blue-100/20 border border-blue-200/30 rounded-lg backdrop-blur-sm">
                <p className="text-blue-100">Loading handpump complaint records...</p>
              </div>
            )}

            {/* Location Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
  value={selectedDistrictId || ""}
  onChange={(e) => {
    setSelectedDistrictId(Number(e.target.value) || null);
    setSelectedBlockId(null);
    setSelectedGramPanchayatId(null);
    setSelectedVillageId(null);
  }}
  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
  disabled={loading || jurisdictionLoading || !!jurisdiction?.districtId}
>
  <option value="" className="text-gray-800">All Districts</option>
  {districts.map((d) => (
    <option key={d.DistrictId} value={d.DistrictId} className="text-gray-800">
      {d.DistrictName}
    </option>
  ))}
</select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
  value={selectedBlockId || ""}
  onChange={(e) => {
    setSelectedBlockId(Number(e.target.value) || null);
    setSelectedGramPanchayatId(null);
    setSelectedVillageId(null);
  }}
  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
  disabled={loading || jurisdictionLoading || !!jurisdiction?.blockId}
>
  <option value="" className="text-gray-800">All Blocks</option>
  {blocks.map((b) => (
    <option key={b.BlockId} value={b.BlockId} className="text-gray-800">
      {b.BlockName}
    </option>
  ))}
</select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
  value={selectedGramPanchayatId || ""}
  onChange={(e) => {
    setSelectedGramPanchayatId(Number(e.target.value) || null);
    setSelectedVillageId(null);
  }}
  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
  disabled={loading || jurisdictionLoading || !!jurisdiction?.gramPanchayatId}
>
  <option value="" className="text-gray-800">All Gram Panchayats</option>
  {gramPanchayats.map((gp) => (
    <option key={gp.Id} value={gp.Id} className="text-gray-800">
      {gp.GramPanchayatName}
    </option>
  ))}
</select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={selectedVillageId || ""}
                  onChange={(e) => setSelectedVillageId(Number(e.target.value) || null)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                  disabled={loading}
                >
                  <option value="" className="text-gray-800">All Villages</option>
                  {villages.map((v) => (
                    <option key={v.Id} value={v.Id} className="text-gray-800">
                      {v.VillageName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                  disabled={loading}
                >
                  <option value="" className="text-gray-800">All Status</option>
                  <option value="Pending" className="text-gray-800">Pending</option>
                  <option value="In Progress" className="text-gray-800">In Progress</option>
                  <option value="Resolved" className="text-gray-800">Resolved</option>
                  <option value="Closed" className="text-gray-800">Closed</option>
                </select>
              </div>
            </div>

            {/* Additional Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                  disabled={loading}
                >
                  <option value="" className="text-gray-800">All Urgency Levels</option>
                  <option value="High" className="text-gray-800">High</option>
                  <option value="Medium" className="text-gray-800">Medium</option>
                  <option value="Low" className="text-gray-800">Low</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                  disabled={loading}
                >
                  <option value="" className="text-gray-800">All Categories</option>
                  {uniqueCategories.map((category, index) => (
                    <option key={index} value={category} className="text-gray-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 mt-6">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 flex-1">
                  <Search size={18} className="text-white" />
                  <input
                    type="text"
                    className="bg-transparent text-white placeholder-white/70 focus:outline-none flex-1"
                    placeholder="Search by complaint ID, handpump code, complainant name, contact, or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors font-medium"
                  disabled={loading}
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>

              <button 
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-white transition-all duration-300 shadow-lg font-medium bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDownload} 
                disabled={loading || filteredData.length === 0}
              >
                <Download size={18} />
                Download Excel
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <span className="text-gray-600">Location: <strong className="text-gray-800">{getSelectedLocationName()}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-purple-600" />
              <span className="text-gray-600">Showing <strong className="text-gray-800">{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</strong> of <strong className="text-gray-800">{filteredData.length}</strong> complaints</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-gray-600">Total complaints: <strong className="text-gray-800">{complaints.length}</strong></span>
            </div>
            {filterStatus && <span className="text-gray-600">Status: <strong className="text-gray-800">{filterStatus}</strong></span>}
            {filterUrgency && <span className="text-gray-600">Urgency: <strong className="text-gray-800">{filterUrgency}</strong></span>}
            {filterCategory && <span className="text-gray-600">Category: <strong className="text-gray-800">{filterCategory}</strong></span>}
          </div>
        </div>

        {/* Stats Cards */}
        {complaints.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="group bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Complaints</p>
                  <p className="text-2xl font-bold mt-1">{filteredData.length}</p>
                  <p className="text-blue-200 text-xs mt-1">All records</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileText size={24} />
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold mt-1">
                    {filteredData.filter(c => c.complaintStatus === "Pending").length}
                  </p>
                  <p className="text-yellow-200 text-xs mt-1">Need attention</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Clock size={24} />
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Resolved</p>
                  <p className="text-2xl font-bold mt-1">
                    {filteredData.filter(c => c.complaintStatus === "Resolved").length}
                  </p>
                  <p className="text-green-200 text-xs mt-1">Completed</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-red-600 to-rose-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">High Priority</p>
                  <p className="text-2xl font-bold mt-1">
                    {filteredData.filter(c => c.urgency === "High").length}
                  </p>
                  <p className="text-red-200 text-xs mt-1">Urgent action</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-700 to-slate-700 p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <ToolCase size={20} />
                </div>
                Complaint Management
              </h2>
              <p className="text-gray-200 mt-2">Comprehensive handpump complaint tracking and resolution</p>
            </div>
          </div>

          {/* Pagination Controls - Top */}
          {filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b border-gray-200 gap-4 bg-gray-50">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getVisiblePageNumbers().map((page, index) => (
                    <span key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-1 text-sm text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(page as number)}
                          className={`px-3 py-1 border rounded-md text-sm ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">S.No</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Complaint ID</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Handpump Code</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Location</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Complainant</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Issue Category</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Urgency</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Status</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Timeline</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((c, index) => (
  <tr 
    key={c.id} 
    className={`${
      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
    } hover:bg-blue-50 transition-colors duration-300`}
  >
    <td className="px-4 py-4 whitespace-nowrap">
      <span className="text-lg font-semibold text-gray-600">{startIndex + index + 1}</span>
    </td>
    <td className="px-4 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
        <span className="text-lg font-semibold text-blue-600">COMP-{c.complaintId}</span>
      </div>
    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{c.handpumpCode}</div>
                        <div className="text-xs text-gray-500">{c.handpumpLocation}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{c.village}</div>
                        <div className="text-xs text-gray-500">{c.gramPanchayat}, {c.block}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin size={12} />
                          {c.landmark}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-indigo-500" />
                        <div>
                          <div className="font-medium text-gray-900">{c.complainantName}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone size={12} />
                            {c.complainantContact}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{c.category}</div>
                        {c.otherCategory && (
                          <div className="text-xs text-gray-500">{c.otherCategory}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={getUrgencyBadge(c.urgency)}>
                        {getUrgencyIcon(c.urgency)}
                        {c.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={getStatusBadge(c.complaintStatus)}>
                          {getStatusIcon(c.complaintStatus)}
                          {c.complaintStatus}
                        </span>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Droplets size={12} />
                          HP: {c.handpumpStatus}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-purple-500" />
                        <div>
                          <div className="text-sm font-medium">{c.resolutionDays} days</div>
                          <div className="text-xs text-gray-500">
                            {new Date(c.createdDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
  <div className="flex flex-col gap-1">
    <button
      onClick={() => handleViewComplaint(c)}
      className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm font-medium"
      disabled={loading}
    >
      <Eye size={12} />
      View Details
    </button>
    {role === "Gram_Panchayat_Sachiv" && (c.complaintStatus === "Pending" || c.complaintStatus === "In Progress") && (
      <button
        onClick={() => handleTakeAction(c)}
        className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs rounded-md hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-sm font-medium"
        disabled={loading}
      >
        <Wrench size={12} />
        Take Action
      </button>
    )}
  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && !loading && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Search size={24} className="text-gray-400" />
              </div>
              <p className="text-lg text-gray-500 font-medium">No handpump complaints found</p>
              <p className="text-gray-400 mt-1">
                {complaints.length === 0 
                  ? "No complaints found for the selected criteria." 
                  : "No complaints match your search criteria. Try adjusting your filters."}
              </p>
            </div>
          )}
        </div>

        {/* View Complaint Details Modal */}
        {showViewModal && selectedComplaint && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
            <div ref={modalRef} className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedComplaint(null);
                }} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-blue-600" />
                </div>
                Handpump Complaint Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Complaint Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="font-semibold mb-4 text-gray-700 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    Complaint Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Complaint ID:</strong> 
                      <span className="text-blue-600 font-medium">COMP-{selectedComplaint.complaintId}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Status:</strong>
                      <span className={getStatusBadge(selectedComplaint.complaintStatus)}>
                        {getStatusIcon(selectedComplaint.complaintStatus)}
                        {selectedComplaint.complaintStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Urgency:</strong>
                      <span className={getUrgencyBadge(selectedComplaint.urgency)}>
                        {getUrgencyIcon(selectedComplaint.urgency)}
                        {selectedComplaint.urgency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Resolution Timeline:</strong> 
                      <span className="font-medium">{selectedComplaint.resolutionDays} days</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Created:</strong> 
                      <span>{new Date(selectedComplaint.createdDate).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Updated:</strong> 
                      <span>{new Date(selectedComplaint.updatedDate).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Handpump Information */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h3 className="font-semibold mb-4 text-gray-700 flex items-center gap-2">
                    <Droplets size={16} className="text-purple-600" />
                    Handpump Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Handpump Code:</strong> 
                      <span className="font-medium">{selectedComplaint.handpumpCode}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Location:</strong> 
                      <span>{selectedComplaint.handpumpLocation}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Status:</strong> 
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        selectedComplaint.handpumpStatus === 'Working' ? 'bg-green-100 text-green-700' : 
                        selectedComplaint.handpumpStatus === 'Not Working' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedComplaint.handpumpStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Village:</strong> 
                      <span>{selectedComplaint.village}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Gram Panchayat:</strong> 
                      <span>{selectedComplaint.gramPanchayat}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Block:</strong> 
                      <span>{selectedComplaint.block}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>District:</strong> 
                      <span>{selectedComplaint.district}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Landmark:</strong> 
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {selectedComplaint.landmark}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complainant Information */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h3 className="font-semibold mb-4 text-gray-700 flex items-center gap-2">
                    <User size={16} className="text-green-600" />
                    Complainant Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Name:</strong> 
                      <span className="font-medium">{selectedComplaint.complainantName}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Contact:</strong> 
                      <span className="flex items-center gap-1">
                        <Phone size={12} />
                        {selectedComplaint.complainantContact}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Reported By:</strong> 
                      <span>{selectedComplaint.createdBy}</span>
                    </div>
                  </div>
                </div>

                {/* Issue Details */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                  <h3 className="font-semibold mb-4 text-gray-700 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-yellow-600" />
                    Issue Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                      <strong>Category:</strong> 
                      <span className="font-medium">{selectedComplaint.category}</span>
                    </div>
                    {selectedComplaint.otherCategory && (
                      <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                        <strong>Specific Issue:</strong> 
                        <span>{selectedComplaint.otherCategory}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold mb-4 text-gray-700 flex items-center gap-2">
                  <FileText size={16} className="text-gray-600" />
                  Issue Description
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedComplaint.description}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
  <button 
    onClick={() => {
      setShowViewModal(false);
      setSelectedComplaint(null);
    }} 
    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
  >
    Close
  </button>
  {role === "Gram_Panchayat_Sachiv" && (selectedComplaint.complaintStatus === "Pending" || selectedComplaint.complaintStatus === "In Progress") && (
    <button 
      onClick={() => {
        setShowViewModal(false);
        setSelectedComplaint(null);
        handleTakeAction(selectedComplaint);
      }}
      className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg transition-all duration-300 font-medium shadow-lg"
    >
      Take Action
    </button>
  )}
</div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {complaints.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <ToolCase size={32} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">No Handpump Complaints Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {selectedVillageId || selectedGramPanchayatId || selectedBlockId || selectedDistrictId
                ? "No handpump complaints found for the selected location and filters."
                : "No handpump complaints have been registered yet."}
            </p>
            {(selectedVillageId || selectedGramPanchayatId || selectedBlockId || selectedDistrictId) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg"
              >
                Clear Filters & Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageHandpumpComplaints;