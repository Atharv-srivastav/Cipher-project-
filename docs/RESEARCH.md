# Research & Synthesis — LLD Practice Platforms & Evaluation Engineering

## 1. Context & Industry Landscape

### How Developers Currently Practice Low-Level Design (LLD)
Low-Level Design (LLD) or Object-Oriented Design (OOD) is a critical technical interview benchmark for mid-to-senior software engineers. Currently, candidates prepare using fragmented resources:
- **Static Reading**: Books such as *Head First Design Patterns*, *Clean Code*, and repositories like *grokking-object-oriented-design-interview*.
- **Whiteboarding / Text Editors**: Drawing UML diagrams on Google Drawings, Excalidraw, or typing plain text class outlines in Notion/Google Docs.
- **Mock Interviews**: Human-to-human mock interviews (Pramp, Interviewing.io), which are non-scalable, high friction, and often inconsistent in feedback quality.

### Existing Platforms & Tools
- **LeetCode / HackerRank**: Excellent for DSA (Data Structures & Algorithms) with instant test-case verification, but inadequate for LLD because LLD cannot be fully verified by unit tests alone (a solution can pass test cases while violating SOLID principles, having god objects, tight coupling, or zero abstraction).
- **UML & Diagramming Tools (Lucidchart, PlantUML, Mermaid)**: Great for drawing diagrams, but offer **zero automated evaluation or pedagogical feedback**.
- **AI Code Assistants (ChatGPT, Claude, Copilot)**: Learners paste prompt outlines into ChatGPT, but standard LLMs provide unstructured, overly polite, or inconsistent feedback without deterministic structural checks.

---

## 2. Core Learner Pain Points in LLD Practice
1. **Uncertainty of Solution Validity**: Unlike DSA where output is boolean (Pass/Fail), LLD has multiple valid solutions (e.g., using Strategy Pattern vs Factory Pattern). Learners struggle to assess if their trade-offs are sound.
2. **God Objects & Over-engineering**: Learners either put all business logic into a single monolithic manager class or over-engineer with 15 unnecessary interfaces for a simple problem.
3. **Passive Reading vs Active Practice**: Reading solved LLD examples gives a false sense of mastery. Real retention requires active design drafting, responsibility assignment, and immediate feedback.
4. **Lack of Explainable Criteria**: Generic feedback ("Good design!") does not help. Learners need targeted feedback on **Cohesion, Coupling, SOLID principles, and Responsibility assignment**.

---

## 3. Core Research Questions Answered

### Q1: What does a learner actually need to provide for an LLD attempt to be meaningful?
To meaningfully evaluate an LLD attempt, the system requires more than just a single text box or code snippet. A structured attempt must capture:
1. **Domain Entities & Classes**: Core domain objects, data fields, and methods.
2. **Responsibilities & Stereotypes**: Explicit mapping of what each class is responsible for (e.g., `PaymentProcessor` manages payment gateway communication; `BookingManager` manages spot allocation).
3. **Relationships & Interfaces**: Explicit connections (Inheritance, Composition, Aggregation, Realization).
4. **Design Justification**: Explanation of design patterns chosen (e.g., Strategy pattern for pricing engine) and trade-offs considered.
5. **Code / Diagram (Optional)**: TypeScript/Java class skeletons or Mermaid UML representation.

### Q2: What makes feedback useful when multiple LLD solutions can be valid?
Useful LLD feedback must be:
- **Criterion-Based, Not Benchmark-Rigid**: Evaluate against principles (SOLID, High Cohesion, Low Coupling, Extensibility) rather than matching an exact solution template.
- **Explainable with Evidence**: Point out specific lines or class names (e.g., *"Class `ParkingLotManager` is performing spot searching, payment calculation, and ticket printing. Consider splitting into `SpotAllocationStrategy` and `PaymentService`"*).
- **Actionable & Non-Punitive**: Categorize feedback into Strengths, Violations/Weaknesses, and Concrete Next Steps.

### Q3: Which evaluation criteria should be deterministic?
Deterministic (rule-based) engines are cheap, fast (sub-10ms), and 100% predictable. They should evaluate:
- **Structural Completeness**: Presence of core required entities mentioned in the problem prompt.
- **Empty / Garbage Submissions**: Detection of blank inputs, ultra-short text (<20 words), or placeholder text.
- **Interface & Abstraction Usage**: Checking if interfaces are defined and implemented.
- **Duplicate / Conflicting Names**: Class name collisions or missing relationship targets.
- **State Validation**: Ensuring submission invariants are met before invoking AI.

### Q4: Which criteria benefit from an LLM?
LLMs excel at semantic, contextual reasoning. LLMs should evaluate:
- **Responsibility Distribution**: Identifying "God Objects" or bloated classes based on natural language responsibility descriptions.
- **SOLID Principle Violations**: Detecting Single Responsibility (SRP) or Open-Closed (OCP) breaches in design rationale.
- **Design Pattern Appropriateness**: Evaluating whether a pattern (e.g. Factory, Strategy, Observer) was applied correctly or over-engineered.
- **Extensibility & Future Change Scenarios**: Reasoning about how easily the design adapts to new requirements (e.g., adding Electric Vehicle spots to a Parking Lot).

### Q5: How can another evaluator be added later?
By adhering to the **Strategy Pattern** (`IEvaluationStrategy` interface):
```typescript
export interface IEvaluationStrategy {
  readonly id: string;
  readonly name: string;
  evaluate(submission: Submission, problem: Problem): Promise<EvaluationResult>;
}
```
New evaluators (e.g., `StaticAnalysisEvaluator`, `PeerReviewEvaluator`, `ClaudeLLMEvaluator`) can be registered into `EvaluationService` without touching existing business logic (Open-Closed Principle).

### Q6: How can another submission format be added later?
By introducing an abstract `SubmissionContent` polymorphism / discriminated union:
```typescript
export type SubmissionFormat = 'structured_text' | 'code_snippet' | 'mermaid_uml' | 'interactive_canvas';
```
The `ISubmissionParser` interface normalizes diverse input formats into a standardized `NormalizedDomainModel` consumed by the evaluators.

### Q7: What should happen if evaluation is slow or fails?
To prevent broken user experience when LLM APIs time out, rate-limit, or crash:
1. **Fallback Strategy**: The system automatically captures LLM failures and routes execution to `FallbackEvaluator` (deterministic rule-based evaluator + structured mock heuristic).
2. **Explicit User Messaging**: The UI clearly displays a banner: *"Evaluated via Rule-Based Engine (AI API fallback active)"*.
3. **Retry Mechanism**: The learner can click "Retry AI Evaluation" once the network/API key issue is resolved, updating the existing attempt without losing work.
