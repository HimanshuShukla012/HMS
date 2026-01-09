import React, { useMemo } from "react";
import { IndianRupeeIcon, CheckCircle, TrendingUp } from "lucide-react";
import { Requisition } from "../../../hooks/admin/useAdminData";

interface FinancialOverviewProps {
  requisitions: Requisition[];
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  requisitions,
}) => {
  const stats = useMemo(() => {
    let totalSanctionAmount = 0;
    let approvedRequisitions = 0;
    let completedRequisitions = 0;
    const totalRequisitions = requisitions.length;

    requisitions.forEach((req) => {
      // Parse sanction amount - handle both string and number formats
      if (req.SanctionAmount) {
        const amount = parseFloat(req.SanctionAmount.toString());
        if (!isNaN(amount) && amount > 0) {
          totalSanctionAmount += amount;
        }
      }

      // Count approved (status 2) and completed (status 3)
      if (req.RequisitionStatus === 2) {
        approvedRequisitions++;
      } else if (req.RequisitionStatus === 3) {
        completedRequisitions++;
      }
    });

    // Calculate average only for requisitions with sanction amount
    const requisitionsWithAmount = requisitions.filter(
      (req) =>
        req.SanctionAmount && parseFloat(req.SanctionAmount.toString()) > 0
    ).length;

    return {
      totalSanctionAmount,
      approvedRequisitions,
      completedRequisitions,
      totalRequisitions,
      requisitionsWithAmount,
    };
  }, [requisitions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Sanctioned Amount */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-gray-800">
            Total Sanctioned Amount
          </h4>
          <div className="p-3 bg-green-100 rounded-lg">
            <IndianRupeeIcon size={24} className="text-green-600" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600">
            ₹{(stats.totalSanctionAmount / 100000).toFixed(2)}L
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Across {stats.requisitionsWithAmount} requisition
            {stats.requisitionsWithAmount !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.totalRequisitions > 0
              ? `${(
                  (stats.requisitionsWithAmount / stats.totalRequisitions) *
                  100
                ).toFixed(0)}% with sanction`
              : "No data"}
          </p>
        </div>
      </div>

      {/* Average Sanction Amount */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-gray-800">
            Avg. Sanction Amount
          </h4>
          <div className="p-3 bg-blue-100 rounded-lg">
            <TrendingUp size={24} className="text-blue-600" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">
            ₹
            {stats.requisitionsWithAmount > 0
              ? (
                  stats.totalSanctionAmount /
                  stats.requisitionsWithAmount /
                  1000
                ).toFixed(1)
              : 0}
            K
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Per sanctioned requisition
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Based on {stats.requisitionsWithAmount} requisition
            {stats.requisitionsWithAmount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-gray-800">Completion Rate</h4>
          <div className="p-3 bg-purple-100 rounded-lg">
            <CheckCircle size={24} className="text-purple-600" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-600">
            {stats.totalRequisitions > 0
              ? Math.round(
                  (stats.completedRequisitions / stats.totalRequisitions) * 100
                )
              : 0}
            %
          </div>
          <p className="text-sm text-gray-600 mt-2">Overall efficiency</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.completedRequisitions} of {stats.totalRequisitions} completed
          </p>
        </div>
      </div>
    </div>
  );
};
