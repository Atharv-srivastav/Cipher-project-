# System Architecture — LLD Practice Platform

## 1. Architectural Overview & Style

The **LLD Practice Platform** is built as a **Modular Monolith** with clean Layered (Hexagonal / Clean Architecture) boundaries. This architecture achieves maximum maintainability and domain purity for an LLD assignment without introducing the complexity of microservices or distributed infrastructure.

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
|   Value Objects: Score, SubmissionContent, SOLIDViolation              |
|   Interfaces: IEvaluationStrategy, IRepository, ISubmissionParser     |
+-----------------------------------------------------------------------+
                                   | Implementations
+-----------------------------------------------------------------------+
|                         INFRASTRUCTURE LAYER                          |
|   Evaluation Engines: RuleBasedEvaluator | LLMEvaluator | Fallback     |
|   Persistence: SQLite / JSON File Repository (Better-SQLite3 / Custom)|
|   LLM Gateway: Google Gemini API Client + Schema Guard                |
+-----------------------------------------------------------------------+
```

---

## 2. Layer Responsibilities & Isolation Rules

1. **Domain Layer (`src/domain/`)**:
   - **Rule**: Absolute zero external framework dependencies (pure TypeScript).
   - Contains core business entities (`Problem`, `Attempt`, `Submission`, `Evaluation`), state machine transitions, value objects, and evaluation strategy interfaces.
2. **Application Layer (`src/application/`)**:
   - Orchestrates use cases (e.g. `SubmitAttemptUseCase`).
   - Receives DTOs from API layer, invokes domain entities, calls persistence and evaluation interfaces, and returns output DTOs.
3. **Infrastructure Layer (`src/infrastructure/`)**:
   - Implements evaluation strategies (`RuleBasedEvaluator`, `LLMEvaluator`, `FallbackEvaluator`).
   - Implements database repository persistence (`SqliteAttemptRepository`, `JsonFileProblemRepository`).
   - Handles external network calls (Google Gemini API).
4. **API Layer (`src/api/`)**:
   - Express controllers, request validation middleware (Zod / custom schema), HTTP status mapping, error handlers.
5. **Frontend Layer (`src/frontend/`)**:
   - React components, state hooks, visual presentation, live Mermaid diagram renderer.

---

## 3. Extensibility Design Patterns

### A. Evaluation Engine Extensibility (Strategy Pattern)
The core evaluation subsystem is decoupled via `IEvaluationStrategy`.

```
                  +-----------------------+
                  | IEvaluationStrategy   |
                  +-----------------------+
                  | + id: string          |
                  | + evaluate(...)       |
                  +-----------------------+
                              ^
                              |
        +---------------------+---------------------+
        |                     |                     |
+-------------------+ +-------------------+ +-------------------+
| RuleBasedEvaluator| |   LLMEvaluator    | | FallbackEvaluator |
+-------------------+ +-------------------+ +-------------------+
| Deterministic     | | Semantic Gemini   | | Offline Heuristic |
| Structure Checks  | | Prompt Evaluation | | Fallback          |
+-------------------+ +-------------------+ +-------------------+
```

- **Adding a new evaluator**: Implement `IEvaluationStrategy` (e.g., `StaticAnalysisEvaluator` or `OpenAIEvaluator`) and register it in `EvaluationService`. The application layer requires zero code modifications.

### B. Submission Format Extensibility (Polymorphic Submission Content)
The system models `SubmissionContent` to support diverse representation styles:

```typescript
export interface ISubmissionContent {
  readonly format: 'structured_classes' | 'raw_code' | 'mermaid_uml' | 'composite';
  toNormalizedText(): string;
  extractClasses(): ExtractedClass[];
}
```

This allows adding visual canvas representations or language-specific AST parsers seamlessly in the future.

---

## 4. Asynchronous Evaluation & Resiliency Architecture

```
User Click "Submit"
        |
        v
POST /api/attempts/:id/submit
        |
        v
Set State: SUBMITTED -> EVALUATING
        |
        +---> Run RuleBasedEvaluator (Deterministic, Sync sub-10ms)
        |
        +---> Invoke LLMEvaluator (Async Gemini Call with 8s Timeout)
                   |
         +---------+---------+
         | (Success)         | (Failure / Timeout / No API Key)
         v                   v
   Return Gemini     Switch to FallbackEvaluator
   JSON Feedback     Return Rule-Based + Mock Feedback
         |                   |
         +---------+---------+
                   |
                   v
        Aggregate Scores & Criteria
                   |
                   v
        Set State: EVALUATED
                   |
                   v
        Persist & Return Response to Client
```

### Resiliency Boundaries
- If LLM API call throws network exception, rate limit (HTTP 429), or JSON parse failure:
  1. The exception is caught inside `LLMEvaluator`.
  2. Logged with detailed diagnostic context.
  3. `EvaluationAggregator` seamlessly falls back to `FallbackEvaluator`.
  4. The attempt status transitions cleanly to `EVALUATED` with flag `isFallback: true`.
  5. **Result**: Zero crashes, zero hanging UI states, 100% submission completion.

---

## 5. Security & Input Sanitization
- **Prompt Injection Defense**: User design rationale text is wrapped in strict XML delimiter boundaries (`<candidate_input>...</candidate_input>`) before being injected into LLM system prompts. System instructions explicitly command the LLM to ignore instructions inside candidate inputs.
- **Structured LLM Output Enforcement**: Responses from LLM are validated against a strict schema (`JSON Schema`). Malformed responses trigger retry or fallback.
- **No Code Execution**: Code blocks provided by learners are parsed purely as text/AST. No `eval()`, `vm`, or process execution occurs on the server.
