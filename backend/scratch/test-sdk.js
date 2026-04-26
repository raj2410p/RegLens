require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini25() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenerativeAI(apiKey);

  try {
    const modelName = 'gemini-2.5-flash';
    console.log(`Testing model: ${modelName}...`);
    const model = ai.getGenerativeModel({ model: modelName });
    const prompt = "Are you there?";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log(`✅ SUCCESS: ${modelName} -> ${response.text()}`);
  } catch (err) {
    console.error(`❌ FAILED: ${err.message}`);
  }
}

testGemini25();
