import type { Statement, Tx } from "../types";

export default function StatementTable({ data }: { data: Statement }) {
  const rows: Tx[] = data?.transactions || [];
  const th: React.CSSProperties = { textAlign:"left", borderBottom:"1px solid #ddd", padding:"8px" };
  const td: React.CSSProperties = { borderBottom:"1px solid #eee", padding:"8px" };
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr><th style={th}>#</th><th style={th}>Tipo</th><th style={th}>Valor</th><th style={th}>Data</th></tr></thead>
        <tbody>
          {rows.map((t,i)=>(
            <tr key={i}>
              <td style={td}>{i+1}</td><td style={td}>{t.type}</td>
              <td style={td}>{t.amount ?? "-"}</td><td style={td}>{t.createdAt ?? "-"}</td>
            </tr>
          ))}
        </tbody>
        <tfoot><tr><td style={td} colSpan={4}>Saldo atual: <b>{data.balance}</b></td></tr></tfoot>
      </table>
    </div>
  );
}
