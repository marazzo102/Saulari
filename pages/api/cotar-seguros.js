// API para cotação automática de seguros
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { dados } = req.body;

  if (!dados) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: dados' });
  }

  try {
    // Simulação de cotações de diferentes seguradoras
    const cotacoesMock = [
      {
        seguradora: 'Porto Seguro',
        preco: Math.random() * 500 + 200,
        cobertura: 'Completa',
        prazo: '12 meses',
        desconto: Math.floor(Math.random() * 20),
        disponivel: true
      },
      {
        seguradora: 'Bradesco Seguros',
        preco: Math.random() * 500 + 250,
        cobertura: 'Básica',
        prazo: '12 meses',
        desconto: Math.floor(Math.random() * 15),
        disponivel: true
      },
      {
        seguradora: 'SulAmérica',
        preco: Math.random() * 500 + 180,
        cobertura: 'Premium',
        prazo: '12 meses',
        desconto: Math.floor(Math.random() * 25),
        disponivel: Math.random() > 0.3
      },
      {
        seguradora: 'Azul Seguros',
        preco: Math.random() * 500 + 220,
        cobertura: 'Completa',
        prazo: '12 meses',
        desconto: Math.floor(Math.random() * 18),
        disponivel: Math.random() > 0.2
      },
      {
        seguradora: 'Mapfre',
        preco: Math.random() * 500 + 190,
        cobertura: 'Básica',
        prazo: '12 meses',
        desconto: Math.floor(Math.random() * 22),
        disponivel: Math.random() > 0.25
      }
    ];

    // Filtrar apenas seguradoras disponíveis
    const cotacoesDisponiveis = cotacoesMock
      .filter(c => c.disponivel)
      .map(c => ({
        ...c,
        precoFinal: (c.preco * (1 - c.desconto / 100)).toFixed(2),
        timestamp: new Date().toISOString()
      }))
      .sort((a, b) => a.precoFinal - b.precoFinal);

    console.log('💰 Cotação realizada:', { 
      tipo: dados.tipo, 
      cotacoes: cotacoesDisponiveis.length 
    });
    
    return res.status(200).json(cotacoesDisponiveis);

  } catch (error) {
    console.error('Erro ao cotar seguros:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
}