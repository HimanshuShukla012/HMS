import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Camera, Upload, X, FileText, Wrench, Drill, CheckCircle, AlertCircle, MapPin, Settings } from "lucide-react";
import { useUserInfo } from '../utils/userInfo';

// Image compression function
const compressImage = (file: File, targetSizeKB: number = 400): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions to reduce file size
        const maxDimension = 1920; // Max width or height
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Start with quality 0.9 and reduce if needed
        let quality = 0.9;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Keep reducing quality until size is under target
        while (compressedDataUrl.length > targetSizeKB * 1024 * 1.37 && quality > 0.1) {
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        // Ensure it's above 150KB
        if (compressedDataUrl.length < 150 * 1024 * 1.37) {
          quality = 0.8;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const RaiseRequisition = () => {
  type Handpump = { 
    Id: number; 
    HandpumpId: string;
  };

  type Village = {
    Id: number;
    GramPanchayatId: number;
    VillageName: string;
    Code: string | null;
  };

  // State for villages and handpumps
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);
  const [handpumps, setHandpumps] = useState<Handpump[]>([]);
  const [selectedHandpumpId, setSelectedHandpumpId] = useState<number | null>(null);
  const [requisitionMode, setRequisitionMode] = useState("");
  const [repairType, setRepairType] = useState<number | null>(null);
  const [handpumpImage, setHandpumpImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState({
  village: "",
  handpump: "",
  requisitionMode: "",
  repairType: "",
  image: ""
});

  const { userId } = useUserInfo();


  // Get auth token from storage
useEffect(() => {
  const token = localStorage.getItem('authToken') || 
                sessionStorage.getItem('authToken') ||
                localStorage.getItem('token') ||
                sessionStorage.getItem('token');
  
  if (token) {
    setAuthToken(token);
  } else {
    toast.error("Authentication token not found. Please log in again.");
  }
}, []);

  const API_BASE = 'https://hmsapi.kdsgroup.co.in/api';
  

  // Check if all mandatory fields are filled
  const isMandatoryFieldsFilled = () => {
  const baseFieldsFilled = selectedVillageId !== null &&
    selectedHandpumpId !== null &&
    requisitionMode !== "" &&
    handpumpImage !== null;
  
  // For Repair mode, repair type must be selected
  if (requisitionMode === "Repair") {
    return baseFieldsFilled && repairType !== null;
  }
  
  return baseFieldsFilled;
};

  // Fetch villages on component mount
  useEffect(() => {
    if (!userId || !authToken) return;

    const fetchVillages = async () => {
      if (!authToken) {
    toast.error("Authentication token not available");
    return;
  }
      
      try {
        const response = await fetch(
      `${API_BASE}/Master/GetVillagesByUserId?UserId=${userId}`,
      {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

        if (!response.ok) throw new Error('Failed to fetch villages');
        const data = await response.json();

        if (data.Status && data.Data) {
          setVillages(data.Data);
        } else {
          toast.error("Failed to load villages");
        }
      } catch (error) {
        console.error('Error fetching villages:', error);
        toast.error("Failed to fetch villages");
      }
    };

    fetchVillages();
  }, [userId, authToken]);

  // Fetch handpumps when village is selected
  useEffect(() => {
    if (!selectedVillageId) {
      setHandpumps([]);
      setSelectedHandpumpId(null);
      return;
    }

    const fetchHandpumps = async () => {
  if (!authToken) {
    toast.error("Authentication token not available");
    return;
  }
  
  try {
    const response = await fetch(
      `${API_BASE}/HandpumpRequisition/GetHandpumpListByVillege?villegeId=${selectedVillageId}`,
      {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

        if (!response.ok) throw new Error('Failed to fetch handpumps');
        const data = await response.json();

        if (data.Status && data.Data) {
          setHandpumps(data.Data);
        } else {
          toast.error("No handpumps found for selected village");
          setHandpumps([]);
        }
      } catch (error) {
        console.error('Error fetching handpumps:', error);
        toast.error("Failed to fetch handpumps");
        setHandpumps([]);
      }
    };

    fetchHandpumps();
  }, [selectedVillageId]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Validate file type - only JPEG
    if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
      setErrors(prev => ({ ...prev, image: "Please select a JPEG image file only" }));
      toast.error("Only JPEG images are allowed");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "Image size should be less than 5MB" }));
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      // Check if compression is needed (file > 500KB)
      const fileSizeKB = file.size / 1024;
      let finalDataUrl: string;
      
      if (fileSizeKB > 500) {
        toast.info("Compressing image...");
        finalDataUrl = await compressImage(file, 400); // Target 400KB
        
        // Verify compressed size
        const compressedSizeKB = (finalDataUrl.length * 0.75) / 1024; // Approximate size
        console.log(`Original size: ${fileSizeKB.toFixed(2)}KB, Compressed size: ${compressedSizeKB.toFixed(2)}KB`);
        
        if (compressedSizeKB > 500) {
          toast.warning("Image compressed but still large. Reducing quality further...");
          finalDataUrl = await compressImage(file, 350);
        }
        
        toast.success("Image compressed successfully");
      } else {
        // No compression needed, but ensure proper format
        const reader = new FileReader();
        finalDataUrl = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      
      // Ensure the format is exactly: data:image/jpeg;base64,
      if (!finalDataUrl.startsWith('data:image/jpeg;base64,')) {
        const base64Part = finalDataUrl.split(',')[1];
        finalDataUrl = `data:image/jpeg;base64,${base64Part}`;
      }

      setHandpumpImage(file);
      setImagePreview(finalDataUrl);
      setErrors(prev => ({ ...prev, image: "" }));
      
    } catch (error) {
      console.error('Error processing image:', error);
      setErrors(prev => ({ ...prev, image: "Failed to process image" }));
      toast.error("Failed to process image. Please try another image.");
    }
  }
};

  // Remove uploaded image
  const removeImage = () => {
    setHandpumpImage(null);
    setImagePreview("");
    setErrors(prev => ({ ...prev, image: "" }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mandatory fields
    const mandatoryErrors = {
  village: !selectedVillageId ? "Please select a village" : "",
  handpump: !selectedHandpumpId ? "Please select a handpump" : "",
  requisitionMode: !requisitionMode ? "Please select requisition mode" : "",
  repairType: (requisitionMode === "Repair" && !repairType) ? "Please select repair type" : "",
  image: !handpumpImage ? "Please attach handpump image" : ""
};

    setErrors(mandatoryErrors);

    // Check if there are any errors
    const hasErrors = Object.values(mandatoryErrors).some(error => error !== "");
    if (hasErrors) {
      toast.error("Please fill all mandatory fields");
      return;
    }

    setLoading(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(handpumpImage);
      
      reader.onload = async () => {
  // Use the already processed image preview (which is compressed if needed)
  let base64Data = imagePreview;
  
  // Ensure the format is exactly: data:image/jpeg;base64,
  if (!base64Data.startsWith('data:image/jpeg;base64,')) {
    const base64Part = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    base64Data = `data:image/jpeg;base64,${base64Part}`;
  }

  console.log('Base64 format check:', base64Data.substring(0, 30));
  console.log('Base64 size (KB):', ((base64Data.length * 0.75) / 1024).toFixed(2));

  // Prepare request body according to API spec
  const requestBody = {
  RequisitionId: 0,
  UserId: userId,
  HandpumpId: selectedHandpumpId,
  VillageId: selectedVillageId,
  RequisitionType: requisitionMode === "Repair" ? 1 : 2,
  RequisitionRepairType: requisitionMode === "Repair" ? (repairType || 0) : 1,
  RequisitionDate: new Date().toISOString(),
  RequisitionDescription: `${requisitionMode} requisition for handpump`,
  RequisitionStatus: true,
  UpdatedBy: userId,
  ImageBase64String: base64Data,
  HandpumpPhotoPath: ""
};

        try {
          if (!authToken) {
  toast.error("Authentication token not available");
  setLoading(false);
  return;
}

const response = await fetch(
  `${API_BASE}/HandpumpRequisition/InsertRequisitionDetails`,
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

          if (!response.ok) throw new Error('Failed to submit requisition');
          const data = await response.json();

          if (data.Status) {
            setShowSuccessModal(true);
            resetForm();
            toast.success(data.Message || "Requisition raised successfully");
          } else {
            toast.error(data.Message || "Failed to raise requisition");
          }
        } catch (error) {
          console.error('Error submitting requisition:', error);
          toast.error("Failed to raise requisition. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        toast.error("Failed to process image");
        setLoading(false);
      };
      
    } catch (error) {
      toast.error("Failed to raise requisition. Please try again.");
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
  setSelectedVillageId(null);
  setSelectedHandpumpId(null);
  setRequisitionMode("");
  setRepairType(null);
  setHandpumpImage(null);
  setImagePreview("");
  setErrors({
    village: "",
    handpump: "",
    requisitionMode: "",
    repairType: "",
    image: ""
  });
};

  // Get selected village name
  const getSelectedVillage = () => {
    return villages.find(v => v.Id === selectedVillageId);
  };

  // Get selected handpump name
  const getSelectedHandpump = () => {
    return handpumps.find(hp => hp.Id === selectedHandpumpId);
  };

  // Success Modal Component
  const SuccessModal = () => {
    if (!showSuccessModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-pulse">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Requisition Raised Successfully!
            </h3>
            <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mx-auto mb-4 rounded-full"></div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your requisition has been raised successfully for the selected Handpump. 
              Please wait for the E-Estimation from the concerned Consulting Engineer (CE).
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-6xl mx-auto">
        {/* Professional Header */}
        <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-blue-900 rounded-xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <FileText size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Raise Requisition</h1>
                <p className="text-gray-200 text-lg mt-1">Gram Panchayat - Handpump Maintenance Request</p>
              </div>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
            <p className="text-gray-300 mt-4 text-lg leading-relaxed">
              Submit a requisition request for handpump maintenance. Please provide all required details including current handpump image for assessment.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Villages</p>
                <p className="text-2xl font-bold mt-1">{villages.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <MapPin size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Available Handpumps</p>
                <p className="text-2xl font-bold mt-1">{handpumps.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Settings size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending Actions</p>
                <p className="text-2xl font-bold mt-1">
                  {isMandatoryFieldsFilled() ? 'Ready' : 'Fill Form'}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-700 to-slate-700 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText size={20} />
              </div>
              Requisition Details
            </h2>
            <p className="text-gray-200 mt-2">Complete all required fields to submit your maintenance request</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Village Selection */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin size={20} className="text-purple-600" />
                    Select Village <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedVillageId || ""}
                    onChange={(e) => {
                      setSelectedVillageId(Number(e.target.value));
                      setSelectedHandpumpId(null);
                      setErrors(prev => ({ ...prev, village: "" }));
                    }}
                    className={`w-full border-2 rounded-lg px-4 py-3 text-lg font-medium bg-white shadow-sm transition-all duration-300 ${
                      errors.village 
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                    } focus:outline-none focus:ring-4`}
                  >
                    <option value="" className="text-gray-500">Choose your village</option>
                    {villages.map((village) => (
                      <option key={village.Id} value={village.Id}>
                        {village.VillageName}
                      </option>
                    ))}
                  </select>
                  {errors.village && (
                    <div className="flex items-center gap-2 mt-2 text-red-600">
                      <AlertCircle size={16} />
                      <p className="text-sm font-medium">{errors.village}</p>
                    </div>
                  )}
                </div>

                {/* Handpump Selection */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Settings size={20} className="text-blue-600" />
                    Select Handpump <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedHandpumpId || ""}
                    onChange={(e) => {
                      setSelectedHandpumpId(Number(e.target.value));
                      setErrors(prev => ({ ...prev, handpump: "" }));
                    }}
                    disabled={!selectedVillageId}
                    className={`w-full border-2 rounded-lg px-4 py-3 text-lg font-medium bg-white shadow-sm transition-all duration-300 ${
                      errors.handpump 
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    } focus:outline-none focus:ring-4 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  >
                    <option value="" className="text-gray-500">
                      {!selectedVillageId ? 'Select village first' : 'Choose a handpump for maintenance'}
                    </option>
                    {handpumps.map((hp) => (
                      <option key={hp.Id} value={hp.Id}>
                        {hp.HandpumpId}
                      </option>
                    ))}
                  </select>
                  {errors.handpump && (
                    <div className="flex items-center gap-2 mt-2 text-red-600">
                      <AlertCircle size={16} />
                      <p className="text-sm font-medium">{errors.handpump}</p>
                    </div>
                  )}
                </div>

                {/* Requisition Mode */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                  <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Settings size={20} className="text-emerald-600" />
                    Mode of Requisition <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
  setRequisitionMode("Repair");
  setRepairType(null); // Reset repair type when mode changes
  setErrors(prev => ({ ...prev, requisitionMode: "", repairType: "" }));
}}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 flex items-center gap-3 ${
                        requisitionMode === "Repair"
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <Wrench size={20} />
                      <div className="text-left">
                        <div className="font-semibold">Repair</div>
                        <div className="text-sm opacity-70">Fix existing issues</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
  setRequisitionMode("Rebore");
  setRepairType(null); // Reset repair type when mode changes to Rebore
  setErrors(prev => ({ ...prev, requisitionMode: "", repairType: "" }));
}}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 flex items-center gap-3 ${
                        requisitionMode === "Rebore"
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <Drill size={20} />
                      <div className="text-left">
                        <div className="font-semibold">Rebore</div>
                        <div className="text-sm opacity-70">Complete rebuild</div>
                      </div>
                    </button>
                  </div>
                  {errors.requisitionMode && (
                    <div className="flex items-center gap-2 mt-3 text-red-600">
                      <AlertCircle size={16} />
                      <p className="text-sm font-medium">{errors.requisitionMode}</p>
                    </div>
                  )}
                </div>
                {/* Repair Type Selection - Only show when Repair mode is selected */}
{requisitionMode === "Repair" && (
  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
    <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
      <Settings size={20} className="text-indigo-600" />
      Type of Repair <span className="text-red-500">*</span>
    </label>
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => {
          setRepairType(1);
          setErrors(prev => ({ ...prev, repairType: "" }));
        }}
        className={`p-4 rounded-lg border-2 transition-all duration-300 flex items-center gap-3 ${
          repairType === 1
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
            : 'border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50'
        }`}
      >
        <Settings size={20} />
        <div className="text-left">
          <div className="font-semibold">Civil</div>
          <div className="text-sm opacity-70">Structural repairs</div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => {
          setRepairType(2);
          setErrors(prev => ({ ...prev, repairType: "" }));
        }}
        className={`p-4 rounded-lg border-2 transition-all duration-300 flex items-center gap-3 ${
          repairType === 2
            ? 'border-purple-500 bg-purple-50 text-purple-700'
            : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
        }`}
      >
        <Wrench size={20} />
        <div className="text-left">
          <div className="font-semibold">Mechanical</div>
          <div className="text-sm opacity-70">Equipment repairs</div>
        </div>
      </button>
    </div>
    {errors.repairType && (
      <div className="flex items-center gap-2 mt-3 text-red-600">
        <AlertCircle size={16} />
        <p className="text-sm font-medium">{errors.repairType}</p>
      </div>
    )}
  </div>
)}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Camera size={20} className="text-amber-600" />
                    Handpump Image <span className="text-red-500">*</span>
                  </label>
                  <div className={`border-3 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                    errors.image 
                      ? 'border-red-400 bg-red-50' 
                      : handpumpImage 
                        ? 'border-emerald-400 bg-emerald-50' 
                        : 'border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-50'
                  }`}>
                    {!handpumpImage ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl mx-auto flex items-center justify-center">
                          <Camera className="w-8 h-8 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-700 mb-2">
                            Upload Current Handpump Image
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Take a clear photo of the handpump showing its current condition
                          </p>
                        </div>
                        <input
  type="file"
  accept="image/jpeg,image/jpg"
  onChange={handleImageUpload}
  className="hidden"
  id="image-upload"
/>
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:from-amber-700 hover:to-orange-700 cursor-pointer transition-all duration-300 transform hover:scale-105"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Choose Image
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Handpump"
                          className="w-full h-48 object-cover rounded-lg shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-all duration-300 transform hover:scale-110"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200">
                          <p className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                            <CheckCircle size={16} />
                            {handpumpImage.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            File size: {(handpumpImage.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.image && (
                    <div className="flex items-center gap-2 mt-3 text-red-600">
                      <AlertCircle size={16} />
                      <p className="text-sm font-medium">{errors.image}</p>
                    </div>
                  )}
                  <p className="text-gray-500 text-sm mt-3 flex items-center gap-2">
  <FileText size={14} />
  Only JPEG format. Images over 500KB will be automatically compressed.
</p>
                </div>

                {/* Selected Details */}
                {(selectedVillageId || selectedHandpumpId) && (
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200 transform transition-all duration-500">
                    <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
                      <CheckCircle size={20} />
                      Selection Summary
                    </h3>
                    <div className="space-y-3">
                      {selectedVillageId && (
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-teal-100">
                          <span className="font-medium text-gray-700">Village:</span>
                          <span className="font-bold text-teal-700">{getSelectedVillage()?.VillageName}</span>
                        </div>
                      )}
                      {selectedHandpumpId && (
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-teal-100">
                          <span className="font-medium text-gray-700">Handpump ID:</span>
                          <span className="font-bold text-teal-700">{getSelectedHandpump()?.HandpumpId}</span>
                        </div>
                      )}
                      {requisitionMode && (
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-teal-100">
                          <span className="font-medium text-gray-700">Mode:</span>
                          <span className="font-bold text-teal-700">{requisitionMode}</span>
                        </div>
                      )}
                      {requisitionMode === "Repair" && repairType && (
  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-teal-100">
    <span className="font-medium text-gray-700">Repair Type:</span>
    <span className="font-bold text-teal-700">{repairType === 1 ? 'Civil' : 'Mechanical'}</span>
  </div>
)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Reset Form
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isMandatoryFieldsFilled() || loading}
                className={`px-8 py-3 font-semibold rounded-lg shadow-lg transition-all duration-300 transform flex items-center justify-center gap-3 ${
                  isMandatoryFieldsFilled() && !loading
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-xl hover:scale-105' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                {loading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                )}
                <FileText size={18} />
                {loading ? 'Submitting Request...' : 'Raise Requisition'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal />
    </div>
  );
};

export default RaiseRequisition;