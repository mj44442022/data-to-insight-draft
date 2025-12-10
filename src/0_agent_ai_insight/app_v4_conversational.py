# ============================================================================
# SCOTIABANK AI INSIGHTS AGENT - CONVERSATIONAL V4
# Vector Institute Agent Bootcamp
# ============================================================================
# ADAPTIVE TOOLKIT:
# - SIMPLE: Schema, correlations, grouped averages, flag comparisons
# - INTERMEDIATE: Mutual information, chi-square, outliers
# - ADVANCED: Regression, decision trees, clustering (with sampling)
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
from typing import List, Dict, Any
from scipy import stats
from scipy.stats import chi2_contingency
from sklearn.feature_selection import mutual_info_regression, mutual_info_classif
from sklearn.cluster import KMeans
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.preprocessing import StandardScaler

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

# Initialize LLM (Gemini for reasoning)
llm = ChatOpenAI(
    model=os.getenv("GEMINI_PRO_MODEL", "gemini-2.0-flash-exp"),
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_BASE_URL,
    temperature=0
)

print("✅ Scotiabank AI Insights Agent initialized")

# ============================================================================
# DATA LOADING (with caching)
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
# ANALYTICS TOOLKIT
# ============================================================================

class AnalyticsToolkit:
    """Collection of analytics tools organized by complexity"""

    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        self.categorical_cols = df.select_dtypes(include=['object', 'bool']).columns.tolist()

    # ========================================================================
    # SIMPLE TOOLS (< 1 second)
    # ========================================================================

    def schema_info(self) -> str:
        """Return schema information with data types and sample values"""
        output = f"### 📊 Dataset Overview\n\n"
        output += f"**{len(self.df):,} rows** × **{len(self.df.columns)} columns**\n\n"

        # Group by type
        numeric = [c for c in self.df.columns if c in self.numeric_cols]
        categorical = [c for c in self.df.columns if c in self.categorical_cols]
        boolean = [c for c in self.df.columns if self.df[c].dtype == 'bool']

        output += f"**📈 Numeric columns** ({len(numeric)}):\n"
        output += ", ".join(numeric[:15])
        if len(numeric) > 15:
            output += f" ... and {len(numeric)-15} more"
        output += "\n\n"

        output += f"**🏷️ Boolean flags** ({len(boolean)}):\n"
        output += ", ".join(boolean[:15])
        if len(boolean) > 15:
            output += f" ... and {len(boolean)-15} more"
        output += "\n\n"

        output += f"**🔤 Categorical columns** ({len([c for c in categorical if c not in boolean])}):\n"
        cat_non_bool = [c for c in categorical if c not in boolean]
        output += ", ".join(cat_non_bool[:15])
        if len(cat_non_bool) > 15:
            output += f" ... and {len(cat_non_bool)-15} more"

        return output

    def column_details(self, columns: List[str]) -> str:
        """Get detailed stats for specific columns"""
        output = "### Column Details\n\n"

        for col in columns:
            if col not in self.df.columns:
                output += f"⚠️ Column '{col}' not found\n\n"
                continue

            output += f"**Column: {col}**\n"

            if col in self.numeric_cols:
                mean_val = self.df[col].mean()
                example_val = self.df[col].dropna().iloc[0] if len(self.df[col].dropna()) > 0 else "N/A"
                output += f"- Example value: {example_val:,.2f} (Numeric)\n"
                output += f"- Average: {mean_val:,.2f}\n"
                output += f"- Median: {self.df[col].median():,.2f}\n"
                output += f"- P95: {self.df[col].quantile(0.95):,.2f}\n"
            else:
                example_val = self.df[col].dropna().iloc[0] if len(self.df[col].dropna()) > 0 else "N/A"
                value_counts = self.df[col].value_counts(normalize=True)
                output += f"- Example value: {example_val} ({self.df[col].dtype})\n"
                if len(value_counts) <= 5:
                    for val, pct in value_counts.items():
                        output += f"  - {val}: {pct*100:.2f}%\n"

            output += "\n"

        return output

    def correlation_analysis(self, target_col: str, top_n: int = 10) -> str:
        """Compute correlations with target column"""
        if target_col not in self.numeric_cols:
            return f"⚠️ '{target_col}' is not numeric"

        correlations = {}
        for col in self.numeric_cols:
            if col != target_col:
                corr = self.df[[target_col, col]].corr().iloc[0, 1]
                correlations[col] = corr

        sorted_corr = sorted(correlations.items(), key=lambda x: abs(x[1]), reverse=True)[:top_n]

        output = f"### Correlation with '{target_col}'\n\n"
        for col, corr in sorted_corr:
            output += f"- **{col}**: {corr:.4f}\n"

        return output

    def grouped_averages(self, metric_col: str, group_cols: List[str]) -> str:
        """Compute averages of metric grouped by categorical columns"""
        if metric_col not in self.numeric_cols:
            return f"⚠️ '{metric_col}' is not numeric"

        output = f"### Average '{metric_col}' by Groups\n\n"

        for group_col in group_cols:
            if group_col not in self.df.columns:
                output += f"⚠️ Column '{group_col}' not found\n\n"
                continue

            output += f"**--- {group_col} ---**\n"

            grouped = self.df.groupby(group_col)[metric_col].mean().sort_values(ascending=False)
            for val, avg in grouped.items():
                output += f"- {val}: {avg:,.2f}\n"

            output += "\n"

        return output

    def flag_comparison(self, metric_col: str, flag_cols: List[str]) -> str:
        """Compare metric averages by boolean flags"""
        if metric_col not in self.numeric_cols:
            return f"⚠️ '{metric_col}' is not numeric"

        output = f"### Average '{metric_col}' by Boolean Flags\n\n"

        for flag_col in flag_cols:
            if flag_col not in self.df.columns:
                continue

            output += f"**--- {flag_col} ---**\n"
            grouped = self.df.groupby(flag_col)[metric_col].mean()

            for val, avg in grouped.items():
                output += f"- {val}: {avg:,.2f}\n"

            output += "\n"

        return output

    def create_bins(self, numeric_col: str, n_bins: int = 3) -> str:
        """Create bins/quartiles for a numeric column"""
        if numeric_col not in self.numeric_cols:
            return f"⚠️ '{numeric_col}' is not numeric"

        labels = ['Low', 'Medium', 'High'] if n_bins == 3 else [f'Q{i+1}' for i in range(n_bins)]
        self.df[f'{numeric_col}_bins'] = pd.qcut(self.df[numeric_col], q=n_bins, labels=labels, duplicates='drop')

        return f"✅ Created bins for '{numeric_col}': {', '.join(labels)}"

    def binned_analysis(self, metric_col: str, bin_col: str, group_cols: List[str] = None) -> str:
        """Analyze metric by bins and optional groupings"""
        if bin_col not in self.df.columns:
            return f"⚠️ Bin column '{bin_col}' not found. Create bins first."

        output = f"### Average '{metric_col}' by '{bin_col}'\n\n"

        if group_cols is None or len(group_cols) == 0:
            grouped = self.df.groupby(bin_col)[metric_col].mean()
            for bin_val, avg in grouped.items():
                output += f"- {bin_val}: {avg:,.2f}\n"
        else:
            grouped = self.df.groupby(group_cols + [bin_col])[metric_col].mean()
            output += grouped.to_string()

        return output

    # ========================================================================
    # INTERMEDIATE TOOLS (< 5 seconds)
    # ========================================================================

    def mutual_information(self, target_col: str, top_n: int = 10) -> str:
        """Compute mutual information between features and target"""
        if target_col not in self.df.columns:
            return f"⚠️ Target '{target_col}' not found"

        X = self.df[self.numeric_cols].drop(columns=[target_col], errors='ignore').fillna(0)
        y = self.df[target_col]

        if pd.api.types.is_numeric_dtype(y):
            mi_scores = mutual_info_regression(X, y, random_state=42)
        else:
            mi_scores = mutual_info_classif(X, y, random_state=42)

        mi_df = pd.DataFrame({'feature': X.columns, 'mi_score': mi_scores}).sort_values('mi_score', ascending=False).head(top_n)

        output = f"### Mutual Information with '{target_col}'\n\n"
        for _, row in mi_df.iterrows():
            output += f"- **{row['feature']}**: {row['mi_score']:.4f}\n"

        return output

    def outlier_detection(self, columns: List[str], threshold: float = 3.0) -> str:
        """Detect outliers using z-score"""
        output = "### Outlier Detection (Z-score)\n\n"

        for col in columns:
            if col not in self.numeric_cols:
                continue

            z_scores = np.abs(stats.zscore(self.df[col].fillna(0)))
            outliers = (z_scores > threshold).sum()
            outlier_pct = (outliers / len(self.df)) * 100

            output += f"**{col}**\n"
            output += f"- Outliers (>{threshold}σ): {outliers:,} ({outlier_pct:.2f}%)\n\n"

        return output

    # ========================================================================
    # ADVANCED TOOLS (10-30 seconds with sampling)
    # ========================================================================

    def linear_regression_drivers(self, target_col: str, group_col: str = None, sample_size: int = 20000) -> str:
        """Run linear regression to identify drivers"""
        if target_col not in self.numeric_cols:
            return f"⚠️ Target '{target_col}' must be numeric"

        # Sample for speed
        df_sample = self.df.sample(min(sample_size, len(self.df)), random_state=42)

        # Prepare features
        feature_cols = [c for c in self.numeric_cols if c != target_col and 'id' not in c.lower()]
        bool_cols = [c for c in self.categorical_cols if df_sample[c].nunique() == 2]

        X = df_sample[feature_cols + bool_cols].fillna(0)
        X = pd.get_dummies(X, drop_first=True)
        y = df_sample[target_col]

        if group_col and group_col in df_sample.columns:
            output = f"### Linear Regression Coefficients by '{group_col}'\n\n"

            for group_val in df_sample[group_col].unique():
                mask = df_sample[group_col] == group_val
                if mask.sum() < 50:
                    continue

                X_group = X[mask]
                y_group = y[mask]

                model = LinearRegression()
                model.fit(X_group, y_group)

                coefs = pd.DataFrame({'feature': X_group.columns, 'coefficient': model.coef_})
                coefs = coefs.reindex(coefs['coefficient'].abs().sort_values(ascending=False).index).head(10)

                output += f"**--- {group_val} ---**\n"
                for _, row in coefs.iterrows():
                    output += f"- {row['feature']}: {row['coefficient']:.4f}\n"
                output += "\n"
        else:
            model = LinearRegression()
            model.fit(X, y)

            coefs = pd.DataFrame({'feature': X.columns, 'coefficient': model.coef_})
            coefs = coefs.reindex(coefs['coefficient'].abs().sort_values(ascending=False).index).head(15)

            output = f"### Linear Regression Coefficients for '{target_col}'\n\n"
            for _, row in coefs.iterrows():
                output += f"- **{row['feature']}**: {row['coefficient']:.4f}\n"

        return output

    def clustering_analysis(self, n_clusters: int = 3, sample_size: int = 20000) -> str:
        """K-means clustering analysis"""
        df_sample = self.df.sample(min(sample_size, len(self.df)), random_state=42)

        X = df_sample[self.numeric_cols].fillna(0)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=5)
        clusters = kmeans.fit_predict(X_scaled)

        df_sample['cluster'] = clusters

        output = f"### K-Means Clustering ({n_clusters} clusters)\n\n"

        for i in range(n_clusters):
            cluster_size = (clusters == i).sum()
            cluster_pct = (cluster_size / len(clusters)) * 100
            output += f"**Cluster {i}**: {cluster_size:,} customers ({cluster_pct:.1f}%)\n"

        return output

# ============================================================================
# TOOL ROUTER (LLM-based)
# ============================================================================

def route_to_tools(user_question: str, conversation_history: List[Dict], df: pd.DataFrame) -> Dict[str, Any]:
    """Use LLM to select appropriate tools based on question complexity"""

    toolkit = AnalyticsToolkit(df)

    # Build context from conversation
    context = "\n".join([f"User: {turn['user']}\nAgent: {turn['agent'][:200]}..." for turn in conversation_history[-3:]])

    routing_prompt = f"""You are a Senior Data Analyst at Scotiabank. Select tools to answer the user's question.

DATASET:
- Numeric: {', '.join(toolkit.numeric_cols)}
- Boolean flags: {', '.join([c for c in df.columns if df[c].dtype == 'bool'])}
- Categorical: {', '.join([c for c in toolkit.categorical_cols if df[c].dtype != 'bool'])}

QUESTION: "{user_question}"

TOOLS:
1. schema_info - show overview (no params)
2. column_details - show stats for columns (params: {{"columns": ["col1", "col2"]}})
3. correlation_analysis - correlations with target (params: {{"target_col": "total_revenues"}})
4. grouped_averages - average metric by groups (params: {{"metric_col": "total_revenues", "group_cols": ["country_name"]}})
5. flag_comparison - compare metric by flags (params: {{"metric_col": "total_revenues", "flag_cols": ["has_open_mortgage"]}})

EXAMPLES:
Q: "What data is available?" → {{"tools": [{{"name": "schema_info", "params": {{}}}}]}}
Q: "Correlation between revenue and deposits" → {{"tools": [{{"name": "correlation_analysis", "params": {{"target_col": "total_revenues"}}}}]}}
Q: "How does mortgage affect revenue by country?" → {{"tools": [{{"name": "grouped_averages", "params": {{"metric_col": "total_revenues", "group_cols": ["country_name", "has_open_mortgage"]}}}}]}}

Return ONLY valid JSON:
{{"tools": [{{"name": "...", "params": {{...}}}}]}}"""

    try:
        response = llm.invoke([HumanMessage(content=routing_prompt)])
        content = response.content.replace("```json", "").replace("```", "").strip()
        plan = json.loads(content)
        return plan
    except Exception as e:
        print(f"⚠️ Routing error: {e}")
        # Fallback to schema_info
        return {
            "tools": [{"name": "schema_info", "params": {}, "reason": "fallback"}],
            "approach": "Showing dataset overview"
        }

# ============================================================================
# EXECUTE TOOLS
# ============================================================================

def execute_tools(plan: Dict[str, Any], df: pd.DataFrame) -> str:
    """Execute selected tools and compile results"""
    toolkit = AnalyticsToolkit(df)

    results = []

    for tool_spec in plan.get('tools', []):
        tool_name = tool_spec['name']
        params = tool_spec.get('params', {})

        try:
            if tool_name == 'schema_info':
                results.append(toolkit.schema_info())
            elif tool_name == 'column_details':
                results.append(toolkit.column_details(params.get('columns', [])))
            elif tool_name == 'correlation_analysis':
                target_col = params.get('target_col', 'total_revenues')
                results.append(toolkit.correlation_analysis(target_col, params.get('top_n', 10)))
            elif tool_name == 'grouped_averages':
                metric_col = params.get('metric_col', 'total_revenues')
                group_cols = params.get('group_cols', [])
                results.append(toolkit.grouped_averages(metric_col, group_cols))
            elif tool_name == 'flag_comparison':
                metric_col = params.get('metric_col', 'total_revenues')
                flag_cols = params.get('flag_cols', [])
                results.append(toolkit.flag_comparison(metric_col, flag_cols))
            elif tool_name == 'create_bins':
                numeric_col = params.get('numeric_col', 'total_revenues')
                results.append(toolkit.create_bins(numeric_col, params.get('n_bins', 3)))
            elif tool_name == 'binned_analysis':
                metric_col = params.get('metric_col', 'total_revenues')
                bin_col = params.get('bin_col', '')
                results.append(toolkit.binned_analysis(metric_col, bin_col, params.get('group_cols')))
            elif tool_name == 'mutual_information':
                target_col = params.get('target_col', 'total_revenues')
                results.append(toolkit.mutual_information(target_col, params.get('top_n', 10)))
            elif tool_name == 'outlier_detection':
                results.append(toolkit.outlier_detection(params.get('columns', toolkit.numeric_cols[:5]), params.get('threshold', 3.0)))
            elif tool_name == 'linear_regression_drivers':
                target_col = params.get('target_col', 'total_revenues')
                results.append(toolkit.linear_regression_drivers(target_col, params.get('group_col')))
            elif tool_name == 'clustering_analysis':
                results.append(toolkit.clustering_analysis(params.get('n_clusters', 3)))
            else:
                print(f"⚠️ Unknown tool: {tool_name}")
                continue

        except Exception as e:
            print(f"⚠️ Error in {tool_name}: {str(e)}")
            import traceback
            traceback.print_exc()
            continue

    return "\n\n".join(results) if results else "I couldn't analyze that. Could you rephrase your question?"

# ============================================================================
# CONVERSATIONAL AGENT
# ============================================================================

CONVERSATION_HISTORY = []
MAX_HISTORY = 8  # Remember last 8 turns

def conversational_agent(user_input: str, history):
    """Main conversational agent with memory"""
    global CONVERSATION_HISTORY

    # Load data
    df = load_banking_data()
    if df.empty:
        return "❌ Error: Could not load data"

    # Check if we're running out of memory
    if len(CONVERSATION_HISTORY) >= MAX_HISTORY:
        summary = f"📝 **Memory Summary**: We've covered {len(CONVERSATION_HISTORY)} topics. Consider starting fresh if changing topics."
        CONVERSATION_HISTORY = CONVERSATION_HISTORY[-4:]  # Keep last 4 turns
        yield summary

    # Route to tools
    plan = route_to_tools(user_input, CONVERSATION_HISTORY, df)

    # Execute tools
    tool_results = execute_tools(plan, df)

    # Store in conversation history
    CONVERSATION_HISTORY.append({
        "user": user_input,
        "agent": tool_results
    })

    # Return results
    yield tool_results

# ============================================================================
# GRADIO INTERFACE
# ============================================================================

demo = gr.ChatInterface(
    fn=conversational_agent,
    title="🏦 Scotiabank AI Insights Agent (Conversational v4)",
    description="""
    **Adaptive Analytics Toolkit**

    Ask questions naturally. The agent will intelligently select tools based on complexity:
    - Simple questions → Fast profiling tools
    - Complex questions → Advanced ML analysis

    Examples:
    - "What information is available?"
    - "Show me correlation between revenue and loans"
    - "How does mortgage ownership affect revenue by country?"
    """,
    examples=[
        "What information is available?",
        "Show me details for total_revenues, total_loans_balance, and has_open_mortgage",
        "What's the correlation between total_revenues and other metrics?",
        "Compare average total_revenues by has_open_mortgage and has_open_credit_card",
    ],
    type="messages"
)

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    print("🚀 Launching Scotiabank Conversational Agent v4...")
    demo.launch(server_name="0.0.0.0", server_port=7864, share=True)
