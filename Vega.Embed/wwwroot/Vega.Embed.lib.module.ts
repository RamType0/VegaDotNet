﻿import { vegaEmbed, Result } from "./lib/vegaEmbed.js";
import { Mutex } from "./lib/asyncMutex.js";
import { IBlazorWeb } from "../TypeScript/blazor";

export function afterWebStarted(blazor: IBlazorWeb) {
    customElements.define("static-vega-embed-view", class extends HTMLElement {
        static observedAttributes = ["parameters"];

        mutex: Mutex = new Mutex();
        result?: Result;
        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {

            return this.mutex.runExclusive(async () => {
                this.finalizeCurrentResult();

                if (newValue !== null) {
                    let { specJson, specUrl, options } = JSON.parse(newValue);


                    let spec = specJson === null ? undefined : JSON.parse(specJson);
                    spec ??= specUrl;
                    options ??= undefined;
                    this.result = await vegaEmbed(this, spec, options);
                }
            });
        }

        disconnectedCallback() {
            return this.mutex.runExclusive(async () => {
                this.finalizeCurrentResult();
            });
        }


        finalizeCurrentResult() {
            if (this.result !== undefined) {
                this.result.finalize();
                this.result = undefined;
            }
        }
    });

}