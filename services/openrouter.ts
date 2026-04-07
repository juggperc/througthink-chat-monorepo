import { MCP_TOOLS } from './mcp';

export type OpenRouterContent = string | { type: 'text', text: string } | { type: 'image_url', image_url: { url: string } };

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: OpenRouterContent[] | string;
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

export async function* streamOpenRouterResponse(
  messages: OpenRouterMessage[],
  apiKey: string,
  model: string
): AsyncGenerator<any, void, unknown> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.href, // Required by OpenRouter
      'X-Title': 'Throughthink Chat', // Required by OpenRouter
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: true,
      tools: MCP_TOOLS
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || `API Error: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let toolCalls: any[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last potentially incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const delta = data.choices && data.choices[0] && data.choices[0].delta;
            
            if (!delta) continue;

            if (delta.content) {
              yield { type: 'content', content: delta.content };
            }

            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (!toolCalls[tc.index]) {
                  toolCalls[tc.index] = { 
                    id: tc.id, 
                    type: 'function', 
                    function: { name: tc.function.name, arguments: '' } 
                  };
                }
                if (tc.function.arguments) {
                  toolCalls[tc.index].function.arguments += tc.function.arguments;
                }
              }
            }
          } catch (e) {
            console.warn('Error parsing stream data', e, line);
          }
        }
      }
    }

    if (toolCalls.length > 0) {
      yield { type: 'tool_calls', toolCalls: toolCalls.filter(Boolean) };
    }
  } finally {
    reader.releaseLock();
  }
}
