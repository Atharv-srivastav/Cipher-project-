# LLD Practice Platform — Object-Oriented System Design Studio

A focused, developer-centric platform designed for software engineers to practice **Low-Level Design (LLD)** and **Object-Oriented Analysis & Design (OOAD)** problems with instant, explainable, hybrid (Deterministic Rule-Based + AI LLM) evaluation.

> **Core Learner Loop:** Choose Problem → Think/Design → Submit → Get Feedback → Review → Try Again

---

## Executive Summary & Problem Statement

### The Problem
Software engineers preparing for Low-Level System Design interviews (e.g. *Design a Parking Lot*, *Design an Elevator System*, *Design a Vending Machine*) lack an active, interactive practice environment. Algorithms platforms (LeetCode, HackerRank) evaluate boolean test-case pass/fail output, which is inadequate for LLD where a solution can pass basic test cases while having god objects, tight coupling, poor abstraction, or zero SOLID principle alignment.

### The Solution
The **LLD Practice Platform** provides a structured design studio where learners model domain classes, define responsibilities, set stereotypes (Entity, Interface, AbstractClass, Enum, Service), specify class relationships, declare applied design patterns, and write architectural trade-offs. 

The platform runs a **Hybrid Evaluation Pipeline**:
1. **RuleBasedEvaluator**: Deterministic, sub-10ms structural verification (class presence, missing core entities, interface usage).
2. **LLMEvaluator**: Deep semantic reasoning via Google Gemini API evaluating SOLID principles, responsibility assignment, coupling, cohesion, and extensibility.
3. **FallbackEvaluator**: 100% resilient offline fallback ensuring zero platform downtime or hanging states if the LLM API is unconfigured or unavailable.

---

## Key Features

- **Problem Catalog**: Curated LLD problems (Parking Lot, Elevator Management System, Vending Machine, In-Memory Rate Limiter, Notification Service) with difficulty tags and expected domain entities.
- **Interactive Practice Studio**:
  - Structured Class & Stereotype Builder.
  - Relationship Connection Mapper (Composition, Inheritance, Realization, Aggregation, Association).
  - Design Pattern Selector (Strategy, Factory, State, Observer, Singleton).
  - Design Rationale & Code Snippet Editors.
  - **Live Mermaid UML Diagram Renderer**: Real-time visualization of candidate class diagrams.
- **Attempt Lifecycle State Machine**: Enforces valid domain state transitions (`DRAFT` → `SUBMITTED` → `EVALUATING` → `EVALUATED` / `FAILED`).
- **Explainable Feedback Dashboard**:
  - Overall Score (0-100) + Grade (S, A, B, C, F).
  - 6-Dimension Score Breakdown (Responsibilities, Abstraction, Coupling/Cohesion, SOLID, Patterns, Extensibility).
  - Evidence-backed Strengths, Weaknesses, and Concrete Action Plan.
- **Attempt History & Progression**: Track past scores per problem and reopen previous designs to re-try ("Try Again").

---

## Tech Stack & Architecture

- **Language & Runtime**: TypeScript 5.7+ & Node.js (v20+)
- **Backend API**: Express.js REST API with clean Layered/Hexagonal Architecture
- **Frontend**: React 18 + Vite + Tailwind/Vanilla CSS Studio Design System
- **Domain Model**: Rich Object-Oriented Domain Model (`Attempt`, `Submission`, `Evaluation`, `Problem`)
- **Evaluation Engine**: Strategy Pattern (`RuleBasedEvaluator`, `LLMEvaluator`, `FallbackEvaluator`)
- **Diagram Engine**: Mermaid.js for live UML rendering
- **Testing**: Vitest for unit & integration testing

```
+-----------------------------------------------------------------------+
|                            PRESENTATION / UI                          |
|                       React 18 + Vite (TypeScript)                    |
+-----------------------------------------------------------------------+
                                   | REST API (JSON)
+-----------------------------------------------------------------------+
|                            API / CONTROLLERS                          |
|                       Express.js Routes & DTO Validation              |
+-----------------------------------------------------------------------+
                                   | Application Commands / Queries
+-----------------------------------------------------------------------+
|                           APPLICATION LAYER                           |
|                    Use Cases & Orchestration Services                 |
|   (GetProblems, StartAttempt, SubmitAttempt, EvaluateAttempt, etc.)   |
+-----------------------------------------------------------------------+
                                   | Domain Invariants
+-----------------------------------------------------------------------+
|                             DOMAIN LAYER                              |
|   Entities: Problem, Attempt, Submission, Evaluation, Feedback        |
|   Value Objects: Score, ClassDefinition, RelationshipDefinition       |
|   Interfaces: IEvaluationStrategy, IRepository, ISubmissionParser     |
+-----------------------------------------------------------------------+
                                   | Implementations
+-----------------------------------------------------------------------+
|                         INFRASTRUCTURE LAYER                          |
|   Evaluation Engines: RuleBasedEvaluator | LLMEvaluator | Fallback     |
|   Persistence: InMemory / SQLite Repository                           |
|   LLM Gateway: Google Gemini API Client + Schema Guard                |
+-----------------------------------------------------------------------+
```

---

## Project Structure

```
.
├── docs/
│   ├── REQUIREMENTS.md      # Comprehensive requirement analysis & checklist
│   ├── RESEARCH.md          # LLD learning pain points & research questions
│   ├── PRD.md               # Product Requirements Document
│   ├── ARCHITECTURE.md      # High-level architecture & strategy patterns
│   ├── UI_UX.md             # Studio design system & UI specifications
│   ├── DATABASE.md          # Relational schema & entity definitions
│   ├── API.md               # REST API endpoints & DTO contracts
│   ├── DESIGN.md            # Technical domain design & SOLID alignment
│   └── TESTING.md           # Testing strategy & test execution matrix
├── src/
│   ├── domain/              # Pure TypeScript domain entities & value objects
│   │   ├── entities/        # Problem, Attempt, Submission, Evaluation
│   │   ├── value-objects/   # ClassDefinition, RelationshipDefinition, FeedbackCriterion
│   │   ├── strategies/      # IEvaluationStrategy interface
│   │   └── repositories/    # IProblemRepository, IAttemptRepository
│   ├── application/         # Use cases (GetProblems, StartAttempt, SubmitAttempt, etc.)
│   ├── infrastructure/      # Repositories & Hybrid Evaluation Engine
│   │   ├── persistence/     # InMemory repositories with seed data
│   │   └── evaluation/      # RuleBasedEvaluator, LLMEvaluator, FallbackEvaluator
│   ├── api/                 # Express controllers and REST routes
│   ├── server/              # Express server index
│   └── frontend/            # React 18 Studio App (Catalog, Workspace, Feedback, History)
├── tests/                   # Vitest unit & integration test suites
│   ├── domain/
│   ├── evaluation/
│   └── api/
├── AI_USAGE.md              # Log of 4 key AI-assisted architectural decisions
├── .env.example             # Environment variables template
├── package.json
└── tsconfig.json
```

---

## Quick Start & Setup Instructions

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: Adding `GEMINI_API_KEY` activates Google Gemini LLM evaluation. If omitted, the platform automatically runs using the deterministic `FallbackEvaluator` without breaking!)*

### 3. Run Development Server
Start both Express API backend (Port 3001) and Vite Frontend (Port 3000):
```bash
npm run dev:full
```
Open **http://localhost:3000** in your browser.

---

## Running Automated Tests

Run the full Vitest suite (Domain model, Rule-based evaluator, Fallback evaluator, API integration):
```bash
npm test
```

---

## Example Learner Journey Walkthrough

1. **Problem Selection**: Navigate to the Problem Catalog and select *"Design a Parking Lot"*.
2. **Design Workspace**:
   - Add classes: `ParkingLot`, `ParkingFloor`, `ParkingSpot`, `Vehicle`, `Ticket`, `PaymentService`, `SpotAssignmentStrategy` (Interface).
   - Connect relationships: `ParkingLot` composition (`*--`) `ParkingFloor`; `ParkingLot` association (`-->`) `SpotAssignmentStrategy`.
   - Select applied design patterns (*Strategy Pattern* for spot allocation).
   - Write design rationale explaining how Open-Closed Principle was satisfied.
   - View live Mermaid UML diagram rendering.
3. **Submission**: Click **Submit Design**. Attempt transitions `DRAFT` → `SUBMITTED` → `EVALUATING` → `EVALUATED`.
4. **Feedback Review**: Examine your 85/100 score, SOLID audit, evidence quotes, and concrete next steps.
5. **History & Re-try**: Reopen the attempt from history, refine class responsibilities, and resubmit to measure improvement.

---

## Evaluation Architecture

| Evaluator | Execution Time | Purpose & Criteria |
| :--- | :--- | :--- |
| `RuleBasedEvaluator` | < 10 ms | Deterministic structural checks: Class count, missing domain entities, interface/abstract class presence, duplicate names. |
| `LLMEvaluator` | 1.5 - 3.5 s | Deep semantic reasoning via Gemini API: Responsibilities, SOLID principles, Coupling, Cohesion, Design Pattern trade-offs. |
| `FallbackEvaluator` | < 10 ms | Resilient offline fallback activated when LLM API is unconfigured or rate-limited. Preserves 100% uptime. |

---

## Key Design Trade-Offs & Decisions

1. **Modular Monolith over Microservices**: Selected a modular monolith with clean architecture layers. This avoids network latency and complex deployment overhead while maintaining clean code separation.
2. **Hybrid Evaluation over Pure LLM**: Pure LLM scoring is non-deterministic and vulnerable to outages. Combining deterministic structural checks with constrained LLM JSON schemas ensures explainability and 100% availability.
3. **In-Process Async Pipeline over Heavy Distributed Queues**: Avoided Redis/RabbitMQ infrastructure for the MVP to ensure trivial one-step local execution (`npm run dev:full`).

---

## License & Attribution
Designed for software engineering assignment submission. Built with TypeScript, React, Vite, Express, and Vitest.
