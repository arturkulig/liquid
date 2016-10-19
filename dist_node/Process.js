'use strict';Object.defineProperty(exports,'__esModule',{value:true});exports.exit=exports.endOf=exports.demonitor=exports.monitor=exports.unlink=exports.link=exports.isAlive=undefined;var _ProcessList=require('./ProcessList');var ProcessList=_interopRequireWildcard(_ProcessList);var _ProcessInfo=require('./ProcessInfo');var _ProcessInfo2=_interopRequireDefault(_ProcessInfo);var _ProcessUtils=require('./Process.utils.js');var _ProcessLink=require('./Process.link.js');var _ProcessMonitor=require('./Process.monitor.js');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key]}}newObj.default=obj;return newObj}}exports.isAlive=isAlive;exports.link=_ProcessLink.link;exports.unlink=_ProcessLink.unlink;exports.monitor=_ProcessMonitor.monitor;exports.demonitor=_ProcessMonitor.demonitor;exports.endOf=endOf;exports.exit=exit;function isAlive(pid){return!!(0,_ProcessUtils.getPInfo)(pid)}function exit(pid,reason='shutdown'){const pInfo=(0,_ProcessUtils.getPInfo)(pid);if(!pInfo)return Promise.resolve(false);switch(reason){case'shutdown':{_ProcessInfo2.default.raiseExit(pInfo);break}case'error':{_ProcessInfo2.default.raiseError(pInfo);break}default:{return Promise.resolve(false)}}return _ProcessInfo2.default.resolution(pInfo).then(()=>true)}function endOf(pid){if(!pid){return[null]}const pInfo=ProcessList.getByRef(pid);if(!pInfo){return[null,pid]}return _ProcessInfo2.default.resolution(pInfo).then(([code,result])=>[code,pid,result])}