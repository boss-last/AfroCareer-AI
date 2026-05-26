/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  email: string;
  skills: string[];
  interests: string[];
  targetCareer: string;
  experiences?: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
}

export interface CareerRecommendation {
  title: string;
  description: string;
  demand: string;
  relevanceScore: number;
  marketContext: string;
  keySkills: string[];
  avgSalary: string;
  steps: string[];
}

export interface LearningPhase {
  title: string;
  duration: string;
  topics: string[];
  certifications: string[];
  projects: string[];
  africanResources: string[];
}

export interface LearningRoadmap {
  career: string;
  estimatedTime: string;
  phases: LearningPhase[];
}

export interface CVAnalysis {
  atsScore: number;
  breakdown: {
    keywords: number;
    formatting: number;
    impact: number;
  };
  keySkillsDetected: string[];
  missingKeywords: string[];
  suggestions: string[];
  detailedAnalysis: string;
}

export interface InterviewQuestion {
  id: number;
  text: string;
  suggestedBrief: string;
}

export interface InterviewFeedback {
  score: number;
  feedback: string;
  idealAnswer: string;
  tips: string[];
}

export interface JobPost {
  id: number;
  title: string;
  company: string;
  logo: string;
  location: string;
  tags: string[];
  matchScore: number;
  salary: string;
  description: string;
}

export interface AppNotification {
  id: string;
  type: "cv" | "roadmap";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  targetJob?: string;
}
