using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Interfaces.Services
{
    public interface IProductService
    {
        Task<Result<List<ProductResponse>>> GetProductList();
        Task<Result<bool>> PostCartItensSave(CartItensRequest CartProduto,int userid);
        Task<Result<CartUserResponse>> GetProductCartList(int Id_Customer);
        Task<Result<bool>> PostCartItensUpdate(int Id, int Quantity, string Soma_Sub);
        Task<Result<bool>> DeleteProductCartList(int Id_Customer);
        Task<Result<List<RatingAllProducts>>> GetAssessmentAllProduct(int IdProduct);
        Task<Result<bool>> PostFavoriteSave(int UserId, int IdProduct);
        Task<Result<List<FavoritesResponse>>> GetAllFavorites(int UserId);
        Task<Result<bool>> DeleteFavorites(int IdProduct);

    }
}
