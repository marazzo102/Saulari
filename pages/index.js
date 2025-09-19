import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState({
    column: "vigencia_fim",
    ascending: true,
  });
  const [search, setSearch] = useState("");

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

  async function fetchSeguros(column = "vigencia_fim", ascending = true) {
    const { data, error } = await supabase
      .from("seguros")
      .select("*")
      .order(column, { ascending });

    if (error) console.error(error);
    else setSeguros(data);

    setSortBy({ column, ascending });
    setLoading(false);
  }

  useEffect(() => {
    fetchSeguros();
  }, []);

  // Verificar seguros que vencem em até 30 dias
  const hoje = new Date();
  const vencendo = seguros.filter((s) => {
    const fim = new Date(s.vigencia_fim);
    const diff = (fim - hoje) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });

  // Filtro de busca
  const segurosFiltrados = seguros.filter(
    (s) =>
      s.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
      s.cliente_cpf.includes(search)
  );

  // Salvar novo seguro ou editar existente
  async function salvarSeguro(e) {
    e.preventDefault();

    if (formData.id) {
      // Atualizar
      const { error } = await supabase
        .from("seguros")
        .update({
          cliente_nome: formData.cliente_nome,
          cliente_cpf: formData.cliente_cpf,
          cliente_numero: formData.cliente_numero,
          tipo_seguro: formData.tipo_seguro,
          seguradora: formData.seguradora,
          premio: formData.premio,
          vigencia_inicio: formData.vigencia_inicio,
          vigencia_fim: formData.vigencia_fim,
        })
        .eq("id", formData.id);

      if (error) console.error(error);
    } else {
      // Inserir novo
      const { error } = await supabase.from("seguros").insert([formData]);
      if (error) console.error(error);
    }

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

    fetchSeguros(sortBy.column, sortBy.ascending);
  }

  // Preencher formulário para editar
  function editarSeguro(seguro) {
    setFormData(seguro);
  }

  // Excluir seguro
  async function excluirSeguro(id) {
    const { error } = await supabase.from("seguros").delete().eq("id", id);
    if (error) console.error(error);
    fetchSeguros(sortBy.column, sortBy.ascending);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📋 Seguros</h1>

      {loading && <p>Carregando...</p>}

      {/* Alerta de vencimento */}
      {vencendo.length > 0 && (
        <div style={{ background: "#ffe5e5", padding: 10, margin: "10px 0" }}>
          <strong>⚠️ Atenção:</strong> {vencendo.length} seguros vencem em até
          30 dias!
        </div>
      )}

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

      {/* Formulário de cadastro/edição */}
      <form
        onSubmit={salvarSeguro}
        style={{ marginBottom: 20, background: "#f4f4f4", padding: 15 }}
      >
        <h2>{formData.id ? "✏️ Editar Seguro" : "➕ Novo Seguro"}</h2>

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

        <button
          type="submit"
          style={{ padding: 10, background: "green", color: "white" }}
        >
          {formData.id ? "Salvar Alterações" : "Cadastrar Seguro"}
        </button>
      </form>

      {/* Botões de ordenação */}
      <div style={{ marginBottom: 15 }}>
        <button onClick={() => fetchSeguros("vigencia_fim", true)}>
          Ordenar por Vencimento ↑
        </button>
        <button onClick={() => fetchSeguros("vigencia_fim", false)}>
          Ordenar por Vencimento ↓
        </button>
        <button onClick={() => fetchSeguros("tipo_seguro", true)}>
          Ordenar por Tipo ↑
        </button>
        <button onClick={() => fetchSeguros("tipo_seguro", false)}>
          Ordenar por Tipo ↓
        </button>
        <button onClick={() => fetchSeguros("seguradora", true)}>
          Ordenar por Seguradora ↑
        </button>
        <button onClick={() => fetchSeguros("seguradora", false)}>
          Ordenar por Seguradora ↓
        </button>
        <button onClick={() => fetchSeguros("premio", true)}>
          Ordenar por Prêmio ↑
        </button>
        <button onClick={() => fetchSeguros("premio", false)}>
          Ordenar por Prêmio ↓
        </button>
      </div>

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
          {segurosFiltrados.map((s) => (
            <tr key={s.id}>
              <td>{s.cliente_nome}</td>
              <td>{s.cliente_cpf}</td>
              <td>{s.tipo_seguro}</td>
              <td>{s.seguradora}</td>
              <td>R$ {s.premio}</td>
              <td>{s.vigencia_inicio}</td>
              <td>{s.vigencia_fim}</td>
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
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 10, fontStyle: "italic" }}>
        Ordenado por <b>{sortBy.column}</b> (
        {sortBy.ascending ? "crescente" : "decrescente"})
      </p>
    </div>
  );
}
