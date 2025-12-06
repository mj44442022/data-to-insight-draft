# Quick Start Guide - Enhanced v2.0

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd /home/coder/agent-bootcamp/src/0_agent_ai_insight/

# Install new dependencies
pip install langchain-google-genai google-generativeai

# Or install everything:
pip install -r requirements.txt
```

### 2. Set Up API Key

Add to your `.env` file:

```bash
# Google Gemini API (REQUIRED for v2.0)
GOOGLE_API_KEY="your-api-key-here"
```

**Get your API key:** https://makersuite.google.com/app/apikey

### 3. Download the Enhanced Version

```bash
# Download app_v2_enhanced.py
curl -o app_v2_enhanced.py https://raw.githubusercontent.com/mj44442022/data-to-insight-draft/claude/ai-insights-banking-mvp-016tz6FaafyKw6oyRyPiyrkh/src/0_agent_ai_insight/app_v2_enhanced.py
```

### 4. Run the Enhanced App

```bash
uv run --env-file ../../.env gradio app_v2_enhanced.py

# OR with python directly:
python app_v2_enhanced.py
```

You'll see:
```
✅ All dependencies found!
✅ Google API key found
✅ Gemini Flash initialized
✅ Gemini Pro initialized
Data loaded: 3,000 rows covering 6 months

🌐 Running on public URL: https://xxxxx.gradio.live
```

---

## 📋 What's Implemented (Phases 1-3)

### ✅ **Phase 1: Consultation & Hypothesis**
- **Model**: Gemini Pro (advanced reasoning)
- **What it does**:
  - Clarifies your business objective
  - Defines a testable hypothesis
  - Outlines analysis plan
  - **Waits for your approval**

**Example Flow:**
```
You: "Why are we losing high-value customers?"

AI: 📋 CONSULTATION SUMMARY
    Business Objective: Identify drivers of high-value customer churn
    Hypothesis: High-value customers are churning due to limited
    digital product offerings...

    ✅ Does this accurately capture what you want to learn?

You: [Click "Approve & Continue"]
```

### ✅ **Phase 2: Data Quality Check**
- **Model**: Gemini Flash (fast validation)
- **What it does**:
  - Validates data completeness
  - Detects null values (>5%)
  - Identifies outliers (>3σ)
  - Reports data coverage

**Example Output:**
```
📊 DATA QUALITY REPORT

Dataset Overview:
- Rows: 3,000
- Date Range: 2024-07-31 to 2024-12-31 (6 months)

Quality Assessment:
✅ Overall Status: GOOD
⚠️ Null Values Detected:
  • credit_card_balance: 2.1% null values

Data Coverage:
✅ Sufficient for Month-over-Month analysis
❌ Insufficient for Year-over-Year (need 12+ months)
```

### ✅ **Phase 3: Feature Engineering**
- **Model**: Gemini Flash (quick calculations)
- **What it does**:
  - Creates 5 advanced features:
    1. **3-month rolling averages** (smooth volatility)
    2. **MoM growth rates** (identify trends)
    3. **Digital adoption score** (count of digital products)
    4. **Loan-to-Deposit ratio** (liquidity metric)
    5. **Revenue per balance** (profitability metric)
  - **Waits for your approval**

**Example Output:**
```
🔧 PROPOSED FEATURES

1. total_loans_balance_3mo_avg
   - Description: 3-month rolling average of total_loans_balance
   - Purpose: Smooth volatility, identify trends

2. total_revenues_mom_growth
   - Description: Month-over-month % change in total_revenues
   - Purpose: Identify growth/decline patterns

... (3 more features)

Options:
✅ "Approve" - Use these features
➕ "Add More" - Request additional features
```

---

## 🎯 How to Use

### Starting an Analysis

1. **Enter your question:**
   ```
   "What's driving revenue growth in Mexico?"
   ```

2. **Review the hypothesis:**
   - Read the AI's interpretation
   - Click "✅ Approve & Continue" if correct
   - Click "🔄 Revise" to adjust

3. **Acknowledge data quality:**
   - Review the quality report
   - Click "Continue"

4. **Validate features:**
   - Review proposed features
   - Click "✅ Approve" to proceed
   - OR type "Add feature: [your feature]" to request more

5. **Get insights:**
   - Remaining phases will complete
   - Receive actionable recommendations

---

## 🎨 UI Features

### Main Interface

- **Chatbot**: Multi-turn conversation with AI analyst
- **Quick Actions**:
  - ✅ **Approve & Continue**: Move to next phase
  - 🔄 **Revise**: Request changes
  - ⏭️ **Skip to Insights**: Fast-track (bypass intermediate steps)

### Example Questions

Click any example to try:
- "What's driving revenue growth in Mexico?"
- "Why are we losing high-value customers?"
- "Which customer segments have highest profit potential?"
- "How can we reduce churn in Chile?"

---

## 🔧 Differences from v1.0

| Feature | v1.0 (app.py) | v2.0 (app_v2_enhanced.py) |
|---------|---------------|---------------------------|
| **Model** | OpenAI GPT-4 Turbo | Google Gemini Flash + Pro |
| **Interface** | Single Q&A | Multi-turn chatbot |
| **Workflow** | One-shot analysis | 8-phase interactive |
| **User Control** | None | Approval at each phase |
| **Features** | Basic metrics | Advanced ML features |
| **Cost** | ~$0.10-0.30/query | ~$0.02-0.10/query |
| **Port** | 7860 | 7861 |

---

## 📊 What's Coming (Phases 4-8)

### Phase 4: Sanity Check
- Validate calculated metrics
- Detect anomalies and spikes
- Historical trend comparison

### Phase 5: K-Means Clustering
- Discover hidden customer segments
- Characterize each cluster
- Name segments intuitively

### Phase 6: Random Forest Analysis
- Identify complex drivers
- Feature importance ranking
- Interaction effects

### Phase 7: Business Impact Calculator
- Translate insights to $ amounts
- Model scenarios (if X changes, revenue changes $Y)
- Prioritize opportunities by ROI

### Phase 8: Robustness + Meta-Review
- Test insights across time windows
- Agent self-reviews logic
- Final validation

---

## 🐛 Troubleshooting

### "GOOGLE_API_KEY not found"

**Solution:**
```bash
# Add to .env file:
echo 'GOOGLE_API_KEY="your-key-here"' >> .env
```

Get key from: https://makersuite.google.com/app/apikey

### "ModuleNotFoundError: No module named 'langchain_google_genai'"

**Solution:**
```bash
pip install langchain-google-genai google-generativeai
```

### App runs on port 7860 instead of 7861

**Solution:**
- v1.0 runs on port 7860
- v2.0 runs on port 7861
- Both can run simultaneously!

---

## 📥 Direct Download Links

| File | Purpose | Link |
|------|---------|------|
| **app_v2_enhanced.py** | Enhanced version (v2.0) | [Download](https://raw.githubusercontent.com/mj44442022/data-to-insight-draft/claude/ai-insights-banking-mvp-016tz6FaafyKw6oyRyPiyrkh/src/0_agent_ai_insight/app_v2_enhanced.py) |
| **app.py** | Original version (v1.0) | [Download](https://raw.githubusercontent.com/mj44442022/data-to-insight-draft/claude/ai-insights-banking-mvp-016tz6FaafyKw6oyRyPiyrkh/src/0_agent_ai_insight/app.py) |
| **requirements.txt** | Dependencies | [Download](https://raw.githubusercontent.com/mj44442022/data-to-insight-draft/claude/ai-insights-banking-mvp-016tz6FaafyKw6oyRyPiyrkh/src/0_agent_ai_insight/requirements.txt) |

---

## 🎓 Learn More

- [Full Enhancement Design](./ENHANCEMENT_DESIGN.md) - Complete 8-phase specification
- [Original README](./README.md) - Background and v1.0 documentation

---

**Ready to try it?** Run the app and ask a business question! 🚀
