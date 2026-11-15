# Product Requirements Document (PRD) — LLD Practice Platform

## 1. Overview & Problem Statement
### Product Vision
To build an interactive, developer-centric platform where engineers can practice Object-Oriented Low-Level Design (LLD) problems with instant, explainable, hybrid (Deterministic + AI) feedback.

### Problem Statement
Software engineers preparing for LLD interviews or seeking to improve object-oriented design skills lack an active practice environment. Existing platforms focus on DSA algorithmic problem solving, while design learning remains passive (reading solution guides). When learners try to design solutions on whiteboards, they receive no structured feedback on their class structures, responsibility assignment, SOLID compliance, or design pattern trade-offs.

---

## 2. Target Learner & Personas
- **Primary Persona**: Mid-to-Senior Software Engineers preparing for LLD technical interviews at top-tier technology companies.
- **Secondary Persona**: Computer Science students and Junior Developers seeking to master object-oriented analysis and design (OOAD) principles.

---

## 3. Product Goals & Non-Goals

### Product Goals
1. **Iterative Practice Loop**: Enable learners to choose an LLD problem, draft class/interface/relationship models, submit, and receive actionable feedback within seconds.
2. **Explainable Hybrid Evaluation**: Combine fast deterministic checks with deep semantic LLM evaluation to provide scores and evidence-backed recommendations.
3. **Resilient Failure Handling**: Ensure 100% platform availability with automatic deterministic fallback if LLM services fail or are unconfigured.
4. **Historical Improvement Tracking**: Allow learners to track scores over multiple attempts and re-try problems to measure growth.

### Non-Goals
- **No Heavy System Architecture / HLD**: No distributed caching, Kafka queues, microservices, or database sharding.
- **No Sandbox Code Execution**: No Docker compilation or execution of candidate code binaries.
- **No Complex LMS Features**: No video tutorials, peer messaging, certificate generation, or paywalls.

---

## 4. User Stories
- **US-1 (Problem Selection)**: As a learner, I want to browse a catalog of LLD problems categorized by difficulty so I can pick a problem matching my skill level.
- **US-2 (Interactive Design Input)**: As a learner, I want a structured design workspace to define classes, attributes, methods, relationships, and design pattern choices so my attempt is clear and organized.
- **US-3 (Live Draft Saving)**: As a learner, I want my work to be saved automatically as a draft so I never lose progress if I navigate away.
- **US-4 (Instant Feedback)**: As a learner, I want structured feedback detailing score, strengths, weaknesses, SOLID observations, and specific code hints upon submitting.
- **US-5 (Attempt History)**: As a learner, I want to view my past attempts and re-open previous designs so I can iteratively refine them ("Try Again").
- **US-6 (Resilient Evaluation)**: As a learner, if AI evaluation is unavailable, I want to receive fallback feedback immediately without the platform breaking.

---

## 5. MVP Feature Specifications

### Feature 1: Problem Catalog
- Displays problem cards with Title, Difficulty tag (Easy, Medium, Hard), Summary, Domain requirements, and Expected Entities/Behavior guide.
- Seeded with 5 iconic LLD problems:
  1. *Design a Parking Lot* (Medium)
  2. *Design an Elevator Management System* (Hard)
  3. *Design a Vending Machine* (Easy)
  4. *Design an In-Memory Rate Limiter* (Medium)
  5. *Design a Distributed Notification Service* (Medium)

### Feature 2: Practice Workspace
- **Problem Statement Panel**: Requirements, constraints, input/output expectations.
- **Structured Class Builder**: Dynamic list of classes with Stereotypes (`Entity`, `Interface`, `AbstractClass`, `Enum`, `Service`), Attributes, Methods.
- **Relationship Editor**: Explicit mapping between classes (`Inheritance`, `Composition`, `Aggregation`, `Association`, `Realization`).
- **Design Patterns & Rationale Text**: Inputs for design pattern rationale (e.g. Strategy, Factory, Observer) and trade-off explanations.
- **Code & Diagram Tab**: Code block editor + live Mermaid UML visual preview.

### Feature 3: Submission & State Machine
- States: `DRAFT` → `SUBMITTED` → `EVALUATING` → `EVALUATED` / `FAILED`.
- Visual progress stepper with loader indicator during evaluation.

### Feature 4: Hybrid Evaluation Engine & Scorecard
- **Overall Score**: 0 to 100 with grade indicator (S, A, B, C, F).
- **Categorized Criteria Scores**:
  - Responsibilities & Class Cohesion (0-10)
  - Abstraction & Interface Segregation (0-10)
  - Coupling & Relationships (0-10)
  - SOLID Principles Alignment (0-10)
  - Design Pattern Application (0-10)
  - Extensibility & Edge Cases (0-10)
- **Detailed Findings**: Strengths, Weaknesses, SOLID Violations, Specific Improvement Actions.
- **Explainability Evidence**: Directly quotes learner's class names and rationale in feedback.

### Feature 5: Attempt History & Retries
- Timeline view of previous attempts per problem.
- Score progression chart/indicators.
- "Try Again" button: Clones previous attempt into a new working draft.

---

## 6. Functional & Non-Functional Requirements

### Functional Requirements
- **FR-1**: Problem listing API endpoint `/api/problems` returning problem definitions.
- **FR-2**: Attempt creation `/api/attempts` and draft update `/api/attempts/:id`.
- **FR-3**: Submission endpoint `/api/attempts/:id/submit` triggering async/sync hybrid evaluation pipeline.
- **FR-4**: Retry evaluation `/api/attempts/:id/retry-evaluation` for failed or fallback attempts.
- **FR-5**: Feedback retrieval `/api/attempts/:id/evaluation`.

### Non-Functional Requirements
- **NFR-1 (Performance)**: Rule-based evaluation completes in < 50ms; LLM hybrid evaluation completes in < 4.0s.
- **NFR-2 (Reliability)**: 100% uptime fallback guarantee; LLM errors automatically yield rule-based fallback evaluation without 500 server crashes.
- **NFR-3 (Usability)**: Dark mode technical studio UI optimized for desktop readability (1280px+).
- **NFR-4 (Security)**: Prompt injection protection (delimiter isolation) when forwarding user inputs to LLM.

---

## 7. Edge Cases & Handling
1. **Empty / Minimal Submission**: Learner clicks submit with 0 classes and empty text. System flags `RuleBasedEvaluator` error and prevents AI token burn.
2. **LLM Timeout / API Quota Exhausted**: System catches error, transitions attempt to `EVALUATED` with `FallbackEvaluator` flag, and displays non-blocking notice.
3. **Invalid Relationship Target**: Learner specifies a relationship to a non-existent class. Deterministic evaluator catches missing target and flags as a structural weakness.
4. **Duplicate Class Names**: Caught by deterministic validator prior to evaluation.

---

## 8. Success Metrics
- **Learner Completion Rate**: > 80% of started attempts move from `DRAFT` to `SUBMITTED`.
- **Retry Rate**: > 40% of learners click "Try Again" to improve their design score.
- **Evaluation Availability**: 100% successful feedback generation (0 stuck submissions).
