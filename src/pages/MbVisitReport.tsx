import React, { useState } from 'react';
import { Filter, Search, Calendar, FileText, ClipboardCheck, Eye, Wrench, Drill, MapPin, X, Check, Edit3, Upload, Save, AlertCircle } from 'lucide-react';

const MBVisitReportScreen = () => {
  const [filterVillage, setFilterVillage] = useState('All');
  const [filterHandpumpId, setFilterHandpumpId] = useState('');
  const [filterRequisitionId, setFilterRequisitionId] = useState('');
  const [showMBModal, setShowMBModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successType, setSuccessType] = useState('');
  const [successId, setSuccessId] = useState('');

  // Material Book state
  const [mbRemarks, setMbRemarks] = useState({});
  
  // Visit Report state
  const [visitReport, setVisitReport] = useState({
    workAbility: 'good',
    workAbilityRemark: '',
    conditionPlatform: 'good',
    conditionPlatformRemark: '',
    handpumpLocation: 'firm',
    handpumpLocationRemark: '',
    groutingPedestal: 'Yes',
    groutingPedestalRemark: '',
    rustingHandleParts: 'none',
    rustingHandlePartsRemark: '',
    rustingPumpStandHead: 'none',
    rustingPumpStandHeadRemark: '',
    rustingPlungerSetup: 'none',
    rustingPlungerSetupRemark: '',
    rustingCheckValveSetup: 'none',
    rustingCheckValveSetupRemark: '',
    damageCylinderLiner: 'none',
    damageCylinderLinerRemark: '',
    damageBearingParts: 'none',
    damageBearingPartsRemark: '',
    damageRisingMainPumprods: 'none',
    damageRisingMainPumprodsRemark: '',
    damageRisingMainCentralisers: 'none',
    damageRisingMainCentralisersRemark: '',
    damagedSealingParts: 'none',
    damagedSealingPartsRemark: '',
    preventiveMaintenance: 'yes',
    preventiveMaintenanceRemark: '',
    techMechAssistance: 'yes',
    techMechAssistanceRemark: '',
    maintenanceSystemSatisfying: 'yes',
    maintenanceSystemSatisfyingRemark: '',
    strokesToFill: '',
    strokesToFillRemark: '',
    breakdownsTillDate: '',
    breakdownsTillDateRemark: '',
    meanDownTime: '',
    meanDownTimeRemark: '',
    whyPoorPerformance: '',
    whyPoorPerformanceRemark: '',
    comments: ''
  });

  // Sample data for completed requisitions
  const requisitions = [
    {
      id: 'REQ001',
      handpumpId: 'HP001',
      village: 'Rampur',
      gramPanchayat: 'Saraswati GP',
      block: 'Mohanlalganj',
      district: 'Lucknow',
      mode: 'Repair',
      completionDate: '2024-03-25',
      totalCost: '₹5,140',
      status: 'Completed'
    },
    {
      id: 'REQ002',
      handpumpId: 'HP002',
      village: 'Shyampur',
      gramPanchayat: 'Ganga GP',
      block: 'Malihabad',
      district: 'Lucknow',
      mode: 'Rebore',
      completionDate: '2024-03-26',
      totalCost: '₹21,947',
      status: 'Completed'
    },
    {
      id: 'REQ003',
      handpumpId: 'HP003',
      village: 'Govindpur',
      gramPanchayat: 'Yamuna GP',
      block: 'Sarojininagar',
      district: 'Lucknow',
      mode: 'Repair',
      completionDate: '2024-03-27',
      totalCost: '₹4,890',
      status: 'Completed'
    }
  ];

  // Sample MB items based on estimation
  const mbItems = [
    { id: 1, name: 'Chain(25.4mm pitch roller chain with 7links)', unit: 'Nos', estimatedQty: 1, actualQty: 1, rate: 120, amount: 120, source: 'CPWD-SOR' },
    { id: 2, name: 'Plunger', unit: 'Nos', estimatedQty: 1, actualQty: 1, rate: 250, amount: 250, source: 'CPWD-SOR' },
    { id: 3, name: 'Check Valve', unit: 'Nos', estimatedQty: 1, actualQty: 1, rate: 125, amount: 125, source: 'CPWD-SOR' },
    { id: 4, name: 'Cylinder Casing', unit: 'Nos', estimatedQty: 1, actualQty: 0, rate: 220, amount: 0, source: 'CPWD-SOR' },
    { id: 5, name: 'Handle Complete Set', unit: 'Nos', estimatedQty: 1, actualQty: 1, rate: 2200, amount: 2200, source: 'CPWD-SOR' }
  ];

  const villages = ['All', 'Rampur', 'Shyampur', 'Govindpur'];

  const filteredRequisitions = requisitions.filter(req => {
    return (
      (filterVillage === 'All' || req.village === filterVillage) &&
      (filterHandpumpId === '' || req.handpumpId.toLowerCase().includes(filterHandpumpId.toLowerCase())) &&
      (filterRequisitionId === '' || req.id.toLowerCase().includes(filterRequisitionId.toLowerCase()))
    );
  });

  const handleCreateMB = (requisition) => {
    setSelectedRequisition(requisition);
    setShowMBModal(true);
    setMbRemarks({});
  };

  const handleCreateVisitReport = (requisition) => {
    setSelectedRequisition(requisition);
    setShowVisitModal(true);
  };

  const handleMBSubmit = () => {
    const randomId = 'MB' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setSuccessId(randomId);
    setSuccessType('Material Book');
    setShowMBModal(false);
    setShowSuccessModal(true);
  };

  const handleVisitReportSubmit = () => {
    const randomId = 'VR' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setSuccessId(randomId);
    setSuccessType('Visit Report');
    setShowVisitModal(false);
    setShowSuccessModal(true);
  };

  const updateMBRemark = (itemId, remark) => {
    setMbRemarks(prev => ({
      ...prev,
      [itemId]: remark
    }));
  };

  const updateVisitReport = (field, value) => {
    setVisitReport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTotalMBAmount = () => {
    return mbItems.reduce((total, item) => total + item.amount, 0);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-IN');
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
                <FileText size={24} />
              </div>
              Material Book & Visit Report - Consulting Engineer
            </h1>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={filterVillage}
                  onChange={(e) => setFilterVillage(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
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
                  placeholder="Search by Handpump ID"
                  value={filterHandpumpId}
                  onChange={(e) => setFilterHandpumpId(e.target.value)}
                  className="bg-transparent text-white placeholder-white/70 focus:outline-none w-48"
                />
              </div>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Search size={18} className="text-white" />
                <input
                  type="text"
                  placeholder="Search by Requisition ID"
                  value={filterRequisitionId}
                  onChange={(e) => setFilterRequisitionId(e.target.value)}
                  className="bg-transparent text-white placeholder-white/70 focus:outline-none w-48"
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
                <p className="text-blue-100 text-sm font-medium">Total Completed</p>
                <p className="text-2xl font-bold mt-1">24</p>
                <p className="text-blue-200 text-xs mt-1">Ready for MB/VR</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">MB Created</p>
                <p className="text-2xl font-bold mt-1">18</p>
                <p className="text-emerald-200 text-xs mt-1">↑ 15% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Edit3 size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Visit Reports</p>
                <p className="text-2xl font-bold mt-1">16</p>
                <p className="text-purple-200 text-xs mt-1">↑ 12% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <ClipboardCheck size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold mt-1">6</p>
                <p className="text-orange-200 text-xs mt-1">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <AlertCircle size={24} />
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
              Completed Requisitions Dashboard
            </h2>
            <p className="text-gray-200 mt-2">Create Material Books and Visit Reports for completed handpump work</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Requisition ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Handpump ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Mode</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Completion Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Total Cost</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequisitions.map((requisition, index) => (
                  <tr key={requisition.id} className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50 transition-colors duration-300`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-lg font-semibold text-gray-900">{requisition.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-medium text-slate-700">{requisition.handpumpId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-500" />
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{requisition.village}</div>
                          <div className="text-gray-500">{requisition.gramPanchayat}</div>
                        </div>
                      </div>
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
                          {new Date(requisition.completionDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-emerald-600">{requisition.totalCost}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCreateMB(requisition)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                          <Edit3 size={14} />
                          Create MB
                        </button>
                        <button
                          onClick={() => handleCreateVisitReport(requisition)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold rounded-lg hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                          <ClipboardCheck size={14} />
                          Visit Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Material Book Modal */}
      {showMBModal && selectedRequisition && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Edit3 size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Create Material Book (MB)</h3>
                    <p className="text-purple-100">Requisition: {selectedRequisition.id} - {selectedRequisition.handpumpId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMBModal(false)}
                  className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Project Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Project Details</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500">Handpump ID:</span> <span className="font-medium">{selectedRequisition.handpumpId}</span></div>
                  <div><span className="text-gray-500">Village:</span> <span className="font-medium">{selectedRequisition.village}</span></div>
                  <div><span className="text-gray-500">Mode:</span> <span className="font-medium">{selectedRequisition.mode}</span></div>
                </div>
              </div>

              {/* Material Book Table */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-4">
                  <h4 className="text-lg font-bold">Material Book - Items Used</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-purple-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">S.No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Item Description</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Est. Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Actual Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Rate (₹)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Amount (₹)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase min-w-[200px]">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mbItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-semibold text-purple-600">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.unit}</td>
                          <td className="px-4 py-3 text-sm text-blue-600 font-medium">{item.estimatedQty}</td>
                          <td className="px-4 py-3 text-sm text-green-600 font-semibold">{item.actualQty}</td>
                          <td className="px-4 py-3 text-sm text-emerald-600 font-semibold">₹{item.rate}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 font-semibold">₹{item.amount}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {item.source}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <textarea
                              value={mbRemarks[item.id] || ''}
                              onChange={(e) => updateMBRemark(item.id, e.target.value)}
                              placeholder="Add remarks for this item..."
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                              rows="2"
                            />
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-purple-100 font-bold">
                        <td colSpan="6" className="px-4 py-3 text-purple-800 text-right">Total Amount:</td>
                        <td className="px-4 py-3 text-lg text-purple-700">₹{getTotalMBAmount()}</td>
                        <td colSpan="2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleMBSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg flex items-center gap-2"
                >
                  <Save size={18} />
                  Submit Material Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visit Report Modal */}
      {showVisitModal && selectedRequisition && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Visit Monitoring Report</h3>
                    <p className="text-teal-100">India Mark II Handpump - {selectedRequisition.handpumpId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowVisitModal(false)}
                  className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Auto-filled Details */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 mb-6 border border-teal-200">
                <h4 className="text-sm font-semibold text-teal-700 mb-3">Monitoring Details</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-teal-600 font-medium">Handpump ID:</span> <span className="font-semibold">{selectedRequisition.handpumpId}</span></div>
                  <div><span className="text-teal-600 font-medium">Village:</span> <span className="font-semibold">{selectedRequisition.village}</span></div>
                  <div><span className="text-teal-600 font-medium">Block:</span> <span className="font-semibold">{selectedRequisition.block}</span></div>
                  <div><span className="text-teal-600 font-medium">District:</span> <span className="font-semibold">{selectedRequisition.district}</span></div>
                  <div><span className="text-teal-600 font-medium">Gram Panchayat:</span> <span className="font-semibold">{selectedRequisition.gramPanchayat}</span></div>
                  <div><span className="text-teal-600 font-medium">Recording Person:</span> <span className="font-semibold">Consulting Engineer</span></div>
                  <div><span className="text-teal-600 font-medium">Date:</span> <span className="font-semibold">{getCurrentDate()}</span></div>
                </div>
              </div>

              {/* Visit Report Form */}
              <div className="space-y-6">
                {/* Work Ability of Handpump */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Work Ability of Handpump</label>
                  <div className="flex flex-wrap gap-4 mb-3">
                    {['good', 'fair', 'bad'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="workAbility"
                          value={option}
                          checked={visitReport.workAbility === option}
                          onChange={(e) => updateVisitReport('workAbility', e.target.value)}
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    placeholder="Add remarks..."
                    value={visitReport.workAbilityRemark}
                    onChange={(e) => updateVisitReport('workAbilityRemark', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    rows="2"
                  />
                </div>

                {/* Condition of Platform */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Condition of Platform</label>
                  <div className="flex flex-wrap gap-4 mb-3">
                    {['good', 'fair', 'bad'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="conditionPlatform"
                          value={option}
                          checked={visitReport.conditionPlatform === option}
                          onChange={(e) => updateVisitReport('conditionPlatform', e.target.value)}
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    placeholder="Add remarks..."
                    value={visitReport.conditionPlatformRemark}
                    onChange={(e) => updateVisitReport('conditionPlatformRemark', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    rows="2"
                  />
                </div>

                {/* Grouting of Pedestal */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Grouting of Pedestal or Pump Stand</label>
                  <div className="flex flex-wrap gap-4 mb-3">
                    {['Firm', 'Loose', 'No Pedestal'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="groutingPedestal"
                          value={option}
                          checked={visitReport.groutingPedestal === option}
                          onChange={(e) => updateVisitReport('groutingPedestal', e.target.value)}
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    placeholder="Add remarks..."
                    value={visitReport.groutingPedestalRemark}
                    onChange={(e) => updateVisitReport('groutingPedestalRemark', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    rows="2"
                  />
                </div>

                {/* Numerical Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strokes to Fill */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">No. of Strokes to Fill a 12-liter Bucket</label>
                    <input
                      type="number"
                      value={visitReport.strokesToFill}
                      onChange={(e) => updateVisitReport('strokesToFill', e.target.value)}
                      className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter number of strokes"
                    />
                    <textarea
                      placeholder="Add remarks..."
                      value={visitReport.strokesToFillRemark}
                      onChange={(e) => updateVisitReport('strokesToFillRemark', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="2"
                    />
                  </div>

                  {/* Breakdowns Till Date */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">No. of Breakdowns Till Date</label>
                    <input
                      type="number"
                      value={visitReport.breakdownsTillDate}
                      onChange={(e) => updateVisitReport('breakdownsTillDate', e.target.value)}
                      className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter number of breakdowns"
                    />
                    <textarea
                      placeholder="Add remarks..."
                      value={visitReport.breakdownsTillDateRemark}
                      onChange={(e) => updateVisitReport('breakdownsTillDateRemark', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="2"
                    />
                  </div>

                  
                </div>

                {/* Rusting Issues */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rusting of Handle Parts */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Rusting of Handle Parts</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['none', 'slight', 'High'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="rustingHandleParts"
                            value={option}
                            checked={visitReport.rustingHandleParts === option}
                            onChange={(e) => updateVisitReport('rustingHandleParts', e.target.value)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Add remarks..."
                      value={visitReport.rustingHandlePartsRemark}
                      onChange={(e) => updateVisitReport('rustingHandlePartsRemark', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="2"
                    />
                  </div>

                  {/* Why Poor Performance */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Why Poor Performance / Breakdowns</label>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      {[
                        'no spares', 'no skill', 'no funds', 'no mechanic',
                        'Plunger seal', 'Bobbins O-Rings', 'Other'
                      ].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={visitReport.whyPoorPerformance.includes(option)}
                            onChange={(e) => {
                              const current = visitReport.whyPoorPerformance.split(', ').filter(Boolean);
                              if (e.target.checked) {
                                updateVisitReport('whyPoorPerformance', [...current, option].join(', '));
                              } else {
                                updateVisitReport('whyPoorPerformance', current.filter(item => item !== option).join(', '));
                              }
                            }}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Add remarks..."
                      value={visitReport.whyPoorPerformanceRemark}
                      onChange={(e) => updateVisitReport('whyPoorPerformanceRemark', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="2"
                    />
                  </div>
                  {/* Rusting of Pump Stand and Head */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Rusting of Pump Stand and Head</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['none', 'slight', 'High'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="rustingPumpStandHead"
                            value={option}
                            checked={visitReport.rustingPumpStandHead === option}
                            onChange={(e) => updateVisitReport('rustingPumpStandHead', e.target.value)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Add remarks..."
                      value={visitReport.rustingPumpStandHeadRemark}
                      onChange={(e) => updateVisitReport('rustingPumpStandHeadRemark', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="2"
                    />
                  </div>

                  {/* Rusting of Plunger Setup */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Rusting of Plunger Set-up</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['none', 'slight', 'High'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="rustingPlungerSetup"
                            value={option}
                            checked={visitReport.rustingPlungerSetup === option}
                            onChange={(e) => updateVisitReport('rustingPlungerSetup', e.target.value)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Add remarks..."
                      value={visitReport.rustingPlungerSetupRemark}
                      onChange={(e) => updateVisitReport('rustingPlungerSetupRemark', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="2"
                    />
                  </div>

                  {/* Rusting of Check Valve Setup */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Condition of Check Valve Set-up</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['Good', 'Fair', 'bad'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="rustingCheckValveSetup"
                            value={option}
                            checked={visitReport.rustingCheckValveSetup === option}
                            onChange={(e) => updateVisitReport('rustingCheckValveSetup', e.target.value)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Add remarks..."
                      value={visitReport.rustingCheckValveSetupRemark}
                      onChange={(e) => updateVisitReport('rustingCheckValveSetupRemark', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Damage Issues */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Damage on Cylinder Liner */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Damage on Cylinder Liner</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['none', 'slight', 'bad'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="damageCylinderLiner"
                            value={option}
                            checked={visitReport.damageCylinderLiner === option}
                            onChange={(e) => updateVisitReport('damageCylinderLiner', e.target.value)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Add remarks..."
                      value={visitReport.damageCylinderLinerRemark}
                      onChange={(e) => updateVisitReport('damageCylinderLinerRemark', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="2"
                    />
                  </div>

                  {/* Damage on Bearing Parts */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Damage on Bearing Parts</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['none', 'slight', 'bad'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="damageBearingParts"
                            value={option}
                            checked={visitReport.damageBearingParts === option}
                            onChange={(e) => updateVisitReport('damageBearingParts', e.target.value)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Add remarks..."
                      value={visitReport.damageBearingPartsRemark}
                      onChange={(e) => updateVisitReport('damageBearingPartsRemark', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="2"
                    />
                  </div>

                  {/* Damage Between Rising Main/Pumprods */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Damage Between Rising Main/Pumprods</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['none', 'slight', 'bad'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="damageRisingMainPumprods"
                            value={option}
                            checked={visitReport.damageRisingMainPumprods === option}
                            onChange={(e) => updateVisitReport('damageRisingMainPumprods', e.target.value)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Add remarks..."
                      value={visitReport.damageRisingMainPumprodsRemark}
                      onChange={(e) => updateVisitReport('damageRisingMainPumprodsRemark', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="2"
                    />
                  </div>

                  {/* Damage Between Rising Main/Centralisers */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Damage Between Rising Main/Centralisers</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['none', 'slight', 'bad'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="damageRisingMainCentralisers"
                            value={option}
                            checked={visitReport.damageRisingMainCentralisers === option}
                            onChange={(e) => updateVisitReport('damageRisingMainCentralisers', e.target.value)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Add remarks..."
                      value={visitReport.damageRisingMainCentralisersRemark}
                      onChange={(e) => updateVisitReport('damageRisingMainCentralisersRemark', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Damaged Sealing Parts */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Damaged Sealing Parts</label>
                  <div className="flex flex-wrap gap-4 mb-3">
                    {['Bobbins', 'O-Rings', 'Plunger Seal', 'Other'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="damagedSealingParts"
                          value={option}
                          checked={visitReport.damagedSealingParts === option}
                          onChange={(e) => updateVisitReport('damagedSealingParts', e.target.value)}
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    placeholder="Add remarks..."
                    value={visitReport.damagedSealingPartsRemark}
                    onChange={(e) => updateVisitReport('damagedSealingPartsRemark', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    rows="2"
                  />
                </div>

                {/* Maintenance Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Preventive Maintenance */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Is Preventive Maintenance Done</label>
                    <div className="flex flex-wrap gap-4 mb-3">
                      {['yes', 'no'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="preventiveMaintenance"
                            value={option}
                            checked={visitReport.preventiveMaintenance === option}
                            onChange={(e) => updateVisitReport('preventiveMaintenance', e.target.value)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Add remarks..."
                      value={visitReport.preventiveMaintenanceRemark}
                      onChange={(e) => updateVisitReport('preventiveMaintenanceRemark', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="2"
                    />
                  </div>

                  {/* Technical/Mechanical Assistance */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Is Tech/Mech Assistance Available</label>
                    <div className="flex flex-wrap gap-4 mb-3">
                      {['yes', 'no'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="techMechAssistance"
                            value={option}
                            checked={visitReport.techMechAssistance === option}
                            onChange={(e) => updateVisitReport('techMechAssistance', e.target.value)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Add remarks..."
                      value={visitReport.techMechAssistanceRemark}
                      onChange={(e) => updateVisitReport('techMechAssistanceRemark', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Maintenance System Satisfying */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Is Maintenance System Satisfying</label>
                  <div className="flex flex-wrap gap-4 mb-3">
                    {['yes', 'no'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="maintenanceSystemSatisfying"
                          value={option}
                          checked={visitReport.maintenanceSystemSatisfying === option}
                          onChange={(e) => updateVisitReport('maintenanceSystemSatisfying', e.target.value)}
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    placeholder="Add remarks..."
                    value={visitReport.maintenanceSystemSatisfyingRemark}
                    onChange={(e) => updateVisitReport('maintenanceSystemSatisfyingRemark', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    rows="2"
                  />
                </div>

                {/* Additional Comments */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Additional Comments</label>
                  <textarea
                    placeholder="Add any additional comments or observations..."
                    value={visitReport.comments}
                    onChange={(e) => updateVisitReport('comments', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    rows="4"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={handleVisitReportSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-lg flex items-center gap-2"
                >
                  <Check size={18} />
                  Submit Visit Report
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
            <div className={`${
              successType === 'Material Book' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
                : 'bg-gradient-to-r from-teal-600 to-cyan-600'
            } p-6 text-white rounded-t-2xl text-center`}>
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                {successType === 'Material Book' ? <Edit3 size={32} /> : <ClipboardCheck size={32} />}
              </div>
              <h3 className="text-2xl font-bold mb-2">Success!</h3>
              <p className={`${
                successType === 'Material Book' ? 'text-purple-100' : 'text-teal-100'
              }`}>
                {successType} submitted successfully
              </p>
            </div>
            
            <div className="p-8 text-center space-y-6">
              <div className={`${
                successType === 'Material Book' ? 'bg-purple-50' : 'bg-teal-50'
              } rounded-lg p-6`}>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Thank you! Your {successType.toLowerCase()} has been successfully saved and shared with the respective authorities for further processing.
                </p>
                {successType === 'Material Book' && (
                  <p className="text-gray-700 font-medium">
                    The material book will be reviewed for final project closure.
                  </p>
                )}
                {successType === 'Visit Report' && (
                  <p className="text-gray-700 font-medium">
                    The visit monitoring report has been recorded for quality assurance.
                  </p>
                )}
              </div>
              
              <div className={`${
                successType === 'Material Book' ? 'bg-purple-50' : 'bg-teal-50'
              } rounded-lg p-4`}>
                <p className="text-sm text-gray-600">{successType} ID</p>
                <p className={`text-xl font-bold ${
                  successType === 'Material Book' ? 'text-purple-600' : 'text-teal-600'
                }`}>
                  {successId}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Requisition:</span>
                    <span className="ml-2 font-semibold">{selectedRequisition?.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Handpump:</span>
                    <span className="ml-2 font-semibold">{selectedRequisition?.handpumpId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Village:</span>
                    <span className="ml-2 font-semibold">{selectedRequisition?.village}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-semibold">{getCurrentDate()}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className={`w-full px-6 py-3 ${
                  successType === 'Material Book' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' 
                    : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700'
                } text-white font-semibold rounded-lg transition-all duration-300 shadow-lg`}
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

export default MBVisitReportScreen;