"""Agent modules for the Insight Generator system."""

from .data_analyzer import create_data_analyzer_agent
from .insight_generator import create_insight_generator_agent

__all__ = [
    "create_data_analyzer_agent",
    "create_insight_generator_agent",
]
