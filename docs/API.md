# REST API Specification — LLD Practice Platform

## 1. API Architecture & Standards
- **Base URL**: `/api`
- **Protocol**: HTTP/1.1 REST over JSON
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Standard HTTP Status Codes**:
  - `200 OK`: Request succeeded.
  - `201 Created`: Resource successfully created.
  - `400 Bad Request`: Validation error or invalid payload.
  - `404 Not Found`: Resource does not exist.
  - `500 Internal Server Error`: Uncaught server exception.

---

## 2. API Endpoints

### 2.1 Problems API

#### `GET /api/problems`
Fetch list of available LLD problems.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "prob-parking-lot",
      "title": "Design a Parking Lot",
      "slug": "design-parking-lot",
      "difficulty": "MEDIUM",
      "shortDescription": "Design an automated multi-floor parking lot system handling multiple vehicle types, spot assignment strategies, and ticket calculation.",
      "expectedEntities": ["ParkingLot", "ParkingFloor", "ParkingSpot", "Vehicle", "Ticket", "Payment"]
    }
  ]
}
```

#### `GET /api/problems/:id`
Fetch detailed problem specification by ID or slug.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "prob-parking-lot",
    "title": "Design a Parking Lot",
    "slug": "design-parking-lot",
    "difficulty": "MEDIUM",
    "shortDescription": "...",
    "requirements": [
      "Support multiple vehicle types: Motorcycle, Car, Bus.",
      "Support multiple floors with designated spot sizes (Small, Medium, Large).",
      "Flexible spot assignment strategy (First-Available, Nearest to Entrance).",
      "Hourly pricing strategy with ticket validation upon exit."
    ],
    "expectedEntities": ["ParkingLot", "ParkingFloor", "ParkingSpot", "Vehicle", "Ticket", "PaymentService", "SpotAssignmentStrategy"]
  }
}
```

---

### 2.2 Practice & Attempts API

#### `POST /api/attempts`
Initialize a new practice attempt for a problem.
- **Request Body**:
```json
{
  "userId": "user-101",
  "problemId": "prob-parking-lot"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "id": "att-884920",
    "userId": "user-101",
    "problemId": "prob-parking-lot",
    "attemptNumber": 1,
    "status": "DRAFT",
    "createdAt": "2026-09-10T10:00:00Z"
  }
}
```

#### `GET /api/attempts/:id`
Fetch attempt state and draft content.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "att-884920",
    "status": "DRAFT",
    "submission": {
      "classes": [],
      "relationships": [],
      "designPatterns": [],
      "rationale": ""
    }
  }
}
```

#### `PATCH /api/attempts/:id`
Save draft changes to an in-progress attempt.
- **Request Body**:
```json
{
  "classes": [
    {
      "name": "ParkingLot",
      "stereotype": "Entity",
      "responsibilities": "Manages floors and entry gates",
      "attributes": ["id: string", "floors: ParkingFloor[]"],
      "methods": ["parkVehicle(v: Vehicle): Ticket", "unparkVehicle(t: Ticket): Payment"]
    }
  ],
  "relationships": [
    {
      "source": "ParkingLot",
      "target": "ParkingFloor",
      "type": "Composition"
    }
  ],
  "designPatterns": ["Strategy Pattern for Spot Assignment"],
  "rationale": "Used Strategy pattern so spot allocation logic can be swapped without modifying ParkingLot class.",
  "codeSnippet": "public class ParkingLot { ... }",
  "mermaidDiagram": "classDiagram\nParkingLot *-- ParkingFloor"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Draft updated successfully",
  "data": { "updatedAt": "2026-09-10T10:02:15Z" }
}
```

---

### 2.3 Submission & Evaluation API

#### `POST /api/attempts/:id/submit`
Submit an attempt for evaluation. Triggers hybrid evaluation pipeline.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "attemptId": "att-884920",
    "status": "EVALUATED",
    "evaluation": {
      "id": "eval-9921",
      "overallScore": 85,
      "evaluatorMode": "HYBRID_AI",
      "summary": "Solid design with good use of Strategy Pattern. Clear separation between ParkingFloor and Spot assignment.",
      "criteria": {
        "responsibilities": 9,
        "abstraction": 8,
        "coupling": 8,
        "solid": 9,
        "designPatterns": 9,
        "extensibility": 8
      },
      "feedbackItems": [
        {
          "category": "STRENGTH",
          "title": "Clean Strategy Pattern Usage",
          "description": "SpotAssignmentStrategy interface successfully decouples spot searching algorithm.",
          "evidence": "Class SpotAssignmentStrategy declared as Interface."
        },
        {
          "category": "SOLID_OBSERVATION",
          "title": "SRP Followed",
          "description": "Payment logic is isolated from Ticket management.",
          "evidence": "PaymentService class separated from Ticket entity."
        }
      ]
    }
  }
}
```

#### `GET /api/attempts/:id/evaluation`
Retrieve existing evaluation results for an attempt.
- **Response `200 OK`**: Same evaluation payload as submission.

#### `POST /api/attempts/:id/retry-evaluation`
Force re-trigger evaluation (e.g. to retry AI evaluation after network recovery).
- **Response `200 OK`**: Updated evaluation payload.

---

### 2.4 History API

#### `GET /api/history`
Fetch learner attempt history across all problems.
- **Query Parameters**: `userId` (default `user-101`), `problemId` (optional).
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "attemptId": "att-884920",
      "problemId": "prob-parking-lot",
      "problemTitle": "Design a Parking Lot",
      "attemptNumber": 1,
      "status": "EVALUATED",
      "score": 85,
      "evaluatorMode": "HYBRID_AI",
      "submittedAt": "2026-09-10T10:05:00Z"
    }
  ]
}
```
