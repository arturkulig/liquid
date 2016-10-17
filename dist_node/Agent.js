'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _slicedToArray=function(){function sliceIterator(arr,i){var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break}}catch(err){_d=true;_e=err}finally{try{if(!_n&&_i['return'])_i['return']()}finally{if(_d)throw _e}}return _arr}return function(arr,i){if(Array.isArray(arr)){return arr}else if(Symbol.iterator in Object(arr)){return sliceIterator(arr,i)}else{throw new TypeError('Invalid attempt to destructure non-iterable instance')}}}();exports.start=start;exports.get=get;exports.getAndUpdate=getAndUpdate;exports.update=update;exports.stop=stop;var _GenServer=require('./GenServer');var GenServer=_interopRequireWildcard(_GenServer);var _Console=require('./Console');var _createSymbol=require('./createSymbol');var _createSymbol2=_interopRequireDefault(_createSymbol);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key]}}newObj.default=obj;return newObj}}function _toArray(arr){return Array.isArray(arr)?arr:Array.from(arr)}function _asyncToGenerator(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){function step(key,arg){try{var info=gen[key](arg);var value=info.value}catch(error){reject(error);return}if(info.done){resolve(value)}else{return Promise.resolve(value).then(function(value){step('next',value)},function(err){step('throw',err)})}}return step('next')})}}const GET=(0,_createSymbol2.default)('GET');const GET_AND_UPDATE=(0,_createSymbol2.default)('GET_AND_UPDATE');const UPDATE=(0,_createSymbol2.default)('UPDATE');function start(name){return GenServer.start((()=>{var _ref=_asyncToGenerator(function*(payload,state){var _payload=_toArray(payload);const command=_payload[0];const args=_payload.slice(1);switch(command){case GET:{var _args=_slicedToArray(args,1);const getter=_args[0];const reply=yield getter(state);return[reply,state]}case GET_AND_UPDATE:{var _args2=_slicedToArray(args,1);const updater=_args2[0];const result=yield updater(state);if(!(result instanceof Array)){_Console.externalConsole.error(['Liquid.Agent.getAndUpdate','Update result is not an array.','Expect two elements array: [reply, newState]'])}return result}case UPDATE:{var _args3=_slicedToArray(args,1);const updater=_args3[0];const reply=yield updater(state);return[reply,reply]}}});return function(_x,_x2){return _ref.apply(this,arguments)}})(),name)}function get(agentPID,getter){return GenServer.call(agentPID,[GET,getter])}function getAndUpdate(agentPID,updater){return GenServer.call(agentPID,[GET_AND_UPDATE,updater])}function update(agentPID,updater){return GenServer.call(agentPID,[UPDATE,updater])}function stop(agentPID){return GenServer.stop(agentPID)}