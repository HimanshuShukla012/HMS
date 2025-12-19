import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Droplet, AlertCircle, FileText, TrendingUp } from "lucide-react";
import { useSearchData } from "./SearchDataContext";

interface SearchResult {
  id: string | number;
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  path: string;
}

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Get data from context
  const { handpumps, complaints, requisitions, estimations } = useSearchData();

  // Get user role for path prefix
  const getRolePrefix = () => {
    const role = localStorage.getItem("role");
    switch (role) {
      case "Admin": return "/admin";
      case "Gram_Panchayat_Sachiv": return "/gp";
      case "Consulting_Engineer": return "/consultingengineer";
      case "Assistant_Development_Officer": return "/ado";
      case "District_Panchayati_Raj_Officer": return "/dpro";
      default: return "/gp";
    }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, handpumps, complaints, requisitions, estimations]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleResultClick(results[selectedIndex]);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const performSearch = (searchQuery: string) => {
    const searchResults: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase();
    const rolePrefix = getRolePrefix();

    // Search Handpumps
    handpumps.slice(0, 50).forEach((hp) => {
      const searchableText = `${hp.HandpumpId || ''} ${hp.VillegeName || ''} ${hp.DistrictName || ''} ${hp.BlockName || ''} ${hp.NearByPersonName || ''} ${hp.GrampanchayatName || ''}`.toLowerCase();
      
      if (searchableText.includes(lowerQuery)) {
        searchResults.push({
          id: hp.H_id,
          type: "handpump",
          title: `Handpump ${hp.HandpumpId}`,
          subtitle: `${hp.VillegeName}, ${hp.BlockName}`,
          description: `District: ${hp.DistrictName} | Status: ${hp.HandpumpStatus}`,
          path: `${rolePrefix}/manage-handpump`
        });
      }
    });

    // Search Complaints
    complaints.slice(0, 50).forEach((c) => {
      const searchableText = `${c.ComplaintId || ''} ${c.HandpumpId || ''} ${c.ComplainantName || ''} ${c.VillageName || ''} ${c.IssueCategory || ''} ${c.GpName || ''}`.toLowerCase();
      
      if (searchableText.includes(lowerQuery)) {
        searchResults.push({
          id: c.ComplaintId,
          type: "complaint",
          title: `Complaint #${c.ComplaintId}`,
          subtitle: `Handpump: ${c.HandpumpId} - ${c.VillageName}`,
          description: `${c.ComplainantName} | ${c.IssueCategory} | ${c.Status}`,
          path: `${rolePrefix}/manage-complaint`
        });
      }
    });

    // Search Requisitions
    requisitions.slice(0, 50).forEach((r) => {
      const requisitionId = r.RequisitionId || r.requisitionId || '';
      const handpumpId = r.HandpumpId || r.handpumpId || '';
      const villageName = r.VillageName || r.village || '';
      const gpName = r.GrampanchayatName || r.gramPanchayat || '';
      
      const searchableText = `${requisitionId} ${handpumpId} ${villageName} ${gpName}`.toLowerCase();
      
      if (searchableText.includes(lowerQuery)) {
        const reqId = requisitionId ? `REQ${String(requisitionId).padStart(3, '0')}` : 'N/A';
        searchResults.push({
          id: requisitionId,
          type: "requisition",
          title: reqId,
          subtitle: `${villageName}, ${gpName}`,
          description: `Handpump: ${handpumpId} | ${r.RequisitionType || r.mode || 'N/A'}`,
          path: `${rolePrefix}/view-closure`
        });
      }
    });

    // Search Estimations
    estimations.slice(0, 50).forEach((e) => {
      const reqId = e.id || `REQ${String(e.RequisitionId || '').padStart(3, '0')}`;
      const handpumpId = e.handpumpId || e.HandpumpId || '';
      const mode = e.mode || e.RequisitionType || '';
      const village = e.village || e.VillageName || '';
      const gp = e.gramPanchayat || e.GrampanchayatName || '';
      
      const searchableText = `${reqId} ${handpumpId} ${mode} ${village} ${gp}`.toLowerCase();
      
      if (searchableText.includes(lowerQuery)) {
        searchResults.push({
          id: e.RequisitionId || e.id,
          type: "estimation",
          title: reqId,
          subtitle: `Handpump: ${handpumpId}`,
          description: `${mode} | ${village} | Amount: ${e.sanctionedTotal || 'N/A'}`,
          path: `${rolePrefix}/manage-beneficiary`
        });
      }
    });

    setResults(searchResults.slice(0, 10));
    setIsOpen(searchResults.length > 0);
    setSelectedIndex(0);
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "handpump": return <Droplet size={18} className="text-blue-500" />;
      case "complaint": return <AlertCircle size={18} className="text-red-500" />;
      case "requisition": return <FileText size={18} className="text-green-500" />;
      case "estimation": return <TrendingUp size={18} className="text-purple-500" />;
      default: return <FileText size={18} className="text-gray-500" />;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Search handpumps, complaints, requisitions..."
          className="pl-10 pr-10 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-2 font-medium">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </div>
            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                  selectedIndex === index ? "bg-indigo-50 border border-indigo-200" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIcon(result.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-800 truncate">{result.title}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                        {result.type}
                      </span>
                    </div>
                    {result.subtitle && <div className="text-xs text-gray-600 mb-1 truncate">{result.subtitle}</div>}
                    {result.description && <div className="text-xs text-gray-500 truncate">{result.description}</div>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 p-6 z-50">
          <div className="text-center text-gray-500">
            <Search size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">No results found</p>
            <p className="text-xs mt-1">Try different keywords</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;