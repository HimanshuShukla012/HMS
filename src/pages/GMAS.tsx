import React, { useState, useRef, useEffect } from 'react';
import { Filter, MapPin, X, Calendar, FileText, Wrench, Drill, Download, CheckCircle, Clock, AlertCircle, TrendingUp, Navigation, Loader } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUserInfo } from '../utils/userInfo';

const GMAS = () => {
  const { userId, loading: userLoading, error: userError } = useUserInfo();
  const [handpumps, setHandpumps] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePopup, setImagePopup] = useState<string | null>(null);

  
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedGramPanchayat, setSelectedGramPanchayat] = useState('All');
  const [selectedHandpump, setSelectedHandpump] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [showRequisitionDetails, setShowRequisitionDetails] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState('');
  const [searchHandpumpId, setSearchHandpumpId] = useState('');

  const mapRef = useRef(null);
  const modalMapRef = useRef(null);

  const API_BASE = 'https://hmsapi.kdsgroup.co.in/api';

  // Get role from token
  useEffect(() => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload?.Role || payload?.UserRoll || "");
    } catch (e) {
      console.error("Failed to decode token", e);
    }
  }, []);

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

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

  // Fetch user profile and auto-populate filters
  useEffect(() => {
    if (userLoading || !userId) return;
    
    const authToken = getAuthToken();
    if (!authToken) return;

    fetch(`${API_BASE}/Signup/GetUserProfileById?UserId=${userId}`, {
      method: "GET",
      headers: { 
        accept: "*/*",
        Authorization: `Bearer ${authToken}`
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('User Profile API response:', data);
        if (data.Status && data.Data && data.Data.length > 0) {
          const profile = data.Data[0];
          setUserProfile(profile);
          
          // For Gram Panchayat Sachiv, auto-populate filters
          if (role.toLowerCase().includes("grampanchayat") || role.toLowerCase().includes("gram_panchayat")) {
            if (profile.DistrictName) {
              setSelectedDistrict(profile.DistrictName);
            }
            if (profile.BlockName) {
              setSelectedBlock(profile.BlockName);
            }
            if (profile.GramPanchayatName) {
              setSelectedGramPanchayat(profile.GramPanchayatName);
            }
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching user profile:', err);
      });
  }, [userLoading, userId, role]);

  // Fetch data from APIs
  useEffect(() => {
    if (userLoading) return; // Wait for user info to load
    
    if (!userId) {
      setError('User ID not found. Please login again.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const authToken = getAuthToken();
        
        if (!authToken) {
          throw new Error('Authentication token not found. Please login again.');
        }

        // Fetch handpumps
        const handpumpsResponse = await fetch(
          `${API_BASE}/HandpumpRegistration/GetHandpumpListByUserId?UserId=${userId}`,
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
          `${API_BASE}/HandpumpRequisition/GetRequisitionListByUserId?UserId=${userId}`,
          {
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${authToken}`
            }
          }
        );

        if (!requisitionsResponse.ok) throw new Error('Failed to fetch requisitions');
        const requisitionsData = await requisitionsResponse.json();

        // Validate data structure
        if (!handpumpsData || !handpumpsData.Data || !Array.isArray(handpumpsData.Data)) {
          console.warn('Invalid handpumps data structure:', handpumpsData);
          setHandpumps([]);
          setRequisitions([]);
          setLoading(false);
          return;
        }

        if (!requisitionsData || !requisitionsData.Data || !Array.isArray(requisitionsData.Data)) {
          console.warn('Invalid requisitions data structure:', requisitionsData);
          requisitionsData.Data = [];
        }

        // Process handpumps data
        const processedHandpumps = handpumpsData.Data
          .filter(hp => hp.Latitude && hp.Longitude) // Filter out invalid coordinates
          .map(hp => {
          // Map requisitions to this handpump using H_id = HPId
          const hpRequisitions = (requisitionsData.Data || [])
            .filter(req => req.HPId === hp.H_id)
            .map(req => ({
              id: req.RequisitionId?.toString() || 'N/A',
              date: req.RequisitionDate || new Date().toISOString(),
              mode: req.RequisitionType || 'Unknown',
              status: req.RequisitionStatus === 1 ? 'Pending' : req.RequisitionStatus === 2 ? 'Completed' : 'On-Hold',
              estimatedAmount: req.SubTotal || 0,
              actualAmount: req.GrandTotal || 0,
              completionDate: req.CreatedDate || '',
              description: req.RequisitionDesc || ''
            }));

          return {
            id: hp.HandpumpId || hp.H_id,
            h_id: hp.H_id,
            videoPath: hp.HandpumpVideoPath || null,
            name: `Handpump ${hp.HandpumpId || hp.H_id}`,
            coordinates: [parseFloat(hp.Latitude), parseFloat(hp.Longitude)],
            status: hp.HandpumpStatus === 'Active' ? 'active' : 'inactive',
            district: hp.DistrictName || 'Unknown',
            block: hp.BlockName || 'Unknown',
            gramPanchayat: hp.GrampanchayatName || 'Unknown',
            village: hp.VillegeName || 'Unknown',
            image: hp.HandpumpImage || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=200&fit=crop',
            installationDate: hp.CreatedDate || new Date().toISOString(),
            waterQuality: hp.WaterQuality || 'Unknown',
            waterQualityRemarks: hp.WaterQualityRemarks || '',
            nearByPerson: hp.NearByPersonName || 'N/A',
            nearByContact: hp.NearByPersonContact || 'N/A',
            soakpitConnected: hp.SoakpitConnected === 1,
            drainageConnected: hp.DrainageConnected === 1,
            platformBuild: hp.PlateformBuild === 1,
            lastRepairDate: hp.LastRepairDate || '',
            lastReboreDate: hp.LastReboreDate || '',
            requisitions: hpRequisitions
          };
        });

        setHandpumps(processedHandpumps);
        setRequisitions(requisitionsData.Data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, userLoading]);

  // Get unique districts, blocks, and gram panchayats from data
  const districts = ['All', ...new Set(handpumps.map(hp => hp.district))];
  const blocks = {
    All: ['All'],
    ...handpumps.reduce((acc, hp) => {
      if (!acc[hp.district]) acc[hp.district] = new Set(['All']);
      acc[hp.district].add(hp.block);
      return acc;
    }, {})
  };
  const gramPanchayats = {
    All: ['All'],
    ...handpumps.reduce((acc, hp) => {
      if (!acc[hp.block]) acc[hp.block] = new Set(['All']);
      acc[hp.block].add(hp.gramPanchayat);
      return acc;
    }, {})
  };

  // Convert Sets to Arrays
  Object.keys(blocks).forEach(key => {
    if (blocks[key] instanceof Set) {
      blocks[key] = Array.from(blocks[key]);
    }
  });
  Object.keys(gramPanchayats).forEach(key => {
    if (gramPanchayats[key] instanceof Set) {
      gramPanchayats[key] = Array.from(gramPanchayats[key]);
    }
  });

  const getFilteredHandpumps = () => {
    return handpumps.filter((hp) => {
      const districtMatch = selectedDistrict === 'All' || hp.district === selectedDistrict;
      const blockMatch = selectedBlock === 'All' || hp.block === selectedBlock;
      const gpMatch = selectedGramPanchayat === 'All' || hp.gramPanchayat === selectedGramPanchayat;
      const handpumpIdMatch = searchHandpumpId === '' || hp.id.toString().toLowerCase().includes(searchHandpumpId.toLowerCase());
      return districtMatch && blockMatch && gpMatch && handpumpIdMatch;
    });
  };

  const handleHandpumpSearch = (searchId) => {
    setSearchHandpumpId(searchId);
    
    // If search ID is provided, find and zoom to that handpump
    if (searchId && mapRef.current) {
      const foundHandpump = handpumps.find(hp => 
        hp.id.toString().toLowerCase().includes(searchId.toLowerCase())
      );
      
      if (foundHandpump) {
        mapRef.current.setView(foundHandpump.coordinates, 16);
        setSelectedHandpump(foundHandpump);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'inactive':
        return '#F59E0B';
      case 'faulty':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle size={14} className="text-green-600" />;
      case 'Pending':
      case 'Pending at CE Level':
        return <Clock size={14} className="text-amber-600" />;
      case 'On-Hold':
        return <AlertCircle size={14} className="text-red-600" />;
      default:
        return <Clock size={14} className="text-gray-600" />;
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

  const handleRequisitionClick = (requisition) => {
    setSelectedRequisition(requisition);
    setShowRequisitionDetails(true);
  };

  const filteredHandpumps = getFilteredHandpumps();
  const activeCount = filteredHandpumps.filter((hp) => hp.status === 'active').length;
  const inactiveCount = filteredHandpumps.filter((hp) => hp.status === 'inactive').length;
  const faultyCount = filteredHandpumps.filter((hp) => hp.status === 'faulty').length;

  useEffect(() => {
    if (mapRef.current && filteredHandpumps.length > 0) {
      // If searching for a specific handpump, zoom to it
      if (searchHandpumpId && filteredHandpumps.length === 1) {
        mapRef.current.setView(filteredHandpumps[0].coordinates, 16);
      } else {
        const bounds = L.latLngBounds(filteredHandpumps.map((hp) => hp.coordinates));
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [filteredHandpumps, searchHandpumpId]);

  // Show loading state
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading GMAS data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || userError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error || userError}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-blue-900 rounded-xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-4">
              <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center">
                <MapPin size={28} />
              </div>
              Geographical Monitoring & Analysis System
              <span className="text-2xl font-semibold text-blue-300">(GMAS)</span>
            </h1>
            <p className="text-blue-100 text-lg mb-6 ml-18">
              Real-time GIS monitoring system for handpumps and their operation & maintenance
            </p>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <Filter size={20} className="text-white" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  disabled={role.toLowerCase().includes("grampanchayat") || role.toLowerCase().includes("gram_panchayat")}
                  className={`bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 ${
                    (role.toLowerCase().includes("grampanchayat") || role.toLowerCase().includes("gram_panchayat")) 
                      ? 'opacity-75 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  {districts.map((district) => (
                    <option key={district} value={district} className="text-gray-800">
                      {district === 'All' ? 'All Districts' : `${district} District`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <Filter size={20} className="text-white" />
                <select
                  value={selectedBlock}
                  onChange={(e) => handleBlockChange(e.target.value)}
                  disabled={role.toLowerCase().includes("grampanchayat") || role.toLowerCase().includes("gram_panchayat")}
                  className={`bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 ${
                    (role.toLowerCase().includes("grampanchayat") || role.toLowerCase().includes("gram_panchayat")) 
                      ? 'opacity-75 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  {(blocks[selectedDistrict] || ['All']).map((block) => (
                    <option key={block} value={block} className="text-gray-800">
                      {block === 'All' ? 'All Blocks' : `${block} Block`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <Filter size={20} className="text-white" />
                <select
                  value={selectedGramPanchayat}
                  onChange={(e) => setSelectedGramPanchayat(e.target.value)}
                  disabled={role.toLowerCase().includes("grampanchayat") || role.toLowerCase().includes("gram_panchayat")}
                  className={`bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 ${
                    (role.toLowerCase().includes("grampanchayat") || role.toLowerCase().includes("gram_panchayat")) 
                      ? 'opacity-75 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  {(gramPanchayats[selectedBlock] || ['All']).map((gp) => (
                    <option key={gp} value={gp} className="text-gray-800">
                      {gp === 'All' ? 'All Gram Panchayats' : `${gp} GP`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <MapPin size={20} className="text-white" />
                <input
                  type="text"
                  placeholder="Search Handpump ID"
                  value={searchHandpumpId}
                  onChange={(e) => handleHandpumpSearch(e.target.value)}
                  className="bg-transparent text-white placeholder-white/70 focus:outline-none flex-1"
                />
                {searchHandpumpId && (
                  <button
                    onClick={() => {
                      setSearchHandpumpId('');
                      setSelectedHandpump(null);
                    }}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
            {filteredHandpumps.length > 0 ? (
              <MapContainer
                center={filteredHandpumps[0].coordinates}
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
                        <p>GP: {handpump.gramPanchayat}</p>
                        <p>Village: {handpump.village}</p>
                        <p>Coordinates: {handpump.coordinates[0].toFixed(4)}°N, {handpump.coordinates[1].toFixed(4)}°E</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No handpumps found in selected area</p>
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[100]">
              <h3 className="text-lg font-bold text-gray-800">Uttar Pradesh</h3>
              <p className="text-sm text-gray-600">Handpump Distribution Map</p>
            </div>
          </div>
        </div>
      </div>

      {/* Handpump Info Modal */}
      {selectedHandpump && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[80vh] overflow-y-auto z-[1001]">
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
                            selectedHandpump.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
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
                        <span className="text-gray-600">Water Quality:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.waterQuality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nearby Person:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.nearByPerson}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact:</span>
                        <span className="font-semibold text-gray-800">{selectedHandpump.nearByContact}</span>
                      </div>
                    </div>
                  </div>

                  <div>
  <h4 className="text-lg font-bold text-gray-800 mb-4">Image</h4>
  <img
    src={
      selectedHandpump?.image ||
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=200&fit=crop"
    }
    alt={selectedHandpump?.name || "Handpump Image"}
    className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
    onClick={() =>
      selectedHandpump?.image && setImagePopup(selectedHandpump.image)
    }
    onError={(e) => {
      e.target.onerror = null;
      e.target.src =
        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=200&fit=crop";
    }}
  />
</div>

{selectedHandpump?.videoPath && (
  <div>
    <h4 className="text-lg font-bold text-gray-800 mb-4">Video</h4>
    <video
      className="w-full h-48 object-cover rounded-lg shadow-md"
      controls
      poster={selectedHandpump?.image}
    >
      <source src={selectedHandpump.videoPath} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
)}

{imagePopup && (
  <div
    className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000] p-4"
    onClick={() => setImagePopup(null)}
  >
    <div
      className="relative bg-white rounded-xl shadow-xl flex items-center justify-center max-w-5xl max-h-[90vh] w-auto h-auto overflow-hidden"
      onClick={(e) => e.stopPropagation()} // prevent closing when clicking image
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


                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Infrastructure</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Soakpit Connected:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedHandpump.soakpitConnected 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedHandpump.soakpitConnected ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Drainage Connected:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedHandpump.drainageConnected 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedHandpump.drainageConnected ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Platform Build:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedHandpump.platformBuild 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedHandpump.platformBuild ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Map and Requisitions */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Location Map</h4>
                    <div className="h-64 rounded-lg overflow-hidden shadow-md border border-gray-200">
                      <MapContainer
                        center={selectedHandpump.coordinates}
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
                          position={selectedHandpump.coordinates}
                          icon={statusIcons[selectedHandpump.status === 'active' ? 'functional' : selectedHandpump.status === 'inactive' ? 'nonfunctional' : 'underrepair']}
                        />
                      </MapContainer>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      📍 {selectedHandpump.coordinates[0].toFixed(6)}°N, {selectedHandpump.coordinates[1].toFixed(6)}°E
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Maintenance History</h4>
                    {selectedHandpump.requisitions && selectedHandpump.requisitions.length > 0 ? (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {selectedHandpump.requisitions.map((req) => (
                          <div
                            key={req.id}
                            onClick={() => handleRequisitionClick(req)}
                            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 hover:border-blue-400"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(req.status)}
                                <span className="font-semibold text-gray-800">Requisition #{req.id}</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                req.status === 'Completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : req.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(req.date).toLocaleDateString('en-IN')}
                              </div>
                              <div className="flex items-center gap-1">
                                {req.mode === 'Repair' ? <Wrench size={14} /> : <Drill size={14} />}
                                {req.mode}
                              </div>
                            </div>
                            <div className="mt-2 text-sm">
                              <span className="text-gray-600">Amount: </span>
                              <span className="font-semibold text-gray-800">₹{req.actualAmount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <FileText size={48} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-600">No maintenance history available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requisition Details Modal */}
      {showRequisitionDetails && selectedRequisition && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto z-[1101]">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Requisition Details</h3>
                    <p className="text-indigo-100">ID: {selectedRequisition.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRequisitionDetails(false)}
                  className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium mb-1">Requisition Date</p>
                  <p className="text-lg font-bold text-gray-800">
                    {new Date(selectedRequisition.date).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 font-medium mb-1">Mode</p>
                  <p className="text-lg font-bold text-gray-800">{selectedRequisition.mode}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedRequisition.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedRequisition.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedRequisition.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedRequisition.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-gray-800 mb-3">Financial Details</h4>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Amount:</span>
                  <span className="font-semibold text-gray-800">
                    ₹{selectedRequisition.estimatedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Actual Amount:</span>
                  <span className="font-bold text-blue-600 text-lg">
                    ₹{selectedRequisition.actualAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                {selectedRequisition.estimatedAmount !== selectedRequisition.actualAmount && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Variance:</span>
                    <span className={`font-semibold flex items-center gap-1 ${
                      selectedRequisition.actualAmount > selectedRequisition.estimatedAmount
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      <TrendingUp size={16} />
                      ₹{Math.abs(selectedRequisition.actualAmount - selectedRequisition.estimatedAmount).toLocaleString('en-IN')}
                      ({((Math.abs(selectedRequisition.actualAmount - selectedRequisition.estimatedAmount) / selectedRequisition.estimatedAmount) * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>

              {selectedRequisition.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedRequisition.description}</p>
                </div>
              )}

              {selectedRequisition.completionDate && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-2">Completion Date</h4>
                  <p className="text-gray-700">
                    {new Date(selectedRequisition.completionDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GMAS;