# 🏦 Scotiabank Insight Generator Agent

An AI-powered agent system that automatically analyzes banking customer data and generates actionable business insights. Built using the **Vector Institute's agent-bootcamp** patterns and the **OpenAI Agents SDK**.

## 🎯 Overview

This MVP demonstrates an **Insight Generator Agent** that:

- 📊 **Analyzes** customer data to detect trends and patterns
- 🔍 **Identifies** correlations between products, segments, and revenue
- 💡 **Generates** business-friendly insights in natural language
- 🎯 **Recommends** actionable next steps for business stakeholders

### Key Features

- **Multi-Agent Architecture**: Separates data analysis from insight generation
- **Code Interpreter Integration**: Uses E2B for sandboxed Python execution
- **Business-Friendly Output**: Translates technical metrics into executive insights
- **Interactive UI**: Gradio interface with quick-start analysis options
- **Real Data Analysis**: Works with actual banking customer datasets

## 🏗️ Architecture

The system implements a multi-agent pattern based on Vector Institute's best practices:

```
┌─────────────────────────────────────────────────────────────┐
│                    Insight Generator Agent                   │
│                      (GPT-4o - Strategic)                    │
│  • Interprets analysis results                              │
│  • Generates business insights                              │
│  • Recommends actions                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ calls as tool
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data Analyzer Agent                        │
│                   (GPT-4o-mini - Tactical)                   │
│  • Loads and explores data                                  │
│  • Performs statistical analysis                            │
│  • Calculates correlations                                  │
│  • Detects patterns                                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ uses
                        ↓
                 ┌──────────────┐
                 │E2B Sandbox   │
                 │Code Executor │
                 │(pandas/numpy)│
                 └──────────────┘
```

### Design Patterns

Based on Vector Institute's agent-bootcamp:

1. **Multi-Agent Orchestration**: Separation of concerns between analysis and insight generation
2. **Agent-as-Tool Pattern**: Data analyzer exposed as a tool to insight generator
3. **Code Interpreter Pattern**: Sandboxed Python execution for data analysis
4. **Async Workflows**: Efficient handling of multiple requests
5. **Structured Outputs**: Clear, validated insight schemas

## 📦 Installation

### Prerequisites

- Python 3.12+
- OpenAI API key
- E2B API key (for code interpreter, or use simplified mode)

### Setup

1. **Clone the repository**:
```bash
cd data-to-insight-draft
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env and add your API keys:
# OPENAI_API_KEY=your_key_here
# E2B_API_KEY=your_e2b_key_here (optional)
```

### Environment Variables

Required:
- `OPENAI_API_KEY`: Your OpenAI API key

Optional:
- `E2B_API_KEY`: For code interpreter (falls back to simplified mode without it)
- `OPENAI_BASE_URL`: Custom OpenAI-compatible endpoint
- `MODEL_ANALYZER`: Model for data analysis (default: `gpt-4o-mini`)
- `MODEL_INSIGHT_GENERATOR`: Model for insights (default: `gpt-4o`)

## 🚀 Usage

### Option 1: Gradio Web Interface (Recommended)

Launch the interactive web UI:

```bash
python src/app.py
```

Then open your browser to `http://localhost:7860`

**Features**:
- 🎨 Beautiful, intuitive interface
- 🚀 Quick-start buttons for common analyses
- 💬 Chat-style interaction
- 📊 Real-time insight generation

### Option 2: Command-Line Interface

For quick testing without the UI:

```bash
python src/cli.py
```

**Workflow**:
1. Choose a quick-start option (1-6) or type your own query
2. Agent analyzes the data and generates insights
3. View results in the terminal

### Example Queries

Try asking:

- **Churn Analysis**: *"What patterns exist in churned customers? Which segments have the highest churn?"*
- **Revenue Drivers**: *"What factors correlate with higher revenue? Which customers are most valuable?"*
- **Product Opportunities**: *"What are the most popular product combinations? Where are cross-sell opportunities?"*
- **Segment Performance**: *"How do different customer segments perform? Which should we prioritize?"*
- **Regional Trends**: *"What regional patterns exist in customer behavior and product adoption?"*
- **Digital Impact**: *"How does digital adoption affect customer value and retention?"*

## 📊 Data Schema

The agent analyzes banking customer data with the following structure:

### Customer Demographics
- `country_name`, `country_cd`, `region`: Geographic location
- `segment`: Customer segment (High Potential, Medium Actual, etc.)
- `client_hash_id`: Unique customer identifier

### Product Holdings (Boolean flags)
- `has_open_credit_card`
- `has_open_checking_account`
- `has_open_high_yield_savings`
- `has_open_personal_loan`
- `has_open_mortgage`
- `has_open_auto_loan`
- `has_open_investment`
- `has_open_insurance`
- `has_open_payroll_product`
- `product_count`: Total number of products

### Financial Metrics
- `total_revenues`: Total revenue from customer
- `total_lending_balance`: Total lending balance (CAD)
- `total_deposit_balance`: Total deposit balance (CAD)
- `payroll_balance_cad`, `auto_loan_balance_cad`, etc.: Product-specific balances
- `credit_card_balance_cad`

### Behavioral Indicators
- `is_churned`: Whether customer has churned
- `is_new`: New customer flag
- `is_digital`: Digital adoption
- `high_activity_month`: High activity indicator
- `is_priority_customer`: Priority customer flag
- `purchase_count_last_month`, `purchase_amount_last_month`: Recent activity

### Other
- `business_effective_date`: Customer start date
- `entry_product`: First product acquired

## 🔧 Project Structure

```
data-to-insight-draft/
├── src/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── data_analyzer.py        # Code interpreter agent
│   │   └── insight_generator.py    # Main insight agent
│   ├── utils/
│   │   ├── __init__.py
│   │   └── prompts.py              # Centralized prompts
│   ├── app.py                       # Gradio web interface
│   └── cli.py                       # Command-line interface
├── data/
│   └── sample_banking_data.csv     # Sample customer data
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment template
└── README.md                        # This file
```

## 🎓 Based on Vector Institute Agent Bootcamp

This project implements patterns from the **Vector Institute's agent-bootcamp**:

### Key Learnings Applied

1. **Multi-Agent Architecture**:
   - Worker agent (data analyzer) with fast model for analysis
   - Orchestrator agent (insight generator) with powerful model for reasoning
   - Agent-as-tool pattern for clean abstraction

2. **Code Interpreter Integration**:
   - E2B sandbox for secure Python execution
   - Pandas/NumPy for data analysis
   - Structured analysis outputs

3. **Production Best Practices**:
   - Centralized prompt management
   - Environment-based configuration
   - Error handling and fallback modes
   - Clean separation of concerns

4. **User Experience**:
   - Gradio interface for accessibility
   - Quick-start options for common queries
   - Clear, formatted outputs

### Dependencies from Agent Bootcamp

- `openai-agents>=0.1.0`: Core agent framework
- `e2b-code-interpreter>=1.5.2`: Sandboxed code execution
- `gradio>=5.37.0`: Web UI
- `pydantic>=2.11.7`: Data validation
- Standard data science stack: `pandas`, `numpy`, `scikit-learn`

## 💡 How It Works

### Simplified Mode (No E2B)

1. User submits a query
2. System loads customer data and calculates basic statistics
3. Insight Generator receives data summary + user query
4. Agent generates business insights based on the statistics
5. Results displayed in natural language

### Full Mode (With E2B)

1. User submits a query
2. Insight Generator determines what analysis is needed
3. Calls Data Analyzer agent as a tool
4. Data Analyzer executes Python code in E2B sandbox:
   - Loads CSV data
   - Performs statistical analysis
   - Calculates correlations
   - Identifies patterns
5. Returns structured results to Insight Generator
6. Insight Generator interprets findings and generates insights
7. Results formatted and displayed to user

## 🔍 Sample Insights Generated

The agent can generate insights like:

> **Executive Summary**
>
> Our analysis reveals three critical areas requiring immediate attention:
>
> **1. Churn Crisis in Single-Product Customers (58% churn rate)**
> - Customers with only one product show significantly higher churn (58%) vs. multi-product customers (32%)
> - **Action**: Implement aggressive cross-sell campaigns within first 90 days
>
> **2. Digital Dividend: 12% Revenue Premium**
> - Digital customers generate $98.50 average revenue vs. $87.20 for non-digital
> - Digital users also show 18% lower churn
> - **Action**: Accelerate digital migration initiatives, prioritize mobile app enhancements
>
> **3. High Potential Segment Underperformance**
> - Despite highest revenue per customer ($142.50), penetration is only 21%
> - **Action**: Review scoring model, expand targeting criteria

## 🛠️ Extending the Agent

### Adding New Analysis Types

1. Update `QUICK_ANALYSIS_QUERIES` in `src/utils/prompts.py`
2. Add corresponding analysis logic if needed
3. Update Gradio UI buttons in `src/app.py`

### Customizing Prompts

Edit prompts in `src/utils/prompts.py`:
- `DATA_ANALYZER_INSTRUCTIONS`: How the analyzer works
- `INSIGHT_GENERATOR_INSTRUCTIONS`: How insights are generated
- `ANALYSIS_REQUEST_TEMPLATE`: Default analysis template

### Using Your Own Data

1. Replace `data/sample_banking_data.csv` with your data
2. Update data schema documentation in prompts
3. Adjust analysis queries for your domain

## 📝 License

This project is provided as-is for educational and demonstration purposes.

## 🙏 Acknowledgments

Built using patterns from the **Vector Institute's Agent Bootcamp**:
- GitHub: https://github.com/VectorInstitute/agent-bootcamp
- Multi-agent orchestration patterns
- Code interpreter integration
- Production-ready agent architecture

---

**Built with ❤️ for Scotiabank's Data & Analytics Team**
