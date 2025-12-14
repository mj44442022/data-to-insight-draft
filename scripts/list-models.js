// Script to list all available Gemini models
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Load .env.local if it exists
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'your_api_key_here' || apiKey === 'your_key_here') {
    console.error('❌ GOOGLE_AI_API_KEY not found or not set in .env.local');
    console.log('Set it in .env.local file with your actual API key from:');
    console.log('   https://aistudio.google.com/app/apikey');
    process.exit(1);
  }

  console.log('🔍 Fetching available Gemini models...\n');

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // List all models
    const models = await genAI.listModels();

    console.log('✅ Available models:\n');

    models.forEach(model => {
      console.log(`📦 Model: ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });

    // Find models that support generateContent
    const contentModels = models.filter(m =>
      m.supportedGenerationMethods?.includes('generateContent')
    );

    console.log('\n🎯 Models that support generateContent:');
    contentModels.forEach(m => {
      // Extract just the model name (remove "models/" prefix)
      const modelName = m.name.replace('models/', '');
      console.log(`   ✓ ${modelName}`);
    });

    console.log('\n💡 Recommended models for your use case:');
    const recommended = contentModels.filter(m =>
      m.name.includes('flash') || m.name.includes('pro')
    );

    recommended.forEach(m => {
      const modelName = m.name.replace('models/', '');
      console.log(`   ⭐ ${modelName}`);
    });

  } catch (error) {
    console.error('❌ Error fetching models:', error.message);
    if (error.message.includes('API_KEY') || error.message.includes('401')) {
      console.log('\n💡 Your API key might be invalid. Get a new one from:');
      console.log('   https://aistudio.google.com/app/apikey');
    }
  }
}

listModels();
