import{L as e,h as s,_ as a,a as r}from"./dce93201.js";let i,l,d,t,o=e=>e;const m={};let c=class extends e{createRenderRoot(){return this}render(){return s(i||(i=o`
            <ac-detail-screen>
                <div slot="title">
                    <div class="session-detail__screen-header">
                        <div class="session-detail__screen-header__title">Portfolios</div>
                    </div>
                </div>
                <div slot="actions">
                    <awc-button label="Approve All" primary></awc-button>
                </div>
                <div slot="main">
                    <div class="session-summary-portfolios-header">
                        <div class="orders-summary__item">
                            <div class="orders-summary__item__label">Orders Proposed</div>
                            <div class="orders-summary__item__value">1</div>
                        </div>
                        <div class="orders-summary__item">
                            <div class="orders-summary__item__label">No Orders Proposed</div>
                            <div class="orders-summary__item__value">0</div>
                        </div>
                        <div class="orders-summary__item">
                            <div class="orders-summary__item__label">Created</div>
                            <div class="orders-summary__item__value">0</div>
                        </div>
                        <div class="orders-summary__item">
                            <div class="orders-summary__item__label">Failed</div>
                            <div class="orders-summary__item__value">0</div>
                        </div>
                    </div>
                    <!-- <ac-grid-with-filters
                                viewId="portfolios"
                                offset=${0}
                                .renderMessageArea=${0}
                                .gridStyles=${0}
                            ></ac-grid-with-filters> -->
                    <div class="session-summary-portfolios__main">
                        <ac-grid-with-filters
                            viewId="session-portfolios"
                            .gridStyles=${0}
                            .renderMessageArea=${0}
                            .renderFilters=${0}
                        ></ac-grid-with-filters>
                    </div>
                </div>
            </ac-detail-screen>
        `),"2rem",(({handleSelectAll:e,selectAllLabel:a})=>s(l||(l=o` <ac-grid-message-area @select-all="${0}" .buttonLabel="${0}" areaMessage="0 rows selected"></ac-grid-message-area> `),e,a)),{position:"absolute",width:"calc(100% - var(--size-padding-base)*2)",height:"unset",bottom:"unset"},m,(({handleSelectAll:e,selectAllLabel:a})=>s(d||(d=o` <div class="session-summary-portfolios__message-area"> <ac-grid-message-area @select-all="${0}" .buttonLabel="${0}" areaMessage="0 rows selected"></ac-grid-message-area> </div> `),e,a)),(({handleFilterChange:e,handleSearchChange:a,filters:r})=>s(t||(t=o` <ac-filter-panel .filters="${0}" @search-change="${0}" @filter-change="${0}"></ac-filter-panel> `),r,a,e)))}};c=a([r("ac-session-summary-portfolios")],c);export{c as SessionSummaryPortfolios};
