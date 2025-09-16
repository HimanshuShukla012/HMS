import React, { useState, useRef, useEffect } from 'react';
import { Filter, MapPin, X, Calendar, FileText, Wrench, Drill, Download, CheckCircle, Clock, AlertCircle, TrendingUp, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

const GMAS = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedGramPanchayat, setSelectedGramPanchayat] = useState('All');
  const [selectedHandpump, setSelectedHandpump] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [showRequisitionDetails, setShowRequisitionDetails] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview'); // 'overview' | 'details' | 'requisition'
  const [isSatelliteView, setIsSatelliteView] = useState(false); // State for satellite view toggle

  const mapRef = useRef(null);
  const modalMapRef = useRef(null);

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

  // Sample geographical data structure
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

  // Sample handpump data with coordinates (approximate UP region)
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
        {
          id: 'REQ001',
          date: '2024-03-15',
          mode: 'Repair',
          status: 'Completed',
          estimatedAmount: 5140,
          actualAmount: 5890,
          completionDate: '2024-04-05',
        },
        {
          id: 'REQ015',
          date: '2023-11-20',
          mode: 'Repair',
          status: 'Completed',
          estimatedAmount: 3200,
          actualAmount: 3100,
          completionDate: '2023-12-02',
        },
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
      requisitions: [
        {
          id: 'REQ002',
          date: '2024-03-16',
          mode: 'Rebore',
          status: 'Completed',
          estimatedAmount: 21947.73,
          actualAmount: 21500,
          completionDate: '2024-04-10',
        },
      ],
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
      requisitions: [
        {
          id: 'REQ003',
          date: '2024-03-17',
          mode: 'Repair',
          status: 'Pending at CE Level',
          estimatedAmount: 4890,
          actualAmount: 0,
          completionDate: null,
        },
        {
          id: 'REQ025',
          date: '2024-01-10',
          mode: 'Repair',
          status: 'Completed',
          estimatedAmount: 2800,
          actualAmount: 2950,
          completionDate: '2024-01-25',
        },
      ],
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
      requisitions: [
        {
          id: 'REQ004',
          date: '2024-03-18',
          mode: 'Rebore',
          status: 'On-Hold',
          estimatedAmount: 19875.50,
          actualAmount: 22100,
          completionDate: '2024-04-15',
        },
      ],
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
      requisitions: [
        {
          id: 'REQ005',
          date: '2024-02-10',
          mode: 'Repair',
          status: 'Completed',
          estimatedAmount: 3500,
          actualAmount: 3200,
          completionDate: '2024-02-22',
        },
      ],
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
      requisitions: [
        {
          id: 'REQ006',
          date: '2024-01-20',
          mode: 'Rebore',
          status: 'Completed',
          estimatedAmount: 18500,
          actualAmount: 19200,
          completionDate: '2024-02-15',
        },
      ],
    },
  ];

  // Sample repair items for requisition details
  const repairItems = [
    { sno: 1, item: 'Chain(25.4mm pitch roller chain with 7links)', unit: 'Nos', rate: 120, qty: 1, amount: 120 },
    { sno: 2, item: 'Axle', unit: 'Nos', rate: 80, qty: 1, amount: 80 },
    { sno: 3, item: 'Plunger', unit: 'Nos', rate: 250, qty: 1, amount: 250 },
    { sno: 4, item: 'Check Valve', unit: 'Nos', rate: 125, qty: 1, amount: 125 },
    { sno: 5, item: 'Cylinder Casing', unit: 'Nos', rate: 220, qty: 1, amount: 220 },
    { sno: 6, item: 'Nutbolt', unit: 'Nos', rate: 15, qty: 1, amount: 15 },
    { sno: 7, item: 'Handle Complete Set', unit: 'Nos', rate: 2200, qty: 1, amount: 2200 },
    { sno: 8, item: 'Pipe', unit: 'Nos', rate: 750, qty: 1, amount: 750 },
    { sno: 9, item: 'Bearing', unit: 'Nos', rate: 60, qty: 1, amount: 60 },
    { sno: 10, item: 'Plunger Rod', unit: 'Nos', rate: 220, qty: 1, amount: 220 },
  ];

  const reboreItems = [
    {
      sno: 1,
      item: 'Transportation of handpump material and T&P etc From market to the work site Including loading unloading and proper stacking at site work also including return cartage of unused material and T&P complete.',
      unit: 'Job',
      rate: 1706.46,
      qty: 1,
      amount: 1706.46,
    },
    {
      sno: 2,
      item: 'Dismantling of old PCC Platform Handpump machine GI pipe, Connecting rod and cylinder Including all labour T & P Complete',
      unit: 'Job',
      rate: 1984.15,
      qty: 1,
      amount: 1984.15,
    },
    {
      sno: 3,
      item: 'Cost of essential material for INDIA MARK- II handpump installation work',
      unit: '',
      rate: 0.0,
      qty: '',
      amount: 0.0,
    },
    {
      sno: '3.1',
      item: 'A. P.V.C PIPE(6KG/SQCM) 110 mm dia',
      unit: 'Rm',
      rate: 328.88,
      qty: 1,
      amount: 328.88,
    },
    {
      sno: '3.2',
      item: 'B. P.V.C PIPE(6KG/SQCM) 63 mm dia',
      unit: 'Rm',
      rate: 124.11,
      qty: 1,
      amount: 124.11,
    },
    {
      sno: '3.3',
      item: 'C. 63 mm nominal dia strainer or blind pipe',
      unit: 'Rm',
      rate: 651.56,
      qty: 1,
      amount: 651.56,
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
      case 'active':
        return '#10B981'; // green
      case 'inactive':
        return '#F59E0B'; // amber
      case 'faulty':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
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

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const gst = total * 0.18;
    const totalWithGST = total + gst;
    const consultingFee = totalWithGST * 0.01;
    const contingency = totalWithGST * 0.03;
    return {
      total,
      gst,
      totalWithGST,
      consultingFee,
      contingency,
      grandTotal: totalWithGST + consultingFee + contingency,
    };
  };

  const filteredHandpumps = getFilteredHandpumps();
  const activeCount = filteredHandpumps.filter((hp) => hp.status === 'active').length;
  const inactiveCount = filteredHandpumps.filter((hp) => hp.status === 'inactive').length;
  const faultyCount = filteredHandpumps.filter((hp) => hp.status === 'faulty').length;

  // Dynamically adjust main map bounds based on filtered handpumps
  useEffect(() => {
    if (mapRef.current && filteredHandpumps.length > 0) {
      const bounds = L.latLngBounds(filteredHandpumps.map((hp) => hp.coordinates));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [filteredHandpumps]);

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
              Geographical Monitoring System developed for GIS overview and supervision of Handpumps and its Operation & Maintenance
            </p>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <Filter size={20} className="text-white" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1"
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
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1"
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
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1"
                >
                  {(gramPanchayats[selectedBlock] || ['All']).map((gp) => (
                    <option key={gp} value={gp} className="text-gray-800">
                      {gp === 'All' ? 'All Gram Panchayats' : `${gp} GP`}
                    </option>
                  ))}
                </select>
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
            <MapContainer
              center={[26.8467, 80.9462]} // Center on Lucknow
              zoom={10}
              style={{ height: '100%', width: '100%', zIndex: 10 }} // Lower z-index for map
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
                      <p>Coordinates: {handpump.coordinates[0].toFixed(4)}°N, {handpump.coordinates[1].toFixed(4)}°E</p>
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
                {/* Left Side: Handpump Details */}
                <div className="space-y-6 overflow-y-auto pr-2 border-r border-gray-200">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Handpump Details</h4>
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

                  {/* Handpump Image */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Handpump Image</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <img
                        src={selectedHandpump.image}
                        alt={selectedHandpump.name}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  </div>

                  {/* Requisition History */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText size={20} />
                      Requisition History
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedHandpump.requisitions.length > 0 ? (
                        <div className="space-y-3">
                          {selectedHandpump.requisitions.map((requisition, index) => (
                            <div
                              key={requisition.id}
                              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => handleRequisitionClick(requisition)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-blue-600" />
                                    <span className="font-semibold text-blue-600">
                                      {new Date(requisition.date).toLocaleDateString('en-IN')}
                                    </span>
                                  </div>
                                  <span
                                    className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md ${
                                      requisition.mode === 'Repair'
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}
                                  >
                                    {requisition.mode === 'Repair' ? <Wrench size={14} /> : <Drill size={14} />}
                                    {requisition.mode}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md border ${
                                      requisition.status === 'Completed'
                                        ? 'text-green-700 bg-green-100 border-green-200'
                                        : requisition.status.includes('Pending')
                                        ? 'text-amber-700 bg-amber-100 border-amber-200'
                                        : 'text-red-700 bg-red-100 border-red-200'
                                    }`}
                                  >
                                    {getStatusIcon(requisition.status)}
                                    {requisition.status}
                                  </span>
                                  <span className="text-lg font-bold text-emerald-600">
                                    ₹{requisition.estimatedAmount?.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                <span>Requisition ID: {requisition.id}</span>
                                {requisition.completionDate && (
                                  <span className="ml-4">
                                    Completed: {new Date(requisition.completionDate).toLocaleDateString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">No requisitions found</p>
                          <p className="text-gray-400 text-sm">This handpump has no recorded requisitions</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-200">
                    {['overview', 'details', 'requisition'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`flex-1 px-4 py-2 text-sm font-medium capitalize ${
                          selectedTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Side: Close-up Map */}
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Handpump Location</h4>
                    <button
                      onClick={() => setIsSatelliteView(!isSatelliteView)}
                      className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      {isSatelliteView ? 'Switch to Map View' : 'Switch to Satellite View'}
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 h-[500px]">
                    <MapContainer
                      center={selectedHandpump.coordinates}
                      zoom={15} // Closer zoom level for detailed view
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={false} // Disable scroll wheel zoom to prevent interference with modal scrolling
                      ref={modalMapRef}
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
                      <Marker
                        position={selectedHandpump.coordinates}
                        icon={statusIcons[selectedHandpump.status === 'active' ? 'functional' : selectedHandpump.status === 'inactive' ? 'nonfunctional' : 'underrepair']}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold">{selectedHandpump.name}</h3>
                            <p>Status: {selectedHandpump.status}</p>
                            <p>Coordinates: {selectedHandpump.coordinates[0].toFixed(4)}°N, {selectedHandpump.coordinates[1].toFixed(4)}°E</p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requisition Details Modal */}
      {showRequisitionDetails && selectedRequisition && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto z-[1001]">
            <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedRequisition.mode === 'Repair' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                  >
                    {selectedRequisition.mode === 'Repair' ? <Wrench size={20} /> : <Drill size={20} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Requisition Details</h3>
                    <p className="text-cyan-100">
                      {selectedRequisition.id} - {selectedRequisition.mode} Mode
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('PDF download functionality would be implemented here')}
                    className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors font-medium"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setShowRequisitionDetails(false)}
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Requisition Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg font-bold text-blue-800 mb-4">Requisition Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <span className="text-blue-600 text-sm font-medium">Requisition Date</span>
                    <p className="text-lg font-bold text-blue-700">
                      {new Date(selectedRequisition.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <span className="text-blue-600 text-sm font-medium">Mode</span>
                    <p className="text-lg font-bold text-blue-700">{selectedRequisition.mode}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <span className="text-blue-600 text-sm font-medium">Status</span>
                    <p className="text-lg font-bold text-blue-700">{selectedRequisition.status}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <span className="text-blue-600 text-sm font-medium">Estimated Amount</span>
                    <p className="text-lg font-bold text-blue-700">₹{selectedRequisition.estimatedAmount?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Estimation Table */}
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-gray-700 to-slate-700 p-4 text-white">
                  <h4 className="text-lg font-bold flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedRequisition.mode === 'Repair' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}
                    >
                      {selectedRequisition.mode === 'Repair' ? <Wrench size={16} /> : <Drill size={16} />}
                    </div>
                    {selectedRequisition.mode} Estimation Details
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">S.No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Rate (Rs.)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Qty.</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(selectedRequisition.mode === 'Repair' ? repairItems : reboreItems).map((item, index) => (
                        <tr
                          key={index}
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-200`}
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-blue-600">{item.sno}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 max-w-md">{item.item}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.unit}</td>
                          <td className="px-4 py-3 text-sm text-emerald-600 font-semibold">{item.rate ? `₹${item.rate.toLocaleString()}` : ''}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.qty}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 font-semibold">{item.amount ? `₹${item.amount.toLocaleString()}` : ''}</td>
                        </tr>
                      ))}

                      {/* Total Calculations */}
                      {(() => {
                        const calculations = calculateTotal(selectedRequisition.mode === 'Repair' ? repairItems : reboreItems);
                        return (
                          <>
                            <tr className="bg-blue-50 font-semibold">
                              <td className="px-4 py-3 text-sm text-blue-700">{selectedRequisition.mode === 'Repair' ? '11' : '7'}</td>
                              <td className="px-4 py-3 text-sm text-blue-800">Total</td>
                              <td colSpan={3} className="px-4 py-3"></td>
                              <td className="px-4 py-3 text-base text-blue-700">₹{calculations.total.toLocaleString()}</td>
                            </tr>

                            <tr className="bg-indigo-50 font-semibold">
                              <td className="px-4 py-3 text-sm text-indigo-700">{selectedRequisition.mode === 'Repair' ? '12' : '8'}</td>
                              <td className="px-4 py-3 text-sm text-indigo-800">GST (18%)</td>
                              <td colSpan={3} className="px-4 py-3"></td>
                              <td className="px-4 py-3 text-base text-indigo-700">₹{calculations.gst.toLocaleString()}</td>
                            </tr>

                            <tr className="bg-teal-50 font-semibold">
                              <td className="px-4 py-3 text-sm text-teal-700">{selectedRequisition.mode === 'Repair' ? '13' : '9'}</td>
                              <td className="px-4 py-3 text-sm text-teal-800">Total (including GST)</td>
                              <td colSpan={3} className="px-4 py-3"></td>
                              <td className="px-4 py-3 text-base text-teal-700">₹{calculations.totalWithGST.toLocaleString()}</td>
                            </tr>

                            <tr className="bg-cyan-50 font-semibold">
                              <td className="px-4 py-3 text-sm text-cyan-700">{selectedRequisition.mode === 'Repair' ? '14' : '10'}</td>
                              <td className="px-4 py-3 text-sm text-cyan-800">1% Consulting Engineer Fee</td>
                              <td colSpan={3} className="px-4 py-3"></td>
                              <td className="px-4 py-3 text-base text-cyan-700">₹{calculations.consultingFee.toLocaleString()}</td>
                            </tr>

                            <tr className="bg-green-100 font-bold text-lg border-t-2 border-green-300">
                              <td className="px-4 py-4 text-green-700">{selectedRequisition.mode === 'Repair' ? '15' : '11'}</td>
                              <td className="px-4 py-4 text-green-800 flex items-center gap-2">
                                <TrendingUp size={20} />
                                Grand Total
                              </td>
                              <td colSpan={3} className="px-4 py-4"></td>
                              <td className="px-4 py-4 text-xl text-green-700">₹{calculations.grandTotal.toLocaleString()}</td>
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Amount Comparison if completed */}
              {selectedRequisition.status === 'Completed' && selectedRequisition.actualAmount > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                  <h4 className="text-lg font-bold text-amber-800 mb-4">Amount Comparison</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <span className="text-amber-600 text-sm font-medium">Estimated Amount</span>
                      <p className="text-2xl font-bold text-amber-700">₹{selectedRequisition.estimatedAmount?.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <span className="text-amber-600 text-sm font-medium">Actual Amount</span>
                      <p className="text-2xl font-bold text-amber-700">₹{selectedRequisition.actualAmount?.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <span className="text-amber-600 text-sm font-medium">Variance</span>
                      <p
                        className={`text-xl font-bold ${
                          selectedRequisition.actualAmount - selectedRequisition.estimatedAmount > 0 ? 'text-red-700' : 'text-green-700'
                        }`}
                      >
                        {(selectedRequisition.actualAmount - selectedRequisition.estimatedAmount) > 0 ? '+' : ''}
                        ₹{(selectedRequisition.actualAmount - selectedRequisition.estimatedAmount)?.toLocaleString()}
                      </p>
                    </div>
                  </div>
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