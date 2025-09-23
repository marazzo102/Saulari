import { useEffect, useState } from "react";

// Injeta estilos globais uma única vez
if (typeof window !== 'undefined' && !document.getElementById('modern-seguros-styles')) {
  const style = document.createElement('style');
  style.id = 'modern-seguros-styles';
  style.innerHTML = `
  body { font-family: 'Inter', Arial, sans-serif; background:#f3f8fc; color:#222; }
  .app-shell { display:flex; min-height:100vh; }
  .sidebar { width:240px; background:#0f3554; color:#e9f3fb; padding:22px 18px; position:sticky; top:0; height:100vh; box-shadow: 4px 0 16px #0d274422; }
  .brand { display:flex; align-items:center; gap:10px; font-weight:800; letter-spacing:.4px; color:#cfe8f7; }
  .brand .logo { width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#4fc3f7,#1976d2); box-shadow:0 6px 16px #1976d244; }
  .nav { margin-top:16px; display:flex; flex-direction:column; gap:6px; }
  .nav a { color:#cfe0ee; text-decoration:none; padding:9px 10px; border-radius:8px; font-weight:600; display:flex; align-items:center; gap:8px; }
  .nav a.active, .nav a:hover { background:#13476f; color:#fff; }
  .content { flex:1; padding:26px; }
  .container-seguros { max-width:1100px; margin:0 auto; background:#fff; border-radius:20px; padding:26px 26px 36px; box-shadow:0 4px 28px #1769aa22; animation:fadeIn .55s ease-out; }
    @keyframes fadeIn { from {opacity:0; transform:translateY(16px);} to {opacity:1; transform:translateY(0);} }
    .btn-main { background:linear-gradient(92deg,#4fc3f7,#1976d2); color:#fff; border:none; border-radius:10px; padding:11px 22px; font-weight:600; cursor:pointer; box-shadow:0 3px 10px #1976d244; display:inline-flex; gap:6px; align-items:center; transition:.25s; }
    .btn-main:hover { filter:brightness(1.05); transform:translateY(-2px); box-shadow:0 6px 18px #1976d255; }
    .btn-secondary { background:#e6eef7; color:#1769aa; border:none; border-radius:8px; padding:9px 18px; font-weight:500; cursor:pointer; transition:.25s; }
    .btn-secondary:hover { background:#d2e4f7; }
    .search-input { width:100%; padding:11px 14px; border:1.5px solid #b7c9da; border-radius:10px; font-size:15px; background:#fafdff; outline:none; transition:.25s; }
    .search-input:focus { border-color:#1976d2; box-shadow:0 0 0 3px #4fc3f733; }
  .alerts-wrapper { margin:14px 0 2px; display:flex; flex-direction:column; gap:8px; position:relative; }
  .alerts-wrapper.sticky { position:sticky; top:0; z-index:30; padding-top:4px; }
  .alert { border-radius:12px; padding:12px 16px; font-weight:500; display:flex; gap:10px; align-items:center; box-shadow:0 3px 14px #0d27440f,0 1px 2px #0d274415; animation:fadeIn .5s; line-height:1.25; backdrop-filter:blur(6px); }
  .alert strong { font-weight:700; }
  .alert small { font-size:12px; opacity:.7; font-weight:400; }
  .alert-vencidos { background:linear-gradient(125deg,#ffe3e3,#ffcaca); color:#8f2222; border:1px solid #e05a5a; }
  .alert-vencendo { background:linear-gradient(125deg,#fff4c9,#ffeaa3); color:#6d5a00; border:1px solid #d2b800; }
  .alert-badges { display:flex; gap:10px; flex-wrap:wrap; }
  .alert-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 10px 5px 8px; background:#fff; border-radius:30px; font-size:12px; font-weight:600; color:#1769aa; box-shadow:0 2px 6px #1769aa22; }
  .alert-badge span.dot { width:10px; height:10px; border-radius:50%; display:inline-block; }
  .alert-badge .dot.red { background:#e53935; box-shadow:0 0 0 2px #ffffffcc,0 0 8px #e5393580; }
  .alert-badge .dot.yellow { background:#ffd600; box-shadow:0 0 0 2px #ffffffcc,0 0 8px #ffd60080; }
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
    /* --- Filtros rápidos e toasts adicionados --- */
    .filters-bar { display:flex; flex-wrap:wrap; gap:8px; margin:10px 0 4px; align-items:center; }
    .chip-filter { padding:6px 14px; border-radius:22px; background:#e6eef7; color:#1769aa; font-size:12px; font-weight:600; cursor:pointer; border:none; transition:.25s; }
    .chip-filter.active { background:#1976d2; color:#fff; box-shadow:0 3px 10px #1976d23a; }
    .chip-filter:not(.active):hover { background:#d2e4f7; }
    .toast-container { position:fixed; right:24px; bottom:24px; display:flex; flex-direction:column; gap:10px; max-width:300px; z-index:500; }
    .toast { border-radius:14px; padding:14px 16px 14px 14px; font-size:14px; display:flex; gap:10px; align-items:flex-start; box-shadow:0 6px 28px #0d274433; background:#fff; border:1px solid #e2e9f0; animation:slideIn .5s ease; }
    @keyframes slideIn { from {opacity:0; transform:translateY(16px) scale(.96);} to {opacity:1; transform:translateY(0) scale(1);} }
    .toast.vencidos { border-left:6px solid #e53935; }
    .toast.vencendo { border-left:6px solid #ffd600; }
    .toast h4 { margin:0 0 4px; font-size:14px; font-weight:700; }
    .toast small { font-size:11px; opacity:.75; line-height:1.3; }
  /* Dashboard cards */
  .kpis { display:grid; grid-template-columns:repeat(4, minmax(160px,1fr)); gap:12px; margin:14px 0 8px; }
  .kpi { background:linear-gradient(180deg,#ffffff,#f6fbff); border:1px solid #e2edf7; border-radius:14px; padding:14px; box-shadow:0 4px 16px #1769aa13; }
  .kpi h3 { margin:0; font-size:12px; color:#4b6980; text-transform:uppercase; letter-spacing:.5px; }
  .kpi .value { margin-top:6px; font-size:22px; font-weight:800; color:#0f3554; }
  .kpi .sub { font-size:12px; color:#6a8aa2; margin-top:2px; }
  /* Status pill */
  .status-pill { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700; }
  .status-ativo { background:#e6f5ec; color:#0a7a3e; border:1px solid #b9e3c9; }
  .status-vencendo { background:#fff7d6; color:#7a5b00; border:1px solid #ead37b; }
  .status-vencido { background:#ffe6e6; color:#8b1b1b; border:1px solid #ef9a9a; }
  `;
  document.head.appendChild(style);
}

export default function Home() {

  const [order, setOrder] = useState({ column: 'vigencia_fim', ascending: true });
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [alertsAsToast, setAlertsAsToast] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos' | 'vencidos' | 'vencendo'
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
  const ativos = seguros.filter(s => new Date(s.vigencia_fim) >= hoje);
  const premioAtivos = ativos.reduce((sum, s) => sum + (parseFloat(s.premio) || 0), 0);

  const [uploadingId, setUploadingId] = useState(null);

  function statusDoSeguro(seguro){
    const fim = new Date(seguro.vigencia_fim);
    const diff = (fim - hoje) / (1000 * 60 * 60 * 24);
    if (fim < hoje) return 'vencido';
    if (diff >= 0 && diff <= 30) return 'vencendo';
    return 'ativo';
  }

  const segurosFiltrados = seguros.filter(s =>
    (s.cliente_nome.toLowerCase().includes(search.toLowerCase()) || s.cliente_cpf.includes(search)) &&
    (statusFilter === 'todos' || (statusFilter === 'vencidos' && new Date(s.vigencia_fim) < hoje) || (statusFilter === 'vencendo' && (()=>{const fim=new Date(s.vigencia_fim);const diff=(fim-hoje)/(1000*60*60*24);return diff>=0 && diff<=30;})()))
  );

  function exportVencidosCSV(){
    if(vencidos.length===0){ alert('Não há seguros vencidos para exportar.'); return; }
    const headers = ['id','cliente_nome','cliente_cpf','cliente_numero','tipo_seguro','seguradora','premio','vigencia_inicio','vigencia_fim'];
    const rows = vencidos.map(s => headers.map(h => (s[h] ?? '')).join(';'));
    const csv = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'seguros_vencidos.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function exportFiltradosCSV(){
    if(segurosFiltrados.length===0){ alert('Não há itens filtrados para exportar.'); return; }
    const headers = ['id','cliente_nome','cliente_cpf','cliente_numero','tipo_seguro','seguradora','premio','vigencia_inicio','vigencia_fim','status','apolice_pdf'];
    const rows = segurosFiltrados.map(s => {
      const status = statusDoSeguro(s);
      return headers.map(h => (h==='status'? status : (s[h] ?? ''))).join(';');
    });
    const csv = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'seguros_filtrados.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  async function handleUploadPDF(seguro, file){
    try{
      setUploadingId(seguro.id);
      const { supabase } = await import('../lib/supabaseClient');
      const path = `${seguro.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('apolices').upload(path, file, { upsert: true, contentType: 'application/pdf' });
      if(upErr) throw upErr;
      const { data } = supabase.storage.from('apolices').getPublicUrl(path);
      const url = data?.publicUrl;
      if(!url) throw new Error('Falha ao gerar URL pública');
      // tenta persistir na API existente
      await fetch('/api/seguros', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...seguro, apolice_pdf: url }) });
      await fetchSeguros(order.column, order.ascending);
      alert('PDF anexado com sucesso.');
    }catch(e){
      console.error(e);
      alert('Falha ao anexar PDF. Verifique as credenciais do Supabase e o bucket "apolices".');
    }finally{
      setUploadingId(null);
    }
  }

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

  const [section, setSection] = useState('dashboard');

  function NavLink({ label, icon, value }) {
    return (
      <a
        className={section === value ? 'active' : ''}
        href="#"
        onClick={e => { e.preventDefault(); setSection(value); }}
        style={{ userSelect: 'none' }}
      >
        {icon} {label}
      </a>
    );
  }

  // Exporta relatório de prêmios por mês
  function exportRelatorioPremios() {
    if (!seguros || !Array.isArray(seguros) || seguros.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }
    const premiosPorMes = {};
    seguros.forEach(s => {
      if (!s.vigencia_inicio || !s.premio) return;
      const dt = new Date(s.vigencia_inicio);
      if (isNaN(dt)) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
      premiosPorMes[key] = (premiosPorMes[key] || 0) + (parseFloat(s.premio) || 0);
    });
    const rows = Object.entries(premiosPorMes).map(([mes, premio]) => [mes, premio.toFixed(2).replace('.', ',')]);
    if (!rows.length) {
      alert('Não há dados válidos para exportar.');
      return;
    }
    let csv = 'Mes/Ano;Premio Total (R$)\n';
    csv += rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'relatorio-premios-mensal.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="logo" /> <span>Saulari Seguros</span></div>
        <nav className="nav" aria-label="Principal">
          <NavLink label="Dashboard" icon="📊" value="dashboard" />
          <NavLink label="Seguros" icon="📋" value="seguros" />
          <NavLink label="Relatórios" icon="📈" value="relatorios" />
          <NavLink label="Configurações" icon="⚙️" value="config" />
        </nav>
        <div style={{marginTop:'auto', opacity:.8, fontSize:12}}>© {new Date().getFullYear()} Saulari</div>
      </aside>
      <main className="content">
        {section === 'dashboard' && (
          <div className="container-seguros">
            <h1 style={{ color: '#1976d2', margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 0.5 }}>📊 Dashboard</h1>
            <p style={{ margin: '6px 0 22px', color: '#4b6980', fontSize: 14 }}>Visão geral dos seguros e indicadores.</p>
            {/* Cards de resumo */}
            <section className="kpis" aria-label="Resumo">
              <div className="kpi">
                <h3>Ativos</h3>
                <div className="value">{ativos.length}</div>
                <div className="sub">Apólices vigentes</div>
              </div>
              <div className="kpi">
                <h3>Em 30 dias</h3>
                <div className="value">{vencendo.length}</div>
                <div className="sub">Acompanhar renovações</div>
              </div>
              <div className="kpi">
                <h3>Vencidos</h3>
                <div className="value">{vencidos.length}</div>
                <div className="sub">Ação imediata</div>
              </div>
              <div className="kpi">
                <h3>Prêmio ativos</h3>
                <div className="value">R$ {premioAtivos.toLocaleString('pt-BR')}</div>
                <div className="sub">Soma dos prêmios</div>
              </div>
            </section>
            {/* Gráfico de exemplo (placeholder) */}
            <div style={{marginTop:32, background:'#f6fbff', borderRadius:12, padding:24, textAlign:'center', color:'#1976d2', fontWeight:600}}>
              [Gráfico de prêmios por mês aqui]
              <br />
              <span style={{fontSize:13, color:'#4b6980', fontWeight:400}}>Integre uma lib como recharts/chart.js para gráficos reais.</span>
            </div>
          </div>
        )}
        {section === 'seguros' && (
          <div className="container-seguros" id="seguros">
            <h1 style={{ color: '#1976d2', margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 0.5 }}>📋 Seguros</h1>
            <p style={{ margin: '6px 0 22px', color: '#4b6980', fontSize: 14 }}>Gestão centralizada dos contratos e vigências.</p>

          {/* Cards de resumo */}
          <section className="kpis" aria-label="Resumo">
            <div className="kpi">
              <h3>Ativos</h3>
              <div className="value">{ativos.length}</div>
              <div className="sub">Apólices vigentes</div>
            </div>
            <div className="kpi">
              <h3>Em 30 dias</h3>
              <div className="value">{vencendo.length}</div>
              <div className="sub">Acompanhar renovações</div>
            </div>
            <div className="kpi">
              <h3>Vencidos</h3>
              <div className="value">{vencidos.length}</div>
              <div className="sub">Ação imediata</div>
            </div>
            <div className="kpi">
              <h3>Prêmio ativos</h3>
              <div className="value">R$ {premioAtivos.toLocaleString('pt-BR')}</div>
              <div className="sub">Soma dos prêmios</div>
            </div>
          </section>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <button className="btn-main" onClick={() => setFormVisible(v => !v)}>
          {formVisible ? 'Fechar formulário' : '➕ Novo Seguro'}
        </button>
        {seguros.length > 0 && (
          <button className="btn-secondary" onClick={() => fetchSeguros(order.column, order.ascending)}>⟳ Atualizar</button>
        )}
        <button className="btn-secondary" onClick={() => setShowAlerts(a=>!a)}>{showAlerts? 'Ocultar alertas':'Mostrar alertas'}</button>
        {(vencidos.length>0 || vencendo.length>0) && (
          <button className="btn-secondary" onClick={() => setAlertsAsToast(t=>!t)}>
            {alertsAsToast? 'Modo inline' : 'Modo toast'}
          </button>
        )}
        {vencidos.length>0 && (
          <button className="btn-secondary" onClick={exportVencidosCSV}>⬇️ Exportar vencidos</button>
        )}
        {segurosFiltrados.length>0 && (
          <button className="btn-secondary" onClick={exportFiltradosCSV}>⬇️ Exportar filtrados</button>
        )}
      </div>

      <input className="search-input" placeholder="🔍 Buscar por nome ou CPF" value={search} onChange={e => setSearch(e.target.value)} />

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

      {/* Alertas refinados – badges + blocos compactos antes da tabela */}
      {showAlerts && !alertsAsToast && (vencidos.length > 0 || vencendo.length > 0) && (
        <div
          className={`alerts-wrapper ${(!formVisible && (vencidos.length + vencendo.length) > 3) ? 'sticky' : ''}`}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="alert-badges" style={{ marginBottom:8 }}>
            {vencidos.length > 0 && (
              <div className="alert-badge" title="Seguros vencidos">
                <span className="dot red"></span>
                {vencidos.length} vencido{vencidos.length > 1 ? 's' : ''}
              </div>
            )}
            {vencendo.length > 0 && (
              <div className="alert-badge" title="Seguros que vencem em até 30 dias">
                <span className="dot yellow"></span>
                {vencendo.length} em 30 dias
              </div>
            )}
          </div>
          {vencidos.length > 0 && (
            <div className="alert alert-vencidos">
              <span style={{ fontSize:20 }}>⛔</span>
              <div>
                <strong>{vencidos.length} seguro{vencidos.length>1?'s':''} vencido{vencidos.length>1?'s':''}</strong><br />
                <small>Renovar imediatamente para evitar descoberta.</small>
              </div>
            </div>
          )}
          {vencendo.length > 0 && (
            <div className="alert alert-vencendo">
              <span style={{ fontSize:20 }}>⚠️</span>
              <div>
                <strong>{vencendo.length} vence{vencendo.length>1?'m':''} em até 30 dias</strong><br />
                <small>Programe contato com o cliente antes do prazo.</small>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="filters-bar">
        <button className={`chip-filter ${statusFilter==='todos'?'active':''}`} onClick={()=>setStatusFilter('todos')}>Todos ({seguros.length})</button>
        <button className={`chip-filter ${statusFilter==='vencidos'?'active':''}`} onClick={()=>setStatusFilter('vencidos')}>Vencidos ({vencidos.length})</button>
        <button className={`chip-filter ${statusFilter==='vencendo'?'active':''}`} onClick={()=>setStatusFilter('vencendo')}>Em 30 dias ({vencendo.length})</button>
      </div>

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
            <th>Status</th>
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
                <td>
                  {(() => {
                    const st = statusDoSeguro(s);
                    return (
                      <span className={`status-pill status-${st}`}>
                        {st === 'ativo' ? 'Ativo' : st === 'vencendo' ? 'Vencendo' : 'Vencido'}
                      </span>
                    );
                  })()}
                </td>
                <td>{classeIndicador && <span className={`indicador ${classeIndicador}`}></span>}{s.vigencia_fim}</td>
                <td>
                  <div className="table-actions">
                    <button className="mini-btn" onClick={() => editarSeguro(s)}>Editar</button>
                    <button className="mini-btn danger" onClick={() => excluirSeguro(s.id)}>Excluir</button>
                    <label className="mini-btn" style={{cursor:'pointer'}}>
                      Anexar PDF
                      <input type="file" accept="application/pdf" style={{display:'none'}} onChange={(e)=>{ const f=e.target.files?.[0]; if(f) handleUploadPDF(s, f); }} />
                    </label>
                    {s.apolice_pdf && (
                      <a
                        className="mini-btn"
                        href={
                          `/api/apolice-proxy?path=${encodeURIComponent(s.apolice_pdf.replace(/^.*\/apolices\//, 'apolices/'))}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{background:'#e6f5ec', color:'#0a7a3e', border:'1px solid #b9e3c9'}}
                      >
                        Ver PDF
                      </a>
                    )}
                    {uploadingId===s.id && <span style={{fontSize:12,color:'#1769aa'}}>Enviando...</span>}
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

      {/* Toasts */}
      {showAlerts && alertsAsToast && (vencidos.length>0 || vencendo.length>0) && (
        <div className="toast-container" aria-live="polite" aria-atomic="true">
          {vencidos.length>0 && (
            <div className="toast vencidos">
              <div style={{fontSize:22,lineHeight:1}}>⛔</div>
              <div>
                <h4>{vencidos.length} vencido{vencidos.length>1?'s':''}</h4>
                <small>Renovar imediatamente.</small>
              </div>
            </div>
          )}
          {vencendo.length>0 && (
            <div className="toast vencendo">
              <div style={{fontSize:22,lineHeight:1}}>⚠️</div>
              <div>
                <h4>{vencendo.length} em 30 dias</h4>
                <small>Planejar contato com cliente.</small>
              </div>
            </div>
          )}
        </div>
      )}
        </div>
        )}
        {section === 'relatorios' && (
          <div className="container-seguros">
            <h1 style={{ color: '#1976d2', margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 0.5 }}>📈 Relatórios</h1>
            <p style={{ margin: '6px 0 22px', color: '#4b6980', fontSize: 14 }}>Gere e exporte relatórios detalhados dos seguros.</p>
            <div style={{background:'#f6fbff', borderRadius:12, padding:24, marginBottom:18}}>
              <b>Relatório de prêmios recebidos por mês:</b>
              <br />
              <span style={{fontSize:13, color:'#4b6980'}}>Exporta um CSV com a soma dos prêmios por mês/ano.</span>
            </div>
            <button className="btn-main" onClick={exportRelatorioPremios}>Exportar relatório CSV</button>
          </div>
        )}


        {section === 'config' && (
          <div className="container-seguros">
            <h1 style={{ color: '#1976d2', margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 0.5 }}>⚙️ Configurações</h1>
            <p style={{ margin: '6px 0 22px', color: '#4b6980', fontSize: 14 }}>Personalize preferências, dados da empresa e integrações.</p>
            <div style={{background:'#f6fbff', borderRadius:12, padding:24, marginBottom:18}}>
              <b>Configurações gerais (exemplo):</b>
              <ul style={{color:'#4b6980', fontSize:14, margin:'12px 0 0 18px'}}>
                <li>Nome da empresa, logo, CNPJ</li>
                <li>Preferências de tema</li>
                <li>Usuários do sistema</li>
                <li>Integrações (WhatsApp, e-mail, backup)</li>
              </ul>
            </div>
            <button className="btn-main" disabled style={{opacity:.6}}>Salvar configurações (em breve)</button>
          </div>
        )}
      </main>
    </div>
  );
}
