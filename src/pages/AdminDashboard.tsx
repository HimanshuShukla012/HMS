import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, 
  Droplets, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  MapPin, 
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Shield,
  BarChart3,
  Activity,
  Map,
  Database,
  X,
  ChevronRight,
  Navigation,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Loader,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [handpumps, setHandpumps] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  
  // Filter States
  const [filters, setFilters] = useState({
    district: '',
    block: '',
    gramPanchayat: '',
    village: '',
    financialYear: '2025-26',
    month: 'June'
  });

  const API_BASE = 'https://hmsapi.kdsgroup.co.in/api';

  // Get auth token and user ID
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

  const getUserId = () => {
    const token = getAuthToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.UserID || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };


  const handleViewHandpump = (handpump) => {
  // Navigate to manage handpump page or show modal
  // alert(`Viewing Handpump: ${handpump.HandpumpId}\nDistrict: ${handpump.DistrictName}\nStatus: ${handpump.HandpumpStatus}`);
  navigate(`/admin/manage-handpump?id=${handpump.H_id}`);
};

const handleViewRequisition = (requisition) => {
  // Navigate to requisition details or show modal
  navigate(`/admin/manage-beneficiary?id=${requisition.RequisitionId}`);
};

  const handleExportHandpumps = () => {
  try {
    const XLSX = require('xlsx');
    
    const exportData = filteredHandpumps.map((hp, index) => ({
      'S.No': index + 1,
      'Handpump ID': hp.HandpumpId,
      'District': hp.DistrictName,
      'Block': hp.BlockName,
      'Gram Panchayat': hp.GrampanchayatName,
      'Village': hp.VillegeName,
      'Status': hp.HandpumpStatus,
      'Water Quality': hp.WaterQuality || 'N/A',
      'Soakpit Connected': hp.SoakpitConnected === 1 ? 'Yes' : 'No',
      'Drainage Connected': hp.DrainageConnected === 1 ? 'Yes' : 'No',
      'Platform Built': hp.PlateformBuild === 1 ? 'Yes' : 'No',
      'Nearby Person': hp.NearByPersonName || 'N/A',
      'Contact': hp.NearByPersonNo || 'N/A',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Handpumps');

    const filename = `handpumps_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export data. Please install xlsx package: npm install xlsx');
  }
};

const handleExportRequisitions = () => {
  try {
    const XLSX = require('xlsx');
    
    const exportData = filteredRequisitions.map((req, index) => ({
      'S.No': index + 1,
      'Requisition ID': `REQ-${req.RequisitionId.toString().padStart(4, '0')}`,
      'Handpump ID': req.HandpumpId,
      'Village': req.VillageName,
      'Gram Panchayat': req.GrampanchayatName,
      'Block': req.BlockName,
      'District': req.DistrictName,
      'Type': req.RequisitionType,
      'Date': new Date(req.RequisitionDate).toLocaleDateString('en-IN'),
      'Status': req.RequisitionStatus === 1 ? 'Pending' : req.RequisitionStatus === 2 ? 'Approved' : 'Completed',
      'Sanction Amount': req.SanctionAmount ? `₹${parseFloat(req.SanctionAmount).toLocaleString('en-IN')}` : '-',
      'Completion Date': req.CompletionDateStr || '-',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Requisitions');

    const filename = `requisitions_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export data. Please install xlsx package: npm install xlsx');
  }
};

  // Fetch handpump data
  // Fetch handpump data and requisitions
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const authToken = getAuthToken();
      const extractedUserId = getUserId();

      if (!authToken) {
        throw new Error('Authentication token not found. Please login again.');
      }

      if (!extractedUserId) {
        throw new Error('User ID not found. Please login again.');
      }

      setUserId(extractedUserId);

      // Fetch handpumps
      const handpumpsResponse = await fetch(
        `${API_BASE}/HandpumpRegistration/GetHandpumpListByUserId?UserId=${extractedUserId}`,
        {
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!handpumpsResponse.ok) throw new Error('Failed to fetch handpumps');
      const handpumpsData = await handpumpsResponse.json();

      // Fetch requisitions
      const requisitionsResponse = await fetch(
        `${API_BASE}/HandpumpRequisition/GetRequisitionListByUserId?UserId=${extractedUserId}`,
        {
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!requisitionsResponse.ok) throw new Error('Failed to fetch requisitions');
      const requisitionsData = await requisitionsResponse.json();

      if (!handpumpsData || !handpumpsData.Data || !Array.isArray(handpumpsData.Data)) {
        console.warn('Invalid handpumps data structure:', handpumpsData);
        setHandpumps([]);
      } else {
        setHandpumps(handpumpsData.Data);
      }

      if (!requisitionsData || !requisitionsData.Data || !Array.isArray(requisitionsData.Data)) {
        console.warn('Invalid requisitions data structure:', requisitionsData);
        setRequisitions([]);
      } else {
        setRequisitions(requisitionsData.Data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  fetchData();
}, []);
  // Get unique filter options from API data with cascading logic
  const filterOptions = {
    districts: ['All Districts', ...new Set(handpumps.map(hp => hp.DistrictName).filter(Boolean))],
    blocks: ['All Blocks', ...new Set(
      handpumps
        .filter(hp => !filters.district || hp.DistrictName === filters.district)
        .map(hp => hp.BlockName)
        .filter(Boolean)
    )],
    gramPanchayats: ['All Gram Panchayats', ...new Set(
      handpumps
        .filter(hp => {
          const districtMatch = !filters.district || hp.DistrictName === filters.district;
          const blockMatch = !filters.block || hp.BlockName === filters.block;
          return districtMatch && blockMatch;
        })
        .map(hp => hp.GrampanchayatName)
        .filter(Boolean)
    )],
    villages: ['All Villages', ...new Set(
      handpumps
        .filter(hp => {
          const districtMatch = !filters.district || hp.DistrictName === filters.district;
          const blockMatch = !filters.block || hp.BlockName === filters.block;
          const gpMatch = !filters.gramPanchayat || hp.GrampanchayatName === filters.gramPanchayat;
          return districtMatch && blockMatch && gpMatch;
        })
        .map(hp => hp.VillegeName)
        .filter(Boolean)
    )],
    financialYears: ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterName]: value };
      
      // Reset dependent filters when parent filter changes
      if (filterName === 'district') {
        newFilters.block = '';
        newFilters.gramPanchayat = '';
        newFilters.village = '';
      } else if (filterName === 'block') {
        newFilters.gramPanchayat = '';
        newFilters.village = '';
      } else if (filterName === 'gramPanchayat') {
        newFilters.village = '';
      }
      
      return newFilters;
    });
  };

  const resetFilters = () => {
    setFilters({
      district: '',
      block: '',
      gramPanchayat: '',
      village: '',
      financialYear: '2025-26',
      month: 'June'
    });
  };

  // Filter handpumps based on current filters
  const getFilteredHandpumps = () => {
  return handpumps.filter(hp => {
    const districtMatch = !filters.district || hp.DistrictName === filters.district;
    const blockMatch = !filters.block || hp.BlockName === filters.block;
    const gpMatch = !filters.gramPanchayat || hp.GrampanchayatName === filters.gramPanchayat;
    const villageMatch = !filters.village || hp.VillegeName === filters.village;
    
    // Financial Year filtering using CreateddateStr (format: "DD-MM-YYYY")
    let yearMatch = true;
    if (hp.CreateddateStr) {
      try {
        // Parse DD-MM-YYYY string to date
        const [day, month, year] = hp.CreateddateStr.split('-').map(Number);
        const hpDate = new Date(year, month - 1, day); // month is 0-indexed
        const hpYear = hpDate.getFullYear();
        const hpMonth = hpDate.getMonth() + 1; // Convert back to 1-indexed
        
        // Parse financial year (e.g., "2025-26" means April 2025 to March 2026)
        const [startYear, endYear] = filters.financialYear.split('-').map(y => parseInt('20' + y));
        
        // FY starts in April
        if (hpMonth >= 4) { // April onwards belongs to current FY
          yearMatch = hpYear === startYear;
        } else { // Jan-March belongs to next FY
          yearMatch = hpYear === endYear;
        }
      } catch (error) {
        console.error('Error parsing date:', hp.CreateddateStr, error);
        yearMatch = true; // Include if date parsing fails
      }
    }
    
    return districtMatch && blockMatch && gpMatch && villageMatch && yearMatch;
  });
};

  const filteredHandpumps = getFilteredHandpumps();

  const filteredRequisitions = requisitions.filter(req => {
  const handpump = handpumps.find(hp => hp.H_id === req.HPId);
  if (!handpump) return false;
  
  const districtMatch = !filters.district || handpump.DistrictName === filters.district;
  const blockMatch = !filters.block || handpump.BlockName === filters.block;
  const gpMatch = !filters.gramPanchayat || handpump.GrampanchayatName === filters.gramPanchayat;
  const villageMatch = !filters.village || handpump.VillegeName === filters.village;
  
  // Add date filtering for requisitions
  let yearMatch = true;
  if (req.RequisitionDate) {
    const reqDate = new Date(req.RequisitionDate);
    const reqYear = reqDate.getFullYear();
    const reqMonth = reqDate.getMonth() + 1;
    
    const [startYear, endYear] = filters.financialYear.split('-').map(y => parseInt('20' + y));
    
    if (reqMonth >= 4) {
      yearMatch = reqYear === startYear;
    } else {
      yearMatch = reqYear === endYear;
    }
  }
  
  return districtMatch && blockMatch && gpMatch && villageMatch && yearMatch;
});

  // Calculate statistics from filtered data
  const stats = {
  totalHandpumps: filteredHandpumps.length,
  activeHandpumps: filteredHandpumps.filter(hp => hp.HandpumpStatus === 'Active').length,
  inactiveHandpumps: filteredHandpumps.filter(hp => hp.HandpumpStatus !== 'Active').length,
  totalRequisitions: filteredRequisitions.length,
  repairRequisitions: filteredRequisitions.filter(req => req.RequisitionTypeId === 1).length,
  reboreRequisitions: filteredRequisitions.filter(req => req.RequisitionTypeId === 2).length,
  pendingRequisitions: filteredRequisitions.filter(req => req.RequisitionStatus === 1).length,
  approvedRequisitions: filteredRequisitions.filter(req => req.RequisitionStatus === 2).length,
  completedRequisitions: filteredRequisitions.filter(req => req.CompletionDateStr).length,
  totalSanctionAmount: filteredRequisitions
    .filter(req => req.SanctionAmount)
    .reduce((sum, req) => sum + (parseFloat(req.SanctionAmount) || 0), 0),
  totalDistricts: new Set(handpumps.map(hp => hp.DistrictName).filter(Boolean)).size,
  totalBlocks: new Set(handpumps.map(hp => hp.BlockName).filter(Boolean)).size,
  totalGPs: new Set(handpumps.map(hp => hp.GrampanchayatName).filter(Boolean)).size,
  activeUsers: 0
};

  // Calculate district performance from filtered data
  const calculateDistrictPerformance = () => {
    const districtMap = {};
    
    filteredHandpumps.forEach(hp => {
      const district = hp.DistrictName || 'Unknown';
      if (!districtMap[district]) {
        districtMap[district] = { total: 0, active: 0 };
      }
      districtMap[district].total++;
      if (hp.HandpumpStatus === 'Active') {
        districtMap[district].active++;
      }
    });

    return Object.entries(districtMap)
      .map(([district, data]) => ({
        district,
        performance: data.total > 0 ? Math.round((data.active / data.total) * 100) : 0,
        total: data.total,
        active: data.active
      }))
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 8);
  };

  const districtPerformanceData = calculateDistrictPerformance();

  // Calculate status distribution
  const statusDistributionData = [
    { 
      name: 'Active', 
      value: stats.activeHandpumps, 
      color: '#10B981' 
    },
    { 
      name: 'Inactive', 
      value: stats.inactiveHandpumps, 
      color: '#EF4444' 
    },
  ];

  // Calculate rankings
  const calculateRankings = () => {
    // District rankings
    const districtMap = {};
    handpumps.forEach(hp => {
      const district = hp.DistrictName || 'Unknown';
      if (!districtMap[district]) {
        districtMap[district] = { name: district, handpumps: 0, active: 0 };
      }
      districtMap[district].handpumps++;
      if (hp.HandpumpStatus === 'Active') districtMap[district].active++;
    });

    const allDistrictsData = Object.values(districtMap).map(d => ({
      ...d,
      performance: d.handpumps > 0 ? (d.active / d.handpumps) * 100 : 0
    }));

    // Block rankings
    const blockMap = {};
    handpumps.forEach(hp => {
      const block = `${hp.BlockName} (${hp.DistrictName})` || 'Unknown';
      if (!blockMap[block]) {
        blockMap[block] = { name: block, handpumps: 0, active: 0 };
      }
      blockMap[block].handpumps++;
      if (hp.HandpumpStatus === 'Active') blockMap[block].active++;
    });

    const allBlocksData = Object.values(blockMap).map(b => ({
      ...b,
      performance: b.handpumps > 0 ? (b.active / b.handpumps) * 100 : 0
    }));

    // GP rankings
    const gpMap = {};
    handpumps.forEach(hp => {
      const gp = `${hp.GrampanchayatName} (${hp.BlockName})` || 'Unknown';
      if (!gpMap[gp]) {
        gpMap[gp] = { name: gp, handpumps: 0, active: 0 };
      }
      gpMap[gp].handpumps++;
      if (hp.HandpumpStatus === 'Active') gpMap[gp].active++;
    });

    const allGPsData = Object.values(gpMap).map(g => ({
      ...g,
      performance: g.handpumps > 0 ? (g.active / g.handpumps) * 100 : 0
    }));

    return {
      topDistricts: [...allDistrictsData].sort((a, b) => b.performance - a.performance).slice(0, 10),
      bottomDistricts: [...allDistrictsData].sort((a, b) => a.performance - b.performance).slice(0, 10),
      topBlocks: [...allBlocksData].sort((a, b) => b.performance - a.performance).slice(0, 10),
      bottomBlocks: [...allBlocksData].sort((a, b) => a.performance - b.performance).slice(0, 10),
      topGPs: [...allGPsData].sort((a, b) => b.performance - a.performance).slice(0, 10),
      bottomGPs: [...allGPsData].sort((a, b) => a.performance - b.performance).slice(0, 10)
    };
  };

  const rankings = calculateRankings();

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'complaint': return <AlertTriangle size={16} />;
      case 'requisition': return <FileText size={16} />;
      case 'estimation': return <BarChart3 size={16} />;
      case 'completion': return <CheckCircle size={16} />;
      case 'handpump': return <Droplets size={16} />;
      default: return <Activity size={16} />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Universal Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Filter size={20} className="text-blue-600" />
              Universal Filters
            </h3>
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <X size={16} />
              Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* District Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="">All Districts</option>
                {filterOptions.districts.slice(1).map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Block Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Block
              </label>
              <select
                value={filters.block}
                onChange={(e) => handleFilterChange('block', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="">All Blocks</option>
                {filterOptions.blocks.slice(1).map(block => (
                  <option key={block} value={block}>{block}</option>
                ))}
              </select>
            </div>

            {/* Gram Panchayat Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gram Panchayat
              </label>
              <select
                value={filters.gramPanchayat}
                onChange={(e) => handleFilterChange('gramPanchayat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="">All GPs</option>
                {filterOptions.gramPanchayats.slice(1).map(gp => (
                  <option key={gp} value={gp}>{gp}</option>
                ))}
              </select>
            </div>

            {/* Village Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Village
              </label>
              <select
                value={filters.village}
                onChange={(e) => handleFilterChange('village', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="">All Villages</option>
                {filterOptions.villages.slice(1).map(village => (
                  <option key={village} value={village}>{village}</option>
                ))}
              </select>
            </div>

            {/* Financial Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Year
              </label>
              <select
                value={filters.financialYear}
                onChange={(e) => handleFilterChange('financialYear', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                {filterOptions.financialYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                {filterOptions.months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.district || filters.block || filters.gramPanchayat || filters.village) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                {filters.district && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                    District: {filters.district}
                    <button onClick={() => handleFilterChange('district', '')} className="hover:text-blue-900">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.block && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                    Block: {filters.block}
                    <button onClick={() => handleFilterChange('block', '')} className="hover:text-green-900">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.gramPanchayat && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                    GP: {filters.gramPanchayat}
                    <button onClick={() => handleFilterChange('gramPanchayat', '')} className="hover:text-purple-900">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.village && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                    Village: {filters.village}
                    <button onClick={() => handleFilterChange('village', '')} className="hover:text-orange-900">
                      <X size={14} />
                    </button>
                  </span>
                )}
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                  FY: {filters.financialYear} | {filters.month}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6 flex gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'handpumps', label: 'Handpumps', icon: Droplets },
              { id: 'requisitions', label: 'Requisitions', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Handpumps</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalHandpumps.toLocaleString()}</p>
                    <p className="text-blue-200 text-xs mt-1">System-wide</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Droplets size={28} />
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Active Handpumps</p>
                    <p className="text-3xl font-bold mt-2">{stats.activeHandpumps.toLocaleString()}</p>
                    <p className="text-green-200 text-xs mt-1">
                      {stats.totalHandpumps > 0 ? Math.round((stats.activeHandpumps / stats.totalHandpumps) * 100) : 0}% operational
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <CheckCircle size={28} />
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Inactive Handpumps</p>
                    <p className="text-3xl font-bold mt-2">{stats.inactiveHandpumps}</p>
                    <p className="text-orange-200 text-xs mt-1">Needs attention</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={28} />
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Coverage</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalDistricts}</p>
                    <p className="text-purple-200 text-xs mt-1">Districts, {stats.totalBlocks} Blocks</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <MapPin size={28} />
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-purple-600" />
                Status Distribution
              </h3>
              {statusDistributionData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No data available
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-green-600" />
                District Performance
              </h3>
              {districtPerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={districtPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="district" angle={-45} textAnchor="end" height={80} stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="performance" fill="#3B82F6" name="Performance %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No district data available
                </div>
              )}
            </div>

            {/* Rankings Tables */}
            <div className="space-y-6">
              {/* Top & Bottom Districts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <ArrowUp size={20} className="text-green-600" />
                      Top 10 Districts
                    </h3>
                  </div>
                  <div className="p-6">
                    {rankings.topDistricts.length > 0 ? (
                      <div className="space-y-3">
                        {rankings.topDistricts.map((district, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{district.name}</p>
                                <p className="text-xs text-gray-500">{district.handpumps} handpumps</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{district.performance.toFixed(1)}%</p>
                              <p className="text-xs text-gray-500">{district.active} active</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No data available</div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-rose-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <ArrowDown size={20} className="text-red-600" />
                      Bottom 10 Districts
                    </h3>
                  </div>
                  <div className="p-6">
                    {rankings.bottomDistricts.length > 0 ? (
                      <div className="space-y-3">
                        {rankings.bottomDistricts.map((district, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{district.name}</p>
                                <p className="text-xs text-gray-500">{district.handpumps} handpumps</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-600">{district.performance.toFixed(1)}%</p>
                              <p className="text-xs text-gray-500">{district.active} active</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No data available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top & Bottom Blocks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <ArrowUp size={20} className="text-blue-600" />
                      Top 10 Blocks
                    </h3>
                  </div>
                  <div className="p-6">
                    {rankings.topBlocks.length > 0 ? (
                      <div className="space-y-3">
                        {rankings.topBlocks.map((block, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{block.name}</p>
                                <p className="text-xs text-gray-500">{block.handpumps} handpumps</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600">{block.performance.toFixed(1)}%</p>
                              <p className="text-xs text-gray-500">{block.active} active</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No data available</div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <ArrowDown size={20} className="text-orange-600" />
                      Bottom 10 Blocks
                    </h3>
                  </div>
                  <div className="p-6">
                    {rankings.bottomBlocks.length > 0 ? (
                      <div className="space-y-3">
                        {rankings.bottomBlocks.map((block, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{block.name}</p>
                                <p className="text-xs text-gray-500">{block.handpumps} handpumps</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-orange-600">{block.performance.toFixed(1)}%</p>
                              <p className="text-xs text-gray-500">{block.active} active</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No data available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top & Bottom Gram Panchayats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <ArrowUp size={20} className="text-purple-600" />
                      Top 10 Gram Panchayats
                    </h3>
                  </div>
                  <div className="p-6">
                    {rankings.topGPs.length > 0 ? (
                      <div className="space-y-3">
                        {rankings.topGPs.map((gp, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{gp.name}</p>
                                <p className="text-xs text-gray-500">{gp.handpumps} handpumps</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-purple-600">{gp.performance.toFixed(1)}%</p>
                              <p className="text-xs text-gray-500">{gp.active} active</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No data available</div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <ArrowDown size={20} className="text-yellow-600" />
                      Bottom 10 Gram Panchayats
                    </h3>
                  </div>
                  <div className="p-6">
                    {rankings.bottomGPs.length > 0 ? (
                      <div className="space-y-3">
                        {rankings.bottomGPs.map((gp, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{gp.name}</p>
                                <p className="text-xs text-gray-500">{gp.handpumps} handpumps</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-yellow-600">{gp.performance.toFixed(1)}%</p>
                              <p className="text-xs text-gray-500">{gp.active} active</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No data available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Handpumps Tab */}
        {activeTab === 'handpumps' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Handpumps</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalHandpumps.toLocaleString()}</p>
                  </div>
                  <Droplets size={28} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Active</p>
                    <p className="text-3xl font-bold mt-2">{stats.activeHandpumps.toLocaleString()}</p>
                  </div>
                  <CheckCircle size={28} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-600 to-rose-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Inactive</p>
                    <p className="text-3xl font-bold mt-2">{stats.inactiveHandpumps}</p>
                  </div>
                  <AlertCircle size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">Handpump Registry</h3>
                  <div className="flex gap-2">
                    <button 
  onClick={handleExportHandpumps}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
>
  <Download size={16} />
  Export
</button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Village</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Water Quality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredHandpumps.length > 0 ? (
                      filteredHandpumps.slice(0, 10).map((hp) => (
                        <tr key={hp.H_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-semibold text-blue-600">{hp.HandpumpId}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {hp.DistrictName} - {hp.BlockName}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              hp.HandpumpStatus === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {hp.HandpumpStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{hp.VillegeName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{hp.WaterQuality || 'N/A'}</td>
                          
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No handpumps found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredHandpumps.length > 10 && (
                <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-600">
                  Showing 10 of {filteredHandpumps.length} handpumps
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requisitions Tab */}
{activeTab === 'requisitions' && (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Total Requisitions</p>
            <p className="text-3xl font-bold mt-2">{stats.totalRequisitions.toLocaleString()}</p>
          </div>
          <FileText size={28} />
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Repair</p>
            <p className="text-3xl font-bold mt-2">{stats.repairRequisitions.toLocaleString()}</p>
          </div>
          <Activity size={28} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Rebore</p>
            <p className="text-3xl font-bold mt-2">{stats.reboreRequisitions.toLocaleString()}</p>
          </div>
          <TrendingUp size={28} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-100 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold mt-2">{stats.pendingRequisitions}</p>
          </div>
          <Clock size={28} />
        </div>
      </div>
    </div>

    {/* Requisition Type Distribution Chart */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-purple-600" />
          Requisition Type Distribution
        </h3>
        {stats.totalRequisitions > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Repair', value: stats.repairRequisitions, color: '#3B82F6' },
                  { name: 'Rebore', value: stats.reboreRequisitions, color: '#10B981' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#3B82F6" />
                <Cell fill="#10B981" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No requisition data available
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-blue-600" />
          Status Overview
        </h3>
        {stats.totalRequisitions > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'Pending', value: stats.pendingRequisitions, fill: '#F59E0B' },
              { name: 'Approved', value: stats.approvedRequisitions, fill: '#3B82F6' },
              { name: 'Completed', value: stats.completedRequisitions, fill: '#10B981' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No status data available
          </div>
        )}
      </div>
    </div>

    {/* Financial Overview */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Total Sanctioned Amount</h4>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600">
            ₹{(stats.totalSanctionAmount / 100000).toFixed(2)}L
          </div>
          <p className="text-sm text-gray-600 mt-2">Across all requisitions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Avg. Sanction Amount</h4>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">
            ₹{stats.approvedRequisitions > 0 
              ? (stats.totalSanctionAmount / stats.approvedRequisitions / 1000).toFixed(1) 
              : 0}K
          </div>
          <p className="text-sm text-gray-600 mt-2">Per requisition</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Completion Rate</h4>
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-600">
            {stats.totalRequisitions > 0 
              ? Math.round((stats.completedRequisitions / stats.totalRequisitions) * 100) 
              : 0}%
          </div>
          <p className="text-sm text-gray-600 mt-2">Overall efficiency</p>
        </div>
      </div>
    </div>

    {/* Requisitions Table */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Requisition Registry</h3>
          <div className="flex gap-2">
            <button 
  onClick={handleExportRequisitions}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
>
  <Download size={16} />
  Export
</button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Req. ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Handpump</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Village</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRequisitions.length > 0 ? (
              filteredRequisitions.slice(0, 10).map((req) => (
                <tr key={req.RequisitionId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold text-purple-600">
                    REQ-{req.RequisitionId.toString().padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{req.HandpumpId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{req.VillageName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      req.RequisitionTypeId === 1 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {req.RequisitionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(req.RequisitionDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      req.RequisitionStatus === 1 
                        ? 'bg-amber-100 text-amber-700' 
                        : req.RequisitionStatus === 2
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {req.RequisitionStatus === 1 ? 'Pending' : req.RequisitionStatus === 2 ? 'Approved' : 'Completed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    {req.SanctionAmount 
                      ? `₹${parseFloat(req.SanctionAmount).toLocaleString('en-IN')}` 
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button 
  onClick={() => handleViewRequisition(req)}
  className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
  title="View Details"
>
  <Eye size={16} />
</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No requisitions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredRequisitions.length > 10 && (
        <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-600">
          Showing 10 of {filteredRequisitions.length} requisitions
        </div>
      )}
    </div>
  </div>
)}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Success Rate</h4>
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600">
                    {stats.totalHandpumps > 0 
                      ? Math.round((stats.activeHandpumps / stats.totalHandpumps) * 100) 
                      : 0}%
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Handpumps Operational</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Total Coverage</h4>
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600">{stats.totalDistricts}</div>
                  <p className="text-sm text-gray-600 mt-2">Districts Covered</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Total Blocks</h4>
                <div className="text-center">
                  <div className="text-5xl font-bold text-purple-600">{stats.totalBlocks}</div>
                  <p className="text-sm text-gray-600 mt-2">Blocks Monitored</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Infrastructure Overview</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Soakpit Connected</span>
                    <span className="text-xl font-bold text-blue-600">
                      {handpumps.filter(hp => hp.SoakpitConnected === 1).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Drainage Connected</span>
                    <span className="text-xl font-bold text-green-600">
                      {handpumps.filter(hp => hp.DrainageConnected === 1).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Platform Built</span>
                    <span className="text-xl font-bold text-purple-600">
                      {handpumps.filter(hp => hp.PlateformBuild === 1).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Total GPs</span>
                    <span className="text-xl font-bold text-orange-600">{stats.totalGPs}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Water Quality Distribution</h4>
                <div className="space-y-3">
                  {['Good', 'Average', 'Poor'].map(quality => {
                    const count = handpumps.filter(hp => hp.WaterQuality === quality).length;
                    const percentage = stats.totalHandpumps > 0 
                      ? ((count / stats.totalHandpumps) * 100).toFixed(1) 
                      : 0;
                    return (
                      <div key={quality}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{quality}</span>
                          <span className="text-sm font-semibold text-gray-800">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              quality === 'Good' ? 'bg-green-500' : 
                              quality === 'Average' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;