export interface FinancasResumo {
    ano: number;
    mes: number;
    receita_Produtos: number;
    receita_Frete: number;
    receita_Total: number;
    custo_Produtos: number;
    lucro_Bruto: number;
    gastos: number;
    lucro_Liquido: number;
    margem_Percentual: number;
    desconto_Cupons: number;
    total_Pedidos: number;
    total_Itens: number;
    ticket_Medio: number;
    receita_Total_Anterior: number;
    lucro_Liquido_Anterior: number;
    variacao_Receita_Percentual?: number | null;
    variacao_Lucro_Percentual?: number | null;
}

export interface FinancasMes {
    ano: number;
    mes: number;
    label: string;
    receita: number;
    lucro_Liquido: number;
    gastos: number;
}

export interface TopProdutoLucro {
    id_Product: number;
    nome: string;
    quantidade_Vendida: number;
    receita: number;
    custo: number;
    lucro: number;
    margem_Percentual: number;
}

export interface Despesa {
    id: number;
    descricao: string;
    valor: number;
    categoria?: string;
    data: string;
    nome_Admin?: string;
}

export interface DespesaForm {
    id?: number;
    descricao: string;
    valor: number;
    categoria?: string;
    data: string;
}
