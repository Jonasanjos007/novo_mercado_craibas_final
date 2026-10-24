using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;

using Microsoft.EntityFrameworkCore;
namespace Mercado.Craibas.Application.ServicesAdmin
{
    /// <summary>
    /// Lixeira do admin: listar, restaurar e excluir definitivamente.
    /// </summary>
    public class TrashServiceAdmin : ITrashServiceAdmin
    {
        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;

        public TrashServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
        }

        // ───────────────────────── LISTAR ─────────────────────────

        public async Task<Result<List<TrashItemResponse>>> GetTrashAsync()
        {
            var records = await _unitOfWorkAdmin.GetClassListAsyncWhere<DeletionRecords>(
                x => x.Status == DeletionRecordStatusEnum.Deleted);

            var parents = records
                .Where(x => x.ParentRecordId == null)
                .OrderByDescending(x => x.DeletedAt)
                .ToList();

            var childrenByParent = records
                .Where(x => x.ParentRecordId != null)
                .GroupBy(x => x.ParentRecordId!.Value)
                .ToDictionary(g => g.Key, g => g.ToList());

            var response = BuildItems(parents, childrenByParent, await LoadOwnersAsync(parents));

            return Result<List<TrashItemResponse>>.Success(response);
        }

        // ═════════════════════════ PAGINAÇÃO ═════════════════════════

        /// <summary>
        /// Lixeira paginada. Mesmas regras da tela:
        /// - tipo: USER, ADDRESS, PRODUCT, CATEGORY, COUPON, ORDER (pedido + item) ou OTHER (o resto);
        /// - busca: nome, dono (nome/e-mail/perfil), id, motivo, quem excluiu e os dados salvos;
        /// - ordem: excluídos mais recentes primeiro.
        /// Filtros aplicados antes de paginar.
        /// </summary>
        public async Task<Result<PagedResult<TrashItemResponse>>> GetTrashPagedAsync(int page, int pageSize, string? search, string? filter)
        {
            page = Paging.Page(page);
            pageSize = Paging.Size(pageSize);

            var query = ApplyTypeFilter(
                _unitOfWorkAdmin.Query<DeletionRecords>()
                    .AsNoTracking()
                    .Where(x => x.Status == DeletionRecordStatusEnum.Deleted && x.ParentRecordId == null),
                filter);

            var ordered = query.OrderByDescending(x => x.DeletedAt).ThenBy(x => x.Id);
            var term = search?.Trim().ToLowerInvariant();

            // Sem busca: pagina direto no banco
            if (string.IsNullOrEmpty(term))
            {
                var total = await query.CountAsync();
                var pageParents = await ordered.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

                var items = await BuildPageAsync(pageParents);
                return Result<PagedResult<TrashItemResponse>>.Success(new PagedResult<TrashItemResponse>(items, total, page, pageSize));
            }

            // Com busca: a busca olha os dados salvos (snapshot) do mesmo jeito que a tela fazia,
            // então o filtro de texto é aplicado aqui e só a página é enviada.
            var parents = await ordered.ToListAsync();
            var owners = await LoadOwnersAsync(parents);

            var matches = parents
                .Select(parent => new { Parent = parent, Item = Map(parent, owners) })
                .Where(x => MatchesSearch(x.Item, term))
                .Select(x => x.Parent)
                .ToList();

            var slice = matches.Skip((page - 1) * pageSize).Take(pageSize).ToList();
            var pageItems = await BuildPageAsync(slice, owners);

            return Result<PagedResult<TrashItemResponse>>.Success(new PagedResult<TrashItemResponse>(pageItems, matches.Count, page, pageSize));
        }

        /// <summary>Cards da Lixeira (sobre todos os itens excluídos).</summary>
        public async Task<Result<TrashSummaryResponse>> GetTrashSummaryAsync()
        {
            var types = await _unitOfWorkAdmin.Query<DeletionRecords>()
                .AsNoTracking()
                .Where(x => x.Status == DeletionRecordStatusEnum.Deleted && x.ParentRecordId == null)
                .Select(x => x.EntityType)
                .ToListAsync();

            return Result<TrashSummaryResponse>.Success(new TrashSummaryResponse
            {
                Total = types.Count,
                Users = types.Count(x => x == EntityTypeDelete.Users),
                Addresses = types.Count(x => x == EntityTypeDelete.Address),
                Orders = types.Count(x => x == EntityTypeDelete.Order || x == EntityTypeDelete.OrderItem)
            });
        }

        private static readonly EntityTypeDelete?[] MainTypes =
        {
            EntityTypeDelete.Users,
            EntityTypeDelete.Address,
            EntityTypeDelete.Product,
            EntityTypeDelete.Category,
            EntityTypeDelete.Coupon,
            EntityTypeDelete.Order,
            EntityTypeDelete.OrderItem
        };

        private static IQueryable<DeletionRecords> ApplyTypeFilter(IQueryable<DeletionRecords> query, string? filter) => filter switch
        {
            "USER" => query.Where(x => x.EntityType == EntityTypeDelete.Users),
            "ADDRESS" => query.Where(x => x.EntityType == EntityTypeDelete.Address),
            "PRODUCT" => query.Where(x => x.EntityType == EntityTypeDelete.Product),
            "CATEGORY" => query.Where(x => x.EntityType == EntityTypeDelete.Category),
            "COUPON" => query.Where(x => x.EntityType == EntityTypeDelete.Coupon),
            "ORDER" => query.Where(x => x.EntityType == EntityTypeDelete.Order || x.EntityType == EntityTypeDelete.OrderItem),
            "OTHER" => query.Where(x => x.EntityType == null || !MainTypes.Contains(x.EntityType)),
            _ => query
        };

        /// <summary>Mesma busca que a tela fazia (texto em minúsculas contido em algum campo).</summary>
        private static bool MatchesSearch(TrashItemResponse item, string term)
        {
            static bool Has(string? value, string t) => value != null && value.ToLowerInvariant().Contains(t);

            if (Has(item.EntityName, term) || Has(item.UserName, term) || Has(item.UserEmail, term) || Has(item.UserRole, term)
                || item.Id.ToString().Contains(term) || Has(item.Reason, term) || Has(item.DeletedByName, term))
                return true;

            if (item.Data == null)
                return false;

            var relaxed = new System.Text.Json.JsonSerializerOptions
            {
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            var dataText = string.Join(" ", item.Data.Values.Select(value => value.ValueKind switch
            {
                System.Text.Json.JsonValueKind.String => value.GetString() ?? string.Empty,
                System.Text.Json.JsonValueKind.Null or System.Text.Json.JsonValueKind.Undefined => string.Empty,
                System.Text.Json.JsonValueKind.True => "true",
                System.Text.Json.JsonValueKind.False => "false",
                System.Text.Json.JsonValueKind.Object or System.Text.Json.JsonValueKind.Array => System.Text.Json.JsonSerializer.Serialize(value, relaxed),
                _ => value.GetRawText()
            })).ToLowerInvariant();

            return dataText.Contains(term);
        }

        /// <summary>Monta os itens de uma página (com o que foi excluído junto).</summary>
        private async Task<List<TrashItemResponse>> BuildPageAsync(
            List<DeletionRecords> parents,
            Dictionary<(string Role, int Id), OwnerInfo>? owners = null)
        {
            if (parents.Count == 0)
                return new List<TrashItemResponse>();

            var parentIds = parents.Select(x => x.Id).ToList();

            var children = await _unitOfWorkAdmin.GetClassListAsyncWhere<DeletionRecords>(
                x => x.Status == DeletionRecordStatusEnum.Deleted && x.ParentRecordId != null && parentIds.Contains(x.ParentRecordId.Value));

            var childrenByParent = children
                .GroupBy(x => x.ParentRecordId!.Value)
                .ToDictionary(g => g.Key, g => g.ToList());

            owners ??= await LoadOwnersAsync(parents);

            return BuildItems(parents, childrenByParent, owners);
        }

        private static List<TrashItemResponse> BuildItems(
            List<DeletionRecords> parents,
            Dictionary<int, List<DeletionRecords>> childrenByParent,
            Dictionary<(string Role, int Id), OwnerInfo> owners)
        {
            return parents
                .Select(parent =>
                {
                    var children = childrenByParent.GetValueOrDefault(parent.Id) ?? new List<DeletionRecords>();
                    var item = Map(parent, owners);

                    item.Related = children
                        .GroupBy(c => RelatedKey(c.EntityType))
                        .ToDictionary(
                            g => g.Key,
                            g => g.Select(c => Map(c, owners, parent)).ToList());

                    item.Description = Describe(parent, children.Count, item.Data);

                    return item;
                })
                .ToList();
        }

        // ───────────────────────── RESTAURAR ─────────────────────────

        public async Task<Result<bool>> RestoreAsync(int recordId, int adminId)
        {
            var record = await _unitOfWorkAdmin.GetClassAsyncWhere<DeletionRecords>(x => x.Id == recordId);

            var check = ValidateActionable(record);
            if (check is not null) return Result<bool>.Failure(check);

            // Regras antes de restaurar
            var blocked = await CheckRestoreRulesAsync(record!);
            if (blocked is not null) return Result<bool>.Failure(blocked);

            var restored = await SetDeletedAsync(record!, deleted: false);

            if (!restored)
            {
                await UpdateRecordAsync(record!.Id, new Dictionary<string, object>
                {
                    { "Status", DeletionRecordStatusEnum.Failed },
                    { "UpdateDate", DateTime.UtcNow }
                });

                return Result<bool>.Failure(Error.NotFound("Lixeira", "O registro original não existe mais e não pode ser restaurado."));
            }

            var now = DateTime.UtcNow;

            // Restaura também tudo que foi excluído junto
            var children = await _unitOfWorkAdmin.GetClassListAsyncWhere<DeletionRecords>(
                x => x.ParentRecordId == record!.Id && x.Status == DeletionRecordStatusEnum.Deleted);

            foreach (var child in children)
            {
                var ok = await SetDeletedAsync(child, deleted: false);

                await UpdateRecordAsync(child.Id, new Dictionary<string, object>
                {
                    { "Status", ok ? DeletionRecordStatusEnum.Restored : DeletionRecordStatusEnum.Failed },
                    { "RestoredAt", now },
                    { "RestoredByUserId", adminId },
                    { "UpdateDate", now }
                });
            }

            await UpdateRecordAsync(record!.Id, new Dictionary<string, object>
            {
                { "Status", DeletionRecordStatusEnum.Restored },
                { "RestoredAt", now },
                { "RestoredByUserId", adminId },
                { "UpdateDate", now }
            });

            await LogAsync(adminId, record, "Restaurou da Lixeira",
                $"restaurou {TypeLabel(record.EntityType).ToLower()} '{record.DisplayName}' (ID: {record.EntityId})" +
                (children.Count > 0 ? $" e {children.Count} item(ns) excluído(s) junto" : string.Empty));

            return Result<bool>.Success(true);
        }

        // ───────────────────────── EXCLUIR DEFINITIVAMENTE ─────────────────────────

        public async Task<Result<bool>> PurgeAsync(int recordId, int adminId)
        {
            var record = await _unitOfWorkAdmin.GetClassAsyncWhere<DeletionRecords>(x => x.Id == recordId);

            var check = ValidateActionable(record);
            if (check is not null) return Result<bool>.Failure(check);

            var children = await _unitOfWorkAdmin.GetClassListAsyncWhere<DeletionRecords>(
                x => x.ParentRecordId == record!.Id && x.Status == DeletionRecordStatusEnum.Deleted);

            // Dados pessoais são anonimizados (LGPD). Pedidos e produtos continuam
            // no histórico, apenas não podem mais ser restaurados.
            await AnonymizeAsync(record!);

            foreach (var child in children)
            {
                await AnonymizeAsync(child);
            }

            var now = DateTime.UtcNow;

            foreach (var item in children.Append(record!))
            {
                var fields = new Dictionary<string, object>
                {
                    { "Status", DeletionRecordStatusEnum.Purged },
                    { "PurgedAt", now },
                    { "PurgedByUserId", adminId },
                    { "UpdateDate", now }
                };

                if (HasPersonalData(item))
                {
                    fields["Snapshot"] = null!;
                    fields["DisplayName"] = item.EntityType == EntityTypeDelete.Users ? "Usuário removido" : "Endereço removido";
                }

                await UpdateRecordAsync(item.Id, fields);
            }

            await LogAsync(adminId, record!, "Excluiu definitivamente da Lixeira",
                $"excluiu definitivamente {TypeLabel(record!.EntityType).ToLower()} (ID: {record.EntityId})" +
                (children.Count > 0 ? $" e {children.Count} item(ns) relacionado(s)" : string.Empty));

            return Result<bool>.Success(true);
        }

        // ───────────────────────── EM MASSA ─────────────────────────

        public async Task<Result<TrashBulkResponse>> BulkAsync(TrashBulkRequest request, int adminId)
        {
            var action = request.Action?.Trim().ToLowerInvariant();

            if (action is not "restore" and not "purge")
            {
                return Result<TrashBulkResponse>.Failure(Error.Validation("Lixeira", "Ação inválida."));
            }

            var response = new TrashBulkResponse();

            foreach (var id in request.Ids.Distinct())
            {
                var result = action == "restore"
                    ? await RestoreAsync(id, adminId)
                    : await PurgeAsync(id, adminId);

                if (result.IsSuccess)
                {
                    response.Succeeded++;
                }
                else
                {
                    response.Failed.Add(new TrashBulkFailure { Id = id, Message = result.Error.Message });
                }
            }

            return Result<TrashBulkResponse>.Success(response);
        }

        // ───────────────────────── REGRAS ─────────────────────────

        private static Error? ValidateActionable(DeletionRecords? record)
        {
            if (record is null)
                return Error.NotFound("Lixeira", "Item não encontrado na Lixeira.");

            if (record.Status != DeletionRecordStatusEnum.Deleted)
                return Error.Validation("Lixeira", "Este item não está mais na Lixeira.");

            if (record.ParentRecordId is not null)
                return Error.Validation("Lixeira", "Este item foi excluído junto com outro. Use o item principal.");

            return null;
        }

        private async Task<Error?> CheckRestoreRulesAsync(DeletionRecords record)
        {
            switch (record.EntityType)
            {
                case EntityTypeDelete.Users:
                {
                    var role = OwnerRoleOf(record);
                    var email = await GetUserEmailAsync(record.EntityId, role);

                    if (!string.IsNullOrWhiteSpace(email) && await EmailInUseAsync(email, record.EntityId, role))
                    {
                        return Error.Conflict("Lixeira", $"Já existe outra conta ativa com o e-mail {email}. Não é possível restaurar.");
                    }
                    break;
                }

                case EntityTypeDelete.Address:
                {
                    var ownerId = record.OwnerUserId ?? record.DeletedByUserId;
                    var owner = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Customer>(x => x.Id == ownerId);

                    if (owner is not null && owner.Isdelete == true)
                    {
                        return Error.Validation("Lixeira", "O cliente dono deste endereço está excluído. Restaure o cliente primeiro.");
                    }
                    break;
                }

                case EntityTypeDelete.Product:
                {
                    var product = await _unitOfWorkAdmin.GetClassAsyncWhere<Product>(x => x.Id == record.EntityId);

                    if (product is not null)
                    {
                        var category = await _unitOfWorkAdmin.GetClassAsyncWhere<Product_Category>(x => x.Id == product.Id_Category);

                        if (category is not null && category.Isdelete == true)
                        {
                            return Error.Validation("Lixeira", $"A categoria '{category.Category}' deste produto está excluída. Restaure a categoria primeiro.");
                        }
                    }
                    break;
                }
            }

            return null;
        }

        private async Task<bool> EmailInUseAsync(string email, int userId, string role)
        {
            var normalized = email.Trim().ToLower();

            var customer = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Customer>(
                x => x.Email.ToLower() == normalized && x.Isdelete != true && !(role == "CLIENTE" && x.Id == userId));
            if (customer is not null) return true;

            var admin = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(
                x => x.Email.ToLower() == normalized && x.Isdelete != true && !(role == "ADMIN" && x.Id == userId));
            if (admin is not null) return true;

            var delivery = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Delivery>(
                x => x.Email.ToLower() == normalized && x.Isdelete != true && !(role == "DELIVERY" && x.Id == userId));

            return delivery is not null;
        }

        // ───────────────────────── ALTERAR O DADO ORIGINAL ─────────────────────────

        /// <summary>Marca/desmarca o item original como excluído.</summary>
        private async Task<bool> SetDeletedAsync(DeletionRecords record, bool deleted)
        {
            var filter = new Dictionary<string, object> { { "Id", record.EntityId } };
            var fields = new Dictionary<string, object>
            {
                { "Isdelete", deleted },
                { "UpdateDate", DateTime.Now }
            };

            switch (record.EntityType)
            {
                case EntityTypeDelete.Users:
                    fields["Ativo"] = !deleted;
                    return OwnerRoleOf(record) switch
                    {
                        "ADMIN" => await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<User_Admin>(filter, fields),
                        "DELIVERY" => await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<User_Delivery>(filter, fields),
                        _ => await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<User_Customer>(filter, fields)
                    };

                case EntityTypeDelete.Product:
                    // Volta com o status (ativo/inativo) que tinha antes da exclusão
                    fields["Ativo"] = deleted ? false : SnapshotBool(record, "Ativo") ?? true;
                    return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Product>(filter, fields);

                case EntityTypeDelete.Category:
                    fields["Ativo"] = deleted ? false : SnapshotBool(record, "Ativo") ?? true;
                    return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Product_Category>(filter, fields);

                case EntityTypeDelete.Address: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Address>(filter, fields);
                case EntityTypeDelete.ProductImage: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Imagens_Products>(filter, fields);
                case EntityTypeDelete.ProductVariant: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Variante_Products>(filter, fields);
                case EntityTypeDelete.Coupon: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Cupom>(filter, fields);
                case EntityTypeDelete.CouponProduct: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Coupon_Product>(filter, fields);
                case EntityTypeDelete.CouponCategory: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Coupon_Category>(filter, fields);
                case EntityTypeDelete.Order: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Orders>(filter, fields);
                case EntityTypeDelete.OrderItem: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<OrderLineItens>(filter, fields);
                case EntityTypeDelete.Rating: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Rating>(filter, fields);
                case EntityTypeDelete.Cart: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Cart>(filter, fields);
                case EntityTypeDelete.CartItem: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Cart_Item>(filter, fields);
                case EntityTypeDelete.CouponUse: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Coupon_Use>(filter, fields);
                case EntityTypeDelete.EmailVerification: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<EmailVerification>(filter, fields);
                case EntityTypeDelete.NotificationUser: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<NotificationUser>(filter, fields);
                case EntityTypeDelete.Customize: return await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Customize_Cliente>(filter, fields);
                default: return false;
            }
        }

        /// <summary>Remove dados pessoais (usuário e endereço).</summary>
        private async Task AnonymizeAsync(DeletionRecords record)
        {
            var filter = new Dictionary<string, object> { { "Id", record.EntityId } };

            if (record.EntityType == EntityTypeDelete.Users)
            {
                var role = OwnerRoleOf(record);

                var fields = new Dictionary<string, object>
                {
                    { "Name", "Usuário removido" },
                    { "Email", $"removido.{role.ToLower()}.{record.EntityId}@removido.local" },
                    { "Phone", null! },
                    { "Avatar", null! },
                    // Senha impossível de adivinhar: a conta nunca mais faz login
                    { "PasswordHash", Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + Guid.NewGuid() },
                    { "Ativo", false },
                    { "UpdateDate", DateTime.Now }
                };

                switch (role)
                {
                    case "ADMIN": await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<User_Admin>(filter, fields); break;
                    case "DELIVERY": await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<User_Delivery>(filter, fields); break;
                    default: await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<User_Customer>(filter, fields); break;
                }
            }
            else if (record.EntityType == EntityTypeDelete.Address)
            {
                await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Address>(filter, new Dictionary<string, object>
                {
                    { "Name", "Removido" },
                    { "Phone", string.Empty },
                    { "Road", "Removido" },
                    { "Number", 0 },
                    { "Supplement", null! },
                    { "ReferencePoint", string.Empty },
                    { "UpdateDate", DateTime.Now }
                });
            }
        }

        private static bool HasPersonalData(DeletionRecords record)
            => record.EntityType is EntityTypeDelete.Users or EntityTypeDelete.Address;

        private async Task UpdateRecordAsync(int recordId, Dictionary<string, object> fields)
        {
            await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<DeletionRecords>(
                new Dictionary<string, object> { { "Id", recordId } },
                fields);
        }

        private async Task LogAsync(int adminId, DeletionRecords record, string acao, string detalhe)
        {
            var admin = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == adminId);
            var nome = admin?.Name ?? "Administrador";
            var now = DateTime.Now;

            await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Logs
            {
                Id_User = adminId,
                Log = $"O administrador {nome} {detalhe}.\nData/Hora: {now:dd/MM/yyyy HH:mm:ss}",
                Tipo = "LIXEIRA",
                Nivel = "ADMIN",
                Acao = acao,
                Info = $"{nome} {detalhe} em {now:dd/MM/yyyy HH:mm}.",
                InsertDate = now
            });
        }

        // ───────────────────────── MONTAR RESPOSTA ─────────────────────────

        private record OwnerInfo(string Name, string Email);

        /// <summary>Busca nome/e-mail dos donos de uma vez (por perfil).</summary>
        private async Task<Dictionary<(string Role, int Id), OwnerInfo>> LoadOwnersAsync(List<DeletionRecords> records)
        {
            var result = new Dictionary<(string, int), OwnerInfo>();

            var keys = records
                .Select(OwnerKey)
                .Where(k => k is not null)
                .Select(k => k!.Value)
                .Distinct()
                .ToList();

            var customerIds = keys.Where(k => k.Role == "CLIENTE").Select(k => k.Id).ToList();
            var adminIds = keys.Where(k => k.Role == "ADMIN").Select(k => k.Id).ToList();
            var deliveryIds = keys.Where(k => k.Role == "DELIVERY").Select(k => k.Id).ToList();

            if (customerIds.Count > 0)
                foreach (var u in await _unitOfWorkAdmin.GetClassListAsyncWhere<User_Customer>(x => customerIds.Contains(x.Id)))
                    result[("CLIENTE", u.Id)] = new OwnerInfo(u.Name, u.Email);

            if (adminIds.Count > 0)
                foreach (var u in await _unitOfWorkAdmin.GetClassListAsyncWhere<User_Admin>(x => adminIds.Contains(x.Id)))
                    result[("ADMIN", u.Id)] = new OwnerInfo(u.Name, u.Email);

            if (deliveryIds.Count > 0)
                foreach (var u in await _unitOfWorkAdmin.GetClassListAsyncWhere<User_Delivery>(x => deliveryIds.Contains(x.Id)))
                    result[("DELIVERY", u.Id)] = new OwnerInfo(u.Name, u.Email);

            return result;
        }

        private static (string Role, int Id)? OwnerKey(DeletionRecords record)
        {
            if (record.EntityType == EntityTypeDelete.Users)
                return (OwnerRoleOf(record), record.EntityId);

            if (record.OwnerUserId is not null)
                return (record.OwnerRole ?? "CLIENTE", record.OwnerUserId.Value);

            // Registros antigos de endereço: o dono era quem excluiu
            if (record.EntityType == EntityTypeDelete.Address)
                return ("CLIENTE", record.DeletedByUserId);

            return null;
        }

        private static TrashItemResponse Map(
            DeletionRecords record,
            Dictionary<(string Role, int Id), OwnerInfo> owners,
            DeletionRecords? parent = null)
        {
            var key = OwnerKey(record) ?? (parent is not null ? OwnerKey(parent) : null);
            OwnerInfo? owner = null;
            if (key is not null) owners.TryGetValue(key.Value, out owner);

            var data = EntitySnapshot.FromJson(record.Snapshot);

            return new TrashItemResponse
            {
                Id = record.Id,
                EntityType = EntityCode(record.EntityType),
                EntityId = record.EntityId,
                EntityName = string.IsNullOrWhiteSpace(record.DisplayName) ? TypeLabel(record.EntityType) : record.DisplayName,
                UserId = key?.Id,
                UserRole = key?.Role,
                UserName = owner?.Name,
                UserEmail = owner?.Email,
                // Registros novos são gravados em UTC
                DeletedAt = DateTime.SpecifyKind(record.DeletedAt, DateTimeKind.Utc),
                PermanentDeleteAt = null,
                Reason = record.Reason,
                DeletedById = record.DeletedByUserId,
                DeletedByName = string.IsNullOrWhiteSpace(record.DeletedByUserName) ? null : record.DeletedByUserName,
                DeletedByRole = record.DeletedByRole,
                Data = data
            };
        }

        private static string Describe(DeletionRecords record, int childrenCount, Dictionary<string, System.Text.Json.JsonElement>? data)
        {
            var extra = childrenCount > 0 ? $" {childrenCount} item(ns) foram excluídos junto." : string.Empty;

            switch (record.EntityType)
            {
                case EntityTypeDelete.Users:
                    return $"Conta de {RoleLabel(OwnerRoleOf(record))} excluída.{extra}";

                case EntityTypeDelete.Category:
                    if (data is not null && data.TryGetValue("MovidosParaCategoria", out var moved) && moved.ValueKind == System.Text.Json.JsonValueKind.String)
                        return $"Categoria excluída. Os produtos foram movidos para '{moved.GetString()}'.";
                    return $"Categoria excluída.{extra}";

                default:
                    return $"{TypeLabel(record.EntityType)} excluído(a).{extra}";
            }
        }

        private static string OwnerRoleOf(DeletionRecords record)
            => string.IsNullOrWhiteSpace(record.OwnerRole) ? "CLIENTE" : record.OwnerRole!;

        private static bool? SnapshotBool(DeletionRecords record, string field)
        {
            var data = EntitySnapshot.FromJson(record.Snapshot);

            if (data is null || !data.TryGetValue(field, out var value))
                return null;

            return value.ValueKind switch
            {
                System.Text.Json.JsonValueKind.True => true,
                System.Text.Json.JsonValueKind.False => false,
                _ => null
            };
        }

        private async Task<string?> GetUserEmailAsync(int userId, string role)
        {
            return role switch
            {
                "ADMIN" => (await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == userId))?.Email,
                "DELIVERY" => (await _unitOfWorkAdmin.GetClassAsyncWhere<User_Delivery>(x => x.Id == userId))?.Email,
                _ => (await _unitOfWorkAdmin.GetClassAsyncWhere<User_Customer>(x => x.Id == userId))?.Email
            };
        }

        private static string RoleLabel(string role) => role switch
        {
            "ADMIN" => "administrador",
            "DELIVERY" => "entregador",
            _ => "cliente"
        };

        private static string EntityCode(EntityTypeDelete? type) => type switch
        {
            EntityTypeDelete.Users => "USER",
            EntityTypeDelete.Address => "ADDRESS",
            EntityTypeDelete.Product => "PRODUCT",
            EntityTypeDelete.ProductImage => "PRODUCT_IMAGE",
            EntityTypeDelete.ProductVariant => "PRODUCT_VARIANT",
            EntityTypeDelete.Category => "CATEGORY",
            EntityTypeDelete.Coupon => "COUPON",
            EntityTypeDelete.CouponProduct => "COUPON_PRODUCT",
            EntityTypeDelete.CouponCategory => "COUPON_CATEGORY",
            EntityTypeDelete.Order => "ORDER",
            EntityTypeDelete.OrderItem => "ORDER_ITEM",
            EntityTypeDelete.Rating => "RATING",
            EntityTypeDelete.Cart => "CART",
            EntityTypeDelete.CartItem => "CART_ITEM",
            EntityTypeDelete.CouponUse => "COUPON_USE",
            EntityTypeDelete.EmailVerification => "EMAIL_VERIFICATION",
            EntityTypeDelete.NotificationUser => "NOTIFICATION",
            EntityTypeDelete.Customize => "CUSTOMIZE",
            _ => "OTHER"
        };

        private static string RelatedKey(EntityTypeDelete? type) => type switch
        {
            EntityTypeDelete.Address => "addresses",
            EntityTypeDelete.Order => "orders",
            EntityTypeDelete.OrderItem => "orderItems",
            EntityTypeDelete.Cart => "carts",
            EntityTypeDelete.CartItem => "cartItems",
            EntityTypeDelete.NotificationUser => "notifications",
            EntityTypeDelete.Rating => "ratings",
            EntityTypeDelete.CouponUse => "couponUses",
            EntityTypeDelete.EmailVerification => "emailVerifications",
            EntityTypeDelete.Customize => "customizes",
            EntityTypeDelete.Product => "products",
            EntityTypeDelete.ProductImage => "productImages",
            EntityTypeDelete.ProductVariant => "productVariants",
            EntityTypeDelete.CouponProduct => "couponProducts",
            EntityTypeDelete.CouponCategory => "couponCategories",
            _ => "others"
        };

        private static string TypeLabel(EntityTypeDelete? type) => type switch
        {
            EntityTypeDelete.Users => "Usuário",
            EntityTypeDelete.Address => "Endereço",
            EntityTypeDelete.Product => "Produto",
            EntityTypeDelete.ProductImage => "Imagem do produto",
            EntityTypeDelete.ProductVariant => "Variação do produto",
            EntityTypeDelete.Category => "Categoria",
            EntityTypeDelete.Coupon => "Cupom",
            EntityTypeDelete.CouponProduct => "Vínculo de cupom com produto",
            EntityTypeDelete.CouponCategory => "Vínculo de cupom com categoria",
            EntityTypeDelete.Order => "Pedido",
            EntityTypeDelete.OrderItem => "Item do pedido",
            EntityTypeDelete.Rating => "Avaliação",
            EntityTypeDelete.Cart => "Carrinho",
            EntityTypeDelete.CartItem => "Item do carrinho",
            EntityTypeDelete.CouponUse => "Uso de cupom",
            EntityTypeDelete.EmailVerification => "Verificação de e-mail",
            EntityTypeDelete.NotificationUser => "Notificação",
            EntityTypeDelete.Customize => "Personalização",
            _ => "Item"
        };
    }
}
