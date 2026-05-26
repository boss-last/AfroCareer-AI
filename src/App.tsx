/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import LandingTab from "./components/LandingTab";
import { mockJobs } from "./data/mockJobs";
import { 
  UserProfile, 
  CareerRecommendation, 
  LearningRoadmap, 
  CVAnalysis, 
  InterviewQuestion, 
  InterviewFeedback, 
  JobPost,
  AppNotification
} from "./types";
import { 
  Compass, 
  MessageSquare, 
  Map, 
  FileText, 
  Award, 
  Briefcase, 
  User, 
  Send, 
  Plus, 
  Trash, 
  Activity, 
  Search, 
  Building, 
  Check, 
  Copy, 
  ChevronRight, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  TrendingUp,
  Clock,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Upload,
  Paperclip,
  X,
  Download,
  Linkedin,
  Bell,
  BellRing
} from "lucide-react";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 0.8,
    },
  },
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("landing");
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          const data = await res.json();
          if (data.apiKeyConfigured === false) {
            setIsApiKeyMissing(true);
          }
        }
      } catch (err) {
        console.error("ApiKey check error:", err);
      }
    };
    checkApiKey();
  }, []);

  // Simple app notifications system state
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem("afrocareer_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("afrocareer_notifications", JSON.stringify(notificationsList));
  }, [notificationsList]);

  const addAppNotification = (type: "cv" | "roadmap", title: string, message: string, targetJob?: string) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9) + Date.now(),
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      isRead: false,
      targetJob
    };
    setNotificationsList(prev => [newNotif, ...prev]);
  };

  // USER PROFILE persistence state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("afrocareer_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      name: "Roland Traoré",
      email: "romansreimsroland@gmail.com",
      skills: ["React", "JavaScript", "HTML", "CSS", "Node.js"],
      interests: ["Fintech", "Intelligence Artificielle", "Développement Web"],
      targetCareer: "Data Scientist / Dev Full-Stack"
    };
  });

  // Save profile on change
  useEffect(() => {
    localStorage.setItem("afrocareer_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  // General Notification/Alert Helper
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showNotice = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // --- TAB 2: AI COACH STATE ---
  const [recommendInputs, setRecommendInputs] = useState({
    skills: userProfile.skills.join(", "),
    interests: userProfile.interests.join(", "),
    education: "Bac+3 / Licence Informatique",
    goals: "Intégrer une scaleup internationale ou fintech leader en Afrique"
  });
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loadingRecommend, setLoadingRecommend] = useState(false);

  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: `Salut ${userProfile.name} ! 👋 Je suis AfroCareer AI, ton mentor virtuel dédié aux carrières de la tech africaine. Je peux t'aider à identifier des opportunités, perfectionner tes compétences et répondre à toutes tes questions d'orientation. Qu'aimerais-tu explorer aujourd'hui ?`
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // --- TAB 3: ROADMAP GENERATOR STATE ---
  const [roadmapInputs, setRoadmapInputs] = useState({
    careerTitle: "Data Scientist",
    currentSkills: userProfile.skills.join(", "),
    level: "Junior"
  });
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState<number>(0);

  // --- TAB 4: CV ANALYZER STATE ---
  const [cvInputs, setCvInputs] = useState({
    cvText: `Roland Traoré\nDéveloppeur web débutant passionné par React, Node.js, et la création de produits digitaux performants.\n\nCOMPÉTENCES:\n- Front-end: HTML, CSS, JavaScript, React\n- Back-end: Node.js, Express\n- Outils: Git, VS Code\n\nEXPÉRIENCE:\n- Projet Personnel: AfroCareer AI - Création d'une plateforme d'apprentissage\n- Projet Étudiant: Site e-commerce local avec React\n\nFORMATION:\n- Licence en Génie Logiciel (En cours, 2024-2026)`,
    targetJob: "Dev Jr Full-Stack (React / Node)",
    experienceLevel: "Junior (0-2 ans)",
    fileBase64: "",
    fileMimeType: "",
    fileName: ""
  });
  const [cvAnalysis, setCvAnalysis] = useState<CVAnalysis | null>(null);
  const [loadingCVAnalysis, setLoadingCVAnalysis] = useState(false);

  // --- TAB 5: INTERVIEW COACH STATE ---
  const [interviewInputs, setInterviewInputs] = useState({
    careerTrack: "Dev Jr Full-Stack (React / Node)",
    level: "Junior",
    interviewType: "technical" as "technical" | "behavioral" | "hr"
  });
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [savedFeedbacks, setSavedFeedbacks] = useState<{ qText: string; score: number; comment: string; answer: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState(120); // 120 seconds (2:00 mins) per question
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- TAB 6: JOB BOARD & COVER LETTER STATE ---
  const [jobSearch, setJobSearch] = useState("");
  const [jobCountry, setJobCountry] = useState("Tous");
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  const [letterInputs, setLetterInputs] = useState({
    userName: userProfile.name,
    currentSkills: userProfile.skills.join(", "),
    jobTitle: "",
    companyName: "",
    companyLocation: "",
    tone: "Professional",
    keyPoints: "Esprit analytique, grand sens de l'autonomie, projets React / Node publiés"
  });
  const [generatedLetter, setGeneratedLetter] = useState<{ letterText: string; tips: string[] } | null>(null);
  const [loadingLetter, setLoadingLetter] = useState(false);

  // Scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Start countdown timer for interview questions
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(120);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIdx < questions.length && !feedback) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions, currentQuestionIdx, feedback]);

  // --- API HANDLERS ---

  // Helper to extract error messages from API responses
  const parseResponseError = async (res: Response, fallbackMsg: string): Promise<string> => {
    try {
      const clonedRes = res.clone();
      const data = await clonedRes.json();
      if (data && data.error) {
        return data.error;
      }
      if (data && data.message) {
        return data.message;
      }
    } catch (_) {}
    return fallbackMsg;
  };

  // 1. RECOMMEND CAREERS
  const handleRecommendCareers = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRecommend(true);
    try {
      const skillsArray = recommendInputs.skills.split(",").map(s => s.trim()).filter(Boolean);
      const interestsArray = recommendInputs.interests.split(",").map(i => i.trim()).filter(Boolean);

      const res = await fetch("/api/careers/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: skillsArray,
          interests: interestsArray,
          education: recommendInputs.education,
          goals: recommendInputs.goals
        })
      });
      if (!res.ok) {
        const errMsg = await parseResponseError(res, "Erreur de communication avec le serveur.");
        throw new Error(errMsg);
      }
      const data = await res.json();
      setRecommendations(data);
      showNotice("Recommandations générées avec succès !", "success");
    } catch (e: any) {
      showNotice(e.message || "Impossible de générer les recommandations.", "error");
    } finally {
      setLoadingRecommend(false);
    }
  };

  // 2. CHAT MENTOR
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: "user" as const, content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setLoadingChat(true);

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          userProfile
        })
      });
      if (!res.ok) {
        const errMsg = await parseResponseError(res, "Service indisponible.");
        throw new Error(errMsg);
      }
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        content: `Oups ! Je rencontre des difficultés pour me connecter à mon serveur : ${e.message || "Vérifie ta clé d'API ou réessaye dans quelques instants."}` 
      }]);
    } finally {
      setLoadingChat(false);
    }
  };

  // 3. GENERATE ROADMAP
  const handleGenerateRoadmap = async (e?: React.FormEvent, careerOverride?: string) => {
    if (e) e.preventDefault();
    setLoadingRoadmap(true);
    setSelectedPhaseIdx(0);
    try {
      const targetCareer = careerOverride || roadmapInputs.careerTitle;
      const currentSkillsArray = (careerOverride ? userProfile.skills.join(", ") : roadmapInputs.currentSkills)
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/careers/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerTitle: targetCareer,
          currentSkills: currentSkillsArray,
          level: roadmapInputs.level
        })
      });
      if (!res.ok) {
        const errMsg = await parseResponseError(res, "Erreur de connexion.");
        throw new Error(errMsg);
      }
      const data = await res.json();
      setRoadmap(data);
      showNotice("Nouvelle Roadmap générée avec succès !", "success");
      addAppNotification(
        "roadmap",
        "Roadmap de compétences prête",
        `La roadmap personnalisée pour le poste de "${targetCareer || "Professionnel d'IA"}" (${roadmapInputs.level}) est prête avec succès !`,
        targetCareer
      );
    } catch (e: any) {
      showNotice(e.message || "Impossible de générer le plan d'études.", "error");
    } finally {
      setLoadingRoadmap(false);
    }
  };

  // Export generated learning roadmap as a beautifully styled PDF
  const handleExportPDF = () => {
    if (!roadmap) return;
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Colors
      const primaryColor = [45, 106, 79]; // #2D6A4F
      const secondaryColor = [212, 91, 18]; // #D45B12
      const textGray = [80, 80, 80];
      const titleColor = [26, 26, 26];

      // Title header banner
      doc.setFillColor(45, 106, 79); // primary bg
      doc.rect(0, 0, 210, 38, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("AfroCareer AI - Roadmap d'Apprentissage", 14, 16);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text("Plan de carriere personnalise propulse par l'IA", 14, 23);
      doc.text(`Genere le : ${new Date().toLocaleDateString("fr-FR")} | AfroCareer Platform`, 14, 28);
      doc.text("Votre parcours vers l'excellence numerique en Afrique", 14, 33);

      let yPos = 48;

      // Meta Info Box
      doc.setFillColor(245, 243, 233);
      doc.rect(14, yPos, 182, 22, "F");
      doc.setDrawColor(220, 217, 206);
      doc.rect(14, yPos, 182, 22, "D");

      doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(`Objectif de Carriere : ${roadmap.career}`, 19, yPos + 7);

      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`Duree generale estimee : ${roadmap.estimatedTime}`, 19, yPos + 14);

      yPos += 32;

      // Loop through phases
      roadmap.phases.forEach((phase, index) => {
        // Safe check for page height limit
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }

        // Phase header strip
        doc.setFillColor(242, 244, 247);
        doc.rect(14, yPos, 182, 9, "F");
        doc.setDrawColor(229, 225, 218);
        doc.rect(14, yPos, 182, 9, "D");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`PHASE 0${index + 1} : ${phase.title.toUpperCase()}`, 18, yPos + 6);

        // Right-aligned phase duration
        doc.setFontSize(9);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(`Duree: ${phase.duration}`, 155, yPos + 6);

        yPos += 15;

        // Topics section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
        doc.text("Themes majeurs a approfondir :", 16, yPos);
        yPos += 5.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(textGray[0], textGray[1], textGray[2]);
        
        phase.topics.forEach((topic) => {
          doc.text(`*  ${topic}`, 20, yPos);
          yPos += 5;
        });

        yPos += 2;

        // Columns for Certifications or local resources
        const col1X = 16;
        const col2X = 105;
        let colYStart = yPos;
        let col1Y = colYStart;
        let col2Y = colYStart;

        // Certifications col
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
        doc.text("Certifications recommandees :", col1X, col1Y);
        col1Y += 5.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(textGray[0], textGray[1], textGray[2]);
        if (phase.certifications && phase.certifications.length > 0) {
          phase.certifications.forEach((cert) => {
            doc.text(`- ${cert}`, col1X + 2, col1Y);
            col1Y += 4.5;
          });
        } else {
          doc.text("- Competences generales", col1X + 2, col1Y);
          col1Y += 4.5;
        }

        // Local Platform partnership col
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
        doc.text("Ressources d'Afrique :", col2X, col2Y);
        col2Y += 5.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(textGray[0], textGray[1], textGray[2]);
        if (phase.africanResources && phase.africanResources.length > 0) {
          phase.africanResources.forEach((res) => {
            doc.text(`- ${res}`, col2X + 2, col2Y);
            col2Y += 4.5;
          });
        } else {
          doc.text("- ALX Africa, Orange Digital Center", col2X + 2, col2Y);
          col2Y += 4.5;
        }

        yPos = Math.max(col1Y, col2Y) + 4;

        // Hands-on projects
        if (phase.projects && phase.projects.length > 0) {
          if (yPos > 240) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
          doc.text("Projets reels de construction de portfolio :", 16, yPos);
          yPos += 5.5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(textGray[0], textGray[1], textGray[2]);
          phase.projects.forEach((proj) => {
            doc.text(`[Projet] : ${proj}`, 20, yPos);
            yPos += 4.5;
          });
        }

        yPos += 10;
      });

      // Bottom Signature brand note
      if (yPos > 265) {
        doc.addPage();
        yPos = 20;
      }
      doc.setDrawColor(229, 225, 218);
      doc.line(14, yPos, 196, yPos);
      yPos += 6;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("AfroCareer AI - Optimisation, Orientation et Insertion numerique locale & internationale.", 14, yPos);
      doc.text("Developpez vos competences clés, brillez lors des entretiens et décrochez votre employabilite d'avenir.", 14, yPos + 4);

      const cleanFilename = roadmap.career.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      doc.save(`roadmap_${cleanFilename}.pdf`);
      showNotice("Votre feuille de route de carriere a ete exportee avec succes !", "success");
    } catch (err: any) {
      console.error(err);
      showNotice("Erreur pendant l'exportation du document.", "error");
    }
  };

  // CV File Upload handlers
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processCVFile(file);
  };

  const processCVFile = (file: File) => {
    const reader = new FileReader();
    
    if (file.type === "application/pdf") {
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64 = result.split(",")[1];
        setCvInputs(prev => ({
          ...prev,
          fileBase64: base64,
          fileMimeType: "application/pdf",
          fileName: file.name
        }));
        showNotice(`Fichier PDF "${file.name}" chargé ! (L'IA l'analysera directement)`, "success");
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCvInputs(prev => ({
          ...prev,
          cvText: text,
          fileBase64: "", 
          fileMimeType: "",
          fileName: file.name
        }));
        showNotice(`Texte de "${file.name}" importé !`, "success");
      };
      reader.readAsText(file);
    }
  };
  
  // LinkedIn OAuth and Parser States & Handlers
  const [connectingLinkedIn, setConnectingLinkedIn] = useState(false);
  const [linkedinModalOpen, setLinkedinModalOpen] = useState(false);
  const [pastedLinkedInText, setPastedLinkedInText] = useState("");
  const [parsingLinkedInText, setParsingLinkedInText] = useState(false);

  const handleConnectLinkedIn = async () => {
    setConnectingLinkedIn(true);
    try {
      const response = await fetch('/api/auth/linkedin/url');
      if (!response.ok) throw new Error('Échec du chargement du lien de connexion.');
      const { url } = await response.json();
      
      const authWindow = window.open(
        url,
        'linkedin_oauth_popup',
        'width=600,height=700,status=no,toolbar=no,menubar=no'
      );
      if (!authWindow) {
        showNotice('Le bloqueur de fenêtres a empêché l\'ouverture de LinkedIn. Veuillez l’autoriser.', 'error');
      }
    } catch (error: any) {
      console.error(error);
      showNotice(error.message || 'Impossible de se connecter.', 'error');
    } finally {
      setConnectingLinkedIn(false);
    }
  };

  const handleParseLinkedInText = async () => {
    if (!pastedLinkedInText.trim()) {
      showNotice("Veuillez coller du texte de votre profil LinkedIn ou CV.", "error");
      return;
    }
    setParsingLinkedInText(true);
    try {
      const response = await fetch('/api/auth/linkedin/parse-paste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pastedText: pastedLinkedInText })
      });
      if (!response.ok) {
        const errMsg = await parseResponseError(response, "Échec de l'importation intelligente.");
        throw new Error(errMsg);
      }
      const parsedData = await response.json();
      
      setUserProfile(prev => ({
        ...prev,
        targetCareer: parsedData.targetCareer || prev.targetCareer,
        skills: Array.from(new Set([...prev.skills, ...(parsedData.skills || [])])),
        experiences: parsedData.experiences || prev.experiences
      }));
      setPastedLinkedInText("");
      setLinkedinModalOpen(false);
      showNotice("Votre profil LinkedIn a été importé et analysé par l'IA !", "success");
    } catch (err: any) {
      console.error(err);
      showNotice(err.message || "Erreur de décodage par l'IA.", "error");
    } finally {
      setParsingLinkedInText(false);
    }
  };

  useEffect(() => {
    const handleLinkedInMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS') {
        const payload = event.data.payload;
        if (payload) {
          setUserProfile(prev => ({
            ...prev,
            name: payload.name || prev.name,
            email: payload.email || prev.email,
            targetCareer: payload.headline || prev.targetCareer,
            skills: Array.from(new Set([...prev.skills, ...(payload.skills || [])])),
            experiences: payload.experiences || prev.experiences
          }));
          showNotice(`Profil LinkedIn de ${payload.name} synchronisé avec succès !`, "success");
        }
      } else if (event.data?.type === 'LINKEDIN_AUTH_ERROR') {
        showNotice(`Connexion LinkedIn : ${event.data.error || 'Échec de la connexion'}`, "error");
      }
    };
    window.addEventListener('message', handleLinkedInMessage);
    return () => window.removeEventListener('message', handleLinkedInMessage);
  }, []);

  // 4. ANALYZE CV
  const handleAnalyzeCV = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCVAnalysis(true);
    try {
      const res = await fetch("/api/cv/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: cvInputs.cvText,
          targetJob: cvInputs.targetJob,
          experienceLevel: cvInputs.experienceLevel,
          fileBase64: cvInputs.fileBase64,
          fileMimeType: cvInputs.fileMimeType
        })
      });
      if (!res.ok) {
        const errMsg = await parseResponseError(res, "Échec de l'analyse.");
        throw new Error(errMsg);
      }
      const data = await res.json();
      setCvAnalysis(data);
      showNotice("Analyse de CV terminée !", "success");
      addAppNotification(
        "cv",
        "Analyse de CV terminée",
        `L'analyse de votre CV pour le poste de "${cvInputs.targetJob || "Professionnel d'IA"}" est terminée avec succès !`,
        cvInputs.targetJob
      );
    } catch (e: any) {
      showNotice(e.message || "Erreur d'analyse. Assigne une clé correcte.", "error");
    } finally {
      setLoadingCVAnalysis(false);
    }
  };

  // 5. INTERVIEW COACH - START
  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingQuestions(true);
    setQuestions([]);
    setCurrentQuestionIdx(0);
    setFeedback(null);
    setUserAnswer("");
    setSavedFeedbacks([]);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerTrack: interviewInputs.careerTrack,
          level: interviewInputs.level,
          interviewType: interviewInputs.interviewType
        })
      });
      if (!res.ok) {
        const errMsg = await parseResponseError(res, "Serveur indisponible.");
        throw new Error(errMsg);
      }
      const data = await res.json();
      setQuestions(data.questions || []);
      showNotice("Questions générées ! Début de la simulation.", "success");
    } catch (e: any) {
      showNotice(e.message || "Erreur lors de la génération des questions.", "error");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // 6. INTERVIEW COACH - SUBMIT RESPONSE
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      showNotice("Saisis une réponse avant de valider !", "info");
      return;
    }
    setLoadingFeedback(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const activeQ = questions[currentQuestionIdx];
      const res = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: activeQ.text,
          userAnswer: userAnswer,
          track: interviewInputs.careerTrack
        })
      });
      if (!res.ok) {
        const errMsg = await parseResponseError(res, "Évaluation échouée.");
        throw new Error(errMsg);
      }
      const data = await res.json();
      setFeedback(data);

      setSavedFeedbacks(prev => [
        ...prev,
        {
          qText: activeQ.text,
          score: data.score,
          comment: data.feedback,
          answer: userAnswer
        }
      ]);
    } catch (e: any) {
      showNotice(e.message || "Erreur d'évaluation par l'IA.", "error");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setUserAnswer("");
    setCurrentQuestionIdx(prev => prev + 1);
  };

  // 7. GENERATE COVER LETTER
  const handleGenerateCoverLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLetter(true);
    try {
      const res = await fetch("/api/letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: letterInputs.userName,
          currentSkills: letterInputs.currentSkills.split(",").map(s => s.trim()),
          jobTitle: letterInputs.jobTitle,
          companyName: letterInputs.companyName,
          companyLocation: letterInputs.companyLocation,
          tone: letterInputs.tone,
          keyPoints: letterInputs.keyPoints
        })
      });
      if (!res.ok) {
        const errMsg = await parseResponseError(res, "Erreur serveur.");
        throw new Error(errMsg);
      }
      const data = await res.json();
      setGeneratedLetter(data);
      showNotice("Lettre de motivation générée !", "success");
    } catch (e: any) {
      showNotice(e.message || "Échec de la génération de la lettre.", "error");
    } finally {
      setLoadingLetter(false);
    }
  };

  const handleApplyShortcut = (job: JobPost) => {
    setSelectedJob(job);
    setLetterInputs(prev => ({
      ...prev,
      jobTitle: job.title,
      companyName: job.company,
      companyLocation: job.location
    }));
    showNotice(`Postuler à ${job.company} : Formulaire lettre pré-rempli !`, "info");
  };

  // --- PROFILE MANAGEMENT UTILS ---
  const [newSkillText, setNewSkillText] = useState("");
  const handleAddSkill = () => {
    const trimmed = newSkillText.trim();
    if (!trimmed) {
      showNotice("Veuillez saisir une compétence avant d'essayer de l'ajouter.", "error");
      return;
    }
    if (userProfile.skills.includes(trimmed)) {
      showNotice("Cette compétence est déjà présente dans votre profil.", "info");
      return;
    }
    setUserProfile(prev => ({
      ...prev,
      skills: [...prev.skills, trimmed]
    }));
    setNewSkillText("");
    showNotice("Compétence ajoutée avec succès !", "success");
  };

  const handleRemoveSkill = (skill: string) => {
    setUserProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
    showNotice("Skill retiré.", "info");
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    showNotice("Modifications du profil enregistrées localement !", "success");
  };

  // Calculate matching score dynamically for the user profile skills
  const getDynamicMatchScore = (jobTags: string[]) => {
    const userSkillsLower = userProfile.skills.map(s => s.toLowerCase());
    let matches = 0;
    jobTags.forEach(tag => {
      if (userSkillsLower.some(us => us.includes(tag.toLowerCase()) || tag.toLowerCase().includes(us))) {
        matches++;
      }
    });
    const pct = Math.round((matches / Math.max(1, jobTags.length)) * 100);
    // Base score + percent calculation
    return Math.min(100, Math.max(35, pct));
  };

  // Generate dynamic data for Recharts Radar Chart
  const getRadarData = () => {
    const career = (userProfile.targetCareer || "").toLowerCase();
    const skills = userProfile.skills.map(s => s.toLowerCase());

    interface SkillCategory {
      subject: string;
      userScore: number;
      requiredScore: number;
      keywords: string[];
    }

    let categories: SkillCategory[] = [];

    if (career.includes("data") || career.includes("analyst") || career.includes("science") || career.includes("bi") || career.includes("machine") || career.includes("python")) {
      categories = [
        { subject: "Python & SQL Core", userScore: 25, requiredScore: 90, keywords: ["python", "sql", "postgresql", "mysql", "databases", "database"] },
        { subject: "Data Viz (D3 / Recharts)", userScore: 20, requiredScore: 85, keywords: ["d3", "recharts", "dataviz", "powerbi", "tableau", "visualization", "bi"] },
        { subject: "Machine Learning / AI", userScore: 15, requiredScore: 80, keywords: ["machine learning", "ml", "tensorflow", "pytorch", "deep learning", "gemini", "openai"] },
        { subject: "Data Pipelines / ETL", userScore: 10, requiredScore: 75, keywords: ["etl", "spark", "hadoop", "pipelines", "pandas", "numpy", "powerquery"] },
        { subject: "Soft Skills & Business", userScore: 40, requiredScore: 85, keywords: ["agile", "scrum", "communication", "jira", "english", "french", "management"] },
        { subject: "Git & Collaboration", userScore: 30, requiredScore: 80, keywords: ["git", "github", "gitlab", "collaboration", "devops"] },
      ];
    } else if (career.includes("dev") || career.includes("software") || career.includes("front") || career.includes("back") || career.includes("full") || career.includes("web") || career.includes("tech") || career.includes("ingénieur") || career.includes("architect")) {
      categories = [
        { subject: "Frontend (React/UI)", userScore: 30, requiredScore: 90, keywords: ["react", "vue", "angular", "javascript", "typescript", "html", "css", "tailwind", "next.js", "nextjs", "vite"] },
        { subject: "Backend (Node/APIs)", userScore: 25, requiredScore: 85, keywords: ["node", "express", "backend", "api", "apis", "rest", "graphql", "python", "java", "c#", "dotnet", "php", "django"] },
        { subject: "DevOps / Nuage (Cloud)", userScore: 15, requiredScore: 80, keywords: ["docker", "kubernetes", "aws", "gcp", "azure", "cicd", "ci/cd", "cloud", "devops", "nginx"] },
        { subject: "Bases de données / SQL", userScore: 20, requiredScore: 85, keywords: ["database", "sql", "prisma", "mongodb", "postgres", "mysql", "redis", "firebase", "firestore"] },
        { subject: "Algorithmes & Git", userScore: 35, requiredScore: 85, keywords: ["git", "github", "algorithms", "data structures", "testing", "jest", "unit test"] },
        { subject: "Soft Skills & Projets", userScore: 45, requiredScore: 80, keywords: ["agile", "scrum", "kanban", "communication", "english", "french", "leadership", "jira"] },
      ];
    } else {
      categories = [
        { subject: "Compétences Tech Core", userScore: 25, requiredScore: 85, keywords: ["react", "node", "javascript", "python", "html", "css", "developer", "design", "figma"] },
        { subject: "Bases de données / Outils", userScore: 20, requiredScore: 80, keywords: ["sql", "excel", "notion", "airtable", "database", "git", "github"] },
        { subject: "Conception & Architecture", userScore: 15, requiredScore: 75, keywords: ["system design", "architecture", "figma", "wireframe", "cloud", "docker"] },
        { subject: "Coordination & Projet", userScore: 40, requiredScore: 85, keywords: ["agile", "scrum", "trello", "jira", "communication", "management", "product"] },
        { subject: "Résolution de Problèmes", userScore: 30, requiredScore: 90, keywords: ["algorithms", "logic", "debugging", "problem solving", "critical thinking"] },
        { subject: "Adaptabilité & Zoom", userScore: 35, requiredScore: 80, keywords: ["remote", "autonomy", "learning", "english", "french"] },
      ];
    }

    return categories.map(cat => {
      let matchedCount = 0;
      cat.keywords.forEach(kw => {
        if (skills.some(userSkill => userSkill.includes(kw) || kw.includes(userSkill))) {
          matchedCount++;
        }
      });
      const boostedScore = Math.min(100, cat.userScore + (matchedCount * 22));
      return {
        subject: cat.subject,
        Maitrise: boostedScore,
        Exige: cat.requiredScore,
      };
    });
  };

  // --- HELPER RENDERS ---

  return (
    <div className="min-h-screen bg-bento-bg text-bento-text selection:bg-brand-orange-500/20 selection:text-brand-orange-600">
      
      {/* HEADER SECTION */}
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} userName={userProfile.name} />

      {/* API KEY CONFIGURATION ALERT */}
      {isApiKeyMissing && (
        <div className="bg-amber-50 border-y border-amber-250/70 p-3.5 text-[#1A1A1A]">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-sans font-extrabold text-[11px] animate-pulse">!</span>
              <p className="font-semibold leading-relaxed">
                <span className="font-extrabold text-amber-800">Clé API non configurée :</span> Les fonctionnalités d'orientation (assistant coach, roadmaps de compétences, scan CV et simulateur d'entretien) nécessitent une clé API Gemini pour fonctionner.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-400/25 px-2.5 py-1 rounded text-amber-850">Configuration Requise</span>
              <span className="text-[10px] text-slate-500 font-medium font-sans">Onglet Settings &gt; Secrets d'AI Studio</span>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING SYSTEM NOTICE */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 bg-[#1A1A1A] text-white px-5 py-4 rounded-2xl shadow-xl border border-white/10 max-w-sm">
          {notification.type === "error" ? (
            <div className="h-5 w-5 rounded-full bg-red-650 flex items-center justify-center text-white text-xs">!</div>
          ) : (
            <div className="h-5 w-5 rounded-full bg-brand-green-700 flex items-center justify-center text-white text-xs">✓</div>
          )}
          <p className="text-xs font-semibold leading-normal">{notification.message}</p>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="mx-auto max-w-7xl px-4 py-8">

        {/* 1. LANDING TAB */}
        {currentTab === "landing" && (
          <LandingTab setCurrentTab={setCurrentTab} userName={userProfile.name} />
        )}

        {/* 2. CHAT & RECOMMANDATION */}
        {currentTab === "coach" && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Header section in bento style */}
            <motion.div variants={cardVariants} className="bento-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-brand-orange-550/10 text-brand-orange-500 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight">AI Coach &amp; Recommandations de Métiers</h1>
                  <p className="text-xs text-bento-muted font-medium">Découvre des carrières basées sur ton profil d'IA et dialogue en privé avec le coach d'orientation.</p>
                </div>
              </div>
            </motion.div>

            {/* TWO COLUMNS BENTO */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Input form and Career suggestions (Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Form to submit parameters */}
                <motion.div variants={cardVariants} className="bento-card p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-orange-500 leading-none block mb-1">Moteur d'IA</span>
                  <h2 className="font-display text-lg font-bold mb-4">Évaluer mes options professionnelles</h2>
                  
                  <form onSubmit={handleRecommendCareers} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Tes compétences actuelles</label>
                        <input 
                          type="text" 
                          value={recommendInputs.skills}
                          onChange={(e) => setRecommendInputs({ ...recommendInputs, skills: e.target.value })}
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-bento-border bg-bento-bg focus:ring-2 focus:ring-brand-orange-500/20 focus:outline-none"
                          placeholder="Java, Python, AutoCAD, SQL..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-705 uppercase tracking-wide mb-1">Tes passions ou centres d'intérêt</label>
                        <input 
                          type="text" 
                          value={recommendInputs.interests}
                          onChange={(e) => setRecommendInputs({ ...recommendInputs, interests: e.target.value })}
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-bento-border bg-bento-bg focus:ring-2 focus:ring-brand-orange-500/20 focus:outline-none"
                          placeholder="Fintech, Logistique, Énergie..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-707 uppercase tracking-wide mb-1">Niveau d'études ou diplôme</label>
                        <select 
                          value={recommendInputs.education}
                          onChange={(e) => setRecommendInputs({ ...recommendInputs, education: e.target.value })}
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-bento-border bg-bento-bg focus:ring-2 focus:ring-brand-orange-500/20 focus:outline-none"
                        >
                          <option>Autodidacte complet</option>
                          <option>Baccalauréat général</option>
                          <option>Bac+2 / BTS / Certifications</option>
                          <option>Bac+3 / Licence Informatique / Autre</option>
                          <option>Bac+5 / Master Professionnel</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Objectifs et Ambitions personnels</label>
                        <input 
                          type="text" 
                          value={recommendInputs.goals}
                          onChange={(e) => setRecommendInputs({ ...recommendInputs, goals: e.target.value })}
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-bento-border bg-bento-bg focus:ring-2 focus:ring-brand-orange-500/20 focus:outline-none"
                          placeholder="Devenir indépendant, décrocher un stage à l'international..."
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loadingRecommend}
                      className="w-full bg-brand-orange-500 hover:bg-brand-orange-600 disabled:bg-slate-350 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {loadingRecommend ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Calcul des Recommandations par l'IA...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Générer mes 3 Recommandations de Carrières</span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>

                {/* Recommendations displaying */}
                <div className="space-y-4">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec, i) => (
                      <motion.div key={i} variants={cardVariants} className="bento-card p-6 space-y-4 hover:border-brand-orange-500/35">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="text-[9px] font-extrabold text-brand-orange-500 uppercase tracking-widest bg-brand-orange-500/[0.05] border border-brand-orange-500/20 px-2 py-0.5 rounded-md">Option 0{i+1}</span>
                            <h3 className="font-display text-lg font-bold text-[#1A1A1A] mt-1">{rec.title}</h3>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg border border-slate-205">Score: {rec.relevanceScore}%</span>
                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                              rec.demand.toLowerCase().includes("high") || rec.demand.toLowerCase().includes("haut")
                                ? "bg-brand-green-700/10 text-brand-green-700 border-brand-green-700/30"
                                : "bg-blue-500/10 text-blue-650 border-blue-500/30"
                            }`}>{rec.demand} DEMAND</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-650 font-medium leading-relaxed">{rec.description}</p>

                        <div className="p-4 bg-[#F9F8F3] border border-[#EBE9DE] rounded-2xl text-xs space-y-2">
                          <div><span className="font-bold text-slate-800">🌍 Contexte en Afrique:</span> <span className="font-medium text-slate-600">{rec.marketContext}</span></div>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="font-bold text-slate-800">💼 Salaire local estimé:</span> 
                            <span className="font-mono bg-brand-green-700 text-white font-bold py-0.5 px-2 rounded-md text-[10.5px]">
                              {rec.avgSalary}
                            </span>
                          </div>
                        </div>

                        {/* Crucial Skills */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-505 mb-1.5">Compétences de base requises:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {rec.keySkills.map((sk, idx) => (
                              <span key={idx} className="bg-slate-100 text-[#1A1A1A] text-[10px] font-semibold tracking-wide py-1 px-2.5 rounded-lg border border-[#E5E1DA]">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Steps and Action CTA */}
                        <div className="pt-3 border-t border-[#E5E1DA]/60 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-[11px] text-slate-500 font-medium font-mono">
                            {rec.steps?.length} étapes clés configurables
                          </div>
                          <button
                            onClick={() => {
                              setRoadmapInputs({
                                careerTitle: rec.title,
                                currentSkills: userProfile.skills.join(", "),
                                level: "Junior"
                              });
                              setCurrentTab("roadmap");
                              handleGenerateRoadmap(undefined, rec.title);
                            }}
                            className="bg-brand-green-700 hover:bg-brand-green-850 text-white font-bold text-[10.5px] uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <span>Lancer la Roadmap IA</span>
                            <ChevronRight className="h-3.5 w-3.5 text-brand-green-200" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div variants={cardVariants} className="bento-card border-dashed border-[#D5D1C5] p-10 text-center space-y-3 bg-transparent">
                      <div className="h-12 w-12 rounded-full bg-brand-orange-500/5 text-brand-orange-550 flex items-center justify-center mx-auto">
                        <Activity className="h-6 w-6 stroke-[1.5]" />
                      </div>
                      <h4 className="font-display font-bold text-slate-850">Aucun profil de carrière calculé</h4>
                      <p className="text-xs text-bento-muted max-w-sm mx-auto font-medium">Configure ton profil d'IA ci-dessus puis clique sur le bouton orange pour lancer la génération de carrières sur-mesure.</p>
                    </motion.div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: AI Live Coach dialogue UI (Span 5) */}
              <motion.div variants={cardVariants} className="bento-card lg:col-span-5 flex flex-col h-[650px] overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-[#E5E1DA] px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E96B24] animate-ping"></span>
                    <div>
                      <h3 className="font-display text-sm font-bold text-[#1A1A1A]">Mentor de Carrière Virtuel</h3>
                      <p className="text-[9.5px] text-brand-green-700 font-semibold tracking-wide uppercase">Gemini Session 3.5 Active</p>
                    </div>
                  </div>
                  <HelpCircle className="h-4.5 w-4.5 text-slate-400" />
                </div>

                {/* Dialog Messages list */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#F2F4F7]">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto'}`}
                    >
                      <div className={`px-4 py-3 rounded-2xl shadow-xs text-xs font-medium leading-relaxed ${
                        msg.role === 'user'
                           ? 'bg-brand-orange-500 text-white rounded-tr-none'
                           : 'bg-white text-slate-800 border border-[#E5E1DA] rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[9.5px] text-slate-505 mt-1 font-semibold capitalize font-mono">
                        {msg.role === 'user' ? userProfile.name : "Coach AI"}
                      </span>
                    </div>
                  ))}
                  {loadingChat && (
                    <div className="flex items-center gap-2 text-xs font-bold text-[#666666] animate-pulse bg-white border border-[#E5E1DA]/70 px-4 py-3 rounded-xl rounded-tl-none w-fit">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Le mentor analyse et rédige sa réponse...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Bottom Input bar */}
                <form onSubmit={handleSendChatMessage} className="bg-white border-t border-[#E5E1DA] p-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Pose ta question (ex: opportunités au Sénégal)..."
                    className="flex-1 text-xs font-semibold px-3 py-2.5 rounded-xl border border-bento-border bg-bento-bg focus:outline-none focus:ring-1 focus:ring-brand-orange-500"
                  />
                  <button
                    type="submit"
                    disabled={loadingChat || !chatInput.trim()}
                    className="p-3 bg-[#1A1A1A] hover:bg-slate-900 disabled:bg-slate-350 text-white rounded-xl cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </motion.div>

            </div>
          </motion.div>
        )}

        {/* 3. ROADMAP GENERATOR */}
        {currentTab === "roadmap" && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 text-[#1A1A1A]"
          >
            <motion.div variants={cardVariants} className="bento-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-brand-green-700/10 text-brand-green-700 rounded-xl flex items-center justify-center">
                  <Map className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight font-sans">Générateur de Roadmaps d'Apprentissage</h1>
                  <p className="text-xs text-bento-muted font-medium">Bâtis un plan académique et pratique sur-mesure, aligné avec les meilleures ressources africaines et globales.</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* INPUT MODULE (Left 4 cells) */}
              <motion.div variants={cardVariants} className="bento-card lg:col-span-4 p-6 h-fit space-y-6">
                <h3 className="font-display text-sm font-bold border-b border-[#E5E1DA] pb-2 text-[#1A1A1A] uppercase tracking-wide">Paramétrer la Roadmap</h3>
                
                <form onSubmit={handleGenerateRoadmap} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Métier Ciblé / Objectif</label>
                    <input
                      type="text"
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-bento-border bg-bento-bg focus:ring-2 focus:ring-brand-green-700/20 focus:outline-none"
                      value={roadmapInputs.careerTitle}
                      onChange={(e) => setRoadmapInputs({ ...roadmapInputs, careerTitle: e.target.value })}
                      placeholder="e.g. Data Scientist, UX Designer..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Tes acquis ou connaissances actuelles</label>
                    <textarea
                      rows={3}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-bento-border bg-bento-bg focus:ring-2 focus:ring-brand-green-700/20 focus:outline-none"
                      value={roadmapInputs.currentSkills}
                      onChange={(e) => setRoadmapInputs({ ...roadmapInputs, currentSkills: e.target.value })}
                      placeholder="Figma basique, HTML/CSS..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-705 uppercase tracking-wide mb-1">Niveau d'expérience visé</label>
                    <select
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-bento-border bg-bento-bg focus:ring-2 focus:ring-brand-green-700/20 focus:outline-none"
                      value={roadmapInputs.level}
                      onChange={(e) => setRoadmapInputs({ ...roadmapInputs, level: e.target.value })}
                    >
                      <option value="Junior">Junior (0 à 2 ans)</option>
                      <option value="Intermédiaire">Intermédiaire (2 à 5 ans)</option>
                      <option value="Senior / Tech Lead">Senior / Manager (+5 ans)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingRoadmap}
                    className="w-full bg-brand-green-700 hover:bg-brand-green-850 disabled:bg-slate-350 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {loadingRoadmap ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Création des phases...</span>
                      </>
                    ) : (
                      <>
                        <Map className="h-4 w-4" />
                        <span>Générer ma Roadmap IA</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* ROADMAP VIEWER (Right 8 cells) */}
              <div className="lg:col-span-8">
                {roadmap ? (
                  <div className="space-y-6">
                    {/* Header summary info */}
                    <motion.div variants={cardVariants} className="bento-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-brand-orange-500 uppercase tracking-wide">Roadmap d'apprentissage</span>
                        <h2 className="font-display text-xl font-bold mt-1 text-slate-900">{roadmap.career}</h2>
                        <div className="font-semibold text-xs text-slate-500 mt-0.5">Durée générale estimée : {roadmap.estimatedTime}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <button
                          onClick={handleExportPDF}
                          className="bg-brand-orange-500 hover:bg-brand-orange-600 transition-all text-white py-1.5 px-3 rounded-xl font-display font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Exporter la feuille de route</span>
                        </button>
                        <div className="bg-brand-green-700 text-white py-1.5 px-3 rounded-xl font-display font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto">
                          <Check className="h-3.5 w-3.5" />
                          <span>Plan 4-Phases Complet</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Timeline interactive dashboard */}
                    <motion.div variants={cardVariants} className="grid grid-cols-4 gap-2">
                      {roadmap.phases.map((phase, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedPhaseIdx(idx)}
                          className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                            selectedPhaseIdx === idx
                              ? "bg-[#2D6A4F]/10 border-brand-green-700 text-[#2D6A4F] scale-[1.01]"
                              : "bg-white border-[#E5E1DA]/80 text-[#1A1A1A] hover:bg-slate-50"
                          }`}
                        >
                          <div className="text-[9px] font-extrabold uppercase tracking-wider leading-none">Phase 0{idx+1}</div>
                          <div className="text-xs font-bold leading-tight mt-1 line-clamp-1">{phase.title}</div>
                          <div className="text-[10px] opacity-80 mt-0.5 italic">{phase.duration}</div>
                        </button>
                      ))}
                    </motion.div>

                    {/* Active phase deep detailed block */}
                    {roadmap.phases[selectedPhaseIdx] && (
                      <motion.div key={selectedPhaseIdx} variants={cardVariants} className="bento-card p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E1DA] pb-4 gap-2 border-bento-border">
                          <div>
                            <span className="text-[9.5px] font-bold text-brand-green-700 uppercase tracking-widest bg-[#2D6A4F]/10 px-2 py-0.5 rounded-md leading-none">Étape active - Phase 0{selectedPhaseIdx+1}</span>
                            <h3 className="font-display text-lg font-bold text-slate-850 mt-1">{roadmap.phases[selectedPhaseIdx].title}</h3>
                          </div>
                          <span className="inline-flex items-center gap-1 bg-[#F5F3E9] text-slate-850 font-mono text-[11px] font-bold py-1 px-3 rounded-xl border border-[#DCD9CE]">
                            <Clock className="h-3 w-3 text-brand-orange-500" />
                            <span>Durée: {roadmap.phases[selectedPhaseIdx].duration}</span>
                          </span>
                        </div>

                        {/* Topics */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-extrabold text-slate-505 uppercase tracking-widest">📚 Thèmes majeurs à approfondir :</h4>
                          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {roadmap.phases[selectedPhaseIdx].topics.map((t, idx) => (
                              <li key={idx} className="bg-slate-50 border border-slate-205 py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                                <span className="h-1.5 w-1.5 bg-[#2D6A4F] rounded-full flex-none"></span>
                                <span className="text-slate-800 leading-tight">{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Resources and certs in 2 cols */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {/* Certifications columns */}
                          <div className="space-y-2.5">
                            <h4 className="text-xs font-extrabold text-slate-505 uppercase tracking-widest">🎓 Certifications recommandées :</h4>
                            <div className="space-y-2">
                              {roadmap.phases[selectedPhaseIdx].certifications.map((cert, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-brand-orange-500/[0.04] border border-brand-orange-500/15 rounded-xl text-xs font-semibold text-slate-805">
                                  <ShieldCheck className="h-4 w-4 text-brand-orange-500 flex-none" />
                                  <span>{cert}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* African hub partnerships */}
                          <div className="space-y-2.5">
                            <h4 className="text-xs font-extrabold text-slate-505 uppercase tracking-widest">🌍 Plateformes d'apprentissage d'Afrique :</h4>
                            <div className="space-y-2">
                              {roadmap.phases[selectedPhaseIdx].africanResources.map((res, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-[#2D6A4F]/[0.04] border border-[#2D6A4F]/15 rounded-xl text-xs font-semibold text-slate-805">
                                  <GraduationCap className="h-4 w-4 text-[#2D6A4F] flex-none" />
                                  <span>{res}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Practical hands-on projects */}
                        <div className="p-5 bg-gradient-to-r from-slate-50 to-[#F9FAFB] border border-[#E5E1DA] rounded-2xl space-y-3">
                          <h4 className="text-xs font-extrabold text-slate-505 uppercase tracking-widest flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5 text-brand-orange-500" />
                            <span>Projets pratiques recommandés pour ton portfolio :</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {roadmap.phases[selectedPhaseIdx].projects.map((proj, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-xl border border-[#E5E1DA] text-xs space-y-1.5 flex flex-col justify-between">
                                <span className="font-semibold text-slate-900 leading-tight block">{proj}</span>
                                <span className="text-[10px] font-bold text-brand-green-700 uppercase tracking-widest flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Projet de validation</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </motion.div>
                    )}
                  </div>
                ) : (
                  <motion.div variants={cardVariants} className="bento-card border-dashed border-[#D5D1C5] p-16 text-center space-y-4">
                    <div className="h-14 w-14 rounded-full bg-brand-green-700/5 text-brand-green-700 flex items-center justify-center mx-auto">
                      <Map className="h-7 w-7 stroke-[1.5]" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-slate-850">Aucune roadmap active</h4>
                      <p className="text-xs text-bento-muted max-w-sm mx-auto font-medium mt-1">Configure ton poste ciblé et clique sur le bouton de gauche pour générer un parcours d'IA exhaustif.</p>
                    </div>
                  </motion.div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* 4. CV ANALYSER ATS */}
        {currentTab === "cv" && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 text-[#1A1A1A]"
          >
            <motion.div variants={cardVariants} className="bento-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-brand-orange-500/10 text-brand-orange-500 rounded-xl flex items-center justify-center">
                  <FileText className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight">Analyseur de CV ATS Intelligent</h1>
                  <p className="text-xs text-bento-muted font-medium">Scanne le contenu brut de ton CV et obtiens instantanément un score de conformité, un audit des mots-clés et des conseils de réécriture pragmatiques.</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* INPUT COLUMN (Span 5) */}
              <motion.div variants={cardVariants} className="bento-card lg:col-span-5 p-6 space-y-5 h-fit">
                <h3 className="font-display text-sm font-bold border-b border-[#E5E1DA] pb-2 uppercase tracking-wide">Axe d'Optimisation</h3>
                
                <form onSubmit={handleAnalyzeCV} className="space-y-4">
                  {/* Real CV File Uploader */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                      <span>Importer un vrai CV (Optionnel)</span>
                      {cvInputs.fileName && (
                        <button
                          type="button"
                          onClick={() => setCvInputs(prev => ({ ...prev, fileBase64: "", fileMimeType: "", fileName: "" }))}
                          className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" /> Réinitialiser
                        </button>
                      )}
                    </label>

                    {cvInputs.fileName && cvInputs.fileMimeType === "application/pdf" ? (
                      <div className="border border-brand-green-700/35 bg-brand-green-700/[0.03] p-4 rounded-xl flex items-center gap-3 transition-all">
                        <div className="h-10 w-10 bg-brand-green-700/10 text-brand-green-700 rounded-lg flex items-center justify-center shrink-0">
                          <Paperclip className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold truncate text-brand-green-800">{cvInputs.fileName}</p>
                          <p className="text-[9.5px] font-semibold text-slate-500">Document PDF chargé pour l'analyse visuelle et sémantique par l'IA</p>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) processCVFile(file);
                        }}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          isDragging 
                            ? "border-brand-orange-500 bg-brand-orange-500/[0.03]" 
                            : "border-[#D5D1C5] hover:border-brand-orange-500/50 bg-bento-bg"
                        }`}
                        onClick={() => document.getElementById("cv-file-upload")?.click()}
                      >
                        <input 
                          type="file" 
                          id="cv-file-upload" 
                          className="hidden" 
                          accept=".pdf,.txt,.md"
                          onChange={handleFileChange}
                        />
                        <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                        <span className="text-[11px] text-slate-600 font-bold block">
                          Glisse ton CV ici ou <span className="text-brand-orange-500 hover:underline">clique pour explorer</span>
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                          Formats pris en charge : PDF, TXT, MD
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      {cvInputs.fileMimeType === "application/pdf" ? "Texte d'accompagnement ou notes (Optionnel)" : "Texte de ton CV (ou extrait importé)"}
                    </label>
                    <textarea
                      rows={cvInputs.fileMimeType === "application/pdf" ? 6 : 10}
                      className="w-full text-[11px] font-mono p-3 rounded-xl border border-bento-border bg-bento-bg focus:ring-1 focus:ring-brand-orange-500 focus:outline-none leading-relaxed"
                      value={cvInputs.cvText}
                      onChange={(e) => setCvInputs({ ...cvInputs, cvText: e.target.value })}
                      placeholder="Colle ton CV complet ici (coordonnées, compétences, expériences...)"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Poste visé</label>
                      <input
                        type="text"
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E5E1DA] bg-bento-bg focus:ring-1 focus:ring-brand-orange-500 focus:outline-none"
                        value={cvInputs.targetJob}
                        onChange={(e) => setCvInputs({ ...cvInputs, targetJob: e.target.value })}
                        placeholder="e.g. Flutterwave React Dev"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Niveau séniorité</label>
                      <select
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E5E1DA] bg-bento-bg focus:ring-1 focus:ring-brand-orange-500 focus:outline-none"
                        value={cvInputs.experienceLevel}
                        onChange={(e) => setCvInputs({ ...cvInputs, experienceLevel: e.target.value })}
                      >
                        <option>Junior (0-2 ans)</option>
                        <option>Intermédiaire (2-5 ans)</option>
                        <option>Sénior (+5 ans)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingCVAnalysis}
                    className="w-full bg-brand-orange-500 hover:bg-brand-orange-600 disabled:bg-slate-350 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {loadingCVAnalysis ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyse sémantique par l'IA...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        <span>Analyser mon CV maintenant</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* REPORT COLUMN (Span 7) */}
              <div className="lg:col-span-7">
                {cvAnalysis ? (
                  <div className="space-y-6">
                    
                    {/* BENTO ATS SCORE BLOCK */}
                    <motion.div variants={cardVariants} className="bento-card grid grid-cols-1 sm:grid-cols-12 gap-5 p-6">
                      
                      {/* Circular score on the left */}
                      <div className="sm:col-span-4 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-[#E5E1DA] pb-4 sm:pb-0 sm:pr-4">
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="56" cy="56" r="48" stroke="#F1EFE9" strokeWidth="8" fill="transparent" />
                            <circle 
                              cx="56" 
                              cy="56" 
                              r="48" 
                              stroke={cvAnalysis.atsScore >= 70 ? "#2D6A4F" : "#E96B24"} 
                              strokeWidth="8" 
                              fill="transparent" 
                              strokeDasharray="301.59" 
                              strokeDashoffset={301.59 - (301.59 * cvAnalysis.atsScore) / 100}
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <span className="absolute font-display text-3xl font-extrabold text-[#1A1A1A]">{cvAnalysis.atsScore}%</span>
                        </div>
                        <p className="mt-3 text-xs font-bold text-slate-800 tracking-tight text-center">Score global d'adéquation</p>
                      </div>

                      {/* Bar breakdowns on the right */}
                      <div className="sm:col-span-8 space-y-3.5 pt-2 sm:pt-0">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Détails des sous-critères</h4>
                        
                        {/* 1 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-700">Densité des mots-clés</span>
                            <span className="text-[#2D6A4F]">{cvAnalysis.breakdown.keywords}/100</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-green-700 rounded-full" style={{ width: `${cvAnalysis.breakdown.keywords}%` }}></div>
                          </div>
                        </div>

                        {/* 2 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-700">Structure / Formatage</span>
                            <span className="text-brand-orange-500">{cvAnalysis.breakdown.formatting}/100</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-orange-500 rounded-full" style={{ width: `${cvAnalysis.breakdown.formatting}%` }}></div>
                          </div>
                        </div>

                        {/* 3 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-700">Impact des achievements</span>
                            <span className="text-blue-650">{cvAnalysis.breakdown.impact}/100</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cvAnalysis.breakdown.impact}%` }}></div>
                          </div>
                        </div>
                      </div>

                    </motion.div>

                    {/* KEYWORDS BENTO BLOCK */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Detected */}
                      <motion.div variants={cardVariants} className="bento-card p-5 space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green-700">Compétences détectées :</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {cvAnalysis.keySkillsDetected.map((sk, idx) => (
                            <span key={idx} className="bg-[#2D6A4F]/[0.05] text-[#2D6A4F] text-[10.5px] font-bold px-2.5 py-1 rounded-lg border border-[#2D6A4F]/20">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </motion.div>

                      {/* Missing Keywords */}
                      <motion.div variants={cardVariants} className="bento-card p-5 space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange-500">Mots-clés manquants recommandés :</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {cvAnalysis.missingKeywords.map((sk, idx) => (
                            <span key={idx} className="bg-brand-orange-500/[0.05] text-[#E96B24] text-[10.5px] font-bold px-2.5 py-1 rounded-lg border border-brand-orange-500/20">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {/* SUGGESTIONS OF REWRITING */}
                    <motion.div variants={cardVariants} className="bento-card p-6 space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">4 Axes prioritaires d'amélioration :</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {cvAnalysis.suggestions.map((sug, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-[#F9F8F3] border border-[#E5E1DA] p-3.5 rounded-2xl text-xs">
                            <span className="h-5 w-5 rounded-full bg-brand-orange-500 text-white font-mono font-bold text-[11px] flex items-center justify-center flex-none">
                              {idx+1}
                            </span>
                            <span className="font-semibold text-slate-800 leading-normal">{sug}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* DETAILED ANALYSIS */}
                    <motion.div variants={cardVariants} className="bento-card !bg-[#1A1A1A] text-white !border-slate-800 p-6 space-y-3">
                      <h4 className="font-display font-bold text-slate-200">Rapport de Synthèse de l'IA Coach</h4>
                      <div className="text-slate-350 text-xs font-semibold leading-relaxed whitespace-pre-line">
                        {cvAnalysis.detailedAnalysis}
                      </div>
                    </motion.div>

                  </div>
                ) : (
                  <motion.div variants={cardVariants} className="bento-card border-dashed border-[#D5D1C5] p-20 text-center space-y-4">
                    <div className="h-14 w-14 rounded-full bg-brand-orange-500/5 text-brand-orange-550 flex items-center justify-center mx-auto">
                      <FileText className="h-7 w-7 stroke-[1.5]" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-[#1A1A1A]">Aucune analyse n'est affichée</h4>
                      <p className="text-xs text-bento-muted max-w-sm mx-auto font-medium mt-1">Colle le contenu textuel de ton CV à gauche, puis lance l'analyse pour afficher tes forces, faiblesses, et sous-scores ATS.</p>
                    </div>
                  </motion.div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* 5. INTERVIEW CHALLENGES */}
        {currentTab === "interview" && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 text-[#1A1A1A]"
          >
            <motion.div variants={cardVariants} className="bento-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-brand-green-700/10 text-brand-green-700 rounded-xl flex items-center justify-center">
                  <Award className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight">Défis d'Entretien Simulé &amp; Coach IA</h1>
                  <p className="text-xs text-bento-muted font-medium">Bénéficie d'une session immersive d'entraînement chronométrée. L'IA génère des questions comportementales et techniques pointues puis t'attribue des retours détaillés.</p>
                </div>
              </div>
            </motion.div>

            {/* SELECTION OR SIMULATION BOX */}
            {questions.length === 0 ? (
              <motion.div variants={cardVariants} className="bento-card p-8 max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold text-brand-orange-500 uppercase tracking-widest">Configure ta Simulation</span>
                  <h2 className="font-display text-xl font-bold">Lancer une session d'entraînement</h2>
                  <p className="text-xs text-slate-500 font-medium">Les questions de l'IA intègrent les spécificités des entreprises africaines et de la tech internationale.</p>
                </div>

                <form onSubmit={handleStartInterview} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Métier ou Pôle ciblé</label>
                      <input
                        type="text"
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E5E1DA] bg-bento-bg focus:ring-1 focus:ring-brand-green-700 focus:outline-none"
                        value={interviewInputs.careerTrack}
                        onChange={(e) => setInterviewInputs({ ...interviewInputs, careerTrack: e.target.value })}
                        placeholder="React / Node Jr developer"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Séniorité ciblée</label>
                      <select
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E5E1DA] bg-bento-bg focus:ring-1 focus:ring-brand-green-700 focus:outline-none"
                        value={interviewInputs.level}
                        onChange={(e) => setInterviewInputs({ ...interviewInputs, level: e.target.value })}
                      >
                        <option>Junior (0-2 ans)</option>
                        <option>Intermédiaire (2-5 ans)</option>
                        <option>Sénior (+5 ans)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Type d'entretien</label>
                      <select
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E5E1DA] bg-bento-bg focus:ring-1 focus:ring-brand-green-700 focus:outline-none"
                        value={interviewInputs.interviewType}
                        onChange={(e) => setInterviewInputs({ ...interviewInputs, interviewType: e.target.value as any })}
                      >
                        <option value="technical">Technique / Algorithmique</option>
                        <option value="behavioral">Comportemental / Situationnel</option>
                        <option value="hr">Ressources Humaines / Fit Culturel</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingQuestions}
                    className="w-full bg-brand-green-700 hover:bg-brand-green-850 disabled:bg-slate-350 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {loadingQuestions ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Création des questions scénarisées par l'IA...</span>
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4" />
                        <span>Démarrer l'Entretien IA</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              /* INTERVIEW ACTIVE SCREEN */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* INTERACTIVE QUESTION BOARD (Span 8) */}
                <div className="lg:col-span-8 space-y-6">
                  {currentQuestionIdx < questions.length ? (
                    <motion.div key={currentQuestionIdx} variants={cardVariants} className="bento-card p-6 space-y-6">
                      
                      {/* Stats and Countdown Timer */}
                      <div className="flex justify-between items-center border-b border-[#E5E1DA] pb-4 flex-wrap gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-brand-orange-500 uppercase tracking-widest leading-none">Question active</span>
                          <h3 className="font-display font-bold text-lg text-slate-900 mt-1">Challenge 0{currentQuestionIdx+1} sur 0{questions.length}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Timer status */}
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                            timeLeft < 30 
                              ? "bg-red-50 text-red-700 border-red-200 animate-pulse" 
                              : "bg-[#F5F3E9] text-slate-800 border-[#E5E1DA]"
                          }`}>
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Display Question */}
                      <div className="p-5 bg-slate-50 border border-[#E5E1DA]/60 rounded-2xl">
                        <p className="font-display font-extrabold text-[14.5px] text-[#1A1A1A] leading-relaxed">
                          {questions[currentQuestionIdx].text}
                        </p>
                        <span className="text-[10px] font-bold text-slate-505 uppercase tracking-widest mt-3 block">Indice Coach: {questions[currentQuestionIdx].suggestedBrief}</span>
                      </div>

                      {/* Saisie Réponse Candidate */}
                      {!feedback && (
                        <div className="space-y-3">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">Rédige ta réponse de manière détaillée :</label>
                          <textarea
                            rows={6}
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Écris ton raisonnement, tes architectures, tes lignes directrices ici..."
                            className="w-full text-xs font-semibold p-3.5 rounded-xl border border-[#E5E1DA] bg-bento-bg focus:ring-1 focus:ring-brand-green-700 focus:outline-none leading-relaxed"
                          />
                          
                          <div className="flex items-center justify-between gap-3 pt-2">
                            <span className="text-[10px] font-semibold text-slate-505 italic">
                              Reste professionnel. N'hésite pas à mentionner ton expérience.
                            </span>
                            <button
                              onClick={handleSubmitAnswer}
                              disabled={loadingFeedback || !userAnswer.trim()}
                              className="bg-brand-green-700 hover:bg-brand-green-850 disabled:bg-slate-350 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                            >
                              {loadingFeedback ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Correction IA...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span>Soumettre ma réponse pour évaluation</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Instant evaluation screen */}
                      {feedback && (
                        <div className="space-y-6 pt-2 animate-fade-in">
                          
                          {/* Score and comment */}
                          <div className="flex items-center gap-4 bg-brand-green-700/5 border border-brand-green-700/20 p-5 rounded-2xl">
                            <div className="h-14 w-14 rounded-2xl bg-brand-green-700 text-white font-display font-extrabold text-lg flex items-center justify-center flex-none">
                              {feedback.score}/100
                            </div>
                            <div>
                              <h4 className="font-display font-bold text-[#1A1A1A]">Rapport d'évaluation de la réponse</h4>
                              <p className="text-xs text-slate-655 leading-relaxed font-semibold mt-1">{feedback.feedback}</p>
                            </div>
                          </div>

                          {/* Ideal exemplar reply */}
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-bold text-slate-505 uppercase tracking-widest">Exemple de réponse idéale proposée par l'IA :</h5>
                            <div className="p-4 bg-slate-50 border border-slate-205 rounded-xl text-xs font-semibold text-slate-755 leading-relaxed whitespace-pre-line">
                              {feedback.idealAnswer}
                            </div>
                          </div>

                          {/* Tips to progress */}
                          <div className="space-y-2.5">
                            <h5 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest">3 recommandations pour peaufiner ton discours :</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {feedback.tips.map((tp, idx) => (
                                <div key={idx} className="bg-white border border-[#E5E1DA] p-3 rounded-xl text-xs font-semibold text-slate-805 flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-brand-orange-500 mt-1.5 flex-none"></span>
                                  <span>{tp}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* CTA to next or complete */}
                          <div className="pt-4 border-t border-[#E5E1DA] flex justify-end">
                            <button
                              onClick={handleNextQuestion}
                              className="bg-[#1A1A1A] hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl flex items-center gap-1 cursor-pointer"
                            >
                              <span>
                                {currentQuestionIdx === questions.length - 1 ? "Voir le bilan de ma session" : "Continuer vers la question suivante"}
                              </span>
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>

                        </div>
                      )}

                    </motion.div>
                  ) : (
                    /* SIMULATION END SCREEN */
                    <motion.div variants={cardVariants} className="bento-card p-8 text-center space-y-6">
                      <div className="h-14 w-14 rounded-full bg-brand-green-700/10 text-brand-green-700 flex items-center justify-center mx-auto">
                        <Check className="h-7 w-7 stroke-[2.5]" />
                      </div>
                      
                      <div>
                        <h2 className="font-display font-extrabold text-2xl text-slate-850">Entretien Simulé Terminé ! 🎉</h2>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto font-semibold mt-1">Félicitations pour avoir complété les 5 défis. Ton profil gagne en solidité.</p>
                      </div>

                      {/* Display final scoring statistics summary */}
                      <div className="max-w-md mx-auto grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-slate-50 border border-slate-205 p-4 rounded-2xl">
                          <span className="text-[9px] font-bold text-slate-505 uppercase tracking-wider block">Score Moyen</span>
                          <span className="text-2xl font-extrabold text-brand-green-700 block mt-1">
                            {Math.round(savedFeedbacks.reduce((acc, f) => acc + f.score, 0) / Math.max(1, savedFeedbacks.length))}/100
                          </span>
                        </div>
                        <div className="bg-slate-50 border border-slate-205 p-4 rounded-2xl">
                          <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider block">Questions validées</span>
                          <span className="text-2xl font-extrabold text-[#1A1A1A] block mt-1">{savedFeedbacks.length} / 5</span>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-center gap-3">
                        <button
                          onClick={() => setQuestions([])}
                          className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-[#E5E1DA] font-bold text-xs uppercase tracking-wider text-slate-805 cursor-pointer"
                        >
                          Nouvelle session
                        </button>
                        <button
                          onClick={() => setCurrentTab("profile")}
                          className="px-5 py-3 rounded-xl bg-[#1A1A1A] hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                        >
                          Consulter mes statistiques globales
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* SIDE HISTORY LOGS & PROGRESS (Span 4) */}
                <motion.div variants={cardVariants} className="bento-card lg:col-span-4 p-6 h-fit space-y-5">
                  <h3 className="font-display text-xs font-bold border-b border-[#E5E1DA] pb-2 text-slate-850 uppercase tracking-wide">Journal des Défis Actifs</h3>
                  
                  <div className="space-y-3">
                    {questions.map((q, idx) => {
                      const completedLog = savedFeedbacks[idx];
                      return (
                        <div key={q.id} className="flex items-center gap-3 text-xs">
                          <div className={`h-6.5 w-6.5 rounded-lg flex items-center justify-center text-xs font-bold flex-none ${
                            completedLog 
                              ? "bg-brand-green-700 text-white" 
                              : idx === currentQuestionIdx && !feedback
                                ? "bg-brand-orange-500 text-white animate-pulse" 
                                : "bg-slate-100 text-slate-400 border border-[#E5E1DA]/80"
                          }`}>
                            {q.id}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-[#1A1A1A] block truncate pr-1">Q{q.id} : {q.text}</span>
                            <span className="text-[10px] text-slate-550 leading-none">
                              {completedLog 
                                ? `Validé avec ${completedLog.score}/100` 
                                : idx === currentQuestionIdx && !feedback
                                  ? "À résoudre..."
                                  : "En attente"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (confirm("Réinitialiser l'entretien en cours ?")) {
                          setQuestions([]);
                        }
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-[#1A1A1A] underline transition-colors"
                    >
                      Annuler la session en cours
                    </button>
                  </div>
                </motion.div>

              </div>
            )}
          </motion.div>
        )}

        {/* 6. JOBS BOARD & COVER LETTERS */}
        {currentTab === "jobs" && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 text-[#1A1A1A]"
          >
            <motion.div variants={cardVariants} className="bento-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-brand-orange-500/10 text-brand-orange-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight">Espace Recrutement &amp; Modérateur de Lettres</h1>
                  <p className="text-xs text-bento-muted font-medium">Navigue à travers de vrais postes d'influence du marché africain, mesure ta compatibilité de compétences et génère des lettres de motivation d'impact instantanément.</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* JOBS BOARD (Span 7) */}
              <motion.div variants={cardVariants} className="lg:col-span-7 space-y-5">
                
                {/* Search and Filters */}
                <div className="bento-card !rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-1/2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E1DA] bg-bento-bg focus:ring-1 focus:ring-brand-orange-500 focus:outline-none"
                      placeholder="Filtrer par compétence (ex: React, Python)..."
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-600 flex-none uppercase">Location:</span>
                    <select
                      className="w-full sm:w-auto text-xs font-semibold px-2.5 py-2 rounded-xl border border-[#E5E1DA] bg-bento-bg focus:outline-none"
                      value={jobCountry}
                      onChange={(e) => setJobCountry(e.target.value)}
                    >
                      <option value="Tous">Toutes les opportunités</option>
                      <option value="Nigeria">Nigeria / Lagos</option>
                      <option value="Kenya">Kenya / Nairobi</option>
                      <option value="Senegal">Sénégal / Dakar</option>
                      <option value="Rwanda">Rwanda / Kigali</option>
                      <option value="South Africa">South Africa / Remote</option>
                    </select>
                  </div>
                </div>

                {/* Job lists */}
                <div className="space-y-4">
                  {mockJobs
                    .filter(job => {
                      const matchQuery = jobSearch.trim() === "" || 
                        job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
                        job.tags.some(t => t.toLowerCase().includes(jobSearch.toLowerCase()));
                      const matchLocation = jobCountry === "Tous" || job.location.toLowerCase().includes(jobCountry.toLowerCase());
                      return matchQuery && matchLocation;
                    })
                    .map((job) => {
                      const calculatedMatch = getDynamicMatchScore(job.tags);
                      return (
                        <div 
                          key={job.id} 
                          className="bento-card !rounded-2xl hover:border-brand-orange-500/25 p-5 space-y-4"
                        >
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              {/* Logo block */}
                              <div className="h-10 w-10 bg-slate-900 text-white font-display font-extrabold text-[12px] flex items-center justify-center rounded-lg uppercase">
                                {job.logo}
                              </div>
                              <div>
                                <h3 className="font-display font-bold text-sm text-[#1A1A1A] leading-tight">{job.title}</h3>
                                <div className="text-[11px] text-slate-500 font-medium">{job.company} &bull; <span className="text-slate-650">{job.location}</span></div>
                              </div>
                            </div>

                            {/* Dynamics Match Score */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9.5px] font-bold text-brand-green-700 bg-brand-green-700/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {calculatedMatch}% Match d'IA
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-655 leading-relaxed font-semibold">{job.description}</p>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div className="flex flex-wrap gap-1">
                              {job.tags.map((tag, idx) => (
                                <span key={idx} className="bg-slate-50 text-slate-800 rounded-md border border-slate-205 py-0.5 px-2 text-[10px] font-mono font-bold">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold font-mono">{job.salary}</span>
                          </div>

                          <div className="pt-3 border-t border-[#E5E1DA]/50 flex justify-end gap-2 text-xs">
                            <button
                              onClick={() => handleApplyShortcut(job)}
                              className="bg-brand-orange-500 hover:bg-brand-orange-600 text-white py-1.5 px-4 rounded-xl font-bold uppercase tracking-wider text-[10.5px] cursor-pointer"
                            >
                              Postuler &amp; Pré-remplir la Lettre
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>

              </motion.div>

              {/* COVER LETTER GENERATOR (Span 5) */}
              <motion.div variants={cardVariants} className="bento-card lg:col-span-5 p-6 h-fit space-y-5">
                <span className="text-[9.5px] font-bold text-brand-orange-500 uppercase tracking-widest leading-none block font-sans">Générateur de Lettre IA</span>
                <h3 className="font-display text-lg font-bold">Rédiger ma Lettre de Motivation</h3>
                
                <form onSubmit={handleGenerateCoverLetter} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-705 uppercase tracking-widest mb-1">Candidat</label>
                      <input
                        type="text"
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-[#E5E1DA] bg-bento-bg"
                        value={letterInputs.userName}
                        onChange={(e) => setLetterInputs({ ...letterInputs, userName: e.target.value })}
                        placeholder="Ton nom"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-705 uppercase tracking-widest mb-1">Poste ciblé</label>
                      <input
                        type="text"
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-[#E5E1DA] bg-bento-bg"
                        value={letterInputs.jobTitle}
                        onChange={(e) => setLetterInputs({ ...letterInputs, jobTitle: e.target.value })}
                        placeholder="Intitulé du poste"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-705 uppercase tracking-widest mb-1">Compagnie</label>
                      <input
                        type="text"
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-[#E5E1DA] bg-bento-bg"
                        value={letterInputs.companyName}
                        onChange={(e) => setLetterInputs({ ...letterInputs, companyName: e.target.value })}
                        placeholder="e.g. Flutterwave"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-705 uppercase tracking-widest mb-1">Localisation</label>
                      <input
                        type="text"
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-[#E5E1DA] bg-bento-bg"
                        value={letterInputs.companyLocation}
                        onChange={(e) => setLetterInputs({ ...letterInputs, companyLocation: e.target.value })}
                        placeholder="Remote, Lagos..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    <label className="block text-[11px] font-bold text-slate-705 uppercase tracking-widest mb-1">Style de Tonalité</label>
                    <div className="grid grid-cols-3 gap-1">
                      {["Professional", "Startup", "International"].map((toneOpt) => (
                        <button
                          key={toneOpt}
                          type="button"
                          onClick={() => setLetterInputs({ ...letterInputs, tone: toneOpt })}
                          className={`py-1.5 px-1 rounded-lg text-center text-[10.5px] font-bold uppercase transition-all duration-150 ${
                            letterInputs.tone === toneOpt
                              ? "bg-brand-orange-500 text-white border-transparent"
                              : "bg-slate-50 border border-[#E5E1DA] text-slate-655 hover:bg-slate-100"
                          }`}
                        >
                          {toneOpt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-705 uppercase tracking-widest mb-1 font-sans">Points forts à valoriser (Key Points)</label>
                    <textarea
                      rows={3}
                      className="w-full text-[11.5px] font-semibold px-3 py-2 rounded-xl border border-[#E5E1DA] bg-bento-bg"
                      value={letterInputs.keyPoints}
                      onChange={(e) => setLetterInputs({ ...letterInputs, keyPoints: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loadingLetter}
                    className="w-full bg-[#1A1A1A] hover:bg-slate-900 disabled:bg-slate-350 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {loadingLetter ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Rédaction IA en cours...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-brand-orange-400" />
                        <span>Générer ma Lettre de Motivation</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Display compiled letters */}
                {generatedLetter && (
                  <div className="space-y-4 pt-3 border-t border-[#E5E1DA]/60 animate-fade-in text-[#1A1A1A]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold tracking-widest text-[#2D6A4F] uppercase bg-brand-green-700/10 px-2 py-0.5 rounded-md">Lettre prête</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLetter.letterText);
                          showNotice("Lettre copiée dans le presse-papier !", "success");
                        }}
                        className="text-xs text-brand-orange-500 font-extrabold hover:underline flex items-center gap-1.5"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copier tout</span>
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-205 rounded-xl text-xs font-semibold leading-relaxed font-mono whitespace-pre-line text-slate-700 max-h-[300px] overflow-y-auto">
                      {generatedLetter.letterText}
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-505 block">Conseils d'application :</span>
                      {generatedLetter.tips?.map((tp, i) => (
                        <div key={i} className="flex gap-2 text-[11px] leading-relaxed font-medium bg-[#F9F8F3] p-2.5 rounded-xl border border-[#E5E1DA]">
                           <span className="text-[#2D6A4F] font-bold">&bull;</span>
                           <span>{tp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

            </div>
          </motion.div>
        )}

        {/* 7. PROFILE & ANALYTICS */}
        {currentTab === "profile" && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 text-[#1A1A1A]"
          >
            <motion.div variants={cardVariants} className="bento-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-brand-green-700/10 text-brand-green-700 rounded-xl flex items-center justify-center">
                  <User className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight">Profil &amp; Tableau de bord de Progression</h1>
                  <p className="text-xs text-bento-muted font-medium">Gère tes identifiants de compétences, visualise l'évaluation d'impact en temps réel et harmonise ton profil professionnel.</p>
                </div>
              </div>
            </motion.div>

            {/* LinkedIn Quick Import & Setup Premium Banner */}
            <motion.div variants={cardVariants} className="bento-card bg-gradient-to-r from-[#0a66c2]/90 to-[#0077b5]/90 text-white p-6 shadow-md border-transparent overflow-hidden relative">
              {/* Background accent shapes */}
              <div className="absolute right-0 top-0 w-44 h-44 bg-white/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12"></div>
              <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-[#0284c7]/30 rounded-full blur-xl"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="max-w-xl space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Outils LinkedIn Pro
                  </div>
                  <h2 className="font-display font-black text-xl tracking-tight text-white">Importation instantanée de profil LinkedIn</h2>
                  <p className="text-xs text-white/90 font-medium leading-relaxed">
                    Alimente automatiquement ton profil AfroCareer ! Connecte ton compte LinkedIn ou colle le texte brut de ton profil pour extraire instantanément tes compétences clés et tes expériences professionnelles grâce à notre IA.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 shrink-0">
                  <button
                    onClick={handleConnectLinkedIn}
                    disabled={connectingLinkedIn}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#0077b5] font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {connectingLinkedIn ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Connexion...</span>
                      </>
                    ) : (
                      <>
                        <Linkedin className="h-4 w-4 text-[#0077b5] fill-[#0077b5] shrink-0" />
                        <span>LinkedIn Sync</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setLinkedinModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1e293b]/40 hover:bg-[#1e293b]/55 border border-white/25 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    <span>Coller mon profil textuel</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* LinkedIn Parser Paste Modal */}
            {linkedinModalOpen && (
              <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-bento-border shadow-2xl max-w-lg w-full overflow-hidden text-[#1A1A1A]"
                >
                  <div className="bg-[#0077b5] p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-5 w-5 fill-white text-white" />
                      <h3 className="font-display font-bold text-base">Importation Intelligente par Copier-Coller</h3>
                    </div>
                    <button 
                      onClick={() => setLinkedinModalOpen(false)}
                      className="text-white hover:text-slate-100 p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Ouvre ton profil LinkedIn, clique sur <strong>"Plus" &gt; "Enregistrer au format PDF"</strong> ou copie simplement tout le texte brut de ton profil ou de ton CV, puis colle-le ci-dessous. AfroCareer AI va en extraire intelligemment le rôle ciblé, tes compétences clés et tes expériences antérieures.
                    </p>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-sans">
                        Texte brut du profil ou CV
                      </label>
                      <textarea
                        rows={10}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E5E1DA] bg-bento-bg focus:border-[#0077b5] focus:ring-1 focus:ring-[#0077b5] outline-none transition-all placeholder:text-slate-400"
                        placeholder="Exemple :&#10;Roland Traoré - Développeur Full-Stack&#10;Expériences:&#10;- Sénégal Tech Solutions (Jan 2024 - Présent) : Développeur web React...&#10;Compétences: React, Node.js, Express, JavaScript..."
                        value={pastedLinkedInText}
                        onChange={(e) => setPastedLinkedInText(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-[#E5E1DA]/40">
                    <button
                      type="button"
                      onClick={() => setLinkedinModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-550 hover:bg-slate-100 rounded-xl transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleParseLinkedInText}
                      disabled={parsingLinkedInText || !pastedLinkedInText.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077b5] hover:bg-[#006294] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-55"
                    >
                      {parsingLinkedInText ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Analyse IA en cours...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Analyser &amp; Remplir</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* THREE PANELS BENTO ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Profile setup card (Span 4) */}
              <motion.div variants={cardVariants} className="bento-card lg:col-span-4 p-6 h-fit space-y-6">
                <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-[#E5E1DA]">
                  {/* Big avatar widget */}
                  <div className="h-18 w-18 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center font-display font-black text-3xl shadow-lg shadow-brand-green-700/20">
                    {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-[#1A1A1A] text-lg">{userProfile.name}</h3>
                    <p className="text-xs text-slate-500 font-bold tracking-tight">{userProfile.email}</p>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1">Nom Complet</label>
                    <input
                      type="text"
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-bento-border bg-bento-bg"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1">Courriel de Contact</label>
                    <input
                      type="email"
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-bento-border bg-bento-bg"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1">Poste Actuellement Visé</label>
                    <input
                      type="text"
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-bento-border bg-bento-bg"
                      value={userProfile.targetCareer}
                      onChange={(e) => setUserProfile({ ...userProfile, targetCareer: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-slate-900 border border-transparent font-bold text-xs uppercase tracking-wider text-white transition-all cursor-pointer"
                  >
                    Mettre à jour mes informations
                  </button>
                </form>
              </motion.div>

              {/* Dynamic Skills tags board (Span 4) */}
              <motion.div variants={cardVariants} className="bento-card lg:col-span-4 p-6 h-fit space-y-5">
                <span className="text-[10px] font-bold text-brand-orange-500 uppercase tracking-widest block leading-none">Compétences d'IA</span>
                <h3 className="font-display text-lg font-bold">Base de connaissances &mdash; Skills</h3>
                <p className="text-xs text-slate-500 leading-normal font-medium">Configure ci-dessous tes compétences clés. Celles-ci alimentent l'algorithme d'IA et le score de compatibilité de l'onglet Emplois.</p>

                {/* Tags lists */}
                <div className="flex flex-wrap gap-2 py-2">
                  {userProfile.skills.map((sk) => (
                    <span 
                      key={sk} 
                      className="inline-flex items-center gap-1.5 bg-[#F5F3E9] border border-[#E5E1DA] text-slate-800 py-1 px-3 rounded-xl text-xs font-bold"
                    >
                      <span>{sk}</span>
                      <button 
                        onClick={() => handleRemoveSkill(sk)}
                        className="text-slate-450 hover:text-red-700 transition-colors"
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {userProfile.skills.length === 0 && (
                    <span className="text-xs text-[#E96B24] font-bold italic">Ta liste de compétences est vide !</span>
                  )}
                </div>

                {/* Input block to add new skill */}
                <div className="pt-2 border-t border-[#E5E1DA]/50 space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block leading-none">Ajouter un nouveau skill :</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="flex-grow text-xs font-semibold px-4 h-11 rounded-xl border border-[#E5E1DA] bg-bento-bg focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] outline-none transition-all placeholder:text-slate-400"
                      placeholder="e.g. Docker, Python..."
                      value={newSkillText}
                      onChange={(e) => setNewSkillText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="h-11 w-11 flex items-center justify-center bg-[#1A1A1A] hover:bg-slate-900 active:scale-95 text-white rounded-xl cursor-pointer transition-all duration-150 shadow-sm shrink-0"
                      title="Ajouter la compétence"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Dynamic stats & progress metrics (Span 4) */}
              <motion.div variants={cardVariants} className="bento-card lg:col-span-4 p-6 space-y-5">
                <span className="text-[10px] font-bold text-brand-green-700 uppercase tracking-widest block leading-none">Analytique Globale</span>
                <h3 className="font-display text-lg font-bold">Maturité du Profil</h3>

                {/* Score indicators */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-650">Indice de Readiness tech</span>
                      <span className="text-brand-orange-500">{Math.min(100, userProfile.skills.length * 15)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-orange-500" style={{ width: `${Math.min(100, userProfile.skills.length * 15)}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-650">Comportemental &amp; RH Fit</span>
                      <span className="text-brand-green-700">82%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-green-700" style={{ width: '82%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-650">Complétude du dossier</span>
                      <span className="text-blue-650">90%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#F9F8F3] border border-[#EBE9DE] rounded-2xl text-[11px] leading-relaxed text-slate-705">
                  <div className="font-bold text-slate-800 mb-1">💡 Suggestion du Coach IA :</div>
                  <p className="font-medium text-slate-600">Ajoute les compétences **Docker** et **AWS** si tu vises des opportunités de déploiement d'infrastructure remote d'envergure. Cela favorise ton matching de 25% !</p>
                </div>
              </motion.div>

            </div>

            {/* Experience timeline card */}
            <motion.div variants={cardVariants} className="bento-card p-6 mt-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-4 border-bento-border">
                <div>
                  <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-widest block leading-none font-sans font-extrabold">Parcours pro</span>
                  <h3 className="font-display text-lg font-bold mt-1 text-slate-900">Expériences Professionnelles</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Historique de ta carrière extrait de ton profil LinkedIn et valorisé.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const title = prompt("Titre du poste (ex: Développeur React) :");
                    if (!title) return;
                    const company = prompt("Entreprise (ex: Safaricom) :");
                    if (!company) return;
                    const duration = prompt("Durée / Dates (ex: 2024 - Présent) :");
                    const description = prompt("Description des responsabilités :");
                    const newExp = { title, company, duration: duration || "", description: description || "" };
                    setUserProfile(prev => ({
                      ...prev,
                      experiences: [...(prev.experiences || []), newExp]
                    }));
                    showNotice("Expérience ajoutée avec succès !", "success");
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span>Ajouter manuellement</span>
                </button>
              </div>

              <div className="space-y-6">
                {(!userProfile.experiences || userProfile.experiences.length === 0) ? (
                  <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-bento-border/85 flex flex-col items-center justify-center space-y-3">
                    <Briefcase className="h-8 w-8 text-slate-350" />
                    <div className="max-w-xs space-y-1">
                      <p className="text-xs text-slate-700 font-bold">Aucune expérience enregistrée</p>
                      <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">Synchronise ton LinkedIn en un clic ci-dessus pour charger instantanément ton parcours pro, ou ajoute-le manuellement.</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l border-[#E5E1DA]/60 space-y-6 ml-3">
                    {userProfile.experiences.map((exp, idx) => (
                      <div key={idx} className="relative group">
                        {/* Timeline bead */}
                        <div className="absolute -left-10 top-1 h-8 w-8 rounded-full bg-slate-100 border border-[#2D6A4F] text-[#2D6A4F] flex items-center justify-center shadow-xs">
                          <Briefcase className="h-3.5 w-3.5" />
                        </div>

                        <div className="p-4 bg-slate-50 border border-transparent hover:border-[#E5E1DA]/40 hover:bg-slate-100/35 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-display font-extrabold text-[#1A1A1A] text-sm leading-tight">{exp.title}</h4>
                              <span className="bg-[#2D6A4F]/10 border border-[#2D6A4F]/10 text-[#2D6A4F] text-[10px] font-extrabold px-2 py-0.5 rounded-md">{exp.company}</span>
                            </div>
                            <span className="text-[10px] text-slate-450 block font-bold tracking-wide">{exp.duration}</span>
                            {exp.description && (
                              <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1 max-w-3xl whitespace-pre-line">{exp.description}</p>
                            )}
                          </div>
                          
                          <button
                            onClick={() => {
                              setUserProfile(prev => ({
                                ...prev,
                                experiences: (prev.experiences || []).filter((_, i) => i !== idx)
                              }));
                              showNotice("Expérience supprimée.", "info");
                            }}
                            className="bg-transparent text-slate-400 hover:text-red-700 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer self-end sm:self-start shrink-0"
                            title="Supprimer cette expérience"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Skills Mastery Recharts Radar Chart */}
            <motion.div variants={cardVariants} className="bento-card p-6 mt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#E5E1DA] pb-4 border-bento-border">
                <div>
                  <span className="text-[10px] font-bold text-brand-orange-500 uppercase tracking-widest block leading-none font-sans">Diagnostic Visuel</span>
                  <h3 className="font-display text-lg font-bold mt-1 text-slate-900">Analyse Radar : Maîtrise des compétences vs Exigences</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Visualisation de ton niveau actuel par rapport aux attentes du marché pour le poste de <span className="font-bold text-slate-700">"{userProfile.targetCareer || "Digital Professional"}"</span>.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-[#2D6A4F]/20 border border-[#2D6A4F]"></span>
                    <span className="text-[#2D6A4F] font-bold">Ma maîtrise active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-[#D45B12]/20 border border-[#D45B12]/50 border-dashed"></span>
                    <span className="text-[#D45B12] font-bold">Niveau recommandé</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 h-[340px] w-full flex items-center justify-center bg-slate-50/[0.3] rounded-2xl border border-bento-border/50">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={getRadarData()}>
                      <PolarGrid stroke="#E5E1DA" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#1A1A1A', fontSize: 10, fontWeight: 700 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: '#718096', fontSize: 9 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          border: '1px solid #E5E1DA', 
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }} 
                      />
                      <Radar
                        name="Ma maîtrise"
                        dataKey="Maitrise"
                        stroke="#2D6A4F"
                        fill="#2D6A4F"
                        fillOpacity={0.15}
                      />
                      <Radar
                        name="Niveau ciblé"
                        dataKey="Exige"
                        stroke="#D45B12"
                        strokeDasharray="4 4"
                        fill="#D45B12"
                        fillOpacity={0.03}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="md:col-span-5 space-y-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block leading-none font-sans">Interprétation de l'IA</span>
                  <h4 className="font-display font-bold text-slate-850 text-sm">Comment combler l'écart de compétences ?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Ce graphique compare les compétences déclarées dans ton profil avec la modélisation intelligente du poste de <span className="font-bold text-slate-705">"{userProfile.targetCareer || "généraliste"}"</span>. Plus ton polygone vert s'étend pour englober la ligne pointillée orange, plus ton employabilité s'accroît sur ce métier d'avenir !
                  </p>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {getRadarData().map((item, idx) => {
                      const gap = item.Exige - item.Maitrise;
                      return (
                        <div key={idx} className="p-3 bg-slate-50 border border-[#E5E1DA]/40 rounded-xl flex items-center justify-between text-xs font-semibold gap-3">
                          <div className="min-w-0">
                            <span className="text-slate-900 truncate block">{item.subject}</span>
                            <span className="text-[10px] text-slate-450 block font-medium mt-0.5">Recommandé : {item.Exige}% &bull; Actuel : {item.Maitrise}%</span>
                          </div>
                          <div className="shrink-0 flex items-center">
                            {gap <= 0 ? (
                              <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">Maîtrisé ✓</span>
                            ) : gap <= 25 ? (
                              <span className="bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">Proche (-{gap}%)</span>
                            ) : (
                              <span className="bg-[#D45B12]/10 text-[#D45B12] border border-[#D45B12]/10 px-2 py-0.5 rounded-md text-[10px] font-bold">À muscler (-{gap}%)</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E5E1DA] bg-white py-12 px-4 mt-20 text-[#666666]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-orange-500 font-display font-bold flex items-center justify-center text-white text-xs">
              A
            </div>
            <span className="font-display font-bold text-sm text-[#1A1A1A]">
              AfroCareer <span className="text-brand-orange-500">AI</span> &bull; <span className="text-[10px] text-slate-450 uppercase font-semibold">2026 Edition</span>
            </span>
          </div>

          <p className="text-xs font-medium text-center md:text-right leading-relaxed max-w-md">
            Une plateforme éducative, optimisée et innovante conçue pour la jeunesse africaine. En partenariat avec les leaders technologiques du continent. 🌍🚀
          </p>
        </div>
      </footer>

      {/* PERSISTENT BOTTOM NOTIFICATION HUB */}
      <div className="fixed bottom-6 left-6 z-40">
        {!isNotificationsPanelOpen ? (
          <button
            id="notif-hub-toggle"
            onClick={() => setIsNotificationsPanelOpen(true)}
            className="group flex items-center gap-2.5 bg-[#1A1A1A] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 hover:border-brand-orange-500/50 hover:bg-black transition-all cursor-pointer relative"
          >
            <div className="relative flex items-center justify-center">
              {notificationsList.some(n => !n.isRead) ? (
                <BellRing className="h-4.5 w-4.5 text-brand-orange-400 animate-bounce" />
              ) : (
                <Bell className="h-4.5 w-4.5 text-slate-400 group-hover:text-white transition-colors" />
              )}
              {notificationsList.some(n => !n.isRead) && (
                <span className="absolute -top-1.5 -right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange-500"></span>
                </span>
              )}
            </div>
            <div className="text-left font-sans">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-slate-400 leading-none">Notifications</span>
              <span className="text-xs font-bold font-mono">
                {notificationsList.length > 0 
                  ? `${notificationsList.filter(n => !n.isRead).length} nouvelle${notificationsList.filter(n => !n.isRead).length > 1 ? 's' : ''}`
                  : "Aucune alerte"
                }
              </span>
            </div>
          </button>
        ) : (
          <div className="bg-[#1A1A1A] text-white rounded-2xl shadow-2xl border border-white/10 w-80 sm:w-96 overflow-hidden animate-fade-in font-sans">
            {/* Header */}
            <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-brand-orange-400" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FFFFFF]">Centre d'Alertes</span>
                {notificationsList.some(n => !n.isRead) && (
                  <span className="px-1.5 py-0.5 rounded bg-brand-orange-500/20 text-brand-orange-400 text-[9px] font-extrabold font-mono">
                    {notificationsList.filter(n => !n.isRead).length} NEW
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notificationsList.length > 0 && (
                  <button
                    onClick={() => {
                      setNotificationsList([]);
                      showNotice("Toutes les notifications ont été effacées.", "info");
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-400 transition-colors uppercase tracking-wider"
                  >
                    Effacer tout
                  </button>
                )}
                <button
                  onClick={() => setIsNotificationsPanelOpen(false)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="p-2 max-h-[280px] overflow-y-auto space-y-1 bg-[#1A1A1A]">
              {notificationsList.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs font-semibold text-slate-400">Aucune alerte pour l'instant</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Les alertes de réussite de vos scans de CV et de vos roadmaps s'afficheront ici.
                  </p>
                </div>
              ) : (
                notificationsList.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      // Mark as read
                      setNotificationsList(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                      // Reroute using standard app state tabs
                      setCurrentTab(notif.type);
                      setIsNotificationsPanelOpen(false);
                      showNotice(`Direction l'espace ${notif.type === "cv" ? "Analyse CV" : "Roadmap"} !`, "info");
                    }}
                    className={`p-3 rounded-xl transition-all cursor-pointer border text-left group flex gap-3 relative overflow-hidden ${
                      notif.isRead 
                        ? "bg-[#1f1f1f]/50 border-white/5 hover:bg-[#1f1f1f]" 
                        : "bg-[#252525] border-white/10 hover:border-brand-orange-500/35 hover:bg-[#2b2b2b]"
                    }`}
                  >
                    {!notif.isRead && (
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-brand-orange-500" />
                    )}
                    
                    {/* Icon matching the action */}
                    <div className="shrink-0">
                      {notif.type === "cv" ? (
                        <div className="h-8 w-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center">
                          <FileText className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-brand-orange-500/15 text-brand-orange-400 flex items-center justify-center">
                          <Map className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white group-hover:text-brand-orange-400 transition-colors">
                          {notif.title}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 shrink-0 uppercase font-mono tracking-wide">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-300 leading-relaxed mt-0.5 line-clamp-2 text-slate-300">
                        {notif.message}
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                          {notif.type === "cv" ? "CV Analysé" : "Roadmap"}
                        </span>
                        <span className="text-[10px] font-bold text-brand-orange-500 underline opacity-0 group-hover:opacity-100 transition-all">
                          Consulter &rarr;
                        </span>
                      </div>
                    </div>

                    {/* Dismiss individual button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotificationsList(prev => prev.filter(n => n.id !== notif.id));
                      }}
                      className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                      title="Supprimer l'alerte"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
