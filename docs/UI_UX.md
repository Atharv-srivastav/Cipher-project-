# UI/UX Specification — LLD Practice Platform

## 1. Design Philosophy & Aesthetic System

### Visual Identity: "Technical Studio IDE"
The UI is styled as a sleek, professional, developer-focused studio environment. It uses dark slate tones, subtle glassmorphism, crisp borders, monospaced design tokens, and vibrant status badges.

### Core Design Principles
1. **Low Friction Workspace**: Primary focus is on thinking and drafting; UI chrome must never obstruct problem requirements or class entry.
2. **Clear Feedback Hierarchy**: Numerical scores are paired with qualitative color-coded badges (Green = Strengths, Red = Weaknesses, Blue = SOLID Observations, Purple = Patterns).
3. **Explicit State Feedback**: Every state transition (`DRAFT` → `SUBMITTED` → `EVALUATING` → `EVALUATED`) has distinct visual feedback and clear action affordances.
4. **Information Density without Clutter**: Tabbed interfaces in the workspace allow learners to toggle effortlessly between Problem Statement, Class Builder, Code Editor, and Diagram Preview.

---

## 2. Color Palette & Typography Tokens

### Palette Tokens (CSS Custom Properties)
- **Background Base**: `#0f172a` (Slate 900)
- **Surface Elevation 1**: `#1e293b` (Slate 800)
- **Surface Elevation 2**: `#334155` (Slate 700)
- **Accent Primary**: `#6366f1` (Indigo 500)
- **Accent Hover**: `#4f46e5` (Indigo 600)
- **Text Primary**: `#f8fafc` (Slate 50)
- **Text Secondary**: `#94a3b8` (Slate 400)
- **Border Default**: `#334155`
- **Success / High Score**: `#10b981` (Emerald 500)
- **Warning / Medium Score**: `#f59e0b` (Amber 500)
- **Error / Failure**: `#ef4444` (Red 500)

### Typography
- **Primary Font**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
- **Code / Monospace Font**: `JetBrains Mono`, `Fira Code`, `Consolas`, `monospace`

---

## 3. Information Architecture & Key Screens

```
                                  [ Top Navigation Bar ]
                                            |
         +----------------------------------+----------------------------------+
         |                                  |                                  |
 [ Problem Catalog ]              [ Practice Workspace ]              [ Attempt History ]
   - Problem Grid                   - Problem Specs Sidebar              - Past Submissions List
   - Difficulty Filters             - Dynamic Class Builder              - Score Progression
   - Attempt Status Indicators      - Relationship Mapping               - Comparison Modal
                                    - Design Decisions & Patterns
                                    - Live Diagram & Code Preview
                                            |
                                   ( Submit Action )
                                            |
                                  [ Feedback Dashboard ]
                                    - Overall Score Gauge
                                    - Category Radar/Breakdown
                                    - Strengths / Weaknesses
                                    - SOLID Principles Audit
                                    - Concrete Action Plan
```

---

## 4. Detailed Screen Specifications

### Screen 1: Problem Catalog View
- **Header**: Hero title *"Master Low-Level System Design"*, subtitle, difficulty filter buttons (All, Easy, Medium, Hard).
- **Grid Layout**: 2 or 3 column responsive cards.
- **Card Content**: Title, Difficulty badge, estimated time, core domain tags (e.g. `Strategy Pattern`, `State Machine`, `Factory`), last attempt score badge, "Start Practice" CTA button.

### Screen 2: Practice Workspace View (2-Column Split Studio)
- **Left Panel (Problem Context & Requirements)**:
  - Sticky collapsible tabbed panel.
  - Tab 1: Problem Overview & Core Requirements.
  - Tab 2: Expected Entities & Key Behavioral Constraints.
  - Tab 3: Evaluation Criteria Checklist.
- **Right Panel (Interactive Design Studio)**:
  - Top Bar: Action Buttons (*Save Draft*, *Submit for Evaluation*, *Reset*), State Indicator (`DRAFT`).
  - Section 1: **Class & Entity Builder**:
    - Add Class Button (`+ Add Class`).
    - Class Card: Name, Stereotype selector (`Entity`, `Interface`, `Abstract`, `Enum`, `Service`), Responsibilities text area, Attributes list, Methods list.
  - Section 2: **Relationship Mapper**:
    - Source Class, Relationship Type (`Inheritance`, `Composition`, `Aggregation`, `Association`, `Realization`), Target Class, Cardinality.
  - Section 3: **Design Patterns & Trade-offs**:
    - Pattern selection tags + Explanation text box.
  - Section 4: **Code & Mermaid Diagram Preview**:
    - Live-rendered Mermaid UML diagram auto-generated from Class & Relationship inputs!

### Screen 3: Submission & Loading State
- Submission banner with animated step indicator:
  - Step 1: `Validating Submission Structure` (Done)
  - Step 2: `Running Rule-Based Structural Checks` (Done)
  - Step 3: `Invoking AI Design Evaluator` (In Progress spinner)
  - Step 4: `Aggregating Explainable Feedback` (Pending)
- Includes a non-blocking timeout safeguard notice.

### Screen 4: Feedback Dashboard View
- **Header Summary Card**:
  - Score Radial Gauge (e.g. `85 / 100`).
  - Evaluation Mode Badge (`Hybrid AI + Rule-Based` or `Rule-Based Fallback`).
  - Quick Stats: Strengths count, Weakness count, SOLID compliance score.
- **Score Breakdown Grid**:
  - Progress bars across 6 dimensions: Responsibilities, Abstraction, Coupling, SOLID, Patterns, Extensibility.
- **Explainable Findings Columns**:
  - **Strengths (Green Card)**: Positive architectural choices with evidence quotes.
  - **Weaknesses & Bottlenecks (Red Card)**: Identified anti-patterns (God Object, Tight Coupling).
  - **SOLID Audit (Blue Card)**: Specific SRP, OCP, LSP, ISP, DIP evaluation notes.
  - **Improvement Roadmap (Amber Card)**: Prioritized list of 3 concrete changes to raise score.
- **Actions Bar**: *"Try Again (New Attempt)"*, *"View Attempt History"*, *"Back to Catalog"*.

### Screen 5: Attempt History & Review View
- Table listing all past attempts for the problem.
- Columns: Attempt #, Date/Time, Status Badge (`EVALUATED`, `DRAFT`), Score, Primary Feedback Summary, Actions (*Reopen*, *Compare*).

---

## 5. Responsive Behavior & Accessibility
- **Breakpoints**:
  - Desktop (>1200px): 2-column side-by-side studio workspace.
  - Tablet (768px - 1199px): Single column stacked layout with tabbed toggle between Problem Specs and Workspace.
  - Mobile (<767px): Optimized simplified view for reading problems and reviewing feedback.
- **Accessibility**:
  - Keyboard navigation for all forms and modals (`Tab`, `Enter`, `Escape`).
  - High-contrast text compliance (WCAG AAA contrast ratios on dark theme).
  - Screen-reader friendly ARIA labels for status badges and score progress bars.
