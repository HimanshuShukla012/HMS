import React, { useState, useEffect } from 'react';
import { Filter, Search, Calendar, FileText, ClipboardCheck, Eye, Wrench, Drill, MapPin, X, Check, Edit3, Save, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useUserInfo } from '../utils/userInfo';


const MBVisitReportScreen = () => {
  const { userId, role, loading: userLoading, error: userError } = useUserInfo();
  
  const [filterVillage, setFilterVillage] = useState('All');
  const [filterHandpumpId, setFilterHandpumpId] = useState('');
  const [filterRequisitionId, setFilterRequisitionId] = useState('');
  const [showMBModal, setShowMBModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successType, setSuccessType] = useState('');
  const [successId, setSuccessId] = useState('');

  // API state
  const [requisitions, setRequisitions] = useState([]);
  const [mbItems, setMbItems] = useState([]);
  const [materialBookData, setMaterialBookData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Material Book state
  const [mbRemarks, setMbRemarks] = useState({});
  
  // Visit Report state
  const [visitReport, setVisitReport] = useState({
    workAbility: 'good',
    workAbilityRemark: '',
    conditionPlatform: 'good',
    conditionPlatformRemark: '',
    groutingPedestal: 'Firm',
    groutingPedestalRemark: '',
    rustingHandleParts: 'none',
    rustingHandlePartsRemark: '',
    rustingPumpStandHead: 'none',
    rustingPumpStandHeadRemark: '',
    rustingPlungerSetup: 'none',
    rustingPlungerSetupRemark: '',
    rustingCheckValveSetup: 'Good',
    rustingCheckValveSetupRemark: '',
    damageCylinderLiner: 'none',
    damageCylinderLinerRemark: '',
    damageBearingParts: 'none',
    damageBearingPartsRemark: '',
    damageRisingMainPumprods: 'none',
    damageRisingMainPumprodsRemark: '',
    damageRisingMainCentralisers: 'none',
    damageRisingMainCentralisersRemark: '',
    damagedSealingParts: 'Bobbins',
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
    whyPoorPerformance: [],
    whyPoorPerformanceRemark: '',
    overallStatus: 'Good',
    comments: ''
  });

  const API_BASE_URL = 'https://hmsapi.kdsgroup.co.in/api';

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch requisitions on mount
  useEffect(() => {
    if (userId) {
      fetchRequisitions();
    }
  }, [userId]);

  // API: Fetch Requisitions
  const fetchRequisitions = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/HandpumpRequisition/GetRequisitionListByUserId?UserId=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          }
        }
      );

      const data = await response.json();
      
      if (data.Status && data.Data) {
        const completed = data.Data.filter(req => req.OrderId !== null);
        setRequisitions(completed);
      } else {
        setError(data.Message || 'Failed to fetch requisitions');
      }
    } catch (err) {
      console.error('Error fetching requisitions:', err);
      setError('Failed to fetch requisitions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // API: Fetch Material Book Items
  const fetchMBItems = async (requisitionId, orderId, typeId = 1) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/HandpumpRequisition/GetRequisitionItemList?RequisitionId=${requisitionId}&OrderID=${orderId}&TypeId=${typeId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          }
        }
      );

      const data = await response.json();
      
      if (data.Status && data.Data) {
        setMbItems(data.Data);
        const remarksObj = {};
        data.Data.forEach(item => {
          remarksObj[item.ItemId || item.id] = item.Remark || '';
        });
        setMbRemarks(remarksObj);
      } else {
        setMbItems([]);
      }
    } catch (err) {
      console.error('Error fetching MB items:', err);
      setError('Failed to fetch material items');
    } finally {
      setLoading(false);
    }
  };

  // API: Fetch Material Book PDF
  const fetchMaterialBook = async () => {
    if (!userId) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/HandpumpRequisition/GetMaterialBookByUserId?userId=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          }
        }
      );

      const data = await response.json();
      
      if (data.Status && data.Data) {
        setMaterialBookData(data.Data);
      }
    } catch (err) {
      console.error('Error fetching material book:', err);
    }
  };

  const handleViewMaterialBook = () => {
    if (materialBookData?.MaterialImgFile) {
      window.open(materialBookData.MaterialImgFile, '_blank');
    }
  };

  const handleCreateMB = async (requisition) => {
    setSelectedRequisition(requisition);
    setShowMBModal(true);
    await fetchMBItems(requisition.RequisitionId, requisition.OrderId);
    await fetchMaterialBook();
  };

  const handleCreateVisitReport = (requisition) => {
    setSelectedRequisition(requisition);
    setShowVisitModal(true);
    setVisitReport({
      workAbility: 'good',
      workAbilityRemark: '',
      conditionPlatform: 'good',
      conditionPlatformRemark: '',
      groutingPedestal: 'Firm',
      groutingPedestalRemark: '',
      rustingHandleParts: 'none',
      rustingHandlePartsRemark: '',
      rustingPumpStandHead: 'none',
      rustingPumpStandHeadRemark: '',
      rustingPlungerSetup: 'none',
      rustingPlungerSetupRemark: '',
      rustingCheckValveSetup: 'Good',
      rustingCheckValveSetupRemark: '',
      damageCylinderLiner: 'none',
      damageCylinderLinerRemark: '',
      damageBearingParts: 'none',
      damageBearingPartsRemark: '',
      damageRisingMainPumprods: 'none',
      damageRisingMainPumprodsRemark: '',
      damageRisingMainCentralisers: 'none',
      damageRisingMainCentralisersRemark: '',
      damagedSealingParts: 'Bobbins',
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
      whyPoorPerformance: [],
      whyPoorPerformanceRemark: '',
      overallStatus: 'Good',
      comments: ''
    });
  };

  // API: Submit MB Remarks
  const handleMBSubmit = async () => {
    if (!selectedRequisition || !userId) return;

    setLoading(true);
    try {
      const token = getAuthToken();
      
      const items = Object.entries(mbRemarks).map(([itemId, remark]) => ({
        ItemId: Number(itemId),
        Remark: remark || ''
      }));

      const payload = {
        RequisitionId: selectedRequisition.RequisitionId,
        UserId: userId,
        ConsultiveEngId: userId,
        Items: items
      };

      const response = await fetch(
        `${API_BASE_URL}/HandpumpRequisition/UpdateMbItemsRemark`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*'
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();
      
      if (data.Status) {
        setSuccessId(`MB${selectedRequisition.RequisitionId}`);
        setSuccessType('Material Book');
        setShowMBModal(false);
        setShowSuccessModal(true);
        await fetchRequisitions();
      } else {
        alert(data.Message || 'Failed to submit material book');
      }
    } catch (err) {
      console.error('Error submitting MB:', err);
      alert('Failed to submit material book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // API: Submit Visit Report
  const handleVisitReportSubmit = async () => {
    if (!selectedRequisition || !userId) return;

    setLoading(true);
    try {
      const token = getAuthToken();
      
      const payload = {
        Id: 0,
        RequisitionId: selectedRequisition.RequisitionId,
        UserId: userId,
        HandpumpId: selectedRequisition.HPId,
        RecordingPerson: "Consulting Engineer",
        VisitDate: new Date().toISOString(),
        WorkAbility: visitReport.workAbility,
        WorkAbilityRemarks: visitReport.workAbilityRemark,
        PlatformCondition: visitReport.conditionPlatform,
        PlatformRemarks: visitReport.conditionPlatformRemark,
        PedestalGrouting: visitReport.groutingPedestal,
        PedestalRemarks: visitReport.groutingPedestalRemark,
        Strokes12LBucket: Number(visitReport.strokesToFill) || 0,
        StrokesRemarks: visitReport.strokesToFillRemark,
        NoOfBreakdowns: Number(visitReport.breakdownsTillDate) || 0,
        BreakdownsRemarks: visitReport.breakdownsTillDateRemark,
        RustingHandle: visitReport.rustingHandleParts,
        RustingHandleRemarks: visitReport.rustingHandlePartsRemark,
        PoorPerformanceReason: Array.isArray(visitReport.whyPoorPerformance) 
          ? visitReport.whyPoorPerformance 
          : [],
        PoorPerformanceRemarks: visitReport.whyPoorPerformanceRemark,
        RustingPumpStand: visitReport.rustingPumpStandHead,
        RustingPumpStandRemarks: visitReport.rustingPumpStandHeadRemark,
        RustingPlunger: visitReport.rustingPlungerSetup,
        RustingPlungerRemarks: visitReport.rustingPlungerSetupRemark,
        CheckValveCondition: visitReport.rustingCheckValveSetup,
        CheckValveRemarks: visitReport.rustingCheckValveSetupRemark,
        CylinderLinerDamage: visitReport.damageCylinderLiner,
        CylinderLinerRemarks: visitReport.damageCylinderLinerRemark,
        BearingDamage: visitReport.damageBearingParts,
        BearingDamageRemarks: visitReport.damageBearingPartsRemark,
        RisingMainPumprodsDamage: visitReport.damageRisingMainPumprods,
        RisingMainPumprodsRemarks: visitReport.damageRisingMainPumprodsRemark,
        RisingMainCentralisersDamage: visitReport.damageRisingMainCentralisers,
        RisingMainCentralisersRemarks: visitReport.damageRisingMainCentralisersRemark,
        SealingPartsDamage: [visitReport.damagedSealingParts],
        SealingPartsRemarks: visitReport.damagedSealingPartsRemark,
        PreventiveMaintenanceDone: visitReport.preventiveMaintenance,
        PreventiveMaintenanceRemarks: visitReport.preventiveMaintenanceRemark,
        TechAssistanceAvailable: visitReport.techMechAssistance,
        TechAssistanceRemarks: visitReport.techMechAssistanceRemark,
        MaintenanceSatisfying: visitReport.maintenanceSystemSatisfying,
        MaintenanceRemarks: visitReport.maintenanceSystemSatisfyingRemark,
        AdditionalComments: visitReport.comments,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        Overall_Status: visitReport.overallStatus
      };

      const response = await fetch(
        `${API_BASE_URL}/HandpumpRequisition/InsertHandpumpVisitMonitoring`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*'
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();
      
      if (data.Status) {
        setSuccessId(`VR${data.Data || selectedRequisition.RequisitionId}`);
        setSuccessType('Visit Report');
        setShowVisitModal(false);
        setShowSuccessModal(true);
        await fetchRequisitions();
      } else {
        alert(data.Message || 'Failed to submit visit report');
      }
    } catch (err) {
      console.error('Error submitting visit report:', err);
      alert('Failed to submit visit report. Please try again.');
    } finally {
      setLoading(false);
    }
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
    return mbItems.reduce((total, item) => total + (Number(item.Amount) || 0), 0);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-IN');
  };

  const villages = ['All', ...new Set(requisitions.map(r => r.VillageName))];

  const filteredRequisitions = requisitions.filter(req => {
    return (
      (filterVillage === 'All' || req.VillageName === filterVillage) &&
      (filterHandpumpId === '' || req.HandpumpId?.toLowerCase().includes(filterHandpumpId.toLowerCase())) &&
      (filterRequisitionId === '' || req.RequisitionId?.toString().includes(filterRequisitionId))
    );
  });

  if (userLoading || (loading && requisitions.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Error</h3>
          <p className="text-gray-600 text-center mb-4">{userError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                <FileText size={24} />
              </div>
              Material Book & Visit Report - Consulting Engineer
            </h1>
            
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
                <p className="text-2xl font-bold mt-1">{requisitions.length}</p>
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
                <p className="text-2xl font-bold mt-1">{requisitions.filter(r => r.TotalMBAmount).length}</p>
                <p className="text-emerald-200 text-xs mt-1">With material books</p>
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
                <p className="text-2xl font-bold mt-1">-</p>
                <p className="text-purple-200 text-xs mt-1">Reports submitted</p>
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
                <p className="text-2xl font-bold mt-1">{requisitions.filter(r => !r.TotalMBAmount).length}</p>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Sanction Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Sanction Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequisitions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No completed requisitions found
                    </td>
                  </tr>
                ) : (
                  filteredRequisitions.map((requisition, index) => (
                    <tr key={requisition.RequisitionId} className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-50 transition-colors duration-300`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-lg font-semibold text-gray-900">{requisition.RequisitionId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-medium text-slate-700">{requisition.HandpumpId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-500" />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{requisition.VillageName}</div>
                            <div className="text-gray-500">{requisition.GrampanchayatName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md ${
                          requisition.RequisitionType === 'REPAIR' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {requisition.RequisitionType === 'REPAIR' ? <Wrench size={14} /> : <Drill size={14} />}
                          {requisition.RequisitionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {requisition.SanctionDateStr || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-emerald-600">
                          ₹{requisition.SanctionAmount?.toLocaleString('en-IN') || '-'}
                        </span>
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
                  ))
                )}
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
                    <p className="text-purple-100">Requisition: {selectedRequisition.RequisitionId} - {selectedRequisition.HandpumpId}</p>
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
              {materialBookData?.MaterialImgFile && (
                <div className="mb-6">
                  <button
                    onClick={handleViewMaterialBook}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={18} />
                    View Uploaded Material Book PDF
                  </button>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Project Details</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500">Handpump ID:</span> <span className="font-medium">{selectedRequisition.HandpumpId}</span></div>
                  <div><span className="text-gray-500">Village:</span> <span className="font-medium">{selectedRequisition.VillageName}</span></div>
                  <div><span className="text-gray-500">Mode:</span> <span className="font-medium">{selectedRequisition.RequisitionType}</span></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-4">
                  <h4 className="text-lg font-bold">Material Book - Items Used</h4>
                </div>
                {loading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                    <p className="text-gray-600">Loading items...</p>
                  </div>
                ) : mbItems.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No items found for this requisition
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-purple-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">S.No</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Item Description</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Unit</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Rate (₹)</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Amount (₹)</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase min-w-[200px]">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {mbItems.map((item, index) => {
                          const itemId = item.ItemId || item.id;
                          return (
                            <tr key={itemId} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-semibold text-purple-600">{index + 1}</td>
                              <td className="px-4 py-3 text-sm text-gray-800">{item.ItemName || item.name || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{item.Unit || item.unit || '-'}</td>
                              <td className="px-4 py-3 text-sm text-green-600 font-semibold">{item.Quantity || item.quantity || '-'}</td>
                              <td className="px-4 py-3 text-sm text-emerald-600 font-semibold">₹{item.Rate || item.rate || 0}</td>
                              <td className="px-4 py-3 text-sm text-slate-700 font-semibold">₹{item.Amount || item.amount || 0}</td>
                              <td className="px-4 py-3">
                                <textarea
                                  value={mbRemarks[itemId] || ''}
                                  onChange={(e) => updateMBRemark(itemId, e.target.value)}
                                  placeholder="Add remarks for this item..."
                                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                  rows="2"
                                />
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-purple-100 font-bold">
                          <td colSpan="5" className="px-4 py-3 text-purple-800 text-right">Total Amount:</td>
                          <td className="px-4 py-3 text-lg text-purple-700">₹{getTotalMBAmount().toLocaleString('en-IN')}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleMBSubmit}
                  disabled={loading || mbItems.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Submit Material Book
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visit Report Modal - Continuing from where we left off */}
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
                    <p className="text-teal-100">India Mark II Handpump - {selectedRequisition.HandpumpId}</p>
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
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 mb-6 border border-teal-200">
                <h4 className="text-sm font-semibold text-teal-700 mb-3">Monitoring Details</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-teal-600 font-medium">Handpump ID:</span> <span className="font-semibold">{selectedRequisition.HandpumpId}</span></div>
                  <div><span className="text-teal-600 font-medium">Village:</span> <span className="font-semibold">{selectedRequisition.VillageName}</span></div>
                  <div><span className="text-teal-600 font-medium">Gram Panchayat:</span> <span className="font-semibold">{selectedRequisition.GrampanchayatName}</span></div>
                  <div><span className="text-teal-600 font-medium">Recording Person:</span> <span className="font-semibold">Consulting Engineer</span></div>
                  <div><span className="text-teal-600 font-medium">Date:</span> <span className="font-semibold">{getCurrentDate()}</span></div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Work Ability */}
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
                            checked={Array.isArray(visitReport.whyPoorPerformance) 
                              ? visitReport.whyPoorPerformance.includes(option)
                              : false}
                            onChange={(e) => {
                              const current = Array.isArray(visitReport.whyPoorPerformance) 
                                ? visitReport.whyPoorPerformance 
                                : [];
                              if (e.target.checked) {
                                updateVisitReport('whyPoorPerformance', [...current, option]);
                              } else {
                                updateVisitReport('whyPoorPerformance', current.filter(item => item !== option));
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
                        <span className="ml-2 text-sm font-medium text-gray-700">{option}</span>
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

                {/* Overall Status */}
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border-2 border-teal-300 p-6">
                  <label className="block text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                      <Check size={18} className="text-white" />
                    </div>
                    Overall Status of Handpump
                  </label>
                  <div className="flex flex-wrap gap-6 mb-3">
                    {['Good', 'Fair', 'Poor', 'Not Working'].map(option => (
                      <label key={option} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="overallStatus"
                          value={option}
                          checked={visitReport.overallStatus === option}
                          onChange={(e) => updateVisitReport('overallStatus', e.target.value)}
                          className="w-5 h-5 text-teal-600 focus:ring-teal-500 focus:ring-2"
                        />
                        <span className={`ml-3 text-base font-semibold ${
                          visitReport.overallStatus === option 
                            ? 'text-teal-800' 
                            : 'text-gray-700'
                        }`}>{option}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-teal-700 mt-2">
                    * This represents the overall assessment of the handpump condition after the visit
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={handleVisitReportSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Submit Visit Report
                    </>
                  )}
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
                    <span className="ml-2 font-semibold">{selectedRequisition?.RequisitionId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Handpump:</span>
                    <span className="ml-2 font-semibold">{selectedRequisition?.HandpumpId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Village:</span>
                    <span className="ml-2 font-semibold">{selectedRequisition?.VillageName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-semibold">{getCurrentDate()}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setSelectedRequisition(null);
                }}
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

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-slide-in">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-2 hover:bg-red-600 rounded p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MBVisitReportScreen;