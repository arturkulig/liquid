'use strict';Object.defineProperty(exports,'__esModule',{value:true});exports.Supervisor=exports.GenServer=exports.GenEvent=exports.Process=exports.Kernel=exports.Pid=exports.race=exports.timeout=exports.send=exports.spawn=undefined;var _Kernel=require('./Kernel');var Kernel=_interopRequireWildcard(_Kernel);var _Process=require('./Process');var Process=_interopRequireWildcard(_Process);var _GenEvent=require('./GenEvent');var GenEvent=_interopRequireWildcard(_GenEvent);var _GenServer=require('./GenServer');var GenServer=_interopRequireWildcard(_GenServer);var _Supervisor=require('./Supervisor');var Supervisor=_interopRequireWildcard(_Supervisor);var _Pid=require('./Pid');var _Pid2=_interopRequireDefault(_Pid);var _utils=require('./utils');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key]}}newObj.default=obj;return newObj}}const spawn=Kernel.spawn;const send=Kernel.send;exports.spawn=spawn;exports.send=send;exports.timeout=_utils.timeout;exports.race=_utils.race;exports.Pid=_Pid2.default;exports.Kernel=Kernel;exports.Process=Process;exports.GenEvent=GenEvent;exports.GenServer=GenServer;exports.Supervisor=Supervisor;