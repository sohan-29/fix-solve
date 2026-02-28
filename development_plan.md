# Development Plan: Fix & Solve

This plan breaks down the [SRS.md](file:///s:/my-exps/fix-solve/SRS.md) into actionable development milestones and tasks over a tight 2-day schedule.

---

## 📅 Day 1: Foundation & Round 1 (Debugging)
**Goal:** Establish the core infrastructure and implement the complete Flow for Round 1.

### Milestone 1.1: Project Setup & Core Infrastructure
*   [ ] **Repository Initialization:** Set up standard folder structure (Frontend, Backend, Shared/Common).
*   [ ] **Database (MongoDB):** Initialize schemas for `Users`, `Problems` (Round 1), and `TestCases`.
*   [ ] **Docker Setup:** Create `docker-compose.yml` for Node, React, MongoDB, and **Judge0**.
*   [ ] **Authentication (JWT):** Implement Login API (Roll No/Password) and session handling with HTTP-only cookies.

### Milestone 1.2: Round 1 Implementation
*   [ ] **Participant Dashboard:** Basic UI with rules display and Round navigation.
*   [ ] **Monaco Editor Integration:** Set up the editor in the frontend for debugging tasks (disable autocomplete).
*   [ ] **Round 1 Logic:** API to fetch snippets, submission endpoint, and verification against `Judge0`.
*   [ ] **Basic Timer:** Server-side synchronized countdown timer display.

---

## 📅 Day 2: Advanced Logic, Security & Admin
**Goal:** Implement Round 2, real-time leaderboard, anti-cheat mechanisms, and admin controls.

### Milestone 2.1: Qualification & Round 2 (Coding)
*   [ ] **Qualification Logic:** Automatic script to filter Top N participants based on Round 1 scores.
*   [ ] **Round 2 UI:** Split-screen layout for problem reading and scratchpad coding.
*   [ ] **Advanced Scoring:** Implement the time-decay formula including wrong submission penalties.
*   [ ] **Java Support:** Ensure the local `Judge0` instance handles Java compilation/execution.

### Milestone 2.2: Real-time Leaderboard & Security
*   [ ] **Leaderboard Update:** WebSocket setup for live score updates across all users.
*   [ ] **Ranking Algorithm:** Sort by Score (primary) and Total Time (secondary).
*   [ ] **Security (Anti-Cheat):**
    *   Disable copy-paste/right-click in the editor.
    *   Implement **Page Visibility API** to track tab switching; 3 warnings logic.
    *   **IP Binding:** Lock user session to the initial login machine's IP.

### Milestone 2.3: Admin Panel & Final Polish
*   [ ] **Admin Controls:** CRUD interface for Problems/TestCases; manual Round start/end.
*   [ ] **Results Export:** API/Button to generate and download CSV of the final leaderboard.
*   [ ] **Final Integration & Stress Test:** Validate 70+ concurrent user submission handling.

---

## 🔗 Reference Links
- [SRS.md](file:///s:/my-exps/fix-solve/SRS.md)
- [Task List](file:///C:/Users/Thapan/.gemini/antigravity/brain/aa77aff3-32f4-4d7e-ac45-cd70188a0e89/task.md)
