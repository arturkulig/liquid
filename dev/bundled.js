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
	  var _ref3 = _asyncToGenerator(function* (pid) {
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
	
	  return function receive(_x4) {
	    return _ref3.apply(this, arguments);
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
	
	  const pInfo = _ProcessInfo2.default.new(pId, runProcess(func, pId));
	
	  DEV && console.log('> spawn', pId.toString());
	
	  ProcessList.register(pId, pInfo);
	  if (name) {
	    ProcessList.register(name, pInfo);
	  }
	
	  const processCleanup = () => {
	    DEV && console.log('> cleanup', pId.toString());
	    ProcessList.unregister(pId);
	    tryPushMessages();
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
	
	  return new Promise((() => {
	    var _ref2 = _asyncToGenerator(function* (resolve) {
	      yield (0, _utils.timeout)();
	      messages.push([pid, message, function (msg) {
	        return setTimeout(function () {
	          return resolve(msg);
	        }, 0);
	      }]);
	      tryPushMessages();
	    });
	
	    return function (_x3) {
	      return _ref2.apply(this, arguments);
	    };
	  })());
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
	  return new Promise(resolve => setTimeout(() => resolve(timeout), interval));
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
	function ProcessInfo(pid, finished) {
	  this.pid = pid;
	  this.isAlive = true;
	  this.requests = [];
	  this.onExit = [];
	  this.onError = [];
	
	  this.toJSON = () => `#${ this.pid.valueOf() }`;
	
	  finished.then(result => ProcessInfo.raiseExit(this, result), reason => ProcessInfo.raiseError(this, reason));
	}
	
	ProcessInfo.new = (...args) => new (Function.prototype.bind.apply(ProcessInfo, [null].concat(args)))();
	
	ProcessInfo.pid = pInfo => pInfo.pid;
	
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
	  handlers && handlers.indexOf(handler) === -1 && handlers.push(handler);
	};
	ProcessInfo.pushErrorHandler = (pInfo, handler) => {
	  if (!pInfo.isAlive) return;
	  const handlers = ProcessInfo.getErrorHandlers(pInfo);
	  handlers && handlers.indexOf(handler) === -1 && handlers.push(handler);
	};
	
	ProcessInfo.raiseExit = (pInfo, outcome) => {
	  if (!pInfo.isAlive) return;
	  pInfo.isAlive = false;
	  ProcessInfo.getExitHandlers(pInfo).forEach(reaction => reaction(outcome, pInfo));
	  ProcessInfo.clear(pInfo);
	};
	ProcessInfo.raiseError = (pInfo, outcome) => {
	  if (!pInfo.isAlive) return;
	  pInfo.isAlive = false;
	  ProcessInfo.getErrorHandlers(pInfo).forEach(reaction => reaction(outcome, pInfo));
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
	exports.end = exports.demonitor = exports.monitor = exports.unlink = exports.link = exports.isAlive = undefined;
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
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
	exports.unlink = unlink;
	exports.monitor = monitor;
	exports.demonitor = demonitor;
	exports.end = end;
	
	
	const terminateLinks = [];
	const monitorLinks = [];
	
	function isAlive(pId) {
	  return !!getPInfo(pId);
	}
	
	function link(sourcePID, targetPID) {
	  if (!sourcePID || !targetPID) {
	    return [false, 'Liquid.Process.link Insufficient amount of arguments'];
	  }
	
	  if (sourcePID === targetPID) {
	    return [false, 'Liquid.Process.link Self-link does nothing'];
	  }
	
	  const targetPInfo = getPInfo(targetPID);
	  if (!targetPInfo) {
	    return [false, 'Luquid.Process.link Target is already dead process'];
	  }
	
	  const sourcePInfo = getPInfo(sourcePID);
	  if (!sourcePInfo) {
	    return [false, 'Luquid.Process.link Source is already dead process'];
	  }
	
	  if (!ifLinkExists(terminateLinks, sourcePInfo, targetPInfo)) {
	    terminateLinks.push([sourcePInfo, targetPInfo]);
	    console.log('Link new link', sourcePInfo.toJSON(), targetPInfo.toJSON());
	    console.log('current links', terminateLinks.map(JSON.stringify));
	    _ProcessInfo2.default.pushExitHandler(sourcePInfo, executeLinkExit);
	    _ProcessInfo2.default.pushErrorHandler(sourcePInfo, executeLinkError);
	
	    return [true, 'ok', 'new'];
	  }
	
	  console.log('Link exists', sourcePInfo, targetPInfo);
	
	  return [true, 'ok', 'exists'];
	}
	
	function executeLinkExit(outcome, pInfo) {
	  const links = splice(terminateLinks, ([sourcePInfo]) => pInfo === sourcePInfo);
	  console.log('executeLinkExit PID', pInfo.pid);
	  links.forEach(([, targetPInfo]) => {
	    console.log('executeLinkExit Exit@', targetPInfo.pid);
	    _ProcessInfo2.default.raiseExit(targetPInfo, outcome);
	  });
	}
	
	function executeLinkError(outcome, pInfo) {
	  const links = splice(terminateLinks, ([sourcePInfo]) => pInfo === sourcePInfo);
	  console.log('executeLinkExit PID', pInfo.pid);
	  links.forEach(([, targetPInfo]) => {
	    console.log('executeLinkExit Exit@', targetPInfo.pid);
	    _ProcessInfo2.default.raiseError(targetPInfo, outcome);
	  });
	}
	
	function unlink(sourcePID, targetPID) {
	  if (!sourcePID || !targetPID) {
	    return [false, 'Liquid.Process.unlink Insufficient amount of arguments'];
	  }
	
	  return removeLink(terminateLinks, getPInfo(sourcePID), getPInfo(targetPID));
	}
	
	function monitor(sourcePID, targetPID) {
	  if (!sourcePID || !targetPID) {
	    return [false, 'Liquid.Process.monitor Insufficient amount of arguments'];
	  }
	
	  if (sourcePID === targetPID) {
	    return [false, 'Liquid.Process.monitor Self-monitor does nothing'];
	  }
	
	  const targetPInfo = getPInfo(targetPID);
	  if (!targetPInfo) {
	    return [false, 'Luquid.Process.link Observer is already dead process'];
	  }
	
	  const sourcePInfo = getPInfo(sourcePID);
	
	  if (sourcePInfo) {
	    if (!ifLinkExists(monitorLinks, sourcePInfo, targetPInfo)) {
	      monitorLinks.push([sourcePInfo, targetPInfo, sourcePID, targetPID]);
	      _ProcessInfo2.default.pushExitHandler(sourcePInfo, executeExitMonitoring);
	      _ProcessInfo2.default.pushErrorHandler(sourcePInfo, executeErrorMonitoring);
	    }
	  } else {
	    Kernel.send(targetPID, ['exit', sourcePID]);
	  }
	
	  return [true];
	}
	
	function executeExitMonitoring(outcome, sourcePInfo) {
	  executeMonitoring('exit', outcome, sourcePInfo);
	}
	
	function executeErrorMonitoring(outcome, sourcePInfo) {
	  executeMonitoring('error', outcome, sourcePInfo);
	}
	
	function executeMonitoring(reason, outcome, sourcePInfo) {
	  splice(monitorLinks, ([pInfo]) => pInfo === sourcePInfo).forEach(([,, sourcePID, targetPID]) => Kernel.send(targetPID, [reason, sourcePID, outcome]));
	}
	
	function demonitor(sourcePID, targetPID) {
	  return removeLink(monitorLinks, sourcePID, targetPID);
	}
	
	function removeLink(links, source, target) {
	  if (!links || !source || !target) {
	    return [false, 'Liquid.Process.removeLink Insufficient amount of arguments'];
	  }
	
	  const linkPosition = findLink(links, source, target);
	
	  if (linkPosition === -1) {
	    return [true, 'none'];
	  }
	
	  links.splice(linkPosition, 1);
	
	  return [true, 'ok'];
	}
	
	function ifLinkExists(links, questionedSource, questionedTarget) {
	  return findLink(links, questionedSource, questionedTarget) >= 0;
	}
	
	function findLink(links, source, target) {
	  let i = -1;
	  for (let _ref of links) {
	    var _ref2 = _slicedToArray(_ref, 2);
	
	    let linkSource = _ref2[0];
	    let linkTarget = _ref2[1];
	
	    i++;
	    if (source === linkSource && target === linkTarget) {
	      return i;
	    }
	  }
	  return -1;
	}
	
	function splice(collection, comparator) {
	  let i = -1;
	  let result = [];
	  for (let item of collection) {
	    i++;
	    if (comparator(item)) {
	      result.push(item);
	      collection.splice(i, 1);
	      i--;
	    }
	  }
	  return result;
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