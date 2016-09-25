/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**********************!*\
  !*** ./dev/index.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _src = __webpack_require__(/*! ../src */ 1);
	
	function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }
	
	function timeout(interval) {
	  return new Promise(resolve => setTimeout(resolve, interval));
	}
	
	var _spawn = (0, _src.spawn)((() => {
	  var _ref = _asyncToGenerator(function* (receive) {
	    console.log('p1 start');
	    while (true) {
	      const message = yield receive();
	      console.log('p1 <', message);
	      yield timeout(1000);
	      yield (0, _src.send)(p2, 'pong');
	    }
	  });
	
	  return function (_x) {
	    return _ref.apply(this, arguments);
	  };
	})());
	
	var _spawn2 = _slicedToArray(_spawn, 2);
	
	const p1 = _spawn2[1];
	
	var _spawn3 = (0, _src.spawn)((() => {
	  var _ref2 = _asyncToGenerator(function* (receive) {
	    console.log('p2 start');
	    while (true) {
	      const message = yield receive();
	      console.log('p2 <', message);
	      yield timeout(1000);
	      yield (0, _src.send)(p1, 'ping');
	    }
	  });
	
	  return function (_x2) {
	    return _ref2.apply(this, arguments);
	  };
	})());
	
	var _spawn4 = _slicedToArray(_spawn3, 2);
	
	const p2 = _spawn4[1];
	
	
	(0, _src.send)(p1, 'start');

/***/ },
/* 1 */
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Process = exports.Kernel = exports.send = exports.spawn = undefined;
	
	var _Kernel = __webpack_require__(/*! ./Kernel */ 2);
	
	var Kernel = _interopRequireWildcard(_Kernel);
	
	var _Process = __webpack_require__(/*! ./Process */ 7);
	
	var Process = _interopRequireWildcard(_Process);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	const spawn = Kernel.spawn;
	const send = Kernel.send;
	exports.spawn = spawn;
	exports.send = send;
	exports.Kernel = Kernel;
	exports.Process = Process;

/***/ },
/* 2 */
/*!***********************!*\
  !*** ./src/Kernel.js ***!
  \***********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.send = exports.spawn = undefined;
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	let runProcess = (() => {
	  var _ref = _asyncToGenerator(function* (func, pId) {
	    DEV && console.log('> runProcess', pId.toString());
	
	    yield (0, _utils.timeout)();
	
	    return func(function () {
	      return receive(pId);
	    }, pId);
	  });
	
	  return function runProcess(_x, _x2) {
	    return _ref.apply(this, arguments);
	  };
	})();
	
	let receive = (() => {
	  var _ref2 = _asyncToGenerator(function* (pid) {
	    DEV && console.log('> receive', pid.toString());
	
	    return yield new Promise(function (resolve) {
	      const pInfo = ProcessList.getByRef(pid);
	      if (!pInfo) {
	        return [false, 'Liquid.Kernel.receive Reading process is marked as gone'];
	      }
	      _ProcessInfo2.default.pushRequest(pInfo, resolve);
	      tryPushMessages();
	    });
	  });
	
	  return function receive(_x3) {
	    return _ref2.apply(this, arguments);
	  };
	})();
	
	var _utils = __webpack_require__(/*! ./utils */ 3);
	
	var _ProcessList = __webpack_require__(/*! ./ProcessList */ 4);
	
	var ProcessList = _interopRequireWildcard(_ProcessList);
	
	var _ProcessInfo = __webpack_require__(/*! ./ProcessInfo */ 5);
	
	var _ProcessInfo2 = _interopRequireDefault(_ProcessInfo);
	
	var _Pid = __webpack_require__(/*! ./Pid */ 6);
	
	var _Pid2 = _interopRequireDefault(_Pid);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }
	
	const messages = [];
	
	const DEV = 0;
	
	exports.spawn = spawn;
	exports.send = send;
	
	
	function spawn(func, name) {
	  if (typeof func !== 'function') {
	    return [false, 'Liquid.Kernel.spawn Process must be function'];
	  }
	
	  const pId = _Pid2.default.new();
	
	  if (typeof name === 'string' && name && ProcessList.getByRef(name)) {
	    return [false, 'Liquid.Kernel.spawn Process name already taken'];
	  }
	
	  const pInfo = _ProcessInfo2.default.new(runProcess(func, pId));
	
	  DEV && console.log('> spawn', pId.toString());
	
	  ProcessList.register(pId, pInfo);
	  if (name) {
	    ProcessList.register(name, pInfo);
	  }
	
	  const processCleanup = () => {
	    DEV && console.log('> cleanup', pId.toString());
	    ProcessList.unregister(pId);
	  };
	
	  _ProcessInfo2.default.pushExitHandler(pInfo, processCleanup);
	  _ProcessInfo2.default.pushErrorHandler(pInfo, processCleanup);
	
	  return [true, pId];
	}
	
	function send(pid, message) {
	  DEV && console.log('> send', pid.toString(), message);
	
	  if (!pid) {
	    return [false, 'Liquid.Kernel.send Empty ID'];
	  }
	
	  if (!ProcessList.getByRef(pid)) {
	    return [false, 'Liquid.Kernel.send Dead process'];
	  }
	
	  return new Promise(resolve => {
	    messages.push([pid, message, msg => setTimeout(() => resolve(msg), 0)]);
	    tryPushMessages();
	  });
	}
	
	let isPushingMessages = false;
	
	function tryPushMessages() {
	  DEV && console.log('> tryPushMessages', messages.length);
	
	  if (!messages.length) return;
	
	  if (isPushingMessages) return;
	  isPushingMessages = true;
	
	  const unhandledMessages = [];
	
	  while (true) {
	    const takenEntries = messages.splice(0, 1);
	    if (takenEntries.length === 0) break;
	    const messagesEntry = takenEntries[0];
	
	    var _messagesEntry = _slicedToArray(messagesEntry, 3);
	
	    const pid = _messagesEntry[0];
	    const message = _messagesEntry[1];
	    const acknowledge = _messagesEntry[2];
	
	
	    const pInfo = ProcessList.getByRef(pid);
	    if (!pInfo) {
	      DEV && console.log('> tryPushMessages - process', pid.toString(), 'dead');
	      acknowledge([false, 'Liquid.Kernel sending to dead process']);
	      continue;
	    }
	
	    const request = _ProcessInfo2.default.takeRequest(pInfo);
	    if (!request) {
	      DEV && console.log('> tryPushMessages - process', pid.toString(), 'NOT receiving');
	      unhandledMessages.push(messagesEntry);
	      continue;
	    }
	
	    DEV && console.log('> tryPushMessages - process', pid.toString(), 'receiving');
	    request(message);
	    acknowledge([true, 'ok']);
	  }
	
	  DEV && console.log('> tryPushMessages, unhandled:', unhandledMessages.length);
	  messages.splice.apply(messages, [0, 0].concat(unhandledMessages));
	
	  isPushingMessages = false;
	}

/***/ },
/* 3 */
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.timeout = timeout;
	const noop = exports.noop = () => {};
	
	function timeout(interval = 0) {
	  return new Promise(resolve => setTimeout(resolve, 0));
	}

/***/ },
/* 4 */
/*!****************************!*\
  !*** ./src/ProcessList.js ***!
  \****************************/
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	const processesByRef = new Map();
	
	exports.getByRef = getByRef;
	exports.register = register;
	exports.unregister = unregister;
	
	
	function getByRef(pId) {
	  return processesByRef.get(pId);
	}
	
	function register(ref, pInfo) {
	  processesByRef.set(ref, pInfo);
	}
	
	function unregister(ref) {
	  const pInfo = getByRef(ref);
	  for (let _ref of processesByRef.entries()) {
	    var _ref2 = _slicedToArray(_ref, 2);
	
	    let key = _ref2[0];
	    let value = _ref2[1];
	
	    if (pInfo === value) {
	      processesByRef.delete(key);
	    }
	  }
	}

/***/ },
/* 5 */
/*!****************************!*\
  !*** ./src/ProcessInfo.js ***!
  \****************************/
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = ProcessInfo;
	function ProcessInfo(finished) {
	  this.isAlive = true;
	  this.requests = [];
	  this.onExit = [];
	  this.onError = [];
	
	  finished.then(result => ProcessInfo.raiseExit(this, result), reason => ProcessInfo.raiseError(this, reason));
	}
	
	ProcessInfo.new = (...args) => new (Function.prototype.bind.apply(ProcessInfo, [null].concat(args)))();
	
	ProcessInfo.pushRequest = (pInfo, request) => {
	  if (!pInfo.isAlive) return;
	  pInfo.requests.push(request);
	};
	
	ProcessInfo.takeRequest = pInfo => {
	  if (!pInfo.isAlive) return;
	  return pInfo.requests.splice(0, 1)[0];
	};
	
	ProcessInfo.isAlive = pInfo => pInfo.isAlive;
	
	ProcessInfo.getExitHandlers = pInfo => pInfo.onExit;
	ProcessInfo.getErrorHandlers = pInfo => pInfo.onError;
	
	ProcessInfo.pushExitHandler = (pInfo, handler) => {
	  if (!pInfo.isAlive) return;
	  const handlers = ProcessInfo.getExitHandlers(pInfo);
	  handlers && handlers.push(handler);
	};
	ProcessInfo.pushErrorHandler = (pInfo, handler) => {
	  if (!pInfo.isAlive) return;
	  const handlers = ProcessInfo.getErrorHandlers(pInfo);
	  handlers && handlers.push(handler);
	};
	
	ProcessInfo.raiseExit = (pInfo, outcome) => {
	  if (!pInfo.isAlive) return;
	  pInfo.isAlive = false;
	  ProcessInfo.getExitHandlers(pInfo).forEach(reaction => reaction(outcome));
	  ProcessInfo.clear(pInfo);
	};
	ProcessInfo.raiseError = (pInfo, outcome) => {
	  if (!pInfo.isAlive) return;
	  pInfo.isAlive = false;
	  ProcessInfo.getErrorHandlers(pInfo).forEach(reaction => reaction(outcome));
	  ProcessInfo.clear(pInfo);
	};
	
	ProcessInfo.clear = pInfo => {
	  pInfo.requests.splice(0, pInfo.requests.length);
	  pInfo.onExit.splice(0, pInfo.onExit.length);
	  pInfo.onError.splice(0, pInfo.onError.length);
	};

/***/ },
/* 6 */
/*!********************!*\
  !*** ./src/Pid.js ***!
  \********************/
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = Pid;
	const PROC_NUM_FIELD = '__pid';
	
	function Pid(num) {
	  this[PROC_NUM_FIELD] = num;
	}
	
	let lastID = 0;
	
	Pid.new = () => new Pid(++lastID);
	
	Pid.raw = subject => subject[PROC_NUM_FIELD];
	
	Pid.isPid = pidMaybe => typeof pidMaybe === 'object' && pidMaybe && typeof Pid.raw(pidMaybe) === 'number' && Pid.raw(pidMaybe);
	
	Pid.fromJSON = o => Pid.new(o[PROC_NUM_FIELD]);
	
	Pid.equals = (p1, p2) => Pid.raw(p1) === Pid.raw(p2);
	
	Pid.prototype = {
	  valueOf() {
	    return Pid.raw(this);
	  },
	  toString() {
	    return Pid.raw(this).toString();
	  },
	  toJSON() {
	    return { [PROC_NUM_FIELD]: Pid.raw(this) };
	  }
	};

/***/ },
/* 7 */
/*!************************!*\
  !*** ./src/Process.js ***!
  \************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.end = exports.monitor = exports.link = exports.isAlive = undefined;
	
	var _Kernel = __webpack_require__(/*! ./Kernel */ 2);
	
	var Kernel = _interopRequireWildcard(_Kernel);
	
	var _ProcessList = __webpack_require__(/*! ./ProcessList */ 4);
	
	var ProcessList = _interopRequireWildcard(_ProcessList);
	
	var _ProcessInfo = __webpack_require__(/*! ./ProcessInfo */ 5);
	
	var _ProcessInfo2 = _interopRequireDefault(_ProcessInfo);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	exports.isAlive = isAlive;
	exports.link = link;
	exports.monitor = monitor;
	exports.end = end;
	
	
	function isAlive(pId) {
	  return !!getPInfo(pId);
	}
	
	function link(sourcePid, targetPid) {
	  if (!sourcePid || !targetPid) {
	    return [false, 'Liquid.Process.link Insufficient amount of arguments'];
	  }
	
	  if (sourcePid === targetPid) {
	    return [false, 'Liquid.Process.link Self-link does nothing'];
	  }
	
	  const target = getPInfo(targetPid);
	  if (!target) {
	    return [false, 'Luquid.Process.link Target is already dead process'];
	  }
	
	  const source = getPInfo(sourcePid);
	  if (!source) {
	    return [false, 'Luquid.Process.link Source is already dead process'];
	  }
	
	  _ProcessInfo2.default.pushExitHandler(source, outcome => _ProcessInfo2.default.raiseExit(target, outcome));
	
	  _ProcessInfo2.default.pushErrorHandler(source, outcome => _ProcessInfo2.default.raiseError(target, outcome));
	
	  return [true, 'ok'];
	}
	
	function monitor(observedPid, observerPid) {
	  if (!observedPid || !observerPid) {
	    return [false, 'Liquid.Process.monitor Insufficient amount of arguments'];
	  }
	
	  if (observedPid === observerPid) {
	    return [false, 'Liquid.Process.monitor Self-monitor does nothing'];
	  }
	
	  const observer = getPInfo(observerPid);
	  if (!observer) {
	    return [false, 'Luquid.Process.link Observer is already dead process'];
	  }
	
	  const observed = getPInfo(observedPid);
	
	  if (observed) {
	    _ProcessInfo2.default.pushExitHandler(observed, result => {
	      Kernel.send(observerPid, ['exit', observedPid, result]);
	    });
	
	    _ProcessInfo2.default.pushErrorHandler(observed, reason => {
	      Kernel.send(observerPid, ['error', observedPid, reason]);
	    });
	  } else {
	    Kernel.send(observerPid, ['exit', observedPid]);
	  }
	
	  return [true];
	}
	
	function end(ref) {
	  const pInfo = getPInfo(ref);
	  if (!pInfo) {
	    return ['exit', ref];
	  }
	  return new Promise(resolve => {
	    _ProcessInfo2.default.pushExitHandler(pInfo, result => resolve(['exit', ref, result]));
	    _ProcessInfo2.default.pushErrorHandler(pInfo, reason => resolve(['error', ref, reason]));
	  });
	}
	
	function getPInfo(pId) {
	  const pInfo = ProcessList.getByRef(pId);
	  if (!pInfo) return;
	  if (!_ProcessInfo2.default.isAlive(pInfo)) return;
	  return pInfo;
	}

/***/ }
/******/ ]);
//# sourceMappingURL=bundled.js.map