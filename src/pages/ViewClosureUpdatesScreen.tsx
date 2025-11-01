import React, { useState, useEffect } from 'react';
import { Filter, Search, Download, Calendar, FileText, Wrench, Drill, X, AlertCircle, CheckCircle, Clock, TrendingUp, Loader } from 'lucide-react';
import { useUserInfo } from '../utils/userInfo';

const ViewClosureUpdatesScreen = () => {
  const { userId, loading: userLoading, error: userError } = useUserInfo();
  const [filterClosureStatus, setFilterClosureStatus] = useState('All');
  const [filterVerificationResult, setFilterVerificationResult] = useState('All');
  const [filterVillage, setFilterVillage] = useState('All');
  const [filterHandpumpId, setFilterHandpumpId] = useState('');
  const [filterRequisitionId, setFilterRequisitionId] = useState('');
  const [showMaterialBookModal, setShowMaterialBookModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [closureUpdates, setClosureUpdates] = useState([]);
  const [materialBookData, setMaterialBookData] = useState(null);
  const [visitMonitoringData, setVisitMonitoringData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [villages, setVillages] = useState(['All']);
  const [districts, setDistricts] = useState(['All']);
const [blocks, setBlocks] = useState(['All']);
const [gramPanchayats, setGramPanchayats] = useState(['All']);
const [districtFilter, setDistrictFilter] = useState('All');
const [blockFilter, setBlockFilter] = useState('All');
const [gpFilter, setGpFilter] = useState('All');

  const API_BASE = 'https://hmsapi.kdsgroup.co.in/api';

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

  // Fetch requisition list on component mount
  useEffect(() => {
    if (userLoading) return;
    
    if (!userId) {
      setError('User ID not found. Please login again.');
      setLoading(false);
      return;
    }

    fetchRequisitionList();
  }, [userId, userLoading]);

  const fetchRequisitionList = async () => {
    try {
      setLoading(true);
      setError(null);

      const authToken = getAuthToken();
      
      if (!authToken) {
        throw new Error('Authentication token not found. Please login again.');
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
      
      if (!response.ok) throw new Error('Failed to fetch requisitions');
      const result = await response.json();
      
      if (result.Status && result.Data) {
        // Extract unique villages
        // Extract unique villages
const uniqueVillages = ['All', ...new Set(result.Data.map(item => item.VillageName).filter(Boolean))];
const uniqueDistricts = ['All', ...new Set(result.Data.map(item => item.DistrictName).filter(Boolean))];
const uniqueBlocks = ['All', ...new Set(result.Data.map(item => item.BlockName).filter(Boolean))];
const uniqueGPs = ['All', ...new Set(result.Data.map(item => item.GrampanchayatName).filter(Boolean))];
setVillages(uniqueVillages);

        // Transform API data to match component structure
        const transformedData = result.Data
          .filter(item => item.OrderId && item.CompletionDateStr) // Only completed with order
          .map(item => {
            const hasMaterialBook = item.TotalMBAmount && item.TotalMBAmount > 0;
            const isVerified = hasMaterialBook; // Can be enhanced based on actual verification data
            
            return {
  id: `REQ${item.RequisitionId.toString().padStart(3, '0')}`,
  uniqueKey: `${item.RequisitionId}-${item.OrderId}`,
  requisitionId: item.RequisitionId,
  handpumpId: item.HandpumpId,
  hpId: item.HPId,
  village: item.VillageName,
  district: item.DistrictName || 'N/A',
  block: item.BlockName || 'N/A',
  gramPanchayat: item.GrampanchayatName || 'N/A',
  requisitionDate: item.RequisitionDate,
  mode: item.RequisitionType,
  completionDate: item.CompletionDateStr,
  mbStatus: hasMaterialBook ? 'Complete' : 'Pending',
  verificationResult: hasMaterialBook ? 'Satisfactory' : 'Pending',
  escalation: hasMaterialBook ? 'No Escalation' : 'Pending',
  closureStatus: hasMaterialBook ? 'Completed' : 'Pending at CE Level',
  estimatedAmount: item.SanctionAmount || 0,
  actualAmount: item.TotalMBAmount || 0,
  orderId: item.OrderId
};
          });
        
        setClosureUpdates(transformedData);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching requisition list:', err);
      setError(err.message || 'Failed to fetch closure updates');
      setLoading(false);
    }
  };

  const fetchMaterialBook = async (requisitionId) => {
    try {
      setMaterialBookData(null); // Reset before fetching new data
      const authToken = getAuthToken();
      const response = await fetch(
        `${API_BASE}/HandpumpRequisition/GetMaterialBookByRequisitionId?requisitionId=${requisitionId}&userId=${userId}`,
        {
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch material book');
      const result = await response.json();

      if (result.Status && result.Data) {
        setMaterialBookData(result.Data);
      } else {
        setMaterialBookData(null);
      }
    } catch (err) {
      console.error('Error fetching material book:', err);
      setMaterialBookData(null);
    }
  };

  const fetchVisitMonitoring = async (requisitionId) => {
    try {
      const authToken = getAuthToken();
      const response = await fetch(
        `${API_BASE}/HandpumpRequisition/GetVisitMonitoringListByUserId?requisitionId=${requisitionId}&userId=${userId}`,
        {
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch visit monitoring');
      const result = await response.json();

      if (result.Status && result.Data) {
        setVisitMonitoringData(result.Data);
      }
    } catch (err) {
      console.error('Error fetching visit monitoring:', err);
    }
  };

  // Get material book items from API data or empty array
  const getMaterialBookItems = () => {
    if (!materialBookData) return [];
    
    // If API returns items in a specific structure, map them
    // Adjust this based on your actual API response structure
    if (materialBookData.Items && Array.isArray(materialBookData.Items)) {
      return materialBookData.Items.map((item, index) => ({
        sno: item.SerialNo || index + 1,
        item: item.ItemDescription || item.Description || '',
        unit: item.Unit || '',
        rate: item.Rate || 0,
        ref: item.Reference || '',
        l: item.Length || '',
        b: item.Breadth || '',
        h: item.Height || '',
        qty: item.Quantity || '',
        amount: item.Amount || 0,
        remark: item.Remark || ''
      }));
    }
    
    // If API returns a different structure, handle it here
    return [];
  };

  const closureStatusOptions = ['All', 'Pending at CE Level', 'Completed', 'On-Hold'];
  const verificationOptions = ['All', 'Satisfactory', 'Not Satisfactory', 'Pending'];

  const filteredUpdates = closureUpdates.filter(update => {
  return (
    (filterClosureStatus === 'All' || update.closureStatus === filterClosureStatus) &&
    (filterVerificationResult === 'All' || update.verificationResult === filterVerificationResult) &&
    (filterVillage === 'All' || update.village === filterVillage) &&
    (districtFilter === 'All' || update.district === districtFilter) &&
    (blockFilter === 'All' || update.block === blockFilter) &&
    (gpFilter === 'All' || update.gramPanchayat === gpFilter) &&
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

  const handleViewMaterialBook = async (record) => {
    setSelectedRecord(record);
    await fetchMaterialBook(record.requisitionId);
    setShowMaterialBookModal(true);
  };

  const handleViewVerificationForm = async (record) => {
    setSelectedRecord(record);
    await fetchVisitMonitoring(record.requisitionId);
    setShowVerificationModal(true);
  };

  const handleDownloadMaterialBookPDF = async () => {
  if (!selectedRecord || !materialBookData) return;

  const items = getMaterialBookItems();
  const isRepair = selectedRecord.mode === 'REPAIR';

  // Create a hidden div for PDF generation
  const printContent = document.createElement('div');
  printContent.style.width = '210mm';
  printContent.style.padding = '20mm';
  printContent.style.fontFamily = 'Arial, sans-serif';
  printContent.style.backgroundColor = '#ffffff';
  printContent.style.position = 'absolute';
  printContent.style.left = '-9999px';
  printContent.style.top = '0';

  printContent.innerHTML = `
    <style>
      .pdf-header {
        background: linear-gradient(to right, #2563eb, #3b82f6);
        color: white;
        padding: 30px;
        border-radius: 10px;
        margin-bottom: 30px;
      }
      .pdf-table-container {
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
      }
      .pdf-table {
        width: 100%;
        border-collapse: collapse;
      }
      .pdf-table thead {
        background: #f9fafb;
      }
      .pdf-table th {
        padding: 12px;
        text-align: left;
        font-size: 11px;
        font-weight: 600;
        color: #374151;
        text-transform: uppercase;
        border-bottom: 2px solid #93c5fd;
      }
      .pdf-table tbody tr:nth-child(even) {
        background: #f9fafb;
      }
      .pdf-table tbody tr:nth-child(odd) {
        background: white;
      }
      .pdf-table td {
        padding: 12px;
        font-size: 12px;
        color: #1f2937;
        border-bottom: 1px solid #e5e7eb;
      }
      .summary-box {
        background: #eff6ff;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        border: 1px solid #93c5fd;
      }
      .amount-comparison {
        background: #fef3c7;
        padding: 20px;
        border-radius: 10px;
        margin-top: 20px;
        border: 1px solid #fbbf24;
      }
    </style>

    <div class="pdf-header">
      <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">Material Book</h1>
      <p style="font-size: 14px; opacity: 0.95; margin: 0;">Requisition: ${selectedRecord.id} - ${selectedRecord.handpumpId}</p>
    </div>

    <div class="summary-box">
      <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #1e40af;">Material Book Summary</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <div>
          <p style="font-size: 12px; color: #6b7280; margin: 0;">Total Material Cost</p>
          <p style="font-size: 20px; font-weight: bold; color: #1e40af; margin: 5px 0 0 0;">₹${materialBookData.TotalMaterialCost?.toLocaleString() || '0'}</p>
        </div>
        <div>
          <p style="font-size: 12px; color: #6b7280; margin: 0;">Total Labour Cost</p>
          <p style="font-size: 20px; font-weight: bold; color: #1e40af; margin: 5px 0 0 0;">₹${materialBookData.TotalLabourCost?.toLocaleString() || '0'}</p>
        </div>
        <div>
          <p style="font-size: 12px; color: #6b7280; margin: 0;">Total Project Cost</p>
          <p style="font-size: 20px; font-weight: bold; color: #1e40af; margin: 5px 0 0 0;">₹${materialBookData.TotalProjectCost?.toLocaleString() || '0'}</p>
        </div>
      </div>
    </div>

    ${items.length > 0 ? `
      <div class="pdf-table-container">
        <table class="pdf-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Item</th>
              <th>Unit</th>
              <th>Rate (Rs.)</th>
              <th>Ref/Source</th>
              <th>L</th>
              <th>B</th>
              <th>H</th>
              <th>Qty.</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="color: #2563eb; font-weight: 600;">${item.sno}</td>
                <td>${item.item}</td>
                <td>${item.unit}</td>
                <td style="color: #059669; font-weight: 600;">${item.rate ? '₹' + item.rate.toLocaleString() : ''}</td>
                <td>${item.ref || ''}</td>
                <td>${item.l || ''}</td>
                <td>${item.b || ''}</td>
                <td>${item.h || ''}</td>
                <td>${item.qty || ''}</td>
                <td style="color: #475569; font-weight: 600;">${item.amount ? '₹' + item.amount.toLocaleString() : ''}</td>
              </tr>
            `).join('')}
            <tr style="background: #e0e7ff; font-weight: 600;">
              <td colspan="9" style="color: #3730a3;">Subtotal</td>
              <td style="color: #3730a3;">₹${calculations.total.toLocaleString()}</td>
            </tr>
            <tr style="background: #ccfbf1; font-weight: 600;">
              <td colspan="9" style="color: #115e59;">GST (18%)</td>
              <td style="color: #115e59;">₹${calculations.gst.toLocaleString()}</td>
            </tr>
            <tr style="background: #cffafe; font-weight: 600;">
              <td colspan="9" style="color: #155e75;">Total (including GST)</td>
              <td style="color: #155e75;">₹${calculations.totalWithGST.toLocaleString()}</td>
            </tr>
            <tr style="background: #d1fae5; font-weight: 600;">
              <td colspan="9" style="color: #065f46;">1% Consulting Engineer Fee</td>
              <td style="color: #065f46;">₹${calculations.consultingFee.toLocaleString()}</td>
            </tr>
            <tr style="background: #dcfce7; font-weight: bold; border-top: 2px solid #86efac;">
              <td colspan="9" style="color: #166534; font-size: 14px;">Grand Total</td>
              <td style="color: #166534; font-size: 16px;">₹${calculations.grandTotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    ` : ''}

    <div class="amount-comparison">
      <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #92400e;">Amount Comparison</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <div>
          <p style="font-size: 12px; color: #92400e; margin: 0;">Estimated Amount</p>
          <p style="font-size: 20px; font-weight: bold; color: #92400e; margin: 5px 0 0 0;">₹${selectedRecord.estimatedAmount?.toLocaleString()}</p>
        </div>
        <div>
          <p style="font-size: 12px; color: #92400e; margin: 0;">Actual Amount</p>
          <p style="font-size: 20px; font-weight: bold; color: #92400e; margin: 5px 0 0 0;">₹${selectedRecord.actualAmount?.toLocaleString()}</p>
        </div>
        <div>
          <p style="font-size: 12px; color: #92400e; margin: 0;">Variance</p>
          <p style="font-size: 20px; font-weight: bold; color: ${(selectedRecord.actualAmount - selectedRecord.estimatedAmount) > 0 ? '#dc2626' : '#16a34a'}; margin: 5px 0 0 0;">
            ${(selectedRecord.actualAmount - selectedRecord.estimatedAmount) > 0 ? '+' : ''}₹${(selectedRecord.actualAmount - selectedRecord.estimatedAmount)?.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(printContent);

  try {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    const canvas = await html2canvas(printContent, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    let position = 0;
    const pageHeight = 297;
    
    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      while (heightLeft > 0) {
        if (position !== 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
      }
    }

    pdf.save(`Material_Book_${selectedRecord.id}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    document.body.removeChild(printContent);
  }
};

const handleDownloadReport = async () => {
  const printContent = document.createElement('div');
  printContent.style.width = '297mm'; // A4 landscape width
  printContent.style.padding = '20mm';
  printContent.style.fontFamily = 'Arial, sans-serif';
  printContent.style.backgroundColor = '#ffffff';
  printContent.style.position = 'absolute';
  printContent.style.left = '-9999px';
  printContent.style.top = '0';

  printContent.innerHTML = `
    <style>
      .pdf-header {
        background: linear-gradient(to right, #1e293b, #475569, #1e40af);
        color: white;
        padding: 30px;
        border-radius: 10px;
        margin-bottom: 30px;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        margin-bottom: 30px;
      }
      .stat-card {
        background: linear-gradient(to bottom right, #3b82f6, #2563eb);
        color: white;
        padding: 20px;
        border-radius: 10px;
      }
      .pdf-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
      }
      .pdf-table thead {
        background: #f9fafb;
      }
      .pdf-table th {
        padding: 10px 8px;
        text-align: left;
        font-size: 9px;
        font-weight: 600;
        color: #374151;
        text-transform: uppercase;
        border-bottom: 2px solid #93c5fd;
      }
      .pdf-table tbody tr:nth-child(even) {
        background: #f9fafb;
      }
      .pdf-table tbody tr:nth-child(odd) {
        background: white;
      }
      .pdf-table td {
        padding: 10px 8px;
        font-size: 9px;
        color: #1f2937;
        border-bottom: 1px solid #e5e7eb;
      }
      .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 8px;
        font-weight: 600;
      }
      .status-completed { background: #dcfce7; color: #166534; }
      .status-pending { background: #fef3c7; color: #92400e; }
      .status-onhold { background: #fee2e2; color: #991b1b; }
      .mode-repair { background: #dbeafe; color: #1e40af; }
      .mode-rebore { background: #d1fae5; color: #065f46; }
    </style>

    <div class="pdf-header">
      <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">Closure Updates Report</h1>
      <p style="font-size: 14px; opacity: 0.95; margin: 0;">Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card" style="background: linear-gradient(to bottom right, #10b981, #059669);">
        <p style="font-size: 12px; opacity: 0.9; margin: 0;">Completed</p>
        <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${stats.completed}</p>
      </div>
      <div class="stat-card" style="background: linear-gradient(to bottom right, #f59e0b, #d97706);">
        <p style="font-size: 12px; opacity: 0.9; margin: 0;">Pending at CE Level</p>
        <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${stats.pendingCE}</p>
      </div>
      <div class="stat-card" style="background: linear-gradient(to bottom right, #ef4444, #dc2626);">
        <p style="font-size: 12px; opacity: 0.9; margin: 0;">On-Hold</p>
        <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${stats.onHold}</p>
      </div>
      <div class="stat-card">
        <p style="font-size: 12px; opacity: 0.9; margin: 0;">Total Closures</p>
        <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${stats.total}</p>
      </div>
    </div>

    <table class="pdf-table">
      <thead>
        <tr>
          <th>Req ID</th>
          <th>Handpump ID</th>
          <th>Req Date</th>
          <th>Mode</th>
          <th>Completion</th>
          <th>MB Status</th>
          <th>Verification</th>
          <th>Escalation</th>
          <th>Closure Status</th>
        </tr>
      </thead>
      <tbody>
        ${filteredUpdates.map(update => `
          <tr>
            <td style="font-weight: 600; color: #2563eb;">${update.id}</td>
            <td>${update.handpumpId}</td>
            <td>${new Date(update.requisitionDate).toLocaleDateString('en-IN')}</td>
            <td><span class="status-badge ${update.mode === 'REPAIR' ? 'mode-repair' : 'mode-rebore'}">${update.mode}</span></td>
            <td>${update.completionDate && update.completionDate !== 'N/A' ? update.completionDate : 'N/A'}</td>
            <td><span class="status-badge ${update.mbStatus === 'Complete' ? 'status-completed' : 'status-pending'}">${update.mbStatus}</span></td>
            <td><span class="status-badge ${update.verificationResult === 'Satisfactory' ? 'status-completed' : 'status-pending'}">${update.verificationResult}</span></td>
            <td><span class="status-badge ${update.escalation === 'No Escalation' ? 'status-completed' : 'status-pending'}">${update.escalation}</span></td>
            <td><span class="status-badge ${update.closureStatus === 'Completed' ? 'status-completed' : update.closureStatus === 'On-Hold' ? 'status-onhold' : 'status-pending'}">${update.closureStatus}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.body.appendChild(printContent);

  try {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    const canvas = await html2canvas(printContent, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgWidth = 297; // A4 landscape
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape
    const imgData = canvas.toDataURL('image/png');
    
    let position = 0;
    const pageHeight = 210; // A4 landscape height
    
    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      while (heightLeft > 0) {
        if (position !== 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
      }
    }

    pdf.save(`Closure_Updates_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    document.body.removeChild(printContent);
  }
};

  const calculateMaterialBookTotal = () => {
    // If API provides totals directly, use those
    if (materialBookData) {
      const total = materialBookData.SubTotal || materialBookData.TotalAmount || 0;
      const gst = materialBookData.GST || (total * 0.18);
      const totalWithGST = materialBookData.TotalWithGST || (total + gst);
      const consultingFee = materialBookData.ConsultingFee || (totalWithGST * 0.01);
      const grandTotal = materialBookData.GrandTotal || materialBookData.TotalProjectCost || (totalWithGST + consultingFee);
      
      return { total, gst, totalWithGST, consultingFee, grandTotal };
    }
    
    // Fallback: calculate from items if API doesn't provide totals
    const items = getMaterialBookItems();
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const gst = total * 0.18;
    const totalWithGST = total + gst;
    const consultingFee = totalWithGST * 0.01;
    const grandTotal = totalWithGST + consultingFee;
    
    return { total, gst, totalWithGST, consultingFee, grandTotal };
  };

  // Calculate only when materialBookData is available
  const calculations = materialBookData ? calculateMaterialBookTotal() : { total: 0, gst: 0, totalWithGST: 0, consultingFee: 0, grandTotal: 0 };

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
                    <option key={village} value={village} className="text-gray-800">{village} {village !== 'All' && 'Village'}</option>
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
                <p className="text-2xl font-bold mt-1">{stats.completed}</p>
                <p className="text-green-200 text-xs mt-1">Closures finalized</p>
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
                <p className="text-2xl font-bold mt-1">{stats.pendingCE}</p>
                <p className="text-amber-200 text-xs mt-1">Awaiting verification</p>
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
                <p className="text-2xl font-bold mt-1">{stats.onHold}</p>
                <p className="text-red-200 text-xs mt-1">Issues identified</p>
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
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
                <p className="text-blue-200 text-xs mt-1">All requisitions</p>
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
  onClick={handleDownloadReport}
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
  <tr key={update.uniqueKey} className={`${
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
  onClick={handleDownloadMaterialBookPDF}
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
              {/* Material Book Data Display */}
              {materialBookData && (
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="text-lg font-bold text-blue-800 mb-4">Material Book Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <span className="text-blue-600 text-sm font-medium">Total Material Cost</span>
                      <p className="text-2xl font-bold text-blue-700">₹{materialBookData.TotalMaterialCost?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <span className="text-blue-600 text-sm font-medium">Total Labour Cost</span>
                      <p className="text-2xl font-bold text-blue-700">₹{materialBookData.TotalLabourCost?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <span className="text-blue-600 text-sm font-medium">Total Project Cost</span>
                      <p className="text-2xl font-bold text-blue-700">₹{materialBookData.TotalProjectCost?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                  {materialBookData.MaterialImgFile && (
                    <div className="mt-4">
                      <a 
                        href={materialBookData.MaterialImgFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FileText size={16} />
                        View Material Book PDF
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Material Book Table */}
              {getMaterialBookItems().length > 0 ? (
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
                      {getMaterialBookItems().map((item, index) => (
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
                      <tr className="bg-indigo-50 font-semibold">
                        <td className="px-3 py-3 text-sm text-indigo-700" colSpan="2">Subtotal</td>
                        <td colSpan="7" className="px-3 py-3"></td>
                        <td className="px-3 py-3 text-base text-indigo-700">₹{calculations.total.toLocaleString()}</td>
                        <td className="px-3 py-3 text-sm text-indigo-700">Sum of all items</td>
                      </tr>
                      
                      <tr className="bg-teal-50 font-semibold">
                        <td className="px-3 py-3 text-sm text-teal-700" colSpan="2">GST (18%)</td>
                        <td colSpan="7" className="px-3 py-3"></td>
                        <td className="px-3 py-3 text-base text-teal-700">₹{calculations.gst.toLocaleString()}</td>
                        <td className="px-3 py-3 text-sm text-teal-700">As per GST rules</td>
                      </tr>
                      
                      <tr className="bg-cyan-50 font-semibold">
                        <td className="px-3 py-3 text-sm text-cyan-700" colSpan="2">Total (including GST)</td>
                        <td colSpan="7" className="px-3 py-3"></td>
                        <td className="px-3 py-3 text-base text-cyan-700">₹{calculations.totalWithGST.toLocaleString()}</td>
                        <td className="px-3 py-3 text-sm text-cyan-700">Total with GST</td>
                      </tr>
                      
                      <tr className="bg-emerald-50 font-semibold">
                        <td className="px-3 py-3 text-sm text-emerald-700" colSpan="2">1% Consulting Engineer Fee</td>
                        <td colSpan="7" className="px-3 py-3"></td>
                        <td className="px-3 py-3 text-base text-emerald-700">₹{calculations.consultingFee.toLocaleString()}</td>
                        <td className="px-3 py-3 text-sm text-emerald-700">CE fee for MB preparation</td>
                      </tr>
                      
                      <tr className="bg-green-100 font-bold text-lg border-t-2 border-green-300">
                        <td className="px-3 py-4 text-green-700" colSpan="2">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={16} />
                            Grand Total
                          </div>
                        </td>
                        <td colSpan="7" className="px-3 py-4"></td>
                        <td className="px-3 py-4 text-xl text-green-700">₹{calculations.grandTotal.toLocaleString()}</td>
                        <td className="px-3 py-4 text-sm text-green-700 font-normal">Final amount</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <AlertCircle className="mx-auto mb-3 text-gray-400" size={40} />
                  <p className="text-gray-600 font-medium">No detailed material book items available</p>
                  <p className="text-gray-500 text-sm mt-1">Summary information is shown above</p>
                </div>
              )}

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

              {/* Visit Monitoring Data */}
              {visitMonitoringData && visitMonitoringData.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="text-lg font-bold text-blue-800 mb-4">Visit Monitoring Records</h4>
                  <div className="space-y-3">
                    {visitMonitoringData.map((visit, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="font-semibold text-gray-800">Visit {idx + 1}</p>
                        <p className="text-sm text-gray-600 mt-1">{visit.Remarks || 'No remarks available'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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