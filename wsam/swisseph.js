var Swisseph = ( () => {
  var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;

  return (function(moduleArg={}) {
      var moduleRtn;

      var Module = moduleArg;
      var readyPromiseResolve, readyPromiseReject;
      var readyPromise = new Promise( (resolve, reject) => {
          readyPromiseResolve = resolve;
          readyPromiseReject = reject
      }
      );
      // Detect environment properly
      var ENVIRONMENT_IS_NODE = typeof process !== 'undefined' && process.versions && process.versions.node;
      var ENVIRONMENT_IS_WEB = typeof window !== 'undefined' || (typeof importScripts === 'function' && !ENVIRONMENT_IS_NODE);
      var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';


      Module["expectedDataFileDownloads"] ??= 0;
      Module["expectedDataFileDownloads"]++;
      ( () => {
          var isPthread = typeof ENVIRONMENT_IS_PTHREAD != "undefined" && ENVIRONMENT_IS_PTHREAD;
          var isWasmWorker = typeof ENVIRONMENT_IS_WASM_WORKER != "undefined" && ENVIRONMENT_IS_WASM_WORKER;
          if (isPthread || isWasmWorker)
              return;
          function loadPackage(metadata) {
              var PACKAGE_PATH = "";
              if (typeof window === "object") {
                  PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) + "/")
              } else if (typeof process === "undefined" && typeof location !== "undefined") {
                  PACKAGE_PATH = encodeURIComponent(location.pathname.substring(0, location.pathname.lastIndexOf("/")) + "/")
              }
              var PACKAGE_NAME = "wsam/swisseph.data";
              var REMOTE_PACKAGE_BASE;

              if (ENVIRONMENT_IS_NODE) {
                  // In Node.js, resolve relative to the current module
                  REMOTE_PACKAGE_BASE = new URL("./swisseph.data", import.meta.url).href;
              } else {
                  // In browser, use import.meta.resolve if available, otherwise relative path
                  REMOTE_PACKAGE_BASE = import.meta.resolve ? import.meta.resolve("./swisseph.data") : "./swisseph.data";
              }

              var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
              var REMOTE_PACKAGE_SIZE = metadata["remote_package_size"];
              function fetchRemotePackage(packageName, packageSize, callback, errback) {
                  Module["dataFileDownloads"] ??= {};

                  // Cross-platform fetch function
                  async function crossPlatformFetch(url) {
                    if (ENVIRONMENT_IS_NODE) {
                      // Node.js environment - use fs to read local files
                      try {
                        const { readFile } = await import('fs/promises');
                        const { fileURLToPath } = await import('url');
                        const { resolve, dirname } = await import('path');

                        let filePath;
                        if (url.startsWith('file://')) {
                          filePath = fileURLToPath(url);
                        } else if (url.startsWith('./') || url.startsWith('../')) {
                          // Resolve relative to current module
                          const currentDir = dirname(fileURLToPath(import.meta.url));
                          filePath = resolve(currentDir, url);
                        } else {
                          filePath = url;
                        }

                        const data = await readFile(filePath);
                        return {
                          ok: true,
                          arrayBuffer: () => Promise.resolve(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength))
                        };
                      } catch (error) {
                        return {
                          ok: false,
                          status: 404,
                          url: url,
                          error: error
                        };
                      }
                    } else {
                      // Browser environment - use standard fetch
                      return fetch(url);
                    }
                  }

                  crossPlatformFetch(packageName).catch(cause => Promise.reject(new Error(`Network Error: ${packageName}`,{
                      cause
                  }))).then(response => {
                      if (!response.ok) {
                          return Promise.reject(new Error(`${response.status}: ${response.url}`))
                      }
                      if (!response.body && response.arrayBuffer) {
                          return response.arrayBuffer().then(callback)
                      }
                      const reader = response.body.getReader();
                      const iterate = () => reader.read().then(handleChunk).catch(cause => Promise.reject(new Error(`Unexpected error while handling : ${response.url} ${cause}`,{
                          cause
                      })));
                      const chunks = [];
                      const headers = response.headers;
                      const total = Number(headers.get("Content-Length") ?? packageSize);
                      let loaded = 0;
                      const handleChunk = ({done, value}) => {
                          if (!done) {
                              chunks.push(value);
                              loaded += value.length;
                              Module["dataFileDownloads"][packageName] = {
                                  loaded,
                                  total
                              };
                              let totalLoaded = 0;
                              let totalSize = 0;
                              for (const download of Object.values(Module["dataFileDownloads"])) {
                                  totalLoaded += download.loaded;
                                  totalSize += download.total
                              }
                              Module["setStatus"]?.(`Downloading data... (${totalLoaded}/${totalSize})`);
                              return iterate()
                          } else {
                              const packageData = new Uint8Array(chunks.map(c => c.length).reduce( (a, b) => a + b, 0));
                              let offset = 0;
                              for (const chunk of chunks) {
                                  packageData.set(chunk, offset);
                                  offset += chunk.length
                              }
                              callback(packageData.buffer)
                          }
                      }
                      ;
                      Module["setStatus"]?.("Downloading data...");
                      return iterate()
                  }
                  )
              }
              function handleError(error) {
                  console.error("package error:", error)
              }
              var fetchedCallback = null;
              var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
              if (!fetched)
                  fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, data => {
                      if (fetchedCallback) {
                          fetchedCallback(data);
                          fetchedCallback = null
                      } else {
                          fetched = data
                      }
                  }
                  , handleError);
              function runWithFS(Module) {
                  function assert(check, msg) {
                      if (!check)
                          throw msg + (new Error).stack
                  }
                  Module["FS_createPath"]("/", "sweph", true, true);
                  function DataRequest(start, end, audio) {
                      this.start = start;
                      this.end = end;
                      this.audio = audio
                  }
                  DataRequest.prototype = {
                      requests: {},
                      open: function(mode, name) {
                          this.name = name;
                          this.requests[name] = this;
                          Module["addRunDependency"](`fp ${this.name}`)
                      },
                      send: function() {},
                      onload: function() {
                          var byteArray = this.byteArray.subarray(this.start, this.end);
                          this.finish(byteArray)
                      },
                      finish: function(byteArray) {
                          var that = this;
                          Module["FS_createDataFile"](this.name, null, byteArray, true, true, true);
                          Module["removeRunDependency"](`fp ${that.name}`);
                          this.requests[this.name] = null
                      }
                  };
                  var files = metadata["files"];
                  for (var i = 0; i < files.length; ++i) {
                      new DataRequest(files[i]["start"],files[i]["end"],files[i]["audio"] || 0).open("GET", files[i]["filename"])
                  }
                  function processPackageData(arrayBuffer) {
                      assert(arrayBuffer, "Loading data file failed.");
                      assert(arrayBuffer.constructor.name === ArrayBuffer.name, "bad input to processPackageData");
                      var byteArray = new Uint8Array(arrayBuffer);
                      DataRequest.prototype.byteArray = byteArray;
                      var files = metadata["files"];
                      for (var i = 0; i < files.length; ++i) {
                          DataRequest.prototype.requests[files[i].filename].onload()
                      }
                      Module["removeRunDependency"]("datafile_wsam/swisseph.data")
                  }
                  Module["addRunDependency"]("datafile_wsam/swisseph.data");
                  Module["preloadResults"] ??= {};
                  Module["preloadResults"][PACKAGE_NAME] = {
                      fromCache: false
                  };
                  if (fetched) {
                      processPackageData(fetched);
                      fetched = null
                  } else {
                      fetchedCallback = processPackageData
                  }
              }
              if (Module["calledRun"]) {
                  runWithFS(Module)
              } else {
                  (Module["preRun"] ??= []).push(runWithFS)
              }
          }
          loadPackage({
              files: [{
                  filename: "/sweph/seas_18.se1",
                  start: 0,
                  end: 223002
              }, {
                  filename: "/sweph/seasnam.txt",
                  start: 223002,
                  end: 10153224
              }, {
                  filename: "/sweph/sefstars.txt",
                  start: 10153224,
                  end: 10286461
              }, {
                  filename: "/sweph/seleapsec.txt",
                  start: 10286461,
                  end: 10286743
              }, {
                  filename: "/sweph/semo_18.se1",
                  start: 10286743,
                  end: 11591514
              }, {
                  filename: "/sweph/seorbel.txt",
                  start: 11591514,
                  end: 11597371
              }, {
                  filename: "/sweph/sepl_18.se1",
                  start: 11597371,
                  end: 12081426
              }],
              remote_package_size: 12081426
          })
      }
      )();
      var moduleOverrides = Object.assign({}, Module);
      var arguments_ = [];
      var thisProgram = "./this.program";
      var scriptDirectory = "";
      function locateFile(path) {
          if (Module["locateFile"]) {
              return Module["locateFile"](path, scriptDirectory)
          }
          return scriptDirectory + path
      }
      var readAsync, readBinary;
      if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
          if (ENVIRONMENT_IS_WORKER) {
              scriptDirectory = self.location.href
          } else if (typeof document != "undefined" && document.currentScript) {
              scriptDirectory = document.currentScript.src
          }
          if (_scriptName) {
              scriptDirectory = _scriptName
          }
          if (scriptDirectory.startsWith("blob:")) {
              scriptDirectory = ""
          } else {
              scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1)
          }
          {
              readAsync = async url => {
                  if (ENVIRONMENT_IS_NODE) {
                      // Node.js environment
                      try {
                          const { readFile } = await import('fs/promises');
                          const { fileURLToPath } = await import('url');
                          const { resolve, dirname } = await import('path');

                          let filePath;
                          if (url.startsWith('file://')) {
                              filePath = fileURLToPath(url);
                          } else if (url.startsWith('./') || url.startsWith('../')) {
                              const currentDir = dirname(fileURLToPath(import.meta.url));
                              filePath = resolve(currentDir, url);
                          } else {
                              filePath = url;
                          }

                          console.log('DEBUG: readAsync Node.js file read:', { url, filePath });

                          console.log('DEBUG: readAsync Node.js file read:', { url, filePath });

                          console.log('DEBUG: Node.js file read attempt:', { url, filePath });

                          const data = await readFile(filePath);
                          console.log('DEBUG: File read successful, size:', data.length);
                          return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
                      } catch (error) {
                          console.log('DEBUG: File read failed:', error.message);
                          throw new Error(`File read error: ${url} - ${error.message}`);
                      }
                  } else {
                      // Browser environment
                      var response = await fetch(url, {
                          credentials: "same-origin"
                      });
                      if (response.ok) {
                          return response.arrayBuffer()
                      }
                      throw new Error(response.status + " : " + response.url)
                  }
              }
          }
      } else {
          // Node.js environment
          if (ENVIRONMENT_IS_NODE) {
              readAsync = async url => {
                  try {
                      const { readFile } = await import('fs/promises');
                      const { fileURLToPath } = await import('url');
                      const { resolve, dirname } = await import('path');

                      let filePath;
                      if (url.startsWith('file://')) {
                          filePath = fileURLToPath(url);
                      } else if (url.startsWith('./') || url.startsWith('../')) {
                          const currentDir = dirname(fileURLToPath(import.meta.url));
                          filePath = resolve(currentDir, url);
                      } else {
                          filePath = url;
                      }

                      const data = await readFile(filePath);
                      return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
                  } catch (error) {
                      throw new Error(`File read error: ${url} - ${error.message}`);
                  }
              };

              // We'll set readBinary to null for now since we have readAsync
              readBinary = null;
          }
      }
      var out = Module["print"] || console.log.bind(console);
      var err = Module["printErr"] || console.error.bind(console);
      Object.assign(Module, moduleOverrides);
      moduleOverrides = null;
      if (Module["arguments"])
          arguments_ = Module["arguments"];
      if (Module["thisProgram"])
          thisProgram = Module["thisProgram"];
      var wasmBinary = Module["wasmBinary"];
      var wasmMemory;
      var ABORT = false;
      var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
      function updateMemoryViews() {
          var b = wasmMemory.buffer;
          Module["HEAP8"] = HEAP8 = new Int8Array(b);
          Module["HEAP16"] = HEAP16 = new Int16Array(b);
          Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
          Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
          Module["HEAP32"] = HEAP32 = new Int32Array(b);
          Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
          Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
          Module["HEAPF64"] = HEAPF64 = new Float64Array(b)
      }
      var __ATPRERUN__ = [];
      var __ATINIT__ = [];
      var __ATPOSTRUN__ = [];
      var runtimeInitialized = false;
      function preRun() {
          if (Module["preRun"]) {
              if (typeof Module["preRun"] == "function")
                  Module["preRun"] = [Module["preRun"]];
              while (Module["preRun"].length) {
                  addOnPreRun(Module["preRun"].shift())
              }
          }
          callRuntimeCallbacks(__ATPRERUN__)
      }
      function initRuntime() {
          runtimeInitialized = true;
          if (!Module["noFSInit"] && !FS.initialized)
              FS.init();
          FS.ignorePermissions = false;
          TTY.init();
          callRuntimeCallbacks(__ATINIT__)
      }
      function postRun() {
          if (Module["postRun"]) {
              if (typeof Module["postRun"] == "function")
                  Module["postRun"] = [Module["postRun"]];
              while (Module["postRun"].length) {
                  addOnPostRun(Module["postRun"].shift())
              }
          }
          callRuntimeCallbacks(__ATPOSTRUN__)
      }
      function addOnPreRun(cb) {
          __ATPRERUN__.unshift(cb)
      }
      function addOnInit(cb) {
          __ATINIT__.unshift(cb)
      }
      function addOnPostRun(cb) {
          __ATPOSTRUN__.unshift(cb)
      }
      var runDependencies = 0;
      var dependenciesFulfilled = null;
      function getUniqueRunDependency(id) {
          return id
      }
      function addRunDependency(id) {
          runDependencies++;
          Module["monitorRunDependencies"]?.(runDependencies)
      }
      function removeRunDependency(id) {
          runDependencies--;
          Module["monitorRunDependencies"]?.(runDependencies);
          if (runDependencies == 0) {
              if (dependenciesFulfilled) {
                  var callback = dependenciesFulfilled;
                  dependenciesFulfilled = null;
                  callback()
              }
          }
      }
      function abort(what) {
          Module["onAbort"]?.(what);
          what = "Aborted(" + what + ")";
          err(what);
          ABORT = true;
          what += ". Build with -sASSERTIONS for more info.";
          var e = new WebAssembly.RuntimeError(what);
          readyPromiseReject(e);
          throw e
      }
      var dataURIPrefix = "data:application/octet-stream;base64,";
      var isDataURI = filename => filename.startsWith(dataURIPrefix);
      function findWasmBinary() {
          var f;
          if (ENVIRONMENT_IS_NODE) {
              // In Node.js, resolve relative to the current module
              f = new URL("./swisseph.wasm", import.meta.url).href;
          } else {
              // In browser, try different approaches for different bundlers
              if (import.meta.resolve) {
                  try {
                      f = import.meta.resolve("./swisseph.wasm");
                  } catch (e) {
                      // Fallback for bundlers that don't support import.meta.resolve
                      f = "./swisseph.wasm";
                  }
              } else {
                  // Fallback for older browsers or bundlers
                  f = "./swisseph.wasm";
              }

              // For Vite and other dev servers, try to use a more reliable path
              if (typeof window !== 'undefined' && window.location) {
                  const currentPath = window.location.pathname;
                  if (currentPath.includes('node_modules')) {
                      // We're likely in a dev environment, use relative path
                      f = "./swisseph.wasm";
                  }
              }
          }

          if (!isDataURI(f)) {
              return locateFile(f)
          }
          return f
      }
      var wasmBinaryFile;
      function getBinarySync(file) {
          if (file == wasmBinaryFile && wasmBinary) {
              return new Uint8Array(wasmBinary)
          }

          if (readBinary) {
              return readBinary(file)
          }

          throw "both async and sync fetching of the wasm failed"
      }
      async function getWasmBinary(binaryFile) {
          if (!wasmBinary) {
              try {
                  var response = await readAsync(binaryFile);
                  return new Uint8Array(response)
              } catch (error) {
                  // Fall back to sync loading
              }
          }
          return getBinarySync(binaryFile)
      }
      async function instantiateArrayBuffer(binaryFile, imports) {
          try {
              var binary = await getWasmBinary(binaryFile);
              var instance = await WebAssembly.instantiate(binary, imports);
              return instance
          } catch (reason) {
              err(`failed to asynchronously prepare wasm: ${reason}`);
              abort(reason)
          }
      }
      async function instantiateAsync(binary, binaryFile, imports) {
          if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
              try {
                  var response = fetch(binaryFile, {
                      credentials: "same-origin"
                  });
                  var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
                  return instantiationResult
              } catch (reason) {
                  err(`wasm streaming compile failed: ${reason}`);
                  err("falling back to ArrayBuffer instantiation")
              }
          }
          return instantiateArrayBuffer(binaryFile, imports)
      }
      function getWasmImports() {
          return {
              a: wasmImports
          }
      }
      async function createWasm() {
          function receiveInstance(instance, module) {
              wasmExports = instance.exports;
              wasmMemory = wasmExports["l"];
              updateMemoryViews();
              addOnInit(wasmExports["m"]);
              removeRunDependency("wasm-instantiate");
              return wasmExports
          }
          addRunDependency("wasm-instantiate");
          function receiveInstantiationResult(result) {
              receiveInstance(result["instance"])
          }
          var info = getWasmImports();
          if (Module["instantiateWasm"]) {
              try {
                  return Module["instantiateWasm"](info, receiveInstance)
              } catch (e) {
                  err(`Module.instantiateWasm callback failed with error: ${e}`);
                  readyPromiseReject(e)
              }
          }
          wasmBinaryFile ??= findWasmBinary();
          try {
              var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
              receiveInstantiationResult(result);
              return result
          } catch (e) {
              readyPromiseReject(e);
              return
          }
      }
      var tempDouble;
      var tempI64;
      class ExitStatus {
          name = "ExitStatus";
          constructor(status) {
              this.message = `Program terminated with exit(${status})`;
              this.status = status
          }
      }
      var callRuntimeCallbacks = callbacks => {
          while (callbacks.length > 0) {
              callbacks.shift()(Module)
          }
      }
      ;
      var noExitRuntime = Module["noExitRuntime"] || true;
      var stackRestore = val => __emscripten_stack_restore(val);
      var stackSave = () => _emscripten_stack_get_current();
      var syscallGetVarargI = () => {
          var ret = HEAP32[+SYSCALLS.varargs >> 2];
          SYSCALLS.varargs += 4;
          return ret
      }
      ;
      var syscallGetVarargP = syscallGetVarargI;
      var PATH = {
          isAbs: path => path.charAt(0) === "/",
          splitPath: filename => {
              var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
              return splitPathRe.exec(filename).slice(1)
          }
          ,
          normalizeArray: (parts, allowAboveRoot) => {
              var up = 0;
              for (var i = parts.length - 1; i >= 0; i--) {
                  var last = parts[i];
                  if (last === ".") {
                      parts.splice(i, 1)
                  } else if (last === "..") {
                      parts.splice(i, 1);
                      up++
                  } else if (up) {
                      parts.splice(i, 1);
                      up--
                  }
              }
              if (allowAboveRoot) {
                  for (; up; up--) {
                      parts.unshift("..")
                  }
              }
              return parts
          }
          ,
          normalize: path => {
              var isAbsolute = PATH.isAbs(path)
                , trailingSlash = path.substr(-1) === "/";
              path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/");
              if (!path && !isAbsolute) {
                  path = "."
              }
              if (path && trailingSlash) {
                  path += "/"
              }
              return (isAbsolute ? "/" : "") + path
          }
          ,
          dirname: path => {
              var result = PATH.splitPath(path)
                , root = result[0]
                , dir = result[1];
              if (!root && !dir) {
                  return "."
              }
              if (dir) {
                  dir = dir.substr(0, dir.length - 1)
              }
              return root + dir
          }
          ,
          basename: path => {
              if (path === "/")
                  return "/";
              path = PATH.normalize(path);
              path = path.replace(/\/$/, "");
              var lastSlash = path.lastIndexOf("/");
              if (lastSlash === -1)
                  return path;
              return path.substr(lastSlash + 1)
          }
          ,
          join: (...paths) => PATH.normalize(paths.join("/")),
          join2: (l, r) => PATH.normalize(l + "/" + r)
      };
      var initRandomFill = () => {
          if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
              return view => crypto.getRandomValues(view)
          } else
              abort("initRandomDevice")
      }
      ;
      var randomFill = view => (randomFill = initRandomFill())(view);
      var PATH_FS = {
          resolve: (...args) => {
              var resolvedPath = ""
                , resolvedAbsolute = false;
              for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                  var path = i >= 0 ? args[i] : FS.cwd();
                  if (typeof path != "string") {
                      throw new TypeError("Arguments to path.resolve must be strings")
                  } else if (!path) {
                      return ""
                  }
                  resolvedPath = path + "/" + resolvedPath;
                  resolvedAbsolute = PATH.isAbs(path)
              }
              resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/");
              return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
          }
          ,
          relative: (from, to) => {
              from = PATH_FS.resolve(from).substr(1);
              to = PATH_FS.resolve(to).substr(1);
              function trim(arr) {
                  var start = 0;
                  for (; start < arr.length; start++) {
                      if (arr[start] !== "")
                          break
                  }
                  var end = arr.length - 1;
                  for (; end >= 0; end--) {
                      if (arr[end] !== "")
                          break
                  }
                  if (start > end)
                      return [];
                  return arr.slice(start, end - start + 1)
              }
              var fromParts = trim(from.split("/"));
              var toParts = trim(to.split("/"));
              var length = Math.min(fromParts.length, toParts.length);
              var samePartsLength = length;
              for (var i = 0; i < length; i++) {
                  if (fromParts[i] !== toParts[i]) {
                      samePartsLength = i;
                      break
                  }
              }
              var outputParts = [];
              for (var i = samePartsLength; i < fromParts.length; i++) {
                  outputParts.push("..")
              }
              outputParts = outputParts.concat(toParts.slice(samePartsLength));
              return outputParts.join("/")
          }
      };
      var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder : undefined;
      var UTF8ArrayToString = (heapOrArray, idx=0, maxBytesToRead=NaN) => {
          var endIdx = idx + maxBytesToRead;
          var endPtr = idx;
          while (heapOrArray[endPtr] && !(endPtr >= endIdx))
              ++endPtr;
          if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
              return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr))
          }
          var str = "";
          while (idx < endPtr) {
              var u0 = heapOrArray[idx++];
              if (!(u0 & 128)) {
                  str += String.fromCharCode(u0);
                  continue
              }
              var u1 = heapOrArray[idx++] & 63;
              if ((u0 & 224) == 192) {
                  str += String.fromCharCode((u0 & 31) << 6 | u1);
                  continue
              }
              var u2 = heapOrArray[idx++] & 63;
              if ((u0 & 240) == 224) {
                  u0 = (u0 & 15) << 12 | u1 << 6 | u2
              } else {
                  u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63
              }
              if (u0 < 65536) {
                  str += String.fromCharCode(u0)
              } else {
                  var ch = u0 - 65536;
                  str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
              }
          }
          return str
      }
      ;
      var FS_stdin_getChar_buffer = [];
      var lengthBytesUTF8 = str => {
          var len = 0;
          for (var i = 0; i < str.length; ++i) {
              var c = str.charCodeAt(i);
              if (c <= 127) {
                  len++
              } else if (c <= 2047) {
                  len += 2
              } else if (c >= 55296 && c <= 57343) {
                  len += 4;
                  ++i
              } else {
                  len += 3
              }
          }
          return len
      }
      ;
      var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
          if (!(maxBytesToWrite > 0))
              return 0;
          var startIdx = outIdx;
          var endIdx = outIdx + maxBytesToWrite - 1;
          for (var i = 0; i < str.length; ++i) {
              var u = str.charCodeAt(i);
              if (u >= 55296 && u <= 57343) {
                  var u1 = str.charCodeAt(++i);
                  u = 65536 + ((u & 1023) << 10) | u1 & 1023
              }
              if (u <= 127) {
                  if (outIdx >= endIdx)
                      break;
                  heap[outIdx++] = u
              } else if (u <= 2047) {
                  if (outIdx + 1 >= endIdx)
                      break;
                  heap[outIdx++] = 192 | u >> 6;
                  heap[outIdx++] = 128 | u & 63
              } else if (u <= 65535) {
                  if (outIdx + 2 >= endIdx)
                      break;
                  heap[outIdx++] = 224 | u >> 12;
                  heap[outIdx++] = 128 | u >> 6 & 63;
                  heap[outIdx++] = 128 | u & 63
              } else {
                  if (outIdx + 3 >= endIdx)
                      break;
                  heap[outIdx++] = 240 | u >> 18;
                  heap[outIdx++] = 128 | u >> 12 & 63;
                  heap[outIdx++] = 128 | u >> 6 & 63;
                  heap[outIdx++] = 128 | u & 63
              }
          }
          heap[outIdx] = 0;
          return outIdx - startIdx
      }
      ;
      function intArrayFromString(stringy, dontAddNull, length) {
          var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
          var u8array = new Array(len);
          var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
          if (dontAddNull)
              u8array.length = numBytesWritten;
          return u8array
      }
      var FS_stdin_getChar = () => {
          if (!FS_stdin_getChar_buffer.length) {
              var result = null;
              if (typeof window != "undefined" && typeof window.prompt == "function") {
                  result = window.prompt("Input: ");
                  if (result !== null) {
                      result += "\n"
                  }
              } else {}
              if (!result) {
                  return null
              }
              FS_stdin_getChar_buffer = intArrayFromString(result, true)
          }
          return FS_stdin_getChar_buffer.shift()
      }
      ;
      var TTY = {
          ttys: [],
          init() {},
          shutdown() {},
          register(dev, ops) {
              TTY.ttys[dev] = {
                  input: [],
                  output: [],
                  ops
              };
              FS.registerDevice(dev, TTY.stream_ops)
          },
          stream_ops: {
              open(stream) {
                  var tty = TTY.ttys[stream.node.rdev];
                  if (!tty) {
                      throw new FS.ErrnoError(43)
                  }
                  stream.tty = tty;
                  stream.seekable = false
              },
              close(stream) {
                  stream.tty.ops.fsync(stream.tty)
              },
              fsync(stream) {
                  stream.tty.ops.fsync(stream.tty)
              },
              read(stream, buffer, offset, length, pos) {
                  if (!stream.tty || !stream.tty.ops.get_char) {
                      throw new FS.ErrnoError(60)
                  }
                  var bytesRead = 0;
                  for (var i = 0; i < length; i++) {
                      var result;
                      try {
                          result = stream.tty.ops.get_char(stream.tty)
                      } catch (e) {
                          throw new FS.ErrnoError(29)
                      }
                      if (result === undefined && bytesRead === 0) {
                          throw new FS.ErrnoError(6)
                      }
                      if (result === null || result === undefined)
                          break;
                      bytesRead++;
                      buffer[offset + i] = result
                  }
                  if (bytesRead) {
                      stream.node.atime = Date.now()
                  }
                  return bytesRead
              },
              write(stream, buffer, offset, length, pos) {
                  if (!stream.tty || !stream.tty.ops.put_char) {
                      throw new FS.ErrnoError(60)
                  }
                  try {
                      for (var i = 0; i < length; i++) {
                          stream.tty.ops.put_char(stream.tty, buffer[offset + i])
                      }
                  } catch (e) {
                      throw new FS.ErrnoError(29)
                  }
                  if (length) {
                      stream.node.mtime = stream.node.ctime = Date.now()
                  }
                  return i
              }
          },
          default_tty_ops: {
              get_char(tty) {
                  return FS_stdin_getChar()
              },
              put_char(tty, val) {
                  if (val === null || val === 10) {
                      out(UTF8ArrayToString(tty.output));
                      tty.output = []
                  } else {
                      if (val != 0)
                          tty.output.push(val)
                  }
              },
              fsync(tty) {
                  if (tty.output && tty.output.length > 0) {
                      out(UTF8ArrayToString(tty.output));
                      tty.output = []
                  }
              },
              ioctl_tcgets(tty) {
                  return {
                      c_iflag: 25856,
                      c_oflag: 5,
                      c_cflag: 191,
                      c_lflag: 35387,
                      c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                  }
              },
              ioctl_tcsets(tty, optional_actions, data) {
                  return 0
              },
              ioctl_tiocgwinsz(tty) {
                  return [24, 80]
              }
          },
          default_tty1_ops: {
              put_char(tty, val) {
                  if (val === null || val === 10) {
                      err(UTF8ArrayToString(tty.output));
                      tty.output = []
                  } else {
                      if (val != 0)
                          tty.output.push(val)
                  }
              },
              fsync(tty) {
                  if (tty.output && tty.output.length > 0) {
                      err(UTF8ArrayToString(tty.output));
                      tty.output = []
                  }
              }
          }
      };
      var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
      var mmapAlloc = size => {
          abort()
      }
      ;
      var MEMFS = {
          ops_table: null,
          mount(mount) {
              return MEMFS.createNode(null, "/", 16895, 0)
          },
          createNode(parent, name, mode, dev) {
              if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
                  throw new FS.ErrnoError(63)
              }
              MEMFS.ops_table ||= {
                  dir: {
                      node: {
                          getattr: MEMFS.node_ops.getattr,
                          setattr: MEMFS.node_ops.setattr,
                          lookup: MEMFS.node_ops.lookup,
                          mknod: MEMFS.node_ops.mknod,
                          rename: MEMFS.node_ops.rename,
                          unlink: MEMFS.node_ops.unlink,
                          rmdir: MEMFS.node_ops.rmdir,
                          readdir: MEMFS.node_ops.readdir,
                          symlink: MEMFS.node_ops.symlink
                      },
                      stream: {
                          llseek: MEMFS.stream_ops.llseek
                      }
                  },
                  file: {
                      node: {
                          getattr: MEMFS.node_ops.getattr,
                          setattr: MEMFS.node_ops.setattr
                      },
                      stream: {
                          llseek: MEMFS.stream_ops.llseek,
                          read: MEMFS.stream_ops.read,
                          write: MEMFS.stream_ops.write,
                          allocate: MEMFS.stream_ops.allocate,
                          mmap: MEMFS.stream_ops.mmap,
                          msync: MEMFS.stream_ops.msync
                      }
                  },
                  link: {
                      node: {
                          getattr: MEMFS.node_ops.getattr,
                          setattr: MEMFS.node_ops.setattr,
                          readlink: MEMFS.node_ops.readlink
                      },
                      stream: {}
                  },
                  chrdev: {
                      node: {
                          getattr: MEMFS.node_ops.getattr,
                          setattr: MEMFS.node_ops.setattr
                      },
                      stream: FS.chrdev_stream_ops
                  }
              };
              var node = FS.createNode(parent, name, mode, dev);
              if (FS.isDir(node.mode)) {
                  node.node_ops = MEMFS.ops_table.dir.node;
                  node.stream_ops = MEMFS.ops_table.dir.stream;
                  node.contents = {}
              } else if (FS.isFile(node.mode)) {
                  node.node_ops = MEMFS.ops_table.file.node;
                  node.stream_ops = MEMFS.ops_table.file.stream;
                  node.usedBytes = 0;
                  node.contents = null
              } else if (FS.isLink(node.mode)) {
                  node.node_ops = MEMFS.ops_table.link.node;
                  node.stream_ops = MEMFS.ops_table.link.stream
              } else if (FS.isChrdev(node.mode)) {
                  node.node_ops = MEMFS.ops_table.chrdev.node;
                  node.stream_ops = MEMFS.ops_table.chrdev.stream
              }
              node.atime = node.mtime = node.ctime = Date.now();
              if (parent) {
                  parent.contents[name] = node;
                  parent.atime = parent.mtime = parent.ctime = node.atime
              }
              return node
          },
          getFileDataAsTypedArray(node) {
              if (!node.contents)
                  return new Uint8Array(0);
              if (node.contents.subarray)
                  return node.contents.subarray(0, node.usedBytes);
              return new Uint8Array(node.contents)
          },
          expandFileStorage(node, newCapacity) {
              var prevCapacity = node.contents ? node.contents.length : 0;
              if (prevCapacity >= newCapacity)
                  return;
              var CAPACITY_DOUBLING_MAX = 1024 * 1024;
              newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
              if (prevCapacity != 0)
                  newCapacity = Math.max(newCapacity, 256);
              var oldContents = node.contents;
              node.contents = new Uint8Array(newCapacity);
              if (node.usedBytes > 0)
                  node.contents.set(oldContents.subarray(0, node.usedBytes), 0)
          },
          resizeFileStorage(node, newSize) {
              if (node.usedBytes == newSize)
                  return;
              if (newSize == 0) {
                  node.contents = null;
                  node.usedBytes = 0
              } else {
                  var oldContents = node.contents;
                  node.contents = new Uint8Array(newSize);
                  if (oldContents) {
                      node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
                  }
                  node.usedBytes = newSize
              }
          },
          node_ops: {
              getattr(node) {
                  var attr = {};
                  attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
                  attr.ino = node.id;
                  attr.mode = node.mode;
                  attr.nlink = 1;
                  attr.uid = 0;
                  attr.gid = 0;
                  attr.rdev = node.rdev;
                  if (FS.isDir(node.mode)) {
                      attr.size = 4096
                  } else if (FS.isFile(node.mode)) {
                      attr.size = node.usedBytes
                  } else if (FS.isLink(node.mode)) {
                      attr.size = node.link.length
                  } else {
                      attr.size = 0
                  }
                  attr.atime = new Date(node.atime);
                  attr.mtime = new Date(node.mtime);
                  attr.ctime = new Date(node.ctime);
                  attr.blksize = 4096;
                  attr.blocks = Math.ceil(attr.size / attr.blksize);
                  return attr
              },
              setattr(node, attr) {
                  for (const key of ["mode", "atime", "mtime", "ctime"]) {
                      if (attr[key]) {
                          node[key] = attr[key]
                      }
                  }
                  if (attr.size !== undefined) {
                      MEMFS.resizeFileStorage(node, attr.size)
                  }
              },
              lookup(parent, name) {
                  throw MEMFS.doesNotExistError
              },
              mknod(parent, name, mode, dev) {
                  return MEMFS.createNode(parent, name, mode, dev)
              },
              rename(old_node, new_dir, new_name) {
                  var new_node;
                  try {
                      new_node = FS.lookupNode(new_dir, new_name)
                  } catch (e) {}
                  if (new_node) {
                      if (FS.isDir(old_node.mode)) {
                          for (var i in new_node.contents) {
                              throw new FS.ErrnoError(55)
                          }
                      }
                      FS.hashRemoveNode(new_node)
                  }
                  delete old_node.parent.contents[old_node.name];
                  new_dir.contents[new_name] = old_node;
                  old_node.name = new_name;
                  new_dir.ctime = new_dir.mtime = old_node.parent.ctime = old_node.parent.mtime = Date.now()
              },
              unlink(parent, name) {
                  delete parent.contents[name];
                  parent.ctime = parent.mtime = Date.now()
              },
              rmdir(parent, name) {
                  var node = FS.lookupNode(parent, name);
                  for (var i in node.contents) {
                      throw new FS.ErrnoError(55)
                  }
                  delete parent.contents[name];
                  parent.ctime = parent.mtime = Date.now()
              },
              readdir(node) {
                  return [".", "..", ...Object.keys(node.contents)]
              },
              symlink(parent, newname, oldpath) {
                  var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
                  node.link = oldpath;
                  return node
              },
              readlink(node) {
                  if (!FS.isLink(node.mode)) {
                      throw new FS.ErrnoError(28)
                  }
                  return node.link
              }
          },
          stream_ops: {
              read(stream, buffer, offset, length, position) {
                  var contents = stream.node.contents;
                  if (position >= stream.node.usedBytes)
                      return 0;
                  var size = Math.min(stream.node.usedBytes - position, length);
                  if (size > 8 && contents.subarray) {
                      buffer.set(contents.subarray(position, position + size), offset)
                  } else {
                      for (var i = 0; i < size; i++)
                          buffer[offset + i] = contents[position + i]
                  }
                  return size
              },
              write(stream, buffer, offset, length, position, canOwn) {
                  if (buffer.buffer === HEAP8.buffer) {
                      canOwn = false
                  }
                  if (!length)
                      return 0;
                  var node = stream.node;
                  node.mtime = node.ctime = Date.now();
                  if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                      if (canOwn) {
                          node.contents = buffer.subarray(offset, offset + length);
                          node.usedBytes = length;
                          return length
                      } else if (node.usedBytes === 0 && position === 0) {
                          node.contents = buffer.slice(offset, offset + length);
                          node.usedBytes = length;
                          return length
                      } else if (position + length <= node.usedBytes) {
                          node.contents.set(buffer.subarray(offset, offset + length), position);
                          return length
                      }
                  }
                  MEMFS.expandFileStorage(node, position + length);
                  if (node.contents.subarray && buffer.subarray) {
                      node.contents.set(buffer.subarray(offset, offset + length), position)
                  } else {
                      for (var i = 0; i < length; i++) {
                          node.contents[position + i] = buffer[offset + i]
                      }
                  }
                  node.usedBytes = Math.max(node.usedBytes, position + length);
                  return length
              },
              llseek(stream, offset, whence) {
                  var position = offset;
                  if (whence === 1) {
                      position += stream.position
                  } else if (whence === 2) {
                      if (FS.isFile(stream.node.mode)) {
                          position += stream.node.usedBytes
                      }
                  }
                  if (position < 0) {
                      throw new FS.ErrnoError(28)
                  }
                  return position
              },
              allocate(stream, offset, length) {
                  MEMFS.expandFileStorage(stream.node, offset + length);
                  stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
              },
              mmap(stream, length, position, prot, flags) {
                  if (!FS.isFile(stream.node.mode)) {
                      throw new FS.ErrnoError(43)
                  }
                  var ptr;
                  var allocated;
                  var contents = stream.node.contents;
                  if (!(flags & 2) && contents && contents.buffer === HEAP8.buffer) {
                      allocated = false;
                      ptr = contents.byteOffset
                  } else {
                      allocated = true;
                      ptr = mmapAlloc(length);
                      if (!ptr) {
                          throw new FS.ErrnoError(48)
                      }
                      if (contents) {
                          if (position > 0 || position + length < contents.length) {
                              if (contents.subarray) {
                                  contents = contents.subarray(position, position + length)
                              } else {
                                  contents = Array.prototype.slice.call(contents, position, position + length)
                              }
                          }
                          HEAP8.set(contents, ptr)
                      }
                  }
                  return {
                      ptr,
                      allocated
                  }
              },
              msync(stream, buffer, offset, length, mmapFlags) {
                  MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
                  return 0
              }
          }
      };
      var asyncLoad = async url => {
          var arrayBuffer = await readAsync(url);
          return new Uint8Array(arrayBuffer)
      }
      ;
      var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
          FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn)
      }
      ;
      var preloadPlugins = Module["preloadPlugins"] || [];
      var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
          if (typeof Browser != "undefined")
              Browser.init();
          var handled = false;
          preloadPlugins.forEach(plugin => {
              if (handled)
                  return;
              if (plugin["canHandle"](fullname)) {
                  plugin["handle"](byteArray, fullname, finish, onerror);
                  handled = true
              }
          }
          );
          return handled
      }
      ;
      var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
          var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
          var dep = getUniqueRunDependency(`cp ${fullname}`);
          function processData(byteArray) {
              function finish(byteArray) {
                  preFinish?.();
                  if (!dontCreateFile) {
                      FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
                  }
                  onload?.();
                  removeRunDependency(dep)
              }
              if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
                  onerror?.();
                  removeRunDependency(dep)
              }
              )) {
                  return
              }
              finish(byteArray)
          }
          addRunDependency(dep);
          if (typeof url == "string") {
              asyncLoad(url).then(processData, onerror)
          } else {
              processData(url)
          }
      }
      ;
      var FS_modeStringToFlags = str => {
          var flagModes = {
              r: 0,
              "r+": 2,
              w: 512 | 64 | 1,
              "w+": 512 | 64 | 2,
              a: 1024 | 64 | 1,
              "a+": 1024 | 64 | 2
          };
          var flags = flagModes[str];
          if (typeof flags == "undefined") {
              throw new Error(`Unknown file open mode: ${str}`)
          }
          return flags
      }
      ;
      var FS_getMode = (canRead, canWrite) => {
          var mode = 0;
          if (canRead)
              mode |= 292 | 73;
          if (canWrite)
              mode |= 146;
          return mode
      }
      ;
      var FS = {
          root: null,
          mounts: [],
          devices: {},
          streams: [],
          nextInode: 1,
          nameTable: null,
          currentPath: "/",
          initialized: false,
          ignorePermissions: true,
          ErrnoError: class {
              name = "ErrnoError";
              constructor(errno) {
                  this.errno = errno
              }
          }
          ,
          filesystems: null,
          syncFSRequests: 0,
          readFiles: {},
          FSStream: class {
              shared = {};
              get object() {
                  return this.node
              }
              set object(val) {
                  this.node = val
              }
              get isRead() {
                  return (this.flags & 2097155) !== 1
              }
              get isWrite() {
                  return (this.flags & 2097155) !== 0
              }
              get isAppend() {
                  return this.flags & 1024
              }
              get flags() {
                  return this.shared.flags
              }
              set flags(val) {
                  this.shared.flags = val
              }
              get position() {
                  return this.shared.position
              }
              set position(val) {
                  this.shared.position = val
              }
          }
          ,
          FSNode: class {
              node_ops = {};
              stream_ops = {};
              readMode = 292 | 73;
              writeMode = 146;
              mounted = null;
              constructor(parent, name, mode, rdev) {
                  if (!parent) {
                      parent = this
                  }
                  this.parent = parent;
                  this.mount = parent.mount;
                  this.id = FS.nextInode++;
                  this.name = name;
                  this.mode = mode;
                  this.rdev = rdev;
                  this.atime = this.mtime = this.ctime = Date.now()
              }
              get read() {
                  return (this.mode & this.readMode) === this.readMode
              }
              set read(val) {
                  val ? this.mode |= this.readMode : this.mode &= ~this.readMode
              }
              get write() {
                  return (this.mode & this.writeMode) === this.writeMode
              }
              set write(val) {
                  val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode
              }
              get isFolder() {
                  return FS.isDir(this.mode)
              }
              get isDevice() {
                  return FS.isChrdev(this.mode)
              }
          }
          ,
          lookupPath(path, opts={}) {
              if (!path)
                  return {
                      path: "",
                      node: null
                  };
              opts.follow_mount ??= true;
              if (!PATH.isAbs(path)) {
                  path = FS.cwd() + "/" + path
              }
              linkloop: for (var nlinks = 0; nlinks < 40; nlinks++) {
                  var parts = path.split("/").filter(p => !!p && p !== ".");
                  var current = FS.root;
                  var current_path = "/";
                  for (var i = 0; i < parts.length; i++) {
                      var islast = i === parts.length - 1;
                      if (islast && opts.parent) {
                          break
                      }
                      if (parts[i] === "..") {
                          current_path = PATH.dirname(current_path);
                          current = current.parent;
                          continue
                      }
                      current_path = PATH.join2(current_path, parts[i]);
                      try {
                          current = FS.lookupNode(current, parts[i])
                      } catch (e) {
                          if (e?.errno === 44 && islast && opts.noent_okay) {
                              return {
                                  path: current_path
                              }
                          }
                          throw e
                      }
                      if (FS.isMountpoint(current) && (!islast || opts.follow_mount)) {
                          current = current.mounted.root
                      }
                      if (FS.isLink(current.mode) && (!islast || opts.follow)) {
                          if (!current.node_ops.readlink) {
                              throw new FS.ErrnoError(52)
                          }
                          var link = current.node_ops.readlink(current);
                          if (!PATH.isAbs(link)) {
                              link = PATH.dirname(current_path) + "/" + link
                          }
                          path = link + "/" + parts.slice(i + 1).join("/");
                          continue linkloop
                      }
                  }
                  return {
                      path: current_path,
                      node: current
                  }
              }
              throw new FS.ErrnoError(32)
          },
          getPath(node) {
              var path;
              while (true) {
                  if (FS.isRoot(node)) {
                      var mount = node.mount.mountpoint;
                      if (!path)
                          return mount;
                      return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path
                  }
                  path = path ? `${node.name}/${path}` : node.name;
                  node = node.parent
              }
          },
          hashName(parentid, name) {
              var hash = 0;
              for (var i = 0; i < name.length; i++) {
                  hash = (hash << 5) - hash + name.charCodeAt(i) | 0
              }
              return (parentid + hash >>> 0) % FS.nameTable.length
          },
          hashAddNode(node) {
              var hash = FS.hashName(node.parent.id, node.name);
              node.name_next = FS.nameTable[hash];
              FS.nameTable[hash] = node
          },
          hashRemoveNode(node) {
              var hash = FS.hashName(node.parent.id, node.name);
              if (FS.nameTable[hash] === node) {
                  FS.nameTable[hash] = node.name_next
              } else {
                  var current = FS.nameTable[hash];
                  while (current) {
                      if (current.name_next === node) {
                          current.name_next = node.name_next;
                          break
                      }
                      current = current.name_next
                  }
              }
          },
          lookupNode(parent, name) {
              var errCode = FS.mayLookup(parent);
              if (errCode) {
                  throw new FS.ErrnoError(errCode)
              }
              var hash = FS.hashName(parent.id, name);
              for (var node = FS.nameTable[hash]; node; node = node.name_next) {
                  var nodeName = node.name;
                  if (node.parent.id === parent.id && nodeName === name) {
                      return node
                  }
              }
              return FS.lookup(parent, name)
          },
          createNode(parent, name, mode, rdev) {
              var node = new FS.FSNode(parent,name,mode,rdev);
              FS.hashAddNode(node);
              return node
          },
          destroyNode(node) {
              FS.hashRemoveNode(node)
          },
          isRoot(node) {
              return node === node.parent
          },
          isMountpoint(node) {
              return !!node.mounted
          },
          isFile(mode) {
              return (mode & 61440) === 32768
          },
          isDir(mode) {
              return (mode & 61440) === 16384
          },
          isLink(mode) {
              return (mode & 61440) === 40960
          },
          isChrdev(mode) {
              return (mode & 61440) === 8192
          },
          isBlkdev(mode) {
              return (mode & 61440) === 24576
          },
          isFIFO(mode) {
              return (mode & 61440) === 4096
          },
          isSocket(mode) {
              return (mode & 49152) === 49152
          },
          flagsToPermissionString(flag) {
              var perms = ["r", "w", "rw"][flag & 3];
              if (flag & 512) {
                  perms += "w"
              }
              return perms
          },
          nodePermissions(node, perms) {
              if (FS.ignorePermissions) {
                  return 0
              }
              if (perms.includes("r") && !(node.mode & 292)) {
                  return 2
              } else if (perms.includes("w") && !(node.mode & 146)) {
                  return 2
              } else if (perms.includes("x") && !(node.mode & 73)) {
                  return 2
              }
              return 0
          },
          mayLookup(dir) {
              if (!FS.isDir(dir.mode))
                  return 54;
              var errCode = FS.nodePermissions(dir, "x");
              if (errCode)
                  return errCode;
              if (!dir.node_ops.lookup)
                  return 2;
              return 0
          },
          mayCreate(dir, name) {
              if (!FS.isDir(dir.mode)) {
                  return 54
              }
              try {
                  var node = FS.lookupNode(dir, name);
                  return 20
              } catch (e) {}
              return FS.nodePermissions(dir, "wx")
          },
          mayDelete(dir, name, isdir) {
              var node;
              try {
                  node = FS.lookupNode(dir, name)
              } catch (e) {
                  return e.errno
              }
              var errCode = FS.nodePermissions(dir, "wx");
              if (errCode) {
                  return errCode
              }
              if (isdir) {
                  if (!FS.isDir(node.mode)) {
                      return 54
                  }
                  if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                      return 10
                  }
              } else {
                  if (FS.isDir(node.mode)) {
                      return 31
                  }
              }
              return 0
          },
          mayOpen(node, flags) {
              if (!node) {
                  return 44
              }
              if (FS.isLink(node.mode)) {
                  return 32
              } else if (FS.isDir(node.mode)) {
                  if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                      return 31
                  }
              }
              return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
          },
          MAX_OPEN_FDS: 4096,
          nextfd() {
              for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
                  if (!FS.streams[fd]) {
                      return fd
                  }
              }
              throw new FS.ErrnoError(33)
          },
          getStreamChecked(fd) {
              var stream = FS.getStream(fd);
              if (!stream) {
                  throw new FS.ErrnoError(8)
              }
              return stream
          },
          getStream: fd => FS.streams[fd],
          createStream(stream, fd=-1) {
              stream = Object.assign(new FS.FSStream, stream);
              if (fd == -1) {
                  fd = FS.nextfd()
              }
              stream.fd = fd;
              FS.streams[fd] = stream;
              return stream
          },
          closeStream(fd) {
              FS.streams[fd] = null
          },
          dupStream(origStream, fd=-1) {
              var stream = FS.createStream(origStream, fd);
              stream.stream_ops?.dup?.(stream);
              return stream
          },
          chrdev_stream_ops: {
              open(stream) {
                  var device = FS.getDevice(stream.node.rdev);
                  stream.stream_ops = device.stream_ops;
                  stream.stream_ops.open?.(stream)
              },
              llseek() {
                  throw new FS.ErrnoError(70)
              }
          },
          major: dev => dev >> 8,
          minor: dev => dev & 255,
          makedev: (ma, mi) => ma << 8 | mi,
          registerDevice(dev, ops) {
              FS.devices[dev] = {
                  stream_ops: ops
              }
          },
          getDevice: dev => FS.devices[dev],
          getMounts(mount) {
              var mounts = [];
              var check = [mount];
              while (check.length) {
                  var m = check.pop();
                  mounts.push(m);
                  check.push(...m.mounts)
              }
              return mounts
          },
          syncfs(populate, callback) {
              if (typeof populate == "function") {
                  callback = populate;
                  populate = false
              }
              FS.syncFSRequests++;
              if (FS.syncFSRequests > 1) {
                  err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`)
              }
              var mounts = FS.getMounts(FS.root.mount);
              var completed = 0;
              function doCallback(errCode) {
                  FS.syncFSRequests--;
                  return callback(errCode)
              }
              function done(errCode) {
                  if (errCode) {
                      if (!done.errored) {
                          done.errored = true;
                          return doCallback(errCode)
                      }
                      return
                  }
                  if (++completed >= mounts.length) {
                      doCallback(null)
                  }
              }
              mounts.forEach(mount => {
                  if (!mount.type.syncfs) {
                      return done(null)
                  }
                  mount.type.syncfs(mount, populate, done)
              }
              )
          },
          mount(type, opts, mountpoint) {
              var root = mountpoint === "/";
              var pseudo = !mountpoint;
              var node;
              if (root && FS.root) {
                  throw new FS.ErrnoError(10)
              } else if (!root && !pseudo) {
                  var lookup = FS.lookupPath(mountpoint, {
                      follow_mount: false
                  });
                  mountpoint = lookup.path;
                  node = lookup.node;
                  if (FS.isMountpoint(node)) {
                      throw new FS.ErrnoError(10)
                  }
                  if (!FS.isDir(node.mode)) {
                      throw new FS.ErrnoError(54)
                  }
              }
              var mount = {
                  type,
                  opts,
                  mountpoint,
                  mounts: []
              };
              var mountRoot = type.mount(mount);
              mountRoot.mount = mount;
              mount.root = mountRoot;
              if (root) {
                  FS.root = mountRoot
              } else if (node) {
                  node.mounted = mount;
                  if (node.mount) {
                      node.mount.mounts.push(mount)
                  }
              }
              return mountRoot
          },
          unmount(mountpoint) {
              var lookup = FS.lookupPath(mountpoint, {
                  follow_mount: false
              });
              if (!FS.isMountpoint(lookup.node)) {
                  throw new FS.ErrnoError(28)
              }
              var node = lookup.node;
              var mount = node.mounted;
              var mounts = FS.getMounts(mount);
              Object.keys(FS.nameTable).forEach(hash => {
                  var current = FS.nameTable[hash];
                  while (current) {
                      var next = current.name_next;
                      if (mounts.includes(current.mount)) {
                          FS.destroyNode(current)
                      }
                      current = next
                  }
              }
              );
              node.mounted = null;
              var idx = node.mount.mounts.indexOf(mount);
              node.mount.mounts.splice(idx, 1)
          },
          lookup(parent, name) {
              return parent.node_ops.lookup(parent, name)
          },
          mknod(path, mode, dev) {
              var lookup = FS.lookupPath(path, {
                  parent: true
              });
              var parent = lookup.node;
              var name = PATH.basename(path);
              if (!name || name === "." || name === "..") {
                  throw new FS.ErrnoError(28)
              }
              var errCode = FS.mayCreate(parent, name);
              if (errCode) {
                  throw new FS.ErrnoError(errCode)
              }
              if (!parent.node_ops.mknod) {
                  throw new FS.ErrnoError(63)
              }
              return parent.node_ops.mknod(parent, name, mode, dev)
          },
          statfs(path) {
              var rtn = {
                  bsize: 4096,
                  frsize: 4096,
                  blocks: 1e6,
                  bfree: 5e5,
                  bavail: 5e5,
                  files: FS.nextInode,
                  ffree: FS.nextInode - 1,
                  fsid: 42,
                  flags: 2,
                  namelen: 255
              };
              var parent = FS.lookupPath(path, {
                  follow: true
              }).node;
              if (parent?.node_ops.statfs) {
                  Object.assign(rtn, parent.node_ops.statfs(parent.mount.opts.root))
              }
              return rtn
          },
          create(path, mode=438) {
              mode &= 4095;
              mode |= 32768;
              return FS.mknod(path, mode, 0)
          },
          mkdir(path, mode=511) {
              mode &= 511 | 512;
              mode |= 16384;
              return FS.mknod(path, mode, 0)
          },
          mkdirTree(path, mode) {
              var dirs = path.split("/");
              var d = "";
              for (var i = 0; i < dirs.length; ++i) {
                  if (!dirs[i])
                      continue;
                  d += "/" + dirs[i];
                  try {
                      FS.mkdir(d, mode)
                  } catch (e) {
                      if (e.errno != 20)
                          throw e
                  }
              }
          },
          mkdev(path, mode, dev) {
              if (typeof dev == "undefined") {
                  dev = mode;
                  mode = 438
              }
              mode |= 8192;
              return FS.mknod(path, mode, dev)
          },
          symlink(oldpath, newpath) {
              if (!PATH_FS.resolve(oldpath)) {
                  throw new FS.ErrnoError(44)
              }
              var lookup = FS.lookupPath(newpath, {
                  parent: true
              });
              var parent = lookup.node;
              if (!parent) {
                  throw new FS.ErrnoError(44)
              }
              var newname = PATH.basename(newpath);
              var errCode = FS.mayCreate(parent, newname);
              if (errCode) {
                  throw new FS.ErrnoError(errCode)
              }
              if (!parent.node_ops.symlink) {
                  throw new FS.ErrnoError(63)
              }
              return parent.node_ops.symlink(parent, newname, oldpath)
          },
          rename(old_path, new_path) {
              var old_dirname = PATH.dirname(old_path);
              var new_dirname = PATH.dirname(new_path);
              var old_name = PATH.basename(old_path);
              var new_name = PATH.basename(new_path);
              var lookup, old_dir, new_dir;
              lookup = FS.lookupPath(old_path, {
                  parent: true
              });
              old_dir = lookup.node;
              lookup = FS.lookupPath(new_path, {
                  parent: true
              });
              new_dir = lookup.node;
              if (!old_dir || !new_dir)
                  throw new FS.ErrnoError(44);
              if (old_dir.mount !== new_dir.mount) {
                  throw new FS.ErrnoError(75)
              }
              var old_node = FS.lookupNode(old_dir, old_name);
              var relative = PATH_FS.relative(old_path, new_dirname);
              if (relative.charAt(0) !== ".") {
                  throw new FS.ErrnoError(28)
              }
              relative = PATH_FS.relative(new_path, old_dirname);
              if (relative.charAt(0) !== ".") {
                  throw new FS.ErrnoError(55)
              }
              var new_node;
              try {
                  new_node = FS.lookupNode(new_dir, new_name)
              } catch (e) {}
              if (old_node === new_node) {
                  return
              }
              var isdir = FS.isDir(old_node.mode);
              var errCode = FS.mayDelete(old_dir, old_name, isdir);
              if (errCode) {
                  throw new FS.ErrnoError(errCode)
              }
              errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
              if (errCode) {
                  throw new FS.ErrnoError(errCode)
              }
              if (!old_dir.node_ops.rename) {
                  throw new FS.ErrnoError(63)
              }
              if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
                  throw new FS.ErrnoError(10)
              }
              if (new_dir !== old_dir) {
                  errCode = FS.nodePermissions(old_dir, "w");
                  if (errCode) {
                      throw new FS.ErrnoError(errCode)
                  }
              }
              FS.hashRemoveNode(old_node);
              try {
                  old_dir.node_ops.rename(old_node, new_dir, new_name);
                  old_node.parent = new_dir
              } catch (e) {
                  throw e
              } finally {
                  FS.hashAddNode(old_node)
              }
          },
          rmdir(path) {
              var lookup = FS.lookupPath(path, {
                  parent: true
              });
              var parent = lookup.node;
              var name = PATH.basename(path);
              var node = FS.lookupNode(parent, name);
              var errCode = FS.mayDelete(parent, name, true);
              if (errCode) {
                  throw new FS.ErrnoError(errCode)
              }
              if (!parent.node_ops.rmdir) {
                  throw new FS.ErrnoError(63)
              }
              if (FS.isMountpoint(node)) {
                  throw new FS.ErrnoError(10)
              }
              parent.node_ops.rmdir(parent, name);
              FS.destroyNode(node)
          },
          readdir(path) {
              var lookup = FS.lookupPath(path, {
                  follow: true
              });
              var node = lookup.node;
              if (!node.node_ops.readdir) {
                  throw new FS.ErrnoError(54)
              }
              return node.node_ops.readdir(node)
          },
          unlink(path) {
              var lookup = FS.lookupPath(path, {
                  parent: true
              });
              var parent = lookup.node;
              if (!parent) {
                  throw new FS.ErrnoError(44)
              }
              var name = PATH.basename(path);
              var node = FS.lookupNode(parent, name);
              var errCode = FS.mayDelete(parent, name, false);
              if (errCode) {
                  throw new FS.ErrnoError(errCode)
              }
              if (!parent.node_ops.unlink) {
                  throw new FS.ErrnoError(63)
              }
              if (FS.isMountpoint(node)) {
                  throw new FS.ErrnoError(10)
              }
              parent.node_ops.unlink(parent, name);
              FS.destroyNode(node)
          },
          readlink(path) {
              var lookup = FS.lookupPath(path);
              var link = lookup.node;
              if (!link) {
                  throw new FS.ErrnoError(44)
              }
              if (!link.node_ops.readlink) {
                  throw new FS.ErrnoError(28)
              }
              return link.node_ops.readlink(link)
          },
          stat(path, dontFollow) {
              var lookup = FS.lookupPath(path, {
                  follow: !dontFollow
              });
              var node = lookup.node;
              if (!node) {
                  throw new FS.ErrnoError(44)
              }
              if (!node.node_ops.getattr) {
                  throw new FS.ErrnoError(63)
              }
              return node.node_ops.getattr(node)
          },
          lstat(path) {
              return FS.stat(path, true)
          },
          chmod(path, mode, dontFollow) {
              var node;
              if (typeof path == "string") {
                  var lookup = FS.lookupPath(path, {
                      follow: !dontFollow
                  });
                  node = lookup.node
              } else {
                  node = path
              }
              if (!node.node_ops.setattr) {
                  throw new FS.ErrnoError(63)
              }
              node.node_ops.setattr(node, {
                  mode: mode & 4095 | node.mode & ~4095,
                  ctime: Date.now()
              })
          },
          lchmod(path, mode) {
              FS.chmod(path, mode, true)
          },
          fchmod(fd, mode) {
              var stream = FS.getStreamChecked(fd);
              FS.chmod(stream.node, mode)
          },
          chown(path, uid, gid, dontFollow) {
              var node;
              if (typeof path == "string") {
                  var lookup = FS.lookupPath(path, {
                      follow: !dontFollow
                  });
                  node = lookup.node
              } else {
                  node = path
              }
              if (!node.node_ops.setattr) {
                  throw new FS.ErrnoError(63)
              }
              node.node_ops.setattr(node, {
                  timestamp: Date.now()
              })
          },
          lchown(path, uid, gid) {
              FS.chown(path, uid, gid, true)
          },
          fchown(fd, uid, gid) {
              var stream = FS.getStreamChecked(fd);
              FS.chown(stream.node, uid, gid)
          },
          truncate(path, len) {
              if (len < 0) {
                  throw new FS.ErrnoError(28)
              }
              var node;
              if (typeof path == "string") {
                  var lookup = FS.lookupPath(path, {
                      follow: true
                  });
                  node = lookup.node
              } else {
                  node = path
              }
              if (!node.node_ops.setattr) {
                  throw new FS.ErrnoError(63)
              }
              if (FS.isDir(node.mode)) {
                  throw new FS.ErrnoError(31)
              }
              if (!FS.isFile(node.mode)) {
                  throw new FS.ErrnoError(28)
              }
              var errCode = FS.nodePermissions(node, "w");
              if (errCode) {
                  throw new FS.ErrnoError(errCode)
              }
              node.node_ops.setattr(node, {
                  size: len,
                  timestamp: Date.now()
              })
          },
          ftruncate(fd, len) {
              var stream = FS.getStreamChecked(fd);
              if ((stream.flags & 2097155) === 0) {
                  throw new FS.ErrnoError(28)
              }
              FS.truncate(stream.node, len)
          },
          utime(path, atime, mtime) {
              var lookup = FS.lookupPath(path, {
                  follow: true
              });
              var node = lookup.node;
              node.node_ops.setattr(node, {
                  atime,
                  mtime
              })
          },
          open(path, flags, mode=438) {
              if (path === "") {
                  throw new FS.ErrnoError(44)
              }
              flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
              if (flags & 64) {
                  mode = mode & 4095 | 32768
              } else {
                  mode = 0
              }
              var node;
              if (typeof path == "object") {
                  node = path
              } else {
                  var lookup = FS.lookupPath(path, {
                      follow: !(flags & 131072),
                      noent_okay: true
                  });
                  node = lookup.node;
                  path = lookup.path
              }
              var created = false;
              if (flags & 64) {
                  if (node) {
                      if (flags & 128) {
                          throw new FS.ErrnoError(20)
                      }
                  } else {
                      node = FS.mknod(path, mode, 0);
                      created = true
                  }
              }
              if (!node) {
                  throw new FS.ErrnoError(44)
              }
              if (FS.isChrdev(node.mode)) {
                  flags &= ~512
              }
              if (flags & 65536 && !FS.isDir(node.mode)) {
                  throw new FS.ErrnoError(54)
              }
              if (!created) {
                  var errCode = FS.mayOpen(node, flags);
                  if (errCode) {
                      throw new FS.ErrnoError(errCode)
                  }
              }
              if (flags & 512 && !created) {
                  FS.truncate(node, 0)
              }
              flags &= ~(128 | 512 | 131072);
              var stream = FS.createStream({
                  node,
                  path: FS.getPath(node),
                  flags,
                  seekable: true,
                  position: 0,
                  stream_ops: node.stream_ops,
                  ungotten: [],
                  error: false
              });
              if (stream.stream_ops.open) {
                  stream.stream_ops.open(stream)
              }
              if (Module["logReadFiles"] && !(flags & 1)) {
                  if (!(path in FS.readFiles)) {
                      FS.readFiles[path] = 1
                  }
              }
              return stream
          },
          close(stream) {
              if (FS.isClosed(stream)) {
                  throw new FS.ErrnoError(8)
              }
              if (stream.getdents)
                  stream.getdents = null;
              try {
                  if (stream.stream_ops.close) {
                      stream.stream_ops.close(stream)
                  }
              } catch (e) {
                  throw e
              } finally {
                  FS.closeStream(stream.fd)
              }
              stream.fd = null
          },
          isClosed(stream) {
              return stream.fd === null
          },
          llseek(stream, offset, whence) {
              if (FS.isClosed(stream)) {
                  throw new FS.ErrnoError(8)
              }
              if (!stream.seekable || !stream.stream_ops.llseek) {
                  throw new FS.ErrnoError(70)
              }
              if (whence != 0 && whence != 1 && whence != 2) {
                  throw new FS.ErrnoError(28)
              }
              stream.position = stream.stream_ops.llseek(stream, offset, whence);
              stream.ungotten = [];
              return stream.position
          },
          read(stream, buffer, offset, length, position) {
              if (length < 0 || position < 0) {
                  throw new FS.ErrnoError(28)
              }
              if (FS.isClosed(stream)) {
                  throw new FS.ErrnoError(8)
              }
              if ((stream.flags & 2097155) === 1) {
                  throw new FS.ErrnoError(8)
              }
              if (FS.isDir(stream.node.mode)) {
                  throw new FS.ErrnoError(31)
              }
              if (!stream.stream_ops.read) {
                  throw new FS.ErrnoError(28)
              }
              var seeking = typeof position != "undefined";
              if (!seeking) {
                  position = stream.position
              } else if (!stream.seekable) {
                  throw new FS.ErrnoError(70)
              }
              var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
              if (!seeking)
                  stream.position += bytesRead;
              return bytesRead
          },
          write(stream, buffer, offset, length, position, canOwn) {
              if (length < 0 || position < 0) {
                  throw new FS.ErrnoError(28)
              }
              if (FS.isClosed(stream)) {
                  throw new FS.ErrnoError(8)
              }
              if ((stream.flags & 2097155) === 0) {
                  throw new FS.ErrnoError(8)
              }
              if (FS.isDir(stream.node.mode)) {
                  throw new FS.ErrnoError(31)
              }
              if (!stream.stream_ops.write) {
                  throw new FS.ErrnoError(28)
              }
              if (stream.seekable && stream.flags & 1024) {
                  FS.llseek(stream, 0, 2)
              }
              var seeking = typeof position != "undefined";
              if (!seeking) {
                  position = stream.position
              } else if (!stream.seekable) {
                  throw new FS.ErrnoError(70)
              }
              var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
              if (!seeking)
                  stream.position += bytesWritten;
              return bytesWritten
          },
          allocate(stream, offset, length) {
              if (FS.isClosed(stream)) {
                  throw new FS.ErrnoError(8)
              }
              if (offset < 0 || length <= 0) {
                  throw new FS.ErrnoError(28)
              }
              if ((stream.flags & 2097155) === 0) {
                  throw new FS.ErrnoError(8)
              }
              if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
                  throw new FS.ErrnoError(43)
              }
              if (!stream.stream_ops.allocate) {
                  throw new FS.ErrnoError(138)
              }
              stream.stream_ops.allocate(stream, offset, length)
          },
          mmap(stream, length, position, prot, flags) {
              if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
                  throw new FS.ErrnoError(2)
              }
              if ((stream.flags & 2097155) === 1) {
                  throw new FS.ErrnoError(2)
              }
              if (!stream.stream_ops.mmap) {
                  throw new FS.ErrnoError(43)
              }
              if (!length) {
                  throw new FS.ErrnoError(28)
              }
              return stream.stream_ops.mmap(stream, length, position, prot, flags)
          },
          msync(stream, buffer, offset, length, mmapFlags) {
              if (!stream.stream_ops.msync) {
                  return 0
              }
              return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
          },
          ioctl(stream, cmd, arg) {
              if (!stream.stream_ops.ioctl) {
                  throw new FS.ErrnoError(59)
              }
              return stream.stream_ops.ioctl(stream, cmd, arg)
          },
          readFile(path, opts={}) {
              opts.flags = opts.flags || 0;
              opts.encoding = opts.encoding || "binary";
              if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
                  throw new Error(`Invalid encoding type "${opts.encoding}"`)
              }
              var ret;
              var stream = FS.open(path, opts.flags);
              var stat = FS.stat(path);
              var length = stat.size;
              var buf = new Uint8Array(length);
              FS.read(stream, buf, 0, length, 0);
              if (opts.encoding === "utf8") {
                  ret = UTF8ArrayToString(buf)
              } else if (opts.encoding === "binary") {
                  ret = buf
              }
              FS.close(stream);
              return ret
          },
          writeFile(path, data, opts={}) {
              opts.flags = opts.flags || 577;
              var stream = FS.open(path, opts.flags, opts.mode);
              if (typeof data == "string") {
                  var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
                  var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
                  FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
              } else if (ArrayBuffer.isView(data)) {
                  FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
              } else {
                  throw new Error("Unsupported data type")
              }
              FS.close(stream)
          },
          cwd: () => FS.currentPath,
          chdir(path) {
              var lookup = FS.lookupPath(path, {
                  follow: true
              });
              if (lookup.node === null) {
                  throw new FS.ErrnoError(44)
              }
              if (!FS.isDir(lookup.node.mode)) {
                  throw new FS.ErrnoError(54)
              }
              var errCode = FS.nodePermissions(lookup.node, "x");
              if (errCode) {
                  throw new FS.ErrnoError(errCode)
              }
              FS.currentPath = lookup.path
          },
          createDefaultDirectories() {
              FS.mkdir("/tmp");
              FS.mkdir("/home");
              FS.mkdir("/home/web_user")
          },
          createDefaultDevices() {
              FS.mkdir("/dev");
              FS.registerDevice(FS.makedev(1, 3), {
                  read: () => 0,
                  write: (stream, buffer, offset, length, pos) => length,
                  llseek: () => 0
              });
              FS.mkdev("/dev/null", FS.makedev(1, 3));
              TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
              TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
              FS.mkdev("/dev/tty", FS.makedev(5, 0));
              FS.mkdev("/dev/tty1", FS.makedev(6, 0));
              var randomBuffer = new Uint8Array(1024)
                , randomLeft = 0;
              var randomByte = () => {
                  if (randomLeft === 0) {
                      randomLeft = randomFill(randomBuffer).byteLength
                  }
                  return randomBuffer[--randomLeft]
              }
              ;
              FS.createDevice("/dev", "random", randomByte);
              FS.createDevice("/dev", "urandom", randomByte);
              FS.mkdir("/dev/shm");
              FS.mkdir("/dev/shm/tmp")
          },
          createSpecialDirectories() {
              FS.mkdir("/proc");
              var proc_self = FS.mkdir("/proc/self");
              FS.mkdir("/proc/self/fd");
              FS.mount({
                  mount() {
                      var node = FS.createNode(proc_self, "fd", 16895, 73);
                      node.stream_ops = {
                          llseek: MEMFS.stream_ops.llseek
                      };
                      node.node_ops = {
                          lookup(parent, name) {
                              var fd = +name;
                              var stream = FS.getStreamChecked(fd);
                              var ret = {
                                  parent: null,
                                  mount: {
                                      mountpoint: "fake"
                                  },
                                  node_ops: {
                                      readlink: () => stream.path
                                  },
                                  id: fd + 1
                              };
                              ret.parent = ret;
                              return ret
                          },
                          readdir() {
                              return Array.from(FS.streams.entries()).filter( ([k,v]) => v).map( ([k,v]) => k.toString())
                          }
                      };
                      return node
                  }
              }, {}, "/proc/self/fd")
          },
          createStandardStreams(input, output, error) {
              if (input) {
                  FS.createDevice("/dev", "stdin", input)
              } else {
                  FS.symlink("/dev/tty", "/dev/stdin")
              }
              if (output) {
                  FS.createDevice("/dev", "stdout", null, output)
              } else {
                  FS.symlink("/dev/tty", "/dev/stdout")
              }
              if (error) {
                  FS.createDevice("/dev", "stderr", null, error)
              } else {
                  FS.symlink("/dev/tty1", "/dev/stderr")
              }
              var stdin = FS.open("/dev/stdin", 0);
              var stdout = FS.open("/dev/stdout", 1);
              var stderr = FS.open("/dev/stderr", 1)
          },
          staticInit() {
              FS.nameTable = new Array(4096);
              FS.mount(MEMFS, {}, "/");
              FS.createDefaultDirectories();
              FS.createDefaultDevices();
              FS.createSpecialDirectories();
              FS.filesystems = {
                  MEMFS
              }
          },
          init(input, output, error) {
              FS.initialized = true;
              input ??= Module["stdin"];
              output ??= Module["stdout"];
              error ??= Module["stderr"];
              FS.createStandardStreams(input, output, error)
          },
          quit() {
              FS.initialized = false;
              for (var i = 0; i < FS.streams.length; i++) {
                  var stream = FS.streams[i];
                  if (!stream) {
                      continue
                  }
                  FS.close(stream)
              }
          },
          findObject(path, dontResolveLastLink) {
              var ret = FS.analyzePath(path, dontResolveLastLink);
              if (!ret.exists) {
                  return null
              }
              return ret.object
          },
          analyzePath(path, dontResolveLastLink) {
              try {
                  var lookup = FS.lookupPath(path, {
                      follow: !dontResolveLastLink
                  });
                  path = lookup.path
              } catch (e) {}
              var ret = {
                  isRoot: false,
                  exists: false,
                  error: 0,
                  name: null,
                  path: null,
                  object: null,
                  parentExists: false,
                  parentPath: null,
                  parentObject: null
              };
              try {
                  var lookup = FS.lookupPath(path, {
                      parent: true
                  });
                  ret.parentExists = true;
                  ret.parentPath = lookup.path;
                  ret.parentObject = lookup.node;
                  ret.name = PATH.basename(path);
                  lookup = FS.lookupPath(path, {
                      follow: !dontResolveLastLink
                  });
                  ret.exists = true;
                  ret.path = lookup.path;
                  ret.object = lookup.node;
                  ret.name = lookup.node.name;
                  ret.isRoot = lookup.path === "/"
              } catch (e) {
                  ret.error = e.errno
              }
              return ret
          },
          createPath(parent, path, canRead, canWrite) {
              parent = typeof parent == "string" ? parent : FS.getPath(parent);
              var parts = path.split("/").reverse();
              while (parts.length) {
                  var part = parts.pop();
                  if (!part)
                      continue;
                  var current = PATH.join2(parent, part);
                  try {
                      FS.mkdir(current)
                  } catch (e) {}
                  parent = current
              }
              return current
          },
          createFile(parent, name, properties, canRead, canWrite) {
              var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
              var mode = FS_getMode(canRead, canWrite);
              return FS.create(path, mode)
          },
          createDataFile(parent, name, data, canRead, canWrite, canOwn) {
              var path = name;
              if (parent) {
                  parent = typeof parent == "string" ? parent : FS.getPath(parent);
                  path = name ? PATH.join2(parent, name) : parent
              }
              var mode = FS_getMode(canRead, canWrite);
              var node = FS.create(path, mode);
              if (data) {
                  if (typeof data == "string") {
                      var arr = new Array(data.length);
                      for (var i = 0, len = data.length; i < len; ++i)
                          arr[i] = data.charCodeAt(i);
                      data = arr
                  }
                  FS.chmod(node, mode | 146);
                  var stream = FS.open(node, 577);
                  FS.write(stream, data, 0, data.length, 0, canOwn);
                  FS.close(stream);
                  FS.chmod(node, mode)
              }
          },
          createDevice(parent, name, input, output) {
              var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
              var mode = FS_getMode(!!input, !!output);
              FS.createDevice.major ??= 64;
              var dev = FS.makedev(FS.createDevice.major++, 0);
              FS.registerDevice(dev, {
                  open(stream) {
                      stream.seekable = false
                  },
                  close(stream) {
                      if (output?.buffer?.length) {
                          output(10)
                      }
                  },
                  read(stream, buffer, offset, length, pos) {
                      var bytesRead = 0;
                      for (var i = 0; i < length; i++) {
                          var result;
                          try {
                              result = input()
                          } catch (e) {
                              throw new FS.ErrnoError(29)
                          }
                          if (result === undefined && bytesRead === 0) {
                              throw new FS.ErrnoError(6)
                          }
                          if (result === null || result === undefined)
                              break;
                          bytesRead++;
                          buffer[offset + i] = result
                      }
                      if (bytesRead) {
                          stream.node.atime = Date.now()
                      }
                      return bytesRead
                  },
                  write(stream, buffer, offset, length, pos) {
                      for (var i = 0; i < length; i++) {
                          try {
                              output(buffer[offset + i])
                          } catch (e) {
                              throw new FS.ErrnoError(29)
                          }
                      }
                      if (length) {
                          stream.node.mtime = stream.node.ctime = Date.now()
                      }
                      return i
                  }
              });
              return FS.mkdev(path, mode, dev)
          },
          forceLoadFile(obj) {
              if (obj.isDevice || obj.isFolder || obj.link || obj.contents)
                  return true;
              if (typeof XMLHttpRequest != "undefined") {
                  throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")
              } else {
                  try {
                      obj.contents = readBinary(obj.url);
                      obj.usedBytes = obj.contents.length
                  } catch (e) {
                      throw new FS.ErrnoError(29)
                  }
              }
          },
          createLazyFile(parent, name, url, canRead, canWrite) {
              class LazyUint8Array {
                  lengthKnown = false;
                  chunks = [];
                  get(idx) {
                      if (idx > this.length - 1 || idx < 0) {
                          return undefined
                      }
                      var chunkOffset = idx % this.chunkSize;
                      var chunkNum = idx / this.chunkSize | 0;
                      return this.getter(chunkNum)[chunkOffset]
                  }
                  setDataGetter(getter) {
                      this.getter = getter
                  }
                  cacheLength() {
                      var xhr = new XMLHttpRequest;
                      xhr.open("HEAD", url, false);
                      xhr.send(null);
                      if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304))
                          throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                      var datalength = Number(xhr.getResponseHeader("Content-length"));
                      var header;
                      var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
                      var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
                      var chunkSize = 1024 * 1024;
                      if (!hasByteServing)
                          chunkSize = datalength;
                      var doXHR = (from, to) => {
                          if (from > to)
                              throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                          if (to > datalength - 1)
                              throw new Error("only " + datalength + " bytes available! programmer error!");
                          var xhr = new XMLHttpRequest;
                          xhr.open("GET", url, false);
                          if (datalength !== chunkSize)
                              xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                          xhr.responseType = "arraybuffer";
                          if (xhr.overrideMimeType) {
                              xhr.overrideMimeType("text/plain; charset=x-user-defined")
                          }
                          xhr.send(null);
                          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304))
                              throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                          if (xhr.response !== undefined) {
                              return new Uint8Array(xhr.response || [])
                          }
                          return intArrayFromString(xhr.responseText || "", true)
                      }
                      ;
                      var lazyArray = this;
                      lazyArray.setDataGetter(chunkNum => {
                          var start = chunkNum * chunkSize;
                          var end = (chunkNum + 1) * chunkSize - 1;
                          end = Math.min(end, datalength - 1);
                          if (typeof lazyArray.chunks[chunkNum] == "undefined") {
                              lazyArray.chunks[chunkNum] = doXHR(start, end)
                          }
                          if (typeof lazyArray.chunks[chunkNum] == "undefined")
                              throw new Error("doXHR failed!");
                          return lazyArray.chunks[chunkNum]
                      }
                      );
                      if (usesGzip || !datalength) {
                          chunkSize = datalength = 1;
                          datalength = this.getter(0).length;
                          chunkSize = datalength;
                          out("LazyFiles on gzip forces download of the whole file when length is accessed")
                      }
                      this._length = datalength;
                      this._chunkSize = chunkSize;
                      this.lengthKnown = true
                  }
                  get length() {
                      if (!this.lengthKnown) {
                          this.cacheLength()
                      }
                      return this._length
                  }
                  get chunkSize() {
                      if (!this.lengthKnown) {
                          this.cacheLength()
                      }
                      return this._chunkSize
                  }
              }
              if (typeof XMLHttpRequest != "undefined") {
                  if (!ENVIRONMENT_IS_WORKER)
                      throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                  var lazyArray = new LazyUint8Array;
                  var properties = {
                      isDevice: false,
                      contents: lazyArray
                  }
              } else {
                  var properties = {
                      isDevice: false,
                      url
                  }
              }
              var node = FS.createFile(parent, name, properties, canRead, canWrite);
              if (properties.contents) {
                  node.contents = properties.contents
              } else if (properties.url) {
                  node.contents = null;
                  node.url = properties.url
              }
              Object.defineProperties(node, {
                  usedBytes: {
                      get: function() {
                          return this.contents.length
                      }
                  }
              });
              var stream_ops = {};
              var keys = Object.keys(node.stream_ops);
              keys.forEach(key => {
                  var fn = node.stream_ops[key];
                  stream_ops[key] = (...args) => {
                      FS.forceLoadFile(node);
                      return fn(...args)
                  }
              }
              );
              function writeChunks(stream, buffer, offset, length, position) {
                  var contents = stream.node.contents;
                  if (position >= contents.length)
                      return 0;
                  var size = Math.min(contents.length - position, length);
                  if (contents.slice) {
                      for (var i = 0; i < size; i++) {
                          buffer[offset + i] = contents[position + i]
                      }
                  } else {
                      for (var i = 0; i < size; i++) {
                          buffer[offset + i] = contents.get(position + i)
                      }
                  }
                  return size
              }
              stream_ops.read = (stream, buffer, offset, length, position) => {
                  FS.forceLoadFile(node);
                  return writeChunks(stream, buffer, offset, length, position)
              }
              ;
              stream_ops.mmap = (stream, length, position, prot, flags) => {
                  FS.forceLoadFile(node);
                  var ptr = mmapAlloc(length);
                  if (!ptr) {
                      throw new FS.ErrnoError(48)
                  }
                  writeChunks(stream, HEAP8, ptr, length, position);
                  return {
                      ptr,
                      allocated: true
                  }
              }
              ;
              node.stream_ops = stream_ops;
              return node
          }
      };
      var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
      var SYSCALLS = {
          DEFAULT_POLLMASK: 5,
          calculateAt(dirfd, path, allowEmpty) {
              if (PATH.isAbs(path)) {
                  return path
              }
              var dir;
              if (dirfd === -100) {
                  dir = FS.cwd()
              } else {
                  var dirstream = SYSCALLS.getStreamFromFD(dirfd);
                  dir = dirstream.path
              }
              if (path.length == 0) {
                  if (!allowEmpty) {
                      throw new FS.ErrnoError(44)
                  }
                  return dir
              }
              return dir + "/" + path
          },
          doStat(func, path, buf) {
              var stat = func(path);
              HEAP32[buf >> 2] = stat.dev;
              HEAP32[buf + 4 >> 2] = stat.mode;
              HEAPU32[buf + 8 >> 2] = stat.nlink;
              HEAP32[buf + 12 >> 2] = stat.uid;
              HEAP32[buf + 16 >> 2] = stat.gid;
              HEAP32[buf + 20 >> 2] = stat.rdev;
              tempI64 = [stat.size >>> 0, (tempDouble = stat.size,
              +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
              HEAP32[buf + 24 >> 2] = tempI64[0],
              HEAP32[buf + 28 >> 2] = tempI64[1];
              HEAP32[buf + 32 >> 2] = 4096;
              HEAP32[buf + 36 >> 2] = stat.blocks;
              var atime = stat.atime.getTime();
              var mtime = stat.mtime.getTime();
              var ctime = stat.ctime.getTime();
              tempI64 = [Math.floor(atime / 1e3) >>> 0, (tempDouble = Math.floor(atime / 1e3),
              +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
              HEAP32[buf + 40 >> 2] = tempI64[0],
              HEAP32[buf + 44 >> 2] = tempI64[1];
              HEAPU32[buf + 48 >> 2] = atime % 1e3 * 1e3 * 1e3;
              tempI64 = [Math.floor(mtime / 1e3) >>> 0, (tempDouble = Math.floor(mtime / 1e3),
              +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
              HEAP32[buf + 56 >> 2] = tempI64[0],
              HEAP32[buf + 60 >> 2] = tempI64[1];
              HEAPU32[buf + 64 >> 2] = mtime % 1e3 * 1e3 * 1e3;
              tempI64 = [Math.floor(ctime / 1e3) >>> 0, (tempDouble = Math.floor(ctime / 1e3),
              +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
              HEAP32[buf + 72 >> 2] = tempI64[0],
              HEAP32[buf + 76 >> 2] = tempI64[1];
              HEAPU32[buf + 80 >> 2] = ctime % 1e3 * 1e3 * 1e3;
              tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino,
              +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
              HEAP32[buf + 88 >> 2] = tempI64[0],
              HEAP32[buf + 92 >> 2] = tempI64[1];
              return 0
          },
          doMsync(addr, stream, len, flags, offset) {
              if (!FS.isFile(stream.node.mode)) {
                  throw new FS.ErrnoError(43)
              }
              if (flags & 2) {
                  return 0
              }
              var buffer = HEAPU8.slice(addr, addr + len);
              FS.msync(stream, buffer, offset, len, flags)
          },
          getStreamFromFD(fd) {
              var stream = FS.getStreamChecked(fd);
              return stream
          },
          varargs: undefined,
          getStr(ptr) {
              var ret = UTF8ToString(ptr);
              return ret
          }
      };
      function ___syscall_fcntl64(fd, cmd, varargs) {
          SYSCALLS.varargs = varargs;
          try {
              var stream = SYSCALLS.getStreamFromFD(fd);
              switch (cmd) {
              case 0:
                  {
                      var arg = syscallGetVarargI();
                      if (arg < 0) {
                          return -28
                      }
                      while (FS.streams[arg]) {
                          arg++
                      }
                      var newStream;
                      newStream = FS.dupStream(stream, arg);
                      return newStream.fd
                  }
              case 1:
              case 2:
                  return 0;
              case 3:
                  return stream.flags;
              case 4:
                  {
                      var arg = syscallGetVarargI();
                      stream.flags |= arg;
                      return 0
                  }
              case 12:
                  {
                      var arg = syscallGetVarargP();
                      var offset = 0;
                      HEAP16[arg + offset >> 1] = 2;
                      return 0
                  }
              case 13:
              case 14:
                  return 0
              }
              return -28
          } catch (e) {
              if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                  throw e;
              return -e.errno
          }
      }
      function ___syscall_ioctl(fd, op, varargs) {
          SYSCALLS.varargs = varargs;
          try {
              var stream = SYSCALLS.getStreamFromFD(fd);
              switch (op) {
              case 21509:
                  {
                      if (!stream.tty)
                          return -59;
                      return 0
                  }
              case 21505:
                  {
                      if (!stream.tty)
                          return -59;
                      if (stream.tty.ops.ioctl_tcgets) {
                          var termios = stream.tty.ops.ioctl_tcgets(stream);
                          var argp = syscallGetVarargP();
                          HEAP32[argp >> 2] = termios.c_iflag || 0;
                          HEAP32[argp + 4 >> 2] = termios.c_oflag || 0;
                          HEAP32[argp + 8 >> 2] = termios.c_cflag || 0;
                          HEAP32[argp + 12 >> 2] = termios.c_lflag || 0;
                          for (var i = 0; i < 32; i++) {
                              HEAP8[argp + i + 17] = termios.c_cc[i] || 0
                          }
                          return 0
                      }
                      return 0
                  }
              case 21510:
              case 21511:
              case 21512:
                  {
                      if (!stream.tty)
                          return -59;
                      return 0
                  }
              case 21506:
              case 21507:
              case 21508:
                  {
                      if (!stream.tty)
                          return -59;
                      if (stream.tty.ops.ioctl_tcsets) {
                          var argp = syscallGetVarargP();
                          var c_iflag = HEAP32[argp >> 2];
                          var c_oflag = HEAP32[argp + 4 >> 2];
                          var c_cflag = HEAP32[argp + 8 >> 2];
                          var c_lflag = HEAP32[argp + 12 >> 2];
                          var c_cc = [];
                          for (var i = 0; i < 32; i++) {
                              c_cc.push(HEAP8[argp + i + 17])
                          }
                          return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
                              c_iflag,
                              c_oflag,
                              c_cflag,
                              c_lflag,
                              c_cc
                          })
                      }
                      return 0
                  }
              case 21519:
                  {
                      if (!stream.tty)
                          return -59;
                      var argp = syscallGetVarargP();
                      HEAP32[argp >> 2] = 0;
                      return 0
                  }
              case 21520:
                  {
                      if (!stream.tty)
                          return -59;
                      return -28
                  }
              case 21531:
                  {
                      var argp = syscallGetVarargP();
                      return FS.ioctl(stream, op, argp)
                  }
              case 21523:
                  {
                      if (!stream.tty)
                          return -59;
                      if (stream.tty.ops.ioctl_tiocgwinsz) {
                          var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
                          var argp = syscallGetVarargP();
                          HEAP16[argp >> 1] = winsize[0];
                          HEAP16[argp + 2 >> 1] = winsize[1]
                      }
                      return 0
                  }
              case 21524:
                  {
                      if (!stream.tty)
                          return -59;
                      return 0
                  }
              case 21515:
                  {
                      if (!stream.tty)
                          return -59;
                      return 0
                  }
              default:
                  return -28
              }
          } catch (e) {
              if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                  throw e;
              return -e.errno
          }
      }
      function ___syscall_openat(dirfd, path, flags, varargs) {
          SYSCALLS.varargs = varargs;
          try {
              path = SYSCALLS.getStr(path);
              path = SYSCALLS.calculateAt(dirfd, path);
              var mode = varargs ? syscallGetVarargI() : 0;
              return FS.open(path, flags, mode).fd
          } catch (e) {
              if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                  throw e;
              return -e.errno
          }
      }
      var __emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);
      var getHeapMax = () => 2147483648;
      var growMemory = size => {
          var b = wasmMemory.buffer;
          var pages = (size - b.byteLength + 65535) / 65536 | 0;
          try {
              wasmMemory.grow(pages);
              updateMemoryViews();
              return 1
          } catch (e) {}
      }
      ;
      var _emscripten_resize_heap = requestedSize => {
          var oldSize = HEAPU8.length;
          requestedSize >>>= 0;
          var maxHeapSize = getHeapMax();
          if (requestedSize > maxHeapSize) {
              return false
          }
          for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
              var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
              overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
              var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
              var replacement = growMemory(newSize);
              if (replacement) {
                  return true
              }
          }
          return false
      }
      ;
      var ENV = {};
      var getExecutableName = () => thisProgram || "./this.program";
      var getEnvStrings = () => {
          if (!getEnvStrings.strings) {
              var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
              var env = {
                  USER: "web_user",
                  LOGNAME: "web_user",
                  PATH: "/",
                  PWD: "/",
                  HOME: "/home/web_user",
                  LANG: lang,
                  _: getExecutableName()
              };
              for (var x in ENV) {
                  if (ENV[x] === undefined)
                      delete env[x];
                  else
                      env[x] = ENV[x]
              }
              var strings = [];
              for (var x in env) {
                  strings.push(`${x}=${env[x]}`)
              }
              getEnvStrings.strings = strings
          }
          return getEnvStrings.strings
      }
      ;
      var stringToAscii = (str, buffer) => {
          for (var i = 0; i < str.length; ++i) {
              HEAP8[buffer++] = str.charCodeAt(i)
          }
          HEAP8[buffer] = 0
      }
      ;
      var _environ_get = (__environ, environ_buf) => {
          var bufSize = 0;
          getEnvStrings().forEach( (string, i) => {
              var ptr = environ_buf + bufSize;
              HEAPU32[__environ + i * 4 >> 2] = ptr;
              stringToAscii(string, ptr);
              bufSize += string.length + 1
          }
          );
          return 0
      }
      ;
      var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
          var strings = getEnvStrings();
          HEAPU32[penviron_count >> 2] = strings.length;
          var bufSize = 0;
          strings.forEach(string => bufSize += string.length + 1);
          HEAPU32[penviron_buf_size >> 2] = bufSize;
          return 0
      }
      ;
      function _fd_close(fd) {
          try {
              var stream = SYSCALLS.getStreamFromFD(fd);
              FS.close(stream);
              return 0
          } catch (e) {
              if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                  throw e;
              return e.errno
          }
      }
      var doReadv = (stream, iov, iovcnt, offset) => {
          var ret = 0;
          for (var i = 0; i < iovcnt; i++) {
              var ptr = HEAPU32[iov >> 2];
              var len = HEAPU32[iov + 4 >> 2];
              iov += 8;
              var curr = FS.read(stream, HEAP8, ptr, len, offset);
              if (curr < 0)
                  return -1;
              ret += curr;
              if (curr < len)
                  break;
              if (typeof offset != "undefined") {
                  offset += curr
              }
          }
          return ret
      }
      ;
      function _fd_read(fd, iov, iovcnt, pnum) {
          try {
              var stream = SYSCALLS.getStreamFromFD(fd);
              var num = doReadv(stream, iov, iovcnt);
              HEAPU32[pnum >> 2] = num;
              return 0
          } catch (e) {
              if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                  throw e;
              return e.errno
          }
      }
      var convertI32PairToI53Checked = (lo, hi) => hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
      function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
          var offset = convertI32PairToI53Checked(offset_low, offset_high);
          try {
              if (isNaN(offset))
                  return 61;
              var stream = SYSCALLS.getStreamFromFD(fd);
              FS.llseek(stream, offset, whence);
              tempI64 = [stream.position >>> 0, (tempDouble = stream.position,
              +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
              HEAP32[newOffset >> 2] = tempI64[0],
              HEAP32[newOffset + 4 >> 2] = tempI64[1];
              if (stream.getdents && offset === 0 && whence === 0)
                  stream.getdents = null;
              return 0
          } catch (e) {
              if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                  throw e;
              return e.errno
          }
      }
      var doWritev = (stream, iov, iovcnt, offset) => {
          var ret = 0;
          for (var i = 0; i < iovcnt; i++) {
              var ptr = HEAPU32[iov >> 2];
              var len = HEAPU32[iov + 4 >> 2];
              iov += 8;
              var curr = FS.write(stream, HEAP8, ptr, len, offset);
              if (curr < 0)
                  return -1;
              ret += curr;
              if (curr < len) {
                  break
              }
              if (typeof offset != "undefined") {
                  offset += curr
              }
          }
          return ret
      }
      ;
      function _fd_write(fd, iov, iovcnt, pnum) {
          try {
              var stream = SYSCALLS.getStreamFromFD(fd);
              var num = doWritev(stream, iov, iovcnt);
              HEAPU32[pnum >> 2] = num;
              return 0
          } catch (e) {
              if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                  throw e;
              return e.errno
          }
      }
      var getCFunc = ident => {
          var func = Module["_" + ident];
          return func
      }
      ;
      var writeArrayToMemory = (array, buffer) => {
          HEAP8.set(array, buffer)
      }
      ;
      var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
      var stackAlloc = sz => __emscripten_stack_alloc(sz);
      var stringToUTF8OnStack = str => {
          var size = lengthBytesUTF8(str) + 1;
          var ret = stackAlloc(size);
          stringToUTF8(str, ret, size);
          return ret
      }
      ;
      var ccall = (ident, returnType, argTypes, args, opts) => {
          var toC = {
              string: str => {
                  var ret = 0;
                  if (str !== null && str !== undefined && str !== 0) {
                      ret = stringToUTF8OnStack(str)
                  }
                  return ret
              }
              ,
              array: arr => {
                  var ret = stackAlloc(arr.length);
                  writeArrayToMemory(arr, ret);
                  return ret
              }
          };
          function convertReturnValue(ret) {
              if (returnType === "string") {
                  return UTF8ToString(ret)
              }
              if (returnType === "boolean")
                  return Boolean(ret);
              return ret
          }
          var func = getCFunc(ident);
          var cArgs = [];
          var stack = 0;
          if (args) {
              for (var i = 0; i < args.length; i++) {
                  var converter = toC[argTypes[i]];
                  if (converter) {
                      if (stack === 0)
                          stack = stackSave();
                      cArgs[i] = converter(args[i])
                  } else {
                      cArgs[i] = args[i]
                  }
              }
          }
          var ret = func(...cArgs);
          function onDone(ret) {
              if (stack !== 0)
                  stackRestore(stack);
              return convertReturnValue(ret)
          }
          ret = onDone(ret);
          return ret
      }
      ;
      var cwrap = (ident, returnType, argTypes, opts) => {
          var numericArgs = !argTypes || argTypes.every(type => type === "number" || type === "boolean");
          var numericRet = returnType !== "string";
          if (numericRet && numericArgs && !opts) {
              return getCFunc(ident)
          }
          return (...args) => ccall(ident, returnType, argTypes, args, opts)
      }
      ;
      var FS_createPath = FS.createPath;
      var FS_unlink = path => FS.unlink(path);
      var FS_createLazyFile = FS.createLazyFile;
      var FS_createDevice = FS.createDevice;
      FS.createPreloadedFile = FS_createPreloadedFile;
      FS.staticInit();
      Module["FS_createPath"] = FS.createPath;
      Module["FS_createDataFile"] = FS.createDataFile;
      Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
      Module["FS_unlink"] = FS.unlink;
      Module["FS_createLazyFile"] = FS.createLazyFile;
      Module["FS_createDevice"] = FS.createDevice;
      MEMFS.doesNotExistError = new FS.ErrnoError(44);
      MEMFS.doesNotExistError.stack = "<generic error, no stack>";
      var wasmImports = {
          c: ___syscall_fcntl64,
          h: ___syscall_ioctl,
          j: ___syscall_openat,
          k: __emscripten_memcpy_js,
          d: _emscripten_resize_heap,
          e: _environ_get,
          f: _environ_sizes_get,
          a: _fd_close,
          g: _fd_read,
          i: _fd_seek,
          b: _fd_write
      };
      var wasmExports;
      createWasm();
      var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["m"])();
      var _swe_sol_eclipse_where = Module["_swe_sol_eclipse_where"] = (a0, a1, a2, a3, a4) => (_swe_sol_eclipse_where = Module["_swe_sol_eclipse_where"] = wasmExports["n"])(a0, a1, a2, a3, a4);
      var _swe_calc = Module["_swe_calc"] = (a0, a1, a2, a3, a4) => (_swe_calc = Module["_swe_calc"] = wasmExports["o"])(a0, a1, a2, a3, a4);
      var _swe_fixstar = Module["_swe_fixstar"] = (a0, a1, a2, a3, a4) => (_swe_fixstar = Module["_swe_fixstar"] = wasmExports["p"])(a0, a1, a2, a3, a4);
      var _swe_sidtime = Module["_swe_sidtime"] = a0 => (_swe_sidtime = Module["_swe_sidtime"] = wasmExports["q"])(a0);
      var _swe_degnorm = Module["_swe_degnorm"] = a0 => (_swe_degnorm = Module["_swe_degnorm"] = wasmExports["r"])(a0);
      var _swe_set_topo = Module["_swe_set_topo"] = (a0, a1, a2) => (_swe_set_topo = Module["_swe_set_topo"] = wasmExports["s"])(a0, a1, a2);
      var _swe_cotrans = Module["_swe_cotrans"] = (a0, a1, a2) => (_swe_cotrans = Module["_swe_cotrans"] = wasmExports["t"])(a0, a1, a2);
      var _swe_refrac_extended = Module["_swe_refrac_extended"] = (a0, a1, a2, a3, a4, a5, a6) => (_swe_refrac_extended = Module["_swe_refrac_extended"] = wasmExports["u"])(a0, a1, a2, a3, a4, a5, a6);
      var _swe_lun_occult_where = Module["_swe_lun_occult_where"] = (a0, a1, a2, a3, a4, a5, a6) => (_swe_lun_occult_where = Module["_swe_lun_occult_where"] = wasmExports["v"])(a0, a1, a2, a3, a4, a5, a6);
      var _swe_sol_eclipse_how = Module["_swe_sol_eclipse_how"] = (a0, a1, a2, a3, a4) => (_swe_sol_eclipse_how = Module["_swe_sol_eclipse_how"] = wasmExports["w"])(a0, a1, a2, a3, a4);
      var _swe_calc_ut = Module["_swe_calc_ut"] = (a0, a1, a2, a3, a4) => (_swe_calc_ut = Module["_swe_calc_ut"] = wasmExports["x"])(a0, a1, a2, a3, a4);
      var _swe_azalt = Module["_swe_azalt"] = (a0, a1, a2, a3, a4, a5, a6) => (_swe_azalt = Module["_swe_azalt"] = wasmExports["y"])(a0, a1, a2, a3, a4, a5, a6);
      var _swe_sol_eclipse_when_glob = Module["_swe_sol_eclipse_when_glob"] = (a0, a1, a2, a3, a4, a5) => (_swe_sol_eclipse_when_glob = Module["_swe_sol_eclipse_when_glob"] = wasmExports["z"])(a0, a1, a2, a3, a4, a5);
      var _swe_lun_occult_when_glob = Module["_swe_lun_occult_when_glob"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_swe_lun_occult_when_glob = Module["_swe_lun_occult_when_glob"] = wasmExports["A"])(a0, a1, a2, a3, a4, a5, a6, a7);
      var _swe_sol_eclipse_when_loc = Module["_swe_sol_eclipse_when_loc"] = (a0, a1, a2, a3, a4, a5, a6) => (_swe_sol_eclipse_when_loc = Module["_swe_sol_eclipse_when_loc"] = wasmExports["B"])(a0, a1, a2, a3, a4, a5, a6);
      var _swe_rise_trans = Module["_swe_rise_trans"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_swe_rise_trans = Module["_swe_rise_trans"] = wasmExports["C"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
      var _swe_lun_occult_when_loc = Module["_swe_lun_occult_when_loc"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_swe_lun_occult_when_loc = Module["_swe_lun_occult_when_loc"] = wasmExports["D"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
      var _swe_azalt_rev = Module["_swe_azalt_rev"] = (a0, a1, a2, a3, a4) => (_swe_azalt_rev = Module["_swe_azalt_rev"] = wasmExports["E"])(a0, a1, a2, a3, a4);
      var _swe_refrac = Module["_swe_refrac"] = (a0, a1, a2, a3) => (_swe_refrac = Module["_swe_refrac"] = wasmExports["F"])(a0, a1, a2, a3);
      var _swe_set_lapse_rate = Module["_swe_set_lapse_rate"] = a0 => (_swe_set_lapse_rate = Module["_swe_set_lapse_rate"] = wasmExports["G"])(a0);
      var _swe_lun_eclipse_how = Module["_swe_lun_eclipse_how"] = (a0, a1, a2, a3, a4) => (_swe_lun_eclipse_how = Module["_swe_lun_eclipse_how"] = wasmExports["H"])(a0, a1, a2, a3, a4);
      var _swe_lun_eclipse_when = Module["_swe_lun_eclipse_when"] = (a0, a1, a2, a3, a4, a5) => (_swe_lun_eclipse_when = Module["_swe_lun_eclipse_when"] = wasmExports["I"])(a0, a1, a2, a3, a4, a5);
      var _swe_lun_eclipse_when_loc = Module["_swe_lun_eclipse_when_loc"] = (a0, a1, a2, a3, a4, a5, a6) => (_swe_lun_eclipse_when_loc = Module["_swe_lun_eclipse_when_loc"] = wasmExports["J"])(a0, a1, a2, a3, a4, a5, a6);
      var _swe_rise_trans_true_hor = Module["_swe_rise_trans_true_hor"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) => (_swe_rise_trans_true_hor = Module["_swe_rise_trans_true_hor"] = wasmExports["K"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
      var _swe_pheno = Module["_swe_pheno"] = (a0, a1, a2, a3, a4) => (_swe_pheno = Module["_swe_pheno"] = wasmExports["L"])(a0, a1, a2, a3, a4);
      var _swe_pheno_ut = Module["_swe_pheno_ut"] = (a0, a1, a2, a3, a4) => (_swe_pheno_ut = Module["_swe_pheno_ut"] = wasmExports["M"])(a0, a1, a2, a3, a4);
      var _swe_nod_aps = Module["_swe_nod_aps"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_swe_nod_aps = Module["_swe_nod_aps"] = wasmExports["N"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
      var _swe_nod_aps_ut = Module["_swe_nod_aps_ut"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_swe_nod_aps_ut = Module["_swe_nod_aps_ut"] = wasmExports["O"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
      var _swe_get_orbital_elements = Module["_swe_get_orbital_elements"] = (a0, a1, a2, a3, a4) => (_swe_get_orbital_elements = Module["_swe_get_orbital_elements"] = wasmExports["P"])(a0, a1, a2, a3, a4);
      var _swe_orbit_max_min_true_distance = Module["_swe_orbit_max_min_true_distance"] = (a0, a1, a2, a3, a4, a5, a6) => (_swe_orbit_max_min_true_distance = Module["_swe_orbit_max_min_true_distance"] = wasmExports["Q"])(a0, a1, a2, a3, a4, a5, a6);
      var _swe_sidtime0 = Module["_swe_sidtime0"] = (a0, a1, a2) => (_swe_sidtime0 = Module["_swe_sidtime0"] = wasmExports["R"])(a0, a1, a2);
      var _swe_house_pos = Module["_swe_house_pos"] = (a0, a1, a2, a3, a4, a5) => (_swe_house_pos = Module["_swe_house_pos"] = wasmExports["S"])(a0, a1, a2, a3, a4, a5);
      var _swe_date_conversion = Module["_swe_date_conversion"] = (a0, a1, a2, a3, a4, a5) => (_swe_date_conversion = Module["_swe_date_conversion"] = wasmExports["T"])(a0, a1, a2, a3, a4, a5);
      var _swe_julday = Module["_swe_julday"] = (a0, a1, a2, a3, a4) => (_swe_julday = Module["_swe_julday"] = wasmExports["U"])(a0, a1, a2, a3, a4);
      var _swe_revjul = Module["_swe_revjul"] = (a0, a1, a2, a3, a4, a5) => (_swe_revjul = Module["_swe_revjul"] = wasmExports["V"])(a0, a1, a2, a3, a4, a5);
      var _swe_utc_time_zone = Module["_swe_utc_time_zone"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) => (_swe_utc_time_zone = Module["_swe_utc_time_zone"] = wasmExports["W"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
      var _swe_utc_to_jd = Module["_swe_utc_to_jd"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_swe_utc_to_jd = Module["_swe_utc_to_jd"] = wasmExports["X"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
      var _swe_jdet_to_utc = Module["_swe_jdet_to_utc"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_swe_jdet_to_utc = Module["_swe_jdet_to_utc"] = wasmExports["Y"])(a0, a1, a2, a3, a4, a5, a6, a7);
      var _swe_jdut1_to_utc = Module["_swe_jdut1_to_utc"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_swe_jdut1_to_utc = Module["_swe_jdut1_to_utc"] = wasmExports["Z"])(a0, a1, a2, a3, a4, a5, a6, a7);
      var _swe_vis_limit_mag = Module["_swe_vis_limit_mag"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_swe_vis_limit_mag = Module["_swe_vis_limit_mag"] = wasmExports["_"])(a0, a1, a2, a3, a4, a5, a6, a7);
      var _swe_fixstar_mag = Module["_swe_fixstar_mag"] = (a0, a1, a2) => (_swe_fixstar_mag = Module["_swe_fixstar_mag"] = wasmExports["$"])(a0, a1, a2);
      var _swe_heliacal_pheno_ut = Module["_swe_heliacal_pheno_ut"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_swe_heliacal_pheno_ut = Module["_swe_heliacal_pheno_ut"] = wasmExports["aa"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
      var _swe_heliacal_ut = Module["_swe_heliacal_ut"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_swe_heliacal_ut = Module["_swe_heliacal_ut"] = wasmExports["ba"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
      var _swe_get_planet_name = Module["_swe_get_planet_name"] = (a0, a1) => (_swe_get_planet_name = Module["_swe_get_planet_name"] = wasmExports["ca"])(a0, a1);
      var _swe_houses = Module["_swe_houses"] = (a0, a1, a2, a3, a4, a5) => (_swe_houses = Module["_swe_houses"] = wasmExports["da"])(a0, a1, a2, a3, a4, a5);
      var _swe_houses_armc_ex2 = Module["_swe_houses_armc_ex2"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_swe_houses_armc_ex2 = Module["_swe_houses_armc_ex2"] = wasmExports["ea"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
      var _swe_difdeg2n = Module["_swe_difdeg2n"] = (a0, a1) => (_swe_difdeg2n = Module["_swe_difdeg2n"] = wasmExports["fa"])(a0, a1);
      var _swe_houses_ex = Module["_swe_houses_ex"] = (a0, a1, a2, a3, a4, a5, a6) => (_swe_houses_ex = Module["_swe_houses_ex"] = wasmExports["ga"])(a0, a1, a2, a3, a4, a5, a6);
      var _swe_houses_ex2 = Module["_swe_houses_ex2"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_swe_houses_ex2 = Module["_swe_houses_ex2"] = wasmExports["ha"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
      var _swe_set_sid_mode = Module["_swe_set_sid_mode"] = (a0, a1, a2) => (_swe_set_sid_mode = Module["_swe_set_sid_mode"] = wasmExports["ia"])(a0, a1, a2);
      var _swe_get_ayanamsa_ex = Module["_swe_get_ayanamsa_ex"] = (a0, a1, a2, a3) => (_swe_get_ayanamsa_ex = Module["_swe_get_ayanamsa_ex"] = wasmExports["ja"])(a0, a1, a2, a3);
      var _swe_houses_armc = Module["_swe_houses_armc"] = (a0, a1, a2, a3, a4, a5) => (_swe_houses_armc = Module["_swe_houses_armc"] = wasmExports["ka"])(a0, a1, a2, a3, a4, a5);
      var _swe_radnorm = Module["_swe_radnorm"] = a0 => (_swe_radnorm = Module["_swe_radnorm"] = wasmExports["la"])(a0);
      var _free = Module["_free"] = a0 => (_free = Module["_free"] = wasmExports["ma"])(a0);
      var _malloc = Module["_malloc"] = a0 => (_malloc = Module["_malloc"] = wasmExports["na"])(a0);
      var _swe_version = Module["_swe_version"] = a0 => (_swe_version = Module["_swe_version"] = wasmExports["oa"])(a0);
      var _swe_set_tid_acc = Module["_swe_set_tid_acc"] = a0 => (_swe_set_tid_acc = Module["_swe_set_tid_acc"] = wasmExports["pa"])(a0);
      var _swe_set_ephe_path = Module["_swe_set_ephe_path"] = a0 => (_swe_set_ephe_path = Module["_swe_set_ephe_path"] = wasmExports["qa"])(a0);
      var _swe_difrad2n = Module["_swe_difrad2n"] = (a0, a1) => (_swe_difrad2n = Module["_swe_difrad2n"] = wasmExports["ra"])(a0, a1);
      var _swe_close = Module["_swe_close"] = () => (_swe_close = Module["_swe_close"] = wasmExports["sa"])();
      var _swe_set_jpl_file = Module["_swe_set_jpl_file"] = a0 => (_swe_set_jpl_file = Module["_swe_set_jpl_file"] = wasmExports["ta"])(a0);
      var _swe_get_ayanamsa_ex_ut = Module["_swe_get_ayanamsa_ex_ut"] = (a0, a1, a2, a3) => (_swe_get_ayanamsa_ex_ut = Module["_swe_get_ayanamsa_ex_ut"] = wasmExports["ua"])(a0, a1, a2, a3);
      var _swe_get_ayanamsa = Module["_swe_get_ayanamsa"] = a0 => (_swe_get_ayanamsa = Module["_swe_get_ayanamsa"] = wasmExports["va"])(a0);
      var _swe_get_ayanamsa_ut = Module["_swe_get_ayanamsa_ut"] = a0 => (_swe_get_ayanamsa_ut = Module["_swe_get_ayanamsa_ut"] = wasmExports["wa"])(a0);
      var _swe_fixstar2 = Module["_swe_fixstar2"] = (a0, a1, a2, a3, a4) => (_swe_fixstar2 = Module["_swe_fixstar2"] = wasmExports["xa"])(a0, a1, a2, a3, a4);
      var _swe_fixstar2_ut = Module["_swe_fixstar2_ut"] = (a0, a1, a2, a3, a4) => (_swe_fixstar2_ut = Module["_swe_fixstar2_ut"] = wasmExports["ya"])(a0, a1, a2, a3, a4);
      var _swe_fixstar2_mag = Module["_swe_fixstar2_mag"] = (a0, a1, a2) => (_swe_fixstar2_mag = Module["_swe_fixstar2_mag"] = wasmExports["za"])(a0, a1, a2);
      var _swe_get_ayanamsa_name = Module["_swe_get_ayanamsa_name"] = a0 => (_swe_get_ayanamsa_name = Module["_swe_get_ayanamsa_name"] = wasmExports["Aa"])(a0);
      var _swe_time_equ = Module["_swe_time_equ"] = (a0, a1, a2) => (_swe_time_equ = Module["_swe_time_equ"] = wasmExports["Ba"])(a0, a1, a2);
      var _swe_fixstar_ut = Module["_swe_fixstar_ut"] = (a0, a1, a2, a3, a4) => (_swe_fixstar_ut = Module["_swe_fixstar_ut"] = wasmExports["Ca"])(a0, a1, a2, a3, a4);
      var _swe_deg_midp = Module["_swe_deg_midp"] = (a0, a1) => (_swe_deg_midp = Module["_swe_deg_midp"] = wasmExports["Ea"])(a0, a1);
      var _swe_rad_midp = Module["_swe_rad_midp"] = (a0, a1) => (_swe_rad_midp = Module["_swe_rad_midp"] = wasmExports["Fa"])(a0, a1);
      var _swe_cotrans_sp = Module["_swe_cotrans_sp"] = (a0, a1, a2) => (_swe_cotrans_sp = Module["_swe_cotrans_sp"] = wasmExports["Ga"])(a0, a1, a2);
      var _swe_deltat = Module["_swe_deltat"] = a0 => (_swe_deltat = Module["_swe_deltat"] = wasmExports["Ha"])(a0);
      var _swe_get_tid_acc = Module["_swe_get_tid_acc"] = () => (_swe_get_tid_acc = Module["_swe_get_tid_acc"] = wasmExports["Ia"])();
      var _swe_csnorm = Module["_swe_csnorm"] = a0 => (_swe_csnorm = Module["_swe_csnorm"] = wasmExports["Ja"])(a0);
      var _swe_difcsn = Module["_swe_difcsn"] = (a0, a1) => (_swe_difcsn = Module["_swe_difcsn"] = wasmExports["Ka"])(a0, a1);
      var _swe_difdegn = Module["_swe_difdegn"] = (a0, a1) => (_swe_difdegn = Module["_swe_difdegn"] = wasmExports["La"])(a0, a1);
      var _swe_difcs2n = Module["_swe_difcs2n"] = (a0, a1) => (_swe_difcs2n = Module["_swe_difcs2n"] = wasmExports["Ma"])(a0, a1);
      var _swe_csroundsec = Module["_swe_csroundsec"] = a0 => (_swe_csroundsec = Module["_swe_csroundsec"] = wasmExports["Na"])(a0);
      var _swe_d2l = Module["_swe_d2l"] = a0 => (_swe_d2l = Module["_swe_d2l"] = wasmExports["Oa"])(a0);
      var _swe_day_of_week = Module["_swe_day_of_week"] = a0 => (_swe_day_of_week = Module["_swe_day_of_week"] = wasmExports["Pa"])(a0);
      var _swe_cs2timestr = Module["_swe_cs2timestr"] = (a0, a1, a2, a3) => (_swe_cs2timestr = Module["_swe_cs2timestr"] = wasmExports["Qa"])(a0, a1, a2, a3);
      var _swe_cs2lonlatstr = Module["_swe_cs2lonlatstr"] = (a0, a1, a2, a3) => (_swe_cs2lonlatstr = Module["_swe_cs2lonlatstr"] = wasmExports["Ra"])(a0, a1, a2, a3);
      var _swe_cs2degstr = Module["_swe_cs2degstr"] = (a0, a1) => (_swe_cs2degstr = Module["_swe_cs2degstr"] = wasmExports["Sa"])(a0, a1);
      var _swe_split_deg = Module["_swe_split_deg"] = (a0, a1, a2, a3, a4, a5, a6) => (_swe_split_deg = Module["_swe_split_deg"] = wasmExports["Ta"])(a0, a1, a2, a3, a4, a5, a6);
      var __emscripten_stack_restore = a0 => (__emscripten_stack_restore = wasmExports["Ua"])(a0);
      var __emscripten_stack_alloc = a0 => (__emscripten_stack_alloc = wasmExports["Va"])(a0);
      var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["Wa"])();
      Module["addRunDependency"] = addRunDependency;
      Module["removeRunDependency"] = removeRunDependency;
      Module["ccall"] = ccall;
      Module["cwrap"] = cwrap;
      Module["FS_createPreloadedFile"] = FS_createPreloadedFile;
      Module["FS_unlink"] = FS_unlink;
      Module["FS_createPath"] = FS_createPath;
      Module["FS_createDevice"] = FS_createDevice;
      Module["FS"] = FS;
      Module["FS_createDataFile"] = FS_createDataFile;
      Module["FS_createLazyFile"] = FS_createLazyFile;
      var calledRun;
      dependenciesFulfilled = function runCaller() {
          if (!calledRun)
              run();
          if (!calledRun)
              dependenciesFulfilled = runCaller
      }
      ;
      function run() {
          if (runDependencies > 0) {
              return
          }
          preRun();
          if (runDependencies > 0) {
              return
          }
          function doRun() {
              if (calledRun)
                  return;
              calledRun = true;
              Module["calledRun"] = true;
              if (ABORT)
                  return;
              initRuntime();
              readyPromiseResolve(Module);
              Module["onRuntimeInitialized"]?.();
              postRun()
          }
          if (Module["setStatus"]) {
              Module["setStatus"]("Running...");
              setTimeout( () => {
                  setTimeout( () => Module["setStatus"](""), 1);
                  doRun()
              }
              , 1)
          } else {
              doRun()
          }
      }
      if (Module["preInit"]) {
          if (typeof Module["preInit"] == "function")
              Module["preInit"] = [Module["preInit"]];
          while (Module["preInit"].length > 0) {
              Module["preInit"].pop()()
          }
      }
      run();
      moduleRtn = readyPromise;

      return moduleRtn;
  }
  );
}
)();

export default Swisseph;
// if (typeof exports === 'object' && typeof module === 'object') {
//   module.exports = Swisseph;
//   // This default export looks redundant, but it allows TS to import this
//   // commonjs style module.
//   module.exports.default = Swisseph;
// } else if (typeof define === 'function' && define['amd'])
//   define([], () => Swisseph);
