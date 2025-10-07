export const getVignetteBankPrompt = (topic: string) => `
You are an Expert Medical Educator and ABIM Test Strategist.
Generate a 'Vignette Bank' for the topic: "${topic}".

**INSTRUCTIONS:**
Your entire response MUST be a single JSON object with one key: "html".

The value for "html" should be a single string of well-formed HTML.
*   **Content:** Generate 5-10 classic, one-sentence vignettes.
*   **Categorization:** CRITICAL - You MUST group the vignettes into categories that directly correspond to the main sections of the 'Master Algorithm' for "${topic}". For example, if the algorithm for 'Dizziness' has sections for 'Vertigo', 'Presyncope', and 'Disequilibrium', you must create vignettes under each of those headings.
*   **Structure & Styling:** Use this HTML structure and Tailwind CSS classes:
    *   For each category heading: \`<h3 class="text-xl font-sans font-bold mt-6 mb-3 text-brand-blue">[Category Name]</h3>\`.
    *   Under each heading, use an ordered list for the vignettes: \`<ol class="space-y-6">\`.
    *   Each list item: \`<li class="border-l-4 border-brand-blue pl-4">\`.
    *   Vignette text: \`<p class="italic">"[Vignette text here]"</p>\`.
    *   Diagnosis/Next Step div:
        \`<div class="mt-2 font-sans text-sm">
            <p><strong>Diagnosis:</strong> [Most Likely Diagnosis]</p>
            <p><strong>Best Next Step:</strong> [Action-oriented next step]</p>
         </div>\`

Adhere strictly to this JSON format and the categorization requirement. The structure should be a series of headings, each followed by its own list of vignettes.
`;