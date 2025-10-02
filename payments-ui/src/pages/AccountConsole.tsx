import { useState } from "react";
import { api } from "../lib/api";
import StatementTable from "../components/StatementTable";
import type { Statement } from "../types";

export default function AccountConsole() {
  const [accountId, setAccountId] = useState<string>("");
  const [amountStr, setAmountStr] = useState<string>("");
  const [balance, setBalance] = useState<number|null>(null);
  const [statement, setStatement] = useState<Statement|null>(null);
  const [loading, setLoading] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Person form
  const [personName, setPersonName] = useState<string>("");
  const [personCpf, setPersonCpf] = useState<string>("");
  const [personDob, setPersonDob] = useState<string>("");
  const [personId, setPersonId] = useState<number|null>(null);

  // Account form
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  const [initialDeposit, setInitialDeposit] = useState<string>("1000");
  const [dailyLimit, setDailyLimit] = useState<string>("500");
  const [accountType, setAccountType] = useState<string>("1");

  const run = async <T,>(label: string, fn: () => Promise<{ data: T }>) => {
    try {
      setError("");
      setSuccess("");
      setLoading(label);
      const res = await fn();
      return res.data;
    }
    catch (e:any) {
      setError(e?.response?.data?.message || e?.message || "Erro desconhecido");
      return undefined;
    }
    finally { setLoading(""); }
  };

  const parseAmount = () => {
    const n = Number(amountStr);
    if (!Number.isFinite(n) || n <= 0) { setError("Informe um valor numérico > 0"); return null; }
    return n;
  };

  const createPerson = async () => {
    if (!personName.trim() || !personCpf.trim() || !personDob.trim()) {
      return setError("Preencha todos os campos da pessoa");
    }
    const data = await run("createPerson", () =>
      api.post("/persons", {
        name: personName,
        cpf: personCpf,
        dateOfBirth: personDob
      })
    );
    if (data) {
      setPersonId((data as any).idPerson);
      setSelectedPersonId(String((data as any).idPerson));
      setSuccess(`Pessoa criada com sucesso! ID: ${(data as any).idPerson}`);
      // Clear form
      setPersonName("");
      setPersonCpf("");
      setPersonDob("");
    }
  };

  const createAccount = async () => {
    if (!selectedPersonId.trim()) return setError("Selecione uma pessoa");
    const data = await run("createAccount", () =>
      api.post("/accounts", {
        personId: Number(selectedPersonId),
        initialDeposit: Number(initialDeposit),
        dailyWithdrawalLimit: Number(dailyLimit),
        accountType: Number(accountType)
      })
    );
    if (data) {
      setSuccess(`Conta criada com sucesso! ID: ${(data as any).idAccount}`);
      setAccountId(String((data as any).idAccount));
    }
  };

  const doDeposit = async () => {
    if (!accountId.trim()) return setError("Informe Account ID");
    const amount = parseAmount(); if (amount == null) return;
    await run("deposit", () => api.post(`/accounts/${accountId}/deposit`, { value: amount }));
    setSuccess("Depósito realizado com sucesso!");
    await getBalance();
  };

  const doWithdraw = async () => {
    if (!accountId.trim()) return setError("Informe Account ID");
    const amount = parseAmount(); if (amount == null) return;
    await run("withdraw", () => api.post(`/accounts/${accountId}/withdraw`, { value: amount }));
    setSuccess("Saque realizado com sucesso!");
    await getBalance();
  };

  const doBlock = async () => {
    if (!accountId.trim()) return setError("Informe Account ID");
    await run("block", () => api.patch(`/accounts/${accountId}/block`));
    setSuccess("Conta bloqueada com sucesso!");
  };

  const doUnblock = async () => {
    if (!accountId.trim()) return setError("Informe Account ID");
    await run("unblock", () => api.patch(`/accounts/${accountId}/unblock`));
    setSuccess("Conta desbloqueada com sucesso!");
  };

  const getBalance = async () => {
    if (!accountId.trim()) return setError("Informe Account ID");
    const data = await run<number>("balance", () => api.get<number>(`/accounts/${accountId}/balance`));
    if (typeof data === "number") setBalance(data);
  };

  const getStatement = async () => {
    if (!accountId.trim()) return setError("Informe Account ID");
    const data = await run<Statement>("statement", () => api.get<Statement>(`/accounts/${accountId}/statement`));
    if (data) {
      setStatement(data);
      setSuccess("Extrato carregado!");
    }
  };

  return (
    <div style={{ display:"grid", gap:24, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", color: "#1a73e8" }}>💰 Sistema de Gerenciamento Bancário</h1>

      {/* Create Person Section */}
      <section style={{ background: "#343a40", padding: 20, borderRadius: 8, border: "1px solid #495057" }}>
        <h2 style={{ color: "#f8f9fa" }}>👤 Criar Pessoa</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <label style={{ display: "flex", flexDirection: "column", color: "#f8f9fa" }}>
            Nome Completo
            <input
              value={personName}
              onChange={e=>setPersonName(e.target.value)}
              placeholder="Ex: João Silva"
              style={{ padding: 8, borderRadius: 4, border: "1px solid #6c757d", marginTop: 4, background: "white", color: "#212529" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", color: "#f8f9fa" }}>
            CPF
            <input
              value={personCpf}
              onChange={e=>setPersonCpf(e.target.value)}
              placeholder="Ex: 123.456.789-00"
              style={{ padding: 8, borderRadius: 4, border: "1px solid #6c757d", marginTop: 4, background: "white", color: "#212529" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", color: "#f8f9fa" }}>
            Data de Nascimento
            <input
              type="date"
              value={personDob}
              onChange={e=>setPersonDob(e.target.value)}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #6c757d", marginTop: 4, background: "white", color: "#212529" }}
            />
          </label>
        </div>
        <button
          onClick={createPerson}
          disabled={!!loading}
          style={{
            marginTop: 12,
            padding: "10px 20px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 600
          }}
        >
          {loading === "createPerson" ? "Criando..." : "✓ Criar Pessoa"}
        </button>
        {personId && (
          <p style={{ marginTop: 12, color: "#5cb85c", fontWeight: 600 }}>
            ✓ Pessoa ID: {personId} criada!
          </p>
        )}
      </section>

      {/* Create Account Section */}
      <section style={{ background: "#343a40", padding: 20, borderRadius: 8, border: "1px solid #495057" }}>
        <h2 style={{ color: "#f8f9fa" }}>🏦 Criar Conta</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <label style={{ display: "flex", flexDirection: "column", color: "#f8f9fa" }}>
            ID da Pessoa
            <input
              value={selectedPersonId}
              onChange={e=>setSelectedPersonId(e.target.value)}
              placeholder="Ex: 1"
              type="number"
              style={{ padding: 8, borderRadius: 4, border: "1px solid #6c757d", marginTop: 4, background: "white", color: "#212529" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", color: "#f8f9fa" }}>
            Depósito Inicial
            <input
              value={initialDeposit}
              onChange={e=>setInitialDeposit(e.target.value)}
              placeholder="Ex: 1000"
              type="number"
              style={{ padding: 8, borderRadius: 4, border: "1px solid #6c757d", marginTop: 4, background: "white", color: "#212529" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", color: "#f8f9fa" }}>
            Limite Diário de Saque
            <input
              value={dailyLimit}
              onChange={e=>setDailyLimit(e.target.value)}
              placeholder="Ex: 500"
              type="number"
              style={{ padding: 8, borderRadius: 4, border: "1px solid #6c757d", marginTop: 4, background: "white", color: "#212529" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", color: "#f8f9fa" }}>
            Tipo de Conta
            <select
              value={accountType}
              onChange={e=>setAccountType(e.target.value)}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #6c757d", marginTop: 4, background: "white", color: "#212529" }}
            >
              <option value="1">1 - Conta Corrente</option>
              <option value="2">2 - Conta Poupança</option>
            </select>
          </label>
        </div>
        <button
          onClick={createAccount}
          disabled={!!loading}
          style={{
            marginTop: 12,
            padding: "10px 20px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 600
          }}
        >
          {loading === "createAccount" ? "Criando..." : "✓ Criar Conta"}
        </button>
      </section>

      {/* Account Operations Section */}
      <section style={{ background: "#343a40", padding: 20, borderRadius: 8, border: "1px solid #495057" }}>
        <h2 style={{ color: "#f8f9fa" }}>💳 Operações da Conta</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <label style={{ display: "flex", flexDirection: "column", color: "#f8f9fa" }}>
            ID da Conta
            <input
              value={accountId}
              onChange={e=>setAccountId(e.target.value)}
              placeholder="Ex: 1"
              type="number"
              style={{ padding: 8, borderRadius: 4, border: "1px solid #6c757d", marginTop: 4, background: "white", color: "#212529" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", color: "#f8f9fa" }}>
            Valor da Operação
            <input
              type="number"
              value={amountStr}
              onChange={e=>setAmountStr(e.target.value)}
              placeholder="Ex: 100"
              style={{ padding: 8, borderRadius: 4, border: "1px solid #6c757d", marginTop: 4, background: "white", color: "#212529" }}
            />
          </label>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
          <button
            onClick={doDeposit}
            disabled={!!loading}
            style={{
              padding: "10px 16px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14
            }}
          >
            💵 Depósito
          </button>
          <button
            onClick={doWithdraw}
            disabled={!!loading}
            style={{
              padding: "10px 16px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14
            }}
          >
            💸 Saque
          </button>
          <button
            onClick={doBlock}
            disabled={!!loading}
            style={{
              padding: "10px 16px",
              background: "#ffc107",
              color: "#212529",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14
            }}
          >
            🔒 Bloquear
          </button>
          <button
            onClick={doUnblock}
            disabled={!!loading}
            style={{
              padding: "10px 16px",
              background: "#5cb85c",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14
            }}
          >
            🔓 Desbloquear
          </button>
          <button
            onClick={getBalance}
            disabled={!!loading}
            style={{
              padding: "10px 16px",
              background: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14
            }}
          >
            💰 Ver Saldo
          </button>
          <button
            onClick={getStatement}
            disabled={!!loading}
            style={{
              padding: "10px 16px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14
            }}
          >
            📄 Extrato
          </button>
        </div>
        {balance !== null && (
          <div style={{
            marginTop: 16,
            padding: 12,
            background: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: 4,
            color: "#155724",
            fontSize: 16,
            fontWeight: 600
          }}>
            💰 Saldo Atual: R$ {balance.toFixed(2)}
          </div>
        )}
      </section>

      {/* Statement Section */}
      <section style={{ background: "#343a40", padding: 20, borderRadius: 8, border: "1px solid #495057" }}>
        <h2 style={{ color: "#f8f9fa" }}>📊 Extrato da Conta</h2>
        {statement ? <StatementTable data={statement}/> : <p style={{ color: "#adb5bd" }}>Nenhum extrato carregado. Clique em "Extrato" para carregar.</p>}
      </section>

      {/* Messages */}
      {error && (
        <div style={{
          padding: 12,
          background: "#f8d7da",
          border: "1px solid #f5c6cb",
          borderRadius: 4,
          color: "#721c24"
        }}>
          ❌ Erro: {error}
        </div>
      )}
      {success && (
        <div style={{
          padding: 12,
          background: "#d4edda",
          border: "1px solid #c3e6cb",
          borderRadius: 4,
          color: "#155724"
        }}>
          ✅ {success}
        </div>
      )}
      {loading && (
        <div style={{
          padding: 12,
          background: "#d1ecf1",
          border: "1px solid #bee5eb",
          borderRadius: 4,
          color: "#0c5460"
        }}>
          ⏳ {loading}...
        </div>
      )}
    </div>
  );
}
