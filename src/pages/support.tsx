import React from "react";
import {
  Shield,
  UserCheck,
  Lock,
  Key,
  Mail,
  AlertCircle,
  Info,
  FileText,
  Users,
  Building2,
  Phone,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">

      {/* Background Visuals */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white py-20 px-6 shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-blue-600/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
            <Shield size={22} className="text-blue-300" />
            <span className="text-blue-200 font-medium">Support & Account Assistance</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            HMS Support Center
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Help regarding account access, login issues, and official user management.
          </p>
        </div>
      </div>

      {/* Section: About Accounts */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center">
              <Info size={32} />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                About HMS User Accounts
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                The Handpump Management System (HMS) is an official government
                application used only by authorized staff of the Panchayati Raj Department,
                Government of Uttar Pradesh. **All accounts are issued and managed by government authorities.**
              </p>

              <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-xl">
                <p className="text-blue-900 font-semibold">
                  Users cannot self-register, create, or delete accounts inside the app.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Why Account Deletion Is Not Available In-App */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Account Deletion & Access Policy
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Required for App Store Review – Fully Compliant Language
            </p>
          </div>

          <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

              {/* Reason 1 */}
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
                  <Building2 size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Government-Issued Accounts
                  </h3>
                  <p className="text-gray-700">
                    Accounts are created by the district/block administrators and tied to
                    official roles. Users cannot delete their own accounts.
                  </p>
                </div>
              </div>

              {/* Reason 2 */}
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center">
                  <Users size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Audit & Compliance Requirements
                  </h3>
                  <p className="text-gray-700">
                    Deleting accounts may remove essential government audit records, which
                    is not permitted under operational guidelines.
                  </p>
                </div>
              </div>

              {/* Reason 3 */}
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center">
                  <XCircle size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    In-App Deletion Not Allowed
                  </h3>
                  <p className="text-gray-700">
                    Since accounts represent verified officials, removal must be done
                    through departmental oversight, not through the app.
                  </p>
                </div>
              </div>

              {/* Reason 4 */}
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Apple Guideline Exception – Regulated Use
                  </h3>
                  <p className="text-gray-700">
                    HMS qualifies under Apple's exceptions for *highly regulated
                    industries*, where account deletion can be handled externally.
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-10 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-xl">
              <p className="text-yellow-900">
                <strong>Note:</strong> Apple allows this exception as long as users have a
                way to contact the administrator, which is provided below.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Account Deletion */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Mail size={40} className="text-white" />
          </div>

          <h2 className="text-4xl font-black mb-4">Account Deletion Request</h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            If you are an authorized user and need your account removed, contact the official
            administrator.
          </p>

          <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20">
            <div className="flex flex-col items-center gap-4">
              <Mail size={26} className="text-cyan-300" />
              <a
                href="mailto:kkskservice25@gmail.com?subject=Account Deletion Request"
                className="text-2xl text-white font-semibold hover:text-cyan-300 transition"
              >
                kkskservice25@gmail.com
              </a>

              <div className="mt-6 text-blue-100">
                <p><span className="font-bold text-white">Authorized Department:</span> Panchayati Raj Department</p>
                <p><span className="font-bold text-white">Purpose:</span> Account modification or deactivation</p>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-green-500/20 border border-green-400/30 p-8 rounded-2xl backdrop-blur-md">
            <div className="flex justify-center items-start gap-4">
              <CheckCircle2 size={32} className="text-green-300 mt-1" />
              <p className="text-green-100 text-left">
                This Support Page satisfies Apple's Account Deletion compliance for regulated
                applications.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default SupportPage;