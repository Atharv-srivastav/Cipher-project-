# Technical Design — Domain Model & LLD Architecture

## 1. Domain Model Overview

The core domain model of the **LLD Practice Platform** is built following strict **Object-Oriented Analysis & Design (OOAD)** and **Domain-Driven Design (DDD)** principles. Business rules, state transitions, and evaluation strategies reside exclusively within domain entities and value objects—completely isolated from framework details.

```
                      +-------------------+
                      |      User         |
                      +-------------------+
                               | 1
                               |
                               | N
                      +-------------------+
                      |     Problem       |
                      +-------------------+
                               | 1
                               |
                               | N
                      +-------------------+
                      |     Attempt       | <--- (State Machine)
                      +-------------------+
                               | 1
                               |
                               | 1
                      +-------------------+
                      |    Submission     |
                      +-------------------+
                               | 1
                               |
                               | 1
                      +-------------------+
                      |    Evaluation     |
                      +-------------------+
                               | 1
                               |
                               | N
                      +-------------------+
                      |   FeedbackItem    |
                      +-------------------+
```

---

## 2. Core Domain Classes & Responsibilities

### 2.1 `Problem` (Aggregate Root)
- **Role**: Represents an LLD practice challenge.
- **Responsibilities**:
  - Maintains domain requirements and expected domain entity signatures.
  - Validates whether candidate class names match problem domain expectations.
- **Key Methods**:
  - `getMissingEntities(candidateClasses: string[]): string[]`
  - `hasRequirement(reqId: string): boolean`

### 2.2 `Attempt` (Aggregate Root & State Machine)
- **Role**: Represents a candidate's iterative practice session for a problem.
- **Responsibilities**:
  - Enforces state transitions and invariants.
  - Maintains attempt counter increment logic.
- **State Machine**:
  ```
  DRAFT ----(submit)----> SUBMITTED ----(startEval)----> EVALUATING
                                                            |
                                               +------------+------------+
                                               | (success)               | (error)
                                               v                         v
                                           EVALUATED                  FAILED
  ```
- **Invariants**:
  - Cannot submit an attempt if status is already `SUBMITTED` or `EVALUATING`.
  - Cannot transition to `EVALUATED` without a non-null `Evaluation` payload.

### 2.3 `Submission` (Entity)
- **Role**: Holds candidate's design submission payload.
- **Responsibilities**:
  - Encapsulates classes, responsibilities, relationships, design patterns, code snippets, and Mermaid diagrams.
  - Validates basic structural completeness (e.g. at least 1 class defined, non-empty rationale).
- **Key Methods**:
  - `isEmpty(): boolean`
  - `getClassCount(): number`
  - `hasDesignPatterns(): boolean`

### 2.4 `Evaluation` (Value Object / Aggregate)
- **Role**: Encapsulates evaluation outcome and feedback.
- **Responsibilities**:
  - Calculates overall weighted score across 6 categories.
  - Maintains explainability evidence and feedback items.
- **Score Calculation Formula**:
  $$\text{Score} = \sum (\text{CategoryScore}_i \times \text{Weight}_i)$$
  - *Responsibilities*: 20%
  - *Abstraction & Interfaces*: 20%
  - *Coupling & Cohesion*: 20%
  - *SOLID Principles*: 20%
  - *Design Patterns*: 10%
  - *Extensibility*: 10%

---

## 3. Evaluation Architecture & Strategy Pattern

```
                       +------------------------+
                       |  IEvaluationStrategy   |
                       +------------------------+
                       | + evaluate(...)        |
                       +------------------------+
                                   ^
                                   |
         +-------------------------+-------------------------+
         |                                                   |
+--------------------------+                       +--------------------------+
|   RuleBasedEvaluator     |                       |       LLMEvaluator       |
+--------------------------+                       +--------------------------+
| Structural verification, |                       | Semantic reasoning via   |
| Entity checks,           |                       | Gemini API schema guard, |
| Interface checks         |                       | SOLID analysis           |
+--------------------------+                       +--------------------------+
```

### `EvaluationService` (Domain Service & Aggregator)
The `EvaluationService` acts as the coordinator:
1. Calls `RuleBasedEvaluator` synchronously to extract deterministic scores (structural checks, missing entities, duplicate classes).
2. If `RuleBasedEvaluator` identifies an empty or invalid submission, evaluation returns immediately with score 0 (saving AI token costs).
3. Otherwise, invokes `LLMEvaluator`.
4. If `LLMEvaluator` succeeds, merges deterministic + AI insights.
5. If `LLMEvaluator` fails (network error / rate limit / unconfigured API key), seamlessly activates `FallbackEvaluator`.

---

## 4. SOLID Principles in Platform Design

1. **Single Responsibility Principle (SRP)**:
   - `Attempt` manages state transitions only.
   - `RuleBasedEvaluator` performs structural checks only.
   - `LLMEvaluator` handles Gemini API communications and schema parsing only.
2. **Open-Closed Principle (OCP)**:
   - New evaluators (e.g. `ClaudeEvaluator`) can be added by implementing `IEvaluationStrategy` without touching existing application logic.
3. **Liskov Substitution Principle (LSP)**:
   - `FallbackEvaluator`, `RuleBasedEvaluator`, and `LLMEvaluator` are completely interchangeable as `IEvaluationStrategy` instances.
4. **Interface Segregation Principle (ISP)**:
   - Separate interfaces for `IEvaluationStrategy`, `ISubmissionRepository`, and `IProblemRepository`.
5. **Dependency Inversion Principle (DIP)**:
   - Application layer depends on abstractions (`IEvaluationStrategy`), not concrete API implementations.

---

## 5. Failure Handling & Extensibility Invariants
- **Zero UI Lock**: AI evaluation failures fallback to `FallbackEvaluator` within < 100ms.
- **Explainability**: Every feedback item contains an explicit `evidence` field citing the candidate's exact class name or design text.
