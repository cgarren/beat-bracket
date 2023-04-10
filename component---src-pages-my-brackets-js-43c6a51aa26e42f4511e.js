"use strict";(self.webpackChunkbeatbracket=self.webpackChunkbeatbracket||[]).push([[222],{6998:function(e,t,n){n.r(t),n.d(t,{Head:function(){return B},default:function(){return S}});var r=n(7294),a=n(5307),o=n(8159);var s=e=>{let{children:t,image:n,cardText:a,onClick:s=(()=>{}),removeFunc:i=null}=e;return r.createElement("div",{className:"relative"},i&&n?r.createElement("button",{onClick:i,className:"border-0 p-0 w-[30px] h-[30px] bg-white text-black absolute -top-2 -right-2 rounded-full"},"✕"):null,r.createElement("button",{className:"text-center p-3",onClick:s,disabled:!n},r.createElement("div",{className:"rounded-lg w-[320px] h-[320px]"},n?r.createElement("img",{src:n,className:"w-[320px] h-[320px]",width:"320px",height:"320px",alt:a}):r.createElement(o.Z,{loadingText:"",hidden:!1})),t,r.createElement("div",{className:"w-[320px]"},a)))};function i(e){let{bracket:t}=e;return r.createElement("div",{className:"inline-flex gap-0.5"},r.createElement("span",null,t.artistName?t.artistName+" ("+t.tracks+" tracks)":"Getting brackets..."),t.winner||t.completed?r.createElement("span",{className:"text-green-600 text-xs font-medium inline-flex items-center px-0.5 py-0.5 rounded-md"},r.createElement("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"}))):r.createElement("div",null))}var l=n(2618),c=n(5253),d=n(7066);var u=e=>{let{bracket:t,userId:n}=e;const{0:a,1:o}=(0,r.useState)(null);return r.useEffect((()=>{t.artistId&&async function(){const e="https://api.spotify.com/v1/artists/"+t.artistId,n=await(0,d.g7)(e);if(1===n)return null;return n.images[0].url}().then((e=>{o(e)}))}),[t]),r.createElement(s,{image:a,cardText:t.artistId?r.createElement(i,{bracket:t}):"Loading...",removeFunc:async function(){window.confirm("Are you sure you want to permanently delete this "+t.artistName+" bracket?")&&(console.log("removing bracket"),0===await(0,c.nl)(t.id,n)&&window.location.reload())},onClick:()=>{(0,l.ig)(t.id,n)}})};var m=e=>{let{text:t,activeTab:n,id:a,setActiveTab:o}=e;return r.createElement("button",{className:"text-gray-600 py-4 px-6 block bg-transparent hover:bg-transparent border-transparent hover:text-blue-500 hover:border-blue-500 focus:outline-none border-b-2 border-x-0 border-t-0 rounded-none font-medium "+(n===a?"text-blue-500 border-blue-500":""),onClick:()=>o(a)},t)},g=n.p+"static/createBracket-0d50326bd56d099bd40ebec3b048bc52.png";var p={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let f;const b=new Uint8Array(16);function v(){if(!f&&(f="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!f))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return f(b)}const h=[];for(let T=0;T<256;++T)h.push((T+256).toString(16).slice(1));function E(e,t=0){return(h[e[t+0]]+h[e[t+1]]+h[e[t+2]]+h[e[t+3]]+"-"+h[e[t+4]]+h[e[t+5]]+"-"+h[e[t+6]]+h[e[t+7]]+"-"+h[e[t+8]]+h[e[t+9]]+"-"+h[e[t+10]]+h[e[t+11]]+h[e[t+12]]+h[e[t+13]]+h[e[t+14]]+h[e[t+15]]).toLowerCase()}var x=function(e,t,n){if(p.randomUUID&&!t&&!e)return p.randomUUID();const r=(e=e||{}).random||(e.rng||v)();if(r[6]=15&r[6]|64,r[8]=63&r[8]|128,t){n=n||0;for(let e=0;e<16;++e)t[n+e]=r[e];return t}return E(r)},y=n(4015);var w=e=>{let{setArtist:t,disabled:n}=e;const{0:a,1:o}=(0,r.useState)(""),{0:s,1:i}=(0,r.useState)([]);return(0,r.useEffect)((()=>{!async function(){if(""!==a.trim()){var e="https://api.spotify.com/v1/search/?"+new URLSearchParams({q:a,type:"artist",limit:5}).toString();let n=await(0,d.g7)(e);if(1!==n&&n.artists.items.length>0){let e=[];n.artists.items.forEach((n=>{n.images.length>0&&e.push({name:n.name,art:n.images[2].url,id:n.id,onClick:()=>{t({name:n.name,id:n.id,art:n.images[2].url}),o("")}})})),i(e)}else i([])}else i([])}()}),[a]),(0,r.useEffect)((()=>{document.getElementById("searchbar").addEventListener("keydown",(e=>{"ArrowDown"===e.key&&(e.preventDefault(),document.getElementById("artist-list").children.length>0&&document.getElementById("artist-list").firstChild.focus())})),document.getElementById("artist-list").addEventListener("keydown",(e=>{document.getElementById("artist-list").children.length>0&&("ArrowUp"===e.key?(e.preventDefault(),e.stopPropagation(),document.activeElement===document.getElementById("artist-list").firstChild?document.getElementById("searchbar").focus():document.getElementById("artist-list").contains(document.activeElement)&&document.activeElement.previousSibling.focus()):"ArrowDown"===e.key&&(e.preventDefault(),e.stopPropagation(),document.getElementById("artist-list").contains(document.activeElement)&&document.activeElement.nextSibling&&document.activeElement.nextSibling.focus()))}))}),[]),r.createElement("div",{className:"inline-flex flex-col justify-items-center mb-2 place-items-center border-black border-0 rounded-md "},r.createElement("input",{placeholder:"Search for an artist...","aria-label":"Search for an artist...",size:"search",id:"searchbar",type:"search",spellCheck:!1,autoComplete:"off",autoCorrect:"off",autoCapitalize:"off",autoFocus:!0,value:a,onChange:e=>o(e.target.value),className:"text-black text-2xl font-bar w-full p-1 border-2 border-gray-500 rounded focus:z-10 pl-3 mousetrap focus-visible:outline-none focus-visible:border-blue-500 focus-visible:border-1",disabled:n}),r.createElement("div",{id:"artist-list",className:"m-0 p-0 list-none flex-nowrap gap-0 inline-flex flex-col text-center w-full rounded"},s.map((e=>r.createElement(y.Z,{artistName:e.name,art:e.art,onClick:e.onClick,key:e.id})))))},k=n(243);var I=e=>{let{userId:t}=e;const{0:n,1:a}=(0,r.useState)(!1);return r.createElement("div",null,r.createElement(s,{image:g,cardText:"Create Bracket",onClick:()=>{a(!0)}}),n?r.createElement(k.Z,{onClose:()=>a(!1)},r.createElement(w,{setArtist:function(e){if(e){const n=x();console.log("Create New Bracket with id: "+n),(0,l.ig)(n,t,{artist:e})}}})):null)},C=n(8711),N=n(1883);var S=()=>{const{0:e,1:t}=(0,r.useState)([{id:1,userId:void 0,artistName:void 0,artistId:void 0,tracks:void 0,completed:!1}]),{0:n,1:o}=(0,r.useState)(0),{0:s,1:i}=(0,r.useState)(void 0),{0:g,1:p}=(0,r.useState)({show:!1,message:null,type:null,timeoutId:null}),{0:f,1:b}=(0,r.useState)(!1),v=(0,r.useMemo)((()=>(console.log(e),e.filter((e=>0===n||(1===n?!e.completed&&!e.winner:2!==n||(e.completed||e.winner)))))),[n,e]);function h(e,t,n){void 0===t&&(t="info"),void 0===n&&(n=!0),g.timeoutId&&clearTimeout(g.timeoutId);let r=null;n&&(r=setTimeout((()=>{p({show:!1,message:null,type:null,timeoutId:null})}),5e3)),p({show:!0,message:e,type:t,timeoutId:r})}return(0,r.useEffect)((()=>{(async function(){const e=await(0,l.hG)(window.location.pathname);if(e&&Object.keys(e).length>0&&e.state===sessionStorage.getItem("spotify_auth_state")&&e.access_token&&e.expires_at){sessionStorage.setItem("accessToken",e.access_token),sessionStorage.setItem("expireTime",e.expires_at);const t=await(0,d.bG)();if(1===t)return console.log("Error getting user info"),b(!0),void h("Error getting user information","error",!1);if(console.log(t),1===await(0,c.YR)(t.id,e.state,e.expires_at,e.access_token))return console.log("Error authenticating"),b(!0),h("Error authenticating","error",!1),void(0,N.navigate)("/");sessionStorage.setItem("sessionId",e.state),sessionStorage.setItem("userId",t.id),sessionStorage.removeItem("spotify_auth_state")}})().then((()=>{i(sessionStorage.getItem("userId")),(0,c.fe)().then((e=>{1!==e?(console.log(e),t(e)):(console.log("Error loading brackets"),h("Error loading brackets, try logging in again","error",!1),b(!0),(0,N.navigate)("/"))}))}))}),[]),r.createElement(a.Z,{noChanges:()=>!0},r.createElement(C.Z,{show:g.show,close:function(){g.timeoutId&&clearTimeout(g.timeoutId),p({show:!1,message:null,type:null,timeoutId:null})},message:g.message,type:g.type}),r.createElement("div",{className:"text-center",hidden:f},r.createElement("h1",{className:"text-4xl font-extrabold font-display"},"My Brackets"),s?r.createElement("p",{className:"text-sm text-gray-500 mb-2"},e.length+"/10 brackets used"):null,r.createElement("div",{className:""},r.createElement("nav",{className:"inline-flex flex-row"},r.createElement(m,{id:0,activeTab:n,setActiveTab:o,text:"All"}),r.createElement(m,{id:1,activeTab:n,setActiveTab:o,text:"In Progess"}),r.createElement(m,{id:2,activeTab:n,setActiveTab:o,text:"Completed"}))),r.createElement("div",{className:"pt-3 flex flex-row flex-wrap justify-center items-stretch gap-5 sm:mx-5"},0===n&&e.length<10&&s?r.createElement(I,{userId:s}):null,v.map((e=>r.createElement(u,{bracket:e,key:e.id,userId:s}))))))};function B(){return r.createElement("title",null,"Beat Bracket - My Brackets")}}}]);
//# sourceMappingURL=component---src-pages-my-brackets-js-43c6a51aa26e42f4511e.js.map