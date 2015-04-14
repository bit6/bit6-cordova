// bit6 - v0.9.1

(function() {
  var __slice = [].slice;

  window.bit6 || (window.bit6 = {});

  bit6.EventEmitter = (function() {
    function EventEmitter() {
      this.events = {};
    }

    EventEmitter.prototype.emit = function() {
      var args, event, listener, _i, _len, _ref;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!this.events[event]) {
        return false;
      }
      _ref = this.events[event];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        listener.apply(null, args);
      }
      return true;
    };

    EventEmitter.prototype.addListener = function(event, listener) {
      var _base;
      this.emit('newListener', event, listener);
      ((_base = this.events)[event] != null ? _base[event] : _base[event] = []).push(listener);
      return this;
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.once = function(event, listener) {
      var fn;
      fn = (function(_this) {
        return function() {
          _this.removeListener(event, fn);
          return listener.apply(null, arguments);
        };
      })(this);
      this.on(event, fn);
      return this;
    };

    EventEmitter.prototype.removeListener = function(event, listener) {
      var l;
      if (!this.events[event]) {
        return this;
      }
      this.events[event] = (function() {
        var _i, _len, _ref, _results;
        _ref = this.events[event];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          l = _ref[_i];
          if (l !== listener) {
            _results.push(l);
          }
        }
        return _results;
      }).call(this);
      return this;
    };

    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

    EventEmitter.prototype.removeAllListeners = function(event) {
      delete this.events[event];
      return this;
    };

    return EventEmitter;

  })();

}).call(this);

(function() {
  window.bit6 || (window.bit6 = {});

  bit6.Conversation = (function() {
    function Conversation(id) {
      this.id = id;
      this.unread = 0;
      this.updated = 0;
      this.messages = [];
      this.modified = true;
      this.uri = this.id;
    }

    Conversation.prototype.getUnreadCount = function() {
      return this.unread;
    };

    Conversation.prototype.getLastMessage = function() {
      var n;
      n = this.messages.length;
      if (n > 0) {
        return this.messages[n - 1];
      } else {
        return null;
      }
    };

    Conversation.prototype.appendMessage = function(m) {
      this.messages.push(m);
      if (this.updated < m.created) {
        this.updated = m.created;
      }
      this._updateUnreadCount();
      this.modified = true;
      return this.modified;
    };

    Conversation.prototype.updateMessage = function(m) {
      this._updateUnreadCount();
      return this.modified;
    };

    Conversation.prototype.removeMessage = function(m) {
      var i, idx, n, o, removed, _i, _len, _ref;
      n = this.messages.length;
      if (n > 0 && this.messages[n - 1].id === m.id) {
        this.modified = true;
      }
      idx = -1;
      _ref = this.messages;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        o = _ref[i];
        if (o.id === m.id) {
          idx = i;
          break;
        }
      }
      if (idx >= 0) {
        removed = this.messages.splice(idx, 1);
      }
      this._updateUnreadCount();
      return this.modified;
    };

    Conversation.prototype._updateUnreadCount = function() {
      var f, m, num, _i, _len, _ref;
      num = 0;
      _ref = this.messages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        m = _ref[_i];
        f = m.flags;
        if ((f & 0x1000) && (f & 0x000f) < 5) {
          num++;
        }
      }
      this.modified || (this.modified = num !== this.unread);
      return this.unread = num;
    };

    Conversation.prototype.domId = function() {
      if (!this.id) {
        console.log('ConvId is null', this);
        return null;
      }
      return this.id.replace(':', '--').replace('.', '_-').replace('+', '-_');
    };

    Conversation.fromDomId = function(t) {
      if (!t) {
        return t;
      }
      return t.replace('--', ':').replace('_-', '.').replace('-_', '+');
    };

    return Conversation;

  })();

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.bit6 || (window.bit6 = {});

  bit6.Dialog = (function(_super) {
    __extends(Dialog, _super);

    function Dialog(client, outgoing, other, options) {
      var myaddr;
      this.client = client;
      this.outgoing = outgoing;
      this.other = other;
      this.options = options;
      Dialog.__super__.constructor.apply(this, arguments);
      this.me = this.client.session.identity;
      this.params = {
        useVideo: this.options.video,
        useStereo: false,
        tag: 'webcam',
        callID: null
      };
      myaddr = 'uid:' + this.client.session.userid + '@' + this.client.apikey;
      if (this.outgoing) {
        this.state = 'req';
        this.params.destination_number = this.other + '@' + this.client.apikey;
        this.params.caller_id_name = this.me;
        this.params.caller_id_number = myaddr;
        this.params.callID = bit6.JsonRpc.generateGUID();
      } else {
        this.state = 'pre-answer';
        this.params.callee_id_name = this.me;
        this.params.callee_id_number = myaddr;
      }
      this.transfers = [];
    }

    Dialog.prototype.connect = function(opts) {
      var k, _i, _len, _ref, _ref1;
      if (opts == null) {
        opts = {};
      }
      if (!this.options.audio && !this.options.video) {
        this._onMediaReady();
        return true;
      }
      if (this.options.video) {
        if (!(opts.containerEl || (opts.localMediaEl && opts.remoteMediaEl))) {
          this.emit('error', 'Need container or specific video elements');
          return this.hangup();
        }
      }
      _ref = ['containerEl', 'localMediaEl', 'remoteMediaEl'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        this.options[k] = (_ref1 = opts[k]) != null ? _ref1 : null;
      }
      console.log('Dialog - calling ensure media', this);
      this.client._ensureRtcMedia(this.options, 1, (function(_this) {
        return function(ok) {
          console.log('Dialog - media available: ok=', ok, 'd=', _this);
          if (!ok) {
            _this.emit('error', 'Unable to start media');
            return _this.hangup();
          }
          return _this._onMediaReady();
        };
      })(this));
      return true;
    };

    Dialog.prototype._onMediaReady = function() {
      var iceServers;
      if (!this.outgoing) {
        this._sendAcceptRejectIncomingCall(true);
      }
      this.emit('progress');
      this.rtc = this.client._createRtc();
      this.rtc.on('offerAnswer', (function(_this) {
        return function(offerAnswer) {
          return _this._sendOfferAnswer(offerAnswer, function(err, result) {
            if (offerAnswer.type === 'answer') {
              return _this.emit('answer');
            }
          });
        };
      })(this));
      this.rtc.on('dcOpen', (function(_this) {
        return function() {
          return _this._startNextPendingTransfer();
        };
      })(this));
      this.rtc.on('transfer', (function(_this) {
        return function(tr) {
          _this.emit('transfer', tr);
          if (tr.err) {

          } else if (tr.completed() && tr.outgoing) {
            return _this._startNextPendingTransfer();
          }
        };
      })(this));
      iceServers = this.client.session.config.rtc.iceServers;
      this.rtc.init(this.client.media, this.outgoing, iceServers, this.options);
      return this.rtc.start();
    };

    Dialog.prototype._startNextPendingTransfer = function() {
      var t, _i, _len, _ref, _results;
      _ref = this.transfers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        if (t.pending()) {
          this.rtc.startOutgoingTransfer(t);
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Dialog.prototype.sendFile = function(info, data) {
      var tr;
      tr = new bit6.Transfer(info, true, data);
      this.transfers.push(tr);
      return this.rtc.startOutgoingTransfer(tr);
    };

    Dialog.prototype.hangup = function() {
      if (this.rtc) {
        this.rtc.stop();
        this.rtc = null;
        this.client._ensureRtcMedia(null, -1);
        this._sendHangupCall();
      } else if (!this.outgoing) {
        this._sendAcceptRejectIncomingCall(false);
      }
      return this.emit('end');
    };

    Dialog.prototype._sendOfferAnswer = function(offerAnswer, cb) {
      var msg;
      msg = offerAnswer;
      if (msg.type === 'offer') {
        this.state = 'sent-offer';
        msg.dialogParams = this.params;
        return this.client.rpc.call('verto.invite', msg, cb);
      } else if (msg.type === 'answer') {
        this.state = 'sent-answer';
        this.params.wantVideo = this.options.video;
        msg.dialogParams = this.params;
        return this.client.rpc.call('verto.answer', msg, cb);
      }
    };

    Dialog.prototype._sendAcceptRejectIncomingCall = function(accept) {
      var type;
      type = accept ? 'accept' : 'reject';
      return this.client._sendNotification(this.rdest, type);
    };

    Dialog.prototype._sendHangupCall = function() {
      var msg;
      this.state = 'sent-bye';
      msg = {
        dialogParams: this.params
      };
      return this.client.rpc.call('verto.bye', msg, (function(_this) {
        return function(err, result) {};
      })(this));
    };

    Dialog.prototype.handleRpcCall = function(method, params) {
      switch (method) {
        case 'verto.bye':
          return this._gotHangup(params);
        case 'verto.invite':
          this.params.callID = params.callID;
          this.params.caller_id_name = params.caller_id_name;
          this.params.caller_id_number = params.caller_id_number;
          return this._gotRemoteOfferAnswer('offer', params);
        case 'verto.answer':
          this._gotRemoteOfferAnswer('answer', params);
          return this.emit('answer');
      }
    };

    Dialog.prototype._gotRemoteOfferAnswer = function(type, offerAnswer) {
      this.state = 'got-' + type;
      offerAnswer.type = type;
      if (this.rtc != null) {
        return this.rtc.gotRemoteOfferAnswer(offerAnswer);
      } else {
        return console.log('Error: RTC not inited');
      }
    };

    Dialog.prototype._gotHangup = function(d) {
      this.state = 'got-bye';
      if (this.rtc != null) {
        this.rtc.stop();
        this.rtc = null;
        this.client._ensureRtcMedia(null, -1);
        return this.emit('end');
      }
    };

    return Dialog;

  })(bit6.EventEmitter);

}).call(this);

(function() {
  window.bit6 || (window.bit6 = {});

  bit6.JsonRpc = (function() {
    JsonRpc.prototype.reconnectDelay = 2000;

    function JsonRpc(options) {
      var _base;
      this.options = options;
      if ((_base = this.options).sessid == null) {
        _base.sessid = bit6.JsonRpc.generateGUID();
      }
      this.currentId = 1;
      this.callbacks = {};
      this.queue = [];
      this.closed = false;
    }

    JsonRpc.prototype.connect = function() {
      this.closed = false;
      if (this.ws != null) {
        return;
      }
      this.ws = new WebSocket(this.options.wsUrl);
      this.ws.onopen = (function(_this) {
        return function() {
          var m, _i, _len, _ref;
          _ref = _this.queue;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            m = _ref[_i];
            _this.ws.send(m);
          }
          return _this.queue = [];
        };
      })(this);
      this.ws.onmessage = (function(_this) {
        return function(e) {
          var cb, ex, m;
          try {
            m = JSON.parse(e.data);
            if ((m.result != null) || (m.error != null)) {
              if (m.id != null) {
                cb = _this.callbacks[m.id];
                delete _this.callbacks[m.id];
                cb(m.error, m.result);
              }
            }
            if ((m.method != null) && (m.params != null)) {
              if (m.id != null) {
                return _this.options.onRpcCall(m.method, m.params, function(err, result) {
                  var t;
                  t = {
                    jsonrpc: '2.0',
                    id: m.id
                  };
                  if (err != null) {
                    t.error = err;
                  }
                  if (result != null) {
                    t.result = result;
                  }
                  return _this._send(t);
                });
              } else {
                return _this.options.onRpcCall(m.method, m.params);
              }
            }
          } catch (_error) {
            ex = _error;
            console.log('Exception parsing JSON response ', ex);
            return console.log('  -- RAW {{{', e.data, '}}}');
          }
        };
      })(this);
      this.ws.onclose = (function(_this) {
        return function() {
          if (_this.closed) {
            return;
          }
          _this.ws = null;
          return setTimeout(function() {
            return _this.connect();
          }, _this.reconnectDelay);
        };
      })(this);
      return this.ws.onerror = (function(_this) {
        return function() {
          return console.log('Rpc ws got error. Socket state=' + _this.ws.readyState);
        };
      })(this);
    };

    JsonRpc.prototype.notify = function(m, params) {
      return this.call(m, params, false);
    };

    JsonRpc.prototype.call = function(m, params, cb) {
      var req;
      if (this.ws == null) {
        this.connect();
      }
      req = {
        jsonrpc: '2.0',
        method: m,
        params: params
      };
      req.params.login = this.options.login;
      req.params.passwd = this.options.password;
      if (this.options.sessid != null) {
        req.params.sessid = this.options.sessid;
      }
      if (cb !== false) {
        req.id = this.currentId++;
        this.callbacks[req.id] = cb;
      }
      return this._send(req);
    };

    JsonRpc.prototype._send = function(req) {
      var data;
      data = JSON.stringify(req);
      if ((this.ws != null) && this.ws.readyState === 1) {
        return this.ws.send(data);
      } else {
        return this.queue.push(data);
      }
    };

    JsonRpc.prototype.close = function() {
      this.closed = true;
      if (this.ws != null) {
        this.ws.close();
      }
      return this.ws = null;
    };

    JsonRpc.generateGUID = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r, v;
        r = Math.random() * 16 | 0;
        v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    };

    return JsonRpc;

  })();

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  window.bit6 || (window.bit6 = {});

  bit6.Client = (function(_super) {
    var endpoints;

    __extends(Client, _super);

    endpoints = {
      prod: 'https://api.bit6.com',
      dev: 'https://api.b6dev.net',
      local: 'http://127.0.0.1:3000'
    };

    function Client(options) {
      var _ref;
      this.options = options;
      Client.__super__.constructor.apply(this, arguments);
      if (this.options.apikey == null) {
        throw 'Missing required "apikey" option';
      }
      this.apikey = this.options.apikey;
      this.env = (_ref = this.options.env) != null ? _ref : 'prod';
      this._clear();
      this.session = new bit6.Session(this);
    }

    Client.prototype._clear = function() {
      this.me = {};
      this.lastSince = 0;
      this.messages = {};
      this.conversations = {};
      this.media = null;
      this.dialogs = [];
      this.customCreateDeviceId = null;
      this.customCreateRtc = null;
      return this.customCreateRtcMedia = null;
    };

    Client.prototype._onLogin = function(cb) {
      this._connectRt();
      return this._loadMe((function(_this) {
        return function(err) {
          return cb(null);
        };
      })(this));
    };

    Client.prototype._onLogout = function(cb) {
      this._disconnectRt();
      this._clear();
      if (cb != null) {
        return cb(null);
      }
    };

    Client.prototype._loadMe = function(cb) {
      var data;
      data = {
        'embed': 'messages,identities,devices,groups',
        'since': this.lastSince
      };
      return this.api('/me', data, (function(_this) {
        return function(err, result, headers) {
          var k, _i, _len, _ref, _ref1;
          if (err) {
            return cb(err);
          }
          console.log('LoadMe got', result, headers);
          _this.lastSince = (_ref = headers != null ? headers.etag : void 0) != null ? _ref : 0;
          _ref1 = ['devices', 'groups', 'identities'];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            k = _ref1[_i];
            if (result[k] != null) {
              _this.me[k] = result[k];
            }
          }
          _this._processMessages(result.messages);
          return cb();
        };
      })(this));
    };

    Client.prototype.getConversation = function(uri) {
      var _ref;
      return (_ref = this.conversations[uri]) != null ? _ref : null;
    };

    Client.prototype.getConversationByUri = function(uri) {
      var _ref;
      return (_ref = this.conversations[uri]) != null ? _ref : null;
    };

    Client.prototype.getSortedConversations = function() {
      var cc;
      cc = this.conversations;
      return Object.keys(cc).sort(function(a, b) {
        return cc[b].updated - cc[a].updated;
      }).map(function(sortedKey) {
        return cc[sortedKey];
      });
    };

    Client.prototype.addEmptyConversation = function(uri) {
      var conv, convId, _ref;
      convId = uri;
      conv = (_ref = this.conversations[convId]) != null ? _ref : null;
      if (!conv) {
        conv = new bit6.Conversation(convId);
        this.conversations[convId] = conv;
        conv.updated = Date.now();
        this.emit('conversation', conv, 1);
      }
      return conv;
    };

    Client.prototype.deleteConversation = function(conv, cb) {
      var other;
      conv = (conv != null ? conv.id : void 0) ? conv : this.getConversation(conv);
      other = encodeURIComponent(conv.id);
      return this.api('/me/messages?other=' + other, 'DELETE', (function(_this) {
        return function(err, result) {
          var m, msgs, _i, _len;
          if (err) {
            return typeof cb === "function" ? cb(err) : void 0;
          }
          msgs = conv.messages.slice();
          for (_i = 0, _len = msgs.length; _i < _len; _i++) {
            m = msgs[_i];
            m.deleted = Date.now();
            _this._processMessage(m, true);
          }
          delete _this.conversations[conv.id];
          conv.deleted = Date.now();
          _this.emit('conversation', conv, -1);
          return typeof cb === "function" ? cb(null) : void 0;
        };
      })(this));
    };

    Client.prototype.markConversationAsRead = function(conv) {
      var m, num, other, _i, _len, _ref;
      num = 0;
      _ref = conv.messages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        m = _ref[_i];
        if (m.incoming() && m.status() < bit6.Message.READ) {
          m.status(bit6.Message.READ);
          console.log('Msg to be marked: ', m);
          this._processMessage(m);
          num++;
        }
      }
      if (num > 0) {
        other = encodeURIComponent(conv.uri);
        this.api('/me/messages?other=' + other, 'PUT', {
          status: 'read'
        }, function(err, result) {
          return console.log('markAsRead result=', result);
        });
      }
      return num;
    };

    Client.prototype.sendMessage = function(m, cb) {
      var k, mx, now, tmpId, v;
      tmpId = bit6.JsonRpc.generateGUID();
      now = Date.now();
      if (m.me == null) {
        m.me = this.session.identity;
      }
      mx = {
        id: tmpId,
        flags: 0x101,
        created: now,
        updated: now
      };
      for (k in m) {
        v = m[k];
        mx[k] = v;
      }
      this._processMessage(mx);
      return this.api('/me/messages', 'POST', m, (function(_this) {
        return function(err, o) {
          var tmp;
          if (err) {
            mx.flags = 0x103;
            _this._processMessage(mx);
          } else {
            _this._processMessage(o);
            tmp = {
              id: tmpId,
              deleted: Date.now()
            };
            _this._processMessage(tmp);
          }
          return typeof cb === "function" ? cb(err, _this.messages[o.id]) : void 0;
        };
      })(this));
    };

    Client.prototype.markMessageAsRead = function(m) {
      if (m.incoming() && m.status() < bit6.Message.READ) {
        m.status(bit6.Message.READ);
        console.log('Msg to be marked: ', m);
        this._processMessage(m);
        this.api('/me/messages/' + m.id, 'PUT', {
          status: 'read'
        }, function(err, result) {
          return console.log('markAsRead result=', result);
        });
        return true;
      } else {
        return false;
      }
    };

    Client.prototype.deleteMessage = function(m, cb) {
      m = (m != null ? m.id : void 0) ? m : this.messages[m];
      return this.api('/me/messages/' + m.id, 'DELETE', (function(_this) {
        return function(err, result) {
          if (err) {
            return typeof cb === "function" ? cb(err) : void 0;
          }
          m.deleted = Date.now();
          _this._processMessage(m);
          return typeof cb === "function" ? cb(null) : void 0;
        };
      })(this));
    };

    Client.prototype._processMessages = function(messages) {
      var c, id, o, _i, _len, _ref, _results;
      for (_i = 0, _len = messages.length; _i < _len; _i++) {
        o = messages[_i];
        this._processMessage(o, true);
      }
      _ref = this.conversations;
      _results = [];
      for (id in _ref) {
        c = _ref[id];
        if (c.modified) {
          c.modified = false;
          _results.push(this.emit('conversation', c, 0));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Client.prototype._processMessage = function(o, noConvUpdateEvents) {
      var conv, convId, m, oldConv, op, _ref, _ref1;
      m = (_ref = this.messages[o.id]) != null ? _ref : null;
      op = 0;
      if (!m) {
        if ((o != null ? o.deleted : void 0) > 0) {
          return null;
        }
        m = new bit6.Message(o);
        this.messages[m.id] = m;
        op = 1;
      }
      convId = m.getConversationId();
      conv = oldConv = (_ref1 = this.conversations[convId]) != null ? _ref1 : null;
      if (!conv) {
        conv = new bit6.Conversation(convId);
        this.conversations[convId] = conv;
      }
      if (op > 0) {
        conv.appendMessage(m);
      } else {
        m.updateMessage(o);
        if ((o != null ? o.deleted : void 0) > 0) {
          delete this.messages[m.id];
          conv.removeMessage(m);
          op = -1;
        } else {
          conv.updateMessage(m);
        }
      }
      if (!oldConv) {
        conv.modified = false;
        this.emit('conversation', conv, 1);
      }
      this.emit('message', m, op);
      if (conv.modified && !noConvUpdateEvents) {
        conv.modified = false;
        this.emit('conversation', conv, 0);
      }
      return m;
    };

    Client.prototype.getGroupById = function(id) {
      var g, _i, _len, _ref;
      if (this.me.groups == null) {
        return null;
      }
      if (id.indexOf('grp:') === 0) {
        id = id.substring(4);
      }
      _ref = this.me.groups;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        g = _ref[_i];
        if (id === g.id) {
          return g;
        }
      }
      return null;
    };

    Client.prototype.sendTypingNotification = function(to) {
      return this._sendNotification(to, 'typing');
    };

    Client.prototype.sendNotification = function(to, type, data) {
      if ((type != null ? type.length : void 0) < 1 || type.charAt(0) === '_') {
        return false;
      }
      return this._sendNotification(to, '_' + type, data);
    };

    Client.prototype._sendNotification = function(to, type, data) {
      var m, msg;
      msg = {
        type: type,
        from: this.session.identity
      };
      if (data != null) {
        msg.data = data;
      }
      m = {
        'to': to,
        'body': JSON.stringify(msg)
      };
      this.rpc.call('verto.info', {
        msg: m
      }, (function(_this) {
        return function(err, result) {};
      })(this));
      return true;
    };

    Client.prototype.startCall = function(other, opts) {
      return this._createDialog(true, other, opts);
    };

    Client.prototype.findDialogByCallID = function(callID) {
      var c, _i, _len, _ref, _ref1;
      _ref = this.dialogs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (((_ref1 = c.params) != null ? _ref1.callID : void 0) === callID) {
          return c;
        }
      }
      return null;
    };

    Client.prototype.findDialogByOther = function(other) {
      var c, _i, _len, _ref;
      _ref = this.dialogs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (c.other === other) {
          return c;
        }
      }
      return null;
    };

    Client.prototype.findDialogByRdest = function(rdest) {
      var c, _i, _len, _ref;
      _ref = this.dialogs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (c.rdest === rdest) {
          return c;
        }
      }
      return null;
    };

    Client.prototype.deleteDialog = function(d) {
      var c, idx, _i, _len, _ref;
      _ref = this.dialogs;
      for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
        c = _ref[idx];
        if (c === d) {
          this.dialogs.splice(idx, 1);
          return;
        }
      }
    };

    Client.prototype._createDialog = function(outgoing, other, opts) {
      var c;
      c = this.findDialogByOther(other);
      if (c != null) {
        return null;
      }
      c = new bit6.Dialog(this, outgoing, other, opts);
      this.dialogs.push(c);
      c.on('error', (function(_this) {
        return function() {
          return console.log('Dialog error: ', c);
        };
      })(this));
      c.on('end', (function(_this) {
        return function() {
          console.log('Dialog end in Main: ', c);
          return _this.deleteDialog(c);
        };
      })(this));
      return c;
    };

    Client.prototype.setDeviceIdFactory = function(fn) {
      return this.customCreateDeviceId = fn;
    };

    Client.prototype.setRtcFactory = function(fn) {
      return this.customCreateRtc = fn;
    };

    Client.prototype.setRtcMediaFactory = function(fn) {
      return this.customCreateRtcMedia = fn;
    };

    Client.prototype._createDeviceId = function() {
      var _ref;
      return (_ref = typeof this.customCreateDeviceId === "function" ? this.customCreateDeviceId() : void 0) != null ? _ref : this._createDefaultDeviceId();
    };

    Client.prototype._createDefaultDeviceId = function() {
      return 'web-' + bit6.JsonRpc.generateGUID();
    };

    Client.prototype._createRtc = function() {
      var _ref;
      return (_ref = typeof this.customCreateRtc === "function" ? this.customCreateRtc() : void 0) != null ? _ref : this._createDefaultRtc();
    };

    Client.prototype._createDefaultRtc = function() {
      return new bit6.Rtc();
    };

    Client.prototype._createRtcMedia = function() {
      var _ref;
      return (_ref = typeof this.customCreateRtcMedia === "function" ? this.customCreateRtcMedia() : void 0) != null ? _ref : this._createDefaultRtcMedia();
    };

    Client.prototype._createDefaultRtcMedia = function() {
      return new bit6.RtcMedia();
    };

    Client.prototype._ensureRtcMedia = function(opts, delta, cb) {
      if (!this.media && delta > 0) {
        this.media = this._createRtcMedia();
        this.media.init(opts);
        this.media.start();
      }
      if (this.media) {
        this.media.counter += delta;
        if (this.media.counter > 0) {
          if (cb != null) {
            return this.media.check(cb);
          }
        } else {
          this.media.stop();
          this.media = null;
          if (cb != null) {
            return cb(true);
          }
        }
      }
    };

    Client.prototype.getNameFromIdentity = function(ident) {
      var g, r, t, _ref, _ref1, _ref2;
      t = ident;
      if (t == null) {
        console.log('getNameFromId null', ident);
        return null;
      }
      r = ident.split(':');
      if (r.length !== 2) {
        return t;
      }
      switch (r[0]) {
        case 'usr':
          t = r[1];
          break;
        case 'grp':
          g = this.getGroupById(ident);
          t = (_ref = g != null ? (_ref1 = g.group) != null ? (_ref2 = _ref1.meta) != null ? _ref2.title : void 0 : void 0 : void 0) != null ? _ref : t;
      }
      return t;
    };

    Client.prototype._handleRtMessage = function(m) {
      var _ref, _ref1;
      switch (m.type) {
        case 'push':
          return this._handlePushRtMessage(m.data);
        case 'update':
          if (((_ref = m.data) != null ? _ref.messages : void 0) != null) {
            return this._processMessages(m.data.messages);
          }
          break;
        case 'typing':
        case 'presence':
          return this.emit('notification', m);
        default:
          if ((m != null ? (_ref1 = m.type) != null ? _ref1.length : void 0 : void 0) > 1 && m.type.charAt(0) === '_') {
            m.type = m.type.substring(1);
            return this.emit('notification', m);
          }
      }
    };

    Client.prototype._handlePushRtMessage = function(d) {
      var audioOnly, audioVideo, c, ch, mtype, opts;
      mtype = d.flags & 0x0f00;
      switch (mtype) {
        case 0x0500:
          ch = d.flags & 0x00f0;
          audioVideo = ch === 0x0090;
          audioOnly = ch === 0x0080;
          opts = {
            audio: audioVideo || audioOnly,
            video: audioVideo,
            data: true
          };
          c = this._createDialog(false, d.sender, opts);
          c.rdest = d.rdest;
          return this.emit('incomingCall', c);
        case 0x0600:
          console.log('missed call from', d.sender, 'rdest=', d.rdest);
          c = this.findDialogByRdest(d.rdest);
          if (c != null) {
            return c.hangup();
          }
          break;
        case 0x0700:
          return console.log('accepted call from', d.sender, 'rdest=', d.rdest);
        case 0x0800:
          return console.log('rejected call from', d.sender, 'rdest=', d.rdest);
        case 0x0100:
        case 0x0200:
        case 0x0300:
        case 0x0400:
          return this._loadMe(function(err) {
            return console.log('LoadMsgDeltas on push done', err);
          });
        default:
          return console.log('Unknown push: ', d);
      }
    };

    Client.prototype._handleRpcNotify = function(method, params) {};

    Client.prototype._handleRpcCall = function(method, params, done) {
      var c, ex, t, x, _ref;
      switch (method) {
        case 'verto.info':
          if ((params != null ? (_ref = params.msg) != null ? _ref.body : void 0 : void 0) != null) {
            try {
              x = JSON.parse(params.msg.body);
              this._handleRtMessage(x);
            } catch (_error) {
              ex = _error;
              console.log('Exception parsing JSON response verto.info', ex);
              console.log('  -- RAW {{{', params.msg.body, '}}}');
            }
          }
          break;
        case 'verto.bye':
          c = this.findDialogByCallID(params.callID);
          if (c) {
            c.handleRpcCall(method, params);
          }
          break;
        case 'verto.invite':
          t = params.caller_id_name;
          if (t) {
            t = t.split('@');
          }
          c = this.findDialogByOther(params.caller_id_name);
          if (c) {
            c.handleRpcCall(method, params);
          }
          break;
        case 'verto.answer':
          c = this.findDialogByCallID(params.callID);
          if (c) {
            c.handleRpcCall(method, params);
          }
      }
      return done(null, {
        'method': method
      });
    };

    Client.prototype._connectRt = function() {
      var opts, s, servers, _ref, _ref1;
      servers = (_ref = this.session.config) != null ? (_ref1 = _ref.rtc) != null ? _ref1.vertoServers : void 0 : void 0;
      if (servers.length < 1) {
        console.log('Error: no Verto servers');
        return;
      }
      s = servers[0];
      opts = {
        wsUrl: s.url,
        login: s.username,
        password: s.credential,
        onRpcCall: (function(_this) {
          return function(m, params, done) {
            return _this._handleRpcCall(m, params, done);
          };
        })(this),
        onRpcNotify: (function(_this) {
          return function(m, params) {
            return _this._handleRpcNotify(m, params);
          };
        })(this)
      };
      this.rpc = new bit6.JsonRpc(opts);
      return this.rpc.call('login', {}, (function(_this) {
        return function(err, result) {};
      })(this));
    };

    Client.prototype._disconnectRt = function() {
      if (!this.rpc) {
        return;
      }
      this.rpc.close();
      return this.rpc = null;
    };

    Client.prototype.api = function() {
      var cb, params, path, _i;
      path = arguments[0], params = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
      return this._api.apply(this, ['/app/1' + path].concat(__slice.call(params), [cb]));
    };

    Client.prototype._api = function() {
      var arr, cb, data, k, m, params, path, qs, url, xhr, _i;
      path = arguments[0], params = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
      if (params.length === 1) {
        if (typeof params[0] === 'string') {
          m = params[0];
        }
        if (typeof params[0] === 'object') {
          data = params[0];
        }
      } else if (params.length >= 2) {
        m = params[0], data = params[1];
      }
      if (m == null) {
        m = 'get';
      }
      if (data == null) {
        data = {};
      }
      m = m.toLowerCase();
      url = endpoints[this.env] + path;
      url += path.indexOf('?') < 0 ? '?' : '&';
      url += 'apikey=' + this.apikey;
      if (m !== 'post') {
        url += '&_method=' + m;
      }
      url += '&envelope=1';
      if (this.session.token) {
        data._auth = 'bearer ' + this.session.token;
      }
      arr = (function() {
        var _results;
        _results = [];
        for (k in data) {
          _results.push(encodeURIComponent(k) + '=' + encodeURIComponent(data[k]));
        }
        return _results;
      })();
      qs = arr.join('&');
      xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.onreadystatechange = function() {
        var ex, r;
        if (xhr.readyState === 4) {
          r = null;
          try {
            r = JSON.parse(xhr.response);
          } catch (_error) {
            ex = _error;
            if (typeof cb === "function") {
              cb({
                'status': 501,
                'message': 'Cannot parse response',
                'data': xhr.response
              });
            }
            return;
          }
          if ((r != null ? r.status : void 0) == null) {
            if (typeof cb === "function") {
              cb({
                'status': 501,
                'message': 'Incorrect envelope',
                'data': xhr.response
              });
            }
            return;
          }
          if (xhr.status === 200 && r.status >= 200 && r.status < 300) {
            return typeof cb === "function" ? cb(null, r.response, r.headers) : void 0;
          } else {
            return typeof cb === "function" ? cb(r.response, null, r.headers) : void 0;
          }
        }
      };
      return xhr.send(qs);
    };

    Client.normalizeIdentityUri = function(u) {
      var filter, k, matcher, pos, v;
      pos = u.indexOf(':');
      if (pos < 0) {
        return null;
      }
      k = u.substr(0, pos);
      k = k.trim().toLowerCase();
      v = u.substr(pos + 1);
      filter = matcher = null;
      switch (k) {
        case 'grp':
          filter = /[\s]/;
          matcher = /[0-9a-zA-Z._]{22}/;
          break;
        case 'tel':
          filter = /[^\\d+]/;
          matcher = /^\+[1-9]{1}[0-9]{8,15}$/;
          break;
        case 'uid':
          v = v.toLowerCase();
          filter = /[^0-9a-f-]/;
          matcher = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
          break;
        case 'usr':
          v = v.toLowerCase();
          filter = /[^a-z0-9.]/;
          matcher = /^[a-z0-9.]+$/;
          break;
        default:
          return null;
      }
      if (filter) {
        v = v.replace(filter, '');
      }
      if (v.search(matcher) < 0) {
        return null;
      }
      return k + ':' + v;
    };

    return Client;

  })(bit6.EventEmitter);

}).call(this);

(function() {
  window.bit6 || (window.bit6 = {});

  bit6.Message = (function() {
    var CHANNEL_MASK, INCOMING, STATUS_MASK, TYPE_MASK, statusAsString;

    INCOMING = 0x1000;

    STATUS_MASK = 0x000f;

    CHANNEL_MASK = 0x00f0;

    TYPE_MASK = 0x0f00;

    Message.DELETED = 0x0000;

    Message.SENDING = 0x0001;

    Message.SENT = 0x0002;

    Message.FAILED = 0x0003;

    Message.DELIVERED = 0x0004;

    Message.READ = 0x0005;

    statusAsString = {
      0x0001: 'Sending',
      0x0002: 'Sent',
      0x0003: 'Failed',
      0x0004: 'Delivered',
      0x0005: 'Read'
    };

    function Message(o) {
      var k, v;
      this.id = null;
      this.me = null;
      this.other = null;
      this.flags = 0;
      if (o != null) {
        for (k in o) {
          v = o[k];
          this[k] = v;
        }
      }
    }

    Message.prototype.updateMessage = function(t) {
      if (t.deleted != null) {
        this.deleted = t.deleted;
      }
      if (t.flags) {
        this.flags = t.flags;
      }
      if (t.others == null) {
        return;
      }
      if (this.others != null) {
        return this._updateMessageOthers(this.others, t.others);
      } else {
        return this.others = t.others;
      }
    };

    Message.prototype._updateMessageOthers = function(old, others) {
      var i, idx, o, s, t, _i, _j, _len, _len1, _ref, _results;
      _results = [];
      for (_i = 0, _len = others.length; _i < _len; _i++) {
        t = others[_i];
        idx = -1;
        for (i = _j = 0, _len1 = old.length; _j < _len1; i = ++_j) {
          o = old[i];
          if (o.uri === t.uri) {
            idx = i;
            break;
          }
        }
        if (idx < 0) {
          _results.push(old.push(t));
        } else {
          s = (_ref = old[idx]) != null ? _ref.status : void 0;
          if (!s || s < t.status) {
            _results.push(old[idx].status = t.status);
          } else {
            _results.push(void 0);
          }
        }
      }
      return _results;
    };

    Message.prototype.incoming = function() {
      return (this.flags & INCOMING) !== 0;
    };

    Message.prototype.status = function(s) {
      if (s != null) {
        this.flags = (this.flags & (~STATUS_MASK)) | (s & STATUS_MASK);
      }
      return this.flags & STATUS_MASK;
    };

    Message.prototype.getConversationId = function() {
      var convId;
      convId = (this.me != null) && this.me.indexOf('grp:') === 0 ? this.me : this.other;
      if (!convId) {
        console.log('msgConvId is null', convId);
      }
      return convId;
    };

    Message.prototype.getStatusString = function() {
      var s;
      s = this.flags & STATUS_MASK;
      return statusAsString[s];
    };

    Message.prototype.domId = function() {
      return 'm' + this.id;
    };

    Message.fromDomId = function(t) {
      if (t.length > 0 && t.charAt(0) === 'm') {
        return t.substring(1);
      } else {
        return t;
      }
    };

    return Message;

  })();

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.bit6 || (window.bit6 = {});

  bit6.RtcMedia = (function(_super) {
    __extends(RtcMedia, _super);

    function RtcMedia() {
      return RtcMedia.__super__.constructor.apply(this, arguments);
    }

    RtcMedia.prototype.init = function(options) {
      this.options = options;
      this.preparing = true;
      this.ok = true;
      this.cbs = [];
      return this.counter = 0;
    };

    RtcMedia.prototype.start = function() {
      this.localStream = null;
      this.localEl = null;
      console.log('RtcMedia start', this.options);
      return RtcMedia.getUserMedia(this.options, (function(_this) {
        return function(stream) {
          _this._handleUserMedia(stream);
          return _this._done(true);
        };
      })(this), (function(_this) {
        return function(err) {
          console.log('getUserMedia error: ', err);
          return _this._done(false);
        };
      })(this));
    };

    RtcMedia.prototype.check = function(cb) {
      if (this.preparing) {
        return this.cbs.push(cb);
      } else {
        return cb(this.ok);
      }
    };

    RtcMedia.prototype._done = function(ok) {
      var cb, x, _i, _len, _results;
      this.preparing = false;
      this.ok = ok;
      x = this.cbs;
      this.cbs = [];
      _results = [];
      for (_i = 0, _len = x.length; _i < _len; _i++) {
        cb = x[_i];
        _results.push(cb(this.ok));
      }
      return _results;
    };

    RtcMedia.prototype.stop = function() {
      var _ref, _ref1;
      if (this.localStream) {
        this.localStream.stop();
        this.localStream = null;
      }
      if (this.localEl) {
        this.localEl.src = '';
        if (!this.options.localMediaEl) {
          if ((_ref = this.localEl) != null) {
            if ((_ref1 = _ref.parentNode) != null) {
              _ref1.removeChild(this.localEl);
            }
          }
        }
        return this.localEl = null;
      }
    };

    RtcMedia.prototype._handleUserMedia = function(stream) {
      var e, _ref;
      this.localStream = stream;
      e = (_ref = this.options.localMediaEl) != null ? _ref : null;
      if (!e && this.options.video) {
        e = document.createElement('video');
        e.setAttribute('class', 'local');
        e.setAttribute('autoplay', 'true');
        e.setAttribute('muted', 'true');
        this.options.containerEl.appendChild(e);
      }
      this.localEl = e;
      if (e) {
        return this.localEl = RtcMedia.attachMediaStream(e, stream);
      }
    };

    RtcMedia.getUserMedia = function(opts, success, error) {
      if ((typeof window !== "undefined" && window !== null ? window.getUserMedia : void 0) != null) {
        return window.getUserMedia(opts, success, error);
      }
      if ((typeof navigator !== "undefined" && navigator !== null ? navigator.getUserMedia : void 0) != null) {
        return navigator.getUserMedia(opts, success, error);
      }
      if ((typeof navigator !== "undefined" && navigator !== null ? navigator.mozGetUserMedia : void 0) != null) {
        return navigator.mozGetUserMedia(opts, success, error);
      }
      if ((typeof navigator !== "undefined" && navigator !== null ? navigator.webkitGetUserMedia : void 0) != null) {
        return navigator.webkitGetUserMedia(opts, success, error);
      }
      return error('WebRTC not supported. Could not find getUserMedia()');
    };

    RtcMedia.attachMediaStream = function(elem, stream) {
      if ((typeof window !== "undefined" && window !== null ? window.attachMediaStream : void 0) != null) {
        return window.attachMediaStream(elem, stream);
      }
      if ((elem != null ? elem.srcObject : void 0) != null) {
        elem.srcObject = stream;
      } else if ((elem != null ? elem.mozSrcObject : void 0) != null) {
        elem.mozSrcObject = stream;
      } else if ((elem != null ? elem.src : void 0) != null) {
        elem.src = URL.createObjectURL(stream);
      } else {
        console.log('Error attaching stream to element', elem);
      }
      return elem;
    };

    return RtcMedia;

  })(bit6.EventEmitter);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.bit6 || (window.bit6 = {});

  bit6.Rtc = (function(_super) {
    __extends(Rtc, _super);

    function Rtc() {
      return Rtc.__super__.constructor.apply(this, arguments);
    }

    Rtc.prototype.init = function(media, outgoing, iceServers, options) {
      this.media = media;
      this.outgoing = outgoing;
      this.options = options;
      this.pcConstraints = {
        optional: [
          {
            'DtlsSrtpKeyAgreement': true
          }
        ]
      };
      this.pcConfig = this._createPcConfig(iceServers);
      this.isStarted = false;
      this.remoteStream = null;
      this.pc = null;
      this.outgoingTransfer = null;
      this.incomingTransfer = null;
      this.bufferedIceCandidates = [];
      this.bufferedIceCandidatesDone = false;
      return this.bufferedOfferAnswer = null;
    };

    Rtc.prototype.start = function() {
      console.log('Rtc start', this.options);
      this.remoteEl = null;
      if (this.outgoing && this._preparePeerConnection()) {
        if (this.options.data) {
          this._createDataChannel();
        }
        return this.pc.createOffer((function(_this) {
          return function(offer) {
            return _this._setLocalAndSendOfferAnswer(offer);
          };
        })(this), (function(_this) {
          return function(err) {
            return console.log('CreateOffer error', err);
          };
        })(this));
      }
    };

    Rtc.prototype.stop = function() {
      var _ref, _ref1;
      this.isStarted = false;
      if (this.remoteStream) {
        this.remoteStream = null;
      }
      if (this.remoteEl) {
        this.remoteEl.src = '';
        if (!this.options.remoteMediaEl) {
          if ((_ref = this.remoteEl) != null) {
            if ((_ref1 = _ref.parentNode) != null) {
              _ref1.removeChild(this.remoteEl);
            }
          }
        }
        this.remoteEl = null;
      }
      if (this.dc) {
        this.dc.close();
        this.dc = null;
      }
      if (this.pc) {
        this.pc.close();
        return this.pc = null;
      }
    };

    Rtc.prototype._preparePeerConnection = function() {
      var _ref;
      if (this.isStarted) {
        return false;
      }
      this.pc = this._createPeerConnection();
      if (this.pc == null) {
        return false;
      }
      if ((_ref = this.media) != null ? _ref.localStream : void 0) {
        this.pc.addStream(this.media.localStream);
      }
      this.isStarted = true;
      return true;
    };

    Rtc.prototype._createPeerConnection = function() {
      var PeerConnection, ex, pc, _ref, _ref1;
      try {
        PeerConnection = (_ref = (_ref1 = window.RTCPeerConnection) != null ? _ref1 : window.mozRTCPeerConnection) != null ? _ref : window.webkitRTCPeerConnection;
        pc = new PeerConnection(this.pcConfig, this.pcConstraints);
        pc.onicecandidate = (function(_this) {
          return function(evt) {
            return _this._handleIceCandidate(evt);
          };
        })(this);
        pc.onaddstream = (function(_this) {
          return function(evt) {
            return _this._handleRemoteStreamAdded(evt);
          };
        })(this);
        pc.onremovestream = (function(_this) {
          return function(evt) {
            return _this._handleRemoteStreamRemoved(evt);
          };
        })(this);
        pc.ondatachannel = (function(_this) {
          return function(evt) {
            return _this._createDataChannel(evt.channel);
          };
        })(this);
        return pc;
      } catch (_error) {
        ex = _error;
        console.log('Failed to create PeerConnection, exception: ', ex);
        return null;
      }
    };

    Rtc.prototype._createDataChannel = function(dc) {
      var opts;
      if (!dc) {
        opts = {
          ordered: true
        };
        dc = this.pc.createDataChannel('mydc', opts);
      }
      this.dc = dc;
      dc.binaryType = 'arraybuffer';
      dc.onopen = (function(_this) {
        return function() {
          return _this._handleDcOpen();
        };
      })(this);
      dc.onclose = (function(_this) {
        return function() {
          return _this._handleDcClose();
        };
      })(this);
      dc.onerror = (function(_this) {
        return function(error) {
          return _this._handleDcError(error);
        };
      })(this);
      return dc.onmessage = (function(_this) {
        return function(evt) {
          return _this._handleDcMessage(evt);
        };
      })(this);
    };

    Rtc.prototype._handleDcOpen = function() {
      console.log("The Data Channel is Opened");
      return this.emit('dcOpen');
    };

    Rtc.prototype._handleDcClose = function(error) {
      console.log("The Data Channel is Closed");
      if (this.outgoingTransfer || this.incomingTransfer) {
        return this._handleDcError('DataChannel closed');
      }
    };

    Rtc.prototype._handleDcError = function(error) {
      var tr, _i, _len, _ref;
      console.log("Data Channel Error:", error);
      _ref = [this.outgoingTransfer, this.incomingTransfer];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tr = _ref[_i];
        if (tr) {
          tr.err = error;
        }
        if (tr) {
          this.emit('transfer', tr);
        }
      }
      return this.outgoingTransfer = this.incomingTransfer = null;
    };

    Rtc.prototype._handleDcMessage = function(evt) {
      var d, done, info;
      d = evt.data;
      if (this.incomingTransfer) {
        if (d.byteLength != null) {
          done = this.incomingTransfer._gotChunk(d);
          this.emit('transfer', this.incomingTransfer);
          if (done) {
            return this.incomingTransfer = null;
          }
        } else {
          return console.log('Error: incoming transfer data', d);
        }
      } else {
        if (d.byteLength != null) {
          return console.log('Error: incoming transfer not created for:', d);
        } else {
          info = JSON.parse(d);
          if (info) {
            this.incomingTransfer = new bit6.Transfer(info, false);
            return this.emit('transfer', this.incomingTransfer);
          } else {
            return console.log('Error: could not parse incoming transfer info:', d);
          }
        }
      }
    };

    Rtc.prototype._handleIceCandidate = function(evt) {
      var c, idx, _base;
      if (evt.candidate != null) {
        c = evt.candidate;
        idx = c.sdpMLineIndex;
        if ((_base = this.bufferedIceCandidates)[idx] == null) {
          _base[idx] = [];
        }
        return this.bufferedIceCandidates[idx].push(c);
      } else {
        this.bufferedIceCandidatesDone = true;
        return this._maybeSendOfferAnswer();
      }
    };

    Rtc.prototype._maybeSendOfferAnswer = function() {
      var offerAnswer;
      if (this.bufferedOfferAnswer && this.bufferedIceCandidatesDone) {
        offerAnswer = this._mergeSdp(this.bufferedOfferAnswer, this.bufferedIceCandidates);
        this.bufferedOfferAnswer = null;
        this.bufferedIceCandidates = [];
        this.bufferedIceCandidatesDone = false;
        if (offerAnswer) {
          return this.emit('offerAnswer', offerAnswer);
        }
      }
    };

    Rtc.prototype._createPcConfig = function(iceServers) {
      var c;
      console.log('RTC createPcConfig got ICE servers:', iceServers);
      return c = {
        iceServers: iceServers
      };
    };

    Rtc.prototype._mergeSdp = function(offerAnswer, candidatesByMlineIndex) {
      var chunk, chunks, end, idx, sdp, start, _i, _len;
      sdp = offerAnswer.sdp;
      chunks = [];
      start = 0;
      while ((end = sdp.indexOf('m=', start + 1)) >= 0) {
        chunks.push(sdp.substring(start, end));
        start = end;
      }
      chunks.push(sdp.substring(start));
      sdp = '';
      for (idx = _i = 0, _len = chunks.length; _i < _len; idx = ++_i) {
        chunk = chunks[idx];
        sdp += chunk;
        if (idx > 0 && (candidatesByMlineIndex[idx - 1] != null)) {
          sdp += this._iceCandidatesToSdp(candidatesByMlineIndex[idx - 1]);
        }
      }
      offerAnswer.sdp = sdp;
      return offerAnswer;
    };

    Rtc.prototype._iceCandidatesToSdp = function(arr) {
      var c, t, _i, _len;
      t = '';
      for (_i = 0, _len = arr.length; _i < _len; _i++) {
        c = arr[_i];
        t += 'a=' + c.candidate + '\r\n';
      }
      return t;
    };

    Rtc.prototype._handleRemoteStreamAdded = function(evt) {
      var e, _ref;
      this.remoteStream = evt.stream;
      e = (_ref = this.options.remoteMediaEl) != null ? _ref : null;
      if (!e) {
        if (this.options.video) {
          e = document.createElement('video');
          this.options.containerEl.appendChild(e);
        } else if (this.options.audio) {
          e = document.createElement('audio');
        }
        if (e) {
          e.setAttribute('class', 'remote');
          e.setAttribute('autoplay', 'true');
        }
      }
      this.remoteEl = e;
      if (e) {
        return this.remoteEl = bit6.RtcMedia.attachMediaStream(e, evt.stream);
      }
    };

    Rtc.prototype._handleRemoteStreamRemoved = function(evt) {
      return console.log('Remote stream removed:', evt);
    };

    Rtc.prototype._setLocalAndSendOfferAnswer = function(offerAnswer) {
      return this.pc.setLocalDescription(offerAnswer, (function(_this) {
        return function() {
          _this.bufferedOfferAnswer = {
            type: offerAnswer.type,
            sdp: offerAnswer.sdp
          };
          return _this._maybeSendOfferAnswer();
        };
      })(this), (function(_this) {
        return function(err) {
          return console.log('Error setting PeerConnection localDescription', err, offerAnswer);
        };
      })(this));
    };

    Rtc.prototype.gotRemoteOfferAnswer = function(msg) {
      var SessionDescription, offerAnswer;
      SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
      offerAnswer = new SessionDescription(msg);
      switch (msg.type) {
        case 'offer':
          if (!this.outgoing && !this.isStarted) {
            this._preparePeerConnection();
          }
          this.pc.setRemoteDescription(offerAnswer);
          return this.pc.createAnswer((function(_this) {
            return function(answer) {
              return _this._setLocalAndSendOfferAnswer(answer);
            };
          })(this), (function(_this) {
            return function(err) {
              return console.log('CreateAnswer error', err);
            };
          })(this));
        case 'answer':
          if (this.isStarted) {
            return this.pc.setRemoteDescription(offerAnswer);
          }
      }
    };

    Rtc.prototype.gotHangup = function(msg) {
      return this.stop();
    };

    Rtc.prototype.startOutgoingTransfer = function(tr) {
      var chunk, data, delay, intervalId, sent, total;
      if (this.outgoingTransfer) {
        return false;
      }
      if (!this.dc) {
        return false;
      }
      if (this.dc.readyState !== 'open') {
        return false;
      }
      this.outgoingTransfer = tr;
      this.dc.send(JSON.stringify(tr.info));
      data = tr.data;
      delay = 10;
      chunk = 100;
      sent = 0;
      total = 100;
      intervalId = 0;
      return intervalId = setInterval((function(_this) {
        return function() {
          var clear, end, _ref;
          clear = false;
          tr = _this.outgoingTransfer;
          if (!tr || tr.err) {
            clear = true;
          }
          if (!clear) {
            if (((_ref = _this.dc) != null ? _ref.bufferedAmount : void 0) > chunk * 50) {
              return;
            }
            end = sent + chunk;
            if (end > total) {
              end = total;
            }
            _this.dc.send(data.slice(sent, end));
            sent = end;
            tr.progress = sent;
            clear = sent >= total;
          }
          if (clear) {
            _this.outgoingTransfer = null;
            clearInterval(intervalId);
          }
          if (tr) {
            return _this.emit('transfer', tr);
          }
        };
      })(this), delay);
    };

    return Rtc;

  })(bit6.EventEmitter);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  window.bit6 || (window.bit6 = {});

  bit6.Session = (function(_super) {
    __extends(Session, _super);

    Session.prototype._sprops = ['authenticated', 'authInfo', 'config', 'device', 'identity', 'token', 'userid'];

    function Session(client) {
      this.client = client;
      Session.__super__.constructor.apply(this, arguments);
      this._clear();
    }

    Session.prototype._clear = function() {
      var n, _i, _len, _ref;
      _ref = this._sprops;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        this[n] = null;
      }
      return this.authenticated = false;
    };

    Session.prototype.logout = function(cb) {
      this._clear();
      this.client._onLogout(cb);
      return this.emit('deauth');
    };

    Session.prototype.getAuthInfo = function(cb) {
      if (this.authInfo) {
        return cb(null, this.authInfo);
      }
      return this.api('/info', (function(_this) {
        return function(err, info) {
          if (err) {
            return cb(err);
          }
          _this.authInfo = info;
          return cb(err, info);
        };
      })(this));
    };

    Session.prototype.login = function(data, cb) {
      data.identity = bit6.Client.normalizeIdentityUri(data.identity);
      return this._auth('login', data, cb);
    };

    Session.prototype.signup = function(data, cb) {
      data.identity = bit6.Client.normalizeIdentityUri(data.identity);
      return this._auth('signup', data, cb);
    };

    Session.prototype.anonymous = function(cb) {
      return this._auth('anonymous', {}, cb);
    };

    Session.prototype.oauth = function(provider, opts, cb) {
      var redirectUrl, _ref, _ref1, _ref2;
      redirectUrl = (_ref = opts.redirect_uri) != null ? _ref : opts.redirectUri;
      if (redirectUrl == null) {
        opts.redirect_uri = typeof window !== "undefined" && window !== null ? (_ref1 = window.location) != null ? (_ref2 = _ref1.href) != null ? _ref2.split('?')[0] : void 0 : void 0 : void 0;
      }
      return this.getAuthInfo((function(_this) {
        return function(err, info) {
          if (err) {
            return cb(err);
          }
          opts.client_id = _this.authInfo[provider].client_id;
          return _this._auth(provider, opts, cb);
        };
      })(this));
    };

    Session.prototype.refresh = function(cb) {
      return this._auth('refresh_token', {}, cb);
    };

    Session.prototype.save = function() {
      var n, x, _i, _len, _ref;
      x = {};
      _ref = this._sprops;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        x[n] = this[n];
      }
      return x;
    };

    Session.prototype.resume = function(x, cb) {
      var n, _i, _len, _ref;
      _ref = this._sprops;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        this[n] = x[n];
      }
      return this.refresh(cb);
    };

    Session.prototype._auth = function(type, data, cb) {
      if (data == null) {
        data = {};
      }
      if (this.device == null) {
        this.device = this.client._createDeviceId();
      }
      data.device = this.device;
      data.embed = 'config';
      return this.api('/' + type, 'POST', data, (function(_this) {
        return function(err, result) {
          if (err) {
            return cb(err);
          }
          return _this._authDone(result, cb);
        };
      })(this));
    };

    Session.prototype._authDone = function(data, cb) {
      var k, _i, _len, _ref, _ref1;
      if (data.token == null) {
        return cb('Jwt token is missing');
      }
      this.authenticated = true;
      _ref = ['config', 'identity', 'token', 'userid'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        this[k] = (_ref1 = data[k]) != null ? _ref1 : this[k];
      }
      this.client._onLogin(cb);
      return this.emit('auth');
    };

    Session.prototype.api = function() {
      var cb, params, path, _i, _ref;
      path = arguments[0], params = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
      return (_ref = this.client)._api.apply(_ref, ['/auth/1' + path].concat(__slice.call(params), [cb]));
    };

    return Session;

  })(bit6.EventEmitter);

}).call(this);

(function() {
  window.bit6 || (window.bit6 = {});

  bit6.Transfer = (function() {
    function Transfer(info, outgoing, data) {
      var _ref;
      this.info = info;
      this.outgoing = outgoing;
      this.data = data != null ? data : null;
      this.progress = 0;
      this.total = (_ref = this.info.size) != null ? _ref : 0;
      this.err = null;
      if (!this.outgoing) {
        this.buf = [];
      }
    }

    Transfer.prototype.pending = function() {
      return this.outgoing && !this.err && this.progress === 0;
    };

    Transfer.prototype.completed = function() {
      return this.progress === this.total && this.data && !this.err;
    };

    Transfer.prototype.percentage = function() {
      if (!this.total) {
        return 0;
      }
      return (this.progress * 100 / this.total).toFixed(2);
    };

    Transfer.prototype._gotChunk = function(chunk) {
      this.buf.push(chunk);
      this.progress += chunk.byteLength;
      if (this.progress < this.total) {
        return false;
      }
      this._prepareReceivedData();
      return true;
    };

    Transfer.prototype._prepareReceivedData = function() {
      var b, offset, tmp, _i, _len, _ref;
      tmp = new Uint8Array(this.progress);
      offset = 0;
      _ref = this.buf;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        b = _ref[_i];
        tmp.set(new Uint8Array(b), offset);
        offset += b.byteLength;
      }
      this.buf = null;
      return this.data = tmp.buffer;
    };

    return Transfer;

  })();

}).call(this);
