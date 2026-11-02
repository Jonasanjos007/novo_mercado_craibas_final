import { useState } from 'react';
import { useNotification } from '../utils/NotificationCard';
import { UseBrindeAdminStore } from '../storeAdmin/UseBrindeAdminStore';
import { AtribuirBrinde, Brinde, BrindeForm, BrindePedido } from '../models/Brinde';

const emptyBrinde: BrindeForm = {
    nome: '',
    descricao: '',
    estoque: 0,
    ativo: true,
    quantidade_Compras: null,
    data_Inicio: null,
    data_Fim: null,
    colecao: '',
    imagemFile: null,
    removerImagem: false,
};

export const useBrindeController = () => {
    const notify = useNotification();
    const {
        brindes, entregas,
        LoadBrindesAdmin, LoadEntregasAdmin,
        PostSaveBrindeStore, PostUpdateBrindeStore, DeleteBrindeStore,
        PostUpdateActiveBrindeStore, PostAtribuirBrindeStore, PostEntregarBrindeStore,
        GetBrindesByOrderStore,
    } = UseBrindeAdminStore();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<BrindeForm>(emptyBrinde);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const [filtroStatus, setFiltroStatus] = useState<string>('');
    const [deleteTarget, setDeleteTarget] = useState<Brinde | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadBrindes = async () => {
        setLoading(true);
        const result = await LoadBrindesAdmin();
        setLoading(false);
        if (!result.success) {
            notify.error(result.error?.error.code || 'error', result.error?.error.message || 'Erro ao carregar brindes');
        }
    };

    const loadEntregas = async (status?: string) => {
        const result = await LoadEntregasAdmin(status);
        if (!result.success) {
            notify.error(result.error?.error.code || 'error', result.error?.error.message || 'Erro ao carregar entregas');
        }
    };

    const openCreate = () => {
        setForm(emptyBrinde);
        setErrors({});
        setImagemPreview(null);
        setEditing(false);
        setShowModal(true);
    };

    const openEdit = (brinde: Brinde) => {
        setForm({
            id: brinde.id,
            nome: brinde.nome,
            descricao: brinde.descricao,
            estoque: brinde.estoque,
            ativo: brinde.ativo,
            quantidade_Compras: brinde.quantidade_Compras ?? null,
            data_Inicio: brinde.data_Inicio ? brinde.data_Inicio.substring(0, 10) : null,
            data_Fim: brinde.data_Fim ? brinde.data_Fim.substring(0, 10) : null,
            colecao: brinde.colecao,
            imagem: brinde.imagem,
            imagemFile: null,
            removerImagem: false,
        });
        setErrors({});
        setImagemPreview(brinde.imagem ? `/Imagens/Brindes/${brinde.imagem}` : null);
        setEditing(true);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setForm(emptyBrinde);
        setImagemPreview(null);
    };

    const onSelectImagem = (file: File | null) => {
        setForm(f => ({ ...f, imagemFile: file, removerImagem: false }));
        setImagemPreview(file ? URL.createObjectURL(file) : null);
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.nome?.trim()) e.nome = 'Informe o nome do brinde.';
        if ((form.estoque ?? 0) < 0) e.estoque = 'Estoque inválido.';
        if (form.quantidade_Compras != null && form.quantidade_Compras <= 0) e.quantidade_Compras = 'Deve ser maior que zero.';
        if ((form.data_Inicio && !form.data_Fim) || (!form.data_Inicio && form.data_Fim)) e.data = 'Preencha as duas datas do período.';
        if (form.data_Inicio && form.data_Fim && form.data_Fim < form.data_Inicio) e.data = 'A data final deve ser depois da inicial.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const buildFormData = () => {
        const fd = new FormData();
        if (editing && form.id) fd.append('Id', String(form.id));
        fd.append('Nome', form.nome ?? '');
        fd.append('Descricao', form.descricao ?? '');
        fd.append('Estoque', String(form.estoque ?? 0));
        fd.append('Ativo', String(form.ativo ?? true));
        if (form.quantidade_Compras != null) fd.append('Quantidade_Compras', String(form.quantidade_Compras));
        if (form.data_Inicio) fd.append('Data_Inicio', form.data_Inicio);
        if (form.data_Fim) fd.append('Data_Fim', form.data_Fim);
        fd.append('Colecao', form.colecao ?? '');
        if (form.imagemFile) fd.append('Imagem', form.imagemFile);
        if (editing) fd.append('RemoverImagem', String(form.removerImagem ?? false));
        return fd;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        const fd = buildFormData();
        const result = editing ? await PostUpdateBrindeStore(fd) : await PostSaveBrindeStore(fd);
        setSaving(false);
        if (!result.success) {
            notify.error(result.error?.error.code || 'error', result.error?.error.message || 'Erro ao salvar brinde');
            return;
        }
        notify.success('Sucesso', editing ? 'Brinde atualizado.' : 'Brinde cadastrado.');
        closeModal();
    };

    const openDelete = (brinde: Brinde) => setDeleteTarget(brinde);
    const closeDelete = () => { setDeleteTarget(null); setDeleting(false); };

    const handleDelete = async (reason?: string) => {
        if (!deleteTarget) return false;
        setDeleting(true);
        const result = await DeleteBrindeStore(deleteTarget.id, reason ?? '');
        setDeleting(false);
        if (!result.success) {
            notify.error(result.error?.error.code || 'error', result.error?.error.message || 'Erro ao excluir brinde');
            return false;
        }
        notify.success('Sucesso', 'Brinde excluído.');
        closeDelete();
        return true;
    };

    const toggleActive = async (id: number) => {
        const result = await PostUpdateActiveBrindeStore(id);
        if (!result.success) {
            notify.error(result.error?.error.code || 'error', result.error?.error.message || 'Erro ao atualizar brinde');
        }
    };

    const atribuir = async (request: AtribuirBrinde) => {
        const result = await PostAtribuirBrindeStore(request);
        if (!result.success) {
            notify.error(result.error?.error.code || 'error', result.error?.error.message || 'Erro ao atribuir brinde');
            return false;
        }
        notify.success('Sucesso', 'Brinde atribuído ao cliente.');
        return true;
    };

    const entregar = async (idBrindeCliente: number) => {
        const result = await PostEntregarBrindeStore(idBrindeCliente);
        if (!result.success) {
            notify.error(result.error?.error.code || 'error', result.error?.error.message || 'Erro ao entregar brinde');
            return false;
        }
        notify.success('Sucesso', 'Brinde marcado como entregue.');
        return true;
    };

    const getByOrder = async (idOrder: number): Promise<BrindePedido | null> => {
        const result = await GetBrindesByOrderStore(idOrder);
        if (!result.success) return null;
        return result.data ?? null;
    };

    return {
        result: {
            brindes,
            entregas,
            loading,
            saving,
            showModal,
            editing,
            form,
            errors,
            imagemPreview,
            filtroStatus,
            deleteTarget,
            deleting,
        },
        action: {
            loadBrindes,
            loadEntregas,
            openCreate,
            openEdit,
            closeModal,
            setForm,
            setErrors,
            setFiltroStatus,
            onSelectImagem,
            handleSave,
            handleDelete,
            openDelete,
            closeDelete,
            toggleActive,
            atribuir,
            entregar,
            getByOrder,
        },
    };
};
