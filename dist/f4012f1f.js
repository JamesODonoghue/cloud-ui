import{c as e,L as a,h as n,_ as t,p as s,a as i}from"./dce93201.js";let o;const r=e(o||(o=(e=>e)`:host awc-drawer{position:fixed;width:100%}:host awc-drawer awc-icon-button{color:var(--color-font-tertiary)}:host awc-drawer awc-icon-button.active{color:var(--color-brand-primary-dark)}:host .session-summary__panel-icon{display:flex;justify-content:space-between;align-items:center;padding:0 var(--size-padding-base);font-size:var(--size-font-large)}:host .mini-drawer{--mdc-drawer-width:var(--size-padding-xxl)}`));let c,d,l,w,h=e=>e,p=class extends a{constructor(){super(...arguments),this.viewId="session-summary",this.drawerOpen=!1,this.currentLocation=""}handleOpenDrawer(){this.drawerOpen=!this.drawerOpen}static get styles(){return e(c||(c=h`
            ${0}
        `),r)}handleNavigate(e){this.currentLocation=e.detail.location.pathname}connectedCallback(){super.connectedCallback(),this.currentLocation=window.location.pathname,window.addEventListener("vaadin-router-location-changed",this.handleNavigate.bind(this))}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("vaadin-router-location-changed",this.handleNavigate)}render(){return n(d||(d=h` ${0} `),this.drawerOpen?n(l||(l=h` <awc-drawer type="dismissible" ?open="${0}" @MDCDrawer:closed="${0}"> <div class="session-summary__panel-icon"> <div>Summary</div> <awc-icon-button .icon="${0}" @click="${0}"></awc-icon-button> </div> <ac-session-summary-panel .currentLocation="${0}"></ac-session-summary-panel> <div slot="appContent"> <slot></slot> </div> </awc-drawer> `),this.drawerOpen,(()=>this.drawerOpen=!1),this.drawerOpen?"chevron_left":"chevron_right",this.handleOpenDrawer.bind(this),this.currentLocation):n(w||(w=h`
                      <awc-drawer
                          class="mini-drawer"
                          type="dismissible"
                          ?open=${0}
                          @MDCDrawer:closed=${0}
                      >
                          <awc-icon-button
                              class="session-summary__mini-drawer-icon"
                              .icon=${0}
                              @click=${0}
                          ></awc-icon-button>

                          <div>
                              <a href="sessions/12345/portfolios">
                                  <awc-icon-button
                                      class="${0}"
                                      icon="work_outline"
                                  ></awc-icon-button>
                              </a>
                              <a href="sessions/12345/alerts">
                                  <awc-icon-button
                                      class="${0}"
                                      icon="warning"
                                  ></awc-icon-button>
                              </a>
                              <a href="sessions/12345/orders">
                                  <awc-icon-button
                                      class="${0}"
                                      icon="list_view"
                                  ></awc-icon-button>
                              </a>
                          </div>
                          <!-- <ac-session-summary-panel .currentLocation=${0}></ac-session-summary-panel> -->
                          <div slot="appContent">
                              <slot></slot>
                          </div>
                      </awc-drawer>
                  `),!this.drawerOpen,(()=>this.drawerOpen=!1),this.drawerOpen?"chevron_left":"chevron_right",this.handleOpenDrawer.bind(this),"/sessions/12345/portfolios"===this.currentLocation?"active":"","/sessions/12345/alerts"===this.currentLocation?"active":"","/sessions/12345/orders"===this.currentLocation?"active":"",this.currentLocation))}};t([s()],p.prototype,"viewId",void 0),t([s({type:Boolean})],p.prototype,"drawerOpen",void 0),t([s()],p.prototype,"currentLocation",void 0),p=t([i("ac-session-summary")],p);export{p as SessionSummary};
