// Check if API key is valid
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyC7HyGPm2jUC4vq9e9JzVECscwLC041LSI';
const genAI = new GoogleGenerativeAI(apiKey);

async function checkKey() {
  console.log('🔍 Checking API key validity...\n');
  console.log(`API Key: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 5)}\n`);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Hello');
    const response = await result.response;
    console.log('✅ API key is VALID and working!');
    console.log('Response:', response.text());
  } catch (error) {
    console.log('❌ API key test FAILED\n');
    console.log('Full error:', error.message);
    console.log('\nPossible issues:');
    console.log('1. API key is invalid or expired');
    console.log('2. Generative Language API not enabled for this key');
    console.log('3. API key restrictions blocking requests');
    console.log('4. Billing not set up (required for paid tier)');
    console.log('\n📝 Action steps:');
    console.log('1. Go to: https://aistudio.google.com/app/apikey');
    console.log('2. Click "Create API Key" for a NEW key');
    console.log('3. Make sure to enable "Generative Language API"');
    console.log('4. Copy the NEW key and update .env.local');
  }
}

checkKey();
