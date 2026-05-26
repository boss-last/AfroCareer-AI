/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Compass, 
  MessageSquare, 
  Map, 
  FileText, 
  Award, 
  Briefcase, 
  User, 
  Flame,
  Globe
} from "lucide-react";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userName: string;
}

export default function Header({ currentTab, setCurrentTab, userName }: HeaderProps) {
  const navigationItems = [
    { id: "landing", label: "Accueil", icon: Compass },
    { id: "coach", label: "AI Coach & Carrière", icon: MessageSquare },
    { id: "roadmap", label: "Roadmaps", icon: Map },
    { id: "cv", label: "ATS CV Scan", icon: FileText },
    { id: "interview", label: "Entretiens", icon: Award },
    { id: "jobs", label: "Offres Tech & Lettres", icon: Briefcase },
    { id: "profile", label: "Profil & Stats", icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E1DA] bg-white/80 backdrop-blur-md px-4 py-3 shadow-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        {/* LOGO */}
        <div 
          onClick={() => setCurrentTab("landing")}
          className="flex cursor-pointer items-center gap-2.5 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange-500 text-white shadow-md shadow-brand-orange-500/20 group-hover:scale-105 transition-transform duration-250">
            <Flame className="h-5 w-5 fill-white stroke-[2]" />
          </div>
          <div>
            <span className="font-display text-lg font-extrabold tracking-tight text-[#1A1A1A]">
              AfroCareer <span className="text-brand-orange-500">AI</span>
            </span>
            <div className="flex items-center gap-1 text-[8.5px] font-bold text-[#666666] uppercase tracking-wider">
              <Globe className="h-2.5 w-2.5 text-brand-green-700 animate-pulse" />
              <span>Africa Digital Coach</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <nav className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-brand-orange-500/[0.08] text-brand-orange-600 border border-brand-orange-500/25 font-bold scale-[1.02]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-brand-orange-500" : "text-slate-400"}`} />
                <span className="hidden leading-none sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* PROFILE CHIP SHORTCUT */}
        <div 
          onClick={() => setCurrentTab("profile")}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#F5F3E9] hover:bg-[#EBE9DE] px-3 py-1.5 transition-all text-xs border border-[#E5E1DA]"
        >
          <div className="h-5.5 w-5.5 rounded-lg bg-brand-green-700 font-display font-bold flex items-center justify-center text-white text-[11px]">
            {userName ? userName.charAt(0).toUpperCase() : "A"}
          </div>
          <span className="font-semibold text-slate-800 hidden md:inline">
            {userName || "Mon Profil"}
          </span>
        </div>
      </div>
    </header>
  );
}
