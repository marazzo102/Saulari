import { useEffect, useState } from "react";

// Injeta estilos globais uma única vez
if (typeof window !== 'undefined' && !document.getElementById('modern-seguros-styles')) {
  const style = document.createElement('style');
  style.id = 'modern-seguros-styles';
  style.innerHTML = `
    body { font-family: 'Inter', Arial, sans-serif; background:#f3f8fc; color:#222; }
    .container-seguros { max-width:1000px; margin:32px auto; background:#fff; border-radius:20px; padding:34px 34px 40px; box-shadow:0 4px 28px #1769aa22; animation:fadeIn .55s ease-out; }
    @keyframes fadeIn { from {opacity:0; transform:translateY(16px);} to {opacity:1; transform:translateY(0);} }
    .btn-main { background:linear-gradient(92deg,#4fc3f7,#1976d2); color:#fff; border:none; border-radius:10px; padding:11px 22px; font-weight:600; cursor:pointer; box-shadow:0 3px 10px #1976d244; display:inline-flex; gap:6px; align-items:center; transition:.25s; }
    .btn-main:hover { filter:brightness(1.05); transform:translateY(-2px); box-shadow:0 6px 18px #1976d255; }
    .btn-secondary { background:#e6eef7; color:#1769aa; border:none; border-radius:8px; padding:9px 18px; font-weight:500; cursor:pointer; transition:.25s; }
    .btn-secondary:hover { background:#d2e4f7; }
    .search-input { width:100%; padding:11px 14px; border:1.5px solid #b7c9da; border-radius:10px; font-size:15px; background:#fafdff; outline:none; transition:.25s; }
    .search-input:focus { border-color:#1976d2; box-shadow:0 0 0 3px #4fc3f733; }
    .alerts-wrapper { margin:18px 0 4px; display:flex; flex-direction:column; gap:10px; }
    .alert { border-radius:10px; padding:14px 18px; font-weight:500; display:flex; gap:10px; align-items:center; box-shadow:0 2px 10px #1976d21a; animation:fadeIn .6s; }
    .alert-vencidos { background:#ffe7e7; color:#b32626; border:1.5px solid #d33c3c; }
    .alert-vencendo { background:#fff8dc; color:#a08300; border:1.5px solid #d2b800; }
    .form-wrapper { background:#f5faff; border:1px solid #dde8f1; border-radius:16px; padding:22px 22px 10px; margin:24px 0 30px; box-shadow:0 4px 18px #1976d210; animation:scaleIn .45s ease; }
    @keyframes scaleIn { from {opacity:0; transform:translateY(-14px) scale(.97);} to {opacity:1; transform:translateY(0) scale(1);} }
    .form-grid { display:grid; gap:14px; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); margin-bottom:4px; }
    .form-grid label { font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.5px; color:#4b6980; display:block; margin-bottom:4px; }
    .form-grid input { width:100%; padding:9px 10px; border:1.4px solid #b7c9da; border-radius:8px; background:#fff; font-size:14px; transition:.22s; }
    .form-grid input:focus { border-color:#1976d2; box-shadow:0 0 0 3px #4fc3f722; outline:none; }
    .actions-row { display:flex; gap:12px; margin-top:14px; }
    .ordenacao-bar { display:flex; flex-wrap:wrap; gap:8px; margin:6px 0 2px; }
    .ordenacao-btn { background:#e6eef7; color:#1769aa; border:none; padding:7px 14px; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; transition:.25s; }
    .ordenacao-btn.active { background:#1976d2; color:#fff; box-shadow:0 3px 10px #1976d244; }
    .ordenacao-btn:not(.active):hover { background:#d2e4f7; }
    .order-info { font-size:13px; font-style:italic; color:#1769aa; margin-top:4px; }
    table.seguros { width:100%; border-collapse:separate; border-spacing:0 6px; margin-top:14px; }
    table.seguros thead th { text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:.7px; padding:10px 12px; background:#e6eef7; color:#1769aa; font-weight:700; }
    table.seguros tbody tr { background:#ffffff; box-shadow:0 2px 10px #1769aa17; transition:.25s; }
    table.seguros tbody tr:hover { transform:translateY(-3px); box-shadow:0 6px 18px #1769aa25; }
    table.seguros tbody td { padding:10px 12px; border-top:1px solid #eef3f7; border-bottom:1px solid #eef3f7; font-size:14px; }
    table.seguros tbody tr td:first-child { border-left:1px solid #eef3f7; border-top-left-radius:10px; border-bottom-left-radius:10px; }
    table.seguros tbody tr td:last-child { border-right:1px solid #eef3f7; border-top-right-radius:10px; border-bottom-right-radius:10px; }
    .indicador { width:14px; height:14px; display:inline-block; border-radius:50%; margin-right:6px; box-shadow:0 0 0 2px #ffffffaa; position:relative; top:2px; }
    .indicador.vencido { background:#e53935; animation:pulseRed 1.2s infinite alternate; border:2px solid #b71c1c; }
    .indicador.vencendo { background:#ffd600; animation:pulseYellow 1.2s infinite alternate; border:2px solid #bfa100; }
    @keyframes pulseRed { from { box-shadow:0 0 6px #e5393555;} to { box-shadow:0 0 14px #e53935aa;} }
    @keyframes pulseYellow { from { box-shadow:0 0 6px #ffd60055;} to { box-shadow:0 0 14px #ffd600aa;} }
    .table-actions { display:flex; gap:8px; }
    .mini-btn { background:#e6eef7; color:#1769aa; border:none; padding:6px 10px; font-size:12px; border-radius:7px; cursor:pointer; font-weight:500; transition:.25s; }
    .mini-btn:hover { background:#1976d2; color:#fff; }
    .mini-btn.danger { background:#ffe5e5; color:#b42222; }
    .mini-btn.danger:hover { background:#d63030; color:#fff; }
    .loading { color:#1769aa; font-weight:500; margin-top:18px; }
  `;
  document.head.appendChild(style);
}

export default function Home() {
  const [order, setOrder] = useState({ column: 'vigencia_fim', ascending: true });
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    cliente_nome: '',
    cliente_cpf: '',
    cliente_numero: '',
    tipo_seguro: '',
    seguradora: '',
    premio: '',
    vigencia_inicio: '',
    vigencia_fim: '',
  });

  const fetchSeguros = async (column = order.column, ascending = order.ascending) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seguros?column=${column}&ascending=${ascending}`);
      if (!res.ok) throw new Error('Erro ao buscar seguros');
      const data = await res.json();
      setSeguros(data);
      setOrder({ column, ascending });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSeguros(); // inicial
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hoje = new Date();
  const vencendo = seguros.filter(s => {
    const fim = new Date(s.vigencia_fim);
    const diff = (fim - hoje) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });
  const vencidos = seguros.filter(s => new Date(s.vigencia_fim) < hoje);

  const segurosFiltrados = seguros.filter(s =>
    s.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
    s.cliente_cpf.includes(search)
  );

  async function salvarSeguro(e) {
    e.preventDefault();
    try {
      let res;
      if (formData.id) {
        res = await fetch('/api/seguros', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
        });
      } else {
        const payload = { ...formData };
        delete payload.id;
        res = await fetch('/api/seguros', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
      }
      if (!res.ok) throw new Error('Erro ao salvar');
      resetForm();
      setFormVisible(false);
      fetchSeguros(order.column, order.ascending);
    } catch (e) { console.error(e); }
  }

  function editarSeguro(seguro) {
    setFormData(seguro);
    setFormVisible(true);
  }

  async function excluirSeguro(id) {
    if (!window.confirm('Tem certeza que deseja apagar este seguro?')) return;
    try {
      const res = await fetch(`/api/seguros?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      fetchSeguros(order.column, order.ascending);
    } catch (e) { console.error(e); }
  }

  function resetForm() {
    setFormData({
      id: null,
      cliente_nome: '',
      cliente_cpf: '',
      cliente_numero: '',
      tipo_seguro: '',
      seguradora: '',
      premio: '',
      vigencia_inicio: '',
      vigencia_fim: '',
    });
  }

  return (
    <div className="container-seguros">
      <h1 style={{ color: '#1976d2', margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 0.5 }}>📋 Seguros</h1>
      <p style={{ margin: '6px 0 22px', color: '#4b6980', fontSize: 14 }}>Gestão centralizada dos contratos e vigências.</p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <button className="btn-main" onClick={() => setFormVisible(v => !v)}>
          {formVisible ? 'Fechar formulário' : '➕ Novo Seguro'}
        </button>
        {seguros.length > 0 && (
          <button className="btn-secondary" onClick={() => fetchSeguros(order.column, order.ascending)}>⟳ Atualizar</button>
        )}
      </div>

      <input className="search-input" placeholder="🔍 Buscar por nome ou CPF" value={search} onChange={e => setSearch(e.target.value)} />

      {(vencidos.length > 0 || vencendo.length > 0) && (
        <div className="alerts-wrapper">
          {vencidos.length > 0 && (
            <div className="alert alert-vencidos">⛔ <span><strong>{vencidos.length}</strong> seguro(s) vencidos</span></div>
          )}
          {vencendo.length > 0 && (
            <div className="alert alert-vencendo">⚠️ <span><strong>{vencendo.length}</strong> vencem em até 30 dias</span></div>
          )}
        </div>
      )}

      {formVisible && (
        <form className="form-wrapper" onSubmit={salvarSeguro}>
          <h2 style={{ margin: '0 0 14px', color: '#1976d2', fontSize: 22, fontWeight: 700 }}>
            {formData.id ? 'Editar Seguro' : 'Novo Seguro'}
          </h2>
          <div className="form-grid">
            <div>
              <label>Nome do Cliente</label>
              <input value={formData.cliente_nome} required onChange={e => setFormData({ ...formData, cliente_nome: e.target.value })} />
            </div>
            <div>
              <label>CPF</label>
              <input value={formData.cliente_cpf} required onChange={e => setFormData({ ...formData, cliente_cpf: e.target.value })} />
            </div>
            <div>
              <label>Telefone</label>
              <input value={formData.cliente_numero} onChange={e => setFormData({ ...formData, cliente_numero: e.target.value })} />
            </div>
            <div>
              <label>Tipo de Seguro</label>
              <input value={formData.tipo_seguro} required onChange={e => setFormData({ ...formData, tipo_seguro: e.target.value })} />
            </div>
            <div>
              <label>Seguradora</label>
              <input value={formData.seguradora} required onChange={e => setFormData({ ...formData, seguradora: e.target.value })} />
            </div>
            <div>
              <label>Prêmio (R$)</label>
              <input type="number" value={formData.premio} onChange={e => setFormData({ ...formData, premio: e.target.value })} />
            </div>
            <div>
              <label>Vigência Início</label>
              <input type="date" value={formData.vigencia_inicio} onChange={e => setFormData({ ...formData, vigencia_inicio: e.target.value })} />
            </div>
            <div>
              <label>Vigência Fim</label>
              <input type="date" value={formData.vigencia_fim} onChange={e => setFormData({ ...formData, vigencia_fim: e.target.value })} />
            </div>
          </div>
          <div className="actions-row">
            <button type="submit" className="btn-main" style={{ marginBottom: 0 }}>{formData.id ? 'Salvar alterações' : 'Cadastrar'}</button>
            <button type="button" className="btn-secondary" onClick={resetForm}>Limpar</button>
            {formData.id && (
              <button type="button" className="btn-secondary" onClick={() => { resetForm(); setFormVisible(false); }}>Cancelar edição</button>
            )}
          </div>
        </form>
      )}

      <div className="ordenacao-bar">
        <button className={`ordenacao-btn ${order.column === 'vigencia_fim' && order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('vigencia_fim', true)}>Vencimento ↑</button>
        <button className={`ordenacao-btn ${order.column === 'vigencia_fim' && !order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('vigencia_fim', false)}>Vencimento ↓</button>
        <button className={`ordenacao-btn ${order.column === 'tipo_seguro' && order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('tipo_seguro', true)}>Tipo ↑</button>
        <button className={`ordenacao-btn ${order.column === 'tipo_seguro' && !order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('tipo_seguro', false)}>Tipo ↓</button>
        <button className={`ordenacao-btn ${order.column === 'seguradora' && order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('seguradora', true)}>Seguradora ↑</button>
        <button className={`ordenacao-btn ${order.column === 'seguradora' && !order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('seguradora', false)}>Seguradora ↓</button>
        <button className={`ordenacao-btn ${order.column === 'premio' && order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('premio', true)}>Prêmio ↑</button>
        <button className={`ordenacao-btn ${order.column === 'premio' && !order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('premio', false)}>Prêmio ↓</button>
      </div>
      <div className="order-info">Ordenado por <strong>{order.column}</strong> ({order.ascending ? 'crescente' : 'decrescente'})</div>

      <table className="seguros">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>CPF</th>
            <th>Seguro</th>
            <th>Seguradora</th>
            <th>Prêmio</th>
            <th>Início</th>
            <th>Fim</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {segurosFiltrados.map(s => {
            const fim = new Date(s.vigencia_fim);
            const diff = (fim - hoje) / (1000 * 60 * 60 * 24);
            let classeIndicador = '';
            if (fim < hoje) classeIndicador = 'vencido'; else if (diff >= 0 && diff <= 30) classeIndicador = 'vencendo';
            return (
              <tr key={s.id}>
                <td>{s.cliente_nome}</td>
                <td>{s.cliente_cpf}</td>
                <td>{s.tipo_seguro}</td>
                <td>{s.seguradora}</td>
                <td>R$ {s.premio}</td>
                <td>{s.vigencia_inicio}</td>
                <td>{classeIndicador && <span className={`indicador ${classeIndicador}`}></span>}{s.vigencia_fim}</td>
                <td>
                  <div className="table-actions">
                    <button className="mini-btn" onClick={() => editarSeguro(s)}>Editar</button>
                    <button className="mini-btn danger" onClick={() => excluirSeguro(s.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
            );
          })}
          {segurosFiltrados.length === 0 && !loading && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#4b6980' }}>Nenhum seguro encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>

      {loading && <div className="loading">Carregando...</div>}
    </div>
  );
}
