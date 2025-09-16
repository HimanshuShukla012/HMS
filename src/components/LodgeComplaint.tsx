// src/components/LodgeHandpumpComplaint.tsx
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
  DistrictId: number;
  DistrictName: string;
}

interface Block {
  BlockId: number;
  BlockName: string;
}

interface GramPanchayat {
  Id?: number;
  GramPanchayatId?: number;
  GramPanchayatName: string;
}

interface Village {
  Id?: number;
  VillageId?: number;
  VillageName: string;
}

interface Handpump {
  HandpumpId: number;
  HandpumpCode: string;
  Location: string;
  Status: string;
}

const LodgeComplaint: React.FC<LodgeHandpumpComplaintProps> = ({ isModal = false, onClose }) => {
  const { userId } = useUserInfo();
  
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
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload?.Role || "");
    } catch (e) {
      console.error("Failed to decode token", e);
    }
  }, []);

  // Fetch districts when userId is available
  useEffect(() => {
    if (!userId) return;
    fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetDistrict?UserId=${userId}`, {
      method: "POST",
      headers: { accept: "*/*" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data.length) {
          setDistricts(data.Data);
          if (role.toLowerCase() === "grampanchayat") {
            setSelectedDistrictId(data.Data[0].DistrictId);
          }
        }
      })
      .catch(() => toast.error("Failed to fetch districts"));
  }, [userId, role]);

  // Fetch blocks when district changes
  useEffect(() => {
    if (!selectedDistrictId || !userId) return;
    fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetBlockListByDistrict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserId: userId, DistrictId: selectedDistrictId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data.length) {
          setBlocks(data.Data);
          if (role.toLowerCase() === "grampanchayat") {
            setSelectedBlockId(data.Data[0]?.BlockId || null);
          }
        } else {
          setBlocks([]);
          setSelectedBlockId(null);
        }
      })
      .catch(() => toast.error("Failed to fetch blocks"));
  }, [selectedDistrictId, userId, role]);

  // Fetch gram panchayats when block changes
  useEffect(() => {
    if (!selectedBlockId || !userId) return;
    fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetGramPanchayatByBlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserId: userId, BlockId: selectedBlockId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data.length) {
          setGramPanchayats(data.Data);
          if (role.toLowerCase() === "grampanchayat") {
            setSelectedGramPanchayatId(data.Data[0]?.Id || null);
          }
        } else {
          setGramPanchayats([]);
          setSelectedGramPanchayatId(null);
        }
      })
      .catch(() => toast.error("Failed to fetch gram panchayats"));
  }, [selectedBlockId, userId, role]);

  // Fetch villages when gram panchayat changes
  useEffect(() => {
    if (!selectedBlockId || !selectedGramPanchayatId) return;
    fetch("https://wmsapi.kdsgroup.co.in/api/Master/GetVillegeByGramPanchayat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        BlockId: selectedBlockId,
        GramPanchayatId: selectedGramPanchayatId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data.length) {
          setVillages(data.Data);
          setSelectedVillage(data.Data[0]);
        } else {
          setVillages([]);
          setSelectedVillage(null);
        }
      })
      .catch(() => toast.error("Failed to fetch villages"));
  }, [selectedBlockId, selectedGramPanchayatId]);

  // Fetch handpumps when village changes
  useEffect(() => {
    if (!selectedVillage) {
      setHandpumps([]);
      setSelectedHandpump(null);
      return;
    }

    const fetchHandpumps = async () => {
      try {
        const villageId = selectedVillage.Id || selectedVillage.VillageId || 0;
        console.log("Fetching handpumps for VillageId:", villageId);
        const token = localStorage.getItem("authToken");
        
        // This is a mock API call - you'll need to replace with actual API endpoint
        const res = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetHandpumpsByVillage?VillageId=${villageId}`, {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });
        
        const json = await res.json();
        console.log("Handpump API response:", json);
        
        if (json.Status && Array.isArray(json.Data)) {
          setHandpumps(json.Data);
        } else {
          // Mock data for demonstration - remove when real API is available
          const mockHandpumps = [
            { HandpumpId: 1, HandpumpCode: `HP${villageId}001`, Location: "Near School", Status: "Working" },
            { HandpumpId: 2, HandpumpCode: `HP${villageId}002`, Location: "Village Center", Status: "Not Working" },
            { HandpumpId: 3, HandpumpCode: `HP${villageId}003`, Location: "Near Temple", Status: "Working" },
          ];
          setHandpumps(mockHandpumps);
        }
      } catch (err) {
        console.error("Error fetching handpumps:", err);
        // Mock data fallback
        const villageId = selectedVillage.Id || selectedVillage.VillageId || 0;
        const mockHandpumps = [
          { HandpumpId: 1, HandpumpCode: `HP${villageId}001`, Location: "Near School", Status: "Working" },
          { HandpumpId: 2, HandpumpCode: `HP${villageId}002`, Location: "Village Center", Status: "Not Working" },
          { HandpumpId: 3, HandpumpCode: `HP${villageId}003`, Location: "Near Temple", Status: "Working" },
        ];
        setHandpumps(mockHandpumps);
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
      const token = localStorage.getItem("authToken");
      if (!token) {
        setMessage("User is not logged in.");
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

      const payload = JSON.parse(atob(token.split(".")[1]));
      const createdBy = payload?.UserID || payload?.UserId || 0;

      const villageId = selectedVillage.VillageId ?? selectedVillage.Id ?? 0;

      // Modified category mapping for handpump complaints
      const categoryMapping: Record<string, number> = {
        "Handpump Not Working": 101,
        "Water Quality Issues": 102,
        "Handle/Lever Problems": 103,
        "Water Flow Issues - Low Pressure": 104,
        "Water Flow Issues - No Water": 105,
        "Platform Damage/Missing": 106,
        "Drainage Problems": 107,
        "Soak Pit Issues": 108,
        "Pipe Leakage/Burst": 109,
        "Handpump Body Damage": 110,
        "Rod/Cylinder Problems": 111,
        "Water Contamination": 112,
        "Maintenance Required": 113,
        "Handpump Needs Repair": 114,
        "Other": 0,
      };
      const categoryId = categoryMapping[form.category] || 0;

      const bodyData = {
        VillageId: villageId,
        HandpumpId: selectedHandpump.HandpumpId,
        HandpumpCode: selectedHandpump.HandpumpCode,
        ComplainantName: form.complainantName,
        Contact: form.complainantContact,
        Landmark: form.landmark,
        Categoryid: categoryId,
        Description: form.description,
        Status: 1,
        Urgency: form.urgency,
        ResolutionTimelineDays: Number(form.resolutionDays),
        CreatedBy: createdBy,
        UpdatedBy: createdBy,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        DeviceToken: "",
        IPAddress: "",
        OtherCategory: form.category === "Other" ? form.otherCategory : "",
        ComplaintType: "Handpump",
        uparm: localStorage.getItem("uparm") || "",
      };

      // You'll need to update this API endpoint for handpump complaints
      const res = await fetch(
        "https://wmsapi.kdsgroup.co.in/api/Complain/InsertHandpumpComplaint",
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

      const data = await res.json();
      if (data?.Status) {
        toast.success(data.Message || "Handpump complaint lodged successfully.");
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
      } else {
        toast.error(data?.Message || "Failed to lodge handpump complaint.");
      }
    } catch (err) {
      console.error("Handpump complaint submission error:", err);
      toast.error("Network error. Please try again.");
    }

    setLoading(false);
  };

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
              <option key={d.DistrictId} value={d.DistrictId}>
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
              <option key={b.BlockId} value={b.BlockId}>
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