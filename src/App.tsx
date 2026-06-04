import { useState, useEffect } from "react";
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Wrench, 
  Sparkles, 
  Calendar, 
  Trash2, 
  CheckCircle, 
  Compass, 
  FileText, 
  Plus, 
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  User,
  Activity,
  Award,
  DollarSign,
  Briefcase
} from "lucide-react";
import HomeOverview from "./components/HomeOverview";
import DiagnosticAI from "./components/DiagnosticAI";
import BookingForm from "./components/BookingForm";
import { Booking, QuoteEstimate, Review } from "./types";
import { INITIAL_REVIEWS } from "./data";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [preselectedService, setPreselectedService] = useState<string>("");
  const [preloadIssue, setPreloadIssue] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [quotes, setQuotes] = useState<QuoteEstimate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Quote Estimator local form states
  const [estService, setEstService] = useState<string>("Clogged Drain & Sewer Cleaning");
  const [estProperty, setEstProperty] = useState<"residential" | "commercial">("residential");
  const [estUrgency, setEstUrgency] = useState<"standard" | "emergency">("standard");
  const [estSeverity, setEstSeverity] = useState<"low" | "medium" | "high">("medium");
  const [estMaterial, setEstMaterial] = useState<string>("Standard Reliable");
  const [lastSavedQuote, setLastSavedQuote] = useState<QuoteEstimate | null>(null);

  // Load bookings and quotes from backend
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const currentBookingsRes = await fetch("/api/bookings");
      if (currentBookingsRes.ok) {
        const data = await currentBookingsRes.json();
        setBookings(data);
      }
      const currentQuotesRes = await fetch("/api/quotes");
      if (currentQuotesRes.ok) {
        const data = await currentQuotesRes.json();
        setQuotes(data);
      }
    } catch (err) {
      console.warn("Express backend seems offline/busy. Operating using local fallback memory.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSelectServiceToBook = (serviceName: string) => {
    setPreselectedService(serviceName);
    setActiveTab("schedule");
  };

  const handleSelectServiceToDiagnose = (serviceName: string) => {
    setPreloadIssue(serviceName);
    setActiveTab("diagnose");
  };

  const handleBookingCreated = (newBooking: Booking) => {
    // Reload bookings & navigate to dashboard to see live tracking
    fetchAllData();
    // Add local state synchronization just in case
    setBookings(prev => {
      if (prev.some(b => b.id === newBooking.id)) return prev;
      return [newBooking, ...prev];
    });
    // Jump to dashboard
    setActiveTab("dashboard");
  };

  const handleUpdateStatus = async (id: string, nextStatus: "pending" | "dispatched" | "completed") => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (response.ok) {
        fetchAllData();
      } else {
        // Local state adjustment fallback
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: nextStatus } : b));
      }
    } catch (err) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: nextStatus } : b));
    }
  };

  // Compute estimate range in frontend
  const computeEstimate = () => {
    let baseMin = 150;
    let baseMax = 350;

    switch (estService) {
      case "Clogged Drain & Sewer Cleaning":
        baseMin = 150; baseMax = 350;
        break;
      case "Water Heater Repair & Install":
        baseMin = 180; baseMax = 2200;
        break;
      case "Emergency Leak Repair":
        baseMin = 190; baseMax = 650;
        break;
      case "Toilet & Fixture Replacement":
        baseMin = 140; baseMax = 450;
        break;
      case "Sewer Pipe Repair & Video Audit":
        baseMin = 400; baseMax = 3000;
        break;
      case "Slab Leak Detection & Tuning":
        baseMin = 350; baseMax = 1500;
        break;
    }

    // Multiply or add factors
    let multiplier = 1;
    if (estProperty === "commercial") multiplier += 0.35;
    if (estUrgency === "emergency") multiplier += 0.25;

    // Severity adjustments
    let severityAdd = 0;
    if (estSeverity === "medium") severityAdd = 75;
    if (estSeverity === "high") severityAdd = 250;

    // Quality choices
    let qualityMultiplier = 1;
    if (estMaterial === "Premium Ultra-Durable") qualityMultiplier = 1.4;
    if (estMaterial === "Eco-Friendly High-Efficiency") qualityMultiplier = 1.25;

    const finalMin = Math.round((baseMin * multiplier * qualityMultiplier) + severityAdd);
    const finalMax = Math.round((baseMax * multiplier * qualityMultiplier) + (severityAdd * 1.5));

    return { low: finalMin, high: finalMax };
  };

  const { low: estLow, high: estHigh } = computeEstimate();

  const handleSaveQuote = async () => {
    const newQuoteObj = {
      serviceType: estService,
      urgency: estUrgency,
      severity: estSeverity,
      propertyType: estProperty,
      estimatedLow: estLow,
      estimatedHigh: estHigh
    };

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuoteObj)
      });
      if (response.ok) {
        const saved = await response.json();
        setLastSavedQuote(saved);
        fetchAllData();
      } else {
        // Fallback local quote
        const mockQ: QuoteEstimate = {
          id: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
          serviceType: estService,
          urgency: estUrgency,
          severity: estSeverity,
          propertyType: estProperty,
          estimatedLow: estLow,
          estimatedHigh: estHigh,
          createdAt: new Date().toISOString()
        };
        setLastSavedQuote(mockQ);
        setQuotes(prev => [mockQ, ...prev]);
      }
    } catch (err) {
      const mockQ: QuoteEstimate = {
        id: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
        serviceType: estService,
        urgency: estUrgency,
        severity: estSeverity,
        propertyType: estProperty,
        estimatedLow: estLow,
        estimatedHigh: estHigh,
        createdAt: new Date().toISOString()
      };
      setLastSavedQuote(mockQ);
      setQuotes(prev => [mockQ, ...prev]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans antialiased text-slate-800">
      
      {/* PROFESSIONAL POLISH BRAND HEADER NAV */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 md:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 mb-3 md:mb-0">
          <div className="w-9 h-9 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded flex items-center justify-center text-white font-extrabold text-lg transition-colors cursor-pointer select-none">
            A
          </div>
          <div>
            <span className="text-md font-extrabold text-slate-900 tracking-tight uppercase block">
              Absolute Plumbing Services
            </span>
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-wider text-blue-700 font-bold leading-none">
              <span>Licensed & Bonded</span>
              <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
              <span>Deer Park, TX</span>
            </div>
          </div>
        </div>

        {/* Dynamic Desktop Navigation Toggles */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
              activeTab === "home" 
                ? "bg-white text-blue-700 shadow-xs border-slate-200" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            Overview
          </button>
          
          <button
            onClick={() => {
              setPreloadIssue("");
              setActiveTab("diagnose");
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "diagnose" 
                ? "bg-white text-blue-700 shadow-xs" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <Sparkles className="h-3 w-3 text-blue-600 shrink-0" />
            AI Diagnostic Assist
          </button>

          <button
            onClick={() => {
              setPreselectedService("");
              setActiveTab("schedule");
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
              activeTab === "schedule" 
                ? "bg-white text-blue-700 shadow-xs" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            Schedule Service
          </button>

          <button
            onClick={() => setActiveTab("estimator")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
              activeTab === "estimator" 
                ? "bg-white text-blue-700 shadow-xs" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            Smart Estimator
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all relative cursor-pointer ${
              activeTab === "dashboard" 
                ? "bg-white text-blue-700 shadow-xs" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            Live Tracking
            {bookings.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {bookings.length}
              </span>
            )}
          </button>
        </div>

        {/* Action Button Segment */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="tel:8324293801"
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5 text-blue-700" />
            (832) 429-3801
          </a>
          <button
            onClick={() => {
              setPreselectedService("");
              setActiveTab("schedule");
            }}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            Schedule Service
          </button>
        </div>
      </nav>

      {/* SUBNAV / ALERTS FOR DESKTOP */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 md:px-8 py-2 text-center text-xs text-blue-900 font-bold flex flex-wrap gap-2 items-center justify-center">
        <Compass className="h-3.5 w-3.5" />
        <span>Now serving Deer Park, Pasadena, La Porte, Baytown & Clear Lake area!</span>
        <span className="hidden md:inline text-slate-300">|</span>
        <span className="font-medium text-blue-700">Need emergency drainage or repairs? Get technician priority assignment online.</span>
      </div>

      {/* MAIN CONTAINER STREAM */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        
        {/* Dynamic Screen Renders */}
        {activeTab === "home" && (
          <HomeOverview 
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onSelectServiceToBook={handleSelectServiceToBook}
            onSelectServiceToDiagnose={handleSelectServiceToDiagnose}
          />
        )}

        {activeTab === "diagnose" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">AI Diagnostic Assist</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Explain your issue with natural text and let our advanced AI formulate troubleshooting, diagnostic procedures and typical price expectations.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("home")}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Back to Overview Catalog
              </button>
            </div>
            
            <DiagnosticAI 
              initialPreloadIssue={preloadIssue} 
              onNavigateToSchedule={(service) => {
                if (service) setPreselectedService(service);
                setActiveTab("schedule");
              }}
            />
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Schedule certified plumbing care</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Experience swift, transparent scheduling. Enter your details and let custom technicians handle your residential project.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("home")}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Back to Overview
              </button>
            </div>

            <BookingForm 
              preselectedService={preselectedService}
              onBookingSuccess={handleBookingCreated}
            />
          </div>
        )}

        {activeTab === "estimator" && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Smart Interactive Estimator</h1>
              <p className="text-xs text-slate-500 mt-1">
                Calculate an absolute pricing window based on actual local material costs, urgent coefficients, and scope sizes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Side */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                <h3 className="font-display font-bold text-slate-800 text-md">Configure Service Metrics</h3>
                
                <div className="space-y-4">
                  
                  {/* Service selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-400 block">Select Service Scope</label>
                    <select
                      value={estService}
                      onChange={(e) => setEstService(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium transition-all"
                    >
                      <option value="Clogged Drain & Sewer Cleaning">Clogged Drain & Sewer Cleaning ($150 - $350)</option>
                      <option value="Water Heater Repair & Install">Water Heater Repair & Install ($180 - $2,200)</option>
                      <option value="Emergency Leak Repair">Emergency Leak Repair ($190 - $650)</option>
                      <option value="Toilet & Fixture Replacement">Toilet & Fixture Replacement ($140 - $450)</option>
                      <option value="Sewer Pipe Repair & Video Audit">Sewer Pipe Repair & Video Audit ($400 - $3,000)</option>
                      <option value="Slab Leak Detection & Tuning">Slab Leak Detection & Tuning ($350 - $1,500)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Property type toggle */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-slate-400 block">Property Category</label>
                      <div className="flex gap-2">
                        {["residential", "commercial"].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setEstProperty(t as any)}
                            className={`flex-1 py-2 rounded-lg border text-xs capitalize font-semibold transition-all cursor-pointer ${
                              estProperty === t 
                                ? "bg-blue-50 border-blue-400 text-blue-800" 
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Urgency toggle */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-slate-400 block">Urgency Status</label>
                      <div className="flex gap-2">
                        {["standard", "emergency"].map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setEstUrgency(u as any)}
                            className={`flex-1 py-2 rounded-lg border text-xs capitalize font-semibold transition-all cursor-pointer ${
                              estUrgency === u 
                                ? "bg-amber-50 border-amber-400 text-amber-800" 
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Severity Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Issue Complexity / Severity</span>
                      <span className="text-blue-700 font-semibold capitalize font-mono text-xs">{estSeverity}</span>
                    </div>
                    <div className="flex gap-2">
                      {["low", "medium", "high"].map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setEstSeverity(sev as any)}
                          className={`flex-1 py-2 text-xs font-semibold border rounded-lg capitalize transition-all cursor-pointer ${
                            estSeverity === sev
                              ? "bg-blue-50 border-blue-400 text-blue-700"
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality level selections */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-400 block">Materials & Accessories Grade</label>
                    <select
                      value={estMaterial}
                      onChange={(e) => setEstMaterial(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium transition-all"
                    >
                      <option value="Standard Reliable">Standard Reliable (Professional-grade copper, lead-free brass fittings)</option>
                      <option value="Premium Ultra-Durable">Premium Ultra-Durable (Heavy-wall copper, reinforced PEX, 5-yr guarantee additions)</option>
                      <option value="Eco-Friendly High-Efficiency">Eco-Friendly High-Efficiency (WaterSense-certified flow valves, energy-conserving thermal items)</option>
                    </select>
                  </div>

                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={handleSaveQuote}
                    className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4.5 w-4.5" />
                    Save Quote to History
                  </button>

                  <button
                    onClick={() => {
                      setPreselectedService(estService);
                      setActiveTab("schedule");
                    }}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Lock in Dispatch Slot
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Display Result Side */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Visual Estimate Card */}
                <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between h-80">
                  <div className="absolute inset-0 bg-radial-gradient from-blue-900/30 via-transparent to-transparent opacity-80 pointer-events-none" />
                  
                  <div className="relative z-10 space-y-1">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-blue-400 font-bold">Absolute pricing window</span>
                    <h3 className="font-display font-black text-xl text-slate-100 truncate">{estService}</h3>
                    <p className="text-slate-400 text-xs">Based on {estProperty} & {estUrgency} dispatch protocols.</p>
                  </div>

                  {/* Simulated Price Ring Gauge */}
                  <div className="relative z-10 py-6 text-center">
                    <span className="text-slate-400 text-xs block font-semibold mb-1">TOTAL ESTIMATED RANGE</span>
                    <div className="font-mono text-3xl md:text-4xl font-extrabold text-white flex items-center justify-center gap-2">
                      <span className="text-blue-400">${estLow}</span>
                      <span className="text-slate-500 font-sans font-light">to</span>
                      <span className="text-blue-300">${estHigh}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-2 block">Estimates include standard local service fee of $59</span>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-slate-800 text-[11px] text-slate-300 bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/40 flex items-start gap-2">
                    <Award className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>
                      Prices verified. Absolute Plumbing guarantees no auxiliary surprise additions without signature review.
                    </span>
                  </div>
                </div>

                {/* Last Saved Card Details */}
                {lastSavedQuote && (
                  <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Active Offline Quote Saved</span>
                      <span className="text-[10px] text-slate-400 font-mono">{lastSavedQuote.id}</span>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      <span className="text-slate-400 font-mono block text-[9px] uppercase">Service Type</span>
                      <p className="font-semibold text-slate-800">{lastSavedQuote.serviceType}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setPreselectedService(lastSavedQuote.serviceType);
                          setActiveTab("schedule");
                        }}
                        className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        Convert to Booking Slots
                        <ArrowRight className="h-3 w-3" />
                      </button>
                      <span className="text-xs text-slate-500 font-bold font-mono">${lastSavedQuote.estimatedLow} - ${lastSavedQuote.estimatedHigh}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Dispatch Track Control</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Trace queued and active local technician dispatch states. Use controls to simulate technician departures, status changes, and final completions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAllData}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setActiveTab("schedule")}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  New Booking
                </button>
              </div>
            </div>

            {/* Dynamic visual segment: live technician status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Side: Booking Queues */}
              <div className="lg:col-span-8 space-y-6">
                <h2 className="font-display text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-blue-600" />
                  Active Dispatch queue
                </h2>

                {bookings.length === 0 ? (
                  <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 border-dashed space-y-4">
                    <p className="text-slate-500 text-xs">No active plumbing work orders found.</p>
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Click here to Schedule Service
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((b) => (
                      <div 
                        key={b.id} 
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-md transition-all"
                      >
                        <div className="space-y-3 flex-1">
                          
                          {/* Badge header */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">{b.id}</span>
                            
                            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                              b.urgency.toLowerCase().includes("emergency")
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-blue-50 text-blue-800 border border-blue-100"
                            }`}>
                              {b.urgency}
                            </span>

                            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                              b.status === "completed" 
                                ? "bg-emerald-100 text-emerald-800"
                                : b.status === "dispatched"
                                  ? "bg-sky-100 text-sky-800 animate-pulse-slow"
                                  : "bg-slate-100 text-slate-700"
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <h3 className="font-display font-extrabold text-slate-850 text-base">{b.serviceType}</h3>
                          
                          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-medium text-slate-600">
                            <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span>{b.customerName}</span></div>
                            <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span>{b.phone}</span></div>
                            <div className="flex items-center gap-1.5 col-span-2"><MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span>{b.address}</span></div>
                            <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="font-semibold text-slate-800">{b.preferredDate}</span></div>
                            <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="font-semibold text-slate-800">{b.preferredTime}</span></div>
                          </div>

                          {b.description && (
                            <p className="text-slate-500 text-xs italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-normal">
                              "{b.description}"
                            </p>
                          )}
                        </div>

                        {/* Interactive simulation states */}
                        <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                          <button
                            onClick={() => handleUpdateStatus(b.id, "pending")}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                              b.status === "pending" 
                                ? "bg-slate-900 text-white border-slate-900" 
                                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            Mark Pending
                          </button>
                          
                          <button
                            onClick={() => handleUpdateStatus(b.id, "dispatched")}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                              b.status === "dispatched" 
                                ? "bg-sky-600 text-white border-sky-600" 
                                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            Dispatch Truck
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(b.id, "completed")}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                              b.status === "completed" 
                                ? "bg-emerald-600 text-white border-emerald-600" 
                                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            Complete Work
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Quote list & tracking progress */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Live Status Tracker widget */}
                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-display font-bold text-slate-800 text-md">On-The-Way Radar</h3>
                  
                  <div className="space-y-4">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                      <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                        <Wrench className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">Technician Crew #1</span>
                        <p className="font-bold text-xs">Dallas R. (Master Plumber)</p>
                        <p className="text-[10px] text-emerald-600 font-bold">● Active in Southern Deer Park</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                      <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                        <Wrench className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">Technician Crew #2</span>
                        <p className="font-bold text-xs">Zach S. (Sewer Lead)</p>
                        <p className="text-[10px] text-blue-600 font-bold">● En Route to Pasadena, TX</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Local Quote History */}
                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-display font-bold text-slate-800 text-md">Quote Requests History</h3>
                  {quotes.length === 0 ? (
                    <p className="text-slate-400 text-xs">No saved estimates in history yet. Calculate one on the smart estimator page.</p>
                  ) : (
                    <div className="space-y-3">
                      {quotes.map((q) => (
                        <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="font-bold text-slate-800 truncate max-w-[150px]">{q.serviceType}</p>
                            <span className="text-[9px] text-slate-400 capitalize font-mono block">Severity: {q.severity}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold block">${q.estimatedLow}-${q.estimatedHigh}</span>
                            <button
                              onClick={() => {
                                setPreselectedService(q.serviceType);
                                setActiveTab("schedule");
                              }}
                              className="text-[9px] font-extrabold text-blue-600 cursor-pointer hover:underline"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* REVIEWS SEGMENT HIGHLIGHTS */}
      <section className="bg-slate-100 py-12 px-4 md:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-950 tracking-tight">Community Verified Evaluations</h2>
              <p className="text-xs text-slate-500 mt-1">
                Real feedback and ratings collected from our storefront on San Augustine St.
              </p>
            </div>
            <div className="flex items-center gap-1 text-amber-500 font-extrabold">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-slate-900 text-lg">4.8 / 5.0 Rating</span>
              <span className="text-xs text-slate-400 font-normal">(40 Total Reviews)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {INITIAL_REVIEWS.map((rev) => (
              <div key={rev.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-slate-800 text-sm">{rev.author}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed italic">
                    "{rev.text}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                  <span>Verified Guest</span>
                  <span className="text-blue-600 font-mono">{rev.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 md:px-8 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-loose">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <span>© 2026 Absolute Plumbing</span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span>Privacy Policy</span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span>Terms of Service</span>
          </div>
          <div>
            TX Master Plumber License #42938
          </div>
        </div>
      </footer>

    </div>
  );
}
