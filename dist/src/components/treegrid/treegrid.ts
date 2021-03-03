/* eslint-disable no-prototype-builtins */
/* eslint-disable import/extensions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { customElement, html, LitElement, property, query } from 'lit-element';
import { TGRID_EVENTS } from './treegrid-events';
/**
 * AdvsTreeGrid Element wraps TreeGrid from COQSoft
 * This component sets events for TreeGrid and dispatches custom events
 *
 * @extends AdventElement
 */

@customElement('ac-treegrid')
export default class AdvsTreeGrid extends LitElement {
    Grid: TTGrid | undefined;
    treegridSourceParam: any;
    _data: any[] = [];
    _layout: any;
    _stylePrefix = 'AG';
    _disabled = false;
    @query('.tree-grid') gridRef: HTMLElement | undefined;

    @property({ type: String }) relativeSourceUrl = 'src/components/treegrid/TreeGridSource';
    @property({ type: String }) gridId!: string;
    @property({ type: Object }) defaults: any;
    @property({ type: String }) status = 'LOADING';

    @property({ type: Array })
    public set data(val) {
        if (this._data !== val) {
            this._data = val;
            this.bindData();
            this.requestUpdate();
        }
    }

    public get data() {
        return this._data;
    }

    @property({ type: Object })
    public set layout(val) {
        if (val) {
            this._layout = val;
            !this.Grid && this.initGrid();
            this.requestUpdate();
        }
    }

    public get layout() {
        return this._layout;
    }

    @property({ type: String })
    public set stylePrefix(val) {
        if (this._stylePrefix !== val) {
            this._stylePrefix = val;
            this.Grid && this.Grid.SetStyle(val, '', '', '', true);
            this.requestUpdate();
        }
    }

    public get stylePrefix() {
        return this._stylePrefix;
    }

    /**
     * Disable Grid
     */
    @property({ type: Boolean })
    public set disabled(val) {
        if (val !== this.disabled) {
            this._disabled = val;
            /** Disable the grid if already initialized */
            this.Grid && this.setGridState();
        }
    }
    public get disabled() {
        return this._disabled;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback();
        !this.gridId && console.error('gridId must be defined');
        this.initGridApi();
    }

    /** Need to wait until the first render in order to init the grid */
    firstUpdated() {
        this.layout && this.initGrid();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.Grid?.Dispose();
    }

    /**
     * Init Grid Api
     * Dispatch static events. For examples returning values, see genesis-treegrid-view
     */
    initGridApi() {
        /**
         * Override OnSort to provide our own sorting
         * Think about refactoring this.
         * */

        // TGRID_EVENTS.forEach((ev: keyof TGridsApi) => {
        //     if (!TGGetEvent(ev, this.gridId, this.gridId)) {
        //         TGSetEvent<TGridsApi[typeof ev]>(ev, this.gridId, (...args) => {
        //             const e = {
        //                 detail: args,
        //                 bubbles: true,
        //             };
        //             if (!this.disabled) {
        //                 this.dispatchEvent(new CustomEvent(ev, e));
        //                 if ((<any>e.detail).hasOwnProperty('returnVal')) {
        //                     return (<any>e.detail).returnVal;
        //                 }
        //             }
        //         });
        //     }
        // });
        TGRID_EVENTS.forEach((ev: keyof TGridsApi) => {
            if (!TGGetEvent(ev, this.gridId, this.gridId)) {
                TGSetEvent<TGridsApi[typeof ev]>(ev, this.gridId, (...args: []) => {
                    const e = {
                        detail: args,
                        bubbles: true,
                    };
                    if (!this.disabled) {
                        this.dispatchEvent(new CustomEvent(ev, e));
                        if ((<any>e.detail).hasOwnProperty('returnVal')) {
                            return (<any>e.detail).returnVal;
                        }
                    }
                });
            }
        });
    }

    /**
     * Init the grid with layout, data, defaults, base
     * TODO: Refactor to support JSON Text, Defaults, Base
     */

    initGrid() {
        this.treegridSourceParam = {
            Layout: {
                Data: this.layout,
            },
            Data: {
                Data: {
                    Body: [],
                },
                Url: '//',
            },
            Page: {
                Url: '//',
            },
            Base: {
                Url: `${this.relativeSourceUrl}/Base.json`,
            },
            DebugTag: 'Debug',
        };
        if (this.data) {
            this.treegridSourceParam.Data.Data.Body = [this.data];
        }

        // this.Grid = TreeGrid(this.treegridSourceParam, this.gridId);
        this.Grid = TreeGrid(this.treegridSourceParam, this.gridRef) as TTGrid;
    }

    setGridState() {
        if (this.disabled) {
            this.Grid?.Disable();
            this.Grid?.SelectAllRows(0);
            this.Grid!.Selecting = false;
        } else {
            this.Grid?.Enable();
            this.Grid!.Selecting = true;
        }
        this.dispatchEvent(
            new CustomEvent('OnReloadBody', {
                detail: [this.Grid],
                bubbles: true,
            })
        );
    }

    bindData() {
        if (this.Grid) {
            this.Grid.Source.Data.Data.Body = [this.data];
            this.Grid.ReloadBody(this.setGridState.bind(this));
        }
    }

    /**
     * Listens for genesis-component change event and dispatches treegrid event retargeted.
     * This is so we get the Grid property in the target property of the event.
     * @param event
     */
    handleChange({ detail, target }: { detail: any; target: HTMLInputElement }) {
        this.dispatchEvent(
            new CustomEvent('OnChange', {
                detail: { detail, target },
                bubbles: true,
            })
        );
    }

    renderLoadingSpinner() {
        return html`
            <div style="max-width: 10rem; text-align:center; margin: 20rem auto;">
                <awc-circular-progress indeterminate></awc-circular-progress>
            </div>
        `;
    }

    render() {
        return html`
            ${this.status === 'LOADING' ? this.renderLoadingSpinner() : ''}
            <div
                ?hidden=${this.status === 'LOADING'}
                id=${this.gridId}
                class="tree-grid"
                style="width: 100%;"
                @change=${this.handleChange}
            ></div>
        `;
    }
}
