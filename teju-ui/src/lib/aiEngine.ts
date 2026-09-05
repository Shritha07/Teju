const responses: Record<string, string[]> = {
  greeting: [
    "Hello! I'm **Teju**, your AI companion. I'm fully operational and ready to assist you with anything you need.\n\nHow can I help you today?",
  ],
  capabilities: [
    "I can help you with a wide range of tasks:\n\n- **Conversation** — natural dialogue and reasoning\n- **Code** — write, debug, and explain code\n- **Analysis** — break down complex problems\n- **Creative** — writing, brainstorming, design ideas\n- **Voice** — hold the `SPACE` bar to talk to me\n- **Focus Mode** — toggle distraction-free mode\n\nWhat would you like to explore?",
  ],
  code: [
    "Here's a clean example:\n\n```typescript\nfunction debounce<T extends (...args: any[]) => void>(\n  fn: T,\n  delay: number\n): (...args: Parameters<T>) => void {\n  let timer: ReturnType<typeof setTimeout>;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}\n```\n\nThis creates a debounced version of any function. Each call resets the timer, so `fn` only executes after `delay` ms of silence.",
  ],
  thinking: [
    "Let me think through this step by step.\n\nFirst, I need to understand the core question. Then I can break it down into smaller, manageable parts. Each part can be analyzed independently before synthesizing a complete answer.\n\nThe key insight here is that **structured thinking** leads to better outcomes than jumping to conclusions.",
  ],
  default: [
    "I understand. Let me process that for you.\n\nBased on what you've shared, here's my perspective: every great idea starts with a simple question. The fact that you're exploring this means you're already on the right path.\n\nWould you like me to elaborate on any particular aspect?",
    "That's an interesting point. Here's what I think:\n\n1. **Context matters** — understanding the full picture is essential\n2. **Iteration is key** — refine through feedback loops\n3. **Clarity emerges** — from structured exploration\n\nLet me know which direction you'd like to take this.",
    "Great question. I've processed your input and here's my response:\n\nThe intersection of curiosity and capability is where innovation lives. You're asking the right questions, and that's the most important step.\n\nWhat would you like to dive deeper into?",
  ],
};

export function generateResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.match(/hello|hi|hey|greet/)) return responses.greeting[0];
  if (lower.match(/what can you|capab|help|feature/))
    return responses.capabilities[0];
  if (lower.match(/code|function|program|script|debounce/))
    return responses.code[0];
  if (lower.match(/think|analyz|reason|step/)) return responses.thinking[0];
  return responses.default[Math.floor(Math.random() * responses.default.length)];
}

export async function* streamResponse(
  text: string,
): AsyncGenerator<string, void, unknown> {
  const tokens = text.split(/(\s+)/);
  for (const token of tokens) {
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 40));
    yield token;
  }
}

export const suggestedPrompts = [
  'What can you do?',
  'Show me a code example',
  'Explain quantum computing',
  'Help me brainstorm',
  'Write a poem about space',
  'Analyze my productivity',
];
