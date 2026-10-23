/*
 * dc-lite.js — a tiny renderer for NeoDrive's page templates.
 *
 * Each page keeps its markup inside <x-dc> and its logic in a
 * <script type="text/x-dc" data-dc-script> block (class Component extends DCLogic).
 * This file reads both, renders the page, and re-renders when setState() is called.
 *
 * Supported template syntax:
 *   {{ path.to.value }}            text or attribute value
 *   onClick="{{ fn }}"             event handlers (onClick, onChange, onInput)
 *   <sc-for list="{{ items }}" as="item">  repeat children ($index in scope)
 *   <sc-if value="{{ cond }}">     render children when truthy
 *   data-dc-attr-NAME="{{ x }}"  sets NAME (for SVG attributes the browser would reject early)
 *   data-for="{{ items }}" data-as="item"  repeat an element's children
 *                                  (used inside <table>, where custom tags are not allowed)
 */
(function () {
  'use strict';

  var pending = false;
  var app = null;

  function DCLogic(props) {
    this.props = props || {};
    this.state = {};
  }
  DCLogic.prototype.setState = function (patch) {
    var next = typeof patch === 'function' ? patch(this.state, this.props) : patch;
    this.state = Object.assign({}, this.state, next);
    schedule();
  };
  DCLogic.prototype.forceUpdate = function () { schedule(); };
  window.DCLogic = DCLogic;

  function schedule() {
    if (pending) return;
    pending = true;
    Promise.resolve().then(function () { pending = false; render(); });
  }

  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;

  function lookup(path, scope) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^(['"]).*\1$/.test(path)) return path.slice(1, -1);
    var parts = path.split('.');
    var v = scope;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }

  function interpolate(str, scope) {
    return str.replace(HOLE, function (_, p) {
      var v = lookup(p, scope);
      return v == null ? '' : String(v);
    });
  }

  function evalAttr(value, scope) {
    var m = value.match(WHOLE);
    return m ? lookup(m[1], scope) : interpolate(value, scope);
  }

  function childScope(scope, name, item, index) {
    var s = Object.create(scope);
    s[name] = item;
    s.$index = index;
    return s;
  }

  function renderChildren(nodes, scope, out) {
    for (var i = 0; i < nodes.length; i++) renderNode(nodes[i], scope, out);
  }

  function renderNode(node, scope, out) {
    if (node.nodeType === 3) {
      var text = node.nodeValue;
      if (text.indexOf('{{') === -1) { out.appendChild(document.createTextNode(text)); return; }
      var m = text.match(WHOLE);
      var val = m ? lookup(m[1], scope) : interpolate(text, scope);
      out.appendChild(document.createTextNode(val == null ? '' : String(val)));
      return;
    }
    if (node.nodeType !== 1) return;

    var tag = node.localName;
    if (tag === 'sc-for') {
      var list = evalAttr(node.getAttribute('list') || '', scope) || [];
      var as = node.getAttribute('as') || 'item';
      for (var i = 0; i < list.length; i++) renderChildren(node.childNodes, childScope(scope, as, list[i], i), out);
      return;
    }
    if (tag === 'sc-if') {
      if (evalAttr(node.getAttribute('value') || '', scope)) renderChildren(node.childNodes, scope, out);
      return;
    }

    var el = node.namespaceURI === 'http://www.w3.org/2000/svg'
      ? document.createElementNS(node.namespaceURI, tag)
      : document.createElement(tag);

    var repeat = null, repeatAs = 'item';
    for (var a = 0; a < node.attributes.length; a++) {
      var attr = node.attributes[a];
      var name = attr.name;
      if (name.indexOf('data-dc-attr-') === 0) name = name.slice(13);
      if (name === 'data-for') { repeat = evalAttr(attr.value, scope) || []; continue; }
      if (name === 'data-as') { repeatAs = attr.value; continue; }
      if (name.indexOf('hint-') === 0) continue;
      if (/^on[a-z]+$/i.test(name) && name.length > 2) {
        var fn = evalAttr(attr.value, scope);
        if (typeof fn === 'function') {
          var evt = name.slice(2).toLowerCase();
          if (evt === 'change' && (tag === 'input' || tag === 'textarea')) evt = 'input';
          el.__h = el.__h || {};
          el.__h[evt] = fn;
        }
        continue;
      }
      var v = evalAttr(attr.value, scope);
      if (v == null || typeof v === 'function') continue;
      if (typeof v === 'boolean' && name.indexOf('aria-') !== 0 && name.indexOf('data-') !== 0) {
        if (v) el.setAttribute(name, '');
        continue;
      }
      el.setAttribute(name, String(v));
    }

    if (repeat) {
      for (var r = 0; r < repeat.length; r++) renderChildren(node.childNodes, childScope(scope, repeatAs, repeat[r], r), el);
    } else {
      renderChildren(node.childNodes, scope, el);
    }
    out.appendChild(el);
  }

  /* ---- patch the live DOM so inputs keep focus and sliders keep dragging ---- */
  function morphChildren(live, next) {
    var a = Array.prototype.slice.call(live.childNodes);
    var b = Array.prototype.slice.call(next.childNodes);
    for (var i = 0; i < b.length; i++) {
      if (i >= a.length) live.appendChild(b[i]);
      else morphNode(a[i], b[i]);
    }
    for (var j = b.length; j < a.length; j++) live.removeChild(a[j]);
  }

  function morphNode(a, b) {
    if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) { a.parentNode.replaceChild(b, a); return; }
    if (a.nodeType === 3) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
    if (a.nodeType !== 1) return;
    var k;
    for (k = a.attributes.length - 1; k >= 0; k--) {
      var n = a.attributes[k].name;
      if (!b.hasAttribute(n)) a.removeAttribute(n);
    }
    for (k = 0; k < b.attributes.length; k++) {
      var at = b.attributes[k];
      if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
    }
    a.__h = b.__h;
    if ((a.localName === 'input' || a.localName === 'textarea') && b.hasAttribute('value')) {
      if (document.activeElement !== a || a.type === 'range') {
        if (a.value !== b.getAttribute('value')) a.value = b.getAttribute('value');
      }
    }
    morphChildren(a, b);
  }

  function dispatch(e) {
    var node = e.target;
    while (node && node !== app.root.parentNode) {
      if (node.__h && node.__h[e.type]) { node.__h[e.type](e); return; }
      node = node.parentNode;
    }
  }

  function render() {
    var vals = app.comp.renderVals ? app.comp.renderVals() : {};
    var frag = document.createElement('div');
    renderChildren(app.template, vals, frag);
    if (!app.mounted) {
      while (frag.firstChild) app.root.appendChild(frag.firstChild);
      app.mounted = true;
    } else {
      morphChildren(app.root, frag);
    }
  }

  function boot() {
    var host = document.querySelector('x-dc');
    var script = document.querySelector('script[data-dc-script]');
    if (!host || !script) return;

    var helmet = host.querySelector('helmet');
    if (helmet) {
      while (helmet.firstChild) document.head.appendChild(helmet.firstChild);
      helmet.parentNode.removeChild(helmet);
    }

    var props = {};
    try {
      var decl = JSON.parse(script.getAttribute('data-props') || '{}');
      Object.keys(decl).forEach(function (k) {
        if (k.charAt(0) !== '$' && decl[k] && 'default' in decl[k]) props[k] = decl[k].default;
      });
    } catch (err) { console.error('data-props could not be read', err); }

    var Component = new Function('DCLogic', script.textContent + '\nreturn Component;')(DCLogic);

    var root = document.createElement('div');
    root.className = 'dc-root';
    host.parentNode.insertBefore(root, host);
    var template = Array.prototype.slice.call(host.childNodes);
    host.parentNode.removeChild(host);

    app = { comp: new Component(props), template: template, root: root, mounted: false };
    ['click', 'input', 'change'].forEach(function (t) { root.addEventListener(t, dispatch); });
    render();
    if (typeof app.comp.componentDidMount === 'function') app.comp.componentDidMount();

    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
