import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Camera, Upload, X, FileText, Wrench, Drill, CheckCircle, AlertCircle, MapPin, Settings } from "lucide-react";

const RaiseRequisition = () => {
  type Handpump = { 
    HandpumpId: number; 
    HandpumpName: string;
    VillageName?: string;
    Status?: string;
  };

  // State for handpumps and form
  const [handpumps, setHandpumps] = useState<Handpump[]>([]);
  const [selectedHandpumpId, setSelectedHandpumpId] = useState<number | null>(null);
  const [requisitionMode, setRequisitionMode] = useState("");
  const [handpumpImage, setHandpumpImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({
    handpump: "",
    requisitionMode: "",
    image: ""
  });

  // Mock userId - replace with actual user context
  const userId = 1; // This should come from useUserInfo hook

  // Check if all mandatory fields are filled
  const isMandatoryFieldsFilled = () => {
    return (
      selectedHandpumpId !== null &&
      requisitionMode !== "" &&
      handpumpImage !== null
    );
  };

  // Fetch handpumps on component mount
  useEffect(() => {
    // Mock API call - replace with actual API endpoint
    const fetchHandpumps = async () => {
      try {
        // Simulated API response
        const mockHandpumps = [
          { HandpumpId: 1, HandpumpName: "HP-001", VillageName: "Village A", Status: "Active" },
          { HandpumpId: 2, HandpumpName: "HP-002", VillageName: "Village B", Status: "Inactive" },
          { HandpumpId: 3, HandpumpName: "HP-003", VillageName: "Village C", Status: "Active" },
          { HandpumpId: 4, HandpumpName: "HP-004", VillageName: "Village A", Status: "Under Maintenance" },
        ];
        setHandpumps(mockHandpumps);
      } catch (error) {
        toast.error("Failed to fetch handpumps");
      }
    };

    fetchHandpumps();
  }, []);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: "Please select a valid image file" }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image size should be less than 5MB" }));
        return;
      }

      setHandpumpImage(file);
      setErrors(prev => ({ ...prev, image: "" }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
      handpump: !selectedHandpumpId ? "Please select a handpump" : "",
      requisitionMode: !requisitionMode ? "Please select requisition mode" : "",
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
      // Prepare form data for API
      const formData = new FormData();
      formData.append('HandpumpId', selectedHandpumpId?.toString() || '');
      formData.append('RequisitionMode', requisitionMode);
      formData.append('HandpumpImage', handpumpImage as File);
      formData.append('CreatedBy', userId.toString());
      formData.append('DeviceToken', '');
      formData.append('IPAddress', '');

      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Reset form after successful submission
      resetForm();
      
    } catch (error) {
      toast.error("Failed to raise requisition. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedHandpumpId(null);
    setRequisitionMode("");
    setHandpumpImage(null);
    setImagePreview("");
    setErrors({
      handpump: "",
      requisitionMode: "",
      image: ""
    });
  };

  // Get selected handpump details
  const getSelectedHandpump = () => {
    return handpumps.find(hp => hp.HandpumpId === selectedHandpumpId);
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
                <p className="text-blue-100 text-sm font-medium">Available Handpumps</p>
                <p className="text-2xl font-bold mt-1">{handpumps.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Settings size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Active Handpumps</p>
                <p className="text-2xl font-bold mt-1">{handpumps.filter(hp => hp.Status === 'Active').length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Need Maintenance</p>
                <p className="text-2xl font-bold mt-1">{handpumps.filter(hp => hp.Status !== 'Active').length}</p>
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
                {/* Handpump Selection */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600" />
                    Select Handpump <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedHandpumpId || ""}
                    onChange={(e) => {
                      setSelectedHandpumpId(Number(e.target.value));
                      setErrors(prev => ({ ...prev, handpump: "" }));
                    }}
                    className={`w-full border-2 rounded-lg px-4 py-3 text-lg font-medium bg-white shadow-sm transition-all duration-300 ${
                      errors.handpump 
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    } focus:outline-none focus:ring-4`}
                  >
                    <option value="" className="text-gray-500">Choose a handpump for maintenance</option>
                    {handpumps.map((hp) => (
                      <option key={hp.HandpumpId} value={hp.HandpumpId}>
                        {hp.HandpumpName} - {hp.VillageName} ({hp.Status})
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
                        setErrors(prev => ({ ...prev, requisitionMode: "" }));
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
                        setErrors(prev => ({ ...prev, requisitionMode: "" }));
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
                          accept="image/*"
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
                    Supported formats: JPG, PNG, GIF. Maximum size: 5MB
                  </p>
                </div>

                {/* Selected Handpump Details */}
                {selectedHandpumpId && (
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200 transform transition-all duration-500">
                    <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
                      <CheckCircle size={20} />
                      Selected Handpump Details
                    </h3>
                    {(() => {
                      const hp = getSelectedHandpump();
                      if (!hp) return null;
                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-teal-100">
                            <span className="font-medium text-gray-700">Handpump ID:</span>
                            <span className="font-bold text-teal-700">{hp.HandpumpName}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-teal-100">
                            <span className="font-medium text-gray-700">Village:</span>
                            <span className="font-bold text-teal-700">{hp.VillageName}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-teal-100">
                            <span className="font-medium text-gray-700">Current Status:</span>
                            <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                              hp.Status === 'Active' 
                                ? 'bg-green-100 text-green-700'
                                : hp.Status === 'Inactive'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {hp.Status}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
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