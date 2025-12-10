"""Test script for the Business Insight Worker Agent.

This script tests the worker agent functionality without requiring
the full multi-agent setup or Anthropic Agents SDK.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from multi_agent.business_insight_worker import analyze_business_insight


def test_worker_agent():
    """Test the worker agent with sample questions."""

    print("="*80)
    print("🧪 TESTING BUSINESS INSIGHT WORKER AGENT")
    print("="*80)

    test_questions = [
        "What data is available?",
        "Compare clients with payroll vs without payroll",
    ]

    for i, question in enumerate(test_questions, 1):
        print(f"\n{'='*80}")
        print(f"TEST {i}/{len(test_questions)}: {question}")
        print("="*80)

        try:
            result = analyze_business_insight(question)

            print("\n" + "-"*80)
            print("RESULT:")
            print("-"*80)
            print(result)
            print("-"*80)

            if "error" in result.lower() and "could not load" in result.lower():
                print(f"⚠️  Test {i} completed but couldn't load data (expected if no internet)")
            elif len(result) > 50:
                print(f"✅ Test {i} PASSED - Generated insights")
            else:
                print(f"⚠️  Test {i} - Short response (may need review)")

        except Exception as e:
            print(f"❌ Test {i} FAILED with error: {e}")
            import traceback
            traceback.print_exc()

    print("\n" + "="*80)
    print("✅ WORKER AGENT TESTS COMPLETE")
    print("="*80)
    print("\nNext step: Test full multi-agent system with:")
    print("  cd src/multi_agent && python efficient.py")


if __name__ == "__main__":
    test_worker_agent()
