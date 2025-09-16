import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';

// Dummy data for handpumps
const generateDummyHandpumps = () => {
  const districts = ["Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad"];
  const blocks = ["Block A", "Block B", "Block C", "Block D"];
  const villages = ["Village 1", "Village 2", "Village 3", "Village 4", "Village 5"];
  const statuses = ["Working", "Not Working", "Under Repair", "Needs Maintenance"];
  const waterQuality = ["Good", "Fair", "Poor", "Contaminated"];
  const yesNo = ["Yes", "No"];
  
  return Array.from({ length: 150 }, (_, index) => ({
    id: index + 1,
    handpumpId: `HP${(index + 1).toString().padStart(4, '0')}`,
    districtName: districts[Math.floor(Math.random() * districts.length)],
    blockName: blocks[Math.floor(Math.random() * blocks.length)],
    villageName: villages[Math.floor(Math.random() * villages.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    hasImage: Math.random() > 0.3 ? "Yes" : "No",
    hasVideo: Math.random() > 0.7 ? "Yes" : "No",
    navigate: `${(Math.random() * 90).toFixed(6)}, ${(Math.random() * 180).toFixed(6)}`,
    geotagDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
    nearbyPerson: `Person ${Math.floor(Math.random() * 100) + 1}`,
    contact: `98${Math.floor(Math.random() * 90000000) + 10000000}`,
    soakPit: yesNo[Math.floor(Math.random() * yesNo.length)],
    drainage: yesNo[Math.floor(Math.random() * yesNo.length)],
    platform: yesNo[Math.floor(Math.random() * yesNo.length)],
    lastRepairDate: Math.random() > 0.5 ? new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString() : "N/A",
    lastReboreDate: Math.random() > 0.7 ? new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString() : "N/A",
    waterQuality: waterQuality[Math.floor(Math.random() * waterQuality.length)],
    remark: Math.random() > 0.6 ? `Remark ${index + 1}` : "",
  }));
};

const ManageHandpump = () => {
  const [handpumps] = useState(generateDummyHandpumps());
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterWaterQuality, setFilterWaterQuality] = useState("");

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDistrict, selectedBlock, selectedVillage, filterStatus, filterWaterQuality]);

  // Get unique values for filters
  const getUniqueDistricts = () => {
    return [...new Set(handpumps.map(h => h.districtName))].sort();
  };

  const getUniqueBlocks = () => {
    return [...new Set(handpumps
      .filter(h => !selectedDistrict || h.districtName === selectedDistrict)
      .map(h => h.blockName))].sort();
  };

  const getUniqueVillages = () => {
    return [...new Set(handpumps
      .filter(h => (!selectedDistrict || h.districtName === selectedDistrict) &&
                   (!selectedBlock || h.blockName === selectedBlock))
      .map(h => h.villageName))].sort();
  };

  const clearFilters = () => {
    setSelectedDistrict("");
    setSelectedBlock("");
    setSelectedVillage("");
    setFilterStatus("");
    setFilterWaterQuality("");
    setSearch("");
  };

  const getSelectedLocationName = () => {
    if (selectedVillage) return selectedVillage;
    if (selectedBlock) return selectedBlock;
    if (selectedDistrict) return selectedDistrict;
    return "All Areas";
  };

  // Filter handpumps
  const filteredData = handpumps.filter((h) => {
    const matchesSearch = h.handpumpId.toLowerCase().includes(search.toLowerCase()) ||
                         h.nearbyPerson.toLowerCase().includes(search.toLowerCase());
    const matchesDistrict = !selectedDistrict || h.districtName === selectedDistrict;
    const matchesBlock = !selectedBlock || h.blockName === selectedBlock;
    const matchesVillage = !selectedVillage || h.villageName === selectedVillage;
    const matchesStatus = !filterStatus || h.status === filterStatus;
    const matchesWaterQuality = !filterWaterQuality || h.waterQuality === filterWaterQuality;

    return matchesSearch && matchesDistrict && matchesBlock && matchesVillage && 
           matchesStatus && matchesWaterQuality;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleDownload = () => {
    setDownloading(true);
    
    try {
      const exportData = filteredData.map((h) => ({
        'Sr. No.': h.id,
        'Handpump ID': h.handpumpId,
        'District': h.districtName,
        'Block': h.blockName,
        'Village': h.villageName,
        'Status': h.status,
        'Image': h.hasImage,
        'Video': h.hasVideo,
        'Navigate': h.navigate,
        'Date of Geotag': h.geotagDate,
        'Nearby Person': h.nearbyPerson,
        'Contact': h.contact,
        'Soak Pit': h.soakPit,
        'Drainage': h.drainage,
        'Platform': h.platform,
        'Last Repair Date': h.lastRepairDate,
        'Last Rebore Date': h.lastReboreDate,
        'Water Quality': h.waterQuality,
        'Remark': h.remark
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Handpumps');
      
      const filename = `handpumps_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
      
    } finally {
      setDownloading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
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
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Manage Handpumps</h1>
        <p className="text-gray-600 mb-6">
          Monitor and manage handpump installations across districts. Track status, maintenance, and water quality.
        </p>

        {/* Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                if (e.target.value !== selectedDistrict) {
                  setSelectedBlock("");
                  setSelectedVillage("");
                }
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Districts</option>
              {getUniqueDistricts().map((district) => (
                <option key={district} value={district}>{district}</option>
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
                  setSelectedVillage("");
                }
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Blocks</option>
              {getUniqueBlocks().map((block) => (
                <option key={block} value={block}>{block}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Village</label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Villages</option>
              {getUniqueVillages().map((village) => (
                <option key={village} value={village}>{village}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="Working">Working</option>
              <option value="Not Working">Not Working</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Needs Maintenance">Needs Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Water Quality</label>
            <select
              value={filterWaterQuality}
              onChange={(e) => setFilterWaterQuality(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Quality</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Contaminated">Contaminated</option>
            </select>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <input
              type="text"
              className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by Handpump ID or Nearby Person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                downloading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={handleDownload} 
              disabled={downloading || filteredData.length === 0}
            >
              {downloading ? 'Downloading...' : 'Download Excel'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Location: <strong>{getSelectedLocationName()}</strong></span>
          <span>Showing <strong>{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</strong> of <strong>{filteredData.length}</strong> handpumps</span>
          <span>Total handpumps: <strong>{handpumps.length}</strong></span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <span className="text-2xl">💧</span>
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
              <p className="text-sm text-gray-600">Under Repair</p>
              <p className="text-xl font-bold text-yellow-600">
                {filteredData.filter(h => h.status === 'Under Repair').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <span className="text-2xl">💎</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Good Quality</p>
              <p className="text-xl font-bold text-purple-600">
                {filteredData.filter(h => h.waterQuality === 'Good').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        
        {/* Pagination Controls - Top */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b border-gray-200 gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Rows per page:</label>
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
                        onClick={() => handlePageChange(page)}
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
                <th className="border border-gray-300 p-3 text-left font-medium">District</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Block</th>
                <th className="border border-gray-300 p-3 text-left font-medium">Village</th>
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
              {paginatedData.map((h, index) => (
                <tr key={h.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                  <td className="border border-gray-300 p-3">{startIndex + index + 1}</td>
                  <td className="border border-gray-300 p-3 font-medium text-blue-600">{h.handpumpId}</td>
                  <td className="border border-gray-300 p-3">{h.districtName}</td>
                  <td className="border border-gray-300 p-3">{h.blockName}</td>
                  <td className="border border-gray-300 p-3">{h.villageName}</td>
                  <td className="border border-gray-300 p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      h.status === 'Working' ? 'bg-green-100 text-green-800' :
                      h.status === 'Not Working' ? 'bg-red-100 text-red-800' :
                      h.status === 'Under Repair' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-3">
                    <span className={`px-2 py-1 rounded text-xs ${h.hasImage === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {h.hasImage}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-3">
                    <span className={`px-2 py-1 rounded text-xs ${h.hasVideo === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {h.hasVideo}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-3 text-xs">{h.navigate}</td>
                  <td className="border border-gray-300 p-3">{h.geotagDate}</td>
                  <td className="border border-gray-300 p-3">{h.nearbyPerson}</td>
                  <td className="border border-gray-300 p-3">{h.contact}</td>
                  <td className="border border-gray-300 p-3">
                    <span className={`px-2 py-1 rounded text-xs ${h.soakPit === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {h.soakPit}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-3">
                    <span className={`px-2 py-1 rounded text-xs ${h.drainage === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {h.drainage}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-3">
                    <span className={`px-2 py-1 rounded text-xs ${h.platform === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {h.platform}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-3">{h.lastRepairDate}</td>
                  <td className="border border-gray-300 p-3">{h.lastReboreDate}</td>
                  <td className="border border-gray-300 p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      h.waterQuality === 'Good' ? 'bg-green-100 text-green-800' :
                      h.waterQuality === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                      h.waterQuality === 'Poor' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {h.waterQuality}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-3">{h.remark || "-"}</td>
                  <td className="border border-gray-300 p-3">
                    <div className="flex gap-1">
                      <button className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                        View
                      </button>
                      <button className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">💧</div>
            <h3 className="text-lg font-medium mb-2">No handpumps found</h3>
            <p className="text-sm">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageHandpump;