// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import { AppPage } from "../types";
// import { Result } from "../utils/Result";



// interface CheckoutState {
//     FindCoupon: (CodCupom: string) => Promise<Result<boolean>>;


// }

// export const UseCheckoutStore = create<CheckoutState>()(persist((set, get) => ({
//     FindCoupon: async (CodCupom: string) => {
      
//         const responseCupom = await UserService.saveColorGlobalService(NameColorGlobal, UserId);
//         if (responseTema.success) {
//             const colorConfig = getColorConfig(NameColorGlobal);
//             set({ NameColorGlobal: NameColorGlobal })
//             set({ ColorGlobalTema: colorConfig.class || "bg-brand-500" });
//             set({ ColorGlobalText: colorConfig.class_text || "text-brand-400" });
//             set({ ColorGlobalHover: colorConfig.class_hover || "hover:bg-brand-600" });
//             set({ ColorGlobalHoverText: colorConfig.class_group_hover_text || "group-hover:text-brand-600" });
//         }
//         if (!responseTema.success) {
//             set({ ColorGlobalTema: "bg-brand-600" });
//             return makeResult(false, false, "Erro ao carregar Cor Deixamos a cor padrão!");
//         }
//         return makeResult(true, true);
//     },

// }),
//     {
//         name: '@Checkout-storage',
//         partialize: (state) => ({

//         }),
//     }
// ));