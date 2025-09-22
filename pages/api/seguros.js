import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

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
