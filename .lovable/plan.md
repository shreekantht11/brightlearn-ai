

# AI Chatbot UI/UX Enhancement Plan

## New Features & Improvements

### 1. Animated Typing Indicator
Replace the static "Thinking..." loader with animated bouncing dots (3 dots with staggered animation), more visually appealing and ChatGPT-like.

### 2. Markdown Rendering for AI Responses
Install `react-markdown` and render AI messages with markdown support — bold, lists, code blocks, links — making responses much more readable.

### 3. Message Actions (Copy, Regenerate)
Add hover-revealed action buttons on AI messages:
- **Copy** button to copy message text
- **Regenerate** button on the last AI message to retry

### 4. Clear Chat / New Conversation
Add a small "clear chat" button in the header to reset the conversation.

### 5. Chat History Counter & Unread Badge
Show an unread message count badge on the floating button when the panel is closed and a new AI response arrives.

### 6. Expandable / Resizable Panel
Add a maximize toggle button in the header to expand the chat to a larger overlay (e.g., 600px tall, wider), better for reading long responses.

### 7. Enhanced Typing Experience
- Auto-resize textarea (multi-line input) instead of single-line input
- Shift+Enter for new lines, Enter to send
- Character count indicator

### 8. Welcome Screen with Quick Actions
When there's only the initial greeting message, show a grid of 4 quick-action cards (not just text chips) with icons:
- "Explain a concept" (BookOpen icon)
- "Help me practice" (Target icon)
- "Find a course" (Search icon)
- "Track my progress" (BarChart icon)

### 9. Animated Open/Close FAB
- Morph animation on the floating button (MessageCircle → X with rotation)
- Pulse ring animation on the FAB when idle to draw attention (stops after first open)

### 10. Visual Polish
- Glassmorphism on the panel (backdrop-blur, subtle border)
- Gradient accent line below the header
- Smoother spring-based panel open/close animation
- AI avatar with a subtle glow/pulse when responding

## Technical Approach

**Files to modify:**
- `src/components/AIChatPanel.tsx` — All UI changes above

**New dependency:**
- `react-markdown` — for rendering AI responses with formatting

**No other files affected.** All changes are self-contained in the chat panel component.

