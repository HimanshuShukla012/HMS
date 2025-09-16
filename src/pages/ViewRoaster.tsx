import { useEffect, useRef, useState } from "react";
import * as XLSX from 'xlsx';

/* --- API response shapes --- */
interface HandpumpApi {
  HandpumpId: number;
  HandpumpCode: string;
  Status: string | number;
  ImageUrl?: string;
  VideoUrl?: string;
  NavigateUrl?: string;
  DateOfGeotag?: string;
  NearbyPerson?: string;
  Contact?: string;
  SoakPit?: string;
  Drainage?: string;
  Platform?: string;
  LastRepairDate?: string;
  LastReboreDate?: string;
  WaterQuality?: string;
  Remark?: string;
  VillageId: number;
  VillageName: string;
  DistrictId?: number;
  DistrictName?: string;
  BlockId?: number;
  BlockName?: string;
  GrampanchayatId?: number;
  GrampanchayatName?: string;
}

interface HandpumpState {
  HandpumpId: number;
  HandpumpCode: string;
  status: string;
  imageUrl: string;
  videoUrl: string;
  navigateUrl: string;
  dateOfGeotag: string;
  nearbyPerson: string;
  contact: string;
  soakPit: string;
  drainage: string;
  platform: string;
  lastRepairDate: string;
  lastReboreDate: string;
  waterQuality: string;
  remark: string;
  villageId: number;
  villageName: string;
  districtId: number;
  districtName: string;
  blockId: number;
  blockName: string;
  gramPanchayatId: number;
  gramPanchayatName: string;
}

const ManageHandpump = () => {
  // Mock user info - replace with actual hook
  const userId = 1;
  const role = "Admin";
  const isLoading = false;

  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Client-side filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [selectedGramPanchayat, setSelectedGramPanchayat] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterWaterQuality, setFilterWaterQuality] = useState("");

  const [handpumps, setHandpumps] = useState<HandpumpState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedHandpumps, setEditedHandpumps] = useState<Set<number>>(new Set());

  const modalRef = useRef<HTMLDivElement>(null);

  // Mock data for development
  useEffect(() => {
    if (!isLoading && userId) {
      // fetchHandpumps();
      // For now, using mock data
      setHandpumps(generateMockData());
    }
  }, [userId, isLoading]);

  // Generate mock data
  const generateMockData = (): HandpumpState[] => {
    const mockData: HandpumpState[] = [];
    const statuses = ['Working', 'Not Working', 'Under Repair', 'Needs Repair'];
    const waterQualities = ['Good', 'Fair', 'Poor', 'Needs Testing'];
    const districts = ['District A', 'District B', 'District C'];
    const blocks = ['Block 1', 'Block 2', 'Block 3'];
    const gramPanchayats = ['GP Alpha', 'GP Beta', 'GP Gamma'];
    const villages = ['Village X', 'Village Y', 'Village Z'];

    for (let i = 1; i <= 100; i++) {
      const district = districts[Math.floor(Math.random() * districts.length)];
      const block = blocks[Math.floor(Math.random() * blocks.length)];
      const gramPanchayat = gramPanchayats[Math.floor(Math.random() * gramPanchayats.length)];
      const village = villages[Math.floor(Math.random() * villages.length)];

      mockData.push({
        HandpumpId: i,
        HandpumpCode: `HP${String(i).padStart(4, '0')}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        imageUrl: `https://example.com/image${i}.jpg`,
        videoUrl: Math.random() > 0.5 ? `https://example.com/video${i}.mp4` : '',
        navigateUrl: `https://maps.google.com/?q=28.${20 + Math.random() * 10},77.${10 + Math.random() * 20}`,
        dateOfGeotag: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        nearbyPerson: `Person ${i}`,
        contact: `98765${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
        soakPit: Math.random() > 0.5 ? 'Yes' : 'No',
        drainage: Math.random() > 0.5 ? 'Good' : 'Needs Improvement',
        platform: Math.random() > 0.7 ? 'Good' : Math.random() > 0.5 ? 'Fair' : 'Poor',
        lastRepairDate: Math.random() > 0.3 ? new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0] : '',
        lastReboreDate: Math.random() > 0.7 ? new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0] : '',
        waterQuality: waterQualities[Math.floor(Math.random() * waterQualities.length)],
        remark: Math.random() > 0.5 ? `Remark for handpump ${i}` : '',
        villageId: Math.floor(Math.random() * 10) + 1,
        villageName: village,
        districtId: Math.floor(Math.random() * 3) + 1,
        districtName: district,
        blockId: Math.floor(Math.random() * 3) + 1,
        blockName: block,
        gramPanchayatId: Math.floor(Math.random() * 3) + 1,
        gramPanchayatName: gramPanchayat,
      });
    }
    return mockData;
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (showModal && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
        setCsvFile(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showModal]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDistrict, selectedBlock, selectedGramPanchayat, selectedVillage, filterStatus, filterWaterQuality]);

  // Get unique values for filter dropdowns
  const getUniqueDistricts = () => {
    const districts = handpumps
      .filter(h => h.districtName)
      .map(h => h.districtName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return districts;
  };

  const getUniqueBlocks = () => {
    const blocks = handpumps
      .filter(h => h.blockName && (!selectedDistrict || h.districtName === selectedDistrict))
      .map(h => h.blockName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return blocks;
  };

  const getUniqueGramPanchayats = () => {
    const gramPanchayats = handpumps
      .filter(h => h.gramPanchayatName && 
        (!selectedDistrict || h.districtName === selectedDistrict) &&
        (!selectedBlock || h.blockName === selectedBlock))
      .map(h => h.gramPanchayatName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return gramPanchayats;
  };

  const getUniqueVillages = () => {
    const villages = handpumps
      .filter(h => h.villageName && 
        (!selectedDistrict || h.districtName === selectedDistrict) &&
        (!selectedBlock || h.blockName === selectedBlock) &&
        (!selectedGramPanchayat || h.gramPanchayatName === selectedGramPanchayat))
      .map(h => h.villageName)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return villages;
  };

  const handleEditToggle = () => {
    if (editMode) {
      setEditedHandpumps(new Set());
    }
    setEditMode((s) => !s);
  };

  const handleChange = (id: number, field: keyof HandpumpState, value: string | number) => {
    setHandpumps((prev) => prev.map((h) => (h.HandpumpId === id ? { ...h, [field]: value } : h)));
    setEditedHandpumps(prev => new Set([...prev, id]));
  };

  const handleSaveChanges = async () => {
    if (editedHandpumps.size === 0) {
      alert("No changes to save");
      return;
    }

    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      alert(`Successfully updated ${editedHandpumps.size} handpump records`);
      setEditedHandpumps(new Set());
      setEditMode(false);
      setSaving(false);
    }, 1000);
  };

  const handleDownload = () => {
    setDownloading(true);
    
    try {
      const exportData = filteredData.map((h) => {
        return {
          'Sr. No.': filteredData.indexOf(h) + 1,
          'Handpump ID': h.HandpumpCode,
          'Status': h.status,
          'Image': h.imageUrl,
          'Video': h.videoUrl,
          'Navigate': h.navigateUrl,
          'Date of Geotag': h.dateOfGeotag,
          'Nearby Person': h.nearbyPerson,
          'Contact': h.contact,
          'Soak Pit': h.soakPit,
          'Drainage': h.drainage,
          'Platform': h.platform,
          'Last Repair Date': h.lastRepairDate,
          'Last Rebore Date': h.lastReboreDate,
          'Water Quality': h.waterQuality,
          'Remark': h.remark,
          'District': h.districtName,
          'Block': h.blockName,
          'Gram Panchayat': h.gramPanchayatName,
          'Village': h.villageName
        };
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(
          key.length,
          ...exportData.map(row => String(row[key as keyof typeof row]).length)
        )
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Handpumps');

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `handpumps_export_${dateStr}.xlsx`;

      XLSX.writeFile(wb, filename);
      alert("Excel file downloaded successfully");
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!csvFile) {
      alert("Please select a CSV file.");
      return;
    }

    // Simulate upload
    setTimeout(() => {
      alert("Import successful");
      setShowModal(false);
      setCsvFile(null);
    }, 1000);
  };

  const clearFilters = () => {
    setSelectedDistrict("");
    setSelectedBlock("");
    setSelectedGramPanchayat("");
    setSelectedVillage("");
    setFilterStatus("");
    setFilterWaterQuality("");
    setSearch("");
  };

  const getSelectedLocationName = () => {
    if (selectedVillage) return selectedVillage;
    if (selectedGramPanchayat) return selectedGramPanchayat;
    if (selectedBlock) return selectedBlock;
    if (selectedDistrict) return selectedDistrict;
    return "All Areas";
  };

  // Client-side filtering
  const filteredData = handpumps.filter((h) => {
    const matchesSearch = h.HandpumpCode.toLowerCase().includes(search.toLowerCase()) ||
                         h.nearbyPerson.toLowerCase().includes(search.toLowerCase());
    const matchesDistrict = !selectedDistrict || h.districtName === selectedDistrict;
    const matchesBlock = !selectedBlock || h.blockName === selectedBlock;
    const matchesGramPanchayat = !selectedGramPanchayat || h.gramPanchayatName === selectedGramPanchayat;
    const matchesVillage = !selectedVillage || h.villageName === selectedVillage;
    const matchesStatus = !filterStatus || h.status === filterStatus;
    const matchesWaterQuality = !filterWaterQuality || h.waterQuality === filterWaterQuality;

    return matchesSearch && matchesDistrict && matchesBlock && matchesGramPanchayat && 
           matchesVillage && matchesStatus && matchesWaterQuality;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Pagination controls
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="p-6 relative z-10 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Manage Handpumps</h1>
        <p className="text-gray-600 mb-6">
          View, edit, and bulk-import handpump data. Use filters to narrow down your search.
        </p>

        {loading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700">Loading handpumps...</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {/* Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                if (e.target.value !== selectedDistrict) {
                  setSelectedBlock("");
                  setSelectedGramPanchayat("");
                  setSelectedVillage("");
                }
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Districts</option>
              {getUniqueDistricts().map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Block</label>
            <select
              value={selectedBlock}
              onChange={(e) => {
                setSelectedBlock(e.target.value);
                if (e.target.value !== selectedBlock) {
                  setSelectedGramPanchayat("");
                  setSelectedVillage("");
                }
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Blocks</option>
              {getUniqueBlocks().map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gram Panchayat</label>
            <select
              value={selectedGramPanchayat}
              onChange={(e) => {
                setSelectedGramPanchayat(e.target.value);
                if (e.target.value !== selectedGramPanchayat) {
                  setSelectedVillage("");
                }
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Gram Panchayats</option>
              {getUniqueGramPanchayats().map((gp) => (
                <option key={gp} value={gp}>
                  {gp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Village</label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Villages</option>
              {getUniqueVillages().map((village) => (
                <option key={village} value={village}>
                  {village}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Status</option>
              <option value="Working">Working</option>
              <option value="Not Working">Not Working</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Needs Repair">Needs Repair</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Water Quality</label>
            <select
              value={filterWaterQuality}
              onChange={(e) => setFilterWaterQuality(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">All Quality</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Needs Testing">Needs Testing</option>
            </select>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <input
              type="text"
              className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by handpump ID or nearby person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                downloading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={handleDownload} 
              disabled={loading || downloading || filteredData.length === 0}
            >
              {downloading ? 'Downloading...' : 'Download Excel'}
            </button>

            <button 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors" 
              onClick={() => setShowModal(true)} 
              disabled={loading}
            >
              Bulk Import
            </button>

            {!editMode ? (
              <button 
                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors" 
                onClick={handleEditToggle} 
                disabled={loading || handpumps.length === 0}
              >
                Edit Records
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors" 
                  onClick={handleEditToggle}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-white transition-colors ${
                    saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  onClick={handleSaveChanges}
                  disabled={saving || editedHandpumps.size === 0}
                >
                  {saving ? 'Saving...' : `Save Changes (${editedHandpumps.size})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Location: <strong>{getSelectedLocationName()}</strong></span>
          <span>Showing <strong>{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</strong> of <strong>{filteredData.length}</strong> handpumps</span>
          <span>Total records: <strong>{handpumps.length}</strong></span>
          {editedHandpumps.size > 0 && (
            <span className="text-orange-600">
              <strong>{editedHandpumps.size}</strong> records modified
            </span>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        
        {/* Quick Stats Cards */}
        {handpumps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 px-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <span className="text-2xl">🚰</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Handpumps</p>
                  <p className="text-xl font-bold text-gray-800">{filteredData.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Working</p>
                  <p className="text-xl font-bold text-green-600">
                    {filteredData.filter(h => h.status === 'Working').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <span className="text-2xl">❌</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Not Working</p>
                  <p className="text-xl font-bold text-red-600">
                    {filteredData.filter(h => h.status === 'Not Working').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <span className="text-2xl">🔧</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Needs Attention</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {filteredData.filter(h => h.status === 'Under Repair' || h.status === 'Needs Repair').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Controls - Top */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b border-gray-200 gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Rows per page:
              </label>
              <select
                value={rowsPerPage}
                onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {getVisiblePageNumbers().map((page, index) => (
                  <span key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-1 text-sm text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-300 p-3 text-left font-medium">Sr. No.</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Handpump ID</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Status</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Image</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Video</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Navigate</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Date of Geotag</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Nearby Person</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Contact</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Soak Pit</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Drainage</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Platform</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Last Repair Date</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Last Rebore Date</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Water Quality</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Remark</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((h, index) => {
                const isEdited = editedHandpumps.has(h.HandpumpId);
                const srNo = startIndex + index + 1;
                
                return (
                  <tr 
                    key={h.HandpumpId} 
                    className={`${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-blue-50 transition-colors ${
                      isEdited ? 'ring-2 ring-orange-200 bg-orange-50' : ''
                    }`}
                  >
                    <td className="border border-gray-300 p-3">{srNo}</td>

                    <td className="border border-gray-300 p-3">
                      <span className="font-medium text-blue-600">{h.HandpumpCode}</span>
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <select 
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          value={h.status} 
                          onChange={(e) => handleChange(h.HandpumpId, "status", e.target.value)}
                        >
                          <option value="Working">Working</option>
                          <option value="Not Working">Not Working</option>
                          <option value="Under Repair">Under Repair</option>
                          <option value="Needs Repair">Needs Repair</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          h.status === 'Working' 
                            ? 'bg-green-100 text-green-800' 
                            : h.status === 'Not Working'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {h.status}
                        </span>
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {h.imageUrl ? (
                        <a 
                          href={h.imageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-xs"
                        >
                          View Image
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {h.videoUrl ? (
                        <a 
                          href={h.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-xs"
                        >
                          View Video
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">No Video</span>
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      <a 
                        href={h.navigateUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        Open Map
                      </a>
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <input 
                          type="date"
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs" 
                          value={h.dateOfGeotag} 
                          onChange={(e) => handleChange(h.HandpumpId, "dateOfGeotag", e.target.value)}
                        />
                      ) : (
                        h.dateOfGeotag || "-"
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <input 
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          value={h.nearbyPerson} 
                          onChange={(e) => handleChange(h.HandpumpId, "nearbyPerson", e.target.value)}
                        />
                      ) : (
                        h.nearbyPerson || "-"
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <input 
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          value={h.contact} 
                          onChange={(e) => handleChange(h.HandpumpId, "contact", e.target.value)}
                        />
                      ) : (
                        h.contact || "-"
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <select 
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          value={h.soakPit} 
                          onChange={(e) => handleChange(h.HandpumpId, "soakPit", e.target.value)}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          h.soakPit === 'Yes' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {h.soakPit}
                        </span>
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <select 
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          value={h.drainage} 
                          onChange={(e) => handleChange(h.HandpumpId, "drainage", e.target.value)}
                        >
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Poor">Poor</option>
                          <option value="Needs Improvement">Needs Improvement</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          h.drainage === 'Good' 
                            ? 'bg-green-100 text-green-800' 
                            : h.drainage === 'Fair'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {h.drainage}
                        </span>
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <select 
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          value={h.platform} 
                          onChange={(e) => handleChange(h.HandpumpId, "platform", e.target.value)}
                        >
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Poor">Poor</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          h.platform === 'Good' 
                            ? 'bg-green-100 text-green-800' 
                            : h.platform === 'Fair'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {h.platform}
                        </span>
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <input 
                          type="date"
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs" 
                          value={h.lastRepairDate} 
                          onChange={(e) => handleChange(h.HandpumpId, "lastRepairDate", e.target.value)}
                        />
                      ) : (
                        h.lastRepairDate || "-"
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <input 
                          type="date"
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs" 
                          value={h.lastReboreDate} 
                          onChange={(e) => handleChange(h.HandpumpId, "lastReboreDate", e.target.value)}
                        />
                      ) : (
                        h.lastReboreDate || "-"
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <select 
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          value={h.waterQuality} 
                          onChange={(e) => handleChange(h.HandpumpId, "waterQuality", e.target.value)}
                        >
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Poor">Poor</option>
                          <option value="Needs Testing">Needs Testing</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          h.waterQuality === 'Good' 
                            ? 'bg-green-100 text-green-800' 
                            : h.waterQuality === 'Fair'
                            ? 'bg-yellow-100 text-yellow-800'
                            : h.waterQuality === 'Poor'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {h.waterQuality}
                        </span>
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {editMode ? (
                        <textarea 
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs" 
                          rows={2}
                          value={h.remark} 
                          onChange={(e) => handleChange(h.HandpumpId, "remark", e.target.value)}
                        />
                      ) : (
                        <span className="text-xs">{h.remark || "-"}</span>
                      )}
                    </td>

                    <td className="border border-gray-300 p-3">
                      <div className="flex flex-col gap-1">
                        <button className="text-blue-600 hover:text-blue-800 underline text-xs">
                          View Details
                        </button>
                        <button className="text-green-600 hover:text-green-800 underline text-xs">
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Bottom */}
        {filteredData.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 gap-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>

              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {getVisiblePageNumbers().map((page, index) => (
                  <span key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-1 text-sm text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>

              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}

        {filteredData.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🚰</div>
            <h3 className="text-lg font-medium mb-2">No handpumps found</h3>
            <p className="text-sm">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </div>

      {/* Bulk Import Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button 
              onClick={() => { setShowModal(false); setCsvFile(null); }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-800">Bulk Import Handpumps</h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload handpump records in CSV format. Make sure your file follows the required format.
            </p>

            <div className="mb-4">
              <a 
                href="/handpumps_sample.csv" 
                download 
                className="inline-block text-blue-600 hover:text-blue-800 underline text-sm font-medium"
              >
                📄 Download Sample Format
              </a>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select CSV File</label>
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)} 
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {csvFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ File selected: {csvFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={handleUpload} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                disabled={!csvFile}
              >
                Upload & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHandpump;