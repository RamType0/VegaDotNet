[![Version](https://img.shields.io/nuget/v/Vega.Embed?logo=nuget&style=flat-square)](https://www.nuget.org/packages/Vega.Embed/)
[![Nuget downloads](https://img.shields.io/nuget/dt/Vega.Embed?label=nuget%20downloads&logo=nuget&style=flat-square)](https://www.nuget.org/packages/Vega.Embed/)  
# [Vega-Embed](https://github.com/vega/vega-embed) integration for Blazor

## Getting started

Install Vega-Embed to your app.

```razor

<!-- Import Vega & Vega-Lite (does not have to be from CDN) -->
    <script src="https://cdn.jsdelivr.net/npm/vega@[VERSION]"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-lite@[VERSION]"></script>
    <!-- Import vega-embed -->
    <script src="https://cdn.jsdelivr.net/npm/vega-embed@[VERSION]"></script>

```


## How to use

```razor

<VegaEmbedView VegaSpecJson="@vegaSpecJson" Options="@embedOptions" />

```