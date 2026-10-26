using System.Collections;
using System.Reflection;
using Baldan.Pricing.Application.Commons;
using Microsoft.AspNetCore.Mvc.Filters;
using Pricing.Api.Extensions;

namespace Pricing.Api.Security;

/// <summary>Marca as rotas que aceitam vídeo (avaliações de produto). As outras só aceitam imagem.</summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public sealed class AllowVideoUploadsAttribute : Attribute { }

/// <summary>
/// Confere TODOS os arquivos enviados para a API antes de chegar no serviço:
///   - extensão permitida (imagens comuns; vídeo só onde houver [AllowVideoUploads]);
///   - tamanho máximo;
///   - conteúdo real do arquivo (assinatura dos primeiros bytes), para um .html ou .svg
///     renomeado para .png não ser aceito.
/// SVG não é aceito porque pode conter script.
/// </summary>
public sealed class UploadValidationFilter : IAsyncActionFilter
{
    private static readonly HashSet<string> ImageExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp" };
    private static readonly HashSet<string> VideoExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".mp4", ".mov", ".webm" };

    private const long MaxImageBytes = 10 * 1024 * 1024;
    private const long MaxVideoBytes = 100 * 1024 * 1024;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var files = new List<IFormFile>();
        foreach (var argument in context.ActionArguments.Values)
            Collect(argument, files, depth: 0);

        if (files.Count > 0)
        {
            var allowVideo = context.ActionDescriptor.EndpointMetadata.OfType<AllowVideoUploadsAttribute>().Any();
            foreach (var file in files)
            {
                var error = await ValidateAsync(file, allowVideo);
                if (error != null)
                {
                    context.Result = Error.Validation("Arquivo", error).ToActionResult();
                    return;
                }
            }
        }

        await next();
    }

    private static void Collect(object? value, List<IFormFile> files, int depth)
    {
        switch (value)
        {
            case null:
                return;
            case IFormFile file:
                files.Add(file);
                return;
            case IEnumerable<IFormFile> many:
                files.AddRange(many.Where(f => f != null));
                return;
            case string:
                return;
        }

        if (depth > 2) return;
        var type = value.GetType();
        if (type.IsPrimitive || type.IsEnum || !type.IsClass) return;

        foreach (var property in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (property.GetIndexParameters().Length > 0) continue;
            var propertyType = property.PropertyType;
            var isFile = typeof(IFormFile).IsAssignableFrom(propertyType)
                         || typeof(IEnumerable<IFormFile>).IsAssignableFrom(propertyType);
            var isNested = propertyType.IsClass && propertyType != typeof(string)
                           && !typeof(IEnumerable).IsAssignableFrom(propertyType)
                           && propertyType.Namespace?.StartsWith("Mercado.Craibas", StringComparison.Ordinal) == true;
            if (!isFile && !isNested) continue;

            object? propertyValue;
            try { propertyValue = property.GetValue(value); }
            catch { continue; }
            Collect(propertyValue, files, depth + 1);
        }
    }

    private static async Task<string?> ValidateAsync(IFormFile file, bool allowVideo)
    {
        if (file.Length <= 0) return null; // campo vazio: os serviços já ignoram

        var extension = Path.GetExtension(file.FileName ?? string.Empty);
        var isImage = ImageExtensions.Contains(extension);
        var isVideo = allowVideo && VideoExtensions.Contains(extension);

        if (!isImage && !isVideo)
            return allowVideo
                ? "Formato não permitido. Envie imagem (JPG, PNG, WEBP, GIF) ou vídeo (MP4, MOV, WEBM)."
                : "Formato não permitido. Envie uma imagem JPG, PNG, WEBP ou GIF.";

        if (isImage && file.Length > MaxImageBytes)
            return "A imagem deve ter no máximo 10 MB.";
        if (isVideo && file.Length > MaxVideoBytes)
            return "O vídeo deve ter no máximo 100 MB.";

        var header = new byte[16];
        int read;
        await using (var stream = file.OpenReadStream())
            read = await stream.ReadAsync(header.AsMemory(0, header.Length));

        var ok = isImage ? LooksLikeImage(header, read) : LooksLikeVideo(header, read);
        return ok ? null : "O arquivo enviado não é uma imagem/vídeo válido.";
    }

    private static bool StartsWith(byte[] data, int read, params byte[] signature)
        => read >= signature.Length && data.AsSpan(0, signature.Length).SequenceEqual(signature);

    private static bool Ascii(byte[] data, int read, int offset, string text)
        => read >= offset + text.Length && System.Text.Encoding.ASCII.GetString(data, offset, text.Length) == text;

    private static bool LooksLikeImage(byte[] h, int read) =>
        StartsWith(h, read, 0xFF, 0xD8, 0xFF)                                    // JPG
        || StartsWith(h, read, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)   // PNG
        || Ascii(h, read, 0, "GIF87a") || Ascii(h, read, 0, "GIF89a")            // GIF
        || (Ascii(h, read, 0, "RIFF") && Ascii(h, read, 8, "WEBP"))              // WEBP
        || Ascii(h, read, 0, "BM")                                               // BMP
        || (Ascii(h, read, 4, "ftyp") && (Ascii(h, read, 8, "avif") || Ascii(h, read, 8, "avis"))); // AVIF

    private static bool LooksLikeVideo(byte[] h, int read) =>
        Ascii(h, read, 4, "ftyp")                                                // MP4 / MOV
        || Ascii(h, read, 4, "moov") || Ascii(h, read, 4, "mdat")                // MOV antigo
        || Ascii(h, read, 4, "wide") || Ascii(h, read, 4, "free")
        || StartsWith(h, read, 0x1A, 0x45, 0xDF, 0xA3)                           // WEBM
        || LooksLikeImage(h, read);
}
