import React, { useState, useEffect } from 'react';
import { Filter, Search, Download, Eye, Calendar, FileText, Wrench, Drill, ArrowLeft, TrendingUp, Loader, AlertCircle } from 'lucide-react';
import { useUserInfo } from '../utils/userInfo';
import { useSearchData } from '../components/SearchDataContext';

const ViewEstimationScreen = () => {
  const { userId, loading: userLoading, error: userError } = useUserInfo();
  const [filterMode, setFilterMode] = useState('All');
  const [selectedEstimation, setSelectedEstimation] = useState(null);
  const [requisitions, setRequisitions] = useState([]);
  const [requisitionItems, setRequisitionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
const [blockFilter, setBlockFilter] = useState('All');
const [gpFilter, setGpFilter] = useState('All');
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);
  const [masterRepairItems, setMasterRepairItems] = useState([]);
  const [masterReboreItems, setMasterReboreItems] = useState([]);
  const [consultingEngineer, setConsultingEngineer] = useState('');
  const { setEstimations: setGlobalEstimations } = useSearchData();


  const API_BASE = 'https://hmsapi.kdsgroup.co.in/api';

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

  // Fetch master repair items
  useEffect(() => {
    const fetchMasterRepairItems = async () => {
      try {
        const authToken = getAuthToken();
        const response = await fetch(
          `${API_BASE}/Master/GetRepairEstimation`,
          {
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${authToken}`
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch repair items');
        const data = await response.json();

        if (data && data.Data && Array.isArray(data.Data)) {
          setMasterRepairItems(data.Data);
        }
      } catch (err) {
        console.error('Error fetching master repair items:', err);
      }
    };

    fetchMasterRepairItems();
  }, []);

  // Fetch master rebore items
  useEffect(() => {
    const fetchMasterReboreItems = async () => {
      try {
        const authToken = getAuthToken();
        const response = await fetch(
          `${API_BASE}/Master/GetReboreEstimation`,
          {
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${authToken}`
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch rebore items');
        const data = await response.json();

        if (data && data.Data && Array.isArray(data.Data)) {
          setMasterReboreItems(data.Data);
        }
      } catch (err) {
        console.error('Error fetching master rebore items:', err);
      }
    };

    fetchMasterReboreItems();
  }, []);

  // Fetch requisitions data
  useEffect(() => {
    if (userLoading) return;
    
    if (!userId) {
      setError('User ID not found. Please login again.');
      setLoading(false);
      return;
    }

    const fetchRequisitions = async () => {
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
        const data = await response.json();

        if (data && data.Data && Array.isArray(data.Data)) {
          // Transform API data to match component structure
          // Transform API data to match component structure
const transformedData = data.Data.map(req => ({
    id: `REQ${req.RequisitionId.toString().padStart(3, '0')}`,
  requisitionId: req.RequisitionId, // ← ADD THIS LINE - Store actual DB ID
  handpumpId: req.HandpumpId || 'N/A',
  mode: (req.RequisitionType || 'Unknown').trim().toUpperCase(),
  date: req.RequisitionDate || new Date().toISOString(),
  sanctionedTotal: req.SanctionAmount ? `₹${req.SanctionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00',
  status: req.RequisitionStatus === 1 ? 'Pending' : req.RequisitionStatus === 2 ? 'Approved' : 'In Progress',
  orderId: req.OrderId,
  requisitionTypeId: req.RequisitionTypeId,
  image: req.HandpumpImage,
  sanctionAmount: req.SanctionAmount || 0,
  district: req.DistrictName || 'N/A',
  block: req.BlockName || 'N/A',
  gramPanchayat: req.GrampanchayatName || 'N/A'
})).filter(req => req.orderId);

          setRequisitions(transformedData);
          setGlobalEstimations(data.Data); // ← ADD THIS LINE (use raw data)

        } else {
          setRequisitions([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching requisitions:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRequisitions();
  }, [userId, userLoading]);

  // Fetch requisition items when estimation is selected
  useEffect(() => {
    if (!selectedEstimation) return;

    const fetchRequisitionItems = async () => {
      try {
        const authToken = getAuthToken();
        
        const response = await fetch(
  `${API_BASE}/HandpumpRequisition/GetRequisitionItemList?RequisitionId=${selectedEstimation.requisitionId}&OrderID=${selectedEstimation.orderId}&TypeId=${selectedEstimation.requisitionTypeId}`,
          {
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${authToken}`
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch requisition items');
        const data = await response.json();

        if (data && data.Data && Array.isArray(data.Data)) {
  // Extract consulting engineer name from first item
  if (data.Data.length > 0 && data.Data[0].UserName) {
    setConsultingEngineer(data.Data[0].UserName);
  }

  // Transform items to match the structure
  const transformedItems = data.Data.map((item, index) => ({
    sno: index + 1,
    item: item.ItemName || 'Unknown Item',
    unit: item.Unit || 'Nos',
    rate: item.Quantity > 0 ? (item.Amount / item.Quantity) : 0,
    qty: item.Quantity || 0,
    amount: item.Amount || 0,
    ref: item.Source || '',
    l: item.Length || '',
    b: item.Width || '',
    h: item.Height || ''
  }));
  
  setRequisitionItems(transformedItems);
} else {
  setRequisitionItems([]);
}
      } catch (err) {
        console.error('Error fetching requisition items:', err);
        setRequisitionItems([]);
      }
    };

    fetchRequisitionItems();
  }, [selectedEstimation]);

  // Reset pagination when filters change
useEffect(() => {
  setCurrentPage(1);
}, [filterMode, searchQuery, districtFilter, blockFilter, gpFilter]);

  const calculateTotal = () => {
    const items = requisitionItems.length > 0 ? requisitionItems : getMasterItems();
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const gst = total * 0.18;
    const totalWithGST = total + gst;
    const consultingFee = totalWithGST * 0.01;
    const grandTotal = totalWithGST + consultingFee;
    return { total, gst, totalWithGST, consultingFee, grandTotal };
  };

  const getMasterItems = () => {
  if (!selectedEstimation) return [];
  
  const isRepair = selectedEstimation.mode === 'REPAIR';
  const masterItems = isRepair ? masterRepairItems : masterReboreItems;
  
  // Filter out header items (items with 0 quantity and 0 rate)
  return masterItems
    .filter(item => !(item.Quantity === 0 && item.Rate === 0))
    .map((item, index) => ({
      sno: index + 1,
      item: item.ItemName || 'Unknown Item',
      unit: item.Unit || 'Nos',
      rate: item.Rate || 0,
      qty: item.Quantity || 0,
      amount: item.Amount || 0,
      ref: item.Source || '',
      l: item.Length?.toString() || '',
      b: item.Width?.toString() || '',
      h: item.Height?.toString() || ''
    }));
};

  // Get unique values for dropdowns first (before filtering)
// Get unique values for dropdowns with cascading logic
const uniqueDistricts = ['All', ...new Set(requisitions.map(r => r.district).filter(d => d && d !== 'N/A'))];

// Blocks filtered by selected district
const uniqueBlocks = ['All', ...new Set(
  requisitions
    .filter(r => districtFilter === 'All' || r.district === districtFilter)
    .map(r => r.block)
    .filter(b => b && b !== 'N/A')
)];

// GPs filtered by selected district and block
const uniqueGPs = ['All', ...new Set(
  requisitions
    .filter(r => {
      const districtMatch = districtFilter === 'All' || r.district === districtFilter;
      const blockMatch = blockFilter === 'All' || r.block === blockFilter;
      return districtMatch && blockMatch;
    })
    .map(r => r.gramPanchayat)
    .filter(gp => gp && gp !== 'N/A')
)];
const filteredRequisitions = requisitions.filter(req => {
  // Mode filter - strict comparison without case sensitivity
  const modeMatch = filterMode === 'All' || 
    (req.mode && req.mode.trim().toUpperCase() === filterMode.trim().toUpperCase());
  
  // Search filter
  const searchMatch = searchQuery === '' || 
    req.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.handpumpId?.toLowerCase().includes(searchQuery.toLowerCase());
  
  // Location filters
  const districtMatch = districtFilter === 'All' || req.district === districtFilter;
  const blockMatch = blockFilter === 'All' || req.block === blockFilter;
  const gpMatch = gpFilter === 'All' || req.gramPanchayat === gpFilter;
  
  return modeMatch && searchMatch && districtMatch && blockMatch && gpMatch;
});



// Pagination calculations
const totalPages = Math.ceil(filteredRequisitions.length / rowsPerPage);
const startIndex = (currentPage - 1) * rowsPerPage;
const endIndex = startIndex + rowsPerPage;
const paginatedRequisitions = filteredRequisitions.slice(startIndex, endIndex);

// Reset to page 1 when filters change
const resetPagination = () => {
  setCurrentPage(1);
};

// Page navigation functions
const goToPage = (page) => {
  setCurrentPage(Math.max(1, Math.min(page, totalPages)));
};

const goToNextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};

const goToPreviousPage = () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
  }
};

// Generate page numbers for pagination
const getPageNumbers = () => {
  const pages = [];
  const maxPagesToShow = 5;
  
  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push('...');
      pages.push(totalPages);
    }
  }
  
  return pages;
};

  const handleViewEstimation = (requisition) => {
    setSelectedEstimation(requisition);
    setConsultingEngineer(''); // Reset consulting engineer name
  };

  const handleDownloadPDF = async () => {
  const isRepair = selectedEstimation.mode === 'REPAIR';
  const calculations = calculateTotal();
  const items = requisitionItems.length > 0 ? requisitionItems : getMasterItems();

  // Create a hidden div for PDF generation
  const printContent = document.createElement('div');
  printContent.style.width = '210mm'; // A4 width
  printContent.style.padding = '20mm';
  printContent.style.fontFamily = 'Arial, sans-serif';
  printContent.style.backgroundColor = '#ffffff';
  printContent.style.position = 'absolute';
  printContent.style.left = '-9999px';
  printContent.style.top = '0';

  printContent.innerHTML = `
    <style>
      .pdf-header {
        background: linear-gradient(to right, #0f766e, #0891b2, #2563eb);
        color: white;
        padding: 30px;
        border-radius: 10px;
        margin-bottom: 30px;
      }
      .pdf-engineer-card {
        background: linear-gradient(to right, #0d9488, #06b6d4, #3b82f6);
        color: white;
        padding: 25px;
        border-radius: 10px;
        margin-bottom: 30px;
      }
      .pdf-info-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-top: 20px;
      }
      .pdf-info-box {
        background: rgba(255, 255, 255, 0.2);
        padding: 15px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
      .pdf-info-label {
        font-size: 12px;
        opacity: 0.9;
        margin-bottom: 5px;
      }
      .pdf-info-value {
        font-size: 18px;
        font-weight: bold;
      }
      .pdf-mode-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 15px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        margin-top: 10px;
      }
      .pdf-mode-repair {
        background: #3b82f6;
        color: white;
      }
      .pdf-mode-rebore {
        background: #10b981;
        color: white;
      }
      .pdf-table-container {
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
      }
      .pdf-table-header {
        background: linear-gradient(to right, #374151, #475569);
        color: white;
        padding: 20px 25px;
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
      .row-add-items {
        background: #fef3c7 !important;
      }
      .row-add-items td {
        color: #92400e;
        font-weight: 600;
      }
      .row-total {
        background: #dbeafe !important;
      }
      .row-total td {
        color: #1e40af;
        font-weight: 600;
      }
      .row-gst {
        background: #e0e7ff !important;
      }
      .row-gst td {
        color: #3730a3;
        font-weight: 600;
      }
      .row-total-with-gst {
        background: #ccfbf1 !important;
      }
      .row-total-with-gst td {
        color: #115e59;
        font-weight: 600;
      }
      .row-consulting-fee {
        background: #cffafe !important;
      }
      .row-consulting-fee td {
        color: #155e75;
        font-weight: 600;
      }
      .row-consulting-fee-mb {
        background: #d1fae5 !important;
      }
      .row-consulting-fee-mb td {
        color: #065f46;
        font-weight: 600;
      }
      .row-grand-total {
        background: #dcfce7 !important;
        border-top: 2px solid #86efac;
      }
      .row-grand-total td {
        color: #166534;
        font-weight: bold;
        font-size: 14px;
        padding: 15px 12px;
      }
      .sno-cell {
        color: #2563eb;
        font-weight: 600;
      }
      .rate-cell {
        color: #059669;
        font-weight: 600;
      }
      .amount-cell {
        color: #475569;
        font-weight: 600;
      }
    </style>

    <div class="pdf-header">
      <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">View Estimation - Gram Panchayat</h1>
      <p style="font-size: 14px; opacity: 0.95; margin: 0;">${selectedEstimation.mode} Estimation Report</p>
    </div>

    <div class="pdf-engineer-card">
      <h2 style="font-size: 22px; font-weight: bold; margin: 0 0 20px 0;">
        Consulting Engineer: ${consultingEngineer || 'N/A'}
      </h2>
      <div class="pdf-info-grid">
        <div class="pdf-info-box">
          <div class="pdf-info-label">Requisition ID</div>
          <div class="pdf-info-value">${selectedEstimation.id}</div>
        </div>
        <div class="pdf-info-box">
          <div class="pdf-info-label">Handpump ID</div>
          <div class="pdf-info-value">${selectedEstimation.handpumpId}</div>
        </div>
        <div class="pdf-info-box">
          <div class="pdf-info-label">Mode</div>
          <div class="pdf-mode-badge ${isRepair ? 'pdf-mode-repair' : 'pdf-mode-rebore'}">
            ${selectedEstimation.mode}
          </div>
        </div>
      </div>
    </div>

    <div class="pdf-table-container">
      <div class="pdf-table-header">
        <h3 style="font-size: 20px; font-weight: bold; margin: 0;">
          ${selectedEstimation.mode} Estimation Details
        </h3>
      </div>
      
      <table class="pdf-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Item</th>
            <th>Unit</th>
            <th>Rate (Rs.)</th>
            ${!isRepair ? '<th>Reference/Source</th>' : ''}
            ${!isRepair ? '<th>L</th>' : ''}
            ${!isRepair ? '<th>B</th>' : ''}
            ${!isRepair ? '<th>H</th>' : ''}
            <th>Qty.</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td class="sno-cell">${item.sno}</td>
              <td style="max-width: 400px;">${item.item}</td>
              <td>${item.unit}</td>
              <td class="rate-cell">${item.rate ? '₹' + item.rate.toLocaleString() : ''}</td>
              ${!isRepair ? `<td>${item.ref || ''}</td>` : ''}
              ${!isRepair ? `<td>${item.l || ''}</td>` : ''}
              ${!isRepair ? `<td>${item.b || ''}</td>` : ''}
              ${!isRepair ? `<td>${item.h || ''}</td>` : ''}
              <td>${item.qty}</td>
              <td class="amount-cell">${item.amount ? '₹' + item.amount.toLocaleString() : ''}</td>
            </tr>
          `).join('')}
          
          <tr class="row-add-items">
            <td class="sno-cell">${items.length + 1}</td>
            <td><strong>Add Items</strong></td>
            <td></td>
            <td></td>
            ${!isRepair ? '<td></td>' : ''}
            ${!isRepair ? '<td>1</td>' : ''}
            ${!isRepair ? '<td>1</td>' : ''}
            ${!isRepair ? '<td>1</td>' : ''}
            <td></td>
            <td></td>
          </tr>
          
          <tr class="row-total">
            <td class="sno-cell">${items.length + 2}</td>
            <td><strong>Total</strong></td>
            <td colspan="${isRepair ? 3 : 6}"></td>
            <td><strong>₹${calculations.total.toLocaleString()}</strong></td>
          </tr>
          
          <tr class="row-gst">
            <td class="sno-cell">${items.length + 3}</td>
            <td><strong>GST (18%)</strong></td>
            <td colspan="${isRepair ? 3 : 6}"></td>
            <td><strong>₹${calculations.gst.toLocaleString()}</strong></td>
          </tr>
          
          <tr class="row-total-with-gst">
            <td class="sno-cell">${items.length + 4}</td>
            <td><strong>Total (including GST)</strong></td>
            <td colspan="${isRepair ? 3 : 6}"></td>
            <td><strong>₹${calculations.totalWithGST.toLocaleString()}</strong></td>
          </tr>
          
          <tr class="row-consulting-fee">
            <td class="sno-cell">${items.length + 5}</td>
            <td><strong>1% Consulting Engineer Fee for Estimation</strong></td>
            <td colspan="${isRepair ? 3 : 6}"></td>
            <td><strong>₹${calculations.consultingFee.toLocaleString()}</strong></td>
          </tr>
          
          <tr class="row-consulting-fee-mb">
            <td class="sno-cell">${items.length + 6}</td>
            <td><strong>1% Consulting Engineer Fee for MB</strong></td>
            <td colspan="${isRepair ? 3 : 6}"></td>
            <td><strong>₹${calculations.consultingFee.toLocaleString()}</strong></td>
          </tr>
          
          <tr class="row-grand-total">
            <td class="sno-cell">${items.length + 7}</td>
            <td><strong>Grand Total</strong></td>
            <td colspan="${isRepair ? 3 : 6}"></td>
            <td><strong style="font-size: 16px;">₹${(calculations.grandTotal + calculations.consultingFee).toLocaleString()}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  // Append to body temporarily
  document.body.appendChild(printContent);

  try {
    // Import libraries dynamically
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    // Generate canvas from HTML
    const canvas = await html2canvas(printContent, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    // Add image to PDF
    let position = 0;
    const pageHeight = 297; // A4 height in mm
    
    if (imgHeight <= pageHeight) {
      // Single page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    } else {
      // Multiple pages
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

    // Download PDF
    pdf.save(`Estimation_Report_${selectedEstimation.id}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    // Remove temporary element
    document.body.removeChild(printContent);
  }
};

  // Show loading state
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading estimations...</p>
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

  if (selectedEstimation) {
    const isRepair = selectedEstimation.mode === 'REPAIR';
    const calculations = calculateTotal();
    const items = requisitionItems.length > 0 ? requisitionItems : getMasterItems();

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
                Consulting Engineer: {consultingEngineer || 'Loading...'}
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
                    selectedEstimation.mode === 'REPAIR' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {selectedEstimation.mode === 'REPAIR' ? <Wrench size={14} /> : <Drill size={14} />}
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
                  selectedEstimation.mode === 'REPAIR' ? 'bg-blue-500' : 'bg-emerald-500'
                }`}>
                  {selectedEstimation.mode === 'REPAIR' ? <Wrench size={16} /> : <Drill size={16} />}
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
                      {!isRepair && <td className="px-4 py-3 text-sm text-gray-700">{item.ref || ''}</td>}
                      {!isRepair && <td className="px-4 py-3 text-sm text-gray-700">{item.l || ''}</td>}
                      {!isRepair && <td className="px-4 py-3 text-sm text-gray-700">{item.b || ''}</td>}
                      {!isRepair && <td className="px-4 py-3 text-sm text-gray-700">{item.h || ''}</td>}
                      <td className="px-4 py-3 text-sm text-gray-700">{item.qty}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 font-semibold">
                        {item.amount ? `₹${item.amount.toLocaleString()}` : ''}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Add Items Row */}
                  <tr className="bg-amber-50">
                    <td className="px-4 py-3 text-sm font-semibold text-amber-700">{items.length + 1}</td>
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
                    <td className="px-4 py-3 text-sm text-blue-700">{items.length + 2}</td>
                    <td className="px-4 py-3 text-sm text-blue-800">Total</td>
                    <td colSpan={isRepair ? 3 : 6} className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-base text-blue-700">₹{calculations.total.toLocaleString()}</td>
                  </tr>
                  
                  <tr className="bg-indigo-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-indigo-700">{items.length + 3}</td>
                    <td className="px-4 py-3 text-sm text-indigo-800">GST (18%)</td>
                    <td colSpan={isRepair ? 3 : 6} className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-base text-indigo-700">₹{calculations.gst.toLocaleString()}</td>
                  </tr>
                  
                  <tr className="bg-teal-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-teal-700">{items.length + 4}</td>
                    <td className="px-4 py-3 text-sm text-teal-800">Total (including GST)</td>
                    <td colSpan={isRepair ? 3 : 6} className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-base text-teal-700">₹{calculations.totalWithGST.toLocaleString()}</td>
                  </tr>
                  
                  <tr className="bg-cyan-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-cyan-700">{items.length + 5}</td>
                    <td className="px-4 py-3 text-sm text-cyan-800">1% Consulting Engineer Fee for Estimation</td>
                    <td colSpan={isRepair ? 3 : 6} className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-base text-cyan-700">₹{calculations.consultingFee.toLocaleString()}</td>
                  </tr>
                  
                  <tr className="bg-emerald-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-emerald-700">{items.length + 6}</td>
                    <td className="px-4 py-3 text-sm text-emerald-800">1% Consulting Engineer Fee for MB</td>
                    <td colSpan={isRepair ? 3 : 6} className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-base text-emerald-700">₹{calculations.consultingFee.toLocaleString()}</td>
                  </tr>
                  
                  <tr className="bg-green-100 font-bold text-lg border-t-2 border-green-300">
                    <td className="px-4 py-4 text-green-700">{items.length + 7}</td>
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
      <option value="REPAIR" className="text-gray-800">Repair</option>
      <option value="REBORE" className="text-gray-800">Rebore</option>
    </select>
  </div>
  
  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
  <Filter size={18} className="text-white" />
  <select
    value={districtFilter}
    onChange={(e) => {
      setDistrictFilter(e.target.value);
      setBlockFilter('All');
      setGpFilter('All');
    }}
    className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
  >
    {uniqueDistricts.map(district => (
      <option key={district} value={district} className="text-gray-800">
        {district === 'All' ? 'All Districts' : district}
      </option>
    ))}
  </select>
</div>
  
  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
  <Filter size={18} className="text-white" />
  <select
    value={blockFilter}
    onChange={(e) => {
      setBlockFilter(e.target.value);
      setGpFilter('All');
    }}
    className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
  >
    {uniqueBlocks.map(block => (
      <option key={block} value={block} className="text-gray-800">
        {block === 'All' ? 'All Blocks' : block}
      </option>
    ))}
  </select>
</div>
  
  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
    <Filter size={18} className="text-white" />
    <select
      value={gpFilter}
      onChange={(e) => setGpFilter(e.target.value)}
      className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
    >
      {uniqueGPs.map(gp => (
        <option key={gp} value={gp} className="text-gray-800">
          {gp === 'All' ? 'All Gram Panchayats' : gp}
        </option>
      ))}
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

        {/* Professional Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
  <div className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-blue-100 text-sm font-medium">Total Requisitions</p>
        <p className="text-2xl font-bold mt-1">{filteredRequisitions.length}</p>
        <p className="text-blue-200 text-xs mt-1">With Sanctioned Amount</p>
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
        <p className="text-2xl font-bold mt-1">{filteredRequisitions.filter(r => r.mode === 'REPAIR').length}</p>
        <p className="text-teal-200 text-xs mt-1">Active Repairs</p>
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
        <p className="text-2xl font-bold mt-1">{filteredRequisitions.filter(r => r.mode === 'REBORE').length}</p>
        <p className="text-emerald-200 text-xs mt-1">Active Rebores</p>
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
        <p className="text-2xl font-bold mt-1">
          ₹{(filteredRequisitions.reduce((sum, r) => sum + r.sanctionAmount, 0) / 100000).toFixed(2)}L
        </p>
        <p className="text-amber-200 text-xs mt-1">Sanctioned Total</p>
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
      S.No
    </th>
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
      Requisition ID
    </th>
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
      Handpump ID
    </th>
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
      District
    </th>
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
      Block
    </th>
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-blue-200">
      Gram Panchayat
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
{paginatedRequisitions.map((requisition, index) => (                  <tr key={`${requisition.id}-${requisition.orderId}`} className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50 transition-colors duration-300`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-gray-600">{startIndex + index + 1}</span>
                    </td>
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
  <span className="text-sm font-medium text-gray-700">{requisition.district}</span>
</td>
<td className="px-6 py-4 whitespace-nowrap">
  <span className="text-sm font-medium text-gray-700">{requisition.block}</span>
</td>
<td className="px-6 py-4 whitespace-nowrap">
  <span className="text-sm font-medium text-gray-700">{requisition.gramPanchayat}</span>
</td>
<td className="px-6 py-4 whitespace-nowrap">
  <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md ${
    requisition.mode === 'REPAIR' 
      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
  }`}>
    {requisition.mode === 'REPAIR' ? <Wrench size={14} /> : <Drill size={14} />}
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
          
          {filteredRequisitions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Search size={24} className="text-gray-400" />
              </div>
              <p className="text-lg text-gray-500 font-medium">No requisitions found for the selected filter.</p>
              <p className="text-gray-400 mt-1">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              {/* Pagination Controls */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Rows per page selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 font-medium">Rows per page:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredRequisitions.length)} of {filteredRequisitions.length} entries
                    </span>
                  </div>

                  {/* Page navigation */}
                  <div className="flex items-center gap-2">
                    {/* Previous button */}
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      Previous
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-gray-500">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`min-w-[2.5rem] px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                    </div>

                    {/* Next button */}
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEstimationScreen;