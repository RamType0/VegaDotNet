using System.Text.Json;
using System.Text.Json.Serialization;

namespace Vega.Embed;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum VegaEmbedMode
{
    [JsonStringEnumMemberName("vega")]
    Vega,
    [JsonStringEnumMemberName("vega-lite")]
    VegaLite,
}
