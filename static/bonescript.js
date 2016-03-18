function require(file) {
    throw 'Please perform setTargetAddress on a valid target';
}

function setTargetAddress(address, handlers) {
    var url = address;
    url = url.replace(/^(http:\/\/|https:\/\/)*/, 'https://');
    url = url.replace(/(\/)*$/, '/bonescript.js');
    
    loadScript(url);
    
    function loadScript(url) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.charset = 'UTF-8';
        script.onerror = function() {
                 console.log("Loading "+url+" failed!");
                 if(url.indexOf("https") > -1)
                 {
                   url = url.replace(/^(http:\/\/|https:\/\/)*/, 'http://');
                   loadScript(url);
                 }
                 else
                 {
                   alert("Script load failed!");
                 }                 
                    }
        var scriptObj = head.appendChild(script);
        scriptObj.onload = onScriptLoad;
    }
    function onScriptLoad()
    {
        alert("Script loaded successfully");  
        addHandlers();
    }
    
    function addHandlers() {
        if(typeof handlers == 'function') {
            handlers();
            return;
        }
        if(typeof _bonescript != 'undefined') {
            _bonescript.address = address;
            if(handlers.initialized) _bonescript.on.initialized = handlers.initialized;
            if(handlers.connect) _bonescript.on.connect = handlers.connect;
            if(handlers.connecting) _bonescript.on.connecting = handlers.connecting;
            if(handlers.disconnect) _bonescript.on.disconnect = handlers.disconnect;
            if(handlers.connect_failed) _bonescript.on.connect_failed = handlers.connect_failed;
            if(handlers.reconnect_failed) _bonescript.on.reconnect_failed = handlers.reconnect_failed;
            if(handlers.reconnect) _bonescript.on.reconnect = handlers.reconnect;
            if(handlers.reconnecting) _bonescript.on.reconnecting = handlers.reconnecting;
        }
        if(typeof handlers.callback == 'function') handlers.callback();
    }
}