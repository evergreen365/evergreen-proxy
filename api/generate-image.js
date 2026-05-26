export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { base64 } = req.body;
    const buffer = Buffer.from(base64, 'base64');
    const blob = new Blob([buffer], { type: 'image/jpeg' });

    const fd = new FormData();
    fd.append('model', 'gpt-image-1');
    fd.append('image[]', blob, 'image.jpg');
    fd.append('prompt', 'Remove all trash, garbage bags, cardboard boxes from the floor. Keep walls, furniture, and room structure identical. Result: same room, clean floor only.');
    fd.append('n', '1');
    fd.append('size', '1024x1024');

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_KEY}` },
      body: fd,
    });

    const text = await response.text();
    console.log('[img] status:', response.status, 'body:', text.slice(0, 300));

    try {
      return res.status(200).json(JSON.parse(text));
    } catch {
      return res.status(response.status).json({ error: text.slice(0, 200) });
    }
  } catch(e) {
    console.error('[img error]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
