# Database Schema Specification — LLD Practice Platform

## 1. Persistence Strategy & Selection
For this LLD Practice Platform MVP, we use **SQLite** (or a file-backed JSON/SQLite storage layer via `better-sqlite3` or local file persistence).

### Rationale
- **Zero Configuration**: No complex external DB server setup (PostgreSQL/MySQL) required to clone and run the project.
- **Relational Integrity**: Enforces strict foreign keys, unique constraints, and schema validation.
- **ACID Compliance**: Instant synchronous writes for attempt state transitions.

---

## 2. Entity-Relationship (ER) Diagram

```
 +------------------+           +----------------------+
 |      USERS       |           |       PROBLEMS       |
 +------------------+           +----------------------+
 | PK id            |           | PK id                |
 |    email         |           |    title             |
 |    name          |           |    slug              |
 +--------+---------+           |    difficulty        |
          |                     |    description       |
          | 1                   |    requirements_json |
          |                     +----------+-----------+
          | N                              | 1
          +--------------+-----------------+
                         |
                         v N
                +------------------+
                |     ATTEMPTS     |
                +------------------+
                | PK id            |
                | FK user_id       |
                | FK problem_id    |
                |    attempt_num   |
                |    status        |
                |    created_at    |
                |    updated_at    |
                +--------+---------+
                         |
                         | 1
                         +-----------------------+
                         |                       |
                         v 1                     v 1
                +------------------+    +-------------------+
                |   SUBMISSIONS    |    |    EVALUATIONS    |
                +------------------+    +-------------------+
                | PK id            |    | PK id             |
                | FK attempt_id    |    | FK attempt_id     |
                |    format        |    |    overall_score  |
                |    content_json  |    |    evaluator_mode |
                |    submitted_at  |    |    evaluated_at   |
                +------------------+    +---------+---------+
                                                  | 1
                                                  |
                                                  v N
                                        +-------------------+
                                        |  FEEDBACK_ITEMS   |
                                        +-------------------+
                                        | PK id             |
                                        | FK evaluation_id  |
                                        |    category       |
                                        |    type           |
                                        |    title          |
                                        |    description    |
                                        |    evidence       |
                                        +-------------------+
```

---

## 3. Table Definitions & Constraints

### 3.1 `users`
Stores learner profiles.
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 `problems`
Stores LLD problem definitions and specifications.
```sql
CREATE TABLE problems (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    difficulty TEXT CHECK(difficulty IN ('EASY', 'MEDIUM', 'HARD')) NOT NULL,
    short_description TEXT NOT NULL,
    requirements_json TEXT NOT NULL, -- JSON array of requirement strings
    expected_entities_json TEXT NOT NULL, -- JSON array of expected entity names
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 `attempts`
Tracks learner attempts per problem.
```sql
CREATE TABLE attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    status TEXT CHECK(status IN ('DRAFT', 'SUBMITTED', 'EVALUATING', 'EVALUATED', 'FAILED')) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attempts_user_problem ON attempts(user_id, problem_id);
```

### 3.4 `submissions`
Stores submission content payload (classes, responsibilities, relationships, code, diagram).
```sql
CREATE TABLE submissions (
    id TEXT PRIMARY KEY,
    attempt_id TEXT NOT NULL UNIQUE REFERENCES attempts(id) ON DELETE CASCADE,
    format TEXT NOT NULL DEFAULT 'structured_classes',
    content_json TEXT NOT NULL, -- Serialized SubmissionContent JSON
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 3.5 `evaluations`
Stores evaluation results and scores.
```sql
CREATE TABLE evaluations (
    id TEXT PRIMARY KEY,
    attempt_id TEXT NOT NULL UNIQUE REFERENCES attempts(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK(overall_score BETWEEN 0 AND 100),
    evaluator_mode TEXT CHECK(evaluator_mode IN ('HYBRID_AI', 'RULE_BASED_FALLBACK', 'RULE_BASED_ONLY')) NOT NULL,
    criteria_json TEXT NOT NULL, -- JSON map of category scores (Responsibilities, SOLID, etc.)
    summary TEXT NOT NULL,
    evaluated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 3.6 `feedback_items`
Stores fine-grained feedback items (strengths, weaknesses, SOLID observations, design suggestions).
```sql
CREATE TABLE feedback_items (
    id TEXT PRIMARY KEY,
    evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    category TEXT CHECK(category IN ('STRENGTH', 'WEAKNESS', 'SOLID_OBSERVATION', 'PATTERN_SUGGESTION', 'EXTENSIBILITY_HINT')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT, -- Quoted text from submission
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Pre-Seeded Problem Data
The database is initialized with 5 problem records:
1. `prob-parking-lot`: *Design a Parking Lot* (Medium)
2. `prob-elevator`: *Design an Elevator Management System* (Hard)
3. `prob-vending-machine`: *Design a Vending Machine* (Easy)
4. `prob-rate-limiter`: *Design an In-Memory Rate Limiter* (Medium)
5. `prob-notification-service`: *Design a Distributed Notification Service* (Medium)
