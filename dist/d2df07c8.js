import{L as s,h as e,_ as i,p as r,a}from"./dce93201.js";let d,o,t,l=s=>s,m=class extends s{constructor(){super(...arguments),this.status="DONE",this.expandGrid=!1}createRenderRoot(){return this}connectedCallback(){super.connectedCallback()}renderLoadingSpinner(){return e(d||(d=l` <div style="width:100%;text-align:center;padding:20rem 0 0 0;margin:auto"> <awc-circular-progress indeterminate></awc-circular-progress> </div> `))}handleChange(s){this.expandGrid=!this.expandGrid,this.dispatchEvent(new CustomEvent("expandGrid",{detail:{checked:this.expandGrid},composed:!0,bubbles:!0}))}renderOrderSummary(){return e(o||(o=l` <div class="orders-summary"> <div class="orders-summary__item"> <div class="orders-summary__item__label">Completion Status</div> <div class="orders-summary__item__value--orders-proposed">Orders Proposed</div> </div> <div class="orders-summary__item"> <div class="orders-summary__item__label">Review Status</div> <div class="orders-summary__item__value--review-status">Edited</div> </div> <div class="orders-summary__item"> <div class="orders-summary__item__label">Approval Status</div> <div class="orders-summary__item__value">Partially Approved</div> </div> <div class="orders-summary__item"> <div class="orders-summary__item__label">Buys</div> <div class="orders-summary__item__value--buys"><awc-icon>arrow_circle_up</awc-icon> 6</div> </div> <div class="orders-summary__item"> <div class="orders-summary__item__label">Sells</div> <div class="orders-summary__item__value--sells"><awc-icon>arrow_circle_down</awc-icon> 6</div> </div> <div class="orders-summary__item"> <div class="orders-summary__item__label">Cash Instructions</div> <div style="display:flex"> <div class="orders-summary__item__value--invest">1 Invest</div> <div class="orders-summary__item__value--raise">1 Raise</div> </div> </div> <div class="orders-summary__item"> <div class="orders-summary__item__label">Violations</div> <div class="orders-summary__item__value--violations"> <awc-icon>flag</awc-icon> 6 </div> </div> <div class="orders-summary__item"> <div class="orders-summary__item__label">Exclusions</div> <div class="orders-summary__item__value--exclusions"> <awc-icon>report</awc-icon> 3 </div> </div> <div class="orders-summary__item"> <div class="orders-summary__item__label">Warnings</div> <div class="orders-summary__item__value--warnings"> <awc-icon>warning</awc-icon> 6 </div> </div> <div class="orders-summary__item"> <div class="orders-summary__item__label">Errors</div> <div class="orders-summary__item__value--errors"> <awc-icon>error</awc-icon> 3 </div> </div> <div class="orders-summary__item"> <div class="orders-summary__item__label">Model Name</div> <div class="orders-summary__item__value--model-name"> <awc-icon style="margin-right:var(--size-padding-small);color:var(--color-base-red-600)">not_interested</awc-icon> 1234 Kenso Model </div> </div> <div class="orders-summary__item"> <div class="orders-summary__item__label">Investable MV</div> <div class="orders-summary__item__value--investable"> <awc-icon style="margin-right:var(--size-padding-small);color:var(--color-base-green-700)">cached</awc-icon> 8,415,902.11 </div> </div> </div> `))}render(){switch(this.status){case"LOADING":return this.renderLoadingSpinner();default:return e(t||(t=l`
                    <div class="portfolio-session-orders">
                        <div class="portfolio-session-orders__summary-title">
                            <awc-icon-button-toggle
                                onIcon="chevron_right"
                                offIcon="expand_more"
                                .on=${0}
                                @click=${0}
                            ></awc-icon-button-toggle>
                            <button @click=${0}>Orders Summary</button>
                        </div>
                        ${0}
                        <div class="portfolio-session-orders__main">
                            <div class="portfolio-session-orders__main__filters">
                                <awc-multi-select label="Group By"></awc-multi-select>
                                <div style="display: flex; align-items:center;">
                                    <!-- <awc-formfield label="Collapse header" alignEnd>
                                        <mwc-checkbox .checked=${0} @change=${0}></mwc-checkbox>
                                    </awc-formfield> -->
                                    <awc-icon-button icon="settings"></awc-icon-button>
                                </div>
                            </div>
                            <ac-grid-with-filters viewId="portfolios" offset=${0}></ac-grid-with-filters>
                        </div>
                    </div>
                `),this.expandGrid,this.handleChange.bind(this),this.handleChange.bind(this),this.expandGrid?"":this.renderOrderSummary(),this.expandGrid,this.handleChange.bind(this),"2rem")}}};i([r()],m.prototype,"status",void 0),i([r({type:Boolean})],m.prototype,"expandGrid",void 0),m=i([a("ac-portfolio-session-orders")],m);export{m as PortfolioSessionOrders};
