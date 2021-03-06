(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.nomui = {}));
}(this, (function (exports) { 'use strict';

  // Events
  // -----------------
  // Thanks to:
  //  - https://github.com/documentcloud/backbone/blob/master/backbone.js
  //  - https://github.com/joyent/node/blob/master/lib/events.js

  // Regular expression used to split event strings
  const eventSplitter = /\s+/;

  // A module that can be mixed in to *any object* in order to provide it
  // with custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = new Events();
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  function Events() {}

  // Bind one or more space separated events, `events`, to a `callback`
  // function. Passing `"all"` will bind the callback to all events fired.
  Events.prototype.on = function (events, callback, context) {
    if (!callback) return this

    const cache = this.__events || (this.__events = {});
    events = events.split(eventSplitter);

    let event;
    let list;
    while ((event = events.shift())) {
      list = cache[event] || (cache[event] = []);
      list.push(callback, context);
    }

    return this
  };

  Events.prototype.once = function (events, callback, context) {
    const that = this;
    const cb = function () {
      that.off(events, cb);
      callback.apply(context || that, arguments);
    };
    return this.on(events, cb, context)
  };

  // Remove one or many callbacks. If `context` is null, removes all callbacks
  // with that function. If `callback` is null, removes all callbacks for the
  // event. If `events` is null, removes all bound callbacks for all events.
  Events.prototype.off = function (events, callback, context) {
    let cache;
    let event;
    let list;
    let i;

    // No events, or removing *all* events.
    if (!(cache = this.__events)) return this
    if (!(events || callback || context)) {
      delete this.__events;
      return this
    }

    events = events ? events.split(eventSplitter) : Object.keys(cache);

    // Loop through the callback list, splicing where appropriate.
    while ((event = events.shift())) {
      list = cache[event];
      if (!list) continue

      if (!(callback || context)) {
        delete cache[event];
        continue
      }

      for (i = list.length - 2; i >= 0; i -= 2) {
        if (!((callback && list[i] !== callback) || (context && list[i + 1] !== context))) {
          list.splice(i, 2);
        }
      }
    }

    return this
  };

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  Events.prototype.trigger = function (events) {
    let cache;
    let event;
    let all;
    let list;
    let i;
    let len;
    const rest = [];
    let returned = true;
    if (!(cache = this.__events)) return this

    events = events.split(eventSplitter);

    // Fill up `rest` with the callback arguments.  Since we're only copying
    // the tail of `arguments`, a loop is much faster than Array#slice.
    for (i = 1, len = arguments.length; i < len; i++) {
      rest[i - 1] = arguments[i];
    }

    // For each event, walk through the list of callbacks twice, first to
    // trigger the event, then to trigger any `"all"` callbacks.
    while ((event = events.shift())) {
      // Copy callback lists to prevent modification.
      if ((all = cache.all)) all = all.slice();
      if ((list = cache[event])) list = list.slice();

      // Execute event callbacks except one named "all"
      if (event !== 'all') {
        returned = triggerEvents(list, rest, this) && returned;
      }

      // Execute "all" callbacks.
      returned = triggerEvents(all, [event].concat(rest), this) && returned;
    }

    return returned
  };

  Events.prototype.emit = Events.prototype.trigger;

  // Mix `Events` to object instance or Class function.
  Events.mixTo = function (receiver) {
    const proto = Events.prototype;

    if (isFunction(receiver)) {
      for (const key in proto) {
        if (proto.hasOwnProperty(key)) {
          receiver.prototype[key] = proto[key];
        }
      }
      Object.keys(proto).forEach(function (key) {
        receiver.prototype[key] = proto[key];
      });
    } else {
      const event = new Events();
      for (const key in proto) {
        if (proto.hasOwnProperty(key)) {
          copyProto(key, event);
        }
      }
    }

    function copyProto(key, event) {
      receiver[key] = function () {
        proto[key].apply(event, Array.prototype.slice.call(arguments));
        return this
      };
    }
  };

  // Execute callbacks
  function triggerEvents(list, args, context) {
    let pass = true;

    if (list) {
      let i = 0;
      const l = list.length;
      const a1 = args[0];
      const a2 = args[1];
      const a3 = args[2];
      // call is faster than apply, optimize less than 3 argu
      // http://blog.csdn.net/zhengyinhui100/article/details/7837127
      switch (args.length) {
        case 0:
          for (; i < l; i += 2) {
            pass = list[i].call(list[i + 1] || context) !== false && pass;
          }
          break
        case 1:
          for (; i < l; i += 2) {
            pass = list[i].call(list[i + 1] || context, a1) !== false && pass;
          }
          break
        case 2:
          for (; i < l; i += 2) {
            pass = list[i].call(list[i + 1] || context, a1, a2) !== false && pass;
          }
          break
        case 3:
          for (; i < l; i += 2) {
            pass = list[i].call(list[i + 1] || context, a1, a2, a3) !== false && pass;
          }
          break
        default:
          for (; i < l; i += 2) {
            pass = list[i].apply(list[i + 1] || context, args) !== false && pass;
          }
          break
      }
    }
    // trigger will return false if one of the callbacks return false
    return pass
  }

  function isFunction(func) {
    return Object.prototype.toString.call(func) === '[object Function]'
  }

  String.prototype.trim = function (characters) {
    return this.replace(new RegExp(`^${characters}+|${characters}+$`, 'g'), '')
  };

  String.prototype.startWith = function (str) {
    const reg = new RegExp(`^${str}`);
    return reg.test(this)
  };

  String.prototype.trimEnd = function (characters) {
    return this.replace(new RegExp(`${characters}+$`, 'g'), '')
  };

  String.prototype.prepend = function (character) {
    if (this[0] !== character) {
      return (character + this).toString()
    }

    return this.toString()
  };

  String.prototype.format = function (args) {
    let result = this;
    if (arguments.length > 0) {
      if (arguments.length === 1 && typeof args === 'object') {
        for (const key in args) {
          if (args[key] !== undefined) {
            const reg = new RegExp(`({${key}})`, 'g');
            result = result.replace(reg, args[key]);
          }
        }
      } else {
        for (let i = 0; i < arguments.length; i++) {
          if (arguments[i] !== undefined) {
            const reg = new RegExp(`({)${i}(})`, 'g');
            result = result.replace(reg, arguments[i]);
          }
        }
      }
    }
    return result
  };

  /**
   * Strict object type check. Only returns true
   * for plain JavaScript objects.
   *
   * @param {*} obj
   * @return {Boolean}
   */

  const { toString } = Object.prototype;
  const OBJECT_STRING = '[object Object]';
  function isPlainObject(obj) {
    if (Object.prototype.toString.call(obj) !== OBJECT_STRING) {
      return false
    }

    const prototype = Object.getPrototypeOf(obj);
    return prototype === null || prototype === Object.prototype
  }

  function isString(obj) {
    // ??????????????????????????????
    return Object.prototype.toString.call(obj) === '[object String]'
  }

  function isFunction$1(val) {
    return toString.call(val) === '[object Function]'
  }

  /**
   * Hyphenate a camelCase string.
   *
   * @param {String} str
   * @return {String}
   */

  const hyphenateRE = /([^-])([A-Z])/g;
  function hyphenate(str) {
    return str.replace(hyphenateRE, '$1-$2').replace(hyphenateRE, '$1-$2').toLowerCase()
  }

  function htmlEncode(value) {
    // Create a in-memory element, set its inner text (which is automatically encoded)
    // Then grab the encoded contents back out. The element never exists on the DOM.
    const textarea = document.createElement('textarea');
    textarea.textContent = value;
    return textarea.innerHTML
  }

  function extend() {
    let options;
    let name;
    let src;
    let copy;
    let _clone;
    let target = arguments[0] || {};
    let i = 1;
    const { length } = arguments;
    let deep = false;

    // Handle a deep copy situation
    if (typeof target === 'boolean') {
      deep = target;

      // Skip the boolean and the target
      target = arguments[i] || {};
      i++;
    }
    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== 'object' && !isFunction$1(target)) {
      target = {};
    }

    for (; i < length; i++) {
      // Only deal with non-null/undefined values
      if ((options = arguments[i]) != null) {
        // Extend the base object
        for (name in options) {
          src = target[name];
          copy = options[name];
          // Prevent never-ending loop
          if (target === copy) {
            continue
          }
          // Recurse if we're merging plain objects
          if (deep && copy && isPlainObject(copy)) {
            _clone = src && isPlainObject(src) ? src : {};
            // Never move original objects, clone them
            target[name] = extend(deep, _clone, copy);
            // Don't bring in undefined values
          } else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }
    // Return the modified object
    return target
  }

  function clone(from) {
    if (isPlainObject(from)) {
      return JSON.parse(JSON.stringify(from))
    }

    return from
  }

  function accessProp(options, key) {
    if (typeof key === 'string') {
      // Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
      const parts = key.split('.');
      let curOption;
      key = parts.shift();
      if (parts.length) {
        curOption = options[key];
        for (let i = 0; i < parts.length - 1; i++) {
          curOption[parts[i]] = curOption[parts[i]] || {};
          curOption = curOption[parts[i]];
        }
        key = parts.pop();
        return curOption[key] === undefined ? null : curOption[key]
      }

      return options[key] === undefined ? null : options[key]
    }
  }

  function pathCombine() {
    let path = '';
    const args = Array.from(arguments);

    args.forEach(function (item, index) {
      if (index > 0) {
        path += `/${item.trim('/')}`;
      } else {
        path += item.trimEnd('/');
      }
    });

    return path
  }

  const uppercaseRegex = /[A-Z]/g;
  function toLowerCase(capital) {
    return `-${capital.toLowerCase()}`
  }
  function normalizeKey(key) {
    return key[0] === '-' && key[1] === '-'
      ? key
      : key === 'cssFloat'
      ? 'float'
      : key.replace(uppercaseRegex, toLowerCase)
  }

  function isNumeric(val) {
    const num = Number(val);
    const type = typeof val;
    return (
      (val != null &&
        type !== 'boolean' &&
        (type !== 'string' || val.length) &&
        !Number.isNaN(num) &&
        Number.isFinite(num)) ||
      false
    )
  }

  function newGuid() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (n) {
      // eslint-disable-next-line no-bitwise
      const t = (Math.random() * 16) | 0;
      // eslint-disable-next-line no-bitwise
      const i = n === 'x' ? t : (t & 3) | 8;
      return i.toString(16)
    })
  }

  function isPromiseLike(promiseLike) {
    return (
      promiseLike !== null &&
      (typeof promiseLike === 'object' || typeof promiseLike === 'function') &&
      typeof promiseLike.then === 'function'
    )
  }

  function formatDate(date, format) {
    if (!date) {
      return null
    }
    let mydate = null;
    if (typeof date === 'string') {
      const arr = date
        .replace(/\d+(?=-[^-]+$)/, function (a) {
          return parseInt(a, 10) - 1
        })
        .match(/\d+/g);

      mydate = new Date(...arr);
    } else if (typeof date === 'number') {
      mydate = new Date(date);
    }

    return new Date(mydate).format(format)
  }

  function isDate(date) {
    return toString.call(date) === '[object Date]'
  }

  /**
   * ??????url??????query???????????????
   * @param {string} url ????????????url
   * @returns Object
   */
  function parseToQuery(url) {
    // ??????url????????????????????????
    const queryStr = /.+\?(.+)$/.exec(url)[1];
    const queryArr = queryStr.split('&');
    const paramsObj = {};
    queryArr.forEach((param) => {
      if (/=/.test(param)) {
        // ??????= ???????????????
        // eslint-disable-next-line prefer-const
        let [key, val] = param.split('=');
        // ??????
        val = decodeURIComponent(val);
        // ??????????????????????????????
        val = /^\d+$/.test(val) ? parseFloat(val) : val;
        // ??????????????????key?????????????????????
        if (paramsObj.hasOwnProperty(key)) {
          paramsObj[key] = [].concat(paramsObj[key], val);
        } else {
          paramsObj[key] = val;
        }
      }
      // ??????=???????????????true
      else {
        paramsObj[param] = true;
      }
    });

    return paramsObj
  }

  /**
   * ??????????????????string query??????
   * @param {object}} obj
   * @returns
   */
  function parseToQueryString(obj) {
    const result = [];
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        result.push(`${key}=${encodeURIComponent(value)}`);
      }
    }
    return result.join('&')
  }

  function isFalsy(value) {
    if (value === 0) return false
    return !value
  }

  var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    isPlainObject: isPlainObject,
    isString: isString,
    isFunction: isFunction$1,
    hyphenate: hyphenate,
    htmlEncode: htmlEncode,
    extend: extend,
    clone: clone,
    accessProp: accessProp,
    pathCombine: pathCombine,
    normalizeKey: normalizeKey,
    isNumeric: isNumeric,
    newGuid: newGuid,
    isPromiseLike: isPromiseLike,
    formatDate: formatDate,
    isDate: isDate,
    parseToQuery: parseToQuery,
    parseToQueryString: parseToQueryString,
    isFalsy: isFalsy
  });

  class ComponentDescriptor {
    constructor(tagOrComponent, props, children, mixins) {
      this.tagOrComponent = tagOrComponent;
      this.props = props || {};
      this.children = children;
      this.mixins = Array.isArray(mixins) ? mixins : [];
    }

    getProps() {
      if (this.props instanceof ComponentDescriptor) {
        this.mixins = this.mixins.concat(this.props.mixins);
        this.props = this.props.getProps();
      }
      if (this.tagOrComponent) {
        this.props.component = this.tagOrComponent;
      }
      if (this.children) {
        this.props.children = this.children;
      }
      return this.props
    }
  }

  const components = {};
  const MIXINS = [];
  let keySeq = 0;

  class Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'div',
        reference: document.body,
        placement: 'append',
        autoRender: true,
        renderIf: true,

        hidden: false,
        disabled: false,
        selected: false,
        expanded: false,

        selectable: {
          byClick: false,
          byHover: false,
          canRevert: false,
          selectedProps: null,
          unselectedProps: null,
        },
        expandable: {
          byClick: false,
          byHover: false,
          target: null,
          indicator: null,
          byIndicator: false,
          expandedProps: false,
          collapsedProps: false,
        },
        prefixClass: 'nom-',
      };
      this.props = Component.extendProps(defaults, props);

      this.parent = null;
      this.root = null;
      this.rendered = false;
      this.mixins = [];
      this.firstRender = true;

      this._propStyleClasses = [];

      mixins && this._mixin(mixins);

      if (this.props.key) {
        this.key = this.props.key;
        if (isFunction$1(this.props.key)) {
          this.key = this.props.key.call(this, this);
        }
      }

      if (this.key === undefined || this.key === null) {
        this.key = `__key${++keySeq}`;
      }

      this.referenceComponent =
        this.props.reference instanceof Component
          ? this.props.reference
          : this.props.reference.component;
      if (this.referenceComponent) {
        if (this.props.placement === 'append') {
          this.parent = this.referenceComponent;
        } else {
          this.parent = this.referenceComponent.parent;
        }
      }

      if (this.parent === null) {
        this.root = this;
      } else {
        this.root = this.parent.root;
      }

      if (this.props.ref) {
        this.props.ref(this);
      }

      this.componentType = this.__proto__.constructor.name;
      this.referenceElement =
        this.props.reference instanceof Component
          ? this.props.reference.element
          : this.props.reference;

      this.create();
      if (this.props.autoRender === true) {
        this.config();
        this.render();
      } else {
        this._mountPlaceHolder();
      }
    }

    create() {
      this.__handleClick = this.__handleClick.bind(this);
      isFunction$1(this._created) && this._created();
      this._callMixin('_created');
      this.props._created && this.props._created.call(this, this);
    }

    _created() {}

    config() {
      this._setExpandableProps();
      this.props._config && this.props._config.call(this, this);
      this._callMixin('_config');
      isFunction$1(this._config) && this._config();
      this._setExpandableProps();
      this._setStatusProps();
    }

    _config() {}

    render() {
      if (this.rendered === true) {
        this.emptyChildren();
      } else {
        this._mountElement();
      }

      this._renderChildren();

      this._handleAttrs();
      this._handleStyles();

      this.props.disabled === true && isFunction$1(this._disable) && this._disable();
      this.props.selected === true && isFunction$1(this._select) && this._select();
      this.props.hidden === false && isFunction$1(this._show) && this._show();
      this.props.expanded === true && isFunction$1(this._expand) && this._expand();

      this._callRendered();
    }

    _callRendered() {
      this.rendered = true;
      isFunction$1(this._rendered) && this._rendered();
      this._callMixin('_rendered');
      isFunction$1(this.props._rendered) && this.props._rendered.call(this, this);
      this.firstRender = false;
    }

    _rendered() {}

    // todo: ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????
    remove() {
      const el = this._removeCore();
      this.parent && this.parent.removeChild(this);
      el.parentNode.removeChild(el);
    }

    update(props) {
      this._propStyleClasses.length = 0;
      this.setProps(props);
      this._off();
      this.off();
      this.config();
      this.render();
    }

    replace(props) {
      return Component.create(Component.extendProps(props, { placement: 'replace', reference: this }))
    }

    emptyChildren() {
      while (this.element.firstChild) {
        if (this.element.firstChild.component) {
          this.element.firstChild.component.remove();
        } else {
          this.element.removeChild(this.element.firstChild);
        }
      }
    }

    offsetWidth() {
      return this.element.offsetWidth
    }

    _mountPlaceHolder() {
      const { placement } = this.props;

      this._placeHolderElement = document.createElement('div');
      this._placeHolderElement.classList.add('placeholder');

      if (placement === 'append') {
        this.referenceElement.appendChild(this._placeHolderElement);
      } else if (placement === 'prepend') {
        this.referenceElement.insertBefore(this._placeHolderElement, this.referenceElement.firstChild);
      } else if (placement === 'after') {
        this.referenceElement.insertAdjacentElement('afterend', this._placeHolderElement);
      } else if (placement === 'before') {
        this.referenceElement.insertAdjacentElement('beforebegin', this._placeHolderElement);
      } else if (placement === 'replace') {
        this._placeHolderElement = this.referenceElement;
      }
    }

    _mountElement() {
      const { placement } = this.props;

      this.element = document.createElement(this.props.tag);
      this.element.component = this;

      if (this._placeHolderElement) {
        this._placeHolderElement.parentNode.replaceChild(this.element, this._placeHolderElement);
        return
      }

      if (placement === 'append') {
        this.referenceElement.appendChild(this.element);
      } else if (placement === 'prepend') {
        this.referenceElement.insertBefore(this.element, this.referenceElement.firstChild);
      } else if (placement === 'replace') {
        if (this.referenceComponent) {
          this.referenceComponent._removeCore();
        }
        this.referenceElement.parentNode.replaceChild(this.element, this.referenceElement);
      } else if (placement === 'after') {
        this.referenceElement.insertAdjacentElement('afterend', this.element);
      } else if (placement === 'before') {
        this.referenceElement.insertAdjacentElement('beforebegin', this.element);
      }
    }

    getComponent(componentOrElement) {
      return componentOrElement instanceof Component
        ? componentOrElement
        : componentOrElement.component
    }

    getElement(componentOrElement) {
      return componentOrElement instanceof Component ? componentOrElement.element : componentOrElement
    }

    _renderChildren() {
      const { children } = this.props;
      if (Array.isArray(children)) {
        for (let i = 0; i < children.length; i++) {
          if (children[i] && children[i].renderIf !== false) {
            this.appendChild(children[i]);
          }
        }
      } else if (children && children.renderIf !== false) {
        this.appendChild(children);
      }
    }

    _removeCore() {
      this.emptyChildren();
      const el = this.element;
      isFunction$1(this.props._remove) && this.props._remove.call(this, this);
      this._callMixin('_remove');
      isFunction$1(this._remove) && this._remove();
      this._off();
      this.off();
      this.props.ref && this.props.ref(null);

      for (const p in this) {
        if (this.hasOwnProperty(p)) {
          delete this[p];
        }
      }

      return el
    }

    _remove() {}

    _callMixin(hookType) {
      for (let i = 0; i < MIXINS.length; i++) {
        const mixin = MIXINS[i];
        mixin[hookType] && mixin[hookType].call(this, this);
      }
      for (let i = 0; i < this.mixins.length; i++) {
        const mixin = this.mixins[i];
        mixin[hookType] && mixin[hookType].call(this, this);
      }
    }

    setProps(newProps) {
      this.props = Component.extendProps(this.props, newProps);
    }

    assignProps(newProps) {
      this.props = { ...this.props, ...newProps };
    }

    appendChild(child) {
      if (!child) {
        return
      }

      const childDefaults = this.props.childDefaults;
      let childDefaultsProps = {};
      let childDefaultsMixins = [];
      let childProps = {};
      let childMixins = [];
      let props = {};
      let mixins = [];

      if (childDefaults) {
        if (isPlainObject(childDefaults)) {
          childDefaultsProps = childDefaults;
        } else if (childDefaults instanceof ComponentDescriptor) {
          childDefaultsProps = childDefaults.getProps();
          childDefaultsMixins = childDefaults.mixins;
        }
      }

      if (isPlainObject(child)) {
        childProps = child;
      } else if (child instanceof ComponentDescriptor) {
        childProps = child.getProps();
        childMixins = child.mixins;
      } else if (isString(child) || isNumeric(child)) {
        if (isPlainObject(childDefaults)) {
          childProps = { children: child };
        } else if (child[0] === '#') {
          this.element.innerHTML = child.slice(1);
          return
        } else {
          this.element.textContent = child;
          return
        }
      } else if (child instanceof DocumentFragment) {
        this.element.appendChild(child);
        return
      }

      props = Component.extendProps({}, childDefaultsProps, childProps, {
        reference: this.element,
        placement: 'append',
      });

      mixins = [...childDefaultsMixins, ...childMixins];

      const compt = Component.create(props, ...mixins);

      return compt
    }

    before(props) {
      if (!props) {
        return
      }

      const { normalizedProps, mixins } = this._normalizeProps(props);
      const extNormalizedProps = Component.extendProps({}, normalizedProps, {
        reference: this.element,
        placement: 'before',
      });

      return Component.create(extNormalizedProps, ...mixins)
    }

    after(props) {
      if (!props) {
        return
      }

      let { normalizedProps, mixins } = this._normalizeProps(props);

      normalizedProps = Component.extendProps({}, normalizedProps, {
        reference: this.element,
        placement: 'after',
      });

      if (this.parent && this.parent.props.childDefaults) {
        const {
          normalizedProps: childDefaultsProps,
          mixins: childDefaultsMixins,
        } = this._normalizeProps(this.parent.props.childDefaults);
        normalizedProps = Component.extendProps(childDefaultsProps, normalizedProps);
        mixins = [...childDefaultsMixins, ...mixins];
      }

      return Component.create(normalizedProps, ...mixins)
    }

    _normalizeProps(props) {
      let normalizedProps = {};
      let mixins = [];

      if (isPlainObject(props)) {
        normalizedProps = props;
      } else if (props instanceof ComponentDescriptor) {
        normalizedProps = props.getProps();
        mixins = props.mixins;
      } else if (isString(props) || isNumeric(props)) {
        normalizedProps = { children: props };
      }
      return { normalizedProps, mixins }
    }

    disable() {
      if (!this.rendered || this.props.disabled === true) {
        return
      }

      this.props.disabled = true;
      this.addClass('s-disabled');
      isFunction$1(this._disable) && this._disable();
    }

    enable() {
      if (!this.rendered || this.props.disabled === false) {
        return
      }

      this.props.disabled = false;
      this.removeClass('s-disabled');
      isFunction$1(this._enable) && this._enable();
    }

    show() {
      if (!this.rendered) {
        this.setProps({ hidden: false });
        this.config();
        this.render();
        return
      }

      if (this.props.hidden === false) {
        return
      }

      this.props.hidden = false;
      this.removeClass('s-hidden');
      isFunction$1(this._show) && this._show();
      this._callHandler(this.props.onShow);
    }

    hide() {
      if (!this.rendered || this.props.hidden === true) {
        return
      }

      this.props.hidden = true;
      this.addClass('s-hidden');
      isFunction$1(this._hide) && this._hide();
      this._callHandler(this.props.onHide);
    }

    select(selectOption) {
      if (!this.rendered) {
        return
      }

      selectOption = extend(
        {
          triggerSelect: true,
          triggerSelectionChange: true,
        },
        selectOption,
      );
      if (this.props.selected === false) {
        this.props.selected = true;
        this.addClass('s-selected');
        isFunction$1(this._select) && this._select();
        selectOption.triggerSelect === true &&
          this._callHandler(this.props.onSelect, null, selectOption.event);
        selectOption.triggerSelectionChange === true &&
          this._callHandler(this.props.onSelectionChange);

        return true
      }

      return false
    }

    unselect(unselectOption) {
      if (!this.rendered) {
        return
      }

      unselectOption = extend(
        {
          triggerUnselect: true,
          triggerSelectionChange: true,
        },
        unselectOption,
      );
      if (this.props.selected === true) {
        this.props.selected = false;
        this.removeClass('s-selected');
        isFunction$1(this._unselect) && this._unselect();

        if (unselectOption.triggerUnselect === true) {
          this._callHandler(this.props.onUnselect, null, unselectOption.event);
        }

        if (unselectOption.triggerSelectionChange === true) {
          this._callHandler(this.props.onSelectionChange);
        }

        return true
      }

      return false
    }

    toggleSelect(event) {
      if (!this.rendered) return
      const { selected, selectable } = this.props;
      if (selectable && selectable.canRevert === false && selected === true) {
        return
      }
      this.props.selected === true ? this.unselect({ event: event }) : this.select({ event });
    }

    expand() {
      if (!this.rendered) return
      if (this.props.expanded === true) return

      this.props.expanded = true;
      this.addClass('s-expanded');
      const expandTarget = this._getExpandTarget();
      if (expandTarget !== null && expandTarget !== undefined) {
        if (Array.isArray(expandTarget)) {
          expandTarget.forEach((t) => {
            t.show && t.show();
          });
        } else {
          expandTarget.show && expandTarget.show();
        }
      }
      // if (!this.props.expandable.byIndicator) {
      this._expandIndicator && this._expandIndicator.expand();
      // }
      const { expandedProps } = this.props.expandable;
      if (expandedProps) {
        this.update(expandedProps);
      }
      isFunction$1(this._expand) && this._expand();
    }

    collapse() {
      if (!this.rendered) return
      if (this.props.expanded === false) return
      this.props.expanded = false;
      this.removeClass('s-expanded');
      const expandTarget = this._getExpandTarget();
      if (expandTarget !== null && expandTarget !== undefined) {
        if (Array.isArray(expandTarget)) {
          expandTarget.forEach((t) => {
            t.hide && t.hide();
          });
        } else {
          expandTarget.hide && expandTarget.hide();
        }
      }
      //  if (!this.props.expandable.byIndicator) {
      this._expandIndicator && this._expandIndicator.collapse();
      // }
      isFunction$1(this._collapse) && this._collapse();
      const { collapsedProps } = this.props.expandable;
      if (collapsedProps) {
        this.update(collapsedProps);
      }
    }

    toggleExpand() {
      this.props.expanded === true ? this.collapse() : this.expand();
    }

    toggleHidden() {
      this.props.hidden === true ? this.show() : this.hide();
    }

    addClass(className) {
      this.element.classList.add(className);
    }

    removeClass(className) {
      this.element.classList.remove(className);
    }

    _setExpandableProps() {
      const that = this;
      const { expandable, expanded } = this.props;
      if (isPlainObject(expandable)) {
        if (isPlainObject(expandable.indicator)) {
          this.setProps({
            expandable: {
              indicator: {
                expanded: expanded,
                _created: function () {
                  that._expandIndicator = this;
                },
              },
            },
          });
        }

        if (this.props.expanded) {
          if (expandable.expandedProps) {
            this.setProps(expandable.expandedProps);
          }
        } else if (expandable.collapsedProps) {
          this.setProps(expandable.collapsedProps);
        }
      }
    }

    _setStatusProps() {
      const { props } = this;

      this.setProps({
        classes: {
          's-disabled': props.disabled,
          's-selected': props.selected,
          's-hidden': props.hidden,
          's-expanded': props.expanded,
        },
      });
    }

    _getExpandTarget() {
      const { target } = this.props.expandable;
      if (target === undefined || target === null) {
        return null
      }
      if (target instanceof Component) {
        return target
      }
      if (isFunction$1(target)) {
        return target.call(this, this)
      }
    }

    getExpandableIndicatorProps(expanded = null) {
      const that = this;
      const { indicator, byIndicator } = this.props.expandable;
      if (expanded == null) {
        expanded = this.props.expanded;
      }

      if (indicator === undefined || indicator === null) {
        return null
      }
      if (isPlainObject(indicator)) {
        this.setProps({
          expandable: {
            indicator: {
              expanded: expanded,
              _created: function () {
                that._expandIndicator = this;
              },
            },
          },
        });

        if (byIndicator === true) {
          this.setProps({
            expandable: {
              indicator: {
                attrs: {
                  onclick: (event) => {
                    that.toggleExpand();
                    event.stopPropagation();
                  },
                },
              },
            },
          });
        }
      }
      return this.props.expandable.indicator
    }

    getChildren() {
      const children = [];
      for (let i = 0; i < this.element.childNodes.length; i++) {
        children.push(this.element.childNodes[i].component);
      }
      return children
    }

    _handleAttrs() {
      this._processClick();
      for (const name in this.props.attrs) {
        const value = this.props.attrs[name];
        if (value == null) continue
        if (name === 'style') {
          this._setStyle(value);
        } else if (name[0] === 'o' && name[1] === 'n') {
          this._on(name.slice(2), value);
        } else if (
          name !== 'list' &&
          name !== 'tagName' &&
          name !== 'form' &&
          name !== 'type' &&
          name !== 'size' &&
          name in this.element
        ) {
          this.element[name] = value == null ? '' : value;
        } else {
          this.element.setAttribute(name, value);
        }
      }
    }

    _handleStyles() {
      const { props } = this;

      const classes = [];
      let propClasses = [];

      const componentTypeClasses = this._getComponentTypeClasses(this);
      for (let i = 0; i < componentTypeClasses.length; i++) {
        const componentTypeClass = componentTypeClasses[i];
        classes.push(`${props.prefixClass}${hyphenate(componentTypeClass)}`);
      }

      propClasses = propClasses.concat(this._propStyleClasses);
      if (props.type) {
        propClasses.push('type');
      }

      if (props.uistyle) {
        propClasses.push('uistyle');
      }

      for (let i = 0; i < propClasses.length; i++) {
        const modifier = propClasses[i];
        const modifierVal = this.props[modifier];
        if (modifierVal !== null && modifierVal !== undefined) {
          if (modifierVal === true) {
            classes.push(`p-${hyphenate(modifier)}`);
          } else if (typeof modifierVal === 'string' || typeof modifierVal === 'number') {
            classes.push(`p-${hyphenate(modifier)}-${hyphenate(String(modifierVal))}`);
          }
        }
      }

      if (isPlainObject(props.classes)) {
        for (const className in props.classes) {
          if (props.classes.hasOwnProperty(className) && props.classes[className] === true) {
            classes.push(className);
          }
        }
      }

      const { styles } = props;
      if (isPlainObject(styles)) {
        addStylesClass(styles);
      }

      function addStylesClass(_styles, className) {
        className = className || '';
        if (isPlainObject(_styles)) {
          for (const style in _styles) {
            if (_styles.hasOwnProperty(style)) {
              addStylesClass(_styles[style], `${className}-${style}`);
            }
          }
        } else if (Array.isArray(_styles)) {
          for (let i = 0; i < _styles.length; i++) {
            if (isString(_styles[i]) || isNumeric(_styles)) {
              classes.push(`u${className}-${_styles[i]}`);
            } else if (_styles[i] === true) {
              classes.push(`u${className}`);
            }
          }
        } else if (isString(_styles) || isNumeric(_styles)) {
          classes.push(`u${className}-${_styles}`);
        } else if (_styles === true) {
          classes.push(`u${className}`);
        }
      }

      if (classes.length) {
        const classNames = classes.join(' ');
        this.element.setAttribute('class', classNames);
      }
    }

    _processClick() {
      const { onClick, selectable, expandable } = this.props;
      if (
        onClick ||
        (selectable && selectable.byClick === true) ||
        (expandable && expandable.byClick && !expandable.byIndicator)
      ) {
        this.setProps({
          attrs: {
            onclick: this.__handleClick,
          },
        });
      }

      /* if (expandable.byIndicator) {
        const indicator = this._expandIndicator
        indicator._on('click', (event) => {
          this.toggleExpand()
          event.stopPropagation()
        })
      } */
    }

    __handleClick(event) {
      if (this.props._shouldHandleClick && this.props._shouldHandleClick.call(this, this) === false) {
        return
      }
      if (this.props.disabled === true) {
        return
      }
      const { onClick, selectable, expandable } = this.props;
      onClick && this._callHandler(onClick, null, event);
      if (selectable && selectable.byClick === true) {
        this.toggleSelect(event);
      }
      if (expandable && expandable.byClick === true) {
        this.toggleExpand();
      }
    }

    _callHandler(handler, argObj, event) {
      argObj = isPlainObject(argObj) ? argObj : {};
      event && (argObj.event = event);
      argObj.sender = this;
      if (handler) {
        if (isFunction$1(handler)) {
          return handler(argObj)
        }
        if (isString(handler) && isFunction$1(this.props[handler])) {
          return this.props[handler](argObj)
        }
      }
    }

    _setStyle(style) {
      const { element } = this;
      if (typeof style !== 'object') {
        // New style is a string, let engine deal with patching.
        element.style.cssText = style;
      } else {
        // `old` is missing or a string, `style` is an object.
        element.style.cssText = '';
        // Add new style properties
        for (const key in style) {
          const value = style[key];
          if (value != null) element.style.setProperty(normalizeKey(key), String(value));
        }
      }
    }

    _getComponentTypeClasses(instance) {
      const classArray = [];
      let ctor = instance.constructor;

      while (ctor && ctor.name !== 'Component') {
        classArray.unshift(ctor.name);
        ctor = ctor.__proto__.prototype.constructor;
      }

      return classArray
    }

    _on(event, callback) {
      /* if (context) {
              callback = callback.bind(context)
          }
          else {
              callback = callback.bind(this)
          } */
      const cache = this.__htmlEvents || (this.__htmlEvents = {});
      const list = cache[event] || (cache[event] = []);
      list.push(callback);

      this.element.addEventListener(event, callback, false);
    }

    _off(event, callback) {
      let cache;
      let i;

      // No events, or removing *all* events.
      if (!(cache = this.__htmlEvents)) return this
      if (!(event || callback)) {
        for (const key in this.__htmlEvents) {
          if (this.__htmlEvents.hasOwnProperty(key)) {
            const _list = this.__htmlEvents[key];
            if (!_list) continue
            for (i = _list.length - 1; i >= 0; i -= 1) {
              this.element.removeEventListener(key, _list[i], false);
            }
          }
        }
        delete this.__htmlEvents;
        return this
      }

      const list = cache[event];
      if (!list) return

      if (!callback) {
        delete cache[event];
        return
      }

      for (i = list.length - 1; i >= 0; i -= 1) {
        if (list[i] === callback) {
          list.splice(i, 1);
          this.element.removeEventListener(event, callback, false);
        }
      }
    }

    _trigger(eventName) {
      const event = new Event(eventName);
      this.element.dispatchEvent(event);
    }

    _addPropStyle(...props) {
      props.forEach((value) => {
        this._propStyleClasses.push(value);
      });
    }

    _mixin(mixins) {
      for (let i = 0; i < mixins.length; i++) {
        const mixin = mixins[i];
        if (isPlainObject(mixin) && isPlainObject(mixin.methods)) {
          for (const key in mixin.methods) {
            if (mixin.methods.hasOwnProperty(key)) {
              if (!this[key]) {
                this[key] = mixin.methods[key];
              }
            }
          }
        }
      }

      this.mixins = [...this.mixins, ...mixins];
    }

    static create(componentProps, ...mixins) {
      let componentType = componentProps.component;
      if (isString(componentType)) {
        componentType = components[componentType];
      }

      if (componentType === undefined || componentType === null) {
        componentType = Component;
      }

      return new componentType(componentProps, ...mixins)
    }

    static register(component, name) {
      if (name !== undefined) {
        components[name] = component;
      } else {
        components[component.name] = component;
      }
    }

    static extendProps(...args) {
      return extend(true, {}, ...args)
    }

    static mixin(mixin) {
      MIXINS.push(mixin);
    }
  }

  Component.normalizeTemplateProps = function (props) {
    if (props === null || props === undefined) {
      return null
    }
    let templateProps = {};
    if (isString(props)) {
      templateProps.children = props;
    } else {
      templateProps = props;
    }

    return templateProps
  };

  Component.components = components;
  Component.mixins = MIXINS;

  Object.assign(Component.prototype, Events.prototype);

  Object.defineProperty(Component.prototype, 'children', {
    get: function () {
      return this.getChildren()
    },
  });

  function n(tagOrComponent, props, children, mixins) {
    if (arguments.length === 2) {
      return new ComponentDescriptor(null, tagOrComponent, null, props)
    }
    return new ComponentDescriptor(tagOrComponent, props, children, mixins)
  }

  let zIndex = 6666;

  function getzIndex() {
    zIndex++;
    return ++zIndex
  }

  /* eslint-disable no-shadow */

  let cachedScrollbarWidth;
  const { max } = Math;
  const { abs } = Math;
  const rhorizontal = /left|center|right/;
  const rvertical = /top|center|bottom/;
  const roffset = /[\+\-]\d+(\.[\d]+)?%?/;
  const rposition = /^\w+/;
  const rpercent = /%$/;

  function getOffsets(offsets, width, height) {
    return [
      parseFloat(offsets[0]) * (rpercent.test(offsets[0]) ? width / 100 : 1),
      parseFloat(offsets[1]) * (rpercent.test(offsets[1]) ? height / 100 : 1),
    ]
  }

  function parseCss(element, property) {
    return parseInt(getComputedStyle(element)[property], 10) || 0
  }

  function isWindow(obj) {
    return obj != null && obj === obj.window
  }

  function getScrollTop(el) {
    const hasScrollTop = 'scrollTop' in el;
    return hasScrollTop ? el.scrollTop : isWindow(el) ? el.pageYOffset : el.defaultView.pageYOffset
  }

  function getScrollLeft(el) {
    const hasScrollLeft = 'scrollLeft' in el;
    return hasScrollLeft ? el.scrollLeft : isWindow(el) ? el.pageXOffset : el.defaultView.pageXOffset
  }

  function getOffsetParent(el) {
    return el.offsetParent || el
  }

  function setOffset(elem, coordinates) {
    const parentOffset = getOffsetParent(elem).getBoundingClientRect();

    let props = {
      top: coordinates.top - parentOffset.top,
      left: coordinates.left - parentOffset.left,
    };
    if (getOffsetParent(elem).tagName.toLowerCase() === 'body') {
      props = {
        top: coordinates.top,
        left: coordinates.left,
      };
    }

    if (getComputedStyle(elem).position === 'static') props.position = 'relative';
    elem.style.top = `${props.top}px`;
    elem.style.left = `${props.left}px`;
    elem.style.position = props.position;
  }

  function getOffset(elem) {
    if (document.documentElement !== elem && !document.documentElement.contains(elem))
      return { top: 0, left: 0 }
    const obj = elem.getBoundingClientRect();
    return {
      left: obj.left + window.pageXOffset,
      top: obj.top + window.pageYOffset,
      width: Math.round(obj.width),
      height: Math.round(obj.height),
    }
  }

  function getDimensions(elem) {
    if (elem.nodeType === 9) {
      return {
        width: elem.documentElement.scrollWidth,
        height: elem.documentElement.scrollHeight,
        offset: { top: 0, left: 0 },
      }
    }
    if (isWindow(elem)) {
      return {
        width: elem.innerWidth,
        height: elem.innerHeight,
        offset: { top: elem.pageYOffset, left: elem.pageXOffset },
      }
    }
    if (elem.preventDefault) {
      return {
        width: 0,
        height: 0,
        offset: { top: elem.pageY, left: elem.pageX },
      }
    }
    const elemOffset = elem.getBoundingClientRect();
    return {
      width: elem.offsetWidth,
      height: elem.offsetHeight,
      offset: {
        left: elemOffset.left + window.pageXOffset,
        top: elemOffset.top + window.pageYOffset,
      },
    }
  }

  const positionTool = {
    scrollbarWidth: function () {
      if (cachedScrollbarWidth !== undefined) {
        return cachedScrollbarWidth
      }

      const scrollDiv = document.createElement('div');
      scrollDiv.className = 'modal-scrollbar-measure';
      document.body.appendChild(scrollDiv);
      const scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      cachedScrollbarWidth = scrollbarWidth;
      return cachedScrollbarWidth
    },
    getScrollInfo: function (within) {
      const overflowX =
        within.isWindow || within.isDocument ? '' : getComputedStyle(within.element).overflowX;
      const overflowY =
        within.isWindow || within.isDocument ? '' : getComputedStyle(within.element).overflowY;
      const hasOverflowX =
        overflowX === 'scroll' || (overflowX === 'auto' && within.width < within.element.scrollWidth);
      const hasOverflowY =
        overflowY === 'scroll' ||
        (overflowY === 'auto' && within.height < within.element.scrollHeight);
      return {
        width: hasOverflowY ? positionTool.scrollbarWidth() : 0,
        height: hasOverflowX ? positionTool.scrollbarWidth() : 0,
      }
    },
    getWithinInfo: function (element) {
      const withinElement = element || window;
      const isElemWindow = isWindow(withinElement);
      const isDocument = !!withinElement && withinElement.nodeType === 9;
      const hasOffset = !isElemWindow && !isDocument;
      return {
        element: withinElement,
        isWindow: isElemWindow,
        isDocument: isDocument,
        offset: hasOffset ? getOffset(element) : { left: 0, top: 0 },
        scrollLeft: getScrollLeft(withinElement),
        scrollTop: getScrollTop(withinElement),
        width: isWindow ? withinElement.innerWidth : withinElement.offsetWidth,
        height: isWindow ? withinElement.innerHeight : withinElement.offsetHeight,
      }
    },
  };

  const positionFns = {
    fit: {
      left: function (position, data) {
        const { within } = data;
        const withinOffset = within.isWindow ? within.scrollLeft : within.offset.left;
        const outerWidth = within.width;
        const collisionPosLeft = position.left - data.collisionPosition.marginLeft;
        const overLeft = withinOffset - collisionPosLeft;
        const overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset;
        let newOverRight;

        // Element is wider than within
        if (data.collisionWidth > outerWidth) {
          // Element is initially over the left side of within
          if (overLeft > 0 && overRight <= 0) {
            newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
            position.left += overLeft - newOverRight;

            // Element is initially over right side of within
          } else if (overRight > 0 && overLeft <= 0) {
            position.left = withinOffset;

            // Element is initially over both left and right sides of within
          } else if (overLeft > overRight) {
            position.left = withinOffset + outerWidth - data.collisionWidth;
          } else {
            position.left = withinOffset;
          }

          // Too far left -> align with left edge
        } else if (overLeft > 0) {
          position.left += overLeft;

          // Too far right -> align with right edge
        } else if (overRight > 0) {
          position.left -= overRight;

          // Adjust based on position and margin
        } else {
          position.left = max(position.left - collisionPosLeft, position.left);
        }
      },
      top: function (position, data) {
        const { within } = data;
        const withinOffset = within.isWindow ? within.scrollTop : within.offset.top;
        const outerHeight = data.within.height;
        const collisionPosTop = position.top - data.collisionPosition.marginTop;
        const overTop = withinOffset - collisionPosTop;
        const overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset;
        let newOverBottom;

        // Element is taller than within
        if (data.collisionHeight > outerHeight) {
          // Element is initially over the top of within
          if (overTop > 0 && overBottom <= 0) {
            newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
            position.top += overTop - newOverBottom;

            // Element is initially over bottom of within
          } else if (overBottom > 0 && overTop <= 0) {
            position.top = withinOffset;

            // Element is initially over both top and bottom of within
          } else if (overTop > overBottom) {
            position.top = withinOffset + outerHeight - data.collisionHeight;
          } else {
            position.top = withinOffset;
          }

          // Too far up -> align with top
        } else if (overTop > 0) {
          position.top += overTop;

          // Too far down -> align with bottom edge
        } else if (overBottom > 0) {
          position.top -= overBottom;

          // Adjust based on position and margin
        } else {
          position.top = max(position.top - collisionPosTop, position.top);
        }
      },
    },
    flip: {
      left: function (position, data) {
        const { within } = data;
        const withinOffset = within.offset.left + within.scrollLeft;
        const outerWidth = within.width;
        const offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left;
        const collisionPosLeft = position.left - data.collisionPosition.marginLeft;
        const overLeft = collisionPosLeft - offsetLeft;
        const overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft;
        const myOffset =
          data.my[0] === 'left' ? -data.elemWidth : data.my[0] === 'right' ? data.elemWidth : 0;
        const atOffset =
          data.at[0] === 'left' ? data.targetWidth : data.at[0] === 'right' ? -data.targetWidth : 0;
        const offset = -2 * data.offset[0];
        let newOverRight;
        let newOverLeft;

        if (overLeft < 0) {
          newOverRight =
            position.left +
            myOffset +
            atOffset +
            offset +
            data.collisionWidth -
            outerWidth -
            withinOffset;
          if (newOverRight < 0 || newOverRight < abs(overLeft)) {
            position.left += myOffset + atOffset + offset;
          }
        } else if (overRight > 0) {
          newOverLeft =
            position.left -
            data.collisionPosition.marginLeft +
            myOffset +
            atOffset +
            offset -
            offsetLeft;
          if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
            position.left += myOffset + atOffset + offset;
          }
        }
      },
      top: function (position, data) {
        const { within } = data;
        const withinOffset = within.offset.top + within.scrollTop;
        const outerHeight = within.height;
        const offsetTop = within.isWindow ? within.scrollTop : within.offset.top;
        const collisionPosTop = position.top - data.collisionPosition.marginTop;
        const overTop = collisionPosTop - offsetTop;
        const overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop;
        const top = data.my[1] === 'top';
        const myOffset = top ? -data.elemHeight : data.my[1] === 'bottom' ? data.elemHeight : 0;
        const atOffset =
          data.at[1] === 'top' ? data.targetHeight : data.at[1] === 'bottom' ? -data.targetHeight : 0;
        const offset = -2 * data.offset[1];
        let newOverTop;
        let newOverBottom;
        if (overTop < 0) {
          newOverBottom =
            position.top +
            myOffset +
            atOffset +
            offset +
            data.collisionHeight -
            outerHeight -
            withinOffset;
          if (newOverBottom < 0 || newOverBottom < abs(overTop)) {
            position.top += myOffset + atOffset + offset;
          }
        } else if (overBottom > 0) {
          newOverTop =
            position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
          if (newOverTop > 0 || abs(newOverTop) < overBottom) {
            position.top += myOffset + atOffset + offset;
          }
        }
      },
    },
    flipfit: {
      left: function () {
        positionFns.flip.left.apply(this, arguments);
        positionFns.fit.left.apply(this, arguments);
      },
      top: function () {
        positionFns.flip.top.apply(this, arguments);
        positionFns.fit.top.apply(this, arguments);
      },
    },
  };

  function position(elem, options) {
    if (!options || !options.of) {
      return
    }

    // Make a copy, we don't want to modify arguments
    options = extend({}, options);

    const target = options.of;
    const within = positionTool.getWithinInfo(options.within);
    const scrollInfo = positionTool.getScrollInfo(within);
    const collision = (options.collision || 'flip').split(' ');
    const offsets = {};

    const dimensions = getDimensions(target);
    if (target.preventDefault) {
      // Force left top to allow flipping
      options.at = 'left top';
    }
    const targetWidth = dimensions.width;
    const targetHeight = dimensions.height;
    const targetOffset = dimensions.offset;

    // Clone to reuse original targetOffset later
    const basePosition = extend({}, targetOffset)

    // Force my and at to have valid horizontal and vertical positions
    // if a value is missing or invalid, it will be converted to center
    ;['my', 'at'].forEach(function (item) {
      let pos = (options[item] || '').split(' ');

      if (pos.length === 1) {
        pos = rhorizontal.test(pos[0])
          ? pos.concat(['center'])
          : rvertical.test(pos[0])
          ? ['center'].concat(pos)
          : ['center', 'center'];
      }
      pos[0] = rhorizontal.test(pos[0]) ? pos[0] : 'center';
      pos[1] = rvertical.test(pos[1]) ? pos[1] : 'center';

      // Calculate offsets
      const horizontalOffset = roffset.exec(pos[0]);
      const verticalOffset = roffset.exec(pos[1]);
      offsets[item] = [
        horizontalOffset ? horizontalOffset[0] : 0,
        verticalOffset ? verticalOffset[0] : 0,
      ];

      // Reduce to just the positions without the offsets
      options[item] = [rposition.exec(pos[0])[0], rposition.exec(pos[1])[0]];
    });

    // Normalize collision option
    if (collision.length === 1) {
      collision[1] = collision[0];
    }

    if (options.at[0] === 'right') {
      basePosition.left += targetWidth;
    } else if (options.at[0] === 'center') {
      basePosition.left += targetWidth / 2;
    }

    if (options.at[1] === 'bottom') {
      basePosition.top += targetHeight;
    } else if (options.at[1] === 'center') {
      basePosition.top += targetHeight / 2;
    }

    const atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
    basePosition.left += atOffset[0];
    basePosition.top += atOffset[1];

    const elemWidth = elem.offsetWidth;
    const elemHeight = elem.offsetHeight;
    const marginLeft = parseCss(elem, 'marginLeft');
    const marginTop = parseCss(elem, 'marginTop');
    const collisionWidth = elemWidth + marginLeft + parseCss(elem, 'marginRight') + scrollInfo.width;
    const collisionHeight =
      elemHeight + marginTop + parseCss(elem, 'marginBottom') + scrollInfo.height;
    const position = extend({}, basePosition);
    const myOffset = getOffsets(offsets.my, elem.offsetWidth, elem.offsetHeight);

    if (options.my[0] === 'right') {
      position.left -= elemWidth;
    } else if (options.my[0] === 'center') {
      position.left -= elemWidth / 2;
    }

    if (options.my[1] === 'bottom') {
      position.top -= elemHeight;
    } else if (options.my[1] === 'center') {
      position.top -= elemHeight / 2;
    }

    position.left += myOffset[0];
    position.top += myOffset[1];

    const collisionPosition = {
      marginLeft: marginLeft,
      marginTop: marginTop,
    }
    ;['left', 'top'].forEach(function (dir, i) {
      if (positionFns[collision[i]]) {
        positionFns[collision[i]][dir](position, {
          targetWidth: targetWidth,
          targetHeight: targetHeight,
          elemWidth: elemWidth,
          elemHeight: elemHeight,
          collisionPosition: collisionPosition,
          collisionWidth: collisionWidth,
          collisionHeight: collisionHeight,
          offset: [atOffset[0] + myOffset[0], atOffset[1] + myOffset[1]],
          my: options.my,
          at: options.at,
          within: within,
          elem: elem,
        });
      }
    });

    setOffset(elem, position);
  }

  class PanelBody extends Component {
    // constructor(props, ...mixins) {
    //   super(props, ...mixins)
    // }
  }

  Component.register(PanelBody);

  class PanelFooter extends Component {
    // constructor(props, ...mixins) {
    //     super(props, ...mixins)
    // }
  }

  Component.register(PanelFooter);

  class Icon extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        type: '',
        tag: 'i',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this.setProps({
        // eslint-disable-next-line prefer-template
        children: Icon.svgs[this.props.type] ? '#' + Icon.svgs[this.props.type].svg : null,
      });
    }
  }

  Icon.svgs = {};

  Icon.add = function (type, svg, cat) {
    Icon.svgs[type] = { type, svg, cat };
  };

  Component.normalizeIconProps = function (props) {
    if (props === null || props === undefined) {
      return null
    }
    let iconProps = {};
    if (isString(props)) {
      iconProps.type = props;
    } else if (isPlainObject(props)) {
      iconProps = props;
    } else {
      return null
    }
    iconProps.component = Icon;

    return iconProps
  };

  Component.register(Icon);

  /* Direction */
  let cat = 'Direction';
  Icon.add(
    'up',
    `<svg focusable="false" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/></svg>`,
    cat,
  );

  Icon.add(
    'down',
    `<svg focusable="false" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>`,
    cat,
  );

  Icon.add(
    'left',
    `<svg focusable="false" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>`,
    cat,
  );

  Icon.add(
    'right',
    `<svg focusable="false" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>`,
    cat,
  );

  Icon.add(
    'refresh',
    `<svg t="1611710311642" viewBox="0 0 1204 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9191" width="1em" height="1em"><path d="M822.704457 813.250853a384.466659 384.466659 0 0 1-225.260731 68.644008 419.812302 419.812302 0 0 1-31.552158-1.625779c-4.214983-0.361284-8.429966-1.083853-12.705163-1.565566a430.048689 430.048689 0 0 1-24.326473-3.73327c-4.937551-0.903211-9.754675-2.167706-14.571798-3.251558-7.827825-1.806421-15.535223-3.673057-23.182407-5.900977-3.673057-1.144067-7.225685-2.408562-10.898741-3.612842a375.916265 375.916265 0 0 1-26.07268-9.453605c-1.926849-0.782783-3.793485-1.685993-5.66012-2.52899a388.862284 388.862284 0 0 1-29.324239-14.029871l-1.324709-0.602141a388.380572 388.380572 0 0 1-111.757262-91.284488c-1.505351-1.806421-3.010702-3.853699-4.516053-5.720334a376.518405 376.518405 0 0 1-84.359873-237.243325h89.23721c2.288134 0 4.516053-1.204281 5.720334-3.371987a6.081618 6.081618 0 0 0-0.30107-6.442902l-149.932965-222.671528a6.563331 6.563331 0 0 0-10.838527 0L1.023639 491.467012a6.202046 6.202046 0 0 0-0.30107 6.503116c1.204281 2.107491 3.4322 3.311772 5.720334 3.311773H95.740327a494.357286 494.357286 0 0 0 89.598495 283.969422c0.722569 1.144067 1.204281 2.348348 1.926849 3.4322 5.900976 8.309538 12.343879 15.896507 18.666353 23.724333 2.288134 3.010702 4.516053 6.021404 6.924615 8.911678a511.819358 511.819358 0 0 0 29.083382 31.672586c1.023639 1.023639 1.866635 2.047277 2.83006 2.950488a499.294837 499.294837 0 0 0 153.967306 103.929437c3.070916 1.324709 6.081618 2.769846 9.272962 4.094555 10.718099 4.395625 21.677055 8.18911 32.756439 11.862166 5.238622 1.806421 10.417029 3.612843 15.655651 5.178408 9.754675 2.83006 19.629778 5.178408 29.504881 7.586969 6.623545 1.505351 13.247089 3.13113 19.991062 4.395625 2.709632 0.60214 5.419264 1.384923 8.128895 1.806422 9.393391 1.685993 18.846995 2.589204 28.240386 3.73327 3.371986 0.361284 6.743973 0.963425 10.115959 1.324709 16.920146 1.625779 33.719864 2.709632 50.579796 2.709632 102.905798 0 203.282606-31.13066 289.4489-90.923204a59.792544 59.792544 0 0 0 14.933082-83.697518 61.117253 61.117253 0 0 0-84.660943-14.75244z m285.595202-311.908738a494.4175 494.4175 0 0 0-89.176996-283.307069c-0.842997-1.384923-1.445137-2.769846-2.288134-4.03434-7.045043-9.875103-14.632012-19.087851-22.158768-28.3006l-2.649417-3.371987a500.318476 500.318476 0 0 0-189.072093-140.539574l-5.96119-2.709632a599.009291 599.009291 0 0 0-35.586499-12.885805c-4.395625-1.445137-8.670822-3.010702-13.066447-4.275197A492.731507 492.731507 0 0 0 716.547101 13.789016C710.525697 12.404093 704.684935 10.958956 698.723745 9.814889c-3.010702-0.60214-5.780548-1.445137-8.731037-1.987064-7.948254-1.384923-16.016935-1.987063-24.025402-3.010702-5.539692-0.662354-11.01917-1.505351-16.558862-2.107491a540.481242 540.481242 0 0 0-40.162766-1.987063c-2.408562 0-4.817123-0.361284-7.225685-0.361285l-1.324709 0.120428a505.797954 505.797954 0 0 0-289.027402 90.501706 59.73233 59.73233 0 0 0-14.933083 83.697518c19.268493 27.216747 57.20334 33.840292 84.660944 14.75244A384.466659 384.466659 0 0 1 604.789839 120.789368c11.500882 0.060214 22.760908 0.60214 33.840292 1.62578l10.236387 1.324709c9.152534 1.083853 18.244855 2.408562 27.156533 4.154768 3.913913 0.722569 7.827825 1.746207 11.681524 2.589204 8.79125 1.987063 17.522286 4.094555 26.132894 6.623545 2.709632 0.842997 5.35905 1.806421 8.008468 2.709632 9.875103 3.13113 19.449136 6.623545 28.90274 10.477243l2.890274 1.204281c56.6012 24.145831 106.277784 61.297895 144.995413 107.662707l0.722569 0.963425a376.458191 376.458191 0 0 1 87.430789 241.157239h-89.23721a6.503117 6.503117 0 0 0-5.720334 3.371986 6.141832 6.141832 0 0 0 0.30107 6.442902l149.993179 222.671528a6.442903 6.442903 0 0 0 5.419263 2.83006c2.22792 0 4.214983-1.083853 5.419264-2.83006l149.932965-222.671528a6.202046 6.202046 0 0 0 0.30107-6.442902 6.503117 6.503117 0 0 0-5.720334-3.371986h-89.176996z" p-id="9192"></path></svg>`,
    cat,
  );
  /* Prompt */
  cat = 'Prompt';

  Icon.add(
    'info-circle',
    `<svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path><path d="M464 336a48 48 0 1096 0 48 48 0 10-96 0zm72 112h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z"></path></svg>`,
    cat,
  );

  Icon.add(
    'question-circle',
    `<svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path><path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path></svg>`,
    cat,
  );

  Icon.add(
    'exclamation-circle',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="exclamation-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path><path d="M464 688a48 48 0 1096 0 48 48 0 10-96 0zm24-112h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8z"></path></svg>`,
    cat,
  );

  Icon.add(
    'close-circle',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="close-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M685.4 354.8c0-4.4-3.6-8-8-8l-66 .3L512 465.6l-99.3-118.4-66.1-.3c-4.4 0-8 3.5-8 8 0 1.9.7 3.7 1.9 5.2l130.1 155L340.5 670a8.32 8.32 0 00-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3L512 564.4l99.3 118.4 66 .3c4.4 0 8-3.5 8-8 0-1.9-.7-3.7-1.9-5.2L553.5 515l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z"></path><path d="M512 65C264.6 65 64 265.6 64 513s200.6 448 448 448 448-200.6 448-448S759.4 65 512 65zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path></svg>`,
    cat,
  );

  Icon.add(
    'check-circle',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="check-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M699 353h-46.9c-10.2 0-19.9 4.9-25.9 13.3L469 584.3l-71.2-98.8c-6-8.3-15.6-13.3-25.9-13.3H325c-6.5 0-10.3 7.4-6.5 12.7l124.6 172.8a31.8 31.8 0 0051.7 0l210.6-292c3.9-5.3.1-12.7-6.4-12.7z"></path><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path></svg>`,
    cat,
  );

  Icon.add(
    'check',
    `<svg viewBox="64 64 896 896"  focusable="false" data-icon="check" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474c-6.1-7.7-15.3-12.2-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1 0.4-12.8-6.3-12.8z" p-id="4091"></path></svg>`,
    cat,
  );

  Icon.add(
    'question-circle',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path><path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path></svg>`,
    cat,
  );

  Icon.add(
    'close',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>`,
    cat,
  );

  Icon.add(
    'ellipsis',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="ellipsis" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z"></path></svg>`,
    cat,
  );

  Icon.add(
    'eye',
    `<svg t="1610611013413" class="icon" viewBox="0 0 1603 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6374" width="1em" height="1em"><path d="M1439.175 502.814c-115.521-233.355-352.825-384.097-616.997-384.097-259.691-0.005-493.642 145.659-611.326 372.903-2.359 4.465-3.744 9.761-3.744 15.379 0 5.406 1.282 10.511 3.557 15.029 115.433 233.162 352.737 383.907 616.905 383.907 259.697 0 493.646-145.659 611.331-372.907 2.359-4.465 3.744-9.761 3.744-15.379 0-5.406-1.282-10.511-3.557-15.029zM827.575 839.278c-232.958 0-442.764-129.694-549.788-331.936 108.743-196.761 315.477-321.972 544.393-321.972 232.958 0 442.764 129.699 549.788 331.94-108.743 196.761-315.483 321.972-544.393 321.972zM952.959 642.373c33.654-34.619 52.858-81.01 52.858-130.373 0-103.084-83.211-186.644-185.849-186.644-102.641 0-185.849 83.561-185.849 186.644s83.206 186.644 185.849 186.644c14.662 0 26.548-11.937 26.548-26.663 0-14.722-11.885-26.661-26.548-26.661-73.319 0-132.749-59.689-132.749-133.319s59.431-133.319 132.749-133.319c73.314 0 132.745 59.689 132.745 133.319 0 35.301-13.68 68.366-37.751 93.123-4.671 4.809-7.55 11.38-7.55 18.623 0 7.469 3.061 14.223 7.998 19.075 4.777 4.693 11.327 7.588 18.553 7.588 7.449 0 14.181-3.078 18.991-8.031z" p-id="6375"></path></svg>`,
    cat,
  );

  Icon.add(
    'pin',
    `<svg t="1615376474037" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3895" width="1em" height="1em"><path d="M631.637333 178.432a64 64 0 0 1 19.84 13.504l167.616 167.786667a64 64 0 0 1-19.370666 103.744l-59.392 26.304-111.424 111.552-8.832 122.709333a64 64 0 0 1-109.098667 40.64l-108.202667-108.309333-184.384 185.237333-45.354666-45.162667 184.490666-185.344-111.936-112.021333a64 64 0 0 1 40.512-109.056l126.208-9.429333 109.44-109.568 25.706667-59.306667a64 64 0 0 1 84.181333-33.28z m-25.450666 58.730667l-30.549334 70.464-134.826666 135.04-149.973334 11.157333 265.408 265.6 10.538667-146.474667 136.704-136.874666 70.336-31.146667-167.637333-167.765333z" p-id="3896"></path></svg>`,
    cat,
  );

  Icon.add(
    'sort',
    `<svg t="1616635066835" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9750" width="1em" height="1em"><path d="M804.57143 621.714286q0 14.848-10.825143 25.746286l-256 256q-10.825143 10.825143-25.746286 10.825143t-25.746286-10.825143l-256-256q-10.825143-10.825143-10.825143-25.746286t10.825143-25.746286 25.746286-10.825143l512 0q14.848 0 25.746286 10.825143t10.825143 25.746286zM804.57143 402.285714q0 14.848-10.825143 25.746286t-25.746286 10.825143l-512 0q-14.848 0-25.746286-10.825143t-10.825143-25.746286 10.825143-25.746286l256-256q10.825143-10.825143 25.746286-10.825143t25.746286 10.825143l256 256q10.825143 10.825143 10.825143 25.746286z"  fill="currentColor" p-id="9751"></path></svg>`,
    cat,
  );

  Icon.add(
    'sort-down',
    `<svg t="1616635159124" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10028" width="1em" height="1em"><path d="M804.571184 621.714286q0 14.848-10.825143 25.746286l-256 256q-10.825143 10.825143-25.746286 10.825143t-25.746286-10.825143l-256-256q-10.825143-10.825143-10.825143-25.746286t10.825143-25.746286 25.746286-10.825143l512 0q14.848 0 25.746286 10.825143t10.825143 25.746286z" fill="currentColor" p-id="10029"></path></svg>`,
    cat,
  );

  Icon.add(
    'sort-up',
    `<svg t="1616635124506" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9889" width="1em" height="1em"><path d="M804.571671 402.285714q0 14.848-10.825143 25.746286t-25.746286 10.825143l-512 0q-14.848 0-25.746286-10.825143t-10.825143-25.746286 10.825143-25.746286l256-256q10.825143-10.825143 25.746286-10.825143t25.746286 10.825143l256 256q10.825143 10.825143 10.825143 25.746286z" fill="currentColor" p-id="9890"></path></svg>`,
    cat,
  );

  Icon.add(
    'sort-right',
    `<svg t="1618369427378" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4408" width="1em" height="1em"><path d="M718.848 512L307.2 926.72V96.768l411.648 415.232z" p-id="4409"></path></svg>`,
    cat,
  );

  Icon.add(
    'setting',
    `<svg t="1615863726011" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3943" width="1em" height="1em"><path d="M785.183686 139.674311c-14.716642-25.494575-50.839308-46.344043-80.272592-46.344044H326.227815c-29.433284 0-65.55595 20.849468-80.272592 46.344044L56.618935 467.614608c-14.716642 25.494575-14.716642 67.193511 0 92.688087l189.336288 327.951c14.716642 25.494575 50.839308 46.344043 80.272592 46.344043h378.683279c29.433284 0 65.55595-20.849468 80.272592-46.344043L974.530677 560.302695c14.716642-25.494575 14.716642-67.193511 0-92.688087L785.183686 139.674311zM741.932814 813.332609c-14.716642 25.494575-50.839308 46.344043-80.272593 46.344043H369.478688c-29.433284 0-65.55595-20.849468-80.272592-46.344043l-146.074712-253.019211c-14.716642-25.494575-14.716642-67.193511 0-92.688087L289.206096 214.595397c14.716642-25.494575 50.839308-46.344043 80.272592-46.344043H661.660221c29.433284 0 65.55595 20.849468 80.272593 46.344043l146.096118 253.019211c14.716642 25.494575 14.716642 67.193511 0 92.688087L741.932814 813.332609z" fill="#3E3A39" p-id="3944"></path><path d="M515.574806 358.743567c-85.731129 0-155.225788 69.494659-155.225787 155.225787s69.494659 155.225788 155.225787 155.225788 155.225788-69.494659 155.225788-155.225788-69.494659-155.225788-155.225788-155.225787z m0 235.519786c-44.278362 0-80.304701-36.026339-80.304701-80.304702s36.026339-80.304701 80.304701-80.304701 80.304701 36.026339 80.304701 80.304701-36.026339 80.304701-80.304701 80.304702z" fill="currentColor" p-id="3945"></path></svg>`,
    cat,
  );

  Icon.add(
    'resize-handler',
    `<svg t="1616466190070" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2516" width="1em" height="1em"><path d="M938.666667 938.666667 853.333333 938.666667 853.333333 853.333333 938.666667 853.333333 938.666667 938.666667M938.666667 768 853.333333 768 853.333333 682.666667 938.666667 682.666667 938.666667 768M768 938.666667 682.666667 938.666667 682.666667 853.333333 768 853.333333 768 938.666667M768 768 682.666667 768 682.666667 682.666667 768 682.666667 768 768M597.333333 938.666667 512 938.666667 512 853.333333 597.333333 853.333333 597.333333 938.666667M938.666667 597.333333 853.333333 597.333333 853.333333 512 938.666667 512 938.666667 597.333333Z"  fill="currentColor" p-id="2517"></path></svg>`,
    cat,
  );

  Icon.add(
    'plus-square',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="plus-square" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M328 544h152v152c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V544h152c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H544V328c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z"></path><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"></path></svg>`,
    cat,
  );

  Icon.add(
    'minus-square',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="minus-square" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M328 544h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z"></path><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"></path></svg>`,
    cat,
  );

  /* Editor */
  cat = 'Editor';

  Icon.add(
    'form',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="form" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M904 512h-56c-4.4 0-8 3.6-8 8v320H184V184h320c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V520c0-4.4-3.6-8-8-8z"></path><path d="M355.9 534.9L354 653.8c-.1 8.9 7.1 16.2 16 16.2h.4l118-2.9c2-.1 4-.9 5.4-2.3l415.9-415c3.1-3.1 3.1-8.2 0-11.3L785.4 114.3c-1.6-1.6-3.6-2.3-5.7-2.3s-4.1.8-5.7 2.3l-415.8 415a8.3 8.3 0 00-2.3 5.6zm63.5 23.6L779.7 199l45.2 45.1-360.5 359.7-45.7 1.1.7-46.4z"></path></svg>`,
    cat,
  );

  Icon.add(
    'plus',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="plus" width="1em" height="1em" fill="currentColor" aria-hidden="true"><defs><style></style></defs><path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path><path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path></svg>`,
    cat,
  );

  Icon.add(
    'minus',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="minus" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M896 469.333333H128a42.666667 42.666667 0 0 0 0 85.333334h768a42.666667 42.666667 0 0 0 0-85.333334z" p-id="4498"></path></svg>`,
    cat,
  );
  Icon.add(
    'edit',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="edit" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z"></path></svg>`,
    cat,
  );

  Icon.add(
    'delete',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="delete" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path></svg>`,
    cat,
  );

  Icon.add(
    'blank-square',
    `<svg t="1609925372510" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1811" width="1em" height="1em"><path d="M845 179v666H179V179h666m0-64H179c-35.3 0-64 28.7-64 64v666c0 35.3 28.7 64 64 64h666c35.3 0 64-28.7 64-64V179c0-35.3-28.7-64-64-64z" p-id="1812"></path></svg>`,
    cat,
  );

  Icon.add(
    'checked-square',
    `<svg t="1609925474194" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2089" width="1em" height="1em"><path d="M844 116H180c-35.3 0-64 28.7-64 64v664c0 35.3 28.7 64 64 64h664c35.3 0 64-28.7 64-64V180c0-35.3-28.7-64-64-64z m0 728H180V180h664v664z" p-id="2090"></path><path d="M433.4 670.6c6.2 6.2 14.4 9.4 22.6 9.4s16.4-3.1 22.6-9.4l272-272c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L456 602.7 342.6 489.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l136.1 135.9z" p-id="2091"></path></svg>`,
    cat,
  );

  Icon.add(
    'half-square',
    `<svg t="1609936930955" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1365" width="1em" height="1em"><path d="M844 116H180c-35.3 0-64 28.7-64 64v664c0 35.3 28.7 64 64 64h664c35.3 0 64-28.7 64-64V180c0-35.3-28.7-64-64-64z m0 728H180V180h664v664z" p-id="1366"></path><path d="M320 544h384c17.7 0 32-14.3 32-32s-14.3-32-32-32H320c-17.7 0-32 14.3-32 32s14.3 32 32 32z" p-id="1367"></path></svg>`,
    cat,
  );

  Icon.add(
    'times',
    `<svg t="1610503666305" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2041" width="1em" height="1em"><path d="M572.16 512l183.466667-183.04a42.666667 42.666667 0 1 0-60.586667-60.586667L512 451.84l-183.04-183.466667a42.666667 42.666667 0 0 0-60.586667 60.586667l183.466667 183.04-183.466667 183.04a42.666667 42.666667 0 0 0 0 60.586667 42.666667 42.666667 0 0 0 60.586667 0l183.04-183.466667 183.04 183.466667a42.666667 42.666667 0 0 0 60.586667 0 42.666667 42.666667 0 0 0 0-60.586667z" p-id="2042"></path></svg>`,
    cat,
  );

  Icon.add(
    'search',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="search" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path></svg>`,
    cat,
  );

  /* Logo */
  cat = 'Logo';

  Icon.add(
    'github',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="github" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path></svg>`,
    cat,
  );

  /* Uncategorized */
  cat = 'Uncategorized';

  Icon.add(
    'clock',
    `<svg t="1614131772688" class="icon" viewBox="0 0 1024 1024" version="1.1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" p-id="2901" width="1em" height="1em"><path d="M512 74.666667C270.933333 74.666667 74.666667 270.933333 74.666667 512S270.933333 949.333333 512 949.333333 949.333333 753.066667 949.333333 512 753.066667 74.666667 512 74.666667z m0 810.666666c-204.8 0-373.333333-168.533333-373.333333-373.333333S307.2 138.666667 512 138.666667 885.333333 307.2 885.333333 512 716.8 885.333333 512 885.333333z" p-id="2902"></path><path d="M695.466667 567.466667l-151.466667-70.4V277.333333c0-17.066667-14.933333-32-32-32s-32 14.933333-32 32v238.933334c0 12.8 6.4 23.466667 19.2 29.866666l170.666667 81.066667c4.266667 2.133333 8.533333 2.133333 12.8 2.133333 12.8 0 23.466667-6.4 29.866666-19.2 6.4-14.933333 0-34.133333-17.066666-42.666666z" p-id="2903"></path></svg>`,
    cat,
  );

  Icon.add(
    'calendar',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="calendar" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zM184 392V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136H184z"></path></svg>`,
    cat,
  );

  Icon.add(
    'table',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="table" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-40 208H676V232h212v136zm0 224H676V432h212v160zM412 432h200v160H412V432zm200-64H412V232h200v136zm-476 64h212v160H136V432zm0-200h212v136H136V232zm0 424h212v136H136V656zm276 0h200v136H412V656zm476 136H676V656h212v136z"></path></svg>`,
    cat,
  );

  Icon.add(
    'profile',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="profile" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656zM492 400h184c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H492c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8zm0 144h184c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H492c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8zm0 144h184c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H492c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8zM340 368a40 40 0 1080 0 40 40 0 10-80 0zm0 144a40 40 0 1080 0 40 40 0 10-80 0zm0 144a40 40 0 1080 0 40 40 0 10-80 0z"></path></svg>`,
    cat,
  );

  Icon.add(
    'user',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="user" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"></path></svg>`,
    cat,
  );

  /* common */
  cat = 'Common';
  Icon.add(
    'upload',
    `<svg t="1609828633664" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1558" width="1em" height="1em"><path d="M883.6 926.7H140.4c-42.1 0-76.4-35.9-76.4-80V577.8c0-22.1 17.9-40 40-40s40 17.9 40 40v268.9h736V577.8c0-22.1 17.9-40 40-40s40 17.9 40 40v268.9c0 44.1-34.3 80-76.4 80z" fill="#2C2C2C" p-id="1559"></path><path d="M512 744.2c-22.1 0-40-17.9-40-40V104.6c0-22.1 17.9-40 40-40s40 17.9 40 40v599.6c0 22.1-17.9 40-40 40z" fill="#2C2C2C" p-id="1560"></path><path d="M320 335.9c-10.2 0-20.5-3.9-28.3-11.7-15.6-15.6-15.6-40.9 0-56.6L481.6 77.8c4.5-4.5 13.9-13.9 30.4-13.9 10.6 0 20.8 4.2 28.3 11.7l192 192c15.6 15.6 15.6 40.9 0 56.6s-40.9 15.6-56.6 0L512 160.5 348.3 324.2c-7.8 7.8-18.1 11.7-28.3 11.7z" fill="#2C2C2C" p-id="1561"></path></svg>`,
    cat,
  );

  /* Loading */
  cat = 'Loading';
  Icon.add(
    'loading',
    `<svg width="1em" height="1em" viewBox="0 0 50 50" style="enable-background: new 0 0 50 50" xml:space="preserve"><path fill='#4263eb' d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z" transform="rotate(275.098 25 25)"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite"></animateTransform>`,
    cat,
  );

  /* FileType */
  cat = 'FileType';
  Icon.add(
    'default',
    `<svg t="1609743512982" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="26933" width="1em" height="1em"><path d="M0 0h1024v1024H0z" fill="#D8D8D8" fill-opacity="0" p-id="26934"></path><path d="M553.356 187.733L768 402.823v342.649c0 40.719-33.01 73.728-73.728 73.728H329.728c-40.719 0-73.728-33.01-73.728-73.728v-484.01c0-40.72 33.01-73.729 73.728-73.729h223.628z" fill="#DBDFE7" p-id="26935"></path><path d="M549.85 187.733L768 405.883v3.717H644.437c-54.291 0-98.304-44.012-98.304-98.304V187.733h3.716z" fill="#C0C4CC" p-id="26936"></path></svg>`,
    cat,
  );

  Icon.add(
    'file-error',
    `<svg t="1609815861438" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2630" width="1em" height="1em"><path d="M960.002941 320.008822H576.004901V0h63.989218v256.003921H960.002941v64.004901zM339.197745 678.411175l300.796374-300.812057 44.808136 44.808136-300.796374 300.796373-44.808136-44.792452z" p-id="2631" fill="#f03e3e"></path><path d="M339.197745 422.407254l44.808136-44.808136 300.796374 300.812057-44.808136 44.792452-300.796374-300.796373z" p-id="2632" fill="#f03e3e"></path><path d="M870.355302 1024h-716.741971A89.616272 89.616272 0 0 1 64.012743 934.399412V89.600588A89.616272 89.616272 0 0 1 153.613331 0h486.380788l319.946087 249.604999v684.794413a89.616272 89.616272 0 0 1-89.584904 89.600588z m-716.741971-959.995099c-19.196765 0-25.595687 12.797844-25.595687 25.595687v844.798824a25.595687 25.595687 0 0 0 25.595687 25.61137h716.741971c19.196765 0 25.595687-12.797844 25.595687-25.595687V275.200686L620.797353 64.004901z" p-id="2633" fill="#f03e3e"></path></svg>`,
    cat,
  );

  Icon.add(
    'folder',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="folder" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M880 298.4H521L403.7 186.2a8.15 8.15 0 00-5.5-2.2H144c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V330.4c0-17.7-14.3-32-32-32zM840 768H184V256h188.5l119.6 114.4H840V768z"></path></svg>`,
    cat,
  );

  Icon.add(
    'folder-filled',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="folder" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M880 298.4H521L403.7 186.2a8.15 8.15 0 00-5.5-2.2H144c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V330.4c0-17.7-14.3-32-32-32z"></path></svg>`,
    cat,
  );

  Icon.add(
    'file',
    `<svg viewBox="64 64 896 896" focusable="false" data-icon="file" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0042 42h216v494z"></path></svg>`,
    cat,
  );

  class Caption extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        title: '',
        subtitle: '',
        icon: null,
        image: null,
        titleLevel: 5,
      };

      const tagProp = props.href ? { tag: 'a' } : {};

      super(Component.extendProps(defaults, props, tagProp), ...mixins);
    }

    _config() {
      this._addPropStyle('subtitleWrap');
      const { title, subtitle, icon, image, href, titleLevel } = this.props;
      const children = [];
      if (isPlainObject(image)) {
        children.push(Component.extendProps({ tag: 'img', classes: { 'nom-caption-image': true } }, image));
      }
      else if (isString(image)) {
        children.push({ tag: 'img', classes: { 'nom-caption-image': true }, attrs: { src: image } });
      }
      else if (icon) {
        children.push(Component.extendProps({ classes: { 'nom-caption-icon': true } }, Component.normalizeIconProps(icon)));
      }
      const titleTag = `h${titleLevel}`;
      children.push({
        tag: titleTag,
        classes: {
          'nom-caption-title': true,
        },
        children: [title, subtitle && { tag: 'small', children: subtitle }],
      });
      if (href) {
        this.setProps({ attrs: { href: href } });
      }
      this.setProps({
        children: children,
      });
    }
  }

  Component.register(Caption);

  class Col extends Component {
    // constructor(props, ...mixins) {
    //   super(props, ...mixins)
    // }
  }

  Component.register(Col);

  class Cols extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        wrap: false,
        items: [],
        itemDefaults: null,
        gutter: 'md',
        childDefaults: {
          component: Col,
        },
        strechIndex: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this._propStyleClasses = ['gutter', 'align', 'justify', 'fills', 'inline'];
      const { items } = this.props;
      const children = [];
      if (Array.isArray(items) && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          if (isString(item)) {
            item = {
              children: item,
            };
          }
          item = Component.extendProps({}, this.props.itemDefaults, item);
          if (isNumeric(this.props.strechIndex) && this.props.strechIndex === i) {
            children.push({
              component: Col,
              classes: {
                'nom-col-strech': true,
              },
              children: item,
            });
          } else {
            children.push({ component: Col, children: item });
          }
        }

        this.setProps({
          children: children,
        });
      }
    }
  }

  Component.register(Cols);

  class PanelHeaderCaption extends Component {
    // constructor(props, ...mixins) {
    //   super(props, ...mixins)
    // }
  }

  Component.register(PanelHeaderCaption);

  class PanelHeaderNav extends Component {
    // constructor(props, ...mixins) {
    //     super(props, ...mixins)
    // }
  }

  Component.register(PanelHeaderNav);

  class PanelHeaderTools extends Component {
    // constructor(props, ...mixins) {
    //     super(props, ...mixins)
    // }
  }

  Component.register(PanelHeaderTools);

  class PanelHeader extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        caption: null,
        nav: null,
        tools: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    config() {
      const { caption, nav, tools } = this.props;
      let toolsProps, navProps;
      const captionProps = caption ? Component.extendProps({ component: Caption }, caption) : null;
      if (Array.isArray(nav)) {
        navProps = { component: Cols, items: nav };
      } else if (isPlainObject(nav)) {
        navProps = Component.extendProps({ component: Cols }, nav);
      }
      if (Array.isArray(tools)) {
        toolsProps = { component: Cols, items: tools };
      } else if (isPlainObject(tools)) {
        toolsProps = Component.extendProps({ component: Cols }, tools);
      }

      this.setProps({
        children: [
          captionProps && { component: PanelHeaderCaption, children: captionProps },
          navProps && { component: PanelHeaderNav, children: navProps },
          toolsProps && { component: PanelHeaderTools, children: toolsProps },
        ],
      });
    }
  }

  Component.register(PanelHeader);

  class Panel extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        header: null,
        body: null,
        footer: null,
        uistyle: 'default', // splitline,outline,card,bordered,plain
        startAddons: [],
        endAddons: [],
        fit: false
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this._addPropStyle('fit');

      const { header, body, footer, startAddons, endAddons } = this.props;
      let footerProps;
      const headerProps =
        header !== false && Component.extendProps({ component: PanelHeader }, header);
      const bodyProps = Component.extendProps({ component: PanelBody }, body);
      if (footer) {
        footerProps = Component.extendProps({ component: PanelFooter }, footer);
      }

      this.setProps({
        children: [headerProps, ...startAddons, bodyProps, ...endAddons, footerProps],
      });
    }
  }

  Component.register(Panel);

  Object.defineProperty(Component.prototype, '$modal', {
    get: function () {
      let cur = this;
      while (cur) {
        if (cur.__isModalContent === true) {
          return cur.modal
        }

        cur = cur.parent;
      }
      return cur.modal
    },
  });

  var ModalContentMixin = {
    _created: function () {
      this.modal = this.parent.modal;
      this.__isModalContent = true;
    },

    _config: function () {
      this.setProps({
        classes: {
          'nom-modal-content': true,
        },
      });
    },
  };

  class ModalDialog extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        children: { component: Panel },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      const modal = (this.modal = this.parent);
      const { content } = this.modal.props;
      if (isString(content)) {
        require([content], (contentConfig) => {
          let props = contentConfig;
          if (isFunction$1(props)) {
            props = contentConfig.call(this, modal);
          }
          props = Component.extendProps(this._getDefaultPanelContent(props), props);
          this.update({
            children: n(null, props, null, [ModalContentMixin]),
          });
        });
      }
    }

    _getDefaultPanelContent(contentProps) {
      const modal = this.modal;
      modal.setProps({
        okText: contentProps.okText,
        onOk: contentProps.onOk,
        cancelText: contentProps.cancelText,
        onCancel: contentProps.onCancel,
      });

      const { okText, cancelText } = modal.props;
      return {
        component: Panel,
        header: {
          nav: {},
          tools: [
            {
              component: 'Button',
              icon: 'close',
              styles: {
                border: 'none',
              },
              onClick: function () {
                modal.close();
              },
            },
          ],
        },
        footer: {
          children: {
            component: 'Cols',
            items: [
              {
                component: 'Button',
                styles: {
                  color: 'primary',
                },
                text: okText,
                onClick: () => {
                  modal._handleOk();
                },
              },
              {
                component: 'Button',
                text: cancelText,
                onClick: () => {
                  modal._handleCancel();
                },
              },
            ],
          },
        },
      }
    }

    _config() {
      const { content } = this.modal.props;
      if (isPlainObject(content)) {
        const extendContent = {};
        if (isFunction$1(content.footer)) {
          extendContent.footer = content.footer.call(this.modal, this.modal);
        }
        const contentProps = Component.extendProps(
          this._getDefaultPanelContent(content),
          content,
          extendContent,
        );
        this.setProps({
          children: n(null, contentProps, null, [ModalContentMixin]),
        });
      }
    }
  }

  Component.register(ModalDialog);

  class Modal extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        content: {},
        closeOnClickOutside: false,
        okText: '??? ???',
        cancelText: '??? ???',
        onOk: (e) => {
          e.sender.close();
        },
        onCancel: (e) => {
          e.sender.close();
        },
        size: 'small',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this._scoped = true;
      this.bodyElem = document.body;
    }

    _config() {
      this._propStyleClasses = ['size'];
      const { size } = this.props;

      let myWidth = null;

      if (size) {
        if (isPlainObject(size)) {
          if (size.width) {
            myWidth = isNumeric(size.width) ? `${size.width}px` : size.width;
          }
        }
      }

      this.setProps({
        children: {
          component: ModalDialog,
          attrs: {
            style: {
              width: myWidth || null,
            },
          },
        },
      });
    }

    _show() {
      this.setzIndex();
      this.checkScrollbar();
      this.setScrollbar();
    }

    close(result) {
      const that = this;

      if (!this.rendered) {
        return
      }

      if (this.element === undefined) {
        return
      }

      if (result !== undefined) {
        that.returnValue = result;
      }

      let { modalCount } = this.bodyElem;
      if (modalCount) {
        modalCount--;
        this.bodyElem.modalCount = modalCount;
        if (modalCount === 0) {
          this.resetScrollbar();
        }
      }

      this._callHandler(this.props.onClose, { result: result });
      this.remove();
    }

    setzIndex() {
      this.element.style.zIndex = getzIndex();
    }

    checkScrollbar() {
      const fullWindowWidth = window.innerWidth;
      this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
      this.scrollbarWidth = positionTool.scrollbarWidth();
    }

    setScrollbar() {
      /* var bodyPad = parseInt((this.bodyElem.css('padding-right') || 0), 10);
          this.originalBodyPad = document.body.style.paddingRight || '';
          this.originalBodyOverflow = document.body.style.overflow || '';
          if (this.bodyIsOverflowing) {
              this.bodyElem.css('padding-right', bodyPad + this.scrollbarWidth);
          }
          this.bodyElem.css("overflow", "hidden");
          var modalCount = this.bodyElem.data('modalCount');
          if (modalCount) {
              modalCount++;
              this.bodyElem.data('modalCount', modalCount);
          }
          else {
              this.bodyElem.data('modalCount', 1);
          } */
    }

    resetScrollbar() {
      /* this.bodyElem.css('padding-right', this.originalBodyPad);
          this.bodyElem.css('overflow', this.originalBodyOverflow);
          this.bodyElem.removeData('modalCount'); */
    }

    _handleOk() {
      this._callHandler(this.props.onOk);
    }

    _handleCancel() {
      this._callHandler(this.props.onCancel);
    }
  }

  Component.register(Modal);

  class Button extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'button',
        text: null,
        icon: null,
        rightIcon: null,
        type: null, // null(default) primary,dashed,text,link
        ghost: false,
        danger: false,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this._propStyleClasses = ['type', 'ghost', 'size', 'shape', 'danger', 'block'];
      const { icon, text, rightIcon, href, target } = this.props;

      if (icon || rightIcon) {
        this.setProps({
          classes: {
            'p-with-icon': true,
          },
        });

        if (!text) {
          this.setProps({
            classes: {
              'p-only-icon': true,
            },
          });
        }
      }

      this.setProps({
        children: [
          Component.normalizeIconProps(icon),
          text && { tag: 'span', children: text },
          Component.normalizeIconProps(rightIcon),
        ],
      });

      if (href) {
        this.setProps({
          tag: 'a',
          attrs: {
            href: href,
            target: target || '_self',
          },
        });
      }
    }

    _disable() {
      this.element.setAttribute('disabled', 'disabled');
    }

    _enable() {
      this.element.removeAttribute('disabled');
    }
  }

  Component.register(Button);

  class AlertContent extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        title: null,
        description: null,
        icon: null,
        type: null,
        okText: null,
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { title, description, type, okText, action } = this.props;
      let { icon } = this.props;

      const alertInst = this.modal;

      const iconMap = {
        info: 'info-circle',
        success: 'check-circle',
        error: 'close-circle',
        warning: 'exclamation-circle',
      };

      icon = icon || iconMap[type];

      const iconProps = icon
        ? Component.extendProps(Component.normalizeIconProps(icon), {
            classes: { 'nom-alert-icon': true },
          })
        : null;

      const titleProps = title
        ? Component.extendProps(Component.normalizeTemplateProps(title), {
            classes: { 'nom-alert-title': true },
          })
        : null;

      const descriptionProps = description
        ? Component.extendProps(Component.normalizeTemplateProps(description), {
            classes: { 'nom-alert-description': true },
          })
        : null;

      const okButtonProps = {
        component: Button,
        styles: {
          color: 'primary',
        },
        text: okText,
        onClick: () => {
          alertInst._handleOk();
        },
      };

      let actionProps = {
        component: Cols,
        justify: 'end',
      };
      if (!action) {
        actionProps.items = [okButtonProps];
      } else if (isPlainObject(action)) {
        actionProps = Component.extendProps(actionProps, action);
      } else if (Array.isArray(action)) {
        actionProps.items = action;
      }

      this.setProps({
        children: [
          {
            classes: {
              'nom-alert-body': true,
            },
            children: [
              iconProps
                ? {
                    classes: {
                      'nom-alert-body-icon': true,
                    },
                    children: iconProps,
                  }
                : undefined,
              {
                classes: {
                  'nom-alert-body-content': true,
                },
                children: [titleProps, descriptionProps],
              },
            ],
          },
          {
            classes: {
              'nom-alert-actions': true,
            },
            children: actionProps,
          },
        ],
      });
    }
  }

  Component.register(AlertContent);

  class Alert extends Modal {
    constructor(props, ...mixins) {
      const defaults = {
        type: 'default',
        icon: null,
        title: null,
        description: null,
        okText: '?????????',
        onOk: (e) => {
          e.sender.close();
        },
        action: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { type, icon, title, description, okText, action } = this.props;
      this.setProps({
        content: {
          component: AlertContent,
          type,
          icon,
          title,
          description,
          okText,
          action,
        },
      });

      super._config();
    }
  }

  Component.register(Alert);

  class Anchor extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        container: null,
        items: [],
        border: 'left',
        onItemClick: null,
        width: 180,
        sticky: false,
        itemDefaults: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.container = isFunction$1(this.props.container)
        ? this.props.container()
        : this.props.container;

      this.containerElem = document;

      this.onWindowScroll = () => {
        this._fixPosition();
        this._onContainerScroll();
      };
    }

    _config() {
      const that = this;
      const { items, border, width, itemDefaults } = this.props;
      const myWidth = isNumeric(width) ? `${width}px` : width;

      this.setProps({
        classes: {
          'nom-anchor-border-left': border === 'left',
          'nom-anchor-border-right': border === 'right',
        },
        attrs: {
          style: {
            'min-width': myWidth,
          },
        },
        children: {
          component: 'Menu',
          ref: (c) => {
            that.menu = c;
          },
          itemSelectable: {
            byClick: true,
          },
          items: items,
          itemDefaults: {
            ...itemDefaults,
            ...{
              onClick: function (args) {
                const key = args.sender.key;
                that.props.onItemClick && that._callHandler(that.props.onItemClick, key);
                that._scrollToKey(key);
              },
            },
          },
        },
      });
    }

    _rendered() {
      const that = this;

      this.position = null;
      this.size = null;

      if (this.props.sticky) {
        if (this.props.sticky === true) {
          this.scrollParent = window;

          window.addEventListener('scroll', this.onWindowScroll);
        } else {
          if (isFunction$1(this.props.sticky)) {
            this.scrollParent = this.props.sticky();
          } else {
            this.scrollParent = this.props.sticky;
          }

          this.scrollParent._on('scroll', function () {
            that._fixPosition();
          });
        }
      }

      if (this.container !== window) {
        this.container._on('scroll', function () {
          that.containerElem = that.container.element;
          that._onContainerScroll();
        });
      } else {
        window.addEventListener('scroll', this.onWindowScroll);
      }
    }

    _scrollToKey(target) {
      const container = this.containerElem.getElementsByClassName(`nom-anchor-target-${target}`);
      container.length && container[0].scrollIntoView({ behavior: 'smooth' });
    }

    _fixPosition() {
      this.element.style.transform = `translateY(0px)`;
      let pRect = null;
      if (this.props.sticky === true) {
        pRect = {
          top: 0,
          height: window.innerHeight,
        };
      } else {
        pRect = this.scrollParent.element.getBoundingClientRect();
      }
      const gRect = this.element.getBoundingClientRect();

      if (gRect.top < pRect.top) {
        this.element.style.transform = `translateY(${pRect.top - gRect.top - 2}px)`;
      }
    }

    _onContainerScroll() {
      const list = this.containerElem.getElementsByClassName('nom-anchor-content');
      if (!list.length) return
      const pRect =
        this.container === window
          ? { top: 0, bottom: window.innerHeight }
          : this.containerElem.getBoundingClientRect();
      let current = 0;
      for (let i = 0; i < list.length; i++) {
        const top = list[i].getBoundingClientRect().top;
        const lastTop = i > 0 ? list[i - 1].getBoundingClientRect().top : 0;
        if (top < pRect.bottom && lastTop < pRect.top) {
          current = i;
        }
      }
      const classes = list[current].classList.value;
      const idx = classes.indexOf('target-');
      const result = classes.slice(idx + 7);

      this._activeAnchor(result);
    }

    _activeAnchor(key) {
      this.menu.selectItem(key, {
        scrollIntoView: false,
      });
    }

    _remove() {
      window.removeEventListener('scroll', this.onWindowScroll);
    }
  }

  Component.register(Anchor);

  class AnchorContent extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        key: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _rendered() {
      const { key } = this.props;

      this.element.classList.add(`nom-anchor-target-${key}`);
    }
  }

  Component.register(AnchorContent);

  class Route {
    constructor(defaultPath) {
      const that = this;

      this.hash = window.location.hash;
      if (!this.hash) {
        this.hash = `#${defaultPath}`;
      }
      this.path = this.hash.substring(1);
      this.paths = [null, null, null];
      this.query = {};
      this.queryStr = '';
      const queryIndex = this.hash.indexOf('?');

      if (this.hash.length > 1) {
        if (queryIndex > -1) {
          this.path = this.hash.substring(1, queryIndex);

          const paramStr = (this.queryStr = this.hash.substring(queryIndex + 1));
          const paramArr = paramStr.split('&');

          paramArr.forEach(function (e) {
            const item = e.split('=');
            const key = item[0];
            const val = item[1];
            if (key !== '') {
              that.query[key] = decodeURIComponent(val);
            }
          });
        }
      }

      const pathArr = this.path.split('!');

      this.maxLevel = pathArr.length - 1;

      pathArr.forEach(function (path, index) {
        that.paths[index] = path;
      });
    }
  }

  class Router extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        defaultPath: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.currentView = null;
      this.path = null;
      this.level = this.$app.lastLevel;
      this.$app.routers[this.level] = this;
      this.handleHashChange = this.handleHashChange.bind(this);
      this.$app.on('hashChange', this.handleHashChange, this);
    }

    render() {
      this._mountElement();
      this.routeView();
      this.$app.lastLevel++;
    }

    handleHashChange(changed) {
      this._callHandler(this.props.onHashChange, changed); // ???????????????????????????????????????

      if (
        changed.queryChanged &&
        (changed.changedLevel === null || this.level < changed.changedLevel)
      ) {
        this._callHandler(this.props.onQueryChange, changed);
      }

      if (changed.changedLevel === null) {
        return
      }

      if (this.level > changed.changedLevel) {
        this.remove();
      } else if (this.level === changed.changedLevel) {
        this.routeView();
        this.$app.lastLevel = this.level + 1;
      } else if (this.level === changed.changedLevel - 1) {
        this._callHandler(this.props.onSubpathChange, changed);
      }
    }

    getSubpath() {
      let subpath = null;
      const { paths } = this.$app.currentRoute;
      if (this.level < paths.length) {
        subpath = paths[this.level + 1];
      }

      return subpath
    }

    _removeCore() {}

    remove() {
      this.$app.off('hashChange', this.handleHashChange);
      delete this.$app.routers[this.level];
      for (const p in this) {
        if (this.hasOwnProperty(p)) {
          delete this[p];
        }
      }
    }

    routeView() {
      const level = this.level;
      const element = this.element;
      const defaultPath = this.props.defaultPath;
      const { paths } = this.$app.currentRoute;
      const that = this;

      if (defaultPath) {
        if (!paths[level]) {
          paths[level] = defaultPath;
        }
      }

      let url = this.getRouteUrl(level);
      url = `${pathCombine(this.$app.props.viewsDir, url)}.js`;

      require([url], (viewPropsOrRouterPropsFunc) => {
        let routerProps = {};
        if (isFunction$1(viewPropsOrRouterPropsFunc)) {
          routerProps = viewPropsOrRouterPropsFunc.call(this, {
            route: this.$app.currentRoute,
            app: this.$app,
          });
        } else {
          routerProps.view = viewPropsOrRouterPropsFunc;
        }
        if (isString(routerProps.title)) {
          document.title = routerProps.title;
        }

        // ????????????????????????
        Router.plugins.forEach((plugin) => {
          plugin(routerProps);
        });

        const extOptions = {
          reference: element,
          placement: 'replace',
        };
        const viewOptions = Component.extendProps(routerProps.view, extOptions);
        this.currentView = Component.create(viewOptions, {
          _rendered: function () {
            that.element = this.element;
          },
        });
        delete this.props._created;
        delete this.props._rendered;
        delete this.props._config;
        delete this.props._remove;
        this.setProps(routerProps);
        this._callRendered();
      });
    }

    getRouteUrl(level) {
      const paths = this.$app.currentRoute.paths;
      const maxLevel = this.$app.currentRoute.maxLevel;
      let path = paths[level];

      if (level < maxLevel) {
        path = pathCombine(path, '_layout');
      }

      path = prefix(path, level);

      function prefix(patharg, levelarg) {
        if (levelarg === 0) {
          return patharg
        }
        if (patharg[0] !== '/') {
          patharg = pathCombine(paths[levelarg - 1], patharg);
          return prefix(patharg, levelarg - 1)
        }

        return patharg
      }

      return path
    }
  }

  Router.plugins = [];

  Component.register(Router);

  /* eslint-disable no-shadow */

  class App extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'body',
        placement: 'replace',
        defaultPath: '!',
        viewsDir: '/',
        isFixedLayout: true,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.lastLevel = 0;
      this.previousRoute = null;
      this.currentRoute = new Route(this.props.defaultPath);

      this.routers = {};

      Object.defineProperty(Component.prototype, '$app', {
        get: function () {
          return this.root
        },
      });

      Object.defineProperty(Component.prototype, '$route', {
        get: function () {
          return this.$app.currentRoute
        },
      });
    }

    _config() {
      this.setProps({
        children: { component: Router },
      });

      if (this.props.isFixedLayout === true) {
        document.documentElement.setAttribute('class', 'app');
      }
    }

    _rendered() {
      const that = this;
      window.addEventListener('hashchange', function () {
        that.handleRoute();
      });
    }

    handleRoute() {
      const route = new Route(this.props.defaultPath);
      console.info(JSON.stringify(route));

      let changedLevel = null;
      let queryChanged = false;

      this.previousRoute = this.currentRoute;
      this.currentRoute = route;

      if (this.previousRoute !== null) {
        const currentRoutePaths = this.currentRoute.paths;
        const previousRoutePaths = this.previousRoute.paths;

        const length = Math.min(previousRoutePaths.length, currentRoutePaths.length);
        for (let i = 0; i < length; i++) {
          if (previousRoutePaths[i] !== currentRoutePaths[i]) {
            changedLevel = i;
            break
          }
        }
        if ((this.previousRoute.queryStr || '') !== this.currentRoute.queryStr) {
          queryChanged = true;
        }
      }

      this.trigger('hashChange', { changedLevel, queryChanged, route: this.currentRoute, app: this });
    }
  }

  Component.register(App);

  class LayerBackdrop extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        zIndex: 2,
        attrs: {
          style: {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            userSelect: 'none',
            opacity: 0.1,
            background: '#000',
          },
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this.setProps({
        attrs: {
          style: {
            zIndex: this.props.zIndex,
          },
        },
      });

      if (this.referenceElement === document.body) {
        this.setProps({
          attrs: {
            style: {
              position: 'fixed',
            },
          },
        });
      }
    }
  }

  Component.register(LayerBackdrop);

  class Layer extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        align: null,
        alignTo: null,
        alignOuter: false,
        within: window,
        collision: 'flipfit',
        onClose: null,
        onHide: null,
        onShow: null,

        closeOnClickOutside: false,
        closeToRemove: false,

        position: null,

        hidden: false,

        backdrop: false,
        closeOnClickBackdrop: false,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.relativeElements = [];
      this._onDocumentMousedown = this._onDocumentMousedown.bind(this);
      this._onWindowResize = this._onWindowResize.bind(this);
    }

    _config() {
      if (this.props.placement === 'replace') {
        this.props.position = null;
      }

      this._normalizePosition();
      this._zIndex = getzIndex();
      this.setProps({
        attrs: {
          style: {
            zIndex: this._zIndex,
          },
        },
      });
      if (this.props.align || this.props.position) {
        this.setProps({
          attrs: {
            style: {
              position: this.props.fixed ? 'fixed' : 'absolute',
              left: 0,
              top: 0,
            },
          },
        });
      }
    }

    _rendered() {
      const that = this;

      this.addRel(this.element);
      if (this.props.backdrop) {
        this.backdrop = new LayerBackdrop({
          zIndex: this._zIndex - 1,
          reference: this.props.reference,
        });

        if (this.props.closeOnClickBackdrop) {
          this.backdrop._on('click', function (e) {
            if (e.target !== e.currentTarget) {
              return
            }
            that.remove();
          });
        }
      }
    }

    _show() {
      const { props } = this;

      this.setPosition();
      this._docClickHandler();

      if (props.align) {
        window.removeEventListener('resize', this._onWindowResize, false);
        window.addEventListener('resize', this._onWindowResize, false);
      }
      this.props.onShow && this._callHandler(this.props.onShow);
    }

    _hide(forceRemove) {
      window.removeEventListener('resize', this._onWindowResize, false);
      document.removeEventListener('mousedown', this._onDocumentMousedown, false);

      if (forceRemove === true || this.props.closeToRemove) {
        this.props.onClose && this._callHandler(this.props.onClose);
        this.remove();
      }
    }

    _remove() {
      window.removeEventListener('resize', this._onWindowResize, false);
      document.removeEventListener('mousedown', this._onDocumentMousedown, false);

      if (this.backdrop) {
        this.backdrop.remove();
      }
    }

    _onWindowResize() {
      if (this.props.hidden === false) {
        this.setPosition();
      }
    }

    _onDocumentMousedown(e) {
      for (let i = 0; i < this.relativeElements.length; i++) {
        const el = this.relativeElements[i];
        if (el === e.target || el.contains(e.target)) {
          return
        }
      }

      const closestLayer = e.target.closest('.nom-layer');
      if (closestLayer !== null) {
        const idx = closestLayer.component._zIndex;
        if (idx < this._zIndex) {
          this.hide();
        }
      } else {
        this.hide();
      }
    }

    setPosition() {
      if (this.props.position) {
        position(this.element, this.props.position);
      }
    }

    addRel(elem) {
      this.relativeElements.push(elem);
    }

    _docClickHandler() {
      const that = this;
      if (that.props.closeOnClickOutside) {
        document.addEventListener('mousedown', this._onDocumentMousedown, false);
      }
    }

    _normalizePosition() {
      const { props } = this;

      if (props.align) {
        props.position = {
          of: window,
          collision: props.collision,
          within: props.within,
        };

        if (props.alignTo) {
          props.position.of = props.alignTo;
        }

        if (props.alignTo && props.alignOuter === true) {
          const arr = props.align.split(' ');
          if (arr.length === 1) {
            arr[1] = 'center';
          }

          const myArr = ['center', 'center'];
          const atArr = ['center', 'center'];

          if (arr[1] === 'left') {
            myArr[0] = 'left';
            atArr[0] = 'left';
          } else if (arr[1] === 'right') {
            myArr[0] = 'right';
            atArr[0] = 'right';
          } else if (arr[1] === 'top') {
            myArr[1] = 'top';
            atArr[1] = 'top';
          } else if (arr[1] === 'bottom') {
            myArr[1] = 'bottom';
            atArr[1] = 'bottom';
          }

          if (arr[0] === 'top') {
            myArr[1] = 'bottom';
            atArr[1] = 'top';
          } else if (arr[0] === 'bottom') {
            myArr[1] = 'top';
            atArr[1] = 'bottom';
          } else if (arr[0] === 'left') {
            myArr[0] = 'right';
            atArr[0] = 'left';
          } else if (arr[0] === 'right') {
            myArr[0] = 'left';
            atArr[0] = 'right';
          }

          props.position.my = `${myArr[0]} ${myArr[1]}`;
          props.position.at = `${atArr[0]} ${atArr[1]}`;
        } else {
          const rhorizontal = /left|center|right/;
          const rvertical = /top|center|bottom/;
          let pos = props.align.split(' ');
          if (pos.length === 1) {
            pos = rhorizontal.test(pos[0])
              ? pos.concat(['center'])
              : rvertical.test(pos[0])
              ? ['center'].concat(pos)
              : ['center', 'center'];
          }
          pos[0] = rhorizontal.test(pos[0]) ? pos[0] : 'center';
          pos[1] = rvertical.test(pos[1]) ? pos[1] : 'center';

          props.position.my = `${pos[0]} ${pos[1]}`;
          props.position.at = `${pos[0]} ${pos[1]}`;
        }
      }
    }
  }

  Component.register(Layer);

  class Tooltip extends Layer {
    constructor(props, ...mixins) {
      const defaults = {
        trigger: null,
        align: 'top',
        alignOuter: true,

        closeOnClickOutside: true,

        autoRender: false,
        hidden: false,

        styles: {
          color: 'black',
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();

      this._showHandler = this._showHandler.bind(this);
      this._hideHandler = this._hideHandler.bind(this);
      this._onOpenerFocusinHandler = this._onOpenerFocusinHandler.bind(this);
      this._onOpenerFocusoutHandler = this._onOpenerFocusoutHandler.bind(this);

      this._openerFocusing = false;
      this.opener = this.props.trigger;
      this.props.alignTo = this.opener.element;
      this.showTimer = null;
      this.hideTimer = null;
      this.delay = 100;
      this.addRel(this.opener.element);
      this._bindHover();
    }

    _remove() {
      this.opener._off('mouseenter', this._showHandler);
      this.opener._off('mouseleave', this._hideHandler);
      this.opener._off('focusin', this._onOpenerFocusinHandler);
      this.opener._off('focusout', this._onOpenerFocusoutHandler);

      this._off('mouseenter');
      this._off('mouseleave');
      clearTimeout(this.showTimer);
      this.showTimer = null;
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
      super._remove();
    }

    _bindHover() {
      this.opener._on('mouseenter', this._showHandler);
      this.opener._on('mouseleave', this._hideHandler);
      this.opener._on('focusin', this._onOpenerFocusinHandler);
      this.opener._on('focusout', this._onOpenerFocusoutHandler);
    }

    _onOpenerFocusinHandler() {
      this._openerFocusing = true;
      this._showHandler();
    }

    _onOpenerFocusoutHandler() {
      this._openerFocusing = false;
      this._hideHandler();
    }

    _showHandler() {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
      this.showTimer = setTimeout(() => {
        this.show();
      }, this.delay);
    }

    _hideHandler() {
      if (this._openerFocusing === true) {
        return
      }
      clearTimeout(this.showTimer);
      this.showTimer = null;

      if (this.props.hidden === false) {
        this.hideTimer = setTimeout(() => {
          this.hide();
        }, this.delay);
      }
    }

    _show() {
      super._show();
      this._off('mouseenter');
      this._on('mouseenter', function () {
        clearTimeout(this.hideTimer);
      });
      this._off('mouseleave', this._hideHandler);
      this._on('mouseleave', this._hideHandler);
    }
  }

  Component.mixin({
    _rendered: function () {
      if (this.props.tooltip) {
        if (isString(this.props.tooltip)) {
          this.tooltip = new Tooltip({ trigger: this, children: this.props.tooltip });
        } else {
          this.tooltip = new Tooltip(
            Component.extendProps({}, this.props.tooltip, {
              trigger: this,
            }),
          );
        }
      }
    },
  });

  Component.register(Tooltip);

  /* eslint-disable no-useless-escape */

  const RuleManager = {};
  RuleManager.ruleTypes = {
    required: {
      validate: function (value) {
        return !isEmpty(value)
      },
      message: '??????',
    },
    number: {
      validate: function (value) {
        return !isEmpty(value) ? /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value) : true
      },
      message: '????????????????????????',
    },
    digits: {
      validate: function (value) {
        return !isEmpty(value) ? /^\d+$/.test(value) : true
      },
      message: '??????????????????',
    },
    regex: {
      validate: function (value, ruleValue) {
        return !isEmpty(value)
          ? new RegExp(ruleValue.pattern, ruleValue.attributes).test(value)
          : true
      },
    },
    email: {
      validate: function (value) {
        return !isEmpty(value)
          ? /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(
              value,
            )
          : true
      },
      message: '?????????????????? Email ??????',
    },
    url: {
      validate: function (value) {
        return !isEmpty(value)
          ? /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(
              value,
            )
          : true
      },
      message: '?????????????????? URL',
    },
    min: {
      validate: function (value, ruleValue) {
        return !isEmpty(value) ? Number(value) >= ruleValue : true
      },
      message: '????????????????????? {0}',
    },
    max: {
      validate: function (value, ruleValue) {
        return !isEmpty(value) ? Number(value) <= ruleValue : true
      },
      message: '????????????????????? {0}',
    },
    range: {
      validate: function (value, ruleValue) {
        return !isEmpty(value) ? Number(value) >= ruleValue[0] && Number(value) <= ruleValue[1] : true
      },
      message: '????????????????????? {0} ??? {1} ??????',
    },
    minlength: {
      validate: function (value, ruleValue) {
        if (!isEmpty(value)) {
          let length = 0;
          if (Array.isArray(value)) {
            length = value.length;
          } else {
            length = value.trim().length;
          }

          return length >= ruleValue
        }
        return true
      },
      message: '???????????? {0} ??????',
    },
    maxlength: {
      validate: function (value, ruleValue) {
        if (!isEmpty(value)) {
          let length = 0;
          if (Array.isArray(value)) {
            length = value.length;
          } else {
            length = value.trim().length;
          }

          return length <= ruleValue
        }
        return true
      },
      message: '???????????? {0} ??????',
    },
    rangelength: {
      validate: function (value, ruleValue) {
        if (!isEmpty(value)) {
          let length = 0;
          if (Array.isArray(value)) {
            length = value.length;
          } else {
            length = value.trim().length;
          }

          return ruleValue[0] <= length && length <= ruleValue[1]
        }
        return true
      },
      message: '??????????????? {0} ?????? {1} ?????????',
    },
    remote: {
      validate: function (value, ruleValue) {
        const data = {};
        data[ruleValue[1]] = value;
        const response = $.ajax({
          url: ruleValue[0],
          dataType: 'json',
          data: data,
          async: false,
          cache: false,
          type: 'post',
        }).responseText;
        return response === 'true'
      },
      message: 'Please fix this field',
    },
    date: {
      validate: function () {
        return true
      },
      message: '??????????????????????????????.',
    },
    identifier: {
      validate: function (value) {
        return !isEmpty(value) ? /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value) : true
      },
      message: '???????????????????????????????????????????????????????????????',
    },
    phoneNumber: {
      validate: function (value) {
        return !isEmpty(value) ? /^1[3|4|5|7|8][0-9]{9}$/.test(value) : true
      },
      message: '???????????????????????????',
    },
    func: {
      validate: function (value, ruleValue) {
        if (!isEmpty(value) && isFunction$1(ruleValue)) {
          return ruleValue(value)
        }
        return true
      },
    },
  };

  RuleManager.validate = function (rules, controlValue) {
    for (let i = 0; i < rules.length; i++) {
      const checkResult = checkRule(rules[i], controlValue);
      if (checkResult !== true) {
        return checkResult
      }
    }

    return true
  };

  function isEmpty(val) {
    return val === undefined || val === null || val === '' || (Array.isArray(val) && !val.length)
  }

  function checkRule(ruleSettings, controlValue) {
    const rule = RuleManager.ruleTypes[ruleSettings.type];

    if (rule) {
      let ruleValue = ruleSettings.value || null;
      if (!rule.validate(controlValue, ruleValue)) {
        let message = ruleSettings.message || rule.message;
        if (ruleValue !== null) {
          if (!Array.isArray(ruleValue)) {
            ruleValue = [ruleValue];
          }
          for (let i = 0; i < ruleValue.length; i++) {
            message = message.replace(new RegExp(`\\{${i}\\}`, 'g'), ruleValue[i]);
          }
        }
        return message
      }
    }
    return true
  }

  var FieldActionMixin = {
      _created: function () {
          this.field = this.parent;
          this.field.action = this;
      }
  };

  var ControlMixin = {
    _created: function () {
      this.field = this.parent.field;
      this.field.control = this;
      this.form = this.field.form;
      this.__isControl = true;
    },
  };

  var ControlActionMixin = {
      _created: function () {
          this.field = this.parent.field;
          this.field.controlAction = this;
      }
  };

  var ControlBeforeMixin = {
    _created: function () {
      this.field = this.parent.field;
      this.field.controlBefore = this;
    },
  };

  var ControlAfterMixin = {
      _created: function () {
          this.field = this.parent.field;
          this.field.controlAfter = this;
      }
  };

  class FieldContent extends Component {
    // eslint-disable-next-line no-useless-constructor
    constructor(props, ...mixins) {
      super(props, ...mixins);
    }

    _created() {
      this.field = this.parent;
      this.field.content = this;
    }

    _config() {
      const { control, controlBefore, controlAfter, controlAction } = this.field.props;

      let controlAfterProps = null;
      if (controlAfter) {
        controlAfterProps = { component: 'List', classes: { 'nom-control-after': true } };
        if (Array.isArray(controlAfter)) {
          controlAfterProps = Component.extendProps(controlAfterProps, { items: controlAfter });
        } else {
          controlAfterProps = Component.extendProps(controlAfterProps, controlAfter);
        }
      }

      let controlBeforeProps = null;
      if (controlBefore) {
        controlBeforeProps = { component: 'List', classes: { 'nom-control-before': true } };
        if (Array.isArray(controlAfter)) {
          controlBeforeProps = Component.extendProps(controlBeforeProps, { items: controlBefore });
        } else {
          controlBeforeProps = Component.extendProps(controlBeforeProps, controlBefore);
        }
      }

      let controlActionProps = null;
      if (controlAction) {
        controlActionProps = {
          component: 'List',
          gutter: 'sm',
          classes: { 'nom-control-action': true },
        };
        if (Array.isArray(controlAction)) {
          controlActionProps = Component.extendProps(controlActionProps, { items: controlAction });
        } else {
          controlActionProps = Component.extendProps(controlActionProps, controlAction);
        }
      }

      this.setProps({
        children: [
          controlBeforeProps && n(controlBeforeProps, [ControlBeforeMixin]),
          n(null, Component.extendProps(control, { classes: { 'nom-control': true } }), null, [
            ControlMixin,
          ]),
          controlAfterProps && n(controlAfterProps, [ControlAfterMixin]),
          controlActionProps && n(controlActionProps, [ControlActionMixin]),
        ],
      });
    }
  }

  Component.register(FieldContent);

  class FieldLabel extends Component {
    // constructor(props, ...mixins) {
    //   super(props)
    // }

    _created() {
      this.field = this.parent;
    }

    _config() {
      this.setProps({
        children: {
          tag: 'label',
          classes: {
            'nom-label': true,
          },
          children: this.field.props.label,
        },
      });
    }
  }

  Component.register(FieldLabel);

  let nameSeq = 0;

  class Field extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        label: null,
        labelAlign: 'right',
        invalidTipAlign: 'top right',
        value: null,
        flatValue: false,
        span: null,
        notShowLabel: false,
        rules: [],
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      const { name, value } = this.props;
      this.initValue = value !== undefined ? clone(this.props.value) : null;
      this.oldValue = null;
      this.currentValue = this.initValue;
      if (name) {
        this.name = name;
        this._autoName = false;
      } else {
        this._autoName = true;
        this.name = `__field${++nameSeq}`;
      }
      this.group = this.props.__group || null;
      if (this.parent && this.parent.__isControl === true) {
        this.group = this.parent.field;
      }
      this.rootField = this.group === null ? this : this.group.rootField;
    }

    _config() {
      delete this.errorTip;

      this._addPropStyle('required', 'requiredMark', 'labelAlign', 'controlWidth', 'plain');
      const {
        label,
        labelWidth,
        span,
        notShowLabel,
        required,
        requiredMessage,
        rules,
        action,
      } = this.props;
      const showLabel = notShowLabel === false && label !== undefined && label !== null;

      if (required === true) {
        rules.unshift({ type: 'required', message: requiredMessage });
      }

      if (span) {
        this.setProps({
          styles: {
            col: span,
          },
        });
      }

      let labelProps = showLabel ? { component: FieldLabel } : null;
      if (labelProps && labelWidth) {
        labelProps = Component.extendProps(labelProps, {
          attrs: {
            style: {
              width: `${labelWidth}px`,
              maxWidth: `${labelWidth}px`,
              flexBasis: `${labelWidth}px`,
            },
          },
        });
      }

      let actionProps = null;
      if (action) {
        actionProps = { component: 'List', classes: { 'nom-field-action': true } };
        if (Array.isArray(action)) {
          actionProps = Component.extendProps(actionProps, { items: action });
        } else {
          actionProps = Component.extendProps(actionProps, action);
        }
      }

      this.setProps({
        children: [
          labelProps,
          { component: FieldContent, value: this.props.value },
          actionProps && n(actionProps, [FieldActionMixin]),
        ],
      });
    }

    getValue(options) {
      const value = isFunction$1(this._getValue) ? this._getValue(options) : null;
      return value
    }

    setValue(value, options) {
      if (options === false) {
        options = { triggerChange: false };
      } else {
        options = extend({ triggerChange: true }, options);
      }
      isFunction$1(this._setValue) && this._setValue(value, options);
    }

    getValueText(options, value) {
      return isFunction$1(this._getValueText) ? this._getValueText(options, value) : null
    }

    validate() {
      this.validateTriggered = true;
      return this._validate()
    }

    _validate() {
      const { rules, disabled, hidden } = this.props;
      if (disabled || hidden) {
        return true
      }
      const value = this._getRawValue ? this._getRawValue() : this.getValue();

      if (Array.isArray(rules) && rules.length > 0) {
        const validationResult = RuleManager.validate(rules, value);

        if (validationResult === true) {
          this.removeClass('s-invalid');
          this.trigger('valid');
          if (this.errorTip) {
            this.errorTip.remove();
            delete this.errorTip;
          }
          return true
        }

        this.addClass('s-invalid');
        this.trigger('invalid', validationResult);
        this._invalid(validationResult);
        return false
      }

      return true
    }

    _invalid(message) {
      if (!this.errorTip) {
        this.errorTip = new Tooltip({
          trigger: this,
          reference: this.content,
          styles: {
            color: 'danger',
          },
          children: message,
        });

        if (this.element.contains(document.activeElement)) {
          this.errorTip.show();
        }
      } else {
        this.errorTip.update({
          children: message,
        });
      }
    }

    focus() {
      isFunction$1(this._focus) && this._focus();
    }

    blur() {
      isFunction$1(this._blur) && this._blur();
    }

    reset() {
      isFunction$1(this._reset) && this._reset();
    }

    clear() {
      isFunction$1(this._clear) && this._clear();
    }

    after(props) {
      if (props) {
        props.__group = this.group;
      }
      return super.after(props)
    }

    _reset() {
      this.setValue(this.initValue);
    }

    _clear() {
      this.setValue(null);
    }

    _remove() {
      if (this.group && Array.isArray(this.group.fields)) {
        const fields = this.group.fields;

        for (let i = 0; i < fields.length; i++) {
          if (fields[i] === this) {
            delete fields[i];
            fields.splice(i, 1);
          }
        }
      }
    }

    // ?????????????????????????????????????????????
    _onValueChange(args) {
      const that = this;
      this.oldValue = clone(this.currentValue);
      this.currentValue = clone(this.getValue());
      this.props.value = this.currentValue;

      args = extend(true, args, {
        name: this.props.name,
        oldValue: this.oldValue,
        newValue: this.currentValue,
      });
      setTimeout(function () {
        that._callHandler(that.props.onValueChange, args);
        that.group && that.group._onValueChange({ changedField: args.changedField || that });
        isFunction$1(that._valueChange) && that._valueChange(args);
        if (that.validateTriggered) {
          that._validate();
        }
      }, 0);
    }
  }

  Object.defineProperty(Field.prototype, 'fields', {
    get: function () {
      return this.control.getChildren()
    },
  });

  Component.register(Field);

  class Input extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'input',
        attrs: {
          type: 'text',
          autocomplete: 'off',
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.capsLock = false;
    }

    _config() {
      this.setProps({
        attrs: {
          value: this.props.value,
          oninput: () => {
            if (!this.capsLock) {
              this.textbox._onValueChange();
            }
          },
          onblur: () => {
            this.textbox.trigger('blur');
            this.textbox._onBlur();
          },
          oncompositionstart: () => {
            this.capsLock = true;
          },
          oncompositionend: () => {
            this.capsLock = false;
            this.element.dispatchEvent(new Event('input'));
          },
        },
      });
    }

    _rendered() {
      if (this.textbox.props.autofocus === true) {
        this.focus();
      }
    }

    getText() {
      return this.element.value
    }

    setText(text) {
      this.element.value = text;
    }

    focus() {
      this.element.focus();
    }

    blur() {
      this.element.blur();
    }

    disable() {
      this.element.setAttribute('disabled', 'disabled');
    }

    enable() {
      this.element.removeAttribute('disabled', 'disabled');
    }
  }

  class Textbox extends Field {
    constructor(props, ...mixins) {
      const defaults = {
        leftIcon: null,
        rightIcon: null,
        autofocus: false,
        placeholder: null,
        value: null,
        htmlType: 'text',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const that = this;
      const { leftIcon, rightIcon, placeholder, value, htmlType } = this.props;

      let leftIconProps = Component.normalizeIconProps(leftIcon);
      if (leftIconProps != null) {
        leftIconProps = Component.extendProps(leftIconProps, {
          classes: { 'nom-textbox-left-icon': true },
        });
      }

      let rightIconProps = Component.normalizeIconProps(rightIcon);
      if (rightIconProps != null) {
        rightIconProps = Component.extendProps(rightIconProps, {
          classes: { 'nom-textbox-right-icon': true },
        });
      }

      const inputProps = {
        component: Input,
        name: 'input',
        attrs: {
          value: value,
          placeholder: placeholder,
          type: htmlType,
        },
        _created: function () {
          this.textbox = that;
          this.textbox.input = this;
        },
      };

      this.setProps({
        classes: {
          'p-with-left-icon': !!leftIcon,
          'p-with-right-icon': !!rightIcon,
        },
        control: {
          children: [inputProps, leftIcon && leftIconProps, rightIcon && rightIconProps],
        },
      });

      super._config();
    }

    getText() {
      return this.input.getText()
    }

    _getValue() {
      const inputText = this.getText();
      if (inputText === '') {
        return null
      }
      return inputText
    }

    _setValue(value, options) {
      if (options === false) {
        options = { triggerChange: false };
      } else {
        options = extend({ triggerChange: true }, options);
      }

      this.input.setText(value);
      const newValue = this.getValue();
      if (options.triggerChange) {
        if (newValue !== this.oldValue) {
          super._onValueChange();
        }
      }
      this.oldValue = this.currentValue;
      this.currentValue = newValue;
    }

    focus() {
      this.input.focus();
    }

    blur() {
      this.input.blur();
    }

    _onBlur() {
      this._callHandler(this.props.onBlur);
    }

    _disable() {
      this.input.disable();
    }

    _enable() {
      this.input.enable();
    }
  }

  Component.register(Textbox);

  class Empty extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        description: false,
        image: Empty.PRESENTED_IMAGE_DEFAULT,
        imageStyle: {},
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { image, imageStyle, description } = this.props;
      let imageNode = image;
      if (typeof image === 'string' && !image.startsWith('#')) {
        imageNode = {
          tag: 'img',
          attrs: {
            src: image,
            alt: description,
          },
        };
      }

      const { children } = this.props;

      this.setProps({
        classes: {
          [`nom-empty-normal`]: image === Empty.PRESENTED_IMAGE_SIMPLE,
        },
        children: [
          {
            classes: {
              [`nom-empty-image`]: true,
            },
            attrs: {
              style: imageStyle,
            },
            children: imageNode,
          },
          description
            ? {
                classes: {
                  [`nom-empty-description`]: true,
                },
                children: description,
              }
            : undefined,
          children
            ? {
                classes: {
                  [`nom-empty-footer`]: true,
                },
                children: children,
              }
            : undefined,
        ],
      });
    }
  }

  Empty.PRESENTED_IMAGE_SIMPLE = `#<svg t="1619148284824" class="nom-empty-img-simple"  width="64" height="64" viewBox="0 0 1351 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2122" width="200" height="200"><path d="M467.21267 479.648s2.688 2.688 8.096 2.688h393.44c2.688 0 5.376-2.688 8.096-2.688V358.4h409.6c-2.688-8.096-2.688-13.472-8.096-21.568L1014.25267 59.264H335.18067L71.08467 336.832c-5.376 2.688-8.096 10.784-8.096 21.568h409.6v121.248h-5.376z m-409.6-61.952v476.96c0 37.728 40.416 70.048 88.928 70.048h1053.632c48.512 0 88.928-32.352 88.928-70.048V412.288H936.07667v64.672c0 32.352-29.632 59.296-61.984 59.296h-393.44c-35.04 0-61.984-26.944-61.984-59.296v-64.672H62.95667v5.376zM1200.20467 1024H146.57267C65.74067 1024 1.06867 964.704 1.06867 894.656v-476.96c-2.688-48.512-2.688-94.304 29.632-123.968L313.64467 0h724.896l282.944 293.728c32.352 29.632 29.632 83.552 29.632 142.816v455.424C1345.74067 964.736 1278.34867 1024 1200.20467 1024z" p-id="2123" fill="#d9d9d9"></path></svg>`;

  Empty.PRESENTED_IMAGE_DEFAULT = `#<svg t="1619147741727" class="nom-empty-img-normal"  width="184" height="152" viewBox="0 0 1084 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4197" width="200" height="200"><path d="M0 933.456842a456.737684 85.342316 0 1 0 913.475368 0 456.737684 85.342316 0 1 0-913.475368 0Z" fill="#F5F5F7" fill-opacity=".8" p-id="4198"></path><path d="M822.130526 682.738526L660.944842 484.372211c-7.733895-9.337263-19.038316-14.989474-30.942316-14.989474h-346.543158c-11.897263 0-23.201684 5.652211-30.935579 14.989474L91.351579 682.738526v103.632842h730.778947V682.738526z" fill="#AEB8C2" p-id="4199"></path><path d="M775.390316 794.165895L634.543158 624.990316c-6.743579-8.131368-16.889263-12.577684-27.270737-12.577684H305.071158c-10.374737 0-20.527158 4.446316-27.270737 12.577684L136.953263 794.165895v92.914526h638.437053V794.165895z" fill="#000000" p-id="4200"></path><path d="M227.907368 213.355789h457.653895a26.947368 26.947368 0 0 1 26.947369 26.947369v628.843789a26.947368 26.947368 0 0 1-26.947369 26.947369H227.907368a26.947368 26.947368 0 0 1-26.947368-26.947369V240.303158a26.947368 26.947368 0 0 1 26.947368-26.947369z" fill="#F5F5F7" p-id="4201"></path><path d="M287.514947 280.407579h338.438737a13.473684 13.473684 0 0 1 13.473684 13.473684V462.012632a13.473684 13.473684 0 0 1-13.473684 13.473684H287.514947a13.473684 13.473684 0 0 1-13.473684-13.473684V293.881263a13.473684 13.473684 0 0 1 13.473684-13.473684z m1.765053 268.220632h334.908632a15.238737 15.238737 0 0 1 0 30.477473H289.28a15.238737 15.238737 0 0 1 0-30.477473z m0 79.245473h334.908632a15.245474 15.245474 0 0 1 0 30.484211H289.28a15.245474 15.245474 0 0 1 0-30.484211z m531.354947 293.066105c-5.221053 20.688842-23.558737 36.109474-45.372631 36.109474H138.206316c-21.813895 0-40.151579-15.427368-45.365895-36.109474a49.300211 49.300211 0 0 1-1.495579-12.058947V682.745263h177.300211c19.584 0 35.368421 16.491789 35.368421 36.513684v0.269474c0 20.015158 15.966316 36.176842 35.550315 36.176842h234.341053c19.584 0 35.550316-16.309895 35.550316-36.331789V719.292632c0-20.021895 15.784421-36.554105 35.368421-36.554106h177.30021v226.149053a49.381053 49.381053 0 0 1-1.488842 12.05221z" fill="#DCE0E6" p-id="4202"></path><path d="M842.920421 224.282947l-46.012632 17.852632a6.736842 6.736842 0 0 1-8.872421-8.286316l13.049264-41.815579c-17.441684-19.833263-27.681684-44.018526-27.681685-70.117052C773.402947 54.581895 841.566316 0 925.655579 0 1009.724632 0 1077.894737 54.581895 1077.894737 121.916632c0 67.334737-68.163368 121.916632-152.245895 121.916631-30.504421 0-58.906947-7.181474-82.728421-19.550316z" fill="#DCE0E6" p-id="4203"></path><path d="M985.626947 106.004211c10.597053 0 19.193263 8.488421 19.193264 18.96421s-8.596211 18.964211-19.193264 18.964211c-10.597053 0-19.193263-8.488421-19.193263-18.964211s8.596211-18.964211 19.193263-18.96421z m-119.619368 2.371368l18.863158 33.185684h-38.386526l19.523368-33.185684z m76.43621 0v33.185684h-33.583157v-33.185684h33.583157z" fill="#FFFFFF" p-id="4204"></path></svg>`;

  Component.register(Empty);

  class LayoutHeader extends Component {
    // constructor(props, ...mixins) {
    //   super(props)
    // }
  }

  Component.register(LayoutHeader);

  class LayoutBody extends Component {
    // constructor(props, ...mixins) {
    //     super(props)
    // }
  }

  Component.register(LayoutBody);

  class LayoutFooter extends Component {
    // constructor(props, ...mixins) {
    //     super(props);
    // }
  }

  Component.register(LayoutFooter);

  class LayoutSider extends Component {
    // constructor(props, ...mixins) {
    //   super(props)
    // }
  }

  Component.register(LayoutSider);

  class LayoutAsider extends Component {
    // constructor(props, ...mixins) {
    //   super(props)
    // }
  }

  Component.register(LayoutAsider);

  class Layout extends Component {
      constructor(props, ...mixins) {
          const defaults = {
              header: null,
              body: null,
              footer: null,
              sider: null,
              asider: null,
              fit: true
          };

          super(Component.extendProps(defaults, props), ...mixins);
      }

      _config() {
          const { header, body, footer, sider, asider } = this.props;
          this._addPropStyle('fit');

          this.setProps(
              {
                  tag: 'div',
                  header: header && { component: LayoutHeader },
                  body: body && { component: LayoutBody },
                  footer: footer && { component: LayoutFooter },
                  sider: sider && { component: LayoutSider },
                  asider: asider && { component: LayoutAsider }
              }
          );

          if (sider || asider) {
              this.setProps({
                  classes: {
                      'p-has-sider': true
                  },
                  children: [
                      this.props.sider,
                      this.props.body,
                      this.props.asider
                  ]
              });
          }
          else {
              this.setProps({
                  children: [
                      this.props.header,
                      this.props.body,
                      this.props.footer
                  ]
              });
          }
      }
  }

  Component.register(Layout);

  class Popup extends Layer {
    constructor(props, ...mixins) {
      const defaults = {
        trigger: null,
        triggerAction: 'click',
        align: 'bottom left',
        alignOuter: true,

        closeOnClickOutside: true,
        placement: 'append',

        autoRender: false,
        hidden: true,

        uistyle: 'default',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();

      this._showHandler = this._showHandler.bind(this);
      this._hideHandler = this._hideHandler.bind(this);
      this._onOpenerClickHandler = this._onOpenerClickHandler.bind(this);

      this.opener = this.props.trigger;
      this.props.alignTo = this.opener.element;
      this.showTimer = null;
      this.hideTimer = null;
      this.addRel(this.opener.element);
      this._bindTrigger();
    }

    _bindTrigger() {
      const { triggerAction } = this.props;
      if (triggerAction === 'click') {
        this._bindClick();
      }
      if (triggerAction === 'hover') {
        this._bindHover();
      }
      if (triggerAction === 'both') {
        this._bindClick();
        this._bindHover();
      }
    }

    _bindClick() {
      this.opener._on('click', this._onOpenerClickHandler);
    }

    _bindHover() {
      this.opener._on('mouseenter', this._showHandler);
      this.opener._on('mouseleave', this._hideHandler);
    }

    _onOpenerClickHandler() {
      if (this.opener.props.disabled !== true) {
        this.toggleHidden();
      }
    }

    _showHandler() {
      if (this.opener.props.disabled !== true) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
        this.showTimer = setTimeout(() => {
          this.show();
        }, this.delay);
      }
    }

    _hideHandler() {
      if (this.opener.props.disabled !== true) {
        clearTimeout(this.showTimer);
        this.showTimer = null;

        if (this.props.hidden === false) {
          this.hideTimer = setTimeout(() => {
            this.hide();
          }, this.delay);
        }
      }
    }

    _show() {
      super._show();
      if (this.props.triggerAction === 'hover') {
        this._off('mouseenter');
        this._on('mouseenter', () => {
          clearTimeout(this.hideTimer);
        });
        this._off('mouseleave');
        this._on('mouseleave', this._hideHandler);
      }
    }
  }

  Component.mixin({
    _rendered: function () {
      if (this.props.popup) {
        this.props.popup.trigger = this;
        this.popup = new Popup(this.props.popup);
      }
    },
  });

  Component.register(Popup);

  var ListItemMixin = {
    _created: function () {
      this.wrapper = this.parent;
      this.wrapper.item = this;
      this.list = this.wrapper.list;
      this.list.itemRefs[this.key] = this;
    },
    _config: function () {
      const { onSelect, onUnselect } = this.props;
      const listProps = this.list.props;
      const selectedItems =
        listProps.selectedItems !== null && listProps.selectedItems !== undefined
          ? Array.isArray(listProps.selectedItems)
            ? listProps.selectedItems
            : [listProps.selectedItems]
          : [];

      this.setProps({
        classes: {
          'nom-list-item': true,
        },
        selected: selectedItems.indexOf(this.key) !== -1,
        selectable: {
          byClick: listProps.itemSelectable.byClick,
          canRevert: listProps.itemSelectable.multiple === true,
        },
        _shouldHandleClick: function () {
          if (listProps.disabled === true) {
            return false
          }
        },
        onSelect: () => {
          if (listProps.itemSelectable.multiple === false) {
            listProps.selectedItems = this.key;
            if (this.list.selectedItem !== null) {
              this.list.selectedItem.unselect({ triggerSelectionChange: false });
            }
            this.list.selectedItem = this;
          }

          this._callHandler(onSelect);
        },
        onUnselect: () => {
          if (listProps.selectedItems === this.key) {
            listProps.selectedItems = null;
          }
          if (this.list.selectedItem === this) {
            this.list.selectedItem = null;
          }

          this._callHandler(onUnselect);
        },
        onSelectionChange: () => {
          this.list._onItemSelectionChange();
        },
      });
    },
    _rendered: function () {
      const listProps = this.list.props;
      if (listProps.itemSelectable.multiple === false) {
        if (this.props.selected) {
          this.list.selectedItem = this;
          if (listProps.itemSelectable.multiple.scrollIntoValue) {
            this.list.scrollTo(this.list.selectedItem);
          }
        }
      }
    },
    _remove: function () {
      delete this.list.itemRefs[this.key];
    },
  };

  class ListItemWrapper extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'li',
        item: {},
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.list = this.parent.list;
    }

    _config() {
      this._addPropStyle('span');
      const { item, span } = this.props;
      const { itemDefaults } = this.list.props;

      if (!span && item.span) {
        this.setProps({
          span: item.span
        });
      }

      this.setProps({
        selectable: false,
        children: item,
        childDefaults: n(null, itemDefaults, null, [ListItemMixin]),
      });
    }
  }

  Component.register(ListItemWrapper);

  class ListContent extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'ul',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.list = this.parent;
      this.list.content = this;
    }

    _config() {
      this._addPropStyle('gutter', 'line', 'align', 'justify', 'cols');
      const { items, wrappers, wrapperDefaults } = this.list.props;
      const children = [];

      if (Array.isArray(wrappers) && wrappers.length > 0) {
        for (let i = 0; i < wrappers.length; i++) {
          let wrapper = wrappers[i];
          wrapper = Component.extendProps(
            {},
            { component: ListItemWrapper },
            wrapperDefaults,
            wrapper,
          );
          children.push(wrapper);
        }
      } else if (Array.isArray(items) && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          children.push({ component: ListItemWrapper, item: items[i] });
        }
      }

      this.setProps({
        children: children,
        childDefaults: wrapperDefaults,
      });
    }

    getItem(param) {
      let retItem = null;

      if (param instanceof Component) {
        return param
      }

      if (isFunction$1(param)) {
        for (const key in this.itemRefs) {
          if (this.itemRefs.hasOwnProperty(key)) {
            if (param.call(this.itemRefs[key]) === true) {
              retItem = this.itemRefs[key];
              break
            }
          }
        }
      } else {
        return this.itemRefs[param]
      }

      return retItem
    }

    selectItem(param, selectOption) {
      const item = this.getItem(param);
      item && item.select(selectOption);
    }

    selectItems(param, selectOption) {
      selectOption = extend(
        {
          triggerSelect: true,
          triggerSelectionChange: true,
        },
        selectOption,
      );
      let itemSelectionChanged = false;
      param = Array.isArray(param) ? param : [param];
      for (let i = 0; i < param.length; i++) {
        itemSelectionChanged =
          this.selectItem(param[i], {
            triggerSelect: selectOption.triggerSelect,
            triggerSelectionChange: false,
          }) || itemSelectionChanged;
      }
      if (selectOption.triggerSelectionChange === true && itemSelectionChanged) {
        this._onItemSelectionChange();
      }
      return itemSelectionChanged
    }

    selectAllItems(selectOption) {
      return this.selectItems(this.getChildren(), selectOption)
    }

    unselectItem(param, unselectOption) {
      unselectOption = extend(
        {
          triggerUnselect: true,
          triggerSelectionChange: true,
        },
        unselectOption,
      );
      const item = this.getItem(param);
      item && item.unselect(unselectOption);
    }

    unselectItems(param, unselectOption) {
      unselectOption = extend(
        {
          triggerUnselect: true,
          triggerSelectionChange: true,
        },
        unselectOption,
      );
      let itemSelectionChanged = false;
      if (Array.isArray(param)) {
        for (let i = 0; i < param.length; i++) {
          itemSelectionChanged =
            this.unselectItem(param[i], {
              triggerUnselect: unselectOption.triggerUnselect,
              triggerSelectionChange: false,
            }) || itemSelectionChanged;
        }
      }
      if (unselectOption.triggerSelectionChange && itemSelectionChanged) {
        this._onItemSelectionChange();
      }
      return itemSelectionChanged
    }

    unselectAllItems(unselectOption) {
      return this.unselectItems(this.getAllItems(), unselectOption)
    }

    getAllItems() {
      const items = [];
      const children = this.getChildren();
      for (let i = 0; i < children.length; i++) {
        const itemWrapper = children[i];
        items.push(itemWrapper.item);
      }
      return items
    }

    _onItemSelectionChange() {
      this._callHandler(this.props.onItemSelectionChange);
    }

    getSelectedItem() {
      return this.selectedItem
    }

    getSelectedItems() {
      const selectedItems = [];
      const children = this.getChildren();
      for (let i = 0; i < children.length; i++) {
        const { item } = children[i];
        if (item.props.selected) {
          selectedItems.push(item);
        }
      }
      return selectedItems
    }

    appendItem(itemProps) {
      itemProps = Component.extendProps({}, this.props.itemDefaults, itemProps);
      const itemWrapperProps = { component: ListItemWrapper, item: itemProps };
      this.appendChild(itemWrapperProps);
    }

    removeItem(param) {
      const item = this.getItem(param);
      if (item !== null) {
        item.wrapper.remove();
      }
    }

    removeItems(param) {
      if (Array.isArray(param)) {
        for (let i = 0; i < param.length; i++) {
          this.removeItem(param[i]);
        }
      }
    }
  }

  Component.register(ListContent);

  /* eslint-disable */
  function t(t) {
    return 'object' == typeof t && null != t && 1 === t.nodeType
  }
  function e(t, e) {
    return (!e || 'hidden' !== t) && 'visible' !== t && 'clip' !== t
  }
  function n$1(t, n) {
    if (t.clientHeight < t.scrollHeight || t.clientWidth < t.scrollWidth) {
      var r = getComputedStyle(t, null);
      return (
        e(r.overflowY, n) ||
        e(r.overflowX, n) ||
        (function (t) {
          var e = (function (t) {
            if (!t.ownerDocument || !t.ownerDocument.defaultView) return null
            try {
              return t.ownerDocument.defaultView.frameElement
            } catch (t) {
              return null
            }
          })(t);
          return !!e && (e.clientHeight < t.scrollHeight || e.clientWidth < t.scrollWidth)
        })(t)
      )
    }
    return !1
  }
  function r(t, e, n, r, i, o, l, d) {
    return (o < t && l > e) || (o > t && l < e)
      ? 0
      : (o <= t && d <= n) || (l >= e && d >= n)
        ? o - t - r
        : (l > e && d < n) || (o < t && d > n)
          ? l - e + i
          : 0
  }
  function compute(e, i) {
    var o = window,
      l = i.scrollMode,
      d = i.block,
      u = i.inline,
      h = i.boundary,
      a = i.skipOverflowHiddenElements,
      c =
        'function' == typeof h
          ? h
          : function (t) {
            return t !== h
          };
    if (!t(e)) throw new TypeError('Invalid target')
    for (
      var f = document.scrollingElement || document.documentElement, s = [], p = e;
      t(p) && c(p);

    ) {
      if ((p = p.parentElement) === f) {
        s.push(p);
        break
      }
   (null != p && p === document.body && n$1(p) && !n$1(document.documentElement)) ||
        (null != p && n$1(p, a) && s.push(p));
    }
    for (
      var m = o.visualViewport ? o.visualViewport.width : innerWidth,
      g = o.visualViewport ? o.visualViewport.height : innerHeight,
      w = window.scrollX || pageXOffset,
      v = window.scrollY || pageYOffset,
      W = e.getBoundingClientRect(),
      b = W.height,
      H = W.width,
      y = W.top,
      E = W.right,
      M = W.bottom,
      V = W.left,
      x = 'start' === d || 'nearest' === d ? y : 'end' === d ? M : y + b / 2,
      I = 'center' === u ? V + H / 2 : 'end' === u ? E : V,
      C = [],
      T = 0;
      T < s.length;
      T++
    ) {
      var k = s[T],
        B = k.getBoundingClientRect(),
        D = B.height,
        O = B.width,
        R = B.top,
        X = B.right,
        Y = B.bottom,
        L = B.left;
      if (
        'if-needed' === l &&
        y >= 0 &&
        V >= 0 &&
        M <= g &&
        E <= m &&
        y >= R &&
        M <= Y &&
        V >= L &&
        E <= X
      )
        return C
      var S = getComputedStyle(k),
        j = parseInt(S.borderLeftWidth, 10),
        q = parseInt(S.borderTopWidth, 10),
        z = parseInt(S.borderRightWidth, 10),
        A = parseInt(S.borderBottomWidth, 10),
        F = 0,
        G = 0,
        J = 'offsetWidth' in k ? k.offsetWidth - k.clientWidth - j - z : 0,
        K = 'offsetHeight' in k ? k.offsetHeight - k.clientHeight - q - A : 0;
      if (f === k)
        (F =
          'start' === d
            ? x
            : 'end' === d
              ? x - g
              : 'nearest' === d
                ? r(v, v + g, g, q, A, v + x, v + x + b, b)
                : x - g / 2),
          (G =
            'start' === u
              ? I
              : 'center' === u
                ? I - m / 2
                : 'end' === u
                  ? I - m
                  : r(w, w + m, m, j, z, w + I, w + I + H, H)),
          (F = Math.max(0, F + v)),
          (G = Math.max(0, G + w));
      else {
   (F =
          'start' === d
            ? x - R - q
            : 'end' === d
              ? x - Y + A + K
              : 'nearest' === d
                ? r(R, Y, D, q, A + K, x, x + b, b)
                : x - (R + D / 2) + K / 2),
          (G =
            'start' === u
              ? I - L - j
              : 'center' === u
                ? I - (L + O / 2) + J / 2
                : 'end' === u
                  ? I - X + z + J
                  : r(L, X, O, j, z + J, I, I + H, H));
        var N = k.scrollLeft,
          P = k.scrollTop
          ; (x += P - (F = Math.max(0, Math.min(P + F, k.scrollHeight - D + K)))),
            (I += N - (G = Math.max(0, Math.min(N + G, k.scrollWidth - O + J))));
      }
      C.push({ el: k, top: F, left: G });
    }
    return C
  }

  function isOptionsObject(options) {
    return options === Object(options) && Object.keys(options).length !== 0
  }

  function defaultBehavior(actions, behavior) {
    if (behavior === void 0) {
      behavior = 'auto';
    }

    var canSmoothScroll = 'scrollBehavior' in document.body.style;
    actions.forEach(function (_ref) {
      var el = _ref.el,
        top = _ref.top,
        left = _ref.left;

      if (el.scroll && canSmoothScroll) {
        el.scroll({
          top: top,
          left: left,
          behavior: behavior,
        });
      } else {
        el.scrollTop = top;
        el.scrollLeft = left;
      }
    });
  }

  function getOptions(options) {
    if (options === false) {
      return {
        block: 'end',
        inline: 'nearest',
      }
    }

    if (isOptionsObject(options)) {
      return options
    }

    return {
      block: 'start',
      inline: 'nearest',
    }
  }

  function scrollIntoView(target, options) {
    var targetIsDetached = !target.ownerDocument.documentElement.contains(target);

    if (isOptionsObject(options) && typeof options.behavior === 'function') {
      return options.behavior(targetIsDetached ? [] : compute(target, options))
    }

    if (targetIsDetached) {
      return
    }

    var computeOptions = getOptions(options);
    return defaultBehavior(compute(target, computeOptions), computeOptions.behavior)
  }

  class List extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'div',
        items: [],
        itemDefaults: {},

        selectedItems: null,

        itemSelectable: {
          multiple: false,
          byClick: false,
          scrollIntoView: true,
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.itemRefs = {};
      this.selectedItem = null;
    }

    _config() {
      this._addPropStyle('gutter', 'line', 'align', 'justify', 'cols');

      this.setProps({
        children: { component: ListContent },
      });
    }

    getItem(param) {
      let retItem = null;

      if (param instanceof Component) {
        return param
      }

      if (isFunction$1(param)) {
        for (const key in this.itemRefs) {
          if (this.itemRefs.hasOwnProperty(key)) {
            if (param.call(this.itemRefs[key]) === true) {
              retItem = this.itemRefs[key];
              break
            }
          }
        }
      } else {
        return this.itemRefs[param]
      }

      return retItem
    }

    selectItem(param, selectOption) {
      const item = this.getItem(param);
      item && item.select(selectOption);
      if (this.props.itemSelectable.scrollIntoView) {
        this.scrollTo(item);
      }
    }

    selectItems(param, selectOption) {
      selectOption = extend(
        {
          triggerSelect: true,
          triggerSelectionChange: true,
        },
        selectOption,
      );
      let itemSelectionChanged = false;
      param = Array.isArray(param) ? param : [param];
      for (let i = 0; i < param.length; i++) {
        itemSelectionChanged =
          this.selectItem(param[i], {
            triggerSelect: selectOption.triggerSelect,
            triggerSelectionChange: false,
          }) || itemSelectionChanged;
      }
      if (selectOption.triggerSelectionChange === true && itemSelectionChanged) {
        this._onItemSelectionChange();
      }
      return itemSelectionChanged
    }

    selectAllItems(selectOption) {
      return this.selectItems(this.content.getChildren(), selectOption)
    }

    unselectItem(param, unselectOption) {
      unselectOption = extend(
        {
          triggerUnselect: true,
          triggerSelectionChange: true,
        },
        unselectOption,
      );
      const item = this.getItem(param);
      item && item.unselect(unselectOption);
    }

    unselectItems(param, unselectOption) {
      unselectOption = extend(
        {
          triggerUnselect: true,
          triggerSelectionChange: true,
        },
        unselectOption,
      );
      let itemSelectionChanged = false;
      if (Array.isArray(param)) {
        for (let i = 0; i < param.length; i++) {
          itemSelectionChanged =
            this.unselectItem(param[i], {
              triggerUnselect: unselectOption.triggerUnselect,
              triggerSelectionChange: false,
            }) || itemSelectionChanged;
        }
      }
      if (unselectOption.triggerSelectionChange && itemSelectionChanged) {
        this._onItemSelectionChange();
      }
      return itemSelectionChanged
    }

    unselectAllItems(unselectOption) {
      return this.unselectItems(this.getAllItems(), unselectOption)
    }

    getAllItems() {
      const items = [];
      const children = this.content.getChildren();
      for (let i = 0; i < children.length; i++) {
        const itemWrapper = children[i];
        items.push(itemWrapper.item);
      }
      return items
    }

    _onItemSelectionChange() {
      this._callHandler(this.props.onItemSelectionChange);
    }

    getSelectedItem() {
      return this.selectedItem
    }

    getSelectedItems() {
      const selectedItems = [];
      const children = this.content.getChildren();
      for (let i = 0; i < children.length; i++) {
        const { item } = children[i];
        if (item.props.selected) {
          selectedItems.push(item);
        }
      }
      return selectedItems
    }

    appendItem(itemProps) {
      this.content.appendItem(itemProps);
    }

    removeItem(param) {
      const item = this.getItem(param);
      if (item !== null) {
        item.wrapper.remove();
      }
    }

    removeItems(param) {
      if (Array.isArray(param)) {
        for (let i = 0; i < param.length; i++) {
          this.removeItem(param[i]);
        }
      }
    }

    scrollTo(param) {
      const item = this.getItem(param);
      if (item) {
        scrollIntoView(item.wrapper.element, {
          behavior: 'smooth',
          scrollMode: 'if-needed',
        });
      }
    }

    scrollToSelected() {
      if (this.selectedItem) {
        this.scrollTo(this.selectedItem);
      }
    }
  }

  Component.register(List);

  var AutoCompleteListItemMixin = {
    _config: function () {
      const { onSelect, onUnselect } = this.props;

      this.setProps({
        selectable: {
          byClick: true,
          canRevert: this.list.autoCompleteControl.props.multiple === false,
        },
        onSelect: () => {
          const { autoCompleteControl } = this.list;
          // const selectProps = selectControl.props
          // const autoCompleteProps = autoCompleteControl.props

          const autoCompleteOption = {
            value: this.props.value,
            // text: this.props.text,
            option: this.props,
          };

          autoCompleteControl.input.update(autoCompleteOption);
          autoCompleteControl.popup.hide();
          // if (selectProps.multiple === false) {
          //   selectControl.selectedSingle.update(selectedOption)
          //   selectControl.popup.hide()
          // } else {
          //   selectControl.selectedMultiple.appendItem(selectedOption)
          // }

          this._callHandler(onSelect);
        },
        onUnselect: () => {
          // const { selectControl } = this.list
          // const selectProps = selectControl.props

          // if (selectProps.multiple === true) {
          //   selectControl.selectedMultiple.removeItem(this.key)
          // }

          this._callHandler(onUnselect);
        },
      });
    },
  };

  class AutoCompleteList extends List {
    constructor(props, ...mixins) {
      const defaults = {
        gutter: 'x-md',
        cols: 1,
        optionDefaults: {
          key() {
            return this.props.value
          },
          _config: function () {
            this.setProps({
              children: this.props.value,
            });
          },
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();

      this.autoCompleteControl = this.parent.parent.parent.autoCompleteControl;
      this.autoCompleteControl.optionList = this;
    }

    _config() {
      const { optionDefaults, value, options } = this.props;

      this.setProps({
        items: options || [],
        itemDefaults: n(null, optionDefaults, null, [AutoCompleteListItemMixin]),
        itemSelectable: {
          multiple: false,
          byClick: true,
        },
        selectedItems: value,

        onItemSelectionChange: () => {
          this.autoCompleteControl._onValueChange();
        },
      });

      super._config();
    }
  }

  class AutoCompletePopup extends Popup {
    constructor(props, ...mixins) {
      const defaults = {};

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
      this.autoCompleteControl = this.opener.field;
    }

    _config() {
      const { options } = this.props;

      if (options && options.length) {
        this.setProps({
          attrs: {
            style: {
              width: `${this.autoCompleteControl.control.offsetWidth()}px`,
            },
          },
          children: {
            component: Layout,
            body: {
              children: {
                component: AutoCompleteList,
                options: this.props.options,
              },
            },
          },
        });
      } else {
        this.setProps({
          attrs: {
            style: {
              width: `${this.autoCompleteControl.control.offsetWidth()}px`,
            },
          },
          children: {
            component: Layout,
            styles: {
              padding: 2,
            },
            body: {
              children: {
                component: Empty,
              },
            },
          },
        });
      }

      super._config();
    }
  }

  class AutoComplete extends Textbox {
    constructor(props, ...mixins) {
      const defaults = {
        options: [],
        debounce: true,
        interval: 300,
        filterOption: (value, options) => options.filter((o) => o.value.includes(value)),
        allowClear: true,
        // rightIcon: {
        //   compoent: 'Icon',
        //   type: 'close',
        //   hidden: true,
        //   onClick({ event }) {
        //     event.stopPropagation()
        //   },
        // },
      };

      super(Component.extendProps(defaults, props), ...mixins);
      this._init.bind(this);
      this._handleSearch.bind(this);
      this._doSearch.bind(this);
    }

    _created() {
      super._created();
      this.placeholder = this.props.placeholder;
      this.capsLock = false;
      this.searchMode = false;
      this.clearContent = true;
    }

    _rendered() {
      this.input && this._init();
      this.popup && this.popup.remove();

      this.popup = new AutoCompletePopup({
        trigger: this.control,
        options: this.props.options,
      });
    }

    _remove() {
      this.timer && clearTimeout(this.timer);
    }

    _init() {
      const autoComplete = this;

      this.input.element.addEventListener('focus', function () {
        autoComplete.currentValue = this.value;
        if (autoComplete.clearContent) {
          this.placeholder = this.value;
          this.value = '';
        } else {
          autoComplete.clearContent = true;
        }
        autoComplete.popup && autoComplete.popup.update({ options: autoComplete.props.options });
      });
      this.input.element.addEventListener('input', function () {
        if (!autoComplete.capsLock) {
          autoComplete._handleSearch(this.value);
        }
      });
      this.input.element.addEventListener('blur', function () {
        // ????????????????????????,??????????????????blur????????????change???????????????
        if (!autoComplete.searchMode) {
          // ??????
          this.value = autoComplete.currentValue;
        }
        this.placeholder = autoComplete.placeholder || '';
        autoComplete.searchMode = false;
      });
      this.input.element.addEventListener('compositionstart', function () {
        autoComplete.capsLock = true;
      });
      this.input.element.addEventListener('compositionend', function () {
        autoComplete.capsLock = false;
        autoComplete._handleSearch(this.value);
      });
    }

    _getValue() {
      return super._getValue()
    }

    _setValue(value, options) {
      super._setValue(value, options);
    }

    focus() {
      this.clearContent = false;
      super.focus();
    }

    _isFocus() {
      if (!this.input) return false
      return document.activeElement === this.input.element
    }

    _handleSearch(txt) {
      const autoComplete = this;
      const { debounce, interval } = this.props;
      // ??????
      this.timer && clearTimeout(this.timer);
      if (debounce) {
        this.timer = setTimeout(function () {
          autoComplete._doSearch(txt);
        }, interval);
      } else {
        autoComplete._doSearch(txt);
      }
    }

    _doSearch(txt) {
      this.searchMode = true;
      const { onSearch, filterOption, options } = this.props;

      isFunction$1(filterOption) && this.popup.update({ options: filterOption(txt, options) });
      isFunction$1(onSearch) && onSearch(txt);
    }
  }

  Component.register(AutoComplete);

  class Avatar extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'span',
        size: 'default',
        alt: '??????',
        gap: 4, // ????????????????????????????????????????????????
        text: null, // ??????
        icon: null, // ??????
        src: null, // ????????????
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { text, icon, src, alt } = this.props;
      this._propStyleClasses = ['size'];
      if (src) {
        this.setProps({
          classes: {
            'avatar-image': true,
          },
          children: [
            {
              tag: 'img',
              attrs: {
                src,
                alt,
              },
            },
          ],
        });
      } else if (icon) {
        this.setProps({
          children: [Component.normalizeIconProps(icon)],
        });
      } else {
        this.setProps({
          children: [text && { tag: 'span', classes: { 'nom-avatar-string': true }, children: text }],
        });
      }
    }

    _setScale() {
      const { gap, src, icon } = this.props;
      if (src || icon) {
        return
      }

      const childrenWidth = this.element.lastChild.offsetWidth;
      const nodeWidth = this.element.offsetWidth;
      if (childrenWidth !== 0 && nodeWidth !== 0) {
        if (gap * 2 < nodeWidth) {
          const scale =
            nodeWidth - gap * 2 < childrenWidth ? (nodeWidth - gap * 2) / childrenWidth : 1;
          const transformString = `scale(${scale}) translateX(-50%)`;
          const child = this.children[this.children.length - 1];
          child.update({
            attrs: {
              style: {
                '-ms-transform': transformString,
                '-webkit-transform': transformString,
                transform: transformString,
              },
            },
          });
        }
      }
    }

    _rendered() {
      this._setScale();
    }
  }

  Component.register(Avatar);

  class AvatarGroup extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'div',
        size: 'default', // ???????????? mode ????????????????????????????????????????????? left | alternate | right
        maxCount: null, // ???????????????????????????
        maxPopoverPlacement: 'top', // ??????????????????????????????
        items: [], // ??????????????????
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { size, items, maxCount, maxPopoverPlacement, itemDefaults } = this.props;

      // ???size???
      const avatars = items.map((item) => {
        return {
          component: Avatar,
          size,
          ...itemDefaults,
          ...item,
        }
      });
      const numOfChildren = avatars.length;
      if (maxCount && maxCount < numOfChildren) {
        const childrenShow = avatars.slice(0, maxCount);
        const childrenHidden = avatars.slice(maxCount, numOfChildren);
        childrenShow.push({
          component: Avatar,
          text: `+${numOfChildren - maxCount}`,
          size,
          ...itemDefaults,
          popup: {
            triggerAction: 'hover',
            align: maxPopoverPlacement,
            children: childrenHidden,
            attrs: {
              style: {
                padding: '8px 12px',
              },
            },
          },
        });
        this.setProps({
          children: childrenShow,
        });
      } else {
        this.setProps({
          children: avatars,
        });
      }
    }
  }

  Component.register(AvatarGroup);

  /* eslint-disable no-return-assign */
  /* eslint-disable no-restricted-properties */
  /*
   * Tween.js
   * t: current time??????????????????
   * b: beginning value???????????????
   * c: change in value???????????????
   * d: duration??????????????????
   */
  const Tween = {
    Linear: function (t, b, c, d) {
      return (c * t) / d + b
    },
    Quad: {
      easeIn: function (t, b, c, d) {
        return c * (t /= d) * t + b
      },
      easeOut: function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b
      },
      easeInOut: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return (c / 2) * t * t + b
        return (-c / 2) * (--t * (t - 2) - 1) + b
      },
    },
    Cubic: {
      easeIn: function (t, b, c, d) {
        return c * (t /= d) * t * t + b
      },
      easeOut: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b
      },
      easeInOut: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b
        return (c / 2) * ((t -= 2) * t * t + 2) + b
      },
    },
    Quart: {
      easeIn: function (t, b, c, d) {
        return c * (t /= d) * t * t * t + b
      },
      easeOut: function (t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b
      },
      easeInOut: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t + b
        return (-c / 2) * ((t -= 2) * t * t * t - 2) + b
      },
    },
    Quint: {
      easeIn: function (t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b
      },
      easeOut: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b
      },
      easeInOut: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t * t + b
        return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b
      },
    },
    Sine: {
      easeIn: function (t, b, c, d) {
        return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b
      },
      easeOut: function (t, b, c, d) {
        return c * Math.sin((t / d) * (Math.PI / 2)) + b
      },
      easeInOut: function (t, b, c, d) {
        return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b
      },
    },
    Expo: {
      easeIn: function (t, b, c, d) {
        return t === 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b
      },
      easeOut: function (t, b, c, d) {
        return t === d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) + b
      },
      easeInOut: function (t, b, c, d) {
        if (t === 0) return b
        if (t === d) return b + c
        if ((t /= d / 2) < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b
        return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b
      },
    },
    Circ: {
      easeIn: function (t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b
      },
      easeOut: function (t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b
      },
      easeInOut: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return (-c / 2) * (Math.sqrt(1 - t * t) - 1) + b
        return (c / 2) * (Math.sqrt(1 - (t -= 2) * t) + 1) + b
      },
    },
    Elastic: {
      easeIn: function (t, b, c, d, a, p) {
        let s;
        if (t === 0) return b
        if ((t /= d) === 1) return b + c
        if (typeof p === 'undefined') p = d * 0.3;
        if (!a || a < Math.abs(c)) {
          s = p / 4;
          a = c;
        } else {
          s = (p / (2 * Math.PI)) * Math.asin(c / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b
      },
      easeOut: function (t, b, c, d, a, p) {
        let s;
        if (t === 0) return b
        if ((t /= d) === 1) return b + c
        if (typeof p === 'undefined') p = d * 0.3;
        if (!a || a < Math.abs(c)) {
          a = c;
          s = p / 4;
        } else {
          s = (p / (2 * Math.PI)) * Math.asin(c / a);
        }
        return a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) + c + b
      },
      easeInOut: function (t, b, c, d, a, p) {
        let s;
        if (t === 0) return b
        if ((t /= d / 2) === 2) return b + c
        if (typeof p === 'undefined') p = d * (0.3 * 1.5);
        if (!a || a < Math.abs(c)) {
          a = c;
          s = p / 4;
        } else {
          s = (p / (2 * Math.PI)) * Math.asin(c / a);
        }
        if (t < 1)
          return (
            -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b
          )
        return (
          a * Math.pow(2, -10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) * 0.5 + c + b
        )
      },
    },
    Back: {
      easeIn: function (t, b, c, d, s) {
        if (typeof s === 'undefined') s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b
      },
      easeOut: function (t, b, c, d, s) {
        if (typeof s === 'undefined') s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
      },
      easeInOut: function (t, b, c, d, s) {
        if (typeof s === 'undefined') s = 1.70158;
        if ((t /= d / 2) < 1) return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b
        return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b
      },
    },
    Bounce: {
      easeIn: function (t, b, c, d) {
        return c - Tween.Bounce.easeOut(d - t, 0, c, d) + b
      },
      easeOut: function (t, b, c, d) {
        if ((t /= d) < 1 / 2.75) {
          return c * (7.5625 * t * t) + b
        }
        if (t < 2 / 2.75) {
          return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b
        }
        if (t < 2.5 / 2.75) {
          return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b
        }
        return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b
      },
      easeInOut: function (t, b, c, d) {
        if (t < d / 2) {
          return Tween.Bounce.easeIn(t * 2, 0, c, d) * 0.5 + b
        }
        return Tween.Bounce.easeOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b
      },
    },
  };

  class BackTop extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        duration: 100,
        animations: 'Linear',
        target: 'window',
        height: 400,
        right: 30,
        bottom: 30,
        text: '',
        parent: '',
        onClick: () => {},
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      const { parent, target } = this.props;
      if (target === 'window') {
        this.parentNode = document.documentElement || document.body;
      } else if (this.hasClass(parent.element, target)) {
        this.parentNode = parent.element;
      } else {
        this.parentNode = parent.element.getElementsByClassName(target)[0];
      }

      this.once = true;
      this.initRequestAnimationFrame();
    }

    _config() {
      const { right, bottom } = this.props;
      this.setProps({
        children: {
          ref: (c) => {
            this.backTopRef = c;
          },
          classes: {
            'nom-back-top-container': true,
          },
          attrs: {
            style: {
              right: `${right}px`,
              bottom: `${bottom}px`,
            },
          },
          children: this.backTopButton(),
          onClick: () => {
            this.backTopEvent();
          },
        },
      });
    }

    _rendered() {
      const { height, target } = this.props;
      let ele;
      if (target === 'window') {
        ele = window;
      } else {
        ele = this.parentNode;
      }
      ele.addEventListener('scroll', () => {
        if (this.once === true) {
          this.once = false;
          this.iconRef.update();
          if (ele === window) {
            this.parentNode.appendChild(this.backTopRef.element);
            this.backTopRef.element.style.position = 'fixed';
          } else {
            this.parentNode.parentElement.style.position = 'relative';
            this.parentNode.parentElement.appendChild(this.backTopRef.element);
          }
        }
        if (this.parentNode.scrollTop >= height) {
          this.backTopRef.show();
        } else {
          this.backTopRef.hide();
        }
      });
    }

    hasClass(ele, className) {
      const reg = new RegExp(`(^|\\s)${className}(\\s|$)`);
      return reg.test(ele.className)
    }

    backTopButton() {
      const { text } = this.props;
      let obj;
      if (text.length > 0) {
        obj = {
          ref: (c) => {
            this.iconRef = c;
          },
          classes: {
            'nom-back-top-text': true,
          },
          autoRender: false,
          children: text,
        };
      } else {
        obj = {
          ref: (c) => {
            this.iconRef = c;
          },
          classes: {
            'nom-back-top-icons': true,
          },
          autoRender: false,
          component: 'Icon',
          type: 'up',
        };
      }
      return obj
    }

    initRequestAnimationFrame() {
      let lastTime = 0;
      const vendors = ['webkit', 'moz'];
      for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[`${vendors[x]}RequestAnimationFrame`];
        window.cancelAnimationFrame =
          window[`${vendors[x]}CancelAnimationFrame`] ||
          window[`${vendors[x]}CancelRequestAnimationFrame`];
      }

      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
          const currTime = new Date().getTime();
          const timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
          const id = window.setTimeout(function () {
            callback(currTime + timeToCall);
          }, timeToCall);
          lastTime = currTime + timeToCall;
          return id
        };
      }
      if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
          clearTimeout(id);
        };
      }
    }

    backTopEvent() {
      const { animations, duration } = this.props;
      const element = this.parentNode;

      let start = 0;
      const begin = element.scrollTop;
      const end = -element.scrollTop;
      const during = Math.round((duration * 10) / 167);
      const paramArry = animations.split('.');

      const scrollAnimation = function () {
        if (element.scrollTop === 0) return false
        let top;

        // ?????????????????????
        if (paramArry[1]) {
          top = Tween[paramArry[0]][paramArry[1]](start, begin, end, during);
        } else {
          top = Tween[paramArry[0]](start, begin, end, during);
        }

        element.scrollTop = top;
        // ????????????
        start++;
        // ????????????????????????????????????
        if (start <= during && element.scrollTop !== 0) {
          requestAnimationFrame(scrollAnimation);
        }
      };

      if (element) scrollAnimation();
    }
  }

  Component.mixin({
    _rendered: function () {
      if (this.props.backtop) {
        this.backtop = new BackTop(
          Component.extendProps({}, this.props.backtop, {
            parent: this,
          }),
        );
      }
    },
  });

  Component.register(BackTop);

  class Badge extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        key: null,
        tag: 'span',
        type: 'round',
        text: null,
        icon: null,
        number: null,
        overflowCount: 99,
        size: 'xs',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this._propStyleClasses = ['size', 'color'];
      const { icon, text, type, number, overflowCount } = this.props;

      if (icon) {
        this.setProps({
          classes: {
            'p-with-icon': true,
          },
        });
      }

      if (type === 'round') {
        this.setProps({
          classes: {
            'u-shape-round': true,
          },
        });
      } else if (type === 'dot') {
        if (number > 0) {
          this.setProps({
            classes: {
              'p-with-number': true,
            },
          });
        }
      }

      this.setProps({
        children: [
          Component.normalizeIconProps(icon),
          text && { tag: 'span', children: text },
          number && { tag: 'span', children: number > overflowCount ? `${overflowCount}+` : number },
        ],
      });
    }

    _disable() {
      this.element.setAttribute('disabled', 'disabled');
    }
  }

  Component.mixin({
    _config: function () {
      if (this.props.badge) {
        this.setProps({
          classes: {
            's-with-badge': true,
          },
        });
      }
    },
    _rendered: function () {
      if (this.props.badge) {
        const badgeProps = {
          type: 'dot',
        };
        badgeProps.number = this.props.badge.number ? this.props.badge.number : null;
        badgeProps.overflowCount = this.props.badge.overflowCount
          ? this.props.badge.overflowCount
          : 99;
        badgeProps.styles = this.props.badge.styles ? this.props.badge.styles : { color: 'danger' };
        this.props.badge = badgeProps;
        this.badge = new Badge(Component.extendProps({ reference: this }, this.props.badge));
      }
    },
  });

  Component.register(Badge);

  class Carousel extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        imgs: [],
        height: 100,
        arrows: false,
        autoplay: false,
        autoplaySpeed: 1000,
        speed: 300,
        dots: true,
        defaultActiveIndex: 1,
        easing: 'linear',
        pauseOnHover: true,
        triggerType: 'click',
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      const { imgs, defaultActiveIndex } = this.props;
      const cloneImgs = [...imgs];
      cloneImgs.push(imgs[0]);
      this.loopImgs = cloneImgs;
      this.positions = [
        // {
        //   left:0,
        //   width:100
        // }
      ];
      this.activeId = defaultActiveIndex;
      this.activeIdOld = defaultActiveIndex;
      this.sildeRefs = [];
      this.dotsRef = [];
      this.slideWidth = null;
      this.autoplayInterval = null;
    }

    _config() {
      this.setProps({
        children: {
          ref: (c) => {
            this.containerRef = c;
          },
          classes: {
            'nom-carousel-container': true,
          },
          children: [
            {
              ref: (c) => {
                this.wrapperRef = c;
              },
              classes: {
                'nom-carousel-wrapper': true,
              },
              children: this.slideList(),
            },
            {
              ref: (c) => {
                this.paginationRef = c;
              },
              classes: {
                'nom-carousel-pagination': true,
                'nom-carousel-pagination-show': this.props.dots,
              },
              children: this.paginationList(),
            },
            {
              classes: {
                'nom-carousel-buttons': true,
                'nom-carousel-buttons-show': this.props.arrows,
              },
              children: [
                {
                  classes: {
                    'nom-carousel-button-prev': true,
                  },
                  onClick: () => {
                    this.prevClick();
                  },
                  component: 'Icon',
                  type: 'left',
                },
                {
                  classes: {
                    'nom-carousel-button-next': true,
                  },
                  onClick: () => {
                    this.nextClick();
                  },
                  component: 'Icon',
                  type: 'right',
                },
              ],
            },
          ],
        },
      });
    }

    _rendered() {
      const { autoplay, autoplaySpeed, pauseOnHover, defaultActiveIndex, triggerType } = this.props;

      this.initPositions();

      // ??????????????????
      if (autoplay) {
        this.autoplayInterval = setInterval(() => {
          this.nextClick();
        }, autoplaySpeed);
      }

      // ????????????????????????????????????
      if (pauseOnHover) {
        this.containerRef.element.addEventListener('mouseover', () => {
          clearInterval(this.autoplayInterval);
        });
        this.containerRef.element.addEventListener('mouseout', () => {
          if (autoplay) {
            this.autoplayInterval = setInterval(() => {
              this.nextClick();
            }, autoplaySpeed);
          }
        });
      }

      // ???????????????????????????
      setTimeout(() => {
        this.paginationClick(defaultActiveIndex);
      }, 500);

      // ????????????????????????
      if (triggerType === 'hover') {
        this.dotsRef.forEach((item) => {
          item.element.onmouseenter = (e) => {
            const target = e.target;
            if (target.nodeName === 'SPAN') {
              this.paginationClick(target.dataset.index);
            }
          };
        });
      } else {
        this.paginationRef.element.addEventListener('click', (e) => {
          const target = e.target;
          if (target.nodeName === 'SPAN') {
            this.paginationClick(target.dataset.index);
          }
        });
      }
    }

    _remove() {
      clearInterval(this.autoplayInterval);
    }

    slideList() {
      const _that = this;
      return this.loopImgs.map(function (item) {
        return {
          ref: (c) => {
            if (c) _that.sildeRefs.push(c);
          },
          classes: {
            'nom-carousel-slide': true,
          },
          attrs: {
            style: {
              height: `${_that.props.height}px`,
            },
          },
          children: {
            tag: 'img',
            attrs: {
              src: item,
            },
            children: '',
          },
        }
      })
    }

    paginationList() {
      const _that = this;
      return this.props.imgs.map(function (d, index) {
        return {
          ref: (c) => {
            if (c) _that.dotsRef.push(c);
          },
          classes: {
            'nom-carousel-pagination-bullet': true,
            'nom-carousel-pagination-bullet-active': index === _that.defaultActiveIndex - 1,
          },
          tag: 'span',
          attrs: {
            'data-index': index + 1,
          },
          children: index + 1,
        }
      })
    }

    paginationClick(index) {
      this.activeId = index;
      this.animate('pagination');
    }

    prevClick() {
      this.activeId -= 1;
      if (this.activeId <= 0) {
        this.activeId = this.loopImgs.length - 1;
      }
      this.animate();
    }

    nextClick() {
      this.activeId += 1;
      if (this.activeId > this.loopImgs.length) {
        this.activeId = 2;
      }
      this.animate();
    }

    animate(val) {
      this.updateSlideSize();
      if (
        this.activeId === this.loopImgs.length - 1 &&
        this.activeIdOld === 1 &&
        val !== 'pagination'
      ) {
        // ?????????
        this.wrapperRef.element.setAttribute(
          'style',
          `transform:translate3d(${-this.positions[this.loopImgs.length - 1]
          .left}px, 0, 0);transition: transform 0ms;`,
        );
        setTimeout(() => {
          this.wrapperRef.element.setAttribute(
            'style',
            `transform:translate3d(${-this.positions[this.loopImgs.length - 2]
            .left}px, 0, 0);transition: transform ${this.props.speed}ms ${this.props.easing};`,
          );
        }, 0);
      } else {
        this.wrapperRef.element.setAttribute(
          'style',
          `transform:translate3d(${-this.positions[this.activeId - 1]
          .left}px, 0, 0);transition: transform ${this.props.speed}ms ${this.props.easing};`,
        );
      }
      // ?????????
      this.dotsRef[this.activeIdOld - 1].element.classList.remove(
        'nom-carousel-pagination-bullet-active',
      );

      if (this.activeId === this.loopImgs.length) {
        // ?????????
        this.dotsRef[0].element.classList.add('nom-carousel-pagination-bullet-active');
        this.activeIdOld = 1;
        setTimeout(() => {
          this.wrapperRef.element.setAttribute(
            'style',
            `transform:translate3d(0, 0, 0);transition: transform 0ms;`,
          );
        }, 300);
      } else {
        this.dotsRef[this.activeId - 1].element.classList.add('nom-carousel-pagination-bullet-active');
        this.activeIdOld = this.activeId;
      }
    }

    // ???????????????
    initPositions() {
      this.positions = this.loopImgs.map(() => ({
        left: 0,
        width: 0,
      }));
    }

    // ??????
    updateSlideSize() {
      const nodes = this.sildeRefs;
      let firstLeft = 0;
      if (this.slideWidth === nodes[0].element.getBoundingClientRect().width) return
      nodes.forEach((node, index) => {
        if (!node.rendered) return
        const rect = node.element.getBoundingClientRect();
        this.positions[index].width = rect.width;
        if (index === 0) {
          this.positions[index].left = 0;
          firstLeft = rect.left;
          this.slideWidth = rect.width;
        } else {
          this.positions[index].left = rect.left - firstLeft;
        }
      });
    }
  }

  Component.register(Carousel);

  class CascaderList extends Component {
    constructor(props, ...mixins) {
      const defaults = {};

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.cascaderControl = this.parent.parent.parent.cascaderControl;
      this.cascaderControl.optionList = this;
    }

    _config() {
      const { popMenu } = this.props;
      const value = this.cascaderControl.selectedOption.map((e) => e.key);

      this.selected = [];

      this.setProps({
        children: popMenu
          ? popMenu.map((menu, index) => {
              return this.getMenuItems(menu, value[index])
            })
          : null,
      });

      super._config();
    }

    getMenuItems(menu, currentVal) {
      const cascaderList = this;
      if (!menu) {
        return null
      }

      return {
        tag: 'ul',
        classes: {
          'nom-cascader-menu': true,
        },
        children: menu.map((item) => {
          if (item.children) {
            return {
              tag: 'li',
              _rendered() {
                item.key === currentVal && cascaderList.selected.push(this);
              },
              classes: {
                'nom-cascader-menu-item': true,
                'nom-cascader-menu-item-active': item.key === currentVal,
              },
              onClick: () => {
                cascaderList.cascaderControl._itemSelected(item.key);
              },
              children: [
                {
                  tag: 'span',
                  children: item.label,
                },
                {
                  component: Icon,
                  type: 'right',
                  classes: {
                    'nom-cascader-menu-item-expand-icon': true,
                  },
                },
              ],
            }
          }

          return {
            tag: 'li',
            _rendered() {
              item.key === currentVal && cascaderList.selected.push(this);
            },
            classes: {
              'nom-cascader-menu-item': true,
              'nom-cascader-menu-item-active': item.key === currentVal,
            },
            onClick: () => {
              cascaderList.cascaderControl._itemSelected(item.key, true);
            },
            children: [
              {
                tag: 'span',
                children: item.label,
              },
            ],
          }
        }),
      }
    }
  }

  class CascaderPopup extends Popup {
    constructor(props, ...mixins) {
      const defaults = {};

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();

      this.cascaderControl = this.opener.field;
    }

    _config() {
      const { popMenu } = this.props;
      if (popMenu && popMenu.length) {
        this.setProps({
          children: {
            classes: {
              'nom-cascader-pop-container': true,
            },
            component: Layout,
            body: {
              children: {
                component: CascaderList,
                popMenu,
              },
            },
          },
        });
      } else {
        this.setProps({
          children: {
            styles: {
              padding: 2,
            },
            component: Layout,
            body: {
              children: {
                component: Empty,
              },
            },
          },
        });
      }

      super._config();
    }
  }

  Component.register(CascaderPopup);

  class Cascader extends Field {
    constructor(props, ...mixins) {
      const defaults = {
        options: [],
        showArrow: true,
        separator: ' / ',
        fieldsMapping: { label: 'label', value: 'value', children: 'children' },
        valueType: 'cascade',
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _rendered() {
      const cascader = this;
      this.popup = new CascaderPopup({
        trigger: this.control,
        popMenu: this.getSelectedMenu(),
        onShow: () => {
          const { optionList } = cascader;
          if (optionList && optionList.selected && optionList.selected.length > 0) {
            optionList.selected.forEach((item) => {
              item.element.scrollIntoView({
                behavior: 'auto',
                scrollMode: 'if-needed',
              });
            });
          }
        },
      });

      this._valueChange({ newValue: this.currentValue });
    }

    // _created() {
    //   super._created()
    //   const { value, options, fieldsMapping } = this.props
    //   this.internalOption = JSON.parse(JSON.stringify(options))
    //   this.handleOptions(this.internalOption, fieldsMapping)
    //   this.flatItems(this.internalOption)

    //   this.initValue = isFunction(value) ? value() : value
    //   this.selectedOption = []
    //   this.handleOptionSelected(this.initValue)
    //   this.currentValue = this.initValue
    //   this.checked = true
    // }

    _config() {
      const cascader = this;
      const children = [];
      const { showArrow, placeholder, separator, valueType } = this.props;

      const { value, options, fieldsMapping } = this.props;
      this.internalOption = JSON.parse(JSON.stringify(options));
      this.handleOptions(this.internalOption, fieldsMapping);
      this.flatItems(this.internalOption);

      this.initValue = isFunction$1(value) ? value() : value;
      this.selectedOption = [];
      this.handleOptionSelected(this.initValue);
      this.currentValue = this.initValue;
      this.checked = true;

      children.push({
        classes: { 'nom-cascader-content': true },
        _created() {
          cascader.content = this;
        },
        _config() {
          const selectedOpt = cascader.selectedOption;
          let c;

          if (selectedOpt.length === 0) {
            c = null;
          } else {
            c =
              valueType === 'cascade'
                ? selectedOpt.map((e) => e.label).join(separator)
                : selectedOpt[selectedOpt.length - 1].label;
          }

          this.setProps({
            children: c,
          });
        },
      });

      if (isString(placeholder)) {
        children.push({
          _created() {
            cascader.placeholder = this;
          },
          classes: { 'nom-cascader-placeholder': true },
          children: placeholder,
        });
      }

      if (showArrow) {
        children.push({
          component: Icon,
          type: 'down',
          classes: {
            'nom-cascader-icon': true,
          },
          _created() {
            cascader.down = this;
          },
        });
      }

      children.push({
        component: Icon,
        type: 'close',
        classes: {
          'nom-cascader-icon': true,
        },
        hidden: true,
        _created() {
          cascader.close = this;
        },
        onClick: ({ event }) => {
          event.stopPropagation();
          if (this.selectedOption.length === 0) return
          this.selectedOption = [];
          this.checked = true;
          this.popup.update({
            popMenu: this.getSelectedMenu(),
          });
          this._onValueChange();
        },
      });

      this.setProps({
        control: {
          children,
        },
        attrs: {
          onmouseover() {
            cascader.close.show();
            showArrow && cascader.down.hide();
          },
          onmouseleave() {
            showArrow && cascader.down.show();
            cascader.close.hide();
          },
        },
      });

      super._config();
    }

    _itemSelected(selectedKey, isLeaf = false) {
      if (!this.items) return
      this.selectedOption = [];
      let recur = this.items.get(selectedKey);
      while (recur) {
        this.selectedOption.unshift(recur);

        recur = this.items.get(recur.pid);
      }

      this.checked = isLeaf;

      const selectedItem = this.items.get(selectedKey);
      if (!selectedItem) return
      if (this.checked && this.triggerChange(selectedItem.value)) {
        this._onValueChange();
      }

      this.popup.update({ popMenu: this.getSelectedMenu() });
    }

    _valueChange(changed) {
      if (this.placeholder) {
        if ((Array.isArray(changed.newValue) && changed.newValue.length === 0) || !changed.newValue) {
          this.placeholder.show();
        } else {
          this.placeholder.hide();
        }
      }

      this.content && this.content.update();
      this.popup && this.popup.hide();
    }

    _getValue() {
      if (!this.checked) {
        return this.currentValue
      }

      if (this.props.valueType === 'cascade') {
        const result = this.selectedOption.map((e) => e.value);
        return result.length ? result : null
      }

      return this.selectedOption.length
        ? this.selectedOption[this.selectedOption.length - 1].value
        : null
    }

    _setValue(value) {
      if (this.triggerChange(value)) {
        this.handleOptionSelected(value);
        this._onValueChange();
      }
    }

    _onValueChange() {
      const that = this;
      this.oldValue = clone(this.currentValue);
      this.currentValue = clone(this.getValue());
      this.props.value = this.currentValue;

      const changed = {
        name: this.props.name,
        oldValue: this.oldValue,
        newValue: this.currentValue,
        checkedOption:
          this.props.valueType === 'cascade'
            ? this.selectedOption
            : this.selectedOption[this.selectedOption.length - 1],
      };

      setTimeout(function () {
        that._callHandler(that.props.onValueChange, changed);
        that.group && that.group._onValueChange(changed);
        isFunction$1(that._valueChange) && that._valueChange(changed);
        if (that.validateTriggered) {
          that._validate();
        }
      }, 0);
    }

    triggerChange(value) {
      if (!value || !this.currentValue || !Array.isArray(value)) return value !== this.currentValue
      return this.currentValue.toString() !== value.toString()
    }

    handleOptions(options, fieldsMapping) {
      const {
        key: keyField,
        label: labelField,
        value: valueField,
        children: childrenField,
      } = fieldsMapping;

      const key = keyField || valueField;

      if (!Array.isArray(options)) return []
      const internalOption = options;
      for (let i = 0; i < internalOption.length; i++) {
        const item = internalOption[i];
        item.label = item[labelField];
        item.value = item[valueField];
        item.key = item[key];
        item.children = item[childrenField];
        if (Array.isArray(item.children) && item.children.length > 0) {
          this.handleOptions(item.children, fieldsMapping);
        }
      }
    }

    flatItems(options, level = 0, pid = null) {
      if (!options || !Array.isArray(options)) {
        return null
      }

      if (level === 0) {
        this.items = new Map();
      }

      for (let i = 0; i < options.length; i++) {
        const { key, value, label, children } = options[i];
        this.items.set(key, { key, label, value, pid, level, leaf: !children });
        if (children) {
          this.flatItems(children, level + 1, key);
        }
      }
    }

    handleOptionSelected(value) {
      let key = null;
      const { valueType } = this.props;

      this.checked = false;
      const oldCheckedOption = this.selectedOption;
      this.selectedOption = [];

      if (!value) this.checked = true;

      if (!this.items || this.items.size === 0) return

      if (valueType === 'single') {
        for (const v of this.items.values()) {
          if (v.leaf && v.value === value) {
            key = v.key;
          }
        }

        if (!key) return

        while (key) {
          this.selectedOption.unshift(this.items.get(key));
          key = this.items.get(key).pid;
        }
      } else {
        if (!Array.isArray(value)) return
        let opt = null;
        let options = this.internalOption;
        for (let i = 0; i < value.length; i++) {
          opt = options ? options.find((e) => e.value === value[i]) : null;

          if (!opt) {
            this.selectedOption = oldCheckedOption;
            return
          }
          this.selectedOption.push(this.items.get(opt.key));
          options = opt.children;
        }
      }

      this.checked = true;
      if (this.popup) this.popup.update({ popMenu: this.getSelectedMenu() });
      if (this.content) this.content.update();
    }

    getSelectedMenu() {
      if (!this.selectedOption) {
        return null
      }

      const val = this.selectedOption.map((e) => e.value);
      const internalOption = this.internalOption;
      let recur = internalOption;

      const options = internalOption && internalOption.length ? [internalOption] : [];

      for (let i = 0; i < val.length; i++) {
        for (let j = 0; j < recur.length; j++) {
          if (val[i] === recur[j].value) {
            if (recur[j].children) {
              options.push([...recur[j].children]);
              recur = recur[j].children;
              break
            }
          }
        }
      }

      return options
    }
  }

  Component.register(Cascader);

  class Checkbox extends Field {
    constructor(props, ...mixins) {
      const defaults = {
        text: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const that = this;
      this.setProps({
        classes: {
          's-checked-part': !this.props.value && this.props.partChecked,
        },
        control: {
          tag: 'label',
          children: [
            {
              tag: 'input',
              attrs: {
                type: 'checkbox',
                checked: this.props.value,
                onchange() {
                  that.removeClass('s-checked-part');
                  that._onValueChange();
                },
              },
              _created() {
                that.input = this;
              },
            },
            { tag: 'span' },
            {
              tag: 'span',
              classes: { 'checkbox-text': true, 'checkbox-text-none': !this.props.text },
              children: this.props.text || '',
            },
          ],
        },
      });

      super._config();
    }

    partCheck(triggerChange) {
      this.setValue(false, triggerChange);
      this.addClass('s-checked-part');
    }

    _getValue() {
      return this.input.element.checked
    }

    _setValue(value, options) {
      if (options === false) {
        options = { triggerChange: false };
      } else {
        options = extend({}, options);
      }
      this.removeClass('s-checked-part');
      this.input.element.checked = value === true;
      options.triggerChange !== false && this._onValueChange();
    }

    _disable() {
      this.input.element.setAttribute('disabled', 'disabled');
    }

    _enable() {
      this.input.element.removeAttribute('disabled', 'disabled');
    }
  }

  Component.register(Checkbox);

  var OptionListMixin = {
    _created: function () {
      this.checkboxList = this.parent.parent;
      this.checkboxList.optionList = this;
    },
    _config: function () {
      const { itemSelectionChange } = this.props;
      const listProps = this.checkboxList.props;
      this.setProps({
        disabled: listProps.disabled,
        items: listProps.options,
        itemDefaults: listProps.optionDefaults,
        itemSelectable: {
          byClick: true,
          multiple: true,
          scrollIntoView: false,
        },
        selectedItems: listProps.value,
        onItemSelectionChange: () => {
          this.checkboxList._onValueChange();
          this._callHandler(itemSelectionChange);
        },
      });
    },
  };

  class OptionList extends List {
    constructor(props, ...mixins) {
      const defaults = {
        gutter: 'x-md',
        itemDefaults: {
          tag: 'label',
          _config: function () {
            this.setProps({
              children: [
                {
                  tag: 'span',
                  classes: {
                    checkbox: true,
                  },
                },
                {
                  tag: 'span',
                  classes: {
                    text: true,
                  },
                  children: this.props.text,
                },
              ],
            });
          },
        },
      };

      super(Component.extendProps(defaults, props), OptionListMixin, ...mixins);
    }
  }

  class CheckboxList extends Field {
    constructor(props, ...mixins) {
      const defaults = {
        options: [],
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this.setProps({
        optionDefaults: {
          key: function () {
            return this.props.value
          },
        },
      });

      this.setProps({
        optionList: {
          component: OptionList,
        },
      });

      this.setProps({
        control: this.props.optionList,
      });

      super._config();
    }

    getSelectedOptions() {
      return this.optionList.getSelectedItems()
    }

    _getValue() {
      const selected = this.getSelectedOptions();
      if (selected !== null && Array.isArray(selected) && selected.length > 0) {
        const vals = selected.map(function (item) {
          return item.props.value
        });

        return vals
      }

      return null
    }

    _getValueText(options, value) {
      const selected =
        value !== undefined ? this._getOptionsByValue(value) : this.getSelectedOptions();
      if (selected !== null && Array.isArray(selected) && selected.length > 0) {
        const vals = selected.map(function (item) {
          return item.props ? item.props.text : item.text
        });

        return vals
      }

      return null
    }

    _setValue(value, options) {
      if (options === false) {
        options = { triggerChange: false };
      } else {
        options = extend({ triggerChange: true }, options);
      }

      if (value === null) {
        this.optionList.unselectAllItems({ triggerSelectionChange: options.triggerChange });
      }
      this.optionList.selectItem(
        function () {
          return this.props.value === value
        },
        { triggerSelectionChange: options.triggerChange },
      );
    }

    _disable() {
      if (this.firstRender === false) {
        this.optionList.disable();
      }
    }

    _enable() {
      if (this.firstRender === false) {
        this.optionList.enable();
      }
    }

    _getOptionsByValue(value) {
      let retOptions = null;
      const { options } = this.props;
      if (Array.isArray(value)) {
        retOptions = [];
        for (let i = 0; i < options.length; i++) {
          if (value.indexOf(options[i].value) !== -1) {
            retOptions.push(options[i]);
          }
        }
      }
      return retOptions
    }
  }

  Component.register(CheckboxList);

  class TreeNodeContent extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        text: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.node = this.parent;
      this.node.content = this;
      this.level = this.node.level;
      this.tree = this.node.tree;
    }

    _config() {
      const { text, icon, tools } = this.node.props;
      const { initExpandLevel, nodeCheckable } = this.tree.props;
      const expanded = initExpandLevel === -1 || initExpandLevel > this.level;
      const tree = this.tree;
      this.setProps({
        expanded,
        expandable: {
          byIndicator: true,
          target: () => {
            return this.node.nodesRef
          },
          indicator: {
            component: Icon,
            classes: { 'nom-tree-node-expandable-indicator': true, 'is-leaf': this.node.isLeaf },
            expandable: {
              expandedProps: {
                type: 'down',
              },
              collapsedProps: {
                type: 'right',
              },
            },
          },
        },
        selectable: {
          byClick: this.tree.props.nodeSelectable.byClick,
        },
        selected: this.tree.props.nodeSelectable.selectedNodeKey === this.node.key,
        attrs: {
          style: {
            paddingLeft: `${this.level * 16}px`,
          },
        },
        onSelect: () => {
          if (tree.selectedNode !== null) tree.selectedNode.unselect();
          tree.selectedNode = this.node;
          tree._onNodeSelect({ node: this.node });
        },
      });

      if (this.tree.props.nodeSelectable.onlyleaf === true && this.node.isLeaf === false) {
        this.setProps({ selectable: false });
      }

      this.setProps({
        children: [
          this.getExpandableIndicatorProps(expanded),
          nodeCheckable && this._getCheckbox(),
          icon &&
            Component.extendProps(
              { classes: { 'nom-tree-node-content-icon': true } },
              Component.normalizeIconProps(icon),
            ),
          Component.extendProps(
            { tag: 'span', classes: { 'nom-tree-node-content-text': true } },
            Component.normalizeTemplateProps(text),
          ),
          tools &&
            Component.extendProps(
              { classes: { 'nom-tree-node-content-tools': true } },
              Component.normalizeIconProps(tools),
            ),
        ],
        onClick: () => {
          this.tree._onNodeClick({ node: this.node });
        },
      });
    }

    _getCheckbox() {
      const { disabled: treeDisabled } = this.tree.props;
      const { disabled: nodeDisabled } = this.node.props;

      return {
        component: Checkbox,
        plain: true,
        classes: {
          'nom-tree-node-checkbox': true,
        },
        disabled: treeDisabled || nodeDisabled,
        _created: (inst) => {
          this.node.checkboxRef = inst;
        },
        value: this.tree.checkedNodeKeysHash[this.node.key] === true,
        onValueChange: ({ newValue }) => {
          if (newValue === true) {
            this.node.check({ checkCheckbox: false });
          } else {
            this.node.uncheck({ uncheckCheckbox: false });
          }
        },
      }
    }
  }

  Component.register(TreeNodeContent);

  class TreeNode extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        nodes: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.level = 0;
      this.parentNode = this.parent.parentNode;
      if (this.parentNode !== null) {
        this.level = this.parentNode.level + 1;
        this.parentNode.subnodeRefs[this.key] = this;
      }
      this.tree = this.parent.tree;
      this.subnodeRefs = {};
      const { data } = this.props;
      const { dataFields } = this.tree.props;
      Object.keys(dataFields).forEach((dataField) => {
        data[dataField] = data[dataFields[dataField]];
      });
    }

    _config() {
      this.props.dataToNode({ data: this.props.data, node: this });
      if (this.props.key) {
        this.key = this.props.key;
      }
      this.tree.nodeRefs[this.key] = this;
      if (this.tree.props.nodeSelectable.selectedNodeKey === this.key) {
        this.tree.selectedNode = this;
      }
      const { nodes, childrenData } = this.props;
      const children = [
        {
          component: TreeNodeContent,
        },
      ];
      this.isLeaf = !(this._isNotEmptyArray(nodes) || this._isNotEmptyArray(childrenData));
      if (Array.isArray(nodes) || Array.isArray(childrenData)) {
        children.push({
          component: 'TreeNodes',
          nodes,
          childrenData,
        });
      }

      this.setProps({
        children,
      });

      if (this.tree.props.nodeCheckable) {
        this.setProps({
          checked: this.tree.checkedNodeKeysHash[this.key] === true,
        });
      }
    }

    _isNotEmptyArray(arr) {
      return Array.isArray(arr) && arr.length > 0
    }

    check({ checkCheckbox = true, triggerCheckChange = true } = {}) {
      const { checked } = this.props;
      const { onCheckChange } = this.tree.props.nodeCheckable;

      if (checked === true) {
        return
      }
      this.parentNode && this.parentNode.check({ checkCheckbox: true, triggerCheckChange: false });
      if (checkCheckbox === true) {
        this.checkboxRef.setValue(true, { triggerChange: false });
      }

      this.props.checked = true;
      if (triggerCheckChange === true) {
        this._callHandler(onCheckChange);
      }
    }

    uncheck({ uncheckCheckbox = true, triggerCheckChange = true } = {}) {
      const { checked } = this.props;
      const { onCheckChange } = this.tree.props.nodeCheckable;

      if (checked === false) {
        return
      }

      uncheckCheckbox && this.checkboxRef.setValue(false, { triggerChange: false });
      Object.keys(this.subnodeRefs).forEach((key) => {
        this.subnodeRefs[key].uncheck({ uncheckCheckbox: true, triggerCheckChange: false });
      });
      this.props.checked = false;
      if (triggerCheckChange === true) {
        this._callHandler(onCheckChange);
      }
    }

    isChecked() {
      return this.props.checked === true
    }

    getChildNodes() {
      return this.nodesRef ? this.nodesRef.getChildren() : []
    }

    select() {
      this.content.select();
    }

    unselect() {
      this.content.unselect();
    }
  }

  Component.register(TreeNode);

  /* eslint-disable */

  /**!
   * Sortable 1.13.0
   * @author	RubaXa   <trash@rubaxa.org>
   * @author	owenm    <owen23355@gmail.com>
   * @license MIT
   */
  function _typeof(obj) {
    if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
      _typeof = function (obj) {
        return typeof obj
      };
    } else {
      _typeof = function (obj) {
        return obj &&
          typeof Symbol === 'function' &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? 'symbol'
          : typeof obj
      };
    }

    return _typeof(obj)
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      obj[key] = value;
    }

    return obj
  }

  function _extends() {
    _extends =
      Object.assign ||
      function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];

          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }

        return target
      };

    return _extends.apply(this, arguments)
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(
          Object.getOwnPropertySymbols(source).filter(function (sym) {
            return Object.getOwnPropertyDescriptor(source, sym).enumerable
          }),
        );
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {}
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue
      target[key] = source[key];
    }

    return target
  }

  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {}

    var target = _objectWithoutPropertiesLoose(source, excluded);

    var key, i;

    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue
        target[key] = source[key];
      }
    }

    return target
  }

  var version = '1.13.0';

  function userAgent(pattern) {
    if (typeof window !== 'undefined' && window.navigator) {
      return !!(
        /*@__PURE__*/
        navigator.userAgent.match(pattern)
      )
    }
  }

  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var FireFox = userAgent(/firefox/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
  var IOS = userAgent(/iP(ad|od|hone)/i);
  var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);

  var captureMode = {
    capture: false,
    passive: false,
  };

  function on(el, event, fn) {
    el.addEventListener(event, fn, !IE11OrLess && captureMode);
  }

  function off(el, event, fn) {
    el.removeEventListener(event, fn, !IE11OrLess && captureMode);
  }

  function matches(
    /**HTMLElement*/
    el,
    /**String*/
    selector,
  ) {
    if (!selector) return
    selector[0] === '>' && (selector = selector.substring(1));

    if (el) {
      try {
        if (el.matches) {
          return el.matches(selector)
        } else if (el.msMatchesSelector) {
          return el.msMatchesSelector(selector)
        } else if (el.webkitMatchesSelector) {
          return el.webkitMatchesSelector(selector)
        }
      } catch (_) {
        return false
      }
    }

    return false
  }

  function getParentOrHost(el) {
    return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode
  }

  function closest(
    /**HTMLElement*/
    el,
    /**String*/
    selector,
    /**HTMLElement*/
    ctx,
    includeCTX,
  ) {
    if (el) {
      ctx = ctx || document;

      do {
        if (
          (selector != null &&
            (selector[0] === '>'
              ? el.parentNode === ctx && matches(el, selector)
              : matches(el, selector))) ||
          (includeCTX && el === ctx)
        ) {
          return el
        }

        if (el === ctx) break
        /* jshint boss:true */
      } while ((el = getParentOrHost(el)))
    }

    return null
  }

  var R_SPACE = /\s+/g;

  function toggleClass(el, name, state) {
    if (el && name) {
      if (el.classList) {
        el.classList[state ? 'add' : 'remove'](name);
      } else {
        var className = (' ' + el.className + ' ')
          .replace(R_SPACE, ' ')
          .replace(' ' + name + ' ', ' ');
        el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
      }
    }
  }

  function css(el, prop, val) {
    var style = el && el.style;

    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el, '');
        } else if (el.currentStyle) {
          val = el.currentStyle;
        }

        return prop === void 0 ? val : val[prop]
      } else {
        if (!(prop in style) && prop.indexOf('webkit') === -1) {
          prop = '-webkit-' + prop;
        }

        style[prop] = val + (typeof val === 'string' ? '' : 'px');
      }
    }
  }

  function matrix(el, selfOnly) {
    var appliedTransforms = '';

    if (typeof el === 'string') {
      appliedTransforms = el;
    } else {
      do {
        var transform = css(el, 'transform');

        if (transform && transform !== 'none') {
          appliedTransforms = transform + ' ' + appliedTransforms;
        }
        /* jshint boss:true */
      } while (!selfOnly && (el = el.parentNode))
    }

    var matrixFn =
      window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
    /*jshint -W056 */

    return matrixFn && new matrixFn(appliedTransforms)
  }

  function find(ctx, tagName, iterator) {
    if (ctx) {
      var list = ctx.getElementsByTagName(tagName),
        i = 0,
        n = list.length;

      if (iterator) {
        for (; i < n; i++) {
          iterator(list[i], i);
        }
      }

      return list
    }

    return []
  }

  function getWindowScrollingElement() {
    var scrollingElement = document.scrollingElement;

    if (scrollingElement) {
      return scrollingElement
    } else {
      return document.documentElement
    }
  }
  /**
   * Returns the "bounding client rect" of given element
   * @param  {HTMLElement} el                       The element whose boundingClientRect is wanted
   * @param  {[Boolean]} relativeToContainingBlock  Whether the rect should be relative to the containing block of (including) the container
   * @param  {[Boolean]} relativeToNonStaticParent  Whether the rect should be relative to the relative parent of (including) the contaienr
   * @param  {[Boolean]} undoScale                  Whether the container's scale() should be undone
   * @param  {[HTMLElement]} container              The parent the element will be placed in
   * @return {Object}                               The boundingClientRect of el, with specified adjustments
   */

  function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
    if (!el.getBoundingClientRect && el !== window) return
    var elRect, top, left, bottom, right, height, width;

    if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
      elRect = el.getBoundingClientRect();
      top = elRect.top;
      left = elRect.left;
      bottom = elRect.bottom;
      right = elRect.right;
      height = elRect.height;
      width = elRect.width;
    } else {
      top = 0;
      left = 0;
      bottom = window.innerHeight;
      right = window.innerWidth;
      height = window.innerHeight;
      width = window.innerWidth;
    }

    if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
      // Adjust for translate()
      container = container || el.parentNode; // solves #1123 (see: https://stackoverflow.com/a/37953806/6088312)
      // Not needed on <= IE11

      if (!IE11OrLess) {
        do {
          if (
            container &&
            container.getBoundingClientRect &&
            (css(container, 'transform') !== 'none' ||
              (relativeToNonStaticParent && css(container, 'position') !== 'static'))
          ) {
            var containerRect = container.getBoundingClientRect(); // Set relative to edges of padding box of container

            top -= containerRect.top + parseInt(css(container, 'border-top-width'));
            left -= containerRect.left + parseInt(css(container, 'border-left-width'));
            bottom = top + elRect.height;
            right = left + elRect.width;
            break
          }
          /* jshint boss:true */
        } while ((container = container.parentNode))
      }
    }

    if (undoScale && el !== window) {
      // Adjust for scale()
      var elMatrix = matrix(container || el),
        scaleX = elMatrix && elMatrix.a,
        scaleY = elMatrix && elMatrix.d;

      if (elMatrix) {
        top /= scaleY;
        left /= scaleX;
        width /= scaleX;
        height /= scaleY;
        bottom = top + height;
        right = left + width;
      }
    }

    return {
      top: top,
      left: left,
      bottom: bottom,
      right: right,
      width: width,
      height: height,
    }
  }
  /**
   * Checks if a side of an element is scrolled past a side of its parents
   * @param  {HTMLElement}  el           The element who's side being scrolled out of view is in question
   * @param  {String}       elSide       Side of the element in question ('top', 'left', 'right', 'bottom')
   * @param  {String}       parentSide   Side of the parent in question ('top', 'left', 'right', 'bottom')
   * @return {HTMLElement}               The parent scroll element that the el's side is scrolled past, or null if there is no such element
   */

  function isScrolledPast(el, elSide, parentSide) {
    var parent = getParentAutoScrollElement(el, true),
      elSideVal = getRect(el)[elSide];
    /* jshint boss:true */

    while (parent) {
      var parentSideVal = getRect(parent)[parentSide],
        visible = void 0;

      if (parentSide === 'top' || parentSide === 'left') {
        visible = elSideVal >= parentSideVal;
      } else {
        visible = elSideVal <= parentSideVal;
      }

      if (!visible) return parent
      if (parent === getWindowScrollingElement()) break
      parent = getParentAutoScrollElement(parent, false);
    }

    return false
  }
  /**
   * Gets nth child of el, ignoring hidden children, sortable's elements (does not ignore clone if it's visible)
   * and non-draggable elements
   * @param  {HTMLElement} el       The parent element
   * @param  {Number} childNum      The index of the child
   * @param  {Object} options       Parent Sortable's options
   * @return {HTMLElement}          The child at index childNum, or null if not found
   */

  function getChild(el, childNum, options) {
    var currentChild = 0,
      i = 0,
      children = el.children;

    while (i < children.length) {
      if (
        children[i].style.display !== 'none' &&
        children[i] !== Sortable.ghost &&
        children[i] !== Sortable.dragged &&
        closest(children[i], options.draggable, el, false)
      ) {
        if (currentChild === childNum) {
          return children[i]
        }

        currentChild++;
      }

      i++;
    }

    return null
  }
  /**
   * Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
   * @param  {HTMLElement} el       Parent element
   * @param  {selector} selector    Any other elements that should be ignored
   * @return {HTMLElement}          The last child, ignoring ghostEl
   */

  function lastChild(el, selector) {
    var last = el.lastElementChild;

    while (
      last &&
      (last === Sortable.ghost ||
        css(last, 'display') === 'none' ||
        (selector && !matches(last, selector)))
    ) {
      last = last.previousElementSibling;
    }

    return last || null
  }
  /**
   * Returns the index of an element within its parent for a selected set of
   * elements
   * @param  {HTMLElement} el
   * @param  {selector} selector
   * @return {number}
   */

  function index$1(el, selector) {
    var index = 0;

    if (!el || !el.parentNode) {
      return -1
    }
    /* jshint boss:true */

    while ((el = el.previousElementSibling)) {
      if (
        el.nodeName.toUpperCase() !== 'TEMPLATE' &&
        el !== Sortable.clone &&
        (!selector || matches(el, selector))
      ) {
        index++;
      }
    }

    return index
  }
  /**
   * Returns the scroll offset of the given element, added with all the scroll offsets of parent elements.
   * The value is returned in real pixels.
   * @param  {HTMLElement} el
   * @return {Array}             Offsets in the format of [left, top]
   */

  function getRelativeScrollOffset(el) {
    var offsetLeft = 0,
      offsetTop = 0,
      winScroller = getWindowScrollingElement();

    if (el) {
      do {
        var elMatrix = matrix(el),
          scaleX = elMatrix.a,
          scaleY = elMatrix.d;
        offsetLeft += el.scrollLeft * scaleX;
        offsetTop += el.scrollTop * scaleY;
      } while (el !== winScroller && (el = el.parentNode))
    }

    return [offsetLeft, offsetTop]
  }
  /**
   * Returns the index of the object within the given array
   * @param  {Array} arr   Array that may or may not hold the object
   * @param  {Object} obj  An object that has a key-value pair unique to and identical to a key-value pair in the object you want to find
   * @return {Number}      The index of the object in the array, or -1
   */

  function indexOfObject(arr, obj) {
    for (var i in arr) {
      if (!arr.hasOwnProperty(i)) continue

      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) return Number(i)
      }
    }

    return -1
  }

  function getParentAutoScrollElement(el, includeSelf) {
    // skip to window
    if (!el || !el.getBoundingClientRect) return getWindowScrollingElement()
    var elem = el;
    var gotSelf = false;

    do {
      // we don't need to get elem css if it isn't even overflowing in the first place (performance)
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);

        if (
          (elem.clientWidth < elem.scrollWidth &&
            (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll')) ||
          (elem.clientHeight < elem.scrollHeight &&
            (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll'))
        ) {
          if (!elem.getBoundingClientRect || elem === document.body)
            return getWindowScrollingElement()
          if (gotSelf || includeSelf) return elem
          gotSelf = true;
        }
      }
      /* jshint boss:true */
    } while ((elem = elem.parentNode))

    return getWindowScrollingElement()
  }

  function extend$1(dst, src) {
    if (dst && src) {
      for (var key in src) {
        if (src.hasOwnProperty(key)) {
          dst[key] = src[key];
        }
      }
    }

    return dst
  }

  function isRectEqual(rect1, rect2) {
    return (
      Math.round(rect1.top) === Math.round(rect2.top) &&
      Math.round(rect1.left) === Math.round(rect2.left) &&
      Math.round(rect1.height) === Math.round(rect2.height) &&
      Math.round(rect1.width) === Math.round(rect2.width)
    )
  }

  var _throttleTimeout;

  function throttle(callback, ms) {
    return function () {
      if (!_throttleTimeout) {
        var args = arguments,
          _this = this;

        if (args.length === 1) {
          callback.call(_this, args[0]);
        } else {
          callback.apply(_this, args);
        }

        _throttleTimeout = setTimeout(function () {
          _throttleTimeout = void 0;
        }, ms);
      }
    }
  }

  function scrollBy(el, x, y) {
    el.scrollLeft += x;
    el.scrollTop += y;
  }

  function clone$1(el) {
    var Polymer = window.Polymer;
    var $ = window.jQuery || window.Zepto;

    if (Polymer && Polymer.dom) {
      return Polymer.dom(el).cloneNode(true)
    } else if ($) {
      return $(el).clone(true)[0]
    } else {
      return el.cloneNode(true)
    }
  }

  var expando = 'Sortable' + new Date().getTime();

  function AnimationStateManager() {
    var animationStates = [],
      animationCallbackId;
    return {
      captureAnimationState: function captureAnimationState() {
        animationStates = [];
        if (!this.options.animation) return
        var children = [].slice.call(this.el.children);
        children.forEach(function (child) {
          if (css(child, 'display') === 'none' || child === Sortable.ghost) return
          animationStates.push({
            target: child,
            rect: getRect(child),
          });

          var fromRect = _objectSpread({}, animationStates[animationStates.length - 1].rect); // If animating: compensate for current animation

          if (child.thisAnimationDuration) {
            var childMatrix = matrix(child, true);

            if (childMatrix) {
              fromRect.top -= childMatrix.f;
              fromRect.left -= childMatrix.e;
            }
          }

          child.fromRect = fromRect;
        });
      },
      addAnimationState: function addAnimationState(state) {
        animationStates.push(state);
      },
      removeAnimationState: function removeAnimationState(target) {
        animationStates.splice(
          indexOfObject(animationStates, {
            target: target,
          }),
          1,
        );
      },
      animateAll: function animateAll(callback) {
        var _this = this;

        if (!this.options.animation) {
          clearTimeout(animationCallbackId);
          if (typeof callback === 'function') callback();
          return
        }

        var animating = false,
          animationTime = 0;
        animationStates.forEach(function (state) {
          var time = 0,
            target = state.target,
            fromRect = target.fromRect,
            toRect = getRect(target),
            prevFromRect = target.prevFromRect,
            prevToRect = target.prevToRect,
            animatingRect = state.rect,
            targetMatrix = matrix(target, true);

          if (targetMatrix) {
            // Compensate for current animation
            toRect.top -= targetMatrix.f;
            toRect.left -= targetMatrix.e;
          }

          target.toRect = toRect;

          if (target.thisAnimationDuration) {
            // Could also check if animatingRect is between fromRect and toRect
            if (
              isRectEqual(prevFromRect, toRect) &&
              !isRectEqual(fromRect, toRect) && // Make sure animatingRect is on line between toRect & fromRect
              (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) ===
                (fromRect.top - toRect.top) / (fromRect.left - toRect.left)
            ) {
              // If returning to same place as started from animation and on same axis
              time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
            }
          } // if fromRect != toRect: animate

          if (!isRectEqual(toRect, fromRect)) {
            target.prevFromRect = fromRect;
            target.prevToRect = toRect;

            if (!time) {
              time = _this.options.animation;
            }

            _this.animate(target, animatingRect, toRect, time);
          }

          if (time) {
            animating = true;
            animationTime = Math.max(animationTime, time);
            clearTimeout(target.animationResetTimer);
            target.animationResetTimer = setTimeout(function () {
              target.animationTime = 0;
              target.prevFromRect = null;
              target.fromRect = null;
              target.prevToRect = null;
              target.thisAnimationDuration = null;
            }, time);
            target.thisAnimationDuration = time;
          }
        });
        clearTimeout(animationCallbackId);

        if (!animating) {
          if (typeof callback === 'function') callback();
        } else {
          animationCallbackId = setTimeout(function () {
            if (typeof callback === 'function') callback();
          }, animationTime);
        }

        animationStates = [];
      },
      animate: function animate(target, currentRect, toRect, duration) {
        if (duration) {
          css(target, 'transition', '');
          css(target, 'transform', '');
          var elMatrix = matrix(this.el),
            scaleX = elMatrix && elMatrix.a,
            scaleY = elMatrix && elMatrix.d,
            translateX = (currentRect.left - toRect.left) / (scaleX || 1),
            translateY = (currentRect.top - toRect.top) / (scaleY || 1);
          target.animatingX = !!translateX;
          target.animatingY = !!translateY;
          css(target, 'transform', 'translate3d(' + translateX + 'px,' + translateY + 'px,0)');
          this.forRepaintDummy = repaint(target); // repaint

          css(
            target,
            'transition',
            'transform ' + duration + 'ms' + (this.options.easing ? ' ' + this.options.easing : ''),
          );
          css(target, 'transform', 'translate3d(0,0,0)');
          typeof target.animated === 'number' && clearTimeout(target.animated);
          target.animated = setTimeout(function () {
            css(target, 'transition', '');
            css(target, 'transform', '');
            target.animated = false;
            target.animatingX = false;
            target.animatingY = false;
          }, duration);
        }
      },
    }
  }

  function repaint(target) {
    return target.offsetWidth
  }

  function calculateRealTime(animatingRect, fromRect, toRect, options) {
    return (
      (Math.sqrt(
        Math.pow(fromRect.top - animatingRect.top, 2) +
          Math.pow(fromRect.left - animatingRect.left, 2),
      ) /
        Math.sqrt(
          Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2),
        )) *
      options.animation
    )
  }

  var plugins = [];
  var defaults = {
    initializeByDefault: true,
  };
  var PluginManager = {
    mount: function mount(plugin) {
      // Set default static properties
      for (var option in defaults) {
        if (defaults.hasOwnProperty(option) && !(option in plugin)) {
          plugin[option] = defaults[option];
        }
      }

      plugins.forEach(function (p) {
        if (p.pluginName === plugin.pluginName) {
          throw 'Sortable: Cannot mount plugin '.concat(plugin.pluginName, ' more than once')
        }
      });
      plugins.push(plugin);
    },
    pluginEvent: function pluginEvent(eventName, sortable, evt) {
      var _this = this;

      this.eventCanceled = false;

      evt.cancel = function () {
        _this.eventCanceled = true;
      };

      var eventNameGlobal = eventName + 'Global';
      plugins.forEach(function (plugin) {
        if (!sortable[plugin.pluginName]) return // Fire global events if it exists in this sortable

        if (sortable[plugin.pluginName][eventNameGlobal]) {
          sortable[plugin.pluginName][eventNameGlobal](
            _objectSpread(
              {
                sortable: sortable,
              },
              evt,
            ),
          );
        } // Only fire plugin event if plugin is enabled in this sortable,
        // and plugin has event defined

        if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
          sortable[plugin.pluginName][eventName](
            _objectSpread(
              {
                sortable: sortable,
              },
              evt,
            ),
          );
        }
      });
    },
    initializePlugins: function initializePlugins(sortable, el, defaults, options) {
      plugins.forEach(function (plugin) {
        var pluginName = plugin.pluginName;
        if (!sortable.options[pluginName] && !plugin.initializeByDefault) return
        var initialized = new plugin(sortable, el, sortable.options);
        initialized.sortable = sortable;
        initialized.options = sortable.options;
        sortable[pluginName] = initialized; // Add default options from plugin

        _extends(defaults, initialized.defaults);
      });

      for (var option in sortable.options) {
        if (!sortable.options.hasOwnProperty(option)) continue
        var modified = this.modifyOption(sortable, option, sortable.options[option]);

        if (typeof modified !== 'undefined') {
          sortable.options[option] = modified;
        }
      }
    },
    getEventProperties: function getEventProperties(name, sortable) {
      var eventProperties = {};
      plugins.forEach(function (plugin) {
        if (typeof plugin.eventProperties !== 'function') return

        _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
      });
      return eventProperties
    },
    modifyOption: function modifyOption(sortable, name, value) {
      var modifiedValue;
      plugins.forEach(function (plugin) {
        // Plugin must exist on the Sortable
        if (!sortable[plugin.pluginName]) return // If static option listener exists for this option, call in the context of the Sortable's instance of this plugin

        if (plugin.optionListeners && typeof plugin.optionListeners[name] === 'function') {
          modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
        }
      });
      return modifiedValue
    },
  };

  function dispatchEvent(_ref) {
    var sortable = _ref.sortable,
      rootEl = _ref.rootEl,
      name = _ref.name,
      targetEl = _ref.targetEl,
      cloneEl = _ref.cloneEl,
      toEl = _ref.toEl,
      fromEl = _ref.fromEl,
      oldIndex = _ref.oldIndex,
      newIndex = _ref.newIndex,
      oldDraggableIndex = _ref.oldDraggableIndex,
      newDraggableIndex = _ref.newDraggableIndex,
      originalEvent = _ref.originalEvent,
      putSortable = _ref.putSortable,
      extraEventProperties = _ref.extraEventProperties;
    sortable = sortable || (rootEl && rootEl[expando]);
    if (!sortable) return
    var evt,
      options = sortable.options,
      onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1); // Support for new CustomEvent feature

    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent(name, {
        bubbles: true,
        cancelable: true,
      });
    } else {
      evt = document.createEvent('Event');
      evt.initEvent(name, true, true);
    }

    evt.to = toEl || rootEl;
    evt.from = fromEl || rootEl;
    evt.item = targetEl || rootEl;
    evt.clone = cloneEl;
    evt.oldIndex = oldIndex;
    evt.newIndex = newIndex;
    evt.oldDraggableIndex = oldDraggableIndex;
    evt.newDraggableIndex = newDraggableIndex;
    evt.originalEvent = originalEvent;
    evt.pullMode = putSortable ? putSortable.lastPutMode : undefined;

    var allEventProperties = _objectSpread(
      {},
      extraEventProperties,
      PluginManager.getEventProperties(name, sortable),
    );

    for (var option in allEventProperties) {
      evt[option] = allEventProperties[option];
    }

    if (rootEl) {
      rootEl.dispatchEvent(evt);
    }

    if (options[onName]) {
      options[onName].call(sortable, evt);
    }
  }

  var pluginEvent = function pluginEvent(eventName, sortable) {
    var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      originalEvent = _ref.evt,
      data = _objectWithoutProperties(_ref, ['evt']);

    PluginManager.pluginEvent.bind(Sortable)(
      eventName,
      sortable,
      _objectSpread(
        {
          dragEl: dragEl,
          parentEl: parentEl,
          ghostEl: ghostEl,
          rootEl: rootEl,
          nextEl: nextEl,
          lastDownEl: lastDownEl,
          cloneEl: cloneEl,
          cloneHidden: cloneHidden,
          dragStarted: moved,
          putSortable: putSortable,
          activeSortable: Sortable.active,
          originalEvent: originalEvent,
          oldIndex: oldIndex,
          oldDraggableIndex: oldDraggableIndex,
          newIndex: newIndex,
          newDraggableIndex: newDraggableIndex,
          hideGhostForTarget: _hideGhostForTarget,
          unhideGhostForTarget: _unhideGhostForTarget,
          cloneNowHidden: function cloneNowHidden() {
            cloneHidden = true;
          },
          cloneNowShown: function cloneNowShown() {
            cloneHidden = false;
          },
          dispatchSortableEvent: function dispatchSortableEvent(name) {
            _dispatchEvent({
              sortable: sortable,
              name: name,
              originalEvent: originalEvent,
            });
          },
        },
        data,
      ),
    );
  };

  function _dispatchEvent(info) {
    dispatchEvent(
      _objectSpread(
        {
          putSortable: putSortable,
          cloneEl: cloneEl,
          targetEl: dragEl,
          rootEl: rootEl,
          oldIndex: oldIndex,
          oldDraggableIndex: oldDraggableIndex,
          newIndex: newIndex,
          newDraggableIndex: newDraggableIndex,
        },
        info,
      ),
    );
  }

  var dragEl,
    parentEl,
    ghostEl,
    rootEl,
    nextEl,
    lastDownEl,
    cloneEl,
    cloneHidden,
    oldIndex,
    newIndex,
    oldDraggableIndex,
    newDraggableIndex,
    activeGroup,
    putSortable,
    awaitingDragStarted = false,
    ignoreNextClick = false,
    sortables = [],
    tapEvt,
    touchEvt,
    lastDx,
    lastDy,
    tapDistanceLeft,
    tapDistanceTop,
    moved,
    lastTarget,
    lastDirection,
    pastFirstInvertThresh = false,
    isCircumstantialInvert = false,
    targetMoveDistance,
    // For positioning ghost absolutely
    ghostRelativeParent,
    ghostRelativeParentInitialScroll = [],
    // (left, top)
    _silent = false,
    savedInputChecked = [];
  /** @const */

  var documentExists = typeof document !== 'undefined',
    PositionGhostAbsolutely = IOS,
    CSSFloatProperty = Edge || IE11OrLess ? 'cssFloat' : 'float',
    // This will not pass for IE9, because IE9 DnD only works on anchors
    supportDraggable =
      documentExists && !ChromeForAndroid && !IOS && 'draggable' in document.createElement('div'),
    supportCssPointerEvents = (function () {
      if (!documentExists) return // false when <= IE11

      if (IE11OrLess) {
        return false
      }

      var el = document.createElement('x');
      el.style.cssText = 'pointer-events:auto';
      return el.style.pointerEvents === 'auto'
    })(),
    _detectDirection = function _detectDirection(el, options) {
      var elCSS = css(el),
        elWidth =
          parseInt(elCSS.width) -
          parseInt(elCSS.paddingLeft) -
          parseInt(elCSS.paddingRight) -
          parseInt(elCSS.borderLeftWidth) -
          parseInt(elCSS.borderRightWidth),
        child1 = getChild(el, 0, options),
        child2 = getChild(el, 1, options),
        firstChildCSS = child1 && css(child1),
        secondChildCSS = child2 && css(child2),
        firstChildWidth =
          firstChildCSS &&
          parseInt(firstChildCSS.marginLeft) +
            parseInt(firstChildCSS.marginRight) +
            getRect(child1).width,
        secondChildWidth =
          secondChildCSS &&
          parseInt(secondChildCSS.marginLeft) +
            parseInt(secondChildCSS.marginRight) +
            getRect(child2).width;

      if (elCSS.display === 'flex') {
        return elCSS.flexDirection === 'column' || elCSS.flexDirection === 'column-reverse'
          ? 'vertical'
          : 'horizontal'
      }

      if (elCSS.display === 'grid') {
        return elCSS.gridTemplateColumns.split(' ').length <= 1 ? 'vertical' : 'horizontal'
      }

      if (child1 && firstChildCSS['float'] && firstChildCSS['float'] !== 'none') {
        var touchingSideChild2 = firstChildCSS['float'] === 'left' ? 'left' : 'right';
        return child2 &&
          (secondChildCSS.clear === 'both' || secondChildCSS.clear === touchingSideChild2)
          ? 'vertical'
          : 'horizontal'
      }

      return child1 &&
        (firstChildCSS.display === 'block' ||
          firstChildCSS.display === 'flex' ||
          firstChildCSS.display === 'table' ||
          firstChildCSS.display === 'grid' ||
          (firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === 'none') ||
          (child2 &&
            elCSS[CSSFloatProperty] === 'none' &&
            firstChildWidth + secondChildWidth > elWidth))
        ? 'vertical'
        : 'horizontal'
    },
    _dragElInRowColumn = function _dragElInRowColumn(dragRect, targetRect, vertical) {
      var dragElS1Opp = vertical ? dragRect.left : dragRect.top,
        dragElS2Opp = vertical ? dragRect.right : dragRect.bottom,
        dragElOppLength = vertical ? dragRect.width : dragRect.height,
        targetS1Opp = vertical ? targetRect.left : targetRect.top,
        targetS2Opp = vertical ? targetRect.right : targetRect.bottom,
        targetOppLength = vertical ? targetRect.width : targetRect.height;
      return (
        dragElS1Opp === targetS1Opp ||
        dragElS2Opp === targetS2Opp ||
        dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2
      )
    },
    /**
     * Detects first nearest empty sortable to X and Y position using emptyInsertThreshold.
     * @param  {Number} x      X position
     * @param  {Number} y      Y position
     * @return {HTMLElement}   Element of the first found nearest Sortable
     */
    _detectNearestEmptySortable = function _detectNearestEmptySortable(x, y) {
      var ret;
      sortables.some(function (sortable) {
        if (lastChild(sortable)) return
        var rect = getRect(sortable),
          threshold = sortable[expando].options.emptyInsertThreshold,
          insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
          insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;

        if (threshold && insideHorizontally && insideVertically) {
          return (ret = sortable)
        }
      });
      return ret
    },
    _prepareGroup = function _prepareGroup(options) {
      function toFn(value, pull) {
        return function (to, from, dragEl, evt) {
          var sameGroup =
            to.options.group.name &&
            from.options.group.name &&
            to.options.group.name === from.options.group.name;

          if (value == null && (pull || sameGroup)) {
            // Default pull value
            // Default pull and put value if same group
            return true
          } else if (value == null || value === false) {
            return false
          } else if (pull && value === 'clone') {
            return value
          } else if (typeof value === 'function') {
            return toFn(value(to, from, dragEl, evt), pull)(to, from, dragEl, evt)
          } else {
            var otherGroup = (pull ? to : from).options.group.name;
            return (
              value === true ||
              (typeof value === 'string' && value === otherGroup) ||
              (value.join && value.indexOf(otherGroup) > -1)
            )
          }
        }
      }

      var group = {};
      var originalGroup = options.group;

      if (!originalGroup || _typeof(originalGroup) != 'object') {
        originalGroup = {
          name: originalGroup,
        };
      }

      group.name = originalGroup.name;
      group.checkPull = toFn(originalGroup.pull, true);
      group.checkPut = toFn(originalGroup.put);
      group.revertClone = originalGroup.revertClone;
      options.group = group;
    },
    _hideGhostForTarget = function _hideGhostForTarget() {
      if (!supportCssPointerEvents && ghostEl) {
        css(ghostEl, 'display', 'none');
      }
    },
    _unhideGhostForTarget = function _unhideGhostForTarget() {
      if (!supportCssPointerEvents && ghostEl) {
        css(ghostEl, 'display', '');
      }
    }; // #1184 fix - Prevent click event on fallback if dragged but item not changed position

  if (documentExists) {
    document.addEventListener(
      'click',
      function (evt) {
        if (ignoreNextClick) {
          evt.preventDefault();
          evt.stopPropagation && evt.stopPropagation();
          evt.stopImmediatePropagation && evt.stopImmediatePropagation();
          ignoreNextClick = false;
          return false
        }
      },
      true,
    );
  }

  var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent(evt) {
    if (dragEl) {
      evt = evt.touches ? evt.touches[0] : evt;

      var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);

      if (nearest) {
        // Create imitation event
        var event = {};

        for (var i in evt) {
          if (evt.hasOwnProperty(i)) {
            event[i] = evt[i];
          }
        }

        event.target = event.rootEl = nearest;
        event.preventDefault = void 0;
        event.stopPropagation = void 0;

        nearest[expando]._onDragOver(event);
      }
    }
  };

  var _checkOutsideTargetEl = function _checkOutsideTargetEl(evt) {
    if (dragEl) {
      dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
    }
  };
  /**
   * @class  Sortable
   * @param  {HTMLElement}  el
   * @param  {Object}       [options]
   */

  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw 'Sortable: `el` must be an HTMLElement, not '.concat({}.toString.call(el))
    }

    this.el = el; // root element

    this.options = options = _extends({}, options); // Export instance

    el[expando] = this;
    var defaults = {
      group: null,
      sort: true,
      disabled: false,
      store: null,
      handle: null,
      draggable: /^[uo]l$/i.test(el.nodeName) ? '>li' : '>*',
      swapThreshold: 1,
      // percentage; 0 <= x <= 1
      invertSwap: false,
      // invert always
      invertedSwapThreshold: null,
      // will be set to same as swapThreshold if default
      removeCloneOnHide: true,
      direction: function direction() {
        return _detectDirection(el, this.options)
      },
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      ignore: 'a, img',
      filter: null,
      preventOnFilter: true,
      animation: 0,
      easing: null,
      setData: function setData(dataTransfer, dragEl) {
        dataTransfer.setData('Text', dragEl.textContent);
      },
      dropBubble: false,
      dragoverBubble: false,
      dataIdAttr: 'data-id',
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold:
        (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      forceFallback: false,
      fallbackClass: 'sortable-fallback',
      fallbackOnBody: false,
      fallbackTolerance: 0,
      fallbackOffset: {
        x: 0,
        y: 0,
      },
      supportPointer: Sortable.supportPointer !== false && 'PointerEvent' in window && !Safari,
      emptyInsertThreshold: 5,
    };
    PluginManager.initializePlugins(this, el, defaults); // Set default options

    for (var name in defaults) {
      !(name in options) && (options[name] = defaults[name]);
    }

    _prepareGroup(options); // Bind all private methods

    for (var fn in this) {
      if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
        this[fn] = this[fn].bind(this);
      }
    } // Setup drag mode

    this.nativeDraggable = options.forceFallback ? false : supportDraggable;

    if (this.nativeDraggable) {
      // Touch start threshold cannot be greater than the native dragstart threshold
      this.options.touchStartThreshold = 1;
    } // Bind events

    if (options.supportPointer) {
      on(el, 'pointerdown', this._onTapStart);
    } else {
      on(el, 'mousedown', this._onTapStart);
      on(el, 'touchstart', this._onTapStart);
    }

    if (this.nativeDraggable) {
      on(el, 'dragover', this);
      on(el, 'dragenter', this);
    }

    sortables.push(this.el); // Restore sorting

    options.store && options.store.get && this.sort(options.store.get(this) || []); // Add animation state manager

    _extends(this, AnimationStateManager());
  }

  Sortable.prototype =
    /** @lends Sortable.prototype */
    {
      constructor: Sortable,
      _isOutsideThisEl: function _isOutsideThisEl(target) {
        if (!this.el.contains(target) && target !== this.el) {
          lastTarget = null;
        }
      },
      _getDirection: function _getDirection(evt, target) {
        return typeof this.options.direction === 'function'
          ? this.options.direction.call(this, evt, target, dragEl)
          : this.options.direction
      },
      _onTapStart: function _onTapStart(
        /** Event|TouchEvent */
        evt,
      ) {
        if (!evt.cancelable) return

        var _this = this,
          el = this.el,
          options = this.options,
          preventOnFilter = options.preventOnFilter,
          type = evt.type,
          touch =
            (evt.touches && evt.touches[0]) ||
            (evt.pointerType && evt.pointerType === 'touch' && evt),
          target = (touch || evt).target,
          originalTarget =
            (evt.target.shadowRoot &&
              ((evt.path && evt.path[0]) || (evt.composedPath && evt.composedPath()[0]))) ||
            target,
          filter = options.filter;

        _saveInputCheckedState(el); // Don't trigger start event when an element is been dragged, otherwise the evt.oldindex always wrong when set option.group.

        if (dragEl) {
          return
        }

        if ((/mousedown|pointerdown/.test(type) && evt.button !== 0) || options.disabled) {
          return // only left button and enabled
        } // cancel dnd if original target is content editable

        if (originalTarget.isContentEditable) {
          return
        } // Safari ignores further event handling after mousedown

        if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === 'SELECT') {
          return
        }

        target = closest(target, options.draggable, el, false);

        if (target && target.animated) {
          return
        }

        if (lastDownEl === target) {
          // Ignoring duplicate `down`
          return
        } // Get the index of the dragged element within its parent

        oldIndex = index$1(target);
        oldDraggableIndex = index$1(target, options.draggable); // Check filter

        if (typeof filter === 'function') {
          if (filter.call(this, evt, target, this)) {
            _dispatchEvent({
              sortable: _this,
              rootEl: originalTarget,
              name: 'filter',
              targetEl: target,
              toEl: el,
              fromEl: el,
            });

            pluginEvent('filter', _this, {
              evt: evt,
            });
            preventOnFilter && evt.cancelable && evt.preventDefault();
            return // cancel dnd
          }
        } else if (filter) {
          filter = filter.split(',').some(function (criteria) {
            criteria = closest(originalTarget, criteria.trim(), el, false);

            if (criteria) {
              _dispatchEvent({
                sortable: _this,
                rootEl: criteria,
                name: 'filter',
                targetEl: target,
                fromEl: el,
                toEl: el,
              });

              pluginEvent('filter', _this, {
                evt: evt,
              });
              return true
            }
          });

          if (filter) {
            preventOnFilter && evt.cancelable && evt.preventDefault();
            return // cancel dnd
          }
        }

        if (options.handle && !closest(originalTarget, options.handle, el, false)) {
          return
        } // Prepare `dragstart`

        this._prepareDragStart(evt, touch, target);
      },
      _prepareDragStart: function _prepareDragStart(
        /** Event */
        evt,
        /** Touch */
        touch,
        /** HTMLElement */
        target,
      ) {
        var _this = this,
          el = _this.el,
          options = _this.options,
          ownerDocument = el.ownerDocument,
          dragStartFn;

        if (target && !dragEl && target.parentNode === el) {
          var dragRect = getRect(target);
          rootEl = el;
          dragEl = target;
          parentEl = dragEl.parentNode;
          nextEl = dragEl.nextSibling;
          lastDownEl = target;
          activeGroup = options.group;
          Sortable.dragged = dragEl;
          tapEvt = {
            target: dragEl,
            clientX: (touch || evt).clientX,
            clientY: (touch || evt).clientY,
          };
          tapDistanceLeft = tapEvt.clientX - dragRect.left;
          tapDistanceTop = tapEvt.clientY - dragRect.top;
          this._lastX = (touch || evt).clientX;
          this._lastY = (touch || evt).clientY;
          dragEl.style['will-change'] = 'all';

          dragStartFn = function dragStartFn() {
            pluginEvent('delayEnded', _this, {
              evt: evt,
            });

            if (Sortable.eventCanceled) {
              _this._onDrop();

              return
            } // Delayed drag has been triggered
            // we can re-enable the events: touchmove/mousemove

            _this._disableDelayedDragEvents();

            if (!FireFox && _this.nativeDraggable) {
              dragEl.draggable = true;
            } // Bind the events: dragstart/dragend

            _this._triggerDragStart(evt, touch); // Drag start event

            _dispatchEvent({
              sortable: _this,
              name: 'choose',
              originalEvent: evt,
            }); // Chosen item

            toggleClass(dragEl, options.chosenClass, true);
          }; // Disable "draggable"

          options.ignore.split(',').forEach(function (criteria) {
            find(dragEl, criteria.trim(), _disableDraggable);
          });
          on(ownerDocument, 'dragover', nearestEmptyInsertDetectEvent);
          on(ownerDocument, 'mousemove', nearestEmptyInsertDetectEvent);
          on(ownerDocument, 'touchmove', nearestEmptyInsertDetectEvent);
          on(ownerDocument, 'mouseup', _this._onDrop);
          on(ownerDocument, 'touchend', _this._onDrop);
          on(ownerDocument, 'touchcancel', _this._onDrop); // Make dragEl draggable (must be before delay for FireFox)

          if (FireFox && this.nativeDraggable) {
            this.options.touchStartThreshold = 4;
            dragEl.draggable = true;
          }

          pluginEvent('delayStart', this, {
            evt: evt,
          }); // Delay is impossible for native DnD in Edge or IE

          if (
            options.delay &&
            (!options.delayOnTouchOnly || touch) &&
            (!this.nativeDraggable || !(Edge || IE11OrLess))
          ) {
            if (Sortable.eventCanceled) {
              this._onDrop();

              return
            } // If the user moves the pointer or let go the click or touch
            // before the delay has been reached:
            // disable the delayed drag

            on(ownerDocument, 'mouseup', _this._disableDelayedDrag);
            on(ownerDocument, 'touchend', _this._disableDelayedDrag);
            on(ownerDocument, 'touchcancel', _this._disableDelayedDrag);
            on(ownerDocument, 'mousemove', _this._delayedDragTouchMoveHandler);
            on(ownerDocument, 'touchmove', _this._delayedDragTouchMoveHandler);
            options.supportPointer &&
              on(ownerDocument, 'pointermove', _this._delayedDragTouchMoveHandler);
            _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
          } else {
            dragStartFn();
          }
        }
      },
      _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(
        /** TouchEvent|PointerEvent **/
        e,
      ) {
        var touch = e.touches ? e.touches[0] : e;

        if (
          Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >=
          Math.floor(
            this.options.touchStartThreshold /
              ((this.nativeDraggable && window.devicePixelRatio) || 1),
          )
        ) {
          this._disableDelayedDrag();
        }
      },
      _disableDelayedDrag: function _disableDelayedDrag() {
        dragEl && _disableDraggable(dragEl);
        clearTimeout(this._dragStartTimer);

        this._disableDelayedDragEvents();
      },
      _disableDelayedDragEvents: function _disableDelayedDragEvents() {
        var ownerDocument = this.el.ownerDocument;
        off(ownerDocument, 'mouseup', this._disableDelayedDrag);
        off(ownerDocument, 'touchend', this._disableDelayedDrag);
        off(ownerDocument, 'touchcancel', this._disableDelayedDrag);
        off(ownerDocument, 'mousemove', this._delayedDragTouchMoveHandler);
        off(ownerDocument, 'touchmove', this._delayedDragTouchMoveHandler);
        off(ownerDocument, 'pointermove', this._delayedDragTouchMoveHandler);
      },
      _triggerDragStart: function _triggerDragStart(
        /** Event */
        evt,
        /** Touch */
        touch,
      ) {
        touch = touch || (evt.pointerType == 'touch' && evt);

        if (!this.nativeDraggable || touch) {
          if (this.options.supportPointer) {
            on(document, 'pointermove', this._onTouchMove);
          } else if (touch) {
            on(document, 'touchmove', this._onTouchMove);
          } else {
            on(document, 'mousemove', this._onTouchMove);
          }
        } else {
          on(dragEl, 'dragend', this);
          on(rootEl, 'dragstart', this._onDragStart);
        }

        try {
          if (document.selection) {
            // Timeout neccessary for IE9
            _nextTick(function () {
              document.selection.empty();
            });
          } else {
            window.getSelection().removeAllRanges();
          }
        } catch (err) {}
      },
      _dragStarted: function _dragStarted(fallback, evt) {
        awaitingDragStarted = false;

        if (rootEl && dragEl) {
          pluginEvent('dragStarted', this, {
            evt: evt,
          });

          if (this.nativeDraggable) {
            on(document, 'dragover', _checkOutsideTargetEl);
          }

          var options = this.options; // Apply effect

          !fallback && toggleClass(dragEl, options.dragClass, false);
          toggleClass(dragEl, options.ghostClass, true);
          Sortable.active = this;
          fallback && this._appendGhost(); // Drag start event

          _dispatchEvent({
            sortable: this,
            name: 'start',
            originalEvent: evt,
          });
        } else {
          this._nulling();
        }
      },
      _emulateDragOver: function _emulateDragOver() {
        if (touchEvt) {
          this._lastX = touchEvt.clientX;
          this._lastY = touchEvt.clientY;

          _hideGhostForTarget();

          var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
          var parent = target;

          while (target && target.shadowRoot) {
            target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
            if (target === parent) break
            parent = target;
          }

          dragEl.parentNode[expando]._isOutsideThisEl(target);

          if (parent) {
            do {
              if (parent[expando]) {
                var inserted = void 0;
                inserted = parent[expando]._onDragOver({
                  clientX: touchEvt.clientX,
                  clientY: touchEvt.clientY,
                  target: target,
                  rootEl: parent,
                });

                if (inserted && !this.options.dragoverBubble) {
                  break
                }
              }

              target = parent; // store last element
            } while (
              /* jshint boss:true */
              (parent = parent.parentNode)
            )
          }

          _unhideGhostForTarget();
        }
      },
      _onTouchMove: function _onTouchMove(
        /**TouchEvent*/
        evt,
      ) {
        if (tapEvt) {
          var options = this.options,
            fallbackTolerance = options.fallbackTolerance,
            fallbackOffset = options.fallbackOffset,
            touch = evt.touches ? evt.touches[0] : evt,
            ghostMatrix = ghostEl && matrix(ghostEl, true),
            scaleX = ghostEl && ghostMatrix && ghostMatrix.a,
            scaleY = ghostEl && ghostMatrix && ghostMatrix.d,
            relativeScrollOffset =
              PositionGhostAbsolutely &&
              ghostRelativeParent &&
              getRelativeScrollOffset(ghostRelativeParent),
            dx =
              (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) +
              (relativeScrollOffset
                ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0]
                : 0) /
                (scaleX || 1),
            dy =
              (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) +
              (relativeScrollOffset
                ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1]
                : 0) /
                (scaleY || 1); // only set the status to dragging, when we are actually dragging

          if (!Sortable.active && !awaitingDragStarted) {
            if (
              fallbackTolerance &&
              Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) <
                fallbackTolerance
            ) {
              return
            }

            this._onDragStart(evt, true);
          }

          if (ghostEl) {
            if (ghostMatrix) {
              ghostMatrix.e += dx - (lastDx || 0);
              ghostMatrix.f += dy - (lastDy || 0);
            } else {
              ghostMatrix = {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                e: dx,
                f: dy,
              };
            }

            var cssMatrix = 'matrix('
              .concat(ghostMatrix.a, ',')
              .concat(ghostMatrix.b, ',')
              .concat(ghostMatrix.c, ',')
              .concat(ghostMatrix.d, ',')
              .concat(ghostMatrix.e, ',')
              .concat(ghostMatrix.f, ')');
            css(ghostEl, 'webkitTransform', cssMatrix);
            css(ghostEl, 'mozTransform', cssMatrix);
            css(ghostEl, 'msTransform', cssMatrix);
            css(ghostEl, 'transform', cssMatrix);
            lastDx = dx;
            lastDy = dy;
            touchEvt = touch;
          }

          evt.cancelable && evt.preventDefault();
        }
      },
      _appendGhost: function _appendGhost() {
        // Bug if using scale(): https://stackoverflow.com/questions/2637058
        // Not being adjusted for
        if (!ghostEl) {
          var container = this.options.fallbackOnBody ? document.body : rootEl,
            rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container),
            options = this.options; // Position absolutely

          if (PositionGhostAbsolutely) {
            // Get relatively positioned parent
            ghostRelativeParent = container;

            while (
              css(ghostRelativeParent, 'position') === 'static' &&
              css(ghostRelativeParent, 'transform') === 'none' &&
              ghostRelativeParent !== document
            ) {
              ghostRelativeParent = ghostRelativeParent.parentNode;
            }

            if (
              ghostRelativeParent !== document.body &&
              ghostRelativeParent !== document.documentElement
            ) {
              if (ghostRelativeParent === document) ghostRelativeParent = getWindowScrollingElement();
              rect.top += ghostRelativeParent.scrollTop;
              rect.left += ghostRelativeParent.scrollLeft;
            } else {
              ghostRelativeParent = getWindowScrollingElement();
            }

            ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
          }

          ghostEl = dragEl.cloneNode(true);
          toggleClass(ghostEl, options.ghostClass, false);
          toggleClass(ghostEl, options.fallbackClass, true);
          toggleClass(ghostEl, options.dragClass, true);
          css(ghostEl, 'transition', '');
          css(ghostEl, 'transform', '');
          css(ghostEl, 'box-sizing', 'border-box');
          css(ghostEl, 'margin', 0);
          css(ghostEl, 'top', rect.top);
          css(ghostEl, 'left', rect.left);
          css(ghostEl, 'width', rect.width);
          css(ghostEl, 'height', rect.height);
          css(ghostEl, 'opacity', '0.8');
          css(ghostEl, 'position', PositionGhostAbsolutely ? 'absolute' : 'fixed');
          css(ghostEl, 'zIndex', '100000');
          css(ghostEl, 'pointerEvents', 'none');
          Sortable.ghost = ghostEl;
          container.appendChild(ghostEl); // Set transform-origin

          css(
            ghostEl,
            'transform-origin',
            (tapDistanceLeft / parseInt(ghostEl.style.width)) * 100 +
              '% ' +
              (tapDistanceTop / parseInt(ghostEl.style.height)) * 100 +
              '%',
          );
        }
      },
      _onDragStart: function _onDragStart(
        /**Event*/
        evt,
        /**boolean*/
        fallback,
      ) {
        var _this = this;

        var dataTransfer = evt.dataTransfer;
        var options = _this.options;
        pluginEvent('dragStart', this, {
          evt: evt,
        });

        if (Sortable.eventCanceled) {
          this._onDrop();

          return
        }

        pluginEvent('setupClone', this);

        if (!Sortable.eventCanceled) {
          cloneEl = clone$1(dragEl);
          cloneEl.draggable = false;
          cloneEl.style['will-change'] = '';

          this._hideClone();

          toggleClass(cloneEl, this.options.chosenClass, false);
          Sortable.clone = cloneEl;
        } // #1143: IFrame support workaround

        _this.cloneId = _nextTick(function () {
          pluginEvent('clone', _this);
          if (Sortable.eventCanceled) return

          if (!_this.options.removeCloneOnHide) {
            rootEl.insertBefore(cloneEl, dragEl);
          }

          _this._hideClone();

          _dispatchEvent({
            sortable: _this,
            name: 'clone',
          });
        });
        !fallback && toggleClass(dragEl, options.dragClass, true); // Set proper drop events

        if (fallback) {
          ignoreNextClick = true;
          _this._loopId = setInterval(_this._emulateDragOver, 50);
        } else {
          // Undo what was set in _prepareDragStart before drag started
          off(document, 'mouseup', _this._onDrop);
          off(document, 'touchend', _this._onDrop);
          off(document, 'touchcancel', _this._onDrop);

          if (dataTransfer) {
            dataTransfer.effectAllowed = 'move';
            options.setData && options.setData.call(_this, dataTransfer, dragEl);
          }

          on(document, 'drop', _this); // #1276 fix:

          css(dragEl, 'transform', 'translateZ(0)');
        }

        awaitingDragStarted = true;
        _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
        on(document, 'selectstart', _this);
        moved = true;

        if (Safari) {
          css(document.body, 'user-select', 'none');
        }
      },
      // Returns true - if no further action is needed (either inserted or another condition)
      _onDragOver: function _onDragOver(
        /**Event*/
        evt,
      ) {
        var el = this.el,
          target = evt.target,
          dragRect,
          targetRect,
          revert,
          options = this.options,
          group = options.group,
          activeSortable = Sortable.active,
          isOwner = activeGroup === group,
          canSort = options.sort,
          fromSortable = putSortable || activeSortable,
          vertical,
          _this = this,
          completedFired = false;

        if (_silent) return

        function dragOverEvent(name, extra) {
          pluginEvent(
            name,
            _this,
            _objectSpread(
              {
                evt: evt,
                isOwner: isOwner,
                axis: vertical ? 'vertical' : 'horizontal',
                revert: revert,
                dragRect: dragRect,
                targetRect: targetRect,
                canSort: canSort,
                fromSortable: fromSortable,
                target: target,
                completed: completed,
                onMove: function onMove(target, after) {
                  return _onMove(rootEl, el, dragEl, dragRect, target, getRect(target), evt, after)
                },
                changed: changed,
              },
              extra,
            ),
          );
        } // Capture animation state

        function capture() {
          dragOverEvent('dragOverAnimationCapture');

          _this.captureAnimationState();

          if (_this !== fromSortable) {
            fromSortable.captureAnimationState();
          }
        } // Return invocation when dragEl is inserted (or completed)

        function completed(insertion) {
          dragOverEvent('dragOverCompleted', {
            insertion: insertion,
          });

          if (insertion) {
            // Clones must be hidden before folding animation to capture dragRectAbsolute properly
            if (isOwner) {
              activeSortable._hideClone();
            } else {
              activeSortable._showClone(_this);
            }

            if (_this !== fromSortable) {
              // Set ghost class to new sortable's ghost class
              toggleClass(
                dragEl,
                putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass,
                false,
              );
              toggleClass(dragEl, options.ghostClass, true);
            }

            if (putSortable !== _this && _this !== Sortable.active) {
              putSortable = _this;
            } else if (_this === Sortable.active && putSortable) {
              putSortable = null;
            } // Animation

            if (fromSortable === _this) {
              _this._ignoreWhileAnimating = target;
            }

            _this.animateAll(function () {
              dragOverEvent('dragOverAnimationComplete');
              _this._ignoreWhileAnimating = null;
            });

            if (_this !== fromSortable) {
              fromSortable.animateAll();
              fromSortable._ignoreWhileAnimating = null;
            }
          } // Null lastTarget if it is not inside a previously swapped element

          if ((target === dragEl && !dragEl.animated) || (target === el && !target.animated)) {
            lastTarget = null;
          } // no bubbling and not fallback

          if (!options.dragoverBubble && !evt.rootEl && target !== document) {
            dragEl.parentNode[expando]._isOutsideThisEl(evt.target); // Do not detect for empty insert if already inserted

            !insertion && nearestEmptyInsertDetectEvent(evt);
          }

          !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
          return (completedFired = true)
        } // Call when dragEl has been inserted

        function changed() {
          newIndex = index$1(dragEl);
          newDraggableIndex = index$1(dragEl, options.draggable);

          _dispatchEvent({
            sortable: _this,
            name: 'change',
            toEl: el,
            newIndex: newIndex,
            newDraggableIndex: newDraggableIndex,
            originalEvent: evt,
          });
        }

        if (evt.preventDefault !== void 0) {
          evt.cancelable && evt.preventDefault();
        }

        target = closest(target, options.draggable, el, true);
        dragOverEvent('dragOver');
        if (Sortable.eventCanceled) return completedFired

        if (
          dragEl.contains(evt.target) ||
          (target.animated && target.animatingX && target.animatingY) ||
          _this._ignoreWhileAnimating === target
        ) {
          return completed(false)
        }

        ignoreNextClick = false;

        if (
          activeSortable &&
          !options.disabled &&
          (isOwner
            ? canSort || (revert = !rootEl.contains(dragEl)) // Reverting item into the original list
            : putSortable === this ||
              ((this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) &&
                group.checkPut(this, activeSortable, dragEl, evt)))
        ) {
          vertical = this._getDirection(evt, target) === 'vertical';
          dragRect = getRect(dragEl);
          dragOverEvent('dragOverValid');
          if (Sortable.eventCanceled) return completedFired

          if (revert) {
            parentEl = rootEl; // actualization

            capture();

            this._hideClone();

            dragOverEvent('revert');

            if (!Sortable.eventCanceled) {
              if (nextEl) {
                rootEl.insertBefore(dragEl, nextEl);
              } else {
                rootEl.appendChild(dragEl);
              }
            }

            return completed(true)
          }

          var elLastChild = lastChild(el, options.draggable);

          if (!elLastChild || (_ghostIsLast(evt, vertical, this) && !elLastChild.animated)) {
            // If already at end of list: Do not insert
            if (elLastChild === dragEl) {
              return completed(false)
            } // assign target only if condition is true

            if (elLastChild && el === evt.target) {
              target = elLastChild;
            }

            if (target) {
              targetRect = getRect(target);
            }

            if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
              capture();
              el.appendChild(dragEl);
              parentEl = el; // actualization

              changed();
              return completed(true)
            }
          } else if (target.parentNode === el) {
            targetRect = getRect(target);
            var direction = 0,
              targetBeforeFirstSwap,
              differentLevel = dragEl.parentNode !== el,
              differentRowCol = !_dragElInRowColumn(
                (dragEl.animated && dragEl.toRect) || dragRect,
                (target.animated && target.toRect) || targetRect,
                vertical,
              ),
              side1 = vertical ? 'top' : 'left',
              scrolledPastTop =
                isScrolledPast(target, 'top', 'top') || isScrolledPast(dragEl, 'top', 'top'),
              scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;

            if (lastTarget !== target) {
              targetBeforeFirstSwap = targetRect[side1];
              pastFirstInvertThresh = false;
              isCircumstantialInvert = (!differentRowCol && options.invertSwap) || differentLevel;
            }

            direction = _getSwapDirection(
              evt,
              target,
              targetRect,
              vertical,
              differentRowCol ? 1 : options.swapThreshold,
              options.invertedSwapThreshold == null
                ? options.swapThreshold
                : options.invertedSwapThreshold,
              isCircumstantialInvert,
              lastTarget === target,
            );
            var sibling;

            if (direction !== 0) {
              // Check if target is beside dragEl in respective direction (ignoring hidden elements)
              var dragIndex = index$1(dragEl);

              do {
                dragIndex -= direction;
                sibling = parentEl.children[dragIndex];
              } while (sibling && (css(sibling, 'display') === 'none' || sibling === ghostEl))
            } // If dragEl is already beside target: Do not insert

            if (direction === 0 || sibling === target) {
              return completed(false)
            }

            lastTarget = target;
            lastDirection = direction;
            var nextSibling = target.nextElementSibling,
              after = false;
            after = direction === 1;

            var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);

            if (moveVector !== false) {
              if (moveVector === 1 || moveVector === -1) {
                after = moveVector === 1;
              }

              _silent = true;
              setTimeout(_unsilent, 30);
              capture();

              if (after && !nextSibling) {
                el.appendChild(dragEl);
              } else {
                target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
              } // Undo chrome's scroll adjustment (has no effect on other browsers)

              if (scrolledPastTop) {
                scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
              }

              parentEl = dragEl.parentNode; // actualization
              // must be done before animation

              if (targetBeforeFirstSwap !== undefined && !isCircumstantialInvert) {
                targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
              }

              changed();
              return completed(true)
            }
          }

          if (el.contains(dragEl)) {
            return completed(false)
          }
        }

        return false
      },
      _ignoreWhileAnimating: null,
      _offMoveEvents: function _offMoveEvents() {
        off(document, 'mousemove', this._onTouchMove);
        off(document, 'touchmove', this._onTouchMove);
        off(document, 'pointermove', this._onTouchMove);
        off(document, 'dragover', nearestEmptyInsertDetectEvent);
        off(document, 'mousemove', nearestEmptyInsertDetectEvent);
        off(document, 'touchmove', nearestEmptyInsertDetectEvent);
      },
      _offUpEvents: function _offUpEvents() {
        var ownerDocument = this.el.ownerDocument;
        off(ownerDocument, 'mouseup', this._onDrop);
        off(ownerDocument, 'touchend', this._onDrop);
        off(ownerDocument, 'pointerup', this._onDrop);
        off(ownerDocument, 'touchcancel', this._onDrop);
        off(document, 'selectstart', this);
      },
      _onDrop: function _onDrop(
        /**Event*/
        evt,
      ) {
        var el = this.el,
          options = this.options; // Get the index of the dragged element within its parent

        newIndex = index$1(dragEl);
        newDraggableIndex = index$1(dragEl, options.draggable);
        pluginEvent('drop', this, {
          evt: evt,
        });
        parentEl = dragEl && dragEl.parentNode; // Get again after plugin event

        newIndex = index$1(dragEl);
        newDraggableIndex = index$1(dragEl, options.draggable);

        if (Sortable.eventCanceled) {
          this._nulling();

          return
        }

        awaitingDragStarted = false;
        isCircumstantialInvert = false;
        pastFirstInvertThresh = false;
        clearInterval(this._loopId);
        clearTimeout(this._dragStartTimer);

        _cancelNextTick(this.cloneId);

        _cancelNextTick(this._dragStartId); // Unbind events

        if (this.nativeDraggable) {
          off(document, 'drop', this);
          off(el, 'dragstart', this._onDragStart);
        }

        this._offMoveEvents();

        this._offUpEvents();

        if (Safari) {
          css(document.body, 'user-select', '');
        }

        css(dragEl, 'transform', '');

        if (evt) {
          if (moved) {
            evt.cancelable && evt.preventDefault();
            !options.dropBubble && evt.stopPropagation();
          }

          ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);

          if (rootEl === parentEl || (putSortable && putSortable.lastPutMode !== 'clone')) {
            // Remove clone(s)
            cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
          }

          if (dragEl) {
            if (this.nativeDraggable) {
              off(dragEl, 'dragend', this);
            }

            _disableDraggable(dragEl);

            dragEl.style['will-change'] = ''; // Remove classes
            // ghostClass is added in dragStarted

            if (moved && !awaitingDragStarted) {
              toggleClass(
                dragEl,
                putSortable ? putSortable.options.ghostClass : this.options.ghostClass,
                false,
              );
            }

            toggleClass(dragEl, this.options.chosenClass, false); // Drag stop event

            _dispatchEvent({
              sortable: this,
              name: 'unchoose',
              toEl: parentEl,
              newIndex: null,
              newDraggableIndex: null,
              originalEvent: evt,
            });

            if (rootEl !== parentEl) {
              if (newIndex >= 0) {
                // Add event
                _dispatchEvent({
                  rootEl: parentEl,
                  name: 'add',
                  toEl: parentEl,
                  fromEl: rootEl,
                  originalEvent: evt,
                }); // Remove event

                _dispatchEvent({
                  sortable: this,
                  name: 'remove',
                  toEl: parentEl,
                  originalEvent: evt,
                }); // drag from one list and drop into another

                _dispatchEvent({
                  rootEl: parentEl,
                  name: 'sort',
                  toEl: parentEl,
                  fromEl: rootEl,
                  originalEvent: evt,
                });

                _dispatchEvent({
                  sortable: this,
                  name: 'sort',
                  toEl: parentEl,
                  originalEvent: evt,
                });
              }

              putSortable && putSortable.save();
            } else {
              if (newIndex !== oldIndex) {
                if (newIndex >= 0) {
                  // drag & drop within the same list
                  _dispatchEvent({
                    sortable: this,
                    name: 'update',
                    toEl: parentEl,
                    originalEvent: evt,
                  });

                  _dispatchEvent({
                    sortable: this,
                    name: 'sort',
                    toEl: parentEl,
                    originalEvent: evt,
                  });
                }
              }
            }

            if (Sortable.active) {
              /* jshint eqnull:true */
              if (newIndex == null || newIndex === -1) {
                newIndex = oldIndex;
                newDraggableIndex = oldDraggableIndex;
              }

              _dispatchEvent({
                sortable: this,
                name: 'end',
                toEl: parentEl,
                originalEvent: evt,
              }); // Save sorting

              this.save();
            }
          }
        }

        this._nulling();
      },
      _nulling: function _nulling() {
        pluginEvent('nulling', this);
        rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
        savedInputChecked.forEach(function (el) {
          el.checked = true;
        });
        savedInputChecked.length = lastDx = lastDy = 0;
      },
      handleEvent: function handleEvent(
        /**Event*/
        evt,
      ) {
        switch (evt.type) {
          case 'drop':
          case 'dragend':
            this._onDrop(evt);

            break

          case 'dragenter':
          case 'dragover':
            if (dragEl) {
              this._onDragOver(evt);

              _globalDragOver(evt);
            }

            break

          case 'selectstart':
            evt.preventDefault();
            break
        }
      },

      /**
       * Serializes the item into an array of string.
       * @returns {String[]}
       */
      toArray: function toArray() {
        var order = [],
          el,
          children = this.el.children,
          i = 0,
          n = children.length,
          options = this.options;

        for (; i < n; i++) {
          el = children[i];

          if (closest(el, options.draggable, this.el, false)) {
            order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
          }
        }

        return order
      },

      /**
       * Sorts the elements according to the array.
       * @param  {String[]}  order  order of the items
       */
      sort: function sort(order, useAnimation) {
        var items = {},
          rootEl = this.el;
        this.toArray().forEach(function (id, i) {
          var el = rootEl.children[i];

          if (closest(el, this.options.draggable, rootEl, false)) {
            items[id] = el;
          }
        }, this);
        useAnimation && this.captureAnimationState();
        order.forEach(function (id) {
          if (items[id]) {
            rootEl.removeChild(items[id]);
            rootEl.appendChild(items[id]);
          }
        });
        useAnimation && this.animateAll();
      },

      /**
       * Save the current sorting
       */
      save: function save() {
        var store = this.options.store;
        store && store.set && store.set(this);
      },

      /**
       * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
       * @param   {HTMLElement}  el
       * @param   {String}       [selector]  default: `options.draggable`
       * @returns {HTMLElement|null}
       */
      closest: function closest$1(el, selector) {
        return closest(el, selector || this.options.draggable, this.el, false)
      },

      /**
       * Set/get option
       * @param   {string} name
       * @param   {*}      [value]
       * @returns {*}
       */
      option: function option(name, value) {
        var options = this.options;

        if (value === void 0) {
          return options[name]
        } else {
          var modifiedValue = PluginManager.modifyOption(this, name, value);

          if (typeof modifiedValue !== 'undefined') {
            options[name] = modifiedValue;
          } else {
            options[name] = value;
          }

          if (name === 'group') {
            _prepareGroup(options);
          }
        }
      },

      /**
       * Destroy
       */
      destroy: function destroy() {
        pluginEvent('destroy', this);
        var el = this.el;
        el[expando] = null;
        off(el, 'mousedown', this._onTapStart);
        off(el, 'touchstart', this._onTapStart);
        off(el, 'pointerdown', this._onTapStart);

        if (this.nativeDraggable) {
          off(el, 'dragover', this);
          off(el, 'dragenter', this);
        } // Remove draggable attributes

        Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function (el) {
          el.removeAttribute('draggable');
        });

        this._onDrop();

        this._disableDelayedDragEvents();

        sortables.splice(sortables.indexOf(this.el), 1);
        this.el = el = null;
      },
      _hideClone: function _hideClone() {
        if (!cloneHidden) {
          pluginEvent('hideClone', this);
          if (Sortable.eventCanceled) return
          css(cloneEl, 'display', 'none');

          if (this.options.removeCloneOnHide && cloneEl.parentNode) {
            cloneEl.parentNode.removeChild(cloneEl);
          }

          cloneHidden = true;
        }
      },
      _showClone: function _showClone(putSortable) {
        if (putSortable.lastPutMode !== 'clone') {
          this._hideClone();

          return
        }

        if (cloneHidden) {
          pluginEvent('showClone', this);
          if (Sortable.eventCanceled) return // show clone at dragEl or original position

          if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
            rootEl.insertBefore(cloneEl, dragEl);
          } else if (nextEl) {
            rootEl.insertBefore(cloneEl, nextEl);
          } else {
            rootEl.appendChild(cloneEl);
          }

          if (this.options.group.revertClone) {
            this.animate(dragEl, cloneEl);
          }

          css(cloneEl, 'display', '');
          cloneHidden = false;
        }
      },
    };

  function _globalDragOver(
    /**Event*/
    evt,
  ) {
    if (evt.dataTransfer) {
      evt.dataTransfer.dropEffect = 'move';
    }

    evt.cancelable && evt.preventDefault();
  }

  function _onMove(
    fromEl,
    toEl,
    dragEl,
    dragRect,
    targetEl,
    targetRect,
    originalEvent,
    willInsertAfter,
  ) {
    var evt,
      sortable = fromEl[expando],
      onMoveFn = sortable.options.onMove,
      retVal; // Support for new CustomEvent feature

    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent('move', {
        bubbles: true,
        cancelable: true,
      });
    } else {
      evt = document.createEvent('Event');
      evt.initEvent('move', true, true);
    }

    evt.to = toEl;
    evt.from = fromEl;
    evt.dragged = dragEl;
    evt.draggedRect = dragRect;
    evt.related = targetEl || toEl;
    evt.relatedRect = targetRect || getRect(toEl);
    evt.willInsertAfter = willInsertAfter;
    evt.originalEvent = originalEvent;
    fromEl.dispatchEvent(evt);

    if (onMoveFn) {
      retVal = onMoveFn.call(sortable, evt, originalEvent);
    }

    return retVal
  }

  function _disableDraggable(el) {
    el.draggable = false;
  }

  function _unsilent() {
    _silent = false;
  }

  function _ghostIsLast(evt, vertical, sortable) {
    var rect = getRect(lastChild(sortable.el, sortable.options.draggable));
    var spacer = 10;
    return vertical
      ? evt.clientX > rect.right + spacer ||
          (evt.clientX <= rect.right && evt.clientY > rect.bottom && evt.clientX >= rect.left)
      : (evt.clientX > rect.right && evt.clientY > rect.top) ||
          (evt.clientX <= rect.right && evt.clientY > rect.bottom + spacer)
  }

  function _getSwapDirection(
    evt,
    target,
    targetRect,
    vertical,
    swapThreshold,
    invertedSwapThreshold,
    invertSwap,
    isLastTarget,
  ) {
    var mouseOnAxis = vertical ? evt.clientY : evt.clientX,
      targetLength = vertical ? targetRect.height : targetRect.width,
      targetS1 = vertical ? targetRect.top : targetRect.left,
      targetS2 = vertical ? targetRect.bottom : targetRect.right,
      invert = false;

    if (!invertSwap) {
      // Never invert or create dragEl shadow when target movemenet causes mouse to move past the end of regular swapThreshold
      if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
        // multiplied only by swapThreshold because mouse will already be inside target by (1 - threshold) * targetLength / 2
        // check if past first invert threshold on side opposite of lastDirection
        if (
          !pastFirstInvertThresh &&
          (lastDirection === 1
            ? mouseOnAxis > targetS1 + (targetLength * invertedSwapThreshold) / 2
            : mouseOnAxis < targetS2 - (targetLength * invertedSwapThreshold) / 2)
        ) {
          // past first invert threshold, do not restrict inverted threshold to dragEl shadow
          pastFirstInvertThresh = true;
        }

        if (!pastFirstInvertThresh) {
          // dragEl shadow (target move distance shadow)
          if (
            lastDirection === 1
              ? mouseOnAxis < targetS1 + targetMoveDistance // over dragEl shadow
              : mouseOnAxis > targetS2 - targetMoveDistance
          ) {
            return -lastDirection
          }
        } else {
          invert = true;
        }
      } else {
        // Regular
        if (
          mouseOnAxis > targetS1 + (targetLength * (1 - swapThreshold)) / 2 &&
          mouseOnAxis < targetS2 - (targetLength * (1 - swapThreshold)) / 2
        ) {
          return _getInsertDirection(target)
        }
      }
    }

    invert = invert || invertSwap;

    if (invert) {
      // Invert of regular
      if (
        mouseOnAxis < targetS1 + (targetLength * invertedSwapThreshold) / 2 ||
        mouseOnAxis > targetS2 - (targetLength * invertedSwapThreshold) / 2
      ) {
        return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1
      }
    }

    return 0
  }
  /**
   * Gets the direction dragEl must be swapped relative to target in order to make it
   * seem that dragEl has been "inserted" into that element's position
   * @param  {HTMLElement} target       The target whose position dragEl is being inserted at
   * @return {Number}                   Direction dragEl must be swapped
   */

  function _getInsertDirection(target) {
    if (index$1(dragEl) < index$1(target)) {
      return 1
    } else {
      return -1
    }
  }
  /**
   * Generate id
   * @param   {HTMLElement} el
   * @returns {String}
   * @private
   */

  function _generateId(el) {
    var str = el.tagName + el.className + el.src + el.href + el.textContent,
      i = str.length,
      sum = 0;

    while (i--) {
      sum += str.charCodeAt(i);
    }

    return sum.toString(36)
  }

  function _saveInputCheckedState(root) {
    savedInputChecked.length = 0;
    var inputs = root.getElementsByTagName('input');
    var idx = inputs.length;

    while (idx--) {
      var el = inputs[idx];
      el.checked && savedInputChecked.push(el);
    }
  }

  function _nextTick(fn) {
    return setTimeout(fn, 0)
  }

  function _cancelNextTick(id) {
    return clearTimeout(id)
  } // Fixed #973:

  if (documentExists) {
    on(document, 'touchmove', function (evt) {
      if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
        evt.preventDefault();
      }
    });
  } // Export utils

  Sortable.utils = {
    on: on,
    off: off,
    css: css,
    find: find,
    is: function is(el, selector) {
      return !!closest(el, selector, el, false)
    },
    extend: extend$1,
    throttle: throttle,
    closest: closest,
    toggleClass: toggleClass,
    clone: clone$1,
    index: index$1,
    nextTick: _nextTick,
    cancelNextTick: _cancelNextTick,
    detectDirection: _detectDirection,
    getChild: getChild,
  };
  /**
   * Get the Sortable instance of an element
   * @param  {HTMLElement} element The element
   * @return {Sortable|undefined}         The instance of Sortable
   */

  Sortable.get = function (element) {
    return element[expando]
  };
  /**
   * Mount a plugin to Sortable
   * @param  {...SortablePlugin|SortablePlugin[]} plugins       Plugins being mounted
   */

  Sortable.mount = function () {
    for (var _len = arguments.length, plugins = new Array(_len), _key = 0; _key < _len; _key++) {
      plugins[_key] = arguments[_key];
    }

    if (plugins[0].constructor === Array) plugins = plugins[0];
    plugins.forEach(function (plugin) {
      if (!plugin.prototype || !plugin.prototype.constructor) {
        throw 'Sortable: Mounted plugin must be a constructor function, not '.concat(
          {}.toString.call(plugin),
        )
      }

      if (plugin.utils) Sortable.utils = _objectSpread({}, Sortable.utils, plugin.utils);
      PluginManager.mount(plugin);
    });
  };
  /**
   * Create sortable instance
   * @param {HTMLElement}  el
   * @param {Object}      [options]
   */

  Sortable.create = function (el, options) {
    return new Sortable(el, options)
  }; // Export

  Sortable.version = version;

  var drop = function drop(_ref) {
    var originalEvent = _ref.originalEvent,
      putSortable = _ref.putSortable,
      dragEl = _ref.dragEl,
      activeSortable = _ref.activeSortable,
      dispatchSortableEvent = _ref.dispatchSortableEvent,
      hideGhostForTarget = _ref.hideGhostForTarget,
      unhideGhostForTarget = _ref.unhideGhostForTarget;
    if (!originalEvent) return
    var toSortable = putSortable || activeSortable;
    hideGhostForTarget();
    var touch =
      originalEvent.changedTouches && originalEvent.changedTouches.length
        ? originalEvent.changedTouches[0]
        : originalEvent;
    var target = document.elementFromPoint(touch.clientX, touch.clientY);
    unhideGhostForTarget();

    if (toSortable && !toSortable.el.contains(target)) {
      dispatchSortableEvent('spill');
      this.onSpill({
        dragEl: dragEl,
        putSortable: putSortable,
      });
    }
  };

  function Revert() {}

  Revert.prototype = {
    startIndex: null,
    dragStart: function dragStart(_ref2) {
      var oldDraggableIndex = _ref2.oldDraggableIndex;
      this.startIndex = oldDraggableIndex;
    },
    onSpill: function onSpill(_ref3) {
      var dragEl = _ref3.dragEl,
        putSortable = _ref3.putSortable;
      this.sortable.captureAnimationState();

      if (putSortable) {
        putSortable.captureAnimationState();
      }

      var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);

      if (nextSibling) {
        this.sortable.el.insertBefore(dragEl, nextSibling);
      } else {
        this.sortable.el.appendChild(dragEl);
      }

      this.sortable.animateAll();

      if (putSortable) {
        putSortable.animateAll();
      }
    },
    drop: drop,
  };

  _extends(Revert, {
    pluginName: 'revertOnSpill',
  });

  function Remove() {}

  Remove.prototype = {
    onSpill: function onSpill(_ref4) {
      var dragEl = _ref4.dragEl,
        putSortable = _ref4.putSortable;
      var parentSortable = putSortable || this.sortable;
      parentSortable.captureAnimationState();
      dragEl.parentNode && dragEl.parentNode.removeChild(dragEl);
      parentSortable.animateAll();
    },
    drop: drop,
  };

  _extends(Remove, {
    pluginName: 'removeOnSpill',
  });

  class TreeNodes extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        nodes: null,
        childrenData: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      if (this.parent instanceof Component.components.Tree) {
        this.tree = this.parent;
        this.tree.nodesRef = this;
        this.parentNode = null;
      } else {
        this.parentNode = this.parent;
        this.parentNode.nodesRef = this;
        this.tree = this.parentNode.tree;
      }
    }

    _config() {
      const { nodes, childrenData } = this.props;
      const { initExpandLevel } = this.tree.props;
      const expanded =
        initExpandLevel === -1 || initExpandLevel > (this.parentNode ? this.parentNode.level : -1);
      let nodesProps = nodes;
      if (Array.isArray(childrenData)) {
        nodesProps = childrenData.map((item) => {
          return {
            data: item,
          }
        });
      }
      const childDefaults = Component.extendProps(
        {
          component: TreeNode,
          dataToNode: ({ data, node }) => {
            if (isPlainObject(data)) {
              node.props.key = data.key;
              node.props.text = data.text;
              node.props.icon = data.icon;
              node.props.childrenData = data.children;
            }
          },
        },
        this.tree.props.nodeDefaults,
      );
      this.setProps({
        children: nodesProps,
        childDefaults,
        hidden: expanded === false,
      });
    }

    _rendered() {
      const { sortable } = this.tree.props;
      if (sortable !== false) {
        new Sortable(this.element, {
          group: this.key,
          animation: 150,
          fallbackOnBody: true,
          swapThreshold: 0.65,
        });
      }
    }

    iterateNodes() {}
  }

  Component.register(TreeNodes);

  class Tree extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        nodes: null,
        nodeDefaults: {},
        nodeSelectable: {
          onlyleaf: false,
          byClick: true,
          selectedNodeKey: null,
        },
        dataFields: {
          key: 'key',
          text: 'text',
          children: 'children',
          parentKey: 'parentKey',
        },
        flatData: false,
        sortable: false,
        initExpandLevel: -1,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.nodeRefs = {};
      this.selectedNode = null;
    }

    _config() {
      this.nodeRefs = {};
      this.selectedNode = null;

      const { nodes, data, flatData, nodeCheckable } = this.props;
      if (flatData === true) {
        this.setProps({
          data: this._toTreeData(data),
        });
      }

      this._addPropStyle('fit');

      if (nodeCheckable) {
        this.setProps({
          nodeCheckable: Component.extendProps(
            {
              cascadeCheckParent: true,
              cascadeUncheckChildren: true,
              cascade: false,
              showCheckAll: false,
              checkAllText: '??????',
              checkedNodeKeys: [],
            },
            nodeCheckable,
          ),
        });

        this.checkedNodeKeysHash = {};
        if (Array.isArray(this.props.nodeCheckable.checkedNodeKeys)) {
          this.props.nodeCheckable.checkedNodeKeys.forEach((key) => {
            this.checkedNodeKeysHash[key] = true;
          });
        }
      }

      const children = [];
      if (this.props.nodeCheckable && this.props.nodeCheckable.showCheckAll === true) {
        children.push(this._getCheckAllCheckbox());
      }
      children.push({
        component: TreeNodes,
        nodes,
        childrenData: this.props.data,
      });

      this.setProps({
        children: children,
      });
    }

    _dataToNodes() {}

    getData(getOptions, node) {
      getOptions = getOptions || {};
      node = node || this;
      const nodesData = [];
      const childNodes = node.getChildNodes();
      childNodes.forEach((childNode) => {
        const childNodeData = { ...childNode.props.data };
        nodesData.push(childNodeData);

        childNodeData.children = this.getData(getOptions, childNode);
      });

      return nodesData
    }

    getCheckedNodes(node) {
      if (node === undefined) {
        node = this;
      }
      const checkedNodes = [];

      const childNodes = node.getChildNodes();
      childNodes.forEach((childNode) => {
        if (childNode.isChecked() === true) {
          checkedNodes.push(childNode);

          childNode.checkedNodes = this.getCheckedNodes(childNode);
        }
      });

      return checkedNodes
    }

    getCheckedNodeKeys(getOptions, checkedNodeKeys, node) {
      getOptions = getOptions || {};
      checkedNodeKeys = checkedNodeKeys || [];
      node = node || this;
      const childNodes = node.getChildNodes();
      childNodes.forEach((childNode) => {
        if (childNode.isChecked() === true) {
          checkedNodeKeys.push(childNode.key);

          this.getCheckedNodeKeys(getOptions, checkedNodeKeys, childNode);
        }
      });

      return checkedNodeKeys
    }

    getCheckedNodesData(getOptions, node) {
      getOptions = getOptions || { flatData: false };
      node = node || this;
      let checkedNodesData = [];
      const childNodes = node.getChildNodes();
      childNodes.forEach((childNode) => {
        if (childNode.isChecked() === true) {
          const childNodeData = { ...childNode.props.data };
          checkedNodesData.push(childNodeData);

          if (getOptions.flatData === true) {
            checkedNodesData = checkedNodesData.concat(
              this.getCheckedNodesData(getOptions, childNode),
            );
          } else {
            childNodeData.children = this.getCheckedNodesData(getOptions, childNode);
          }
        }
      });

      return checkedNodesData
    }

    getNode(param) {
      let retNode = null;

      if (param instanceof Component) {
        return param
      }

      if (isFunction$1(param)) {
        for (const key in this.nodeRefs) {
          if (this.nodeRefs.hasOwnProperty(key)) {
            if (param.call(this.nodeRefs[key]) === true) {
              retNode = this.nodeRefs[key];
              break
            }
          }
        }
      } else {
        return this.nodeRefs[param]
      }

      return retNode
    }

    getSelectedNode() {
      return this.selectedNode
    }

    getChildNodes() {
      return this.nodesRef.getChildren()
    }

    selectNode(param) {
      const node = this.getNode(param);

      node.select();
    }

    checkAllNodes() {
      Object.keys(this.nodeRefs).forEach((nodeKey) => {
        this.nodeRefs[nodeKey].check({ triggerCheckChange: false });
      });

      this._onCheckChange();
    }

    uncheckAllNodes() {
      Object.keys(this.nodeRefs).forEach((nodeKey) => {
        this.nodeRefs[nodeKey].uncheck({ triggerCheckChange: false });
      });

      this._onCheckChange();
    }

    _onCheckChange(args) {
      const { onCheckChange } = this.props.nodeCheckable;

      this._callHandler(onCheckChange, args);
    }

    _onNodeClick(args) {
      this._callHandler('onNodeClick', args);
    }

    _onNodeSelect(args) {
      const { onNodeSelect } = this.props.nodeSelectable;
      this._callHandler(onNodeSelect, args);
    }

    _toTreeData(arrayData) {
      const { key, parentKey, children } = this.props.dataFields;

      if (!key || key === '' || !arrayData) return []

      if (Array.isArray(arrayData)) {
        const r = [];
        const tmpMap = [];
        arrayData.forEach((item) => {
          tmpMap[item[key]] = item;
        });

        arrayData.forEach((item) => {
          tmpMap[item[key]] = item;

          if (tmpMap[item[parentKey]] && item[key] !== item[parentKey]) {
            if (!tmpMap[item[parentKey]][children]) tmpMap[item[parentKey]][children] = [];
            tmpMap[item[parentKey]][children].push(item);
          } else {
            r.push(item);
          }
        });

        return r
      }

      return [arrayData]
    }

    _getCheckAllCheckbox() {
      const { disabled } = this.props;

      return {
        component: Checkbox,
        classes: {
          'nom-tree-check-all': true,
        },
        text: this.props.nodeCheckable.checkAllText,
        disabled: disabled,
        _created: (inst) => {
          this.checkAllRef = inst;
        },
        // value: this.tree.checkedNodeKeysHash[this.node.key] === true,
        onValueChange: ({ newValue }) => {
          if (newValue === true) {
            this.checkAllNodes();
          } else {
            this.uncheckAllNodes();
          }
        },
      }
    }
  }

  Component.register(Tree);

  var OptionTreeMixin = {
    _created: function () {
      this.checkboxTree = this.parent.parent;
      this.checkboxTree.optionTree = this;
    },
    _config: function () {
      const checkboxTreeProps = this.checkboxTree.props;
      this.setProps({
        disabled: checkboxTreeProps.disabled,
        nodeCheckable: {
          checkedNodeKeys: checkboxTreeProps.value,
          onCheckChange: () => {
            this.checkboxTree._onValueChange();
          },
        },
      });
    },
  };

  class DefaultCheckboxOptionTree extends Tree {
    constructor(props, ...mixins) {
      const defaults = {
        dataFields: {
          key: 'value',
        },
      };

      super(Component.extendProps(defaults, props), OptionTreeMixin, ...mixins);
    }
  }

  class CheckboxTree extends Field {
    constructor(props, ...mixins) {
      const defaults = {
        options: [],
        showCheckAll: false,
        checkAllText: '??????',
        treeDataFields: {},
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { options, showCheckAll, checkAllText, treeDataFields } = this.props;

      this.setProps({
        control: {
          component: DefaultCheckboxOptionTree,
          data: options,
          fit: true,
          dataFields: treeDataFields,
          nodeCheckable: {
            showCheckAll,
            checkAllText,
          },
        },
      });

      super._config();
    }

    getSelectedOptions() {
      return this.optionTree.getCheckedNodesData({ flatData: true })
    }

    _getValue(options) {
      const { valueOptions } = this.props;
      options = extend(
        {
          asString: false,
        },
        valueOptions,
        options,
      );

      const selected = this.getSelectedOptions();
      if (selected !== null && Array.isArray(selected) && selected.length > 0) {
        const vals = selected.map(function (item) {
          return item.value
        });

        if(options.asString){
          return vals.join()
        }
        return vals
      }

      return null
    }

    _getValueText(options, value) {
      const selected =
        value !== undefined ? this._getOptionsByValue(value) : this.getSelectedOptions();
      if (selected !== null && Array.isArray(selected) && selected.length > 0) {
        const vals = selected.map(function (item) {
          return item.text
        });

        return vals
      }

      return null
    }

    _setValue(value, options) {
      if (options === false) {
        options = { triggerChange: false };
      } else {
        options = extend({ triggerChange: true }, options);
      }

      if (value === null) {
        this.optionTree.unselectAllItems({ triggerSelectionChange: options.triggerChange });
      }
      this.optionTree.selectItem(
        function () {
          return this.props.value === value
        },
        { triggerSelectionChange: options.triggerChange },
      );
    }

    _disable() {
      if (this.firstRender === false) {
        this.optionTree.disable();
      }
    }

    _enable() {
      if (this.firstRender === false) {
        this.optionTree.enable();
      }
    }

    _getOptionsByValue(value) {
      let retOptions = null;
      const { options } = this.props;
      if (Array.isArray(value)) {
        retOptions = [];
        for (let i = 0; i < options.length; i++) {
          if (value.indexOf(options[i].value) !== -1) {
            retOptions.push(options[i]);
          }
        }
      }
      return retOptions
    }
  }

  Component.register(CheckboxTree);

  class CollapseItem extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        key: null,
        title: null,
        content: null,
        collapsed: true,
        onChange: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.parent.itemRef[this.props.key] = this;
    }

    _config() {
      const { key, title, content, collapsed } = this.props;
      const that = this;
      this.setProps({
        children: [
          {
            tag: 'div',
            classes: { 'nom-collapse-item-title': true },
            styles: {
              padding: '3px',
            },
            key: key,
            children: [
              {
                ...Component.normalizeIconProps(
                  collapsed ? that.parent.props.icon.default : that.parent.props.icon.open,
                ),
                onClick: function () {
                  if (!that.parent.props.iconOnly) return
                  that._handleCollapse();
                },
              },
              { tag: 'span', children: title },
            ],
            onClick: function () {
              if (that.parent.props.iconOnly) return
              that._handleCollapse();
            },
          },
          {
            tag: 'div',
            classes: { 'nom-collapse-item-content': true },
            styles: {
              padding: '3px',
            },
            hidden: collapsed,
            children: content,
          },
        ],
      });
    }

    close() {
      this.update({
        collapsed: true,
      });
    }

    _handleCollapse() {
      this.setProps({
        collapsed: this.props.collapsed !== true,
      });

      this.update(this.props.collapsed);
      this.parent._onCollapse(this.props.key, !this.props.collapsed);
    }

    _disable() {
      this.element.setAttribute('disabled', 'disabled');
    }
  }

  Component.register(CollapseItem);

  class Collapse extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        activeKey: 1,
        items: null,
        bordered: false,
        icon: {
          default: 'right',
          open: 'up',
        },
        iconOnly: false,
        accordion: false,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.itemRef = [];
    }

    _config() {
      const { activeKey, bordered } = this.props;
      // const that = this
      const items = this.props.items.map(function (item) {
        return {
          component: CollapseItem,
          key: item.key,
          title: item.title,
          content: item.content,
          collapsed: activeKey !== item.key,
          classes: {
            'nom-collapse-bordered': !!bordered,
          },
        }
      });
      this.setProps({
        children: items,
      });
    }

    _disable() {
      this.element.setAttribute('disabled', 'disabled');
    }

    _onCollapse(key, isShown) {
      const that = this;
      this.setProps({
        activeKey: key,
      });
      if (isShown && this.props.accordion) {
        Object.keys(this.itemRef).forEach(function (k) {
          if (k !== key && parseInt(k, 10) !== key) {
            that.itemRef[k].close();
          }
        });
      }
      this.props.onChange &&
        this._callHandler(this.props.onChange, {
          currentKey: key,
          collapsed: !isShown,
        });
    }
  }

  Component.register(Collapse);

  class ConfirmContent extends Component {
      constructor(props, ...mixins) {
          const defaults = {
              title: null,
              description: null,
              icon: null,
              type: null,
          };
          super(Component.extendProps(defaults, props), ...mixins);
      }

      _config() {
          const confirmInst = this.modal;

          const { title, description, icon, action, okText, cancelText } = confirmInst.props;

          const iconProps = icon
              ? Component.extendProps(Component.normalizeIconProps(icon), {
                  classes: { 'nom-confirm-icon': true },
              })
              : null;

          const titleProps = title
              ? Component.extendProps(Component.normalizeTemplateProps(title), {
                  classes: { 'nom-confirm-title': true },
              })
              : null;

          const descriptionProps = description
              ? Component.extendProps(Component.normalizeTemplateProps(description), {
                  classes: { 'nom-confirm-description': true },
              })
              : null;

          const okButtonProps = {
              component: Button,
              styles: {
                  color: 'primary'
              },
              text: okText,
              onClick: () => {
                  confirmInst._handleOk();
              }
          };

          const cancelButtonProps = {
              component: Button,
              text: cancelText,
              onClick: () => {
                  confirmInst._handleCancel();
              }
          };

          let actionProps = {
              component: Cols,
              justify: 'end',
          };
          if (!action) {
              actionProps.items = [okButtonProps, cancelButtonProps];
          }
          else if (isPlainObject(action)) {
              actionProps = Component.extendProps(actionProps, action);
          }
          else if (Array.isArray(action)) {
              actionProps.items = action;
          }

          this.setProps({
              children: [
                  {
                      classes: {
                          'nom-confirm-body': true,
                      },
                      children: [
                          iconProps,
                          {
                              classes: {
                                  'nom-confirm-body-content': true,
                              },
                              children: [titleProps, descriptionProps],
                          },
                      ],
                  },
                  {
                      classes: {
                          'nom-confirm-actions': true,
                      },
                      children: actionProps,
                  },
              ],
          });
      }
  }

  Component.register(ConfirmContent);

  class Confirm extends Modal {
    constructor(props, ...mixins) {
      const defaults = {
        icon: 'question-circle',
        title: null,
        description: null,
        action: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { onOk } = this.props;
      this.setProps({
        content: {
          component: ConfirmContent,
        },
        onOk: (e) => {
          if (onOk(e) !== false) {
            e.sender.close();
          }
        },
      });

      super._config();
    }
  }

  Component.register(Confirm);

  class Container extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        fluid: false,
        // type: null,
        breakpoint: null,
      };

      super(Component.extendProps(defaults, props), mixins);
    }

    _config() {
      this._addPropStyle('breakpoint', 'fluid');
    }
  }

  Component.register(Container);

  const CSS_PREFIX = 'nom-statistic-';

  // ??????????????????????????????
  function formatDecimal(num, groupSeparator, decimalSeparator) {
    const isNegative = num.toString().startWith('-');
    const absoluteValue = num.toString().replace(/^-/, '');

    let result;
    let decimal = '';
    let absoluteInteger = absoluteValue;

    if (absoluteInteger.includes('.')) {
  [absoluteInteger, decimal] = absoluteValue.split('.');
    }

    const len = absoluteInteger.length;
    if (len <= 3) return num.toString()

    let temp = '';
    const remainder = len % 3;
    if (decimal) temp = `${decimalSeparator}${decimal}`;

    if (remainder > 0) {
      result = `${absoluteInteger.slice(0, remainder)},${absoluteInteger
      .slice(remainder, len)
      .match(/\d{3}/g)
      .join(groupSeparator)}${temp}`;
    } else {
      result = `${absoluteInteger.slice(0, len).match(/\d{3}/g).join(groupSeparator)}${temp}`;
    }

    return isNegative ? `-${result}` : result
  }

  class Statistic extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        groupSeparator: ',',
        decimalSeparator: '.',
        precision: 0,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const statisticRef = this;
      const {
        title,
        value,
        precision,
        groupSeparator,
        decimalSeparator,
        formatter,
        prefix,
        suffix,
      } = this.props;

      const valueStr = value ? value.toString() : '';
      // ???????????????????????????
      let formatValue = decimalSeparator ? valueStr.replace(decimalSeparator, '.') : valueStr;

      if (isNumeric(formatValue)) {
        formatValue = isFunction$1(formatter)
          ? formatter(value)
          : formatDecimal(Number(formatValue).toFixed(precision), groupSeparator, decimalSeparator);
      }

      const content = [];

      prefix &&
        content.push({
          tag: 'span',
          _created() {
            statisticRef.prefixRef = this;
          },
          classes: { [`${CSS_PREFIX}content-prefix`]: true },
          children: prefix,
        });

      value &&
        content.push({
          tag: 'span',
          _created() {
            statisticRef.valueRef = this;
          },
          classes: { [`${CSS_PREFIX}content-value`]: true },
          children: formatValue,
        });

      suffix &&
        content.push({
          tag: 'span',
          _created() {
            statisticRef.suffixRef = this;
          },
          classes: { [`${CSS_PREFIX}content-suffix`]: true },
          children: suffix,
        });

      this.setProps({
        children: [
          {
            _created() {
              statisticRef.captionRef = this;
            },
            classes: { [`${CSS_PREFIX}title`]: true },
            children: title,
          },
          {
            classes: { 'nom-statistic-content': true },
            children: content,
          },
        ],
      });
    }
  }

  Component.register(Statistic);

  /**
   * Copyright (c)2005-2009 Matt Kruse (javascripttoolbox.com)
   *
   * Dual licensed under the MIT and GPL licenses.
   * This basically means you can use this code however you want for
   * free, but don't claim to have written it yourself!
   * Donations always accepted: http://www.JavascriptToolbox.com/donate/
   *
   * Please do not link to the .js files on javascripttoolbox.com from
   * your site. Copy the files locally to your server instead.
   *
   */
  /*
  Date functions

  These functions are used to parse, format, and manipulate Date objects.
  See documentation and examples at http://www.JavascriptToolbox.com/lib/date/

  */
  Date.$VERSION = 1.02;

  // Utility function to append a 0 to single-digit numbers
  Date.LZ = function (x) {
    return (x < 0 || x > 9 ? '' : '0') + x
  };
  // Full month names. Change this for local month names
  Date.monthNames = new Array(
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  );
  // Month abbreviations. Change this for local month names
  Date.monthAbbreviations = new Array(
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  );
  // Full day names. Change this for local month names
  Date.dayNames = new Array(
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  );
  // Day abbreviations. Change this for local month names
  Date.dayAbbreviations = new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');
  // Used for parsing ambiguous dates like 1/2/2000 - default to preferring 'American' format meaning Jan 2.
  // Set to false to prefer 'European' format meaning Feb 1
  Date.preferAmericanFormat = true;

  // If the getFullYear() method is not defined, create it
  if (!Date.prototype.getFullYear) {
    Date.prototype.getFullYear = function () {
      const yy = this.getYear();
      return yy < 1900 ? yy + 1900 : yy
    };
  }

  // Parse a string and convert it to a Date object.
  // If no format is passed, try a list of common formats.
  // If string cannot be parsed, return null.
  // Avoids regular expressions to be more portable.
  Date.parseString = function (val, format) {
    // If no format is specified, try a few common formats
    if (typeof format === 'undefined' || format == null || format === '') {
      const generalFormats = new Array(
        'y-M-d',
        'MMM d, y',
        'MMM d,y',
        'y-MMM-d',
        'd-MMM-y',
        'MMM d',
        'MMM-d',
        'd-MMM',
      );
      const monthFirst = new Array('M/d/y', 'M-d-y', 'M.d.y', 'M/d', 'M-d');
      const dateFirst = new Array('d/M/y', 'd-M-y', 'd.M.y', 'd/M', 'd-M');
      const checkList = new Array(
        generalFormats,
        Date.preferAmericanFormat ? monthFirst : dateFirst,
        Date.preferAmericanFormat ? dateFirst : monthFirst,
      );
      for (let i = 0; i < checkList.length; i++) {
        const l = checkList[i];
        for (let j = 0; j < l.length; j++) {
          const d = Date.parseString(val, l[j]);
          if (d != null) {
            return d
          }
        }
      }
      return null
    }

    this.isInteger = function (_val) {
      for (let i = 0; i < _val.length; i++) {
        if ('1234567890'.indexOf(_val.charAt(i)) === -1) {
          return false
        }
      }
      return true
    };
    this.getInt = function (str, i, minlength, maxlength) {
      for (let x = maxlength; x >= minlength; x--) {
        const token = str.substring(i, i + x);
        if (token.length < minlength) {
          return null
        }
        if (this.isInteger(token)) {
          return token
        }
      }
      return null
    };
    val += '';
    format += '';
    let i_val = 0;
    let i_format = 0;
    let c = '';
    let token = '';
    let x;
    let y;
    let year = new Date().getFullYear();
    let month = 1;
    let date = 1;
    let hh = 0;
    let mm = 0;
    let ss = 0;
    let ampm = '';
    while (i_format < format.length) {
      // Get next token from format string
      c = format.charAt(i_format);
      token = '';
      while (format.charAt(i_format) === c && i_format < format.length) {
        token += format.charAt(i_format++);
      }
      // Extract contents of value based on format token
      if (token === 'yyyy' || token === 'yy' || token === 'y') {
        if (token === 'yyyy') {
          x = 4;
          y = 4;
        }
        if (token === 'yy') {
          x = 2;
          y = 2;
        }
        if (token === 'y') {
          x = 2;
          y = 4;
        }
        year = this.getInt(val, i_val, x, y);
        if (year == null) {
          return null
        }
        i_val += year.length;
        if (year.length === 2) {
          if (year > 70) {
            year = 1900 + (year - 0);
          } else {
            year = 2000 + (year - 0);
          }
        }
      } else if (token === 'MMM' || token === 'NNN') {
        month = 0;
        const names =
          token === 'MMM' ? Date.monthNames.concat(Date.monthAbbreviations) : Date.monthAbbreviations;
        for (let i = 0; i < names.length; i++) {
          const month_name = names[i];
          if (
            val.substring(i_val, i_val + month_name.length).toLowerCase() === month_name.toLowerCase()
          ) {
            month = (i % 12) + 1;
            i_val += month_name.length;
            break
          }
        }
        if (month < 1 || month > 12) {
          return null
        }
      } else if (token === 'EE' || token === 'E') {
        const names = token === 'EE' ? Date.dayNames : Date.dayAbbreviations;
        for (let i = 0; i < names.length; i++) {
          const day_name = names[i];
          if (
            val.substring(i_val, i_val + day_name.length).toLowerCase() === day_name.toLowerCase()
          ) {
            i_val += day_name.length;
            break
          }
        }
      } else if (token === 'MM' || token === 'M') {
        month = this.getInt(val, i_val, token.length, 2);
        if (month == null || month < 1 || month > 12) {
          return null
        }
        i_val += month.length;
      } else if (token === 'dd' || token === 'd') {
        date = this.getInt(val, i_val, token.length, 2);
        if (date == null || date < 1 || date > 31) {
          return null
        }
        i_val += date.length;
      } else if (token === 'hh' || token === 'h') {
        hh = this.getInt(val, i_val, token.length, 2);
        if (hh == null || hh < 1 || hh > 12) {
          return null
        }
        i_val += hh.length;
      } else if (token === 'HH' || token === 'H') {
        hh = this.getInt(val, i_val, token.length, 2);
        if (hh == null || hh < 0 || hh > 23) {
          return null
        }
        i_val += hh.length;
      } else if (token === 'KK' || token === 'K') {
        hh = this.getInt(val, i_val, token.length, 2);
        if (hh == null || hh < 0 || hh > 11) {
          return null
        }
        i_val += hh.length;
        hh++;
      } else if (token === 'kk' || token === 'k') {
        hh = this.getInt(val, i_val, token.length, 2);
        if (hh == null || hh < 1 || hh > 24) {
          return null
        }
        i_val += hh.length;
        hh--;
      } else if (token === 'mm' || token === 'm') {
        mm = this.getInt(val, i_val, token.length, 2);
        if (mm == null || mm < 0 || mm > 59) {
          return null
        }
        i_val += mm.length;
      } else if (token === 'ss' || token === 's') {
        ss = this.getInt(val, i_val, token.length, 2);
        if (ss == null || ss < 0 || ss > 59) {
          return null
        }
        i_val += ss.length;
      } else if (token === 'a') {
        if (val.substring(i_val, i_val + 2).toLowerCase() === 'am') {
          ampm = 'AM';
        } else if (val.substring(i_val, i_val + 2).toLowerCase() === 'pm') {
          ampm = 'PM';
        } else {
          return null
        }
        i_val += 2;
      } else {
        if (val.substring(i_val, i_val + token.length) !== token) {
          return null
        }

        i_val += token.length;
      }
    }
    // If there are any trailing characters left in the value, it doesn't match
    if (i_val !== val.length) {
      return null
    }
    // Is date valid for month?
    if (month === 2) {
      // Check for leap year
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        // leap year
        if (date > 29) {
          return null
        }
      } else if (date > 28) {
        return null
      }
    }
    if (month === 4 || month === 6 || month === 9 || month === 11) {
      if (date > 30) {
        return null
      }
    }
    // Correct hours value
    if (hh < 12 && ampm === 'PM') {
      hh = hh - 0 + 12;
    } else if (hh > 11 && ampm === 'AM') {
      hh -= 12;
    }
    return new Date(year, month - 1, date, hh, mm, ss)
  };

  // Check if a date string is valid
  Date.isValid = function (val, format) {
    return Date.parseString(val, format) != null
  };

  // Check if a date object is before another date object
  Date.prototype.isBefore = function (date2) {
    if (date2 == null) {
      return false
    }
    return this.getTime() < date2.getTime()
  };

  // Check if a date object is after another date object
  Date.prototype.isAfter = function (date2) {
    if (date2 == null) {
      return false
    }
    return this.getTime() > date2.getTime()
  };

  // Check if two date objects have equal dates and times
  Date.prototype.equals = function (date2) {
    if (date2 == null) {
      return false
    }
    return this.getTime() === date2.getTime()
  };

  // Check if two date objects have equal dates, disregarding times
  Date.prototype.equalsIgnoreTime = function (date2) {
    if (date2 == null) {
      return false
    }
    const d1 = new Date(this.getTime()).clearTime();
    const d2 = new Date(date2.getTime()).clearTime();
    return d1.getTime() === d2.getTime()
  };

  // Format a date into a string using a given format string
  Date.prototype.format = function (format) {
    format += '';
    let result = '';
    let i_format = 0;
    let c = '';
    let token = '';
    let y = `${this.getYear()}`;
    const M = this.getMonth() + 1;
    const d = this.getDate();
    const E = this.getDay();
    const H = this.getHours();
    const m = this.getMinutes();
    const s = this.getSeconds();

    // Convert real date parts into formatted versions
    const value = {};
    if (y.length < 4) {
      y = `${+y + 1900}`;
    }
    value.y = `${y}`;
    value.yyyy = y;
    value.yy = y.substring(2, 4);
    value.M = M;
    value.MM = Date.LZ(M);
    value.MMM = Date.monthNames[M - 1];
    value.NNN = Date.monthAbbreviations[M - 1];
    value.d = d;
    value.dd = Date.LZ(d);
    value.E = Date.dayAbbreviations[E];
    value.EE = Date.dayNames[E];
    value.H = H;
    value.HH = Date.LZ(H);
    if (H === 0) {
      value.h = 12;
    } else if (H > 12) {
      value.h = H - 12;
    } else {
      value.h = H;
    }
    value.hh = Date.LZ(value.h);
    value.K = value.h - 1;
    value.k = value.H + 1;
    value.KK = Date.LZ(value.K);
    value.kk = Date.LZ(value.k);
    if (H > 11) {
      value.a = 'PM';
    } else {
      value.a = 'AM';
    }
    value.m = m;
    value.mm = Date.LZ(m);
    value.s = s;
    value.ss = Date.LZ(s);
    while (i_format < format.length) {
      c = format.charAt(i_format);
      token = '';
      while (format.charAt(i_format) === c && i_format < format.length) {
        token += format.charAt(i_format++);
      }
      if (typeof value[token] !== 'undefined') {
        result += value[token];
      } else {
        result += token;
      }
    }
    return result
  };

  // Get the full name of the day for a date
  Date.prototype.getDayName = function () {
    return Date.dayNames[this.getDay()]
  };

  // Get the abbreviation of the day for a date
  Date.prototype.getDayAbbreviation = function () {
    return Date.dayAbbreviations[this.getDay()]
  };

  // Get the full name of the month for a date
  Date.prototype.getMonthName = function () {
    return Date.monthNames[this.getMonth()]
  };

  // Get the abbreviation of the month for a date
  Date.prototype.getMonthAbbreviation = function () {
    return Date.monthAbbreviations[this.getMonth()]
  };

  // Clear all time information in a date object
  Date.prototype.clearTime = function () {
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this
  };

  // Add an amount of time to a date. Negative numbers can be passed to subtract time.
  Date.prototype.add = function (interval, number) {
    if (
      typeof interval === 'undefined' ||
      interval == null ||
      typeof number === 'undefined' ||
      number == null
    ) {
      return this
    }
    number = +number;
    if (interval === 'y') {
      // year
      this.setFullYear(this.getFullYear() + number);
    } else if (interval === 'M') {
      // Month
      this.setMonth(this.getMonth() + number);
    } else if (interval === 'd') {
      // Day
      this.setDate(this.getDate() + number);
    } else if (interval === 'w') {
      // Weekday
      const step = number > 0 ? 1 : -1;
      while (number !== 0) {
        this.add('d', step);
        while (this.getDay() === 0 || this.getDay() === 6) {
          this.add('d', step);
        }
        number -= step;
      }
    } else if (interval === 'h') {
      // Hour
      this.setHours(this.getHours() + number);
    } else if (interval === 'm') {
      // Minute
      this.setMinutes(this.getMinutes() + number);
    } else if (interval === 's') {
      // Second
      this.setSeconds(this.getSeconds() + number);
    }
    return this
  };

  // Countdown
  const timeUnits = [
    ['Y', 1000 * 60 * 60 * 24 * 365], // years
    ['M', 1000 * 60 * 60 * 24 * 30], // months
    ['D', 1000 * 60 * 60 * 24], // days
    ['H', 1000 * 60 * 60], // hours
    ['m', 1000 * 60], // minutes
    ['s', 1000], // seconds
    ['S', 1], // million seconds
  ];

  // function padStart(string, length, chars) {
  //   const strLength = length ? stringSize(string) : 0
  //   return length && strLength < length
  //     ? createPadding(length - strLength, chars) + string
  //     : string || ''
  // }

  function padStart(string, length, chars) {
    if (!string) return ''
    const repeatCount = length - string.length;
    return repeatCount > 0 ? `${chars.repeat(repeatCount)}${string}` : string
  }

  function formatTimeStr(duration, format) {
    let leftDuration = duration;

    const escapeRegex = /\[[^\]]*]/g;
    const keepList = (format.match(escapeRegex) || []).map((str) => str.slice(1, -1));
    const templateText = format.replace(escapeRegex, '[]');

    const replacedText = timeUnits.reduce((current, [name, unit]) => {
      if (current.indexOf(name) !== -1) {
        const value = Math.floor(leftDuration / unit);
        leftDuration -= value * unit;
        return current.replace(new RegExp(`${name}+`, 'g'), (match) => {
          const len = match.length;
          return padStart(value.toString(), len, '0')
        })
      }
      return current
    }, templateText);

    let index = 0;
    return replacedText.replace(escapeRegex, () => {
      const match = keepList[index];
      index += 1;
      return match
    })
  }

  class Countdown extends Statistic {
    constructor(props, ...mixins) {
      const defaults = {
        format: 'HH:mm:ss',
        interval: 3000,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this._interval = null;
    }

    _config() {
      const countdownRef = this;
      this._handleDeadLine();
      this.setProps({ value: countdownRef._flashCountdown(this.props.format) });
      super._config();
    }

    _rendered() {
      // start timer
      this._startCountdown();
    }

    _remove() {
      clearInterval(this._interval);
      this._interval = undefined;
    }

    _handleDeadLine() {
      const { value } = this.props;
      let deadline = 0;
      if (isDate(value)) {
        deadline = value.getTime();
      } else if (isNumeric(value)) {
        deadline = new Date(value).getTime();
      }
      this._deadline = deadline;
    }

    _startCountdown() {
      const countdownRef = this;
      const { interval, format } = this.props;
      if (this._interval || !isNumeric(interval)) return

      this._interval = setInterval(() => {
        if (countdownRef._deadline < Date.now()) countdownRef._stopCountdown();
        countdownRef.valueRef.element.innerHTML = countdownRef._flashCountdown(format);
      }, interval);
    }

    _stopCountdown() {
      const { onComplete } = this.props;
      if (this._interval) {
        clearInterval(this._interval);
        this._interval = undefined;

        // const timestamp = getTimestamp(value)
        if (isFunction$1(onComplete) && this._deadline < Date.now()) {
          onComplete();
        }
      }
    }

    _flashCountdown(format) {
      const diff = Math.max(this._deadline - Date.now(), 0);
      return formatTimeStr(diff, format)
    }
  }

  Component.register(Countdown);

  class Row extends Component {
    // constructor(props, ...mixins) {
    //   super(props, ...mixins)
    // }
  }

  Component.register(Row);

  class Rows extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        wrap: false,
        items: [],
        itemDefaults: null,
        gutter: 'md',
        childDefaults: {
          component: Row
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this._propStyleClasses = ['gutter', 'align', 'justify'];
      const { items } = this.props;
      const children = [];
      if (Array.isArray(items) && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          item = Component.extendProps({}, this.props.itemDefaults, item);
          children.push({ component: Row, children: item });
        }

        this.setProps({
          children: children,
        });
      }
    }
  }

  Component.register(Rows);

  var SelectListItemMixin = {
      _config: function () {
          const { onSelect, onUnselect } = this.props;

          this.setProps({
              selectable: {
                  byClick: true,
                  canRevert: this.list.selectControl.props.multiple === true,
              },
              onSelect: () => {
                  const { selectControl } = this.list;
                  const selectProps = selectControl.props;

                  const selectedOption = { text: this.props.text, value: this.props.value, option: this.props };
                  if (selectProps.multiple === false) {
                      selectControl.selectedSingle.update(selectedOption);
                      selectControl.popup.hide();
                  } else {
                      selectControl.selectedMultiple.appendItem(selectedOption);
                  }

                  this._callHandler(onSelect);
              },
              onUnselect: () => {
                  const { selectControl } = this.list;
                  const selectProps = selectControl.props;

                  if (selectProps.multiple === true) {
                      selectControl.selectedMultiple.removeItem(this.key);
                  }

                  this._callHandler(onUnselect);
              }

          });
      },
  };

  class SelectList extends List {
    constructor(props, ...mixins) {
      const defaults = {
        gutter: 'x-md',
        cols: 1,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();

      this.selectControl = this.parent.parent.parent.selectControl;
      this.selectControl.optionList = this;
    }

    _config() {
      const {
        showSearch,
        options,
        optionDefaults,
        value,
        multiple,
        filterOption,
      } = this.selectControl.props;
      const { text } = this.props;
      const { checked, checkedOption } = this.selectControl;
      let filterStr = checked ? checkedOption && checkedOption.text : text;
      // null???undefined??????
      filterStr = filterStr || '';
      const filterOptions = showSearch && filterOption(filterStr, options);

      this.setProps({
        items: showSearch ? filterOptions : options,
        itemDefaults: n(null, optionDefaults, null, [SelectListItemMixin]),
        itemSelectable: {
          multiple: multiple,
          byClick: true,
        },
        selectedItems: showSearch ? checkedOption && checkedOption.value : value,

        onItemSelectionChange: () => {
          this.selectControl._onValueChange();
        },
      });

      super._config();
    }
  }

  class SelectPopup extends Popup {
    constructor(props, ...mixins) {
      const defaults = {};

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();

      this.selectControl = this.opener.field;
    }

    _config() {
      this.setProps({
        attrs: {
          style: {
            width: `${this.selectControl.control.offsetWidth()}px`,
          },
        },
        children: {
          component: Layout,
          body: {
            children: {
              component: SelectList,
            },
          },
        },
      });

      super._config();
    }
  }

  Component.register(SelectPopup);

  class Select extends Field {
    constructor(props, ...mixins) {
      const defaults = {
        options: [],
        optionDefaults: {
          key() {
            return this.props.value
          },
          _config: function () {
            this.setProps({
              children: this.props.text,
            });
          },
        },
        selectedSingle: {
          classes: {
            'nom-select-single': true,
          },
          _config: function () {
            this.setProps({
              children: this.props.text,
            });
          },
        },
        selectedMultiple: {
          component: List,
          itemDefaults: {
            _config: function () {
              this.setProps({
                tag: 'span',
                children: this.props.text,
              });
            },
          },
          gutter: 'md',
        },
        multiple: false,
        showArrow: true,
        minItemsForSearch: 20,
        filterOption: (text, options) => options.filter((o) => o.text.indexOf(text) >= 0),
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const that = this;
      const { multiple, showArrow, placeholder, disabled, showSearch } = this.props;
      const children = [];

      this.setProps({
        selectedSingle: {
          _created() {
            that.selectedSingle = this;
          },
        },
        selectedMultiple: {
          itemDefaults: {
            key() {
              return this.props.value
            },
          },
          _created() {
            that.selectedMultiple = this;
          },
        },
      });

      if (multiple) {
        children.push(this.props.selectedMultiple);
      } else if (showSearch) {
        const { onSearch } = this.props;
        that.checked = true;
        that.checkedOption = that._getOption(this.props.value);
        const searchInput = {
          tag: 'input',
          classes: { 'nom-select-search-input': true },
          _created() {
            that.selectedSingle = this;
          },
          _rendered() {
            this.element.value = this.props.text || '';
          },
          attrs: {
            autocomplete: 'false',
            oninput() {
              that.checked = false;
              that.updateSearchPopup(this.value);
              isFunction$1(onSearch) && onSearch(this.value);
            },
            onchange() {
              if (that.checked) return
              this.value = that.checkedOption ? that.checkedOption.text : null;
              that.updateSearchPopup(this.value);
            },
          },
        };

        children.push(searchInput);
      } else {
        children.push(this.props.selectedSingle);
      }

      if (isString(placeholder)) {
        children.push({
          _created() {
            that.placeholder = this;
          },
          classes: { 'nom-select-placeholder': true },
          children: placeholder,
        });
      }

      if (showArrow) {
        children.push({
          component: Icon,
          type: 'down',
          classes: {
            'nom-select-arrow': true,
          },
        });
      }

      this.setProps({
        control: {
          attrs: {
            style: { cursor: 'text' },
          },
          disabled: disabled,
          children: children,
        },
        onClick: () => {
          showSearch && this.selectedSingle.element.focus();
        },
      });

      super._config();
    }

    _rendered() {
      const { value } = this.props;

      this.popup = new SelectPopup({
        trigger: this.control,
        onShow: () => {
          this.optionList.scrollToSelected();
        },
      });

      this._directSetValue(value);

      this._valueChange({ newValue: this.currentValue });
    }

    _directSetValue(value, options) {
      const { valueOptions } = this.props;
      options = extend(
        {
          asArray: false,
        },
        valueOptions,
        options,
      );

      const { multiple } = this.props;
      if (multiple === true) {
        const selValueOptions = this._getOptions(value);
        if (Array.isArray(selValueOptions) && selValueOptions.length) {
          this.selectedMultiple.update({ items: selValueOptions });
          this.currentValue = selValueOptions.map(function (item) {
            return item.value
          });
        } else {
          this.selectedMultiple.unselectAllItems();
        }
      } else {
        if (options.asArray === true) {
          value = Array.isArray(value) ? value[0] : value;
        }
        const selValueOption = this._getOption(value);
        if (selValueOption !== null) {
          this.selectedSingle.update(selValueOption);
          this.currentValue = selValueOption.value;
          if (options.asArray === true) {
            this.currentValue = [selValueOption.value];
          }
        } else {
          this.selectedSingle.emptyChildren();
          this.currentValue = null;
        }
      }
    }

    selectOption(option) {
      this.optionList.selectItem(option);
    }

    selectOptions(options) {
      this.optionList.selectItems(options);
    }

    getSelectedOption() {
      if (!this.optionList) {
        return null
      }
      if (this.props.multiple === false) {
        return this.optionList.getSelectedItem()
      }

      return this.optionList.getSelectedItems()
    }

    _getOptionsByValue(value) {
      if (this.props.multiple === false) {
        return this._getOption(value)
      }

      return this._getOptions(value)
    }

    _getValueText(options, value) {
      const { valueOptions } = this.props;
      options = extend(
        {
          asArray: false,
        },
        valueOptions,
        options,
      );

      if (!this.optionList) {
        value = this.currentValue;
      }

      const selected = value !== undefined ? this._getOptionsByValue(value) : this.getSelectedOption();

      if (selected !== null) {
        if (Array.isArray(selected) && selected.length > 0) {
          const vals = selected.map(function (item) {
            return item.props ? item.props.text : item.text
          });

          return vals
        }
        if (options.asArray === true && !Array.isArray(selected)) {
          return selected.props ? [selected.props.text] : [selected.text]
        }

        if (!Array.isArray(selected)) {
          return selected.props ? selected.props.text : selected.text
        }
      }

      return null
    }

    _getValue(options) {
      const { valueOptions, showSearch } = this.props;
      options = extend(
        {
          asArray: false,
        },
        valueOptions,
        options,
      );

      if (!this.optionList) {
        return this.currentValue
      }

      if (showSearch) {
        const selectedSearch = this.getSelectedOption();
        if (selectedSearch && selectedSearch.props) return selectedSearch.props.value
        return this.currentValue
      }

      const selected = this.getSelectedOption();

      if (selected !== null) {
        if (Array.isArray(selected) && selected.length > 0) {
          const vals = selected.map(function (item) {
            return item.props.value
          });

          return vals
        }
        if (options.asArray === true && !Array.isArray(selected)) {
          return [selected.props.value]
        }

        if (!Array.isArray(selected)) {
          return selected.props.value
        }
      }

      return null
    }

    _setValue(value, options) {
      if (options === false) {
        options = { triggerChange: false };
      } else {
        options = extend({ triggerChange: true }, options);
      }

      if (this.props.showSearch) {
        const selectedOption = this.props.options.find((e) => e.value === value);
        if (selectedOption) {
          this.checked = true;
          this.checkedOption = selectedOption;
          this.updateSearchPopup(selectedOption && selectedOption.text);
          this._directSetValue(value);
        }
      } else {
        if (this.optionList) {
          this.optionList.unselectAllItems({ triggerSelectionChange: false });
          this.selectOptions(value, { triggerSelectionChange: options.triggerChange });
        }

        if (options.triggerChange) {
          this._onValueChange();
        }

        this._directSetValue(value);

        // if (this.optionList) {
        //   this.optionList.unselectAllItems({ triggerSelectionChange: false })
        //   this.selectOptions(value, { triggerSelectionChange: options.triggerChange })
        // } else {
        //   this._directSetValue(value)
        //   if (options.triggerChange) {
        //     this._onValueChange()
        //   }
        // }
      }
    }

    _getOption(value) {
      let option = null;
      const { options } = this.props;
      if (Array.isArray(value)) {
        value = value[0];
      }
      for (let i = 0; i < options.length; i++) {
        if (options[i].value === value) {
          option = options[i];
          break
        }
      }
      return option
    }

    _getOptions(value) {
      let retOptions = null;
      const { options } = this.props;
      if (Array.isArray(value)) {
        retOptions = [];
        for (let i = 0; i < options.length; i++) {
          if (value.indexOf(options[i].value) !== -1) {
            retOptions.push(options[i]);
          }
        }
      }
      return retOptions
    }

    _valueChange(changed) {
      if (this.placeholder) {
        if (
          (Array.isArray(changed.newValue) && changed.newValue.length === 0) ||
          changed.newValue === null ||
          changed.newValue === undefined
        ) {
          this.placeholder.show();
        } else {
          this.placeholder.hide();
        }
      }

      if (this.props.showSearch) {
        const selectedOption = this.props.options.find((e) => e.value === changed.newValue);
        this.checkedOption = selectedOption;
        this.updateSearchPopup(selectedOption && selectedOption.text);
        this.checked = true;
      }
    }

    _disable() {
      if (this.firstRender === false) {
        this.control.disable();
      }
    }

    _enable() {
      if (this.firstRender === false) {
        this.control.enable();
      }
    }

    appendOption() {}

    updateSearchPopup(text) {
      if (this.optionList) this.optionList.update({ text });
    }

    handleFilter(text, options) {
      const { filterOption } = this.props;
      return filterOption(text, options)
    }
  }

  Component.register(Select);

  class DateTimePickerList extends List {
    constructor(props, ...mixins) {
      const defaults = {
        gutter: 'sm',
        cols: 1,
        min: '00',
        max: '59',
        scrollIntoView: false,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();

      this.scroller = this.parent;
      this.timeWrapper = this.parent.parent.parent.parent.parent;
      this.pickerControl = this.timeWrapper.pickerControl;
      this.pickerControl.timeList[this.props.type] = this;
    }

    _config() {
      let items = [];
      const selected = [];
      const that = this;
      this.props.min = this.pickerControl.timeRange[this.props.type][0];
      this.props.max = this.pickerControl.timeRange[this.props.type][1];

      if (this.props.type === 'hour') {
        items = this.pickerControl.getHour();
        !this.pickerControl.empty && selected.push(this.pickerControl.time.hour);
      } else if (this.props.type === 'minute') {
        items = this.pickerControl.getMinute();
        !this.pickerControl.empty && selected.push(this.pickerControl.time.minute);
      } else if (this.props.type === 'second') {
        items = this.pickerControl.getSecond();
        !this.pickerControl.empty && selected.push(this.pickerControl.time.second);
      }

      this.setProps({
        styles: {
          padding: '3px',
        },
        items: items,
        itemSelectable: {
          multiple: false,
          byClick: true,
        },
        attrs: {
          style: {
            position: 'relative',
          },
        },
        selectedItems: selected,
        itemDefaults: {
          _config: function () {
            const key = this.props.key;

            if (key < that.props.min || key > that.props.max) {
              this.setProps({
                disabled: true,
              });
            }
          },
        },

        onItemSelectionChange: () => {
          this.onChange();
        },
      });

      super._config();
    }

    onChange() {
      this.scrollToKey();
      this.setTime();
    }

    setTime() {
      const key = this.getSelectedItem().key || '00';
      this.pickerControl.setTime({
        type: this.props.type,
        value: key,
      });
    }

    resetTime() {
      if (this.pickerControl.defaultValue) {
        const t = this.pickerControl.defaultValue.split(':');

        if (this.props.type === 'hour') {
          // this.selectItem(t[0])
          this.update({ selectedItems: t[0] });
        } else if (this.props.type === 'minute') {
          // this.selectItem(t[1])
          this.update({ selectedItems: t[1] });
        } else {
          // this.selectItem(t[2])
          this.update({ selectedItems: t[2] });
        }
      } else {
        this.unselectAllItems();
      }
    }

    refresh() {
      const selected = [];
      this.getSelectedItem() && selected.push(this.getSelectedItem().props.key);
      this.props.selectedItems = selected;

      this.update();

      this.scrollToKey();
    }

    scrollToKey() {
      const top = this.getSelectedItem() ? this.getSelectedItem().element.offsetTop - 3 : 0;
      this.scroller.element.scrollTop = top;
      // this.scrollToSelected()
    }
  }

  class DateTimePickerWrapper extends Component {
    constructor(props, ...mixins) {
      const defaults = {};

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.pickerControl = this.parent.parent.parent;
    }

    _config() {
      this.setProps({
        children: {
          component: 'Rows',
          gutter: null,
          items: [
            {
              component: 'Cols',
              gutter: null,
              classes: {
                'timepicker-group': true,
              },
              fills: true,
              align: 'stretch',
              children: [
                {
                  hidden: !this.pickerControl.props.format.includes('HH'),
                  children: {
                    component: DateTimePickerList,
                    type: 'hour',
                  },
                },
                {
                  hidden: !this.pickerControl.props.format.includes('mm'),
                  children: {
                    component: DateTimePickerList,
                    type: 'minute',
                  },
                },
                {
                  hidden: !this.pickerControl.props.format.includes('ss'),
                  children: {
                    component: DateTimePickerList,
                    type: 'second',
                  },
                },
              ],
            },
          ],
        },
      });
    }
  }

  Component.register(DateTimePickerWrapper);

  class TimePickerPanel extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        allowClear: true,
        value: null,
        format: 'HH:mm:ss',
        hourStep: 0,
        minuteStep: 0,
        secondStep: 0,
        readOnly: true,
        placeholder: null,
        showNow: true,
        minValue: '10:10:10',
        maxValue: '20:20:20',
        onValueChange: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();

      this.datePicker = this.parent.parent.parent.opener.parent.parent;
      this.datePicker.timePicker = this;

      this.timeList = [];

      this.empty = !this.props.value;

      this.minTime = {
        hour: '00',
        minute: '00',
        second: '00',
      };
      this.maxTime = {
        hour: '23',
        minute: '59',
        second: '59',
      };

      this.time = {
        hour: '00',
        minute: '00',
        second: '00',
      };

      if (this.props.value) {
        const t = this.props.value.split(':');
        this.time.hour = t[0] || '00';
        this.time.minute = t[1] || '00';
        this.time.second = t[2] || '00';
      }

      this.defaultTime = this.time;
    }

    _config() {
      const that = this;
      this.defaultValue = this.props.value;
      if (this.datePicker.props.showTime && this.datePicker.props.showTime !== true) {
        this.props = { ...this.props, ...this.datePicker.props.showTime };
      }

      if (this.props.startTime) {
        const time = new Date(`2000 ${this.props.startTime}`);

        this.minTime = {
          hour: this.getDoubleDigit(time.getHours()),
          minute: this.getDoubleDigit(time.getMinutes()),
          second: this.getDoubleDigit(time.getSeconds()),
        };
      } else if (this.props.minTime) {
        const time = new Date(`2000 ${this.props.minTime}`);

        this.minTime = {
          hour: this.getDoubleDigit(time.getHours()),
          minute: this.getDoubleDigit(time.getMinutes()),
          second: this.getDoubleDigit(time.getSeconds()),
        };
      }
      if (this.props.maxTime) {
        const time = new Date(`2000 ${this.props.maxTime}`);
        this.maxTime = {
          hour: this.getDoubleDigit(time.getHours()),
          minute: this.getDoubleDigit(time.getMinutes()),
          second: this.getDoubleDigit(time.getSeconds()),
        };
      }

      this.timeRange = {
        hour: [this.minTime.hour, this.maxTime.hour],
        minute: ['00', '59'],
        second: ['00', '59'],
      };

      this.setProps({
        children: {
          component: 'Rows',
          gutter: 'xs',
          items: [
            {
              classes: {
                'time-display': true,
              },

              ref: (c) => {
                that.timeText = c;
              },
            },
            {
              component: DateTimePickerWrapper,
            },
          ],
        },
      });

      this.onShow();
      super._config();
    }

    getHour() {
      const hour = [];
      if (this.props.hourStep) {
        hour.push({
          key: '00',
          children: '00',
        });
        for (let i = 0; i < 24; i++) {
          if ((i + 1) % this.props.hourStep === 0 && i !== 23) {
            hour.push({
              key: this.getDoubleDigit(i + 1),
              children: this.getDoubleDigit(i + 1),
            });
          }
        }
        return hour
      }
      for (let i = 0; i < 24; i++) {
        hour.push({
          key: this.getDoubleDigit(i),
          children: this.getDoubleDigit(i),
        });
      }
      return hour
    }

    getMinute() {
      const minute = [];
      if (this.props.minuteStep) {
        minute.push({
          key: '00',
          children: '00',
        });
        for (let i = 0; i < 60; i++) {
          if ((i + 1) % this.props.minuteStep === 0 && i !== 59) {
            minute.push({
              key: this.getDoubleDigit(i + 1),
              children: this.getDoubleDigit(i + 1),
            });
          }
        }
        return minute
      }
      for (let i = 0; i < 60; i++) {
        minute.push({
          key: this.getDoubleDigit(i),
          children: this.getDoubleDigit(i),
        });
      }
      return minute
    }

    getSecond() {
      const second = [];
      if (this.props.secondStep) {
        second.push({
          key: '00',
          children: '00',
        });
        for (let i = 0; i < 60; i++) {
          if ((i + 1) % this.props.secondStep === 0 && i !== 59) {
            second.push({
              key: this.getDoubleDigit(i + 1),
              children: this.getDoubleDigit(i + 1),
            });
          }
        }
        return second
      }
      for (let i = 0; i < 60; i++) {
        second.push({
          key: this.getDoubleDigit(i),
          children: this.getDoubleDigit(i),
        });
      }
      return second
    }

    setValue(c) {
      this.timeText.update({ children: c });
      this.defaultValue = c;
      const t = c.split(':');
      this.time.hour = t[0] || '00';
      this.time.minute = t[1] || '00';
      this.time.second = t[2] || '00';
      this.resetList();
      this.props.onValueChange && this._callHandler(this.props.onValueChange(this.time));
    }

    setTime(data) {
      this.time[data.type] = data.value;

      if (this.time.hour <= this.minTime.hour) {
        this.time.hour = this.minTime.hour;
        if (this.time.minute <= this.minTime.minute) {
          this.time.minute = this.minTime.minute;
        }
        if (this.time.minute <= this.minTime.minute) {
          if (this.time.second <= this.minTime.second) {
            this.time.second = this.minTime.second;
          }
        }
      }
      this.checkTimeRange();
      const result = new Date(
        '2000',
        '01',
        '01',
        this.time.hour,
        this.time.minute,
        this.time.second,
      ).format(this.props.format);

      this.setValue(result);
      this.defaultValue = result;
    }

    resetList() {
      const that = this;

      Object.keys(this.timeList).forEach(function (key) {
        that.timeList[key].resetTime();
        that.timeList[key].scrollToKey();
      });
    }

    clearTime() {
      const that = this;
      this.props.value = null;
      this.defaultValue = null;
      this.defaultTime = this.time = {
        hour: '00',
        minute: '00',
        second: '00',
      };

      this.timeText.update({
        children: '',
      });
      Object.keys(this.timeList).forEach(function (key) {
        that.timeList[key].resetTime();
        that.timeList[key].scrollToKey();
      });
    }

    onShow() {
      this.timeText &&
        this.timeText.update({
          children: this.defaultValue,
        });
      this.resetList();
    }

    setNow() {
      const c = new Date().format('HH:mm:ss');
      const t = c.split(':');
      this.time.hour = t[0];
      this.time.minute = t[1];
      this.time.second = t[2];
      this.checkTimeRange();
      this.setValue(c.format(this.props.format));

      this.defaultValue = c;

      this.empty = false;
      this.resetList();
    }

    handleChange() {
      this.props.onChange && this._callHandler(this.props.onChange);
    }

    getDoubleDigit(num) {
      if (num < 10) {
        return `0${num}`
      }
      return `${num}`
    }

    checkTimeRange() {
      const that = this;

      if (that.time.hour <= that.minTime.hour) {
        that.timeRange.hour = [that.minTime.hour, that.maxTime.hour];
        that.timeRange.minute = [that.minTime.minute, '59'];
        if (that.time.minute <= that.minTime.minute) {
          that.timeRange.second = [that.minTime.second, '59'];
        } else {
          that.timeRange.second = ['00', '59'];
        }
      } else if (that.time.hour >= that.maxTime.hour) {
        that.timeRange.minute = ['00', that.maxTime.minute];
        if (that.time.minute >= that.maxTime.minute) {
          that.timeRange.second = ['00', that.maxTime.second];
        } else {
          that.timeRange.second = ['00', '59'];
        }
      } else {
        that.timeRange.minute = that.timeRange.second = ['00', '59'];
      }

      this.empty = false;
      Object.keys(this.timeList).forEach(function (key) {
        that.timeList[key].refresh();
      });
    }
  }

  Component.register(TimePickerPanel);

  class DatePicker extends Textbox {
    constructor(props, ...mixins) {
      const defaults = {
        format: 'yyyy-MM-dd',
        disabledTime: null,
        minDate: null,
        maxDate: null,
        yearRange: [50, 20],
        showTime: false,
        allowClear: true,
        onChange: null,
        showNow: true,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
      this.dateInfo = null;
      this.todayItem = null;
      this.startTime = null;
    }

    _config() {
      const that = this;
      this.props.value = formatDate(this.props.value, this.props.format);

      const { disabled } = this.props;
      // let currentDate = value !== null ? Date.parseString(value, format) : new Date()
      // if (!currentDate) {
      //   currentDate = new Date()
      // }

      // let year = currentDate.getFullYear()
      // let month = currentDate.getMonth() + 1
      // const day = currentDate.getDate()

      this.getCurrentDate();

      const minTime =
        this.props.showTime && this.props.minDate
          ? new Date(this.props.minDate).format(this.props.showTime.format || 'HH:mm:ss')
          : '00:00:00';

      const maxTime =
        this.props.showTime && this.props.maxDate
          ? new Date(this.props.maxDate).format(this.props.showTime.format || 'HH:mm:ss')
          : '23:59:59';

      this.startTime = minTime;

      this.endTime = maxTime;

      this.props.minDate = this.props.minDate
        ? new Date(this.props.minDate).format('yyyy-MM-dd')
        : null;
      this.props.maxDate = this.props.maxDate
        ? new Date(this.props.maxDate).format('yyyy-MM-dd')
        : null;

      this.showNow = true;

      if (
        (this.props.minDate && new Date().isBefore(new Date(this.props.minDate))) ||
        (this.props.maxDate && new Date().isAfter(new Date(this.props.maxDate)))
      ) {
        this.showNow = false;
      }

      this.setProps({
        leftIcon: 'calendar',
        rightIcon: {
          component: 'Icon',
          type: 'times',
          hidden: !this.props.allowClear,
          onClick: (args) => {
            this.clearTime();
            args.event && args.event.stopPropagation();
          },
        },
        control: {
          disabled: disabled,
          popup: {
            _created: function () {
              that.popup = this;
            },
            styles: {
              padding: '1',
            },
            onShow: () => {
              this.getCurrentDate();
              this.reActiveList();
              that.props.showTime && that.timePicker.onShow();
            },
            onHide: () => {
              that.onPopupHide();
            },
            classes: {
              'nom-date-picker-popup': true,
              'nom-date-picker-with-time': this.props.showTime,
            },
            triggerAction: 'click',

            children: [
              {
                component: 'Cols',
                items: [
                  {
                    component: Rows,
                    attrs: {
                      style: {
                        width: '260px',
                      },
                    },
                    items: [
                      {
                        component: Cols,
                        justify: 'between',
                        fills: true,
                        items: [
                          {
                            component: Select,
                            value: that.year,
                            _created: function () {
                              that.years = this;
                            },
                            options: this._getYears(),
                            onValueChange: (changed) => {
                              that.year = changed.newValue;
                              that.days.update({
                                items: that._getDays(that.year, that.month),
                              });
                            },
                          },
                          {
                            component: Select,
                            value: that.month,
                            _created: function () {
                              that.months = this;
                            },
                            options: this._getMonths(),
                            onValueChange: function (changed) {
                              that.month = changed.newValue;
                              that.days.update({
                                items: that._getDays(that.year, that.month),
                              });
                            },
                          },
                        ],
                      },
                      {
                        component: Cols,
                        items: ['???', '???', '???', '???', '???', '???', '???'],
                        fills: true,
                        gutter: null,
                        itemDefaults: {
                          styles: {
                            text: 'center',
                          },
                        },
                      },
                      {
                        component: List,
                        _created: function () {
                          that.days = this;
                        },
                        gutter: 'sm',
                        cols: 7,
                        // selectedItems: that.props.value
                        //   ? `${that.year}-${that.month}-${that.day}`
                        //   : null,
                        itemSelectable: {
                          byClick: true,
                          multiple: false,
                        },
                        items: this._getDays(that.year, that.month),
                        itemDefaults: {
                          key: function () {
                            this.props.date = new Date(
                              this.props.year,
                              this.props.month - 1,
                              this.props.day,
                            ).format('yyyy-M-d');

                            return this.props.date
                          },
                          styles: {
                            padding: 'd375',
                            hover: {
                              color: 'darken',
                            },
                            selected: {
                              color: 'primary',
                            },
                          },
                          attrs: {
                            role: 'button',
                          },
                          _config: function () {
                            const textStyles = ['center'];
                            const date = that._getDateString(
                              this.props.year,
                              this.props.month,
                              this.props.day,
                            );

                            const isToday = date === new Date().format('yyyy-MM-dd');
                            let isDisabled = false;
                            if (that.props.disabledTime) {
                              isDisabled = that.props.disabledTime(date);
                            }

                            if (
                              that.props.minDate &&
                              new Date(date).isBefore(new Date(that.props.minDate))
                            ) {
                              isDisabled = true;
                            }

                            if (
                              that.props.maxDate &&
                              new Date(date).isAfter(new Date(that.props.maxDate))
                            ) {
                              isDisabled = true;
                            }

                            if (this.props.lastMonth === true || this.props.nextMonth === true) {
                              textStyles.push('muted');
                            }

                            if (isToday) {
                              that.todayItem = this;
                              this.setProps({
                                styles: {
                                  border: ['1px', 'primary'],
                                },
                              });
                            }

                            this.setProps({
                              styles: {
                                text: textStyles,
                              },
                              children: this.props.day,
                              disabled: !!isDisabled,
                            });
                          },
                          onClick: function (args) {
                            const { year: selYear, month: selMonth, day: selDay } = args.sender.props;

                            that.dateInfo = {
                              ...that.dateInfo,
                              ...{
                                year: selYear,
                                month: selMonth - 1,
                                day: selDay,
                              },
                            };

                            if (that.props.minDate && that.props.showTime) {
                              const myday = parseInt(new Date(that.props.minDate).format('d'), 10);
                              if (myday === args.sender.props.day) {
                                that.timePicker.update({
                                  startTime: that.startTime,
                                });
                              } else if (myday < args.sender.props.day) {
                                that.timePicker.update({
                                  startTime: '00:00:00',
                                });
                              }
                            }

                            that.updateValue();

                            that.timePicker && that.timePicker.onShow();
                            !that.props.showTime && that.popup.hide();
                          },
                        },
                      },
                    ],
                  },
                  this.props.showTime && {
                    component: TimePickerPanel,
                    attrs: {
                      style: {
                        'border-left': '1px solid #ddd',
                        'padding-left': '5px',
                      },
                    },
                    onValueChange: (data) => {
                      this.handleTimeChange(data);
                    },
                    startTime: minTime,
                    // value: new Date(this.props.value).format(this.props.showTime.format),
                  },
                ],
              },
              this.props.showNow && {
                component: 'Cols',
                attrs: {
                  style: {
                    padding: '5px 0',
                  },
                },
                items: [
                  {
                    component: 'Button',
                    size: 'small',
                    text: '??????',
                    disabled: !this.showNow,
                    onClick: () => {
                      this.setNow();
                    },
                  },
                ],
              },
            ],
          },
        },
      });

      super._config();
    }

    _getYears() {
      const years = [];
      const thisYear = new Date().getFullYear();

      for (let i = thisYear + this.props.yearRange[1]; i > thisYear - this.props.yearRange[0]; i--) {
        years.push({
          text: i,
          value: i,
        });
      }

      return years
    }

    _getMonths() {
      const months = [];

      for (let i = 1; i < 13; i++) {
        months.push({
          text: i,
          value: i,
        });
      }

      return months
    }

    _getDays(year, month) {
      const firstDay = this._getFirstDayOfMonth(year, month);
      const currentDayCount = this._getDaysInMonth(year, month);
      let lastDayCount = this._getDaysInMonth(year, month - 1);
      const daysList = [];
      let i = 0;
      let lastMonthYear = year;
      let lastMonthMonth = month - 1;
      let nextMonthYear = year;
      let nextMonthMonth = month + 1;

      if (month === 1) {
        lastDayCount = this._getDaysInMonth(year - 1, 12);
        lastMonthYear = year - 1;
        lastMonthMonth = 11;
      }

      if (firstDay > 0) {
        for (i = lastDayCount - firstDay + 1; i < lastDayCount + 1; i++) {
          daysList.push({
            day: i,
            year: lastMonthYear,
            month: lastMonthMonth,
            lastMonth: true,
          });
        }
      }

      for (i = 1; i < currentDayCount + 1; i++) {
        daysList.push({
          day: i,
          year: year,
          month: month,
        });
      }
      const nextMonthCount = 7 - (daysList.length % 7 || 7);
      if (month === 12) {
        nextMonthYear++;
        nextMonthMonth = 1;
      }
      for (i = 1; i < nextMonthCount + 1; i++) {
        daysList.push({
          day: i,
          year: nextMonthYear,
          month: nextMonthMonth,
          nextMonth: true,
        });
      }
      return daysList
    }

    /* ???XX???XX???1??????????????? */
    _getFirstDayOfMonth(year, month) {
      return new Date(year, month - 1, 1).getDay()
    }

    /* ???XX???XX??????????????? */
    _getDaysInMonth(year, month) {
      return 32 - this._daylightSavingAdjust(new Date(year, month - 1, 32)).getDate()
    }

    _getDoubleDigit(num) {
      if (num < 10) {
        return `0${num}`
      }

      return num
    }

    _getDateString(year, month, day) {
      return `${year}-${this._getDoubleDigit(month)}-${this._getDoubleDigit(day)}`
    }

    _daylightSavingAdjust(date) {
      if (!date) {
        return null
      }
      date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
      return date
    }

    _disable() {
      super._disable();
      if (this.firstRender === false) {
        this.control.disable();
      }
    }

    _enable() {
      super._enable();
      if (this.firstRender === false) {
        this.control.enable();
      }
    }

    reActiveList() {
      this.years.setValue(this.year);
      this.months.setValue(this.month);
      this.props.value &&
        this.days.update({ selectedItems: `${this.year}-${this.month}-${this.day}` });
    }

    getCurrentDate() {
      let currentDate =
        this.props.value !== null ? Date.parseString(this.props.value, this.props.format) : new Date();
      if (!currentDate) {
        currentDate = new Date();
      }

      this.year = currentDate.getFullYear();
      this.month = currentDate.getMonth() + 1;
      this.day = currentDate.getDate();

      if (this.props.value && this.props.showTime && this.timePicker) {
        this.timePicker.setValue(new Date(this.props.value).format(this.props.showTime.format));
      } else if (!this.props.value && this.props.showTime && this.timePicker) {
        this.timePicker.clearTime();
      }
    }

    handleTimeChange(param) {
      if (!this.days.getSelectedItem()) {
        this.days.selectItem(this.todayItem);
      }
      this.dateInfo = {
        ...this.dateInfo,
        ...{
          hour: param.hour,
          minute: param.minute,
          second: param.second,
        },
      };

      this.updateValue();
    }

    clearTime() {
      this.props.value = null;
      this.setValue(null);
      this.dateInfo = null;
      this.days && this.days.unselectAllItems();
      if (this.props.showTime && this.timePicker) {
        this.timePicker.clearTime();
      }
    }

    setNow() {
      this.setValue(new Date().format(this.props.format));
      this.popup.hide();
    }

    updateValue() {
      const date = new Date(
        this.dateInfo.year || new Date().format('yyyy'),
        isNumeric(this.dateInfo.month) ? this.dateInfo.month : new Date().format('MM') - 1,
        this.dateInfo.day || new Date().format('dd'),
        this.dateInfo.hour || '00',
        this.dateInfo.minute || '00',
        this.dateInfo.second || '00',
      );

      this.setValue(date.format(this.props.format));
    }

    showPopup() {
      this.popup.show();
    }

    onPopupHide() {
      this.getValue() && this.props.onChange && this._callHandler(this.props.onChange);
    }

    _onBlur() {
      if (!Date.isValid(this.getValue(), this.props.format)) {
        this.input.setText(null);
      }
      super._onBlur();
    }
  }

  Component.register(DatePicker);

  class Group extends Field {
    constructor(props, ...mixins) {
      const defaults = {
        fields: [],
        fieldDefaults: { component: Field },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this._addPropStyle('inline', 'striped', 'line', 'nowrap');
      const { fields, fieldDefaults, value } = this.props;
      const children = [];

      for (let i = 0; i < fields.length; i++) {
        let fieldProps = extend(true, {}, fields[i]);
        if (isPlainObject(value)) {
          if (fieldProps.flatValue === true) {
            fieldProps.value = value;
          } else if (fieldProps.value === null || fieldProps.value === undefined) {
            fieldProps.value = value[fieldProps.name];
          }
        }
        fieldProps.__group = this;
        fieldProps = Component.extendProps(fieldDefaults, fieldProps);
        children.push(fieldProps);
      }

      this.setProps({
        control: { children: children },
      });

      super._config();
    }

    getValue(options) {
      const { valueOptions } = this.props;
      options = extend(
        {
          ignoreDisabled: true,
          ignoreHidden: true,
          merge: false,
        },
        valueOptions,
        options,
      );

      const value = {};
      for (let i = 0; i < this.fields.length; i++) {
        const field = this.fields[i];
        if (field.getValue && this._needHandleValue(field, options)) {
          const fieldValue = field.getValue();
          if (field.props.flatValue === true) {
            extend(value, fieldValue);
          } else {
            value[field.name] = fieldValue;
          }
        }
      }

      if (options.merge === true) {
        return extend(this.currentValue, value)
      }
      return value
    }

    setValue(value, options) {
      options = extend(
        {
          ignoreDisabled: true,
          ignoreHidden: true,
        },
        options,
      );

      for (let i = 0; i < this.fields.length; i++) {
        const field = this.fields[i];
        if (field.setValue && this._needHandleValue(field, options)) {
          let fieldValue = value;
          if (field.props.flatValue === false) {
            if (isPlainObject(value)) {
              fieldValue = value[field.name];
            }
          }
          if (fieldValue === undefined) {
            fieldValue = null;
          }
          field.setValue(fieldValue);
        }
      }
    }

    validate() {
      const invalids = [];
      for (let i = 0; i < this.fields.length; i++) {
        const field = this.fields[i];
        if (field.validate) {
          const valResult = field.validate();

          if (valResult !== true) {
            invalids.push(field);
          }
        }
      }

      if (invalids.length > 0) {
        invalids[0].focus();
      }

      return invalids.length === 0
    }

    getField(fieldName) {
      if (typeof fieldName === 'string') {
        // Handle nested keys, e.g., "foo.bar" "foo[1].bar" "foo[key].bar"
        const parts = fieldName.split('.');
        let curField = this;
        if (parts.length) {
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            curField = curField._getSubField(part);
            if (!curField) {
              break
            }
          }
        }

        return curField
      }
    }

    appendField(fieldProps) {
      const { fieldDefaults } = this.props;
      this.props.fields.push(fieldProps);
      return this.control.appendChild(
        Component.extendProps(fieldDefaults, fieldProps, { __group: this }),
      )
    }

    _getSubField(fieldName) {
      for (let i = 0; i < this.fields.length; i++) {
        const field = this.fields[i];
        if (field.name === fieldName) {
          return field
        }
      }

      return null
    }

    _clear() {
      for (let i = 0; i < this.fields.length; i++) {
        const field = this.fields[i];
        if (field.setValue) {
          field.setValue(null);
        }
      }
    }

    _needHandleValue(field, options) {
      const { disabled, hidden } = field.props;
      if (field._autoName) {
        return false
      }
      if (options.ignoreDisabled && disabled === true) {
        return false
      }
      if (options.ignoreHidden && hidden === true) {
        return false
      }

      return true
    }
  }

  Component.register(Group);

  class DateRangePicker extends Group {
    constructor(props, ...mixins) {
      const defaults = {
        format: 'yyyy-MM-dd',
        disabledTime: null,
        minDate: null,
        maxDate: null,
        yearRange: [50, 20],
        showTime: false,
        allowClear: true,
        onChange: null,
        fieldName: {
          start: 'start',
          end: 'end',
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
    }

    _config() {
      const that = this;
      const { format, allowClear, minDate, maxDate, yearRange, showTime } = this.props;

      this.setProps({
        inline: true,
        fields: [
          {
            component: 'DatePicker',
            name: that.props.fieldName.start,
            placeholder: '????????????',
            ref: (c) => {
              that.startPicker = c;
            },
            onChange: function (args) {
              that.checkRange(args.sender.name);
            },
            format,
            allowClear,
            minDate,
            maxDate,
            yearRange,
            showTime,
          },
          {
            component: 'StaticText',
            value: '-',
          },
          {
            component: 'DatePicker',
            name: that.props.fieldName.end,
            placeholder: '????????????',
            ref: (c) => {
              that.endPicker = c;
            },
            onChange: function (args) {
              that.checkRange(args.sender.name);
            },
            format,
            allowClear,
            minDate,
            maxDate,
            yearRange,
            showTime,
          },
        ],
      });

      super._config();
    }

    handleChange() {
      this.props.onChange && this._callHandler(this.props.onChange);
    }

    checkRange(type) {
      const that = this;
      const active = type === this.props.fieldName.start ? this.startPicker : this.endPicker;
      const opposite = type === this.props.fieldName.start ? this.endPicker : this.startPicker;

      if (active.getValue()) {
        if (active.name === that.props.fieldName.start) {
          opposite.update({ minDate: active.getValue() });
          if (opposite.getValue() && opposite.getValue() < active.getValue()) {
            opposite.clearTime();
            opposite.focus();

            opposite.showPopup();
          } else if (!opposite.getValue()) {
            opposite.focus();

            opposite.showPopup();
          }
        } else if (opposite.getValue() && opposite.getValue() > active.getValue()) {
          opposite.clearTime();
        }
      }

      if (active.getValue() && opposite.getValue()) {
        that.handleChange();
      }
    }
  }

  Component.register(DateRangePicker);

  class Divider extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        type: 'horizontal',
        orientation: 'center',
        // dashed:true,
        // plan:true,
        // children:
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      // this._propStyleClasses = ['type','orientation','dashed','plain']
      const { orientation, classes, dashed, plain } = this.props;

      let { children = undefined } = this.props;
      const hasChildren = !!children;
      const orientationPrefix = orientation.length > 0 ? `-${orientation}` : orientation;

      children = children && {
        tag: 'span',
        classes: {
          'nom-divider-inner-text': true,
        },
        children,
      };
      this.setProps({
        classes: {
          [`nom-divider-with-text`]: hasChildren,
          [`nom-divider-with-text${orientationPrefix}`]: hasChildren,
          [`nom-divider-dashed`]: !!dashed,
          [`nom-divider-plain`]: !!plain,
          ...classes,
        },
        attrs: {
          role: 'separator',
        },
        children,
      });
    }
  }

  Component.register(Divider);

  // ?????????

  // ?????????cm mm in pt pc?????????
  const CSS_UNIT = /^(-)?\d+(.)?\d+[px|rem|em|vw|vh|%]*$/i;

  const VALID_INTEGER = /^[-]?\d+$/;

  const settles = ['top', 'right', 'bottom', 'left'];

  function isValidZIndex(index) {
    return VALID_INTEGER.test(index)
  }

  // /**
  //  *
  //  * @param container dom??????
  //  * @param direction ??????(top,right,bottom,left)
  //  */
  // export function getRelativePosition(container) {
  //   if (container instanceof HTMLElement) {
  //     const { top, left, width, height } = container.getBoundingClientRect()
  //     return { width: `${width}px`, height: `${height}px`, left: `${left}px`, top: `${top}px` }
  //   }
  //   return null
  // }

  class Drawer extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        closable: true,
        closeIcon: 'close',
        maskClosable: true,
        showMasker: true,
        settle: 'right',
        okText: '??? ???',
        cancelText: '??? ???',
        onOk: (e) => {
          e.sender.close();
        },
        onCancel: (e) => {
          e.sender.close();
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const drawerRef = this;
      const { zIndex, settle, maskClosable, showMasker, width, height } = this.props;

      // if (!placeGlobal && this.parent && this.parent.element) {
      //   this.parent.element.style.position = 'relative'
      // }

      const _settle = settles.includes(settle) ? settle : 'right';

      let _style = {};

      if (isValidZIndex(zIndex)) {
        _style = { ..._style, 'z-index': zIndex };
      }

      const children = [];

      // mask
      if (showMasker) {
        children.push({
          classes: { 'nom-drawer-mask': true },
        });
      }

      // content
      children.push({
        classes: {
          'nom-drawer-content-wrapper': true,
        },
        attrs: {
          style: ['left', 'right'].includes(_settle)
            ? { ...drawerRef._handleSize(width, 'width') }
            : { ...drawerRef._handleSize(height, 'height') },
        },
        children: drawerRef._handleContent(),
      });

      const _container = this._getContainerElement();

      if (_container !== document.body) {
        // this.referenceElement = _container instanceof Component ? _container.element : _container
        this.referenceElement = _container;
        _container.style.position = 'relative';
        _style = { ..._style, position: 'absolute' };
      }

      this.setProps({
        classes: {
          // [`nom-drawer-${_settle}`]: true,
          'nom-drawer-top': _settle === 'top',
          'nom-drawer-right': _settle === 'right',
          'nom-drawer-bottom': _settle === 'bottom',
          'nom-drawer-left': _settle === 'left',
        },
        onClick: () => {
          maskClosable && drawerRef.close(drawerRef);
        },
        attrs: {
          style: _style,
        },
        children,
      });
    }

    _handleContent() {
      const drawerRef = this;
      const {
        closable,
        closeIcon,
        title,
        content,
        footer,
        okText,
        cancelText,
        onOk,
        onCancel,
      } = this.props;

      const children = [];

      if (title) {
        children.push({
          classes: {
            'nom-drawer-header': true,
          },
          children: closable
            ? [
                title,
                Component.extendProps(Component.normalizeIconProps(closeIcon), {
                  classes: {
                    'nom-drawer-close-icon': true,
                  },
                  onClick: () => {
                    drawerRef.close();
                  },
                }),
              ]
            : title,
        });
      } else if (closable) {
        children.push({
          classes: {
            'nom-drawer-no-header': true,
          },
          children: Component.extendProps(Component.normalizeIconProps(closeIcon), {
            classes: {
              'nom-drawer-close-icon': true,
            },
            onClick: () => {
              drawerRef.close();
            },
          }),
        });
      }

      children.push({
        classes: {
          'nom-drawer-content': true,
        },
        _config() {
          if (content) {
            this.setProps({ children: content });
          }
        },
      });

      if (footer !== null) {
        children.push({
          classes: {
            'nom-drawer-footer': true,
          },
          _config() {
            if (footer) {
              this.setProps({
                children: footer,
              });
            } else {
              this.setProps({
                children: {
                  component: 'Cols',
                  justify: 'center',
                  items: [
                    {
                      component: 'Button',
                      type: 'primary',
                      text: okText,
                      onClick: () => {
                        drawerRef._callHandler(onOk);
                      },
                    },
                    {
                      component: 'Button',
                      text: cancelText,
                      onClick: () => {
                        drawerRef._callHandler(onCancel);
                      },
                    },
                  ],
                },
              });
            }
          },
        });
      }

      return [
        {
          classes: {
            'nom-drawer-body': true,
          },
          onClick: ({ event }) => {
            event.stopPropagation();
          },
          children,
        },
      ]
    }

    _getRelativePosition(container) {
      if (container instanceof HTMLElement) {
        return container.getBoundingClientRect()
      }
    }

    _getContainerElement() {
      let _containerElement = document.body;
      const { getContainer } = this.props;

      if (isFunction$1(getContainer)) {
        const c = getContainer();

        if (c instanceof Component && c.element) {
          _containerElement = c.element;
        } else if (c instanceof HTMLElement) {
          _containerElement = c;
        }
      }
      return _containerElement
    }

    _getContainerRect(e) {
      if (e instanceof HTMLElement) {
        return e.getBoundingClientRect()
      }

      return null
    }

    close() {
      this.remove();
    }

    _handleSize(size, unit) {
      if (!CSS_UNIT.test(size)) return {}

      return isNumeric(size) ? { [unit]: `${size}px` } : { [unit]: size }
    }

    _animation(visible, x) {
      if (visible) return {}

      return x ? { transform: 'translateX(100%)' } : { transform: 'translateY(100%)' }
    }
  }

  Component.register(Drawer);

  class Dropdown extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'span',
        triggerAction: 'click',
        rightIcon: 'down',
        split: false,
        onClick: null,
        items: [],
        size: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
      this.onClick = this.props.onClick;
    }

    _config() {
      const that = this;
      const { items, triggerAction, split, text, type, size } = this.props;

      const children = [
        split && {
          component: 'Button',
          text: text,
          type: type,
          size: size,
          onClick: (args) => {
            that._callHandler(that.onClick);
            args.event.stopPropagation();
          },
        },
        {
          component: 'Button',
          text: split ? null : that.props.text,
          rightIcon: that.props.rightIcon,
          type: type,
          size: size,
          popup: {
            triggerAction: triggerAction,
            classes: {
              'nom-dropdown-popup': true,
            },
            ref: (c) => {
              that.popup = c;
            },
            children: {
              component: 'Menu',
              itemDefaults: {
                styles: {
                  hover: {
                    color: 'primary',
                  },
                },
                size: size,
              },
              items: items,
            },
            onClick: (args) => {
              args.sender.hide();
            },
          },
        },
      ];

      this.setProps({
        onClick: null,
        children: children,
        classes: {
          'nom-split-button': this.props.split,
        },
      });

      super._config();
    }

    _rendered() {}
  }

  Component.register(Dropdown);

  class Ellipsis extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        text: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this.setProps({
        children: {
          classes: {
            'nom-ellipsis-inner': true,
          },
          children: this.props.text ? this.props.text : this.props.children,
        },
      });
    }
  }

  Component.mixin({
    _config: function () {
      if (this.props.ellipsis === true && this.parent.componentType !== 'Tr') {
        this.setProps({
          classes: {
            'nom-ellipsis-block': true,
          },
        });
      }
    },
  });

  Component.register(Ellipsis);

  class Form extends Group {
    constructor(props, ...mixins) {
      const defaults = {
        labelAlign: 'top'
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }
  }

  Component.register(Form);

  class Spinner extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        spinning: true,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { spinning } = this.props;

      this.setProps({
        classes: {
          'p-type-border': spinning,
        },
      });
    }
  }

  Component.register(Spinner);

  class Loading extends Layer {
    constructor(props, ...mixins) {
      const defaults = {
        align: 'center',
        container: document.body,
        backdrop: true,
        collision: 'none',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this.setProps({
        reference: this.props.container,
        alignTo: this.getElement(this.props.container),
        children: {
          component: Spinner,
        },
      });

      if (this.props.container instanceof Component) {
        this.props.container.addClass('nom-loading-container');
      } else {
        this.props.container.component.addClass('nom-loading-container');
      }

      super._config();
    }

    _remove() {
      if (this.props.container instanceof Component) {
        this.props.container.removeClass('nom-loading-container');
      } else {
        this.props.container.component.removeClass('nom-loading-container');
      }

      super._remove();
    }
  }

  Component.register(Loading);

  class Td extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'td',
        data: null,
        column: {},
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.tr = this.parent;
      this.table = this.tr.table;
    }

    _config() {
      const { level, isLeaf, data: rowData } = this.tr.props;
      const { column } = this.props;
      const { treeConfig } = this.table.props;

      let spanProps = null;

      let children = this.props.data === 0 ? '0' : this.props.data;

      if (isFunction$1(column.cellRender)) {
        children = column.cellRender({
          cell: this,
          row: this.tr,
          talbe: this.table,
          cellData: this.props.data,
          rowData: this.tr.props.data,
          index: this.tr.props.index,
        });
      } else if (isFunction$1(this.props.column.render)) {
        children = this.props.column.render.call(
          this,
          this.props.data,
          this.props.record,
          this.tr.props.index,
        );
      }

      if (isFunction$1(column.cellMerge)) {
        spanProps = column.cellMerge({
          cell: this,
          row: this.tr,
          talbe: this.table,
          cellData: this.props.data,
          rowData: this.tr.props.data,
          index: this.tr.props.index,
        });
      }

      const isTreeNodeColumn = treeConfig.treeNodeColumn && column.field === treeConfig.treeNodeColumn;

      if (isTreeNodeColumn) {
        if (!isLeaf) {
          this.setProps({
            expanded: treeConfig.initExpandLevel === -1 || treeConfig.initExpandLevel > level,
            expandable: {
              byClick: true,
              target: () => {
                return rowData.children.map((subrowData) => {
                  return this.table.grid.rowsRefs[subrowData[this.table.props.keyField]]
                })
              },
              indicator: {
                component: 'Icon',
                classes: { 'nom-tr-expand-indicator': true },
                expandable: {
                  expandedProps: {
                    type: 'down',
                  },
                  collapsedProps: {
                    type: 'right',
                  },
                },
              },
            },
          });
        }

        children = [
          {
            tag: 'span',
            attrs: {
              style: {
                paddingLeft: `${level * treeConfig.indentSize + 20}px`,
              },
            },
          },
          !isLeaf && this.getExpandableIndicatorProps(),
          { tag: 'span', children: children },
        ];
      }

      const colSpan =
        spanProps && spanProps.colSpan !== null && spanProps.colSpan !== undefined
          ? spanProps.colSpan
          : this.props.column.colSpan;

      const rowSpan =
        spanProps && spanProps.rowSpan !== null && spanProps.rowSpan !== undefined
          ? spanProps.rowSpan
          : this.props.column.rowSpan;

      if (rowSpan > 1) {
        this.table.hasRowGroup = true;
      }

      const isEllipsis =
        (this.table.props.ellipsis === 'both' || this.table.props.ellipsis === 'body') &&
        this.props.column.ellipsis !== false;

      const showTitle =
        ((this.table.hasGrid && this.table.grid.props.showTitle) || this.table.props.showTitle) &&
        this.props.column.showTitle !== false;

      this.setProps({
        children: children,
        attrs: {
          colspan: colSpan,
          rowspan: rowSpan,
          'data-field': this.props.column.field,
          title:
            (isString(children) || isNumeric(children)) && (isEllipsis || showTitle)
              ? children
              : null,
        },
        hidden: colSpan === 0 || rowSpan === 0,
        classes: {
          'nom-td-tree-node': isTreeNodeColumn,
          'nom-td-tree-node-leaf': isTreeNodeColumn && isLeaf,
          'nom-table-fixed-left': this.props.column.fixed === 'left',
          'nom-table-fixed-left-last': this.props.column.lastLeft,
          'nom-table-fixed-right': this.props.column.fixed === 'right',
          'nom-table-fixed-right-first': this.props.column.firstRight,
          'nom-table-ellipsis': isEllipsis,
        },
      });
    }

    _rendered() {
      if (this.props.column.fixed === 'left') {
        this._setStyle({ left: `${this.element.offsetLeft}px` });
      } else if (this.props.column.fixed === 'right') {
        this._setStyle({
          right: `${
          this.parent.element.offsetWidth - this.element.offsetLeft - this.element.offsetWidth
        }px`,
        });
      }
    }

    _expand() {
      this.tr._onExpand();
    }

    _collapse() {
      this.tr._onCollapse();
    }
  }

  Component.register(Td);

  class ExpandedTrTd extends Td {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'td',
        data: null,
        column: {},
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.tr = this.parent;
      this.table = this.parent.table;
    }

    _config() {}
  }

  Component.register(ExpandedTrTd);

  class ExpandedTr extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'tr',
        data: {},
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.tbody = this.parent;
      this.table = this.tbody.table;
      this.grid = this.table.grid;
    }

    _config() {
      const { rowExpandable, columns } = this.table.grid.props;
      if (rowExpandable) {
        let normalizedRowExpandable = rowExpandable;
        if (!isPlainObject(rowExpandable)) {
          normalizedRowExpandable = {};
        }

        const { render = () => {} } = normalizedRowExpandable;

        this.setProps({
          children: {
            component: ExpandedTrTd,
            attrs: {
              colspan: columns.length,
            },
            children: render({ row: this, rowData: this.props.data, grid: this.grid }),
          },
        });
      }
    }
  }

  Component.register(ExpandedTr);

  class ColGroupCol extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'col',
        column: {},
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.table = this.parent.table;
      this.table.colRefs[this.props.column.field] = this;
    }

    _config() {
      const { width } = this.props.column;
      let widthPx = null;
      if (width) {
        widthPx = `${width}px`;
      }
      this.setProps({
        attrs: {
          style: {
            width: widthPx,
          },
          'data-field': this.props.column.field || null,
        },
      });
    }
  }

  Component.register(ColGroupCol);

  class ColGroup extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'colgroup',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.table = this.parent;
      this.columns = this.table.props.columns;
      this.colList = [];
      this.hasColumnGroup = false;
    }

    _config() {
      const children = [];

      if (Array.isArray(this.columns)) {
        this.colList = [];
        children.push(...this.createCols(this.columns));
      }

      this.table.colLength = children.length;

      if (
        this.table.parent.componentType === 'GridHeader' &&
        this.table.parent.parent.props.frozenHeader
      ) {
        children.push({
          component: ColGroupCol,
          column: {
            width: 17,
          },
        });
      }

      this.setProps({
        children: children,
      });
    }

    createCols(data) {
      const that = this;
      let index = -1;
      data.forEach(function (column) {
        if (column.children && column.children.length > 0) {
          that.createCols(column.children);
        } else {
          index += 1;
          that.colList.push({
            component: ColGroupCol,
            name: column.field,
            column: column,
            index: index,
          });
        }
      });

      return that.colList
    }
  }

  Component.register(ColGroup);

  class Tr extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'tr',
        data: {},
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.tbody = this.parent;
      this.table = this.tbody.table;
      this.tdList = [];

      if (this.table.hasGrid && this.props.data[this.table.props.keyField]) {
        this.table.grid.rowsRefs[this.props.data[this.table.props.keyField]] = this;
      }
    }

    _config() {
      const columns = this.table.props.columns;
      const { data, level } = this.props;

      const grid = this.table.grid;

      const children = [];
      let hidden = false;
      if (grid) {
        const { treeConfig } = grid.props;
        hidden = treeConfig.initExpandLevel !== -1 && treeConfig.initExpandLevel < level;
      }

      if (Array.isArray(columns)) {
        this.TdList = [];
        children.push(...this.createTds(columns));
      }

      this.setProps({
        key: data[this.table.props.keyField],
        attrs: {
          level: level,
        },
        hidden: hidden,
        children: children,
      });
    }

    check(checkOptions) {
      const grid = this.table.grid;

      checkOptions = extend(
        {
          triggerChange: true,
        },
        checkOptions,
      );
      this._check();
      this._checkboxRef.setValue(true, false);
      grid.changeCheckAllState();
      if (checkOptions.triggerChange) {
        this._onCheck();
        grid._onRowCheck(this);
      }
    }

    _onCheck() {
      this._callHandler('onCheck');
    }

    _check() {
      this.props.checked = true;
      this.addClass('s-checked');
      const grid = this.table.grid;
      grid.checkedRowRefs[this.key] = this;
    }

    uncheck(uncheckOptions) {
      const grid = this.table.grid;
      uncheckOptions = extend(
        {
          triggerChange: true,
        },
        uncheckOptions,
      );
      this._checkboxRef.setValue(false, false);
      this._uncheck();
      grid.changeCheckAllState();
      if (uncheckOptions.triggerChange) {
        this._onUncheck();
        grid._onRowUncheck(this);
      }
    }

    _uncheck() {
      this.props.checked = false;
      this.removeClass('s-checked');
      const grid = this.table.grid;
      delete grid.checkedRowRefs[this.key];
    }

    _onUncheck() {
      this._callHandler('onUncheck');
    }

    createTds(item) {
      const data = this.props.data;
      const that = this;

      item.forEach(function (column) {
        if (column.children && column.children.length > 0) {
          that.createTds(column.children);
        } else {
          that.tdList.push({
            component: Td,
            name: column.field,
            column: column,
            record: data,
            data: accessProp(data, column.field),
          });
        }
      });

      return that.tdList
    }

    _onExpand() {
      this.setProps({
        classes: {
          's-expanded': true,
        },
      });
      this.addClass('s-expanded');
      this._expanded = true;
    }

    _onCollapse() {
      this.setProps({
        classes: {
          's-expanded': false,
        },
      });
      this.removeClass('s-expanded');
      this._expanded = false;
    }

    _show() {
      if (this.firstRender) {
        return
      }
      const { data: rowData } = this.props;

      if (Array.isArray(rowData.children)) {
        rowData.children.forEach((subrowData) => {
          if (this._expanded) {
            const row = this.table.grid.getRow(subrowData);
            row && row.show && row.show();
          }
        });
      }
    }

    _hide() {
      if (this.firstRender) {
        return
      }
      const { data: rowData } = this.props;

      if (Array.isArray(rowData.children)) {
        rowData.children.forEach((subrowData) => {
          const row = this.table.grid.getRow(subrowData);
          row && row.hide && row.hide();
        });
      }
    }
  }

  Component.register(Tr);

  class Tbody extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'tbody',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.table = this.parent;
    }

    _config() {
      const { data = [], rowDefaults, keyField } = this.table.props;
      const rows = [];
      this._getRows(data, rows, 0, 0);

      let props = {
        children: rows,
        childDefaults: Component.extendProps(
          {
            component: Tr,
            key: function () {
              return this.props.data[keyField]
            },
          },
          rowDefaults,
        ),
      };

      if (!rows.length) {
        props = {
          children: {
            tag: 'tr',
            children: {
              tag: 'Td',
              attrs: {
                colspan: this.table.colLength,
                style: {
                  padding: '25px 0',
                },
              },
              children: {
                component: 'Empty',
                description: false,
              },
            },
          },
        };
      }

      this.setProps(props);
    }

    _getRows(data, rows, index, level) {
      const curLevel = level;
      for (const item of data) {
        rows.push({
          component: Tr,
          data: item,
          index: index++,
          level: curLevel,
          isLeaf: !(item.children && item.children.length > 0),
        });

        if (item.children && item.children.length > 0) {
          this._getRows(item.children, rows, index, curLevel + 1);
        }
      }
    }
  }

  Component.register(Tbody);

  class Th extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'th',
        column: {},
        sortDirection: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.tr = this.parent;
      this.table = this.tr.table;
      this.resizer = null;
      this.lastDistance = 0;
    }

    _config() {
      const that = this;
      let sortIcon = 'sort';
      if (this.props.column.sortDirection === 'asc') {
        sortIcon = 'sort-up';
      }

      if (this.props.column.sortDirection === 'desc') {
        sortIcon = 'sort-down';
      }

      const headerProps = {
        tag: 'span',
        children: this.props.column.header || this.props.column.title,
      };

      if (that.props.column.sortable && that.props.column.colSpan > 0) {
        headerProps.onClick = function () {
          that.onSortChange();
        };
      }

      const children = [
        headerProps,
        this.props.column.sortable &&
          this.props.column.colSpan > 0 && {
            component: 'Icon',
            type: sortIcon,
            onClick: function () {
              that.onSortChange();
            },
          },
        that.table.hasGrid &&
          that.table.grid.props.allowFrozenCols && {
            component: 'Icon',
            type: 'pin',
            onClick: function () {
              // that.table.grid.handlePinClick(that.props.column)
            },
          },
        that.table.hasGrid &&
          that.table.grid.props.columnResizable &&
          this.props.column.resizable !== false &&
          this.props.column.colSpan === 1 && {
            component: 'Icon',
            ref: (c) => {
              that.resizer = c;
            },
            type: 'resize-handler',
            classes: { 'nom-table-resize-handler': true },
            onClick: function () {
              // that.table.grid.handlePinClick(that.props.column)
            },
          },
      ];

      const isEllipsis =
        (this.table.props.ellipsis === 'both' || this.table.props.ellipsis === 'header') &&
        this.props.column.ellipsis !== false;

      this.setProps({
        children: children,
        classes: {
          'nom-table-fixed-left': this.props.column.fixed === 'left',
          'nom-table-fixed-left-last': this.props.column.lastLeft,
          'nom-table-fixed-right': this.props.column.fixed === 'right',
          'nom-table-fixed-right-first': this.props.column.firstRight,
          'nom-table-parent-th': this.props.column.colSpan > 1,
          'nom-table-leaf-th': this.props.column.colSpan === 1,
          'nom-table-sortable': !!(this.props.column.sortable && this.props.column.colSpan > 0),
          'nom-table-ellipsis': isEllipsis,
        },
        attrs: {
          colspan: this.props.column.colSpan,
          rowspan: this.props.column.rowSpan,
        },
      });
    }

    _rendered() {
      if (this.props.column.fixed === 'left') {
        this._setStyle({ left: `${this.element.offsetLeft}px` });
      } else if (this.props.column.fixed === 'right') {
        this._setStyle({
          right: `${
          this.parent.element.offsetWidth - this.element.offsetLeft - this.element.offsetWidth
        }px`,
        });
      }

      this.resizer && this.handleResize();
    }

    handleResize() {
      const resizer = this.resizer.element;
      const that = this;

      resizer.onmousedown = function (evt) {
        const startX = evt.clientX;
        that.lastDistance = 0;

        document.onmousemove = function (e) {
          const endX = e.clientX;
          const moveLen = endX - startX;

          const distance = moveLen - that.lastDistance;
          that.table.grid.resizeCol({
            field: that.props.column.field,
            distance: distance,
          });
          that.lastDistance = moveLen;
        };
      };
      document.onmouseup = function () {
        document.onmousemove = null;
      };
    }

    onSortChange() {
      const that = this;
      if (that.props.column.sortDirection === 'asc') {
        that.update({
          column: { ...that.props.column, ...{ sortDirection: 'desc' } },
        });
      } else if (that.props.column.sortDirection === 'desc') {
        that.update({
          column: { ...that.props.column, ...{ sortDirection: null } },
        });
      } else {
        that.update({
          column: { ...that.props.column, ...{ sortDirection: 'asc' } },
        });
      }
      that.table.grid.handleSort(that.props.column);
    }
  }

  Component.register(Th);

  class TheadTr extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'tr',
        columns: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.thead = this.parent;
      this.table = this.thead.table;
    }

    _config() {
      const { columns } = this.props;
      const thArr = [];

      const children =
        Array.isArray(columns) &&
        columns.map(function (column) {
          return {
            component: Th,
            column: column,
          }
        });

      thArr.push(...children);

      this.setProps({
        children: thArr,
      });
    }
  }

  Component.register(TheadTr);

  class Thead extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'thead',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.table = this.parent;
    }

    _config() {
      const columns = this.getColumns();

      const arr = this.mapHeadData(columns);

      const children = [];
      for (let i = 0; i < arr.length; i++) {
        children.push({ component: TheadTr, columns: arr[i] });
      }

      this.setProps({
        children: children,
      });
    }

    getColumns() {
      return this.table.props.columns
    }

    mapHeadData(rootColumns) {
      const rows = [];

      function fillRowCells(columns, colIndex, rowIndex) {
        // Init rows
        rows[rowIndex] = rows[rowIndex] || [];

        let currentColIndex = colIndex;
        const colSpans = columns.filter(Boolean).map((column) => {
          const cell = { ...column };

          let colSpan = 1;

          const subColumns = column.children;
          if (subColumns && subColumns.length > 0) {
            colSpan = fillRowCells(subColumns, currentColIndex, rowIndex + 1).reduce(
              (total, count) => total + count,
              0,
            );
            cell.hasSubColumns = true;
          }

          // if ('colSpan' in column) {
          //   ;({ colSpan } = column)
          // }

          if ('rowSpan' in column) {
            cell.rowSpan = column.rowSpan;
          }

          cell.colSpan = colSpan;
          // cell.colEnd = cell.colStart + colSpan - 1
          rows[rowIndex].push(cell);

          currentColIndex += colSpan;

          return colSpan
        });

        return colSpans
      }

      // Generate `rows` cell data
      fillRowCells(rootColumns, 0, 0);

      // Handle `rowSpan`
      const rowCount = rows.length;

      for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
        rows[rowIndex].forEach((cell) => {
          if (!('rowSpan' in cell) && !cell.hasSubColumns) {
            cell.rowSpan = rowCount - rowIndex;
          }
        });
      }

      return rows
    }
  }

  Component.register(Thead);

  class Table extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'table',
        columns: [],
        rowDefaults: {},
        onlyHead: false,
        onlyBody: false,
        keyField: 'id',
        striped: false,
        treeConfig: {
          childrenField: 'children',
          treeNodeColumn: null,
          initExpandLevel: -1,
          indentSize: 6,
        },
        showTitle: false,
        ellipsis: false,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
      this.colRefs = [];
      this.hasGrid = this.parent.componentType === 'GridHeader' || this.parent.componentType === 'GridBody';

      if (this.hasGrid) {
        this.grid = this.parent.parent;
        this.parent.table = this;
      }
      this.hasRowGroup = false;
    }

    _config() {
      this._propStyleClasses = ['line', 'bordered'];
      const isStriped =
        (this.hasGrid && this.grid.props.striped === true) || this.props.striped === true || false;

      if (this.hasGrid) {
        this.props.ellipsis = this.grid.props.ellipsis;
      }

      this.setProps({
        tag: 'table',
        classes: {
          'nom-table-striped': isStriped,
        },
        children: [
          { component: ColGroup },
          this.props.onlyBody !== true && { component: Thead },
          this.props.onlyHead !== true && { component: Tbody },
        ],
      });
    }

    _rendered() {
      if (this.loadingInst) {
        this.loadingInst.remove();
        this.loadingInst = null;
      }

      if ((this.hasGrid && this.grid.props.autoMergeColumns) || this.hasRowGroup) {
        this.grid.setProps({
          classes: {
            'nom-table-has-row-group': true,
          },
        });
      }
    }

    loading() {
      this.loadingInst = new Loading({
        container: this.parent,
      });
    }
  }

  Component.register(Table);

  class GridBody extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        children: { component: Table },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.grid = this.parent;
      this.grid.body = this;
    }

    _config() {
      this.setProps({
        children: {
          columns: this.grid.props.columns,
          data: this.grid.props.data,
          attrs: {
            style: {
              minWidth: `${this.grid.minWidth}px`,
            },
          },
          onlyBody: true,
          line: this.props.line,
          rowDefaults: this.props.rowDefaults,
          treeConfig: this.grid.props.treeConfig,
          keyField: this.grid.props.keyField,
        },
        attrs: {
          onscroll: () => {
            const { scrollLeft } = this.element;

            this.grid.header.element.scrollLeft = scrollLeft;
          },
        },
      });
    }

    resizeCol(data) {
      const col = this.table.colRefs[data.field];
      const tdWidth = this.table.element.rows[0].cells[col.props.index].offsetWidth;
      const colWidth = col.props.column.width || tdWidth;

      let result = colWidth + data.distance;

      if (result < 60) {
        result = 60;
      }
      col.update({ column: { width: result } });
    }
  }

  Component.register(GridBody);

  class Scrollbar extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        target: null,
        hidden: true,
        position: {
          left: 0,
          bottom: 0,
        },
        size: {
          width: 0,
          innerWidth: 0,
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { position, size } = this.props;

      this.setProps({
        attrs: {
          style: {
            width: size.width,
            left: position.left,
            bottom: position.bottom,
            'overflow-x': 'auto',
            'overflow-y': 'hidden',
          },
          onscroll: () => {
            const { scrollLeft } = this.element;

            this.props.target.body.element.scrollLeft = scrollLeft;
          },
        },
        children: {
          classes: {
            'nom-scrollbar-inner': true,
          },
          attrs: {
            style: {
              width: size.innerWidth,
            },
          },
        },
      });
    }

    show() {
      this.props.hidden &&
        this.update({
          hidden: false,
        });
    }

    hide() {
      !this.props.hidden &&
        this.update({
          hidden: true,
        });
    }

    _remove() {
      this.element.remove();
    }
  }

  Component.register(Scrollbar);

  class GridHeader extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        children: { component: Table },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.grid = this.parent;
      this.grid.header = this;
    }

    _config() {
      this.setProps({
        children: {
          columns: this.grid.props.columns,
          data: this.grid.data,
          attrs: {
            style: {
              minWidth: `${this.grid.minWidth}px`,
            },
          },
          onlyHead: true,
          line: this.props.line,
        },
      });
    }

    _rendered() {
      const that = this;
      if (!this.grid.props.sticky) {
        return
      }
      if (!this.scrollbar) {
        this.scrollbar = new Scrollbar({
          target: this.grid,
        });
      }
      this.position = null;
      this.size = null;

      if (this.grid.props.sticky === true) {
        this.scrollParent = window;
        this.scrollParent.onscroll = function () {
          that._onPageScroll();
        };
      } else {
        if (isFunction$1(this.grid.props.sticky)) {
          this.scrollParent = this.grid.props.sticky();
        } else {
          this.scrollParent = this.grid.props.sticky;
        }

        this.scrollParent._on('scroll', function () {
          that._onPageScroll();
        });
      }
    }

    _remove() {
      this.scrollbar && this.scrollbar._remove();
    }

    _onPageScroll() {
      this.element.style.transform = `translateY(0px)`;
      let pRect = null;
      if (this.grid.props.sticky === true) {
        pRect = {
          top: 0,
          height: window.innerHeight,
        };
      } else {
        pRect = this.scrollParent.element.getBoundingClientRect();
      }
      const gRect = this.grid.element.getBoundingClientRect();

      !this.position &&
        this._setScrollerRect({
          pRect: pRect,
          gRect: gRect,
        });

      this._setScrollerVisible({
        pRect: pRect,
        gRect: gRect,
      });
    }

    _setScrollerRect(data) {
      const { pRect, gRect } = data;
      const innerWidth = this.element.scrollWidth;

      const bottom = window.innerHeight - (pRect.top + pRect.height);

      this.position = {
        left: `${gRect.left}px`,
        bottom: `${bottom < 0 ? 0 : bottom}px`,
      };
      this.size = {
        width: `${gRect.width}px`,
        innerWidth: `${innerWidth}px`,
      };

      this.scrollbar.update({
        position: this.position,
        size: this.size,
      });
    }

    _setScrollerVisible(data) {
      const { pRect, gRect } = data;

      if (gRect.top < pRect.top && gRect.top + gRect.height > pRect.top) {
        this.element.style.transform = `translateY(${pRect.top - gRect.top - 2}px)`;
      }

      if (gRect.height > pRect.height) {
        if (gRect.top > pRect.height || gRect.top + gRect.height - 17 < pRect.height + pRect.top) {
          this.scrollbar.hide();
        } else {
          this.scrollbar.show();
        }
      } else {
        this.scrollbar.hide();
      }
    }

    resizeCol(data) {
      const col = this.table.colRefs[data.field];
      const tdWidth = this.table.element.rows[0].cells[col.props.index].offsetWidth;
      const colWidth = col.props.column.width || tdWidth;

      let result = colWidth + data.distance;

      if (result < 60) {
        result = 60;
      }
      col.update({ column: { width: result } });
    }
  }

  Component.register(GridHeader);

  class GridSettingPopup extends Layer {
    constructor(props, ...mixins) {
      const defaults = {};

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
      this.grid = this.props.grid;
      this.tree = null;
    }

    _config() {
      const that = this;

      this.setProps({
        classes: {
          'nom-grid-setting-panel': true,
        },
        styles: {
          shadow: 'sm',
          rounded: 'md',
        },

        children: {
          component: 'Panel',
          uistyle: 'card',
          fit: true,
          header: {
            caption: {
              title: '?????????',
            },
          },
          body: {
            children: {
              component: 'Tree',
              showline: true,
              data: that.grid.originColumns,
              nodeCheckable: {
                checkedNodeKeys: that.grid.props.visibleColumns
                  ? that.getMappedColumns(that.grid.props.visibleColumns)
                  : that.grid.getMappedColumns(),
              },
              multiple: true,
              leafOnly: false,
              sortable: true,

              ref: (c) => {
                this.tree = c;
              },
              dataFields: {
                text: 'title',
                key: 'field',
              },
            },
          },
          footer: {
            children: {
              component: 'Cols',
              gutter: 'sm',
              items: [
                {
                  component: 'Button',
                  text: '??????',
                  onClick: function () {
                    const list = that.tree.getCheckedNodesData();
                    that.grid.handleColumnsSetting(list);
                  },
                },
                {
                  component: 'Button',
                  text: '??????',
                  onClick: () => {
                    this.hide();
                  },
                },
              ],
            },
          },
        },
      });

      super._config();
    }

    _rendered() {
      const wh = window.innerHeight;
      const mh = this.element.offsetHeight;
      if (mh + 50 > wh) {
        this.element.style.height = `${wh - 100}px`;
      }
    }

    getMappedColumns(param) {
      const arr = [];
      function mapColumns(data) {
        data.forEach(function (item) {
          if (item.children) {
            mapColumns(item.children);
          }
          arr.push(item.field);
        });
      }
      mapColumns(param);
      return arr
    }
  }

  Component.register(GridSettingPopup);

  class Grid extends Component {
    constructor(props, ...mixins) {
      super(Component.extendProps(Grid.defaults, props), ...mixins);
    }

    _created() {
      this.minWidth = 0;
      this.lastSortField = null;
      this.rowsRefs = {};
      this.checkedRowRefs = {};

      this.originColumns = this.props.columns;
      if (this.props.columnsCustomizable && this.props.columnsCustomizable.selected) {
        this.props.visibleColumns = this.props.columnsCustomizable.selected;
      }
    }

    _config() {
      const that = this;
      this._propStyleClasses = ['bordered'];

      const { line, rowDefaults, frozenLeftCols, frozenRightCols } = this.props;

      this._processCheckableColumn();
      this._processExpandableColumn();

      if (this.props.visibleColumns) {
        this.props.columns = this.props.visibleColumns;
      }

      if (frozenLeftCols || frozenRightCols) {
        const rev = this.props.columns.length - frozenRightCols;

        const c = this.props.columns.map(function (n, i) {
          if (i + 1 < frozenLeftCols) {
            return {
              ...{
                fixed: 'left',
              },
              ...n,
            }
          }

          if (i + 1 === frozenLeftCols) {
            return {
              ...{
                fixed: 'left',
                lastLeft: true,
              },
              ...n,
            }
          }

          if (i === rev) {
            return {
              ...{
                fixed: 'right',
                firstRight: true,
              },
              ...n,
            }
          }

          if (i > rev) {
            return {
              ...{
                fixed: 'right',
              },
              ...n,
            }
          }

          return n
        });

        this.props.columns = c;
      }

      this._calcMinWidth();

      this.setProps({
        classes: {
          'm-frozen-header': this.props.frozenHeader,
        },
        children: [
          this.props.columnsCustomizable && {
            children: {
              component: 'Button',
              icon: 'setting',
              size: 'small',
              type: 'text',
              classes: {
                'nom-grid-setting': true,
              },
              tooltip: '?????????',
              onClick: () => {
                that.showSetting();
              },
            },
          },
          { component: GridHeader, line: line },
          { component: GridBody, line: line, rowDefaults: rowDefaults },
        ],
      });
    }

    _calcMinWidth() {
      this.minWidth = 0;
      const { props } = this;
      for (let i = 0; i < props.columns.length; i++) {
        const column = props.columns[i];
        if (column.width) {
          this.minWidth += column.width;
        } else {
          this.minWidth += 120;
        }
      }
    }

    _rendered() {
      if (this.loadingInst) {
        this.loadingInst.remove();
        this.loadingInst = null;
      }

      if (this.props.autoMergeColumns && this.props.autoMergeColumns.length > 0) {
        this.autoMergeCols();
      }
    }

    getColumns() {
      return this.props.columns
    }

    loading() {
      this.loadingInst = new Loading({
        container: this.parent,
      });
    }

    getMappedColumns() {
      const arr = [];
      function mapColumns(data) {
        data.forEach(function (item) {
          if (item.children) {
            mapColumns(item.children);
          }
          arr.push(item.field);
        });
      }
      mapColumns(this.originColumns);

      return arr
    }

    setSortDirection(sorter) {
      const c = this.getColumns().map(function (item) {
        if (item.field === sorter.field) {
          return {
            ...item,
            ...{
              sortDirection: sorter.sortDirection,
            },
          }
        }
        return {
          ...item,
          ...{
            sortDirection: null,
          },
        }
      });

      this.update({ columns: c });
    }

    handleSort(sorter) {
      const key = sorter.field;
      if (!sorter.sortDirection) return

      if (isFunction$1(sorter.sortable)) {
        let arr = [];
        if (this.lastSortField === key) {
          arr = this.props.data.reverse();
        } else {
          arr = this.props.data.sort(sorter.sortable);
        }
        this.setSortDirection(sorter);
        this.update({ data: arr });
        this.lastSortField = key;
        return
      }

      this._callHandler(this.props.onSort, {
        field: sorter.field,
        sortDirection: sorter.sortDirection,
      });

      this.setSortDirection(sorter);
      this.lastSortField = key;
    }

    getRow(param) {
      let result = null;

      if (param instanceof Component) {
        return param
      }

      if (isFunction$1(param)) {
        for (const key in this.rowsRefs) {
          if (this.rowsRefs.hasOwnProperty(key)) {
            if (param.call(this.rowsRefs[key]) === true) {
              result = this.rowsRefs[key];
              break
            }
          }
        }
      } else if (isPlainObject(param)) {
        return this.rowsRefs[param[this.props.keyField]]
      } else {
        return this.rowsRefs[param]
      }

      return result
    }

    getCheckedRows() {
      return Object.keys(this.checkedRowRefs).map((key) => {
        return this.checkedRowRefs[key]
      })
    }

    getCheckedRowKeys() {
      return Object.keys(this.checkedRowRefs).map((key) => {
        return this.checkedRowRefs[key].key
      })
    }

    checkAllRows(options) {
      Object.keys(this.rowsRefs).forEach((key) => {
        this.rowsRefs[key] && this.rowsRefs[key].check(options);
      });
    }

    uncheckAllRows(options) {
      Object.keys(this.rowsRefs).forEach((key) => {
        this.rowsRefs[key] && this.rowsRefs[key].uncheck(options);
      });
    }

    checkRows(rows, options) {
      rows = Array.isArray(rows) ? rows : [rows];
      rows.forEach((row) => {
        const rowRef = this.getRow(row);
        rowRef && rowRef.check(options);
      });
    }

    changeCheckAllState() {
      const checkedRowsLength = Object.keys(this.checkedRowRefs).length;
      if (checkedRowsLength === 0) {
        this._checkboxAllRef.setValue(false, false);
      } else {
        const allRowsLength = Object.keys(this.rowsRefs).length;
        if (allRowsLength === checkedRowsLength) {
          this._checkboxAllRef.setValue(true, false);
        } else {
          this._checkboxAllRef.partCheck(false);
        }
      }
    }

    getKeyValue(rowData) {
      return rowData[this.props.keyField]
    }

    showSetting() {
      this.popup = new GridSettingPopup({
        align: 'center',
        alignTo: window,
        grid: this,
      });
    }

    handleColumnsSetting(params) {
      const tree = params;

      const that = this;
      that.props.visibleColumns = params;

      let treeInfo = null;
      function findTreeInfo(origin, key) {
        origin.forEach(function (item) {
          if (item.children) {
            findTreeInfo(item.children, key);
          }
          if (item.field === key) {
            treeInfo = item;
          }
        });

        if (treeInfo !== null) return treeInfo
      }

      function addTreeInfo(data) {
        data.forEach(function (item) {
          if (item.children) {
            addTreeInfo(item.children);
          }

          const myinfo = findTreeInfo(that.originColumns, item.key);
          if (myinfo) {
            Object.keys(myinfo).forEach(function (key) {
              if (key !== 'children') {
                item[key] = myinfo[key];
              }
            });
          }
        });
      }

      addTreeInfo(tree);

      this.props.columnsCustomizable.callback &&
        this._callHandler(this.props.columnsCustomizable.callback(tree));

      this.update({ columns: tree });
      this.popup.hide();
    }

    _processCheckableColumn() {
      const grid = this;
      const { rowCheckable, columns } = this.props;
      if (rowCheckable) {
        if (columns.filter((item) => item.isChecker).length > 0) {
          return
        }
        let normalizedRowCheckable = rowCheckable;
        if (!isPlainObject(rowCheckable)) {
          normalizedRowCheckable = {};
        }
        const { checkedRowKeys = [] } = normalizedRowCheckable;
        const checkedRowKeysHash = {};
        checkedRowKeys.forEach((rowKey) => {
          checkedRowKeysHash[rowKey] = true;
        });

        columns.unshift({
          width: 50,
          isChecker: true,
          header: {
            component: Checkbox,
            plain: true,
            _created: (inst) => {
              grid._checkboxAllRef = inst;
            },
            onValueChange: (args) => {
              if (args.newValue === true) {
                grid.checkAllRows(false);
              } else {
                grid.uncheckAllRows(false);
              }
            },
          },
          cellRender: ({ row, rowData }) => {
            if (checkedRowKeysHash[row.key] === true) {
              grid.checkedRowRefs[grid.getKeyValue(rowData)] = row;
            }
            return {
              component: Checkbox,
              plain: true,
              _created: (inst) => {
                row._checkboxRef = inst;
              },
              value: checkedRowKeysHash[row.key] === true,
              onValueChange: (args) => {
                if (args.newValue === true) {
                  row._check();
                  row._onCheck();
                  grid._onRowCheck(row);
                } else {
                  row._uncheck();
                  row._onUncheck();
                  grid._onRowUncheck(row);
                }
                grid.changeCheckAllState();
              },
            }
          },
        });
        this.setProps({
          columns: columns,
        });
      }
    }

    autoMergeCols() {
      const that = this;
      this.props.autoMergeColumns.forEach(function (key) {
        that._mergeColumn(key);
      });
    }

    _mergeColumn(key) {
      const el = this.body.element.getElementsByTagName('table')[0];
      function getIndex(data) {
        for (let i = 0; i < el.rows[0].cells.length; i++) {
          if (el.rows[0].cells[i].getAttribute('data-field') === data) {
            return i
          }
        }
      }
      const index = getIndex(key);

      for (let i = el.rows.length - 1; i > 0; i--) {
        el.rows[i].cells[index].rowSpan = el.rows[i].cells[index].rowSpan || 1;
        if (el.rows[i].cells[index].innerHTML === el.rows[i - 1].cells[index].innerHTML) {
          el.rows[i - 1].cells[index].rowSpan = el.rows[i].cells[index].rowSpan + 1;
          el.rows[i].cells[index].rowSpan = 0;
          el.rows[i].cells[index].style.display = 'none';
        }
      }
    }

    resizeCol(data) {
      this.header && this.header.resizeCol(data);
      this.body && this.body.resizeCol(data);
    }

    _processExpandableColumn() {
      const { rowExpandable, columns } = this.props;
      if (rowExpandable) {
        if (columns.filter((item) => item.isTreeMark).length > 0) {
          return
        }
        columns.unshift({
          width: 50,
          isTreeMark: true,
          cellRender: ({ row, rowData }) => {
            return {
              component: Icon,
              expandable: {
                byClick: true,
                expandedProps: {
                  type: 'minus-square',
                },
                collapsedProps: {
                  type: 'plus-square',
                },
                target: () => {
                  if (!row.expandedRow) {
                    row.expandedRow = row.after({
                      component: ExpandedTr,
                      data: rowData,
                    });
                  }
                  return row.expandedRow
                },
              },
            }
          },
        });
        this.setProps({
          columns: columns,
        });
      }
    }

    _onRowCheck(row) {
      const { rowCheckable } = this.props;
      if (rowCheckable) {
        let normalizedRowCheckable = rowCheckable;
        if (!isPlainObject(rowCheckable)) {
          normalizedRowCheckable = {};
        }
        const { onCheck } = normalizedRowCheckable;
        this._callHandler(onCheck, { row: row });
      }
    }

    _onRowUncheck(row) {
      const { rowCheckable } = this.props;
      if (rowCheckable) {
        let normalizedRowCheckable = rowCheckable;
        if (!isPlainObject(rowCheckable)) {
          normalizedRowCheckable = {};
        }
        const { onUncheck } = normalizedRowCheckable;
        this._callHandler(onUncheck, { row: row });
      }
    }

    // handlePinClick(data) {
    //   const { columns } = this.props

    //   const arr = columns.filter(function (item) {
    //     return item.field === data.field
    //   })
    // }
  }

  Grid.defaults = {
    columns: [],
    data: [],
    frozenHeader: false,
    frozenLeftCols: null,
    frozenRightCols: null,
    allowFrozenCols: false,
    onSort: null,
    keyField: 'id',
    treeConfig: {
      childrenField: 'children',
      treeNodeColumn: null,
      initExpandLevel: -1,
      indentSize: 16,
    },
    columnsCustomizable: false,
    autoMergeColumns: null,
    visibleColumns: null,
    columnResizable: false,
    striped: false,
    showTitle: false,
    ellipsis: false,
    sticky: false,
  };

  Component.register(Grid);

  class GroupList extends Group {
    constructor(props, ...mixins) {
      const defaults = {
        fieldDefaults: { component: Group },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const that = this;
      const { groupDefaults, value, addDefaultValue } = this.props;
      const extGroupDefaults = Component.extendProps(groupDefaults, {
        _config: function () {
          const group = this;
          this.setProps({
            action: [
              {
                component: 'Button',
                text: '??????',
                onClick: () => {
                  group.remove();
                  that._onValueChange();
                },
              },
            ],
          });
        },
      });

      const groups = [];
      if (Array.isArray(value)) {
        value.forEach(function (item) {
          groups.push(Component.extendProps(extGroupDefaults, { value: item }));
        });
      }

      this.setProps({
        fields: groups,
        fieldDefaults: extGroupDefaults,
        controlAction: [
          {
            component: 'Button',
            type: 'dashed',
            text: '??????',
            span: 12,
            block: true,
            onClick: () => {
              extGroupDefaults.value = isFunction$1(addDefaultValue)
                ? addDefaultValue.call(this)
                : addDefaultValue;
              that.appendField(extGroupDefaults);
              that._onValueChange();
            },
          },
        ],
      });

      super._config();
    }

    getValue() {
      const value = [];
      for (let i = 0; i < this.fields.length; i++) {
        const field = this.fields[i];
        if (field.getValue) {
          const fieldValue = field.getValue();
          value.push(fieldValue);
        }
      }

      return value
    }

    setValue(value) {
      if (Array.isArray(value)) {
        for (let i = 0; i < this.fields.length; i++) {
          const field = this.fields[i];
          if (field.setValue) {
            field.setValue(value[i]);
          }
        }
      }
    }
  }

  Component.register(GroupList);

  class MaskInfo extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'span',
        type: null,
        text: null,
        mask: true,
        icon: true,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.originText = this.props.text;
      this.showText = '';
    }

    _config() {
      const { text, type, icon } = this.props;
      const that = this;

      if (this.props.mask === true) {
        this.showText = MaskInfo.format({
          value: text,
          type: type,
        });
      } else {
        this.showText = this.props.text;
      }

      let textNode = null;

      if (icon) {
        textNode = {
          tag: 'span',
          children: this.showText,
        };
      } else if (!this.props.mask) {
        textNode = {
          tag: 'span',
          children: this.showText,
        };
        if (that.tooltip) {
          that.tooltip.remove();
          delete that.tooltip;
        }
      } else {
        textNode = {
          tag: 'span',
          children: this.showText,
          onClick: () => {
            that.handleClick();
          },
        };
      }

      const children = [
        this.props.mask &&
          !!icon &&
          this.props.text &&
          Component.normalizeIconProps({
            type: 'eye',
            onClick: function () {
              that.handleClick();
            },
          }),
        textNode,
      ];

      this.setProps({
        children: children,
      });
    }

    _rendered() {
      if (this.props.mask && !this.props.icon) {
        this.tooltip = new nomui.Tooltip({ trigger: this, children: '????????????????????????' });
      }
    }

    handleClick() {
      this.props.mask = false;
      this.update(this.props.mask);
    }

    static format(data) {
      const { value, type } = data;

      if (!value) {
        return ''
      }
      if (value === 'NA' || value === '') {
        return value
      }

      let newText = '';

      // ?????????
      if (type === 'mobile') {
        newText = value.replace(/(\d{1,3})(\d{4})(\d+)/g, '$1****$3');
      }
      // ????????????
      else if (type === 'phone') {
        newText = value.replace(/(\d+)(\d{4})/g, '$1*****');
      }
      // ????????????
      else if (type === 'fax') {
        newText = value.replace(/(\d+)(\d{4})/g, '$1*****');
      }
      // ??????
      else if (type === 'mail') {
        let strend;
        if (value.indexOf('@') < 5) {
          strend = value.substring(1, value.lastIndexOf('@') - 1);
        } else {
          strend = value.substring(2, value.lastIndexOf('@') - 2);
        }
        newText = value.replace(strend, '***');
      }
      // ?????????
      else if (type === 'card') {
        const strend = value.substring(0, value.length - 4);
        newText = value.replace(strend, '************');
      }

      // ?????????
      else if (type === 'identity') {
        newText = value.replace(/(\d{4}).*(\w{3})/gi, '$1***********$2');
      }
      // ??????
      else if (type === 'name') {
        const strend = value.substring(0, value.length - 1);
        let star = '';
        for (let i = 0; i < strend.length; i++) {
          star += '*';
        }
        newText = value.replace(strend, star);
      }
      // ??????
      else if (type === 'middle') {
        if (value.length <= 4) {
          newText = '****';
        } else if (value.length > 4 && value.length <= 8) {
          const strend = value.substring(value.length - 4, value.length);
          newText = `****${strend}`;
        } else {
          const strend = value.substring(0, value.length - 8);
          const strend2 = value.substring(value.length - 4, value.length);
          newText = `${strend}****${strend2}`;
        }
      }

      // ??????
      else if (!type || type === 'other') {
        if (value.length > 4) {
          const strend = value.substring(0, value.length - 4);
          newText = `${strend}****`;
        } else {
          newText = '';
          for (let i = 0; i < value.length; i++) {
            newText += '*';
          }
        }
      }
      return newText
    }
  }

  Component.register(MaskInfo);

  class MenuItem extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'a',
        url: null,
        icon: null,
        text: null,
        subtext: null,
        indicator: {
          component: 'Icon',
          expandable: {
            expandedProps: {
              type: 'up',
            },
            collapsedProps: {
              type: 'down',
            },
          },
          type: 'down',
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.wrapper = this.parent;
      this.wrapper.item = this;
      this.menu = this.wrapper.menu;
      this.level = this.wrapper.level;
      this.isLeaf = this.wrapper.isLeaf;
      this.menu.itemRefs[this.key] = this;
      this.parentItem = null;
      if (this.wrapper.parentWrapper) {
        this.parentItem = this.wrapper.parentWrapper.item;
      }
      this.handleSelect = this.handleSelect.bind(this);
    }

    _config() {
      const { menu } = this;
      const { onSelect, onUnselect } = this.props;
      const menuProps = menu.props;

      let indicatorIconType = 'down';
      if (menuProps.direction === 'horizontal' && this.level > 0) {
        indicatorIconType = 'right';
      }

      if (menuProps.direction === 'horizontal') {
        this.setProps({
          indicator: {
            expandable: false,
          },
        });
      }

      this.setProps({
        indicator: {
          type: indicatorIconType,
          classes: { 'nom-menu-toggler': true },
          _created() {
            this.parent.indicator = this;
          },
        },
        selectable: {
          byClick: menuProps.itemSelectable.byClick,
        },
        expandable: {
          byClick: !this.isLeaf,
          target: function () {
            return this.wrapper.submenu
          },
        },
        attrs: {
          href: this.getItemUrl(this.props.url),
          style: {
            paddingLeft:
              menuProps.direction === 'vertical' ? `${(this.level + 1) * menuProps.indent}rem` : null,
          },
        },
        onSelect: () => {
          if (menu.selectedItem !== null) menu.selectedItem.unselect();
          menu.selectedItem = this;
          this._callHandler(onSelect);
        },
        onUnselect: () => {
          if (menu.selectedItem === this) menu.selectedItem = null;
          this._callHandler(onUnselect);
        },
      });

      this.setProps({
        children: [
          this.props.icon && {
            component: 'Icon',
            type: this.props.icon,
            classes: { 'nom-menu-item-icon': true },
          },
          { component: Component, tag: 'span', classes: { text: true }, children: this.props.text },
          this.props.subtext && {
            component: Component,
            tag: 'span',
            classes: { subtext: true },
            children: this.props.subtext,
          },
          this.props.indicator && !this.isLeaf && this.props.indicator,
        ],
      });
    }

    _rendered() {
      if (this.props.selected) {
        this.list.selectedItem = this;
      }
    }

    handleSelect() { }

    _collapse() {
      this.indicator && this.indicator.collapse();
      if (this.menu.props.itemExpandable.expandSingle === true) {
        this.wrapper.parent.expandedChildItem = null;
      }
    }

    _expand() {
      this.indicator && this.indicator.expand();
      if (this.menu.props.itemExpandable.expandSingle === true) {
        if (this.wrapper.parent.expandedChildItem) {
          this.wrapper.parent.expandedChildItem.collapse();
        }
        this.wrapper.parent.expandedChildItem = this;
      }
    }

    getItemUrl(url) {
      if (url) {
        return url
      }

      return 'javascript:void(0);'
    }
  }

  Component.register(MenuItem);

  class MenuSub extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'ul',
        itemDefaults: {
          component: 'menu-item',
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.wrapper = this.props.wrapper || this.parent;
      this.wrapper.submenu = this;
      this.menu = this.wrapper.menu;
      this.props.itemDefaults = this.menu.props.itemDefaults;
    }

    _config() {
      const that = this;

      const children =
        Array.isArray(this.props.items) &&
        this.props.items.map(function (item) {
          return {
            component: 'MenuItemWrapper',
            item: Component.extendProps({}, that.props.itemDefaults, item),
            items: item.items,
          }
        });

      const typeClass = `nom-menu-${this.menu.props.type}`;
      const classes = {};
      classes[typeClass] = true;
      this.setProps({
        classes: classes,
        children: children,
      });
    }
  }

  Component.register(MenuSub);

  class MenuItemWrapper extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'li',
        item: {
          component: MenuItem,
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.isLeaf = false;
      this.level = 0;
      this.parentWrapper = null;

      if (this.parent instanceof Component.components.Menu) {
        this.menu = this.parent;
      } else if (this.parent instanceof Component.components.MenuSub) {
        this.menu = this.parent.menu;
        this.parentWrapper = this.parent.wrapper;
      }

      if (this.parentWrapper) {
        this.level = this.parentWrapper.level + 1;
      }

      this.isLeaf = !Array.isArray(this.props.item.items) || this.props.item.items.length < 1;
    }

    _config() {
      const that = this;
      const { menu } = this;
      const menuProps = menu.props;
      const expanded =
        menuProps.direction === 'horizontal' || menuProps.itemExpandable.initExpandLevel >= this.level;

      this.setProps({
        submenu: menuProps.submenu,
      });

      this.setProps({
        submenu: {
          component: MenuSub,
          name: 'submenu',
          items: this.props.item.items,
          hidden: !expanded,
        },
      });

      if (menuProps.direction === 'horizontal' && !this.isLeaf) {
        let reference = document.body;
        if (this.level > 0) {
          reference = this;
        }
        let align = 'bottom left';
        if (this.level > 0) {
          align = 'right top';
        }

        this.setProps({
          submenu: {
            wrapper: that,
          },
        });

        this.setProps({
          item: {
            popup: {
              triggerAction: 'hover',
              align: align,
              reference: reference,
              children: this.props.submenu,
            },
          },
        });
      }

      this.setProps({
        children: [
          this.props.item,
          !this.isLeaf && menuProps.direction === 'vertical' && this.props.submenu,
        ],
      });
    }
  }

  Component.register(MenuItemWrapper);

  class Menu extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'ul',
        items: [],
        itemDefaults: {
          component: MenuItem,
        },
        itemSelectable: {
          onlyleaf: false,
          byClick: false,
        },
        itemExpandable: {
          expandSingle: true,
          initExpandLevel: -1,
        },

        indent: 1.5,
        direction: 'vertical',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.itemRefs = [];
      this.selectedItem = null;
    }

    _config() {
      this._addPropStyle('direction');

      const that = this;
      const children = this.props.items.map(function (item) {
        if (!item) {
          return
        }
        if (
          (item.type && item.type.toLowerCase() === 'divider') ||
          (item.component && item.component === 'Divider')
        ) {
          return {
            tag: 'li',
            classes: {
              'nom-menu-divider': true,
            },
          }
        }
        return {
          component: MenuItemWrapper,
          item: Component.extendProps({}, that.props.itemDefaults, item),
        }
      });

      this.setProps({
        children: children,
      });
    }

    getItem(param) {
      let retItem = null;

      if (param instanceof Component) {
        return param
      }

      if (isFunction$1(param)) {
        for (const key in this.itemRefs) {
          if (this.itemRefs.hasOwnProperty(key)) {
            if (param.call(this.itemRefs[key]) === true) {
              retItem = this.itemRefs[key];
              break
            }
          }
        }
      } else {
        return this.itemRefs[param] || null
      }

      return retItem
    }

    selectItem(param, selectOption) {
      const item = this.getItem(param);
      if (item === null || item === undefined) {
        return false
      }
      item.select(selectOption);
      selectOption && selectOption.scrollIntoView && this.scrollTo(item);
      return item
    }

    selectToItem(param) {
      this.expandToItem(param);
      this.selectItem(param);
      this.scrollTo(param);
    }

    unselectItem(param, unselectOption) {
      unselectOption = extend(
        {
          triggerUnselect: true,
          triggerSelectionChange: true,
        },
        unselectOption,
      );
      const item = this.getItem(param);
      if (item === null) {
        return false
      }
      return item.unselect(unselectOption)
    }

    getSelectedItem() {
      return this.selectedItem
    }

    expandToItem(param) {
      const item = this.getItem(param);
      if (item !== null) {
        let p = item.parentItem;
        while (p) {
          p.expand();
          p = p.parentItem;
        }
      }
    }

    scrollTo(
      param,
      scrollToOptions = {
        behavior: 'smooth',
        scrollMode: 'if-needed',
      },
    ) {
      const item = this.getItem(param);
      if (item && item.wrapper) {
        scrollIntoView(item.wrapper.element, scrollToOptions);
      }
    }

    scrollToSelected() {
      if (this.selectedItem) {
        this.scrollTo(this.selectedItem);
      }
    }

    _rendered() {
      super._rendered();
      this.scrollToSelected();
    }
  }

  Component.register(Menu);

  class Message extends Layer {
    constructor(props, ...mixins) {
      const defaults = {
        type: null,
        icon: null,
        content: null,
        duration: 2,
        closeToRemove: true,
        position: {
          my: 'center center',
          at: 'center center',
          of: window,
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {   
      this._addPropStyle('type');
      const iconMap = {
        info: 'info-circle',
        success: 'check-circle',
        error: 'close-circle',
        warning: 'exclamation-circle',
      };

      const icon = this.props.icon || iconMap[this.props.type];
      let iconProps = Component.normalizeIconProps(icon);
      if (iconProps) {
        iconProps = Component.extendProps(iconProps, { classes: { 'nom-message-icon': true } });
      }
      this.props.content = Component.normalizeTemplateProps(this.props.content);
      this.setProps({
        content: {
          classes: {
            'nom-message-content': true,
          },
        },
      });
      this.setProps({
        children: [
          iconProps,
          this.props.content,
        ],
      });

      super._config();
    }

    close() {
      this.remove();
    }

    _rendered() {
      const that = this;
      const { props } = this;

      if (props.duration) {
        setTimeout(function () {
          that.close();
        }, 1000 * props.duration);
      }
    }
  }

  Component.register(Message);

  // Thanks to https://github.com/andreypopp/react-textarea-autosize/
  /**
   * calculateNodeHeight(uiTextNode)
   */
  const HIDDEN_TEXTAREA_STYLE = `
  min-height:0 !important;
  max-height:none !important;
  height:0 !important;
  visibility:hidden !important;
  overflow:hidden !important;
  position:absolute !important;
  z-index:-1000 !important;
  top:0 !important;
  right:0 !important
`;

  const SIZING_STYLE = [
    'letter-spacing',
    'line-height',
    'padding-top',
    'padding-bottom',
    'font-family',
    'font-weight',
    'font-size',
    'font-variant',
    'text-rendering',
    'text-transform',
    'width',
    'text-indent',
    'padding-left',
    'padding-right',
    'border-width',
    'box-sizing',
  ];

  let hiddenTextarea;

  function calculateNodeStyling(node) {
    const style = window.getComputedStyle(node);

    const boxSizing =
      style.getPropertyValue('box-sizing') ||
      style.getPropertyValue('-moz-box-sizing') ||
      style.getPropertyValue('-webkit-box-sizing');

    const paddingSize =
      parseFloat(style.getPropertyValue('padding-bottom')) +
      parseFloat(style.getPropertyValue('padding-top'));

    const borderSize =
      parseFloat(style.getPropertyValue('border-bottom-width')) +
      parseFloat(style.getPropertyValue('border-top-width'));

    const sizingStyle = SIZING_STYLE.map((name) => `${name}:${style.getPropertyValue(name)}`).join(
      ';',
    );

    const nodeInfo = {
      sizingStyle,
      paddingSize,
      borderSize,
      boxSizing,
    };

    return nodeInfo
  }

  function calculateNodeHeight(uiTextNode, minRows = null, maxRows = null) {
    if (!hiddenTextarea) {
      hiddenTextarea = document.createElement('textarea');
      hiddenTextarea.setAttribute('tab-index', '-1');
      hiddenTextarea.setAttribute('aria-hidden', 'true');
      document.body.appendChild(hiddenTextarea);
    }

    // Fix wrap="off" issue
    // https://github.com/ant-design/ant-design/issues/6577
    if (uiTextNode.getAttribute('wrap')) {
      hiddenTextarea.setAttribute('wrap', `${uiTextNode.getAttribute('wrap')}`);
    } else {
      hiddenTextarea.removeAttribute('wrap');
    }

    // Copy all CSS properties that have an impact on the height of the content in
    // the textbox
    const { paddingSize, borderSize, boxSizing, sizingStyle } = calculateNodeStyling(uiTextNode);

    // Need to have the overflow attribute to hide the scrollbar otherwise
    // text-lines will not calculated properly as the shadow will technically be
    // narrower for content
    hiddenTextarea.setAttribute('style', `${sizingStyle};${HIDDEN_TEXTAREA_STYLE}`);
    hiddenTextarea.value = uiTextNode.value || uiTextNode.placeholder || '';

    let minHeight = Number.MIN_SAFE_INTEGER;
    let maxHeight = Number.MAX_SAFE_INTEGER;
    let height = hiddenTextarea.scrollHeight;
    let overflowY;

    if (boxSizing === 'border-box') {
      // border-box: add border, since height = content + padding + border
      height += borderSize;
    } else if (boxSizing === 'content-box') {
      // remove padding, since height = content
      height -= paddingSize;
    }

    if (minRows !== null || maxRows !== null) {
      // measure height of a textarea with a single row
      hiddenTextarea.value = ' ';
      const singleRowHeight = hiddenTextarea.scrollHeight - paddingSize;
      if (minRows !== null) {
        minHeight = singleRowHeight * minRows;
        if (boxSizing === 'border-box') {
          minHeight = minHeight + paddingSize + borderSize;
        }
        height = Math.max(minHeight, height);
      }
      if (maxRows !== null) {
        maxHeight = singleRowHeight * maxRows;
        if (boxSizing === 'border-box') {
          maxHeight = maxHeight + paddingSize + borderSize;
        }
        overflowY = height > maxHeight ? '' : 'hidden';
        height = Math.min(maxHeight, height);
      }
    }
    return {
      height: `${height}px`,
      minHeight: `${minHeight}px`,
      maxHeight: `${maxHeight}px`,
      overflowY: overflowY ? `${overflowY}px` : undefined,
      resize: 'none',
    }
  }

  class Textarea extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'textarea',
        attrs: {
          autocomplete: 'off',
        },
        autoSize: false, // boolean|{minRows:number,maxRows:number}
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.multilineTextbox = this.parent;
      this.multilineTextbox.textarea = this;

      this.capsLock = false;
    }

    _config() {
      this.setProps({
        attrs: {
          oninput: () => {
            if (!this.capsLock) {
              this.multilineTextbox._onValueChange();
            }
            this.resizeTextarea();
          },
          onblur: () => {
            this.multilineTextbox.trigger('blur');
          },
          oncompositionstart: () => {
            this.capsLock = true;
          },
          oncompositionend: () => {
            this.capsLock = false;
            this.element.dispatchEvent(new Event('input'));
          },
        },
      });
    }

    _rendered() {
      if (this.multilineTextbox.props.autofocus === true) {
        this.focus();
      }
      this.resizeTextarea();
    }

    _remove() {
      cancelAnimationFrame && cancelAnimationFrame(this.resizeFrameId);
    }

    resizeTextarea() {
      const { autoSize } = this.props;
      if (!autoSize && this.element) {
        return
      }
      cancelAnimationFrame && cancelAnimationFrame(this.resizeFrameId);
      this.resizeFrameId = requestAnimationFrame(() => {
        // TODO ???????????????  updateStyles
        this._setStyle({
          overflow: 'hidden',
        });
        const { minRows, maxRows } = autoSize;
        const textareaStyles = calculateNodeHeight(this.element, minRows, maxRows);
        // TODO ???????????????  updateStyles
        this._setStyle({
          overflow: 'inherit',
          ...textareaStyles,
        });
        this.fixFirefoxAutoScroll();
      });
    }

    // https://github.com/ant-design/ant-design/issues/21870
    fixFirefoxAutoScroll() {
      try {
        if (document.activeElement === this.element) {
          const currentStart = this.element.selectionStart;
          const currentEnd = this.element.selectionEnd;
          this.element.setSelectionRange(currentStart, currentEnd);
        }
      } catch (e) {
        // Fix error in Chrome:
        // Failed to read the 'selectionStart' property from 'HTMLInputElement'
        // http://stackoverflow.com/q/21177489/3040605
      }
    }

    getText() {
      return this.element.value
    }

    setText(text) {
      this.element.value = text;
    }

    focus() {
      this.element.focus();
    }

    blur() {
      this.element.blur();
    }

    disable() {
      this.element.setAttribute('disabled', 'disabled');
    }

    enable() {
      this.element.removeAttribute('disabled', 'disabled');
    }
  }

  Component.register(Textarea);

  class MultilineTextbox extends Field {
    constructor(props, ...mixins) {
      const defaults = {
        autofocus: false,
        autoSize: false, // boolean|{minRows:number,maxRows:number}
        placeholder: null,
        value: null,
        maxLength: null,
        rows: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const that = this;
      const { autoSize, value, placeholder, autofocus, rows, maxLength } = this.props;

      this.setProps({
        control: {
          children: {
            component: Textarea,
            autoSize,
            attrs: {
              value,
              placeholder,
              autofocus,
              rows,
              maxLength,
            },
            _created: function () {
              this.multilineTextbox = that;
              this.multilineTextbox.textarea = this;
            },
          },
        },
      });
      super._config();
    }

    getText() {
      return this.textarea.getText()
    }

    _getValue() {
      const inputText = this.getText();
      if (inputText === '') {
        return null
      }
      return inputText
    }

    _setValue(value, options) {
      if (options === false) {
        options = { triggerChange: false };
      } else {
        options = extend({ triggerChange: true }, options);
      }

      this.textarea.setText(value);
      const newValue = this.getValue();
      if (options.triggerChange) {
        if (newValue !== this.oldValue) {
          super._onValueChange();
        }
      }
      this.oldValue = this.currentValue;
      this.currentValue = newValue;
    }

    focus() {
      this.textarea.focus();
    }

    blur() {
      this.textarea.blur();
    }

    _disable() {
      this.textarea.disable();
    }

    _enable() {
      this.textarea.enable();
    }
  }

  Component.register(MultilineTextbox);

  class NavbarCaption extends Component {
    // constructor(props, ...mixins) {
    //   super(props, ...mixins)
    // }
  }

  Component.register(NavbarCaption);

  class NavbarCaptionBefore extends Component {
    // constructor(props, ...mixins) {
    //   super(props, ...mixins)
    // }
  }

  Component.register(NavbarCaptionBefore);

  class NavbarCaptionAfter extends Component {
    // constructor(props, ...mixins) {
    //   super(props, ...mixins)
    // }
  }

  Component.register(NavbarCaptionAfter);

  class NavbarNav extends Component {
    // constructor(props, ...mixins) {
    //   super(props, ...mixins)
    // }
  }

  Component.register(NavbarNav);

  class NavbarTools extends Component {
    // constructor(props, ...mixins) {
    //     super(props, ...mixins)
    // }
  }

  Component.register(NavbarTools);

  class Navbar extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        caption: null,
        nav: null,
        tools: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    config() {
      this._addPropStyle('fit');
      const { caption, nav, tools, captionBefore, captionAfter } = this.props;
      let toolsProps, captionBeforeProps, captionAfterProps;
      const captionProps = caption
        ? Component.extendProps({ component: Caption, titleLevel: 3 }, caption)
        : null;
      const navProps = nav ? Component.extendProps({ component: Cols }, nav) : null;
      if (Array.isArray(tools)) {
        toolsProps = { component: Cols, items: tools };
      } else if (isPlainObject(tools)) {
        toolsProps = Component.extendProps({ component: Cols }, tools);
      }
      if (Array.isArray(captionBefore)) {
        captionBeforeProps = { component: Cols, items: captionBefore };
      } else if (isPlainObject(tools)) {
        captionBeforeProps = Component.extendProps({ component: Cols }, captionBefore);
      }
      if (Array.isArray(captionAfter)) {
        captionAfterProps = { component: Cols, items: captionAfter };
      } else if (isPlainObject(tools)) {
        captionAfterProps = Component.extendProps({ component: Cols }, captionAfter);
      }

      this.setProps({
        children: [
          captionBeforeProps && { component: NavbarCaptionBefore, children: captionBeforeProps },
          captionProps && { component: NavbarCaption, children: captionProps },
          captionAfterProps && { component: NavbarCaptionAfter, children: captionAfterProps },
          navProps && { component: NavbarNav, children: navProps },
          toolsProps && { component: NavbarTools, children: toolsProps },
        ],
      });
    }
  }

  Component.register(Navbar);

  class NotificationContent extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        title: null,
        description: null,
        // type:null,
        // icon:'',
        // closeIcon: 'close',
        btn: false,
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { title, description, type, btn, closeIcon, onClose } = this.props;

      let { icon } = this.props;
      const iconMap = {
        info: 'info-circle',
        success: 'check-circle',
        error: 'close-circle',
        warning: 'exclamation-circle',
      };
      icon = icon || iconMap[type];

      const iconProps = icon
        ? Component.extendProps(Component.normalizeIconProps(icon), {
            classes: {
              'nom-notification-icon': true,
            },
          })
        : null;

      const titleProps = title
        ? Component.extendProps(Component.normalizeTemplateProps(title), {
            classes: { 'nom-notification-title': true },
          })
        : null;

      const closeIconProps = Component.extendProps(
        Component.normalizeTemplateProps({
          component: 'Button',
          icon: closeIcon,
          styles: {
            border: 'none',
          },
          onClick: function () {
            onClose();
          },
        }),
        {
          classes: { 'nom-notification-close': true },
        },
      );

      const headerProps = {
        component: 'Cols',
        justify: 'between',
        items: [titleProps, closeIconProps],
      };

      const descriptionProps = description
        ? Component.extendProps(Component.normalizeTemplateProps(description), {
            classes: { 'nom-notification-description': true },
          })
        : null;
      let actionProps;
      if (btn) {
        const okButtonProps = {
          component: Button,
          styles: {
            color: 'primary',
          },
          size: 'small',
          text: btn.text || '?????????',
          onClick: () => {
            onClose();
          },
        };
        actionProps = {
          component: Cols,
          justify: 'end',
          items: [okButtonProps],
        };
      }

      this.setProps({
        children: [
          {
            classes: {
              'nom-notification-body': true,
            },
            children: [
              icon
                ? {
                    classes: {
                      'nom-notification-body-icon': true,
                    },
                    children: iconProps,
                  }
                : undefined,
              {
                classes: {
                  'nom-notification-body-content': true,
                },
                children: [headerProps, descriptionProps],
              },
            ],
          },
          actionProps
            ? {
                classes: {
                  'nom-notification-actions': true,
                },
                children: actionProps,
              }
            : undefined,
        ],
      });
    }
  }

  class Notification extends Layer {
    static NOMUI_NOTIFICATION_DEFAULTS = {
      align: 'right top',
      duration: 4500,
      bottom: 24,
      top: 24,
      left: 24,
      right: 24,
    }

    // ??????Notification??????,???key???????????????????????????
    static NOMUI_NOTIFICATION_INSTANCES = {}

    // /**
    //  * ????????????????????????????????????
    //  * @param {*} props
    //  */
    // static configDefault(props) {
    //   Notification.NOMUI_NOTIFICATION_DEFAULTS = {
    //     ...Notification.NOMUI_NOTIFICATION_DEFAULTS,
    //     ...props,
    //   }
    // }

    constructor(props, ...mixins) {
      const defaults = {
        ...Notification.NOMUI_NOTIFICATION_DEFAULTS,
        // type:'',
        closeIcon: 'close',
        // alignTo: document.body,
        title: '',
        description: '',
        // btn:boolean||{text:''},
        // closeIcon:{},
        key: newGuid(),
        // onClose:()=>{},
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    static open(config) {
      const curInsance = Notification.NOMUI_NOTIFICATION_INSTANCES[config.key];
      if (!curInsance) {
        return new nomui.Notification(config)
      }
      curInsance.update({
        ...config,
      });
      return curInsance
    }

    static success(config) {
      Notification.open({
        ...config,
        type: 'success',
      });
    }

    static error(config) {
      Notification.open({
        ...config,
        type: 'error',
      });
    }

    static info(config) {
      Notification.open({
        ...config,
        type: 'info',
      });
    }

    static warning(config) {
      Notification.open({
        ...config,
        type: 'warning',
      });
    }

    static close(key) {
      if (Notification.NOMUI_NOTIFICATION_INSTANCES[key]) {
        Notification.NOMUI_NOTIFICATION_INSTANCES[key].close();
      }
    }

    _created() {
      super._created();
      this.timer = null;

      const { key } = this.props;
      Notification.NOMUI_NOTIFICATION_INSTANCES[key] = this;
    }

    _registerAutoClose(duration) {
      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.close();
      }, duration);
    }

    _rendered() {
      const { duration } = this.props;
      const that = this;
      if (duration !== null) {
        that._registerAutoClose(duration);

        this.element.addEventListener(
          'mouseenter',
          function () {
            that.timer && clearTimeout(that.timer);
          },
          false,
        );

        this.element.addEventListener(
          'mouseleave',
          function () {
            that._registerAutoClose(duration);
          },
          false,
        );
      }
    }

    _registerDuritionClose() {}

    _getMarginStyle() {
      const { top, right, bottom, left } = this.props;
      const aligns = this.props.align.split(' ');
      const style = {
        transform: '',
      };
      aligns.forEach((align) => {
        switch (align) {
          case 'top':
            style.transform += `translateY(${top}px) `;
            break
          case 'right':
            style.transform += `translateX(-${right}px) `;
            break
          case 'bottom':
            style.transform += `translateY(-${bottom}px) `;
            break
          case 'left':
            style.transform += `translateX(${left}px) `;
            break
        }
      });
      style.transform = style.transform.trim();
      return style
    }

    close() {
      this.timer && clearTimeout(this.timer);
      const { key } = this.props;
      delete Notification.NOMUI_NOTIFICATION_INSTANCES[key];

      this.props.onClose && this.props.onClose();
      this.remove();
    }

    _config() {
      const that = this;
      this._propStyleClasses = ['type'];
      const {
        align,
        alignTo,
        styles,
        attrs = {},
        icon,
        type,
        closeIcon,
        title,
        btn,
        description,
      } = this.props;

      const style = this._getMarginStyle();
      this.setProps({
        // fixed: true,
        closeToRemove: true,
        alignOuter: true,
        align,
        alignTo,
        styles,
        attrs: {
          ...attrs,
          style: {
            ...style,
            ...attrs.style,
          },
        },
        children: {
          component: NotificationContent,
          type,
          icon,
          closeIcon,
          title,
          btn,
          description,
          onClose: () => {
            that.close();
          },
        },
      });

      super._config();
    }
  }

  Component.register(Notification);

  class Numberbox extends Textbox {
    constructor(props, ...mixins) {
      const defaults = {
        min: null,
        max: null,
        precision: -1,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { precision = -1 } = this.props;
      const rules = [];

      if (precision === -1) {
        rules.push({
          type: 'number',
        });
      }

      if (this.props.precision === 0) {
        rules.push({
          type: 'regex',
          value: {
            pattern: '^(\\-|\\+)?(0|[1-9][0-9]*)$',
          },
          message: '???????????????',
        });
      }

      if (this.props.precision > 0) {
        rules.push({
          type: 'regex',
          value: {
            pattern: `^(\\-|\\+)?(0|[1-9][0-9]*)(\\.\\d{${this.props.precision}})$`,
          },
          message: `????????? ${this.props.precision} ?????????`,
        });
      }

      if (this.props.min) {
        rules.push({
          type: 'min',
          value: this.props.min,
        });
      }
      if (this.props.max) {
        rules.push({
          type: 'max',
          value: this.props.max,
        });
      }

      this.setProps({ rules: rules });

      super._config();
    }

    _getValue() {
      const { precision = -1 } = this.props;

      let numberValue = null;
      const textValue = this.input.getText();

      if (precision) {
        const dotCount = this._dotCount(textValue);
        if (precision >= 0 && dotCount > precision) {
          numberValue = this._toDecimal(textValue, precision);
        } else {
          numberValue = parseFloat(textValue);
        }
      } else {
        numberValue = parseFloat(textValue);
      }

      if (Number.isNaN(numberValue)) {
        numberValue = null;
      }

      return numberValue
    }

    _setValue(value, options) {
      const { precision = -1 } = this.props;

      this.currentValue = this.getValue();

      if (precision !== null && precision !== undefined) {
        if (precision >= 0) {
          const dotCount = this._dotCount(value);
          if (dotCount > precision) {
            value = this._toDecimal(value, precision);
          }
        }
      }

      if (Number.isNaN(value)) {
        value = '';
      }

      super._setValue(value, options);
    }

    _toDecimal(val, precision, notRound) {
      if (notRound === undefined) {
        notRound = false;
      }
      let f = parseFloat(val);
      if (Number.isNaN(f)) {
        return
      }
      if (notRound === true) {
        f = Math.floor(val * 10 ** precision) / 10 ** precision;
      } else {
        f = Math.round(val * 10 ** precision) / 10 ** precision;
      }
      return f
    }

    _dotCount(val) {
      val = String(val);
      const dotPos = val.indexOf('.');
      const len = val.substr(dotPos + 1).length;

      return len
    }

    _getRawValue() {
      return this.input.getText()
    }
  }

  Component.register(Numberbox);

  const SPINNER_POSITION = {
    left: 'left',
    right: 'right',
    horizontal: 'horizontal',
  };

  const STYLE = {
    DECIMAL: 'decimal',
    CURRENCY: 'currency',
    PERCENT: 'percent',
  };

  function isNil(value) {
    return value == null
  }

  const COMMA_REG = /,/g;

  const CURRENCY_TO_VALUE_REG = /([^\d+-]*)([-]?)([\d,.]*)([^\d]*)/;
  function currencyReplacer(_match, _p1, p2, p3) {
    /*
     * US$-1,000.00
     * p1 ?????? US$
     * p2 ?????? ???????????? -
     * p3 ??????????????? 1,000.00
     * p4 ?????? ????????????
     *
     */
    const val = `${p2}${p3}`.replace(/,/, '');
    return isNumeric(val) ? Number(val) : null
  }

  // ????????????????????????
  function currencyToValue(curr) {
    return curr.replace(CURRENCY_TO_VALUE_REG, currencyReplacer)
  }

  function precentToValue(precent) {
    const parseStr = precent.replace(/%$/, '').replace(/,/g, '');
    return isNumeric(parseStr) ? Number(parseStr) : null
  }

  class NumberSpinner extends Field {
    constructor(props, ...mixins) {
      const defaults = {
        // min: Number.MIN_SAFE_INTEGER,
        // max: Number.MAX_SAFE_INTEGER,
        min: null,
        max: null,
        precision: 0,
        formatter: null,
        parser: null,
        step: 1,
        showSpinner: true,
        align: 'right',

        // decimal,currency,percent
        style: STYLE.DECIMAL,
        currency: 'CNY',
      };

      super(Component.extendProps(defaults, props), ...mixins);
      this._handleSpinnerIcon = this._handleSpinnerIcon.bind(this);
    }

    _config() {
      const numberSpinner = this;
      const rules = this._handleRules();

      this.setProps({ rules });

      const {
        placeholder,
        precision,
        min,
        max,
        align,
        showSpinner,
        component: com,
        reference,
        tag,
        ref,
        style,
        value,
        formatter,
        parser,
        ...otherProps
      } = this.props;

      numberSpinner._initNumberFormat();

      const { left, right, horizontal } = SPINNER_POSITION;

      const inputProps = {
        component: Input,
        name: 'input',
        ...otherProps,
        // value: isFunction(formatter) ? formatter(value) : numberSpinner._formatter.format(value),
        value: numberSpinner._format(value),
        _created() {
          this.textbox = numberSpinner;
          this.textbox.input = this;
        },
        classes: {
          'spinner-input-with-left-icon': align === left && showSpinner === true,
          'spinner-input-with-right-icon': align === right && showSpinner === true,
          'spinner-input-with-double-icon': align === horizontal && showSpinner === true,
        },
        attrs: {
          placeholder,
          onkeydown(key) {
            if (key.keyCode === 38) {
              key.preventDefault();
              numberSpinner._handlePlus();
            } else if (key.keyCode === 40) {
              key.preventDefault();
              numberSpinner._handleMinus();
            }
          },
          onfocus() {
            const txt = this.value;
            if (txt) {
              this.selectionStart = this.value.length;
              this.selectionEnd = this.value.length;
            }
          },
          onchange() {
            const v = this.value.replace(COMMA_REG, '');

            // ????????????????????????????????????????????????????????????
            if (!isNumeric(v)) return

            const formatterStr = isFunction$1(formatter) ? formatter(v) : numberSpinner._format(v);
            numberSpinner.setValue(formatterStr);
          },
        },
      };

      const spinner = numberSpinner._handleSpinnerIcon();

      this.setProps({
        control: {
          children: [inputProps, ...spinner],
        },
      });

      super._config();
    }

    _getValue() {
      const text = this.getText();
      if (text === '') return null

      const { min, max } = this._getLimit();
      const { precision, parser } = this.props;

      if (isFunction$1(parser)) return parser(text)

      let parseString = text.toString();

      if (this.props.style === STYLE.PERCENT) parseString = parseString.replace(/%$/, '');
      if (this.props.style === STYLE.CURRENCY) parseString = parseString.replace(/^\D*/, '');
      parseString = parseString.replace(COMMA_REG, '');

      if (!isNumeric(parseString)) return null

      const value = Number(parseString).toFixed(precision);

      if (value > max) return max
      if (value < min) return min

      return value
    }

    _setValue(value) {
      const { max, min } = this._getLimit();

      if (value > max) {
        value = max;
      } else if (value < min) {
        value = min;
      }

      const formatValue = this._format(value);
      this.input && this.input.setText(formatValue);
    }

    getText() {
      return this.input.getText()
    }

    focus() {
      this.input.focus();
    }

    blur() {
      this.input.blur();
    }

    _disable() {
      this.input.disable();
    }

    _enable() {
      this.input.enable();
    }

    _handleRules() {
      const { precision } = this.props;
      const rules = [];

      if (precision === -1) rules.push({ type: 'number' });

      if (precision === 0) {
        rules.push({
          type: 'regex',
          value: {
            pattern: '^(\\-|\\+)?(0|[1-9][0-9]*)$',
          },
          message: '???????????????',
        });
      }

      if (this.props.precision > 0) {
        rules.push({
          type: 'regex',
          value: {
            pattern: `^(\\-|\\+)?(0|[1-9][0-9]*)(\\.\\d{${this.props.precision}})$`,
          },
          message: `????????? ${this.props.precision} ?????????`,
        });
      }

      if (this.props.min) {
        rules.push({
          type: 'min',
          value: this.props.min,
        });
      }
      if (this.props.max) {
        rules.push({
          type: 'max',
          value: this.props.max,
        });
      }

      return rules
    }

    _handleSpinnerIcon() {
      const { align, showSpinner } = this.props;
      if (showSpinner === false) return []

      const numberSpinner = this;
      const { left, right, horizontal } = SPINNER_POSITION;

      if ([left, right].includes(align)) {
        return [
          {
            tag: 'span',
            _created(c) {
              numberSpinner.iconContainer = c;
            },
            classes: {
              [`nom-textbox-${align}-icon-container`]: true,
            },
            children: [
              {
                component: 'Icon',
                type: 'up',
                onClick(args) {
                  numberSpinner._handlePlus(args);
                },
              },
              {
                component: 'Icon',
                type: 'down',
                onClick(args) {
                  numberSpinner._handleMinus(args);
                },
              },
            ],
          },
        ]
      }

      if (align === horizontal) {
        return [
          {
            component: 'Icon',
            type: 'down',
            classes: {
              'nom-textbox-left-icon-container': true,
            },
            onClick(args) {
              numberSpinner._handleMinus(args);
            },
          },
          {
            component: 'Icon',
            type: 'up',
            classes: {
              'nom-textbox-right-icon-container': true,
            },
            onClick(args) {
              numberSpinner._handlePlus(args);
            },
          },
        ]
      }

      return []
    }

    _isFocus() {
      if (!this.input) return false
      return document.activeElement === this.input.element
    }

    _handlePlus(args) {
      if (args) {
        const { event } = args;
        if (event) {
          event.preventDefault && event.preventDefault();
          event.stopPropagation && event.stopPropagation();
        }
      }

      let { step } = this.props;
      const { style, parser } = this.props;
      const { max } = this._getLimit();

      if (!isNumeric(step)) {
        step = 1;
      } else {
        step = Number(step);
      }

      let value = this._getValue();
      if (isNil(value)) return
      value = Number(value);

      if (!this._formatter) this._initNumberFormat();
      const displayValue = this._format(value + step);

      let newValue = '';

      if (isFunction$1(parser)) {
        newValue = parser(displayValue);
      } else if (style === STYLE.CURRENCY) {
        newValue = currencyToValue(displayValue);
      } else if (style === STYLE.PERCENT) {
        // newValue = Number(displayValue.replace(COMMA_REG, ''))
        newValue = precentToValue(displayValue);
      } else {
        newValue = Number(displayValue.replace(COMMA_REG, ''));
      }

      if (newValue > max) {
        this.setValue(max);
      } else {
        this.setValue(newValue);
        if (isFunction$1(this.props.onStep))
          this.props.onStep(this.getValue(), { offset: step, type: 'plus' });
      }

      !this._isFocus() && this.focus();
    }

    _handleMinus(args) {
      if (args) {
        const { event } = args;
        if (event) {
          event.preventDefault && event.preventDefault();
          event.stopPropagation && event.stopPropagation();
        }
      }

      let { step } = this.props;
      const { style, parser } = this.props;
      const { min } = this._getLimit();

      if (!isNumeric(step)) {
        step = 1;
      } else {
        step = Number(step);
      }

      let value = this._getValue();
      if (isNil(value)) return
      value = Number(value);

      if (!this._formatter) this._initNumberFormat();
      // currency ??????????????????????????????
      const displayValue = this._format(value - step);

      let newValue = '';

      if (isFunction$1(parser)) {
        newValue = parser(displayValue);
      } else if (style === STYLE.CURRENCY) {
        newValue = currencyToValue(displayValue);
      } else if (style === STYLE.PERCENT) {
        newValue = precentToValue(displayValue);
      } else {
        newValue = Number(displayValue.replace(COMMA_REG, ''));
      }

      if (newValue < min) {
        this.setValue(min);
      } else {
        this.setValue(newValue);
        if (isFunction$1(this.props.onStep))
          this.props.onStep(this.getValue(), { offset: step, type: 'minus' });
      }

      !this._isFocus() && this.focus();
    }

    _getLimit() {
      let { max, min } = this.props;
      const { style } = this.props;

      if (isNil(max) || !isNumeric(max)) {
        max = style === STYLE.PERCENT ? 100 : Number.MAX_SAFE_INTEGER;
      }

      if (isNil(min) || !isNumeric(min)) {
        min = style === STYLE.PERCENT ? 0 : Number.MIN_SAFE_INTEGER;
      }

      return { max, min }
    }

    _initNumberFormat() {
      const { formatter, precision, style, currency } = this.props;

      // ?????????????????????????????????formatter?????????????????????formatter???
      if (isFunction$1(formatter)) {
        this._format = formatter;
        return
      }

      if (style !== STYLE.CURRENCY) {
        this._formatter = new Intl.NumberFormat(undefined, {
          minimumFractionDigits: precision,
        });

        if (style === STYLE.DECIMAL) {
          this._format = this._formatter.format;
        } else if (style === STYLE.PERCENT) {
          this._format = function (value) {
            return `${this._formatter.format(value)}%`
          };
        }
      } else {
        this._formatter = new Intl.NumberFormat(undefined, {
          style: STYLE.CURRENCY,
          currency,
          minimumFractionDigits: precision,
        });
        this._format = this._formatter.format;
      }
    }
  }

  Component.register(NumberSpinner);

  class Pager extends Component {
    constructor(props, ...mixins) {
      super(Component.extendProps(Pager.defaults, props), ...mixins);
    }

    _config() {
      const pager = this;

      this.setProps({
        children: {
          component: 'Cols',
          justify: 'between',
          items: [
            {
              component: List,
              gutter: 'md',
              items: pager.getPageItems(),
              itemDefaults: {
                tag: 'a',
                key() {
                  return this.props.pageNumber
                },
                _config: function () {
                  this.setProps({
                    children: `${this.props.text}`,
                  });
                },
              },
              itemSelectable: {
                byClick: true,
                scrollIntoView: false,
              },
              selectedItems: pager.props.pageIndex,
              onItemSelectionChange: function (e) {
                const n = e.sender.selectedItem.props.pageNumber;

                if (n < 1) {
                  pager.props.pageIndex = 1;
                } else if (n > pager._getPageCount()) {
                  pager.props.pageIndex = pager._getPageCount();
                } else {
                  pager.props.pageIndex = n;
                }

                pager._onPageChange();
              },
            },
            {
              component: 'Cols',
              gutter: 'xs',
              items: [
                {
                  children: `????????????${this.props.totalCount}???`,
                },
                {
                  component: 'Select',
                  value: pager.props.pageSize || 10,
                  onValueChange: (data) => {
                    pager.props.pageSize = data.newValue;
                    pager._onPageChange();
                  },
                  options: [
                    {
                      text: '10???/???',
                      value: 10,
                    },
                    {
                      text: '20???/???',
                      value: 20,
                    },
                    {
                      text: '30???/???',
                      value: 30,
                    },
                    {
                      text: '40???/???',
                      value: 40,
                    },
                    {
                      text: '50???/???',
                      value: 50,
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    }

    _onPageChange() {
      this._callHandler(this.props.onPageChange, this.getPageParams());
    }

    /**
     * ?????????????????????????????????????????????pageIndex ??? displayItemCount.
     * @?????? {??????(Array)}
     */
    _getInterval() {
      const { props } = this;
      const { pageIndex } = props;
      const displayItemHalf = Math.floor(props.displayItemCount / 2);
      const pageCount = this._getPageCount();
      const upperLimit = pageCount - props.displayItemCount;
      const start =
        pageIndex > displayItemHalf
          ? Math.max(Math.min(pageIndex - displayItemHalf, upperLimit), 1)
          : 1;
      const end =
        pageIndex > displayItemHalf
          ? Math.min(pageIndex + displayItemHalf, pageCount)
          : Math.min(props.displayItemCount, pageCount);
      return [start, end]
    }

    _getPageCount() {
      return Math.ceil(this.props.totalCount / this.props.pageSize)
    }

    getPageParams() {
      return this.props.getPageParams.call(this)
    }

    getPageItems() {
      const items = [];
      const { props } = this;
      if (props.totalCount === 0) {
        return items
      }
      const { pageIndex } = props;
      const interval = this._getInterval();
      const pageCount = this._getPageCount();

      // ??????"Previous"-??????
      if (props.texts.prev && (pageIndex > 1 || props.prevShowAlways)) {
        items.push({
          pageNumber: pageIndex - 1,
          text: props.texts.prev,
          classes: { prev: true },
        });
      }
      // ???????????????
      if (interval[0] > 1 && props.edgeItemCount > 0) {
        const end = Math.min(props.edgeItemCount, interval[0] - 1);
        for (let i = 1; i <= end; i++) {
          items.push({
            pageNumber: i,
            text: i,
            classes: '',
          });
        }
        if (props.edgeItemCount < interval[0] - 1 && props.texts.ellipse) {
          items.push({
            pageNumber: null,
            text: props.texts.ellipse,
            classes: { space: true },
            space: true,
          });
        }
      }

      // ???????????????????????????
      for (let i = interval[0]; i <= interval[1]; i++) {
        items.push({
          pageNumber: i,
          text: i,
          classes: '',
        });
      }
      // ???????????????
      if (interval[1] < pageCount && props.edgeItemCount > 0) {
        if (pageCount - props.edgeItemCount > interval[1] && props.texts.ellipse) {
          items.push({
            pageNumber: null,
            text: props.texts.ellipse,
            classes: { space: true },
            space: true,
          });
        }
        const begin = Math.max(pageCount - props.edgeItemCount + 1, interval[1]);
        for (let i = begin; i <= pageCount; i++) {
          items.push({
            pageNumber: i,
            text: i,
            classes: '',
          });
        }
      }
      // ?????? "Next"-??????
      if (props.texts.next && (pageIndex < pageCount || props.nextShowAlways)) {
        items.push({
          pageNumber: pageIndex + 1,
          text: props.texts.next,
          classes: { next: true },
        });
      }

      return items
    }
  }

  Pager.defaults = {
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    displayItemCount: 5,
    edgeItemCount: 1,

    prevShowAlways: true,
    nextShowAlways: true,

    texts: {
      prev: '?????????',
      next: '?????????',
      ellipse: '...',
    },

    getPageParams: function () {
      const { pageIndex, pageSize } = this.props;
      let params = {};
      if (this.props.paramsType === 'skiptake') {
        params = {
          skipCount: (pageIndex - 1) * pageSize,
          maxResultCount: pageSize,
        };
      } else {
        params = {
          pageIndex: pageIndex,
          pageSize: pageSize,
        };
      }

      return params
    },
  };

  Component.register(Pager);

  class PartialDatePicker extends Textbox {
    constructor(props, ...mixins) {
      const defaults = {
        yearRange: [50, 20],
        mode: 'year',
        allowClear: true,
        onChange: null,
        placeholder: '????????????',
        value: null,
        minDate: null,
        maxDate: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
      this.year = null;
      this.quarter = null;
      this.month = null;
      this.week = null;
      this.hasRange = false;
      this.minSub = '00';
      this.maxSub = '60';
    }

    _config() {
      const { disabled, placeholder } = this.props;

      const that = this;

      this.setProps({
        leftIcon: 'calendar',
        rightIcon: {
          component: 'Icon',
          type: 'times',
          hidden: !this.props.allowClear,
          onClick: (args) => {
            this.clearTime();
            args.event && args.event.stopPropagation();
          },
        },
        control: {
          disabled: disabled,
          placeholder: placeholder,
          popup: {
            _created: function () {
              that.popup = this;
            },
            classes: {
              'nom-partial-date-picker-popup': true,
            },
            styles: {
              padding: '1',
            },
            attrs: {
              style: {
                width: 'auto',
                height: '240px',
              },
            },
            triggerAction: 'click',
            onShow: () => {
              if (!that.getValue()) {
                that.yearPicker.scrollTo(new Date().format('yyyy'));
              } else {
                that.activeItem();
              }
              this.hasRange && this.updateList();
            },
            onHide: () => {
              that.getValue() &&
                that.props.onChange &&
                that._callHandler(that.props.onChange, that.getValue());
            },

            children: {
              component: 'Cols',
              gutter: null,
              fills: true,
              align: 'stretch',
              children: [
                {
                  children: {
                    component: 'List',
                    items: that._getYear(),
                    itemSelectable: {
                      multiple: false,
                      byClick: true,
                    },
                    gutter: 'sm',
                    cols: 1,
                    ref: (c) => {
                      that.yearPicker = c;
                    },

                    onItemSelectionChange: (args) => {
                      const key = args.sender.props.selectedItems;
                      that.handleYearChange(key);
                    },
                    itemDefaults: {
                      _config: function () {
                        const key = this.props.key;

                        if (key < that.minYear || key > that.maxYear) {
                          this.setProps({
                            disabled: true,
                          });
                        }
                      },
                    },
                  },
                },
                that.props.mode === 'quarter' && {
                  children: {
                    component: 'List',
                    items: that._getQuarter(),
                    itemSelectable: {
                      multiple: false,
                      byClick: true,
                    },
                    gutter: 'sm',
                    cols: 1,
                    ref: (c) => {
                      that.quarterPicker = c;
                      if (that.props.mode === 'quarter') {
                        that.subPicker = c;
                      }
                    },

                    onItemSelectionChange: (args) => {
                      const key = args.sender.props.selectedItems;
                      that.handleQuarterChange(key);
                    },
                    itemDefaults: {
                      _config: function () {
                        const key = this.props.key;

                        if (
                          parseInt(key, 10) < parseInt(that.minSub, 10) ||
                          parseInt(key, 10) > parseInt(that.maxSub, 10)
                        ) {
                          this.setProps({
                            disabled: true,
                          });
                        }
                      },
                    },
                  },
                },
                that.props.mode === 'month' && {
                  children: {
                    component: 'List',
                    items: that._getMonth(),
                    itemSelectable: {
                      multiple: false,
                      byClick: true,
                    },
                    gutter: 'sm',
                    cols: 1,
                    ref: (c) => {
                      that.monthPicker = c;
                      if (that.props.mode === 'month') {
                        that.subPicker = c;
                      }
                    },

                    onItemSelectionChange: (args) => {
                      const key = args.sender.props.selectedItems;
                      that.handleMonthChange(key);
                    },
                    itemDefaults: {
                      _config: function () {
                        const key = this.props.key;

                        if (
                          parseInt(key, 10) < parseInt(that.minSub, 10) ||
                          parseInt(key, 10) > parseInt(that.maxSub, 10)
                        ) {
                          this.setProps({
                            disabled: true,
                          });
                        }
                      },
                    },
                  },
                },
                that.props.mode === 'week' && {
                  hidden: !this.year,
                  children: {
                    component: 'List',

                    items: that._getWeek('2010'),
                    itemSelectable: {
                      multiple: false,
                      byClick: true,
                    },
                    gutter: 'sm',
                    cols: 1,
                    ref: (c) => {
                      that.weekPicker = c;
                      if (that.props.mode === 'week') {
                        that.subPicker = c;
                      }
                    },
                    _created: (me) => {
                      me.parent.setProps({
                        classes: {
                          'nom-week-list': true,
                        },
                      });
                    },
                    onItemSelectionChange: (args) => {
                      const key = args.sender.props.selectedItems;
                      that.handleWeekChange(key);
                    },
                    itemDefaults: {
                      _config: function () {
                        const key = this.props.key;

                        if (
                          parseInt(key, 10) < parseInt(that.minSub, 10) ||
                          parseInt(key, 10) > parseInt(that.maxSub, 10)
                        ) {
                          this.setProps({
                            disabled: true,
                          });
                        }
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      });

      super._config();
    }

    _rendered() {
      if (this.props.value) {
        this.resolveValue();
      }
      if (this.props.minDate || this.props.maxDate) {
        this.resolveRange();
      }
    }

    _getYear() {
      const years = [];
      const thisYear = new Date().getFullYear();

      for (let i = thisYear + this.props.yearRange[1]; i > thisYear - this.props.yearRange[0]; i--) {
        years.push({
          key: `${i}`,
          children: `${i}???`,
        });
      }

      return years
    }

    _getMonth() {
      const month = [];
      const that = this;

      for (let i = 1; i < 13; i++) {
        month.push({
          key: that._getDoubleDigit(i),
          children: `${i}???`,
        });
      }
      return month
    }

    _getQuarter() {
      const quarter = [];

      for (let i = 1; i < 5; i++) {
        quarter.push({
          key: `${i}`,
          children: `${i}??????`,
        });
      }
      return quarter
    }

    _mapWeekData(param) {
      if (!param) return
      const that = this;
      // ?????????????????????  ???????????????????????? ???????????????????????? ??????????????? ??? ???
      function yearDay(long) {
        const time = new Date(long * 1000);
        const year = `${time.getFullYear()}`;
        const month = that._getDoubleDigit(time.getMonth() + 1);
        const day = that._getDoubleDigit(time.getDate());
        const yearday = { year, month, day };
        return yearday
      }
      // ???????????????????????????????????????????????????
      // ????????????1???1?????? ????????? ???????????????
      // ???????????? ????????? ??????????????? ??????????????????
      // ???????????? ????????????52????????????
      // ?????????????????????12???31??????????????????????????????54????????????53???
      // 12???31 ???????????????????????????????????????????????????
      // ???????????? ?????????????????????????????????????????????????????? ???????????????????????????????????????
      function whichWeek(year) {
        const d = new Date(parseInt(year, 10), 0, 1);
        while (d.getDay() !== 1) {
          d.setDate(d.getDate() + 1);
        }
        const arr = [];
        const longnum = d.setDate(d.getDate());
        if (longnum > +new Date(parseInt(year, 10), 0, 1)) {
          const obj = yearDay(+new Date(year, 0, 1) / 1000);
          obj.last = yearDay(longnum / 1000 - 86400);
          arr.push(obj);
        }
        const oneitem = yearDay(longnum / 1000);
        oneitem.last = yearDay(longnum / 1000 + 86400 * 6);
        arr.push(oneitem);
        let lastStr;
        for (let i = 0; i < 51; i++) {
          const long = d.setDate(d.getDate() + 7);
          const obj = yearDay(long / 1000);
          obj.last = yearDay(long / 1000 + 86400 * 6);
          lastStr = long + 86400000 * 6;
          arr.push(obj);
        }
        if (lastStr < +new Date(parseInt(year, 10) + 1, 0, 1)) {
          const obj = yearDay(lastStr / 1000 + 86400);
          obj.last = yearDay(+new Date(parseInt(year, 10) + 1, 0, 1) / 1000 - 86400);
          arr.push(obj);
        } else {
          arr[arr.length - 1].last = yearDay(+new Date(parseInt(year, 10) + 1, 0, 1) / 1000 - 86400);
        }
        return arr
      }

      return whichWeek(param)
    }

    _getWeek(param) {
      const week = this._mapWeekData(param).map(function (item, index) {
        return {
          key: `${index + 1}`,
          firstDay: `${item.year}-${item.month}-${item.day}`,
          children: {
            component: 'List',
            items: [
              { children: `${index + 1}???` },
              {
                classes: {
                  'nom-week-subtitle': true,
                },
                children: `(${item.year}/${item.month}/${item.day} - ${item.last.year}/${item.last.month}/${item.last.day})`,
              },
            ],
          },
        }
      });

      return week
    }

    _getDoubleDigit(num) {
      if (num < 10) {
        return `0${num}`
      }
      return `${num}`
    }

    showPopup() {
      this.popup.show();
    }

    clearTime() {
      this.year = null;
      this.quarter = null;
      this.month = null;
      this.week = null;
      this.setValue(null);
    }

    handleYearChange(key) {
      this.year = key;

      let noUpdate = false;

      if (this.hasRange) {
        if (this.year <= this.minYear) {
          this.minSub = this.minAfter;
          this.setValue(null);
          this.subPicker.unselectAllItems();
          noUpdate = true;
        } else {
          this.minSub = '00';
        }
        if (this.year >= this.maxYear) {
          this.maxSub = this.maxAfter;
          this.setValue(null);
          this.subPicker.unselectAllItems();
          noUpdate = true;
        } else {
          this.maxSub = '60';
        }
        this.updateList(true);
      }

      if (this.props.mode === 'week') {
        this.setValue(null);
        this.weekPicker.parent.props.hidden &&
          this.weekPicker.parent.update({
            hidden: false,
          });
        this.weekPicker.update({
          items: this._getWeek(this.year),
        });
        this.weekPicker.unselectAllItems();
        noUpdate = true;
      }

      !noUpdate && this.updateValue();
    }

    handleQuarterChange(key) {
      this.quarter = key;
      this.updateValue();
    }

    handleMonthChange(key) {
      this.month = key;
      this.updateValue();
    }

    handleWeekChange(key) {
      this.week = key;
      this.updateValue();
    }

    updateValue() {
      switch (this.props.mode) {
        case 'year':
          this.year && this.setValue(this.year);
          break

        case 'quarter':
          this.year && this.quarter && this.setValue(`${this.year} ${this.quarter}??????`);
          break

        case 'month':
          this.year &&
            this.month &&
            this.setValue(new Date(`${this.year}-${this.month}`).format('yyyy-MM'));
          break

        case 'week':
          this.year && this.week && this.setValue(`${this.year} ${this.week}???`);
          break
      }
    }

    resolveValue() {
      const v = this.getValue();
      const year = this.props.mode === 'year' ? v : v.substring(0, 4);
      const after = this.props.mode === 'year' ? null : Math.abs(parseInt(v.substring(4), 10));

      this.year = year;
      switch (this.props.mode) {
        case 'year':
          break
        case 'quarter':
          this.quarter = `${after}`;
          break
        case 'month':
          this.month = `${after}`;
          break
        case 'week':
          this.week = `${after}`;
          break
      }
    }

    resolveRange() {
      const min = this.props.minDate;
      const max = this.props.maxDate;
      if (min) {
        this.minYear = this.props.mode === 'year' ? min : min.substring(0, 4);
        this.minAfter = this.props.mode === 'year' ? null : Math.abs(parseInt(min.substring(4), 10));
        this.hasRange = true;
      }
      if (max) {
        this.maxYear = this.props.mode === 'year' ? max : max.substring(0, 4);
        this.maxAfter = this.props.mode === 'year' ? null : Math.abs(parseInt(max.substring(4), 10));
        this.hasRange = true;
      }
    }

    activeItem() {
      this.yearPicker.selectItem(this.year);

      switch (this.props.mode) {
        case 'year':
          break
        case 'quarter':
          this.subPicker.selectItem(this.quarter);
          break
        case 'month':
          this.subPicker.selectItem(this.month);
          break
        case 'week':
          this.subPicker.selectItem(this.week);
          break
      }
    }

    updateList(noyear) {
      if (!noyear) {
        this.yearPicker.update();
      }

      this.props.mode !== 'year' && this.subPicker.update();
    }

    getDateString(format) {
      if (!this.getValue()) {
        return null
      }
      let date = null;
      switch (this.props.mode) {
        case 'year':
          date = new Date(this.year);
          break
        case 'quarter':
          switch (this.quarter) {
            case '1':
              date = new Date(`${this.year}-01-01`);
              break
            case '2':
              date = new Date(`${this.year}-04-01`);
              break
            case '3':
              date = new Date(`${this.year}-07-01`);
              break
            case '4':
              date = new Date(`${this.year}-10-01`);
              break
          }

          break
        case 'month':
          date = new Date(this.getValue());
          break
        case 'week': {
          const time = this._mapWeekData(this.year)[parseInt(this.week, 10) - 1];
          date = new Date(time.year, time.month - 1, time.day);
          break
        }
      }

      return date.format(format || 'yyyy-MM-dd')
    }
  }

  Component.register(PartialDatePicker);

  class PartialDateRangePicker extends Group {
    constructor(props, ...mixins) {
      const defaults = {
        mode: 'year',
        minDate: null,
        maxDate: null,
        yearRange: [50, 20],
        allowClear: true,
        onChange: null,
        fieldName: {
          start: 'start',
          end: 'end',
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
    }

    _config() {
      const that = this;
      const { allowClear, minDate, maxDate, yearRange, mode } = this.props;

      this.setProps({
        inline: true,
        fields: [
          {
            component: 'PartialDatePicker',
            name: that.props.fieldName.start,
            placeholder: '????????????',
            ref: (c) => {
              that.startPicker = c;
            },
            onChange: function (args) {
              that.checkRange(args.sender.name);
            },
            allowClear,
            minDate,
            maxDate,
            yearRange,
            mode,
          },
          {
            component: 'StaticText',
            value: '-',
          },
          {
            component: 'PartialDatePicker',
            name: that.props.fieldName.end,
            placeholder: '????????????',
            ref: (c) => {
              that.endPicker = c;
            },
            onChange: function (args) {
              that.checkRange(args.sender.name);
            },
            allowClear,
            minDate,
            maxDate,
            yearRange,
            mode,
          },
        ],
      });

      super._config();
    }

    handleChange() {
      this.props.onChange && this._callHandler(this.props.onChange);
    }

    checkRange(type) {
      const that = this;
      const active = type === this.props.fieldName.start ? this.startPicker : this.endPicker;
      const opposite = type === this.props.fieldName.start ? this.endPicker : this.startPicker;

      if (active.getValue()) {
        if (active.name === that.props.fieldName.start) {
          opposite.update({ minDate: active.getValue() });
          if (opposite.getValue() && opposite.getValue() < active.getValue()) {
            opposite.clearTime();
            opposite.focus();

            opposite.showPopup();
          } else if (!opposite.getValue()) {
            opposite.focus();

            opposite.showPopup();
          }
        } else if (opposite.getValue() && opposite.getValue() > active.getValue()) {
          opposite.clearTime();
        }
      }

      if (active.getValue() && opposite.getValue()) {
        that.handleChange();
      }
    }
  }

  Component.register(PartialDateRangePicker);

  class Password extends Textbox {
    constructor(props, ...mixins) {
      const defaults = {};

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
      this.realValue = '';
      this.hasDefaultValue = false;
      if (this.props.value) {
        this.realValue = this.props.value;

        this.hasDefaultValue = true;
      }
    }

    _config() {
      const that = this;
      const { onValueChange } = this.props;

      this.setProps({
        onValueChange: () => {
          const pass = that.getText();

          const start = that.input.element.selectionStart; // ????????????

          const fake = pass ? pass.split('') : [];
          let real = that.realValue ? that.realValue.split('') : [];
          const clen = fake.length - real.length;

          // ??????Value
          if (!pass) {
            that.realValue = null;
          } else {
            if (clen > 0) {
              const middle = fake.join('').replace(/\*/g, '').split('');
              const right = fake.length - start > 0 ? real.slice(-(fake.length - start)) : [];
              real = [].concat(real.slice(0, start - middle.length), middle, right);
            }

            if (clen < 0) {
              real.splice(start, Math.abs(clen));
            }
            fake.forEach(function (value, index) {
              if (value !== '*') {
                real[index] = value;
              }
            });
            that.realValue = real.join('');
          }

          that.setValue(pass ? pass.replace(/./g, '*') : null);

          // ???????????????????????????

          if (pass && start < pass.length) {
            that.input.element.selectionStart = start;
            that.input.element.selectionEnd = start;
          }

          that._callHandler(onValueChange);
        },
      });

      super._config();
    }

    _rendered() {
      if (this.hasDefaultValue && this.firstRender) {
        let stars = '';
        for (let i = 0; i < this.realValue.length; i++) {
          stars = `*${stars}`;
        }
        this.setValue(stars);
      }
    }

    _getValue() {
      if (!this.realValue || this.realValue === '') {
        return null
      }
      return this.realValue
    }
  }

  Component.register(Password);

  class Popconfirm extends Popup {
    constructor(props, ...mixins) {
      const defaults = {
        triggerAction: 'click',
        closeOnClickOutside: false,
        content: null,
        onConfirm: null,
        okText: '???',
        cancelText: '???',
        icon: 'info-circle',
        align: 'top left',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const that = this;

      const { content, okText, cancelText, icon } = this.props;
      this.setProps({
        children: {
          attrs: {
            style: {
              'max-width': '350px',
              padding: '15px',
            },
          },
          children: {
            component: 'Rows',
            items: [
              {
                component: 'Cols',
                items: [
                  {
                    component: 'Icon',
                    type: icon,
                    attrs: {
                      style: {
                        'font-size': '2.5rem',
                        color: '#fa0',
                      },
                    },
                  },
                  { children: isString(content) ? content : content() },
                ],
              },
              {
                component: 'Cols',
                justify: 'end',
                gutter: 'sm',
                items: [
                  {
                    component: 'Button',
                    styles: {
                      color: 'primary',
                    },

                    text: okText,
                    onClick: () => {
                      that._handleOk();
                    },
                  },
                  {
                    component: 'Button',
                    text: cancelText,

                    onClick: () => {
                      that._handleCancel();
                    },
                  },
                ],
              },
            ],
          },
        },
      });
      super._config();
    }

    _handleOk() {
      this._callHandler(this.props.onConfirm);
      this.hide();
    }

    _handleCancel() {
      this.hide();
    }
  }

  Component.mixin({
    _rendered: function () {
      if (this.props.popconfirm) {
        if (isString(this.props.popconfirm)) {
          this.popconfirm = new Popconfirm({ trigger: this, children: this.props.popconfirm });
        } else {
          this.popconfirm = new Popconfirm(
            Component.extendProps({}, this.props.popconfirm, {
              trigger: this,
            }),
          );
        }
      }
    },
  });

  Component.register(Popconfirm);

  let gradientSeed = 0;

  function stripPercentToNumber(percent) {
    return +percent.replace('%', '')
  }

  function toArray(symArray) {
    return Array.isArray(symArray) ? symArray : [symArray]
  }

  function getPathStyles(offset, percent, strokeColor, strokeWidth, gapDegree = 0, gapPosition) {
    const radius = 50 - strokeWidth / 2;
    let beginPositionX = 0;
    let beginPositionY = -radius;
    let endPositionX = 0;
    let endPositionY = -2 * radius;
    switch (gapPosition) {
      case 'left':
        beginPositionX = -radius;
        beginPositionY = 0;
        endPositionX = 2 * radius;
        endPositionY = 0;
        break
      case 'right':
        beginPositionX = radius;
        beginPositionY = 0;
        endPositionX = -2 * radius;
        endPositionY = 0;
        break
      case 'bottom':
        beginPositionY = radius;
        endPositionY = 2 * radius;
        break
    }
    const pathString = `M 50,50 m ${beginPositionX},${beginPositionY}
   a ${radius},${radius} 0 1 1 ${endPositionX},${-endPositionY}
   a ${radius},${radius} 0 1 1 ${-endPositionX},${endPositionY}`;
    const len = Math.PI * 2 * radius;
    const pathStyle = {
      stroke: strokeColor,
      'stroke-dasharray': `${(percent / 100) * (len - gapDegree)}px ${len}px`,
      'stroke-dashoffset': `-${gapDegree / 2 + (offset / 100) * (len - gapDegree)}px`,
      transition:
        'stroke-dashoffset .3s ease 0s, stroke-dasharray .3s ease 0s, stroke .3s, stroke-width .06s ease .3s, opacity .3s ease 0s', // eslint-disable-line
    };

    return {
      pathString,
      pathStyle,
    }
  }

  class CirclePath extends Component {
    constructor(props, ...mixins) {
      const defaults = {};
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const {
        prefixCls,
        strokeWidth,
        trailWidth,
        gapDegree,
        gapPosition,
        trailColor,
        strokeLinecap,
        style,
        strokeColor,
        percent,
      } = this.props;

      gradientSeed += 1;
      const gradientId = gradientSeed;

      const { pathString, pathStyle } = getPathStyles(
        0,
        100,
        trailColor,
        strokeWidth,
        gapDegree,
        gapPosition,
      );
      const percentList = toArray(percent);
      const strokeColorList = toArray(strokeColor);
      const gradient = strokeColorList.find(
        (color) => Object.prototype.toString.call(color) === '[object Object]',
      );

      const getStokeList = () => {
        let stackPtg = 0;
        return percentList
          .map((ptg, index) => {
            const color = strokeColorList[index] || strokeColorList[strokeColorList.length - 1];
            const stroke =
              Object.prototype.toString.call(color) === '[object Object]'
                ? `url(#${prefixCls}-gradient-${gradientId})`
                : '';
            const pathStyles = getPathStyles(
              stackPtg,
              ptg,
              color,
              strokeWidth,
              gapDegree,
              gapPosition,
            );
            stackPtg += ptg;
            return {
              tag: 'path',
              classes: {
                [`${prefixCls}-circle-path`]: true,
              },
              attrs: {
                d: pathStyles.pathString,
                stroke: stroke,
                'stroke-linecap': strokeLinecap,
                'stroke-width': strokeWidth,
                opacity: ptg === 0 ? 0 : 1,
                'fill-opacity': '0',
                style: {
                  ...pathStyles.pathStyle,
                },
              },
            }
          })
          .reverse()
      };

      this.setProps({
        tag: 'svg',
        classes: {
          [`${prefixCls}-circle`]: true,
        },
        attrs: {
          viewBox: '0 0 100 100',
          xmlns: 'http://www.w3.org/2000/svg',
          // 'xmlns:xlink': 'http://www.w3.org/1999/xlink',
          'xml:space': 'preserve',
          ...style,
        },
        children: [
          gradient
            ? {
                tag: 'defs',
                children: {
                  tag: 'linearGradient',
                  attrs: {
                    id: `${prefixCls}-gradient-${gradientId}`,
                    x1: '100%',
                    y1: '0%',
                    x2: '0%',
                    y2: '0%',
                  },
                  children: Object.keys(gradient)
                    .sort((a, b) => stripPercentToNumber(a) - stripPercentToNumber(b))
                    .map((key) => {
                      return {
                        tag: 'stop',
                        attrs: {
                          offset: key,
                          'stop-color': gradient[key],
                          'transition-duration': '.3s, .3s, .3s, .06s',
                        },
                      }
                    }),
                },
              }
            : undefined,
          {
            tag: 'path',
            classes: {
              [`${prefixCls}-circle-trail`]: true,
            },
            attrs: {
              d: pathString,
              stroke: trailColor,
              'stroke-linecap': strokeLinecap,
              'stroke-width': trailWidth || strokeWidth,
              'fill-opacity': '0',
              style: {
                ...pathStyle,
              },
            },
          },
          ...getStokeList(),
        ],
        _rendered() {
          this.element.outerHTML = `${this.element.outerHTML}`;
        },
      });
    }
  }

  function validProgress(progress) {
    if (!progress || progress < 0) {
      return 0
    }
    if (progress > 100) {
      return 100
    }
    return progress
  }

  /**
   * @example
   *   {
   *     "0%": "#afc163",
   *     "75%": "#009900",
   *     "50%": "green", // ====> '#afc163 0%, #66FF00 25%, #00CC00 50%, #009900 75%, #ffffff 100%'
   *     "25%": "#66FF00",
   *     "100%": "#ffffff"
   *   }
   */
  function sortGradient(gradients) {
    let tempArr = [];
    Object.keys(gradients).forEach((key) => {
      const formattedKey = parseFloat(key.replace(/%/g, ''));
      if (!Number.isNaN(formattedKey)) {
        tempArr.push({
          key: formattedKey,
          value: gradients[key],
        });
      }
    });
    tempArr = tempArr.sort((a, b) => a.key - b.key);
    return tempArr.map(({ key, value }) => `${value} ${key}%`).join(', ')
  }

  /**
   * Then this man came to realize the truth: Besides six pence, there is the moon. Besides bread and
   * butter, there is the bug. And... Besides women, there is the code.
   *
   * @example
   *   {
   *     "0%": "#afc163",
   *     "25%": "#66FF00",
   *     "50%": "#00CC00", // ====>  linear-gradient(to right, #afc163 0%, #66FF00 25%,
   *     "75%": "#009900", //        #00CC00 50%, #009900 75%, #ffffff 100%)
   *     "100%": "#ffffff"
   *   }
   */
  const handleGradient = (strokeColor) => {
    const { from = 'blue', to = 'blue', direction = 'to right', ...rest } = strokeColor;
    if (Object.keys(rest).length !== 0) {
      const sortedGradients = sortGradient(rest);
      return { backgroundImage: `linear-gradient(${direction}, ${sortedGradients})` }
    }
    return { backgroundImage: `linear-gradient(${direction}, ${from}, ${to})` }
  };

  class ProgressCircle extends Component {
    static _prefixClass = 'nom-progress'

    constructor(props, ...mixins) {
      const defaults = {
        width: 120,
        // strokeWidth:6
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _getGapDegree() {
      const { gapDegree, type } = this.props;
      // Support gapDeg = 0 when type = 'dashboard'
      if (gapDegree || gapDegree === 0) {
        return gapDegree
      }
      if (type === 'dashboard') {
        return 75
      }
      return undefined
    }

    _getPercentage({ percent, success }) {
      const ptg = validProgress(percent);
      const realSuccessPercent = success.percent;
      if (!realSuccessPercent) {
        return ptg
      }
      return [
        validProgress(realSuccessPercent),
        validProgress(ptg - validProgress(realSuccessPercent)),
      ]
    }

    _getStrokeColor() {
      const { success = {}, strokeColor } = this.props;
      const color = strokeColor || null;
      const realSuccessPercent = success.percent;
      if (!realSuccessPercent) {
        return color
      }
      return ['#52c41a', color]
    }

    _config() {
      const {
        width,
        strokeLinecap,
        percent,
        strokeWidth,
        gapPosition,
        trailColor,
        type,
        success = {},
        children,
      } = this.props;

      const circleWidth = strokeWidth || 6;
      const gapPos = gapPosition || (type === 'dashboard' && 'bottom') || 'top';

      // using className to style stroke color
      const strokeColor = this._getStrokeColor();
      const isGradient = Object.prototype.toString.call(strokeColor) === '[object Object]';
      const successPercent = this._getPercentage({ percent, success });
      const gapDegree = this._getGapDegree();
      this.setProps({
        classes: {
          [`${ProgressCircle._prefixClass}-inner`]: true,
          [`${ProgressCircle._prefixClass}-circle-gradient`]: isGradient,
        },
        attrs: {
          style: {
            width: `${width}px`,
            height: `${width}px`,
            fontSize: width * 0.15 + 6,
          },
        },
        children: [
          {
            component: CirclePath,
            percent: successPercent,
            strokeWidth: circleWidth,
            trailWidth: circleWidth,
            strokeColor: strokeColor,
            strokeLinecap: strokeLinecap,
            trailColor: trailColor,
            prefixCls: ProgressCircle._prefixClass,
            gapDegree: gapDegree,
            gapPosition: gapPos,
          },
          children,
        ],
      });
    }
  }

  class ProgressLine extends Component {
    static _prefixClass = 'nom-progress'

    constructor(props, ...mixins) {
      const defaults = {
        // steps:100,
        // strokeColor:'',
        strokeWidth: 10,
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const {
        size,
        strokeLinecap,
        strokeColor,
        percent,
        strokeWidth,
        trailColor,
        success = {},
        children,
      } = this.props;

      const successPercent = success.percent;

      const successSegment =
        successPercent !== undefined
          ? {
              classes: {
                [`${ProgressLine._prefixClass}-success-bg`]: true,
              },
              attrs: {
                style: {
                  width: `${validProgress(successPercent)}%`,
                  height: `${strokeWidth}px` || (size === 'small' ? '6px' : '8px'),
                  borderRadius: strokeLinecap === 'square' ? 0 : '',
                  backgroundColor: success.strokeColor,
                },
              },
            }
          : null;

      const trailStyle = trailColor
        ? {
            backgroundColor: trailColor,
          }
        : undefined;

      const backgroundProps =
        strokeColor && typeof strokeColor !== 'string'
          ? handleGradient(strokeColor)
          : {
              background: strokeColor,
            };

      const percentStyle = {
        width: `${validProgress(percent)}%`,
        height: `${strokeWidth || (size === 'small' ? 6 : 8)}px`,
        borderRadius: strokeLinecap === 'square' ? 0 : '',
        ...backgroundProps,
      };

      this.setProps({
        children: [
          {
            classes: {
              [`${ProgressLine._prefixClass}-outer`]: true,
            },
            children: {
              classes: {
                [`${ProgressLine._prefixClass}-inner`]: true,
              },
              attrs: {
                style: trailStyle,
              },
              children: [
                {
                  classes: {
                    [`${ProgressLine._prefixClass}-bg`]: true,
                  },
                  attrs: {
                    style: percentStyle,
                  },
                },
                successSegment,
              ],
            },
          },
          children,
        ],
      });
    }
  }

  class ProgressSteps extends Component {
    static _prefixClass = 'nom-progress'

    constructor(props, ...mixins) {
      const defaults = {
        strokeWidth: 8,
        percent: 0,
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { size, strokeColor, percent, strokeWidth, trailColor, steps, children } = this.props;
      const current = Math.round(steps * (percent / 100));
      const stepWidth = size === 'small' ? 2 : 14;
      const styledSteps = [];
      for (let i = 0; i < steps; i += 1) {
        styledSteps.push({
          classes: {
            [`${ProgressSteps._prefixClass}-steps-item`]: true,
            [`${ProgressSteps._prefixClass}-steps-item-active`]: i <= current - 1,
          },
          attrs: {
            style: {
              backgroundColor: i <= current - 1 ? strokeColor : trailColor,
              width: `${stepWidth}px`,
              height: `${strokeWidth}px`,
            },
          },
        });
      }

      this.setProps({
        classes: {
          [`${ProgressSteps._prefixClass}-steps-outer`]: true,
        },
        children: [...styledSteps, children],
      });
    }
  }

  class Progress extends Component {
    static _prefixClass = 'nom-progress'

    static _progressStatuses = ['normal', 'exception', 'active', 'success']

    constructor(props, ...mixins) {
      const defaults = {
        type: 'line', // 'line', 'circle', 'dashboard' // ??????????????? line circle dashboard
        percent: 0, // ?????????
        // format?:undefined, // (percentNumber,successPercent) => `${percentNumber}%` ?????????????????????
        // status:undefined, // 'normal', 'exception', 'active', 'success' // ??????????????????success exception normal active(?????? line)
        showInfo: true, // ???????????????????????????????????????
        // null for different theme definition
        trailColor: null,
        size: 'default', // 'default' ,'small'
        /**
         * type="line"
         *  ?????????????????????????????????10px???
         * type="circle"
         *  ???????????????????????????????????????????????????????????????????????? ?????? 6
         */
        // strokeWidth:10,
        strokeLinecap: 'round', //  'butt' | 'square' | 'round', // ??????????????????
        // strokeColor: string |  { from: string; to: string; direction: string }, // ??????????????????????????? object ????????????
        // trailColor: string, // ???????????????????????????
        /**
         * type="circle" ???????????????????????????????????? px ?????? 132px
         * type="dashboard" ??????????????????????????????????????? px ?????? 132px
         */
        // width: number,
        success: {}, //  { percent: number, strokeColor: string }, // ???????????????????????????
        // gapDegree: number,???type="dashboard"??? ?????????????????????????????????????????? 0 ~ 295??????75
        // gapPosition: 'top' | 'bottom' | 'left' | 'right', // ?????????????????????????????? ????????? bottom
        // steps: number, // ???type="line"????????????????????????
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    getPercentNumber() {
      const { percent, success } = this.props;
      const { percent: successPercent } = success;
      return parseInt(
        successPercent !== undefined ? successPercent.toString() : percent.toString(),
        10,
      )
    }

    getProgressStatus() {
      const { status } = this.props;
      const successPercent = this.getPercentNumber();
      if (
        (status === undefined || Progress._progressStatuses.indexOf(status) !== 0) &&
        successPercent >= 100
      ) {
        return 'success'
      }
      return status || 'normal'
    }

    renderProcessInfo(progressStatus) {
      const { showInfo, format, type, percent } = this.props;

      const successPercent = this.getPercentNumber();
      if (!showInfo) return null

      let text;
      const textFormatter = format || ((percentNumber) => `${percentNumber}%`);
      const isLineType = type === 'line';
      if (format || (progressStatus !== 'exception' && progressStatus !== 'success')) {
        text = textFormatter(validProgress(percent), validProgress(successPercent));
      } else if (progressStatus === 'exception') {
        text = isLineType
          ? { component: Icon, type: 'close-circle' }
          : { component: Icon, type: 'close' };
      } else if (progressStatus === 'success') {
        text = isLineType
          ? { component: Icon, type: 'check-circle' }
          : { component: Icon, type: 'check' };
      }
      return {
        tag: 'span',
        classes: {
          [`${Progress._prefixClass}-text`]: true,
        },
        attrs: {
          title: typeof text === 'string' ? text : undefined,
        },
        children: text,
      }
    }

    _config() {
      const {
        size,
        type,
        steps,
        showInfo,
        success,
        strokeColor,
        strokeLinecap,
        percent,
        strokeWidth,
        trailColor,
        gapDegree,
        width,
      } = this.props;
      const progressStatus = this.getProgressStatus();
      const progressInfo = this.renderProcessInfo(progressStatus);

      let children = {
        children: progressInfo,
        strokeColor: strokeColor,
        size,
        percent,
        strokeWidth,
        strokeLinecap,
        trailColor,
        success,
      };
      if (type === 'line') {
        if (steps) {
          children = {
            ...children,
            strokeColor: typeof strokeColor === 'string' ? strokeColor : undefined,
            component: ProgressSteps,
            steps,
          };
        } else {
          children = {
            ...children,
            component: ProgressLine,
          };
        }
      } else if (type === 'circle' || type === 'dashboard') {
        children = {
          ...children,
          component: ProgressCircle,
          type,
          width,
          strokeLinecap,
          progressStatus: progressStatus,
          children: progressInfo,
          gapDegree,
        };
      } else {
        throw new Error(`Progress ????????????????????????${type}`)
      }

      this.setProps({
        classes: {
          [`${Progress._prefixClass}-${
          (type === 'dashboard' && 'circle') || (steps && 'steps') || type
        }`]: true,
          [`${Progress._prefixClass}-status-${progressStatus}`]: true,
          [`${Progress._prefixClass}-show-info`]: showInfo,
          [`${Progress._prefixClass}-${size}`]: size,
        },
        children,
      });
    }
  }

  Component.register(Progress);

  class OptionList$1 extends List {
    constructor(props, ...mixins) {
      const defaults = {
        itemDefaults: {
          tag: 'label',
          _config: function () {
            this.setProps({
              children: [
                {
                  tag: 'span',
                  classes: {
                    radio: true,
                  },
                },
                {
                  tag: 'span',
                  classes: {
                    text: true,
                  },
                  children: this.props.text,
                },
              ],
            });
          },
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();

      this.radioList = this.parent.parent;
      this.radioList.optionList = this;
    }

    _config() {
      const listProps = this.radioList.props;
      if (listProps.type === 'radio') {
        this.setProps({
          gutter: 'x-md',
        });
      }
      this.setProps({
        disabled: listProps.disabled,
        items: listProps.options,
        itemDefaults: listProps.optionDefaults,
        itemSelectable: {
          byClick: true,
          scrollIntoView: false,
        },
        selectedItems: listProps.value,
        onItemSelectionChange: () => {
          this.radioList._onValueChange();
        },
      });

      super._config();
    }
  }

  class RadioList extends Field {
    constructor(props, ...mixins) {
      const defaults = {
        options: [],
        uistyle: 'radio',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this.setProps({
        optionDefaults: {
          key() {
            return this.props.value
          },
        },
      });

      this.setProps({
        optionList: {
          component: OptionList$1,
        },
      });

      this.setProps({
        control: this.props.optionList,
      });

      super._config();
    }

    getSelectedOption() {
      return this.optionList.getSelectedItem()
    }

    _getValueText(options, value) {
      const { valueOptions } = this.props;
      options = extend(
        {
          asArray: false,
        },
        valueOptions,
        options,
      );

      const selected = value !== undefined ? this._getOptionByValue(value) : this.getSelectedOption();
      if (selected !== null) {
        if (options.asArray === true) {
          return selected.props ? [selected.props.text] : [selected.text]
        }
        return selected.props ? selected.props.text : selected.text
      }

      return null
    }

    _getValue(options) {
      const { valueOptions } = this.props;
      options = extend(
        {
          asArray: false,
        },
        valueOptions,
        options,
      );

      const selected = this.getSelectedOption();
      if (selected !== null) {
        if (options.asArray === true) {
          return [selected.props.value]
        }
        return selected.props.value
      }

      return null
    }

    _setValue(value, options) {
      if (options === false) {
        options = { triggerChange: false };
      } else {
        options = extend({ triggerChange: true }, options);
      }

      if (value === null) {
        this.optionList.unselectAllItems({ triggerSelectionChange: options.triggerChange });
      } else {
        if (Array.isArray(value)) {
          value = value[0];
        }
        this.optionList.selectItem(function () {
          return this.props.value === value
        });
      }
    }

    _disable() {
      if (this.firstRender === false) {
        this.optionList.disable();
      }
    }

    _enable() {
      if (this.firstRender === false) {
        this.optionList.enable();
      }
    }

    _getOptionByValue(value) {
      let option = null;
      const { options } = this.props;
      if (Array.isArray(value)) {
        value = value[0];
      }
      for (let i = 0; i < options.length; i++) {
        if (options[i].value === value) {
          option = options[i];
          break
        }
      }
      return option
    }
  }

  Component.register(RadioList);

  const UnAuthorized = `#<svg width="251" height="294">
<g fill="none" fillRule="evenodd">
  <path
    d="M0 129.023v-2.084C0 58.364 55.591 2.774 124.165 2.774h2.085c68.574 0 124.165 55.59 124.165 124.165v2.084c0 68.575-55.59 124.166-124.165 124.166h-2.085C55.591 253.189 0 197.598 0 129.023"
    fill="#E4EBF7"
  />
  <path
    d="M41.417 132.92a8.231 8.231 0 1 1-16.38-1.65 8.231 8.231 0 0 1 16.38 1.65"
    fill="#FFF"
  />
  <path
    d="M38.652 136.36l10.425 5.91M49.989 148.505l-12.58 10.73"
    stroke="#FFF"
    strokeWidth="2"
  />
  <path
    d="M41.536 161.28a5.636 5.636 0 1 1-11.216-1.13 5.636 5.636 0 0 1 11.216 1.13M59.154 145.261a5.677 5.677 0 1 1-11.297-1.138 5.677 5.677 0 0 1 11.297 1.138M100.36 29.516l29.66-.013a4.562 4.562 0 1 0-.004-9.126l-29.66.013a4.563 4.563 0 0 0 .005 9.126M111.705 47.754l29.659-.013a4.563 4.563 0 1 0-.004-9.126l-29.66.013a4.563 4.563 0 1 0 .005 9.126"
    fill="#FFF"
  />
  <path
    d="M114.066 29.503V29.5l15.698-.007a4.563 4.563 0 1 0 .004 9.126l-15.698.007v-.002a4.562 4.562 0 0 0-.004-9.122M185.405 137.723c-.55 5.455-5.418 9.432-10.873 8.882-5.456-.55-9.432-5.418-8.882-10.873.55-5.455 5.418-9.432 10.873-8.882 5.455.55 9.432 5.418 8.882 10.873"
    fill="#FFF"
  />
  <path
    d="M180.17 143.772l12.572 7.129M193.841 158.42L178.67 171.36"
    stroke="#FFF"
    strokeWidth="2"
  />
  <path
    d="M185.55 171.926a6.798 6.798 0 1 1-13.528-1.363 6.798 6.798 0 0 1 13.527 1.363M204.12 155.285a6.848 6.848 0 1 1-13.627-1.375 6.848 6.848 0 0 1 13.626 1.375"
    fill="#FFF"
  />
  <path
    d="M152.988 194.074a2.21 2.21 0 1 1-4.42 0 2.21 2.21 0 0 1 4.42 0zM225.931 118.217a2.21 2.21 0 1 1-4.421 0 2.21 2.21 0 0 1 4.421 0zM217.09 153.051a2.21 2.21 0 1 1-4.421 0 2.21 2.21 0 0 1 4.42 0zM177.84 109.842a2.21 2.21 0 1 1-4.422 0 2.21 2.21 0 0 1 4.421 0zM196.114 94.454a2.21 2.21 0 1 1-4.421 0 2.21 2.21 0 0 1 4.421 0zM202.844 182.523a2.21 2.21 0 1 1-4.42 0 2.21 2.21 0 0 1 4.42 0z"
    stroke="#FFF"
    strokeWidth="2"
  />
  <path
    stroke="#FFF"
    strokeWidth="2"
    d="M215.125 155.262l-1.902 20.075-10.87 5.958M174.601 176.636l-6.322 9.761H156.98l-4.484 6.449M175.874 127.28V111.56M221.51 119.404l-12.77 7.859-15.228-7.86V96.668"
  />
  <path
    d="M180.68 29.32C180.68 13.128 193.806 0 210 0c16.193 0 29.32 13.127 29.32 29.32 0 16.194-13.127 29.322-29.32 29.322-16.193 0-29.32-13.128-29.32-29.321"
    fill="#A26EF4"
  />
  <path
    d="M221.45 41.706l-21.563-.125a1.744 1.744 0 0 1-1.734-1.754l.071-12.23a1.744 1.744 0 0 1 1.754-1.734l21.562.125c.964.006 1.74.791 1.735 1.755l-.071 12.229a1.744 1.744 0 0 1-1.754 1.734"
    fill="#FFF"
  />
  <path
    d="M215.106 29.192c-.015 2.577-2.049 4.654-4.543 4.64-2.494-.014-4.504-2.115-4.489-4.693l.04-6.925c.016-2.577 2.05-4.654 4.543-4.64 2.494.015 4.504 2.116 4.49 4.693l-.04 6.925zm-4.53-14.074a6.877 6.877 0 0 0-6.916 6.837l-.043 7.368a6.877 6.877 0 0 0 13.754.08l.042-7.368a6.878 6.878 0 0 0-6.837-6.917zM167.566 68.367h-3.93a4.73 4.73 0 0 1-4.717-4.717 4.73 4.73 0 0 1 4.717-4.717h3.93a4.73 4.73 0 0 1 4.717 4.717 4.73 4.73 0 0 1-4.717 4.717"
    fill="#FFF"
  />
  <path
    d="M168.214 248.838a6.611 6.611 0 0 1-6.61-6.611v-66.108a6.611 6.611 0 0 1 13.221 0v66.108a6.611 6.611 0 0 1-6.61 6.61"
    fill="#5BA02E"
  />
  <path
    d="M176.147 248.176a6.611 6.611 0 0 1-6.61-6.61v-33.054a6.611 6.611 0 1 1 13.221 0v33.053a6.611 6.611 0 0 1-6.61 6.611"
    fill="#92C110"
  />
  <path
    d="M185.994 293.89h-27.376a3.17 3.17 0 0 1-3.17-3.17v-45.887a3.17 3.17 0 0 1 3.17-3.17h27.376a3.17 3.17 0 0 1 3.17 3.17v45.886a3.17 3.17 0 0 1-3.17 3.17"
    fill="#F2D7AD"
  />
  <path
    d="M81.972 147.673s6.377-.927 17.566-1.28c11.729-.371 17.57 1.086 17.57 1.086s3.697-3.855.968-8.424c1.278-12.077 5.982-32.827.335-48.273-1.116-1.339-3.743-1.512-7.536-.62-1.337.315-7.147-.149-7.983-.1l-15.311-.347s-3.487-.17-8.035-.508c-1.512-.113-4.227-1.683-5.458-.338-.406.443-2.425 5.669-1.97 16.077l8.635 35.642s-3.141 3.61 1.219 7.085"
    fill="#FFF"
  />
  <path
    d="M75.768 73.325l-.9-6.397 11.982-6.52s7.302-.118 8.038 1.205c.737 1.324-5.616.993-5.616.993s-1.836 1.388-2.615 2.5c-1.654 2.363-.986 6.471-8.318 5.986-1.708.284-2.57 2.233-2.57 2.233"
    fill="#FFC6A0"
  />
  <path
    d="M52.44 77.672s14.217 9.406 24.973 14.444c1.061.497-2.094 16.183-11.892 11.811-7.436-3.318-20.162-8.44-21.482-14.496-.71-3.258 2.543-7.643 8.401-11.76M141.862 80.113s-6.693 2.999-13.844 6.876c-3.894 2.11-10.137 4.704-12.33 7.988-6.224 9.314 3.536 11.22 12.947 7.503 6.71-2.651 28.999-12.127 13.227-22.367"
    fill="#FFB594"
  />
  <path
    d="M76.166 66.36l3.06 3.881s-2.783 2.67-6.31 5.747c-7.103 6.195-12.803 14.296-15.995 16.44-3.966 2.662-9.754 3.314-12.177-.118-3.553-5.032.464-14.628 31.422-25.95"
    fill="#FFC6A0"
  />
  <path
    d="M64.674 85.116s-2.34 8.413-8.912 14.447c.652.548 18.586 10.51 22.144 10.056 5.238-.669 6.417-18.968 1.145-20.531-.702-.208-5.901-1.286-8.853-2.167-.87-.26-1.611-1.71-3.545-.936l-1.98-.869zM128.362 85.826s5.318 1.956 7.325 13.734c-.546.274-17.55 12.35-21.829 7.805-6.534-6.94-.766-17.393 4.275-18.61 4.646-1.121 5.03-1.37 10.23-2.929"
    fill="#FFF"
  />
  <path
    d="M78.18 94.656s.911 7.41-4.914 13.078"
    stroke="#E4EBF7"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M87.397 94.68s3.124 2.572 10.263 2.572c7.14 0 9.074-3.437 9.074-3.437"
    stroke="#E4EBF7"
    strokeWidth=".932"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M117.184 68.639l-6.781-6.177s-5.355-4.314-9.223-.893c-3.867 3.422 4.463 2.083 5.653 4.165 1.19 2.082.848 1.143-2.083.446-5.603-1.331-2.082.893 2.975 5.355 2.091 1.845 6.992.955 6.992.955l2.467-3.851z"
    fill="#FFC6A0"
  />
  <path
    d="M105.282 91.315l-.297-10.937-15.918-.027-.53 10.45c-.026.403.17.788.515.999 2.049 1.251 9.387 5.093 15.799.424.287-.21.443-.554.431-.91"
    fill="#FFB594"
  />
  <path
    d="M107.573 74.24c.817-1.147.982-9.118 1.015-11.928a1.046 1.046 0 0 0-.965-1.055l-4.62-.365c-7.71-1.044-17.071.624-18.253 6.346-5.482 5.813-.421 13.244-.421 13.244s1.963 3.566 4.305 6.791c.756 1.041.398-3.731 3.04-5.929 5.524-4.594 15.899-7.103 15.899-7.103"
    fill="#5C2552"
  />
  <path
    d="M88.426 83.206s2.685 6.202 11.602 6.522c7.82.28 8.973-7.008 7.434-17.505l-.909-5.483c-6.118-2.897-15.478.54-15.478.54s-.576 2.044-.19 5.504c-2.276 2.066-1.824 5.618-1.824 5.618s-.905-1.922-1.98-2.321c-.86-.32-1.897.089-2.322 1.98-1.04 4.632 3.667 5.145 3.667 5.145"
    fill="#FFC6A0"
  />
  <path
    stroke="#DB836E"
    strokeWidth="1.145"
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M100.843 77.099l1.701-.928-1.015-4.324.674-1.406"
  />
  <path
    d="M105.546 74.092c-.022.713-.452 1.279-.96 1.263-.51-.016-.904-.607-.882-1.32.021-.713.452-1.278.96-1.263.51.016.904.607.882 1.32M97.592 74.349c-.022.713-.452 1.278-.961 1.263-.509-.016-.904-.607-.882-1.32.022-.713.452-1.279.961-1.263.51.016.904.606.882 1.32"
    fill="#552950"
  />
  <path
    d="M91.132 86.786s5.269 4.957 12.679 2.327"
    stroke="#DB836E"
    strokeWidth="1.145"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M99.776 81.903s-3.592.232-1.44-2.79c1.59-1.496 4.897-.46 4.897-.46s1.156 3.906-3.457 3.25"
    fill="#DB836E"
  />
  <path
    d="M102.88 70.6s2.483.84 3.402.715M93.883 71.975s2.492-1.144 4.778-1.073"
    stroke="#5C2552"
    strokeWidth="1.526"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M86.32 77.374s.961.879 1.458 2.106c-.377.48-1.033 1.152-.236 1.809M99.337 83.719s1.911.151 2.509-.254"
    stroke="#DB836E"
    strokeWidth="1.145"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M87.782 115.821l15.73-3.012M100.165 115.821l10.04-2.008"
    stroke="#E4EBF7"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M66.508 86.763s-1.598 8.83-6.697 14.078"
    stroke="#E4EBF7"
    strokeWidth="1.114"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M128.31 87.934s3.013 4.121 4.06 11.785"
    stroke="#E4EBF7"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M64.09 84.816s-6.03 9.912-13.607 9.903"
    stroke="#DB836E"
    strokeWidth=".795"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M112.366 65.909l-.142 5.32s5.993 4.472 11.945 9.202c4.482 3.562 8.888 7.455 10.985 8.662 4.804 2.766 8.9 3.355 11.076 1.808 4.071-2.894 4.373-9.878-8.136-15.263-4.271-1.838-16.144-6.36-25.728-9.73"
    fill="#FFC6A0"
  />
  <path
    d="M130.532 85.488s4.588 5.757 11.619 6.214"
    stroke="#DB836E"
    strokeWidth=".75"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M121.708 105.73s-.393 8.564-1.34 13.612"
    stroke="#E4EBF7"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M115.784 161.512s-3.57-1.488-2.678-7.14"
    stroke="#648BD8"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M101.52 290.246s4.326 2.057 7.408 1.03c2.842-.948 4.564.673 7.132 1.186 2.57.514 6.925 1.108 11.772-1.269-.104-5.551-6.939-4.01-12.048-6.763-2.582-1.39-3.812-4.757-3.625-8.863h-9.471s-1.402 10.596-1.169 14.68"
    fill="#CBD1D1"
  />
  <path
    d="M101.496 290.073s2.447 1.281 6.809.658c3.081-.44 3.74.485 7.479 1.039 3.739.554 10.802-.07 11.91-.9.415 1.108-.347 2.077-.347 2.077s-1.523.608-4.847.831c-2.045.137-5.843.293-7.663-.507-1.8-1.385-5.286-1.917-5.77-.243-3.947.958-7.41-.288-7.41-.288l-.16-2.667z"
    fill="#2B0849"
  />
  <path
    d="M108.824 276.19h3.116s-.103 6.751 4.57 8.62c-4.673.624-8.62-2.32-7.686-8.62"
    fill="#A4AABA"
  />
  <path
    d="M57.65 272.52s-2.122 7.47-4.518 12.396c-1.811 3.724-4.255 7.548 5.505 7.548 6.698 0 9.02-.483 7.479-6.648-1.541-6.164.268-13.296.268-13.296H57.65z"
    fill="#CBD1D1"
  />
  <path
    d="M51.54 290.04s2.111 1.178 6.682 1.178c6.128 0 8.31-1.662 8.31-1.662s.605 1.122-.624 2.18c-1 .862-3.624 1.603-7.444 1.559-4.177-.049-5.876-.57-6.786-1.177-.831-.554-.692-1.593-.138-2.078"
    fill="#2B0849"
  />
  <path
    d="M58.533 274.438s.034 1.529-.315 2.95c-.352 1.431-1.087 3.127-1.139 4.17-.058 1.16 4.57 1.592 5.194.035.623-1.559 1.303-6.475 1.927-7.306.622-.831-4.94-2.135-5.667.15"
    fill="#A4AABA"
  />
  <path
    d="M100.885 277.015l13.306.092s1.291-54.228 1.843-64.056c.552-9.828 3.756-43.13.997-62.788l-12.48-.64-22.725.776s-.433 3.944-1.19 9.921c-.062.493-.677.838-.744 1.358-.075.582.42 1.347.318 1.956-2.35 14.003-6.343 32.926-8.697 46.425-.116.663-1.227 1.004-1.45 2.677-.04.3.21 1.516.112 1.785-6.836 18.643-10.89 47.584-14.2 61.551l14.528-.014s2.185-8.524 4.008-16.878c2.796-12.817 22.987-84.553 22.987-84.553l3-.517 1.037 46.1s-.223 1.228.334 2.008c.558.782-.556 1.117-.39 2.233l.39 1.784s-.446 7.14-.892 11.826c-.446 4.685-.092 38.954-.092 38.954"
    fill="#7BB2F9"
  />
  <path
    d="M77.438 220.434c1.146.094 4.016-2.008 6.916-4.91M107.55 223.931s2.758-1.103 6.069-3.862"
    stroke="#648BD8"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M108.459 220.905s2.759-1.104 6.07-3.863"
    stroke="#648BD8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M76.099 223.557s2.608-.587 6.47-3.346M87.33 150.82c-.27 3.088.297 8.478-4.315 9.073M104.829 149.075s.11 13.936-1.286 14.983c-2.207 1.655-2.975 1.934-2.975 1.934M101.014 149.63s.035 12.81-1.19 24.245M94.93 174.965s7.174-1.655 9.38-1.655M75.671 204.754c-.316 1.55-.64 3.067-.973 4.535 0 0-1.45 1.822-1.003 3.756.446 1.934-.943 2.034-4.96 15.273-1.686 5.559-4.464 18.49-6.313 27.447-.078.38-4.018 18.06-4.093 18.423M77.043 196.743a313.269 313.269 0 0 1-.877 4.729M83.908 151.414l-1.19 10.413s-1.091.148-.496 2.23c.111 1.34-2.66 15.692-5.153 30.267M57.58 272.94h13.238"
    stroke="#648BD8"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M117.377 147.423s-16.955-3.087-35.7.199c.157 2.501-.002 4.128-.002 4.128s14.607-2.802 35.476-.31c.251-2.342.226-4.017.226-4.017"
    fill="#192064"
  />
  <path
    d="M107.511 150.353l.004-4.885a.807.807 0 0 0-.774-.81c-2.428-.092-5.04-.108-7.795-.014a.814.814 0 0 0-.784.81l-.003 4.88c0 .456.371.82.827.808a140.76 140.76 0 0 1 7.688.017.81.81 0 0 0 .837-.806"
    fill="#FFF"
  />
  <path
    d="M106.402 149.426l.002-3.06a.64.64 0 0 0-.616-.643 94.135 94.135 0 0 0-5.834-.009.647.647 0 0 0-.626.643l-.001 3.056c0 .36.291.648.651.64 1.78-.04 3.708-.041 5.762.012.36.009.662-.279.662-.64"
    fill="#192064"
  />
  <path
    d="M101.485 273.933h12.272M102.652 269.075c.006 3.368.04 5.759.11 6.47M102.667 263.125c-.009 1.53-.015 2.98-.016 4.313M102.204 174.024l.893 44.402s.669 1.561-.224 2.677c-.892 1.116 2.455.67.893 2.231-1.562 1.562.893 1.116 0 3.347-.592 1.48-.988 20.987-1.09 34.956"
    stroke="#648BD8"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</g>
</svg>
`;

  const ServerError = `#<svg width="254" height="294">
<defs>
  <path d="M0 .335h253.49v253.49H0z" />
  <path d="M0 293.665h253.49V.401H0z" />
</defs>
<g fill="none" fillRule="evenodd">
  <g transform="translate(0 .067)">
    <mask fill="#fff" />
    <path
      d="M0 128.134v-2.11C0 56.608 56.273.334 125.69.334h2.11c69.416 0 125.69 56.274 125.69 125.69v2.11c0 69.417-56.274 125.69-125.69 125.69h-2.11C56.273 253.824 0 197.551 0 128.134"
      fill="#E4EBF7"
      mask="url(#b)"
    />
  </g>
  <path
    d="M39.989 132.108a8.332 8.332 0 1 1-16.581-1.671 8.332 8.332 0 0 1 16.58 1.671"
    fill="#FFF"
  />
  <path
    d="M37.19 135.59l10.553 5.983M48.665 147.884l-12.734 10.861"
    stroke="#FFF"
    strokeWidth="2"
  />
  <path
    d="M40.11 160.816a5.706 5.706 0 1 1-11.354-1.145 5.706 5.706 0 0 1 11.354 1.145M57.943 144.6a5.747 5.747 0 1 1-11.436-1.152 5.747 5.747 0 0 1 11.436 1.153M99.656 27.434l30.024-.013a4.619 4.619 0 1 0-.004-9.238l-30.024.013a4.62 4.62 0 0 0 .004 9.238M111.14 45.896l30.023-.013a4.62 4.62 0 1 0-.004-9.238l-30.024.013a4.619 4.619 0 1 0 .004 9.238"
    fill="#FFF"
  />
  <path
    d="M113.53 27.421v-.002l15.89-.007a4.619 4.619 0 1 0 .005 9.238l-15.892.007v-.002a4.618 4.618 0 0 0-.004-9.234M150.167 70.091h-3.979a4.789 4.789 0 0 1-4.774-4.775 4.788 4.788 0 0 1 4.774-4.774h3.979a4.789 4.789 0 0 1 4.775 4.774 4.789 4.789 0 0 1-4.775 4.775"
    fill="#FFF"
  />
  <path
    d="M171.687 30.234c0-16.392 13.289-29.68 29.681-29.68 16.392 0 29.68 13.288 29.68 29.68 0 16.393-13.288 29.681-29.68 29.681s-29.68-13.288-29.68-29.68"
    fill="#FF603B"
  />
  <path
    d="M203.557 19.435l-.676 15.035a1.514 1.514 0 0 1-3.026 0l-.675-15.035a2.19 2.19 0 1 1 4.377 0m-.264 19.378c.513.477.77 1.1.77 1.87s-.257 1.393-.77 1.907c-.55.476-1.21.733-1.943.733a2.545 2.545 0 0 1-1.87-.77c-.55-.514-.806-1.136-.806-1.87 0-.77.256-1.393.806-1.87.513-.513 1.137-.733 1.87-.733.77 0 1.43.22 1.943.733"
    fill="#FFF"
  />
  <path
    d="M119.3 133.275c4.426-.598 3.612-1.204 4.079-4.778.675-5.18-3.108-16.935-8.262-25.118-1.088-10.72-12.598-11.24-12.598-11.24s4.312 4.895 4.196 16.199c1.398 5.243.804 14.45.804 14.45s5.255 11.369 11.78 10.487"
    fill="#FFB594"
  />
  <path
    d="M100.944 91.61s1.463-.583 3.211.582c8.08 1.398 10.368 6.706 11.3 11.368 1.864 1.282 1.864 2.33 1.864 3.496.365.777 1.515 3.03 1.515 3.03s-7.225 1.748-10.954 6.758c-1.399-6.41-6.936-25.235-6.936-25.235"
    fill="#FFF"
  />
  <path
    d="M94.008 90.5l1.019-5.815-9.23-11.874-5.233 5.581-2.593 9.863s8.39 5.128 16.037 2.246"
    fill="#FFB594"
  />
  <path
    d="M82.931 78.216s-4.557-2.868-2.445-6.892c1.632-3.107 4.537 1.139 4.537 1.139s.524-3.662 3.139-3.662c.523-1.046 1.569-4.184 1.569-4.184s11.507 2.615 13.6 3.138c-.001 5.23-2.317 19.529-7.884 19.969-8.94.706-12.516-9.508-12.516-9.508"
    fill="#FFC6A0"
  />
  <path
    d="M102.971 72.243c2.616-2.093 3.489-9.775 3.489-9.775s-2.492-.492-6.676-2.062c-4.708-2.092-12.867-4.771-17.575.982-9.54 4.41-2.062 19.93-2.062 19.93l2.729-3.037s-3.956-3.304-2.092-6.277c2.183-3.48 3.943 1.08 3.943 1.08s.64-2.4 3.6-3.36c.356-.714 1.04-2.69 1.44-3.872a1.08 1.08 0 0 1 1.27-.707c2.41.56 8.723 2.03 11.417 2.676.524.126.876.619.825 1.156l-.308 3.266z"
    fill="#520038"
  />
  <path
    d="M101.22 76.514c-.104.613-.585 1.044-1.076.96-.49-.082-.805-.646-.702-1.26.104-.613.585-1.044 1.076-.961.491.083.805.647.702 1.26M94.26 75.074c-.104.613-.585 1.044-1.076.96-.49-.082-.805-.646-.702-1.26.104-.613.585-1.044 1.076-.96.491.082.805.646.702 1.26"
    fill="#552950"
  />
  <path
    stroke="#DB836E"
    strokeWidth="1.063"
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M99.206 73.644l-.9 1.62-.3 4.38h-2.24"
  />
  <path
    d="M99.926 73.284s1.8-.72 2.52.54"
    stroke="#5C2552"
    strokeWidth="1.117"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M81.367 73.084s.48-1.12 1.12-.72c.64.4 1.28 1.44.56 2s.16 1.68.16 1.68"
    stroke="#DB836E"
    strokeWidth="1.117"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M92.326 71.724s1.84 1.12 4.16.96"
    stroke="#5C2552"
    strokeWidth="1.117"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M92.726 80.604s2.24 1.2 4.4 1.2M93.686 83.164s.96.4 1.52.32M83.687 80.044s1.786 6.547 9.262 7.954"
    stroke="#DB836E"
    strokeWidth="1.063"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M95.548 91.663s-1.068 2.821-8.298 2.105c-7.23-.717-10.29-5.044-10.29-5.044"
    stroke="#E4EBF7"
    strokeWidth="1.136"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M78.126 87.478s6.526 4.972 16.47 2.486c0 0 9.577 1.02 11.536 5.322 5.36 11.77.543 36.835 0 39.962 3.496 4.055-.466 8.483-.466 8.483-15.624-3.548-35.81-.6-35.81-.6-4.849-3.546-1.223-9.044-1.223-9.044L62.38 110.32c-2.485-15.227.833-19.803 3.549-20.743 3.03-1.049 8.04-1.282 8.04-1.282.496-.058 1.08-.076 1.37-.233 2.36-1.282 2.787-.583 2.787-.583"
    fill="#FFF"
  />
  <path
    d="M65.828 89.81s-6.875.465-7.59 8.156c-.466 8.857 3.03 10.954 3.03 10.954s6.075 22.102 16.796 22.957c8.39-2.176 4.758-6.702 4.661-11.42-.233-11.304-7.108-16.897-7.108-16.897s-4.212-13.75-9.789-13.75"
    fill="#FFC6A0"
  />
  <path
    d="M71.716 124.225s.855 11.264 9.828 6.486c4.765-2.536 7.581-13.828 9.789-22.568 1.456-5.768 2.58-12.197 2.58-12.197l-4.973-1.709s-2.408 5.516-7.769 12.275c-4.335 5.467-9.144 11.11-9.455 17.713"
    fill="#FFC6A0"
  />
  <path
    d="M108.463 105.191s1.747 2.724-2.331 30.535c2.376 2.216 1.053 6.012-.233 7.51"
    stroke="#E4EBF7"
    strokeWidth="1.085"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M123.262 131.527s-.427 2.732-11.77 1.981c-15.187-1.006-25.326-3.25-25.326-3.25l.933-5.8s.723.215 9.71-.068c11.887-.373 18.714-6.07 24.964-1.022 4.039 3.263 1.489 8.16 1.489 8.16"
    fill="#FFC6A0"
  />
  <path
    d="M70.24 90.974s-5.593-4.739-11.054 2.68c-3.318 7.223.517 15.284 2.664 19.578-.31 3.729 2.33 4.311 2.33 4.311s.108.895 1.516 2.68c4.078-7.03 6.72-9.166 13.711-12.546-.328-.656-1.877-3.265-1.825-3.767.175-1.69-1.282-2.623-1.282-2.623s-.286-.156-1.165-2.738c-.788-2.313-2.036-5.177-4.895-7.575"
    fill="#FFF"
  />
  <path
    d="M90.232 288.027s4.855 2.308 8.313 1.155c3.188-1.063 5.12.755 8.002 1.331 2.881.577 7.769 1.243 13.207-1.424-.117-6.228-7.786-4.499-13.518-7.588-2.895-1.56-4.276-5.336-4.066-9.944H91.544s-1.573 11.89-1.312 16.47"
    fill="#CBD1D1"
  />
  <path
    d="M90.207 287.833s2.745 1.437 7.639.738c3.456-.494 3.223.66 7.418 1.282 4.195.621 13.092-.194 14.334-1.126.466 1.242-.388 2.33-.388 2.33s-1.709.682-5.438.932c-2.295.154-8.098.276-10.14-.621-2.02-1.554-4.894-1.515-6.06-.234-4.427 1.075-7.184-.31-7.184-.31l-.181-2.991z"
    fill="#2B0849"
  />
  <path
    d="M98.429 272.257h3.496s-.117 7.574 5.127 9.671c-5.244.7-9.672-2.602-8.623-9.671"
    fill="#A4AABA"
  />
  <path
    d="M44.425 272.046s-2.208 7.774-4.702 12.899c-1.884 3.874-4.428 7.854 5.729 7.854 6.97 0 9.385-.503 7.782-6.917-1.604-6.415.279-13.836.279-13.836h-9.088z"
    fill="#CBD1D1"
  />
  <path
    d="M38.066 290.277s2.198 1.225 6.954 1.225c6.376 0 8.646-1.73 8.646-1.73s.63 1.168-.649 2.27c-1.04.897-3.77 1.668-7.745 1.621-4.347-.05-6.115-.593-7.062-1.224-.864-.577-.72-1.657-.144-2.162"
    fill="#2B0849"
  />
  <path
    d="M45.344 274.041s.035 1.592-.329 3.07c-.365 1.49-1.13 3.255-1.184 4.34-.061 1.206 4.755 1.657 5.403.036.65-1.622 1.357-6.737 2.006-7.602.648-.865-5.14-2.222-5.896.156"
    fill="#A4AABA"
  />
  <path
    d="M89.476 277.57l13.899.095s1.349-56.643 1.925-66.909c.576-10.267 3.923-45.052 1.042-65.585l-13.037-.669-23.737.81s-.452 4.12-1.243 10.365c-.065.515-.708.874-.777 1.417-.078.608.439 1.407.332 2.044-2.455 14.627-5.797 32.736-8.256 46.837-.121.693-1.282 1.048-1.515 2.796-.042.314.22 1.584.116 1.865-7.14 19.473-12.202 52.601-15.66 67.19l15.176-.015s2.282-10.145 4.185-18.871c2.922-13.389 24.012-88.32 24.012-88.32l3.133-.954-.158 48.568s-.233 1.282.35 2.098c.583.815-.581 1.167-.408 2.331l.408 1.864s-.466 7.458-.932 12.352c-.467 4.895 1.145 40.69 1.145 40.69"
    fill="#7BB2F9"
  />
  <path
    d="M64.57 218.881c1.197.099 4.195-2.097 7.225-5.127M96.024 222.534s2.881-1.152 6.34-4.034"
    stroke="#648BD8"
    strokeWidth="1.085"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M96.973 219.373s2.882-1.153 6.34-4.034"
    stroke="#648BD8"
    strokeWidth="1.032"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M63.172 222.144s2.724-.614 6.759-3.496M74.903 146.166c-.281 3.226.31 8.856-4.506 9.478M93.182 144.344s.115 14.557-1.344 15.65c-2.305 1.73-3.107 2.02-3.107 2.02M89.197 144.923s.269 13.144-1.01 25.088M83.525 170.71s6.81-1.051 9.116-1.051M46.026 270.045l-.892 4.538M46.937 263.289l-.815 4.157M62.725 202.503c-.33 1.618-.102 1.904-.449 3.438 0 0-2.756 1.903-2.29 3.923.466 2.02-.31 3.424-4.505 17.252-1.762 5.807-4.233 18.922-6.165 28.278-.03.144-.521 2.646-1.14 5.8M64.158 194.136c-.295 1.658-.6 3.31-.917 4.938M71.33 146.787l-1.244 10.877s-1.14.155-.519 2.33c.117 1.399-2.778 16.39-5.382 31.615M44.242 273.727H58.07"
    stroke="#648BD8"
    strokeWidth="1.085"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M106.18 142.117c-3.028-.489-18.825-2.744-36.219.2a.625.625 0 0 0-.518.644c.063 1.307.044 2.343.015 2.995a.617.617 0 0 0 .716.636c3.303-.534 17.037-2.412 35.664-.266.347.04.66-.214.692-.56.124-1.347.16-2.425.17-3.029a.616.616 0 0 0-.52-.62"
    fill="#192064"
  />
  <path
    d="M96.398 145.264l.003-5.102a.843.843 0 0 0-.809-.847 114.104 114.104 0 0 0-8.141-.014.85.85 0 0 0-.82.847l-.003 5.097c0 .476.388.857.864.845 2.478-.064 5.166-.067 8.03.017a.848.848 0 0 0 .876-.843"
    fill="#FFF"
  />
  <path
    d="M95.239 144.296l.002-3.195a.667.667 0 0 0-.643-.672c-1.9-.061-3.941-.073-6.094-.01a.675.675 0 0 0-.654.672l-.002 3.192c0 .376.305.677.68.669 1.859-.042 3.874-.043 6.02.012.376.01.69-.291.691-.668"
    fill="#192064"
  />
  <path
    d="M90.102 273.522h12.819M91.216 269.761c.006 3.519-.072 5.55 0 6.292M90.923 263.474c-.009 1.599-.016 2.558-.016 4.505M90.44 170.404l.932 46.38s.7 1.631-.233 2.796c-.932 1.166 2.564.7.932 2.33-1.63 1.633.933 1.166 0 3.497-.618 1.546-1.031 21.921-1.138 36.513"
    stroke="#648BD8"
    strokeWidth="1.085"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M73.736 98.665l2.214 4.312s2.098.816 1.865 2.68l.816 2.214M64.297 116.611c.233-.932 2.176-7.147 12.585-10.488M77.598 90.042s7.691 6.137 16.547 2.72"
    stroke="#E4EBF7"
    strokeWidth="1.085"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M91.974 86.954s5.476-.816 7.574-4.545c1.297-.345.72 2.212-.33 3.671-.7.971-1.01 1.554-1.01 1.554s.194.31.155.816c-.053.697-.175.653-.272 1.048-.081.335.108.657 0 1.049-.046.17-.198.5-.382.878-.12.249-.072.687-.2.948-.231.469-1.562 1.87-2.622 2.855-3.826 3.554-5.018 1.644-6.001-.408-.894-1.865-.661-5.127-.874-6.875-.35-2.914-2.622-3.03-1.923-4.429.343-.685 2.87.69 3.263 1.748.757 2.04 2.952 1.807 2.622 1.69"
    fill="#FFC6A0"
  />
  <path
    d="M99.8 82.429c-.465.077-.35.272-.97 1.243-.622.971-4.817 2.932-6.39 3.224-2.589.48-2.278-1.56-4.254-2.855-1.69-1.107-3.562-.638-1.398 1.398.99.932.932 1.107 1.398 3.205.335 1.506-.64 3.67.7 5.593"
    stroke="#DB836E"
    strokeWidth=".774"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M79.543 108.673c-2.1 2.926-4.266 6.175-5.557 8.762"
    stroke="#E59788"
    strokeWidth=".774"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M87.72 124.768s-2.098-1.942-5.127-2.719c-3.03-.777-3.574-.155-5.516.078-1.942.233-3.885-.932-3.652.7.233 1.63 5.05 1.01 5.206 2.097.155 1.087-6.37 2.796-8.313 2.175-.777.777.466 1.864 2.02 2.175.233 1.554 2.253 1.554 2.253 1.554s.699 1.01 2.641 1.088c2.486 1.32 8.934-.7 10.954-1.554 2.02-.855-.466-5.594-.466-5.594"
    fill="#FFC6A0"
  />
  <path
    d="M73.425 122.826s.66 1.127 3.167 1.418c2.315.27 2.563.583 2.563.583s-2.545 2.894-9.07 2.272M72.416 129.274s3.826.097 4.933-.718M74.98 130.75s1.961.136 3.36-.505M77.232 131.916s1.748.019 2.914-.505M73.328 122.321s-.595-1.032 1.262-.427c1.671.544 2.833.055 5.128.155 1.389.061 3.067-.297 3.982.15 1.606.784 3.632 2.181 3.632 2.181s10.526 1.204 19.033-1.127M78.864 108.104s-8.39 2.758-13.168 12.12"
    stroke="#E59788"
    strokeWidth=".774"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M109.278 112.533s3.38-3.613 7.575-4.662"
    stroke="#E4EBF7"
    strokeWidth="1.085"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M107.375 123.006s9.697-2.745 11.445-.88"
    stroke="#E59788"
    strokeWidth=".774"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M194.605 83.656l3.971-3.886M187.166 90.933l3.736-3.655M191.752 84.207l-4.462-4.56M198.453 91.057l-4.133-4.225M129.256 163.074l3.718-3.718M122.291 170.039l3.498-3.498M126.561 163.626l-4.27-4.27M132.975 170.039l-3.955-3.955"
    stroke="#BFCDDD"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M190.156 211.779h-1.604a4.023 4.023 0 0 1-4.011-4.011V175.68a4.023 4.023 0 0 1 4.01-4.01h1.605a4.023 4.023 0 0 1 4.011 4.01v32.088a4.023 4.023 0 0 1-4.01 4.01"
    fill="#A3B4C6"
  />
  <path
    d="M237.824 212.977a4.813 4.813 0 0 1-4.813 4.813h-86.636a4.813 4.813 0 0 1 0-9.626h86.636a4.813 4.813 0 0 1 4.813 4.813"
    fill="#A3B4C6"
  />
  <mask fill="#fff" />
  <path fill="#A3B4C6" mask="url(#d)" d="M154.098 190.096h70.513v-84.617h-70.513z" />
  <path
    d="M224.928 190.096H153.78a3.219 3.219 0 0 1-3.208-3.209V167.92a3.219 3.219 0 0 1 3.208-3.21h71.148a3.219 3.219 0 0 1 3.209 3.21v18.967a3.219 3.219 0 0 1-3.21 3.209M224.928 130.832H153.78a3.218 3.218 0 0 1-3.208-3.208v-18.968a3.219 3.219 0 0 1 3.208-3.209h71.148a3.219 3.219 0 0 1 3.209 3.21v18.967a3.218 3.218 0 0 1-3.21 3.208"
    fill="#BFCDDD"
    mask="url(#d)"
  />
  <path
    d="M159.563 120.546a2.407 2.407 0 1 1 0-4.813 2.407 2.407 0 0 1 0 4.813M166.98 120.546a2.407 2.407 0 1 1 0-4.813 2.407 2.407 0 0 1 0 4.813M174.397 120.546a2.407 2.407 0 1 1 0-4.813 2.407 2.407 0 0 1 0 4.813M222.539 120.546h-22.461a.802.802 0 0 1-.802-.802v-3.208c0-.443.359-.803.802-.803h22.46c.444 0 .803.36.803.803v3.208c0 .443-.36.802-.802.802"
    fill="#FFF"
    mask="url(#d)"
  />
  <path
    d="M224.928 160.464H153.78a3.218 3.218 0 0 1-3.208-3.209v-18.967a3.219 3.219 0 0 1 3.208-3.209h71.148a3.219 3.219 0 0 1 3.209 3.209v18.967a3.218 3.218 0 0 1-3.21 3.209"
    fill="#BFCDDD"
    mask="url(#d)"
  />
  <path
    d="M173.455 130.832h49.301M164.984 130.832h6.089M155.952 130.832h6.75M173.837 160.613h49.3M165.365 160.613h6.089M155.57 160.613h6.751"
    stroke="#7C90A5"
    strokeWidth="1.124"
    strokeLinecap="round"
    strokeLinejoin="round"
    mask="url(#d)"
  />
  <path
    d="M159.563 151.038a2.407 2.407 0 1 1 0-4.814 2.407 2.407 0 0 1 0 4.814M166.98 151.038a2.407 2.407 0 1 1 0-4.814 2.407 2.407 0 0 1 0 4.814M174.397 151.038a2.407 2.407 0 1 1 .001-4.814 2.407 2.407 0 0 1 0 4.814M222.539 151.038h-22.461a.802.802 0 0 1-.802-.802v-3.209c0-.443.359-.802.802-.802h22.46c.444 0 .803.36.803.802v3.209c0 .443-.36.802-.802.802M159.563 179.987a2.407 2.407 0 1 1 0-4.813 2.407 2.407 0 0 1 0 4.813M166.98 179.987a2.407 2.407 0 1 1 0-4.813 2.407 2.407 0 0 1 0 4.813M174.397 179.987a2.407 2.407 0 1 1 0-4.813 2.407 2.407 0 0 1 0 4.813M222.539 179.987h-22.461a.802.802 0 0 1-.802-.802v-3.209c0-.443.359-.802.802-.802h22.46c.444 0 .803.36.803.802v3.209c0 .443-.36.802-.802.802"
    fill="#FFF"
    mask="url(#d)"
  />
  <path
    d="M203.04 221.108h-27.372a2.413 2.413 0 0 1-2.406-2.407v-11.448a2.414 2.414 0 0 1 2.406-2.407h27.372a2.414 2.414 0 0 1 2.407 2.407V218.7a2.413 2.413 0 0 1-2.407 2.407"
    fill="#BFCDDD"
    mask="url(#d)"
  />
  <path
    d="M177.259 207.217v11.52M201.05 207.217v11.52"
    stroke="#A3B4C6"
    strokeWidth="1.124"
    strokeLinecap="round"
    strokeLinejoin="round"
    mask="url(#d)"
  />
  <path
    d="M162.873 267.894a9.422 9.422 0 0 1-9.422-9.422v-14.82a9.423 9.423 0 0 1 18.845 0v14.82a9.423 9.423 0 0 1-9.423 9.422"
    fill="#5BA02E"
    mask="url(#d)"
  />
  <path
    d="M171.22 267.83a9.422 9.422 0 0 1-9.422-9.423v-3.438a9.423 9.423 0 0 1 18.845 0v3.438a9.423 9.423 0 0 1-9.422 9.423"
    fill="#92C110"
    mask="url(#d)"
  />
  <path
    d="M181.31 293.666h-27.712a3.209 3.209 0 0 1-3.209-3.21V269.79a3.209 3.209 0 0 1 3.209-3.21h27.711a3.209 3.209 0 0 1 3.209 3.21v20.668a3.209 3.209 0 0 1-3.209 3.209"
    fill="#F2D7AD"
    mask="url(#d)"
  />
</g>
</svg>
`;

  const NotFound = `#<svg width="252" height="294">
<defs>
  <path d="M0 .387h251.772v251.772H0z" />
</defs>
<g fill="none" fillRule="evenodd">
  <g transform="translate(0 .012)">
    <mask fill="#fff" />
    <path
      d="M0 127.32v-2.095C0 56.279 55.892.387 124.838.387h2.096c68.946 0 124.838 55.892 124.838 124.838v2.096c0 68.946-55.892 124.838-124.838 124.838h-2.096C55.892 252.16 0 196.267 0 127.321"
      fill="#E4EBF7"
      mask="url(#b)"
    />
  </g>
  <path
    d="M39.755 130.84a8.276 8.276 0 1 1-16.468-1.66 8.276 8.276 0 0 1 16.468 1.66"
    fill="#FFF"
  />
  <path
    d="M36.975 134.297l10.482 5.943M48.373 146.508l-12.648 10.788"
    stroke="#FFF"
    strokeWidth="2"
  />
  <path
    d="M39.875 159.352a5.667 5.667 0 1 1-11.277-1.136 5.667 5.667 0 0 1 11.277 1.136M57.588 143.247a5.708 5.708 0 1 1-11.358-1.145 5.708 5.708 0 0 1 11.358 1.145M99.018 26.875l29.82-.014a4.587 4.587 0 1 0-.003-9.175l-29.82.013a4.587 4.587 0 1 0 .003 9.176M110.424 45.211l29.82-.013a4.588 4.588 0 0 0-.004-9.175l-29.82.013a4.587 4.587 0 1 0 .004 9.175"
    fill="#FFF"
  />
  <path
    d="M112.798 26.861v-.002l15.784-.006a4.588 4.588 0 1 0 .003 9.175l-15.783.007v-.002a4.586 4.586 0 0 0-.004-9.172M184.523 135.668c-.553 5.485-5.447 9.483-10.931 8.93-5.485-.553-9.483-5.448-8.93-10.932.552-5.485 5.447-9.483 10.932-8.93 5.485.553 9.483 5.447 8.93 10.932"
    fill="#FFF"
  />
  <path
    d="M179.26 141.75l12.64 7.167M193.006 156.477l-15.255 13.011"
    stroke="#FFF"
    strokeWidth="2"
  />
  <path
    d="M184.668 170.057a6.835 6.835 0 1 1-13.6-1.372 6.835 6.835 0 0 1 13.6 1.372M203.34 153.325a6.885 6.885 0 1 1-13.7-1.382 6.885 6.885 0 0 1 13.7 1.382"
    fill="#FFF"
  />
  <path
    d="M151.931 192.324a2.222 2.222 0 1 1-4.444 0 2.222 2.222 0 0 1 4.444 0zM225.27 116.056a2.222 2.222 0 1 1-4.445 0 2.222 2.222 0 0 1 4.444 0zM216.38 151.08a2.223 2.223 0 1 1-4.446-.001 2.223 2.223 0 0 1 4.446 0zM176.917 107.636a2.223 2.223 0 1 1-4.445 0 2.223 2.223 0 0 1 4.445 0zM195.291 92.165a2.223 2.223 0 1 1-4.445 0 2.223 2.223 0 0 1 4.445 0zM202.058 180.711a2.223 2.223 0 1 1-4.446 0 2.223 2.223 0 0 1 4.446 0z"
    stroke="#FFF"
    strokeWidth="2"
  />
  <path
    stroke="#FFF"
    strokeWidth="2"
    d="M214.404 153.302l-1.912 20.184-10.928 5.99M173.661 174.792l-6.356 9.814h-11.36l-4.508 6.484M174.941 125.168v-15.804M220.824 117.25l-12.84 7.901-15.31-7.902V94.39"
  />
  <path
    d="M166.588 65.936h-3.951a4.756 4.756 0 0 1-4.743-4.742 4.756 4.756 0 0 1 4.743-4.743h3.951a4.756 4.756 0 0 1 4.743 4.743 4.756 4.756 0 0 1-4.743 4.742"
    fill="#FFF"
  />
  <path
    d="M174.823 30.03c0-16.281 13.198-29.48 29.48-29.48 16.28 0 29.48 13.199 29.48 29.48 0 16.28-13.2 29.48-29.48 29.48-16.282 0-29.48-13.2-29.48-29.48"
    fill="#1890FF"
  />
  <path
    d="M205.952 38.387c.5.5.785 1.142.785 1.928s-.286 1.465-.785 1.964c-.572.5-1.214.75-2 .75-.785 0-1.429-.285-1.929-.785-.572-.5-.82-1.143-.82-1.929s.248-1.428.82-1.928c.5-.5 1.144-.75 1.93-.75.785 0 1.462.25 1.999.75m4.285-19.463c1.428 1.249 2.143 2.963 2.143 5.142 0 1.712-.427 3.13-1.219 4.25-.067.096-.137.18-.218.265-.416.429-1.41 1.346-2.956 2.699a5.07 5.07 0 0 0-1.428 1.75 5.207 5.207 0 0 0-.536 2.357v.5h-4.107v-.5c0-1.357.215-2.536.714-3.5.464-.964 1.857-2.464 4.178-4.536l.43-.5c.643-.785.964-1.643.964-2.535 0-1.18-.358-2.108-1-2.785-.678-.68-1.643-1.001-2.858-1.001-1.536 0-2.642.464-3.357 1.43-.37.5-.621 1.135-.76 1.904a1.999 1.999 0 0 1-1.971 1.63h-.004c-1.277 0-2.257-1.183-1.98-2.43.337-1.518 1.02-2.78 2.073-3.784 1.536-1.5 3.607-2.25 6.25-2.25 2.32 0 4.214.607 5.642 1.894"
    fill="#FFF"
  />
  <path
    d="M52.04 76.131s21.81 5.36 27.307 15.945c5.575 10.74-6.352 9.26-15.73 4.935-10.86-5.008-24.7-11.822-11.577-20.88"
    fill="#FFB594"
  />
  <path
    d="M90.483 67.504l-.449 2.893c-.753.49-4.748-2.663-4.748-2.663l-1.645.748-1.346-5.684s6.815-4.589 8.917-5.018c2.452-.501 9.884.94 10.7 2.278 0 0 1.32.486-2.227.69-3.548.203-5.043.447-6.79 3.132-1.747 2.686-2.412 3.624-2.412 3.624"
    fill="#FFC6A0"
  />
  <path
    d="M128.055 111.367c-2.627-7.724-6.15-13.18-8.917-15.478-3.5-2.906-9.34-2.225-11.366-4.187-1.27-1.231-3.215-1.197-3.215-1.197s-14.98-3.158-16.828-3.479c-2.37-.41-2.124-.714-6.054-1.405-1.57-1.907-2.917-1.122-2.917-1.122l-7.11-1.383c-.853-1.472-2.423-1.023-2.423-1.023l-2.468-.897c-1.645 9.976-7.74 13.796-7.74 13.796 1.795 1.122 15.703 8.3 15.703 8.3l5.107 37.11s-3.321 5.694 1.346 9.109c0 0 19.883-3.743 34.921-.329 0 0 3.047-2.546.972-8.806.523-3.01 1.394-8.263 1.736-11.622.385.772 2.019 1.918 3.14 3.477 0 0 9.407-7.365 11.052-14.012-.832-.723-1.598-1.585-2.267-2.453-.567-.736-.358-2.056-.765-2.717-.669-1.084-1.804-1.378-1.907-1.682"
    fill="#FFF"
  />
  <path
    d="M101.09 289.998s4.295 2.041 7.354 1.021c2.821-.94 4.53.668 7.08 1.178 2.55.51 6.874 1.1 11.686-1.26-.103-5.51-6.889-3.98-11.96-6.713-2.563-1.38-3.784-4.722-3.598-8.799h-9.402s-1.392 10.52-1.16 14.573"
    fill="#CBD1D1"
  />
  <path
    d="M101.067 289.826s2.428 1.271 6.759.653c3.058-.437 3.712.481 7.423 1.031 3.712.55 10.724-.069 11.823-.894.413 1.1-.343 2.063-.343 2.063s-1.512.603-4.812.824c-2.03.136-5.8.291-7.607-.503-1.787-1.375-5.247-1.903-5.728-.241-3.918.95-7.355-.286-7.355-.286l-.16-2.647z"
    fill="#2B0849"
  />
  <path
    d="M108.341 276.044h3.094s-.103 6.702 4.536 8.558c-4.64.618-8.558-2.303-7.63-8.558"
    fill="#A4AABA"
  />
  <path
    d="M57.542 272.401s-2.107 7.416-4.485 12.306c-1.798 3.695-4.225 7.492 5.465 7.492 6.648 0 8.953-.48 7.423-6.599-1.53-6.12.266-13.199.266-13.199h-8.669z"
    fill="#CBD1D1"
  />
  <path
    d="M51.476 289.793s2.097 1.169 6.633 1.169c6.083 0 8.249-1.65 8.249-1.65s.602 1.114-.619 2.165c-.993.855-3.597 1.591-7.39 1.546-4.145-.048-5.832-.566-6.736-1.168-.825-.55-.687-1.58-.137-2.062"
    fill="#2B0849"
  />
  <path
    d="M58.419 274.304s.033 1.519-.314 2.93c-.349 1.42-1.078 3.104-1.13 4.139-.058 1.151 4.537 1.58 5.155.034.62-1.547 1.294-6.427 1.913-7.252.619-.825-4.903-2.119-5.624.15"
    fill="#A4AABA"
  />
  <path
    d="M99.66 278.514l13.378.092s1.298-54.52 1.853-64.403c.554-9.882 3.776-43.364 1.002-63.128l-12.547-.644-22.849.78s-.434 3.966-1.195 9.976c-.063.496-.682.843-.749 1.365-.075.585.423 1.354.32 1.966-2.364 14.08-6.377 33.104-8.744 46.677-.116.666-1.234 1.009-1.458 2.691-.04.302.211 1.525.112 1.795-6.873 18.744-10.949 47.842-14.277 61.885l14.607-.014s2.197-8.57 4.03-16.97c2.811-12.886 23.111-85.01 23.111-85.01l3.016-.521 1.043 46.35s-.224 1.234.337 2.02c.56.785-.56 1.123-.392 2.244l.392 1.794s-.449 7.178-.898 11.89c-.448 4.71-.092 39.165-.092 39.165"
    fill="#7BB2F9"
  />
  <path
    d="M76.085 221.626c1.153.094 4.038-2.019 6.955-4.935M106.36 225.142s2.774-1.11 6.103-3.883"
    stroke="#648BD8"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M107.275 222.1s2.773-1.11 6.102-3.884"
    stroke="#648BD8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M74.74 224.767s2.622-.591 6.505-3.365M86.03 151.634c-.27 3.106.3 8.525-4.336 9.123M103.625 149.88s.11 14.012-1.293 15.065c-2.219 1.664-2.99 1.944-2.99 1.944M99.79 150.438s.035 12.88-1.196 24.377M93.673 175.911s7.212-1.664 9.431-1.664M74.31 205.861a212.013 212.013 0 0 1-.979 4.56s-1.458 1.832-1.009 3.776c.449 1.944-.947 2.045-4.985 15.355-1.696 5.59-4.49 18.591-6.348 27.597l-.231 1.12M75.689 197.807a320.934 320.934 0 0 1-.882 4.754M82.591 152.233L81.395 162.7s-1.097.15-.5 2.244c.113 1.346-2.674 15.775-5.18 30.43M56.12 274.418h13.31"
    stroke="#648BD8"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M116.241 148.22s-17.047-3.104-35.893.2c.158 2.514-.003 4.15-.003 4.15s14.687-2.818 35.67-.312c.252-2.355.226-4.038.226-4.038"
    fill="#192064"
  />
  <path
    d="M106.322 151.165l.003-4.911a.81.81 0 0 0-.778-.815c-2.44-.091-5.066-.108-7.836-.014a.818.818 0 0 0-.789.815l-.003 4.906a.81.81 0 0 0 .831.813c2.385-.06 4.973-.064 7.73.017a.815.815 0 0 0 .842-.81"
    fill="#FFF"
  />
  <path
    d="M105.207 150.233l.002-3.076a.642.642 0 0 0-.619-.646 94.321 94.321 0 0 0-5.866-.01.65.65 0 0 0-.63.647v3.072a.64.64 0 0 0 .654.644 121.12 121.12 0 0 1 5.794.011c.362.01.665-.28.665-.642"
    fill="#192064"
  />
  <path
    d="M100.263 275.415h12.338M101.436 270.53c.006 3.387.042 5.79.111 6.506M101.451 264.548a915.75 915.75 0 0 0-.015 4.337M100.986 174.965l.898 44.642s.673 1.57-.225 2.692c-.897 1.122 2.468.673.898 2.243-1.57 1.57.897 1.122 0 3.365-.596 1.489-.994 21.1-1.096 35.146"
    stroke="#648BD8"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M46.876 83.427s-.516 6.045 7.223 5.552c11.2-.712 9.218-9.345 31.54-21.655-.786-2.708-2.447-4.744-2.447-4.744s-11.068 3.11-22.584 8.046c-6.766 2.9-13.395 6.352-13.732 12.801M104.46 91.057l.941-5.372-8.884-11.43-5.037 5.372-1.74 7.834a.321.321 0 0 0 .108.32c.965.8 6.5 5.013 14.347 3.544a.332.332 0 0 0 .264-.268"
    fill="#FFC6A0"
  />
  <path
    d="M93.942 79.387s-4.533-2.853-2.432-6.855c1.623-3.09 4.513 1.133 4.513 1.133s.52-3.642 3.121-3.642c.52-1.04 1.561-4.162 1.561-4.162s11.445 2.601 13.526 3.121c0 5.203-2.304 19.424-7.84 19.861-8.892.703-12.449-9.456-12.449-9.456"
    fill="#FFC6A0"
  />
  <path
    d="M113.874 73.446c2.601-2.081 3.47-9.722 3.47-9.722s-2.479-.49-6.64-2.05c-4.683-2.081-12.798-4.747-17.48.976-9.668 3.223-2.05 19.823-2.05 19.823l2.713-3.021s-3.935-3.287-2.08-6.243c2.17-3.462 3.92 1.073 3.92 1.073s.637-2.387 3.581-3.342c.355-.71 1.036-2.674 1.432-3.85a1.073 1.073 0 0 1 1.263-.704c2.4.558 8.677 2.019 11.356 2.662.522.125.871.615.82 1.15l-.305 3.248z"
    fill="#520038"
  />
  <path
    d="M104.977 76.064c-.103.61-.582 1.038-1.07.956-.489-.083-.801-.644-.698-1.254.103-.61.582-1.038 1.07-.956.488.082.8.644.698 1.254M112.132 77.694c-.103.61-.582 1.038-1.07.956-.488-.083-.8-.644-.698-1.254.103-.61.582-1.038 1.07-.956.488.082.8.643.698 1.254"
    fill="#552950"
  />
  <path
    stroke="#DB836E"
    strokeWidth="1.118"
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M110.13 74.84l-.896 1.61-.298 4.357h-2.228"
  />
  <path
    d="M110.846 74.481s1.79-.716 2.506.537"
    stroke="#5C2552"
    strokeWidth="1.118"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M92.386 74.282s.477-1.114 1.113-.716c.637.398 1.274 1.433.558 1.99-.717.556.159 1.67.159 1.67"
    stroke="#DB836E"
    strokeWidth="1.118"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M103.287 72.93s1.83 1.113 4.137.954"
    stroke="#5C2552"
    strokeWidth="1.118"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M103.685 81.762s2.227 1.193 4.376 1.193M104.64 84.308s.954.398 1.511.318M94.693 81.205s2.308 7.4 10.424 7.639"
    stroke="#DB836E"
    strokeWidth="1.118"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M81.45 89.384s.45 5.647-4.935 12.787M69 82.654s-.726 9.282-8.204 14.206"
    stroke="#E4EBF7"
    strokeWidth="1.101"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M129.405 122.865s-5.272 7.403-9.422 10.768"
    stroke="#E4EBF7"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M119.306 107.329s.452 4.366-2.127 32.062"
    stroke="#E4EBF7"
    strokeWidth="1.101"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M150.028 151.232h-49.837a1.01 1.01 0 0 1-1.01-1.01v-31.688c0-.557.452-1.01 1.01-1.01h49.837c.558 0 1.01.453 1.01 1.01v31.688a1.01 1.01 0 0 1-1.01 1.01"
    fill="#F2D7AD"
  />
  <path d="M150.29 151.232h-19.863v-33.707h20.784v32.786a.92.92 0 0 1-.92.92" fill="#F4D19D" />
  <path
    d="M123.554 127.896H92.917a.518.518 0 0 1-.425-.816l6.38-9.113c.193-.277.51-.442.85-.442h31.092l-7.26 10.371z"
    fill="#F2D7AD"
  />
  <path fill="#CC9B6E" d="M123.689 128.447H99.25v-.519h24.169l7.183-10.26.424.298z" />
  <path
    d="M158.298 127.896h-18.669a2.073 2.073 0 0 1-1.659-.83l-7.156-9.541h19.965c.49 0 .95.23 1.244.622l6.69 8.92a.519.519 0 0 1-.415.83"
    fill="#F4D19D"
  />
  <path
    fill="#CC9B6E"
    d="M157.847 128.479h-19.384l-7.857-10.475.415-.31 7.7 10.266h19.126zM130.554 150.685l-.032-8.177.519-.002.032 8.177z"
  />
  <path
    fill="#CC9B6E"
    d="M130.511 139.783l-.08-21.414.519-.002.08 21.414zM111.876 140.932l-.498-.143 1.479-5.167.498.143zM108.437 141.06l-2.679-2.935 2.665-3.434.41.318-2.397 3.089 2.384 2.612zM116.607 141.06l-.383-.35 2.383-2.612-2.397-3.089.41-.318 2.665 3.434z"
  />
  <path
    d="M154.316 131.892l-3.114-1.96.038 3.514-1.043.092c-1.682.115-3.634.23-4.789.23-1.902 0-2.693 2.258 2.23 2.648l-2.645-.596s-2.168 1.317.504 2.3c0 0-1.58 1.217.561 2.58-.584 3.504 5.247 4.058 7.122 3.59 1.876-.47 4.233-2.359 4.487-5.16.28-3.085-.89-5.432-3.35-7.238"
    fill="#FFC6A0"
  />
  <path
    d="M153.686 133.577s-6.522.47-8.36.372c-1.836-.098-1.904 2.19 2.359 2.264 3.739.15 5.451-.044 5.451-.044"
    stroke="#DB836E"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M145.16 135.877c-1.85 1.346.561 2.355.561 2.355s3.478.898 6.73.617"
    stroke="#DB836E"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M151.89 141.71s-6.28.111-6.73-2.132c-.223-1.346.45-1.402.45-1.402M146.114 140.868s-1.103 3.16 5.44 3.533M151.202 129.932v3.477M52.838 89.286c3.533-.337 8.423-1.248 13.582-7.754"
    stroke="#DB836E"
    strokeWidth="1.051"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M168.567 248.318a6.647 6.647 0 0 1-6.647-6.647v-66.466a6.647 6.647 0 1 1 13.294 0v66.466a6.647 6.647 0 0 1-6.647 6.647"
    fill="#5BA02E"
  />
  <path
    d="M176.543 247.653a6.647 6.647 0 0 1-6.646-6.647v-33.232a6.647 6.647 0 1 1 13.293 0v33.232a6.647 6.647 0 0 1-6.647 6.647"
    fill="#92C110"
  />
  <path
    d="M186.443 293.613H158.92a3.187 3.187 0 0 1-3.187-3.187v-46.134a3.187 3.187 0 0 1 3.187-3.187h27.524a3.187 3.187 0 0 1 3.187 3.187v46.134a3.187 3.187 0 0 1-3.187 3.187"
    fill="#F2D7AD"
  />
  <path
    d="M88.979 89.48s7.776 5.384 16.6 2.842"
    stroke="#E4EBF7"
    strokeWidth="1.101"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</g>
</svg>`;

  class Result extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        // icon: 'info',
        status: 'info', //  '403' | '404' | '500'|'success'|'error'|'info'|'warning',
        // title: '',
        // subTitle:'',
        // extra:null,
        // children:null
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    renderIcon({ status, icon }) {
      const exceptionStatus = Object.keys(Result.ExceptionMap);
      if (exceptionStatus.includes(`${status}`)) {
        const svgComponent = Result.ExceptionMap[status];
        return {
          classes: {
            'nom-result-icon': true,
            'nom-result-image': true,
          },
          children: svgComponent,
        }
      }
      let iconContent = Result.IconMap[status];
      if (icon) {
        if (isString(icon)) {
          iconContent = {
            component: 'Icon',
            type: icon,
          };
        } else {
          iconContent = icon;
        }
      }
      return {
        classes: {
          'nom-result-icon': true,
        },
        children: {
          classes: {
            anticon: true,
          },
          ...iconContent,
        },
      }
    }

    _config() {
      const { status, title, subTitle, extra, icon, children } = this.props;
      this.setProps({
        classes: {
          [`nom-result-${status}`]: true,
        },
        children: [
          this.renderIcon({ status, icon }),
          {
            classes: {
              'nom-result-title': true,
            },
            children: title,
          },
          subTitle
            ? {
                classes: {
                  'nom-result-subtitle': true,
                },
                children: subTitle,
              }
            : null,
          extra
            ? {
                classes: {
                  'nom-result-extra': true,
                },
                children: extra,
              }
            : null,
          children
            ? {
                classes: {
                  'nom-result-content': true,
                },
                children,
              }
            : null,
        ],
      });
    }
  }

  Result.IconMap = {
    success: {
      component: 'Icon',
      type: 'check-circle',
    },
    error: {
      component: 'Icon',
      type: 'close-circle',
    },
    info: {
      component: 'Icon',
      type: 'info-circle',
    },
    warning: {
      component: 'Icon',
      type: 'exclamation-circle',
    },
  };

  Result.ExceptionMap = {
    404: NotFound,
    500: ServerError,
    403: UnAuthorized,
  };

  Component.register(Result);

  class SlideCaptcha extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        token: null,
        bgSrc: '',
        captchSrc: '',
        width: 300,
        height: 300,
        top: 0,
        // onRefresh:()=>{},
        // validate:()=>{},
        // onFinish:()=>{},
        // onFinishFailed:()=>{},
        refreshTitle: '?????????',
        tip: '????????????????????????',
        autoRefreshOnFail: true, // ?????????????????????????????????
      };

      super(
        Component.extendProps(defaults, props, {
          state: {
            // ???????????????????????????
            startTime: new Date(),
            // ???????????????????????????
            endTime: new Date(),
            // ???????????????????????????
            isMove: false,
            // ?????????(?????????????????????????????????)
            poorX: 0,
            // ?????????????????????????????????
            distance: 0,
          },
        }),
        ...mixins,
      );
    }

    dispatch(action) {
      let newState = {};
      switch (action.type) {
        // ??????
        case 'reset':
          newState = {
            // ???????????????????????????
            startTime: new Date(),
            // ???????????????????????????
            endTime: new Date(),
            // ???????????????????????????
            isMove: false,
            // ?????????(?????????????????????????????????)
            poorX: 0,
            // ?????????????????????????????????
            distance: 0,
          };
          break
        // ??????????????????
        case 'setStartTime':
          newState = {
            startTime: action.payload,
          };
          break
        // ??????????????????
        case 'setEndTime':
          newState = {
            endTime: action.payload,
          };
          break
        // ??????????????????
        case 'setMove':
          newState = {
            isMove: action.payload,
          };
          break
        // ???????????????
        case 'setPoorX':
          newState = {
            poorX: action.payload,
          };
          break
        // ???????????????????????????????????????
        case 'setDistance':
          newState = {
            distance: action.payload,
          };
          break
        case 'change':
          newState = {
            ...action.payload,
          };
          break
        default:
          throw new Error(`unsupport dispatch type:${action} in SlideCaptcha reducer`)
      }
      this.update({
        state: {
          ...newState,
        },
      });
    }

    /**
     * ???????????????????????????
     */
    getMaxSlideWidth() {
      return this.props.width - 40
    }

    defaultEvent(e) {
      e.preventDefault();
    }

    refresh() {
      this.props.onRefresh && this.props.onRefresh();
      this.dispatch({ type: 'reset' });
    }

    /**
     * ??????/??????????????????
     * @param {*} currentPageX ???????????????????????????????????????????????????
     */
    dragStart(currentPageX) {
      const { state } = this.props;
      this.dispatch({
        type: 'change',
        payload: {
          isMove: true,
          poorX: currentPageX - state.distance, // ???????????????????????????????????????????????????
          startTime: new Date(),
        },
      });
    }

    /**
     * ????????????????????????
     * @param {*} currentPageX ???????????????????????????????????????????????????
     */
    dragMoving(currentPageX) {
      const { state } = this.props;
      const distance = currentPageX - state.poorX;
      // ???????????????????????????????????????????????????
      const maxSlideWidth = this.getMaxSlideWidth();
      if (state.isMove && distance !== state.distance && distance >= 0 && distance < maxSlideWidth) {
        this.dispatch({
          type: 'change',
          payload: {
            distance,
          },
        });
      }
    }

    /**
     * ??????????????????
     * @param {*} currentPageX ???????????????????????????????????????????????????
     */
    dragEnd() {
      const that = this;
      const { state, validate, autoRefreshOnFail, onFinish, token, onFinishFailed } = that.props;
      // ??????????????????5 ??????????????????
      if (!state.isMove || state.distance < 5) {
        that.dispatch({ type: 'reset' });
        return true
      }
      that.dispatch({ type: 'setMove', payload: false });
      if (state.poorX === undefined) {
        return true
      }
      that.dispatch({ type: 'setEndTime', payload: new Date() });
      setTimeout(() => {
        // ????????????????????????
        validate &&
          validate({
            token: token,
            point: state.distance,
            timespan: Math.abs(Number(state.endTime) - Number(state.startTime)),
          })
            .then((result) => {
              onFinish && onFinish(result);
              return result
            })
            .catch((err) => {
              if (onFinishFailed) {
                onFinishFailed(err, that.refresh);
              }
              if (autoRefreshOnFail) {
                that.refresh();
              }
            });
      });
    }

    handleMouseMove(e) {
      this.dragMoving(e.pageX);
    }

    handleMouseUp() {
      this.dragEnd();
    }

    handleRefreshCaptcha(e) {
      this.refresh();
      e.preventDefault && e.preventDefault();
      e.stopPropagation && e.stopPropagation();
      e.stopImmediatePropagation && e.stopImmediatePropagation();
    }

    _config() {
      const { width, height, bgSrc, captchSrc, top, tip, refreshTitle, state } = this.props;
      const that = this;
      this.setProps({
        attrs: {
          style: {
            height: `${height + 34}px`,
            width: `${width}px`,
          },
        },
        children: [
          {
            tag: 'div',
            attrs: {
              style: {
                width: `${width}px`,
                height: `${height}px`,
                background: '#e8e8e8',
              },
            },
            children: [
              {
                tag: 'div',
                classes: {
                  'captcha-img': true,
                },
                attrs: {
                  style: {
                    backgroundImage: `url(${bgSrc})`,
                    width: `${width}px`,
                    height: `${height}px`,
                  },
                },
              },
              {
                tag: 'div',
                classes: {
                  'small-drag': true,
                },

                attrs: {
                  style: {
                    backgroundImage: `url(${captchSrc})`,
                    top: `${top}px`,
                    left: `${state.distance}px`,
                  },
                },
              },
            ],
          },
          {
            tag: 'div',
            classes: {
              drag: true,
            },
            attrs: {
              style: {
                width: `${width}px`,
              },
            },
            children: [
              {
                tag: 'div',
                classes: {
                  'drag-bg': true,
                },
                attrs: {
                  style: {
                    width: `${state.distance}px`,
                  },
                },
              },
              {
                tag: 'div',
                classes: {
                  'drag-text': true,
                },
                attrs: {
                  style: {
                    width: `${width}px`,
                  },
                  unselectable: 'on',
                },
                children: tip,
              },
              {
                tag: 'div',
                classes: {
                  handler: true,
                  'handler-bg': true,
                },
                attrs: {
                  style: {
                    left: `${state.distance}px`,
                  },
                  onmousedown: function (e) {
                    that.dragStart(e.pageX);
                  },
                },
              },
              {
                classes: {
                  'refesh-btn': true,
                },
                component: 'Button',
                icon: 'refresh',
                shape: 'circle',
                type: 'link',
                attrs: {
                  onmouseup: this.handleRefreshCaptcha,
                  style: {
                    visibility: state.isMove ? 'hidden' : 'visible',
                  },
                  title: refreshTitle,
                },
              },
            ],
          },
        ],
      });
    }

    _created() {
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.dragStart = this.dragStart.bind(this);
      this.dragEnd = this.dragEnd.bind(this);
      this.dragMoving = this.dragMoving.bind(this);

      this.handleRefreshCaptcha = this.handleRefreshCaptcha.bind(this);
      this.defaultEvent = this.defaultEvent.bind(this);

      // ???????????????????????????
      this.referenceElement.addEventListener('mousemove', this.handleMouseMove, true);
      this.referenceElement.addEventListener('mouseup', this.handleMouseUp);
    }

    _remove() {
      this.referenceElement.removeEventListener('mousemove', this.handleMouseMove, true);
      this.referenceElement.removeEventListener('mouseup', this.handleMouseUp);
    }
  }

  Component.register(SlideCaptcha);

  function getValidMax(value) {
    if (!isNumeric(value)) return 100
    if (value <= 0) return 100
    return value
  }

  function getValidValue(val, max = 100) {
    if (!val || !isNumeric(val) || val < 0) return 0
    if (val > max) return max
    return val
  }

  function getOffset$1(container, offset, max = 100) {
    let _container = container;
    if (!_container) {
      return null
    }

    if (_container instanceof Component) {
      _container = container.element;
    }

    if (!(_container instanceof HTMLElement)) {
      return null
    }

    const { left, width } = _container.getBoundingClientRect();
    let result = ((offset - left) * max) / width;

    result = Math.min(max, result);
    result = Math.max(0, result);
    return result
  }

  class Slider extends Field {
    constructor(props, ...mixins) {
      const defaults = {
        disable: false,
        max: 100,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      const { value } = this.props;
      // ??????????????????????????????0???????????????????????????100
      const max = getValidMax();
      this.initValue = getValidValue(value, max);
      super._created();
    }

    _config() {
      const sliderRef = this;
      const { value, disable, showTip } = this.props;
      this._max = getValidMax(this.props.max);
      sliderRef._offset = getValidValue(value, this._max);

      this.setProps({
        control: {
          children: {
            classes: {
              'nom-slider-content': true,
              'nom-slider-content-disabled': disable,
            },
            _created() {
              sliderRef._bar = this;
            },
            onClick: disable
              ? null
              : ({ event }) => {
                  event.target.focus();
                  const _offset = getOffset$1(sliderRef._bar, event.clientX, sliderRef._max);
                  sliderRef.setValue(Math.round(_offset));
                },
            attrs: {
              tabindex: '0',
              onkeydown: sliderRef._handleKeyDown.bind(sliderRef),
            },
            children: [
              {
                classes: {
                  'nom-slider-rail': true,
                },
              },
              {
                classes: {
                  'nom-slider-track': true,
                },
                _created() {
                  sliderRef._track = this;
                },
                _config() {
                  // const { offset } = this.props
                  const offset = sliderRef.getValue();
                  const _offset = offset / sliderRef._max;
                  this.setProps({
                    attrs: {
                      style: { left: 0, width: `${_offset * 100}%` },
                    },
                  });
                },
              },
              // {
              //   classes: {
              //     'nom-slider-step': true,
              //   },
              // },
              {
                classes: {
                  'nom-slider-handle': true,
                },
                _created() {
                  sliderRef._handler = this;
                },
                _config() {
                  const offset = sliderRef.getValue();
                  const _offset = offset / sliderRef._max;

                  const tip = isFalsy(offset) ? 0 : offset.toString();
                  let tooltip = showTip === false ? null : tip;
                  if (showTip && isFunction$1(showTip)) {
                    tooltip = showTip(tip);
                  }
                  this.setProps({
                    attrs: {
                      style: { left: `${_offset * 100}%` },
                    },
                    tooltip,
                  });
                },
              },
            ],
          },
        },
      });

      super._config();
    }

    _getValue() {
      return getValidValue(this._offset, this._max)
    }

    _setValue(value) {
      const _value = value === null ? 0 : value;
      if (!isNumeric(_value) || _value < 0 || _value > this.props.max) return
      if (this._handler && _value !== this.oldValue) {
        this._offset = _value;
        this._handler.update();
        this._track.update();

        super._onValueChange();
        this.oldValue = this.currentValue;
        this.currentValue = _value;
      }
    }

    _handleKeyDown(e) {
      const { keyCode } = e;
      const value = this.getValue();
      if (keyCode === 38) {
        if (value <= this.props.max) {
          this.setValue(value + 1);
        }
      } else if (keyCode === 40) {
        if (value >= 0) {
          this.setValue(value - 1);
        }
      }
    }
  }

  Component.register(Slider);

  class StaticText extends Field {
      constructor(props, ...mixins) {
          const defaults = {
              value: null,
          };

          super(Component.extendProps(defaults, props), ...mixins);
      }

      _config() {
          this.setProps({
              control: {
                  children: this.props.value,
              }
          });
          super._config();
      }

      _setValue(value) {
          this.update({
              value,
          });
      }

      _getValue() {
          return this.props.value
      }
  }

  Component.register(StaticText);

  const STATUS = {
    WAIT: 'wait',
    PROCESS: 'process',
    FINISH: 'finish',
    ERROR: 'error',
  };

  class Step extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        disabled: false,
        current: 0,
        // wait process finish error
        status: 'wait',
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      // status wait process finish error
      const { status, title, subTitle, description, onChange, index, icon: i } = this.props;

      const icon = this._handleIcon();

      this.setProps({
        classes: {
          [`nom-step-item-${status}`]: true,
        },
        children: {
          classes: {
            'nom-step-item-container': true,
          },
          _config() {
            if (onChange) {
              this.setProps({
                attrs: { role: 'button' },
                onClick: () => {
                  onChange(index);
                },
              });
            }
          },
          children: [
            {
              classes: {
                'nom-step-item-tail': true,
              },
            },
            {
              classes: {
                'nom-step-item-icon': true,
                'nom-step-item-icon-customer': !!i,
              },
              children: icon,
            },
            {
              classes: {
                'nom-step-item-content': true,
              },
              children: [
                {
                  classes: {
                    'nom-step-item-title': true,
                  },
                  children: title,
                },
                {
                  classes: {
                    'nom-step-item-subtitle': true,
                  },
                  children: subTitle,
                },
                {
                  classes: {
                    'nom-step-item-description': true,
                  },
                  children: description,
                },
              ],
            },
          ],
        },
      });

      super._config();
    }

    _handleIcon() {
      const { status, icon: i, index } = this.props;
      // const { WAIT, PROCESS, FINISH, ERROR } = STATUS
      const { FINISH, ERROR } = STATUS;

      if (i) {
        return Component.normalizeIconProps(i)
      }
      if (status === FINISH) {
        return {
          component: 'Icon',
          type: 'check',
          classes: {
            [`nom-step-${status}-icon`]: true,
          },
        }
      }
      if (status === ERROR) {
        return {
          component: 'Icon',
          type: 'close',
          classes: {
            [`nom-step-${status}-icon`]: true,
          },
        }
      }
      return {
        tag: 'span',
        children: index + 1,
        classes: {
          [`nom-step-${status}-icon`]: true,
        },
      }
    }
  }

  class Steps extends Component {
    constructor(props, ...mixins) {
      // active current
      const defaults = {
        direction: 'horizontal',
        current: 0,
        options: [],
        onChange: null,
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      // const steps = this
      const { direction, current } = this.props;
      this._handleCurrent(current);

      this.setProps({
        tag: 'div',
        classes: {
          'nom-steps-horizontal': direction === 'horizontal',
          'nom-steps-vertical': direction === 'vertical',
        },
      });

      this.setProps({ children: this._handleChild() });

      super._config();
    }

    _handleChild() {
      const { options, onChange } = this.props;

      if (!options || !Array.isArray(options) || options.length === 0) return []

      return options.map((item, index) => ({
        status: this._getStatus(index, this.current),
        ...item,
        index,
        component: Step,
        onChange: isFunction$1(onChange) ? onChange : undefined,
      }))
    }

    _getStatus(index, current) {
      const { WAIT, PROCESS, FINISH } = STATUS;
      if (index === current) return PROCESS

      return index < current ? FINISH : WAIT
    }

    _handleCurrent(cur) {
      let current = 0;
      if (isNumeric(cur)) current = parseInt(cur, 10);

      this.current = current;
    }
  }

  Component.register(Steps);

  class Switch extends Field {
    constructor(props, ...mixins) {
      const defaults = {

        unselectedText: '???',
        selectedText: '???',
        value: false,
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const that = this;
      const { value, unselectedText, selectedText } = this.props;

      this._propStyleClasses = ['size'];
      this.setProps({
        control: {
          tag: 'button',
          classes: { 'nom-switch-control': true, 'nom-switch-active': !!value },
          attrs: {
            onclick: () => {
              that._handleClick();
            },
          },
          children: [
            {
              tag: 'input',
              _created() {
                that.ck = this;
              },
              attrs: {
                type: 'checkbox',
                hidden: true,
                checked: value,
                onchange() {
                  that._onValueChange();
                  that.update({ value: !value });
                },
              },
            },
            {
              tag: 'div',
              classes: {
                'nom-switch-el': true,
                'nom-switch-text': value,
                'nom-switch-indicator': !value,
              },
              children: value ? selectedText : null,
            },
            {
              tag: 'div',
              children: value ? null : unselectedText,
              classes: {
                'nom-switch-el': true,
                'nom-switch-text': !value,
                'nom-switch-indicator': value,
              },
            },
          ],
        }
      });

      super._config();
    }

    _handleClick() {
      if (this.ck) {
        this.ck.element.click();
      }
    }

    _getValue() {
      return this.ck.element.checked
    }

    _setValue(value) {
      this.ck.element.checked = value === true;
    }
  }

  Component.register(Switch);

  class TabPanel extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        hidden: true,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.tabContent = this.parent;
      this.tabContent.panels[this.key] = this;
    }

    _config() {
      this.setProps({
        hidden: this.key !== this.tabContent.props.selectedPanel,
      });
    }

    _show() {
      if (this.tabContent.shownPanel === this) {
        return
      }
      this.tabContent.shownPanel && this.tabContent.shownPanel.hide();
      this.tabContent.shownPanel = this;
      this.tabContent.props.selectedPanel = this.key;
    }
  }

  Component.register(TabPanel);

  class TabContent extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        panels: [],
        panelDefaults: { component: TabPanel },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.panels = {};
      this.shownPanel = null;
    }

    _config() {
      const { panels } = this.props;
      const children = [];
      if (Array.isArray(panels) && panels.length > 0) {
        for (let i = 0; i < panels.length; i++) {
          let panel = panels[i];
          panel = Component.extendProps({}, this.props.panelDefaults, panel);
          children.push(panel);
        }
      }

      this.setProps({
        children: children,
      });
    }

    getPanel(param) {
      let retPanel = null;

      if (isString(param)) {
        return this.panels[param]
      }
      if (isFunction$1(param)) {
        for (const panel in this.panels) {
          if (this.panels.hasOwnProperty(panel)) {
            if (param.call(this.panels[panel]) === true) {
              retPanel = this.panels[panel];
              break
            }
          }
        }
      }

      return retPanel
    }

    showPanel(param) {
      const panel = this.getPanel(param);
      if (panel === null) {
        return false
      }
      panel.show();
    }
  }

  Component.register(TabContent);

  class TabItem extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'a',
        url: null,
        icon: null,
        text: null,
        subtext: null,
        selectable: {
          byClick: true,
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.firstShow = true;
    }

    _config() {
      const { icon, text, subtext } = this.props;
      this.setProps({
        attrs: {
          href: this.getItemUrl(this.props.url),
        },
        children: [
          icon && { component: 'Icon', type: icon },
          text && { tag: 'span', children: text },
          subtext && { tag: 'span', children: subtext },
        ],
      });
    }

    _select() {
      setTimeout(() => {
        const tabContent = this.list.getTabContent();
        tabContent.showPanel(this.key);
        !this.list.firstSelect && this.list.triggerChange();
        this.list.firstSelect = false;
      }, 0);
    }

    getItemUrl(url) {
      if (url) {
        return url
      }

      return 'javascript:void(0);'
    }
  }

  Component.register(TabItem);

  class TabList extends List {
    constructor(props, ...mixins) {
      const defaults = {
        itemDefaults: {
          component: TabItem,
        },
        tabContent: null,
        uistyle: 'plain',
        itemSelectable: {
          byClick: true,
        },
        onTabSelectionChange: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();

      this.firstSelect = true;
    }

    _config() {
      this._addPropStyle('direction', 'fit');
      this.setProps({
        selectedItems: this.props.selectedTab,
      });

      super._config();
    }

    getTabContent() {
      return this.props.tabContent.call(this)
    }

    selectTab(param, selectOptions) {
      this.selectItems(param, selectOptions);
    }

    triggerChange() {
      if (this.parent.componentType && this.parent.componentType === 'Tabs') {
        this._callHandler(this.parent.props.onTabSelectionChange);
      } else {
        this._callHandler(this.props.onTabSelectionChange);
      }
    }
  }

  Component.register(TabList);

  class Tabs extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tabs: [],
        // selectedTab: 'tab0',
        uistyle: 'plain', // hat,card,line,pill
        onTabSelectionChange: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this._addPropStyle('fit');
      const that = this;
      const tabItems = [];
      const tabPanles = [];
      const { tabs, uistyle } = this.props;
      let { selectedTab } = this.props;
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const key = tab.key || `tab${i}`;
        tab.item.key = key;
        tab.panel.key = key;
        tabItems.push(tab.item);
        tabPanles.push(tab.panel);
      }

      if (selectedTab === undefined) {
        selectedTab = tabItems[0] && tabItems[0].key;
      }

      this.setProps({
        tabList: {
          component: TabList,
          name: 'tabList',
          items: tabItems,
          uistyle: uistyle,
          selectedTab: selectedTab,
          _created: function () {
            this.tabs = that;
            that.tabList = this;
          },
          tabContent: function () {
            return that.tabContent
          },
        },
        tabContent: {
          component: TabContent,
          panels: tabPanles,
          _created: function () {
            that.tabContent = this;
          },
        },
      });

      this.setProps({
        children: [this.props.tabList, this.props.tabContent],
      });
    }

    getSelectedTab() {
      return this.tabList.getSelectedItem()
    }

    selectTab(key) {
      return this.tabList.selectItem(key)
    }

    updatePanel(key, newPanelProps) {
      const panel = this.tabContent.getPanel(key);
      panel.update(newPanelProps);
    }
  }

  Component.register(Tabs);

  class Tag extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        key: null,
        tag: 'span',
        type: 'square',
        color: null,
        text: null,
        icon: null,
        number: null,
        overflowCount: 99,
        removable: false,
        size: 'sm',
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      this._propStyleClasses = ['size', 'color'];
      const { icon, text, type, number, overflowCount, removable } = this.props;

      const that = this;
      if (icon) {
        this.setProps({
          classes: {
            'p-with-icon': true,
          },
        });
      }

      if (type === 'round') {
        this.setProps({
          classes: {
            'u-shape-round': true,
          },
        });
      }

      this.setProps({
        children: [
          Component.normalizeIconProps(icon),
          text && { tag: 'span', children: text },
          number && { tag: 'span', children: number > overflowCount ? `${overflowCount}+` : number },
          removable &&
            Component.normalizeIconProps({
              type: 'times',
              classes: {
                'nom-tag-remove': true,
                'nom-tag-remove-basic': !that.props.styles,
              },
              onClick: function () {
                that.props.removable(that.props.key);
              },
            }),
        ],
      });
    }

    _disable() {
      this.element.setAttribute('disabled', 'disabled');
    }
  }

  Component.register(Tag);

  class TimelineItem extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'li',
        color: 'blue', // ?????????????????? blue, red, green, gray????????????????????????
        dot: null, // ?????????????????????
        label: null, // ????????????
        pending: false, // ?????????????????????
        children: null, // ??????
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { dot, color, label, pending, children } = this.props;

      this.setProps({
        classes: {
          'nom-timeline-item': true,
          'nom-timeline-item-pending': pending,
        },
        children: [
          label && {
            tag: 'div',
            classes: {
              'nom-timeline-item-label': true,
            },
            children: label,
          },
          {
            tag: 'div',
            classes: {
              'nom-timeline-item-tail': true,
            },
          },
          {
            tag: 'div',
            classes: {
              'nom-timeline-item-head': true,
              'nom-timeline-item-head-custom': !!dot,
              [`nom-timeline-item-head-${color}`]: true,
            },
            attrs: {
              style: {
                'border-color': /blue|red|green|gray/.test(color || '') ? undefined : color,
              },
            },
            children: [dot],
          },
          {
            tag: 'div',
            classes: {
              'nom-timeline-item-content': true,
            },
            children,
          },
        ],
      });
    }
  }

  Component.register(TimelineItem);

  class Timeline extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        tag: 'ul',
        mode: 'left', // ???????????? mode ????????????????????????????????????????????? left | alternate | right
        pending: false, // ???????????????????????????????????????????????????,???????????????????????????????????????
        // ????????????????????????????????????????????????????????????
        pendingDot: {
          component: 'Icon',
          type: 'loading',
        },
        reverse: false, // ????????????
        items: null, // ??????????????????
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _getPositionClass(ele, index) {
      const { mode } = this.props;
      if (mode === 'alternate') {
        return index % 2 === 0 ? `nom-timeline-item-left` : `nom-timeline-item-right`
      }
      if (mode === 'left') {
        return `nom-timeline-item-left`
      }
      if (mode === 'right') {
        return `nom-timeline-item-right`
      }
      if (ele.props && ele.props.position === 'right') {
        return `nom-timeline-item-right`
      }
      return ''
    }

    _config() {
      const { reverse, pending, mode, pendingDot, items } = this.props;
      const that = this;
      const hasLabelItem = items && items.some((item) => item && item.label);

      // ??????pending??????
      const pendingItem = pending
        ? {
            component: TimelineItem,
            pending: !!pending,
            dot: pendingDot || { component: 'Icon', type: 'loading' },
            children: typeof pending === 'boolean' ? null : pending,
          }
        : null;

      // ??????position

      const children = [];
      if (Array.isArray(items) && items.length > 0) {
        const timeLineItems = [...items];
        if (pendingItem) {
          timeLineItems.push(pendingItem);
        }
        if (reverse) {
          timeLineItems.reverse();
        }
        const itemsCount = timeLineItems.length;
        const lastCls = 'nom-timeline-item-last';

        for (let i = 0; i < timeLineItems.length; i++) {
          const ele = timeLineItems[i];
          const positionCls = that._getPositionClass(ele, i);
          const pendingClass = i === itemsCount - 2 ? lastCls : '';
          const readyClass = i === itemsCount - 1 ? lastCls : '';
          children.push({
            component: TimelineItem,
            ...ele,
            classes: {
              ...ele.classes,
              [!reverse && !!pending ? pendingClass : readyClass]: true,
              [positionCls]: true,
            },
          });
        }
      }

      this.setProps({
        classes: {
          [`nom-timeline-pending`]: !!pending,
          [`nom-timeline-reverse`]: !!reverse,
          [`nom-timeline-${mode}`]: !!mode && !hasLabelItem,
          [`nom-timeline-label`]: hasLabelItem,
        },
        children,
      });
    }
  }

  Component.register(Timeline);

  class TimePickerList extends List {
    constructor(props, ...mixins) {
      const defaults = {
        gutter: 'sm',
        cols: 1,
        min: '00',
        max: '59',
        scrollIntoView: false,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();

      this.scroller = this.parent;
      this.timeWrapper = this.parent.parent.parent.parent.parent;
      this.pickerControl = this.timeWrapper.parentPopup.pickerControl;
      this.pickerControl.timeList[this.props.type] = this;
    }

    _config() {
      let items = [];
      const selected = [];
      const that = this;
      this.props.min = this.pickerControl.timeRange[this.props.type][0];
      this.props.max = this.pickerControl.timeRange[this.props.type][1];

      if (this.props.type === 'hour') {
        items = this.pickerControl.getHour();
        !this.pickerControl.empty && selected.push(this.pickerControl.time.hour);
      } else if (this.props.type === 'minute') {
        items = this.pickerControl.getMinute();
        !this.pickerControl.empty && selected.push(this.pickerControl.time.minute);
      } else if (this.props.type === 'second') {
        items = this.pickerControl.getSecond();
        !this.pickerControl.empty && selected.push(this.pickerControl.time.second);
      }

      this.setProps({
        styles: {
          padding: '3px',
        },

        items: items,
        itemSelectable: {
          multiple: false,
          byClick: true,
        },
        selectedItems: selected,
        itemDefaults: {
          _config: function () {
            const key = this.props.key;

            if (key < that.props.min || key > that.props.max) {
              this.setProps({
                disabled: true,
              });
            }
          },
        },

        onItemSelectionChange: () => {
          this.onChange();
        },
      });

      super._config();
    }

    onChange() {
      this.scrollToKey();
      this.setTime();
    }

    setTime() {
      const key = this.getSelectedItem().key || '00';
      this.pickerControl.setTime({
        type: this.props.type,
        value: key,
      });
    }

    resetTime() {
      if (this.pickerControl.getValue() || this.pickerControl.defaultValue) {
        const t = this.pickerControl.getValue()
          ? this.pickerControl.getValue().split(':')
          : this.pickerControl.defaultValue.split(':');

        if (this.props.type === 'hour') {
          // this.selectItem(t[0])
          this.update({ selectedItems: t[0] });
        } else if (this.props.type === 'minute') {
          // this.selectItem(t[1])
          this.update({ selectedItems: t[1] });
        } else {
          // this.selectItem(t[2])
          this.update({ selectedItems: t[2] });
        }
      } else {
        this.unselectAllItems();
      }
    }

    refresh() {
      const selected = [];
      this.getSelectedItem() && selected.push(this.getSelectedItem().props.key);
      this.props.selectedItems = selected;

      this.update();

      this.scrollToKey();
    }

    scrollToKey() {
      const top = this.getSelectedItem() ? this.getSelectedItem().element.offsetTop - 3 : 0;
      this.scroller.element.scrollTop = top;
      // this.scrollToSelected()
    }
  }

  class TimePickerWrapper extends Component {
    constructor(props, ...mixins) {
      const defaults = {};

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this.parentPopup = this.parent.parent.parent;
      this.pickerControl = this.parentPopup.pickerControl;
    }

    _config() {
      const that = this;
      const noStep =
        !that.pickerControl.props.hourStep &&
        !that.pickerControl.props.minuteStep &&
        !that.pickerControl.props.secondStep;

      const nowInRange =
        (!(
          that.pickerControl.props.minTime &&
          that.pickerControl.props.minTime > new Date().format(that.pickerControl.props.format)
        ) &&
          !(
            that.pickerControl.props.maxTime &&
            that.pickerControl.props.maxTime < new Date().format(that.pickerControl.props.format)
          )) ||
        (!that.pickerControl.props.minTime && !that.pickerControl.props.maxTime);

      this.setProps({
        children: {
          component: 'Rows',
          gutter: null,
          items: [
            {
              component: 'Cols',
              gutter: null,
              classes: {
                'timepicker-group': true,
              },
              fills: true,
              align: 'stretch',
              children: [
                {
                  hidden: !this.pickerControl.props.format.includes('HH'),
                  children: {
                    component: TimePickerList,
                    type: 'hour',
                  },
                },
                {
                  hidden: !this.pickerControl.props.format.includes('mm'),
                  children: {
                    component: TimePickerList,
                    type: 'minute',
                  },
                },
                {
                  hidden: !this.pickerControl.props.format.includes('ss'),
                  children: {
                    component: TimePickerList,
                    type: 'second',
                  },
                },
              ],
            },
            {
              component: 'Cols',
              justify: 'between',
              attrs: {
                style: {
                  padding: '5px',
                  'border-top': '1px solid #ddd',
                },
              },
              items: [
                noStep && {
                  component: 'Button',
                  size: 'small',
                  text: '??????',
                  disabled: !nowInRange,
                  onClick: function () {
                    that.pickerControl.setNow();

                    that.pickerControl.popup.hide();
                    that.pickerControl.handleChange();
                  },
                },
                that.pickerControl.props.defaultValue && {
                  component: 'Button',
                  size: 'small',
                  text: '??????',
                  onClick: function () {
                    that.pickerControl.popup.hide();
                    that.pickerControl.handleChange();
                    that.pickerControl.defaultValue = that.pickerControl.props.defaultValue;
                  },
                },
              ],
            },
          ],
        },
      });
    }
  }

  Component.register(TimePickerWrapper);

  class TimePickerPopup extends Popup {
    constructor(props, ...mixins) {
      const defaults = {};

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
      this.pickerControl = this.opener.parent.parent;
    }

    _config() {
      this.setProps({
        children: {
          component: Layout,
          body: {
            children: {
              component: TimePickerWrapper,
            },
          },
        },
      });

      super._config();
    }
  }

  Component.register(TimePickerPopup);

  class TimePicker extends Textbox {
    constructor(props, ...mixins) {
      const defaults = {
        allowClear: true,
        value: null,
        format: 'HH:mm:ss',
        hourStep: null,
        minuteStep: null,
        secondStep: null,
        readonly: true,
        placeholder: null,
        showNow: true,
        minTime: null,
        maxTime: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
      this.defaultValue = this.props.value;
      this.timeList = [];

      // this.confirm = false
      this.empty = !this.props.value;

      this.minTime = {
        hour: '00',
        minute: '00',
        second: '00',
      };
      this.maxTime = {
        hour: '23',
        minute: '59',
        second: '59',
      };

      this.time = {
        hour: '00',
        minute: '00',
        second: '00',
      };

      if (this.props.value) {
        const t = this.props.value.split(':');
        this.time.hour = t[0] || '00';
        this.time.minute = t[1] || '00';
        this.time.second = t[2] || '00';
      }

      this.defaultTime = this.time;

      this.hasPopup = false;
    }

    _config() {
      if (this.props.minTime) {
        const time = new Date(`2000 ${this.props.minTime}`);

        this.minTime = {
          hour: this.getDoubleDigit(time.getHours()),
          minute: this.getDoubleDigit(time.getMinutes()),
          second: this.getDoubleDigit(time.getSeconds()),
        };
      }
      if (this.props.maxTime) {
        const time = new Date(`2000 ${this.props.maxTime}`);
        this.maxTime = {
          hour: this.getDoubleDigit(time.getHours()),
          minute: this.getDoubleDigit(time.getMinutes()),
          second: this.getDoubleDigit(time.getSeconds()),
        };
      }

      this.timeRange = {
        hour: [this.minTime.hour, this.maxTime.hour],
        minute: ['00', '59'],
        second: ['00', '59'],
      };

      this.setProps({
        leftIcon: 'clock',
        rightIcon: {
          type: 'times',
          hidden: !this.props.allowClear,
          onClick: (args) => {
            this.clearTime();
            args.event && args.event.stopPropagation();
          },
        },
      });

      super._config();
    }

    _rendered() {
      const that = this;

      this.popup = new TimePickerPopup({
        trigger: this.control,
        onHide: () => {
          that.getValue() !== that.defaultValue && that.handleChange();
        },
        onShow: () => {
          Object.keys(this.timeList).forEach(function (key) {
            that.timeList[key].scrollToKey();
          });
        },
      });

      // if (!this.hasPopup) {
      //   this.popup = new TimePickerPopup({
      //     trigger: this.control,
      //     onHide: () => {
      //       !this.hidden && that.getValue() !== that.defaultValue && that.handleChange()
      //       this.hidden = true
      //     },
      //     onShow: () => {
      //       this.hidden = false
      //       // this.confirm = false
      //       Object.keys(this.timeList).forEach(function (key) {
      //         that.timeList[key].scrollToKey()
      //       })
      //     },
      //   })
      // }
      // this.hasPopup = true
    }

    getHour() {
      const hour = [];
      if (this.props.hourStep) {
        hour.push({
          key: '00',
          children: '00',
        });
        for (let i = 0; i < 24; i++) {
          if ((i + 1) % this.props.hourStep === 0 && i !== 23) {
            hour.push({
              key: this.getDoubleDigit(i + 1),
              children: this.getDoubleDigit(i + 1),
            });
          }
        }
        return hour
      }
      for (let i = 0; i < 24; i++) {
        hour.push({
          key: this.getDoubleDigit(i),
          children: this.getDoubleDigit(i),
        });
      }
      return hour
    }

    getMinute() {
      const minute = [];
      if (this.props.minuteStep) {
        minute.push({
          key: '00',
          children: '00',
        });
        for (let i = 0; i < 60; i++) {
          if ((i + 1) % this.props.minuteStep === 0 && i !== 59) {
            minute.push({
              key: this.getDoubleDigit(i + 1),
              children: this.getDoubleDigit(i + 1),
            });
          }
        }
        return minute
      }
      for (let i = 0; i < 60; i++) {
        minute.push({
          key: this.getDoubleDigit(i),
          children: this.getDoubleDigit(i),
        });
      }
      return minute
    }

    getSecond() {
      const second = [];
      if (this.props.secondStep) {
        second.push({
          key: '00',
          children: '00',
        });
        for (let i = 0; i < 60; i++) {
          if ((i + 1) % this.props.secondStep === 0 && i !== 59) {
            second.push({
              key: this.getDoubleDigit(i + 1),
              children: this.getDoubleDigit(i + 1),
            });
          }
        }
        return second
      }
      for (let i = 0; i < 60; i++) {
        second.push({
          key: this.getDoubleDigit(i),
          children: this.getDoubleDigit(i),
        });
      }
      return second
    }

    setTime(data) {
      this.time[data.type] = data.value;

      if (this.time.hour <= this.minTime.hour) {
        this.time.hour = this.minTime.hour;
        if (this.time.minute <= this.minTime.minute) {
          this.time.minute = this.minTime.minute;
        }
        if (this.time.minute <= this.minTime.minute) {
          if (this.time.second <= this.minTime.second) {
            this.time.second = this.minTime.second;
          }
        }
      }
      this.checkTimeRange();
      const result = new Date(
        '2000',
        '01',
        '01',
        this.time.hour,
        this.time.minute,
        this.time.second,
      ).format(this.props.format);

      this.setValue(result);
    }

    clearTime() {
      this.setValue(null);
      this.empty = true;

      this.time = {
        hour: '00',
        minute: '00',
        second: '00',
      };
      this.resetList();
      this.popup.hide();
    }

    setNow() {
      const c = new Date().format('HH:mm:ss');
      const t = c.split(':');
      this.time.hour = t[0];
      this.time.minute = t[1];
      this.time.second = t[2];
      this.checkTimeRange();
      this.setValue(c.format(this.props.format));

      this.empty = false;
      this.resetList();
      this.popup.hide();
    }

    resetList() {
      const that = this;
      Object.keys(this.timeList).forEach(function (key) {
        that.timeList[key].resetTime();
      });
    }

    handleChange() {
      this.props.onChange && this._callHandler(this.props.onChange);
    }

    showPopup() {
      this.popup.show();
    }

    getDoubleDigit(num) {
      if (num < 10) {
        return `0${num}`
      }
      return `${num}`
    }

    checkTimeRange() {
      const that = this;

      if (that.time.hour <= that.minTime.hour) {
        that.timeRange.hour = [that.minTime.hour, that.maxTime.hour];
        that.timeRange.minute = [that.minTime.minute, '59'];
        if (that.time.minute <= that.minTime.minute) {
          that.timeRange.second = [that.minTime.second, '59'];
        } else {
          that.timeRange.second = ['00', '59'];
        }
      } else if (that.time.hour >= that.maxTime.hour) {
        that.timeRange.minute = ['00', that.maxTime.minute];
        if (that.time.minute >= that.maxTime.minute) {
          that.timeRange.second = ['00', that.maxTime.second];
        } else {
          that.timeRange.second = ['00', '59'];
        }
      } else {
        that.timeRange.minute = that.timeRange.second = ['00', '59'];
      }

      this.empty = false;
      Object.keys(this.timeList).forEach(function (key) {
        that.timeList[key].refresh();
      });
    }
  }

  Component.register(TimePicker);

  class TimeRangePicker extends Group {
    constructor(props, ...mixins) {
      const defaults = {
        allowClear: true,
        value: null,
        format: 'HH:mm:ss',
        hourStep: 0,
        minuteStep: 0,
        secondStep: 0,
        readonly: true,
        placeholder: null,
        showNow: true,
        onChange: null,
        fieldName: {
          start: 'start',
          end: 'end',
        },
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
    }

    _config() {
      const that = this;
      const { format, hourStep, minuteStep, secondStep, allowClear, minTime, maxTime } = this.props;

      this.setProps({
        inline: true,
        fields: [
          {
            component: 'TimePicker',
            name: that.props.fieldName.start,
            placeholder: '????????????',
            ref: (c) => {
              that.startPicker = c;
            },
            onChange: function (args) {
              that.checkRange(args.sender.name);
            },
            format,
            hourStep,
            minuteStep,
            secondStep,
            allowClear,

            minTime,
            maxTime,
          },
          {
            component: 'StaticText',
            value: '-',
          },
          {
            component: 'TimePicker',
            name: that.props.fieldName.end,
            placeholder: '????????????',
            ref: (c) => {
              that.endPicker = c;
            },
            onChange: function (args) {
              that.checkRange(args.sender.name);
            },

            format,
            hourStep,
            minuteStep,
            secondStep,
            allowClear,

            minTime,
            maxTime,
          },
        ],
      });

      super._config();
    }

    handleChange() {
      this.props.onChange && this._callHandler(this.props.onChange);
    }

    checkRange(type) {
      const that = this;
      const active = type === this.props.fieldName.start ? this.startPicker : this.endPicker;
      const opposite = type === this.props.fieldName.start ? this.endPicker : this.startPicker;

      if (active.getValue()) {
        if (active.name === that.props.fieldName.start) {
          opposite.update({ minTime: active.getValue() });
          if (opposite.getValue() && opposite.getValue() < active.getValue()) {
            opposite.clearTime();
            opposite.focus();

            opposite.showPopup();
          } else if (!opposite.getValue()) {
            opposite.focus();

            opposite.showPopup();
          }
        } else if (opposite.getValue() && opposite.getValue() > active.getValue()) {
          opposite.clearTime();
        }
      }

      if (active.getValue() && opposite.getValue()) {
        that.handleChange();
      }
    }
  }

  Component.register(TimeRangePicker);

  class Toolbar extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        type: 'default',
        visibleItems: 2,
        gutter: 'sm',
        size: null,
        items: [],
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _config() {
      const { items, type, gutter, size, visibleItems } = this.props;

      const before = items.slice(0, visibleItems).map((item) => {
        return {
          component: 'Button',
          type: type,
          size: size,
          ...item,
        }
      });
      const dropdowns = {
        component: 'Dropdown',
        rightIcon: 'ellipsis',
        items: items.slice(visibleItems),
        type: type,
        size: size,
      };

      this.setProps({
        children: {
          component: 'Cols',
          gutter: gutter,
          items: [...before, items.length > visibleItems && dropdowns],
        },
      });
    }
  }

  Component.register(Toolbar);

  class TreeSelectPopup extends Popup {
    constructor(props, ...mixins) {
      const defaults = {};

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
      this.selectControl = this.opener.parent.parent.parent;
    }

    _config() {
      const that = this;

      this.setProps({
        attrs: {
          style: {
            width: `${this.selectControl.offsetWidth()}px`,
          },
        },
        children: {
          component: Layout,
          body: {
            children: {
              component: 'Tree',
              treeData: that.selectControl.props.treeData,
              selectedNodes: that.props.selectedNodes,
              multiple: that.selectControl.props.multiple,
              leafOnly: that.selectControl.props.leafOnly,
              onCheck: function (data) {
                that.selectControl.setValue(data);
              },
              _created: function () {
                that.selectControl.tree = this;
              },
            },
          },
        },
      });

      super._config();
    }
  }

  Component.register(TreeSelectPopup);

  class TreeSelect extends Field {
    constructor(props, ...mixins) {
      const defaults = {
        treeData: null,

        multiple: true,
        leafOnly: false,
        showArrow: true,
        selectedNodes: null,
      };

      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();
      this.items = [];
    }

    _config() {
      const { showArrow, selectedNodes } = this.props;
      const items = [];
      const that = this;
      if (typeof selectedNodes === 'string') {
        const temp = [];
        temp.push(selectedNodes);
        that.props.selectedNodes = temp;
      }

      if (selectedNodes) {
        that.getList().forEach(function (item) {
          that.props.selectedNodes.forEach(function (key) {
            if (key === item.key) {
              items.push({
                component: 'Tag',
                type: 'round',
                size: 'xs',
                text: item.title,
                key: item.key,
                removable: function (param) {
                  that.props.selectedNodes = that.props.selectedNodes.filter(function (k) {
                    return k !== param
                  });
                  that.update(that.props.selectedNodes);
                },
              });
            }
          });
        });
      }
      let children = [];
      const badges = { children: items };

      if (showArrow) {
        children = [
          badges,
          {
            component: Icon,
            type: 'down',
            _created: function () {
              that.arrow = this;
            },
            classes: {
              'nom-tree-select-arrow': true,
            },
          },
        ];
      }

      this.setProps({
        control: {
          children: children,
        }
      });

      super._config();
    }

    _rendered() {
      this.popup = new TreeSelectPopup({
        trigger: this.arrow,
        selectedNodes: this.props.selectedNodes,
      });
    }

    getList() {
      const list = [];
      function mapTree(data) {
        return data.forEach(function (item) {
          list.push({
            key: item.value,
            title: item.title,
            value: item.value,
          });
          if (item.children && item.children.length > 0) {
            mapTree(item.children);
          }
        })
      }

      mapTree(this.props.treeData);
      return list
    }

    setValue(data) {
      this.props.selectedNodes = data.items;
      this.update(this.props.selectedNodes);
    }

    _getValue() {
      return this.props.selectedNodes
    }
  }

  Component.register(TreeSelect);

  const DEFAULT_ACCEPT =
    'image/*,application/msword,application/pdf,application/x-rar-compressed,application/vnd.ms-excel,application/vnd.ms-powerpoint,application/vnd.ms-works,application/zip,audio/*,video/*,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.wordprocessingml.template,application/vnd.ms-word.document.macroEnabled.12,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.spreadsheetml.template,application/vnd.ms-excel.sheet.macroEnabled.12,application/vnd.ms-excel.template.macroEnabled.12,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.presentationml.template,application/vnd.openxmlformats-officedocument.presentationml.slideshow,application/vnd.ms-powerpoint.addin.macroEnabled.12,application/vnd.ms-powerpoint.presentation.macroEnabled.12,application/vnd.ms-powerpoint.slideshow.macroEnabled.12,application/csv';

  function getUUID() {
    return `nom-upload-${Math.random().toString().substr(2)}`
  }

  // export function getDate(timestamp) {
  //   if (isNumeric(timestamp) && POSITIVE_INTEGER.test(timestamp.toString())) {
  //     const date = new Date(timestamp)
  //     const month = date.getMonth() + 1
  //     const day = date.getDate()
  //     return `${date.getFullYear()}-${month > 9 ? month : `0${month}`}-${day > 9 ? day : `0${day}`}`
  //   }
  //   return null
  // }

  function isValidDate(date) {
    return (Number.isNaN(date) && !Number.isNaN(Date.parse(date))) || isNumeric(date)
  }

  function getDate(d) {
    if (!isValidDate(d)) return null
    return formatDate(d, 'yyyy-MM-dd')
  }

  function getFileSize(number) {
    if (!isNumeric(number)) {
      return 'NA bytes'
    }
    if (number < 1024) {
      return `${number} bytes`
    }
    if (number > 1024 && number < 1048576) {
      return `${(number / 1024).toFixed(2)} KB`
    }
    if (number > 1048576) {
      return `${(number / 1048576).toFixed(2)} MB`
    }
  }

  function isPromiseLike$1(promiseLike) {
    return (
      promiseLike !== null &&
      (typeof promiseLike === 'object' || typeof promiseLike === 'function') &&
      typeof promiseLike.then === 'function'
    )
  }

  function isBlobFile(file) {
    const ft = Object.prototype.toString.call(file);
    return ft === '[object File]' || ft === '[object Blob]'
  }

  function getFileFromList(file, fileList) {
    return fileList.find((e) => e.uuid === file.uuid)
  }

  function cloneFileWithInfo(file) {
    return {
      ...file,
      lastModified: file.lastModified,
      lastModifiedDate: file.lastModifiedDate,
      name: file.name,
      size: file.size,
      type: file.type,
      uuid: file.uuid,
      percent: 0,
      originFile: file,
    }
  }

  function removeFile(file, fileList) {
    const remains = fileList.filter((item) => item.uuid !== file.uuid);
    if (remains.lenth === fileList.length) {
      return null
    }
    return remains
  }

  class FileItem extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        disabled: false,
        file: null,
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      this._uploader = this.parent.parent.parent.parent;
    }

    _config() {
      const that = this;
      const { file, onRemove, allowUpdate, extraAction, customizeInfo } = this.props;
      const { uuid, status } = file;

      const _info = isFunction$1(customizeInfo)
        ? customizeInfo(file)
        : this._handleDefaultCustomizeInfo(file);

      if (uuid) {
        let imgDisplay = {};
        if (status === 'error') {
          imgDisplay = {
            children: [
              {
                component: 'Icon',
                type: 'file-error',
                classes: {
                  'file-img': true,
                },
              },
            ],
          };
        } else {
          imgDisplay =
            status === 'done'
              ? this.renderUploadedFile(file)
              : {
                  children: [
                    {
                      component: 'Icon',
                      type: 'loading',
                      classes: {
                        'file-img': true,
                      },
                    },
                  ],
                };
        }

        const actions = [];
        if (onRemove) {
          actions.push({
            tag: 'a',
            children: onRemove.text || '??????',
            attrs: {
              href: 'javascript:void(0)',
              onclick: (e) => {
                e.preventDefault();
                status !== 'removing' && onRemove.action({ sender: that._uploader, file });
              },
            },
          });
        }

        if (allowUpdate) {
          actions.push({
            tag: 'a',
            children: '??????',
            onClick() {
              that._uploader._handleUpdate({ file });
            },
          });
        }

        if (Array.isArray(extraAction) && extraAction.length > 0) {
          extraAction.forEach(({ text, action }) => {
            actions.push({
              tag: 'a',
              children: text,
              attrs: {
                href: 'javascript:void(0)',
                onclick: (e) => {
                  e.preventDefault();
                  isFunction$1(action) && action({ sender: that._uploader, file });
                },
              },
            });
          });
        }

        this.setProps({
          tag: 'div',
          children: [
            {
              tag: 'div',
              _config() {
                this.setProps({
                  children: [
                    {
                      ...imgDisplay,
                    },
                  ],
                });
                this.setProps({
                  classes: { 'upload-img-container': true },
                });
              },
            },
            {
              tag: 'div',
              _config() {
                this.setProps({
                  children: [
                    {
                      // tag: 'div',
                      _config() {
                        this.setProps({
                          children: _info,
                        });
                      },
                    },
                    {
                      // tag: 'div',
                      _config() {
                        this.setProps({
                          classes: {
                            'upload-opt-btn': true,
                            'upload-opt-removing': status === 'removing',
                          },
                        });
                      },
                      children: actions,
                    },
                  ],
                });
                this.setProps({
                  classes: { 'upload-info-container': true },
                });
              },
            },
          ],
        });

        this.setProps({
          classes: {
            'u-flex-row': true,
          },
        });
      }
    }

    renderUploadedFile(file) {
      // const { name } = file
      const renderer = this.props.renderer;
      if (isFunction$1(renderer)) {
        return {
          ...renderer(file),
          classes: {
            'file-img': true,
          },
        }
      }
      return {
        component: 'Icon',
        type: 'default',
        classes: {
          'file-img': true,
        },
      }
    }

    _handleDefaultCustomizeInfo(file) {
      if (!file) return null
      const { name, size, uploadTime } = file;
      return [
        {
          tag: 'span',
          children: [
            {
              tag: 'a',
              children: name,
              classes: { 'upload-file-name': true },
            },
          ],
        },
        {
          tag: 'span',
          children: getFileSize(size),
        },
        {
          tag: 'span',
          children: `???????????? : ${getDate(uploadTime) ? getDate(uploadTime) : 'NA'}`,
          classes: {
            'upload-file-update': true,
            'u-border-left ': true,
          },
        },
      ]
    }
  }

  class FileList extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        disabled: false,
        files: null,
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      super._created();

      this.uploaderControl = this.parent.parent.parent.control;
      this.uploaderControl.list = this;
    }

    _config() {
      const {
        files,
        onRemove,
        allowUpdate,
        extraAction,
        initializing,
        renderer,
        customizeInfo,
      } = this.props;
      const children = [];
      if (Array.isArray(files) && files.length > 0) {
        files.forEach((file) => {
          children.push({
            component: FileItem,
            file,
            onRemove,
            allowUpdate,
            extraAction,
            renderer,
            customizeInfo,
          });
        });
      }

      if (initializing) {
        this.setProps({
          tag: 'div',
          children: {
            component: 'Icon',
            type: 'loading',
            classes: {
              'file-img': true,
            },
          },
        });
      } else {
        this.setProps({
          tag: 'div',
          children,
        });
      }
    }
  }

  function getError(option, xhr) {
    const msg = `Can't ${option.method} ${option.action} ${xhr.status}`;
    const err = new Error(msg);
    return {
      ...err,
      status: xhr.status,
      method: option.method,
      url: option.action,
    }
  }

  function getBody(xhr) {
    const text = xhr.responseText || xhr.response;
    if (!text) {
      return text
    }

    try {
      return JSON.parse(text)
    } catch (e) {
      return text
    }
  }

  function upload(option) {
    const xhr = new XMLHttpRequest();

    if (option.onProgress && xhr.upload) {
      xhr.upload.onprogress = function progress(e) {
        if (e.total > 0) {
          e.percent = (e.loaded / e.total) * 100;
        }
        option.onProgress(e);
      };
    }

    const formData = new FormData();

    if (option.data) {
      Object.keys(option.data).forEach((key) => {
        const value = option.data[key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(`${key}[]`, item);
          });
          return
        }

        formData.append(key, option.data[key]);
      });
    }

    if (option.file instanceof Blob) {
      formData.append(option.filename, option.file, option.file.name);
    } else {
      formData.append(option.filename, option.file);
    }

    xhr.onerror = function error(e) {
      option.onError(e);
    };

    xhr.onload = function onload() {
      if (xhr.status < 200 || xhr.status >= 300) {
        return option.onError(getError(option, xhr), getBody(xhr))
      }

      return option.onSuccess(getBody(xhr), xhr)
    };

    xhr.open(option.method, option.action, true);

    if (option.withCredentials && 'withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    const headers = option.headers || {};

    if (headers['X-Requested-With'] !== null) {
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }

    Object.keys(headers).forEach((header) => {
      if (headers[header] !== null) {
        xhr.setRequestHeader(header, headers[header]);
      }
    });

    xhr.send(formData);

    return {
      abort() {
        xhr.abort();
      },
    }
  }

  class Uploader extends Field {
    constructor(props, ...mixins) {
      const defaults = {
        // ????????????
        action: '',
        disabled: false,
        beforeUpload: null,
        button: null,
        defaultFileList: [],
        multiple: true,
        name: 'file',
        display: true,
        data: {},
        // request option
        method: 'post',
        headers: {},
        withCredentials: false,
        allowUpdate: false,
        onRemove: null,
        renderer: null,
        extraAction: [],
        customizeInfo: null,
      };
      super(Component.extendProps(defaults, props), ...mixins);
      this.reqs = {};
      this.onChange.bind(this);
      this._changeUploadMode.bind(this);
    }

    _created() {
      // this.fileList = this.props.fileList || this.props.defaultFileList
      this._updateFile = null;
    }

    _config() {
      const that = this;
      // const { disabled, accept, button: cButton, multiple, files } = this.props;
      const {
        disabled,
        accept,
        button: cButton,
        multiple,
        extraAction,
        display,
        allowUpdate,
        onRemove,
        renderer,
        customizeInfo,
      } = this.props;

      this.fileList = this.props.fileList || this.props.defaultFileList;

      let initializing = true;
      if (isPromiseLike$1(that.fileList)) {
        that.fileList.then((fs) => {
          initializing = false;
          that.fileList = fs;

          if (!disabled && this.button) {
            that.button.enable();
          }
          that.list && that.list.update({ initializing: false, files: this.fileList });
        });
      } else {
        initializing = false;
      }
      const children = [];

      const defaultButtonProps = {
        component: 'Button',
        text: '??????',
        icon: 'upload',
      };

      const inputUploader = {
        tag: 'input',
        hidden: true,
        _created() {
          that.inputFile = this;
        },
        attrs: {
          type: 'file',
          multiple: multiple,
          accept: accept || DEFAULT_ACCEPT,
          onchange: that._onChange.bind(that),
          onclick: (e) => {
            e.stopPropagation();
          },
        },
      };

      children.push(inputUploader);

      let button = cButton;
      if (!button && button !== false) button = defaultButtonProps;

      if (button !== false) {
        button = {
          ...button,
          disabled: disabled || initializing,
          // disabled,
          ref: (c) => {
            that.button = c;
          },
          attrs: {
            onclick() {
              that._handleClick();
            },
            onKeyDown(e) {
              that._onKeyDowne(e);
            },
          },
        };
        children.push(button);
      }

      if (display) {
        if (initializing || (this.fileList && this.fileList.length > 0)) {
          children.push({
            component: FileList,
            classes: {
              'nom-file-list-only': button === false,
            },
            ref: (c) => {
              that.list = c;
            },
            initializing,
            files: this.fileList,
            renderer,
            onRemove: onRemove &&
              isFunction$1(onRemove.action) && {
                ...onRemove,
                action: that.handleRemove.bind(that),
              },
            allowUpdate,
            extraAction,
            customizeInfo,
          });
        }
      }

      this.setProps({
        control: {
          children,
        },
      });

      super._config();
    }

    _onChange(e) {
      const { files } = e.target;
      const uploadedFiles = this.fileList;
      this.uploadFiles(files, uploadedFiles);
    }

    uploadFiles(files, uploadedFiles) {
      // ????????????
      let fileList = Array.from(files);
      const uploadedFileList = Array.from(uploadedFiles);

      if (this._updateFile) {
        fileList = fileList.map((e) => {
          e.uuid = this._updateFile;
          e.uploadTime = new Date().getTime();
          return e
        });

        uploadedFiles.map((file) => {
          if (file.uuid === this._updateFile) {
            const f = fileList[0] || [];
            f.uuid = this._updateFile;
            return f
          }
          return file
        });
      } else {
        fileList = fileList.map((e) => {
          if (!e.uuid) {
            e.uuid = getUUID();
          }
          e.uploadTime = new Date().getTime();
          return e
        });
      }

      fileList.forEach((file) => {
        this.upload(file, [...uploadedFileList, ...fileList]);
      });
    }

    upload(file, fileList) {
      const beforeUpload = this.props.beforeUpload;
      if (!beforeUpload) {
        Promise.resolve().then(() => this.post(file));
        return
      }

      const before = beforeUpload(file, fileList);
      if (isPromiseLike$1(before)) {
        before.then((pFile) => {
          if (isBlobFile(pFile)) {
            this.post(pFile);
            return
          }
          this.post(file);
        });
      } else if (before !== false) {
        Promise.resolve().then(() => {
          this.post(file);
        });
      }
    }

    post(file) {
      if (!this.rendered) {
        return
      }

      const that = this;
      const { props } = this;
      new Promise((resolve) => {
        const actionRet = this.props.action;
        resolve(isFunction$1(actionRet) ? actionRet(file) : actionRet);
      }).then((action) => {
        const { data, method, headers, withCredentials } = props;
        const option = {
          action,
          data,
          file,
          filename: props.name,
          method,
          headers,
          withCredentials,
          onProgress: (e) => {
            that.onProgress(e, file);
          },
          onSuccess: (ret, xhr) => {
            that.onSuccess(ret, file, xhr);
          },
          onError: (err, ret) => {
            that.onError(err, ret, file);
          },
        };
        this.onStart(file);
        this.reqs[file.uuid] = upload(option);
        this._updateFile = null;
        this._changeUploadMode();
      });
    }

    onChange(info) {
      // ????????????
      this.fileList = info.fileList;

      const { onChange: onChangeProp } = this.props;
      this.update({ fileList: [...info.fileList] });

      if (this.button) {
        const disableBtn = this.fileList.some((file) =>
          ['removing', 'uploading', 'updating'].includes(file.status),
        );

        if (!this.props.disabled) {
          disableBtn ? this.button.disable() : this.button.enable();
        }
      }

      if (onChangeProp) {
        onChangeProp({
          ...info,
          sender: this,
          fileList: [...this.fileList],
        });
      }
    }

    onStart(file) {
      const uploadFile = cloneFileWithInfo(file);
      uploadFile.status = this._updateFile ? 'updating' : 'uploading';

      // ????????????
      const nextFileList = Array.from(this.fileList);

      const findIndex = nextFileList.findIndex((f) => f.uuid === uploadFile.uuid);
      if (findIndex === -1) {
        nextFileList.push(uploadFile);
      } else {
        nextFileList[findIndex] = uploadFile;
      }

      this.onChange({
        file: uploadFile,
        fileList: nextFileList,
      });
    }

    onProgress(e, file) {
      const uploadingFile = getFileFromList(file, this.fileList);
      if (!uploadingFile) {
        return
      }

      uploadingFile.percent = e.percent;
      this.onChange({
        event: e,
        file: uploadingFile,
        fileList: [...this.fileList],
      });
    }

    onSuccess(response, file, xhr) {
      try {
        if (typeof response === 'string') {
          response = JSON.parse(response);
        }
      } catch (e) {
        /* do nothing */
      }

      const uploadFile = getFileFromList(file, this.fileList);
      if (!uploadFile) {
        return
      }

      uploadFile.response = response;
      uploadFile.status = 'done';
      uploadFile.xhr = xhr;

      this.onChange({
        file: uploadFile,
        fileList: [...this.fileList],
      });
    }

    onError(error, response, file) {
      const uploadFile = getFileFromList(file, this.fileList);
      if (!uploadFile) {
        return
      }

      uploadFile.error = error;
      uploadFile.status = 'error';
      uploadFile.response = response;

      this.onChange({
        file: uploadFile,
        fileList: [...this.fileList],
      });
    }

    handleRemove({ sender, file }) {
      const {
        onRemove: { action },
      } = this.props;
      // removing
      file.status = 'removing';
      this.fileList = this.fileList.map((f) =>
        f.uuid === file.uuid ? { ...f, status: 'removing' } : f,
      );

      this.onChange({
        file,
        fileList: this.fileList,
      });

      Promise.resolve(isFunction$1(action) ? action({ sender, file }) : action).then((ret) => {
        if (ret === false) {
          return
        }

        const remainsFileList = removeFile(file, this.fileList);
        if (remainsFileList) {
          file.status = 'removed';
          this.fileList = remainsFileList;
          if (this.reqs[file.uuid]) {
            this.reqs[file.uuid].abort();
            delete this.reqs[file.uuid];
          }
        }

        this.onChange({
          file,
          fileList: remainsFileList,
        });
      });
    }

    _handleUpdate({ file }) {
      if (file && file.uuid) {
        this._updateFile = file.uuid;
      }
      this._changeUploadMode();
      this._handleClick(file);
    }

    _changeUploadMode() {
      if (this.inputFile && this.inputFile.element) {
        if (this._updateFile) {
          this.inputFile.element.multiple = false;
        } else {
          this.inputFile.element.multiple = this.props.multiple;
        }
      }
    }

    _handleClick() {
      if (this.inputFile) {
        this.inputFile.element.click();
      }
    }

    _onkeyDown(e) {
      if (e.eky === 'Enter') {
        this._handleClick();
      }
    }
  }

  Component.register(Uploader);

  class VirtualList extends Component {
    constructor(props, ...mixins) {
      const defaults = {
        listData: [], // ???????????????
        height: '400', // ????????????
        size: 30, // ??????????????????????????????
        bufferScale: 1, // ???????????????
      };
      super(Component.extendProps(defaults, props), ...mixins);
    }

    _created() {
      // ????????????
      this.start = 0;
      // ????????????
      this.end = 0;
      // ?????????????????????????????? ????????????????????????????????????
      this.positions = [
        // {
        //   top:0,
        //   bottom:100,
        //   height:100
        // }
      ];
      // ???????????????arry
      this.itemsRefs = [];
      // ??????????????????
      this.listData = this.props.listData;
      // ??????????????????
      this.screenHeight = this.props.height;
      // ????????????
      this.estimatedItemSize = this.props.size;
      // ???????????????
      this.bufferScale = this.props.bufferScale;
      this.initPositions();
    }

    _config() {
      const listArry = this.getList(this.visibleData());
      const height = this.positions[this.positions.length - 1].bottom;
      this.setProps({
        children: {
          ref: (c) => {
            this.listRef = c;
          },
          classes: {
            'nom-virtual-list-container': true,
          },
          attrs: {
            style: {
              height: `${this.screenHeight}px`,
            },
          },
          children: [
            {
              ref: (c) => {
                this.phantomRef = c;
              },
              classes: {
                'nom-virtual-list-phantom': true,
              },
              attrs: {
                style: {
                  height: `${height}px`,
                },
              },
              children: '',
            },
            {
              ref: (c) => {
                this.contentRef = c;
              },
              classes: {
                'nom-virtual-list-content': true,
              },
              children: listArry,
            },
          ],
        },
      });
    }

    _rendered() {
      this.listRef.element.addEventListener('scroll', () => {
        this.scrollEvent();
      });
      // let isScroll = false
      // this.listRef.element.addEventListener('scroll', () => {
      //   if (isScroll) return
      //   isScroll = true
      //   this.scrollEvent()
      //   setTimeout(() => {
      //     isScroll = false
      //   }, 500)
      // })
    }

    getList(arry) {
      const _that = this;
      this.itemsRefs = [];
      return arry.map(function (items) {
        return {
          ref: (c) => {
            if (c) _that.itemsRefs.push(c);
          },
          classes: {
            'nom-virtual-list-item': true,
          },
          attrs: {
            'data-key': items._index,
          },
          children: items.item,
        }
      })
    }

    // ????????? ????????????????????????????????????????????????????????????
    updated() {
      if (!this.itemsRefs || !this.itemsRefs.length) {
        return
      }
      // ??????????????????????????????????????????????????????
      this.updateItemsSize();
      // ?????????????????????
      const height = this.positions[this.positions.length - 1].bottom;
      this.phantomRef.update({
        attrs: {
          style: {
            height: `${height}px`,
          },
        },
      });

      this.contentRef.update({
        attrs: {
          style: {
            transform: `translate3d(0,${this.setStartOffset()}px,0)`,
          },
        },
        children: this.getList(this.visibleData()),
      });
    }

    // ??????????????? estimatedItemSize??? positions???????????????
    initPositions() {
      this.positions = this.listData.map((d, index) => ({
        index,
        height: this.estimatedItemSize,
        top: index * this.estimatedItemSize,
        bottom: (index + 1) * this.estimatedItemSize,
      }));
    }

    // ????????????????????????
    getStartIndex(scrollTop = 0) {
      // ???????????????
      return this.binarySearch(this.positions, scrollTop)
    }

    binarySearch(list, value) {
      let start = 0;
      let end = list.length - 1;
      let tempIndex = null;

      while (start <= end) {
        const midIndex = parseInt((start + end) / 2, 10);
        const midValue = list[midIndex].bottom;
        if (midValue === value) {
          return midIndex + 1
        }
        if (midValue < value) {
          start = midIndex + 1;
        } else if (midValue > value) {
          if (tempIndex === null || tempIndex > midIndex) {
            tempIndex = midIndex;
          }
          end -= 1;
        }
      }
      return tempIndex
    }

    // ??????????????????????????????
    updateItemsSize() {
      const nodes = this.itemsRefs;
      nodes.forEach((node) => {
        if (!node.rendered) return
        const rect = node.element.getBoundingClientRect();
        const height = rect.height;
        const index = +node.element.dataset.key.slice(1);
        const oldHeight = this.positions[index].height;
        const dValue = oldHeight - height;
        // ????????????
        if (dValue) {
          this.positions[index].bottom -= dValue;
          this.positions[index].height = height;
          for (let k = index + 1; k < this.positions.length; k++) {
            this.positions[k].top = this.positions[k - 1].bottom;
            this.positions[k].bottom -= dValue;
          }
        }
      });
    }

    // ????????????????????????
    setStartOffset() {
      let startOffset;
      if (this.start >= 1) {
        const size =
          this.positions[this.start].top -
          (this.positions[this.start - this.aboveCount()]
            ? this.positions[this.start - this.aboveCount()].top
            : 0);
        startOffset = this.positions[this.start - 1].bottom - size;
      } else {
        startOffset = 0;
      }
      return startOffset
    }

    // ????????????
    scrollEvent() {
      // ??????????????????
      const scrollTop = this.listRef.element.scrollTop;
      // ?????????????????????
      this.start = this.getStartIndex(scrollTop);
      // ?????????????????????
      this.end = this.start + this.visibleCount();
      // ????????????
      this.updated();
    }

    _listData() {
      return this.listData.map((item, index) => {
        return {
          _index: `_${index}`,
          item,
        }
      })
    }

    // ????????????????????????
    visibleCount() {
      return Math.ceil(this.screenHeight / this.estimatedItemSize)
    }

    // ???????????????????????????
    aboveCount() {
      return Math.min(this.start, this.bufferScale * this.visibleCount())
    }

    // ???????????????????????????
    belowCount() {
      return Math.min(this.listData.length - this.end, this.bufferScale * this.visibleCount())
    }

    // ??????????????????????????????
    visibleData() {
      const start = this.start - this.aboveCount();
      const end = this.end + this.belowCount();
      return this._listData().slice(start, end)
    }

    // ????????????
    debounce(func, wait) {
      let timer = null;
      return function () {
        const context = this;
        const args = arguments;
        timer && clearTimeout(timer);
        timer = setTimeout(function () {
          func.apply(context, args);
        }, wait);
      }
    }
  }

  Component.register(VirtualList);

  /**
   * nomui???????????????
   * @param {install:(nomui)=>{}} plugin
   * @description plugin??????????????????install??????
   */
  function use(plugin) {
    plugin.install(this);
  }

  exports.Alert = Alert;
  exports.Anchor = Anchor;
  exports.AnchorContent = AnchorContent;
  exports.App = App;
  exports.AutoComplete = AutoComplete;
  exports.Avatar = Avatar;
  exports.AvatarGroup = AvatarGroup;
  exports.BackTop = BackTop;
  exports.Badge = Badge;
  exports.Button = Button;
  exports.Caption = Caption;
  exports.Carousel = Carousel;
  exports.Cascader = Cascader;
  exports.Checkbox = Checkbox;
  exports.CheckboxList = CheckboxList;
  exports.CheckboxTree = CheckboxTree;
  exports.Collapse = Collapse;
  exports.Cols = Cols;
  exports.Component = Component;
  exports.Confirm = Confirm;
  exports.Container = Container;
  exports.Countdown = Countdown;
  exports.DatePicker = DatePicker;
  exports.DateRangePicker = DateRangePicker;
  exports.Divider = Divider;
  exports.Drawer = Drawer;
  exports.Dropdown = Dropdown;
  exports.Ellipsis = Ellipsis;
  exports.Empty = Empty;
  exports.Field = Field;
  exports.Form = Form;
  exports.Grid = Grid;
  exports.Group = Group;
  exports.GroupList = GroupList;
  exports.Icon = Icon;
  exports.Layer = Layer;
  exports.Layout = Layout;
  exports.List = List;
  exports.ListItemMixin = ListItemMixin;
  exports.Loading = Loading;
  exports.MaskInfo = MaskInfo;
  exports.Menu = Menu;
  exports.Message = Message;
  exports.Modal = Modal;
  exports.MultilineTextbox = MultilineTextbox;
  exports.Navbar = Navbar;
  exports.Notification = Notification;
  exports.NumberSpinner = NumberSpinner;
  exports.Numberbox = Numberbox;
  exports.Pager = Pager;
  exports.Panel = Panel;
  exports.PartialDatePicker = PartialDatePicker;
  exports.PartialDateRangePicker = PartialDateRangePicker;
  exports.Password = Password;
  exports.Popconfirm = Popconfirm;
  exports.Popup = Popup;
  exports.Progress = Progress;
  exports.RadioList = RadioList;
  exports.Result = Result;
  exports.Router = Router;
  exports.Rows = Rows;
  exports.Scrollbar = Scrollbar;
  exports.Select = Select;
  exports.SlideCaptcha = SlideCaptcha;
  exports.Slider = Slider;
  exports.Spinner = Spinner;
  exports.StaticText = StaticText;
  exports.Statistic = Statistic;
  exports.Steps = Steps;
  exports.Switch = Switch;
  exports.Table = Table;
  exports.Tabs = Tabs;
  exports.Tag = Tag;
  exports.Textbox = Textbox;
  exports.TimePicker = TimePicker;
  exports.TimeRangePicker = TimeRangePicker;
  exports.Timeline = Timeline;
  exports.Toolbar = Toolbar;
  exports.Tooltip = Tooltip;
  exports.Tree = Tree;
  exports.TreeSelect = TreeSelect;
  exports.Uploader = Uploader;
  exports.VirtualList = VirtualList;
  exports.n = n;
  exports.use = use;
  exports.utils = index;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
