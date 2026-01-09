import React, { useState, useEffect } from 'react';
import { Filter, Search, Plus, Eye, Calendar, FileText, Wrench, Drill, X, Trash2, Edit3, Check, Calculator, MapPin } from 'lucide-react';
import { useUserInfo } from '../utils/userInfo';

const CreateEstimationScreen = () => {
  const { userId } = useUserInfo();
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
  length: '',
  width: '',
  height: ''
});
  const [addedItems, setAddedItems] = useState([]);
  const [selectedPreDefinedItems, setSelectedPreDefinedItems] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [estimationId, setEstimationId] = useState('');
  const [savedEstimationData, setSavedEstimationData] = useState(null);
  
  // API data states
  const [requisitions, setRequisitions] = useState([]);
  const [repairItems, setRepairItems] = useState([]);
  const [reboreItems, setReboreItems] = useState([]);
  const [gstDetails, setGstDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE = 'https://hmsapi.kdsgroup.co.in/api';
  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

  // Fetch all data on component mount
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const authToken = getAuthToken();
        
        if (!authToken) {
          throw new Error('Authentication token not found. Please login again.');
        }

        // Fetch requisitions
        const reqResponse = await fetch(
          `${API_BASE}/HandpumpRequisition/GetRequisitionListByUserId?UserId=${userId}`,
          {
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        const reqData = await reqResponse.json();

        // Fetch repair estimation items
        const repairResponse = await fetch(
          `${API_BASE}/Master/GetRepairEstimation`,
          {
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        const repairData = await repairResponse.json();

        // Fetch rebore estimation items
        const reboreResponse = await fetch(
          `${API_BASE}/Master/GetReboreEstimation`,
          {
            headers: {
              'accept': '*/*'
            }
          }
        );
        const reboreData = await reboreResponse.json();

        // Fetch GST details
        const gstResponse = await fetch(
          `${API_BASE}/Master/GstActiveDetails`,
          {
            headers: {
              'accept': '*/*'
            }
          }
        );
        const gstData = await gstResponse.json();

        // Process requisitions - filter only pending ones (RequisitionStatus = 1) and no OrderId
const processedRequisitions = reqData.Data
  .filter(req => req.RequisitionStatus === 1 && req.OrderId === null)
  .map(req => ({
            id: req.RequisitionId.toString(),
            handpumpId: req.HandpumpId,
            gramPanchayat: req.GrampanchayatName,
            village: req.VillageName,
            mode: req.RequisitionType,
            date: req.RequisitionDate,
            status: 'Pending Estimation',
            requisitionData: req
          }));

        // Process repair items
        const processedRepairItems = repairData.Data.map(item => ({
          id: item.Id,
          name: item.ItemName,
          unit: item.Unit || '',
          rate: item.Rate,
          qty: item.Quantity,
          source: item.Source || 'CPWD-SOR',
          l: item.Length?.toString() || '',
          b: item.Width?.toString() || '',
          h: item.Height?.toString() || '',
          amount: item.Amount,
          isHeader: item.Quantity === 0 && item.Rate === 0
        }));

        // Process rebore items
        const processedReboreItems = reboreData.Data.map(item => ({
          id: item.Id,
          name: item.ItemName,
          unit: item.Unit || '',
          rate: item.Rate,
          qty: item.Quantity,
          source: item.Source || 'CPWD-SOR',
          l: item.Length?.toString() || '',
          b: item.Width?.toString() || '',
          h: item.Height?.toString() || '',
          amount: item.Amount,
          isHeader: item.Quantity === 0 && item.Rate === 0
        }));

        setRequisitions(processedRequisitions);
        setRepairItems(processedRepairItems);
        setReboreItems(processedReboreItems);
        setGstDetails(gstData.Data[0]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const filteredRequisitions = requisitions.filter(req => {
    const modeMatch = filterMode === 'All' || req.mode.toUpperCase() === filterMode.toUpperCase();
    const searchMatch = searchQuery === '' || 
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.handpumpId.toLowerCase().includes(searchQuery.toLowerCase());
    return modeMatch && searchMatch;
  });

  const handleCreateEstimation = (requisition) => {
    setSelectedRequisition(requisition);
    setShowModal(true);
    setAddedItems([]);
    setSelectedPreDefinedItems({});
  };

  const handleAddItem = async () => {
  if (newItem.name && newItem.unit && newItem.rate && newItem.quantity) {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const amount = parseFloat(newItem.rate) * parseInt(newItem.quantity);
      
      const requestBody = {
        ItemName: newItem.name,
        Unit: newItem.unit,
        Quantity: parseInt(newItem.quantity),
        Rate: parseFloat(newItem.rate),
        Amount: amount,
        UpdatedBy: userId,
        Source: newItem.source,
        Length: parseFloat(newItem.length) || 0,
        Width: parseFloat(newItem.width) || 0,
        Height: parseFloat(newItem.height) || 0
      };

      const endpoint = selectedRequisition.mode.toUpperCase() === 'REPAIR' 
        ? `${API_BASE}/Master/InsertRepairEstimateItems`
        : `${API_BASE}/Master/InsertReborEstimateItems`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // Refresh the items list after successful addition
        if (selectedRequisition.mode.toUpperCase() === 'REPAIR') {
          const repairResponse = await fetch(
            `${API_BASE}/Master/GetRepairEstimation`,
            {
              headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${authToken}`
              }
            }
          );
          const repairData = await repairResponse.json();
          const processedRepairItems = repairData.Data.map(item => ({
            id: item.Id,
            name: item.ItemName,
            unit: item.Unit || '',
            rate: item.Rate,
            qty: item.Quantity,
            source: item.Source || 'CPWD-SOR',
            l: item.Length?.toString() || '',
            b: item.Width?.toString() || '',
            h: item.Height?.toString() || '',
            amount: item.Amount,
            isHeader: item.Quantity === 0 && item.Rate === 0
          }));
          setRepairItems(processedRepairItems);
        } else {
          const reboreResponse = await fetch(
            `${API_BASE}/Master/GetReboreEstimation`,
            {
              headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${authToken}`
              }
            }
          );
          const reboreData = await reboreResponse.json();
          const processedReboreItems = reboreData.Data.map(item => ({
            id: item.Id,
            name: item.ItemName,
            unit: item.Unit || '',
            rate: item.Rate,
            qty: item.Quantity,
            source: item.Source || 'CPWD-SOR',
            l: item.Length?.toString() || '',
            b: item.Width?.toString() || '',
            h: item.Height?.toString() || '',
            amount: item.Amount,
            isHeader: item.Quantity === 0 && item.Rate === 0
          }));
          setReboreItems(processedReboreItems);
        }

        // Reset form
        setNewItem({
          name: '',
          unit: '',
          rate: '',
          quantity: 1,
          source: 'CPWD-SOR',
          length: '',
          width: '',
          height: '',
          quotationFile: null
        });
        setShowAddItemModal(false);
        
        alert('Item added successfully!');
      } else {
        alert('Failed to add item. Please try again.');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    }
  }
};

  const handleItemSelection = (itemId, checked) => {
    const items = selectedRequisition?.mode.toUpperCase() === 'REPAIR' ? repairItems : reboreItems;
    const item = items.find(i => i.id === itemId);
    
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
  
  // Add all selected items (including custom ones)
  Object.values(selectedPreDefinedItems).forEach(item => {
    const qty = parseFloat(item.quantity) || 1;
    total += item.rate * qty;
  });
    
    const gstRate = gstDetails ? (gstDetails.Igst / 100) : 0.18;
    const gst = total * gstRate;
    const totalWithGST = total + gst;
    const consultingFeeEstimation = totalWithGST * 0.01;
    const consultingFeeMB = totalWithGST * 0.01;
    const grandTotal = totalWithGST + consultingFeeEstimation + consultingFeeMB;
    
    return { total, gst, totalWithGST, consultingFeeEstimation, consultingFeeMB, grandTotal };
  };

  const handleSaveEstimation = async () => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        alert('Authentication token not found. Please login again.');
        return;
      }
      
      const calculations = calculateTotal();
      
      // Prepare items array
      const items = [];
      
      // Add predefined items
Object.entries(selectedPreDefinedItems).forEach(([itemId, item]) => {
  const qty = parseFloat(item.quantity) || 1;
  
  items.push({
    ItemId: parseInt(itemId),
    Quantity: qty,
    Amount: item.rate * qty
  });
});

      // Prepare request body
      const requestBody = {
        UserId: userId,
        RequisitionId: parseInt(selectedRequisition.id),
        GstId: gstDetails?.Id || 4,
        OrderDesc: `Estimation for ${selectedRequisition.mode} - ${selectedRequisition.handpumpId}`,
        SubTotal: calculations.total,
        EstimationConsultingFee: calculations.consultingFeeEstimation,
        MbConsultingFee: calculations.consultingFeeMB,
        GstFee: calculations.gst,
        GrandTotal: calculations.grandTotal,
        UpdatedDate: new Date().toISOString(),
        UpdatedBy: userId,
        Items: items
      };

      const response = await fetch(
        `${API_BASE}/HandpumpRequisition/InsertRequisitionEstimation`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (response.ok) {
        const randomId = 'EST' + Math.random().toString(36).substr(2, 6).toUpperCase();
        setEstimationId(randomId);
        
        setSavedEstimationData({
          requisition: selectedRequisition,
          calculations: calculations,
          estimationId: randomId
        });
        
        setShowModal(false);
        setSelectedRequisition(null);
        setShowSuccessModal(true);

        // Refresh requisitions list
        const reqResponse = await fetch(
          `${API_BASE}/HandpumpRequisition/GetRequisitionListByUserId?UserId=${userId}`,
          {
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        const reqData = await reqResponse.json();
        const processedRequisitions = reqData.Data
  .filter(req => req.RequisitionStatus === 1 && req.OrderId === null)
  .map(req => ({
            id: req.RequisitionId.toString(),
            handpumpId: req.HandpumpId,
            gramPanchayat: req.GrampanchayatName,
            village: req.VillageName,
            mode: req.RequisitionType,
            date: req.RequisitionDate,
            status: 'Pending Estimation',
            requisitionData: req
          }));
        setRequisitions(processedRequisitions);
      }
    } catch (error) {
      console.error('Error saving estimation:', error);
      alert('Failed to save estimation. Please try again.');
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setEstimationId('');
    setSavedEstimationData(null);
  };

  

  const calculations = showModal ? calculateTotal() : { total: 0, gst: 0, totalWithGST: 0, consultingFeeEstimation: 0, consultingFeeMB: 0, grandTotal: 0 };

  const repairCount = requisitions.filter(r => r.mode.toUpperCase() === 'REPAIR').length;
  const reboreCount = requisitions.filter(r => r.mode.toUpperCase() === 'REBORE').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading estimation data...</p>
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
                <Edit3 size={24} />
              </div>
              Create Estimation - Consulting Engineer
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
                  <option value="REPAIR" className="text-gray-800">Repair</option>
                  <option value="REBORE" className="text-gray-800">Rebore</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Search size={18} className="text-white" />
                <input
                  type="text"
                  placeholder="Search by Requisition ID or Handpump ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                <p className="text-2xl font-bold mt-1">{requisitions.length}</p>
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
                <p className="text-2xl font-bold mt-1">{repairCount}</p>
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
                <p className="text-2xl font-bold mt-1">{reboreCount}</p>
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
                <p className="text-purple-100 text-sm font-medium">GST Rate</p>
                <p className="text-2xl font-bold mt-1">{gstDetails?.Igst || 18}%</p>
                <p className="text-purple-200 text-xs mt-1">{gstDetails?.Description || 'Standard GST'}</p>
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
                {filteredRequisitions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FileText size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-600 text-lg">No pending estimations found</p>
                        <p className="text-gray-400 text-sm mt-2">All requisitions have been processed</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequisitions.map((requisition, index) => (
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
                          requisition.mode.toUpperCase() === 'REPAIR' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {requisition.mode.toUpperCase() === 'REPAIR' ? <Wrench size={14} /> : <Drill size={14} />}
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
                  ))
                )}
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
                        selectedRequisition.mode.toUpperCase() === 'REPAIR' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}>
                        {selectedRequisition.mode.toUpperCase() === 'REPAIR' ? <Wrench size={20} /> : <Drill size={20} />}
                      </div>
                      Create {selectedRequisition.mode} Estimation
                    </h3>
                    <p className="text-blue-100 mt-1">
                      REQ{selectedRequisition.id} - {selectedRequisition.handpumpId} | {selectedRequisition.gramPanchayat}
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
  onClick={() => {
    setShowAddItemModal(true);
    setNewItem({
      name: '',
      unit: '',
      rate: '',
      quantity: 1,
      source: 'CPWD-SOR',
      length: '',
      width: '',
      height: ''
    });
  }}
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
  Select Pre-defined Items <span className="text-red-500">*</span>
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
                          {(selectedRequisition.mode.toUpperCase() === 'REPAIR' ? repairItems : reboreItems).map((item, index) => {
                            const isSelected = !!selectedPreDefinedItems[item.id];
                            const selectedItem = selectedPreDefinedItems[item.id];
                            const isHeaderItem = item.isHeader || item.qty === 0;
                            
                            let calculatedAmount = 0;
if (isSelected && !isHeaderItem) {
  const qty = parseFloat(selectedItem.quantity) || 1;
  calculatedAmount = item.rate * qty;
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
    {item.isCustom && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Custom</span>}
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
  type="number"
  value={selectedItem.l}
  onChange={(e) => {
    const value = parseFloat(e.target.value);
    if (e.target.value === '' || (value >= 0 && value <= 100)) {
      updatePreDefinedItem(item.id, 'l', e.target.value);
    }
  }}
  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
  disabled={!item.l}
  placeholder={item.l || '-'}
  step="0.01"
  max="100"
/>
                                  ) : (
                                    <span className="text-xs text-gray-500">{item.l || '-'}</span>
                                  )}
                                </td>
                                
                                {/* B Column */}
                                <td className="px-3 py-3">
                                  {!isHeaderItem && isSelected ? (
                                    <input
  type="number"
  value={selectedItem.b}
  onChange={(e) => {
    const value = parseFloat(e.target.value);
    if (e.target.value === '' || (value >= 0 && value <= 100)) {
      updatePreDefinedItem(item.id, 'b', e.target.value);
    }
  }}
  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
  disabled={!item.b}
  placeholder={item.b || '-'}
  step="0.01"
  max="100"
/>
                                  ) : (
                                    <span className="text-xs text-gray-500">{item.b || '-'}</span>
                                  )}
                                </td>
                                
                                {/* H Column */}
                                <td className="px-3 py-3">
                                  {!isHeaderItem && isSelected ? (
                                    <input
  type="number"
  value={selectedItem.h}
  onChange={(e) => {
    const value = parseFloat(e.target.value);
    if (e.target.value === '' || (value >= 0 && value <= 100)) {
      updatePreDefinedItem(item.id, 'h', e.target.value);
    }
  }}
  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
  disabled={!item.h}
  placeholder={item.h || '-'}
  step="0.01"
  max="100"
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
  onChange={(e) => {
    const value = parseInt(e.target.value);
    if (e.target.value === '' || (value >= 1 && value <= 100)) {
      updatePreDefinedItem(item.id, 'quantity', parseInt(e.target.value) || 1);
    }
  }}
  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
  min="1"
  max="100"
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
                            <td colSpan="10" className="px-3 py-2 text-sm text-indigo-800">GST ({gstDetails?.Igst || 18}%)</td>
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
                    disabled={Object.keys(selectedPreDefinedItems).length === 0}
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
  onClick={() => {
    setShowAddItemModal(false);
    setNewItem({
      name: '',
      unit: '',
      rate: '',
      quantity: 1,
      source: 'CPWD-SOR',
      length: '',
      width: '',
      height: ''
    });
  }}
  className="text-white hover:text-red-300 transition-colors"
>
  <X size={20} />
</button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name <span className="text-red-500">*</span></label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit <span className="text-red-500">*</span></label>
                      <input
  type="text"
  value={newItem.unit}
  onChange={(e) => {
    if (e.target.value.length <= 100) {
      setNewItem(prev => ({ ...prev, unit: e.target.value }));
    }
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
  placeholder="e.g., Nos, Rm"
  maxLength="100"
/>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹) <span className="text-red-500">*</span></label>
                      <input
  type="number"
  value={newItem.rate}
  onChange={(e) => {
    const value = parseFloat(e.target.value);
    if (e.target.value === '' || (value >= 0 && value <= 10000)) {
      setNewItem(prev => ({ ...prev, rate: e.target.value }));
    }
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
  placeholder="0.00"
  step="0.01"
  max="10000"
/>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity <span className="text-red-500">*</span></label>
                    <input
  type="number"
  value={newItem.quantity}
  onChange={(e) => {
    const value = parseInt(e.target.value);
    if (e.target.value === '' || (value >= 1 && value <= 100)) {
      setNewItem(prev => ({ ...prev, quantity: e.target.value }));
    }
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
  placeholder="1"
  min="1"
  max="100"
/>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                      <input
  type="number"
  value={newItem.length}
  onChange={(e) => {
    const value = parseFloat(e.target.value);
    if (e.target.value === '' || (value >= 0 && value <= 100)) {
      setNewItem(prev => ({ ...prev, length: e.target.value }));
    }
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
  placeholder="0"
  step="0.01"
  max="100"
/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                      <input
  type="number"
  value={newItem.width}
  onChange={(e) => {
    const value = parseFloat(e.target.value);
    if (e.target.value === '' || (value >= 0 && value <= 100)) {
      setNewItem(prev => ({ ...prev, width: e.target.value }));
    }
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
  placeholder="0"
  step="0.01"
  max="100"
/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                      <input
  type="number"
  value={newItem.height}
  onChange={(e) => {
    const value = parseFloat(e.target.value);
    if (e.target.value === '' || (value >= 0 && value <= 100)) {
      setNewItem(prev => ({ ...prev, height: e.target.value }));
    }
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
  placeholder="0"
  step="0.01"
  max="100"
/>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Source <span className="text-red-500">*</span></label>
                    <select
                      value={newItem.source}
                      onChange={(e) => setNewItem(prev => ({ ...prev, source: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="CPWD-SOR">CPWD-SOR</option>
                      <option value="UPPWD-Circle Rates">UPPWD-Circle Rates</option>
                      <option value="Market Rate">Market Rate</option>
                    </select>
                  </div>
                  
                  
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
  onClick={() => {
    setShowAddItemModal(false);
    setNewItem({
      name: '',
      unit: '',
      rate: '',
      quantity: 1,
      source: 'CPWD-SOR',
      length: '',
      width: '',
      height: ''
    });
  }}
  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
>
  Cancel
</button>
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md flex items-center gap-2"
                    disabled={!newItem.name || !newItem.unit || !newItem.rate || !newItem.quantity}
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
        {showSuccessModal && savedEstimationData && (
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
                    Thank you! Your estimation has been successfully saved for the selected handpump <span className="font-semibold">{savedEstimationData.requisition.handpumpId}</span> and has been shared with the respective authorities and Gram Panchayat.
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Estimation ID</p>
                  <p className="text-xl font-bold text-blue-600">{savedEstimationData.estimationId}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Requisition:</span>
                      <span className="ml-2 font-semibold">REQ{savedEstimationData.requisition.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Handpump:</span>
                      <span className="ml-2 font-semibold">{savedEstimationData.requisition.handpumpId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mode:</span>
                      <span className="ml-2 font-semibold">{savedEstimationData.requisition.mode}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="ml-2 font-semibold text-emerald-600">₹{savedEstimationData.calculations.grandTotal.toLocaleString()}</span>
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