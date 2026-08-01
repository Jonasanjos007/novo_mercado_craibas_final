using Microsoft.AspNetCore.Http;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class CategoryRequest
    {
        public int Id { get; set; }

        public string? Name { get; set; }

        public string? Description { get; set; }

        public string? Color { get; set; }

        public string? Meta_Title { get; set; }

        public string? Meta_Description { get; set; }

        public bool Ativo { get; set; }

        // Nova imagem principal. Pode ser null durante edição.
        public IFormFile? Imagem { get; set; }

        // Novos banners adicionados.
        public List<IFormFile>? Banners { get; set; }

        // Nomes dos banners antigos que foram mantidos.
        public List<string>? ExistingBanners { get; set; }
    }
}
