# Requirements Analysis — LLD Practice Platform

## 1. Executive Summary
This document serves as the primary requirements baseline for the **LLD Practice Platform**. The platform is designed to provide developers with a focused, iterative practice environment for Low-Level Object-Oriented System Design (LLD). It addresses the core learner journey:
> **Choose Problem → Think/Design → Submit → Get Feedback → Review → Try Again**

---

## 2. Extracted Requirements & Deliverables Matrix

| ID | Requirement Category | Requirement Description | Priority |
| :--- | :--- | :--- | :--- |
| **REQ-01** | Core Learner Journey | Enable problem selection, design input, submission, automated hybrid feedback, and review loop. | **MUST HAVE** |
| **REQ-02** | Problem Discovery | Provide a curated list of LLD problems with title, difficulty, short description, requirements, and expected domain entities/behavior. | **MUST HAVE** |
| **REQ-03** | Practice Workspace | Allow learners to define classes, responsibilities, relationships, interfaces/methods, and design decisions. | **MUST HAVE** |
| **REQ-04** | Multi-modal Inputs | Support text descriptions, structured class forms, optional code snippets, and optional diagram representations (Mermaid / visual notation). | **SHOULD HAVE** |
| **REQ-05** | Submission Lifecycle | Manage explicit attempt states: `DRAFT`, `SUBMITTED`, `EVALUATING`, `EVALUATED`, `FAILED`. | **MUST HAVE** |
| **REQ-06** | Hybrid Evaluation | Combine deterministic rule-based evaluation (structural completeness, entity presence) with LLM semantic design evaluation. | **MUST HAVE** |
| **REQ-07** | Explainable Feedback | Provide numerical overall score, strengths, weaknesses, responsibility issues, coupling/cohesion, SOLID compliance, design pattern observations, and actionable evidence-based hints. | **MUST HAVE** |
| **REQ-08** | Fallback Evaluation | Ensure 100% platform availability if LLM API is slow, missing, or fails — seamlessly fallback to a rule-based/mock evaluator without hanging. | **MUST HAVE** |
| **REQ-09** | Attempt History | Display previous attempts with timestamps, scores, statuses, feedback summaries, and ability to reopen/compare attempts. | **MUST HAVE** |
| **REQ-10** | LLD Domain Model | High-quality domain design in the codebase itself with rich abstractions, value objects, domain state machine, and strategies. | **MUST HAVE** |
| **REQ-11** | API & Persistence | Clean REST API with validated DTOs and lightweight persistent storage for users, problems, attempts, submissions, evaluations. | **MUST HAVE** |
| **REQ-12** | Extensibility | Abstract `EvaluationStrategy` (Rule-based, LLM, Future) and `SubmissionContent` (Text, Code, Diagram) for future extension. | **MUST HAVE** |
| **REQ-13** | Security & Input Safety | Validate inputs, sanitize prompts, protect secrets via `.env`, prevent arbitrary code execution on server. | **MUST HAVE** |
| **REQ-14** | Automated Testing | Comprehensive unit and integration test suite covering domain entities, state transitions, evaluators, API routes, and fallbacks. | **MUST HAVE** |
| **REQ-15** | Documentation | Complete documentation suite (`REQUIREMENTS.md`, `RESEARCH.md`, `PRD.md`, `ARCHITECTURE.md`, `UI_UX.md`, `DATABASE.md`, `API.md`, `DESIGN.md`, `TESTING.md`, `README.md`, `AI_USAGE.md`). | **MUST HAVE** |

---

## 3. Prioritization Matrix

### MUST HAVE (MVP Scope)
1. **Problem Catalog**: Curated LLD problems (Parking Lot, Elevator System, Vending Machine, Rate Limiter, Notification System).
2. **Structured Practice Workspace**:
   - Class Definition Editor (Class Name, Stereotype, Attributes, Methods).
   - Responsibility & Decisions Summary.
   - Relationship Mapper (Inheritance, Composition, Aggregation, Association).
   - Optional Code Block & Mermaid Diagram Preview.
3. **Attempt Lifecycle & State Machine**:
   - Save Draft (`DRAFT`).
   - Submit for Evaluation (`SUBMITTED` → `EVALUATING` → `EVALUATED` / `FAILED`).
4. **Hybrid Evaluation System**:
   - Rule-Based Deterministic Evaluator (Structural validation, missing entity detection, interface usage).
   - LLM Evaluator (Gemini integration with JSON schema constraints).
   - Graceful Fallback Evaluator (Deterministic fallback when LLM fails/unconfigured).
   - Aggregator & Explainable Score Card.
5. **Attempt History & Retries**:
   - List of past attempts with score trends.
   - Re-open attempt to edit and re-evaluate ("Try Again").
6. **Clean Domain Architecture**:
   - OO Domain Model inside `src/domain/`.
   - Separation of concerns: Domain -> Application -> Infrastructure -> API -> UI.

### SHOULD HAVE (High Value Enhancements)
1. Live Mermaid diagram generation from structured class relationships.
2. Direct side-by-side comparison between Attempt 1 and Attempt 2 feedback.
3. Retry evaluation button for failed attempts.

### NICE TO HAVE (Post-MVP / Out of Scope)
1. Multi-user OAuth login / Teams (MVP uses local single-user context `user-default`).
2. Peer code review / social design sharing.
3. Automated code compilation & runtime sandbox execution.
4. Heavy asynchronous distributed job queues (Kafka/RabbitMQ) — MVP uses simple inline async processing.

---

## 4. Scope Boundaries & Anti-Goals
- **NOT an HLD System**: We do not evaluate distributed caching, database partitioning, microservices, load balancing, or CDN topologies. Focus strictly on Object-Oriented Low-Level Design.
- **NOT an LMS**: No course enrollment, video playback, certificates, or payment gateways.
- **NOT a Code Sandbox Compiler**: We do not compile/execute user-written code in a container sandbox. We evaluate code and design descriptions structurally and semantically.

---

## 5. Explicit Assumptions & Clarifications
1. **User Identity**: For the MVP, a default local user (`user-101`) is instantiated so learners can immediately practice without friction.
2. **API Provider**: Google Gemini API (`GEMINI_API_KEY`) is the default primary LLM provider. If `GEMINI_API_KEY` is omitted or invalid, the platform automatically switches to the `FallbackEvaluator` with an explicit banner.
3. **Persistence**: A lightweight file-backed / SQLite embedded database is used, requiring zero external server setup.
4. **Diagram Format**: Mermaid markdown notation is supported for diagram representations.
