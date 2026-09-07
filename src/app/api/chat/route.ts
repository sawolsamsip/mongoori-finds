import { spawn } from 'child_process';

const CLAUDE_BIN = '/home/bosgame/.nvm/versions/node/v22.22.2/bin/claude';

const SYSTEM_PROMPT =
  'You are a helpful shopping assistant for Mongoori Finds, specializing in Tesla maintenance essentials (cabin filters, wipers, key cards, cleaning kits) tested by a real rental fleet in California. Help users find the right products for their Model 3 or Model Y. Be concise and friendly.';

export async function POST(req: Request) {
  const { message } = await req.json();
  if (!message || typeof message !== 'string' || message.length > 2000) {
    return new Response('Invalid message', { status: 400 });
  }

  const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${message.trim()}\n\nAssistant:`;

  const stream = new ReadableStream({
    start(controller) {
      const proc = spawn(CLAUDE_BIN, ['--print', '-p', fullPrompt], {
        env: { ...process.env, HOME: '/home/bosgame' },
      });

      proc.stdout.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
      });

      proc.on('close', () => {
        controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
        controller.close();
      });

      proc.on('error', () => {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Claude unavailable' })}\n\n`));
        controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
