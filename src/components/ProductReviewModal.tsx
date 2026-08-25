import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Play, Star, Trash2, UploadCloud, X } from 'lucide-react';
import { ProductSaveOrder } from '../models/Product';
import { UseOrderStore } from '../store/UseOrderStore';
import { useNotification } from '../utils/NotificationCard';

type ReviewMedia = { name: string; type: string; url: string };
export type ProductReview = {
  orderId: number;
  productId: number;
  rating: number;
  comment: string;
  media: ReviewMedia[];
  recommend: boolean;
};

const STORAGE_KEY = 'mercado-craibas-product-reviews';

export const getSavedReviews = (): ProductReview[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};

export const createAssessmentFormData = (assessment: ProductReview, files: File[]): FormData => {
  const data = new FormData();
  data.append('orderId', String(assessment.orderId));
  data.append('productId', String(assessment.productId));
  data.append('rating', String(assessment.rating));
  data.append('comment', assessment.comment);
  data.append('recommend', String(assessment.recommend));
  files.forEach(file => data.append('media', file, file.name));
  return data;
};

interface Props {
  open: boolean;
  onClose: () => void;
  product: ProductSaveOrder | null;
  orderId: number;
  orderNumber?: string;
  themeClass?: string;
  onSaved?: (review: ProductReview) => void;
  onSubmitFormData?: (formData: FormData) => Promise<void>;
}

export default function ProductReviewModal({ open, onClose, product, orderId, orderNumber, themeClass = 'bg-brand-500 hover:bg-brand-600', onSaved, onSubmitFormData }: Props) {
  const existing = useMemo(() => getSavedReviews().find(r => r.orderId === orderId && r.productId === product?.id), [open, orderId, product?.id]);
  const [rating, setRating] = useState(0);
  const { PostRating } = UseOrderStore();
  const notify = useNotification();
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState(true);
  const [media, setMedia] = useState<ReviewMedia[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [assessment, setAssessment] = useState<ProductReview>({
    orderId: 0,
    productId: 0,
    rating: 0,
    comment: "",
    media: [],
    recommend: false,
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [saveAssessmentLoading, setSaveAssessmentLoading] = useState(false);


  useEffect(() => {
    if (!open) return;
    setRating(existing?.rating || 0);
    setComment(existing?.comment || '');
    setRecommend(existing?.recommend ?? true);
    setMedia(existing?.media || []);
    setAssessment(existing || { orderId, productId: product?.id || 0, rating: 0, comment: '', media: [], recommend: true });
    setMediaFiles([]);
    setError(''); setSuccess(false);
  }, [open, existing, orderId, product?.id]);

  if (!open || !product) return null;
  const image = `/Imagens/Produtos/${product.imagens?.[0]?.url_Imagem || ''}`;

  const addMedia = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const available = Math.max(0, 5 - media.length);
    const valid = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/')).slice(0, available);
    setMedia(prev => [...prev, ...valid.map(file => ({ name: file.name, type: file.type, url: URL.createObjectURL(file) }))]);
    setMediaFiles(prev => [...prev, ...valid]);
    setAssessment(prev => ({ ...prev, media: [...prev.media, ...valid.map(file => ({ name: file.name, type: file.type, url: URL.createObjectURL(file) }))] }));
    event.target.value = '';
  };

  const handleSaveAssessment = async () => {
    setError('');

    if (!assessment.rating) {
      setError('Escolha de 1 a 5 estrelas.');
      return;
    }
    if (assessment.comment.trim().length < 10) {
      setError('Conte um pouco mais sobre o produto (mínimo de 10 caracteres).');
      return;
    }

    setSaveAssessmentLoading(true);
    const review: ProductReview = {
      ...assessment,
      orderId,
      productId: product.id,
      comment: assessment.comment.trim(),
    };

    const formData = new FormData();
    formData.append('OrderId', String(review.orderId));
    formData.append('ProductId', String(review.productId));
    formData.append('Rating', String(review.rating));
    formData.append('Comment', review.comment);
    formData.append('Recommend', String(review.recommend));

    mediaFiles.forEach(file => {
      formData.append('Media', file);
    });

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const result = await PostRating(formData);

      if (!result.success) {
        setError(result.error?.error.message || 'Erro ao salvar avaliação.');
        notify.error(result.error?.error.code || 'Avaliação', result.error?.error.message || 'error ao salvar avaliação')
        return;
      }

      const others = getSavedReviews().filter(r => !(r.orderId === orderId && r.productId === product.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...others, review]));
      onSaved?.(review);
      setSuccess(true);
      setAssessment({ orderId: 0, productId: 0, rating: 0, comment: "", media: [], recommend: false, });
      notify.success('Avaliação', 'Avaliação Salva Com suceso!');
      setAssessment({
        orderId: 0,
        productId: 0,
        rating: 0,
        comment: "",
        media: [],
        recommend: false
      });
    } catch (err: any) {
      console.log(err)
      console.log(err.response);
      console.log(err.response?.data);
      setError(err.response?.data || 'Não foi possível enviar a avaliação. Tente novamente.');
    } finally {
      setSaveAssessmentLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-surface-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}>
      <div className="flex max-h-[96dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-strong sm:max-h-[92vh] sm:max-w-2xl sm:rounded-[28px]"
        onClick={e => e.stopPropagation()}>
        <div className="z-10 flex shrink-0 items-center justify-between border-b border-surface-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
          <div className="min-w-0 pr-3">
            <p className="truncate text-[10px] font-bold uppercase tracking-widest text-surface-400 sm:text-[11px]">
              Pedido #{orderNumber || orderId}
            </p>
            <h2 className="truncate font-display text-lg font-bold text-surface-900 sm:text-xl">{existing ? 'Editar avaliação' : 'Avaliar produto'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-10 w-10 place-items-center rounded-full bg-surface-100 text-surface-500 hover:bg-surface-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        {success ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-green-50">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="font-display text-2xl font-bold text-surface-900">
              Avaliação publicada!
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-surface-500">
              Obrigado por compartilhar sua experiência. Ela ajuda outros clientes a escolherem melhor.
            </p>
            <button
              onClick={onClose}
              className={`mt-7 rounded-xl px-7 py-3 text-sm font-bold text-white ${themeClass}`}>
              Concluir</button>
          </div>
        ) : (
          <div className="overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
            <div className="flex items-center gap-3 rounded-2xl bg-surface-50 p-3 sm:gap-4">
              <img
                src={image}
                alt={product.name}
                className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16" />
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-bold text-surface-900 sm:text-base">
                  {product.name}
                </p>
                <p className="mt-1 text-xs text-surface-400">
                  Compra verificada
                </p>
              </div>
            </div>
            <div className="py-5 text-center sm:py-7">
              <p className="font-display text-sm font-bold text-surface-800 sm:text-base">
                Como foi sua experiência?
              </p>
              <div className="mt-3 flex justify-center gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5].map(n =>
                  <button key={n}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => { setRating(n); setAssessment(prev => ({ ...prev, rating: n })); }}
                    aria-label={`${n} estrelas`}
                    className="rounded-lg p-0.5">
                    <Star className={`h-8 w-8 transition-all hover:scale-110 sm:h-9 sm:w-9 ${(hovered || rating) >= n ? 'fill-amber-400 text-amber-400' : 'text-surface-200'}`} />

                  </button>)}
              </div>
              <p className="mt-2 h-5 text-xs font-semibold text-amber-600">{['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente!'][hovered || rating]}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <label className="font-bold text-surface-600">
                    Conte o que achou
                  </label>
                  <span className="text-surface-400">
                    {assessment.comment.length}/500
                  </span>
                </div>
                <textarea
                  value={assessment.comment}
                  onChange={e => setAssessment(prev => prev ? { ...prev, comment: e.target.value } : prev)}
                  maxLength={500}
                  rows={4}
                  placeholder="Qualidade, tamanho, entrega... sua opinião faz diferença."
                  className="w-full resize-none rounded-xl border-2 border-surface-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
              </div>
              <div>
                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold text-surface-600">
                      Fotos ou vídeo
                      <span className="font-normal text-surface-400">
                        (opcional)
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-surface-400">
                      Até 5 arquivos
                    </p>
                  </div>
                  <span className="text-[11px] text-surface-400">
                    {assessment.media.length}/5
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 xs:grid-cols-4 sm:grid-cols-5">
                  {assessment.media.map((item, index) =>
                    <div key={`${item.name}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-surface-100">
                      {item.type.startsWith('video/') ? <>
                        <video
                          src={item.url}
                          className="h-full w-full object-cover" />
                        <Play className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 fill-white text-white" />
                      </> :
                        <img
                          src={item.url}
                          alt="Prévia"
                          className="h-full w-full object-cover" />}
                      <button
                        onClick={() => {
                          setAssessment(prev => ({ ...prev, media: prev.media.filter((_, i) => i !== index) }));
                          setMediaFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>)}{assessment.media.length < 5 &&
                      <label className="flex aspect-square min-h-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-200 text-surface-400 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-500">
                        <UploadCloud className="h-6 w-6" />
                        <span className="mt-1 text-[10px] font-bold">
                          Adicionar
                        </span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple className="hidden"
                          onChange={addMedia} />
                      </label>}
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-50 p-3">
                <input
                  type="checkbox"
                  checked={assessment.recommend}
                  onChange={e => { setRecommend(e.target.checked); setAssessment(prev => ({ ...prev, recommend: e.target.checked })); }}
                  className="h-4 w-4 accent-orange-500" /><span
                    className="text-sm font-medium text-surface-700">Eu recomendo este produto</span>
              </label>
              {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">{error}</p>}
              <div className="flex flex-col-reverse gap-2 border-t border-surface-100 pt-4 min-[380px]:flex-row min-[380px]:gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-surface-100 px-4 py-3 text-sm font-bold text-surface-600 hover:bg-surface-200">
                  Agora não
                </button>
                <button
                  onClick={handleSaveAssessment}
                  disabled={saveAssessmentLoading}
                  className={`flex-[1.5] rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60 ${themeClass}`}>{saveAssessmentLoading ? 'Enviando...' : existing ? 'Salvar alterações' : 'Publicar avaliação'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
