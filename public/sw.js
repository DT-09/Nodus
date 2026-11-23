/* NODUS public site: no offline asset cache. Keep page delivery network-first. */
self.addEventListener("install",event=>event.waitUntil(self.skipWaiting()));
self.addEventListener("activate",event=>event.waitUntil(
 Promise.all([
  self.clients.claim(),
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("nodus-shell-")).map(key=>caches.delete(key))))
 ])
));
self.addEventListener("fetch",event=>{
 const request=event.request;
 const url=new URL(request.url);
 if(request.method!=="GET"||url.origin!==self.location.origin)return;
 if(url.pathname.startsWith("/app")||url.pathname.startsWith("/auth")||url.pathname.startsWith("/api")||url.pathname.startsWith("/webhooks"))return;
 if(request.mode==="navigate")event.respondWith(fetch(request));
});
