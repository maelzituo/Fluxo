import { Transaction } from "../types";

export function exportTransactionsToCSV(transactions: Transaction[], filename = "extrato_fluxo.csv") {
  const headers = ["ID", "Data", "Hora", "Título", "Tipo", "Categoria", "Valor (R$)", "Método de Pagamento", "Conta", "Status", "Descrição"];
  
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.time || "",
    `"${t.title.replace(/"/g, '""')}"`,
    t.type === "income" ? "Receita" : t.type === "expense" ? "Despesa" : "Transferência",
    `"${t.categoryName.replace(/"/g, '""')}"`,
    t.type === "expense" ? `- ${t.amount.toFixed(2)}` : t.amount.toFixed(2),
    t.paymentMethod,
    `"${t.accountName.replace(/"/g, '""')}"`,
    t.status,
    `"${(t.description || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSVToTransactions(csvText: string): Partial<Transaction>[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const results: Partial<Transaction>[] = [];
  const bodyLines = lines.slice(1);

  bodyLines.forEach((line, index) => {
    const cols = line.split(";").map((c) => c.replace(/^"|"$/g, "").trim());
    if (cols.length >= 4) {
      const title = cols[3] || cols[0] || `Importado ${index + 1}`;
      const amountRaw = (cols[6] || cols[1] || "0").replace(/[^0-9,-.]/g, "").replace(",", ".");
      const amount = Math.abs(parseFloat(amountRaw)) || 0;
      const isExpense = (cols[4] || "").toLowerCase().includes("despesa") || parseFloat(amountRaw) < 0;

      results.push({
        id: `tx_imp_${Date.now()}_${index}`,
        uuid: `uuid-imp-${Date.now()}-${index}`,
        title,
        amount,
        type: isExpense ? "expense" : "income",
        categoryName: cols[5] || "Outros",
        categoryId: "cat_lazer",
        date: cols[1] || new Date().toISOString().split("T")[0],
        paymentMethod: "pix",
        accountId: "acc_fluxo",
        accountName: "Conta Fluxo",
        status: "completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: "usr_001"
      });
    }
  });

  return results;
}
