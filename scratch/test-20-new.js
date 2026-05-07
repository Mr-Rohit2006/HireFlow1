require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hi");
    console.log("New Key 2.0-flash Success:", result.response.text());
  } catch (error) {
    console.error("New Key 2.0-flash Error:", error.message);
  }
}

test();
