# ============================================================================
# SCOTIABANK AI INSIGHTS AGENT - INTELLIGENT REASONING v5
# Vector Institute Agent Bootcamp
# ============================================================================
# ARCHITECTURE:
# Each question goes through 5 layers:
# 1. UNDERSTAND - Extract intent and relevant data
# 2. PLAN - Design analysis methodology (like senior analyst)
# 3. CODE - Generate custom Python code for analysis
# 4. EXECUTE - Run code safely and capture results
# 5. INTERPRET - Generate executive-friendly business insights
# ============================================================================

import sys
import os
from pathlib import Path
import json
import pandas as pd
import numpy as np
import gradio as gr
import requests
from dotenv import load_dotenv
from typing import Dict, Any, List
from io import StringIO
import contextlib

# LangChain
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

# ============================================================================
# CONFIGURATION
# ============================================================================
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")

if not OPENAI_API_KEY:
    print("❌ ERROR: OPENAI_API_KEY not found")
    sys.exit(1)

# Initialize LLMs
llm_flash = ChatOpenAI(
    model=os.getenv("GEMINI_FLASH_MODEL", "gemini-2.0-flash-exp"),
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_BASE_URL,
    temperature=0
)

llm_pro = ChatOpenAI(
    model=os.getenv("GEMINI_PRO_MODEL", "gemini-2.0-flash-exp"),
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_BASE_URL,
    temperature=0.2
)

print("✅ Scotiabank AI Insights Agent v5 initialized")

# ============================================================================
# DATA LOADING
# ============================================================================
DATA_CACHE = None

def load_banking_data():
    """Load data with caching"""
    global DATA_CACHE

    if DATA_CACHE is not None:
        return DATA_CACHE

    print("📊 Loading banking data...")
    hf_url = "https://huggingface.co/datasets/mj44442022/dataset_synthetic_v2/resolve/main/banking_data_final_complete_flags(1).csv"
    temp_path = Path("temp_banking_data.csv")

    try:
        if temp_path.exists():
            print("   ✅ Using cached data")
            DATA_CACHE = pd.read_csv(temp_path)
            return DATA_CACHE

        print("   ⬇️ Downloading from HuggingFace...")
        response = requests.get(hf_url, timeout=60)
        response.raise_for_status()

        with open(temp_path, 'wb') as f:
            f.write(response.content)

        DATA_CACHE = pd.read_csv(temp_path)
        print(f"   ✅ Loaded {len(DATA_CACHE):,} rows, {len(DATA_CACHE.columns)} columns")
        return DATA_CACHE

    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return pd.DataFrame()

# ============================================================================
# LAYER 1: UNDERSTAND QUESTION
# ============================================================================

def understand_question(user_question: str, df: pd.DataFrame) -> Dict[str, Any]:
    """Extract intent and identify relevant data columns"""

    print("\n" + "="*60)
    print("🧠 LAYER 1: UNDERSTANDING QUESTION")
    print("="*60)

    cols_info = {
        'numeric': df.select_dtypes(include=[np.number]).columns.tolist(),
        'boolean': [c for c in df.columns if df[c].dtype == 'bool'],
        'categorical': [c for c in df.select_dtypes(include=['object']).columns if df[c].dtype != 'bool']
    }

    prompt = f"""You are a Senior Data Analyst at Scotiabank. A business leader asked:

"{user_question}"

AVAILABLE DATA:
- Numeric metrics: {', '.join(cols_info['numeric'])}
- Boolean flags: {', '.join(cols_info['boolean'])}
- Categorical: {', '.join(cols_info['categorical'])}

TASK: Understand what they're asking for.

Return JSON:
{{
  "intent": "what they want to know (1 sentence)",
  "relevant_columns": ["list", "of", "column", "names"],
  "analysis_type": "comparison | correlation | profiling | segmentation | drivers",
  "business_context": "why this matters to executives"
}}"""

    response = llm_flash.invoke([HumanMessage(content=prompt)])
    content = response.content.replace("```json", "").replace("```", "").strip()

    try:
        understanding = json.loads(content)
        print(f"✅ Intent: {understanding['intent']}")
        print(f"✅ Relevant columns: {understanding['relevant_columns']}")
        print(f"✅ Analysis type: {understanding['analysis_type']}")
        return understanding
    except:
        return {
            "intent": user_question,
            "relevant_columns": cols_info['numeric'][:5],
            "analysis_type": "profiling",
            "business_context": "General data exploration"
        }

# ============================================================================
# LAYER 2: PLAN ANALYSIS
# ============================================================================

def plan_analysis(understanding: Dict[str, Any], df: pd.DataFrame) -> Dict[str, Any]:
    """Design the analysis methodology like a seasoned analyst would"""

    print("\n" + "="*60)
    print("📋 LAYER 2: PLANNING ANALYSIS")
    print("="*60)

    prompt = f"""You are a Senior Data Analyst with 15 years at Scotiabank. Design the analysis approach.

QUESTION INTENT: {understanding['intent']}
ANALYSIS TYPE: {understanding['analysis_type']}
RELEVANT COLUMNS: {understanding['relevant_columns']}
BUSINESS CONTEXT: {understanding['business_context']}

DATASET: {len(df):,} rows

TASK: Design a clear, methodical analysis plan.

Return JSON:
{{
  "approach": "2-3 sentence methodology description",
  "steps": [
    "Step 1: Specific action",
    "Step 2: Specific action",
    "Step 3: Specific action"
  ],
  "expected_insights": "What we expect to learn",
  "pandas_operations": ["groupby", "pivot", "corr", etc]
}}

Think like an experienced analyst. Be specific and methodical."""

    response = llm_pro.invoke([HumanMessage(content=prompt)])
    content = response.content.replace("```json", "").replace("```", "").strip()

    try:
        plan = json.loads(content)
        print(f"✅ Approach: {plan['approach']}")
        print(f"✅ Steps: {len(plan['steps'])} planned")
        return plan
    except Exception as e:
        print(f"⚠️ Planning error: {e}")
        return {
            "approach": "Standard profiling analysis",
            "steps": ["Calculate summary statistics", "Group by key dimensions"],
            "expected_insights": "Key patterns in the data",
            "pandas_operations": ["describe", "groupby"]
        }

# ============================================================================
# LAYER 3: GENERATE CODE
# ============================================================================

def generate_analysis_code(understanding: Dict[str, Any], plan: Dict[str, Any], df: pd.DataFrame) -> str:
    """Generate custom Python code for this specific analysis"""

    print("\n" + "="*60)
    print("💻 LAYER 3: GENERATING CODE")
    print("="*60)

    # Get sample of data for context
    sample_data = df[understanding['relevant_columns'][:10]].head(3).to_string()

    prompt = f"""You are a Senior Python Data Analyst. Write code for this analysis.

ANALYSIS PLAN:
{plan['approach']}

STEPS:
{chr(10).join(f"{i+1}. {step}" for i, step in enumerate(plan['steps']))}

RELEVANT COLUMNS: {understanding['relevant_columns']}

DATA SAMPLE:
{sample_data}

REQUIREMENTS:
- Write Python code that works with pandas DataFrame named 'df'
- Store final results in a variable named 'results' (dict or DataFrame)
- Use proper groupby for multi-dimensional analysis
- Include only the TOP insights (max 5-10 rows)
- NO plotting, NO print statements
- Handle any potential errors

EXAMPLE for "revenue by country and mortgage":
```python
results = df.groupby(['country_name', 'has_open_mortgage'])['total_revenues'].agg([
    ('avg_revenue', 'mean'),
    ('count', 'count')
]).round(2).reset_index()
results = results.sort_values('avg_revenue', ascending=False)
```

Return ONLY executable Python code, no explanations."""

    response = llm_pro.invoke([HumanMessage(content=prompt)])
    code = response.content

    # Extract code from markdown if present
    if "```python" in code:
        code = code.split("```python")[1].split("```")[0].strip()
    elif "```" in code:
        code = code.split("```")[1].split("```")[0].strip()

    print(f"✅ Generated {len(code)} characters of code")
    print(f"Preview:\n{code[:200]}...")

    return code

# ============================================================================
# LAYER 4: EXECUTE CODE
# ============================================================================

def execute_analysis_code(code: str, df: pd.DataFrame) -> Dict[str, Any]:
    """Safely execute the generated code"""

    print("\n" + "="*60)
    print("⚡ LAYER 4: EXECUTING CODE")
    print("="*60)

    # Create safe execution environment
    exec_globals = {
        'pd': pd,
        'np': np,
        'df': df,
        'results': None
    }

    try:
        # Execute code
        exec(code, exec_globals)
        results = exec_globals.get('results')

        if results is None:
            return {"error": "Code didn't produce 'results' variable"}

        # Convert results to serializable format
        if isinstance(results, pd.DataFrame):
            results_dict = {
                "type": "dataframe",
                "data": results.to_dict('records'),
                "columns": results.columns.tolist(),
                "shape": results.shape,
                "preview": results.head(10).to_string()
            }
        elif isinstance(results, dict):
            results_dict = {
                "type": "dict",
                "data": results,
                "preview": str(results)
            }
        else:
            results_dict = {
                "type": "other",
                "data": str(results),
                "preview": str(results)
            }

        print(f"✅ Execution successful")
        print(f"Results type: {results_dict['type']}")
        print(f"Preview:\n{results_dict['preview'][:300]}...")

        return results_dict

    except Exception as e:
        print(f"❌ Execution error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "traceback": traceback.format_exc()}

# ============================================================================
# LAYER 5: INTERPRET & FORMAT INSIGHTS
# ============================================================================

def generate_insights(understanding: Dict[str, Any], plan: Dict[str, Any],
                     execution_results: Dict[str, Any], user_question: str) -> str:
    """Generate executive-friendly business insights"""

    print("\n" + "="*60)
    print("📊 LAYER 5: GENERATING INSIGHTS")
    print("="*60)

    if "error" in execution_results:
        return f"⚠️ I encountered an issue analyzing that: {execution_results['error']}\n\nCould you rephrase your question?"

    results_preview = execution_results.get('preview', '')

    prompt = f"""You are presenting insights to busy Scotiabank executives.

EXECUTIVE QUESTION: "{user_question}"

ANALYSIS CONDUCTED:
{plan['approach']}

RESULTS:
{results_preview}

TASK: Present clear, actionable insights in executive-friendly format.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

### Key Findings

[2-3 bullet points with insights and numbers]
- **Insight 1**: Specific finding with key numbers
- **Insight 2**: Specific finding with key numbers
- **Insight 3**: Specific finding with key numbers

### Supporting Data

[Clean table or list of relevant numbers]

### Business Implication

[1-2 sentences on what this means for the business]

RULES:
- Use markdown formatting (**, ###, -)
- Include specific numbers from results
- Focus on INSIGHTS not raw data
- Write for executives (clear, brief, actionable)
- NO code, NO technical jargon
- If comparing groups, highlight the DIFFERENCE
- Use $ for money, % for percentages, K for thousands

Example BAD: "total_revenues: 230.66"
Example GOOD: "**Non-payroll clients generate $231 avg revenue** (8% higher than payroll clients at $212)"
"""

    response = llm_pro.invoke([HumanMessage(content=prompt)])
    insights = response.content

    print(f"✅ Generated {len(insights)} characters of insights")

    return insights

# ============================================================================
# MAIN CONVERSATIONAL AGENT
# ============================================================================

CONVERSATION_HISTORY = []
MAX_HISTORY = 8

def conversational_agent(user_input: str, history):
    """Main agent with 5-layer intelligent reasoning"""
    global CONVERSATION_HISTORY

    # Load data
    df = load_banking_data()
    if df.empty:
        yield "❌ Error: Could not load data"
        return

    # Memory management
    if len(CONVERSATION_HISTORY) >= MAX_HISTORY:
        summary = f"📝 **Memory limit reached.** Starting fresh conversation."
        CONVERSATION_HISTORY = []
        yield summary

    try:
        # Layer 1: Understand
        understanding = understand_question(user_input, df)

        # Layer 2: Plan
        plan = plan_analysis(understanding, df)

        # Layer 3: Generate code
        code = generate_analysis_code(understanding, plan, df)

        # Layer 4: Execute
        execution_results = execute_analysis_code(code, df)

        # Layer 5: Interpret & Present
        insights = generate_insights(understanding, plan, execution_results, user_input)

        # Store in history
        CONVERSATION_HISTORY.append({
            "user": user_input,
            "agent": insights
        })

        yield insights

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        yield f"⚠️ I encountered an unexpected error. Please try rephrasing your question.\n\nError details logged to console."

# ============================================================================
# GRADIO INTERFACE
# ============================================================================

demo = gr.ChatInterface(
    fn=conversational_agent,
    title="🏦 Scotiabank AI Insights Agent v5 - Intelligent Reasoning",
    description="""
    **5-Layer Intelligent Analysis**

    Each question goes through:
    1. 🧠 Understanding - What are you asking?
    2. 📋 Planning - Design the methodology
    3. 💻 Coding - Generate custom analysis
    4. ⚡ Execution - Run the analysis
    5. 📊 Insights - Executive-friendly results

    **Try asking:**
    - "What data is available?"
    - "How do clients with payroll compare to those without?"
    - "Does mortgage ownership affect revenue by country?"
    """,
    examples=[
        "What information is available?",
        "Compare clients with payroll vs without payroll",
        "How does mortgage ownership affect revenue by country?",
        "Show me correlation between revenue and loans"
    ],
    type="messages"
)

# ============================================================================
# SELF-TEST
# ============================================================================

def run_self_test():
    """Test the system before launching"""
    print("\n" + "="*80)
    print("🧪 RUNNING SELF-TEST")
    print("="*80)

    test_questions = [
        "What information is available?",
        "How does mortgage ownership affect revenue by country?"
    ]

    df = load_banking_data()
    if df.empty:
        print("❌ SELF-TEST FAILED: Could not load data")
        return False

    for i, question in enumerate(test_questions, 1):
        print(f"\n--- Test {i}/{len(test_questions)} ---")
        print(f"Question: {question}")

        try:
            # Test each layer
            understanding = understand_question(question, df)
            plan = plan_analysis(understanding, df)
            code = generate_analysis_code(understanding, plan, df)
            results = execute_analysis_code(code, df)
            insights = generate_insights(understanding, plan, results, question)

            if "error" in results or len(insights) < 50:
                print(f"❌ Test {i} FAILED")
                return False

            print(f"✅ Test {i} PASSED")
            print(f"Insight preview: {insights[:150]}...")

        except Exception as e:
            print(f"❌ Test {i} FAILED: {e}")
            return False

    print("\n" + "="*80)
    print("✅ ALL SELF-TESTS PASSED")
    print("="*80)
    return True

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    print("🚀 Scotiabank AI Insights Agent v5")
    print("   5-layer intelligent reasoning system")
    print("   Designed for executive-level business insights\n")

    # Run self-test
    if run_self_test():
        print("\n🌐 Launching Gradio interface...")
        demo.launch(server_name="0.0.0.0", server_port=7865, share=True)
    else:
        print("\n❌ Self-test failed. Fix issues before launching.")
        sys.exit(1)
