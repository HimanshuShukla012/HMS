import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  Filter,
  X,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Droplets,
  CheckCircle,
  Clock,
  Loader,
  FileText,
  BarChart3,
  IndianRupeeIcon,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const MISReportingPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [expenditureData, setExpenditureData] = useState(null);
  const [filters, setFilters] = useState({
    financialYear: "2025-26",
    month: new Date().getMonth() + 1,
  });

  const API_BASE = "https://hmsapi.kdsgroup.co.in/api";

  const getAuthToken = () => localStorage.getItem("authToken") || "";

  const getUserId = () => {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.UserID || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const financialYears = [
    "2025-26",
    "2024-25",
    "2023-24",
    "2022-23",
    "2021-22",
  ];
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const token = getAuthToken();

      if (!userId || !token) {
        throw new Error("Authentication required");
      }


      console.log("Fetching with params:", {
  userId,
  finYear: filters.financialYear,
  month: filters.month
});


      const [dashboardResponse, expenditureResponse] = await Promise.all([
        fetch(
            `${API_BASE}/MISReport/GetDashboardDataByUser?UserId=${userId}&queryType=ALL&finYear=${filters.financialYear}&month=${filters.month}`,

          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        fetch(
  `${API_BASE}/MISReport/GetExpenditureDashboardByFilter?UserId=${userId}&queryType=ALL&finYear=${filters.financialYear}&month=${filters.month}`,
  {
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
  }
),
      ]);

      const dashboardJson = await dashboardResponse.json();
      const expenditureJson = await expenditureResponse.json();

      if (dashboardJson.Status && dashboardJson.Data) {
        setDashboardData(dashboardJson.Data);
      }

      console.log("Expenditure Response:", expenditureJson);
if (expenditureJson.Status && expenditureJson.Data) {
  console.log("Setting expenditure data:", expenditureJson.Data);
  setExpenditureData(expenditureJson.Data);
} else {
  console.error("Expenditure data not available:", expenditureJson);
}
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
    }, [filters.financialYear, filters.month]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      financialYear: "2025-26",
      month: new Date().getMonth() + 1,
    });
  };

  const handleExportReport = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Matrix Data Sheet
      const matrixData = [
        ["MIS REPORT - HANDPUMP MANAGEMENT SYSTEM"],
        ["Department of Panchayati Raj, Uttar Pradesh"],
        ["Date:", new Date().toLocaleDateString("en-IN")],
        ["Financial Year:", filters.financialYear],
        ["Month:", months.find((m) => m.value === filters.month)?.label],
        [],
        ["HANDPUMP MATRIX"],
        ["Metric", "Value"],
        ["Total Handpumps", dashboardData?.HandpumpMatrix?.TotalHandpumps || 0],
        [
          "Active Handpumps",
          dashboardData?.HandpumpMatrix?.ActiveHandpumps || 0,
        ],
        [
          "Inactive Handpumps",
          dashboardData?.HandpumpMatrix?.InactiveHandpumps || 0,
        ],
        [
          "Under Maintenance",
          dashboardData?.HandpumpMatrix?.UnderMaintenance || 0,
        ],
        [],
        ["COMPLAINT MATRIX"],
        [
          "Total Complaints Raised",
          dashboardData?.ComplaintMatrix?.TotalComplaintsRaised || 0,
        ],
        ["Total Resolved", dashboardData?.ComplaintMatrix?.TotalResolved || 0],
        ["Total Pending", dashboardData?.ComplaintMatrix?.TotalPending || 0],
      ];

      const ws1 = XLSX.utils.aoa_to_sheet(matrixData);
      XLSX.utils.book_append_sheet(wb, ws1, "Matrix Data");

      // Top 10 Districts - Inactive
      if (dashboardData?.Top10InactiveHandpumps?.length > 0) {
        const inactiveData = [
          ["TOP 10 DISTRICTS - INACTIVE HANDPUMPS"],
          ["Rank", "District Name", "Count"],
          ...dashboardData.Top10InactiveHandpumps.map((item, index) => [
            index + 1,
            item.DistrictName,
            item.Count,
          ]),
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(inactiveData);
        XLSX.utils.book_append_sheet(wb, ws2, "Top 10 Inactive");
      }

      // Top 10 Districts - Pending Complaints
      if (dashboardData?.Top10PendingComplaints?.length > 0) {
        const complaintsData = [
          ["TOP 10 DISTRICTS - PENDING COMPLAINTS"],
          ["Rank", "District Name", "Count"],
          ...dashboardData.Top10PendingComplaints.map((item, index) => [
            index + 1,
            item.DistrictName,
            item.Count,
          ]),
        ];
        const ws3 = XLSX.utils.aoa_to_sheet(complaintsData);
        XLSX.utils.book_append_sheet(wb, ws3, "Top 10 Complaints");
      }

      // Expenditure Data
      // Expenditure Data
if (expenditureData) {
  const expenditureSheet = [
    ["EXPENDITURE REPORT"],
    ["Metric", "Value (₹ in Lac)"],
    ["LAST MONTH"],
    ["Repair", expenditureData.LmRepair?.toFixed(2) || 0],
    ["Rebore", expenditureData.LmRebore?.toFixed(2) || 0],
    ["Total", expenditureData.LmTotal?.toFixed(2) || 0],
    [],
    ["LAST FINANCIAL YEAR"],
    ["Repair", expenditureData.LfRepair?.toFixed(2) || 0],
    ["Rebore", expenditureData.LfRebore?.toFixed(2) || 0],
    ["Total", expenditureData.LfTotal?.toFixed(2) || 0],
    [],
    ["CURRENT FINANCIAL YEAR"],
    ["Repair", expenditureData.CfRepair?.toFixed(2) || 0],
    ["Rebore", expenditureData.CfRebore?.toFixed(2) || 0],
    ["Total", expenditureData.CfTotal?.toFixed(2) || 0],
    [],
    ["AVERAGE COST PER HP (Current FY)"],
    ["Avg Repair Cost", expenditureData.AvgRepairHp?.toFixed(2) || 0],
    ["Avg Rebore Cost", expenditureData.AvgReboreHp?.toFixed(2) || 0],
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(expenditureSheet);
  XLSX.utils.book_append_sheet(wb, ws4, "Expenditure");
}

      const filename = `MIS_Report_${filters.financialYear}_${
        months.find((m) => m.value === filters.month)?.label
      }_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export report");
    }
  };

  const handleExportPDF = async () => {
  try {
    // Hide export buttons temporarily
    const exportButtons = document.querySelectorAll('.export-button');
    exportButtons.forEach(btn => btn.style.display = 'none');

    // Get the main container
    const element = document.getElementById('mis-report-container');
    
    // Increase quality by using higher scale
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc'
    });

    // Show buttons again
    exportButtons.forEach(btn => btn.style.display = 'flex');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    // If content is too long, split into multiple pages
    const pageHeight = pdfHeight;
    const heightLeft = imgHeight * ratio;
    let position = 0;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    let leftHeight = heightLeft - pdfHeight;

    while (leftHeight > 0) {
      position = leftHeight - imgHeight * ratio;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
      leftHeight -= pdfHeight;
    }

    const filename = `MIS_Report_${filters.financialYear}_${
      months.find((m) => m.value === filters.month)?.label
    }_${new Date().toISOString().split("T")[0]}.pdf`;
    
    pdf.save(filename);
  } catch (error) {
    console.error("PDF export error:", error);
    alert("Failed to export PDF");
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader
            className="animate-spin text-blue-600 mx-auto mb-4"
            size={48}
          />
          <p className="text-gray-600 text-lg">Loading MIS Report...</p>
        </div>
      </div>
    );
  }

  const handpumpMatrix = dashboardData?.HandpumpMatrix || {};
  const complaintMatrix = dashboardData?.ComplaintMatrix || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100">
<div id="mis-report-container" className="max-w-7xl mx-auto p-6">
          {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-200">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              MIS REPORT
            </h1>
            <h2 className="text-xl font-semibold text-blue-600 mb-1">
              ONLINE HANDPUMP MANAGEMENT SYSTEM
            </h2>
            <p className="text-gray-600">
              Department of Panchayati Raj, Uttar Pradesh
            </p>
            <p className="text-sm text-gray-500 mt-2">
              DATE:{" "}
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Filter Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Filter size={20} className="text-blue-600" />
                Report Filters
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Reset
                </button>
                <button
  onClick={handleExportReport}
  className="export-button px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
>
  <Download size={16} />
  Export Excel
</button>
<button
  onClick={handleExportPDF}
  className="export-button px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
>
  <FileText size={16} />
  Export PDF
</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Financial Year
                </label>
                <select
                  value={filters.financialYear}
                  onChange={(e) =>
                    handleFilterChange("financialYear", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                >
                  {financialYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <select
                  value={filters.month}
                  onChange={(e) =>
                    handleFilterChange("month", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              
            </div>
          </div>
        </div>

        {/* Matrix Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Handpump Matrix */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Droplets size={24} className="text-blue-600" />
                HANDPUMP MATRIX
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                  <p className="text-blue-100 text-sm font-medium mb-2">
                    TOTAL HANDPUMPS
                  </p>
                  <p className="text-4xl font-bold">
                    {handpumpMatrix.TotalHandpumps?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                  <p className="text-green-100 text-sm font-medium mb-2">
                    ACTIVE
                  </p>
                  <p className="text-4xl font-bold">
                    {handpumpMatrix.ActiveHandpumps?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-600 to-rose-600 rounded-xl p-6 text-white shadow-lg">
                  <p className="text-red-100 text-sm font-medium mb-2">
                    INACTIVE
                  </p>
                  <p className="text-4xl font-bold">
                    {handpumpMatrix.InactiveHandpumps?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                  <p className="text-amber-100 text-sm font-medium mb-2">
                    UNDER MAINTENANCE
                  </p>
                  <p className="text-4xl font-bold">
                    {handpumpMatrix.UnderMaintenance?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              {/* Visual Chart */}
              <div className="mt-6">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      {
                        name: "Total",
                        value: handpumpMatrix.TotalHandpumps || 0,
                        fill: "#3B82F6",
                      },
                      {
                        name: "Active",
                        value: handpumpMatrix.ActiveHandpumps || 0,
                        fill: "#10B981",
                      },
                      {
                        name: "Inactive",
                        value: handpumpMatrix.InactiveHandpumps || 0,
                        fill: "#EF4444",
                      },
                      {
                        name: "Maintenance",
                        value: handpumpMatrix.UnderMaintenance || 0,
                        fill: "#F59E0B",
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Complaint Matrix */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText size={24} className="text-purple-600" />
                COMPLAINT MANAGEMENT
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium mb-2">
                        CUMULATIVE COMPLAINTS RAISED
                      </p>
                      <p className="text-4xl font-bold">
                        {complaintMatrix.TotalComplaintsRaised?.toLocaleString() ||
                          0}
                      </p>
                    </div>
                    <TrendingUp size={48} className="opacity-50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                    <p className="text-green-100 text-sm font-medium mb-2">
                      RESOLVED
                    </p>
                    <p className="text-3xl font-bold">
                      {complaintMatrix.TotalResolved?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-white shadow-lg">
                    <p className="text-orange-100 text-sm font-medium mb-2">
                      PENDING
                    </p>
                    <p className="text-3xl font-bold">
                      {complaintMatrix.TotalPending?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                {/* Visual Chart */}
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart
                      data={[
                        {
                          name: "Raised",
                          value: complaintMatrix.TotalComplaintsRaised || 0,
                          fill: "#A855F7",
                        },
                        {
                          name: "Resolved",
                          value: complaintMatrix.TotalResolved || 0,
                          fill: "#10B981",
                        },
                        {
                          name: "Pending",
                          value: complaintMatrix.TotalPending || 0,
                          fill: "#F59E0B",
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Bar dataKey="value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 10 Districts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top 10 Inactive Handpumps */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-rose-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingDown size={24} className="text-red-600" />
                TOP 10 DISTRICTS (Inactive Handpumps)
              </h3>
            </div>
            <div className="p-6">
              {dashboardData?.Top10InactiveHandpumps?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Rank
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          District
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                          Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dashboardData.Top10InactiveHandpumps.map(
                        (item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-red-50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                              {item.DistrictName}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                                {item.Count}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle
                    size={48}
                    className="mx-auto mb-4 text-gray-400"
                  />
                  <p>No inactive handpump data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Top 10 Pending Complaints */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Clock size={24} className="text-orange-600" />
                TOP 10 DISTRICTS (Pending Complaints)
              </h3>
            </div>
            <div className="p-6">
              {dashboardData?.Top10PendingComplaints?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Rank
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          District
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                          Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dashboardData.Top10PendingComplaints.map(
                        (item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-orange-50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                              {item.DistrictName}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700">
                                {item.Count}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle
                    size={48}
                    className="mx-auto mb-4 text-gray-400"
                  />
                  <p>No pending complaint data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Top 10 Under Maintenance - MOVE THIS HERE */}
  <div className="bg-white rounded-xl shadow-lg border border-gray-200">
    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-yellow-50">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Activity size={24} className="text-amber-600" />
        TOP 10 DISTRICTS (Under Maintenance)
      </h3>
    </div>
    <div className="p-6">
      {dashboardData?.Top10UnderMaintenance?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  District
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dashboardData.Top10UnderMaintenance.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-amber-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                    {item.DistrictName}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-700">
                      {item.Count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Activity
            size={48}
            className="mx-auto mb-4 text-gray-400"
          />
          <p>No under maintenance data available</p>
        </div>
      )}
    </div>
  </div>
        </div>

        {/* Expenditure Section */}
{expenditureData && (
  <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <IndianRupeeIcon size={24} className="text-green-600" />
        EXPENDITURE (In Lac)
      </h3>
    </div>
    <div className="p-6">
      {/* Table Layout matching PDF */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-800"></th>
              <th className="border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-800">
                LAST MONTH
              </th>
              <th className="border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-800">
                LAST FIN. YR.
              </th>
              <th className="border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-800">
                PRESENT FIN. YR.
              </th>
              <th className="border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-800">
                Average Cost /per H.P.<br />(present Fin Yr.)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-blue-50 transition-colors">
              <td className="border border-gray-300 px-4 py-3 text-sm font-bold text-gray-800 bg-blue-50">
                REPAIR
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-blue-100 text-blue-700">
                  ₹{expenditureData.LmRepair?.toFixed(2) || 0}L
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-blue-100 text-blue-700">
                  ₹{expenditureData.LfRepair?.toFixed(2) || 0}L
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-blue-100 text-blue-700">
                  ₹{expenditureData.CfRepair?.toFixed(2) || 0}L
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-amber-100 text-amber-700">
                  ₹{expenditureData.AvgRepairHp?.toFixed(2) || 0}
                </span>
              </td>
            </tr>
            <tr className="hover:bg-green-50 transition-colors">
              <td className="border border-gray-300 px-4 py-3 text-sm font-bold text-gray-800 bg-green-50">
                REBORE
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-green-100 text-green-700">
                  ₹{expenditureData.LmRebore?.toFixed(2) || 0}L
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-green-100 text-green-700">
                  ₹{expenditureData.LfRebore?.toFixed(2) || 0}L
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-green-100 text-green-700">
                  ₹{expenditureData.CfRebore?.toFixed(2) || 0}L
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-teal-100 text-teal-700">
                  ₹{expenditureData.AvgReboreHp?.toFixed(2) || 0}
                </span>
              </td>
            </tr>
            <tr className="hover:bg-purple-50 transition-colors">
              <td className="border border-gray-300 px-4 py-3 text-sm font-bold text-gray-800 bg-purple-50">
                TOTAL
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-purple-100 text-purple-700">
                  ₹{expenditureData.LmTotal?.toFixed(2) || 0}L
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-purple-100 text-purple-700">
                  ₹{expenditureData.LfTotal?.toFixed(2) || 0}L
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-purple-100 text-purple-700">
                  ₹{expenditureData.CfTotal?.toFixed(2) || 0}L
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center bg-gray-50">
                <span className="text-gray-500 text-xs">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Expenditure Chart */}
      {/* <div className="mt-6">
        <h4 className="text-sm font-bold text-gray-700 mb-3">Expenditure Comparison</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[
              {
                name: "LM Repair",
                value: expenditureData.LmRepair || 0,
                fill: "#3B82F6",
              },
              {
                name: "LM Rebore",
                value: expenditureData.LmRebore || 0,
                fill: "#10B981",
              },
              {
                name: "CF Repair",
                value: expenditureData.CfRepair || 0,
                fill: "#A855F7",
              },
              {
                name: "CF Rebore",
                value: expenditureData.CfRebore || 0,
                fill: "#F59E0B",
              },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis
              stroke="#6b7280"
              label={{
                value: "₹ in Lac",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip formatter={(value) => `₹${value.toFixed(2)}L`} />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div> */}
    </div>
  </div>
)}

      
        {/* Footer Note */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="text-center text-sm text-gray-600">
            <p className="font-semibold mb-2">
              Report Generated on {new Date().toLocaleString("en-IN")}
            </p>
            <p>
              This report is auto-generated from the Handpump Management System
            </p>
            <p className="mt-2 text-xs text-gray-500">
  Financial Year: {filters.financialYear} | Month:{" "}
  {months.find((m) => m.value === filters.month)?.label}
</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MISReportingPage;
