import { ChangeEvent, useEffect, useState } from 'react';
import { BadgeCheck, CalendarDays, Camera, Check, Loader2, Mail, Palette, Phone, Shield, ToggleLeft, ToggleRight, User, X } from 'lucide-react';
import { AdminProfileData, User as UserModel } from '../models/User';
import { useNotification } from '../utils/NotificationCard';



type AdminProfileEditorProps = {
  open: boolean;
  darkMode: boolean;
  user: UserModel | null;
  initialData: AdminProfileData;
  onClose: () => void;
  onSave: (data: AdminProfileData) => void;
  loading?: boolean;
};

export default function AdminProfileEditor({ open, darkMode, user, initialData, onClose, onSave, loading }: AdminProfileEditorProps) {
  const [form, setForm] = useState<AdminProfileData>(initialData);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const notify = useNotification();

  useEffect(() => {
    if (open) {
      setForm(initialData);
      setAvatarPreview(null);
    }
  }, [open, initialData]);

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  console.log('AdminProfileEditor renderizado', form);
  const panel = darkMode ? 'bg-[#0d0d14] border-white/[0.08]' : 'bg-white border-surface-200';
  const text = darkMode ? 'text-white' : 'text-surface-900';
  const muted = darkMode ? 'text-white/40' : 'text-surface-400';
  const input = darkMode
    ? 'bg-[#08080d] border-white/[0.1] text-white placeholder:text-white/20 focus:border-brand-400'
    : 'bg-surface-50 border-surface-200 text-surface-900 placeholder:text-surface-300 focus:border-brand-400';

  const changeAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify.error('Imagem', 'Selecione um arquivo de imagem.');
    if (file.size > 2 * 1024 * 1024) return notify.error('Imagem', 'A imagem deve ter no máximo 2 MB.');
    setAvatarPreview(URL.createObjectURL(file));
    setForm(current => ({
      ...current,
      avatarFile: file,
    }));
  };

  const submit = () => {

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    if (!name) return notify.error('Nome', 'Informe o nome do administrador.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return notify.error('E-mail', 'Informe um e-mail válido.');
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={onClose}>
      <div className={`flex h-[100dvh] w-full max-w-2xl flex-col overflow-hidden border shadow-2xl sm:h-auto sm:max-h-[92dvh] sm:rounded-3xl ${panel}`} onMouseDown={event => event.stopPropagation()}>
        <header className={`z-10 flex shrink-0 items-start justify-between gap-3 border-b px-4 py-3 backdrop-blur-xl sm:items-center sm:px-5 sm:py-4 ${panel}`}>
          <div className="min-w-0">
            <h2 className={`font-display text-base font-bold sm:text-lg ${text}`}>
              Editar perfil administrativo
            </h2>
            <p className={`mt-0.5 text-[11px] leading-4 sm:text-xs ${muted}`}>
              Atualize as informações exibidas na sua conta.
            </p>
          </div>
          <button type="button" onClick={onClose} className={`rounded-xl p-2 transition-colors ${darkMode ? 'hover:bg-white/[0.08]' : 'hover:bg-surface-100'} ${muted}`} aria-label="Fechar"><X className="h-5 w-5" /></button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:space-y-6 sm:p-6">
          <section className="flex flex-col items-center gap-3 rounded-2xl bg-brand-500/[0.06] p-4 sm:flex-row sm:p-5">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-lg">
                {(avatarPreview || form.avatar) ? <img src={avatarPreview || `/Imagens/Usuarios/${form.avatar}`} alt="Prévia da foto" className="h-full w-full object-cover" /> : <span className="text-3xl font-bold text-white">
                  {form.name[0]?.toUpperCase() || 'A'}
                </span>}
              </div>
              <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-brand-500 shadow hover:bg-brand-600">
                <Camera className="h-4 w-4 text-white" />
                <input type="file" accept="image/*" onChange={changeAvatar} className="sr-only" />
              </label>
            </div>
            <div className="min-w-0 text-center sm:text-left"><p className={`font-bold ${text}`}>
              Foto do perfil
            </p>
              <p className={`mt-1 text-xs leading-5 ${muted}`}>
                JPG, PNG ou WebP, com no máximo 2 MB.
              </p>{(avatarPreview || form.avatar) && <button type="button" onClick={() => {
                setAvatarPreview(null);
                setForm(current => ({ ...current, avatar: '', avatarFile: null }));
              }} className="mt-2 text-xs font-semibold text-rose-500 hover:text-rose-600">
                Remover foto
              </button>}
            </div>
          </section>

          <section>
            <h3 className={`mb-3 flex items-center gap-2 text-sm font-bold ${text}`}>
              <User className="h-4 w-4 text-brand-400" />
              Informações pessoais
            </h3>
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className={`mb-2 block text-xs font-bold uppercase tracking-wide ${muted}`}>
                Nome completo
              </span>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${muted}`} />
                  <input
                    autoFocus
                    value={form.name}
                    onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                    placeholder="Nome do administrador"
                    className={`w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm outline-none ${input}`} />
                </div>
              </label>
              <label>
                <span className={`mb-2 block text-xs font-bold uppercase tracking-wide ${muted}`}>
                  E-mail de acesso
                </span>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${muted}`} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                    placeholder="admin@empresa.com"
                    className={`w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm outline-none ${input}`} /></div></label>
              <label>
                <span className={`mb-2 block text-xs font-bold uppercase tracking-wide ${muted}`}>
                  Telefone
                </span>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${muted}`} />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => {
                      let value = event.target.value.replace(/\D/g, '');

                      // Máximo de 11 números
                      value = value.slice(0, 11);

                      // Máscara visual
                      if (value.length <= 2) {
                        value = value.replace(/^(\d{0,2})/, '($1');
                      } else if (value.length <= 6) {
                        value = value.replace(
                          /^(\d{2})(\d+)/,
                          '($1) $2'
                        );
                      } else if (value.length <= 10) {
                        value = value.replace(
                          /^(\d{2})(\d{4})(\d+)/,
                          '($1) $2-$3'
                        );
                      } else {
                        value = value.replace(
                          /^(\d{2})(\d{5})(\d{4})/,
                          '($1) $2-$3'
                        );
                      }

                      setForm(current => ({
                        ...current,
                        phone: value
                      }));
                    }}
                    maxLength={15}
                    placeholder="(82) 99999-9999"
                    className={`w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm outline-none ${input}`}
                  />
                </div>
              </label>
              <div className="flex items-center justify-between">


                <button
                  type="button"
                  onClick={() =>
                    setForm(current => ({ ...current, tema: !current.tema }))
                  }
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-all ${input}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10">
                      <Palette className="h-4 w-4 text-brand-400" />
                    </div>

                    <div className="text-left">
                      <p className={`text-sm font-semibold ${text}`}>
                        Tema do sistema
                      </p>

                      <p className={`text-xs ${muted}`}>
                        {form.tema ? 'Modo escuro ativado' : 'Modo claro ativado'}
                      </p>
                    </div>
                  </div>

                  {form.tema ? (
                    <ToggleRight className="h-8 w-8 shrink-0 text-brand-500" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 shrink-0 text-surface-300" />
                  )}
                </button>
              </div>
            </div>
          </section>

          <section>
            <h3 className={`mb-3 flex items-center gap-2 text-sm font-bold ${text}`}>
              <Shield className="h-4 w-4 text-brand-400" />
              Informações de acesso
            </h3>
            <div className={`grid grid-cols-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-3 ${darkMode ? 'border-white/[0.08] bg-white/[0.08]' : 'border-surface-200 bg-surface-200'}`}>
              {[{ icon: BadgeCheck, label: 'Perfil', value: 'Administrador' }, { icon: Shield, label: 'ID da conta', value: user?.id ? `#${user.id}` : 'Indisponível' }, { icon: CalendarDays, label: 'Cadastro', value: user?.insert_Date ? new Date(user.insert_Date).toLocaleDateString('pt-BR') : 'Indisponível' }].map(item => <div key={item.label} className={`p-4 ${darkMode ? 'bg-[#0d0d14]' : 'bg-white'}`}><item.icon className="mb-2 h-4 w-4 text-brand-400" /><p className={`text-[10px] font-bold uppercase tracking-wide ${muted}`}>{item.label}</p><p className={`mt-0.5 truncate text-sm font-semibold ${text}`}>{item.value}</p></div>)}
            </div>
            <p className={`mt-2 text-xs ${muted}`}>
              Perfil, permissões e identificador são definidos pelo sistema e não podem ser alterados aqui.
            </p>
          </section>
        </div>

        <footer className={`grid shrink-0 grid-cols-2 gap-2 border-t p-3 sm:flex sm:justify-end sm:p-4 ${panel}`}>
          <button
            type="button"
            onClick={onClose}
            className={`min-w-0 rounded-xl px-3 py-2.5 text-sm font-bold sm:px-4 ${darkMode ? 'bg-white/[0.06] text-white/70' : 'bg-surface-100 text-surface-600'}`}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex min-w-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-3 py-2.5 text-sm font-bold text-white shadow-brand hover:bg-brand-600 sm:px-5">

            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />) : (
              <>
                <Check className="h-4 w-4 shrink-0" />
                <span className="truncate">Salvar alterações</span>
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
