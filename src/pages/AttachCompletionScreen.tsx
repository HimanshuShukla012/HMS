import React, { useState } from 'react';
import { Filter, Search, Upload, FileText, Calendar, Eye, Wrench, Drill, TrendingUp, CheckCircle, X, Edit, AlertCircle } from 'lucide-react';

const AttachCompletionScreen = () => {
  const [filterVillage, setFilterVillage] = useState('All');
  const [filterHandpumpId, setFilterHandpumpId] = useState('');
  const [filterRequisitionId, setFilterRequisitionId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completionId, setCompletionId] = useState('');
  
  // Form states
  const [materialBill, setMaterialBill] = useState(null);
  const [totalMaterialCost, setTotalMaterialCost] = useState('');
  const [totalLabourCost, setTotalLabourCost] = useState('');
  const [dailyWageRate, setDailyWageRate] = useState('');
  const [noOfMandays, setNoOfMandays] = useState('');

  // Sample data for requisitions
  const requisitions = [
    {
      id: 'REQ001',
      handpumpId: 'HP001',
      village: 'Rampur',
      mode: 'Repair',
      requisitionDate: '2024-03-15',
      sanctionDate: '2024-03-18',
      sanctionAmount: '₹5,140',
      status: 'Sanctioned'
    },
    {
      id: 'REQ002',
      handpumpId: 'HP002',
      village: 'Shyampur',
      mode: 'Rebore',
      requisitionDate: '2024-03-16',
      sanctionDate: '2024-03-20',
      sanctionAmount: '₹21,947.73',
      status: 'Sanctioned'
    },
    {
      id: 'REQ003',
      handpumpId: 'HP003',
      village: 'Govindpur',
      mode: 'Repair',
      requisitionDate: '2024-03-17',
      sanctionDate: '2024-03-21',
      sanctionAmount: '₹4,890',
      status: 'Sanctioned'
    },
    {
      id: 'REQ004',
      handpumpId: 'HP004',
      village: 'Krishnapur',
      mode: 'Rebore',
      requisitionDate: '2024-03-18',
      sanctionDate: '2024-03-22',
      sanctionAmount: '₹19,875.50',
      status: 'Sanctioned'
    }
  ];

  const villages = ['All', 'Rampur', 'Shyampur', 'Govindpur', 'Krishnapur'];

  // Calculate number of mandays
  React.useEffect(() => {
    if (totalLabourCost && dailyWageRate) {
      const labour = parseFloat(totalLabourCost);
      const wage = parseFloat(dailyWageRate);
      if (labour > 0 && wage > 0) {
        const mandays = (labour / wage).toFixed(2);
        setNoOfMandays(mandays);
      } else {
        setNoOfMandays('');
      }
    } else {
      setNoOfMandays('');
    }
  }, [totalLabourCost, dailyWageRate]);

  const filteredRequisitions = requisitions.filter(req => {
    return (
      (filterVillage === 'All' || req.village === filterVillage) &&
      (filterHandpumpId === '' || req.handpumpId.toLowerCase().includes(filterHandpumpId.toLowerCase())) &&
      (filterRequisitionId === '' || req.id.toLowerCase().includes(filterRequisitionId.toLowerCase())) &&
      (filterDate === '' || req.requisitionDate.includes(filterDate))
    );
  });

  const handleAttachCompletion = (requisition) => {
    setSelectedRequisition(requisition);
    setShowCompletionModal(true);
    // Reset form
    setMaterialBill(null);
    setTotalMaterialCost('');
    setTotalLabourCost('');
    setDailyWageRate('');
    setNoOfMandays('');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setMaterialBill(file);
  };

  const handleSubmit = () => {
    if (materialBill && totalMaterialCost && totalLabourCost && dailyWageRate) {
      setShowPreview(true);
    }
  };

  const handleConfirm = () => {
    const randomId = 'COMP' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setCompletionId(randomId);
    setShowPreview(false);
    setShowCompletionModal(false);
    setShowSuccessModal(true);
  };

  const handleEdit = () => {
    setShowPreview(false);
  };

  const closeModal = () => {
    setShowCompletionModal(false);
    setShowPreview(false);
    setSelectedRequisition(null);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setCompletionId('');
  };

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
                <CheckCircle size={24} />
              </div>
              Attach Completion - Gram Panchayat
            </h1>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={filterVillage}
                  onChange={(e) => setFilterVillage(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1"
                >
                  {villages.map(village => (
                    <option key={village} value={village} className="text-gray-800">{village} Village</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Search size={18} className="text-white" />
                <input
                  type="text"
                  placeholder="Handpump ID"
                  value={filterHandpumpId}
                  onChange={(e) => setFilterHandpumpId(e.target.value)}
                  className="bg-transparent text-white placeholder-white/70 focus:outline-none flex-1"
                />
              </div>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Search size={18} className="text-white" />
                <input
                  type="text"
                  placeholder="Requisition ID"
                  value={filterRequisitionId}
                  onChange={(e) => setFilterRequisitionId(e.target.value)}
                  className="bg-transparent text-white placeholder-white/70 focus:outline-none flex-1"
                />
              </div>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Calendar size={18} className="text-white" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-transparent text-white focus:outline-none flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Sanctioned</p>
                <p className="text-2xl font-bold mt-1">16</p>
                <p className="text-blue-200 text-xs mt-1">↑ 8% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold mt-1">8</p>
                <p className="text-teal-200 text-xs mt-1">↑ 12% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold mt-1">8</p>
                <p className="text-amber-200 text-xs mt-1">↓ 5% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold mt-1">₹2.8L</p>
                <p className="text-emerald-200 text-xs mt-1">↑ 15% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Requisitions Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-700 to-slate-700 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              Sanctioned Requisitions Dashboard
            </h2>
            <p className="text-gray-200 mt-2">Attach completion details for sanctioned handpump requisitions</p>
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
                    Requisition Mode
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Requisition Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Sanction Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Sanction Amount
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
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-lg font-semibold text-gray-900">{requisition.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-medium text-slate-700">{requisition.handpumpId}</span>
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
                          {new Date(requisition.requisitionDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-green-500" />
                        <span className="text-sm font-medium text-green-700">
                          {new Date(requisition.sanctionDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-emerald-600">
                        {requisition.sanctionAmount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleAttachCompletion(requisition)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <CheckCircle size={16} />
                        Attach Completion
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRequisitions.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Search size={24} className="text-gray-400" />
              </div>
              <p className="text-lg text-gray-500 font-medium">No requisitions found for the selected filters.</p>
              <p className="text-gray-400 mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Attach Completion</h3>
                    <p className="text-green-100">Requisition: {selectedRequisition?.id}</p>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Requisition Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Requisition Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Handpump ID:</span>
                    <span className="ml-2 font-medium">{selectedRequisition?.handpumpId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Mode:</span>
                    <span className="ml-2 font-medium">{selectedRequisition?.mode}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sanction Amount:</span>
                    <span className="ml-2 font-medium text-green-600">{selectedRequisition?.sanctionAmount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Village:</span>
                    <span className="ml-2 font-medium">{selectedRequisition?.village}</span>
                  </div>
                </div>
              </div>

              {/* Material Bill Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Material Bill *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    id="material-bill"
                    accept=".pdf,.jpg,.png,.jpeg"
                    onChange={handleFileUpload}
                  />
                  <label 
                    htmlFor="material-bill" 
                    className="cursor-pointer bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    Choose File
                  </label>
                  {materialBill && (
                    <p className="text-sm text-green-600 mt-2">✓ {materialBill.name}</p>
                  )}
                </div>
              </div>

              {/* Cost Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Material Cost (₹) *
                  </label>
                  <input
                    type="number"
                    value={totalMaterialCost}
                    onChange={(e) => setTotalMaterialCost(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter material cost"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Labour Cost (₹) *
                  </label>
                  <input
                    type="number"
                    value={totalLabourCost}
                    onChange={(e) => setTotalLabourCost(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter labour cost"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Daily Wage Rate (₹) *
                  </label>
                  <input
                    type="number"
                    value={dailyWageRate}
                    onChange={(e) => setDailyWageRate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter daily wage rate"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    No. of Mandays
                  </label>
                  <input
                    type="text"
                    value={noOfMandays}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!materialBill || !totalMaterialCost || !totalLabourCost || !dailyWageRate}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                >
                  Submit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Eye size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Preview Completion Details</h3>
                    <p className="text-blue-100">Please review before confirming</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Requisition Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Requisition Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Requisition ID:</span>
                    <span className="ml-2 font-semibold">{selectedRequisition?.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Handpump ID:</span>
                    <span className="ml-2 font-semibold">{selectedRequisition?.handpumpId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Village:</span>
                    <span className="ml-2 font-semibold">{selectedRequisition?.village}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mode:</span>
                    <span className="ml-2 font-semibold">{selectedRequisition?.mode}</span>
                  </div>
                </div>
              </div>

              {/* Completion Details */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Completion Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material Bill:</span>
                    <span className="font-semibold text-green-600">✓ {materialBill?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Material Cost:</span>
                    <span className="font-semibold">₹{parseFloat(totalMaterialCost).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Labour Cost:</span>
                    <span className="font-semibold">₹{parseFloat(totalLabourCost).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Wage Rate:</span>
                    <span className="font-semibold">₹{parseFloat(dailyWageRate).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">No. of Mandays:</span>
                    <span className="font-semibold text-blue-600">{noOfMandays} days</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 bg-white rounded p-3 mt-3">
                    <span className="text-gray-800 font-semibold">Total Project Cost:</span>
                    <span className="font-bold text-lg text-green-600">
                      ₹{(parseFloat(totalMaterialCost) + parseFloat(totalLabourCost)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-lg"
                >
                  <Edit size={16} />
                  Edit Details
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg"
                >
                  <CheckCircle size={16} />
                  Confirm Submission
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
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white rounded-t-2xl text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Success!</h3>
              <p className="text-green-100">Completion details submitted successfully</p>
            </div>
            
            <div className="p-8 text-center space-y-6">
              <div className="bg-green-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Thanks! Your completion response has been saved successfully and has been shared with the respective authorities and Consulting Engineers (CE).
                </p>
                <p className="text-gray-700 font-medium">
                  Please view Closure Updates for updates regarding Closure.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Completion ID</p>
                <p className="text-xl font-bold text-blue-600">{completionId}</p>
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
  );
};

export default AttachCompletionScreen;