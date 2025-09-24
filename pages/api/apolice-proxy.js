// Proxy para servir PDFs do Supabase Storage sem CORS
export default async function handler(req, res) {
  try {
    const { path } = req.query;
    if (!path) {
      return res.status(400).json({ error: 'Path obrigatório' });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ error: 'Supabase env não configurado' });
    }

    // Monta a URL do arquivo. O `path` já inclui o bucket (ex: apolices/123/file.pdf)
    const fileUrl = `${SUPABASE_URL}/storage/v1/object/${encodeURI(path)}`;

    const response = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Storage fetch failed', {
        status: response.status,
        statusText: response.statusText,
        body: text?.slice(0, 500)
      });
      return res.status(response.status).json({
        error: 'Erro ao buscar PDF',
        status: response.status,
        details: response.statusText
      });
    }

    const buf = Buffer.from(await response.arrayBuffer());

    // Headers padrão para PDF inline
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/pdf');
    res.setHeader('Content-Disposition', response.headers.get('content-disposition') || 'inline');
    res.setHeader('Cache-Control', 'private, max-age=60');

    return res.status(200).send(buf);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Falha no proxy do PDF', details: err?.message || String(err) });
  }
}
