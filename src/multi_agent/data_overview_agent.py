"""Data Overview Agent - Fast schema and overview provider.

This lightweight agent provides quick data schema and overview information.
It's called when users ask "What data is available?" type questions.
"""

import os
import pandas as pd
import numpy as np
import requests
from pathlib import Path
from dotenv import load_dotenv


# ============================================================================
# CONFIGURATION
# ============================================================================
load_dotenv()


# ============================================================================
# DATA LOADING (Shared with Business Insight Worker)
# ============================================================================
DATA_CACHE = None


def load_banking_data() -> pd.DataFrame:
    """Load banking data with caching.

    This function is shared between data_overview_agent and business_insight_worker.
    It caches the data to avoid redundant downloads.
    """
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
# DATA OVERVIEW FUNCTION
# ============================================================================

def get_data_overview() -> str:
    """Get formatted overview of available banking data.

    This function provides a quick schema overview including:
    - Total rows and columns
    - Numeric metrics
    - Boolean flags
    - Categorical columns

    Returns:
        Formatted markdown string with data overview
    """
    print("\n" + "="*80)
    print("📊 DATA OVERVIEW AGENT - GENERATING SCHEMA OVERVIEW")
    print("="*80)

    # Load data
    df = load_banking_data()
    if df.empty:
        return "❌ Error: Could not load banking data. Please check data source."

    # Categorize columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    boolean_cols = [c for c in df.columns if df[c].dtype == 'bool']
    categorical_cols = [c for c in df.select_dtypes(include=['object']).columns if df[c].dtype != 'bool']

    # Format overview
    output = f"""### 📊 Dataset Overview

**{len(df):,} customers** across **{len(df.columns)} data points**

**Numeric Metrics** ({len(numeric_cols)}):
{', '.join(numeric_cols[:10])}{"..." if len(numeric_cols) > 10 else ""}

**Customer Flags** ({len(boolean_cols)}):
{', '.join(boolean_cols[:10])}{"..." if len(boolean_cols) > 10 else ""}

**Segmentation** ({len(categorical_cols)}):
{', '.join(categorical_cols)}

💡 *Ask follow-up questions to analyze specific metrics or compare customer segments.*"""

    print("✅ Data overview generated")
    print("="*80)

    return output
