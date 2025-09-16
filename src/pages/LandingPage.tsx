import React from 'react';
import { 
  Map, 
  Layers, 
  Building2, 
  PhoneCall,
  Send,
  Wrench,
  CheckCircle2,
  UserCheck,
  Archive,
  Droplets,
  Clock,
  Shield,
  Users,
  MapPin,
  FileText,
  Camera,
  Settings,
  BarChart3,
  Zap
} from "lucide-react";
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

// Updated stages for HMS process
const stages = [
  {
    title: "Stage 1",
    desc: "Gram Panchayat raises requisition for non-functional handpump with field evidence.",
    icon: <PhoneCall size={28} />,
    colorFrom: "from-indigo-500",
    colorTo: "to-purple-600",
  },
  {
    title: "Stage 2",
    desc: "Consulting Engineer prepares detailed technical estimation with materials and labor costs.",
    icon: <FileText size={28} />,
    colorFrom: "from-blue-500",
    colorTo: "to-cyan-500",
  },
  {
    title: "Stage 3",
    desc: "Gram Panchayat reviews estimation and sanctions the repair work.",
    icon: <CheckCircle2 size={28} />,
    colorFrom: "from-green-500",
    colorTo: "to-emerald-500",
  },
  {
    title: "Stage 4",
    desc: "Physical work completion with digital submission of bills and labor records.",
    icon: <Wrench size={28} />,
    colorFrom: "from-yellow-500",
    colorTo: "to-orange-500",
  },
  {
    title: "Stage 5",
    desc: "Engineer conducts site visit and submits Material Book and Visit Report.",
    icon: <UserCheck size={28} />,
    colorFrom: "from-pink-500",
    colorTo: "to-rose-500",
  },
  {
    title: "Stage 6",
    desc: "District level verification and final closure with quality assessment.",
    icon: <Archive size={28} />,
    colorFrom: "from-slate-500",
    colorTo: "to-gray-600",
  },
];

const dignitaries = [
  {
    name: "Honorable Chief Minister U.P.",
    designation: "Yogi Adityanath",
    image: "CM-Yogi.png",
  },
  {
    name: "Honorable Minister Panchayati Raj U.P.",
    designation: "Shri Om Prakash Rajbhar",
    image: "Minister-PRD.png",
  },
  {
    name: "Principal Secretary Panchayati Raj U.P.",
    designation: "Shri Anil Kumar (I.A.S.)",
    image: "ps.png",
  },
  {
    name: "Director Panchayati Raj U.P.",
    designation: "Shri Amit Kumar Singh (I.A.S.)",
    image: "director.png",
  },
];

const stats = [
  {
    label: "Districts Covered",
    value: "75",
    description: "Complete handpump management across all districts of Uttar Pradesh",
    icon: <Map className="h-6 w-6 text-white" />,
  },
  {
    label: "Block Panchayats",
    value: "826", 
    description: "Digital monitoring and maintenance in every block",
    icon: <Building2 className="h-6 w-6 text-white" />,
  },
  {
    label: "Gram Panchayats",
    value: "57,695",
    description: "Empowered with digital handpump requisition tools",
    icon: <Users className="h-6 w-6 text-white" />,
  },
  {
    label: "Handpumps Managed",
    value: "2,50,000+",
    description: "Digital lifecycle management of rural handpumps",
    icon: <Droplets className="h-6 w-6 text-white" />,
  },
];

const features = [
  {
    title: "Digital Requisition Management",
    description: "Seamless request raising by Gram Panchayats with instant recording and forwarding",
    icon: <Send className="h-8 w-8" />,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Automated Estimation System", 
    description: "Transparent cost breakdowns with materials, labor, GST and consulting fees",
    icon: <FileText className="h-8 w-8" />,
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "Completion Proof Upload",
    description: "Upload bills, labor details, and images for complete transparency",
    icon: <Camera className="h-8 w-8" />,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Engineer Validation Tools",
    description: "Material Book & Visit Report systems for technical quality checks",
    icon: <UserCheck className="h-8 w-8" />,
    color: "from-orange-500 to-red-500"
  },
  {
    title: "GIS Integration & Mapping",
    description: "Geo-tagged handpumps with live status updates and satellite views",
    icon: <MapPin className="h-8 w-8" />,
    color: "from-indigo-500 to-purple-500"
  },
  {
    title: "Real-time Analytics",
    description: "District-wise performance tracking with comprehensive dashboards",
    icon: <BarChart3 className="h-8 w-8" />,
    color: "from-yellow-500 to-orange-500"
  }
];

const benefits = [
  {
    category: "For Gram Panchayats",
    items: ["Easy-to-use digital interface", "Faster handpump repairs", "Reduced paperwork and bureaucracy"],
    icon: <Building2 className="h-6 w-6" />,
    color: "bg-blue-500"
  },
  {
    category: "For Engineers",
    items: ["Standardized estimation tools", "Reduced manual errors", "Structured reporting workflows"],
    icon: <Settings className="h-6 w-6" />,
    color: "bg-green-500"
  },
  {
    category: "For District Authorities", 
    items: ["Real-time monitoring dashboards", "Stage-wise progress tracking", "Performance analytics"],
    icon: <BarChart3 className="h-6 w-6" />,
    color: "bg-purple-500"
  },
  {
    category: "For Citizens",
    items: ["Reliable water supply", "Faster issue resolution", "Complete transparency & accountability"],
    icon: <Users className="h-6 w-6" />,
    color: "bg-orange-500"
  }
];

const LandingPage = () => {
  return (
    <div className="text-white bg-[#0c1f33] font-sans scroll-smooth">
      <Navbar/>
      {/* Hero Section */}
      <div className="pt-20"></div>
      <div className="relative h-screen w-full">
        <img
          src="/wallpaper.png"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        />
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 bg-blue-600/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Droplets className="h-6 w-6 text-blue-400" />
              <span className="text-blue-300 font-medium">Ensuring Safe Drinking Water</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-xl mb-6">
            Handpump Management System
            <span className="block text-3xl md:text-4xl text-blue-300 font-normal mt-2">(HMS)</span>
          </h1>
          <p className="text-xl md:text-2xl mt-4 max-w-3xl text-gray-200 drop-shadow-lg leading-relaxed">
            Digitized handpump lifecycle management ensuring reliable water access through transparent monitoring, maintenance, and accountability
          </p>
          <div className="mt-8 flex gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-sm">Real-time Monitoring</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-sm">Complete Transparency</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span className="text-sm">Faster Repairs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dignitaries */}
      <section className="py-20 text-center bg-gradient-to-br from-[#0a2540] via-[#103c63] to-[#144e77]">
        <h2 className="text-4xl font-bold mb-16 text-white tracking-wide">
          Honorable Representatives
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 px-8 md:px-20">
          {dignitaries.map((person, idx) => (
            <div
              key={idx}
              className="bg-white bg-opacity-5 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:scale-105 transition-all"
            >
              <img
                src={person.image}
                alt={person.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white mb-4 mx-auto shadow-md"
              />
              <h3 className="text-lg font-semibold text-white">{person.name}</h3>
              <p className="text-sm text-blue-200">{person.designation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What is HMS Section */}
      <section className="bg-white py-24 px-6 md:px-24 text-gray-900 scroll-mt-20" id="about-hms">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
          {/* Left Column */}
          <div className="flex flex-col leading-tight justify-center">
            <h2 className="text-4xl leading-tight font-extrabold bg-gradient-to-br from-[#b45309] to-[#92400e] bg-clip-text text-transparent tracking-tight mb-4">
              Why is Handpump Management System Essential?
            </h2>
            <h3 className="text-2xl font-semibold bg-gradient-to-br from-[#d97706] to-[#facc15] bg-clip-text text-transparent tracking-tight mb-6">
              Digital Transformation of Rural Water Infrastructure
            </h3>
            <p className="text-lg text-gray-900 leading-relaxed">
              Access to safe and reliable drinking water is the backbone of rural life. Across villages, handpumps are a lifeline — but breakdowns, delayed repairs, lack of transparency, and inefficient monitoring often disrupt supply.
              <br /><br />
              The Handpump Management System (HMS) transforms this scenario by offering a complete digital solution for handpump maintenance, monitoring, and accountability — from problem reporting to final closure and verification. This system ensures timely repair, empowers Gram Panchayats with digital tools, and provides real-time dashboards for district-level monitoring.
              <br /><br />
              HMS is more than software — it's a mission to ensure every rural household has uninterrupted access to clean water through transparent, accountable, and efficient management.
            </p>
          </div>

          {/* Right Column */}
          <div className="flex h-full">
            <div className="bg-white/10 rounded-3xl backdrop-blur-xl shadow-xl border border-gray-300/20 p-4 w-full flex items-center justify-center hover:scale-105 transition-transform duration-300">
              <img
                src="/handpump_rural.png"
                alt="Handpump Management Illustration"
                className="rounded-2xl object-cover w-full h-full max-h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative py-28 bg-[#0a0f1c] overflow-hidden text-white">
        <div className="absolute inset-0 z-0 bg-[url('/handpump_rural.png')] bg-cover opacity-50"></div>

        <h2 className="text-5xl leading-tight font-extrabold text-center mb-20 z-10 relative text-blue-200">
          <span className="inline-block bg-clip-text text-white">
            System Coverage & Impact
          </span>
        </h2>

        <div className="relative z-10 flex flex-wrap justify-center gap-10 px-6 md:px-16">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="w-64 bg-gradient-to-br from-[#b45309] to-[#92400e] text-white p-6 rounded-3xl shadow-lg hover:scale-105 transition-transform"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-white/20 p-3 rounded-full">
                  {stat.icon}
                </div>
                <div>
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                  <p className="text-sm opacity-80">{stat.label}</p>
                </div>
              </div>
              <p className="text-sm opacity-90">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* System Features */}
      <section className="bg-white py-24 px-6 md:px-24 text-gray-900">
        <h2 className="text-4xl font-extrabold text-center mb-16 tracking-tight text-gray-900">
          HMS Key Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group">
              <div className={`w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-700 text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Process Flow Section */}
      <section className="relative py-48 px-6 md:px-24 bg-[#0b1729] overflow-hidden text-white">
        <div className="absolute inset-0 z-0 bg-[url('/2.png')] bg-cover bg-center opacity-30"></div>

        <div className="relative z-10 text-center mb-20">
          <h2 className="text-5xl font-extrabold mb-6 tracking-tight text-white drop-shadow-xl">
            Complete HMS Process Flow
          </h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto font-medium">
            From requisition to closure - transparent and step-by-step handpump management process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 z-10 w-full">
          {stages.map((stage, idx) => (
            <div
              key={idx}
              className={`relative group rounded-2xl p-5 text-white transition-all duration-300 shadow-2xl hover:scale-105 bg-gradient-to-br ${stage.colorFrom} ${stage.colorTo}`}
            >
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                <div className="w-10 h-10 bg-white text-blue-900 font-bold rounded-full shadow-md flex items-center justify-center ring-2 ring-white/40">
                  {idx + 1}
                </div>
              </div>

              <div className="mb-4 mt-6 flex justify-center">{stage.icon}</div>

              <h4 className="text-lg font-bold text-center mb-2">{stage.title}</h4>

              <p className="text-sm text-white/90 text-center leading-snug">
                {stage.desc}
              </p>

              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none ring-2 ring-white/20 ring-offset-2"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-24 px-6 md:px-24 text-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-6 tracking-tight text-gray-900">
              Key Benefits of HMS
            </h2>
            <p className="text-xl text-gray-600 font-medium max-w-3xl mx-auto">
              Transforming handpump management with digital solutions that benefit every stakeholder
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6 hover:shadow-xl transition-all">
                <div className={`w-12 h-12 ${benefit.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{benefit.category}</h3>
                <ul className="space-y-2">
                  {benefit.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact & Call to Action */}
      <section className="bg-gradient-to-br from-[#0a2540] via-[#103c63] to-[#144e77] py-24 px-6 md:px-24 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-8 tracking-tight">
            Transforming Rural Water Access
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Clock className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Reduced Downtime</h3>
              <p className="text-blue-100">Faster requisition-to-repair cycle</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Droplets className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Improved Access</h3>
              <p className="text-blue-100">Ensuring functionality of rural handpumps</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Shield className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Full Transparency</h3>
              <p className="text-blue-100">Every cost and material digitally recorded</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <BarChart3 className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Smart Governance</h3>
              <p className="text-blue-100">GPS, dashboards, and analytics enable data-driven decisions</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">Mission Statement</h3>
            <p className="text-lg text-blue-100 leading-relaxed max-w-4xl mx-auto">
              The Handpump Management System (HMS) is more than software — it is a mission to ensure every rural household has uninterrupted access to clean water through transparent, accountable, and efficient digital management.
            </p>
          </div>

          <div className="space-y-4 text-lg">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
              <span>Empower your Gram Panchayat with HMS today</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
              <span>Enable districts and engineers with smart monitoring tools</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
              <span>Deliver safe water, on time, every time</span>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default LandingPage;