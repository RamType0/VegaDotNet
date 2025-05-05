export function afterWebStarted(blazor) {
    customElements.define("vega-embed-view", class extends HTMLElement {
        static observedAttributes = ["parameters"];
        resultPromise;
        async attributeChangedCallback(name, oldValue, newValue) {
            await this.finalizeCurrentResult();
            if (newValue !== null) {
                const { specJson, specUrl, options } = JSON.parse(newValue);
                let spec = specJson === null ? undefined : JSON.parse(specJson);
                spec ??= specUrl;
                this.resultPromise = vegaEmbed(this, spec, options);
            }
        }
        disconnectedCallback() {
            return this.finalizeCurrentResult();
        }
        async finalizeCurrentResult() {
            const resultPromise = this.resultPromise;
            if (resultPromise !== undefined) {
                this.resultPromise = undefined;
                const result = await resultPromise;
                result.finalize();
            }
        }
    });
}
//# sourceMappingURL=Vega.Embed.lib.module.js.map