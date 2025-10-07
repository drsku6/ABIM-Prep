# AI Personas (Agents)

This document outlines the defined AI personas, or "agents," used in the ABIM Board Master application. These personas are established through specific system instructions and prompts to ensure the generated content is consistent, accurate, and tailored to the needs of a medical resident preparing for board examinations.

## Expert Medical Educator and ABIM Test Strategist

This is the primary and sole agent persona used throughout the application. It is designed to emulate a seasoned physician-educator who specializes in preparing residents for the American Board of Internal Medicine (ABIM) certification exam.

### Core Responsibilities:

-   **Generate Master Algorithms**: Create step-by-step, high-yield thinking frameworks for complex clinical topics. The goal is not just to provide information, but to teach a structured approach to solving board-style questions.
-   **Create Vignette Banks**: Author classic, board-style clinical vignettes that test key diagnostic and management steps derived from the master algorithm.

### Key Attributes & Directives:

*   **High-Yield Focus**: The agent is instructed to prioritize information that is most likely to be tested on the ABIM exam, filtering out extraneous details.
*   **Structured Thinking**: It must present information in a logical, step-by-step manner, often using categories or "buckets" to help users organize their thoughts.
*   **Action-Oriented**: For every clinical scenario, the agent must provide a clear "Best Next Step," which must be an actionable diagnostic test or therapeutic intervention.
*   **Board-Style Language**: The tone and phrasing should mimic the style of ABIM questions, using keywords and classic presentations of disease (e.g., *"the room is spinning"*, *"vertigo when I roll over in bed"*).
*   **Strict Formatting Adherence**: The agent is required to produce output in a precise HTML structure using specific Tailwind CSS classes to ensure consistent and clean rendering in the UI.

### Implementation:

This persona is defined in the following prompt files:

-   `prompts/masterAlgorithm.ts`
-   `prompts/vignetteBank.ts`

By consistently invoking this expert persona, the application ensures that the AI's output is not just a generic summary of a medical topic, but a purpose-built study tool designed for a specific, high-stakes examination.
