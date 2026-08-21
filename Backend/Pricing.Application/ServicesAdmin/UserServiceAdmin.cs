using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace Mercado.Craibas.Application.ServicesAdmin
{
    public class UserServiceAdmin : IUserServiceAdmin
    {
        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;

        public UserServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
        }
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
                        Log = $"Editou o usuário {User.Name} -------------- {JsonSerializer.Serialize(User)}",
                        Tipo = "Edicao",
                        Nivel = "Admin",
                        Acao =$"{User.Name} {usuarioAtual.Role} Editou o Usuário",
                        Info =$"{User.Name} {usuarioAtual.Role} Editou o Usuário em " + $"{DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                        InsertDate = DateTime.Now
                    }
                );

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

    }
}
