import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent startup crash if GEMINI_API_KEY is not defined
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-memory data structures to handle scheduling & quotes on the server
interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  serviceType: string;
  urgency: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  description: string;
  status: "pending" | "dispatched" | "completed";
  createdAt: string;
}

interface QuoteRequest {
  id: string;
  serviceType: string;
  urgency: "standard" | "emergency";
  severity: "low" | "medium" | "high";
  propertyType: string;
  estimatedLow: number;
  estimatedHigh: number;
  createdAt: string;
}

const bookings: Booking[] = [
  {
    id: "BK-8429",
    customerName: "Jane Doe",
    phone: "(832) 555-0192",
    email: "jane.doe@example.com",
    serviceType: "Drain Cleaning",
    urgency: "Standard",
    preferredDate: "2026-06-12",
    preferredTime: "10:00 AM",
    address: "124 Magnolia St, Deer Park, TX 77536",
    description: "Kitchen sink has been draining slowly for a couple of days.",
    status: "dispatched",
    createdAt: new Date().toISOString()
  }
];

const quotes: QuoteRequest[] = [];

// API: Booking creation
app.post("/api/bookings", (req, res) => {
  const { customerName, phone, email, serviceType, urgency, preferredDate, preferredTime, address, description } = req.body;
  
  if (!customerName || !phone || !serviceType || !preferredDate || !preferredTime || !address) {
    return res.status(400).json({ error: "Missing required booking details." });
  }

  const newBooking: Booking = {
    id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName,
    phone,
    email: email || "",
    serviceType,
    urgency: urgency || "Standard",
    preferredDate,
    preferredTime,
    address,
    description: description || "",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  res.status(201).json(newBooking);
});

// API: Retrieve all bookings
app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});

// API: Update booking status (for simulation on dashboard)
app.patch("/api/bookings/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const bookingIndex = bookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: "Booking not found" });
  }
  bookings[bookingIndex].status = status;
  res.json(bookings[bookingIndex]);
});

// API: Quotes submission
app.post("/api/quotes", (req, res) => {
  const { serviceType, urgency, severity, propertyType, estimatedLow, estimatedHigh } = req.body;
  const newQuote: QuoteRequest = {
    id: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
    serviceType,
    urgency,
    severity,
    propertyType,
    estimatedLow,
    estimatedHigh,
    createdAt: new Date().toISOString()
  };
  quotes.unshift(newQuote);
  res.status(201).json(newQuote);
});

// API: Retrieve quotes
app.get("/api/quotes", (req, res) => {
  res.json(quotes);
});

// API: Gemini Plumbing Diagnostics Assistant
app.post("/api/gemini/diagnose", async (req, res) => {
  const { messages, currentIssue } = req.body;
  
  try {
    const ai = getGeminiClient();
    
    const systemInstruction = 
      "You are the expert, friendly AI assistant for Absolute Plumbing Services, a highly trusted local plumbing business located at 200 E San Augustine St # 247, Deer Park, TX 77536 (Phone: (832) 429-3801, Rating: 4.8 stars with 40 glowing reviews). " +
      "Your goals are to: " +
      "1. Help the homeowner diagnose plumbing issues (e.g. leaky pipe, slow drain, water heater failing, low water pressure, toilet overflow). " +
      "2. Guide them step-by-step through immediate safety or containment measures (e.g., turning off structural or main water shut-off valves if there's active dripping or water rising). " +
      "3. Give a clear layout of likely causes and explain clearly, without excessive jargon, how a professional sewer or plumbing tech resolves it. " +
      "4. Provide a helpful estimate range of costs for such services in general (typical low-end to high-end costs) while highlighting that they can use our online Booking screen or call (832) 429-3801 directly to schedule a certified local Deer Park technician. " +
      "5. Always be calm, reassuring, safety-focused, and absolute professional. " +
      "Respond strictly using clean markdown formatting (bolding, lists, bullets, headers) to ensure the text is highly readable. Break down your answer into clear sections starting with 🚨 Urgent Safety Steps (if applicable), 🔍 Diagnosis, and 🛠️ Next Steps / Professional Options.";

    // Map messages payload to Gemini 3.5 API structure
    const formattedContents = (messages || []).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    // If there's an active issue selection, we append it to prompt content nicely
    if (currentIssue && formattedContents.length === 0) {
      formattedContents.push({
        role: "user",
        parts: [{ text: `I need help diagnosing this plumbing issue: ${currentIssue}. Please provide safety guidance, likely causes, and repair costs.` }]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const aiMessage = response.text || "I apologize, I'm experiencing a minor blockage in my diagnostic system. Please call Absolute Plumbing Services at (832) 429-3801 for immediate assistance!";
    res.json({ content: aiMessage });
  } catch (error: any) {
    console.error("Gemini diagnose error:", error);
    // Provide an informative, beautiful local offline diagnostic responses list to still serve the client beautifully
    res.status(200).json({ 
      content: "### 📢 Offline Assistant Mode Active\n" +
               "I'm operating in standalone diagnostic mode. Here are quick containment instructions tailored to common plumbing issues:\n\n" +
               "#### 🚨 Core Contamination & Leak containment:\n" +
               "1. **Locate the Shutoff Valve**: Look directly under the sink or behind the toilet. Turn the chrome oval handle clockwise to cut water supply locally.\n" +
               "2. **Main Water Line**: If there is broad flooring flooding, go to your main water shut-off located near the street/meter curb, or where the water main enters your home, and twist it clockwise.\n" +
               "3. **Turn Off Electrical Power**: If leak is near electrical items or water heater tank, switch off the breaker immediately.\n\n" +
               "#### 🛠️ Typical Service & Cost Estimates in Deer Park, TX:\n" +
               "- **Drain Cleaning / Clog Clear**: $150 - $350 (standard rooter service).\n" +
               "- **Water Heater Replacement / Flushing**: $1,200 - $2,800 depending on gas/electric/tankless models.\n" +
               "- **Leak Detection & Repiping**: $200 - $900 depending on wall/access requirements.\n" +
               "- **Toilet Repair**: $140 - $300.\n\n" +
               "To schedule an absolute professional, please call **(832) 429-3801** or tap over to our **Schedule service** panel!"
    });
  }
});

// Start our custom server
async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Absolute Plumbing Services backend running on http://0.0.0.0:${PORT}`);
  });
}

serveApp();
