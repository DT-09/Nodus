using System.Diagnostics;
namespace Nodus.Desktop;
public partial class MainWindow : System.Windows.Window
{
    private static readonly Uri Home = new("https://nodus-hq.pages.dev/");
    private static readonly HashSet<string> AllowedHosts = new(StringComparer.OrdinalIgnoreCase) { "nodus-hq.pages.dev", "admin.shopify.com", "accounts.shopify.com", "shopify.com" };
    public MainWindow() { InitializeComponent(); Loaded += async (_, _) => await StartAsync(); }
    private async Task StartAsync()
    {
        try
        {
            await Browser.EnsureCoreWebView2Async();
            var core = Browser.CoreWebView2;
            core.Settings.AreDevToolsEnabled = false;
            core.Settings.IsStatusBarEnabled = false;
            core.Settings.AreDefaultContextMenusEnabled = true;
            core.Settings.IsZoomControlEnabled = true;
            core.NavigationStarting += (_, e) =>
            {
                if (!Uri.TryCreate(e.Uri, UriKind.Absolute, out var uri)) { e.Cancel = true; return; }
                if (uri.Scheme is "mailto" or "tel") { e.Cancel = true; OpenExternal(uri); return; }
                var allowed = AllowedHosts.Contains(uri.Host) || uri.Host.EndsWith(".myshopify.com", StringComparison.OrdinalIgnoreCase);
                if (!allowed) { e.Cancel = true; OpenExternal(uri); }
            };
            core.NewWindowRequested += (_, e) => { e.Handled = true; if (Uri.TryCreate(e.Uri, UriKind.Absolute, out var uri)) OpenExternal(uri); };
            Browser.Source = Home;
        }
        catch
        {
            MessageBox.Show("NODUS could not start. Check your internet connection and confirm Microsoft Edge WebView2 Runtime is installed.", "NODUS startup", MessageBoxButton.OK, MessageBoxImage.Error);
            Close();
        }
    }
    private static void OpenExternal(Uri uri) { try { Process.Start(new ProcessStartInfo(uri.ToString()) { UseShellExecute = true }); } catch { } }
}
