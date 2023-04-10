"use strict";(self.webpackChunkbeatbracket=self.webpackChunkbeatbracket||[]).push([[678],{9215:function(e,t,n){var a=n(7294),r=n(1883);t.Z=()=>a.createElement(a.Fragment,null,a.createElement(r.Script,{src:"//static.getclicky.com/101396268.js"}),a.createElement("noscript",null,a.createElement("p",null,a.createElement("img",{alt:"Clicky",width:"1",height:"1",src:"//in.getclicky.com/101396268ns.gif"}))))},8957:function(e,t,n){n.d(t,{Z:function(){return l}});var a=n(7294),r=n.p+"static/Spotify_Logo_RGB_White-f48fb565509bf23854a88c4832e5a760.png";var o=e=>{let{question:t,answer:n}=e;return a.createElement("div",{className:"mb-5"},a.createElement("h2",{className:"font-bold text-xl text-white"},t),a.createElement("div",{className:"text-lg text-zinc-300"},n))},i=n(2828);var c=e=>{let{loggedIn:t}=e;return a.createElement("div",{className:"text-left","aria-label":"Frequently asked questions"},a.createElement(o,{question:"What is Beat Bracket?",answer:a.createElement(a.Fragment,null,"Beat Bracket allows you to create and share brackets for any artist on Spotify. You can automatically fill and seed brackets of different sizes and then fine-tune manually by moving or replacing individual songs")}),a.createElement(o,{question:"Why do I need a Spotify account to use Beat Bracket?",answer:"This site uses Spotify's API to get information about artists and tracks. After you create a bracket, it is associated with your Spotify account so that you'll be able to edit and share it later!"}),a.createElement(o,{question:"How do I create a bracket?",answer:a.createElement("ol",{className:"list-decimal list-inside"},t?null:a.createElement("li",null,"To create a bracket, you must first"," ",a.createElement(i.Z,{variant:"bordered"})),a.createElement("li",null,'Click "Create Bracket"'),a.createElement("li",null,"Select an artist from the popup and a bracket will be created containing the artist's most listened to tracks seeded by popularity"),a.createElement("li",null,'(Optional) Click "Edit" to customize the bracket to your liking. You can drag and drop, swap out songs, adjust the number of tracks, and choose different seeding methods'),a.createElement("li",null,'Start selecting songs to advance to the next round! If an audio preview is availiable for a track, you\'ll see a "play" icon next to the track name which will play a 30 second preview of the song. You can also click the Spotify icon in the top right to open the track in Spotify'),a.createElement("li",null,'Click "Share" to get a link to your newly created bracket!'))}),a.createElement(o,{question:"Why is there a limit on the number of brackets that I can have?",answer:"Storage can be expensive! Beat Bracket currently has limited storage space and is only able to support a certain number of brackets per account. In the future I may add a way to upgrade your account to support more brackets!"}),a.createElement(o,{question:"Why are there duplicate/similar tracks in my bracket?",answer:a.createElement(a.Fragment,null,'Spotify makes it difficult to consolidate all versions of the same song (especially when they are titled slightly differently eg. "Remastered" or "Radio edit"). Beat Bracket uses a custom algorithm to avoid showing duplicates but there are still some cases where it happens. If you notice this, please'," ",a.createElement("a",{className:"text-green-500 hover:text-green-700 underline",href:"mailto:feedback@beatbracket.com"},"let me know")," ","and I'll try to fix it! In the meantime, you can manually replace the duplicate track with another one of the artist's songs")}),a.createElement(o,{question:"How do I sign out or switch accounts?",answer:'Click your profile in the top right corner and select "Sign Out". You will be re-prompted to authorize Beat Bracket\'s access to your account on the next sign in'}),a.createElement(o,{question:"How do I suggest an improvement?",answer:a.createElement(a.Fragment,null,"Send me an email at"," ",a.createElement("a",{className:"text-green-500 hover:text-green-700 underline",href:"mailto:feedback@beatbracket.com"},"feedback@beatbracket.com"))}))};var l=e=>{let{heightClass:t,loggedIn:n}=e;return a.createElement("footer",{className:t},a.createElement("div",{className:"bg-zinc-800 p-4"},a.createElement(c,{loggedIn:n}),a.createElement("div",{className:"relative text-center"},a.createElement("span",{className:"inline-flex items-center text-white"},"© Cooper Garren 2023 | Content from ",a.createElement("a",{href:"https://spotify.com"},a.createElement("img",{src:r,alt:"Spotify",className:"h-[22px] text-white"}))))))}},2828:function(e,t,n){n.d(t,{Z:function(){return i}});var a=n(7294),r=n(2618),o=n.p+"static/Spotify_Logo_RGB_Green-0c4ae91bae23217d39c97c322a80e1fc.png";var i=e=>{let{variant:t="borderless"}=e;return a.createElement("button",{onClick:function(){console.log(window.location);const e=window.location.origin+"/my-brackets",t=(0,r.zs)(16),n="true"!==localStorage.getItem("rememberMe");sessionStorage.setItem("spotify_auth_state",t);let a="https://accounts.spotify.com/authorize";a+="?response_type=token",a+="&client_id="+encodeURIComponent("fff2634975884bf88e3d3c9c2d77763d"),a+="&scope="+encodeURIComponent("playlist-modify-private playlist-modify-public user-read-private"),a+="&redirect_uri="+encodeURIComponent(e),a+="&state="+encodeURIComponent(t),a+="&show_dialog="+encodeURIComponent(n),localStorage.setItem("rememberMe",!0),window.location=a},className:("bordered"===t?"bg-black hover:bg-zinc-800 border-white hover:border-zinc-200 text-white":"bg-black hover:bg-zinc-800 border-black hover:border-zinc-800 text-white")+" inline-flex flex-row items-center justify-center"},a.createElement("span",null,"Login with "),a.createElement("img",{src:o,alt:"Spotify",className:"h-6 text-white"}))}},7825:function(e,t,n){n.d(t,{p:function(){return o}});var a=n(7294),r=n(1883);const o=e=>{let{title:t,description:n,pathname:o,children:i}=e;const{title:c,description:l,image:s,siteUrl:u}=(0,r.useStaticQuery)("1946181227").site.siteMetadata,m={title:t||c,description:n||l,image:""+u+s,url:""+u+(o||"")};return a.createElement(a.Fragment,null,a.createElement("title",null,m.title),a.createElement("meta",{name:"description",content:m.description}),a.createElement("meta",{name:"image",content:m.image}),i)}},6558:function(e,t,n){n.r(t),n.d(t,{Head:function(){return l}});var a=n(7294),r=n(9215),o=n(2828),i=n(8957),c=n(7825);function l(){return a.createElement(c.p,null,a.createElement("script",{type:"application/ld+json"},'\n          {\n            "@context": "https://schema.org",\n            "@type": "WebSite",\n            "url": "https://www.beatbracket.com",\n            "name": "Beat Bracket",\n            "contactPoint": {\n              "@type": "ContactPoint",\n              "telephone": "+5-601-785-8543",\n              "contactType": "Customer Support"\n            }\n          }\n        '))}t.default=()=>a.createElement(a.Fragment,null,a.createElement(r.Z,null),a.createElement("main",{className:"h-screen bg-zinc-300"},a.createElement("div",{className:"flex flex-col justify-center items-center h-5/6"},a.createElement("div",{className:"inline-flex flex-col justify-center items-center text-center"},a.createElement("h1",{className:"inline-block mb-0.5 font-bold font-display text-8xl text-black "},"Beat Bracket"),a.createElement("h2",{className:"mb-0.5 text-black font-bar font-bold text-xl"},"Make interactive music brackets for your favorite artists!"),a.createElement("span",{className:"mt-1.5"},a.createElement(o.Z,null)),a.createElement("p",{className:"text-sm text-gray-600"},"A Spotify account is required to create and save brackets"))),a.createElement(i.Z,{heightClass:"h-1/6"})))},2618:function(e,t,n){n.d(t,{IH:function(){return p},Lh:function(){return d},Sy:function(){return s},Vn:function(){return u},Yo:function(){return m},hG:function(){return i},ig:function(){return f},jP:function(){return c},oz:function(){return l},zs:function(){return o}});n(1120);var a=n(1883),r=n(7066);function o(e){let t="",n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let a=0;a<e;a++)t+=n.charAt(Math.floor(Math.random()*n.length));return t}async function i(e){try{let t=function(){let e,t={},n=/([^&;=]+)=?([^&;]*)/g,a=window.location.hash.substring(1);t.raw_hash=window.location.hash;for(;e=n.exec(a);)t[e[1]]=decodeURIComponent(e[2]);return t}();return""!==t.raw_hash?(window.history.replaceState({},document.title,e),t.expires_at=Date.now()+1e3*parseInt(t.expires_in),delete t.expires_in,t):{}}catch(t){return console.error(t.message),{}}}function c(e){void 0===e&&(e=void 0);let t=new Date(parseInt(sessionStorage.getItem("expireTime")));return!(null===sessionStorage.getItem("expireTime")||null===sessionStorage.getItem("accessToken")||"Invalid Date"===t.toString()||Date.now()>t)||(e&&clearInterval(e),!1)}function l(e,t){return e.popularity>t.popularity?-1:e.popularity<t.popularity?1:e.name<t.name?-1:e.name>t.name}async function s(e){let t,n=e.length;for(;0!==n;)t=Math.floor(Math.random()*n),n--,[e[n],e[t]]=[e[t],e[n]];return e}function u(e){let t=0,n=0;for(;t<=e;)t=2**(n+1),n++;return t}function m(e){let t=0,n=0,a=0;for(;n<=e;)t=n,n=2**(a+1),a++;return t}function d(e,t){const n=e[1],a=t[1];if("r"===n.side&&"l"===a.side)return-1;if("l"===n.side&&"r"===a.side)return 1;if("l"===n.side&&"l"===a.side)return n.col>a.col?-1:n.col<a.col||n.index>a.index?1:n.index<a.index?-1:0;if("r"===n.side&&"r"===a.side)return n.col>a.col?1:n.col<a.col?-1:n.index>a.index?1:n.index<a.index?-1:0;throw new Error("Found bracket with invalid side: "+n.side+" or "+a.side)}function f(e,t,n){void 0===t&&(t=void 0),void 0===n&&(n={}),console.log("Opening Bracket: "+e),(0,a.navigate)("/user/"+(t||(0,r.bG)().id)+"/bracket/"+e,{state:n})}function p(e){if(!e instanceof Map)return!1;for(let t of e.values())if(0!==t.col&&t.song)return!1;return!0}},7066:function(e,t,n){n.d(t,{$t:function(){return c},bG:function(){return i},g7:function(){return o}});var a=n(8165),r=n(2618);async function o(e,t){if((0,r.jP)()){t&&(e=e+"?"+new URLSearchParams(t));const n=await fetch(e,{headers:{"Content-Type":"application/json",Authorization:"Bearer "+sessionStorage.getItem("accessToken")}});return n.ok?n.json():1}return 1}async function i(e){void 0===e&&(e=void 0);let t="https://api.spotify.com/v1/me";e&&(t="https://api.spotify.com/v1/users/"+e);const n=await o(t);return 1!==n?(0===n.images.length&&n.images.push({url:a.Z}),n):1}async function c(e){return e===(await i()).id}},8165:function(e,t,n){t.Z=n.p+"static/guestProfileImage-56ea6ecf196675a29e7b5ffca974fde1.png"}}]);
//# sourceMappingURL=component---src-pages-index-js-687132753470a15fb64a.js.map