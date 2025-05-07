import vegaEmbed, { Result } from "vega-embed";
import { Mutex } from "await-semaphore";
import { IBlazorWeb } from "../TypeScript/blazor";

export function afterWebStarted(blazor: IBlazorWeb) {
    customElements.define("static-vega-embed-view", class extends HTMLElement {
        static observedAttributes = ["parameters"];

        mutex: Mutex = new Mutex();
        result?: Result;
        componentId?: string;
        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {

            return this.mutex.use(async () => {
                this.finalizeCurrentResult();

                if (newValue !== null) {
                    const { componentid, specJson, specUrl, options } = JSON.parse(newValue);

                    this.componentId = componentid;

                    let spec = specJson === null ? undefined : JSON.parse(specJson);
                    spec ??= specUrl;
                    this.result = await vegaEmbed(this, spec, options);
                }
            });
        }

        disconnectedCallback() {
            return this.mutex.use(async () => {
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