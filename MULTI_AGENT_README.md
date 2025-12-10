# 🏦 Scotiabank Multi-Agent Business Insight System

## Overview

This project implements a **planner-worker multi-agent architecture** for business intelligence and data analysis. The system intelligently routes user questions and performs comprehensive 5-layer analysis on banking data.

## Architecture

### Multi-Agent Pattern

The system follows the **efficient planner-worker pattern** inspired by the Vector Institute Agent Bootcamp:

```
┌─────────────────────────────────────────────────┐
│         User Question via Gradio UI             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│        Main Planner Agent (Orchestrator)        │
│  - Decides when to invoke worker                │
│  - Handles general questions directly           │
│  - Routes data questions to worker              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼ (when data analysis needed)
┌─────────────────────────────────────────────────┐
│   Business Insight Worker Agent (Specialist)    │
│                                                  │
│  Layer 1: 🧠 UNDERSTAND - Extract intent        │
│  Layer 2: 📋 PLAN - Design methodology          │
│  Layer 3: 💻 CODE - Generate Python code        │
│  Layer 4: ⚡ EXECUTE - Run analysis safely      │
│  Layer 5: 📊 INTERPRET - Executive insights     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      Executive-Friendly Business Insights       │
└─────────────────────────────────────────────────┘
```

### Key Components

#### 1. Main Planner Agent (`src/multi_agent/efficient.py`)
- **Role**: Intelligent router and orchestrator
- **Model**: Gemini 2.0 Flash (configurable)
- **Capabilities**:
  - Analyzes user questions
  - Decides when business insight analysis is needed
  - Invokes worker agent as a tool
  - Handles non-data questions directly

#### 2. Business Insight Worker Agent (`src/multi_agent/business_insight_worker.py`)
- **Role**: Specialized data analysis agent
- **Model**: Gemini 2.0 Flash for speed
- **Capabilities**: 5-layer analysis pipeline
  - **Layer 1 (UNDERSTAND)**: Extracts question intent, identifies relevant columns
  - **Layer 2 (PLAN)**: Designs analysis methodology like a senior analyst
  - **Layer 3 (CODE)**: Generates custom Python/Pandas code
  - **Layer 4 (EXECUTE)**: Safely executes code in sandboxed environment
  - **Layer 5 (INTERPRET)**: Produces executive-friendly insights

## Project Structure

```
data-to-insight-draft/
├── src/
│   ├── __init__.py
│   ├── multi_agent/
│   │   ├── __init__.py
│   │   ├── efficient.py              # Main orchestrator
│   │   └── business_insight_worker.py # Worker agent (layers 2-5)
│   ├── prompts/
│   │   ├── __init__.py
│   │   └── react_instructions.py     # ReAct prompts for planner
│   ├── utils/
│   │   ├── __init__.py
│   │   └── gradio_helpers.py         # Gradio streaming helpers
│   └── 0_agent_ai_insight/
│       └── app_v5_intelligent.py     # Original single agent (for reference)
├── requirements.txt                   # Python dependencies
├── .env.example                       # Environment variables template
├── MULTI_AGENT_README.md             # This file
└── README.md                          # General project README
```

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file with the following:

```bash
# OpenAI API Configuration (for Gemini via OpenAI-compatible endpoint)
OPENAI_API_KEY=your_gemini_api_key_here
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/

# Model Selection (optional, defaults shown)
GEMINI_FLASH_MODEL=gemini-2.0-flash-exp
GEMINI_PRO_MODEL=gemini-2.0-flash-exp

# Optional: Langfuse for observability
LANGFUSE_SECRET_KEY=your_secret_key
LANGFUSE_PUBLIC_KEY=your_public_key
LANGFUSE_HOST=https://cloud.langfuse.com
```

### 3. Run the Multi-Agent System

```bash
cd src/multi_agent
python efficient.py
```

The system will:
1. Run self-tests on the worker agent
2. Launch a Gradio interface on port 7866
3. Provide a shareable link

## Usage

### Example Questions

**Data Overview:**
```
"What data is available?"
"What information do we have?"
```

**Comparative Analysis:**
```
"Compare clients with payroll vs without payroll"
"How does mortgage ownership affect revenue by country?"
```

**Correlation Analysis:**
```
"Show me correlation between revenue and loans"
"What metrics are correlated with customer profitability?"
```

**Segmentation:**
```
"Analyze revenue patterns across different countries"
"Which customer segments are most profitable?"
```

## Key Features

### 1. **Intelligent Routing**
The planner agent only invokes the worker when data analysis is needed, handling simple questions directly.

### 2. **5-Layer Analysis Pipeline**
Each data question goes through a methodical process:
- Understanding → Planning → Coding → Execution → Insights

### 3. **Executive-Friendly Output**
Results include:
- Clear methodology explanation
- Key findings with numbers and percentages
- Business implications
- Actionable recommendations

### 4. **Safe Code Execution**
Generated Python code runs in a sandboxed environment with:
- Limited scope (pandas, numpy only)
- No file system access
- Error handling and recovery

### 5. **Streaming Responses**
Real-time updates as the agent processes your question.

## Differences from Original Single-Agent System

| Aspect | Original (app_v5_intelligent.py) | Multi-Agent (efficient.py) |
|--------|----------------------------------|----------------------------|
| **Architecture** | Single conversational agent | Planner-worker multi-agent |
| **Framework** | LangChain | Anthropic Agents SDK |
| **Routing** | All questions go through 5 layers | Intelligent routing by planner |
| **Efficiency** | Processes everything | Worker invoked only when needed |
| **Scalability** | Single agent handles all | Can add more specialized workers |
| **Gradio Streaming** | Basic | Advanced event streaming |

## Benefits of Multi-Agent Architecture

1. **Efficiency**: Worker only invoked when needed, saving compute
2. **Modularity**: Easy to add new specialized workers
3. **Clarity**: Clear separation of orchestration vs execution
4. **Scalability**: Can scale workers independently
5. **Maintainability**: Each agent has single responsibility

## Development

### Adding New Worker Agents

To add a new specialized worker:

1. Create worker module in `src/multi_agent/`
2. Define main function with clear docstring
3. Register as tool in `efficient.py`:

```python
new_worker_agent = agents.Agent(
    name="NewWorker",
    instructions="...",
    tools=[agents.function_tool(your_function)],
    model=agents.OpenAIChatCompletionsModel(...)
)

main_agent = agents.Agent(
    ...
    tools=[
        business_insight_worker.as_tool(...),
        new_worker_agent.as_tool(...)
    ]
)
```

### Customizing the Planner

Edit `src/prompts/react_instructions.py` to change routing logic and response style.

### Changing Models

Update `AGENT_LLM_NAMES` in `efficient.py`:
- Use faster models (flash) for workers
- Use more capable models (pro) for complex planning

## Troubleshooting

### Issue: "Module not found"
**Solution**: Run from the correct directory or update `PYTHONPATH`:
```bash
export PYTHONPATH="${PYTHONPATH}:/home/user/data-to-insight-draft/src"
```

### Issue: Data loading fails
**Solution**: Check internet connection and HuggingFace dataset availability

### Issue: API errors
**Solution**: Verify `.env` file has correct API keys and base URL

## References

- **Vector Institute Agent Bootcamp**: Multi-agent patterns and best practices
- **Anthropic Agents SDK**: Agent orchestration framework
- **Original Agent**: `src/0_agent_ai_insight/app_v5_intelligent.py`

## License

This project is developed for Scotiabank as part of the Vector Institute Agent Bootcamp.

## Contributing

1. Create feature branch from main
2. Implement changes
3. Test with example questions
4. Submit pull request

---

**Built with** ❤️ **using the Anthropic Agents SDK and Vector Institute Agent Bootcamp frameworks**
