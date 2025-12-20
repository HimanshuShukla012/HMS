import React, { useState, useEffect } from 'react';
import { Filter, Search, Download, Calendar, FileText, Wrench, Drill, X, AlertCircle, CheckCircle, Clock, TrendingUp, Loader, Eye, Edit3, Save, Loader2, ExternalLink, ClipboardCheck, Check } from 'lucide-react';
import { useUserInfo } from '../utils/userInfo';
import { useJurisdiction } from '../utils/useJurisdiction';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSearchData } from '../components/SearchDataContext';



const ViewClosureUpdatesScreen = () => {
  const { userId, role, loading: userLoading, error: userError } = useUserInfo();
  const { jurisdiction, loading: jurisdictionLoading, error: jurisdictionError } = useJurisdiction(userId);
  const [filterClosureStatus, setFilterClosureStatus] = useState('All');
  const [filterVerificationResult, setFilterVerificationResult] = useState('All');
  const [filterVillage, setFilterVillage] = useState('All');
  const [filterHandpumpId, setFilterHandpumpId] = useState('');
  const [filterRequisitionId, setFilterRequisitionId] = useState('');
  const [showMaterialBookModal, setShowMaterialBookModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [closureUpdates, setClosureUpdates] = useState([]);
  const { setRequisitions: setGlobalRequisitions } = useSearchData(); // Add this

  const [rawApiData, setRawApiData] = useState([]);
  const [materialBookData, setMaterialBookData] = useState(null);
  const [visitMonitoringData, setVisitMonitoringData] = useState(null);
  const [viewMBData, setViewMBData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [districts, setDistricts] = useState<Array<{DistrictId: number, DistrictName: string}>>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<Array<{BlockId: number, DistrictId: number, BlockName: string}>>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [gramPanchayats, setGramPanchayats] = useState<Array<{Id: number, BlockId: number, GramPanchayatName: string}>>([]);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);
  const [villages, setVillages] = useState<Array<{Id: number, VillageName: string}>>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);
const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);
const [showRequisitionDetailModal, setShowRequisitionDetailModal] = useState(false);
const [requisitionDetail, setRequisitionDetail] = useState(null);

  const API_BASE = 'https://hmsapi.kdsgroup.co.in/api';

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

  useEffect(() => {
  console.log('Debug - userId:', userId);
  console.log('Debug - userLoading:', userLoading);
  console.log('Debug - jurisdiction:', jurisdiction);
  console.log('Debug - jurisdictionLoading:', jurisdictionLoading);
}, [userId, userLoading, jurisdiction, jurisdictionLoading]);

  useEffect(() => {
  if (userId && getAuthToken() && jurisdiction && !userLoading && !jurisdictionLoading) {
      // Auto-populate based on jurisdiction
      if (jurisdiction.districtId) {
        setDistricts([{
          DistrictId: jurisdiction.districtId,
          DistrictName: jurisdiction.districtName || ''
        }]);
        setSelectedDistrictId(jurisdiction.districtId);
      } else {
        fetchDistricts();
      }
      
      fetchRequisitionList();
    }
  }, [userId, jurisdiction]);

  // Update blocks based on jurisdiction
  useEffect(() => {
    if (selectedDistrictId && userId) {
      if (jurisdiction?.blockId) {
        // Auto-populate block for ADO
        setBlocks([{
          BlockId: jurisdiction.blockId,
          DistrictId: jurisdiction.districtId!,
          BlockName: jurisdiction.blockName || ''
        }]);
        setSelectedBlockId(jurisdiction.blockId);
      } else {
        fetchBlocks(selectedDistrictId);
      }
    } else {
      setBlocks([]);
      setSelectedBlockId(null);
    }
  }, [selectedDistrictId, userId, jurisdiction]);

  // Update gram panchayats based on jurisdiction
  useEffect(() => {
    if (selectedBlockId && userId) {
      if (jurisdiction?.gramPanchayatId) {
        // Auto-populate GP for GP Sachiv
        setGramPanchayats([{
          Id: jurisdiction.gramPanchayatId,
          BlockId: jurisdiction.blockId!,
          GramPanchayatName: jurisdiction.gramPanchayatName || ''
        }]);
        setSelectedGramPanchayatId(jurisdiction.gramPanchayatId);
      } else {
        fetchGramPanchayats(selectedBlockId);
      }
    } else {
      setGramPanchayats([]);
      setSelectedGramPanchayatId(null);
    }
  }, [selectedBlockId, userId, jurisdiction]);

  // Update villages
  useEffect(() => {
    if (selectedBlockId && selectedGramPanchayatId) {
      fetchVillages(selectedBlockId, selectedGramPanchayatId);
    } else {
      setVillages([]);
      setSelectedVillageId(null);
    }
  }, [selectedBlockId, selectedGramPanchayatId]);


const handleViewRequisitionDetail = (update) => {
  // Find the original API data
  const originalData = rawApiData.find(item => item.RequisitionId === update.requisitionId && item.OrderId === update.orderId);
  
  if (originalData) {
    setRequisitionDetail(originalData);
    setShowRequisitionDetailModal(true);
  } else {
    // Fallback if original data not found
    setError('Could not load requisition details');
  }
};

  const downloadExcel = () => {
  const worksheetData = filteredUpdates.map((update, index) => ({
    'S.No': index + 1,
    'Requisition ID': update.id,
    'Handpump ID': update.handpumpId,
    'Village': update.village,
    'District': update.district,
    'Block': update.block,
    'Gram Panchayat': update.gramPanchayat,
    'Date of Requisition': new Date(update.requisitionDate).toLocaleDateString('en-IN'),
    'Mode': update.mode,
    'Date of Completion': update.completionDate,
    'MB Status': update.mbStatus,
    'Verification Result': update.verificationResult,
    'Escalation': update.escalation,
    'Closure Status': update.closureStatus,
    'Estimated Amount': `₹${update.estimatedAmount}`,
    'Actual Amount': `₹${update.actualAmount}`
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Closure Updates');
  
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Closure_Updates_${date}.xlsx`);
};

const downloadPDF = () => {
  const doc = new jsPDF('l', 'mm', 'a4');
  
  doc.setFontSize(16);
  doc.text('Closure Updates Report', 14, 15);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 22);
  doc.text(`Total Records: ${filteredUpdates.length}`, 14, 28);
  
  const tableData = filteredUpdates.map((update, index) => [
    index + 1,
    update.id,
    update.handpumpId,
    update.village,
    new Date(update.requisitionDate).toLocaleDateString('en-IN'),
    update.mode,
    update.mbStatus,
    update.verificationResult,
    update.closureStatus
  ]);
  
  autoTable(doc, {
    head: [['S.No', 'Req ID', 'HP ID', 'Village', 'Req Date', 'Mode', 'MB Status', 'Verification', 'Status']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [71, 85, 105] }
  });
  
  const date = new Date().toISOString().split('T')[0];
  doc.save(`Closure_Updates_${date}.pdf`);
};


  const fetchRequisitionList = async () => {
  // Validation checks
  if (!userId) {
    console.error('Cannot fetch requisitions: userId is undefined');
    setError('User ID is not available');
    setLoading(false);
    return;
  }

  const authToken = getAuthToken();
  if (!authToken) {
    console.error('Cannot fetch requisitions: auth token is missing');
    setError('Authentication token not found. Please login again.');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError(null);

    console.log('Fetching requisitions for userId:', userId); // Debug log

    const response = await fetch(
      `${API_BASE}/HandpumpRequisition/GetRequisitionListByUserId?UserId=${userId}`,
      {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch requisitions: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.Status && result.Data) {
        // Transform API data with correct status logic
        const transformedData = result.Data.map(item => {
          // Status Determination Logic
          const hasOrder = item.OrderId !== null && item.OrderId !== undefined;
          const hasTotalMBAmount = item.TotalMBAmount !== null && item.TotalMBAmount !== undefined && item.TotalMBAmount > 0;
          const hasMaterialBook = item.CEStatus === 1;
          const hasVisitMonitoring = item.VisitMonitoringId !== null && item.VisitMonitoringId !== undefined;
          
          // MB Status
          let mbStatus = 'Pending';
          if (hasMaterialBook) {
            mbStatus = 'Complete';
          }
          
          // Verification Result (Visit Monitoring)
          let verificationResult = 'Pending';
          if (hasVisitMonitoring) {
            verificationResult = 'Satisfactory'; // Can be enhanced with actual verification status from API
          }
          
          // Escalation
          let escalation = 'Pending';
          if (hasVisitMonitoring) {
            escalation = 'No Escalation';
          }
          
          // Closure Status Logic
          let closureStatus = 'Pending at CE Level';
          
          if (!hasOrder) {
            closureStatus = 'Pending at CE Level';
          } else if (hasOrder && !hasTotalMBAmount) {
            closureStatus = 'Pending for Completion';
          } else if (hasTotalMBAmount && !hasMaterialBook) {
            closureStatus = 'Pending for MB';
          } else if (hasTotalMBAmount && hasMaterialBook && !hasVisitMonitoring) {
            closureStatus = 'Pending for Visit Monitoring Report';
          } else if (hasMaterialBook && hasVisitMonitoring) {
            closureStatus = 'Completed';
          }
          
          return {
            id: `REQ${item.RequisitionId.toString().padStart(3, '0')}`,
            uniqueKey: `${item.RequisitionId}-${item.OrderId || 'pending'}`,
            requisitionId: item.RequisitionId,
            handpumpId: item.HandpumpId,
            hpId: item.HPId,
            village: item.VillageName,
            district: item.DistrictName || 'N/A',
            block: item.BlockName || 'N/A',
            gramPanchayat: item.GrampanchayatName || 'N/A',
            requisitionDate: item.RequisitionDate,
            mode: item.RequisitionType,
            completionDate: item.CompletionDateStr || 'N/A',
            mbStatus: mbStatus,
            verificationResult: verificationResult,
            escalation: escalation,
            closureStatus: closureStatus,
            estimatedAmount: item.SanctionAmount || 0,
            actualAmount: item.TotalMBAmount || 0,
            orderId: item.OrderId,
            ceStatus: item.CEStatus,
            visitMonitoringId: item.VisitMonitoringId
          };
        });
        setRawApiData(result.Data); // Store raw API data
        setClosureUpdates(transformedData);
        setGlobalRequisitions(result.Data); // Add this line - use raw data

      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching requisition list:', err);
      setError(err.message || 'Failed to fetch closure updates');
      setLoading(false);
    }
  };

  const fetchMaterialBook = async () => {
  if (!userId) {
    console.error('Cannot fetch material book: userId is undefined');
    return;
  }
  
  if (!getAuthToken()) {
    console.error('Cannot fetch material book: auth token is missing');
    return;
  }
  
  try {
    const token = getAuthToken();
      if (!userId) {
  throw new Error('User ID is not available');
}

const response = await fetch(
  `${API_BASE}/HandpumpRequisition/GetRequisitionListByUserId?UserId=${userId}`,
  {
    headers: {
      'accept': '*/*',
      'Authorization': `Bearer ${authToken}`
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

  const fetchSubmittedMB = async (requisitionId, orderId) => {
    if (!requisitionId) {
    setError('Requisition ID is required');
    return;
  }
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE}/HandpumpRequisition/GetRequisitionItemList?RequisitionId=${requisitionId}&OrderID=${orderId}&TypeId=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          }
        }
      );

      const data = await response.json();
      
      if (data.Status && data.Data) {
        setViewMBData(data.Data);
      } else {
        setViewMBData([]);
      }
    } catch (err) {
      console.error('Error fetching submitted MB:', err);
      setError('Failed to fetch material book details');
      setViewMBData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedVisitReport = async (requisitionId) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE}/HandpumpRequisition/GetVisitMonitoringListByUserId?requisitionId=${requisitionId}&userId=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          }
        }
      );

      const data = await response.json();
      
      if (data.Status && data.Data && data.Data.length > 0) {
        setVisitMonitoringData(data.Data[0]);
      } else {
        setVisitMonitoringData(null);
      }
    } catch (err) {
      console.error('Error fetching visit report:', err);
      setError('Failed to fetch visit report details');
      setVisitMonitoringData(null);
    } finally {
      setLoading(false);
    }
  };

  const closureStatusOptions = ['All', 'Pending at CE Level', 'Completed', 'On-Hold'];
  const verificationOptions = ['All', 'Satisfactory', 'Not Satisfactory', 'Pending'];

  // Fetch districts from API
  const fetchDistricts = async () => {
    if (!userId || !getAuthToken()) return;
    
    // If user has a specific district (not Admin), don't fetch all districts
    if (jurisdiction?.districtId) {
      return; // Already set in useEffect
    }
    
    try {
      const response = await fetch(
        `${API_BASE}/Master/GetDistrictByUserId?UserId=${userId}`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.Status && data.Data && data.Data.length > 0) {
        const transformedDistricts = data.Data.map((d: any) => ({
          DistrictId: d.Id || d.DistrictId,
          DistrictName: d.DistrictName || d.Name
        }));
        setDistricts(transformedDistricts);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  // Fetch blocks from API
  const fetchBlocks = async (districtId: number) => {
    if (!userId || !getAuthToken()) return;
    
    try {
      const response = await fetch(
        `${API_BASE}/Master/GetBlockListByDistrict`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({ Id: districtId })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.Status && data.Data && data.Data.length > 0) {
        const transformedBlocks = data.Data.map((b: any) => ({
          BlockId: b.Id || b.BlockId,
          DistrictId: b.DistrictId,
          BlockName: b.BlockName || b.Name
        }));
        setBlocks(transformedBlocks);
      } else {
        setBlocks([]);
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
      setBlocks([]);
    }
  };

  // Fetch gram panchayats from API
  const fetchGramPanchayats = async (blockId: number) => {
    if (!userId || !getAuthToken()) return;
    
    try {
      const response = await fetch(
        `${API_BASE}/Master/GetGramPanchayatByBlock`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({ Id: blockId })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.Status && data.Data && data.Data.length > 0) {
        setGramPanchayats(data.Data);
      } else {
        setGramPanchayats([]);
      }
    } catch (error) {
      console.error('Error fetching gram panchayats:', error);
      setGramPanchayats([]);
    }
  };

  // Fetch villages from API
  const fetchVillages = async (blockId: number, gramPanchayatId: number) => {
    if (!getAuthToken()) return;
    
    try {
      const response = await fetch(
        `${API_BASE}/Master/GetVillegeByGramPanchayat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({ Id: gramPanchayatId })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.Status && data.Data && data.Data.length > 0) {
        setVillages(data.Data);
      } else {
        setVillages([]);
      }
    } catch (error) {
      console.error('Error fetching villages:', error);
      setVillages([]);
    }
  };

  const filteredUpdates = closureUpdates.filter(update => {
  const matchesStatus = filterClosureStatus === 'All' || update.closureStatus === filterClosureStatus;
  const matchesVerification = filterVerificationResult === 'All' || update.verificationResult === filterVerificationResult;
  const matchesHandpumpId = filterHandpumpId === '' || update.handpumpId.toLowerCase().includes(filterHandpumpId.toLowerCase());
  const matchesRequisitionId = filterRequisitionId === '' || update.id.toLowerCase().includes(filterRequisitionId.toLowerCase());
  
  // Location filtering
  const matchesDistrict = !selectedDistrictId || 
    update.district === districts.find(d => d.DistrictId === selectedDistrictId)?.DistrictName;
  const matchesBlock = !selectedBlockId || 
    update.block === blocks.find(b => b.BlockId === selectedBlockId)?.BlockName;
  const matchesGramPanchayat = !selectedGramPanchayatId || 
    update.gramPanchayat === gramPanchayats.find(gp => gp.Id === selectedGramPanchayatId)?.GramPanchayatName;
  const matchesVillage = !selectedVillageId || 
    update.village === villages.find(v => v.Id === selectedVillageId)?.VillageName;
  
  // Stat card filter
  let matchesStatFilter = true;
  if (activeStatFilter === 'completed') {
    matchesStatFilter = update.closureStatus === 'Completed';
  } else if (activeStatFilter === 'pendingCE') {
    matchesStatFilter = update.closureStatus === 'Pending at CE Level';
  } else if (activeStatFilter === 'onHold') {
    matchesStatFilter = update.closureStatus === 'On-Hold';
  } else if (activeStatFilter === 'total') {
    matchesStatFilter = true; // Show all records
  }
  
  return matchesStatus && matchesVerification && matchesHandpumpId && matchesRequisitionId &&
         matchesDistrict && matchesBlock && matchesGramPanchayat && matchesVillage && matchesStatFilter;
});
const indexOfLastRow = currentPage * rowsPerPage;
const indexOfFirstRow = indexOfLastRow - rowsPerPage;
const currentRows = filteredUpdates.slice(indexOfFirstRow, indexOfLastRow);
const totalPages = Math.ceil(filteredUpdates.length / rowsPerPage);

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

  const handleViewMaterialBook = async (record) => {
    setSelectedRecord(record);
    await fetchSubmittedMB(record.requisitionId, record.orderId);
    await fetchMaterialBook();
    setShowMaterialBookModal(true);
  };

  const handleViewVerificationForm = async (record) => {
    setSelectedRecord(record);
    await fetchSubmittedVisitReport(record.requisitionId);
    setShowVerificationModal(true);
  };

  const handleViewMaterialBookPDF = () => {
    if (materialBookData?.MaterialImgFile) {
      window.open(materialBookData.MaterialImgFile, '_blank');
    }
  };

  const getTotalMBAmount = () => {
    return viewMBData.reduce((total, item) => total + (Number(item.Amount) || 0), 0);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-IN');
  };

  // Calculate stats
  const stats = {
    completed: closureUpdates.filter(u => u.closureStatus === 'Completed').length,
    pendingCE: closureUpdates.filter(u => u.closureStatus === 'Pending at CE Level').length,
    onHold: closureUpdates.filter(u => u.closureStatus === 'On-Hold').length,
    total: closureUpdates.length
  };

  // Show loading state
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading closure updates...</p>
        </div>
      </div>
    );
  }

  // Show error state
  // Show error state only for critical user loading errors
if (userError) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
        <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading User Data</h2>
        <p className="text-gray-600 mb-4">{userError}</p>
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

// Don't show error for jurisdiction issues - let the app continue
// Only show error for requisition list loading failures
if (error && !loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
        <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchRequisitionList();
          }}
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
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              View Closure Updates - Gram Panchayat
            </h1>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* District Filter */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={selectedDistrictId || ""}
                  onChange={(e) => {
                    setSelectedDistrictId(Number(e.target.value) || null);
                    setSelectedBlockId(null);
                    setSelectedGramPanchayatId(null);
                    setSelectedVillageId(null);
                  }}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                  disabled={loading || jurisdictionLoading || !!jurisdiction?.districtId}
                >
                  <option value="" className="text-gray-800">All Districts</option>
                  {districts.map((d) => (
                    <option key={d.DistrictId} value={d.DistrictId} className="text-gray-800">
                      {d.DistrictName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Block Filter */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={selectedBlockId || ""}
                  onChange={(e) => {
                    setSelectedBlockId(Number(e.target.value) || null);
                    setSelectedGramPanchayatId(null);
                    setSelectedVillageId(null);
                  }}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                  disabled={loading || jurisdictionLoading || !!jurisdiction?.blockId}
                >
                  <option value="" className="text-gray-800">All Blocks</option>
                  {blocks.map((b) => (
                    <option key={b.BlockId} value={b.BlockId} className="text-gray-800">
                      {b.BlockName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gram Panchayat Filter */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={selectedGramPanchayatId || ""}
                  onChange={(e) => {
                    setSelectedGramPanchayatId(Number(e.target.value) || null);
                    setSelectedVillageId(null);
                  }}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                  disabled={loading || jurisdictionLoading || !!jurisdiction?.gramPanchayatId}
                >
                  <option value="" className="text-gray-800">All Gram Panchayats</option>
                  {gramPanchayats.map((gp) => (
                    <option key={gp.Id} value={gp.Id} className="text-gray-800">
                      {gp.GramPanchayatName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Village Filter */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={selectedVillageId || ""}
                  onChange={(e) => setSelectedVillageId(Number(e.target.value) || null)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                  disabled={loading}
                >
                  <option value="" className="text-gray-800">All Villages</option>
                  {villages.map((v) => (
                    <option key={v.Id} value={v.Id} className="text-gray-800">
                      {v.VillageName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Filter size={18} className="text-white" />
                <select
                  value={filterClosureStatus}
                  onChange={(e) => setFilterClosureStatus(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1 text-sm"
                  disabled={loading}
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
                  disabled={loading}
                >
                  {verificationOptions.map(option => (
                    <option key={option} value={option} className="text-gray-800">{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Row */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 flex-1">
                <Search size={18} className="text-white" />
                <input
                  type="text"
                  placeholder="Search by Handpump ID"
                  value={filterHandpumpId}
                  onChange={(e) => setFilterHandpumpId(e.target.value)}
                  className="bg-transparent text-white placeholder-white/70 focus:outline-none flex-1"
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 flex-1">
                <Search size={18} className="text-white" />
                <input
                  type="text"
                  placeholder="Search by Requisition ID"
                  value={filterRequisitionId}
                  onChange={(e) => setFilterRequisitionId(e.target.value)}
                  className="bg-transparent text-white placeholder-white/70 focus:outline-none flex-1"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
         
          <div 
  onClick={() => setActiveStatFilter(activeStatFilter === 'total' ? null : 'total')}
  className={`group bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer ${
    activeStatFilter === 'total' ? 'ring-4 ring-blue-300' : ''
  }`}
>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Requisitions</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
                <p className="text-blue-200 text-xs mt-1">All requisitions</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
          
          <div 
  onClick={() => setActiveStatFilter(activeStatFilter === 'completed' ? null : 'completed')}
  className={`group bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer ${
    activeStatFilter === 'completed' ? 'ring-4 ring-green-300' : ''
  }`}
>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold mt-1">{stats.completed}</p>
                <p className="text-green-200 text-xs mt-1">Closures finalized</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
          
          <div 
  onClick={() => setActiveStatFilter(activeStatFilter === 'pendingCE' ? null : 'pendingCE')}
  className={`group bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer ${
    activeStatFilter === 'pendingCE' ? 'ring-4 ring-amber-300' : ''
  }`}
>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending at CE Level</p>
                <p className="text-2xl font-bold mt-1">{stats.pendingCE}</p>
                <p className="text-amber-200 text-xs mt-1">Awaiting verification</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock size={24} />
              </div>
            </div>
          </div>
          
          <div 
  onClick={() => setActiveStatFilter(activeStatFilter === 'onHold' ? null : 'onHold')}
  className={`group bg-gradient-to-br from-red-600 to-rose-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer ${
    activeStatFilter === 'onHold' ? 'ring-4 ring-red-300' : ''
  }`}
>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">On-Hold</p>
                <p className="text-2xl font-bold mt-1">{stats.onHold}</p>
                <p className="text-red-200 text-xs mt-1">Issues identified</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>
          
          
        </div>

        {/* Closure Updates Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-700 to-slate-700 p-6 text-white">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-2xl font-bold flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <CheckCircle size={20} />
        </div>
        Closure Updates Dashboard
      </h2>
      <p className="text-gray-200 mt-2">Monitor closure status and verification results</p>
    </div>
    <div className="flex gap-3">
      <button
        onClick={downloadExcel}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
      >
        <Download size={18} />
        Download Excel
      </button>
      <button
        onClick={downloadPDF}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
      >
        <Download size={18} />
        Download PDF
      </button>
    </div>
  </div>
</div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
      S.No
    </th>
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
                {currentRows.map((update, index) => (
  <tr key={update.uniqueKey} className={`${
    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
  } hover:bg-blue-50 transition-colors duration-300`}>
    <td className="px-4 py-4 whitespace-nowrap">
      <span className="text-sm font-semibold text-gray-700">{indexOfFirstRow + index + 1}</span>
    </td>
    <td className="px-4 py-4 whitespace-nowrap">
  <div className="flex items-center">
    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
    <button
  onClick={() => handleViewRequisitionDetail(update)}
  className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
>
  {update.id}
</button>
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
                        update.mode === 'REPAIR' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {update.mode === 'REPAIR' ? <Wrench size={14} /> : <Drill size={14} />}
                        {update.mode}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-green-500" />
                        <span className="text-sm font-medium text-green-700">
                          {update.completionDate && update.completionDate !== 'N/A' ? update.completionDate : 'N/A'}
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
                      {update.verificationResult === 'Satisfactory' ? (
                        <button
                          onClick={() => handleViewVerificationForm(update)}
                          className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-colors cursor-pointer"
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

          {filteredUpdates.length > 0 && (
  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700">Rows per page:</span>
      <select
        value={rowsPerPage}
        onChange={(e) => {
          setRowsPerPage(Number(e.target.value));
          setCurrentPage(1);
        }}
        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
      <span className="text-sm text-gray-700">
        Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredUpdates.length)} of {filteredUpdates.length} entries
      </span>
    </div>
    
    <div className="flex items-center gap-2">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      
      {[...Array(totalPages)].map((_, index) => {
        const pageNumber = index + 1;
        if (
          pageNumber === 1 ||
          pageNumber === totalPages ||
          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
        ) {
          return (
            <button
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              className={`px-3 py-1 border rounded-lg text-sm font-medium ${
                currentPage === pageNumber
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              {pageNumber}
            </button>
          );
        } else if (
          pageNumber === currentPage - 2 ||
          pageNumber === currentPage + 2
        ) {
          return <span key={pageNumber} className="px-2">...</span>;
        }
        return null;
      })}
      
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
)}
          
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

      {/* Material Book Modal - MATCHING MBVisitReportScreen */}
      {showMaterialBookModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Eye size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">View Material Book (MB)</h3>
                    <p className="text-blue-100">Requisition: {selectedRecord.requisitionId} - {selectedRecord.handpumpId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMaterialBookModal(false)}
                  className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* View Uploaded Material Book PDF Button */}
              {materialBookData?.MaterialImgFile && (
                <div className="mb-6">
                  <button
                    onClick={handleViewMaterialBookPDF}
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
                  <div><span className="text-gray-500">Handpump ID:</span> <span className="font-medium">{selectedRecord.handpumpId}</span></div>
                  <div><span className="text-gray-500">Village:</span> <span className="font-medium">{selectedRecord.village}</span></div>
                  <div><span className="text-gray-500">Mode:</span> <span className="font-medium">{selectedRecord.mode}</span></div>
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
                ) : viewMBData.length === 0 ? (
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
                        {viewMBData.map((item, index) => {
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
                                <div className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg min-h-[48px]">
                                  {item.Consulting_Egnr_Remark || 'No remarks'}
                                </div>
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

              {/* Amount Comparison - MATCHING MBVisitReportScreen */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                <h4 className="text-lg font-bold text-amber-800 mb-4">Amount Comparison</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <span className="text-amber-600 text-sm font-medium">Amount as per Estimation</span>
                    <p className="text-2xl font-bold text-amber-700">₹{selectedRecord.estimatedAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <span className="text-amber-600 text-sm font-medium">Actual Amount</span>
                    <p className="text-2xl font-bold text-amber-700">₹{selectedRecord.actualAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <span className="text-amber-600 text-sm font-medium">Variance</span>
                    <p className={`text-xl font-bold ${
                      (selectedRecord.actualAmount - selectedRecord.estimatedAmount) > 0 
                        ? 'text-red-700' 
                        : 'text-green-700'
                    }`}>
                      {(selectedRecord.actualAmount - selectedRecord.estimatedAmount) > 0 ? '+' : ''}
                      ₹{(selectedRecord.actualAmount - selectedRecord.estimatedAmount)?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visit Report Modal - MATCHING MBVisitReportScreen */}
      {showVerificationModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Eye size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">View Visit Monitoring Report</h3>
                    <p className="text-green-100">India Mark II Handpump - {selectedRecord.handpumpId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVisitMonitoringData(null);
                  }}
                  className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {!visitMonitoringData ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
                  <p className="text-gray-600">Loading visit report...</p>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 mb-6 border border-teal-200">
                    <h4 className="text-sm font-semibold text-teal-700 mb-3">Monitoring Details</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div><span className="text-teal-600 font-medium">Handpump ID:</span> <span className="font-semibold">{selectedRecord.handpumpId}</span></div>
                      <div><span className="text-teal-600 font-medium">Village:</span> <span className="font-semibold">{selectedRecord.village}</span></div>
                      <div><span className="text-teal-600 font-medium">Gram Panchayat:</span> <span className="font-semibold">{selectedRecord.gramPanchayat}</span></div>
                      <div><span className="text-teal-600 font-medium">Recording Person:</span> <span className="font-semibold">Consulting Engineer</span></div>
                      <div><span className="text-teal-600 font-medium">Date:</span> <span className="font-semibold">{visitMonitoringData?.VisitDate ? new Date(visitMonitoringData.VisitDate).toLocaleDateString('en-IN') : getCurrentDate()}</span></div>
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
                              checked={visitMonitoringData?.WorkAbility === option}
                              disabled
                              className="w-4 h-4 text-teal-600 focus:ring-teal-500 disabled:opacity-50"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                          </label>
                        ))}
                      </div>
                      <textarea
                        value={visitMonitoringData?.WorkAbilityRemarks || ''}
                        readOnly
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50 border-gray-200"
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
                              checked={visitMonitoringData?.PlatformCondition === option}
                              disabled
                              className="w-4 h-4 text-teal-600 focus:ring-teal-500 disabled:opacity-50"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{option}</span>
                          </label>
                        ))}
                      </div>
                      <textarea
                        value={visitMonitoringData?.PlatformRemarks || ''}
                        readOnly
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50 border-gray-200"
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
                              checked={visitMonitoringData?.PedestalGrouting === option}
                              disabled
                              className="w-4 h-4 text-teal-600 focus:ring-teal-500 disabled:opacity-50"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                      <textarea
                        value={visitMonitoringData?.PedestalRemarks || ''}
                        readOnly
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50 border-gray-200"
                        rows="2"
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
                              checked={visitMonitoringData?.Overall_Status === option}
                              disabled
                              className="w-5 h-5 text-teal-600 focus:ring-teal-500 focus:ring-2 disabled:opacity-50"
                            />
                            <span className={`ml-3 text-base font-semibold ${
                              visitMonitoringData?.Overall_Status === option 
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

                    {/* Additional Comments */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Additional Comments</label>
                      <textarea
                        value={visitMonitoringData?.AdditionalComments || ''}
                        readOnly
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50 border-gray-200"
                        rows="4"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Requisition Detail Modal */}
{showRequisitionDetailModal && requisitionDetail && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Requisition Details</h3>
              <p className="text-blue-100">REQ{requisitionDetail.RequisitionId.toString().padStart(3, '0')}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setShowRequisitionDetailModal(false);
              setRequisitionDetail(null);
            }}
            className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {!requisitionDetail ? (
  <div className="p-8 text-center">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
    <p className="text-gray-600">Loading details...</p>
  </div>
) : (
          <>
            {/* Handpump Image */}
            {requisitionDetail.HandpumpImage && (
              <div className="mb-6">
                <img 
                  src={requisitionDetail.HandpumpImage} 
                  alt="Handpump" 
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Basic Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
              <h4 className="text-lg font-bold text-blue-800 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Handpump ID:</span>
                  <span className="ml-2 font-semibold">{requisitionDetail.HandpumpId}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Village:</span>
                  <span className="ml-2 font-semibold">{requisitionDetail.VillageName}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">District:</span>
                  <span className="ml-2 font-semibold">{requisitionDetail.DistrictName}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Block:</span>
                  <span className="ml-2 font-semibold">{requisitionDetail.BlockName}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Gram Panchayat:</span>
                  <span className="ml-2 font-semibold">{requisitionDetail.GrampanchayatName}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">User:</span>
                  <span className="ml-2 font-semibold">{requisitionDetail.UserName}</span>
                </div>
              </div>
            </div>

            {/* Requisition Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Requisition Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Requisition Date:</span>
                  <span className="ml-2 font-semibold">
                    {new Date(requisitionDetail.RequisitionDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Type:</span>
                  <span className="ml-2 font-semibold">{requisitionDetail.RequisitionType}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Repair Type:</span>
                  <span className="ml-2 font-semibold">{requisitionDetail.RequisitionRepairType}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                    requisitionDetail.RequisitionStatus === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {requisitionDetail.RequisitionStatus === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              {requisitionDetail.RequisitionDesc && (
                <div className="mt-4">
                  <span className="text-gray-600 font-medium">Description:</span>
                  <p className="mt-1 text-gray-800">{requisitionDetail.RequisitionDesc}</p>
                </div>
              )}
            </div>

            {/* Order & Financial Details */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border border-green-200">
              <h4 className="text-lg font-bold text-green-800 mb-4">Order & Financial Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {requisitionDetail.OrderId && (
                  <div>
                    <span className="text-green-600 font-medium">Order ID:</span>
                    <span className="ml-2 font-semibold">{requisitionDetail.OrderId}</span>
                  </div>
                )}
                {requisitionDetail.SanctionDateStr && (
                  <div>
                    <span className="text-green-600 font-medium">Sanction Date:</span>
                    <span className="ml-2 font-semibold">{requisitionDetail.SanctionDateStr}</span>
                  </div>
                )}
                {requisitionDetail.SanctionAmount && (
                  <div>
                    <span className="text-green-600 font-medium">Sanction Amount:</span>
                    <span className="ml-2 font-semibold">₹{requisitionDetail.SanctionAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {requisitionDetail.TotalMBAmount && (
                  <div>
                    <span className="text-green-600 font-medium">Total MB Amount:</span>
                    <span className="ml-2 font-semibold">₹{requisitionDetail.TotalMBAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {requisitionDetail.CompletionDateStr && (
                  <div>
                    <span className="text-green-600 font-medium">Completion Date:</span>
                    <span className="ml-2 font-semibold">{requisitionDetail.CompletionDateStr}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Approval Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Approval Status</h4>
              <div className="space-y-4">
                {/* CE Status */}
                {requisitionDetail.CEId && (
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      requisitionDetail.CEStatus === 1 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {requisitionDetail.CEStatus === 1 ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <Clock size={16} className="text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Consulting Engineer</p>
                      {requisitionDetail.CERemark && (
                        <p className="text-sm text-gray-600 mt-1">Remark: {requisitionDetail.CERemark}</p>
                      )}
                      {requisitionDetail.CEUpdatedDateStr && (
                        <p className="text-xs text-gray-500 mt-1">Updated: {requisitionDetail.CEUpdatedDateStr}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* GP Sachiv Status */}
                {requisitionDetail.GPSachivId && (
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      requisitionDetail.GPSachivStatus === 1 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {requisitionDetail.GPSachivStatus === 1 ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <Clock size={16} className="text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Gram Panchayat Sachiv</p>
                      {requisitionDetail.GPSachivRemark && (
                        <p className="text-sm text-gray-600 mt-1">Remark: {requisitionDetail.GPSachivRemark}</p>
                      )}
                      {requisitionDetail.GPSachivUpdatedDateStr && (
                        <p className="text-xs text-gray-500 mt-1">Updated: {requisitionDetail.GPSachivUpdatedDateStr}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* DPRO Status */}
                {requisitionDetail.DPROId && (
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      requisitionDetail.DPROStatus === 1 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {requisitionDetail.DPROStatus === 1 ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <Clock size={16} className="text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">DPRO</p>
                      {requisitionDetail.DPRORemark && (
                        <p className="text-sm text-gray-600 mt-1">Remark: {requisitionDetail.DPRORemark}</p>
                      )}
                      {requisitionDetail.DPROUpdatedDateStr && (
                        <p className="text-xs text-gray-500 mt-1">Updated: {requisitionDetail.DPROUpdatedDateStr}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ViewClosureUpdatesScreen;