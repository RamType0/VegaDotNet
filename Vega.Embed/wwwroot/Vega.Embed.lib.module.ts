import { IBlazorWeb } from "../TypeScript/blazor";

import { VisualizationSpec, EmbedOptions, Result } from "vega-embed/build/embed";


declare function vegaEmbed(
    el: HTMLElement | string,
    spec: VisualizationSpec | string,
    opts?: EmbedOptions,
): Promise<Result>;

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