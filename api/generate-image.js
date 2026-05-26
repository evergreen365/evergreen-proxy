export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { base64 } = req.body;
    const imageBuffer = Buffer.from(base64, 'base64');
    const boundary = '----Boundary' + Date.now();
    const CRLF = '\r\n';

    const prompt = 'Remove all trash, garbage bags, cardboard boxes from the floor. Keep walls, furniture, and room structure identical.';

    const parts = [
      Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="model"${CRLF}${CRLF}gpt-image-1${CRLF}`),
      Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="prompt"${CRLF}${CRLF}${prompt}${CRLF}`),
      Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="n"${CRLF}${CRLF}1${CRLF}`),
      Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="size"${CRLF}${CRLF}1024x1024${CRLF}`),
      Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="image[]"; filename="image.jpg"${CRLF}Content-Type: image/jpeg${CRLF}${CRLF}`),
      imageBuffer,
      Buffer.from(`${CRLF}--${boundary}--${CRLF}`),
    ];

    const body = Buffer.concat(parts);

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });

    const text = await response.text();
    console.log('[img] status:', response.status, text.slice(0, 300));

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
