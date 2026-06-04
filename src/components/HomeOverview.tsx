import { useState } from "react";
import { Star, MapPin, Phone, Clock, Award, ShieldCheck, Zap, ArrowRight, ExternalLink } from "lucide-react";
import { SERVICES_LIST } from "../data";
import { ServiceType } from "../types";

interface HomeOverviewProps {
  onNavigateToTab: (tab: string) => void;
  onSelectServiceToBook: (serviceName: string) => void;
  onSelectServiceToDiagnose: (serviceName: string) => void;
}

export default function HomeOverview({ 
  onNavigateToTab, 
  onSelectServiceToBook,
  onSelectServiceToDiagnose
}: HomeOverviewProps) {
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  // Quick helper to choose Lucide Icons safely
  const renderServiceIcon = (iconName: string) => {
    switch (iconName) {
      case "ShowerHead": return <MapPin className="h-6 w-6 text-sky-600" />;
      case "Flame": return <Zap className="h-6 w-6 text-amber-500" />;
      case "Droplets": return <Zap className="h-6 w-6 text-blue-500" />;
      case "Eye": return <Award className="h-6 w-6 text-emerald-600" />;
      case "Hammer": return <Award className="h-6 w-6 text-slate-600" />;
      default: return <Award className="h-6 w-6 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div id="hero-banner" className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-14 shadow-xl border border-slate-800">
        <div className="absolute inset-0 bg-radial-gradient from-sky-950/40 via-transparent to-transparent pointer-events-none" />
        
        {/* Pulsing grid accent in background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/15 border border-sky-400/30 text-sky-300 rounded-full text-xs font-medium tracking-wide">
            <ShieldCheck className="h-3.5 w-3.5" /> 
            Licensed & Fully Insured Plumbers in Deer Park, TX
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Absolute Plumbing Services
          </h1>
          
          <p className="text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed">
            Experience absolute integrity and expert workmanship. Proudly rated <strong className="text-white">4.8 stars</strong> by neighbors in Deer Park and surrounding communities. Standard maintenance to 24/7 urgent dispatch.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
              <span className="text-white font-semibold ml-2 text-md">4.8</span>
              <span className="text-slate-400 text-sm">(40 reviews)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              id="cta-schedule"
              onClick={() => onNavigateToTab("schedule")}
              className="px-6 py-3.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl font-semibold shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Book service online
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a
              id="cta-call-direct"
              href="tel:8324293801"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-white rounded-xl font-semibold border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="h-4 w-4 text-sky-400 animate-pulse" />
              Call (832) 429-3801
            </a>
          </div>
        </div>
      </div>

      {/* Grid: GMB Snapshot & Service Area map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Essential business cards */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="font-display text-2xl font-bold text-slate-800 tracking-tight">
            Convenient Storefront snapshot
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* GMB Card 1: Address & Area */}
            <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2.5 bg-sky-50 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                <MapPin className="h-5 w-5 text-sky-600" />
              </div>
              <h3 className="font-display font-bold text-slate-800 text-md">Shop Address</h3>
              <p className="text-slate-600 text-xs leading-relaxed mt-1.5">
                200 E San Augustine St # 247,<br />
                Deer Park, TX 77536
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                <span>In structure: United States Postal Service</span>
              </div>
            </div>

            {/* GMB Card 2: Operating Hours */}
            <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2.5 bg-sky-50 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                <Clock className="h-5 w-5 text-sky-600" />
              </div>
              <h3 className="font-display font-bold text-slate-800 text-md">Operating Times</h3>
              {/* Calculate standard schedule relative to 2026-06-04 which is a Thursday */}
              <p className="text-slate-600 text-xs mt-1.5">
                <span className="font-semibold text-emerald-600">Open Now</span> · 8:00 AM – 6:00 PM<br />
                <span className="text-slate-400">Emergency lines open 24/7</span>
              </p>
              <div className="mt-3 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded inline-block">
                Plus Code: MVQH+J5 Deer Park, TX
              </div>
            </div>

          </div>

          {/* Quick value props list */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display font-bold text-slate-800 text-xs">4.8 Star Work</h4>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">Elite standards verified across 40 local evaluations.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display font-bold text-slate-800 text-xs">Transparent Pricing</h4>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">Absolute quotes prior to commencement. No hidden fees.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display font-bold text-slate-800 text-xs">Rapid Dispatch</h4>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">Radio-dispatched vehicles stocked with common fittings.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Dispatch Radar and Service Area Indicator */}
        <div className="lg:col-span-5 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-slate-800 text-md">Service Area radar</h3>
              <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-[10px] uppercase tracking-wider font-extrabold rounded-full animate-pulse-slow">
                Active service zone
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-normal">
              Our central hub on San Augustine St allows us to reach Pasadena, La Porte, Baytown, and Clear Lake within 35 minutes of emergency alerts.
            </p>
          </div>

          {/* Interactive Radar Arena SVG */}
          <div className="relative w-full aspect-square max-h-[220px] my-6 flex items-center justify-center bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-800">
            {/* Pulsing Concentric Radar Rings */}
            <div className="absolute w-[90%] h-[90%] border border-sky-500/10 rounded-full animate-ping pointer-events-none" style={{ animationDuration: "5s" }} />
            <div className="absolute w-[60%] h-[60%] border border-sky-400/20 rounded-full animate-ping pointer-events-none" style={{ animationDuration: "3s" }} />
            <div className="absolute w-[30%] h-[30%] border border-sky-300/30 rounded-full pointer-events-none" />
            
            {/* Polar grid helper crosshairs */}
            <div className="absolute inset-x-0 h-[1px] bg-slate-800" />
            <div className="absolute inset-y-0 w-[1px] bg-slate-800" />

            {/* Hub Point with Glow Ring */}
            <div className="absolute z-10 flex flex-col items-center">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500 border border-white"></span>
              </span>
              <div className="mt-1 px-1.5 py-0.5 bg-slate-800/90 text-[8px] font-mono font-medium rounded text-slate-300 whitespace-nowrap border border-slate-700">
                Absolute Office Hub
              </div>
            </div>

            {/* Context markers for neighborhood areas */}
            <div className="absolute top-[20%] left-[25%] opacity-50 text-[9px] font-semibold text-slate-400">Pasadena</div>
            <div className="absolute bottom-[25%] left-[20%] opacity-50 text-[9px] font-semibold text-slate-400">Clear Lake</div>
            <div className="absolute top-[30%] right-[15%] opacity-50 text-[9px] font-semibold text-slate-400">Baytown</div>
            <div className="absolute bottom-[30%] right-[18%] opacity-50 text-[9px] font-semibold text-slate-400">La Porte</div>

            <div className="absolute bottom-2 right-2 text-[8px] font-mono text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-900/50">
              Coverage: 20-Miles
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab("dashboard")}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Track on-the-way technicians
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

      </div>

      {/* Services Showcase Cards */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-800 tracking-tight">
              Absolute service Catalog
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Experienced diagnostics and transparent ranges before any tools are drawn.
            </p>
          </div>
          <button 
            onClick={() => onNavigateToTab("estimator")}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 group cursor-pointer"
          >
            Try Custom Quotes Generator
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_LIST.map((service) => (
            <div
              key={service.id}
              className="p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-sky-50 rounded-xl group-hover:bg-sky-100 transition-colors">
                    {renderServiceIcon(service.icon)}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">Estimated Base</span>
                    <span className="text-xs font-bold font-mono text-slate-700">{service.basePriceRange}</span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-slate-800 text-sm group-hover:text-sky-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-slate-500 text-[11px] mt-2 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-50 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSelectServiceToDiagnose(service.name)}
                  className="py-1.5 bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  Diagnose Assist
                </button>
                <button
                  onClick={() => onSelectServiceToBook(service.name)}
                  className="py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  Schedule Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
