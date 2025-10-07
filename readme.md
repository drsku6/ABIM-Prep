# ABIM Board Master

An AI-powered study assistant for medical residents preparing for the ABIM board exam. This application transforms any complex medical topic into a structured, high-yield study guide, complete with a step-by-step thinking algorithm and a bank of classic board-style clinical vignettes.

## Overview

ABIM Board Master is designed to bridge the gap between textbook knowledge and the critical thinking required for board examinations. By leveraging the Google Gemini API, it provides a dynamic and interactive learning experience. Users can input a clinical topic (e.g., "Hyponatremia," "Dizziness") and receive a comprehensive study guide tailored for board-style question mastery, streamed directly to their browser in real-time.

## Key Features

-   **🤖 Master Algorithm Generation**: Get a detailed, step-by-step thinking algorithm for any clinical topic, designed by an AI agent persona of an "Expert Medical Educator and ABIM Test Strategist."
-   **⚡ Real-Time Streaming**: The Master Algorithm is streamed word-by-word, providing an immediate and responsive user experience without waiting for the full response.
-   **📋 Dynamic Vignette Bank**: Generate a set of classic, board-style clinical vignettes based on the master algorithm. Each vignette includes the most likely diagnosis and the crucial "best next step" in management.
-   **✨ Rich Content Copy**: A smart copy feature allows users to copy the generated study guides with full HTML formatting (and a plain text fallback) for easy pasting into note-taking apps like Notion, OneNote, or Anki.
-   **🧠 Advanced Prompt Engineering**: Utilizes a modular prompt architecture to instruct the Gemini model to produce highly structured, well-formatted HTML output, ensuring a clean and consistent UI.

## Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI**: Google Gemini (`gemini-2.5-flash`) via the `@google/genai` SDK
-   **Architecture**: Modern, build-less frontend setup using ES modules and `importmap` for direct-from-CDN package imports.

## Project Structure

The project is organized for clarity and maintainability:

```
/
├── components/         # Reusable React components (Input, Output, Icons)
├── prompts/            # Modular prompts for the AI agent
├── services/           # Gemini API service integration
├── agents.md           # Documentation for the AI personas
├── App.tsx             # Main application component
├── index.html          # Entry point with importmap and Tailwind config
├── index.tsx           # React root renderer
├── types.ts            # TypeScript type definitions
└── readme.md           # This file
```

## Getting Started

To run this project, you need a local development environment capable of serving the static files and injecting your Google Gemini API key as an environment variable.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/abim-board-master.git
cd abim-board-master
```

### 2. Provide the API Key

The application is configured to read the Google Gemini API key from `process.env.API_KEY`. Your development server or deployment environment must be configured to replace this placeholder with your actual API key at runtime.

For example, when using a tool like [Vite](https://vitejs.dev/):
1.  Create a `.env` file in the project root.
2.  Add your API key to the file: `API_KEY=YOUR_GEMINI_API_KEY_HERE`.
3.  Run the development server with `npx vite`. The server will automatically substitute `process.env.API_KEY` in the code, making it available to the application.

### 3. Serve the Application

Serve the `index.html` file using your preferred local server. If you used the Vite example above, it will already be running. Otherwise, any static server will work, provided the API key has been successfully injected into the environment.

## AI Prompts and Personas

This application's high-quality output is driven by a carefully designed AI agent persona. The prompts are architected to be modular and maintainable, located in the `/prompts` directory.

For a detailed breakdown of the agent's responsibilities, attributes, and directives, please see the [**agents.md**](./agents.md) file.

## Disclaimer

This tool is powered by AI and is intended for educational purposes only. It is not a substitute for clinical judgment or official medical guidelines. Always verify information with peer-reviewed sources and consult with senior clinicians.
