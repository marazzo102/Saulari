import { useEffect, useState } from "react";

export default function Home() {
  const [order, setOrder] = useState({ column: 'vigencia_fim', ascending: true });
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  // Estados do formulário
  const [formData, setFormData] = useState({
    id: null,
    cliente_nome: "",
    cliente_cpf: "",
    cliente_numero: "",
    tipo_seguro: "",
    seguradora: "",
    premio: "",
    vigencia_inicio: "",
    vigencia_fim: "",
  });

  async function fetchSeguros(column = order.column, ascending = order.ascending) {
    setLoading(true);
    try {
      const res = await fetch(`/api/seguros?column=${column}&ascending=${ascending}`);
      if (!res.ok) throw new Error('Erro ao buscar seguros');
      const data = await res.json();
      setSeguros(data);
      setOrder({ column, ascending });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchSeguros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Verificar seguros já vencidos e vencendo em até 30 dias
  const hoje = new Date();
  const vencendo = seguros.filter((s) => {
    const fim = new Date(s.vigencia_fim);
    const diff = (fim - hoje) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });
  const vencidos = seguros.filter((s) => {
    const fim = new Date(s.vigencia_fim);
    return fim < hoje;
  });

  // Filtro de busca
  const segurosFiltrados = seguros.filter(
    (s) =>
      s.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
      s.cliente_cpf.includes(search)
  );

  // Salvar novo seguro ou editar existente
  async function salvarSeguro(e) {
    // Ao salvar, sempre fecha o formulário
    setFormVisible(false);
    e.preventDefault();

    try {
      let res;
      if (formData.id) {
        // Atualizar
        res = await fetch(`/api/seguros`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // Inserir novo
        res = await fetch(`/api/seguros`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      if (!res.ok) throw new Error('Erro ao salvar seguro');
      setFormData({
        id: null,
        cliente_nome: "",
        cliente_cpf: "",
        cliente_numero: "",
        tipo_seguro: "",
        seguradora: "",
        premio: "",
        vigencia_inicio: "",
        vigencia_fim: "",
      });
      fetchSeguros();
    } catch (error) {
      console.error(error);
    }
  }

  // Preencher formulário para editar
  function editarSeguro(seguro) {
    setFormData(seguro);
    setFormVisible(true);
  }

  // Excluir seguro
  async function excluirSeguro(id) {
    const confirmar = window.confirm('Tem certeza que deseja apagar este seguro? Esta ação não poderá ser desfeita.');
    if (!confirmar) return;
    try {
      const res = await fetch(`/api/seguros?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao excluir seguro');
      fetchSeguros();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div style={{ padding: 20 }}>

      <h1>📋 Seguros</h1>

      <button
        onClick={() => setFormVisible((v) => !v)}
        style={{
          marginBottom: 15,
          padding: '8px 16px',
          background: formVisible ? '#eee' : '#0070f3',
          color: formVisible ? '#333' : '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        {formVisible ? 'Minimizar formulário' : '➕ Novo Seguro'}
      </button>

      {loading && <p>Carregando...</p>}

      {/* Campo de busca */}
      <div style={{ marginBottom: 15 }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nome ou CPF"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, width: "100%", marginBottom: 10 }}
        />
      </div>


      {/* Alerta de vencidos e vencendo - AGORA ACIMA DA TABELA */}
      {(vencidos.length > 0 || vencendo.length > 0) && (
        <div style={{ margin: "20px 0 10px 0" }}>
          {vencidos.length > 0 && (
            <div style={{ background: "#ffd6d6", padding: 10, marginBottom: 6, color: '#a00', border: '1px solid #a00', borderRadius: 4 }}>
              <strong>⛔ Atenção:</strong> {vencidos.length} seguro(s) já estão vencidos!
            </div>
          )}
          {vencendo.length > 0 && (
            <div style={{ background: "#ffe5e5", padding: 10, color: '#a66', border: '1px solid #a66', borderRadius: 4 }}>
              <strong>⚠️ Aviso:</strong> {vencendo.length} seguro(s) vencem em até 30 dias!
            </div>
          )}
        </div>
      )}

      {/* Formulário de cadastro/edição */}
      {formVisible && (
        <form
          onSubmit={salvarSeguro}
          style={{ marginBottom: 20, background: "#f4f4f4", padding: 15 }}
        >
          <h2>{formData.id ? "✏️ Editar Seguro" : "➕ Novo Seguro"}</h2>
          {/* ...restante do formulário... */}
          <input
            placeholder="Nome do Cliente"
            value={formData.cliente_nome}
            onChange={(e) =>
              setFormData({ ...formData, cliente_nome: e.target.value })
            }
            required
            style={{
              display: "block",
              marginBottom: 8,
              width: "100%",
              padding: 8,
            }}
          />
          <input
            placeholder="CPF"
            value={formData.cliente_cpf}
            onChange={(e) =>
              setFormData({ ...formData, cliente_cpf: e.target.value })
            }
            required
            style={{
              display: "block",
              marginBottom: 8,
              width: "100%",
              padding: 8,
            }}
          />
          <input
            placeholder="Telefone"
            value={formData.cliente_numero}
            onChange={(e) =>
              setFormData({ ...formData, cliente_numero: e.target.value })
            }
            style={{
              display: "block",
              marginBottom: 8,
              width: "100%",
              padding: 8,
            }}
          />
          <input
            placeholder="Tipo de Seguro"
            value={formData.tipo_seguro}
            onChange={(e) =>
              setFormData({ ...formData, tipo_seguro: e.target.value })
            }
            required
            style={{
              display: "block",
              marginBottom: 8,
              width: "100%",
              padding: 8,
            }}
          />
          <input
            placeholder="Seguradora"
            value={formData.seguradora}
            onChange={(e) =>
              setFormData({ ...formData, seguradora: e.target.value })
            }
            required
            style={{
              display: "block",
              marginBottom: 8,
              width: "100%",
              padding: 8,
            }}
          />
          <input
            placeholder="Prêmio"
            type="number"
            value={formData.premio}
            onChange={(e) => setFormData({ ...formData, premio: e.target.value })}
            style={{
              display: "block",
              marginBottom: 8,
              width: "100%",
              padding: 8,
            }}
          />
          <label>Vigência Início:</label>
          <input
            type="date"
            value={formData.vigencia_inicio}
            onChange={(e) =>
              setFormData({ ...formData, vigencia_inicio: e.target.value })
            }
            style={{
              display: "block",
              marginBottom: 8,
              width: "100%",
              padding: 8,
            }}
          />
          <label>Vigência Fim:</label>
          <input
            type="date"
            value={formData.vigencia_fim}
            onChange={(e) =>
              setFormData({ ...formData, vigencia_fim: e.target.value })
            }
            style={{
              display: "block",
              marginBottom: 8,
              width: "100%",
              padding: 8,
            }}
          />

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button
              type="submit"
              style={{ padding: 10, background: "green", color: "white" }}
            >
              {formData.id ? "Salvar Alterações" : "Cadastrar Seguro"}
            </button>
            <button
              type="button"
              style={{ padding: 10, background: "#ccc", color: "#333" }}
              onClick={() => setFormData({
                id: null,
                cliente_nome: "",
                cliente_cpf: "",
                cliente_numero: "",
                tipo_seguro: "",
                seguradora: "",
                premio: "",
                vigencia_inicio: "",
                vigencia_fim: "",
              })}
            >
              Limpar formulário
            </button>
          </div>
        </form>
      )}


      {/* Botões de ordenação */}
      <div style={{ marginBottom: 15 }}>
        <button
          onClick={() => fetchSeguros('vigencia_fim', true)}
          style={{ fontWeight: order.column === 'vigencia_fim' && order.ascending ? 'bold' : 'normal' }}
        >
          Ordenar por Vencimento ↑
        </button>
        <button
          onClick={() => fetchSeguros('vigencia_fim', false)}
          style={{ fontWeight: order.column === 'vigencia_fim' && !order.ascending ? 'bold' : 'normal' }}
        >
          Ordenar por Vencimento ↓
        </button>
        <button
          onClick={() => fetchSeguros('tipo_seguro', true)}
          style={{ fontWeight: order.column === 'tipo_seguro' && order.ascending ? 'bold' : 'normal' }}
        >
          Ordenar por Tipo ↑
        </button>
        <button
          onClick={() => fetchSeguros('tipo_seguro', false)}
          style={{ fontWeight: order.column === 'tipo_seguro' && !order.ascending ? 'bold' : 'normal' }}
        >
          Ordenar por Tipo ↓
        </button>
        <button
          onClick={() => fetchSeguros('seguradora', true)}
          style={{ fontWeight: order.column === 'seguradora' && order.ascending ? 'bold' : 'normal' }}
        >
          Ordenar por Seguradora ↑
        </button>
        <button
          onClick={() => fetchSeguros('seguradora', false)}
          style={{ fontWeight: order.column === 'seguradora' && !order.ascending ? 'bold' : 'normal' }}
        >
          Ordenar por Seguradora ↓
        </button>
        <button
          onClick={() => fetchSeguros('premio', true)}
          style={{ fontWeight: order.column === 'premio' && order.ascending ? 'bold' : 'normal' }}
        >
          Ordenar por Prêmio ↑
        </button>
        <button
          onClick={() => fetchSeguros('premio', false)}
          style={{ fontWeight: order.column === 'premio' && !order.ascending ? 'bold' : 'normal' }}
        >
          Ordenar por Prêmio ↓
        </button>
      </div>
      <p style={{ marginTop: 10, fontStyle: 'italic' }}>
        Ordenado por <b>{order.column}</b> ({order.ascending ? 'crescente' : 'decrescente'})
      </p>

      {/* Tabela de seguros */}
      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>Cliente</th>
            <th>CPF</th>
            <th>Seguro</th>
            <th>Seguradora</th>
            <th>Prêmio</th>
            <th>Vigência Início</th>
            <th>Vigência Fim</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {segurosFiltrados.map((s) => {
            const fim = new Date(s.vigencia_fim);
            const hoje = new Date();
            const diff = (fim - hoje) / (1000 * 60 * 60 * 24);
            let indicador = null;
            if (fim < hoje) {
              indicador = <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#d00', marginRight: 6, border: '1px solid #a00' }} title="Seguro vencido"></span>;
            } else if (diff >= 0 && diff <= 30) {
              indicador = <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#ffd600', marginRight: 6, border: '1px solid #bba100' }} title="Vence em até 30 dias"></span>;
            }
            return (
              <tr key={s.id}>
                <td>{s.cliente_nome}</td>
                <td>{s.cliente_cpf}</td>
                <td>{s.tipo_seguro}</td>
                <td>{s.seguradora}</td>
                <td>R$ {s.premio}</td>
                <td>{s.vigencia_inicio}</td>
                <td>
                  {indicador}
                  {s.vigencia_fim}
                </td>
                <td>
                  <button onClick={() => editarSeguro(s)}>✏️ Editar</button>
                  <button
                    onClick={() => excluirSeguro(s.id)}
                    style={{ color: "red" }}
                  >
                    🗑️ Excluir
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>


    </div>
  );
}
