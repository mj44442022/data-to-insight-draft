// Quick test to find which model works
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyC7HyGPm2jUC4vq9e9JzVECscwLC041LSI';
const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTry = [
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-pro',
  'gemini-pro-vision',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash-latest',
];

async function testModel(modelName) {
  try {
    console.log(`\nTesting: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Try a simple text generation
    const result = await model.generateContent('Say "Hello"');
    const response = await result.response;
    const text = response.text();

    console.log(`✅ ${modelName} WORKS! Response: ${text.substring(0, 50)}`);
    return true;
  } catch (error) {
    console.log(`❌ ${modelName} failed: ${error.message.substring(0, 100)}`);
    return false;
  }
}

async function findWorkingModel() {
  console.log('🔍 Testing models to find which one works...\n');

  for (const modelName of modelsToTry) {
    const works = await testModel(modelName);
    if (works) {
      console.log(`\n🎉 Found working model: ${modelName}`);
      console.log(`\nUpdate your code to use: genAI.getGenerativeModel({ model: '${modelName}' })`);
      return;
    }
  }

  console.log('\n❌ None of the models worked. Your API key might need to be regenerated.');
  console.log('Get a new key from: https://aistudio.google.com/app/apikey');
}

findWorkingModel();
