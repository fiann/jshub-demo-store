/**
*
* By Marco van Hylckama Vlieg (marco@i-marco.nl)
*
* THIS IS A WORK IN PROGRESS
*
* Many, many thanks go out to Daniel Satyam Barreiro!
* Please read his article about YUI widget development
* http://yuiblog.com/blog/2008/06/24/buildingwidgets/
* Without his excellent help and advice this widget would not
* be half as good as it is now.
*/
(function(){var g=YAHOO.util.Dom,f=YAHOO.util.Event,j=YAHOO.util.Anim;var a=function(m,l){m=g.get(m);l=l||{};if(!m){m=document.createElement(this.CONFIG.TAG_NAME)}if(m.id){l.id=m.id}YAHOO.widget.AccordionView.superclass.constructor.call(this,m,l);this.initList(m,l);this.refresh(["id","width","hoverActivated"],true)};var d="panelClose";var e="panelOpen";var b="afterPanelClose";var k="afterPanelOpen";var c="stateChanged";var h="beforeStateChange";YAHOO.widget.AccordionView=a;YAHOO.extend(a,YAHOO.util.Element,{initAttributes:function(l){a.superclass.initAttributes.call(this,l);var m=(YAHOO.env.modules.animation)?true:false;this.setAttributeConfig("id",{writeOnce:true,validator:function(n){return(/^[a-zA-Z][\w0-9\-_.:]*$/.test(n))},value:g.generateId(),method:function(n){this.get("element").id=n}});this.setAttributeConfig("width",{value:"400px",method:function(n){this.setStyle("width",n)}});this.setAttributeConfig("animationSpeed",{value:0.7});this.setAttributeConfig("animate",{value:m,validator:YAHOO.lang.isBoolean});this.setAttributeConfig("collapsible",{value:false,validator:YAHOO.lang.isBoolean});this.setAttributeConfig("expandable",{value:false,validator:YAHOO.lang.isBoolean});this.setAttributeConfig("effect",{value:YAHOO.util.Easing.easeBoth,validator:YAHOO.lang.isString});this.setAttributeConfig("hoverActivated",{value:false,validator:YAHOO.lang.isBoolean,method:function(n){if(n){f.on(this,"mouseover",this._onMouseOver,this,true)}else{f.removeListener(this,"mouseover",this._onMouseOver)}}});this.setAttributeConfig("_hoverTimeout",{value:500,validator:YAHOO.lang.isInteger})},CONFIG:{TAG_NAME:"UL",ITEM_WRAPPER_TAG_NAME:"LI",CONTENT_WRAPPER_TAG_NAME:"DIV"},CLASSES:{ACCORDION:"yui-accordionview",PANEL:"yui-accordion-panel",TOGGLE:"yui-accordion-toggle",CONTENT:"yui-accordion-content",ACTIVE:"active",HIDDEN:"hidden",INDICATOR:"indicator"},_idCounter:"1",_hoverTimer:null,_panels:null,_opening:false,_closing:false,_ff2:(YAHOO.env.ua.gecko>0&&YAHOO.env.ua.gecko<1.9),_ie:(YAHOO.env.ua.ie<8&&YAHOO.env.ua.ie>0),_ARIACapable:(YAHOO.env.ua.ie>7||YAHOO.env.ua.gecko>=1.9),initList:function(p,l){g.addClass(p,this.CLASSES.ACCORDION);this._setARIA(p,"role","tree");var o=[];var r=p.getElementsByTagName(this.CONFIG.ITEM_WRAPPER_TAG_NAME);for(var n=0;n<r.length;n++){if(g.hasClass(r[n],"nopanel")){o.push({label:"SINGLE_LINK",content:r[n].innerHTML.replace(/^\s\s*/,"").replace(/\s\s*$/,"")})}else{if(r[n].parentNode===p){for(var q=r[n].firstChild;q&&q.nodeType!=1;q=q.nextSibling){}if(q){for(var s=q.nextSibling;s&&s.nodeType!=1;s=s.nextSibling){}o.push({label:q.innerHTML,content:(s&&s.innerHTML)})}}}}p.innerHTML="";if(o.length>0){this.addPanels(o)}if((l.expandItem===0)||(l.expandItem>0)){var m=this._panels[l.expandItem].firstChild;var s=this._panels[l.expandItem].firstChild.nextSibling;g.removeClass(s,this.CLASSES.HIDDEN);if(m&&s){g.addClass(m,this.CLASSES.ACTIVE);m.tabIndex=0;this._setARIA(m,"aria-expanded","true");this._setARIA(s,"aria-hidden","false")}}this.initEvents()},initEvents:function(){if(true===this.get("hoverActivated")){this.on("mouseover",this._onMouseOver,this,true);this.on("mouseout",this._onMouseOut,this,true)}this.on("click",this._onClick,this,true);this.on("keydown",this._onKeydown,this,true);this.on("panelOpen",function(){this._opening=true},this,true);this.on("panelClose",function(){this._closing=true},this,true);this.on("afterPanelClose",function(){this._closing=false;if(!this._closing&&!this._opening){this._fixTabIndexes()}},this,true);this.on("afterPanelOpen",function(){this._opening=false;if(!this._closing&&!this._opening){this._fixTabIndexes()}},this,true);if(this._ARIACapable){this.on("keypress",function(l){var m=g.getAncestorByClassName(f.getTarget(l),this.CLASSES.PANEL);var n=f.getCharCode(l);if(n===13){this._onClick(m.firstChild);return false}})}},_setARIA:function(m,l,n){if(this._ARIACapable){m.setAttribute(l,n)}},_collapseAccordion:function(){g.batch(this._panels,function(m){var l=this.firstChild.nextSibling;if(l){g.removeClass(m.firstChild,this.CLASSES.ACTIVE);g.addClass(l,this.CLASSES.HIDDEN);this._setARIA(l,"aria-hidden","true")}},this)},_fixTabIndexes:function(){var n=this._panels.length;var l=true;for(var m=0;m<n;m++){if(g.hasClass(this._panels[m].firstChild,this.CLASSES.ACTIVE)){this._panels[m].firstChild.tabIndex=0;l=false}else{this._panels[m].firstChild.tabIndex=-1}}if(l){this._panels[0].firstChild.tabIndex=0}this.fireEvent(c)},addPanel:function(o,n){var m=document.createElement(this.CONFIG.ITEM_WRAPPER_TAG_NAME);g.addClass(m,this.CLASSES.PANEL);if(o.label==="SINGLE_LINK"){m.innerHTML=o.content;g.addClass(m.firstChild,this.CLASSES.TOGGLE);g.addClass(m.firstChild,"link")}else{var l=document.createElement("span");g.addClass(l,this.CLASSES.INDICATOR);var q=m.appendChild(document.createElement("A"));q.id=this.get("element").id+"-"+this._idCounter+"-label";q.innerHTML=o.label||"";q.appendChild(l);if(this._ARIACapable){if(o.href){q.href=o.href}}else{q.href=o.href||"#toggle"}q.tabIndex=-1;g.addClass(q,this.CLASSES.TOGGLE);var r=document.createElement(this.CONFIG.CONTENT_WRAPPER_TAG_NAME);r.innerHTML=o.content||"";g.addClass(r,this.CLASSES.CONTENT);m.appendChild(r);this._setARIA(m,"role","presentation");this._setARIA(q,"role","treeitem");this._setARIA(r,"aria-labelledby",q.id);this._setARIA(l,"role","presentation")}this._idCounter++;if(this._panels===null){this._panels=[]}if((n!==null)&&(n!==undefined)){var p=this.getPanel(n);this.insertBefore(m,p);var s=this._panels.slice(0,n);var v=this._panels.slice(n);s.push(m);for(i=0;i<v.length;i++){s.push(v[i])}this._panels=s}else{this.appendChild(m);if(this.get("element")===m.parentNode){this._panels[this._panels.length]=m}}if(o.label!=="SINGLE_LINK"){if(o.expand){if(!this.get("expandable")){this._collapseAccordion()}g.removeClass(r,this.CLASSES.HIDDEN);g.addClass(q,this.CLASSES.ACTIVE);this._setARIA(r,"aria-hidden","false");this._setARIA(q,"aria-expanded","true")}else{g.addClass(r,"hidden");this._setARIA(r,"aria-hidden","true");this._setARIA(q,"aria-expanded","false")}}var u=YAHOO.lang.later(0,this,function(){this._fixTabIndexes();this.fireEvent(c)})},addPanels:function(m){for(var l=0;l<m.length;l++){this.addPanel(m[l])}},removePanel:function(l){this.removeChild(g.getElementsByClassName(this.CLASSES.PANEL,this.CONFIG.ITEM_WRAPPER_TAG_NAME,this)[l]);var o=[];var p=this._panels.length;for(var n=0;n<p;n++){if(n!==l){o.push(this._panels[n])}}this._panels=o;var m=YAHOO.lang.later(0,this,function(){this._fixTabIndexes();this.fireEvent(c)})},getPanel:function(l){return this._panels[l]},getPanels:function(){return this._panels},openPanel:function(l){var m=this._panels[l];if(!m){return false}if(g.hasClass(m.firstChild,this.CLASSES.ACTIVE)){return false}this._onClick(m.firstChild);return true},closePanel:function(l){var m=this._panels;var p=m[l];if(!p){return false}var o=p.firstChild;if(!g.hasClass(o,this.CLASSES.ACTIVE)){return true}if(this.get("collapsible")===false){if(this.get("expandable")===true){this.set("collapsible",true);for(var n=0;n<m.length;n++){if((g.hasClass(m[n].firstChild,this.CLASSES.ACTIVE)&&n!==l)){this._onClick(o);this.set("collapsible",false);return true}}this.set("collapsible",false)}}this._onClick(o);return true},_onKeydown:function(m){var o=g.getAncestorByClassName(f.getTarget(m),this.CLASSES.PANEL);var p=f.getCharCode(m);var n=this._panels.length;if(p===37||p===38){for(var l=0;l<n;l++){if((o===this._panels[l])&&l>0){this._panels[l-1].firstChild.focus();return}}}if(p===39||p===40){for(var l=0;l<n;l++){if((o===this._panels[l])&&l<n-1){this._panels[l+1].firstChild.focus();return}}}},_onMouseOver:function(l){f.stopPropagation(l);var m=f.getTarget(l);this._hoverTimer=YAHOO.lang.later(this.get("_hoverTimeout"),this,function(){this._onClick(m)})},_onMouseOut:function(){if(this._hoverTimer){this._hoverTimer.cancel();this._hoverTimer=null}},_onClick:function(u){var r;if(u.nodeType===undefined){r=f.getTarget(u);if(!g.hasClass(r,this.CLASSES.TOGGLE)&&!g.hasClass(r,this.CLASSES.INDICATOR)){return false}if(g.hasClass(r,"link")){return true}f.preventDefault(u);f.stopPropagation(u)}else{r=u}var s=r;var p=this;function t(w,y){if(p._ie){var x=g.getElementsByClassName(p.CLASSES.ACCORDION,p.CONFIG.TAG_NAME,w);if(x[0]){g.setStyle(x[0],"visibility",y)}}}function q(x,z){var A=this;function F(I,G){if(!g.hasClass(G,A.CLASSES.PANEL)){G=g.getAncestorByClassName(G,A.CLASSES.PANEL)}for(var H=0,J=G;J.previousSibling;H++){J=J.previousSibling}return A.fireEvent(I,{panel:G,index:H})}if(!z){if(!x){return false}z=x.parentNode.firstChild}var C={};var D=0;var B=(!g.hasClass(x,this.CLASSES.HIDDEN));if(this.get("animate")){if(!B){if(this._ff2){g.addClass(x,"almosthidden");g.setStyle(x,"width",this.get("width"))}g.removeClass(x,this.CLASSES.HIDDEN);D=x.offsetHeight;g.setStyle(x,"height",0);if(this._ff2){g.removeClass(x,"almosthidden");g.setStyle(x,"width","auto")}C={height:{from:0,to:D}}}else{D=x.offsetHeight;C={height:{from:D,to:0}}}var E=(this.get("animationSpeed"))?this.get("animationSpeed"):0.5;var y=(this.get("effect"))?this.get("effect"):YAHOO.util.Easing.easeBoth;var w=new j(x,C,E,y);if(B){if(this.fireEvent(d,x)===false){return}g.removeClass(z,A.CLASSES.ACTIVE);z.tabIndex=-1;t(x,"hidden");A._setARIA(x,"aria-hidden","true");A._setARIA(z,"aria-expanded","false");w.onComplete.subscribe(function(){g.addClass(x,A.CLASSES.HIDDEN);g.setStyle(x,"height","auto");F("afterPanelClose",x)})}else{if(F(e,x)===false){return}t(x,"hidden");w.onComplete.subscribe(function(){g.setStyle(x,"height","auto");t(x,"visible");A._setARIA(x,"aria-hidden","false");A._setARIA(z,"aria-expanded","true");z.tabIndex=0;F(k,x)});g.addClass(z,this.CLASSES.ACTIVE)}w.animate()}else{if(B){if(F(d,x)===false){return}g.addClass(x,A.CLASSES.HIDDEN);g.setStyle(x,"height","auto");g.removeClass(z,A.CLASSES.ACTIVE);A._setARIA(x,"aria-hidden","true");A._setARIA(z,"aria-expanded","false");z.tabIndex=-1;F(b,x)}else{if(F(e,x)===false){return}g.removeClass(x,A.CLASSES.HIDDEN);g.setStyle(x,"height","auto");g.addClass(z,A.CLASSES.ACTIVE);A._setARIA(x,"aria-hidden","false");A._setARIA(z,"aria-expanded","true");z.tabIndex=0;F(k,x)}}return true}var l=(s.nodeName.toUpperCase()==="SPAN")?s.parentNode.parentNode:s.parentNode;var o=g.getElementsByClassName(this.CLASSES.CONTENT,this.CONFIG.CONTENT_WRAPPER_TAG_NAME,l)[0];if(this.fireEvent(h,this)===false){return}if(this.get("collapsible")===false){if(!g.hasClass(o,this.CLASSES.HIDDEN)){return false}}else{if(!g.hasClass(o,this.CLASSES.HIDDEN)){q.call(this,o);return false}}if(this.get("expandable")!==true){var v=this._panels.length;for(var n=0;n<v;n++){var m=g.hasClass(this._panels[n].firstChild.nextSibling,this.CLASSES.HIDDEN);if(!m){q.call(this,this._panels[n].firstChild.nextSibling)}}}if(s.nodeName.toUpperCase()==="SPAN"){q.call(this,o,s.parentNode)}else{q.call(this,o,s)}return true},toString:function(){var l=this.get("id")||this.get("tagName");return"AccordionView "+l}})})();YAHOO.register("accordionview",YAHOO.widget.AccordionView,{version:"0.99",build:"33"});