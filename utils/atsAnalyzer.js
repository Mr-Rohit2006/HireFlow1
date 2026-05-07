const pdfParse = require("pdf-parse");

// ✅ Ab resumeBuffer (Buffer) accept karta hai — file path nahi
const analyzeResume = async (resumeBuffer, jobDescription) => {
  try {
    // 1. Extract text from PDF buffer
    const pdfData = await pdfParse(resumeBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      console.warn("Resume text extraction failed or text too short.");
      return 0;
    }

    // 2. Prepare Prompt
    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer.
Carefully compare the Resume with the Job Description below.

Scoring criteria:
- Matching skills and technologies (40%)
- Relevant experience and years (30%)
- Education and qualifications (15%)
- Job title and role alignment (15%)

Job Description:
${jobDescription}

Resume:
${resumeText}

Based on your analysis, calculate the actual match percentage.
Respond ONLY with a raw JSON object. No markdown, no explanation, no extra text.
Format: {"percentage": <your_calculated_number>}`;

    // 3. Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 50,
        temperature: 0.1, // Low temperature = consistent, factual output
        messages: [
          {
            role: "system",
            content: "You are an ATS scoring engine. You only output raw JSON. Never use markdown or explanation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Groq API Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content?.trim() || "";

    // Clean up if model included markdown blocks
    text = text.replace(/```json|```/g, "").trim();

    const parsedResponse = JSON.parse(text);
    const percentage = parseInt(parsedResponse.percentage) || 0;

    console.log(`ATS Score calculated: ${percentage}%`);
    return Math.min(100, Math.max(0, percentage));

  } catch (error) {
    console.error("ATS Analyzer Error:", error.message || error);
    return 0;
  }
};

module.exports = { analyzeResume };