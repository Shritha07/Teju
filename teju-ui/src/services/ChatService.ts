import { askAI } from "./AIService";

export async function submitChat(
  text: string,
  messages: { role: string; content: string }[],
) {
  const messagesToSend = [
    {
      role: "system",
      content: `You are Teju, an advanced local AI assistant.
You remember the conversation provided in the messages.
Always answer based on the conversation history.
Be friendly, intelligent and concise.`,
    },
    ...messages,
    {
      role: "user",
      content: text,
    },
  ];

  return await askAI(messagesToSend);
}
