import { Transaction, UserProfile } from "../types";

export function exportTransactionsToPDF(transactions: Transaction[], user: UserProfile) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <title>Fluxo - Extrato Financeiro Oficial</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #181d17; padding: 40px; background: #ffffff; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0d631b; padding-bottom: 16px; margin-bottom: 24px; }
        .logo { font-size: 28px; font-weight: bold; color: #0d631b; letter-spacing: -0.5px; }
        .tagline { font-size: 11px; text-transform: uppercase; color: #707a6c; letter-spacing: 1.5px; }
        .meta { text-align: right; font-size: 12px; color: #40493d; }
        .summary-box { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: #f7fbf0; padding: 16px; border-radius: 12px; margin-bottom: 28px; }
        .summary-card { padding: 12px; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .summary-label { font-size: 11px; text-transform: uppercase; color: #707a6c; font-weight: 600; }
        .summary-value { font-size: 20px; font-weight: bold; margin-top: 4px; }
        .income { color: #126d27; }
        .expense { color: #ba1a1a; }
        .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .table th { background: #ebefe5; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #40493d; border-bottom: 1px solid #bfcaba; }
        .table td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f5eb; }
        .table tr:nth-child(even) { background: #fafdf7; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #707a6c; border-top: 1px solid #f1f5eb; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">Fluxo</div>
          <div class="tagline">Capital Intelligence • Extrato Oficial</div>
        </div>
        <div class="meta">
          <strong>Usuário:</strong> ${user.name}<br />
          <strong>Email:</strong> ${user.email}<br />
          <strong>Data de Emissão:</strong> ${new Date().toLocaleDateString("pt-BR")}
        </div>
      </div>

      <div class="summary-box">
        <div class="summary-card">
          <div class="summary-label">Total Receitas</div>
          <div class="summary-value income">+ R$ ${totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Despesas</div>
          <div class="summary-value expense">- R$ ${totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Balanço do Período</div>
          <div class="summary-value" style="color: ${netBalance >= 0 ? '#0d631b' : '#ba1a1a'}">
            R$ ${netBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <h3>Lançamentos do Extrato (${transactions.length} registros)</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Conta</th>
            <th>Método</th>
            <th style="text-align: right;">Valor (R$)</th>
          </tr>
        </thead>
        <tbody>
          ${transactions
            .map(
              (t) => `
            <tr>
              <td>${t.date.split("-").reverse().join("/")} ${t.time || ""}</td>
              <td><strong>${t.title}</strong>${t.description ? `<br/><small style="color:#707a6c">${t.description}</small>` : ""}</td>
              <td>${t.categoryName}</td>
              <td>${t.accountName}</td>
              <td>${t.paymentMethod.toUpperCase()}</td>
              <td style="text-align: right; font-weight: bold;" class="${t.type === 'expense' ? 'expense' : 'income'}">
                ${t.type === 'expense' ? '-' : '+'} R$ ${t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="footer">
        Relatório gerado automaticamente pelo aplicativo Fluxo • Todos os direitos reservados.
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
