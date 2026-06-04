import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, ShieldAlert, Sparkles, AlertOctagon, HelpCircle, Phone, ArrowUpRight, RotateCcw } from "lucide-react";
import { TROUBLESHOOTING_TEMPLATES } from "../data";
import { ChatMessage } from "../types";

interface DiagnosticAIProps {
  initialPreloadIssue?: string;
  onNavigateToSchedule: (serviceName?: string) => void;
}

export default function DiagnosticAI({ 
  initialPreloadIssue = "", 
  onNavigateToSchedule 
}: DiagnosticAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load initial preloaded issue if pushed from front showcase page
  useEffect(() => {
    if (initialPreloadIssue) {
      handleSendIssue(`I need an estimate and troubleshooting steps for: ${initialPreloadIssue}`);
    }
  }, [initialPreloadIssue]);

  const handleSendIssue = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          currentIssue: queryText
        })
      });

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.content || "I couldn't diagnose this. Let's get a technician out to help you!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const offlineMsg: ChatMessage = {
        id: `msg-${Date.now() + 2}`,
        role: "assistant",
        content: "### 📢 Connection Blockage Detected\nI am currently operating in basic troubleshooting mode because the network or API keys are taking a brief pause. \n\n**Urgent recommendation:** If water is escaping or sewage is backed up, please shut off your main building valve immediately and call us at **(832) 429-3801** so a neighbor technician can be dispatched immediately!\n\nTo schedule a non-emergency visit, go to the **Schedule service** panel.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, offlineMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setSelectedTemplate(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Troubleshooting Templates Side Dock */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-sky-600" />
            <h3 className="font-display font-bold text-slate-850 text-md">Common Symptoms</h3>
          </div>
          <p className="text-slate-500 text-xs leading-relaxed">
            Select an active issue below to initialize prompt diagnostics with safety measures and price assessments.
          </p>

          <div className="space-y-2.5 pt-2">
            {TROUBLESHOOTING_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedTemplate(tmpl.title);
                  handleSendIssue(tmpl.issue);
                }}
                className={`w-full text-left p-3 rounded-xl border text-xs leading-snug transition-all flex items-start justify-between gap-2 cursor-pointer group ${
                  selectedTemplate === tmpl.title
                    ? "bg-sky-50 border-sky-300 text-sky-800 font-medium"
                    : "bg-slate-50/50 hover:bg-slate-50 border-slate-100 text-slate-600"
                }`}
              >
                <span>{tmpl.title}</span>
                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold ${
                  tmpl.urgency === "Emergency" 
                    ? "bg-amber-50 text-amber-700 font-bold" 
                    : "bg-slate-200/50 text-slate-500"
                }`}>
                  {tmpl.urgency}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-50">
            <div className="flex items-center gap-2 p-3 bg-amber-50/50 text-amber-805 rounded-xl border border-amber-100/50 text-[11px] leading-relaxed">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Under Pressure?</strong> Never attempt to cut or sweat a water line that carries hot, pressurized steam or active commercial loads.
              </span>
            </div>
          </div>
        </div>

        {/* 24/7 Hotline Quick Contact card */}
        <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 shadow-md">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-sky-400 font-bold">
              <AlertOctagon className="h-3 w-3" /> Urgent assistance
            </div>
            <h4 className="font-display font-bold text-base">Active Floor Flooding?</h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Skip texting and speak instantly with a Deer Park local dispatcher anytime.
            </p>
          </div>

          <a
            href="tel:8324293801"
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Phone className="h-4 w-4" />
            (832) 429-3801
          </a>
        </div>
      </div>

      {/* Primary Chat Box Console */}
      <div className="lg:col-span-8 flex flex-col h-[580px] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Chat Console Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white relative">
              <Sparkles className="h-5 w-5 text-white" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="font-display font-bold text-slate-800 text-sm">
                Absolute AI assistant
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Powered by Gemini-3.5-flash
              </div>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer text-xs font-medium flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset chat
            </button>
          )}
        </div>

        {/* Messaging Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                <MessageSquare className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-display font-bold text-slate-800 text-md">No Active Exploration</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Provide details about your problem below, or select a common symptom from the panel to receive virtual diagnosis, immediate valve locations, and service quotes.
                </p>
              </div>

              {/* Sample Quick Starters */}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <button
                  onClick={() => handleSendIssue("How do in-wall slab leaks happen and how do you locate them?")}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-medium rounded-full border border-slate-100 transition-colors cursor-pointer"
                >
                  Slab leaks location?
                </button>
                <button
                  onClick={() => handleSendIssue("My tap output is showing brown rusty water. What is the cause?")}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-medium rounded-full border border-slate-100 transition-colors cursor-pointer"
                >
                  Rusty running water?
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-br-none"
                      : "bg-slate-50 text-slate-800 border border-slate-100 rounded-bl-none"
                  }`}>
                    {/* Message content parsed with markdown rules */}
                    <div className="markdown-body">
                      {msg.role === "assistant" ? (
                        /* Parse simple pseudo-markdown formatting nicely */
                        msg.content.split("\n").map((line, idx) => {
                          const cleanLine = line.trim();
                          if (cleanLine.startsWith("###")) {
                            return <h3 key={idx}>{cleanLine.replace("###", "").trim()}</h3>;
                          }
                          if (cleanLine.startsWith("####")) {
                            return <h4 key={idx}>{cleanLine.replace("####", "").trim()}</h4>;
                          }
                          if (cleanLine.startsWith("-") || cleanLine.startsWith("*")) {
                            return <li className="ml-4 list-disc text-xs text-slate-600 my-1" key={idx}>{cleanLine.substring(1).trim()}</li>;
                          }
                          if (cleanLine.startsWith("1.") || cleanLine.startsWith("2.") || cleanLine.startsWith("3.") || cleanLine.startsWith("4.")) {
                            return <li className="ml-4 list-decimal text-xs text-slate-600 my-1" key={idx}>{cleanLine.substring(2).trim()}</li>;
                          }
                          if (cleanLine === "") return <div key={idx} className="h-2" />;
                          return <p key={idx} className="text-xs md:text-sm text-slate-700 leading-relaxed my-1">{cleanLine}</p>;
                        })
                      ) : (
                        <p className="text-xs md:text-sm font-medium">{msg.content}</p>
                      )}
                    </div>
                    <span className={`text-[9px] block mt-2 text-right ${
                      msg.role === "user" ? "text-slate-400" : "text-slate-405"
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 rounded-bl-none flex items-center gap-3">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 leading-none">
                      Analysing plumbing logic...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Submission Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendIssue(inputValue);
          }}
          className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about leak containment, noise, rusty water, running toilets..."
            className="flex-1 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            disabled={isLoading || !inputValue.trim()}
          >
            <span>Ask</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Suggest booking when done checking */}
        {messages.length > 1 && (
          <div className="px-6 py-2.5 bg-sky-50 text-sky-800 text-[11px] font-semibold border-t border-sky-100 flex items-center justify-between">
            <span>Happy with typical analysis? Secure local assistance instantly:</span>
            <button
              onClick={() => onNavigateToSchedule()}
              className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              Get Dispatch
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
