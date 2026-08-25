import { CheckCircle2, Play, Star, ThumbsUp, X } from 'lucide-react';
import { ProductSaveOrder } from '../models/Product';
import { getSavedReviews, ProductReview } from './ProductReviewModal';
import { RatingResponse } from '../models/OrderSave';

interface Props {
  open: boolean;
  onClose: () => void;
  assessment?: RatingResponse;
}

export default function ProductReviewDetailsModal({ open, onClose, assessment }: Props) {
  if (!open || !assessment?.product) return null;

  const saved = getSavedReviews().find(review => review.orderId === assessment.id_Order && review.productId === assessment?.product?.id);

  const arquivos: string[] = assessment.media
    .split(';')
    .filter(x => x.trim() !== '');
  console.log("arquivos", arquivos)
  const image = `/Imagens/Produtos/${assessment?.product.imagens?.[0]?.url_Imagem || ''}`;

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-surface-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}>
      <div className="flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-strong sm:max-w-xl sm:rounded-[28px]"
        onClick={event => event.stopPropagation()}>
        <header className="flex shrink-0 items-center justify-between border-b border-surface-100 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400">
              Pedido #{assessment.numberOrder || assessment.id_Order}
            </p>
            <h2 className="truncate font-display text-lg font-bold text-surface-900">
              Sua avaliação
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-100 text-surface-500 hover:bg-surface-200">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
          <div className="flex items-center gap-3 rounded-2xl bg-surface-50 p-3">
            <img src={image}
              alt={assessment.product.name}
              className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="line-clamp-2 font-bold text-surface-900">
                {assessment.product.name}
              </p>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Compra verificada
              </span>
            </div>
          </div>

          <section className="mt-5 rounded-2xl border border-surface-100 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-1"
                aria-label={`${assessment.ranting} de 5 estrelas`}>
                {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-6 w-6 ${star <= assessment.ranting ? 'fill-amber-400 text-amber-400' : 'text-surface-200'}`} />)}
              </div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                Avaliação publicada
              </span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-surface-600">
              {assessment.comment}
            </p>
            {assessment.recommend &&
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-surface-500">
                <ThumbsUp className="h-4 w-4 text-green-600" /> Você recomenda este produto</div>}
          </section>
          {assessment.media.length > 0 && (
            <section className="mt-5">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-surface-500">
                Fotos e vídeos
              </h3>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {arquivos.map((media, index) => {
                  const isVideo = /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(media);

                  return (
                    <div
                      key={`${media}-${index}`}
                      className=" relative aspect-square overflow-hidden rounded-2xl border border-surface-100 bg-surface-100 shadow-sm"
                    >
                      {isVideo ? (
                        <video
                          src={`/Imagens/Avaliacoes/${media}`}
                          controls
                          playsInline
                          preload="metadata"
                          className=" h-full w-full bg-black object-contain"
                        />
                      ) : (
                        <img
                          src={`/Imagens/Avaliacoes/${media}`}
                          alt={`Mídia da avaliação ${index + 1}`}
                          loading="lazy"
                          className=" h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-surface-900 px-5 py-3 text-sm font-bold text-white hover:bg-surface-800">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
