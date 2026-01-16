import { GoogleGenerativeAI } from "@google/generative-ai";
import { FileData, AnalysisResult } from "../types/type";

const processFile = (fileData: FileData): { inlineData: { data: string; mimeType: string } } => {
  // Remove data URL prefix (e.g., "data:application/pdf;base64,")
  const base64Data = fileData.base64.split(',')[1];
  return {
    inlineData: {
      data: base64Data,
      mimeType: fileData.mimeType,
    },
  };
};

export const synthesizeResearch = async (
  topic: string,
  abstracts: string,
  files: FileData[]
): Promise<AnalysisResult> => {
  // Use the React-specific environment variable prefix
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please add REACT_APP_GEMINI_API_KEY to your .env file.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-2.0-flash for high performance
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const systemPrompt = `
    You are an expert Research Scientist.

    Task: Analyze the provided text/abstracts from multiple academic papers.
    1. Synthesize the core contributions.
    2. Identify the "Research Gap" (conflicts or missing links).
    3. Generate a novel research proposal to bridge this gap.
    4. Create a Mermaid.js flowchart string visualizing the methodology.

    You must output valid JSON only.
    
    For the mermaidCode:
    - Use 'graph TD'
    - IMPORTANT: You MUST wrap all node labels in double quotes. 
      Example: A["Step 1 (Initial)"]
    - Do NOT wrap the mermaid code in markdown code blocks.
  `;

  const userPrompt = `
    Research Topic: ${topic}
    
    Additional Abstracts/Notes:
    ${abstracts}
    
    Analyze the attached files and text. Return JSON following this structure:
    {
      "gapAnalysis": "one sentence summary",
      "proposal": {
        "title": "string",
        "abstract": "string",
        "methodology": "string"
      },
      "mermaidCode": "graph TD..."
    }
  `;

  const fileParts = files.map(processFile);
  const textPart = userPrompt;

  try {
    const result = await model.generateContent([
      systemPrompt,
      ...fileParts.map(f => f.inlineData),
      textPart
    ]);

    const response = await result.response;
    let text = response.text();
    
    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    return JSON.parse(text) as AnalysisResult;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to synthesize research.");
  }
};