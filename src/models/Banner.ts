export interface Banner {
    id: number;
    imagem: string;
    link?: string | null;
    ordem: number;
    ativo: boolean;
    data_Inicio?: string | null;
    data_Fim?: string | null;
}

export interface BannerForm {
    id?: number;
    link: string;
    ordem: number;
    ativo: boolean;
    data_Inicio: string;
    data_Fim: string;
    imagem: File | null;
    imagemAtual?: string | null;
}
