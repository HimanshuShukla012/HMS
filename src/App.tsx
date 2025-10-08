import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import GPDashboard from "./pages/GPDashboard";
import RaiseRequisition from "./pages/RaiseRequisition";
import ManageBeneficiary from "./pages/ManageBeneficiary";
import PumpHouseMaster from "./pages/PumpHouseMaster";
import ViewClosureUpdatesScreen from "./pages/ViewClosureUpdatesScreen"; 
import GMAS from "./pages/GMAS";
import FeeCollectionPage from "./pages/FeeCollectionPage";
import FeeManagementPage from "./pages/FeeManagementPage";
import consultingengineerDashboard from "./pages/consultingengineerDashboard";
import DashboardLayout from "./components/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import AttachCompletionScreen from "./pages/AttachCompletionScreen";
import ManagePumpHouse from "./pages/ManagePumphouse";
import ViewRoaster from "./pages/ViewRoaster";
import WaterQuality from "./pages/waterquality";
import ViewWaterQuality from "./pages/viewwaterquality";
import UserManagement from "./pages/AdminUserManagement";
import FeeManagement from "./pages/AdminFeeManagement";
import ManageHandpump from "./pages/UpdateRoaster";
import MISReportingPage from "./pages/GPReporting";
import PrivateRoute from "./components/PrivateRoute";
import GuidelinesPage from "./pages/guidelines";
import About from "./pages/AboutPage";
import PDFFlipbook from "./pages/gpusermanual"; 
import CreateEstimationScreen from "./pages/CreateEstimate";
import MBVisitReportScreen from "./pages/MbVisitReport";
import LodgeComplaintPage from "./pages/LodgeComplaintPage";
import ManageComplaint from "./pages/ManageComplaint";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/unauthorized"
            element={
              <div className="flex justify-center items-center h-screen">
                <h1 className="text-3xl font-bold text-red-600">
                  Unauthorized Access
                </h1>
              </div>
            }
          />

          {/* Admin protected routes */}
          <Route element={<PrivateRoute allowedRoles={["Admin"]} />}>
            <Route path="/admin/*" element={<DashboardLayout role="admin" />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="fee-management" element={<FeeManagement />} />
              <Route path="view-water-quality" element={<ViewWaterQuality />} />
              <Route path="manage-handpump" element={<ManageHandpump />} />
              <Route path="gmas" element={<GMAS />} />
              <Route path="reporting" element={<MISReportingPage />} />
            </Route>
          </Route>

          {/* Gram Panchayat protected routes - Updated to include new role */}
          <Route element={<PrivateRoute allowedRoles={["gram panchayat", "Gram_Panchayat_Sachiv"]} />}>
            <Route path="/gp/*" element={<DashboardLayout role="gp" />}>
              <Route path="dashboard" element={<GPDashboard />} />
              <Route path="raise-requisition" element={<RaiseRequisition />} />
              <Route path="manage-beneficiary" element={<ManageBeneficiary />} />
              <Route path="pump-house-master" element={<PumpHouseMaster />} />
              <Route path="view-closure" element={<ViewClosureUpdatesScreen />} />
              <Route path="gmas" element={<GMAS />} />
              <Route path="fee-collection" element={<FeeCollectionPage />} />
              <Route path="fee-management" element={<FeeManagementPage />} />
              <Route path="attach-completion" element={<AttachCompletionScreen />} />
              <Route path="manage-pumphouse" element={<ManagePumpHouse />} />
              <Route path="view-roaster" element={<ViewRoaster />} />
              <Route path="water-quality" element={<WaterQuality />} />
              <Route path="view-water-quality" element={<ViewWaterQuality />} />
              <Route path="manage-handpump" element={<ManageHandpump />} />
              <Route path="reporting" element={<MISReportingPage />} />
              <Route path="user-manual" element={<PDFFlipbook />} />
              <Route path="lodge-complaint" element={<LodgeComplaintPage />} />
              <Route path="manage-complaint" element={<ManageComplaint />} />
            </Route>
          </Route>

          {/* Assistant Development Officer protected routes */}
          <Route element={<PrivateRoute allowedRoles={["Assistant_Development_Officer"]} />}>
            <Route path="/ado/*" element={<DashboardLayout role="assistant_development_officer" />}>
              <Route path="dashboard" element={<div>ADO Dashboard - Coming Soon</div>} />
              <Route path="review-requisitions" element={<div>Review Requisitions - Coming Soon</div>} />
              <Route path="approve-estimates" element={<div>Approve Estimates - Coming Soon</div>} />
              <Route path="monitor-progress" element={<div>Monitor Progress - Coming Soon</div>} />
              <Route path="water-quality" element={<div>Water Quality Reports - Coming Soon</div>} />
              <Route path="inspection-reports" element={<div>Inspection Reports - Coming Soon</div>} />
              <Route path="area-management" element={<div>Area Management - Coming Soon</div>} />
              <Route path="reporting" element={<div>ADO Reports - Coming Soon</div>} />
            </Route>
          </Route>

          {/* District Panchayati Raj Officer protected routes */}
          <Route element={<PrivateRoute allowedRoles={["District_Panchayati_Raj_Officer"]} />}>
            <Route path="/dpro/*" element={<DashboardLayout role="district_panchayati_raj_officer" />}>
              <Route path="dashboard" element={<div>DPRO Dashboard - Coming Soon</div>} />
              <Route path="block-management" element={<div>Block Management - Coming Soon</div>} />
              <Route path="gp-performance" element={<div>GP Performance - Coming Soon</div>} />
              <Route path="resource-allocation" element={<div>Resource Allocation - Coming Soon</div>} />
              <Route path="project-approvals" element={<div>Project Approvals - Coming Soon</div>} />
              <Route path="budget-reviews" element={<div>Budget Reviews - Coming Soon</div>} />
              <Route path="quality-audits" element={<div>Quality Audits - Coming Soon</div>} />
              <Route path="project-status" element={<div>Project Status - Coming Soon</div>} />
              <Route path="complaint-overview" element={<div>Complaint Overview - Coming Soon</div>} />
              <Route path="performance-metrics" element={<div>Performance Metrics - Coming Soon</div>} />
              <Route path="reporting" element={<div>DPRO Reports - Coming Soon</div>} />
              <Route path="gmas" element={<GMAS />} />
            </Route>
          </Route>

          {/* Consulting Engineer protected routes */}
          <Route element={<PrivateRoute allowedRoles={["call center", "Consulting_Engineer"]} />}>
            <Route
              path="/consultingengineer/*"
              element={<DashboardLayout role="consultingengineer" />}
            >
              <Route path="dashboard" element={<consultingengineerDashboard />} />
              <Route path="mb-visit-report" element={<MBVisitReportScreen />} />
              <Route path="create-estimate" element={<CreateEstimationScreen />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;