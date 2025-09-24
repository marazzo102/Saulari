// Proxy para servir PDFs do Supabase Storage sem CORS
export default async function handler(req, res) {
  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ error: 'Path obrigatório' });
  }

  // Carrega variáveis do ambiente
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Usa Service Role Key se disponível, senão ANON KEY
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase env não configurado' });
  }

  // Monta a URL do arquivo
  const fileUrl = `${SUPABASE_URL}/storage/v1/object/${path}`;

  // Faz o fetch autenticado
  const response = await fetch(fileUrl, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!response.ok) {
    console.error(`Storage error: ${response.status} - ${response.statusText}`);
    return res.status(response.status).json({ 
      error: 'Erro ao buscar PDF', 
      status: response.status,
      details: response.statusText
    });
  }

  // Copia headers relevantes
  res.setHeader('Content-Type', response.headers.get('content-type') || 'application/pdf');
  res.setHeader('Content-Disposition', response.headers.get('content-disposition') || 'inline');

  // Stream do PDF
  response.body.pipe(res);
}
