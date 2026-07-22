import { useEffect, useState } from "react";
import { useStore } from "../context/store";
import { Address } from "../models/Address";
import { useNotification } from "../utils/NotificationCard";
import { AddressService } from "../service/AddressService";
import { UseAddressStore } from "../store/UseAddressStore";
import { UseUserStore } from "../store/UseUserStore";
import { UseCartStore } from "../store/UseCartStore";
import { UseProductStore } from "../store/UseProductStore";
import { UseOrderStore } from "../store/UseOrderStore";
import { UseOrderAdminStore } from "../storeAdmin/UseOrderAdminStore";
import { UseProductAdminStore } from "../storeAdmin/UseProductAdminStore";
import { Imagens_Products, Product, ProductAdmin, ProductVariation } from "../models/Product";
import { Cupom, CupomAdmin, UpdateCouponRequest } from "../models/Cupom";
import { UseCupomAdminStore } from "../storeAdmin/UseCupomAdminStore";

type AdminControllerReturn = {
    result: {
        Loading: boolean;
        LoadingPageAll: boolean;
        totalRevenue: number;
        currentMonthOrdersCount: number;
        newProduct: Partial<ProductAdmin>;
        variantErrors: Record<string, string>;
        errors: Record<string, string>;
        cuponsErrors: Record<string, string>;
        modalStep: number;
        lightboxImage: Imagens_Products | null;
        showProductModal: boolean;
        editingProduct: Product | null;
        removedImages: number[];
        removedVariants: number[];
        SaveEditeLoading: boolean;
        TitleCOnfirm: string;
        DescriptionConfirm: string;
        ButtonConfirm: string;
        showDeleteModal: boolean;
        newCoupon: Partial<CupomAdmin>;
        showCouponModal: boolean;
        editingCoupon: boolean;
        showDeleteModalCupom: boolean;
        showCouponModalActive: boolean;

    };
    action: {
        //States
        setNewProduct: React.Dispatch<React.SetStateAction<Partial<ProductAdmin>>>;
        setVariantErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
        setShowProductModal: React.Dispatch<React.SetStateAction<boolean>>;
        setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
        setSaveEditeLoading: React.Dispatch<React.SetStateAction<boolean>>;
        setshowDeleteModalCupom: React.Dispatch<React.SetStateAction<boolean>>;
        setShowCouponModalActive: React.Dispatch<React.SetStateAction<boolean>>;


        setShowCouponModal: React.Dispatch<React.SetStateAction<boolean>>;
        setEditingCoupon: React.Dispatch<React.SetStateAction<boolean>>;
        SetTitleCOnfirm: React.Dispatch<React.SetStateAction<string>>;
        SetButtonConfirm: React.Dispatch<React.SetStateAction<string>>;
        SetDescriptionConfirm: React.Dispatch<React.SetStateAction<string>>;
        setEditingProduct: React.Dispatch<React.SetStateAction<ProductAdmin | null>>;
        setRemovedImages: React.Dispatch<React.SetStateAction<number[]>>;
        setRemovedVariants: React.Dispatch<React.SetStateAction<number[]>>;
        setOriginalCategories: React.Dispatch<React.SetStateAction<number[]>>;
        setOriginalProducts: React.Dispatch<React.SetStateAction<number[]>>;


        setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
        setLightboxImage: React.Dispatch<React.SetStateAction<Imagens_Products | null>>;
        setNewCoupon: React.Dispatch<React.SetStateAction<Partial<CupomAdmin>>>;
        setModalStep: React.Dispatch<React.SetStateAction<1 | 2>>;

        //Metodos
        handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
        removeImage: (index: number) => void;
        addVariant: () => void;
        updateVariant: (id: number, patch: Partial<ProductVariation>) => void;
        removeVariant: (id: number) => void;
        handleSaveProduct: () => void;
        handleDeleteProduct: () => void;
        handleEditeProduct: () => void;
        generateMonthlyRevenue: () => { month: string; year: number; monthIndex: number; total: number; percentage: number; difference: number; }[];
        generateMonthlyOrders: () => { month: string; year: number; monthIndex: number; total: number; percentage: number; difference: number; }[];
        generateMonthlyLogs: () => { month: string; year: number; monthIndex: number; total: number; percentage: number; difference: number; }[];
        generateLast7DaysOrders: () => { day: string; date: Date; quantity: number; total: number; percentage: number, difference: number; }[];
        generateLast7DaysOrdersCancelado: () => { day: string; date: Date; quantity: number; total: number; percentage: number, difference: number; }[];
        generateCurrentMonthOrderDonut: () => { value: number; color: string; label: string }[];
        handleSaveCoupon: () => void;
        handleUpdateCoupon: () => void;
        UpdateStatusOrder: (id: number, status: string) => void;
        handleDeleteCoupon: (IdCupom: number) => void;
        handleUpdateActiveCoupon: (IdCupom: number) => void;
        handleNext: () => void;
    }
} | null;
type MonthlyRevenue = {
    month: string;
    year: number;
    monthIndex: number;
    total: number;
    percentage: number;
    difference: number;
};
export interface Imagens_ProductsInterface {
    id: number;
    id_Product: number;
    url_Imagem: string;
    file?: File;
}

export const useAdminController = (): AdminControllerReturn => {
    const { LoadOrdersAdmin, LoadLogsAdmin, LoadCategoryAdmin, UpdateNewStatusOrder } = UseOrderAdminStore();
    const { loadProductsAdmin, products, PostSaveProductAdmin, PostEditeProductAdmin, DeleteProductId } = UseProductAdminStore();
    const { PostSaveCupomStore, LoadcuponsAdmin, PostUpdateCupomStore, DeleteCupomStore, PostUpdateActiveCupomStore, cupom } = UseCupomAdminStore();
    console.log("Cupons", cupom)
    const { ordersAdmin, logs, Category } = UseOrderAdminStore();
    const { user } = UseUserStore();
    const { LoadOrders } = UseOrderStore();
    const notify = useNotification();
    const [Loading, SetLoading] = useState(false);
    const [LoadingPageAll, SetLoadingPageAll] = useState(false);

    const [TitleCOnfirm, SetTitleCOnfirm] = useState<string>('');
    const [DescriptionConfirm, SetDescriptionConfirm] = useState<string>('');
    const [ButtonConfirm, SetButtonConfirm] = useState<string>('');



    const [newProduct, setNewProduct] = useState<Partial<ProductAdmin>>({});
    console.log("newProduct", newProduct)
    const [ProductDeleteId, setProductDeleteId] = useState<number>();

    const [variantErrors, setVariantErrors] = useState<Record<string, string>>({});
    const [cuponsErrors, setCuponsErrors] = useState<Record<string, string>>({});
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [showCouponModalActive, setShowCouponModalActive] = useState(false);


    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showProductModal, setShowProductModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [SaveEditeLoading, setSaveEditeLoading] = useState(false);
    const [showDeleteModalCupom, setshowDeleteModalCupom] = useState(false);

    const [modalStep, setModalStep] = useState<1 | 2>(1);
    const [editingProduct, setEditingProduct] = useState<ProductAdmin | null>(null);
    const [removedImages, setRemovedImages] = useState<number[]>([]);
    const [removedVariants, setRemovedVariants] = useState<number[]>([]);
    const [lightboxImage, setLightboxImage] = useState<Imagens_Products | null>(null);
    const [editingCoupon, setEditingCoupon] = useState(false);
    const [originalProducts, setOriginalProducts] = useState<number[]>([]);
    const [originalCategories, setOriginalCategories] = useState<number[]>([]);
    console.log("controller", editingCoupon)
    const emptyCoupon: Partial<CupomAdmin> = {
        name_Cupom: '',
        cod_Cupom: '',
        description: '',
        discount: 0,
        discount_Type: 0,
        active: true,
        minimum_Value: null,
        maximum_Discount: null,
        quantity_Uses: null,
        quantity_Used: 0,
        per_User_Limit: null,
        first_Order_Only: false,
        date_Start: null,
        application: "",
        date_End: null,
        productIds: [],
        categoryIds: [],
    };


    const [newCoupon, setNewCoupon] = useState<Partial<CupomAdmin>>(emptyCoupon);



    useEffect(() => {
        const load = async () => {
            SetLoadingPageAll(true);
            await GetListProducts();
            await GetListOrders();
            await GetListLogs();
            await GetListCategory();
            await GetListCupons();
            SetLoadingPageAll(false);
        };
        load();
    }, []);
    console.log("newCoupon", newCoupon);

    const GetListProducts = async () => {
        const result = await loadProductsAdmin();
        // SetLoading(false);
        if (!result?.success) {
            notify.error(result?.error?.error.message || "Erro ao carregar produtos", "error");
        }
    };
    const GetListCupons = async () => {
        const result = await LoadcuponsAdmin();
        // SetLoading(false);
        console.log("ListCupons", result)
        if (!result?.success) {
            notify.error((result?.error?.error?.code ?? "error"), (result?.error?.error.message || "Erro ao carregar pedidos"));

        }
    };
    const GetListOrders = async () => {
        const result = await LoadOrdersAdmin();
        console.log("result.data", result.data);
        if (!result?.success) {
            notify.error((result.error?.error.code ?? "error"), (result?.error?.error.message || "Erro ao carregar pedidos"));
        }
    };
    const GetListLogs = async () => {
        const result = await LoadLogsAdmin();
        console.log("result.data", result.data);
        if (!result?.success) {
            notify.error((result.error?.error.code ?? "error"), (result?.error?.error.message || "Erro ao carregar logs"));
        }
    };
    const GetListCategory = async () => {
        const result = await LoadCategoryAdmin();
        console.log("result.data", result.data);
        if (!result?.success) {
            notify.error((result.error?.error.code ?? "error"), (result?.error?.error.message || "Erro ao carregar Categoria"));
        }
    };
    const now = new Date();

    const totalRevenue = ordersAdmin.filter(o => {
        if (o.order_Status === 'CANCELADO') return false;
        const orderDate = new Date(o.insertDate);
        return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
        );
    })
        .reduce((s, o) => s + o.total_Value_Order, 0);

    const currentMonthOrdersCount = ordersAdmin.filter(o => {
        if (o.order_Status === 'CANCELADO') return false;

        const orderDate = new Date(o.insertDate);

        return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
        );
    }).length;


    const generateMonthlyRevenue = () => {
        const now = new Date();

        const monthlyRevenue: MonthlyRevenue[] = [];

        // Cria os últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

            monthlyRevenue.push({
                month: date.toLocaleString("pt-BR", { month: "short" }),
                year: date.getFullYear(),
                monthIndex: date.getMonth(),
                total: 0,
                percentage: 0,
                difference: 0,
            });
        }

        // Soma o faturamento
        ordersAdmin
            .filter(o => o.order_Status !== "CANCELADO")
            .forEach(o => {
                const orderDate = new Date(o.insertDate);

                const item = monthlyRevenue.find(m =>
                    m.year === orderDate.getFullYear() &&
                    m.monthIndex === orderDate.getMonth()
                );

                if (item) {
                    item.total += o.total_Value_Order;
                }
            });

        // Calcula crescimento
        monthlyRevenue.forEach((item, index) => {
            if (index === 0) return;

            const previous = monthlyRevenue[index - 1];

            item.difference = item.total - previous.total;

            if (previous.total === 0) {
                item.percentage = item.total > 0 ? 100 : 0;
            } else {
                item.percentage = Number(
                    (((item.total - previous.total) / previous.total) * 100).toFixed(2)
                );
            }
        });

        return monthlyRevenue;
    }


    const generateMonthlyOrders = () => {
        const now = new Date();

        const monthlyOrders: MonthlyRevenue[] = [];

        // Cria os últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

            monthlyOrders.push({
                month: date.toLocaleString("pt-BR", { month: "short" }),
                year: date.getFullYear(),
                monthIndex: date.getMonth(),
                total: 0,
                percentage: 0,
                difference: 0,
            });
        }

        // Conta a quantidade de pedidos por mês
        ordersAdmin
            .filter(o => o.order_Status !== "CANCELADO")
            .forEach(o => {
                const orderDate = new Date(o.insertDate);

                const item = monthlyOrders.find(m =>
                    m.year === orderDate.getFullYear() &&
                    m.monthIndex === orderDate.getMonth()
                );

                if (item) {
                    item.total += 1;
                }
            });

        // Calcula crescimento
        monthlyOrders.forEach((item, index) => {
            if (index === 0) return;

            const previous = monthlyOrders[index - 1];

            item.difference = item.total - previous.total;

            if (previous.total === 0) {
                item.percentage = item.total > 0 ? 100 : 0;
            } else {
                item.percentage = Number(
                    (((item.total - previous.total) / previous.total) * 100).toFixed(2)
                );
            }
        });

        return monthlyOrders;
    };


    const generateMonthlyLogs = () => {
        const now = new Date();

        const monthlyLogs: MonthlyRevenue[] = [];

        // Cria os últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

            monthlyLogs.push({
                month: date.toLocaleString("pt-BR", { month: "short" }),
                year: date.getFullYear(),
                monthIndex: date.getMonth(),
                total: 0,
                percentage: 0,
                difference: 0,
            });
        }

        // Conta a quantidade de pedidos por mês
        logs.filter(l => l.tipo == "Acesso" && l.nivel == "CLIENTE")
            .forEach(l => {
                const logDate = new Date(l.insertDate);

                const item = monthlyLogs.find(m =>
                    m.year === logDate.getFullYear() &&
                    m.monthIndex === logDate.getMonth()
                );

                if (item) {
                    item.total += 1;
                }
            });

        // Calcula crescimento
        monthlyLogs.forEach((item, index) => {
            if (index === 0) return;

            const previous = monthlyLogs[index - 1];

            item.difference = item.total - previous.total;

            if (previous.total === 0) {
                item.percentage = item.total > 0 ? 100 : 0;
            } else {
                item.percentage = Number(
                    (((item.total - previous.total) / previous.total) * 100).toFixed(2)
                );
            }
        });

        return monthlyLogs;
    };

    const generateLast7DaysOrders = () => {
        const now = new Date();

        const dailyOrders: {
            day: string;
            date: Date;
            quantity: number;
            total: number;
            percentage: number;
            difference: number;
        }[] = [];

        // Últimos 7 dias (incluindo hoje)
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setHours(0, 0, 0, 0);
            date.setDate(now.getDate() - i);

            dailyOrders.push({
                day: date.toLocaleDateString("pt-BR", { weekday: "short" }),
                date,
                quantity: 0,
                total: 0,
                percentage: 0,
                difference: 0,
            });
        }

        // Agrupa os pedidos
        ordersAdmin
            .filter(o => o.order_Status !== "CANCELADO")
            .forEach(o => {
                const orderDate = new Date(o.insertDate);
                orderDate.setHours(0, 0, 0, 0);

                const item = dailyOrders.find(d =>
                    d.date.getTime() === orderDate.getTime()
                );

                if (item) {
                    item.quantity += 1;
                    item.total += Number(o.total_Value_Order ?? 0); // valor do pedido
                }
            });

        // Crescimento baseado na quantidade
        dailyOrders.forEach((item, index) => {
            if (index === 0) return;

            const previous = dailyOrders[index - 1];

            item.difference = item.quantity - previous.quantity;

            if (previous.quantity === 0) {
                item.percentage = item.quantity > 0 ? 100 : 0;
            } else {
                item.percentage = Number(
                    (((item.quantity - previous.quantity) / previous.quantity) * 100).toFixed(2)
                );
            }
        });

        return dailyOrders;
    };

    const generateLast7DaysOrdersCancelado = () => {
        const now = new Date();

        const dailyOrders: {
            day: string;
            date: Date;
            quantity: number;
            total: number;
            percentage: number;
            difference: number;
        }[] = [];

        // Últimos 7 dias (incluindo hoje)
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setHours(0, 0, 0, 0);
            date.setDate(now.getDate() - i);

            dailyOrders.push({
                day: date.toLocaleDateString("pt-BR", { weekday: "short" }),
                date,
                quantity: 0,
                total: 0,
                percentage: 0,
                difference: 0,
            });
        }

        // Agrupa os pedidos
        ordersAdmin
            .filter(o => o.order_Status == "CANCELADO")
            .forEach(o => {
                const orderDate = new Date(o.insertDate);
                orderDate.setHours(0, 0, 0, 0);

                const item = dailyOrders.find(d =>
                    d.date.getTime() === orderDate.getTime()
                );

                if (item) {
                    item.quantity += 1;
                    item.total += Number(o.total_Value_Order ?? 0); // valor do pedido
                }
            });

        // Crescimento baseado na quantidade
        dailyOrders.forEach((item, index) => {
            if (index === 0) return;

            const previous = dailyOrders[index - 1];

            item.difference = item.quantity - previous.quantity;

            if (previous.quantity === 0) {
                item.percentage = item.quantity > 0 ? 100 : 0;
            } else {
                item.percentage = Number(
                    (((item.quantity - previous.quantity) / previous.quantity) * 100).toFixed(2)
                );
            }
        });

        return dailyOrders;
    };

    const generateCurrentMonthOrderDonut = () => {
        const now = new Date();

        const currentMonthOrders = ordersAdmin.filter(order => {
            const orderDate = new Date(order.insertDate);

            return (
                orderDate.getFullYear() === now.getFullYear() &&
                orderDate.getMonth() === now.getMonth()
            );
        });

        const entregues = currentMonthOrders.filter(
            o => o.order_Status === "ENTREGUE"
        ).length;

        const preparando = currentMonthOrders.filter(
            o => o.order_Status === "PREPARANDO"
        ).length;

        const cancelados = currentMonthOrders.filter(
            o => o.order_Status === "CANCELADO"
        ).length;

        return [
            {
                value: entregues,
                color: "#22c55e",
                label: "Entregues",
            },
            {
                value: preparando,
                color: "#f97316",
                label: "Preparando",
            },
            {
                value: cancelados,
                color: "#ef4444",
                label: "Cancelados",
            },
        ];
    };

    const handleNext = () => {
        const validation: Record<string, string> = {};

        if (!newProduct.name?.trim())
            validation.name = "O nome do produto é obrigatório.";

        if (!newProduct.price_Unic || newProduct.price_Unic <= 0)
            validation.price_Unic = "Informe um preço válido.";

        if (!newProduct.origin_Price || newProduct.origin_Price <= 0)
            validation.origin_Price = "Informe o preço original.";

        if (newProduct.origin_Price && newProduct.price_Unic && newProduct.origin_Price < newProduct.price_Unic)
            validation.origin_Price =
                "O preço original deve ser maior ou igual ao preço.";

        if (
            newProduct.total_Stock === undefined ||
            newProduct.total_Stock < 0
        )
            validation.total_Stock = "Informe o estoque.";

        if (!newProduct.id_category)
            validation.id_category = "Selecione uma categoria.";

        if (!newProduct.tags?.trim())
            validation.tags = "Informe ao menos uma tag.";


        if (!newProduct.imagens?.length)
            validation.imagens = "Adicione pelo menos uma imagem.";

        if (!newProduct.badge)
            validation.badge = "Adicione pelo menos um Distintivo.";


        setErrors(validation);

        if (Object.keys(validation).length > 0)
            return;

        setModalStep(2);
    }
    const handleSaveProduct = async () => {
        setSaveEditeLoading(true);
        const errors: Record<string, string> = {};

        if (!newProduct.variations?.length) {
            errors["list"] = "Adicione pelo menos uma variante.";
        } else {
            newProduct.variations.forEach((variant, index) => {
                if (!variant.type?.trim()) {
                    errors[`${index}.type`] = "Informe o tipo.";
                }

                if (!variant.name?.trim()) {
                    errors[`${index}.name`] = "Informe o nome.";
                }

                if (!variant.value?.trim()) {
                    errors[`${index}.value`] = "Informe o valor.";
                }

                if (variant.stoke <= 0) {
                    errors[`${index}.stoke`] = "Informe um estoque válido.";
                }
            });
        }

        setVariantErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const formData = new FormData();

        // Dados do produto
        formData.append("Id", newProduct.id?.toString() ?? "");
        formData.append("Name", newProduct.name ?? "");
        formData.append("Description", newProduct.description ?? "");
        formData.append("Price_Unit", String(newProduct.price_Unic ?? 0));
        formData.append("Origin_Price", String(newProduct.origin_Price ?? 0));
        formData.append("Total_Stock", String(newProduct.total_Stock ?? 0));
        formData.append("Id_Category", String(newProduct.id_category ?? 0));
        formData.append("Badge", newProduct.badge ?? "");
        formData.append("Tags", newProduct.tags ?? "");
        formData.append("Installments", String(newProduct.installments ?? 1));
        formData.append("Featured", String(newProduct.featured ?? false));
        formData.append("FreeShipping", String(newProduct.freeShipping ?? false));
        formData.append("Ativo", String(newProduct.ativo ?? false));
        formData.append("ShowBanner", String(newProduct.showBanner ?? false));


        // Variações
        newProduct.variations?.forEach((v, index) => {
            formData.append(`Variants[${index}].Type`, v.type);
            formData.append(`Variants[${index}].Name`, v.name);
            formData.append(`Variants[${index}].Value`, v.value);
            formData.append(`Variants[${index}].Stoke`, String(v.stoke));
            formData.append(`Variants[${index}].Price_Modifier`, String(v.price_Modifier ?? 0));

        });
        // Imagens
        newProduct.imagens?.forEach((img, index) => {
            console.log(index, img);
            console.log(img.file);

            if (img.file) {
                formData.append("Imagens", img.file);
            }
        });

        // removedImages.forEach(id => {
        //     formData.append("RemovedImages", id.toString());
        // });

        // removedVariants.forEach(id => {
        //     formData.append("removedVariants", id.toString());
        // });

        console.log("formData", formData)
        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }
        const result = await PostSaveProductAdmin(formData);

        if (!result.success) {
            notify.error((result.error?.error.code ?? "error"), (result.error?.error.message || "Erro ao salvar produto"));
            return;
        }
        setSaveEditeLoading(false);
        setNewProduct({});
        setShowProductModal(false);
        setModalStep(1);
        notify.success("Produto salvo com sucesso!", "success");
    };


    const handleEditeProduct = async () => {
        const errors: Record<string, string> = {};
        setSaveEditeLoading(true);
        if (!newProduct.variations?.length) {
            errors["list"] = "Adicione pelo menos uma variante.";
        } else {
            newProduct.variations.forEach((variant, index) => {
                if (!variant.type?.trim()) {
                    errors[`${index}.type`] = "Informe o tipo.";
                }

                if (!variant.name?.trim()) {
                    errors[`${index}.name`] = "Informe o nome.";
                }

                if (!variant.value?.trim()) {
                    errors[`${index}.value`] = "Informe o valor.";
                }

                if (variant.stoke <= 0) {
                    errors[`${index}.stoke`] = "Informe um estoque válido.";
                }
            });
        }

        setVariantErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const formData = new FormData();

        // Dados do produto
        formData.append("Id", newProduct.id?.toString() ?? "");
        formData.append("Name", newProduct.name ?? "");
        formData.append("Description", newProduct.description ?? "");
        formData.append("Price_Unit", String(newProduct.price_Unic ?? 0));
        formData.append("Origin_Price", String(newProduct.origin_Price ?? 0));
        formData.append("Total_Stock", String(newProduct.total_Stock ?? 0));
        formData.append("Id_Category", String(newProduct.id_category ?? 0));
        formData.append("Badge", newProduct.badge ?? "");
        formData.append("Tags", newProduct.tags ?? "");
        formData.append("Installments", String(newProduct.installments ?? 1));
        formData.append("Featured", String(newProduct.featured ?? false));
        formData.append("FreeShipping", String(newProduct.freeShipping ?? false));
        formData.append("Ativo", String(newProduct.ativo ?? false));
        formData.append("ShowBanner", String(newProduct.showBanner ?? false));


        // Variações
        newProduct.variations?.forEach((v, index) => {
            formData.append(`Variants[${index}].Id`, String(v.id ?? 0));
            formData.append(`Variants[${index}].Id_Product`, String(newProduct.id));
            formData.append(`Variants[${index}].Type`, v.type);
            formData.append(`Variants[${index}].New`, String(v.new ?? false));
            formData.append(`Variants[${index}].Name`, v.name);
            formData.append(`Variants[${index}].Value`, v.value);
            formData.append(`Variants[${index}].Stoke`, String(v.stoke));
            formData.append(`Variants[${index}].Price_Modifier`, String(v.price_Modifier ?? 0));

        });
        // Imagens
        newProduct.imagens?.forEach((img, index) => {
            console.log(index, img);
            console.log(img.file);

            if (img.file) {
                formData.append("Imagens", img.file);
            }
        });

        removedImages.forEach(id => {
            formData.append("RemovedImages", id.toString());
        });

        removedVariants.forEach(id => {
            formData.append("removedVariants", id.toString());
        });

        console.log("formData", formData)
        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }
        const result = await PostEditeProductAdmin(formData);
        console.log("result", result)
        if (!result.success) {
            notify.error((result?.error?.error?.code ?? "error"), (result.error?.error.message || "Erro ao Editar produto"));
            return;
        }
        setSaveEditeLoading(false);
        setNewProduct({});
        setShowProductModal(false);
        setModalStep(1);
        notify.success("Produto Editado com sucesso!", "success");
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files) return;

        const novasImagens: Imagens_ProductsInterface[] = Array.from(files).map(file => ({
            id: 0,
            id_Product: 0,
            file,
            url_Imagem: URL.createObjectURL(file)
        }));

        setNewProduct(p => ({
            ...p,
            imagens: [
                ...(p.imagens || []),
                ...novasImagens
            ]
        }));

        e.target.value = "";
    };

    const removeImage = (index: number) => {
        setNewProduct(p => {
            const imagens = [...(p.imagens ?? [])];

            const image = imagens[index];

            // Se veio do banco, guarda o id para excluir
            if (editingProduct && image.id > 0) {
                setRemovedImages(old => [...new Set([...old, image.id])]);
            }

            // Se é imagem nova, libera o blob
            if (image.file && image.url_Imagem.startsWith("blob:")) {
                URL.revokeObjectURL(image.url_Imagem);
            }

            imagens.splice(index, 1);

            return {
                ...p,
                imagens
            };
        });

        setLightboxImage(null);
    };
    const addVariant = () => {
        setNewProduct((p) => ({
            ...p,
            variations: [
                ...(p.variations || []),
                {
                    id: Math.floor(Math.random() * 1000000000),
                    name: "",
                    value: "",
                    type: "",
                    stoke: 0,
                    price_Modifier: 0,
                    new: true
                },
            ],
        }));
    };

    const updateVariant = (id: number, patch: Partial<ProductVariation>) => {
        setNewProduct((p) => ({
            ...p,
            variations: (p.variations || []).map((v) =>
                v.id === id ? { ...v, ...patch } : v
            ),
        }));
    };

    const removeVariant = (id: number) => {
        setNewProduct((p) => ({
            ...p,
            variations: (p.variations || []).filter((v) => v.id !== id),
        }));

        if (editingProduct) {
            setRemovedVariants(old => [...new Set([...old, Number(id)])]);
        }

        console.log("testeid", id)
    };

    const handleDeleteProduct = async () => {

        SetLoading(true);

        const result = await DeleteProductId(newProduct.id ?? 0)
        if (!result.success) {
            notify.error((result?.error?.error?.code ?? "error"), (result.error?.error.message || "Erro ao Excluir produto"));
        }
        setShowDeleteModal(false);
        SetLoading(false);
        SetTitleCOnfirm("");
        SetDescriptionConfirm("");
        SetButtonConfirm("");
        notify.success("Produto Excluido com sucesso!", "success");
    };

    const UpdateStatusOrder = async (id: number, status: string) => {
        SetLoading(true);
        const result = await UpdateNewStatusOrder(id, status);

        if (!result.success) {
            notify.error((result?.error?.error?.code ?? "error"), (result.error?.error.message || "Erro ao atualizar status"));
            return;
        }
        SetLoading(false);
        notify.success("Status atualizado com sucesso!", "success");

    }
    const validateCoupon = (
        coupon: Partial<CupomAdmin>
    ): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (!coupon.name_Cupom?.trim())
            errors.name_Cupom = "Nome do cupom é obrigatório.";
        else if (coupon.name_Cupom.trim().length < 5)
            errors.name_Cupom = "O nome deve possuir pelo menos 5 caracteres.";

        if (!coupon.cod_Cupom?.trim())
            errors.cod_Cupom = "Código do cupom é obrigatório.";
        else if (coupon.cod_Cupom.trim().length < 5)
            errors.cod_Cupom = "O código deve possuir pelo menos 5 caracteres.";

        if (coupon.discount_Type == null)
            errors.discount_Type = "Tipo de desconto obrigatório.";
        if (coupon.discount_Type === 0 && (coupon.discount ?? 0) > 100)
            errors.discount = "Valor deve ser menor que 100.";

        if (coupon.discount_Type != null &&
            ![0, 1, 2].includes(coupon.discount_Type))
            errors.discount_Type = "Tipo de desconto inválido.";

        if (coupon.discount == null || coupon.discount <= 0)
            errors.discount = "Informe um desconto válido.";

        if (!coupon.description?.trim())
            errors.description = "Descrição obrigatória.";

        if (coupon.minimum_Value == null || coupon.minimum_Value <= 0)
            errors.minimum_Value = "Informe um valor mínimo.";

        if (!coupon.date_Start)
            errors.date_Start = "Informe a data inicial.";

        if (!coupon.date_End)
            errors.date_End = "Informe a data final.";

        if (
            coupon.date_Start &&
            coupon.date_End &&
            new Date(coupon.date_End) < new Date(coupon.date_Start)
        ) {
            errors.date_End = "A data final deve ser maior que a data inicial.";
        }

        switch (coupon.application) {
            case "categories":
                if (!coupon.categoryIds?.length)
                    errors.Application = "Selecione pelo menos uma categoria.";
                break;

            case "products":
                if (!coupon.productIds?.length)
                    errors.Application = "Selecione pelo menos um produto.";
                break;
        }

        return errors;
    };

    const handleSaveCoupon = async () => {
        try {
            SetLoading(true);

            const errors = validateCoupon(newCoupon);
            setCuponsErrors(errors);

            console.log("teste")

            if (Object.keys(errors).length) return;

            const payload: CupomAdmin = {
                ...(emptyCoupon as CupomAdmin),
                ...(newCoupon as CupomAdmin),
            };

            const result = await PostSaveCupomStore(payload);
            console.log(result)
            if (!result.success) {
                notify.error(result?.error?.error.code ?? "error", result?.error?.error.message ?? "Erro ao salvar cupom"
                );
                return;
            }

            notify.success("success", "Cupom cadastrado com sucesso!");

            setShowCouponModal(false);
            setNewCoupon({});
        } finally {
            SetLoading(false);
        }
    };

    const handleUpdateCoupon = async () => {
        try {
            SetLoading(true);

            const errors = validateCoupon(newCoupon);
            setCuponsErrors(errors);

            if (Object.keys(errors).length) return;

            const currentProducts =
                newCoupon.productIds?.map(x => x.id_Product) ?? [];

            const currentCategories =
                newCoupon.categoryIds?.map(x => x.id_Category) ?? [];

            const addedProducts =
                currentProducts.filter(x => !originalProducts.includes(x));

            const removedProducts =
                originalProducts.filter(x => !currentProducts.includes(x));

            const addedCategories =
                currentCategories.filter(x => !originalCategories.includes(x));

            const removedCategories =
                originalCategories.filter(x => !currentCategories.includes(x));

            const payload: UpdateCouponRequest = {
                ...(emptyCoupon as CupomAdmin),
                ...(newCoupon as CupomAdmin),

                addedProducts,
                removedProducts,
                addedCategories,
                removedCategories
            };
            console.log("payload", payload)
            const result = await PostUpdateCupomStore(payload);

            if (!result.success) {
                notify.error(result?.error?.error.code ?? "error", result?.error?.error.message ?? "Erro ao atualizar cupom"
                );
                return;
            }

            notify.success("success", "Cupom atualizado com sucesso!");

            setShowCouponModal(false);
            setNewCoupon({});
        } finally {
            SetLoading(false);
        }
    };
    const handleDeleteCoupon = async (IdCupom: number) => {
        try {

            SetLoading(true);

            if (IdCupom === 0) {
                notify.error("error", "Erro Nenum Id cupom selecionado!"
                );
                return;
            }

            const result = await DeleteCupomStore(IdCupom);

            if (!result.success) {
                notify.error(result?.error?.error.code ?? "error", result?.error?.error.message ?? "Erro ao atualizar cupom"
                );
                return;
            }

            notify.success("success", "Cupom Excluido com sucesso!");

            setShowCouponModal(false);
        } finally {
            SetLoading(false);
            setshowDeleteModalCupom(false);
        }
    };
    const handleUpdateActiveCoupon = async (IdCupom: number) => {
        try {
            SetLoading(true);

            if (IdCupom === 0) {
                notify.error("error", "Erro Nenum Id cupom selecionado!"
                );
                return;
            }

            const result = await PostUpdateActiveCupomStore(IdCupom);

            if (!result.success) {
                notify.error(result?.error?.error.code ?? "error", result?.error?.error.message ?? "Erro ao atualizar cupom"
                );
                return;
            }

            notify.success("success", "Cupom Atualizado com sucesso!");

        } finally {
            SetLoading(false);
            setShowCouponModalActive(false);
        }
    };
    return {
        result: {
            Loading,
            totalRevenue,
            currentMonthOrdersCount,
            newProduct,
            variantErrors,
            errors,
            modalStep,
            lightboxImage,
            showProductModal,
            removedImages,
            editingProduct,
            removedVariants,
            SaveEditeLoading,
            TitleCOnfirm,
            DescriptionConfirm,
            ButtonConfirm,
            showDeleteModal,
            LoadingPageAll,
            newCoupon,
            cuponsErrors,
            showCouponModal,
            editingCoupon,
            showDeleteModalCupom,
            showCouponModalActive
        },
        action: {
            generateMonthlyRevenue,
            generateMonthlyOrders,
            generateMonthlyLogs,
            generateLast7DaysOrders,
            generateCurrentMonthOrderDonut,
            generateLast7DaysOrdersCancelado,
            setNewProduct,
            setVariantErrors,
            setErrors,
            setModalStep,
            handleImageSelect,
            removeImage,
            addVariant,
            updateVariant,
            removeVariant,
            setLightboxImage,
            handleNext,
            handleSaveProduct,
            setShowProductModal,
            setRemovedImages,
            setEditingProduct,
            setRemovedVariants,
            handleEditeProduct,
            setSaveEditeLoading,
            SetButtonConfirm,
            SetDescriptionConfirm,
            SetTitleCOnfirm,
            setShowDeleteModal,
            handleDeleteProduct,
            UpdateStatusOrder,
            setNewCoupon,
            handleSaveCoupon,
            setShowCouponModal,
            setEditingCoupon,
            setOriginalProducts,
            setOriginalCategories,
            handleUpdateCoupon,
            handleDeleteCoupon,
            setshowDeleteModalCupom,
            setShowCouponModalActive,
            handleUpdateActiveCoupon
        }
    }
}


