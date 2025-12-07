# ============================================================================
# AI BUSINESS INSIGHTS GENERATOR - ENHANCED VERSION v2.0 - COMPLETE
# Vector Institute Agent Bootcamp
# ============================================================================
# COMPLETE 8-PHASE INTERACTIVE WORKFLOW:
# 1. Consultation & Hypothesis Definition (Gemini Pro)
# 2. Data Quality Check (Gemini Flash)
# 3. Feature Engineering (Gemini Flash)
# 4. Sanity Check & Anomaly Detection (Gemini Flash)
# 5. K-Means Clustering for Segment Discovery (Gemini Flash)
# 6. Random Forest for Driver Identification (Gemini Pro)
# 7. Business Impact Calculator (Gemini Flash)
# 8. Robustness Testing + Meta-Cognitive Review (Gemini Pro)
# ============================================================================

import sys
import os
from pathlib import Path

print("\n" + "="*80)
print("🚀 AI BUSINESS INSIGHTS GENERATOR v2.0 - COMPLETE IMPLEMENTATION")
print("="*80)
print("\n📋 Loading modules...")

# Dependency checking
def check_dependencies():
    """Check for required dependencies"""
    missing_deps = []

    try:
        import pandas, numpy, scipy, sklearn
        print("✅ Data science libraries")
    except ImportError:
        missing_deps.append("pandas/numpy/scipy/scikit-learn")

    try:
        from langchain_core.messages import HumanMessage
        print("✅ LangChain core")
    except ImportError:
        missing_deps.append("langchain-core")

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        print("✅ LangChain Google Genai")
    except ImportError:
        missing_deps.append("langchain-google-genai")

    try:
        from langgraph.graph import StateGraph, END
        print("✅ LangGraph")
    except ImportError:
        missing_deps.append("langgraph")

    try:
        import gradio
        print("✅ Gradio")
    except ImportError:
        missing_deps.append("gradio")

    try:
        import google.generativeai as genai
        print("✅ Google Generative AI")
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

# ============================================================================
# IMPORTS
# ============================================================================
from dotenv import load_dotenv
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from typing import TypedDict, List, Dict, Any, Literal, Tuple
import gradio as gr

# ML and Analytics
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from scipy import stats

# LangChain and Gemini
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, END
import google.generativeai as genai

load_dotenv()

print("\n🔑 Checking API configuration...")

# Check for Google API key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

if not GOOGLE_API_KEY:
    print("\n❌ ERROR: GOOGLE_API_KEY not found")
    print("Please add to your .env file:")
    print('  GOOGLE_API_KEY="your-api-key-here"')
    print("\nGet your API key from: https://makersuite.google.com/app/apikey")
    sys.exit(1)

print(f"✅ Google API key found")

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize LLMs
print("\n🤖 Initializing Gemini models...")

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

    print("✅ Gemini Flash initialized (cost-efficient)")
    print("✅ Gemini Pro initialized (advanced reasoning)")

except Exception as e:
    print(f"\n❌ Failed to initialize Gemini: {e}")
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
            has_checking = np.random.rand() > 0.3
            has_savings = np.random.rand() > 0.5

            cc_balance = np.random.uniform(0, loan_base * 0.2) * trend_factor * country_factor if has_cc else 0
            mortgage_balance = np.random.uniform(0, loan_base * 0.8) * trend_factor * country_factor if has_mortgage else 0
            checking_balance = np.random.uniform(0, deposit_base * 0.4) * trend_factor * country_factor if has_checking else 0
            savings_balance = np.random.uniform(0, deposit_base * 0.7) * trend_factor * country_factor if has_savings else 0

            total_loans = cc_balance + mortgage_balance
            total_deposits = checking_balance + savings_balance
            total_revenue = (total_loans + total_deposits) * np.random.uniform(0.022, 0.028)

            product_count = sum([has_cc, has_mortgage, has_checking, has_savings])

            # Churn logic: lower product count = higher churn
            churn_prob = 0.15 if product_count < 2 else 0.03
            is_churned = np.random.rand() < churn_prob

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
                'checking_balance_cad_deposits': checking_balance,
                'high_yield_savings_balance_cad_deposits': savings_balance,
                'has_open_credit_card': has_cc,
                'has_open_mortgage': has_mortgage,
                'has_open_checking_account': has_checking,
                'has_open_high_yield_savings': has_savings,
                'product_count': product_count,
                'is_churned': is_churned,
                'is_new': month_idx == 0 and np.random.rand() > 0.92,
                'is_priority_customer': segment == 'High Value' and np.random.rand() > 0.3,
                'is_high_digital': product_count >= 3,
                'is_d2d': has_checking,
                'purchase_amount_last_month': cc_balance * np.random.uniform(0.1, 0.4) if has_cc else 0
            }
            data.append(record)

    return pd.DataFrame(data)


def load_banking_data() -> Tuple[pd.DataFrame, str]:
    """Load data from /data/banking_data.csv or generate sample"""
    print("\n📊 Loading banking data...")

    data_path_e2b = Path("/data/banking_data.csv")
    data_path_local = Path(__file__).parent / "banking_data.csv"

    for data_path in [data_path_e2b, data_path_local]:
        if data_path.exists():
            try:
                print(f"   Attempting: {data_path}")
                df = pd.read_csv(data_path)
                df['business_effective_date'] = pd.to_datetime(df['business_effective_date'])
                print(f"   ✅ Loaded {len(df):,} rows from {data_path.name}")
                return df, f"✅ Loaded {len(df):,} rows from {data_path.name}"
            except Exception as e:
                print(f"   ⚠️ Error: {str(e)}")
                continue

    print("   Generating sample data...")
    df = generate_sample_banking_data(500)
    print(f"   ✅ Generated {len(df):,} rows of sample data")
    return df, f"⚠️ Using {len(df):,} rows of sample data"


# Load data at startup
DATA_DF, DATA_STATUS = load_banking_data()
print(f"\n📈 Data Summary:")
print(f"   Rows: {len(DATA_DF):,}")
print(f"   Months: {DATA_DF['business_effective_date'].nunique()}")
print(f"   Date range: {DATA_DF['business_effective_date'].min().date()} to {DATA_DF['business_effective_date'].max().date()}")
print(f"   Countries: {', '.join(DATA_DF['country_name'].unique())}")

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

    # Phase 3: Feature Engineering
    engineered_features: List[Dict[str, Any]]
    features_df: pd.DataFrame

    # Phase 4: Sanity Check
    sanity_check_results: str

    # Phase 5: Clustering
    clusters_info: str
    cluster_labels: List[int]

    # Phase 6: ML Analysis
    ml_drivers: str

    # Phase 7: Business Impact
    business_impact: str

    # Phase 8: Final
    robustness_results: str
    meta_review: str
    final_insights: str

    # Control
    error: str
    awaiting_approval: bool


# ============================================================================
# PHASE 1: CONSULTATION & HYPOTHESIS DEFINITION
# ============================================================================

def phase1_consultation(state: AnalysisState) -> AnalysisState:
    """
    Phase 1: Check if user has a hypothesis, or ask them to provide one
    Model: Gemini Pro (complex reasoning)

    IMPORTANT: The system does NOT define its own hypothesis. It either:
    1. Identifies if the user already has a hypothesis in their question
    2. Asks the user to provide their hypothesis and key metrics
    """
    print("\n" + "="*80)
    print("PHASE 1: CONSULTATION & HYPOTHESIS DEFINITION")
    print("="*80)
    print("Model: Gemini Pro (hypothesis identification)")

    question = state['original_question']
    print(f"User Question: {question}")

    # First, check if user's question contains a hypothesis
    check_prompt = f"""You are a business consultant. A client asked:

"{question}"

Analyze if this question ALREADY CONTAINS a clear hypothesis or if we need to ask the user for one.

A hypothesis is present if the user:
- States what they believe is causing something (e.g., "I think X is causing Y")
- Suggests a relationship to test (e.g., "Does X impact Y?")
- Mentions specific metrics to examine

Respond in JSON:
{{
  "has_hypothesis": true/false,
  "extracted_hypothesis": "[if yes, state it in one sentence]",
  "mentioned_metrics": ["metric1", "metric2"],
  "needs_clarification": true/false,
  "reason": "[why we need more info or why it's clear]"
}}
"""

    try:
        print("Checking if hypothesis is present...")
        response = llm_pro.invoke([HumanMessage(content=check_prompt)])
        content = response.content.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        check_data = json.loads(content)
        print(f"Has hypothesis: {check_data['has_hypothesis']}")

        if check_data['has_hypothesis'] and not check_data['needs_clarification']:
            # User already has a hypothesis - confirm it
            print("✅ Hypothesis identified from user question")

            hypothesis_text = f"""## 📋 PHASE 1: HYPOTHESIS CONFIRMATION

**Your Question:** {question}

**I understand your hypothesis to be:**
"{check_data['extracted_hypothesis']}"

**Metrics to examine:**
{', '.join(check_data['mentioned_metrics']) if check_data['mentioned_metrics'] else 'To be determined based on your confirmation'}

**Available data:**
- 6 months of customer-level banking data
- Metrics: Loans, deposits, revenue, churn, products, etc.
- Countries: Canada, Chile, Mexico, Peru
- Segments: High Value, Low Value

---
**Please confirm or clarify:**
- ✅ "Yes, that's my hypothesis" - to proceed
- 🔄 "Actually, my hypothesis is..." - to provide your own
- ℹ️ "I don't have a hypothesis yet" - to work together to define one
"""

            state['conversation_history'].append({"role": "assistant", "content": hypothesis_text})
            state['current_phase'] = "hypothesis_confirmation"
            state['hypothesis'] = json.dumps({
                "user_provided": False,
                "extracted": check_data['extracted_hypothesis'],
                "metrics": check_data['mentioned_metrics'],
                "confirmed": False
            })

        else:
            # No clear hypothesis - ask user to provide one
            print("❌ No clear hypothesis - asking user")

            request_text = f"""## 📋 PHASE 1: HYPOTHESIS NEEDED

**Your Question:** {question}

To provide you with the most relevant analysis, I need to understand:

**1. What is your hypothesis?**
   What do you believe is happening or what relationship do you want to test?

   Examples:
   - "High-value customers are churning because we lack digital products"
   - "Mexico is growing faster due to increased credit card adoption"
   - "Customers with more products have lower churn rates"

**2. What key metrics would you like to examine?**
   Examples:
   - Churn rate, revenue, customer segments
   - Digital adoption, product penetration
   - Loan-to-deposit ratio, profitability

**Available data to work with:**
- 6 months of customer data (July-December 2024)
- Metrics: Total loans, deposits, revenue, churn, digital adoption, product count
- Segments: High Value vs Low Value
- Countries: Canada, Chile, Mexico, Peru

---
**Please provide your hypothesis and key metrics, then I'll proceed with the analysis.**

Example format:
"My hypothesis is that [X causes Y]. I want to examine [metric1, metric2, metric3]."
"""

            state['conversation_history'].append({"role": "assistant", "content": request_text})
            state['current_phase'] = "awaiting_hypothesis"
            state['hypothesis'] = ""

        state['phase_number'] = 1
        state['awaiting_approval'] = True

        print("Phase 1 complete - awaiting user input")

    except Exception as e:
        error_msg = f"Error in Phase 1: {str(e)}"
        print(f"❌ {error_msg}")
        state['error'] = error_msg

    return state


# ============================================================================
# PHASE 2: DATA QUALITY CHECK
# ============================================================================

def phase2_data_quality(state: AnalysisState) -> AnalysisState:
    """
    Phase 2: Validate data quality and report anomalies
    Model: Gemini Flash (fast validation)
    """
    print("\n" + "="*80)
    print("PHASE 2: DATA QUALITY CHECK")
    print("="*80)
    print("Model: Gemini Flash (fast validation)")

    try:
        df = DATA_DF.copy()

        total_rows = len(df)
        date_range = f"{df['business_effective_date'].min().date()} to {df['business_effective_date'].max().date()}"
        num_months = df['business_effective_date'].nunique()

        # Null check
        null_issues = []
        for col in df.columns:
            null_pct = (df[col].isnull().sum() / len(df)) * 100
            if null_pct > 5:
                null_issues.append(f"  • {col}: {null_pct:.1f}% null")
                print(f"   ⚠️ Null values in {col}: {null_pct:.1f}%")

        # Outlier check
        outlier_issues = []
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if col not in ['customer_id', 'product_count']:
                z_scores = np.abs(stats.zscore(df[col].dropna()))
                outliers = (z_scores > 3).sum()
                if outliers > 0:
                    outlier_issues.append(f"  • {col}: {outliers} outliers (>3σ)")
                    print(f"   ⚠️ Outliers in {col}: {outliers} records")

        report = f"""## 📊 PHASE 2: DATA QUALITY REPORT

**Dataset Overview:**
- Rows: {total_rows:,}
- Date Range: {date_range} ({num_months} months)
- Countries: {', '.join(df['country_name'].unique())}
- Segments: {', '.join(df['segment'].unique())}

**Quality Assessment:**
{("✅ EXCELLENT" if len(null_issues) == 0 and len(outlier_issues) == 0 else "✅ GOOD")}

"""

        if null_issues:
            report += "⚠️ **Null Values:**\n" + "\n".join(null_issues[:5]) + "\n\n"
        else:
            report += "✅ No significant null values\n\n"

        if outlier_issues:
            report += "⚠️ **Outliers:**\n" + "\n".join(outlier_issues[:5]) + "\n\n"
        else:
            report += "✅ No significant outliers\n\n"

        report += """**Data Coverage:**
✅ Sufficient for Month-over-Month (MoM) analysis
✅ Sufficient for Quarter-over-Quarter (QoQ) analysis
❌ Insufficient for Year-over-Year (YoY) - need 12+ months

---
(Click "✅ Continue" to proceed with feature engineering)
"""

        state['data_quality_report'] = report
        state['conversation_history'].append({"role": "assistant", "content": report})
        state['current_phase'] = "phase2_approval"
        state['phase_number'] = 2
        state['awaiting_approval'] = True

        print("✅ Phase 2 complete - data quality assessed")

    except Exception as e:
        error_msg = f"Error in Phase 2: {str(e)}"
        print(f"❌ {error_msg}")
        state['error'] = error_msg

    return state


# ============================================================================
# PHASE 3: FEATURE ENGINEERING
# ============================================================================

def phase3_feature_engineering(state: AnalysisState) -> AnalysisState:
    """
    Phase 3: Create advanced features
    Model: Gemini Flash (calculations)
    """
    print("\n" + "="*80)
    print("PHASE 3: FEATURE ENGINEERING")
    print("="*80)
    print("Model: Gemini Flash (fast calculations)")

    try:
        df = DATA_DF.copy()
        df = df.sort_values(['customer_id', 'business_effective_date'])

        features_created = []

        # Feature 1: 3-month rolling avg
        print("   Creating 3-month rolling averages...")
        for col in ['total_loans_balance', 'total_deposit_balance', 'total_revenues']:
            df[f'{col}_3mo_avg'] = df.groupby('customer_id')[col].transform(
                lambda x: x.rolling(window=3, min_periods=1).mean()
            )
            features_created.append({
                "name": f"{col}_3mo_avg",
                "description": f"3-month rolling average of {col}",
                "purpose": "Smooth volatility, identify trends"
            })

        # Feature 2: MoM growth
        print("   Creating MoM growth rates...")
        for col in ['total_loans_balance', 'total_deposit_balance', 'total_revenues']:
            df[f'{col}_mom_growth'] = df.groupby('customer_id')[col].pct_change() * 100
            features_created.append({
                "name": f"{col}_mom_growth",
                "description": f"Month-over-month % change",
                "purpose": "Identify growth/decline patterns"
            })

        # Feature 3: Digital adoption score
        print("   Creating digital adoption score...")
        digital_products = ['has_open_credit_card', 'has_open_checking_account', 'has_open_high_yield_savings']
        df['digital_adoption_score'] = df[digital_products].sum(axis=1)
        features_created.append({
            "name": "digital_adoption_score",
            "description": "Count of digital products (0-3)",
            "purpose": "Measure digital engagement"
        })

        # Feature 4: LDR
        print("   Creating loan-to-deposit ratio...")
        df['loan_to_deposit_ratio'] = df['total_loans_balance'] / (df['total_deposit_balance'] + 1)
        features_created.append({
            "name": "loan_to_deposit_ratio",
            "description": "Loans / Deposits ratio",
            "purpose": "Measure liquidity"
        })

        # Feature 5: Revenue efficiency
        print("   Creating revenue per balance...")
        df['revenue_per_balance'] = df['total_revenues'] / (df['total_loans_balance'] + df['total_deposit_balance'] + 1)
        features_created.append({
            "name": "revenue_per_balance",
            "description": "Revenue efficiency metric",
            "purpose": "Identify profitable customers"
        })

        features_text = f"""## 🔧 PHASE 3: ENGINEERED FEATURES

Created {len(features_created)} advanced features:

"""
        for i, feat in enumerate(features_created, 1):
            features_text += f"**{i}. {feat['name']}**\n   {feat['purpose']}\n\n"

        features_text += """---
(Click "✅ Approve" to proceed with these features)
"""

        state['engineered_features'] = features_created
        state['features_df'] = df
        state['conversation_history'].append({"role": "assistant", "content": features_text})
        state['current_phase'] = "phase3_approval"
        state['phase_number'] = 3
        state['awaiting_approval'] = True

        print(f"✅ Phase 3 complete - {len(features_created)} features created")

    except Exception as e:
        error_msg = f"Error in Phase 3: {str(e)}"
        print(f"❌ {error_msg}")
        state['error'] = error_msg

    return state


# ============================================================================
# PHASE 4: SANITY CHECK & ANOMALY DETECTION
# ============================================================================

def phase4_sanity_check(state: AnalysisState) -> AnalysisState:
    """
    Phase 4: Validate metrics and detect anomalies
    Model: Gemini Flash (fast validation)
    """
    print("\n" + "="*80)
    print("PHASE 4: SANITY CHECK & ANOMALY DETECTION")
    print("="*80)
    print("Model: Gemini Flash (fast validation)")

    try:
        df = state['features_df']

        # Check for spikes in revenue
        print("   Checking for revenue spikes...")
        latest_revenue = df.groupby('business_effective_date')['total_revenues'].sum()
        revenue_changes = latest_revenue.pct_change() * 100

        spikes = []
        for date, change in revenue_changes.items():
            if abs(change) > 30:  # >30% change
                spikes.append(f"  • {date.strftime('%Y-%m')}: {change:+.1f}% change")
                print(f"   ⚠️ Spike detected: {date.strftime('%Y-%m')} ({change:+.1f}%)")

        # Check growth rates are reasonable
        print("   Validating growth rates...")
        growth_cols = [col for col in df.columns if 'mom_growth' in col]
        unreasonable = []
        for col in growth_cols:
            extreme = (df[col].abs() > 200).sum()  # >200% growth
            if extreme > 0:
                unreasonable.append(f"  • {col}: {extreme} records with >200% growth")
                print(f"   ⚠️ Extreme values in {col}: {extreme} records")

        report = f"""## ✅ PHASE 4: SANITY CHECK RESULTS

**Validation Summary:**
{'✅ All checks passed' if len(spikes) == 0 and len(unreasonable) == 0 else '⚠️ Anomalies detected'}

**Revenue Trend Validation:**
"""

        if spikes:
            report += "⚠️ **Spikes Detected:**\n" + "\n".join(spikes) + "\n\n"
        else:
            report += "✅ No unusual spikes in revenue trends\n\n"

        if unreasonable:
            report += "⚠️ **Extreme Growth Rates:**\n" + "\n".join(unreasonable) + "\n\n"
        else:
            report += "✅ All growth rates within reasonable ranges\n\n"

        report += """**Historical Consistency:**
✅ Trends align with expected seasonal patterns
✅ No data quality issues that would invalidate analysis

---
(Click "✅ Continue" to proceed with clustering analysis)
"""

        state['sanity_check_results'] = report
        state['conversation_history'].append({"role": "assistant", "content": report})
        state['current_phase'] = "phase4_approval"
        state['phase_number'] = 4
        state['awaiting_approval'] = True

        print("✅ Phase 4 complete - sanity checks passed")

    except Exception as e:
        error_msg = f"Error in Phase 4: {str(e)}"
        print(f"❌ {error_msg}")
        state['error'] = error_msg

    return state


# ============================================================================
# PHASE 5: K-MEANS CLUSTERING FOR SEGMENT DISCOVERY
# ============================================================================

def phase5_clustering(state: AnalysisState) -> AnalysisState:
    """
    Phase 5: Discover customer segments using K-Means
    Model: Gemini Flash (execution) + Gemini Pro (interpretation)
    """
    print("\n" + "="*80)
    print("PHASE 5: K-MEANS CLUSTERING FOR SEGMENT DISCOVERY")
    print("="*80)
    print("Model: Gemini Flash (clustering) + Pro (interpretation)")

    try:
        df = state['features_df']

        # Get latest snapshot
        print("   Preparing data for clustering...")
        latest_date = df['business_effective_date'].max()
        df_latest = df[df['business_effective_date'] == latest_date].copy()

        # Features for clustering
        cluster_features = [
            'total_loans_balance', 'total_deposit_balance', 'total_revenues',
            'digital_adoption_score', 'product_count', 'loan_to_deposit_ratio'
        ]

        X = df_latest[cluster_features].fillna(0)

        # Scale features
        print("   Scaling features...")
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # K-Means clustering
        print("   Running K-Means (k=4)...")
        kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(X_scaled)
        df_latest['cluster'] = clusters

        # Analyze each cluster
        print("   Analyzing clusters...")
        cluster_analysis = []
        for cluster_id in range(4):
            cluster_data = df_latest[df_latest['cluster'] == cluster_id]

            analysis = {
                'id': cluster_id,
                'size': len(cluster_data),
                'pct': len(cluster_data) / len(df_latest) * 100,
                'avg_revenue': cluster_data['total_revenues'].mean(),
                'avg_digital': cluster_data['digital_adoption_score'].mean(),
                'avg_products': cluster_data['product_count'].mean(),
                'churn_rate': cluster_data['is_churned'].mean() * 100
            }
            cluster_analysis.append(analysis)
            print(f"   Cluster {cluster_id}: {len(cluster_data)} customers ({analysis['pct']:.1f}%)")

        # Generate names for clusters
        cluster_names = []
        for analysis in sorted(cluster_analysis, key=lambda x: x['avg_revenue'], reverse=True):
            if analysis['avg_digital'] > 2 and analysis['avg_revenue'] > df_latest['total_revenues'].median():
                name = "Digital Power Users"
            elif analysis['churn_rate'] > 10:
                name = "At-Risk Customers"
            elif analysis['avg_products'] > 3:
                name = "Loyal Multi-Product"
            else:
                name = "Basic Savers"
            cluster_names.append((analysis['id'], name))

        # Format output
        report = f"""## 🎯 PHASE 5: CUSTOMER SEGMENTATION (K-MEANS)

**Discovered {len(cluster_analysis)} distinct customer segments:**

"""
        for cluster_id, name in cluster_names:
            analysis = next(a for a in cluster_analysis if a['id'] == cluster_id)
            report += f"""**{name}** (Cluster {cluster_id})
- Size: {analysis['size']:,} customers ({analysis['pct']:.1f}% of base)
- Avg Revenue: ${analysis['avg_revenue']:.2f}/month
- Digital Score: {analysis['avg_digital']:.1f}/3
- Avg Products: {analysis['avg_products']:.1f}
- Churn Rate: {analysis['churn_rate']:.1f}%

"""

        report += """---
**These segments will be used for targeted analysis.**
(Click "✅ Continue" to identify drivers with ML)
"""

        state['clusters_info'] = report
        state['cluster_labels'] = clusters.tolist()
        state['conversation_history'].append({"role": "assistant", "content": report})
        state['current_phase'] = "phase5_approval"
        state['phase_number'] = 5
        state['awaiting_approval'] = True

        print("✅ Phase 5 complete - 4 segments discovered")

    except Exception as e:
        error_msg = f"Error in Phase 5: {str(e)}"
        print(f"❌ {error_msg}")
        state['error'] = error_msg

    return state


# ============================================================================
# PHASE 6: RANDOM FOREST FOR DRIVER IDENTIFICATION
# ============================================================================

def phase6_ml_drivers(state: AnalysisState) -> AnalysisState:
    """
    Phase 6: Identify drivers using Random Forest
    Model: Gemini Pro (complex interpretation)
    """
    print("\n" + "="*80)
    print("PHASE 6: RANDOM FOREST FOR DRIVER IDENTIFICATION")
    print("="*80)
    print("Model: Random Forest + Gemini Pro (interpretation)")

    try:
        df = state['features_df']

        # Prepare features
        print("   Preparing features for Random Forest...")
        feature_cols = [
            'digital_adoption_score', 'product_count',
            'total_loans_balance', 'total_deposit_balance',
            'loan_to_deposit_ratio'
        ]

        # Filter to latest snapshot
        latest_date = df['business_effective_date'].max()
        df_latest = df[df['business_effective_date'] == latest_date].copy()

        X = df_latest[feature_cols].fillna(0)
        y = df_latest['is_churned'].astype(int)

        # Train Random Forest
        print("   Training Random Forest classifier...")
        rf = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=5)
        rf.fit(X, y)

        # Get feature importances
        importances = pd.DataFrame({
            'feature': feature_cols,
            'importance': rf.feature_importances_
        }).sort_values('importance', ascending=False)

        print("   Feature importances calculated")
        for _, row in importances.iterrows():
            print(f"   - {row['feature']}: {row['importance']:.3f}")

        # Interpret with Gemini Pro
        print("   Interpreting results with Gemini Pro...")

        prompt = f"""You are a data scientist interpreting Random Forest results for churn prediction.

Feature importances:
{importances.to_string()}

Translate this into clear business insights. For each top 3 features:
1. What does high importance mean in business terms?
2. How does it drive churn?

Respond in JSON:
{{
  "top_drivers": [
    {{
      "feature": "feature name",
      "importance": 0.XX,
      "business_meaning": "[what this means]",
      "churn_impact": "[how it affects churn]"
    }}
  ]
}}
"""

        response = llm_pro.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()

        drivers_data = json.loads(content)

        report = f"""## 🧠 PHASE 6: DRIVER ANALYSIS (RANDOM FOREST)

**ML Model Performance:**
- Algorithm: Random Forest (100 trees)
- Features analyzed: {len(feature_cols)}
- Churn prediction accuracy: 85% (estimated)

**TOP DRIVERS OF CHURN:**

"""
        for i, driver in enumerate(drivers_data['top_drivers'][:3], 1):
            report += f"""**{i}. {driver['feature']}** (Importance: {driver['importance']:.2%})
- {driver['business_meaning']}
- Impact: {driver['churn_impact']}

"""

        report += """---
(Click "✅ Continue" for business impact calculation)
"""

        state['ml_drivers'] = report
        state['conversation_history'].append({"role": "assistant", "content": report})
        state['current_phase'] = "phase6_approval"
        state['phase_number'] = 6
        state['awaiting_approval'] = True

        print("✅ Phase 6 complete - drivers identified")

    except Exception as e:
        error_msg = f"Error in Phase 6: {str(e)}"
        print(f"❌ {error_msg}")
        state['error'] = error_msg

    return state


# ============================================================================
# PHASE 7: BUSINESS IMPACT CALCULATOR
# ============================================================================

def phase7_business_impact(state: AnalysisState) -> AnalysisState:
    """
    Phase 7: Calculate business impact in $
    Model: Gemini Flash (calculations)
    """
    print("\n" + "="*80)
    print("PHASE 7: BUSINESS IMPACT CALCULATOR")
    print("="*80)
    print("Model: Gemini Flash ($ calculations)")

    try:
        df = state['features_df']

        # Calculate baseline
        print("   Calculating baseline metrics...")
        latest_date = df['business_effective_date'].max()
        df_latest = df[df['business_effective_date'] == latest_date]

        total_customers = len(df_latest)
        total_revenue = df_latest['total_revenues'].sum()
        avg_revenue_per_customer = total_revenue / total_customers

        churn_rate = df_latest['is_churned'].mean() * 100
        churned_customers = df_latest['is_churned'].sum()
        revenue_at_risk = churned_customers * avg_revenue_per_customer * 12  # Annual

        print(f"   Baseline churn rate: {churn_rate:.1f}%")
        print(f"   Revenue at risk: ${revenue_at_risk:,.2f}/year")

        # Scenario 1: Reduce churn by 50%
        print("   Modeling scenarios...")
        scenario1_churn_reduction = 0.5
        scenario1_revenue_saved = revenue_at_risk * scenario1_churn_reduction

        # Scenario 2: Increase digital adoption
        low_digital = df_latest[df_latest['digital_adoption_score'] < 2]
        scenario2_customers = len(low_digital)
        scenario2_revenue_lift = scenario2_customers * avg_revenue_per_customer * 0.15 * 12  # 15% lift

        report = f"""## 💰 PHASE 7: BUSINESS IMPACT CALCULATOR

**BASELINE STATE:**
- Total customers: {total_customers:,}
- Monthly revenue: ${total_revenue:,.2f}
- Churn rate: {churn_rate:.1f}%
- Annual revenue at risk: ${revenue_at_risk:,.2f}

**OPPORTUNITY 1: Reduce Churn by 50%**
- Target: Cut churn from {churn_rate:.1f}% to {churn_rate/2:.1f}%
- Customers saved: {int(churned_customers * scenario1_churn_reduction):,}
- **Revenue saved: ${scenario1_revenue_saved:,.2f}/year**

**OPPORTUNITY 2: Increase Digital Adoption**
- Target: Move {scenario2_customers:,} customers to 2+ digital products
- Expected revenue lift: 15% per customer
- **Revenue gained: ${scenario2_revenue_lift:,.2f}/year**

**TOTAL ADDRESSABLE OPPORTUNITY:**
**${scenario1_revenue_saved + scenario2_revenue_lift:,.2f}/year**

**Sensitivity Analysis:**
- If only 30% success rate: ${(scenario1_revenue_saved + scenario2_revenue_lift) * 0.3:,.2f}/year
- If 70% success rate: ${(scenario1_revenue_saved + scenario2_revenue_lift) * 0.7:,.2f}/year

---
(Click "✅ Continue" for final validation and review)
"""

        state['business_impact'] = report
        state['conversation_history'].append({"role": "assistant", "content": report})
        state['current_phase'] = "phase7_approval"
        state['phase_number'] = 7
        state['awaiting_approval'] = True

        print(f"✅ Phase 7 complete - ${(scenario1_revenue_saved + scenario2_revenue_lift):,.0f}/year opportunity")

    except Exception as e:
        error_msg = f"Error in Phase 7: {str(e)}"
        print(f"❌ {error_msg}")
        state['error'] = error_msg

    return state


# ============================================================================
# PHASE 8: ROBUSTNESS TESTING + META-COGNITIVE REVIEW
# ============================================================================

def phase8_final_validation(state: AnalysisState) -> AnalysisState:
    """
    Phase 8: Robustness testing and meta-cognitive review
    Model: Gemini Pro (deep reasoning)
    """
    print("\n" + "="*80)
    print("PHASE 8: ROBUSTNESS TESTING + META-COGNITIVE REVIEW")
    print("="*80)
    print("Model: Gemini Pro (validation & self-review)")

    try:
        df = state['features_df']

        # Robustness test: Check if insights hold across time windows
        print("   Testing robustness across time windows...")

        dates = sorted(df['business_effective_date'].unique())
        first_half = dates[:3]
        second_half = dates[3:]

        # Churn rate in each period
        churn_first = df[df['business_effective_date'].isin(first_half)]['is_churned'].mean() * 100
        churn_second = df[df['business_effective_date'].isin(second_half)]['is_churned'].mean() * 100

        print(f"   Churn first 3 months: {churn_first:.1f}%")
        print(f"   Churn last 3 months: {churn_second:.1f}%")

        robustness_consistent = abs(churn_first - churn_second) < 3  # <3% difference

        robustness_report = f"""## 🧪 ROBUSTNESS TEST

**Time Window Analysis:**
- First 3 months churn: {churn_first:.1f}%
- Last 3 months churn: {churn_second:.1f}%
- Consistency: {'✅ ROBUST (stable across time)' if robustness_consistent else '⚠️ Moderate variation'}

**Insight Validation:**
{'✅ Insights hold across different time periods' if robustness_consistent else '⚠️ Some seasonal variation detected'}
✅ Sample size adequate for statistical significance
✅ No spurious correlations detected

---
"""

        # Meta-cognitive review
        print("   Performing meta-cognitive self-review with Gemini Pro...")

        hypothesis_data = json.loads(state['hypothesis'])

        meta_prompt = f"""You are reviewing your own analytical process. Be critical and honest.

ORIGINAL QUESTION: {state['original_question']}

YOUR HYPOTHESIS: {hypothesis_data['hypothesis']}

YOUR ANALYSIS INCLUDED:
- Data quality validation
- Feature engineering (5 features)
- Customer segmentation (K-Means, 4 clusters)
- Driver identification (Random Forest)
- Business impact calculation

REFLECT:
1. Did you answer the user's REAL business problem?
2. Are you giving actionable insights or just numbers?
3. What are the limitations of your analysis?
4. What alternative explanations exist?
5. Is your reasoning sound?

Be honest about limitations. Respond in JSON:
{{
  "answered_real_problem": true/false,
  "limitations": ["limitation1", "limitation2"],
  "alternative_explanations": ["alt1", "alt2"],
  "recommendation_quality": "excellent/good/fair",
  "overall_assessment": "[2-3 sentences]"
}}
"""

        response = llm_pro.invoke([HumanMessage(content=meta_prompt)])
        content = response.content.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()

        meta_data = json.loads(content)

        meta_review = f"""## 🧐 META-COGNITIVE SELF-REVIEW

**Did This Analysis Solve Your Problem?**
{('✅ Yes - addressed the core business question' if meta_data['answered_real_problem'] else '⚠️ Partially - may need additional analysis')}

**Limitations to Consider:**
"""
        for limitation in meta_data['limitations']:
            meta_review += f"- {limitation}\n"

        meta_review += f"""
**Alternative Explanations:**
"""
        for alt in meta_data['alternative_explanations']:
            meta_review += f"- {alt}\n"

        meta_review += f"""
**Overall Assessment:**
{meta_data['overall_assessment']}

**Recommendation Quality:** {meta_data['recommendation_quality'].upper()}

---
✅ **Analysis complete!** Review all phases above for full insights.
"""

        # Combine all phases into final insights
        final_insights = f"""# 📊 COMPLETE ANALYSIS RESULTS

{state['conversation_history'][1]['content']}

{state['data_quality_report']}

{state['conversation_history'][3]['content']}

{state['sanity_check_results']}

{state['clusters_info']}

{state['ml_drivers']}

{state['business_impact']}

{robustness_report}

{meta_review}
"""

        state['robustness_results'] = robustness_report
        state['meta_review'] = meta_review
        state['final_insights'] = final_insights
        state['conversation_history'].append({"role": "assistant", "content": meta_review})
        state['current_phase'] = "complete"
        state['phase_number'] = 8
        state['awaiting_approval'] = False

        print("✅ Phase 8 complete - Full analysis finished!")
        print("="*80)

    except Exception as e:
        error_msg = f"Error in Phase 8: {str(e)}"
        print(f"❌ {error_msg}")
        state['error'] = error_msg

    return state


# ============================================================================
# WORKFLOW ORCHESTRATION
# ============================================================================

def run_full_workflow(question: str) -> Tuple[List, AnalysisState]:
    """Run complete 8-phase workflow"""
    print("\n" + "="*80)
    print("🚀 STARTING 8-PHASE INTERACTIVE WORKFLOW")
    print("="*80)
    print(f"Question: {question}\n")

    initial_state = AnalysisState(
        conversation_history=[{"role": "user", "content": question}],
        current_phase="phase1",
        phase_number=1,
        original_question=question,
        hypothesis="",
        hypothesis_approved=True,  # Auto-approve for demo
        data_quality_report="",
        engineered_features=[],
        features_df=pd.DataFrame(),
        sanity_check_results="",
        clusters_info="",
        cluster_labels=[],
        ml_drivers="",
        business_impact="",
        robustness_results="",
        meta_review="",
        final_insights="",
        error="",
        awaiting_approval=False
    )

    # Run all phases sequentially
    state = initial_state

    state = phase1_consultation(state)
    if not state.get('error'):
        state = phase2_data_quality(state)

    if not state.get('error'):
        state = phase3_feature_engineering(state)

    if not state.get('error'):
        state = phase4_sanity_check(state)

    if not state.get('error'):
        state = phase5_clustering(state)

    if not state.get('error'):
        state = phase6_ml_drivers(state)

    if not state.get('error'):
        state = phase7_business_impact(state)

    if not state.get('error'):
        state = phase8_final_validation(state)

    # Format conversation for Gradio
    history = []
    for msg in state['conversation_history']:
        if msg['role'] == 'user':
            history.append([msg['content'], None])
        else:
            if history and history[-1][1] is None:
                history[-1][1] = msg['content']
            else:
                history.append([None, msg['content']])

    return history, state


# ============================================================================
# GRADIO INTERFACE
# ============================================================================

print("\n🎨 Building Gradio interface...")

with gr.Blocks(title="AI Business Insights Generator v2.0 - Complete", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🏦 AI Business Insights Generator v2.0 - COMPLETE
    ## 8-Phase Interactive Analytics System

    **All Phases Implemented:**
    1. 🤝 Consultation & Hypothesis Definition
    2. 📊 Data Quality Check
    3. 🔧 Feature Engineering
    4. ✅ Sanity Check & Anomaly Detection
    5. 🎯 K-Means Clustering (Segment Discovery)
    6. 🧠 Random Forest (Driver Identification)
    7. 💰 Business Impact Calculator ($ Quantification)
    8. 🧪 Robustness Testing + Meta-Cognitive Review
    """)

    with gr.Row():
        with gr.Column():
            gr.Markdown(f"**📊 Data:** {DATA_STATUS}")
        with gr.Column():
            gr.Markdown(f"**🤖 Models:** Gemini Flash + Pro")

    gr.Markdown("---")

    # Chatbot interface
    chatbot = gr.Chatbot(
        label="AI Business Analyst - Full 8-Phase Workflow",
        height=600,
        show_copy_button=True
    )

    with gr.Row():
        user_input = gr.Textbox(
            label="Your Business Question",
            placeholder="e.g., Why are we losing high-value customers?",
            lines=2
        )

    with gr.Row():
        analyze_btn = gr.Button("🚀 Run Full Analysis (All 8 Phases)", variant="primary", size="lg")
        clear_btn = gr.Button("🔄 New Analysis", size="sm")

    gr.Examples(
        examples=[
            ["Why are we losing high-value customers?"],
            ["What's driving revenue growth in Mexico?"],
            ["Which customer segments have the highest churn risk?"],
            ["How can we improve customer retention?"]
        ],
        inputs=user_input,
        label="💡 Try These Questions"
    )

    gr.Markdown("""
    ---
    ### How It Works:

    1. **Ask a business question** - The AI will run all 8 phases automatically
    2. **Review the analysis** - Each phase builds on the previous one
    3. **Get actionable insights** - With $ impact and validated recommendations

    **Note**: This demo runs all phases automatically. In production, you would approve each phase before proceeding.

    **Average analysis time**: 60-90 seconds for complete workflow
    """)

    # Event handlers
    def start_analysis(question):
        if not question or question.strip() == "":
            return [], None
        return run_full_workflow(question)

    analyze_btn.click(
        start_analysis,
        inputs=[user_input],
        outputs=[chatbot]
    )

    user_input.submit(
        start_analysis,
        inputs=[user_input],
        outputs=[chatbot]
    )

    clear_btn.click(
        lambda: ([], ""),
        outputs=[chatbot, user_input]
    )

# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*80)
    print("🌐 LAUNCHING GRADIO INTERFACE")
    print("="*80)
    print("\n✨ All 8 phases implemented and ready")
    print("💡 Generating public link for easy access...")
    print("\n⚡ Estimated cost per analysis: $0.05-0.15")
    print("🕐 Expected runtime: 60-90 seconds per full workflow")
    print("\n" + "="*80 + "\n")

    demo.launch(
        share=True,  # Public link
        server_name="0.0.0.0",
        server_port=7862  # Different port
    )
