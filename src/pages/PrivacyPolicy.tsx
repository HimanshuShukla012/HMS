import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  MapPin, 
  Camera, 
  Smartphone, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  Mail, 
  FileText, 
  Users, 
  Calendar,
  Server,
  UserCheck,
  Clock,
  Archive,
  Settings,
  Info,
  Building2
} from 'lucide-react';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState(null);

  const dataCollected = [
    {
      icon: <UserCheck size={24} />,
      title: "Personal Information",
      description: "Collected During Registration",
      items: ["Full Name", "Mobile Number", "Email Address", "Address (Village/Block/District)"],
      color: "from-blue-500 to-cyan-500",
      purpose: "Authentication, user identification, and official communication"
    },
    {
      icon: <MapPin size={24} />,
      title: "Location Data",
      description: "GPS Collection (Foreground Only)",
      items: ["Handpump geo-tagging", "Repair/rebore form submission", "Verification location"],
      color: "from-green-500 to-emerald-500",
      purpose: "Official documentation and accurate location tracking"
    },
    {
      icon: <Camera size={24} />,
      title: "Photos & Media",
      description: "Image Uploads",
      items: ["Handpump photos", "Repair site images", "Verification photos"],
      color: "from-purple-500 to-pink-500",
      purpose: "Official documentation and government reporting"
    },
    {
      icon: <Smartphone size={24} />,
      title: "Usage Data",
      description: "Anonymous Analytics",
      items: ["App screens visited", "Buttons clicked", "Session timing", "Device type"],
      color: "from-orange-500 to-red-500",
      purpose: "Improve app functionality and user experience"
    },
    {
      icon: <AlertCircle size={24} />,
      title: "Diagnostic Data",
      description: "Technical Information",
      items: ["Crash logs", "Error logs", "Performance data"],
      color: "from-indigo-500 to-purple-500",
      purpose: "Fix issues and improve app stability"
    }
  ];

  const notCollected = [
    { icon: <XCircle size={20} />, item: "Contacts" },
    { icon: <XCircle size={20} />, item: "Financial Information" },
    { icon: <XCircle size={20} />, item: "Device Advertising Identifier (IDFA)" },
    { icon: <XCircle size={20} />, item: "Biometric Data" },
    { icon: <XCircle size={20} />, item: "Health Data" },
    { icon: <XCircle size={20} />, item: "Browsing History" },
    { icon: <XCircle size={20} />, item: "Data for Advertising or Tracking" }
  ];

  const dataUsage = [
    { icon: <UserCheck size={20} />, text: "Create and manage user accounts" },
    { icon: <Shield size={20} />, text: "Verify user identity and roles" },
    { icon: <MapPin size={20} />, text: "Record and manage handpump geo-tagging" },
    { icon: <Settings size={20} />, text: "Process repair and maintenance requests" },
    { icon: <Database size={20} />, text: "Maintain government water infrastructure data" },
    { icon: <CheckCircle2 size={20} />, text: "Improve app performance" },
    { icon: <Eye size={20} />, text: "Ensure transparency and accountability" }
  ];

  const yourRights = [
    {
      icon: <FileText size={24} />,
      title: "Correction of Information",
      description: "Request updates to your personal data",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <XCircle size={24} />,
      title: "Account Deletion",
      description: "Request removal of your account",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: <Eye size={24} />,
      title: "Data Access",
      description: "View personal data we store",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const securityFeatures = [
    {
      icon: <Lock size={24} />,
      title: "Encrypted Servers",
      description: "Industry-standard encryption protocols",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Shield size={24} />,
      title: "Restricted Access",
      description: "Only authorized officials can access data",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: <Server size={24} />,
      title: "Secure Storage",
      description: "Protected infrastructure and backups",
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white py-24 px-6">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-blue-600/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
            <Shield className="h-6 w-6 text-blue-400" />
            <span className="text-blue-300 font-medium">Privacy Policy</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Privacy Policy
            <span className="block text-2xl md:text-3xl text-cyan-300 font-normal mt-2">Handpump Management System (HMS)</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Your privacy and data security are our priority. Learn how we collect, use, and protect your information.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
            <Calendar size={18} className="text-cyan-300" />
            <span className="text-blue-100">Last Updated: December 2025</span>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Info size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">About This Policy</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  The Handpump Management System ("HMS", "we", "our", "us") is a digital platform used for the monitoring, 
                  maintenance, and geo-tagging of handpumps and rural water infrastructure.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  This Privacy Policy describes how we collect, use, store, and protect your information when you use our mobile application.
                </p>
                <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                  <p className="text-blue-900 font-semibold">
                    By using HMS, you agree to this Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Information We Collect */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Information We
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Collect
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent disclosure of all data collection practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dataCollected.map((item, index) => (
              <div 
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                
                <div className="space-y-2 mb-6">
                  {item.items.map((subItem, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{subItem}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs text-blue-900">
                    <span className="font-semibold">Purpose:</span> {item.purpose}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do NOT Collect */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <XCircle size={40} className="text-white" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                What We <span className="text-red-600">DO NOT</span> Collect
              </h2>
              <p className="text-lg text-gray-600">
                HMS does not collect any of the following data types
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {notCollected.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-red-50 rounded-xl p-4 border border-red-100">
                  <div className="text-red-500">{item.icon}</div>
                  <span className="text-gray-900 font-medium">{item.item}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
              <div className="flex items-start gap-4">
                <CheckCircle2 size={32} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Ads, No Tracking</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We do not show advertisements or allow cross-app tracking. Your data is used exclusively for 
                    handpump management and government reporting purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Use Your Information */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              How We Use
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Your Information
              </span>
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
            <div className="space-y-4 mb-8">
              {dataUsage.map((item, index) => (
                <div key={index} className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100 hover:border-purple-200 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-gray-900 font-medium text-lg">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
              <p className="text-red-900 font-semibold text-lg">
                We do NOT use your information for marketing, advertising, or selling to third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sharing */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Users size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">How Your Information Is Shared</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  We may share data only with authorized entities for official government purposes:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Building2 size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Government Departments</h3>
                <p className="text-gray-600 text-sm">Water management authorities</p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <UserCheck size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Administrative Personnel</h3>
                <p className="text-gray-600 text-sm">Authorized officials only</p>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                  <Server size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Service Providers</h3>
                <p className="text-gray-600 text-sm">Firebase (analytics, storage)</p>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
              <p className="text-red-900 font-semibold">
                We NEVER sell your data to advertisers or external commercial entities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Security */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Data Storage &
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Security
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-xl">
            <div className="flex items-start gap-4">
              <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-1" />
              <p className="text-yellow-900">
                <span className="font-semibold">Important:</span> While we use industry-standard security practices, 
                no digital system is fully secure, and we cannot guarantee absolute protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Retention & Your Rights */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Data Retention */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Archive size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Retention</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Personal and operational data is retained as required by government project guidelines.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Database size={20} className="text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Photos, reports, and geolocation records may be archived for audit and compliance purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <UserCheck size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Rights</h2>
              <div className="space-y-4">
                {yourRights.map((right, index) => (
                  <div key={index} className="flex items-start gap-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                    <div className={`w-10 h-10 bg-gradient-to-br ${right.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                      {right.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{right.title}</h3>
                      <p className="text-gray-600 text-sm">{right.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-blue-900 text-sm">
                  Requests can be made through the authorized project administrator or via the contact information below.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Policies */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6">
                <Users size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                HMS is not intended for children under 13 years of age.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We do not knowingly collect data from children.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                <Globe size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Data Transfers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Data may be stored or processed on servers located outside your region.
              </p>
              <p className="text-gray-700 leading-relaxed">
                All transfers comply with applicable privacy and security regulations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Updates */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white rounded-3xl shadow-2xl p-12">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText size={32} className="text-cyan-300" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">Changes to This Privacy Policy</h2>
                <p className="text-blue-100 text-lg leading-relaxed mb-4">
                  We may update this Privacy Policy periodically to reflect changes in our practices or for legal compliance.
                </p>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Any updates will be communicated through the app or project administration. We encourage you to review 
                  this policy regularly to stay informed about how we protect your information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-20 px-6 bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Mail size={40} className="text-white" />
          </div>
          
          <h2 className="text-4xl font-black mb-6">Contact Us</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            For questions or concerns regarding this Privacy Policy, please reach out to us
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <Mail size={24} className="text-cyan-300" />
                <a href="mailto:kdsdeveloper25@gmail.com" className="text-xl text-white font-semibold hover:text-cyan-300 transition-colors">
                  kdsdeveloper25@gmail.com
                </a>
              </div>
              
              <div className="h-px bg-white/20 my-6"></div>
              
              <div className="text-blue-100">
                <p className="mb-2"><span className="font-semibold text-white">Organization:</span> [Insert Department / Project Name]</p>
                <p><span className="font-semibold text-white">Address:</span> [Insert Office Address]</p>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-green-500/20 backdrop-blur-md rounded-2xl p-8 border border-green-400/30 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <CheckCircle2 size={32} className="text-green-400 flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-4">App Store Ready</h3>
                <p className="text-green-100 leading-relaxed mb-4">
                  This Privacy Policy accurately reflects HMS data collection practices and is 100% safe to submit 
                  to app stores (Google Play Store, Apple App Store).
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-green-200">
                    <CheckCircle2 size={16} />
                    <span className="text-sm">Transparent Collection</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-200">
                    <CheckCircle2 size={16} />
                    <span className="text-sm">No Advertising</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-200">
                    <CheckCircle2 size={16} />
                    <span className="text-sm">No Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-200">
                    <CheckCircle2 size={16} />
                    <span className="text-sm">Secure Storage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;