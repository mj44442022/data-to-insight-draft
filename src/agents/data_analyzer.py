"""
Data Analyzer Agent - Uses code interpreter to perform statistical analysis on banking data.
"""

import os
from pathlib import Path
from typing import Optional

try:
    from openai import agents
    from e2b_code_interpreter import CodeInterpreter
    AGENTS_AVAILABLE = True
except ImportError:
    AGENTS_AVAILABLE = False
    print("Warning: openai-agents or e2b-code-interpreter not installed. Agent creation will fail.")

from ..utils import DATA_ANALYZER_INSTRUCTIONS


def create_data_analyzer_agent(
    openai_client,
    data_file_path: str,
    model: str = "gpt-4o-mini"
) -> Optional[object]:
    """
    Create a Data Analyzer Agent with code interpreter capabilities.

    Args:
        openai_client: OpenAI client instance
        data_file_path: Path to the CSV data file to analyze
        model: Model to use for the agent (default: gpt-4o-mini for cost efficiency)

    Returns:
        Agent instance configured for data analysis
    """
    if not AGENTS_AVAILABLE:
        raise ImportError(
            "Required packages not installed. "
            "Please install: pip install openai-agents e2b-code-interpreter"
        )

    # Verify data file exists
    if not os.path.exists(data_file_path):
        raise FileNotFoundError(f"Data file not found: {data_file_path}")

    # Get E2B API key
    e2b_api_key = os.getenv("E2B_API_KEY")
    if not e2b_api_key:
        raise ValueError(
            "E2B_API_KEY not found in environment variables. "
            "Please set it in your .env file or environment."
        )

    # Create code interpreter with data file mounted
    code_interpreter = CodeInterpreter(
        api_key=e2b_api_key,
        local_files=[Path(data_file_path)]
    )

    # Enhanced instructions with data file context
    enhanced_instructions = f"""{DATA_ANALYZER_INSTRUCTIONS}

IMPORTANT: The banking data is available at: {os.path.basename(data_file_path)}

Data schema includes:
- Customer identifiers: client_hash_id, country_name, region, segment
- Product holdings: has_open_credit_card, has_open_mortgage, has_open_personal_loan, etc.
- Financial metrics: total_revenues, total_lending_balance, total_deposit_balance
- Behavioral flags: is_churned, is_new, high_activity_month, is_digital
- Engagement: purchase_count_last_month, purchase_amount_last_month

When writing code:
1. Start by loading the data: df = pd.read_csv('{os.path.basename(data_file_path)}')
2. Explore basic statistics and distributions
3. Calculate correlations between key variables
4. Identify patterns in churned vs. retained customers
5. Compare metrics across segments and regions
6. Return clear, structured results

Example analysis pattern:
```python
import pandas as pd
import numpy as np

# Load data
df = pd.read_csv('{os.path.basename(data_file_path)}')

# Basic exploration
print("Dataset shape:", df.shape)
print("\\nColumn names:", df.columns.tolist())

# Key metrics
print("\\n=== Key Metrics ===\")
print(f"Total customers: {{len(df)}}")
print(f"Churn rate: {{df['is_churned'].mean():.2%}}")
print(f"Average revenue: ${{df['total_revenues'].mean():.2f}}")

# Analysis by segment
segment_analysis = df.groupby('segment').agg({{
    'client_hash_id': 'count',
    'is_churned': 'mean',
    'total_revenues': 'mean'
}}).round(2)
print("\\n=== Segment Analysis ===\")
print(segment_analysis)
```

Always provide clear explanations of your findings.
"""

    # Create the agent
    agent = agents.Agent(
        name="DataAnalyzer",
        instructions=enhanced_instructions,
        tools=[
            agents.function_tool(
                code_interpreter.run_code,
                name_override="code_interpreter"
            )
        ],
        model=agents.OpenAIChatCompletionsModel(
            model=model,
            openai_client=openai_client
        )
    )

    return agent


# For environments without E2B, provide a mock analyzer
def create_mock_data_analyzer():
    """
    Create a mock analyzer for testing without E2B.
    Returns analysis results based on the sample data structure.
    """
    mock_results = """
    === MOCK ANALYSIS RESULTS ===

    Dataset Overview:
    - Total customers: 24
    - Date range: 2015-2023
    - Regions: TRUE NORTH, PAC, ECRDR
    - Countries: Canada, Chile, Mexico, Peru

    Key Findings:

    1. CHURN ANALYSIS:
       - Overall churn rate: 45.8%
       - Churned customers have lower average revenue: $45.2 vs $98.3
       - Single-product customers show higher churn (58%)

    2. REVENUE DRIVERS:
       - High Potential segment: $142.5 average revenue
       - Priority customers: $156.8 average revenue
       - Digital customers: 12% higher revenue

    3. PRODUCT ADOPTION:
       - Average products per customer: 2.8
       - Most common: Payroll Account (37.5%)
       - High-value combo: Investment + Credit Card + Checking

    4. REGIONAL PATTERNS:
       - TRUE NORTH: Highest revenue per customer ($87.4)
       - PAC: Best retention (62%)
       - ECRDR: Growing digital adoption

    5. DIGITAL CORRELATION:
       - Digital customers: 50% of base
       - Digital users have 2.3x more products
       - Digital correlates with lower churn (-18%)
    """

    return mock_results
