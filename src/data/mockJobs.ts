/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JobPost } from "../types";

export const mockJobs: JobPost[] = [
  {
    id: 1,
    title: "Dev Jr Full-Stack (React / Node)",
    company: "Flutterwave",
    logo: "FW",
    location: "Lagos, Nigeria (Hybrid / Remote Option)",
    tags: ["React", "Express", "Node.js", "PostgreSQL"],
    matchScore: 92,
    salary: "$1,200 - $2,000 / month",
    description: "Joins our core payment gateway engine team. Building responsive merchant dashboards and implementing lightning-fast APIs. Great mentorship opportunity!"
  },
  {
    id: 2,
    title: "Junior Data Analyst / AI Engineer",
    company: "Jumia Group",
    logo: "JU",
    location: "Nairobi, Kenya (On-site)",
    tags: ["Python", "Pandas", "Scikit-Learn", "SQL"],
    matchScore: 85,
    salary: "KES 110,000 - 160,000 / month",
    description: "Analyze buyer patterns and optimize delivery routing across the East African market. Help prepare raw datasets to power Jumia's smart recommendation models."
  },
  {
    id: 3,
    title: "Cloud Infrastructure Intern",
    company: "Orange Digital Center",
    logo: "OD",
    location: "Dakar, Senegal (Hybrid)",
    tags: ["Docker", "Linux", "Kubernetes", "Shell Scripting"],
    matchScore: 78,
    salary: "400,000 CFA / month",
    description: "Work with senior engineers to maintain containerized microservices and implement CI/CD pipelines. Strong emphasis on learning cloud-native technologies."
  },
  {
    id: 4,
    title: "Junior Frontend Developer",
    company: "Andela",
    logo: "AD",
    location: "Kigali, Rwanda (100% Remote)",
    tags: ["TypeScript", "Tailwind CSS", "Next.js", "Git"],
    matchScore: 89,
    salary: "$1,500 - $2,300 / month",
    description: "Collaborate with international tech companies. Refactoring standard user interfaces into beautifully animated performance-focused SPAs."
  },
  {
    id: 5,
    title: "Backend Core API Developer",
    company: "Paystack",
    logo: "PS",
    location: "Cape Town, South Africa (Remote)",
    tags: ["Node.js", "MongoDB", "NoSQL", "Jest"],
    matchScore: 65,
    salary: "ZAR 25,000 - 40,000 / month",
    description: "Maintain transactional integrity across pay pipelines. Optimize Express middleware speed and design solid database queries."
  },
  {
    id: 6,
    title: "Machine Learning Assistant",
    company: "InstaDeep",
    logo: "ID",
    location: "Tunis, Tunisia (Hybrid)",
    tags: ["Python", "TensorFlow", "Math", "NLP"],
    matchScore: 70,
    salary: "$800 - $1,400 / month",
    description: "Help label and preprocess proprietary biological and logistics datasets for advanced decision-making RL agents. Requires strong mathematical foundations."
  },
  {
    id: 7,
    title: "Product Design Associate",
    company: "Yiga Technologies",
    logo: "YT",
    location: "Kampala, Uganda (On-site)",
    tags: ["Figma", "UI/UX", "User Research", "Wireframing"],
    matchScore: 50,
    salary: "$600 - $900 / month",
    description: "Design mobile-first interfaces tailored for low-bandwidth and offline-first agricultural payment platforms. Bridge user empathy with digital craft."
  },
  {
    id: 8,
    title: "DevOps Associate Engineer",
    company: "Semicolon Technologies",
    logo: "SC",
    location: "Lagos, Nigeria (Hybrid)",
    tags: ["AWS", "Docker", "Nginx", "GitHub Actions"],
    matchScore: 82,
    salary: "$1,100 - $1,700 / month",
    description: "Assist cohorts in deploying prototype portfolios. Setting up custom virtual machines, reverse proxies, and static CDN resources."
  }
];
