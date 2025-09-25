import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Utilitários de validação e formatação
const validationUtils = {
  // Validação de CPF
  isValidCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
    let digit1 = (sum * 10) % 11;
    if (digit1 === 10) digit1 = 0;
    if (digit1 !== parseInt(cpf[9])) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
    let digit2 = (sum * 10) % 11;
    if (digit2 === 10) digit2 = 0;
    if (digit2 !== parseInt(cpf[10])) return false;
    
    return true;
  },

  // Formatação de CPF
  formatCPF(value) {
    const digits = value.replace(/[^\d]/g, '');
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  },

  // Formatação de telefone
  formatPhone(value) {
    const digits = value.replace(/[^\d]/g, '');
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  },

  // Formatação de valor monetário
  formatCurrency(value) {
    const number = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(number).replace('R$', '').trim();
  },

  // Validação de email
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Validação de data
  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }
};

// Injeta estilos globais uma única vez
if (typeof window !== 'undefined' && !document.getElementById('modern-seguros-styles')) {
  const style = document.createElement('style');
  style.id = 'modern-seguros-styles';
  style.innerHTML = `
  :root { --primary:#1976d2; --primaryAlt:#4fc3f7; --bg:#f3f8fc; --text:#222; }
  [data-theme="dark"] { --bg:#0f1720; --text:#e6edf5; --primary:#64b5f6; --primaryAlt:#2196f3; }
  body { font-family: 'Inter', Arial, sans-serif; background:var(--bg); color:var(--text); }
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
  .btn-main { background:linear-gradient(92deg,var(--primaryAlt),var(--primary)); color:#fff; border:none; border-radius:10px; padding:11px 22px; font-weight:600; cursor:pointer; box-shadow:0 3px 10px #1976d244; display:inline-flex; gap:6px; align-items:center; transition:.25s; }
    .btn-main:hover { filter:brightness(1.05); transform:translateY(-2px); box-shadow:0 6px 18px #1976d255; }
    .btn-secondary { background:#e6eef7; color:#1769aa; border:none; border-radius:8px; padding:9px 18px; font-weight:500; cursor:pointer; transition:.25s; }
    .btn-secondary:hover { background:#d2e4f7; }
    .search-input { 
      width: 100%; 
      padding: 12px 16px 12px 44px; 
      border: 1px solid #dce7f0; 
      border-radius: 10px; 
      font-size: 14px; 
      background: #ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236a8aa2'%3E%3Cpath d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E") no-repeat 16px center;
      background-size: 20px 20px;
      transition: all 0.2s ease;
      margin: 0 0 4px 0;
    }
    .search-input:focus { 
      outline: none; 
      border-color: #1976d2; 
      box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
      background-color: #fbfcfe;
    }
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
    /* Ordenação refinada */
    .sort-controls { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      margin: 12px 0 8px; 
      padding: 12px 16px; 
      background: #ffffff; 
      border: 1px solid #e1e8ed; 
      border-radius: 8px; 
      box-shadow: 0 1px 4px rgba(15, 53, 84, 0.04);
    }
    .sort-label { 
      font-size: 12px; 
      font-weight: 600; 
      color: #4b6980; 
      text-transform: uppercase; 
      letter-spacing: 0.5px; 
      margin-right: 8px;
    }
    .ordenacao-btn { 
      padding: 6px 12px; 
      border-radius: 6px; 
      background: #f8fafc; 
      color: #4b6980; 
      border: 1px solid #e1e8ed; 
      font-size: 12px; 
      font-weight: 500; 
      cursor: pointer; 
      transition: all 0.2s ease;
    }
    .ordenacao-btn.active { 
      background: #1976d2; 
      color: #ffffff; 
      border-color: #1976d2; 
    }
    .ordenacao-btn:not(.active):hover { 
      background: #f0f6fc; 
      border-color: #b8d4f0; 
    }
    .sort-info { 
      font-size: 11px; 
      color: #6a8aa2; 
      font-weight: 500; 
      margin-left: auto;
    }
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
    /* --- Filtros refinados --- */
    .filters-section { 
      background: linear-gradient(180deg, #fbfcfe, #f8fafc); 
      border: 1px solid #e1e8ed; 
      border-radius: 12px; 
      padding: 16px 20px; 
      margin: 16px 0; 
      box-shadow: 0 2px 8px rgba(15, 53, 84, 0.06);
    }
    .filters-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .filter-group { display: flex; align-items: center; gap: 8px; }
    .filter-label { 
      font-size: 13px; 
      font-weight: 600; 
      color: #4b6980; 
      text-transform: uppercase; 
      letter-spacing: 0.5px; 
      margin-right: 4px;
    }
    .chip-filter { 
      padding: 7px 16px; 
      border-radius: 20px; 
      background: #ffffff; 
      color: #4b6980; 
      font-size: 13px; 
      font-weight: 500; 
      cursor: pointer; 
      border: 1px solid #dce7f0; 
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .chip-filter.active { 
      background: #1976d2; 
      color: #ffffff; 
      border-color: #1976d2; 
      box-shadow: 0 2px 6px rgba(25, 118, 210, 0.25);
    }
    .chip-filter:not(.active):hover { 
      background: #f0f6fc; 
      border-color: #b8d4f0; 
      transform: translateY(-1px);
    }
    .filter-divider { width: 1px; height: 20px; background: #dce7f0; margin: 0 4px; }
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
    /* Validação de formulário */
    .form-error { color: #e53935; font-size: 12px; margin-top: 4px; display: block; }
    .input-error { border-color: #e53935 !important; box-shadow: 0 0 0 2px rgba(229, 57, 53, 0.1); }
    .input-error:focus { border-color: #e53935 !important; box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.2); }
    `;
  document.head.appendChild(style);
}export default function Home() {

  const [order, setOrder] = useState({ column: 'vigencia_fim', ascending: true });
  const [theme, setTheme] = useState(typeof window !== 'undefined' ? (localStorage.getItem('theme') || 'light') : 'light');
  const [primary, setPrimary] = useState(typeof window !== 'undefined' ? (localStorage.getItem('primary') || '#1976d2') : '#1976d2');
  const [primaryAlt, setPrimaryAlt] = useState(typeof window !== 'undefined' ? (localStorage.getItem('primaryAlt') || '#4fc3f7') : '#4fc3f7');
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [alertsAsToast, setAlertsAsToast] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos' | 'vencidos' | 'vencendo'
  const [anexoFilter, setAnexoFilter] = useState('todos'); // 'todos' | 'com' | 'sem'
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

  // Estados para controle de validação
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsSearch, setLogsSearch] = useState('');

  // Auth (Supabase)
  const [currentUser, setCurrentUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (mounted) setCurrentUser(data?.user || null);
      } catch {
        // ignore
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });
    return () => { mounted = false; sub?.subscription?.unsubscribe?.(); };
  }, []);

  async function signIn() {
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) throw error;
    } catch (e) {
      alert(e.message || 'Falha ao entrar');
    } finally { setAuthLoading(false); }
  }

  async function signUp() {
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      if (error) throw error;
      alert('Cadastro realizado. Verifique seu e-mail para confirmar (se aplicável).');
    } catch (e) {
      alert(e.message || 'Falha ao cadastrar');
    } finally { setAuthLoading(false); }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  async function logAction({ action, entity = null, entity_id = null, user = (currentUser?.email || null), details = null }) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, entity, entity_id, user, details }),
      });
    } catch (e) {
      console.warn('Failed to log action:', e);
    }
  }

  // Função para limpar e validar o formulário
  function validateForm(data) {
    const errors = {};
    
    // Validações obrigatórias
    if (!data.cliente_nome.trim()) errors.cliente_nome = 'Nome é obrigatório';
    if (!data.cliente_cpf.trim()) errors.cliente_cpf = 'CPF é obrigatório';
    else if (!validationUtils.isValidCPF(data.cliente_cpf)) errors.cliente_cpf = 'CPF inválido';
    
    if (!data.tipo_seguro.trim()) errors.tipo_seguro = 'Tipo de seguro é obrigatório';
    if (!data.seguradora.trim()) errors.seguradora = 'Seguradora é obrigatória';
    
    // Validações de formato
    if (data.cliente_numero && data.cliente_numero.replace(/[^\d]/g, '').length < 10) {
      errors.cliente_numero = 'Telefone deve ter pelo menos 10 dígitos';
    }
    
    if (data.premio && isNaN(parseFloat(data.premio.replace(/[^\d,.-]/g, '').replace(',', '.')))) {
      errors.premio = 'Prêmio deve ser um valor numérico válido';
    }
    
    // Validações de data
    if (data.vigencia_inicio && !validationUtils.isValidDate(data.vigencia_inicio)) {
      errors.vigencia_inicio = 'Data de início inválida';
    }
    if (data.vigencia_fim && !validationUtils.isValidDate(data.vigencia_fim)) {
      errors.vigencia_fim = 'Data de fim inválida';
    }
    
    // Validação lógica de datas
    if (data.vigencia_inicio && data.vigencia_fim) {
      const inicio = new Date(data.vigencia_inicio);
      const fim = new Date(data.vigencia_fim);
      if (fim <= inicio) {
        errors.vigencia_fim = 'Data de fim deve ser posterior à data de início';
      }
    }
    
    return errors;
  }

  // Handlers para formatação automática
  function handleCPFChange(value) {
    const formatted = validationUtils.formatCPF(value);
    setFormData(prev => ({ ...prev, cliente_cpf: formatted }));
    
    // Remove erro quando CPF fica válido
    if (validationUtils.isValidCPF(formatted)) {
      setFormErrors(prev => ({ ...prev, cliente_cpf: null }));
    }
  }

  function handlePhoneChange(value) {
    const formatted = validationUtils.formatPhone(value);
    setFormData(prev => ({ ...prev, cliente_numero: formatted }));
  }

  function handleCurrencyChange(value) {
    // Permite apenas números, vírgula e ponto
    const cleanValue = value.replace(/[^\d,.-]/g, '');
    setFormData(prev => ({ ...prev, premio: cleanValue }));
  }

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

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
      document.documentElement.style.setProperty('--primary', primary);
      document.documentElement.style.setProperty('--primaryAlt', primaryAlt);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
      localStorage.setItem('primary', primary);
      localStorage.setItem('primaryAlt', primaryAlt);
    }
  }, [theme, primary, primaryAlt]);

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
    (s.cliente_nome.toLowerCase().includes(search.toLowerCase()) || s.cliente_cpf.includes(search) || (s.cliente_numero && s.cliente_numero.includes(search))) &&
    (statusFilter === 'todos' || (statusFilter === 'vencidos' && new Date(s.vigencia_fim) < hoje) || (statusFilter === 'vencendo' && (()=>{const fim=new Date(s.vigencia_fim);const diff=(fim-hoje)/(1000*60*60*24);return diff>=0 && diff<=30;})())) &&
    (anexoFilter === 'todos' || (anexoFilter === 'com' && !!s.apolice_pdf) || (anexoFilter === 'sem' && !s.apolice_pdf))
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
    // Log de exportação
    logAction({ action: 'export_csv', entity: 'seguros', details: { tipo: 'vencidos', quantidade: vencidos.length } });
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
    // Log de exportação
    logAction({ action: 'export_csv', entity: 'seguros', details: { tipo: 'filtrados', filtro_status: statusFilter, termo_busca: search, quantidade: segurosFiltrados.length } });
  }

  async function handleUploadPDF(seguro, file){
    try{
      setUploadingId(seguro.id);
      
      // Converte arquivo para base64
      const fileContent = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result.split(',')[1]; // Remove o prefixo data:...;base64,
          resolve(result);
        };
        reader.readAsDataURL(file);
      });

      // Faz upload via API (servidor)
      const uploadRes = await fetch('/api/upload-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileContent: fileContent,
          seguroId: seguro.id
        })
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const { path: internalPath } = await uploadRes.json();

      // Atualiza o seguro com o path do arquivo (servidor)
      await fetch('/api/seguros', { 
        method:'PUT', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ ...seguro, apolice_pdf: internalPath }) 
      });
      
      // Atualização otimista no estado local para exibir o botão "Ver PDF" imediatamente
      setSeguros(prev => prev.map(item => item.id === seguro.id ? { ...item, apolice_pdf: internalPath } : item));
      
      await fetchSeguros(order.column, order.ascending);
      alert('PDF anexado com sucesso.');
      
      // Log da ação de upload
      logAction({ action: 'upload_pdf', entity: 'seguro', entity_id: seguro.id, details: { arquivo: file.name, caminho: internalPath } });
    }catch(e){
      console.error(e);
      alert(`Falha ao anexar PDF: ${e.message}`);
    }finally{
      setUploadingId(null);
    }
  }

  async function salvarSeguro(e) {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validar formulário
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      // Mostrar primeiro erro encontrado
      const firstError = Object.values(errors)[0];
      alert(`Erro de validação: ${firstError}`);
      return;
    }
    
    setFormErrors({}); // Limpar erros
    
    try {
      // Preparar dados com formatação correta
      const dataToSave = {
        ...formData,
        cliente_cpf: formData.cliente_cpf.replace(/[^\d]/g, ''), // Salvar CPF só com números
        premio: parseFloat(formData.premio.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0
      };
      
      let res;
      if (formData.id) {
        res = await fetch('/api/seguros', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSave)
        });
      } else {
        const payload = { ...dataToSave };
        delete payload.id;
        res = await fetch('/api/seguros', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
      }
      if (!res.ok) throw new Error('Erro ao salvar');
      
      // Log de criação/atualização
      if (formData.id) {
        logAction({ action: 'update', entity: 'seguro', entity_id: formData.id, details: { campos: { ...formData } } });
      } else {
        logAction({ action: 'create', entity: 'seguro', details: { campos: { ...formData, id: undefined } } });
      }
      resetForm();
      setFormVisible(false);
      fetchSeguros(order.column, order.ascending);
      alert(formData.id ? 'Seguro atualizado com sucesso!' : 'Seguro cadastrado com sucesso!');
    } catch (e) { 
      console.error(e); 
      alert('Erro ao salvar seguro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
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
      // Log de exclusão
      logAction({ action: 'delete', entity: 'seguro', entity_id: id });
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
    setFormErrors({}); // Limpar erros de validação
    setIsSubmitting(false);
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
    // Log de exportação de relatório
    logAction({ action: 'export_csv', entity: 'relatorios', details: { tipo: 'premios_mensal', meses: rows.length } });
  }

  // Nova função para buscar logs
  async function fetchLogs() {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/logs');
      if (!res.ok) throw new Error('Erro ao buscar logs');
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      console.error(e);
    }
    setLogsLoading(false);
  }

  // Chama fetchLogs ao abrir a seção de configurações
  useEffect(() => {
    if (section === 'config') {
      fetchLogs();
    }
  }, [section]);

  // Função para atualizar logs
  function refreshLogs() {
    fetchLogs();
  }

  function exportLogsCSV() {
    const visible = (logs||[]).filter(l => {
      const s = logsSearch.trim().toLowerCase();
      if (!s) return true;
      const blob = `${l.action||''} ${l.entity||''} ${l.entity_id||''} ${l.user||''} ${JSON.stringify(l.details||'')}`.toLowerCase();
      return blob.includes(s);
    });
    if (visible.length === 0) { alert('Sem logs para exportar.'); return; }
    const headers = ['id','created_at','action','entity','entity_id','user','details'];
    const rows = visible.map(l => [
      l.id,
      l.created_at,
      l.action,
      l.entity || '',
      l.entity_id || '',
      l.user || '',
      typeof l.details === 'object' ? JSON.stringify(l.details) : (l.details || '')
    ].map(v => String(v).replaceAll(';', ',')).join(';'));
    const csv = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'logs.csv'; a.click();
    URL.revokeObjectURL(url);
    logAction({ action: 'export_csv', entity: 'logs', details: { quantidade: visible.length } });
  }

  return (
    <div className="app-shell">
      {!currentUser ? (
        // Tela de Login (quando não autenticado)
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh', 
          width: '100%',
          background: 'var(--bg)',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: 20, 
            padding: 40, 
            boxShadow: '0 4px 28px #1769aa22', 
            maxWidth: 400, 
            width: '100%'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <div className="brand" style={{ justifyContent: 'center', fontSize: 24, marginBottom: 10 }}>
                <div className="logo" /> <span>Saulari Seguros</span>
              </div>
              <p style={{ color: '#4b6980', margin: 0 }}>Faça login para acessar o sistema</p>
            </div>
            
            <form onSubmit={(e)=>{ e.preventDefault(); signIn(); }} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#4b6980', display: 'block', marginBottom: 6 }}>E-mail</label>
                <input 
                  className="search-input"
                  type="email"
                  value={authEmail} 
                  onChange={(e)=>setAuthEmail(e.target.value)} 
                  placeholder="email@exemplo.com"
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#4b6980', display: 'block', marginBottom: 6 }}>Senha</label>
                <input 
                  className="search-input"
                  type="password" 
                  value={authPassword} 
                  onChange={(e)=>setAuthPassword(e.target.value)} 
                  placeholder="••••••••"
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                <button type="submit" className="btn-main" disabled={authLoading} style={{ width: '100%' }}>
                  {authLoading ? 'Entrando...' : 'Entrar'}
                </button>
                <button type="button" className="btn-secondary" onClick={signUp} disabled={authLoading} style={{ width: '100%' }}>
                  Criar conta
                </button>
              </div>
              <small style={{ color: '#4b6980', textAlign: 'center', fontSize: 12 }}>
                Obs.: Criação de conta pode exigir confirmação por e-mail
              </small>
            </form>
          </div>
        </div>
      ) : (
        // Sistema principal (quando autenticado)
        <>
      <aside className="sidebar">
        <div className="brand"><div className="logo" /> <span>Saulari Seguros</span></div>
        <nav className="nav" aria-label="Principal">
          <NavLink label="Dashboard" icon="📊" value="dashboard" />
          <NavLink label="Seguros" icon="📋" value="seguros" />
          <NavLink label="Relatórios" icon="📈" value="relatorios" />
          <NavLink label="Configurações" icon="⚙️" value="config" />
        </nav>
        <div style={{marginTop:'auto', opacity:.9, fontSize:12, paddingTop:10, borderTop:'1px solid #13476f'}}>
          <div style={{marginBottom:6}}>
            <div style={{fontWeight:700}}>Conectado</div>
            <div style={{opacity:.9}}>{currentUser.email}</div>
            <button className="mini-btn" style={{marginTop:8}} onClick={signOut}>Sair</button>
          </div>
          © {new Date().getFullYear()} Saulari
        </div>
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
            <div className="kpi">
              <h3>Sem anexo</h3>
              <div className="value">{seguros.filter(s=>!s.apolice_pdf).length}</div>
              <div className="sub">Precisa anexar PDF</div>
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

      <input className="search-input" placeholder="Buscar por nome, CPF ou telefone" value={search} onChange={e => setSearch(e.target.value)} />

      {formVisible && (
        <form className="form-wrapper" onSubmit={salvarSeguro}>
          <h2 style={{ margin: '0 0 14px', color: '#1976d2', fontSize: 22, fontWeight: 700 }}>
            {formData.id ? 'Editar Seguro' : 'Novo Seguro'}
          </h2>
          <div className="form-grid">
            <div>
              <label>Nome do Cliente *</label>
              <input 
                value={formData.cliente_nome} 
                required 
                onChange={e => setFormData({ ...formData, cliente_nome: e.target.value })}
                style={formErrors.cliente_nome ? { borderColor: '#e53935' } : {}}
              />
              {formErrors.cliente_nome && <small style={{color: '#e53935', fontSize: 12}}>{formErrors.cliente_nome}</small>}
            </div>
            <div>
              <label>CPF *</label>
              <input 
                value={formData.cliente_cpf} 
                required 
                placeholder="000.000.000-00"
                maxLength={14}
                onChange={e => handleCPFChange(e.target.value)}
                style={formErrors.cliente_cpf ? { borderColor: '#e53935' } : {}}
              />
              {formErrors.cliente_cpf && <small style={{color: '#e53935', fontSize: 12}}>{formErrors.cliente_cpf}</small>}
            </div>
            <div>
              <label>Telefone</label>
              <input 
                value={formData.cliente_numero} 
                placeholder="(11) 99999-9999"
                maxLength={15}
                onChange={e => handlePhoneChange(e.target.value)}
                style={formErrors.cliente_numero ? { borderColor: '#e53935' } : {}}
              />
              {formErrors.cliente_numero && <small style={{color: '#e53935', fontSize: 12}}>{formErrors.cliente_numero}</small>}
            </div>
            <div>
              <label>Tipo de Seguro *</label>
              <input 
                value={formData.tipo_seguro} 
                required 
                onChange={e => setFormData({ ...formData, tipo_seguro: e.target.value })}
                style={formErrors.tipo_seguro ? { borderColor: '#e53935' } : {}}
              />
              {formErrors.tipo_seguro && <small style={{color: '#e53935', fontSize: 12}}>{formErrors.tipo_seguro}</small>}
            </div>
            <div>
              <label>Seguradora *</label>
              <input 
                value={formData.seguradora} 
                required 
                onChange={e => setFormData({ ...formData, seguradora: e.target.value })}
                style={formErrors.seguradora ? { borderColor: '#e53935' } : {}}
              />
              {formErrors.seguradora && <small style={{color: '#e53935', fontSize: 12}}>{formErrors.seguradora}</small>}
            </div>
            <div>
              <label>Prêmio (R$)</label>
              <input 
                value={formData.premio} 
                placeholder="1500,00"
                onChange={e => handleCurrencyChange(e.target.value)}
                style={formErrors.premio ? { borderColor: '#e53935' } : {}}
              />
              {formErrors.premio && <small style={{color: '#e53935', fontSize: 12}}>{formErrors.premio}</small>}
            </div>
            <div>
              <label>Vigência Início</label>
              <input 
                type="date" 
                value={formData.vigencia_inicio} 
                onChange={e => setFormData({ ...formData, vigencia_inicio: e.target.value })}
                style={formErrors.vigencia_inicio ? { borderColor: '#e53935' } : {}}
              />
              {formErrors.vigencia_inicio && <small style={{color: '#e53935', fontSize: 12}}>{formErrors.vigencia_inicio}</small>}
            </div>
            <div>
              <label>Vigência Fim</label>
              <input 
                type="date" 
                value={formData.vigencia_fim} 
                onChange={e => setFormData({ ...formData, vigencia_fim: e.target.value })}
                style={formErrors.vigencia_fim ? { borderColor: '#e53935' } : {}}
              />
              {formErrors.vigencia_fim && <small style={{color: '#e53935', fontSize: 12}}>{formErrors.vigencia_fim}</small>}
            </div>
          </div>
          <div className="actions-row">
            <button 
              type="submit" 
              className="btn-main" 
              style={{ marginBottom: 0 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : (formData.id ? 'Salvar alterações' : 'Cadastrar')}
            </button>
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

      {/* Filtros profissionais */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <span className="filter-label">Status</span>
            <button className={`chip-filter ${statusFilter==='todos'?'active':''}`} onClick={()=>setStatusFilter('todos')}>
              Todos ({seguros.length})
            </button>
            <button className={`chip-filter ${statusFilter==='vencidos'?'active':''}`} onClick={()=>setStatusFilter('vencidos')}>
              Vencidos ({vencidos.length})
            </button>
            <button className={`chip-filter ${statusFilter==='vencendo'?'active':''}`} onClick={()=>setStatusFilter('vencendo')}>
              Em 30 dias ({vencendo.length})
            </button>
          </div>
          
          <div className="filter-divider"></div>
          
          <div className="filter-group">
            <span className="filter-label">Anexos</span>
            <button className={`chip-filter ${anexoFilter==='todos'?'active':''}`} onClick={()=>setAnexoFilter('todos')}>
              Todos
            </button>
            <button className={`chip-filter ${anexoFilter==='com'?'active':''}`} onClick={()=>setAnexoFilter('com')}>
              Com PDF ({seguros.filter(s=>!!s.apolice_pdf).length})
            </button>
            <button className={`chip-filter ${anexoFilter==='sem'?'active':''}`} onClick={()=>setAnexoFilter('sem')}>
              Sem PDF ({seguros.filter(s=>!s.apolice_pdf).length})
            </button>
          </div>
        </div>
      </div>

      <div className="sort-controls">
        <span className="sort-label">Ordenar por</span>
        <button className={`ordenacao-btn ${order.column === 'vigencia_fim' && order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('vigencia_fim', true)}>
          Vencimento ↑
        </button>
        <button className={`ordenacao-btn ${order.column === 'vigencia_fim' && !order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('vigencia_fim', false)}>
          Vencimento ↓
        </button>
        <button className={`ordenacao-btn ${order.column === 'tipo_seguro' && order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('tipo_seguro', true)}>
          Tipo ↑
        </button>
        <button className={`ordenacao-btn ${order.column === 'tipo_seguro' && !order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('tipo_seguro', false)}>
          Tipo ↓
        </button>
        <button className={`ordenacao-btn ${order.column === 'seguradora' && order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('seguradora', true)}>
          Seguradora ↑
        </button>
        <button className={`ordenacao-btn ${order.column === 'seguradora' && !order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('seguradora', false)}>
          Seguradora ↓
        </button>
        <button className={`ordenacao-btn ${order.column === 'premio' && order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('premio', true)}>
          Prêmio ↑
        </button>
        <button className={`ordenacao-btn ${order.column === 'premio' && !order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('premio', false)}>
          Prêmio ↓
        </button>
        
        <span className="sort-info">
          {order.column} ({order.ascending ? 'crescente' : 'decrescente'})
        </span>
      </div>

  <table className="seguros">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>CPF</th>
            <th>Telefone</th>
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
                <td>{validationUtils.formatCPF(s.cliente_cpf || '')}</td>
                <td>{validationUtils.formatPhone(s.cliente_numero || '') || '-'}</td>
                <td>{s.tipo_seguro}</td>
                <td>{s.seguradora}</td>
                <td>R$ {validationUtils.formatCurrency(s.premio?.toString() || '0')}</td>
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
                      <>
                        <a
                          className="mini-btn"
                          href={`/api/apolice-proxy?path=${encodeURIComponent(s.apolice_pdf)}&signed=1`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{background:'#e6f5ec', color:'#0a7a3e', border:'1px solid #b9e3c9'}}
                        >
                          Ver PDF
                        </a>
                        <a
                          className="mini-btn"
                          href={`/api/apolice-proxy?path=${encodeURIComponent(s.apolice_pdf)}&download=1`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{background:'#eef3f7', color:'#0f3554', border:'1px solid #cfdbe5'}}
                        >
                          Baixar
                        </a>
                      </>
                    )}
                    {s.apolice_pdf && (
                      <a
                        className="mini-btn"
                        href={`/api/apolice-proxy?path=${encodeURIComponent(s.apolice_pdf)}&download=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{background:'#eef2ff', color:'#0f3554', border:'1px solid #c7d2fe'}}
                      >
                        Baixar PDF
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
            <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 0.5 }}>⚙️ Configurações</h1>
            <p style={{ margin: '6px 0 22px', color: '#4b6980', fontSize: 14 }}>Personalize preferências, dados da empresa e integrações.</p>

            {/* Autenticação */}
            <div style={{background:'#f6fbff', borderRadius:12, padding:24, marginBottom:18}}>
              <b>Conta</b>
              <div style={{marginTop:12}}>
                <div style={{marginBottom:8}}>Usuário: <strong>{currentUser.email}</strong></div>
                <button className="btn-secondary" type="button" onClick={signOut}>Sair da conta</button>
              </div>
            </div>
            <div style={{background:'#f6fbff', borderRadius:12, padding:24, marginBottom:18}}>
              <b>Preferências de Notificação</b>
              <form style={{marginTop:16, marginBottom:24, display:'grid', gap:18, maxWidth:420}}>
                <label style={{display:'flex', alignItems:'center', gap:10}}>
                  <input type="checkbox" /> Receber alertas por e-mail para seguros vencendo
                </label>
                <label style={{display:'flex', alignItems:'center', gap:10}}>
                  <input type="checkbox" /> Receber alertas por WhatsApp para seguros vencendo
                </label>
                <label style={{display:'flex', alignItems:'center', gap:10}}>
                  <input type="checkbox" /> Receber alertas por e-mail para seguros vencidos
                </label>
                <label style={{display:'flex', alignItems:'center', gap:10}}>
                  <input type="checkbox" /> Receber alertas por WhatsApp para seguros vencidos
                </label>
                <label style={{display:'flex', alignItems:'center', gap:10}}>
                  <input type="checkbox" /> Ativar notificações de renovação automática
                </label>
                <button className="btn-main" type="button" style={{marginTop:10, width:180}}>Salvar preferências</button>
              </form>
            </div> {/* Fim Preferências de Notificação */}

            <div style={{background:'#f6fbff', borderRadius:12, padding:24, marginBottom:18}}>
              <b>Personalização Visual</b>
              <div style={{display:'grid', gap:14, marginTop:12, maxWidth:520}}>
                <div>
                  <label style={{fontSize:12, fontWeight:700, textTransform:'uppercase', color:'#4b6980'}}>Tema</label>
                  <div style={{display:'flex', gap:8}}>
                    <button type="button" className="btn-secondary" onClick={() => setTheme('light')} aria-pressed={theme==='light'}>Claro</button>
                    <button type="button" className="btn-secondary" onClick={() => setTheme('dark')} aria-pressed={theme==='dark'}>Escuro</button>
                  </div>
                </div>
                <div>
                  <label style={{fontSize:12, fontWeight:700, textTransform:'uppercase', color:'#4b6980'}}>Cor Primária</label>
                  <input type="color" value={primary} onChange={(e)=> setPrimary(e.target.value)} />
                </div>
                <div>
                  <label style={{fontSize:12, fontWeight:700, textTransform:'uppercase', color:'#4b6980'}}>Cor Primária (Alt)</label>
                  <input type="color" value={primaryAlt} onChange={(e)=> setPrimaryAlt(e.target.value)} />
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button className="btn-secondary" type="button" onClick={()=>{ setPrimary('#1976d2'); setPrimaryAlt('#4fc3f7'); }}>Restaurar cores padrão</button>
                </div>
              </div>
            </div> {/* Fim Personalização Visual */}

            {/* Logs e Auditoria */}
            <div style={{background:'#f6fbff', borderRadius:12, padding:24, marginBottom:18}}>
              <b>Logs e Auditoria</b>
              <div style={{display:'flex', gap:8, alignItems:'center', marginTop:12}}>
                <input className="search-input" placeholder="Pesquisar em ação/entidade/usuário/detalhes" value={logsSearch} onChange={e=>setLogsSearch(e.target.value)} />
                <button className="btn-secondary" type="button" onClick={refreshLogs} disabled={logsLoading}>{logsLoading? 'Carregando...':'Atualizar'}</button>
                <button className="btn-secondary" type="button" onClick={exportLogsCSV}>⬇️ Exportar CSV</button>
              </div>
              <div style={{marginTop:12, maxHeight:320, overflow:'auto', border:'1px solid #e2e9f0', borderRadius:10}}>
                <table className="seguros" style={{marginTop:0}}>
                  <thead>
                    <tr>
                      <th style={{width:160}}>Data</th>
                      <th>Ação</th>
                      <th>Entidade</th>
                      <th>ID</th>
                      <th>Usuário</th>
                      <th>Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(logs||[])
                      .filter(l => {
                        const s = logsSearch.trim().toLowerCase();
                        if (!s) return true;
                        const blob = `${l.action||''} ${l.entity||''} ${l.entity_id||''} ${l.user||''} ${JSON.stringify(l.details||'')}`.toLowerCase();
                        return blob.includes(s);
                      })
                      .map(l => (
                      <tr key={l.id}>
                        <td>{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                        <td>{l.action}</td>
                        <td>{l.entity||'-'}</td>
                        <td>{l.entity_id||'-'}</td>
                        <td>{l.user||'-'}</td>
                        <td style={{maxWidth:280, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{typeof l.details === 'object' ? JSON.stringify(l.details) : (l.details || '-')}</td>
                      </tr>
                    ))}
                    {(!logs || logs.length===0) && (
                      <tr><td colSpan={6} style={{textAlign:'center', padding:16, color:'#4b6980'}}>Sem logs disponíveis.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div> {/* Fim Logs e Auditoria */}

            {/* Outras seções de configurações... */}
          </div>
        )}
      </main>
        </>
      )}
    </div>
  );
}
