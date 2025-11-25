"""
Insight Generator Agent - Gradio Demo Application

This application demonstrates the Insight Generator Agent's ability to:
1. Analyze banking customer data
2. Detect trends and patterns
3. Generate business-friendly insights
"""

import os
import sys
from pathlib import Path
from typing import Optional, List, Tuple

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import gradio as gr
    from openai import OpenAI
    from openai import agents
    from dotenv import load_dotenv
    DEPENDENCIES_AVAILABLE = True
except ImportError as e:
    DEPENDENCIES_AVAILABLE = False
    print(f"Error importing dependencies: {e}")
    print("Please install: pip install -r requirements.txt")

from src.agents import create_data_analyzer_agent, create_insight_generator_agent
from src.utils import QUICK_ANALYSIS_QUERIES


class InsightGeneratorApp:
    """Main application class for the Insight Generator Agent."""

    def __init__(self, data_file_path: str):
        """
        Initialize the Insight Generator application.

        Args:
            data_file_path: Path to the banking data CSV file
        """
        self.data_file_path = data_file_path

        # Load environment variables
        load_dotenv()

        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("OPENAI_BASE_URL")

        if not api_key:
            raise ValueError(
                "OPENAI_API_KEY not found. "
                "Please set it in your .env file or environment."
            )

        self.openai_client = OpenAI(
            api_key=api_key,
            base_url=base_url if base_url else None
        )

        # Model configuration
        self.analyzer_model = os.getenv("MODEL_ANALYZER", "gpt-4o-mini")
        self.insight_model = os.getenv("MODEL_INSIGHT_GENERATOR", "gpt-4o")

        # Initialize agents
        self.data_analyzer = None
        self.insight_generator = None
        self.use_mock = False

        self._initialize_agents()

    def _initialize_agents(self):
        """Initialize the agent system."""
        try:
            # Try to create real agents
            e2b_key = os.getenv("E2B_API_KEY")

            if e2b_key:
                print("Initializing agents with E2B code interpreter...")
                self.data_analyzer = create_data_analyzer_agent(
                    self.openai_client,
                    self.data_file_path,
                    model=self.analyzer_model
                )

                self.insight_generator = create_insight_generator_agent(
                    self.openai_client,
                    data_analyzer_agent=self.data_analyzer,
                    model=self.insight_model
                )
                print("✓ Agents initialized successfully!")
            else:
                print("⚠ E2B_API_KEY not found - using simplified mode")
                self.use_mock = True
                self._initialize_simplified_mode()

        except Exception as e:
            print(f"⚠ Error initializing agents: {e}")
            print("Falling back to simplified mode...")
            self.use_mock = True
            self._initialize_simplified_mode()

    def _initialize_simplified_mode(self):
        """Initialize simplified mode without code interpreter."""
        # Create insight generator without data analyzer
        self.insight_generator = create_insight_generator_agent(
            self.openai_client,
            data_analyzer_agent=None,
            model=self.insight_model
        )

    def generate_insights(
        self,
        query: str,
        history: Optional[List] = None
    ) -> Tuple[str, List]:
        """
        Generate insights based on user query.

        Args:
            query: User's analysis request
            history: Chat history (for Gradio)

        Returns:
            Tuple of (response, updated_history)
        """
        if not query.strip():
            return "Please enter a query.", history or []

        try:
            if self.use_mock or not self.data_analyzer:
                # Simplified mode: Direct insight generation
                response = self._generate_insights_simplified(query)
            else:
                # Full mode: Multi-agent workflow
                response = self._generate_insights_full(query)

            # Update history
            if history is None:
                history = []
            history.append({"role": "user", "content": query})
            history.append({"role": "assistant", "content": response})

            return response, history

        except Exception as e:
            error_msg = f"Error generating insights: {str(e)}"
            print(error_msg)
            return error_msg, history or []

    def _generate_insights_full(self, query: str) -> str:
        """Generate insights using full multi-agent workflow."""
        print(f"\n{'='*60}")
        print(f"Query: {query}")
        print(f"{'='*60}\n")

        # Run the insight generator (which will call data analyzer as needed)
        result = agents.Runner.run(
            self.insight_generator,
            input=query
        )

        response = result.final_output

        print(f"\n{'='*60}")
        print("Insights generated successfully!")
        print(f"{'='*60}\n")

        return response

    def _generate_insights_simplified(self, query: str) -> str:
        """Generate insights in simplified mode with sample analysis."""
        # Create a sample analysis based on the query
        sample_analysis = self._get_sample_analysis(query)

        # Generate insights from the sample analysis
        full_prompt = f"""Based on the following analysis of banking customer data,
generate business-friendly insights:

{sample_analysis}

User's specific question: {query}

Provide clear, actionable insights that business leaders can understand and act upon.
"""

        result = agents.Runner.run(
            self.insight_generator,
            input=full_prompt
        )

        return result.final_output

    def _get_sample_analysis(self, query: str) -> str:
        """Get sample analysis data based on query type."""
        # Load and provide basic stats from the actual CSV file
        try:
            import pandas as pd
            df = pd.read_csv(self.data_file_path)

            analysis = f"""
=== DATASET OVERVIEW ===
Total customers: {len(df)}
Countries: {df['country_name'].nunique()} ({', '.join(df['country_name'].unique())})
Regions: {df['region'].nunique()} ({', '.join(df['region'].unique())})
Segments: {', '.join(df['segment'].unique())}

=== KEY METRICS ===
Overall churn rate: {df['is_churned'].mean():.1%}
Average revenue per customer: ${df['total_revenues'].mean():.2f}
Average products per customer: {df['product_count'].mean():.1f}
Digital adoption rate: {df['is_digital'].mean():.1%}

=== SEGMENT ANALYSIS ===
{df.groupby('segment').agg({
    'client_hash_id': 'count',
    'is_churned': lambda x: f"{x.mean():.1%}",
    'total_revenues': lambda x: f"${x.mean():.2f}",
    'product_count': 'mean'
}).rename(columns={
    'client_hash_id': 'Customers',
    'is_churned': 'Churn Rate',
    'total_revenues': 'Avg Revenue',
    'product_count': 'Avg Products'
}).to_string()}

=== PRODUCT HOLDINGS ===
Credit Card: {df['has_open_credit_card'].sum()} customers ({df['has_open_credit_card'].mean():.1%})
Checking Account: {df['has_open_checking_account'].sum()} customers ({df['has_open_checking_account'].mean():.1%})
High Yield Savings: {df['has_open_high_yield_savings'].sum()} customers ({df['has_open_high_yield_savings'].mean():.1%})
Personal Loan: {df['has_open_personal_loan'].sum()} customers ({df['has_open_personal_loan'].mean():.1%})
Mortgage: {df['has_open_mortgage'].sum()} customers ({df['has_open_mortgage'].mean():.1%})

=== CHURN ANALYSIS ===
Churned customers: {df['is_churned'].sum()} ({df['is_churned'].mean():.1%})
Avg revenue (churned): ${df[df['is_churned']==True]['total_revenues'].mean():.2f}
Avg revenue (retained): ${df[df['is_churned']==False]['total_revenues'].mean():.2f}
Avg products (churned): {df[df['is_churned']==True]['product_count'].mean():.1f}
Avg products (retained): {df[df['is_churned']==False]['product_count'].mean():.1f}

=== DIGITAL CORRELATION ===
Digital customers: {df['is_digital'].sum()} ({df['is_digital'].mean():.1%})
Avg revenue (digital): ${df[df['is_digital']==True]['total_revenues'].mean():.2f}
Avg revenue (non-digital): ${df[df['is_digital']==False]['total_revenues'].mean():.2f}
Churn rate (digital): {df[df['is_digital']==True]['is_churned'].mean():.1%}
Churn rate (non-digital): {df[df['is_digital']==False]['is_churned'].mean():.1%}
"""
            return analysis

        except Exception as e:
            print(f"Error loading data: {e}")
            return "Error loading sample data for analysis."


def create_gradio_interface(app: InsightGeneratorApp) -> gr.Blocks:
    """
    Create the Gradio interface for the Insight Generator.

    Args:
        app: InsightGeneratorApp instance

    Returns:
        Gradio Blocks interface
    """
    with gr.Blocks(
        title="Scotiabank Insight Generator Agent",
        theme=gr.themes.Soft()
    ) as demo:
        gr.Markdown("""
        # 📊 Scotiabank Insight Generator Agent

        This AI agent analyzes banking customer data and generates actionable business insights.

        **What it does:**
        - 🔍 Detects trends in customer behavior, revenue, and churn
        - 📈 Identifies correlations between products, segments, and performance
        - 💡 Generates business-friendly insights with recommended actions
        - 🎯 Focuses on revenue opportunities and retention risks
        """)

        with gr.Row():
            with gr.Column(scale=1):
                gr.Markdown("### 🚀 Quick Start Queries")
                gr.Markdown("Click a button below or type your own query:")

                churn_btn = gr.Button("🔴 Analyze Churn Patterns", size="sm")
                revenue_btn = gr.Button("💰 Revenue Drivers", size="sm")
                products_btn = gr.Button("🏦 Product Opportunities", size="sm")
                segments_btn = gr.Button("👥 Segment Performance", size="sm")
                regions_btn = gr.Button("🌎 Regional Trends", size="sm")
                digital_btn = gr.Button("📱 Digital Impact", size="sm")

            with gr.Column(scale=2):
                chatbot = gr.Chatbot(
                    label="Insights",
                    height=500,
                    type="messages"
                )

                with gr.Row():
                    query_input = gr.Textbox(
                        label="Your Query",
                        placeholder="Ask anything about the customer data...",
                        lines=2,
                        scale=4
                    )
                    submit_btn = gr.Button("Generate Insights", variant="primary", scale=1)

                gr.Markdown("""
                **Example queries:**
                - What factors contribute most to customer churn?
                - Which customer segments should we prioritize for growth?
                - What cross-sell opportunities exist in our customer base?
                - How does digital adoption impact customer lifetime value?
                """)

        # State to track conversation history
        state = gr.State([])

        # Define interaction logic
        def handle_query(query, history):
            """Handle user query and generate insights."""
            response, updated_history = app.generate_insights(query, history)
            return updated_history, updated_history, ""

        # Connect quick start buttons
        churn_btn.click(
            lambda h: handle_query(QUICK_ANALYSIS_QUERIES["churn"], h),
            inputs=[state],
            outputs=[chatbot, state, query_input]
        )

        revenue_btn.click(
            lambda h: handle_query(QUICK_ANALYSIS_QUERIES["revenue"], h),
            inputs=[state],
            outputs=[chatbot, state, query_input]
        )

        products_btn.click(
            lambda h: handle_query(QUICK_ANALYSIS_QUERIES["products"], h),
            inputs=[state],
            outputs=[chatbot, state, query_input]
        )

        segments_btn.click(
            lambda h: handle_query(QUICK_ANALYSIS_QUERIES["segments"], h),
            inputs=[state],
            outputs=[chatbot, state, query_input]
        )

        regions_btn.click(
            lambda h: handle_query(QUICK_ANALYSIS_QUERIES["regions"], h),
            inputs=[state],
            outputs=[chatbot, state, query_input]
        )

        digital_btn.click(
            lambda h: handle_query(QUICK_ANALYSIS_QUERIES["digital"], h),
            inputs=[state],
            outputs=[chatbot, state, query_input]
        )

        # Connect text input and submit button
        submit_btn.click(
            handle_query,
            inputs=[query_input, state],
            outputs=[chatbot, state, query_input]
        )

        query_input.submit(
            handle_query,
            inputs=[query_input, state],
            outputs=[chatbot, state, query_input]
        )

        gr.Markdown("""
        ---
        **💡 Tip:** The agent analyzes actual customer data including demographics, product holdings,
        financial metrics, and behavioral indicators to generate insights.
        """)

    return demo


def main():
    """Main entry point for the application."""
    # Get data file path
    data_file = Path(__file__).parent.parent / "data" / "sample_banking_data.csv"

    if not data_file.exists():
        print(f"Error: Data file not found at {data_file}")
        print("Please ensure sample_banking_data.csv exists in the data/ directory.")
        return

    print("=" * 60)
    print("Scotiabank Insight Generator Agent")
    print("=" * 60)
    print(f"\nData file: {data_file}")
    print(f"Loading application...\n")

    # Create application
    app = InsightGeneratorApp(str(data_file))

    # Create and launch Gradio interface
    demo = create_gradio_interface(app)

    print("\n" + "=" * 60)
    print("🚀 Launching Gradio interface...")
    print("=" * 60 + "\n")

    demo.launch(
        share=False,
        server_name="0.0.0.0",
        server_port=7860
    )


if __name__ == "__main__":
    if not DEPENDENCIES_AVAILABLE:
        print("\n❌ Missing dependencies. Please install:")
        print("   pip install -r requirements.txt")
        print("\nThen create a .env file with your API keys:")
        print("   cp .env.example .env")
        sys.exit(1)

    main()
