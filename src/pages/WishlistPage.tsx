import { useEffect, useMemo } from 'react';
import { Heart, ArrowLeft, ShoppingCart, Trash2, Sparkles, Check, Tag } from 'lucide-react';
import { formatPrice, badgeColors, badgeLabels } from '../utils';
import { useNavigate } from 'react-router-dom';
import { UseCartStore } from '../store/UseCartStore';
import { UseRouteStore } from '../store/UseRouteStore';
import { UseProductStore } from '../store/UseProductStore';
import { UseOrderStore } from '../store/UseOrderStore';
import { useWishlistPageController } from '../controller/useWishlistPageController';

export default function WishlistPage() {
  const { favorites, products, loadProducts, DeleteOneFavorite } = UseProductStore();
  const { Category, LoadCategory } = UseOrderStore();
  const { navigateTo } = UseRouteStore();
  const navigate = useNavigate();
  const Controller = useWishlistPageController();

  const produtosFavoritos = useMemo(() => {
    return products.filter(produto =>
      favorites.some(
        favorito =>
          Number(favorito.id_Product) === Number(produto.id)
      )
    );
  }, [products, favorites]);

  const favoriteProducts = useMemo(() => {
    const categoryGroups = Category
      .map(category =>
        produtosFavoritos.filter(
          product =>
            Number(product.id_category) === Number(category.id)
        )
      )
      .filter(group => group.length > 0);

    const mixedProducts: typeof produtosFavoritos = [];

    let position = 0;

    while (
      categoryGroups.some(group => position < group.length)
    ) {
      categoryGroups.forEach(group => {
        if (group[position]) {
          mixedProducts.push(group[position]);
        }
      });

      position += 1;
    }

    produtosFavoritos.forEach(product => {
      const alreadyExists = mixedProducts.some(
        item => Number(item.id) === Number(product.id)
      );

      if (!alreadyExists) {
        mixedProducts.push(product);
      }
    });

    return mixedProducts.slice(0, 10);
  }, [Category, produtosFavoritos]);

  const favoriteCategories = useMemo(() => {
    const sections = Category
      .map(category => ({
        id: category.id,
        name: category.category,
        products: favoriteProducts.filter(
          product =>
            Number(product.id_category) === Number(category.id)
        ),
      }))
      .filter(section => section.products.length > 0);

    const categorizedIds = new Set(
      sections.flatMap(section =>
        section.products.map(product => product.id)
      )
    );

    const uncategorized = favoriteProducts.filter(
      product => !categorizedIds.has(product.id)
    );

    if (uncategorized.length > 0) {
      sections.push({
        id: -1,
        name: 'Outros',
        products: uncategorized,
      });
    }

    return sections;
  }, [Category, favoriteProducts]);

  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }

    if (Category.length === 0) {
      LoadCategory();
    }
  }, [
    products.length,
    Category.length,
    loadProducts,
    LoadCategory,
  ]);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="bg-white border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            </div>

            <div>
              <h1 className="font-display font-bold text-surface-900 text-xl">
                Lista de Desejos
              </h1>

              <p className="text-surface-400 text-xs">
                {favoriteProducts.length}{' '}
                {favoriteProducts.length === 1 ? 'item' : 'itens'} salvos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-6 sm:px-4 sm:py-8">
        {favoriteProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-5">
              <Heart className="w-10 h-10 text-red-300" />
            </div>

            <h3 className="font-display font-bold text-surface-700 text-xl mb-2">
              Sua lista está vazia
            </h3>

            <p className="text-surface-400 font-body text-sm mb-6">
              Salve produtos que você gosta para comprar depois!
            </p>

            <button
              onClick={() => navigateTo('home')}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-display font-bold rounded-xl transition-all shadow-brand"
            >
              Explorar Produtos
            </button>
          </div>
        ) : (
          <div className="space-y-7 sm:space-y-10">
            {favoriteCategories.map(category => (
              <section key={category.id}>
                <div className="mb-3 flex items-center gap-2.5 sm:mb-4 sm:gap-3">
                  <div className="h-8 w-1.5 rounded-full bg-brand-500" />

                  <div>
                    <h2 className="font-display text-base font-bold text-surface-900 sm:text-lg">
                      {category.name}
                    </h2>

                    <p className="text-xs text-surface-400">
                      {category.products.length}{' '}
                      {category.products.length === 1
                        ? 'produto favorito'
                        : 'produtos favoritos'}
                    </p>
                  </div>
                </div>

                <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 lg:grid-cols-4">
                  {category.products.map(item => {
                    const disc = item.origin_Price
                      ? Math.round(
                        ((item.origin_Price - item.price_Unic) /
                          item.origin_Price) *
                        100
                      )
                      : 0;

                    return (
                      <div
                        key={item.id}
                        className="group relative w-[60vw] min-w-[180px] max-w-[260px] shrink-0 snap-start overflow-hidden rounded-[20px] border border-white bg-white shadow-[0_6px_22px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,23,42,0.13)] sm:w-auto sm:max-w-none sm:min-w-0 sm:rounded-[24px] sm:shadow-[0_8px_30px_rgba(15,23,42,0.07)] sm:hover:shadow-[0_18px_45px_rgba(15,23,42,0.13)]"
                      >
                        <div
                          className="relative aspect-[1/1.03] cursor-pointer overflow-hidden bg-gradient-to-br from-surface-50 via-white to-surface-100"
                          onClick={() =>
                            navigateTo('product', item.id)
                          }
                        >
                          <img
                            src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem ?? ''}`}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                            loading="lazy"
                          />

                          {item.badge && (
                            <span
                              className={`absolute left-3 top-3 flex max-w-[65%] items-center gap-1 truncate rounded-full px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-lg sm:text-[10px] ${badgeColors[item.badge]}`}
                            >
                              <Sparkles className="h-3 w-3 shrink-0" />
                              {badgeLabels[item.badge]}
                            </span>
                          )}

                          {disc > 0 && (
                            <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-2.5 py-1.5 text-[10px] font-extrabold text-white shadow-lg">
                              -{disc}%
                            </span>
                          )}
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>

                        <div className="relative p-3.5 sm:p-5">
                          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50"><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>
                            Disponível para compra
                          </div>
                          <p className="mb-3 min-h-[40px] line-clamp-2 font-display text-[13px] font-semibold leading-[1.35] text-surface-800 sm:min-h-[44px] sm:text-[15px] sm:leading-[1.45]">
                            {item.name}
                          </p>

                          <div className="mb-3 flex min-h-[42px] items-end justify-between gap-2 sm:mb-4 sm:min-h-[46px]">
                            <div>
                              {item.origin_Price && (
                                <p className="mb-0.5 text-[11px] text-surface-400 line-through">
                                  {formatPrice(item.origin_Price)}
                                </p>
                              )}

                              <p className="font-display text-[17px] font-semibold leading-none tracking-tight text-surface-950 sm:text-2xl">
                                {formatPrice(item.price_Unic)}
                              </p>
                            </div>
                            {disc > 0 && (
                              <div className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><Tag className="h-3 w-3" />Economize</div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/product/${item.id}`)}
                              className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-2 py-2.5 text-[11px] font-extrabold text-white shadow-[0_6px_16px_rgba(249,115,22,0.25)] transition-all hover:bg-brand-600 hover:shadow-[0_8px_20px_rgba(249,115,22,0.35)] active:scale-[0.98] sm:gap-2 sm:px-3 sm:py-3 sm:text-sm"
                            >
                              <ShoppingCart className="h-3.5 w-3.5 shrink-0" />

                              <span className="truncate">
                                Comprar
                              </span>
                            </button>

                            <button
                              onClick={async () => {
                                Controller.action.setLoading(true);

                                await DeleteOneFavorite(item.id || 0);

                                Controller.action.setLoading(false);
                              }}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-500 transition-all hover:border-rose-200 hover:bg-rose-100 active:scale-95 sm:h-11 sm:w-11"
                              title="Remover dos favoritos"
                              aria-label={`Remover ${item.name} dos favoritos`}
                            >
                              {Controller.result.Loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-surface-100 pt-3 text-[10px] font-medium text-surface-400">
                            <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />
                            Produto salvo na sua lista
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
