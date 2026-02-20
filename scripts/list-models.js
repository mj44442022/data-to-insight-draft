// Script to list all available Gemini models using REST API
// Run with: node scripts/list-models.js

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
  const API_KEY = process.env.GOOGLE_AI_API_KEY;

  if (!API_KEY || API_KEY === 'your_gemini_api_key_here' || API_KEY === 'your_api_key_here' || API_KEY === 'your_key_here') {
    console.error('❌ GOOGLE_AI_API_KEY not found or not set in .env.local');
    console.log('Set it in .env.local file with your actual API key from:');
    console.log('   https://aistudio.google.com/app/apikey');
    process.exit(1);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    console.log('🔍 Fetching models via REST API...\n');
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();

    console.log('✅ Available models:\n');

    data.models.forEach(model => {
      console.log(`📦 Model: ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });

    // Filter for models that support 'generateContent'
    const availableModels = data.models
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', '')); // Clean up the name

    console.log('\n🎯 Models that support generateContent:');
    availableModels.forEach(model => {
      console.log(`   ✓ ${model}`);
    });

    console.log('\n💡 Recommended for your use case (multimodal):');
    const multimodal = availableModels.filter(m =>
      m.includes('1.5-flash') || m.includes('1.5-pro')
    );
    multimodal.forEach(model => {
      console.log(`   ⭐ ${model}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n💡 Your API key might be invalid. Get a new one from:');
      console.log('   https://aistudio.google.com/app/apikey');
    }
  }
}

listModels();
