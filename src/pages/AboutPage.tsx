import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Target, 
  Users, 
  Building2, 
  PhoneCall, 
  Monitor, 
  CheckCircle, 
  Award,
  Map,
  Layers,
  Wrench,
  Send,
  Sparkles,
  ArrowRight,
  Play,
  BarChart3,
  UserCheck,
  Shield,
  Zap,
  Globe,
  Heart,
  Archive,
  CheckCircle2,
  FileText,
  Camera,
  Settings,
  MapPin,
  Clock,
  AlertTriangle,
  Database
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const objectives = [
    {
      icon: <Clock size={24} />,
      title: "Ensure Timely Repairs & Maintenance",
      description: "Guarantee swift response to handpump failures through digital requisition systems and structured workflows.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Building2 size={24} />,
      title: "Empower Gram Panchayats",
      description: "Digital tools for requisition raising, tracking, and monitoring handpump lifecycle management at village level.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <UserCheck size={24} />,
      title: "Support Consulting Engineers",
      description: "Structured workflows for technical estimation, site visits, material booking, and quality verification.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Real-time District Monitoring",
      description: "Comprehensive dashboards and GIS mapping for district and state-level oversight with live status updates.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Shield size={24} />,
      title: "Complete Transparency",
      description: "Digital documentation of costs, materials, timelines, and quality assessments for full accountability.",
      color: "from-teal-500 to-blue-500"
    }
  ];

  const keyFeatures = [
    {
      icon: <Send size={32} />,
      title: "Digital Requisition Management",
      description: "Seamless handpump repair requests by Gram Panchayats with instant recording, image uploads, and automatic forwarding to Consulting Engineers.",
      gradient: "from-blue-600 via-purple-600 to-indigo-700",
      stats: "Instant Processing"
    },
    {
      icon: <FileText size={32} />,
      title: "Automated Estimation System",
      description: "Engineers create detailed technical estimations with materials, labor costs, GST calculations, and consulting fees with transparent breakdowns.",
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      stats: "100% Transparent"
    },
    {
      icon: <Camera size={32} />,
      title: "Completion Documentation",
      description: "Digital upload of material bills, labor records, daily wages tracking, and photographic evidence for complete work verification.",
      gradient: "from-orange-500 via-red-500 to-pink-600",
      stats: "Full Documentation"
    },
    {
      icon: <Database size={32} />,
      title: "Material Book & Visit Reports",
      description: "Engineers maintain detailed material logs and conduct site inspections with platform condition, pump alignment, and maintenance assessments.",
      gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
      stats: "Quality Assured"
    },
    {
      icon: <MapPin size={32} />,
      title: "GIS Integration & Mapping",
      description: "Every handpump geo-tagged with live status indicators: Active (green), Faulty (red), Under Repair (yellow) with satellite views.",
      gradient: "from-green-500 via-emerald-500 to-teal-600",
      stats: "Live Tracking"
    },
    {
      icon: <CheckCircle2 size={32} />,
      title: "Closure & Verification System",
      description: "District-level verification of materials and bills with satisfaction ratings, escalation handling, and final approval mechanisms.",
      gradient: "from-pink-500 via-rose-500 to-red-600",
      stats: "Quality Control"
    }
  ];

  const stats = [
    { 
      label: "Districts Covered", 
      value: "75", 
      description: "Complete HMS deployment across Uttar Pradesh",
      icon: <Globe size={20} />,
      color: "from-blue-500 to-cyan-500"
    },
    { 
      label: "Block Panchayats", 
      value: "826", 
      description: "Digital handpump monitoring in every block",
      icon: <Building2 size={20} />,
      color: "from-purple-500 to-pink-500"
    },
    { 
      label: "Gram Panchayats", 
      value: "57,695", 
      description: "Empowered with digital requisition tools",
      icon: <Users size={20} />,
      color: "from-green-500 to-emerald-500"
    },
    { 
      label: "Handpumps Managed", 
      value: "2,50,000+", 
      description: "Digital lifecycle management coverage",
      icon: <Droplets size={20} />,
      color: "from-orange-500 to-red-500"
    }
  ];

  const workflowStages = [
    {
      stage: "Stage 1",
      icon: <PhoneCall size={28} />,
      title: "Raise Requisition",
      description: "Gram Panchayat reports non-functional handpump, selects repair/rebore mode, uploads field evidence images for instant recording.",
      color: "from-indigo-500 to-purple-600",
      features: ["GP Reporting", "Mode Selection", "Image Upload", "Instant Record"]
    },
    {
      stage: "Stage 2", 
      icon: <FileText size={28} />,
      title: "Estimation & Sanction",
      description: "Engineer prepares technical estimation with materials, labor costs, GST & fees. Panchayat reviews and sanctions request.",
      color: "from-blue-500 to-cyan-500",
      features: ["Technical Estimation", "Cost Breakdown", "GP Review", "Sanction Approval"]
    },
    {
      stage: "Stage 3",
      icon: <Wrench size={28} />,
      title: "Attach Completion",
      description: "After work completion: upload material bills, record labor costs, enter daily wages & mandays with automatic transparency calculations.",
      color: "from-green-500 to-emerald-500",
      features: ["Material Bills", "Labor Records", "Wage Tracking", "Auto Calculation"]
    },
    {
      stage: "Stage 4",
      icon: <Database size={28} />,
      title: "Material Book & Visit Report",
      description: "Engineer logs detailed MB entries and conducts site visit for platform condition, pump alignment, and preventive maintenance checks.",
      color: "from-yellow-500 to-orange-500",
      features: ["MB Entries", "Site Visit", "Quality Check", "Technical Validation"]
    },
    {
      stage: "Stage 5",
      icon: <UserCheck size={28} />,
      title: "Verification Process",
      description: "District/CE level verification of MB items and bills. Results marked as Satisfactory/Not Satisfactory with escalation triggers.",
      color: "from-pink-500 to-rose-500",
      features: ["Bill Verification", "Quality Rating", "Escalation Handling", "Cost Validation"]
    },
    {
      stage: "Stage 6",
      icon: <Archive size={28} />,
      title: "Closure & GIS Update",
      description: "Final closure status updated with geo-tagged mapping. Live status indicators updated across district dashboards.",
      color: "from-slate-500 to-gray-600",
      features: ["Final Closure", "GIS Update", "Status Indicators", "Dashboard Sync"]
    }
  ];

  const benefits = [
    {
      category: "Gram Panchayats",
      description: "Easy digital interface, faster repairs, reduced paperwork",
      icon: <Building2 size={24} />,
      color: "from-blue-500 to-cyan-500",
      items: ["User-friendly digital interface", "Accelerated repair cycles", "Paperwork elimination"]
    },
    {
      category: "Engineers", 
      description: "Standardized tools, reduced errors, structured workflows",
      icon: <Settings size={24} />,
      color: "from-green-500 to-emerald-500",
      items: ["Standardized estimation tools", "Error reduction systems", "Structured reporting workflows"]
    },
    {
      category: "District Authorities",
      description: "Real-time dashboards, stage-wise monitoring, analytics",
      icon: <BarChart3 size={24} />,
      color: "from-purple-500 to-pink-500", 
      items: ["Real-time monitoring dashboards", "Complete stage-wise tracking", "Performance analytics"]
    },
    {
      category: "Citizens",
      description: "Reliable water supply, faster resolution, accountability",
      icon: <Users size={24} />,
      color: "from-orange-500 to-red-500",
      items: ["Reliable water access", "Rapid issue resolution", "Complete transparency"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      <Navbar/>
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
            <Droplets className="h-6 w-6 text-blue-400" />
            <span className="text-blue-300 font-medium">About HMS</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Handpump Management System
            <span className="block text-2xl md:text-3xl text-cyan-300 font-normal mt-2">(HMS)</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Ensuring safe drinking water through digitized handpump lifecycle management - 
            transforming rural water infrastructure with complete transparency and accountability.
          </p>
        </div>
      </div>
      
      {/* Interactive Mission Statement */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-8">
              <Zap size={20} className="text-blue-600" />
              <span className="font-semibold text-blue-800">Our Mission</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Digital Transformation of
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rural Water Infrastructure
              </span>
            </h2>
          </div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-start space-x-6 mb-8">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Droplets size={40} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Revolutionizing Handpump Management
                    </h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Access to safe and reliable drinking water is the backbone of rural life. The Handpump Management System (HMS) 
                      transforms handpump maintenance from reactive breakdowns to proactive digital management.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Send size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Digital Requisition System</h4>
                      <p className="text-gray-600">Instant handpump repair requests with photographic evidence and automated workflows</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">GIS Integration & Live Tracking</h4>
                      <p className="text-gray-600">Every handpump geo-tagged with real-time status updates and satellite monitoring</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">End-to-End Transparency</h4>
                      <p className="text-gray-600">Complete digital audit trail from requisition to closure with cost transparency</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl overflow-hidden">
                  <img
                    src="/handpump_rural.png"
                    alt="Handpump Management Innovation"
                    className="w-full h-full object-cover rounded-3xl hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-xl">
                  <span className="font-bold">2,50,000+ Handpumps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Key Features with Interactive Cards */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              HMS Core
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete digital solution from problem reporting to final closure and verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 overflow-hidden"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                      <span className="text-sm font-bold text-blue-800">{feature.stats}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{feature.description}</p>
                  
                  <div className="mt-6 flex items-center gap-2 text-purple-600 font-semibold">
                    <span>Learn More</span>
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Statistics with Animation */}
      <section className="relative py-32 px-6 bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/handpump_rural.png')] bg-cover opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6">
              HMS Impact Across
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Uttar Pradesh
              </span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Comprehensive digital handpump management ensuring reliable water access
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`}></div>
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  
                  <h3 className="text-5xl font-black text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                    {stat.value}
                  </h3>
                  <p className="text-lg font-semibold text-blue-200 mb-3">{stat.label}</p>
                  <p className="text-sm text-blue-100 leading-relaxed">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced HMS Workflow Process - 6 Stages */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Complete HMS
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Process Flow
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From requisition to closure - systematic handpump management workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowStages.map((stage, index) => (
              <div 
                key={index}
                className={`relative group bg-gradient-to-br ${stage.color} text-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105`}
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-white text-gray-900 font-black rounded-full shadow-lg flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                </div>

                <div className="mt-6 mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {stage.icon}
                </div>

                <div className="text-center mb-4">
                  <span className="text-sm font-semibold text-white/80 bg-white/20 px-3 py-1 rounded-full">
                    {stage.stage}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-center mb-4">{stage.title}</h4>
                <p className="text-sm text-white/90 text-center leading-relaxed mb-6">
                  {stage.description}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {stage.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                      <span className="text-white/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Project Objectives */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              HMS Strategic
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Objectives
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Five key pillars driving handpump management transformation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {objectives.map((objective, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${objective.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${objective.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {objective.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">
                    {objective.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{objective.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HMS Benefits Section */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              HMS Key
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Benefits
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transforming handpump management for all stakeholders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.category}</h3>
                <p className="text-gray-600 mb-4 text-sm">{benefit.description}</p>
                <div className="space-y-2">
                  {benefit.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Vision & Impact Statement */}
      <section className="relative py-32 px-6 bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/2.png')] bg-cover opacity-10"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Target size={40} className="text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl font-black mb-8">
              HMS Vision for
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Rural Water Security
              </span>
            </h2>
          </div>
          
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl">
            <p className="text-xl leading-relaxed text-blue-100 mb-8 text-center">
              To create a digitally empowered rural Uttar Pradesh where every handpump operates efficiently, 
              every repair is transparent, and every citizen has uninterrupted access to clean water. HMS envisions 
              a future where technology eliminates handpump downtime, ensures complete accountability, and transforms 
              reactive maintenance into proactive digital management.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Reduced Downtime</h3>
                <p className="text-blue-100 text-sm">Faster requisition-to-repair cycle</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Droplets className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Improved Access</h3>
                <p className="text-blue-100 text-sm">Ensuring functionality of rural handpumps</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Full Transparency</h3>
                <p className="text-blue-100 text-sm">Every cost and material digitally recorded</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Smart Governance</h3>
                <p className="text-blue-100 text-sm">Data-driven decisions through analytics</p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30">
                <span className="font-bold">Zero Handpump Failures</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30">
                <span className="font-bold">100% Digital Tracking</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30">
                <span className="font-bold">Complete Accountability</span>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-4 text-white">HMS Mission Statement</h3>
              <p className="text-lg text-blue-100 leading-relaxed">
                The Handpump Management System (HMS) is more than software — it is a mission to ensure every rural household 
                has uninterrupted access to clean water through transparent, accountable, and efficient digital management. 
                <br /><br />
                <span className="font-semibold text-cyan-300">Empower your Gram Panchayat • Enable smart monitoring • Deliver safe water, on time, every time</span>
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default About;