"""
Insight Generator Agent - Transforms data analysis into business-friendly insights.
"""

from typing import Optional

try:
    from openai import agents
    AGENTS_AVAILABLE = True
except ImportError:
    AGENTS_AVAILABLE = False
    print("Warning: openai-agents not installed. Agent creation will fail.")

from ..utils import INSIGHT_GENERATOR_INSTRUCTIONS


def create_insight_generator_agent(
    openai_client,
    data_analyzer_agent: Optional[object] = None,
    model: str = "gpt-4o"
) -> object:
    """
    Create an Insight Generator Agent that produces business-friendly insights.

    This agent can either:
    1. Work with a Data Analyzer Agent (multi-agent pattern)
    2. Work independently with pre-analyzed data

    Args:
        openai_client: OpenAI client instance
        data_analyzer_agent: Optional Data Analyzer Agent to use as a tool
        model: Model to use (default: gpt-4o for high-quality insights)

    Returns:
        Agent instance configured for insight generation
    """
    if not AGENTS_AVAILABLE:
        raise ImportError(
            "Required packages not installed. "
            "Please install: pip install openai-agents"
        )

    # Build tools list
    tools = []

    if data_analyzer_agent:
        # Multi-agent pattern: Use data analyzer as a tool
        tools.append(
            data_analyzer_agent.as_tool(
                tool_name="analyze_data",
                tool_description=(
                    "Analyze banking customer data using statistical methods. "
                    "Provide a query describing what analysis to perform "
                    "(e.g., 'analyze churn patterns', 'identify revenue drivers'). "
                    "Returns structured analysis results with metrics and patterns."
                )
            )
        )

        enhanced_instructions = f"""{INSIGHT_GENERATOR_INSTRUCTIONS}

You have access to a Data Analyzer tool that can perform statistical analysis on customer data.

Workflow:
1. Use the analyze_data tool to get statistical insights on relevant dimensions
2. Interpret the analysis results in business context
3. Generate clear, actionable insights for business stakeholders
4. Organize insights by priority and business impact

Example usage:
- To understand churn: analyze_data("What patterns exist in churned vs retained customers?")
- To find revenue drivers: analyze_data("What factors correlate with higher revenue?")
- To identify opportunities: analyze_data("Which customer segments have the highest growth potential?")

Always ground your insights in the data analysis results.
"""
    else:
        # Standalone pattern: Work with provided analysis
        enhanced_instructions = f"""{INSIGHT_GENERATOR_INSTRUCTIONS}

You will receive data analysis results as input.
Your job is to transform statistical findings into clear, actionable business insights.

Focus on:
- Translating technical metrics into business language
- Identifying opportunities and risks
- Providing context and explanations
- Suggesting concrete next steps
"""

    # Create the agent
    agent = agents.Agent(
        name="InsightGenerator",
        instructions=enhanced_instructions,
        tools=tools,
        model=agents.OpenAIChatCompletionsModel(
            model=model,
            openai_client=openai_client
        )
    )

    return agent


def format_insights_for_display(raw_insights: str) -> str:
    """
    Format raw insights into a clean display format.

    Args:
        raw_insights: Raw insight text from the agent

    Returns:
        Formatted insights with proper structure
    """
    # Add visual separators and formatting
    formatted = "=" * 80 + "\n"
    formatted += "📊 INSIGHT GENERATOR RESULTS\n"
    formatted += "=" * 80 + "\n\n"
    formatted += raw_insights
    formatted += "\n\n" + "=" * 80

    return formatted
