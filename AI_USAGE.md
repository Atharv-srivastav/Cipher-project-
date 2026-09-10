# AI Usage & Architectural Decision Record

This document details 4 key AI-assisted design and architecture decisions made during the development of the **LLD Practice Platform**.

---

## Decision 1: Evaluation Architecture — Hybrid Deterministic + LLM vs. Pure LLM

### Decision
How should candidate LLD submissions be evaluated to ensure fast, cost-effective, and explainable feedback without risking platform failure?

### AI Suggestion
The AI originally suggested sending the entire candidate submission directly to an LLM prompt and asking the LLM to output a raw numerical score (0-100) and feedback markdown text.

### Decision Taken
**Modified / Partially Rejected**. Instead of relying 100% on the LLM for evaluation:
1. Built a **Hybrid Evaluation System** combining a deterministic `RuleBasedEvaluator` and a semantic `LLMEvaluator`.
2. The `RuleBasedEvaluator` runs first (sub-10ms) to check basic structural constraints (0-class submissions, missing required entities, duplicate class names).
3. The `LLMEvaluator` only runs if structural checks pass, and its output is strictly constrained to a JSON Schema.
4. Added a `FallbackEvaluator` strategy that automatically takes over if the LLM times out or has no API key.

### Reason
Pure LLM scoring is non-deterministic, expensive, vulnerable to prompt injection, and fails completely when offline or rate-limited. The hybrid architecture guarantees 100% platform uptime, zero wasted AI tokens on blank submissions, and explainable evidence.

---

## Decision 2: State Machine for Practice Attempts

### Decision
How should learner progress and attempt state transitions be managed in the domain layer?

### AI Suggestion
The AI suggested using a simple string field `status: 'draft' | 'submitted' | 'evaluated'` directly on a generic database record.

### Decision Taken
**Accepted with Structural Enhancement**. Encapsulated attempt status into an explicit **Domain State Machine** on the `Attempt` aggregate root:
- States: `DRAFT` → `SUBMITTED` → `EVALUATING` → `EVALUATED` / `FAILED`.
- Enforced state transition invariants in pure domain code (e.g. `attempt.submit()`, `attempt.startEvaluation()`, `attempt.completeEvaluation(evaluation)`).

### Reason
Keeping state transition logic inside domain entities prevents illegal state mutations (e.g., re-submitting an in-evaluation attempt) and keeps business rules outside API controllers.

---

## Decision 3: Submission Format Representation — Monolithic Text vs Polymorphic Domain Model

### Decision
How should candidate design inputs (classes, responsibilities, relationships, code, diagrams) be represented in the domain model?

### AI Suggestion
The AI suggested accepting a single monolithic markdown text string from the frontend text editor.

### Decision Taken
**Rejected**. Designed a structured polymorphic domain model (`SubmissionContent`):
- Dynamic `ClassDefinition` array (Name, Stereotype, Responsibilities, Attributes, Methods).
- Dynamic `RelationshipDefinition` array (Source, Target, RelationshipType).
- Design Patterns & Rationale text.
- Optional Code block and live Mermaid UML generator.

### Reason
Structured design representations allow the `RuleBasedEvaluator` to accurately analyze class count, interface usage, and relationship completeness without needing complex regex text parsing. It also enables automatic live rendering of Mermaid UML diagrams.

---

## Decision 4: Asynchronous Job Processing — Redis/BullMQ vs. In-Process Async Pipeline

### Decision
How should evaluation jobs be scheduled and processed?

### AI Suggestion
The AI suggested introducing Redis + BullMQ distributed background queues with worker processes.

### Decision Taken
**Rejected for MVP**. Implemented an in-process asynchronous pipeline (`Promise`-based async Evaluation Pipeline with non-blocking fallback timeouts).

### Reason
Introducing Redis and separate worker processes introduces significant operational overhead and external service dependencies for a 2-day LLD assignment. The in-process async pipeline executes sub-4s LLM calls cleanly without blocking Express request handling, keeping setup trivial (`npm run dev`).
