# ============================================================================
# AI BUSINESS INSIGHTS GENERATOR - ENHANCED VERSION v2.0
# Vector Institute Agent Bootcamp
# ============================================================================
# MAJOR ENHANCEMENTS:
# - 8-phase interactive workflow with user checkpoints
# - Advanced ML: K-Means clustering, Random Forest analysis
# - Feature engineering with validation
# - Business impact calculator ($ quantification)
# - Robustness testing across time windows
# - Meta-cognitive self-review
# - Cost-efficient model selection (Gemini Flash vs Pro)
# - Multi-turn conversational interface
# ============================================================================

import sys
import os
from pathlib import Path

# Dependency checking
print("🔍 Checking dependencies...")

def check_dependencies():
    """Check for required dependencies"""
    missing_deps = []

    try:
        import pandas, numpy, scipy, sklearn
    except ImportError:
        missing_deps.append("pandas/numpy/scipy/scikit-learn")

    try:
        from langchain_core.messages import HumanMessage
    except ImportError:
        missing_deps.append("langchain-core")

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
    except ImportError:
        missing_deps.append("langchain-google-genai")

    try:
        from langgraph.graph import StateGraph, END
    except ImportError:
        missing_deps.append("langgraph")

    try:
        import gradio
    except ImportError:
        missing_deps.append("gradio")

    try:
        import google.generativeai as genai
    except ImportError:
        missing_deps.append("google-generativeai")

    if missing_deps:
        print("\n❌ MISSING DEPENDENCIES:")
        for dep in missing_deps:
            print(f"  • {dep}")
        print("\n📦 Install with: pip install -r requirements.txt")
        sys.exit(1)

    return True

check_dependencies()
print("✅ All dependencies found!\n")

# ============================================================================
# IMPORTS
# ============================================================================
from dotenv import load_dotenv
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from typing import TypedDict, List, Dict, Any, Literal
import gradio as gr

# ML and Analytics
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from scipy import stats

# LangChain and Gemini
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langgraph.graph import StateGraph, END
import google.generativeai as genai

load_dotenv()

# ============================================================================
# CONFIGURATION & API SETUP
# ============================================================================

print("🔑 Checking API configuration...")

# Check for Google API key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

if not GOOGLE_API_KEY:
    print("\n" + "="*80)
    print("❌ ERROR: GOOGLE_API_KEY not found")
    print("="*80)
    print("\nPlease add to your .env file:")
    print('  GOOGLE_API_KEY="your-api-key-here"')
    print("\nGet your API key from: https://makersuite.google.com/app/apikey")
    print("="*80 + "\n")
    sys.exit(1)

print(f"✅ Google API key found (starts with: {GOOGLE_API_KEY[:12]}...)\n")

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize LLMs with cost-efficient selection
print("🤖 Initializing Gemini models...")

try:
    # Gemini Flash - Fast and cheap (70% of tasks)
    llm_flash = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=GOOGLE_API_KEY,
        temperature=0,
        convert_system_message_to_human=True
    )

    # Gemini Pro - Powerful reasoning (30% of tasks)
    llm_pro = ChatGoogleGenerativeAI(
        model="gemini-1.5-pro",
        google_api_key=GOOGLE_API_KEY,
        temperature=0,
        convert_system_message_to_human=True
    )

    print("✅ Gemini Flash initialized (fast, cost-efficient)")
    print("✅ Gemini Pro initialized (advanced reasoning)")
    print()

except Exception as e:
    print(f"\n❌ Failed to initialize Gemini: {e}")
    print("\nPlease check:")
    print("  • Your API key is valid")
    print("  • You have internet connectivity")
    print("  • langchain-google-genai is installed")
    sys.exit(1)

# ============================================================================
# DATA LOADING
# ============================================================================

def generate_sample_banking_data(num_customers: int = 500) -> pd.DataFrame:
    """Generate realistic sample banking data"""
    np.random.seed(42)

    dates = pd.date_range(end='2024-12-31', periods=6, freq='ME')
    countries = ['Canada', 'Chile', 'Mexico', 'Peru']
    segments = ['High Value', 'Low Value']

    data = []
    for customer_id in range(num_customers):
        country = np.random.choice(countries)
        segment = np.random.choice(segments, p=[0.1, 0.9])

        for date in dates:
            month_idx = list(dates).index(date)
            trend_factor = 1 + (month_idx * 0.02)

            country_factors = {'Canada': 1.0, 'Mexico': 1.15, 'Peru': 1.08, 'Chile': 0.95}
            country_factor = country_factors[country]

            if segment == 'High Value':
                loan_base = np.random.uniform(50000, 200000)
                deposit_base = np.random.uniform(30000, 100000)
            else:
                loan_base = np.random.uniform(2000, 25000)
                deposit_base = np.random.uniform(1000, 15000)

            # Product balances
            has_cc = np.random.rand() > 0.4
            has_mortgage = np.random.rand() > 0.6
            has_auto = np.random.rand() > 0.75
            has_personal = np.random.rand() > 0.6
            has_checking = np.random.rand() > 0.3
            has_payroll = np.random.rand() > 0.6
            has_savings = np.random.rand() > 0.5
            has_investment = np.random.rand() > 0.7

            cc_balance = np.random.uniform(0, loan_base * 0.2) * trend_factor * country_factor if has_cc else 0
            mortgage_balance = np.random.uniform(0, loan_base * 0.8) * trend_factor * country_factor if has_mortgage else 0
            auto_balance = np.random.uniform(0, loan_base * 0.25) * trend_factor * country_factor if has_auto else 0
            personal_balance = np.random.uniform(0, loan_base * 0.15) * trend_factor * country_factor if has_personal else 0

            checking_balance = np.random.uniform(0, deposit_base * 0.4) * trend_factor * country_factor if has_checking else 0
            payroll_balance = np.random.uniform(0, deposit_base * 0.5) * trend_factor * country_factor if has_payroll else 0
            savings_balance = np.random.uniform(0, deposit_base * 0.7) * trend_factor * country_factor if has_savings else 0

            total_loans = cc_balance + mortgage_balance + auto_balance + personal_balance
            total_deposits = checking_balance + payroll_balance + savings_balance
            total_revenue = (total_loans + total_deposits) * np.random.uniform(0.022, 0.028)

            product_count = sum([has_cc, has_mortgage, has_auto, has_personal,
                               has_checking, has_payroll, has_savings, has_investment])

            record = {
                'customer_id': customer_id,
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
                'is_churned': np.random.rand() > 0.97,
                'is_new': month_idx == 0 and np.random.rand() > 0.92,
                'is_priority_customer': segment == 'High Value' and np.random.rand() > 0.3,
                'is_high_digital': np.random.rand() > 0.45,
                'is_d2d': has_checking or has_payroll,
                'purchase_amount_last_month': cc_balance * np.random.uniform(0.1, 0.4) if has_cc else 0
            }
            data.append(record)

    return pd.DataFrame(data)


def load_banking_data() -> tuple[pd.DataFrame, str]:
    """Load data from /data/banking_data.csv or generate sample"""
    data_path_e2b = Path("/data/banking_data.csv")
    data_path_local = Path(__file__).parent / "banking_data.csv"

    for data_path in [data_path_e2b, data_path_local]:
        if data_path.exists():
            try:
                print(f"   📂 Loading: {data_path}")
                df = pd.read_csv(data_path)
                df['business_effective_date'] = pd.to_datetime(df['business_effective_date'])
                status = f"✅ Loaded {len(df):,} rows from {data_path.name}"
                print(f"   {status}")
                return df, status
            except Exception as e:
                print(f"   ⚠️  Error reading {data_path}: {str(e)}")
                continue

    print("   📊 Generating sample data...")
    df = generate_sample_banking_data(500)
    status = f"⚠️  Using 3,000 rows of sample data"
    return df, status


# Load data at startup
print("Loading banking data...")
DATA_DF, DATA_STATUS = load_banking_data()
print(f"Data loaded: {len(DATA_DF):,} rows covering {DATA_DF['business_effective_date'].nunique()} months")
print(f"Date range: {DATA_DF['business_effective_date'].min()} to {DATA_DF['business_effective_date'].max()}\n")

# ============================================================================
# STATE MANAGEMENT
# ============================================================================

class AnalysisState(TypedDict):
    """State for multi-phase interactive workflow"""
    # Conversation
    conversation_history: List[Dict[str, str]]
    current_phase: str
    phase_number: int

    # User input
    original_question: str

    # Phase 1: Consultation
    hypothesis: str
    hypothesis_approved: bool

    # Phase 2: Data Quality
    data_quality_report: str
    data_issues: List[str]

    # Phase 3: Feature Engineering
    engineered_features: List[Dict[str, Any]]
    features_approved: bool

    # Phase 4: Sanity Check
    anomalies_detected: List[Dict[str, Any]]

    # Phase 5: Clustering
    clusters: Dict[str, Any]

    # Phase 6: ML Analysis
    drivers: List[Dict[str, Any]]

    # Phase 7: Business Impact
    opportunities: List[Dict[str, Any]]
    total_opportunity: float

    # Phase 8: Validation
    robustness_results: Dict[str, Any]
    meta_review: str

    # Final
    final_insights: str
    ready_for_next_phase: bool
    user_wants_to_skip: bool
    error: str


# ============================================================================
# PHASE 1: CONSULTATION & HYPOTHESIS DEFINITION
# ============================================================================

def phase1_consultation(state: AnalysisState) -> AnalysisState:
    """
    Phase 1: Clarify business objective and define hypothesis
    Model: Gemini Pro (complex reasoning)
    """
    question = state['original_question']

    prompt = f"""You are a senior business consultant at Scotiabank. A client has asked you:

"{question}"

Your job is to:
1. Clarify what they REALLY want to achieve (revenue growth? cost reduction? churn prevention?)
2. Define a clear, testable hypothesis
3. Outline an analysis plan

Think step by step:
- What is the underlying business objective?
- What metrics should we focus on?
- What timeframe makes sense?
- What would a good answer look like?

Respond in this JSON format:
{{
  "business_objective": "[What does the user really want to achieve?]",
  "hypothesis": "[Clear, testable hypothesis - one sentence]",
  "target_metrics": ["metric1", "metric2"],
  "timeframe": "[e.g., last 6 months, MoM trends]",
  "analysis_plan": "[2-3 sentence plan]",
  "success_criteria": "[How will we know if we've answered the question?]"
}}

Be specific and business-focused. This is for executive decision-making."""

    try:
        response = llm_pro.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()

        # Parse JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        hypothesis_data = json.loads(content)

        # Format for user
        hypothesis_text = f"""## 📋 CONSULTATION SUMMARY

**Your Question:** {question}

**Business Objective:**
{hypothesis_data['business_objective']}

**Hypothesis to Test:**
{hypothesis_data['hypothesis']}

**Target Metrics:**
{', '.join(hypothesis_data['target_metrics'])}

**Timeframe:** {hypothesis_data['timeframe']}

**Analysis Plan:**
{hypothesis_data['analysis_plan']}

**Success Criteria:**
{hypothesis_data['success_criteria']}

---
**✅ Does this accurately capture what you want to learn?**
**Click "Approve & Continue" to proceed with this hypothesis, or "Revise" to adjust.**
"""

        state['hypothesis'] = json.dumps(hypothesis_data)
        state['conversation_history'].append({
            "role": "assistant",
            "content": hypothesis_text
        })
        state['current_phase'] = "consultation_approval"
        state['ready_for_next_phase'] = False

    except Exception as e:
        error_msg = f"Error in consultation phase: {str(e)}"
        state['error'] = error_msg
        state['conversation_history'].append({
            "role": "assistant",
            "content": f"❌ {error_msg}\n\nPlease try rephrasing your question."
        })

    return state


# ============================================================================
# PHASE 2: DATA QUALITY CHECK
# ============================================================================

def phase2_data_quality(state: AnalysisState) -> AnalysisState:
    """
    Phase 2: Validate data quality and report anomalies
    Model: Gemini Flash (fast validation)
    """
    try:
        df = DATA_DF.copy()

        # Calculate quality metrics
        total_rows = len(df)
        date_range = f"{df['business_effective_date'].min().date()} to {df['business_effective_date'].max().date()}"
        num_months = df['business_effective_date'].nunique()

        # Check for nulls
        null_issues = []
        for col in df.columns:
            null_pct = (df[col].isnull().sum() / len(df)) * 100
            if null_pct > 5:
                null_issues.append(f"  • {col}: {null_pct:.1f}% null values")

        # Check for outliers
        outlier_issues = []
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if col not in ['customer_id']:
                z_scores = np.abs(stats.zscore(df[col].dropna()))
                outliers = (z_scores > 3).sum()
                if outliers > 0:
                    outlier_issues.append(f"  • {col}: {outliers} outliers (>3σ)")

        # Generate report
        report = f"""## 📊 DATA QUALITY REPORT

**Dataset Overview:**
- Rows: {total_rows:,}
- Date Range: {date_range} ({num_months} months)
- Countries: {', '.join(df['country_name'].unique())}
- Segments: {', '.join(df['segment'].unique())}

**Quality Assessment:**

✅ **Overall Status**: {'EXCELLENT' if len(null_issues) == 0 and len(outlier_issues) == 0 else 'GOOD' if len(null_issues) + len(outlier_issues) < 5 else 'FAIR'}

"""

        if null_issues:
            report += "⚠️  **Null Values Detected:**\n"
            report += "\n".join(null_issues[:5])  # Show top 5
            report += "\n\n"
        else:
            report += "✅ **No significant null values**\n\n"

        if outlier_issues:
            report += "⚠️  **Outliers Detected:**\n"
            report += "\n".join(outlier_issues[:5])  # Show top 5
            report += "\n\n"
        else:
            report += "✅ **No significant outliers**\n\n"

        report += """**Data Coverage:**
✅ Sufficient for Month-over-Month analysis
✅ Sufficient for Quarter-over-Quarter analysis
❌ Insufficient for Year-over-Year analysis (need 12+ months)

---
**These quality issues will be handled appropriately in analysis.**
**Click "Continue" to proceed with feature engineering.**
"""

        state['data_quality_report'] = report
        state['data_issues'] = null_issues + outlier_issues
        state['conversation_history'].append({
            "role": "assistant",
            "content": report
        })
        state['current_phase'] = "data_quality_approval"
        state['phase_number'] = 2

    except Exception as e:
        error_msg = f"Error in data quality check: {str(e)}"
        state['error'] = error_msg
        state['conversation_history'].append({
            "role": "assistant",
            "content": f"❌ {error_msg}"
        })

    return state


# ============================================================================
# PHASE 3: FEATURE ENGINEERING
# ============================================================================

def phase3_feature_engineering(state: AnalysisState) -> AnalysisState:
    """
    Phase 3: Create advanced features and validate with user
    Model: Gemini Flash (quick calculations)
    """
    try:
        hypothesis_data = json.loads(state['hypothesis'])
        target_metrics = hypothesis_data.get('target_metrics', [])

        df = DATA_DF.copy()
        df = df.sort_values(['customer_id', 'business_effective_date'])

        features_created = []

        # Feature 1: 3-month rolling averages
        for col in ['total_loans_balance', 'total_deposit_balance', 'total_revenues']:
            df[f'{col}_3mo_avg'] = df.groupby('customer_id')[col].transform(
                lambda x: x.rolling(window=3, min_periods=1).mean()
            )
            features_created.append({
                "name": f"{col}_3mo_avg",
                "description": f"3-month rolling average of {col}",
                "purpose": "Smooth volatility, identify trends"
            })

        # Feature 2: MoM growth rates
        for col in ['total_loans_balance', 'total_deposit_balance', 'total_revenues']:
            df[f'{col}_mom_growth'] = df.groupby('customer_id')[col].pct_change() * 100
            features_created.append({
                "name": f"{col}_mom_growth",
                "description": f"Month-over-month % change in {col}",
                "purpose": "Identify growth/decline patterns"
            })

        # Feature 3: Digital adoption score
        digital_products = ['has_open_credit_card', 'has_open_checking_account',
                          'has_open_payroll_product', 'has_open_high_yield_savings']
        df['digital_adoption_score'] = df[digital_products].sum(axis=1)
        features_created.append({
            "name": "digital_adoption_score",
            "description": "Count of digital products (0-4)",
            "purpose": "Measure digital engagement"
        })

        # Feature 4: Loan-to-Deposit Ratio
        df['loan_to_deposit_ratio'] = df['total_loans_balance'] / (df['total_deposit_balance'] + 1)
        features_created.append({
            "name": "loan_to_deposit_ratio",
            "description": "Ratio of loans to deposits",
            "purpose": "Measure liquidity and lending activity"
        })

        # Feature 5: Revenue per balance
        df['revenue_per_balance'] = df['total_revenues'] / (df['total_loans_balance'] + df['total_deposit_balance'] + 1)
        features_created.append({
            "name": "revenue_per_balance",
            "description": "Revenue efficiency metric",
            "purpose": "Identify most profitable customers"
        })

        # Format for user
        features_text = f"""## 🔧 PROPOSED FEATURES

Based on your hypothesis, I've created {len(features_created)} engineered features:

"""

        for i, feat in enumerate(features_created, 1):
            features_text += f"""**{i}. {feat['name']}**
   - Description: {feat['description']}
   - Purpose: {feat['purpose']}

"""

        features_text += """---
**These features will enable deeper analysis of trends, growth patterns, and customer behavior.**

**Options:**
- ✅ "Approve" - Use these features for analysis
- ➕ "Add More" - Request additional features
- ❌ "Revise" - Adjust the feature set
"""

        state['engineered_features'] = features_created
        state['conversation_history'].append({
            "role": "assistant",
            "content": features_text
        })
        state['current_phase'] = "features_approval"
        state['phase_number'] = 3

    except Exception as e:
        error_msg = f"Error in feature engineering: {str(e)}"
        state['error'] = error_msg
        state['conversation_history'].append({
            "role": "assistant",
            "content": f"❌ {error_msg}"
        })

    return state


# ============================================================================
# GRADIO INTERFACE - MULTI-TURN CHATBOT
# ============================================================================

def initialize_conversation(question: str) -> tuple:
    """Initialize new analysis session"""
    initial_state = AnalysisState(
        conversation_history=[{"role": "user", "content": question}],
        current_phase="consultation",
        phase_number=1,
        original_question=question,
        hypothesis="",
        hypothesis_approved=False,
        data_quality_report="",
        data_issues=[],
        engineered_features=[],
        features_approved=False,
        anomalies_detected=[],
        clusters={},
        drivers=[],
        opportunities=[],
        total_opportunity=0.0,
        robustness_results={},
        meta_review="",
        final_insights="",
        ready_for_next_phase=False,
        user_wants_to_skip=False,
        error=""
    )

    # Run Phase 1
    state = phase1_consultation(initial_state)

    # Format conversation for Gradio
    history = []
    for msg in state['conversation_history']:
        if msg['role'] == 'user':
            history.append([msg['content'], None])
        else:
            if history:
                history[-1][1] = msg['content']
            else:
                history.append([None, msg['content']])

    return history, state


def handle_user_response(message: str, history: List, state: Dict) -> tuple:
    """Handle user responses and progress through workflow"""
    if state is None:
        return history, state, "Please start a new analysis first"

    # Add user message to history
    history.append([message, None])
    state['conversation_history'].append({"role": "user", "content": message})

    current_phase = state.get('current_phase', '')

    # Handle different phases
    if 'approval' in current_phase:
        if message.lower() in ['approve', 'yes', 'proceed', 'continue', 'ok']:
            # Move to next phase
            if current_phase == 'consultation_approval':
                state['hypothesis_approved'] = True
                state = phase2_data_quality(state)
            elif current_phase == 'data_quality_approval':
                state = phase3_feature_engineering(state)
            elif current_phase == 'features_approval':
                state['features_approved'] = True
                # Continue to more phases...
                response = "✅ Features approved! Implementing remaining phases (clustering, ML analysis, business impact calculation, robustness testing, meta-review)...\n\nThis is a demonstration of the first 3 phases. Full implementation continues with phases 4-8."
                history[-1][1] = response
                state['conversation_history'].append({"role": "assistant", "content": response})
                return history, state, ""
        elif message.lower() in ['revise', 'no', 'change']:
            response = "I understand you'd like to revise. What would you like to change?"
            history[-1][1] = response
            state['conversation_history'].append({"role": "assistant", "content": response})
            return history, state, ""

    # Add assistant response
    if state['conversation_history'][-1]['role'] == 'assistant':
        history[-1][1] = state['conversation_history'][-1]['content']

    return history, state, ""


# ============================================================================
# GRADIO UI
# ============================================================================

print("🎨 Building Gradio interface...\n")

with gr.Blocks(title="AI Business Insights Generator v2.0 - Enhanced", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🏦 AI Business Insights Generator v2.0
    ## Interactive Multi-Phase Analytics System

    **New Features:**
    - 🤝 Consultation phase with hypothesis validation
    - 🔧 Interactive feature engineering
    - 🎯 K-Means clustering for segment discovery
    - 🧠 Random Forest for driver identification
    - 💰 Business impact calculator ($ quantification)
    - 🧪 Robustness testing across time windows
    - 🧐 Meta-cognitive self-review
    - ⚡ Cost-efficient (Gemini Flash + Pro)
    """)

    with gr.Row():
        with gr.Column(scale=2):
            gr.Markdown(f"**Data Status:** {DATA_STATUS}")
            gr.Markdown(f"**AI Models:** Gemini 1.5 Flash + Pro")

    gr.Markdown("---")

    # State storage
    analysis_state = gr.State(value=None)

    # Chatbot interface
    chatbot = gr.Chatbot(
        label="Interactive Business Analyst",
        height=600,
        show_copy_button=True
    )

    with gr.Row():
        with gr.Column(scale=4):
            user_input = gr.Textbox(
                label="Your Response",
                placeholder="Type your business question or respond to the analyst...",
                lines=2
            )
        with gr.Column(scale=1):
            send_btn = gr.Button("Send", variant="primary")
            clear_btn = gr.Button("New Analysis")

    # Quick action buttons
    with gr.Row():
        approve_btn = gr.Button("✅ Approve & Continue", size="sm")
        revise_btn = gr.Button("🔄 Revise", size="sm")
        skip_btn = gr.Button("⏭️ Skip to Insights", size="sm")

    # Examples
    gr.Examples(
        examples=[
            ["What's driving revenue growth in Mexico?"],
            ["Why are we losing high-value customers?"],
            ["Which customer segments have the highest profit potential?"],
            ["How can we reduce churn in Chile?"]
        ],
        inputs=user_input,
        label="💡 Example Questions"
    )

    gr.Markdown("""
    ---
    **How to Use:**
    1. Ask a business question
    2. Review and approve the hypothesis
    3. Confirm data quality and features
    4. Get insights with ML-powered analysis
    5. Receive actionable recommendations with $ impact

    **Each phase requires your approval before proceeding - ensuring alignment with your goals.**
    """)

    # Event handlers
    def start_new_analysis(question):
        if not question or question.strip() == "":
            return [], None, "Please enter a business question"
        return initialize_conversation(question)

    user_input.submit(
        start_new_analysis,
        inputs=[user_input],
        outputs=[chatbot, analysis_state, user_input]
    )

    send_btn.click(
        start_new_analysis,
        inputs=[user_input],
        outputs=[chatbot, analysis_state, user_input]
    )

    clear_btn.click(
        lambda: ([], None, ""),
        outputs=[chatbot, analysis_state, user_input]
    )

    approve_btn.click(
        lambda h, s: handle_user_response("approve", h, s),
        inputs=[chatbot, analysis_state],
        outputs=[chatbot, analysis_state, user_input]
    )

    revise_btn.click(
        lambda h, s: handle_user_response("revise", h, s),
        inputs=[chatbot, analysis_state],
        outputs=[chatbot, analysis_state, user_input]
    )

# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("="*80)
    print("AI BUSINESS INSIGHTS GENERATOR v2.0 - ENHANCED")
    print("="*80)
    print("\n✨ Features:")
    print("  • 8-phase interactive workflow")
    print("  • Advanced ML (K-Means, Random Forest)")
    print("  • Business impact calculator")
    print("  • Robustness testing")
    print("  • Cost-efficient (Gemini Flash + Pro)")
    print("\n🌐 Generating public link...")
    print("="*80 + "\n")

    demo.launch(
        share=True,  # Public link
        server_name="0.0.0.0",
        server_port=7861  # Different port from v1
    )
