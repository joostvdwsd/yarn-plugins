/* eslint-disable */
//prettier-ignore
module.exports = {
name: "@yarnpkg/plugin-local-development",
factory: function (require) {
var plugin = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value}) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
  var __require = (x) => {
    if (typeof require !== "undefined")
      return require(x);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  };
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[Object.keys(cb)[0]])((mod = {exports: {}}).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {get: all[name], enumerable: true});
  };
  var __reExport = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
    }
    return target;
  };
  var __toModule = (module) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? {get: () => module.default, enumerable: true} : {value: module, enumerable: true})), module);
  };

  // pnp:/Users/lupmtu1/Development/github/yarn-plugins/.yarn/cache/tslib-npm-2.4.0-9cb6dc5030-8c4aa6a3c5.zip/node_modules/tslib/tslib.js
  var require_tslib = __commonJS({
    "pnp:/Users/lupmtu1/Development/github/yarn-plugins/.yarn/cache/tslib-npm-2.4.0-9cb6dc5030-8c4aa6a3c5.zip/node_modules/tslib/tslib.js"(exports, module) {
      var __extends;
      var __assign;
      var __rest;
      var __decorate;
      var __param;
      var __metadata;
      var __awaiter;
      var __generator;
      var __exportStar;
      var __values;
      var __read;
      var __spread;
      var __spreadArrays;
      var __spreadArray;
      var __await;
      var __asyncGenerator;
      var __asyncDelegator;
      var __asyncValues;
      var __makeTemplateObject;
      var __importStar;
      var __importDefault;
      var __classPrivateFieldGet;
      var __classPrivateFieldSet;
      var __classPrivateFieldIn;
      var __createBinding;
      (function(factory) {
        var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
        if (typeof define === "function" && define.amd) {
          define("tslib", ["exports"], function(exports2) {
            factory(createExporter(root, createExporter(exports2)));
          });
        } else if (typeof module === "object" && typeof module.exports === "object") {
          factory(createExporter(root, createExporter(module.exports)));
        } else {
          factory(createExporter(root));
        }
        function createExporter(exports2, previous) {
          if (exports2 !== root) {
            if (typeof Object.create === "function") {
              Object.defineProperty(exports2, "__esModule", {value: true});
            } else {
              exports2.__esModule = true;
            }
          }
          return function(id, v) {
            return exports2[id] = previous ? previous(id, v) : v;
          };
        }
      })(function(exporter) {
        var extendStatics = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b)
            if (Object.prototype.hasOwnProperty.call(b, p))
              d[p] = b[p];
        };
        __extends = function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
              if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
          }
          return t;
        };
        __rest = function(s, e) {
          var t = {};
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
              t[p] = s[p];
          if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
              if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
            }
          return t;
        };
        __decorate = function(decorators, target, key, desc) {
          var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
          if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
          else
            for (var i = decorators.length - 1; i >= 0; i--)
              if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
          return c > 3 && r && Object.defineProperty(target, key, r), r;
        };
        __param = function(paramIndex, decorator) {
          return function(target, key) {
            decorator(target, key, paramIndex);
          };
        };
        __metadata = function(metadataKey, metadataValue) {
          if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
        };
        __awaiter = function(thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P ? value : new P(function(resolve3) {
              resolve3(value);
            });
          }
          return new (P || (P = Promise))(function(resolve3, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }
            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }
            function step(result) {
              result.done ? resolve3(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        };
        __generator = function(thisArg, body) {
          var _ = {label: 0, sent: function() {
            if (t[0] & 1)
              throw t[1];
            return t[1];
          }, trys: [], ops: []}, f, y, t, g;
          return g = {next: verb(0), "throw": verb(1), "return": verb(2)}, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
            return this;
          }), g;
          function verb(n) {
            return function(v) {
              return step([n, v]);
            };
          }
          function step(op) {
            if (f)
              throw new TypeError("Generator is already executing.");
            while (_)
              try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                  return t;
                if (y = 0, t)
                  op = [op[0] & 2, t.value];
                switch (op[0]) {
                  case 0:
                  case 1:
                    t = op;
                    break;
                  case 4:
                    _.label++;
                    return {value: op[1], done: false};
                  case 5:
                    _.label++;
                    y = op[1];
                    op = [0];
                    continue;
                  case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                  default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                      _ = 0;
                      continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                      _.label = op[1];
                      break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                      _.label = t[1];
                      t = op;
                      break;
                    }
                    if (t && _.label < t[2]) {
                      _.label = t[2];
                      _.ops.push(op);
                      break;
                    }
                    if (t[2])
                      _.ops.pop();
                    _.trys.pop();
                    continue;
                }
                op = body.call(thisArg, _);
              } catch (e) {
                op = [6, e];
                y = 0;
              } finally {
                f = t = 0;
              }
            if (op[0] & 5)
              throw op[1];
            return {value: op[0] ? op[1] : void 0, done: true};
          }
        };
        __exportStar = function(m, o) {
          for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
              __createBinding(o, m, p);
        };
        __createBinding = Object.create ? function(o, m, k, k2) {
          if (k2 === void 0)
            k2 = k;
          var desc = Object.getOwnPropertyDescriptor(m, k);
          if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
            desc = {enumerable: true, get: function() {
              return m[k];
            }};
          }
          Object.defineProperty(o, k2, desc);
        } : function(o, m, k, k2) {
          if (k2 === void 0)
            k2 = k;
          o[k2] = m[k];
        };
        __values = function(o) {
          var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
          if (m)
            return m.call(o);
          if (o && typeof o.length === "number")
            return {
              next: function() {
                if (o && i >= o.length)
                  o = void 0;
                return {value: o && o[i++], done: !o};
              }
            };
          throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
        };
        __read = function(o, n) {
          var m = typeof Symbol === "function" && o[Symbol.iterator];
          if (!m)
            return o;
          var i = m.call(o), r, ar = [], e;
          try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
              ar.push(r.value);
          } catch (error) {
            e = {error};
          } finally {
            try {
              if (r && !r.done && (m = i["return"]))
                m.call(i);
            } finally {
              if (e)
                throw e.error;
            }
          }
          return ar;
        };
        __spread = function() {
          for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
          return ar;
        };
        __spreadArrays = function() {
          for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
          for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
              r[k] = a[j];
          return r;
        };
        __spreadArray = function(to, from, pack) {
          if (pack || arguments.length === 2)
            for (var i = 0, l = from.length, ar; i < l; i++) {
              if (ar || !(i in from)) {
                if (!ar)
                  ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
              }
            }
          return to.concat(ar || Array.prototype.slice.call(from));
        };
        __await = function(v) {
          return this instanceof __await ? (this.v = v, this) : new __await(v);
        };
        __asyncGenerator = function(thisArg, _arguments, generator) {
          if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
          var g = generator.apply(thisArg, _arguments || []), i, q = [];
          return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
            return this;
          }, i;
          function verb(n) {
            if (g[n])
              i[n] = function(v) {
                return new Promise(function(a, b) {
                  q.push([n, v, a, b]) > 1 || resume(n, v);
                });
              };
          }
          function resume(n, v) {
            try {
              step(g[n](v));
            } catch (e) {
              settle(q[0][3], e);
            }
          }
          function step(r) {
            r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
          }
          function fulfill(value) {
            resume("next", value);
          }
          function reject(value) {
            resume("throw", value);
          }
          function settle(f, v) {
            if (f(v), q.shift(), q.length)
              resume(q[0][0], q[0][1]);
          }
        };
        __asyncDelegator = function(o) {
          var i, p;
          return i = {}, verb("next"), verb("throw", function(e) {
            throw e;
          }), verb("return"), i[Symbol.iterator] = function() {
            return this;
          }, i;
          function verb(n, f) {
            i[n] = o[n] ? function(v) {
              return (p = !p) ? {value: __await(o[n](v)), done: n === "return"} : f ? f(v) : v;
            } : f;
          }
        };
        __asyncValues = function(o) {
          if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
          var m = o[Symbol.asyncIterator], i;
          return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
            return this;
          }, i);
          function verb(n) {
            i[n] = o[n] && function(v) {
              return new Promise(function(resolve3, reject) {
                v = o[n](v), settle(resolve3, reject, v.done, v.value);
              });
            };
          }
          function settle(resolve3, reject, d, v) {
            Promise.resolve(v).then(function(v2) {
              resolve3({value: v2, done: d});
            }, reject);
          }
        };
        __makeTemplateObject = function(cooked, raw) {
          if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", {value: raw});
          } else {
            cooked.raw = raw;
          }
          return cooked;
        };
        var __setModuleDefault = Object.create ? function(o, v) {
          Object.defineProperty(o, "default", {enumerable: true, value: v});
        } : function(o, v) {
          o["default"] = v;
        };
        __importStar = function(mod) {
          if (mod && mod.__esModule)
            return mod;
          var result = {};
          if (mod != null) {
            for (var k in mod)
              if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                __createBinding(result, mod, k);
          }
          __setModuleDefault(result, mod);
          return result;
        };
        __importDefault = function(mod) {
          return mod && mod.__esModule ? mod : {"default": mod};
        };
        __classPrivateFieldGet = function(receiver, state, kind, f) {
          if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a getter");
          if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot read private member from an object whose class did not declare it");
          return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
        };
        __classPrivateFieldSet = function(receiver, state, value, kind, f) {
          if (kind === "m")
            throw new TypeError("Private method is not writable");
          if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a setter");
          if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot write private member to an object whose class did not declare it");
          return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
        };
        __classPrivateFieldIn = function(state, receiver) {
          if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function")
            throw new TypeError("Cannot use 'in' operator on non-object");
          return typeof state === "function" ? receiver === state : state.has(receiver);
        };
        exporter("__extends", __extends);
        exporter("__assign", __assign);
        exporter("__rest", __rest);
        exporter("__decorate", __decorate);
        exporter("__param", __param);
        exporter("__metadata", __metadata);
        exporter("__awaiter", __awaiter);
        exporter("__generator", __generator);
        exporter("__exportStar", __exportStar);
        exporter("__createBinding", __createBinding);
        exporter("__values", __values);
        exporter("__read", __read);
        exporter("__spread", __spread);
        exporter("__spreadArrays", __spreadArrays);
        exporter("__spreadArray", __spreadArray);
        exporter("__await", __await);
        exporter("__asyncGenerator", __asyncGenerator);
        exporter("__asyncDelegator", __asyncDelegator);
        exporter("__asyncValues", __asyncValues);
        exporter("__makeTemplateObject", __makeTemplateObject);
        exporter("__importStar", __importStar);
        exporter("__importDefault", __importDefault);
        exporter("__classPrivateFieldGet", __classPrivateFieldGet);
        exporter("__classPrivateFieldSet", __classPrivateFieldSet);
        exporter("__classPrivateFieldIn", __classPrivateFieldIn);
      });
    }
  });

  // pnp:/Users/lupmtu1/Development/github/yarn-plugins/.yarn/__virtual__/@yarnpkg-esbuild-plugin-pnp-virtual-d5573a479a/0/cache/@yarnpkg-esbuild-plugin-pnp-npm-3.0.0-rc.15-b916c218b3-04da15355a.zip/node_modules/@yarnpkg/esbuild-plugin-pnp/lib/index.js
  var require_lib = __commonJS({
    "pnp:/Users/lupmtu1/Development/github/yarn-plugins/.yarn/__virtual__/@yarnpkg-esbuild-plugin-pnp-virtual-d5573a479a/0/cache/@yarnpkg-esbuild-plugin-pnp-npm-3.0.0-rc.15-b916c218b3-04da15355a.zip/node_modules/@yarnpkg/esbuild-plugin-pnp/lib/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {value: true});
      exports.pnpPlugin = void 0;
      var tslib_1 = require_tslib();
      var fs = tslib_1.__importStar(__require("fs"));
      var path_1 = tslib_1.__importDefault(__require("path"));
      var matchAll = /()/;
      var defaultExtensions = [`.tsx`, `.ts`, `.jsx`, `.mjs`, `.cjs`, `.js`, `.css`, `.json`];
      function parseExternals(externals) {
        return externals.map((external) => {
          const wildcardIdx = external.indexOf(`*`);
          if (wildcardIdx !== -1)
            return {prefix: external.slice(0, wildcardIdx), suffix: external.slice(wildcardIdx + 1)};
          return external;
        });
      }
      function isExternal(path, externals) {
        for (const external of externals) {
          if (typeof external === `object`) {
            if (path.length >= external.prefix.length + external.suffix.length && path.startsWith(external.prefix) && path.endsWith(external.suffix)) {
              return true;
            }
          } else {
            if (path === external)
              return true;
            if (!external.startsWith(`/`) && !external.startsWith(`./`) && !external.startsWith(`../`) && external !== `.` && external !== `..`) {
              if (path.startsWith(`${external}/`)) {
                return true;
              }
            }
          }
        }
        return false;
      }
      async function defaultOnLoad(args) {
        return {
          contents: await fs.promises.readFile(args.path),
          loader: `default`,
          resolveDir: path_1.default.dirname(args.path)
        };
      }
      async function defaultOnResolve(args, {resolvedPath, error, watchFiles}) {
        const problems = error ? [{text: error.message}] : [];
        let mergeWith;
        switch (args.kind) {
          case `require-call`:
          case `require-resolve`:
          case `dynamic-import`:
            {
              mergeWith = {warnings: problems};
            }
            break;
          default:
            {
              mergeWith = {errors: problems};
            }
            break;
        }
        if (resolvedPath !== null) {
          return {namespace: `pnp`, path: resolvedPath, watchFiles};
        } else {
          return __spreadProps(__spreadValues({external: true}, mergeWith), {watchFiles});
        }
      }
      function pnpPlugin2({baseDir = process.cwd(), extensions = defaultExtensions, filter = matchAll, onResolve = defaultOnResolve, onLoad = defaultOnLoad} = {}) {
        return {
          name: `@yarnpkg/esbuild-plugin-pnp`,
          setup(build) {
            var _a, _b;
            const {findPnpApi} = __require("module");
            if (typeof findPnpApi === `undefined`)
              return;
            const externals = parseExternals((_a = build.initialOptions.external) !== null && _a !== void 0 ? _a : []);
            const platform = (_b = build.initialOptions.platform) !== null && _b !== void 0 ? _b : `browser`;
            const isPlatformNode = platform === `node`;
            const conditionsDefault = new Set(build.initialOptions.conditions);
            conditionsDefault.add(`default`);
            if (platform === `browser` || platform === `node`)
              conditionsDefault.add(platform);
            const conditionsImport = new Set(conditionsDefault);
            conditionsImport.add(`import`);
            const conditionsRequire = new Set(conditionsDefault);
            conditionsRequire.add(`require`);
            build.onResolve({filter}, (args) => {
              var _a2, _b2;
              if (isExternal(args.path, externals))
                return {external: true};
              let conditions = conditionsDefault;
              if (args.kind === `dynamic-import` || args.kind === `import-statement`)
                conditions = conditionsImport;
              else if (args.kind === `require-call` || args.kind === `require-resolve`)
                conditions = conditionsRequire;
              const effectiveImporter = args.resolveDir ? `${args.resolveDir}/` : args.importer ? args.importer : `${baseDir}/`;
              const pnpApi = findPnpApi(effectiveImporter);
              if (!pnpApi)
                return void 0;
              let path = null;
              let error;
              try {
                path = pnpApi.resolveRequest(args.path, effectiveImporter, {
                  conditions,
                  considerBuiltins: isPlatformNode,
                  extensions
                });
              } catch (e) {
                error = e;
              }
              const watchFiles = [pnpApi.resolveRequest(`pnpapi`, null)];
              if (path) {
                const locator = pnpApi.findPackageLocator(path);
                if (locator) {
                  const info = pnpApi.getPackageInformation(locator);
                  if ((info === null || info === void 0 ? void 0 : info.linkType) === `SOFT`) {
                    watchFiles.push((_b2 = (_a2 = pnpApi.resolveVirtual) === null || _a2 === void 0 ? void 0 : _a2.call(pnpApi, path)) !== null && _b2 !== void 0 ? _b2 : path);
                  }
                }
              }
              return onResolve(args, {resolvedPath: path, error, watchFiles});
            });
            if (build.onLoad !== null) {
              build.onLoad({filter}, onLoad);
            }
          }
        };
      }
      exports.pnpPlugin = pnpPlugin2;
    }
  });

  // pnp:/Users/lupmtu1/Development/github/yarn-plugins/workspaces/local/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    default: () => src_default
  });

  // pnp:/Users/lupmtu1/Development/github/yarn-plugins/workspaces/local/src/commands/build.ts
  var import_core = __toModule(__require("@yarnpkg/core"));
  var import_cli2 = __toModule(__require("@yarnpkg/cli"));
  var import_path2 = __toModule(__require("path"));
  var import_clipanion = __toModule(__require("clipanion"));
  var import_esbuild_plugin_pnp = __toModule(require_lib());
  var import_module = __toModule(__require("module"));

  // pnp:/Users/lupmtu1/Development/github/yarn-plugins/workspaces/local/src/utils/esbuild/dynamic-lib.ts
  var import_cli = __toModule(__require("@yarnpkg/cli"));
  var pathRegExp = /^(?![a-zA-Z]:[\\/]|\\\\|\.{0,2}(?:\/|$))((?:@[^/]+\/)?[^/]+)\/*(.*|)$/;
  var notDynamic = [
    "typanion"
  ];
  var isDynamicLib = (request2) => {
    if ((0, import_cli.getDynamicLibs)().has(request2)) {
      return !notDynamic.includes(request2);
    }
    if (request2.match(/^@yarnpkg\/plugin-/)) {
      return true;
    }
    return false;
  };
  function getDynamicLibResolverPlugin(currentPluginName) {
    return {
      name: `dynamic-lib-resolver`,
      setup: (build) => {
        build.onResolve({filter: /()/}, async (args) => {
          const dependencyNameMatch = args.path.match(pathRegExp);
          if (dependencyNameMatch === null)
            return void 0;
          const [, dependencyName] = dependencyNameMatch;
          if (dependencyName === currentPluginName || !isDynamicLib(args.path))
            return void 0;
          return {
            path: args.path,
            external: true
          };
        });
      }
    };
  }

  // pnp:/Users/lupmtu1/Development/github/yarn-plugins/workspaces/local/src/utils/esbuild/inline-templates.ts
  var import_promises = __toModule(__require("fs/promises"));
  var import_path = __toModule(__require("path"));
  function getInlineTemplatePlugin() {
    return {
      name: "template",
      setup: (build) => {
        let fs = __require("fs");
        build.onLoad({filter: /.*/}, async (args) => {
          const originalSource = await (0, import_promises.readFile)(args.path, "utf-8");
          if (originalSource.includes("template.hbs")) {
            const fileFolder = (0, import_path.dirname)(args.path);
            const source1 = originalSource.replace(/readFile\(resolve\(__dirname, '([\w\.\/]+)'\), 'utf-8'\)/g, (content, file) => {
              return "`" + fs.readFileSync((0, import_path.join)(fileFolder, file), "utf-8").replace("`", "\\`") + "`";
            });
            const source2 = source1.replace(/readFileSync\(join\(__dirname, .([\w\/\.]+).\), .utf\-8.\)/g, (content, file) => {
              return "`" + fs.readFileSync((0, import_path.join)(fileFolder, file), "utf-8").replace("`", "\\`") + "`";
            });
            return {
              contents: source2
            };
          }
        });
      }
    };
  }

  // pnp:/Users/lupmtu1/Development/github/yarn-plugins/workspaces/local/src/commands/build.ts
  var import_promises2 = __toModule(__require("fs/promises"));
  var PluginBuildCommand = class extends import_cli2.BaseCommand {
    constructor() {
      super(...arguments);
      this.production = import_clipanion.Option.Boolean("--production", false);
    }
    async execute() {
      const yarnConfig = await import_core.Configuration.find(this.context.cwd, this.context.plugins);
      const {project, workspace} = await import_core.Project.find(yarnConfig, this.context.cwd);
      if (!workspace) {
        throw new Error("Invalid workspace!");
      }
      if (!workspace.manifest.name) {
        throw new Error("Invalid workspace (no name in manifest)");
      }
      const name = workspace.manifest.name.name.replace("yarn-plugin-", "");
      const outFolder = (0, import_path2.resolve)(workspace.cwd, "bundle");
      const outFile = (0, import_path2.resolve)(outFolder, `${name}.js`);
      await (0, import_promises2.mkdir)(outFolder, {
        recursive: true
      });
      const workspaceRequire = (0, import_module.createRequire)(workspace.cwd);
      const projectRequire = (0, import_module.createRequire)(project.cwd);
      projectRequire((0, import_path2.resolve)(project.cwd, `.pnp.cjs`)).setup();
      const {build} = workspaceRequire("esbuild");
      const res = await build({
        banner: {
          js: [
            `/* eslint-disable */`,
            `//prettier-ignore`,
            `module.exports = {`,
            `name: ${JSON.stringify(name)},`,
            `factory: function (require) {`
          ].join(`
`)
        },
        globalName: `plugin`,
        footer: {
          js: [
            `return plugin;`,
            `}`,
            `};`
          ].join(`
`)
        },
        entryPoints: [
          (0, import_path2.resolve)(workspace.cwd, "src/plugin.ts")
        ],
        bundle: true,
        outfile: outFile,
        logLevel: `info`,
        format: `iife`,
        platform: `node`,
        plugins: [
          getInlineTemplatePlugin(),
          getDynamicLibResolverPlugin(name),
          (0, import_esbuild_plugin_pnp.pnpPlugin)()
        ],
        minify: this.production,
        sourcemap: false,
        metafile: true,
        target: `node14`
      });
      await (0, import_promises2.writeFile)((0, import_path2.resolve)(outFolder, "meta.json"), JSON.stringify(res.metafile));
    }
  };
  PluginBuildCommand.paths = [
    [`local`, `build`]
  ];

  // pnp:/Users/lupmtu1/Development/github/yarn-plugins/workspaces/local/src/commands/publish.ts
  var import_core2 = __toModule(__require("@yarnpkg/core"));
  var import_cli3 = __toModule(__require("@yarnpkg/cli"));
  var import_https = __toModule(__require("https"));
  var import_path3 = __toModule(__require("path"));
  var import_promises3 = __toModule(__require("fs/promises"));
  var ReleasePublishCommand = class extends import_cli3.BaseCommand {
    async execute() {
      const yarnConfig = await import_core2.Configuration.find(this.context.cwd, this.context.plugins);
      const {project, workspace} = await import_core2.Project.find(yarnConfig, this.context.cwd);
      if (!workspace) {
        throw new Error("Not a valid workspace!");
      }
      if (workspace.manifest.private) {
        throw new Error("Can't publish a private workspace");
      }
      if (!workspace.manifest.name) {
        throw new Error("Invalid workspace (no name in manifest)");
      }
      const name = workspace.manifest.name.name.replace("yarn-plugin-", "");
      const env = JSON.parse(await (0, import_promises3.readFile)((0, import_path3.resolve)(project.cwd, "env.json"), "utf-8"));
      const outFolder = (0, import_path3.resolve)(workspace.cwd, "bundle");
      const outFile = (0, import_path3.resolve)(outFolder, `${name}.js`);
      const data = await (0, import_promises3.readFile)(outFile, "utf-8");
      const url = new URL(env.apiUrl);
      const options = {
        host: url.host,
        port: 443,
        path: `${url.pathname}/${name}/${workspace.manifest.version}`,
        method: "POST",
        headers: {
          "content-type": "text/javascript",
          "x-api-key": env.apiKey
        }
      };
      const req = (0, import_https.request)(options, (res) => {
        console.log("STATUS: " + res.statusCode);
        console.log("HEADERS: " + JSON.stringify(res.headers));
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
          console.log("BODY: " + chunk);
        });
      });
      req.on("error", function(e) {
        console.log("problem with request: " + e.message);
      });
      req.write(data);
      req.end();
    }
  };
  ReleasePublishCommand.paths = [
    [`local`, `publish`]
  ];

  // pnp:/Users/lupmtu1/Development/github/yarn-plugins/workspaces/local/src/index.ts
  var plugin = {
    commands: [
      PluginBuildCommand,
      ReleasePublishCommand
    ]
  };
  var src_default = plugin;
  return src_exports;
})();
return plugin;
}
};
