using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Domain.Enums;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.AccessControl;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace Mercado.Craibas.Application.ServicesAdmin
{
    public class UserServiceAdmin : IUserServiceAdmin
    {
        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;
        private readonly INotificationService _notification;
        private readonly IEmailService _email;
        private readonly IAuthRepository _authRepository;
        private readonly IDeletionRecordService _deletionRecord;
        private readonly IPasswordHasher _passwordHasher;


        public UserServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin, IEmailService email, INotificationService notificationService, IAuthRepository authRepository, IDeletionRecordService deletionRecord, IPasswordHasher passwordHasher)
        {
            _passwordHasher = passwordHasher;
            _deletionRecord = deletionRecord;
            _unitOfWorkAdmin = unitOfWorkAdmin;
            _notification = notificationService;
            _email = email;
            _authRepository = authRepository;
        }
        /// <summary>
        /// Admin cria um novo ADMIN ou DELIVERY.
        /// Usa as mesmas regras do cadastro do site (nome, telefone, e-mail e senha)
        /// e já entrega a conta pronta: ativa, com tema e cadastro concluído.
        /// A confirmação de senha do admin (para criar ADMIN) é feita no controller.
        /// </summary>
        public async Task<Result<string>> CreateUserAsync(AdminCreateUserRequest request, int adminId)
        {
            var admin = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == adminId && x.Isdelete != true);

            if (admin == null)
                return Result<string>.Failure(Error.NotFound("Administrador", "Administrador não encontrado."));

            if (request == null)
                return Result<string>.Failure(Error.Validation("Cadastro", "Dados inválidos."));

            // ── Tipo: somente ADMIN ou DELIVERY ──
            if (!Enum.TryParse<ProfileEnum>(request.Role?.Trim(), true, out var role) || role == ProfileEnum.CLIENTE)
                return Result<string>.Failure(Error.Validation("Tipo", "Escolha o tipo de acesso: Administrador ou Delivery."));

            // ── Nome ──
            var name = request.Name?.Trim();

            if (string.IsNullOrWhiteSpace(name) || name.Length < 3)
                return Result<string>.Failure(Error.Validation("Nome", "Informe o nome completo."));

            if (name.Length > 150)
                return Result<string>.Failure(Error.Validation("Nome", "O nome deve ter no máximo 150 caracteres."));

            // ── E-mail ──
            var email = request.Email?.Trim().ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(email))
                return Result<string>.Failure(Error.Validation("Email", "Informe o e-mail."));

            if (email.Length > 200 || !new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(email))
                return Result<string>.Failure(Error.Validation("Email", "Informe um e-mail válido."));

            if (string.IsNullOrWhiteSpace(request.ConfirmEmail) || request.ConfirmEmail.Trim().ToLowerInvariant() != email)
                return Result<string>.Failure(Error.Validation("Email", "Os e-mails não são iguais."));

            // ── Telefone ──
            var phoneDigits = new string((request.Phone ?? string.Empty).Where(char.IsDigit).ToArray());

            if (phoneDigits.Length < 10 || phoneDigits.Length > 11)
                return Result<string>.Failure(Error.Validation("Telefone", "Informe um telefone válido com DDD."));

            // ── Transporte (delivery) ──
            var transport = request.Transport?.Trim();

            if (role == ProfileEnum.DELIVERY && (string.IsNullOrWhiteSpace(transport) || transport.Length < 2 || transport.Length > 50))
                return Result<string>.Failure(Error.Validation("Transporte", "Informe o meio de transporte do entregador."));

            // ── Senha (regra única do sistema) ──
            var passwordError = PasswordPolicy.Validate(request.Password, request.ConfirmPassword);

            if (passwordError is not null)
                return Result<string>.Failure(passwordError);

            // ── E-mail único nas 3 tabelas ──
            // O login não filtra excluídos, então um e-mail de conta excluída também bloqueia.
            var emailConflict = await FindEmailOwnerAsync(email);

            if (emailConflict != null)
                return Result<string>.Failure(Error.Conflict("Email", emailConflict));

            // ── Telefone único no tipo escolhido ──
            var phonesInUse = role == ProfileEnum.ADMIN
                ? (await _unitOfWorkAdmin.GetClassListAsyncWhere<User_Admin>(x => x.Isdelete != true && x.Phone != null)).Select(x => x.Phone)
                : (await _unitOfWorkAdmin.GetClassListAsyncWhere<User_Delivery>(x => x.Isdelete != true && x.Phone != null)).Select(x => x.Phone);

            if (phonesInUse.Any(p => new string(p!.Where(char.IsDigit).ToArray()) == phoneDigits))
                return Result<string>.Failure(Error.Conflict("Telefone", "Este telefone já está cadastrado em outra conta deste tipo."));

            var phone = FormatPhone(phoneDigits);
            var passwordHash = _passwordHasher.Hash(request.Password!);
            var now = DateTime.Now;
            int newUserId;
            string roleLabel;

            if (role == ProfileEnum.ADMIN)
            {
                var newAdmin = await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new User_Admin
                {
                    Name = name,
                    Email = email,
                    Phone = phone,
                    PasswordHash = passwordHash,
                    Role = ProfileEnum.ADMIN,
                    Ativo = true,
                    InsertDate = now,
                    Isdelete = false
                });

                // Sem o tema o login quebra (o /me lê o Customize)
                await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Customize_Admin
                {
                    Global_Site_Color = "brand",
                    Dark = true,
                    Id_User_Admin = newAdmin.Id,
                    InsertDate = now,
                    Isdelete = false
                });

                newUserId = newAdmin.Id;
                roleLabel = "administrador";
            }
            else
            {
                var newDelivery = await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new User_Delivery
                {
                    Name = name,
                    Email = email,
                    Phone = phone,
                    Transport = transport!,
                    PasswordHash = passwordHash,
                    Role = ProfileEnum.DELIVERY,
                    Ativo = true,
                    InsertDate = now,
                    Isdelete = false
                });

                await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Customize_Delivery
                {
                    Global_Site_Color = "brand",
                    Dark = true,
                    Id_User_Delivery = newDelivery.Id,
                    InsertDate = now,
                    Isdelete = false
                });

                newUserId = newDelivery.Id;
                roleLabel = "entregador";
            }

            // ── LOG ──
            await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Logs
            {
                Id_User = adminId,
                Log = $"O administrador {admin.Name} cadastrou o {roleLabel} {name} (ID: {newUserId}). \n" +
                      $"E-mail: {email} | Telefone: {phone}" +
                      (role == ProfileEnum.DELIVERY ? $" | Transporte: {transport}" : string.Empty) +
                      $" | Data/Hora: {now:dd/MM/yyyy HH:mm:ss}",
                Tipo = "CADASTRO",
                Nivel = "ADMIN",
                Acao = $"Cadastrou um novo {roleLabel}",
                Info = $"{admin.Name} cadastrou o {roleLabel} {name} em {now:dd/MM/yyyy HH:mm}.",
                InsertDate = now
            });

            // ── NOTIFICAÇÕES ──
            var otherAdmins = await _unitOfWorkAdmin.GetClassListAsyncWhere<User_Admin>(x => x.Isdelete != true && x.Ativo == true && x.Id != adminId);

            if (otherAdmins.Count > 0)
            {
                await _notification.SendNotification(
                    new NotificationRequest
                    {
                        Kind = "Novo Cadastro",
                        Title = role == ProfileEnum.ADMIN ? "Novo administrador cadastrado" : "Novo entregador cadastrado",
                        Description = $"{admin.Name} cadastrou {name} como {roleLabel}.",
                        Icone = "UserPlus",
                        ActionUrl = "/admin",
                        ReferenceId = newUserId,
                        ReferenceType = "CADASTRO",
                        Role = "ADMIN"
                    },
                    otherAdmins.Select(x => new NotificationUserRequest { UserId = x.Id }).ToList()
                );
            }

            await _notification.SendNotification(
                new NotificationRequest
                {
                    Kind = "Cadastro",
                    Title = "Bem-vindo(a) ao Mercado Craíbas! 🎉",
                    Description = role == ProfileEnum.ADMIN
                        ? $"Olá, {name}! Seu acesso de administrador foi criado por {admin.Name}."
                        : $"Olá, {name}! Seu acesso de entregador foi criado. Suas entregas aparecem no portal de entregas.",
                    Icone = "UserCheck",
                    ActionUrl = role == ProfileEnum.ADMIN ? "/admin" : "/delivery",
                    ReferenceId = newUserId,
                    ReferenceType = "REGISTRATION",
                    Role = role.ToString()
                },
                new List<NotificationUserRequest> { new NotificationUserRequest { UserId = newUserId } }
            );

            // ── E-MAIL DE BOAS-VINDAS (sem senha) ──
            try
            {
                var layout = _email.EmailContaCriada(
                    nome: name,
                    email: email,
                    perfil: role == ProfileEnum.ADMIN ? "Administrador" : "Entregador",
                    criadoPor: admin.Name,
                    linkAcesso: "https://mavihstudio.com.br/login");

                await _email.EnviarEmailAsync(email, "Sua conta foi criada - Mercado Craíbas", layout);
            }
            catch
            {
                // A conta já foi criada; falha no e-mail não desfaz o cadastro.
            }

            return Result<string>.Success(name);
        }

        /// <summary>Mensagem de conflito se o e-mail já existir em alguma das 3 tabelas.</summary>
        private async Task<string?> FindEmailOwnerAsync(string email)
        {
            var customer = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Customer>(x => x.Email != null && x.Email.ToLower() == email);
            var adminUser = customer == null ? await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Email.ToLower() == email) : null;
            var delivery = customer == null && adminUser == null ? await _unitOfWorkAdmin.GetClassAsyncWhere<User_Delivery>(x => x.Email.ToLower() == email) : null;

            var deleted = customer?.Isdelete ?? adminUser?.Isdelete ?? delivery?.Isdelete;

            if (customer == null && adminUser == null && delivery == null)
                return null;

            if (deleted == true)
                return "Este e-mail pertence a uma conta excluída. Exclua definitivamente na Lixeira para poder reutilizar.";

            var owner = customer != null ? "um cliente" : adminUser != null ? "um administrador" : "um entregador";
            return $"Este e-mail já está em uso por {owner}.";
        }

        private static string FormatPhone(string digits) =>
            digits.Length == 11
                ? $"({digits[..2]}) {digits.Substring(2, 5)}-{digits[7..]}"
                : $"({digits[..2]}) {digits.Substring(2, 4)}-{digits[6..]}";

        public async Task<Result<bool>> PostEditeUserAdmin(UserAdminRequest User, int IdUser)
        {
            try
            {
                if (IdUser <= 0)
                {
                    return Result<bool>.Failure(Error.Failure("Error", "Id não selecionado!"));
                }

                if (string.IsNullOrWhiteSpace(User.Name))
                {
                    return Result<bool>.Failure(Error.Failure("Usuário", "Nome do Usuário é obrigatório!"));
                }
                try
                {
                    var email = new System.Net.Mail.MailAddress(User.Email.Trim());

                    if (email.Address != User.Email.Trim())
                    {
                        return Result<bool>.Failure(Error.Failure("Email","O email não é válido."));
                    }
                }
                catch
                {
                    return Result<bool>.Failure(Error.Failure("Email","O email não é válido."));
                }

                // TELEFONE OBRIGATÓRIO
                if (User.Telefone == null || User.Telefone == null)
                {
                    return Result<bool>.Failure(Error.Failure("Telefone","O telefone é obrigatório."));
                }

                // TELEFONE VÁLIDO
                var telefone = User.Telefone.ToString();

                if (telefone.Length < 10 || telefone.Length > 11)
                {
                    return Result<bool>.Failure(Error.Failure("Telefone","O telefone não é válido."));
                }
                if (string.IsNullOrWhiteSpace(User.Email))
                {
                    return Result<bool>.Failure(Error.Failure("Email", "Email do Usuário é obrigatório!"));
                }

                if (User.Telefone == null )
                {
                    return Result<bool>.Failure(Error.Failure("Telefone", "Telefone do Usuário é obrigatório!"));
                }

                var usuarioAtual = await _unitOfWorkAdmin.GetClassById<User_Admin, int>(IdUser, "Id");

                if (usuarioAtual == null)
                {
                    return Result<bool>.Failure(
                        Error.Failure("Usuário", "Usuário não encontrado!")
                    );
                }

                var nomeAnterior = usuarioAtual.Name;
                var emailAnterior = usuarioAtual.Email;
                var telefoneAnterior = usuarioAtual.Phone;
                var avatarAnterior = usuarioAtual.Avatar;

                if (usuarioAtual == null)
                {
                    return Result<bool>.Failure(Error.Failure("Usuário", "Usuário não encontrado!"));
                }
                var nomeArquivoAvatar = usuarioAtual.Avatar;
                /*
                 * Só altera o avatar se realmente vier um novo arquivo.
                 */
                if (User.Avatar != null && User.Avatar.Length > 0)
                {
                    var pastaDestinoImage =_unitOfWorkAdmin.GetImagesFolder("Usuarios");

                    var extensao = Path.GetExtension(User.Avatar.FileName);

                    var novoNomeArquivo =$"{Guid.NewGuid()}{extensao}";

                    var caminhoNovoAvatar = Path.Combine(pastaDestinoImage,novoNomeArquivo);

                    await using (var stream = new FileStream(caminhoNovoAvatar,FileMode.Create))
                    {
                        await User.Avatar.CopyToAsync(stream);
                    }

                    /*
                     * Remove o avatar antigo somente depois
                     * que o novo foi salvo com sucesso.
                     */
                    if (!string.IsNullOrWhiteSpace(usuarioAtual.Avatar))
                    {
                        var caminhoAvatarAntigo = Path.Combine(pastaDestinoImage,usuarioAtual.Avatar);

                        if (File.Exists(caminhoAvatarAntigo))
                        {
                            File.Delete(caminhoAvatarAntigo);
                        }
                    }

                    nomeArquivoAvatar = novoNomeArquivo;
                }

                var fieldsUser = new Dictionary<string, object>
        {
            { "Name", User.Name },
            { "Email", User.Email },
            { "Phone", User.Telefone },
            { "UpdateDate", DateTime.Now }
        };

                /*
                 * Só atualiza Avatar se houver um valor.
                 */
                if (!string.IsNullOrWhiteSpace(nomeArquivoAvatar))
                {
                    fieldsUser.Add("Avatar", nomeArquivoAvatar);
                }

                var updateUserAdmin =
                    await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<User_Admin>(
                        filters: new Dictionary<string, object>
                        {
                    { "Id", IdUser }
                        },
                        fieldsToUpdate: fieldsUser
                    );

                if (!updateUserAdmin)
                {
                    return Result<bool>.Failure(Error.Failure("Usuário","Não foi possível atualizar o usuário."));
                }

                var updateUserAdminCustomize =
                    await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Customize_Admin>(
                        filters: new Dictionary<string, object>
                        {
                    { "Id_User_Admin", IdUser }
                        },
                        fieldsToUpdate: new Dictionary<string, object>
                        {
                    { "Dark", User.Tema },
                    { "UpdateDate", DateTime.Now }
                        }
                    );

                await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                     new Logs
                     {
                         Id_User = IdUser,
                         Log =  $"Edição do usuário realizada por {usuarioAtual.Name}. " +
                             $"Usuário editado: {User.Name}. " +
                             $"Alterações: " +
                             $"Nome: '{nomeAnterior}' → '{User.Name}' | " +
                             $"Email: '{emailAnterior}' → '{User.Email}' | " +
                             $"Telefone: '{telefoneAnterior}' → '{User.Telefone}' | " +
                             $"Avatar: '{avatarAnterior ?? "Nenhum"}' → '{nomeArquivoAvatar ?? "Nenhum"}' | " +
                             $"Tema: '{User.Tema}'",
                         Tipo = "Edicao",
                        Nivel = "ADMIN",
                         Acao =
                             $"O administrador {usuarioAtual.Name} realizou uma edição no usuário. " +
                             $"As informações cadastrais e configurações do usuário foram atualizadas.",
                         Info =
                             $"Administrador responsável: {usuarioAtual.Name} | " +
                             $"ID do administrador/usuário: {IdUser} | " +
                             $"Perfil: {usuarioAtual.Role} | " +
                             $"Data/Hora: {DateTime.Now:dd/MM/yyyy HH:mm:ss} | " +
                             $"Nome anterior: '{nomeAnterior}' | " +
                             $"Novo nome: '{User.Name}' | " +
                             $"Email anterior: '{emailAnterior}' | " +
                             $"Novo email: '{User.Email}' | " +
                             $"Telefone anterior: '{telefoneAnterior}' | " +
                             $"Novo telefone: '{User.Telefone}' | " +
                             $"Avatar anterior: '{avatarAnterior ?? "Nenhum"}' | " +
                             $"Novo avatar: '{nomeArquivoAvatar ?? "Nenhum"}' | " +
                             $"Tema selecionado: '{User.Tema}'",
                         InsertDate = DateTime.Now
                     });

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(
                    Error.Failure("Usuário", ex.Message)
                );
            }
        }
        public async Task<Result<bool>> PostEditeTemaAdmin(bool Tema, int IdUser)
        {
            try
            {
            
                var fieldsUser = new Dictionary<string, object>
        {
            { "Dark", Tema},
            { "UpdateDate", DateTime.Now }
        };

             

                var updateUserAdmin =await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Customize_Admin>(
                        filters: new Dictionary<string, object>
                        {
                    { "Id_User_Admin", IdUser }
                        },
                        fieldsToUpdate: fieldsUser
                    );

                if (!updateUserAdmin)
                {
                    return Result<bool>.Failure(Error.Failure("Usuário", "Não foi possível atualizar o usuário."));
                }

                

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(
                    Error.Failure("Usuário", ex.Message)
                );
            }
        }

        public async Task<Result<bool>> PostUpdateInfoSite(InfoSiteRequest request, int IdUserAdmin)
        {
            try
            {
                if (request == null)
                {
                    return Result<bool>.Failure(Error.Failure("Informação Site", "Informações do site não informadas!"));
                }

                if (string.IsNullOrWhiteSpace(request.StoreName))
                {
                    return Result<bool>.Failure(Error.Failure("Informação Site", "Nome do site é obrigatório!"));
                }

                var baseSite = await _unitOfWorkAdmin.GetClassAsyncWhere<BaseSite>(x => x.Id != null);

                if (baseSite == null)
                {
                    return Result<bool>.Failure(Error.Failure("Informação Site", "Configuração do site não encontrada!"));
                }

                // Guarda os valores anteriores antes da alteração
                var nomeAnterior = baseSite.StoreName;
                var imagemAnterior = baseSite.StoreImage;
                var iconeAnterior = baseSite.StoreImageIcone;

                var nomeImagem = baseSite.StoreImage;
                var nomeImagemIcone = baseSite.StoreImageIcone;

                if (request.StoreImage != null && request.StoreImage.Length > 0)
                {
                    var extensao = Path.GetExtension(request.StoreImage.FileName);

                    var extensoesPermitidas = new[]
                    {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            };

                    if (!extensoesPermitidas.Contains(extensao.ToLowerInvariant()))
                    {
                        return Result<bool>.Failure(Error.Failure("Informação Site","Formato de imagem não permitido. Use JPG, JPEG, PNG ou WEBP."));
                    }

                    nomeImagem = $"{Guid.NewGuid()}{extensao.ToLowerInvariant()}";

                    var pastaDestinoImage = _unitOfWorkAdmin.GetImagesFolder("Site");

                    if (!Directory.Exists(pastaDestinoImage))
                    {
                        Directory.CreateDirectory(pastaDestinoImage);
                    }

                    var caminhoCompleto = Path.Combine(
                        pastaDestinoImage,
                        nomeImagem
                    );

                    await using var stream = new FileStream(
                        caminhoCompleto,
                        FileMode.Create
                    );

                    await request.StoreImage.CopyToAsync(stream);
                }

                if (request.StoreImageIcone != null && request.StoreImageIcone.Length > 0)
                {
                    var extensao = Path.GetExtension(request.StoreImageIcone.FileName);

                    var extensoesPermitidas = new[]
                    {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            };

                    if (!extensoesPermitidas.Contains(extensao.ToLowerInvariant()))
                    {
                        return Result<bool>.Failure(Error.Failure("Informação Site","Formato de imagem não permitido. Use JPG, JPEG, PNG ou WEBP."));
                    }

                    nomeImagemIcone = $"{Guid.NewGuid()}{extensao.ToLowerInvariant()}";

                    var pastaDestinoImage = _unitOfWorkAdmin.GetImagesFolder("Site");

                    if (!Directory.Exists(pastaDestinoImage))
                    {
                        Directory.CreateDirectory(pastaDestinoImage);
                    }

                    var caminhoCompleto = Path.Combine(
                        pastaDestinoImage,
                        nomeImagemIcone
                    );

                    await using var stream = new FileStream(
                        caminhoCompleto,
                        FileMode.Create
                    );

                    await request.StoreImageIcone.CopyToAsync(stream);
                }

                var fieldsSite = new Dictionary<string, object>
        {
            { "StoreName", request.StoreName },
            { "StoreImage", nomeImagem },
            { "StoreImageIcone", nomeImagemIcone },
            { "UpdateDate", DateTime.Now }
        };

                var updateSite = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<BaseSite>(
                    filters: new Dictionary<string, object>
                    {
                { "Id", baseSite.Id }
                    },
                    fieldsToUpdate: fieldsSite
                );

                if (!updateSite)
                {
                    return Result<bool>.Failure(Error.Failure("Informação Site","Não foi possível atualizar as informações do site."));
                }

                var user = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == IdUserAdmin);

                if (user != null)
                {
                    var alteracoes = new List<string>();

                    if (nomeAnterior != request.StoreName)
                    {
                        alteracoes.Add($"Nome da loja: '{nomeAnterior}' → '{request.StoreName}'");
                    }

                    if (imagemAnterior != nomeImagem)
                    {
                        alteracoes.Add($"Logo da loja: '{imagemAnterior ?? "Nenhuma"}' → '{nomeImagem ?? "Nenhuma"}'");
                    }

                    if (iconeAnterior != nomeImagemIcone)
                    {
                        alteracoes.Add($"Ícone da loja: '{iconeAnterior ?? "Nenhum"}' → '{nomeImagemIcone ?? "Nenhum"}'");
                    }

                    await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                        new Logs
                        {
                            Id_User = user.Id,
                            Log =
                                $"O administrador {user.Name} editou as informações do site. \n" +
                                $"Alterações realizadas: \n" +
                                $"{(alteracoes.Count > 0
                                    ? string.Join("\n", alteracoes)
                                    : "Nenhuma alteração identificada.")} \n" +
                                $"Data/Hora: {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                            Tipo = "Edicao",
                            Nivel = "ADMIN",
                            Acao = "Editou as informações do site",
                            Info =
                                $"{user.Name} editou as informações do site " +
                                $"em {DateTime.Now:dd/MM/yyyy HH:mm}.",

                            InsertDate = DateTime.Now
                        }
                    );
                }
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(
                    Error.Failure("Informação Site", ex.Message)
                );
            }
        }

        public async Task<Result<bool>> PostUpdateTaxasBases(TaxasBasesRequest request)
        {
            try
            {
                if(request.ShippingCost == 0 || request.ShippingCost == null || request.ShippingCost < 5)
                {
                    return Result<bool>.Failure(Error.Failure("Taxas Bases", "O valor mínimo do frete é R$ 5,00."));
                }
                if (request.TimeframeBusinessDays == 0 || request.TimeframeBusinessDays == null)
                {
                    return Result<bool>.Failure(Error.Failure("Taxas Bases", "Adiciona a qunatidade de dias úteis para a entrega!"));
                }
                var fieldsUser = new Dictionary<string, object>
        {
            { "TimeframeBusinessDays", request.TimeframeBusinessDays},
            { "ShippingCost", request.ShippingCost},
            { "UpdateDate", DateTime.Now }
        };



                var updateUserAdmin = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<BaseRates>(
                        filters: new Dictionary<string, object>
                        {
                        },
                        fieldsToUpdate: fieldsUser
                    );

                if (!updateUserAdmin)
                {
                    return Result<bool>.Failure(Error.Failure("Taxas Bases", "Não foi possível atualizar as informações das Taxas."));
                }



                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(
                    Error.Failure("Taxas Bases", ex.Message)
                );
            }
        }
        // ═════════════════════════ PAGINAÇÃO ═════════════════════════

        /// <summary>
        /// Usuários paginados. Mesmas regras e mesma ordem da lista de hoje:
        /// administradores, depois clientes, depois entregadores (sem excluídos).
        /// Filtros (perfil, status e busca por nome/e-mail/telefone) aplicados antes de paginar.
        /// </summary>
        public async Task<Result<UsersPageResponse>> GetUsersPagedAsync(int page, int pageSize, string? search, string? role, string? status)
        {
            page = Paging.Page(page);
            pageSize = Paging.Size(pageSize);

            var term = Paging.Term(search);
            var roleFilter = string.IsNullOrEmpty(role) || role == "ALL" ? null : role;
            bool? ativo = status == "ativo" ? true : status == "inactive" ? false : null;

            var admins = _unitOfWorkAdmin.Query<User_Admin>().AsNoTracking().Where(x => x.Isdelete != true);
            var customers = _unitOfWorkAdmin.Query<User_Customer>().AsNoTracking().Where(x => x.Isdelete != true);
            var deliveries = _unitOfWorkAdmin.Query<User_Delivery>().AsNoTracking().Where(x => x.Isdelete != true);

            if (ativo.HasValue)
            {
                admins = admins.Where(x => x.Ativo == ativo.Value);
                customers = customers.Where(x => x.Ativo == ativo.Value);
                deliveries = deliveries.Where(x => x.Ativo == ativo.Value);
            }

            if (term != null)
            {
                admins = admins.Where(x => (x.Name != null && x.Name.Contains(term)) || (x.Email != null && x.Email.Contains(term)) || (x.Phone != null && x.Phone.Contains(term)));
                customers = customers.Where(x => (x.Name != null && x.Name.Contains(term)) || (x.Email != null && x.Email.Contains(term)) || (x.Phone != null && x.Phone.Contains(term)));
                deliveries = deliveries.Where(x => (x.Name != null && x.Name.Contains(term)) || (x.Email != null && x.Email.Contains(term)) || (x.Phone != null && x.Phone.Contains(term)));
            }

            var useAdmins = roleFilter == null || roleFilter == "ADMIN";
            var useCustomers = roleFilter == null || roleFilter == "CLIENTE";
            var useDeliveries = roleFilter == null || roleFilter == "DELIVERY";

            // Contagens por tabela (para paginar em sequência: admins → clientes → entregadores)
            var adminCount = useAdmins ? await admins.CountAsync() : 0;
            var customerCount = useCustomers ? await customers.CountAsync() : 0;
            var deliveryCount = useDeliveries ? await deliveries.CountAsync() : 0;

            var activeCount =
                (useAdmins ? await admins.CountAsync(x => x.Ativo) : 0) +
                (useCustomers ? await customers.CountAsync(x => x.Ativo) : 0) +
                (useDeliveries ? await deliveries.CountAsync(x => x.Ativo) : 0);

            var total = adminCount + customerCount + deliveryCount;
            var skip = (page - 1) * pageSize;
            var items = new List<UserAdminResponse>();

            // Fatia de cada tabela que cai dentro da página
            async Task TakeSlice<T>(IQueryable<T> query, int count, Func<IQueryable<T>, IQueryable<UserAdminResponse>> project)
            {
                if (count == 0 || items.Count >= pageSize) return;

                if (skip >= count) { skip -= count; return; }

                var take = pageSize - items.Count;
                var slice = await project(query).Skip(skip).Take(take).ToListAsync();
                items.AddRange(slice);
                skip = 0;
            }

            await TakeSlice(admins, adminCount, q => q.OrderBy(x => x.Id).Select(user => new UserAdminResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Avatar = user.Avatar,
                Role = ProfileEnum.ADMIN,
                Ativo = user.Ativo,
                Phone = user.Phone,
                Insert_Date = user.InsertDate,
                UpdateDate = user.UpdateDate
            }));

            await TakeSlice(customers, customerCount, q => q.OrderBy(x => x.Id).Select(user => new UserAdminResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Avatar = user.Avatar,
                Role = ProfileEnum.CLIENTE,
                Ativo = user.Ativo,
                Phone = user.Phone,
                Insert_Date = user.InsertDate,
                UpdateDate = user.UpdateDate
            }));

            await TakeSlice(deliveries, deliveryCount, q => q.OrderBy(x => x.Id).Select(user => new UserAdminResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Avatar = user.Avatar,
                Role = ProfileEnum.DELIVERY,
                Ativo = user.Ativo,
                Phone = user.Phone,
                Insert_Date = user.InsertDate,
                UpdateDate = user.UpdateDate
            }));

            return Result<UsersPageResponse>.Success(new UsersPageResponse
            {
                Items = items,
                TotalCount = total,
                PageNumber = page,
                PageSize = pageSize,
                ActiveCount = activeCount,
                InactiveCount = total - activeCount
            });
        }

        /// <summary>Cards da tela de usuários (sobre todos os usuários não excluídos).</summary>
        public async Task<Result<UsersSummaryResponse>> GetUsersSummaryAsync()
        {
            var admins = _unitOfWorkAdmin.Query<User_Admin>().AsNoTracking().Where(x => x.Isdelete != true);
            var customers = _unitOfWorkAdmin.Query<User_Customer>().AsNoTracking().Where(x => x.Isdelete != true);
            var deliveries = _unitOfWorkAdmin.Query<User_Delivery>().AsNoTracking().Where(x => x.Isdelete != true);

            var adminCount = await admins.CountAsync();
            var customerCount = await customers.CountAsync();
            var deliveryCount = await deliveries.CountAsync();

            var active = await admins.CountAsync(x => x.Ativo)
                         + await customers.CountAsync(x => x.Ativo)
                         + await deliveries.CountAsync(x => x.Ativo);

            var total = adminCount + customerCount + deliveryCount;

            return Result<UsersSummaryResponse>.Success(new UsersSummaryResponse
            {
                Total = total,
                Active = active,
                Inactive = total - active,
                Admins = adminCount,
                Clients = customerCount,
                Delivery = deliveryCount
            });
        }

        public async Task<Result<List<UserAdminResponse>>> GetAllUsers()
        {
            try
            {
                var userAdmin = await _unitOfWorkAdmin.GetClassListAsyncWhere<User_Admin>(x => x.Isdelete != true);
                var userCustomer = await _unitOfWorkAdmin.GetClassListAsyncWhere<User_Customer>(x => x.Isdelete != true);
                var userDelivery = await _unitOfWorkAdmin.GetClassListAsyncWhere<User_Delivery>(x => x.Isdelete != true);

                var users = new List<UserAdminResponse>();

                users.AddRange(userAdmin.Select(user => new UserAdminResponse
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    Role = ProfileEnum.ADMIN,
                    Ativo = user.Ativo,
                    Phone = user.Phone,
                    Insert_Date = user.InsertDate,
                    UpdateDate = user.UpdateDate
                }));

                users.AddRange(userCustomer.Select(user => new UserAdminResponse
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    Role = ProfileEnum.CLIENTE,
                    Ativo = user.Ativo,
                    Phone = user.Phone,
                    Insert_Date = user.InsertDate,
                    UpdateDate = user.UpdateDate
                }));

                users.AddRange(userDelivery.Select(user => new UserAdminResponse
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    Role = ProfileEnum.DELIVERY,
                    Ativo = user.Ativo,
                    Phone = user.Phone,
                    Insert_Date = user.InsertDate,
                    UpdateDate = user.UpdateDate
                }));

                return Result<List<UserAdminResponse>>.Success(users);
            }
            catch (Exception ex)
            {
                return Result<List<UserAdminResponse>>.Failure(Error.Failure("Buscar Usuários", ex.Message));
            }
        }
        public async Task<Result<string>> DeactivateClient(int userIdCliente,string role,int IdAdmin)
        {
            if (userIdCliente == 0)
            {
                return Result<string>.Failure(Error.NotFound("Id Cliente","Id do Cliente está inválido ou vazio!"));
            }

            if (IdAdmin == 0)
            {
                return Result<string>.Failure(Error.NotFound("Id Do ADM","Id do ADMIN está inválido ou vazio!"));
            }

            if (string.IsNullOrWhiteSpace(role))
            {
                return Result<string>.Failure(Error.NotFound("Role","Role do usuário está inválida ou vazia!"));
            }

            // Busca o administrador que realizou a ação
            var user = await _unitOfWorkAdmin.GetClassById<User_Admin, int>(IdAdmin,"Id");

            if (user == null)
            {
                return Result<string>.Failure(Error.NotFound("Administrador","Administrador não encontrado!"));
            }

            string nomeUsuario = "";
            string statusAnterior = "";
            string novoStatus = "";
            bool updateUsuario = false;

            switch (role)
            {
                case "CLIENTE":
                    var cliente = await _unitOfWorkAdmin.GetClassById<User_Customer, int>(userIdCliente,"Id");

                    if (cliente == null)
                    {
                        return Result<string>.Failure(Error.NotFound("Cliente","Cliente não encontrado!"));
                    }

                    nomeUsuario = cliente.Name;
                    statusAnterior = cliente.Ativo == true ? "Ativo" : "Inativo";
                    novoStatus = cliente.Ativo == true ? "Inativo" : "Ativo";

                    updateUsuario =
                        await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<User_Customer>(
                            filters: new Dictionary<string, object>
                            {
                        { "Id", userIdCliente }
                            },
                            fieldsToUpdate: new Dictionary<string, object>
                            {
                        { "Ativo", !cliente.Ativo },
                        { "UpdateDate", DateTime.Now }
                            }
                        );

                    if (!updateUsuario)
                    {
                        return Result<string>.Failure(Error.NotFound("Erro","Erro ao alterar o status do cliente!"));
                    }
                    break;
                case "ADMIN":

                    var admin = await _unitOfWorkAdmin.GetClassById<User_Admin, int>(userIdCliente,"Id");
                    if (admin == null)
                    {
                        return Result<string>.Failure(Error.NotFound("Administrador","Administrador selecionado não encontrado!"));
                    }
                    nomeUsuario = admin.Name;
                    statusAnterior = admin.Ativo == true ? "Ativo" : "Inativo";
                    novoStatus = admin.Ativo == true ? "Inativo" : "Ativo";

                    updateUsuario =
                        await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<User_Admin>(
                            filters: new Dictionary<string, object>
                            {
                        { "Id", userIdCliente }
                            },
                            fieldsToUpdate: new Dictionary<string, object>
                            {
                        { "Ativo", !admin.Ativo },
                        { "UpdateDate", DateTime.Now }
                            }
                        );

                    if (!updateUsuario)
                    {
                        return Result<string>.Failure(Error.NotFound("Erro","Erro ao alterar o status do ADM selecionado!"));
                    }

                    break;


                case "DELIVERY":

                    var delivery = await _unitOfWorkAdmin.GetClassById<User_Delivery, int>(userIdCliente,"Id");

                    if (delivery == null)
                    {
                        return Result<string>.Failure(Error.NotFound("Entregador","Entregador selecionado não encontrado!"));
                    }

                    nomeUsuario = delivery.Name;
                    statusAnterior = delivery.Ativo == true ? "Ativo" : "Inativo";
                    novoStatus = delivery.Ativo == true ? "Inativo" : "Ativo";

                    updateUsuario =
                        await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<User_Delivery>(
                            filters: new Dictionary<string, object>
                            {
                        { "Id", userIdCliente }
                            },
                            fieldsToUpdate: new Dictionary<string, object>
                            {
                        { "Ativo", !delivery.Ativo },
                        { "UpdateDate", DateTime.Now }
                            }
                        );

                    if (!updateUsuario)
                    {
                        return Result<string>.Failure(Error.NotFound("Erro","Erro ao alterar o status do entregador selecionado!"));
                    }

                    break;


                default:

                    return Result<string>.Failure(Error.Failure("Role","Role não encontrado!"));
            }
            var dataLog = DateTime.Now;
            string acao = novoStatus == "Ativo"? "Ativou o usuário" : "Desativou o usuário";


            // LOG
            await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                new Logs
                {
                    Id_User = user.Id,

                    Log =
                        $"O administrador {user.Name} {acao.ToLower()} '{nomeUsuario}'.\n" +
                        $"Usuário: '{nomeUsuario}' (ID: {userIdCliente})\n" +
                        $"Tipo de usuário: {role}\n" +
                        $"Status anterior: '{statusAnterior}'\n" +
                        $"Novo status: '{novoStatus}'\n" +
                        $"Data/Hora: {dataLog:dd/MM/yyyy HH:mm:ss}",
                    Tipo = novoStatus == "Ativo"
                        ? "ATIVAÇÃO USUÁRIO"
                        : "DESATIVAÇÃO USUÁRIO",
                    Nivel = "ADMIN",
                    Acao = acao,
                    Info =
                        $"{user.Name} {acao.ToLower()} '{nomeUsuario}' " +
                        $"em {dataLog:dd/MM/yyyy HH:mm}.",
                    InsertDate = dataLog
                }
            );


            // BUSCA ADMINS PARA NOTIFICAÇÃO
            var usersAdmin = await _unitOfWorkAdmin.GetClassListAsyncWhere<User_Admin>(x => x.Ativo == true && x.Isdelete != true);

            var users = usersAdmin.Select(x => new NotificationUserRequest
            {
                UserId = x.Id
            }).ToList();


            // NOTIFICAÇÃO
            await _notification.SendNotification(
                new NotificationRequest
                {
                    Kind = novoStatus == "Ativo" ? "Usuário ativado" : "Usuário desativado",
                    Title = novoStatus == "Ativo" ? "Usuário ativado" : "Usuário desativado",
                    Description = $"{user.Name} {acao.ToLower()} '{nomeUsuario}' " + $"({role}).",
                    Icone = novoStatus == "Ativo" ? "UserCheck" : "UserX",
                    ActionUrl = "/admin",
                    ReferenceId = userIdCliente,
                    ReferenceType = "USUARIO",
                    Role = "ADMIN"
                },
                users
            );


            return Result<string>.Success(acao);
        }

        public async Task<Result<List<AddressResponse>>> GetAddressesAll(int userIdCliente)
        {
            var addresses = await _unitOfWorkAdmin.GetClassListAsyncWhere<Address>(x => x.Id_User_Customer == userIdCliente && x.Isdelete != true);

            var response = addresses.Select(address => new AddressResponse
            {
                Id = address.Id,
                Road = address.Road,
                Name = address.Name,
                Phone = address.Phone,
                Neighborhood = address.Neighborhood,
                Supplement = address.Supplement,
                ReferencePoint = address.ReferencePoint,
                City = address.City,
                Standard = address.Standard,
                Number = address.Number,
                State = address.State,
                Id_User_Customer = address.Id_User_Customer,
                InsertDate = address.InsertDate,
                UpdateDate = address.UpdateDate
            }).ToList();

            return Result<List<AddressResponse>>.Success(response);
        }
        public async Task<Result<GeneralUserInformationResponse>> GetInforGeneral(int userIdCliente)
        {
            var Orders = await _unitOfWorkAdmin.GetClassListAsyncWhere<Orders>(x => x.Id_User_Customer == userIdCliente);
            var Cupoms = await _unitOfWorkAdmin.GetClassListAsyncWhere<Coupon_Use>(x => x.Id_User == userIdCliente && x.Isdelete != true);
            var Cart = await _unitOfWorkAdmin.GetClassAsyncWhere<Cart>(x => x.Id_User_Customer == userIdCliente && x.Isdelete != true);
            var CartItem = await _unitOfWorkAdmin.GetClassListAsyncWhere<Cart_Item>(x => x.Id_Cart == Cart.Id && x.Isdelete != true);

            var response = new GeneralUserInformationResponse();


            response = new GeneralUserInformationResponse
            {
                TotalExpenses = Orders.Where(x => x.Status_Pay != "PENDENTE" && x.Order_Status != "CANCELADO" && x.Isdelete != true).Sum(x => x.Total_Value_Order),
                OrdersAmount = Orders.Count(),
                OrdersDelivered = Orders.Where(x => x.Order_Status == "ENTREGUE" && x.Isdelete != true).Count(),
                OrdersCanceled = Orders.Where(x => x.Order_Status == "CANCELADO" && x.Isdelete != true).Count(),
                CouponAmount = Cupoms.Count(),
                EmptyCart = CartItem.Count() > 0,
                PaymentRequestPending = Orders.Where(x => x.Status_Pay == "PENDENTE" && x.Isdelete != true).Count() > 0
            };

            return Result<GeneralUserInformationResponse>.Success(response);
        }
        public async Task<Result<bool>> DeleteUserIsDelete(int userIdCliente,string role,int Id_UserResponsavel,string roleResponsavel, string? reason)
        {
            UserInfo? User = new UserInfo { Id = 0 , Name = "",Email = ""};

            // Segurança: só o ADMIN exclui outras contas.
            // Qualquer outro perfil só pode excluir a própria conta.
            if (roleResponsavel != "ADMIN" && (userIdCliente != Id_UserResponsavel || role != roleResponsavel))
            {
                return Result<bool>.Failure(Error.Validation("Usuário", "Você não tem permissão para excluir esta conta."));
            }

            // Motivo obrigatório quando o administrador exclui
            if (roleResponsavel == "ADMIN" && (string.IsNullOrWhiteSpace(reason) || reason.Trim().Length < 5))
            {
                return Result<bool>.Failure(Error.Validation("Motivo", "Informe o motivo da exclusão (mínimo de 5 caracteres)."));
            }

            // Lixeira: cópia do usuário ANTES da exclusão
            object? userBefore = role switch
            {
                "CLIENTE" => await _unitOfWorkAdmin.GetClassAsyncWhere<User_Customer>(x => x.Id == userIdCliente && x.Isdelete != true),
                "ADMIN" => await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == userIdCliente && x.Isdelete != true),
                "DELIVERY" => await _unitOfWorkAdmin.GetClassAsyncWhere<User_Delivery>(x => x.Id == userIdCliente && x.Isdelete != true),
                _ => null
            };

            if (userBefore is null)
            {
                return Result<bool>.Failure(Error.NotFound("Usuário", "Usuário não encontrado ou já excluído."));
            }

            // Lixeira: tudo que será excluído junto (somente o que ainda não estava excluído)
            var cascade = role == "CLIENTE"
                ? await CollectCustomerCascadeAsync(userIdCliente)
                : new List<DeletionRecordRequest>();
             
             
            switch(role) {
                case "CLIENTE" :

                      await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<User_Customer>(
                          filters: new Dictionary<string, object>
                          {
                            { "Id", userIdCliente }
                          },
                          fieldsToUpdate: new Dictionary<string, object>
                          {
                            { "Isdelete", true },
                            { "Ativo", false },
                            {"UpdateDate",DateTime.Now }

                          }
                      );
                    // Derruba todas as sessões do usuário (TokenVersion + 1 e apaga o Refresh Token)
                    await _authRepository.InvalidateSessionsAsync(userIdCliente, ProfileEnum.CLIENTE, SessionRevokeReasonEnum.UserDeleted);

                    var User_Customer = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Customer>(X => X.Id == userIdCliente);

                    User = new UserInfo
                    {
                        Id = User_Customer.Id,
                        Name = User_Customer.Name,
                        Email = User_Customer.Email
                    };

                    break;
                case "ADMIN":
                    await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<User_Admin>(
                          filters: new Dictionary<string, object>
                          {
                            { "Id", userIdCliente }
                          },
                          fieldsToUpdate: new Dictionary<string, object>
                          {
                            { "Isdelete", true },
                            { "Ativo", false },
                            {"UpdateDate",DateTime.Now }
                          }
                      );
                    // Derruba todas as sessões do usuário (TokenVersion + 1 e apaga o Refresh Token)
                    await _authRepository.InvalidateSessionsAsync(userIdCliente, ProfileEnum.ADMIN, SessionRevokeReasonEnum.UserDeleted);

                    var User_Admin = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(X => X.Id == userIdCliente);

                    User = new UserInfo
                    {
                        Id = User_Admin.Id,
                        Name = User_Admin.Name,
                        Email = User_Admin.Email
                    };

                    break;
                case "DELIVERY":
                    await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<User_Delivery>(
                          filters: new Dictionary<string, object>
                          {
                            { "Id", userIdCliente }
                          },
                          fieldsToUpdate: new Dictionary<string, object>
                          {

                            { "Isdelete", true },
                            { "Ativo", false },
                            {"UpdateDate",DateTime.Now }

                          }
                      );
                    // Derruba todas as sessões do usuário (TokenVersion + 1 e apaga o Refresh Token)
                    await _authRepository.InvalidateSessionsAsync(userIdCliente, ProfileEnum.DELIVERY, SessionRevokeReasonEnum.UserDeleted);

                    var User_Delivery = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Delivery>(X => X.Id == userIdCliente);

                    User = new UserInfo
                    {
                        Id = User_Delivery.Id,
                        Name = User_Delivery.Name,
                        Email = User_Delivery.Email
                    };

                    break;
            }

            // Exclui (Isdelete = true) exatamente os itens coletados para a Lixeira.
            // Antes este trecho rodava para qualquer perfil e marcava dados do CLIENTE
            // com o mesmo Id ao excluir um ADMIN/ENTREGADOR. Agora só roda para cliente.
            foreach (var item in cascade)
            {
                await MarkEntityDeletedAsync(item.EntityType, item.EntityId);
            }

            // Lixeira: registro principal (usuário) + itens excluídos junto
            var deletedByName = await GetUserNameAsync(Id_UserResponsavel, roleResponsavel);

            var parentRecordId = await _deletionRecord.RegisterAsync(new DeletionRecordRequest
            {
                EntityType = EntityTypeDelete.Users,
                EntityId = userIdCliente,
                DisplayName = User.Name,
                OwnerUserId = userIdCliente,
                OwnerRole = role,
                DeletedByUserId = Id_UserResponsavel,
                DeletedByRole = roleResponsavel,
                DeletedByUserName = deletedByName,
                Reason = roleResponsavel == "ADMIN"
                    ? reason!.Trim()
                    : string.IsNullOrWhiteSpace(reason)
                        ? "Excluído pelo próprio usuário"
                        : $"Excluído pelo próprio usuário: {reason.Trim()}",
                Entity = userBefore
            });

            foreach (var item in cascade)
            {
                item.DeletedByUserId = Id_UserResponsavel;
                item.DeletedByRole = roleResponsavel;
                item.DeletedByUserName = deletedByName;
                item.Reason = "Excluído junto com o usuário";
            }

            await _deletionRecord.RegisterChildrenAsync(parentRecordId, cascade);
           
           
            var DadosSupport = await _unitOfWorkAdmin.GetClassAsyncWhere<BaseSite>(X => X.Isdelete != true);

            string linkSuporte =
                $"https://wa.me/{DadosSupport.PhoneSupport}?text=Ol%C3%A1%2C%20minha%20conta%20foi%20exclu%C3%ADda%20e%20gostaria%20de%20solicitar%20a%20recupera%C3%A7%C3%A3o.";

            var layoutEmail = _email.EmailContaDesativada(User.Name,User.Id,User.Email, DadosSupport.PhoneSupport,linkSuporte, roleResponsavel);

            var enviado = await _email.EnviarEmailAsync(User.Email, "Mercado Craibas", layoutEmail);


            var usersAdmin = await _unitOfWorkAdmin.GetClassListAsyncWhere<User_Admin>(x => x.Ativo == true && x.Isdelete != true);

            var usersADMINs = usersAdmin.Select(x => new NotificationUserRequest
            {
                UserId = x.Id
            }).ToList();

            string description;

            if (roleResponsavel == "CLIENTE")
            {
                description =$"O cliente '{User.Name}' excluiu a própria conta. ";
            }
            else // ADMIN
            {
                var nomeUsuarioRespon = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == Id_UserResponsavel);

                description =
                    $"O administrador '{nomeUsuarioRespon.Name}' excluiu a conta do cliente '{User.Name}'.";
            }

            // NOTIFICAÇÃO
            await _notification.SendNotification(
                new NotificationRequest
                {
                    Kind = "Usuário excluído",
                    Title = "Usuário excluído",
                    Description = description,
                    Icone = "UserX",
                    ActionUrl = "/admin",
                    ReferenceId = userIdCliente,
                    ReferenceType = "USUARIO_EXCLUIDO",
                    Role = "ADMIN"
                },
                usersADMINs
            );


            return Result<bool>.Success(true);
        }
        // ───────────── Lixeira: apoio à exclusão de usuário ─────────────

        /// <summary>
        /// Coleta (sem alterar nada) tudo do cliente que ainda não está excluído
        /// e que será excluído junto com a conta.
        /// </summary>
        private async Task<List<DeletionRecordRequest>> CollectCustomerCascadeAsync(int customerId)
        {
            var items = new List<DeletionRecordRequest>();

            DeletionRecordRequest Item(EntityTypeDelete type, int id, string name, object entity) => new()
            {
                EntityType = type,
                EntityId = id,
                DisplayName = name,
                OwnerUserId = customerId,
                OwnerRole = "CLIENTE",
                Entity = entity
            };

            var addresses = await _unitOfWorkAdmin.GetClassListAsyncWhere<Address>(x => x.Id_User_Customer == customerId && x.Isdelete != true);
            items.AddRange(addresses.Select(a => Item(EntityTypeDelete.Address, a.Id, $"{a.Road}, {a.Number} - {a.Neighborhood}, {a.City}", a)));

            var orders = await _unitOfWorkAdmin.GetClassListAsyncWhere<Orders>(x => x.Id_User_Customer == customerId && x.Isdelete != true);
            items.AddRange(orders.Select(o => Item(EntityTypeDelete.Order, o.Id, $"Pedido #{o.Id}", o)));

            var orderIds = orders.Select(o => o.Id).ToList();
            if (orderIds.Count > 0)
            {
                var orderItems = await _unitOfWorkAdmin.GetClassListAsyncWhere<OrderLineItens>(x => orderIds.Contains(x.Id_Order) && x.Isdelete != true);
                items.AddRange(orderItems.Select(i => Item(EntityTypeDelete.OrderItem, i.Id, $"{i.Name_Product} (pedido #{i.Id_Order})", i)));
            }

            var carts = await _unitOfWorkAdmin.GetClassListAsyncWhere<Cart>(x => x.Id_User_Customer == customerId && x.Isdelete != true);
            items.AddRange(carts.Select(c => Item(EntityTypeDelete.Cart, c.Id, $"Carrinho #{c.Id}", c)));

            var cartIds = carts.Select(c => c.Id).ToList();
            if (cartIds.Count > 0)
            {
                var cartItems = await _unitOfWorkAdmin.GetClassListAsyncWhere<Cart_Item>(x => cartIds.Contains(x.Id_Cart) && x.Isdelete != true);
                items.AddRange(cartItems.Select(i => Item(EntityTypeDelete.CartItem, i.Id, $"Item #{i.Id} do carrinho #{i.Id_Cart}", i)));
            }

            var customizes = await _unitOfWorkAdmin.GetClassListAsyncWhere<Customize_Cliente>(x => x.Id_User_Customer == customerId && x.Isdelete != true);
            items.AddRange(customizes.Select(c => Item(EntityTypeDelete.Customize, c.Id, "Personalização do site", c)));

            var couponUses = await _unitOfWorkAdmin.GetClassListAsyncWhere<Coupon_Use>(x => x.Id_User == customerId && x.Isdelete != true);
            items.AddRange(couponUses.Select(c => Item(EntityTypeDelete.CouponUse, c.Id, $"Uso de cupom no pedido #{c.Id_Order}", c)));

            var verifications = await _unitOfWorkAdmin.GetClassListAsyncWhere<EmailVerification>(x => x.UserId == customerId && x.Isdelete != true);
            items.AddRange(verifications.Select(v => Item(EntityTypeDelete.EmailVerification, v.Id, "Verificação de e-mail", v)));

            var notifications = await _unitOfWorkAdmin.GetClassListAsyncWhere<NotificationUser>(x => x.UserId == customerId && x.Role == "CLIENTE" && x.Isdelete != true);
            items.AddRange(notifications.Select(n => Item(EntityTypeDelete.NotificationUser, n.Id, $"Notificação #{n.NotificationId}", n)));

            var ratings = await _unitOfWorkAdmin.GetClassListAsyncWhere<Rating>(x => x.Id_User_Customer == customerId && x.Isdelete != true);
            items.AddRange(ratings.Select(r => Item(EntityTypeDelete.Rating, r.Id, $"Avaliação ({r.Ranting} estrelas) do pedido #{r.Id_Order}", r)));

            return items;
        }

        /// <summary>Marca uma entidade como excluída (Isdelete = true).</summary>
        private async Task MarkEntityDeletedAsync(EntityTypeDelete type, int id)
        {
            var filter = new Dictionary<string, object> { { "Id", id } };
            var fields = new Dictionary<string, object> { { "Isdelete", true }, { "UpdateDate", DateTime.Now } };

            switch (type)
            {
                case EntityTypeDelete.Address: await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Address>(filter, fields); break;
                case EntityTypeDelete.Order: await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Orders>(filter, fields); break;
                case EntityTypeDelete.OrderItem: await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<OrderLineItens>(filter, fields); break;
                case EntityTypeDelete.Cart: await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Cart>(filter, fields); break;
                case EntityTypeDelete.CartItem: await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Cart_Item>(filter, fields); break;
                case EntityTypeDelete.Customize: await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Customize_Cliente>(filter, fields); break;
                case EntityTypeDelete.CouponUse: await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Coupon_Use>(filter, fields); break;
                case EntityTypeDelete.EmailVerification: await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<EmailVerification>(filter, fields); break;
                case EntityTypeDelete.NotificationUser: await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<NotificationUser>(filter, fields); break;
                case EntityTypeDelete.Rating: await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Rating>(filter, fields); break;
            }
        }

        /// <summary>Nome de quem executou a ação.</summary>
        private async Task<string> GetUserNameAsync(int userId, string role)
        {
            return role switch
            {
                "ADMIN" => (await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == userId))?.Name ?? "Administrador",
                "CLIENTE" => (await _unitOfWorkAdmin.GetClassAsyncWhere<User_Customer>(x => x.Id == userId))?.Name ?? "Cliente",
                "DELIVERY" => (await _unitOfWorkAdmin.GetClassAsyncWhere<User_Delivery>(x => x.Id == userId))?.Name ?? "Entregador",
                _ => role
            };
        }
    }


}
