async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = Buffer.alloc(0);
    req.on('data', chunk => { data = Buffer.concat([data, chunk]); });
    req.on('end', () => { try { resolve(JSON.parse(data.toString())); } catch(e) { reject(e); } });
    req.on('error', reject);
  });
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { base64, mime } = await readBody(req);
    const buffer = Buffer.from(base64, 'base64');
    const blob = new Blob([buffer], { type: mime });

    const fd = new FormData();
    fd.append('model', 'gpt-image-1');
    fd.append('image[]', blob, 'before.jpg');
    fd.append('prompt', `Remove ONLY loose trash: cardboard boxes, plastic bags, garbage from floor.
KEEP exactly: wall color, stains, floor material, fixed furniture, same angle and lighting.
Do NOT repaint walls, replace floor, or add furniture.
Result: identical room with only the loose garbage removed.`);
    fd.append('n', '1');
    fd.append('size', '1024x1024');

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_KEY}` },
      body: fd,
    });
    const data = await response.json();
    console.log('[generate-image]', response.status, JSON.stringify(data).slice(0, 200));
    return res.status(200).json(data);
  } catch(e) {
    console.error('[generate-image error]', e);
    return res.status(500).json({ error: e.message });
  }
}
