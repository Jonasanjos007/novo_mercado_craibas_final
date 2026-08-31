import { CheckCircle2, Cloud, Play, Star, ThumbsUp, X } from 'lucide-react';
import { ProductSaveOrder } from '../models/Product';
import { RatingResponse } from '../models/OrderSave';
import { UseUserStore } from '../store/UseUserStore';
import { useEffect, useState } from 'react';
import ProductReviewModal, { ProductReview } from './ProductReviewModal';

interface Props {
  open: boolean;
  onClose: () => void;
  assessment?: RatingResponse;
  onCloseEdite?: () => void;
}

export default function ProductReviewDetailsModal({
  open,
  onClose,
  assessment,
  onCloseEdite
}: Props) {
  console.log('assessment', assessment)
  const { ColorGlobalTema, ColorGlobalHover } = UseUserStore();

  const [piscarNuvem, setPiscarNuvem] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(false);
  const [assessmentEdite, setAssessmentEdite] = useState<ProductReview>({
    orderId: 0,
    productId: 0,
    rating: 0,
    comment: "",
    media: [],
    recommend: false,
  });


  const podeEditar =
    !!assessment?.insertDate &&
    new Date() <= new Date(
      new Date(assessment.insertDate).setDate(
        new Date(assessment.insertDate).getDate() + 2
      )
    );
  const productSaveOrder: ProductSaveOrder | null =
    assessment?.product?.id !== undefined
      ? {
        id: assessment.product.id ?? 0,
        name: assessment.product.name,
        price_Unic: assessment.product.price_Unic,
        imagens: assessment.product.imagens,
        freeShipping: assessment.product.freeShipping,
        origin_Price: assessment.product.origin_Price,
        badge: assessment.product.badge,
        id_category: assessment.product.id_category,
        valorDicont: assessment.product.valorDicont,
        quantity: 1,
      }
      : null;
  useEffect(() => {
    if (!podeEditar) {
      setPiscarNuvem(false);
      return;
    }

    const intervalo = setInterval(() => {
      setPiscarNuvem(true);

      setTimeout(() => {
        setPiscarNuvem(false);
      }, 300);
    }, 2000);

    return () => clearInterval(intervalo);
  }, [podeEditar]);

  if (!open || !assessment?.product) return null;

  const arquivos: string[] = assessment.media
    .split(';')
    .filter(x => x.trim() !== '');

  const image = `/Imagens/Produtos/${assessment.product.imagens?.[0]?.url_Imagem || ''}`;
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

          <div className="mt-6 flex gap-3">
            {podeEditar && (
              <div className="relative flex-1">
                <div
                  className={`absolute bottom-full left-[100%] -translate-x-1/2 mb-2 z-10
        transition-all duration-300
        ${piscarNuvem
                      ? 'opacity-30 scale-105'
                      : 'opacity-100 scale-100'
                    }`}
                >
                  <div className="relative flex items-center gap-2 rounded-xl bg-white border border-sky-100 shadow-md px-4 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap">

                    <Cloud className="w-4 h-4 text-sky-500" />

                    <span>
                      Você tem apenas{" "}
                      <strong className="text-sky-600">2 dias</strong>{" "}
                      para editar após o salvamento.
                    </span>

                    <div
                      className="absolute left-1/2 top-full -translate-x-1/2 -mt-1
                     w-2.5 h-2.5 rotate-45
                     bg-white border-r border-b border-sky-100"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setReviewTarget(true);
                    setAssessmentEdite({
                      comment: assessment.comment,
                      rating: assessment.ranting,
                      mediaEdite: assessment.media,
                      recommend: assessment.recommend,
                      orderId: assessment.id_Order,
                      productId: assessment?.id_Product
                    });
                  }}
                  type="button"
                  className={`w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-all active:scale-[0.98] ${ColorGlobalTema} ${ColorGlobalHover}`}
                >
                  Editar
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-surface-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-surface-800 active:scale-[0.98]"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
      <ProductReviewModal
        open={!!reviewTarget}
        onClose={() => setReviewTarget(false)}
        product={productSaveOrder}
        orderId={assessment?.id_Order || 0}
        orderNumber={assessment.numberOrder}
        themeClass={`${ColorGlobalTema} hover:opacity-90`}
        IsEdite={assessmentEdite}
        onCloseEdite={onCloseEdite}

      />
    </div>
  );

}
