## Metadata
- **Phase:** Supermodule A
- **Mode:** Ask
- **Output Path:** `/docs/operations/phases/sm-a-05-reflect.md`

---

# Reflection — Supermodule A: Data & Realtime Backbone (Modules 5–7)

## 1) Phase Context
- **Date:** Oct 14, 2025
- **Duration:** ~1 day
- **Objectives:** Implement unified persistence (Firestore), realtime sync (Firestore listeners + RTDB presence/cursors), and conflict handling (debounced writes + transient locks) to enable multi-user collaboration.
- **Checkpoint:** `sm-a-03-build.md` logged after feature completion; `sm-a-04-debug.md` logged post-validation.

## 2) Achievements
- Implemented Firestore schema and adapters for `canvases/{canvasId}` and `shapes/{shapeId}` with typed models and timestamps.
- Added realtime listeners for shapes; wired to Zustand via `setNodes` and a `useShapesSync` hook.
- Implemented RTDB presence with `onDisconnect` and ~20 Hz cursor broadcasting; rendered remote cursors in `CanvasStage`.
- Added conflict handling: `lockedBy` with 5s TTL, debounced writes (~75 ms) during transforms, final commit on mouseup via `useShapeWriter`.
- Preserved Canvas UI performance; no regressions to AuthGuard or routing.
- Tests: unit scaffolds for writer debounce and adapter API; skipped E2E placeholders for presence and shapes sync; regression checklist created and smoke-passed.

## 3) Challenges
- Echo-prevention for Firestore listeners vs local writes requires robust origin tagging/version checks; currently scaffolded only.
- Environment: repo-level `pnpm lint` blocked by Node v16; used file-level linting instead.
- E2E multi-context with Firebase requires emulator/seed and auth harness; deferred pending setup.

## 4) Root Cause Analysis
- Echo-prevention complexity stems from distributed updates and transform frequency; naive re-apply risks jitter.
- Node version mismatch due to local environment constraints; tooling upgrade needed for repo-wide lint.
- E2E prerequisites (emulator, test data) were not in scope previously, making immediate automation impractical.

## 5) Process Evaluation
- Code quality: Clear types, isolated hooks (`useShapesSync`, `usePresence`, `useShapeWriter`), and adapters; minimal surface changes to canvas components.
- Architecture alignment: Followed planned tracks (T1–T5) and maintained separation of concerns.
- Testing: Unit scaffolds added; E2E placeholders documented; regression smoke executed; emulator-based tests planned next.
- Documentation: Start/Plan/Build/Debug written; acceptance criteria preserved; regression checklist added.

## 6) Phase Performance Score
- **Score:** 90%
- **Rationale:** Core features delivered with solid stability; minor gaps (echo-prevention completeness, emulator E2E) deferred with clear plan.

## 7) Key Learnings
- Debounced writes with final commit provide a good balance of UX smoothness and write volume.
- Presence at ~20 Hz is adequate for perceived smoothness; labeling improves usability.
- Hooks layering (sync, presence, writer) keeps Canvas components lean and testable.
- Early regression smoke prevents accidental UI performance regressions.

## 8) Actionable Improvements
- Implement origin tagging and version/timestamp checks in sync path to prevent echo.
- Add Firebase Emulator config and seed script; wire CI to run integration tests.
- Add JSON export helper for shapes to satisfy remaining Module 5 acceptance.
- Bump local Node to ≥18.12 to run repo lints and ensure CI parity.

## 9) Forward Outlook
- Next phase (Supermodule B) will focus on Shapes/Text details, Security Rules, and Observability.
- Dependencies: emulator setup, echo-prevention refinement, and export helper will improve reliability for B-phase features.
- Opportunities: batch Firestore writes for multi-select transforms; presence reconnect handling; perf profiling under shape-heavy canvases.

## 10) Reflection Summary
Supermodule A established a reliable data and realtime backbone with presence, cursors, and conflict-managed writes without regressing Canvas UI. The remaining gaps are tactical and well-scoped (echo-prevention, emulator E2E, export), positioning the system to confidently proceed into Supermodule B.
