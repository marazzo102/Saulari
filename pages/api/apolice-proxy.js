// Proxy para servir PDFs do Supabase Storage sem CORS
export default async function handler(req, res) {
  try {
    const { path, download, signed } = req.query;
    if (!path) {
      return res.status(400).json({ error: 'Path obrigatório' });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ error: 'Supabase env não configurado' });
    }
    
    // Modo signed URL (opcional: ?signed=1) – gera URL temporária em vez de servir o arquivo diretamente
    if (signed === '1' || signed === 'true') {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const adminClient = createClient(SUPABASE_URL, SUPABASE_KEY);
        // path recebido inclui bucket (ex: apolices/123/arquivo.pdf)
        const [bucket, ...rest] = path.split('/');
        const objectPath = rest.join('/');
        const { data, error } = await adminClient
          .storage
          .from(bucket)
          .createSignedUrl(objectPath, 60); // 60 segundos
        if (error) {
          console.error('Signed URL error:', error);
          return res.status(500).json({ error: 'Falha ao gerar URL assinada' });
        }
        // Redireciona para a URL assinada
        return res.redirect(302, data.signedUrl + (download ? `&download=${encodeURIComponent(objectPath)}` : ''));
      } catch (e) {
        console.error('Signed URL generation exception:', e);
        return res.status(500).json({ error: 'Exceção ao gerar URL assinada', details: e.message });
      }
    }

    // Modo direto (fetch do objeto)
    const fileUrl = `${SUPABASE_URL}/storage/v1/object/${encodeURI(path)}`;
    const response = await fetch(fileUrl, { headers: { Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Storage fetch failed', { status: response.status, statusText: response.statusText, body: text?.slice(0, 500) });
      return res.status(response.status).json({ error: 'Erro ao buscar PDF', status: response.status, details: response.statusText });
    }
    const buf = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'application/pdf';
    res.setHeader('Content-Type', contentType);
    const dispositionBase = download ? 'attachment' : 'inline';
    const fileName = path.split('/').pop() || 'apolice.pdf';
    res.setHeader('Content-Disposition', `${dispositionBase}; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'private, max-age=60');
    return res.status(200).send(buf);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Falha no proxy do PDF', details: err?.message || String(err) });
  }
}
