using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using System.Text.Json.Nodes;
using System.Text.Json;

namespace Vega.Embed.Components;
partial class InteractiveVegaEmbedView : IAsyncDisposable
{
    [Inject]
    private IJSRuntime JsRuntime { get; set; } = null!;
    [Parameter]
    public string? SpecJson { get; set; }
    [Parameter]
    public Uri? SpecUrl { get; set; }
    [Parameter]
    public EmbedOptions? Options { get; set; }

    Lazy<Task<IJSObjectReference>> moduleTask = null!;

    ElementReference div;
    IAsyncDisposable? vegaEmbedResult;
    SemaphoreSlim semaphore = new(1);

    protected override void OnInitialized()
    {
        moduleTask = new(() => JsRuntime.InvokeAsync<IJSObjectReference>(
                "import", "./_content/Vega.Embed/Components/InteractiveVegaEmbedView.razor.js").AsTask());
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await semaphore.WaitAsync();
        try
        {
            await FinalizeCurrentResultAsync();
            if (SpecJson is not null)
            {
                var spec = JsonSerializer.Deserialize<JsonObject>(SpecJson) ?? throw new FormatException($"{nameof(SpecJson)} represents null.");
                vegaEmbedResult = await VegaEmbedAsync(div, spec, Options);
            }
            else if (SpecUrl is not null)
            {
                vegaEmbedResult = await VegaEmbedAsync(div, SpecUrl, Options);
            }
            else
            {
                throw new ArgumentException($"Either {nameof(SpecJson)} or {nameof(SpecUrl)} must be provided.");

            }
        }
        finally
        {
            semaphore.Release();
        }
        
    }
    ValueTask<IAsyncDisposable> VegaEmbedAsync(ElementReference el, JsonObject spec, EmbedOptions? opts = null, CancellationToken cancellationToken = default)
    {
        object?[] args = opts is null ? [el, spec] : [el, spec, opts];
        return VegaEmbedAsync(args, cancellationToken);
    }
    ValueTask<IAsyncDisposable> VegaEmbedAsync(ElementReference el, Uri spec, EmbedOptions? opts = null, CancellationToken cancellationToken = default)
    {
        object?[] args = opts is null ? [el, spec] : [el, spec, opts];
        return VegaEmbedAsync(args, cancellationToken);
    }

    private async ValueTask<IAsyncDisposable> VegaEmbedAsync(object?[] args, CancellationToken cancellationToken)
    {
        var module = await moduleTask.Value;
        var jsResult = await module.InvokeAsync<IJSObjectReference>("vegaEmbed", cancellationToken, args);
        return new Result(jsResult);
    }

    public ValueTask FinalizeCurrentResultAsync()
    {
        if (vegaEmbedResult is not null)
        {
            var vegaEmbedResult = this.vegaEmbedResult;
            this.vegaEmbedResult = null;
            return vegaEmbedResult.DisposeAsync();
        }
        else
        {
            return new();
        }
    }
    public async ValueTask DisposeAsync()
    {
        await semaphore.WaitAsync();
        try
        {
            try
            {
                await FinalizeCurrentResultAsync();
                if (moduleTask.IsValueCreated)
                {
                    var module = await moduleTask.Value;
                    await module.DisposeAsync();
                }
            }
            catch (JSDisconnectedException)
            {
            }
        }
        finally
        {
            semaphore.Release();
            semaphore.Dispose();
        }
    }
}
