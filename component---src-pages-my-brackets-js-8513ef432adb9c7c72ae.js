"use strict";(self.webpackChunkbeatbracket=self.webpackChunkbeatbracket||[]).push([[222],{8711:function(e,t,a){var n=a(7294),r=a(4184),l=a.n(r);t.Z=e=>{let{show:t,close:a,message:r,type:o}=e;const c={info:{styles:"bg-blue-100 text-blue-700",icon:n.createElement("path",{fill:"currentColor",d:"M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"})},success:{styles:"bg-green-100 text-green-700",icon:n.createElement("path",{fill:"currentColor",d:"M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"})},error:{styles:"bg-red-100 text-red-700",icon:n.createElement("path",{fill:"currentColor",d:"M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"})},warning:{styles:"bg-yellow-100 text-yellow-700",icon:n.createElement("path",{fill:"currentColor",d:"M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"})}};return n.createElement("div",{className:"fixed right-0 top-[38px] h-0 w-fit z-30",role:"alert"},n.createElement("div",{className:"w-fit h-fit rounded-lg text-sm p-4 "+(c[o]?c[o].styles:"")+" "+(t?"flex":"hidden")},n.createElement("svg",{"aria-hidden":"true",focusable:"false","data-icon":"check-circle",className:"w-5 h-5 mr-3 fill-current flex-shrink-0 inline",role:"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512"},c[o]?c[o].icon:null),n.createElement("span",{className:"sr-only"},"Info"),n.createElement("div",null,n.createElement("span",{className:"font-bold mr-1 whitespace-nowrap"},r)),n.createElement("button",{type:"button",className:l()("ml-auto -mx-1.5 -my-1.5 border-none !text-black rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 hover:!text-current hover:bg-transparent inline-flex h-8 w-8",{[""+(c[o]?c[o].styles:"")]:c[o]}),"aria-label":"Close",onClick:()=>a()},n.createElement("span",{className:"sr-only"},"Close"),n.createElement("svg",{"aria-hidden":"true",className:"w-5 h-5",fill:"currentColor",viewBox:"0 0 20 20",xmlns:"http://www.w3.org/2000/svg"},n.createElement("path",{fillRule:"evenodd",d:"M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",clipRule:"evenodd"})))))}},4442:function(e,t,a){a.d(t,{Z:function(){return p}});var n=a(7294),r=a(1883),l=a(8165),o=a(7066),c=a(4657),i=a(2828),s=a(8159);var m=e=>{let{loggedIn:t,noChanges:a}=e;const{0:m,1:d}=(0,n.useState)(!1),{0:u,1:g}=(0,n.useState)({display_name:"Guest",id:"",images:[{url:l.Z}]});return(0,n.useEffect)((()=>{t?(0,o.bG)().then((e=>{g(1!==e?e:{display_name:"Guest",id:"",images:[{url:l.Z}]})})):g({display_name:"Guest",id:"",images:[{url:l.Z}]})}),[t]),n.createElement("div",null,t?n.createElement("div",{className:"inline-block relative"},n.createElement("button",{type:"button",className:"flex items-center rounded-lg transition group shrink-0 border-0 hover:bg-transparent px-0",id:"menu-button","aria-expanded":"true","aria-haspopup":"true","data-dropdown-toggle":"dropdownNavbar",onClick:()=>{t&&d(!m)}},n.createElement("img",{className:"object-cover w-10 h-10 rounded-full",src:u.images[0].url,alt:"Profile picture",title:u.display_name+"'s Profile picture from Spotify"}),n.createElement("p",{className:"hidden ml-2 text-left sm:block"},n.createElement("strong",{className:"block text-s font-bold text-white"},u.display_name)),n.createElement("div",{hidden:!t},n.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",className:"w-5 h-5 ml-4 text-gray-300 transition sm:block group-hover:text-white",viewBox:"0 0 20 20",fill:"currentColor"},n.createElement("path",{fillRule:"evenodd",d:"M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z",clipRule:"evenodd"})))),n.createElement("ul",{id:"dropdownNavbar",className:"absolute right-0 bg-white text-base z-40 list-none divide-y divide-gray-100 rounded shadow w-full cursor-pointer min-w-fit","aria-labelledby":"dropdownDefault",hidden:!m},n.createElement("li",null,n.createElement("button",{onClick:function(){var e;d(!1),e="/my-brackets",a(!0)&&(0,r.navigate)(e)},className:"py-2 px-4 items-center whitespace-nowrap flex gap-1 group-hover:bg-gray-200 border-0 w-full group"},n.createElement("span",null,"My Brackets")),n.createElement("button",{onClick:async function(){a(!0)&&(d(!1),await(0,c.kS)(),(0,r.navigate)("/"))},className:"py-2 px-4 items-center rounded-t-none whitespace-nowrap flex gap-1 group-hover:bg-gray-200 border-0 w-full group"},n.createElement("span",null,"Sign out"),n.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",className:"w-4 h-4 text-secondary transition sm:block group-hover:text-secondary",viewBox:"0 0 24 24",fill:"currentColor"},n.createElement("path",{d:"M16 10v-5l8 7-8 7v-5h-8v-4h8zm-16-8v20h14v-2h-12v-16h12v-2h-14z"})))))):!1===t?n.createElement(i.Z,{variant:"bordered"}):n.createElement(s.Z,null))};var d=e=>{let{loggedIn:t,noChanges:a}=e;return n.createElement("header",{className:"bg-black mb-4"},n.createElement("div",{className:"flex items-center min-h-fit px-4 mx-auto sm:px-6 lg:px-4 justify-between"},n.createElement("button",{className:"text-white text-2xl font-bold font-display bg-black border-0 hover:bg-black pl-0",onClick:function(){a(!0)&&(t?(0,r.navigate)("/my-brackets/"):(0,r.navigate)("/"))}},"Beat Bracket"),n.createElement(m,{loggedIn:t,noChanges:a})))},u=a(9215),g=a(4390);var p=e=>{let{children:t,noChanges:a,path:r}=e;const l=(0,c.jl)(),{1:o}=(0,n.useState)();return(0,n.useEffect)((()=>(window.onstorage=()=>{console.log("storage changed"),o({})},()=>{window.onstorage=null})),[]),n.createElement(n.Fragment,null,n.createElement(u.Z,null),n.createElement("div",{className:"text-center clear-both"},n.createElement("main",{className:"font-sans text-black bg-gradient-radial from-zinc-200 to-zinc-300 relative text-center min-h-screen pb-[24px]"},n.createElement(d,{loggedIn:l,noChanges:a}),t),n.createElement(g.Z,{loggedIn:l,path:r})))}},243:function(e,t,a){var n=a(7294);t.Z=e=>{let{onClose:t,children:a}=e;return n.createElement("div",{tabIndex:"-1",className:"fixed top-0 left-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto inset-0 h-modal h-full bg-black bg-opacity-50"},n.createElement("div",{className:"absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-auto max-h-screen"},n.createElement("div",{className:"relative bg-white rounded-lg shadow"},n.createElement("button",{type:"button",className:"absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center ",onClick:t},n.createElement("svg",{className:"w-5 h-5",fill:"currentColor",viewBox:"0 0 20 20",xmlns:"http://www.w3.org/2000/svg"},n.createElement("path",{fillRule:"evenodd",d:"M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",clipRule:"evenodd"})),n.createElement("span",{className:"sr-only"},"Close modal")),n.createElement("div",{className:"p-6 text-center"},a))))}},7825:function(e,t,a){a.d(t,{p:function(){return l}});var n=a(7294),r=a(1883);const l=e=>{let{title:t,description:a,pathname:l,children:o}=e;const{title:c,description:i,siteUrl:s}=(0,r.useStaticQuery)("3764592887").site.siteMetadata,m={title:t||c,description:a||i,url:""+s+(l||"")};return n.createElement(n.Fragment,null,n.createElement("title",null,m.title),n.createElement("meta",{name:"description",content:m.description}),n.createElement("meta",{name:"image",content:m.image}),o)}},4015:function(e,t,a){var n=a(7294);t.Z=e=>{let{artistName:t,art:a,onClick:r}=e;return n.createElement("button",{onClick:r,className:"text-l flex first:rounded-t-[inherit] last:rounded-b-[inherit] w-auto bg-white hover:bg-gray-100 focus-visible:bg-gray-100 focus:border-blue-500 focus-visible:border-blue-500 focus:bg-gray-100 cursor-pointer py-1 px-2 border border-[rgba(0,0,0,0.125)] items-center"},n.createElement("img",{src:a,alt:t,className:"h-10 w-10"})," ",t)}},6998:function(e,t,a){a.r(t),a.d(t,{Head:function(){return T},default:function(){return M}});var n=a(7294),r=a(4442),l=a(8159),o=a(4661);var c=e=>{let{children:t,image:a,imageAlt:r,cardText:c,onClick:i=(()=>{}),removeFunc:s=null}=e;return n.createElement("div",{className:"relative"},s&&a?n.createElement(o.Z,{removeFunc:s}):null,n.createElement("button",{className:"text-center p-3",onClick:i,disabled:!a},n.createElement("div",{className:"rounded-lg w-[320px] h-[320px]"},a?n.createElement("img",{src:a,className:"w-[320px] h-[320px]",width:"320px",height:"320px",alt:r||"Bracket image"}):n.createElement(l.Z,{loadingText:"",hidden:!1})),t,n.createElement("div",{className:"w-[320px]"},c)))};function i(e){let{bracket:t}=e;return n.createElement("div",{className:"inline-flex gap-0.5"},n.createElement("span",null,t.artistName?t.artistName+" ("+t.tracks+" tracks)":"Getting brackets..."),t.winner||t.completed?n.createElement("span",{title:"Completed",className:"text-green-600 text-xs font-medium inline-flex items-center px-0.5 py-0.5 rounded-md"},n.createElement("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},n.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"}))):n.createElement("div",null))}var s=a(2618),m=a(5253),d=a(7066);var u=e=>{let{bracket:t,userId:a}=e;const{0:r,1:l}=(0,n.useState)(null);return n.useEffect((()=>{t.artistId&&async function(){const e="https://api.spotify.com/v1/artists/"+t.artistId,a=await(0,d.g7)(e);if(1===a)return null;return a.images[0].url}().then((e=>{l(e)}))}),[t]),n.createElement(c,{image:r,imageAlt:"Picture of "+t.artistName,cardText:t.artistId?n.createElement(i,{bracket:t}):"Loading...",removeFunc:async function(){window.confirm("Are you sure you want to permanently delete this "+t.artistName+" bracket?")&&(console.log("removing bracket"),0===await(0,m.nl)(t.id,a)&&window.location.reload())},onClick:()=>{(0,s.ig)(t.id,a)}})},g=a(4184),p=a.n(g);var f=e=>{let{text:t,activeTab:a,id:r,setActiveTab:l}=e;return n.createElement("button",{title:t+" tab",className:p()("py-4 px-6 block bg-transparent hover:bg-transparent hover:text-blue-700 hover:border-blue-700 focus:outline-none border-b-2 border-x-0 border-t-0 rounded-none font-medium",{"text-blue-700 border-blue-700":a===r},{"text-gray-600 border-transparent":a!==r}),onClick:()=>l(r)},t)},h=a.p+"static/createBracket-0d50326bd56d099bd40ebec3b048bc52.png";var b={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let v;const w=new Uint8Array(16);function E(){if(!v&&(v="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!v))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return v(w)}const x=[];for(let A=0;A<256;++A)x.push((A+256).toString(16).slice(1));function y(e,t=0){return(x[e[t+0]]+x[e[t+1]]+x[e[t+2]]+x[e[t+3]]+"-"+x[e[t+4]]+x[e[t+5]]+"-"+x[e[t+6]]+x[e[t+7]]+"-"+x[e[t+8]]+x[e[t+9]]+"-"+x[e[t+10]]+x[e[t+11]]+x[e[t+12]]+x[e[t+13]]+x[e[t+14]]+x[e[t+15]]).toLowerCase()}var k=function(e,t,a){if(b.randomUUID&&!t&&!e)return b.randomUUID();const n=(e=e||{}).random||(e.rng||E)();if(n[6]=15&n[6]|64,n[8]=63&n[8]|128,t){a=a||0;for(let e=0;e<16;++e)t[a+e]=n[e];return t}return y(n)},N=a(4015);var C=e=>{let{setArtist:t,disabled:a}=e;const{0:r,1:l}=(0,n.useState)(""),{0:o,1:c}=(0,n.useState)([]);return(0,n.useEffect)((()=>{!async function(){if(""!==r.trim()){var e="https://api.spotify.com/v1/search/?"+new URLSearchParams({q:r,type:"artist",limit:5}).toString();let a=await(0,d.g7)(e);if(1!==a&&a.artists.items.length>0){let e=[];a.artists.items.forEach((a=>{a.images.length>0&&e.push({name:a.name,art:a.images[2].url,id:a.id,onClick:()=>{t({name:a.name,id:a.id,art:a.images[2].url}),l("")}})})),c(e)}else c([])}else c([])}()}),[r]),(0,n.useEffect)((()=>{document.getElementById("searchbar").addEventListener("keydown",(e=>{"ArrowDown"===e.key&&(e.preventDefault(),document.getElementById("artist-list").children.length>0&&document.getElementById("artist-list").firstChild.focus())})),document.getElementById("artist-list").addEventListener("keydown",(e=>{document.getElementById("artist-list").children.length>0&&("ArrowUp"===e.key?(e.preventDefault(),e.stopPropagation(),document.activeElement===document.getElementById("artist-list").firstChild?document.getElementById("searchbar").focus():document.getElementById("artist-list").contains(document.activeElement)&&document.activeElement.previousSibling.focus()):"ArrowDown"===e.key&&(e.preventDefault(),e.stopPropagation(),document.getElementById("artist-list").contains(document.activeElement)&&document.activeElement.nextSibling&&document.activeElement.nextSibling.focus()))}))}),[]),n.createElement("div",{className:"inline-flex flex-col justify-items-center mb-2 place-items-center border-black border-0 rounded-md "},n.createElement("input",{placeholder:"Search for an artist...","aria-label":"Search for an artist...",size:"search",id:"searchbar",type:"search",spellCheck:!1,autoComplete:"off",autoCorrect:"off",autoCapitalize:"off",autoFocus:!0,value:r,onChange:e=>l(e.target.value),className:"text-black text-2xl font-bar w-full p-1 border-2 border-gray-500 rounded focus:z-10 pl-3 mousetrap focus-visible:outline-none focus-visible:border-blue-500 focus-visible:border-1",disabled:a}),n.createElement("div",{id:"artist-list",className:"m-0 p-0 list-none flex-nowrap gap-0 inline-flex flex-col text-center w-full rounded"},o.map((e=>n.createElement(N.Z,{artistName:e.name,art:e.art,onClick:e.onClick,key:e.id})))))},I=a(243);var S=e=>{let{userId:t}=e;const{0:a,1:r}=(0,n.useState)(!1);return n.createElement("div",null,n.createElement(c,{image:h,imageAlt:"Plus sign",cardText:"Create Bracket",onClick:()=>{r(!0)}}),a?n.createElement(I.Z,{onClose:()=>r(!1)},n.createElement(C,{setArtist:function(e){if(e){const a=k();console.log("Create New Bracket with id: "+a),(0,s.ig)(a,t,{artist:e})}}})):null)},B=a(8711),z=a(4657),L=a(1883),Z=a(7825);var M=e=>{let{location:t}=e;const a=(0,m.hZ)(),{0:l,1:o}=(0,n.useState)([{id:1,userId:void 0,artistName:void 0,artistId:void 0,tracks:void 0,completed:!1}]),{0:c,1:i}=(0,n.useState)(0),s=(0,z.n5)(),{0:d,1:g}=(0,n.useState)({show:!1,message:null,type:null,timeoutId:null}),{0:p,1:h}=(0,n.useState)(!1),b=(0,n.useMemo)((()=>(console.log(l),l.filter((e=>0===c||(1===c?!e.completed&&!e.winner:2!==c||(e.completed||e.winner)))))),[c,l]);function v(e,t,a){void 0===t&&(t="info"),void 0===a&&(a=!0),d.timeoutId&&clearTimeout(d.timeoutId);let n=null;a&&(n=setTimeout((()=>{g({show:!1,message:null,type:null,timeoutId:null})}),5e3)),g({show:!0,message:e,type:t,timeoutId:n})}return(0,n.useEffect)((()=>window.scrollTo(0,0)),[]),(0,n.useEffect)((()=>{(async function(){const e=new URLSearchParams(window.location.search);window.history.replaceState({},document.title,window.location.pathname);try{await(0,z.IS)(e)}catch(t){return console.log("Error authenticating:",t),h(!0),void v("Error authenticating","error",!1)}})().then((()=>{(0,z.jl)()?(0,m.fe)().then((e=>{1!==e?(console.log(e),o(e)):(console.log("Error loading brackets"),v("Error loading brackets, try logging in again","error",!1),h(!0))})):(0,L.navigate)("/")}))}),[]),n.createElement(r.Z,{noChanges:()=>!0,path:t.pathname},n.createElement(B.Z,{show:d.show,close:function(){d.timeoutId&&clearTimeout(d.timeoutId),g({show:!1,message:null,type:null,timeoutId:null})},message:d.message,type:d.type}),n.createElement("div",{className:"text-center",hidden:p},n.createElement("h1",{className:"text-4xl font-extrabold font-display"},"My Brackets"),s&&a?n.createElement("p",{className:"text-sm text-gray-600 mb-2"},l.length+"/"+a+" brackets used"):null,n.createElement("div",{className:""},n.createElement("nav",{className:"inline-flex flex-row"},n.createElement(f,{id:0,activeTab:c,setActiveTab:i,text:"All"}),n.createElement(f,{id:1,activeTab:c,setActiveTab:i,text:"In Progess"}),n.createElement(f,{id:2,activeTab:c,setActiveTab:i,text:"Completed"}))),n.createElement("div",{className:"pt-3 flex flex-row flex-wrap justify-center items-stretch gap-5 sm:mx-5"},0===c&&a&&l.length<a&&s?n.createElement(S,{userId:s}):null,b.map((e=>n.createElement(u,{bracket:e,key:e.id,userId:s}))))))};function T(){return n.createElement(Z.p,{title:"Beat Bracket - My brackets"})}}}]);
//# sourceMappingURL=component---src-pages-my-brackets-js-8513ef432adb9c7c72ae.js.map