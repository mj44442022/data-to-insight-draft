# 🚀 Quick Start Guide - Multi-Agent Business Insight System

## Prerequisites

- Python 3.8+
- Gemini API key (get from https://aistudio.google.com/app/apikey)
- Internet connection (for data download)

## Setup in 3 Steps

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```bash
OPENAI_API_KEY=your_actual_gemini_api_key_here
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
```

### Step 3: Run the System

#### Option A: Run Full Multi-Agent System

```bash
cd src/multi_agent
python efficient.py
```

This will:
1. Initialize both agents (planner + worker)
2. Launch Gradio UI on port 7866
3. Provide a shareable link

#### Option B: Test Worker Agent Only

```bash
python test_worker_agent.py
```

This tests the core worker functionality without the full multi-agent setup.

## Usage Examples

Once the Gradio interface is running, try these questions:

### 1. Explore Available Data
```
"What data is available?"
```

### 2. Comparative Analysis
```
"Compare clients with payroll vs without payroll"
"How does mortgage ownership affect revenue by country?"
```

### 3. Correlation Analysis
```
"Show me correlation between revenue and loans"
```

### 4. Segmentation
```
"Analyze revenue patterns across different countries"
```

## Architecture Overview

```
User Question
    ↓
Main Planner Agent (decides if analysis needed)
    ↓
Business Insight Worker Agent
    ↓ Layer 1: Understand
    ↓ Layer 2: Plan
    ↓ Layer 3: Generate Code
    ↓ Layer 4: Execute
    ↓ Layer 5: Insights
    ↓
Executive-Friendly Results
```

## Troubleshooting

### Error: "Module 'agents' not found"

Install the Anthropic Agents SDK:
```bash
pip install anthropic-agents
```

### Error: "Could not load banking data"

Check your internet connection. The system downloads data from HuggingFace on first run.

### Error: "API key invalid"

Verify your `.env` file has the correct Gemini API key and base URL.

## Next Steps

- Read `MULTI_AGENT_README.md` for detailed architecture
- Customize prompts in `src/prompts/react_instructions.py`
- Add new worker agents following the pattern in `src/multi_agent/`

## Support

For issues or questions:
1. Check `MULTI_AGENT_README.md` for detailed documentation
2. Review error messages in the console
3. Verify all environment variables are set correctly

---

**Happy Analyzing!** 🏦📊
