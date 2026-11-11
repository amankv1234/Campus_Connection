const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Comprehensive Career Knowledge Base
function getCareerAdvice(question) {
  const q = question.toLowerCase();

  // 1. Full Stack / Web Development Roadmap
  if (q.includes('full stack') || q.includes('web dev') || q.includes('frontend') || q.includes('backend') || q.includes('react') || q.includes('node') || q.includes('mern') || q.includes('javascript')) {
    return `🌐 **Full-Stack MERN Developer Roadmap for College Students:**\n\n` +
      `**1. Phase 1: Frontend Mastery (Weeks 1-4)**\n` +
      `• HTML5 & CSS3 (Flexbox, CSS Grid, Tailwind CSS for modern responsive styling).\n` +
      `• JavaScript ES6+ (Async/Await, Promises, Closures, Array methods, Fetch API).\n` +
      `• React.js: Components, State Management (Context API/Redux), Hooks (useState, useEffect, useRef, useMemo), React Router.\n\n` +
      `**2. Phase 2: Backend & Database (Weeks 5-8)**\n` +
      `• Node.js & Express.js: RESTful APIs, Routing, Middlewares, Input Validation.\n` +
      `• MongoDB & Mongoose: Schemas, Relationships, Aggregation pipelines.\n` +
      `• Authentication: JWT (JSON Web Tokens), Password Hashing with bcrypt.\n\n` +
      `**3. Phase 3: Real-Time & Advanced Features (Weeks 9-12)**\n` +
      `• WebSockets via Socket.io (Real-time chat & notifications like CampusConnect).\n` +
      `• File handling: Base64 storage, file uploads.\n` +
      `• Deployment: Frontend on Vercel, Backend on Render/Railway with MongoDB Atlas.`;
  }

  // 2. Data Structures & Algorithms / LeetCode
  if (q.includes('dsa') || q.includes('leetcode') || q.includes('coding') || q.includes('algorithm') || q.includes('striver') || q.includes('cp') || q.includes('data structure')) {
    return `💻 **Step-by-Step DSA Preparation Strategy for Placements:**\n\n` +
      `**Step 1: Choose 1 Language**\n` +
      `• Stick with C++ (STL) or Java (Collections) or Python. Don't switch languages midway.\n\n` +
      `**Step 2: Topic-wise Order (Follow Striver's A2Z or NeetCode 150)**\n` +
      `1. Arrays, Two Pointers & Sliding Window (25 essential problems)\n` +
      `2. Strings & HashMaps / Frequency Counting (20 problems)\n` +
      `3. Recursion & Backtracking (Subsets, Permutations, N-Queens)\n` +
      `4. Linked Lists, Stacks & Queues (Parentheses checking, Next Greater Element)\n` +
      `5. Binary Trees & BST (Inorder/Preorder traversals, LCA, Height/Diameter)\n` +
      `6. Dynamic Programming & Graphs (0/1 Knapsack, Longest Common Subsequence, BFS/DFS, Dijkstra)\n\n` +
      `**Pro-Tip:** Solve 2 quality problems daily consistently. Focus on the intuition and time complexity analysis ($O(N)$ vs $O(N^2)$).`;
  }

  // 3. Resume & CV Building
  if (q.includes('resume') || q.includes('cv') || q.includes('ats')) {
    return `📄 **ATS-Friendly Tech Resume Checklist:**\n\n` +
      `**1. Formatting Rules:**\n` +
      `• Strictly **1 Page** length (clean single-column layout without graphics, icons, or progress bars).\n` +
      `• Use standard templates: Jake's Resume (Overleaf LaTeX) or Harvard template.\n\n` +
      `**2. The Google XYZ Bullet Formula:**\n` +
      `• *"Accomplished [X] as measured by [Y], by doing [Z]"*\n` +
      `• Example: *"Developed a real-time full-stack networking platform serving 500+ campus students, implementing WebSockets and reducing query latency by 35%."*\n\n` +
      `**3. Section Sequence:**\n` +
      `Education ➔ Technical Skills (Languages, Frameworks, Databases, Tools) ➔ Projects (Live Demo & GitHub links) ➔ Experience / Internships ➔ Achievements.`;
  }

  // 4. Interview Preparation (Technical + HR)
  if (q.includes('interview') || q.includes('hr') || q.includes('technical round') || q.includes('prep')) {
    return `🎯 **Interview Cracking Blueprint (Tech + HR):**\n\n` +
      `**Part A: Technical Rounds**\n` +
      `• **Live Problem Solving:** Always clarify constraints, start with brute-force, discuss time/space trade-offs, and speak your thoughts out loud!\n` +
      `• **Core CS Subjects (Must Revise):**\n` +
      `  - **DBMS:** ACID properties, Normalization (1NF-BCNF), Indexing (B-Trees), SQL Joins.\n` +
      `  - **OS:** Process vs Thread, Deadlock conditions & handling, Paging, Virtual Memory.\n` +
      `  - **CN:** TCP 3-Way Handshake, DNS resolution, HTTP vs HTTPS, OSI Model.\n` +
      `  - **OOP:** Encapsulation, Abstraction, Inheritance, Polymorphism.\n\n` +
      `**Part B: HR Rounds (STAR Method)**\n` +
      `• Structure behavioral answers: **S**ituation ➔ **T**ask ➔ **A**ction ➔ **R**esult.\n` +
      `• Prepare stories for: *"Tell me about a difficult bug you solved"* and *"Why do you want to join our team?"*.`;
  }

  // 5. Internships & Off-Campus Jobs
  if (q.includes('internship') || q.includes('placement') || q.includes('job') || q.includes('referral') || q.includes('off campus')) {
    return `🚀 **How to Land Internships & Off-Campus Offers:**\n\n` +
      `**1. The Referral Strategy (80% Success Rate):**\n` +
      `• Find alumni or engineers on LinkedIn & CampusConnect.\n` +
      `• Send a concise message: [Role Name] + [Job ID] + [1-line summary of your best matching project] + [1-page resume link].\n\n` +
      `**2. High-Yield Platforms:**\n` +
      `• Wellfound (formerly AngelList) for startups.\n` +
      `• Instahyre and Cutshort for fast interview callbacks.\n` +
      `• Company Careers pages for early bird applications (within 24 hrs of posting).\n\n` +
      `**3. Stand-out Factor:**\n` +
      `• Have at least 1 deployed full-stack project with active users or demonstrable real-world functionality.`;
  }

  // 6. Project Ideas
  if (q.includes('project') || q.includes('idea') || q.includes('portfolio')) {
    return `💡 **Top Resume-Worthy Project Ideas:**\n\n` +
      `1. **Campus Community Platform (CampusConnect):** Full-stack networking, real-time messaging, role-based access, and peer discovery.\n` +
      `2. **ATS Resume Parser & Matcher:** Upload PDF resume, extract text, and calculate match percentage against a job description.\n` +
      `3. **Collaborative Code / Note Editor:** Real-time multi-user document collaboration with WebSockets.\n` +
      `4. **Smart Expense Tracker & Analytics:** Track student budgets with visual charts and recurring spending predictions.`;
  }

  // 7. General Dynamic Career Answer for Any Other Query
  return `💡 **Career Mentor Guidance for:** *"${question}"*\n\n` +
    `Here is an actionable, structured approach to master this:\n\n` +
    `1. **Core Concept Mastery:** Start by understanding the underlying architecture rather than memorizing syntax. Read official documentation.\n` +
    `2. **Hands-On Application:** Immediately build a small proof-of-concept project or solve 5-10 related problems to reinforce your learning.\n` +
    `3. **Peer Collaboration:** Discuss and share your findings with college peers on CampusConnect. Teaching others solidifies your own grasp.\n` +
    `4. **Document & Showcase:** Push clean, well-commented code to GitHub with a descriptive README. Add it to your resume as practical experience.\n\n` +
    `*Have a specific follow-up question or need a daily study timetable? Feel free to ask!*`;
}

// @desc    Ask AI Career Assistant (Powered by Gemini + Smart Knowledge Engine)
// @route   POST /api/ai/ask
// @access  Private
router.post('/ask', protect, async (req, res) => {
  try {
    const { question, history } = req.body;
    
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // If a valid Google AI Studio Gemini API Key is configured
    if (geminiApiKey && geminiApiKey.startsWith('AIzaSy')) {
      try {
        let promptText = "You are an expert AI Career and Placement Mentor for college students. Provide well-structured, encouraging, concise and actionable guidance on resumes, mock interviews, DSA, internships, and job search strategies.\n\n";
        
        if (Array.isArray(history) && history.length > 0) {
          promptText += "Previous conversation:\n";
          history.slice(-4).forEach(h => {
            promptText += `${h.role === 'assistant' ? 'AI' : 'Student'}: ${h.content}\n`;
          });
          promptText += "\n";
        }
        promptText += `Student: ${question}\nAI:`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: promptText }]
              }]
            })
          }
        );

        const data = await response.json();

        if (response.ok && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          return res.status(200).json({ answer: data.candidates[0].content.parts[0].text });
        }
      } catch (geminiError) {
        console.error('Gemini API fetch error:', geminiError.message);
      }
    }

    // Immediate, rich and accurate answer (Zero lag, zero failure)
    const answer = getCareerAdvice(question);
    res.status(200).json({ answer });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;