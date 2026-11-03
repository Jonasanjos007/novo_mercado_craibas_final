import { useState } from 'react';
import { useNotification } from '../utils/NotificationCard';
import { UseBannerAdminStore } from '../storeAdmin/UseBannerAdminStore';
import { Banner, BannerForm } from '../models/Banner';

const emptyBanner = (): BannerForm => ({
    link: '',
    ordem: 0,
    ativo: true,
    data_Inicio: '',
    data_Fim: '',
    imagem: null,
    imagemAtual: null,
});

export const useBannerController = () => {
    const notify = useNotification();
    const {
        banners,
        LoadBannersAdmin,
        PostSaveBannerStore,
        PostUpdateBannerStore,
        DeleteBannerStore,
        PostUpdateActiveBannerStore,
    } = UseBannerAdminStore();

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<BannerForm>(emptyBanner());
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
    const [deleting, setDeleting] = useState(false);

    const load = async () => {
        setLoading(true);
        await LoadBannersAdmin();
        setLoading(false);
    };

    const openCreate = () => {
        setForm(emptyBanner());
        setImagemPreview(null);
        setErrors({});
        setEditing(false);
        setShowModal(true);
    };

    const openEdit = (b: Banner) => {
        setForm({
            id: b.id,
            link: b.link ?? '',
            ordem: b.ordem,
            ativo: b.ativo,
            data_Inicio: b.data_Inicio ? b.data_Inicio.substring(0, 10) : '',
            data_Fim: b.data_Fim ? b.data_Fim.substring(0, 10) : '',
            imagem: null,
            imagemAtual: b.imagem,
        });
        setImagemPreview(b.imagem ? `/Imagens/Banners/${b.imagem}` : null);
        setErrors({});
        setEditing(true);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setForm(emptyBanner());
        setImagemPreview(null);
    };

    const onSelectImagem = (file: File | null) => {
        setForm(f => ({ ...f, imagem: file }));
        setImagemPreview(file ? URL.createObjectURL(file) : (form.imagemAtual ? `/Imagens/Banners/${form.imagemAtual}` : null));
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!editing && !form.imagem) e.imagem = 'Envie a imagem do banner.';
        if (form.data_Inicio && form.data_Fim && form.data_Fim < form.data_Inicio) e.data_Fim = 'A data final não pode ser menor que a inicial.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const buildFormData = () => {
        const fd = new FormData();
        if (editing && form.id) fd.append('Id', String(form.id));
        fd.append('Link', form.link ?? '');
        fd.append('Ordem', String(form.ordem ?? 0));
        fd.append('Ativo', String(form.ativo ?? true));
        if (form.data_Inicio) fd.append('Data_Inicio', form.data_Inicio);
        if (form.data_Fim) fd.append('Data_Fim', form.data_Fim);
        if (form.imagem) fd.append('Imagem', form.imagem);
        return fd;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        const fd = buildFormData();
        const result = editing ? await PostUpdateBannerStore(fd) : await PostSaveBannerStore(fd);
        setSaving(false);
        if (!result.success) {
            notify.error(result.error?.error?.code || 'error', result.error?.error?.message || 'Erro ao salvar banner');
            return;
        }
        notify.success('Sucesso', editing ? 'Banner atualizado.' : 'Banner criado.');
        closeModal();
    };

    const openDelete = (b: Banner) => setDeleteTarget(b);
    const closeDelete = () => { setDeleteTarget(null); setDeleting(false); };

    const handleDelete = async (reason?: string) => {
        if (!deleteTarget) return;
        setDeleting(true);
        const result = await DeleteBannerStore(deleteTarget.id, reason ?? '');
        setDeleting(false);
        if (!result.success) {
            notify.error(result.error?.error?.code || 'error', result.error?.error?.message || 'Erro ao excluir banner');
            return;
        }
        notify.success('Sucesso', 'Banner excluído.');
        closeDelete();
    };

    const toggleActive = async (b: Banner) => {
        const result = await PostUpdateActiveBannerStore(b.id);
        if (!result.success) {
            notify.error(result.error?.error?.code || 'error', result.error?.error?.message || 'Erro ao alterar status');
        }
    };

    return {
        result: { banners, loading, showModal, editing, form, imagemPreview, errors, saving, deleteTarget, deleting },
        action: { load, openCreate, openEdit, closeModal, setForm, onSelectImagem, handleSave, openDelete, closeDelete, handleDelete, toggleActive },
    };
};
