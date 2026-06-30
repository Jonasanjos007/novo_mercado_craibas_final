import { useRef, useState } from 'react';
import {
    MapPin, Plus, Pencil, Trash2, Check, CheckCircle2,
    ArrowLeft, X, Star, Shield, Truck, RefreshCw, Award
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { UseAddressStore } from '../store/UseAddressStore';
import Headerpages from '../components/Headerpages';
import { Address } from '../models/Address';
import { UseUserStore } from '../store/UseUserStore';
import { getColorConfig } from '../types/Colors';
import { useAddressController } from '../controller/useAddressController';
import ConfirmPopup from '../components/ConfirmPopup';
import Loading from '../components/Loading';
import AlertPopup from '../components/AlertPopup';


const fields = [
    { label: 'Número', key: 'number', placeholder: '123' },
    { label: 'Nome', key: 'name', placeholder: 'João Silva Souza' },
    { label: 'Complemento', key: 'supplement', placeholder: 'Apto 101' },
    { label: 'Bairro', key: 'neighborhood', placeholder: 'Centro' },
    { label: 'Ponto de referência', key: 'referencePoint', placeholder: 'Próximo à padaria' },
    { label: 'Cidade', key: 'city', placeholder: 'Campinas' },
    { label: 'Estado', key: 'state', placeholder: 'SP' },
];

export default function AddressPage() {
    const Controller = useAddressController();
    const { address } = UseAddressStore();

    const formRef = useRef<HTMLDivElement>(null);
    const { Boleano } = useParams();
    const setPage = Boolean(Boleano);
    const navigate = useNavigate();
    const { NameColorGlobal, ColorGlobalTema, ColorGlobalHover, ColorGlobalText } = UseUserStore();
    const colorConfig = getColorConfig(NameColorGlobal);
    const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");

        if (numbers.length <= 2) {
            return numbers ? `(${numbers}` : "";
        }

        if (numbers.length <= 7) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        }

        if (numbers.length <= 11) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        }

        // Depois de 11 números continua mostrando o restante
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    };

    return (
        <div className="min-h-screen bg-[#f5f5f7]">
            <Headerpages title="Endereços" showSecure={false} />

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

                {/* ── Page header ── */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-white border border-surface-100 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="font-display font-bold text-surface-900 text-xl">Meus Endereços</h1>
                        <p className="text-surface-400 text-sm font-body mt-0.5">Gerencie seus endereços de entrega</p>
                    </div>
                </div>



                {/* ── Main card ── */}
                <div className="bg-white rounded-2xl border border-surface-100 shadow-soft">

                    {/* Card header */}
                    <div className="flex items-center justify-between gap-4 px-6 py-5 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: `${colorConfig.hex}18` }}
                            >
                                <MapPin className={`w-4 h-4 ${ColorGlobalText}`} />
                            </div>
                            <span className="font-display font-bold text-surface-900 text-base">Endereços cadastrados</span>
                            <span className="text-xs font-medium text-surface-400 bg-surface-50 border border-surface-100 px-2 py-0.5 rounded-full">
                                {address?.length || 0} {address?.length === 1 ? 'endereço' : 'endereços'}
                            </span>
                        </div>

                        {!Controller?.result.cardAddendereco && (
                            <button
                                onClick={() => { Controller?.action.setcardAddendereco(true) }}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${ColorGlobalTema} ${ColorGlobalHover} text-white text-sm font-semibold transition-colors`}
                            >
                                <Plus className="w-4 h-4" />
                                Novo endereço
                            </button>
                        )}
                    </div>

                    {/* Lista de endereços */}
                    <div className="px-6 pb-6 space-y-3">
                        {(!address || address.length === 0) ? (
                            <div className="text-center py-12 flex flex-col items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-surface-50 border border-surface-100 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-surface-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-surface-500">Nenhum endereço cadastrado</p>
                                    <p className="text-xs text-surface-400 mt-0.5">Adicione um endereço para continuar.</p>
                                </div>
                            </div>
                        ) : (
                            address.map((item, index) => (
                                <div
                                    key={item.id ?? index}
                                    className="bg-white border-b border-surface-200 px-5 py-5 hover:bg-surface-50 transition-colors"
                                >
                                    {/* Cabeçalho */}
                                    <div className="flex flex-col sm:flex-row gap-4">

                                        {/* Ícone */}
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ background: `${colorConfig.hex}12` }}
                                        >
                                            <MapPin
                                                className="w-5 h-5"
                                                style={{ color: colorConfig.hex }}
                                            />
                                        </div>

                                        {/* Conteúdo */}
                                        <div className="flex-1">

                                            {/* Nome + Telefone */}
                                            {/* Nome + Telefone */}
                                            <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">

                                                <h3 className="text-sm sm:text-lg font-semibold text-surface-900 truncate">
                                                    {item.name ?? "Jonas José Dos Anjos"}
                                                </h3>

                                                <span className="text-surface-300 flex-shrink-0">|</span>

                                                <span className="text-xs sm:text-base text-surface-600 flex-shrink-0">
                                                    {item.phone ?? "(82) 99999-9999"}
                                                </span>

                                            </div>

                                            {/* Rua */}
                                            <p className="text-surface-700 mt-2">
                                                {item.road}, {item.number}
                                                {item.supplement && `, ${item.supplement}`}
                                                {item.neighborhood && `, ${item.neighborhood}`}
                                            </p>

                                            {/* Cidade */}
                                            <p className="text-surface-500 mt-1">
                                                {item.city}, {item.state}
                                            </p>

                                            {/* Referência */}
                                            {item.referencePoint && (
                                                <p className="text-surface-400 text-sm mt-1">
                                                    {item.referencePoint}
                                                </p>
                                            )}

                                            {/* Badge */}
                                            <div className="mt-4">
                                                {item.standard ? (
                                                    <span
                                                        className="inline-flex items-center gap-1 px-3 py-1 rounded border text-xs font-semibold"
                                                        style={{
                                                            color: colorConfig.hex,
                                                            borderColor: `${colorConfig.hex}55`,
                                                            background: `${colorConfig.hex}08`,
                                                        }}
                                                    >
                                                        <CheckCircle2
                                                            className="w-3 h-3"
                                                            fill={colorConfig.hex}
                                                        />
                                                        Padrão
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded border border-surface-300 text-surface-500 text-xs">
                                                        Endereço de entrega
                                                    </span>
                                                )}
                                            </div>

                                        </div>

                                    </div>

                                    {/* Botões */}
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <button
                                            onClick={() => {
                                                Controller?.action.setAddrForm(item);
                                                Controller?.action.setcardAddendereco(true);
                                                Controller?.action.setIsEditeAddres(true);

                                                setTimeout(() => {
                                                    formRef.current?.scrollIntoView({
                                                        behavior: "smooth",
                                                        block: "start",
                                                    });
                                                }, 100);
                                            }}

                                            className="flex-1 min-w-[110px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 hover:bg-surface-100 text-surface-700 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                            Editar
                                        </button>

                                        <button
                                            onClick={() => {
                                                Controller?.action.setAddrForm(item);
                                                Controller?.action.setOpenDelete(true);
                                            }}
                                            className="flex-1 min-w-[110px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Excluir
                                        </button>

                                    </div>

                                </div>
                            ))
                        )}
                    </div>

                    {/* ── Inline form ── */}
                    {Controller?.result.cardAddendereco && (
                        <>
                            <div ref={formRef}>
                                <div className="border-t border-surface-100 mx-6" />

                                <div className="px-6 py-5">
                                    <div className="flex items-center justify-between mb-5">

                                        <div className="flex items-center gap-2">
                                            <div className="relative w-4 h-4 shrink-0">
                                                <MapPin className={`w-4 h-4 ${ColorGlobalText}`} />
                                            </div>

                                            <p className="text-sm font-semibold text-surface-800">
                                                {Controller.result.IsEditeAddres
                                                    ? "Editar endereço"
                                                    : "Novo endereço"}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => Controller.action.setcardAddendereco(false)}
                                            className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                        {/* Rua — span full */}
                                        <div className="sm:col-span-2">
                                            <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                                Rua / Avenida
                                            </label>
                                            <input
                                                value={Controller?.result.addrForm.road || ""}
                                                onChange={e => Controller?.action.setAddrForm(p => ({ ...p, road: e.target.value }))}
                                                placeholder="Rua das Flores"
                                                className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl bg-surface-50 focus:bg-white focus:border-brand-400 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                                Telefone
                                            </label>

                                            <input
                                                value={formatPhone(Controller?.result.addrForm.phone ?? "")}
                                                required
                                                onChange={(e) =>
                                                    Controller?.action.setAddrForm(p => ({
                                                        ...p,
                                                        phone: e.target.value.replace(/\D/g, "")
                                                    }))
                                                }
                                                placeholder="(99) 99999-9999 "
                                                maxLength={17}
                                                className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl bg-surface-50 focus:bg-white focus:border-brand-400 focus:outline-none transition-colors"
                                            />
                                        </div>

                                        {fields.filter(f => f.key !== "road").map(f => (
                                            <div key={f.key}>
                                                <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                                    {f.label}
                                                </label>
                                                <input
                                                    value={(Controller?.result.addrForm as any)[f.key]}
                                                    onChange={e => Controller?.action.setAddrForm(p => ({ ...p, [f.key]: e.target.value }))}
                                                    placeholder={f.placeholder}
                                                    className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl bg-surface-50 focus:bg-white focus:border-brand-400 focus:outline-none transition-colors"
                                                />
                                            </div>
                                        ))}

                                        {/* Toggle endereço padrão */}
                                        <div className="sm:col-span-2 flex items-center justify-between gap-4 py-1">
                                            <div>
                                                <p className="text-sm font-medium text-surface-700">Endereço padrão</p>
                                                <p className="text-xs text-surface-400 mt-0.5">Usar automaticamente nos pedidos</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => Controller?.action.setAddrForm(p => ({ ...p, standard: !p.standard }))}
                                                className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${Controller?.result.addrForm.standard ? `${ColorGlobalTema} ${ColorGlobalHover}` : "bg-surface-200"
                                                    }`}
                                                aria-label="Definir como padrão"
                                            >
                                                <span
                                                    className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${Controller?.result.addrForm.standard ? "translate-x-[18px]" : ""
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Ações do formulário */}
                                    <div className="flex gap-2 mt-5">
                                        {!Controller?.result.IsEditeAddres ? (
                                            <button
                                                onClick={async () => {
                                                    const result = await Controller?.action.SubmitAddres(Controller?.result.addrForm);
                                                    if (result) {
                                                        Controller?.action.setAddrForm({
                                                            road: "", number: 0, supplement: "", neighborhood: "",
                                                            city: "", state: "", referencePoint: "", standard: false, phone: '', name: ''
                                                        });
                                                        Controller?.action.setcardAddendereco(false);
                                                    }

                                                }}
                                                className={`inline-flex items-center gap-2 px-5 py-2.5 ${ColorGlobalTema} ${ColorGlobalHover} text-white text-sm font-semibold rounded-xl transition-colors`}
                                            >
                                                <Check className="w-4 h-4" />
                                                Salvar endereço
                                            </button>
                                        ) : (
                                            <button
                                                onClick={async () => {
                                                    const result = await Controller.action.UpdateAddress(Controller?.result.addrForm, setPage);
                                                    if (result) {
                                                        Controller.action.setcardAddendereco(false);
                                                        Controller.action.setIsEditeAddres(false);
                                                    }

                                                }}
                                                className={`inline-flex items-center gap-2 px-5 py-2.5 ${ColorGlobalTema} ${ColorGlobalHover} text-white text-sm font-semibold rounded-xl transition-colors`}
                                            >
                                                <Check className="w-4 h-4" />
                                                Editar alterações
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                Controller?.action.setAddrForm({
                                                    road: "", number: 0, supplement: "", neighborhood: "",
                                                    city: "", state: "", referencePoint: "", standard: false, phone: '', name: ''
                                                });
                                                Controller.action.setcardAddendereco(false);
                                                Controller.action.setIsEditeAddres(false);
                                            }}
                                            className="px-5 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-600 text-sm font-semibold rounded-xl transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </>
                    )}
                </div>
            </div>

            {/* ── Delete confirm modal ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-surface-100 shadow-2xl w-full max-w-sm p-6">
                        <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </div>
                        <h3 className="font-display font-bold text-surface-900 text-base mb-1">Remover Endereço</h3>
                        <p className="text-surface-400 text-sm font-body mb-5">
                            Deseja remover <span className="font-semibold text-surface-700">{deleteTarget.road}, {deleteTarget.number}</span>? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 px-4 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-600 text-sm font-semibold rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    // Controller?.action.DeleteAddres(deleteTarget)
                                    setDeleteTarget(null);
                                }}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
                            >
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmPopup
                open={Controller?.result.openDelete || false}
                title="Remover Endereço"
                description="Deseja realmente remover este endereço?"
                confirmText="Remover"
                onCancel={() => { Controller?.action.setOpenDelete(false); }}
                onConfirm={async () => {
                    Controller?.action.setOpenDelete(false);
                    await Controller?.action.DeleteAddres(Controller.result.addrForm);
                }}
            />
            <Loading
                loading={Controller?.result?.LoadingProfile || false}
                message={Controller?.result.LoadingTitleMessage}
                subMessage={Controller?.result.LoadingMessage}
            />

            <AlertPopup
                open={Controller?.result.openAlert || false}
                title={Controller?.result.LoadingTitleMessage}
                description={Controller?.result.LoadingMessage}
                onClose={() => Controller?.action.setOpenAlert(false)}
            />
        </div>
    );
}
