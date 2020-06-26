// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/script/modules/recognize.js":[function(require,module,exports) {
var recognize = function recognize(blob, callBack) {
  var myHeaders = new Headers(); // myHeaders.append("api_token", "774a8e688bc5a445acca2aeee37295de");
  // myHeaders.append(
  // 	"Cookie",
  // 	"__cfduid=dc380c36c115d45754be9ac9d807fa75b1593100728"
  // );

  var formdata = new FormData();
  formdata.append("return", "lyrics,timecode");
  formdata.append("file", blob);
  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
    mode: "cors"
  };
  fetch("https://api.audd.io/?api_token=test", requestOptions).then(function (response) {
    console.log(response);
    return response.json();
  }).then(function (result) {
    console.log(result);
    callBack(result);
  }).catch(function (error) {
    console.log("error", error);
    callBack(null);
  });
};

module.exports = recognize;
},{}],"src/script/script.js":[function(require,module,exports) {
//imports
var recognize = require("./modules/recognize"); //const


var RECORD_TIME = 5000; //var

var elMic;
var elMicMessage;
var elNotification;
var mediaRecorderRef;
var wavObject; // init

var init = function init() {
  initilizeDomRefferences();
  setupEventListeners();
}; // intializeDomRefferences


var initilizeDomRefferences = function initilizeDomRefferences() {
  elMic = document.querySelector(".micButton");
  elPlayer = document.querySelector(".player");
  elMicMessage = document.querySelector(".micMessage");
  elNotification = document.querySelector(".notification");
}; // setupEventListeners


var setupEventListeners = function setupEventListeners() {
  elMic.addEventListener("click", record);
}; // event listeners
// listener record


var record = function record(event) {
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  }).then(handleSuccess).catch(function (e) {
    alert(e);
    elMicMessage.innerHTML = "did not find device";
  });
  setTimeout(function () {
    mediaRecorderRef.stop();
  }, RECORD_TIME);
};

var handleSuccess = function handleSuccess(stream) {
  var options = {
    mimeType: "audio/webm"
  };
  var recordedChunks = [];
  var mediaRecorder = new MediaRecorder(stream, options);
  mediaRecorder.addEventListener("dataavailable", function (e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  });
  mediaRecorder.addEventListener("stop", function () {
    wavObject = new Blob(recordedChunks, {
      type: "audio/mp3"
    });
    recognize(wavObject, notify);
  });
  mediaRecorderRef = mediaRecorder;
  mediaRecorder.start();
}; // util
// unfocus


var unfocus = function unfocus(element) {
  if (element != null) {
    element.blur();
  }
}; //notify


var notify = function notify(response) {
  unfocus(elMic);

  if (response == null || response.result == null) {
    elNotification.innerHTML = "\n        <div class=\"notificationBody\">\n\t\t\t\t\t<div class=\"notificationTitle\">\n\t\t\t\t\t\tOOPS!\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"notificationMessage\">\n\t\t\t\t\t\tSong not found!\n\t\t\t\t\t</div>\n\t\t\t\t\t\n\t\t\t\t</div>";
  } else {
    var _response$result = response.result,
        title = _response$result.title,
        artist = _response$result.artist,
        release_date = _response$result.release_date;
    elNotification.innerHTML = "\n        <div class=\"notificationBody\">\n\t\t\t\t\t<div class=\"notificationTitle\">\n\t\t\t\t\t\t".concat(title, "\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"songElement\">\n\t\t\t\t\t\tby ").concat(artist, "\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"songElement\">\n\t\t\t\t\t\t").concat(release_date, "\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n        ");
  }

  elNotification.classList.remove("hide");
  setTimeout(function () {
    elNotification.classList.add("hide");
  }, 5000);
};

window.onload = init;
},{"./modules/recognize":"src/script/modules/recognize.js"}],"../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "61754" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/script/script.js"], null)
//# sourceMappingURL=/script.89e6092b.js.map