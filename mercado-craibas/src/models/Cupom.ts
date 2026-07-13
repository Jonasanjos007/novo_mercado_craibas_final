
export interface Cupom {
    id: number;
    name_Cupom: string;
    cod_Cupom: string;
    descriotion: string;
    discont: number;
    active: boolean;
    date_Start: Date;
    date_end: Date;
    minimum_Value?: number;
}