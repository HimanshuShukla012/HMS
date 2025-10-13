import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { useUserInfo } from '../utils/userInfo';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

type LodgeHandpumpComplaintProps = {
  isModal?: boolean;
  onClose?: () => void;
};

// Handpump specific complaint categories
const HANDPUMP_COMPLAINT_CATEGORIES: { label: string; days: number }[] = [
  { label: "Handpump Not Working", days: 2 },
  { label: "Water Quality Issues", days: 3 },
  { label: "Handle/Lever Problems", days: 1 },
  { label: "Water Flow Issues - Low Pressure", days: 2 },
  { label: "Water Flow Issues - No Water", days: 1 },
  { label: "Platform Damage/Missing", days: 5 },
  { label: "Drainage Problems", days: 4 },
  { label: "Soak Pit Issues", days: 4 },
  { label: "Pipe Leakage/Burst", days: 2 },
  { label: "Handpump Body Damage", days: 3 },
  { label: "Rod/Cylinder Problems", days: 3 },
  { label: "Water Contamination", days: 1 },
  { label: "Maintenance Required", days: 7 },
  { label: "Handpump Needs Repair", days: 5 },
  { label: "Other", days: 7 },
];

interface District {
  Id: number;
  DistrictName: string;
  Code: string;
}

interface Block {
  Id: number;
  DistrictId: number;
  BlockName: string;
  Code: string;
}

interface GramPanchayat {
  Id: number;
  BlockId: number;
  GramPanchayatName: string;
  Code: string;
}

interface Village {
  Id: number;
  GramPanchayatId: number;
  VillageName: string;
  Code: string;
}

interface Handpump {
  HandpumpId: number;
  HandpumpCode: string;
  Location: string;
  Status: string;
}

const LodgeComplaint: React.FC<LodgeHandpumpComplaintProps> = ({ isModal = false, onClose }) => {
  const { userId, loading: userLoading, error: userError } = useUserInfo();
  
  // State for dropdowns
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);
  
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  
  const [handpumps, setHandpumps] = useState<Handpump[]>([]);
  const [selectedHandpump, setSelectedHandpump] = useState<Handpump | null>(null);

  // Form fields
  const [form, setForm] = useState({
    complainantName: "",
    complainantContact: "",
    landmark: "",
    category: "",
    resolutionDays: "",
    otherCategory: "",
    description: "",
    urgency: "Medium", // Low, Medium, High, Critical
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<string>("");

  // API base URL
  const API_BASE = 'https://hmsapi.kdsgroup.co.in/api';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

  // Validation function to check if all mandatory fields are filled
  const areAllMandatoryFieldsFilled = (): boolean => {
    const mandatoryFields = [
      selectedDistrictId,
      selectedBlockId,
      selectedGramPanchayatId,
      selectedVillage,
      selectedHandpump,
      form.complainantName,
      form.complainantContact,
      form.landmark,
      form.category,
      form.description,
    ];

    // If category is "Other", also check otherCategory field
    if (form.category === "Other") {
      mandatoryFields.push(form.otherCategory.trim());
    }

    return mandatoryFields.every(field => field !== null && field !== "" && field !== undefined);
  };

  // Get role from token
  useEffect(() => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload?.Role || payload?.UserRoll || "");
    } catch (e) {
      console.error("Failed to decode token", e);
    }
  }, []);

  // Fetch districts when component loads
  useEffect(() => {
    if (userLoading || !userId) return;
    
    const authToken = getAuthToken();
    if (!authToken) {
      toast.error('Authentication token not found. Please login again.');
      return;
    }

    fetch(`${API_BASE}/Master/GetDistrictByUserId?UserId=${userId}`, {
      method: "POST",
      headers: { 
        accept: "*/*",
        Authorization: `Bearer ${authToken}`
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Districts API response:', data);
        if (data.Status && data.Data && data.Data.length) {
          setDistricts(data.Data);
          if (role.toLowerCase().includes("grampanchayat") || role.toLowerCase().includes("gram_panchayat")) {
            setSelectedDistrictId(data.Data[0].Id);
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching districts:', err);
        toast.error("Failed to fetch districts");
      });
  }, [userLoading, userId, role]);

  // Fetch blocks when district changes
  useEffect(() => {
    if (!selectedDistrictId) return;
    
    const authToken = getAuthToken();
    if (!authToken) return;

    fetch(`${API_BASE}/Master/GetBlockListByDistrict`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ Id: selectedDistrictId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Blocks API response:', data);
        if (data.Status && data.Data && data.Data.length) {
          setBlocks(data.Data);
          if (role.toLowerCase().includes("grampanchayat") || role.toLowerCase().includes("gram_panchayat")) {
            setSelectedBlockId(data.Data[0]?.Id || null);
          }
        } else {
          setBlocks([]);
          setSelectedBlockId(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching blocks:', err);
        toast.error("Failed to fetch blocks");
      });
  }, [selectedDistrictId, role]);

  // Fetch gram panchayats when block changes
  useEffect(() => {
    if (!selectedBlockId) return;
    
    const authToken = getAuthToken();
    if (!authToken) return;

    fetch(`${API_BASE}/Master/GetGramPanchayatByBlock`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ Id: selectedBlockId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Gram Panchayats API response:', data);
        if (data.Status && data.Data && data.Data.length) {
          setGramPanchayats(data.Data);
          if (role.toLowerCase().includes("grampanchayat") || role.toLowerCase().includes("gram_panchayat")) {
            setSelectedGramPanchayatId(data.Data[0]?.Id || null);
          }
        } else {
          setGramPanchayats([]);
          setSelectedGramPanchayatId(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching gram panchayats:', err);
        toast.error("Failed to fetch gram panchayats");
      });
  }, [selectedBlockId, role]);

  // Fetch villages when gram panchayat changes
  useEffect(() => {
    if (!selectedGramPanchayatId) return;
    
    const authToken = getAuthToken();
    if (!authToken) return;

    fetch(`${API_BASE}/Master/GetVillegeByGramPanchayat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ Id: selectedGramPanchayatId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Villages API response:', data);
        if (data.Status && data.Data && data.Data.length) {
          setVillages(data.Data);
          setSelectedVillage(data.Data[0]);
        } else {
          setVillages([]);
          setSelectedVillage(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching villages:', err);
        toast.error("Failed to fetch villages");
      });
  }, [selectedGramPanchayatId]);

  // Fetch handpumps when village changes
  useEffect(() => {
    if (!selectedVillage) {
      setHandpumps([]);
      setSelectedHandpump(null);
      return;
    }

    const fetchHandpumps = async () => {
      try {
        const villageId = selectedVillage.Id;
        console.log("Fetching handpumps for VillageId:", villageId);
        const token = getAuthToken();
        
        if (!token) {
          toast.error('Authentication token not found');
          return;
        }
        
        // Try to fetch from API - replace with actual endpoint when available
        const res = await fetch(`${API_BASE}/Master/GetHandpumpsByVillage?VillageId=${villageId}`, {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });
        
        const json = await res.json();
        console.log("Handpump API response:", json);
        
        if (json.Status && Array.isArray(json.Data) && json.Data.length > 0) {
          setHandpumps(json.Data);
        } else {
          // Mock data for demonstration - remove when real API is available
          const mockHandpumps = [
            { HandpumpId: 1, HandpumpCode: `HP${villageId}001`, Location: "Near School", Status: "Working" },
            { HandpumpId: 2, HandpumpCode: `HP${villageId}002`, Location: "Village Center", Status: "Not Working" },
            { HandpumpId: 3, HandpumpCode: `HP${villageId}003`, Location: "Near Temple", Status: "Working" },
          ];
          setHandpumps(mockHandpumps);
          console.log('Using mock handpump data');
        }
      } catch (err) {
        console.error("Error fetching handpumps:", err);
        // Mock data fallback
        const villageId = selectedVillage.Id;
        const mockHandpumps = [
          { HandpumpId: 1, HandpumpCode: `HP${villageId}001`, Location: "Near School", Status: "Working" },
          { HandpumpId: 2, HandpumpCode: `HP${villageId}002`, Location: "Village Center", Status: "Not Working" },
          { HandpumpId: 3, HandpumpCode: `HP${villageId}003`, Location: "Near Temple", Status: "Working" },
        ];
        setHandpumps(mockHandpumps);
        console.log('Using mock handpump data due to error');
      }
    };

    fetchHandpumps();
  }, [selectedVillage]);

  // Update resolution days on category change
  useEffect(() => {
    if (form.category) {
      const selected = HANDPUMP_COMPLAINT_CATEGORIES.find(c => c.label === form.category);
      if (selected) {
        let days = selected.days;
        
        // Adjust days based on urgency
        if (form.urgency === "Critical") {
          days = Math.max(1, Math.floor(days / 2));
        } else if (form.urgency === "High") {
          days = Math.max(1, Math.floor(days * 0.75));
        } else if (form.urgency === "Low") {
          days = Math.min(15, days * 1.5);
        }
        
        setForm(prev => ({
          ...prev,
          resolutionDays: `${Math.min(15, Math.max(1, Math.floor(days)))}`,
        }));
      }
    }
  }, [form.category, form.urgency]);

  // Handle form changes for basic form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle category change with special logic for "Other"
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm(prev => ({ 
      ...prev, 
      category: value,
      otherCategory: value === "Other" ? prev.otherCategory : ""
    }));
  };

  const handleSubmitComplaint = async () => {
    setMessage("");
    setLoading(true);

    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      if (!userId) {
        toast.error("User ID not found. Please login again.");
        setLoading(false);
        return;
      }

      if (!selectedHandpump) {
        toast.error("Please select a handpump before submitting.");
        setLoading(false);
        return;
      }

      if (!selectedVillage) {
        toast.error("Please select a village before submitting.");
        setLoading(false);
        return;
      }

      if (form.category === "Other" && !form.otherCategory.trim()) {
        toast.error("Please specify the other category details.");
        setLoading(false);
        return;
      }

      // Prepare request body according to API specification
      const bodyData = {
        HandpumpId: selectedHandpump.HandpumpId,
        DistrictId: selectedDistrictId || 0,
        BlockId: selectedBlockId || 0,
        GpId: selectedGramPanchayatId || 0,
        VillageId: selectedVillage.Id,
        ComplainantName: form.complainantName,
        ContactNumber: form.complainantContact,
        Landmark: form.landmark,
        IssueCategory: form.category === "Other" ? form.otherCategory : form.category,
        UrgencyLevel: form.urgency,
        ResolutionTimelineDays: Number(form.resolutionDays),
        IssueDescription: form.description,
        CreatedBy: userId
      };

      console.log('=== SUBMITTING HANDPUMP COMPLAINT ===');
      console.log('Request Body:', bodyData);
      console.log('Auth Token Length:', token.length);

      const res = await fetch(
        `${API_BASE}/HandpumpRegistration/InsertHandpumpComplaint`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyData),
        }
      );

      console.log('Response Status:', res.status);
      const data = await res.json();
      console.log('Response Data:', data);

      if (data?.Status) {
        toast.success(data.Message || "Handpump complaint lodged successfully.");
        
        // Reset form
        setForm({
          complainantName: "",
          complainantContact: "",
          landmark: "",
          category: "",
          resolutionDays: "",
          otherCategory: "",
          description: "",
          urgency: "Medium",
        });
        setSelectedDistrictId(null);
        setSelectedBlockId(null);
        setSelectedGramPanchayatId(null);
        setSelectedVillage(null);
        setSelectedHandpump(null);
        setBlocks([]);
        setGramPanchayats([]);
        setVillages([]);
        setHandpumps([]);
        
        if (onClose) {
          onClose();
        }
      } else {
        toast.error(data?.Message || "Failed to lodge handpump complaint.");
      }
    } catch (err) {
      console.error("Handpump complaint submission error:", err);
      toast.error("Network error. Please try again.");
    }

    setLoading(false);
  };

  // Show loading state
  if (userLoading) {
    return (
      <div className={clsx("p-6 rounded-xl bg-white shadow-lg", isModal ? "w-full max-w-3xl mx-auto" : "")}>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (userError) {
    return (
      <div className={clsx("p-6 rounded-xl bg-white shadow-lg", isModal ? "w-full max-w-3xl mx-auto" : "")}>
        <div className="text-center py-8">
          <p className="text-red-600">Error: {userError}</p>
          <p className="text-gray-600 mt-2">Please try logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("p-6 rounded-xl bg-white shadow-lg", isModal ? "w-full max-w-3xl mx-auto" : "")}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="mb-4">
        <h2 className="text-xl font-bold text-blue-800">Lodge Handpump Complaint</h2>
        <p className="text-sm text-gray-600 mt-1">Report issues with handpump functionality, water quality, or maintenance needs.</p>
        <p className="text-sm text-red-600 mt-1 font-medium">Complaint once registered cannot be revoked.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* District */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            District <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedDistrictId || ""}
            onChange={(e) => setSelectedDistrictId(Number(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d.Id} value={d.Id}>
                {d.DistrictName}
              </option>
            ))}
          </select>
        </div>

        {/* Block */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Select Block <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedBlockId || ""}
            onChange={(e) => setSelectedBlockId(Number(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select Block</option>
            {blocks.map((b) => (
              <option key={b.Id} value={b.Id}>
                {b.BlockName}
              </option>
            ))}
          </select>
        </div>

        {/* Gram Panchayat */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Gram Panchayat <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedGramPanchayatId || ""}
            onChange={(e) => setSelectedGramPanchayatId(Number(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select Gram Panchayat</option>
            {gramPanchayats.map((gp) => (
              <option key={gp.Id} value={gp.Id}>
                {gp.GramPanchayatName}
              </option>
            ))}
          </select>
        </div>

        {/* Village */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Village <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedVillage?.Id || ""}
            onChange={(e) => setSelectedVillage(villages.find(v => v.Id === Number(e.target.value)) || null)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select Village</option>
            {villages.map((v) => (
              <option key={v.Id} value={v.Id}>
                {v.VillageName || "Unnamed"}
              </option>
            ))}
          </select>
        </div>

        {/* Handpump Selection */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Select Handpump <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedHandpump?.HandpumpId || ""}
            onChange={(e) => setSelectedHandpump(handpumps.find(h => h.HandpumpId === Number(e.target.value)) || null)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select Handpump</option>
            {handpumps.map((h) => (
              <option key={h.HandpumpId} value={h.HandpumpId}>
                {h.HandpumpCode} - {h.Location} ({h.Status})
              </option>
            ))}
          </select>
        </div>

        {/* Complainant Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Complainant Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="complainantName"
            value={form.complainantName}
            onChange={handleChange}
            placeholder="Name of person reporting the issue"
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Complainant Contact Number */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="complainantContact"
            value={form.complainantContact}
            onChange={handleChange}
            placeholder="Contact number for follow-up"
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Landmark */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Landmark <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="landmark"
            value={form.landmark}
            onChange={handleChange}
            placeholder="Nearby landmark for easy location"
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Complaint Category */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Issue Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleCategoryChange}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select Issue Category</option>
            {HANDPUMP_COMPLAINT_CATEGORIES.map((c, i) => (
              <option key={i} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Other Category Text Input - Only visible when "Other" is selected */}
        {form.category === "Other" && (
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">
              Specify Issue Details <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="otherCategory"
              value={form.otherCategory}
              onChange={handleChange}
              placeholder="Please describe the specific issue"
              className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        )}

        {/* Urgency Level */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">
            Urgency Level <span className="text-red-500">*</span>
          </label>
          <select
            name="urgency"
            value={form.urgency}
            onChange={handleChange}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="Low">Low - Minor issues</option>
            <option value="Medium">Medium - Normal priority</option>
            <option value="High">High - Urgent attention needed</option>
            <option value="Critical">Critical - Immediate action required</option>
          </select>
        </div>

        {/* Resolution Timeline */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">Resolution Timeline (in days)</label>
          <input
            type="text"
            name="resolutionDays"
            value={form.resolutionDays}
            readOnly
            className="border border-gray-300 px-3 py-2 rounded-md bg-gray-100 cursor-not-allowed focus:outline-none"
          />
        </div>
      </div>

      {/* Description - Full width */}
      <div className="flex flex-col mt-4">
        <label className="text-sm font-medium mb-1 text-gray-700">
          Issue Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Provide detailed description of the handpump issue, when it started, and any other relevant information..."
          className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px]"
          rows={4}
          required
        />
      </div>

      {/* Display validation message when fields are missing */}
      {!areAllMandatoryFieldsFilled() && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Please fill all mandatory fields</span> (marked with <span className="text-red-500">*</span>) to enable the submit button.
          </p>
        </div>
      )}

      {message && (
        <p
          className={`mt-4 text-sm ${
            message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="mt-6 flex justify-end space-x-3">
        {isModal && (
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmitComplaint}
          disabled={loading || !areAllMandatoryFieldsFilled()}
          className={clsx(
            "px-6 py-2 text-white rounded transition-all duration-200",
            areAllMandatoryFieldsFilled() && !loading
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed opacity-50"
          )}
        >
          {loading ? "Submitting..." : "Submit Handpump Complaint"}
        </button>
      </div>
    </div>
  );
};

export default LodgeComplaint;