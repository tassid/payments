import { useState } from "react";
import { api } from "../lib/api";
import StatementTable from "../components/StatementTable";
import type { Statement } from "../types";

export default function AccountConsole() {
  const [accountId, setAccountId] = useState<string>("");
  const [amountStr, setAmountStr] = useState<string>("");
  const [createBody, setCreateBody] = useState<string>(JSON.stringify({ personId: 101, initialBalance: 0 }, null, 2));
  const [balance, setBalance] = useState<number|null>(null);
  const [statement, setStatement] = useState<Statement|null>(null);
  const [loading, setLoading] = useState<string>("");
  const [error, setError] = useState<string>("");

  const run = async <T,>(label: string, fn: () => Promise<{ data: T }>) => {
    try { setError(""); setLoading(label); const res = await fn(); return res.data; }
    catch (e:any) { setError(e?.response?.data?.message || e?.message || "Erro"); return undefined; }
    finally { setLoading(""); }
  };

  const parseAmount = () => {
    const n = Number(amountStr);
    if (!Number.isFinite(n) || n <= 0) { setError("Informe um valor numérico > 0"); return null; }
    return n;
  };

  const createAccount = async () => {
    try {
      const body = JSON.parse(createBody);
      const data = await run("create", () => Promise.resolve(api.post("/accounts", body)));
      if (data) alert(`Conta criada: ${JSON.stringify(data)}`);
    } catch (e:any) { setError("JSON inválido para criação."); }
  };

  const doDeposit = async () => {
    if (!accountId.trim()) return setError("Informe Account ID");
    const amount = parseAmount(); if (amount == null) return;
    await run("deposit", () => Promise.resolve(api.post(`/accounts/${accountId}/deposit`, { amount })));
    await getBalance();
  };

  const doWithdraw = async () => {
    if (!accountId.trim()) return setError("Informe Account ID");
    const amount = parseAmount(); if (amount == null) return;
    await run("withdraw", () => Promise.resolve(api.post(`/accounts/${accountId}/withdraw`, { amount })));
    await getBalance();
  };

  const doBlock = async () => {
    if (!accountId.trim()) return setError("Informe Account ID");
    await run("block", () => Promise.resolve(api.patch(`/accounts/${accountId}/block`)));
  };

  const getBalance = async () => {
    if (!accountId.trim()) return setError("Informe Account ID");
    const data = await run<number | { balance:number }>("balance", () => Promise.resolve(api.get<number | { balance: number }>(`/accounts/${accountId}/balance`)));
    if (typeof data === "number") setBalance(data);
    else if (data && typeof (data as any).balance === "number") setBalance((data as any).balance);
  };

  const getStatement = async () => {
    if (!accountId.trim()) return setError("Informe Account ID");
    const data = await run<Statement>("statement", () => Promise.resolve(api.get<Statement>(`/accounts/${accountId}/statement`)));
    if (data) setStatement(data);
  };

  return (
    <div style={{ display:"grid", gap:24 }}>
      <section>
        <h2>Criar Conta</h2>
        <p>Edite o JSON conforme o contrato do backend.</p>
        <textarea value={createBody} onChange={e=>setCreateBody(e.currentTarget.value)}
                  style={{ width:"100%", height:160, fontFamily:"monospace" }} />
        <div style={{ marginTop:8 }}>
          <button onClick={createAccount} disabled={!!loading}>POST /accounts {loading==="create"?"...":""}</button>
        </div>
      </section>

      <section>
        <h2>Ações por Conta</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <label>Account ID
            <input value={accountId} onChange={e=>setAccountId(e.currentTarget.value)} placeholder="ex: 1" />
          </label>
          <label>Amount
            <input type="number" value={amountStr} onChange={e=>setAmountStr(e.currentTarget.value)} placeholder="ex: 100" />
          </label>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
          <button onClick={doDeposit}   disabled={!!loading}>POST /deposit</button>
          <button onClick={doWithdraw}  disabled={!!loading}>POST /withdraw</button>
          <button onClick={doBlock}     disabled={!!loading}>PATCH /block</button>
          <button onClick={getBalance}  disabled={!!loading}>GET /balance</button>
          <button onClick={getStatement} disabled={!!loading}>GET /statement</button>
        </div>
        {balance!=null && <p style={{ marginTop:8 }}>Saldo: <b>{balance}</b></p>}
      </section>

      <section>
        <h2>Extrato</h2>
        {statement ? <StatementTable data={statement}/> : <p>Nenhum extrato carregado.</p>}
      </section>

      {error && <div style={{ color:"red" }}>Erro: {error}</div>}
    </div>
  );
}
