# Testing Strategy & Execution — LLD Practice Platform

## 1. Overview & Test Architecture

The **LLD Practice Platform** includes automated unit, integration, and failure-mode testing using **Vitest**.

```
+-------------------------------------------------------------+
|                      API INTEGRATION TESTS                  |
|          Endpoints: /api/problems, /api/attempts, etc.      |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                    EVALUATION ENGINE TESTS                  |
|    RuleBasedEvaluator | LLMEvaluator | FallbackEvaluator    |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                     DOMAIN UNIT TESTS                       |
|   Entities: Problem, Attempt State Machine, Submission      |
+-------------------------------------------------------------+
```

---

## 2. Test Suites Matrix

| Test Suite | Location | Target Domain / Component | Description |
| :--- | :--- | :--- | :--- |
| **Domain Tests** | `tests/domain/` | `Attempt`, `Submission`, `Problem` | Verifies state machine transitions (`DRAFT` → `SUBMITTED` → `EVALUATED`), invalid state transition errors, draft update invariants, and entity completeness logic. |
| **Rule-Based Evaluator Tests** | `tests/evaluation/rule-based.test.ts` | `RuleBasedEvaluator` | Tests structural checks: empty submissions, missing core entities, duplicate class names, interface checking. |
| **LLM Fallback Tests** | `tests/evaluation/fallback.test.ts` | `LLMEvaluator`, `FallbackEvaluator` | Verifies that when LLM fails or API key is missing, evaluation falls back gracefully to `FallbackEvaluator` without throwing unhandled exceptions. |
| **API Route Integration Tests** | `tests/api/routes.test.ts` | Express API Endpoints | Tests full HTTP request/response cycle for problems list, attempt creation, submission, and history retrieval. |
| **Edge Case Tests** | `tests/edge-cases/` | Edge Cases | Tests ultra-large submissions, malformed JSON inputs, prompt injection attempts, and 0-class submissions. |

---

## 3. Key Test Cases

### 3.1 Attempt State Machine Tests
- `should initialize attempt in DRAFT status`
- `should transition from DRAFT to SUBMITTED upon submission`
- `should transition from SUBMITTED to EVALUATING and EVALUATED`
- `should throw error if attempting to re-submit an already EVALUATED attempt`

### 3.2 Evaluation Strategy Tests
- `RuleBasedEvaluator should detect 0-class submission and assign 0 score`
- `RuleBasedEvaluator should detect missing entities for Parking Lot (e.g. SpotAssignmentStrategy)`
- `FallbackEvaluator should return structured feedback with fallback banner`
- `LLMEvaluator should handle network timeout by triggering fallback`

### 3.3 Security & Edge Case Tests
- `should sanitize prompt injection payloads containing system commands`
- `should handle 500kb submission payload without server lag`

---

## 4. How to Run Tests

### Command to run all tests:
```bash
npm test
```

### Command to run tests in watch mode:
```bash
npm run test:watch
```

### Command to generate coverage report:
```bash
npm run test:coverage
```
