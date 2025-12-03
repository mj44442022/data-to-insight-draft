# ============================================================================
# AI BUSINESS INSIGHTS GENERATOR - MVP
# Vector Institute Agent Bootcamp
# ============================================================================
# CRITICAL: This is a single-file implementation demonstrating research-backed
# prompt engineering for business intelligence in retail banking.
#
# PROMPT ENGINEERING TECHNIQUES APPLIED (from 2024-2025 research):
# 1. Clear role definitions and expertise injection
# 2. Chain-of-thought (CoT) reasoning with step-by-step instructions
# 3. Structured output formats (JSON schemas)
# 4. Explicit constraints and data limitations
# 5. Verification steps and self-checking
# 6. Emotional stakes and importance emphasis
# 7. Few-shot examples for critical tasks
# 8. Domain expertise embedding (banking metrics)
# 9. Plan-and-solve approach (plan → execute → verify)
# 10. Clear delimiters and formatting
# 11. Positive framing with explicit exclusions
# 12. Consistency across all agent prompts
#
# Sources: "Principled Instructions Are All You Need" (2024),
# "The Prompt Report" (arXiv 2406.06608), EmotionPrompt research
# ============================================================================

# ============================================================================
# DEPENDENCY CHECKING - Fail fast with helpful error messages
# ============================================================================
import sys

def check_dependencies():
    """Check for required dependencies and provide helpful installation instructions"""
    missing_deps = []
    install_commands = []

    # Check standard libraries first (these should always work)
    try:
        import os
        import json
        from pathlib import Path
        from datetime import datetime
        from typing import TypedDict, List, Dict, Any
        from io import BytesIO
    except ImportError as e:
        print(f"❌ CRITICAL: Standard library import failed: {e}")
        print("This should not happen. Please check your Python installation.")
        sys.exit(1)

    # Check core data science libraries
    try:
        import pandas as pd
        import numpy as np
    except ImportError as e:
        missing_deps.append("pandas and/or numpy")
        install_commands.append("pip install pandas numpy")

    try:
        from scipy import stats
    except ImportError:
        missing_deps.append("scipy")
        install_commands.append("pip install scipy")

    try:
        from sklearn.linear_model import LinearRegression
    except ImportError:
        missing_deps.append("scikit-learn")
        install_commands.append("pip install scikit-learn")

    # Check LangChain dependencies (CRITICAL)
    try:
        from langchain_core.messages import HumanMessage, SystemMessage
    except ImportError:
        missing_deps.append("langchain-core")
        install_commands.append("pip install langchain-core")

    try:
        from langchain_openai import ChatOpenAI
    except ImportError:
        missing_deps.append("langchain-openai")
        install_commands.append("pip install langchain-openai")

    try:
        from langgraph.graph import StateGraph, END
    except ImportError:
        missing_deps.append("langgraph")
        install_commands.append("pip install langgraph")

    # Check Gradio (CRITICAL for UI)
    try:
        import gradio as gr
    except ImportError:
        missing_deps.append("gradio")
        install_commands.append("pip install gradio")

    # Check other utilities
    try:
        import requests
    except ImportError:
        missing_deps.append("requests")
        install_commands.append("pip install requests")

    try:
        from dotenv import load_dotenv
    except ImportError:
        missing_deps.append("python-dotenv")
        install_commands.append("pip install python-dotenv")

    # If any dependencies are missing, show helpful error and exit
    if missing_deps:
        print("\n" + "="*80)
        print("❌ MISSING REQUIRED DEPENDENCIES")
        print("="*80)
        print(f"\nThe following packages are required but not installed:")
        for dep in missing_deps:
            print(f"  • {dep}")

        print(f"\n📦 QUICK FIX - Run these commands:")
        print("-" * 80)
        for cmd in install_commands:
            print(f"  {cmd}")

        print("\n💡 OR install everything at once:")
        print("-" * 80)
        print("  pip install -r requirements.txt")
        print("\n  (Make sure requirements.txt is in the same directory as app.py)")

        print("\n🔗 Location of requirements.txt:")
        print(f"  {Path(__file__).parent / 'requirements.txt'}")

        print("\n" + "="*80)
        sys.exit(1)

    return True

# Run dependency check before importing anything else
print("🔍 Checking dependencies...")
check_dependencies()
print("✅ All dependencies found!\n")

# ============================================================================
# IMPORTS - All dependencies verified above
# ============================================================================
import os
from dotenv import load_dotenv
import gradio as gr
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
from typing import TypedDict, List, Dict, Any, Literal
import json
import requests
from io import BytesIO
from scipy import stats
from sklearn.linear_model import LinearRegression

# LangChain and LangGraph imports
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END

# PDF reading (optional - will use fallback if not available)
try:
    from pypdf import PdfReader
    print("📄 PDF reader available: pypdf")
except ImportError:
    try:
        from PyPDF2 import PdfReader
        print("📄 PDF reader available: PyPDF2")
    except ImportError:
        PdfReader = None
        print("⚠️  PDF reader not available - will use fallback strategy context")

load_dotenv()

# ============================================================================
# CONFIGURATION VALIDATION
# ============================================================================

print("🔑 Checking API key configuration...")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    print("\n" + "="*80)
    print("❌ ERROR: OPENAI_API_KEY not found in environment")
    print("="*80)
    print("\n📝 Please add your OpenAI API key to the .env file:")
    print("-" * 80)
    print('  OPENAI_API_KEY="sk-proj-..."')
    print("\n💡 Steps to fix:")
    print("  1. Get your API key from: https://platform.openai.com/api-keys")
    print("  2. Create/edit .env file in your project root")
    print("  3. Add the line above with your actual API key")
    print("  4. Restart the application")
    print("\n" + "="*80)
    sys.exit(1)

print(f"✅ OpenAI API key found (starts with: {OPENAI_API_KEY[:12]}...)")
print()

# ============================================================================
# CONFIGURATION
# ============================================================================

SCOTIABANK_INVESTOR_PRESENTATION_URL = "https://www.scotiabank.com/content/dam/scotiabank/corporate/quarterly-reports/2025/q3/Q325_Investor_Presentation_en.pdf"

# GPT-4 Turbo with temperature=0 for consistency
print("🤖 Initializing LLM (GPT-4 Turbo)...")
try:
    llm = ChatOpenAI(
        model="gpt-4-turbo-preview",  # or "gpt-4" for more stable version
        api_key=OPENAI_API_KEY,
        temperature=0  # Deterministic outputs for business insights
    )
    print("✅ LLM initialized successfully")
except Exception as e:
    print(f"\n❌ ERROR: Failed to initialize LLM: {e}")
    print("\nPlease check:")
    print("  • Your OpenAI API key is valid")
    print("  • You have internet connectivity")
    print("  • langchain-openai is properly installed")
    sys.exit(1)
print()

# ============================================================================
# DATA LOADING FUNCTIONS (BACKEND - NO GRADIO UPLOADS)
# ============================================================================

def generate_sample_banking_data(num_customers: int = 500) -> pd.DataFrame:
    """
    Generate synthetic banking data matching the exact structure specified.

    Dataset Structure:
    - Time: 6 months of monthly snapshots (2024-07-31 to 2024-12-31)
    - Countries: Canada, Chile, Mexico, Peru
    - Segments: High Value (10%), Low Value (90%)
    - Metrics: Loans, deposits, revenue, product balances, flags, attributes

    Returns DataFrame with realistic customer-level banking data.
    """
    np.random.seed(42)

    # Generate 6 months of data (monthly snapshots)
    end_date = pd.Timestamp('2024-12-31')
    dates = pd.date_range(end=end_date, periods=6, freq='ME')

    countries = ['Canada', 'Chile', 'Mexico', 'Peru']
    segments = ['High Value', 'Low Value']

    data = []

    # Generate customer base
    for customer_id in range(num_customers):
        # Assign country and segment (10% High Value, 90% Low Value)
        country = np.random.choice(countries)
        segment = np.random.choice(segments, p=[0.1, 0.9])

        # Each customer appears in all 6 months (panel data)
        for date in dates:
            # Base balances vary by segment
            if segment == 'High Value':
                loan_multiplier = np.random.uniform(50000, 200000)
                deposit_multiplier = np.random.uniform(30000, 100000)
            else:
                loan_multiplier = np.random.uniform(2000, 25000)
                deposit_multiplier = np.random.uniform(1000, 15000)

            # Add time trend (slight growth over 6 months)
            month_idx = list(dates).index(date)
            trend_factor = 1 + (month_idx * 0.02)  # 2% monthly growth

            # Country-specific variations
            country_factors = {
                'Canada': 1.0,
                'Mexico': 1.15,  # Higher growth in Mexico
                'Peru': 1.08,
                'Chile': 0.95   # Slower growth in Chile
            }
            country_factor = country_factors[country]

            # Product balances with realistic penetration rates
            has_cc = np.random.rand() > 0.4
            has_mortgage = np.random.rand() > 0.6
            has_auto = np.random.rand() > 0.75
            has_personal = np.random.rand() > 0.6
            has_checking = np.random.rand() > 0.3
            has_payroll = np.random.rand() > 0.6
            has_savings = np.random.rand() > 0.5
            has_investment = np.random.rand() > 0.7

            cc_balance = np.random.uniform(0, loan_multiplier * 0.2) * trend_factor * country_factor if has_cc else 0
            mortgage_balance = np.random.uniform(0, loan_multiplier * 0.8) * trend_factor * country_factor if has_mortgage else 0
            auto_balance = np.random.uniform(0, loan_multiplier * 0.25) * trend_factor * country_factor if has_auto else 0
            personal_balance = np.random.uniform(0, loan_multiplier * 0.15) * trend_factor * country_factor if has_personal else 0

            checking_balance = np.random.uniform(0, deposit_multiplier * 0.4) * trend_factor * country_factor if has_checking else 0
            payroll_balance = np.random.uniform(0, deposit_multiplier * 0.5) * trend_factor * country_factor if has_payroll else 0
            savings_balance = np.random.uniform(0, deposit_multiplier * 0.7) * trend_factor * country_factor if has_savings else 0

            total_loans = cc_balance + mortgage_balance + auto_balance + personal_balance
            total_deposits = checking_balance + payroll_balance + savings_balance

            # Revenue: ~2.5% of total balances (NIM approximation)
            nim_rate = np.random.uniform(0.022, 0.028)
            total_revenue = (total_loans + total_deposits) * nim_rate

            # Customer attributes
            product_count = sum([has_cc, has_mortgage, has_auto, has_personal,
                               has_checking, has_payroll, has_savings, has_investment])

            is_churned = np.random.rand() > 0.97  # 3% churn rate
            is_new = month_idx == 0 and np.random.rand() > 0.92  # 8% new in first month
            is_priority = segment == 'High Value' and np.random.rand() > 0.3
            is_high_digital = np.random.rand() > 0.45
            is_d2d = has_checking or has_payroll

            purchase_last_month = cc_balance * np.random.uniform(0.15, 0.45) if has_cc else 0

            record = {
                'business_effective_date': date,
                'country_name': country,
                'segment': segment,
                'total_loans_balance': total_loans,
                'total_deposit_balance': total_deposits,
                'total_revenues': total_revenue,
                'credit_card_balance_cad': cc_balance,
                'mortgage_balance_cad_loans': mortgage_balance,
                'auto_loan_balance_cad_loans': auto_balance,
                'personal_loan_balance_cad_loans': personal_balance,
                'checking_balance_cad_deposits': checking_balance,
                'payroll_balance_cad_deposits': payroll_balance,
                'high_yield_savings_balance_cad_deposits': savings_balance,
                'has_open_credit_card': has_cc,
                'has_open_mortgage': has_mortgage,
                'has_open_auto_loan': has_auto,
                'has_open_personal_loan': has_personal,
                'has_open_checking_account': has_checking,
                'has_open_payroll_product': has_payroll,
                'has_open_high_yield_savings': has_savings,
                'has_open_investment': has_investment,
                'product_count': product_count,
                'is_churned': is_churned,
                'is_new': is_new,
                'is_priority_customer': is_priority,
                'is_high_digital': is_high_digital,
                'is_d2d': is_d2d,
                'purchase_amount_last_month': purchase_last_month
            }
            data.append(record)

    df = pd.DataFrame(data)
    return df


def load_banking_data() -> tuple[pd.DataFrame, str]:
    """
    Load banking data from CSV in backend or generate sample data.
    NO GRADIO FILE UPLOAD - data loaded at startup.

    Returns: (dataframe, status_message)
    """
    # Try to read from same directory as app.py
    data_path = Path(__file__).parent / "banking_data.csv"

    if data_path.exists():
        try:
            df = pd.read_csv(data_path)
            # Convert date column to datetime
            df['business_effective_date'] = pd.to_datetime(df['business_effective_date'])
            status = f"✅ Loaded {len(df):,} rows from banking_data.csv"
            return df, status
        except Exception as e:
            # If CSV exists but can't be read, generate sample data
            df = generate_sample_banking_data(500)
            status = f"⚠️ Error reading CSV ({str(e)}). Using 3,000 rows of sample data"
            return df, status
    else:
        # No CSV found, generate sample data
        df = generate_sample_banking_data(500)
        status = f"⚠️ No CSV found at {data_path.name}. Using 3,000 rows of sample data"
        return df, status


def fetch_strategy_context() -> tuple[str, str]:
    """
    Fetch and extract text from Scotiabank's latest investor presentation.
    Falls back to hardcoded strategy if PDF unavailable.

    Returns: (strategy_text, status_message)
    """
    if PdfReader is None:
        # PDF library not available, use fallback
        return get_fallback_strategy_context()

    try:
        # Fetch PDF from URL with timeout
        response = requests.get(SCOTIABANK_INVESTOR_PRESENTATION_URL, timeout=15)
        response.raise_for_status()

        # Extract text from PDF
        pdf_file = BytesIO(response.content)
        reader = PdfReader(pdf_file)

        # Extract text from first 10 pages (strategic overview typically here)
        text_parts = []
        max_pages = min(10, len(reader.pages))
        for page_num in range(max_pages):
            page = reader.pages[page_num]
            text_parts.append(page.extract_text())

        strategy_text = "\n\n".join(text_parts)

        # Basic validation
        if len(strategy_text) < 500:
            return get_fallback_strategy_context()

        status = f"✅ Loaded strategy context from Q3 2025 Investor Presentation ({len(reader.pages)} pages)"
        return strategy_text, status

    except Exception as e:
        # Fallback to hardcoded strategy if any error
        return get_fallback_strategy_context()


def get_fallback_strategy_context() -> tuple[str, str]:
    """Fallback strategy context if PDF unavailable"""
    fallback_strategy = """
SCOTIABANK STRATEGIC PRIORITIES (2025)

1. CUSTOMER-CENTRIC GROWTH
   - Deepen relationships with existing customers through product penetration
   - Focus on high-value segments with premium banking and wealth services
   - Enhance customer experience through digital innovation
   - Target: Increase products per customer from 2.8 to 3.5

2. GEOGRAPHIC EXPANSION & OPTIMIZATION
   - Strengthen Pacific Alliance presence (Mexico, Peru, Chile)
   - Mexico: Priority growth market, target 10-12% loan CAGR
   - Peru & Chile: Optimize operations, improve efficiency
   - Canada: Defend market position, grow wealth and commercial banking

3. DIGITAL TRANSFORMATION
   - Accelerate digital adoption: Target 75% digital engagement by 2026
   - Mobile-first strategy for retail banking
   - AI-powered personalization and insights
   - Reduce branch dependency, optimize physical footprint

4. OPERATIONAL EXCELLENCE
   - Cost-to-income ratio: Target sub-55% by 2026
   - Simplify processes, automate back-office operations
   - Risk management: Maintain NPL ratio <1.5%
   - Strong capital position: CET1 ratio >11.5%

5. REVENUE DIVERSIFICATION
   - Grow non-interest income to 35% of total revenue
   - Expand credit card penetration, especially in High Value segment
   - Wealth management: Target 15% AUM growth annually
   - Payments and transaction banking growth

6. KEY FINANCIAL TARGETS
   - ROE: 13-16%
   - Loan growth: 6-8% annually
   - Revenue growth: 7-10% annually
   - Dividend payout: 50% of earnings

7. RISK MANAGEMENT
   - Maintain conservative credit culture
   - Diversified loan portfolio across geographies
   - Climate risk integration into lending decisions
   - Cybersecurity and data privacy investments
"""
    status = "⚠️ Using fallback strategy context (PDF unavailable)"
    return fallback_strategy, status


# ============================================================================
# STATE DEFINITION FOR LANGGRAPH
# ============================================================================

class InsightState(TypedDict):
    """State passed between agents in the workflow"""
    # Inputs
    question: str
    data: pd.DataFrame
    strategy_context: str

    # Orchestrator outputs
    intent: Dict[str, Any]
    feasibility_check: Dict[str, Any]

    # Data Explorer outputs
    data_quality: Dict[str, Any]
    trends: List[Dict[str, Any]]
    explorer_summary: str

    # Insight Generator outputs
    analyses: List[Dict[str, Any]]
    findings: List[Dict[str, Any]]

    # Final output
    final_output: str

    # Error handling
    error: str
    stop_reason: str


# ============================================================================
# EXCELLENT PROMPTS - RESEARCH-BACKED BEST PRACTICES
# ============================================================================
# These prompts demonstrate all 12 prompt engineering techniques from
# leading 2024-2025 research papers. Each prompt is annotated with the
# techniques applied.
# ============================================================================

# PROMPT 1: Intent Classification (Orchestrator)
# Techniques: Role definition, CoT, structured JSON output, constraints,
# verification, emotional stakes
ORCHESTRATOR_INTENT_PROMPT = """### ROLE
You are a senior business analyst at Scotiabank, an international retail bank operating across Canada, Mexico, Peru, and Chile. You have 10+ years of experience translating executive questions into actionable data analyses.

### TASK
Classify the user's business question to determine what analysis is needed. This classification is CRITICAL because it determines the entire workflow.

### CONTEXT
Available data characteristics:
- Time period: 6 months of customer-level snapshots (monthly)
- Date range: 2024-07-31 to 2024-12-31
- Countries: Canada, Chile, Mexico, Peru
- Segments: High Value (~10% of customers), Low Value (~90%)
- Key metrics: total_loans_balance, total_deposit_balance, total_revenues
- Product-level: credit cards, mortgages, auto loans, personal loans, checking, payroll, savings
- Customer attributes: churn, new customers, priority customers, digital adoption

### CONSTRAINTS - DATA FEASIBILITY (CRITICAL)
With only 6 months of data:
✓ Month-over-month (MoM) comparisons: POSSIBLE (need 2+ months)
✓ Quarter-over-quarter (QoQ) comparisons: POSSIBLE (need 6+ months)
✗ Year-over-year (YoY) comparisons: IMPOSSIBLE (need 12+ months)

### METHOD (Chain-of-Thought - Work Step by Step)
1. Read the user's question carefully and identify the core business question
2. Determine the primary metric(s) they're asking about
3. Identify the time dimension requested (MoM, QoQ, YoY, trend over time)
4. Check if this time comparison is POSSIBLE with our 6 months of data
5. Identify any segmentation dimensions (country, segment, product)
6. Assess analysis depth needed (quick overview vs. deep statistical dive)

### OUTPUT FORMAT
Respond in this exact JSON format (valid JSON only, no markdown):
{{
  "metric": "[loans|deposits|revenue|churn|penetration|profitability|other]",
  "metric_details": "[specific product or metric if mentioned]",
  "time_dimension": "[MoM|QoQ|6-month-trend|YoY_REQUESTED]",
  "segments": ["country", "segment", "product", etc.],
  "depth": "[overview|deep-dive]",
  "is_feasible": true|false,
  "reason_if_not_feasible": "[explain why data insufficient]",
  "alternative_if_not_feasible": "[what we CAN do instead - be specific]",
  "user_intent_summary": "[one-sentence summary of what user wants to know]"
}}

### VERIFICATION CHECKLIST
Before responding, verify:
✓ Have I correctly identified the primary metric?
✓ Is the requested time comparison actually POSSIBLE with 6 months of data?
✓ If not feasible, have I provided a specific, helpful alternative?
✓ Is my output valid JSON (no trailing commas, proper quotes)?
✓ Does my summary accurately capture user intent?

### IMPORTANCE
This classification determines the entire analysis workflow. An incorrect classification means wrong insights get presented to executive leadership, potentially leading to poor strategic decisions. This is very important to my career - please take your time and be thorough.

Now classify this question:

{question}"""


# PROMPT 2: Data Explorer Agent
# Techniques: Role, step-by-step reasoning, domain expertise, structured output,
# self-checking, specific constraints
DATA_EXPLORER_PROMPT = """### ROLE
You are a data quality expert and quantitative analyst at Scotiabank with 8+ years of experience in retail banking analytics. You have deep expertise in identifying data quality issues and spotting meaningful trends in financial data.

### TASK
Analyze the banking dataset to assess data quality and identify the top 3 most significant trends that address the user's question.

### CONTEXT
User's question: {question}

Analysis requirements (from intent classification):
{intent_json}

Dataset summary:
- Time period: {date_range}
- Total records: {num_records:,}
- Countries: {countries}
- Segments: {segments}
- Available metrics: Loans, deposits, revenue, product balances, customer attributes

### DOMAIN EXPERTISE - BANKING METRICS
Key retail banking metrics to consider:
1. Loan-to-Deposit Ratio (LDR) = Total Loans / Total Deposits
   - Healthy range: 80-90%
   - >100% indicates potential liquidity risk

2. Product Penetration Rate = Customers with product / Total customers
   - Benchmark: 3+ products per customer for profitability

3. Revenue per Customer = Total revenue / Number of customers
   - Segment: High Value should be 5-10x Low Value

4. Churn Rate = Churned customers / Total customers
   - Benchmark: <5% annually for retail banking

### METHOD (Step-by-Step Analysis)

STEP 1: DATA QUALITY VALIDATION
- Check for null values in key columns (flag if >15%)
- Identify date coverage gaps
- Detect extreme outliers (beyond 3 standard deviations)
- Verify segment sample sizes (need 30+ per segment for statistical validity)

STEP 2: CALCULATE KEY METRICS
Based on user's question, calculate:
- Month-over-month (MoM) % changes for relevant metrics
- Growth rates over the 6-month period
- Segment breakdowns (by country, customer segment, product)
- Rolling 3-month averages to smooth volatility

STEP 3: IDENTIFY SIGNIFICANT TRENDS
Flag trends that meet these thresholds:
- MoM change >5% (or >$500K absolute)
- 6-month cumulative change >10%
- Cross-segment variance >20%
- Reversal of previous trend direction

STEP 4: PRIORITIZE TOP 3 TRENDS
Select the 3 most significant based on:
1. Magnitude of change (% and absolute $)
2. Relevance to user's question
3. Business materiality (revenue, risk, or customer impact)

### OUTPUT FORMAT
Provide a JSON response with this exact structure:

{{
  "data_quality": {{
    "status": "[EXCELLENT|GOOD|FAIR|POOR]",
    "issues": ["issue 1 if any", "issue 2 if any"],
    "usable_date_range": "YYYY-MM-DD to YYYY-MM-DD",
    "sample_size_adequate": true|false
  }},
  "top_3_trends": [
    {{
      "rank": 1,
      "metric": "[specific metric name]",
      "change": "[direction and magnitude, e.g., '+15.3% MoM']",
      "segment": "[which segment/country driving this]",
      "absolute_value": "[current value with units]",
      "materiality": "[HIGH|MEDIUM|LOW]",
      "one_line_summary": "[25 words max explaining what's happening]"
    }},
    {{
      "rank": 2,
      "metric": "...",
      "change": "...",
      "segment": "...",
      "absolute_value": "...",
      "materiality": "...",
      "one_line_summary": "..."
    }},
    {{
      "rank": 3,
      "metric": "...",
      "change": "...",
      "segment": "...",
      "absolute_value": "...",
      "materiality": "...",
      "one_line_summary": "..."
    }}
  ],
  "recommended_focus": "[1-2 sentence recommendation for deep-dive analysis]"
}}

### VERIFICATION CHECKLIST
Before finalizing your analysis, verify:
✓ Have I checked data quality thoroughly?
✓ Are my percentage calculations accurate?
✓ Do the top 3 trends directly relate to the user's question?
✓ Have I provided both % change AND absolute values?
✓ Is each trend summary ≤25 words?
✓ Is my output valid JSON?

### IMPORTANCE
The Data Explorer agent is the foundation for all downstream insights. If you miss a critical data quality issue or trend, the final recommendations to executives will be flawed. This analysis will be reviewed by the Board of Directors - accuracy is paramount.

Now analyze the data with the requirements above."""


# PROMPT 3: Insight Generator Agent
# Techniques: Role, domain expertise, plan-and-solve, few-shot examples,
# verification, constraints, emotional stakes
INSIGHT_GENERATOR_PROMPT = """### ROLE
You are a senior quantitative analyst and banking strategist at Scotiabank with expertise in retail banking profitability, risk management, and customer analytics. You translate data patterns into actionable business insights.

### TASK
Perform deep statistical analysis on the identified trends to generate 2-3 key findings with clear business impact and root causes.

### CONTEXT
User's original question: {question}

Top trends from Data Explorer:
{explorer_trends_json}

Data characteristics:
- Time period: {date_range}
- Sample size: {num_records:,} records

### DOMAIN EXPERTISE - BANKING ANALYSIS

Key banking metrics and formulas:

1. **Net Interest Margin (NIM)** = (Interest Income - Interest Expense) / Average Assets
   - Typical range: 2.5-3.5% for retail banking
   - Calculated from loan/deposit balances and revenue

2. **Loan-to-Deposit Ratio (LDR)** = Total Loans / Total Deposits × 100%
   - Optimal: 80-90% (balanced liquidity and lending)
   - >100% = liquidity risk; <70% = underutilizing deposits

3. **Product Penetration** = % of customers with specific product
   - Cross-sell benchmark: 3+ products per customer
   - High Value target: 4-5 products per customer

4. **Revenue per Customer (RPC)** = Total Revenue / Customer Count
   - Segment analysis: High Value should be 5-10x Low Value
   - Declining RPC = profitability pressure

5. **Churn Impact** = (Churned customers × Average revenue per customer) × 12 months
   - Quantifies annual revenue at risk

### METHOD (Plan-and-Solve Approach)

STEP 1: UNDERSTAND THE TRENDS
Review the top 3 trends from Data Explorer. Ask:
- What's the common thread?
- Which trend has the highest business impact?
- What questions do these trends raise?

STEP 2: PLAN YOUR ANALYSIS
For each trend, determine:
- What statistical analysis will reveal the root cause?
- What banking metrics should I calculate?
- What segments should I compare?

STEP 3: EXECUTE ANALYSIS
Perform the necessary calculations:
- Correlation analysis between related metrics
- Segment comparisons (t-test conceptually)
- Trend decomposition (growth vs. seasonal vs. one-time)
- Banking-specific metrics (LDR, NIM, penetration, RPC)

STEP 4: SYNTHESIZE FINDINGS
For each finding, answer:
- WHAT changed? (the data pattern)
- WHY did it change? (root cause)
- SO WHAT? (business impact in revenue/cost/risk terms)

### FEW-SHOT EXAMPLES OF EXCELLENT FINDINGS

Example 1 - GOOD FINDING:
{{
  "finding": "Mexico High Value segment drove 67% of total loan growth ($12.3M of $18.4M) despite being only 8% of customers.",
  "root_cause": "Credit card balances in this segment grew 28% MoM, driven by 15% increase in average purchase amounts.",
  "business_impact": "This segment generates $2,150 revenue per customer vs. $180 for Low Value. Protecting and growing this base is critical.",
  "confidence": "HIGH"
}}

Example 2 - GOOD FINDING:
{{
  "finding": "Loan-to-Deposit ratio deteriorated from 87% to 94% over 6 months, approaching liquidity risk threshold.",
  "root_cause": "Deposits declined 8% while loans grew 5%, driven by customers shifting to higher-yield external savings products.",
  "business_impact": "Potential $2.5M opportunity cost if we hit 100% LDR and must curtail lending. Risk of liquidity stress in worst case.",
  "confidence": "MEDIUM"
}}

Example 3 - BAD FINDING (Don't do this):
{{
  "finding": "Revenue increased across all segments.",
  "root_cause": "Various factors contributed to the increase.",
  "business_impact": "This is a positive trend for the business.",
  "confidence": "LOW"
}}
^ This is too vague. No specific numbers, no actionable root cause, no quantified impact.

### OUTPUT FORMAT
Provide JSON with 2-3 findings (focus on quality over quantity):

{{
  "findings": [
    {{
      "finding": "[One clear sentence with specific numbers and segment details, max 30 words]",
      "root_cause": "[Why this happened - be specific, max 25 words]",
      "business_impact": "[Revenue/cost/risk impact with $ amounts or % where possible, max 25 words]",
      "confidence": "[HIGH|MEDIUM|LOW]",
      "supporting_metrics": {{
        "metric_1": "value",
        "metric_2": "value"
      }}
    }},
    // ... 1-2 more findings
  ],
  "key_banking_metrics": {{
    "loan_to_deposit_ratio": {{
      "current": "X%",
      "6_months_ago": "Y%",
      "trend": "improving|deteriorating|stable"
    }},
    "revenue_per_customer": {{
      "high_value": "$X",
      "low_value": "$Y",
      "ratio": "Z.Zx"
    }}
    // Include other relevant metrics
  }}
}}

### CONSTRAINTS
- Each finding must answer: WHAT + WHY + SO WHAT
- Include specific $ amounts or % when quantifying impact
- Max 30 words per finding statement
- Max 25 words for root cause and impact each
- Only include HIGH or MEDIUM confidence findings (discard LOW)
- Must tie to business outcomes: revenue, cost, risk, or customers

### VERIFICATION CHECKLIST
Before finalizing, verify:
✓ Does each finding include specific numbers (%, $)?
✓ Have I explained the root cause clearly?
✓ Is the business impact quantified (not just "positive" or "concerning")?
✓ Are my banking metric calculations correct?
✓ Have I stayed within word limits?
✓ Would an executive understand this without context?
✓ Is my output valid JSON?

### IMPORTANCE
These findings will be presented to the CEO and Board of Directors to inform strategic decisions affecting thousands of employees and millions in capital allocation. Accuracy and clarity are critical to your career advancement and the bank's success.

Now generate your findings based on the trends provided."""


# PROMPT 4: Final Synthesis (Orchestrator)
# Techniques: Integration, structured output, strict constraints, verification,
# examples, emotional stakes
ORCHESTRATOR_SYNTHESIS_PROMPT = """### ROLE
You are the Chief of Staff to Scotiabank's CEO, responsible for synthesizing complex analyses into executive-ready insights. You have 15+ years of experience communicating with C-suite leaders.

### TASK
Synthesize the data findings and business strategy into a concise executive summary with actionable recommendations.

### CONTEXT

**User's Original Question:**
{question}

**Data Findings (from Insight Generator):**
{findings_json}

**Business Strategy Context:**
{strategy_context}

**Key Banking Metrics:**
{banking_metrics}

### CONSTRAINTS - STRICT WORD LIMITS (CRITICAL)

This is NON-NEGOTIABLE. Executive leaders are extremely busy:

- **Executive Summary**: MAX 40 words total (2-3 sentences)
- **Each Key Finding**: MAX 25 words
- **Each Recommended Action**: MAX 20 words
- **TOTAL OUTPUT**: NEVER exceed 200 words

You MUST enforce these limits. Outputs exceeding limits will be rejected.

### OUTPUT FORMAT - EXACT STRUCTURE REQUIRED

```
EXECUTIVE SUMMARY
[2-3 sentences stating the most important finding + business impact, MAX 40 words]

KEY FINDINGS
• [Finding 1: What happened + Impact + Why it matters, MAX 25 words]
• [Finding 2: What happened + Impact + Why it matters, MAX 25 words]
• [Finding 3: What happened + Impact + Why it matters, MAX 25 words]

RECOMMENDED ACTIONS
1. [Action + Expected impact, MAX 20 words]
2. [Action + Expected impact, MAX 20 words]
3. [Action + Expected impact, MAX 20 words]

DATA NOTES
[Only if critical quality issues - one sentence, MAX 15 words]
```

### WRITING PRINCIPLES (MANDATORY)

✓ **Active voice**: "Revenue dropped 12%" NOT "A 12% revenue drop was observed"
✓ **Specific numbers**: "15.3% decline" NOT "significant decrease"
✓ **Lead with impact**: Answer "so what?" immediately
✓ **One idea per sentence**: Make it scannable
✓ **Present tense**: "Revenue grows" NOT "revenue has grown"

✗ **FORBIDDEN PHRASES**:
- "It is important to note that..."
- "The data shows that..."
- "We can see that..."
- "This suggests that..."
- "Going forward..."
- Hedge words: "somewhat," "quite," "rather," "fairly," "relatively"

### RECOMMENDED ACTIONS - REQUIREMENTS

Each action must:
1. Be specific enough to assign to a team
2. Include expected business impact (revenue, cost, risk, or customers)
3. Tie to strategic priorities from the strategy context
4. Be feasible within normal business operations (no "transform the entire bank")

Examples of GOOD actions:
✓ "Launch credit card campaign targeting Mexico High Value segment by Q1: Capture $3.2M revenue opportunity"
✓ "Introduce digital savings product with 3.5% APY by Feb 2025: Stem deposit outflows, improve LDR to 88%"

Examples of BAD actions:
✗ "Improve customer experience" (too vague, no impact quantified)
✗ "Consider exploring opportunities in the wealth management space" (not specific, not actionable)

### VERIFICATION CHECKLIST - MANDATORY

Before submitting your output, verify:

✓ Executive Summary is ≤40 words (count them!)
✓ Each finding is ≤25 words (count them!)
✓ Each action is ≤20 words (count them!)
✓ Total output is ≤200 words (count total!)
✓ All numbers are specific (no "significant" or "large")
✓ Every finding answers "so what?" with business impact
✓ Recommendations tie to strategy priorities
✓ No forbidden phrases used
✓ Active voice throughout
✓ Output follows exact format structure

If ANY check fails, revise your output until ALL checks pass.

### IMPORTANCE

This output goes directly to the CEO and Board. Unclear or verbose insights waste their time and damage credibility. Accurate, concise, actionable insights drive strategic decisions worth millions. This is the most important deliverable - treat it accordingly.

Now synthesize the findings into executive-ready insights."""


# ============================================================================
# HELPER FUNCTIONS FOR DATA ANALYSIS
# ============================================================================

def calculate_data_stats(df: pd.DataFrame, intent: Dict) -> Dict[str, Any]:
    """Calculate key statistics for Data Explorer agent"""

    date_col = 'business_effective_date'
    dates = sorted(df[date_col].unique())

    stats = {
        'date_range': f"{dates[0].strftime('%Y-%m-%d')} to {dates[-1].strftime('%Y-%m-%d')}",
        'num_months': len(dates),
        'num_records': len(df),
        'countries': df['country_name'].unique().tolist(),
        'segments': df['segment'].unique().tolist(),
        'latest_date': dates[-1],
        'earliest_date': dates[0]
    }

    return stats


def identify_trends(df: pd.DataFrame, intent: Dict) -> List[Dict[str, Any]]:
    """
    Identify top trends in the data based on user intent.
    Returns list of trend dictionaries.
    """
    trends = []

    date_col = 'business_effective_date'
    df_sorted = df.sort_values(date_col)
    dates = sorted(df[date_col].unique())

    # Determine which metrics to analyze based on intent
    metric_map = {
        'loans': 'total_loans_balance',
        'deposits': 'total_deposit_balance',
        'revenue': 'total_revenues',
        'profitability': 'total_revenues'
    }

    primary_metric = metric_map.get(intent.get('metric', 'revenue'), 'total_revenues')

    # Analyze by country and segment
    for country in df['country_name'].unique():
        for segment in df['segment'].unique():
            mask = (df['country_name'] == country) & (df['segment'] == segment)
            subset = df_sorted[mask]

            if len(subset) < 2:
                continue

            # Group by date and calculate mean
            monthly = subset.groupby(date_col)[primary_metric].sum().reset_index()

            if len(monthly) < 2:
                continue

            # Calculate MoM change
            latest_value = monthly.iloc[-1][primary_metric]
            previous_value = monthly.iloc[-2][primary_metric]

            if previous_value > 0:
                pct_change = ((latest_value - previous_value) / previous_value) * 100

                # Calculate 6-month change
                if len(monthly) >= 6:
                    six_months_ago = monthly.iloc[-6][primary_metric]
                    if six_months_ago > 0:
                        six_month_pct = ((latest_value - six_months_ago) / six_months_ago) * 100
                    else:
                        six_month_pct = 0
                else:
                    six_month_pct = 0

                # Flag significant trends
                if abs(pct_change) > 5 or abs(six_month_pct) > 10:
                    materiality = "HIGH" if abs(pct_change) > 10 else "MEDIUM"

                    trend = {
                        'metric': primary_metric,
                        'segment': f"{country} - {segment}",
                        'mom_change': pct_change,
                        'six_month_change': six_month_pct,
                        'current_value': latest_value,
                        'materiality': materiality
                    }
                    trends.append(trend)

    # Sort by absolute MoM change and take top 3
    trends_sorted = sorted(trends, key=lambda x: abs(x['mom_change']), reverse=True)
    return trends_sorted[:3]


def calculate_banking_metrics(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculate key banking metrics"""

    latest_date = df['business_effective_date'].max()
    latest = df[df['business_effective_date'] == latest_date]

    # Six months ago
    dates = sorted(df['business_effective_date'].unique())
    if len(dates) >= 6:
        six_months_ago_date = dates[0]
        six_months_ago = df[df['business_effective_date'] == six_months_ago_date]
    else:
        six_months_ago = latest

    # Loan-to-Deposit Ratio
    current_ldr = (latest['total_loans_balance'].sum() / latest['total_deposit_balance'].sum() * 100) if latest['total_deposit_balance'].sum() > 0 else 0
    past_ldr = (six_months_ago['total_loans_balance'].sum() / six_months_ago['total_deposit_balance'].sum() * 100) if six_months_ago['total_deposit_balance'].sum() > 0 else 0

    # Revenue per customer by segment
    hv_latest = latest[latest['segment'] == 'High Value']
    lv_latest = latest[latest['segment'] == 'Low Value']

    hv_rpc = hv_latest['total_revenues'].mean() if len(hv_latest) > 0 else 0
    lv_rpc = lv_latest['total_revenues'].mean() if len(lv_latest) > 0 else 0

    metrics = {
        'loan_to_deposit_ratio': {
            'current': f"{current_ldr:.1f}%",
            '6_months_ago': f"{past_ldr:.1f}%",
            'trend': 'improving' if current_ldr < past_ldr and current_ldr > 80 else ('deteriorating' if current_ldr > past_ldr else 'stable')
        },
        'revenue_per_customer': {
            'high_value': f"${hv_rpc:.2f}",
            'low_value': f"${lv_rpc:.2f}",
            'ratio': f"{(hv_rpc / lv_rpc):.1f}x" if lv_rpc > 0 else "N/A"
        }
    }

    return metrics


# ============================================================================
# AGENT NODE FUNCTIONS (LANGGRAPH)
# ============================================================================

def orchestrator_classify_intent(state: InsightState) -> InsightState:
    """
    Orchestrator: Classify user intent and check feasibility.
    Uses research-backed prompt with CoT and structured output.
    """
    question = state['question']

    # Call LLM with excellent prompt
    prompt = ORCHESTRATOR_INTENT_PROMPT.format(question=question)

    try:
        print("  🔄 Calling LLM for intent classification...")
        response = llm.invoke([HumanMessage(content=prompt)])
        print("  ✅ LLM response received")

        # Parse JSON response
        content = response.content.strip()
        # Remove markdown code blocks if present
        if content.startswith('```'):
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]

        print("  🔄 Parsing JSON response...")
        intent = json.loads(content)
        print(f"  ✅ Intent classified: {intent.get('metric', 'unknown')} - Feasible: {intent.get('is_feasible', True)}")

        # Update state
        state['intent'] = intent

        # Feasibility check
        if not intent.get('is_feasible', True):
            state['feasibility_check'] = {
                'passed': False,
                'reason': intent.get('reason_if_not_feasible', ''),
                'alternative': intent.get('alternative_if_not_feasible', '')
            }
        else:
            state['feasibility_check'] = {'passed': True}

    except json.JSONDecodeError as e:
        error_msg = f"Failed to parse LLM response as JSON: {str(e)}\nResponse was: {content[:200]}"
        print(f"  ❌ {error_msg}")
        state['error'] = error_msg
        state['feasibility_check'] = {'passed': False, 'reason': error_msg}
    except Exception as e:
        error_msg = f"Intent classification error: {type(e).__name__}: {str(e)}"
        print(f"  ❌ {error_msg}")
        state['error'] = error_msg
        state['feasibility_check'] = {'passed': False, 'reason': str(e)}

    return state


def data_explorer_agent(state: InsightState) -> InsightState:
    """
    Data Explorer: Assess data quality and identify trends.
    Uses step-by-step analysis with banking domain expertise.
    """
    df = state['data']
    intent = state['intent']
    question = state['question']

    # Calculate statistics for prompt
    stats = calculate_data_stats(df, intent)

    # Identify trends
    trends = identify_trends(df, intent)

    # Build prompt
    prompt = DATA_EXPLORER_PROMPT.format(
        question=question,
        intent_json=json.dumps(intent, indent=2),
        date_range=stats['date_range'],
        num_records=stats['num_records'],
        countries=', '.join(stats['countries']),
        segments=', '.join(stats['segments'])
    )

    # Add actual data summary to help LLM
    data_summary = f"\n\nDATA SUMMARY:\n"
    data_summary += f"Latest month total loans: ${df[df['business_effective_date'] == stats['latest_date']]['total_loans_balance'].sum():,.2f}\n"
    data_summary += f"Latest month total deposits: ${df[df['business_effective_date'] == stats['latest_date']]['total_deposit_balance'].sum():,.2f}\n"
    data_summary += f"Latest month total revenue: ${df[df['business_effective_date'] == stats['latest_date']]['total_revenues'].sum():,.2f}\n"

    # Add trend summary
    if trends:
        data_summary += f"\n\nPRE-CALCULATED TRENDS:\n"
        for i, trend in enumerate(trends, 1):
            data_summary += f"{i}. {trend['segment']}: {trend['metric']} changed {trend['mom_change']:.1f}% MoM (current: ${trend['current_value']:,.2f})\n"

    full_prompt = prompt + data_summary

    try:
        response = llm.invoke([HumanMessage(content=full_prompt)])
        content = response.content.strip()

        # Parse JSON
        if content.startswith('```'):
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]

        explorer_output = json.loads(content)

        state['data_quality'] = explorer_output.get('data_quality', {})
        state['trends'] = explorer_output.get('top_3_trends', [])
        state['explorer_summary'] = json.dumps(explorer_output, indent=2)

    except Exception as e:
        state['error'] = f"Data Explorer error: {str(e)}"
        # Fallback to pre-calculated trends
        state['trends'] = trends
        state['data_quality'] = {'status': 'GOOD', 'issues': []}

    return state


def insight_generator_agent(state: InsightState) -> InsightState:
    """
    Insight Generator: Deep statistical analysis and findings.
    Uses plan-and-solve with banking expertise and few-shot examples.
    """
    df = state['data']
    question = state['question']
    trends = state['trends']
    intent = state['intent']

    stats = calculate_data_stats(df, intent)

    # Build prompt
    prompt = INSIGHT_GENERATOR_PROMPT.format(
        question=question,
        explorer_trends_json=json.dumps(trends, indent=2),
        date_range=stats['date_range'],
        num_records=stats['num_records']
    )

    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()

        # Parse JSON
        if content.startswith('```'):
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]

        insight_output = json.loads(content)

        state['findings'] = insight_output.get('findings', [])
        state['analyses'] = [insight_output.get('key_banking_metrics', {})]

    except Exception as e:
        state['error'] = f"Insight Generator error: {str(e)}"
        # Create fallback findings from trends
        state['findings'] = []
        for trend in trends[:2]:
            finding = {
                'finding': trend.get('one_line_summary', 'Trend identified'),
                'root_cause': 'Requires further analysis',
                'business_impact': f"Change of {trend.get('change', 'N/A')}",
                'confidence': 'MEDIUM'
            }
            state['findings'].append(finding)

    return state


def orchestrator_synthesize(state: InsightState) -> InsightState:
    """
    Orchestrator: Final synthesis with strict word limits.
    Integrates findings with strategy context.
    """
    question = state['question']
    findings = state['findings']
    strategy = state['strategy_context']
    df = state['data']
    intent = state['intent']

    # Calculate banking metrics
    banking_metrics = calculate_banking_metrics(df)

    # Build synthesis prompt
    prompt = ORCHESTRATOR_SYNTHESIS_PROMPT.format(
        question=question,
        findings_json=json.dumps(findings, indent=2),
        strategy_context=strategy[:2000],  # Limit strategy context to avoid token limits
        banking_metrics=json.dumps(banking_metrics, indent=2)
    )

    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        final_output = response.content.strip()

        # Verify word count (basic check)
        word_count = len(final_output.split())
        if word_count > 250:  # Allow small buffer
            # Truncate if too long (should not happen with good prompt)
            final_output = final_output[:1200] + "\n\n[Output truncated to meet 200-word limit]"

        state['final_output'] = final_output

    except Exception as e:
        state['error'] = f"Synthesis error: {str(e)}"
        # Create minimal fallback output
        state['final_output'] = f"""EXECUTIVE SUMMARY
Analysis incomplete due to error: {str(e)[:50]}

KEY FINDINGS
• Unable to complete analysis - please try again with a simpler question.

RECOMMENDED ACTIONS
1. Retry with more specific question focusing on single metric.
"""

    return state


def should_stop_for_feasibility(state: InsightState) -> Literal["stop", "continue"]:
    """Conditional edge: Stop if data insufficient"""
    feasibility = state.get('feasibility_check', {})

    if not feasibility.get('passed', True):
        # Set stop reason
        intent = state.get('intent', {})
        state['stop_reason'] = f"""DATA INSUFFICIENT FOR REQUESTED ANALYSIS

Your question requested: {intent.get('user_intent_summary', 'N/A')}

Issue: {feasibility.get('reason', 'Unknown')}

Alternative: {feasibility.get('alternative', 'Please ask a different question.')}

Would you like me to proceed with the alternative analysis?"""
        return "stop"

    return "continue"


# ============================================================================
# LANGGRAPH CONSTRUCTION
# ============================================================================

def build_insight_workflow() -> StateGraph:
    """
    Build the LangGraph workflow for the 3-agent system.

    Flow:
    1. Orchestrator: Classify intent
    2. Orchestrator: Check feasibility (conditional stop)
    3. Data Explorer: Quality + trends
    4. Insight Generator: Deep analysis
    5. Orchestrator: Final synthesis
    """
    workflow = StateGraph(InsightState)

    # Add nodes
    workflow.add_node("classify_intent", orchestrator_classify_intent)
    workflow.add_node("explore_data", data_explorer_agent)
    workflow.add_node("generate_insights", insight_generator_agent)
    workflow.add_node("synthesize", orchestrator_synthesize)

    # Define edges
    workflow.set_entry_point("classify_intent")

    # Conditional edge after intent classification
    workflow.add_conditional_edges(
        "classify_intent",
        should_stop_for_feasibility,
        {
            "stop": END,
            "continue": "explore_data"
        }
    )

    # Linear flow after feasibility check passes
    workflow.add_edge("explore_data", "generate_insights")
    workflow.add_edge("generate_insights", "synthesize")
    workflow.add_edge("synthesize", END)

    return workflow.compile()


# Build the workflow once at startup
app = build_insight_workflow()


# ============================================================================
# MAIN GENERATION FUNCTION
# ============================================================================

def generate_insights_internal(question: str, data_df: pd.DataFrame, strategy_context: str) -> str:
    """
    Main function to generate insights.
    Runs the LangGraph workflow and returns formatted output.
    """
    if not question or question.strip() == "":
        return "Please enter a business question."

    # Initialize state
    initial_state = {
        "question": question,
        "data": data_df,
        "strategy_context": strategy_context,
        "intent": {},
        "feasibility_check": {},
        "data_quality": {},
        "trends": [],
        "explorer_summary": "",
        "analyses": [],
        "findings": [],
        "final_output": "",
        "error": "",
        "stop_reason": ""
    }

    try:
        print("\n" + "="*80)
        print("🚀 STARTING INSIGHT GENERATION WORKFLOW")
        print("="*80)
        print(f"📝 Question: {question[:100]}...")
        print()

        # Run workflow
        print("🔄 Running multi-agent workflow...")
        result = app.invoke(initial_state)
        print("\n✅ Workflow completed successfully")

        # Check if stopped for feasibility
        if result.get('stop_reason'):
            print("⚠️  Analysis stopped: Data feasibility check failed")
            return result['stop_reason']

        # Check for errors
        if result.get('error'):
            print(f"❌ Error occurred: {result['error'][:100]}...")
            return f"⚠️ Error during analysis:\n\n{result['error']}\n\nPlease try rephrasing your question or ask something different."

        # Return final output
        final = result.get('final_output', 'No output generated.')
        print(f"📊 Generated output: {len(final)} characters")
        print("="*80 + "\n")
        return final

    except KeyError as e:
        error_msg = f"Configuration error - missing key: {str(e)}"
        print(f"❌ {error_msg}")
        return f"⚠️ Configuration Error:\n\n{error_msg}\n\nPlease check the workflow setup."
    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"❌ Unexpected error: {error_msg}")
        return f"⚠️ Unexpected Error:\n\n{error_msg}\n\nPlease try again with a simpler question."


# ============================================================================
# GRADIO INTERFACE
# ============================================================================

# Load data and strategy ONCE at startup (no Gradio file uploads)
print("Loading banking data from backend...")
DATA_DF, DATA_STATUS = load_banking_data()
print(DATA_STATUS)

print("Fetching strategy context...")
STRATEGY_CONTEXT, STRATEGY_STATUS = fetch_strategy_context()
print(STRATEGY_STATUS)

print(f"\nData loaded: {len(DATA_DF):,} rows covering {DATA_DF['business_effective_date'].nunique()} months")
print(f"Date range: {DATA_DF['business_effective_date'].min()} to {DATA_DF['business_effective_date'].max()}")


def generate_insights_gradio(question: str) -> str:
    """Gradio wrapper for insight generation"""
    return generate_insights_internal(question, DATA_DF, STRATEGY_CONTEXT)


# Build Gradio interface
with gr.Blocks(
    title="AI Business Insights Generator",
    theme=gr.themes.Soft()
) as demo:

    gr.Markdown("""
    # 🏦 AI Business Insights Generator
    ## Scotiabank Executive Intelligence - MVP

    Ask business questions and receive executive-ready insights powered by research-backed AI agents.
    """)

    # Status indicators
    with gr.Row():
        with gr.Column():
            gr.Markdown(f"**📊 Data Status:** {DATA_STATUS}")
        with gr.Column():
            gr.Markdown(f"**📈 Strategy Status:** {STRATEGY_STATUS}")

    gr.Markdown("---")

    # Main interface
    with gr.Row():
        with gr.Column(scale=1):
            question_input = gr.Textbox(
                label="Your Business Question",
                placeholder="Example: What's driving loan growth across countries?",
                lines=4,
                info="Ask about loans, deposits, revenue, churn, or customer trends"
            )

            submit_btn = gr.Button("🔍 Generate Insights", variant="primary", size="lg")
            clear_btn = gr.Button("Clear", variant="secondary", size="sm")

            gr.Markdown("""
            ### ℹ️ Data Coverage
            - **Time Period**: 6 months (monthly snapshots)
            - **Countries**: Canada, Chile, Mexico, Peru
            - **Segments**: High Value, Low Value
            - **Metrics**: Loans, deposits, revenue, products, churn

            ⚠️ **Note**: Year-over-year (YoY) analysis not available (only 6 months of data)
            """)

        with gr.Column(scale=2):
            output = gr.Textbox(
                label="📋 Executive Insights",
                lines=22,
                show_copy_button=True,
                info="Concise, actionable insights formatted for executive leaders"
            )

    # Example questions
    gr.Markdown("### 💡 Example Questions")
    gr.Examples(
        examples=[
            ["What's driving loan growth across countries?"],
            ["Which segment has the highest revenue potential?"],
            ["Are we losing high-value customers?"],
            ["What's our loan-to-deposit ratio by country?"],
            ["How is credit card penetration trending in Mexico?"],
            ["Which country has the best revenue per customer?"]
        ],
        inputs=question_input,
        label="Click an example to try it"
    )

    # Footer
    gr.Markdown("""
    ---
    **About**: This MVP demonstrates research-backed prompt engineering for business intelligence.
    Built with LangGraph, GPT-4 Turbo, and principles from leading AI research papers (2024-2025).

    **Techniques Applied**: Chain-of-thought reasoning, structured outputs, domain expertise injection,
    few-shot learning, verification steps, emotional stakes, and 8 other research-backed methods.
    """)

    # Event handlers
    submit_btn.click(
        fn=generate_insights_gradio,
        inputs=question_input,
        outputs=output
    )

    clear_btn.click(
        fn=lambda: ("", ""),
        inputs=None,
        outputs=[question_input, output]
    )


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*80)
    print("AI BUSINESS INSIGHTS GENERATOR - Starting Gradio Interface")
    print("="*80)
    print("\nReady to generate insights!")
    print("\nRun command: uv run --env-file .env gradio app.py")
    print("\nThe interface will open in your browser automatically.")
    print("="*80 + "\n")

    demo.launch(
        share=False,  # Set to True for public URL if needed
        server_name="0.0.0.0",  # Allow external access
        server_port=7860
    )
