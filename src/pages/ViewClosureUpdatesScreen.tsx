import React, { useState } from 'react';
import { Filter, Search, Download, Eye, Calendar, FileText, Wrench, Drill, X, AlertCircle, CheckCircle, Clock, TrendingUp, ArrowLeft } from 'lucide-react';

const ViewClosureUpdatesScreen = () => {
  const [filterClosureStatus, setFilterClosureStatus] = useState('All');
  const [filterVerificationResult, setFilterVerificationResult] = useState('All');
  const [filterVillage, setFilterVillage] = useState('All');
  const [filterHandpumpId, setFilterHandpumpId] = useState('');
  const [filterRequisitionId, setFilterRequisitionId] = useState('');
  const [showMaterialBookModal, setShowMaterialBookModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Sample data for closure updates
  const closureUpdates = [
    {
      id: 'REQ001',
      handpumpId: 'HP001',
      village: 'Rampur',
      requisitionDate: '2024-03-15',
      mode: 'Repair',
      completionDate: '2024-04-05',
      mbStatus: 'Complete',
      verificationResult: 'Not Satisfactory',
      escalation: 'Recovery Escalated',
      closureStatus: 'On-Hold',
      estimatedAmount: 5140,
      actualAmount: 5890
    },
    {
      id: 'REQ002',
      handpumpId: 'HP002',
      village: 'Shyampur',
      requisitionDate: '2024-03-16',
      mode: 'Rebore',
      completionDate: '2024-04-10',
      mbStatus: 'Complete',
      verificationResult: 'Satisfactory',
      escalation: 'No Escalation',
      closureStatus: 'Completed',
      estimatedAmount: 21947.73,
      actualAmount: 21500
    },
    {
      id: 'REQ003',
      handpumpId: 'HP003',
      village: 'Govindpur',
      requisitionDate: '2024-03-17',
      mode: 'Repair',
      completionDate: '2024-04-12',
      mbStatus: 'Pending',
      verificationResult: 'Pending',
      escalation: 'Pending',
      closureStatus: 'Pending at CE Level',
      estimatedAmount: 4890,
      actualAmount: 0
    },
    {
      id: 'REQ004',
      handpumpId: 'HP004',
      village: 'Krishnapur',
      requisitionDate: '2024-03-18',
      mode: 'Rebore',
      completionDate: '2024-04-15',
      mbStatus: 'Complete',
      verificationResult: 'Not Satisfactory',
      escalation: 'Enquiry Escalated',
      closureStatus: 'On-Hold',
      estimatedAmount: 19875.50,
      actualAmount: 22100
    }
  ];

  // Material Book items for verification form
  const materialBookItems = [
    { sno: 1, item: 'Transportation of handpump material and T&P etc From market to the work site Including loading unloading and proper stacking at site work also including return cartage of unused material and T&P complete.', unit: 'Job', rate: 1706.46, ref: '', l: '', b: '', h: '', qty: 1, amount: 1706.46, remark: 'Transportation cost verified' },
    { sno: 2, item: 'Dismantling of old PCC Platform Handpump machine GI pipe, Connecting rod and cylinder Including all labour T & P Complete', unit: 'Job', rate: 1984.15, ref: '', l: '', b: '', h: '', qty: 1, amount: 1984.15, remark: 'Work completed as per specification' },
    { sno: 3, item: 'Cost of essential material for INDIA MARK- II handpump installation work', unit: '', rate: 0.00, ref: '', l: '', b: '', h: '', qty: '', amount: 0.00, remark: 'Header item' },
    { sno: '3.1', item: 'A. P.V.C PIPE(6KG/SQCM) 110 mm dia', unit: 'Rm', rate: 328.88, ref: '', l: 1, b: '', h: '', qty: 1, amount: 328.88, remark: 'Quality as per specifications' },
    { sno: '3.2', item: 'B. P.V.C PIPE(6KG/SQCM) 63 mm dia', unit: 'Rm', rate: 124.11, ref: '', l: 1, b: '', h: '', qty: 1, amount: 124.11, remark: 'Standard quality pipe used' },
    { sno: '3.3', item: 'C. 63 mm nominal dia strainer or blind pipe', unit: 'Rm', rate: 651.56, ref: '', l: 1, b: '', h: '', qty: 1, amount: 651.56, remark: 'Proper installation done' },
    { sno: '3.4', item: 'D.REDUCER (110 TO 63 MM)', unit: 'set', rate: 183.06, ref: '', l: '', b: '', h: '', qty: 1, amount: 183.06, remark: 'Good quality reducer' },
    { sno: '3.5', item: 'E. G.I.PIPE 32 MM dia medium quality(riser)', unit: 'Rm', rate: 341.29, ref: '', l: 1, b: '', h: '', qty: 1, amount: 341.29, remark: 'Medium quality as specified' },
    { sno: '3.6', item: 'F. Spare parts', unit: 'Job', rate: 2714.82, ref: '', l: '', b: '', h: '', qty: 1, amount: 2714.82, remark: 'All spare parts provided' },
    { sno: 4, item: 'Rent of equipment/plant and work of digging pit, erecting tripod etc. for drilling work by casing method or pump and pressure method', unit: 'Job', rate: 798.93, ref: '', l: '', b: '', h: '', qty: 1, amount: 798.93, remark: 'Equipment rent as per market rate' },
    { sno: 5, item: 'Drilling work 150 mm dia in hard and conker mix soil by (pump and pressure method OR casing while drilling method)', unit: '', rate: 0.00, ref: '', l: '', b: '', h: '', qty: '', amount: 0.00, remark: 'Header item' },
    { sno: 'A', item: 'A. 0 -15m', unit: 'Rm', rate: 511.94, ref: '', l: 1, b: '', h: '', qty: 1, amount: 511.94, remark: 'Drilling completed successfully' },
    { sno: 'B', item: 'B. 15-30m', unit: 'Rm', rate: 511.94, ref: '', l: 1, b: '', h: '', qty: 1, amount: 511.94, remark: 'Standard drilling rate' },
    { sno: 'C', item: 'C. 30-45m', unit: 'Rm', rate: 589.50, ref: '', l: 1, b: '', h: '', qty: 1, amount: 589.50, remark: 'Deeper drilling charges' },
    { sno: 'D', item: 'D. 45-65m', unit: 'Rm', rate: 899.77, ref: '', l: 1, b: '', h: '', qty: 1, amount: 899.77, remark: 'Deep bore drilling' }
  ];

  const villages = ['All', 'Rampur', 'Shyampur', 'Govindpur', 'Krishnapur'];
  const closureStatusOptions = ['All', 'Pending at CE Level', 'Completed', 'On-Hold'];
  const verificationOptions = ['All', 'Satisfactory', 'Not Satisfactory', 'Pending'];

  const filteredUpdates = closureUpdates.filter(update => {
    return (
      (filterClosureStatus === 'All' || update.closureStatus === filterClosureStatus) &&
      (filterVerificationResult === 'All' || update.verificationResult === filterVerificationResult) &&
      (filterVillage === 'All' || update.village === filterVillage) &&
      (filterHandpumpId === '' || update.handpumpId.toLowerCase().includes(filterHandpumpId.toLowerCase())) &&
      (filterRequisitionId === '' || update.id.toLowerCase().includes(filterRequisitionId.toLowerCase()))
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'Pending at CE Level': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'On-Hold': return 'text-red-700 bg-red-100 border-red-200';
      case 'Satisfactory': return 'text-green-700 bg-green-100 border-green-200';
      case 'Not Satisfactory': return 'text-red-700 bg-red-100 border-red-200';
      case 'Pending': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'Complete': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
      case 'Satisfactory':
      case 'Complete':
        return <CheckCircle size={14} />;
      case 'Pending':
      case 'Pending at CE Level':
        return <Clock size={14} />;
      case 'Not Satisfactory':
      case 'On-Hold':
        return <AlertCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const handleViewMaterialBook = (record) => {
    setSelectedRecord(record);
    setShowMaterialBookModal(true);
  };

  const handleViewVerificationForm = (record) => {
    setSelectedRecord(record);
    setShowVerificationModal(true);
  };

  const handleDownloadPDF = () => {
    alert('PDF download functionality would be implemented here');
  };

  const calculateMaterialBookTotal = () => {
    const total = materialBookItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const gst = total * 0.18;
    const totalWithGST = total + gst;
    const consultingFee = totalWithGST * 0.01;
    const grandTotal = totalWithGST + consultingFee;
    return { total, gst, totalWithGST, consultingFee, grandTotal };
  };

  const calculations = calculateMaterialBookTotal();

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
              View Closure Updates - Gram Panchayat
            </h1>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={filterClosureStatus}
                  onChange={(e) => setFilterClosureStatus(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                >
                  {closureStatusOptions.map(status => (
                    <option key={status} value={status} className="text-gray-800">{status}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={filterVerificationResult}
                  onChange={(e) => setFilterVerificationResult(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                >
                  {verificationOptions.map(option => (
                    <option key={option} value={option} className="text-gray-800">{option}</option>
                  ))}
                </select>
              </div>
              
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
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="group bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold mt-1">12</p>
                <p className="text-green-200 text-xs mt-1">↑ 8% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending at CE Level</p>
                <p className="text-2xl font-bold mt-1">8</p>
                <p className="text-amber-200 text-xs mt-1">↓ 5% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-red-600 to-rose-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">On-Hold</p>
                <p className="text-2xl font-bold mt-1">4</p>
                <p className="text-red-200 text-xs mt-1">↑ 2% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Closures</p>
                <p className="text-2xl font-bold mt-1">24</p>
                <p className="text-blue-200 text-xs mt-1">↑ 15% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Closure Updates Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-700 to-slate-700 p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                Closure Updates Dashboard
              </h2>
              <p className="text-gray-200 mt-2">Monitor closure status and verification results</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-5 py-2 rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg font-medium"
            >
              <Download size={18} />
              Download Report
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Requisition ID
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Handpump ID
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Date of Requisition
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Mode
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Date of Completion
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    MB Status
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Verification Result
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Escalation
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
                    Closure Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUpdates.map((update, index) => (
                  <tr key={update.id} className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50 transition-colors duration-300`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-lg font-semibold text-gray-900">{update.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-lg font-medium text-slate-700">{update.handpumpId}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(update.requisitionDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md ${
                        update.mode === 'Repair' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {update.mode === 'Repair' ? <Wrench size={14} /> : <Drill size={14} />}
                        {update.mode}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-green-500" />
                        <span className="text-sm font-medium text-green-700">
                          {update.completionDate ? new Date(update.completionDate).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {update.mbStatus === 'Complete' ? (
                        <button
                          onClick={() => handleViewMaterialBook(update)}
                          className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-colors cursor-pointer"
                        >
                          {getStatusIcon(update.mbStatus)}
                          {update.mbStatus}
                        </button>
                      ) : (
                        <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md border ${getStatusColor(update.mbStatus)}`}>
                          {getStatusIcon(update.mbStatus)}
                          {update.mbStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {update.verificationResult === 'Not Satisfactory' ? (
                        <button
                          onClick={() => handleViewVerificationForm(update)}
                          className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 transition-colors cursor-pointer"
                        >
                          {getStatusIcon(update.verificationResult)}
                          {update.verificationResult}
                        </button>
                      ) : (
                        <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md border ${getStatusColor(update.verificationResult)}`}>
                          {getStatusIcon(update.verificationResult)}
                          {update.verificationResult}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md border ${
                        update.escalation === 'No Escalation' ? 'text-green-700 bg-green-100 border-green-200' :
                        update.escalation === 'Pending' ? 'text-amber-700 bg-amber-100 border-amber-200' :
                        'text-red-700 bg-red-100 border-red-200'
                      }`}>
                        {update.escalation === 'No Escalation' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        {update.escalation}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md border ${getStatusColor(update.closureStatus)}`}>
                        {getStatusIcon(update.closureStatus)}
                        {update.closureStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUpdates.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Search size={24} className="text-gray-400" />
              </div>
              <p className="text-lg text-gray-500 font-medium">No closure updates found for the selected filters.</p>
              <p className="text-gray-400 mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Material Book Modal */}
      {showMaterialBookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Material Book</h3>
                    <p className="text-blue-100">Requisition: {selectedRecord?.id} - {selectedRecord?.handpumpId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors font-medium"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                  <button 
                    onClick={() => setShowMaterialBookModal(false)}
                    className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Material Book Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">S.No</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Item</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Unit</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Rate (Rs.)</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Reference/Source</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">L</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">B</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">H</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Qty.</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Amount</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {materialBookItems.map((item, index) => (
                      <tr key={index} className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50 transition-colors duration-200`}>
                        <td className="px-3 py-3 text-sm font-semibold text-blue-600">{item.sno}</td>
                        <td className="px-3 py-3 text-sm text-gray-800 max-w-xs">{item.item}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{item.unit}</td>
                        <td className="px-3 py-3 text-sm text-emerald-600 font-semibold">
                          {item.rate ? `₹${item.rate.toLocaleString()}` : ''}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700">{item.ref}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{item.l}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{item.b}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{item.h}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{item.qty}</td>
                        <td className="px-3 py-3 text-sm text-slate-700 font-semibold">
                          {item.amount ? `₹${item.amount.toLocaleString()}` : ''}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600 max-w-xs">{item.remark}</td>
                      </tr>
                    ))}
                    
                    {/* Total Calculations */}
                    <tr className="bg-blue-50 font-semibold">
                      <td className="px-3 py-3 text-sm text-blue-700">16</td>
                      <td className="px-3 py-3 text-sm text-blue-800">Add Items</td>
                      <td colSpan={8} className="px-3 py-3"></td>
                      <td className="px-3 py-3 text-sm text-blue-700">-</td>
                    </tr>
                    
                    <tr className="bg-indigo-50 font-semibold">
                      <td className="px-3 py-3 text-sm text-indigo-700">17</td>
                      <td className="px-3 py-3 text-sm text-indigo-800">Total</td>
                      <td colSpan={7} className="px-3 py-3"></td>
                      <td className="px-3 py-3 text-base text-indigo-700">₹{calculations.total.toLocaleString()}</td>
                      <td className="px-3 py-3 text-sm text-indigo-700">Sum of all items</td>
                    </tr>
                    
                    <tr className="bg-teal-50 font-semibold">
                      <td className="px-3 py-3 text-sm text-teal-700">18</td>
                      <td className="px-3 py-3 text-sm text-teal-800">GST (18%)</td>
                      <td colSpan={7} className="px-3 py-3"></td>
                      <td className="px-3 py-3 text-base text-teal-700">₹{calculations.gst.toLocaleString()}</td>
                      <td className="px-3 py-3 text-sm text-teal-700">As per GST rules</td>
                    </tr>
                    
                    <tr className="bg-cyan-50 font-semibold">
                      <td className="px-3 py-3 text-sm text-cyan-700">19</td>
                      <td className="px-3 py-3 text-sm text-cyan-800">Total (including GST)</td>
                      <td colSpan={7} className="px-3 py-3"></td>
                      <td className="px-3 py-3 text-base text-cyan-700">₹{calculations.totalWithGST.toLocaleString()}</td>
                      <td className="px-3 py-3 text-sm text-cyan-700">Total with GST</td>
                    </tr>
                    
                    <tr className="bg-emerald-50 font-semibold">
                      <td className="px-3 py-3 text-sm text-emerald-700">20</td>
                      <td className="px-3 py-3 text-sm text-emerald-800">1% Consulting Engineer Fee for MB</td>
                      <td colSpan={7} className="px-3 py-3"></td>
                      <td className="px-3 py-3 text-base text-emerald-700">₹{calculations.consultingFee.toLocaleString()}</td>
                      <td className="px-3 py-3 text-sm text-emerald-700">CE fee for MB preparation</td>
                    </tr>
                    
                    <tr className="bg-green-100 font-bold text-lg border-t-2 border-green-300">
                      <td className="px-3 py-4 text-green-700">21</td>
                      <td className="px-3 py-4 text-green-800 flex items-center gap-2">
                        <TrendingUp size={16} />
                        Grand Total
                      </td>
                      <td colSpan={7} className="px-3 py-4"></td>
                      <td className="px-3 py-4 text-xl text-green-700">₹{(calculations.grandTotal).toLocaleString()}</td>
                      <td className="px-3 py-4 text-sm text-green-700 font-normal">Final amount</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount Comparison */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                <h4 className="text-lg font-bold text-amber-800 mb-4">Amount Comparison</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <span className="text-amber-600 text-sm font-medium">Amount as per Estimation</span>
                    <p className="text-2xl font-bold text-amber-700">₹{selectedRecord?.estimatedAmount?.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <span className="text-amber-600 text-sm font-medium">Actual Amount</span>
                    <p className="text-2xl font-bold text-amber-700">₹{selectedRecord?.actualAmount?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
                  <span className="text-amber-600 text-sm font-medium">Variance</span>
                  <p className={`text-xl font-bold ${
                    (selectedRecord?.actualAmount - selectedRecord?.estimatedAmount) > 0 
                      ? 'text-red-700' 
                      : 'text-green-700'
                  }`}>
                    {(selectedRecord?.actualAmount - selectedRecord?.estimatedAmount) > 0 ? '+' : ''}
                    ₹{(selectedRecord?.actualAmount - selectedRecord?.estimatedAmount)?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Form Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Verification Form - Not Satisfactory</h3>
                    <p className="text-red-100">Requisition: {selectedRecord?.id} - {selectedRecord?.handpumpId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowVerificationModal(false)}
                  className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Verification Details */}
              <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <h4 className="text-lg font-bold text-red-800 mb-4">Verification Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-red-600 text-sm font-medium">Verification Result</span>
                    <p className="text-lg font-bold text-red-700">{selectedRecord?.verificationResult}</p>
                  </div>
                  <div>
                    <span className="text-red-600 text-sm font-medium">Escalation Status</span>
                    <p className="text-lg font-bold text-red-700">{selectedRecord?.escalation}</p>
                  </div>
                  <div>
                    <span className="text-red-600 text-sm font-medium">Closure Status</span>
                    <p className="text-lg font-bold text-red-700">{selectedRecord?.closureStatus}</p>
                  </div>
                </div>
              </div>

              {/* Material Book Verification Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-red-200">S.No</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-red-200">Item</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-red-200">Unit</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-red-200">Rate (Rs.)</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-red-200">Reference/Source</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-red-200">L</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-red-200">B</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-red-200">H</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-red-200">Qty.</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-red-200">Amount</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-red-200">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {materialBookItems.map((item, index) => (
                      <tr key={index} className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-red-50'
                      } hover:bg-red-100 transition-colors duration-200`}>
                        <td className="px-3 py-3 text-sm font-semibold text-red-600">{item.sno}</td>
                        <td className="px-3 py-3 text-sm text-gray-800 max-w-xs">{item.item}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{item.unit}</td>
                        <td className="px-3 py-3 text-sm text-emerald-600 font-semibold">
                          {item.rate ? `₹${item.rate.toLocaleString()}` : ''}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700">{item.ref}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{item.l}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{item.b}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{item.h}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{item.qty}</td>
                        <td className="px-3 py-3 text-sm text-slate-700 font-semibold">
                          {item.amount ? `₹${item.amount.toLocaleString()}` : ''}
                        </td>
                        <td className="px-3 py-3 text-sm text-red-600 max-w-xs font-medium">{item.remark}</td>
                      </tr>
                    ))}
                    
                    {/* Amount Comparison Rows */}
                    <tr className="bg-amber-100 font-semibold border-t-2 border-amber-300">
                      <td className="px-3 py-4 text-amber-700">22</td>
                      <td className="px-3 py-4 text-amber-800">Amount as per Estimation</td>
                      <td colSpan={7} className="px-3 py-4"></td>
                      <td className="px-3 py-4 text-lg text-amber-700">₹{selectedRecord?.estimatedAmount?.toLocaleString()}</td>
                      <td className="px-3 py-4 text-sm text-amber-700">Original estimation</td>
                    </tr>
                    
                    <tr className="bg-orange-100 font-semibold">
                      <td className="px-3 py-4 text-orange-700">23</td>
                      <td className="px-3 py-4 text-orange-800">Actual Amount</td>
                      <td colSpan={7} className="px-3 py-4"></td>
                      <td className="px-3 py-4 text-lg text-orange-700">₹{selectedRecord?.actualAmount?.toLocaleString()}</td>
                      <td className="px-3 py-4 text-sm text-orange-700">
                        {selectedRecord?.actualAmount > selectedRecord?.estimatedAmount ? 'Overrun detected' : 'Within budget'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Verification Issues */}
              <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <h4 className="text-lg font-bold text-red-800 mb-4">Verification Issues Identified</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white rounded border border-red-200">
                    <AlertCircle size={16} className="text-red-600 mt-1" />
                    <div>
                      <p className="font-medium text-red-800">Cost Overrun</p>
                      <p className="text-sm text-red-600">Actual amount exceeds estimated amount by ₹{(selectedRecord?.actualAmount - selectedRecord?.estimatedAmount)?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded border border-red-200">
                    <AlertCircle size={16} className="text-red-600 mt-1" />
                    <div>
                      <p className="font-medium text-red-800">Quality Concerns</p>
                      <p className="text-sm text-red-600">Some materials used do not meet specified quality standards</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded border border-red-200">
                    <AlertCircle size={16} className="text-red-600 mt-1" />
                    <div>
                      <p className="font-medium text-red-800">Documentation Issues</p>
                      <p className="text-sm text-red-600">Insufficient supporting documents for certain items</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewClosureUpdatesScreen;