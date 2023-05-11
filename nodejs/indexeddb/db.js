// ref: https://w3c.github.io/IndexedDB/
//
(function () {

function reqpromise(req) {
   return new Promise(function (r, e) {
      req.addEventListener('error', error);
      req.addEventListener('success', success);
      function error(evt) {
         cleanup(evt.target);
         e(evt.target.error || 'error');
      }
      function success(evt) {
         cleanup(evt.target);
         r(evt.target.result);
      }
      function cleanup(req) {
         req.removeEventListener('error', error);
         req.removeEventListener('success', success);
      }
   });
}
function db_open(name, store, tx) {
   if (!name) return Promise.reject('no name');
   if (!store) store = name;
   if (!tx) tx = 'readwrite';
   // tx = readonly/readwrite
   return new Promise(function (r, e) {
      if (!window.indexedDB) return e('no indexedDB');
      var req = indexedDB.open(name);
      req.addEventListener('upgradeneeded', upgradeneeded);
      reqpromise(req).then(r, e);
      function upgradeneeded(evt) {
         evt.target.result.createObjectStore(store);
         evt.target.removeEventListener('upgradeneeded', upgradeneeded);
      }
   });
}
function get_sobj(db, store, tx) { return db.transaction(store, tx).objectStore(store); }
function db_get(sobj, key) { return reqpromise(sobj.get(key)); }
function db_set(sobj, key, val) { return reqpromise(sobj.put(val, key)); }
function db_del(sobj, key) { return reqpromise(sobj.delete(key)); }
function db_clr(sobj) { return reqpromise(sobj.clear()); }
function db_keys(sobj) { return reqpromise(sobj.getAllKeys()); }
function db_vals(sobj) { return reqpromise(sobj.getAll()); }

var READONLY = 'readonly';
var READWRITE = 'readwrite';
function IdxDB(name, store) {
   this.name = name;
   this.store = store || name;
   this.db = db_open(name, store);
}
IdxDB.prototype = {
   wrap: function (tx, fn) {
      var dbp = this.db;
      var store = this.store;
      return new Promise(function (r, e) {
         dbp.then(function (db) {
            fn(get_sobj(db, store, tx)).then(r, e);
         }, e);
      });
   },
   get: function (key) { return this.wrap(READONLY, function (sobj) { return db_get(sobj, key); }); },
   set: function (key, val) { return this.wrap(READWRITE, function (sobj) { return db_set(sobj, key, val); }); },
   del: function (key) { return this.wrap(READWRITE, function (sobj) { return db_del(sobj, key); }); },
   clr: function () { return this.wrap(READWRITE, function (sobj) { return db_clr(sobj); }); },
   keys: function () { return this.wrap(READONLY, function (sobj) { return db_keys(sobj); }); },
   values: function () { return this.wrap(READONLY, function (sobj) { return db_vals(sobj); }); }
};

window.IdxDB = IdxDB;

})();
