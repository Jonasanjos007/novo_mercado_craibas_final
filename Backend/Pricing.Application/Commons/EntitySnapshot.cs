using System.Reflection;
using System.Text.Json;

namespace Baldan.Pricing.Application.Commons;

public static class EntitySnapshot
{
    private static readonly HashSet<string> SensitiveFields = new(StringComparer.OrdinalIgnoreCase)
    {
        "PasswordHash",
        "RefreshToken",
        "RefreshTokenExpiresAt",
        "TokenVersion",
        "CodeHash",
    };

    public static string? ToJson(object? entity, Dictionary<string, object?>? extra = null)
    {
        if (entity is null && (extra is null || extra.Count == 0))
        {
            return null;
        }

        var data = new Dictionary<string, object?>();

        foreach (var item in extra ?? new Dictionary<string, object?>())
        {
            data[item.Key] = item.Value;
        }

        if (entity is null)
        {
            return JsonSerializer.Serialize(data);
        }

        foreach (var property in entity.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!property.CanRead || SensitiveFields.Contains(property.Name))
            {
                continue;
            }

            if (!IsSimpleType(property.PropertyType))
            {
                continue;
            }

            var value = property.GetValue(entity);

            data[property.Name] = value is Enum ? value.ToString() : value;
        }

        return JsonSerializer.Serialize(data);
    }

    public static Dictionary<string, JsonElement>? FromJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static bool IsSimpleType(Type type)
    {
        var t = Nullable.GetUnderlyingType(type) ?? type;

        return t.IsPrimitive
            || t.IsEnum
            || t == typeof(string)
            || t == typeof(decimal)
            || t == typeof(DateTime)
            || t == typeof(DateTimeOffset)
            || t == typeof(Guid);
    }
}
