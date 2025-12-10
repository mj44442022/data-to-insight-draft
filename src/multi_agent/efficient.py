"""Multi-Agent Business Insight System - Planner-Worker Architecture.

This module implements a multi-agent system where:
- Main/Planner Agent: Decides when to invoke the business insight worker
- Business Insight Worker Agent: Performs the actual data analysis (layers 2-5)

Based on the Vector Institute Agent Bootcamp efficient multi-agent pattern.
"""

import asyncio
import contextlib
import signal
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import agents
import gradio as gr
from dotenv import load_dotenv
from gradio.components.chatbot import ChatMessage
from openai import AsyncOpenAI

from prompts.react_instructions import REACT_INSTRUCTIONS
from utils import agent_stream_to_gradio_messages
from multi_agent.business_insight_worker import analyze_business_insight
from multi_agent.data_overview_agent import get_data_overview


# ============================================================================
# CONFIGURATION
# ============================================================================

load_dotenv(verbose=True)

print("✅ Multi-Agent Business Insight System initializing...")

# LLM Models
AGENT_LLM_NAMES = {
    "worker": "gemini-2.0-flash-exp",  # Fast model for worker
    "planner": "gemini-2.0-flash-exp",  # Same model for planner (can upgrade to pro if needed)
}

# Initialize async OpenAI client
async_openai_client = None


# ============================================================================
# CLIENT MANAGEMENT
# ============================================================================

async def _cleanup_clients() -> None:
    """Close async clients gracefully."""
    if async_openai_client:
        await async_openai_client.close()


def _handle_sigint(signum: int, frame: object) -> None:
    """Handle SIGINT signal to gracefully shutdown."""
    with contextlib.suppress(Exception):
        asyncio.get_event_loop().run_until_complete(_cleanup_clients())
    sys.exit(0)


# ============================================================================
# AGENT DEFINITIONS
# ============================================================================

def create_agents(openai_client: AsyncOpenAI):
    """Create the data overview, business insight, and planner agents.

    Args:
        openai_client: Async OpenAI client for LLM calls

    Returns:
        Tuple of (data_overview_agent, business_insight_worker_agent, main_planner_agent)
    """

    # Data Overview Agent - Fast schema overview
    # This agent wraps the get_data_overview function as a tool
    data_overview_agent = agents.Agent(
        name="DataOverviewAgent",
        instructions=(
            "You are the Data Overview Agent for Scotiabank. "
            "Your job is to provide a quick schema overview of the available banking data. "
            "Call the get_data_overview function and return the formatted schema overview."
        ),
        tools=[
            agents.function_tool(get_data_overview),
        ],
        model=agents.OpenAIChatCompletionsModel(
            model=AGENT_LLM_NAMES["worker"],
            openai_client=openai_client
        ),
    )

    # Business Insight Worker Agent - Deep analysis (Layers 2-5)
    # This agent wraps the analyze_business_insight function as a tool
    business_insight_worker_agent = agents.Agent(
        name="BusinessInsightWorker",
        instructions=(
            "You are the Business Insight Worker Agent for Scotiabank. "
            "You receive a business question about banking data and perform a "
            "multi-layer analysis: plan, code generation, execution, and insights. "
            "Your job is to call the analyze_business_insight function with the user's question "
            "and return the executive-friendly insights it produces."
        ),
        tools=[
            agents.function_tool(analyze_business_insight),
        ],
        model=agents.OpenAIChatCompletionsModel(
            model=AGENT_LLM_NAMES["worker"],
            openai_client=openai_client
        ),
    )

    # Main Planner Agent
    # This agent decides when to invoke which worker
    main_planner_agent = agents.Agent(
        name="MainPlannerAgent",
        instructions=REACT_INSTRUCTIONS,
        tools=[
            data_overview_agent.as_tool(
                tool_name="data_overview",
                tool_description=(
                    "Provides a quick schema overview of available Scotiabank banking data. "
                    "Returns formatted information about total customers, numeric metrics, "
                    "boolean flags, and categorical columns. Use this for questions like "
                    "'What data is available?' or 'Show me the dataset schema.'"
                ),
            ),
            business_insight_worker_agent.as_tool(
                tool_name="business_insight_worker",
                tool_description=(
                    "Performs comprehensive business insight analysis on Scotiabank banking data. "
                    "Pass the user's question directly to this tool. It will handle planning, "
                    "code generation, execution, and insight generation. Returns executive-friendly "
                    "business insights with methodology, key findings, and business implications. "
                    "Use this for analysis questions like 'Compare X by Y' or 'Show correlation between A and B.'"
                ),
            )
        ],
        model=agents.OpenAIChatCompletionsModel(
            model=AGENT_LLM_NAMES["planner"],
            openai_client=openai_client
        ),
    )

    return data_overview_agent, business_insight_worker_agent, main_planner_agent


# ============================================================================
# MAIN EXECUTION LOOP
# ============================================================================

async def _main(question: str, gr_messages: list[ChatMessage]):
    """Main async function that processes user questions.

    Args:
        question: User's question
        gr_messages: Gradio message history

    Yields:
        Updated Gradio messages as the agent processes the question
    """
    global async_openai_client

    # Create agents (data overview, business insight, and main planner)
    _, _, main_agent = create_agents(async_openai_client)

    try:
        # Run the main planner agent
        result_stream = agents.Runner.run_streamed(main_agent, input=question)

        # Stream events to Gradio
        async for event in result_stream.stream_events():
            new_messages = agent_stream_to_gradio_messages(event)
            gr_messages += new_messages
            if len(gr_messages) > 0:
                yield gr_messages

        # Final output
        if hasattr(result_stream, 'final_output') and result_stream.final_output:
            gr_messages.append(ChatMessage(
                role="assistant",
                content=result_stream.final_output
            ))
            yield gr_messages

    except Exception as e:
        print(f"❌ Error in main agent execution: {e}")
        import traceback
        traceback.print_exc()
        gr_messages.append(ChatMessage(
            role="assistant",
            content=f"⚠️ An error occurred: {str(e)}\n\nPlease try again or rephrase your question."
        ))
        yield gr_messages


# ============================================================================
# GRADIO INTERFACE
# ============================================================================

demo = gr.ChatInterface(
    _main,
    title="🏦 Scotiabank Multi-Agent Business Insight System",
    description="""
    **Intelligent Multi-Agent System for Banking Analytics**

    This system uses a dual-worker architecture for optimal efficiency:
    - **Main Planner**: Routes questions to the appropriate specialist
    - **Data Overview Agent**: Fast schema/overview (for "what data" questions)
    - **Business Insight Worker**: Deep analysis (Plan → Code → Execute → Insights)

    **For data overview queries:**
    - Returns quick schema with metrics, flags, and segments

    **For analysis queries:**
    1. 📋 Planning - Methodology design
    2. 💻 Code Generation - Custom analysis code
    3. ⚡ Execution - Safe code execution
    4. 📊 Insights - Executive-friendly results

    **Try asking:**
    - "What data is available?" (fast overview)
    - "Compare clients with payroll vs without payroll" (deep analysis)
    - "How does mortgage ownership affect revenue by country?" (deep analysis)
    - "Show correlation between revenue and loans" (deep analysis)
    """,
    examples=[
        "What information is available?",
        "Compare clients with payroll vs without payroll",
        "How does mortgage ownership affect revenue by country?",
        "Show me correlation between revenue and loans",
        "Analyze revenue patterns across different countries",
    ],
    type="messages",
    theme=gr.themes.Soft()
)


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*80)
    print("🚀 SCOTIABANK MULTI-AGENT BUSINESS INSIGHT SYSTEM")
    print("="*80)
    print("   Architecture: Dual-Worker Multi-Agent System")
    print("   - Data Overview Agent: Fast schema overview")
    print("   - Business Insight Agent: Deep analysis (Layers 2-5)")
    print("   - Main Planner: Intelligent routing and orchestration")
    print("="*80 + "\n")

    # Initialize async OpenAI client
    async_openai_client = AsyncOpenAI()

    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, _handle_sigint)

    try:
        print("🌐 Launching Gradio interface...")
        demo.launch(
            server_name="0.0.0.0",
            server_port=7866,  # Different port from original agent
            share=True
        )
    finally:
        print("\n🛑 Shutting down...")
        asyncio.run(_cleanup_clients())
        print("✅ Cleanup complete")
