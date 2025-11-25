# 🚀 Quick Start Guide

Get the Insight Generator Agent running in 5 minutes!

## Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `openai-agents`: Core agent framework
- `openai`: OpenAI API client
- `gradio`: Web UI
- `pandas`, `numpy`: Data analysis
- `e2b-code-interpreter`: Code execution (optional)
- Other supporting packages

## Step 2: Configure API Keys

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:

```bash
# Required
OPENAI_API_KEY=sk-...your-key-here...

# Optional (for full code interpreter mode)
E2B_API_KEY=...your-e2b-key...
```

### Getting API Keys

- **OpenAI API Key**: Get from https://platform.openai.com/api-keys
- **E2B API Key** (optional): Get from https://e2b.dev/
  - Without E2B, the app runs in "simplified mode" using pre-computed statistics
  - With E2B, the agent can execute Python code for deeper analysis

## Step 3: Verify Setup

```bash
python test_setup.py
```

This checks that:
- ✓ All packages are installed
- ✓ Project files are in place
- ✓ Data file can be loaded
- ✓ API keys are configured

## Step 4: Run the Application

### Option A: Gradio Web Interface (Recommended)

```bash
python src/app.py
```

Then open http://localhost:7860 in your browser.

**What you'll see:**
- Clean, chat-style interface
- Quick-start buttons for common analyses
- Real-time insight generation
- Business-friendly results

### Option B: Command-Line Interface

```bash
python src/cli.py
```

**What you'll see:**
- Interactive CLI
- Numbered quick-start options
- Type your own queries
- Immediate results in terminal

## Step 5: Try It Out!

Click one of the quick-start buttons or try these queries:

1. **Churn Analysis**:
   ```
   What patterns exist in churned customers?
   ```

2. **Revenue Drivers**:
   ```
   What factors correlate with higher revenue?
   ```

3. **Product Opportunities**:
   ```
   What cross-sell opportunities exist?
   ```

4. **Custom Query**:
   ```
   Which customer segments in Canada have the best retention?
   ```

## Expected Results

The agent will:
1. Analyze the banking customer data (24 sample records)
2. Detect trends and patterns
3. Generate insights like:
   - "Churn rate is 45.8%, with single-product customers at highest risk"
   - "Digital customers generate 12% more revenue"
   - "High Potential segment shows $142.50 average revenue"
4. Provide actionable recommendations

## Troubleshooting

### "OPENAI_API_KEY not found"
- Make sure you created `.env` file
- Check that your API key is correct
- Verify no extra spaces in the .env file

### "E2B_API_KEY not found"
- This is optional - the app will run in simplified mode
- To enable full mode, get an E2B key from https://e2b.dev/

### "Module not found" errors
- Run: `pip install -r requirements.txt`
- Make sure you're using Python 3.12+
- Try creating a virtual environment first

### Import errors for openai-agents
- The openai-agents package may not be publicly available yet
- The app will gracefully handle this and provide instructions

## Next Steps

1. **Explore the Code**:
   - `src/agents/` - Agent implementations
   - `src/utils/prompts.py` - Customize prompts
   - `src/app.py` - Gradio interface

2. **Use Your Own Data**:
   - Replace `data/sample_banking_data.csv`
   - Update prompts to match your schema
   - Run the agent on your data

3. **Extend the Agent**:
   - Add new analysis types
   - Customize insight formats
   - Integrate with your systems

## Demo Video (Conceptual Flow)

```
User clicks "Analyze Churn Patterns"
  ↓
Agent: "Analyzing customer data..."
  ↓
[In background: Statistical analysis runs]
  ↓
Agent: "Generating insights..."
  ↓
Result displayed:
  📊 INSIGHTS

  Churn Analysis - Key Findings:

  1. Overall churn rate: 45.8%
     - Well above industry benchmark of 25%
     - Immediate action required

  2. Single-product customers at highest risk:
     - 58% churn rate vs 32% for multi-product
     - Recommendation: Aggressive cross-sell in first 90 days

  3. Segment-specific patterns:
     - Low Total segment: 75% churn (critical)
     - High Potential segment: Only 18% churn
     - Action: Review Low Total retention programs
```

## Support

For issues or questions:
- Check the main [README.md](README.md) for detailed documentation
- Review [Vector Institute agent-bootcamp](https://github.com/VectorInstitute/agent-bootcamp) for agent patterns
- Ensure all dependencies are installed correctly

---

**You're all set! Enjoy generating insights! 🎉**
