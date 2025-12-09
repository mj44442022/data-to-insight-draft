# ============================================================================
# AI BUSINESS INSIGHTS GENERATOR - SIMPLIFIED MVP
# Vector Institute Agent Bootcamp
# ============================================================================
# SIMPLIFIED 4-PHASE WORKFLOW:
# 1. Smart Intake - Asks only necessary questions if info missing
# 2. Data Agent - Consolidated data quality, feature engineering, sanity checks
# 3. Analysis - Simplified clustering + ML drivers identification
# 4. Evaluation - LLM-as-judge validation
# ============================================================================

import sys
import os
from pathlib import Path

print("\n" + "="*80)
print("🚀 AI BUSINESS INSIGHTS GENERATOR - SIMPLIFIED MVP")
print("="*80)
print("\n📋 Loading modules...")

# Dependency checking
def check_dependencies():
    """Check for required dependencies"""
    missing_deps = []

    try:
        import pandas, numpy, sklearn
        print("✅ Data science libraries")
    except ImportError:
        missing_deps.append("pandas/numpy/scikit-learn")

    try:
        from langchain_core.messages import HumanMessage
        print("✅ LangChain core")
    except ImportError:
        missing_deps.append("langchain-core")

    try:
        from langchain_openai import ChatOpenAI
        print("✅ LangChain OpenAI")
    except ImportError:
        missing_deps.append("langchain-openai")

    try:
        import gradio
        print("✅ Gradio")
    except ImportError:
        missing_deps.append("gradio")

    if missing_deps:
        print("\n❌ MISSING DEPENDENCIES:")
        for dep in missing_deps:
            print(f"  • {dep}")
        print("\n📦 Install with: pip install -r requirements_mvp.txt")
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
from datetime import datetime
from typing import TypedDict, List, Dict, Any
import gradio as gr
import requests

# ML and Analytics
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

# LangChain with OpenAI-compatible interface (for Gemini)
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

# ============================================================================
# CONFIGURATION
# ============================================================================
load_dotenv()

# Use OpenAI-compatible endpoint for Gemini
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")

if not OPENAI_API_KEY:
    print("❌ ERROR: OPENAI_API_KEY not found in environment")
    print("Set OPENAI_API_KEY in your .env file (can be Gemini API key)")
    sys.exit(1)

print(f"✅ Using API endpoint: {OPENAI_BASE_URL}")

# Initialize LLMs with strategic model selection
# Using OpenAI-compatible interface with Gemini models
# Note: Use full model names for Gemini's OpenAI endpoint
llm_flash = ChatOpenAI(
    model="gemini-1.5-flash-latest",
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_BASE_URL,
    temperature=0
)

llm_pro = ChatOpenAI(
    model="gemini-1.5-pro-latest",
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_BASE_URL,
    temperature=0
)

print("✅ LLMs initialized (Gemini Flash + Pro via OpenAI-compatible interface)")
print(f"   Flash model: gemini-1.5-flash-latest")
print(f"   Pro model: gemini-1.5-pro-latest")

# ============================================================================
# DATA LOADING
# ============================================================================
def load_banking_data() -> tuple[pd.DataFrame, str]:
    """
    Load banking data with priority:
    1. Local file: banking_data_final_complete_flags.csv
    2. HuggingFace datasets package
    3. HuggingFace URL (direct download)
    4. ERROR - stop execution
    """
    print("\n" + "="*80)
    print("📊 LOADING BANKING DATA")
    print("="*80)

    # Priority 1: Local file
    local_path = Path(__file__).parent / "banking_data_final_complete_flags.csv"
    if local_path.exists():
        print(f"✅ Found local file: {local_path}")
        df = pd.read_csv(local_path)
        source = f"Local file: {local_path}"
        print(f"   Loaded {len(df)} rows, {len(df.columns)} columns")
        return df, source

    print(f"⚠️ Local file not found, trying HuggingFace...")
    print(f"   Looking for: {local_path.name}")

    # Priority 2: HuggingFace datasets package (most robust)
    try:
        from datasets import load_dataset
        print("   Trying HuggingFace datasets package...")
        print(f"   Dataset: mj44442022/dataset_synthetic_v2")
        print(f"   File: banking_data_final_complete_flags(1).csv")

        dataset = load_dataset(
            "mj44442022/dataset_synthetic_v2",
            data_files="banking_data_final_complete_flags(1).csv"
        )
        df = dataset['train'].to_pandas()
        source = "HuggingFace datasets: mj44442022/dataset_synthetic_v2"

        print("\n" + "="*80)
        print("✅ DATA SUCCESSFULLY LOADED FROM HUGGINGFACE DATASETS PACKAGE")
        print("="*80)
        print(f"   Source: HuggingFace datasets API")
        print(f"   Dataset: mj44442022/dataset_synthetic_v2")
        print(f"   File: banking_data_final_complete_flags(1).csv")
        print(f"   Rows: {len(df):,}")
        print(f"   Columns: {len(df.columns)}")
        print(f"   Column names: {', '.join(df.columns[:10].tolist())}...")
        print("="*80 + "\n")
        return df, source

    except ImportError:
        print("   ⚠️ datasets package not installed, trying direct URL...")
    except Exception as e:
        print(f"   ⚠️ HuggingFace datasets failed ({str(e)}), trying direct URL...")

    # Priority 3: HuggingFace URL (direct download fallback)
    hf_url = "https://huggingface.co/datasets/mj44442022/dataset_synthetic_v2/resolve/main/banking_data_final_complete_flags(1).csv"
    print(f"   Trying direct URL: {hf_url}")

    try:
        response = requests.get(hf_url, timeout=30)
        response.raise_for_status()

        # Save to temp file and load
        temp_path = Path(__file__).parent / "temp_banking_data.csv"
        with open(temp_path, 'wb') as f:
            f.write(response.content)

        df = pd.read_csv(temp_path)
        source = f"HuggingFace URL: {hf_url}"
        print(f"✅ Loaded from HuggingFace URL: {len(df)} rows, {len(df.columns)} columns")
        return df, source

    except Exception as e:
        print(f"\n❌ ERROR: Failed to load data from all sources")
        print(f"   1. Local path: {local_path} (not found)")
        print(f"   2. HuggingFace datasets package: Failed or not installed")
        print(f"   3. HuggingFace URL: {hf_url} (Error: {str(e)})")
        print("\n🛑 STOPPING EXECUTION - Cannot proceed without data")
        print("\n💡 Try installing datasets: pip install datasets")
        sys.exit(1)

# ============================================================================
# STATE MANAGEMENT
# ============================================================================
class AnalysisState(TypedDict):
    """State for the analysis workflow"""
    user_input: str
    hypothesis: str
    metrics_of_interest: List[str]
    data: pd.DataFrame
    data_source: str
    data_quality_report: str
    engineered_features: List[str]
    clusters: Dict[str, Any]
    ml_insights: Dict[str, Any]
    final_insights: str
    evaluation_score: str
    messages: List[str]
    needs_user_input: bool
    phase_complete: int

# ============================================================================
# PHASE 1: SMART INTAKE
# ============================================================================
def phase1_smart_intake(state: AnalysisState) -> AnalysisState:
    """
    Smart intake: Asks only necessary questions if information is missing.
    Uses Gemini Pro for intelligent information extraction.
    """
    print("\n" + "="*80)
    print("📋 PHASE 1: SMART INTAKE")
    print("Model: Gemini Pro")
    print("="*80)

    user_input = state['user_input']
    print(f"User input: {user_input[:100]}...")

    # Extract information from user input
    extraction_prompt = f"""Analyze this user request and extract key information:

USER REQUEST: {user_input}

Extract the following and return as JSON:
{{
  "hypothesis": "The main hypothesis or question (if clearly stated, otherwise null)",
  "metrics": ["list", "of", "metrics", "mentioned"],
  "has_sufficient_info": true/false,
  "missing_info": ["what additional info is needed"],
  "business_context": "brief summary of business context"
}}

Rules:
- Only mark has_sufficient_info as true if we have a clear hypothesis/question and relevant metrics
- Be specific about what's missing
- Don't invent information not in the request
"""

    response = llm_pro.invoke([HumanMessage(content=extraction_prompt)])

    try:
        # Parse JSON response
        json_str = response.content
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0].strip()
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0].strip()

        extracted = json.loads(json_str)
        print(f"\n✅ Extracted information:")
        print(f"   Has sufficient info: {extracted['has_sufficient_info']}")
        print(f"   Hypothesis: {extracted.get('hypothesis', 'Not specified')}")
        print(f"   Metrics: {extracted.get('metrics', [])}")

        if extracted['has_sufficient_info']:
            # We have enough information to proceed
            state['hypothesis'] = extracted['hypothesis'] or "Explore key business patterns in the data"
            state['metrics_of_interest'] = extracted['metrics'] or ["revenue", "churn", "engagement"]
            state['needs_user_input'] = False
            state['messages'].append("✅ Sufficient information provided. Proceeding with analysis...")

        else:
            # Need to ask for more information
            missing = extracted.get('missing_info', [])
            question = f"""📋 To provide accurate insights, I need some additional information:

"""
            for i, item in enumerate(missing, 1):
                question += f"{i}. {item}\n"

            question += "\nPlease provide these details so I can proceed with the analysis."

            state['needs_user_input'] = True
            state['messages'].append(question)
            return state

    except Exception as e:
        print(f"⚠️ Error parsing extraction: {e}")
        # Default: assume we need user input
        state['needs_user_input'] = True
        state['messages'].append("Could you clarify: What specific business question or hypothesis would you like to investigate?")
        return state

    state['phase_complete'] = 1
    return state

# ============================================================================
# PHASE 2: DATA AGENT (Consolidated: Quality + Features + Sanity)
# ============================================================================
def phase2_data_agent(state: AnalysisState) -> AnalysisState:
    """
    Consolidated Data Agent: Handles data quality, feature engineering, and sanity checks.
    Uses Gemini Flash for efficiency.
    """
    print("\n" + "="*80)
    print("📊 PHASE 2: DATA AGENT")
    print("Model: Gemini Flash")
    print("="*80)

    df = state['data']
    print(f"Dataset: {len(df)} rows, {len(df.columns)} columns")

    # === DATA QUALITY CHECK ===
    print("\n🔍 Checking data quality...")

    quality_issues = []

    # Check for nulls
    null_counts = df.isnull().sum()
    null_pcts = (null_counts / len(df)) * 100
    high_null_cols = null_pcts[null_pcts > 5].to_dict()

    if high_null_cols:
        quality_issues.append(f"High null values: {high_null_cols}")
        print(f"   ⚠️ High nulls: {list(high_null_cols.keys())}")
    else:
        print("   ✅ No significant null values")

    # Check for outliers in numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    outlier_cols = []

    for col in numeric_cols:
        z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
        outlier_pct = (z_scores > 3).sum() / len(df) * 100
        if outlier_pct > 5:
            outlier_cols.append(col)

    if outlier_cols:
        quality_issues.append(f"Outliers detected in: {outlier_cols}")
        print(f"   ⚠️ Outliers in: {outlier_cols}")
    else:
        print("   ✅ No significant outliers")

    # === FEATURE ENGINEERING ===
    print("\n🔧 Engineering features...")

    engineered_features = []

    # Check for date columns
    date_cols = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
    if date_cols:
        print(f"   Found date columns: {date_cols}")
        # Convert to datetime if needed
        for col in date_cols:
            if df[col].dtype == 'object':
                try:
                    df[col] = pd.to_datetime(df[col])
                    print(f"   ✅ Converted {col} to datetime")
                except:
                    pass

    # Create simple derived features
    if 'revenue' in df.columns and 'customers' in df.columns:
        df['revenue_per_customer'] = df['revenue'] / df['customers'].replace(0, 1)
        engineered_features.append('revenue_per_customer')
        print("   ✅ Created: revenue_per_customer")

    if 'churn' in df.columns:
        df['churn_rate'] = df['churn'] * 100
        engineered_features.append('churn_rate')
        print("   ✅ Created: churn_rate")

    # === SANITY CHECK ===
    print("\n✅ Running sanity checks...")

    sanity_issues = []

    # Check for unrealistic values
    for col in numeric_cols:
        if col in df.columns:
            if (df[col] < 0).any() and col not in ['profit', 'margin', 'growth']:
                sanity_issues.append(f"Negative values in {col}")
                print(f"   ⚠️ Negative values in {col}")

    # Generate summary report
    quality_report = f"""DATA AGENT REPORT:

Data Quality:
- Rows: {len(df)}, Columns: {len(df.columns)}
- Issues: {len(quality_issues)} ({', '.join(quality_issues) if quality_issues else 'None'})

Feature Engineering:
- Created {len(engineered_features)} new features: {', '.join(engineered_features) if engineered_features else 'None'}

Sanity Checks:
- Issues: {len(sanity_issues)} ({', '.join(sanity_issues) if sanity_issues else 'None'})

Status: {'⚠️ PROCEED WITH CAUTION' if quality_issues or sanity_issues else '✅ DATA READY FOR ANALYSIS'}
"""

    print("\n" + quality_report)

    state['data'] = df
    state['data_quality_report'] = quality_report
    state['engineered_features'] = engineered_features
    state['phase_complete'] = 2

    return state

# ============================================================================
# PHASE 3: SIMPLIFIED ANALYSIS (Clustering + ML Drivers)
# ============================================================================
def phase3_analysis(state: AnalysisState) -> AnalysisState:
    """
    Simplified analysis: K-Means clustering + Random Forest for drivers.
    Uses Python where sufficient, Gemini Pro only for interpretation.
    """
    print("\n" + "="*80)
    print("🔬 PHASE 3: ANALYSIS")
    print("Model: Python ML + Gemini Pro (interpretation only)")
    print("="*80)

    df = state['data']

    # === CLUSTERING ===
    print("\n📊 K-Means Clustering...")

    # Select numeric features for clustering
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    # Remove ID columns and target variables
    feature_cols = [col for col in numeric_cols if 'id' not in col.lower() and 'churn' not in col.lower()]

    if len(feature_cols) < 2:
        print("   ⚠️ Not enough features for clustering")
        state['clusters'] = {"error": "Insufficient numeric features"}
    else:
        # Prepare data
        X = df[feature_cols].fillna(df[feature_cols].mean())
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # K-Means with k=3
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        df['cluster'] = kmeans.fit_predict(X_scaled)

        # Analyze clusters
        cluster_stats = {}
        for i in range(3):
            cluster_data = df[df['cluster'] == i]
            cluster_stats[f"Cluster_{i}"] = {
                "size": len(cluster_data),
                "percentage": f"{len(cluster_data)/len(df)*100:.1f}%"
            }
            print(f"   Cluster {i}: {len(cluster_data)} customers ({cluster_stats[f'Cluster_{i}']['percentage']})")

        state['clusters'] = cluster_stats

    # === ML DRIVERS ===
    print("\n🤖 Random Forest for Drivers...")

    # Check if we have a target variable
    target_col = None
    for col in ['churn', 'churned', 'is_churn']:
        if col in df.columns:
            target_col = col
            break

    if target_col is None:
        print("   ⚠️ No churn target variable found")
        state['ml_insights'] = {"error": "No target variable for prediction"}
    else:
        # Prepare features
        feature_cols_ml = [col for col in numeric_cols if col != target_col and 'id' not in col.lower()]

        if len(feature_cols_ml) < 2:
            print("   ⚠️ Not enough features for ML")
            state['ml_insights'] = {"error": "Insufficient features"}
        else:
            X = df[feature_cols_ml].fillna(df[feature_cols_ml].mean())
            y = df[target_col]

            # Random Forest
            rf = RandomForestClassifier(n_estimators=50, random_state=42, max_depth=5)
            rf.fit(X, y)

            # Feature importance
            importances = pd.DataFrame({
                'feature': feature_cols_ml,
                'importance': rf.feature_importances_
            }).sort_values('importance', ascending=False).head(5)

            print("\n   Top 5 drivers:")
            for _, row in importances.iterrows():
                print(f"   - {row['feature']}: {row['importance']:.3f}")

            state['ml_insights'] = {
                "top_drivers": importances.to_dict('records'),
                "model_type": "RandomForest"
            }

    state['data'] = df
    state['phase_complete'] = 3

    return state

# ============================================================================
# PHASE 4: LLM-AS-JUDGE EVALUATION
# ============================================================================
def phase4_evaluation(state: AnalysisState) -> AnalysisState:
    """
    LLM-as-judge evaluation: Self-critique and quality assessment.
    Uses Gemini Pro for meta-cognitive review.
    """
    print("\n" + "="*80)
    print("⚖️ PHASE 4: LLM-AS-JUDGE EVALUATION")
    print("Model: Gemini Pro")
    print("="*80)

    # Compile analysis summary
    analysis_summary = f"""ANALYSIS SUMMARY:

Hypothesis: {state['hypothesis']}
Metrics of Interest: {', '.join(state['metrics_of_interest'])}

Data Quality Report:
{state['data_quality_report']}

Clustering Results:
{json.dumps(state['clusters'], indent=2)}

ML Insights:
{json.dumps(state['ml_insights'], indent=2)}
"""

    # LLM-as-judge prompt
    judge_prompt = f"""You are an expert data science judge evaluating the quality of a business insights analysis.

{analysis_summary}

Evaluate this analysis on the following criteria (score each 1-10):

1. **Data Quality**: Are data quality checks adequate? Are issues properly identified?
2. **Methodology**: Are the analytical methods (clustering, ML) appropriate for the hypothesis?
3. **Insights Quality**: Are the findings clear, actionable, and relevant to the business question?
4. **Completeness**: Does the analysis address the original hypothesis?
5. **Robustness**: Are the results reliable and well-supported by data?

Return your evaluation as JSON:
{{
  "data_quality_score": 1-10,
  "methodology_score": 1-10,
  "insights_quality_score": 1-10,
  "completeness_score": 1-10,
  "robustness_score": 1-10,
  "overall_score": 1-10,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}}

Be objective and constructive. Focus on analytical rigor.
"""

    print("\n🔍 Running LLM-as-judge evaluation...")

    response = llm_pro.invoke([HumanMessage(content=judge_prompt)])

    try:
        # Parse JSON response
        json_str = response.content
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0].strip()
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0].strip()

        evaluation = json.loads(json_str)

        print(f"\n✅ EVALUATION SCORES:")
        print(f"   Overall: {evaluation['overall_score']}/10")
        print(f"   Data Quality: {evaluation['data_quality_score']}/10")
        print(f"   Methodology: {evaluation['methodology_score']}/10")
        print(f"   Insights Quality: {evaluation['insights_quality_score']}/10")
        print(f"   Completeness: {evaluation['completeness_score']}/10")
        print(f"   Robustness: {evaluation['robustness_score']}/10")

        print(f"\n💪 Strengths:")
        for s in evaluation.get('strengths', []):
            print(f"   - {s}")

        print(f"\n⚠️ Weaknesses:")
        for w in evaluation.get('weaknesses', []):
            print(f"   - {w}")

        print(f"\n💡 Recommendations:")
        for r in evaluation.get('recommendations', []):
            print(f"   - {r}")

        state['evaluation_score'] = evaluation

    except Exception as e:
        print(f"⚠️ Error parsing evaluation: {e}")
        state['evaluation_score'] = {"error": str(e), "overall_score": "N/A"}

    state['phase_complete'] = 4

    return state

# ============================================================================
# FINAL INSIGHTS GENERATION
# ============================================================================
def generate_final_insights(state: AnalysisState) -> AnalysisState:
    """
    Generate executive summary of insights.
    Uses Gemini Pro for high-quality synthesis.
    """
    print("\n" + "="*80)
    print("📝 GENERATING FINAL INSIGHTS")
    print("Model: Gemini Pro")
    print("="*80)

    # Compile all findings
    findings = f"""BUSINESS INSIGHTS ANALYSIS

Hypothesis: {state['hypothesis']}

Data Overview:
{state['data_quality_report']}

Clustering Insights:
{json.dumps(state['clusters'], indent=2)}

Key Drivers:
{json.dumps(state['ml_insights'], indent=2)}

Quality Evaluation:
Overall Score: {state['evaluation_score'].get('overall_score', 'N/A')}/10
"""

    synthesis_prompt = f"""Based on this analysis, generate a concise executive summary (≤200 words):

{findings}

The summary should:
1. State the key finding (1-2 sentences)
2. Highlight the most important patterns discovered
3. Provide actionable recommendations
4. Be clear, specific, and business-focused

Format as markdown with clear sections.
"""

    response = llm_pro.invoke([HumanMessage(content=synthesis_prompt)])

    final_insights = response.content

    print("\n" + "="*80)
    print("📊 FINAL INSIGHTS:")
    print("="*80)
    print(final_insights)

    state['final_insights'] = final_insights
    state['messages'].append(final_insights)

    return state

# ============================================================================
# WORKFLOW ORCHESTRATION
# ============================================================================
def run_analysis(user_input: str) -> str:
    """
    Main analysis workflow
    """
    print("\n" + "="*80)
    print("🚀 STARTING ANALYSIS WORKFLOW")
    print("="*80)

    # Load data
    df, data_source = load_banking_data()

    # Initialize state
    state: AnalysisState = {
        'user_input': user_input,
        'hypothesis': '',
        'metrics_of_interest': [],
        'data': df,
        'data_source': data_source,
        'data_quality_report': '',
        'engineered_features': [],
        'clusters': {},
        'ml_insights': {},
        'final_insights': '',
        'evaluation_score': {},
        'messages': [],
        'needs_user_input': False,
        'phase_complete': 0
    }

    # Phase 1: Smart Intake
    state = phase1_smart_intake(state)

    if state['needs_user_input']:
        return state['messages'][-1]

    # Phase 2: Data Agent
    state = phase2_data_agent(state)

    # Phase 3: Analysis
    state = phase3_analysis(state)

    # Phase 4: Evaluation
    state = phase4_evaluation(state)

    # Generate final insights
    state = generate_final_insights(state)

    return state['final_insights']

# ============================================================================
# GRADIO INTERFACE
# ============================================================================
def chatbot_interface(message, history):
    """Gradio chatbot interface"""
    try:
        response = run_analysis(message)
        return response
    except Exception as e:
        # Print full error to console for debugging
        print("\n" + "="*80)
        print("❌ ERROR IN ANALYSIS WORKFLOW")
        print("="*80)
        print(f"User message: {message}")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")

        # Print full traceback for debugging
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()
        print("="*80 + "\n")

        return f"❌ Error: {str(e)}\n\nFull error details have been logged to the console."

# Create Gradio interface
demo = gr.ChatInterface(
    fn=chatbot_interface,
    title="🏦 AI Business Insights Generator - Simplified MVP",
    description="""
    **Simplified 4-phase analytics system for business insights**

    1️⃣ Smart Intake - Asks only what's needed
    2️⃣ Data Agent - Quality + Features + Sanity checks
    3️⃣ Analysis - Clustering + ML drivers
    4️⃣ Evaluation - LLM-as-judge quality check

    **Example questions:**
    - "Why are high-value customers churning?"
    - "What drives revenue growth in different customer segments?"
    - "Analyze patterns in customer engagement and retention"
    """,
    examples=[
        "Why are our high-value customers churning?",
        "What are the key drivers of revenue growth?",
        "Analyze customer segmentation patterns"
    ],
    theme=gr.themes.Soft()
)

# ============================================================================
# SELF-TEST FUNCTION
# ============================================================================
def run_self_test():
    """Test the system before launching Gradio"""
    print("\n" + "="*80)
    print("🧪 RUNNING SELF-TEST BEFORE LAUNCH")
    print("="*80)

    # Test 1: Data loading
    print("\n1️⃣ Testing data loading...")
    try:
        test_df, test_source = load_banking_data()
        print(f"   ✅ Data loaded successfully")
        print(f"   Source: {test_source}")
    except Exception as e:
        print(f"   ❌ Data loading failed: {e}")
        return False

    # Test 2: LLM connection
    print("\n2️⃣ Testing LLM connection (Gemini Flash)...")
    try:
        test_response = llm_flash.invoke([HumanMessage(content="Say 'test successful' and nothing else.")])
        print(f"   ✅ Gemini Flash responding")
        print(f"   Response: {test_response.content[:50]}...")
    except Exception as e:
        print(f"   ❌ Gemini Flash failed: {e}")
        print("\n💡 TROUBLESHOOTING:")
        print("   - Check your OPENAI_API_KEY is a valid Gemini API key")
        print("   - Verify OPENAI_BASE_URL is correct")
        print("   - Ensure you have API quota available")
        return False

    print("\n" + "="*80)
    print("✅ SELF-TEST PASSED - All systems operational")
    print("="*80)
    return True

# ============================================================================
# MAIN EXECUTION
# ============================================================================
if __name__ == "__main__":
    print("\n" + "="*80)
    print("🚀 AI BUSINESS INSIGHTS GENERATOR - SIMPLIFIED MVP")
    print("="*80)

    # Run self-test
    if not run_self_test():
        print("\n❌ Self-test failed. Please fix errors before launching.")
        print("Exiting...")
        sys.exit(1)

    # Launch Gradio interface
    print("\n" + "="*80)
    print("🚀 LAUNCHING GRADIO INTERFACE")
    print("="*80)
    print("\n📊 Data source confirmed:")
    print("   ✅ HuggingFace datasets package (mj44442022/dataset_synthetic_v2)")
    print("\n🔗 Generating public link...")
    print("="*80 + "\n")

    demo.launch(
        share=True,  # Public link
        server_name="0.0.0.0",
        server_port=7863
    )
