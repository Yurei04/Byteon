# Byteon — Hackathon Learning & Innovation Platform

**Byteon** is a full-stack SaaS platform designed to help aspiring hackathon participants learn, develop ideas, and confidently participate in innovation-driven events. Inspired by visual novels and interactive learning experiences, Byteon transforms the often-overwhelming hackathon journey into an approachable, guided experience.

The platform combines interactive educational modules, AI-powered ideation, curated learning resources, and conversational assistance to help users understand hackathons, explore project ideas, and prepare for their next innovation challenge.

**Live Website:** https://byteon.vercel.app  
**Repository:** https://github.com/Yurei04/Byteon

## Features

### Interactive Hackathon Learning
- **How to Hackathon:** A visual-novel-style learning experience divided into five chapters.
- **True or False Flashcards:** Reinforce hackathon knowledge through interactive questions.
- **Multiple-Choice Quizzes:** Test understanding of essential hackathon concepts.
- **Progress Tracking:** Keep track of learning progress throughout the interactive experience.

### AI-Powered Ideation
- **IdeateAI:** Helps users explore, develop, and refine potential project ideas.
- **AI Chatbot:** Provides conversational assistance for hackathon-related questions and guidance.
- **SDG Idea Builder:** An interactive drag-and-drop experience for exploring project ideas aligned with the United Nations Sustainable Development Goals.
- **AI Poster Generation:** Generates promotional poster concepts for supported platform workflows.

### Resource Hub
- Curated resources for learning about hackathons and innovation.
- Educational materials to help users develop technical and creative skills.
- Access to relevant guides and supporting content.

### User Accounts and Personalization
- User registration and authentication.
- Sign-in, sign-out, and password recovery.
- User profile management.
- Personalized learning progress and notifications.

### Organization Management
- Organization accounts and content management.
- Support for publishing announcements, blogs, and resources.
- Moderation workflows for submitted content.

### Administrative Dashboard
- Role-based access control for users, organization administrators, and super administrators.
- Content review and moderation.
- Organization content approval workflows.
- Centralized management of supported platform content.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend and API | Next.js API routes and server-side functionality |
| Database | Supabase |
| AI and Generative AI | Google Gemini, Groq |
| AI Poster Generation | OpenAI API |
| Deployment | Vercel |
| Version Control | Git, GitHub |

*The technologies listed represent the project's intended integrations; individual features depend on their current implementation and configuration.*

## System Architecture

Byteon uses a web-based architecture that connects the user interface, application logic, database, and AI services.

1. **Frontend:** Next.js and React deliver the interactive learning experience, platform dashboards, quizzes, and idea-building tools.
2. **Application Layer:** Server-side logic and API endpoints process application requests and coordinate feature workflows.
3. **Database and Authentication:** Supabase supports persistent data storage and user-related functionality.
4. **AI Services:** Integrated generative AI services support conversational assistance, ideation, and poster-generation workflows.
5. **Deployment:** Vercel hosts the web application.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (a version compatible with the project's dependencies)
- npm
- Git
- A Supabase project
- API credentials for any AI services enabled in your local configuration

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Yurei04/Byteon.git
cd Byteon
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env.local` file in the project root and add the credentials required by your configured services.

For example, if these variables are used by the current source code:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

GROQ_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
```

Use the exact variable names expected by the project's configuration and API routes. Do not expose private API keys through client-side code or commit secrets to version control.

**4. Start the development server**

```bash
npm run dev
```

**5. Open the application**

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Project Goals

Byteon aims to make hackathon participation more accessible by addressing common challenges faced by beginners, including:

- Uncertainty about how hackathons work.
- Difficulty developing and refining project ideas.
- Information overload when searching for learning resources.
- Lack of confidence when joining a team or participating independently.
- Difficulty translating real-world problems into practical innovation projects.

By combining interactive education with AI-assisted ideation, Byteon provides a more structured starting point for aspiring innovators.

## Target Users

- First-time hackathon participants.
- Students exploring technology and innovation.
- Solo developers looking for project inspiration.
- Aspiring designers and entrepreneurs.
- Organizations sharing educational resources and announcements.

## Development Status

Byteon is an academic capstone project developed as a full-stack web platform. Its features and integrations may evolve as development, testing, and deployment continue.

Availability of individual features depends on the current application implementation, configured API credentials, and deployment environment.

## Team

Byteon was developed collaboratively by a three-member team.

- **James Yuri Avila** — Project Leader & Full-Stack Developer
- **Kaede** — Development Team
- **Sea** — Development Team

## License

This project is licensed under the Apache License 2.0. See the `LICENSE` file in the repository for the complete license terms.

---

**Byteon — Learn, Ideate, and Build with Confidence.**
