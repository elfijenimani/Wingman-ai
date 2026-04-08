export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || !question.trim()) {
      return Response.json(
        { error: 'Question is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: 'OPENAI_API_KEY is missing.' },
        { status: 500 }
      );
    }

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content:
                'You are Wingman AI, a helpful airport and travel assistant. Give clear, short, and useful answers.',
            },
            {
              role: 'user',
              content: question,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error:
            data?.error?.message || 'AI request failed.',
        },
        { status: response.status }
      );
    }

    const answer =
      data?.choices?.[0]?.message?.content || 'No answer received.';

    return Response.json({ answer });
  } catch (error) {
    return Response.json(
      { error: 'Something went wrong while processing the request.' },
      { status: 500 }
    );
  }
}