export async function askAI(messages: any[]) {
  const response = await fetch('/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen3:4b',
      stream: false,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();

  return data.choices?.[0]?.message?.content ?? 'No response received.';
}