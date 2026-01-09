import * as XLSX from 'xlsx';

export const useExportData = () => {
  const exportToExcel = (data: any[], filename: string, sheetName: string) => {
    try {
      if (!data || data.length === 0) {
        alert('No data available to export');
        return;
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      
      const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`);
    } catch (error: any) {
      console.error('Export error:', error);
      alert('Failed to export data: ' + error.message);
    }
  };

  const exportHandpumps = (handpumps: any[]) => {
    const exportData = handpumps.map((hp, index) => ({
      'S.No': index + 1,
      'Handpump ID': hp.HandpumpId,
      'District': hp.DistrictName,
      'Block': hp.BlockName,
      'Gram Panchayat': hp.GrampanchayatName,
      'Village': hp.VillegeName,
      'Status': hp.HandpumpStatus,
      'Water Quality': hp.WaterQuality || 'N/A',
      'Soakpit Connected': hp.SoakpitConnected === 1 ? 'Yes' : 'No',
      'Drainage Connected': hp.DrainageConnected === 1 ? 'Yes' : 'No',
      'Platform Built': hp.PlateformBuild === 1 ? 'Yes' : 'No',
      'Nearby Person': hp.NearByPersonName || 'N/A',
      'Contact': hp.NearByPersonNo || 'N/A',
    }));
    exportToExcel(exportData, 'handpumps_export', 'Handpumps');
  };

  const exportRequisitions = (requisitions: any[]) => {
    const exportData = requisitions.map((req, index) => ({
      'S.No': index + 1,
      'Requisition ID': `REQ-${req.RequisitionId.toString().padStart(4, '0')}`,
      'Handpump ID': req.HandpumpId,
      'Village': req.VillageName,
      'Gram Panchayat': req.GrampanchayatName,
      'Block': req.BlockName,
      'District': req.DistrictName,
      'Type': req.RequisitionType,
      'Date': new Date(req.RequisitionDate).toLocaleDateString('en-IN'),
      'Status': req.RequisitionStatus === 1 ? 'Pending' : req.RequisitionStatus === 2 ? 'Approved' : 'Completed',
      'Sanction Amount': req.SanctionAmount ? `₹${parseFloat(req.SanctionAmount).toLocaleString('en-IN')}` : '-',
      'Completion Date': req.CompletionDateStr || '-',
    }));
    exportToExcel(exportData, 'requisitions_export', 'Requisitions');
  };

  const exportDistrictReport = (data: any[]) => {
    const exportData = data.map((item, index) => ({
      'Sr. No.': index + 1,
      'District Name': item.districtName,
      'No. of Handpumps Geotagged': item.totalGeotagged,
      'No. of Handpumps Active': item.active,
      'No. of Handpumps Inactive': item.inactive,
      'No. of Handpumps with Bad Water Quality': item.badWaterQuality,
      'No. of Handpumps with Good Water Quality': item.goodWaterQuality,
      'No. of Handpumps Soakpit Connected': item.soakpitConnected,
      'No. of Handpumps Drainage Connected': item.drainageConnected
    }));
    exportToExcel(exportData, 'district_report', 'District Report');
  };

  const exportBlockReport = (data: any[], districtName: string) => {
    const exportData = data.map((item, index) => ({
      'Sr. No.': index + 1,
      'Block Name': item.blockName,
      'No. of Handpumps Geotagged': item.totalGeotagged,
      'No. of Handpumps Active': item.active,
      'No. of Handpumps Inactive': item.inactive,
      'No. of Handpumps with Bad Water Quality': item.badWaterQuality,
      'No. of Handpumps with Good Water Quality': item.goodWaterQuality,
      'No. of Handpumps Soakpit Connected': item.soakpitConnected,
      'No. of Handpumps Drainage Connected': item.drainageConnected
    }));
    exportToExcel(exportData, `block_report_${districtName}`, 'Block Report');
  };

  const exportGPReport = (data: any[], blockName: string) => {
    const exportData = data.map((item, index) => ({
      'Sr. No.': index + 1,
      'Gram Panchayat Name': item.gpName,
      'No. of Handpumps Geotagged': item.totalGeotagged,
      'No. of Handpumps Active': item.active,
      'No. of Handpumps Inactive': item.inactive,
      'No. of Handpumps with Bad Water Quality': item.badWaterQuality,
      'No. of Handpumps with Good Water Quality': item.goodWaterQuality,
      'No. of Handpumps Soakpit Connected': item.soakpitConnected,
      'No. of Handpumps Drainage Connected': item.drainageConnected
    }));
    exportToExcel(exportData, `gp_report_${blockName}`, 'GP Report');
  };

  const exportVillageReport = (data: any[], gpName: string) => {
    const exportData = data.map((item, index) => ({
      'Sr. No.': index + 1,
      'Village Name': item.villageName,
      'No. of Handpumps Geotagged': item.totalGeotagged,
      'No. of Handpumps Active': item.active,
      'No. of Handpumps Inactive': item.inactive,
      'No. of Handpumps with Bad Water Quality': item.badWaterQuality,
      'No. of Handpumps with Good Water Quality': item.goodWaterQuality,
      'No. of Handpumps Soakpit Connected': item.soakpitConnected,
      'No. of Handpumps Drainage Connected': item.drainageConnected
    }));
    exportToExcel(exportData, `village_report_${gpName}`, 'Village Report');
  };

  return {
    exportToExcel,
    exportHandpumps,
    exportRequisitions,
    exportDistrictReport,
    exportBlockReport,
    exportGPReport,
    exportVillageReport,
  };
};