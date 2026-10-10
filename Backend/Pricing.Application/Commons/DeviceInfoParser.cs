namespace Baldan.Pricing.Application.Commons;
public static class DeviceInfoParser
{
    public const string Desktop = "desktop";
    public const string Mobile = "mobile";
    public const string Tablet = "tablet";

    public static (string Name, string Type) Parse(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent))
        {
            return ("Dispositivo desconhecido", Desktop);
        }

        var ua = userAgent;

        var browser = GetBrowser(ua);
        var (os, type) = GetOperatingSystem(ua);

        if (browser is null && os is null)
        {
            return ("Dispositivo desconhecido", type);
        }

        if (browser is null)
        {
            return (os!, type);
        }

        if (os is null)
        {
            return (browser, type);
        }

        return ($"{browser} no {os}", type);
    }

    private static string? GetBrowser(string ua)
    {
        // A ordem importa: vários navegadores também enviam "Chrome" e "Safari".
        if (Has(ua, "Edg/") || Has(ua, "EdgA/") || Has(ua, "EdgiOS/")) return "Edge";
        if (Has(ua, "OPR/") || Has(ua, "Opera")) return "Opera";
        if (Has(ua, "SamsungBrowser/")) return "Samsung Internet";
        if (Has(ua, "Firefox/") || Has(ua, "FxiOS/")) return "Firefox";
        if (Has(ua, "CriOS/")) return "Chrome";
        if (Has(ua, "Chrome/") || Has(ua, "Chromium/")) return "Chrome";
        if (Has(ua, "Safari/")) return "Safari";

        return null;
    }

    private static (string? Os, string Type) GetOperatingSystem(string ua)
    {
        if (Has(ua, "iPhone")) return ("iPhone", Mobile);
        if (Has(ua, "iPad")) return ("iPad", Tablet);

        if (Has(ua, "Android"))
        {
            // Tablets Android normalmente não enviam "Mobile"
            return ("Android", Has(ua, "Mobile") ? Mobile : Tablet);
        }

        if (Has(ua, "Windows")) return ("Windows", Desktop);
        if (Has(ua, "CrOS")) return ("Chromebook", Desktop);
        if (Has(ua, "Macintosh") || Has(ua, "Mac OS X")) return ("Mac", Desktop);
        if (Has(ua, "Linux")) return ("Linux", Desktop);

        return (null, Has(ua, "Mobile") ? Mobile : Desktop);
    }

    private static bool Has(string ua, string value)
        => ua.Contains(value, StringComparison.OrdinalIgnoreCase);
}
