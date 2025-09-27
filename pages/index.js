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
  :root { --primary:#4fc3f7; --primaryAlt:#64b5f6; --bg:#0a0e13; --text:#e2e8f0; --card-bg:#1a202c; --sidebar-bg:#0f172a; }
  body { font-family: 'Inter', Arial, sans-serif; background:var(--bg); color:var(--text); margin:0; padding:0; }
  .app-shell { display:flex; min-height:100vh; background:var(--bg); }
  .sidebar { width:240px; background:var(--sidebar-bg); color:#e2e8f0; padding:22px 18px; position:sticky; top:0; height:100vh; box-shadow: 4px 0 16px rgba(0,0,0,0.3); border-right:1px solid #334155; }
  .brand { display:flex; align-items:center; gap:10px; font-weight:800; letter-spacing:.4px; color:#f1f5f9; }
  .brand .logo { width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#4fc3f7,#2563eb); box-shadow:0 6px 16px rgba(79,195,247,0.3); }
  .nav { margin-top:16px; display:flex; flex-direction:column; gap:6px; }
  .nav a { color:#cbd5e1; text-decoration:none; padding:9px 10px; border-radius:8px; font-weight:600; display:flex; align-items:center; gap:8px; transition:all 0.2s; }
  .nav a.active, .nav a:hover { background:#1e293b; color:#f1f5f9; }
  .content { flex:1; padding:26px; background:var(--bg); }
  .container-seguros { max-width:1400px; margin:0 auto; background:var(--card-bg); border-radius:20px; padding:26px 26px 36px; box-shadow:0 4px 28px rgba(0,0,0,0.4); animation:fadeIn .55s ease-out; border:1px solid #334155; }
    @keyframes fadeIn { from {opacity:0; transform:translateY(16px);} to {opacity:1; transform:translateY(0);} }
  .btn-main { background:linear-gradient(92deg,var(--primaryAlt),var(--primary)); color:#0a0e13; border:none; border-radius:10px; padding:11px 22px; font-weight:700; cursor:pointer; box-shadow:0 3px 10px rgba(79,195,247,0.3); display:inline-flex; gap:6px; align-items:center; transition:.25s; }
    .btn-main:hover { filter:brightness(1.1); transform:translateY(-2px); box-shadow:0 6px 18px rgba(79,195,247,0.4); }
    .btn-secondary { background:#374151; color:#e2e8f0; border:1px solid #4b5563; border-radius:8px; padding:9px 18px; font-weight:500; cursor:pointer; transition:.25s; }
    .btn-secondary:hover { background:#4b5563; border-color:#6b7280; }
    .search-input { 
      width: 100%; 
      padding: 12px 16px 12px 44px; 
      border: 1px solid #4b5563; 
      border-radius: 10px; 
      font-size: 14px; 
      background: #374151 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E") no-repeat 16px center;
      background-size: 20px 20px;
      transition: all 0.2s ease;
      margin: 0 0 4px 0;
      color: #e2e8f0;
    }
    .search-input::placeholder { color: #9ca3af; }
    .search-input:focus { 
      outline: none; 
      border-color: #4fc3f7; 
      box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.1);
      background-color: #4b5563;
    }
  .alerts-wrapper { margin:14px 0 2px; display:flex; flex-direction:column; gap:8px; position:relative; }
  .alerts-wrapper.sticky { position:sticky; top:0; z-index:30; padding-top:4px; }
  .alert { border-radius:12px; padding:12px 16px; font-weight:500; display:flex; gap:10px; align-items:center; box-shadow:0 3px 14px rgba(0,0,0,0.2),0 1px 2px rgba(0,0,0,0.3); animation:fadeIn .5s; line-height:1.25; backdrop-filter:blur(6px); }
  .alert strong { font-weight:700; }
  .alert small { font-size:12px; opacity:.8; font-weight:400; }
  .alert-vencidos { background:linear-gradient(125deg,#7f1d1d,#991b1b); color:#fecaca; border:1px solid #dc2626; }
  .alert-vencendo { background:linear-gradient(125deg,#78350f,#92400e); color:#fde68a; border:1px solid #f59e0b; }
  .alert-badges { display:flex; gap:10px; flex-wrap:wrap; }
  .alert-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 10px 5px 8px; background:#374151; border-radius:30px; font-size:12px; font-weight:600; color:#4fc3f7; box-shadow:0 2px 6px rgba(0,0,0,0.3); border:1px solid #4b5563; }
  .alert-badge span.dot { width:10px; height:10px; border-radius:50%; display:inline-block; }
  .alert-badge .dot.red { background:#e53935; box-shadow:0 0 0 2px #ffffffcc,0 0 8px #e5393580; }
  .alert-badge .dot.yellow { background:#ffd600; box-shadow:0 0 0 2px #ffffffcc,0 0 8px #ffd60080; }
    .form-wrapper { background:#2d3748; border:1px solid #4a5568; border-radius:16px; padding:22px 22px 10px; margin:24px 0 30px; box-shadow:0 4px 18px rgba(0,0,0,0.3); animation:scaleIn .45s ease; }
    @keyframes scaleIn { from {opacity:0; transform:translateY(-14px) scale(.97);} to {opacity:1; transform:translateY(0) scale(1);} }
    .form-grid { display:grid; gap:14px; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); margin-bottom:4px; }
    .form-grid label { font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.5px; color:#cbd5e1; display:block; margin-bottom:4px; }
    .form-grid input { width:100%; padding:9px 10px; border:1.4px solid #4a5568; border-radius:8px; background:#374151; font-size:14px; transition:.22s; color:#e2e8f0; }
    .form-grid input::placeholder { color:#9ca3af; }
    .form-grid input:focus { border-color:#4fc3f7; box-shadow:0 0 0 3px rgba(79,195,247,0.2); outline:none; background:#4b5563; }
    .actions-row { display:flex; gap:12px; margin-top:14px; }
    .ordenacao-bar { display:flex; flex-wrap:wrap; gap:8px; margin:6px 0 2px; }
    /* Ordenação refinada */
    .sort-controls { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      margin: 12px 0 8px; 
      padding: 12px 16px; 
      background: #374151; 
      border: 1px solid #4b5563; 
      border-radius: 8px; 
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }
    .sort-label { 
      font-size: 12px; 
      font-weight: 600; 
      color: #cbd5e1; 
      text-transform: uppercase; 
      letter-spacing: 0.5px; 
      margin-right: 8px;
    }
    .ordenacao-btn { 
      padding: 6px 12px; 
      border-radius: 6px; 
      background: #4b5563; 
      color: #cbd5e1; 
      border: 1px solid #6b7280; 
      font-size: 12px; 
      font-weight: 500; 
      cursor: pointer; 
      transition: all 0.2s ease;
    }
    .ordenacao-btn.active { 
      background: #4fc3f7; 
      color: #0a0e13; 
      border-color: #4fc3f7; 
    }
    .ordenacao-btn:not(.active):hover { 
      background: #6b7280; 
      border-color: #9ca3af; 
    }
    .sort-info { 
      font-size: 11px; 
      color: #9ca3af; 
      font-weight: 500; 
      margin-left: auto;
    }
    .order-info { font-size:13px; font-style:italic; color:#4fc3f7; margin-top:4px; }
    table.seguros { width:100%; border-collapse:separate; border-spacing:0 6px; margin-top:14px; overflow-x:auto; }
    table.seguros thead th { text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:.7px; padding:10px 8px; background:#374151; color:#4fc3f7; font-weight:700; border:1px solid #4b5563; white-space:nowrap; }
    table.seguros thead th:first-child { border-left:1px solid #4b5563; border-top-left-radius:8px; border-bottom-left-radius:8px; }
    table.seguros thead th:last-child { border-right:1px solid #4b5563; border-top-right-radius:8px; border-bottom-right-radius:8px; }
    table.seguros tbody tr { background:#2d3748; box-shadow:0 2px 10px rgba(0,0,0,0.3); transition:.25s; border:1px solid #4a5568; }
    table.seguros tbody tr:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,0,0,0.4); }
    table.seguros tbody td { padding:8px 6px; font-size:13px; color:#e2e8f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px; }
    table.seguros tbody tr td:first-child { border-top-left-radius:8px; border-bottom-left-radius:8px; }
    table.seguros tbody tr td:last-child { border-top-right-radius:8px; border-bottom-right-radius:8px; }
    .indicador { width:14px; height:14px; display:inline-block; border-radius:50%; margin-right:6px; box-shadow:0 0 0 2px #ffffffaa; position:relative; top:2px; }
    .indicador.vencido { background:#e53935; animation:pulseRed 1.2s infinite alternate; border:2px solid #b71c1c; }
    .indicador.vencendo { background:#ffd600; animation:pulseYellow 1.2s infinite alternate; border:2px solid #bfa100; }
    @keyframes pulseRed { from { box-shadow:0 0 6px #e5393555;} to { box-shadow:0 0 14px #e53935aa;} }
    @keyframes pulseYellow { from { box-shadow:0 0 6px #ffd60055;} to { box-shadow:0 0 14px #ffd600aa;} }
    .table-actions { display:flex; gap:4px; }
    .mini-btn { background:#4b5563; color:#cbd5e1; border:1px solid #6b7280; padding:4px 8px; font-size:11px; border-radius:6px; cursor:pointer; font-weight:500; transition:.25s; white-space:nowrap; }
    .mini-btn:hover { background:#6b7280; color:#f1f5f9; }
    .mini-btn.danger { background:#7f1d1d; color:#fecaca; border-color:#991b1b; }
    .mini-btn.danger:hover { background:#991b1b; color:#fff; }
    .loading { color:#4fc3f7; font-weight:500; margin-top:18px; }
    /* --- Filtros refinados --- */
    .filters-section { 
      background: #374151; 
      border: 1px solid #4b5563; 
      border-radius: 12px; 
      padding: 16px 20px; 
      margin: 16px 0; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .filters-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .filter-group { display: flex; align-items: center; gap: 8px; }
    .filter-label { 
      font-size: 13px; 
      font-weight: 600; 
      color: #cbd5e1; 
      text-transform: uppercase; 
      letter-spacing: 0.5px; 
      margin-right: 4px;
    }
    .chip-filter { 
      padding: 7px 16px; 
      border-radius: 20px; 
      background: #4b5563; 
      color: #cbd5e1; 
      font-size: 13px; 
      font-weight: 500; 
      cursor: pointer; 
      border: 1px solid #6b7280; 
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .chip-filter.active { 
      background: #4fc3f7; 
      color: #0a0e13; 
      border-color: #4fc3f7; 
      box-shadow: 0 2px 6px rgba(79, 195, 247, 0.25);
    }
    .chip-filter:not(.active):hover { 
      background: #6b7280; 
      border-color: #9ca3af; 
      transform: translateY(-1px);
    }
    .filter-divider { width: 1px; height: 20px; background: #6b7280; margin: 0 4px; }
    .toast-container { position:fixed; right:24px; bottom:24px; display:flex; flex-direction:column; gap:10px; max-width:300px; z-index:500; }
    .toast { border-radius:14px; padding:14px 16px 14px 14px; font-size:14px; display:flex; gap:10px; align-items:flex-start; box-shadow:0 6px 28px rgba(0,0,0,0.4); background:#2d3748; border:1px solid #4a5568; animation:slideIn .5s ease; }
    @keyframes slideIn { from {opacity:0; transform:translateY(16px) scale(.96);} to {opacity:1; transform:translateY(0) scale(1);} }
    .toast.vencidos { border-left:6px solid #dc2626; }
    .toast.vencendo { border-left:6px solid #f59e0b; }
    .toast h4 { margin:0 0 4px; font-size:14px; font-weight:700; color:#e2e8f0; }
    .toast small { font-size:11px; opacity:.8; line-height:1.3; color:#cbd5e1; }
  /* Dashboard cards */
  .kpis { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px,1fr)); gap:12px; margin:14px 0 8px; }
  .kpi { background:#374151; border:1px solid #4b5563; border-radius:14px; padding:14px; box-shadow:0 4px 16px rgba(0,0,0,0.2); }
  .kpi h3 { margin:0; font-size:12px; color:#cbd5e1; text-transform:uppercase; letter-spacing:.5px; }
  .kpi .value { margin-top:6px; font-size:22px; font-weight:800; color:#4fc3f7; }
  .kpi .sub { font-size:12px; color:#9ca3af; margin-top:2px; }
    /* Status pill */
    .status-pill { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700; }
    .status-ativo { background:#065f46; color:#6ee7b7; border:1px solid #059669; }
    .status-vencendo { background:#92400e; color:#fde68a; border:1px solid #d97706; }
    .status-vencido { background:#7f1d1d; color:#fecaca; border:1px solid #dc2626; }
    /* Validação de formulário */
    .form-error { color: #fca5a5; font-size: 12px; margin-top: 4px; display: block; }
    .input-error { border-color: #dc2626 !important; box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1); }
    .input-error:focus { border-color: #dc2626 !important; box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2); }
    
    /* Responsividade para tabela */
    .table-container { overflow-x: auto; margin: 16px -26px; padding: 0 26px; }
    @media (max-width: 1200px) {
      table.seguros thead th, table.seguros tbody td { padding: 6px 4px; font-size: 12px; }
      .container-seguros { padding: 20px 16px 30px; }
      .content { padding: 16px; }
      .kpis { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .sidebar {
        width: 100vw;
        min-width: 0;
        max-width: 100vw;
        height: auto;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        border-radius: 0 0 12px 12px;
        padding: 10px 4vw 10px 4vw;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        background: var(--sidebar-bg);
      }
      .brand { font-size: 16px; }
      .nav { flex-direction: row; gap: 2vw; margin-top: 0; }
      .nav a { padding: 7px 4px; font-size: 14px; }
      .content { padding: 60px 2vw 2vw 2vw; }
      .container-seguros { padding: 8px 2vw 12px; border-radius: 8px; margin-top: 8px; }
      .kpis { grid-template-columns: 1fr; gap: 6px; }
      .filters-row { flex-direction: column; align-items: stretch; gap: 6px; }
      .filter-group { justify-content: flex-start; gap: 4px; }
      .sort-controls { flex-direction: column; gap: 6px; padding: 6px 2vw; }
      .table-container { margin: 8px -2vw; padding: 0 2vw; overflow-x: auto; }
      table.seguros { min-width: 520px; font-size: 12px; }
      table.seguros thead th, table.seguros tbody td { font-size: 11px; padding: 3px 1px; }
      .form-wrapper { padding: 8px 2vw 6px; border-radius: 6px; }
      .actions-row { flex-direction: column; gap: 6px; }
      .mini-btn, .btn-main, .btn-secondary { font-size: 14px; padding: 10px 12px; min-width: 44px; min-height: 36px; }
      .search-input { font-size: 14px; padding: 10px 10px 10px 36px; }
      .alerts-wrapper { gap: 4px; }
      .alert, .alert-vencidos, .alert-vencendo { font-size: 13px; padding: 7px 7px; }
      .kpi .value { font-size: 18px; }
      .kpi { padding: 10px; }
      .filters-section { padding: 10px 2vw; }
      .sort-label { font-size: 11px; }
      .chip-filter { font-size: 12px; padding: 6px 10px; }
      .table-actions { gap: 2px; }
      .alert-badge { font-size: 11px; padding: 4px 8px 4px 6px; }
      .form-grid { gap: 8px; }
      .form-grid label { font-size: 11px; }
      .form-grid input { font-size: 13px; padding: 7px 8px; }
      .loading { font-size: 15px; }
      /* Scrollbar visível para tabela */
      .table-container::-webkit-scrollbar { height: 8px; background: #222; }
      .table-container::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
    }
    `;
  document.head.appendChild(style);
}export default function Home() {

  const [order, setOrder] = useState({ column: 'vigencia_fim', ascending: true });
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formVisible, setFormVisible] = useState(false);
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
            background: '#1a202c', 
            borderRadius: 20, 
            padding: '32px 20px', 
            boxShadow: '0 4px 28px rgba(0,0,0,0.4)', 
            border: '1px solid #334155',
            maxWidth: 380, 
            width: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <div className="brand" style={{ justifyContent: 'center', fontSize: 24, marginBottom: 10 }}>
                <div className="logo" /> <span>Saulari Seguros</span>
              </div>
              <p style={{ color: '#cbd5e1', margin: 0 }}>Faça login para acessar o sistema</p>
            </div>
            
            <form onSubmit={(e)=>{ e.preventDefault(); signIn(); }} style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: '100%' }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#cbd5e1', display: 'block', marginBottom: 6 }}>E-mail</label>
                <input 
                  className="search-input"
                  type="email"
                  value={authEmail} 
                  onChange={(e)=>setAuthEmail(e.target.value)} 
                  placeholder="email@exemplo.com"
                  required
                  style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ width: '100%' }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#cbd5e1', display: 'block', marginBottom: 6 }}>Senha</label>
                <input 
                  className="search-input"
                  type="password"
                  value={authPassword} 
                  onChange={(e)=>setAuthPassword(e.target.value)} 
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10, width: '100%' }}>
                <button type="submit" className="btn-main" disabled={authLoading} style={{ width: '100%' }}>
                  {authLoading ? 'Entrando...' : 'Entrar'}
                </button>
                <button type="button" className="btn-secondary" onClick={signUp} disabled={authLoading} style={{ width: '100%' }}>
                  Criar conta
                </button>
              </div>
              <small style={{ color: '#9ca3af', textAlign: 'center', fontSize: 12, width: '100%' }}>
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
          <NavLink label="Cotação" icon="💰" value="cotacao" />
          <NavLink label="Relatórios" icon="📈" value="relatorios" />
          <NavLink label="Configurações" icon="⚙️" value="config" />
        </nav>
        <div style={{marginTop:'auto', opacity:.9, fontSize:12, paddingTop:10, borderTop:'1px solid #4b5563'}}>
          <div style={{marginBottom:6}}>
            <div style={{fontWeight:700, color:'#f1f5f9'}}>Conectado</div>
            <div style={{opacity:.9, color:'#cbd5e1'}}>{currentUser.email}</div>
            <button className="mini-btn" style={{marginTop:8}} onClick={signOut}>Sair</button>
          </div>
          <div style={{color:'#9ca3af'}}>© {new Date().getFullYear()} Saulari</div>
        </div>
      </aside>
      <main className="content">
        {section === 'dashboard' && (
          <div className="container-seguros">
            <h1 style={{ color: '#4fc3f7', margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 0.5 }}>📊 Dashboard</h1>
            <p style={{ margin: '6px 0 22px', color: '#cbd5e1', fontSize: 14 }}>Visão geral dos seguros e indicadores.</p>
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
            <div style={{marginTop:32, background:'#374151', borderRadius:12, padding:24, textAlign:'center', color:'#4fc3f7', fontWeight:600, border:'1px solid #4b5563'}}>
              [Gráfico de prêmios por mês aqui]
              <br />
              <span style={{fontSize:13, color:'#cbd5e1', fontWeight:400}}>Integre uma lib como recharts/chart.js para gráficos reais.</span>
            </div>
          </div>
        )}
        {section === 'seguros' && (
          <div className="container-seguros" id="seguros">
            <h1 style={{ color: '#4fc3f7', margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 0.5 }}>📋 Seguros</h1>
            <p style={{ margin: '6px 0 22px', color: '#cbd5e1', fontSize: 14 }}>Gestão centralizada dos contratos e vigências.</p>

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
              <div className="sub">Precisa anexar Apólice</div>
            </div>
          </section>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <button className="btn-main" onClick={() => setFormVisible(v => !v)}>
          {formVisible ? 'Fechar formulário' : '➕ Novo Seguro'}
        </button>
        {seguros.length > 0 && (
          <button className="btn-secondary" onClick={() => fetchSeguros(order.column, order.ascending)}>⟳ Atualizar</button>
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
          <h2 style={{ margin: '0 0 14px', color: '#4fc3f7', fontSize: 22, fontWeight: 700 }}>
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
      {(vencidos.length > 0 || vencendo.length > 0) && (
        <div className="alerts-wrapper" style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8
          }}>
            <span style={{fontSize: 20}}>⚠️</span>
            Alertas de Vigência
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {vencidos.length > 0 && (
              <div style={{
                flex: 1,
                minWidth: 280,
                background: '#7f1d1d',
                border: '1px solid #991b1b',
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0
                }}>
                  ⛔
                </div>
                <div>
                  <div style={{ color: '#fecaca', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                    {vencidos.length} seguro{vencidos.length>1?'s':''} vencido{vencidos.length>1?'s':''}
                  </div>
                  <div style={{ color: '#f87171', fontSize: 12 }}>
                    Renovar imediatamente!
                  </div>
                </div>
              </div>
            )}
            {vencendo.length > 0 && (
              <div style={{
                flex: 1,
                minWidth: 280,
                background: '#92400e',
                border: '1px solid #d97706',
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0
                }}>
                  ⏰
                </div>
                <div>
                  <div style={{ color: '#fde68a', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                    {vencendo.length} vence{vencendo.length>1?'m':''} em 30 dias
                  </div>
                  <div style={{ color: '#fbbf24', fontSize: 12 }}>
                    Programe contato com cliente antes do prazo
                  </div>
                </div>
              </div>
            )}
          </div>
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
        <button className={`ordenacao-btn ${order.column === 'cliente_nome' && order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('cliente_nome', true)}>
          Cliente ↑
        </button>
        <button className={`ordenacao-btn ${order.column === 'cliente_nome' && !order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('cliente_nome', false)}>
          Cliente ↓
        </button>
        <button className={`ordenacao-btn ${order.column === 'seguradora' && order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('seguradora', true)}>
          Seguradora ↑
        </button>
        <button className={`ordenacao-btn ${order.column === 'seguradora' && !order.ascending ? 'active' : ''}`} onClick={() => fetchSeguros('seguradora', false)}>
          Seguradora ↓
        </button>
        
        <span className="sort-info">
          {order.column} ({order.ascending ? 'crescente' : 'decrescente'})
        </span>
      </div>

      {/* Tabela com container responsivo */}
      <div className="table-container">
        <table className="seguros" style={{ minWidth: '1200px', width: '100%' }}>
          <thead>
            <tr>
              <th style={{width: '16%', minWidth: 180, padding: '12px 8px'}}>Cliente</th>
              <th style={{width: '12%', minWidth: 120, padding: '12px 6px'}}>CPF</th>
              <th style={{width: '12%', minWidth: 120, padding: '12px 6px'}}>Telefone</th>
              <th style={{width: '14%', minWidth: 140, padding: '12px 6px'}}>Seguro</th>
              <th style={{width: '12%', minWidth: 120, padding: '12px 6px'}}>Seguradora</th>
              <th style={{width: '10%', minWidth: 100, textAlign: 'right', padding: '12px 6px'}}>Prêmio</th>
              <th style={{width: '8%', minWidth: 80, padding: '12px 4px'}}>Início</th>
              <th style={{width: '10%', minWidth: 100, padding: '12px 6px'}}>Status</th>
              <th style={{width: '8%', minWidth: 80, padding: '12px 4px'}}>Fim</th>
              <th style={{width: '18%', minWidth: 180, padding: '12px 8px'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {segurosFiltrados.map((s) => {
              const fim = new Date(s.vigencia_fim);
              const diff = (fim - hoje) / (1000 * 60 * 60 * 24);
              let classeIndicador = '';
              if (fim < hoje) classeIndicador = 'vencido'; else if (diff >= 0 && diff <= 30) classeIndicador = 'vencendo';
              
              return (
                <tr key={s.id}>
                  <td style={{
                    fontWeight: 600, 
                    maxWidth: 180, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    padding: '10px 8px'
                  }} title={s.cliente_nome}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4fc3f7, #2563eb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0a0e13',
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {s.cliente_nome.charAt(0).toUpperCase()}
                      </div>
                      <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {s.cliente_nome}
                      </span>
                    </div>
                  </td>
                  <td style={{
                    fontFamily: 'Monaco, Consolas, monospace', 
                    fontSize: 12,
                    padding: '10px 6px',
                    color: '#cbd5e1'
                  }}>
                    {validationUtils.formatCPF(s.cliente_cpf || '')}
                  </td>
                  <td style={{
                    fontFamily: 'Monaco, Consolas, monospace', 
                    fontSize: 12,
                    padding: '10px 6px',
                    color: '#cbd5e1'
                  }}>
                    {validationUtils.formatPhone(s.cliente_numero || '') || <span style={{color: '#6b7280'}}>—</span>}
                  </td>
                  <td style={{
                    maxWidth: 140, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    padding: '10px 6px'
                  }} title={s.tipo_seguro}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                      <span style={{
                        display: 'inline-block',
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: '#4fc3f7',
                        flexShrink: 0
                      }}></span>
                      {s.tipo_seguro}
                    </div>
                  </td>
                  <td style={{
                    fontWeight: 600, 
                    maxWidth: 120, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    padding: '10px 6px',
                    color: '#4fc3f7'
                  }} title={s.seguradora}>
                    {s.seguradora}
                  </td>
                  <td style={{
                    textAlign: 'right', 
                    fontWeight: 700, 
                    color: '#10b981',
                    fontSize: 13,
                    padding: '10px 6px'
                  }}>
                    R$ {validationUtils.formatCurrency(s.premio?.toString() || '0')}
                  </td>
                  <td style={{
                    fontSize: 12, 
                    color: '#9ca3af',
                    padding: '10px 4px'
                  }}>
                    {s.vigencia_inicio ? new Date(s.vigencia_inicio).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric'}) : '—'}
                  </td>
                  <td style={{ padding: '10px 6px' }}>
                    {(() => {
                      const st = statusDoSeguro(s);
                      const statusConfig = {
                        ativo: { color: '#6ee7b7', bg: '#065f46', icon: '✓' },
                        vencendo: { color: '#fde68a', bg: '#92400e', icon: '⚠' },
                        vencido: { color: '#fecaca', bg: '#7f1d1d', icon: '✕' }
                      };
                      const config = statusConfig[st];
                      return (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 8px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                          color: config.color,
                          background: config.bg,
                          textTransform: 'uppercase',
                          letterSpacing: 0.3
                        }}>
                          {config.icon} {st}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{
                    fontSize: 12, 
                    fontWeight: 600,
                    padding: '10px 4px',
                    position: 'relative'
                  }}>
                    {classeIndicador && (
                      <span 
                        className={`indicador ${classeIndicador}`}
                        style={{
                          position: 'absolute',
                          left: 4,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 3,
                          height: 20,
                          borderRadius: 2,
                          background: classeIndicador === 'vencido' 
                            ? '#dc2626' 
                            : '#f59e0b'
                        }}
                      ></span>
                    )}
                    <span style={{ paddingLeft: classeIndicador ? 12 : 0 }}>
                      {s.vigencia_fim ? new Date(s.vigencia_fim).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric'}) : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div className="table-actions">
                      <button 
                        className="mini-btn" 
                        onClick={() => editarSeguro(s)} 
                        title="Editar seguro"
                      >
                        ✏️
                      </button>
                      
                      <button 
                        className="mini-btn danger" 
                        onClick={() => excluirSeguro(s.id)} 
                        title="Excluir seguro"
                      >
                        🗑️
                      </button>
                      
                      <label 
                        className="mini-btn" 
                        style={{cursor:'pointer'}}
                        title={s.apolice_pdf ? 'Trocar PDF da apólice' : 'Anexar PDF da apólice'}
                      >
                        {s.apolice_pdf ? '🔄' : '📎'}
                        <input type="file" accept="application/pdf" style={{display:'none'}} onChange={(e)=>{ const f=e.target.files?.[0]; if(f) handleUploadPDF(s, f); }} />
                      </label>
                      {s.apolice_pdf && (
                        <>
                          <a
                            className="mini-btn"
                            href={`/api/apolice-proxy?path=${encodeURIComponent(s.apolice_pdf)}&signed=1`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background:'#065f46', 
                              color:'#6ee7b7', 
                              border:'1px solid #059669'
                            }}
                            title="Visualizar PDF"
                          >
                            👁️
                          </a>
                          <a
                            className="mini-btn"
                            href={`/api/apolice-proxy?path=${encodeURIComponent(s.apolice_pdf)}&download=1`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Baixar PDF"
                          >
                            📥
                          </a>
                        </>
                      )}
                      
                      {uploadingId===s.id && (
                        <span style={{
                          fontSize: 10, 
                          color:'#10b981', 
                          fontWeight: 600,
                          padding: '2px 4px',
                          borderRadius: 3
                        }}>
                          ⏳
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {segurosFiltrados.length === 0 && !loading && (
              <tr>
                <td colSpan={10} style={{ 
                  textAlign: 'center', 
                  padding: 80, 
                  color: '#9ca3af'
                }}>
                  <div style={{fontSize: 48, marginBottom: 16, opacity: 0.3}}>📋</div>
                  <div style={{fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#e2e8f0'}}>Nenhum seguro encontrado</div>
                  <small style={{opacity: 0.7, fontSize: 14}}>Experimente alterar os filtros ou termo de busca</small>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

  {loading && <div className="loading">Carregando...</div>}

        </div>
        )}
        {section === 'cotacao' && (
          <div className="container-seguros">
            <h1 style={{ color: '#4fc3f7', margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 0.5 }}>💰 Cotação</h1>
            <p style={{ margin: '6px 0 22px', color: '#cbd5e1', fontSize: 14 }}>Compare preços entre seguradoras e encontre as melhores ofertas.</p>
            
            <div style={{
              background: '#374151',
              border: '2px dashed #4b5563',
              borderRadius: 16,
              padding: 40,
              textAlign: 'center',
              marginTop: 24
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
              <h2 style={{ 
                color: '#4fc3f7', 
                margin: '0 0 12px', 
                fontSize: 24, 
                fontWeight: 700 
              }}>
                Em Breve
              </h2>
              <p style={{ 
                color: '#cbd5e1', 
                fontSize: 16, 
                margin: '0 0 20px',
                lineHeight: 1.5
              }}>
                Estamos desenvolvendo a integração com as APIs das principais seguradoras para oferecer cotações automáticas em tempo real, igual ao <strong>SEGFY</strong>.
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                marginTop: 32
              }}>
                <div style={{
                  background: '#2d3748',
                  padding: 20,
                  borderRadius: 12,
                  border: '1px solid #4a5568'
                }}>
                  <h4 style={{ color: '#4fc3f7', margin: '0 0 8px' }}>🔗 Integrações</h4>
                  <p style={{ fontSize: 14, color: '#cbd5e1', margin: 0 }}>
                    Porto Seguro, Bradesco, SulAmérica, Allianz e mais
                  </p>
                </div>
                
                <div style={{
                  background: '#2d3748',
                  padding: 20,
                  borderRadius: 12,
                  border: '1px solid #4a5568'
                }}>
                  <h4 style={{ color: '#4fc3f7', margin: '0 0 8px' }}>⚡ Cotação Rápida</h4>
                  <p style={{ fontSize: 14, color: '#cbd5e1', margin: 0 }}>
                    Resultados em segundos para múltiplas seguradoras
                  </p>
                </div>
                
                <div style={{
                  background: '#2d3748',
                  padding: 20,
                  borderRadius: 12,
                  border: '1px solid #4a5568'
                }}>
                  <h4 style={{ color: '#4fc3f7', margin: '0 0 8px' }}>📊 Comparação</h4>
                  <p style={{ fontSize: 14, color: '#cbd5e1', margin: 0 }}>
                    Análise detalhada de coberturas e preços
                  </p>
                </div>
              </div>
              
              <div style={{ 
                marginTop: 24, 
                padding: 16, 
                background: '#8a6a00ff',
                border: '1px solid #5f4900ff',
                borderRadius: 8,
                fontSize: 14
              }}>
                <strong>🔧 Em desenvolvimento:</strong> APIs das seguradoras sendo integradas para cotações automáticas
              </div>
            </div>
          </div>
        )}
        {section === 'relatorios' && (
          <div className="container-seguros">
            <h1 style={{ color: '#4fc3f7', margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 0.5 }}>📈 Relatórios</h1>
            <p style={{ margin: '6px 0 22px', color: '#cbd5e1', fontSize: 14 }}>Gere e exporte relatórios detalhados dos seguros.</p>
            <div style={{background:'#374151', borderRadius:12, padding:24, marginBottom:18, border:'1px solid #4b5563'}}>
              <b style={{color:'#f1f5f9'}}>Relatório de prêmios recebidos por mês:</b>
              <br />
              <span style={{fontSize:13, color:'#cbd5e1'}}>Exporta um CSV com a soma dos prêmios por mês/ano.</span>
            </div>
            <button className="btn-main" onClick={exportRelatorioPremios}>Exportar relatório CSV</button>
          </div>
        )}


        {section === 'config' && (
          <div className="container-seguros">
            <h1 style={{ color: '#4fc3f7', margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 0.5 }}>⚙️ Configurações</h1>
            <p style={{ margin: '6px 0 22px', color: '#cbd5e1', fontSize: 14 }}>Personalize preferências, dados da empresa e integrações.</p>

            {/* Autenticação */}
            <div style={{background:'#374151', borderRadius:12, padding:24, marginBottom:18, border:'1px solid #4b5563'}}>
              <b style={{color:'#f1f5f9'}}>Conta</b>
              <div style={{marginTop:12}}>
                <div style={{marginBottom:8, color:'#e2e8f0'}}>Usuário: <strong style={{color:'#4fc3f7'}}>{currentUser.email}</strong></div>
                <button className="btn-secondary" type="button" onClick={signOut}>Sair da conta</button>
              </div>
            </div>

            {/* Logs e Auditoria */}
            <div style={{background:'#374151', borderRadius:12, padding:24, marginBottom:18, border:'1px solid #4b5563'}}>
              <b style={{color:'#f1f5f9'}}>Logs e Auditoria</b>
              <div style={{display:'flex', gap:8, alignItems:'center', marginTop:12}}>
                <input className="search-input" placeholder="Pesquisar em ação/entidade/usuário/detalhes" value={logsSearch} onChange={e=>setLogsSearch(e.target.value)} />
                <button className="btn-secondary" type="button" onClick={refreshLogs} disabled={logsLoading}>{logsLoading? 'Carregando...':'Atualizar'}</button>
                <button className="btn-secondary" type="button" onClick={exportLogsCSV}>⬇️ Exportar CSV</button>
              </div>
              <div style={{marginTop:12, maxHeight:320, overflow:'auto', border:'1px solid #4b5563', borderRadius:10, background:'#2d3748'}}>
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
                      <tr><td colSpan={6} style={{textAlign:'center', padding:16, color:'#9ca3af'}}>Sem logs disponíveis.</td></tr>
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
