import { create } from "zustand";
import { makeResult, Result } from "../utils/Result";
import { Product, ProductAdmin } from "../models/Product";
import { ProductsService } from "../service/ProductsService";
import { ProductServiceAdmin } from "../adminService/ProductServiceAdmin";
import { UserServiceAdmin, UsersPageQuery } from "../adminService/UserServiceAdmin";
import { DEFAULT_PAGE_SIZE, UsersSummary } from "../models/Paged";

let usersRequest = 0;
import { UseUserStore } from "../store/UseUserStore";
import { UserService } from "../service/UserService";
import { AdminCreateUser, BaseSiteInterface, UserAdminAll } from "../models/User";
import { TaxasBases } from "../models/SiteBases";
import { Address } from "../models/Address";
import { GeneralOrderInformation } from "../models/Order";




interface UsertState {
    PostEditeUserAdmin: (formData: FormData) => Promise<Result<boolean>>;
    PostEditeTemaAdmin: () => Promise<Result<boolean>>;
    getBaseSiteAdmin: () => Promise<Result<BaseSiteInterface>>;
    PostUpdateInfoSiteStore: (infoSite: FormData) => Promise<Result<boolean>>;
    PostUpdateTaxasBasesStore: (Taxas: TaxasBases) => Promise<Result<boolean>>;
    PostUpdateDesactiv: (IdUser: number, role: string) => Promise<Result<string>>;
    GetUserAnddresAll: (IdUser: number) => Promise<Result<Address[]>>;
    GetUserInfoOrdersAll: (IdUser: number) => Promise<Result<GeneralOrderInformation>>;
    DeleteUserSelected: (IdUser: number, role: string, reason: string) => Promise<Result<boolean>>;
    getUser: () => Promise<Result<boolean>>;
    CreateUser: (user: AdminCreateUser) => Promise<Result<string>>;
    BaseSiteInterface: BaseSiteInterface;
    /** Usuários da página atual (filtros aplicados no servidor antes de paginar). */
    UserAllAdmin: UserAdminAll[];

    // Paginação no servidor
    usersTotal: number;
    usersActiveCount: number;
    usersInactiveCount: number;
    usersLoading: boolean;
    usersQuery: UsersPageQuery;
    usersSummary: UsersSummary;
    SetUsersQuery: (query: Partial<UsersPageQuery>) => Promise<Result<boolean>>;
    LoadUsersPage: () => Promise<Result<boolean>>;
    LoadUsersSummary: () => Promise<Result<boolean>>;
}
export const UseUserAdminStore = create<UsertState>((set, get) => ({
    BaseSiteInterface: {},
    UserAllAdmin: [],
    usersTotal: 0,
    usersActiveCount: 0,
    usersInactiveCount: 0,
    usersLoading: false,
    usersQuery: { page: 1, pageSize: DEFAULT_PAGE_SIZE, search: '', role: 'ALL', status: 'all' },
    usersSummary: { total: 0, active: 0, inactive: 0, admins: 0, clients: 0, delivery: 0 },

    SetUsersQuery: async (query) => {
        set({ usersQuery: { ...get().usersQuery, ...query } });
        return get().LoadUsersPage();
    },

    LoadUsersPage: async () => {
        const request = ++usersRequest;
        set({ usersLoading: true });

        const result = await UserServiceAdmin.GetUsersPaged(get().usersQuery);
        if (request !== usersRequest) return makeResult(true, true);

        set({ usersLoading: false });

        if (!result.success || !result.data) {
            set({ UserAllAdmin: [], usersTotal: 0, usersActiveCount: 0, usersInactiveCount: 0 });
            return makeResult(false, false, result.error);
        }

        // Página além do fim (ex.: depois de excluir): volta para a última que existe
        const lastPage = Math.max(1, Math.ceil(result.data.totalCount / get().usersQuery.pageSize));
        if (result.data.items.length === 0 && get().usersQuery.page > lastPage) {
            set({ usersQuery: { ...get().usersQuery, page: lastPage } });
            return get().LoadUsersPage();
        }

        set({
            UserAllAdmin: result.data.items,
            usersTotal: result.data.totalCount,
            usersActiveCount: result.data.activeCount,
            usersInactiveCount: result.data.inactiveCount,
        });
        return makeResult(true, true);
    },

    LoadUsersSummary: async () => {
        const result = await UserServiceAdmin.GetUsersSummary();
        if (!result.success || !result.data) return makeResult(false, false, result.error);
        set({ usersSummary: result.data });
        return makeResult(true, true);
    },

    CreateUser: async (user: AdminCreateUser): Promise<Result<string>> => {
        const result = await UserServiceAdmin.CreateUser(user);

        if (!result.success) {
            return makeResult(false, '', result.error);
        }

        // Atualiza a lista de usuários
        await get().getUser();
        return makeResult(true, result.data ?? '');
    },

    PostEditeUserAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        const result = await UserServiceAdmin.PostUpdateUserAdmin(formData);

        if (result.success) {
            const getUser = await UserService.getUser("ADMIN");

            if (getUser.success && getUser.data) {
                UseUserStore.getState().setUser(getUser.data);
            }

            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostEditeTemaAdmin: async (): Promise<Result<boolean>> => {
        const temaAtual = UseUserStore.getState().user?.customize?.tema ?? false;
        const novoTema = !temaAtual;
        const result = await UserServiceAdmin.PostUpdateTemaAdmin(novoTema);

        if (result.success) {
            const getUser = await UserService.getUser("ADMIN");

            if (getUser.success && getUser.data) {
                UseUserStore.getState().setUser(getUser.data);
            }

            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostUpdateInfoSiteStore: async (infoSite: FormData): Promise<Result<boolean>> => {
        const result = await UserServiceAdmin.PostUpdateInfoSite(infoSite);

        if (result.success) {
            get().getBaseSiteAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostUpdateTaxasBasesStore: async (Taxas: TaxasBases): Promise<Result<boolean>> => {
        const result = await UserServiceAdmin.PostUpdateTaxasBases(Taxas);

        if (result.success) {
            get().getBaseSiteAdmin();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    getBaseSiteAdmin: async (): Promise<Result<BaseSiteInterface>> => {
        const result = await UserServiceAdmin.getBaseSiteAdmin();

        if (result.success) {
            set({ BaseSiteInterface: result.data });
            return makeResult(true, {} as BaseSiteInterface);
        }
        return makeResult(false, {} as BaseSiteInterface, result.error);
    },
    // Recarrega a página atual e os números dos cards (uma consulta cada)
    getUser: async (): Promise<Result<boolean>> => {
        const [page, summary] = await Promise.all([get().LoadUsersPage(), get().LoadUsersSummary()]);
        return !page.success ? page : summary;
    },
    PostUpdateDesactiv: async (IdUser: number, role: string): Promise<Result<string>> => {
        const result = await UserServiceAdmin.postDasativUser(IdUser, role);

        if (result.success) {
            get().getUser();
            return makeResult(true, result.data);
        }
        return makeResult(false, '', result.error);
    },
    GetUserAnddresAll: async (IdUser: number): Promise<Result<Address[]>> => {
        const result = await UserServiceAdmin.GetAnddressUserAll(IdUser);
        // console.log('resultresult', result)
        if (result.success) {
            get().getUser();
            return makeResult(true, result.data);
        }
        return makeResult(false, [], result.error);
    },
    GetUserInfoOrdersAll: async (IdUser: number): Promise<Result<GeneralOrderInformation>> => {
        const result = await UserServiceAdmin.GetInforGeneralUserAll(IdUser);
        if (result.success) {
            get().getUser();
            return makeResult(true, result.data);
        }
        return makeResult(false, {}, result.error);
    },
    DeleteUserSelected: async (IdUser: number, role: string, reason: string): Promise<Result<boolean>> => {
        const result = await UserServiceAdmin.DeleteUserSelected(IdUser, role, reason);
        if (result.success) {
            get().getUser();
            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },

}));
