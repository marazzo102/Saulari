import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

// Exemplo de dados fictícios para dashboard
// Gera dados de gráfico a partir dos seguros reais
function getChartDataFromSeguros(seguros) {
  // Agrupa por mês/ano
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const map = {};
  seguros.forEach(s => {
    const d = new Date(s.vigencia_inicio);
    if (isNaN(d)) return;
    const key = `${meses[d.getMonth()]}/${d.getFullYear()}`;
    if (!map[key]) map[key] = { name: key, Ativos: 0, Vencidos: 0, Premio: 0 };
    const fim = new Date(s.vigencia_fim);
    if (fim < new Date()) map[key].Vencidos += 1;
    else map[key].Ativos += 1;
    map[key].Premio += parseFloat(s.premio) || 0;
  });
  // Ordena por data
  return Object.values(map).sort((a,b) => {
    const [ma,ya] = a.name.split('/');
    const [mb,yb] = b.name.split('/');
    return new Date(`${ya}-${meses.indexOf(ma)+1}-01`) - new Date(`${yb}-${meses.indexOf(mb)+1}-01`);
  });
}

export function DashboardCharts({ seguros }) {
  const chartData = getChartDataFromSeguros(seguros || []);
  return (
    <div style={{ display: 'grid', gap: 32, gridTemplateColumns: '1fr', margin: '32px 0' }}>
      {/* Gráfico de barras: Apólices Ativas x Vencidas */}
      <div style={{ background: '#1a202c', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px #0006' }}>
        <h3 style={{ color: '#4fc3f7', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Apólices Ativas x Vencidas</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#cbd5e1" fontSize={13} />
            <YAxis stroke="#cbd5e1" fontSize={13} />
            <Tooltip contentStyle={{ background: '#1a202c', border: '1px solid #334155', color: '#e2e8f0' }} />
            <Legend wrapperStyle={{ color: '#e2e8f0' }} />
            <Bar dataKey="Ativos" fill="#4fc3f7" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Vencidos" fill="#dc2626" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de linha: Prêmio Total */}
      <div style={{ background: '#1a202c', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px #0006' }}>
        <h3 style={{ color: '#4fc3f7', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Prêmio Total por Mês</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#cbd5e1" fontSize={13} />
            <YAxis stroke="#cbd5e1" fontSize={13} />
            <Tooltip contentStyle={{ background: '#1a202c', border: '1px solid #334155', color: '#e2e8f0' }} />
            <Legend wrapperStyle={{ color: '#e2e8f0' }} />
            <Line type="monotone" dataKey="Premio" stroke="#4fc3f7" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
