import vegaEmbed, { Result } from 'https://cdn.jsdelivr.net/npm/vega-embed@7.0.2/+esm';
import { IBlazorWeb } from "../TypeScript/blazor";


export function afterWebStarted(blazor: IBlazorWeb) {
    customElements.define("vega-embed-view", class extends HTMLElement {
        static observedAttributes = ["parameters"];


        resultPromise?: Promise<Result>;

        async attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {


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