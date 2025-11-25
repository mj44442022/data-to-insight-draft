"""
Quick test script to verify the setup is working correctly.
"""

import sys
from pathlib import Path

def test_imports():
    """Test that all required packages can be imported."""
    print("Testing package imports...")

    required_packages = [
        ("openai", "OpenAI client"),
        ("gradio", "Gradio UI"),
        ("pandas", "Data analysis"),
        ("numpy", "Numerical computing"),
        ("pydantic", "Data validation"),
        ("dotenv", "Environment variables"),
    ]

    optional_packages = [
        ("openai.agents", "OpenAI Agents SDK"),
        ("e2b_code_interpreter", "E2B Code Interpreter"),
    ]

    all_good = True

    for package, description in required_packages:
        try:
            __import__(package)
            print(f"  ✓ {description} ({package})")
        except ImportError:
            print(f"  ✗ {description} ({package}) - MISSING")
            all_good = False

    print("\nOptional packages:")
    for package, description in optional_packages:
        try:
            __import__(package)
            print(f"  ✓ {description} ({package})")
        except ImportError:
            print(f"  ⚠ {description} ({package}) - Not installed (will use simplified mode)")

    return all_good


def test_data_file():
    """Test that data file exists and can be loaded."""
    print("\nTesting data file...")

    data_file = Path(__file__).parent / "data" / "sample_banking_data.csv"

    if not data_file.exists():
        print(f"  ✗ Data file not found: {data_file}")
        return False

    print(f"  ✓ Data file exists: {data_file}")

    try:
        import pandas as pd
        df = pd.read_csv(data_file)
        print(f"  ✓ Data loaded successfully: {len(df)} rows, {len(df.columns)} columns")

        # Check key columns
        required_cols = [
            'client_hash_id', 'segment', 'is_churned',
            'total_revenues', 'product_count'
        ]
        missing_cols = [col for col in required_cols if col not in df.columns]

        if missing_cols:
            print(f"  ✗ Missing columns: {missing_cols}")
            return False

        print(f"  ✓ All required columns present")
        return True

    except Exception as e:
        print(f"  ✗ Error loading data: {e}")
        return False


def test_env_file():
    """Test environment configuration."""
    print("\nTesting environment configuration...")

    env_file = Path(__file__).parent / ".env"
    env_example = Path(__file__).parent / ".env.example"

    if not env_example.exists():
        print(f"  ✗ .env.example not found")
        return False

    print(f"  ✓ .env.example exists")

    if not env_file.exists():
        print(f"  ⚠ .env file not found - you'll need to create it from .env.example")
        return False

    print(f"  ✓ .env file exists")

    from dotenv import load_dotenv
    import os

    load_dotenv()

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print(f"  ⚠ OPENAI_API_KEY not set in .env")
        return False

    print(f"  ✓ OPENAI_API_KEY is configured")

    e2b_key = os.getenv("E2B_API_KEY")
    if not e2b_key:
        print(f"  ⚠ E2B_API_KEY not set (will use simplified mode)")
    else:
        print(f"  ✓ E2B_API_KEY is configured")

    return True


def test_project_structure():
    """Test that all project files are in place."""
    print("\nTesting project structure...")

    base_path = Path(__file__).parent

    required_files = [
        "README.md",
        "requirements.txt",
        ".env.example",
        "src/app.py",
        "src/cli.py",
        "src/agents/__init__.py",
        "src/agents/data_analyzer.py",
        "src/agents/insight_generator.py",
        "src/utils/__init__.py",
        "src/utils/prompts.py",
        "data/sample_banking_data.csv",
    ]

    all_good = True
    for file in required_files:
        file_path = base_path / file
        if file_path.exists():
            print(f"  ✓ {file}")
        else:
            print(f"  ✗ {file} - MISSING")
            all_good = False

    return all_good


def main():
    """Run all tests."""
    print("="*70)
    print("INSIGHT GENERATOR AGENT - SETUP VERIFICATION")
    print("="*70 + "\n")

    results = []

    results.append(("Package Imports", test_imports()))
    results.append(("Project Structure", test_project_structure()))
    results.append(("Data File", test_data_file()))
    results.append(("Environment Config", test_env_file()))

    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)

    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{test_name}: {status}")

    all_passed = all(result for _, result in results)

    if all_passed:
        print("\n✓ All tests passed! Setup is complete.")
        print("\nNext steps:")
        print("  1. Ensure OPENAI_API_KEY is set in .env")
        print("  2. (Optional) Set E2B_API_KEY for full code interpreter mode")
        print("  3. Run: python src/app.py (for Gradio UI)")
        print("  4. Or run: python src/cli.py (for CLI)")
    else:
        print("\n⚠ Some tests failed. Please review the output above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
