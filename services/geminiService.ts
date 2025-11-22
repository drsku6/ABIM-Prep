import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { Content, ChatMessage } from "../types";
import { getMasterAlgorithmPrompt } from "../prompts/masterAlgorithm";
import { getVignetteBankPrompt } from "../prompts/vignetteBank";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const model = 'gemini-2.5-flash';

const contentSchema = {
    type: Type.OBJECT,
    properties: {
        html: { type: Type.STRING, description: "The content formatted as a single well-formed HTML string, using Tailwind CSS classes for styling." },
    },
    required: ['html']
};

const chatSystemInstruction = "You are an Expert Medical Educator and ABIM Test Strategist. Your goal is to create high-yield, step-by-step thinking algorithms and answer follow-up questions for board preparation. Respond to follow up questions with clear, concise, well-formatted markdown.";

export const recreateChatSession = (history: ChatMessage[]): Chat => {
    const geminiHistory = history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.html }]
    }));

    const chat = ai.chats.create({
        model,
        config: {
            systemInstruction: chatSystemInstruction,
        },
        // @ts-ignore - The type expects specific roles, but 'user' and 'model' are valid.
        history: geminiHistory
    });
    return chat;
};


export const startChatAndGenerateAlgorithm = async (topic: string, onUpdate: (chunk: string) => void): Promise<Chat> => {
    try {
        const chat = ai.chats.create({
            model,
            config: {
                systemInstruction: chatSystemInstruction,
            }
        });

        const response = await chat.sendMessageStream({
            message: getMasterAlgorithmPrompt(topic)
        });

        for await (const chunk of response) {
            onUpdate(chunk.text);
        }
        
        return chat;

    } catch (error) {
        console.error("Error starting chat and streaming algorithm:", error);
        throw new Error("Failed to generate the master algorithm. Please check your API key and try again.");
    }
};

export const sendFollowUpMessageStream = async (chat: Chat, message: string, onUpdate: (chunk: string) => void) => {
    try {
        const response = await chat.sendMessageStream({ message });
        for await (const chunk of response) {
            onUpdate(chunk.text);
        }
    } catch (error) {
        console.error("Error sending follow-up message:", error);
        throw new Error("Failed to get a response for the follow-up question.");
    }
};

export const generateVignettes = async (topic: string): Promise<Content> => {
     try {
        const response = await ai.models.generateContent({
            model,
            contents: getVignetteBankPrompt(topic),
            config: {
                responseMimeType: "application/json",
                responseSchema: contentSchema
            }
        });

        const vignettesJson = response.text;
        
        if (!vignettesJson) {
            throw new Error("Received empty response from the API for vignettes.");
        }
        
        const vignettes = JSON.parse(vignettesJson);
        return vignettes;

    } catch (error) {
        console.error("Error generating vignettes:", error);
        if (error instanceof SyntaxError) {
            throw new Error("Failed to parse the vignette response from the AI. The format was invalid.");
        }
        throw new Error("Failed to generate the vignettes. Please check your API key and try again.");
    }
};
