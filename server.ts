import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Helper to sanitize and pull JSON content robustly
function extractJSON(text: string): string {
  // 1. Remove markdown block formatting if present
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    text = jsonMatch[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");

  // If there's no brace or bracket, return the trimmed text
  if (firstBrace === -1 && firstBracket === -1) {
    return text.trim();
  }

  // Determine which wrapper starts first ({ or [) and slice according to its respective boundaries
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    const lastBrace = text.lastIndexOf("}");
    if (lastBrace !== -1 && lastBrace > firstBrace) {
      return text.substring(firstBrace, lastBrace + 1).trim();
    }
  } else if (firstBracket !== -1) {
    const lastBracket = text.lastIndexOf("]");
    if (lastBracket !== -1 && lastBracket > firstBracket) {
      return text.substring(firstBracket, lastBracket + 1).trim();
    }
  }

  return text.trim();
}

// Full parsing engine that gracefully fixes common LLM output malformations
function cleanAndParseJSON(text: string): any {
  const trimmed = (text || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch (_) {}

  const cleaned = extractJSON(trimmed);
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // Intentionally repair control characters, single-quotes, trailing commas before close braces
  const repaired = cleaned
    .replace(/,\s*([}\]])/g, "$1") // strip trailing commas
    .replace(/\\n/g, " ")          // clean escaped line breaks
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " "); // remove raw non-printable control chars

  try {
    return JSON.parse(repaired);
  } catch (err: any) {
    console.error("JSON parsing critical failure. Cleaned raw string was:", cleaned);
    throw new Error(`Erreur d'analyse JSON de la réponse de l'IA (${err.message}). Veuillez réessayer.`);
  }
}

// Lazy load Gemini AI to avoid app crashes at startup if env var is missing
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY has not been configured yet inside Secrets panel.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Robust fallback to gemini-3.1-flash-lite in case of temporary 503 overloaded/unavailable spikes
async function generateContentWithFallback(ai: GoogleGenAI, params: { model: string, contents: any, config?: any }) {
  try {
    return await ai.models.generateContent(params);
  } catch (err: any) {
    const errMsg = err?.message || "";
    const isOverloadedOrUnavailable = 
      errMsg.includes("503") || 
      errMsg.toLowerCase().includes("unavailable") || 
      errMsg.toLowerCase().includes("high demand") || 
      errMsg.toLowerCase().includes("temporarily overloaded") ||
      errMsg.toLowerCase().includes("service_unavailable") ||
      (err?.status === 503) ||
      (err?.code === 503);

    if (isOverloadedOrUnavailable && params.model !== "gemini-3.1-flash-lite") {
      console.warn(`[AI GRACEFUL FALLBACK] Primary model '${params.model}' is under high load or unavailable. Falling back to 'gemini-3.1-flash-lite'...`, err);
      return await ai.models.generateContent({
        ...params,
        model: "gemini-3.1-flash-lite"
      });
    }
    throw err;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // HEALTH CHECK
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!process.env.GEMINI_API_KEY
    });
  });

  // 1. AI CAREER RECOMMENDATION
  app.post("/api/careers/recommend", async (req, res) => {
    try {
      const { skills, interests, education, goals } = req.body;
      const ai = getAI();

      const prompt = `You are AfroCareer AI, an expert career counselor for African youth with deep knowledge of the digital economy in tech hubs like Nairobi, Lagos, Kigali, Johannesburg, Dakar, Accra, and Abidjan.
Assess the user's details:
- Competencies/Skills: ${skills ? skills.join(", ") : "Not specified"}
- Interests/Passions: ${interests ? interests.join(", ") : "Not specified"}
- Education Level: ${education || "Undergraduate / General"}
- Goals/Ambitions: ${goals || "To build a vibrant digital career"}

Recommend 3 suitable career paths relevant to the African tech and global remote workspace.
For each path, you must provide:
1. Job Title (title)
2. Compelling Description suited for African context (description)
3. Job demand level in Africa: High, Growing, or Medium (demand)
4. AI Relevancy score out of 100 based on their criteria (relevanceScore)
5. Local African market context & hub trends e.g. Lagos, Nairobi, Cape Town (marketContext)
6. 4 crucial skills to learn or improve for this role (keySkills)
7. Estimated local monthly entry-level salary range in USD equivalent (avgSalary)
8. 3 key next steps to break to this career (steps)

Respond with a strictly formatted JSON array matching this exact schema type:
[
  {
    "title": "string",
    "description": "string",
    "demand": "string",
    "relevanceScore": number,
    "marketContext": "string",
    "keySkills": ["string", "string", "string", "string"],
    "avgSalary": "string",
    "steps": ["string", "string", "string"]
  }
]

Do not return any conversational text, only the raw JSON.`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const data = cleanAndParseJSON(responseText);
      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to make recommendations." });
    }
  });

  // 2. AI ROADMAP GENERATOR
  app.post("/api/careers/roadmap", async (req, res) => {
    try {
      const { careerTitle, currentSkills, level } = req.body;
      const ai = getAI();

      const prompt = `You are AfroCareer AI, an architect of educational paths.
Generate a structured, actionable learning roadmap to transition from the current profile to a "${careerTitle || "Tech professional"}".
Current Profile detailed skills: ${currentSkills ? currentSkills.join(", ") : "Beginner level"}
Target Experience Target Level: ${level || "Junior"}

Provide a highly targeted 4-phase structured roadmap plan. Let's make it highly realistic, mentioning actual African and global resources like ALX Africa, Orange Digital Center, Coursera, freeCodeCamp, Microsoft Leap, MTN pulse, etc.
Provide:
1. Target Role (career)
2. Estimated general duration to achieve (estimatedTime)
3. 4 comprehensive steps or phases (phases). Each phase must include:
   - title (e.g. "Phase 1: Database & Backend Foundations")
   - duration (e.g. "6 weeks")
   - topics (array of 3 items, e.g. "NoSQL database architectures", "Python basics")
   - certifications (array of 2 recommended certs, e.g. "AWS Practitioner")
   - projects (array of 2 concrete portfolio project concepts relevant to local problems, e.g. "Agtech crop-yield dashboard")
   - africanResources (array of 2 support platforms/communities, e.g. "Semicolon Africa", "SheCodeAfrica")

Respond with a strictly formatted JSON object matching this schema type:
{
  "career": "string",
  "estimatedTime": "string",
  "phases": [
    {
      "title": "string",
      "duration": "string",
      "topics": ["string", "string", "string"],
      "certifications": ["string", "string"],
      "projects": ["string", "string"],
      "africanResources": ["string", "string"]
    }
  ]
}

Only return clean JSON.`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const data = cleanAndParseJSON(responseText);
      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to generate roadmap." });
    }
  });

  // 3. AI CV ANALYZER
  app.post("/api/cv/analyze", async (req, res) => {
    try {
      const { cvText, targetJob, experienceLevel, fileBase64, fileMimeType } = req.body;
      const ai = getAI();

      const instructionPrompt = `Analyze the provided CV (either as the text input, the uploaded file, or both) with relation to the target job: "${targetJob || "Data Analyst / Software Engineer"}" and level: "${experienceLevel || "Junior"}".

Evaluate across these metrics:
1. ATS Compliance score (atsScore) out of 100.
2. Breakdown scores (breakdown) for formatting (out of 100), keywords (out of 100), and impact/achievements (out of 100).
3. Found core skills in their text (keySkillsDetected) (array of up to 5).
4. Critical missing skills or target keywords (missingKeywords) (array of up to 4, based on the selected career).
5. Dynamic 4 constructive recommendations for improving this CV (suggestions) (array of 4 strings). E.g. "Action-oriented phrasing", "Quantifying metrics".
6. Detailed structural review in markdown format (detailedAnalysis) describing clear strategies, local optimization (such as GitHub link prominence, local high-speed broadband readiness, or remote work readiness).

Respond with a strictly formatted JSON object matching this schema type:
{
  "atsScore": number,
  "breakdown": {
    "keywords": number,
    "formatting": number,
    "impact": number
  },
  "keySkillsDetected": ["string"],
  "missingKeywords": ["string"],
  "suggestions": ["string"],
  "detailedAnalysis": "string"
}

Ensure the output is clean parseable JSON.`;

      let contents: any;
      if (fileBase64 && fileMimeType) {
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: fileMimeType,
                data: fileBase64
              }
            },
            {
              text: `Uploaded resume document to analyze along with instructions:\n\n${instructionPrompt}\n\nUser targeting details: Job: ${targetJob || ""}, experienceLevel: ${experienceLevel || ""}. Plain text representation fallback (if any):\n"""\n${cvText || ""}\n"""`
            }
          ]
        };
      } else {
        contents = `CV Content Provided:
"""
${cvText || "No CV content provided yet."}
"""

Evaluate across these metrics:
${instructionPrompt}`;
      }

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const data = cleanAndParseJSON(responseText);
      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to analyze CV." });
    }
  });

  // 4. AI INTERVIEW COACH - GENERATE QUESTIONS
  app.post("/api/interview/start", async (req, res) => {
    try {
      const { careerTrack, level, interviewType } = req.body;
      const ai = getAI();

      const prompt = `Generate exactly 5 realistic, targeted interview questions for an African youth candidate applying for:
Job Track: ${careerTrack || "Full-stack Developer"}
Experience Level: ${level || "Junior"}
Interview Type: ${interviewType || "technical"} (could be technical, behavioral, or HR)

Focus on real scenario-based challenges e.g. "How would you handle local network latency or payload sizes?", "Explain your debugging strategy on a slow mobile bandwidth.", or algorithmic/personal growth questions.
For each question, provide:
1. id (integer, 1 to 5)
2. Question Text (text)
3. Suggested brief hints for the candidate (suggestedBrief)

Respond with a strictly formatted JSON object matching this schema type:
{
  "questions": [
    {
      "id": number,
      "text": "string",
      "suggestedBrief": "string"
    }
  ]
}

Return raw JSON only.`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const data = cleanAndParseJSON(responseText);
      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to generate interview questions." });
    }
  });

  // 5. AI INTERVIEW COACH - EVALUATE ANSWER
  app.post("/api/interview/feedback", async (req, res) => {
    try {
      const { question, userAnswer, track } = req.body;
      const ai = getAI();

      const prompt = `You are AfroCareer AI Senior Interview Coach.
Assess the user's response to an interview question:
- Question: "${question}"
- Track/Role: "${track}"
- Candidate Answer: "${userAnswer || "[No answer provided or silent]"}"

Provide:
1. A feedback score out of 100 based on structure, correctness, and professional phrasing (score)
2. Comprehensive feedback highlighting what they hit or missed specifically (feedback)
3. An exemplary ideal bulletproof model answer suited for the level of the role (idealAnswer)
4. 3 direct, practical tips to polish their speech or response (tips) (array of strings)

Respond with a strictly formatted JSON object matching this schema type:
{
  "score": number,
  "feedback": "string",
  "idealAnswer": "string",
  "tips": ["string", "string", "string"]
}

Return clean JSON only.`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const data = cleanAndParseJSON(responseText);
      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to evaluate interview response." });
    }
  });

  // 6. CHAT COACH
  app.post("/api/coach/chat", async (req, res) => {
    try {
      const { messages, userProfile } = req.body;
      const ai = getAI();

      // Simple chat prompt compilation
      const formattedProfile = userProfile ? `
User profile:
- Name: ${userProfile.name || "African youth leader"}
- Current Skills: ${userProfile.skills ? userProfile.skills.join(", ") : "Growing"}
- Interests: ${userProfile.interests ? userProfile.interests.join(", ") : "Digital economy"}
- Focus/Goals: ${userProfile.goals || "Build portfolio/skills"}
` : "User is starting out.";

      const systemInstruction = `You are AfroCareer AI, an exceptionally warm, intelligent, encouraging, and clear career coach for young talents across Africa (Nigeria, South Africa, South Africa, Kenya, Rwanda, Senegal, Ivory Coast, etc.).
Your mission is to guide them, answer complex career questions, suggest relevant digital learning hubs, and highlight opportunities (like internships, hackathons, open source contributions, LinkedIn optimizations).
Be concise but highly inspirational and detailed.
${formattedProfile}`;

      // Convert messages to Gemini SDK contents format or simple structured query response
      // For simplicity and high safety in multi-message loops, we can pass recent context and construct a single prompt or use active generator:
      const recentChatContext = messages.map((m: any) => `${m.role === 'user' ? 'Candidate' : 'Coach'}: ${m.content}`).join("\n");
      const latestMessage = messages[messages.length - 1]?.content || "Hello!";

      const prompt = `${systemInstruction}\n\nRecent chat logs:\n${recentChatContext}\n\nCoach, please reply to the candidate's last query professionally, keeping the tone supportive and conversational:`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ reply: response.text || "I am processing your request. How can I push your career forward today?" });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Could not connect to coach right now." });
    }
  });

  // 7. AI COVER LETTER GENERATOR
  app.post("/api/letter/generate", async (req, res) => {
    try {
      const { userName, currentSkills, jobTitle, companyName, companyLocation, tone, keyPoints } = req.body;
      const ai = getAI();

      const prompt = `Write a compelling, professional cover letter tailored for high-potential African tech ecosystems.
Candidate Name: ${userName || "African Innovator"}
Candidate Skills: ${currentSkills ? currentSkills.join(", ") : "Tech generalist"}
Target Position: ${jobTitle || "Junior Developer"}
Company Name: ${companyName || "Top African Startup"}
Location (optional): ${companyLocation || "Remote Africa"}
Selected Tone: ${tone || "Professional"} (could be Professional, Energetic-Startup, or Bold-International)
Key selling points / aspects to highlight: ${keyPoints || "Eager learner, high problem-solving skillset, local app development experience"}

In addition to the generated cover letter content, provide 3 highly targeted tips for standing out during the application process for this specific firm structure.

Respond with a strictly formatted JSON object matching this schema type:
{
  "letterText": "string",
  "tips": ["string", "string", "string"]
}

Ensure the response contains only raw, valid JSON.`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const data = cleanAndParseJSON(responseText);
      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Could not generate cover letter." });
    }
  });

  // 8. LINKEDIN OAUTH INTEGRATION && SIMULATION
  app.get("/api/auth/linkedin/url", (req, res) => {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = `${req.protocol}://${req.get("host")}/auth/linkedin/callback`;
    
    if (!clientId) {
      // Direct demo/test mode in a nice popup
      const demoUrl = `/auth/linkedin/callback?use_mock=true`;
      return res.json({ url: demoUrl, isDemo: true });
    }

    // Real LinkedIn OAuth OIDC Authorize endpoint parameters
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid profile email",
      state: "afro_career_state_nonce"
    });
    
    res.json({
      url: `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`,
      isDemo: false
    });
  });

  app.get(["/auth/linkedin/callback", "/auth/linkedin/callback/"], async (req, res) => {
    const { code, error, use_mock } = req.query;

    if (error) {
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'LINKEDIN_AUTH_ERROR', error: "${error}" }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication failed: ${error}</p>
          </body>
        </html>
      `);
    }

    let payload: any = null;

    if (use_mock === "true" || !code) {
      // Dynamic profile simulator: generate a realistic high-quality African developer profile
      payload = {
        name: "Roland Traoré",
        firstName: "Roland",
        lastName: "Traoré",
        email: "roland.traore@afrocareer-demo.tech",
        headline: "Développeur Full-Stack | Spécialiste React & Node.js | Passionné par l'Afrique Numérique",
        skills: ["React", "JavaScript", "TypeScript", "Node.js", "Express", "Tailwind CSS", "Firebase", "Git & GitHub", "REST APIs", "Agile (Scrum)"],
        experiences: [
          {
            title: "Développeur Junior Full-Stack",
            company: "Sénégal Tech Solutions",
            duration: "2024 - Présent (Dakar)",
            description: "Conception et développement d'APIs sécurisées avec Node.js et Express. Amélioration de la réactivité du dashboard client de 35% en migrant vers React et Tailwind CSS."
          },
          {
            title: "Développeur Web Stagiaire",
            company: "Innov'Afrique Hub",
            duration: "2023 - 2024 (6 mois, Distance)",
            description: "Collaboration au sein d'une équipe agile pour le prototypage d'applications web marchandes. Écriture de tests unitaires et intégration de maquettes Figma."
          }
        ]
      };
    } else {
      try {
        const clientId = process.env.LINKEDIN_CLIENT_ID;
        const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
        const redirectUri = `${req.protocol}://${req.get("host")}/auth/linkedin/callback`;

        // Exchange code for Access Token
        const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code as string,
            redirect_uri: redirectUri,
            client_id: clientId || "",
            client_secret: clientSecret || ""
          })
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to exchange code for token.");
        }
        const tokenData: any = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Fetch User Profile from OIDC UserInfo endpoint
        const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch user profile info from LinkedIn.");
        }

        const profileData: any = await profileResponse.json();
        payload = {
          name: profileData.name || `${profileData.given_name} ${profileData.family_name}`,
          firstName: profileData.given_name,
          lastName: profileData.family_name,
          email: profileData.email,
          headline: profileData.headline || "Professionnel du numérique",
          skills: ["React.js", "JavaScript", "HTML5", "CSS3", "Git", "Node.js"],
          experiences: []
        };
      } catch (err: any) {
        console.error("LinkedIn OAuth Error:", err);
        return res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'LINKEDIN_AUTH_ERROR', error: "${err.message || 'OAuth error'}" }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
              <p>Erreur critique LinkedIn : ${err.message}</p>
            </body>
          </html>
        `);
      }
    }

    res.send(`
      <html>
        <head>
          <title>Connexion LinkedIn réussie</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f3f4f6; color: #111827; }
            .card { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            .spinner { border: 4px solid rgba(0,0,0,0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #0077b5; animation: spin 1s linear infinite; margin: 16px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>🌍 Connexion LinkedIn réussie !</h2>
            <div class="spinner"></div>
            <p>Fermeture de la fenêtre...</p>
            <p style="font-size: 11px; color: #6b7280;">Importation du profil professionnel de ${payload.name || 'LinkedIn'}</p>
          </div>
          <script>
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'LINKEDIN_AUTH_SUCCESS', 
                  payload: ${JSON.stringify(payload)} 
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            }, 1200);
          </script>
        </body>
      </html>
    `);
  });

  app.post("/api/auth/linkedin/parse-paste", async (req, res) => {
    try {
      const { pastedText } = req.body;
      if (!pastedText) {
        return res.status(400).json({ error: "Saisissez ou collez du texte du profil." });
      }
      const ai = getAI();
      const prompt = `You are an expert professional profile parser.
Analyze this raw LinkedIn profile text, copy-paste resume, or experience snippet:
"""
${pastedText}
"""

Extract and structure the professional data into:
1. Target/Current career title or professional headline (targetCareer)
2. A clean structured list of experiences (experiences), where each experience contains:
   - title (e.g. \"Développeur Web\")
   - company (e.g. \"Startup Hub\")
   - duration (e.g. \"2023 - Présent\")
   - description (e.g. \"Developped responsive web pages.\")
3. A rich array of up to 10 detected professional skills (skills).

Respond with a strictly formatted JSON object matching this schema type:
{
  "targetCareer": "string",
  "experiences": [
    {
      "title": "string",
      "company": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "skills": ["string", "string", "string"]
}

Ensure the response contains only raw, valid JSON.`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const data = cleanAndParseJSON(responseText);
      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to parse LinkedIn text" });
    }
  });

  // VITE OR STATIC MIDDLEWARE SETUP
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AfroCareer AI server running on port ${PORT}`);
  });
}

startServer();
