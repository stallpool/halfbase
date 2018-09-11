const i_path = require('path');

const base = __dirname;

const env = {
   base: base,
   debug: !!process.env.APP_DEBUG,
   auth_internal: false,
   ldap_server: process.env.APP_LDAP_SERVER,
   keyval: {
      // store key value into file;
      // if null, only in memory
      filename: process.env.APP_KEYVAL_FILENAME || null
   },
   admins: process.env.APP_ADMINS?process.env.APP_ADMINS.split(','):[]
};

module.exports = env;
