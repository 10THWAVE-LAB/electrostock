const CACHE = "rrlhub-v6";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  // Page itself: network-first, so updates reach users on a normal reload.
  // Falls back to the saved copy only when offline.
  if(e.request.mode === "navigate"){
    e.respondWith(fetch(e.request).then(function(n){
      var copy = n.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return n;
    }).catch(function(){ return caches.match("./index.html"); }));
    return;
  }
  // Static assets: cache-first (fast + offline).
  e.respondWith(caches.match(e.request).then(function(r){
    return r || fetch(e.request).then(function(n){
      var copy = n.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return n;
    }).catch(function(){ return caches.match("./index.html"); });
  }));
});
