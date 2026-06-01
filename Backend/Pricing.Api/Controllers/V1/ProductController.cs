using backend.services.interfaces;
using Mercado.Craibas.Application.Interfaces.Services;

namespace Mercado.Api.Controllers.V1
{
    public class ProductController
    {
        private readonly IProductService _service;

        public ProductController(IProductService service)
        {
            _service = service;
        }
    }
}
