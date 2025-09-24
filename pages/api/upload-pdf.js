import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, fileContent, seguroId } = req.body;
    
    if (!fileName || !fileContent || !seguroId) {
      return res.status(400).json({ error: 'fileName, fileContent e seguroId são obrigatórios' });
    }

    // Usa Service Role Key se disponível
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return res.status(500).json({ error: 'Configuração do Supabase incompleta' });
    }

    // Cliente com Service Role Key (só no servidor)
    const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
    
    // Converte base64 para buffer
    const buffer = Buffer.from(fileContent, 'base64');
    
    const path = `${seguroId}/${Date.now()}-${fileName}`;
    
    const { error: uploadError } = await adminClient.storage
      .from('apolices')
      .upload(path, buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    const internalPath = `apolices/${path}`;
    
    return res.status(200).json({ 
      success: true, 
      path: internalPath 
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Aumenta o limite para arquivos PDF
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};