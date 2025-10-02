import { useState } from "react";
import { api } from "../lib/api";
import StatementTable from "../components/StatementTable";
import type { Statement } from "../types";

const inputStyle = {
  padding: "12px 14px",
  borderRadius: 8,
  border: "1px solid #d2d2d7",
  background: "#f5f5f7",
  color: "#1d1d1f",
  fontSize: 15,
  fontWeight: 400,
  outline: "none",
  transition: "border 0.2s"
};

const buttonStyle = (variant: "primary" | "secondary" | "danger" | "warning" | "success" | "info", isLoading: boolean) => ({
  padding: "11px 20px",
  background: isLoading ? "#86868b" :
    variant === "primary" ? "#0071e3" :
    variant === "danger" ? "#ff3b30" :
    variant === "warning" ? "#ff9500" :
    variant === "success" ? "#34c759" :
    variant === "info" ? "#5ac8fa" :
    "#8e8e93",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: isLoading ? "not-allowed" : "pointer",
  fontSize: 14,
  fontWeight: 500,
  transition: "all 0.2s",
  opacity: 1
});

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
    if (!Number.isFinite(n) || n <= 0) { setError("Informe um valor válido"); return null; }
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
    if (!accountId.trim()) return setError("Informe o ID da conta");
    const amount = parseAmount(); if (amount == null) return;
    await run("deposit", () => api.post(`/accounts/${accountId}/deposit`, { value: amount }));
    setSuccess("Depósito realizado com sucesso!");
    await getBalance();
  };

  const doWithdraw = async () => {
    if (!accountId.trim()) return setError("Informe o ID da conta");
    const amount = parseAmount(); if (amount == null) return;
    await run("withdraw", () => api.post(`/accounts/${accountId}/withdraw`, { value: amount }));
    setSuccess("Saque realizado com sucesso!");
    await getBalance();
  };

  const doBlock = async () => {
    if (!accountId.trim()) return setError("Informe o ID da conta");
    await run("block", () => api.patch(`/accounts/${accountId}/block`));
    setSuccess("Conta bloqueada com sucesso!");
  };

  const doUnblock = async () => {
    if (!accountId.trim()) return setError("Informe o ID da conta");
    await run("unblock", () => api.patch(`/accounts/${accountId}/unblock`));
    setSuccess("Conta desbloqueada com sucesso!");
  };

  const getBalance = async () => {
    if (!accountId.trim()) return setError("Informe o ID da conta");
    const data = await run<number>("balance", () => api.get<number>(`/accounts/${accountId}/balance`));
    if (typeof data === "number") setBalance(data);
  };

  const getStatement = async () => {
    if (!accountId.trim()) return setError("Informe o ID da conta");
    const data = await run<Statement>("statement", () => api.get<Statement>(`/accounts/${accountId}/statement`));
    if (data) {
      setStatement(data);
      setSuccess("Extrato carregado!");
    }
  };

  return (
    <div style={{
      display:"grid",
      gap: 20,
      maxWidth: 900,
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
      background: "#f5f5f7",
      minHeight: "100vh"
    }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontSize: 34,
          fontWeight: 600,
          color: "#1d1d1f",
          margin: 0,
          letterSpacing: "-0.5px"
        }}>Gerenciamento Bancário</h1>
        <p style={{
          fontSize: 17,
          color: "#6e6e73",
          margin: "8px 0 0 0",
          fontWeight: 400
        }}>Gerencie suas contas e transações</p>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          padding: "14px 16px",
          background: "#fff5f5",
          border: "1px solid #ffcccc",
          borderRadius: 10,
          color: "#d32f2f",
          fontSize: 14,
          fontWeight: 500
        }}>
          <i className="bi bi-exclamation-circle-fill" style={{ marginRight: 8 }}></i>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          padding: "14px 16px",
          background: "#f0f9ff",
          border: "1px solid #b3d9ff",
          borderRadius: 10,
          color: "#0071e3",
          fontSize: 14,
          fontWeight: 500
        }}>
          <i className="bi bi-check-circle-fill" style={{ marginRight: 8 }}></i>
          {success}
        </div>
      )}

      {/* Create Person Section */}
      <section style={{
        background: "#ffffff",
        padding: 24,
        borderRadius: 12,
        border: "1px solid #d2d2d7",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
      }}>
        <h2 style={{
          color: "#1d1d1f",
          fontSize: 22,
          fontWeight: 600,
          margin: "0 0 20px 0",
          letterSpacing: "-0.3px"
        }}>
          <i className="bi bi-person-fill" style={{ marginRight: 10, color: "#0071e3" }}></i>
          Criar Pessoa
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16 }}>
          <label style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6e6e73", marginBottom: 8 }}>Nome Completo</span>
            <input
              value={personName}
              onChange={e=>setPersonName(e.target.value)}
              placeholder="João Silva"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = "1px solid #0071e3"}
              onBlur={e => e.currentTarget.style.border = "1px solid #d2d2d7"}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6e6e73", marginBottom: 8 }}>CPF</span>
            <input
              value={personCpf}
              onChange={e=>setPersonCpf(e.target.value)}
              placeholder="123.456.789-00"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = "1px solid #0071e3"}
              onBlur={e => e.currentTarget.style.border = "1px solid #d2d2d7"}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gridColumn: "1 / -1" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6e6e73", marginBottom: 8 }}>Data de Nascimento</span>
            <input
              type="date"
              value={personDob}
              onChange={e=>setPersonDob(e.target.value)}
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = "1px solid #0071e3"}
              onBlur={e => e.currentTarget.style.border = "1px solid #d2d2d7"}
            />
          </label>
        </div>
        <button
          onClick={createPerson}
          disabled={!!loading}
          style={{...buttonStyle("primary", loading === "createPerson"), marginTop: 16}}
          onMouseEnter={e => !loading && (e.currentTarget.style.background = "#0077ed")}
          onMouseLeave={e => !loading && (e.currentTarget.style.background = "#0071e3")}
        >
          <i className="bi bi-plus-circle" style={{ marginRight: 6 }}></i>
          {loading === "createPerson" ? "Criando..." : "Criar Pessoa"}
        </button>
        {personId && (
          <div style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "#f0f9ff",
            border: "1px solid #b3d9ff",
            borderRadius: 8,
            color: "#0071e3",
            fontSize: 14,
            fontWeight: 500
          }}>
            <i className="bi bi-check-circle-fill" style={{ marginRight: 6 }}></i>
            Pessoa criada com sucesso. ID: {personId}
          </div>
        )}
      </section>

      {/* Create Account Section */}
      <section style={{
        background: "#ffffff",
        padding: 24,
        borderRadius: 12,
        border: "1px solid #d2d2d7",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
      }}>
        <h2 style={{
          color: "#1d1d1f",
          fontSize: 22,
          fontWeight: 600,
          margin: "0 0 20px 0",
          letterSpacing: "-0.3px"
        }}>
          <i className="bi bi-bank" style={{ marginRight: 10, color: "#0071e3" }}></i>
          Criar Conta
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16 }}>
          <label style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6e6e73", marginBottom: 8 }}>ID da Pessoa</span>
            <input
              value={selectedPersonId}
              onChange={e=>setSelectedPersonId(e.target.value)}
              placeholder="1"
              type="number"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = "1px solid #0071e3"}
              onBlur={e => e.currentTarget.style.border = "1px solid #d2d2d7"}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6e6e73", marginBottom: 8 }}>Depósito Inicial</span>
            <input
              value={initialDeposit}
              onChange={e=>setInitialDeposit(e.target.value)}
              placeholder="1000"
              type="number"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = "1px solid #0071e3"}
              onBlur={e => e.currentTarget.style.border = "1px solid #d2d2d7"}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6e6e73", marginBottom: 8 }}>Limite Diário</span>
            <input
              value={dailyLimit}
              onChange={e=>setDailyLimit(e.target.value)}
              placeholder="500"
              type="number"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = "1px solid #0071e3"}
              onBlur={e => e.currentTarget.style.border = "1px solid #d2d2d7"}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6e6e73", marginBottom: 8 }}>Tipo de Conta</span>
            <select
              value={accountType}
              onChange={e=>setAccountType(e.target.value)}
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = "1px solid #0071e3"}
              onBlur={e => e.currentTarget.style.border = "1px solid #d2d2d7"}
            >
              <option value="1">Conta Corrente</option>
              <option value="2">Conta Poupança</option>
            </select>
          </label>
        </div>
        <button
          onClick={createAccount}
          disabled={!!loading}
          style={{...buttonStyle("primary", loading === "createAccount"), marginTop: 16}}
          onMouseEnter={e => !loading && (e.currentTarget.style.background = "#0077ed")}
          onMouseLeave={e => !loading && (e.currentTarget.style.background = "#0071e3")}
        >
          <i className="bi bi-plus-circle" style={{ marginRight: 6 }}></i>
          {loading === "createAccount" ? "Criando..." : "Criar Conta"}
        </button>
      </section>

      {/* Account Operations Section */}
      <section style={{
        background: "#ffffff",
        padding: 24,
        borderRadius: 12,
        border: "1px solid #d2d2d7",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
      }}>
        <h2 style={{
          color: "#1d1d1f",
          fontSize: 22,
          fontWeight: 600,
          margin: "0 0 20px 0",
          letterSpacing: "-0.3px"
        }}>
          <i className="bi bi-credit-card" style={{ marginRight: 10, color: "#0071e3" }}></i>
          Operações da Conta
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16 }}>
          <label style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6e6e73", marginBottom: 8 }}>ID da Conta</span>
            <input
              value={accountId}
              onChange={e=>setAccountId(e.target.value)}
              placeholder="1"
              type="number"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = "1px solid #0071e3"}
              onBlur={e => e.currentTarget.style.border = "1px solid #d2d2d7"}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6e6e73", marginBottom: 8 }}>Valor</span>
            <input
              type="number"
              value={amountStr}
              onChange={e=>setAmountStr(e.target.value)}
              placeholder="100"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = "1px solid #0071e3"}
              onBlur={e => e.currentTarget.style.border = "1px solid #d2d2d7"}
            />
          </label>
        </div>
        <div style={{ display:"flex", gap: 10, marginTop: 16, flexWrap:"wrap" }}>
          <button
            onClick={doDeposit}
            disabled={!!loading}
            style={buttonStyle("success", loading === "deposit")}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = "#30d158")}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = "#34c759")}
          >
            <i className="bi bi-arrow-down-circle" style={{ marginRight: 6 }}></i>
            Depósito
          </button>
          <button
            onClick={doWithdraw}
            disabled={!!loading}
            style={buttonStyle("danger", loading === "withdraw")}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = "#ff453a")}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = "#ff3b30")}
          >
            <i className="bi bi-arrow-up-circle" style={{ marginRight: 6 }}></i>
            Saque
          </button>
          <button
            onClick={doBlock}
            disabled={!!loading}
            style={buttonStyle("warning", loading === "block")}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = "#ff9f0a")}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = "#ff9500")}
          >
            <i className="bi bi-lock-fill" style={{ marginRight: 6 }}></i>
            Bloquear
          </button>
          <button
            onClick={doUnblock}
            disabled={!!loading}
            style={buttonStyle("success", loading === "unblock")}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = "#30d158")}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = "#34c759")}
          >
            <i className="bi bi-unlock-fill" style={{ marginRight: 6 }}></i>
            Desbloquear
          </button>
          <button
            onClick={getBalance}
            disabled={!!loading}
            style={buttonStyle("info", loading === "balance")}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = "#64d2ff")}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = "#5ac8fa")}
          >
            <i className="bi bi-wallet2" style={{ marginRight: 6 }}></i>
            Saldo
          </button>
          <button
            onClick={getStatement}
            disabled={!!loading}
            style={buttonStyle("secondary", loading === "statement")}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = "#98989d")}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = "#8e8e93")}
          >
            <i className="bi bi-file-text" style={{ marginRight: 6 }}></i>
            Extrato
          </button>
        </div>
        {balance !== null && (
          <div style={{
            marginTop: 20,
            padding: "16px 20px",
            background: "#f0f9ff",
            border: "1px solid #b3d9ff",
            borderRadius: 10,
            color: "#1d1d1f",
            fontSize: 18,
            fontWeight: 600
          }}>
            <i className="bi bi-wallet2" style={{ marginRight: 8, color: "#0071e3" }}></i>
            Saldo Atual: <span style={{ color: "#0071e3" }}>R$ {balance.toFixed(2)}</span>
          </div>
        )}
      </section>

      {/* Statement Section */}
      <section style={{
        background: "#ffffff",
        padding: 24,
        borderRadius: 12,
        border: "1px solid #d2d2d7",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
      }}>
        <h2 style={{
          color: "#1d1d1f",
          fontSize: 22,
          fontWeight: 600,
          margin: "0 0 20px 0",
          letterSpacing: "-0.3px"
        }}>
          <i className="bi bi-graph-up" style={{ marginRight: 10, color: "#0071e3" }}></i>
          Extrato da Conta
        </h2>
        {statement ? <StatementTable data={statement}/> : (
          <p style={{ color: "#6e6e73", fontSize: 15, margin: 0 }}>
            <i className="bi bi-info-circle" style={{ marginRight: 6 }}></i>
            Nenhum extrato carregado. Clique em "Extrato" para carregar.
          </p>
        )}
      </section>
    </div>
  );
}
