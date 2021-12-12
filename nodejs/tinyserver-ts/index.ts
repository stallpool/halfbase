// version 1.0.0

import * as iFs from 'fs';
import * as iPath from 'path';
import * as iUrl from 'url';

const env = {
   debug: !!process.env.TINY_DEBUG,
   server: {
      host: process.env.TINY_HOST || '127.0.0.1',
      port: parseInt(process.env.TINY_PORT || '8080'),
      staticDir: process.env.TINY_STATIC_DIR?iPath.resolve(process.env.TINY_STATIC_DIR):null,
      httpsCADir: process.env.TINY_HTTPS_CA_DIR?iPath.resolve(process.env.TINY_HTTPS_CA_DIR):null,
   },
};

const mime: any = {
   '.html': 'text/html',
   '.css': 'text/css',
   '.js': 'text/javascript',
   '.svg': 'image/svg+xml',
   '.json': 'application/json',
   '.png': 'image/png',
   '.ico': 'image/x-icon',
   '.jpg': 'image/jpge',
   _default: 'text/plain',
   _binary: 'application/octet-stream',
};

function mimeLookup(filename: string): string {
   const ext = iPath.extname(filename);
   if (!ext) return mime._default;
   const contentType = mime[ext];
   if (!contentType) return mime._default;
   return contentType;
}

function basicRoute (req: any, res: any, router: any): boolean {
   const r = iUrl.parse(req.url);
   const originPath = r.pathname.split('/');
   const path = originPath.slice();
   const query = <any>{};
   let f = router;
   if (r.query) r.query.split('&').forEach((one) => {
      let key, val;
      let i = one.indexOf('=');
      if (i < 0) {
         key = one;
         val = '';
      } else {
         key = one.substring(0, i);
         val = one.substring(i+1);
      }
      if (key in query) {
         if(Array.isArray(query[key])) {
            query[key].push(val);
         } else {
            query[key] = [query[key], val];
         }
      } else {
         query[key] = val;
      }
   });
   path.shift();
   while (path.length > 0) {
      let key = path.shift();
      f = f[key];
      if (!f) break;
      if (typeof(f) === 'function') {
         // XXX: currently disallow use constructor as api name
         if (key === 'constructor') return false;
         return f(req, res, {
            path: path,
            query: query
         });
      }
   }
   // XXX: for debug only
   if (env.server.staticDir) {
      let r = serveStatic(res, env.server.staticDir, originPath);
      if (r) return r;
   }
   return serveCode(req, res, 404, 'Not Found');
}

function serveCode(req: any, res: any, code: number, text: string | null): boolean {
   res.writeHead(code || 500, text || '');
   res.end();
   return true;
}

function serveStatic (res: any, base: string, path: string[]): boolean {
   if (path.indexOf('..') >= 0) return false;
   path = path.slice(1);
   if (!path.join('')) path = ['index.html'];
   const filename = iPath.join(base, ...path);
   const mimetype = mimeLookup(filename);
   if (mimetype !== mime._default) {
      res.setHeader('Content-Type', mimetype);
   }
   // XXX: do not want to have try..catch...
   if (!iFs.existsSync(filename)) return false;
   const state = iFs.statSync(filename);
   if (!state.isFile()) return false;
   const buf = iFs.readFileSync(filename);
   res.write(buf);
   res.end();
   return true;
}

function createServer(router: any): any {
   let server: any = null;
   router = Object.assign({}, router);
   if (env.server.httpsCADir) {
      const iHttps = require('https');
      const httpsConfig = {
         // openssl req -newkey rsa:2048 -new -nodes -x509 -days 365 -keyout ca.key -out ca.crt
         key: iFs.readFileSync(iPath.join(env.server.httpsCADir, 'ca.key')),
         cert: iFs.readFileSync(iPath.join(env.server.httpsCADir, 'ca.crt')),
      };
      server = iHttps.createServer(httpsConfig, (req: any, res: any) => {
         basicRoute(req, res, router);
      });
   } else {
      const iHttp = require('http');
      server = iHttp.createServer((req: any, res: any) => {
         basicRoute(req, res, router);
      });
   }
   return server;
}

const server = createServer({
   test: (_req: any, res: any, opt: any) => {
      res.end(JSON.stringify({
         text: 'hello world',
         path: `/${opt.path.join('/')}`
      }));
   }
});
server.listen(env.server.port, env.server.host, () => {
   console.log(`TINY SERVER is listening at ${env.server.host}:${env.server.port}`);
});
