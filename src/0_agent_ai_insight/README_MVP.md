# AI Business Insights Generator - Simplified MVP

**Vector Institute Agent Bootcamp - Streamlined Version**

## Overview

This is a simplified, production-ready MVP of the AI Business Insights Generator. Reduced from 1,371 lines to ~730 lines while maintaining core functionality.

## Key Simplifications

### ✂️ What Was Changed

1. **Phase 1: Smart Intake (Replaced complex consultation)**
   - Intelligently extracts information from user input
   - Asks only necessary clarifying questions
   - Avoids excessive back-and-forth with users

2. **Phase 2: Data Agent (Consolidated Phases 2-4)**
   - Merged data quality checks, feature engineering, and sanity checks
   - Single consolidated agent instead of three separate phases
   - Focused on essential validations only

3. **Phase 3: Simplified Analysis (Streamlined Phases 5-6)**
   - K-Means clustering (k=3) for segmentation
   - Random Forest for driver identification
   - Uses Python ML directly, Gemini only for interpretation

4. **Phase 4: LLM-as-Judge Evaluation (Simplified Phase 8)**
   - Meta-cognitive review using LLM-as-judge pattern
   - Scores analysis on 5 key dimensions
   - Provides constructive feedback and recommendations

5. **Removed Phase 7 (Business Impact Calculator)**
   - Eliminated to reduce complexity
   - Focus on patterns and drivers instead of $ calculations

### 🎯 What Was Kept

- ✅ **Strategic Model Selection**: Gemini Flash for speed, Pro for complex reasoning
- ✅ **Excellent Prompt Engineering**: Research-backed techniques maintained
- ✅ **Robust Data Loading**: Priority fallback system
- ✅ **LangChain/LangGraph Compatibility**: Aligned with bootcamp patterns
- ✅ **Public Gradio Interface**: Easy browser access

## Data Loading Priority

The system follows this exact sequence:

1. **Local file**: `banking_data_final_complete_flags.csv`
2. **HuggingFace fallback**: [https://huggingface.co/datasets/mj44442022/dataset_synthetic_v2/resolve/main/banking_data_final_complete_flags(1).csv](https://huggingface.co/datasets/mj44442022/dataset_synthetic_v2/resolve/main/banking_data_final_complete_flags(1).csv)
3. **ERROR - Stop execution**: No fake data generation

## Installation

```bash
# Install dependencies
pip install -r requirements_mvp.txt

# Set up environment variables in .env file
cat > .env << EOF
OPENAI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/"
OPENAI_API_KEY="your-gemini-api-key-here"
EOF
```

**Note:** The MVP uses Gemini models through OpenAI-compatible interface, which aligns with Vector Institute bootcamp patterns (using OpenAI SDK). Your Gemini API key works with `OPENAI_API_KEY`.

## Usage

```bash
# Run the MVP
python app_mvp.py
```

The application will:
1. Launch on port **7863**
2. Provide a **public Gradio link** for browser access
3. Display comprehensive logging in the console for debugging

## Example Queries

- "Why are high-value customers churning?"
- "What drives revenue growth in different customer segments?"
- "Analyze patterns in customer engagement and retention"

## Workflow

```
User Input
    ↓
Phase 1: Smart Intake (Pro)
    → Extract hypothesis + metrics
    → Ask only if info missing
    ↓
Phase 2: Data Agent (Flash)
    → Data quality checks
    → Feature engineering
    → Sanity validation
    ↓
Phase 3: Analysis (Python + Pro)
    → K-Means clustering
    → Random Forest drivers
    ↓
Phase 4: LLM-as-Judge (Pro)
    → Quality evaluation
    → Score + feedback
    ↓
Final Insights (Pro)
    → Executive summary
    → ≤200 words
```

## Cost Efficiency

- **Gemini Flash**: Fast data processing (~70% of operations)
- **Gemini Pro**: Complex reasoning (~30% of operations)
- **Estimated cost per analysis**: $0.05-0.10

## File Structure

```
src/0_agent_ai_insight/
├── app_mvp.py                 # Simplified MVP (this version)
├── app_v2_complete.py         # Full 8-phase version
├── requirements_mvp.txt       # MVP dependencies (9 packages)
├── requirements.txt           # Full version dependencies
├── README_MVP.md             # This file
└── banking_data_final_complete_flags.csv  # Dataset (optional)
```

## Technical Stack

- **LLMs**: Google Gemini 1.5 (Flash + Pro) via OpenAI-compatible interface
- **Framework**: LangChain + OpenAI SDK + Gradio
- **ML**: scikit-learn (KMeans, RandomForest)
- **Data**: pandas, numpy
- **Architecture**: Aligns with Vector Institute bootcamp patterns (OpenAI SDK)

## Debugging

The application prints comprehensive logs to console:
- ✅ Successful operations
- ⚠️ Warnings and issues detected
- 📊 Data statistics at each phase
- 🔍 Model selections and reasoning

Monitor the console output to track execution and identify any issues.

## Differences from Full Version

| Feature | Full v2.0 (1,371 lines) | MVP (~730 lines) |
|---------|------------------------|------------------|
| Phases | 8 phases | 4 phases |
| User checkpoints | Multiple approval points | Minimal (only if info missing) |
| Business impact $ | Yes (Phase 7) | No |
| Robustness testing | Multiple time windows | Integrated in evaluation |
| Complexity | High (comprehensive) | Low (essential only) |
| Lines of code | 1,371 | ~730 |

## Support

For questions or issues:
1. Check console logs for detailed error messages
2. Verify `GOOGLE_API_KEY` is set correctly
3. Ensure data file is accessible or HuggingFace URL is reachable
4. Refer to Vector Institute Agent Bootcamp facilitators

## License

Vector Institute Agent Bootcamp Project
