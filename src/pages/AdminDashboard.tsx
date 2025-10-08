import React, { useState, useRef, useEffect } from 'react';
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
  Calendar,
  Wrench,
  Drill,
  Shield,
  BarChart3,
  Activity,
  Map,
  Database,
  X,
  ChevronRight,
  Navigation,
  AlertCircle,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);

  // GMAS Component State
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedGramPanchayat, setSelectedGramPanchayat] = useState('All');
  const [selectedHandpump, setSelectedHandpump] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [showRequisitionDetails, setShowRequisitionDetails] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const mapRef = useRef(null);
  const modalMapRef = useRef(null);

  // GMAS Data
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
    underrepair: new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    }),
  };

  const districts = ['All', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad'];
  const blocks = {
    All: ['All'],
    Lucknow: ['All', 'Sadar', 'Mohanlalganj', 'Malihabad', 'Bakshi Ka Talab'],
    Kanpur: ['All', 'Kanpur Sadar', 'Ghatampur', 'Bilhaur', 'Chaubepur'],
    Agra: ['All', 'Agra Sadar', 'Kheragarh', 'Fatehabad', 'Bah'],
    Varanasi: ['All', 'Varanasi Sadar', 'Pindra', 'Chiraigaon', 'Harhua'],
    Allahabad: ['All', 'Phulpur', 'Soraon', 'Handia', 'Karchana'],
  };

  const gramPanchayats = {
    All: ['All'],
    Sadar: ['All', 'Rampur', 'Shyampur', 'Govindpur', 'Krishnapur'],
    Mohanlalganj: ['All', 'Malihabad', 'Bakshi Ka Talab', 'Chinhat', 'Itaunja'],
    Malihabad: ['All', 'Malihabad Central', 'Kakori', 'Mall', 'Nagram'],
  };

  const handpumps = [
    {
      id: 'HP001',
      name: 'Handpump Rampur-1',
      coordinates: [26.8467, 80.9462],
      status: 'active',
      district: 'Lucknow',
      block: 'Sadar',
      gramPanchayat: 'Rampur',
      village: 'Rampur',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=200&fit=crop',
      installationDate: '2020-03-15',
      requisitions: [
        { id: 'REQ001', date: '2024-03-15', mode: 'Repair', status: 'Completed', estimatedAmount: 5140, actualAmount: 5890, completionDate: '2024-04-05' },
      ],
    },
    {
      id: 'HP002',
      name: 'Handpump Shyampur-1',
      coordinates: [26.8567, 80.9562],
      status: 'inactive',
      district: 'Lucknow',
      block: 'Sadar',
      gramPanchayat: 'Shyampur',
      village: 'Shyampur',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
      installationDate: '2019-07-22',
      requisitions: [],
    },
    {
      id: 'HP003',
      name: 'Handpump Govindpur-1',
      coordinates: [26.8667, 80.9662],
      status: 'faulty',
      district: 'Lucknow',
      block: 'Sadar',
      gramPanchayat: 'Govindpur',
      village: 'Govindpur',
      image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=300&h=200&fit=crop',
      installationDate: '2018-12-10',
      requisitions: [],
    },
    {
      id: 'HP004',
      name: 'Handpump Krishnapur-1',
      coordinates: [26.8767, 80.9762],
      status: 'active',
      district: 'Lucknow',
      block: 'Sadar',
      gramPanchayat: 'Krishnapur',
      village: 'Krishnapur',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=200&fit=crop',
      installationDate: '2021-05-18',
      requisitions: [],
    },
    {
      id: 'HP005',
      name: 'Handpump Central-1',
      coordinates: [26.9167, 80.9862],
      status: 'active',
      district: 'Lucknow',
      block: 'Mohanlalganj',
      gramPanchayat: 'Malihabad',
      village: 'Malihabad Central',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=200&fit=crop',
      installationDate: '2022-01-12',
      requisitions: [],
    },
    {
      id: 'HP006',
      name: 'Handpump Kanpur-1',
      coordinates: [26.4499, 80.3319],
      status: 'inactive',
      district: 'Kanpur',
      block: 'Kanpur Sadar',
      gramPanchayat: 'Kanpur Central',
      village: 'Kanpur Central',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
      installationDate: '2020-08-15',
      requisitions: [],
    },
  ];

  const getFilteredHandpumps = () => {
    return handpumps.filter((hp) => {
      const districtMatch = selectedDistrict === 'All' || hp.district === selectedDistrict;
      const blockMatch = selectedBlock === 'All' || hp.block === selectedBlock;
      const gpMatch = selectedGramPanchayat === 'All' || hp.gramPanchayat === selectedGramPanchayat;
      return districtMatch && blockMatch && gpMatch;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#F59E0B';
      case 'faulty': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedBlock('All');
    setSelectedGramPanchayat('All');
  };

  const handleBlockChange = (block) => {
    setSelectedBlock(block);
    setSelectedGramPanchayat('All');
  };

  const filteredHandpumps = getFilteredHandpumps();
  const activeCount = filteredHandpumps.filter((hp) => hp.status === 'active').length;
  const inactiveCount = filteredHandpumps.filter((hp) => hp.status === 'inactive').length;
  const faultyCount = filteredHandpumps.filter((hp) => hp.status === 'faulty').length;

  useEffect(() => {
    if (activeTab === 'gis' && mapRef.current && filteredHandpumps.length > 0) {
      const bounds = L.latLngBounds(filteredHandpumps.map((hp) => hp.coordinates));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [filteredHandpumps, activeTab]);

  // Dashboard Statistics
  const stats = {
    totalHandpumps: 1247,
    activeHandpumps: 1089,
    inactiveHandpumps: 158,
    totalComplaints: 342,
    pendingComplaints: 89,
    resolvedComplaints: 253,
    totalRequisitions: 156,
    pendingEstimations: 23,
    sanctionedRequisitions: 87,
    completedWork: 46,
    totalDistricts: 12,
    totalBlocks: 78,
    totalGPs: 456,
    activeUsers: 892
  };

  // Recent Activities
  const recentActivities = [
    { id: 1, type: 'complaint', message: 'New complaint registered - HP001234', time: '5 min ago', priority: 'high' },
    { id: 2, type: 'requisition', message: 'Requisition REQ089 approved', time: '15 min ago', priority: 'normal' },
    { id: 3, type: 'estimation', message: 'Estimation EST045 created', time: '1 hour ago', priority: 'normal' },
    { id: 4, type: 'completion', message: 'Work completed for HP005678', time: '2 hours ago', priority: 'low' },
    { id: 5, type: 'handpump', message: 'New handpump registered - HP009876', time: '3 hours ago', priority: 'normal' }
  ];

  // District-wise Summary
  const districtSummary = [
    { name: 'Lucknow', handpumps: 245, complaints: 45, requisitions: 23, active: 218 },
    { name: 'Kanpur', handpumps: 198, complaints: 38, requisitions: 19, active: 175 },
    { name: 'Agra', handpumps: 167, complaints: 32, requisitions: 15, active: 148 },
    { name: 'Varanasi', handpumps: 143, complaints: 28, requisitions: 12, active: 127 },
    { name: 'Allahabad', handpumps: 134, complaints: 25, requisitions: 11, active: 119 }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Handpump Management System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-80">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search handpumps, complaints, requisitions..."
                  className="bg-transparent focus:outline-none flex-1 text-sm"
                />
              </div>
              
              {/* Notifications */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">Admin User</p>
                  <p className="text-xs text-gray-500">System Administrator</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6 flex gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'handpumps', label: 'Handpumps', icon: Droplets },
            { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
            { id: 'requisitions', label: 'Requisitions', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'gis', label: 'GIS Map', icon: Map }
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
              {/* Total Handpumps */}
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

              {/* Active Handpumps */}
              <div className="group bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Active Handpumps</p>
                    <p className="text-3xl font-bold mt-2">{stats.activeHandpumps.toLocaleString()}</p>
                    <p className="text-green-200 text-xs mt-1">87% operational</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <CheckCircle size={28} />
                  </div>
                </div>
              </div>

              {/* Total Complaints */}
              <div className="group bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Total Complaints</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalComplaints}</p>
                    <p className="text-orange-200 text-xs mt-1">{stats.pendingComplaints} pending</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={28} />
                  </div>
                </div>
              </div>

              {/* Total Requisitions */}
              <div className="group bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Requisitions</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalRequisitions}</p>
                    <p className="text-purple-200 text-xs mt-1">{stats.sanctionedRequisitions} sanctioned</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText size={28} />
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Districts</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalDistricts}</p>
                  </div>
                  <MapPin size={24} className="text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Blocks</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalBlocks}</p>
                  </div>
                  <Database size={24} className="text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Gram Panchayats</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalGPs}</p>
                  </div>
                  <Settings size={24} className="text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Active Users</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.activeUsers}</p>
                  </div>
                  <Users size={24} className="text-orange-600" />
                </div>
              </div>
            </div>

            {/* Recent Activities & District Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Activity size={20} className="text-blue-600" />
                      Recent Activities
                    </h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getPriorityColor(activity.priority)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 font-medium">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* District Summary */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <MapPin size={20} className="text-blue-600" />
                      Top Districts
                    </h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {districtSummary.map((district, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-800">{district.name}</h4>
                          <span className="text-sm font-semibold text-blue-600">{district.handpumps} HPs</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-gray-500">Active:</span>
                            <span className="ml-1 font-semibold text-green-600">{district.active}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Complaints:</span>
                            <span className="ml-1 font-semibold text-orange-600">{district.complaints}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Requisitions:</span>
                            <span className="ml-1 font-semibold text-purple-600">{district.requisitions}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all">
                  <Droplets size={24} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">View Handpumps</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200 hover:shadow-md transition-all">
                  <AlertTriangle size={24} className="text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">View Complaints</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:shadow-md transition-all">
                  <FileText size={24} className="text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">View Requisitions</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all">
                  <Download size={24} className="text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Export Reports</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Handpumps Tab */}
        {activeTab === 'handpumps' && (
          <div className="space-y-6">
            {/* Stats for Handpumps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Handpumps</p>
                    <p className="text-3xl font-bold mt-2">1,247</p>
                  </div>
                  <Droplets size={28} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Functional</p>
                    <p className="text-3xl font-bold mt-2">1,089</p>
                  </div>
                  <CheckCircle size={28} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Under Repair</p>
                    <p className="text-3xl font-bold mt-2">98</p>
                  </div>
                  <Clock size={28} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-600 to-rose-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Non-Functional</p>
                    <p className="text-3xl font-bold mt-2">60</p>
                  </div>
                  <AlertCircle size={28} />
                </div>
              </div>
            </div>

            {/* Handpumps Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">Handpump Registry</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <Filter size={16} />
                      Filter
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
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
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Last Maintenance</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { id: 'HP001', location: 'Lucknow - Sadar', status: 'Functional', date: '2024-03-15' },
                      { id: 'HP002', location: 'Kanpur - Ghatampur', status: 'Under Repair', date: '2024-03-10' },
                      { id: 'HP003', location: 'Agra - Kheragarh', status: 'Functional', date: '2024-03-12' },
                      { id: 'HP004', location: 'Varanasi - Pindra', status: 'Non-Functional', date: '2024-02-28' },
                      { id: 'HP005', location: 'Allahabad - Phulpur', status: 'Functional', date: '2024-03-18' }
                    ].map((hp) => (
                      <tr key={hp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600">{hp.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{hp.location}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            hp.status === 'Functional' ? 'bg-green-100 text-green-700' :
                            hp.status === 'Under Repair' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {hp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{hp.date}</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Total Complaints</p>
                    <p className="text-3xl font-bold mt-2">342</p>
                  </div>
                  <AlertTriangle size={28} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-600 to-amber-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold mt-2">89</p>
                  </div>
                  <Clock size={28} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">In Progress</p>
                    <p className="text-3xl font-bold mt-2">76</p>
                  </div>
                  <Activity size={28} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Resolved</p>
                    <p className="text-3xl font-bold mt-2">177</p>
                  </div>
                  <CheckCircle size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Complaint Management</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Complaint ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Handpump</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Issue</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { id: 'CMP001', hp: 'HP001', issue: 'Water Quality Issues', priority: 'High', status: 'Pending' },
                      { id: 'CMP002', hp: 'HP023', issue: 'Not Working', priority: 'Critical', status: 'In Progress' },
                      { id: 'CMP003', hp: 'HP045', issue: 'Low Pressure', priority: 'Medium', status: 'Resolved' },
                      { id: 'CMP004', hp: 'HP067', issue: 'Handle Broken', priority: 'Low', status: 'Pending' }
                    ].map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-semibold text-orange-600">{complaint.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{complaint.hp}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{complaint.issue}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            complaint.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                            complaint.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                            complaint.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {complaint.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            complaint.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Requisitions Tab */}
        {activeTab === 'requisitions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total</p>
                    <p className="text-3xl font-bold mt-2">156</p>
                  </div>
                  <FileText size={28} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold mt-2">23</p>
                  </div>
                  <Clock size={28} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Sanctioned</p>
                    <p className="text-3xl font-bold mt-2">87</p>
                  </div>
                  <CheckCircle size={28} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold mt-2">46</p>
                  </div>
                  <TrendingUp size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Requisition Management</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Req. ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Handpump</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { id: 'REQ001', hp: 'HP001', type: 'Repair', amount: '₹5,140', status: 'Completed' },
                      { id: 'REQ002', hp: 'HP002', type: 'Rebore', amount: '₹21,947', status: 'Sanctioned' },
                      { id: 'REQ003', hp: 'HP003', type: 'Repair', amount: '₹4,890', status: 'Pending' },
                      { id: 'REQ004', hp: 'HP004', type: 'Rebore', amount: '₹19,875', status: 'Completed' }
                    ].map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-semibold text-purple-600">{req.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{req.hp}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            req.type === 'Repair' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {req.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">{req.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            req.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            req.status === 'Sanctioned' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  <div className="text-5xl font-bold text-green-600">87%</div>
                  <p className="text-sm text-gray-600 mt-2">Handpumps Operational</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Avg Resolution Time</h4>
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600">2.5</div>
                  <p className="text-sm text-gray-600 mt-2">Days</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Monthly Budget</h4>
                <div className="text-center">
                  <div className="text-5xl font-bold text-purple-600">₹4.2L</div>
                  <p className="text-sm text-gray-600 mt-2">Spent This Month</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">District Performance</h4>
                <div className="space-y-4">
                  {districtSummary.map((district, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{district.name}</span>
                        <span className="text-sm font-semibold text-gray-800">{Math.round((district.active / district.handpumps) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                          style={{ width: `${(district.active / district.handpumps) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Monthly Trends</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">New Installations</span>
                    <span className="text-xl font-bold text-green-600">+23</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Repairs Completed</span>
                    <span className="text-xl font-bold text-blue-600">46</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Pending Complaints</span>
                    <span className="text-xl font-bold text-orange-600">89</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Budget Utilization</span>
                    <span className="text-xl font-bold text-purple-600">73%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GIS Tab - Full GMAS Component */}
        {activeTab === 'gis' && (
          <div className="space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="group bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Active Handpumps</p>
                    <p className="text-3xl font-bold mt-1">{activeCount}</p>
                    <p className="text-green-200 text-xs mt-1">Operational</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-green-400"></div>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Inactive Handpumps</p>
                    <p className="text-3xl font-bold mt-1">{inactiveCount}</p>
                    <p className="text-amber-200 text-xs mt-1">Needs Attention</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-amber-400"></div>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-red-600 to-rose-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Faulty Handpumps</p>
                    <p className="text-3xl font-bold mt-1">{faultyCount}</p>
                    <p className="text-red-200 text-xs mt-1">Requires Repair</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-red-400"></div>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Handpumps</p>
                    <p className="text-3xl font-bold mt-1">{filteredHandpumps.length}</p>
                    <p className="text-blue-200 text-xs mt-1">In Current View</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Map Container */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-gray-700 to-slate-700 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Navigation size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Interactive GIS Map</h2>
                    <p className="text-gray-200 mt-1">Real-time handpump locations and status monitoring</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSatelliteView(!isSatelliteView)}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors font-medium flex items-center gap-2"
                >
                  {isSatelliteView ? 'Switch to Map View' : 'Switch to Satellite View'}
                </button>
              </div>

              <div className="relative h-[600px] overflow-hidden">
                <MapContainer
                  center={[26.8467, 80.9462]}
                  zoom={10}
                  style={{ height: '100%', width: '100%', zIndex: 10 }}
                  ref={mapRef}
                >
                  <TileLayer
                    url={isSatelliteView
                      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                    attribution={
                      isSatelliteView
                        ? '&copy; <a href="https://www.esri.com/">Esri</a>'
                        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                  />
                  {filteredHandpumps.map((handpump) => (
                    <Marker
                      key={handpump.id}
                      position={handpump.coordinates}
                      icon={statusIcons[handpump.status === 'active' ? 'functional' : handpump.status === 'inactive' ? 'nonfunctional' : 'underrepair']}
                      eventHandlers={{
                        click: () => setSelectedHandpump(handpump),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold">{handpump.name}</h3>
                          <p>Status: {handpump.status}</p>
                          <p>District: {handpump.district}</p>
                          <p>Block: {handpump.block}</p>
                          <p>Gram Panchayat: {handpump.gramPanchayat}</p>
                          <p>Village: {handpump.village}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>

                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[100]">
                  <h3 className="text-lg font-bold text-gray-800">Uttar Pradesh</h3>
                  <p className="text-sm text-gray-600">Handpump Distribution Map</p>
                </div>

                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[100]">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-16 h-1 bg-gray-400"></div>
                    <span>50 km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Handpump Info Modal */}
            {selectedHandpump && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto z-[1001]">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center"
                          style={{ backgroundColor: getStatusColor(selectedHandpump.status) }}
                        >
                          <MapPin size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{selectedHandpump.name}</h3>
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
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                            selectedHandpump.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : selectedHandpump.status === 'inactive'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {selectedHandpump.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">District:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.district}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Block:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.block}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gram Panchayat:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.gramPanchayat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Village:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.village}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Installation Date:</span>
                        <span className="font-semibold text-gray-800">
                          {new Date(selectedHandpump.installationDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coordinates:</span>
                        <span className="font-semibold text-gray-800">
                          {selectedHandpump.coordinates[0].toFixed(4)}°N, {selectedHandpump.coordinates[1].toFixed(4)}°E
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Notifications</h3>
            <button onClick={() => setShowNotifications(false)}>
              <X size={18} className="text-gray-500" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {recentActivities.map(activity => (
              <div key={activity.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <p className="text-sm text-gray-800">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
          <div className="p-3 text-center border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;