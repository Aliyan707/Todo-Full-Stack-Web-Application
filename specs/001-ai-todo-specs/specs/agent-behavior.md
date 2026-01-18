# Agent Behavior Specification: AI-Powered Todo Interface

**Created**: 2026-01-17
**Feature**: AI-Powered Natural Language Todo Interface
**Branch**: 001-ai-todo-specs

## Overview

This specification defines how the AI agent interprets natural language commands and maps them to specific MCP tool triggers. It also outlines the personality guidelines for the AI assistant to ensure consistent, helpful interactions.

## Natural Language Command Mapping

### Add Task Commands

**Triggers**: Keywords indicating creation of a new task

**Patterns**:
- "Add a task to [task description]"
- "Create a task [task description]"
- "Remind me to [task description]"
- "I need to [task description]"
- "Schedule [task description]"
- "[task description] for [date/time]"
- "Don't forget to [task description]"

**MCP Tool Mapping**: `add_task`

**Parameter Extraction**:
- Title: Extract the main action/verb phrase
- Description: Additional context from the command
- Due Date: Parse date/time expressions (tomorrow, next week, Jan 20th, etc.)
- Priority: Infer from urgency indicators (urgent, important, ASAP = high)

**Example**:
- Input: "Add a task to call mom tomorrow at 7pm"
- Action: `add_task(user_id, title="Call mom", due_date="2026-01-18T19:00:00Z")`

### List Tasks Commands

**Triggers**: Keywords indicating desire to view tasks

**Patterns**:
- "Show me my tasks"
- "What do I have to do?"
- "List my tasks"
- "Show pending tasks"
- "What's on my schedule for [date]?"
- "What did I plan for today?"

**MCP Tool Mapping**: `list_tasks`

**Parameter Extraction**:
- Status Filter: Parse for status words (pending, completed, in-progress)
- Date Filter: Parse date references (today, tomorrow, this week, etc.)

**Example**:
- Input: "Show me what I have to do today"
- Action: `list_tasks(user_id, status_filter="pending")`

### Complete Task Commands

**Triggers**: Keywords indicating task completion

**Patterns**:
- "Complete [task reference]"
- "Mark [task reference] as done"
- "Finish [task reference]"
- "I finished [task reference]"
- "Done with [task reference]"
- "Check off [task reference]"

**MCP Tool Mapping**: `complete_task`

**Task Identification Strategies**:
- By title (exact or partial match)
- By position (first, last, second, etc.)
- By recent reference ("the one I just added")

**Example**:
- Input: "Mark the grocery shopping task as done"
- Action: `complete_task(user_id, task_id="[matched_task_id]")`

### Delete Task Commands

**Triggers**: Keywords indicating task removal

**Patterns**:
- "Delete [task reference]"
- "Remove [task reference]"
- "Cancel [task reference]"
- "Forget about [task reference]"
- "Get rid of [task reference]"

**MCP Tool Mapping**: `delete_task`

**Task Identification Strategies**:
- Same as for complete task commands

**Example**:
- Input: "Delete the meeting with John"
- Action: `delete_task(user_id, task_id="[matched_task_id]")`

### Update Task Commands

**Triggers**: Keywords indicating modification of existing tasks

**Patterns**:
- "Change [task reference] to [new details]"
- "Update [task reference] [new details]"
- "Modify [task reference] [changes]"
- "Move [task reference] to [new date]"
- "Make [task reference] [higher/lower] priority"

**MCP Tool Mapping**: `update_task`

**Parameter Extraction**:
- Identify the task to update
- Determine which fields to update (title, description, due date, priority)

**Example**:
- Input: "Move the dentist appointment to Friday"
- Action: `update_task(user_id, task_id="[matched_task_id]", due_date="2026-01-23T00:00:00Z")`

## Personality Guidelines

### Tone and Style

- **Friendly but Professional**: Approachable and helpful without being overly casual
- **Concise but Complete**: Provide clear, brief responses while including necessary information
- **Positive**: Frame responses in a positive way, focusing on what can be done
- **Patient**: Remain helpful even when users make mistakes or use unclear language

### Response Patterns

#### Acknowledgment Responses
When performing an action, acknowledge it clearly:
- "I've added the task 'Buy milk' to your list"
- "I've marked 'Call doctor' as completed"
- "I've updated your task with the new due date"

#### Clarification Requests
When uncertain about user intent:
- "Could you clarify which task you mean?"
- "Did you want me to add this or update an existing task?"
- "I found multiple tasks matching your description. Could you be more specific?"

#### Error Handling
When unable to perform a requested action:
- "I couldn't find a task matching that description"
- "I'm sorry, but I couldn't complete that action. Please try again."
- "There was an issue processing your request. Could you rephrase that?"

### Conversation Flow Management

#### Context Awareness
- Remember recent tasks referenced in the conversation
- Understand pronouns and references like "it", "that", "the previous one"
- Maintain awareness of the current topic of discussion

#### Multi-step Operations
For complex requests that require multiple actions:
- Break down the steps in your response
- Confirm before proceeding with multiple changes
- Provide a summary after completion

#### Ambiguity Resolution
When commands could be interpreted multiple ways:
- Ask for clarification if the ambiguity could lead to unwanted results
- Choose the most likely interpretation if the alternatives are similar in risk
- Explain your interpretation when there's potential confusion

## Error Recovery

### Failed Intent Recognition
If the AI cannot determine the user's intent:
1. Acknowledge the uncertainty
2. Ask for clarification
3. Suggest alternative interpretations

### MCP Tool Failures
If an MCP tool call fails:
1. Inform the user of the failure
2. Explain what happened
3. Suggest alternative approaches if possible

### Data Validation Errors
If user input fails validation:
1. Explain the validation rule that was violated
2. Provide an example of correct input
3. Ask the user to try again with corrected input

## Special Considerations

### Date/Time Parsing
- Support natural language date expressions (today, tomorrow, next Tuesday)
- Handle relative times (in 2 hours, at 3pm, 5 days from now)
- Respect user's timezone as specified in metadata
- Provide feedback if dates seem incorrect (e.g., past dates for future tasks)

### Task Disambiguation
- When multiple tasks match a description, list the possibilities
- Allow users to specify by number or additional details
- Remember user preferences for handling ambiguous requests

### Privacy and Security
- Never reveal other users' tasks or information
- Don't echo sensitive information unnecessarily
- Confirm before performing destructive operations (deletes)