import React, { useState, useEffect, useRef } from "react";
import * as XLSX from 'xlsx';
import { Filter, Search, Download, Eye, Calendar, FileText, Wrench, Drill, X, AlertCircle, CheckCircle, Clock, TrendingUp, ArrowLeft, MapPin, Phone, User, Droplets, Hammer, Shield, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Mock user info hook (replace with actual implementation)
const useUserInfo = () => ({
  userId: 1,
  role: 'Admin',
  loading: false,
  error: null
});

// Define the API response structure
interface HandpumpData {
  H_id: number;
  HandpumpId: string;
  HandpumpImage: string;
  Latitude: number;
  Longitude: number;
  VillegeId: number;
  NearByPersonName: string;
  NearByPersonContact: string;
  SoakpitConnected: number;
  DrainageConnected: number;
  PlateformBuild: number;
  HandpumpStatus: string;
  CreatedDate: string;
  CreatedByID: number;
  CreatedBy: string;
  DistrictId: number;
  DistrictName: string;
  BlockId: number;
  BlockName: string;
  GPId: number;
  GrampanchayatName: string;
  VillegeName: string;
  HandpumpVideoPath: string;
  LastRepairDate: string | null;
  LastReboreDate: string | null;
  WaterQuality: string;
  WaterQualityRemarks: string;
}

interface ApiResponse {
  Data: HandpumpData[];
  Message: string;
  Status: boolean;
  Errror: string | null;
}

interface TransformedHandpump {
  id: number;
  handpumpId: string;
  districtName: string;
  blockName: string;
  villageName: string;
  status: string;
  hasImage: string;
  hasVideo: string;
  navigate: string;
  geotagDate: string;
  nearbyPerson: string;
  contact: string;
  soakPit: string;
  drainage: string;
  platform: string;
  lastRepairDate: string;
  lastReboreDate: string;
  waterQuality: string;
  remark: string;
  originalData: HandpumpData;
}

const ManageHandpump = () => {
  const { userId, role, loading: userLoading, error: userError } = useUserInfo();
  
  // API Data States
  const [handpumps, setHandpumps] = useState<HandpumpData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Filter States
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterWaterQuality, setFilterWaterQuality] = useState("");

  // Modal states
  const [selectedHandpump, setSelectedHandpump] = useState<TransformedHandpump | null>(null);
  const [imagePopup, setImagePopup] = useState<string | null>(null);
  const [isSatelliteView, setIsSatelliteView] = useState(false);

  const modalMapRef = useRef(null);

  // Check if user is Admin
  const isAdmin = role === 'Admin';

  // Leaflet icons
  const statusIcons = {
    functional: new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    }),
    nonfunctional: new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    }),
  };

  // Fetch handpumps from API
  const fetchHandpumps = async (currentUserId: number, userRole: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const authToken = localStorage.getItem('authToken') || 
                       sessionStorage.getItem('authToken') ||
                       localStorage.getItem('token') ||
                       sessionStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const apiUrl = `https://hmsapi.kdsgroup.co.in/api/HandpumpRegistration/GetHandpumpListByUserId?UserId=${currentUserId}`;

      const requestOptions: RequestInit = {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await fetch(apiUrl, requestOptions);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You may not have permission to view handpumps.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.Status && Array.isArray(data.Data)) {
        setHandpumps(data.Data);
        console.log(`Loaded ${data.Data.length} handpumps for ${userRole} user (ID: ${currentUserId})`);
      } else {
        throw new Error(data.Message || data.Errror || 'Failed to fetch handpumps');
      }
    } catch (error) {
      console.error('Error fetching handpumps:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch handpumps');
      setHandpumps([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data when userId and role are available
  useEffect(() => {
    if (!userId || userLoading || !role) return;
    
    console.log(`Fetching handpumps for ${role} user (ID: ${userId})`);
    fetchHandpumps(userId, role);
  }, [userId, role, userLoading]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDistrict, selectedBlock, selectedVillage, filterStatus, filterWaterQuality]);

  // Get unique values for filters
  const getUniqueDistricts = () => {
    return [...new Set(handpumps.map(h => h.DistrictName))].sort();
  };

  const getUniqueBlocks = () => {
    return [...new Set(handpumps
      .filter(h => !selectedDistrict || h.DistrictName === selectedDistrict)
      .map(h => h.BlockName))].sort();
  };

  const getUniqueVillages = () => {
    return [...new Set(handpumps
      .filter(h => (!selectedDistrict || h.DistrictName === selectedDistrict) &&
                   (!selectedBlock || h.BlockName === selectedBlock))
      .map(h => h.VillegeName))].sort();
  };

  const clearFilters = () => {
    setSelectedDistrict("");
    setSelectedBlock("");
    setSelectedVillage("");
    setFilterStatus("");
    setFilterWaterQuality("");
    setSearch("");
  };

  const getSelectedLocationName = () => {
    if (selectedVillage) return selectedVillage;
    if (selectedBlock) return selectedBlock;
    if (selectedDistrict) return selectedDistrict;
    return "All Areas";
  };

  // Transform API data for filtering
  const transformHandpumpForFiltering = (h: HandpumpData): TransformedHandpump => ({
    id: h.H_id,
    handpumpId: h.HandpumpId,
    districtName: h.DistrictName,
    blockName: h.BlockName,
    villageName: h.VillegeName,
    status: h.HandpumpStatus,
    hasImage: h.HandpumpImage ? "Yes" : "No",
    hasVideo: h.HandpumpVideoPath ? "Yes" : "No",
    navigate: `${h.Latitude}, ${h.Longitude}`,
    geotagDate: new Date(h.CreatedDate).toLocaleDateString(),
    nearbyPerson: h.NearByPersonName,
    contact: h.NearByPersonContact,
    soakPit: h.SoakpitConnected ? "Yes" : "No",
    drainage: h.DrainageConnected ? "Yes" : "No",
    platform: h.PlateformBuild ? "Yes" : "No",
    lastRepairDate: h.LastRepairDate ? new Date(h.LastRepairDate).toLocaleDateString() : "N/A",
    lastReboreDate: h.LastReboreDate ? new Date(h.LastReboreDate).toLocaleDateString() : "N/A",
    waterQuality: h.WaterQuality || "N/A",
    remark: h.WaterQualityRemarks || "",
    originalData: h
  });

  // Filter handpumps
  const filteredData = handpumps
    .map(transformHandpumpForFiltering)
    .filter((h) => {
      const matchesSearch = h.handpumpId.toLowerCase().includes(search.toLowerCase()) ||
                           h.nearbyPerson.toLowerCase().includes(search.toLowerCase());
      const matchesDistrict = !selectedDistrict || h.districtName === selectedDistrict;
      const matchesBlock = !selectedBlock || h.blockName === selectedBlock;
      const matchesVillage = !selectedVillage || h.villageName === selectedVillage;
      const matchesStatus = !filterStatus || h.status === filterStatus;
      const matchesWaterQuality = !filterWaterQuality || h.waterQuality === filterWaterQuality;

      return matchesSearch && matchesDistrict && matchesBlock && matchesVillage && 
             matchesStatus && matchesWaterQuality;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleDownload = () => {
    if (filteredData.length === 0) return;
    
    setDownloading(true);
    
    try {
      const exportData = filteredData.map((h, index) => ({
        'Sr. No.': index + 1,
        'Handpump ID': h.handpumpId,
        'District': h.districtName,
        'Block': h.blockName,
        'Village': h.villageName,
        'Status': h.status,
        'Image': h.hasImage,
        'Video': h.hasVideo,
        'Navigate': h.navigate,
        'Date of Geotag': h.geotagDate,
        'Nearby Person': h.nearbyPerson,
        'Contact': h.contact,
        'Soak Pit': h.soakPit,
        'Drainage': h.drainage,
        'Platform': h.platform,
        'Last Repair Date': h.lastRepairDate,
        'Last Rebore Date': h.lastReboreDate,
        'Water Quality': h.waterQuality,
        'Remark': h.remark
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Handpumps');
      
      const filename = `handpumps_export_${isAdmin ? 'admin' : 'user'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
      
    } finally {
      setDownloading(false);
    }
  };

  const handleRefresh = () => {
    if (!userId || !role) return;
    fetchHandpumps(userId, role);
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-700 bg-green-100 border-green-200';
      case 'Inactive': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getWaterQualityColor = (quality: string) => {
    switch (quality) {
      case 'Good': return 'text-green-700 bg-green-100 border-green-200';
      case 'Bad': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle size={14} />;
      case 'Inactive': return <X size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const handleDetailsClick = (handpump: TransformedHandpump) => {
    setSelectedHandpump(handpump);
  };

  // Loading state while user info is being fetched
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading user information...</p>
        </div>
      </div>
    );
  }

  // Show error if no userId is available
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-8 border border-white/20">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mt-4">Authentication Required</h2>
          <p className="text-slate-600 mt-2">Please log in to access the handpump management system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-blue-900 rounded-xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                <Droplets size={24} />
              </div>
              Handpump Master Dashboard
              {isAdmin && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-1 rounded-lg border border-amber-400/30">
                  <Shield size={18} className="text-amber-300" />
                  <span className="text-amber-200 font-medium text-sm">Admin View</span>
                </div>
              )}
            </h1>
            <p className="text-slate-200 mb-2">
              {isAdmin 
                ? "Administrator access - Monitor all handpump installations across the system." 
                : "Monitor and manage handpump installations across districts. Track status, maintenance, and water quality."
              }
            </p>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 mb-4 border border-red-400/30">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-200" />
                  <span className="text-red-200 font-medium">Error: {error}</span>
                  <button 
                    onClick={handleRefresh}
                    className="ml-auto bg-red-400/30 hover:bg-red-400/50 px-3 py-1 rounded transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4 mb-4 border border-blue-400/30">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-transparent"></div>
                  <span className="text-blue-200 font-medium">
                    Loading handpump data{isAdmin ? ' (Admin - All Records)' : ' (User Specific)'}...
                  </span>
                </div>
              </div>
            )}

            {/* Location Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    if (e.target.value !== selectedDistrict) {
                      setSelectedBlock("");
                      setSelectedVillage("");
                    }
                  }}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                >
                  <option value="" className="text-gray-800">All Districts</option>
                  {getUniqueDistricts().map((district) => (
                    <option key={district} value={district} className="text-gray-800">{district}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={selectedBlock}
                  onChange={(e) => {
                    setSelectedBlock(e.target.value);
                    if (e.target.value !== selectedBlock) {
                      setSelectedVillage("");
                    }
                  }}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                >
                  <option value="" className="text-gray-800">All Blocks</option>
                  {getUniqueBlocks().map((block) => (
                    <option key={block} value={block} className="text-gray-800">{block}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                >
                  <option value="" className="text-gray-800">All Villages</option>
                  {getUniqueVillages().map((village) => (
                    <option key={village} value={village} className="text-gray-800">{village}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                >
                  <option value="" className="text-gray-800">All Status</option>
                  <option value="Active" className="text-gray-800">Active</option>
                  <option value="Inactive" className="text-gray-800">Inactive</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={filterWaterQuality}
                  onChange={(e) => setFilterWaterQuality(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                >
                  <option value="" className="text-gray-800">All Quality</option>
                  <option value="Good" className="text-gray-800">Good</option>
                  <option value="Bad" className="text-gray-800">Bad</option>
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
                    placeholder="Search by Handpump ID or Nearby Person..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors font-medium"
                >
                  <X size={16} />
                  Clear Filters
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={loading || !userId}
                  className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors font-medium disabled:opacity-50"
                >
                  <div className={loading ? "animate-spin" : ""}>
                    <TrendingUp size={16} />
                  </div>
                  Refresh
                </button>
              </div>

              <button 
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white transition-all duration-300 shadow-lg font-medium ${
                  downloading || filteredData.length === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                }`}
                onClick={handleDownload} 
                disabled={downloading || filteredData.length === 0}
              >
                <Download size={18} />
                {downloading ? 'Downloading...' : 'Download Excel'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-6 text-sm">
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-amber-600" />
                <span className="text-gray-600">Access Level: <strong className="text-amber-700">Administrator (All Handpumps)</strong></span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <span className="text-gray-600">Location: <strong className="text-gray-800">{getSelectedLocationName()}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-purple-600" />
              <span className="text-gray-600">Showing <strong className="text-gray-800">{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</strong> of <strong className="text-gray-800">{filteredData.length}</strong> handpumps</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-gray-600">Total handpumps: <strong className="text-gray-800">{handpumps.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="group bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Handpumps</p>
                <p className="text-2xl font-bold mt-1">{filteredData.length}</p>
                <p className="text-blue-200 text-xs mt-1">{isAdmin ? 'System-wide' : 'API sourced'}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Droplets size={24} />
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active</p>
                <p className="text-2xl font-bold mt-1">
                  {filteredData.filter(h => h.status === 'Active').length}
                </p>
                <p className="text-green-200 text-xs mt-1">Operational units</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-red-600 to-rose-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Inactive</p>
                <p className="text-2xl font-bold mt-1">
                  {filteredData.filter(h => h.status === 'Inactive').length}
                </p>
                <p className="text-red-200 text-xs mt-1">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <X size={24} />
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">With Images</p>
                <p className="text-2xl font-bold mt-1">
                  {filteredData.filter(h => h.hasImage === 'Yes').length}
                </p>
                <p className="text-amber-200 text-xs mt-1">Documented</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText size={24} />
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">With Platform</p>
                <p className="text-2xl font-bold mt-1">
                  {filteredData.filter(h => h.platform === 'Yes').length}
                </p>
                <p className="text-purple-200 text-xs mt-1">Infrastructure ready</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Wrench size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-700 to-slate-700 p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Droplets size={20} />
                </div>
                Handpump Management
                {isAdmin && (
                  <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-md border border-amber-400/30">
                    <Shield size={14} className="text-amber-300" />
                    <span className="text-amber-200 text-xs font-medium">Admin</span>
                  </div>
                )}
              </h2>
              <p className="text-gray-200 mt-2">
                {isAdmin 
                  ? "Complete system data from GetHandpumpListDetail API" 
                  : "Live API data from handpump registration system"
                }
              </p>
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
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Sr. No.</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Handpump ID</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">District</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Block</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Village</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Status</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Image</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Video</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Navigate</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Date of Geotag</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Nearby Person</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Contact</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Soak Pit</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Drainage</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Platform</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Last Repair Date</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Last Rebore Date</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Water Quality</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Remark</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((h, index) => (
                  <tr key={h.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-300`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm font-semibold text-gray-900">{startIndex + index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-blue-600">{h.handpumpId}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-700">{h.districtName}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-700">{h.blockName}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-700">{h.villageName}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md border ${getStatusColor(h.status)}`}>
                        {getStatusIcon(h.status)}
                        {h.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${h.hasImage === 'Yes' ? 'text-green-700 bg-green-100 border-green-200' : 'text-gray-700 bg-gray-100 border-gray-200'}`}>
                        {h.hasImage === 'Yes' ? <CheckCircle size={12} /> : <X size={12} />}
                        {h.hasImage}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${h.hasVideo === 'Yes' ? 'text-green-700 bg-green-100 border-green-200' : 'text-gray-700 bg-gray-100 border-gray-200'}`}>
                        {h.hasVideo === 'Yes' ? <CheckCircle size={12} /> : <X size={12} />}
                        {h.hasVideo}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-blue-500" />
                        <span className="text-xs text-gray-600 max-w-24 truncate">{h.navigate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-purple-500" />
                        <span className="text-sm text-gray-700">{h.geotagDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-indigo-500" />
                        <span className="text-sm text-gray-700">{h.nearbyPerson}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-emerald-500" />
                        <span className="text-sm text-gray-700">{h.contact}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${h.soakPit === 'Yes' ? 'text-green-700 bg-green-100 border-green-200' : 'text-red-700 bg-red-100 border-red-200'}`}>
                        {h.soakPit === 'Yes' ? <CheckCircle size={12} /> : <X size={12} />}
                        {h.soakPit}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${h.drainage === 'Yes' ? 'text-green-700 bg-green-100 border-green-200' : 'text-red-700 bg-red-100 border-red-200'}`}>
                        {h.drainage === 'Yes' ? <CheckCircle size={12} /> : <X size={12} />}
                        {h.drainage}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${h.platform === 'Yes' ? 'text-green-700 bg-green-100 border-green-200' : 'text-red-700 bg-red-100 border-red-200'}`}>
                        {h.platform === 'Yes' ? <CheckCircle size={12} /> : <X size={12} />}
                        {h.platform}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Hammer size={14} className="text-orange-500" />
                        <span className="text-sm text-gray-700">{h.lastRepairDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Drill size={14} className="text-cyan-500" />
                        <span className="text-sm text-gray-700">{h.lastReboreDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md border ${getWaterQualityColor(h.waterQuality)}`}>
                        <Droplets size={12} />
                        {h.waterQuality}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{h.remark || "-"}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => h.originalData.HandpumpImage && window.open(h.originalData.HandpumpImage, '_blank')}
                          disabled={!h.originalData.HandpumpImage}
                          className={`flex items-center gap-1 px-3 py-1 text-white text-xs rounded-md transition-all duration-300 shadow-sm font-medium ${
                            h.originalData.HandpumpImage 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer' 
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Eye size={12} />
                          View
                        </button>
                        <button 
                          onClick={() => handleDetailsClick(h)}
                          className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs rounded-md hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-sm font-medium"
                        >
                          <FileText size={12} />
                          Details
                        </button>
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
              <p className="text-lg text-gray-500 font-medium">
                {handpumps.length === 0 ? 
                  (isAdmin ? 'No handpumps found in the system' : 'No handpumps found for this user') : 
                  'No handpumps match your filters'
                }
              </p>
              <p className="text-gray-400 mt-1">
                {handpumps.length === 0 ? 
                  (isAdmin ? 'Check system data or API connection' : 'Check API connection or user permissions') : 
                  'Try adjusting your search criteria'
                }
              </p>
              {error && (
                <button 
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry Loading
                </button>
              )}
            </div>
          )}

          {loading && (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-500 font-medium">
                Loading handpump data{isAdmin ? ' (Admin - All Records)' : ' (User Specific)'}...
              </p>
              <p className="text-gray-400 mt-1">
                {isAdmin ? 'Fetching from GetHandpumpListDetail API...' : 'Fetching from API...'}
              </p>
            </div>
          )}

          {/* Bottom Pagination */}
          {filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 gap-4 bg-gray-50">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} • {filteredData.length} total records {isAdmin && '(Admin View)'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>

        {/* System Status Footer */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 border border-slate-700 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${error ? 'bg-red-400 shadow-red-400/50' : loading ? 'bg-yellow-400 shadow-yellow-400/50' : 'bg-emerald-400 shadow-emerald-400/50'}`}></div>
                <span className="text-sm font-semibold">
                  {error ? 'API Error' : loading ? 'Loading...' : 'API Connected'}
                </span>
              </div>
              <div className="text-sm opacity-75">
                User ID: {userId} • {role} • {handpumps.length} handpumps loaded
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2 bg-amber-500/20 px-2 py-1 rounded-md border border-amber-400/30">
                  <Shield size={14} className="text-amber-300" />
                  <span className="text-amber-200 text-xs font-medium">Admin Access</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2 opacity-90">
                <Droplets />
                <span className="font-medium">{filteredData.filter(h => h.status === 'Active').length} Active</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <FileText />
                <span className="font-medium">{filteredData.filter(h => h.hasImage === 'Yes').length} With Images</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <Wrench />
                <span className="font-medium">{filteredData.filter(h => h.platform === 'Yes').length} With Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Handpump Details Modal */}
      {selectedHandpump && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto z-[1001]">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full border-2 border-white flex items-center justify-center ${
                      selectedHandpump.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Handpump {selectedHandpump.handpumpId}</h3>
                    <p className="text-blue-100">ID: {selectedHandpump.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHandpump(null)}
                  className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Details */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Handpump Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                            selectedHandpump.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {selectedHandpump.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">District:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.districtName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Block:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.blockName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gram Panchayat:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.originalData.GrampanchayatName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Village:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.villageName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Installation Date:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.geotagDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Water Quality:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.waterQuality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nearby Person:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.nearbyPerson}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.contact}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Image</h4>
                    <img
                      src={
                        selectedHandpump.originalData.HandpumpImage ||
                        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=200&fit=crop"
                      }
                      alt={`Handpump ${selectedHandpump.handpumpId}`}
                      className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() =>
                        selectedHandpump.originalData.HandpumpImage && setImagePopup(selectedHandpump.originalData.HandpumpImage)
                      }
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=200&fit=crop";
                      }}
                    />
                  </div>

                  {selectedHandpump.originalData.HandpumpVideoPath && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4">Video</h4>
                      <video
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                        controls
                        poster={selectedHandpump.originalData.HandpumpImage}
                      >
                        <source src={selectedHandpump.originalData.HandpumpVideoPath} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Infrastructure</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Soakpit Connected:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedHandpump.soakPit === 'Yes'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedHandpump.soakPit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Drainage Connected:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedHandpump.drainage === 'Yes'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedHandpump.drainage}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Platform Build:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedHandpump.platform === 'Yes'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedHandpump.platform}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Map and Additional Info */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Location Map</h4>
                    <div className="h-64 rounded-lg overflow-hidden shadow-md border border-gray-200">
                      {selectedHandpump.originalData.Latitude && selectedHandpump.originalData.Longitude && (
                        <MapContainer
                          center={[selectedHandpump.originalData.Latitude, selectedHandpump.originalData.Longitude]}
                          zoom={15}
                          style={{ height: '100%', width: '100%' }}
                          ref={modalMapRef}
                        >
                          <TileLayer
                            url={isSatelliteView
                              ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                          />
                          <Marker
                            position={[selectedHandpump.originalData.Latitude, selectedHandpump.originalData.Longitude]}
                            icon={selectedHandpump.status === 'Active' ? statusIcons.functional : statusIcons.nonfunctional}
                          />
                        </MapContainer>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      📍 {selectedHandpump.originalData.Latitude?.toFixed(6)}°N, {selectedHandpump.originalData.Longitude?.toFixed(6)}°E
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Maintenance Records</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hammer size={16} className="text-orange-500" />
                          <span className="text-gray-600">Last Repair Date:</span>
                        </div>
                        <span className="font-semibold text-gray-800">{selectedHandpump.lastRepairDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Drill size={16} className="text-cyan-500" />
                          <span className="text-gray-600">Last Rebore Date:</span>
                        </div>
                        <span className="font-semibold text-gray-800">{selectedHandpump.lastReboreDate}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Water Quality Assessment</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Quality Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getWaterQualityColor(selectedHandpump.waterQuality)}`}>
                          {selectedHandpump.waterQuality}
                        </span>
                      </div>
                      {selectedHandpump.remark && (
                        <div>
                          <span className="text-gray-600 block mb-2">Remarks:</span>
                          <p className="text-sm text-gray-800 bg-white p-3 rounded border border-gray-200">
                            {selectedHandpump.remark}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-indigo-500" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Nearby Person</p>
                          <p className="font-semibold text-gray-800">{selectedHandpump.nearbyPerson}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-emerald-500" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Contact Number</p>
                          <p className="font-semibold text-gray-800">{selectedHandpump.contact}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Additional Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created By:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.originalData.CreatedBy || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Has Image:</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          selectedHandpump.hasImage === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedHandpump.hasImage}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Has Video:</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          selectedHandpump.hasVideo === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedHandpump.hasVideo}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    const lat = selectedHandpump.originalData.Latitude;
                    const lng = selectedHandpump.originalData.Longitude;
                    if (lat && lng) {
                      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Navigation size={16} />
                  Open in Maps
                </button>
                <button
                  onClick={() => setSelectedHandpump(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Popup Modal */}
      {imagePopup && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000] p-4"
          onClick={() => setImagePopup(null)}
        >
          <div
            className="relative bg-white rounded-xl shadow-xl flex items-center justify-center max-w-5xl max-h-[90vh] w-auto h-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imagePopup}
              alt="Handpump"
              className="max-w-[90vw] max-h-[85vh] w-auto h-auto rounded-lg object-contain"
            />

            <button
              onClick={() => setImagePopup(null)}
              className="absolute top-3 right-3 text-white bg-black/60 hover:bg-black/80 rounded-full p-2 transition"
            >
              <X size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHandpump;