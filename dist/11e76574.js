import{c as e,L as s,h as a,_ as t,a as r}from"./dce93201.js";let l;const i=e(l||(l=(e=>e)``));let d,n,c,o,v=e=>e,g=class extends s{static get styles(){return e(d||(d=v`
            ${0}
        `),i)}createRenderRoot(){return this}render(){return a(n||(n=v` <ac-detail-screen> <div slot="title"> <div class="session-detail__screen-header"> <div class="session-detail__screen-header__title">Alerts</div> </div> </div> <div slot="actions"> <div style="text-align:center"> <awc-button label="Approve All" primary></awc-button> </div> </div> <div slot="main"> <div class="session-summary-alerts__main"> <ac-grid-with-filters viewId="session-alerts" offset="${0}" .renderMessageArea="${0}" .renderFilters="${0}"></ac-grid-with-filters> </div> </div> </ac-detail-screen> `),"2rem",(({handleSelectAll:e,selectAllLabel:s})=>a(c||(c=v` <div class="session-summary-alerts__message-area"> <ac-grid-message-area @select-all="${0}" .buttonLabel="${0}" areaMessage="0 rows selected"></ac-grid-message-area> </div> `),e,s)),(({handleFilterChange:e,handleSearchChange:s,filters:t})=>a(o||(o=v` <ac-filter-panel .filters="${0}" @search-change="${0}" @filter-change="${0}"></ac-filter-panel> `),t,s,e)))}};g=t([r("ac-session-summary-alerts")],g);export{g as SessionSummaryAlerts};
