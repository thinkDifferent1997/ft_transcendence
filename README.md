*This project has been created as part of the 42 curriculum by namalier, elsikira, espinto-, ncrivell, jbaumfal*

# Description

**Project Name:** Culture Quiz (ft_transcendence)

**Goal:** The goal of this project is to build a fully functional, real-time multiplayer web application from scratch, focusing on modern web development practices, security, and real-time data synchronization. 

**Overview:**  Overview: Culture Quiz is an interactive real-time trivia platform featuring competitive PvP matches, an adaptive AI opponent, a four-player tournament mode, persistent progression, achievements, live chat and comprehensive player statistics. The platform emphasizes a seamless user experience, secure authentication, and robust real-time communication.

**Key Features:**
* Real-time 1v1 multiplayer quiz matches; 1vAI, Tournament Mode.
* Global live chat with secure messaging.
* Comprehensive user profiles with XP, levels, and match history.
* Dynamic leaderboard based on user experience points.
* Secure OAuth authentication and Two-Factor Authentication (2FA).
* Complete legal compliance (Terms of Service & Privacy Policy).

---

# Instructions

## Prerequisites
* **Docker** & **Docker Compose** installed on your machine.
* A registered 42 API or Github application (for OAuth).

## Setup & Configuration
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd ft_transcendence
   ```
2. **Environment Variables:**
   Create a `.env` file at the root of the project by copying the provided example template:
   ```bash
   cp .env.example .env
   ```
   *Make sure to fill in your `FORTYTWO_CLIENT_ID`, `FORTYTWO_CLIENT_SECRET`, database credentials, and JWT secrets in the `.env` file.*

## Execution
Run the following command at the root of the project to build and start the containers:
```bash
make up
```
Once the containers are running, access the application in your browser at: `https://localhost:8443` (or your configured port).

---

# Resources

**References & Documentation:**
* [React Documentation](https://react.dev/)
* [NestJS Documentation](https://docs.nestjs.com/)
* [Socket.io Documentation](https://socket.io/docs/v4/)
* [Prisma ORM](https://www.prisma.io/docs)
* [TailwindCSS](https://tailwindcss.com/docs)
* [TriviaDB](https://opentdb.com/)

**AI Usage:**
* **Gemini / ChatGPT / Claude:** AI tools were used during development primarily for debugging complex React hook dependencies, scaffolding boilerplate code for TailwindCSS styling (e.g., the chat and profile UI), and generating the initial drafts for our legal pages (Privacy Policy and Terms of Service) to ensure appropriate verbiage. AI was not used to write the core game logic or backend architecture, but it help to imagine it as best and avoid errors.

---

# Team Information

### espinto- (Tech Lead)
* **Contributions:**
  * Set up the project's initial backend scaffolding and architecture.
  * Engineered the Two-Factor Authentication (2FA TOTP) integration with JWT sessions and built its enrollment UI.
  * Fixed core frontend routing, session persistence (logout clearing), and state synchronization (username updates).
  * Resolved infrastructure bugs, including Docker certificate read rights and profile data persistence after database wipeouts.
* **Challenges:** Ensuring secure JWT session handling alongside TOTP 2FA, and maintaining stable CI/CD pipelines across differing Node versions and Docker environments.
* **Overcome:** Successfully integrated `otplib` for strict 2FA validation and structured the GitHub workflows and Docker permissions to guarantee secure, reliable deployments.
### namalier - Product Owner (PO) & Game Engine Developer**
  * *Responsibilities:*
    * Defined the overall gameplay design and project roadmap.
    * Designed and implemented the complete real-time quiz game engine.
    * Developed the complete 1v1 matchmaking system using WebSockets.
    * Designed and implemented the AI game mode with adaptive behaviour based on question difficulty and player actions.
    * Designed and implemented the complete Tournament Mode (4-player brackets, semi-finals, finals, automatic progression and champion selection).
    * Implemented the complete game state synchronization between frontend and backend.
    * Developed the timer system, answer synchronization and game flow.
    * Designed and implemented the bonus system (3 Choices, Hide Answer and Double Points) and their synchronization.
    * Implemented the complete scoring, streak and winner determination logic, including tie-breaking based on total answering time.
    * Integrated the Trivia API and question management.
    * Designed and maintained the event-driven communication protocol between frontend and backend.
    * Fixed multiplayer synchronization issues, disconnect handling, forfeits and edge cases.
### elsikira - Scrum Master (PM) & FullStack Dev**
  * *Responsibilities:*
### ncrivell - DB Master & Backend Developer**
  * *Responsibilities:* * 
### jbaumfal - DevOps Developer**
  * *Responsibilities:* 

---

# Project Management

* **Work Organization:** 
* **Tools Used:** 
  * **Notions:** Used write a roadmap and to track "To Do", "In Progress", and "Done" tasks.
  * **Figma:** Used for initial UI/UX wireframing.
* **Communication Channels:** 
  * **Discord:** Primary channel for daily stand-ups, voice calls, and quick debugging sessions.

---

# Technical Stack

* **Frontend:** React, TypeScript, TailwindCSS, Vite. 
  * *Justification:* React provides a robust component-based architecture perfect for a SPA. Vite ensures fast build times, and TailwindCSS allows for rapid, consistent styling.
* **Backend:** NestJS, TypeScript, Socket.io.
  * *Justification:* NestJS enforces a clean, modular, and highly testable architecture out of the box. Socket.io is industry-standard for handling WebSocket connections with built-in fallback polling.
* **Database System:** PostgreSQL.
  * *Justification:* Chosen for its strong relational integrity, reliability, and excellent compatibility with Prisma ORM. Our data (users, matches, stats, chat) is highly relational, making a SQL database the optimal choice over NoSQL.
* **Other Significant Technologies:** Prisma (ORM for database interactions), Grafana.

---

# Database Schema

Our database relies on a robust relational PostgreSQL model mapped via Prisma. Here is an overview of the core entities and their relationships:

* **User (`User`):**
  * *Key fields:* `id` (String/UUID), `username` (String), `email` (String), `status` (Enum: OFFLINE, ONLINE, IN_GAME), `xp` (Int), `isTwoFactorEnabled` (Boolean).
  * *Relationships:* One-to-many relationships with `GlobalMessage` (chat), `Friendship` (sent/received), `RoomParticipant` (game history), and `UserBadge`.

* **Game Sessions (`Room` & `Tournament`):**
  * *Key fields:* `id` (String/UUID), `mode` (Enum: SOLO, DUEL, TOURNAMENT), `status` (Enum: WAITING, IN_PROGRESS, FINISHED), `round` (Enum: QUARTER_FINAL, SEMI_FINAL, FINAL — tournament rooms only).
  * *Relationships:* A `Tournament` contains multiple `Room` entities and links to its `champion` (RoomParticipant). A `Room` has many `RoomParticipant`s and `RoomQuestion`s (ordered), links to an optional `winner` participant (null = draw), and to a `nextRoom` (self-relation: the winner advances through the bracket).

* **Answers (`Answer`):**
  * *Key fields:* `isCorrect` (Boolean), `timeTakenMs` (Int — used for tie-breaking on equal scores).
  * *Relationships:* Belongs to a `RoomParticipant` and a `Question`.

* **Participants (`RoomParticipant`):**
  * *Key fields:* `score` (Int), `isBot` (Boolean — AI opponents), `userId` (nullable for bots).
  * *Relationships:* Links a `User` to a `Room`; unique per `(roomId, userId)`.

* **Social (`GlobalMessage` & `Friendship`):**
  * *Key fields (Message):* `id` (String/UUID), `content` (String), `createdAt` (DateTime).
  * *Relationships (Message):* Belongs to an `author` (User).
  * *Key fields (Friendship):* `status` (Enum: PENDING, ACCEPTED, DECLINED).
  * *Relationships (Friendship):* Links a `sender` (User) to a `receiver` (User).

* **Trivia (`Question`, `Category`, `AnswerChoice`):**
  * *Key fields:* `text` (String), `isCorrect` (Boolean for answers).
  * *Relationships:* A `Category` contains multiple `Question`s. A `Question` contains multiple `AnswerChoice`s and links to game rooms via `RoomQuestion`.

* **Gamification (`Badge` & `UserBadge`):**
  * *Key fields:* `code` (String), `name` (String), `description` (String).
  * *Relationships:* A many-to-many relationship mapping a `User` to their earned `Badge`s through the `UserBadge` join table.

*(Note: The full schema is detailed in our `backend/prisma/schema.prisma` file).*

---

# Features List

| Feature | Description | Contributor(s) |
| :--- | :--- | :--- |
| **Authentication & OAuth** | Dual login (Standard & 42 API), GitHub OAuth, JWT session handling, and secure credential management. | `elsikira, jbaumfal, espinto-` |
| **2FA Security** | Google Authenticator (TOTP) integration via QR code with custom frontend enrollment UI. | `espinto-, elsikira` |
| **Real-Time Quiz Engine** | Multiplayer PvP, 1vAI with adaptive difficulty, and 4-player Tournament mode using WebSocket synchronization. | `namalier` |
| **In-Game Mechanics** | TriviaDB integration, real-time timers, bonus/malus systems, and tie-breaking logic based on response time. | `namalier` |
| **Global Chat & Social** | Real-time WebSocket messaging, persistent history, user avatars, and clickable usernames routing to public profiles. | `elsikira` |
| **User Profiles & Live Stats** | Dashboard tracking XP, match history, win/loss ratios, and average response times with live WebSocket dashboard updates. | `ncrivell, namalier, elsikira` |
| **Gamification & Leaderboard** | Achievement badge system, persistent XP leveling, and a global player ranking leaderboard. | `ncrivell, namalier` |
| **Data Management (GDPR)** | Export user data (JSON, CSV, PDF) and validated bulk question imports for admins. | `ncrivell` |
| **Monitoring & DevOps** | Prometheus/Grafana monitoring dashboard, automated Discord CI/CD PR notifications, and live database health checks. | `jbaumfal, espinto-, elsikira` |
| **Legal Pages** | Fully accessible Privacy Policy and Terms of Service for data compliance. | `elsikira` |

---

# Modules

# Modules

Based on the project requirements, our team has implemented the following Major and Minor modules, totaling **16 points**:

### Major Modules (2 pts each)

* **Major: Implement a complete web-based game where users can play against each other.**
  * *Justification:* Core requirement for the platform's PvP aspect.
  * *Implementation:* Designed a real-time multiplayer trivia quiz engine with strict rules, synchronized timers, and clear win/loss conditions based on score and response time.
  * *Contributors:* `namalier`

* **Major: Remote players (Real-time network play).**
  * *Justification:* Ensures the game is playable across different machines over the internet.
  * *Implementation:* Utilized `Socket.io` WebSockets to handle matchmaking, real-time event synchronization, and implemented robust logic to handle player disconnections, forfeits, and reconnections.
  * *Contributors:* `namalier, ncrivell`

* **Major: Introduce an AI Opponent for games.**
  * *Justification:* Allows users to play and practice when other human players are offline.
  * *Implementation:* Built a "1vAI" mode where an AI opponent plays against the user. The AI features adaptive timing behavior and non-perfect play to simulate human-like difficulty.
  * *Contributors:* `namalier`

* **Major: Monitoring system with Prometheus and Grafana.**
  * *Justification:* Critical for DevOps reliability, allowing us to monitor server health and bottlenecks in real-time.
  * *Implementation:* Configured Prometheus as a Docker service to collect metrics via PostgreSQL and Nginx exporters. Created a custom Grafana dashboard with an automated alerting system for system status.
  * *Contributors:* `jbaumfal`

### Minor Modules (1 pt each)

* **Minor: Implement remote authentication with OAuth 2.0.**
  * *Justification:* Provides secure, passwordless onboarding for developers and users.
  * *Implementation:* Integrated both the **42 API** and **GitHub API** for OAuth login, linked directly to the PostgreSQL user database via JWT sessions.
  * *Contributors:* `elsikira, jbaumfal`

* **Minor: Implement a complete 2FA (Two-Factor Authentication) system.**
  * *Justification:* Adds a critical layer of security to user accounts.
  * *Implementation:* Used `otplib` and `qrcode` to generate Time-based One-Time Passwords (TOTP). Users scan the QR code via Google Authenticator to securely log in.
  * *Contributors:* `espinto-, elsikira`

* **Minor: Game statistics and match history.**
  * *Justification:* Tracks player progression and performance over time.
  * *Implementation:* Created a live dashboard fetching data from Prisma to display games played, wins/losses, average response times, and a detailed 1v1 match history.
  * *Contributors:* `ncrivell, namalier`

* **Minor: A gamification system to reward users.**
  * *Justification:* Enhances user retention and provides goals.
  * *Implementation:* Developed a fully persistent progression system featuring XP tracking, User Levels, Achievement Badges stored in the DB, and a global Leaderboard.
  * *Contributors:* `ncrivell`

* **Minor: Implement a tournament system.**
  * *Justification:* Enables competitive multiplayer events beyond simple 1v1 duels.
  * *Implementation:* Built a 4-player tournament bracket system with automatic matchmaking, semi-finals, finals, and automatic progression for the champions.
  * *Contributors:* `namalier, ncrivell`

* **Minor: Game customization options (Power-ups / Abilities).**
  * *Justification:* Adds dynamic depth and strategy to the core trivia gameplay.
  * *Implementation:* Engineered an interactive bonus/malus system during matches, including abilities like "3 Choices", "Hide Answer", and "Double Points".
  * *Contributors:* `namalier`

* **Minor: Data export and import functionality.**
  * *Justification:* Ensures users have ownership of their data (GDPR compliance) and admins can easily manage game content.
  * *Implementation:* Allows users to export their profile and match data as JSON, CSV, or PDF via JWT validation. Added a bulk validated question import feature for the database.
  * *Contributors:* `ncrivell`

* **Minor: Advanced chat features.**
  * *Justification:* Enhances the basic global chat to be more interactive and persistent.
  * *Implementation:* Added persistent chat history saved via Prisma, real-time avatars, and the ability to click on any user's name in the chat to instantly route to their public profile.
  * *Contributors:* `elsikira`

**Total Points Claimed: 16 pts (8 Major + 8 Minor)**

---

# Individual Contributions

### espinto-
* **Contributions:** 
* **Challenges:** 
* **Overcome:** 

### elsikira
* **Contributions:**
* **Challenges:**
* **Overcome:** 

### ncrivell
* **Contributions:** Built the Database tables (...). 
* **Challenges:** 
* **Overcome:**

### jbaumfal
* **Contributions:** 
* **Challenges:**
* **Overcome:**

### namalier

* **Contributions:**
  * Designed the overall game architecture.
  * Implemented the complete real-time multiplayer game engine.
  * Developed the matchmaking system for both PvP and AI matches.
  * Implemented the AI opponent with adaptive answer timing and configurable difficulty.
  * Designed and implemented the complete Tournament Mode including matchmaking, bracket generation, semi-finals, finals and automatic progression.
  * Implemented the synchronized game timer and question flow.
  * Developed the scoring system, answer validation and winner calculation.
  * Designed and implemented the complete bonus system.
  * Integrated trivia question retrieval and management.
  * Implemented player statistics generation and match history recording.
  * Handled disconnects, forfeits, reconnections and tournament recovery.
  * Contributed to project planning and feature prioritization as Product Owner.

* **Challenges:**
  * Designing a deterministic real-time game engine that remains synchronized across multiple clients.
  * Managing asynchronous WebSocket events without race conditions.
  * Synchronizing timers, answers and game state between frontend and backend.
  * Handling edge cases such as player disconnects, forfeits and tournament recovery.
  * Building a maintainable architecture capable of supporting multiple game modes.

* **Overcome:**
  * Introduced a centralized backend-driven game state to guarantee synchronization between all clients.
  * Carefully synchronized every game event through Socket.IO events and dedicated game states.
  * Designed reusable game logic shared between PvP, AI and Tournament modes.
  * Added robust disconnect and recovery handling to prevent deadlocks and inconsistent game states.
  * Refactored the game architecture to improve modularity, maintainability and scalability.

---

## Legal & Compliance
This project adheres to data protection requirements. Please review our policies located in the application footer:
* **[Privacy Policy](/privacy):** Details data collection regarding user profiles and game history.
* **[Terms of Service](/tos):** Outlines user behavior expectations in the chat and game environments.
```
