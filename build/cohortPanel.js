(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.cohortPanel = factory());
}(this, (function () { 'use strict';

var ascending = function (a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
};

var bisector = function (compare) {
  if (compare.length === 1) compare = ascendingComparator(compare);
  return {
    left: function (a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) < 0) lo = mid + 1;else hi = mid;
      }
      return lo;
    },
    right: function (a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) > 0) hi = mid;else lo = mid + 1;
      }
      return lo;
    }
  };
};

function ascendingComparator(f) {
  return function (d, x) {
    return ascending(f(d), x);
  };
}

var ascendingBisect = bisector(ascending);
var bisectRight = ascendingBisect.right;

var number = function (x) {
  return x === null ? NaN : +x;
};

var sequence = function (start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

  var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
};

var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);

var ticks = function (start, stop, count) {
    var reverse = stop < start,
        i = -1,
        n,
        ticks,
        step;

    if (reverse) n = start, start = stop, stop = n;

    if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

    if (step > 0) {
        start = Math.ceil(start / step);
        stop = Math.floor(stop / step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) * step;
    } else {
        start = Math.floor(start * step);
        stop = Math.ceil(stop * step);
        ticks = new Array(n = Math.ceil(start - stop + 1));
        while (++i < n) ticks[i] = (start - i) / step;
    }

    if (reverse) ticks.reverse();

    return ticks;
};

function tickIncrement(start, stop, count) {
    var step = (stop - start) / Math.max(0, count),
        power = Math.floor(Math.log(step) / Math.LN10),
        error = step / Math.pow(10, power);
    return power >= 0 ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power) : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}

function tickStep(start, stop, count) {
    var step0 = Math.abs(stop - start) / Math.max(0, count),
        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
        error = step0 / step1;
    if (error >= e10) step1 *= 10;else if (error >= e5) step1 *= 5;else if (error >= e2) step1 *= 2;
    return stop < start ? -step1 : step1;
}

var threshold = function (values, p, valueof) {
  if (valueof == null) valueof = number;
  if (!(n = values.length)) return;
  if ((p = +p) <= 0 || n < 2) return +valueof(values[0], 0, values);
  if (p >= 1) return +valueof(values[n - 1], n - 1, values);
  var n,
      i = (n - 1) * p,
      i0 = Math.floor(i),
      value0 = +valueof(values[i0], i0, values),
      value1 = +valueof(values[i0 + 1], i0 + 1, values);
  return value0 + (value1 - value0) * (i - i0);
};

var max = function (values, valueof) {
  var n = values.length,
      i = -1,
      value,
      max;

  if (valueof == null) {
    while (++i < n) {
      // Find the first comparable value.
      if ((value = values[i]) != null && value >= value) {
        max = value;
        while (++i < n) {
          // Compare the remaining values.
          if ((value = values[i]) != null && value > max) {
            max = value;
          }
        }
      }
    }
  } else {
    while (++i < n) {
      // Find the first comparable value.
      if ((value = valueof(values[i], i, values)) != null && value >= value) {
        max = value;
        while (++i < n) {
          // Compare the remaining values.
          if ((value = valueof(values[i], i, values)) != null && value > max) {
            max = value;
          }
        }
      }
    }
  }

  return max;
};

var median = function (values, valueof) {
  var n = values.length,
      i = -1,
      value,
      numbers = [];

  if (valueof == null) {
    while (++i < n) {
      if (!isNaN(value = number(values[i]))) {
        numbers.push(value);
      }
    }
  } else {
    while (++i < n) {
      if (!isNaN(value = number(valueof(values[i], i, values)))) {
        numbers.push(value);
      }
    }
  }

  return threshold(numbers.sort(ascending), 0.5);
};

var min = function (values, valueof) {
  var n = values.length,
      i = -1,
      value,
      min;

  if (valueof == null) {
    while (++i < n) {
      // Find the first comparable value.
      if ((value = values[i]) != null && value >= value) {
        min = value;
        while (++i < n) {
          // Compare the remaining values.
          if ((value = values[i]) != null && min > value) {
            min = value;
          }
        }
      }
    }
  } else {
    while (++i < n) {
      // Find the first comparable value.
      if ((value = valueof(values[i], i, values)) != null && value >= value) {
        min = value;
        while (++i < n) {
          // Compare the remaining values.
          if ((value = valueof(values[i], i, values)) != null && min > value) {
            min = value;
          }
        }
      }
    }
  }

  return min;
};

var noop = { value: function () {} };

function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}

function Dispatch(_) {
  this._ = _;
}

function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function (t) {
    var name = "",
        i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return { type: t, name: name };
  });
}

Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function (typename, callback) {
    var _ = this._,
        T = parseTypenames(typename + "", _),
        t,
        i = -1,
        n = T.length;

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
      return;
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
    }

    return this;
  },
  copy: function () {
    var copy = {},
        _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function (type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function (type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};

function get(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}

function set(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({ name: name, value: callback });
  return type;
}

var xhtml = "http://www.w3.org/1999/xhtml";

var namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

var namespace = function (name) {
  var prefix = name += "",
      i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? { space: namespaces[prefix], local: name } : name;
};

function creatorInherit(name) {
  return function () {
    var document = this.ownerDocument,
        uri = this.namespaceURI;
    return uri === xhtml && document.documentElement.namespaceURI === xhtml ? document.createElement(name) : document.createElementNS(uri, name);
  };
}

function creatorFixed(fullname) {
  return function () {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}

var creator = function (name) {
  var fullname = namespace(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
};

var matcher = function (selector) {
  return function () {
    return this.matches(selector);
  };
};

if (typeof document !== "undefined") {
  var element = document.documentElement;
  if (!element.matches) {
    var vendorMatches = element.webkitMatchesSelector || element.msMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector;
    matcher = function (selector) {
      return function () {
        return vendorMatches.call(this, selector);
      };
    };
  }
}

var matcher$1 = matcher;

var filterEvents = {};

var event = null;

if (typeof document !== "undefined") {
  var element$1 = document.documentElement;
  if (!("onmouseenter" in element$1)) {
    filterEvents = { mouseenter: "mouseover", mouseleave: "mouseout" };
  }
}

function filterContextListener(listener, index, group) {
  listener = contextListener(listener, index, group);
  return function (event) {
    var related = event.relatedTarget;
    if (!related || related !== this && !(related.compareDocumentPosition(this) & 8)) {
      listener.call(this, event);
    }
  };
}

function contextListener(listener, index, group) {
  return function (event1) {
    var event0 = event; // Events can be reentrant (e.g., focus).
    event = event1;
    try {
      listener.call(this, this.__data__, index, group);
    } finally {
      event = event0;
    }
  };
}

function parseTypenames$1(typenames) {
  return typenames.trim().split(/^|\s+/).map(function (t) {
    var name = "",
        i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name: name };
  });
}

function onRemove(typename) {
  return function () {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.capture);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;else delete this.__on;
  };
}

function onAdd(typename, value, capture) {
  var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
  return function (d, i, group) {
    var on = this.__on,
        o,
        listener = wrap(value, i, group);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.capture);
        this.addEventListener(o.type, o.listener = listener, o.capture = capture);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, capture);
    o = { type: typename.type, name: typename.name, value: value, listener: listener, capture: capture };
    if (!on) this.__on = [o];else on.push(o);
  };
}

var selection_on = function (typename, value, capture) {
  var typenames = parseTypenames$1(typename + ""),
      i,
      n = typenames.length,
      t;

  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }

  on = value ? onAdd : onRemove;
  if (capture == null) capture = false;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
  return this;
};

function customEvent(event1, listener, that, args) {
  var event0 = event;
  event1.sourceEvent = event;
  event = event1;
  try {
    return listener.apply(that, args);
  } finally {
    event = event0;
  }
}

var sourceEvent = function () {
  var current = event,
      source;
  while (source = current.sourceEvent) current = source;
  return current;
};

var point = function (node, event) {
  var svg = node.ownerSVGElement || node;

  if (svg.createSVGPoint) {
    var point = svg.createSVGPoint();
    point.x = event.clientX, point.y = event.clientY;
    point = point.matrixTransform(node.getScreenCTM().inverse());
    return [point.x, point.y];
  }

  var rect = node.getBoundingClientRect();
  return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
};

var mouse = function (node) {
  var event = sourceEvent();
  if (event.changedTouches) event = event.changedTouches[0];
  return point(node, event);
};

function none() {}

var selector = function (selector) {
  return selector == null ? none : function () {
    return this.querySelector(selector);
  };
};

var selection_select = function (select) {
  if (typeof select !== "function") select = selector(select);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }

  return new Selection(subgroups, this._parents);
};

function empty$1() {
  return [];
}

var selectorAll = function (selector) {
  return selector == null ? empty$1 : function () {
    return this.querySelectorAll(selector);
  };
};

var selection_selectAll = function (select) {
  if (typeof select !== "function") select = selectorAll(select);

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }

  return new Selection(subgroups, parents);
};

var selection_filter = function (match) {
  if (typeof match !== "function") match = matcher$1(match);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new Selection(subgroups, this._parents);
};

var sparse = function (update) {
  return new Array(update.length);
};

var selection_enter = function () {
  return new Selection(this._enter || this._groups.map(sparse), this._parents);
};

function EnterNode(parent, datum) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum;
}

EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function (child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function (child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function (selector) {
    return this._parent.querySelector(selector);
  },
  querySelectorAll: function (selector) {
    return this._parent.querySelectorAll(selector);
  }
};

var constant$1 = function (x) {
  return function () {
    return x;
  };
};

var keyPrefix = "$"; // Protect against keys like “__proto__”.

function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0,
      node,
      groupLength = group.length,
      dataLength = data.length;

  // Put any non-null nodes that fit into update.
  // Put any null nodes into enter.
  // Put any remaining data into enter.
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Put any non-null nodes that don’t fit into exit.
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}

function bindKey(parent, group, enter, update, exit, data, key) {
  var i,
      node,
      nodeByKeyValue = {},
      groupLength = group.length,
      dataLength = data.length,
      keyValues = new Array(groupLength),
      keyValue;

  // Compute the key for each node.
  // If multiple nodes have the same key, the duplicates are added to exit.
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
      if (keyValue in nodeByKeyValue) {
        exit[i] = node;
      } else {
        nodeByKeyValue[keyValue] = node;
      }
    }
  }

  // Compute the key for each datum.
  // If there a node associated with this key, join and add it to update.
  // If there is not (or the key is a duplicate), add it to enter.
  for (i = 0; i < dataLength; ++i) {
    keyValue = keyPrefix + key.call(parent, data[i], i, data);
    if (node = nodeByKeyValue[keyValue]) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue[keyValue] = null;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Add any remaining nodes that were not bound to data to exit.
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue[keyValues[i]] === node) {
      exit[i] = node;
    }
  }
}

var selection_data = function (value, key) {
  if (!value) {
    data = new Array(this.size()), j = -1;
    this.each(function (d) {
      data[++j] = d;
    });
    return data;
  }

  var bind = key ? bindKey : bindIndex,
      parents = this._parents,
      groups = this._groups;

  if (typeof value !== "function") value = constant$1(value);

  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j],
        group = groups[j],
        groupLength = group.length,
        data = value.call(parent, parent && parent.__data__, j, parents),
        dataLength = data.length,
        enterGroup = enter[j] = new Array(dataLength),
        updateGroup = update[j] = new Array(dataLength),
        exitGroup = exit[j] = new Array(groupLength);

    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

    // Now connect the enter nodes to their following update node, such that
    // appendChild can insert the materialized enter node before this node,
    // rather than at the end of the parent node.
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength);
        previous._next = next || null;
      }
    }
  }

  update = new Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
};

var selection_exit = function () {
  return new Selection(this._exit || this._groups.map(sparse), this._parents);
};

var selection_merge = function (selection$$1) {

  for (var groups0 = this._groups, groups1 = selection$$1._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new Selection(merges, this._parents);
};

var selection_order = function () {

  for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
      if (node = group[i]) {
        if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }

  return this;
};

var selection_sort = function (compare) {
  if (!compare) compare = ascending$1;

  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }

  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }

  return new Selection(sortgroups, this._parents).order();
};

function ascending$1(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

var selection_call = function () {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
};

var selection_nodes = function () {
  var nodes = new Array(this.size()),
      i = -1;
  this.each(function () {
    nodes[++i] = this;
  });
  return nodes;
};

var selection_node = function () {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }

  return null;
};

var selection_size = function () {
  var size = 0;
  this.each(function () {
    ++size;
  });
  return size;
};

var selection_empty = function () {
  return !this.node();
};

var selection_each = function (callback) {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }

  return this;
};

function attrRemove(name) {
  return function () {
    this.removeAttribute(name);
  };
}

function attrRemoveNS(fullname) {
  return function () {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant(name, value) {
  return function () {
    this.setAttribute(name, value);
  };
}

function attrConstantNS(fullname, value) {
  return function () {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}

function attrFunction(name, value) {
  return function () {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);else this.setAttribute(name, v);
  };
}

function attrFunctionNS(fullname, value) {
  return function () {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}

var selection_attr = function (name, value) {
  var fullname = namespace(name);

  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }

  return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
};

var defaultView = function (node) {
    return node.ownerDocument && node.ownerDocument.defaultView || // node is a Node
    node.document && node // node is a Window
    || node.defaultView; // node is a Document
};

function styleRemove(name) {
  return function () {
    this.style.removeProperty(name);
  };
}

function styleConstant(name, value, priority) {
  return function () {
    this.style.setProperty(name, value, priority);
  };
}

function styleFunction(name, value, priority) {
  return function () {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);else this.style.setProperty(name, v, priority);
  };
}

var selection_style = function (name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
};

function styleValue(node, name) {
  return node.style.getPropertyValue(name) || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
}

function propertyRemove(name) {
  return function () {
    delete this[name];
  };
}

function propertyConstant(name, value) {
  return function () {
    this[name] = value;
  };
}

function propertyFunction(name, value) {
  return function () {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];else this[name] = v;
  };
}

var selection_property = function (name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
};

function classArray(string) {
  return string.trim().split(/^|\s+/);
}

function classList(node) {
  return node.classList || new ClassList(node);
}

function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}

ClassList.prototype = {
  add: function (name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function (name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function (name) {
    return this._names.indexOf(name) >= 0;
  }
};

function classedAdd(node, names) {
  var list = classList(node),
      i = -1,
      n = names.length;
  while (++i < n) list.add(names[i]);
}

function classedRemove(node, names) {
  var list = classList(node),
      i = -1,
      n = names.length;
  while (++i < n) list.remove(names[i]);
}

function classedTrue(names) {
  return function () {
    classedAdd(this, names);
  };
}

function classedFalse(names) {
  return function () {
    classedRemove(this, names);
  };
}

function classedFunction(names, value) {
  return function () {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}

var selection_classed = function (name, value) {
  var names = classArray(name + "");

  if (arguments.length < 2) {
    var list = classList(this.node()),
        i = -1,
        n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }

  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
};

function textRemove() {
  this.textContent = "";
}

function textConstant(value) {
  return function () {
    this.textContent = value;
  };
}

function textFunction(value) {
  return function () {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}

var selection_text = function (value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
};

function htmlRemove() {
  this.innerHTML = "";
}

function htmlConstant(value) {
  return function () {
    this.innerHTML = value;
  };
}

function htmlFunction(value) {
  return function () {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}

var selection_html = function (value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
};

function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}

var selection_raise = function () {
  return this.each(raise);
};

function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}

var selection_lower = function () {
  return this.each(lower);
};

var selection_append = function (name) {
  var create = typeof name === "function" ? name : creator(name);
  return this.select(function () {
    return this.appendChild(create.apply(this, arguments));
  });
};

function constantNull() {
  return null;
}

var selection_insert = function (name, before) {
  var create = typeof name === "function" ? name : creator(name),
      select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function () {
    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
  });
};

function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}

var selection_remove = function () {
  return this.each(remove);
};

var selection_datum = function (value) {
    return arguments.length ? this.property("__data__", value) : this.node().__data__;
};

function dispatchEvent(node, type, params) {
  var window = defaultView(node),
      event = window.CustomEvent;

  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;else event.initEvent(type, false, false);
  }

  node.dispatchEvent(event);
}

function dispatchConstant(type, params) {
  return function () {
    return dispatchEvent(this, type, params);
  };
}

function dispatchFunction(type, params) {
  return function () {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}

var selection_dispatch = function (type, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
};

var root = [null];

function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}

function selection() {
  return new Selection([[document.documentElement]], root);
}

Selection.prototype = selection.prototype = {
  constructor: Selection,
  select: selection_select,
  selectAll: selection_selectAll,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  merge: selection_merge,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch
};

var select = function (selector) {
    return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
};

var touch = function (node, touches, identifier) {
  if (arguments.length < 3) identifier = touches, touches = sourceEvent().changedTouches;

  for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
    if ((touch = touches[i]).identifier === identifier) {
      return point(node, touch);
    }
  }

  return null;
};

function nopropagation() {
  event.stopImmediatePropagation();
}

var noevent = function () {
  event.preventDefault();
  event.stopImmediatePropagation();
};

var dragDisable = function (view) {
  var root = view.document.documentElement,
      selection = select(view).on("dragstart.drag", noevent, true);
  if ("onselectstart" in root) {
    selection.on("selectstart.drag", noevent, true);
  } else {
    root.__noselect = root.style.MozUserSelect;
    root.style.MozUserSelect = "none";
  }
};

function yesdrag(view, noclick) {
  var root = view.document.documentElement,
      selection = select(view).on("dragstart.drag", null);
  if (noclick) {
    selection.on("click.drag", noevent, true);
    setTimeout(function () {
      selection.on("click.drag", null);
    }, 0);
  }
  if ("onselectstart" in root) {
    selection.on("selectstart.drag", null);
  } else {
    root.style.MozUserSelect = root.__noselect;
    delete root.__noselect;
  }
}

var constant$2 = function (x) {
  return function () {
    return x;
  };
};

function DragEvent(target, type, subject, id, active, x, y, dx, dy, dispatch) {
  this.target = target;
  this.type = type;
  this.subject = subject;
  this.identifier = id;
  this.active = active;
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
  this._ = dispatch;
}

DragEvent.prototype.on = function () {
  var value = this._.on.apply(this._, arguments);
  return value === this._ ? this : value;
};

// Ignore right-click, since that should open the context menu.
function defaultFilter$1() {
  return !event.button;
}

function defaultContainer() {
  return this.parentNode;
}

function defaultSubject(d) {
  return d == null ? { x: event.x, y: event.y } : d;
}

function touchable() {
  return "ontouchstart" in this;
}

var drag = function () {
  var filter = defaultFilter$1,
      container = defaultContainer,
      subject = defaultSubject,
      gestures = {},
      listeners = dispatch("start", "drag", "end"),
      active = 0,
      mousedownx,
      mousedowny,
      mousemoving,
      touchending,
      clickDistance2 = 0;

  function drag(selection) {
    selection.on("mousedown.drag", mousedowned).filter(touchable).on("touchstart.drag", touchstarted).on("touchmove.drag", touchmoved).on("touchend.drag touchcancel.drag", touchended).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  function mousedowned() {
    if (touchending || !filter.apply(this, arguments)) return;
    var gesture = beforestart("mouse", container.apply(this, arguments), mouse, this, arguments);
    if (!gesture) return;
    select(event.view).on("mousemove.drag", mousemoved, true).on("mouseup.drag", mouseupped, true);
    dragDisable(event.view);
    nopropagation();
    mousemoving = false;
    mousedownx = event.clientX;
    mousedowny = event.clientY;
    gesture("start");
  }

  function mousemoved() {
    noevent();
    if (!mousemoving) {
      var dx = event.clientX - mousedownx,
          dy = event.clientY - mousedowny;
      mousemoving = dx * dx + dy * dy > clickDistance2;
    }
    gestures.mouse("drag");
  }

  function mouseupped() {
    select(event.view).on("mousemove.drag mouseup.drag", null);
    yesdrag(event.view, mousemoving);
    noevent();
    gestures.mouse("end");
  }

  function touchstarted() {
    if (!filter.apply(this, arguments)) return;
    var touches = event.changedTouches,
        c = container.apply(this, arguments),
        n = touches.length,
        i,
        gesture;

    for (i = 0; i < n; ++i) {
      if (gesture = beforestart(touches[i].identifier, c, touch, this, arguments)) {
        nopropagation();
        gesture("start");
      }
    }
  }

  function touchmoved() {
    var touches = event.changedTouches,
        n = touches.length,
        i,
        gesture;

    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        noevent();
        gesture("drag");
      }
    }
  }

  function touchended() {
    var touches = event.changedTouches,
        n = touches.length,
        i,
        gesture;

    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function () {
      touchending = null;
    }, 500); // Ghost clicks are delayed!
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        nopropagation();
        gesture("end");
      }
    }
  }

  function beforestart(id, container, point, that, args) {
    var p = point(container, id),
        s,
        dx,
        dy,
        sublisteners = listeners.copy();

    if (!customEvent(new DragEvent(drag, "beforestart", s, id, active, p[0], p[1], 0, 0, sublisteners), function () {
      if ((event.subject = s = subject.apply(that, args)) == null) return false;
      dx = s.x - p[0] || 0;
      dy = s.y - p[1] || 0;
      return true;
    })) return;

    return function gesture(type) {
      var p0 = p,
          n;
      switch (type) {
        case "start":
          gestures[id] = gesture, n = active++;break;
        case "end":
          delete gestures[id], --active; // nobreak
        case "drag":
          p = point(container, id), n = active;break;
      }
      customEvent(new DragEvent(drag, type, s, id, n, p[0] + dx, p[1] + dy, p[0] - p0[0], p[1] - p0[1], sublisteners), sublisteners.apply, sublisteners, [type, that, args]);
    };
  }

  drag.filter = function (_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant$2(!!_), drag) : filter;
  };

  drag.container = function (_) {
    return arguments.length ? (container = typeof _ === "function" ? _ : constant$2(_), drag) : container;
  };

  drag.subject = function (_) {
    return arguments.length ? (subject = typeof _ === "function" ? _ : constant$2(_), drag) : subject;
  };

  drag.on = function () {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? drag : value;
  };

  drag.clickDistance = function (_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
  };

  return drag;
};

var define = function (constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
};

function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

function Color() {}

var darker = 0.7;
var brighter = 1 / darker;

var reI = "\\s*([+-]?\\d+)\\s*";
var reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*";
var reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
var reHex3 = /^#([0-9a-f]{3})$/;
var reHex6 = /^#([0-9a-f]{6})$/;
var reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$");
var reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$");
var reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$");
var reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$");
var reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$");
var reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

var named = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

define(Color, color, {
  displayable: function () {
    return this.rgb().displayable();
  },
  toString: function () {
    return this.rgb() + "";
  }
});

function color(format) {
  var m;
  format = (format + "").trim().toLowerCase();
  return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb(m >> 8 & 0xf | m >> 4 & 0x0f0, m >> 4 & 0xf | m & 0xf0, (m & 0xf) << 4 | m & 0xf, 1) // #f00
  ) : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
  : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
  : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
  : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
  : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
  : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
  : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
  : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}

function rgbn(n) {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}

function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}

function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}

function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}

function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}

define(Rgb, rgb, extend(Color, {
  brighter: function (k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker: function (k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb: function () {
    return this;
  },
  displayable: function () {
    return 0 <= this.r && this.r <= 255 && 0 <= this.g && this.g <= 255 && 0 <= this.b && this.b <= 255 && 0 <= this.opacity && this.opacity <= 1;
  },
  toString: function () {
    var a = this.opacity;a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "rgb(" : "rgba(") + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", " + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", " + Math.max(0, Math.min(255, Math.round(this.b) || 0)) + (a === 1 ? ")" : ", " + a + ")");
  }
}));

function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;else if (l <= 0 || l >= 1) h = s = NaN;else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}

function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl();
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;else if (g === max) h = (b - r) / s + 2;else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}

function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}

function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Hsl, hsl, extend(Color, {
  brighter: function (k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function (k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function () {
    var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
    return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
  },
  displayable: function () {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  }
}));

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}

var deg2rad = Math.PI / 180;
var rad2deg = 180 / Math.PI;

var Kn = 18;
var Xn = 0.950470;
var Yn = 1;
var Zn = 1.088830;
var t0 = 4 / 29;
var t1 = 6 / 29;
var t2 = 3 * t1 * t1;
var t3 = t1 * t1 * t1;

function labConvert(o) {
  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
  if (o instanceof Hcl) {
    var h = o.h * deg2rad;
    return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
  }
  if (!(o instanceof Rgb)) o = rgbConvert(o);
  var b = rgb2xyz(o.r),
      a = rgb2xyz(o.g),
      l = rgb2xyz(o.b),
      x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn),
      y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn),
      z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);
  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
}

function lab(l, a, b, opacity) {
  return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
}

function Lab(l, a, b, opacity) {
  this.l = +l;
  this.a = +a;
  this.b = +b;
  this.opacity = +opacity;
}

define(Lab, lab, extend(Color, {
  brighter: function (k) {
    return new Lab(this.l + Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  darker: function (k) {
    return new Lab(this.l - Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  rgb: function () {
    var y = (this.l + 16) / 116,
        x = isNaN(this.a) ? y : y + this.a / 500,
        z = isNaN(this.b) ? y : y - this.b / 200;
    y = Yn * lab2xyz(y);
    x = Xn * lab2xyz(x);
    z = Zn * lab2xyz(z);
    return new Rgb(xyz2rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
    xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z), xyz2rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z), this.opacity);
  }
}));

function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

function lab2xyz(t) {
  return t > t1 ? t * t * t : t2 * (t - t0);
}

function xyz2rgb(x) {
  return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
}

function rgb2xyz(x) {
  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function hclConvert(o) {
  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
  if (!(o instanceof Lab)) o = labConvert(o);
  var h = Math.atan2(o.b, o.a) * rad2deg;
  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
}

function hcl(h, c, l, opacity) {
  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
}

function Hcl(h, c, l, opacity) {
  this.h = +h;
  this.c = +c;
  this.l = +l;
  this.opacity = +opacity;
}

define(Hcl, hcl, extend(Color, {
  brighter: function (k) {
    return new Hcl(this.h, this.c, this.l + Kn * (k == null ? 1 : k), this.opacity);
  },
  darker: function (k) {
    return new Hcl(this.h, this.c, this.l - Kn * (k == null ? 1 : k), this.opacity);
  },
  rgb: function () {
    return labConvert(this).rgb();
  }
}));

var A = -0.14861;
var B = +1.78277;
var C = -0.29227;
var D = -0.90649;
var E = +1.97294;
var ED = E * D;
var EB = E * B;
var BC_DA = B * C - D * A;

function cubehelixConvert(o) {
  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Rgb)) o = rgbConvert(o);
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
      bl = b - l,
      k = (E * (g - l) - C * bl) / D,
      s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)),
      // NaN if l=0 or l=1
  h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
}

function cubehelix(h, s, l, opacity) {
  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
}

function Cubehelix(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Cubehelix, cubehelix, extend(Color, {
  brighter: function (k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function (k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function () {
    var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
        l = +this.l,
        a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
        cosh = Math.cos(h),
        sinh = Math.sin(h);
    return new Rgb(255 * (l + a * (A * cosh + B * sinh)), 255 * (l + a * (C * cosh + D * sinh)), 255 * (l + a * (E * cosh)), this.opacity);
  }
}));

var constant$3 = function (x) {
  return function () {
    return x;
  };
};

function linear(a, d) {
  return function (t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function (t) {
    return Math.pow(a + t * b, y);
  };
}

function hue(a, b) {
  var d = b - a;
  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$3(isNaN(a) ? b : a);
}

function gamma(y) {
  return (y = +y) === 1 ? nogamma : function (a, b) {
    return b - a ? exponential(a, b, y) : constant$3(isNaN(a) ? b : a);
  };
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant$3(isNaN(a) ? b : a);
}

var interpolateRgb = (function rgbGamma(y) {
  var color$$1 = gamma(y);

  function rgb$$1(start, end) {
    var r = color$$1((start = rgb(start)).r, (end = rgb(end)).r),
        g = color$$1(start.g, end.g),
        b = color$$1(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
    return function (t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb$$1.gamma = rgbGamma;

  return rgb$$1;
})(1);

var array$1 = function (a, b) {
  var nb = b ? b.length : 0,
      na = a ? Math.min(nb, a.length) : 0,
      x = new Array(nb),
      c = new Array(nb),
      i;

  for (i = 0; i < na; ++i) x[i] = interpolateValue(a[i], b[i]);
  for (; i < nb; ++i) c[i] = b[i];

  return function (t) {
    for (i = 0; i < na; ++i) c[i] = x[i](t);
    return c;
  };
};

var date = function (a, b) {
  var d = new Date();
  return a = +a, b -= a, function (t) {
    return d.setTime(a + b * t), d;
  };
};

var reinterpolate = function (a, b) {
  return a = +a, b -= a, function (t) {
    return a + b * t;
  };
};

var object = function (a, b) {
  var i = {},
      c = {},
      k;

  if (a === null || typeof a !== "object") a = {};
  if (b === null || typeof b !== "object") b = {};

  for (k in b) {
    if (k in a) {
      i[k] = interpolateValue(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return function (t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
};

var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");

function zero(b) {
  return function () {
    return b;
  };
}

function one(b) {
  return function (t) {
    return b(t) + "";
  };
}

var interpolateString = function (a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0,
      // scan index for next number in b
  am,
      // current match in a
  bm,
      // current match in b
  bs,
      // string preceding current number in b, if any
  i = -1,
      // index in s
  s = [],
      // string constants and placeholders
  q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else {
      // interpolate non-matching numbers
      s[++i] = null;
      q.push({ i: i, x: reinterpolate(am, bm) });
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function (t) {
    for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
    return s.join("");
  });
};

var interpolateValue = function (a, b) {
    var t = typeof b,
        c;
    return b == null || t === "boolean" ? constant$3(b) : (t === "number" ? reinterpolate : t === "string" ? (c = color(b)) ? (b = c, interpolateRgb) : interpolateString : b instanceof color ? interpolateRgb : b instanceof Date ? date : Array.isArray(b) ? array$1 : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object : reinterpolate)(a, b);
};

var interpolateRound = function (a, b) {
  return a = +a, b -= a, function (t) {
    return Math.round(a + b * t);
  };
};

var degrees = 180 / Math.PI;

var identity$2 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};

var decompose = function (a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX: scaleX,
    scaleY: scaleY
  };
};

var cssNode;
var cssRoot;
var cssView;
var svgNode;

function parseCss(value) {
  if (value === "none") return identity$2;
  if (!cssNode) cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView;
  cssNode.style.transform = value;
  value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
  cssRoot.removeChild(cssNode);
  value = value.slice(7, -1).split(",");
  return decompose(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
}

function parseSvg(value) {
  if (value == null) return identity$2;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity$2;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}

function interpolateTransform(parse, pxComma, pxParen, degParen) {

  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }

  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: reinterpolate(xa, xb) }, { i: i - 2, x: reinterpolate(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }

  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360;else if (b - a > 180) a += 360; // shortest path
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: reinterpolate(a, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }

  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: reinterpolate(a, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }

  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: reinterpolate(xa, xb) }, { i: i - 2, x: reinterpolate(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }

  return function (a, b) {
    var s = [],
        // string constants and placeholders
    q = []; // number interpolators
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null; // gc
    return function (t) {
      var i = -1,
          n = q.length,
          o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}

var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

function cubehelix$1(hue$$1) {
  return function cubehelixGamma(y) {
    y = +y;

    function cubehelix$$1(start, end) {
      var h = hue$$1((start = cubehelix(start)).h, (end = cubehelix(end)).h),
          s = nogamma(start.s, end.s),
          l = nogamma(start.l, end.l),
          opacity = nogamma(start.opacity, end.opacity);
      return function (t) {
        start.h = h(t);
        start.s = s(t);
        start.l = l(Math.pow(t, y));
        start.opacity = opacity(t);
        return start + "";
      };
    }

    cubehelix$$1.gamma = cubehelixGamma;

    return cubehelix$$1;
  }(1);
}

cubehelix$1(hue);
var cubehelixLong = cubehelix$1(nogamma);

var frame = 0;
var timeout = 0;
var interval = 0;
var pokeDelay = 1000;
var taskHead;
var taskTail;
var clockLast = 0;
var clockNow = 0;
var clockSkew = 0;
var clock = typeof performance === "object" && performance.now ? performance : Date;
var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function (f) {
  setTimeout(f, 17);
};

function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}

function clearNow() {
  clockNow = 0;
}

function Timer() {
  this._call = this._time = this._next = null;
}

Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function (callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function () {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};

function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}

function timerFlush() {
  now(); // Get the current time, if not already set.
  ++frame; // Pretend we’ve set an alarm, if we haven’t already.
  var t = taskHead,
      e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
    t = t._next;
  }
  --frame;
}

function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}

function poke() {
  var now = clock.now(),
      delay = now - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
}

function nap() {
  var t0,
      t1 = taskHead,
      t2,
      time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}

function sleep(time) {
  if (frame) return; // Soonest alarm already set, or will be.
  if (timeout) timeout = clearTimeout(timeout);
  var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
  if (delay > 24) {
    if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

var timeout$1 = function (callback, delay, time) {
  var t = new Timer();
  delay = delay == null ? 0 : +delay;
  t.restart(function (elapsed) {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
};

var emptyOn = dispatch("start", "end", "interrupt");
var emptyTween = [];

var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;

var schedule = function (node, name, id, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};else if (id in schedules) return;
  create(node, id, {
    name: name,
    index: index, // For context during callback.
    group: group, // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
};

function init(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id]) || schedule.state > CREATED) throw new Error("too late");
  return schedule;
}

function set$1(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id]) || schedule.state > STARTING) throw new Error("too late");
  return schedule;
}

function get$1(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id])) throw new Error("too late");
  return schedule;
}

function create(node, id, self) {
  var schedules = node.__transition,
      tween;

  // Initialize the self timer when the transition is created.
  // Note the actual delay is not known until the first callback!
  schedules[id] = self;
  self.timer = timer(schedule, 0, self.time);

  function schedule(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start, self.delay, self.time);

    // If the elapsed delay is less than our first sleep, start immediately.
    if (self.delay <= elapsed) start(elapsed - self.delay);
  }

  function start(elapsed) {
    var i, j, n, o;

    // If the state is not SCHEDULED, then we previously errored on start.
    if (self.state !== SCHEDULED) return stop();

    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) continue;

      // While this element already has a starting transition during this frame,
      // defer starting an interrupting transition until that transition has a
      // chance to tick (and possibly end); see d3/d3-transition#54!
      if (o.state === STARTED) return timeout$1(start);

      // Interrupt the active transition, if any.
      // Dispatch the interrupt event.
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }

      // Cancel any pre-empted transitions. No interrupt event is dispatched
      // because the cancelled transitions never started. Note that this also
      // removes this transition from the pending list!
      else if (+i < id) {
          o.state = ENDED;
          o.timer.stop();
          delete schedules[i];
        }
    }

    // Defer the first tick to end of the current frame; see d3/d3#1576.
    // Note the transition may be canceled after start and before the first tick!
    // Note this must be scheduled before the start event; see d3/d3-transition#16!
    // Assuming this is successful, subsequent callbacks go straight to tick.
    timeout$1(function () {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });

    // Dispatch the start event.
    // Note this must be done before the tween are initialized.
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return; // interrupted
    self.state = STARTED;

    // Initialize the tween, deleting null tween.
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }

  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
        i = -1,
        n = tween.length;

    while (++i < n) {
      tween[i].call(null, t);
    }

    // Dispatch the end event.
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }

  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id];
    for (var i in schedules) return; // eslint-disable-line no-unused-vars
    delete node.__transition;
  }
}

var interrupt = function (node, name) {
  var schedules = node.__transition,
      schedule$$1,
      active,
      empty = true,
      i;

  if (!schedules) return;

  name = name == null ? null : name + "";

  for (i in schedules) {
    if ((schedule$$1 = schedules[i]).name !== name) {
      empty = false;continue;
    }
    active = schedule$$1.state > STARTING && schedule$$1.state < ENDING;
    schedule$$1.state = ENDED;
    schedule$$1.timer.stop();
    if (active) schedule$$1.on.call("interrupt", node, node.__data__, schedule$$1.index, schedule$$1.group);
    delete schedules[i];
  }

  if (empty) delete node.__transition;
};

var selection_interrupt = function (name) {
  return this.each(function () {
    interrupt(this, name);
  });
};

function tweenRemove(id, name) {
  var tween0, tween1;
  return function () {
    var schedule$$1 = set$1(this, id),
        tween = schedule$$1.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }

    schedule$$1.tween = tween1;
  };
}

function tweenFunction(id, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error();
  return function () {
    var schedule$$1 = set$1(this, id),
        tween = schedule$$1.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = { name: name, value: value }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) tween1.push(t);
    }

    schedule$$1.tween = tween1;
  };
}

var transition_tween = function (name, value) {
  var id = this._id;

  name += "";

  if (arguments.length < 2) {
    var tween = get$1(this.node(), id).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }

  return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
};

function tweenValue(transition, name, value) {
  var id = transition._id;

  transition.each(function () {
    var schedule$$1 = set$1(this, id);
    (schedule$$1.value || (schedule$$1.value = {}))[name] = value.apply(this, arguments);
  });

  return function (node) {
    return get$1(node, id).value[name];
  };
}

var interpolate = function (a, b) {
    var c;
    return (typeof b === "number" ? reinterpolate : b instanceof color ? interpolateRgb : (c = color(b)) ? (b = c, interpolateRgb) : interpolateString)(a, b);
};

function attrRemove$1(name) {
  return function () {
    this.removeAttribute(name);
  };
}

function attrRemoveNS$1(fullname) {
  return function () {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant$1(name, interpolate$$1, value1) {
  var value00, interpolate0;
  return function () {
    var value0 = this.getAttribute(name);
    return value0 === value1 ? null : value0 === value00 ? interpolate0 : interpolate0 = interpolate$$1(value00 = value0, value1);
  };
}

function attrConstantNS$1(fullname, interpolate$$1, value1) {
  var value00, interpolate0;
  return function () {
    var value0 = this.getAttributeNS(fullname.space, fullname.local);
    return value0 === value1 ? null : value0 === value00 ? interpolate0 : interpolate0 = interpolate$$1(value00 = value0, value1);
  };
}

function attrFunction$1(name, interpolate$$1, value) {
  var value00, value10, interpolate0;
  return function () {
    var value0,
        value1 = value(this);
    if (value1 == null) return void this.removeAttribute(name);
    value0 = this.getAttribute(name);
    return value0 === value1 ? null : value0 === value00 && value1 === value10 ? interpolate0 : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
  };
}

function attrFunctionNS$1(fullname, interpolate$$1, value) {
  var value00, value10, interpolate0;
  return function () {
    var value0,
        value1 = value(this);
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    value0 = this.getAttributeNS(fullname.space, fullname.local);
    return value0 === value1 ? null : value0 === value00 && value1 === value10 ? interpolate0 : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
  };
}

var transition_attr = function (name, value) {
  var fullname = namespace(name),
      i = fullname === "transform" ? interpolateTransformSvg : interpolate;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS$1 : attrRemove$1)(fullname) : (fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, i, value + ""));
};

function attrTweenNS(fullname, value) {
  function tween() {
    var node = this,
        i = value.apply(node, arguments);
    return i && function (t) {
      node.setAttributeNS(fullname.space, fullname.local, i(t));
    };
  }
  tween._value = value;
  return tween;
}

function attrTween(name, value) {
  function tween() {
    var node = this,
        i = value.apply(node, arguments);
    return i && function (t) {
      node.setAttribute(name, i(t));
    };
  }
  tween._value = value;
  return tween;
}

var transition_attrTween = function (name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  var fullname = namespace(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
};

function delayFunction(id, value) {
  return function () {
    init(this, id).delay = +value.apply(this, arguments);
  };
}

function delayConstant(id, value) {
  return value = +value, function () {
    init(this, id).delay = value;
  };
}

var transition_delay = function (value) {
  var id = this._id;

  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id, value)) : get$1(this.node(), id).delay;
};

function durationFunction(id, value) {
  return function () {
    set$1(this, id).duration = +value.apply(this, arguments);
  };
}

function durationConstant(id, value) {
  return value = +value, function () {
    set$1(this, id).duration = value;
  };
}

var transition_duration = function (value) {
  var id = this._id;

  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id, value)) : get$1(this.node(), id).duration;
};

function easeConstant(id, value) {
  if (typeof value !== "function") throw new Error();
  return function () {
    set$1(this, id).ease = value;
  };
}

var transition_ease = function (value) {
  var id = this._id;

  return arguments.length ? this.each(easeConstant(id, value)) : get$1(this.node(), id).ease;
};

var transition_filter = function (match) {
  if (typeof match !== "function") match = matcher$1(match);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new Transition(subgroups, this._parents, this._name, this._id);
};

var transition_merge = function (transition$$1) {
  if (transition$$1._id !== this._id) throw new Error();

  for (var groups0 = this._groups, groups1 = transition$$1._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new Transition(merges, this._parents, this._name, this._id);
};

function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function (t) {
    var i = t.indexOf(".");
    if (i >= 0) t = t.slice(0, i);
    return !t || t === "start";
  });
}

function onFunction(id, name, listener) {
  var on0,
      on1,
      sit = start(name) ? init : set$1;
  return function () {
    var schedule$$1 = sit(this, id),
        on = schedule$$1.on;

    // If this node shared a dispatch with the previous node,
    // just assign the updated shared dispatch and we’re done!
    // Otherwise, copy-on-write.
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

    schedule$$1.on = on1;
  };
}

var transition_on = function (name, listener) {
  var id = this._id;

  return arguments.length < 2 ? get$1(this.node(), id).on.on(name) : this.each(onFunction(id, name, listener));
};

function removeFunction(id) {
  return function () {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id) return;
    if (parent) parent.removeChild(this);
  };
}

var transition_remove = function () {
  return this.on("end.remove", removeFunction(this._id));
};

var transition_select = function (select) {
  var name = this._name,
      id = this._id;

  if (typeof select !== "function") select = selector(select);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id, i, subgroup, get$1(node, id));
      }
    }
  }

  return new Transition(subgroups, this._parents, name, id);
};

var transition_selectAll = function (select) {
  var name = this._name,
      id = this._id;

  if (typeof select !== "function") select = selectorAll(select);

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children = select.call(node, node.__data__, i, group), child, inherit = get$1(node, id), k = 0, l = children.length; k < l; ++k) {
          if (child = children[k]) {
            schedule(child, name, id, k, children, inherit);
          }
        }
        subgroups.push(children);
        parents.push(node);
      }
    }
  }

  return new Transition(subgroups, parents, name, id);
};

var Selection$1 = selection.prototype.constructor;

var transition_selection = function () {
  return new Selection$1(this._groups, this._parents);
};

function styleRemove$1(name, interpolate$$1) {
    var value00, value10, interpolate0;
    return function () {
        var value0 = styleValue(this, name),
            value1 = (this.style.removeProperty(name), styleValue(this, name));
        return value0 === value1 ? null : value0 === value00 && value1 === value10 ? interpolate0 : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
    };
}

function styleRemoveEnd(name) {
    return function () {
        this.style.removeProperty(name);
    };
}

function styleConstant$1(name, interpolate$$1, value1) {
    var value00, interpolate0;
    return function () {
        var value0 = styleValue(this, name);
        return value0 === value1 ? null : value0 === value00 ? interpolate0 : interpolate0 = interpolate$$1(value00 = value0, value1);
    };
}

function styleFunction$1(name, interpolate$$1, value) {
    var value00, value10, interpolate0;
    return function () {
        var value0 = styleValue(this, name),
            value1 = value(this);
        if (value1 == null) value1 = (this.style.removeProperty(name), styleValue(this, name));
        return value0 === value1 ? null : value0 === value00 && value1 === value10 ? interpolate0 : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
    };
}

var transition_style = function (name, value, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
    return value == null ? this.styleTween(name, styleRemove$1(name, i)).on("end.style." + name, styleRemoveEnd(name)) : this.styleTween(name, typeof value === "function" ? styleFunction$1(name, i, tweenValue(this, "style." + name, value)) : styleConstant$1(name, i, value + ""), priority);
};

function styleTween(name, value, priority) {
  function tween() {
    var node = this,
        i = value.apply(node, arguments);
    return i && function (t) {
      node.style.setProperty(name, i(t), priority);
    };
  }
  tween._value = value;
  return tween;
}

var transition_styleTween = function (name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
};

function textConstant$1(value) {
  return function () {
    this.textContent = value;
  };
}

function textFunction$1(value) {
  return function () {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}

var transition_text = function (value) {
  return this.tween("text", typeof value === "function" ? textFunction$1(tweenValue(this, "text", value)) : textConstant$1(value == null ? "" : value + ""));
};

var transition_transition = function () {
  var name = this._name,
      id0 = this._id,
      id1 = newId();

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit = get$1(node, id0);
        schedule(node, name, id1, i, group, {
          time: inherit.time + inherit.delay + inherit.duration,
          delay: 0,
          duration: inherit.duration,
          ease: inherit.ease
        });
      }
    }
  }

  return new Transition(groups, this._parents, name, id1);
};

var id = 0;

function Transition(groups, parents, name, id) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id;
}

function transition(name) {
  return selection().transition(name);
}

function newId() {
  return ++id;
}

var selection_prototype = selection.prototype;

Transition.prototype = transition.prototype = {
  constructor: Transition,
  select: transition_select,
  selectAll: transition_selectAll,
  filter: transition_filter,
  merge: transition_merge,
  selection: transition_selection,
  transition: transition_transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: transition_on,
  attr: transition_attr,
  attrTween: transition_attrTween,
  style: transition_style,
  styleTween: transition_styleTween,
  text: transition_text,
  remove: transition_remove,
  tween: transition_tween,
  delay: transition_delay,
  duration: transition_duration,
  ease: transition_ease
};

function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}

var defaultTiming = {
  time: null, // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};

function inherit(node, id) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id])) {
    if (!(node = node.parentNode)) {
      return defaultTiming.time = now(), defaultTiming;
    }
  }
  return timing;
}

var selection_transition = function (name) {
  var id, timing;

  if (name instanceof Transition) {
    id = name._id, name = name._name;
  } else {
    id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id, i, group, timing || inherit(node, id));
      }
    }
  }

  return new Transition(groups, this._parents, name, id);
};

selection.prototype.interrupt = selection_interrupt;
selection.prototype.transition = selection_transition;

var X = {
  name: "x",
  handles: ["e", "w"].map(type),
  input: function (x, e) {
    return x && [[x[0], e[0][1]], [x[1], e[1][1]]];
  },
  output: function (xy) {
    return xy && [xy[0][0], xy[1][0]];
  }
};

var Y = {
  name: "y",
  handles: ["n", "s"].map(type),
  input: function (y, e) {
    return y && [[e[0][0], y[0]], [e[1][0], y[1]]];
  },
  output: function (xy) {
    return xy && [xy[0][1], xy[1][1]];
  }
};

var XY = {
  name: "xy",
  handles: ["n", "e", "s", "w", "nw", "ne", "se", "sw"].map(type),
  input: function (xy) {
    return xy;
  },
  output: function (xy) {
    return xy;
  }
};

function type(t) {
  return { type: t };
}

var pi$2 = Math.PI;
var tau$2 = 2 * pi$2;
var epsilon$1 = 1e-6;
var tauEpsilon = tau$2 - epsilon$1;

function Path() {
  this._x0 = this._y0 = // start of current subpath
  this._x1 = this._y1 = null; // end of current subpath
  this._ = "";
}

function path() {
  return new Path();
}

Path.prototype = path.prototype = {
  constructor: Path,
  moveTo: function (x, y) {
    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
  },
  closePath: function () {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._ += "Z";
    }
  },
  lineTo: function (x, y) {
    this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  quadraticCurveTo: function (x1, y1, x, y) {
    this._ += "Q" + +x1 + "," + +y1 + "," + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  bezierCurveTo: function (x1, y1, x2, y2, x, y) {
    this._ += "C" + +x1 + "," + +y1 + "," + +x2 + "," + +y2 + "," + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  arcTo: function (x1, y1, x2, y2, r) {
    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
    var x0 = this._x1,
        y0 = this._y1,
        x21 = x2 - x1,
        y21 = y2 - y1,
        x01 = x0 - x1,
        y01 = y0 - y1,
        l01_2 = x01 * x01 + y01 * y01;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x1,y1).
    if (this._x1 === null) {
      this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
    }

    // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
    else if (!(l01_2 > epsilon$1)) {}

      // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
      // Equivalently, is (x1,y1) coincident with (x2,y2)?
      // Or, is the radius zero? Line to (x1,y1).
      else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon$1) || !r) {
          this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Otherwise, draw an arc!
        else {
            var x20 = x2 - x0,
                y20 = y2 - y0,
                l21_2 = x21 * x21 + y21 * y21,
                l20_2 = x20 * x20 + y20 * y20,
                l21 = Math.sqrt(l21_2),
                l01 = Math.sqrt(l01_2),
                l = r * Math.tan((pi$2 - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
                t01 = l / l01,
                t21 = l / l21;

            // If the start tangent is not coincident with (x0,y0), line to.
            if (Math.abs(t01 - 1) > epsilon$1) {
              this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
            }

            this._ += "A" + r + "," + r + ",0,0," + +(y01 * x20 > x01 * y20) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
          }
  },
  arc: function (x, y, r, a0, a1, ccw) {
    x = +x, y = +y, r = +r;
    var dx = r * Math.cos(a0),
        dy = r * Math.sin(a0),
        x0 = x + dx,
        y0 = y + dy,
        cw = 1 ^ ccw,
        da = ccw ? a0 - a1 : a1 - a0;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x0,y0).
    if (this._x1 === null) {
      this._ += "M" + x0 + "," + y0;
    }

    // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
    else if (Math.abs(this._x1 - x0) > epsilon$1 || Math.abs(this._y1 - y0) > epsilon$1) {
        this._ += "L" + x0 + "," + y0;
      }

    // Is this arc empty? We’re done.
    if (!r) return;

    // Does the angle go the wrong way? Flip the direction.
    if (da < 0) da = da % tau$2 + tau$2;

    // Is this a complete circle? Draw two arcs to complete the circle.
    if (da > tauEpsilon) {
      this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
    }

    // Is this arc non-empty? Draw an arc!
    else if (da > epsilon$1) {
        this._ += "A" + r + "," + r + ",0," + +(da >= pi$2) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
      }
  },
  rect: function (x, y, w, h) {
    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + +w + "v" + +h + "h" + -w + "Z";
  },
  toString: function () {
    return this._;
  }
};

var prefix = "$";

function Map() {}

Map.prototype = map$1.prototype = {
  constructor: Map,
  has: function (key) {
    return prefix + key in this;
  },
  get: function (key) {
    return this[prefix + key];
  },
  set: function (key, value) {
    this[prefix + key] = value;
    return this;
  },
  remove: function (key) {
    var property = prefix + key;
    return property in this && delete this[property];
  },
  clear: function () {
    for (var property in this) if (property[0] === prefix) delete this[property];
  },
  keys: function () {
    var keys = [];
    for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
    return keys;
  },
  values: function () {
    var values = [];
    for (var property in this) if (property[0] === prefix) values.push(this[property]);
    return values;
  },
  entries: function () {
    var entries = [];
    for (var property in this) if (property[0] === prefix) entries.push({ key: property.slice(1), value: this[property] });
    return entries;
  },
  size: function () {
    var size = 0;
    for (var property in this) if (property[0] === prefix) ++size;
    return size;
  },
  empty: function () {
    for (var property in this) if (property[0] === prefix) return false;
    return true;
  },
  each: function (f) {
    for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
  }
};

function map$1(object, f) {
  var map = new Map();

  // Copy constructor.
  if (object instanceof Map) object.each(function (value, key) {
    map.set(key, value);
  });

  // Index array by numeric index or specified key function.
  else if (Array.isArray(object)) {
      var i = -1,
          n = object.length,
          o;

      if (f == null) while (++i < n) map.set(i, object[i]);else while (++i < n) map.set(f(o = object[i], i, object), o);
    }

    // Convert object to map.
    else if (object) for (var key in object) map.set(key, object[key]);

  return map;
}

var nest = function () {
  var keys = [],
      sortKeys = [],
      sortValues,
      rollup,
      nest;

  function apply(array, depth, createResult, setResult) {
    if (depth >= keys.length) {
      if (sortValues != null) array.sort(sortValues);
      return rollup != null ? rollup(array) : array;
    }

    var i = -1,
        n = array.length,
        key = keys[depth++],
        keyValue,
        value,
        valuesByKey = map$1(),
        values,
        result = createResult();

    while (++i < n) {
      if (values = valuesByKey.get(keyValue = key(value = array[i]) + "")) {
        values.push(value);
      } else {
        valuesByKey.set(keyValue, [value]);
      }
    }

    valuesByKey.each(function (values, key) {
      setResult(result, key, apply(values, depth, createResult, setResult));
    });

    return result;
  }

  function entries(map, depth) {
    if (++depth > keys.length) return map;
    var array,
        sortKey = sortKeys[depth - 1];
    if (rollup != null && depth >= keys.length) array = map.entries();else array = [], map.each(function (v, k) {
      array.push({ key: k, values: entries(v, depth) });
    });
    return sortKey != null ? array.sort(function (a, b) {
      return sortKey(a.key, b.key);
    }) : array;
  }

  return nest = {
    object: function (array) {
      return apply(array, 0, createObject, setObject);
    },
    map: function (array) {
      return apply(array, 0, createMap, setMap);
    },
    entries: function (array) {
      return entries(apply(array, 0, createMap, setMap), 0);
    },
    key: function (d) {
      keys.push(d);return nest;
    },
    sortKeys: function (order) {
      sortKeys[keys.length - 1] = order;return nest;
    },
    sortValues: function (order) {
      sortValues = order;return nest;
    },
    rollup: function (f) {
      rollup = f;return nest;
    }
  };
};

function createObject() {
  return {};
}

function setObject(object, key, value) {
  object[key] = value;
}

function createMap() {
  return map$1();
}

function setMap(map, key, value) {
  map.set(key, value);
}

var entries = function (map) {
  var entries = [];
  for (var key in map) entries.push({ key: key, value: map[key] });
  return entries;
};

var EOL = {};
var EOF = {};
var QUOTE = 34;
var NEWLINE = 10;
var RETURN = 13;

function objectConverter(columns) {
  return new Function("d", "return {" + columns.map(function (name, i) {
    return JSON.stringify(name) + ": d[" + i + "]";
  }).join(",") + "}");
}

function customConverter(columns, f) {
  var object = objectConverter(columns);
  return function (row, i) {
    return f(object(row), i, columns);
  };
}

// Compute unique columns in order of discovery.
function inferColumns(rows) {
  var columnSet = Object.create(null),
      columns = [];

  rows.forEach(function (row) {
    for (var column in row) {
      if (!(column in columnSet)) {
        columns.push(columnSet[column] = column);
      }
    }
  });

  return columns;
}

var dsv = function (delimiter) {
  var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
      DELIMITER = delimiter.charCodeAt(0);

  function parse(text, f) {
    var convert,
        columns,
        rows = parseRows(text, function (row, i) {
      if (convert) return convert(row, i - 1);
      columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
    });
    rows.columns = columns;
    return rows;
  }

  function parseRows(text, f) {
    var rows = [],
        // output rows
    N = text.length,
        I = 0,
        // current character index
    n = 0,
        // current line number
    t,
        // current token
    eof = N <= 0,
        // current token followed by EOF?
    eol = false; // current token followed by EOL?

    // Strip the trailing newline.
    if (text.charCodeAt(N - 1) === NEWLINE) --N;
    if (text.charCodeAt(N - 1) === RETURN) --N;

    function token() {
      if (eof) return EOF;
      if (eol) return eol = false, EOL;

      // Unescape quotes.
      var i,
          j = I,
          c;
      if (text.charCodeAt(j) === QUOTE) {
        while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
        if ((i = I) >= N) eof = true;else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;else if (c === RETURN) {
          eol = true;if (text.charCodeAt(I) === NEWLINE) ++I;
        }
        return text.slice(j + 1, i - 1).replace(/""/g, "\"");
      }

      // Find next delimiter or newline.
      while (I < N) {
        if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;else if (c === RETURN) {
          eol = true;if (text.charCodeAt(I) === NEWLINE) ++I;
        } else if (c !== DELIMITER) continue;
        return text.slice(j, i);
      }

      // Return last token before EOF.
      return eof = true, text.slice(j, N);
    }

    while ((t = token()) !== EOF) {
      var row = [];
      while (t !== EOL && t !== EOF) row.push(t), t = token();
      if (f && (row = f(row, n++)) == null) continue;
      rows.push(row);
    }

    return rows;
  }

  function format(rows, columns) {
    if (columns == null) columns = inferColumns(rows);
    return [columns.map(formatValue).join(delimiter)].concat(rows.map(function (row) {
      return columns.map(function (column) {
        return formatValue(row[column]);
      }).join(delimiter);
    })).join("\n");
  }

  function formatRows(rows) {
    return rows.map(formatRow).join("\n");
  }

  function formatRow(row) {
    return row.map(formatValue).join(delimiter);
  }

  function formatValue(text) {
    return text == null ? "" : reFormat.test(text += "") ? "\"" + text.replace(/"/g, "\"\"") + "\"" : text;
  }

  return {
    parse: parse,
    parseRows: parseRows,
    format: format,
    formatRows: formatRows
  };
};

var csv = dsv(",");

var tsv = dsv("\t");

var tree_add = function (d) {
  var x = +this._x.call(null, d),
      y = +this._y.call(null, d);
  return add(this.cover(x, y), x, y, d);
};

function add(tree, x, y, d) {
  if (isNaN(x) || isNaN(y)) return tree; // ignore invalid points

  var parent,
      node = tree._root,
      leaf = { data: d },
      x0 = tree._x0,
      y0 = tree._y0,
      x1 = tree._x1,
      y1 = tree._y1,
      xm,
      ym,
      xp,
      yp,
      right,
      bottom,
      i,
      j;

  // If the tree is empty, initialize the root as a leaf.
  if (!node) return tree._root = leaf, tree;

  // Find the existing leaf for the new point, or add it.
  while (node.length) {
    if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;else x1 = xm;
    if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym;else y1 = ym;
    if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
  }

  // Is the new point is exactly coincident with the existing point?
  xp = +tree._x.call(null, node.data);
  yp = +tree._y.call(null, node.data);
  if (x === xp && y === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;

  // Otherwise, split the leaf node until the old and new point are separated.
  do {
    parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
    if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;else x1 = xm;
    if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym;else y1 = ym;
  } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | xp >= xm));
  return parent[j] = node, parent[i] = leaf, tree;
}

function addAll(data) {
  var d,
      i,
      n = data.length,
      x,
      y,
      xz = new Array(n),
      yz = new Array(n),
      x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;

  // Compute the points and their extent.
  for (i = 0; i < n; ++i) {
    if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d))) continue;
    xz[i] = x;
    yz[i] = y;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }

  // If there were no (valid) points, inherit the existing extent.
  if (x1 < x0) x0 = this._x0, x1 = this._x1;
  if (y1 < y0) y0 = this._y0, y1 = this._y1;

  // Expand the tree to cover the new points.
  this.cover(x0, y0).cover(x1, y1);

  // Add the new points.
  for (i = 0; i < n; ++i) {
    add(this, xz[i], yz[i], data[i]);
  }

  return this;
}

var tree_cover = function (x, y) {
  if (isNaN(x = +x) || isNaN(y = +y)) return this; // ignore invalid points

  var x0 = this._x0,
      y0 = this._y0,
      x1 = this._x1,
      y1 = this._y1;

  // If the quadtree has no extent, initialize them.
  // Integer extent are necessary so that if we later double the extent,
  // the existing quadrant boundaries don’t change due to floating point error!
  if (isNaN(x0)) {
    x1 = (x0 = Math.floor(x)) + 1;
    y1 = (y0 = Math.floor(y)) + 1;
  }

  // Otherwise, double repeatedly to cover.
  else if (x0 > x || x > x1 || y0 > y || y > y1) {
      var z = x1 - x0,
          node = this._root,
          parent,
          i;

      switch (i = (y < (y0 + y1) / 2) << 1 | x < (x0 + x1) / 2) {
        case 0:
          {
            do parent = new Array(4), parent[i] = node, node = parent; while ((z *= 2, x1 = x0 + z, y1 = y0 + z, x > x1 || y > y1));
            break;
          }
        case 1:
          {
            do parent = new Array(4), parent[i] = node, node = parent; while ((z *= 2, x0 = x1 - z, y1 = y0 + z, x0 > x || y > y1));
            break;
          }
        case 2:
          {
            do parent = new Array(4), parent[i] = node, node = parent; while ((z *= 2, x1 = x0 + z, y0 = y1 - z, x > x1 || y0 > y));
            break;
          }
        case 3:
          {
            do parent = new Array(4), parent[i] = node, node = parent; while ((z *= 2, x0 = x1 - z, y0 = y1 - z, x0 > x || y0 > y));
            break;
          }
      }

      if (this._root && this._root.length) this._root = node;
    }

    // If the quadtree covers the point already, just return.
    else return this;

  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  return this;
};

var tree_data = function () {
  var data = [];
  this.visit(function (node) {
    if (!node.length) do data.push(node.data); while (node = node.next);
  });
  return data;
};

var tree_extent = function (_) {
    return arguments.length ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1]) : isNaN(this._x0) ? undefined : [[this._x0, this._y0], [this._x1, this._y1]];
};

var Quad = function (node, x0, y0, x1, y1) {
  this.node = node;
  this.x0 = x0;
  this.y0 = y0;
  this.x1 = x1;
  this.y1 = y1;
};

var tree_find = function (x, y, radius) {
  var data,
      x0 = this._x0,
      y0 = this._y0,
      x1,
      y1,
      x2,
      y2,
      x3 = this._x1,
      y3 = this._y1,
      quads = [],
      node = this._root,
      q,
      i;

  if (node) quads.push(new Quad(node, x0, y0, x3, y3));
  if (radius == null) radius = Infinity;else {
    x0 = x - radius, y0 = y - radius;
    x3 = x + radius, y3 = y + radius;
    radius *= radius;
  }

  while (q = quads.pop()) {

    // Stop searching if this quadrant can’t contain a closer node.
    if (!(node = q.node) || (x1 = q.x0) > x3 || (y1 = q.y0) > y3 || (x2 = q.x1) < x0 || (y2 = q.y1) < y0) continue;

    // Bisect the current quadrant.
    if (node.length) {
      var xm = (x1 + x2) / 2,
          ym = (y1 + y2) / 2;

      quads.push(new Quad(node[3], xm, ym, x2, y2), new Quad(node[2], x1, ym, xm, y2), new Quad(node[1], xm, y1, x2, ym), new Quad(node[0], x1, y1, xm, ym));

      // Visit the closest quadrant first.
      if (i = (y >= ym) << 1 | x >= xm) {
        q = quads[quads.length - 1];
        quads[quads.length - 1] = quads[quads.length - 1 - i];
        quads[quads.length - 1 - i] = q;
      }
    }

    // Visit this point. (Visiting coincident points isn’t necessary!)
    else {
        var dx = x - +this._x.call(null, node.data),
            dy = y - +this._y.call(null, node.data),
            d2 = dx * dx + dy * dy;
        if (d2 < radius) {
          var d = Math.sqrt(radius = d2);
          x0 = x - d, y0 = y - d;
          x3 = x + d, y3 = y + d;
          data = node.data;
        }
      }
  }

  return data;
};

var tree_remove = function (d) {
  if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d))) return this; // ignore invalid points

  var parent,
      node = this._root,
      retainer,
      previous,
      next,
      x0 = this._x0,
      y0 = this._y0,
      x1 = this._x1,
      y1 = this._y1,
      x,
      y,
      xm,
      ym,
      right,
      bottom,
      i,
      j;

  // If the tree is empty, initialize the root as a leaf.
  if (!node) return this;

  // Find the leaf node for the point.
  // While descending, also retain the deepest parent with a non-removed sibling.
  if (node.length) while (true) {
    if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;else x1 = xm;
    if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym;else y1 = ym;
    if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
    if (!node.length) break;
    if (parent[i + 1 & 3] || parent[i + 2 & 3] || parent[i + 3 & 3]) retainer = parent, j = i;
  }

  // Find the point to remove.
  while (node.data !== d) if (!(previous = node, node = node.next)) return this;
  if (next = node.next) delete node.next;

  // If there are multiple coincident points, remove just the point.
  if (previous) return next ? previous.next = next : delete previous.next, this;

  // If this is the root point, remove it.
  if (!parent) return this._root = next, this;

  // Remove this leaf.
  next ? parent[i] = next : delete parent[i];

  // If the parent now contains exactly one leaf, collapse superfluous parents.
  if ((node = parent[0] || parent[1] || parent[2] || parent[3]) && node === (parent[3] || parent[2] || parent[1] || parent[0]) && !node.length) {
    if (retainer) retainer[j] = node;else this._root = node;
  }

  return this;
};

function removeAll(data) {
  for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
  return this;
}

var tree_root = function () {
  return this._root;
};

var tree_size = function () {
  var size = 0;
  this.visit(function (node) {
    if (!node.length) do ++size; while (node = node.next);
  });
  return size;
};

var tree_visit = function (callback) {
  var quads = [],
      q,
      node = this._root,
      child,
      x0,
      y0,
      x1,
      y1;
  if (node) quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1));
  while (q = quads.pop()) {
    if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
      var xm = (x0 + x1) / 2,
          ym = (y0 + y1) / 2;
      if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
      if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
      if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
      if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
    }
  }
  return this;
};

var tree_visitAfter = function (callback) {
  var quads = [],
      next = [],
      q;
  if (this._root) quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1));
  while (q = quads.pop()) {
    var node = q.node;
    if (node.length) {
      var child,
          x0 = q.x0,
          y0 = q.y0,
          x1 = q.x1,
          y1 = q.y1,
          xm = (x0 + x1) / 2,
          ym = (y0 + y1) / 2;
      if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
      if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
      if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
      if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
    }
    next.push(q);
  }
  while (q = next.pop()) {
    callback(q.node, q.x0, q.y0, q.x1, q.y1);
  }
  return this;
};

function defaultX(d) {
  return d[0];
}

var tree_x = function (_) {
  return arguments.length ? (this._x = _, this) : this._x;
};

function defaultY(d) {
  return d[1];
}

var tree_y = function (_) {
  return arguments.length ? (this._y = _, this) : this._y;
};

function quadtree(nodes, x, y) {
  var tree = new Quadtree(x == null ? defaultX : x, y == null ? defaultY : y, NaN, NaN, NaN, NaN);
  return nodes == null ? tree : tree.addAll(nodes);
}

function Quadtree(x, y, x0, y0, x1, y1) {
  this._x = x;
  this._y = y;
  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  this._root = undefined;
}

function leaf_copy(leaf) {
  var copy = { data: leaf.data },
      next = copy;
  while (leaf = leaf.next) next = next.next = { data: leaf.data };
  return copy;
}

var treeProto = quadtree.prototype = Quadtree.prototype;

treeProto.copy = function () {
  var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1),
      node = this._root,
      nodes,
      child;

  if (!node) return copy;

  if (!node.length) return copy._root = leaf_copy(node), copy;

  nodes = [{ source: node, target: copy._root = new Array(4) }];
  while (node = nodes.pop()) {
    for (var i = 0; i < 4; ++i) {
      if (child = node.source[i]) {
        if (child.length) nodes.push({ source: child, target: node.target[i] = new Array(4) });else node.target[i] = leaf_copy(child);
      }
    }
  }

  return copy;
};

treeProto.add = tree_add;
treeProto.addAll = addAll;
treeProto.cover = tree_cover;
treeProto.data = tree_data;
treeProto.extent = tree_extent;
treeProto.find = tree_find;
treeProto.remove = tree_remove;
treeProto.removeAll = removeAll;
treeProto.root = tree_root;
treeProto.size = tree_size;
treeProto.visit = tree_visit;
treeProto.visitAfter = tree_visitAfter;
treeProto.x = tree_x;
treeProto.y = tree_y;

// Computes the decimal coefficient and exponent of the specified number x with
// significant digits p, where x is positive and p is in [1, 21] or undefined.
// For example, formatDecimal(1.23) returns ["123", 0].
var formatDecimal = function (x, p) {
  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
  var i,
      coefficient = x.slice(0, i);

  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
  return [coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient, +x.slice(i + 1)];
};

var exponent$1 = function (x) {
  return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
};

var formatGroup = function (grouping, thousands) {
  return function (value, width) {
    var i = value.length,
        t = [],
        j = 0,
        g = grouping[0],
        length = 0;

    while (i > 0 && g > 0) {
      if (length + g + 1 > width) g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width) break;
      g = grouping[j = (j + 1) % grouping.length];
    }

    return t.reverse().join(thousands);
  };
};

var formatNumerals = function (numerals) {
  return function (value) {
    return value.replace(/[0-9]/g, function (i) {
      return numerals[+i];
    });
  };
};

var formatDefault = function (x, p) {
  x = x.toPrecision(p);

  out: for (var n = x.length, i = 1, i0 = -1, i1; i < n; ++i) {
    switch (x[i]) {
      case ".":
        i0 = i1 = i;break;
      case "0":
        if (i0 === 0) i0 = i;i1 = i;break;
      case "e":
        break out;
      default:
        if (i0 > 0) i0 = 0;break;
    }
  }

  return i0 > 0 ? x.slice(0, i0) + x.slice(i1 + 1) : x;
};

var prefixExponent;

var formatPrefixAuto = function (x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1],
        i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
        n = coefficient.length;
    return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
};

var formatRounded = function (x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
};

var formatTypes = {
  "": formatDefault,
  "%": function (x, p) {
    return (x * 100).toFixed(p);
  },
  "b": function (x) {
    return Math.round(x).toString(2);
  },
  "c": function (x) {
    return x + "";
  },
  "d": function (x) {
    return Math.round(x).toString(10);
  },
  "e": function (x, p) {
    return x.toExponential(p);
  },
  "f": function (x, p) {
    return x.toFixed(p);
  },
  "g": function (x, p) {
    return x.toPrecision(p);
  },
  "o": function (x) {
    return Math.round(x).toString(8);
  },
  "p": function (x, p) {
    return formatRounded(x * 100, p);
  },
  "r": formatRounded,
  "s": formatPrefixAuto,
  "X": function (x) {
    return Math.round(x).toString(16).toUpperCase();
  },
  "x": function (x) {
    return Math.round(x).toString(16);
  }
};

// [[fill]align][sign][symbol][0][width][,][.precision][type]
var re = /^(?:(.)?([<>=^]))?([+\-\( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?([a-z%])?$/i;

function formatSpecifier(specifier) {
  return new FormatSpecifier(specifier);
}

formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

function FormatSpecifier(specifier) {
  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);

  var match,
      fill = match[1] || " ",
      align = match[2] || ">",
      sign = match[3] || "-",
      symbol = match[4] || "",
      zero = !!match[5],
      width = match[6] && +match[6],
      comma = !!match[7],
      precision = match[8] && +match[8].slice(1),
      type = match[9] || "";

  // The "n" type is an alias for ",g".
  if (type === "n") comma = true, type = "g";

  // Map invalid types to the default format.
  else if (!formatTypes[type]) type = "";

  // If zero fill is specified, padding goes after sign and before digits.
  if (zero || fill === "0" && align === "=") zero = true, fill = "0", align = "=";

  this.fill = fill;
  this.align = align;
  this.sign = sign;
  this.symbol = symbol;
  this.zero = zero;
  this.width = width;
  this.comma = comma;
  this.precision = precision;
  this.type = type;
}

FormatSpecifier.prototype.toString = function () {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width == null ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision == null ? "" : "." + Math.max(0, this.precision | 0)) + this.type;
};

var identity$3 = function (x) {
  return x;
};

var prefixes = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];

var formatLocale = function (locale) {
  var group = locale.grouping && locale.thousands ? formatGroup(locale.grouping, locale.thousands) : identity$3,
      currency = locale.currency,
      decimal = locale.decimal,
      numerals = locale.numerals ? formatNumerals(locale.numerals) : identity$3,
      percent = locale.percent || "%";

  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);

    var fill = specifier.fill,
        align = specifier.align,
        sign = specifier.sign,
        symbol = specifier.symbol,
        zero = specifier.zero,
        width = specifier.width,
        comma = specifier.comma,
        precision = specifier.precision,
        type = specifier.type;

    // Compute the prefix and suffix.
    // For SI-prefix, the suffix is lazily computed.
    var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
        suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? percent : "";

    // What format function should we use?
    // Is this an integer type?
    // Can this type generate exponential notation?
    var formatType = formatTypes[type],
        maybeSuffix = !type || /[defgprs%]/.test(type);

    // Set the default precision if not specified,
    // or clamp the specified precision to the supported range.
    // For significant precision, it must be in [1, 21].
    // For fixed precision, it must be in [0, 20].
    precision = precision == null ? type ? 6 : 12 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));

    function format(value) {
      var valuePrefix = prefix,
          valueSuffix = suffix,
          i,
          n,
          c;

      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;

        // Perform the initial formatting.
        var valueNegative = value < 0;
        value = formatType(Math.abs(value), precision);

        // If a negative value rounds to zero during formatting, treat as positive.
        if (valueNegative && +value === 0) valueNegative = false;

        // Compute the prefix and suffix.
        valuePrefix = (valueNegative ? sign === "(" ? sign : "-" : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = valueSuffix + (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + (valueNegative && sign === "(" ? ")" : "");

        // Break the formatted value into the integer “value” part that can be
        // grouped, and fractional or exponential “suffix” part that is not.
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c = value.charCodeAt(i), 48 > c || c > 57) {
              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }

      // If the fill character is not "0", grouping is applied before padding.
      if (comma && !zero) value = group(value, Infinity);

      // Compute the padding.
      var length = valuePrefix.length + value.length + valueSuffix.length,
          padding = length < width ? new Array(width - length + 1).join(fill) : "";

      // If the fill character is "0", grouping is applied after padding.
      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

      // Reconstruct the final output based on the desired alignment.
      switch (align) {
        case "<":
          value = valuePrefix + value + valueSuffix + padding;break;
        case "=":
          value = valuePrefix + padding + value + valueSuffix;break;
        case "^":
          value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);break;
        default:
          value = padding + valuePrefix + value + valueSuffix;break;
      }

      return numerals(value);
    }

    format.toString = function () {
      return specifier + "";
    };

    return format;
  }

  function formatPrefix(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
        e = Math.max(-8, Math.min(8, Math.floor(exponent$1(value) / 3))) * 3,
        k = Math.pow(10, -e),
        prefix = prefixes[8 + e / 3];
    return function (value) {
      return f(k * value) + prefix;
    };
  }

  return {
    format: newFormat,
    formatPrefix: formatPrefix
  };
};

var locale;
var format;
var formatPrefix;

defaultLocale({
  decimal: ".",
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});

function defaultLocale(definition) {
  locale = formatLocale(definition);
  format = locale.format;
  formatPrefix = locale.formatPrefix;
  return locale;
}

var precisionFixed = function (step) {
  return Math.max(0, -exponent$1(Math.abs(step)));
};

var precisionPrefix = function (step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent$1(value) / 3))) * 3 - exponent$1(Math.abs(step)));
};

var precisionRound = function (step, max) {
  step = Math.abs(step), max = Math.abs(max) - step;
  return Math.max(0, exponent$1(max) - exponent$1(step)) + 1;
};

// Adds floating point numbers with twice the normal precision.
// Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
// Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
// 305–363 (1997).
// Code adapted from GeographicLib by Charles F. F. Karney,
// http://geographiclib.sourceforge.net/

var adder = function () {
  return new Adder();
};

function Adder() {
  this.reset();
}

Adder.prototype = {
  constructor: Adder,
  reset: function () {
    this.s = // rounded value
    this.t = 0; // exact error
  },
  add: function (y) {
    add$1(temp, y, this.t);
    add$1(this, temp.s, this.s);
    if (this.s) this.t += temp.t;else this.s = temp.t;
  },
  valueOf: function () {
    return this.s;
  }
};

var temp = new Adder();

function add$1(adder, a, b) {
  var x = adder.s = a + b,
      bv = x - a,
      av = x - bv;
  adder.t = a - av + (b - bv);
}

var pi$3 = Math.PI;
var halfPi$2 = pi$3 / 2;







var atan = Math.atan;
var atan2 = Math.atan2;
var cos$1 = Math.cos;





var sin$1 = Math.sin;

var sqrt = Math.sqrt;


function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi$3 : Math.acos(x);
}

function asin(x) {
  return x > 1 ? halfPi$2 : x < -1 ? -halfPi$2 : Math.asin(x);
}

var areaRingSum = adder();

var areaSum = adder();

// TODO return a




// TODO return d

var deltaSum = adder();

// Generates a circle centered at [0°, 0°], with a given radius and precision.

// TODO Use d3-polygon’s polygonContains here for the ring check?
// TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

var sum$1 = adder();

var lengthSum = adder();

var areaSum$1 = adder();
var areaRingSum$1 = adder();

var lengthSum$1 = adder();

function azimuthalRaw(scale) {
  return function (x, y) {
    var cx = cos$1(x),
        cy = cos$1(y),
        k = scale(cx * cy);
    return [k * cy * sin$1(x), k * sin$1(y)];
  };
}

function azimuthalInvert(angle) {
  return function (x, y) {
    var z = sqrt(x * x + y * y),
        c = angle(z),
        sc = sin$1(c),
        cc = cos$1(c);
    return [atan2(x * sc, z * cc), asin(z && y * sc / z)];
  };
}

var azimuthalEqualAreaRaw = azimuthalRaw(function (cxcy) {
  return sqrt(2 / (1 + cxcy));
});

azimuthalEqualAreaRaw.invert = azimuthalInvert(function (z) {
  return 2 * asin(z / 2);
});

var azimuthalEquidistantRaw = azimuthalRaw(function (c) {
  return (c = acos(c)) && c / sin$1(c);
});

azimuthalEquidistantRaw.invert = azimuthalInvert(function (z) {
  return z;
});

function gnomonicRaw(x, y) {
  var cy = cos$1(y),
      k = cos$1(x) * cy;
  return [cy * sin$1(x) / k, sin$1(y) / k];
}

gnomonicRaw.invert = azimuthalInvert(atan);

function orthographicRaw(x, y) {
  return [cos$1(y) * sin$1(x), sin$1(y)];
}

orthographicRaw.invert = azimuthalInvert(asin);

function stereographicRaw(x, y) {
  var cy = cos$1(y),
      k = 1 + cos$1(x) * cy;
  return [cy * sin$1(x) / k, sin$1(y) / k];
}

stereographicRaw.invert = azimuthalInvert(function (z) {
  return 2 * atan(z);
});

// Returns the 2D cross product of AB and AC vectors, i.e., the z-component of
// the 3D cross product in a quadrant I Cartesian coordinate system (+x is
// right, +y is up). Returns a positive value if ABC is counter-clockwise,
// negative if clockwise, and zero if the points are collinear.

var array$2 = Array.prototype;

var map$3 = array$2.map;
var slice$5 = array$2.slice;

var implicit = { name: "implicit" };

function ordinal(range) {
  var index = map$1(),
      domain = [],
      unknown = implicit;

  range = range == null ? [] : slice$5.call(range);

  function scale(d) {
    var key = d + "",
        i = index.get(key);
    if (!i) {
      if (unknown !== implicit) return unknown;
      index.set(key, i = domain.push(d));
    }
    return range[(i - 1) % range.length];
  }

  scale.domain = function (_) {
    if (!arguments.length) return domain.slice();
    domain = [], index = map$1();
    var i = -1,
        n = _.length,
        d,
        key;
    while (++i < n) if (!index.has(key = (d = _[i]) + "")) index.set(key, domain.push(d));
    return scale;
  };

  scale.range = function (_) {
    return arguments.length ? (range = slice$5.call(_), scale) : range.slice();
  };

  scale.unknown = function (_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function () {
    return ordinal().domain(domain).range(range).unknown(unknown);
  };

  return scale;
}

function band() {
  var scale = ordinal().unknown(undefined),
      domain = scale.domain,
      ordinalRange = scale.range,
      range$$1 = [0, 1],
      step,
      bandwidth,
      round = false,
      paddingInner = 0,
      paddingOuter = 0,
      align = 0.5;

  delete scale.unknown;

  function rescale() {
    var n = domain().length,
        reverse = range$$1[1] < range$$1[0],
        start = range$$1[reverse - 0],
        stop = range$$1[1 - reverse];
    step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
    if (round) step = Math.floor(step);
    start += (stop - start - step * (n - paddingInner)) * align;
    bandwidth = step * (1 - paddingInner);
    if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
    var values = sequence(n).map(function (i) {
      return start + step * i;
    });
    return ordinalRange(reverse ? values.reverse() : values);
  }

  scale.domain = function (_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };

  scale.range = function (_) {
    return arguments.length ? (range$$1 = [+_[0], +_[1]], rescale()) : range$$1.slice();
  };

  scale.rangeRound = function (_) {
    return range$$1 = [+_[0], +_[1]], round = true, rescale();
  };

  scale.bandwidth = function () {
    return bandwidth;
  };

  scale.step = function () {
    return step;
  };

  scale.round = function (_) {
    return arguments.length ? (round = !!_, rescale()) : round;
  };

  scale.padding = function (_) {
    return arguments.length ? (paddingInner = paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
  };

  scale.paddingInner = function (_) {
    return arguments.length ? (paddingInner = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
  };

  scale.paddingOuter = function (_) {
    return arguments.length ? (paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingOuter;
  };

  scale.align = function (_) {
    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
  };

  scale.copy = function () {
    return band().domain(domain()).range(range$$1).round(round).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align);
  };

  return rescale();
}

function pointish(scale) {
  var copy = scale.copy;

  scale.padding = scale.paddingOuter;
  delete scale.paddingInner;
  delete scale.paddingOuter;

  scale.copy = function () {
    return pointish(copy());
  };

  return scale;
}

function point$1() {
  return pointish(band().paddingInner(1));
}

var constant$9 = function (x) {
  return function () {
    return x;
  };
};

var number$2 = function (x) {
  return +x;
};

var unit = [0, 1];

function deinterpolateLinear(a, b) {
  return (b -= a = +a) ? function (x) {
    return (x - a) / b;
  } : constant$9(b);
}

function deinterpolateClamp(deinterpolate) {
  return function (a, b) {
    var d = deinterpolate(a = +a, b = +b);
    return function (x) {
      return x <= a ? 0 : x >= b ? 1 : d(x);
    };
  };
}

function reinterpolateClamp(reinterpolate) {
  return function (a, b) {
    var r = reinterpolate(a = +a, b = +b);
    return function (t) {
      return t <= 0 ? a : t >= 1 ? b : r(t);
    };
  };
}

function bimap(domain, range, deinterpolate, reinterpolate) {
  var d0 = domain[0],
      d1 = domain[1],
      r0 = range[0],
      r1 = range[1];
  if (d1 < d0) d0 = deinterpolate(d1, d0), r0 = reinterpolate(r1, r0);else d0 = deinterpolate(d0, d1), r0 = reinterpolate(r0, r1);
  return function (x) {
    return r0(d0(x));
  };
}

function polymap(domain, range, deinterpolate, reinterpolate) {
  var j = Math.min(domain.length, range.length) - 1,
      d = new Array(j),
      r = new Array(j),
      i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++i < j) {
    d[i] = deinterpolate(domain[i], domain[i + 1]);
    r[i] = reinterpolate(range[i], range[i + 1]);
  }

  return function (x) {
    var i = bisectRight(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}

function copy(source, target) {
  return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp());
}

// deinterpolate(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// reinterpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding domain value x in [a,b].
function continuous(deinterpolate, reinterpolate) {
  var domain = unit,
      range = unit,
      interpolate$$1 = interpolateValue,
      clamp = false,
      piecewise,
      output,
      input;

  function rescale() {
    piecewise = Math.min(domain.length, range.length) > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }

  function scale(x) {
    return (output || (output = piecewise(domain, range, clamp ? deinterpolateClamp(deinterpolate) : deinterpolate, interpolate$$1)))(+x);
  }

  scale.invert = function (y) {
    return (input || (input = piecewise(range, domain, deinterpolateLinear, clamp ? reinterpolateClamp(reinterpolate) : reinterpolate)))(+y);
  };

  scale.domain = function (_) {
    return arguments.length ? (domain = map$3.call(_, number$2), rescale()) : domain.slice();
  };

  scale.range = function (_) {
    return arguments.length ? (range = slice$5.call(_), rescale()) : range.slice();
  };

  scale.rangeRound = function (_) {
    return range = slice$5.call(_), interpolate$$1 = interpolateRound, rescale();
  };

  scale.clamp = function (_) {
    return arguments.length ? (clamp = !!_, rescale()) : clamp;
  };

  scale.interpolate = function (_) {
    return arguments.length ? (interpolate$$1 = _, rescale()) : interpolate$$1;
  };

  return rescale();
}

var tickFormat = function (domain, count, specifier) {
  var start = domain[0],
      stop = domain[domain.length - 1],
      step = tickStep(start, stop, count == null ? 10 : count),
      precision;
  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s":
      {
        var value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
        return formatPrefix(specifier, value);
      }
    case "":
    case "e":
    case "g":
    case "p":
    case "r":
      {
        if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
        break;
      }
    case "f":
    case "%":
      {
        if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
  }
  return format(specifier);
};

function linearish(scale) {
  var domain = scale.domain;

  scale.ticks = function (count) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };

  scale.tickFormat = function (count, specifier) {
    return tickFormat(domain(), count, specifier);
  };

  scale.nice = function (count) {
    if (count == null) count = 10;

    var d = domain(),
        i0 = 0,
        i1 = d.length - 1,
        start = d[i0],
        stop = d[i1],
        step;

    if (stop < start) {
      step = start, start = stop, stop = step;
      step = i0, i0 = i1, i1 = step;
    }

    step = tickIncrement(start, stop, count);

    if (step > 0) {
      start = Math.floor(start / step) * step;
      stop = Math.ceil(stop / step) * step;
      step = tickIncrement(start, stop, count);
    } else if (step < 0) {
      start = Math.ceil(start * step) / step;
      stop = Math.floor(stop * step) / step;
      step = tickIncrement(start, stop, count);
    }

    if (step > 0) {
      d[i0] = Math.floor(start / step) * step;
      d[i1] = Math.ceil(stop / step) * step;
      domain(d);
    } else if (step < 0) {
      d[i0] = Math.ceil(start * step) / step;
      d[i1] = Math.floor(stop * step) / step;
      domain(d);
    }

    return scale;
  };

  return scale;
}

function linear$2() {
  var scale = continuous(deinterpolateLinear, reinterpolate);

  scale.copy = function () {
    return copy(scale, linear$2());
  };

  return linearish(scale);
}

function raise$1(x, exponent) {
  return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
}

function pow$1() {
  var exponent = 1,
      scale = continuous(deinterpolate, reinterpolate),
      domain = scale.domain;

  function deinterpolate(a, b) {
    return (b = raise$1(b, exponent) - (a = raise$1(a, exponent))) ? function (x) {
      return (raise$1(x, exponent) - a) / b;
    } : constant$9(b);
  }

  function reinterpolate(a, b) {
    b = raise$1(b, exponent) - (a = raise$1(a, exponent));
    return function (t) {
      return raise$1(a + b * t, 1 / exponent);
    };
  }

  scale.exponent = function (_) {
    return arguments.length ? (exponent = +_, domain(domain())) : exponent;
  };

  scale.copy = function () {
    return copy(scale, pow$1().exponent(exponent));
  };

  return linearish(scale);
}

function sqrt$1() {
  return pow$1().exponent(0.5);
}

var t0$1 = new Date();
var t1$1 = new Date();

function newInterval(floori, offseti, count, field) {

  function interval(date) {
    return floori(date = new Date(+date)), date;
  }

  interval.floor = interval;

  interval.ceil = function (date) {
    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
  };

  interval.round = function (date) {
    var d0 = interval(date),
        d1 = interval.ceil(date);
    return date - d0 < d1 - date ? d0 : d1;
  };

  interval.offset = function (date, step) {
    return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
  };

  interval.range = function (start, stop, step) {
    var range = [];
    start = interval.ceil(start);
    step = step == null ? 1 : Math.floor(step);
    if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
    do range.push(new Date(+start)); while ((offseti(start, step), floori(start), start < stop));
    return range;
  };

  interval.filter = function (test) {
    return newInterval(function (date) {
      if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
    }, function (date, step) {
      if (date >= date) {
        if (step < 0) while (++step <= 0) {
          while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
        } else while (--step >= 0) {
          while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
        }
      }
    });
  };

  if (count) {
    interval.count = function (start, end) {
      t0$1.setTime(+start), t1$1.setTime(+end);
      floori(t0$1), floori(t1$1);
      return Math.floor(count(t0$1, t1$1));
    };

    interval.every = function (step) {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval : interval.filter(field ? function (d) {
        return field(d) % step === 0;
      } : function (d) {
        return interval.count(0, d) % step === 0;
      });
    };
  }

  return interval;
}

var millisecond = newInterval(function () {
  // noop
}, function (date, step) {
  date.setTime(+date + step);
}, function (start, end) {
  return end - start;
});

// An optimized implementation for this simple case.
millisecond.every = function (k) {
  k = Math.floor(k);
  if (!isFinite(k) || !(k > 0)) return null;
  if (!(k > 1)) return millisecond;
  return newInterval(function (date) {
    date.setTime(Math.floor(date / k) * k);
  }, function (date, step) {
    date.setTime(+date + step * k);
  }, function (start, end) {
    return (end - start) / k;
  });
};

var durationSecond$1 = 1e3;
var durationMinute$1 = 6e4;
var durationHour$1 = 36e5;
var durationDay$1 = 864e5;
var durationWeek$1 = 6048e5;

var second = newInterval(function (date) {
  date.setTime(Math.floor(date / durationSecond$1) * durationSecond$1);
}, function (date, step) {
  date.setTime(+date + step * durationSecond$1);
}, function (start, end) {
  return (end - start) / durationSecond$1;
}, function (date) {
  return date.getUTCSeconds();
});

var minute = newInterval(function (date) {
  date.setTime(Math.floor(date / durationMinute$1) * durationMinute$1);
}, function (date, step) {
  date.setTime(+date + step * durationMinute$1);
}, function (start, end) {
  return (end - start) / durationMinute$1;
}, function (date) {
  return date.getMinutes();
});

var hour = newInterval(function (date) {
  var offset = date.getTimezoneOffset() * durationMinute$1 % durationHour$1;
  if (offset < 0) offset += durationHour$1;
  date.setTime(Math.floor((+date - offset) / durationHour$1) * durationHour$1 + offset);
}, function (date, step) {
  date.setTime(+date + step * durationHour$1);
}, function (start, end) {
  return (end - start) / durationHour$1;
}, function (date) {
  return date.getHours();
});

var day = newInterval(function (date) {
  date.setHours(0, 0, 0, 0);
}, function (date, step) {
  date.setDate(date.getDate() + step);
}, function (start, end) {
  return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute$1) / durationDay$1;
}, function (date) {
  return date.getDate() - 1;
});

function weekday(i) {
  return newInterval(function (date) {
    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
    date.setHours(0, 0, 0, 0);
  }, function (date, step) {
    date.setDate(date.getDate() + step * 7);
  }, function (start, end) {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute$1) / durationWeek$1;
  });
}

var sunday = weekday(0);
var monday = weekday(1);
var tuesday = weekday(2);
var wednesday = weekday(3);
var thursday = weekday(4);
var friday = weekday(5);
var saturday = weekday(6);

var month = newInterval(function (date) {
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
}, function (date, step) {
  date.setMonth(date.getMonth() + step);
}, function (start, end) {
  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}, function (date) {
  return date.getMonth();
});

var year = newInterval(function (date) {
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
}, function (date, step) {
  date.setFullYear(date.getFullYear() + step);
}, function (start, end) {
  return end.getFullYear() - start.getFullYear();
}, function (date) {
  return date.getFullYear();
});

// An optimized implementation for this simple case.
year.every = function (k) {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function (date) {
    date.setFullYear(Math.floor(date.getFullYear() / k) * k);
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, function (date, step) {
    date.setFullYear(date.getFullYear() + step * k);
  });
};

var utcMinute = newInterval(function (date) {
  date.setUTCSeconds(0, 0);
}, function (date, step) {
  date.setTime(+date + step * durationMinute$1);
}, function (start, end) {
  return (end - start) / durationMinute$1;
}, function (date) {
  return date.getUTCMinutes();
});

var utcHour = newInterval(function (date) {
  date.setUTCMinutes(0, 0, 0);
}, function (date, step) {
  date.setTime(+date + step * durationHour$1);
}, function (start, end) {
  return (end - start) / durationHour$1;
}, function (date) {
  return date.getUTCHours();
});

var utcDay = newInterval(function (date) {
  date.setUTCHours(0, 0, 0, 0);
}, function (date, step) {
  date.setUTCDate(date.getUTCDate() + step);
}, function (start, end) {
  return (end - start) / durationDay$1;
}, function (date) {
  return date.getUTCDate() - 1;
});

function utcWeekday(i) {
  return newInterval(function (date) {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, function (date, step) {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, function (start, end) {
    return (end - start) / durationWeek$1;
  });
}

var utcSunday = utcWeekday(0);
var utcMonday = utcWeekday(1);
var utcTuesday = utcWeekday(2);
var utcWednesday = utcWeekday(3);
var utcThursday = utcWeekday(4);
var utcFriday = utcWeekday(5);
var utcSaturday = utcWeekday(6);

var utcMonth = newInterval(function (date) {
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
}, function (date, step) {
  date.setUTCMonth(date.getUTCMonth() + step);
}, function (start, end) {
  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}, function (date) {
  return date.getUTCMonth();
});

var utcYear = newInterval(function (date) {
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
}, function (date, step) {
  date.setUTCFullYear(date.getUTCFullYear() + step);
}, function (start, end) {
  return end.getUTCFullYear() - start.getUTCFullYear();
}, function (date) {
  return date.getUTCFullYear();
});

// An optimized implementation for this simple case.
utcYear.every = function (k) {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function (date) {
    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, function (date, step) {
    date.setUTCFullYear(date.getUTCFullYear() + step * k);
  });
};

function localDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
    date.setFullYear(d.y);
    return date;
  }
  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}

function utcDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
    date.setUTCFullYear(d.y);
    return date;
  }
  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}

function newYear(y) {
  return { y: y, m: 0, d: 1, H: 0, M: 0, S: 0, L: 0 };
}

function formatLocale$1(locale) {
  var locale_dateTime = locale.dateTime,
      locale_date = locale.date,
      locale_time = locale.time,
      locale_periods = locale.periods,
      locale_weekdays = locale.days,
      locale_shortWeekdays = locale.shortDays,
      locale_months = locale.months,
      locale_shortMonths = locale.shortMonths;

  var periodRe = formatRe(locale_periods),
      periodLookup = formatLookup(locale_periods),
      weekdayRe = formatRe(locale_weekdays),
      weekdayLookup = formatLookup(locale_weekdays),
      shortWeekdayRe = formatRe(locale_shortWeekdays),
      shortWeekdayLookup = formatLookup(locale_shortWeekdays),
      monthRe = formatRe(locale_months),
      monthLookup = formatLookup(locale_months),
      shortMonthRe = formatRe(locale_shortMonths),
      shortMonthLookup = formatLookup(locale_shortMonths);

  var formats = {
    "a": formatShortWeekday,
    "A": formatWeekday,
    "b": formatShortMonth,
    "B": formatMonth,
    "c": null,
    "d": formatDayOfMonth,
    "e": formatDayOfMonth,
    "H": formatHour24,
    "I": formatHour12,
    "j": formatDayOfYear,
    "L": formatMilliseconds,
    "m": formatMonthNumber,
    "M": formatMinutes,
    "p": formatPeriod,
    "S": formatSeconds,
    "U": formatWeekNumberSunday,
    "w": formatWeekdayNumber,
    "W": formatWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatYear,
    "Y": formatFullYear,
    "Z": formatZone,
    "%": formatLiteralPercent
  };

  var utcFormats = {
    "a": formatUTCShortWeekday,
    "A": formatUTCWeekday,
    "b": formatUTCShortMonth,
    "B": formatUTCMonth,
    "c": null,
    "d": formatUTCDayOfMonth,
    "e": formatUTCDayOfMonth,
    "H": formatUTCHour24,
    "I": formatUTCHour12,
    "j": formatUTCDayOfYear,
    "L": formatUTCMilliseconds,
    "m": formatUTCMonthNumber,
    "M": formatUTCMinutes,
    "p": formatUTCPeriod,
    "S": formatUTCSeconds,
    "U": formatUTCWeekNumberSunday,
    "w": formatUTCWeekdayNumber,
    "W": formatUTCWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatUTCYear,
    "Y": formatUTCFullYear,
    "Z": formatUTCZone,
    "%": formatLiteralPercent
  };

  var parses = {
    "a": parseShortWeekday,
    "A": parseWeekday,
    "b": parseShortMonth,
    "B": parseMonth,
    "c": parseLocaleDateTime,
    "d": parseDayOfMonth,
    "e": parseDayOfMonth,
    "H": parseHour24,
    "I": parseHour24,
    "j": parseDayOfYear,
    "L": parseMilliseconds,
    "m": parseMonthNumber,
    "M": parseMinutes,
    "p": parsePeriod,
    "S": parseSeconds,
    "U": parseWeekNumberSunday,
    "w": parseWeekdayNumber,
    "W": parseWeekNumberMonday,
    "x": parseLocaleDate,
    "X": parseLocaleTime,
    "y": parseYear,
    "Y": parseFullYear,
    "Z": parseZone,
    "%": parseLiteralPercent
  };

  // These recursive directive definitions must be deferred.
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);

  function newFormat(specifier, formats) {
    return function (date) {
      var string = [],
          i = -1,
          j = 0,
          n = specifier.length,
          c,
          pad,
          format;

      if (!(date instanceof Date)) date = new Date(+date);

      while (++i < n) {
        if (specifier.charCodeAt(i) === 37) {
          string.push(specifier.slice(j, i));
          if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);else pad = c === "e" ? " " : "0";
          if (format = formats[c]) c = format(date, pad);
          string.push(c);
          j = i + 1;
        }
      }

      string.push(specifier.slice(j, i));
      return string.join("");
    };
  }

  function newParse(specifier, newDate) {
    return function (string) {
      var d = newYear(1900),
          i = parseSpecifier(d, specifier, string += "", 0);
      if (i != string.length) return null;

      // The am-pm flag is 0 for AM, and 1 for PM.
      if ("p" in d) d.H = d.H % 12 + d.p * 12;

      // Convert day-of-week and week-of-year to day-of-year.
      if ("W" in d || "U" in d) {
        if (!("w" in d)) d.w = "W" in d ? 1 : 0;
        var day$$1 = "Z" in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
        d.m = 0;
        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$$1 + 5) % 7 : d.w + d.U * 7 - (day$$1 + 6) % 7;
      }

      // If a time zone is specified, all fields are interpreted as UTC and then
      // offset according to the specified time zone.
      if ("Z" in d) {
        d.H += d.Z / 100 | 0;
        d.M += d.Z % 100;
        return utcDate(d);
      }

      // Otherwise, all fields are in local time.
      return newDate(d);
    };
  }

  function parseSpecifier(d, specifier, string, j) {
    var i = 0,
        n = specifier.length,
        m = string.length,
        c,
        parse;

    while (i < n) {
      if (j >= m) return -1;
      c = specifier.charCodeAt(i++);
      if (c === 37) {
        c = specifier.charAt(i++);
        parse = parses[c in pads ? specifier.charAt(i++) : c];
        if (!parse || (j = parse(d, string, j)) < 0) return -1;
      } else if (c != string.charCodeAt(j++)) {
        return -1;
      }
    }

    return j;
  }

  function parsePeriod(d, string, i) {
    var n = periodRe.exec(string.slice(i));
    return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseShortWeekday(d, string, i) {
    var n = shortWeekdayRe.exec(string.slice(i));
    return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseWeekday(d, string, i) {
    var n = weekdayRe.exec(string.slice(i));
    return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseShortMonth(d, string, i) {
    var n = shortMonthRe.exec(string.slice(i));
    return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseMonth(d, string, i) {
    var n = monthRe.exec(string.slice(i));
    return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseLocaleDateTime(d, string, i) {
    return parseSpecifier(d, locale_dateTime, string, i);
  }

  function parseLocaleDate(d, string, i) {
    return parseSpecifier(d, locale_date, string, i);
  }

  function parseLocaleTime(d, string, i) {
    return parseSpecifier(d, locale_time, string, i);
  }

  function formatShortWeekday(d) {
    return locale_shortWeekdays[d.getDay()];
  }

  function formatWeekday(d) {
    return locale_weekdays[d.getDay()];
  }

  function formatShortMonth(d) {
    return locale_shortMonths[d.getMonth()];
  }

  function formatMonth(d) {
    return locale_months[d.getMonth()];
  }

  function formatPeriod(d) {
    return locale_periods[+(d.getHours() >= 12)];
  }

  function formatUTCShortWeekday(d) {
    return locale_shortWeekdays[d.getUTCDay()];
  }

  function formatUTCWeekday(d) {
    return locale_weekdays[d.getUTCDay()];
  }

  function formatUTCShortMonth(d) {
    return locale_shortMonths[d.getUTCMonth()];
  }

  function formatUTCMonth(d) {
    return locale_months[d.getUTCMonth()];
  }

  function formatUTCPeriod(d) {
    return locale_periods[+(d.getUTCHours() >= 12)];
  }

  return {
    format: function (specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function () {
        return specifier;
      };
      return f;
    },
    parse: function (specifier) {
      var p = newParse(specifier += "", localDate);
      p.toString = function () {
        return specifier;
      };
      return p;
    },
    utcFormat: function (specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function () {
        return specifier;
      };
      return f;
    },
    utcParse: function (specifier) {
      var p = newParse(specifier, utcDate);
      p.toString = function () {
        return specifier;
      };
      return p;
    }
  };
}

var pads = { "-": "", "_": " ", "0": "0" };
var numberRe = /^\s*\d+/;
var percentRe = /^%/;
var requoteRe = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

function pad(value, fill, width) {
  var sign = value < 0 ? "-" : "",
      string = (sign ? -value : value) + "",
      length = string.length;
  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}

function requote(s) {
  return s.replace(requoteRe, "\\$&");
}

function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}

function formatLookup(names) {
  var map = {},
      i = -1,
      n = names.length;
  while (++i < n) map[names[i].toLowerCase()] = i;
  return map;
}

function parseWeekdayNumber(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.w = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.U = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.W = +n[0], i + n[0].length) : -1;
}

function parseFullYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 4));
  return n ? (d.y = +n[0], i + n[0].length) : -1;
}

function parseYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
}

function parseZone(d, string, i) {
  var n = /^(Z)|([+-]\d\d)(?:\:?(\d\d))?/.exec(string.slice(i, i + 6));
  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
}

function parseMonthNumber(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
}

function parseDayOfMonth(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.d = +n[0], i + n[0].length) : -1;
}

function parseDayOfYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
}

function parseHour24(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.H = +n[0], i + n[0].length) : -1;
}

function parseMinutes(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.M = +n[0], i + n[0].length) : -1;
}

function parseSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.S = +n[0], i + n[0].length) : -1;
}

function parseMilliseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.L = +n[0], i + n[0].length) : -1;
}

function parseLiteralPercent(d, string, i) {
  var n = percentRe.exec(string.slice(i, i + 1));
  return n ? i + n[0].length : -1;
}

function formatDayOfMonth(d, p) {
  return pad(d.getDate(), p, 2);
}

function formatHour24(d, p) {
  return pad(d.getHours(), p, 2);
}

function formatHour12(d, p) {
  return pad(d.getHours() % 12 || 12, p, 2);
}

function formatDayOfYear(d, p) {
  return pad(1 + day.count(year(d), d), p, 3);
}

function formatMilliseconds(d, p) {
  return pad(d.getMilliseconds(), p, 3);
}

function formatMonthNumber(d, p) {
  return pad(d.getMonth() + 1, p, 2);
}

function formatMinutes(d, p) {
  return pad(d.getMinutes(), p, 2);
}

function formatSeconds(d, p) {
  return pad(d.getSeconds(), p, 2);
}

function formatWeekNumberSunday(d, p) {
  return pad(sunday.count(year(d), d), p, 2);
}

function formatWeekdayNumber(d) {
  return d.getDay();
}

function formatWeekNumberMonday(d, p) {
  return pad(monday.count(year(d), d), p, 2);
}

function formatYear(d, p) {
  return pad(d.getFullYear() % 100, p, 2);
}

function formatFullYear(d, p) {
  return pad(d.getFullYear() % 10000, p, 4);
}

function formatZone(d) {
  var z = d.getTimezoneOffset();
  return (z > 0 ? "-" : (z *= -1, "+")) + pad(z / 60 | 0, "0", 2) + pad(z % 60, "0", 2);
}

function formatUTCDayOfMonth(d, p) {
  return pad(d.getUTCDate(), p, 2);
}

function formatUTCHour24(d, p) {
  return pad(d.getUTCHours(), p, 2);
}

function formatUTCHour12(d, p) {
  return pad(d.getUTCHours() % 12 || 12, p, 2);
}

function formatUTCDayOfYear(d, p) {
  return pad(1 + utcDay.count(utcYear(d), d), p, 3);
}

function formatUTCMilliseconds(d, p) {
  return pad(d.getUTCMilliseconds(), p, 3);
}

function formatUTCMonthNumber(d, p) {
  return pad(d.getUTCMonth() + 1, p, 2);
}

function formatUTCMinutes(d, p) {
  return pad(d.getUTCMinutes(), p, 2);
}

function formatUTCSeconds(d, p) {
  return pad(d.getUTCSeconds(), p, 2);
}

function formatUTCWeekNumberSunday(d, p) {
  return pad(utcSunday.count(utcYear(d), d), p, 2);
}

function formatUTCWeekdayNumber(d) {
  return d.getUTCDay();
}

function formatUTCWeekNumberMonday(d, p) {
  return pad(utcMonday.count(utcYear(d), d), p, 2);
}

function formatUTCYear(d, p) {
  return pad(d.getUTCFullYear() % 100, p, 2);
}

function formatUTCFullYear(d, p) {
  return pad(d.getUTCFullYear() % 10000, p, 4);
}

function formatUTCZone() {
  return "+0000";
}

function formatLiteralPercent() {
  return "%";
}

var locale$1;


var utcFormat;
var utcParse;

defaultLocale$1({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});

function defaultLocale$1(definition) {
  locale$1 = formatLocale$1(definition);
  utcFormat = locale$1.utcFormat;
  utcParse = locale$1.utcParse;
  return locale$1;
}

var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

function formatIsoNative(date) {
    return date.toISOString();
}

var formatIso = Date.prototype.toISOString ? formatIsoNative : utcFormat(isoSpecifier);

function parseIsoNative(string) {
  var date = new Date(string);
  return isNaN(date) ? null : date;
}

var parseIso = +new Date("2000-01-01T00:00:00.000Z") ? parseIsoNative : utcParse(isoSpecifier);

var colors = function (s) {
  return s.match(/.{6}/g).map(function (x) {
    return "#" + x;
  });
};

colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

colors("393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6");

colors("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9");

var category20 = colors("1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5");

cubehelixLong(cubehelix(300, 0.5, 0.0), cubehelix(-240, 0.5, 1.0));

var warm = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

var cool = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

var rainbow = cubehelix();

function ramp(range) {
  var n = range.length;
  return function (t) {
    return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
  };
}

ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

var constant$10 = function (x) {
  return function constant() {
    return x;
  };
};

function Linear(context) {
  this._context = context;
}

Linear.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    this._point = 0;
  },
  lineEnd: function () {
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function (x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0:
        this._point = 1;this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);break;
      case 1:
        this._point = 2; // proceed
      default:
        this._context.lineTo(x, y);break;
    }
  }
};

var curveLinear = function (context) {
  return new Linear(context);
};

function x$3(p) {
  return p[0];
}

function y$3(p) {
  return p[1];
}

var line = function () {
  var x$$1 = x$3,
      y$$1 = y$3,
      defined = constant$10(true),
      context = null,
      curve = curveLinear,
      output = null;

  function line(data) {
    var i,
        n = data.length,
        d,
        defined0 = false,
        buffer;

    if (context == null) output = curve(buffer = path());

    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) output.lineStart();else output.lineEnd();
      }
      if (defined0) output.point(+x$$1(d, i, data), +y$$1(d, i, data));
    }

    if (buffer) return output = null, buffer + "" || null;
  }

  line.x = function (_) {
    return arguments.length ? (x$$1 = typeof _ === "function" ? _ : constant$10(+_), line) : x$$1;
  };

  line.y = function (_) {
    return arguments.length ? (y$$1 = typeof _ === "function" ? _ : constant$10(+_), line) : y$$1;
  };

  line.defined = function (_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : constant$10(!!_), line) : defined;
  };

  line.curve = function (_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
  };

  line.context = function (_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
  };

  return line;
};

function sign$1(x) {
  return x < 0 ? -1 : 1;
}

// Calculate the slopes of the tangents (Hermite-type interpolation) based on
// the following paper: Steffen, M. 1990. A Simple Method for Monotonic
// Interpolation in One Dimension. Astronomy and Astrophysics, Vol. 239, NO.
// NOV(II), P. 443, 1990.
function slope3(that, x2, y2) {
  var h0 = that._x1 - that._x0,
      h1 = x2 - that._x1,
      s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0),
      s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0),
      p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign$1(s0) + sign$1(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}

// Calculate a one-sided slope.
function slope2(that, t) {
  var h = that._x1 - that._x0;
  return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
}

// According to https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Representations
// "you can express cubic Hermite interpolation in terms of cubic Bézier curves
// with respect to the four values p0, p0 + m0 / 3, p1 - m1 / 3, p1".
function point$5(that, t0, t1) {
  var x0 = that._x0,
      y0 = that._y0,
      x1 = that._x1,
      y1 = that._y1,
      dx = (x1 - x0) / 3;
  that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
}

function MonotoneX(context) {
  this._context = context;
}

MonotoneX.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN;
    this._point = 0;
  },
  lineEnd: function () {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x1, this._y1);break;
      case 3:
        point$5(this, this._t0, slope2(this, this._t0));break;
    }
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function (x, y) {
    var t1 = NaN;

    x = +x, y = +y;
    if (x === this._x1 && y === this._y1) return; // Ignore coincident points.
    switch (this._point) {
      case 0:
        this._point = 1;this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);break;
      case 1:
        this._point = 2;break;
      case 2:
        this._point = 3;point$5(this, slope2(this, t1 = slope3(this, x, y)), t1);break;
      default:
        point$5(this, this._t0, t1 = slope3(this, x, y));break;
    }

    this._x0 = this._x1, this._x1 = x;
    this._y0 = this._y1, this._y1 = y;
    this._t0 = t1;
  }
};

function MonotoneY(context) {
  this._context = new ReflectContext(context);
}

(MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function (x, y) {
  MonotoneX.prototype.point.call(this, y, x);
};

function ReflectContext(context) {
  this._context = context;
}

ReflectContext.prototype = {
  moveTo: function (x, y) {
    this._context.moveTo(y, x);
  },
  closePath: function () {
    this._context.closePath();
  },
  lineTo: function (x, y) {
    this._context.lineTo(y, x);
  },
  bezierCurveTo: function (x1, y1, x2, y2, x, y) {
    this._context.bezierCurveTo(y1, x1, y2, x2, y, x);
  }
};

function monotoneX(context) {
  return new MonotoneX(context);
}

function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}

Transform.prototype = {
  constructor: Transform,
  scale: function (k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function (x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function (point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function (x) {
    return x * this.k + this.x;
  },
  applyY: function (y) {
    return y * this.k + this.y;
  },
  invert: function (location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function (x) {
    return (x - this.x) / this.k;
  },
  invertY: function (y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function (x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function (y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function () {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};

var identity$8 = new Transform(1, 0, 0);

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

















































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var upperReg = /[A-Z]/;

var attrVert = function attrVert(d) {
    return Array.from(d).map(function (d) {
        return d;
    }).reduce(function (acc, d) {
        return [].concat(toConsumableArray(acc), [upperReg.test(d) ? '-' + d.toLowerCase() : d]);
    }, []).join('');
};

var render = function render(node, shape) {
    return Object.keys(shape).forEach(function (d) {
        return node.attr(attrVert(d), shape[d]);
    });
};

var vAtom = function vAtom(_selection) {
    var dataset = _selection.data()[0];
    var textStyle = !dataset.tick ? { dominantBaseline: 'hanging', textAnchor: 'start', fontSize: '.6em', fill: '#000000' } : dataset.tick;
    // const content = ( this.state.x && this.props.label )?this.props.label.toString().split(';').map((c,i)=><tspan key={i} x={this.state.x} y={this.state.y+10*i}>{c}</tspan>):null;
    var atomNode = _selection.append('g').attr('id', function (d) {
        return d.key;
    });
    atomNode.attr('transform', identity$8.translate(dataset.location.x, dataset.location.y));
    render(atomNode.append('path'), dataset.shape);
    if (dataset.tick) {
        render(atomNode.append('text').text(dataset.label), textStyle);
    }
    var tooltip = _selection.append('text').attr('name', 'tooltip');
    render(tooltip, textStyle);
    _selection.node().addEventListener('mouseover', function (e) {

        var label = _selection.data()[0].label;

        if (!dataset.tick && label) {

            tooltip.selectAll('tspan').data(label.toString().split(';')).enter().append('tspan').text(function (t) {
                return t;
            }).attr('x', e.offsetX + 5).attr('y', function (t, i) {
                return e.offsetY + 10 * i;
            });
        }
    });

    _selection.node().addEventListener('mouseout', function (e) {

        tooltip.selectAll('*').remove();
    });

    // _selection.node().addEventListener('click',(e)=>{

    //         clickEvent(_selection.data()[0])

    // })
};

var width$2 = 1000;
var height$2 = 500;

var clickEvent = function clickEvent(d) {
  return console.log(d);
};

var canvasPanel = function canvasPanel(_selection) {

  _selection.append('h2').text(function (d) {
    return d.title;
  });
  // .style('dominant-baseline','hanging')
  // .style('text-anchor','start');

  var g = _selection.append('svg').attr('width', width$2).attr('height', height$2).selectAll('g').data(function (d) {
    return entries(d.data);
  }).enter().append('g').attr('id', function (d) {
    return d.key;
  });

  g.selectAll('g').data(function (d) {
    return d.value;
  }).enter().append('g').each(function (d) {
    select(this).call(vAtom);
  }).on('click', clickEvent);
  //add drag behavior
  var pVline = g.select('#pVline');
  if (!pVline.empty()) {
    var dragged = function dragged(d) {
      console.log(d);
      console.log(undefined);
      // d3.select(this).attr('transform',d3.zoomIdentity.translate(d.location.x,d3.event.y));
    };

    pVline.call(drag().on("drag", dragged));
  }
};

canvasPanel.setClick = function (fn) {
  if (!arguments.length) return clickEvent;
  clickEvent = fn;
  return this;
};

canvasPanel.setHeight = function (data) {
  if (!arguments.length) return height$2;
  height$2 = data;
  return this;
};

canvasPanel.setWidth = function (data) {
  if (!arguments.length) return dataset;
  width$2 = data;
  return this;
};

var keggMap = [{ "name": "CAD, CDG1Z, EIEE50", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2206,841,2959,841,2959,841,2962,841,2966,842,2969,844,2971,846,2974,849,2976,851,2978,854,2979,858,2979,861,2979,861,2979,1517" }, { "name": "SUOX", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "2392,806,2398,806,2398,806,2401,806,2405,807,2408,809,2410,811,2413,814,2415,816,2417,819,2418,823,2418,826,2418,826,2418,881,2418,881,2418,884,2417,888,2415,891,2413,893,2410,896,2408,898,2405,900,2401,901,2398,901,2398,901,2392,901" }, { "name": "BLVRB, BVRB, FLR, HEL-S-10, SDR43U1", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3158,605,3093,605" }, { "name": "GAA, LYAG...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1772,386,1801,386,1801,386,1804,386,1808,387,1811,389,1813,391,1816,394,1818,396,1820,399,1821,403,1821,406,1821,406,1821,469,1821,469,1821,472,1820,476,1818,479,1816,481,1813,484,1811,486,1808,488,1804,489,1801,489,1801,489,1314,489" }, { "name": "GAA, LYAG...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1770,386,1871,386,1871,386,1875,386,1878,384,1882,383,1885,380,1887,378,1890,375,1891,371,1893,368,1893,364,1893,364,1893,301" }, { "name": "HMOX1, HMOX1D, HO-1, HSP32, bK286B10", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3634,886,3634,965" }, { "name": "BLVRA, BLVR, BVR, BVRA...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3634,962,3634,1012" }, { "name": "UGT2B11...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3634,1010,3634,1060" }, { "name": "GUSB, BG, MPS7", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3634,1057,3634,1107" }, { "name": "COX10", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3678,841,3593,841" }, { "name": "COX15, CEMCOX2", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3676,840,3676,899" }, { "name": "MMAB, ATR, CFAP23, cblB, cob", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3547,1246,3547,1199" }, { "name": "PPOX, PPO, V290M, VP", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3443,879,3443,840" }, { "name": "FECH, EPP, FCE", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3442,878,3595,878" }, { "name": "UROD, PCT, UPD", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3305,905,3373,905" }, { "name": "PCYT1A, CCTA, CT, CTA, CTPCT, PCYT1, SMDCRD...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "1919,1040,2039,1040" }, { "name": "CEPT1...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2100,1065,2100,1056,2100,1056,2100,1053,2099,1051,2098,1048,2096,1046,2094,1044,2092,1042,2089,1041,2087,1040,2084,1040,2084,1040,2037,1040" }, { "name": "ST6GALNAC1, HSY11339, SIAT7A, ST6GalNAcI, STYI", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1283,103,1283,209" }, { "name": "B3GNT6, B3Gn-T6, BGnT-6, beta-1,3-Gn-T6, beta3Gn-T6", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1283,103,1283,138,1283,138,1283,141,1284,145,1286,148,1288,150,1291,153,1293,155,1296,157,1300,158,1303,158,1303,158,1338,158" }, { "name": "TMEM5, HP10481, MDDGA10", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1721,29,1791,29" }, { "name": "ST3GAL3, EIEE15, MRT12, SIAT6, ST3GALII, ST3GalIII, ST3N", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1477,159,1477,88" }, { "name": "MGAT5B, GnT-IX, GnT-VB", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1412,90,1412,19" }, { "name": "FUT9, Fuc-TIX...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1477,90,1477,38" }, { "name": "POMT1, LGMD2K, MDDGA1, MDDGB1, MDDGC1, RT...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1354,136,1413,136" }, { "name": "POMGNT2, AGO61, C3orf39, GTDC2, MDDGA8", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1411,136,1493,136" }, { "name": "B3GALNT2, B3GalNAc-T2, MDDGA11", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1489,136,1569,136" }, { "name": "POMK, MDDGA12, MDDGC12, SGK196", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1566,136,1656,136" }, { "name": "FKTN, CMD1X, FCMD, LGMD2M, MDDGA4, MDDGB4, MDDGC4", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1655,137,1655,28" }, { "name": "FKRP, LGMD2I, MDC1C, MDDGA5, MDDGB5, MDDGC5", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1724,29,1654,29" }, { "name": "B4GAT1, B3GN-T1, B3GNT1, B3GNT6, BETA3GNTI, MDDGA13, iGAT, iGNT", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1789,29,1859,29" }, { "name": "LARGE2, GYLTL1B, PP5656...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1857,29,1927,29" }, { "name": "LARGE2, GYLTL1B, PP5656...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1924,29,1994,29" }, { "name": "POMGNT1, GNTI.2, GnT_I.2, LGMD2O, MEB, MGAT1.2, RP76, gnT-I.2", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1412,137,1412,88" }, { "name": "B4GALT1, B4GAL-T1, CDG2D, GGTB2, GT1, GTB, beta4Gal-T1...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1411,89,1478,89" }, { "name": "B3GAT2, GLCATS...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1476,89,1533,89" }, { "name": "CHST10, HNK-1ST, HNK1ST", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1532,89,1589,89" }, { "name": "B4GALT1, B4GAL-T1, CDG2D, GGTB2, GT1, GTB, beta4Gal-T1...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1411,20,1514,20" }, { "name": "ST3GAL3, EIEE15, MRT12, SIAT6, ST3GALII, ST3GalIII, ST3N", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1513,73,1513,19" }, { "name": "B3GAT2, GLCATS...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1512,20,1567,20" }, { "name": "CHST10, HNK-1ST, HNK1ST", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1565,20,1620,20" }, { "name": "GCNT3, C2/4GnT, C24GNT, C2GNT2, C2GNTM, GNTM", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1335,158,1413,158" }, { "name": "ISPD, MDDGA7, MDDGC7, Nip, hCG_1745121", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "2170,585,2228,585" }, { "name": "A4GALT, A14GALT, A4GALT1, Gb3S, P(k), P1, P1PK, PK", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "520,155,520,105" }, { "name": "B3GALNT1, B3GALT3, GLCT3, GLOB, Gb4Cer, P, P1, beta3Gal-T3, galT3", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "465,106,521,106" }, { "name": "A4GALT, A14GALT, A4GALT1, Gb3S, P(k), P1, P1PK, PK", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "412,106,468,106" }, { "name": "A4GALT, A14GALT, A4GALT1, Gb3S, P(k), P1, P1PK, PK", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "252,264,286,264,286,264,289,264,291,265,294,266,296,268,298,270,300,272,301,275,302,277,302,280,302,280,302,297" }, { "name": "B3GALNT1, B3GALT3, GLCT3, GLOB, Gb4Cer, P, P1, beta3Gal-T3, galT3", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "301,296,330,296,330,296,333,296,335,297,338,298,340,300,342,302,344,304,345,307,346,309,346,312,346,312,346,331" }, { "name": "GALT", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1677,331,1677,320,1677,320,1677,317,1676,315,1675,312,1673,310,1671,308,1669,306,1666,305,1664,304,1661,304,1661,304,1514,304,1514,304,1511,304,1509,303,1506,302,1504,300,1502,298,1500,296,1499,293,1498,291,1498,288,1498,288,1498,283,1498,283,1498,280,1499,278,1500,275,1502,273,1504,271,1506,269,1509,268,1511,267,1514,267,1514,267,1772,267" }, { "name": "GALT", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1498,313,1498,283,1498,283,1498,280,1497,278,1496,275,1494,273,1492,271,1490,269,1487,268,1485,267,1482,267,1482,267,1469,267,1469,267,1466,267,1464,268,1461,269,1459,271,1457,273,1455,275,1454,278,1453,280,1453,283,1453,283,1453,291" }, { "name": "GYG1, GSD15, GYG...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1543,353,1536,353,1536,353,1534,353,1531,352,1529,351,1527,349,1526,348,1524,346,1523,344,1522,341,1522,339,1522,339,1521,281,1521,281,1521,279,1522,276,1523,274,1525,272,1526,271,1528,269,1530,268,1533,267,1535,267,1535,267,1771,267" }, { "name": "GALE, SDR1E1", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1497,313,1751,313,1751,313,1754,313,1758,312,1761,310,1763,308,1766,305,1768,303,1770,300,1771,296,1771,293,1771,293,1771,266" }, { "name": "AMY1A, AMY1...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1636,219,1541,219" }, { "name": "HEXA, TSD...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1104,295,1104,336" }, { "name": "FUT8", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "982,230,1054,230" }, { "name": "HEXDC", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1103,230,1156,230" }, { "name": "ST3GAL3, EIEE15, MRT12, SIAT6, ST3GALII, ST3GalIII, ST3N", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "932,357,984,357" }, { "name": "B4GALNT3...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "982,327,991,327,991,327,993,327,996,328,998,329,1000,331,1001,332,1003,334,1004,336,1005,339,1005,341,1005,341,1005,358" }, { "name": "CHST8, GALNAC4ST1, GalNAc4ST, PSS3...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1005,356,1005,408" }, { "name": "IDUA, IDA, MPS1", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1273,583,1273,540" }, { "name": "IDS, MPS2, SIDS", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1273,543,1273,473" }, { "name": "DPM3, CDG1O...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "781,333,781,172,781,172,781,169,782,167,783,164,785,162,787,160,789,158,792,157,794,156,797,156,797,156,1214,156,1214,156,1217,156,1219,157,1222,158,1224,160,1226,162,1228,164,1229,167,1230,169,1230,172,1230,172,1230,588,1230,588,1230,591,1231,593,1232,596,1234,598,1236,600,1238,602,1241,603,1243,604,1246,604,1246,604,1348,604" }, { "name": "DPM3, CDG1O...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "727,99,761,99,761,99,764,99,768,100,771,102,773,104,776,107,778,109,780,112,781,116,781,119,781,119,781,380" }, { "name": "ALG1, CDG1K, HMAT1, HMT-1, HMT1, MT-1, Mat-1, hMat-1", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1348,604,1246,604,1246,604,1243,604,1241,603,1238,602,1236,600,1234,598,1232,596,1231,593,1230,591,1230,588,1230,588,1230,172,1230,172,1230,169,1229,167,1228,164,1226,162,1224,160,1222,158,1219,157,1217,156,1214,156,1214,156,848,156,848,156,845,156,843,157,840,158,838,160,836,162,834,164,833,167,832,169,832,172,832,172,832,182" }, { "name": "ALG1, CDG1K, HMAT1, HMT-1, HMT1, MT-1, Mat-1, hMat-1", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,142,832,182" }, { "name": "SRR, ILV1, ISO1", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2286,1208,2286,1269" }, { "name": "LIPT2", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "692,1384,748,1384" }, { "name": "LIAS, HGCLAS, HUSSY-01, LAS, LIP1, LS, PDHLD", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "747,1383,747,1404,747,1404,747,1407,746,1411,744,1414,742,1416,739,1419,737,1421,734,1423,730,1424,727,1424,727,1424,692,1424" }, { "name": "LIPT1, LIPT1D", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "809,1384,746,1384" }, { "name": "DHCR24, DCE, Nbla03646, SELADIN1, seladin-1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "326,1863,385,1863" }, { "name": "DAO, DAAO, DAMOX, OXDA", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "3362,1528,3377,1528,3377,1528,3380,1528,3384,1529,3387,1531,3389,1533,3392,1536,3394,1538,3396,1541,3397,1545,3397,1548,3397,1548,3397,1598" }, { "name": "GCLC, GCL, GCS, GLCL, GLCLC...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2565,1319,2497,1319" }, { "name": "HK1, HK, HK1-ta, HK1-tb, HK1-tc, HKD, HKI, HMSNR, HXK1, hexokinase...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1493,669,1532,669" }, { "name": "CHIT1, CHI3, CHIT, CHITD...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1365,748,1433,748" }, { "name": "HEXA, TSD...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1432,747,1432,778" }, { "name": "NAGK, GNK, HSA242910", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1431,777,1501,777" }, { "name": "PGM3, AGM1, IMD23, PAGM, PGM_3", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1500,776,1500,785,1500,785,1500,787,1501,790,1502,792,1504,794,1505,795,1507,797,1509,798,1512,799,1514,799,1514,799,1532,799" }, { "name": "DLD, DLDD, DLDH, E3, GCSL, LAD, PHE3...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2481,1211,2481,1195,2481,1195,2481,1191,2483,1188,2484,1184,2487,1181,2489,1179,2492,1176,2496,1175,2499,1173,2503,1173,2503,1173,2864,1173,2864,1173,2868,1173,2871,1175,2875,1176,2878,1179,2880,1181,2883,1184,2884,1188,2886,1191,2886,1195,2886,1195,2886,1494,2886,1494,2886,1498,2888,1501,2889,1505,2892,1508,2894,1510,2897,1513,2901,1514,2904,1516,2908,1516,2908,1516,2919,1516" }, { "name": "AOC1, ABP, ABP1, DAO, DAO1, KAO", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3004,1667,3004,1599,3004,1599,3004,1596,3005,1592,3007,1589,3009,1587,3012,1584,3014,1582,3017,1580,3021,1579,3024,1579,3024,1579,3235,1579" }, { "name": "SMS, MRSR, SPMSY, SRS, SpS...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3192,1943,3092,1943" }, { "name": "ALDH2, ALDH-E2, ALDHI, ALDM...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3004,1665,3004,2013,3004,2013,3004,2016,3003,2020,3001,2023,2999,2025,2996,2028,2994,2030,2991,2032,2987,2033,2984,2033,2984,2033,2591,2033" }, { "name": "GAD1, CPSQ1, GAD, SCP...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2592,1828,2592,2034" }, { "name": "BPGM, DPGM", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1721,832,1721,832,1721,832,1716,833,1711,834,1707,836,1702,840,1699,843,1695,848,1693,852,1692,857,1691,862,1691,862,1691,873" }, { "name": "BPGM, DPGM", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1721,912,1721,912,1721,912,1716,911,1711,910,1707,908,1702,904,1699,901,1695,896,1693,892,1692,887,1691,882,1691,882,1691,872" }, { "name": "MINPP1, HIPER1, MINPP2, MIPP", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1721,1010,1721,1010,1721,1010,1716,1009,1711,1008,1707,1006,1702,1002,1699,999,1695,994,1693,990,1692,985,1691,980,1691,980,1691,872" }, { "name": "NFS1, HUSSY-08, IscS, NIFS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "2558,925,3304,925,3304,925,3307,925,3311,924,3314,922,3316,920,3319,917,3321,915,3323,912,3324,908,3324,905,3324,905,3324,301,3324,301,3324,298,3325,294,3327,291,3329,289,3332,286,3334,284,3337,282,3341,281,3344,281,3344,281,3379,281" }, { "name": "NFS1, HUSSY-08, IscS, NIFS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3285,281,3384,281" }, { "name": "OLAH, AURA1, SAST, THEDC1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "710,1348,710,1435" }, { "name": "OLAH, AURA1, SAST, THEDC1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "771,1348,771,1435" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,1348,832,1435" }, { "name": "OLAH, AURA1, SAST, THEDC1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "649,1348,649,1435" }, { "name": "LIAS, HGCLAS, HUSSY-01, LAS, LIP1, LS, PDHLD", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "693,1384,669,1384,669,1384,666,1384,662,1383,659,1381,657,1379,654,1376,652,1374,650,1371,649,1367,649,1364,649,1364,649,1348" }, { "name": "LDHAL6A, LDH6A...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1719,1209,1976,1209" }, { "name": "CYP3A7-CYP3A51P, CYP3A7-3AP1, CYP3A7-CYP3AP1, CYP3A7.1L...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "283,826,334,826" }, { "name": "CYP3A7-CYP3A51P, CYP3A7-3AP1, CYP3A7-CYP3AP1, CYP3A7.1L...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "331,826,382,826" }, { "name": "PRDX6, 1-Cys, AOP2, HEL-S-128m, NSGPx, PRX, aiPLA2, p29", "fgcolor": "#F06292", "bgcolor": "#FFFFFF", "type": "line", "coords": "3455,622,3455,690" }, { "name": "NTPCR, C1orf57, HCR-NTPase", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3329,77,3391,77" }, { "name": "AK7, AK_7...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3389,77,3477,77" }, { "name": "ALPI, IAP...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3330,24,3330,78" }, { "name": "TPK1, HTPK1, PP20, THMD5", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3390,78,3390,41,3390,41,3390,38,3389,36,3388,33,3386,31,3384,29,3382,27,3379,26,3377,25,3374,25,3374,25,3329,25" }, { "name": "FOLH1, FGCP, FOLH, GCP2, GCPII, NAALAD1, NAALAdase, PSM, PSMA, mGCP...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2030,1813,2030,1926" }, { "name": "FOLH1, FGCP, FOLH, GCP2, GCPII, NAALAD1, NAALAdase, PSM, PSMA, mGCP...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2030,1745,2030,1816" }, { "name": "NAT8L, CML3, NACED, NAT8-LIKE...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2030,1508,2030,1748" }, { "name": "RIMKLB, FAM80B, NAAGS, NAAGS-I", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1784,1473,1843,1473" }, { "name": "BCKDHA, BCKDE1A, MSU, MSUD1, OVD1A...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2429,1442,2720,1442" }, { "name": "ETNPPL, AGXT2L1", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "857,627,843,627,843,627,840,627,838,628,835,629,833,631,831,633,829,635,828,638,827,640,827,643,827,643,827,931,827,931,827,934,828,936,829,939,831,941,833,943,835,945,838,946,840,947,843,947,843,947,1877,947,1877,947,1880,947,1882,948,1885,949,1887,951,1889,953,1891,955,1892,958,1893,960,1893,963,1893,963,1893,1138,1893,1138,1893,1141,1892,1143,1891,1146,1889,1148,1887,1150,1885,1152,1882,1153,1880,1154,1877,1154,1877,1154,1866,1154" }, { "name": "PHYKPL, AGXT2L2, PHLU", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2357,1411,2289,1411" }, { "name": "HYKK, AGPHD1", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2433,1411,2354,1411" }, { "name": "ABAT, GABA-AT, GABAT, NPD009", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1570,2033,2593,2033" }, { "name": "DCTPP1, CDA03, RS21C6, XTP3TPA", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2270,580,2270,561,2270,561,2270,558,2271,554,2273,551,2275,549,2278,546,2280,544,2283,542,2287,541,2290,541,2290,541,2408,541,2408,541,2411,541,2415,542,2418,544,2420,546,2423,549,2425,551,2427,554,2428,558,2428,561,2428,561,2428,580" }, { "name": "PTS, PTPS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3213,351,3213,329,3213,329,3213,326,3214,322,3216,319,3218,317,3221,314,3223,312,3226,310,3230,309,3233,309,3233,309,3257,309" }, { "name": "ALDH7A1, ATQ1, EPD, PDE", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2666,1088,2619,1088" }, { "name": "CHDH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2664,1087,2664,1157" }, { "name": "AGL, GDE...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1542,290,1661,290,1661,290,1664,290,1666,291,1669,292,1671,294,1673,296,1675,298,1676,301,1677,303,1677,306,1677,306,1677,331" }, { "name": "GMPPB, MDDGA14, MDDGB14, MDDGC14...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1346,603,1462,603" }, { "name": "AKR1B1, ADR, ALDR1, ALR2, AR...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1381,480,1381,289" }, { "name": "PFKL, ATP-PFK, PFK-B, PFK-L...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1381,652,1381,582" }, { "name": "C03785", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1381", "y": "649", "width": "14", "height": "14" }, { "name": "XYLT1, DBQD2, PXYLT1, XT-I, XT1, XTI, XYLTI, xylT-I...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1355,196,1355,193,1355,193,1355,190,1356,187,1358,184,1360,182,1362,180,1364,178,1367,176,1370,175,1373,175,1373,175,1846,175,1846,175,1849,175,1852,176,1855,178,1857,180,1859,182,1861,184,1863,187,1864,190,1864,193,1864,193,1864,321" }, { "name": "XYLT1, DBQD2, PXYLT1, XT-I, XT1, XTI, XYLTI, xylT-I...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1355,134,1355,199" }, { "name": "ABAT, GABA-AT, GABAT, NPD009", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "1771,1425,1771,813,1771,813,1771,810,1772,806,1774,803,1776,801,1779,798,1781,796,1784,794,1788,793,1791,793,1791,793,2353,793,2353,793,2356,793,2360,792,2363,790,2365,788,2368,785,2370,783,2372,780,2373,776,2373,773,2373,773,2373,523,2373,523,2373,520,2374,516,2376,513,2378,511,2381,508,2383,506,2386,504,2390,503,2393,503,2393,503,2740,503" }, { "name": "CYP24A1, CP24, CYP24, HCAI, HCINF1, P450-CC24", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "847,1634,881,1634" }, { "name": "CYP24A1, CP24, CYP24, HCAI, HCINF1, P450-CC24", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "799,1635,799,1632,799,1632,799,1629,800,1625,802,1622,804,1620,807,1617,809,1615,812,1613,816,1612,819,1612,819,1612,880,1612" }, { "name": "MOCS1, MIG11, MOCOD, MOCODA", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3099,139,3044,139" }, { "name": "MOCS1, MIG11, MOCOD, MOCODA", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3045,138,3045,193" }, { "name": "ALG11, CDG1P, GT8", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,315,832,361" }, { "name": "HMGCS1, HMGCS...", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "1719,1330,1753,1330,1753,1330,1756,1330,1759,1329,1762,1327,1764,1325,1766,1323,1768,1321,1770,1318,1771,1315,1771,1312,1771,1312,1771,965,1771,965,1771,962,1772,959,1774,956,1776,954,1778,952,1780,950,1783,948,1786,947,1789,947,1789,947,2232,947,2232,947,2235,947,2238,948,2241,950,2243,952,2245,954,2247,956,2249,959,2250,962,2250,965,2250,965,2250,1359" }, { "name": "HMGCS1, HMGCS...", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "2250,1368,2250,965,2250,965,2250,962,2249,959,2247,956,2245,954,2243,952,2241,950,2238,948,2235,947,2232,947,2232,947,981,947,981,947,978,947,975,948,972,950,970,952,968,954,966,956,964,959,963,962,963,965,963,965,963,1002,963,1002,963,1005,964,1008,966,1011,968,1013,970,1015,972,1017,975,1019,978,1020,981,1020,981,1020,992,1020" }, { "name": "SRM, PAPT, SPDSY, SPS1, SRML1", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3191,1945,3191,1665,3191,1665,3191,1662,3190,1658,3188,1655,3186,1653,3183,1650,3181,1648,3178,1646,3174,1645,3171,1645,3171,1645,2940,1645" }, { "name": "SRM, PAPT, SPDSY, SPS1, SRML1", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3108,1714,3171,1714,3171,1714,3174,1714,3178,1713,3181,1711,3183,1709,3186,1706,3188,1704,3190,1701,3191,1697,3191,1694,3191,1694,3191,1665,3191,1665,3191,1662,3190,1658,3188,1655,3186,1653,3183,1650,3181,1648,3178,1646,3174,1645,3171,1645,3171,1645,2939,1645" }, { "name": "SRM, PAPT, SPDSY, SPS1, SRML1", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3191,1944,3191,1599,3191,1599,3191,1596,3192,1592,3194,1589,3196,1587,3199,1584,3201,1582,3204,1580,3208,1579,3211,1579,3211,1579,3234,1579" }, { "name": "DGKK...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "959,592,1157,592" }, { "name": "DAO, DAAO, DAMOX, OXDA", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "3304,1527,3304,1599" }, { "name": "BPNT1, HEL20, PIP...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "2442,854,2392,854" }, { "name": "GLS2, GA, GLS, LGA, hLGA...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "2918,1515,2918,1911,2918,1911,2918,1914,2917,1918,2915,1921,2913,1923,2910,1926,2908,1928,2905,1930,2901,1931,2898,1931,2898,1931,2676,1931" }, { "name": "B4GALT1, B4GAL-T1, CDG2D, GGTB2, GT1, GTB, beta4Gal-T1...", "fgcolor": "#AAA9EC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1498,312,1498,385" }, { "name": "GLB1, EBP, ELNR1, MPS4B...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1381,289,1381,364,1381,364,1381,367,1382,371,1384,374,1386,376,1389,379,1391,381,1394,383,1398,384,1401,384,1401,384,1499,384" }, { "name": "GLB1, EBP, ELNR1, MPS4B...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1588,439,1454,439,1454,439,1452,439,1449,438,1447,437,1445,435,1444,434,1442,432,1441,430,1440,427,1440,425,1440,425,1440,398,1440,398,1440,396,1441,393,1442,391,1444,389,1445,388,1447,386,1449,385,1452,384,1454,384,1454,384,1480,384" }, { "name": "GLB1, EBP, ELNR1, MPS4B", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1204,192,1214,192,1214,192,1217,192,1219,193,1222,194,1224,196,1226,198,1228,200,1229,203,1230,205,1230,208,1230,208,1230,274,1230,274,1230,277,1231,279,1232,282,1234,284,1236,286,1238,288,1241,289,1243,290,1246,290,1246,290,1381,290" }, { "name": "GLB1, EBP, ELNR1, MPS4B", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1162,192,1260,192" }, { "name": "FAH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2164,1368,2164,1360,2164,1360,2164,1357,2165,1353,2167,1350,2169,1348,2172,1345,2174,1343,2177,1341,2181,1340,2184,1340,2184,1340,2865,1340,2865,1340,2868,1340,2872,1339,2875,1337,2877,1335,2880,1332,2882,1330,2884,1327,2885,1323,2885,1320,2885,1320,2885,784,2885,784,2885,781,2884,777,2882,774,2880,772,2877,769,2875,767,2872,765,2868,764,2865,764,2865,764,2817,764" }, { "name": "FAH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1518,1705,1545,1720,1545,1720,1548,1722,1552,1723,1556,1725,1560,1726,1565,1727,1570,1729,1574,1729,1578,1730,1582,1730,1582,1730,2865,1730,2865,1730,2868,1730,2872,1729,2875,1727,2877,1725,2880,1722,2882,1720,2884,1717,2885,1713,2885,1710,2885,1710,2885,784,2885,784,2885,781,2884,777,2882,774,2880,772,2877,769,2875,767,2872,765,2868,764,2865,764,2865,764,2821,764" }, { "name": "ADO, C10orf22", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2619,762,2619,819" }, { "name": "CBSL...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2286,1210,2286,1200,2286,1200,2286,1195,2288,1191,2290,1187,2293,1183,2297,1179,2301,1176,2305,1174,2309,1172,2314,1172,2314,1172,2652,1172,2652,1172,2657,1172,2661,1174,2665,1176,2669,1179,2673,1183,2676,1187,2678,1191,2680,1195,2680,1200,2680,1200,2680,1401,2680,1401,2680,1406,2678,1410,2676,1414,2673,1418,2669,1422,2665,1425,2661,1427,2657,1429,2652,1429,2652,1429,2647,1429" }, { "name": "CBSL...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2645,1429,2658,1429,2658,1429,2661,1429,2665,1430,2668,1432,2670,1434,2673,1437,2675,1439,2677,1442,2678,1446,2678,1449,2678,1449,2678,1489,2678,1489,2678,1492,2677,1496,2675,1499,2673,1501,2670,1504,2668,1506,2665,1508,2661,1509,2658,1509,2658,1509,2645,1509" }, { "name": "ALAD, ALADH, PBGS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3142,939,3142,861,3142,861,3142,858,3143,854,3145,851,3147,849,3150,846,3152,844,3155,842,3159,841,3162,841,3162,841,3227,841" }, { "name": "HSD11B1, 11-DH, 11-beta-HSD1, CORTRD2, HDL, HSD11, HSD11B, HSD11L, SDR26C1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "552,1844,552,1880" }, { "name": "TYRP1, CAS2, CATB, GP75, OCA3, TRP, TRP1, TYRP, b-PROTEIN", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2904,449,2969,449" }, { "name": "HPD, 4-HPPD, 4HPPD, GLOD3, HPPDASE, PPD", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2372,988,2495,988,2495,988,2498,988,2502,987,2505,985,2507,983,2510,980,2512,978,2514,975,2515,971,2515,968,2515,968,2515,763" }, { "name": "ALDH6A1, MMSADHA, MMSDH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2076,1425,2076,1313" }, { "name": "HIBADH, NS5ATP1...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2076,1314,2076,1239" }, { "name": "HIBCH, HIBYLCOAH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2075,1240,2151,1240" }, { "name": "ECHS1, ECHS1D, SCEH...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2149,1240,2228,1240" }, { "name": "ACAD8, ACAD-8, ARC42...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2227,1240,2395,1240" }, { "name": "DBT, BCATE2, BCKAD-E2, BCKADE2, BCOADC-E2, E2, E2B", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2392,1240,2565,1240" }, { "name": "TKFC, DAK, NET45", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1627,717,1627,546,1627,546,1627,543,1626,539,1624,536,1622,534,1619,531,1617,529,1614,527,1610,526,1607,526,1607,526,1460,526" }, { "name": "HSD3B1, 3BETAHSD, HSD3B, HSDB3, HSDB3A, I, SDR11E1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "552,1770,552,1764,552,1764,552,1761,553,1759,554,1756,556,1754,558,1752,560,1750,563,1749,565,1748,568,1748,568,1748,664,1748,664,1748,667,1748,669,1747,672,1746,674,1744,676,1742,678,1740,679,1737,680,1735,680,1732,680,1732,680,1729" }, { "name": "AGL, GDE...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1893,303,1893,204,1893,204,1893,201,1892,198,1890,195,1888,193,1886,191,1884,189,1881,187,1878,186,1875,186,1875,186,1652,186,1652,186,1649,186,1646,187,1643,189,1641,191,1639,193,1637,195,1635,198,1634,201,1634,204,1634,204,1634,220" }, { "name": "HMGCR, LDLCQ3", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "852,1452,2230,1452,2230,1452,2233,1452,2237,1451,2240,1449,2242,1447,2245,1444,2247,1442,2249,1439,2250,1435,2250,1432,2250,1432,2250,1366" }, { "name": "SI...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1587,440,1587,247" }, { "name": "MGAM, MG, MGA...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1541,290,1567,290,1567,290,1570,290,1574,291,1577,293,1579,295,1582,298,1584,300,1586,303,1587,307,1587,310,1587,310,1587,440" }, { "name": "GALT...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1772,267,1697,267,1697,267,1694,267,1690,268,1687,270,1685,272,1682,275,1680,277,1678,280,1677,284,1677,287,1677,287,1677,332" }, { "name": "ALAS1, ALAS, ALAS-H, ALAS3, ALASH, MIG4...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "2480,1209,2528,1209,2528,1209,2531,1209,2535,1208,2538,1206,2540,1204,2543,1201,2545,1199,2547,1196,2548,1192,2548,1189,2548,1189,2547,958,2547,958,2547,955,2548,951,2550,948,2552,946,2555,943,2557,941,2560,939,2564,938,2567,938,2567,938,3143,938" }, { "name": "HSD17B4, DBP, MFE-2, MPF-2, PRLTS1, SDR8C1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "441,1944,441,1984" }, { "name": "GATM, AGAT, AT, CCDS3", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2592,2032,2592,2089,2592,2089,2592,2092,2593,2096,2595,2099,2597,2101,2600,2104,2602,2106,2605,2108,2609,2109,2612,2109,2612,2109,3075,2109" }, { "name": "CDIPT, PIS, PIS1", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1409,889,1409,899,1409,899,1409,901,1408,903,1407,905,1406,906,1404,908,1403,909,1401,910,1399,911,1397,911,1397,911,1235,911,1235,911,1233,911,1231,910,1229,909,1228,908,1226,906,1225,905,1224,903,1223,901,1223,899,1223,899,1223,673,1223,673,1223,671,1224,669,1225,667,1226,666,1228,664,1229,663,1231,662,1233,661,1235,661,1235,661,1242,661" }, { "name": "CDIPT, PIS, PIS1", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1155,661,1242,661" }, { "name": "ACO1, ACONS, HEL60, IREB1, IREBP, IREBP1, IRP1...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1914,1659,1914,1640,1914,1640,1912,1623,1907,1604,1900,1585,1891,1566,1879,1548,1867,1531,1853,1516,1839,1503,1824,1494,1824,1494,1785,1473" }, { "name": "XYLB", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1918,466,1918,527" }, { "name": "ALDH3A1, ALDH3, ALDHIII...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2822,656,2822,666,2822,666,2822,669,2823,673,2825,676,2827,678,2830,681,2832,683,2835,685,2839,686,2842,686,2842,686,2867,686" }, { "name": "COMT, HEL-S-98n", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2866,686,2889,686,2889,686,2892,686,2896,685,2899,683,2901,681,2904,678,2906,676,2908,673,2909,669,2909,666,2909,666,2909,656" }, { "name": "IL4I1, FIG1, LAAO, LAO", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2856,987,2856,1048" }, { "name": "IDO2, INDOL1...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2777,988,2857,988" }, { "name": "TPH2, ADHD7, NTPH...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2786,1028,2836,1028,2836,1028,2839,1028,2843,1027,2846,1025,2848,1023,2851,1020,2853,1018,2855,1015,2856,1011,2856,1008,2856,1008,2856,987" }, { "name": "NT5C1B-RDH14...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2902,190,2902,270" }, { "name": "PNP, NP, PRO1837, PUNP", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2902,268,2902,348" }, { "name": "HPRT1, HGPRT, HPRT...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2903,347,2896,347,2896,347,2893,347,2889,346,2886,344,2884,342,2881,339,2879,337,2877,334,2876,330,2876,327,2876,327,2876,211,2876,211,2876,208,2877,204,2879,201,2881,199,2884,196,2886,194,2889,192,2893,191,2896,191,2896,191,2903,191" }, { "name": "NME6, IPIA-ALPHA, NDK_6, NM23-H6...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2501,191,2576,191" }, { "name": "ALLC, ALC", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2925,1234,2925,1297,2925,1297,2925,1300,2924,1304,2922,1307,2920,1309,2917,1312,2915,1314,2912,1316,2908,1317,2905,1317,2905,1317,2810,1317" }, { "name": "ALLC, ALC", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2925,1062,2925,1434,2925,1434,2925,1437,2926,1440,2928,1443,2930,1446,2933,1448,2935,1450,2938,1452,2942,1453,2945,1453,2945,1453,3309,1453,3309,1453,3312,1453,3316,1454,3319,1456,3321,1458,3324,1461,3326,1463,3328,1466,3329,1470,3329,1473,3329,1473,3329,1485" }, { "name": "GAMT, CCDS2, HEL-S-20, PIG2, TP53I2", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3396,1415,3503,1415" }, { "name": "CYP7A1, CP7A, CYP7, CYPVII", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "615,1602,558,1602" }, { "name": "GCH1, DYT14, DYT5, DYT5a, GCH, GTP-CH-1, GTPCH1, HPABH4B", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3044,191,3214,191" }, { "name": "POLR3F, RPC39, RPC6...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2503,191,2470,191,2470,191,2467,191,2463,192,2460,194,2458,196,2455,199,2453,201,2451,204,2450,208,2450,211,2450,211,2450,331" }, { "name": "POLR3F, RPC39, RPC6...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2449,330,3087,330,3087,330,3090,330,3094,329,3097,327,3099,325,3102,322,3104,320,3106,317,3107,313,3107,310,3107,310,3107,211,3107,211,3107,208,3106,204,3104,201,3102,199,3099,196,3097,194,3094,192,3090,191,3087,191,3087,191,3044,191" }, { "name": "POLD3, P66, P68, PPP1R128...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2270,578,2270,586,2270,586,2270,589,2271,593,2273,596,2275,598,2278,601,2280,603,2283,605,2287,606,2290,606,2290,606,2407,606" }, { "name": "ENPP1, ARHR2, COLED, M6S1, NPP1, NPPS, PC-1, PCA1, PDNP1...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2427,400,2427,409,2427,409,2427,412,2426,416,2424,419,2422,421,2419,424,2417,426,2414,428,2410,429,2407,429,2407,429,2290,429,2290,429,2287,429,2283,428,2280,426,2278,424,2275,421,2273,419,2271,416,2270,412,2270,409,2270,409,2270,400" }, { "name": "PNP, NP, PRO1837, PUNP", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2502,305,2535,336,2535,336,2537,338,2540,339,2543,341,2547,343,2550,344,2554,345,2557,346,2560,347,2563,347,2563,347,2638,347" }, { "name": "CYP1A2, CP12, P3-450, P450(PA)", "fgcolor": "#F06292", "bgcolor": "#FFFFFF", "type": "line", "coords": "2989,365,3083,365" }, { "name": "PTS, PTPS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3212,351,3257,351" }, { "name": "SPR, SDR38C1", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3257,351,3302,351" }, { "name": "SPR, SDR38C1", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3299,351,3344,351" }, { "name": "QDPR, DHPR, PKU2, SDR33C1", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3343,351,3388,351" }, { "name": "HPRT1, HGPRT, HPRT", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2821,347,2814,347,2814,347,2811,347,2807,346,2804,344,2802,342,2799,339,2797,337,2795,334,2794,330,2794,327,2794,327,2794,211,2794,211,2794,208,2795,204,2797,201,2799,199,2802,196,2804,194,2807,192,2811,191,2814,191,2814,191,2821,191" }, { "name": "PNP, NP, PRO1837, PUNP", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2637,268,2637,348" }, { "name": "AMPD1, MAD, MADA, MMDD...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2761,192,2761,182,2761,182,2761,179,2760,175,2758,172,2756,170,2753,167,2751,165,2748,163,2744,162,2741,162,2741,162,2657,162,2657,162,2654,162,2650,163,2647,165,2645,167,2642,170,2640,172,2638,175,2637,179,2637,182,2637,182,2637,192" }, { "name": "MTHFD1, MTHFC, MTHFD", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1601,1616,1601,1536" }, { "name": "MTHFD1, MTHFC, MTHFD", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1602,1615,1549,1615" }, { "name": "MTHFD1L, FTHFSDC1, MTC1THFS, dJ292B18.2...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1600,1537,1730,1537" }, { "name": "RRM2B, MTDPS8A, MTDPS8B, P53R2...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2575,190,2575,258" }, { "name": "FDFT1, DGPT, ERG9, SQS, SS", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "308,1506,384,1506" }, { "name": "LIPT2", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "692,1424,669,1424,669,1424,666,1424,662,1423,659,1421,657,1419,654,1416,652,1414,650,1411,649,1407,649,1404,649,1404,649,1348" }, { "name": "RRM2B, MTDPS8A, MTDPS8B, P53R2...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "3372,2068,3297,2068" }, { "name": "UAP1, AGX, AGX1, AGX2, SPAG2...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1664,799,1533,799" }, { "name": "PPAT, ATASE, GPAT, PRAT", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2143,120,2143,620" }, { "name": "BTD", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "2244,1681,2244,1944,2244,1944,2244,1947,2245,1951,2247,1954,2249,1956,2252,1959,2254,1961,2257,1963,2261,1964,2264,1964,2264,1964,2909,1964" }, { "name": "BTD", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "2840,2012,2840,1984,2840,1984,2840,1981,2841,1977,2843,1974,2845,1972,2848,1969,2850,1967,2853,1965,2857,1964,2860,1964,2860,1964,2909,1964" }, { "name": "GCLC, GCL, GCS, GLCL, GLCLC...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2592,1829,2637,1829,2637,1829,2640,1829,2642,1830,2645,1831,2647,1833,2649,1835,2651,1837,2652,1840,2653,1842,2653,1845,2653,1845,2653,1979" }, { "name": "GCLC, GCL, GCS, GLCL, GLCLC...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2515,1856,2633,1856,2633,1856,2636,1856,2640,1857,2643,1859,2645,1861,2648,1864,2650,1866,2652,1869,2653,1873,2653,1876,2653,1876,2653,1979" }, { "name": "ANPEP, APN, CD13, GP150, LAP1, P150, PEPN...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2451,1962,2451,1881,2451,1881,2451,1877,2453,1873,2455,1869,2457,1865,2461,1862,2464,1860,2468,1858,2472,1856,2476,1856,2476,1856,2517,1856" }, { "name": "ANPEP, APN, CD13, GP150, LAP1, P150, PEPN...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2451,1980,2451,1229,2451,1229,2451,1226,2452,1222,2454,1219,2456,1217,2459,1214,2461,1212,2464,1210,2468,1209,2471,1209,2471,1209,2482,1209" }, { "name": "GGPS1, GGPPS, GGPPS1", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "309,1505,309,1555" }, { "name": "GGPS1, GGPPS, GGPPS1", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "309,1550,309,1546,309,1546,309,1543,310,1541,311,1538,313,1536,315,1534,317,1532,320,1531,322,1530,325,1530,325,1530,588,1530,588,1530,591,1530,593,1529,596,1528,598,1526,600,1524,602,1522,603,1519,604,1517,604,1514,604,1514,604,1423" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "526,947,526,947,526,947,526,947,527,947,529,947,531,947,534,947,537,947,540,947,544,947,547,947,547,947,1538,947,1538,947,1541,947,1545,948,1548,950,1550,952,1553,955,1555,957,1557,960,1558,964,1558,967,1558,967,1558,1310,1558,1310,1558,1313,1559,1317,1561,1320,1563,1322,1565,1325,1568,1327,1571,1329,1574,1330,1577,1330,1577,1330,1721,1330" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "622,1007,622,968" }, { "name": "ALDOA, ALDA, GSD12, HEL-S-87p...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1677,616,1677,671,1677,671,1677,674,1678,677,1679,680,1680,683,1682,686,1684,689,1686,692,1688,694,1690,696,1690,696,1721,716" }, { "name": "ALDOA, ALDA, GSD12, HEL-S-87p...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1628,717,1663,696,1663,696,1665,694,1668,692,1670,690,1672,687,1673,684,1675,681,1676,678,1677,675,1677,672,1677,672,1677,616" }, { "name": "GAPDH, G3PD, GAPD, HEL-S-162eP...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,715,1720,834" }, { "name": "PGK1, HEL-S-68p, MIG10, PGKA...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,831,1720,913" }, { "name": "PGD, 6PGD", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "2019,438,2019,528" }, { "name": "PGLS, 6PGL, HEL-S-304", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1863,439,2020,439" }, { "name": "AKR1B1, ADR, ALDR1, ALR2, AR...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "2175,404,2237,404" }, { "name": "DCXR, DCR, HCR2, HCRII, KIDCR, P34H, PNTSU, SDR20C1, XR", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1997,404,2094,404" }, { "name": "UGDH, GDH, UDP-GlcDH, UDPGDH, UGD", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1770,267,1825,267" }, { "name": "UGT2B11...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1823,267,1912,267" }, { "name": "AKR1A1, ALDR1, ALR, ARM, DD3, HEL-S-6", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1975,267,2094,267" }, { "name": "CRYL1, GDH, HEL30, lambda-CRY", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "2093,322,2093,266" }, { "name": "GUSB, BG, MPS7...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1909,267,1977,267" }, { "name": "GALK1, GALK, GK1, HEL-S-19", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1455,290,1425,290" }, { "name": "GALT", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1453,289,1453,297,1453,297,1453,300,1454,302,1455,305,1457,307,1459,309,1461,311,1464,312,1466,313,1469,313,1469,313,1499,313" }, { "name": "GBE1, APBD, GBE, GSD4", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1542,289,1542,354" }, { "name": "UXS1, SDR6E1, UGD", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1864,321,1864,287,1864,287,1864,284,1863,280,1861,277,1859,275,1856,272,1854,270,1851,268,1847,267,1844,267,1844,267,1822,267" }, { "name": "AKR1B1, ADR, ALDR1, ALR2, AR...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1917,404,2000,404" }, { "name": "GNPDA1, GNP1, GNPDA, GNPI, GPI, HLN...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1678,526,1551,526,1551,526,1548,526,1544,527,1541,529,1539,531,1536,534,1534,536,1532,539,1531,543,1531,546,1531,546,1531,670" }, { "name": "GNE, DMRV, GLCNE, IBM2, NM, Uae1", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1662,798,1662,862" }, { "name": "GNE, DMRV, GLCNE, IBM2, NM, Uae1", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1662,861,1662,914" }, { "name": "NANS, HEL-S-100, SAS, SEMDCG, SEMDG", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1662,911,1662,990" }, { "name": "NANP, C20orf147, HDHD4, dJ694B14.3", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1662,987,1662,1032" }, { "name": "CMAS, CSS", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1662,1029,1662,1074" }, { "name": "HK1, HK, HK1-ta, HK1-tb, HK1-tc, HKD, HKI, HMSNR, HXK1, hexokinase...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1314,489,1657,489,1657,489,1660,489,1664,490,1667,492,1669,494,1672,497,1674,499,1676,502,1677,506,1677,509,1677,509,1677,528" }, { "name": "KHK", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1315,488,1315,717" }, { "name": "HK1, HK, HK1-ta, HK1-tb, HK1-tc, HKD, HKI, HMSNR, HXK1, hexokinase...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1398,560,1462,560" }, { "name": "PMM1, Sec53...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1461,604,1461,559" }, { "name": "GMDS, GMD, SDR3E1", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1347,602,1347,649" }, { "name": "TSTA3, FX, P35B, SDR4E1", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1347,648,1347,695" }, { "name": "FPGT, GFPP", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1347,694,1347,748" }, { "name": "FUK, 1110046B12Rik", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1347,746,1347,804" }, { "name": "PI4KA, PI4K-ALPHA, PIK4CA, PMGYCHA, pi4K230...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1241,660,1241,717" }, { "name": "GRHPR, GLXR, GLYD, PH2", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1433,1788,1433,1746" }, { "name": "HIBCH, HIBYLCOAH", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1841,1424,1899,1424" }, { "name": "ECHS1, ECHS1D, SCEH...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1897,1424,1976,1424" }, { "name": "MUT, MCM", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1704,1861,1704,1874,1704,1874,1704,1877,1705,1881,1707,1884,1709,1886,1712,1889,1714,1891,1717,1893,1721,1894,1724,1894,1724,1894,2077,1894" }, { "name": "RGN, GNL, HEL-S-41, RC, SMP30", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "2092,267,2168,267" }, { "name": "ALDH6A1, MMSADHA, MMSDH", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,1329,1720,1398,1720,1398,1720,1402,1722,1407,1724,1411,1727,1414,1730,1417,1733,1420,1737,1422,1742,1424,1746,1424,1746,1424,1772,1424" }, { "name": "FAHD1, C16orf36, YISKL", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,1210,1720,1200,1720,1200,1720,1195,1722,1191,1724,1187,1727,1183,1731,1179,1735,1176,1739,1174,1743,1172,1748,1172,1748,1172,2857,1172,2857,1172,2862,1172,2866,1170,2870,1168,2874,1165,2878,1161,2881,1157,2883,1153,2885,1149,2885,1144,2885,1144,2885,1074" }, { "name": "FAHD1, C16orf36, YISKL", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1518,1705,1543,1720,1543,1720,1546,1722,1550,1723,1554,1725,1558,1726,1563,1727,1568,1729,1572,1729,1576,1730,1580,1730,1580,1730,2865,1730,2865,1730,2868,1730,2872,1729,2875,1727,2877,1725,2880,1722,2882,1720,2884,1717,2885,1713,2885,1710,2885,1710,2885,726,2885,726,2885,723,2884,719,2882,716,2880,714,2877,711,2875,709,2872,707,2868,706,2865,706,2865,706,2842,706" }, { "name": "ASS1, ASS, CTLN1", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2029,1509,2115,1509,2115,1509,2118,1509,2122,1508,2125,1506,2127,1504,2130,1501,2132,1499,2134,1496,2135,1492,2135,1489,2135,1489,2135,1360,2135,1360,2135,1357,2136,1353,2138,1350,2140,1348,2143,1345,2145,1343,2148,1341,2152,1340,2155,1340,2155,1340,2538,1340,2538,1340,2542,1340,2546,1340,2551,1340,2556,1340,2560,1340,2565,1340,2570,1340,2574,1340,2578,1340,2578,1340,2980,1340,2980,1340,2984,1340,2988,1340,2993,1340,2998,1339,3002,1339,3007,1339,3012,1339,3016,1338,3020,1338,3020,1338,3015,1338,3015,1338,3019,1337,3023,1337,3027,1335,3031,1334,3036,1332,3040,1330,3044,1328,3048,1326,3051,1324,3051,1324,3088,1298" }, { "name": "ASS1, ASS, CTLN1", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3030,1415,3030,1404,3030,1404,3030,1400,3030,1396,3030,1392,3031,1387,3032,1382,3033,1378,3034,1373,3035,1369,3036,1366,3036,1366,3041,1353,3041,1353,3043,1350,3045,1346,3047,1342,3050,1338,3052,1334,3055,1330,3058,1326,3061,1323,3063,1320,3063,1320,3076,1307,3076,1307,3079,1305,3082,1302,3086,1299,3090,1297,3094,1294,3098,1292,3102,1290,3106,1288,3110,1287,3110,1287,3123,1283,3123,1283,3126,1282,3130,1281,3135,1280,3140,1279,3145,1279,3149,1278,3154,1278,3158,1278,3162,1278,3162,1278,3163,1278" }, { "name": "ALDH5A1, SSADH, SSDH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1571,1799,1571,2034" }, { "name": "PHGDH, 3-PGDH, 3PGDH, HEL-S-113, NLS, NLS1, PDG, PGAD, PGD, PGDH, PHGDHD, SERA", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1719,912,2050,912" }, { "name": "PSAT1, EPIP, NLS2, PSA, PSAT, PSATD", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2048,912,2205,912" }, { "name": "SHMT1, CSHMT, SHMT...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2285,1209,2323,1209,2323,1209,2326,1209,2330,1210,2333,1212,2335,1214,2338,1217,2340,1219,2342,1222,2343,1226,2343,1229,2343,1229,2343,1268" }, { "name": "SHMT1, CSHMT, SHMT...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2287,1209,2484,1209" }, { "name": "AMT, GCE, GCST, GCVT, NKH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2342,1267,2432,1267" }, { "name": "CTH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2646,1432,2646,945,2646,945,2646,942,2645,938,2643,935,2641,933,2638,930,2636,928,2633,926,2629,925,2626,925,2626,925,2560,925" }, { "name": "CTH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2612,1295,2626,1295,2626,1295,2629,1295,2633,1296,2636,1298,2638,1300,2641,1303,2643,1305,2645,1308,2646,1312,2646,1315,2646,1315,2646,1428" }, { "name": "MAT2B, MAT-II, MATIIbeta, Nbla02999, SDR23E1, TGR...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2645,1645,2750,1645" }, { "name": "ADI1, APL1, ARD, Fe-ARD, HMFT1638, MTCBP1, Ni-ARD, SIPL, mtnD", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2645,1778,2713,1778" }, { "name": "APIP, APIP2, CGI-29, CGI29, MMRP19, hAPIP", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2867,1778,2941,1778" }, { "name": "MRI1, M1Pi, MRDI, MTNA, Ypr118w", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2939,1778,3021,1778" }, { "name": "AMD1, ADOMETDC, AMD, SAMDC", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2748,1645,2941,1645" }, { "name": "CDO1, CDO-I", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2561,817,2561,926" }, { "name": "GOT1, AST1, ASTQTL1, GIG18, cAspAT, cCAT...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2466,889,2466,838,2466,838,2466,835,2467,831,2469,828,2471,826,2474,823,2476,821,2479,819,2483,818,2486,818,2486,818,2562,818" }, { "name": "AASS, LKR/SDH, LKRSDH, LORSDH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2290,1410,2290,1654" }, { "name": "PIPOX, LPIPOX", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2336,1446,2336,1384" }, { "name": "GCDH, ACAD5, GCD", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "992,1208,977,1208,977,1208,974,1208,970,1209,967,1211,965,1213,962,1216,960,1218,958,1221,957,1225,957,1228,957,1228,957,1339,957,1339,957,1342,958,1346,960,1349,962,1351,965,1354,967,1356,970,1358,974,1359,977,1359,977,1359,1585,1359" }, { "name": "DLST, DLTS", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1584,1359,1898,1359" }, { "name": "OGDH, AKGDH, E1k, OGDC...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1898,1359,2073,1359,2073,1359,2078,1359,2082,1357,2086,1355,2090,1352,2094,1348,2097,1344,2099,1340,2101,1336,2101,1331,2101,1331,2101,1330" }, { "name": "HOGA1, C10orf65, DHDPS2, DHDPSL, HP3, NPL2", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1728,1615,1754,1615,1754,1615,1757,1615,1761,1616,1764,1618,1766,1620,1769,1623,1771,1625,1773,1628,1774,1632,1774,1635,1774,1635,1774,1780,1774,1780,1774,1783,1775,1787,1777,1790,1779,1792,1782,1795,1784,1797,1787,1799,1791,1800,1794,1800,1794,1800,2112,1800" }, { "name": "GOT1, AST1, ASTQTL1, GIG18, cAspAT, cCAT...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2111,1800,2618,1800" }, { "name": "PYCR2, HLD10, P5CR2...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3074,1743,3074,1801" }, { "name": "P4HA3...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3074,1683,3074,1745" }, { "name": "DNMT1, ADCADN, AIM, CXXC9, DNMT, HSN1E, MCMT, m.HsaI...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2749,1577,2749,1646" }, { "name": "ALDH4A1, ALDH4, P5CD, P5CDh", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2617,1800,3075,1800" }, { "name": "OTC, OCTD", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3031,1414,3031,1418,3031,1418,3033,1435,3039,1451,3047,1467,3058,1482,3071,1496,3086,1508,3101,1517,3117,1524,3134,1527,3134,1527,3159,1529" }, { "name": "OTC, OCTD", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2978,1516,3033,1516,3033,1516,3035,1516,3037,1515,3039,1515,3042,1514,3044,1513,3046,1512,3048,1511,3050,1509,3051,1508,3051,1508,3051,1507,3051,1507,3052,1505,3053,1504,3054,1502,3055,1499,3055,1497,3055,1495,3055,1493,3055,1491,3055,1489,3055,1489,3051,1479,3051,1479,3051,1477,3050,1475,3049,1473,3048,1470,3047,1468,3046,1466,3045,1463,3044,1462,3043,1460,3043,1460,3043,1461,3043,1461,3042,1459,3041,1458,3041,1455,3040,1453,3039,1451,3038,1448,3037,1446,3036,1444,3036,1442,3036,1442,3035,1439" }, { "name": "ASL, ASAL", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3167,1278,3183,1281,3183,1281,3200,1285,3216,1293,3231,1303,3244,1315,3256,1330,3266,1346,3274,1362,3279,1379,3280,1396,3280,1396,3280,1416" }, { "name": "ASL, ASAL", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1519,1705,1544,1720,1544,1720,1547,1722,1551,1723,1555,1725,1559,1726,1564,1727,1569,1729,1573,1729,1577,1730,1581,1730,1581,1730,2865,1730,2865,1730,2868,1730,2872,1729,2875,1727,2877,1725,2880,1722,2882,1720,2884,1717,2885,1713,2885,1710,2885,1710,2885,1382,2885,1382,2885,1379,2886,1375,2888,1372,2890,1370,2893,1367,2895,1365,2898,1363,2902,1362,2905,1362,2905,1362,3209,1362,3209,1362,3212,1362,3216,1361,3219,1359,3221,1357,3224,1354,3226,1352,3228,1349,3229,1345,3229,1342,3229,1342,3229,1322,3229,1322,3229,1319,3228,1315,3226,1311,3225,1307,3222,1303,3220,1300,3217,1297,3215,1294,3212,1292,3212,1292,3208,1290,3208,1290,3205,1288,3201,1287,3197,1285,3193,1283,3188,1282,3183,1280,3179,1279,3175,1279,3171,1278,3171,1278,3160,1277" }, { "name": "ARG1...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3159,1529,3176,1527,3176,1527,3193,1524,3209,1518,3224,1508,3239,1497,3252,1483,3263,1468,3271,1452,3277,1436,3279,1419,3279,1419,3279,1414" }, { "name": "ARG1...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3276,1437,3270,1454,3270,1454,3269,1455,3269,1457,3268,1459,3267,1461,3267,1463,3266,1465,3266,1467,3265,1469,3265,1470,3265,1470,3265,1476,3265,1476,3265,1477,3265,1479,3265,1480,3266,1481,3267,1482,3267,1483,3269,1483,3270,1484,3271,1484,3271,1484,3330,1484" }, { "name": "NOS1, IHPS1, N-NOS, NC-NOS, NOS, bNOS, nNOS...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3030,1415,3280,1415" }, { "name": "GATM, AGAT, AT, CCDS3", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3278,1415,3399,1415" }, { "name": "CKB, B-CK, BCK, CKBB, HEL-211, HEL-S-29...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3502,1414,3502,1474" }, { "name": "DDC, AADC...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2341,1032,2341,1070" }, { "name": "PSPH, PSP, PSPHD", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2204,911,2204,1189,2204,1189,2204,1192,2205,1196,2207,1199,2209,1201,2212,1204,2214,1206,2217,1208,2221,1209,2224,1209,2224,1209,2288,1209" }, { "name": "IL4I1, FIG1, LAAO, LAO...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2453,764,2516,764" }, { "name": "HPD, 4-HPPD, 4HPPD, GLOD3, HPPDASE, PPD", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2591,706,2651,706" }, { "name": "HGD, AKU, HGO", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2650,705,2650,744,2650,744,2650,747,2651,751,2653,754,2655,756,2658,759,2660,761,2663,763,2667,764,2670,764,2670,764,2716,764" }, { "name": "GSTZ1, GSTZ1-1, MAAI, MAI", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2715,764,2821,764" }, { "name": "PNMT, PENT, PNMTase", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2942,579,3002,579" }, { "name": "MAOA, BRNRS, MAO-A...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3062,579,3122,579" }, { "name": "COMT, HEL-S-98n", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3033,638,3115,638" }, { "name": "ALDH3A1, ALDH3, ALDHIII...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3121,578,3121,639" }, { "name": "ADH1A, ADH1...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2943,637,2943,666,2943,666,2943,669,2944,673,2946,676,2948,678,2951,681,2953,683,2956,685,2960,686,2963,686,2963,686,3035,686" }, { "name": "COMT, HEL-S-98n", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3035,686,3122,686" }, { "name": "COMT, HEL-S-98n", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2943,580,2943,574,2943,574,2943,569,2945,565,2947,561,2950,557,2954,553,2958,550,2962,548,2966,546,2971,546,2971,546,3035,546" }, { "name": "COMT, HEL-S-98n", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2822,578,2822,618" }, { "name": "AOC2, DAO2, RAO, SSAO...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2821,579,2889,579,2889,579,2892,579,2896,580,2899,582,2901,584,2904,587,2906,589,2908,592,2909,596,2909,599,2909,599,2909,619" }, { "name": "DBH, DBM", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2821,579,2944,579" }, { "name": "TYR, ATN, CMM8, OCA1, OCA1A, OCAIA, SHEP3", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2592,580,2592,541,2592,541,2592,538,2593,534,2595,531,2597,529,2600,526,2602,524,2605,522,2609,521,2612,521,2612,521,2763,521" }, { "name": "TYR, ATN, CMM8, OCA1, OCA1A, OCAIA, SHEP3", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2705,580,2705,541,2705,541,2705,538,2706,534,2708,531,2710,529,2713,526,2715,524,2718,522,2722,521,2725,521,2725,521,2763,521" }, { "name": "TH, DYT14, DYT5b, TYH...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2706,579,2591,579" }, { "name": "ALDH3A1, ALDH3, ALDHIII...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2942,638,3036,638" }, { "name": "KYNU, KYNUU", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2691,1038,2691,1101" }, { "name": "HAAO, 3-HAO, HAO", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2530,1134,2671,1134,2671,1134,2674,1134,2678,1133,2681,1131,2683,1129,2686,1126,2688,1124,2690,1121,2691,1117,2691,1114,2691,1114,2691,1099" }, { "name": "ALDH2, ALDH-E2, ALDHI, ALDM...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2856,1095,2856,1150" }, { "name": "DDC, AADC", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2855,988,2908,988" }, { "name": "DDC, AADC", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2751,1028,2787,1028" }, { "name": "AANAT, DSPS, SNAT", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2751,1026,2751,1063" }, { "name": "ASMT, ASMTY, HIOMT, HIOMTY", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2751,1061,2751,1100" }, { "name": "MAOA, BRNRS, MAO-A...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2715,1063,2715,1048,2715,1048,2715,1045,2716,1041,2718,1038,2720,1036,2723,1033,2725,1031,2728,1029,2732,1028,2735,1028,2735,1028,2752,1028" }, { "name": "ALDH2, ALDH-E2, ALDHI, ALDM...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2715,1062,2715,1101" }, { "name": "ASNS, ASNSD, TS11", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2141,1551,2050,1551,2050,1551,2047,1551,2043,1550,2040,1548,2038,1546,2035,1543,2033,1541,2031,1538,2030,1534,2030,1531,2030,1531,2030,1508" }, { "name": "ALDH18A1, ADCL3, ARCL3A, GSAS, P5CS, PYCS, SPG9, SPG9A, SPG9B", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3159,1624,3159,1830" }, { "name": "ALDH18A1, ADCL3, ARCL3A, GSAS, P5CS, PYCS, SPG9, SPG9A, SPG9B", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2591,1829,3160,1829" }, { "name": "CPS1, CPSASE1, PHN", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2917,1516,2980,1516" }, { "name": "SAT2, SSAT2...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3232,1579,3366,1579" }, { "name": "MAOA, BRNRS, MAO-A...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3364,1578,3364,1701" }, { "name": "ALDH2, ALDH-E2, ALDHI, ALDM...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3364,1699,3364,2034" }, { "name": "AZIN2, ADC, AZI2, AZIB1, ODC-p, ODC1L, ODCp", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3279,1414,3279,1507" }, { "name": "MTAP, BDMF, DMSFH, DMSMFH, HEL-249, LGMBF, MSAP, c86fus", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3020,1779,3020,1734,3020,1734,3020,1731,3021,1727,3023,1724,3025,1722,3028,1719,3030,1717,3033,1715,3037,1714,3040,1714,3040,1714,3110,1714" }, { "name": "IL4I1, FIG1, LAAO, LAO...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2646,1644,2646,1779" }, { "name": "FTCD, LCHC1", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2592,1109,2592,1830" }, { "name": "AMDHD1, HMFT1272", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2592,1067,2592,1112" }, { "name": "UROC1, HMFN0320, UROCD", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2529,1068,2594,1068" }, { "name": "BHMT2...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2646,1508,2646,1646" }, { "name": "SDS, SDH...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2480,1295,2614,1295" }, { "name": "AADAT, KAT2, KATII, KYAT2", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2101,1329,2101,1412" }, { "name": "IL4I1, FIG1, LAAO, LAO...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2719,1440,2719,1529" }, { "name": "BCAT1, BCATC, BCT1, ECA39, MECA39, PNAS121, PP18...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2764,1413,2764,1470" }, { "name": "BCAT1, BCATC, BCT1, ECA39, MECA39, PNAS121, PP18...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2838,1260,2838,1361" }, { "name": "HAL, HIS, HSTD", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2340,1068,2533,1068" }, { "name": "ACMSD", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2392,1134,2533,1134" }, { "name": "ACAA2, DSAEC...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2076,1423,2076,1465,2076,1465,2076,1468,2077,1472,2079,1475,2081,1477,2084,1480,2086,1482,2089,1484,2093,1485,2096,1485,2096,1485,2214,1485" }, { "name": "ECHS1, ECHS1D, SCEH...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2263,1485,2357,1485" }, { "name": "ACADM, ACAD1, MCAD, MCADH...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2353,1485,2433,1485" }, { "name": "DBT, BCATE2, BCKAD-E2, BCKADE2, BCOADC-E2, E2, E2B", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2431,1487,2431,1441" }, { "name": "BCKDHA, BCKDE1A, MSU, MSUD1, OVD1A...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2766,1414,2535,1414" }, { "name": "DBT, BCATE2, BCKAD-E2, BCKADE2, BCOADC-E2, E2, E2B", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2536,1367,2536,1416" }, { "name": "ACADM, ACAD1, MCAD, MCADH...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2431,1368,2537,1368" }, { "name": "MCCC1, MCC-B, MCCA...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2336,1368,2433,1368" }, { "name": "AUH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2338,1367,2249,1367" }, { "name": "102724788...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3074,1625,3074,1685" }, { "name": "AGXT, AGT, AGT1, AGXT1, PH1, SPAT, SPT, TLH6", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1432,1787,2173,1787,2173,1787,2176,1787,2180,1786,2183,1784,2185,1782,2188,1779,2190,1777,2192,1774,2193,1770,2193,1767,2193,1767,2193,1229,2193,1229,2193,1226,2194,1222,2196,1219,2198,1217,2201,1214,2203,1212,2206,1210,2210,1209,2213,1209,2213,1209,2287,1209" }, { "name": "DMGDH, DMGDHD, ME2GLYDH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2480,1088,2570,1088" }, { "name": "BHMT, BHMT1, HEL-S-61p", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2622,1088,2568,1088" }, { "name": "GOT1, AST1, ASTQTL1, GIG18, cAspAT, cCAT...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2426,925,2562,925" }, { "name": "BAAT, BACAT, BAT", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "441,2039,441,2029,441,2029,441,2026,440,2022,438,2019,436,2017,433,2014,431,2012,428,2010,424,2009,421,2009,421,2009,401,2009" }, { "name": "ACADL, ACAD4, LCAD...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1357,1206,1357,1302" }, { "name": "ECHS1, ECHS1D, SCEH...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1357,1113,1357,1208" }, { "name": "EHHADH, ECHD, FRTS3, L-PBE, LBFP, LBP, PBFE...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1357,1019,1357,1115" }, { "name": "ACAA2, DSAEC...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1296,1300,1296,1309,1296,1309,1296,1311,1297,1314,1298,1316,1300,1318,1301,1319,1303,1321,1305,1322,1308,1323,1310,1323,1310,1323,1312,1323,1312,1323,1315,1323,1317,1322,1319,1321,1322,1319,1323,1318,1325,1316,1326,1314,1327,1311,1327,1309,1327,1309,1327,1007,1327,1007,1327,1005,1328,1002,1329,1000,1330,998,1332,997,1334,995,1336,994,1338,993,1340,993,1340,993,1343,993,1343,993,1345,993,1348,994,1350,995,1352,997,1353,998,1355,1000,1356,1002,1357,1005,1357,1007,1357,1007,1357,1019" }, { "name": "ACAA2, DSAEC...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1357,1022,1357,986,1357,986,1357,983,1358,979,1360,976,1362,974,1365,971,1367,969,1370,967,1374,966,1377,966,1377,966,1607,966,1607,966,1610,966,1614,967,1617,969,1619,971,1622,974,1624,976,1626,979,1627,983,1627,986,1627,986,1627,1310,1627,1310,1627,1313,1628,1317,1630,1320,1632,1322,1635,1325,1638,1327,1641,1329,1644,1330,1647,1330,1647,1330,1721,1330" }, { "name": "ACADL, ACAD4, LCAD...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1296,1207,1296,1302" }, { "name": "ECHS1, ECHS1D, SCEH...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1296,1114,1296,1209" }, { "name": "EHHADH, ECHD, FRTS3, L-PBE, LBFP, LBP, PBFE...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1296,1020,1296,1116" }, { "name": "ACAA2, DSAEC...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1235,1300,1235,1309,1235,1309,1235,1311,1236,1314,1237,1316,1239,1318,1240,1319,1242,1321,1244,1322,1247,1323,1249,1323,1249,1323,1252,1323,1252,1323,1254,1323,1256,1322,1258,1321,1260,1319,1262,1318,1264,1316,1265,1314,1266,1311,1266,1309,1266,1309,1266,1007,1266,1007,1266,1005,1267,1002,1268,1000,1269,998,1271,997,1273,995,1275,994,1277,993,1279,993,1279,993,1282,993,1282,993,1284,993,1287,994,1289,995,1291,997,1292,998,1294,1000,1295,1002,1296,1005,1296,1007,1296,1007,1296,1020" }, { "name": "ACAA2, DSAEC...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1296,1013,1295,986,1295,986,1295,983,1296,979,1298,976,1300,974,1303,971,1305,969,1308,967,1312,966,1315,966,1315,966,1607,966,1607,966,1610,966,1614,967,1617,969,1619,971,1622,974,1624,976,1626,979,1627,983,1627,986,1627,986,1627,1310,1627,1310,1627,1313,1628,1317,1630,1320,1632,1322,1635,1325,1638,1327,1641,1329,1644,1330,1647,1330,1647,1330,1721,1330" }, { "name": "ACADL, ACAD4, LCAD...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1235,1207,1235,1302" }, { "name": "ECHS1, ECHS1D, SCEH...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1235,1114,1235,1209" }, { "name": "EHHADH, ECHD, FRTS3, L-PBE, LBFP, LBP, PBFE...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1235,1020,1235,1116" }, { "name": "ACAA2, DSAEC...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1174,1300,1174,1309,1174,1309,1174,1311,1175,1314,1176,1316,1178,1318,1179,1319,1181,1321,1183,1322,1186,1323,1188,1323,1188,1323,1190,1323,1190,1323,1193,1323,1195,1322,1197,1321,1200,1319,1201,1318,1203,1316,1204,1314,1205,1311,1205,1309,1205,1309,1205,1007,1205,1007,1205,1005,1206,1002,1207,1000,1208,998,1210,997,1212,995,1214,994,1216,993,1218,993,1218,993,1221,993,1221,993,1223,993,1226,994,1228,995,1230,997,1231,998,1233,1000,1234,1002,1235,1005,1235,1007,1235,1007,1235,1020" }, { "name": "ACAA2, DSAEC...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1235,1016,1235,986,1235,986,1235,983,1236,979,1238,976,1240,974,1243,971,1245,969,1248,967,1252,966,1255,966,1255,966,1607,966,1607,966,1610,966,1614,967,1617,969,1619,971,1622,974,1624,976,1626,979,1627,983,1627,986,1627,986,1627,1310,1627,1310,1627,1313,1628,1317,1630,1320,1632,1322,1635,1325,1638,1327,1641,1329,1644,1330,1647,1330,1647,1330,1720,1330" }, { "name": "ACADL, ACAD4, LCAD...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1174,1207,1174,1302" }, { "name": "ECHS1, ECHS1D, SCEH...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1174,1114,1174,1209" }, { "name": "EHHADH, ECHD, FRTS3, L-PBE, LBFP, LBP, PBFE...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1174,1020,1174,1116" }, { "name": "ACAA2, DSAEC...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1113,1300,1113,1309,1113,1309,1113,1311,1114,1314,1115,1316,1117,1318,1118,1319,1120,1321,1122,1322,1125,1323,1127,1323,1127,1323,1130,1323,1130,1323,1132,1323,1134,1322,1136,1321,1138,1319,1140,1318,1142,1316,1143,1314,1144,1311,1144,1309,1144,1309,1144,1007,1144,1007,1144,1005,1145,1002,1146,1000,1147,998,1149,997,1151,995,1153,994,1155,993,1157,993,1157,993,1160,993,1160,993,1162,993,1165,994,1167,995,1169,997,1170,998,1172,1000,1173,1002,1174,1005,1174,1007,1174,1007,1174,1021" }, { "name": "ACAA2, DSAEC...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1174,1013,1174,986,1174,986,1174,983,1175,979,1177,976,1179,974,1182,971,1184,969,1187,967,1191,966,1194,966,1194,966,1607,966,1607,966,1610,966,1614,967,1617,969,1619,971,1622,974,1624,976,1626,979,1627,983,1627,986,1627,986,1627,1310,1627,1310,1627,1313,1628,1317,1630,1320,1632,1322,1635,1325,1638,1327,1641,1329,1644,1330,1647,1330,1647,1330,1720,1330" }, { "name": "ACADL, ACAD4, LCAD...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1113,1207,1113,1302" }, { "name": "ECHS1, ECHS1D, SCEH...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1113,1114,1113,1209" }, { "name": "EHHADH, ECHD, FRTS3, L-PBE, LBFP, LBP, PBFE...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1113,1020,1113,1116" }, { "name": "ACAA2, DSAEC...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1052,1300,1052,1309,1052,1309,1052,1311,1053,1314,1054,1316,1056,1318,1057,1319,1059,1321,1061,1322,1064,1323,1066,1323,1066,1323,1068,1323,1068,1323,1071,1323,1073,1322,1075,1321,1078,1319,1079,1318,1081,1316,1082,1314,1083,1311,1083,1309,1083,1309,1083,1007,1083,1007,1083,1005,1084,1002,1085,1000,1086,998,1088,997,1090,995,1092,994,1094,993,1096,993,1096,993,1099,993,1099,993,1101,993,1104,994,1106,995,1108,997,1109,998,1111,1000,1112,1002,1113,1005,1113,1007,1113,1007,1113,1021" }, { "name": "ACAA2, DSAEC...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1113,1013,1113,986,1113,986,1113,983,1114,979,1116,976,1118,974,1121,971,1123,969,1126,967,1130,966,1133,966,1133,966,1607,966,1607,966,1610,966,1614,967,1617,969,1619,971,1622,974,1624,976,1626,979,1627,983,1627,986,1627,986,1628,1310,1628,1310,1628,1313,1629,1317,1631,1320,1633,1322,1636,1325,1638,1327,1641,1329,1645,1330,1648,1330,1648,1330,1720,1330" }, { "name": "ACADL, ACAD4, LCAD...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1052,1207,1052,1302" }, { "name": "ECHS1, ECHS1D, SCEH...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1052,1114,1052,1209" }, { "name": "EHHADH, ECHD, FRTS3, L-PBE, LBFP, LBP, PBFE...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1052,1020,1052,1116" }, { "name": "ACAA2, DSAEC...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "991,1300,991,1309,991,1309,991,1311,992,1314,993,1316,995,1318,996,1319,998,1321,1000,1322,1003,1323,1005,1323,1005,1323,1008,1323,1008,1323,1010,1323,1012,1322,1014,1321,1016,1319,1018,1318,1020,1316,1021,1314,1022,1311,1022,1309,1022,1309,1022,1007,1022,1007,1022,1005,1023,1002,1024,1000,1025,998,1027,997,1029,995,1031,994,1033,993,1035,993,1035,993,1038,993,1038,993,1040,993,1043,994,1045,995,1047,997,1048,998,1050,1000,1051,1002,1052,1005,1052,1007,1052,1007,1052,1020" }, { "name": "ACAA2, DSAEC...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1052,1022,1052,986,1052,986,1052,983,1053,979,1055,976,1057,974,1060,971,1062,969,1065,967,1069,966,1072,966,1072,966,1607,966,1607,966,1610,966,1614,967,1617,969,1619,971,1622,974,1624,976,1626,979,1627,983,1627,986,1627,986,1628,1310,1628,1310,1628,1313,1629,1317,1631,1320,1633,1322,1636,1325,1638,1327,1641,1329,1645,1330,1648,1330,1648,1330,1721,1330" }, { "name": "ACADM, ACAD1, MCAD, MCADH...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "991,1207,991,1301" }, { "name": "ECHS1, ECHS1D, SCEH...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "991,1114,991,1209" }, { "name": "EHHADH, ECHD, FRTS3, L-PBE, LBFP, LBP, PBFE...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "991,1020,991,1116" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "893,1256,893,1351" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "893,1163,893,1258" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "893,1068,893,1163" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,1347,832,1356,832,1356,832,1358,833,1361,834,1363,836,1365,837,1366,839,1368,841,1369,844,1370,846,1370,846,1370,848,1370,848,1370,851,1370,853,1369,855,1368,858,1366,859,1365,861,1363,862,1361,863,1358,863,1356,863,1356,863,1054,863,1054,863,1052,864,1049,865,1047,866,1045,868,1044,870,1042,872,1041,874,1040,876,1040,876,1040,879,1040,879,1040,881,1040,884,1041,886,1042,888,1044,889,1045,891,1047,892,1049,893,1052,893,1054,893,1054,893,1070" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "893,1070,893,1026,893,1026,893,1023,892,1019,890,1016,888,1014,885,1011,883,1009,880,1007,876,1006,873,1006,873,1006,621,1006" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,1256,832,1351" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,1162,832,1257" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,1069,832,1164" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "771,1347,771,1356,771,1356,771,1358,772,1361,773,1363,775,1365,776,1366,778,1368,780,1369,783,1370,785,1370,785,1370,788,1370,788,1370,790,1370,792,1369,794,1368,796,1366,798,1365,800,1363,801,1361,802,1358,802,1356,802,1356,802,1054,802,1054,802,1052,803,1049,804,1047,805,1045,807,1044,809,1042,811,1041,813,1040,815,1040,815,1040,818,1040,818,1040,820,1040,823,1041,825,1042,827,1044,828,1045,830,1047,831,1049,832,1052,832,1054,832,1054,832,1070" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,1070,832,1026,832,1026,832,1023,831,1019,829,1016,827,1014,824,1011,822,1009,819,1007,815,1006,812,1006,812,1006,621,1006" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "771,1256,771,1351" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "771,1162,771,1257" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "771,1069,771,1164" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "710,1347,710,1356,710,1356,710,1358,711,1361,712,1363,714,1365,715,1366,717,1368,719,1369,722,1370,724,1370,724,1370,726,1370,726,1370,729,1370,731,1369,733,1368,736,1366,737,1365,739,1363,740,1361,741,1358,741,1356,741,1356,741,1054,741,1054,741,1052,742,1049,743,1047,744,1045,746,1044,748,1042,750,1041,752,1040,754,1040,754,1040,757,1040,757,1040,759,1040,762,1041,764,1042,766,1044,767,1045,769,1047,770,1049,771,1052,771,1054,771,1054,771,1070" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "771,1070,771,1026,771,1026,771,1023,770,1019,768,1016,766,1014,763,1011,761,1009,758,1007,754,1006,751,1006,751,1006,621,1006" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "710,1256,710,1351" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "710,1162,710,1257" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "710,1069,710,1164" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "649,1347,649,1356,649,1356,649,1358,650,1361,651,1363,653,1365,654,1366,656,1368,658,1369,661,1370,663,1370,663,1370,666,1370,666,1370,668,1370,670,1369,672,1368,674,1366,676,1365,678,1363,679,1361,680,1358,680,1356,680,1356,680,1054,680,1054,680,1052,681,1049,682,1047,683,1045,685,1044,687,1042,689,1041,691,1040,693,1040,693,1040,696,1040,696,1040,698,1040,701,1041,703,1042,705,1044,706,1045,708,1047,709,1049,710,1052,710,1054,710,1054,710,1070" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "710,1070,710,1026,710,1026,710,1023,709,1019,707,1016,705,1014,702,1011,700,1009,697,1007,693,1006,690,1006,690,1006,621,1006" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "649,1256,649,1351" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "649,1162,649,1257" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "649,1069,649,1164" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "588,1347,588,1356,588,1356,588,1358,589,1361,590,1363,592,1365,593,1366,595,1368,597,1369,600,1370,602,1370,602,1370,604,1370,604,1370,607,1370,609,1369,611,1368,614,1366,615,1365,617,1363,618,1361,619,1358,619,1356,619,1356,619,1054,619,1054,619,1052,620,1049,621,1047,622,1045,624,1044,626,1042,628,1041,630,1040,632,1040,632,1040,635,1040,635,1040,637,1040,640,1041,642,1042,644,1044,645,1045,647,1047,648,1049,649,1052,649,1054,649,1054,649,1070" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "649,1070,649,1026,649,1026,649,1023,648,1019,646,1016,644,1014,641,1011,639,1009,636,1007,632,1006,629,1006,629,1006,621,1006" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "588,1256,588,1351" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "588,1162,588,1257" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "588,1069,588,1164" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "527,1347,527,1356,527,1356,527,1358,528,1361,529,1363,531,1365,532,1366,534,1368,536,1369,539,1370,541,1370,541,1370,544,1370,544,1370,546,1370,548,1369,550,1368,552,1366,554,1365,556,1363,557,1361,558,1358,558,1356,558,1356,558,1054,558,1054,558,1052,559,1049,560,1047,561,1045,563,1044,565,1042,567,1041,569,1040,571,1040,571,1040,574,1040,574,1040,576,1040,579,1041,581,1042,583,1044,584,1045,586,1047,587,1049,588,1052,588,1054,588,1054,588,1070" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "588,1070,588,1026,588,1026,588,1023,589,1019,591,1016,593,1014,596,1011,598,1009,601,1007,605,1006,608,1006,608,1006,623,1006" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "527,1256,527,1351" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "527,1162,527,1257" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "527,1069,527,1164" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "527,946,527,1071" }, { "name": "FASN, FAS, OA-519, SDR27X1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "527,1070,527,1026,527,1026,527,1023,528,1019,530,1016,532,1014,535,1011,537,1009,540,1007,544,1006,547,1006,547,1006,623,1006" }, { "name": "FASN, FAS, OA-519, SDR27X1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "893,1349,893,1349,893,1349,893,1353,895,1358,897,1362,900,1365,904,1368,908,1371,912,1373,916,1375,921,1375,921,1375,1188,1375" }, { "name": "ACSL1, ACS1, FACL1, FACL2, LACS, LACS1, LACS2...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1186,1375,1329,1375,1329,1375,1334,1375,1338,1373,1342,1371,1346,1368,1350,1364,1353,1360,1355,1356,1357,1352,1357,1347,1357,1347,1357,1300" }, { "name": "HMGCL, HL...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "2163,1367,2251,1367" }, { "name": "BDH2, DHRS6, EFA6R, PRO20933, SDR15C1, UCPA-OR, UNQ6308...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "2164,1366,2164,1401" }, { "name": "MVD, FP17780, MDDase, MPD, POROK7", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "674,1452,624,1452,624,1452,621,1452,617,1451,614,1449,612,1447,609,1444,607,1442,605,1439,604,1435,604,1432,604,1432,604,1423" }, { "name": "PMVK, HUMPMKI, PMK, PMKA, PMKASE, POROK1", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "673,1452,758,1452" }, { "name": "MVK, LRBP, MK, MVLK, POROK3", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "756,1452,853,1452" }, { "name": "FDFT1, DGPT, ERG9, SQS, SS", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "383,1467,383,1507" }, { "name": "SQLE", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "382,1506,442,1506" }, { "name": "LSS, CTRCT44, OSC", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "440,1506,500,1506" }, { "name": "CYP51A1, CP51, CYP51, CYPL1, LDM, P450-14DM, P450L1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "499,1506,559,1506" }, { "name": "TM7SF2, ANG1, DHCR14A, NET47", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "558,1506,618,1506" }, { "name": "FAXDC2, C5orf4...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "618,1506,678,1506" }, { "name": "NSDHL, H105E3, SDR31E1, XAP104", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "678,1506,738,1506" }, { "name": "HSD17B7, PRAP, SDR37C1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "738,1506,800,1506" }, { "name": "EBP, CDPX2, CHO2, CPX, CPXD, MEND", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "800,1554,740,1554" }, { "name": "DHCR24, DCE, Nbla03646, SELADIN1, seladin-1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "614,1553,614,1603" }, { "name": "DHCR24, DCE, Nbla03646, SELADIN1, seladin-1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "679,1553,679,1603" }, { "name": "DHCR24, DCE, Nbla03646, SELADIN1, seladin-1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "741,1553,741,1603" }, { "name": "DHCR24, DCE, Nbla03646, SELADIN1, seladin-1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "799,1603,799,1553" }, { "name": "EBP, CDPX2, CHO2, CPX, CPXD, MEND", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "800,1602,740,1602" }, { "name": "SC5D, ERG3, S5DES, SC5DL", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "742,1602,678,1602" }, { "name": "DHCR7, SLOS", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "680,1602,613,1602" }, { "name": "HSD3B7, CBAS1, PFIC4, SDR11E3", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "560,1602,502,1602" }, { "name": "AKR1D1, 3o5bred, CBAS2, SRD5B1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "503,1601,503,1641" }, { "name": "AKR1C4, 3-alpha-HSD, C11, CDR, CHDR, DD-4, DD4, HAKRA", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "503,1639,503,1679" }, { "name": "CYP27A1, CP27, CTX, CYP27", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "503,1678,503,1718" }, { "name": "CYP27A1, CP27, CTX, CYP27", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "503,1715,503,1755" }, { "name": "CYP27A1, CP27, CTX, CYP27", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "503,1754,503,1794" }, { "name": "SLC27A5, ACSB, ACSVL6, BACS, BAL, FACVL3, FATP-5, FATP5, VLACSR, VLCS-H2, VLCSH2", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "503,1793,503,1833" }, { "name": "AMACR, AMACRD, CBAS4, P504S, RACE, RM", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "503,1830,503,1870" }, { "name": "ACOX2, BCOX, BRCACOX, BRCOX, THCCox", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "503,1868,503,1908" }, { "name": "HSD17B4, DBP, MFE-2, MPF-2, PRLTS1, SDR8C1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "503,1907,503,1947" }, { "name": "CYP8B1, CP8B, CYP12", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "440,1602,504,1602" }, { "name": "AKR1D1, 3o5bred, CBAS2, SRD5B1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "441,1601,441,1642" }, { "name": "AKR1C4, 3-alpha-HSD, C11, CDR, CHDR, DD-4, DD4, HAKRA", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "441,1639,441,1679" }, { "name": "CYP27A1, CP27, CTX, CYP27", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "441,1677,441,1717" }, { "name": "CYP27A1, CP27, CTX, CYP27", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "441,1715,441,1755" }, { "name": "CYP27A1, CP27, CTX, CYP27", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "441,1754,441,1794" }, { "name": "SLC27A5, ACSB, ACSVL6, BACS, BAL, FACVL3, FATP-5, FATP5, VLACSR, VLCS-H2, VLCSH2", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "441,1792,441,1832" }, { "name": "AMACR, AMACRD, CBAS4, P504S, RACE, RM", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "441,1831,441,1871" }, { "name": "ACOX2, BCOX, BRCACOX, BRCOX, THCCox", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "441,1868,441,1908" }, { "name": "HSD17B4, DBP, MFE-2, MPF-2, PRLTS1, SDR8C1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "441,1906,441,1946" }, { "name": "SCP2, NLTP, NSL-TP, SCP-2, SCP-CHI, SCP-X, SCPX", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "441,1982,441,2039" }, { "name": "ACOT8, HNAACTE, NAP1, PTE-1, PTE-2, PTE1, PTE2, hACTE-III, hTE...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "361,2038,442,2038" }, { "name": "BAAT, BACAT, BAT", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "441,2037,441,2047,441,2047,441,2050,440,2054,438,2057,436,2059,433,2062,431,2064,428,2066,424,2067,421,2067,421,2067,401,2067" }, { "name": "CYP11A1, CYP11A, CYPXIA1, P450SCC", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "614,1601,614,1625,614,1625,614,1628,613,1632,611,1635,609,1637,606,1640,604,1642,601,1644,597,1645,594,1645,594,1645,557,1645" }, { "name": "CYP11A1, CYP11A, CYPXIA1, P450SCC", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "558,1644,558,1670,558,1670,558,1673,559,1677,561,1680,563,1682,566,1685,568,1687,571,1689,575,1690,578,1690,578,1690,615,1690" }, { "name": "CYP11A1, CYP11A, CYPXIA1, P450SCC", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "614,1689,614,1731" }, { "name": "CYP11A1, CYP11A, CYPXIA1, P450SCC", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "614,1601,614,1629,614,1629,614,1632,615,1634,616,1637,618,1639,620,1641,622,1643,625,1644,627,1645,630,1645,630,1645,672,1645" }, { "name": "CYP11A1, CYP11A, CYPXIA1, P450SCC", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "671,1644,671,1670,671,1670,671,1673,670,1677,668,1680,666,1682,663,1685,661,1687,658,1689,654,1690,651,1690,651,1690,613,1690" }, { "name": "CYP17A1, CPT7, CYP17, P450C17, S17AH", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "551,1769,615,1769" }, { "name": "CYP21A2, CA21H, CAH1, CPS1, CYP21, CYP21B, P450c21B", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "552,1768,552,1808" }, { "name": "CYP11B1, CPN1, CYP11B, FHI, P450C11...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "552,1806,552,1846" }, { "name": "CYP21A2, CA21H, CAH1, CPS1, CYP21, CYP21B, P450c21B", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "614,1768,614,1808" }, { "name": "CYP11B1, CPN1, CYP11B, FHI, P450C11...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "614,1806,614,1846" }, { "name": "CYP11B2, ALDOS, CPN2, CYP11B, CYP11BL, CYPXIB2, P-450C18, P450C18, P450aldo", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "614,1844,614,1880" }, { "name": "CYP11B2, ALDOS, CPN2, CYP11B, CYP11BL, CYPXIB2, P-450C18, P450C18, P450aldo", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "614,1877,614,1941" }, { "name": "CYP17A1, CPT7, CYP17, P450C17, S17AH", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "613,1730,681,1730" }, { "name": "HSD3B1, 3BETAHSD, HSD3B, HSDB3, HSDB3A, I, SDR11E1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "740,1730,800,1730" }, { "name": "HSD17B3, EDH17B3, SDR12C2...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "800,1731,800,1660" }, { "name": "CYP19A1, ARO, ARO1, CPV1, CYAR, CYP19, CYPXIX, P-450AROM", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "849,1661,799,1661" }, { "name": "CYP19A1, ARO, ARO1, CPV1, CYAR, CYP19, CYPXIX, P-450AROM", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "898,1661,848,1661" }, { "name": "CYP19A1, ARO, ARO1, CPV1, CYAR, CYP19, CYPXIX, P-450AROM", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "943,1661,897,1661" }, { "name": "HSD17B1, 17-beta-HSD, 20-alpha-HSD, E2DH, EDH17B2, EDHB17, HSD17, SDR28C1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "942,1731,942,1660" }, { "name": "CYP19A1, ARO, ARO1, CPV1, CYAR, CYP19, CYPXIX, P-450AROM", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "943,1730,897,1730" }, { "name": "CYP19A1, ARO, ARO1, CPV1, CYAR, CYP19, CYPXIX, P-450AROM", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "898,1730,848,1730" }, { "name": "CYP19A1, ARO, ARO1, CPV1, CYAR, CYP19, CYPXIX, P-450AROM", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "849,1730,799,1730" }, { "name": "CYP51A1, CP51, CYP51, CYPL1, LDM, P450-14DM, P450L1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "384,1630,384,1670" }, { "name": "TM7SF2, ANG1, DHCR14A, NET47", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "384,1668,384,1708" }, { "name": "EBP, CDPX2, CHO2, CPX, CPXD, MEND", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "384,1707,384,1747" }, { "name": "SC5D, ERG3, S5DES, SC5DL", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "384,1785,384,1825" }, { "name": "DHCR7, SLOS", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "384,1824,384,1864" }, { "name": "DHCR24, DCE, Nbla03646, SELADIN1, seladin-1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "384,1862,384,1903" }, { "name": "ACACA, ACAC, ACACAD, ACC, ACC1, ACCA...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1721,1330,1577,1330,1577,1330,1574,1330,1571,1329,1568,1327,1565,1325,1563,1322,1561,1320,1559,1317,1558,1313,1558,1310,1558,1310,1558,967,1558,967,1558,964,1557,960,1555,957,1553,955,1550,952,1548,950,1545,948,1541,947,1538,947,1538,947,642,947,642,947,639,947,635,948,632,950,630,952,627,955,625,957,623,960,622,964,622,967,622,967,622,970" }, { "name": "CYP2R1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "740,1634,800,1634" }, { "name": "CYP27B1, CP2B, CYP1, CYP1alpha, CYP27B, P450c1, PDDR, VDD1, VDDR, VDDRI, VDR", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "798,1634,849,1634" }, { "name": "RPIA, RPI, RPIAD", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1367,1574,1367,1614" }, { "name": "TKT, HEL-S-48, HEL107, SDDHD, TK, TKT1...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1367,1534,1367,1574" }, { "name": "ALDOA, ALDA, GSD12, HEL-S-87p...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1454,1495,1396,1495" }, { "name": "TKT, HEL-S-48, HEL107, SDDHD, TK, TKT1...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1484,1535,1484,1511,1484,1511,1484,1508,1483,1506,1482,1503,1480,1501,1478,1499,1476,1497,1473,1496,1471,1495,1468,1495,1468,1495,1454,1495" }, { "name": "FBP1, FBP...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1484,1535,1484,1575" }, { "name": "ALDOA, ALDA, GSD12, HEL-S-87p...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1484,1575,1484,1615" }, { "name": "GAPDH, G3PD, GAPD, HEL-S-162eP", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1484,1613,1484,1653" }, { "name": "PGK1, HEL-S-68p, MIG10, PGKA...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1433,1687,1468,1687,1468,1687,1471,1687,1473,1686,1476,1685,1478,1683,1480,1681,1482,1679,1483,1676,1484,1674,1484,1671,1484,1671,1484,1653" }, { "name": "RPE, RPE2-1...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1421,1614,1367,1614" }, { "name": "ME3, NADP-ME...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1251,1755,1251,1760,1251,1760,1251,1763,1252,1767,1254,1770,1256,1772,1259,1775,1261,1777,1264,1779,1268,1780,1271,1780,1271,1780,1295,1780" }, { "name": "ME3, NADP-ME...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1294,1780,1292,1780,1292,1780,1289,1780,1287,1779,1284,1778,1282,1776,1280,1774,1278,1772,1277,1769,1276,1767,1276,1764,1276,1764,1276,1703,1276,1703,1276,1700,1277,1698,1278,1695,1280,1693,1282,1691,1284,1689,1287,1688,1289,1687,1292,1687,1292,1687,1341,1687" }, { "name": "GPT, AAT1, ALT1, GPT1...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1252,1756,1192,1756" }, { "name": "MDH1, HEL-S-32, MDH-s, MDHA, MGC:1375, MOR2...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1293,1780,1320,1780,1320,1780,1323,1780,1327,1779,1330,1777,1332,1775,1335,1772,1337,1770,1339,1767,1340,1763,1340,1760,1340,1760,1340,1754" }, { "name": "NDUFC2-KCTD14...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1457,1928,1459,1928,1459,1928,1464,1929,1470,1930,1475,1933,1479,1936,1484,1941,1487,1945,1490,1950,1491,1956,1492,1961,1492,1961,1492,1965,1492,1965,1491,1970,1490,1976,1487,1981,1484,1985,1479,1990,1475,1993,1470,1996,1464,1997,1459,1998,1459,1998,1457,1998" }, { "name": "NDUFC2-KCTD14...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1492,1908,1492,2014" }, { "name": "NDUFC2-KCTD14...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1586,1928,1525,1928,1525,1928,1520,1929,1514,1930,1509,1933,1505,1936,1500,1941,1497,1945,1494,1950,1493,1956,1492,1961,1492,1961,1492,1965,1492,1965,1493,1970,1494,1976,1497,1981,1500,1985,1505,1990,1509,1993,1514,1996,1520,1997,1525,1998,1525,1998,1586,1998" }, { "name": "UQCR11, 0710008D09Rik, QCR10, UQCR...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1584,1928,1586,1928,1586,1928,1591,1929,1597,1930,1602,1933,1606,1936,1611,1941,1614,1945,1617,1950,1618,1956,1619,1961,1619,1961,1619,1965,1619,1965,1618,1970,1617,1976,1614,1981,1611,1985,1606,1990,1602,1993,1597,1996,1591,1997,1586,1998,1586,1998,1584,1998" }, { "name": "UQCR11, 0710008D09Rik, QCR10, UQCR...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1619,1908,1619,2014" }, { "name": "UQCR11, 0710008D09Rik, QCR10, UQCR...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1654,1998,1652,1998,1652,1998,1647,1997,1641,1996,1636,1993,1632,1990,1627,1985,1624,1981,1621,1976,1620,1970,1619,1965,1619,1965,1619,1961,1619,1961,1620,1956,1621,1950,1624,1945,1627,1941,1632,1936,1636,1933,1641,1930,1647,1929,1652,1928,1652,1928,1654,1928" }, { "name": "COX17...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1654,1928,1656,1928,1656,1928,1661,1929,1667,1930,1672,1933,1676,1936,1681,1941,1684,1945,1687,1950,1688,1956,1689,1961,1689,1961,1689,1965,1689,1965,1688,1970,1687,1976,1684,1981,1681,1985,1676,1990,1672,1993,1667,1996,1661,1997,1656,1998,1656,1998,1654,1998" }, { "name": "COX17...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1689,1908,1689,2014" }, { "name": "COX17...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1724,1998,1722,1998,1722,1998,1717,1997,1711,1996,1706,1993,1702,1990,1697,1985,1694,1981,1691,1976,1690,1970,1689,1965,1689,1965,1689,1961,1689,1961,1690,1956,1691,1950,1694,1945,1697,1941,1702,1936,1706,1933,1711,1930,1717,1929,1722,1928,1722,1928,1724,1928" }, { "name": "TCIRG1, ATP6N1C, ATP6V0A3, Atp6i, OC-116kDa, OC116, OPTB1, Stv1, TIRC7, Vph1, a3...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1759,1908,1759,2014" }, { "name": "TCIRG1, ATP6N1C, ATP6V0A3, Atp6i, OC-116kDa, OC116, OPTB1, Stv1, TIRC7, Vph1, a3...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1794,1998,1792,1998,1792,1998,1787,1997,1781,1996,1776,1993,1772,1990,1767,1985,1764,1981,1761,1976,1760,1970,1759,1965,1759,1965,1759,1961,1759,1961,1760,1956,1761,1950,1764,1945,1767,1941,1772,1936,1776,1933,1781,1930,1787,1929,1792,1928,1792,1928,1794,1928" }, { "name": "SDHA, CMD1GG, FP, PGL5, SDH1, SDH2, SDHF...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1570,1800,1570,1800,1570,1800,1567,1800,1565,1801,1563,1802,1560,1804,1559,1806,1557,1808,1556,1811,1555,1813,1555,1816,1555,1816,1555,1912,1555,1912,1555,1915,1554,1917,1552,1920,1551,1922,1548,1924,1546,1926,1543,1927,1541,1928,1538,1928,1538,1928,1536,1928,1536,1928,1533,1928,1531,1927,1528,1926,1526,1924,1524,1922,1522,1920,1521,1917,1520,1915,1520,1912,1520,1912,1519,1704" }, { "name": "GOT1, AST1, ASTQTL1, GIG18, cAspAT, cCAT...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1339,1755,1379,1755" }, { "name": "NT5C1B-RDH14...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2761,190,2761,270" }, { "name": "PNP, NP, PRO1837, PUNP", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2761,268,2761,348" }, { "name": "HPRT1, HGPRT, HPRT", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2762,191,2755,191,2755,191,2752,191,2748,192,2745,194,2743,196,2740,199,2738,201,2736,204,2735,208,2735,211,2735,211,2735,327,2735,327,2735,330,2736,334,2738,337,2740,339,2743,342,2745,344,2748,346,2752,347,2755,347,2755,347,2763,347" }, { "name": "ADSSL1, MPD5...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2698,191,2762,191" }, { "name": "ADSL, AMPS, ASASE, ASL", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2636,191,2700,191" }, { "name": "NT5C1B-RDH14...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2637,190,2637,270" }, { "name": "APRT, AMP, APRTD", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2638,347,2630,347,2630,347,2627,347,2623,346,2620,344,2618,342,2615,339,2613,337,2611,334,2610,330,2610,327,2610,327,2610,211,2610,211,2610,208,2611,204,2613,201,2615,199,2618,196,2620,194,2623,192,2627,191,2630,191,2630,191,2638,191" }, { "name": "AK6, AD-004, CGI-137, CINAP, CIP, hCINAP...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2574,191,2638,191" }, { "name": "NME6, IPIA-ALPHA, NDK_6, NM23-H6...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2501,257,2576,257" }, { "name": "ADA...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2636,269,2762,269" }, { "name": "IMPDH1, IMPD, IMPD1, IMPDH-I, LCA11, RP10, sWSS2608...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2760,191,2821,191" }, { "name": "NT5C1B-RDH14...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2820,190,2820,270" }, { "name": "PNP, NP, PRO1837, PUNP", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2820,268,2820,348" }, { "name": "XDH, XAN1, XO, XOR", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2760,347,2821,347" }, { "name": "GMPS", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2820,191,2903,191" }, { "name": "GDA, CYPIN, GUANASE, NEDASIN", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2819,347,2903,347" }, { "name": "GUK1, GMK", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2901,191,2965,191" }, { "name": "NME6, IPIA-ALPHA, NDK_6, NM23-H6...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2963,191,3046,191" }, { "name": "RRM2B, MTDPS8A, MTDPS8B, P53R2...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2964,190,2964,258" }, { "name": "NME6, IPIA-ALPHA, NDK_6, NM23-H6...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2963,257,3046,257" }, { "name": "URAD, PRHOXNB", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2925,544,2925,708" }, { "name": "CAD, CDG1Z, EIEE50", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2207,746,2207,842" }, { "name": "DHODH, DHOdehase, POADS, URA1", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2207,654,2207,749" }, { "name": "UMPS, OPRT", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2207,657,2207,382,2207,382,2207,379,2208,375,2210,372,2212,370,2215,367,2217,365,2220,363,2224,362,2227,362,2227,362,2314,362" }, { "name": "UMPS, OPRT", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2142,619,2187,619,2187,619,2190,619,2194,618,2197,616,2199,614,2202,611,2204,609,2206,606,2207,602,2207,599,2207,599,2207,518" }, { "name": "CMPK2, NDK, TMPK2, TYKi, UMP-CMPK2...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2348,401,2428,401" }, { "name": "NME6, IPIA-ALPHA, NDK_6, NM23-H6...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2269,401,2350,401" }, { "name": "CTPS1, CTPS, IMD24...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2270,400,2270,490" }, { "name": "NME6, IPIA-ALPHA, NDK_6, NM23-H6...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2269,489,2350,489" }, { "name": "CMPK2, NDK, TMPK2, TYKi, UMP-CMPK2...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2348,489,2428,489" }, { "name": "UCKL1, UCK1L, URKL1...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2426,489,2506,489" }, { "name": "UCKL1, UCK1L, URKL1...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2426,401,2506,401" }, { "name": "CDA, CDD", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2505,490,2505,400" }, { "name": "UPP2, UDRPASE2, UP2, UPASE2...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2505,401,2580,401" }, { "name": "DPYS, DHP, DHPase", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2662,401,2720,401,2720,401,2723,401,2727,402,2730,404,2732,406,2735,409,2737,411,2739,414,2740,418,2740,421,2740,421,2740,441" }, { "name": "UPB1, BUP1", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2740,440,2740,504" }, { "name": "RRM2B, MTDPS8A, MTDPS8B, P53R2...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2349,488,2349,580" }, { "name": "TYMS, HST422, TMS, TS", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2428,655,2428,731" }, { "name": "NME6, IPIA-ALPHA, NDK_6, NM23-H6...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2393,669,2393,712" }, { "name": "NME6, IPIA-ALPHA, NDK_6, NM23-H6...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2269,579,2350,579" }, { "name": "POLD3, P66, P68, PPP1R128...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2393,608,2393,277,2393,277,2393,274,2394,270,2396,267,2398,265,2401,262,2403,260,2406,258,2410,257,2413,257,2413,257,2503,257" }, { "name": "POLD3, P66, P68, PPP1R128...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "3045,256,3045,586,3045,586,3045,589,3044,593,3042,596,3040,598,3037,601,3035,603,3032,605,3028,606,3025,606,3025,606,2405,606" }, { "name": "POLR3F, RPC39, RPC6...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2270,402,2270,350,2270,350,2270,347,2271,343,2273,340,2275,338,2278,335,2280,333,2283,331,2287,330,2290,330,2290,330,2451,330" }, { "name": "POLR3F, RPC39, RPC6...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2270,490,2270,469,2270,469,2270,466,2271,462,2273,459,2275,457,2278,454,2280,452,2283,450,2287,449,2290,449,2290,449,2430,449,2430,449,2433,449,2437,448,2440,446,2442,444,2445,441,2447,439,2449,436,2450,432,2450,429,2450,429,2450,329" }, { "name": "UMPS, OPRT", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2314,362,2407,362,2407,362,2410,362,2414,363,2417,365,2419,367,2422,370,2424,372,2426,375,2427,379,2427,382,2427,382,2427,403" }, { "name": "NT5C1B-RDH14...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2349,731,2430,731" }, { "name": "TYMP, ECGF, ECGF1, MEDPS1, MNGIE, MTDPS1, PDECGF, TP, hPD-ECGF", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2269,731,2357,731" }, { "name": "DPYD, DHP, DHPDHASE, DPD", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2171,731,2271,731" }, { "name": "DPYS, DHP, DHPase", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2174,731,2101,731" }, { "name": "GGT6...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2514,1979,2450,1979" }, { "name": "GLS2, GA, GLS, LGA, hLGA...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2727,1856,2727,1902" }, { "name": "SCLY, SCL, hSCL", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2061,1206,2061,1296" }, { "name": "SCLY, SCL, hSCL", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2061,1294,2061,1254,2061,1254,2061,1251,2060,1249,2059,1246,2057,1244,2055,1242,2053,1240,2050,1239,2048,1238,2045,1238,2045,1238,2029,1238" }, { "name": "SEPHS2, SPS2, SPS2b...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2060,1207,2152,1207" }, { "name": "PCYT2, ET", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "1919,1064,1973,1064" }, { "name": "CEPT1...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "1971,1064,2039,1064" }, { "name": "GAD1, CPSQ1, GAD, SCP...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2560,818,2620,818" }, { "name": "BAAT, BACAT, BAT", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2667,818,2727,818" }, { "name": "GAD1, CPSQ1, GAD, SCP...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2668,817,2668,868,2668,868,2668,872,2666,875,2665,879,2662,882,2660,884,2657,887,2653,888,2650,890,2646,890,2646,890,2619,890" }, { "name": "CNDP1, CN1, CPGL2, HsT2308", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2689,455,2689,483,2689,483,2689,486,2690,490,2692,493,2694,495,2697,498,2699,500,2702,502,2706,503,2709,503,2709,503,2741,503" }, { "name": "CNDP2, CN2, CPGL, HEL-S-13, HsT2298, PEPA...", "fgcolor": "#FF9900", "bgcolor": "#FFFFFF", "type": "line", "coords": "2739,503,2804,503" }, { "name": "PLA2G4B, HsT16992, cPLA2-beta...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "960,424,960,526" }, { "name": "PLA2G4B, HsT16992, cPLA2-beta...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "522,743,755,743,755,743,758,743,762,742,765,740,767,738,770,735,772,733,774,730,775,726,775,723,775,723,775,546,775,546,775,543,776,539,778,536,780,534,783,531,785,529,788,527,792,526,795,526,795,526,960,526" }, { "name": "PGS1", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1156,660,1156,715" }, { "name": "CRLS1, C20orf155, CLS, CLS1, GCD10, dJ967N21.6", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1157,777,1057,777" }, { "name": "CRLS1, C20orf155, CLS, CLS1, GCD10, dJ967N21.6", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1057,777,1113,777,1113,777,1116,777,1120,776,1123,774,1125,772,1128,769,1130,767,1132,764,1133,760,1133,757,1133,757,1133,681,1133,681,1133,678,1134,674,1136,671,1138,669,1141,666,1143,664,1146,662,1150,661,1153,661,1153,661,1157,661" }, { "name": "CDS1, CDS...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1156,592,1156,662" }, { "name": "AGPAT1, 1-AGPAT1, G15, LPAAT-alpha, LPAATA...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1155,592,1181,592,1181,592,1184,592,1188,591,1191,589,1193,587,1196,584,1198,582,1200,579,1201,575,1201,572,1201,572,1201,554" }, { "name": "GPAT4, 1-AGPAT_6, AGPAT6, LPAAT-zeta, LPAATZ, TSARG7...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1296,555,1200,555" }, { "name": "PISD, DJ858B16, PSD, PSDC, PSSC, dJ858B16.2...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "959,661,1059,661" }, { "name": "CEPT1...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "960,591,960,661" }, { "name": "CEPT1...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "915,627,944,627,944,627,947,627,949,628,952,629,954,631,956,633,958,635,959,638,960,640,960,643,960,643,960,662" }, { "name": "CEPT1...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "960,524,960,594" }, { "name": "CEPT1...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "915,558,944,558,944,558,947,558,949,557,952,556,954,554,956,552,958,550,959,547,960,545,960,542,960,542,960,524" }, { "name": "CHKA, CHK, CK, CKI, EK...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "754,627,858,627" }, { "name": "PCYT1A, CCTA, CT, CTA, CTPCT, PCYT1, SMDCRD...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "856,558,916,558" }, { "name": "CHKA, CHK, CK, CKI, EK...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "859,558,806,558" }, { "name": "PEMT, PEAMT, PEMPT, PEMT2, PLMT, PNMT", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "994,559,994,626" }, { "name": "PLD4, C14orf175...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "959,661,1017,661,1017,661,1020,661,1022,660,1025,659,1027,657,1029,655,1031,653,1032,650,1033,648,1033,645,1033,645,1033,642,1033,642,1033,639,1034,637,1035,634,1037,632,1039,629,1041,628,1044,626,1046,625,1049,625,1049,625,1140,626,1140,626,1143,626,1145,625,1148,624,1150,622,1152,620,1154,618,1155,615,1156,613,1156,610,1156,610,1156,591" }, { "name": "PEMT, PEAMT, PEMPT, PEMT2, PLMT, PNMT", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "959,661,974,661,974,661,977,661,981,660,984,658,986,656,989,653,991,651,993,648,994,644,994,641,994,641,994,626" }, { "name": "AGK, CATC5, CTRCT38, MTDPS10, MULK", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1107,555,1202,555" }, { "name": "AGPS, ADAP-S, ADAS, ADHAPS, ADPS, ALDHPSY, RCDP3", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1201,630,1201,715" }, { "name": "CEPT1...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1201,879,1201,929" }, { "name": "LPCAT4, AGPAT7, AYTL3, LPAAT-eta, LPEAT2...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1201,928,1243,928" }, { "name": "PLA2G4B, HsT16992, cPLA2-beta...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1241,928,1282,928" }, { "name": "LPIN1, PAP1...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1078,811,1078,851" }, { "name": "CEPT1...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1078,851,1078,891" }, { "name": "PLA2G4B, HsT16992, cPLA2-beta...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1029,929,1079,929" }, { "name": "CEPT1...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1077,929,1127,929" }, { "name": "KDSR, DHSR, FVT1, SDR35C1", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "670,865,735,865" }, { "name": "CERS1, EPM8, LAG1, LASS1, UOG1...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "734,865,800,865" }, { "name": "DEGS2, C14orf66, DES2, FADS8...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "798,865,858,865" }, { "name": "SGMS2, SMS2...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "857,864,857,931" }, { "name": "GALC...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "856,865,928,865" }, { "name": "GAL3ST1, CST", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "928,865,993,865" }, { "name": "ACER1, ALKCDase1, ASAH3...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "857,866,857,808" }, { "name": "SGPL1, S1PL, SPL", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "857,721,857,626" }, { "name": "SPTLC1, HSAN1, HSN1, LBC1, LCB1, SPT1, SPTI...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "671,864,671,927,671,927,671,930,672,934,674,937,676,939,679,942,681,944,684,946,688,947,691,947,691,947,2184,947,2184,947,2187,947,2191,948,2194,950,2196,952,2199,955,2201,957,2203,960,2204,964,2204,967,2204,967,2204,1189,2204,1189,2204,1192,2205,1196,2207,1199,2209,1201,2212,1204,2214,1206,2217,1208,2221,1209,2224,1209,2224,1209,2287,1209" }, { "name": "SPTLC1, HSAN1, HSN1, LBC1, LCB1, SPT1, SPTI...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "671,864,671,927,671,927,671,930,672,934,674,937,676,939,679,942,681,944,684,946,688,947,691,947,691,947,1399,947,1399,947,1402,947,1406,948,1409,950,1411,952,1414,955,1416,957,1418,960,1419,964,1419,967,1419,967,1419,1280,1419,1280,1419,1283,1418,1287,1416,1290,1414,1292,1411,1295,1409,1297,1406,1299,1402,1300,1399,1300,1399,1300,1356,1300" }, { "name": "ALOX12, 12-LOX, 12S-LOX, LOG12", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "572,592,808,592" }, { "name": "ALOX12B, 12R-LOX, ARCI2", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "572,592,722,592,722,592,725,592,729,591,732,589,734,587,737,584,739,582,741,579,742,575,742,572,742,572,742,556" }, { "name": "ALOX15B, 15-LOX-2", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "572,592,656,592,656,592,659,592,663,591,666,589,668,587,671,584,673,582,675,579,676,575,676,572,676,572,676,556" }, { "name": "CYP2B6, CPB6, CYP2B, CYP2B7, CYP2B7P, CYPIIB6, EFVM, IIB1, P450...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "573,591,573,731" }, { "name": "CYP2B6, CPB6, CYP2B, CYP2B7, CYP2B7P, CYPIIB6, EFVM, IIB1, P450...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "573,591,573,680,573,680,573,683,574,687,576,690,578,692,581,695,583,697,586,699,590,700,593,700,593,700,630,700" }, { "name": "EPHX2, CEH, SEH", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "630,700,693,700" }, { "name": "CYP2B6, CPB6, CYP2B, CYP2B7, CYP2B7P, CYPIIB6, EFVM, IIB1, P450...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "573,591,573,644,573,644,573,647,574,651,576,654,578,656,581,659,583,661,586,663,590,664,593,664,593,664,630,664" }, { "name": "EPHX2, CEH, SEH", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "630,664,693,664" }, { "name": "CYP2B6, CPB6, CYP2B, CYP2B7, CYP2B7P, CYPIIB6, EFVM, IIB1, P450...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "573,591,573,607,573,607,573,610,574,614,576,617,578,619,581,622,583,624,586,626,590,627,593,627,593,627,630,627" }, { "name": "EPHX2, CEH, SEH", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "630,627,693,627" }, { "name": "CYP2U1, P450TEC, SPG49, SPG56...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "500,487,553,487,553,487,556,487,560,488,563,490,565,492,568,495,570,497,572,500,573,504,573,507,573,507,573,593" }, { "name": "ALOX5, 5-LO, 5-LOX, 5LPG, LOG5", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "410,556,502,556" }, { "name": "LTC4S", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "411,555,411,609" }, { "name": "GGT1, CD224, D22S672, D22S732, GGT, GGT_1, GTG...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "411,607,411,642" }, { "name": "PTGS1, COX1, COX3, PCOX1, PES-1, PGG/HS, PGHS-1, PGHS1, PHS1, PTGHS...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "364,592,574,592" }, { "name": "PTGS1, COX1, COX3, PCOX1, PES-1, PGG/HS, PGHS-1, PGHS1, PHS1, PTGHS...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "301,592,366,592" }, { "name": "PTGES3, P23, TEBP, cPGES...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "204,592,303,592" }, { "name": "ALOX15, 12-LOX, 15-LOX-1, 15LOX-1...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "443,628,443,612,443,612,443,609,444,605,446,602,448,600,451,597,453,595,456,593,460,592,463,592,463,592,574,592" }, { "name": "CYP2C8, CPC8, CYPIIC8, MP-12/MP-20...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "443,626,443,664" }, { "name": "CYP2J2, CPJ2, CYPIIJ2", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "443,664,443,700" }, { "name": "CYP2C8, CPC8, CYPIIC8, MP-12/MP-20...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "353,664,353,647,353,647,353,644,354,640,356,637,358,635,361,632,363,630,366,628,370,627,373,627,373,627,444,627" }, { "name": "CYP2J2, CPJ2, CYPIIJ2", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "353,662,353,698" }, { "name": "TBXAS1, BDPLT14, CYP5, CYP5A1, GHOSAL, THAS, TS, TXAS, TXS", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "302,526,302,593" }, { "name": "FAM213B, C1orf93", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "204,550,282,550,282,550,285,550,289,551,292,553,294,555,297,558,299,560,301,563,302,567,302,570,302,570,302,593" }, { "name": "CBR1, CBR, SDR21C1, hCBR1...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "205,548,205,593" }, { "name": "PTGIS, CYP8, CYP8A1, PGIS, PTGI", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "302,591,302,628" }, { "name": "HPGDS, GSTS, GSTS1, GSTS1-1, PGD2, PGDS...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "223,628,223,612,223,612,223,609,224,605,226,602,228,600,231,597,233,595,236,593,240,592,243,592,243,592,303,592" }, { "name": "PLA2G4B, HsT16992, cPLA2-beta...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "573,593,573,546,573,546,573,543,574,539,576,536,578,534,581,531,583,529,586,527,590,526,593,526,593,526,961,526" }, { "name": "CYP4F8, CPF8, CYPIVF8...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "502,521,553,521,553,521,556,521,560,522,563,524,565,526,568,529,570,531,572,534,573,538,573,541,573,541,573,593" }, { "name": "ALOX5, 5-LO, 5-LOX, 5LPG, LOG5", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "502,556,553,556,553,556,556,556,560,557,563,559,565,561,568,564,570,566,572,569,573,573,573,576,573,576,573,593" }, { "name": "CYP1A2, CP12, P3-450, P450(PA)...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "366,743,524,743" }, { "name": "ACOX1, ACOX, PALMCOX, SCOX...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1211,425,1261,425" }, { "name": "ACAA1, ACAA, PTHIO, THIO", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1158,469,1213,469" }, { "name": "ACOX1, ACOX, PALMCOX, SCOX...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1108,469,1158,469" }, { "name": "ACAA1, ACAA, PTHIO, THIO", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1108,508,1158,508" }, { "name": "PCYT2, ET", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "916,627,856,627" }, { "name": "QPRT, HEL-S-90n, QPRTase", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3523,1728,3523,1797" }, { "name": "LAMA3, BM600, E170, LAMNA, LOCS...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3573,1796,3522,1796" }, { "name": "NADSYN1", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3572,1795,3572,1863" }, { "name": "BST1, CD157...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3331,1861,3331,1870,3331,1870,3331,1874,3333,1879,3335,1883,3338,1886,3341,1889,3344,1892,3348,1894,3353,1896,3357,1896,3357,1896,3546,1896,3546,1896,3550,1896,3555,1894,3559,1892,3562,1889,3565,1886,3568,1883,3570,1879,3572,1874,3572,1870,3572,1870,3572,1861" }, { "name": "NAPRT, NAPRT1, PP3856", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3523,1797,3523,1788,3523,1788,3523,1784,3521,1779,3519,1775,3516,1772,3513,1769,3510,1766,3506,1764,3501,1762,3497,1762,3497,1762,3357,1762,3357,1762,3353,1762,3348,1764,3344,1766,3341,1769,3338,1772,3335,1775,3333,1779,3331,1784,3331,1788,3331,1788,3331,1797" }, { "name": "NADK2, C5orf33, DECRD, MNADK, NADKD1...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3572,1861,3572,1926" }, { "name": "NNMT", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3331,1861,3331,1935" }, { "name": "AOX1, AO, AOH1", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3331,1933,3331,2013" }, { "name": "MGLL, HU-K5, HUK5, MAGL, MGL", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1108,556,1108,546,1108,546,1108,543,1109,539,1111,536,1113,534,1116,531,1118,529,1121,527,1125,526,1128,526,1128,526,1196,526" }, { "name": "PLD4, C14orf175...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "959,526,1136,526,1136,526,1139,526,1143,527,1146,529,1148,531,1151,534,1153,536,1155,539,1156,543,1156,546,1156,546,1156,593" }, { "name": "PTDSS1, LMHD, PSS1, PSSA", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "959,526,1038,526,1038,526,1041,526,1045,527,1048,529,1050,531,1053,534,1055,536,1057,539,1058,543,1058,546,1058,546,1058,662" }, { "name": "PEMT, PEAMT, PEMPT, PEMT2, PLMT, PNMT", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "959,526,974,526,974,526,977,526,981,527,984,529,986,531,989,534,991,536,993,539,994,543,994,546,994,546,994,559" }, { "name": "CEL, BAL, BSDL, BSSL, CELL, CEase, FAP, FAPP, LIPA, MODY8...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "961,592,954,592,954,592,951,592,947,593,944,595,942,597,939,600,937,602,935,605,934,609,934,612,934,612,934,692" }, { "name": "AOX1, AO, AOH1", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3330,1934,3374,1934,3374,1934,3377,1934,3381,1935,3384,1937,3386,1939,3389,1942,3391,1944,3393,1947,3394,1951,3394,1954,3394,1954,3394,2013" }, { "name": "IDI1, IPP1, IPPI1...", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "494,1424,605,1424" }, { "name": "FDPS, FPPS, FPS, POROK9...", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "375,1424,496,1424" }, { "name": "FDPS, FPPS, FPS, POROK9...", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "404,1424,437,1424,437,1424,439,1424,441,1425,443,1426,444,1427,446,1429,447,1430,448,1432,449,1434,449,1436,449,1436,449,1439,449,1439,449,1441,450,1443,451,1445,452,1446,454,1448,455,1449,457,1450,459,1451,461,1451,461,1451,592,1451,592,1451,594,1451,596,1450,598,1449,599,1448,601,1446,602,1445,603,1443,604,1441,604,1439,604,1439,604,1422" }, { "name": "FDPS, FPPS, FPS, POROK9...", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "309,1507,309,1420,309,1420,309,1417,310,1415,311,1413,313,1410,314,1409,317,1407,319,1406,321,1405,324,1405,324,1405,589,1405,589,1405,591,1405,594,1406,596,1407,598,1409,600,1410,602,1413,603,1415,604,1417,604,1420,604,1420,604,1425" }, { "name": "FDPS, FPPS, FPS, POROK9...", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "309,1507,309,1449,309,1449,309,1445,311,1441,313,1437,315,1433,318,1430,322,1428,326,1426,330,1424,334,1424,334,1424,377,1424" }, { "name": "TRIT1, GRO1, IPPT, IPT, IPTase, MOD5, hGRO1", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "495,1345,495,1425" }, { "name": "AOC2, DAO2, RAO, SSAO...", "fgcolor": "#F06292", "bgcolor": "#FFFFFF", "type": "line", "coords": "3278,1616,3278,1700" }, { "name": "AOC2, DAO2, RAO, SSAO...", "fgcolor": "#F06292", "bgcolor": "#FFFFFF", "type": "line", "coords": "2897,1888,2957,1888" }, { "name": "NAT2, AAC2, NAT-2, PNAT...", "fgcolor": "#F06292", "bgcolor": "#FFFFFF", "type": "line", "coords": "3081,365,3131,365" }, { "name": "CYP1A2, CP12, P3-450, P450(PA)...", "fgcolor": "#F06292", "bgcolor": "#FFFFFF", "type": "line", "coords": "3082,366,3082,314" }, { "name": "CYP1A2, CP12, P3-450, P450(PA)", "fgcolor": "#F06292", "bgcolor": "#FFFFFF", "type": "line", "coords": "2893,416,3062,416,3062,416,3065,416,3069,415,3072,413,3074,411,3077,408,3079,406,3081,403,3082,399,3082,396,3082,396,3082,364" }, { "name": "DOLK, CDG1M, DK, DK1, SEC59, TMEM15", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "668,99,729,99" }, { "name": "ALG6, CDG1C", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "913,178,913,144,913,144,913,141,912,139,911,136,909,134,907,132,905,130,902,129,900,128,897,128,897,128,891,128,891,128,888,128,886,129,883,130,881,132,879,134,877,136,876,139,875,141,875,144,875,144,875,199" }, { "name": "ALG6, CDG1C", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "913,68,913,182" }, { "name": "ALG8, CDG1H", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "913,179,913,227" }, { "name": "ALG10B, ALG10, KCR1...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "913,220,913,280" }, { "name": "DAD1, OST2...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "913,393,913,338,913,338,913,335,914,333,915,330,917,328,919,326,921,324,924,323,926,322,929,322,929,322,937,322,937,322,940,322,942,323,945,324,947,326,949,328,951,330,952,333,953,335,953,338,953,338,953,379" }, { "name": "DAD1, OST2...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "953,223,953,306,953,306,953,309,952,311,951,314,949,316,947,318,945,320,942,321,940,322,937,322,937,322,929,322,929,322,926,322,924,321,921,320,919,318,917,316,915,314,914,311,913,309,913,306,913,306,913,277" }, { "name": "MOGS, CDG2B, CWH41, DER7, GCS1", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "953,226,953,40,953,40,953,37,954,33,956,30,958,28,961,25,963,23,966,21,970,20,973,20,973,20,984,20" }, { "name": "GANAB, G2AN, GIIA, GLUII, PKD3", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "983,19,983,63" }, { "name": "MAN1A2, MAN1B...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "983,103,983,138" }, { "name": "MGAT1, GLCNAC-TI, GLCT1, GLYT1, GNT-1, GNT-I, GnTI, MGAT", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "983,136,983,179" }, { "name": "MAN2A2, MANA2X...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "983,178,983,231" }, { "name": "MGAT2, CDG2A, CDGS2, GLCNACTII, GNT-II, GNT2", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "983,229,983,297" }, { "name": "MGAT3, GNT-III, GNT3", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "938,296,985,296" }, { "name": "MGAT4B, GNT-IV, GNT-IVB...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "982,296,1010,296,1010,296,1013,296,1015,297,1018,298,1020,300,1022,302,1024,304,1025,307,1026,309,1026,312,1026,312,1026,328" }, { "name": "MGAT5B, GnT-IX, GnT-VB...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1026,326,1026,358" }, { "name": "MGAT4C, GNTIVH, HGNT-IV-H", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1026,357,1026,409" }, { "name": "FUT8", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "983,295,983,328" }, { "name": "B4GALT1, B4GAL-T1, CDG2D, GGTB2, GT1, GTB, beta4Gal-T1...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "983,326,983,358" }, { "name": "ST6GAL1, SIAT1, ST6GalI, ST6N...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "983,357,983,409" }, { "name": "MAN1A2, MAN1B...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "982,104,1032,104" }, { "name": "POC1B-GALNT4...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1284,104,1390,104" }, { "name": "POC1B-GALNT4...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1355,138,1355,124,1355,124,1355,121,1354,117,1352,114,1350,112,1347,109,1345,107,1342,105,1338,104,1335,104,1335,104,1282,104" }, { "name": "C1GALT1C1, C1GALT2, C38H2-L1, COSMC, HSPC067, MST143, TNPS...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1221,104,1297,104" }, { "name": "GCNT1, C2GNT, C2GNT-L, C2GNT1, G6NT, NACGT2, NAGCT2...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1147,104,1222,104" }, { "name": "ST3GAL1, Gal-NAc6S, SIAT4A, SIATFL, ST3GalA, ST3GalA.1, ST3GalIA, ST3GalIA,1, ST3O...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1222,105,1222,36" }, { "name": "ST6GALNAC1, HSY11339, SIAT7A, ST6GalNAcI, STYI", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1146,37,1223,37" }, { "name": "GCNT1, C2GNT, C2GNT-L, C2GNT1, G6NT, NACGT2, NAGCT2", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1283,105,1283,19" }, { "name": "B4GALT7, EDSP1, EDSSLA, XGALT1, XGPT1", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1355,195,1355,232" }, { "name": "B3GALT6, EDSP2, SEMDJL1, beta3GalT6", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1355,230,1355,260" }, { "name": "B3GAT3, GLCATI, JDSCD, glcUAT-I", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1355,258,1355,305" }, { "name": "CSGALNACT2, CHGN2, ChGn-2, GALNACT-2, GALNACT2, PRO0082, beta4GalNAcT...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1355,302,1355,374" }, { "name": "CHSY1, CHSY, CSS1, ChSy-1, TPBS...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1356,373,1300,373" }, { "name": "PIGP, DCRC, DCRC-S, DSCR5, DSRC, PIG-P...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1241,662,1241,578" }, { "name": "PIGL, CHIME", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1241,584,1241,487" }, { "name": "PIGW, Gwt1, HPMRS5", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1240,489,1296,489" }, { "name": "PIGX, PIG-X...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1295,409,1295,490" }, { "name": "PIGN, MCAHS, MCAHS1, MCD4, MDC4, PIG-N", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1295,410,1356,410" }, { "name": "PIGV, GPI-MT-II, HPMRS1, PIG-V", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1353,410,1414,410" }, { "name": "GBA, GBA1, GCB, GLUC...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "857,864,857,878,857,878,857,881,856,883,855,886,853,888,851,890,849,892,846,893,844,894,841,894,841,894,482,894,482,894,479,894,477,893,474,892,472,890,470,888,468,886,467,883,466,881,466,878,466,878,466,491" }, { "name": "B3GNT5, B3GN-T5, beta3Gn-T5", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "301,232,467,232" }, { "name": "FUT1, H, HH, HSC...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "117,231,117,297" }, { "name": "FUT3, CD174, FT3B, FucT-III, LE, Les", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "117,295,117,355" }, { "name": "FUT3, CD174, FT3B, FucT-III, LE, Les", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "58,232,118,232" }, { "name": "ST3GAL4, CGS23, NANTA3, SAT3, SIAT4, SIAT4C, ST3GalIV, STZ...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "117,233,117,178" }, { "name": "FUT3, CD174, FT3B, FucT-III, LE, Les", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "117,179,117,129" }, { "name": "ABO, A3GALNT, A3GALT1, GTB, NAGAT", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "58,296,118,296" }, { "name": "FUT3, CD174, FT3B, FucT-III, LE, Les", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "59,295,59,355" }, { "name": "ABO, A3GALNT, A3GALT1, GTB, NAGAT", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "116,296,176,296" }, { "name": "FUT3, CD174, FT3B, FucT-III, LE, Les", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "175,295,175,355" }, { "name": "GLB1, EBP, ELNR1, MPS4B...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "466,231,466,492" }, { "name": "B4GALT1, B4GAL-T1, CDG2D, GGTB2, GT1, GTB, beta4Gal-T1...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "302,231,302,297" }, { "name": "FUT1, H, HH, HSC...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "302,295,302,355" }, { "name": "FUT9, Fuc-TIX...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "302,353,302,408" }, { "name": "ST3GAL6, SIAT10, ST3GALVI", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "303,296,253,296" }, { "name": "FUT3, CD174, FT3B, FucT-III, LE, Les...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "205,296,255,296" }, { "name": "FUT9, Fuc-TIX...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "388,264,318,264,318,264,315,264,313,265,310,266,308,268,306,270,304,272,303,275,302,277,302,280,302,280,302,297" }, { "name": "B3GNT3, B3GAL-T8, B3GN-T3, B3GNT-3, HP10328, TMEM3, beta3Gn-T3...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "301,296,388,296" }, { "name": "B4GALT1, B4GAL-T1, CDG2D, GGTB2, GT1, GTB, beta4Gal-T1...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "387,295,387,355" }, { "name": "GCNT2, CCAT, CTRCT13, GCNT2C, GCNT5, IGNT, II, NACGT1, NAGCT1, ULG3, bA360O19.2, bA421M1.1", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "387,353,387,408" }, { "name": "ABO, A3GALNT, A3GALT1, GTB, NAGAT", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "232,354,303,354" }, { "name": "FUT1, H, HH, HSC...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "233,408,233,460" }, { "name": "ABO, A3GALNT, A3GALT1, GTB, NAGAT", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "233,458,233,521" }, { "name": "B3GALT5, B3GalT-V, B3GalTx, B3T5, GLCT5, beta-1,3-GalTase_5, beta-3-Gx-T5, beta3Gal-T5...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "303,232,116,232" }, { "name": "ABO, A3GALNT, A3GALT1, GTB, NAGAT", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "301,354,346,354" }, { "name": "A4GALT, A14GALT, A4GALT1, Gb3S, P(k), P1, P1PK, PK", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "466,233,466,153" }, { "name": "B3GALNT1, B3GALT3, GLCT3, GLOB, Gb4Cer, P, P1, beta3Gal-T3, galT3", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "465,154,521,154" }, { "name": "B3GALT5, B3GalT-V, B3GalTx, B3T5, GLCT5, beta-1,3-GalTase_5, beta-3-Gx-T5, beta3Gal-T5", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "519,154,576,154" }, { "name": "ST3GAL1, Gal-NAc6S, SIAT4A, SIATFL, ST3GalA, ST3GalA.1, ST3GalIA, ST3GalIA,1, ST3O...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "574,154,630,154" }, { "name": "GBGT1, A3GALNT, FS, UNQ2513", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "520,203,520,153" }, { "name": "FUT1, H, HH, HSC...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "575,203,575,153" }, { "name": "ST3GAL5, SATI, SIAT9, SIATGM3S, SPDRS, ST3GalV", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "465,232,638,232" }, { "name": "B4GALNT1, GALGT, GALNACT, GalNAc-T, SPG26...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "637,231,637,281" }, { "name": "GLB1, EBP, ELNR1, MPS4B...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "637,279,637,329" }, { "name": "ST3GAL1, Gal-NAc6S, SIAT4A, SIATFL, ST3GalA, ST3GalA.1, ST3GalIA, ST3GalIA,1, ST3O...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "637,329,637,379" }, { "name": "ST8SIA5, SIAT8-E, SIAT8E, ST8SiaV", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "637,377,637,427" }, { "name": "ST8SIA1, GD3S, SIAT8, SIAT8-A, SIAT8A, ST8SiaI", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "636,232,712,232" }, { "name": "B4GALNT1, GALGT, GALNACT, GalNAc-T, SPG26", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "711,231,711,281" }, { "name": "B3GALT4, BETA3GALT4, GALT2, GALT4", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "711,281,711,331" }, { "name": "ST3GAL1, Gal-NAc6S, SIAT4A, SIATFL, ST3GalA, ST3GalA.1, ST3GalIA, ST3GalIA,1, ST3O...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "711,330,711,379" }, { "name": "ST8SIA5, SIAT8-E, SIAT8E, ST8SiaV", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "711,377,711,428" }, { "name": "ST8SIA5, SIAT8-E, SIAT8E, ST8SiaV...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "710,232,755,232" }, { "name": "B4GALNT1, GALGT, GALNACT, GalNAc-T, SPG26", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "754,231,754,281" }, { "name": "B3GALT4, BETA3GALT4, GALT2, GALT4", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "754,280,754,330" }, { "name": "B4GALNT1, GALGT, GALNACT, GalNAc-T, SPG26", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "465,232,542,232,542,232,545,232,549,233,552,235,554,237,557,240,559,242,561,245,562,249,562,252,562,252,562,282" }, { "name": "B3GALT4, BETA3GALT4, GALT2, GALT4", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "562,280,562,330" }, { "name": "ST3GAL1, Gal-NAc6S, SIAT4A, SIATFL, ST3GalA, ST3GalA.1, ST3GalIA, ST3GalIA,1, ST3O...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "562,329,562,379" }, { "name": "ST8SIA5, SIAT8-E, SIAT8E, ST8SiaV", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "562,377,562,427" }, { "name": "ST6GALNAC6, SIAT7-F, SIAT7F, ST6GALNACVI", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "588,378,638,378" }, { "name": "ST6GALNAC6, SIAT7-F, SIAT7F, ST6GALNACVI", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "662,378,712,378" }, { "name": "ST6GALNAC3, PRO7177, SIAT7C, ST6GALNACIII, STY...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "518,378,563,378" }, { "name": "SLC33A1, ACATN, AT-1, AT1, CCHLND, SPG42", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "711,151,711,233" }, { "name": "SLC33A1, ACATN, AT-1, AT1, CCHLND, SPG42", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "754,151,754,233" }, { "name": "ALG14, CMS15...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,98,832,143" }, { "name": "ALG2, CDG1I, CDGIi, CMS14, CMSTA3, NET38, hALPG2", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,181,832,226" }, { "name": "ALG2, CDG1I, CDGIi, CMS14, CMSTA3, NET38, hALPG2", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,225,832,270" }, { "name": "ALG11, CDG1P, GT8", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,269,832,316" }, { "name": "DPAGT1, ALG7, CDG-Ij, CDG1J, CMS13, CMSTA2, D11S366, DGPT, DPAGT, DPAGT2, G1PT, GPT, UAGT, UGAT", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "727,99,834,99" }, { "name": "ALG5, bA421P11.2", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "728,100,728,85,728,85,728,82,729,80,730,77,732,75,734,73,736,71,739,70,741,69,744,69,744,69,914,69" }, { "name": "CMBL, JS-1", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "2119,1761,2180,1761" }, { "name": "ADH5, ADH-3, ADHX, FALDH, FDH, GSH-FDH, GSNOR, HEL-S-60p", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "2138,1154,2183,1154" }, { "name": "ALDH2, ALDH-E2, ALDHI, ALDM...", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "2037,1154,2141,1154" }, { "name": "ADH5, ADH-3, ADHX, FALDH, FDH, GSH-FDH, GSNOR, HEL-S-60p", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "2139,1089,2184,1089" }, { "name": "ALDH2, ALDH-E2, ALDHI, ALDM...", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "2038,1089,2141,1089" }, { "name": "ALDH2, ALDH-E2, ALDHI, ALDM...", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "1976,1760,1976,1873" }, { "name": "EPHX2, CEH, SEH", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "1571,1470,1490,1470" }, { "name": "ALDH3A1, ALDH3, ALDHIII...", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "2373,1550,2373,1776" }, { "name": "CMBL, JS-1", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "1037,1740,1037,1777" }, { "name": "ADAM29, CT73, svph1", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "712,2092,762,2092" }, { "name": "ECHS1, ECHS1D, SCEH...", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "997,1578,997,1628" }, { "name": "EHHADH, ECHD, FRTS3, L-PBE, LBFP, LBP, PBFE...", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "997,1626,997,1677" }, { "name": "PON1, ESA, MVCD5, PON...", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "2184,2077,2230,2077" }, { "name": "CMBL, JS-1", "fgcolor": "#DA8E82", "bgcolor": "#FFFFFF", "type": "line", "coords": "976,1858,1017,1858,1017,1858,1020,1858,1024,1857,1027,1855,1029,1853,1032,1850,1034,1848,1036,1845,1037,1841,1037,1838,1037,1838,1037,1811" }, { "name": "ACP1, HAAP, LMW-PTP, LMWPTP...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3157,604,3157,655" }, { "name": "ENPP1, ARHR2, COLED, M6S1, NPP1, NPPS, PC-1, PCA1, PDNP1...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3157,704,3157,653" }, { "name": "PNPO, HEL-S-302, PDXPO", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3418,380,3418,444" }, { "name": "PNPO, HEL-S-302, PDXPO", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3418,382,3418,318" }, { "name": "PHOSPHO2...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3417,443,3482,443" }, { "name": "PNPO, HEL-S-302, PDXPO", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3481,444,3481,380" }, { "name": "PNPO, HEL-S-302, PDXPO", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3481,382,3481,318" }, { "name": "PHOSPHO2...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3482,319,3417,319" }, { "name": "PHOSPHO2...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3417,381,3482,381" }, { "name": "AOX1, AO, AOH1", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3419,381,3359,381" }, { "name": "PANK1, PANK...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3022,1262,3082,1262" }, { "name": "PPCS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3081,1262,3141,1262" }, { "name": "COASY, DPCK, NBIA6, NBP, PPAT, UKR1, pOV-2", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3262,1262,3322,1262" }, { "name": "PPCDC, MDS018, PPC-DC, coaC", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3140,1262,3207,1262" }, { "name": "HLCS, HCS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "2839,2011,2909,2011" }, { "name": "HLCS, HCS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "2908,2011,2978,2011" }, { "name": "GCH1, DYT14, DYT5, DYT5a, GCH, GTP-CH-1, GTPCH1, HPABH4B", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3213,190,3213,234" }, { "name": "GCH1, DYT14, DYT5, DYT5a, GCH, GTP-CH-1, GTPCH1, HPABH4B", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3213,233,3213,293" }, { "name": "GCH1, DYT14, DYT5, DYT5a, GCH, GTP-CH-1, GTPCH1, HPABH4B", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3213,292,3213,352" }, { "name": "ALPI, IAP...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3213,350,3213,399" }, { "name": "FPGS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3213,605,3213,655" }, { "name": "DHFR, DHFRP1, DYR...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3303,654,3212,654" }, { "name": "DHFR, DHFRP1, DYR...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3213,653,3213,704" }, { "name": "DHFR, DHFRP1, DYR...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3212,703,3282,703,3282,703,3285,703,3289,702,3292,700,3294,698,3297,695,3299,693,3301,690,3302,686,3302,683,3302,683,3302,653" }, { "name": "MTHFR", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3481,653,3481,713" }, { "name": "FTCD, LCHC1", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3422,653,3422,713" }, { "name": "FTCD, LCHC1", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3302,653,3302,669,3302,669,3302,672,3303,676,3305,679,3307,681,3310,684,3312,686,3315,688,3319,689,3322,689,3322,689,3367,689" }, { "name": "ST20-MTHFS...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3365,689,3402,689,3402,689,3405,689,3409,688,3412,686,3414,684,3417,681,3419,679,3421,676,3422,672,3422,669,3422,669,3422,653" }, { "name": "AMT, GCE, GCST, GCVT, NKH...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3302,655,3302,620,3302,620,3302,617,3303,613,3305,610,3307,608,3310,605,3312,603,3315,601,3319,600,3322,600,3322,600,3461,600,3461,600,3464,600,3468,601,3471,603,3473,605,3476,608,3478,610,3480,613,3481,617,3481,620,3481,620,3481,655" }, { "name": "MTHFD1L, FTHFSDC1, MTC1THFS, dJ292B18.2...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3301,654,3366,654" }, { "name": "MTHFD2, NMDMC...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3364,654,3423,654" }, { "name": "MTHFD2, NMDMC...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3418,654,3478,654" }, { "name": "UROD, PCT, UPD", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3394,841,3444,841" }, { "name": "CPOX, CPO, CPX, HCP", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3442,841,3491,841" }, { "name": "PPOX, PPO, V290M, VP", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3489,841,3548,841" }, { "name": "FECH, EPP, FCE", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3595,841,3546,841" }, { "name": "MMAB, ATR, CFAP23, cblB, cob", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3490,906,3490,963" }, { "name": "ENPP1, ARHR2, COLED, M6S1, NPP1, NPPS, PC-1, PCA1, PDNP1...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3203,1262,3263,1262" }, { "name": "EARS2, COXPD12, MSE1, gluRS...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "2592,1830,2592,1260,2592,1260,2592,1257,2593,1253,2595,1250,2597,1248,2600,1245,2602,1243,2605,1241,2609,1240,2612,1240,2612,1240,3083,1240" }, { "name": "PSAT1, EPIP, NLS2, PSA, PSAT, PSATD", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3364,567,3424,567" }, { "name": "CYP1A2, CP12, P3-450, P450(PA)...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "424,805,424,763,424,763,424,760,425,756,427,753,429,751,432,748,434,746,437,744,441,743,444,743,444,743,524,743" }, { "name": "ALOX15, 12-LOX, 15-LOX-1, 15LOX-1", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "479,804,479,763,479,763,479,760,480,756,482,753,484,751,487,748,489,746,492,744,496,743,499,743,499,743,524,743" }, { "name": "EPHX2, CEH, SEH", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "573,729,573,779" }, { "name": "SPHK2, SK_2, SK-2, SPK_2, SPK-2...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "857,809,857,720" }, { "name": "MLYCD, MCD", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,1330,1627,1330,1627,1330,1624,1330,1620,1331,1617,1333,1615,1335,1612,1338,1610,1340,1608,1343,1607,1347,1607,1350,1607,1350,1607,1393" }, { "name": "DLAT, DLTA, PDC-E2, PDCE2...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,1208,1720,1331" }, { "name": "OAT, GACR, HOGA, OATASE, OKT", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3159,1527,3159,1626" }, { "name": "ACAT1, ACAT, MAT, T2, THIL...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "991,1021,991,986,991,986,991,983,992,979,994,976,996,974,999,971,1001,969,1004,967,1008,966,1011,966,1011,966,1607,966,1607,966,1610,966,1614,967,1617,969,1619,971,1622,974,1624,976,1626,979,1627,983,1627,986,1627,986,1628,1310,1628,1310,1628,1313,1629,1317,1631,1320,1633,1322,1636,1325,1638,1327,1641,1329,1645,1330,1648,1330,1648,1330,1721,1330" }, { "name": "PCCA...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "2076,1423,2076,1570" }, { "name": "PGAM4, PGAM-B, PGAM1, PGAM3, dJ1000K24.1...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,911,1720,1011" }, { "name": "DAO, DAAO, DAMOX, OXDA...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1729,1616,1729,1608,1729,1608,1729,1605,1730,1601,1732,1598,1734,1596,1737,1593,1739,1591,1742,1589,1746,1588,1749,1588,1749,1588,2391,1588,2391,1588,2394,1588,2398,1587,2401,1585,2403,1583,2406,1580,2408,1578,2410,1575,2411,1571,2411,1568,2411,1568,2411,1229,2411,1229,2411,1226,2412,1222,2414,1219,2416,1217,2419,1214,2421,1212,2424,1210,2428,1209,2431,1209,2431,1209,2482,1209" }, { "name": "SARDH, BPR-2, DMGDHL1, SAR, SARD, SDH...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2481,1087,2481,1210" }, { "name": "GLDC, GCE, GCSP, HYGN1", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2431,1267,2460,1267,2460,1267,2463,1267,2467,1266,2470,1264,2473,1262,2476,1259,2478,1257,2480,1254,2481,1250,2481,1247,2481,1247,2481,1208" }, { "name": "GAD1, CPSQ1, GAD, SCP...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2031,1509,2030,1509,2030,1509,2027,1509,2023,1508,2020,1506,2018,1504,2015,1501,2013,1499,2011,1496,2010,1492,2010,1489,2010,1489,2010,900,2010,900,2010,897,2011,893,2013,890,2015,888,2018,885,2020,883,2023,881,2027,880,2030,880,2030,880,2353,880,2353,880,2356,880,2360,879,2363,877,2365,875,2368,872,2370,870,2372,867,2373,863,2373,860,2373,860,2373,523,2373,523,2373,520,2374,516,2376,513,2378,511,2381,508,2383,506,2386,504,2390,503,2393,503,2393,503,2741,503" }, { "name": "AASS, LKR/SDH, LKRSDH, LORSDH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2243,1654,2291,1654" }, { "name": "AMY1A, AMY1...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1542,291,1542,268,1542,268,1542,265,1543,261,1545,258,1547,256,1550,253,1552,251,1555,249,1559,248,1562,248,1562,248,1588,248" }, { "name": "ALDOA, ALDA, GSD12, HEL-S-87p...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1314,716,1628,716" }, { "name": "G6PD, G6PD1", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1738,439,1865,439" }, { "name": "MCEE, GLOD2", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "2076,1568,2076,1895" }, { "name": "HAO2, GIG16, HAOX2...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1729,1614,1729,1688" }, { "name": "PGP, AUM, G3PP, PGPase", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1653,1687,1730,1687" }, { "name": "ACADM, ACAD1, MCAD, MCADH", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1973,1424,2077,1424" }, { "name": "ACSM1, BUCS1, MACS1...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "991,1432,991,1298" }, { "name": "ENO1, ENO1L1, HEL-S-17, MPB1, NNE, PPH...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,1008,1720,1111" }, { "name": "NAGS, AGAS, ARGA", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2592,1830,2592,1578,2592,1578,2592,1575,2593,1571,2595,1568,2597,1566,2600,1563,2602,1561,2605,1559,2609,1558,2612,1558,2612,1558,2698,1558" }, { "name": "CAD, CDG1Z, EIEE50", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2676,1931,2959,1931,2959,1931,2962,1931,2966,1930,2969,1928,2971,1926,2974,1923,2976,1921,2978,1918,2979,1914,2979,1911,2979,1911,2979,1515" }, { "name": "TYR, ATN, CMM8, OCA1, OCA1A, OCAIA, SHEP3", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2904,490,2969,490" }, { "name": "DCT, TRP-2, TYRP2", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2840,449,2905,449" }, { "name": "ALDH3A1, ALDH3, ALDHIII...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2909,618,2909,656" }, { "name": "GK, GK1, GKD...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1295,556,1295,546,1295,546,1295,543,1294,539,1292,536,1290,534,1287,531,1285,529,1282,527,1278,526,1275,526,1275,526,1194,526" }, { "name": "LTA4H", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "344,556,412,556" }, { "name": "UPB1, BUP1", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2103,731,2029,731" }, { "name": "EHHADH, ECHD, FRTS3, L-PBE, LBFP, LBP, PBFE...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2210,1485,2265,1485" }, { "name": "CS...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,1329,1720,1431,1720,1431,1720,1433,1720,1435,1721,1437,1721,1439,1722,1441,1723,1443,1724,1444,1724,1446,1725,1447,1725,1447,1728,1452,1728,1452,1729,1453,1730,1454,1731,1455,1733,1457,1735,1458,1737,1459,1738,1460,1740,1461,1742,1462,1742,1462,1747,1463,1747,1463,1749,1464,1750,1464,1752,1465,1754,1466,1757,1466,1759,1467,1761,1467,1762,1468,1764,1468,1764,1468,1785,1473" }, { "name": "CS...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1641,1476,1641,1475,1641,1475,1654,1470,1669,1467,1685,1464,1703,1463,1721,1462,1738,1463,1755,1465,1771,1469,1785,1473,1785,1473,1785,1474" }, { "name": "ALDH7A1, ATQ1, EPD, PDE", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2100,1411,2291,1411" }, { "name": "PCK1, PEPCK-C, PEPCK1, PEPCKC...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1642,1475,1642,1130,1642,1130,1642,1127,1643,1123,1645,1120,1647,1118,1650,1115,1652,1113,1655,1111,1659,1110,1662,1110,1662,1110,1721,1110" }, { "name": "PC, PCB", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1642,1476,1642,1229,1642,1229,1642,1226,1643,1222,1645,1219,1647,1217,1650,1214,1652,1212,1655,1210,1659,1209,1662,1209,1662,1209,1721,1209" }, { "name": "G6PC, G6PC1, G6PT, G6Pase, GSD1, GSD1a...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1678,439,1586,439" }, { "name": "TALDO1, TAL, TAL-H, TALDOR, TALH", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1816,565,1816,683" }, { "name": "TALDO1, TAL, TAL-H, TALDOR, TALH", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1676,526,1806,588,1806,588,1808,589,1809,591,1811,592,1812,594,1813,596,1815,598,1815,600,1816,602,1816,604,1816,604,1816,639,1816,639,1816,641,1815,643,1815,645,1814,647,1812,649,1811,651,1810,653,1808,655,1807,656,1807,656,1720,716" }, { "name": "TKT, HEL-S-48, HEL107, SDDHD, TK, TKT1...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1919,526,1675,526" }, { "name": "TKT, HEL-S-48, HEL107, SDDHD, TK, TKT1...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,717,1720,546,1720,546,1720,543,1721,539,1723,536,1725,534,1728,531,1730,529,1733,527,1737,526,1740,526,1740,526,1796,526,1796,526,1799,526,1803,527,1806,529,1808,531,1811,534,1813,536,1815,539,1816,543,1816,546,1816,546,1816,567" }, { "name": "TKT, HEL-S-48, HEL107, SDDHD, TK, TKT1...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1918,525,1918,696,1918,696,1918,699,1917,703,1915,706,1913,708,1910,711,1908,713,1905,715,1901,716,1898,716,1898,716,1719,716" }, { "name": "TKT, HEL-S-48, HEL107, SDDHD, TK, TKT1...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "2020,619,1934,619,1934,619,1931,619,1929,620,1926,621,1924,623,1922,625,1920,627,1919,630,1918,632,1918,635,1918,635,1918,666,1918,666,1918,669,1917,671,1916,674,1914,676,1912,678,1910,680,1907,681,1905,682,1902,682,1902,682,1815,682" }, { "name": "RPIA, RPI, RPIAD", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "2019,525,2019,619" }, { "name": "RPE, RPE2-1...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "2020,526,1917,526" }, { "name": "AK6, AD-004, CGI-137, CINAP, CIP, hCINAP...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2575,256,2575,306" }, { "name": "NT5C1B-RDH14...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2576,305,2501,305" }, { "name": "ADA", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2502,304,2502,354" }, { "name": "PNP, NP, PRO1837, PUNP", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2761,346,2761,363,2761,363,2761,366,2760,370,2758,373,2756,375,2753,378,2751,380,2748,382,2744,383,2741,383,2741,383,2522,383,2522,383,2519,383,2515,382,2512,380,2510,378,2507,375,2505,373,2503,370,2502,366,2502,363,2502,363,2502,353" }, { "name": "XDH, XAN1, XO, XOR", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2820,346,2820,450" }, { "name": "GUK1, GMK", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2964,256,2964,306" }, { "name": "NT5C1B-RDH14...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "3029,305,2963,305" }, { "name": "PNP, NP, PRO1837, PUNP", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "3028,304,3028,327,3028,327,3028,330,3027,334,3025,337,3023,339,3020,342,3018,344,3015,346,3011,347,3008,347,3008,347,2901,347" }, { "name": "HSD3B1, 3BETAHSD, HSD3B, HSDB3, HSDB3A, I, SDR11E1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "614,1729,614,1770" }, { "name": "CYP17A1, CPT7, CYP17, P450C17, S17AH", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "680,1730,741,1730" }, { "name": "DDC, AADC", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2704,579,2823,579" }, { "name": "MAOA, BRNRS, MAO-A...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2822,618,2822,656" }, { "name": "MAOA, BRNRS, MAO-A...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2943,578,2943,649" }, { "name": "MAOA, BRNRS, MAO-A...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2942,638,2976,638,2976,638,2980,638,2984,636,2988,634,2991,632,2995,629,2997,625,2999,621,3001,617,3001,613,3001,613,3001,578" }, { "name": "COMT, HEL-S-98n", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3000,579,3062,579" }, { "name": "MAOA, BRNRS, MAO-A...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3034,546,3093,546,3093,546,3098,546,3102,548,3106,550,3110,553,3114,557,3117,561,3119,565,3121,569,3121,574,3121,574,3121,580" }, { "name": "ATIC, AICAR, AICARFT, HEL-S-70p, IMPCHASE, PURH", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2761,121,2761,192" }, { "name": "UPRT, FUR1, UPP", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2577,399,2577,409,2577,409,2577,412,2576,416,2574,419,2572,421,2569,424,2567,426,2564,428,2560,429,2557,429,2557,429,2447,429,2447,429,2444,429,2440,428,2437,426,2435,424,2432,421,2430,419,2428,416,2427,412,2427,409,2427,409,2427,399" }, { "name": "CMPK2, NDK, TMPK2, TYKi, UMP-CMPK2...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2348,579,2429,579" }, { "name": "DCTD", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2428,656,2428,578" }, { "name": "AOX1, AO, AOH1", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2698,706,2755,706" }, { "name": "POLD3, P66, P68, PPP1R128...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2393,671,2393,605" }, { "name": "IL4I1, FIG1, LAAO, LAO...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2592,578,2592,707" }, { "name": "TPO, MSA, TDH2A, TPX", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2680,638,2620,638,2620,638,2615,638,2611,636,2607,634,2603,631,2599,627,2596,623,2594,619,2592,615,2592,610,2592,610,2592,578" }, { "name": "PAH, PH, PKU, PKU1", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2454,765,2454,607,2454,607,2454,602,2456,598,2458,594,2461,590,2465,586,2469,583,2473,581,2477,579,2482,579,2482,579,2593,579" }, { "name": "CHSY1, CHSY, CSS1, ChSy-1, TPBS...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1301,373,1252,373" }, { "name": "SC5D, ERG3, S5DES, SC5DL", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "925,1554,969,1554" }, { "name": "NME6, IPIA-ALPHA, NDK_6, NM23-H6...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2269,655,2350,655" }, { "name": "DUT, dUTPase...", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2270,654,2270,669,2270,669,2270,672,2271,676,2273,679,2275,681,2278,684,2280,686,2283,688,2287,689,2290,689,2290,689,2408,689,2408,689,2411,689,2415,688,2418,686,2420,684,2423,681,2425,679,2427,676,2428,672,2428,669,2428,669,2428,654" }, { "name": "DTYMK, CDC8, PP3731, TMPK, TYMK", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2348,655,2429,655" }, { "name": "QARS, GLNRS, MSCCA, PRO2195", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2789,1841,2697,1841,2697,1841,2694,1841,2690,1842,2687,1844,2685,1846,2682,1849,2680,1851,2678,1854,2677,1858,2677,1861,2677,1861,2677,1932" }, { "name": "GATC, 15E1.2...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2788,1840,2788,1950" }, { "name": "PAPSS2, ATPSK2, BCYM4, SK2...", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "2393,805,2393,855" }, { "name": "ALDH2, ALDH-E2, ALDHI, ALDM...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1868,1154,1839,1154,1839,1154,1836,1154,1832,1155,1829,1157,1827,1159,1824,1162,1822,1164,1820,1167,1819,1171,1819,1174,1819,1174,1819,1283" }, { "name": "AKR1A1, ALDR1, ALR, ARM, DD3, HEL-S-6...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1796,1154,1868,1154" }, { "name": "IDNK, C9orf103, bA522I20.2, hGntK", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "2064,302,2064,409,2064,409,2063,414,2062,419,2060,423,2056,428,2053,431,2048,435,2044,437,2039,438,2034,439,2034,439,2018,439" }, { "name": "RGN, GNL, HEL-S-41, RC, SMP30", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "2065,302,1975,302" }, { "name": "GLYCTK, HBEBP2, HBEBP4, HBeAgBP4A", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1912,1010,1719,1010" }, { "name": "PRPS1L1, PRPS1, PRPS3, PRPSL, PRS-III...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "2144,619,2019,619" }, { "name": "PKLR, PK1, PKL, PKR, PKRL, RPK...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,1109,1720,1210" }, { "name": "GPI, AMF, GNPI, NLK, PGI, PHI, SA-36, SA36", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1676,526,1719,526,1719,526,1722,526,1726,525,1729,523,1731,521,1734,518,1736,516,1738,513,1739,509,1739,506,1739,506,1739,438" }, { "name": "GPI, AMF, GNPI, NLK, PGI, PHI, SA-36, SA36", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1676,439,1740,439" }, { "name": "HYI, HT036", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1432,1787,1681,1787,1681,1787,1684,1787,1686,1786,1689,1785,1691,1783,1693,1781,1695,1779,1696,1776,1697,1774,1697,1771,1697,1771,1697,1746" }, { "name": "C00110", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "728", "y": "99", "width": "14", "height": "14" }, { "name": "C00157", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "960", "y": "526", "width": "14", "height": "14" }, { "name": "C00189", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "755", "y": "627", "width": "14", "height": "14" }, { "name": "C00114", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "807", "y": "558", "width": "14", "height": "14" }, { "name": "C00195", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "857", "y": "865", "width": "14", "height": "14" }, { "name": "C00187", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "614", "y": "1602", "width": "14", "height": "14" }, { "name": "C00280", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "800", "y": "1730", "width": "14", "height": "14" }, { "name": "C00096", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1347", "y": "603", "width": "14", "height": "14" }, { "name": "C00259", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2236", "y": "404", "width": "14", "height": "14" }, { "name": "C00006", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3572", "y": "1925", "width": "14", "height": "14" }, { "name": "C00143", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2343", "y": "1267", "width": "14", "height": "14" }, { "name": "C00135", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2341", "y": "1068", "width": "14", "height": "14" }, { "name": "C00166", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2515", "y": "764", "width": "14", "height": "14" }, { "name": "C00245", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2668", "y": "818", "width": "14", "height": "14" }, { "name": "C00010", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3321", "y": "1262", "width": "14", "height": "14" }, { "name": "C00032", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3594", "y": "841", "width": "14", "height": "14" }, { "name": "C00194", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3547", "y": "1201", "width": "14", "height": "14" }, { "name": "C00144", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2902", "y": "191", "width": "14", "height": "14" }, { "name": "C00035", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2964", "y": "191", "width": "14", "height": "14" }, { "name": "C00255", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3157", "y": "605", "width": "14", "height": "14" }, { "name": "C00061", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3157", "y": "654", "width": "14", "height": "14" }, { "name": "C00016", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3157", "y": "703", "width": "14", "height": "14" }, { "name": "C00250", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3418", "y": "381", "width": "14", "height": "14" }, { "name": "C00018", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3481", "y": "381", "width": "14", "height": "14" }, { "name": "C00143", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3481", "y": "654", "width": "14", "height": "14" }, { "name": "C00020", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2637", "y": "191", "width": "14", "height": "14" }, { "name": "C00212", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2637", "y": "269", "width": "14", "height": "14" }, { "name": "C00147", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2637", "y": "347", "width": "14", "height": "14" }, { "name": "C00002", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2502", "y": "191", "width": "14", "height": "14" }, { "name": "C00131", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2502", "y": "257", "width": "14", "height": "14" }, { "name": "C00015", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2349", "y": "401", "width": "14", "height": "14" }, { "name": "C00075", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2270", "y": "401", "width": "14", "height": "14" }, { "name": "C00063", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2270", "y": "489", "width": "14", "height": "14" }, { "name": "C00112", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2349", "y": "489", "width": "14", "height": "14" }, { "name": "C00055", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2427", "y": "489", "width": "14", "height": "14" }, { "name": "C00214", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2350", "y": "731", "width": "14", "height": "14" }, { "name": "C00178", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2270", "y": "731", "width": "14", "height": "14" }, { "name": "C00099", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2740", "y": "503", "width": "14", "height": "14" }, { "name": "C00129", "fgcolor": "#9EE284", "bgcolor": "#9EE284", "type": "circle", "x": "604", "y": "1424", "width": "14", "height": "14" }, { "name": "C00083", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "622", "y": "969", "width": "14", "height": "14" }, { "name": "C00052", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1498", "y": "313", "width": "14", "height": "14" }, { "name": "C00136", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "991", "y": "1300", "width": "14", "height": "14" }, { "name": "C00231", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1918", "y": "526", "width": "14", "height": "14" }, { "name": "C00279", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1816", "y": "566", "width": "14", "height": "14" }, { "name": "C00242", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2902", "y": "347", "width": "14", "height": "14" }, { "name": "C00268", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3387", "y": "351", "width": "14", "height": "14" }, { "name": "C00239", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2428", "y": "579", "width": "14", "height": "14" }, { "name": "C00079", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2454", "y": "763", "width": "14", "height": "14" }, { "name": "C00082", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2592", "y": "579", "width": "14", "height": "14" }, { "name": "C00086", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3329", "y": "1484", "width": "14", "height": "14" }, { "name": "C00235", "fgcolor": "#9EE284", "bgcolor": "#9EE284", "type": "circle", "x": "495", "y": "1424", "width": "14", "height": "14" }, { "name": "C00022", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1251", "y": "1756", "width": "14", "height": "14" }, { "name": "C00036", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1340", "y": "1755", "width": "14", "height": "14" }, { "name": "C00149", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1294", "y": "1780", "width": "14", "height": "14" }, { "name": "C00041", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1192", "y": "1756", "width": "14", "height": "14" }, { "name": "C00049", "fgcolor": "none", "bgcolor": "#CC99FF", "type": "circle", "x": "1378", "y": "1755", "width": "14", "height": "14" }, { "name": "C00197", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1433", "y": "1687", "width": "14", "height": "14" }, { "name": "C00160", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1729", "y": "1687", "width": "14", "height": "14" }, { "name": "C00058", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1729", "y": "1537", "width": "14", "height": "14" }, { "name": "C00048", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1729", "y": "1615", "width": "14", "height": "14" }, { "name": "C00236", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1484", "y": "1652", "width": "14", "height": "14" }, { "name": "C00118", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1484", "y": "1614", "width": "14", "height": "14" }, { "name": "C00085", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1484", "y": "1534", "width": "14", "height": "14" }, { "name": "C00117", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1367", "y": "1574", "width": "14", "height": "14" }, { "name": "C00199", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1367", "y": "1614", "width": "14", "height": "14" }, { "name": "C00231", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1419", "y": "1614", "width": "14", "height": "14" }, { "name": "C00003", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1458", "y": "1998", "width": "14", "height": "14" }, { "name": "C00004", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1457", "y": "1928", "width": "14", "height": "14" }, { "name": "C00080", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1492", "y": "1909", "width": "14", "height": "14" }, { "name": "C00080", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1492", "y": "2013", "width": "14", "height": "14" }, { "name": "C00080", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1619", "y": "1909", "width": "14", "height": "14" }, { "name": "C00080", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1619", "y": "2013", "width": "14", "height": "14" }, { "name": "C00080", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1689", "y": "1909", "width": "14", "height": "14" }, { "name": "C00080", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1689", "y": "2013", "width": "14", "height": "14" }, { "name": "C00007", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1724", "y": "1928", "width": "14", "height": "14" }, { "name": "C00001", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1723", "y": "1998", "width": "14", "height": "14" }, { "name": "C00080", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1759", "y": "1909", "width": "14", "height": "14" }, { "name": "C00080", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1759", "y": "2013", "width": "14", "height": "14" }, { "name": "C00002", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1794", "y": "1928", "width": "14", "height": "14" }, { "name": "C00009", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1791", "y": "1998", "width": "14", "height": "14" }, { "name": "C00232", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "1571", "y": "2033", "width": "14", "height": "14" }, { "name": "C00152", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2140", "y": "1551", "width": "14", "height": "14" }, { "name": "C00258", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1433", "y": "1747", "width": "14", "height": "14" }, { "name": "C00234", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1601", "y": "1537", "width": "14", "height": "14" }, { "name": "C00143", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1550", "y": "1615", "width": "14", "height": "14" }, { "name": "C00083", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1607", "y": "1392", "width": "14", "height": "14" }, { "name": "C00249", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1187", "y": "1375", "width": "14", "height": "14" }, { "name": "C00270", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1662", "y": "1030", "width": "14", "height": "14" }, { "name": "C00128", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1662", "y": "1074", "width": "14", "height": "14" }, { "name": "C00279", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1454", "y": "1495", "width": "14", "height": "14" }, { "name": "C00164", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "2164", "y": "1367", "width": "14", "height": "14" }, { "name": "C00154", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1357", "y": "1300", "width": "14", "height": "14" }, { "name": "C00043", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1662", "y": "799", "width": "14", "height": "14" }, { "name": "C00159", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1398", "y": "560", "width": "14", "height": "14" }, { "name": "C00181", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1918", "y": "404", "width": "14", "height": "14" }, { "name": "C00191", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1976", "y": "267", "width": "14", "height": "14" }, { "name": "C00167", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1824", "y": "267", "width": "14", "height": "14" }, { "name": "C00130", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2761", "y": "191", "width": "14", "height": "14" }, { "name": "C00213", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2481", "y": "1088", "width": "14", "height": "14" }, { "name": "C00120", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "2840", "y": "2011", "width": "14", "height": "14" }, { "name": "C00170", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3109", "y": "1714", "width": "14", "height": "14" }, { "name": "C00148", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3074", "y": "1684", "width": "14", "height": "14" }, { "name": "C00097", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2516", "y": "1856", "width": "14", "height": "14" }, { "name": "C00014", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2918", "y": "1516", "width": "14", "height": "14" }, { "name": "C00123", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2764", "y": "1469", "width": "14", "height": "14" }, { "name": "C00073", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2646", "y": "1645", "width": "14", "height": "14" }, { "name": "C00169", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2979", "y": "1516", "width": "14", "height": "14" }, { "name": "C00051", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2513", "y": "1979", "width": "14", "height": "14" }, { "name": "C00272", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3344", "y": "351", "width": "14", "height": "14" }, { "name": "C00219", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "573", "y": "592", "width": "14", "height": "14" }, { "name": "C00246", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "991", "y": "1431", "width": "14", "height": "14" }, { "name": "C00206", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2575", "y": "257", "width": "14", "height": "14" }, { "name": "C00008", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2575", "y": "191", "width": "14", "height": "14" }, { "name": "C00039", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2393", "y": "607", "width": "14", "height": "14" }, { "name": "C00217", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2727", "y": "1856", "width": "14", "height": "14" }, { "name": "C00224", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "2393", "y": "854", "width": "14", "height": "14" }, { "name": "C00084", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1867", "y": "1154", "width": "14", "height": "14" }, { "name": "C00258", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1910", "y": "1010", "width": "14", "height": "14" }, { "name": "C00198", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1976", "y": "302", "width": "14", "height": "14" }, { "name": "C00119", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "2143", "y": "619", "width": "14", "height": "14" }, { "name": "C00117", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "2019", "y": "619", "width": "14", "height": "14" }, { "name": "C00168", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1433", "y": "1787", "width": "14", "height": "14" }, { "name": "C00116", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1195", "y": "526", "width": "14", "height": "14" }, { "name": "C00093", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1294", "y": "555", "width": "14", "height": "14" }, { "name": "C00046", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2450", "y": "330", "width": "14", "height": "14" }, { "name": "C00105", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2427", "y": "401", "width": "14", "height": "14" }, { "name": "C00262", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2761", "y": "347", "width": "14", "height": "14" }, { "name": "C00381", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "668", "y": "99", "width": "14", "height": "14" }, { "name": "C01246", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "913", "y": "69", "width": "14", "height": "14" }, { "name": "ALG3, CDG1D, CDGS4, CDGS6, D16Ertd36e, NOT56L, Not56, not", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,359,832,408" }, { "name": "ALG3, CDG1D, CDGS4, CDGS6, D16Ertd36e, NOT56L, Not56, not", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "780,379,816,379,816,379,819,379,821,380,824,381,826,383,828,385,830,387,831,390,832,392,832,395,832,395,832,402" }, { "name": "ALG9, CDG1L, DIBD1, GIKANIS, LOH11CR1J", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "832,407,832,412,832,412,832,415,833,418,835,421,837,423,839,425,841,427,844,429,847,430,850,430,850,430,857,430,857,430,860,430,863,429,866,427,868,425,870,423,872,421,874,418,875,415,875,412,875,412,875,376" }, { "name": "ALG12, CDG1G, ECM39, PP14673, hALG12", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "875,380,875,294" }, { "name": "ALG9, CDG1L, DIBD1, GIKANIS, LOH11CR1J", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "875,198,875,298" }, { "name": "C03862", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "781", "y": "379", "width": "14", "height": "14" }, { "name": "G00006", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "832", "y": "360", "width": "14", "height": "14" }, { "name": "G10595", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "832", "y": "408", "width": "14", "height": "14" }, { "name": "G10596", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "875", "y": "378", "width": "14", "height": "14" }, { "name": "G10597", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "875", "y": "296", "width": "14", "height": "14" }, { "name": "G00007", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "875", "y": "199", "width": "14", "height": "14" }, { "name": "G10598", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "913", "y": "181", "width": "14", "height": "14" }, { "name": "G10599", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "913", "y": "225", "width": "14", "height": "14" }, { "name": "G00008", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "913", "y": "278", "width": "14", "height": "14" }, { "name": "C03021", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "913", "y": "392", "width": "14", "height": "14" }, { "name": "C00621", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "953", "y": "376", "width": "14", "height": "14" }, { "name": "G00009", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "953", "y": "225", "width": "14", "height": "14" }, { "name": "G00171", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "983", "y": "20", "width": "14", "height": "14" }, { "name": "G00012", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "983", "y": "137", "width": "14", "height": "14" }, { "name": "G00013", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "983", "y": "178", "width": "14", "height": "14" }, { "name": "G00014", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "983", "y": "230", "width": "14", "height": "14" }, { "name": "G00015", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "983", "y": "296", "width": "14", "height": "14" }, { "name": "G00019", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "934", "y": "296", "width": "14", "height": "14" }, { "name": "G00020", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1026", "y": "327", "width": "14", "height": "14" }, { "name": "G00021", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1026", "y": "357", "width": "14", "height": "14" }, { "name": "G00022", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1026", "y": "407", "width": "14", "height": "14" }, { "name": "G00016", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "983", "y": "327", "width": "14", "height": "14" }, { "name": "G00017", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "983", "y": "357", "width": "14", "height": "14" }, { "name": "G00018", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "983", "y": "406", "width": "14", "height": "14" }, { "name": "G10694", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1031", "y": "104", "width": "14", "height": "14" }, { "name": "G10611", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1390", "y": "104", "width": "14", "height": "14" }, { "name": "C02189", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1355", "y": "136", "width": "14", "height": "14" }, { "name": "G00023", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1283", "y": "104", "width": "14", "height": "14" }, { "name": "G00035", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1283", "y": "208", "width": "14", "height": "14" }, { "name": "G00024", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1222", "y": "104", "width": "14", "height": "14" }, { "name": "G00025", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1148", "y": "104", "width": "14", "height": "14" }, { "name": "G00026", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1222", "y": "37", "width": "14", "height": "14" }, { "name": "G00027", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1146", "y": "38", "width": "14", "height": "14" }, { "name": "G00031", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1283", "y": "20", "width": "14", "height": "14" }, { "name": "G00154", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1355", "y": "198", "width": "14", "height": "14" }, { "name": "G00147", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1354", "y": "410", "width": "14", "height": "14" }, { "name": "C01290", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "466", "y": "232", "width": "14", "height": "14" }, { "name": "G00036", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "302", "y": "232", "width": "14", "height": "14" }, { "name": "G00037", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "117", "y": "232", "width": "14", "height": "14" }, { "name": "G00046", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "59", "y": "232", "width": "14", "height": "14" }, { "name": "G00044", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "117", "y": "296", "width": "14", "height": "14" }, { "name": "G00047", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "117", "y": "178", "width": "14", "height": "14" }, { "name": "G00048", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "117", "y": "129", "width": "14", "height": "14" }, { "name": "G00042", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "59", "y": "296", "width": "14", "height": "14" }, { "name": "G00043", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "59", "y": "354", "width": "14", "height": "14" }, { "name": "G00045", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "117", "y": "354", "width": "14", "height": "14" }, { "name": "G00039", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "175", "y": "296", "width": "14", "height": "14" }, { "name": "G00040", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "175", "y": "354", "width": "14", "height": "14" }, { "name": "G00050", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "302", "y": "296", "width": "14", "height": "14" }, { "name": "G00055", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "302", "y": "354", "width": "14", "height": "14" }, { "name": "G00056", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "302", "y": "407", "width": "14", "height": "14" }, { "name": "G00060", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "387", "y": "264", "width": "14", "height": "14" }, { "name": "G00066", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "387", "y": "296", "width": "14", "height": "14" }, { "name": "G00067", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "387", "y": "354", "width": "14", "height": "14" }, { "name": "G00077", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "387", "y": "407", "width": "14", "height": "14" }, { "name": "G00052", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "346", "y": "354", "width": "14", "height": "14" }, { "name": "G00054", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "233", "y": "354", "width": "14", "height": "14" }, { "name": "G00057", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "233", "y": "407", "width": "14", "height": "14" }, { "name": "G00058", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "233", "y": "458", "width": "14", "height": "14" }, { "name": "G00059", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "233", "y": "520", "width": "14", "height": "14" }, { "name": "G00062", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "254", "y": "296", "width": "14", "height": "14" }, { "name": "G00063", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "206", "y": "296", "width": "14", "height": "14" }, { "name": "G00093", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "466", "y": "154", "width": "14", "height": "14" }, { "name": "G00094", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "520", "y": "154", "width": "14", "height": "14" }, { "name": "G00097", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "575", "y": "154", "width": "14", "height": "14" }, { "name": "G00098", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "629", "y": "154", "width": "14", "height": "14" }, { "name": "G00095", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "520", "y": "203", "width": "14", "height": "14" }, { "name": "G00099", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "575", "y": "203", "width": "14", "height": "14" }, { "name": "G00108", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "637", "y": "232", "width": "14", "height": "14" }, { "name": "G00109", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "637", "y": "281", "width": "14", "height": "14" }, { "name": "G00110", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "637", "y": "330", "width": "14", "height": "14" }, { "name": "G00111", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "637", "y": "378", "width": "14", "height": "14" }, { "name": "G00112", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "637", "y": "427", "width": "14", "height": "14" }, { "name": "G00113", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "711", "y": "232", "width": "14", "height": "14" }, { "name": "G00114", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "711", "y": "281", "width": "14", "height": "14" }, { "name": "G00115", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "711", "y": "330", "width": "14", "height": "14" }, { "name": "G00116", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "711", "y": "378", "width": "14", "height": "14" }, { "name": "G00117", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "711", "y": "427", "width": "14", "height": "14" }, { "name": "G00118", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "754", "y": "232", "width": "14", "height": "14" }, { "name": "G00119", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "754", "y": "281", "width": "14", "height": "14" }, { "name": "G00120", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "754", "y": "330", "width": "14", "height": "14" }, { "name": "G00123", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "562", "y": "281", "width": "14", "height": "14" }, { "name": "G00124", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "562", "y": "330", "width": "14", "height": "14" }, { "name": "G00125", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "562", "y": "378", "width": "14", "height": "14" }, { "name": "G00126", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "562", "y": "427", "width": "14", "height": "14" }, { "name": "G00128", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "588", "y": "378", "width": "14", "height": "14" }, { "name": "G00129", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "664", "y": "378", "width": "14", "height": "14" }, { "name": "G00127", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "518", "y": "378", "width": "14", "height": "14" }, { "name": "G00169", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "711", "y": "152", "width": "14", "height": "14" }, { "name": "G00170", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "754", "y": "152", "width": "14", "height": "14" }, { "name": "G00001", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "832", "y": "99", "width": "14", "height": "14" }, { "name": "G00002", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "832", "y": "142", "width": "14", "height": "14" }, { "name": "G00003", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "832", "y": "181", "width": "14", "height": "14" }, { "name": "G00004", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "832", "y": "225", "width": "14", "height": "14" }, { "name": "G00005", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "832", "y": "269", "width": "14", "height": "14" }, { "name": "C06427", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "960", "y": "425", "width": "14", "height": "14" }, { "name": "C02737", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1058", "y": "661", "width": "14", "height": "14" }, { "name": "C00350", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "960", "y": "661", "width": "14", "height": "14" }, { "name": "C00570", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "916", "y": "627", "width": "14", "height": "14" }, { "name": "C00346", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "857", "y": "627", "width": "14", "height": "14" }, { "name": "C00307", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "916", "y": "558", "width": "14", "height": "14" }, { "name": "C00588", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "857", "y": "558", "width": "14", "height": "14" }, { "name": "C01241", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "994", "y": "626", "width": "14", "height": "14" }, { "name": "C04308", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "994", "y": "559", "width": "14", "height": "14" }, { "name": "C00416", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1156", "y": "592", "width": "14", "height": "14" }, { "name": "C03820", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1201", "y": "879", "width": "14", "height": "14" }, { "name": "C04598", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1201", "y": "928", "width": "14", "height": "14" }, { "name": "C05977", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1078", "y": "812", "width": "14", "height": "14" }, { "name": "C03201", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1078", "y": "851", "width": "14", "height": "14" }, { "name": "C04475", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1078", "y": "890", "width": "14", "height": "14" }, { "name": "C04756", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1078", "y": "929", "width": "14", "height": "14" }, { "name": "C04635", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1030", "y": "929", "width": "14", "height": "14" }, { "name": "C03454", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1127", "y": "929", "width": "14", "height": "14" }, { "name": "C02686", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "928", "y": "865", "width": "14", "height": "14" }, { "name": "C06125", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "992", "y": "865", "width": "14", "height": "14" }, { "name": "C00550", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "857", "y": "929", "width": "14", "height": "14" }, { "name": "C02934", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "671", "y": "865", "width": "14", "height": "14" }, { "name": "C05965", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "807", "y": "592", "width": "14", "height": "14" }, { "name": "C14823", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "676", "y": "556", "width": "14", "height": "14" }, { "name": "C14812", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "742", "y": "556", "width": "14", "height": "14" }, { "name": "C14768", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "629", "y": "627", "width": "14", "height": "14" }, { "name": "C14772", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "692", "y": "627", "width": "14", "height": "14" }, { "name": "C14769", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "629", "y": "664", "width": "14", "height": "14" }, { "name": "C14773", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "692", "y": "663", "width": "14", "height": "14" }, { "name": "C14770", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "629", "y": "700", "width": "14", "height": "14" }, { "name": "C14774", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "692", "y": "700", "width": "14", "height": "14" }, { "name": "C14748", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "502", "y": "487", "width": "14", "height": "14" }, { "name": "C14749", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "502", "y": "521", "width": "14", "height": "14" }, { "name": "C05956", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "365", "y": "592", "width": "14", "height": "14" }, { "name": "C05356", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "502", "y": "556", "width": "14", "height": "14" }, { "name": "C02166", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "411", "y": "608", "width": "14", "height": "14" }, { "name": "C05951", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "411", "y": "642", "width": "14", "height": "14" }, { "name": "C05966", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "443", "y": "627", "width": "14", "height": "14" }, { "name": "C14781", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "443", "y": "663", "width": "14", "height": "14" }, { "name": "C14782", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "443", "y": "699", "width": "14", "height": "14" }, { "name": "C14813", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "353", "y": "662", "width": "14", "height": "14" }, { "name": "C14814", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "353", "y": "698", "width": "14", "height": "14" }, { "name": "C00427", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "302", "y": "592", "width": "14", "height": "14" }, { "name": "C02198", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "302", "y": "527", "width": "14", "height": "14" }, { "name": "C00639", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "205", "y": "550", "width": "14", "height": "14" }, { "name": "C00584", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "205", "y": "592", "width": "14", "height": "14" }, { "name": "C01312", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "302", "y": "627", "width": "14", "height": "14" }, { "name": "C00696", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "223", "y": "627", "width": "14", "height": "14" }, { "name": "C14826", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "367", "y": "743", "width": "14", "height": "14" }, { "name": "C16332", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1108", "y": "469", "width": "14", "height": "14" }, { "name": "C16338", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1108", "y": "508", "width": "14", "height": "14" }, { "name": "C00422", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "934", "y": "692", "width": "14", "height": "14" }, { "name": "C01190", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "466", "y": "491", "width": "14", "height": "14" }, { "name": "C05272", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1357", "y": "1208", "width": "14", "height": "14" }, { "name": "C05258", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1357", "y": "1115", "width": "14", "height": "14" }, { "name": "C05273", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1296", "y": "1208", "width": "14", "height": "14" }, { "name": "C05260", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1296", "y": "1115", "width": "14", "height": "14" }, { "name": "C03221", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1235", "y": "1208", "width": "14", "height": "14" }, { "name": "C05262", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1235", "y": "1115", "width": "14", "height": "14" }, { "name": "C05275", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1174", "y": "1208", "width": "14", "height": "14" }, { "name": "C05264", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1174", "y": "1115", "width": "14", "height": "14" }, { "name": "C01944", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1113", "y": "1300", "width": "14", "height": "14" }, { "name": "C05276", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1113", "y": "1208", "width": "14", "height": "14" }, { "name": "C05266", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1113", "y": "1115", "width": "14", "height": "14" }, { "name": "C05270", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1052", "y": "1300", "width": "14", "height": "14" }, { "name": "C05271", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1052", "y": "1208", "width": "14", "height": "14" }, { "name": "C05268", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1052", "y": "1115", "width": "14", "height": "14" }, { "name": "C01144", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "991", "y": "1115", "width": "14", "height": "14" }, { "name": "C05764", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "893", "y": "1349", "width": "14", "height": "14" }, { "name": "C05763", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "893", "y": "1257", "width": "14", "height": "14" }, { "name": "C04633", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "893", "y": "1163", "width": "14", "height": "14" }, { "name": "C05762", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "893", "y": "1069", "width": "14", "height": "14" }, { "name": "C05761", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "832", "y": "1349", "width": "14", "height": "14" }, { "name": "C05760", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "832", "y": "1257", "width": "14", "height": "14" }, { "name": "C04688", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "832", "y": "1163", "width": "14", "height": "14" }, { "name": "C05759", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "832", "y": "1069", "width": "14", "height": "14" }, { "name": "C05223", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "771", "y": "1349", "width": "14", "height": "14" }, { "name": "C05758", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "771", "y": "1257", "width": "14", "height": "14" }, { "name": "C05757", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "771", "y": "1163", "width": "14", "height": "14" }, { "name": "C05756", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "771", "y": "1069", "width": "14", "height": "14" }, { "name": "C05755", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "710", "y": "1349", "width": "14", "height": "14" }, { "name": "C05754", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "710", "y": "1257", "width": "14", "height": "14" }, { "name": "C04619", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "710", "y": "1163", "width": "14", "height": "14" }, { "name": "C05753", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "710", "y": "1069", "width": "14", "height": "14" }, { "name": "C05752", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "649", "y": "1349", "width": "14", "height": "14" }, { "name": "C05751", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "649", "y": "1257", "width": "14", "height": "14" }, { "name": "C04620", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "649", "y": "1163", "width": "14", "height": "14" }, { "name": "C05750", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "649", "y": "1069", "width": "14", "height": "14" }, { "name": "C05749", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "588", "y": "1349", "width": "14", "height": "14" }, { "name": "C05748", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "588", "y": "1257", "width": "14", "height": "14" }, { "name": "C05747", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "588", "y": "1163", "width": "14", "height": "14" }, { "name": "C05746", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "588", "y": "1069", "width": "14", "height": "14" }, { "name": "C05745", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "527", "y": "1349", "width": "14", "height": "14" }, { "name": "C04246", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "527", "y": "1257", "width": "14", "height": "14" }, { "name": "C04618", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "527", "y": "1163", "width": "14", "height": "14" }, { "name": "C05744", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "527", "y": "1069", "width": "14", "height": "14" }, { "name": "C01209", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "622", "y": "1006", "width": "14", "height": "14" }, { "name": "C03939", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "527", "y": "947", "width": "14", "height": "14" }, { "name": "C01143", "fgcolor": "#9EE284", "bgcolor": "#9EE284", "type": "circle", "x": "673", "y": "1452", "width": "14", "height": "14" }, { "name": "C01107", "fgcolor": "#9EE284", "bgcolor": "#9EE284", "type": "circle", "x": "757", "y": "1452", "width": "14", "height": "14" }, { "name": "C16239", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "692", "y": "1384", "width": "14", "height": "14" }, { "name": "C16236", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "692", "y": "1424", "width": "14", "height": "14" }, { "name": "C16237", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "747", "y": "1384", "width": "14", "height": "14" }, { "name": "C16238", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "808", "y": "1384", "width": "14", "height": "14" }, { "name": "C01561", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "799", "y": "1634", "width": "14", "height": "14" }, { "name": "C01673", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "848", "y": "1634", "width": "14", "height": "14" }, { "name": "C01921", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "401", "y": "2009", "width": "14", "height": "14" }, { "name": "C00751", "fgcolor": "#9EE284", "bgcolor": "#9EE284", "type": "circle", "x": "383", "y": "1506", "width": "14", "height": "14" }, { "name": "C01054", "fgcolor": "#9EE284", "bgcolor": "#9EE284", "type": "circle", "x": "441", "y": "1506", "width": "14", "height": "14" }, { "name": "C01724", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "500", "y": "1506", "width": "14", "height": "14" }, { "name": "C11455", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "558", "y": "1506", "width": "14", "height": "14" }, { "name": "C05108", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "618", "y": "1506", "width": "14", "height": "14" }, { "name": "C15808", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "679", "y": "1506", "width": "14", "height": "14" }, { "name": "C15816", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "738", "y": "1506", "width": "14", "height": "14" }, { "name": "C05103", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "799", "y": "1506", "width": "14", "height": "14" }, { "name": "C05437", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "799", "y": "1554", "width": "14", "height": "14" }, { "name": "C03845", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "799", "y": "1602", "width": "14", "height": "14" }, { "name": "C01189", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "741", "y": "1602", "width": "14", "height": "14" }, { "name": "C01164", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "679", "y": "1602", "width": "14", "height": "14" }, { "name": "C01802", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "614", "y": "1554", "width": "14", "height": "14" }, { "name": "C05107", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "679", "y": "1554", "width": "14", "height": "14" }, { "name": "C05439", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "741", "y": "1554", "width": "14", "height": "14" }, { "name": "C05443", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "741", "y": "1634", "width": "14", "height": "14" }, { "name": "C03594", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "559", "y": "1602", "width": "14", "height": "14" }, { "name": "C05455", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "503", "y": "1602", "width": "14", "height": "14" }, { "name": "C17339", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "441", "y": "1602", "width": "14", "height": "14" }, { "name": "C05453", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "441", "y": "1640", "width": "14", "height": "14" }, { "name": "C05454", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "441", "y": "1678", "width": "14", "height": "14" }, { "name": "C05446", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "441", "y": "1716", "width": "14", "height": "14" }, { "name": "C01301", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "441", "y": "1754", "width": "14", "height": "14" }, { "name": "C04722", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "441", "y": "1793", "width": "14", "height": "14" }, { "name": "C15613", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "441", "y": "1832", "width": "14", "height": "14" }, { "name": "C17343", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "441", "y": "1869", "width": "14", "height": "14" }, { "name": "C05460", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "441", "y": "1907", "width": "14", "height": "14" }, { "name": "C05467", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "441", "y": "1983", "width": "14", "height": "14" }, { "name": "C01794", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "441", "y": "2038", "width": "14", "height": "14" }, { "name": "C00695", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "362", "y": "2038", "width": "14", "height": "14" }, { "name": "C05451", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "503", "y": "1640", "width": "14", "height": "14" }, { "name": "C05452", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "503", "y": "1678", "width": "14", "height": "14" }, { "name": "C05444", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "503", "y": "1716", "width": "14", "height": "14" }, { "name": "C05445", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "503", "y": "1755", "width": "14", "height": "14" }, { "name": "C04554", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "503", "y": "1794", "width": "14", "height": "14" }, { "name": "C17345", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "503", "y": "1831", "width": "14", "height": "14" }, { "name": "C17346", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "503", "y": "1869", "width": "14", "height": "14" }, { "name": "C05447", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "503", "y": "1907", "width": "14", "height": "14" }, { "name": "C05122", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "401", "y": "2067", "width": "14", "height": "14" }, { "name": "C05500", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "558", "y": "1645", "width": "14", "height": "14" }, { "name": "C05502", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "671", "y": "1645", "width": "14", "height": "14" }, { "name": "C05501", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "614", "y": "1690", "width": "14", "height": "14" }, { "name": "C01176", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "552", "y": "1769", "width": "14", "height": "14" }, { "name": "C05488", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "552", "y": "1807", "width": "14", "height": "14" }, { "name": "C00735", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "552", "y": "1845", "width": "14", "height": "14" }, { "name": "C00762", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "552", "y": "1879", "width": "14", "height": "14" }, { "name": "C03205", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "614", "y": "1807", "width": "14", "height": "14" }, { "name": "C02140", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "614", "y": "1845", "width": "14", "height": "14" }, { "name": "C00535", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "800", "y": "1661", "width": "14", "height": "14" }, { "name": "C05294", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "848", "y": "1661", "width": "14", "height": "14" }, { "name": "C05295", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "897", "y": "1661", "width": "14", "height": "14" }, { "name": "C01943", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "384", "y": "1630", "width": "14", "height": "14" }, { "name": "C11508", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "384", "y": "1668", "width": "14", "height": "14" }, { "name": "C15776", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "384", "y": "1707", "width": "14", "height": "14" }, { "name": "C11522", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "384", "y": "1746", "width": "14", "height": "14" }, { "name": "C15777", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "384", "y": "1785", "width": "14", "height": "14" }, { "name": "C15780", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "384", "y": "1824", "width": "14", "height": "14" }, { "name": "C15781", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "384", "y": "1863", "width": "14", "height": "14" }, { "name": "C01595", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "523", "y": "743", "width": "14", "height": "14" }, { "name": "C04717", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "479", "y": "803", "width": "14", "height": "14" }, { "name": "C14825", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "424", "y": "803", "width": "14", "height": "14" }, { "name": "C14771", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "573", "y": "730", "width": "14", "height": "14" }, { "name": "C14775", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "573", "y": "778", "width": "14", "height": "14" }, { "name": "C06124", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "857", "y": "720", "width": "14", "height": "14" }, { "name": "C00319", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "857", "y": "808", "width": "14", "height": "14" }, { "name": "C00344", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1156", "y": "777", "width": "14", "height": "14" }, { "name": "C05980", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1058", "y": "777", "width": "14", "height": "14" }, { "name": "C16476", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "976", "y": "1858", "width": "14", "height": "14" }, { "name": "C02222", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "1037", "y": "1812", "width": "14", "height": "14" }, { "name": "C06329", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "1037", "y": "1776", "width": "14", "height": "14" }, { "name": "C04706", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "1037", "y": "1741", "width": "14", "height": "14" }, { "name": "C01606", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "711", "y": "2092", "width": "14", "height": "14" }, { "name": "C04783", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "761", "y": "2092", "width": "14", "height": "14" }, { "name": "C02232", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "997", "y": "1677", "width": "14", "height": "14" }, { "name": "C14144", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "997", "y": "1579", "width": "14", "height": "14" }, { "name": "C14145", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "997", "y": "1627", "width": "14", "height": "14" }, { "name": "C01124", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "614", "y": "1878", "width": "14", "height": "14" }, { "name": "C01780", "fgcolor": "#80CCB3", "bgcolor": "#80CCCC", "type": "circle", "x": "614", "y": "1941", "width": "14", "height": "14" }, { "name": "C05668", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1898", "y": "1424", "width": "14", "height": "14" }, { "name": "C04257", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1662", "y": "912", "width": "14", "height": "14" }, { "name": "C06241", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1662", "y": "988", "width": "14", "height": "14" }, { "name": "C00325", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1347", "y": "694", "width": "14", "height": "14" }, { "name": "C00312", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2093", "y": "404", "width": "14", "height": "14" }, { "name": "C00447", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1397", "y": "1495", "width": "14", "height": "14" }, { "name": "C05843", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3394", "y": "2012", "width": "14", "height": "14" }, { "name": "C03722", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3523", "y": "1729", "width": "14", "height": "14" }, { "name": "C00857", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3572", "y": "1796", "width": "14", "height": "14" }, { "name": "C02918", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3331", "y": "1934", "width": "14", "height": "14" }, { "name": "C02723", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "3278", "y": "1617", "width": "14", "height": "14" }, { "name": "C06178", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "3278", "y": "1699", "width": "14", "height": "14" }, { "name": "C01672", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "2897", "y": "1888", "width": "14", "height": "14" }, { "name": "C12455", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "2957", "y": "1888", "width": "14", "height": "14" }, { "name": "C00581", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3398", "y": "1415", "width": "14", "height": "14" }, { "name": "C00300", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3502", "y": "1415", "width": "14", "height": "14" }, { "name": "C02305", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3502", "y": "1474", "width": "14", "height": "14" }, { "name": "C00515", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "3304", "y": "1528", "width": "14", "height": "14" }, { "name": "C00792", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "3363", "y": "1528", "width": "14", "height": "14" }, { "name": "C05842", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3331", "y": "2012", "width": "14", "height": "14" }, { "name": "C00671", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2719", "y": "1442", "width": "14", "height": "14" }, { "name": "C06157", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "1898", "y": "1359", "width": "14", "height": "14" }, { "name": "C03069", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2431", "y": "1368", "width": "14", "height": "14" }, { "name": "C00719", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2620", "y": "1088", "width": "14", "height": "14" }, { "name": "C03557", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "1920", "y": "1064", "width": "14", "height": "14" }, { "name": "C05673", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "1972", "y": "1064", "width": "14", "height": "14" }, { "name": "C06614", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "2038", "y": "1154", "width": "14", "height": "14" }, { "name": "C06613", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "2139", "y": "1154", "width": "14", "height": "14" }, { "name": "C06611", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "2183", "y": "1154", "width": "14", "height": "14" }, { "name": "C06615", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "2038", "y": "1089", "width": "14", "height": "14" }, { "name": "C16348", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "2139", "y": "1089", "width": "14", "height": "14" }, { "name": "C06612", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "2183", "y": "1089", "width": "14", "height": "14" }, { "name": "C03680", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2592", "y": "1068", "width": "14", "height": "14" }, { "name": "C03232", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2048", "y": "912", "width": "14", "height": "14" }, { "name": "C00606", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2561", "y": "818", "width": "14", "height": "14" }, { "name": "C00785", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2531", "y": "1068", "width": "14", "height": "14" }, { "name": "C04409", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2531", "y": "1134", "width": "14", "height": "14" }, { "name": "C00519", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2619", "y": "818", "width": "14", "height": "14" }, { "name": "C01678", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2619", "y": "764", "width": "14", "height": "14" }, { "name": "C05122", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2727", "y": "818", "width": "14", "height": "14" }, { "name": "C02514", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2845", "y": "706", "width": "14", "height": "14" }, { "name": "C01061", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2820", "y": "764", "width": "14", "height": "14" }, { "name": "C05580", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3035", "y": "638", "width": "14", "height": "14" }, { "name": "C05584", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3121", "y": "638", "width": "14", "height": "14" }, { "name": "C05576", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3035", "y": "686", "width": "14", "height": "14" }, { "name": "C05594", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3121", "y": "686", "width": "14", "height": "14" }, { "name": "C02642", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2740", "y": "440", "width": "14", "height": "14" }, { "name": "C00386", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2803", "y": "503", "width": "14", "height": "14" }, { "name": "C00544", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2650", "y": "706", "width": "14", "height": "14" }, { "name": "C01036", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2715", "y": "764", "width": "14", "height": "14" }, { "name": "C00637", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2856", "y": "1095", "width": "14", "height": "14" }, { "name": "C00398", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2906", "y": "988", "width": "14", "height": "14" }, { "name": "C00643", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2787", "y": "1028", "width": "14", "height": "14" }, { "name": "C00780", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2751", "y": "1028", "width": "14", "height": "14" }, { "name": "C00978", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2751", "y": "1062", "width": "14", "height": "14" }, { "name": "C01598", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2751", "y": "1100", "width": "14", "height": "14" }, { "name": "C00864", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3023", "y": "1262", "width": "14", "height": "14" }, { "name": "C03492", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3081", "y": "1262", "width": "14", "height": "14" }, { "name": "C04352", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3141", "y": "1262", "width": "14", "height": "14" }, { "name": "C01134", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3204", "y": "1262", "width": "14", "height": "14" }, { "name": "C00882", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3262", "y": "1262", "width": "14", "height": "14" }, { "name": "C00430", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3142", "y": "938", "width": "14", "height": "14" }, { "name": "C01051", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3395", "y": "841", "width": "14", "height": "14" }, { "name": "C03263", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3443", "y": "841", "width": "14", "height": "14" }, { "name": "C01079", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3490", "y": "841", "width": "14", "height": "14" }, { "name": "C02191", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3547", "y": "841", "width": "14", "height": "14" }, { "name": "C06506", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3490", "y": "962", "width": "14", "height": "14" }, { "name": "C02987", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3081", "y": "1240", "width": "14", "height": "14" }, { "name": "C03406", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3162", "y": "1279", "width": "14", "height": "14" }, { "name": "C00632", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2691", "y": "1100", "width": "14", "height": "14" }, { "name": "C05634", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2715", "y": "1062", "width": "14", "height": "14" }, { "name": "C05635", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2715", "y": "1100", "width": "14", "height": "14" }, { "name": "C00286", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "3045", "y": "257", "width": "14", "height": "14" }, { "name": "C07481", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "2990", "y": "365", "width": "14", "height": "14" }, { "name": "C16358", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "2894", "y": "416", "width": "14", "height": "14" }, { "name": "C13747", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "3082", "y": "365", "width": "14", "height": "14" }, { "name": "C16356", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "3082", "y": "315", "width": "14", "height": "14" }, { "name": "C16365", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "3131", "y": "365", "width": "14", "height": "14" }, { "name": "C00921", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3213", "y": "605", "width": "14", "height": "14" }, { "name": "C05922", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3213", "y": "191", "width": "14", "height": "14" }, { "name": "C00314", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3418", "y": "443", "width": "14", "height": "14" }, { "name": "C00534", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3418", "y": "319", "width": "14", "height": "14" }, { "name": "C00627", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3481", "y": "443", "width": "14", "height": "14" }, { "name": "C00647", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3481", "y": "319", "width": "14", "height": "14" }, { "name": "C00847", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3359", "y": "381", "width": "14", "height": "14" }, { "name": "C05923", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3213", "y": "233", "width": "14", "height": "14" }, { "name": "C06148", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3213", "y": "292", "width": "14", "height": "14" }, { "name": "C04874", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3213", "y": "396", "width": "14", "height": "14" }, { "name": "C00415", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3213", "y": "654", "width": "14", "height": "14" }, { "name": "C00504", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3213", "y": "703", "width": "14", "height": "14" }, { "name": "C00440", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3481", "y": "712", "width": "14", "height": "14" }, { "name": "C03479", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3365", "y": "689", "width": "14", "height": "14" }, { "name": "C00664", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3422", "y": "712", "width": "14", "height": "14" }, { "name": "C01762", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2820", "y": "269", "width": "14", "height": "14" }, { "name": "C01103", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2314", "y": "362", "width": "14", "height": "14" }, { "name": "C00294", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2761", "y": "269", "width": "14", "height": "14" }, { "name": "C02350", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2925", "y": "706", "width": "14", "height": "14" }, { "name": "C12248", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2925", "y": "545", "width": "14", "height": "14" }, { "name": "C00475", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2505", "y": "489", "width": "14", "height": "14" }, { "name": "C00299", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2505", "y": "401", "width": "14", "height": "14" }, { "name": "C00458", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2270", "y": "579", "width": "14", "height": "14" }, { "name": "C00438", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2207", "y": "841", "width": "14", "height": "14" }, { "name": "C00337", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2207", "y": "748", "width": "14", "height": "14" }, { "name": "C00295", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2207", "y": "655", "width": "14", "height": "14" }, { "name": "C00364", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2428", "y": "731", "width": "14", "height": "14" }, { "name": "C00363", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2393", "y": "710", "width": "14", "height": "14" }, { "name": "C21028", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2173", "y": "731", "width": "14", "height": "14" }, { "name": "C00499", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2925", "y": "1062", "width": "14", "height": "14" }, { "name": "C00387", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2902", "y": "269", "width": "14", "height": "14" }, { "name": "C00655", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2820", "y": "191", "width": "14", "height": "14" }, { "name": "C05267", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1113", "y": "1020", "width": "14", "height": "14" }, { "name": "C05269", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1052", "y": "1020", "width": "14", "height": "14" }, { "name": "C00332", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "991", "y": "1020", "width": "14", "height": "14" }, { "name": "C00353", "fgcolor": "#9EE284", "bgcolor": "#9EE284", "type": "circle", "x": "309", "y": "1554", "width": "14", "height": "14" }, { "name": "C01242", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2431", "y": "1267", "width": "14", "height": "14" }, { "name": "C01094", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1315", "y": "716", "width": "14", "height": "14" }, { "name": "C00446", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1453", "y": "290", "width": "14", "height": "14" }, { "name": "C00369", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1542", "y": "290", "width": "14", "height": "14" }, { "name": "C04043", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2909", "y": "618", "width": "14", "height": "14" }, { "name": "C01161", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2909", "y": "656", "width": "14", "height": "14" }, { "name": "C00909", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "411", "y": "556", "width": "14", "height": "14" }, { "name": "C02165", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "344", "y": "556", "width": "14", "height": "14" }, { "name": "C02090", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "3297", "y": "2068", "width": "14", "height": "14" }, { "name": "C03170", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "3372", "y": "2068", "width": "14", "height": "14" }, { "name": "C01005", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2204", "y": "912", "width": "14", "height": "14" }, { "name": "C01205", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2031", "y": "731", "width": "14", "height": "14" }, { "name": "C00418", "fgcolor": "#9EE284", "bgcolor": "#9EE284", "type": "circle", "x": "852", "y": "1452", "width": "14", "height": "14" }, { "name": "C00356", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2250", "y": "1367", "width": "14", "height": "14" }, { "name": "C01236", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1864", "y": "439", "width": "14", "height": "14" }, { "name": "C05382", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1816", "y": "682", "width": "14", "height": "14" }, { "name": "C00385", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2820", "y": "347", "width": "14", "height": "14" }, { "name": "C00366", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2820", "y": "449", "width": "14", "height": "14" }, { "name": "C05512", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2502", "y": "353", "width": "14", "height": "14" }, { "name": "C00360", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2575", "y": "305", "width": "14", "height": "14" }, { "name": "C00559", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2502", "y": "305", "width": "14", "height": "14" }, { "name": "C00361", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2964", "y": "257", "width": "14", "height": "14" }, { "name": "C00362", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2964", "y": "305", "width": "14", "height": "14" }, { "name": "C00330", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "3028", "y": "305", "width": "14", "height": "14" }, { "name": "C01953", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "614", "y": "1730", "width": "14", "height": "14" }, { "name": "C05138", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "680", "y": "1730", "width": "14", "height": "14" }, { "name": "C01227", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "740", "y": "1730", "width": "14", "height": "14" }, { "name": "C04895", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3213", "y": "351", "width": "14", "height": "14" }, { "name": "C00355", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2705", "y": "579", "width": "14", "height": "14" }, { "name": "C03758", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2822", "y": "579", "width": "14", "height": "14" }, { "name": "C05587", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2822", "y": "618", "width": "14", "height": "14" }, { "name": "C05581", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2822", "y": "656", "width": "14", "height": "14" }, { "name": "C00547", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2943", "y": "579", "width": "14", "height": "14" }, { "name": "C05577", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2943", "y": "638", "width": "14", "height": "14" }, { "name": "C05588", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3062", "y": "579", "width": "14", "height": "14" }, { "name": "C00788", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3001", "y": "579", "width": "14", "height": "14" }, { "name": "C05583", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3121", "y": "579", "width": "14", "height": "14" }, { "name": "C05589", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3035", "y": "546", "width": "14", "height": "14" }, { "name": "C01693", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2841", "y": "449", "width": "14", "height": "14" }, { "name": "C05578", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2905", "y": "490", "width": "14", "height": "14" }, { "name": "C05579", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2968", "y": "490", "width": "14", "height": "14" }, { "name": "C04185", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2905", "y": "449", "width": "14", "height": "14" }, { "name": "C00705", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2349", "y": "579", "width": "14", "height": "14" }, { "name": "C00628", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2754", "y": "706", "width": "14", "height": "14" }, { "name": "C05585", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2698", "y": "706", "width": "14", "height": "14" }, { "name": "C00459", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2393", "y": "669", "width": "14", "height": "14" }, { "name": "C01179", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2592", "y": "706", "width": "14", "height": "14" }, { "name": "C15778", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "968", "y": "1554", "width": "14", "height": "14" }, { "name": "C15777", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "926", "y": "1554", "width": "14", "height": "14" }, { "name": "C00460", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2270", "y": "655", "width": "14", "height": "14" }, { "name": "C01346", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2350", "y": "655", "width": "14", "height": "14" }, { "name": "C01789", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "384", "y": "1901", "width": "14", "height": "14" }, { "name": "C05382", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1367", "y": "1534", "width": "14", "height": "14" }, { "name": "C00399", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1584", "y": "1928", "width": "14", "height": "14" }, { "name": "C00390", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1584", "y": "1998", "width": "14", "height": "14" }, { "name": "C00524", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1654", "y": "1928", "width": "14", "height": "14" }, { "name": "C06755", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "1976", "y": "1761", "width": "14", "height": "14" }, { "name": "C00530", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "2185", "y": "2077", "width": "14", "height": "14" }, { "name": "C00354", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1484", "y": "1575", "width": "14", "height": "14" }, { "name": "C05946", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2111", "y": "1800", "width": "14", "height": "14" }, { "name": "C12835", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "2119", "y": "1761", "width": "14", "height": "14" }, { "name": "C12834", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "2178", "y": "1761", "width": "14", "height": "14" }, { "name": "C06754", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "1976", "y": "1871", "width": "14", "height": "14" }, { "name": "C01213", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2076", "y": "1894", "width": "14", "height": "14" }, { "name": "C00683", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2076", "y": "1569", "width": "14", "height": "14" }, { "name": "C00988", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1654", "y": "1687", "width": "14", "height": "14" }, { "name": "C00445", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1601", "y": "1615", "width": "14", "height": "14" }, { "name": "C04317", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1242", "y": "928", "width": "14", "height": "14" }, { "name": "C05212", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1280", "y": "928", "width": "14", "height": "14" }, { "name": "C02593", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1296", "y": "1300", "width": "14", "height": "14" }, { "name": "C05274", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1174", "y": "1300", "width": "14", "height": "14" }, { "name": "C01832", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1235", "y": "1300", "width": "14", "height": "14" }, { "name": "C00645", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1662", "y": "861", "width": "14", "height": "14" }, { "name": "C01019", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1347", "y": "803", "width": "14", "height": "14" }, { "name": "C00322", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2101", "y": "1330", "width": "14", "height": "14" }, { "name": "C00527", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "1584", "y": "1359", "width": "14", "height": "14" }, { "name": "C01089", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "2164", "y": "1400", "width": "14", "height": "14" }, { "name": "C05688", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2061", "y": "1294", "width": "14", "height": "14" }, { "name": "C05675", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2038", "y": "1064", "width": "14", "height": "14" }, { "name": "C05676", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2100", "y": "1064", "width": "14", "height": "14" }, { "name": "C05259", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1357", "y": "1020", "width": "14", "height": "14" }, { "name": "C05261", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1296", "y": "1020", "width": "14", "height": "14" }, { "name": "C05263", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1235", "y": "1020", "width": "14", "height": "14" }, { "name": "C05265", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "1174", "y": "1020", "width": "14", "height": "14" }, { "name": "C00352", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1531", "y": "669", "width": "14", "height": "14" }, { "name": "C04501", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1531", "y": "799", "width": "14", "height": "14" }, { "name": "C00894", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1975", "y": "1424", "width": "14", "height": "14" }, { "name": "C03344", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2211", "y": "1485", "width": "14", "height": "14" }, { "name": "C00532", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2176", "y": "404", "width": "14", "height": "14" }, { "name": "C00718", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1542", "y": "353", "width": "14", "height": "14" }, { "name": "C00721", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1587", "y": "248", "width": "14", "height": "14" }, { "name": "G00155", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1355", "y": "230", "width": "14", "height": "14" }, { "name": "G00156", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1355", "y": "260", "width": "14", "height": "14" }, { "name": "G00158", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1354", "y": "373", "width": "14", "height": "14" }, { "name": "G00159", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1301", "y": "373", "width": "14", "height": "14" }, { "name": "G00143", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1241", "y": "580", "width": "14", "height": "14" }, { "name": "G00144", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1241", "y": "488", "width": "14", "height": "14" }, { "name": "G00145", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1295", "y": "489", "width": "14", "height": "14" }, { "name": "G00146", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1295", "y": "410", "width": "14", "height": "14" }, { "name": "PIGB, GPI-MT-III, PIG-B", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1412,360,1412,411" }, { "name": "PIGF...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1412,315,1412,362" }, { "name": "PIGK, GPI8...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1412,259,1412,318" }, { "name": "PGAP1, Bst1, ISPD3024, MRT42, SPG67", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1412,263,1412,190" }, { "name": "G13046", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1412", "y": "190", "width": "14", "height": "14" }, { "name": "G00148", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1412", "y": "409", "width": "14", "height": "14" }, { "name": "G00149", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1412", "y": "361", "width": "14", "height": "14" }, { "name": "G13044", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1412", "y": "316", "width": "14", "height": "14" }, { "name": "G13045", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1412", "y": "260", "width": "14", "height": "14" }, { "name": "C03892", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1156", "y": "716", "width": "14", "height": "14" }, { "name": "C00681", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1201", "y": "555", "width": "14", "height": "14" }, { "name": "C03372", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1201", "y": "630", "width": "14", "height": "14" }, { "name": "C16327", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1211", "y": "425", "width": "14", "height": "14" }, { "name": "C16328", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1260", "y": "425", "width": "14", "height": "14" }, { "name": "C16330", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1211", "y": "469", "width": "14", "height": "14" }, { "name": "C16331", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1158", "y": "469", "width": "14", "height": "14" }, { "name": "C16339", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1158", "y": "508", "width": "14", "height": "14" }, { "name": "C03715", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1201", "y": "716", "width": "14", "height": "14" }, { "name": "C00636", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1461", "y": "603", "width": "14", "height": "14" }, { "name": "C01222", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1347", "y": "648", "width": "14", "height": "14" }, { "name": "C02985", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1347", "y": "747", "width": "14", "height": "14" }, { "name": "C21029", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2101", "y": "731", "width": "14", "height": "14" }, { "name": "C00379", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1998", "y": "404", "width": "14", "height": "14" }, { "name": "C01040", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2166", "y": "267", "width": "14", "height": "14" }, { "name": "C00618", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2093", "y": "320", "width": "14", "height": "14" }, { "name": "C00310", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1918", "y": "468", "width": "14", "height": "14" }, { "name": "C03033", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1910", "y": "267", "width": "14", "height": "14" }, { "name": "C03794", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2700", "y": "191", "width": "14", "height": "14" }, { "name": "C15980", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2431", "y": "1485", "width": "14", "height": "14" }, { "name": "C15979", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2431", "y": "1442", "width": "14", "height": "14" }, { "name": "C15975", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2536", "y": "1414", "width": "14", "height": "14" }, { "name": "C02939", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2536", "y": "1368", "width": "14", "height": "14" }, { "name": "C03231", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2336", "y": "1367", "width": "14", "height": "14" }, { "name": "C01026", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2569", "y": "1088", "width": "14", "height": "14" }, { "name": "C03345", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2355", "y": "1485", "width": "14", "height": "14" }, { "name": "C03824", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2393", "y": "1134", "width": "14", "height": "14" }, { "name": "C04405", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2264", "y": "1485", "width": "14", "height": "14" }, { "name": "C00603", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2811", "y": "1317", "width": "14", "height": "14" }, { "name": "C00601", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "2373", "y": "1775", "width": "14", "height": "14" }, { "name": "C05552", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "2908", "y": "1964", "width": "14", "height": "14" }, { "name": "C06250", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "2978", "y": "2011", "width": "14", "height": "14" }, { "name": "C04188", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3020", "y": "1778", "width": "14", "height": "14" }, { "name": "C01137", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2940", "y": "1645", "width": "14", "height": "14" }, { "name": "C04281", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3074", "y": "1800", "width": "14", "height": "14" }, { "name": "C01165", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3159", "y": "1625", "width": "14", "height": "14" }, { "name": "C01419", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2451", "y": "1979", "width": "14", "height": "14" }, { "name": "C01180", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2646", "y": "1778", "width": "14", "height": "14" }, { "name": "C00407", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2719", "y": "1528", "width": "14", "height": "14" }, { "name": "C00449", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2290", "y": "1654", "width": "14", "height": "14" }, { "name": "C00624", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2697", "y": "1558", "width": "14", "height": "14" }, { "name": "C00819", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2727", "y": "1901", "width": "14", "height": "14" }, { "name": "C04076", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2290", "y": "1411", "width": "14", "height": "14" }, { "name": "C05947", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2618", "y": "1800", "width": "14", "height": "14" }, { "name": "C13636", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "2229", "y": "2077", "width": "14", "height": "14" }, { "name": "C05921", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "2908", "y": "2011", "width": "14", "height": "14" }, { "name": "C04582", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2940", "y": "1778", "width": "14", "height": "14" }, { "name": "C01157", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3074", "y": "1744", "width": "14", "height": "14" }, { "name": "C02714", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3364", "y": "1579", "width": "14", "height": "14" }, { "name": "C05936", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3364", "y": "1699", "width": "14", "height": "14" }, { "name": "C02946", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3364", "y": "2032", "width": "14", "height": "14" }, { "name": "C07086", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "2373", "y": "1551", "width": "14", "height": "14" }, { "name": "C00450", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2336", "y": "1385", "width": "14", "height": "14" }, { "name": "C00408", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2336", "y": "1445", "width": "14", "height": "14" }, { "name": "C06054", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3365", "y": "567", "width": "14", "height": "14" }, { "name": "C06055", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3422", "y": "567", "width": "14", "height": "14" }, { "name": "C03684", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3256", "y": "351", "width": "14", "height": "14" }, { "name": "C04244", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3300", "y": "351", "width": "14", "height": "14" }, { "name": "C03287", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3159", "y": "1828", "width": "14", "height": "14" }, { "name": "C00365", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2428", "y": "655", "width": "14", "height": "14" }, { "name": "C00822", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2762", "y": "521", "width": "14", "height": "14" }, { "name": "C00388", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2341", "y": "1034", "width": "14", "height": "14" }, { "name": "C05172", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2150", "y": "1207", "width": "14", "height": "14" }, { "name": "C01528", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2061", "y": "1207", "width": "14", "height": "14" }, { "name": "C05582", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2865", "y": "686", "width": "14", "height": "14" }, { "name": "C02282", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2788", "y": "1841", "width": "14", "height": "14" }, { "name": "C00469", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1798", "y": "1154", "width": "14", "height": "14" }, { "name": "C01146", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1697", "y": "1747", "width": "14", "height": "14" }, { "name": "C05297", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "897", "y": "1730", "width": "14", "height": "14" }, { "name": "C05290", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "848", "y": "1730", "width": "14", "height": "14" }, { "name": "C04432", "fgcolor": "#9EE284", "bgcolor": "#9EE284", "type": "circle", "x": "495", "y": "1346", "width": "14", "height": "14" }, { "name": "PGM1, CDG1T, GSD14...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1677,329,1677,440" }, { "name": "C00089", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1771", "y": "386", "width": "14", "height": "14" }, { "name": "GLS2, GA, GLS, LGA, hLGA...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2592,1828,2592,1911,2592,1911,2592,1914,2593,1918,2595,1921,2597,1923,2600,1926,2602,1928,2605,1930,2609,1931,2612,1931,2612,1931,2678,1931" }, { "name": "C00669", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2653", "y": "1979", "width": "14", "height": "14" }, { "name": "C06112", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2788", "y": "1949", "width": "14", "height": "14" }, { "name": "C00334", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2592", "y": "2033", "width": "14", "height": "14" }, { "name": "C00064", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2677", "y": "1931", "width": "14", "height": "14" }, { "name": "GART, AIRS, GARS, GARTF, PAIS, PGFT, PRGS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3302,655,3302,642,3302,642,3302,639,3303,635,3305,632,3307,630,3310,627,3312,625,3315,623,3319,622,3322,622,3322,622,3402,622,3402,622,3405,622,3409,623,3412,625,3414,627,3417,630,3419,632,3421,635,3422,639,3422,642,3422,642,3422,655" }, { "name": "C00101", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3302", "y": "654", "width": "14", "height": "14" }, { "name": "C00234", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3365", "y": "654", "width": "14", "height": "14" }, { "name": "C00445", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3422", "y": "654", "width": "14", "height": "14" }, { "name": "C00439", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2592", "y": "1111", "width": "14", "height": "14" }, { "name": "GOT1, AST1, ASTQTL1, GIG18, cAspAT, cCAT...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2593,1829,1983,1829,1983,1829,1979,1829,1975,1827,1971,1825,1968,1823,1965,1820,1963,1817,1961,1813,1959,1809,1959,1805,1959,1805,1959,1533,1959,1533,1959,1529,1961,1525,1963,1521,1965,1518,1968,1515,1971,1513,1975,1511,1979,1509,1983,1509,1983,1509,2031,1509" }, { "name": "GOT1, AST1, ASTQTL1, GIG18, cAspAT, cCAT...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1642,1474,1642,1489,1642,1489,1642,1492,1643,1496,1645,1499,1647,1501,1650,1504,1652,1506,1655,1508,1659,1509,1662,1509,1662,1509,2031,1509" }, { "name": "GLUD1, GDH, GDH1, GLUD...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1823,1829,2593,1829" }, { "name": "IL4I1, FIG1, LAAO, LAO", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1640,1475,1640,1506,1640,1506,1640,1509,1641,1513,1643,1516,1645,1518,1648,1521,1650,1523,1653,1525,1657,1526,1660,1526,1660,1526,2008,1526,2008,1526,2011,1526,2015,1525,2018,1524,2020,1522,2023,1520,2025,1517,2027,1515,2028,1512,2028,1509,2028,1509,2028,1509" }, { "name": "C00186", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1975", "y": "1209", "width": "14", "height": "14" }, { "name": "C00269", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1156", "y": "661", "width": "14", "height": "14" }, { "name": "PIP5KL1, PIPKH, bA203J24.5...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1241,715,1241,778" }, { "name": "PLCD3, PLC-delta-3...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1240,777,1290,777" }, { "name": "INPP5J, INPP5, PIB5PA, PIPP...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1288,777,1410,777" }, { "name": "INPP1", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1409,776,1409,831" }, { "name": "IMPA1, IMP, IMPA...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1409,830,1409,891" }, { "name": "IMPA1, IMP, IMPA...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1367,890,1410,890" }, { "name": "INPP4A, INPP4, TVAS1...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1327,890,1369,890" }, { "name": "ISYNA1, INO1, INOS, IPS, IPS_1, IPS-1", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1368,851,1368,891" }, { "name": "INPP1", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1289,890,1329,890" }, { "name": "INPP5J, INPP5, PIB5PA, PIPP...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1289,891,1289,830" }, { "name": "ITPKA, IP3-3KA, IP3KA...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1289,776,1289,831" }, { "name": "ITPK1, ITRPK1", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1290,890,1240,890" }, { "name": "IPPK, C9orf12, INSP5K2, IP5K, IPK1, bA476B13.1", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1241,802,1241,853" }, { "name": "IPMK", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1241,891,1241,850" }, { "name": "C00137", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1409", "y": "890", "width": "14", "height": "14" }, { "name": "C01243", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1289", "y": "890", "width": "14", "height": "14" }, { "name": "C01245", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1289", "y": "777", "width": "14", "height": "14" }, { "name": "C01220", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1409", "y": "777", "width": "14", "height": "14" }, { "name": "C03546", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1409", "y": "830", "width": "14", "height": "14" }, { "name": "C04477", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1241", "y": "890", "width": "14", "height": "14" }, { "name": "C01284", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1241", "y": "851", "width": "14", "height": "14" }, { "name": "C04637", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1241", "y": "777", "width": "14", "height": "14" }, { "name": "C01204", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1241", "y": "803", "width": "14", "height": "14" }, { "name": "C04063", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1328", "y": "890", "width": "14", "height": "14" }, { "name": "C01272", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1289", "y": "830", "width": "14", "height": "14" }, { "name": "C00092", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1368", "y": "851", "width": "14", "height": "14" }, { "name": "C04006", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1368", "y": "890", "width": "14", "height": "14" }, { "name": "INPP4A, INPP4, TVAS1...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1296,660,1296,717" }, { "name": "MTM1, CNM, MTMX, XLMTM...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1240,661,1296,661" }, { "name": "PIK3C2A, CPK, PI3-K-C2(ALPHA), PI3-K-C2A, PI3K-C2-alpha, PI3K-C2alpha...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1240,716,1296,716" }, { "name": "C04549", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1296", "y": "661", "width": "14", "height": "14" }, { "name": "C11554", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1295", "y": "716", "width": "14", "height": "14" }, { "name": "C01194", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1241", "y": "661", "width": "14", "height": "14" }, { "name": "C01277", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1241", "y": "716", "width": "14", "height": "14" }, { "name": "AGMAT", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3279,1505,3279,1554,3279,1554,3279,1558,3277,1562,3275,1566,3273,1569,3269,1573,3266,1575,3262,1577,3258,1579,3254,1579,3254,1579,3232,1579" }, { "name": "C00179", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3279", "y": "1506", "width": "14", "height": "14" }, { "name": "C00750", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3093", "y": "1943", "width": "14", "height": "14" }, { "name": "C01035", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3074", "y": "2109", "width": "14", "height": "14" }, { "name": "C05450", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "441", "y": "1946", "width": "14", "height": "14" }, { "name": "HSD17B4, DBP, MFE-2, MPF-2, PRLTS1, SDR8C1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "503,1945,503,1985" }, { "name": "SCP2, NLTP, NSL-TP, SCP-2, SCP-CHI, SCP-X, SCPX", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "503,1983,503,2023" }, { "name": "ACOT8, HNAACTE, NAP1, PTE-1, PTE-2, PTE1, PTE2, hACTE-III, hTE...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "503,2021,503,2061" }, { "name": "C05448", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "503", "y": "1946", "width": "14", "height": "14" }, { "name": "C05449", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "503", "y": "1984", "width": "14", "height": "14" }, { "name": "C05337", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "503", "y": "2022", "width": "14", "height": "14" }, { "name": "C02528", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "503", "y": "2060", "width": "14", "height": "14" }, { "name": "KYNU, KYNUU", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2691,864,2691,989" }, { "name": "C00094", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "2393", "y": "901", "width": "14", "height": "14" }, { "name": "C00078", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2856", "y": "988", "width": "14", "height": "14" }, { "name": "C00108", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2691", "y": "865", "width": "14", "height": "14" }, { "name": "C00506", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2620", "y": "890", "width": "14", "height": "14" }, { "name": "CTH", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,1209,1720,1200,1720,1200,1720,1195,1722,1191,1724,1187,1727,1183,1731,1179,1735,1176,1739,1174,1743,1172,1748,1172,1748,1172,2487,1172,2487,1172,2492,1172,2496,1170,2500,1168,2504,1165,2508,1161,2511,1157,2513,1153,2515,1149,2515,1144,2515,1144,2515,953,2515,953,2515,948,2517,944,2519,940,2522,936,2526,932,2530,929,2534,927,2538,925,2543,925,2543,925,2562,925" }, { "name": "MPST, MST, TST2, TUM1...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,1210,1720,1200,1720,1200,1720,1195,1722,1191,1724,1187,1727,1183,1731,1179,1735,1176,1739,1174,1743,1172,1748,1172,1748,1172,2399,1172,2399,1172,2404,1172,2408,1170,2412,1168,2416,1165,2420,1161,2423,1157,2425,1153,2427,1149,2427,1144,2427,1144,2427,924" }, { "name": "C00957", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2427", "y": "925", "width": "14", "height": "14" }, { "name": "C05527", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2466", "y": "887", "width": "14", "height": "14" }, { "name": "TPI1, HEL-S-49, TIM, TPI, TPID", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1626,716,1721,716" }, { "name": "C00190", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1864", "y": "320", "width": "14", "height": "14" }, { "name": "FDFT1, DGPT, ERG9, SQS, SS", "fgcolor": "#9EE284", "bgcolor": "#FFFFFF", "type": "line", "coords": "309,1507,309,1488,309,1488,309,1485,310,1481,312,1478,314,1476,317,1473,319,1471,322,1469,326,1468,329,1468,329,1468,384,1468" }, { "name": "C03428", "fgcolor": "#9EE284", "bgcolor": "#9EE284", "type": "circle", "x": "383", "y": "1468", "width": "14", "height": "14" }, { "name": "C00448", "fgcolor": "#9EE284", "bgcolor": "#9EE284", "type": "circle", "x": "309", "y": "1506", "width": "14", "height": "14" }, { "name": "COQ2, CL640, COQ10D1, MSA1, PHB:PPT", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3105,840,3105,884" }, { "name": "COQ3, DHHBMT, DHHBMTASE, UG0215E05, bA9819.1", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3046,910,3046,958" }, { "name": "COQ6, CGI-10, CGI10, COQ10D6", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3105,993,3105,1037" }, { "name": "COQ5", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3105,1036,3105,1080" }, { "name": "COQ7, CAT5, CLK-1, CLK1, COQ10D8", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3105,1080,3105,1124" }, { "name": "COQ3, DHHBMT, DHHBMTASE, UG0215E05, bA9819.1", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3105,1123,3105,1197" }, { "name": "C00156", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3105", "y": "841", "width": "14", "height": "14" }, { "name": "C05848", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3105", "y": "883", "width": "14", "height": "14" }, { "name": "C17554", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3046", "y": "910", "width": "14", "height": "14" }, { "name": "C17561", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3105", "y": "1080", "width": "14", "height": "14" }, { "name": "C17562", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3105", "y": "1123", "width": "14", "height": "14" }, { "name": "C00399", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3105", "y": "1195", "width": "14", "height": "14" }, { "name": "C17559", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3046", "y": "956", "width": "14", "height": "14" }, { "name": "C17552", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3105", "y": "994", "width": "14", "height": "14" }, { "name": "C17560", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3105", "y": "1036", "width": "14", "height": "14" }, { "name": "AKR1B1, ADR, ALDR1, ALR2, AR...", "fgcolor": "#AAA9EC", "bgcolor": "#FFFFFF", "type": "line", "coords": "1315,439,1588,439" }, { "name": "SORD, HEL-S-95n, SORD1", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1315,489,1315,439" }, { "name": "C00794", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1315", "y": "439", "width": "14", "height": "14" }, { "name": "C00095", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1315", "y": "489", "width": "14", "height": "14" }, { "name": "MPI, CDG1B, PMI, PMI1", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1677,525,1677,540,1677,540,1677,543,1676,547,1674,550,1672,552,1669,555,1667,557,1664,559,1660,560,1657,560,1657,560,1460,560" }, { "name": "C00275", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1461", "y": "560", "width": "14", "height": "14" }, { "name": "AKR1D1, 3o5bred, CBAS2, SRD5B1", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "613,1769,662,1769" }, { "name": "AKR1C4, 3-alpha-HSD, C11, CDR, CHDR, DD-4, DD4, HAKRA", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "661,1769,710,1769" }, { "name": "C00410", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "614", "y": "1769", "width": "14", "height": "14" }, { "name": "C05479", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "661", "y": "1769", "width": "14", "height": "14" }, { "name": "C05480", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "709", "y": "1769", "width": "14", "height": "14" }, { "name": "CYP1A1, AHH, AHRR, CP11, CYP1, CYPIA1, P1-450, P450-C, P450DX", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "978,1661,941,1661" }, { "name": "CYP3A4, CP33, CP34, CYP3A, CYP3A3, CYPIIIA3, CYPIIIA4, HLP, NF-25, P450C3, P450PCN1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "978,1730,941,1730" }, { "name": "HSD17B1, 17-beta-HSD, 20-alpha-HSD, E2DH, EDH17B2, EDHB17, HSD17, SDR28C1...", "fgcolor": "#80CCCC", "bgcolor": "#FFFFFF", "type": "line", "coords": "977,1731,977,1660" }, { "name": "C05300", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "977", "y": "1730", "width": "14", "height": "14" }, { "name": "C05141", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "977", "y": "1661", "width": "14", "height": "14" }, { "name": "C00951", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "942", "y": "1661", "width": "14", "height": "14" }, { "name": "C00468", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "942", "y": "1730", "width": "14", "height": "14" }, { "name": "C00184", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1461", "y": "526", "width": "14", "height": "14" }, { "name": "ASAH1, AC, ACDase, ASAH, PHP, PHP32, SMAPME...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "734,821,800,821" }, { "name": "C12126", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "799", "y": "865", "width": "14", "height": "14" }, { "name": "C00836", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "735", "y": "865", "width": "14", "height": "14" }, { "name": "C12144", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "735", "y": "821", "width": "14", "height": "14" }, { "name": "C12145", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "799", "y": "821", "width": "14", "height": "14" }, { "name": "C00630", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2393", "y": "1240", "width": "14", "height": "14" }, { "name": "C03460", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2227", "y": "1240", "width": "14", "height": "14" }, { "name": "C06000", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2150", "y": "1240", "width": "14", "height": "14" }, { "name": "C06001", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2076", "y": "1240", "width": "14", "height": "14" }, { "name": "C06002", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2076", "y": "1313", "width": "14", "height": "14" }, { "name": "GPI, AMF, GNPI, NLK, PGI, PHI, SA-36, SA36", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1677,527,1677,438" }, { "name": "C05852", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2373", "y": "988", "width": "14", "height": "14" }, { "name": "GART, AIRS, GARS, GARTF, PAIS, PGFT, PRGS", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2222,120,2309,120" }, { "name": "PFAS, FGAMS, FGAR-AT, FGARAT, PURL", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2307,120,2386,120" }, { "name": "GART, AIRS, GARS, GARTF, PAIS, PGFT, PRGS", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2383,120,2464,120" }, { "name": "PAICS, ADE2, ADE2H1, AIRC, PAIS", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2462,120,2538,120" }, { "name": "PAICS, ADE2, ADE2H1, AIRC, PAIS", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2536,120,2612,120" }, { "name": "ADSL, AMPS, ASASE, ASL", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2611,120,2686,120" }, { "name": "ATIC, AICAR, AICARFT, HEL-S-70p, IMPCHASE, PURH", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2686,120,2762,120" }, { "name": "GART, AIRS, GARS, GARTF, PAIS, PGFT, PRGS", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2144,120,2224,120" }, { "name": "C04376", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2308", "y": "120", "width": "14", "height": "14" }, { "name": "C04640", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2383", "y": "120", "width": "14", "height": "14" }, { "name": "C04823", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2611", "y": "120", "width": "14", "height": "14" }, { "name": "C04677", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2686", "y": "120", "width": "14", "height": "14" }, { "name": "C04734", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2761", "y": "120", "width": "14", "height": "14" }, { "name": "C03090", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2143", "y": "120", "width": "14", "height": "14" }, { "name": "C03838", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2222", "y": "120", "width": "14", "height": "14" }, { "name": "C03373", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2463", "y": "120", "width": "14", "height": "14" }, { "name": "C04751", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2537", "y": "120", "width": "14", "height": "14" }, { "name": "C17938", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2968", "y": "449", "width": "14", "height": "14" }, { "name": "TPO, MSA, TDH2A, TPX", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2758,593,2733,593,2733,593,2730,593,2728,594,2725,595,2723,597,2721,599,2719,601,2718,604,2717,606,2717,609,2717,609,2717,639" }, { "name": "TPO, MSA, TDH2A, TPX", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2677,638,2718,638" }, { "name": "TPO, MSA, TDH2A, TPX", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2716,638,2759,638" }, { "name": "C01060", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2717", "y": "638", "width": "14", "height": "14" }, { "name": "C02465", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2757", "y": "638", "width": "14", "height": "14" }, { "name": "C02515", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2678", "y": "638", "width": "14", "height": "14" }, { "name": "C01829", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2757", "y": "593", "width": "14", "height": "14" }, { "name": "ACSS2, ACAS2, ACECS, ACS, ACSA, dJ1161H23.1...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1719,1330,1799,1330,1799,1330,1802,1330,1806,1329,1809,1327,1811,1325,1814,1322,1816,1320,1818,1317,1819,1313,1819,1310,1819,1310,1819,1280" }, { "name": "C00024", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1720", "y": "1330", "width": "14", "height": "14" }, { "name": "C00033", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1819", "y": "1281", "width": "14", "height": "14" }, { "name": "C12448", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "3212", "y": "1699", "width": "14", "height": "14" }, { "name": "C06505", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3490", "y": "907", "width": "14", "height": "14" }, { "name": "C00236", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1720", "y": "832", "width": "14", "height": "14" }, { "name": "C00197", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1720", "y": "912", "width": "14", "height": "14" }, { "name": "C00074", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1720", "y": "1110", "width": "14", "height": "14" }, { "name": "C00631", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1720", "y": "1010", "width": "14", "height": "14" }, { "name": "C00111", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1627", "y": "716", "width": "14", "height": "14" }, { "name": "C00118", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1720", "y": "716", "width": "14", "height": "14" }, { "name": "C00267", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1587", "y": "439", "width": "14", "height": "14" }, { "name": "C00668", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1677", "y": "439", "width": "14", "height": "14" }, { "name": "AADAT, KAT2, KATII, KYAT2...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2691,989,2691,976,2691,976,2691,973,2692,969,2694,966,2696,964,2699,961,2701,959,2704,957,2708,956,2711,956,2711,956,2740,956" }, { "name": "C01252", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2740", "y": "956", "width": "14", "height": "14" }, { "name": "KMO, dJ317G22.1", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2691,987,2691,1039" }, { "name": "AFMID, FKF, KF, KFA", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2690,988,2779,988" }, { "name": "C03227", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2691", "y": "1038", "width": "14", "height": "14" }, { "name": "C02700", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2778", "y": "988", "width": "14", "height": "14" }, { "name": "C00328", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2691", "y": "988", "width": "14", "height": "14" }, { "name": "CBSL...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2646,1429,2646,1510" }, { "name": "C02291", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2646", "y": "1429", "width": "14", "height": "14" }, { "name": "GALNS, GALNAC6S, GAS, GalN6S, MPS4A", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1108,192,1164,192" }, { "name": "GNS, G6S", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1259,192,1312,192" }, { "name": "HEXA, TSD...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1310,191,1310,228" }, { "name": "HEXA, TSD...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1259,191,1259,206,1259,206,1259,209,1260,213,1262,216,1264,218,1267,221,1269,223,1272,225,1276,226,1279,226,1279,226,1312,226" }, { "name": "G01391", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1310", "y": "226", "width": "14", "height": "14" }, { "name": "G01945", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1111", "y": "192", "width": "14", "height": "14" }, { "name": "G13073", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1259", "y": "192", "width": "14", "height": "14" }, { "name": "G13074", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1310", "y": "192", "width": "14", "height": "14" }, { "name": "G01977", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1163", "y": "192", "width": "14", "height": "14" }, { "name": "EXTL2, EXTR2...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1311,303,1356,303" }, { "name": "EXT1, EXT, LGCR, LGS, TRPS2, TTV...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1312,304,1272,304" }, { "name": "EXTL1, EXTL...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1273,303,1273,357" }, { "name": "GLCE, HSEPI...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1273,411,1273,355" }, { "name": "G00157", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1355", "y": "303", "width": "14", "height": "14" }, { "name": "G00162", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1312", "y": "303", "width": "14", "height": "14" }, { "name": "G00163", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1273", "y": "304", "width": "14", "height": "14" }, { "name": "G00164", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1273", "y": "356", "width": "14", "height": "14" }, { "name": "HPSE, HPA, HPA1, HPR1, HPSE1, HSE1...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1273,411,1273,473" }, { "name": "SGSH, HSS, MPS3A, SFMD", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1273,631,1273,580" }, { "name": "HGSNAT, HGNAT, MPS3C, RP73, TMEM76", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1273,631,1273,690" }, { "name": "NAGLU, CMT2V, MPS-IIIB, MPS3B, NAG, UFHSD", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1273,748,1273,693" }, { "name": "GUSB, BG, MPS7", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1273,853,1273,801" }, { "name": "GNS, G6S", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1273,851,1273,902" }, { "name": "C00925", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1273", "y": "410", "width": "14", "height": "14" }, { "name": "G13034", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1273", "y": "472", "width": "14", "height": "14" }, { "name": "G13035", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1273", "y": "541", "width": "14", "height": "14" }, { "name": "G13036", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1273", "y": "580", "width": "14", "height": "14" }, { "name": "G13037", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1273", "y": "630", "width": "14", "height": "14" }, { "name": "G13038", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1273", "y": "689", "width": "14", "height": "14" }, { "name": "G13039", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1273", "y": "747", "width": "14", "height": "14" }, { "name": "G13040", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1273", "y": "803", "width": "14", "height": "14" }, { "name": "G09660", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1273", "y": "851", "width": "14", "height": "14" }, { "name": "G02632", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1273", "y": "901", "width": "14", "height": "14" }, { "name": "ACAA1, ACAA, PTHIO, THIO", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1009,469,1059,469" }, { "name": "ACOX1, ACOX, PALMCOX, SCOX...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "1010,468,1010,488,1010,488,1010,491,1011,495,1013,498,1015,500,1018,503,1020,505,1023,507,1027,508,1030,508,1030,508,1059,508" }, { "name": "C16334", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1058", "y": "469", "width": "14", "height": "14" }, { "name": "C16336", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1058", "y": "508", "width": "14", "height": "14" }, { "name": "C00243", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1498", "y": "384", "width": "14", "height": "14" }, { "name": "C00053", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "2441", "y": "854", "width": "14", "height": "14" }, { "name": "C01110", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "3304", "y": "1597", "width": "14", "height": "14" }, { "name": "CEL, BAL, BSDL, BSSL, CELL, CEase, FAP, FAPP, LIPA, MODY8...", "fgcolor": "#80CCB3", "bgcolor": "#FFFFFF", "type": "line", "coords": "959,592,1092,592,1092,592,1095,592,1097,591,1100,590,1102,588,1104,586,1106,584,1107,581,1108,579,1108,576,1108,576,1108,553" }, { "name": "C00641", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "960", "y": "592", "width": "14", "height": "14" }, { "name": "C01885", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1108", "y": "555", "width": "14", "height": "14" }, { "name": "C00097", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2561", "y": "925", "width": "14", "height": "14" }, { "name": "ACO1, ACONS, HEL60, IREB1, IREBP, IREBP1, IRP1...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1888,1562,1880,1550,1880,1550,1878,1547,1876,1544,1873,1540,1870,1536,1867,1532,1864,1528,1861,1525,1859,1522,1856,1519,1856,1519,1854,1518,1854,1518,1851,1515,1848,1513,1845,1510,1841,1506,1837,1503,1833,1500,1830,1497,1826,1495,1823,1493,1823,1493,1830,1497,1830,1497,1827,1495,1823,1493,1819,1491,1815,1489,1811,1487,1806,1484,1802,1482,1798,1481,1795,1479,1795,1479,1783,1473" }, { "name": "IDH1, HEL-216, HEL-S-26, IDCD, IDH, IDP, IDPC, PICD...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1915,1659,1919,1659,1919,1659,1921,1659,1922,1660,1924,1660,1925,1662,1926,1663,1928,1664,1928,1666,1929,1667,1929,1669,1929,1669,1929,1762" }, { "name": "MDH1, HEL-S-32, MDH-s, MDHA, MGC:1375, MOR2...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1537,1570,1537,1570,1537,1570,1544,1557,1553,1544,1564,1531,1576,1519,1589,1507,1603,1496,1617,1487,1630,1480,1642,1476,1642,1476,1642,1476" }, { "name": "IDH1, HEL-216, HEL-S-26, IDCD, IDH, IDP, IDPC, PICD...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1825,1829,1845,1813,1845,1813,1848,1811,1851,1808,1854,1805,1858,1801,1861,1797,1865,1794,1868,1790,1871,1787,1873,1784,1873,1784,1882,1771,1882,1771,1884,1768,1886,1764,1889,1760,1891,1756,1893,1751,1896,1747,1898,1743,1899,1739,1901,1735,1901,1735,1907,1715,1907,1715,1908,1711,1910,1707,1911,1702,1912,1697,1913,1693,1913,1688,1914,1683,1915,1679,1915,1675,1915,1675,1915,1657" }, { "name": "ACO1, ACONS, HEL60, IREB1, IREBP, IREBP1, IRP1...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1914,1660,1914,1644,1914,1644,1914,1641,1914,1638,1913,1635,1913,1631,1912,1628,1912,1624,1911,1621,1911,1618,1910,1615,1910,1615,1911,1618,1911,1618,1910,1615,1909,1612,1908,1609,1907,1605,1906,1602,1905,1598,1904,1595,1903,1592,1902,1589,1902,1589,1904,1596,1904,1596,1903,1593,1902,1590,1901,1587,1899,1584,1898,1580,1896,1577,1894,1574,1893,1571,1892,1569,1892,1569,1888,1562" }, { "name": "C00311", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1915", "y": "1659", "width": "14", "height": "14" }, { "name": "IDH1, HEL-216, HEL-S-26, IDCD, IDH, IDP, IDPC, PICD...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1823,1829,1909,1829,1909,1829,1912,1829,1916,1828,1919,1826,1921,1824,1924,1821,1926,1819,1928,1816,1929,1812,1929,1809,1929,1809,1929,1761" }, { "name": "C05379", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1929", "y": "1761", "width": "14", "height": "14" }, { "name": "C00036", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1642", "y": "1475", "width": "14", "height": "14" }, { "name": "C00158", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1785", "y": "1473", "width": "14", "height": "14" }, { "name": "C00417", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1888", "y": "1561", "width": "14", "height": "14" }, { "name": "SUCLG2, G-SCS, GBETA, GTPSCS...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1704,1863,1678,1859,1678,1859,1675,1859,1673,1858,1670,1857,1667,1857,1664,1856,1661,1855,1658,1854,1655,1854,1653,1853,1653,1853,1638,1848,1638,1848,1636,1847,1633,1846,1631,1845,1628,1844,1625,1843,1622,1841,1620,1840,1617,1838,1615,1837,1615,1837,1606,1832,1606,1832,1604,1831,1602,1829,1599,1827,1597,1825,1594,1823,1592,1821,1589,1819,1588,1817,1586,1816,1586,1816,1570,1800" }, { "name": "DLD, DLDD, DLDH, E3, GCSL, LAD, PHE3...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1702,1863,1712,1864,1712,1864,1717,1864,1722,1864,1728,1863,1734,1863,1740,1862,1746,1861,1751,1860,1757,1859,1761,1858,1761,1858,1770,1855,1770,1855,1774,1854,1779,1852,1785,1850,1790,1848,1796,1845,1802,1843,1807,1840,1811,1837,1815,1835,1815,1835,1826,1829" }, { "name": "SDHA, CMD1GG, FP, PGL5, SDH1, SDH2, SDHF...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1571,1800,1569,1798,1569,1798,1563,1791,1556,1783,1550,1774,1544,1764,1538,1753,1532,1743,1527,1733,1524,1723,1521,1714,1521,1714,1519,1704" }, { "name": "FH, FMRD, HLRCC, LRCC, MCL, MCUL1", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1519,1705,1516,1688,1516,1688,1516,1685,1515,1681,1515,1677,1515,1673,1515,1669,1515,1664,1515,1660,1515,1657,1515,1654,1515,1654,1515,1646,1515,1646,1515,1643,1516,1640,1516,1636,1517,1631,1518,1627,1518,1623,1519,1619,1520,1615,1521,1612,1521,1612,1521,1610,1521,1610,1522,1607,1523,1603,1525,1599,1526,1595,1528,1591,1529,1587,1531,1584,1532,1581,1533,1578,1533,1578,1537,1570" }, { "name": "C00091", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1704", "y": "1862", "width": "14", "height": "14" }, { "name": "C00042", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1571", "y": "1800", "width": "14", "height": "14" }, { "name": "C00122", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1519", "y": "1705", "width": "14", "height": "14" }, { "name": "C00149", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1537", "y": "1571", "width": "14", "height": "14" }, { "name": "C00026", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1824", "y": "1829", "width": "14", "height": "14" }, { "name": "G10526", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "832", "y": "315", "width": "14", "height": "14" }, { "name": "GANAB, G2AN, GIIA, GLUII, PKD3", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "983,61,983,105" }, { "name": "G00010", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "983", "y": "62", "width": "14", "height": "14" }, { "name": "G00011", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "983", "y": "104", "width": "14", "height": "14" }, { "name": "C00233", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2764", "y": "1414", "width": "14", "height": "14" }, { "name": "C01262", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2689", "y": "456", "width": "14", "height": "14" }, { "name": "ACOT2, CTE-IA, CTE1A, MTE1, PTE2, PTE2A, ZAP128...", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1677,526,1677,617" }, { "name": "C05378", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1677", "y": "615", "width": "14", "height": "14" }, { "name": "ALDH1A1, ALDC, ALDH-E1, ALDH1, ALDH11, HEL-9, HEL-S-53e, HEL12, PUMB1, RALDH1...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "235,826,286,826" }, { "name": "BCO1, BCDO, BCDO1, BCMO, BCMO1, BCO", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "236,825,236,885" }, { "name": "DHRS9, 3-alpha-HSD, 3ALPHA-HSD, RDH-E2, RDH-TBE, RDH15, RDHL, RDHTBE, RETSDR8, SDR9C4...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "236,785,236,827" }, { "name": "C02094", "fgcolor": "#9EE284", "bgcolor": "#9EE284", "type": "circle", "x": "236", "y": "884", "width": "14", "height": "14" }, { "name": "C00376", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "236", "y": "826", "width": "14", "height": "14" }, { "name": "C00473", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "236", "y": "785", "width": "14", "height": "14" }, { "name": "C00777", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "284", "y": "826", "width": "14", "height": "14" }, { "name": "C02646", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "3455", "y": "623", "width": "14", "height": "14" }, { "name": "C15804", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "3455", "y": "689", "width": "14", "height": "14" }, { "name": "PRDX6, 1-Cys, AOP2, HEL-S-128m, NSGPx, PRX, aiPLA2, p29", "fgcolor": "#F06292", "bgcolor": "#FFFFFF", "type": "line", "coords": "3647,622,3647,690" }, { "name": "PRDX6, 1-Cys, AOP2, HEL-S-128m, NSGPx, PRX, aiPLA2, p29", "fgcolor": "#F06292", "bgcolor": "#FFFFFF", "type": "line", "coords": "3743,622,3743,690" }, { "name": "C00590", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "3647", "y": "623", "width": "14", "height": "14" }, { "name": "C15805", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "3647", "y": "689", "width": "14", "height": "14" }, { "name": "C02325", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "3743", "y": "623", "width": "14", "height": "14" }, { "name": "C15806", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "3743", "y": "689", "width": "14", "height": "14" }, { "name": "ADI1, APL1, ARD, Fe-ARD, HMFT1638, MTCBP1, Ni-ARD, SIPL, mtnD", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2712,1777,2712,1816" }, { "name": "C08276", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2712", "y": "1814", "width": "14", "height": "14" }, { "name": "C00044", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "3045", "y": "191", "width": "14", "height": "14" }, { "name": "C18231", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "879", "y": "1634", "width": "14", "height": "14" }, { "name": "C07712", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "879", "y": "1612", "width": "14", "height": "14" }, { "name": "SDS, SDH...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,1211,1720,1200,1720,1200,1720,1195,1722,1191,1724,1187,1727,1183,1731,1179,1735,1176,1739,1174,1743,1172,1748,1172,1748,1172,2258,1172,2258,1172,2263,1172,2267,1174,2271,1176,2275,1179,2279,1183,2282,1187,2284,1191,2286,1195,2286,1200,2286,1200,2286,1210" }, { "name": "C00065", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2286", "y": "1209", "width": "14", "height": "14" }, { "name": "AGXT, AGT, AGT1, AGXT1, PH1, SPAT, SPT, TLH6...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "1720,1210,1720,1200,1720,1200,1720,1195,1722,1191,1724,1187,1727,1183,1731,1179,1735,1176,1739,1174,1743,1172,1748,1172,1748,1172,2002,1172,2002,1172,2007,1172,2011,1174,2015,1176,2019,1179,2023,1183,2026,1187,2028,1191,2030,1195,2030,1200,2030,1200,2030,1239" }, { "name": "C00041", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2030", "y": "1238", "width": "14", "height": "14" }, { "name": "C00022", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1720", "y": "1209", "width": "14", "height": "14" }, { "name": "DPYD, DHP, DHPDHASE, DPD", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2577,401,2663,401" }, { "name": "C00106", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2577", "y": "401", "width": "14", "height": "14" }, { "name": "C00429", "fgcolor": "#FF8080", "bgcolor": "#FF8080", "type": "circle", "x": "2663", "y": "401", "width": "14", "height": "14" }, { "name": "C01013", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1842", "y": "1424", "width": "14", "height": "14" }, { "name": "C00222", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1771", "y": "1424", "width": "14", "height": "14" }, { "name": "TREH, TRE, TREA", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1893,303,1893,239,1893,239,1893,236,1892,232,1890,229,1888,227,1885,224,1883,222,1880,220,1876,219,1873,219,1873,219,1800,219" }, { "name": "C00029", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1771", "y": "267", "width": "14", "height": "14" }, { "name": "C00183", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2838", "y": "1360", "width": "14", "height": "14" }, { "name": "C01697", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1381", "y": "477", "width": "14", "height": "14" }, { "name": "C01097", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1381", "y": "583", "width": "14", "height": "14" }, { "name": "C00576", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2664", "y": "1088", "width": "14", "height": "14" }, { "name": "C00114", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "2664", "y": "1154", "width": "14", "height": "14" }, { "name": "OXSM, FASN2D, KASI, KS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "2701,2089,2680,2089,2680,2089,2679,2089,2677,2090,2676,2090,2675,2091,2673,2093,2672,2094,2672,2095,2671,2097,2671,2098,2671,2098,2671,2100,2671,2100,2671,2101,2672,2103,2672,2104,2673,2105,2675,2107,2676,2108,2677,2108,2679,2109,2680,2109,2680,2109,2899,2109,2899,2109,2900,2109,2902,2110,2903,2110,2904,2111,2906,2113,2907,2114,2907,2115,2908,2117,2908,2118,2908,2118,2909,2120,2909,2120,2909,2121,2908,2123,2908,2124,2907,2125,2905,2127,2904,2128,2903,2128,2901,2129,2900,2129,2900,2129,2878,2129" }, { "name": "OXSM, FASN2D, KASI, KS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "2631,2089,2702,2089" }, { "name": "C20376", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "2701", "y": "2089", "width": "14", "height": "14" }, { "name": "OXSM, FASN2D, KASI, KS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "2601,2129,2672,2129" }, { "name": "OXSM, FASN2D, KASI, KS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "2671,2129,2646,2129,2646,2129,2644,2129,2641,2128,2639,2127,2637,2125,2636,2124,2634,2122,2633,2120,2632,2117,2632,2115,2632,2115,2632,2088" }, { "name": "C20372", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "2671", "y": "2129", "width": "14", "height": "14" }, { "name": "C20375", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "2878", "y": "2129", "width": "14", "height": "14" }, { "name": "C19673", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "2602", "y": "2129", "width": "14", "height": "14" }, { "name": "C01209", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "2632", "y": "2089", "width": "14", "height": "14" }, { "name": "DSE, DS-epi1, DSEP, DSEPI, EDSMC2, SART-2, SART2", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1118,400,1175,400" }, { "name": "IDS, MPS2, SIDS", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1143,335,1213,335" }, { "name": "IDUA, IDA, MPS1", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1144,334,1144,374" }, { "name": "ARSB, ASB, G4S, MPS6", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1093,373,1145,373" }, { "name": "HYAL4, CSHY...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1043,373,1095,373" }, { "name": "HYAL4, CSHY...", "fgcolor": "#99CCFF", "bgcolor": "#FFFFFF", "type": "line", "coords": "1044,374,1044,366,1044,366,1044,364,1045,361,1046,359,1048,357,1049,356,1051,354,1053,353,1056,352,1058,352,1058,352,1130,352,1130,352,1132,352,1135,353,1137,354,1139,356,1140,357,1142,359,1143,361,1144,364,1144,366,1144,366,1144,374" }, { "name": "G00160", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1252", "y": "373", "width": "14", "height": "14" }, { "name": "G00872", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1044", "y": "373", "width": "14", "height": "14" }, { "name": "G13041", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1211", "y": "335", "width": "14", "height": "14" }, { "name": "G13042", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1144", "y": "335", "width": "14", "height": "14" }, { "name": "G12336", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1144", "y": "373", "width": "14", "height": "14" }, { "name": "G13043", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1094", "y": "373", "width": "14", "height": "14" }, { "name": "C00401", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1173", "y": "400", "width": "14", "height": "14" }, { "name": "C01490", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1118", "y": "400", "width": "14", "height": "14" }, { "name": "C00331", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2856", "y": "1047", "width": "14", "height": "14" }, { "name": "C00954", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2856", "y": "1149", "width": "14", "height": "14" }, { "name": "C05345", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1677", "y": "526", "width": "14", "height": "14" }, { "name": "C00877", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "991", "y": "1208", "width": "14", "height": "14" }, { "name": "GALM, BLOCK25, GLAT, HEL-S-63p, IBD1", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1425,290,1380,290" }, { "name": "C00984", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1425", "y": "290", "width": "14", "height": "14" }, { "name": "C03366", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2355", "y": "1411", "width": "14", "height": "14" }, { "name": "C16741", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2431", "y": "1411", "width": "14", "height": "14" }, { "name": "CYCS, CYC, HCS, THC4", "fgcolor": "#CC99FF", "bgcolor": "#FFFFFF", "type": "line", "coords": "2394,806,2291,806" }, { "name": "C00059", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "2393", "y": "806", "width": "14", "height": "14" }, { "name": "C00320", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "2294", "y": "806", "width": "14", "height": "14" }, { "name": "AHCYL1, DCAL, IRBIT, PPP1R78, PRO0233, XPVKONA...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2646,1508,2646,1560,2646,1560,2646,1563,2647,1566,2649,1569,2651,1571,2653,1573,2655,1575,2658,1577,2661,1578,2664,1578,2664,1578,2750,1578" }, { "name": "C00155", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2646", "y": "1509", "width": "14", "height": "14" }, { "name": "C00021", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2749", "y": "1578", "width": "14", "height": "14" }, { "name": "C00124", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1381", "y": "290", "width": "14", "height": "14" }, { "name": "C00208", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1634", "y": "219", "width": "14", "height": "14" }, { "name": "C01083", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1801", "y": "219", "width": "14", "height": "14" }, { "name": "C01416", "fgcolor": "#F06292", "bgcolor": "#F06292", "type": "circle", "x": "3147", "y": "1699", "width": "14", "height": "14" }, { "name": "CES1, ACAT, CE-1, CEH, CES2, HMSE, HMSE1, PCE-1, REH, SES1, TGH, hCE-1", "fgcolor": "#F06292", "bgcolor": "#FFFFFF", "type": "line", "coords": "3146,1699,3214,1699" }, { "name": "C00011", "fgcolor": "#CC99FF", "bgcolor": "#CC99FF", "type": "circle", "x": "1340", "y": "1687", "width": "14", "height": "14" }, { "name": "BCKDHA, BCKDE1A, MSU, MSUD1, OVD1A...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2563,1240,2818,1240,2818,1240,2821,1240,2825,1241,2828,1243,2830,1245,2833,1248,2835,1250,2837,1253,2838,1257,2838,1260,2838,1260,2838,1263" }, { "name": "C00141", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2838", "y": "1262", "width": "14", "height": "14" }, { "name": "C15977", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2563", "y": "1240", "width": "14", "height": "14" }, { "name": "C00956", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2101", "y": "1411", "width": "14", "height": "14" }, { "name": "C00188", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2481", "y": "1295", "width": "14", "height": "14" }, { "name": "C00037", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2481", "y": "1209", "width": "14", "height": "14" }, { "name": "ACSS2, ACAS2, ACECS, ACS, ACSA, dJ1161H23.1...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "2166,1424,2075,1424" }, { "name": "C00100", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2076", "y": "1424", "width": "14", "height": "14" }, { "name": "C00163", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2164", "y": "1424", "width": "14", "height": "14" }, { "name": "H6PD, CORTRD1, G6PDH, GDH", "fgcolor": "#8080F7", "bgcolor": "#FFFFFF", "type": "line", "coords": "1739,440,1739,440,1739,440,1739,437,1740,434,1742,431,1744,428,1747,426,1749,424,1752,422,1756,421,1759,421,1759,421,1999,421,1999,421,2002,421,2006,422,2009,424,2011,426,2014,428,2016,431,2018,434,2019,437,2019,440,2019,440,2019,440" }, { "name": "C00345", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "2019", "y": "439", "width": "14", "height": "14" }, { "name": "C01172", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1739", "y": "439", "width": "14", "height": "14" }, { "name": "DTYMK, CDC8, PP3731, TMPK, TYMK", "fgcolor": "#FF8080", "bgcolor": "#FFFFFF", "type": "line", "coords": "2393,710,2393,715,2393,715,2393,718,2394,720,2395,723,2397,725,2399,727,2401,729,2404,730,2406,731,2409,731,2409,731,2430,731" }, { "name": "ENOPH1, E1, MASA, MST145, mtnC", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2712,1779,2712,1771,2712,1771,2712,1768,2713,1764,2715,1761,2717,1759,2720,1756,2722,1754,2725,1752,2729,1751,2732,1751,2732,1751,2848,1751,2848,1751,2851,1751,2855,1752,2858,1754,2860,1756,2863,1759,2865,1761,2867,1764,2868,1768,2868,1771,2868,1771,2868,1779" }, { "name": "C15650", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2868", "y": "1778", "width": "14", "height": "14" }, { "name": "C15606", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2712", "y": "1778", "width": "14", "height": "14" }, { "name": "C20775", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "1842", "y": "1473", "width": "14", "height": "14" }, { "name": "C01042", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2030", "y": "1747", "width": "14", "height": "14" }, { "name": "C12270", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2030", "y": "1814", "width": "14", "height": "14" }, { "name": "C20776", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2030", "y": "1923", "width": "14", "height": "14" }, { "name": "C01081", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3330", "y": "77", "width": "14", "height": "14" }, { "name": "C00378", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3330", "y": "25", "width": "14", "height": "14" }, { "name": "C00068", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3390", "y": "77", "width": "14", "height": "14" }, { "name": "C03028", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3476", "y": "77", "width": "14", "height": "14" }, { "name": "C15812", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3383", "y": "281", "width": "14", "height": "14" }, { "name": "C15811", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3287", "y": "281", "width": "14", "height": "14" }, { "name": "UROS, UROIIIS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3305,841,3396,841" }, { "name": "HMBS, PBG-D, PBGD, PORC, UPS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3224,841,3307,841" }, { "name": "C00931", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3225", "y": "841", "width": "14", "height": "14" }, { "name": "C01024", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3306", "y": "841", "width": "14", "height": "14" }, { "name": "C16677", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "332", "y": "826", "width": "14", "height": "14" }, { "name": "C16678", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "381", "y": "826", "width": "14", "height": "14" }, { "name": "PNP, NP, PRO1837, PUNP", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3421,1862,3330,1862" }, { "name": "NMRK2, ITGB1BP3, MIBP, NRK2...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3504,1862,3408,1862" }, { "name": "NMNAT2, C1orf15, PNAT2...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3573,1862,3501,1862" }, { "name": "NAMPT, 1110035O14Rik, PBEF, PBEF1, VF, VISFATIN", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3331,1863,3331,1854,3331,1854,3331,1850,3333,1845,3335,1841,3338,1838,3341,1835,3344,1832,3348,1830,3353,1828,3357,1828,3357,1828,3476,1828,3476,1828,3480,1828,3485,1830,3489,1832,3492,1835,3495,1838,3498,1841,3500,1845,3502,1850,3502,1854,3502,1854,3502,1863" }, { "name": "PNP, NP, PRO1837, PUNP", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3419,1796,3330,1796" }, { "name": "NMRK2, ITGB1BP3, MIBP, NRK2...", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3524,1796,3408,1796" }, { "name": "C00003", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3572", "y": "1862", "width": "14", "height": "14" }, { "name": "C00153", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3331", "y": "1862", "width": "14", "height": "14" }, { "name": "C00253", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3331", "y": "1796", "width": "14", "height": "14" }, { "name": "C01185", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3523", "y": "1796", "width": "14", "height": "14" }, { "name": "C03150", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3410", "y": "1862", "width": "14", "height": "14" }, { "name": "C00455", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3502", "y": "1862", "width": "14", "height": "14" }, { "name": "C05841", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3410", "y": "1796", "width": "14", "height": "14" }, { "name": "C06423", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "649", "y": "1434", "width": "14", "height": "14" }, { "name": "C01571", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "710", "y": "1434", "width": "14", "height": "14" }, { "name": "C02679", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "771", "y": "1434", "width": "14", "height": "14" }, { "name": "C06424", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "832", "y": "1434", "width": "14", "height": "14" }, { "name": "C01159", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1691", "y": "873", "width": "14", "height": "14" }, { "name": "ALDH2, ALDH-E2, ALDHI, ALDM...", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "2012,242,2012,171" }, { "name": "C00800", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2093", "y": "267", "width": "14", "height": "14" }, { "name": "C02670", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2012", "y": "239", "width": "14", "height": "14" }, { "name": "C00818", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2012", "y": "172", "width": "14", "height": "14" }, { "name": "C00257", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "2064", "y": "302", "width": "14", "height": "14" }, { "name": "C00049", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2030", "y": "1509", "width": "14", "height": "14" }, { "name": "C00047", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2244", "y": "1654", "width": "14", "height": "14" }, { "name": "C00199", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "2019", "y": "526", "width": "14", "height": "14" }, { "name": "ALDH4A1, ALDH4, P5CD, P5CDh", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2592,1830,2592,1646,2592,1646,2592,1643,2593,1639,2595,1636,2597,1634,2600,1631,2602,1629,2605,1627,2609,1626,2612,1626,2612,1626,3075,1626" }, { "name": "C03912", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3074", "y": "1625", "width": "14", "height": "14" }, { "name": "C00025", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2592", "y": "1829", "width": "14", "height": "14" }, { "name": "C00327", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3031", "y": "1415", "width": "14", "height": "14" }, { "name": "C00062", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3279", "y": "1415", "width": "14", "height": "14" }, { "name": "C00555", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3004", "y": "1665", "width": "14", "height": "14" }, { "name": "C00315", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3191", "y": "1943", "width": "14", "height": "14" }, { "name": "ODC1, ODC", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3159,1527,3159,1563,3159,1563,3159,1566,3160,1568,3161,1571,3163,1573,3165,1575,3167,1577,3170,1578,3172,1579,3175,1579,3175,1579,3234,1579" }, { "name": "C00134", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3233", "y": "1579", "width": "14", "height": "14" }, { "name": "ABHD14A-ACY1...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "3073,1558,3139,1558,3139,1558,3142,1558,3146,1557,3149,1555,3151,1553,3154,1550,3156,1548,3158,1545,3159,1541,3159,1538,3159,1538,3159,1527" }, { "name": "C00437", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3074", "y": "1558", "width": "14", "height": "14" }, { "name": "C00077", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "3159", "y": "1528", "width": "14", "height": "14" }, { "name": "C00329", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1494", "y": "669", "width": "14", "height": "14" }, { "name": "C00461", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1366", "y": "748", "width": "14", "height": "14" }, { "name": "C01674", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1432", "y": "748", "width": "14", "height": "14" }, { "name": "C00140", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1432", "y": "777", "width": "14", "height": "14" }, { "name": "C00357", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1500", "y": "777", "width": "14", "height": "14" }, { "name": "C00019", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2749", "y": "1645", "width": "14", "height": "14" }, { "name": "C21015", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2498", "y": "1319", "width": "14", "height": "14" }, { "name": "BCAT1, BCATC, BCT1, ECA39, MECA39, PNAS121, PP18...", "fgcolor": "#FFCC66", "bgcolor": "#FFFFFF", "type": "line", "coords": "2613,1294,2613,1303,2613,1303,2613,1306,2612,1308,2611,1311,2609,1313,2607,1315,2605,1317,2602,1318,2600,1319,2597,1319,2597,1319,2563,1319" }, { "name": "C00109", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2613", "y": "1295", "width": "14", "height": "14" }, { "name": "C02356", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2563", "y": "1319", "width": "14", "height": "14" }, { "name": "C03771", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "3397", "y": "1597", "width": "14", "height": "14" }, { "name": "C21106", "fgcolor": "#80CCCC", "bgcolor": "#80CCCC", "type": "circle", "x": "327", "y": "1863", "width": "14", "height": "14" }, { "name": "C00740", "fgcolor": "#FFCC66", "bgcolor": "#FFCC66", "type": "circle", "x": "2286", "y": "1267", "width": "14", "height": "14" }, { "name": "G13056", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1104", "y": "296", "width": "14", "height": "14" }, { "name": "G10665", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1104", "y": "335", "width": "14", "height": "14" }, { "name": "G10770", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1053", "y": "230", "width": "14", "height": "14" }, { "name": "G13057", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1104", "y": "230", "width": "14", "height": "14" }, { "name": "G13058", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1154", "y": "230", "width": "14", "height": "14" }, { "name": "G10716", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "934", "y": "357", "width": "14", "height": "14" }, { "name": "G11000", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1005", "y": "357", "width": "14", "height": "14" }, { "name": "G10716", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1005", "y": "406", "width": "14", "height": "14" }, { "name": "C16335", "fgcolor": "#80CCB3", "bgcolor": "#80CCB3", "type": "circle", "x": "1010", "y": "469", "width": "14", "height": "14" }, { "name": "GBA3, CBG, CBGL1, GLUC, KLRP", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1753,358,1843,358" }, { "name": "GBA3, CBG, CBGL1, GLUC, KLRP", "fgcolor": "#B3B3E6", "bgcolor": "#FFFFFF", "type": "line", "coords": "1842,359,1842,322,1842,322,1842,319,1843,315,1845,312,1847,310,1850,307,1852,305,1855,303,1859,302,1862,302,1862,302,1894,302" }, { "name": "C00103", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1677", "y": "330", "width": "14", "height": "14" }, { "name": "C00185", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1842", "y": "358", "width": "14", "height": "14" }, { "name": "C00031", "fgcolor": "#8080F7", "bgcolor": "#8080F7", "type": "circle", "x": "1893", "y": "302", "width": "14", "height": "14" }, { "name": "C01898", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1753", "y": "358", "width": "14", "height": "14" }, { "name": "C01935", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "1542", "y": "219", "width": "14", "height": "14" }, { "name": "G00028", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1335", "y": "158", "width": "14", "height": "14" }, { "name": "G00029", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1412", "y": "158", "width": "14", "height": "14" }, { "name": "MOCS2, MCBPE, MOCO1, MOCODB, MPTS", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3155,139,3097,139" }, { "name": "GPHN, GEPH, GPH, GPHRYN, HKPX1, MOCODC", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3211,139,3153,139" }, { "name": "GPHN, GEPH, GPH, GPHRYN, HKPX1, MOCODC", "fgcolor": "#FFB3CC", "bgcolor": "#FFFFFF", "type": "line", "coords": "3266,139,3208,139" }, { "name": "C21310", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3045", "y": "139", "width": "14", "height": "14" }, { "name": "C18239", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3098", "y": "139", "width": "14", "height": "14" }, { "name": "C05924", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3154", "y": "139", "width": "14", "height": "14" }, { "name": "C19848", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3210", "y": "139", "width": "14", "height": "14" }, { "name": "C18237", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3265", "y": "139", "width": "14", "height": "14" }, { "name": "G00428", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "254", "y": "264", "width": "14", "height": "14" }, { "name": "G00889", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "346", "y": "329", "width": "14", "height": "14" }, { "name": "G11492", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "520", "y": "106", "width": "14", "height": "14" }, { "name": "G13080", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "466", "y": "106", "width": "14", "height": "14" }, { "name": "G13081", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "413", "y": "106", "width": "14", "height": "14" }, { "name": "C01068", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2171", "y": "585", "width": "14", "height": "14" }, { "name": "C00789", "fgcolor": "#B3B3E6", "bgcolor": "#B3B3E6", "type": "circle", "x": "2227", "y": "585", "width": "14", "height": "14" }, { "name": "G13027", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1412", "y": "136", "width": "14", "height": "14" }, { "name": "G13087", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1490", "y": "136", "width": "14", "height": "14" }, { "name": "G13091", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1567", "y": "136", "width": "14", "height": "14" }, { "name": "G13092", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1655", "y": "136", "width": "14", "height": "14" }, { "name": "G13093", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1655", "y": "29", "width": "14", "height": "14" }, { "name": "G13094", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1722", "y": "29", "width": "14", "height": "14" }, { "name": "G13095", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1790", "y": "29", "width": "14", "height": "14" }, { "name": "G13096", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1858", "y": "29", "width": "14", "height": "14" }, { "name": "G13097", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1925", "y": "29", "width": "14", "height": "14" }, { "name": "G13098", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1993", "y": "29", "width": "14", "height": "14" }, { "name": "G13026", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1412", "y": "89", "width": "14", "height": "14" }, { "name": "G13084", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1477", "y": "89", "width": "14", "height": "14" }, { "name": "G13082", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1532", "y": "89", "width": "14", "height": "14" }, { "name": "G13088", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1587", "y": "89", "width": "14", "height": "14" }, { "name": "G13086", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1513", "y": "20", "width": "14", "height": "14" }, { "name": "G13083", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1566", "y": "20", "width": "14", "height": "14" }, { "name": "G13090", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1513", "y": "71", "width": "14", "height": "14" }, { "name": "G13100", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1477", "y": "39", "width": "14", "height": "14" }, { "name": "G13085", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1477", "y": "158", "width": "14", "height": "14" }, { "name": "G13089", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1618", "y": "20", "width": "14", "height": "14" }, { "name": "G13028", "fgcolor": "#99CCFF", "bgcolor": "#99CCFF", "type": "circle", "x": "1412", "y": "20", "width": "14", "height": "14" }, { "name": "C06459", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "1920", "y": "1040", "width": "14", "height": "14" }, { "name": "C05674", "fgcolor": "#FF9900", "bgcolor": "#FF9900", "type": "circle", "x": "2038", "y": "1040", "width": "14", "height": "14" }, { "name": "C05770", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3443", "y": "878", "width": "14", "height": "14" }, { "name": "C21284", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3594", "y": "878", "width": "14", "height": "14" }, { "name": "C05766", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3306", "y": "905", "width": "14", "height": "14" }, { "name": "C05768", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3372", "y": "905", "width": "14", "height": "14" }, { "name": "C00853", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3547", "y": "1245", "width": "14", "height": "14" }, { "name": "C15672", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3676", "y": "841", "width": "14", "height": "14" }, { "name": "C15670", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3676", "y": "897", "width": "14", "height": "14" }, { "name": "C01708", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3634", "y": "887", "width": "14", "height": "14" }, { "name": "C00500", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3634", "y": "965", "width": "14", "height": "14" }, { "name": "C00486", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3634", "y": "1010", "width": "14", "height": "14" }, { "name": "C05787", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3634", "y": "1058", "width": "14", "height": "14" }, { "name": "C05791", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3634", "y": "1106", "width": "14", "height": "14" }, { "name": "C06548", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "1491", "y": "1470", "width": "14", "height": "14" }, { "name": "C01380", "fgcolor": "#DA8E82", "bgcolor": "#DA8E82", "type": "circle", "x": "1570", "y": "1470", "width": "14", "height": "14" }, { "name": "C01007", "fgcolor": "#FFB3CC", "bgcolor": "#FFB3CC", "type": "circle", "x": "3094", "y": "605", "width": "14", "height": "14" }, { "name": "C00341", "fgcolor": "#9EE284", "bgcolor": "#9EE284", "type": "circle", "x": "376", "y": "1424", "width": "14", "height": "14" }];

var margin = { left: 30, right: 20, top: 20, bottom: 20 };

var drawCircle = function drawCircle(radius) {
    return 'M ' + (0 - radius) + ' ' + 0 + ' a ' + radius + ' ' + radius + ', 0, 1, 0, ' + radius * 2 + ' ' + 0 + ' ' + 'a ' + radius + ' ' + radius + ', 0, 1, 0, ' + -radius * 2 + ' ' + 0;
};
var drawLine = function drawLine(range, direction) {
    return 'M 0,0 ' + direction + ' ' + Math.abs(range[1] - range[0]);
};

var axisFn = function axisFn(ticks, scalefn, position) {
    var xaxis = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var name = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;


    var pointfn = point$1().range(scalefn.range()).domain(sequence(ticks));

    var axis = {};
    axis.key = xaxis ? 'xaxis' : 'yaixs';
    axis.label = name;
    if (xaxis) {
        axis.tick = { x: scalefn.range()[1] - scalefn.range()[0], dominantBaseline: 'text-after-edge', textAnchor: 'end', fontSize: '1em', fill: '#000000' };
    } else {
        axis.tick = { transform: 'rotate(90)', dominantBaseline: 'text-after-edge', textAnchor: 'start', fontSize: '1em', fill: '#000000' };
    }
    axis.location = xaxis ? { x: min(scalefn.range()), y: position } : { x: position, y: min(scalefn.range()) };
    axis.shape = { d: drawLine(scalefn.range(), xaxis ? 'h' : 'v'), stroke: '#000000', strokeWidth: '1px' };

    //select the right format for label
    var format = median(scalefn.domain()) > 1000 ? format('.2s') : format('.2f');
    return [].concat(toConsumableArray(sequence(ticks).map(function (t) {
        var item = {};
        item.key = (xaxis ? 'xtick' : 'ytick') + t;
        item.location = xaxis ? { x: pointfn(t), y: position } : { y: pointfn(t), x: position };
        item.label = format(scalefn.invert(pointfn(t)));

        if (xaxis) {
            item.tick = { y: 5, dominantBaseline: 'hanging', textAnchor: 'middle', fontSize: '.7em', fill: '#000000' };
        } else {
            item.tick = { x: -5, dominantBaseline: 'central', textAnchor: 'end', fontSize: '.7em', fill: '#000000' };
        }
        item.shape = { d: xaxis ? 'M 0,0 L 0,5' : 'M 0,0 L -5,0', stroke: '#000000', strokeWidth: '1px' };
        return item;
    })), [axis]);
};

var getNode = function getNode(peakids, vals, cohort) {
    var peakid = peakids.split(',');
    var val = vals.split(',');

    return peakid.map(function (d, i) {
        var item = {};
        item.x = cohort;
        item.type = 'sample';
        item.id = +d;
        item.y = +val[i];
        return item;
    });
};

var keggPlot = function keggPlot(metaData, width, height) {
    //set canvas boundry
    var left = 0;
    var right = width;
    var top = 0;
    var bottom = height;

    var pMax = max(metaData.map(function (d) {
        return d.logPval;
    }));
    var pMin = min(metaData.map(function (d) {
        return d.logPval;
    }));
    var rMax = max(metaData.map(function (d) {
        return d.mean_ratio;
    }));
    var rMin = min(metaData.map(function (d) {
        return d.mean_ratio;
    }));
    var pFn = sqrt$1().range([2, 5]).domain([pMin, pMax]).nice();
    var color = linear$2().range(["blue", "red"]).domain([rMin, rMax]);

    var dataSet = keggMap.filter(function (d) {
        return d.type === 'circle';
    });
    var xMax = max(dataSet.map(function (d) {
        return +d.x;
    }));
    var xMin = min(dataSet.map(function (d) {
        return +d.x;
    }));
    var yMax = max(dataSet.map(function (d) {
        return +d.y;
    }));
    var yMin = min(dataSet.map(function (d) {
        return +d.y;
    }));
    var xFn = linear$2().range([left, right]).domain([xMin, xMax]);
    var yFn = linear$2().range([top, bottom]).domain([yMin, yMax]);

    return { plot: keggMap.map(function (g, i) {
            var item = {};
            var nodeDetail = metaData.filter(function (d) {
                return d.kegg_id === g.name;
            });
            item.key = 'k' + i;
            item.type = nodeDetail.length > 0 ? nodeDetail[0].type : 'null';
            item.id = nodeDetail.length > 0 ? nodeDetail[0].id : g.name;
            item.label = g.type !== 'line' && nodeDetail.length > 0 ? ['name :' + nodeDetail[0].metabolite, 'Kegg_id:' + nodeDetail[0].kegg_id, 'mean_ration :' + nodeDetail[0].mean_ratio, 'logPValue :' + nodeDetail[0].logPval].join(';') : null;
            item.location = { x: 0, y: 0 };

            if (g.type === 'line') {
                var coords = g.coords.split(",");
                var Xcoords = coords.filter(function (c, i) {
                    return i % 2 == 0;
                }).map(function (d) {
                    return xFn(+d);
                });
                var Ycoords = coords.filter(function (c, i) {
                    return i % 2 != 0;
                }).map(function (d) {
                    return yFn(+d);
                });
                item.shape = { d: "M" + Xcoords.map(function (d, i) {
                        return d + "," + Ycoords[i];
                    }).join(" L"), stroke: g.fgcolor, strokeWidth: '1px', fill: 'none' };
            } else {

                item.location = { x: xFn(+g.x), y: yFn(+g.y) };
                item.shape = { d: drawCircle(nodeDetail.length > 0 ? pFn(nodeDetail[0].logPval) : 1), fill: nodeDetail.length > 0 ? color(nodeDetail[0].mean_ratio) : g.fgcolor, stroke: nodeDetail.length > 0 ? color(nodeDetail[0].mean_ratio) : g.fgcolor, strokeWidth: '1px' };
            }

            return item;
        }) };
};

var volcanoPlot = function volcanoPlot(plotData, width, height) {
    var pvref = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1.3;
    var vref = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [-1, 1];

    //set canvas boundry
    var left = margin.left;
    var right = width - margin.right;
    var top = margin.top;
    var bottom = height - margin.bottom;
    var circle_ratio = width * 0.007;

    //set x-scale y-scale and color;
    var xMax = max(plotData.map(function (d) {
        return d.mean_ratio;
    }));
    var xMin = min(plotData.map(function (d) {
        return d.mean_ratio;
    }));
    var yMax = max(plotData.map(function (d) {
        return d.logPval;
    }));
    var yMin = min(plotData.map(function (d) {
        return d.logPval;
    }));
    var xFn = linear$2().range([left, right]).domain([xMin, xMax]).nice();
    var yFn = linear$2().range([bottom, top]).domain([0, yMax]).nice();
    var color = function color(x, y) {
        if (y >= pvref && x <= vref[0]) return 'blue';
        if (y >= pvref && x >= vref[1]) return 'red';
        return 'grey';
    };
    // let color = d3.scaleSequential().domain([yMin*xMin,yMax*xMax]).interpolator(d3.interpolateRainbow);

    //vocalno plot need 0 references line 
    var refline = [].concat(toConsumableArray(vref.map(function (v, index) {
        return { key: 'vline' + index,
            location: { x: xFn(v), y: bottom },
            shape: { d: 'M 0,0 L 0,-' + bottom, stroke: '#000000', strokeWidth: '3px', strokeDasharray: "5, 5" }
        };
    })), [{ key: 'pVline',
        label: pvref,
        tick: { x: right - left, dominantBaseline: 'text-after-edge', textAnchor: 'end', fontSize: '1em', fill: '#000000' },
        location: { x: left, y: yFn(pvref) },
        shape: { d: 'M 0,0 L ' + (right - left) + ',0', stroke: '#000000', strokeWidth: '3px', strokeDasharray: "5, 5" }
    }]);
    var axis = [].concat(toConsumableArray(axisFn(10, xFn, bottom, true, 'mean_ratio')), toConsumableArray(axisFn(10, yFn, left, false, 'logPval')));
    return {
        referenceLines: [].concat(toConsumableArray(refline)),
        plot: [].concat(toConsumableArray(plotData.map(function (t) {
            var item = {};
            item.key = 'v' + t.id;
            item.id = t.id;
            item.type = t.type;
            item.label = ['name :' + t.metabolite, 'Kegg_id:' + t.kegg_id, 'mean_ration :' + t.mean_ratio, 'logPValue :' + t.logPval].join(';');
            item.location = { x: xFn(t.mean_ratio), y: yFn(t.logPval) };
            item.shape = { d: drawCircle(circle_ratio), fill: color(t.mean_ratio, t.logPval), stroke: '#ffffff', strokeWidth: '1px' };
            return item;
        }))),
        axis: [].concat(toConsumableArray(axis))
    };
};

var scatterPlot = function scatterPlot(plotData, width, height) {
    var left = margin.left;
    var right = width - margin.right;
    var top = margin.top;
    var bottom = height - margin.bottom;
    var circle_ratio = width * 0.010;

    var data = [].concat(toConsumableArray(getNode(plotData.peakids_1, plotData.vals_1, plotData.cohort1)), toConsumableArray(getNode(plotData.peakids_2, plotData.vals_2, plotData.cohort2)));
    var dataSet = data.sort(function (a, b) {
        return a.x > b.x;
    });
    var xValues = dataSet.map(function (d) {
        return d.id;
    });
    var xFn = point$1().range([left, right]).domain(xValues).padding(0.5);

    var yMax = max(dataSet.map(function (d) {
        return d.y;
    }));
    var yMin = min(dataSet.map(function (d) {
        return d.y;
    }));
    // let ymedian = d3.median(dataSet.map((d)=>d.y))
    var yFn = linear$2().range([bottom, top]).domain([0, yMax]).nice();

    var color = ordinal().range(category20).domain(xValues);
    //draw xaxis

    var xaxis = nest().key(function (d) {
        return d.x;
    }).rollup(function (d) {
        return d.map(function (t) {
            return xFn(t.id);
        });
    }).sortKeys(function (a, b) {
        return a.x > b.x;
    }).entries(data).map(function (g, i) {
        var w = max(g.value) - min(g.value);
        var item = {};
        item.key = 'xaxis' + i;
        item.label = g.key;
        item.location = { x: min(g.value), y: bottom };
        item.shape = { stroke: '#000000', strokeWidth: '1px', fill: 'none' };
        item.shape.d = 'M 0,5 v -5 h' + w + ' v 5';
        item.tick = { dominantBaseline: 'hanging', textAnchor: 'middle', fontSize: '1em', fill: '#000000' };
        item.tick.x = w / 2;
        item.tick.y = 2.5;
        return item;
    });

    var axis = [].concat(toConsumableArray(xaxis), toConsumableArray(axisFn(10, yFn, left, false, 'areatop')));
    return {
        plot: [].concat(toConsumableArray(dataSet.map(function (t) {
            var item = {};
            item.key = t.id;
            item.id = t.id;
            item.type = t.type;
            item.label = t.id;
            item.location = { x: xFn(t.id), y: yFn(t.y) };
            item.shape = { d: drawCircle(circle_ratio), fill: color(t.id), strokeWidth: '1px' };
            return item;
        }))),
        axis: [].concat(toConsumableArray(axis)) };
};

var linePlot = function linePlot(plotData, width, height) {
    var left = margin.left;
    var right = width - margin.right;
    var top = margin.top;
    var bottom = height - margin.bottom;

    var Xmin = min(plotData.map(function (d) {
        return min(d.values.map(function (t) {
            return t.x;
        }));
    }));
    var Xmax = max(plotData.map(function (d) {
        return max(d.values.map(function (t) {
            return t.x;
        }));
    }));
    var Ymin = min(plotData.map(function (d) {
        return min(d.values.map(function (t) {
            return t.y;
        }));
    }));
    var Ymax = max(plotData.map(function (d) {
        return max(d.values.map(function (t) {
            return t.y;
        }));
    }));
    var xScale = linear$2().range([left, right]).domain([Xmin, Xmax]).nice();
    var yScale = linear$2().range([bottom, top]).domain([Ymin, Ymax]).nice();

    var color = ordinal().range(category20);
    var lineFunction = line().x(function (d) {
        return xScale(d.x);
    }).y(function (d) {
        return yScale(d.y);
    }).curve(monotoneX);
    var refline = plotData.map(function (d) {
        return { key: 'vline', location: { x: xScale(d.ref), y: bottom }, shape: { d: 'M 0,0 L 0,-' + bottom, stroke: '#000000', strokeWidth: '1px', strokeDasharray: "5, 5" } };
    });
    var axis = [].concat(toConsumableArray(axisFn(10, xScale, bottom, true, 'rt')), toConsumableArray(axisFn(10, yScale, left, false, 'intensity')));

    return {
        referenceLines: [].concat(toConsumableArray(refline)),
        plot: [].concat(toConsumableArray(plotData.map(function (t) {
            var item = {};
            item.key = t.id;
            item.id = t.id;
            item.label = t.name;
            item.location = { x: 0, y: 0 };
            item.shape = { d: lineFunction(t.values), stroke: color(t.id), strokeWidth: '2px', fill: 'none' };
            return item;
        }))),
        axis: [].concat(toConsumableArray(axis)) };
};

'use strict';

var bind = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
var isBuffer_1 = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
};

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

'use strict';




/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object' && !isArray(obj)) {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge$1(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge$1(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend$1(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

var utils = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer_1,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge$1,
  extend: extend$1,
  trim: trim
};

'use strict';



var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
var enhanceError = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};

'use strict';



/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
var createError = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

'use strict';



/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
var settle = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

'use strict';



function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
var buildURL = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      }

      if (!utils.isArray(val)) {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

'use strict';



/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
var parseHeaders = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
};

'use strict';



var isURLSameOrigin = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);

'use strict';

// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E$1() {
  this.message = 'String contains an invalid character';
}
E$1.prototype = new Error;
E$1.prototype.code = 5;
E$1.prototype.name = 'InvalidCharacterError';

function btoa$1(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E$1();
    }
    block = block << 8 | charCode;
  }
  return output;
}

var btoa_1 = btoa$1;

'use strict';



var cookies = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);

'use strict';







var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || btoa_1;

var xhr = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if (process.env.NODE_ENV !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies$$1 = cookies;

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies$$1.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

'use strict';




var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = xhr;
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = xhr;
  }
  return adapter;
}

var defaults$1 = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults$1.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults$1.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults$1.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

var defaults_1 = defaults$1;

'use strict';



function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

var InterceptorManager_1 = InterceptorManager;

'use strict';



/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
var transformData = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

'use strict';

var isCancel = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

'use strict';






/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
var dispatchRequest = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults_1.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
var isAbsoluteURL = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
var combineURLs = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

'use strict';








/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager_1(),
    response: new InterceptorManager_1()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults_1, this.defaults, { method: 'get' }, config);
  config.method = config.method.toLowerCase();

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

var Axios_1 = Axios;

'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

var Cancel_1 = Cancel;

'use strict';



/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel_1(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

var CancelToken_1 = CancelToken;

'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
var spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

'use strict';






/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios_1(defaultConfig);
  var instance = bind(Axios_1.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios_1.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios$2 = createInstance(defaults_1);

// Expose Axios class to allow class inheritance
axios$2.Axios = Axios_1;

// Factory for creating new instances
axios$2.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults_1, instanceConfig));
};

// Expose Cancel & CancelToken
axios$2.Cancel = Cancel_1;
axios$2.CancelToken = CancelToken_1;
axios$2.isCancel = isCancel;

// Expose all/spread
axios$2.all = function all(promises) {
  return Promise.all(promises);
};
axios$2.spread = spread;

var axios_1 = axios$2;

// Allow use of default import syntax in TypeScript
var default_1 = axios$2;

axios_1.default = default_1;

var axios = axios_1;

var width$1 = 1000;
var height$1 = 500;
var plotType$1 = 'volcano';
var dataset$2 = new Array();
var plotsData = new Array();

var dispatcher = dispatch('updateUI');

var forwardClickHandler = function forwardClickHandler(d) {
    var _this = this;

    // console.log(d);
    var metadata = dataset$2;
    var plotData = {};
    if (d.type === 'metabolite') {
        plotData.title = 'scatter plot ' + metadata[d.id].metabolite + '(' + metadata[d.id].kegg_id + ')';
        plotData.data = scatterPlot(metadata[d.id], width$1, height$1);
        plotsData = [].concat(toConsumableArray(plotsData.filter(function (d, i) {
            return i < 1;
        })), [plotData]);
        dispatcher.call('updateUI', this, plotsData);
    } else {
        axios.get('http://10.4.1.60/mtb/getData.php?type=mtb_chromat&peak_ids=' + d.id.toString()).then(function (res) {
            var lines = res.data.data.values.map(function (d) {
                var line = {};
                line.id = 'peak' + d.peak_id;
                line.name = d.sample_name;
                var x = d.eic_rt.split(',').map(function (d) {
                    return Number(d);
                });
                var y = d.eic_intensity.split(',').map(function (d) {
                    return Number(d);
                });
                line.values = x.map(function (t, i) {
                    return { x: t, y: y[i] };
                }).filter(function (c) {
                    return c.x >= Number(d.min_rt) && c.x <= Number(d.max_rt);
                });
                line.ref = d.rt;
                return line;
            });
            plotData.title = 'Chromatogram' + ' Peak ID: ' + res.data.data.values[0].peak_id;
            plotData.data = linePlot(lines, width$1, height$1);
            plotsData = [].concat(toConsumableArray(plotsData.filter(function (d, i) {
                return i < 2;
            })), [plotData]);
            dispatcher.call('updateUI', _this, plotsData);
        });
    }
};

// }

var cohortPanel = function cohortPanel(_selection) {

    plotsData = [plotType$1 === 'volcano' ? { title: 'volcano plot', data: volcanoPlot(dataset$2, width$1, height$1) } : { title: 'Kegg Map', data: keggPlot(dataset$2, width$1, height$1) }];

    dispatcher.on('updateUI', function (plots) {
        _selection.selectAll('*').remove();
        _selection.attr('height', height$1 * plots.length);
        _selection.selectAll('div').data(plots).enter().append('div')
        // .attr('transform',(d,i)=>d3.zoomIdentity.translate(0,height*i))
        .each(function (d) {
            select(this).call(canvasPanel.setClick(forwardClickHandler).setHeight(height$1).setWidth(width$1));
        });
    });

    dispatcher.call('updateUI', this, plotsData);
};

cohortPanel.bindData = function (data) {
    if (!arguments.length) return dataset$2;
    dataset$2 = data;
    return this;
};

cohortPanel.setHeight = function (data) {
    if (!arguments.length) return height$1;
    height$1 = data;
    return this;
};

cohortPanel.setWidth = function (data) {
    if (!arguments.length) return dataset$2;
    width$1 = data;
    return this;
};

cohortPanel.setType = function (data) {
    if (!arguments.length) return plotType$1;
    plotType$1 = data;
    return this;
};

var width = 1000;
var height = 500;
var plotType = 'volcano';
var dataset$1 = new Array();

var renderModule = function renderModule(node) {

	var cleandata = dataset$1.filter(function (d) {
		return d.logPval !== null && !isNaN(d.logPval);
	}).map(function (d, i) {
		var item = {};
		Object.assign(item, d);
		item.id = i;
		item.type = 'metabolite';
		return item;
	});

	node.append('div').call(cohortPanel.bindData(cleandata).setType(plotType).setWidth(width).setHeight(height));
};

renderModule.bindData = function (data) {
	if (!arguments.length) return dataset$1;
	dataset$1 = [].concat(toConsumableArray(data));
	return this;
};

renderModule.setHeight = function (data) {
	if (!arguments.length) return height;
	height = data;
	return this;
};

renderModule.setWidth = function (data) {
	if (!arguments.length) return dataset$1;
	width = data;
	return this;
};

renderModule.setType = function (data) {
	if (!arguments.length) return plotType;
	plotType = data;
	return this;
};

renderModule.remove = function (node) {
	node.selectAll('*').remove();
};

return renderModule;

})));
