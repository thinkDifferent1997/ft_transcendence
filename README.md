*This project has been created as part of the 42 curriculum by namalier, elsikira, espinto-, ncrivell, jbaumfal*

# Description

**Project Name:** Culture Quiz (ft_transcendence)

**Goal:** The goal of this project is to build a fully functional, real-time multiplayer web application from scratch, focusing on modern web development practices, security, and real-time data synchronization. 

**Overview:** Culture Quiz is an interactive, real-time multiplayer trivia platform. Users can challenge each other in 1v1 quiz matches, track their statistics, level up, earn badges, and communicate through a live global chat. The platform emphasizes a seamless user experience, secure authentication, and robust real-time communication.

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

**AI Usage:**
* **Gemini / ChatGPT / Claude:** AI tools were used during development primarily for debugging complex React hook dependencies, scaffolding boilerplate code for TailwindCSS styling (e.g., the chat and profile UI), and generating the initial drafts for our legal pages (Privacy Policy and Terms of Service) to ensure appropriate verbiage. AI was not used to write the core game logic or backend architecture, but it help to imagine it as best and avoid errors.

---

# Team Information

* **espinto- - Tech Lead & Backend Developer**
  * *Responsibilities:*
  **namalier - Product Owner (PO) & Game Engine Developer**
  * *Responsibilities:* 
* **elsikira - Scrum Master (PM) & FullStack Dev**
  * *Responsibilities:*
* **ncrivell - DB Master & Backend Developer**
  * *Responsibilities:* * 
  **jbaumfal - DevOps Developer**
  * *Responsibilities:* 

---

# Project Management

* **Work Organization:** We followed an Agile methodology with weekly sprints. Tasks were divided based on frontend, backend, game-engine, database gestion and real-time infrastructure.
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

Our database relies on a relational model consisting of several key entities:

* **Users Table:** 
  * *Key fields:* 
* **Matches Table:** 
  * *Key fields:*   
  * *Relationships:* 
* **Messages Table (Chat):**
  * *Key fields:*
  * *Relationships:* 
* **Badges / Achievements Table:**
  * *Key fields:*

*(Note: The full schema is detailed in our `schema.prisma` file).*

---

# Features List

| Feature | Description | Contributor(s) |
| :--- | :--- | :--- |
| **User Authentication** | OAuth via 42 API and JWT session handling. | `elsikira, ncrivell` |
| **2FA Security** | Google Authenticator integration via QR code. | `espinto-, <login2>` |
| **Real-Time Quiz Game** | 1v1 match logic, question distribution, and scoring via WebSockets. | `namalier` |
| **Global Chat** | Real-time messaging with user avatars and timestamps. Clickable usernames to see user profiles | `elsikira` |
| **User Profiles & Stats** | Dashboard displaying XP, levels, win/loss charts, and history. | `<login1>` |
| **Leaderboard** | Global ranking of players based on XP. | `<login3>, <login 2>` |
| **Legal Pages** | Accessible Privacy Policy and Terms of Service. | `elsikira` |

---

# Modules

* **Module 1: Use a Framework as Backend (Major = 2pts)**
  * *Justification:* 
  * *Implementation:* 
  * *Contributors:* `<login2>`
* **Module 2: Two-Factor Authentication (Minor = 1pt)**
  * *Justification:* Added to enhance platform security.
  * *Implementation:* Integrated `otplib` and `qrcode` to generate TOTP secrets.
  * *Contributors:* `<login2>`
* **Module 3: Advanced User Stats (Minor = 1pt)**
  * *Justification:* Enhances user engagement by gamifying the experience.
  * *Implementation:* 
  * *Contributors:* `<login1>`

**Total Points Claimed: X pts**

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
* **Challenges:** 
* **Overcome:** 

---

## Legal & Compliance
This project adheres to data protection requirements. Please review our policies located in the application footer:
* **[Privacy Policy](/privacy):** Details data collection regarding user profiles and game history.
* **[Terms of Service](/tos):** Outlines user behavior expectations in the chat and game environments.
```
