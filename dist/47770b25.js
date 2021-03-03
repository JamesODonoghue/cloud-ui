import{c as i,L as a,h as s,_ as e,p as o,a as t}from"./dce93201.js";let c;const n=i(c||(c=(i=>i)`:host{display:block;overflow:auto;height:100%;width:100%;position:absolute}:host .firm-settings{padding:var(--size-padding-base);padding-bottom:calc(var(--size-padding-xxl) * 4)}:host .firm-settings awc-switch{margin-right:var(--size-padding-small)}:host .firm-settings__title{font-size:var(--size-font-xxl);font-weight:300}:host .firm-settings .form-section{display:flex;margin-top:var(--size-padding-large);border-top:1px solid var(--color-border-base);padding-top:var(--size-padding-large);flex-direction:column}:host .firm-settings .form-section__label{min-width:calc(var(--size-padding-xxl) * 4);font-weight:700;margin-bottom:var(--size-padding-large)}:host .firm-settings .form-section__main{display:flex;flex-wrap:wrap}:host .firm-settings .form-section__main__input{margin-bottom:var(--size-padding-base);width:100%}:host .firm-settings .form-section__main__input__subtitle{margin-left:var(--size-padding-xxl);margin-top:calc(var(--size-padding-base) * -1);color:var(--color-font-tertiary)}:host .firm-settings .form-section__main__input__switch-subtitle{margin-left:var(--size-padding-xxl);color:var(--color-font-tertiary)}:host .firm-settings .form-section__main__input--select{width:100%;margin-bottom:var(--size-padding-base)}:host .firm-settings .form-section__main__input--checkbox{width:100%}:host .firm-settings .form-section__main__input--label{margin-left:var(--size-padding-base)}@media (min-width:600px){:host .firm-settings .form-section{flex-direction:row}:host .firm-settings .form-section__label{min-width:calc(var(--size-padding-xxl) * 4);text-align:right;margin-right:var(--size-padding-base)}:host .firm-settings .form-section__main__input{margin-right:var(--size-padding-large);width:calc(var(--size-padding-xxl) * 8)}:host .firm-settings .form-section__main__input--select{margin-right:var(--size-padding-large);width:calc(var(--size-padding-xxl) * 6)}}`));let l,r,d=i=>i,m=class extends a{constructor(){super(...arguments),this.snackbarOpen=!1}static get styles(){return i(l||(l=d`
            ${0}
        `),n)}render(){return s(r||(r=d` <awc-snackbar ?open="${0}" labelText="Changes saved!" @MDCSnackbar:closed="${0}"></awc-snackbar> <div class="firm-settings" @change="${0}"> <div class="firm-settings__title">Firm Settings</div> <div class="form-section"> <div class="form-section__label">Display Settings</div> <div class="form-section__main"> <div class="form-section__main__input--select"> <ac-combo-box .options="${0}" label="Currency"></ac-combo-box> </div> <div class="form-section__main__input--select"> <ac-combo-box .options="${0}" label="Locale"></ac-combo-box> </div> </div> </div> <div class="form-section"> <div class="form-section__label">Time Zone Settings</div> <div class="form-section__main"> <div class="form-section__main__input--select"> <ac-combo-box .options="${0}" label="Locale"></ac-combo-box> </div> </div> </div> <div class="form-section"> <div class="form-section__label">Session Settings</div> <div class="form-section__main"> <div class="form-section__main__input"> <div> <awc-formfield label="Use Tolerance" spaceBetween> <awc-switch checked="checked"></awc-switch> </awc-formfield> <div class="form-section__main__input__switch-subtitle"> Trade when positions fall outside of low and high limits. </div> </div> <div> <awc-formfield label="Out of tolerance only"> <awc-radio value="out_of_tolerance" name="tolerance-bands" checked="checked"></awc-radio> </awc-formfield> <div class="form-section__main__input__subtitle">Positions in tolerance will not be traded.</div> </div> <div> <awc-formfield label="Top down"> <awc-radio value="top_down" name="tolerance-bands"></awc-radio> </awc-formfield> <div class="form-section__main__input__subtitle"> Hierarchical models only. Children out of tolerance will not be traded if their parent is in tolerance. </div> </div> </div> </div> </div> <div class="form-section"> <div class="form-section__label">Household Settings</div> <div class="form-section__main"> <div class="form-section__main__input"> <awc-formfield label="Asset location by currency"> <awc-switch></awc-switch> </awc-formfield> <div class="form-section__main__input__switch-subtitle"> Trade when positions fall outside of low and high limits. </div> </div> <div class="form-section__main__input"> <awc-formfield label="Allow account-level Portfolio Cash to go negative"> <awc-switch></awc-switch> </awc-formfield> <div class="form-section__main__input__switch-subtitle"> Trade when positions fall outside of low and high limits. </div> </div> </div> </div> <div class="form-section"> <div class="form-section__label">Settle Currency</div> <div class="form-section__main"> <div class="form-section__main__input"> <div> <awc-formfield label="Local Currency"> <awc-radio value="local" name="currency" checked="checked"></awc-radio> </awc-formfield> </div> <div> <awc-formfield label="Portfolio Base Currency"> <awc-radio value="portfolio" name="currency"></awc-radio> </awc-formfield> </div> </div> </div> </div> <div class="form-section"> <div class="form-section__label">Cash Grouping</div> <div class="form-section__main"> <div class="form-section__main__input"> <awc-formfield label="Group portfolio cash"> <awc-switch></awc-switch> </awc-formfield> <div class="form-section__main__input__switch-subtitle">Aggregate cash positions into "Portfolio Cash".</div> </div> <div class="form-section__main__input"> <awc-formfield label="Group tradable and valuation"> <awc-switch></awc-switch> </awc-formfield> <div class="form-section__main__input__switch-subtitle">Group cash into tradable and valuation categories.</div> </div> <div class="form-section__main__input"> <awc-formfield label="Include cash equivalents"> <awc-switch></awc-switch> </awc-formfield> <div class="form-section__main__input__switch-subtitle"> Include cash equivalents in the portfolio's cash value. </div> </div> </div> </div> <div class="form-section"> <div class="form-section__label">Orders Time in Force</div> <div class="form-section__main"> <div class="form-section__main__input--select"> <ac-combo-box .options="${0}" label="Time in force"></ac-combo-box> </div> </div> </div> <div class="form-section"> <div class="form-section__label">Order Blocking</div> <div class="form-section__main"> <div class="form-section__main__input--label">Block by</div> <div class="form-section__main__input--checkbox"> <awc-formfield label="Custodian"> <awc-checkbox></awc-checkbox> </awc-formfield> </div> <div class="form-section__main__input--checkbox"> <awc-formfield label="Broker"> <awc-checkbox></awc-checkbox> </awc-formfield> </div> <div class="form-section__main__input--checkbox"> <awc-formfield label="Session"> <awc-checkbox></awc-checkbox> </awc-formfield> </div> </div> </div> </div> `),this.snackbarOpen,(()=>this.snackbarOpen=!1),(()=>this.snackbarOpen=!0),["USD","YEN","AUD","SEK"],["Dutch (Netherlands)","English (Canada)","English (United Kingdom)","English (United States)","French (Canada)","Norweigian (Norway)","Swedish"],["Pacific Standard Time","Atlantic Standard Time","Central Standard Time","Eastern Standard Time"],["DAY","GTC","FOK","ITC"])}};e([o({type:Boolean})],m.prototype,"snackbarOpen",void 0),m=e([t("ac-firm-settings")],m);export{m as FirmSettings};
