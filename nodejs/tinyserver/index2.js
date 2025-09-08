const { EventEmitter } = require('events');
const { Readable, Writable } = require('stream');
const i_url = require('url');
const i_fs = require('fs');
const i_path = require('path');

const i_env = {
   debug: !!process.env.TINY_DEBUG,
   server: {
      host: process.env.TINY_HOST || '127.0.0.1',
      port: parseInt(process.env.TINY_PORT || '8080'),
      enableHttp2: !!process.env.TINY_HTTP2 || false,
      staticDir: process.env.TINY_STATIC_DIR?i_path.resolve(process.env.TINY_STATIC_DIR):null,
      httpsCADir: process.env.TINY_HTTPS_CA_DIR?i_path.resolve(process.env.TINY_HTTPS_CA_DIR):null,
   },
};

const Mime = {
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
   lookup: (filename) => {
      let ext = i_path.extname(filename);
      if (!ext) return Mime._default;
      let content_type = Mime[ext];
      if (!content_type) content_type = Mime._default;
      return content_type;
   }
};

const Cache = {
   maxSize: 128 * 1024 * 1024, /* 128 MB */
   size: 0,
   pool: null
};

/**
 * IncomingMessage-like object for HTTP/2
 */
class Http2IncomingMessage extends Readable {
  constructor(stream, headers) {
    super();

    this.stream = stream;
    this.headers = this._normalizeHeaders(headers);
    this.rawHeaders = this._buildRawHeaders(headers);
    this.httpVersion = '2.0';
    this.httpVersionMajor = 2;
    this.httpVersionMinor = 0;
    this.method = (headers[':method'] || 'GET').toUpperCase();
    this.url = headers[':path'] || '/';

    // Parse URL
    const parsedUrl = i_url.parse(this.url, true);
    this.path = parsedUrl.path;
    this.pathname = parsedUrl.pathname;
    this.query = parsedUrl.query;
    this.search = parsedUrl.search;

    // Socket-like properties
    this.socket = {
      remoteAddress: stream.session.socket.remoteAddress,
      remotePort: stream.session.socket.remotePort,
      localAddress: stream.session.socket.localAddress,
      localPort: stream.session.socket.localPort,
      encrypted: stream.session.encrypted
    };

    this.connection = this.socket;
    this.complete = false;
    this.aborted = false;

    // Pipe stream data to this readable
    stream.on('data', (chunk) => {
      if (!this.push(chunk)) {
        stream.pause();
      }
    });

    stream.on('end', () => {
      this.complete = true;
      this.push(null);
    });

    stream.on('error', (err) => {
      this.emit('error', err);
    });

    stream.on('aborted', () => {
      this.aborted = true;
      this.emit('aborted');
    });
  }

  _normalizeHeaders(http2Headers) {
    const headers = {};
    for (const [key, value] of Object.entries(http2Headers)) {
      if (!key.startsWith(':')) {
        headers[key.toLowerCase()] = value;
      }
    }
    return headers;
  }

  _buildRawHeaders(http2Headers) {
    const raw = [];
    for (const [key, value] of Object.entries(http2Headers)) {
      if (!key.startsWith(':')) {
        raw.push(key, value);
      }
    }
    return raw;
  }

  _read() {
    this.stream.resume();
  }

  setTimeout(msecs, callback) {
    this.stream.setTimeout(msecs, callback);
    return this;
  }

  destroy(error) {
    this.stream.destroy(error);
    return this;
  }
}

/**
 * ServerResponse-like object for HTTP/2
 */
class Http2ServerResponse extends Writable {
  constructor(stream) {
    super();

    this.stream = stream;
    this.headersSent = false;
    this.finished = false;
    this.statusCode = 200;
    this.statusMessage = '';
    this.sendDate = true;

    this._headers = {};
    this._headerNames = {};
    this._removedHeaders = {};
    this._hasBody = true;

    stream.on('error', (err) => {
      this.emit('error', err);
    });

    stream.on('close', () => {
      this.finished = true;
      this.emit('close');
    });

    this.on('finish', () => {
      this.finished = true;
    });
  }

  setHeader(name, value) {
    if (this.headersSent) {
      throw new Error('Cannot set headers after they are sent');
    }

    const key = name.toLowerCase();
    this._headers[key] = value;
    this._headerNames[key] = name;

    // Remove from removed headers if it was there
    delete this._removedHeaders[key];

    return this;
  }

  getHeader(name) {
    return this._headers[name.toLowerCase()];
  }

  getHeaders() {
    return { ...this._headers };
  }

  getHeaderNames() {
    return Object.keys(this._headers);
  }

  hasHeader(name) {
    return name.toLowerCase() in this._headers;
  }

  removeHeader(name) {
    const key = name.toLowerCase();
    delete this._headers[key];
    delete this._headerNames[key];
    this._removedHeaders[key] = true;
    return this;
  }

  writeHead(statusCode, statusMessage, headers) {
    if (this.headersSent) {
      throw new Error('Cannot write headers after they are sent');
    }

    // Handle overloaded arguments
    if (typeof statusMessage === 'object') {
      headers = statusMessage;
      statusMessage = '';
    }

    this.statusCode = statusCode;
    this.statusMessage = statusMessage || '';

    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        this.setHeader(key, value);
      }
    }

    this._sendHeaders();
    return this;
  }

  _sendHeaders() {
    if (this.headersSent) return;

    const responseHeaders = {
      ':status': this.statusCode.toString(),
      ...this._headers
    };

    // Add date header if needed
    if (this.sendDate && !('date' in this._headers)) {
      responseHeaders.date = new Date().toUTCString();
    }

    // Add content-type if not set
    if (!('content-type' in this._headers) && this._hasBody) {
      responseHeaders['content-type'] = 'text/html; charset=utf-8';
    }

    this.stream.respond(responseHeaders);
    this.headersSent = true;
    this.emit('header');
  }

  write(chunk, encoding, callback) {
    if (!this.headersSent) {
      // Auto-send headers with 200 if not sent
      this._sendHeaders();
    }

    if (typeof encoding === 'function') {
      callback = encoding;
      encoding = 'utf8';
    }

    // Convert to Buffer if string
    if (typeof chunk === 'string') {
      chunk = Buffer.from(chunk, encoding || 'utf8');
    }

    const result = this.stream.write(chunk, encoding, callback);

    if (!result) {
      this.stream.once('drain', () => this.emit('drain'));
    }

    return result;
  }

  _write(chunk, encoding, callback) {
    this.write(chunk, encoding, callback);
  }

  end(chunk, encoding, callback) {
    if (typeof chunk === 'function') {
      callback = chunk;
      chunk = undefined;
      encoding = undefined;
    } else if (typeof encoding === 'function') {
      callback = encoding;
      encoding = undefined;
    }

    if (!this.headersSent) {
      if (!chunk) {
        // If ending with no body, ensure headers are sent
        this.statusCode = this.statusCode || 204; // No Content
      }
      this._sendHeaders();
    }

    if (chunk !== undefined) {
      this.write(chunk, encoding);
    }

    this.stream.end(callback);
    this.finished = true;

    // Emit finish event asynchronously
    process.nextTick(() => {
      this.emit('finish');
    });

    return this;
  }

  writeContinue() {
    this.stream.additionalHeaders({ ':status': '100' });
  }

  writeProcessing() {
    this.stream.additionalHeaders({ ':status': '102' });
  }

  writeEarlyHints(hints) {
    const headers = { ':status': '103' };
    if (hints.link) {
      headers.link = hints.link;
    }
    this.stream.additionalHeaders(headers);
  }

  setTimeout(msecs, callback) {
    this.stream.setTimeout(msecs, callback);
    return this;
  }

  addTrailers(headers) {
    this.stream.additionalHeaders(headers);
  }

  // Express.js compatibility methods
  status(code) {
    this.statusCode = code;
    return this;
  }

  sendStatus(code) {
    this.statusCode = code;
    this.end();
    return this;
  }

  json(obj) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(obj));
    return this;
  }

  send(body) {
    if (typeof body === 'object' && body !== null) {
      this.json(body);
    } else if (typeof body === 'string') {
      if (!this.hasHeader('Content-Type')) {
        this.setHeader('Content-Type', 'text/html; charset=utf-8');
      }
      this.end(body);
    } else if (Buffer.isBuffer(body)) {
      if (!this.hasHeader('Content-Type')) {
        this.setHeader('Content-Type', 'application/octet-stream');
      }
      this.end(body);
    } else {
      this.end();
    }
    return this;
  }

  redirect(statusCodeOrUrl, url) {
    if (typeof statusCodeOrUrl === 'string') {
      url = statusCodeOrUrl;
      statusCodeOrUrl = 302;
    }

    this.statusCode = statusCodeOrUrl;
    this.setHeader('Location', url);
    this.end();
    return this;
  }

  set(field, value) {
    if (typeof field === 'object') {
      for (const [key, val] of Object.entries(field)) {
        this.setHeader(key, val);
      }
    } else {
      this.setHeader(field, value);
    }
    return this;
  }

  get(field) {
    return this.getHeader(field);
  }

  cookie(name, value, options = {}) {
    const cookies = this.getHeader('Set-Cookie') || [];
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];

    let cookie = `${name}=${encodeURIComponent(value)}`;

    if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
    if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
    if (options.path) cookie += `; Path=${options.path}`;
    if (options.domain) cookie += `; Domain=${options.domain}`;
    if (options.secure) cookie += '; Secure';
    if (options.httpOnly) cookie += '; HttpOnly';
    if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;

    cookieArray.push(cookie);
    this.setHeader('Set-Cookie', cookieArray);

    return this;
  }

  clearCookie(name, options = {}) {
    return this.cookie(name, '', { ...options, maxAge: 0 });
  }

  type(type) {
    this.setHeader('Content-Type', type.includes('/') ? type : `text/${type}`);
    return this;
  }

  attachment(filename) {
    if (filename) {
      this.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      this.setHeader('Content-Disposition', 'attachment');
    }
    return this;
  }
}

/**
 * Create HTTP/2 server with (req, res) compatibility
 */
function createCompatServer(options, requestListener) {
  const http2 = require('http2');

  // Handle argument overloading
  if (typeof options === 'function') {
    requestListener = options;
    options = {};
  }

  // Determine if secure based on options
  const isSecure = options.key && options.cert;
  const server = isSecure
    ? http2.createSecureServer(options)
    : http2.createServer(options);

  // Add compat flag
  server.isHttp2 = true;

  if (requestListener) {
    server.on('stream', (stream, headers) => {
      const req = new Http2IncomingMessage(stream, headers);
      const res = new Http2ServerResponse(stream);

      // Add reference to each other
      req.res = res;
      res.req = req;

      // Call the request listener with compatible req/res objects
      try {
        requestListener(req, res);
      } catch (error) {
        console.error('Request handler error:', error);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      }
    });
  }

  // Keep original listen method but enhance it
  const originalListen = server.listen.bind(server);
  server.listen = function(...args) {
    const result = originalListen(...args);
    const callback = args[args.length - 1];
    if (typeof callback === 'function') {
      // Callback is already handled by original listen
    }
    return result;
  };

  return server;
}

function basicRoute (req, res, router) {
   const r = i_url.parse(req.url, true);
   const originPath = r.pathname.split('/');
   const path = originPath.slice();
   const query = Object.assign({}, r.query);
   let f = router;

   path.shift();
   while (path.length > 0) {
      let key = path.shift();
      f = f[key];
      if (!f || key === 'constructor') break;
      if (typeof(f) === 'function') {
         return f(req, res, {
            path: path,
            query: query
         });
      }
   }
   if (i_env.server.staticDir) {
      let r = serveStatic(res, i_env.server.staticDir, originPath);
      if (r) return r;
   }
   return serveCode(req, res, 404, 'Not Found');
}

function serveCode(req, res, code, text) {
   res.writeHead(code || 500, text || '');
   res.end();
}

function serveStatic (res, base, path) {
   if (!i_env.debug) return false;
   if (path.indexOf('..') >= 0) return false;
   path = path.slice(1);
   if (!path.join('')) path = ['index.html'];
   if (!Cache.pool) Cache.pool = {};
   let filename = i_path.join(base, ...path);
   let mimetype = Mime.lookup(filename);
   if (mimetype !== Mime._default) {
      res.setHeader('Content-Type', mimetype);
   }
   let buf = Cache.pool[filename], state;
   if (buf) {
      if (!i_fs.existsSync(filename)) {
         delete buf[filename];
         return false;
      }
      state = i_fs.statSync(filename);
      if (buf.mtime === state.mtimeMs) {
         buf = buf.raw;
      } else {
         buf.mtime = state.mtimeMs;
         buf.raw = i_fs.readFileSync(filename);
         buf = buf.raw;
      }
   } else {
      if (!i_fs.existsSync(filename)) {
         return false;
      }
      buf = i_fs.readFileSync(filename);
      state = i_fs.statSync(filename);
      if (!state.isFile()) return false;
      Cache.pool[filename] = {
         mtime: state.mtimeMs,
         raw: buf
      };
      Cache.size += buf.length + filename.length;
      while (Cache.size > Cache.maxSize) {
         let keys = Object.keys(Cache.pool);
         let key = keys[~~(Math.random() * keys.length)];
         let val = Cache.pool[key];
         if (!key || !val) return false; // should not be
         delete Cache.pool[key];
         Cache.size -= val.raw.length + key.length;
      }
   }
   res.write(buf);
   res.end();
   return true;
}

function createServer(router) {
   let server = null;
   router = Object.assign({}, router);
   if (i_env.server.httpsCADir) {
      // openssl req -newkey rsa:2048 -new -nodes -x509 -days 365 -keyout ca.key -out ca.crt
      const caKeyFilename = i_path.join(i_env.server.httpsCADir, 'ca.key');
      const caCrtFilename = i_path.join(i_env.server.httpsCADir, 'ca.crt');
      const https_config = {
         key: i_fs.readFileSync(caKeyFilename),
         cert: i_fs.readFileSync(caCrtFilename),
         allowHTTP1: true,
      };
      server = createCompatServer(https_config, (req, res) => {
         basicRoute(req, res, router);
      });
   } else {
      throw new Error('http2 requires certificate but not provided');
   }
   return server;
}

const server = createServer({
   test: (_req, res, options) => {
      res.end(JSON.stringify({
         text: 'hello world',
         path: `/${options.path.join('/')}`
      }));
   }
});
server.listen(i_env.server.port, i_env.server.host, () => {
   console.log(`TINY SERVER is listening at ${i_env.server.host}:${i_env.server.port}`);
});
