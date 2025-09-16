import React, { useState } from 'react';
import { Filter, Search, Plus, Eye, Calendar, FileText, Wrench, Drill, X, Upload, Trash2, Edit3, Check, Calculator, MapPin } from 'lucide-react';

const CreateEstimationScreen = () => {
  const [filterMode, setFilterMode] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    unit: '',
    rate: '',
    quantity: 1,
    source: 'CPWD-SOR',
    quotationFile: null
  });
  const [addedItems, setAddedItems] = useState([]);
  const [selectedPreDefinedItems, setSelectedPreDefinedItems] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [estimationId, setEstimationId] = useState('');
  const [savedEstimationData, setSavedEstimationData] = useState(null);
  
  // Sample data for requisitions that need estimation
  const requisitions = [
    {
      id: 'REQ005',
      handpumpId: 'HP005',
      gramPanchayat: 'Saraswati GP',
      village: 'Rampur',
      mode: 'Repair',
      date: '2024-03-19',
      status: 'Pending Estimation'
    },
    {
      id: 'REQ006',
      handpumpId: 'HP006',
      gramPanchayat: 'Ganga GP',
      village: 'Shivpur',
      mode: 'Rebore',
      date: '2024-03-20',
      status: 'Pending Estimation'
    },
    {
      id: 'REQ007',
      handpumpId: 'HP007',
      gramPanchayat: 'Yamuna GP',
      village: 'Krishnapur',
      mode: 'Repair',
      date: '2024-03-21',
      status: 'Pending Estimation'
    },
    {
      id: 'REQ008',
      handpumpId: 'HP008',
      gramPanchayat: 'Kaveri GP',
      village: 'Govindpur',
      mode: 'Rebore',
      date: '2024-03-22',
      status: 'Pending Estimation'
    }
  ];

  const repairItems = [
    { id: 1, name: 'Chain(25.4mm pitch roller chain with 7links)', unit: 'Nos', rate: 120, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 2, name: 'Axle', unit: 'Nos', rate: 80, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 3, name: 'Plunger', unit: 'Nos', rate: 250, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 4, name: 'Check Valve', unit: 'Nos', rate: 125, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 5, name: 'Cylinder Casing', unit: 'Nos', rate: 220, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 6, name: 'Nutbolt', unit: 'Nos', rate: 15, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 7, name: 'Handle Complete Set', unit: 'Nos', rate: 2200, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 8, name: 'Pipe', unit: 'Nos', rate: 750, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 9, name: 'Bearing', unit: 'Nos', rate: 60, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 10, name: 'Plunger Rod', unit: 'Nos', rate: 220, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 11, name: 'Socket(same as number of pipes)', unit: 'Nos', rate: 50, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 12, name: 'Thread', unit: 'Nos', rate: 25, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 13, name: 'Washer set', unit: 'Nos', rate: 80, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 14, name: 'Cylinder', unit: 'Nos', rate: 925, l: '', b: '', h: '', qty: 1, source: 'CPWD-SOR' }
  ];

  const reboreItems = [
    { id: 1, name: 'Transportation of handpump material and T&P etc From market to the work site Including loading unloading and proper stacking at site work also including return cartage of unused material and T&P complete.', unit: 'Job', rate: 1706.46, l: '1', b: '1', h: '1', qty: 1, source: 'CPWD-SOR' },
    { id: 2, name: 'Dismantling of old PCC Platform Handpump machine GI pipe, Connecting rod and cylinder Including all labour T & P Complete', unit: 'Job', rate: 1984.15, l: '1', b: '1', h: '1', qty: 1, source: 'CPWD-SOR' },
    { id: 3, name: 'Cost of essential material for INDIA MARK- II handpump installation work', unit: '', rate: 0.00, l: '', b: '', h: '', qty: 0, source: 'CPWD-SOR', isHeader: true },
    { id: 4, name: 'A. P.V.C PIPE(6KG/SQCM) 110 mm dia', unit: 'Rm', rate: 328.88, l: '1', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 5, name: 'B. P.V.C PIPE(6KG/SQCM) 63 mm dia', unit: 'Rm', rate: 124.11, l: '1', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 6, name: 'C. 63 mm nominal dia strainer or blind pipe', unit: 'Rm', rate: 651.56, l: '1', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 7, name: 'D.REDUCER (110 TO 63 MM)', unit: 'set', rate: 183.06, l: '1', b: '1', h: '1', qty: 1, source: 'CPWD-SOR' },
    { id: 8, name: 'E. G.I.PIPE 32 MM dia medium quality(riser)', unit: 'Rm', rate: 341.29, l: '1', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 9, name: 'F. Spare parts', unit: 'Job', rate: 2714.82, l: '1', b: '1', h: '1', qty: 1, source: 'CPWD-SOR' },
    { id: 10, name: 'Rent of equipment/plant and work of digging pit, erecting tripod etc. for drilling work by casing method or pump and pressure method', unit: 'Job', rate: 798.93, l: '1', b: '1', h: '1', qty: 1, source: 'CPWD-SOR' },
    { id: 11, name: 'Drilling work 150 mm dia in hard and conker mix soil by (pump and pressure method OR casing while drilling method)', unit: '', rate: 0.00, l: '', b: '', h: '', qty: 0, source: 'CPWD-SOR', isHeader: true },
    { id: 12, name: 'A. 0 -15m', unit: 'Rm', rate: 511.94, l: '1', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 13, name: 'B. 15-30m', unit: 'Rm', rate: 511.94, l: '1', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 14, name: 'C. 30-45m', unit: 'Rm', rate: 589.50, l: '1', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 15, name: 'D. 45-65m', unit: 'Rm', rate: 899.77, l: '1', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 16, name: 'P.V.C. pipe assembly(110/63mm),blind pipe,strainer(63mm) should be lowered in the bore hole', unit: '', rate: 0.00, l: '', b: '', h: '', qty: 0, source: 'CPWD-SOR', isHeader: true },
    { id: 17, name: 'A. 0.00-30m', unit: 'Rm', rate: 18.62, l: '1', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 18, name: 'B. 30-45m', unit: 'Rm', rate: 19.39, l: '1', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 19, name: 'C. 45-65m', unit: 'Rm', rate: 20.20, l: '1', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 20, name: 'A supply/Pouring of course sand around strainer in drilling i/c all', unit: 'Job', rate: 806.69, l: '1', b: '1', h: '1', qty: 1, source: 'CPWD-SOR' },
    { id: 21, name: 'Filling of bentonite between borehole and casing pipe', unit: 'Job', rate: 387.83, l: '1', b: '1', h: '1', qty: 1, source: 'CPWD-SOR' },
    { id: 22, name: 'Installation of GI pipe of India Mark - II handpump or connecting rod', unit: 'Job', rate: 971.13, l: '1', b: '1', h: '1', qty: 1, source: 'CPWD-SOR' },
    { id: 23, name: 'Disinfection by chlorination after installation and Development of handpump india mark-2 including with riser', unit: 'Job', rate: 232.70, l: '1', b: '1', h: '1', qty: 1, source: 'CPWD-SOR' },
    { id: 24, name: 'Making handpump platform 1.85 dia', unit: 'Job', rate: 8997.70, l: '1', b: '1', h: '1', qty: 1, source: 'CPWD-SOR' },
    { id: 25, name: 'Making drain i/c', unit: 'Rm', rate: 620.53, l: '1', b: '', h: '', qty: 1, source: 'CPWD-SOR' },
    { id: 26, name: 'Embossing and painting work', unit: 'Job', rate: 232.70, l: '1', b: '1', h: '1', qty: 1, source: 'CPWD-SOR' },
    { id: 27, name: 'Water Testing work', unit: 'Job', rate: 775.66, l: '1', b: '1', h: '1', qty: 1, source: 'CPWD-SOR' }
  ];

  const filteredRequisitions = filterMode === 'All' ? requisitions : requisitions.filter(req => req.mode === filterMode);

  const handleCreateEstimation = (requisition) => {
    setSelectedRequisition(requisition);
    setShowModal(true);
    setAddedItems([]);
    setSelectedPreDefinedItems({});
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.unit && newItem.rate && newItem.quantity) {
      const item = {
        id: Date.now(),
        name: newItem.name,
        unit: newItem.unit,
        rate: parseFloat(newItem.rate),
        quantity: parseInt(newItem.quantity),
        source: newItem.source,
        amount: parseFloat(newItem.rate) * parseInt(newItem.quantity),
        quotationFile: newItem.quotationFile,
        isCustom: true
      };
      setAddedItems([...addedItems, item]);
      setNewItem({
        name: '',
        unit: '',
        rate: '',
        quantity: 1,
        source: 'CPWD-SOR',
        quotationFile: null
      });
      setShowAddItemModal(false);
    }
  };

  const handleItemSelection = (itemId, checked) => {
    const items = selectedRequisition?.mode === 'Repair' ? repairItems : reboreItems;
    const item = items.find(i => i.id === itemId);
    
    // Don't allow selection of header items
    if (item.isHeader || item.qty === 0) {
      return;
    }
    
    if (checked) {
      setSelectedPreDefinedItems(prev => ({
        ...prev,
        [itemId]: {
          ...item,
          quantity: item.qty || 1,
          l: item.l || '',
          b: item.b || '',
          h: item.h || ''
        }
      }));
    } else {
      setSelectedPreDefinedItems(prev => {
        const newItems = { ...prev };
        delete newItems[itemId];
        return newItems;
      });
    }
  };

  const updatePreDefinedItem = (itemId, field, value) => {
    setSelectedPreDefinedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    
    // Add custom items
    addedItems.forEach(item => {
      total += item.amount;
    });
    
    // Add predefined items
    Object.values(selectedPreDefinedItems).forEach(item => {
      const l = parseFloat(item.l) || 1;
      const b = parseFloat(item.b) || 1;
      const h = parseFloat(item.h) || 1;
      const qty = parseFloat(item.quantity) || 1;
      
      let finalQty = qty;
      
      // For items that have L, B, H dimensions
      if (item.l && item.b && item.h) {
        finalQty = l * b * h * qty;
      } else if (item.l && !item.b && !item.h) {
        finalQty = l * qty;
      }
      
      total += item.rate * finalQty;
    });
    
    const gst = total * 0.18;
    const totalWithGST = total + gst;
    const consultingFeeEstimation = totalWithGST * 0.01;
    const consultingFeeMB = totalWithGST * 0.01;
    const grandTotal = totalWithGST + consultingFeeEstimation + consultingFeeMB;
    
    return { total, gst, totalWithGST, consultingFeeEstimation, consultingFeeMB, grandTotal };
  };

  const handleSaveEstimation = () => {
    // Generate a unique estimation ID
    const randomId = 'EST' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setEstimationId(randomId);
    
    // Save the estimation data before clearing selectedRequisition
    const currentCalculations = calculateTotal();
    setSavedEstimationData({
      requisition: selectedRequisition,
      calculations: currentCalculations,
      estimationId: randomId
    });
    
    // Logic to save the estimation would go here
    
    // Close the main modal and show success modal
    setShowModal(false);
    setSelectedRequisition(null);
    setShowSuccessModal(true);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setEstimationId('');
    setSavedEstimationData(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setNewItem(prev => ({ ...prev, quotationFile: file }));
    } else {
      alert('Please upload a PDF file only');
    }
  };

  const calculations = showModal ? calculateTotal() : { total: 0, gst: 0, totalWithGST: 0, consultingFeeEstimation: 0, consultingFeeMB: 0, grandTotal: 0 };

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
                <Edit3 size={24} />
              </div>
              Create Estimation - Gram Panchayat
            </h1>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                >
                  <option value="All" className="text-gray-800">All Modes</option>
                  <option value="Repair" className="text-gray-800">Repair</option>
                  <option value="Rebore" className="text-gray-800">Rebore</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Search size={18} className="text-white" />
                <input
                  type="text"
                  placeholder="Search by Requisition ID or Handpump ID"
                  className="bg-transparent text-white placeholder-white/70 focus:outline-none w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="group bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending Estimations</p>
                <p className="text-2xl font-bold mt-1">12</p>
                <p className="text-orange-200 text-xs mt-1">Need immediate attention</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Calculator size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Repair Requests</p>
                <p className="text-2xl font-bold mt-1">8</p>
                <p className="text-blue-200 text-xs mt-1">Awaiting estimation</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Wrench size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Rebore Requests</p>
                <p className="text-2xl font-bold mt-1">4</p>
                <p className="text-emerald-200 text-xs mt-1">High priority items</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Drill size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg. Response Time</p>
                <p className="text-2xl font-bold mt-1">2.5 hrs</p>
                <p className="text-purple-200 text-xs mt-1">↓ 30 min this week</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Eye size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Requisitions Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-700 to-slate-700 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText size={20} />
              </div>
              Pending Estimation Requests
            </h2>
            <p className="text-gray-200 mt-2">Create estimations for handpump requisitions</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Requisition ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Handpump ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Gram Panchayat
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Village
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Requisition Mode
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequisitions.map((requisition, index) => (
                  <tr key={requisition.id} className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50 transition-colors duration-300`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                        <span className="text-lg font-semibold text-gray-900">{requisition.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-medium text-slate-700">{requisition.handpumpId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{requisition.gramPanchayat}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-700">{requisition.village}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md ${
                        requisition.mode === 'Repair' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {requisition.mode === 'Repair' ? <Wrench size={14} /> : <Drill size={14} />}
                        {requisition.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(requisition.date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleCreateEstimation(requisition)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-semibold rounded-lg hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <Plus size={16} />
                        Create Estimation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Creating Estimation */}
        {showModal && selectedRequisition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-700 to-blue-800 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedRequisition.mode === 'Repair' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}>
                        {selectedRequisition.mode === 'Repair' ? <Wrench size={20} /> : <Drill size={20} />}
                      </div>
                      Create {selectedRequisition.mode} Estimation
                    </h3>
                    <p className="text-blue-100 mt-1">
                      {selectedRequisition.id} - {selectedRequisition.handpumpId} | {selectedRequisition.gramPanchayat}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-red-300 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {/* Add Custom Item Button */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowAddItemModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-md transition-all duration-300"
                  >
                    <Plus size={18} />
                    Add Custom Item
                  </button>
                </div>

                {/* Pre-defined Items Selection in Table Format */}
                <div className="mb-8">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Select Pre-defined Items
                  </h4>
                  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-700 to-blue-800 text-white sticky top-0 z-10">
                          <tr>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">Select</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">S.no</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase min-w-[300px]">Item</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">Unit</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">Rate (₹)</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">Reference/Source</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">L</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">B</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">H</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">Qty.</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(selectedRequisition.mode === 'Repair' ? repairItems : reboreItems).map((item, index) => {
                            const isSelected = !!selectedPreDefinedItems[item.id];
                            const selectedItem = selectedPreDefinedItems[item.id];
                            const isHeaderItem = item.isHeader || item.qty === 0;
                            
                            let calculatedAmount = 0;
                            if (isSelected && !isHeaderItem) {
                              const l = parseFloat(selectedItem.l) || 1;
                              const b = parseFloat(selectedItem.b) || 1;
                              const h = parseFloat(selectedItem.h) || 1;
                              const qty = parseFloat(selectedItem.quantity) || 1;
                              
                              let finalQty = qty;
                              if (selectedItem.l && selectedItem.b && selectedItem.h) {
                                finalQty = l * b * h * qty;
                              } else if (selectedItem.l && !selectedItem.b && !selectedItem.h) {
                                finalQty = l * qty;
                              }
                              calculatedAmount = item.rate * finalQty;
                            }
                            
                            return (
                              <tr key={item.id} className={`${
                                isHeaderItem 
                                  ? 'bg-gray-100 font-semibold' 
                                  : isSelected 
                                    ? 'bg-blue-50' 
                                    : 'hover:bg-gray-50'
                              } transition-colors`}>
                                <td className="px-3 py-3">
                                  {!isHeaderItem ? (
                                    <input
                                      type="checkbox"
                                      id={`item-${item.id}`}
                                      checked={isSelected}
                                      onChange={(e) => handleItemSelection(item.id, e.target.checked)}
                                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-sm font-semibold text-gray-700">{index + 1}</td>
                                <td className="px-3 py-3 text-xs max-w-xs">
                                  <div className={`break-words ${isHeaderItem ? 'text-gray-700 font-semibold' : 'text-gray-800'}`}>
                                    {item.name}
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-700">{item.unit || '-'}</td>
                                <td className="px-3 py-3 text-sm font-semibold">
                                  {item.rate > 0 ? (
                                    <span className="text-emerald-600">₹{item.rate.toLocaleString()}</span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-xs text-gray-600">{item.source}</td>
                                
                                {/* L Column */}
                                <td className="px-3 py-3">
                                  {!isHeaderItem && isSelected ? (
                                    <input
                                      type="text"
                                      value={selectedItem.l}
                                      onChange={(e) => updatePreDefinedItem(item.id, 'l', e.target.value)}
                                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                      disabled={!item.l}
                                      placeholder={item.l || '-'}
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-500">{item.l || '-'}</span>
                                  )}
                                </td>
                                
                                {/* B Column */}
                                <td className="px-3 py-3">
                                  {!isHeaderItem && isSelected ? (
                                    <input
                                      type="text"
                                      value={selectedItem.b}
                                      onChange={(e) => updatePreDefinedItem(item.id, 'b', e.target.value)}
                                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                      disabled={!item.b}
                                      placeholder={item.b || '-'}
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-500">{item.b || '-'}</span>
                                  )}
                                </td>
                                
                                {/* H Column */}
                                <td className="px-3 py-3">
                                  {!isHeaderItem && isSelected ? (
                                    <input
                                      type="text"
                                      value={selectedItem.h}
                                      onChange={(e) => updatePreDefinedItem(item.id, 'h', e.target.value)}
                                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                      disabled={!item.h}
                                      placeholder={item.h || '-'}
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-500">{item.h || '-'}</span>
                                  )}
                                </td>
                                
                                {/* Qty Column */}
                                <td className="px-3 py-3">
                                  {!isHeaderItem && isSelected ? (
                                    <input
                                      type="number"
                                      value={selectedItem.quantity}
                                      onChange={(e) => updatePreDefinedItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                      min="1"
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-500">{item.qty || '-'}</span>
                                  )}
                                </td>
                                
                                {/* Amount Column */}
                                <td className="px-3 py-3 text-sm font-semibold text-slate-700">
                                  {!isHeaderItem && isSelected ? `₹${calculatedAmount.toLocaleString()}` : '-'}
                                </td>
                              </tr>
                            );
                          })}
                          
                          {/* Add Items Row */}
                          <tr className="bg-gray-100">
                            <td colSpan="10" className="px-3 py-2 text-sm font-semibold text-gray-700">Add Items</td>
                            <td className="px-3 py-2"></td>
                          </tr>
                          
                          {/* Total Calculation Rows */}
                          <tr className="bg-blue-50 font-semibold">
                            <td colSpan="10" className="px-3 py-2 text-sm text-blue-800">Total</td>
                            <td className="px-3 py-2 text-sm text-blue-700">₹{calculations.total.toLocaleString()}</td>
                          </tr>
                          
                          <tr className="bg-indigo-50 font-semibold">
                            <td colSpan="10" className="px-3 py-2 text-sm text-indigo-800">GST (18%)</td>
                            <td className="px-3 py-2 text-sm text-indigo-700">₹{calculations.gst.toLocaleString()}</td>
                          </tr>
                          
                          <tr className="bg-teal-50 font-semibold">
                            <td colSpan="10" className="px-3 py-2 text-sm text-teal-800">Total (including GST)</td>
                            <td className="px-3 py-2 text-sm text-teal-700">₹{calculations.totalWithGST.toLocaleString()}</td>
                          </tr>
                          
                          <tr className="bg-cyan-50 font-semibold">
                            <td colSpan="10" className="px-3 py-2 text-sm text-cyan-800">1% Consulting Engineer Fee for Estimation</td>
                            <td className="px-3 py-2 text-sm text-cyan-700">₹{calculations.consultingFeeEstimation.toLocaleString()}</td>
                          </tr>
                          
                          <tr className="bg-emerald-50 font-semibold">
                            <td colSpan="10" className="px-3 py-2 text-sm text-emerald-800">1% Consulting Engineer Fee for MB</td>
                            <td className="px-3 py-2 text-sm text-emerald-700">₹{calculations.consultingFeeMB.toLocaleString()}</td>
                          </tr>
                          
                          <tr className="bg-green-100 font-bold text-base border-t-2 border-green-300">
                            <td colSpan="10" className="px-3 py-3 text-green-800">Grand Total</td>
                            <td className="px-3 py-3 text-lg text-green-700">₹{calculations.grandTotal.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Added Custom Items Summary */}
                {addedItems.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Calculator size={20} />
                      Custom Added Items
                    </h4>
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-purple-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Sr. No</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Item</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Unit</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Rate (₹)</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Amount (₹)</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Source</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {addedItems.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-semibold text-purple-600">{index + 1}</td>
                              <td className="px-4 py-3 text-sm text-gray-800">{item.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{item.unit}</td>
                              <td className="px-4 py-3 text-sm text-emerald-600 font-semibold">₹{item.rate.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-slate-700 font-semibold">₹{item.amount.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                  item.source === 'Market Rate' ? 'bg-orange-100 text-orange-800' :
                                  item.source === 'CPWD-SOR' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {item.source}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => setAddedItems(addedItems.filter(i => i.id !== item.id))}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEstimation}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-md font-medium flex items-center gap-2"
                    disabled={Object.keys(selectedPreDefinedItems).length === 0 && addedItems.length === 0}
                  >
                    <Check size={18} />
                    Save Estimation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddItemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-bold">Add Custom Item</h4>
                  <button
                    onClick={() => setShowAddItemModal(false)}
                    className="text-white hover:text-red-300 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter item name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <input
                        type="text"
                        value={newItem.unit}
                        onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., Nos, Rm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
                      <input
                        type="number"
                        value={newItem.rate}
                        onChange={(e) => setNewItem(prev => ({ ...prev, rate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="1"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Source</label>
                    <select
                      value={newItem.source}
                      onChange={(e) => setNewItem(prev => ({ ...prev, source: e.target.value, quotationFile: e.target.value !== 'Market Rate' ? null : prev.quotationFile }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="CPWD-SOR">CPWD-SOR</option>
                      <option value="UPPWD-Circle Rates">UPPWD-Circle Rates</option>
                      <option value="Market Rate">Market Rate</option>
                    </select>
                  </div>
                  
                  {newItem.source === 'Market Rate' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Quotation (PDF)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="quotation-file"
                        />
                        <label
                          htmlFor="quotation-file"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Upload size={16} />
                          {newItem.quotationFile ? newItem.quotationFile.name : 'Choose PDF file'}
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowAddItemModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md flex items-center gap-2"
                    disabled={!newItem.name || !newItem.unit || !newItem.rate || !newItem.quantity || (newItem.source === 'Market Rate' && !newItem.quotationFile)}
                  >
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white rounded-t-2xl text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Check size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Success!</h3>
                <p className="text-emerald-100">Estimation created successfully</p>
              </div>
              
              <div className="p-8 text-center space-y-6">
                <div className="bg-emerald-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Thank you! Your estimation has been successfully saved for the selected handpump <span className="font-semibold">{savedEstimationData?.requisition?.handpumpId || 'HP005'}</span> and has been shared with the respective authorities and Consulting Engineers (CE).
                  </p>
                 
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Estimation ID</p>
                  <p className="text-xl font-bold text-blue-600">{savedEstimationData?.estimationId || estimationId}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Requisition:</span>
                      <span className="ml-2 font-semibold">{savedEstimationData?.requisition?.id || 'REQ005'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Handpump:</span>
                      <span className="ml-2 font-semibold">{savedEstimationData?.requisition?.handpumpId || 'HP005'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mode:</span>
                      <span className="ml-2 font-semibold">{savedEstimationData?.requisition?.mode || 'Repair'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="ml-2 font-semibold text-emerald-600">₹{(savedEstimationData?.calculations?.grandTotal || 25000).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={closeSuccessModal}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg"
                >
                  Continue to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEstimationScreen;