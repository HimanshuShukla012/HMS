import React, { useState } from 'react';
import { Filter, Search, Download, Eye, Calendar, FileText, Wrench, Drill, ArrowLeft, TrendingUp } from 'lucide-react';

const ViewEstimationScreen = () => {
  const [filterMode, setFilterMode] = useState('All');
  const [selectedEstimation, setSelectedEstimation] = useState(null);
  
  // Sample data for requisitions
  const requisitions = [
    {
      id: 'REQ001',
      handpumpId: 'HP001',
      mode: 'Repair',
      date: '2024-03-15',
      sanctionedTotal: '₹5,140',
      status: 'Approved'
    },
    {
      id: 'REQ002',
      handpumpId: 'HP002',
      mode: 'Rebore',
      date: '2024-03-16',
      sanctionedTotal: '₹21,947.73',
      status: 'Pending'
    },
    {
      id: 'REQ003',
      handpumpId: 'HP003',
      mode: 'Repair',
      date: '2024-03-17',
      sanctionedTotal: '₹4,890',
      status: 'Approved'
    },
    {
      id: 'REQ004',
      handpumpId: 'HP004',
      mode: 'Rebore',
      date: '2024-03-18',
      sanctionedTotal: '₹19,875.50',
      status: 'In Progress'
    }
  ];

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
    { sno: 11, item: 'Socket(same as number of pipes)', unit: 'Nos', rate: 50, qty: 1, amount: 50 },
    { sno: 12, item: 'Thread', unit: 'Nos', rate: 25, qty: 1, amount: 25 },
    { sno: 13, item: 'Washer set', unit: 'Nos', rate: 80, qty: 1, amount: 80 },
    { sno: 14, item: 'Cylinder', unit: 'Nos', rate: 925, qty: 1, amount: 925 }
  ];

  const reboreItems = [
    { sno: 1, item: 'Transportation of handpump material and T&P etc From market to the work site Including loading unloading and proper stacking at site work also including return cartage of unused material and T&P complete.', unit: 'Job', rate: 1706.46, ref: '', l: '', b: '', h: '', qty: 1, amount: 1706.46 },
    { sno: 2, item: 'Dismantling of old PCC Platform Handpump machine GI pipe, Connecting rod and cylinder Including all labour T & P Complete', unit: 'Job', rate: 1984.15, ref: '', l: '', b: '', h: '', qty: 1, amount: 1984.15 },
    { sno: 3, item: 'Cost of essential material for INDIA MARK- II handpump installation work', unit: '', rate: 0.00, ref: '', l: '', b: '', h: '', qty: '', amount: 0.00 },
    { sno: '3.1', item: 'A. P.V.C PIPE(6KG/SQCM) 110 mm dia', unit: 'Rm', rate: 328.88, ref: '', l: '', b: '', h: '', qty: 1, amount: 328.88 },
    { sno: '3.2', item: 'B. P.V.C PIPE(6KG/SQCM) 63 mm dia', unit: 'Rm', rate: 124.11, ref: '', l: '', b: '', h: '', qty: 1, amount: 124.11 },
    { sno: '3.3', item: 'C. 63 mm nominal dia strainer or blind pipe', unit: 'Rm', rate: 651.56, ref: '', l: '', b: '', h: '', qty: 1, amount: 651.56 },
    { sno: '3.4', item: 'D.REDUCER (110 TO 63 MM)', unit: 'set', rate: 183.06, ref: '', l: '', b: '', h: '', qty: 1, amount: 183.06 },
    { sno: '3.5', item: 'E. G.I.PIPE 32 MM dia medium quality(riser)', unit: 'Rm', rate: 341.29, ref: '', l: '', b: '', h: '', qty: 1, amount: 341.29 },
    { sno: '3.6', item: 'F. Spare parts', unit: 'Job', rate: 2714.82, ref: '', l: '', b: '', h: '', qty: 1, amount: 2714.82 },
    { sno: 4, item: 'Rent of equipment/plant and work of digging pit, erecting tripod etc. for drilling work by casing method or pump and pressure method', unit: 'Job', rate: 798.93, ref: '', l: '', b: '', h: '', qty: 1, amount: 798.93 },
    { sno: 5, item: 'Drilling work 150 mm dia in hard and conker mix soil by (pump and pressure method OR casing while drilling method)', unit: '', rate: 0.00, ref: '', l: '', b: '', h: '', qty: '', amount: 0.00 },
    { sno: '5A', item: 'A. 0 -15m', unit: 'Rm', rate: 511.94, ref: '', l: '', b: '', h: '', qty: 1, amount: 511.94 },
    { sno: '5B', item: 'B. 15-30m', unit: 'Rm', rate: 511.94, ref: '', l: '', b: '', h: '', qty: 1, amount: 511.94 },
    { sno: '5C', item: 'C. 30-45m', unit: 'Rm', rate: 589.50, ref: '', l: '', b: '', h: '', qty: 1, amount: 589.50 },
    { sno: '5D', item: 'D. 45-65m', unit: 'Rm', rate: 899.77, ref: '', l: '', b: '', h: '', qty: 1, amount: 899.77 }
  ];

  const filteredRequisitions = filterMode === 'All' ? requisitions : requisitions.filter(req => req.mode === filterMode);

  const handleViewEstimation = (requisition) => {
    setSelectedEstimation(requisition);
  };

  const handleDownloadPDF = () => {
    // PDF download logic would go here
    alert('PDF download functionality would be implemented here');
  };

  const calculateRepairTotal = () => {
    const total = repairItems.reduce((sum, item) => sum + item.amount, 0);
    const gst = total * 0.18;
    const totalWithGST = total + gst;
    const consultingFee = totalWithGST * 0.01;
    const grandTotal = totalWithGST + consultingFee;
    return { total, gst, totalWithGST, consultingFee, grandTotal };
  };

  const calculateReboreTotal = () => {
    const total = reboreItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const gst = total * 0.18;
    const totalWithGST = total + gst;
    const consultingFee = totalWithGST * 0.01;
    const grandTotal = totalWithGST + consultingFee;
    return { total, gst, totalWithGST, consultingFee, grandTotal };
  };

  if (selectedEstimation) {
    const isRepair = selectedEstimation.mode === 'Repair';
    const calculations = isRepair ? calculateRepairTotal() : calculateReboreTotal();
    const items = isRepair ? repairItems : reboreItems;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Professional Gradient */}
          <div className="bg-gradient-to-r from-slate-700 via-blue-800 to-indigo-800 rounded-xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
            </div>
            <div className="relative z-10 flex justify-between items-center">
              <button 
                onClick={() => setSelectedEstimation(null)}
                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-5 py-2 rounded-lg hover:bg-white/25 transition-all duration-300 font-medium border border-white/20"
              >
                <ArrowLeft size={18} />
                Back to Dashboard
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-5 py-2 rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg font-medium"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>

          {/* Consulting Engineer Card */}
          <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-14 translate-x-14"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 -translate-x-10"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileText size={20} />
                </div>
                Consulting Engineer: Er. Rajesh Kumar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <span className="text-white/80 text-sm">Requisition ID</span>
                  <p className="text-lg font-bold mt-1">{selectedEstimation.id}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <span className="text-white/80 text-sm">Handpump ID</span>
                  <p className="text-lg font-bold mt-1">{selectedEstimation.handpumpId}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <span className="text-white/80 text-sm">Mode</span>
                  <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-md font-semibold text-sm ${
                    selectedEstimation.mode === 'Repair' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {selectedEstimation.mode === 'Repair' ? <Wrench size={14} /> : <Drill size={14} />}
                    {selectedEstimation.mode}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estimation Table */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-gray-700 to-slate-700 p-6 text-white">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedEstimation.mode === 'Repair' ? 'bg-blue-500' : 'bg-emerald-500'
                }`}>
                  {selectedEstimation.mode === 'Repair' ? <Wrench size={16} /> : <Drill size={16} />}
                </div>
                {selectedEstimation.mode} Estimation Details
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">S.No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Rate (Rs.)</th>
                    {!isRepair && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Reference/Source</th>}
                    {!isRepair && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">L</th>}
                    {!isRepair && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">B</th>}
                    {!isRepair && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">H</th>}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Qty.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, index) => (
                    <tr key={index} className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-50 transition-colors duration-200`}>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">{item.sno}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 max-w-md">{item.item}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.unit}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 font-semibold">
                        {item.rate ? `₹${item.rate.toLocaleString()}` : ''}
                      </td>
                      {!isRepair && <td className="px-4 py-3 text-sm text-gray-700">{item.ref}</td>}
                      {!isRepair && <td className="px-4 py-3 text-sm text-gray-700">{item.l}</td>}
                      {!isRepair && <td className="px-4 py-3 text-sm text-gray-700">{item.b}</td>}
                      {!isRepair && <td className="px-4 py-3 text-sm text-gray-700">{item.h}</td>}
                      <td className="px-4 py-3 text-sm text-gray-700">{item.qty}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 font-semibold">
                        {item.amount ? `₹${item.amount.toLocaleString()}` : ''}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Add Items Row */}
                  <tr className="bg-amber-50">
                    <td className="px-4 py-3 text-sm font-semibold text-amber-700">{isRepair ? '15' : '16'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-amber-800">Add Items</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    {!isRepair && <td className="px-4 py-3"></td>}
                    {!isRepair && <td className="px-4 py-3">1</td>}
                    {!isRepair && <td className="px-4 py-3">1</td>}
                    {!isRepair && <td className="px-4 py-3">1</td>}
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                  </tr>
                  
                  {/* Total Calculations */}
                  <tr className="bg-blue-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-blue-700">{isRepair ? '16' : '17'}</td>
                    <td className="px-4 py-3 text-sm text-blue-800">Total</td>
                    <td colSpan={isRepair ? 3 : 6} className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-base text-blue-700">₹{calculations.total.toLocaleString()}</td>
                  </tr>
                  
                  <tr className="bg-indigo-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-indigo-700">{isRepair ? '17' : '18'}</td>
                    <td className="px-4 py-3 text-sm text-indigo-800">GST (18%)</td>
                    <td colSpan={isRepair ? 3 : 6} className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-base text-indigo-700">₹{calculations.gst.toLocaleString()}</td>
                  </tr>
                  
                  <tr className="bg-teal-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-teal-700">{isRepair ? '18' : '19'}</td>
                    <td className="px-4 py-3 text-sm text-teal-800">Total (including GST)</td>
                    <td colSpan={isRepair ? 3 : 6} className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-base text-teal-700">₹{calculations.totalWithGST.toLocaleString()}</td>
                  </tr>
                  
                  <tr className="bg-cyan-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-cyan-700">{isRepair ? '19' : '20'}</td>
                    <td className="px-4 py-3 text-sm text-cyan-800">1% Consulting Engineer Fee for Estimation</td>
                    <td colSpan={isRepair ? 3 : 6} className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-base text-cyan-700">₹{calculations.consultingFee.toLocaleString()}</td>
                  </tr>
                  
                  <tr className="bg-emerald-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-emerald-700">{isRepair ? '20' : '21'}</td>
                    <td className="px-4 py-3 text-sm text-emerald-800">1% Consulting Engineer Fee for MB</td>
                    <td colSpan={isRepair ? 3 : 6} className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-base text-emerald-700">₹{calculations.consultingFee.toLocaleString()}</td>
                  </tr>
                  
                  <tr className="bg-green-100 font-bold text-lg border-t-2 border-green-300">
                    <td className="px-4 py-4 text-green-700">{isRepair ? '21' : '22'}</td>
                    <td className="px-4 py-4 text-green-800 flex items-center gap-2">
                      <TrendingUp size={20} />
                      Grand Total
                    </td>
                    <td colSpan={isRepair ? 3 : 6} className="px-4 py-4"></td>
                    <td className="px-4 py-4 text-xl text-green-700">₹{(calculations.grandTotal + calculations.consultingFee).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Professional Design */}
        <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-blue-900 rounded-xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                <FileText size={24} />
              </div>
              View Estimation - Gram Panchayat
            </h1>
            
            {/* Professional Filters */}
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

        {/* Professional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Requisitions</p>
                <p className="text-2xl font-bold mt-1">24</p>
                <p className="text-blue-200 text-xs mt-1">↑ 12% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Repair Estimations</p>
                <p className="text-2xl font-bold mt-1">15</p>
                <p className="text-teal-200 text-xs mt-1">↑ 8% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Wrench size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Rebore Estimations</p>
                <p className="text-2xl font-bold mt-1">9</p>
                <p className="text-emerald-200 text-xs mt-1">↑ 15% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Drill size={24} />
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold mt-1">₹3.2L</p>
                <p className="text-amber-200 text-xs mt-1">↑ 22% this month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Requisitions Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-700 to-slate-700 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText size={20} />
              </div>
              Requisitions Dashboard
            </h2>
            <p className="text-gray-200 mt-2">Manage and view all handpump estimations</p>
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
                    Sanctioned Total
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
                          {new Date(requisition.date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-emerald-600">
                        {requisition.sanctionedTotal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewEstimation(requisition)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <Eye size={16} />
                        View Estimation
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
              <p className="text-lg text-gray-500 font-medium">No requisitions found for the selected filter.</p>
              <p className="text-gray-400 mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEstimationScreen;