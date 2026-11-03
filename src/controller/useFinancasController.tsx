import { useState } from 'react';
import { useNotification } from '../utils/NotificationCard';
import { UseFinancasAdminStore } from '../storeAdmin/UseFinancasAdminStore';
import { Despesa, DespesaForm } from '../models/Financas';

const hoje = new Date();

const emptyDespesa = (): DespesaForm => ({
    descricao: '',
    valor: 0,
    categoria: '',
    data: new Date().toISOString().substring(0, 10),
});

export const useFinancasController = () => {
    const notify = useNotification();
    const {
        resumo, serie, topProdutos, despesas, categorias,
        LoadResumo, LoadSerie, LoadTopProdutos, LoadDespesas, LoadCategorias,
        PostSaveDespesaStore, PostUpdateDespesaStore, DeleteDespesaStore,
    } = UseFinancasAdminStore();

    const [ano, setAno] = useState(hoje.getFullYear());
    const [mes, setMes] = useState(hoje.getMonth() + 1);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<DespesaForm>(emptyDespesa());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<Despesa | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadTudo = async (anoAtual: number, mesAtual: number) => {
        setLoading(true);
        await Promise.all([
            LoadResumo(anoAtual, mesAtual),
            LoadTopProdutos(anoAtual, mesAtual),
            LoadDespesas(anoAtual, mesAtual),
            LoadSerie(anoAtual),
            LoadCategorias(),
        ]);
        setLoading(false);
    };

    const openCreate = () => {
        setForm({ ...emptyDespesa(), data: new Date(ano, mes - 1, Math.min(hoje.getDate(), 28)).toISOString().substring(0, 10) });
        setErrors({});
        setEditing(false);
        setShowModal(true);
    };

    const openEdit = (despesa: Despesa) => {
        setForm({
            id: despesa.id,
            descricao: despesa.descricao,
            valor: despesa.valor,
            categoria: despesa.categoria,
            data: despesa.data ? despesa.data.substring(0, 10) : new Date().toISOString().substring(0, 10),
        });
        setErrors({});
        setEditing(true);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setForm(emptyDespesa());
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.descricao?.trim()) e.descricao = 'Informe a descrição.';
        if ((form.valor ?? 0) <= 0) e.valor = 'Valor deve ser maior que zero.';
        if (!form.data) e.data = 'Informe a data.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        const payload: DespesaForm = { ...form, data: new Date(form.data).toISOString() };
        const result = editing ? await PostUpdateDespesaStore(payload) : await PostSaveDespesaStore(payload);
        setSaving(false);
        if (!result.success) {
            notify.error(result.error?.error.code || 'error', result.error?.error.message || 'Erro ao salvar despesa');
            return;
        }
        notify.success('Sucesso', editing ? 'Despesa atualizada.' : 'Despesa lançada.');
        closeModal();
        await loadTudo(ano, mes);
    };

    const openDelete = (despesa: Despesa) => setDeleteTarget(despesa);
    const closeDelete = () => { setDeleteTarget(null); setDeleting(false); };

    const handleDelete = async (reason?: string) => {
        if (!deleteTarget) return;
        setDeleting(true);
        const result = await DeleteDespesaStore(deleteTarget.id, reason ?? '');
        setDeleting(false);
        if (!result.success) {
            notify.error(result.error?.error.code || 'error', result.error?.error.message || 'Erro ao excluir despesa');
            return;
        }
        notify.success('Sucesso', 'Despesa excluída.');
        closeDelete();
        await loadTudo(ano, mes);
    };

    const mudarMes = (novoAno: number, novoMes: number) => {
        setAno(novoAno);
        setMes(novoMes);
        loadTudo(novoAno, novoMes);
    };

    return {
        result: {
            ano, mes, loading,
            resumo, serie, topProdutos, despesas, categorias,
            showModal, editing, form, errors, saving,
            deleteTarget, deleting,
        },
        action: {
            setAno, setMes, mudarMes, loadTudo,
            openCreate, openEdit, closeModal, setForm, setErrors,
            handleSave, openDelete, closeDelete, handleDelete,
        },
    };
};
