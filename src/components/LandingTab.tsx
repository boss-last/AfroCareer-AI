/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  ArrowRight, 
  MessageSquare, 
  Map, 
  FileText, 
  Award, 
  Briefcase, 
  Users, 
  TrendingUp, 
  GraduationCap, 
  CheckCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";

interface LandingTabProps {
  setCurrentTab: (tab: string) => void;
  userName: string;
}

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

export default function LandingTab({ setCurrentTab, userName }: LandingTabProps) {
  const stats = [
    { label: "Talents Accompagnés", value: "12,480+", icon: Users, color: "text-[#2D6A4F] bg-[#2D6A4F]/10" },
    { label: "Métiers Analysés", value: "180+", icon: Sparkles, color: "text-[#E96B24] bg-[#E96B24]/10" },
    { label: "Fidélité Recommandations", value: "94.6%", icon: TrendingUp, color: "text-blue-650 bg-blue-500/10" },
  ];

  const bentoGridModules = [
    {
      id: "coach",
      title: "AI Career Coach & Recommender",
      desc: "Découvre des carrières porteuses adaptées aux hubs africains. Chatte en direct avec ton mentor IA.",
      icon: MessageSquare,
      badge: "CONSEILS",
      action: "Découvrir sa carrière",
      color: "hover:border-brand-orange-500/40",
      highlight: true
    },
    {
      id: "roadmap",
      title: "Générateur de Roadmaps",
      desc: "Un plan de formation personnalisé étape par étape intégrant ALX, Orange Digital Network, et projets locaux.",
      icon: Map,
      badge: "PARCOURS",
      action: "Établir ma roadmap",
      color: "hover:border-brand-green-700/40",
      highlight: false
    },
    {
      id: "cv",
      title: "Analyseur CV ATS",
      desc: "Scanne ton CV avec l'IA. Obtiens un diagnostic de compatibilité ATS immédiat et suggestions de mots-clés.",
      icon: FileText,
      badge: "OPTIMISE",
      action: "Analyser mon CV",
      color: "hover:border-brand-orange-500/40",
      highlight: false
    },
    {
      id: "interview",
      title: "Défis d'Entretien",
      desc: "Simulateur d'entretien chronométré technique, behavior ou RH. Entraîne-toi et obtiens ton score IA.",
      icon: Award,
      badge: "SIMULATION",
      action: "Simuler un entretien",
      color: "hover:border-brand-green-700/40",
      highlight: false
    },
    {
      id: "jobs",
      title: "Offres Tech & Lettres",
      desc: "Explore des offres locales et génère des lettres de motivation ciblées d'un simple clic.",
      icon: Briefcase,
      badge: "EMPLOI & LETTRES",
      action: "Explorer les offres",
      color: "hover:border-brand-orange-500/40",
      highlight: false
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 py-2 text-[#1A1A1A]"
    >
      
      {/* LANDING BENTO GRID LAYOUT */}
      <div className="grid grid-cols-12 gap-5">
        
        {/* HERO HERO SECTION (Col span 8 on Medium/Large) */}
        <motion.div 
          variants={cardVariants}
          className="col-span-12 lg:col-span-8 bg-gradient-to-br from-[#1A1A1A] to-[#2B2B2B] rounded-3xl p-8 md:p-10 flex flex-col justify-between relative overflow-hidden text-white min-h-[340px] shadow-sm"
        >
          {/* Decorative subtle light pulse */}
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-brand-orange-500 opacity-15 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-10 left-1/3 w-64 h-64 bg-brand-green-700 opacity-10 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-bold text-brand-orange-400 uppercase tracking-wider">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Propulsé par les experts</span>
            </span>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.1] pt-1">
              Lance ta carrière tech en <span className="text-brand-orange-400">Afrique &amp; au-delà.</span>
            </h1>

            <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-md">
              Des conseils avisés, des roadmaps concrètes d'insertion et un simulateur d'embauche pour propulser la jeunesse vers l'indépendance numérique.
            </p>
          </div>

          <div className="relative z-10 pt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentTab("coach")}
              className="bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-brand-orange-500/10 hover:-translate-y-0.5"
            >
              <span>Débuter l'évaluation IA</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCurrentTab("profile")}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/10 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
            >
              Voir mon Profil de compétences
            </button>
          </div>
        </motion.div>

        {/* COMPREHENSIVE SIDE BLOCK: QUICK PANEL (Col span 4 on Medium/Large) */}
        <motion.div 
          variants={cardVariants}
          className="bento-card col-span-12 lg:col-span-4 p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-orange-500">Scan CV Live</span>
              <div className="px-2 py-0.5 bg-brand-green-700/10 text-brand-green-700 text-[9px] font-bold rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green-700 animate-pulse"></span>
                <span>ACTIF</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* SVG circular progress */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="42" stroke="#F1EFE9" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="42" 
                    stroke="#2D6A4F" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray="263.89" 
                    strokeDashoffset="39.58" /* 85% */
                  />
                </svg>
                <span className="absolute font-display text-xl sm:text-2xl font-bold text-[#1A1A1A]">85%</span>
              </div>
              <p className="mt-3 text-xs font-bold text-center text-[#1A1A1A]">Votre CV est optimisé pour l'ATS de Flutterwave</p>
              <p className="text-[10px] text-slate-500 text-center mt-1 italic leading-tight">
                Idéal: Compléter Docker, Python, Kubernetes
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E1DA] flex items-center justify-between text-xs font-bold text-[#1A1A1A]">
            <span className="text-[#666666]">Accéder au scanner</span>
            <button
              onClick={() => setCurrentTab("cv")}
              className="text-[#E96B24] hover:underline flex items-center gap-1"
            >
              <span>Uploader CV</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </motion.div>

      </div>

      {/* STATS ROW BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx}
              variants={cardVariants}
              className="bento-card p-5 flex items-center gap-4 cursor-pointer"
            >
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="h-5.5 w-5.5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-display text-2xl font-extrabold tracking-tight text-[#1A1A1A]">
                  {stat.value}
                </span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* BENTO MODULES LIST */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#1A1A1A] tracking-tight">
            Explore tes outils de carrière intelligents
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Chaque bloc ci-dessous résout une étape clé de ton insertion professionnelle en Afrique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bentoGridModules.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                variants={cardVariants}
                onClick={() => setCurrentTab(item.id)}
                className={`bento-card group flex flex-col justify-between p-6 cursor-pointer hover:scale-[1.01] ${item.color} ${
                  item.highlight ? "ring-2 ring-brand-orange-500/10" : ""
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-900 text-white font-bold group-hover:bg-brand-orange-500 group-hover:text-white transition-all">
                      <Icon className="h-5.5 w-5.5" />
                    </div>
                    <span className="text-[9px] font-bold tracking-widest text-[#E96B24] bg-brand-orange-500/[0.06] rounded-md px-2 py-0.5 border border-brand-orange-500/20">
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-display text-sm font-bold text-[#1A1A1A] group-hover:text-brand-orange-500 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E5E1DA]/50 flex items-center justify-between text-[11px] font-extrabold text-[#1A1A1A] tracking-wide uppercase">
                  <span>{item.action}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[#E96B24] transition-all" />
                </div>
              </motion.div>
            );
          })}

          {/* EXTRA BENTO BLOCK: EDUCATION CORNER */}
          <motion.div 
            variants={cardVariants}
            className="bento-card p-6 !bg-slate-100 flex flex-col justify-between hover:!bg-[#F2F4F7] cursor-pointer" 
            onClick={() => setCurrentTab("roadmap")}
          >
            <div>
              <div className="flex items-center gap-1 text-[9px] font-extrabold text-[#2D6A4F] uppercase tracking-widest mb-2 bg-[#2D6A4F]/10 py-0.5 px-2 rounded-md w-fit">
                <CheckCircle className="h-3 w-3 stroke-[3]" />
                <span>Ressources Intégrées</span>
              </div>
              <h4 className="font-display text-sm font-bold leading-tight mb-2">
                Programmes &amp; Bourses en Ligne
              </h4>
              <p className="text-xs text-slate-500 leading-normal font-medium">
                Accède directement à des partenariats comme 10 Million Developers ALX, Mastercard Tech scholarships, Orange Campus, ou Coursera Africa.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold pt-4">
              <span className="text-slate-650">Bâtir ma roadmap</span>
              <ArrowRight className="h-4 w-4 text-slate-450" />
            </div>
          </motion.div>
        </div>
      </div>

    </motion.div>
  );
}
