export interface Brinde {
    id: number;
    nome: string;
    descricao?: string;
    imagem?: string;
    estoque: number;
    ativo: boolean;
    quantidade_Compras?: number | null;
    data_Inicio?: string | null;
    data_Fim?: string | null;
    colecao?: string;
    total_Entregues?: number;
    total_Pendentes?: number;
}

export interface BrindeForm {
    id?: number;
    nome: string;
    descricao?: string;
    estoque: number;
    ativo: boolean;
    quantidade_Compras?: number | null;
    data_Inicio?: string | null;
    data_Fim?: string | null;
    colecao?: string;
    imagemFile?: File | null;
    imagem?: string;
    removerImagem?: boolean;
}

export interface BrindeCliente {
    id: number;
    id_Brinde: number;
    nome_Brinde: string;
    imagem_Brinde?: string;
    colecao?: string;
    id_User_Customer: number;
    nome_Cliente: string;
    id_Order?: number | null;
    numero_Pedido?: string;
    origem: string;
    status: string;
    entregue_Em?: string;
    quem_Entregou?: string;
    insertDate: string;
}

export interface BrindePedido {
    id_User_Customer: number;
    primeira_Compra: boolean;
    quantidade_Compras: number;
    brindes: BrindeCliente[];
}

export interface AtribuirBrinde {
    id_Brinde: number;
    id_User_Customer: number;
    id_Order?: number | null;
}
