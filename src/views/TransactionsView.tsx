import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Header";
import { exportTransactionsToPDF } from "../lib/pdfExport";
import { exportTransactionsToCSV, parseCSVToTransactions } from "../lib/csvExport";
import { TransactionType } from "../types";
import { 
  Search, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  Filter, 
  Calendar,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export const TransactionsView: React.FC = () => {
  const {
    user,
    transactions,
    categories,
    deleteTransaction,
    importTransactions,
    openAddTxModal,
    selectedMonth,
    setSelectedMonth,
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [selectedCatId, setSelectedCatId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtering
  const filteredTxs = transactions.filter((t) => {
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesCat = selectedCatId === "all" || t.categoryId === selectedCatId;
    const matchesQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.accountName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCat && matchesQuery;
  });

  // Calculate totals for filtered
  const periodIncome = filteredTxs
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const periodExpense = filteredTxs
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleExportPDF = () => {
    exportTransactionsToPDF(filteredTxs, user);
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTxs, `extrato_fluxo_${selectedMonth}.csv`);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          const parsed = parseCSVToTransactions(text);
          if (parsed.length > 0) {
            importTransactions(parsed);
            alert(`${parsed.length} lançamentos importados com sucesso!`);
          } else {
            alert("Nenhum lançamento válido encontrado no arquivo CSV.");
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen pb-28 bg-background text-on-surface">
      <Header title="Extrato & Lançamentos" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {/* Month Selector & Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-outline uppercase flex items-center gap-1">
              <Calendar className="w-4 h-4 text-primary" />
              Período:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold bg-surface-container-low border border-outline-variant/30 rounded-xl focus:outline-none"
            />
          </div>

          {/* Export & Import Action Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all"
              title="Exportar para PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              PDF
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary-container/50 text-on-secondary-container hover:bg-secondary-container text-xs font-bold transition-all"
              title="Exportar para Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              CSV
            </button>

            <label className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface-variant text-xs font-bold cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5" />
              Importar
              <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
            </label>
          </div>
        </div>

        {/* Period Totals Summary Card */}
        <div className="grid grid-cols-2 gap-3 bg-surface-container-lowest dark:bg-inverse-surface/40 p-4 rounded-2xl border border-outline-variant/20 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary-container/50 flex items-center justify-center text-secondary">
              <ArrowUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-outline uppercase font-bold">Total Receitas</span>
              <p className="text-sm font-bold text-secondary">
                + R$ {periodIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-error-container/50 flex items-center justify-center text-error">
              <ArrowDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-outline uppercase font-bold">Total Despesas</span>
              <p className="text-sm font-bold text-error">
                - R$ {periodExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição, categoria ou conta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-container-lowest dark:bg-inverse-surface/40 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="flex gap-1 p-1 bg-surface-container rounded-xl text-xs">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  typeFilter === "all" ? "bg-surface-container-lowest text-primary shadow-xs" : "text-outline"
                }`}
              >
                Tudo
              </button>
              <button
                onClick={() => setTypeFilter("income")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  typeFilter === "income" ? "bg-primary text-on-primary shadow-xs" : "text-outline"
                }`}
              >
                Receitas
              </button>
              <button
                onClick={() => setTypeFilter("expense")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  typeFilter === "expense" ? "bg-error text-on-error shadow-xs" : "text-outline"
                }`}
              >
                Despesas
              </button>
            </div>

            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-surface-container border border-outline-variant/30 rounded-xl focus:outline-none"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {filteredTxs.length === 0 ? (
            <div className="p-12 text-center bg-surface-container-lowest dark:bg-inverse-surface/40 rounded-2xl border border-outline-variant/20 space-y-2">
              <Filter className="w-8 h-8 text-outline mx-auto" />
              <p className="text-sm font-semibold text-on-surface">Nenhum lançamento encontrado</p>
              <p className="text-xs text-outline">Tente alterar os filtros ou adicione uma nova movimentação.</p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest dark:bg-inverse-surface/40 rounded-2xl border border-outline-variant/20 divide-y divide-outline-variant/10 overflow-hidden shadow-xs">
              {filteredTxs.map((tx) => {
                const isExpense = tx.type === "expense";
                return (
                  <div
                    key={tx.id}
                    className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isExpense ? "bg-error-container/40 text-error" : "bg-secondary-container/40 text-secondary"
                        }`}
                      >
                        {isExpense ? "OUT" : "IN"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{tx.title}</p>
                        <p className="text-[11px] text-outline">
                          {tx.categoryName} • {tx.accountName} ({tx.paymentMethod.toUpperCase()})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold block ${
                            isExpense ? "text-error" : "text-secondary"
                          }`}
                        >
                          {isExpense ? "- " : "+ "}
                          R$ {tx.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-outline">{tx.date}</span>
                      </div>

                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Excluir Lançamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
