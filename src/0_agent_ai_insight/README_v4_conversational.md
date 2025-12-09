# Scotiabank AI Insights Agent - Conversational v4

**Vector Institute Agent Bootcamp - Adaptive Conversational Analytics**

## Overview

This version transforms the fixed 4-phase pipeline into an **adaptive, conversational data analyst** that:
- Answers questions iteratively across multiple turns
- Intelligently selects tools based on question complexity
- Builds context from previous conversation
- Mimics a senior Scotiabank Data Analyst with 10+ years experience

## Key Features

### 🎯 Adaptive Toolkit (3 Tiers)

**SIMPLE TOOLS** (< 1 second):
- `schema_info`: Dataset schema with data types
- `column_details`: Statistics for specific columns
- `correlation_analysis`: Correlations with target variable
- `grouped_averages`: Averages by categorical groups
- `flag_comparison`: Metrics by boolean flags
- `create_bins`: Quartiles/bins for numeric columns
- `binned_analysis`: Multi-dimensional bin analysis

**INTERMEDIATE TOOLS** (< 5 seconds):
- `mutual_information`: Feature importance using MI scores
- `outlier_detection`: Z-score based outlier detection

**ADVANCED TOOLS** (10-30 seconds with sampling):
- `linear_regression_drivers`: Regression coefficients by groups
- `clustering_analysis`: K-means customer segmentation

### 🧠 LLM-Based Tool Routing

The agent uses Gemini Pro to intelligently select which tools to use based on:
- Question complexity
- Conversation context (last 3 turns)
- Available data columns
- Best practice analytics workflow

### 💭 Conversational Memory

- Remembers last **8 turns** of conversation
- Detects memory limits and outputs summary
- Prunes to last 4 turns when limit reached
- Maintains conversation continuity

### ⚡ Performance Optimizations

- **Data caching**: Load dataset once, reuse across turns
- **Sampling strategy**: 20k rows max for advanced ML (regression, clustering)
- **Streaming responses**: Real-time progress updates

## Installation

```bash
# Install dependencies (includes scipy for v4)
pip install -r requirements_mvp.txt

# Set up environment variables in .env file
cat > .env << EOF
OPENAI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/"
OPENAI_API_KEY="your-gemini-api-key-here"

# Optional: Override default models
GEMINI_PRO_MODEL="gemini-1.5-pro"
EOF
```

## Usage

```bash
# Run the conversational agent
python app_v4_conversational.py
```

The application will:
1. Launch on port **7864** (different from MVP on 7863)
2. Provide a **public Gradio link** for browser access
3. Display analytics progress in the console

## Example Conversation Flow

```
User: "What information is available?"
Agent: [Uses schema_info tool]
      → Shows 570k rows, 50 columns with data types

User: "Tell me about revenues, loans, deposits, and credit card flags"
Agent: [Uses column_details tool]
      → Shows averages, percentiles, flag distributions

User: "Understand relationship between revenues and those variables"
Agent: [Uses correlation_analysis tool]
      → Ranks correlations with total_revenues

User: "More detail about mortgages vs other loans"
Agent: [Uses grouped_averages + flag_comparison tools]
      → Breaks down by has_open_mortgage flag

User: "How do results change by country and segment?"
Agent: [Uses grouped_averages with multiple groupings]
      → Multi-dimensional analysis

User: "Which variables are most important?"
Agent: [Uses linear_regression_drivers with grouping]
      → Regression coefficients by country
```

## Differences from MVP (app_mvp.py)

| Feature | MVP (app_mvp.py) | v4 Conversational |
|---------|------------------|-------------------|
| Interaction | Single query → Full 4-phase analysis | Multi-turn conversation |
| Tool Selection | Fixed pipeline | LLM-based adaptive routing |
| Complexity | Always runs all phases | Starts simple, goes advanced as needed |
| Memory | None (stateless) | Last 8 turns with pruning |
| Port | 7863 | 7864 |
| Speed | 30-60 seconds per query | 1-30 seconds depending on tools |
| Use Case | Deep dive analysis | Exploratory data analysis |

## Architecture

```
User Question
    ↓
Conversational Memory (last 8 turns)
    ↓
LLM-Based Tool Router (Gemini Pro)
    → Analyzes question + context
    → Selects tools + parameters
    → Returns execution plan
    ↓
Tool Executor
    → Runs selected tools sequentially
    → Handles errors gracefully
    → Compiles results
    ↓
Store in Conversation History
    ↓
Stream Results to User
```

## Technical Stack

- **LLM**: Google Gemini 1.5 Pro via OpenAI-compatible interface
- **Framework**: LangChain + OpenAI SDK + Gradio
- **ML**: scikit-learn (KMeans, LinearRegression, DecisionTree)
- **Statistics**: scipy (mutual_info, chi2_contingency, z-scores)
- **Data**: pandas, numpy

## Configuration

**Default Models:**
- Gemini Pro (`gemini-1.5-pro`) - for tool routing and complex reasoning

**Environment Variables:**
```bash
OPENAI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/"
OPENAI_API_KEY="your-gemini-api-key-here"
GEMINI_PRO_MODEL="gemini-1.5-pro"  # Optional override
```

## Debugging

The application prints detailed logs to console:
- 📊 Data loading progress
- 🧠 Tool routing decisions
- ⚡ Tool execution status
- ⚠️ Errors and warnings

Monitor console output to track agent reasoning and tool selection.

## Next Steps (Future Enhancements)

1. **Scotiabank Writing Style**: Add executive-friendly language to insights
2. **Enhanced Output Formatting**: Better tables and visualizations
3. **MoM/QoQ Trends**: Extract month-over-month and quarter-over-quarter trends
4. **Chi-Square Tests**: Add categorical relationship testing
5. **Decision Tree Analysis**: Add interpretable tree-based models

## Support

For questions or issues:
1. Check console logs for detailed error messages and tool routing decisions
2. Verify `OPENAI_API_KEY` is set correctly
3. Ensure scipy is installed: `pip install scipy>=1.10.0`
4. Refer to Vector Institute Agent Bootcamp facilitators

## License

Vector Institute Agent Bootcamp Project
