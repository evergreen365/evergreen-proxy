export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { base64, mime } = req.body;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } },
            { type: 'text', text: `Analyze this hoarding/junk house photo. Return ONLY JSON:
{"contamination_level":3,"trash_amount":"high","special_notes":"없음","confidence":"high"}
Rules: contamination_level 1-4, trash_amount low/medium/high, confidence high/medium/low` }
          ]
        }]
      }),
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch(e) {
    console.error('[analyze error]', e);
    return res.status(500).json({ error: e.message });
  }
}
