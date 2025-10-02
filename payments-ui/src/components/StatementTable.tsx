import type { Statement, Tx } from "../types";

export default function StatementTable({ data }: { data: Statement }) {
  const rows: Tx[] = data?.transactions || [];
  const th: React.CSSProperties = {
    textAlign:"left",
    borderBottom:"2px solid #d2d2d7",
    padding:"12px",
    color: "#1d1d1f",
    fontSize: 14,
    fontWeight: 600
  };
  const td: React.CSSProperties = {
    borderBottom:"1px solid #f5f5f7",
    padding:"12px",
    color: "#1d1d1f",
    fontSize: 15
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", background: "white" }}>
        <thead>
          <tr>
            <th style={th}>#</th>
            <th style={th}>Tipo</th>
            <th style={th}>Valor</th>
            <th style={th}>Data</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows.map((t,i)=>(
            <tr key={i}>
              <td style={td}>{i+1}</td>
              <td style={td}>
                <span style={{
                  color: t.type === "Depósito" ? "#34c759" : "#ff3b30",
                  fontWeight: 500
                }}>
                  {t.type === "Depósito" ? "Depósito" : "Saque"}
                </span>
              </td>
              <td style={{...td, fontWeight: 500}}>
                R$ {typeof t.amount === 'number' ? t.amount.toFixed(2) : t.amount}
              </td>
              <td style={td}>{t.createdAt ? formatDate(t.createdAt) : "-"}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan={4} style={{...td, textAlign: "center", color: "#6e6e73", padding: "20px"}}>
                Nenhuma transação encontrada
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td style={{...td, paddingTop: 16, borderTop: "2px solid #d2d2d7"}} colSpan={4}>
              <span style={{ color: "#6e6e73", fontSize: 14 }}>Saldo atual: </span>
              <b style={{ color: "#0071e3", fontSize: 18 }}>R$ {typeof data.balance === 'number' ? data.balance.toFixed(2) : data.balance}</b>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
