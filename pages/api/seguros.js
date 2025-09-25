import { supabase } from '../../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

// Cliente admin (service role) apenas para operações críticas (PUT/DELETE) evitando políticas amplas públicas
function getAdminClient(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url || !key){
    return null; // fallback: usa o anon
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Ordenação dinâmica via query params
      const allowedColumns = [
        'vigencia_fim', 'id', 'cliente_nome', 'cliente_cpf', 'cliente_numero',
        'tipo_seguro', 'seguradora', 'premio', 'vigencia_inicio'
      ];
      const { column = 'vigencia_fim', ascending = 'true' } = req.query;
      const col = typeof column === 'string' ? column : '';
      const asc = String(ascending).toLowerCase() === 'true';

      let safeColumn = column;
      if (!allowedColumns.includes(column)) {
        console.warn(`Invalid column "${column}" provided in query. Falling back to "vigencia_fim".`);
        safeColumn = 'vigencia_fim';
      }
      safeColumn = allowedColumns.includes(col) ? col : 'vigencia_fim';

      const { data, error } = await supabase
        .from('seguros')
        .select('*')
        .order(safeColumn, { ascending: asc });

      if (error) {
        console.error('Erro Supabase:', error);
        return res.status(500).json({ error: error.message, details: error });
      }

      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      // Remove o campo id, se vier no body
      const fields = { ...req.body };
      delete fields.id;
      const { data, error } = await supabase.from('seguros').insert([fields]);
      if (error) {
        console.error('Erro Supabase:', error);
        return res.status(500).json({ error: error.message, details: error });
      }
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, ...fields } = req.body;
      if (!id) return res.status(400).json({ error: 'ID é obrigatório para atualizar' });
      const admin = getAdminClient();
      const client = admin || supabase;
      const { data, error } = await client.from('seguros').update(fields).eq('id', id).select();
      if (error) {
        console.error('Erro Supabase (PUT):', error);
        return res.status(500).json({ error: error.message, details: error });
      }
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'ID é obrigatório para excluir' });
      const admin = getAdminClient();
      const client = admin || supabase;
      const { data, error } = await client.from('seguros').delete().eq('id', id).select();
      if (error) {
        console.error('Erro Supabase (DELETE):', error);
        return res.status(500).json({ error: error.message, details: error });
      }
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (err) {
    console.error('Erro inesperado na API:', err);
    return res.status(500).json({ error: 'Erro inesperado na API', details: err.message || err });
  }
}
