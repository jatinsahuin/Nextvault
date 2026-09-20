# CLAUDE.md — Engineering Guide

This document serves as the operational handbook for the development of NextVault. It translates the high-level vision in `VISION.md` into concrete engineering constraints and workflows.

## 🛠 Technical Standards

### Architectural Boundaries
Strict separation of concerns is required. Do not leak logic between layers:
- **Application Layer (UI):** Handles presentation and user interaction. No direct AI or Database calls.
- **Orchestration Layer:** The "brain" that coordinates retrieval and intelligence.
- **Intelligence Layer:** Pure AI logic, prompt engineering, and model interfacing.
- **Knowledge Layer:** Data persistence, graph structures, and indexing.
- **Retrieval Layer:** Vector search, hybrid search, and ranking.

### Code Quality
- **Modularization:** Avoid giant files. Break logic into small, single-responsibility modules.
- **Typing:** Use clear naming conventions and types (TypeScript preferred for new modules).
- **Performance:** 60fps for all UI interactions. Use `IntersectionObserver` and lazy loading.
- **Reliability:** Treat AI output as probabilistic. Always validate and sanitize AI-generated data before committing it to the Knowledge Layer.

---

## 🔄 Git Workflow

### Commit Standards
Every commit must be meaningful. Use the imperative mood.
- **Good:** `Implement semantic document retrieval`, `Add knowledge graph persistence`, `Fix mobile navigation overflow`
- **Bad:** `update`, `fix`, `stuff`, `final-final`

### Branching Strategy
- `main`: Stable, deployable state.
- `feature/*`: New functionality (e.g., `feature/memory-engine`).
- `fix/*`: Bug fixes.

---

## ✅ Definition of "Done"

A task is only marked as `completed` when it meets all the following criteria:
1. **Implementation:** Code is complete and follows architectural boundaries.
2. **Verification:** Feature is tested against functional requirements and critical edge cases.
3. **UI/UX:** Responsive design works across mobile and desktop; accessibility standards met.
4. **Security:** No secrets committed; data isolation verified.
5. **Documentation:** `README.md` or internal docs updated; `CHANGELOG.md` updated.
6. **Cleanliness:** Unused code and debug logs removed.
7. **Commit:** Pushed to the appropriate branch with a meaningful message.

---

## ⚠️ Anti-Patterns (The "Do Not" List)

- **No "Fake Features":** Do not build UI for features that don't have a functional backend. Mark as "Planned" or "Prototype."
- **No AI-Wrappers:** Avoid building a simple chat interface. Every AI feature must integrate with the persistent Knowledge Layer.
- **No Over-Engineering:** Do not introduce microservices, complex agent frameworks, or custom databases until the MVP requirements demand it.
- **No Black Boxes:** Any AI-derived connection must be traceable and explainable.

---

## 🤖 AI Agent Instructions (For Claude)

When working on NextVault, always ask: 
**"Does this change make NextVault better at understanding, connecting, retrieving, and developing human knowledge?"**

If the answer is "No" or "It just looks cool," suggest a simpler alternative or question the requirement.
