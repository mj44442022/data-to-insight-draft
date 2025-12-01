# AI Business Insights Generator - MVP

**Vector Institute Agent Bootcamp Project**

An agentic AI system that generates automatic, reliable, accurate, actionable business insights for executive leaders at an international retail bank.

---

## 🎯 Project Overview

This MVP demonstrates **research-backed prompt engineering excellence** for business intelligence. The focus is on creating high-quality prompts that produce reliable insights, not building complex infrastructure.

### Key Features

✅ **3-Agent System** orchestrated with LangGraph
✅ **Research-Backed Prompts** applying 12 techniques from 2024-2025 studies
✅ **Data Feasibility Validation** (prevents impossible analyses like YoY with <12 months)
✅ **Strict Output Formatting** (≤200 words, executive-ready)
✅ **Banking Domain Expertise** (LDR, NIM, penetration rates, etc.)
✅ **Single-File Deployment** (easy copy-paste)
✅ **Backend Data Loading** (no manual uploads needed)

---

## 🏗️ Architecture

### Agent System

```
┌─────────────────────────────────────────────────────────┐
│                  ORCHESTRATOR AGENT                      │
│  • Classifies user intent                               │
│  • Validates data feasibility (CRITICAL)                │
│  • Synthesizes final output                             │
└─────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                  ▼
┌──────────────────┐            ┌──────────────────┐
│  DATA EXPLORER   │            │ INSIGHT GENERATOR│
│  • Quality checks│            │ • Deep analysis  │
│  • Trend ID      │───────────▶│ • Banking metrics│
│  • Top 3 trends  │            │ • Root causes    │
└──────────────────┘            └──────────────────┘
                                         │
                                         ▼
                              ┌──────────────────┐
                              │  FINAL SYNTHESIS │
                              │  ≤200 words      │
                              └──────────────────┘
```

### LangGraph Workflow

1. **Classify Intent** → Parse question, identify metrics, check feasibility
2. **Conditional Stop** → If data insufficient (e.g., YoY with 6 months), stop and offer alternative
3. **Data Explorer** → Quality assessment, trend identification (top 3)
4. **Insight Generator** → Statistical analysis, banking metrics, findings
5. **Final Synthesis** → Integrate with strategy, format for executives

---

## 📚 Prompt Engineering Techniques Applied

This MVP showcases **12 research-backed techniques** from leading papers:

### 1. **Clear Role Definitions**
Each agent has explicit expertise and context:
```
"You are a senior business analyst at Scotiabank with 10+ years of experience..."
```

### 2. **Chain-of-Thought (CoT) Reasoning**
Step-by-step instructions for complex analysis:
```
STEP 1: Understand the trends
STEP 2: Plan your analysis
STEP 3: Execute analysis
STEP 4: Synthesize findings
```

### 3. **Structured Output Formats**
JSON schemas with exact structure requirements:
```json
{
  "finding": "[30 words max]",
  "root_cause": "[25 words max]",
  "business_impact": "[25 words max]",
  "confidence": "HIGH|MEDIUM|LOW"
}
```

### 4. **Explicit Constraints**
Data limitations stated upfront:
```
CRITICAL: We only have 6 months of data
✓ MoM: POSSIBLE
✓ QoQ: POSSIBLE
✗ YoY: IMPOSSIBLE
```

### 5. **Verification Steps**
Self-checking mechanisms before output:
```
✓ Are percentages accurate?
✓ Does finding answer "so what?"?
✓ Is output ≤200 words?
```

### 6. **Emotional Stakes**
Importance emphasis for quality:
```
"This will be presented to the CEO and Board.
Accuracy is critical to your career advancement."
```

### 7. **Few-Shot Examples**
1-3 examples of good vs. bad outputs:
```
Example 1 - GOOD:
{finding with specific numbers, root cause, impact}

Example 2 - BAD:
{vague finding with no actionable insights}
```

### 8. **Domain Expertise Injection**
Banking formulas and metrics embedded:
```
Loan-to-Deposit Ratio (LDR) = Total Loans / Total Deposits
Healthy range: 80-90%
>100% = liquidity risk
```

### 9. **Plan-and-Solve Approach**
Plan → Execute → Verify workflow:
```
STEP 1: UNDERSTAND
STEP 2: PLAN
STEP 3: EXECUTE
STEP 4: VERIFY
```

### 10. **Clear Delimiters**
Structured sections with headers:
```
### ROLE
### TASK
### CONTEXT
### CONSTRAINTS
### OUTPUT FORMAT
```

### 11. **Positive Framing**
What to DO, not what NOT to do:
```
✓ "Include only metrics: loans, deposits, revenue"
✗ "Don't include irrelevant metrics"
```

### 12. **Consistency Across Agents**
Same terminology and patterns throughout.

### Research Sources

- "Principled Instructions Are All You Need" (2024)
- "The Prompt Report: A Systematic Survey" (arXiv 2406.06608)
- "Systematic Survey of Prompt Engineering" (arXiv 2402.07927)
- EmotionPrompt research
- Chain-of-Thought papers (Wei et al.)

---

## 💾 Data Structure

### Synthetic Banking Dataset (6 months, monthly snapshots)

**Time Dimension:**
- `business_effective_date`: 2024-07-31 to 2024-12-31 (6 months)

**Geographies:**
- Canada, Chile, Mexico, Peru

**Customer Segments:**
- High Value (~10% of customers)
- Low Value (~90% of customers)

**Key Metrics:**
- `total_loans_balance` (CAD)
- `total_deposit_balance` (CAD)
- `total_revenues` (CAD)

**Product-Level Balances:**
- Credit cards, mortgages, auto loans, personal loans
- Checking, payroll, high-yield savings

**Product Flags:**
- `has_open_credit_card`, `has_open_mortgage`, etc.

**Customer Attributes:**
- `product_count`, `is_churned`, `is_new`, `is_priority_customer`
- `is_high_digital`, `is_d2d`, `purchase_amount_last_month`

**Important Notes:**
- All currency in CAD (Canadian Dollars)
- Panel data: Each customer appears in all 6 months
- YoY comparisons NOT possible (only 6 months)
- Segments are ~10:1 ratio (Low Value has 10x more customers)

---

## 🚀 Installation & Setup

### Prerequisites

```bash
# Ensure you're in the Vector Institute Agent Bootcamp environment
# with the following libraries available:
- pandas
- numpy
- scipy
- scikit-learn
- langchain-anthropic
- langgraph
- gradio
- python-dotenv
- pypdf (or PyPDF2)
- requests
```

### Environment Variables

Create or update `.env` file in project root:

```bash
# Anthropic API (REQUIRED)
ANTHROPIC_API_KEY="sk-ant-..."

# LangFuse (optional - for tracing)
LANGFUSE_SECRET_KEY="..."
LANGFUSE_PUBLIC_KEY="..."
LANGFUSE_HOST="https://..."

# E2B API (optional - not used in MVP)
E2B_API_KEY="..."
```

### File Structure

```
data-to-insight-draft/
├── .env
└── src/
    └── 0_agent_ai_insight/
        ├── app.py                    # Single-file MVP (THIS IS THE MAIN FILE)
        ├── README.md                 # This documentation
        └── banking_data.csv          # Optional: your own data
                                      # (if missing, sample data is generated)
```

---

## ▶️ Running the Application

### Quick Start

```bash
# Navigate to the directory
cd /home/user/data-to-insight-draft/src/0_agent_ai_insight

# Run with uv (recommended)
uv run --env-file ../../.env gradio app.py

# OR run with python directly
python app.py
```

### What Happens at Startup

1. **Data Loading:**
   - Tries to read `banking_data.csv` from same directory
   - If not found, generates 3,000 rows of realistic sample data
   - Displays status: ✅ Loaded or ⚠️ Using sample data

2. **Strategy Context:**
   - Fetches Scotiabank Q3 2025 Investor Presentation (PDF)
   - Extracts strategic priorities from first 10 pages
   - Falls back to hardcoded strategy if PDF unavailable
   - Displays status: ✅ Loaded or ⚠️ Using fallback

3. **Gradio Interface:**
   - Opens at `http://localhost:7860`
   - Ready to accept business questions

---

## 💡 Usage Examples

### Example Questions

1. **"What's driving loan growth across countries?"**
   - Analyzes loan balances by country
   - Identifies top performers
   - Provides MoM and 6-month trends

2. **"Which segment has the highest revenue potential?"**
   - Compares High Value vs. Low Value
   - Calculates revenue per customer
   - Recommends growth strategies

3. **"Are we losing high-value customers?"**
   - Analyzes churn rates by segment
   - Quantifies revenue at risk
   - Identifies root causes

4. **"What's our loan-to-deposit ratio by country?"**
   - Calculates LDR for each geography
   - Flags liquidity risks
   - Compares to 80-90% healthy range

5. **"How is credit card penetration trending in Mexico?"**
   - Tracks product adoption over 6 months
   - Compares to other countries
   - Suggests cross-sell opportunities

### Questions That Trigger Feasibility Stop

**❌ "Show me year-over-year deposit trends"**

**System Response:**
```
DATA INSUFFICIENT FOR REQUESTED ANALYSIS

Your question requested: Year-over-year deposit comparison

Issue: Only 6 months available, need 12+ for YoY

Alternative: I can show you month-over-month trends
for the past 6 months instead.

Would you like me to proceed with the alternative analysis?
```

---

## 📊 Output Format

All outputs follow this strict structure:

```
EXECUTIVE SUMMARY
[2-3 sentences, MAX 40 words, stating key finding + impact]

KEY FINDINGS
• [Finding 1: What + Impact + Why, MAX 25 words]
• [Finding 2: What + Impact + Why, MAX 25 words]
• [Finding 3: What + Impact + Why, MAX 25 words]

RECOMMENDED ACTIONS
1. [Action + Expected impact, MAX 20 words]
2. [Action + Expected impact, MAX 20 words]
3. [Action + Expected impact, MAX 20 words]

DATA NOTES
[Only if critical issues - MAX 15 words]
```

### Writing Principles

✅ **DO:**
- Active voice: "Revenue dropped 12%"
- Specific numbers: "15.3% decline"
- Lead with impact: Answer "so what?"
- Present tense: "Revenue grows"

❌ **DON'T:**
- "It is important to note that..."
- "The data shows that..."
- "We can see that..."
- Hedge words: "somewhat," "quite," "fairly"

### Total Word Limit

**NEVER exceed 200 words total.**

This is enforced through:
1. Explicit constraints in prompts
2. Verification checklist before output
3. Word count instructions per section

---

## 🧪 Testing

### Manual Testing

1. Start the application
2. Try each example question
3. Verify outputs are ≤200 words
4. Check that specific numbers are included
5. Confirm "so what?" is answered in each finding

### Test Cases Covered

✅ **Feasibility Validation:**
- YoY request with 6 months data → Stops, offers MoM alternative

✅ **Data Quality:**
- Handles missing columns gracefully
- Excludes columns with >30% nulls
- Flags outliers

✅ **Output Formatting:**
- Word limits enforced
- No forbidden phrases
- Specific percentages and $ amounts

✅ **Banking Metrics:**
- LDR calculated correctly (Total Loans / Total Deposits)
- Revenue per customer by segment
- Product penetration rates

---

## 🛠️ Technical Implementation Details

### LangGraph State Management

```python
class InsightState(TypedDict):
    # Inputs
    question: str
    data: pd.DataFrame
    strategy_context: str

    # Orchestrator
    intent: Dict[str, Any]
    feasibility_check: Dict[str, Any]

    # Data Explorer
    data_quality: Dict[str, Any]
    trends: List[Dict[str, Any]]
    explorer_summary: str

    # Insight Generator
    findings: List[Dict[str, Any]]

    # Final
    final_output: str
    error: str
```

### Agent Node Functions

Each node is a pure function: `(state) -> state`

```python
def orchestrator_classify_intent(state: InsightState) -> InsightState:
    # Uses ORCHESTRATOR_INTENT_PROMPT
    # Returns updated state with 'intent' populated
    pass

def data_explorer_agent(state: InsightState) -> InsightState:
    # Uses DATA_EXPLORER_PROMPT
    # Returns updated state with 'trends' populated
    pass

def insight_generator_agent(state: InsightState) -> InsightState:
    # Uses INSIGHT_GENERATOR_PROMPT
    # Returns updated state with 'findings' populated
    pass

def orchestrator_synthesize(state: InsightState) -> InsightState:
    # Uses ORCHESTRATOR_SYNTHESIS_PROMPT
    # Returns updated state with 'final_output' populated
    pass
```

### Conditional Edge

```python
def should_stop_for_feasibility(state: InsightState) -> Literal["stop", "continue"]:
    feasibility = state.get('feasibility_check', {})
    if not feasibility.get('passed', True):
        return "stop"
    return "continue"
```

### Graph Construction

```python
workflow = StateGraph(InsightState)

workflow.add_node("classify_intent", orchestrator_classify_intent)
workflow.add_node("explore_data", data_explorer_agent)
workflow.add_node("generate_insights", insight_generator_agent)
workflow.add_node("synthesize", orchestrator_synthesize)

workflow.set_entry_point("classify_intent")
workflow.add_conditional_edges(
    "classify_intent",
    should_stop_for_feasibility,
    {"stop": END, "continue": "explore_data"}
)
workflow.add_edge("explore_data", "generate_insights")
workflow.add_edge("generate_insights", "synthesize")
workflow.add_edge("synthesize", END)

app = workflow.compile()
```

### LLM Configuration

```python
llm = ChatAnthropic(
    model="claude-sonnet-4-5-20250929",
    api_key=os.getenv("ANTHROPIC_API_KEY"),
    temperature=0  # Deterministic for business insights
)
```

---

## 📈 Banking Metrics Calculated

### 1. Loan-to-Deposit Ratio (LDR)

```python
LDR = (Total Loans / Total Deposits) × 100%
```

- **Healthy range:** 80-90%
- **>100%:** Liquidity risk (lending more than deposits)
- **<70%:** Underutilizing deposits

### 2. Revenue per Customer (RPC)

```python
RPC = Total Revenue / Number of Customers
```

- **High Value target:** 5-10x Low Value
- **Declining RPC:** Profitability pressure

### 3. Product Penetration

```python
Penetration = (Customers with product / Total customers) × 100%
```

- **Benchmark:** 3+ products per customer
- **High Value target:** 4-5 products

### 4. Net Interest Margin (NIM)

```python
NIM = (Interest Income - Interest Expense) / Average Assets
```

- **Typical range:** 2.5-3.5% for retail banking

### 5. Churn Impact

```python
Annual Revenue at Risk = Churned Customers × RPC × 12 months
```

---

## 🎓 Learning Outcomes

This MVP demonstrates mastery of:

1. **Prompt Engineering Research Application**
   - Translating academic papers into production prompts
   - Combining multiple techniques for maximum effectiveness

2. **Agent Orchestration**
   - Multi-agent systems with LangGraph
   - State management and conditional flows
   - Error handling and graceful degradation

3. **Domain Expertise Integration**
   - Banking metrics and terminology
   - Industry benchmarks and thresholds
   - Real-world business constraints

4. **Executive Communication**
   - Concise, scannable output (≤200 words)
   - "So what?" answering (impact focus)
   - Active voice and specific numbers

5. **Data Feasibility Validation**
   - Preventing impossible analyses
   - Offering alternatives proactively
   - User-friendly error messaging

---

## 🔮 Future Enhancements (Beyond MVP)

### Near-Term
- [ ] LangFuse tracing integration for debugging
- [ ] E2B sandboxed code execution for complex calculations
- [ ] Vector DB (Weaviate) for strategy RAG
- [ ] Web search for real-time context

### Medium-Term
- [ ] Historical insight storage and comparison
- [ ] Multi-turn conversation support
- [ ] Custom banking metric definitions
- [ ] Export to PowerPoint/PDF

### Long-Term
- [ ] Real-time data pipeline integration
- [ ] Automated insight scheduling (daily/weekly reports)
- [ ] Multi-language support
- [ ] Advanced forecasting models

---

## 📝 Development Notes

### Why Single File?

This MVP is a **single `app.py` file** for:
- ✅ Easy copy-paste deployment
- ✅ No import/path issues
- ✅ Quick iteration in bootcamp environment
- ✅ Self-contained demonstration

For production, you would split into:
```
src/
├── agents/
│   ├── orchestrator.py
│   ├── data_explorer.py
│   └── insight_generator.py
├── prompts/
│   └── templates.py
├── utils/
│   ├── data_loader.py
│   └── metrics.py
└── app.py
```

### Prompt Engineering Trade-offs

**Long prompts (used here) are ideal when:**
- Task is complex and multi-step
- Domain expertise needed
- Output format must be exact
- Consistency is critical

**Short prompts work better when:**
- Task is simple and well-defined
- Model has relevant pretraining
- Creativity is desired

For business intelligence, **long, structured prompts win** because:
- Reduces hallucination risk
- Ensures consistency across runs
- Embeds domain knowledge
- Produces reliable, auditable outputs

---

## 🐛 Troubleshooting

### Issue: "ANTHROPIC_API_KEY not found"

**Solution:**
```bash
# Check .env file exists in project root
ls /home/user/data-to-insight-draft/.env

# Verify ANTHROPIC_API_KEY is set
cat .env | grep ANTHROPIC

# Run with explicit env file path
uv run --env-file /path/to/.env gradio app.py
```

### Issue: "PDF fetch failed"

**Solution:**
- Check internet connectivity
- Verify URL is accessible
- System will automatically use fallback strategy context
- No action needed - insights still work

### Issue: "Banking data not found"

**Solution:**
- System automatically generates sample data
- ✅ This is expected behavior
- To use custom data: Place `banking_data.csv` in same directory as `app.py`

### Issue: "Output exceeds 200 words"

**Solution:**
- This indicates a prompt issue
- Check synthesis prompt constraints
- Verify word count enforcement in verification step
- Should not happen with current prompts

### Issue: "Agent timeout or slow response"

**Solution:**
- Claude Sonnet 4.5 can take 10-30 seconds for complex analysis
- This is normal - agent is doing deep thinking
- Check API rate limits if consistently slow

---

## 📄 License

This project is part of the Vector Institute Agent Bootcamp.

---

## 👥 Author

**Majo** - Vector Institute Agent Bootcamp Participant

**Project**: AI Insights Generator MVP for International Banking

**Focus**: Research-backed prompt engineering for business intelligence

---

## 🙏 Acknowledgments

- **Vector Institute** for the Agent Bootcamp program
- **Anthropic** for Claude Sonnet 4.5 and prompt engineering research
- **LangChain/LangGraph** teams for agent orchestration frameworks
- **Research papers** that informed the 12 prompt techniques applied

---

## 📚 Additional Resources

### Research Papers
1. "Principled Instructions Are All You Need for Questioning LLaMA-1/2, GPT-3.5/4" (2024)
2. "The Prompt Report: A Systematic Survey of Prompting Techniques" (arXiv 2406.06608)
3. "Prompt Engineering for Large Language Models: A Systematic Survey" (arXiv 2402.07927)
4. "Unleashing the potential of prompt engineering in Large Language Models" (arXiv 2310.14735)

### Tools & Frameworks
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [Gradio Documentation](https://www.gradio.app/docs)

### Banking Resources
- Scotiabank Investor Relations
- Retail Banking Metrics Standards (Basel III)
- Banking Industry Benchmarks

---

**Last Updated:** December 2025

**Version:** 1.0.0 (MVP)

---

