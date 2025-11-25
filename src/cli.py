"""
Command-line interface for the Insight Generator Agent.

This provides a simple CLI for testing the agent without the Gradio UI.
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from openai import OpenAI
from openai import agents

from src.agents import create_insight_generator_agent
from src.utils import QUICK_ANALYSIS_QUERIES


def main():
    """CLI main function."""
    # Load environment
    load_dotenv()

    # Get API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not found")
        print("Please create a .env file with your OpenAI API key")
        sys.exit(1)

    # Initialize client
    client = OpenAI(api_key=api_key)

    # Get data file
    data_file = Path(__file__).parent.parent / "data" / "sample_banking_data.csv"
    if not data_file.exists():
        print(f"❌ Error: Data file not found at {data_file}")
        sys.exit(1)

    print("\n" + "=" * 70)
    print("🏦 SCOTIABANK INSIGHT GENERATOR AGENT - CLI")
    print("=" * 70)

    # Create insight generator (simplified mode)
    print("\n📊 Initializing Insight Generator...")
    insight_generator = create_insight_generator_agent(
        client,
        data_analyzer_agent=None,  # Simplified mode
        model="gpt-4o"
    )
    print("✓ Agent ready!\n")

    # Load sample data for analysis
    print("📁 Loading customer data...")
    try:
        import pandas as pd
        df = pd.read_csv(data_file)
        print(f"✓ Loaded {len(df)} customer records\n")

        # Generate quick stats
        stats = f"""
DATASET OVERVIEW:
- Total customers: {len(df)}
- Churn rate: {df['is_churned'].mean():.1%}
- Avg revenue: ${df['total_revenues'].mean():.2f}
- Avg products: {df['product_count'].mean():.1f}
- Digital adoption: {df['is_digital'].mean():.1%}

SEGMENT BREAKDOWN:
{df.groupby('segment').size().to_string()}

CHURN COMPARISON:
- Avg revenue (churned): ${df[df['is_churned']==True]['total_revenues'].mean():.2f}
- Avg revenue (retained): ${df[df['is_churned']==False]['total_revenues'].mean():.2f}
"""
    except Exception as e:
        print(f"⚠ Warning: Could not load data: {e}")
        stats = "Sample data stats not available."

    # Interactive loop
    print("\n" + "=" * 70)
    print("QUICK START OPTIONS:")
    print("=" * 70)
    for i, (key, query) in enumerate(QUICK_ANALYSIS_QUERIES.items(), 1):
        print(f"{i}. {key.upper()}: {query[:60]}...")
    print("\nOr type your own query (or 'quit' to exit)")
    print("=" * 70 + "\n")

    while True:
        try:
            user_input = input("Your query> ").strip()

            if not user_input:
                continue

            if user_input.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Goodbye!")
                break

            # Check if it's a number (quick option)
            if user_input.isdigit():
                idx = int(user_input) - 1
                queries = list(QUICK_ANALYSIS_QUERIES.values())
                if 0 <= idx < len(queries):
                    query = queries[idx]
                else:
                    print("Invalid option number.")
                    continue
            else:
                query = user_input

            # Generate insights
            print(f"\n{'='*70}")
            print("🔍 Analyzing data...")
            print(f"{'='*70}\n")

            # Provide context with data stats
            full_prompt = f"""Based on the following banking customer data analysis:

{stats}

User question: {query}

Generate clear, actionable business insights that executives can understand and act upon.
Focus on trends, opportunities, and recommended actions.
"""

            result = agents.Runner.run(
                insight_generator,
                input=full_prompt
            )

            print("\n" + "=" * 70)
            print("💡 INSIGHTS")
            print("=" * 70 + "\n")
            print(result.final_output)
            print("\n" + "=" * 70 + "\n")

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}\n")


if __name__ == "__main__":
    main()
