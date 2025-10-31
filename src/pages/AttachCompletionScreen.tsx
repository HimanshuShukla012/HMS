import React, { useState, useEffect } from 'react';
import { Filter, Search, Upload, FileText, Calendar, Eye, Wrench, Drill, TrendingUp, CheckCircle, X, Edit, AlertCircle, Loader } from 'lucide-react';
import { useUserInfo } from '../utils/userInfo';

const AttachCompletionScreen = () => {
  const { userId, loading: userLoading, error: userError } = useUserInfo();
  const [filterVillage, setFilterVillage] = useState('All');
  const [filterHandpumpId, setFilterHandpumpId] = useState('');
  const [filterRequisitionId, setFilterRequisitionId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completionId, setCompletionId] = useState('');
  const [completedRequisitions, setCompletedRequisitions] = useState([]);
  
  // Form states
  const [materialBill, setMaterialBill] = useState(null);
  const [materialBillBase64, setMaterialBillBase64] = useState('');
  const [totalMaterialCost, setTotalMaterialCost] = useState('');
  const [totalLabourCost, setTotalLabourCost] = useState('');
  const [dailyWageRate, setDailyWageRate] = useState('');
  const [noOfMandays, setNoOfMandays] = useState('');
  const [validationErrors, setValidationErrors] = useState({
  materialCost: '',
  labourCost: '',
  wageRate: ''
});

  // API states
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [villages, setVillages] = useState(['All']);

  const API_BASE = 'https://hmsapi.kdsgroup.co.in/api';

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

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
          // Transform API data - only show sanctioned requisitions without completion
          // A requisition is considered completed if it has TotalMBAmount (Material Book submitted)
          const transformedData = data.Data
            .filter(req => req.OrderId && !req.TotalMBAmount)
            .map(req => ({
              id: req.RequisitionId?.toString() || 'N/A',
              handpumpId: req.HandpumpId || 'N/A',
              hpId: req.HPId, // Add HPId field
              village: req.Village || 'Unknown',
              mode: req.RequisitionType || 'Unknown',
              requisitionDate: req.RequisitionDate || new Date().toISOString(),
              sanctionDate: req.SanctionDate || req.RequisitionDate || new Date().toISOString(),
              sanctionAmount: req.SanctionAmount ? `₹${req.SanctionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00',
              status: 'Sanctioned',
              orderId: req.OrderId,
              requisitionTypeId: req.RequisitionTypeId,
              sanctionAmountRaw: req.SanctionAmount || 0
            }));

          setRequisitions(transformedData);

          // Extract unique villages
          const uniqueVillages = ['All', ...new Set(transformedData.map(r => r.village).filter(v => v !== 'Unknown'))];
          setVillages(uniqueVillages);
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

  // Calculate number of mandays
  useEffect(() => {
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

const validateCosts = (field, value) => {
  const numValue = parseFloat(value);
  const errors = { ...validationErrors };
  
  if (field === 'materialCost' && numValue > 1000000) {
    errors.materialCost = 'Material cost cannot exceed ₹10,00,000';
  } else if (field === 'materialCost') {
    errors.materialCost = '';
  }
  
  if (field === 'labourCost' && numValue > 1000000) {
    errors.labourCost = 'Labour cost cannot exceed ₹10,00,000';
  } else if (field === 'labourCost') {
    errors.labourCost = '';
  }
  
  if (field === 'wageRate' && numValue > 2000) {
    errors.wageRate = 'Daily wage rate cannot exceed ₹2,000';
  } else if (field === 'wageRate') {
    errors.wageRate = '';
  }
  
  setValidationErrors(errors);
  return !errors.materialCost && !errors.labourCost && !errors.wageRate;
};

  const handleAttachCompletion = (requisition) => {
  setSelectedRequisition(requisition);
  setShowCompletionModal(true);
  // Reset form
  setMaterialBill(null);
  setMaterialBillBase64('');
  setTotalMaterialCost('');
  setTotalLabourCost('');
  setDailyWageRate('');
  setNoOfMandays('');
  setValidationErrors({ materialCost: '', labourCost: '', wageRate: '' });
};


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('=== FILE UPLOAD STARTED ===');
      console.log('File Name:', file.name);
      console.log('File Type:', file.type);
      console.log('File Size:', file.size, 'bytes');
      
      setMaterialBill(file);
      
      // Convert file to base64 with proper prefix based on file type
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('=== FILE CONVERSION COMPLETE ===');
        // Get the base64 result from FileReader
        const base64Result = reader.result;
        console.log('FileReader Result Length:', base64Result.length);
        
        // Extract just the base64 data (remove the data:*/*;base64, prefix)
        const base64Data = base64Result.split(',')[1];
        console.log('Base64 Data Length (without prefix):', base64Data.length);
        console.log('Base64 Data Size (KB):', (base64Data.length / 1024).toFixed(2));
        console.log('Base64 Data Size (MB):', (base64Data.length / 1024 / 1024).toFixed(2));
        
        // Check file size (warn if > 5MB base64)
        if (base64Data.length > 5 * 1024 * 1024) {
          console.warn('⚠️ WARNING: File is large and may cause API issues');
          alert('Warning: This file is quite large. If submission fails, try using a smaller file.');
        }
        
        // Determine the prefix based on file type
        let prefixedBase64 = '';
        const fileType = file.type.toLowerCase();
        
        if (fileType.startsWith('image/')) {
          // For images - use proper data URI format
          prefixedBase64 = `data:${fileType};base64,${base64Data}`;
          console.log('File identified as IMAGE:', fileType);
        } else if (fileType === 'application/pdf') {
          // For PDF files - use proper data URI format
          prefixedBase64 = `data:application/pdf;base64,${base64Data}`;
          console.log('File identified as PDF');
        } else if (fileType.startsWith('video/')) {
          // For videos
          prefixedBase64 = `data:${fileType};base64,${base64Data}`;
          console.log('File identified as VIDEO:', fileType);
        } else {
          // Default: treat as PDF with proper data URI
          prefixedBase64 = `data:application/pdf;base64,${base64Data}`;
          console.log('File identified as UNKNOWN - treating as PDF');
        }
        
        console.log('File type:', fileType);
        console.log('Prefix format:', prefixedBase64.substring(0, 50));
        console.log('Final Base64 length:', prefixedBase64.length);
        console.log('First 100 chars:', prefixedBase64.substring(0, 100));
        console.log('Last 50 chars:', prefixedBase64.substring(prefixedBase64.length - 50));
        
        setMaterialBillBase64(prefixedBase64);
        console.log('=== FILE CONVERSION SAVED TO STATE ===');
      };
      
      reader.onerror = (error) => {
        console.error('=== FILE READER ERROR ===');
        console.error('Error:', error);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
  console.log('=== SUBMIT BUTTON CLICKED ===');
  console.log('Material Bill:', materialBill?.name);
  console.log('Total Material Cost:', totalMaterialCost);
  console.log('Total Labour Cost:', totalLabourCost);
  console.log('Daily Wage Rate:', dailyWageRate);
  console.log('No of Mandays:', noOfMandays);
  
  // Check for validation errors
  const hasErrors = validationErrors.materialCost || validationErrors.labourCost || validationErrors.wageRate;
  
  if (hasErrors) {
    alert('Please fix the validation errors before submitting.');
    return;
  }
  
  if (materialBill && totalMaterialCost && totalLabourCost && dailyWageRate) {
    console.log('All fields valid - showing preview');
    setShowPreview(true);
  } else {
    console.warn('Some fields are missing:', {
      hasMaterialBill: !!materialBill,
      hasTotalMaterialCost: !!totalMaterialCost,
      hasTotalLabourCost: !!totalLabourCost,
      hasDailyWageRate: !!dailyWageRate
    });
  }
};

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      console.log('=== STARTING SUBMISSION PROCESS ===');
      
      const authToken = getAuthToken();
      console.log('Auth Token present:', !!authToken);
      console.log('Auth Token length:', authToken ? authToken.length : 0);
      
      if (!authToken) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Prepare the request body
      const requestBody = {
        RequisitionId: parseInt(selectedRequisition.id),
        Handpump_Id: selectedRequisition.hpId || 0,
        SanctionAmount: selectedRequisition.sanctionAmountRaw || 0,
        TotalMaterialCost: parseFloat(totalMaterialCost),
        TotalLabourCost: parseFloat(totalLabourCost),
        DailyWageRate: parseFloat(dailyWageRate),
        UpdatedBy: userId,
        MaterialBillfileBase64String: materialBillBase64,
        MaterialBillfilePath: materialBill.name
      };

      console.log('=== REQUEST BODY DETAILS ===');
      console.log('Full Request Body:', {
        ...requestBody,
        MaterialBillfileBase64String: requestBody.MaterialBillfileBase64String.substring(0, 100) + '...(truncated)'
      });
      console.log('RequisitionId:', requestBody.RequisitionId, '(Type:', typeof requestBody.RequisitionId + ')');
      console.log('Handpump_Id:', requestBody.Handpump_Id, '(Type:', typeof requestBody.Handpump_Id + ')');
      console.log('SanctionAmount:', requestBody.SanctionAmount, '(Type:', typeof requestBody.SanctionAmount + ')');
      console.log('UpdatedBy:', requestBody.UpdatedBy, '(Type:', typeof requestBody.UpdatedBy + ')');
      console.log('Base64 String Length:', requestBody.MaterialBillfileBase64String.length);
      console.log('Base64 String Prefix:', requestBody.MaterialBillfileBase64String.substring(0, 50));

      console.log('=== MAKING API REQUEST ===');
      console.log('API Endpoint:', `${API_BASE}/HandpumpRequisition/InsertMatrialBookDetails`);
      console.log('Request Headers:', {
        'accept': '*/*',
        'Authorization': 'Bearer ' + authToken.substring(0, 20) + '...',
        'Content-Type': 'application/json'
      });

      const response = await fetch(
        `${API_BASE}/HandpumpRequisition/InsertMatrialBookDetails`,
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

      console.log('=== RESPONSE RECEIVED ===');
      console.log('Response Status:', response.status);
      console.log('Response Status Text:', response.statusText);
      console.log('Response OK:', response.ok);
      console.log('Response Headers:', {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length')
      });

      const responseText = await response.text();
      console.log('=== RESPONSE BODY ===');
      console.log('Response Text Length:', responseText.length);
      console.log('Response Text:', responseText);

      if (!response.ok) {
        console.error('=== API ERROR RESPONSE ===');
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          console.error('Parsed Error Data:', errorData);
        } catch (e) {
          console.error('Could not parse error response as JSON');
          errorData = { Message: responseText };
        }
        throw new Error(errorData.Message || errorData.title || 'Failed to submit completion details');
      }

      console.log('=== PARSING SUCCESS RESPONSE ===');
      const data = JSON.parse(responseText);
      console.log('Parsed Response Data:', data);
      console.log('Response Data Structure:', Object.keys(data));
      console.log('Response Data.Data:', data.Data);
      
      // Set completion ID from response or generate one
      const newCompletionId = data.Data?.CompletionId || 'COMP' + Math.random().toString(36).substr(2, 6).toUpperCase();
      console.log('Generated/Received Completion ID:', newCompletionId);
      setCompletionId(newCompletionId);
      
      console.log('=== CLOSING MODALS ===');
      setShowPreview(false);
      setShowCompletionModal(false);
      setShowSuccessModal(true);
      
      console.log('=== REFRESHING REQUISITIONS LIST ===');
      console.log('Using userId from hook:', userId);
      
      if (userId) {
        // Wait a bit for the API to finish processing
        console.log('Waiting 1 second for API processing...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Re-fetch requisitions using userId from hook
        console.log('Fetching updated requisitions...');
        const reqResponse = await fetch(
          `${API_BASE}/HandpumpRequisition/GetRequisitionListByUserId?UserId=${userId}`,
          {
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${authToken}`
            }
          }
        );

        console.log('Refresh Response Status:', reqResponse.status);
        console.log('Refresh Response OK:', reqResponse.ok);

        if (reqResponse.ok) {
          const reqData = await reqResponse.json();
          console.log('Refreshed Data:', reqData);
          console.log('Refreshed Data.Data length:', reqData?.Data?.length);
          
          if (reqData && reqData.Data && Array.isArray(reqData.Data)) {
            console.log('Raw API Data (first 3 items):', reqData.Data.slice(0, 3));
            
            const transformedData = reqData.Data
              .filter(req => {
                const isFiltered = req.OrderId && !req.TotalMBAmount;
                console.log(`Requisition ${req.RequisitionId}: OrderId=${req.OrderId}, TotalMBAmount=${req.TotalMBAmount}, Filtered=${isFiltered}`);
                return isFiltered;
              })
              .map(req => ({
                id: req.RequisitionId?.toString() || 'N/A',
                handpumpId: req.HandpumpId || 'N/A',
                village: req.Village || 'Unknown',
                mode: req.RequisitionType || 'Unknown',
                requisitionDate: req.RequisitionDate || new Date().toISOString(),
                sanctionDate: req.SanctionDate || req.RequisitionDate || new Date().toISOString(),
                sanctionAmount: req.SanctionAmount ? `₹${req.SanctionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00',
                status: 'Sanctioned',
                orderId: req.OrderId,
                requisitionTypeId: req.RequisitionTypeId,
                sanctionAmountRaw: req.SanctionAmount || 0
              }));
            console.log('Transformed Data Count:', transformedData.length);
            console.log('Transformed Data:', transformedData);
            console.log('Previous requisitions count:', requisitions.length);
            console.log('New requisitions count:', transformedData.length);
            
            if (requisitions.length !== transformedData.length) {
              console.log('✅ List updated! Requisition removed from list.');
            } else {
              console.log('⚠️ List count unchanged. The requisition might still be pending API update.');
            }
            
            setRequisitions(transformedData);
          }
        } else {
          console.error('Failed to refresh requisitions:', reqResponse.status);
          const errorText = await reqResponse.text();
          console.error('Refresh Error Response:', errorText);
        }
      } else {
        console.error('UserId not available for refresh');
      }
      
      console.log('=== SUBMISSION COMPLETE ===');
      setSubmitting(false);
    } catch (err) {
      console.error('=== SUBMISSION ERROR ===');
      console.error('Error Type:', err.name);
      console.error('Error Message:', err.message);
      console.error('Error Stack:', err.stack);
      alert(`Error: ${err.message}`);
      setSubmitting(false);
    }
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

  // Calculate stats
  const stats = {
    totalSanctioned: requisitions.length,
    totalAmount: requisitions.reduce((sum, r) => sum + r.sanctionAmountRaw, 0)
  };

  // Show loading state
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading requisitions...</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Sanctioned</p>
                <p className="text-2xl font-bold mt-1">{stats.totalSanctioned}</p>
                <p className="text-blue-200 text-xs mt-1">Pending Completion</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
          
          
          <div className="group bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold mt-1">₹{(stats.totalAmount / 100000).toFixed(2)}L</p>
                <p className="text-emerald-200 text-xs mt-1">Sanctioned total</p>
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
                    Village
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
                      <span className="text-sm font-medium text-gray-700">{requisition.village}</span>
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
  accept=".pdf,application/pdf"
  onChange={handleFileUpload}
/>
                  <label 
                    htmlFor="material-bill" 
                    className="cursor-pointer bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors inline-block"
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
  <div>
    <input
  type="number"
  value={totalMaterialCost}
  onChange={(e) => {
    const value = e.target.value;
    setTotalMaterialCost(value);
    if (value) validateCosts('materialCost', value);
  }}
  onInput={(e) => {
    // Prevent entering values greater than 1000000
    if (parseFloat(e.target.value) > 1000000) {
      e.target.value = '1000000';
      setTotalMaterialCost('1000000');
      validateCosts('materialCost', '1000000');
    }
  }}
  onKeyDown={(e) => {
    // Prevent minus/negative sign
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  }}
  onPaste={(e) => {
    // Prevent pasting negative values
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes('-')) {
      e.preventDefault();
    }
  }}
  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
    validationErrors.materialCost 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-green-500'
  }`}
  placeholder="Enter material cost"
  min="0"
  max="1000000"
  step="0.01"
/>
    {validationErrors.materialCost && (
      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
        <AlertCircle size={12} />
        {validationErrors.materialCost}
      </p>
    )}
    <p className="text-gray-500 text-xs mt-1">Maximum: ₹10,00,000</p>
  </div>
</div>
                
                <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Total Labour Cost (₹) *
  </label>
  <div>
    <input
  type="number"
  value={totalLabourCost}
  onChange={(e) => {
    const value = e.target.value;
    setTotalLabourCost(value);
    if (value) validateCosts('labourCost', value);
  }}
  onInput={(e) => {
    // Prevent entering values greater than 1000000
    if (parseFloat(e.target.value) > 1000000) {
      e.target.value = '1000000';
      setTotalLabourCost('1000000');
      validateCosts('labourCost', '1000000');
    }
  }}
  onKeyDown={(e) => {
    // Prevent minus/negative sign
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  }}
  onPaste={(e) => {
    // Prevent pasting negative values
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes('-')) {
      e.preventDefault();
    }
  }}
  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
    validationErrors.labourCost 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-green-500'
  }`}
  placeholder="Enter labour cost"
  min="0"
  max="1000000"
  step="0.01"
/>
    {validationErrors.labourCost && (
      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
        <AlertCircle size={12} />
        {validationErrors.labourCost}
      </p>
    )}
    <p className="text-gray-500 text-xs mt-1">Maximum: ₹10,00,000</p>
  </div>
</div>
                
                <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Daily Wage Rate (₹) *
  </label>
  <div>
    <input
  type="number"
  value={dailyWageRate}
  onChange={(e) => {
    const value = e.target.value;
    setDailyWageRate(value);
    if (value) validateCosts('wageRate', value);
  }}
  onInput={(e) => {
    // Prevent entering values greater than 2000
    if (parseFloat(e.target.value) > 2000) {
      e.target.value = '2000';
      setDailyWageRate('2000');
      validateCosts('wageRate', '2000');
    }
  }}
  onKeyDown={(e) => {
    // Prevent minus/negative sign
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  }}
  onPaste={(e) => {
    // Prevent pasting negative values
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes('-')) {
      e.preventDefault();
    }
  }}
  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
    validationErrors.wageRate 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-green-500'
  }`}
  placeholder="Enter daily wage rate"
  min="0"
  max="2000"
  step="0.01"
/>
    {validationErrors.wageRate && (
      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
        <AlertCircle size={12} />
        {validationErrors.wageRate}
      </p>
    )}
    <p className="text-gray-500 text-xs mt-1">Maximum: ₹2,000</p>
  </div>
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
  disabled={
    !materialBill || 
    !totalMaterialCost || 
    !totalLabourCost || 
    !dailyWageRate ||
    validationErrors.materialCost ||
    validationErrors.labourCost ||
    validationErrors.wageRate
  }
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
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit size={16} />
                  Edit Details
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Confirm Submission
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