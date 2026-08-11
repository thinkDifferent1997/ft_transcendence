*This project has been created as part of the 42 curriculum by namalier, elsikira, espinto-, ncrivell, jbaumfal*

# Description

**Project Name:** Culture Quiz (ft_transcendence)

**Goal:** The goal of this project is to build a fully functional, real-time multiplayer web application from scratch, focusing on modern web development practices, security, and real-time data synchronization. 

**Overview:** Culture Quiz is an interactive real-time trivia platform featuring competitive PvP matches, an adaptive AI opponent, a four-player tournament mode, persistent progression, achievements, live chat and comprehensive player statistics. The platform emphasizes a seamless user experience, secure authentication, and robust real-time communication.

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
* **Docker** (or **Podman** with the docker-compose compatibility layer) & **Docker Compose v2**
* **GNU Make**
* **OpenSSL** (used to generate the self-signed TLS certificates - invoked automatically by `make`)
* A registered **42 API** and/or **GitHub OAuth** application (for remote authentication)


## Setup & Configuration
1. **Clone the repository:**
```bash
   git clone <your-repo-url>
   cd ft_transcendence
```
2. **Generate the configuration files:**
```bash
   make env
```
   This creates two files (only if they don't exist yet):
   * `.env` - copied from `.env.example`. Open it and fill in:
     * `FORTYTWO_CLIENT_ID` / `FORTYTWO_CLIENT_SECRET` (42 OAuth)
     * `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` (GitHub OAuth)
     * `POSTGRES_USER` / `POSTGRES_PASSWORD` (database credentials)
     * `JWT_SECRET` (session signing - set a strong random value)
     * `GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD` (monitoring dashboard login)
     * `HTTPS_PORT=8443` - **required on rootless Podman** (e.g. 42 school machines), where binding the privileged port 443 is not allowed. On Docker Desktop you can leave it unset (defaults to 443).
   * `monitoring/alertmanager/discord_webhook_url` - copied from its `.example`. Paste your Discord webhook URL into it to receive monitoring alerts (the file is gitignored).

   TLS certificates are generated automatically on first start; no manual step is needed.

## Execution (production mode)
Build and start the full stack in the background with a single command:
```bash
make up
```
Then open the application at **https://localhost** (or **https://localhost:8443** if you set `HTTPS_PORT=8443`). The certificate is self-signed, so your browser will show a warning - this is expected.

The Grafana monitoring dashboard is available at **https://localhost/grafana/** using the credentials from your `.env`.

Stop the stack with `make down` (keeps the database), or `make re` to restart from scratch.

## Development mode
```bash
make dev
```
Runs the stack in the foreground with hot reload: the source code is bind-mounted into the containers, the frontend runs the Vite dev server, and the backend runs NestJS in watch mode. Database migrations are applied automatically on startup. Prometheus (`127.0.0.1:9090`) and Alertmanager (`127.0.0.1:9093`) are additionally exposed on localhost for debugging - in production mode they stay internal to the Docker network. Stop with `Ctrl+C` and `make dev-down`.

## Useful commands
| Command | Description |
| :--- | :--- |
| `make up` / `make down` | Start / stop the production stack |
| `make dev` / `make dev-down` | Start / stop the development stack (hot reload) |
| `make migrate` | Apply pending database migrations (production) |
| `make studio` | Open Prisma Studio to browse the database |
| `make logs` | Tail the logs of all services |
| `make ps` | List running containers |
| `make clean` | Stop everything and remove volumes (**wipes the database**) |
| `make fclean` | Full clean: also removes certificates and prunes Docker images |
| `make help` | List all available targets |

---

# Resources

## References & Documentation

**Core stack:**
* [React Documentation](https://react.dev/)
* [NestJS Documentation](https://docs.nestjs.com/)
* [Prisma ORM Documentation](https://www.prisma.io/docs)
* [Socket.io Documentation](https://socket.io/docs/v4/)
* [TailwindCSS Documentation](https://tailwindcss.com/docs)
* [The Trivia API](https://the-trivia-api.com/) - question source for the quiz engine

**Infrastructure:**
* [Docker Compose Documentation](https://docs.docker.com/compose/)
* [nginx Documentation](https://nginx.org/en/docs/) - reverse proxy and SSL termination

**Authentication (42 / GitHub OAuth, 2FA):**
* [GitHub Docs - Creating an OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
* [42 API Documentation](https://api.intra.42.fr/apidoc) - OAuth application registration
* [Passport.js Documentation](https://www.passportjs.org/docs/) with the [passport-42](https://www.npmjs.com/package/passport-42) and [passport-github2](https://www.npmjs.com/package/passport-github2) strategies
* [otplib](https://www.npmjs.com/package/otplib) - TOTP generation for 2FA

**Monitoring (Prometheus / Grafana / Alertmanager):**
* [Prometheus - Getting Started & Configuration](https://prometheus.io/docs/prometheus/latest/getting_started/)
* [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
* [prom-client](https://github.com/siimon/prom-client) - Node.js Prometheus client used in the backend
* [Grafana Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/) - datasources and dashboards as code
* [Run Grafana behind a reverse proxy](https://grafana.com/tutorials/run-grafana-behind-a-proxy/) - subpath setup under nginx
* [Alertmanager Configuration](https://prometheus.io/docs/alerting/latest/configuration/) - Discord webhook routing
* [postgres-exporter](https://github.com/prometheus-community/postgres_exporter) & [nginx-prometheus-exporter](https://github.com/nginx/nginx-prometheus-exporter)
* Tutorial: [Monitoring a Node.js/TypeScript app with prom-client (webdevtutor.net)](https://www.webdevtutor.net/) - starting point for the backend metrics service, adapted for NestJS

## Credits

* **Music:** "Forest River Spirits" by Tausdei (Evgeny) — [OpenGameArt.org](https://opengameart.org/content/forest-river-spirits). Used in this project with attribution to the original creator.

## AI Usage

AI assistants (Claude, ChatGPT, Gemini) were used as development support tools. Specifically:

* **Debugging assistance:** diagnosing infrastructure issues such as  Docker/Podman environment differences, Prisma migration conflicts, and complex React hook dependencies.
* **Boilerplate & styling:** scaffolding TailwindCSS layout code for UI components (e.g., chat and profile pages) and generating the initial drafts of the legal pages (Privacy Policy, Terms of Service).
* **Code review:** a read-only AI-assisted audit of the repository was run late in the project to identify bugs and gaps against the subject requirements before evaluation.
* **UI generation (Figma Make):** Initial UI layouts were designed in Figma and exported via Figma Make; the generated TypeScript/React components were then reviewed, refactored, and integrated by the team. This applies to the following pages: <PAGE LIST - e.g. LoginPage, ProfilePage, ...>.

The core game logic, the real-time game engine, the backend architecture, and the database schema were designed and written by the team. Every team member is able to explain and modify the code in their area of responsibility.
---

# Team Information

### namalier - Product Owner (PO) & Game Engine Developer
* **Responsibilities:** Product vision, gameplay design, and feature prioritization. Owner of the real-time game engine: matchmaking, game state synchronization, AI opponent, tournament mode, scoring, and the bonus system.

### elsikira - Scrum Master (PM) & Fullstack Developer
* **Responsibilities:** Team coordination, sprint planning, and blocker management. Owner of the infrastructure entry point (nginx reverse proxy, Docker Compose configurations) and of frontend integration work: authentication flow on the client side, global chat, and the legal pages.

### espinto- - Technical Lead & Auth Developer
* **Responsibilities:** Technical architecture decisions and code quality. Initial backend scaffolding, the 2FA (TOTP) system with the JWT session model, CI workflows, and cross-cutting frontend fixes (routing, session persistence).

### ncrivell - Database Lead & Backend Developer
* **Responsibilities:** Owner of the Prisma schema and all database migrations. Backend feature development: user registration, tournament persistence, statistics API, gamification (XP, badges, leaderboard), and GDPR data export/import.

### jbaumfal - DevOps Developer & Project Management Support
* **Responsibilities:** Design, implementation, and documentation of the monitoring stack (Prometheus, Grafana, Alertmanager, exporters); backend metrics instrumentation; GitHub OAuth integration; setup and maintenance of the team's Notion project management system (task, bug, and module databases).

---

# Project Management
* **Work Organization:**
  * Work was structured through a shared **Notion workspace** built around three linked databases:
    * **Task Management Database:** Every feature and infrastructure task is tracked with an assignee, a status ("To Do" / "In Progress" / "Done"), and a deadline, giving the whole team a live view of who is working on what.
    * **Bug Tracking Database:** Bugs discovered during development or testing are logged with a description, severity, owner, and fix status, so nothing gets lost between Discord messages and regressions can be traced back to their fix.
    * **Module Database:** All claimed subject modules (Major/Minor) are listed with their point value, implementation status, and responsible team member(s), so the team always knows how many points have been secured and how far we are from the 14-point minimum.
  * Task distribution followed ownership areas (game engine, backend/DB, auth, infrastructure/DevOps) agreed on in a shared roadmap, with regular Discord syncs to resolve blockers.

* **Tools Used:** 
  * **Notion:** As described above
  * **Figma:** Used for the initial UI/UX wireframing of the website - page layouts, component structure, and the naming conventions later reused across the frontend codebase.
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
* **Other Significant Technologies:**
  * **Prisma** - type-safe ORM handling all database access and schema migrations.
  * **nginx** - reverse proxy in front of the whole stack, handling SSL termination (self-signed certificates), routing of `/api/`, `/ws/`, and `/grafana/`, and keeping internal services (backend `/metrics`, Prometheus, Alertmanager) unreachable from outside.
  * **Docker Compose** - full container orchestration with a production configuration and a development override (hot reload, bind mounts), driven by a Makefile. Compatible with rootless Podman on 42 school machines.
  * **Prometheus, Grafana & Alertmanager** - metrics collection, dashboards, and automated alerting (see the Monitoring module).
  * **Passport.js & JWT (httpOnly cookies)** - authentication strategies (42, GitHub) and stateless session handling.
---

# Database Schema

Our database relies on a robust relational PostgreSQL model mapped via Prisma. Here is an overview of the core entities and their relationships:

* **User (`User`):**
  * *Key fields:* `id` (String/UUID), `username` (String), `email` (String), `status` (Enum: OFFLINE, ONLINE, IN_GAME), `xp` (Int), `isTwoFactorEnabled` (Boolean).
  * *Relationships:* One-to-many relationships with `GlobalMessage` (chat), `Friendship` (sent/received), `RoomParticipant` (game history), and `UserBadge`.

* **Game Sessions (`Room` & `Tournament`):**
 * *Key fields:* `id` (String/UUID), `mode` (Enum: SOLO, DUEL, TOURNAMENT), `status` (Enum: WAITING, IN_PROGRESS, FINISHED), `round` (Enum: SEMI_FINAL, FINAL - tournament rooms only).
  * *Relationships:* A `Tournament` contains multiple `Room` entities and links to its `champion` (RoomParticipant). A `Room` has many `RoomParticipant`s and `RoomQuestion`s (ordered), links to an optional `winner` participant (null = draw), and to a `nextRoom` (self-relation: the winner advances through the bracket).

* **Answers (`Answer`):**
  * *Key fields:* `isCorrect` (Boolean), `timeTakenMs` (Int - used for tie-breaking on equal scores).
  * *Relationships:* Belongs to a `RoomParticipant` and a `Question`.

* **Participants (`RoomParticipant`):**
  * *Key fields:* `score` (Int), `isBot` (Boolean - AI opponents), `userId` (nullable for bots).
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

Our team has implemented the following modules. The subject requires a minimum of **14 points** (Major = 2 pts, Minor = 1 pt); modules beyond that count toward the bonus (capped at +5).

**Point calculation: 6 Major × 2 pts + 9 Minor × 1 pt = 21 points claimed** (14 mandatory + up to 5 bonus + 2 buffer).

### Major Modules (2 pts each)

* **Major: Use a framework for both the frontend and backend.**
  * *Justification:* A component-based frontend and a modular backend framework are the foundation every other module builds on.
  * *Implementation:* React 19 + Vite on the frontend, NestJS on the backend, both fully in TypeScript.
  * *Contributors:* `elsikira, ncrivell, espinto-`

* **Major: Implement real-time features using WebSockets.**
  * *Justification:* Beyond the game itself, the platform has real-time features that update across clients: the global chat, live player status, and live statistics/leaderboard updates on profile pages.
  * *Implementation:* A Socket.IO gateway (`/ws/`) proxied through nginx handles connection lifecycle, room-based broadcasting, and event routing; identity is bound to the socket at handshake time via the JWT cookie.
  * *Contributors:* `namalier, ncrivell, elsikira`

* **Major: Implement a complete web-based game where users can play against each other.**
  * *Justification:* The core of the platform - a live PvP experience with clear rules and win/loss conditions.
  * *Implementation:* Real-time multiplayer trivia engine: 8 synchronized questions per match, server-side timers, score tracking, and a tie-breaker based on total response time.
  * *Contributors:* `namalier`

* **Major: Remote players.**
  * *Justification:* Two players on separate computers must be able to play the same match in real time.
  * *Implementation:* WebSocket-based matchmaking and event synchronization keep both clients in lockstep; disconnections are detected server-side and handled as forfeits with the match result persisted.
  * *Contributors:* `namalier, ncrivell`

* **Major: Introduce an AI Opponent.**
  * *Justification:* Lets users play and practice when no human opponent is available.
  * *Implementation:* A server-side bot with difficulty-scaled accuracy and randomized, human-like answer delays; it reacts to the opponent answering early by accelerating its own turn.
  * *Contributors:* `namalier`

* **Major: Monitoring system with Prometheus and Grafana.**
  * *Justification:* Gives the team live visibility into the health of every layer of the stack and automated notification when something breaks.
  * *Implementation:* Prometheus scrapes the instrumented NestJS backend (`prom-client`: HTTP latency histogram, WebSocket gauge, games counter), `postgres-exporter`, and `nginx-exporter` over the internal network. Grafana is provisioned as code (datasource + custom dashboard) and served behind nginx under `/grafana/` with authentication. Alert rules (backend down, DB down, error rate, latency) fire through Alertmanager into the team Discord.
  * *Contributors:* `jbaumfal`

### Minor Modules (1 pt each)

* **Minor: Use an ORM for the database.**
  * *Justification:* Type-safe database access and versioned schema migrations across the whole team.
  * *Implementation:* Prisma with PostgreSQL; all schema changes tracked as migrations and applied automatically inside the backend container on startup.
  * *Contributors:* `ncrivell, elsikira`

* **Minor: Implement remote authentication with OAuth 2.0.**
  * *Justification:* Secure, passwordless onboarding through providers our users already have.
  * *Implementation:* 42 API and GitHub OAuth via Passport strategies, with a three-stage identity resolution (provider ID → email-based account linking → new account creation) to prevent duplicate accounts, issuing JWT httpOnly cookies.
  * *Contributors:* `elsikira, jbaumfal`

* **Minor: Implement a complete 2FA (Two-Factor Authentication) system.**
  * *Justification:* A second authentication factor protecting user accounts.
  * *Implementation:* TOTP via `otplib` with QR-code enrollment (Google Authenticator compatible) and a pending-vs-full JWT split so a 2FA-enabled login is only completed after code verification.
  * *Contributors:* `espinto-, elsikira`

* **Minor: Game statistics and match history.**
  * *Justification:* Tracks player progression and performance over time.
  * *Implementation:* Per-user dashboard showing games played, wins/losses, response times, and a detailed match history, fed from persisted `Room`/`Answer` records via Prisma.
  * *Contributors:* `ncrivell, namalier`

* **Minor: A gamification system to reward users.**
  * *Justification:* Retention and goals beyond individual matches.
  * *Implementation:* Persistent XP and levels, achievement badges awarded on match completion, and a global leaderboard.
  * *Contributors:* `ncrivell`

* **Minor: Implement a tournament system.**
  * *Justification:* Competitive multiplayer events beyond 1v1 duels.
  * *Implementation:* 4-player bracket (two semi-finals → final) with matchmaking queue, automatic progression of winners, and champion persistence in the database.
  * *Contributors:* `namalier, ncrivell`

* **Minor: Game customization options.**
  * *Justification:* Adds strategic depth and personalization to the core gameplay.
  * *Implementation:* Three visual themes, music toggle and volume settings, plus streak-driven power-ups computed server-side ("3 Choices", "Hide Answer", "Double Points").
  * *Contributors:* `namalier`

* **Minor: Data export and import functionality.**
  * *Justification:* Users own their data; admins can manage game content in bulk.
  * *Implementation:* JWT-guarded export of profile and match data as JSON, CSV, or PDF, and a validated bulk question import for administrators.
  * *Contributors:* `ncrivell`

* **Minor: Advanced chat features.**
  * *Justification:* Extends the basic global chat into a persistent, social feature.
  * *Implementation:* Chat history persisted via Prisma, real-time avatars, and direct access to user profiles from the chat interface.
  * *Contributors:* `elsikira`

---

# Individual Contributions

### espinto-
* **Contributions:**
  * Set up the project's initial backend scaffolding and architecture.
  * Engineered the Two-Factor Authentication (2FA TOTP) integration with JWT sessions and built its enrollment UI.
  * Fixed core frontend routing, session persistence (logout clearing), and state synchronization (username updates).
  * Resolved infrastructure bugs, including Docker certificate read rights and profile data persistence after database wipeouts.
  * Docker Compose dev-override setup enabling hot reload through the proxy
* **Challenges:** Ensuring secure JWT session handling alongside TOTP 2FA.
* **Overcome:** Successfully integrated `otplib` for strict 2FA validation and structured the GitHub workflows and Docker permissions to guarantee secure, reliable deployments.

### elsikira
* **Contributions:**
  * Built and maintained the infrastructure entry point: nginx reverse proxy configurations (production and development) with SSL termination and routing for `/api/`, `/ws/`.
  * Implemented the frontend side of the authentication flow (login page, OAuth redirects, session handling) and CORS/proxy configuration between frontend and backend.
  * Developed the global real-time chat with persistent history, avatars, and profile links, and wrote the Privacy Policy and Terms of Service pages.
  * Coordinated the team as Scrum Master: Discord syncs, deadline tracking, and unblocking teammates.
* **Challenges:**
  * Making one nginx/Compose setup behave identically on Docker Desktop and rootless Podman at school, where binding the privileged port 443 is impossible and container DNS behaves differently.
  * Getting Vite hot reload and WebSocket connections to work reliably through the reverse proxy in development.
* **Overcome:**
  * Introduced a configurable `HTTPS_PORT` and a dev-specific nginx configuration, and kept dev/prod differences isolated in a Compose override file so the production setup stays untouched.
  * Configured dedicated proxy rules for WebSocket upgrades and file-change polling for bind mounts, making the dev loop stable for the whole team.

### ncrivell
* **Contributions:**
  * Designed and owned the complete Prisma schema and its migration history: users, game sessions (rooms, tournaments, participants, questions, answers), social models, and gamification tables.
  * Implemented user registration with Argon2 password hashing and contributed to the WebSocket gateway foundation.
  * Built the statistics backend (games played, win/loss, response times, match history) and the gamification system (XP, levels, achievement badges, global leaderboard).
  * Implemented GDPR data management: user data export as JSON/CSV/PDF and validated bulk question import for administrators.
  * Developed the tournament persistence layer (brackets, rounds, champion tracking) together with namalier.
* **Challenges:**
  * Evolving a shared database schema while multiple features were developed in parallel branches, which caused migration drift when schema changes landed without their corresponding migration files.
  * Modeling game data that has to serve very different consumers - live gameplay, historical statistics, and tournaments - without duplication.
* **Overcome:**
  * Established migrations as the single source of truth, always generated and applied inside the backend container, and reconciled drifted branches by regenerating migrations against the merged schema.
  * Designed the Room/RoomParticipant/Answer model so that 1v1 matches, AI games, and tournament rounds all persist through the same structures.


### jbaumfal
* **Contributions:**
  * **DevOps - Monitoring module (Major):** Implemented the full observability stack. Instrumented the NestJS backend with `prom-client` (HTTP request duration histogram via a global interceptor, live WebSocket connection gauge, games-started counter) exposed on an internal `/metrics` endpoint deliberately excluded from the public `api/` prefix so nginx never proxies it externally. Configured Prometheus to scrape the backend, `postgres-exporter`, and `nginx-exporter` (stub_status), wrote the alerting rules (backend down, database down, high 5xx rate, high latency), and connected Alertmanager to the team Discord via webhook. Provisioned Grafana as code (datasource + custom dashboard JSON) behind nginx under `/grafana/`, so the entire monitoring setup survives a full volume wipe and rebuilds identically from the repository.
  * Wrote the nginx configuration for the Grafana subpath (`/grafana/` location blocks in both the production and development configs, including the WebSocket upgrade route for Grafana Live).
  * **GitHub OAuth:** Implemented the GitHub OAuth 2.0 login flow (Passport strategy) integrated into the existing 42 OAuth architecture, including a three-stage identity resolution (provider ID match → email-based account linking → new account creation).
  * **Project Management:** Built the team's Notion workspace with three databases (task management, bug tracking, module/points tracking) that structured the team's daily coordination.
* **Challenges:**
  * Prometheus refused to scrape the backend because the whole stack runs behind self-signed TLS; Grafana produced redirect loops when served under an nginx subpath; the provisioned dashboard broke after every `make fclean` because Grafana's exported JSON embeds runtime folder metadata; and the stack had to behave identically under Docker Desktop and rootless Podman, which lack the same embedded DNS.
* **Overcome:**
  * Configured the scrape jobs with TLS settings appropriate for self-signed certificates, fixed the subpath serving with Grafana's root-URL/subpath options, established a rule of stripping runtime annotations from every exported dashboard JSON before committing, and made nginx resolve optional upstreams lazily so the proxy starts cleanly regardless of container start order or runtime.

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

## Music credits
“Forest River Spirits” by Tausdei (Evgeny), from OpenGameArt.org.
Used in this project with attribution to the original creator.
Source: OpenGameArt.org — Forest River Spirits

---

## Legal & Compliance
This project adheres to data protection requirements. Please review our policies located in the application footer:
* **[Privacy Policy](/privacy):** Details data collection regarding user profiles and game history.
* **[Terms of Service](/tos):** Outlines user behavior expectations in the chat and game environments.
