import{c as s,L as e,h as a,_ as r,a as i}from"./dce93201.js";let d;const l=s(d||(d=(s=>s)``));let c,t,o,_,m=s=>s,v=class extends e{static get styles(){return s(c||(c=m`
            ${0}
        `),l)}createRenderRoot(){return this}render(){return a(t||(t=m`<ac-detail-screen>
            <div slot="title">
                <div class="session-detail__screen-header">
                    <div class="session-detail__screen-header__title">Orders</div>
                </div>
            </div>
            <div slot="actions">
                <awc-button label="Approve All" primary></awc-button>
            </div>
            <div slot="main">
                <div>
                    <div class="session-summary-orders-header">
                        <div class="orders-summary__item">
                            <div class="orders-summary__item__label">Buys</div>
                            <!-- <div class="orders-summary__item__value--buys">6</div> -->
                            <div class="orders-summary__item__value--buys"><awc-icon>arrow_circle_up</awc-icon> 6</div>
                            <!-- <div class="orders-summary__item__value--buys">
                                    <awc-button icon="arrow_circle_up" dense>6</awc-button>
                                </div> -->
                        </div>
                        <div class="orders-summary__item">
                            <div class="orders-summary__item__label">Sells</div>
                            <!-- <div class="orders-summary__item__value--sells">3</div> -->
                            <div class="orders-summary__item__value--sells"><awc-icon>arrow_circle_down</awc-icon> 6</div>
                        </div>
                        <div class="orders-summary__item">
                            <div class="orders-summary__item__label">Violations</div>
                            <div class="orders-summary__item__value--violations">
                                <awc-icon>flag</awc-icon>
                                6
                            </div>
                        </div>
                        <div class="orders-summary__item">
                            <div class="orders-summary__item__label">Exclusions</div>
                            <div class="orders-summary__item__value--exclusions">
                                <awc-icon>report</awc-icon>
                                3
                            </div>
                        </div>
                        <div class="orders-summary__item">
                            <div class="orders-summary__item__label">Warnings</div>
                            <div class="orders-summary__item__value--warnings">
                                <awc-icon>warning</awc-icon>
                                6
                            </div>
                        </div>
                        <div class="orders-summary__item">
                            <div class="orders-summary__item__label">Errors</div>
                            <div class="orders-summary__item__value--errors">
                                <awc-icon>error</awc-icon>
                                3
                            </div>
                        </div>
                    </div>
                    <!-- <ac-grid-with-filters
                                viewId="portfolios"
                                offset=${0}
                                .renderMessageArea=${0}
                                .gridStyles=${0}
                            ></ac-grid-with-filters> -->
                    <div class="session-summary-orders__main">
                        <ac-grid-with-filters
                            viewId="portfolios"
                            offset=${0}
                            .renderMessageArea=${0}
                        ></ac-grid-with-filters>
                    </div>
                </div>
            </div>
        </ac-detail-screen>`),"2rem",(({handleSelectAll:s,selectAllLabel:e})=>a(o||(o=m` <ac-grid-message-area @select-all="${0}" .buttonLabel="${0}" areaMessage="0 rows selected"></ac-grid-message-area> `),s,e)),{position:"absolute",width:"calc(100% - var(--size-padding-base)*2)",height:"unset",bottom:"unset"},"2rem",(({handleSelectAll:s,selectAllLabel:e})=>a(_||(_=m` <div class="session-summary-portfolios__message-area"> <ac-grid-message-area @select-all="${0}" .buttonLabel="${0}" areaMessage="0 rows selected"></ac-grid-message-area> </div> `),s,e)))}};v=r([i("ac-session-summary-orders")],v);export{v as SessionSummaryOrders};
