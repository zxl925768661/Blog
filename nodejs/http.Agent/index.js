// 一个请求对应的key
Agent.prototype.getName = function getName(options = kEmptyObject) {
  let name = options.host || "localhost";

  name += ":";
  if (options.port) name += options.port;

  name += ":";
  if (options.localAddress) name += options.localAddress;

  // Pacify parallel/test-http-agent-getname by only appending
  // the ':' when options.family is set.
  if (options.family === 4 || options.family === 6)
    name += `:${options.family}`;

  if (options.socketPath) name += `:${options.socketPath}`;

  return name;
};

Agent.prototype.createSocket = function createSocket(req, options, cb) {
  options = { __proto__: null, ...options, ...this.options };
  if (options.socketPath) options.path = options.socketPath;

  if (!options.servername && options.servername !== "")
    options.servername = calculateServerName(options, req);

  const name = this.getName(options);
  options._agentKey = name;

  debug("createConnection", name, options);
  options.encoding = null;

  const oncreate = once((err, s) => {
    if (err) return cb(err);
    if (!this.sockets[name]) {
      this.sockets[name] = [];
    }
    ArrayPrototypePush(this.sockets[name], s);
    this.totalSocketCount++;
    debug("sockets", name, this.sockets[name].length, this.totalSocketCount);
    installListeners(this, s, options);
    cb(null, s);
  });
  // When keepAlive is true, pass the related options to createConnection
  if (this.keepAlive) {
    options.keepAlive = this.keepAlive;
    options.keepAliveInitialDelay = this.keepAliveMsecs;
  }
  const newSocket = this.createConnection(options, oncreate);
  if (newSocket) oncreate(null, newSocket);
};

function calculateServerName(options, req) {
  let servername = options.host;
  const hostHeader = req.getHeader("host");
  if (hostHeader) {
    validateString(hostHeader, "options.headers.host");

    // abc => abc
    // abc:123 => abc
    // [::1] => ::1
    // [::1]:123 => ::1
    if (StringPrototypeStartsWith(hostHeader, "[")) {
      const index = StringPrototypeIndexOf(hostHeader, "]");
      if (index === -1) {
        // Leading '[', but no ']'. Need to do something...
        servername = hostHeader;
      } else {
        servername = StringPrototypeSubstr(hostHeader, 1, index - 1);
      }
    } else {
      servername = StringPrototypeSplit(hostHeader, ":", 1)[0];
    }
  }
  // Don't implicitly set invalid (IP) servernames.
  if (net.isIP(servername)) servername = "";
  return servername;
}

function installListeners(agent, s, options) {
  function onFree() {
    debug("CLIENT socket onFree");
    agent.emit("free", s, options);
  }
  s.on("free", onFree);

  function onClose(err) {
    debug("CLIENT socket onClose");
    // This is the only place where sockets get removed from the Agent.
    // If you want to remove a socket from the pool, just close it.
    // All socket errors end in a close event anyway.
    agent.totalSocketCount--;
    agent.removeSocket(s, options);
  }
  s.on("close", onClose);

  function onTimeout() {
    debug("CLIENT socket onTimeout");

    // Destroy if in free list.
    // TODO(ronag): Always destroy, even if not in free list.
    const sockets = agent.freeSockets;
    if (
      ArrayPrototypeSome(ObjectKeys(sockets), (name) =>
        ArrayPrototypeIncludes(sockets[name], s)
      )
    ) {
      return s.destroy();
    }
  }
  s.on("timeout", onTimeout);

  function onRemove() {
    // We need this function for cases like HTTP 'upgrade'
    // (defined by WebSockets) where we need to remove a socket from the
    // pool because it'll be locked up indefinitely
    debug("CLIENT socket onRemove");
    agent.totalSocketCount--;
    agent.removeSocket(s, options);
    s.removeListener("close", onClose);
    s.removeListener("free", onFree);
    s.removeListener("timeout", onTimeout);
    s.removeListener("agentRemove", onRemove);
  }
  s.on("agentRemove", onRemove);

  if (agent[kOnKeylog]) {
    s.on("keylog", agent[kOnKeylog]);
  }
}

Agent.prototype.addRequest = function (req, host, port, localAddress) {
  // 参数处理
  if (typeof options === "string") {
    options = {
      __proto__: null,
      host: options,
      port,
      localAddress,
    };
  }
  options = { __proto__: null, ...options, ...this.options };
  if (options.socketPath) options.path = options.socketPath;

  if (!options.servername && options.servername !== "")
    options.servername = calculateServerName(options, req);

  // 拿到请求对应的key
  const name = this.getName(options);
  // 该key还没有在使用的socket则初始化
  if (!this.sockets[name]) {
    this.sockets[name] = [];
  }

  const freeSockets = this.freeSockets[name];
  let socket;
  if (freeSockets) {
    while (freeSockets.length && freeSockets[0].destroyed) {
      ArrayPrototypeShift(freeSockets);
    }
    socket =
      this.scheduling === "fifo"
        ? ArrayPrototypeShift(freeSockets)
        : ArrayPrototypePop(freeSockets);
    if (!freeSockets.length) delete this.freeSockets[name];
  }
  // 该key对应的空闲socket列表
  const freeLen = freeSockets ? freeSockets.length : 0;
  // 该key对应的所有socket个数
  const sockLen = freeLen + this.sockets[name].length;

  if (socket) {
    asyncResetHandle(socket);
    this.reuseSocket(socket, req);
    setRequestSocket(this, req, socket);
    ArrayPrototypePush(this.sockets[name], socket);
  } else if (
    sockLen < this.maxSockets &&
    this.totalSocketCount < this.maxTotalSockets
  ) {
    debug("call onSocket", sockLen, freeLen);
    // If we are under maxSockets create a new one.
    this.createSocket(req, options, (err, socket) => {
      if (err) req.onSocket(socket, err);
      else setRequestSocket(this, req, socket);
    });
  } else {
    debug("wait for socket");
    // We are over limit so we'll add it to the queue.
    if (!this.requests[name]) {
      this.requests[name] = [];
    }

    // Used to create sockets for pending requests from different origin
    req[kRequestOptions] = options;
    // Used to capture the original async context.
    req[kRequestAsyncResource] = new AsyncResource("QueuedRequest");

    ArrayPrototypePush(this.requests[name], req);
  }
};

Agent.prototype.keepSocketAlive = function keepSocketAlive(socket) {
  socket.setKeepAlive(true, this.keepAliveMsecs);
  socket.unref();

  const agentTimeout = this.options.timeout || 0;
  if (socket.timeout !== agentTimeout) {
    socket.setTimeout(agentTimeout);
  }

  return true;
};
