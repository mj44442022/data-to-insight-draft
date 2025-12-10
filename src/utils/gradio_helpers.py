"""Gradio helper functions for streaming agent events."""

from typing import List
from gradio.components.chatbot import ChatMessage
import agents


def agent_stream_to_gradio_messages(event) -> List[ChatMessage]:
    """Convert agent stream events to Gradio ChatMessage format.

    Args:
        event: Event from agents.Runner.run_streamed().stream_events()

    Returns:
        List of ChatMessage objects for Gradio ChatInterface
    """
    messages = []

    # Handle different event types from the Anthropic Agents SDK
    if hasattr(event, 'type'):
        event_type = event.type

        # Agent thinking/reasoning
        if event_type == 'text_delta':
            if hasattr(event, 'text'):
                messages.append(ChatMessage(role="assistant", content=event.text))

        # Agent tool use
        elif event_type == 'tool_use':
            if hasattr(event, 'name'):
                tool_name = event.name
                messages.append(ChatMessage(
                    role="assistant",
                    content=f"🔧 Using tool: {tool_name}..."
                ))

        # Tool results
        elif event_type == 'tool_result':
            # Don't show raw tool results, let the agent format them
            pass

        # Final output
        elif event_type == 'final_output':
            if hasattr(event, 'output'):
                messages.append(ChatMessage(role="assistant", content=event.output))

    return messages
