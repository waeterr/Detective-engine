# CASE//NULL

> **Every contradiction leaves a trace.**

A digital detective investigation and reasoning engine built with TypeScript. Solve procedurally generated crime cases using evidence analysis, timeline reconstruction, and logical deduction.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

## 🎯 Overview

CASE//NULL is a full-stack investigation system where you play as a detective solving complex criminal cases. Unlike traditional detective games, the system uses a **deterministic reasoning engine** to evaluate your conclusions based on evidence quality, timeline consistency, and logical deductions.

### Key Features

- 🔍 **Procedural Case Generation** — Infinite unique cases with seeded randomization
- 🧠 **Explainable AI Reasoning** — Every score is transparent and traceable
- 📊 **Evidence-Based Logic** — No guessing; all conclusions must be proven
- ⏱️ **Timeline Analysis** — Cross-reference events, alibis, and contradictions
- 🎨 **Cinematic Glassmorphism UI** — Immersive investigation workstation
- ⚡ **Real-Time Animations** — Smooth Framer Motion interactions
- ⌨️ **Keyboard Shortcuts** — Power-user investigation workflow
- 🔒 **Hidden Truth System** — Truth only revealed after submission

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/waeterr/Detective-engine.git
cd Detective-engine

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Development

```bash
# Terminal 1: Start backend API (port 3000)
npm run dev

# Terminal 2: Start frontend dev server (port 5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```bash
# Build backend
npm run build

# Build frontend
cd frontend
npm run build
```

---

## 🎮 How to Play

### 1. **Case Generation**

- System generates a case with suspects, evidence, timeline, and hidden truth
- You see: crime scene, victim, suspects, locations, evidence
- You don't see: who actually did it

### 2. **Investigation**

- **Evidence Tab** — Inspect fingerprints, CCTV, access logs, statements
- **Timeline Tab** — Reconstruct events chronologically
- **Suspects Tab** — Review persons of interest and motives
- **Analysis Tab** — Optional hypothesis testing (does not reveal culprit)

### 3. **Accusation**

- Select a suspect from the list
- Submit your accusation
- System reveals: correct/incorrect + actual culprit + score

### 4. **Scoring**

- Based on evidence quality, timeline analysis, and reasoning
- Correct accusation = 100 points
- Incorrect accusation = 0 points

---

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js + TypeScript
- **Framework:** Fastify (REST API)
- **Testing:** Vitest
- **Architecture:** Domain-driven design, clean architecture

### Frontend

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Animations:** Framer Motion
- **Styling:** Custom CSS with glassmorphism
- **State:** React hooks (no external state library)

### Domain Logic

- **Seeded RNG:** Deterministic case generation
- **Branded IDs:** Type-safe entity references
- **Discriminated Unions:** 25+ evidence types
- **Reasoning Engine:** Evidence scoring, contradiction detection, alibi validation
- **Validator:** Ensures all generated cases are solvable

---

## 📂 Project Structure

```
detective-engine/
├── src/
│   ├── domain/          # Core types (Evidence, Person, Case, Hypothesis)
│   ├── engine/
│   │   ├── case.ts      # Case aggregate
│   │   ├── generator/   # Procedural case generation
│   │   ├── validator/   # Case logic validation
│   │   ├── reasoning/   # Hypothesis evaluation
│   │   ├── contradiction/ # Conflict detection
│   │   ├── alibi/       # Alibi verification
│   │   └── opportunity/ # Opportunity analysis
│   ├── infrastructure/
│   │   └── random.ts    # Seeded PRNG
│   ├── api/
│   │   └── app.ts       # Fastify REST API
│   └── server.ts        # HTTP entry point
│
├── frontend/
│   └── src/
│       ├── App.tsx      # Main investigation UI
│       ├── App.css      # Glassmorphism styles
│       └── lib/
│           └── api.ts   # API client
│
├── tests/               # Unit & integration tests
├── docs/
│   └── PRD.md          # Full product requirements (2769 lines)
└── package.json
```

---

## ⌨️ Keyboard Shortcuts

| Key      | Action                |
| -------- | --------------------- |
| `Ctrl+K` | Open search           |
| `E`      | Evidence tab          |
| `T`      | Timeline tab          |
| `S`      | Suspects tab          |
| `A`      | Analysis tab          |
| `G`      | Toggle scan animation |
| `Esc`    | Close overlays        |

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Type check
npm run typecheck
```

**Test Coverage:**

- ✅ Domain primitives (branded IDs, timestamps, discriminated unions)
- ✅ Case generation (same seed → same case)
- ✅ Validator (culprit exists, evidence links truth, timeline valid)
- ✅ Reasoning engine (scoring, confidence levels, explanations)
- ✅ API integration (generate, inspect, accuse, result)

---

### Explainable Reasoning

Every score/confidence has a reason:

```
Confidence: 82%

Supporting Evidence:
✓ CCTV places Marcus near crime scene (reliability: 96%)
✓ Fingerprint verified (reliability: 92%)

Contradicting Evidence:
⚠ Witness claims Marcus left earlier (reliability: 62%)

Conclusion: Strongly supported, but not conclusive.
```

---

**Built with:**

- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Fastify](https://www.fastify.io/) — Fast web framework
- [React](https://react.dev/) — UI library
- [Framer Motion](https://www.framer.com/motion/) — Animation library
- [Vite](https://vitejs.dev/) — Build tool
- [Vitest](https://vitest.dev/) — Testing framework

---

<div align="center">

**CASE//NULL** — _Every contradiction leaves a trace._

Made with TypeScript, and logic.

</div>
