# Software Requirements Specification (SRS)
## Project: Fix & Solve ("Spot the bugs, Solve the logics")

**Version:** 1.0  
**Date:** February 28, 2026

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Stakeholders](#2-stakeholders)
3. [System Architecture](#3-system-architecture)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [UI/UX Design Guidelines](#6-uiux-design-guidelines)
7. [Database Architecture](#7-database-architecture)
8. [Scoring Algorithm](#8-scoring-algorithm)
9. [User Flow](#9-user-flow)
10. [Risk Management](#10-risk-management)
11. [Future Enhancements](#11-future-enhancements)

---

## 1. Project Overview

### Purpose of the System
The **Fix & Solve** platform is a localized, web-based competitive coding environment designed specifically for hosting intra-college coding events. It provides an automated, secure, and seamless experience for evaluating students' debugging and problem-solving skills within a controlled network.

### Scope
The system will be hosted on a central server within the college’s Local Area Network (LAN). It facilitates:
* User authentication and session management.
* Real-time code execution and automated evaluation against hidden test cases.
* Qualification filtering and dynamic leaderboards.
* Two primary contest phases: **Debugging Round** and **Logical Coding Round**.

### Target Users
* **Primary:** 2nd-year college students.
* **Proficiency:** Proficient in C, C++, Java or Python.

### Objectives of the Event
* Evaluate students' ability to identify and rectify syntax and logical errors in pre-written code.
* Assess algorithmic thinking and problem-solving speed from scratch.
* Provide a completely automated, bias-free evaluation and ranking mechanism.

---

## 2. Stakeholders

| Stakeholder | Roles and Responsibilities |
| :--- | :--- |
| **Event Organizers** | Define rules, schedule the event, manage communications, and oversee execution. |
| **Technical Team** | Develop, deploy, and monitor the platform; address real-time technical glitches. |
| **Participants** | Log in, read problems, write/debug code, and submit solutions within time limits. |
| **Faculty Coordinators** | Provide problems and test cases, validate scoring logic, and approve winners. |

---

## 3. System Architecture

The platform utilizes a **Centralized LAN Server Architecture** based on the Client-Server model.

### Technology Stack
*   **Frontend:** React.js
*   **Backend:** Node.js with Express.js (Asynchronous architecture to handle high concurrent code submissions).
*   **Database:** MongoDB (NoSQL structure for flexible problem schemas and fast read/write operations).
*   **Code Execution Engine:** Local Dockerized **Judge0**. 
    *   *Note: Local induction ensures zero external internet dependency, eliminating latency and preventing unauthorized internet access.*
*   **Deployment:** Docker Compose for a reproducible and stable environment (Frontend, Backend, DB, Judge0).

### Security Considerations
*   JWT-based authentication.
*   Rate limiting on APIs.
*   Parameterized queries to prevent NoSQL injection.
*   Strict Cross-Origin Resource Sharing (CORS) policies.

---

## 4. Functional Requirements

### Authentication
*   **Student Login:** Via unique Roll Number/ID and pre-assigned passwords.
*   **Session Handling:** JWT tokens in HTTP-only cookies. Concurrent logins from different machines using the same ID are blocked.
*   **Role-Based Access:** Distinct interfaces for Admin and Participants.

### Dashboard
*   **Event Details:** Display of rules, current round, and user profile.
*   **Individual Asynchronous Timer:** Each participant has their own server-side timer that starts when they enter a round. The server issues a `timerStartTime` timestamp; the client derives the countdown from it, preventing local clock tampering. Timers run independently per machine.
*   **Round Unlock System:** Subsequent rounds remain locked until triggered by the Admin or scheduled time.

### Coordinator Reset / Retry Mechanism
*   **Purpose:** In the event of a machine malfunction or app crash, a coordinator can reset a participant's timer to grant them another attempt.
*   **Admin API:** `POST /api/contests/admin/reset-session` — clears the participant's `timerStartTime` and sets a `retryAllowed` flag.
*   **Retry Tracking:** Each reset increments a `resetCount` on the user record for audit purposes.
*   **Client Behavior:** On the next round entry after a reset, the participant receives a fresh timer. New responses from that point onward are treated normally by the system.

### Round 1: Debugging Phase
*   **Display:** Presentation of intentionally buggy code snippets with language selection.
*   **Code Editor:** Integrated **Monaco Editor** (VS Code core) with syntax highlighting; auto-complete/IntelliSense disabled.
*   **Evaluation:** Execution via sandboxed environment against predefined input/output pairs.
*   **Scoring:** Binary scoring (Pass/Fail per test case) or partial points.

### Round 2: Coding Phase
*   **Problem Statement:** Detailed description, I/O format, constraints, and sample test cases.
*   **Validation:** Immediate feedback: "Accepted", "Wrong Answer", "TLE", or "Compilation Error".
*   **Time-Based Scoring:** Points decay slightly as time progresses to reward faster solvers.

### Leaderboard & Admin Panel
*   **Real-time Updates:** Live updates via WebSockets or short-polling.
*   **Ranking Logic:** Primary sort by **Score**, secondary sort by **Total Time**.
*   **Admin Controls:** CRUD operations for problems, manual round controls, and result export (CSV/Excel).

---

## 5. Non-Functional Requirements

*   **Performance:** Support 70+ concurrent users; utilize Node.js cluster mode for multi-core scaling.
*   **Security (Anti-Cheat):**
    *   Disable right-click and copy-paste in the editor.
    *   **Page Visibility API:** Log warnings if users switch tabs; 3 warnings result in auto-lockout.
    *   **IP Binding:** Login restricted to the initial machine's IP.
*   **Reliability:** Maintain 99.9% uptime during the 2-3 hour event window.
*   **Usability:** Intuitive interface requiring zero onboarding time.

---

## 6. UI/UX Design Guidelines

### Theme & Layout
*   **Color Palette:** 
    *   Primary Background: White (`#FFFFFF`)
    *   Primary Accent: Violet (`#6C5CE7`)
    *   Secondary Text: Slate Gray (`#474787`)
*   **Layout:** Minimalist split-screen layout focus on the reading pane and editor.

### Interface Structure
*   **Left Pane (40%):** Problem Statement, Constraints, Sample I/O.
*   **Right Pane (60%):** Language Selector, Monaco Editor, Console, Submit Button.
*   **Feedback:** Success (Green) and Error (Red) alert states with detailed messaging.

---

## 7. Database Architecture

### Collections (MongoDB)
*   `Users`: Roll Number, credentials, role, IP, qualification status.
*   `Problems`: Title, description, constraints, base code, language.
*   `TestCases`: Input, expected output, visibility flag.
*   `Submissions`: User/Problem ID, code, status, execution time.
*   `Leaderboard`: Aggregated scores and time penalties.

---

## 8. Scoring Algorithm

The platform uses a time-decay model to reward accuracy and speed. All time references are derived from the **server-side individual timer**, not the client clock.

### Variables
*   $P$: Maximum points for the problem (configurable per problem, default: 100).
*   $T_{taken}$: Time elapsed **in seconds** from the participant's personal timer start until the correct submission was made.
*   $W$: Number of incorrect submissions before the accepted one.
*   $P_{penalty}$: Fixed penalty per wrong submission (default: **10 points**).
*   $D$: Decay constant **per second** (default: **0.005 points/second**).
*   $P_{min}$: Minimum guaranteed score for a correct answer (default: **30% of $P$**).

### Formula
$$Score = \max\left(P_{min},\ P - (T_{taken} \times D) - (W \times P_{penalty})\right)$$

### Default Parameters
| Symbol | Value | Meaning |
| :--- | :--- | :--- |
| $D$ | 0.005 | Points lost per second — a 10-minute solve loses 3 points |
| $P_{penalty}$ | 10 | Points lost per wrong submission |
| $P_{min}$ | 30% of $P$ | Floor score so a slow-but-correct solve is still rewarded |

### Example
A problem worth 100 points, solved at 8 minutes (480 seconds) with 2 wrong submissions:
$$Score = \max(30,\ 100 - (480 \times 0.005) - (2 \times 10)) = \max(30,\ 100 - 2.4 - 20) = 77.6$$

---

## 9. User Flow

1.  **Login:** User enters credentials on the local server landing page.
2.  **Lounge:** Read rules and await the countdown.
3.  **Round 1:** Debugging task; fix snippets and verify.
4.  **Qualification:** System filters Top *N* participants.
5.  **Round 2:** Logical coding from scratch for qualified users.
6.  **Results:** Final leaderboard displayed and results exported by Admin.

---

## 10. Risk Management

| Risk / Threat | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Server Crash** | High | Use PM2 process manager and Docker restart policies for auto-recovery. |
| **Network Failure** | High | Pre-test switches; keep backup hardware. Offline problem copies as fallback. |
| **Overload** | Medium | Queue-based submission processing (Redis + BullMQ). |
| **Power Loss** | High | High-capacity UPS for the central server and network switches. |

---

## 11. Future Enhancements

*   **Multi-College Hosting:** Transition to cloud-hosted VPS for broader reach.
*   **AI Plagiarism Detection:** AST (Abstract Syntax Tree) comparison to detect logically identical solutions.
*   **Analytics Dashboard:** Visual charts showing average time per problem and common errors.
