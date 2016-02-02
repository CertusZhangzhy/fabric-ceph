!function() {
    (function() {
        function baseIndexOf(array, value, fromIndex) {
            for (var index = (fromIndex || 0) - 1, length = array ? array.length : 0; ++index < length; ) if (array[index] === value) return index;
            return -1;
        }
        function cacheIndexOf(cache, value) {
            var type = typeof value;
            if (cache = cache.cache, "boolean" == type || null == value) return cache[value] ? 0 : -1;
            "number" != type && "string" != type && (type = "object");
            var key = "number" == type ? value : keyPrefix + value;
            return cache = (cache = cache[type]) && cache[key], "object" == type ? cache && baseIndexOf(cache, value) > -1 ? 0 : -1 : cache ? 0 : -1;
        }
        function cachePush(value) {
            var cache = this.cache, type = typeof value;
            if ("boolean" == type || null == value) cache[value] = !0; else {
                "number" != type && "string" != type && (type = "object");
                var key = "number" == type ? value : keyPrefix + value, typeCache = cache[type] || (cache[type] = {});
                "object" == type ? (typeCache[key] || (typeCache[key] = [])).push(value) : typeCache[key] = !0;
            }
        }
        function charAtCallback(value) {
            return value.charCodeAt(0);
        }
        function compareAscending(a, b) {
            for (var ac = a.criteria, bc = b.criteria, index = -1, length = ac.length; ++index < length; ) {
                var value = ac[index], other = bc[index];
                if (value !== other) {
                    if (value > other || "undefined" == typeof value) return 1;
                    if (other > value || "undefined" == typeof other) return -1;
                }
            }
            return a.index - b.index;
        }
        function createCache(array) {
            var index = -1, length = array.length, first = array[0], mid = array[length / 2 | 0], last = array[length - 1];
            if (first && "object" == typeof first && mid && "object" == typeof mid && last && "object" == typeof last) return !1;
            var cache = getObject();
            cache["false"] = cache["null"] = cache["true"] = cache.undefined = !1;
            var result = getObject();
            for (result.array = array, result.cache = cache, result.push = cachePush; ++index < length; ) result.push(array[index]);
            return result;
        }
        function escapeStringChar(match) {
            return "\\" + stringEscapes[match];
        }
        function getArray() {
            return arrayPool.pop() || [];
        }
        function getObject() {
            return objectPool.pop() || {
                array: null,
                cache: null,
                criteria: null,
                "false": !1,
                index: 0,
                "null": !1,
                number: null,
                object: null,
                push: null,
                string: null,
                "true": !1,
                undefined: !1,
                value: null
            };
        }
        function releaseArray(array) {
            array.length = 0, arrayPool.length < maxPoolSize && arrayPool.push(array);
        }
        function releaseObject(object) {
            var cache = object.cache;
            cache && releaseObject(cache), object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null, 
            objectPool.length < maxPoolSize && objectPool.push(object);
        }
        function slice(array, start, end) {
            start || (start = 0), "undefined" == typeof end && (end = array ? array.length : 0);
            for (var index = -1, length = end - start || 0, result = Array(0 > length ? 0 : length); ++index < length; ) result[index] = array[start + index];
            return result;
        }
        function runInContext(context) {
            function lodash(value) {
                return value && "object" == typeof value && !isArray(value) && hasOwnProperty.call(value, "__wrapped__") ? value : new lodashWrapper(value);
            }
            function lodashWrapper(value, chainAll) {
                this.__chain__ = !!chainAll, this.__wrapped__ = value;
            }
            function baseBind(bindData) {
                function bound() {
                    if (partialArgs) {
                        var args = slice(partialArgs);
                        push.apply(args, arguments);
                    }
                    if (this instanceof bound) {
                        var thisBinding = baseCreate(func.prototype), result = func.apply(thisBinding, args || arguments);
                        return isObject(result) ? result : thisBinding;
                    }
                    return func.apply(thisArg, args || arguments);
                }
                var func = bindData[0], partialArgs = bindData[2], thisArg = bindData[4];
                return setBindData(bound, bindData), bound;
            }
            function baseClone(value, isDeep, callback, stackA, stackB) {
                if (callback) {
                    var result = callback(value);
                    if ("undefined" != typeof result) return result;
                }
                var isObj = isObject(value);
                if (!isObj) return value;
                var className = toString.call(value);
                if (!cloneableClasses[className]) return value;
                var ctor = ctorByClass[className];
                switch (className) {
                  case boolClass:
                  case dateClass:
                    return new ctor(+value);

                  case numberClass:
                  case stringClass:
                    return new ctor(value);

                  case regexpClass:
                    return result = ctor(value.source, reFlags.exec(value)), result.lastIndex = value.lastIndex, 
                    result;
                }
                var isArr = isArray(value);
                if (isDeep) {
                    var initedStack = !stackA;
                    stackA || (stackA = getArray()), stackB || (stackB = getArray());
                    for (var length = stackA.length; length--; ) if (stackA[length] == value) return stackB[length];
                    result = isArr ? ctor(value.length) : {};
                } else result = isArr ? slice(value) : assign({}, value);
                return isArr && (hasOwnProperty.call(value, "index") && (result.index = value.index), 
                hasOwnProperty.call(value, "input") && (result.input = value.input)), isDeep ? (stackA.push(value), 
                stackB.push(result), (isArr ? forEach : forOwn)(value, function(objValue, key) {
                    result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
                }), initedStack && (releaseArray(stackA), releaseArray(stackB)), result) : result;
            }
            function baseCreate(prototype, properties) {
                return isObject(prototype) ? nativeCreate(prototype) : {};
            }
            function baseCreateCallback(func, thisArg, argCount) {
                if ("function" != typeof func) return identity;
                if ("undefined" == typeof thisArg || !("prototype" in func)) return func;
                var bindData = func.__bindData__;
                if ("undefined" == typeof bindData && (support.funcNames && (bindData = !func.name), 
                bindData = bindData || !support.funcDecomp, !bindData)) {
                    var source = fnToString.call(func);
                    support.funcNames || (bindData = !reFuncName.test(source)), bindData || (bindData = reThis.test(source), 
                    setBindData(func, bindData));
                }
                if (bindData === !1 || bindData !== !0 && 1 & bindData[1]) return func;
                switch (argCount) {
                  case 1:
                    return function(value) {
                        return func.call(thisArg, value);
                    };

                  case 2:
                    return function(a, b) {
                        return func.call(thisArg, a, b);
                    };

                  case 3:
                    return function(value, index, collection) {
                        return func.call(thisArg, value, index, collection);
                    };

                  case 4:
                    return function(accumulator, value, index, collection) {
                        return func.call(thisArg, accumulator, value, index, collection);
                    };
                }
                return bind(func, thisArg);
            }
            function baseCreateWrapper(bindData) {
                function bound() {
                    var thisBinding = isBind ? thisArg : this;
                    if (partialArgs) {
                        var args = slice(partialArgs);
                        push.apply(args, arguments);
                    }
                    if ((partialRightArgs || isCurry) && (args || (args = slice(arguments)), partialRightArgs && push.apply(args, partialRightArgs), 
                    isCurry && args.length < arity)) return bitmask |= 16, baseCreateWrapper([ func, isCurryBound ? bitmask : -4 & bitmask, args, null, thisArg, arity ]);
                    if (args || (args = arguments), isBindKey && (func = thisBinding[key]), this instanceof bound) {
                        thisBinding = baseCreate(func.prototype);
                        var result = func.apply(thisBinding, args);
                        return isObject(result) ? result : thisBinding;
                    }
                    return func.apply(thisBinding, args);
                }
                var func = bindData[0], bitmask = bindData[1], partialArgs = bindData[2], partialRightArgs = bindData[3], thisArg = bindData[4], arity = bindData[5], isBind = 1 & bitmask, isBindKey = 2 & bitmask, isCurry = 4 & bitmask, isCurryBound = 8 & bitmask, key = func;
                return setBindData(bound, bindData), bound;
            }
            function baseDifference(array, values) {
                var index = -1, indexOf = getIndexOf(), length = array ? array.length : 0, isLarge = length >= largeArraySize && indexOf === baseIndexOf, result = [];
                if (isLarge) {
                    var cache = createCache(values);
                    cache ? (indexOf = cacheIndexOf, values = cache) : isLarge = !1;
                }
                for (;++index < length; ) {
                    var value = array[index];
                    indexOf(values, value) < 0 && result.push(value);
                }
                return isLarge && releaseObject(values), result;
            }
            function baseFlatten(array, isShallow, isStrict, fromIndex) {
                for (var index = (fromIndex || 0) - 1, length = array ? array.length : 0, result = []; ++index < length; ) {
                    var value = array[index];
                    if (value && "object" == typeof value && "number" == typeof value.length && (isArray(value) || isArguments(value))) {
                        isShallow || (value = baseFlatten(value, isShallow, isStrict));
                        var valIndex = -1, valLength = value.length, resIndex = result.length;
                        for (result.length += valLength; ++valIndex < valLength; ) result[resIndex++] = value[valIndex];
                    } else isStrict || result.push(value);
                }
                return result;
            }
            function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
                if (callback) {
                    var result = callback(a, b);
                    if ("undefined" != typeof result) return !!result;
                }
                if (a === b) return 0 !== a || 1 / a == 1 / b;
                var type = typeof a, otherType = typeof b;
                if (!(a !== a || a && objectTypes[type] || b && objectTypes[otherType])) return !1;
                if (null == a || null == b) return a === b;
                var className = toString.call(a), otherClass = toString.call(b);
                if (className == argsClass && (className = objectClass), otherClass == argsClass && (otherClass = objectClass), 
                className != otherClass) return !1;
                switch (className) {
                  case boolClass:
                  case dateClass:
                    return +a == +b;

                  case numberClass:
                    return a != +a ? b != +b : 0 == a ? 1 / a == 1 / b : a == +b;

                  case regexpClass:
                  case stringClass:
                    return a == String(b);
                }
                var isArr = className == arrayClass;
                if (!isArr) {
                    var aWrapped = hasOwnProperty.call(a, "__wrapped__"), bWrapped = hasOwnProperty.call(b, "__wrapped__");
                    if (aWrapped || bWrapped) return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
                    if (className != objectClass) return !1;
                    var ctorA = a.constructor, ctorB = b.constructor;
                    if (ctorA != ctorB && !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) && "constructor" in a && "constructor" in b) return !1;
                }
                var initedStack = !stackA;
                stackA || (stackA = getArray()), stackB || (stackB = getArray());
                for (var length = stackA.length; length--; ) if (stackA[length] == a) return stackB[length] == b;
                var size = 0;
                if (result = !0, stackA.push(a), stackB.push(b), isArr) {
                    if (length = a.length, size = b.length, result = size == length, result || isWhere) for (;size--; ) {
                        var index = length, value = b[size];
                        if (isWhere) for (;index-- && !(result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB)); ) ; else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) break;
                    }
                } else forIn(b, function(value, key, b) {
                    return hasOwnProperty.call(b, key) ? (size++, result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB)) : void 0;
                }), result && !isWhere && forIn(a, function(value, key, a) {
                    return hasOwnProperty.call(a, key) ? result = --size > -1 : void 0;
                });
                return stackA.pop(), stackB.pop(), initedStack && (releaseArray(stackA), releaseArray(stackB)), 
                result;
            }
            function baseMerge(object, source, callback, stackA, stackB) {
                (isArray(source) ? forEach : forOwn)(source, function(source, key) {
                    var found, isArr, result = source, value = object[key];
                    if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
                        for (var stackLength = stackA.length; stackLength--; ) if (found = stackA[stackLength] == source) {
                            value = stackB[stackLength];
                            break;
                        }
                        if (!found) {
                            var isShallow;
                            callback && (result = callback(value, source), (isShallow = "undefined" != typeof result) && (value = result)), 
                            isShallow || (value = isArr ? isArray(value) ? value : [] : isPlainObject(value) ? value : {}), 
                            stackA.push(source), stackB.push(value), isShallow || baseMerge(value, source, callback, stackA, stackB);
                        }
                    } else callback && (result = callback(value, source), "undefined" == typeof result && (result = source)), 
                    "undefined" != typeof result && (value = result);
                    object[key] = value;
                });
            }
            function baseRandom(min, max) {
                return min + floor(nativeRandom() * (max - min + 1));
            }
            function baseUniq(array, isSorted, callback) {
                var index = -1, indexOf = getIndexOf(), length = array ? array.length : 0, result = [], isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf, seen = callback || isLarge ? getArray() : result;
                if (isLarge) {
                    var cache = createCache(seen);
                    indexOf = cacheIndexOf, seen = cache;
                }
                for (;++index < length; ) {
                    var value = array[index], computed = callback ? callback(value, index, array) : value;
                    (isSorted ? !index || seen[seen.length - 1] !== computed : indexOf(seen, computed) < 0) && ((callback || isLarge) && seen.push(computed), 
                    result.push(value));
                }
                return isLarge ? (releaseArray(seen.array), releaseObject(seen)) : callback && releaseArray(seen), 
                result;
            }
            function createAggregator(setter) {
                return function(collection, callback, thisArg) {
                    var result = {};
                    callback = lodash.createCallback(callback, thisArg, 3);
                    var index = -1, length = collection ? collection.length : 0;
                    if ("number" == typeof length) for (;++index < length; ) {
                        var value = collection[index];
                        setter(result, value, callback(value, index, collection), collection);
                    } else forOwn(collection, function(value, key, collection) {
                        setter(result, value, callback(value, key, collection), collection);
                    });
                    return result;
                };
            }
            function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
                var isBind = 1 & bitmask, isBindKey = 2 & bitmask, isCurry = 4 & bitmask, isPartial = 16 & bitmask, isPartialRight = 32 & bitmask;
                if (!isBindKey && !isFunction(func)) throw new TypeError();
                isPartial && !partialArgs.length && (bitmask &= -17, isPartial = partialArgs = !1), 
                isPartialRight && !partialRightArgs.length && (bitmask &= -33, isPartialRight = partialRightArgs = !1);
                var bindData = func && func.__bindData__;
                if (bindData && bindData !== !0) return bindData = slice(bindData), bindData[2] && (bindData[2] = slice(bindData[2])), 
                bindData[3] && (bindData[3] = slice(bindData[3])), !isBind || 1 & bindData[1] || (bindData[4] = thisArg), 
                !isBind && 1 & bindData[1] && (bitmask |= 8), !isCurry || 4 & bindData[1] || (bindData[5] = arity), 
                isPartial && push.apply(bindData[2] || (bindData[2] = []), partialArgs), isPartialRight && unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs), 
                bindData[1] |= bitmask, createWrapper.apply(null, bindData);
                var creater = 1 == bitmask || 17 === bitmask ? baseBind : baseCreateWrapper;
                return creater([ func, bitmask, partialArgs, partialRightArgs, thisArg, arity ]);
            }
            function escapeHtmlChar(match) {
                return htmlEscapes[match];
            }
            function getIndexOf() {
                var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
                return result;
            }
            function isNative(value) {
                return "function" == typeof value && reNative.test(value);
            }
            function shimIsPlainObject(value) {
                var ctor, result;
                return value && toString.call(value) == objectClass && (ctor = value.constructor, 
                !isFunction(ctor) || ctor instanceof ctor) ? (forIn(value, function(value, key) {
                    result = key;
                }), "undefined" == typeof result || hasOwnProperty.call(value, result)) : !1;
            }
            function unescapeHtmlChar(match) {
                return htmlUnescapes[match];
            }
            function isArguments(value) {
                return value && "object" == typeof value && "number" == typeof value.length && toString.call(value) == argsClass || !1;
            }
            function clone(value, isDeep, callback, thisArg) {
                return "boolean" != typeof isDeep && null != isDeep && (thisArg = callback, callback = isDeep, 
                isDeep = !1), baseClone(value, isDeep, "function" == typeof callback && baseCreateCallback(callback, thisArg, 1));
            }
            function cloneDeep(value, callback, thisArg) {
                return baseClone(value, !0, "function" == typeof callback && baseCreateCallback(callback, thisArg, 1));
            }
            function create(prototype, properties) {
                var result = baseCreate(prototype);
                return properties ? assign(result, properties) : result;
            }
            function findKey(object, callback, thisArg) {
                var result;
                return callback = lodash.createCallback(callback, thisArg, 3), forOwn(object, function(value, key, object) {
                    return callback(value, key, object) ? (result = key, !1) : void 0;
                }), result;
            }
            function findLastKey(object, callback, thisArg) {
                var result;
                return callback = lodash.createCallback(callback, thisArg, 3), forOwnRight(object, function(value, key, object) {
                    return callback(value, key, object) ? (result = key, !1) : void 0;
                }), result;
            }
            function forInRight(object, callback, thisArg) {
                var pairs = [];
                forIn(object, function(value, key) {
                    pairs.push(key, value);
                });
                var length = pairs.length;
                for (callback = baseCreateCallback(callback, thisArg, 3); length-- && callback(pairs[length--], pairs[length], object) !== !1; ) ;
                return object;
            }
            function forOwnRight(object, callback, thisArg) {
                var props = keys(object), length = props.length;
                for (callback = baseCreateCallback(callback, thisArg, 3); length--; ) {
                    var key = props[length];
                    if (callback(object[key], key, object) === !1) break;
                }
                return object;
            }
            function functions(object) {
                var result = [];
                return forIn(object, function(value, key) {
                    isFunction(value) && result.push(key);
                }), result.sort();
            }
            function has(object, key) {
                return object ? hasOwnProperty.call(object, key) : !1;
            }
            function invert(object) {
                for (var index = -1, props = keys(object), length = props.length, result = {}; ++index < length; ) {
                    var key = props[index];
                    result[object[key]] = key;
                }
                return result;
            }
            function isBoolean(value) {
                return value === !0 || value === !1 || value && "object" == typeof value && toString.call(value) == boolClass || !1;
            }
            function isDate(value) {
                return value && "object" == typeof value && toString.call(value) == dateClass || !1;
            }
            function isElement(value) {
                return value && 1 === value.nodeType || !1;
            }
            function isEmpty(value) {
                var result = !0;
                if (!value) return result;
                var className = toString.call(value), length = value.length;
                return className == arrayClass || className == stringClass || className == argsClass || className == objectClass && "number" == typeof length && isFunction(value.splice) ? !length : (forOwn(value, function() {
                    return result = !1;
                }), result);
            }
            function isEqual(a, b, callback, thisArg) {
                return baseIsEqual(a, b, "function" == typeof callback && baseCreateCallback(callback, thisArg, 2));
            }
            function isFinite(value) {
                return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
            }
            function isFunction(value) {
                return "function" == typeof value;
            }
            function isObject(value) {
                return !(!value || !objectTypes[typeof value]);
            }
            function isNaN(value) {
                return isNumber(value) && value != +value;
            }
            function isNull(value) {
                return null === value;
            }
            function isNumber(value) {
                return "number" == typeof value || value && "object" == typeof value && toString.call(value) == numberClass || !1;
            }
            function isRegExp(value) {
                return value && "object" == typeof value && toString.call(value) == regexpClass || !1;
            }
            function isString(value) {
                return "string" == typeof value || value && "object" == typeof value && toString.call(value) == stringClass || !1;
            }
            function isUndefined(value) {
                return "undefined" == typeof value;
            }
            function mapValues(object, callback, thisArg) {
                var result = {};
                return callback = lodash.createCallback(callback, thisArg, 3), forOwn(object, function(value, key, object) {
                    result[key] = callback(value, key, object);
                }), result;
            }
            function merge(object) {
                var args = arguments, length = 2;
                if (!isObject(object)) return object;
                if ("number" != typeof args[2] && (length = args.length), length > 3 && "function" == typeof args[length - 2]) var callback = baseCreateCallback(args[--length - 1], args[length--], 2); else length > 2 && "function" == typeof args[length - 1] && (callback = args[--length]);
                for (var sources = slice(arguments, 1, length), index = -1, stackA = getArray(), stackB = getArray(); ++index < length; ) baseMerge(object, sources[index], callback, stackA, stackB);
                return releaseArray(stackA), releaseArray(stackB), object;
            }
            function omit(object, callback, thisArg) {
                var result = {};
                if ("function" != typeof callback) {
                    var props = [];
                    forIn(object, function(value, key) {
                        props.push(key);
                    }), props = baseDifference(props, baseFlatten(arguments, !0, !1, 1));
                    for (var index = -1, length = props.length; ++index < length; ) {
                        var key = props[index];
                        result[key] = object[key];
                    }
                } else callback = lodash.createCallback(callback, thisArg, 3), forIn(object, function(value, key, object) {
                    callback(value, key, object) || (result[key] = value);
                });
                return result;
            }
            function pairs(object) {
                for (var index = -1, props = keys(object), length = props.length, result = Array(length); ++index < length; ) {
                    var key = props[index];
                    result[index] = [ key, object[key] ];
                }
                return result;
            }
            function pick(object, callback, thisArg) {
                var result = {};
                if ("function" != typeof callback) for (var index = -1, props = baseFlatten(arguments, !0, !1, 1), length = isObject(object) ? props.length : 0; ++index < length; ) {
                    var key = props[index];
                    key in object && (result[key] = object[key]);
                } else callback = lodash.createCallback(callback, thisArg, 3), forIn(object, function(value, key, object) {
                    callback(value, key, object) && (result[key] = value);
                });
                return result;
            }
            function transform(object, callback, accumulator, thisArg) {
                var isArr = isArray(object);
                if (null == accumulator) if (isArr) accumulator = []; else {
                    var ctor = object && object.constructor, proto = ctor && ctor.prototype;
                    accumulator = baseCreate(proto);
                }
                return callback && (callback = lodash.createCallback(callback, thisArg, 4), (isArr ? forEach : forOwn)(object, function(value, index, object) {
                    return callback(accumulator, value, index, object);
                })), accumulator;
            }
            function values(object) {
                for (var index = -1, props = keys(object), length = props.length, result = Array(length); ++index < length; ) result[index] = object[props[index]];
                return result;
            }
            function at(collection) {
                for (var args = arguments, index = -1, props = baseFlatten(args, !0, !1, 1), length = args[2] && args[2][args[1]] === collection ? 1 : props.length, result = Array(length); ++index < length; ) result[index] = collection[props[index]];
                return result;
            }
            function contains(collection, target, fromIndex) {
                var index = -1, indexOf = getIndexOf(), length = collection ? collection.length : 0, result = !1;
                return fromIndex = (0 > fromIndex ? nativeMax(0, length + fromIndex) : fromIndex) || 0, 
                isArray(collection) ? result = indexOf(collection, target, fromIndex) > -1 : "number" == typeof length ? result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1 : forOwn(collection, function(value) {
                    return ++index >= fromIndex ? !(result = value === target) : void 0;
                }), result;
            }
            function every(collection, callback, thisArg) {
                var result = !0;
                callback = lodash.createCallback(callback, thisArg, 3);
                var index = -1, length = collection ? collection.length : 0;
                if ("number" == typeof length) for (;++index < length && (result = !!callback(collection[index], index, collection)); ) ; else forOwn(collection, function(value, index, collection) {
                    return result = !!callback(value, index, collection);
                });
                return result;
            }
            function filter(collection, callback, thisArg) {
                var result = [];
                callback = lodash.createCallback(callback, thisArg, 3);
                var index = -1, length = collection ? collection.length : 0;
                if ("number" == typeof length) for (;++index < length; ) {
                    var value = collection[index];
                    callback(value, index, collection) && result.push(value);
                } else forOwn(collection, function(value, index, collection) {
                    callback(value, index, collection) && result.push(value);
                });
                return result;
            }
            function find(collection, callback, thisArg) {
                callback = lodash.createCallback(callback, thisArg, 3);
                var index = -1, length = collection ? collection.length : 0;
                if ("number" != typeof length) {
                    var result;
                    return forOwn(collection, function(value, index, collection) {
                        return callback(value, index, collection) ? (result = value, !1) : void 0;
                    }), result;
                }
                for (;++index < length; ) {
                    var value = collection[index];
                    if (callback(value, index, collection)) return value;
                }
            }
            function findLast(collection, callback, thisArg) {
                var result;
                return callback = lodash.createCallback(callback, thisArg, 3), forEachRight(collection, function(value, index, collection) {
                    return callback(value, index, collection) ? (result = value, !1) : void 0;
                }), result;
            }
            function forEach(collection, callback, thisArg) {
                var index = -1, length = collection ? collection.length : 0;
                if (callback = callback && "undefined" == typeof thisArg ? callback : baseCreateCallback(callback, thisArg, 3), 
                "number" == typeof length) for (;++index < length && callback(collection[index], index, collection) !== !1; ) ; else forOwn(collection, callback);
                return collection;
            }
            function forEachRight(collection, callback, thisArg) {
                var length = collection ? collection.length : 0;
                if (callback = callback && "undefined" == typeof thisArg ? callback : baseCreateCallback(callback, thisArg, 3), 
                "number" == typeof length) for (;length-- && callback(collection[length], length, collection) !== !1; ) ; else {
                    var props = keys(collection);
                    length = props.length, forOwn(collection, function(value, key, collection) {
                        return key = props ? props[--length] : --length, callback(collection[key], key, collection);
                    });
                }
                return collection;
            }
            function invoke(collection, methodName) {
                var args = slice(arguments, 2), index = -1, isFunc = "function" == typeof methodName, length = collection ? collection.length : 0, result = Array("number" == typeof length ? length : 0);
                return forEach(collection, function(value) {
                    result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
                }), result;
            }
            function map(collection, callback, thisArg) {
                var index = -1, length = collection ? collection.length : 0;
                if (callback = lodash.createCallback(callback, thisArg, 3), "number" == typeof length) for (var result = Array(length); ++index < length; ) result[index] = callback(collection[index], index, collection); else result = [], 
                forOwn(collection, function(value, key, collection) {
                    result[++index] = callback(value, key, collection);
                });
                return result;
            }
            function max(collection, callback, thisArg) {
                var computed = -(1 / 0), result = computed;
                if ("function" != typeof callback && thisArg && thisArg[callback] === collection && (callback = null), 
                null == callback && isArray(collection)) for (var index = -1, length = collection.length; ++index < length; ) {
                    var value = collection[index];
                    value > result && (result = value);
                } else callback = null == callback && isString(collection) ? charAtCallback : lodash.createCallback(callback, thisArg, 3), 
                forEach(collection, function(value, index, collection) {
                    var current = callback(value, index, collection);
                    current > computed && (computed = current, result = value);
                });
                return result;
            }
            function min(collection, callback, thisArg) {
                var computed = 1 / 0, result = computed;
                if ("function" != typeof callback && thisArg && thisArg[callback] === collection && (callback = null), 
                null == callback && isArray(collection)) for (var index = -1, length = collection.length; ++index < length; ) {
                    var value = collection[index];
                    result > value && (result = value);
                } else callback = null == callback && isString(collection) ? charAtCallback : lodash.createCallback(callback, thisArg, 3), 
                forEach(collection, function(value, index, collection) {
                    var current = callback(value, index, collection);
                    computed > current && (computed = current, result = value);
                });
                return result;
            }
            function reduce(collection, callback, accumulator, thisArg) {
                if (!collection) return accumulator;
                var noaccum = arguments.length < 3;
                callback = lodash.createCallback(callback, thisArg, 4);
                var index = -1, length = collection.length;
                if ("number" == typeof length) for (noaccum && (accumulator = collection[++index]); ++index < length; ) accumulator = callback(accumulator, collection[index], index, collection); else forOwn(collection, function(value, index, collection) {
                    accumulator = noaccum ? (noaccum = !1, value) : callback(accumulator, value, index, collection);
                });
                return accumulator;
            }
            function reduceRight(collection, callback, accumulator, thisArg) {
                var noaccum = arguments.length < 3;
                return callback = lodash.createCallback(callback, thisArg, 4), forEachRight(collection, function(value, index, collection) {
                    accumulator = noaccum ? (noaccum = !1, value) : callback(accumulator, value, index, collection);
                }), accumulator;
            }
            function reject(collection, callback, thisArg) {
                return callback = lodash.createCallback(callback, thisArg, 3), filter(collection, function(value, index, collection) {
                    return !callback(value, index, collection);
                });
            }
            function sample(collection, n, guard) {
                if (collection && "number" != typeof collection.length && (collection = values(collection)), 
                null == n || guard) return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
                var result = shuffle(collection);
                return result.length = nativeMin(nativeMax(0, n), result.length), result;
            }
            function shuffle(collection) {
                var index = -1, length = collection ? collection.length : 0, result = Array("number" == typeof length ? length : 0);
                return forEach(collection, function(value) {
                    var rand = baseRandom(0, ++index);
                    result[index] = result[rand], result[rand] = value;
                }), result;
            }
            function size(collection) {
                var length = collection ? collection.length : 0;
                return "number" == typeof length ? length : keys(collection).length;
            }
            function some(collection, callback, thisArg) {
                var result;
                callback = lodash.createCallback(callback, thisArg, 3);
                var index = -1, length = collection ? collection.length : 0;
                if ("number" == typeof length) for (;++index < length && !(result = callback(collection[index], index, collection)); ) ; else forOwn(collection, function(value, index, collection) {
                    return !(result = callback(value, index, collection));
                });
                return !!result;
            }
            function sortBy(collection, callback, thisArg) {
                var index = -1, isArr = isArray(callback), length = collection ? collection.length : 0, result = Array("number" == typeof length ? length : 0);
                for (isArr || (callback = lodash.createCallback(callback, thisArg, 3)), forEach(collection, function(value, key, collection) {
                    var object = result[++index] = getObject();
                    isArr ? object.criteria = map(callback, function(key) {
                        return value[key];
                    }) : (object.criteria = getArray())[0] = callback(value, key, collection), object.index = index, 
                    object.value = value;
                }), length = result.length, result.sort(compareAscending); length--; ) {
                    var object = result[length];
                    result[length] = object.value, isArr || releaseArray(object.criteria), releaseObject(object);
                }
                return result;
            }
            function toArray(collection) {
                return collection && "number" == typeof collection.length ? slice(collection) : values(collection);
            }
            function compact(array) {
                for (var index = -1, length = array ? array.length : 0, result = []; ++index < length; ) {
                    var value = array[index];
                    value && result.push(value);
                }
                return result;
            }
            function difference(array) {
                return baseDifference(array, baseFlatten(arguments, !0, !0, 1));
            }
            function findIndex(array, callback, thisArg) {
                var index = -1, length = array ? array.length : 0;
                for (callback = lodash.createCallback(callback, thisArg, 3); ++index < length; ) if (callback(array[index], index, array)) return index;
                return -1;
            }
            function findLastIndex(array, callback, thisArg) {
                var length = array ? array.length : 0;
                for (callback = lodash.createCallback(callback, thisArg, 3); length--; ) if (callback(array[length], length, array)) return length;
                return -1;
            }
            function first(array, callback, thisArg) {
                var n = 0, length = array ? array.length : 0;
                if ("number" != typeof callback && null != callback) {
                    var index = -1;
                    for (callback = lodash.createCallback(callback, thisArg, 3); ++index < length && callback(array[index], index, array); ) n++;
                } else if (n = callback, null == n || thisArg) return array ? array[0] : undefined;
                return slice(array, 0, nativeMin(nativeMax(0, n), length));
            }
            function flatten(array, isShallow, callback, thisArg) {
                return "boolean" != typeof isShallow && null != isShallow && (thisArg = callback, 
                callback = "function" != typeof isShallow && thisArg && thisArg[isShallow] === array ? null : isShallow, 
                isShallow = !1), null != callback && (array = map(array, callback, thisArg)), baseFlatten(array, isShallow);
            }
            function indexOf(array, value, fromIndex) {
                if ("number" == typeof fromIndex) {
                    var length = array ? array.length : 0;
                    fromIndex = 0 > fromIndex ? nativeMax(0, length + fromIndex) : fromIndex || 0;
                } else if (fromIndex) {
                    var index = sortedIndex(array, value);
                    return array[index] === value ? index : -1;
                }
                return baseIndexOf(array, value, fromIndex);
            }
            function initial(array, callback, thisArg) {
                var n = 0, length = array ? array.length : 0;
                if ("number" != typeof callback && null != callback) {
                    var index = length;
                    for (callback = lodash.createCallback(callback, thisArg, 3); index-- && callback(array[index], index, array); ) n++;
                } else n = null == callback || thisArg ? 1 : callback || n;
                return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
            }
            function intersection() {
                for (var args = [], argsIndex = -1, argsLength = arguments.length, caches = getArray(), indexOf = getIndexOf(), trustIndexOf = indexOf === baseIndexOf, seen = getArray(); ++argsIndex < argsLength; ) {
                    var value = arguments[argsIndex];
                    (isArray(value) || isArguments(value)) && (args.push(value), caches.push(trustIndexOf && value.length >= largeArraySize && createCache(argsIndex ? args[argsIndex] : seen)));
                }
                var array = args[0], index = -1, length = array ? array.length : 0, result = [];
                outer: for (;++index < length; ) {
                    var cache = caches[0];
                    if (value = array[index], (cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
                        for (argsIndex = argsLength, (cache || seen).push(value); --argsIndex; ) if (cache = caches[argsIndex], 
                        (cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) continue outer;
                        result.push(value);
                    }
                }
                for (;argsLength--; ) cache = caches[argsLength], cache && releaseObject(cache);
                return releaseArray(caches), releaseArray(seen), result;
            }
            function last(array, callback, thisArg) {
                var n = 0, length = array ? array.length : 0;
                if ("number" != typeof callback && null != callback) {
                    var index = length;
                    for (callback = lodash.createCallback(callback, thisArg, 3); index-- && callback(array[index], index, array); ) n++;
                } else if (n = callback, null == n || thisArg) return array ? array[length - 1] : undefined;
                return slice(array, nativeMax(0, length - n));
            }
            function lastIndexOf(array, value, fromIndex) {
                var index = array ? array.length : 0;
                for ("number" == typeof fromIndex && (index = (0 > fromIndex ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1); index--; ) if (array[index] === value) return index;
                return -1;
            }
            function pull(array) {
                for (var args = arguments, argsIndex = 0, argsLength = args.length, length = array ? array.length : 0; ++argsIndex < argsLength; ) for (var index = -1, value = args[argsIndex]; ++index < length; ) array[index] === value && (splice.call(array, index--, 1), 
                length--);
                return array;
            }
            function range(start, end, step) {
                start = +start || 0, step = "number" == typeof step ? step : +step || 1, null == end && (end = start, 
                start = 0);
                for (var index = -1, length = nativeMax(0, ceil((end - start) / (step || 1))), result = Array(length); ++index < length; ) result[index] = start, 
                start += step;
                return result;
            }
            function remove(array, callback, thisArg) {
                var index = -1, length = array ? array.length : 0, result = [];
                for (callback = lodash.createCallback(callback, thisArg, 3); ++index < length; ) {
                    var value = array[index];
                    callback(value, index, array) && (result.push(value), splice.call(array, index--, 1), 
                    length--);
                }
                return result;
            }
            function rest(array, callback, thisArg) {
                if ("number" != typeof callback && null != callback) {
                    var n = 0, index = -1, length = array ? array.length : 0;
                    for (callback = lodash.createCallback(callback, thisArg, 3); ++index < length && callback(array[index], index, array); ) n++;
                } else n = null == callback || thisArg ? 1 : nativeMax(0, callback);
                return slice(array, n);
            }
            function sortedIndex(array, value, callback, thisArg) {
                var low = 0, high = array ? array.length : low;
                for (callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity, 
                value = callback(value); high > low; ) {
                    var mid = low + high >>> 1;
                    callback(array[mid]) < value ? low = mid + 1 : high = mid;
                }
                return low;
            }
            function union() {
                return baseUniq(baseFlatten(arguments, !0, !0));
            }
            function uniq(array, isSorted, callback, thisArg) {
                return "boolean" != typeof isSorted && null != isSorted && (thisArg = callback, 
                callback = "function" != typeof isSorted && thisArg && thisArg[isSorted] === array ? null : isSorted, 
                isSorted = !1), null != callback && (callback = lodash.createCallback(callback, thisArg, 3)), 
                baseUniq(array, isSorted, callback);
            }
            function without(array) {
                return baseDifference(array, slice(arguments, 1));
            }
            function xor() {
                for (var index = -1, length = arguments.length; ++index < length; ) {
                    var array = arguments[index];
                    if (isArray(array) || isArguments(array)) var result = result ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result))) : array;
                }
                return result || [];
            }
            function zip() {
                for (var array = arguments.length > 1 ? arguments : arguments[0], index = -1, length = array ? max(pluck(array, "length")) : 0, result = Array(0 > length ? 0 : length); ++index < length; ) result[index] = pluck(array, index);
                return result;
            }
            function zipObject(keys, values) {
                var index = -1, length = keys ? keys.length : 0, result = {};
                for (values || !length || isArray(keys[0]) || (values = []); ++index < length; ) {
                    var key = keys[index];
                    values ? result[key] = values[index] : key && (result[key[0]] = key[1]);
                }
                return result;
            }
            function after(n, func) {
                if (!isFunction(func)) throw new TypeError();
                return function() {
                    return --n < 1 ? func.apply(this, arguments) : void 0;
                };
            }
            function bind(func, thisArg) {
                return arguments.length > 2 ? createWrapper(func, 17, slice(arguments, 2), null, thisArg) : createWrapper(func, 1, null, null, thisArg);
            }
            function bindAll(object) {
                for (var funcs = arguments.length > 1 ? baseFlatten(arguments, !0, !1, 1) : functions(object), index = -1, length = funcs.length; ++index < length; ) {
                    var key = funcs[index];
                    object[key] = createWrapper(object[key], 1, null, null, object);
                }
                return object;
            }
            function bindKey(object, key) {
                return arguments.length > 2 ? createWrapper(key, 19, slice(arguments, 2), null, object) : createWrapper(key, 3, null, null, object);
            }
            function compose() {
                for (var funcs = arguments, length = funcs.length; length--; ) if (!isFunction(funcs[length])) throw new TypeError();
                return function() {
                    for (var args = arguments, length = funcs.length; length--; ) args = [ funcs[length].apply(this, args) ];
                    return args[0];
                };
            }
            function curry(func, arity) {
                return arity = "number" == typeof arity ? arity : +arity || func.length, createWrapper(func, 4, null, null, null, arity);
            }
            function debounce(func, wait, options) {
                var args, maxTimeoutId, result, stamp, thisArg, timeoutId, trailingCall, lastCalled = 0, maxWait = !1, trailing = !0;
                if (!isFunction(func)) throw new TypeError();
                if (wait = nativeMax(0, wait) || 0, options === !0) {
                    var leading = !0;
                    trailing = !1;
                } else isObject(options) && (leading = options.leading, maxWait = "maxWait" in options && (nativeMax(wait, options.maxWait) || 0), 
                trailing = "trailing" in options ? options.trailing : trailing);
                var delayed = function() {
                    var remaining = wait - (now() - stamp);
                    if (0 >= remaining) {
                        maxTimeoutId && clearTimeout(maxTimeoutId);
                        var isCalled = trailingCall;
                        maxTimeoutId = timeoutId = trailingCall = undefined, isCalled && (lastCalled = now(), 
                        result = func.apply(thisArg, args), timeoutId || maxTimeoutId || (args = thisArg = null));
                    } else timeoutId = setTimeout(delayed, remaining);
                }, maxDelayed = function() {
                    timeoutId && clearTimeout(timeoutId), maxTimeoutId = timeoutId = trailingCall = undefined, 
                    (trailing || maxWait !== wait) && (lastCalled = now(), result = func.apply(thisArg, args), 
                    timeoutId || maxTimeoutId || (args = thisArg = null));
                };
                return function() {
                    if (args = arguments, stamp = now(), thisArg = this, trailingCall = trailing && (timeoutId || !leading), 
                    maxWait === !1) var leadingCall = leading && !timeoutId; else {
                        maxTimeoutId || leading || (lastCalled = stamp);
                        var remaining = maxWait - (stamp - lastCalled), isCalled = 0 >= remaining;
                        isCalled ? (maxTimeoutId && (maxTimeoutId = clearTimeout(maxTimeoutId)), lastCalled = stamp, 
                        result = func.apply(thisArg, args)) : maxTimeoutId || (maxTimeoutId = setTimeout(maxDelayed, remaining));
                    }
                    return isCalled && timeoutId ? timeoutId = clearTimeout(timeoutId) : timeoutId || wait === maxWait || (timeoutId = setTimeout(delayed, wait)), 
                    leadingCall && (isCalled = !0, result = func.apply(thisArg, args)), !isCalled || timeoutId || maxTimeoutId || (args = thisArg = null), 
                    result;
                };
            }
            function defer(func) {
                if (!isFunction(func)) throw new TypeError();
                var args = slice(arguments, 1);
                return setTimeout(function() {
                    func.apply(undefined, args);
                }, 1);
            }
            function delay(func, wait) {
                if (!isFunction(func)) throw new TypeError();
                var args = slice(arguments, 2);
                return setTimeout(function() {
                    func.apply(undefined, args);
                }, wait);
            }
            function memoize(func, resolver) {
                if (!isFunction(func)) throw new TypeError();
                var memoized = function() {
                    var cache = memoized.cache, key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];
                    return hasOwnProperty.call(cache, key) ? cache[key] : cache[key] = func.apply(this, arguments);
                };
                return memoized.cache = {}, memoized;
            }
            function once(func) {
                var ran, result;
                if (!isFunction(func)) throw new TypeError();
                return function() {
                    return ran ? result : (ran = !0, result = func.apply(this, arguments), func = null, 
                    result);
                };
            }
            function partial(func) {
                return createWrapper(func, 16, slice(arguments, 1));
            }
            function partialRight(func) {
                return createWrapper(func, 32, null, slice(arguments, 1));
            }
            function throttle(func, wait, options) {
                var leading = !0, trailing = !0;
                if (!isFunction(func)) throw new TypeError();
                return options === !1 ? leading = !1 : isObject(options) && (leading = "leading" in options ? options.leading : leading, 
                trailing = "trailing" in options ? options.trailing : trailing), debounceOptions.leading = leading, 
                debounceOptions.maxWait = wait, debounceOptions.trailing = trailing, debounce(func, wait, debounceOptions);
            }
            function wrap(value, wrapper) {
                return createWrapper(wrapper, 16, [ value ]);
            }
            function constant(value) {
                return function() {
                    return value;
                };
            }
            function createCallback(func, thisArg, argCount) {
                var type = typeof func;
                if (null == func || "function" == type) return baseCreateCallback(func, thisArg, argCount);
                if ("object" != type) return property(func);
                var props = keys(func), key = props[0], a = func[key];
                return 1 != props.length || a !== a || isObject(a) ? function(object) {
                    for (var length = props.length, result = !1; length-- && (result = baseIsEqual(object[props[length]], func[props[length]], null, !0)); ) ;
                    return result;
                } : function(object) {
                    var b = object[key];
                    return a === b && (0 !== a || 1 / a == 1 / b);
                };
            }
            function escape(string) {
                return null == string ? "" : String(string).replace(reUnescapedHtml, escapeHtmlChar);
            }
            function identity(value) {
                return value;
            }
            function mixin(object, source, options) {
                var chain = !0, methodNames = source && functions(source);
                source && (options || methodNames.length) || (null == options && (options = source), 
                ctor = lodashWrapper, source = object, object = lodash, methodNames = functions(source)), 
                options === !1 ? chain = !1 : isObject(options) && "chain" in options && (chain = options.chain);
                var ctor = object, isFunc = isFunction(ctor);
                forEach(methodNames, function(methodName) {
                    var func = object[methodName] = source[methodName];
                    isFunc && (ctor.prototype[methodName] = function() {
                        var chainAll = this.__chain__, value = this.__wrapped__, args = [ value ];
                        push.apply(args, arguments);
                        var result = func.apply(object, args);
                        if (chain || chainAll) {
                            if (value === result && isObject(result)) return this;
                            result = new ctor(result), result.__chain__ = chainAll;
                        }
                        return result;
                    });
                });
            }
            function noConflict() {
                return context._ = oldDash, this;
            }
            function noop() {}
            function property(key) {
                return function(object) {
                    return object[key];
                };
            }
            function random(min, max, floating) {
                var noMin = null == min, noMax = null == max;
                if (null == floating && ("boolean" == typeof min && noMax ? (floating = min, min = 1) : noMax || "boolean" != typeof max || (floating = max, 
                noMax = !0)), noMin && noMax && (max = 1), min = +min || 0, noMax ? (max = min, 
                min = 0) : max = +max || 0, floating || min % 1 || max % 1) {
                    var rand = nativeRandom();
                    return nativeMin(min + rand * (max - min + parseFloat("1e-" + ((rand + "").length - 1))), max);
                }
                return baseRandom(min, max);
            }
            function result(object, key) {
                if (object) {
                    var value = object[key];
                    return isFunction(value) ? object[key]() : value;
                }
            }
            function template(text, data, options) {
                var settings = lodash.templateSettings;
                text = String(text || ""), options = defaults({}, options, settings);
                var isEvaluating, imports = defaults({}, options.imports, settings.imports), importsKeys = keys(imports), importsValues = values(imports), index = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '", reDelimiters = RegExp((options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$", "g");
                text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
                    return interpolateValue || (interpolateValue = esTemplateValue), source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar), 
                    escapeValue && (source += "' +\n__e(" + escapeValue + ") +\n'"), evaluateValue && (isEvaluating = !0, 
                    source += "';\n" + evaluateValue + ";\n__p += '"), interpolateValue && (source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'"), 
                    index = offset + match.length, match;
                }), source += "';\n";
                var variable = options.variable, hasVariable = variable;
                hasVariable || (variable = "obj", source = "with (" + variable + ") {\n" + source + "\n}\n"), 
                source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;"), 
                source = "function(" + variable + ") {\n" + (hasVariable ? "" : variable + " || (" + variable + " = {});\n") + "var __t, __p = '', __e = _.escape" + (isEvaluating ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
                var sourceURL = "\n/*\n//# sourceURL=" + (options.sourceURL || "/lodash/template/source[" + templateCounter++ + "]") + "\n*/";
                try {
                    var result = Function(importsKeys, "return " + source + sourceURL).apply(undefined, importsValues);
                } catch (e) {
                    throw e.source = source, e;
                }
                return data ? result(data) : (result.source = source, result);
            }
            function times(n, callback, thisArg) {
                n = (n = +n) > -1 ? n : 0;
                var index = -1, result = Array(n);
                for (callback = baseCreateCallback(callback, thisArg, 1); ++index < n; ) result[index] = callback(index);
                return result;
            }
            function unescape(string) {
                return null == string ? "" : String(string).replace(reEscapedHtml, unescapeHtmlChar);
            }
            function uniqueId(prefix) {
                var id = ++idCounter;
                return String(null == prefix ? "" : prefix) + id;
            }
            function chain(value) {
                return value = new lodashWrapper(value), value.__chain__ = !0, value;
            }
            function tap(value, interceptor) {
                return interceptor(value), value;
            }
            function wrapperChain() {
                return this.__chain__ = !0, this;
            }
            function wrapperToString() {
                return String(this.__wrapped__);
            }
            function wrapperValueOf() {
                return this.__wrapped__;
            }
            context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;
            var Array = context.Array, Boolean = context.Boolean, Date = context.Date, Function = context.Function, Math = context.Math, Number = context.Number, Object = context.Object, RegExp = context.RegExp, String = context.String, TypeError = context.TypeError, arrayRef = [], objectProto = Object.prototype, oldDash = context._, toString = objectProto.toString, reNative = RegExp("^" + String(toString).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/toString| for [^\]]+/g, ".*?") + "$"), ceil = Math.ceil, clearTimeout = context.clearTimeout, floor = Math.floor, fnToString = Function.prototype.toString, getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf, hasOwnProperty = objectProto.hasOwnProperty, push = arrayRef.push, setTimeout = context.setTimeout, splice = arrayRef.splice, unshift = arrayRef.unshift, defineProperty = function() {
                try {
                    var o = {}, func = isNative(func = Object.defineProperty) && func, result = func(o, o, o) && func;
                } catch (e) {}
                return result;
            }(), nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate, nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray, nativeIsFinite = context.isFinite, nativeIsNaN = context.isNaN, nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys, nativeMax = Math.max, nativeMin = Math.min, nativeParseInt = context.parseInt, nativeRandom = Math.random, ctorByClass = {};
            ctorByClass[arrayClass] = Array, ctorByClass[boolClass] = Boolean, ctorByClass[dateClass] = Date, 
            ctorByClass[funcClass] = Function, ctorByClass[objectClass] = Object, ctorByClass[numberClass] = Number, 
            ctorByClass[regexpClass] = RegExp, ctorByClass[stringClass] = String, lodashWrapper.prototype = lodash.prototype;
            var support = lodash.support = {};
            support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext), 
            support.funcNames = "string" == typeof Function.name, lodash.templateSettings = {
                escape: /<%-([\s\S]+?)%>/g,
                evaluate: /<%([\s\S]+?)%>/g,
                interpolate: reInterpolate,
                variable: "",
                imports: {
                    _: lodash
                }
            }, nativeCreate || (baseCreate = function() {
                function Object() {}
                return function(prototype) {
                    if (isObject(prototype)) {
                        Object.prototype = prototype;
                        var result = new Object();
                        Object.prototype = null;
                    }
                    return result || context.Object();
                };
            }());
            var setBindData = defineProperty ? function(func, value) {
                descriptor.value = value, defineProperty(func, "__bindData__", descriptor);
            } : noop, isArray = nativeIsArray || function(value) {
                return value && "object" == typeof value && "number" == typeof value.length && toString.call(value) == arrayClass || !1;
            }, shimKeys = function(object) {
                var index, iterable = object, result = [];
                if (!iterable) return result;
                if (!objectTypes[typeof object]) return result;
                for (index in iterable) hasOwnProperty.call(iterable, index) && result.push(index);
                return result;
            }, keys = nativeKeys ? function(object) {
                return isObject(object) ? nativeKeys(object) : [];
            } : shimKeys, htmlEscapes = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }, htmlUnescapes = invert(htmlEscapes), reEscapedHtml = RegExp("(" + keys(htmlUnescapes).join("|") + ")", "g"), reUnescapedHtml = RegExp("[" + keys(htmlEscapes).join("") + "]", "g"), assign = function(object, source, guard) {
                var index, iterable = object, result = iterable;
                if (!iterable) return result;
                var args = arguments, argsIndex = 0, argsLength = "number" == typeof guard ? 2 : args.length;
                if (argsLength > 3 && "function" == typeof args[argsLength - 2]) var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2); else argsLength > 2 && "function" == typeof args[argsLength - 1] && (callback = args[--argsLength]);
                for (;++argsIndex < argsLength; ) if (iterable = args[argsIndex], iterable && objectTypes[typeof iterable]) for (var ownIndex = -1, ownProps = objectTypes[typeof iterable] && keys(iterable), length = ownProps ? ownProps.length : 0; ++ownIndex < length; ) index = ownProps[ownIndex], 
                result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
                return result;
            }, defaults = function(object, source, guard) {
                var index, iterable = object, result = iterable;
                if (!iterable) return result;
                for (var args = arguments, argsIndex = 0, argsLength = "number" == typeof guard ? 2 : args.length; ++argsIndex < argsLength; ) if (iterable = args[argsIndex], 
                iterable && objectTypes[typeof iterable]) for (var ownIndex = -1, ownProps = objectTypes[typeof iterable] && keys(iterable), length = ownProps ? ownProps.length : 0; ++ownIndex < length; ) index = ownProps[ownIndex], 
                "undefined" == typeof result[index] && (result[index] = iterable[index]);
                return result;
            }, forIn = function(collection, callback, thisArg) {
                var index, iterable = collection, result = iterable;
                if (!iterable) return result;
                if (!objectTypes[typeof iterable]) return result;
                callback = callback && "undefined" == typeof thisArg ? callback : baseCreateCallback(callback, thisArg, 3);
                for (index in iterable) if (callback(iterable[index], index, collection) === !1) return result;
                return result;
            }, forOwn = function(collection, callback, thisArg) {
                var index, iterable = collection, result = iterable;
                if (!iterable) return result;
                if (!objectTypes[typeof iterable]) return result;
                callback = callback && "undefined" == typeof thisArg ? callback : baseCreateCallback(callback, thisArg, 3);
                for (var ownIndex = -1, ownProps = objectTypes[typeof iterable] && keys(iterable), length = ownProps ? ownProps.length : 0; ++ownIndex < length; ) if (index = ownProps[ownIndex], 
                callback(iterable[index], index, collection) === !1) return result;
                return result;
            }, isPlainObject = getPrototypeOf ? function(value) {
                if (!value || toString.call(value) != objectClass) return !1;
                var valueOf = value.valueOf, objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);
                return objProto ? value == objProto || getPrototypeOf(value) == objProto : shimIsPlainObject(value);
            } : shimIsPlainObject, countBy = createAggregator(function(result, value, key) {
                hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1;
            }), groupBy = createAggregator(function(result, value, key) {
                (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
            }), indexBy = createAggregator(function(result, value, key) {
                result[key] = value;
            }), pluck = map, where = filter, now = isNative(now = Date.now) && now || function() {
                return new Date().getTime();
            }, parseInt = 8 == nativeParseInt(whitespace + "08") ? nativeParseInt : function(value, radix) {
                return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, "") : value, radix || 0);
            };
            return lodash.after = after, lodash.assign = assign, lodash.at = at, lodash.bind = bind, 
            lodash.bindAll = bindAll, lodash.bindKey = bindKey, lodash.chain = chain, lodash.compact = compact, 
            lodash.compose = compose, lodash.constant = constant, lodash.countBy = countBy, 
            lodash.create = create, lodash.createCallback = createCallback, lodash.curry = curry, 
            lodash.debounce = debounce, lodash.defaults = defaults, lodash.defer = defer, lodash.delay = delay, 
            lodash.difference = difference, lodash.filter = filter, lodash.flatten = flatten, 
            lodash.forEach = forEach, lodash.forEachRight = forEachRight, lodash.forIn = forIn, 
            lodash.forInRight = forInRight, lodash.forOwn = forOwn, lodash.forOwnRight = forOwnRight, 
            lodash.functions = functions, lodash.groupBy = groupBy, lodash.indexBy = indexBy, 
            lodash.initial = initial, lodash.intersection = intersection, lodash.invert = invert, 
            lodash.invoke = invoke, lodash.keys = keys, lodash.map = map, lodash.mapValues = mapValues, 
            lodash.max = max, lodash.memoize = memoize, lodash.merge = merge, lodash.min = min, 
            lodash.omit = omit, lodash.once = once, lodash.pairs = pairs, lodash.partial = partial, 
            lodash.partialRight = partialRight, lodash.pick = pick, lodash.pluck = pluck, lodash.property = property, 
            lodash.pull = pull, lodash.range = range, lodash.reject = reject, lodash.remove = remove, 
            lodash.rest = rest, lodash.shuffle = shuffle, lodash.sortBy = sortBy, lodash.tap = tap, 
            lodash.throttle = throttle, lodash.times = times, lodash.toArray = toArray, lodash.transform = transform, 
            lodash.union = union, lodash.uniq = uniq, lodash.values = values, lodash.where = where, 
            lodash.without = without, lodash.wrap = wrap, lodash.xor = xor, lodash.zip = zip, 
            lodash.zipObject = zipObject, lodash.collect = map, lodash.drop = rest, lodash.each = forEach, 
            lodash.eachRight = forEachRight, lodash.extend = assign, lodash.methods = functions, 
            lodash.object = zipObject, lodash.select = filter, lodash.tail = rest, lodash.unique = uniq, 
            lodash.unzip = zip, mixin(lodash), lodash.clone = clone, lodash.cloneDeep = cloneDeep, 
            lodash.contains = contains, lodash.escape = escape, lodash.every = every, lodash.find = find, 
            lodash.findIndex = findIndex, lodash.findKey = findKey, lodash.findLast = findLast, 
            lodash.findLastIndex = findLastIndex, lodash.findLastKey = findLastKey, lodash.has = has, 
            lodash.identity = identity, lodash.indexOf = indexOf, lodash.isArguments = isArguments, 
            lodash.isArray = isArray, lodash.isBoolean = isBoolean, lodash.isDate = isDate, 
            lodash.isElement = isElement, lodash.isEmpty = isEmpty, lodash.isEqual = isEqual, 
            lodash.isFinite = isFinite, lodash.isFunction = isFunction, lodash.isNaN = isNaN, 
            lodash.isNull = isNull, lodash.isNumber = isNumber, lodash.isObject = isObject, 
            lodash.isPlainObject = isPlainObject, lodash.isRegExp = isRegExp, lodash.isString = isString, 
            lodash.isUndefined = isUndefined, lodash.lastIndexOf = lastIndexOf, lodash.mixin = mixin, 
            lodash.noConflict = noConflict, lodash.noop = noop, lodash.now = now, lodash.parseInt = parseInt, 
            lodash.random = random, lodash.reduce = reduce, lodash.reduceRight = reduceRight, 
            lodash.result = result, lodash.runInContext = runInContext, lodash.size = size, 
            lodash.some = some, lodash.sortedIndex = sortedIndex, lodash.template = template, 
            lodash.unescape = unescape, lodash.uniqueId = uniqueId, lodash.all = every, lodash.any = some, 
            lodash.detect = find, lodash.findWhere = find, lodash.foldl = reduce, lodash.foldr = reduceRight, 
            lodash.include = contains, lodash.inject = reduce, mixin(function() {
                var source = {};
                return forOwn(lodash, function(func, methodName) {
                    lodash.prototype[methodName] || (source[methodName] = func);
                }), source;
            }(), !1), lodash.first = first, lodash.last = last, lodash.sample = sample, lodash.take = first, 
            lodash.head = first, forOwn(lodash, function(func, methodName) {
                var callbackable = "sample" !== methodName;
                lodash.prototype[methodName] || (lodash.prototype[methodName] = function(n, guard) {
                    var chainAll = this.__chain__, result = func(this.__wrapped__, n, guard);
                    return chainAll || null != n && (!guard || callbackable && "function" == typeof n) ? new lodashWrapper(result, chainAll) : result;
                });
            }), lodash.VERSION = "2.4.1", lodash.prototype.chain = wrapperChain, lodash.prototype.toString = wrapperToString, 
            lodash.prototype.value = wrapperValueOf, lodash.prototype.valueOf = wrapperValueOf, 
            forEach([ "join", "pop", "shift" ], function(methodName) {
                var func = arrayRef[methodName];
                lodash.prototype[methodName] = function() {
                    var chainAll = this.__chain__, result = func.apply(this.__wrapped__, arguments);
                    return chainAll ? new lodashWrapper(result, chainAll) : result;
                };
            }), forEach([ "push", "reverse", "sort", "unshift" ], function(methodName) {
                var func = arrayRef[methodName];
                lodash.prototype[methodName] = function() {
                    return func.apply(this.__wrapped__, arguments), this;
                };
            }), forEach([ "concat", "slice", "splice" ], function(methodName) {
                var func = arrayRef[methodName];
                lodash.prototype[methodName] = function() {
                    return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
                };
            }), lodash;
        }
        var undefined, arrayPool = [], objectPool = [], idCounter = 0, keyPrefix = +new Date() + "", largeArraySize = 75, maxPoolSize = 40, whitespace = " 	\f \ufeff\n\r\u2028\u2029 ᠎             　", reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g, reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, reFlags = /\w*$/, reFuncName = /^\s*function[ \n\r\t]+\w/, reInterpolate = /<%=([\s\S]+?)%>/g, reLeadingSpacesAndZeros = RegExp("^[" + whitespace + "]*0+(?=.$)"), reNoMatch = /($^)/, reThis = /\bthis\b/, reUnescapedString = /['\n\r\t\u2028\u2029\\]/g, contextProps = [ "Array", "Boolean", "Date", "Function", "Math", "Number", "Object", "RegExp", "String", "_", "attachEvent", "clearTimeout", "isFinite", "isNaN", "parseInt", "setTimeout" ], templateCounter = 0, argsClass = "[object Arguments]", arrayClass = "[object Array]", boolClass = "[object Boolean]", dateClass = "[object Date]", funcClass = "[object Function]", numberClass = "[object Number]", objectClass = "[object Object]", regexpClass = "[object RegExp]", stringClass = "[object String]", cloneableClasses = {};
        cloneableClasses[funcClass] = !1, cloneableClasses[argsClass] = cloneableClasses[arrayClass] = cloneableClasses[boolClass] = cloneableClasses[dateClass] = cloneableClasses[numberClass] = cloneableClasses[objectClass] = cloneableClasses[regexpClass] = cloneableClasses[stringClass] = !0;
        var debounceOptions = {
            leading: !1,
            maxWait: 0,
            trailing: !1
        }, descriptor = {
            configurable: !1,
            enumerable: !1,
            value: null,
            writable: !1
        }, objectTypes = {
            "boolean": !1,
            "function": !0,
            object: !0,
            number: !1,
            string: !1,
            undefined: !1
        }, stringEscapes = {
            "\\": "\\",
            "'": "'",
            "\n": "n",
            "\r": "r",
            "	": "t",
            "\u2028": "u2028",
            "\u2029": "u2029"
        }, root = objectTypes[typeof window] && window || this, freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports, freeModule = objectTypes[typeof module] && module && !module.nodeType && module, moduleExports = freeModule && freeModule.exports === freeExports && freeExports, freeGlobal = objectTypes[typeof global] && global;
        !freeGlobal || freeGlobal.global !== freeGlobal && freeGlobal.window !== freeGlobal || (root = freeGlobal);
        var _ = runInContext();
        "function" == typeof define && "object" == typeof define.amd && define.amd ? (root._ = _, 
        define("lodash", [], function() {
            return _;
        })) : freeExports && freeModule ? moduleExports ? (freeModule.exports = _)._ = _ : freeExports._ = _ : root._ = _;
    }).call(this), function(global, factory) {
        "object" == typeof module && "object" == typeof module.exports ? module.exports = global.document ? factory(global, !0) : function(w) {
            if (!w.document) throw new Error("jQuery requires a window with a document");
            return factory(w);
        } : factory(global);
    }("undefined" != typeof window ? window : this, function(window, noGlobal) {
        function isArraylike(obj) {
            var length = obj.length, type = jQuery.type(obj);
            return "function" === type || jQuery.isWindow(obj) ? !1 : 1 === obj.nodeType && length ? !0 : "array" === type || 0 === length || "number" == typeof length && length > 0 && length - 1 in obj;
        }
        function winnow(elements, qualifier, not) {
            if (jQuery.isFunction(qualifier)) return jQuery.grep(elements, function(elem, i) {
                return !!qualifier.call(elem, i, elem) !== not;
            });
            if (qualifier.nodeType) return jQuery.grep(elements, function(elem) {
                return elem === qualifier !== not;
            });
            if ("string" == typeof qualifier) {
                if (risSimple.test(qualifier)) return jQuery.filter(qualifier, elements, not);
                qualifier = jQuery.filter(qualifier, elements);
            }
            return jQuery.grep(elements, function(elem) {
                return indexOf.call(qualifier, elem) >= 0 !== not;
            });
        }
        function sibling(cur, dir) {
            for (;(cur = cur[dir]) && 1 !== cur.nodeType; ) ;
            return cur;
        }
        function createOptions(options) {
            var object = optionsCache[options] = {};
            return jQuery.each(options.match(rnotwhite) || [], function(_, flag) {
                object[flag] = !0;
            }), object;
        }
        function completed() {
            document.removeEventListener("DOMContentLoaded", completed, !1), window.removeEventListener("load", completed, !1), 
            jQuery.ready();
        }
        function Data() {
            Object.defineProperty(this.cache = {}, 0, {
                get: function() {
                    return {};
                }
            }), this.expando = jQuery.expando + Math.random();
        }
        function dataAttr(elem, key, data) {
            var name;
            if (void 0 === data && 1 === elem.nodeType) if (name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase(), 
            data = elem.getAttribute(name), "string" == typeof data) {
                try {
                    data = "true" === data ? !0 : "false" === data ? !1 : "null" === data ? null : +data + "" === data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
                } catch (e) {}
                data_user.set(elem, key, data);
            } else data = void 0;
            return data;
        }
        function returnTrue() {
            return !0;
        }
        function returnFalse() {
            return !1;
        }
        function safeActiveElement() {
            try {
                return document.activeElement;
            } catch (err) {}
        }
        function manipulationTarget(elem, content) {
            return jQuery.nodeName(elem, "table") && jQuery.nodeName(11 !== content.nodeType ? content : content.firstChild, "tr") ? elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody")) : elem;
        }
        function disableScript(elem) {
            return elem.type = (null !== elem.getAttribute("type")) + "/" + elem.type, elem;
        }
        function restoreScript(elem) {
            var match = rscriptTypeMasked.exec(elem.type);
            return match ? elem.type = match[1] : elem.removeAttribute("type"), elem;
        }
        function setGlobalEval(elems, refElements) {
            for (var i = 0, l = elems.length; l > i; i++) data_priv.set(elems[i], "globalEval", !refElements || data_priv.get(refElements[i], "globalEval"));
        }
        function cloneCopyEvent(src, dest) {
            var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;
            if (1 === dest.nodeType) {
                if (data_priv.hasData(src) && (pdataOld = data_priv.access(src), pdataCur = data_priv.set(dest, pdataOld), 
                events = pdataOld.events)) {
                    delete pdataCur.handle, pdataCur.events = {};
                    for (type in events) for (i = 0, l = events[type].length; l > i; i++) jQuery.event.add(dest, type, events[type][i]);
                }
                data_user.hasData(src) && (udataOld = data_user.access(src), udataCur = jQuery.extend({}, udataOld), 
                data_user.set(dest, udataCur));
            }
        }
        function getAll(context, tag) {
            var ret = context.getElementsByTagName ? context.getElementsByTagName(tag || "*") : context.querySelectorAll ? context.querySelectorAll(tag || "*") : [];
            return void 0 === tag || tag && jQuery.nodeName(context, tag) ? jQuery.merge([ context ], ret) : ret;
        }
        function fixInput(src, dest) {
            var nodeName = dest.nodeName.toLowerCase();
            "input" === nodeName && rcheckableType.test(src.type) ? dest.checked = src.checked : ("input" === nodeName || "textarea" === nodeName) && (dest.defaultValue = src.defaultValue);
        }
        function actualDisplay(name, doc) {
            var elem = jQuery(doc.createElement(name)).appendTo(doc.body), display = window.getDefaultComputedStyle ? window.getDefaultComputedStyle(elem[0]).display : jQuery.css(elem[0], "display");
            return elem.detach(), display;
        }
        function defaultDisplay(nodeName) {
            var doc = document, display = elemdisplay[nodeName];
            return display || (display = actualDisplay(nodeName, doc), "none" !== display && display || (iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>")).appendTo(doc.documentElement), 
            doc = iframe[0].contentDocument, doc.write(), doc.close(), display = actualDisplay(nodeName, doc), 
            iframe.detach()), elemdisplay[nodeName] = display), display;
        }
        function curCSS(elem, name, computed) {
            var width, minWidth, maxWidth, ret, style = elem.style;
            return computed = computed || getStyles(elem), computed && (ret = computed.getPropertyValue(name) || computed[name]), 
            computed && ("" !== ret || jQuery.contains(elem.ownerDocument, elem) || (ret = jQuery.style(elem, name)), 
            rnumnonpx.test(ret) && rmargin.test(name) && (width = style.width, minWidth = style.minWidth, 
            maxWidth = style.maxWidth, style.minWidth = style.maxWidth = style.width = ret, 
            ret = computed.width, style.width = width, style.minWidth = minWidth, style.maxWidth = maxWidth)), 
            void 0 !== ret ? ret + "" : ret;
        }
        function addGetHookIf(conditionFn, hookFn) {
            return {
                get: function() {
                    return conditionFn() ? void delete this.get : (this.get = hookFn).apply(this, arguments);
                }
            };
        }
        function vendorPropName(style, name) {
            if (name in style) return name;
            for (var capName = name[0].toUpperCase() + name.slice(1), origName = name, i = cssPrefixes.length; i--; ) if (name = cssPrefixes[i] + capName, 
            name in style) return name;
            return origName;
        }
        function setPositiveNumber(elem, value, subtract) {
            var matches = rnumsplit.exec(value);
            return matches ? Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") : value;
        }
        function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
            for (var i = extra === (isBorderBox ? "border" : "content") ? 4 : "width" === name ? 1 : 0, val = 0; 4 > i; i += 2) "margin" === extra && (val += jQuery.css(elem, extra + cssExpand[i], !0, styles)), 
            isBorderBox ? ("content" === extra && (val -= jQuery.css(elem, "padding" + cssExpand[i], !0, styles)), 
            "margin" !== extra && (val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", !0, styles))) : (val += jQuery.css(elem, "padding" + cssExpand[i], !0, styles), 
            "padding" !== extra && (val += jQuery.css(elem, "border" + cssExpand[i] + "Width", !0, styles)));
            return val;
        }
        function getWidthOrHeight(elem, name, extra) {
            var valueIsBorderBox = !0, val = "width" === name ? elem.offsetWidth : elem.offsetHeight, styles = getStyles(elem), isBorderBox = "border-box" === jQuery.css(elem, "boxSizing", !1, styles);
            if (0 >= val || null == val) {
                if (val = curCSS(elem, name, styles), (0 > val || null == val) && (val = elem.style[name]), 
                rnumnonpx.test(val)) return val;
                valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]), 
                val = parseFloat(val) || 0;
            }
            return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles) + "px";
        }
        function showHide(elements, show) {
            for (var display, elem, hidden, values = [], index = 0, length = elements.length; length > index; index++) elem = elements[index], 
            elem.style && (values[index] = data_priv.get(elem, "olddisplay"), display = elem.style.display, 
            show ? (values[index] || "none" !== display || (elem.style.display = ""), "" === elem.style.display && isHidden(elem) && (values[index] = data_priv.access(elem, "olddisplay", defaultDisplay(elem.nodeName)))) : values[index] || (hidden = isHidden(elem), 
            (display && "none" !== display || !hidden) && data_priv.set(elem, "olddisplay", hidden ? display : jQuery.css(elem, "display"))));
            for (index = 0; length > index; index++) elem = elements[index], elem.style && (show && "none" !== elem.style.display && "" !== elem.style.display || (elem.style.display = show ? values[index] || "" : "none"));
            return elements;
        }
        function Tween(elem, options, prop, end, easing) {
            return new Tween.prototype.init(elem, options, prop, end, easing);
        }
        function createFxNow() {
            return setTimeout(function() {
                fxNow = void 0;
            }), fxNow = jQuery.now();
        }
        function genFx(type, includeWidth) {
            var which, i = 0, attrs = {
                height: type
            };
            for (includeWidth = includeWidth ? 1 : 0; 4 > i; i += 2 - includeWidth) which = cssExpand[i], 
            attrs["margin" + which] = attrs["padding" + which] = type;
            return includeWidth && (attrs.opacity = attrs.width = type), attrs;
        }
        function createTween(value, prop, animation) {
            for (var tween, collection = (tweeners[prop] || []).concat(tweeners["*"]), index = 0, length = collection.length; length > index; index++) if (tween = collection[index].call(animation, prop, value)) return tween;
        }
        function defaultPrefilter(elem, props, opts) {
            var prop, value, toggle, tween, hooks, oldfire, display, anim = this, orig = {}, style = elem.style, hidden = elem.nodeType && isHidden(elem), dataShow = data_priv.get(elem, "fxshow");
            opts.queue || (hooks = jQuery._queueHooks(elem, "fx"), null == hooks.unqueued && (hooks.unqueued = 0, 
            oldfire = hooks.empty.fire, hooks.empty.fire = function() {
                hooks.unqueued || oldfire();
            }), hooks.unqueued++, anim.always(function() {
                anim.always(function() {
                    hooks.unqueued--, jQuery.queue(elem, "fx").length || hooks.empty.fire();
                });
            })), 1 === elem.nodeType && ("height" in props || "width" in props) && (opts.overflow = [ style.overflow, style.overflowX, style.overflowY ], 
            display = jQuery.css(elem, "display"), "none" === display && (display = defaultDisplay(elem.nodeName)), 
            "inline" === display && "none" === jQuery.css(elem, "float") && (style.display = "inline-block")), 
            opts.overflow && (style.overflow = "hidden", anim.always(function() {
                style.overflow = opts.overflow[0], style.overflowX = opts.overflow[1], style.overflowY = opts.overflow[2];
            }));
            for (prop in props) if (value = props[prop], rfxtypes.exec(value)) {
                if (delete props[prop], toggle = toggle || "toggle" === value, value === (hidden ? "hide" : "show")) {
                    if ("show" !== value || !dataShow || void 0 === dataShow[prop]) continue;
                    hidden = !0;
                }
                orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);
            }
            if (!jQuery.isEmptyObject(orig)) {
                dataShow ? "hidden" in dataShow && (hidden = dataShow.hidden) : dataShow = data_priv.access(elem, "fxshow", {}), 
                toggle && (dataShow.hidden = !hidden), hidden ? jQuery(elem).show() : anim.done(function() {
                    jQuery(elem).hide();
                }), anim.done(function() {
                    var prop;
                    data_priv.remove(elem, "fxshow");
                    for (prop in orig) jQuery.style(elem, prop, orig[prop]);
                });
                for (prop in orig) tween = createTween(hidden ? dataShow[prop] : 0, prop, anim), 
                prop in dataShow || (dataShow[prop] = tween.start, hidden && (tween.end = tween.start, 
                tween.start = "width" === prop || "height" === prop ? 1 : 0));
            }
        }
        function propFilter(props, specialEasing) {
            var index, name, easing, value, hooks;
            for (index in props) if (name = jQuery.camelCase(index), easing = specialEasing[name], 
            value = props[index], jQuery.isArray(value) && (easing = value[1], value = props[index] = value[0]), 
            index !== name && (props[name] = value, delete props[index]), hooks = jQuery.cssHooks[name], 
            hooks && "expand" in hooks) {
                value = hooks.expand(value), delete props[name];
                for (index in value) index in props || (props[index] = value[index], specialEasing[index] = easing);
            } else specialEasing[name] = easing;
        }
        function Animation(elem, properties, options) {
            var result, stopped, index = 0, length = animationPrefilters.length, deferred = jQuery.Deferred().always(function() {
                delete tick.elem;
            }), tick = function() {
                if (stopped) return !1;
                for (var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime + animation.duration - currentTime), temp = remaining / animation.duration || 0, percent = 1 - temp, index = 0, length = animation.tweens.length; length > index; index++) animation.tweens[index].run(percent);
                return deferred.notifyWith(elem, [ animation, percent, remaining ]), 1 > percent && length ? remaining : (deferred.resolveWith(elem, [ animation ]), 
                !1);
            }, animation = deferred.promise({
                elem: elem,
                props: jQuery.extend({}, properties),
                opts: jQuery.extend(!0, {
                    specialEasing: {}
                }, options),
                originalProperties: properties,
                originalOptions: options,
                startTime: fxNow || createFxNow(),
                duration: options.duration,
                tweens: [],
                createTween: function(prop, end) {
                    var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
                    return animation.tweens.push(tween), tween;
                },
                stop: function(gotoEnd) {
                    var index = 0, length = gotoEnd ? animation.tweens.length : 0;
                    if (stopped) return this;
                    for (stopped = !0; length > index; index++) animation.tweens[index].run(1);
                    return gotoEnd ? deferred.resolveWith(elem, [ animation, gotoEnd ]) : deferred.rejectWith(elem, [ animation, gotoEnd ]), 
                    this;
                }
            }), props = animation.props;
            for (propFilter(props, animation.opts.specialEasing); length > index; index++) if (result = animationPrefilters[index].call(animation, elem, props, animation.opts)) return result;
            return jQuery.map(props, createTween, animation), jQuery.isFunction(animation.opts.start) && animation.opts.start.call(elem, animation), 
            jQuery.fx.timer(jQuery.extend(tick, {
                elem: elem,
                anim: animation,
                queue: animation.opts.queue
            })), animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
        }
        function addToPrefiltersOrTransports(structure) {
            return function(dataTypeExpression, func) {
                "string" != typeof dataTypeExpression && (func = dataTypeExpression, dataTypeExpression = "*");
                var dataType, i = 0, dataTypes = dataTypeExpression.toLowerCase().match(rnotwhite) || [];
                if (jQuery.isFunction(func)) for (;dataType = dataTypes[i++]; ) "+" === dataType[0] ? (dataType = dataType.slice(1) || "*", 
                (structure[dataType] = structure[dataType] || []).unshift(func)) : (structure[dataType] = structure[dataType] || []).push(func);
            };
        }
        function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
            function inspect(dataType) {
                var selected;
                return inspected[dataType] = !0, jQuery.each(structure[dataType] || [], function(_, prefilterOrFactory) {
                    var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
                    return "string" != typeof dataTypeOrTransport || seekingTransport || inspected[dataTypeOrTransport] ? seekingTransport ? !(selected = dataTypeOrTransport) : void 0 : (options.dataTypes.unshift(dataTypeOrTransport), 
                    inspect(dataTypeOrTransport), !1);
                }), selected;
            }
            var inspected = {}, seekingTransport = structure === transports;
            return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
        }
        function ajaxExtend(target, src) {
            var key, deep, flatOptions = jQuery.ajaxSettings.flatOptions || {};
            for (key in src) void 0 !== src[key] && ((flatOptions[key] ? target : deep || (deep = {}))[key] = src[key]);
            return deep && jQuery.extend(!0, target, deep), target;
        }
        function ajaxHandleResponses(s, jqXHR, responses) {
            for (var ct, type, finalDataType, firstDataType, contents = s.contents, dataTypes = s.dataTypes; "*" === dataTypes[0]; ) dataTypes.shift(), 
            void 0 === ct && (ct = s.mimeType || jqXHR.getResponseHeader("Content-Type"));
            if (ct) for (type in contents) if (contents[type] && contents[type].test(ct)) {
                dataTypes.unshift(type);
                break;
            }
            if (dataTypes[0] in responses) finalDataType = dataTypes[0]; else {
                for (type in responses) {
                    if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                        finalDataType = type;
                        break;
                    }
                    firstDataType || (firstDataType = type);
                }
                finalDataType = finalDataType || firstDataType;
            }
            return finalDataType ? (finalDataType !== dataTypes[0] && dataTypes.unshift(finalDataType), 
            responses[finalDataType]) : void 0;
        }
        function ajaxConvert(s, response, jqXHR, isSuccess) {
            var conv2, current, conv, tmp, prev, converters = {}, dataTypes = s.dataTypes.slice();
            if (dataTypes[1]) for (conv in s.converters) converters[conv.toLowerCase()] = s.converters[conv];
            for (current = dataTypes.shift(); current; ) if (s.responseFields[current] && (jqXHR[s.responseFields[current]] = response), 
            !prev && isSuccess && s.dataFilter && (response = s.dataFilter(response, s.dataType)), 
            prev = current, current = dataTypes.shift()) if ("*" === current) current = prev; else if ("*" !== prev && prev !== current) {
                if (conv = converters[prev + " " + current] || converters["* " + current], !conv) for (conv2 in converters) if (tmp = conv2.split(" "), 
                tmp[1] === current && (conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]])) {
                    conv === !0 ? conv = converters[conv2] : converters[conv2] !== !0 && (current = tmp[0], 
                    dataTypes.unshift(tmp[1]));
                    break;
                }
                if (conv !== !0) if (conv && s["throws"]) response = conv(response); else try {
                    response = conv(response);
                } catch (e) {
                    return {
                        state: "parsererror",
                        error: conv ? e : "No conversion from " + prev + " to " + current
                    };
                }
            }
            return {
                state: "success",
                data: response
            };
        }
        function buildParams(prefix, obj, traditional, add) {
            var name;
            if (jQuery.isArray(obj)) jQuery.each(obj, function(i, v) {
                traditional || rbracket.test(prefix) ? add(prefix, v) : buildParams(prefix + "[" + ("object" == typeof v ? i : "") + "]", v, traditional, add);
            }); else if (traditional || "object" !== jQuery.type(obj)) add(prefix, obj); else for (name in obj) buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
        }
        function getWindow(elem) {
            return jQuery.isWindow(elem) ? elem : 9 === elem.nodeType && elem.defaultView;
        }
        var arr = [], slice = arr.slice, concat = arr.concat, push = arr.push, indexOf = arr.indexOf, class2type = {}, toString = class2type.toString, hasOwn = class2type.hasOwnProperty, trim = "".trim, support = {}, document = window.document, version = "2.1.0", jQuery = function(selector, context) {
            return new jQuery.fn.init(selector, context);
        }, rmsPrefix = /^-ms-/, rdashAlpha = /-([\da-z])/gi, fcamelCase = function(all, letter) {
            return letter.toUpperCase();
        };
        jQuery.fn = jQuery.prototype = {
            jquery: version,
            constructor: jQuery,
            selector: "",
            length: 0,
            toArray: function() {
                return slice.call(this);
            },
            get: function(num) {
                return null != num ? 0 > num ? this[num + this.length] : this[num] : slice.call(this);
            },
            pushStack: function(elems) {
                var ret = jQuery.merge(this.constructor(), elems);
                return ret.prevObject = this, ret.context = this.context, ret;
            },
            each: function(callback, args) {
                return jQuery.each(this, callback, args);
            },
            map: function(callback) {
                return this.pushStack(jQuery.map(this, function(elem, i) {
                    return callback.call(elem, i, elem);
                }));
            },
            slice: function() {
                return this.pushStack(slice.apply(this, arguments));
            },
            first: function() {
                return this.eq(0);
            },
            last: function() {
                return this.eq(-1);
            },
            eq: function(i) {
                var len = this.length, j = +i + (0 > i ? len : 0);
                return this.pushStack(j >= 0 && len > j ? [ this[j] ] : []);
            },
            end: function() {
                return this.prevObject || this.constructor(null);
            },
            push: push,
            sort: arr.sort,
            splice: arr.splice
        }, jQuery.extend = jQuery.fn.extend = function() {
            var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = !1;
            for ("boolean" == typeof target && (deep = target, target = arguments[i] || {}, 
            i++), "object" == typeof target || jQuery.isFunction(target) || (target = {}), i === length && (target = this, 
            i--); length > i; i++) if (null != (options = arguments[i])) for (name in options) src = target[name], 
            copy = options[name], target !== copy && (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy))) ? (copyIsArray ? (copyIsArray = !1, 
            clone = src && jQuery.isArray(src) ? src : []) : clone = src && jQuery.isPlainObject(src) ? src : {}, 
            target[name] = jQuery.extend(deep, clone, copy)) : void 0 !== copy && (target[name] = copy));
            return target;
        }, jQuery.extend({
            expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
            isReady: !0,
            error: function(msg) {
                throw new Error(msg);
            },
            noop: function() {},
            isFunction: function(obj) {
                return "function" === jQuery.type(obj);
            },
            isArray: Array.isArray,
            isWindow: function(obj) {
                return null != obj && obj === obj.window;
            },
            isNumeric: function(obj) {
                return obj - parseFloat(obj) >= 0;
            },
            isPlainObject: function(obj) {
                if ("object" !== jQuery.type(obj) || obj.nodeType || jQuery.isWindow(obj)) return !1;
                try {
                    if (obj.constructor && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) return !1;
                } catch (e) {
                    return !1;
                }
                return !0;
            },
            isEmptyObject: function(obj) {
                var name;
                for (name in obj) return !1;
                return !0;
            },
            type: function(obj) {
                return null == obj ? obj + "" : "object" == typeof obj || "function" == typeof obj ? class2type[toString.call(obj)] || "object" : typeof obj;
            },
            globalEval: function(code) {
                var script, indirect = eval;
                code = jQuery.trim(code), code && (1 === code.indexOf("use strict") ? (script = document.createElement("script"), 
                script.text = code, document.head.appendChild(script).parentNode.removeChild(script)) : indirect(code));
            },
            camelCase: function(string) {
                return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
            },
            nodeName: function(elem, name) {
                return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
            },
            each: function(obj, callback, args) {
                var value, i = 0, length = obj.length, isArray = isArraylike(obj);
                if (args) {
                    if (isArray) for (;length > i && (value = callback.apply(obj[i], args), value !== !1); i++) ; else for (i in obj) if (value = callback.apply(obj[i], args), 
                    value === !1) break;
                } else if (isArray) for (;length > i && (value = callback.call(obj[i], i, obj[i]), 
                value !== !1); i++) ; else for (i in obj) if (value = callback.call(obj[i], i, obj[i]), 
                value === !1) break;
                return obj;
            },
            trim: function(text) {
                return null == text ? "" : trim.call(text);
            },
            makeArray: function(arr, results) {
                var ret = results || [];
                return null != arr && (isArraylike(Object(arr)) ? jQuery.merge(ret, "string" == typeof arr ? [ arr ] : arr) : push.call(ret, arr)), 
                ret;
            },
            inArray: function(elem, arr, i) {
                return null == arr ? -1 : indexOf.call(arr, elem, i);
            },
            merge: function(first, second) {
                for (var len = +second.length, j = 0, i = first.length; len > j; j++) first[i++] = second[j];
                return first.length = i, first;
            },
            grep: function(elems, callback, invert) {
                for (var callbackInverse, matches = [], i = 0, length = elems.length, callbackExpect = !invert; length > i; i++) callbackInverse = !callback(elems[i], i), 
                callbackInverse !== callbackExpect && matches.push(elems[i]);
                return matches;
            },
            map: function(elems, callback, arg) {
                var value, i = 0, length = elems.length, isArray = isArraylike(elems), ret = [];
                if (isArray) for (;length > i; i++) value = callback(elems[i], i, arg), null != value && ret.push(value); else for (i in elems) value = callback(elems[i], i, arg), 
                null != value && ret.push(value);
                return concat.apply([], ret);
            },
            guid: 1,
            proxy: function(fn, context) {
                var tmp, args, proxy;
                return "string" == typeof context && (tmp = fn[context], context = fn, fn = tmp), 
                jQuery.isFunction(fn) ? (args = slice.call(arguments, 2), proxy = function() {
                    return fn.apply(context || this, args.concat(slice.call(arguments)));
                }, proxy.guid = fn.guid = fn.guid || jQuery.guid++, proxy) : void 0;
            },
            now: Date.now,
            support: support
        }), jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
            class2type["[object " + name + "]"] = name.toLowerCase();
        });
        var Sizzle = function(window) {
            function Sizzle(selector, context, results, seed) {
                var match, elem, m, nodeType, i, groups, old, nid, newContext, newSelector;
                if ((context ? context.ownerDocument || context : preferredDoc) !== document && setDocument(context), 
                context = context || document, results = results || [], !selector || "string" != typeof selector) return results;
                if (1 !== (nodeType = context.nodeType) && 9 !== nodeType) return [];
                if (documentIsHTML && !seed) {
                    if (match = rquickExpr.exec(selector)) if (m = match[1]) {
                        if (9 === nodeType) {
                            if (elem = context.getElementById(m), !elem || !elem.parentNode) return results;
                            if (elem.id === m) return results.push(elem), results;
                        } else if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m) return results.push(elem), 
                        results;
                    } else {
                        if (match[2]) return push.apply(results, context.getElementsByTagName(selector)), 
                        results;
                        if ((m = match[3]) && support.getElementsByClassName && context.getElementsByClassName) return push.apply(results, context.getElementsByClassName(m)), 
                        results;
                    }
                    if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
                        if (nid = old = expando, newContext = context, newSelector = 9 === nodeType && selector, 
                        1 === nodeType && "object" !== context.nodeName.toLowerCase()) {
                            for (groups = tokenize(selector), (old = context.getAttribute("id")) ? nid = old.replace(rescape, "\\$&") : context.setAttribute("id", nid), 
                            nid = "[id='" + nid + "'] ", i = groups.length; i--; ) groups[i] = nid + toSelector(groups[i]);
                            newContext = rsibling.test(selector) && testContext(context.parentNode) || context, 
                            newSelector = groups.join(",");
                        }
                        if (newSelector) try {
                            return push.apply(results, newContext.querySelectorAll(newSelector)), results;
                        } catch (qsaError) {} finally {
                            old || context.removeAttribute("id");
                        }
                    }
                }
                return select(selector.replace(rtrim, "$1"), context, results, seed);
            }
            function createCache() {
                function cache(key, value) {
                    return keys.push(key + " ") > Expr.cacheLength && delete cache[keys.shift()], cache[key + " "] = value;
                }
                var keys = [];
                return cache;
            }
            function markFunction(fn) {
                return fn[expando] = !0, fn;
            }
            function assert(fn) {
                var div = document.createElement("div");
                try {
                    return !!fn(div);
                } catch (e) {
                    return !1;
                } finally {
                    div.parentNode && div.parentNode.removeChild(div), div = null;
                }
            }
            function addHandle(attrs, handler) {
                for (var arr = attrs.split("|"), i = attrs.length; i--; ) Expr.attrHandle[arr[i]] = handler;
            }
            function siblingCheck(a, b) {
                var cur = b && a, diff = cur && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE);
                if (diff) return diff;
                if (cur) for (;cur = cur.nextSibling; ) if (cur === b) return -1;
                return a ? 1 : -1;
            }
            function createInputPseudo(type) {
                return function(elem) {
                    var name = elem.nodeName.toLowerCase();
                    return "input" === name && elem.type === type;
                };
            }
            function createButtonPseudo(type) {
                return function(elem) {
                    var name = elem.nodeName.toLowerCase();
                    return ("input" === name || "button" === name) && elem.type === type;
                };
            }
            function createPositionalPseudo(fn) {
                return markFunction(function(argument) {
                    return argument = +argument, markFunction(function(seed, matches) {
                        for (var j, matchIndexes = fn([], seed.length, argument), i = matchIndexes.length; i--; ) seed[j = matchIndexes[i]] && (seed[j] = !(matches[j] = seed[j]));
                    });
                });
            }
            function testContext(context) {
                return context && typeof context.getElementsByTagName !== strundefined && context;
            }
            function setFilters() {}
            function tokenize(selector, parseOnly) {
                var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + " "];
                if (cached) return parseOnly ? 0 : cached.slice(0);
                for (soFar = selector, groups = [], preFilters = Expr.preFilter; soFar; ) {
                    (!matched || (match = rcomma.exec(soFar))) && (match && (soFar = soFar.slice(match[0].length) || soFar), 
                    groups.push(tokens = [])), matched = !1, (match = rcombinators.exec(soFar)) && (matched = match.shift(), 
                    tokens.push({
                        value: matched,
                        type: match[0].replace(rtrim, " ")
                    }), soFar = soFar.slice(matched.length));
                    for (type in Expr.filter) !(match = matchExpr[type].exec(soFar)) || preFilters[type] && !(match = preFilters[type](match)) || (matched = match.shift(), 
                    tokens.push({
                        value: matched,
                        type: type,
                        matches: match
                    }), soFar = soFar.slice(matched.length));
                    if (!matched) break;
                }
                return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : tokenCache(selector, groups).slice(0);
            }
            function toSelector(tokens) {
                for (var i = 0, len = tokens.length, selector = ""; len > i; i++) selector += tokens[i].value;
                return selector;
            }
            function addCombinator(matcher, combinator, base) {
                var dir = combinator.dir, checkNonElements = base && "parentNode" === dir, doneName = done++;
                return combinator.first ? function(elem, context, xml) {
                    for (;elem = elem[dir]; ) if (1 === elem.nodeType || checkNonElements) return matcher(elem, context, xml);
                } : function(elem, context, xml) {
                    var oldCache, outerCache, newCache = [ dirruns, doneName ];
                    if (xml) {
                        for (;elem = elem[dir]; ) if ((1 === elem.nodeType || checkNonElements) && matcher(elem, context, xml)) return !0;
                    } else for (;elem = elem[dir]; ) if (1 === elem.nodeType || checkNonElements) {
                        if (outerCache = elem[expando] || (elem[expando] = {}), (oldCache = outerCache[dir]) && oldCache[0] === dirruns && oldCache[1] === doneName) return newCache[2] = oldCache[2];
                        if (outerCache[dir] = newCache, newCache[2] = matcher(elem, context, xml)) return !0;
                    }
                };
            }
            function elementMatcher(matchers) {
                return matchers.length > 1 ? function(elem, context, xml) {
                    for (var i = matchers.length; i--; ) if (!matchers[i](elem, context, xml)) return !1;
                    return !0;
                } : matchers[0];
            }
            function condense(unmatched, map, filter, context, xml) {
                for (var elem, newUnmatched = [], i = 0, len = unmatched.length, mapped = null != map; len > i; i++) (elem = unmatched[i]) && (!filter || filter(elem, context, xml)) && (newUnmatched.push(elem), 
                mapped && map.push(i));
                return newUnmatched;
            }
            function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
                return postFilter && !postFilter[expando] && (postFilter = setMatcher(postFilter)), 
                postFinder && !postFinder[expando] && (postFinder = setMatcher(postFinder, postSelector)), 
                markFunction(function(seed, results, context, xml) {
                    var temp, i, elem, preMap = [], postMap = [], preexisting = results.length, elems = seed || multipleContexts(selector || "*", context.nodeType ? [ context ] : context, []), matcherIn = !preFilter || !seed && selector ? elems : condense(elems, preMap, preFilter, context, xml), matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : results : matcherIn;
                    if (matcher && matcher(matcherIn, matcherOut, context, xml), postFilter) for (temp = condense(matcherOut, postMap), 
                    postFilter(temp, [], context, xml), i = temp.length; i--; ) (elem = temp[i]) && (matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem));
                    if (seed) {
                        if (postFinder || preFilter) {
                            if (postFinder) {
                                for (temp = [], i = matcherOut.length; i--; ) (elem = matcherOut[i]) && temp.push(matcherIn[i] = elem);
                                postFinder(null, matcherOut = [], temp, xml);
                            }
                            for (i = matcherOut.length; i--; ) (elem = matcherOut[i]) && (temp = postFinder ? indexOf.call(seed, elem) : preMap[i]) > -1 && (seed[temp] = !(results[temp] = elem));
                        }
                    } else matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut), 
                    postFinder ? postFinder(null, results, matcherOut, xml) : push.apply(results, matcherOut);
                });
            }
            function matcherFromTokens(tokens) {
                for (var checkContext, matcher, j, len = tokens.length, leadingRelative = Expr.relative[tokens[0].type], implicitRelative = leadingRelative || Expr.relative[" "], i = leadingRelative ? 1 : 0, matchContext = addCombinator(function(elem) {
                    return elem === checkContext;
                }, implicitRelative, !0), matchAnyContext = addCombinator(function(elem) {
                    return indexOf.call(checkContext, elem) > -1;
                }, implicitRelative, !0), matchers = [ function(elem, context, xml) {
                    return !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
                } ]; len > i; i++) if (matcher = Expr.relative[tokens[i].type]) matchers = [ addCombinator(elementMatcher(matchers), matcher) ]; else {
                    if (matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches), matcher[expando]) {
                        for (j = ++i; len > j && !Expr.relative[tokens[j].type]; j++) ;
                        return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(tokens.slice(0, i - 1).concat({
                            value: " " === tokens[i - 2].type ? "*" : ""
                        })).replace(rtrim, "$1"), matcher, j > i && matcherFromTokens(tokens.slice(i, j)), len > j && matcherFromTokens(tokens = tokens.slice(j)), len > j && toSelector(tokens));
                    }
                    matchers.push(matcher);
                }
                return elementMatcher(matchers);
            }
            function matcherFromGroupMatchers(elementMatchers, setMatchers) {
                var bySet = setMatchers.length > 0, byElement = elementMatchers.length > 0, superMatcher = function(seed, context, xml, results, outermost) {
                    var elem, j, matcher, matchedCount = 0, i = "0", unmatched = seed && [], setMatched = [], contextBackup = outermostContext, elems = seed || byElement && Expr.find.TAG("*", outermost), dirrunsUnique = dirruns += null == contextBackup ? 1 : Math.random() || .1, len = elems.length;
                    for (outermost && (outermostContext = context !== document && context); i !== len && null != (elem = elems[i]); i++) {
                        if (byElement && elem) {
                            for (j = 0; matcher = elementMatchers[j++]; ) if (matcher(elem, context, xml)) {
                                results.push(elem);
                                break;
                            }
                            outermost && (dirruns = dirrunsUnique);
                        }
                        bySet && ((elem = !matcher && elem) && matchedCount--, seed && unmatched.push(elem));
                    }
                    if (matchedCount += i, bySet && i !== matchedCount) {
                        for (j = 0; matcher = setMatchers[j++]; ) matcher(unmatched, setMatched, context, xml);
                        if (seed) {
                            if (matchedCount > 0) for (;i--; ) unmatched[i] || setMatched[i] || (setMatched[i] = pop.call(results));
                            setMatched = condense(setMatched);
                        }
                        push.apply(results, setMatched), outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1 && Sizzle.uniqueSort(results);
                    }
                    return outermost && (dirruns = dirrunsUnique, outermostContext = contextBackup), 
                    unmatched;
                };
                return bySet ? markFunction(superMatcher) : superMatcher;
            }
            function multipleContexts(selector, contexts, results) {
                for (var i = 0, len = contexts.length; len > i; i++) Sizzle(selector, contexts[i], results);
                return results;
            }
            function select(selector, context, results, seed) {
                var i, tokens, token, type, find, match = tokenize(selector);
                if (!seed && 1 === match.length) {
                    if (tokens = match[0] = match[0].slice(0), tokens.length > 2 && "ID" === (token = tokens[0]).type && support.getById && 9 === context.nodeType && documentIsHTML && Expr.relative[tokens[1].type]) {
                        if (context = (Expr.find.ID(token.matches[0].replace(runescape, funescape), context) || [])[0], 
                        !context) return results;
                        selector = selector.slice(tokens.shift().value.length);
                    }
                    for (i = matchExpr.needsContext.test(selector) ? 0 : tokens.length; i-- && (token = tokens[i], 
                    !Expr.relative[type = token.type]); ) if ((find = Expr.find[type]) && (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context))) {
                        if (tokens.splice(i, 1), selector = seed.length && toSelector(tokens), !selector) return push.apply(results, seed), 
                        results;
                        break;
                    }
                }
                return compile(selector, match)(seed, context, !documentIsHTML, results, rsibling.test(selector) && testContext(context.parentNode) || context), 
                results;
            }
            var i, support, Expr, getText, isXML, compile, outermostContext, sortInput, hasDuplicate, setDocument, document, docElem, documentIsHTML, rbuggyQSA, rbuggyMatches, matches, contains, expando = "sizzle" + -new Date(), preferredDoc = window.document, dirruns = 0, done = 0, classCache = createCache(), tokenCache = createCache(), compilerCache = createCache(), sortOrder = function(a, b) {
                return a === b && (hasDuplicate = !0), 0;
            }, strundefined = "undefined", MAX_NEGATIVE = 1 << 31, hasOwn = {}.hasOwnProperty, arr = [], pop = arr.pop, push_native = arr.push, push = arr.push, slice = arr.slice, indexOf = arr.indexOf || function(elem) {
                for (var i = 0, len = this.length; len > i; i++) if (this[i] === elem) return i;
                return -1;
            }, booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", whitespace = "[\\x20\\t\\r\\n\\f]", characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", identifier = characterEncoding.replace("w", "w#"), attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace + "*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]", pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace(3, 8) + ")*)|.*)\\)|)", rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"), rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"), rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"), rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"), rpseudo = new RegExp(pseudos), ridentifier = new RegExp("^" + identifier + "$"), matchExpr = {
                ID: new RegExp("^#(" + characterEncoding + ")"),
                CLASS: new RegExp("^\\.(" + characterEncoding + ")"),
                TAG: new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
                ATTR: new RegExp("^" + attributes),
                PSEUDO: new RegExp("^" + pseudos),
                CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
                bool: new RegExp("^(?:" + booleans + ")$", "i"),
                needsContext: new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
            }, rinputs = /^(?:input|select|textarea|button)$/i, rheader = /^h\d$/i, rnative = /^[^{]+\{\s*\[native \w/, rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, rsibling = /[+~]/, rescape = /'|\\/g, runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"), funescape = function(_, escaped, escapedWhitespace) {
                var high = "0x" + escaped - 65536;
                return high !== high || escapedWhitespace ? escaped : 0 > high ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, 1023 & high | 56320);
            };
            try {
                push.apply(arr = slice.call(preferredDoc.childNodes), preferredDoc.childNodes), 
                arr[preferredDoc.childNodes.length].nodeType;
            } catch (e) {
                push = {
                    apply: arr.length ? function(target, els) {
                        push_native.apply(target, slice.call(els));
                    } : function(target, els) {
                        for (var j = target.length, i = 0; target[j++] = els[i++]; ) ;
                        target.length = j - 1;
                    }
                };
            }
            support = Sizzle.support = {}, isXML = Sizzle.isXML = function(elem) {
                var documentElement = elem && (elem.ownerDocument || elem).documentElement;
                return documentElement ? "HTML" !== documentElement.nodeName : !1;
            }, setDocument = Sizzle.setDocument = function(node) {
                var hasCompare, doc = node ? node.ownerDocument || node : preferredDoc, parent = doc.defaultView;
                return doc !== document && 9 === doc.nodeType && doc.documentElement ? (document = doc, 
                docElem = doc.documentElement, documentIsHTML = !isXML(doc), parent && parent !== parent.top && (parent.addEventListener ? parent.addEventListener("unload", function() {
                    setDocument();
                }, !1) : parent.attachEvent && parent.attachEvent("onunload", function() {
                    setDocument();
                })), support.attributes = assert(function(div) {
                    return div.className = "i", !div.getAttribute("className");
                }), support.getElementsByTagName = assert(function(div) {
                    return div.appendChild(doc.createComment("")), !div.getElementsByTagName("*").length;
                }), support.getElementsByClassName = rnative.test(doc.getElementsByClassName) && assert(function(div) {
                    return div.innerHTML = "<div class='a'></div><div class='a i'></div>", div.firstChild.className = "i", 
                    2 === div.getElementsByClassName("i").length;
                }), support.getById = assert(function(div) {
                    return docElem.appendChild(div).id = expando, !doc.getElementsByName || !doc.getElementsByName(expando).length;
                }), support.getById ? (Expr.find.ID = function(id, context) {
                    if (typeof context.getElementById !== strundefined && documentIsHTML) {
                        var m = context.getElementById(id);
                        return m && m.parentNode ? [ m ] : [];
                    }
                }, Expr.filter.ID = function(id) {
                    var attrId = id.replace(runescape, funescape);
                    return function(elem) {
                        return elem.getAttribute("id") === attrId;
                    };
                }) : (delete Expr.find.ID, Expr.filter.ID = function(id) {
                    var attrId = id.replace(runescape, funescape);
                    return function(elem) {
                        var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
                        return node && node.value === attrId;
                    };
                }), Expr.find.TAG = support.getElementsByTagName ? function(tag, context) {
                    return typeof context.getElementsByTagName !== strundefined ? context.getElementsByTagName(tag) : void 0;
                } : function(tag, context) {
                    var elem, tmp = [], i = 0, results = context.getElementsByTagName(tag);
                    if ("*" === tag) {
                        for (;elem = results[i++]; ) 1 === elem.nodeType && tmp.push(elem);
                        return tmp;
                    }
                    return results;
                }, Expr.find.CLASS = support.getElementsByClassName && function(className, context) {
                    return typeof context.getElementsByClassName !== strundefined && documentIsHTML ? context.getElementsByClassName(className) : void 0;
                }, rbuggyMatches = [], rbuggyQSA = [], (support.qsa = rnative.test(doc.querySelectorAll)) && (assert(function(div) {
                    div.innerHTML = "<select t=''><option selected=''></option></select>", div.querySelectorAll("[t^='']").length && rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")"), 
                    div.querySelectorAll("[selected]").length || rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")"), 
                    div.querySelectorAll(":checked").length || rbuggyQSA.push(":checked");
                }), assert(function(div) {
                    var input = doc.createElement("input");
                    input.setAttribute("type", "hidden"), div.appendChild(input).setAttribute("name", "D"), 
                    div.querySelectorAll("[name=d]").length && rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?="), 
                    div.querySelectorAll(":enabled").length || rbuggyQSA.push(":enabled", ":disabled"), 
                    div.querySelectorAll("*,:x"), rbuggyQSA.push(",.*:");
                })), (support.matchesSelector = rnative.test(matches = docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) && assert(function(div) {
                    support.disconnectedMatch = matches.call(div, "div"), matches.call(div, "[s!='']:x"), 
                    rbuggyMatches.push("!=", pseudos);
                }), rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|")), rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|")), 
                hasCompare = rnative.test(docElem.compareDocumentPosition), contains = hasCompare || rnative.test(docElem.contains) ? function(a, b) {
                    var adown = 9 === a.nodeType ? a.documentElement : a, bup = b && b.parentNode;
                    return a === bup || !(!bup || 1 !== bup.nodeType || !(adown.contains ? adown.contains(bup) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(bup)));
                } : function(a, b) {
                    if (b) for (;b = b.parentNode; ) if (b === a) return !0;
                    return !1;
                }, sortOrder = hasCompare ? function(a, b) {
                    if (a === b) return hasDuplicate = !0, 0;
                    var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
                    return compare ? compare : (compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 
                    1 & compare || !support.sortDetached && b.compareDocumentPosition(a) === compare ? a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ? -1 : b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ? 1 : sortInput ? indexOf.call(sortInput, a) - indexOf.call(sortInput, b) : 0 : 4 & compare ? -1 : 1);
                } : function(a, b) {
                    if (a === b) return hasDuplicate = !0, 0;
                    var cur, i = 0, aup = a.parentNode, bup = b.parentNode, ap = [ a ], bp = [ b ];
                    if (!aup || !bup) return a === doc ? -1 : b === doc ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf.call(sortInput, a) - indexOf.call(sortInput, b) : 0;
                    if (aup === bup) return siblingCheck(a, b);
                    for (cur = a; cur = cur.parentNode; ) ap.unshift(cur);
                    for (cur = b; cur = cur.parentNode; ) bp.unshift(cur);
                    for (;ap[i] === bp[i]; ) i++;
                    return i ? siblingCheck(ap[i], bp[i]) : ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
                }, doc) : document;
            }, Sizzle.matches = function(expr, elements) {
                return Sizzle(expr, null, null, elements);
            }, Sizzle.matchesSelector = function(elem, expr) {
                if ((elem.ownerDocument || elem) !== document && setDocument(elem), expr = expr.replace(rattributeQuotes, "='$1']"), 
                support.matchesSelector && documentIsHTML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) try {
                    var ret = matches.call(elem, expr);
                    if (ret || support.disconnectedMatch || elem.document && 11 !== elem.document.nodeType) return ret;
                } catch (e) {}
                return Sizzle(expr, document, null, [ elem ]).length > 0;
            }, Sizzle.contains = function(context, elem) {
                return (context.ownerDocument || context) !== document && setDocument(context), 
                contains(context, elem);
            }, Sizzle.attr = function(elem, name) {
                (elem.ownerDocument || elem) !== document && setDocument(elem);
                var fn = Expr.attrHandle[name.toLowerCase()], val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : void 0;
                return void 0 !== val ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
            }, Sizzle.error = function(msg) {
                throw new Error("Syntax error, unrecognized expression: " + msg);
            }, Sizzle.uniqueSort = function(results) {
                var elem, duplicates = [], j = 0, i = 0;
                if (hasDuplicate = !support.detectDuplicates, sortInput = !support.sortStable && results.slice(0), 
                results.sort(sortOrder), hasDuplicate) {
                    for (;elem = results[i++]; ) elem === results[i] && (j = duplicates.push(i));
                    for (;j--; ) results.splice(duplicates[j], 1);
                }
                return sortInput = null, results;
            }, getText = Sizzle.getText = function(elem) {
                var node, ret = "", i = 0, nodeType = elem.nodeType;
                if (nodeType) {
                    if (1 === nodeType || 9 === nodeType || 11 === nodeType) {
                        if ("string" == typeof elem.textContent) return elem.textContent;
                        for (elem = elem.firstChild; elem; elem = elem.nextSibling) ret += getText(elem);
                    } else if (3 === nodeType || 4 === nodeType) return elem.nodeValue;
                } else for (;node = elem[i++]; ) ret += getText(node);
                return ret;
            }, Expr = Sizzle.selectors = {
                cacheLength: 50,
                createPseudo: markFunction,
                match: matchExpr,
                attrHandle: {},
                find: {},
                relative: {
                    ">": {
                        dir: "parentNode",
                        first: !0
                    },
                    " ": {
                        dir: "parentNode"
                    },
                    "+": {
                        dir: "previousSibling",
                        first: !0
                    },
                    "~": {
                        dir: "previousSibling"
                    }
                },
                preFilter: {
                    ATTR: function(match) {
                        return match[1] = match[1].replace(runescape, funescape), match[3] = (match[4] || match[5] || "").replace(runescape, funescape), 
                        "~=" === match[2] && (match[3] = " " + match[3] + " "), match.slice(0, 4);
                    },
                    CHILD: function(match) {
                        return match[1] = match[1].toLowerCase(), "nth" === match[1].slice(0, 3) ? (match[3] || Sizzle.error(match[0]), 
                        match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * ("even" === match[3] || "odd" === match[3])), 
                        match[5] = +(match[7] + match[8] || "odd" === match[3])) : match[3] && Sizzle.error(match[0]), 
                        match;
                    },
                    PSEUDO: function(match) {
                        var excess, unquoted = !match[5] && match[2];
                        return matchExpr.CHILD.test(match[0]) ? null : (match[3] && void 0 !== match[4] ? match[2] = match[4] : unquoted && rpseudo.test(unquoted) && (excess = tokenize(unquoted, !0)) && (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length) && (match[0] = match[0].slice(0, excess), 
                        match[2] = unquoted.slice(0, excess)), match.slice(0, 3));
                    }
                },
                filter: {
                    TAG: function(nodeNameSelector) {
                        var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                        return "*" === nodeNameSelector ? function() {
                            return !0;
                        } : function(elem) {
                            return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                        };
                    },
                    CLASS: function(className) {
                        var pattern = classCache[className + " "];
                        return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
                            return pattern.test("string" == typeof elem.className && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "");
                        });
                    },
                    ATTR: function(name, operator, check) {
                        return function(elem) {
                            var result = Sizzle.attr(elem, name);
                            return null == result ? "!=" === operator : operator ? (result += "", "=" === operator ? result === check : "!=" === operator ? result !== check : "^=" === operator ? check && 0 === result.indexOf(check) : "*=" === operator ? check && result.indexOf(check) > -1 : "$=" === operator ? check && result.slice(-check.length) === check : "~=" === operator ? (" " + result + " ").indexOf(check) > -1 : "|=" === operator ? result === check || result.slice(0, check.length + 1) === check + "-" : !1) : !0;
                        };
                    },
                    CHILD: function(type, what, argument, first, last) {
                        var simple = "nth" !== type.slice(0, 3), forward = "last" !== type.slice(-4), ofType = "of-type" === what;
                        return 1 === first && 0 === last ? function(elem) {
                            return !!elem.parentNode;
                        } : function(elem, context, xml) {
                            var cache, outerCache, node, diff, nodeIndex, start, dir = simple !== forward ? "nextSibling" : "previousSibling", parent = elem.parentNode, name = ofType && elem.nodeName.toLowerCase(), useCache = !xml && !ofType;
                            if (parent) {
                                if (simple) {
                                    for (;dir; ) {
                                        for (node = elem; node = node[dir]; ) if (ofType ? node.nodeName.toLowerCase() === name : 1 === node.nodeType) return !1;
                                        start = dir = "only" === type && !start && "nextSibling";
                                    }
                                    return !0;
                                }
                                if (start = [ forward ? parent.firstChild : parent.lastChild ], forward && useCache) {
                                    for (outerCache = parent[expando] || (parent[expando] = {}), cache = outerCache[type] || [], 
                                    nodeIndex = cache[0] === dirruns && cache[1], diff = cache[0] === dirruns && cache[2], 
                                    node = nodeIndex && parent.childNodes[nodeIndex]; node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop(); ) if (1 === node.nodeType && ++diff && node === elem) {
                                        outerCache[type] = [ dirruns, nodeIndex, diff ];
                                        break;
                                    }
                                } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) diff = cache[1]; else for (;(node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) && ((ofType ? node.nodeName.toLowerCase() !== name : 1 !== node.nodeType) || !++diff || (useCache && ((node[expando] || (node[expando] = {}))[type] = [ dirruns, diff ]), 
                                node !== elem)); ) ;
                                return diff -= last, diff === first || diff % first === 0 && diff / first >= 0;
                            }
                        };
                    },
                    PSEUDO: function(pseudo, argument) {
                        var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo);
                        return fn[expando] ? fn(argument) : fn.length > 1 ? (args = [ pseudo, pseudo, "", argument ], 
                        Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function(seed, matches) {
                            for (var idx, matched = fn(seed, argument), i = matched.length; i--; ) idx = indexOf.call(seed, matched[i]), 
                            seed[idx] = !(matches[idx] = matched[i]);
                        }) : function(elem) {
                            return fn(elem, 0, args);
                        }) : fn;
                    }
                },
                pseudos: {
                    not: markFunction(function(selector) {
                        var input = [], results = [], matcher = compile(selector.replace(rtrim, "$1"));
                        return matcher[expando] ? markFunction(function(seed, matches, context, xml) {
                            for (var elem, unmatched = matcher(seed, null, xml, []), i = seed.length; i--; ) (elem = unmatched[i]) && (seed[i] = !(matches[i] = elem));
                        }) : function(elem, context, xml) {
                            return input[0] = elem, matcher(input, null, xml, results), !results.pop();
                        };
                    }),
                    has: markFunction(function(selector) {
                        return function(elem) {
                            return Sizzle(selector, elem).length > 0;
                        };
                    }),
                    contains: markFunction(function(text) {
                        return function(elem) {
                            return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
                        };
                    }),
                    lang: markFunction(function(lang) {
                        return ridentifier.test(lang || "") || Sizzle.error("unsupported lang: " + lang), 
                        lang = lang.replace(runescape, funescape).toLowerCase(), function(elem) {
                            var elemLang;
                            do if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) return elemLang = elemLang.toLowerCase(), 
                            elemLang === lang || 0 === elemLang.indexOf(lang + "-"); while ((elem = elem.parentNode) && 1 === elem.nodeType);
                            return !1;
                        };
                    }),
                    target: function(elem) {
                        var hash = window.location && window.location.hash;
                        return hash && hash.slice(1) === elem.id;
                    },
                    root: function(elem) {
                        return elem === docElem;
                    },
                    focus: function(elem) {
                        return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
                    },
                    enabled: function(elem) {
                        return elem.disabled === !1;
                    },
                    disabled: function(elem) {
                        return elem.disabled === !0;
                    },
                    checked: function(elem) {
                        var nodeName = elem.nodeName.toLowerCase();
                        return "input" === nodeName && !!elem.checked || "option" === nodeName && !!elem.selected;
                    },
                    selected: function(elem) {
                        return elem.parentNode && elem.parentNode.selectedIndex, elem.selected === !0;
                    },
                    empty: function(elem) {
                        for (elem = elem.firstChild; elem; elem = elem.nextSibling) if (elem.nodeType < 6) return !1;
                        return !0;
                    },
                    parent: function(elem) {
                        return !Expr.pseudos.empty(elem);
                    },
                    header: function(elem) {
                        return rheader.test(elem.nodeName);
                    },
                    input: function(elem) {
                        return rinputs.test(elem.nodeName);
                    },
                    button: function(elem) {
                        var name = elem.nodeName.toLowerCase();
                        return "input" === name && "button" === elem.type || "button" === name;
                    },
                    text: function(elem) {
                        var attr;
                        return "input" === elem.nodeName.toLowerCase() && "text" === elem.type && (null == (attr = elem.getAttribute("type")) || "text" === attr.toLowerCase());
                    },
                    first: createPositionalPseudo(function() {
                        return [ 0 ];
                    }),
                    last: createPositionalPseudo(function(matchIndexes, length) {
                        return [ length - 1 ];
                    }),
                    eq: createPositionalPseudo(function(matchIndexes, length, argument) {
                        return [ 0 > argument ? argument + length : argument ];
                    }),
                    even: createPositionalPseudo(function(matchIndexes, length) {
                        for (var i = 0; length > i; i += 2) matchIndexes.push(i);
                        return matchIndexes;
                    }),
                    odd: createPositionalPseudo(function(matchIndexes, length) {
                        for (var i = 1; length > i; i += 2) matchIndexes.push(i);
                        return matchIndexes;
                    }),
                    lt: createPositionalPseudo(function(matchIndexes, length, argument) {
                        for (var i = 0 > argument ? argument + length : argument; --i >= 0; ) matchIndexes.push(i);
                        return matchIndexes;
                    }),
                    gt: createPositionalPseudo(function(matchIndexes, length, argument) {
                        for (var i = 0 > argument ? argument + length : argument; ++i < length; ) matchIndexes.push(i);
                        return matchIndexes;
                    })
                }
            }, Expr.pseudos.nth = Expr.pseudos.eq;
            for (i in {
                radio: !0,
                checkbox: !0,
                file: !0,
                password: !0,
                image: !0
            }) Expr.pseudos[i] = createInputPseudo(i);
            for (i in {
                submit: !0,
                reset: !0
            }) Expr.pseudos[i] = createButtonPseudo(i);
            return setFilters.prototype = Expr.filters = Expr.pseudos, Expr.setFilters = new setFilters(), 
            compile = Sizzle.compile = function(selector, group) {
                var i, setMatchers = [], elementMatchers = [], cached = compilerCache[selector + " "];
                if (!cached) {
                    for (group || (group = tokenize(selector)), i = group.length; i--; ) cached = matcherFromTokens(group[i]), 
                    cached[expando] ? setMatchers.push(cached) : elementMatchers.push(cached);
                    cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
                }
                return cached;
            }, support.sortStable = expando.split("").sort(sortOrder).join("") === expando, 
            support.detectDuplicates = !!hasDuplicate, setDocument(), support.sortDetached = assert(function(div1) {
                return 1 & div1.compareDocumentPosition(document.createElement("div"));
            }), assert(function(div) {
                return div.innerHTML = "<a href='#'></a>", "#" === div.firstChild.getAttribute("href");
            }) || addHandle("type|href|height|width", function(elem, name, isXML) {
                return isXML ? void 0 : elem.getAttribute(name, "type" === name.toLowerCase() ? 1 : 2);
            }), support.attributes && assert(function(div) {
                return div.innerHTML = "<input/>", div.firstChild.setAttribute("value", ""), "" === div.firstChild.getAttribute("value");
            }) || addHandle("value", function(elem, name, isXML) {
                return isXML || "input" !== elem.nodeName.toLowerCase() ? void 0 : elem.defaultValue;
            }), assert(function(div) {
                return null == div.getAttribute("disabled");
            }) || addHandle(booleans, function(elem, name, isXML) {
                var val;
                return isXML ? void 0 : elem[name] === !0 ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
            }), Sizzle;
        }(window);
        jQuery.find = Sizzle, jQuery.expr = Sizzle.selectors, jQuery.expr[":"] = jQuery.expr.pseudos, 
        jQuery.unique = Sizzle.uniqueSort, jQuery.text = Sizzle.getText, jQuery.isXMLDoc = Sizzle.isXML, 
        jQuery.contains = Sizzle.contains;
        var rneedsContext = jQuery.expr.match.needsContext, rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, risSimple = /^.[^:#\[\.,]*$/;
        jQuery.filter = function(expr, elems, not) {
            var elem = elems[0];
            return not && (expr = ":not(" + expr + ")"), 1 === elems.length && 1 === elem.nodeType ? jQuery.find.matchesSelector(elem, expr) ? [ elem ] : [] : jQuery.find.matches(expr, jQuery.grep(elems, function(elem) {
                return 1 === elem.nodeType;
            }));
        }, jQuery.fn.extend({
            find: function(selector) {
                var i, len = this.length, ret = [], self = this;
                if ("string" != typeof selector) return this.pushStack(jQuery(selector).filter(function() {
                    for (i = 0; len > i; i++) if (jQuery.contains(self[i], this)) return !0;
                }));
                for (i = 0; len > i; i++) jQuery.find(selector, self[i], ret);
                return ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret), ret.selector = this.selector ? this.selector + " " + selector : selector, 
                ret;
            },
            filter: function(selector) {
                return this.pushStack(winnow(this, selector || [], !1));
            },
            not: function(selector) {
                return this.pushStack(winnow(this, selector || [], !0));
            },
            is: function(selector) {
                return !!winnow(this, "string" == typeof selector && rneedsContext.test(selector) ? jQuery(selector) : selector || [], !1).length;
            }
        });
        var rootjQuery, rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, init = jQuery.fn.init = function(selector, context) {
            var match, elem;
            if (!selector) return this;
            if ("string" == typeof selector) {
                if (match = "<" === selector[0] && ">" === selector[selector.length - 1] && selector.length >= 3 ? [ null, selector, null ] : rquickExpr.exec(selector), 
                !match || !match[1] && context) return !context || context.jquery ? (context || rootjQuery).find(selector) : this.constructor(context).find(selector);
                if (match[1]) {
                    if (context = context instanceof jQuery ? context[0] : context, jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, !0)), 
                    rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) for (match in context) jQuery.isFunction(this[match]) ? this[match](context[match]) : this.attr(match, context[match]);
                    return this;
                }
                return elem = document.getElementById(match[2]), elem && elem.parentNode && (this.length = 1, 
                this[0] = elem), this.context = document, this.selector = selector, this;
            }
            return selector.nodeType ? (this.context = this[0] = selector, this.length = 1, 
            this) : jQuery.isFunction(selector) ? "undefined" != typeof rootjQuery.ready ? rootjQuery.ready(selector) : selector(jQuery) : (void 0 !== selector.selector && (this.selector = selector.selector, 
            this.context = selector.context), jQuery.makeArray(selector, this));
        };
        init.prototype = jQuery.fn, rootjQuery = jQuery(document);
        var rparentsprev = /^(?:parents|prev(?:Until|All))/, guaranteedUnique = {
            children: !0,
            contents: !0,
            next: !0,
            prev: !0
        };
        jQuery.extend({
            dir: function(elem, dir, until) {
                for (var matched = [], truncate = void 0 !== until; (elem = elem[dir]) && 9 !== elem.nodeType; ) if (1 === elem.nodeType) {
                    if (truncate && jQuery(elem).is(until)) break;
                    matched.push(elem);
                }
                return matched;
            },
            sibling: function(n, elem) {
                for (var matched = []; n; n = n.nextSibling) 1 === n.nodeType && n !== elem && matched.push(n);
                return matched;
            }
        }), jQuery.fn.extend({
            has: function(target) {
                var targets = jQuery(target, this), l = targets.length;
                return this.filter(function() {
                    for (var i = 0; l > i; i++) if (jQuery.contains(this, targets[i])) return !0;
                });
            },
            closest: function(selectors, context) {
                for (var cur, i = 0, l = this.length, matched = [], pos = rneedsContext.test(selectors) || "string" != typeof selectors ? jQuery(selectors, context || this.context) : 0; l > i; i++) for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) if (cur.nodeType < 11 && (pos ? pos.index(cur) > -1 : 1 === cur.nodeType && jQuery.find.matchesSelector(cur, selectors))) {
                    matched.push(cur);
                    break;
                }
                return this.pushStack(matched.length > 1 ? jQuery.unique(matched) : matched);
            },
            index: function(elem) {
                return elem ? "string" == typeof elem ? indexOf.call(jQuery(elem), this[0]) : indexOf.call(this, elem.jquery ? elem[0] : elem) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
            },
            add: function(selector, context) {
                return this.pushStack(jQuery.unique(jQuery.merge(this.get(), jQuery(selector, context))));
            },
            addBack: function(selector) {
                return this.add(null == selector ? this.prevObject : this.prevObject.filter(selector));
            }
        }), jQuery.each({
            parent: function(elem) {
                var parent = elem.parentNode;
                return parent && 11 !== parent.nodeType ? parent : null;
            },
            parents: function(elem) {
                return jQuery.dir(elem, "parentNode");
            },
            parentsUntil: function(elem, i, until) {
                return jQuery.dir(elem, "parentNode", until);
            },
            next: function(elem) {
                return sibling(elem, "nextSibling");
            },
            prev: function(elem) {
                return sibling(elem, "previousSibling");
            },
            nextAll: function(elem) {
                return jQuery.dir(elem, "nextSibling");
            },
            prevAll: function(elem) {
                return jQuery.dir(elem, "previousSibling");
            },
            nextUntil: function(elem, i, until) {
                return jQuery.dir(elem, "nextSibling", until);
            },
            prevUntil: function(elem, i, until) {
                return jQuery.dir(elem, "previousSibling", until);
            },
            siblings: function(elem) {
                return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
            },
            children: function(elem) {
                return jQuery.sibling(elem.firstChild);
            },
            contents: function(elem) {
                return elem.contentDocument || jQuery.merge([], elem.childNodes);
            }
        }, function(name, fn) {
            jQuery.fn[name] = function(until, selector) {
                var matched = jQuery.map(this, fn, until);
                return "Until" !== name.slice(-5) && (selector = until), selector && "string" == typeof selector && (matched = jQuery.filter(selector, matched)), 
                this.length > 1 && (guaranteedUnique[name] || jQuery.unique(matched), rparentsprev.test(name) && matched.reverse()), 
                this.pushStack(matched);
            };
        });
        var rnotwhite = /\S+/g, optionsCache = {};
        jQuery.Callbacks = function(options) {
            options = "string" == typeof options ? optionsCache[options] || createOptions(options) : jQuery.extend({}, options);
            var memory, fired, firing, firingStart, firingLength, firingIndex, list = [], stack = !options.once && [], fire = function(data) {
                for (memory = options.memory && data, fired = !0, firingIndex = firingStart || 0, 
                firingStart = 0, firingLength = list.length, firing = !0; list && firingLength > firingIndex; firingIndex++) if (list[firingIndex].apply(data[0], data[1]) === !1 && options.stopOnFalse) {
                    memory = !1;
                    break;
                }
                firing = !1, list && (stack ? stack.length && fire(stack.shift()) : memory ? list = [] : self.disable());
            }, self = {
                add: function() {
                    if (list) {
                        var start = list.length;
                        !function add(args) {
                            jQuery.each(args, function(_, arg) {
                                var type = jQuery.type(arg);
                                "function" === type ? options.unique && self.has(arg) || list.push(arg) : arg && arg.length && "string" !== type && add(arg);
                            });
                        }(arguments), firing ? firingLength = list.length : memory && (firingStart = start, 
                        fire(memory));
                    }
                    return this;
                },
                remove: function() {
                    return list && jQuery.each(arguments, function(_, arg) {
                        for (var index; (index = jQuery.inArray(arg, list, index)) > -1; ) list.splice(index, 1), 
                        firing && (firingLength >= index && firingLength--, firingIndex >= index && firingIndex--);
                    }), this;
                },
                has: function(fn) {
                    return fn ? jQuery.inArray(fn, list) > -1 : !(!list || !list.length);
                },
                empty: function() {
                    return list = [], firingLength = 0, this;
                },
                disable: function() {
                    return list = stack = memory = void 0, this;
                },
                disabled: function() {
                    return !list;
                },
                lock: function() {
                    return stack = void 0, memory || self.disable(), this;
                },
                locked: function() {
                    return !stack;
                },
                fireWith: function(context, args) {
                    return !list || fired && !stack || (args = args || [], args = [ context, args.slice ? args.slice() : args ], 
                    firing ? stack.push(args) : fire(args)), this;
                },
                fire: function() {
                    return self.fireWith(this, arguments), this;
                },
                fired: function() {
                    return !!fired;
                }
            };
            return self;
        }, jQuery.extend({
            Deferred: function(func) {
                var tuples = [ [ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ], [ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ], [ "notify", "progress", jQuery.Callbacks("memory") ] ], state = "pending", promise = {
                    state: function() {
                        return state;
                    },
                    always: function() {
                        return deferred.done(arguments).fail(arguments), this;
                    },
                    then: function() {
                        var fns = arguments;
                        return jQuery.Deferred(function(newDefer) {
                            jQuery.each(tuples, function(i, tuple) {
                                var fn = jQuery.isFunction(fns[i]) && fns[i];
                                deferred[tuple[1]](function() {
                                    var returned = fn && fn.apply(this, arguments);
                                    returned && jQuery.isFunction(returned.promise) ? returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify) : newDefer[tuple[0] + "With"](this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments);
                                });
                            }), fns = null;
                        }).promise();
                    },
                    promise: function(obj) {
                        return null != obj ? jQuery.extend(obj, promise) : promise;
                    }
                }, deferred = {};
                return promise.pipe = promise.then, jQuery.each(tuples, function(i, tuple) {
                    var list = tuple[2], stateString = tuple[3];
                    promise[tuple[1]] = list.add, stateString && list.add(function() {
                        state = stateString;
                    }, tuples[1 ^ i][2].disable, tuples[2][2].lock), deferred[tuple[0]] = function() {
                        return deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments), 
                        this;
                    }, deferred[tuple[0] + "With"] = list.fireWith;
                }), promise.promise(deferred), func && func.call(deferred, deferred), deferred;
            },
            when: function(subordinate) {
                var progressValues, progressContexts, resolveContexts, i = 0, resolveValues = slice.call(arguments), length = resolveValues.length, remaining = 1 !== length || subordinate && jQuery.isFunction(subordinate.promise) ? length : 0, deferred = 1 === remaining ? subordinate : jQuery.Deferred(), updateFunc = function(i, contexts, values) {
                    return function(value) {
                        contexts[i] = this, values[i] = arguments.length > 1 ? slice.call(arguments) : value, 
                        values === progressValues ? deferred.notifyWith(contexts, values) : --remaining || deferred.resolveWith(contexts, values);
                    };
                };
                if (length > 1) for (progressValues = new Array(length), progressContexts = new Array(length), 
                resolveContexts = new Array(length); length > i; i++) resolveValues[i] && jQuery.isFunction(resolveValues[i].promise) ? resolveValues[i].promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues)) : --remaining;
                return remaining || deferred.resolveWith(resolveContexts, resolveValues), deferred.promise();
            }
        });
        var readyList;
        jQuery.fn.ready = function(fn) {
            return jQuery.ready.promise().done(fn), this;
        }, jQuery.extend({
            isReady: !1,
            readyWait: 1,
            holdReady: function(hold) {
                hold ? jQuery.readyWait++ : jQuery.ready(!0);
            },
            ready: function(wait) {
                (wait === !0 ? --jQuery.readyWait : jQuery.isReady) || (jQuery.isReady = !0, wait !== !0 && --jQuery.readyWait > 0 || (readyList.resolveWith(document, [ jQuery ]), 
                jQuery.fn.trigger && jQuery(document).trigger("ready").off("ready")));
            }
        }), jQuery.ready.promise = function(obj) {
            return readyList || (readyList = jQuery.Deferred(), "complete" === document.readyState ? setTimeout(jQuery.ready) : (document.addEventListener("DOMContentLoaded", completed, !1), 
            window.addEventListener("load", completed, !1))), readyList.promise(obj);
        }, jQuery.ready.promise();
        var access = jQuery.access = function(elems, fn, key, value, chainable, emptyGet, raw) {
            var i = 0, len = elems.length, bulk = null == key;
            if ("object" === jQuery.type(key)) {
                chainable = !0;
                for (i in key) jQuery.access(elems, fn, i, key[i], !0, emptyGet, raw);
            } else if (void 0 !== value && (chainable = !0, jQuery.isFunction(value) || (raw = !0), 
            bulk && (raw ? (fn.call(elems, value), fn = null) : (bulk = fn, fn = function(elem, key, value) {
                return bulk.call(jQuery(elem), value);
            })), fn)) for (;len > i; i++) fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
            return chainable ? elems : bulk ? fn.call(elems) : len ? fn(elems[0], key) : emptyGet;
        };
        jQuery.acceptData = function(owner) {
            return 1 === owner.nodeType || 9 === owner.nodeType || !+owner.nodeType;
        }, Data.uid = 1, Data.accepts = jQuery.acceptData, Data.prototype = {
            key: function(owner) {
                if (!Data.accepts(owner)) return 0;
                var descriptor = {}, unlock = owner[this.expando];
                if (!unlock) {
                    unlock = Data.uid++;
                    try {
                        descriptor[this.expando] = {
                            value: unlock
                        }, Object.defineProperties(owner, descriptor);
                    } catch (e) {
                        descriptor[this.expando] = unlock, jQuery.extend(owner, descriptor);
                    }
                }
                return this.cache[unlock] || (this.cache[unlock] = {}), unlock;
            },
            set: function(owner, data, value) {
                var prop, unlock = this.key(owner), cache = this.cache[unlock];
                if ("string" == typeof data) cache[data] = value; else if (jQuery.isEmptyObject(cache)) jQuery.extend(this.cache[unlock], data); else for (prop in data) cache[prop] = data[prop];
                return cache;
            },
            get: function(owner, key) {
                var cache = this.cache[this.key(owner)];
                return void 0 === key ? cache : cache[key];
            },
            access: function(owner, key, value) {
                var stored;
                return void 0 === key || key && "string" == typeof key && void 0 === value ? (stored = this.get(owner, key), 
                void 0 !== stored ? stored : this.get(owner, jQuery.camelCase(key))) : (this.set(owner, key, value), 
                void 0 !== value ? value : key);
            },
            remove: function(owner, key) {
                var i, name, camel, unlock = this.key(owner), cache = this.cache[unlock];
                if (void 0 === key) this.cache[unlock] = {}; else {
                    jQuery.isArray(key) ? name = key.concat(key.map(jQuery.camelCase)) : (camel = jQuery.camelCase(key), 
                    key in cache ? name = [ key, camel ] : (name = camel, name = name in cache ? [ name ] : name.match(rnotwhite) || [])), 
                    i = name.length;
                    for (;i--; ) delete cache[name[i]];
                }
            },
            hasData: function(owner) {
                return !jQuery.isEmptyObject(this.cache[owner[this.expando]] || {});
            },
            discard: function(owner) {
                owner[this.expando] && delete this.cache[owner[this.expando]];
            }
        };
        var data_priv = new Data(), data_user = new Data(), rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, rmultiDash = /([A-Z])/g;
        jQuery.extend({
            hasData: function(elem) {
                return data_user.hasData(elem) || data_priv.hasData(elem);
            },
            data: function(elem, name, data) {
                return data_user.access(elem, name, data);
            },
            removeData: function(elem, name) {
                data_user.remove(elem, name);
            },
            _data: function(elem, name, data) {
                return data_priv.access(elem, name, data);
            },
            _removeData: function(elem, name) {
                data_priv.remove(elem, name);
            }
        }), jQuery.fn.extend({
            data: function(key, value) {
                var i, name, data, elem = this[0], attrs = elem && elem.attributes;
                if (void 0 === key) {
                    if (this.length && (data = data_user.get(elem), 1 === elem.nodeType && !data_priv.get(elem, "hasDataAttrs"))) {
                        for (i = attrs.length; i--; ) name = attrs[i].name, 0 === name.indexOf("data-") && (name = jQuery.camelCase(name.slice(5)), 
                        dataAttr(elem, name, data[name]));
                        data_priv.set(elem, "hasDataAttrs", !0);
                    }
                    return data;
                }
                return "object" == typeof key ? this.each(function() {
                    data_user.set(this, key);
                }) : access(this, function(value) {
                    var data, camelKey = jQuery.camelCase(key);
                    if (elem && void 0 === value) {
                        if (data = data_user.get(elem, key), void 0 !== data) return data;
                        if (data = data_user.get(elem, camelKey), void 0 !== data) return data;
                        if (data = dataAttr(elem, camelKey, void 0), void 0 !== data) return data;
                    } else this.each(function() {
                        var data = data_user.get(this, camelKey);
                        data_user.set(this, camelKey, value), -1 !== key.indexOf("-") && void 0 !== data && data_user.set(this, key, value);
                    });
                }, null, value, arguments.length > 1, null, !0);
            },
            removeData: function(key) {
                return this.each(function() {
                    data_user.remove(this, key);
                });
            }
        }), jQuery.extend({
            queue: function(elem, type, data) {
                var queue;
                return elem ? (type = (type || "fx") + "queue", queue = data_priv.get(elem, type), 
                data && (!queue || jQuery.isArray(data) ? queue = data_priv.access(elem, type, jQuery.makeArray(data)) : queue.push(data)), 
                queue || []) : void 0;
            },
            dequeue: function(elem, type) {
                type = type || "fx";
                var queue = jQuery.queue(elem, type), startLength = queue.length, fn = queue.shift(), hooks = jQuery._queueHooks(elem, type), next = function() {
                    jQuery.dequeue(elem, type);
                };
                "inprogress" === fn && (fn = queue.shift(), startLength--), fn && ("fx" === type && queue.unshift("inprogress"), 
                delete hooks.stop, fn.call(elem, next, hooks)), !startLength && hooks && hooks.empty.fire();
            },
            _queueHooks: function(elem, type) {
                var key = type + "queueHooks";
                return data_priv.get(elem, key) || data_priv.access(elem, key, {
                    empty: jQuery.Callbacks("once memory").add(function() {
                        data_priv.remove(elem, [ type + "queue", key ]);
                    })
                });
            }
        }), jQuery.fn.extend({
            queue: function(type, data) {
                var setter = 2;
                return "string" != typeof type && (data = type, type = "fx", setter--), arguments.length < setter ? jQuery.queue(this[0], type) : void 0 === data ? this : this.each(function() {
                    var queue = jQuery.queue(this, type, data);
                    jQuery._queueHooks(this, type), "fx" === type && "inprogress" !== queue[0] && jQuery.dequeue(this, type);
                });
            },
            dequeue: function(type) {
                return this.each(function() {
                    jQuery.dequeue(this, type);
                });
            },
            clearQueue: function(type) {
                return this.queue(type || "fx", []);
            },
            promise: function(type, obj) {
                var tmp, count = 1, defer = jQuery.Deferred(), elements = this, i = this.length, resolve = function() {
                    --count || defer.resolveWith(elements, [ elements ]);
                };
                for ("string" != typeof type && (obj = type, type = void 0), type = type || "fx"; i--; ) tmp = data_priv.get(elements[i], type + "queueHooks"), 
                tmp && tmp.empty && (count++, tmp.empty.add(resolve));
                return resolve(), defer.promise(obj);
            }
        });
        var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, cssExpand = [ "Top", "Right", "Bottom", "Left" ], isHidden = function(elem, el) {
            return elem = el || elem, "none" === jQuery.css(elem, "display") || !jQuery.contains(elem.ownerDocument, elem);
        }, rcheckableType = /^(?:checkbox|radio)$/i;
        !function() {
            var fragment = document.createDocumentFragment(), div = fragment.appendChild(document.createElement("div"));
            div.innerHTML = "<input type='radio' checked='checked' name='t'/>", support.checkClone = div.cloneNode(!0).cloneNode(!0).lastChild.checked, 
            div.innerHTML = "<textarea>x</textarea>", support.noCloneChecked = !!div.cloneNode(!0).lastChild.defaultValue;
        }();
        var strundefined = "undefined";
        support.focusinBubbles = "onfocusin" in window;
        var rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|contextmenu)|click/, rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;
        jQuery.event = {
            global: {},
            add: function(elem, types, handler, data, selector) {
                var handleObjIn, eventHandle, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = data_priv.get(elem);
                if (elemData) for (handler.handler && (handleObjIn = handler, handler = handleObjIn.handler, 
                selector = handleObjIn.selector), handler.guid || (handler.guid = jQuery.guid++), 
                (events = elemData.events) || (events = elemData.events = {}), (eventHandle = elemData.handle) || (eventHandle = elemData.handle = function(e) {
                    return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ? jQuery.event.dispatch.apply(elem, arguments) : void 0;
                }), types = (types || "").match(rnotwhite) || [ "" ], t = types.length; t--; ) tmp = rtypenamespace.exec(types[t]) || [], 
                type = origType = tmp[1], namespaces = (tmp[2] || "").split(".").sort(), type && (special = jQuery.event.special[type] || {}, 
                type = (selector ? special.delegateType : special.bindType) || type, special = jQuery.event.special[type] || {}, 
                handleObj = jQuery.extend({
                    type: type,
                    origType: origType,
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector,
                    needsContext: selector && jQuery.expr.match.needsContext.test(selector),
                    namespace: namespaces.join(".")
                }, handleObjIn), (handlers = events[type]) || (handlers = events[type] = [], handlers.delegateCount = 0, 
                special.setup && special.setup.call(elem, data, namespaces, eventHandle) !== !1 || elem.addEventListener && elem.addEventListener(type, eventHandle, !1)), 
                special.add && (special.add.call(elem, handleObj), handleObj.handler.guid || (handleObj.handler.guid = handler.guid)), 
                selector ? handlers.splice(handlers.delegateCount++, 0, handleObj) : handlers.push(handleObj), 
                jQuery.event.global[type] = !0);
            },
            remove: function(elem, types, handler, selector, mappedTypes) {
                var j, origCount, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = data_priv.hasData(elem) && data_priv.get(elem);
                if (elemData && (events = elemData.events)) {
                    for (types = (types || "").match(rnotwhite) || [ "" ], t = types.length; t--; ) if (tmp = rtypenamespace.exec(types[t]) || [], 
                    type = origType = tmp[1], namespaces = (tmp[2] || "").split(".").sort(), type) {
                        for (special = jQuery.event.special[type] || {}, type = (selector ? special.delegateType : special.bindType) || type, 
                        handlers = events[type] || [], tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)"), 
                        origCount = j = handlers.length; j--; ) handleObj = handlers[j], !mappedTypes && origType !== handleObj.origType || handler && handler.guid !== handleObj.guid || tmp && !tmp.test(handleObj.namespace) || selector && selector !== handleObj.selector && ("**" !== selector || !handleObj.selector) || (handlers.splice(j, 1), 
                        handleObj.selector && handlers.delegateCount--, special.remove && special.remove.call(elem, handleObj));
                        origCount && !handlers.length && (special.teardown && special.teardown.call(elem, namespaces, elemData.handle) !== !1 || jQuery.removeEvent(elem, type, elemData.handle), 
                        delete events[type]);
                    } else for (type in events) jQuery.event.remove(elem, type + types[t], handler, selector, !0);
                    jQuery.isEmptyObject(events) && (delete elemData.handle, data_priv.remove(elem, "events"));
                }
            },
            trigger: function(event, data, elem, onlyHandlers) {
                var i, cur, tmp, bubbleType, ontype, handle, special, eventPath = [ elem || document ], type = hasOwn.call(event, "type") ? event.type : event, namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
                if (cur = tmp = elem = elem || document, 3 !== elem.nodeType && 8 !== elem.nodeType && !rfocusMorph.test(type + jQuery.event.triggered) && (type.indexOf(".") >= 0 && (namespaces = type.split("."), 
                type = namespaces.shift(), namespaces.sort()), ontype = type.indexOf(":") < 0 && "on" + type, 
                event = event[jQuery.expando] ? event : new jQuery.Event(type, "object" == typeof event && event), 
                event.isTrigger = onlyHandlers ? 2 : 3, event.namespace = namespaces.join("."), 
                event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, 
                event.result = void 0, event.target || (event.target = elem), data = null == data ? [ event ] : jQuery.makeArray(data, [ event ]), 
                special = jQuery.event.special[type] || {}, onlyHandlers || !special.trigger || special.trigger.apply(elem, data) !== !1)) {
                    if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {
                        for (bubbleType = special.delegateType || type, rfocusMorph.test(bubbleType + type) || (cur = cur.parentNode); cur; cur = cur.parentNode) eventPath.push(cur), 
                        tmp = cur;
                        tmp === (elem.ownerDocument || document) && eventPath.push(tmp.defaultView || tmp.parentWindow || window);
                    }
                    for (i = 0; (cur = eventPath[i++]) && !event.isPropagationStopped(); ) event.type = i > 1 ? bubbleType : special.bindType || type, 
                    handle = (data_priv.get(cur, "events") || {})[event.type] && data_priv.get(cur, "handle"), 
                    handle && handle.apply(cur, data), handle = ontype && cur[ontype], handle && handle.apply && jQuery.acceptData(cur) && (event.result = handle.apply(cur, data), 
                    event.result === !1 && event.preventDefault());
                    return event.type = type, onlyHandlers || event.isDefaultPrevented() || special._default && special._default.apply(eventPath.pop(), data) !== !1 || !jQuery.acceptData(elem) || ontype && jQuery.isFunction(elem[type]) && !jQuery.isWindow(elem) && (tmp = elem[ontype], 
                    tmp && (elem[ontype] = null), jQuery.event.triggered = type, elem[type](), jQuery.event.triggered = void 0, 
                    tmp && (elem[ontype] = tmp)), event.result;
                }
            },
            dispatch: function(event) {
                event = jQuery.event.fix(event);
                var i, j, ret, matched, handleObj, handlerQueue = [], args = slice.call(arguments), handlers = (data_priv.get(this, "events") || {})[event.type] || [], special = jQuery.event.special[event.type] || {};
                if (args[0] = event, event.delegateTarget = this, !special.preDispatch || special.preDispatch.call(this, event) !== !1) {
                    for (handlerQueue = jQuery.event.handlers.call(this, event, handlers), i = 0; (matched = handlerQueue[i++]) && !event.isPropagationStopped(); ) for (event.currentTarget = matched.elem, 
                    j = 0; (handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped(); ) (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) && (event.handleObj = handleObj, 
                    event.data = handleObj.data, ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args), 
                    void 0 !== ret && (event.result = ret) === !1 && (event.preventDefault(), event.stopPropagation()));
                    return special.postDispatch && special.postDispatch.call(this, event), event.result;
                }
            },
            handlers: function(event, handlers) {
                var i, matches, sel, handleObj, handlerQueue = [], delegateCount = handlers.delegateCount, cur = event.target;
                if (delegateCount && cur.nodeType && (!event.button || "click" !== event.type)) for (;cur !== this; cur = cur.parentNode || this) if (cur.disabled !== !0 || "click" !== event.type) {
                    for (matches = [], i = 0; delegateCount > i; i++) handleObj = handlers[i], sel = handleObj.selector + " ", 
                    void 0 === matches[sel] && (matches[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) >= 0 : jQuery.find(sel, this, null, [ cur ]).length), 
                    matches[sel] && matches.push(handleObj);
                    matches.length && handlerQueue.push({
                        elem: cur,
                        handlers: matches
                    });
                }
                return delegateCount < handlers.length && handlerQueue.push({
                    elem: this,
                    handlers: handlers.slice(delegateCount)
                }), handlerQueue;
            },
            props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
            fixHooks: {},
            keyHooks: {
                props: "char charCode key keyCode".split(" "),
                filter: function(event, original) {
                    return null == event.which && (event.which = null != original.charCode ? original.charCode : original.keyCode), 
                    event;
                }
            },
            mouseHooks: {
                props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
                filter: function(event, original) {
                    var eventDoc, doc, body, button = original.button;
                    return null == event.pageX && null != original.clientX && (eventDoc = event.target.ownerDocument || document, 
                    doc = eventDoc.documentElement, body = eventDoc.body, event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0), 
                    event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0)), 
                    event.which || void 0 === button || (event.which = 1 & button ? 1 : 2 & button ? 3 : 4 & button ? 2 : 0), 
                    event;
                }
            },
            fix: function(event) {
                if (event[jQuery.expando]) return event;
                var i, prop, copy, type = event.type, originalEvent = event, fixHook = this.fixHooks[type];
                for (fixHook || (this.fixHooks[type] = fixHook = rmouseEvent.test(type) ? this.mouseHooks : rkeyEvent.test(type) ? this.keyHooks : {}), 
                copy = fixHook.props ? this.props.concat(fixHook.props) : this.props, event = new jQuery.Event(originalEvent), 
                i = copy.length; i--; ) prop = copy[i], event[prop] = originalEvent[prop];
                return event.target || (event.target = document), 3 === event.target.nodeType && (event.target = event.target.parentNode), 
                fixHook.filter ? fixHook.filter(event, originalEvent) : event;
            },
            special: {
                load: {
                    noBubble: !0
                },
                focus: {
                    trigger: function() {
                        return this !== safeActiveElement() && this.focus ? (this.focus(), !1) : void 0;
                    },
                    delegateType: "focusin"
                },
                blur: {
                    trigger: function() {
                        return this === safeActiveElement() && this.blur ? (this.blur(), !1) : void 0;
                    },
                    delegateType: "focusout"
                },
                click: {
                    trigger: function() {
                        return "checkbox" === this.type && this.click && jQuery.nodeName(this, "input") ? (this.click(), 
                        !1) : void 0;
                    },
                    _default: function(event) {
                        return jQuery.nodeName(event.target, "a");
                    }
                },
                beforeunload: {
                    postDispatch: function(event) {
                        void 0 !== event.result && (event.originalEvent.returnValue = event.result);
                    }
                }
            },
            simulate: function(type, elem, event, bubble) {
                var e = jQuery.extend(new jQuery.Event(), event, {
                    type: type,
                    isSimulated: !0,
                    originalEvent: {}
                });
                bubble ? jQuery.event.trigger(e, null, elem) : jQuery.event.dispatch.call(elem, e), 
                e.isDefaultPrevented() && event.preventDefault();
            }
        }, jQuery.removeEvent = function(elem, type, handle) {
            elem.removeEventListener && elem.removeEventListener(type, handle, !1);
        }, jQuery.Event = function(src, props) {
            return this instanceof jQuery.Event ? (src && src.type ? (this.originalEvent = src, 
            this.type = src.type, this.isDefaultPrevented = src.defaultPrevented || void 0 === src.defaultPrevented && src.getPreventDefault && src.getPreventDefault() ? returnTrue : returnFalse) : this.type = src, 
            props && jQuery.extend(this, props), this.timeStamp = src && src.timeStamp || jQuery.now(), 
            void (this[jQuery.expando] = !0)) : new jQuery.Event(src, props);
        }, jQuery.Event.prototype = {
            isDefaultPrevented: returnFalse,
            isPropagationStopped: returnFalse,
            isImmediatePropagationStopped: returnFalse,
            preventDefault: function() {
                var e = this.originalEvent;
                this.isDefaultPrevented = returnTrue, e && e.preventDefault && e.preventDefault();
            },
            stopPropagation: function() {
                var e = this.originalEvent;
                this.isPropagationStopped = returnTrue, e && e.stopPropagation && e.stopPropagation();
            },
            stopImmediatePropagation: function() {
                this.isImmediatePropagationStopped = returnTrue, this.stopPropagation();
            }
        }, jQuery.each({
            mouseenter: "mouseover",
            mouseleave: "mouseout"
        }, function(orig, fix) {
            jQuery.event.special[orig] = {
                delegateType: fix,
                bindType: fix,
                handle: function(event) {
                    var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj;
                    return (!related || related !== target && !jQuery.contains(target, related)) && (event.type = handleObj.origType, 
                    ret = handleObj.handler.apply(this, arguments), event.type = fix), ret;
                }
            };
        }), support.focusinBubbles || jQuery.each({
            focus: "focusin",
            blur: "focusout"
        }, function(orig, fix) {
            var handler = function(event) {
                jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), !0);
            };
            jQuery.event.special[fix] = {
                setup: function() {
                    var doc = this.ownerDocument || this, attaches = data_priv.access(doc, fix);
                    attaches || doc.addEventListener(orig, handler, !0), data_priv.access(doc, fix, (attaches || 0) + 1);
                },
                teardown: function() {
                    var doc = this.ownerDocument || this, attaches = data_priv.access(doc, fix) - 1;
                    attaches ? data_priv.access(doc, fix, attaches) : (doc.removeEventListener(orig, handler, !0), 
                    data_priv.remove(doc, fix));
                }
            };
        }), jQuery.fn.extend({
            on: function(types, selector, data, fn, one) {
                var origFn, type;
                if ("object" == typeof types) {
                    "string" != typeof selector && (data = data || selector, selector = void 0);
                    for (type in types) this.on(type, selector, data, types[type], one);
                    return this;
                }
                if (null == data && null == fn ? (fn = selector, data = selector = void 0) : null == fn && ("string" == typeof selector ? (fn = data, 
                data = void 0) : (fn = data, data = selector, selector = void 0)), fn === !1) fn = returnFalse; else if (!fn) return this;
                return 1 === one && (origFn = fn, fn = function(event) {
                    return jQuery().off(event), origFn.apply(this, arguments);
                }, fn.guid = origFn.guid || (origFn.guid = jQuery.guid++)), this.each(function() {
                    jQuery.event.add(this, types, fn, data, selector);
                });
            },
            one: function(types, selector, data, fn) {
                return this.on(types, selector, data, fn, 1);
            },
            off: function(types, selector, fn) {
                var handleObj, type;
                if (types && types.preventDefault && types.handleObj) return handleObj = types.handleObj, 
                jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler), 
                this;
                if ("object" == typeof types) {
                    for (type in types) this.off(type, selector, types[type]);
                    return this;
                }
                return (selector === !1 || "function" == typeof selector) && (fn = selector, selector = void 0), 
                fn === !1 && (fn = returnFalse), this.each(function() {
                    jQuery.event.remove(this, types, fn, selector);
                });
            },
            trigger: function(type, data) {
                return this.each(function() {
                    jQuery.event.trigger(type, data, this);
                });
            },
            triggerHandler: function(type, data) {
                var elem = this[0];
                return elem ? jQuery.event.trigger(type, data, elem, !0) : void 0;
            }
        });
        var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, rtagName = /<([\w:]+)/, rhtml = /<|&#?\w+;/, rnoInnerhtml = /<(?:script|style|link)/i, rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, rscriptType = /^$|\/(?:java|ecma)script/i, rscriptTypeMasked = /^true\/(.*)/, rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, wrapMap = {
            option: [ 1, "<select multiple='multiple'>", "</select>" ],
            thead: [ 1, "<table>", "</table>" ],
            col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
            tr: [ 2, "<table><tbody>", "</tbody></table>" ],
            td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
            _default: [ 0, "", "" ]
        };
        wrapMap.optgroup = wrapMap.option, wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead, 
        wrapMap.th = wrapMap.td, jQuery.extend({
            clone: function(elem, dataAndEvents, deepDataAndEvents) {
                var i, l, srcElements, destElements, clone = elem.cloneNode(!0), inPage = jQuery.contains(elem.ownerDocument, elem);
                if (!(support.noCloneChecked || 1 !== elem.nodeType && 11 !== elem.nodeType || jQuery.isXMLDoc(elem))) for (destElements = getAll(clone), 
                srcElements = getAll(elem), i = 0, l = srcElements.length; l > i; i++) fixInput(srcElements[i], destElements[i]);
                if (dataAndEvents) if (deepDataAndEvents) for (srcElements = srcElements || getAll(elem), 
                destElements = destElements || getAll(clone), i = 0, l = srcElements.length; l > i; i++) cloneCopyEvent(srcElements[i], destElements[i]); else cloneCopyEvent(elem, clone);
                return destElements = getAll(clone, "script"), destElements.length > 0 && setGlobalEval(destElements, !inPage && getAll(elem, "script")), 
                clone;
            },
            buildFragment: function(elems, context, scripts, selection) {
                for (var elem, tmp, tag, wrap, contains, j, fragment = context.createDocumentFragment(), nodes = [], i = 0, l = elems.length; l > i; i++) if (elem = elems[i], 
                elem || 0 === elem) if ("object" === jQuery.type(elem)) jQuery.merge(nodes, elem.nodeType ? [ elem ] : elem); else if (rhtml.test(elem)) {
                    for (tmp = tmp || fragment.appendChild(context.createElement("div")), tag = (rtagName.exec(elem) || [ "", "" ])[1].toLowerCase(), 
                    wrap = wrapMap[tag] || wrapMap._default, tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2], 
                    j = wrap[0]; j--; ) tmp = tmp.lastChild;
                    jQuery.merge(nodes, tmp.childNodes), tmp = fragment.firstChild, tmp.textContent = "";
                } else nodes.push(context.createTextNode(elem));
                for (fragment.textContent = "", i = 0; elem = nodes[i++]; ) if ((!selection || -1 === jQuery.inArray(elem, selection)) && (contains = jQuery.contains(elem.ownerDocument, elem), 
                tmp = getAll(fragment.appendChild(elem), "script"), contains && setGlobalEval(tmp), 
                scripts)) for (j = 0; elem = tmp[j++]; ) rscriptType.test(elem.type || "") && scripts.push(elem);
                return fragment;
            },
            cleanData: function(elems) {
                for (var data, elem, events, type, key, j, special = jQuery.event.special, i = 0; void 0 !== (elem = elems[i]); i++) {
                    if (jQuery.acceptData(elem) && (key = elem[data_priv.expando], key && (data = data_priv.cache[key]))) {
                        if (events = Object.keys(data.events || {}), events.length) for (j = 0; void 0 !== (type = events[j]); j++) special[type] ? jQuery.event.remove(elem, type) : jQuery.removeEvent(elem, type, data.handle);
                        data_priv.cache[key] && delete data_priv.cache[key];
                    }
                    delete data_user.cache[elem[data_user.expando]];
                }
            }
        }), jQuery.fn.extend({
            text: function(value) {
                return access(this, function(value) {
                    return void 0 === value ? jQuery.text(this) : this.empty().each(function() {
                        (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) && (this.textContent = value);
                    });
                }, null, value, arguments.length);
            },
            append: function() {
                return this.domManip(arguments, function(elem) {
                    if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                        var target = manipulationTarget(this, elem);
                        target.appendChild(elem);
                    }
                });
            },
            prepend: function() {
                return this.domManip(arguments, function(elem) {
                    if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                        var target = manipulationTarget(this, elem);
                        target.insertBefore(elem, target.firstChild);
                    }
                });
            },
            before: function() {
                return this.domManip(arguments, function(elem) {
                    this.parentNode && this.parentNode.insertBefore(elem, this);
                });
            },
            after: function() {
                return this.domManip(arguments, function(elem) {
                    this.parentNode && this.parentNode.insertBefore(elem, this.nextSibling);
                });
            },
            remove: function(selector, keepData) {
                for (var elem, elems = selector ? jQuery.filter(selector, this) : this, i = 0; null != (elem = elems[i]); i++) keepData || 1 !== elem.nodeType || jQuery.cleanData(getAll(elem)), 
                elem.parentNode && (keepData && jQuery.contains(elem.ownerDocument, elem) && setGlobalEval(getAll(elem, "script")), 
                elem.parentNode.removeChild(elem));
                return this;
            },
            empty: function() {
                for (var elem, i = 0; null != (elem = this[i]); i++) 1 === elem.nodeType && (jQuery.cleanData(getAll(elem, !1)), 
                elem.textContent = "");
                return this;
            },
            clone: function(dataAndEvents, deepDataAndEvents) {
                return dataAndEvents = null == dataAndEvents ? !1 : dataAndEvents, deepDataAndEvents = null == deepDataAndEvents ? dataAndEvents : deepDataAndEvents, 
                this.map(function() {
                    return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
                });
            },
            html: function(value) {
                return access(this, function(value) {
                    var elem = this[0] || {}, i = 0, l = this.length;
                    if (void 0 === value && 1 === elem.nodeType) return elem.innerHTML;
                    if ("string" == typeof value && !rnoInnerhtml.test(value) && !wrapMap[(rtagName.exec(value) || [ "", "" ])[1].toLowerCase()]) {
                        value = value.replace(rxhtmlTag, "<$1></$2>");
                        try {
                            for (;l > i; i++) elem = this[i] || {}, 1 === elem.nodeType && (jQuery.cleanData(getAll(elem, !1)), 
                            elem.innerHTML = value);
                            elem = 0;
                        } catch (e) {}
                    }
                    elem && this.empty().append(value);
                }, null, value, arguments.length);
            },
            replaceWith: function() {
                var arg = arguments[0];
                return this.domManip(arguments, function(elem) {
                    arg = this.parentNode, jQuery.cleanData(getAll(this)), arg && arg.replaceChild(elem, this);
                }), arg && (arg.length || arg.nodeType) ? this : this.remove();
            },
            detach: function(selector) {
                return this.remove(selector, !0);
            },
            domManip: function(args, callback) {
                args = concat.apply([], args);
                var fragment, first, scripts, hasScripts, node, doc, i = 0, l = this.length, set = this, iNoClone = l - 1, value = args[0], isFunction = jQuery.isFunction(value);
                if (isFunction || l > 1 && "string" == typeof value && !support.checkClone && rchecked.test(value)) return this.each(function(index) {
                    var self = set.eq(index);
                    isFunction && (args[0] = value.call(this, index, self.html())), self.domManip(args, callback);
                });
                if (l && (fragment = jQuery.buildFragment(args, this[0].ownerDocument, !1, this), 
                first = fragment.firstChild, 1 === fragment.childNodes.length && (fragment = first), 
                first)) {
                    for (scripts = jQuery.map(getAll(fragment, "script"), disableScript), hasScripts = scripts.length; l > i; i++) node = fragment, 
                    i !== iNoClone && (node = jQuery.clone(node, !0, !0), hasScripts && jQuery.merge(scripts, getAll(node, "script"))), 
                    callback.call(this[i], node, i);
                    if (hasScripts) for (doc = scripts[scripts.length - 1].ownerDocument, jQuery.map(scripts, restoreScript), 
                    i = 0; hasScripts > i; i++) node = scripts[i], rscriptType.test(node.type || "") && !data_priv.access(node, "globalEval") && jQuery.contains(doc, node) && (node.src ? jQuery._evalUrl && jQuery._evalUrl(node.src) : jQuery.globalEval(node.textContent.replace(rcleanScript, "")));
                }
                return this;
            }
        }), jQuery.each({
            appendTo: "append",
            prependTo: "prepend",
            insertBefore: "before",
            insertAfter: "after",
            replaceAll: "replaceWith"
        }, function(name, original) {
            jQuery.fn[name] = function(selector) {
                for (var elems, ret = [], insert = jQuery(selector), last = insert.length - 1, i = 0; last >= i; i++) elems = i === last ? this : this.clone(!0), 
                jQuery(insert[i])[original](elems), push.apply(ret, elems.get());
                return this.pushStack(ret);
            };
        });
        var iframe, elemdisplay = {}, rmargin = /^margin/, rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i"), getStyles = function(elem) {
            return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
        };
        !function() {
            function computePixelPositionAndBoxSizingReliable() {
                div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%", 
                docElem.appendChild(container);
                var divStyle = window.getComputedStyle(div, null);
                pixelPositionVal = "1%" !== divStyle.top, boxSizingReliableVal = "4px" === divStyle.width, 
                docElem.removeChild(container);
            }
            var pixelPositionVal, boxSizingReliableVal, divReset = "padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box", docElem = document.documentElement, container = document.createElement("div"), div = document.createElement("div");
            div.style.backgroundClip = "content-box", div.cloneNode(!0).style.backgroundClip = "", 
            support.clearCloneStyle = "content-box" === div.style.backgroundClip, container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px", 
            container.appendChild(div), window.getComputedStyle && jQuery.extend(support, {
                pixelPosition: function() {
                    return computePixelPositionAndBoxSizingReliable(), pixelPositionVal;
                },
                boxSizingReliable: function() {
                    return null == boxSizingReliableVal && computePixelPositionAndBoxSizingReliable(), 
                    boxSizingReliableVal;
                },
                reliableMarginRight: function() {
                    var ret, marginDiv = div.appendChild(document.createElement("div"));
                    return marginDiv.style.cssText = div.style.cssText = divReset, marginDiv.style.marginRight = marginDiv.style.width = "0", 
                    div.style.width = "1px", docElem.appendChild(container), ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight), 
                    docElem.removeChild(container), div.innerHTML = "", ret;
                }
            });
        }(), jQuery.swap = function(elem, options, callback, args) {
            var ret, name, old = {};
            for (name in options) old[name] = elem.style[name], elem.style[name] = options[name];
            ret = callback.apply(elem, args || []);
            for (name in options) elem.style[name] = old[name];
            return ret;
        };
        var rdisplayswap = /^(none|table(?!-c[ea]).+)/, rnumsplit = new RegExp("^(" + pnum + ")(.*)$", "i"), rrelNum = new RegExp("^([+-])=(" + pnum + ")", "i"), cssShow = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        }, cssNormalTransform = {
            letterSpacing: 0,
            fontWeight: 400
        }, cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];
        jQuery.extend({
            cssHooks: {
                opacity: {
                    get: function(elem, computed) {
                        if (computed) {
                            var ret = curCSS(elem, "opacity");
                            return "" === ret ? "1" : ret;
                        }
                    }
                }
            },
            cssNumber: {
                columnCount: !0,
                fillOpacity: !0,
                fontWeight: !0,
                lineHeight: !0,
                opacity: !0,
                order: !0,
                orphans: !0,
                widows: !0,
                zIndex: !0,
                zoom: !0
            },
            cssProps: {
                "float": "cssFloat"
            },
            style: function(elem, name, value, extra) {
                if (elem && 3 !== elem.nodeType && 8 !== elem.nodeType && elem.style) {
                    var ret, type, hooks, origName = jQuery.camelCase(name), style = elem.style;
                    return name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName)), 
                    hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName], void 0 === value ? hooks && "get" in hooks && void 0 !== (ret = hooks.get(elem, !1, extra)) ? ret : style[name] : (type = typeof value, 
                    "string" === type && (ret = rrelNum.exec(value)) && (value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name)), 
                    type = "number"), null != value && value === value && ("number" !== type || jQuery.cssNumber[origName] || (value += "px"), 
                    support.clearCloneStyle || "" !== value || 0 !== name.indexOf("background") || (style[name] = "inherit"), 
                    hooks && "set" in hooks && void 0 === (value = hooks.set(elem, value, extra)) || (style[name] = "", 
                    style[name] = value)), void 0);
                }
            },
            css: function(elem, name, extra, styles) {
                var val, num, hooks, origName = jQuery.camelCase(name);
                return name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style, origName)), 
                hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName], hooks && "get" in hooks && (val = hooks.get(elem, !0, extra)), 
                void 0 === val && (val = curCSS(elem, name, styles)), "normal" === val && name in cssNormalTransform && (val = cssNormalTransform[name]), 
                "" === extra || extra ? (num = parseFloat(val), extra === !0 || jQuery.isNumeric(num) ? num || 0 : val) : val;
            }
        }), jQuery.each([ "height", "width" ], function(i, name) {
            jQuery.cssHooks[name] = {
                get: function(elem, computed, extra) {
                    return computed ? 0 === elem.offsetWidth && rdisplayswap.test(jQuery.css(elem, "display")) ? jQuery.swap(elem, cssShow, function() {
                        return getWidthOrHeight(elem, name, extra);
                    }) : getWidthOrHeight(elem, name, extra) : void 0;
                },
                set: function(elem, value, extra) {
                    var styles = extra && getStyles(elem);
                    return setPositiveNumber(elem, value, extra ? augmentWidthOrHeight(elem, name, extra, "border-box" === jQuery.css(elem, "boxSizing", !1, styles), styles) : 0);
                }
            };
        }), jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight, function(elem, computed) {
            return computed ? jQuery.swap(elem, {
                display: "inline-block"
            }, curCSS, [ elem, "marginRight" ]) : void 0;
        }), jQuery.each({
            margin: "",
            padding: "",
            border: "Width"
        }, function(prefix, suffix) {
            jQuery.cssHooks[prefix + suffix] = {
                expand: function(value) {
                    for (var i = 0, expanded = {}, parts = "string" == typeof value ? value.split(" ") : [ value ]; 4 > i; i++) expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
                    return expanded;
                }
            }, rmargin.test(prefix) || (jQuery.cssHooks[prefix + suffix].set = setPositiveNumber);
        }), jQuery.fn.extend({
            css: function(name, value) {
                return access(this, function(elem, name, value) {
                    var styles, len, map = {}, i = 0;
                    if (jQuery.isArray(name)) {
                        for (styles = getStyles(elem), len = name.length; len > i; i++) map[name[i]] = jQuery.css(elem, name[i], !1, styles);
                        return map;
                    }
                    return void 0 !== value ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
                }, name, value, arguments.length > 1);
            },
            show: function() {
                return showHide(this, !0);
            },
            hide: function() {
                return showHide(this);
            },
            toggle: function(state) {
                return "boolean" == typeof state ? state ? this.show() : this.hide() : this.each(function() {
                    isHidden(this) ? jQuery(this).show() : jQuery(this).hide();
                });
            }
        }), jQuery.Tween = Tween, Tween.prototype = {
            constructor: Tween,
            init: function(elem, options, prop, end, easing, unit) {
                this.elem = elem, this.prop = prop, this.easing = easing || "swing", this.options = options, 
                this.start = this.now = this.cur(), this.end = end, this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
            },
            cur: function() {
                var hooks = Tween.propHooks[this.prop];
                return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
            },
            run: function(percent) {
                var eased, hooks = Tween.propHooks[this.prop];
                return this.options.duration ? this.pos = eased = jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration) : this.pos = eased = percent, 
                this.now = (this.end - this.start) * eased + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), 
                hooks && hooks.set ? hooks.set(this) : Tween.propHooks._default.set(this), this;
            }
        }, Tween.prototype.init.prototype = Tween.prototype, Tween.propHooks = {
            _default: {
                get: function(tween) {
                    var result;
                    return null == tween.elem[tween.prop] || tween.elem.style && null != tween.elem.style[tween.prop] ? (result = jQuery.css(tween.elem, tween.prop, ""), 
                    result && "auto" !== result ? result : 0) : tween.elem[tween.prop];
                },
                set: function(tween) {
                    jQuery.fx.step[tween.prop] ? jQuery.fx.step[tween.prop](tween) : tween.elem.style && (null != tween.elem.style[jQuery.cssProps[tween.prop]] || jQuery.cssHooks[tween.prop]) ? jQuery.style(tween.elem, tween.prop, tween.now + tween.unit) : tween.elem[tween.prop] = tween.now;
                }
            }
        }, Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
            set: function(tween) {
                tween.elem.nodeType && tween.elem.parentNode && (tween.elem[tween.prop] = tween.now);
            }
        }, jQuery.easing = {
            linear: function(p) {
                return p;
            },
            swing: function(p) {
                return .5 - Math.cos(p * Math.PI) / 2;
            }
        }, jQuery.fx = Tween.prototype.init, jQuery.fx.step = {};
        var fxNow, timerId, rfxtypes = /^(?:toggle|show|hide)$/, rfxnum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i"), rrun = /queueHooks$/, animationPrefilters = [ defaultPrefilter ], tweeners = {
            "*": [ function(prop, value) {
                var tween = this.createTween(prop, value), target = tween.cur(), parts = rfxnum.exec(value), unit = parts && parts[3] || (jQuery.cssNumber[prop] ? "" : "px"), start = (jQuery.cssNumber[prop] || "px" !== unit && +target) && rfxnum.exec(jQuery.css(tween.elem, prop)), scale = 1, maxIterations = 20;
                if (start && start[3] !== unit) {
                    unit = unit || start[3], parts = parts || [], start = +target || 1;
                    do scale = scale || ".5", start /= scale, jQuery.style(tween.elem, prop, start + unit); while (scale !== (scale = tween.cur() / target) && 1 !== scale && --maxIterations);
                }
                return parts && (start = tween.start = +start || +target || 0, tween.unit = unit, 
                tween.end = parts[1] ? start + (parts[1] + 1) * parts[2] : +parts[2]), tween;
            } ]
        };
        jQuery.Animation = jQuery.extend(Animation, {
            tweener: function(props, callback) {
                jQuery.isFunction(props) ? (callback = props, props = [ "*" ]) : props = props.split(" ");
                for (var prop, index = 0, length = props.length; length > index; index++) prop = props[index], 
                tweeners[prop] = tweeners[prop] || [], tweeners[prop].unshift(callback);
            },
            prefilter: function(callback, prepend) {
                prepend ? animationPrefilters.unshift(callback) : animationPrefilters.push(callback);
            }
        }), jQuery.speed = function(speed, easing, fn) {
            var opt = speed && "object" == typeof speed ? jQuery.extend({}, speed) : {
                complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
                duration: speed,
                easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
            };
            return opt.duration = jQuery.fx.off ? 0 : "number" == typeof opt.duration ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default, 
            (null == opt.queue || opt.queue === !0) && (opt.queue = "fx"), opt.old = opt.complete, 
            opt.complete = function() {
                jQuery.isFunction(opt.old) && opt.old.call(this), opt.queue && jQuery.dequeue(this, opt.queue);
            }, opt;
        }, jQuery.fn.extend({
            fadeTo: function(speed, to, easing, callback) {
                return this.filter(isHidden).css("opacity", 0).show().end().animate({
                    opacity: to
                }, speed, easing, callback);
            },
            animate: function(prop, speed, easing, callback) {
                var empty = jQuery.isEmptyObject(prop), optall = jQuery.speed(speed, easing, callback), doAnimation = function() {
                    var anim = Animation(this, jQuery.extend({}, prop), optall);
                    (empty || data_priv.get(this, "finish")) && anim.stop(!0);
                };
                return doAnimation.finish = doAnimation, empty || optall.queue === !1 ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
            },
            stop: function(type, clearQueue, gotoEnd) {
                var stopQueue = function(hooks) {
                    var stop = hooks.stop;
                    delete hooks.stop, stop(gotoEnd);
                };
                return "string" != typeof type && (gotoEnd = clearQueue, clearQueue = type, type = void 0), 
                clearQueue && type !== !1 && this.queue(type || "fx", []), this.each(function() {
                    var dequeue = !0, index = null != type && type + "queueHooks", timers = jQuery.timers, data = data_priv.get(this);
                    if (index) data[index] && data[index].stop && stopQueue(data[index]); else for (index in data) data[index] && data[index].stop && rrun.test(index) && stopQueue(data[index]);
                    for (index = timers.length; index--; ) timers[index].elem !== this || null != type && timers[index].queue !== type || (timers[index].anim.stop(gotoEnd), 
                    dequeue = !1, timers.splice(index, 1));
                    (dequeue || !gotoEnd) && jQuery.dequeue(this, type);
                });
            },
            finish: function(type) {
                return type !== !1 && (type = type || "fx"), this.each(function() {
                    var index, data = data_priv.get(this), queue = data[type + "queue"], hooks = data[type + "queueHooks"], timers = jQuery.timers, length = queue ? queue.length : 0;
                    for (data.finish = !0, jQuery.queue(this, type, []), hooks && hooks.stop && hooks.stop.call(this, !0), 
                    index = timers.length; index--; ) timers[index].elem === this && timers[index].queue === type && (timers[index].anim.stop(!0), 
                    timers.splice(index, 1));
                    for (index = 0; length > index; index++) queue[index] && queue[index].finish && queue[index].finish.call(this);
                    delete data.finish;
                });
            }
        }), jQuery.each([ "toggle", "show", "hide" ], function(i, name) {
            var cssFn = jQuery.fn[name];
            jQuery.fn[name] = function(speed, easing, callback) {
                return null == speed || "boolean" == typeof speed ? cssFn.apply(this, arguments) : this.animate(genFx(name, !0), speed, easing, callback);
            };
        }), jQuery.each({
            slideDown: genFx("show"),
            slideUp: genFx("hide"),
            slideToggle: genFx("toggle"),
            fadeIn: {
                opacity: "show"
            },
            fadeOut: {
                opacity: "hide"
            },
            fadeToggle: {
                opacity: "toggle"
            }
        }, function(name, props) {
            jQuery.fn[name] = function(speed, easing, callback) {
                return this.animate(props, speed, easing, callback);
            };
        }), jQuery.timers = [], jQuery.fx.tick = function() {
            var timer, i = 0, timers = jQuery.timers;
            for (fxNow = jQuery.now(); i < timers.length; i++) timer = timers[i], timer() || timers[i] !== timer || timers.splice(i--, 1);
            timers.length || jQuery.fx.stop(), fxNow = void 0;
        }, jQuery.fx.timer = function(timer) {
            jQuery.timers.push(timer), timer() ? jQuery.fx.start() : jQuery.timers.pop();
        }, jQuery.fx.interval = 13, jQuery.fx.start = function() {
            timerId || (timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval));
        }, jQuery.fx.stop = function() {
            clearInterval(timerId), timerId = null;
        }, jQuery.fx.speeds = {
            slow: 600,
            fast: 200,
            _default: 400
        }, jQuery.fn.delay = function(time, type) {
            return time = jQuery.fx ? jQuery.fx.speeds[time] || time : time, type = type || "fx", 
            this.queue(type, function(next, hooks) {
                var timeout = setTimeout(next, time);
                hooks.stop = function() {
                    clearTimeout(timeout);
                };
            });
        }, function() {
            var input = document.createElement("input"), select = document.createElement("select"), opt = select.appendChild(document.createElement("option"));
            input.type = "checkbox", support.checkOn = "" !== input.value, support.optSelected = opt.selected, 
            select.disabled = !0, support.optDisabled = !opt.disabled, input = document.createElement("input"), 
            input.value = "t", input.type = "radio", support.radioValue = "t" === input.value;
        }();
        var nodeHook, boolHook, attrHandle = jQuery.expr.attrHandle;
        jQuery.fn.extend({
            attr: function(name, value) {
                return access(this, jQuery.attr, name, value, arguments.length > 1);
            },
            removeAttr: function(name) {
                return this.each(function() {
                    jQuery.removeAttr(this, name);
                });
            }
        }), jQuery.extend({
            attr: function(elem, name, value) {
                var hooks, ret, nType = elem.nodeType;
                if (elem && 3 !== nType && 8 !== nType && 2 !== nType) return typeof elem.getAttribute === strundefined ? jQuery.prop(elem, name, value) : (1 === nType && jQuery.isXMLDoc(elem) || (name = name.toLowerCase(), 
                hooks = jQuery.attrHooks[name] || (jQuery.expr.match.bool.test(name) ? boolHook : nodeHook)), 
                void 0 === value ? hooks && "get" in hooks && null !== (ret = hooks.get(elem, name)) ? ret : (ret = jQuery.find.attr(elem, name), 
                null == ret ? void 0 : ret) : null !== value ? hooks && "set" in hooks && void 0 !== (ret = hooks.set(elem, value, name)) ? ret : (elem.setAttribute(name, value + ""), 
                value) : void jQuery.removeAttr(elem, name));
            },
            removeAttr: function(elem, value) {
                var name, propName, i = 0, attrNames = value && value.match(rnotwhite);
                if (attrNames && 1 === elem.nodeType) for (;name = attrNames[i++]; ) propName = jQuery.propFix[name] || name, 
                jQuery.expr.match.bool.test(name) && (elem[propName] = !1), elem.removeAttribute(name);
            },
            attrHooks: {
                type: {
                    set: function(elem, value) {
                        if (!support.radioValue && "radio" === value && jQuery.nodeName(elem, "input")) {
                            var val = elem.value;
                            return elem.setAttribute("type", value), val && (elem.value = val), value;
                        }
                    }
                }
            }
        }), boolHook = {
            set: function(elem, value, name) {
                return value === !1 ? jQuery.removeAttr(elem, name) : elem.setAttribute(name, name), 
                name;
            }
        }, jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function(i, name) {
            var getter = attrHandle[name] || jQuery.find.attr;
            attrHandle[name] = function(elem, name, isXML) {
                var ret, handle;
                return isXML || (handle = attrHandle[name], attrHandle[name] = ret, ret = null != getter(elem, name, isXML) ? name.toLowerCase() : null, 
                attrHandle[name] = handle), ret;
            };
        });
        var rfocusable = /^(?:input|select|textarea|button)$/i;
        jQuery.fn.extend({
            prop: function(name, value) {
                return access(this, jQuery.prop, name, value, arguments.length > 1);
            },
            removeProp: function(name) {
                return this.each(function() {
                    delete this[jQuery.propFix[name] || name];
                });
            }
        }), jQuery.extend({
            propFix: {
                "for": "htmlFor",
                "class": "className"
            },
            prop: function(elem, name, value) {
                var ret, hooks, notxml, nType = elem.nodeType;
                if (elem && 3 !== nType && 8 !== nType && 2 !== nType) return notxml = 1 !== nType || !jQuery.isXMLDoc(elem), 
                notxml && (name = jQuery.propFix[name] || name, hooks = jQuery.propHooks[name]), 
                void 0 !== value ? hooks && "set" in hooks && void 0 !== (ret = hooks.set(elem, value, name)) ? ret : elem[name] = value : hooks && "get" in hooks && null !== (ret = hooks.get(elem, name)) ? ret : elem[name];
            },
            propHooks: {
                tabIndex: {
                    get: function(elem) {
                        return elem.hasAttribute("tabindex") || rfocusable.test(elem.nodeName) || elem.href ? elem.tabIndex : -1;
                    }
                }
            }
        }), support.optSelected || (jQuery.propHooks.selected = {
            get: function(elem) {
                var parent = elem.parentNode;
                return parent && parent.parentNode && parent.parentNode.selectedIndex, null;
            }
        }), jQuery.each([ "tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable" ], function() {
            jQuery.propFix[this.toLowerCase()] = this;
        });
        var rclass = /[\t\r\n\f]/g;
        jQuery.fn.extend({
            addClass: function(value) {
                var classes, elem, cur, clazz, j, finalValue, proceed = "string" == typeof value && value, i = 0, len = this.length;
                if (jQuery.isFunction(value)) return this.each(function(j) {
                    jQuery(this).addClass(value.call(this, j, this.className));
                });
                if (proceed) for (classes = (value || "").match(rnotwhite) || []; len > i; i++) if (elem = this[i], 
                cur = 1 === elem.nodeType && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : " ")) {
                    for (j = 0; clazz = classes[j++]; ) cur.indexOf(" " + clazz + " ") < 0 && (cur += clazz + " ");
                    finalValue = jQuery.trim(cur), elem.className !== finalValue && (elem.className = finalValue);
                }
                return this;
            },
            removeClass: function(value) {
                var classes, elem, cur, clazz, j, finalValue, proceed = 0 === arguments.length || "string" == typeof value && value, i = 0, len = this.length;
                if (jQuery.isFunction(value)) return this.each(function(j) {
                    jQuery(this).removeClass(value.call(this, j, this.className));
                });
                if (proceed) for (classes = (value || "").match(rnotwhite) || []; len > i; i++) if (elem = this[i], 
                cur = 1 === elem.nodeType && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : "")) {
                    for (j = 0; clazz = classes[j++]; ) for (;cur.indexOf(" " + clazz + " ") >= 0; ) cur = cur.replace(" " + clazz + " ", " ");
                    finalValue = value ? jQuery.trim(cur) : "", elem.className !== finalValue && (elem.className = finalValue);
                }
                return this;
            },
            toggleClass: function(value, stateVal) {
                var type = typeof value;
                return "boolean" == typeof stateVal && "string" === type ? stateVal ? this.addClass(value) : this.removeClass(value) : jQuery.isFunction(value) ? this.each(function(i) {
                    jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
                }) : this.each(function() {
                    if ("string" === type) for (var className, i = 0, self = jQuery(this), classNames = value.match(rnotwhite) || []; className = classNames[i++]; ) self.hasClass(className) ? self.removeClass(className) : self.addClass(className); else (type === strundefined || "boolean" === type) && (this.className && data_priv.set(this, "__className__", this.className), 
                    this.className = this.className || value === !1 ? "" : data_priv.get(this, "__className__") || "");
                });
            },
            hasClass: function(selector) {
                for (var className = " " + selector + " ", i = 0, l = this.length; l > i; i++) if (1 === this[i].nodeType && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) >= 0) return !0;
                return !1;
            }
        });
        var rreturn = /\r/g;
        jQuery.fn.extend({
            val: function(value) {
                var hooks, ret, isFunction, elem = this[0];
                {
                    if (arguments.length) return isFunction = jQuery.isFunction(value), this.each(function(i) {
                        var val;
                        1 === this.nodeType && (val = isFunction ? value.call(this, i, jQuery(this).val()) : value, 
                        null == val ? val = "" : "number" == typeof val ? val += "" : jQuery.isArray(val) && (val = jQuery.map(val, function(value) {
                            return null == value ? "" : value + "";
                        })), hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()], 
                        hooks && "set" in hooks && void 0 !== hooks.set(this, val, "value") || (this.value = val));
                    });
                    if (elem) return hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()], 
                    hooks && "get" in hooks && void 0 !== (ret = hooks.get(elem, "value")) ? ret : (ret = elem.value, 
                    "string" == typeof ret ? ret.replace(rreturn, "") : null == ret ? "" : ret);
                }
            }
        }), jQuery.extend({
            valHooks: {
                select: {
                    get: function(elem) {
                        for (var value, option, options = elem.options, index = elem.selectedIndex, one = "select-one" === elem.type || 0 > index, values = one ? null : [], max = one ? index + 1 : options.length, i = 0 > index ? max : one ? index : 0; max > i; i++) if (option = options[i], 
                        (option.selected || i === index) && (support.optDisabled ? !option.disabled : null === option.getAttribute("disabled")) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {
                            if (value = jQuery(option).val(), one) return value;
                            values.push(value);
                        }
                        return values;
                    },
                    set: function(elem, value) {
                        for (var optionSet, option, options = elem.options, values = jQuery.makeArray(value), i = options.length; i--; ) option = options[i], 
                        (option.selected = jQuery.inArray(jQuery(option).val(), values) >= 0) && (optionSet = !0);
                        return optionSet || (elem.selectedIndex = -1), values;
                    }
                }
            }
        }), jQuery.each([ "radio", "checkbox" ], function() {
            jQuery.valHooks[this] = {
                set: function(elem, value) {
                    return jQuery.isArray(value) ? elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0 : void 0;
                }
            }, support.checkOn || (jQuery.valHooks[this].get = function(elem) {
                return null === elem.getAttribute("value") ? "on" : elem.value;
            });
        }), jQuery.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(i, name) {
            jQuery.fn[name] = function(data, fn) {
                return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
            };
        }), jQuery.fn.extend({
            hover: function(fnOver, fnOut) {
                return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
            },
            bind: function(types, data, fn) {
                return this.on(types, null, data, fn);
            },
            unbind: function(types, fn) {
                return this.off(types, null, fn);
            },
            delegate: function(selector, types, data, fn) {
                return this.on(types, selector, data, fn);
            },
            undelegate: function(selector, types, fn) {
                return 1 === arguments.length ? this.off(selector, "**") : this.off(types, selector || "**", fn);
            }
        });
        var nonce = jQuery.now(), rquery = /\?/;
        jQuery.parseJSON = function(data) {
            return JSON.parse(data + "");
        }, jQuery.parseXML = function(data) {
            var xml, tmp;
            if (!data || "string" != typeof data) return null;
            try {
                tmp = new DOMParser(), xml = tmp.parseFromString(data, "text/xml");
            } catch (e) {
                xml = void 0;
            }
            return (!xml || xml.getElementsByTagName("parsererror").length) && jQuery.error("Invalid XML: " + data), 
            xml;
        };
        var ajaxLocParts, ajaxLocation, rhash = /#.*$/, rts = /([?&])_=[^&]*/, rheaders = /^(.*?):[ \t]*([^\r\n]*)$/gm, rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, prefilters = {}, transports = {}, allTypes = "*/".concat("*");
        try {
            ajaxLocation = location.href;
        } catch (e) {
            ajaxLocation = document.createElement("a"), ajaxLocation.href = "", ajaxLocation = ajaxLocation.href;
        }
        ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [], jQuery.extend({
            active: 0,
            lastModified: {},
            etag: {},
            ajaxSettings: {
                url: ajaxLocation,
                type: "GET",
                isLocal: rlocalProtocol.test(ajaxLocParts[1]),
                global: !0,
                processData: !0,
                async: !0,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                accepts: {
                    "*": allTypes,
                    text: "text/plain",
                    html: "text/html",
                    xml: "application/xml, text/xml",
                    json: "application/json, text/javascript"
                },
                contents: {
                    xml: /xml/,
                    html: /html/,
                    json: /json/
                },
                responseFields: {
                    xml: "responseXML",
                    text: "responseText",
                    json: "responseJSON"
                },
                converters: {
                    "* text": String,
                    "text html": !0,
                    "text json": jQuery.parseJSON,
                    "text xml": jQuery.parseXML
                },
                flatOptions: {
                    url: !0,
                    context: !0
                }
            },
            ajaxSetup: function(target, settings) {
                return settings ? ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) : ajaxExtend(jQuery.ajaxSettings, target);
            },
            ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
            ajaxTransport: addToPrefiltersOrTransports(transports),
            ajax: function(url, options) {
                function done(status, nativeStatusText, responses, headers) {
                    var isSuccess, success, error, response, modified, statusText = nativeStatusText;
                    2 !== state && (state = 2, timeoutTimer && clearTimeout(timeoutTimer), transport = void 0, 
                    responseHeadersString = headers || "", jqXHR.readyState = status > 0 ? 4 : 0, isSuccess = status >= 200 && 300 > status || 304 === status, 
                    responses && (response = ajaxHandleResponses(s, jqXHR, responses)), response = ajaxConvert(s, response, jqXHR, isSuccess), 
                    isSuccess ? (s.ifModified && (modified = jqXHR.getResponseHeader("Last-Modified"), 
                    modified && (jQuery.lastModified[cacheURL] = modified), modified = jqXHR.getResponseHeader("etag"), 
                    modified && (jQuery.etag[cacheURL] = modified)), 204 === status || "HEAD" === s.type ? statusText = "nocontent" : 304 === status ? statusText = "notmodified" : (statusText = response.state, 
                    success = response.data, error = response.error, isSuccess = !error)) : (error = statusText, 
                    (status || !statusText) && (statusText = "error", 0 > status && (status = 0))), 
                    jqXHR.status = status, jqXHR.statusText = (nativeStatusText || statusText) + "", 
                    isSuccess ? deferred.resolveWith(callbackContext, [ success, statusText, jqXHR ]) : deferred.rejectWith(callbackContext, [ jqXHR, statusText, error ]), 
                    jqXHR.statusCode(statusCode), statusCode = void 0, fireGlobals && globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [ jqXHR, s, isSuccess ? success : error ]), 
                    completeDeferred.fireWith(callbackContext, [ jqXHR, statusText ]), fireGlobals && (globalEventContext.trigger("ajaxComplete", [ jqXHR, s ]), 
                    --jQuery.active || jQuery.event.trigger("ajaxStop")));
                }
                "object" == typeof url && (options = url, url = void 0), options = options || {};
                var transport, cacheURL, responseHeadersString, responseHeaders, timeoutTimer, parts, fireGlobals, i, s = jQuery.ajaxSetup({}, options), callbackContext = s.context || s, globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event, deferred = jQuery.Deferred(), completeDeferred = jQuery.Callbacks("once memory"), statusCode = s.statusCode || {}, requestHeaders = {}, requestHeadersNames = {}, state = 0, strAbort = "canceled", jqXHR = {
                    readyState: 0,
                    getResponseHeader: function(key) {
                        var match;
                        if (2 === state) {
                            if (!responseHeaders) for (responseHeaders = {}; match = rheaders.exec(responseHeadersString); ) responseHeaders[match[1].toLowerCase()] = match[2];
                            match = responseHeaders[key.toLowerCase()];
                        }
                        return null == match ? null : match;
                    },
                    getAllResponseHeaders: function() {
                        return 2 === state ? responseHeadersString : null;
                    },
                    setRequestHeader: function(name, value) {
                        var lname = name.toLowerCase();
                        return state || (name = requestHeadersNames[lname] = requestHeadersNames[lname] || name, 
                        requestHeaders[name] = value), this;
                    },
                    overrideMimeType: function(type) {
                        return state || (s.mimeType = type), this;
                    },
                    statusCode: function(map) {
                        var code;
                        if (map) if (2 > state) for (code in map) statusCode[code] = [ statusCode[code], map[code] ]; else jqXHR.always(map[jqXHR.status]);
                        return this;
                    },
                    abort: function(statusText) {
                        var finalText = statusText || strAbort;
                        return transport && transport.abort(finalText), done(0, finalText), this;
                    }
                };
                if (deferred.promise(jqXHR).complete = completeDeferred.add, jqXHR.success = jqXHR.done, 
                jqXHR.error = jqXHR.fail, s.url = ((url || s.url || ajaxLocation) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//"), 
                s.type = options.method || options.type || s.method || s.type, s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(rnotwhite) || [ "" ], 
                null == s.crossDomain && (parts = rurl.exec(s.url.toLowerCase()), s.crossDomain = !(!parts || parts[1] === ajaxLocParts[1] && parts[2] === ajaxLocParts[2] && (parts[3] || ("http:" === parts[1] ? "80" : "443")) === (ajaxLocParts[3] || ("http:" === ajaxLocParts[1] ? "80" : "443")))), 
                s.data && s.processData && "string" != typeof s.data && (s.data = jQuery.param(s.data, s.traditional)), 
                inspectPrefiltersOrTransports(prefilters, s, options, jqXHR), 2 === state) return jqXHR;
                fireGlobals = s.global, fireGlobals && 0 === jQuery.active++ && jQuery.event.trigger("ajaxStart"), 
                s.type = s.type.toUpperCase(), s.hasContent = !rnoContent.test(s.type), cacheURL = s.url, 
                s.hasContent || (s.data && (cacheURL = s.url += (rquery.test(cacheURL) ? "&" : "?") + s.data, 
                delete s.data), s.cache === !1 && (s.url = rts.test(cacheURL) ? cacheURL.replace(rts, "$1_=" + nonce++) : cacheURL + (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce++)), 
                s.ifModified && (jQuery.lastModified[cacheURL] && jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]), 
                jQuery.etag[cacheURL] && jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL])), 
                (s.data && s.hasContent && s.contentType !== !1 || options.contentType) && jqXHR.setRequestHeader("Content-Type", s.contentType), 
                jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + ("*" !== s.dataTypes[0] ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);
                for (i in s.headers) jqXHR.setRequestHeader(i, s.headers[i]);
                if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === !1 || 2 === state)) return jqXHR.abort();
                strAbort = "abort";
                for (i in {
                    success: 1,
                    error: 1,
                    complete: 1
                }) jqXHR[i](s[i]);
                if (transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR)) {
                    jqXHR.readyState = 1, fireGlobals && globalEventContext.trigger("ajaxSend", [ jqXHR, s ]), 
                    s.async && s.timeout > 0 && (timeoutTimer = setTimeout(function() {
                        jqXHR.abort("timeout");
                    }, s.timeout));
                    try {
                        state = 1, transport.send(requestHeaders, done);
                    } catch (e) {
                        if (!(2 > state)) throw e;
                        done(-1, e);
                    }
                } else done(-1, "No Transport");
                return jqXHR;
            },
            getJSON: function(url, data, callback) {
                return jQuery.get(url, data, callback, "json");
            },
            getScript: function(url, callback) {
                return jQuery.get(url, void 0, callback, "script");
            }
        }), jQuery.each([ "get", "post" ], function(i, method) {
            jQuery[method] = function(url, data, callback, type) {
                return jQuery.isFunction(data) && (type = type || callback, callback = data, data = void 0), 
                jQuery.ajax({
                    url: url,
                    type: method,
                    dataType: type,
                    data: data,
                    success: callback
                });
            };
        }), jQuery.each([ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function(i, type) {
            jQuery.fn[type] = function(fn) {
                return this.on(type, fn);
            };
        }), jQuery._evalUrl = function(url) {
            return jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "script",
                async: !1,
                global: !1,
                "throws": !0
            });
        }, jQuery.fn.extend({
            wrapAll: function(html) {
                var wrap;
                return jQuery.isFunction(html) ? this.each(function(i) {
                    jQuery(this).wrapAll(html.call(this, i));
                }) : (this[0] && (wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && wrap.insertBefore(this[0]), 
                wrap.map(function() {
                    for (var elem = this; elem.firstElementChild; ) elem = elem.firstElementChild;
                    return elem;
                }).append(this)), this);
            },
            wrapInner: function(html) {
                return jQuery.isFunction(html) ? this.each(function(i) {
                    jQuery(this).wrapInner(html.call(this, i));
                }) : this.each(function() {
                    var self = jQuery(this), contents = self.contents();
                    contents.length ? contents.wrapAll(html) : self.append(html);
                });
            },
            wrap: function(html) {
                var isFunction = jQuery.isFunction(html);
                return this.each(function(i) {
                    jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
                });
            },
            unwrap: function() {
                return this.parent().each(function() {
                    jQuery.nodeName(this, "body") || jQuery(this).replaceWith(this.childNodes);
                }).end();
            }
        }), jQuery.expr.filters.hidden = function(elem) {
            return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
        }, jQuery.expr.filters.visible = function(elem) {
            return !jQuery.expr.filters.hidden(elem);
        };
        var r20 = /%20/g, rbracket = /\[\]$/, rCRLF = /\r?\n/g, rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, rsubmittable = /^(?:input|select|textarea|keygen)/i;
        jQuery.param = function(a, traditional) {
            var prefix, s = [], add = function(key, value) {
                value = jQuery.isFunction(value) ? value() : null == value ? "" : value, s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
            };
            if (void 0 === traditional && (traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional), 
            jQuery.isArray(a) || a.jquery && !jQuery.isPlainObject(a)) jQuery.each(a, function() {
                add(this.name, this.value);
            }); else for (prefix in a) buildParams(prefix, a[prefix], traditional, add);
            return s.join("&").replace(r20, "+");
        }, jQuery.fn.extend({
            serialize: function() {
                return jQuery.param(this.serializeArray());
            },
            serializeArray: function() {
                return this.map(function() {
                    var elements = jQuery.prop(this, "elements");
                    return elements ? jQuery.makeArray(elements) : this;
                }).filter(function() {
                    var type = this.type;
                    return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
                }).map(function(i, elem) {
                    var val = jQuery(this).val();
                    return null == val ? null : jQuery.isArray(val) ? jQuery.map(val, function(val) {
                        return {
                            name: elem.name,
                            value: val.replace(rCRLF, "\r\n")
                        };
                    }) : {
                        name: elem.name,
                        value: val.replace(rCRLF, "\r\n")
                    };
                }).get();
            }
        }), jQuery.ajaxSettings.xhr = function() {
            try {
                return new XMLHttpRequest();
            } catch (e) {}
        };
        var xhrId = 0, xhrCallbacks = {}, xhrSuccessStatus = {
            0: 200,
            1223: 204
        }, xhrSupported = jQuery.ajaxSettings.xhr();
        window.ActiveXObject && jQuery(window).on("unload", function() {
            for (var key in xhrCallbacks) xhrCallbacks[key]();
        }), support.cors = !!xhrSupported && "withCredentials" in xhrSupported, support.ajax = xhrSupported = !!xhrSupported, 
        jQuery.ajaxTransport(function(options) {
            var callback;
            return support.cors || xhrSupported && !options.crossDomain ? {
                send: function(headers, complete) {
                    var i, xhr = options.xhr(), id = ++xhrId;
                    if (xhr.open(options.type, options.url, options.async, options.username, options.password), 
                    options.xhrFields) for (i in options.xhrFields) xhr[i] = options.xhrFields[i];
                    options.mimeType && xhr.overrideMimeType && xhr.overrideMimeType(options.mimeType), 
                    options.crossDomain || headers["X-Requested-With"] || (headers["X-Requested-With"] = "XMLHttpRequest");
                    for (i in headers) xhr.setRequestHeader(i, headers[i]);
                    callback = function(type) {
                        return function() {
                            callback && (delete xhrCallbacks[id], callback = xhr.onload = xhr.onerror = null, 
                            "abort" === type ? xhr.abort() : "error" === type ? complete(xhr.status, xhr.statusText) : complete(xhrSuccessStatus[xhr.status] || xhr.status, xhr.statusText, "string" == typeof xhr.responseText ? {
                                text: xhr.responseText
                            } : void 0, xhr.getAllResponseHeaders()));
                        };
                    }, xhr.onload = callback(), xhr.onerror = callback("error"), callback = xhrCallbacks[id] = callback("abort"), 
                    xhr.send(options.hasContent && options.data || null);
                },
                abort: function() {
                    callback && callback();
                }
            } : void 0;
        }), jQuery.ajaxSetup({
            accepts: {
                script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
            },
            contents: {
                script: /(?:java|ecma)script/
            },
            converters: {
                "text script": function(text) {
                    return jQuery.globalEval(text), text;
                }
            }
        }), jQuery.ajaxPrefilter("script", function(s) {
            void 0 === s.cache && (s.cache = !1), s.crossDomain && (s.type = "GET");
        }), jQuery.ajaxTransport("script", function(s) {
            if (s.crossDomain) {
                var script, callback;
                return {
                    send: function(_, complete) {
                        script = jQuery("<script>").prop({
                            async: !0,
                            charset: s.scriptCharset,
                            src: s.url
                        }).on("load error", callback = function(evt) {
                            script.remove(), callback = null, evt && complete("error" === evt.type ? 404 : 200, evt.type);
                        }), document.head.appendChild(script[0]);
                    },
                    abort: function() {
                        callback && callback();
                    }
                };
            }
        });
        var oldCallbacks = [], rjsonp = /(=)\?(?=&|$)|\?\?/;
        jQuery.ajaxSetup({
            jsonp: "callback",
            jsonpCallback: function() {
                var callback = oldCallbacks.pop() || jQuery.expando + "_" + nonce++;
                return this[callback] = !0, callback;
            }
        }), jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
            var callbackName, overwritten, responseContainer, jsonProp = s.jsonp !== !1 && (rjsonp.test(s.url) ? "url" : "string" == typeof s.data && !(s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data");
            return jsonProp || "jsonp" === s.dataTypes[0] ? (callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback, 
            jsonProp ? s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName) : s.jsonp !== !1 && (s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName), 
            s.converters["script json"] = function() {
                return responseContainer || jQuery.error(callbackName + " was not called"), responseContainer[0];
            }, s.dataTypes[0] = "json", overwritten = window[callbackName], window[callbackName] = function() {
                responseContainer = arguments;
            }, jqXHR.always(function() {
                window[callbackName] = overwritten, s[callbackName] && (s.jsonpCallback = originalSettings.jsonpCallback, 
                oldCallbacks.push(callbackName)), responseContainer && jQuery.isFunction(overwritten) && overwritten(responseContainer[0]), 
                responseContainer = overwritten = void 0;
            }), "script") : void 0;
        }), jQuery.parseHTML = function(data, context, keepScripts) {
            if (!data || "string" != typeof data) return null;
            "boolean" == typeof context && (keepScripts = context, context = !1), context = context || document;
            var parsed = rsingleTag.exec(data), scripts = !keepScripts && [];
            return parsed ? [ context.createElement(parsed[1]) ] : (parsed = jQuery.buildFragment([ data ], context, scripts), 
            scripts && scripts.length && jQuery(scripts).remove(), jQuery.merge([], parsed.childNodes));
        };
        var _load = jQuery.fn.load;
        jQuery.fn.load = function(url, params, callback) {
            if ("string" != typeof url && _load) return _load.apply(this, arguments);
            var selector, type, response, self = this, off = url.indexOf(" ");
            return off >= 0 && (selector = url.slice(off), url = url.slice(0, off)), jQuery.isFunction(params) ? (callback = params, 
            params = void 0) : params && "object" == typeof params && (type = "POST"), self.length > 0 && jQuery.ajax({
                url: url,
                type: type,
                dataType: "html",
                data: params
            }).done(function(responseText) {
                response = arguments, self.html(selector ? jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) : responseText);
            }).complete(callback && function(jqXHR, status) {
                self.each(callback, response || [ jqXHR.responseText, status, jqXHR ]);
            }), this;
        }, jQuery.expr.filters.animated = function(elem) {
            return jQuery.grep(jQuery.timers, function(fn) {
                return elem === fn.elem;
            }).length;
        };
        var docElem = window.document.documentElement;
        jQuery.offset = {
            setOffset: function(elem, options, i) {
                var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = jQuery.css(elem, "position"), curElem = jQuery(elem), props = {};
                "static" === position && (elem.style.position = "relative"), curOffset = curElem.offset(), 
                curCSSTop = jQuery.css(elem, "top"), curCSSLeft = jQuery.css(elem, "left"), calculatePosition = ("absolute" === position || "fixed" === position) && (curCSSTop + curCSSLeft).indexOf("auto") > -1, 
                calculatePosition ? (curPosition = curElem.position(), curTop = curPosition.top, 
                curLeft = curPosition.left) : (curTop = parseFloat(curCSSTop) || 0, curLeft = parseFloat(curCSSLeft) || 0), 
                jQuery.isFunction(options) && (options = options.call(elem, i, curOffset)), null != options.top && (props.top = options.top - curOffset.top + curTop), 
                null != options.left && (props.left = options.left - curOffset.left + curLeft), 
                "using" in options ? options.using.call(elem, props) : curElem.css(props);
            }
        }, jQuery.fn.extend({
            offset: function(options) {
                if (arguments.length) return void 0 === options ? this : this.each(function(i) {
                    jQuery.offset.setOffset(this, options, i);
                });
                var docElem, win, elem = this[0], box = {
                    top: 0,
                    left: 0
                }, doc = elem && elem.ownerDocument;
                if (doc) return docElem = doc.documentElement, jQuery.contains(docElem, elem) ? (typeof elem.getBoundingClientRect !== strundefined && (box = elem.getBoundingClientRect()), 
                win = getWindow(doc), {
                    top: box.top + win.pageYOffset - docElem.clientTop,
                    left: box.left + win.pageXOffset - docElem.clientLeft
                }) : box;
            },
            position: function() {
                if (this[0]) {
                    var offsetParent, offset, elem = this[0], parentOffset = {
                        top: 0,
                        left: 0
                    };
                    return "fixed" === jQuery.css(elem, "position") ? offset = elem.getBoundingClientRect() : (offsetParent = this.offsetParent(), 
                    offset = this.offset(), jQuery.nodeName(offsetParent[0], "html") || (parentOffset = offsetParent.offset()), 
                    parentOffset.top += jQuery.css(offsetParent[0], "borderTopWidth", !0), parentOffset.left += jQuery.css(offsetParent[0], "borderLeftWidth", !0)), 
                    {
                        top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", !0),
                        left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", !0)
                    };
                }
            },
            offsetParent: function() {
                return this.map(function() {
                    for (var offsetParent = this.offsetParent || docElem; offsetParent && !jQuery.nodeName(offsetParent, "html") && "static" === jQuery.css(offsetParent, "position"); ) offsetParent = offsetParent.offsetParent;
                    return offsetParent || docElem;
                });
            }
        }), jQuery.each({
            scrollLeft: "pageXOffset",
            scrollTop: "pageYOffset"
        }, function(method, prop) {
            var top = "pageYOffset" === prop;
            jQuery.fn[method] = function(val) {
                return access(this, function(elem, method, val) {
                    var win = getWindow(elem);
                    return void 0 === val ? win ? win[prop] : elem[method] : void (win ? win.scrollTo(top ? window.pageXOffset : val, top ? val : window.pageYOffset) : elem[method] = val);
                }, method, val, arguments.length, null);
            };
        }), jQuery.each([ "top", "left" ], function(i, prop) {
            jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function(elem, computed) {
                return computed ? (computed = curCSS(elem, prop), rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + "px" : computed) : void 0;
            });
        }), jQuery.each({
            Height: "height",
            Width: "width"
        }, function(name, type) {
            jQuery.each({
                padding: "inner" + name,
                content: type,
                "": "outer" + name
            }, function(defaultExtra, funcName) {
                jQuery.fn[funcName] = function(margin, value) {
                    var chainable = arguments.length && (defaultExtra || "boolean" != typeof margin), extra = defaultExtra || (margin === !0 || value === !0 ? "margin" : "border");
                    return access(this, function(elem, type, value) {
                        var doc;
                        return jQuery.isWindow(elem) ? elem.document.documentElement["client" + name] : 9 === elem.nodeType ? (doc = elem.documentElement, 
                        Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name])) : void 0 === value ? jQuery.css(elem, type, extra) : jQuery.style(elem, type, value, extra);
                    }, type, chainable ? margin : void 0, chainable, null);
                };
            });
        }), jQuery.fn.size = function() {
            return this.length;
        }, jQuery.fn.andSelf = jQuery.fn.addBack, "function" == typeof define && define.amd && define("jquery", [], function() {
            return jQuery;
        });
        var _jQuery = window.jQuery, _$ = window.$;
        return jQuery.noConflict = function(deep) {
            return window.$ === jQuery && (window.$ = _$), deep && window.jQuery === jQuery && (window.jQuery = _jQuery), 
            jQuery;
        }, typeof noGlobal === strundefined && (window.jQuery = window.$ = jQuery), jQuery;
    }), function(window, document, undefined) {
        "use strict";
        function minErr(module) {
            return function() {
                var message, i, code = arguments[0], prefix = "[" + (module ? module + ":" : "") + code + "] ", template = arguments[1], templateArgs = arguments, stringify = function(obj) {
                    return "function" == typeof obj ? obj.toString().replace(/ \{[\s\S]*$/, "") : "undefined" == typeof obj ? "undefined" : "string" != typeof obj ? JSON.stringify(obj) : obj;
                };
                for (message = prefix + template.replace(/\{\d+\}/g, function(match) {
                    var arg, index = +match.slice(1, -1);
                    return index + 2 < templateArgs.length ? (arg = templateArgs[index + 2], "function" == typeof arg ? arg.toString().replace(/ ?\{[\s\S]*$/, "") : "undefined" == typeof arg ? "undefined" : "string" != typeof arg ? toJson(arg) : arg) : match;
                }), message = message + "\nhttp://errors.angularjs.org/1.2.12/" + (module ? module + "/" : "") + code, 
                i = 2; i < arguments.length; i++) message = message + (2 == i ? "?" : "&") + "p" + (i - 2) + "=" + encodeURIComponent(stringify(arguments[i]));
                return new Error(message);
            };
        }
        function isArrayLike(obj) {
            if (null == obj || isWindow(obj)) return !1;
            var length = obj.length;
            return 1 === obj.nodeType && length ? !0 : isString(obj) || isArray(obj) || 0 === length || "number" == typeof length && length > 0 && length - 1 in obj;
        }
        function forEach(obj, iterator, context) {
            var key;
            if (obj) if (isFunction(obj)) for (key in obj) "prototype" == key || "length" == key || "name" == key || obj.hasOwnProperty && !obj.hasOwnProperty(key) || iterator.call(context, obj[key], key); else if (obj.forEach && obj.forEach !== forEach) obj.forEach(iterator, context); else if (isArrayLike(obj)) for (key = 0; key < obj.length; key++) iterator.call(context, obj[key], key); else for (key in obj) obj.hasOwnProperty(key) && iterator.call(context, obj[key], key);
            return obj;
        }
        function sortedKeys(obj) {
            var keys = [];
            for (var key in obj) obj.hasOwnProperty(key) && keys.push(key);
            return keys.sort();
        }
        function forEachSorted(obj, iterator, context) {
            for (var keys = sortedKeys(obj), i = 0; i < keys.length; i++) iterator.call(context, obj[keys[i]], keys[i]);
            return keys;
        }
        function reverseParams(iteratorFn) {
            return function(value, key) {
                iteratorFn(key, value);
            };
        }
        function nextUid() {
            for (var digit, index = uid.length; index; ) {
                if (index--, digit = uid[index].charCodeAt(0), 57 == digit) return uid[index] = "A", 
                uid.join("");
                if (90 != digit) return uid[index] = String.fromCharCode(digit + 1), uid.join("");
                uid[index] = "0";
            }
            return uid.unshift("0"), uid.join("");
        }
        function setHashKey(obj, h) {
            h ? obj.$$hashKey = h : delete obj.$$hashKey;
        }
        function extend(dst) {
            var h = dst.$$hashKey;
            return forEach(arguments, function(obj) {
                obj !== dst && forEach(obj, function(value, key) {
                    dst[key] = value;
                });
            }), setHashKey(dst, h), dst;
        }
        function int(str) {
            return parseInt(str, 10);
        }
        function inherit(parent, extra) {
            return extend(new (extend(function() {}, {
                prototype: parent
            }))(), extra);
        }
        function noop() {}
        function identity($) {
            return $;
        }
        function valueFn(value) {
            return function() {
                return value;
            };
        }
        function isUndefined(value) {
            return "undefined" == typeof value;
        }
        function isDefined(value) {
            return "undefined" != typeof value;
        }
        function isObject(value) {
            return null != value && "object" == typeof value;
        }
        function isString(value) {
            return "string" == typeof value;
        }
        function isNumber(value) {
            return "number" == typeof value;
        }
        function isDate(value) {
            return "[object Date]" === toString.call(value);
        }
        function isArray(value) {
            return "[object Array]" === toString.call(value);
        }
        function isFunction(value) {
            return "function" == typeof value;
        }
        function isRegExp(value) {
            return "[object RegExp]" === toString.call(value);
        }
        function isWindow(obj) {
            return obj && obj.document && obj.location && obj.alert && obj.setInterval;
        }
        function isScope(obj) {
            return obj && obj.$evalAsync && obj.$watch;
        }
        function isFile(obj) {
            return "[object File]" === toString.call(obj);
        }
        function isElement(node) {
            return !(!node || !(node.nodeName || node.on && node.find));
        }
        function map(obj, iterator, context) {
            var results = [];
            return forEach(obj, function(value, index, list) {
                results.push(iterator.call(context, value, index, list));
            }), results;
        }
        function includes(array, obj) {
            return -1 != indexOf(array, obj);
        }
        function indexOf(array, obj) {
            if (array.indexOf) return array.indexOf(obj);
            for (var i = 0; i < array.length; i++) if (obj === array[i]) return i;
            return -1;
        }
        function arrayRemove(array, value) {
            var index = indexOf(array, value);
            return index >= 0 && array.splice(index, 1), value;
        }
        function copy(source, destination) {
            if (isWindow(source) || isScope(source)) throw ngMinErr("cpws", "Can't copy! Making copies of Window or Scope instances is not supported.");
            if (destination) {
                if (source === destination) throw ngMinErr("cpi", "Can't copy! Source and destination are identical.");
                if (isArray(source)) {
                    destination.length = 0;
                    for (var i = 0; i < source.length; i++) destination.push(copy(source[i]));
                } else {
                    var h = destination.$$hashKey;
                    forEach(destination, function(value, key) {
                        delete destination[key];
                    });
                    for (var key in source) destination[key] = copy(source[key]);
                    setHashKey(destination, h);
                }
            } else destination = source, source && (isArray(source) ? destination = copy(source, []) : isDate(source) ? destination = new Date(source.getTime()) : isRegExp(source) ? destination = new RegExp(source.source) : isObject(source) && (destination = copy(source, {})));
            return destination;
        }
        function shallowCopy(src, dst) {
            dst = dst || {};
            for (var key in src) !src.hasOwnProperty(key) || "$" === key.charAt(0) && "$" === key.charAt(1) || (dst[key] = src[key]);
            return dst;
        }
        function equals(o1, o2) {
            if (o1 === o2) return !0;
            if (null === o1 || null === o2) return !1;
            if (o1 !== o1 && o2 !== o2) return !0;
            var length, key, keySet, t1 = typeof o1, t2 = typeof o2;
            if (t1 == t2 && "object" == t1) {
                if (!isArray(o1)) {
                    if (isDate(o1)) return isDate(o2) && o1.getTime() == o2.getTime();
                    if (isRegExp(o1) && isRegExp(o2)) return o1.toString() == o2.toString();
                    if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2)) return !1;
                    keySet = {};
                    for (key in o1) if ("$" !== key.charAt(0) && !isFunction(o1[key])) {
                        if (!equals(o1[key], o2[key])) return !1;
                        keySet[key] = !0;
                    }
                    for (key in o2) if (!keySet.hasOwnProperty(key) && "$" !== key.charAt(0) && o2[key] !== undefined && !isFunction(o2[key])) return !1;
                    return !0;
                }
                if (!isArray(o2)) return !1;
                if ((length = o1.length) == o2.length) {
                    for (key = 0; length > key; key++) if (!equals(o1[key], o2[key])) return !1;
                    return !0;
                }
            }
            return !1;
        }
        function csp() {
            return document.securityPolicy && document.securityPolicy.isActive || document.querySelector && !(!document.querySelector("[ng-csp]") && !document.querySelector("[data-ng-csp]"));
        }
        function concat(array1, array2, index) {
            return array1.concat(slice.call(array2, index));
        }
        function sliceArgs(args, startIndex) {
            return slice.call(args, startIndex || 0);
        }
        function bind(self, fn) {
            var curryArgs = arguments.length > 2 ? sliceArgs(arguments, 2) : [];
            return !isFunction(fn) || fn instanceof RegExp ? fn : curryArgs.length ? function() {
                return arguments.length ? fn.apply(self, curryArgs.concat(slice.call(arguments, 0))) : fn.apply(self, curryArgs);
            } : function() {
                return arguments.length ? fn.apply(self, arguments) : fn.call(self);
            };
        }
        function toJsonReplacer(key, value) {
            var val = value;
            return "string" == typeof key && "$" === key.charAt(0) ? val = undefined : isWindow(value) ? val = "$WINDOW" : value && document === value ? val = "$DOCUMENT" : isScope(value) && (val = "$SCOPE"), 
            val;
        }
        function toJson(obj, pretty) {
            return "undefined" == typeof obj ? undefined : JSON.stringify(obj, toJsonReplacer, pretty ? "  " : null);
        }
        function fromJson(json) {
            return isString(json) ? JSON.parse(json) : json;
        }
        function toBoolean(value) {
            if ("function" == typeof value) value = !0; else if (value && 0 !== value.length) {
                var v = lowercase("" + value);
                value = !("f" == v || "0" == v || "false" == v || "no" == v || "n" == v || "[]" == v);
            } else value = !1;
            return value;
        }
        function startingTag(element) {
            element = jqLite(element).clone();
            try {
                element.empty();
            } catch (e) {}
            var TEXT_NODE = 3, elemHtml = jqLite("<div>").append(element).html();
            try {
                return element[0].nodeType === TEXT_NODE ? lowercase(elemHtml) : elemHtml.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/, function(match, nodeName) {
                    return "<" + lowercase(nodeName);
                });
            } catch (e) {
                return lowercase(elemHtml);
            }
        }
        function tryDecodeURIComponent(value) {
            try {
                return decodeURIComponent(value);
            } catch (e) {}
        }
        function parseKeyValue(keyValue) {
            var key_value, key, obj = {};
            return forEach((keyValue || "").split("&"), function(keyValue) {
                if (keyValue && (key_value = keyValue.split("="), key = tryDecodeURIComponent(key_value[0]), 
                isDefined(key))) {
                    var val = isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : !0;
                    obj[key] ? isArray(obj[key]) ? obj[key].push(val) : obj[key] = [ obj[key], val ] : obj[key] = val;
                }
            }), obj;
        }
        function toKeyValue(obj) {
            var parts = [];
            return forEach(obj, function(value, key) {
                isArray(value) ? forEach(value, function(arrayValue) {
                    parts.push(encodeUriQuery(key, !0) + (arrayValue === !0 ? "" : "=" + encodeUriQuery(arrayValue, !0)));
                }) : parts.push(encodeUriQuery(key, !0) + (value === !0 ? "" : "=" + encodeUriQuery(value, !0)));
            }), parts.length ? parts.join("&") : "";
        }
        function encodeUriSegment(val) {
            return encodeUriQuery(val, !0).replace(/%26/gi, "&").replace(/%3D/gi, "=").replace(/%2B/gi, "+");
        }
        function encodeUriQuery(val, pctEncodeSpaces) {
            return encodeURIComponent(val).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, pctEncodeSpaces ? "%20" : "+");
        }
        function angularInit(element, bootstrap) {
            function append(element) {
                element && elements.push(element);
            }
            var appElement, module, elements = [ element ], names = [ "ng:app", "ng-app", "x-ng-app", "data-ng-app" ], NG_APP_CLASS_REGEXP = /\sng[:\-]app(:\s*([\w\d_]+);?)?\s/;
            forEach(names, function(name) {
                names[name] = !0, append(document.getElementById(name)), name = name.replace(":", "\\:"), 
                element.querySelectorAll && (forEach(element.querySelectorAll("." + name), append), 
                forEach(element.querySelectorAll("." + name + "\\:"), append), forEach(element.querySelectorAll("[" + name + "]"), append));
            }), forEach(elements, function(element) {
                if (!appElement) {
                    var className = " " + element.className + " ", match = NG_APP_CLASS_REGEXP.exec(className);
                    match ? (appElement = element, module = (match[2] || "").replace(/\s+/g, ",")) : forEach(element.attributes, function(attr) {
                        !appElement && names[attr.name] && (appElement = element, module = attr.value);
                    });
                }
            }), appElement && bootstrap(appElement, module ? [ module ] : []);
        }
        function bootstrap(element, modules) {
            var doBootstrap = function() {
                if (element = jqLite(element), element.injector()) {
                    var tag = element[0] === document ? "document" : startingTag(element);
                    throw ngMinErr("btstrpd", "App Already Bootstrapped with this Element '{0}'", tag);
                }
                modules = modules || [], modules.unshift([ "$provide", function($provide) {
                    $provide.value("$rootElement", element);
                } ]), modules.unshift("ng");
                var injector = createInjector(modules);
                return injector.invoke([ "$rootScope", "$rootElement", "$compile", "$injector", "$animate", function(scope, element, compile, injector, animate) {
                    scope.$apply(function() {
                        element.data("$injector", injector), compile(element)(scope);
                    });
                } ]), injector;
            }, NG_DEFER_BOOTSTRAP = /^NG_DEFER_BOOTSTRAP!/;
            return window && !NG_DEFER_BOOTSTRAP.test(window.name) ? doBootstrap() : (window.name = window.name.replace(NG_DEFER_BOOTSTRAP, ""), 
            void (angular.resumeBootstrap = function(extraModules) {
                forEach(extraModules, function(module) {
                    modules.push(module);
                }), doBootstrap();
            }));
        }
        function snake_case(name, separator) {
            return separator = separator || "_", name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
                return (pos ? separator : "") + letter.toLowerCase();
            });
        }
        function bindJQuery() {
            jQuery = window.jQuery, jQuery ? (jqLite = jQuery, extend(jQuery.fn, {
                scope: JQLitePrototype.scope,
                isolateScope: JQLitePrototype.isolateScope,
                controller: JQLitePrototype.controller,
                injector: JQLitePrototype.injector,
                inheritedData: JQLitePrototype.inheritedData
            }), jqLitePatchJQueryRemove("remove", !0, !0, !1), jqLitePatchJQueryRemove("empty", !1, !1, !1), 
            jqLitePatchJQueryRemove("html", !1, !1, !0)) : jqLite = JQLite, angular.element = jqLite;
        }
        function assertArg(arg, name, reason) {
            if (!arg) throw ngMinErr("areq", "Argument '{0}' is {1}", name || "?", reason || "required");
            return arg;
        }
        function assertArgFn(arg, name, acceptArrayAnnotation) {
            return acceptArrayAnnotation && isArray(arg) && (arg = arg[arg.length - 1]), assertArg(isFunction(arg), name, "not a function, got " + (arg && "object" == typeof arg ? arg.constructor.name || "Object" : typeof arg)), 
            arg;
        }
        function assertNotHasOwnProperty(name, context) {
            if ("hasOwnProperty" === name) throw ngMinErr("badname", "hasOwnProperty is not a valid {0} name", context);
        }
        function getter(obj, path, bindFnToScope) {
            if (!path) return obj;
            for (var key, keys = path.split("."), lastInstance = obj, len = keys.length, i = 0; len > i; i++) key = keys[i], 
            obj && (obj = (lastInstance = obj)[key]);
            return !bindFnToScope && isFunction(obj) ? bind(lastInstance, obj) : obj;
        }
        function getBlockElements(nodes) {
            var startNode = nodes[0], endNode = nodes[nodes.length - 1];
            if (startNode === endNode) return jqLite(startNode);
            var element = startNode, elements = [ element ];
            do {
                if (element = element.nextSibling, !element) break;
                elements.push(element);
            } while (element !== endNode);
            return jqLite(elements);
        }
        function setupModuleLoader(window) {
            function ensure(obj, name, factory) {
                return obj[name] || (obj[name] = factory());
            }
            var $injectorMinErr = minErr("$injector"), ngMinErr = minErr("ng"), angular = ensure(window, "angular", Object);
            return angular.$$minErr = angular.$$minErr || minErr, ensure(angular, "module", function() {
                var modules = {};
                return function(name, requires, configFn) {
                    var assertNotHasOwnProperty = function(name, context) {
                        if ("hasOwnProperty" === name) throw ngMinErr("badname", "hasOwnProperty is not a valid {0} name", context);
                    };
                    return assertNotHasOwnProperty(name, "module"), requires && modules.hasOwnProperty(name) && (modules[name] = null), 
                    ensure(modules, name, function() {
                        function invokeLater(provider, method, insertMethod) {
                            return function() {
                                return invokeQueue[insertMethod || "push"]([ provider, method, arguments ]), moduleInstance;
                            };
                        }
                        if (!requires) throw $injectorMinErr("nomod", "Module '{0}' is not available! You either misspelled the module name or forgot to load it. If registering a module ensure that you specify the dependencies as the second argument.", name);
                        var invokeQueue = [], runBlocks = [], config = invokeLater("$injector", "invoke"), moduleInstance = {
                            _invokeQueue: invokeQueue,
                            _runBlocks: runBlocks,
                            requires: requires,
                            name: name,
                            provider: invokeLater("$provide", "provider"),
                            factory: invokeLater("$provide", "factory"),
                            service: invokeLater("$provide", "service"),
                            value: invokeLater("$provide", "value"),
                            constant: invokeLater("$provide", "constant", "unshift"),
                            animation: invokeLater("$animateProvider", "register"),
                            filter: invokeLater("$filterProvider", "register"),
                            controller: invokeLater("$controllerProvider", "register"),
                            directive: invokeLater("$compileProvider", "directive"),
                            config: config,
                            run: function(block) {
                                return runBlocks.push(block), this;
                            }
                        };
                        return configFn && config(configFn), moduleInstance;
                    });
                };
            });
        }
        function publishExternalAPI(angular) {
            extend(angular, {
                bootstrap: bootstrap,
                copy: copy,
                extend: extend,
                equals: equals,
                element: jqLite,
                forEach: forEach,
                injector: createInjector,
                noop: noop,
                bind: bind,
                toJson: toJson,
                fromJson: fromJson,
                identity: identity,
                isUndefined: isUndefined,
                isDefined: isDefined,
                isString: isString,
                isFunction: isFunction,
                isObject: isObject,
                isNumber: isNumber,
                isElement: isElement,
                isArray: isArray,
                version: version,
                isDate: isDate,
                lowercase: lowercase,
                uppercase: uppercase,
                callbacks: {
                    counter: 0
                },
                $$minErr: minErr,
                $$csp: csp
            }), angularModule = setupModuleLoader(window);
            try {
                angularModule("ngLocale");
            } catch (e) {
                angularModule("ngLocale", []).provider("$locale", $LocaleProvider);
            }
            angularModule("ng", [ "ngLocale" ], [ "$provide", function($provide) {
                $provide.provider({
                    $$sanitizeUri: $$SanitizeUriProvider
                }), $provide.provider("$compile", $CompileProvider).directive({
                    a: htmlAnchorDirective,
                    input: inputDirective,
                    textarea: inputDirective,
                    form: formDirective,
                    script: scriptDirective,
                    select: selectDirective,
                    style: styleDirective,
                    option: optionDirective,
                    ngBind: ngBindDirective,
                    ngBindHtml: ngBindHtmlDirective,
                    ngBindTemplate: ngBindTemplateDirective,
                    ngClass: ngClassDirective,
                    ngClassEven: ngClassEvenDirective,
                    ngClassOdd: ngClassOddDirective,
                    ngCloak: ngCloakDirective,
                    ngController: ngControllerDirective,
                    ngForm: ngFormDirective,
                    ngHide: ngHideDirective,
                    ngIf: ngIfDirective,
                    ngInclude: ngIncludeDirective,
                    ngInit: ngInitDirective,
                    ngNonBindable: ngNonBindableDirective,
                    ngPluralize: ngPluralizeDirective,
                    ngRepeat: ngRepeatDirective,
                    ngShow: ngShowDirective,
                    ngStyle: ngStyleDirective,
                    ngSwitch: ngSwitchDirective,
                    ngSwitchWhen: ngSwitchWhenDirective,
                    ngSwitchDefault: ngSwitchDefaultDirective,
                    ngOptions: ngOptionsDirective,
                    ngTransclude: ngTranscludeDirective,
                    ngModel: ngModelDirective,
                    ngList: ngListDirective,
                    ngChange: ngChangeDirective,
                    required: requiredDirective,
                    ngRequired: requiredDirective,
                    ngValue: ngValueDirective
                }).directive({
                    ngInclude: ngIncludeFillContentDirective
                }).directive(ngAttributeAliasDirectives).directive(ngEventDirectives), $provide.provider({
                    $anchorScroll: $AnchorScrollProvider,
                    $animate: $AnimateProvider,
                    $browser: $BrowserProvider,
                    $cacheFactory: $CacheFactoryProvider,
                    $controller: $ControllerProvider,
                    $document: $DocumentProvider,
                    $exceptionHandler: $ExceptionHandlerProvider,
                    $filter: $FilterProvider,
                    $interpolate: $InterpolateProvider,
                    $interval: $IntervalProvider,
                    $http: $HttpProvider,
                    $httpBackend: $HttpBackendProvider,
                    $location: $LocationProvider,
                    $log: $LogProvider,
                    $parse: $ParseProvider,
                    $rootScope: $RootScopeProvider,
                    $q: $QProvider,
                    $sce: $SceProvider,
                    $sceDelegate: $SceDelegateProvider,
                    $sniffer: $SnifferProvider,
                    $templateCache: $TemplateCacheProvider,
                    $timeout: $TimeoutProvider,
                    $window: $WindowProvider
                });
            } ]);
        }
        function jqNextId() {
            return ++jqId;
        }
        function camelCase(name) {
            return name.replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
                return offset ? letter.toUpperCase() : letter;
            }).replace(MOZ_HACK_REGEXP, "Moz$1");
        }
        function jqLitePatchJQueryRemove(name, dispatchThis, filterElems, getterIfNoArguments) {
            function removePatch(param) {
                var set, setIndex, setLength, element, childIndex, childLength, children, list = filterElems && param ? [ this.filter(param) ] : [ this ], fireEvent = dispatchThis;
                if (!getterIfNoArguments || null != param) for (;list.length; ) for (set = list.shift(), 
                setIndex = 0, setLength = set.length; setLength > setIndex; setIndex++) for (element = jqLite(set[setIndex]), 
                fireEvent ? element.triggerHandler("$destroy") : fireEvent = !fireEvent, childIndex = 0, 
                childLength = (children = element.children()).length; childLength > childIndex; childIndex++) list.push(jQuery(children[childIndex]));
                return originalJqFn.apply(this, arguments);
            }
            var originalJqFn = jQuery.fn[name];
            originalJqFn = originalJqFn.$original || originalJqFn, removePatch.$original = originalJqFn, 
            jQuery.fn[name] = removePatch;
        }
        function JQLite(element) {
            if (element instanceof JQLite) return element;
            if (isString(element) && (element = trim(element)), !(this instanceof JQLite)) {
                if (isString(element) && "<" != element.charAt(0)) throw jqLiteMinErr("nosel", "Looking up elements via selectors is not supported by jqLite! See: http://docs.angularjs.org/api/angular.element");
                return new JQLite(element);
            }
            if (isString(element)) {
                var div = document.createElement("div");
                div.innerHTML = "<div>&#160;</div>" + element, div.removeChild(div.firstChild), 
                jqLiteAddNodes(this, div.childNodes);
                var fragment = jqLite(document.createDocumentFragment());
                fragment.append(this);
            } else jqLiteAddNodes(this, element);
        }
        function jqLiteClone(element) {
            return element.cloneNode(!0);
        }
        function jqLiteDealoc(element) {
            jqLiteRemoveData(element);
            for (var i = 0, children = element.childNodes || []; i < children.length; i++) jqLiteDealoc(children[i]);
        }
        function jqLiteOff(element, type, fn, unsupported) {
            if (isDefined(unsupported)) throw jqLiteMinErr("offargs", "jqLite#off() does not support the `selector` argument");
            var events = jqLiteExpandoStore(element, "events"), handle = jqLiteExpandoStore(element, "handle");
            handle && (isUndefined(type) ? forEach(events, function(eventHandler, type) {
                removeEventListenerFn(element, type, eventHandler), delete events[type];
            }) : forEach(type.split(" "), function(type) {
                isUndefined(fn) ? (removeEventListenerFn(element, type, events[type]), delete events[type]) : arrayRemove(events[type] || [], fn);
            }));
        }
        function jqLiteRemoveData(element, name) {
            var expandoId = element[jqName], expandoStore = jqCache[expandoId];
            if (expandoStore) {
                if (name) return void delete jqCache[expandoId].data[name];
                expandoStore.handle && (expandoStore.events.$destroy && expandoStore.handle({}, "$destroy"), 
                jqLiteOff(element)), delete jqCache[expandoId], element[jqName] = undefined;
            }
        }
        function jqLiteExpandoStore(element, key, value) {
            var expandoId = element[jqName], expandoStore = jqCache[expandoId || -1];
            return isDefined(value) ? (expandoStore || (element[jqName] = expandoId = jqNextId(), 
            expandoStore = jqCache[expandoId] = {}), void (expandoStore[key] = value)) : expandoStore && expandoStore[key];
        }
        function jqLiteData(element, key, value) {
            var data = jqLiteExpandoStore(element, "data"), isSetter = isDefined(value), keyDefined = !isSetter && isDefined(key), isSimpleGetter = keyDefined && !isObject(key);
            if (data || isSimpleGetter || jqLiteExpandoStore(element, "data", data = {}), isSetter) data[key] = value; else {
                if (!keyDefined) return data;
                if (isSimpleGetter) return data && data[key];
                extend(data, key);
            }
        }
        function jqLiteHasClass(element, selector) {
            return element.getAttribute ? (" " + (element.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ").indexOf(" " + selector + " ") > -1 : !1;
        }
        function jqLiteRemoveClass(element, cssClasses) {
            cssClasses && element.setAttribute && forEach(cssClasses.split(" "), function(cssClass) {
                element.setAttribute("class", trim((" " + (element.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ").replace(" " + trim(cssClass) + " ", " ")));
            });
        }
        function jqLiteAddClass(element, cssClasses) {
            if (cssClasses && element.setAttribute) {
                var existingClasses = (" " + (element.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ");
                forEach(cssClasses.split(" "), function(cssClass) {
                    cssClass = trim(cssClass), -1 === existingClasses.indexOf(" " + cssClass + " ") && (existingClasses += cssClass + " ");
                }), element.setAttribute("class", trim(existingClasses));
            }
        }
        function jqLiteAddNodes(root, elements) {
            if (elements) {
                elements = elements.nodeName || !isDefined(elements.length) || isWindow(elements) ? [ elements ] : elements;
                for (var i = 0; i < elements.length; i++) root.push(elements[i]);
            }
        }
        function jqLiteController(element, name) {
            return jqLiteInheritedData(element, "$" + (name || "ngController") + "Controller");
        }
        function jqLiteInheritedData(element, name, value) {
            element = jqLite(element), 9 == element[0].nodeType && (element = element.find("html"));
            for (var names = isArray(name) ? name : [ name ]; element.length; ) {
                for (var i = 0, ii = names.length; ii > i; i++) if ((value = element.data(names[i])) !== undefined) return value;
                element = element.parent();
            }
        }
        function jqLiteEmpty(element) {
            for (var i = 0, childNodes = element.childNodes; i < childNodes.length; i++) jqLiteDealoc(childNodes[i]);
            for (;element.firstChild; ) element.removeChild(element.firstChild);
        }
        function getBooleanAttrName(element, name) {
            var booleanAttr = BOOLEAN_ATTR[name.toLowerCase()];
            return booleanAttr && BOOLEAN_ELEMENTS[element.nodeName] && booleanAttr;
        }
        function createEventHandler(element, events) {
            var eventHandler = function(event, type) {
                if (event.preventDefault || (event.preventDefault = function() {
                    event.returnValue = !1;
                }), event.stopPropagation || (event.stopPropagation = function() {
                    event.cancelBubble = !0;
                }), event.target || (event.target = event.srcElement || document), isUndefined(event.defaultPrevented)) {
                    var prevent = event.preventDefault;
                    event.preventDefault = function() {
                        event.defaultPrevented = !0, prevent.call(event);
                    }, event.defaultPrevented = !1;
                }
                event.isDefaultPrevented = function() {
                    return event.defaultPrevented || event.returnValue === !1;
                };
                var eventHandlersCopy = shallowCopy(events[type || event.type] || []);
                forEach(eventHandlersCopy, function(fn) {
                    fn.call(element, event);
                }), 8 >= msie ? (event.preventDefault = null, event.stopPropagation = null, event.isDefaultPrevented = null) : (delete event.preventDefault, 
                delete event.stopPropagation, delete event.isDefaultPrevented);
            };
            return eventHandler.elem = element, eventHandler;
        }
        function hashKey(obj) {
            var key, objType = typeof obj;
            return "object" == objType && null !== obj ? "function" == typeof (key = obj.$$hashKey) ? key = obj.$$hashKey() : key === undefined && (key = obj.$$hashKey = nextUid()) : key = obj, 
            objType + ":" + key;
        }
        function HashMap(array) {
            forEach(array, this.put, this);
        }
        function annotate(fn) {
            var $inject, fnText, argDecl, last;
            return "function" == typeof fn ? ($inject = fn.$inject) || ($inject = [], fn.length && (fnText = fn.toString().replace(STRIP_COMMENTS, ""), 
            argDecl = fnText.match(FN_ARGS), forEach(argDecl[1].split(FN_ARG_SPLIT), function(arg) {
                arg.replace(FN_ARG, function(all, underscore, name) {
                    $inject.push(name);
                });
            })), fn.$inject = $inject) : isArray(fn) ? (last = fn.length - 1, assertArgFn(fn[last], "fn"), 
            $inject = fn.slice(0, last)) : assertArgFn(fn, "fn", !0), $inject;
        }
        function createInjector(modulesToLoad) {
            function supportObject(delegate) {
                return function(key, value) {
                    return isObject(key) ? void forEach(key, reverseParams(delegate)) : delegate(key, value);
                };
            }
            function provider(name, provider_) {
                if (assertNotHasOwnProperty(name, "service"), (isFunction(provider_) || isArray(provider_)) && (provider_ = providerInjector.instantiate(provider_)), 
                !provider_.$get) throw $injectorMinErr("pget", "Provider '{0}' must define $get factory method.", name);
                return providerCache[name + providerSuffix] = provider_;
            }
            function factory(name, factoryFn) {
                return provider(name, {
                    $get: factoryFn
                });
            }
            function service(name, constructor) {
                return factory(name, [ "$injector", function($injector) {
                    return $injector.instantiate(constructor);
                } ]);
            }
            function value(name, val) {
                return factory(name, valueFn(val));
            }
            function constant(name, value) {
                assertNotHasOwnProperty(name, "constant"), providerCache[name] = value, instanceCache[name] = value;
            }
            function decorator(serviceName, decorFn) {
                var origProvider = providerInjector.get(serviceName + providerSuffix), orig$get = origProvider.$get;
                origProvider.$get = function() {
                    var origInstance = instanceInjector.invoke(orig$get, origProvider);
                    return instanceInjector.invoke(decorFn, null, {
                        $delegate: origInstance
                    });
                };
            }
            function loadModules(modulesToLoad) {
                var moduleFn, invokeQueue, i, ii, runBlocks = [];
                return forEach(modulesToLoad, function(module) {
                    if (!loadedModules.get(module)) {
                        loadedModules.put(module, !0);
                        try {
                            if (isString(module)) for (moduleFn = angularModule(module), runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks), 
                            invokeQueue = moduleFn._invokeQueue, i = 0, ii = invokeQueue.length; ii > i; i++) {
                                var invokeArgs = invokeQueue[i], provider = providerInjector.get(invokeArgs[0]);
                                provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
                            } else isFunction(module) ? runBlocks.push(providerInjector.invoke(module)) : isArray(module) ? runBlocks.push(providerInjector.invoke(module)) : assertArgFn(module, "module");
                        } catch (e) {
                            throw isArray(module) && (module = module[module.length - 1]), e.message && e.stack && -1 == e.stack.indexOf(e.message) && (e = e.message + "\n" + e.stack), 
                            $injectorMinErr("modulerr", "Failed to instantiate module {0} due to:\n{1}", module, e.stack || e.message || e);
                        }
                    }
                }), runBlocks;
            }
            function createInternalInjector(cache, factory) {
                function getService(serviceName) {
                    if (cache.hasOwnProperty(serviceName)) {
                        if (cache[serviceName] === INSTANTIATING) throw $injectorMinErr("cdep", "Circular dependency found: {0}", path.join(" <- "));
                        return cache[serviceName];
                    }
                    try {
                        return path.unshift(serviceName), cache[serviceName] = INSTANTIATING, cache[serviceName] = factory(serviceName);
                    } catch (err) {
                        throw cache[serviceName] === INSTANTIATING && delete cache[serviceName], err;
                    } finally {
                        path.shift();
                    }
                }
                function invoke(fn, self, locals) {
                    var length, i, key, args = [], $inject = annotate(fn);
                    for (i = 0, length = $inject.length; length > i; i++) {
                        if (key = $inject[i], "string" != typeof key) throw $injectorMinErr("itkn", "Incorrect injection token! Expected service name as string, got {0}", key);
                        args.push(locals && locals.hasOwnProperty(key) ? locals[key] : getService(key));
                    }
                    return fn.$inject || (fn = fn[length]), fn.apply(self, args);
                }
                function instantiate(Type, locals) {
                    var instance, returnedValue, Constructor = function() {};
                    return Constructor.prototype = (isArray(Type) ? Type[Type.length - 1] : Type).prototype, 
                    instance = new Constructor(), returnedValue = invoke(Type, instance, locals), isObject(returnedValue) || isFunction(returnedValue) ? returnedValue : instance;
                }
                return {
                    invoke: invoke,
                    instantiate: instantiate,
                    get: getService,
                    annotate: annotate,
                    has: function(name) {
                        return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
                    }
                };
            }
            var INSTANTIATING = {}, providerSuffix = "Provider", path = [], loadedModules = new HashMap(), providerCache = {
                $provide: {
                    provider: supportObject(provider),
                    factory: supportObject(factory),
                    service: supportObject(service),
                    value: supportObject(value),
                    constant: supportObject(constant),
                    decorator: decorator
                }
            }, providerInjector = providerCache.$injector = createInternalInjector(providerCache, function() {
                throw $injectorMinErr("unpr", "Unknown provider: {0}", path.join(" <- "));
            }), instanceCache = {}, instanceInjector = instanceCache.$injector = createInternalInjector(instanceCache, function(servicename) {
                var provider = providerInjector.get(servicename + providerSuffix);
                return instanceInjector.invoke(provider.$get, provider);
            });
            return forEach(loadModules(modulesToLoad), function(fn) {
                instanceInjector.invoke(fn || noop);
            }), instanceInjector;
        }
        function $AnchorScrollProvider() {
            var autoScrollingEnabled = !0;
            this.disableAutoScrolling = function() {
                autoScrollingEnabled = !1;
            }, this.$get = [ "$window", "$location", "$rootScope", function($window, $location, $rootScope) {
                function getFirstAnchor(list) {
                    var result = null;
                    return forEach(list, function(element) {
                        result || "a" !== lowercase(element.nodeName) || (result = element);
                    }), result;
                }
                function scroll() {
                    var elm, hash = $location.hash();
                    hash ? (elm = document.getElementById(hash)) ? elm.scrollIntoView() : (elm = getFirstAnchor(document.getElementsByName(hash))) ? elm.scrollIntoView() : "top" === hash && $window.scrollTo(0, 0) : $window.scrollTo(0, 0);
                }
                var document = $window.document;
                return autoScrollingEnabled && $rootScope.$watch(function() {
                    return $location.hash();
                }, function() {
                    $rootScope.$evalAsync(scroll);
                }), scroll;
            } ];
        }
        function Browser(window, document, $log, $sniffer) {
            function completeOutstandingRequest(fn) {
                try {
                    fn.apply(null, sliceArgs(arguments, 1));
                } finally {
                    if (outstandingRequestCount--, 0 === outstandingRequestCount) for (;outstandingRequestCallbacks.length; ) try {
                        outstandingRequestCallbacks.pop()();
                    } catch (e) {
                        $log.error(e);
                    }
                }
            }
            function startPoller(interval, setTimeout) {
                !function check() {
                    forEach(pollFns, function(pollFn) {
                        pollFn();
                    }), pollTimeout = setTimeout(check, interval);
                }();
            }
            function fireUrlChange() {
                newLocation = null, lastBrowserUrl != self.url() && (lastBrowserUrl = self.url(), 
                forEach(urlChangeListeners, function(listener) {
                    listener(self.url());
                }));
            }
            var self = this, rawDocument = document[0], location = window.location, history = window.history, setTimeout = window.setTimeout, clearTimeout = window.clearTimeout, pendingDeferIds = {};
            self.isMock = !1;
            var outstandingRequestCount = 0, outstandingRequestCallbacks = [];
            self.$$completeOutstandingRequest = completeOutstandingRequest, self.$$incOutstandingRequestCount = function() {
                outstandingRequestCount++;
            }, self.notifyWhenNoOutstandingRequests = function(callback) {
                forEach(pollFns, function(pollFn) {
                    pollFn();
                }), 0 === outstandingRequestCount ? callback() : outstandingRequestCallbacks.push(callback);
            };
            var pollTimeout, pollFns = [];
            self.addPollFn = function(fn) {
                return isUndefined(pollTimeout) && startPoller(100, setTimeout), pollFns.push(fn), 
                fn;
            };
            var lastBrowserUrl = location.href, baseElement = document.find("base"), newLocation = null;
            self.url = function(url, replace) {
                if (location !== window.location && (location = window.location), history !== window.history && (history = window.history), 
                url) {
                    if (lastBrowserUrl == url) return;
                    return lastBrowserUrl = url, $sniffer.history ? replace ? history.replaceState(null, "", url) : (history.pushState(null, "", url), 
                    baseElement.attr("href", baseElement.attr("href"))) : (newLocation = url, replace ? location.replace(url) : location.href = url), 
                    self;
                }
                return newLocation || location.href.replace(/%27/g, "'");
            };
            var urlChangeListeners = [], urlChangeInit = !1;
            self.onUrlChange = function(callback) {
                return urlChangeInit || ($sniffer.history && jqLite(window).on("popstate", fireUrlChange), 
                $sniffer.hashchange ? jqLite(window).on("hashchange", fireUrlChange) : self.addPollFn(fireUrlChange), 
                urlChangeInit = !0), urlChangeListeners.push(callback), callback;
            }, self.baseHref = function() {
                var href = baseElement.attr("href");
                return href ? href.replace(/^(https?\:)?\/\/[^\/]*/, "") : "";
            };
            var lastCookies = {}, lastCookieString = "", cookiePath = self.baseHref();
            self.cookies = function(name, value) {
                var cookieLength, cookieArray, cookie, i, index;
                if (!name) {
                    if (rawDocument.cookie !== lastCookieString) for (lastCookieString = rawDocument.cookie, 
                    cookieArray = lastCookieString.split("; "), lastCookies = {}, i = 0; i < cookieArray.length; i++) cookie = cookieArray[i], 
                    index = cookie.indexOf("="), index > 0 && (name = unescape(cookie.substring(0, index)), 
                    lastCookies[name] === undefined && (lastCookies[name] = unescape(cookie.substring(index + 1))));
                    return lastCookies;
                }
                value === undefined ? rawDocument.cookie = escape(name) + "=;path=" + cookiePath + ";expires=Thu, 01 Jan 1970 00:00:00 GMT" : isString(value) && (cookieLength = (rawDocument.cookie = escape(name) + "=" + escape(value) + ";path=" + cookiePath).length + 1, 
                cookieLength > 4096 && $log.warn("Cookie '" + name + "' possibly not set or overflowed because it was too large (" + cookieLength + " > 4096 bytes)!"));
            }, self.defer = function(fn, delay) {
                var timeoutId;
                return outstandingRequestCount++, timeoutId = setTimeout(function() {
                    delete pendingDeferIds[timeoutId], completeOutstandingRequest(fn);
                }, delay || 0), pendingDeferIds[timeoutId] = !0, timeoutId;
            }, self.defer.cancel = function(deferId) {
                return pendingDeferIds[deferId] ? (delete pendingDeferIds[deferId], clearTimeout(deferId), 
                completeOutstandingRequest(noop), !0) : !1;
            };
        }
        function $BrowserProvider() {
            this.$get = [ "$window", "$log", "$sniffer", "$document", function($window, $log, $sniffer, $document) {
                return new Browser($window, $document, $log, $sniffer);
            } ];
        }
        function $CacheFactoryProvider() {
            this.$get = function() {
                function cacheFactory(cacheId, options) {
                    function refresh(entry) {
                        entry != freshEnd && (staleEnd ? staleEnd == entry && (staleEnd = entry.n) : staleEnd = entry, 
                        link(entry.n, entry.p), link(entry, freshEnd), freshEnd = entry, freshEnd.n = null);
                    }
                    function link(nextEntry, prevEntry) {
                        nextEntry != prevEntry && (nextEntry && (nextEntry.p = prevEntry), prevEntry && (prevEntry.n = nextEntry));
                    }
                    if (cacheId in caches) throw minErr("$cacheFactory")("iid", "CacheId '{0}' is already taken!", cacheId);
                    var size = 0, stats = extend({}, options, {
                        id: cacheId
                    }), data = {}, capacity = options && options.capacity || Number.MAX_VALUE, lruHash = {}, freshEnd = null, staleEnd = null;
                    return caches[cacheId] = {
                        put: function(key, value) {
                            var lruEntry = lruHash[key] || (lruHash[key] = {
                                key: key
                            });
                            return refresh(lruEntry), isUndefined(value) ? void 0 : (key in data || size++, 
                            data[key] = value, size > capacity && this.remove(staleEnd.key), value);
                        },
                        get: function(key) {
                            var lruEntry = lruHash[key];
                            if (lruEntry) return refresh(lruEntry), data[key];
                        },
                        remove: function(key) {
                            var lruEntry = lruHash[key];
                            lruEntry && (lruEntry == freshEnd && (freshEnd = lruEntry.p), lruEntry == staleEnd && (staleEnd = lruEntry.n), 
                            link(lruEntry.n, lruEntry.p), delete lruHash[key], delete data[key], size--);
                        },
                        removeAll: function() {
                            data = {}, size = 0, lruHash = {}, freshEnd = staleEnd = null;
                        },
                        destroy: function() {
                            data = null, stats = null, lruHash = null, delete caches[cacheId];
                        },
                        info: function() {
                            return extend({}, stats, {
                                size: size
                            });
                        }
                    };
                }
                var caches = {};
                return cacheFactory.info = function() {
                    var info = {};
                    return forEach(caches, function(cache, cacheId) {
                        info[cacheId] = cache.info();
                    }), info;
                }, cacheFactory.get = function(cacheId) {
                    return caches[cacheId];
                }, cacheFactory;
            };
        }
        function $TemplateCacheProvider() {
            this.$get = [ "$cacheFactory", function($cacheFactory) {
                return $cacheFactory("templates");
            } ];
        }
        function $CompileProvider($provide, $$sanitizeUriProvider) {
            var hasDirectives = {}, Suffix = "Directive", COMMENT_DIRECTIVE_REGEXP = /^\s*directive\:\s*([\d\w\-_]+)\s+(.*)$/, CLASS_DIRECTIVE_REGEXP = /(([\d\w\-_]+)(?:\:([^;]+))?;?)/, EVENT_HANDLER_ATTR_REGEXP = /^(on[a-z]+|formaction)$/;
            this.directive = function registerDirective(name, directiveFactory) {
                return assertNotHasOwnProperty(name, "directive"), isString(name) ? (assertArg(directiveFactory, "directiveFactory"), 
                hasDirectives.hasOwnProperty(name) || (hasDirectives[name] = [], $provide.factory(name + Suffix, [ "$injector", "$exceptionHandler", function($injector, $exceptionHandler) {
                    var directives = [];
                    return forEach(hasDirectives[name], function(directiveFactory, index) {
                        try {
                            var directive = $injector.invoke(directiveFactory);
                            isFunction(directive) ? directive = {
                                compile: valueFn(directive)
                            } : !directive.compile && directive.link && (directive.compile = valueFn(directive.link)), 
                            directive.priority = directive.priority || 0, directive.index = index, directive.name = directive.name || name, 
                            directive.require = directive.require || directive.controller && directive.name, 
                            directive.restrict = directive.restrict || "A", directives.push(directive);
                        } catch (e) {
                            $exceptionHandler(e);
                        }
                    }), directives;
                } ])), hasDirectives[name].push(directiveFactory)) : forEach(name, reverseParams(registerDirective)), 
                this;
            }, this.aHrefSanitizationWhitelist = function(regexp) {
                return isDefined(regexp) ? ($$sanitizeUriProvider.aHrefSanitizationWhitelist(regexp), 
                this) : $$sanitizeUriProvider.aHrefSanitizationWhitelist();
            }, this.imgSrcSanitizationWhitelist = function(regexp) {
                return isDefined(regexp) ? ($$sanitizeUriProvider.imgSrcSanitizationWhitelist(regexp), 
                this) : $$sanitizeUriProvider.imgSrcSanitizationWhitelist();
            }, this.$get = [ "$injector", "$interpolate", "$exceptionHandler", "$http", "$templateCache", "$parse", "$controller", "$rootScope", "$document", "$sce", "$animate", "$$sanitizeUri", function($injector, $interpolate, $exceptionHandler, $http, $templateCache, $parse, $controller, $rootScope, $document, $sce, $animate, $$sanitizeUri) {
                function compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext) {
                    $compileNodes instanceof jqLite || ($compileNodes = jqLite($compileNodes)), forEach($compileNodes, function(node, index) {
                        3 == node.nodeType && node.nodeValue.match(/\S+/) && ($compileNodes[index] = node = jqLite(node).wrap("<span></span>").parent()[0]);
                    });
                    var compositeLinkFn = compileNodes($compileNodes, transcludeFn, $compileNodes, maxPriority, ignoreDirective, previousCompileContext);
                    return safeAddClass($compileNodes, "ng-scope"), function(scope, cloneConnectFn, transcludeControllers) {
                        assertArg(scope, "scope");
                        var $linkNode = cloneConnectFn ? JQLitePrototype.clone.call($compileNodes) : $compileNodes;
                        forEach(transcludeControllers, function(instance, name) {
                            $linkNode.data("$" + name + "Controller", instance);
                        });
                        for (var i = 0, ii = $linkNode.length; ii > i; i++) {
                            var node = $linkNode[i], nodeType = node.nodeType;
                            (1 === nodeType || 9 === nodeType) && $linkNode.eq(i).data("$scope", scope);
                        }
                        return cloneConnectFn && cloneConnectFn($linkNode, scope), compositeLinkFn && compositeLinkFn(scope, $linkNode, $linkNode), 
                        $linkNode;
                    };
                }
                function safeAddClass($element, className) {
                    try {
                        $element.addClass(className);
                    } catch (e) {}
                }
                function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext) {
                    function compositeLinkFn(scope, nodeList, $rootElement, boundTranscludeFn) {
                        var nodeLinkFn, childLinkFn, node, $node, childScope, childTranscludeFn, i, ii, n, nodeListLength = nodeList.length, stableNodeList = new Array(nodeListLength);
                        for (i = 0; nodeListLength > i; i++) stableNodeList[i] = nodeList[i];
                        for (i = 0, n = 0, ii = linkFns.length; ii > i; n++) node = stableNodeList[n], nodeLinkFn = linkFns[i++], 
                        childLinkFn = linkFns[i++], $node = jqLite(node), nodeLinkFn ? (nodeLinkFn.scope ? (childScope = scope.$new(), 
                        $node.data("$scope", childScope)) : childScope = scope, childTranscludeFn = nodeLinkFn.transclude, 
                        childTranscludeFn || !boundTranscludeFn && transcludeFn ? nodeLinkFn(childLinkFn, childScope, node, $rootElement, createBoundTranscludeFn(scope, childTranscludeFn || transcludeFn)) : nodeLinkFn(childLinkFn, childScope, node, $rootElement, boundTranscludeFn)) : childLinkFn && childLinkFn(scope, node.childNodes, undefined, boundTranscludeFn);
                    }
                    for (var attrs, directives, nodeLinkFn, childNodes, childLinkFn, linkFnFound, linkFns = [], i = 0; i < nodeList.length; i++) attrs = new Attributes(), 
                    directives = collectDirectives(nodeList[i], [], attrs, 0 === i ? maxPriority : undefined, ignoreDirective), 
                    nodeLinkFn = directives.length ? applyDirectivesToNode(directives, nodeList[i], attrs, transcludeFn, $rootElement, null, [], [], previousCompileContext) : null, 
                    nodeLinkFn && nodeLinkFn.scope && safeAddClass(jqLite(nodeList[i]), "ng-scope"), 
                    childLinkFn = nodeLinkFn && nodeLinkFn.terminal || !(childNodes = nodeList[i].childNodes) || !childNodes.length ? null : compileNodes(childNodes, nodeLinkFn ? nodeLinkFn.transclude : transcludeFn), 
                    linkFns.push(nodeLinkFn, childLinkFn), linkFnFound = linkFnFound || nodeLinkFn || childLinkFn, 
                    previousCompileContext = null;
                    return linkFnFound ? compositeLinkFn : null;
                }
                function createBoundTranscludeFn(scope, transcludeFn) {
                    return function(transcludedScope, cloneFn, controllers) {
                        var scopeCreated = !1;
                        transcludedScope || (transcludedScope = scope.$new(), transcludedScope.$$transcluded = !0, 
                        scopeCreated = !0);
                        var clone = transcludeFn(transcludedScope, cloneFn, controllers);
                        return scopeCreated && clone.on("$destroy", bind(transcludedScope, transcludedScope.$destroy)), 
                        clone;
                    };
                }
                function collectDirectives(node, directives, attrs, maxPriority, ignoreDirective) {
                    var match, className, nodeType = node.nodeType, attrsMap = attrs.$attr;
                    switch (nodeType) {
                      case 1:
                        addDirective(directives, directiveNormalize(nodeName_(node).toLowerCase()), "E", maxPriority, ignoreDirective);
                        for (var attr, name, nName, ngAttrName, value, nAttrs = node.attributes, j = 0, jj = nAttrs && nAttrs.length; jj > j; j++) {
                            var attrStartName = !1, attrEndName = !1;
                            if (attr = nAttrs[j], !msie || msie >= 8 || attr.specified) {
                                name = attr.name, ngAttrName = directiveNormalize(name), NG_ATTR_BINDING.test(ngAttrName) && (name = snake_case(ngAttrName.substr(6), "-"));
                                var directiveNName = ngAttrName.replace(/(Start|End)$/, "");
                                ngAttrName === directiveNName + "Start" && (attrStartName = name, attrEndName = name.substr(0, name.length - 5) + "end", 
                                name = name.substr(0, name.length - 6)), nName = directiveNormalize(name.toLowerCase()), 
                                attrsMap[nName] = name, attrs[nName] = value = trim(attr.value), getBooleanAttrName(node, nName) && (attrs[nName] = !0), 
                                addAttrInterpolateDirective(node, directives, value, nName), addDirective(directives, nName, "A", maxPriority, ignoreDirective, attrStartName, attrEndName);
                            }
                        }
                        if (className = node.className, isString(className) && "" !== className) for (;match = CLASS_DIRECTIVE_REGEXP.exec(className); ) nName = directiveNormalize(match[2]), 
                        addDirective(directives, nName, "C", maxPriority, ignoreDirective) && (attrs[nName] = trim(match[3])), 
                        className = className.substr(match.index + match[0].length);
                        break;

                      case 3:
                        addTextInterpolateDirective(directives, node.nodeValue);
                        break;

                      case 8:
                        try {
                            match = COMMENT_DIRECTIVE_REGEXP.exec(node.nodeValue), match && (nName = directiveNormalize(match[1]), 
                            addDirective(directives, nName, "M", maxPriority, ignoreDirective) && (attrs[nName] = trim(match[2])));
                        } catch (e) {}
                    }
                    return directives.sort(byPriority), directives;
                }
                function groupScan(node, attrStart, attrEnd) {
                    var nodes = [], depth = 0;
                    if (attrStart && node.hasAttribute && node.hasAttribute(attrStart)) {
                        do {
                            if (!node) throw $compileMinErr("uterdir", "Unterminated attribute, found '{0}' but no matching '{1}' found.", attrStart, attrEnd);
                            1 == node.nodeType && (node.hasAttribute(attrStart) && depth++, node.hasAttribute(attrEnd) && depth--), 
                            nodes.push(node), node = node.nextSibling;
                        } while (depth > 0);
                    } else nodes.push(node);
                    return jqLite(nodes);
                }
                function groupElementsLinkFnWrapper(linkFn, attrStart, attrEnd) {
                    return function(scope, element, attrs, controllers, transcludeFn) {
                        return element = groupScan(element[0], attrStart, attrEnd), linkFn(scope, element, attrs, controllers, transcludeFn);
                    };
                }
                function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns, previousCompileContext) {
                    function addLinkFns(pre, post, attrStart, attrEnd) {
                        pre && (attrStart && (pre = groupElementsLinkFnWrapper(pre, attrStart, attrEnd)), 
                        pre.require = directive.require, (newIsolateScopeDirective === directive || directive.$$isolateScope) && (pre = cloneAndAnnotateFn(pre, {
                            isolateScope: !0
                        })), preLinkFns.push(pre)), post && (attrStart && (post = groupElementsLinkFnWrapper(post, attrStart, attrEnd)), 
                        post.require = directive.require, (newIsolateScopeDirective === directive || directive.$$isolateScope) && (post = cloneAndAnnotateFn(post, {
                            isolateScope: !0
                        })), postLinkFns.push(post));
                    }
                    function getControllers(require, $element, elementControllers) {
                        var value, retrievalMethod = "data", optional = !1;
                        if (isString(require)) {
                            for (;"^" == (value = require.charAt(0)) || "?" == value; ) require = require.substr(1), 
                            "^" == value && (retrievalMethod = "inheritedData"), optional = optional || "?" == value;
                            if (value = null, elementControllers && "data" === retrievalMethod && (value = elementControllers[require]), 
                            value = value || $element[retrievalMethod]("$" + require + "Controller"), !value && !optional) throw $compileMinErr("ctreq", "Controller '{0}', required by directive '{1}', can't be found!", require, directiveName);
                            return value;
                        }
                        return isArray(require) && (value = [], forEach(require, function(require) {
                            value.push(getControllers(require, $element, elementControllers));
                        })), value;
                    }
                    function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn) {
                        function controllersBoundTransclude(scope, cloneAttachFn) {
                            var transcludeControllers;
                            return arguments.length < 2 && (cloneAttachFn = scope, scope = undefined), hasElementTranscludeDirective && (transcludeControllers = elementControllers), 
                            boundTranscludeFn(scope, cloneAttachFn, transcludeControllers);
                        }
                        var attrs, $element, i, ii, linkFn, controller, isolateScope, transcludeFn, elementControllers = {};
                        if (attrs = compileNode === linkNode ? templateAttrs : shallowCopy(templateAttrs, new Attributes(jqLite(linkNode), templateAttrs.$attr)), 
                        $element = attrs.$$element, newIsolateScopeDirective) {
                            var LOCAL_REGEXP = /^\s*([@=&])(\??)\s*(\w*)\s*$/, $linkNode = jqLite(linkNode);
                            isolateScope = scope.$new(!0), templateDirective && templateDirective === newIsolateScopeDirective.$$originalDirective ? $linkNode.data("$isolateScope", isolateScope) : $linkNode.data("$isolateScopeNoTemplate", isolateScope), 
                            safeAddClass($linkNode, "ng-isolate-scope"), forEach(newIsolateScopeDirective.scope, function(definition, scopeName) {
                                var lastValue, parentGet, parentSet, compare, match = definition.match(LOCAL_REGEXP) || [], attrName = match[3] || scopeName, optional = "?" == match[2], mode = match[1];
                                switch (isolateScope.$$isolateBindings[scopeName] = mode + attrName, mode) {
                                  case "@":
                                    attrs.$observe(attrName, function(value) {
                                        isolateScope[scopeName] = value;
                                    }), attrs.$$observers[attrName].$$scope = scope, attrs[attrName] && (isolateScope[scopeName] = $interpolate(attrs[attrName])(scope));
                                    break;

                                  case "=":
                                    if (optional && !attrs[attrName]) return;
                                    parentGet = $parse(attrs[attrName]), compare = parentGet.literal ? equals : function(a, b) {
                                        return a === b;
                                    }, parentSet = parentGet.assign || function() {
                                        throw lastValue = isolateScope[scopeName] = parentGet(scope), $compileMinErr("nonassign", "Expression '{0}' used with directive '{1}' is non-assignable!", attrs[attrName], newIsolateScopeDirective.name);
                                    }, lastValue = isolateScope[scopeName] = parentGet(scope), isolateScope.$watch(function() {
                                        var parentValue = parentGet(scope);
                                        return compare(parentValue, isolateScope[scopeName]) || (compare(parentValue, lastValue) ? parentSet(scope, parentValue = isolateScope[scopeName]) : isolateScope[scopeName] = parentValue), 
                                        lastValue = parentValue;
                                    }, null, parentGet.literal);
                                    break;

                                  case "&":
                                    parentGet = $parse(attrs[attrName]), isolateScope[scopeName] = function(locals) {
                                        return parentGet(scope, locals);
                                    };
                                    break;

                                  default:
                                    throw $compileMinErr("iscp", "Invalid isolate scope definition for directive '{0}'. Definition: {... {1}: '{2}' ...}", newIsolateScopeDirective.name, scopeName, definition);
                                }
                            });
                        }
                        for (transcludeFn = boundTranscludeFn && controllersBoundTransclude, controllerDirectives && forEach(controllerDirectives, function(directive) {
                            var controllerInstance, locals = {
                                $scope: directive === newIsolateScopeDirective || directive.$$isolateScope ? isolateScope : scope,
                                $element: $element,
                                $attrs: attrs,
                                $transclude: transcludeFn
                            };
                            controller = directive.controller, "@" == controller && (controller = attrs[directive.name]), 
                            controllerInstance = $controller(controller, locals), elementControllers[directive.name] = controllerInstance, 
                            hasElementTranscludeDirective || $element.data("$" + directive.name + "Controller", controllerInstance), 
                            directive.controllerAs && (locals.$scope[directive.controllerAs] = controllerInstance);
                        }), i = 0, ii = preLinkFns.length; ii > i; i++) try {
                            linkFn = preLinkFns[i], linkFn(linkFn.isolateScope ? isolateScope : scope, $element, attrs, linkFn.require && getControllers(linkFn.require, $element, elementControllers), transcludeFn);
                        } catch (e) {
                            $exceptionHandler(e, startingTag($element));
                        }
                        var scopeToChild = scope;
                        for (newIsolateScopeDirective && (newIsolateScopeDirective.template || null === newIsolateScopeDirective.templateUrl) && (scopeToChild = isolateScope), 
                        childLinkFn && childLinkFn(scopeToChild, linkNode.childNodes, undefined, boundTranscludeFn), 
                        i = postLinkFns.length - 1; i >= 0; i--) try {
                            linkFn = postLinkFns[i], linkFn(linkFn.isolateScope ? isolateScope : scope, $element, attrs, linkFn.require && getControllers(linkFn.require, $element, elementControllers), transcludeFn);
                        } catch (e) {
                            $exceptionHandler(e, startingTag($element));
                        }
                    }
                    previousCompileContext = previousCompileContext || {};
                    for (var newScopeDirective, directive, directiveName, $template, linkFn, directiveValue, terminalPriority = -Number.MAX_VALUE, controllerDirectives = previousCompileContext.controllerDirectives, newIsolateScopeDirective = previousCompileContext.newIsolateScopeDirective, templateDirective = previousCompileContext.templateDirective, nonTlbTranscludeDirective = previousCompileContext.nonTlbTranscludeDirective, hasTranscludeDirective = !1, hasElementTranscludeDirective = !1, $compileNode = templateAttrs.$$element = jqLite(compileNode), replaceDirective = originalReplaceDirective, childTranscludeFn = transcludeFn, i = 0, ii = directives.length; ii > i; i++) {
                        directive = directives[i];
                        var attrStart = directive.$$start, attrEnd = directive.$$end;
                        if (attrStart && ($compileNode = groupScan(compileNode, attrStart, attrEnd)), $template = undefined, 
                        terminalPriority > directive.priority) break;
                        if ((directiveValue = directive.scope) && (newScopeDirective = newScopeDirective || directive, 
                        directive.templateUrl || (assertNoDuplicate("new/isolated scope", newIsolateScopeDirective, directive, $compileNode), 
                        isObject(directiveValue) && (newIsolateScopeDirective = directive))), directiveName = directive.name, 
                        !directive.templateUrl && directive.controller && (directiveValue = directive.controller, 
                        controllerDirectives = controllerDirectives || {}, assertNoDuplicate("'" + directiveName + "' controller", controllerDirectives[directiveName], directive, $compileNode), 
                        controllerDirectives[directiveName] = directive), (directiveValue = directive.transclude) && (hasTranscludeDirective = !0, 
                        directive.$$tlb || (assertNoDuplicate("transclusion", nonTlbTranscludeDirective, directive, $compileNode), 
                        nonTlbTranscludeDirective = directive), "element" == directiveValue ? (hasElementTranscludeDirective = !0, 
                        terminalPriority = directive.priority, $template = groupScan(compileNode, attrStart, attrEnd), 
                        $compileNode = templateAttrs.$$element = jqLite(document.createComment(" " + directiveName + ": " + templateAttrs[directiveName] + " ")), 
                        compileNode = $compileNode[0], replaceWith(jqCollection, jqLite(sliceArgs($template)), compileNode), 
                        childTranscludeFn = compile($template, transcludeFn, terminalPriority, replaceDirective && replaceDirective.name, {
                            nonTlbTranscludeDirective: nonTlbTranscludeDirective
                        })) : ($template = jqLite(jqLiteClone(compileNode)).contents(), $compileNode.empty(), 
                        childTranscludeFn = compile($template, transcludeFn))), directive.template) if (assertNoDuplicate("template", templateDirective, directive, $compileNode), 
                        templateDirective = directive, directiveValue = isFunction(directive.template) ? directive.template($compileNode, templateAttrs) : directive.template, 
                        directiveValue = denormalizeTemplate(directiveValue), directive.replace) {
                            if (replaceDirective = directive, $template = jqLite("<div>" + trim(directiveValue) + "</div>").contents(), 
                            compileNode = $template[0], 1 != $template.length || 1 !== compileNode.nodeType) throw $compileMinErr("tplrt", "Template for directive '{0}' must have exactly one root element. {1}", directiveName, "");
                            replaceWith(jqCollection, $compileNode, compileNode);
                            var newTemplateAttrs = {
                                $attr: {}
                            }, templateDirectives = collectDirectives(compileNode, [], newTemplateAttrs), unprocessedDirectives = directives.splice(i + 1, directives.length - (i + 1));
                            newIsolateScopeDirective && markDirectivesAsIsolate(templateDirectives), directives = directives.concat(templateDirectives).concat(unprocessedDirectives), 
                            mergeTemplateAttributes(templateAttrs, newTemplateAttrs), ii = directives.length;
                        } else $compileNode.html(directiveValue);
                        if (directive.templateUrl) assertNoDuplicate("template", templateDirective, directive, $compileNode), 
                        templateDirective = directive, directive.replace && (replaceDirective = directive), 
                        nodeLinkFn = compileTemplateUrl(directives.splice(i, directives.length - i), $compileNode, templateAttrs, jqCollection, childTranscludeFn, preLinkFns, postLinkFns, {
                            controllerDirectives: controllerDirectives,
                            newIsolateScopeDirective: newIsolateScopeDirective,
                            templateDirective: templateDirective,
                            nonTlbTranscludeDirective: nonTlbTranscludeDirective
                        }), ii = directives.length; else if (directive.compile) try {
                            linkFn = directive.compile($compileNode, templateAttrs, childTranscludeFn), isFunction(linkFn) ? addLinkFns(null, linkFn, attrStart, attrEnd) : linkFn && addLinkFns(linkFn.pre, linkFn.post, attrStart, attrEnd);
                        } catch (e) {
                            $exceptionHandler(e, startingTag($compileNode));
                        }
                        directive.terminal && (nodeLinkFn.terminal = !0, terminalPriority = Math.max(terminalPriority, directive.priority));
                    }
                    return nodeLinkFn.scope = newScopeDirective && newScopeDirective.scope === !0, nodeLinkFn.transclude = hasTranscludeDirective && childTranscludeFn, 
                    nodeLinkFn;
                }
                function markDirectivesAsIsolate(directives) {
                    for (var j = 0, jj = directives.length; jj > j; j++) directives[j] = inherit(directives[j], {
                        $$isolateScope: !0
                    });
                }
                function addDirective(tDirectives, name, location, maxPriority, ignoreDirective, startAttrName, endAttrName) {
                    if (name === ignoreDirective) return null;
                    var match = null;
                    if (hasDirectives.hasOwnProperty(name)) for (var directive, directives = $injector.get(name + Suffix), i = 0, ii = directives.length; ii > i; i++) try {
                        directive = directives[i], (maxPriority === undefined || maxPriority > directive.priority) && -1 != directive.restrict.indexOf(location) && (startAttrName && (directive = inherit(directive, {
                            $$start: startAttrName,
                            $$end: endAttrName
                        })), tDirectives.push(directive), match = directive);
                    } catch (e) {
                        $exceptionHandler(e);
                    }
                    return match;
                }
                function mergeTemplateAttributes(dst, src) {
                    var srcAttr = src.$attr, dstAttr = dst.$attr, $element = dst.$$element;
                    forEach(dst, function(value, key) {
                        "$" != key.charAt(0) && (src[key] && (value += ("style" === key ? ";" : " ") + src[key]), 
                        dst.$set(key, value, !0, srcAttr[key]));
                    }), forEach(src, function(value, key) {
                        "class" == key ? (safeAddClass($element, value), dst["class"] = (dst["class"] ? dst["class"] + " " : "") + value) : "style" == key ? ($element.attr("style", $element.attr("style") + ";" + value), 
                        dst.style = (dst.style ? dst.style + ";" : "") + value) : "$" == key.charAt(0) || dst.hasOwnProperty(key) || (dst[key] = value, 
                        dstAttr[key] = srcAttr[key]);
                    });
                }
                function compileTemplateUrl(directives, $compileNode, tAttrs, $rootElement, childTranscludeFn, preLinkFns, postLinkFns, previousCompileContext) {
                    var afterTemplateNodeLinkFn, afterTemplateChildLinkFn, linkQueue = [], beforeTemplateCompileNode = $compileNode[0], origAsyncDirective = directives.shift(), derivedSyncDirective = extend({}, origAsyncDirective, {
                        templateUrl: null,
                        transclude: null,
                        replace: null,
                        $$originalDirective: origAsyncDirective
                    }), templateUrl = isFunction(origAsyncDirective.templateUrl) ? origAsyncDirective.templateUrl($compileNode, tAttrs) : origAsyncDirective.templateUrl;
                    return $compileNode.empty(), $http.get($sce.getTrustedResourceUrl(templateUrl), {
                        cache: $templateCache
                    }).success(function(content) {
                        var compileNode, tempTemplateAttrs, $template, childBoundTranscludeFn;
                        if (content = denormalizeTemplate(content), origAsyncDirective.replace) {
                            if ($template = jqLite("<div>" + trim(content) + "</div>").contents(), compileNode = $template[0], 
                            1 != $template.length || 1 !== compileNode.nodeType) throw $compileMinErr("tplrt", "Template for directive '{0}' must have exactly one root element. {1}", origAsyncDirective.name, templateUrl);
                            tempTemplateAttrs = {
                                $attr: {}
                            }, replaceWith($rootElement, $compileNode, compileNode);
                            var templateDirectives = collectDirectives(compileNode, [], tempTemplateAttrs);
                            isObject(origAsyncDirective.scope) && markDirectivesAsIsolate(templateDirectives), 
                            directives = templateDirectives.concat(directives), mergeTemplateAttributes(tAttrs, tempTemplateAttrs);
                        } else compileNode = beforeTemplateCompileNode, $compileNode.html(content);
                        for (directives.unshift(derivedSyncDirective), afterTemplateNodeLinkFn = applyDirectivesToNode(directives, compileNode, tAttrs, childTranscludeFn, $compileNode, origAsyncDirective, preLinkFns, postLinkFns, previousCompileContext), 
                        forEach($rootElement, function(node, i) {
                            node == compileNode && ($rootElement[i] = $compileNode[0]);
                        }), afterTemplateChildLinkFn = compileNodes($compileNode[0].childNodes, childTranscludeFn); linkQueue.length; ) {
                            var scope = linkQueue.shift(), beforeTemplateLinkNode = linkQueue.shift(), linkRootElement = linkQueue.shift(), boundTranscludeFn = linkQueue.shift(), linkNode = $compileNode[0];
                            if (beforeTemplateLinkNode !== beforeTemplateCompileNode) {
                                var oldClasses = beforeTemplateLinkNode.className;
                                linkNode = jqLiteClone(compileNode), replaceWith(linkRootElement, jqLite(beforeTemplateLinkNode), linkNode), 
                                safeAddClass(jqLite(linkNode), oldClasses);
                            }
                            childBoundTranscludeFn = afterTemplateNodeLinkFn.transclude ? createBoundTranscludeFn(scope, afterTemplateNodeLinkFn.transclude) : boundTranscludeFn, 
                            afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, linkNode, $rootElement, childBoundTranscludeFn);
                        }
                        linkQueue = null;
                    }).error(function(response, code, headers, config) {
                        throw $compileMinErr("tpload", "Failed to load template: {0}", config.url);
                    }), function(ignoreChildLinkFn, scope, node, rootElement, boundTranscludeFn) {
                        linkQueue ? (linkQueue.push(scope), linkQueue.push(node), linkQueue.push(rootElement), 
                        linkQueue.push(boundTranscludeFn)) : afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, node, rootElement, boundTranscludeFn);
                    };
                }
                function byPriority(a, b) {
                    var diff = b.priority - a.priority;
                    return 0 !== diff ? diff : a.name !== b.name ? a.name < b.name ? -1 : 1 : a.index - b.index;
                }
                function assertNoDuplicate(what, previousDirective, directive, element) {
                    if (previousDirective) throw $compileMinErr("multidir", "Multiple directives [{0}, {1}] asking for {2} on: {3}", previousDirective.name, directive.name, what, startingTag(element));
                }
                function addTextInterpolateDirective(directives, text) {
                    var interpolateFn = $interpolate(text, !0);
                    interpolateFn && directives.push({
                        priority: 0,
                        compile: valueFn(function(scope, node) {
                            var parent = node.parent(), bindings = parent.data("$binding") || [];
                            bindings.push(interpolateFn), safeAddClass(parent.data("$binding", bindings), "ng-binding"), 
                            scope.$watch(interpolateFn, function(value) {
                                node[0].nodeValue = value;
                            });
                        })
                    });
                }
                function getTrustedContext(node, attrNormalizedName) {
                    if ("srcdoc" == attrNormalizedName) return $sce.HTML;
                    var tag = nodeName_(node);
                    return "xlinkHref" == attrNormalizedName || "FORM" == tag && "action" == attrNormalizedName || "IMG" != tag && ("src" == attrNormalizedName || "ngSrc" == attrNormalizedName) ? $sce.RESOURCE_URL : void 0;
                }
                function addAttrInterpolateDirective(node, directives, value, name) {
                    var interpolateFn = $interpolate(value, !0);
                    if (interpolateFn) {
                        if ("multiple" === name && "SELECT" === nodeName_(node)) throw $compileMinErr("selmulti", "Binding to the 'multiple' attribute is not supported. Element: {0}", startingTag(node));
                        directives.push({
                            priority: 100,
                            compile: function() {
                                return {
                                    pre: function(scope, element, attr) {
                                        var $$observers = attr.$$observers || (attr.$$observers = {});
                                        if (EVENT_HANDLER_ATTR_REGEXP.test(name)) throw $compileMinErr("nodomevents", "Interpolations for HTML DOM event attributes are disallowed.  Please use the ng- versions (such as ng-click instead of onclick) instead.");
                                        interpolateFn = $interpolate(attr[name], !0, getTrustedContext(node, name)), interpolateFn && (attr[name] = interpolateFn(scope), 
                                        ($$observers[name] || ($$observers[name] = [])).$$inter = !0, (attr.$$observers && attr.$$observers[name].$$scope || scope).$watch(interpolateFn, function(newValue, oldValue) {
                                            "class" === name && newValue != oldValue ? attr.$updateClass(newValue, oldValue) : attr.$set(name, newValue);
                                        }));
                                    }
                                };
                            }
                        });
                    }
                }
                function replaceWith($rootElement, elementsToRemove, newNode) {
                    var i, ii, firstElementToRemove = elementsToRemove[0], removeCount = elementsToRemove.length, parent = firstElementToRemove.parentNode;
                    if ($rootElement) for (i = 0, ii = $rootElement.length; ii > i; i++) if ($rootElement[i] == firstElementToRemove) {
                        $rootElement[i++] = newNode;
                        for (var j = i, j2 = j + removeCount - 1, jj = $rootElement.length; jj > j; j++, 
                        j2++) jj > j2 ? $rootElement[j] = $rootElement[j2] : delete $rootElement[j];
                        $rootElement.length -= removeCount - 1;
                        break;
                    }
                    parent && parent.replaceChild(newNode, firstElementToRemove);
                    var fragment = document.createDocumentFragment();
                    fragment.appendChild(firstElementToRemove), newNode[jqLite.expando] = firstElementToRemove[jqLite.expando];
                    for (var k = 1, kk = elementsToRemove.length; kk > k; k++) {
                        var element = elementsToRemove[k];
                        jqLite(element).remove(), fragment.appendChild(element), delete elementsToRemove[k];
                    }
                    elementsToRemove[0] = newNode, elementsToRemove.length = 1;
                }
                function cloneAndAnnotateFn(fn, annotation) {
                    return extend(function() {
                        return fn.apply(null, arguments);
                    }, fn, annotation);
                }
                var Attributes = function(element, attr) {
                    this.$$element = element, this.$attr = attr || {};
                };
                Attributes.prototype = {
                    $normalize: directiveNormalize,
                    $addClass: function(classVal) {
                        classVal && classVal.length > 0 && $animate.addClass(this.$$element, classVal);
                    },
                    $removeClass: function(classVal) {
                        classVal && classVal.length > 0 && $animate.removeClass(this.$$element, classVal);
                    },
                    $updateClass: function(newClasses, oldClasses) {
                        this.$removeClass(tokenDifference(oldClasses, newClasses)), this.$addClass(tokenDifference(newClasses, oldClasses));
                    },
                    $set: function(key, value, writeAttr, attrName) {
                        var nodeName, booleanKey = getBooleanAttrName(this.$$element[0], key);
                        booleanKey && (this.$$element.prop(key, value), attrName = booleanKey), this[key] = value, 
                        attrName ? this.$attr[key] = attrName : (attrName = this.$attr[key], attrName || (this.$attr[key] = attrName = snake_case(key, "-"))), 
                        nodeName = nodeName_(this.$$element), ("A" === nodeName && "href" === key || "IMG" === nodeName && "src" === key) && (this[key] = value = $$sanitizeUri(value, "src" === key)), 
                        writeAttr !== !1 && (null === value || value === undefined ? this.$$element.removeAttr(attrName) : this.$$element.attr(attrName, value));
                        var $$observers = this.$$observers;
                        $$observers && forEach($$observers[key], function(fn) {
                            try {
                                fn(value);
                            } catch (e) {
                                $exceptionHandler(e);
                            }
                        });
                    },
                    $observe: function(key, fn) {
                        var attrs = this, $$observers = attrs.$$observers || (attrs.$$observers = {}), listeners = $$observers[key] || ($$observers[key] = []);
                        return listeners.push(fn), $rootScope.$evalAsync(function() {
                            listeners.$$inter || fn(attrs[key]);
                        }), fn;
                    }
                };
                var startSymbol = $interpolate.startSymbol(), endSymbol = $interpolate.endSymbol(), denormalizeTemplate = "{{" == startSymbol || "}}" == endSymbol ? identity : function(template) {
                    return template.replace(/\{\{/g, startSymbol).replace(/}}/g, endSymbol);
                }, NG_ATTR_BINDING = /^ngAttr[A-Z]/;
                return compile;
            } ];
        }
        function directiveNormalize(name) {
            return camelCase(name.replace(PREFIX_REGEXP, ""));
        }
        function tokenDifference(str1, str2) {
            var values = "", tokens1 = str1.split(/\s+/), tokens2 = str2.split(/\s+/);
            outer: for (var i = 0; i < tokens1.length; i++) {
                for (var token = tokens1[i], j = 0; j < tokens2.length; j++) if (token == tokens2[j]) continue outer;
                values += (values.length > 0 ? " " : "") + token;
            }
            return values;
        }
        function $ControllerProvider() {
            var controllers = {}, CNTRL_REG = /^(\S+)(\s+as\s+(\w+))?$/;
            this.register = function(name, constructor) {
                assertNotHasOwnProperty(name, "controller"), isObject(name) ? extend(controllers, name) : controllers[name] = constructor;
            }, this.$get = [ "$injector", "$window", function($injector, $window) {
                return function(expression, locals) {
                    var instance, match, constructor, identifier;
                    if (isString(expression) && (match = expression.match(CNTRL_REG), constructor = match[1], 
                    identifier = match[3], expression = controllers.hasOwnProperty(constructor) ? controllers[constructor] : getter(locals.$scope, constructor, !0) || getter($window, constructor, !0), 
                    assertArgFn(expression, constructor, !0)), instance = $injector.instantiate(expression, locals), 
                    identifier) {
                        if (!locals || "object" != typeof locals.$scope) throw minErr("$controller")("noscp", "Cannot export controller '{0}' as '{1}'! No $scope object provided via `locals`.", constructor || expression.name, identifier);
                        locals.$scope[identifier] = instance;
                    }
                    return instance;
                };
            } ];
        }
        function $DocumentProvider() {
            this.$get = [ "$window", function(window) {
                return jqLite(window.document);
            } ];
        }
        function $ExceptionHandlerProvider() {
            this.$get = [ "$log", function($log) {
                return function(exception, cause) {
                    $log.error.apply($log, arguments);
                };
            } ];
        }
        function parseHeaders(headers) {
            var key, val, i, parsed = {};
            return headers ? (forEach(headers.split("\n"), function(line) {
                i = line.indexOf(":"), key = lowercase(trim(line.substr(0, i))), val = trim(line.substr(i + 1)), 
                key && (parsed[key] ? parsed[key] += ", " + val : parsed[key] = val);
            }), parsed) : parsed;
        }
        function headersGetter(headers) {
            var headersObj = isObject(headers) ? headers : undefined;
            return function(name) {
                return headersObj || (headersObj = parseHeaders(headers)), name ? headersObj[lowercase(name)] || null : headersObj;
            };
        }
        function transformData(data, headers, fns) {
            return isFunction(fns) ? fns(data, headers) : (forEach(fns, function(fn) {
                data = fn(data, headers);
            }), data);
        }
        function isSuccess(status) {
            return status >= 200 && 300 > status;
        }
        function $HttpProvider() {
            var JSON_START = /^\s*(\[|\{[^\{])/, JSON_END = /[\}\]]\s*$/, PROTECTION_PREFIX = /^\)\]\}',?\n/, CONTENT_TYPE_APPLICATION_JSON = {
                "Content-Type": "application/json;charset=utf-8"
            }, defaults = this.defaults = {
                transformResponse: [ function(data) {
                    return isString(data) && (data = data.replace(PROTECTION_PREFIX, ""), JSON_START.test(data) && JSON_END.test(data) && (data = fromJson(data))), 
                    data;
                } ],
                transformRequest: [ function(d) {
                    return isObject(d) && !isFile(d) ? toJson(d) : d;
                } ],
                headers: {
                    common: {
                        Accept: "application/json, text/plain, */*"
                    },
                    post: copy(CONTENT_TYPE_APPLICATION_JSON),
                    put: copy(CONTENT_TYPE_APPLICATION_JSON),
                    patch: copy(CONTENT_TYPE_APPLICATION_JSON)
                },
                xsrfCookieName: "XSRF-TOKEN",
                xsrfHeaderName: "X-XSRF-TOKEN"
            }, interceptorFactories = this.interceptors = [], responseInterceptorFactories = this.responseInterceptors = [];
            this.$get = [ "$httpBackend", "$browser", "$cacheFactory", "$rootScope", "$q", "$injector", function($httpBackend, $browser, $cacheFactory, $rootScope, $q, $injector) {
                function $http(requestConfig) {
                    function transformResponse(response) {
                        var resp = extend({}, response, {
                            data: transformData(response.data, response.headers, config.transformResponse)
                        });
                        return isSuccess(response.status) ? resp : $q.reject(resp);
                    }
                    function mergeHeaders(config) {
                        function execHeaders(headers) {
                            var headerContent;
                            forEach(headers, function(headerFn, header) {
                                isFunction(headerFn) && (headerContent = headerFn(), null != headerContent ? headers[header] = headerContent : delete headers[header]);
                            });
                        }
                        var defHeaderName, lowercaseDefHeaderName, reqHeaderName, defHeaders = defaults.headers, reqHeaders = extend({}, config.headers);
                        defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]), 
                        execHeaders(defHeaders), execHeaders(reqHeaders);
                        defaultHeadersIteration: for (defHeaderName in defHeaders) {
                            lowercaseDefHeaderName = lowercase(defHeaderName);
                            for (reqHeaderName in reqHeaders) if (lowercase(reqHeaderName) === lowercaseDefHeaderName) continue defaultHeadersIteration;
                            reqHeaders[defHeaderName] = defHeaders[defHeaderName];
                        }
                        return reqHeaders;
                    }
                    var config = {
                        transformRequest: defaults.transformRequest,
                        transformResponse: defaults.transformResponse
                    }, headers = mergeHeaders(requestConfig);
                    extend(config, requestConfig), config.headers = headers, config.method = uppercase(config.method);
                    var xsrfValue = urlIsSameOrigin(config.url) ? $browser.cookies()[config.xsrfCookieName || defaults.xsrfCookieName] : undefined;
                    xsrfValue && (headers[config.xsrfHeaderName || defaults.xsrfHeaderName] = xsrfValue);
                    var serverRequest = function(config) {
                        headers = config.headers;
                        var reqData = transformData(config.data, headersGetter(headers), config.transformRequest);
                        return isUndefined(config.data) && forEach(headers, function(value, header) {
                            "content-type" === lowercase(header) && delete headers[header];
                        }), isUndefined(config.withCredentials) && !isUndefined(defaults.withCredentials) && (config.withCredentials = defaults.withCredentials), 
                        sendReq(config, reqData, headers).then(transformResponse, transformResponse);
                    }, chain = [ serverRequest, undefined ], promise = $q.when(config);
                    for (forEach(reversedInterceptors, function(interceptor) {
                        (interceptor.request || interceptor.requestError) && chain.unshift(interceptor.request, interceptor.requestError), 
                        (interceptor.response || interceptor.responseError) && chain.push(interceptor.response, interceptor.responseError);
                    }); chain.length; ) {
                        var thenFn = chain.shift(), rejectFn = chain.shift();
                        promise = promise.then(thenFn, rejectFn);
                    }
                    return promise.success = function(fn) {
                        return promise.then(function(response) {
                            fn(response.data, response.status, response.headers, config);
                        }), promise;
                    }, promise.error = function(fn) {
                        return promise.then(null, function(response) {
                            fn(response.data, response.status, response.headers, config);
                        }), promise;
                    }, promise;
                }
                function createShortMethods(names) {
                    forEach(arguments, function(name) {
                        $http[name] = function(url, config) {
                            return $http(extend(config || {}, {
                                method: name,
                                url: url
                            }));
                        };
                    });
                }
                function createShortMethodsWithData(name) {
                    forEach(arguments, function(name) {
                        $http[name] = function(url, data, config) {
                            return $http(extend(config || {}, {
                                method: name,
                                url: url,
                                data: data
                            }));
                        };
                    });
                }
                function sendReq(config, reqData, reqHeaders) {
                    function done(status, response, headersString) {
                        cache && (isSuccess(status) ? cache.put(url, [ status, response, parseHeaders(headersString) ]) : cache.remove(url)), 
                        resolvePromise(response, status, headersString), $rootScope.$$phase || $rootScope.$apply();
                    }
                    function resolvePromise(response, status, headers) {
                        status = Math.max(status, 0), (isSuccess(status) ? deferred.resolve : deferred.reject)({
                            data: response,
                            status: status,
                            headers: headersGetter(headers),
                            config: config
                        });
                    }
                    function removePendingReq() {
                        var idx = indexOf($http.pendingRequests, config);
                        -1 !== idx && $http.pendingRequests.splice(idx, 1);
                    }
                    var cache, cachedResp, deferred = $q.defer(), promise = deferred.promise, url = buildUrl(config.url, config.params);
                    if ($http.pendingRequests.push(config), promise.then(removePendingReq, removePendingReq), 
                    (config.cache || defaults.cache) && config.cache !== !1 && "GET" == config.method && (cache = isObject(config.cache) ? config.cache : isObject(defaults.cache) ? defaults.cache : defaultCache), 
                    cache) if (cachedResp = cache.get(url), isDefined(cachedResp)) {
                        if (cachedResp.then) return cachedResp.then(removePendingReq, removePendingReq), 
                        cachedResp;
                        isArray(cachedResp) ? resolvePromise(cachedResp[1], cachedResp[0], copy(cachedResp[2])) : resolvePromise(cachedResp, 200, {});
                    } else cache.put(url, promise);
                    return isUndefined(cachedResp) && $httpBackend(config.method, url, reqData, done, reqHeaders, config.timeout, config.withCredentials, config.responseType), 
                    promise;
                }
                function buildUrl(url, params) {
                    if (!params) return url;
                    var parts = [];
                    return forEachSorted(params, function(value, key) {
                        null === value || isUndefined(value) || (isArray(value) || (value = [ value ]), 
                        forEach(value, function(v) {
                            isObject(v) && (v = toJson(v)), parts.push(encodeUriQuery(key) + "=" + encodeUriQuery(v));
                        }));
                    }), url + (-1 == url.indexOf("?") ? "?" : "&") + parts.join("&");
                }
                var defaultCache = $cacheFactory("$http"), reversedInterceptors = [];
                return forEach(interceptorFactories, function(interceptorFactory) {
                    reversedInterceptors.unshift(isString(interceptorFactory) ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
                }), forEach(responseInterceptorFactories, function(interceptorFactory, index) {
                    var responseFn = isString(interceptorFactory) ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory);
                    reversedInterceptors.splice(index, 0, {
                        response: function(response) {
                            return responseFn($q.when(response));
                        },
                        responseError: function(response) {
                            return responseFn($q.reject(response));
                        }
                    });
                }), $http.pendingRequests = [], createShortMethods("get", "delete", "head", "jsonp"), 
                createShortMethodsWithData("post", "put"), $http.defaults = defaults, $http;
            } ];
        }
        function createXhr(method) {
            if (8 >= msie && (!method.match(/^(get|post|head|put|delete|options)$/i) || !window.XMLHttpRequest)) return new window.ActiveXObject("Microsoft.XMLHTTP");
            if (window.XMLHttpRequest) return new window.XMLHttpRequest();
            throw minErr("$httpBackend")("noxhr", "This browser does not support XMLHttpRequest.");
        }
        function $HttpBackendProvider() {
            this.$get = [ "$browser", "$window", "$document", function($browser, $window, $document) {
                return createHttpBackend($browser, createXhr, $browser.defer, $window.angular.callbacks, $document[0]);
            } ];
        }
        function createHttpBackend($browser, createXhr, $browserDefer, callbacks, rawDocument) {
            function jsonpReq(url, done) {
                var script = rawDocument.createElement("script"), doneWrapper = function() {
                    script.onreadystatechange = script.onload = script.onerror = null, rawDocument.body.removeChild(script), 
                    done && done();
                };
                return script.type = "text/javascript", script.src = url, msie && 8 >= msie ? script.onreadystatechange = function() {
                    /loaded|complete/.test(script.readyState) && doneWrapper();
                } : script.onload = script.onerror = function() {
                    doneWrapper();
                }, rawDocument.body.appendChild(script), doneWrapper;
            }
            var ABORTED = -1;
            return function(method, url, post, callback, headers, timeout, withCredentials, responseType) {
                function timeoutRequest() {
                    status = ABORTED, jsonpDone && jsonpDone(), xhr && xhr.abort();
                }
                function completeRequest(callback, status, response, headersString) {
                    timeoutId && $browserDefer.cancel(timeoutId), jsonpDone = xhr = null, status = 0 === status ? response ? 200 : 404 : status, 
                    status = 1223 == status ? 204 : status, callback(status, response, headersString), 
                    $browser.$$completeOutstandingRequest(noop);
                }
                var status;
                if ($browser.$$incOutstandingRequestCount(), url = url || $browser.url(), "jsonp" == lowercase(method)) {
                    var callbackId = "_" + (callbacks.counter++).toString(36);
                    callbacks[callbackId] = function(data) {
                        callbacks[callbackId].data = data;
                    };
                    var jsonpDone = jsonpReq(url.replace("JSON_CALLBACK", "angular.callbacks." + callbackId), function() {
                        callbacks[callbackId].data ? completeRequest(callback, 200, callbacks[callbackId].data) : completeRequest(callback, status || -2), 
                        callbacks[callbackId] = angular.noop;
                    });
                } else {
                    var xhr = createXhr(method);
                    if (xhr.open(method, url, !0), forEach(headers, function(value, key) {
                        isDefined(value) && xhr.setRequestHeader(key, value);
                    }), xhr.onreadystatechange = function() {
                        if (xhr && 4 == xhr.readyState) {
                            var responseHeaders = null, response = null;
                            status !== ABORTED && (responseHeaders = xhr.getAllResponseHeaders(), response = "response" in xhr ? xhr.response : xhr.responseText), 
                            completeRequest(callback, status || xhr.status, response, responseHeaders);
                        }
                    }, withCredentials && (xhr.withCredentials = !0), responseType) try {
                        xhr.responseType = responseType;
                    } catch (e) {
                        if ("json" !== responseType) throw e;
                    }
                    xhr.send(post || null);
                }
                if (timeout > 0) var timeoutId = $browserDefer(timeoutRequest, timeout); else timeout && timeout.then && timeout.then(timeoutRequest);
            };
        }
        function $InterpolateProvider() {
            var startSymbol = "{{", endSymbol = "}}";
            this.startSymbol = function(value) {
                return value ? (startSymbol = value, this) : startSymbol;
            }, this.endSymbol = function(value) {
                return value ? (endSymbol = value, this) : endSymbol;
            }, this.$get = [ "$parse", "$exceptionHandler", "$sce", function($parse, $exceptionHandler, $sce) {
                function $interpolate(text, mustHaveExpression, trustedContext) {
                    for (var startIndex, endIndex, fn, exp, index = 0, parts = [], length = text.length, hasInterpolation = !1, concat = []; length > index; ) -1 != (startIndex = text.indexOf(startSymbol, index)) && -1 != (endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) ? (index != startIndex && parts.push(text.substring(index, startIndex)), 
                    parts.push(fn = $parse(exp = text.substring(startIndex + startSymbolLength, endIndex))), 
                    fn.exp = exp, index = endIndex + endSymbolLength, hasInterpolation = !0) : (index != length && parts.push(text.substring(index)), 
                    index = length);
                    if ((length = parts.length) || (parts.push(""), length = 1), trustedContext && parts.length > 1) throw $interpolateMinErr("noconcat", "Error while interpolating: {0}\nStrict Contextual Escaping disallows interpolations that concatenate multiple expressions when a trusted value is required.  See http://docs.angularjs.org/api/ng.$sce", text);
                    return !mustHaveExpression || hasInterpolation ? (concat.length = length, fn = function(context) {
                        try {
                            for (var part, i = 0, ii = length; ii > i; i++) "function" == typeof (part = parts[i]) && (part = part(context), 
                            part = trustedContext ? $sce.getTrusted(trustedContext, part) : $sce.valueOf(part), 
                            null === part || isUndefined(part) ? part = "" : "string" != typeof part && (part = toJson(part))), 
                            concat[i] = part;
                            return concat.join("");
                        } catch (err) {
                            var newErr = $interpolateMinErr("interr", "Can't interpolate: {0}\n{1}", text, err.toString());
                            $exceptionHandler(newErr);
                        }
                    }, fn.exp = text, fn.parts = parts, fn) : void 0;
                }
                var startSymbolLength = startSymbol.length, endSymbolLength = endSymbol.length;
                return $interpolate.startSymbol = function() {
                    return startSymbol;
                }, $interpolate.endSymbol = function() {
                    return endSymbol;
                }, $interpolate;
            } ];
        }
        function $IntervalProvider() {
            this.$get = [ "$rootScope", "$window", "$q", function($rootScope, $window, $q) {
                function interval(fn, delay, count, invokeApply) {
                    var setInterval = $window.setInterval, clearInterval = $window.clearInterval, deferred = $q.defer(), promise = deferred.promise, iteration = 0, skipApply = isDefined(invokeApply) && !invokeApply;
                    return count = isDefined(count) ? count : 0, promise.then(null, null, fn), promise.$$intervalId = setInterval(function() {
                        deferred.notify(iteration++), count > 0 && iteration >= count && (deferred.resolve(iteration), 
                        clearInterval(promise.$$intervalId), delete intervals[promise.$$intervalId]), skipApply || $rootScope.$apply();
                    }, delay), intervals[promise.$$intervalId] = deferred, promise;
                }
                var intervals = {};
                return interval.cancel = function(promise) {
                    return promise && promise.$$intervalId in intervals ? (intervals[promise.$$intervalId].reject("canceled"), 
                    clearInterval(promise.$$intervalId), delete intervals[promise.$$intervalId], !0) : !1;
                }, interval;
            } ];
        }
        function $LocaleProvider() {
            this.$get = function() {
                return {
                    id: "en-us",
                    NUMBER_FORMATS: {
                        DECIMAL_SEP: ".",
                        GROUP_SEP: ",",
                        PATTERNS: [ {
                            minInt: 1,
                            minFrac: 0,
                            maxFrac: 3,
                            posPre: "",
                            posSuf: "",
                            negPre: "-",
                            negSuf: "",
                            gSize: 3,
                            lgSize: 3
                        }, {
                            minInt: 1,
                            minFrac: 2,
                            maxFrac: 2,
                            posPre: "¤",
                            posSuf: "",
                            negPre: "(¤",
                            negSuf: ")",
                            gSize: 3,
                            lgSize: 3
                        } ],
                        CURRENCY_SYM: "$"
                    },
                    DATETIME_FORMATS: {
                        MONTH: "January,February,March,April,May,June,July,August,September,October,November,December".split(","),
                        SHORTMONTH: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
                        DAY: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),
                        SHORTDAY: "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(","),
                        AMPMS: [ "AM", "PM" ],
                        medium: "MMM d, y h:mm:ss a",
                        "short": "M/d/yy h:mm a",
                        fullDate: "EEEE, MMMM d, y",
                        longDate: "MMMM d, y",
                        mediumDate: "MMM d, y",
                        shortDate: "M/d/yy",
                        mediumTime: "h:mm:ss a",
                        shortTime: "h:mm a"
                    },
                    pluralCat: function(num) {
                        return 1 === num ? "one" : "other";
                    }
                };
            };
        }
        function encodePath(path) {
            for (var segments = path.split("/"), i = segments.length; i--; ) segments[i] = encodeUriSegment(segments[i]);
            return segments.join("/");
        }
        function parseAbsoluteUrl(absoluteUrl, locationObj, appBase) {
            var parsedUrl = urlResolve(absoluteUrl, appBase);
            locationObj.$$protocol = parsedUrl.protocol, locationObj.$$host = parsedUrl.hostname, 
            locationObj.$$port = int(parsedUrl.port) || DEFAULT_PORTS[parsedUrl.protocol] || null;
        }
        function parseAppUrl(relativeUrl, locationObj, appBase) {
            var prefixed = "/" !== relativeUrl.charAt(0);
            prefixed && (relativeUrl = "/" + relativeUrl);
            var match = urlResolve(relativeUrl, appBase);
            locationObj.$$path = decodeURIComponent(prefixed && "/" === match.pathname.charAt(0) ? match.pathname.substring(1) : match.pathname), 
            locationObj.$$search = parseKeyValue(match.search), locationObj.$$hash = decodeURIComponent(match.hash), 
            locationObj.$$path && "/" != locationObj.$$path.charAt(0) && (locationObj.$$path = "/" + locationObj.$$path);
        }
        function beginsWith(begin, whole) {
            return 0 === whole.indexOf(begin) ? whole.substr(begin.length) : void 0;
        }
        function stripHash(url) {
            var index = url.indexOf("#");
            return -1 == index ? url : url.substr(0, index);
        }
        function stripFile(url) {
            return url.substr(0, stripHash(url).lastIndexOf("/") + 1);
        }
        function serverBase(url) {
            return url.substring(0, url.indexOf("/", url.indexOf("//") + 2));
        }
        function LocationHtml5Url(appBase, basePrefix) {
            this.$$html5 = !0, basePrefix = basePrefix || "";
            var appBaseNoFile = stripFile(appBase);
            parseAbsoluteUrl(appBase, this, appBase), this.$$parse = function(url) {
                var pathUrl = beginsWith(appBaseNoFile, url);
                if (!isString(pathUrl)) throw $locationMinErr("ipthprfx", 'Invalid url "{0}", missing path prefix "{1}".', url, appBaseNoFile);
                parseAppUrl(pathUrl, this, appBase), this.$$path || (this.$$path = "/"), this.$$compose();
            }, this.$$compose = function() {
                var search = toKeyValue(this.$$search), hash = this.$$hash ? "#" + encodeUriSegment(this.$$hash) : "";
                this.$$url = encodePath(this.$$path) + (search ? "?" + search : "") + hash, this.$$absUrl = appBaseNoFile + this.$$url.substr(1);
            }, this.$$rewrite = function(url) {
                var appUrl, prevAppUrl;
                return (appUrl = beginsWith(appBase, url)) !== undefined ? (prevAppUrl = appUrl, 
                (appUrl = beginsWith(basePrefix, appUrl)) !== undefined ? appBaseNoFile + (beginsWith("/", appUrl) || appUrl) : appBase + prevAppUrl) : (appUrl = beginsWith(appBaseNoFile, url)) !== undefined ? appBaseNoFile + appUrl : appBaseNoFile == url + "/" ? appBaseNoFile : void 0;
            };
        }
        function LocationHashbangUrl(appBase, hashPrefix) {
            var appBaseNoFile = stripFile(appBase);
            parseAbsoluteUrl(appBase, this, appBase), this.$$parse = function(url) {
                function removeWindowsDriveName(path, url, base) {
                    var firstPathSegmentMatch, windowsFilePathExp = /^\/?.*?:(\/.*)/;
                    return 0 === url.indexOf(base) && (url = url.replace(base, "")), windowsFilePathExp.exec(url) ? path : (firstPathSegmentMatch = windowsFilePathExp.exec(path), 
                    firstPathSegmentMatch ? firstPathSegmentMatch[1] : path);
                }
                var withoutBaseUrl = beginsWith(appBase, url) || beginsWith(appBaseNoFile, url), withoutHashUrl = "#" == withoutBaseUrl.charAt(0) ? beginsWith(hashPrefix, withoutBaseUrl) : this.$$html5 ? withoutBaseUrl : "";
                if (!isString(withoutHashUrl)) throw $locationMinErr("ihshprfx", 'Invalid url "{0}", missing hash prefix "{1}".', url, hashPrefix);
                parseAppUrl(withoutHashUrl, this, appBase), this.$$path = removeWindowsDriveName(this.$$path, withoutHashUrl, appBase), 
                this.$$compose();
            }, this.$$compose = function() {
                var search = toKeyValue(this.$$search), hash = this.$$hash ? "#" + encodeUriSegment(this.$$hash) : "";
                this.$$url = encodePath(this.$$path) + (search ? "?" + search : "") + hash, this.$$absUrl = appBase + (this.$$url ? hashPrefix + this.$$url : "");
            }, this.$$rewrite = function(url) {
                return stripHash(appBase) == stripHash(url) ? url : void 0;
            };
        }
        function LocationHashbangInHtml5Url(appBase, hashPrefix) {
            this.$$html5 = !0, LocationHashbangUrl.apply(this, arguments);
            var appBaseNoFile = stripFile(appBase);
            this.$$rewrite = function(url) {
                var appUrl;
                return appBase == stripHash(url) ? url : (appUrl = beginsWith(appBaseNoFile, url)) ? appBase + hashPrefix + appUrl : appBaseNoFile === url + "/" ? appBaseNoFile : void 0;
            };
        }
        function locationGetter(property) {
            return function() {
                return this[property];
            };
        }
        function locationGetterSetter(property, preprocess) {
            return function(value) {
                return isUndefined(value) ? this[property] : (this[property] = preprocess(value), 
                this.$$compose(), this);
            };
        }
        function $LocationProvider() {
            var hashPrefix = "", html5Mode = !1;
            this.hashPrefix = function(prefix) {
                return isDefined(prefix) ? (hashPrefix = prefix, this) : hashPrefix;
            }, this.html5Mode = function(mode) {
                return isDefined(mode) ? (html5Mode = mode, this) : html5Mode;
            }, this.$get = [ "$rootScope", "$browser", "$sniffer", "$rootElement", function($rootScope, $browser, $sniffer, $rootElement) {
                function afterLocationChange(oldUrl) {
                    $rootScope.$broadcast("$locationChangeSuccess", $location.absUrl(), oldUrl);
                }
                var $location, LocationMode, appBase, baseHref = $browser.baseHref(), initialUrl = $browser.url();
                html5Mode ? (appBase = serverBase(initialUrl) + (baseHref || "/"), LocationMode = $sniffer.history ? LocationHtml5Url : LocationHashbangInHtml5Url) : (appBase = stripHash(initialUrl), 
                LocationMode = LocationHashbangUrl), $location = new LocationMode(appBase, "#" + hashPrefix), 
                $location.$$parse($location.$$rewrite(initialUrl)), $rootElement.on("click", function(event) {
                    if (!event.ctrlKey && !event.metaKey && 2 != event.which) {
                        for (var elm = jqLite(event.target); "a" !== lowercase(elm[0].nodeName); ) if (elm[0] === $rootElement[0] || !(elm = elm.parent())[0]) return;
                        var absHref = elm.prop("href");
                        isObject(absHref) && "[object SVGAnimatedString]" === absHref.toString() && (absHref = urlResolve(absHref.animVal).href);
                        var rewrittenUrl = $location.$$rewrite(absHref);
                        absHref && !elm.attr("target") && rewrittenUrl && !event.isDefaultPrevented() && (event.preventDefault(), 
                        rewrittenUrl != $browser.url() && ($location.$$parse(rewrittenUrl), $rootScope.$apply(), 
                        window.angular["ff-684208-preventDefault"] = !0));
                    }
                }), $location.absUrl() != initialUrl && $browser.url($location.absUrl(), !0), $browser.onUrlChange(function(newUrl) {
                    $location.absUrl() != newUrl && ($rootScope.$evalAsync(function() {
                        var oldUrl = $location.absUrl();
                        $location.$$parse(newUrl), $rootScope.$broadcast("$locationChangeStart", newUrl, oldUrl).defaultPrevented ? ($location.$$parse(oldUrl), 
                        $browser.url(oldUrl)) : afterLocationChange(oldUrl);
                    }), $rootScope.$$phase || $rootScope.$digest());
                });
                var changeCounter = 0;
                return $rootScope.$watch(function() {
                    var oldUrl = $browser.url(), currentReplace = $location.$$replace;
                    return changeCounter && oldUrl == $location.absUrl() || (changeCounter++, $rootScope.$evalAsync(function() {
                        $rootScope.$broadcast("$locationChangeStart", $location.absUrl(), oldUrl).defaultPrevented ? $location.$$parse(oldUrl) : ($browser.url($location.absUrl(), currentReplace), 
                        afterLocationChange(oldUrl));
                    })), $location.$$replace = !1, changeCounter;
                }), $location;
            } ];
        }
        function $LogProvider() {
            var debug = !0, self = this;
            this.debugEnabled = function(flag) {
                return isDefined(flag) ? (debug = flag, this) : debug;
            }, this.$get = [ "$window", function($window) {
                function formatError(arg) {
                    return arg instanceof Error && (arg.stack ? arg = arg.message && -1 === arg.stack.indexOf(arg.message) ? "Error: " + arg.message + "\n" + arg.stack : arg.stack : arg.sourceURL && (arg = arg.message + "\n" + arg.sourceURL + ":" + arg.line)), 
                    arg;
                }
                function consoleLog(type) {
                    var console = $window.console || {}, logFn = console[type] || console.log || noop, hasApply = !1;
                    try {
                        hasApply = !!logFn.apply;
                    } catch (e) {}
                    return hasApply ? function() {
                        var args = [];
                        return forEach(arguments, function(arg) {
                            args.push(formatError(arg));
                        }), logFn.apply(console, args);
                    } : function(arg1, arg2) {
                        logFn(arg1, null == arg2 ? "" : arg2);
                    };
                }
                return {
                    log: consoleLog("log"),
                    info: consoleLog("info"),
                    warn: consoleLog("warn"),
                    error: consoleLog("error"),
                    debug: function() {
                        var fn = consoleLog("debug");
                        return function() {
                            debug && fn.apply(self, arguments);
                        };
                    }()
                };
            } ];
        }
        function ensureSafeMemberName(name, fullExpression) {
            if ("constructor" === name) throw $parseMinErr("isecfld", 'Referencing "constructor" field in Angular expressions is disallowed! Expression: {0}', fullExpression);
            return name;
        }
        function ensureSafeObject(obj, fullExpression) {
            if (obj) {
                if (obj.constructor === obj) throw $parseMinErr("isecfn", "Referencing Function in Angular expressions is disallowed! Expression: {0}", fullExpression);
                if (obj.document && obj.location && obj.alert && obj.setInterval) throw $parseMinErr("isecwindow", "Referencing the Window in Angular expressions is disallowed! Expression: {0}", fullExpression);
                if (obj.children && (obj.nodeName || obj.on && obj.find)) throw $parseMinErr("isecdom", "Referencing DOM nodes in Angular expressions is disallowed! Expression: {0}", fullExpression);
            }
            return obj;
        }
        function setter(obj, path, setValue, fullExp, options) {
            options = options || {};
            for (var key, element = path.split("."), i = 0; element.length > 1; i++) {
                key = ensureSafeMemberName(element.shift(), fullExp);
                var propertyObj = obj[key];
                propertyObj || (propertyObj = {}, obj[key] = propertyObj), obj = propertyObj, obj.then && options.unwrapPromises && (promiseWarning(fullExp), 
                "$$v" in obj || !function(promise) {
                    promise.then(function(val) {
                        promise.$$v = val;
                    });
                }(obj), obj.$$v === undefined && (obj.$$v = {}), obj = obj.$$v);
            }
            return key = ensureSafeMemberName(element.shift(), fullExp), obj[key] = setValue, 
            setValue;
        }
        function cspSafeGetterFn(key0, key1, key2, key3, key4, fullExp, options) {
            return ensureSafeMemberName(key0, fullExp), ensureSafeMemberName(key1, fullExp), 
            ensureSafeMemberName(key2, fullExp), ensureSafeMemberName(key3, fullExp), ensureSafeMemberName(key4, fullExp), 
            options.unwrapPromises ? function(scope, locals) {
                var promise, pathVal = locals && locals.hasOwnProperty(key0) ? locals : scope;
                return null == pathVal ? pathVal : (pathVal = pathVal[key0], pathVal && pathVal.then && (promiseWarning(fullExp), 
                "$$v" in pathVal || (promise = pathVal, promise.$$v = undefined, promise.then(function(val) {
                    promise.$$v = val;
                })), pathVal = pathVal.$$v), key1 ? null == pathVal ? undefined : (pathVal = pathVal[key1], 
                pathVal && pathVal.then && (promiseWarning(fullExp), "$$v" in pathVal || (promise = pathVal, 
                promise.$$v = undefined, promise.then(function(val) {
                    promise.$$v = val;
                })), pathVal = pathVal.$$v), key2 ? null == pathVal ? undefined : (pathVal = pathVal[key2], 
                pathVal && pathVal.then && (promiseWarning(fullExp), "$$v" in pathVal || (promise = pathVal, 
                promise.$$v = undefined, promise.then(function(val) {
                    promise.$$v = val;
                })), pathVal = pathVal.$$v), key3 ? null == pathVal ? undefined : (pathVal = pathVal[key3], 
                pathVal && pathVal.then && (promiseWarning(fullExp), "$$v" in pathVal || (promise = pathVal, 
                promise.$$v = undefined, promise.then(function(val) {
                    promise.$$v = val;
                })), pathVal = pathVal.$$v), key4 ? null == pathVal ? undefined : (pathVal = pathVal[key4], 
                pathVal && pathVal.then && (promiseWarning(fullExp), "$$v" in pathVal || (promise = pathVal, 
                promise.$$v = undefined, promise.then(function(val) {
                    promise.$$v = val;
                })), pathVal = pathVal.$$v), pathVal) : pathVal) : pathVal) : pathVal) : pathVal);
            } : function(scope, locals) {
                var pathVal = locals && locals.hasOwnProperty(key0) ? locals : scope;
                return null == pathVal ? pathVal : (pathVal = pathVal[key0], key1 ? null == pathVal ? undefined : (pathVal = pathVal[key1], 
                key2 ? null == pathVal ? undefined : (pathVal = pathVal[key2], key3 ? null == pathVal ? undefined : (pathVal = pathVal[key3], 
                key4 ? null == pathVal ? undefined : pathVal = pathVal[key4] : pathVal) : pathVal) : pathVal) : pathVal);
            };
        }
        function simpleGetterFn1(key0, fullExp) {
            return ensureSafeMemberName(key0, fullExp), function(scope, locals) {
                return null == scope ? undefined : (locals && locals.hasOwnProperty(key0) ? locals : scope)[key0];
            };
        }
        function simpleGetterFn2(key0, key1, fullExp) {
            return ensureSafeMemberName(key0, fullExp), ensureSafeMemberName(key1, fullExp), 
            function(scope, locals) {
                return null == scope ? undefined : (scope = (locals && locals.hasOwnProperty(key0) ? locals : scope)[key0], 
                null == scope ? undefined : scope[key1]);
            };
        }
        function getterFn(path, options, fullExp) {
            if (getterFnCache.hasOwnProperty(path)) return getterFnCache[path];
            var fn, pathKeys = path.split("."), pathKeysLength = pathKeys.length;
            if (options.unwrapPromises || 1 !== pathKeysLength) if (options.unwrapPromises || 2 !== pathKeysLength) if (options.csp) fn = 6 > pathKeysLength ? cspSafeGetterFn(pathKeys[0], pathKeys[1], pathKeys[2], pathKeys[3], pathKeys[4], fullExp, options) : function(scope, locals) {
                var val, i = 0;
                do val = cspSafeGetterFn(pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++], fullExp, options)(scope, locals), 
                locals = undefined, scope = val; while (pathKeysLength > i);
                return val;
            }; else {
                var code = "var p;\n";
                forEach(pathKeys, function(key, index) {
                    ensureSafeMemberName(key, fullExp), code += "if(s == null) return undefined;\ns=" + (index ? "s" : '((k&&k.hasOwnProperty("' + key + '"))?k:s)') + '["' + key + '"];\n' + (options.unwrapPromises ? 'if (s && s.then) {\n pw("' + fullExp.replace(/(["\r\n])/g, "\\$1") + '");\n if (!("$$v" in s)) {\n p=s;\n p.$$v = undefined;\n p.then(function(v) {p.$$v=v;});\n}\n s=s.$$v\n}\n' : "");
                }), code += "return s;";
                var evaledFnGetter = new Function("s", "k", "pw", code);
                evaledFnGetter.toString = valueFn(code), fn = options.unwrapPromises ? function(scope, locals) {
                    return evaledFnGetter(scope, locals, promiseWarning);
                } : evaledFnGetter;
            } else fn = simpleGetterFn2(pathKeys[0], pathKeys[1], fullExp); else fn = simpleGetterFn1(pathKeys[0], fullExp);
            return "hasOwnProperty" !== path && (getterFnCache[path] = fn), fn;
        }
        function $ParseProvider() {
            var cache = {}, $parseOptions = {
                csp: !1,
                unwrapPromises: !1,
                logPromiseWarnings: !0
            };
            this.unwrapPromises = function(value) {
                return isDefined(value) ? ($parseOptions.unwrapPromises = !!value, this) : $parseOptions.unwrapPromises;
            }, this.logPromiseWarnings = function(value) {
                return isDefined(value) ? ($parseOptions.logPromiseWarnings = value, this) : $parseOptions.logPromiseWarnings;
            }, this.$get = [ "$filter", "$sniffer", "$log", function($filter, $sniffer, $log) {
                return $parseOptions.csp = $sniffer.csp, promiseWarning = function(fullExp) {
                    $parseOptions.logPromiseWarnings && !promiseWarningCache.hasOwnProperty(fullExp) && (promiseWarningCache[fullExp] = !0, 
                    $log.warn("[$parse] Promise found in the expression `" + fullExp + "`. Automatic unwrapping of promises in Angular expressions is deprecated."));
                }, function(exp) {
                    var parsedExpression;
                    switch (typeof exp) {
                      case "string":
                        if (cache.hasOwnProperty(exp)) return cache[exp];
                        var lexer = new Lexer($parseOptions), parser = new Parser(lexer, $filter, $parseOptions);
                        return parsedExpression = parser.parse(exp, !1), "hasOwnProperty" !== exp && (cache[exp] = parsedExpression), 
                        parsedExpression;

                      case "function":
                        return exp;

                      default:
                        return noop;
                    }
                };
            } ];
        }
        function $QProvider() {
            this.$get = [ "$rootScope", "$exceptionHandler", function($rootScope, $exceptionHandler) {
                return qFactory(function(callback) {
                    $rootScope.$evalAsync(callback);
                }, $exceptionHandler);
            } ];
        }
        function qFactory(nextTick, exceptionHandler) {
            function defaultCallback(value) {
                return value;
            }
            function defaultErrback(reason) {
                return reject(reason);
            }
            function all(promises) {
                var deferred = defer(), counter = 0, results = isArray(promises) ? [] : {};
                return forEach(promises, function(promise, key) {
                    counter++, ref(promise).then(function(value) {
                        results.hasOwnProperty(key) || (results[key] = value, --counter || deferred.resolve(results));
                    }, function(reason) {
                        results.hasOwnProperty(key) || deferred.reject(reason);
                    });
                }), 0 === counter && deferred.resolve(results), deferred.promise;
            }
            var defer = function() {
                var value, deferred, pending = [];
                return deferred = {
                    resolve: function(val) {
                        if (pending) {
                            var callbacks = pending;
                            pending = undefined, value = ref(val), callbacks.length && nextTick(function() {
                                for (var callback, i = 0, ii = callbacks.length; ii > i; i++) callback = callbacks[i], 
                                value.then(callback[0], callback[1], callback[2]);
                            });
                        }
                    },
                    reject: function(reason) {
                        deferred.resolve(createInternalRejectedPromise(reason));
                    },
                    notify: function(progress) {
                        if (pending) {
                            var callbacks = pending;
                            pending.length && nextTick(function() {
                                for (var callback, i = 0, ii = callbacks.length; ii > i; i++) callback = callbacks[i], 
                                callback[2](progress);
                            });
                        }
                    },
                    promise: {
                        then: function(callback, errback, progressback) {
                            var result = defer(), wrappedCallback = function(value) {
                                try {
                                    result.resolve((isFunction(callback) ? callback : defaultCallback)(value));
                                } catch (e) {
                                    result.reject(e), exceptionHandler(e);
                                }
                            }, wrappedErrback = function(reason) {
                                try {
                                    result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
                                } catch (e) {
                                    result.reject(e), exceptionHandler(e);
                                }
                            }, wrappedProgressback = function(progress) {
                                try {
                                    result.notify((isFunction(progressback) ? progressback : defaultCallback)(progress));
                                } catch (e) {
                                    exceptionHandler(e);
                                }
                            };
                            return pending ? pending.push([ wrappedCallback, wrappedErrback, wrappedProgressback ]) : value.then(wrappedCallback, wrappedErrback, wrappedProgressback), 
                            result.promise;
                        },
                        "catch": function(callback) {
                            return this.then(null, callback);
                        },
                        "finally": function(callback) {
                            function makePromise(value, resolved) {
                                var result = defer();
                                return resolved ? result.resolve(value) : result.reject(value), result.promise;
                            }
                            function handleCallback(value, isResolved) {
                                var callbackOutput = null;
                                try {
                                    callbackOutput = (callback || defaultCallback)();
                                } catch (e) {
                                    return makePromise(e, !1);
                                }
                                return callbackOutput && isFunction(callbackOutput.then) ? callbackOutput.then(function() {
                                    return makePromise(value, isResolved);
                                }, function(error) {
                                    return makePromise(error, !1);
                                }) : makePromise(value, isResolved);
                            }
                            return this.then(function(value) {
                                return handleCallback(value, !0);
                            }, function(error) {
                                return handleCallback(error, !1);
                            });
                        }
                    }
                };
            }, ref = function(value) {
                return value && isFunction(value.then) ? value : {
                    then: function(callback) {
                        var result = defer();
                        return nextTick(function() {
                            result.resolve(callback(value));
                        }), result.promise;
                    }
                };
            }, reject = function(reason) {
                var result = defer();
                return result.reject(reason), result.promise;
            }, createInternalRejectedPromise = function(reason) {
                return {
                    then: function(callback, errback) {
                        var result = defer();
                        return nextTick(function() {
                            try {
                                result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
                            } catch (e) {
                                result.reject(e), exceptionHandler(e);
                            }
                        }), result.promise;
                    }
                };
            }, when = function(value, callback, errback, progressback) {
                var done, result = defer(), wrappedCallback = function(value) {
                    try {
                        return (isFunction(callback) ? callback : defaultCallback)(value);
                    } catch (e) {
                        return exceptionHandler(e), reject(e);
                    }
                }, wrappedErrback = function(reason) {
                    try {
                        return (isFunction(errback) ? errback : defaultErrback)(reason);
                    } catch (e) {
                        return exceptionHandler(e), reject(e);
                    }
                }, wrappedProgressback = function(progress) {
                    try {
                        return (isFunction(progressback) ? progressback : defaultCallback)(progress);
                    } catch (e) {
                        exceptionHandler(e);
                    }
                };
                return nextTick(function() {
                    ref(value).then(function(value) {
                        done || (done = !0, result.resolve(ref(value).then(wrappedCallback, wrappedErrback, wrappedProgressback)));
                    }, function(reason) {
                        done || (done = !0, result.resolve(wrappedErrback(reason)));
                    }, function(progress) {
                        done || result.notify(wrappedProgressback(progress));
                    });
                }), result.promise;
            };
            return {
                defer: defer,
                reject: reject,
                when: when,
                all: all
            };
        }
        function $RootScopeProvider() {
            var TTL = 10, $rootScopeMinErr = minErr("$rootScope"), lastDirtyWatch = null;
            this.digestTtl = function(value) {
                return arguments.length && (TTL = value), TTL;
            }, this.$get = [ "$injector", "$exceptionHandler", "$parse", "$browser", function($injector, $exceptionHandler, $parse, $browser) {
                function Scope() {
                    this.$id = nextUid(), this.$$phase = this.$parent = this.$$watchers = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null, 
                    this["this"] = this.$root = this, this.$$destroyed = !1, this.$$asyncQueue = [], 
                    this.$$postDigestQueue = [], this.$$listeners = {}, this.$$listenerCount = {}, this.$$isolateBindings = {};
                }
                function beginPhase(phase) {
                    if ($rootScope.$$phase) throw $rootScopeMinErr("inprog", "{0} already in progress", $rootScope.$$phase);
                    $rootScope.$$phase = phase;
                }
                function clearPhase() {
                    $rootScope.$$phase = null;
                }
                function compileToFn(exp, name) {
                    var fn = $parse(exp);
                    return assertArgFn(fn, name), fn;
                }
                function decrementListenerCount(current, count, name) {
                    do current.$$listenerCount[name] -= count, 0 === current.$$listenerCount[name] && delete current.$$listenerCount[name]; while (current = current.$parent);
                }
                function initWatchVal() {}
                Scope.prototype = {
                    constructor: Scope,
                    $new: function(isolate) {
                        var ChildScope, child;
                        return isolate ? (child = new Scope(), child.$root = this.$root, child.$$asyncQueue = this.$$asyncQueue, 
                        child.$$postDigestQueue = this.$$postDigestQueue) : (ChildScope = function() {}, 
                        ChildScope.prototype = this, child = new ChildScope(), child.$id = nextUid()), child["this"] = child, 
                        child.$$listeners = {}, child.$$listenerCount = {}, child.$parent = this, child.$$watchers = child.$$nextSibling = child.$$childHead = child.$$childTail = null, 
                        child.$$prevSibling = this.$$childTail, this.$$childHead ? (this.$$childTail.$$nextSibling = child, 
                        this.$$childTail = child) : this.$$childHead = this.$$childTail = child, child;
                    },
                    $watch: function(watchExp, listener, objectEquality) {
                        var scope = this, get = compileToFn(watchExp, "watch"), array = scope.$$watchers, watcher = {
                            fn: listener,
                            last: initWatchVal,
                            get: get,
                            exp: watchExp,
                            eq: !!objectEquality
                        };
                        if (lastDirtyWatch = null, !isFunction(listener)) {
                            var listenFn = compileToFn(listener || noop, "listener");
                            watcher.fn = function(newVal, oldVal, scope) {
                                listenFn(scope);
                            };
                        }
                        if ("string" == typeof watchExp && get.constant) {
                            var originalFn = watcher.fn;
                            watcher.fn = function(newVal, oldVal, scope) {
                                originalFn.call(this, newVal, oldVal, scope), arrayRemove(array, watcher);
                            };
                        }
                        return array || (array = scope.$$watchers = []), array.unshift(watcher), function() {
                            arrayRemove(array, watcher), lastDirtyWatch = null;
                        };
                    },
                    $watchCollection: function(obj, listener) {
                        function $watchCollectionWatch() {
                            newValue = objGetter(self);
                            var newLength, key;
                            if (isObject(newValue)) if (isArrayLike(newValue)) {
                                oldValue !== internalArray && (oldValue = internalArray, oldLength = oldValue.length = 0, 
                                changeDetected++), newLength = newValue.length, oldLength !== newLength && (changeDetected++, 
                                oldValue.length = oldLength = newLength);
                                for (var i = 0; newLength > i; i++) oldValue[i] !== newValue[i] && (changeDetected++, 
                                oldValue[i] = newValue[i]);
                            } else {
                                oldValue !== internalObject && (oldValue = internalObject = {}, oldLength = 0, changeDetected++), 
                                newLength = 0;
                                for (key in newValue) newValue.hasOwnProperty(key) && (newLength++, oldValue.hasOwnProperty(key) ? oldValue[key] !== newValue[key] && (changeDetected++, 
                                oldValue[key] = newValue[key]) : (oldLength++, oldValue[key] = newValue[key], changeDetected++));
                                if (oldLength > newLength) {
                                    changeDetected++;
                                    for (key in oldValue) oldValue.hasOwnProperty(key) && !newValue.hasOwnProperty(key) && (oldLength--, 
                                    delete oldValue[key]);
                                }
                            } else oldValue !== newValue && (oldValue = newValue, changeDetected++);
                            return changeDetected;
                        }
                        function $watchCollectionAction() {
                            listener(newValue, oldValue, self);
                        }
                        var oldValue, newValue, self = this, changeDetected = 0, objGetter = $parse(obj), internalArray = [], internalObject = {}, oldLength = 0;
                        return this.$watch($watchCollectionWatch, $watchCollectionAction);
                    },
                    $digest: function() {
                        var watch, value, last, watchers, length, dirty, next, current, logIdx, logMsg, asyncTask, asyncQueue = this.$$asyncQueue, postDigestQueue = this.$$postDigestQueue, ttl = TTL, target = this, watchLog = [];
                        beginPhase("$digest"), lastDirtyWatch = null;
                        do {
                            for (dirty = !1, current = target; asyncQueue.length; ) {
                                try {
                                    asyncTask = asyncQueue.shift(), asyncTask.scope.$eval(asyncTask.expression);
                                } catch (e) {
                                    clearPhase(), $exceptionHandler(e);
                                }
                                lastDirtyWatch = null;
                            }
                            traverseScopesLoop: do {
                                if (watchers = current.$$watchers) for (length = watchers.length; length--; ) try {
                                    if (watch = watchers[length]) if ((value = watch.get(current)) === (last = watch.last) || (watch.eq ? equals(value, last) : "number" == typeof value && "number" == typeof last && isNaN(value) && isNaN(last))) {
                                        if (watch === lastDirtyWatch) {
                                            dirty = !1;
                                            break traverseScopesLoop;
                                        }
                                    } else dirty = !0, lastDirtyWatch = watch, watch.last = watch.eq ? copy(value) : value, 
                                    watch.fn(value, last === initWatchVal ? value : last, current), 5 > ttl && (logIdx = 4 - ttl, 
                                    watchLog[logIdx] || (watchLog[logIdx] = []), logMsg = isFunction(watch.exp) ? "fn: " + (watch.exp.name || watch.exp.toString()) : watch.exp, 
                                    logMsg += "; newVal: " + toJson(value) + "; oldVal: " + toJson(last), watchLog[logIdx].push(logMsg));
                                } catch (e) {
                                    clearPhase(), $exceptionHandler(e);
                                }
                                if (!(next = current.$$childHead || current !== target && current.$$nextSibling)) for (;current !== target && !(next = current.$$nextSibling); ) current = current.$parent;
                            } while (current = next);
                            if ((dirty || asyncQueue.length) && !ttl--) throw clearPhase(), $rootScopeMinErr("infdig", "{0} $digest() iterations reached. Aborting!\nWatchers fired in the last 5 iterations: {1}", TTL, toJson(watchLog));
                        } while (dirty || asyncQueue.length);
                        for (clearPhase(); postDigestQueue.length; ) try {
                            postDigestQueue.shift()();
                        } catch (e) {
                            $exceptionHandler(e);
                        }
                    },
                    $destroy: function() {
                        if (!this.$$destroyed) {
                            var parent = this.$parent;
                            this.$broadcast("$destroy"), this.$$destroyed = !0, this !== $rootScope && (forEach(this.$$listenerCount, bind(null, decrementListenerCount, this)), 
                            parent.$$childHead == this && (parent.$$childHead = this.$$nextSibling), parent.$$childTail == this && (parent.$$childTail = this.$$prevSibling), 
                            this.$$prevSibling && (this.$$prevSibling.$$nextSibling = this.$$nextSibling), this.$$nextSibling && (this.$$nextSibling.$$prevSibling = this.$$prevSibling), 
                            this.$parent = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null);
                        }
                    },
                    $eval: function(expr, locals) {
                        return $parse(expr)(this, locals);
                    },
                    $evalAsync: function(expr) {
                        $rootScope.$$phase || $rootScope.$$asyncQueue.length || $browser.defer(function() {
                            $rootScope.$$asyncQueue.length && $rootScope.$digest();
                        }), this.$$asyncQueue.push({
                            scope: this,
                            expression: expr
                        });
                    },
                    $$postDigest: function(fn) {
                        this.$$postDigestQueue.push(fn);
                    },
                    $apply: function(expr) {
                        try {
                            return beginPhase("$apply"), this.$eval(expr);
                        } catch (e) {
                            $exceptionHandler(e);
                        } finally {
                            clearPhase();
                            try {
                                $rootScope.$digest();
                            } catch (e) {
                                throw $exceptionHandler(e), e;
                            }
                        }
                    },
                    $on: function(name, listener) {
                        var namedListeners = this.$$listeners[name];
                        namedListeners || (this.$$listeners[name] = namedListeners = []), namedListeners.push(listener);
                        var current = this;
                        do current.$$listenerCount[name] || (current.$$listenerCount[name] = 0), current.$$listenerCount[name]++; while (current = current.$parent);
                        var self = this;
                        return function() {
                            namedListeners[indexOf(namedListeners, listener)] = null, decrementListenerCount(self, 1, name);
                        };
                    },
                    $emit: function(name, args) {
                        var namedListeners, i, length, empty = [], scope = this, stopPropagation = !1, event = {
                            name: name,
                            targetScope: scope,
                            stopPropagation: function() {
                                stopPropagation = !0;
                            },
                            preventDefault: function() {
                                event.defaultPrevented = !0;
                            },
                            defaultPrevented: !1
                        }, listenerArgs = concat([ event ], arguments, 1);
                        do {
                            for (namedListeners = scope.$$listeners[name] || empty, event.currentScope = scope, 
                            i = 0, length = namedListeners.length; length > i; i++) if (namedListeners[i]) try {
                                namedListeners[i].apply(null, listenerArgs);
                            } catch (e) {
                                $exceptionHandler(e);
                            } else namedListeners.splice(i, 1), i--, length--;
                            if (stopPropagation) return event;
                            scope = scope.$parent;
                        } while (scope);
                        return event;
                    },
                    $broadcast: function(name, args) {
                        for (var listeners, i, length, target = this, current = target, next = target, event = {
                            name: name,
                            targetScope: target,
                            preventDefault: function() {
                                event.defaultPrevented = !0;
                            },
                            defaultPrevented: !1
                        }, listenerArgs = concat([ event ], arguments, 1); current = next; ) {
                            for (event.currentScope = current, listeners = current.$$listeners[name] || [], 
                            i = 0, length = listeners.length; length > i; i++) if (listeners[i]) try {
                                listeners[i].apply(null, listenerArgs);
                            } catch (e) {
                                $exceptionHandler(e);
                            } else listeners.splice(i, 1), i--, length--;
                            if (!(next = current.$$listenerCount[name] && current.$$childHead || current !== target && current.$$nextSibling)) for (;current !== target && !(next = current.$$nextSibling); ) current = current.$parent;
                        }
                        return event;
                    }
                };
                var $rootScope = new Scope();
                return $rootScope;
            } ];
        }
        function $$SanitizeUriProvider() {
            var aHrefSanitizationWhitelist = /^\s*(https?|ftp|mailto|tel|file):/, imgSrcSanitizationWhitelist = /^\s*(https?|ftp|file):|data:image\//;
            this.aHrefSanitizationWhitelist = function(regexp) {
                return isDefined(regexp) ? (aHrefSanitizationWhitelist = regexp, this) : aHrefSanitizationWhitelist;
            }, this.imgSrcSanitizationWhitelist = function(regexp) {
                return isDefined(regexp) ? (imgSrcSanitizationWhitelist = regexp, this) : imgSrcSanitizationWhitelist;
            }, this.$get = function() {
                return function(uri, isImage) {
                    var normalizedVal, regex = isImage ? imgSrcSanitizationWhitelist : aHrefSanitizationWhitelist;
                    return msie && !(msie >= 8) || (normalizedVal = urlResolve(uri).href, "" === normalizedVal || normalizedVal.match(regex)) ? uri : "unsafe:" + normalizedVal;
                };
            };
        }
        function escapeForRegexp(s) {
            return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
        }
        function adjustMatcher(matcher) {
            if ("self" === matcher) return matcher;
            if (isString(matcher)) {
                if (matcher.indexOf("***") > -1) throw $sceMinErr("iwcard", "Illegal sequence *** in string matcher.  String: {0}", matcher);
                return matcher = escapeForRegexp(matcher).replace("\\*\\*", ".*").replace("\\*", "[^:/.?&;]*"), 
                new RegExp("^" + matcher + "$");
            }
            if (isRegExp(matcher)) return new RegExp("^" + matcher.source + "$");
            throw $sceMinErr("imatcher", 'Matchers may only be "self", string patterns or RegExp objects');
        }
        function adjustMatchers(matchers) {
            var adjustedMatchers = [];
            return isDefined(matchers) && forEach(matchers, function(matcher) {
                adjustedMatchers.push(adjustMatcher(matcher));
            }), adjustedMatchers;
        }
        function $SceDelegateProvider() {
            this.SCE_CONTEXTS = SCE_CONTEXTS;
            var resourceUrlWhitelist = [ "self" ], resourceUrlBlacklist = [];
            this.resourceUrlWhitelist = function(value) {
                return arguments.length && (resourceUrlWhitelist = adjustMatchers(value)), resourceUrlWhitelist;
            }, this.resourceUrlBlacklist = function(value) {
                return arguments.length && (resourceUrlBlacklist = adjustMatchers(value)), resourceUrlBlacklist;
            }, this.$get = [ "$injector", function($injector) {
                function matchUrl(matcher, parsedUrl) {
                    return "self" === matcher ? urlIsSameOrigin(parsedUrl) : !!matcher.exec(parsedUrl.href);
                }
                function isResourceUrlAllowedByPolicy(url) {
                    var i, n, parsedUrl = urlResolve(url.toString()), allowed = !1;
                    for (i = 0, n = resourceUrlWhitelist.length; n > i; i++) if (matchUrl(resourceUrlWhitelist[i], parsedUrl)) {
                        allowed = !0;
                        break;
                    }
                    if (allowed) for (i = 0, n = resourceUrlBlacklist.length; n > i; i++) if (matchUrl(resourceUrlBlacklist[i], parsedUrl)) {
                        allowed = !1;
                        break;
                    }
                    return allowed;
                }
                function generateHolderType(Base) {
                    var holderType = function(trustedValue) {
                        this.$$unwrapTrustedValue = function() {
                            return trustedValue;
                        };
                    };
                    return Base && (holderType.prototype = new Base()), holderType.prototype.valueOf = function() {
                        return this.$$unwrapTrustedValue();
                    }, holderType.prototype.toString = function() {
                        return this.$$unwrapTrustedValue().toString();
                    }, holderType;
                }
                function trustAs(type, trustedValue) {
                    var Constructor = byType.hasOwnProperty(type) ? byType[type] : null;
                    if (!Constructor) throw $sceMinErr("icontext", "Attempted to trust a value in invalid context. Context: {0}; Value: {1}", type, trustedValue);
                    if (null === trustedValue || trustedValue === undefined || "" === trustedValue) return trustedValue;
                    if ("string" != typeof trustedValue) throw $sceMinErr("itype", "Attempted to trust a non-string value in a content requiring a string: Context: {0}", type);
                    return new Constructor(trustedValue);
                }
                function valueOf(maybeTrusted) {
                    return maybeTrusted instanceof trustedValueHolderBase ? maybeTrusted.$$unwrapTrustedValue() : maybeTrusted;
                }
                function getTrusted(type, maybeTrusted) {
                    if (null === maybeTrusted || maybeTrusted === undefined || "" === maybeTrusted) return maybeTrusted;
                    var constructor = byType.hasOwnProperty(type) ? byType[type] : null;
                    if (constructor && maybeTrusted instanceof constructor) return maybeTrusted.$$unwrapTrustedValue();
                    if (type === SCE_CONTEXTS.RESOURCE_URL) {
                        if (isResourceUrlAllowedByPolicy(maybeTrusted)) return maybeTrusted;
                        throw $sceMinErr("insecurl", "Blocked loading resource from url not allowed by $sceDelegate policy.  URL: {0}", maybeTrusted.toString());
                    }
                    if (type === SCE_CONTEXTS.HTML) return htmlSanitizer(maybeTrusted);
                    throw $sceMinErr("unsafe", "Attempting to use an unsafe value in a safe context.");
                }
                var htmlSanitizer = function(html) {
                    throw $sceMinErr("unsafe", "Attempting to use an unsafe value in a safe context.");
                };
                $injector.has("$sanitize") && (htmlSanitizer = $injector.get("$sanitize"));
                var trustedValueHolderBase = generateHolderType(), byType = {};
                return byType[SCE_CONTEXTS.HTML] = generateHolderType(trustedValueHolderBase), byType[SCE_CONTEXTS.CSS] = generateHolderType(trustedValueHolderBase), 
                byType[SCE_CONTEXTS.URL] = generateHolderType(trustedValueHolderBase), byType[SCE_CONTEXTS.JS] = generateHolderType(trustedValueHolderBase), 
                byType[SCE_CONTEXTS.RESOURCE_URL] = generateHolderType(byType[SCE_CONTEXTS.URL]), 
                {
                    trustAs: trustAs,
                    getTrusted: getTrusted,
                    valueOf: valueOf
                };
            } ];
        }
        function $SceProvider() {
            var enabled = !0;
            this.enabled = function(value) {
                return arguments.length && (enabled = !!value), enabled;
            }, this.$get = [ "$parse", "$sniffer", "$sceDelegate", function($parse, $sniffer, $sceDelegate) {
                if (enabled && $sniffer.msie && $sniffer.msieDocumentMode < 8) throw $sceMinErr("iequirks", "Strict Contextual Escaping does not support Internet Explorer version < 9 in quirks mode.  You can fix this by adding the text <!doctype html> to the top of your HTML document.  See http://docs.angularjs.org/api/ng.$sce for more information.");
                var sce = copy(SCE_CONTEXTS);
                sce.isEnabled = function() {
                    return enabled;
                }, sce.trustAs = $sceDelegate.trustAs, sce.getTrusted = $sceDelegate.getTrusted, 
                sce.valueOf = $sceDelegate.valueOf, enabled || (sce.trustAs = sce.getTrusted = function(type, value) {
                    return value;
                }, sce.valueOf = identity), sce.parseAs = function(type, expr) {
                    var parsed = $parse(expr);
                    return parsed.literal && parsed.constant ? parsed : function(self, locals) {
                        return sce.getTrusted(type, parsed(self, locals));
                    };
                };
                var parse = sce.parseAs, getTrusted = sce.getTrusted, trustAs = sce.trustAs;
                return forEach(SCE_CONTEXTS, function(enumValue, name) {
                    var lName = lowercase(name);
                    sce[camelCase("parse_as_" + lName)] = function(expr) {
                        return parse(enumValue, expr);
                    }, sce[camelCase("get_trusted_" + lName)] = function(value) {
                        return getTrusted(enumValue, value);
                    }, sce[camelCase("trust_as_" + lName)] = function(value) {
                        return trustAs(enumValue, value);
                    };
                }), sce;
            } ];
        }
        function $SnifferProvider() {
            this.$get = [ "$window", "$document", function($window, $document) {
                var vendorPrefix, match, eventSupport = {}, android = int((/android (\d+)/.exec(lowercase(($window.navigator || {}).userAgent)) || [])[1]), boxee = /Boxee/i.test(($window.navigator || {}).userAgent), document = $document[0] || {}, documentMode = document.documentMode, vendorRegex = /^(Moz|webkit|O|ms)(?=[A-Z])/, bodyStyle = document.body && document.body.style, transitions = !1, animations = !1;
                if (bodyStyle) {
                    for (var prop in bodyStyle) if (match = vendorRegex.exec(prop)) {
                        vendorPrefix = match[0], vendorPrefix = vendorPrefix.substr(0, 1).toUpperCase() + vendorPrefix.substr(1);
                        break;
                    }
                    vendorPrefix || (vendorPrefix = "WebkitOpacity" in bodyStyle && "webkit"), transitions = !!("transition" in bodyStyle || vendorPrefix + "Transition" in bodyStyle), 
                    animations = !!("animation" in bodyStyle || vendorPrefix + "Animation" in bodyStyle), 
                    !android || transitions && animations || (transitions = isString(document.body.style.webkitTransition), 
                    animations = isString(document.body.style.webkitAnimation));
                }
                return {
                    history: !(!$window.history || !$window.history.pushState || 4 > android || boxee),
                    hashchange: "onhashchange" in $window && (!documentMode || documentMode > 7),
                    hasEvent: function(event) {
                        if ("input" == event && 9 == msie) return !1;
                        if (isUndefined(eventSupport[event])) {
                            var divElm = document.createElement("div");
                            eventSupport[event] = "on" + event in divElm;
                        }
                        return eventSupport[event];
                    },
                    csp: csp(),
                    vendorPrefix: vendorPrefix,
                    transitions: transitions,
                    animations: animations,
                    android: android,
                    msie: msie,
                    msieDocumentMode: documentMode
                };
            } ];
        }
        function $TimeoutProvider() {
            this.$get = [ "$rootScope", "$browser", "$q", "$exceptionHandler", function($rootScope, $browser, $q, $exceptionHandler) {
                function timeout(fn, delay, invokeApply) {
                    var timeoutId, deferred = $q.defer(), promise = deferred.promise, skipApply = isDefined(invokeApply) && !invokeApply;
                    return timeoutId = $browser.defer(function() {
                        try {
                            deferred.resolve(fn());
                        } catch (e) {
                            deferred.reject(e), $exceptionHandler(e);
                        } finally {
                            delete deferreds[promise.$$timeoutId];
                        }
                        skipApply || $rootScope.$apply();
                    }, delay), promise.$$timeoutId = timeoutId, deferreds[timeoutId] = deferred, promise;
                }
                var deferreds = {};
                return timeout.cancel = function(promise) {
                    return promise && promise.$$timeoutId in deferreds ? (deferreds[promise.$$timeoutId].reject("canceled"), 
                    delete deferreds[promise.$$timeoutId], $browser.defer.cancel(promise.$$timeoutId)) : !1;
                }, timeout;
            } ];
        }
        function urlResolve(url, base) {
            var href = url;
            return msie && (urlParsingNode.setAttribute("href", href), href = urlParsingNode.href), 
            urlParsingNode.setAttribute("href", href), {
                href: urlParsingNode.href,
                protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
                host: urlParsingNode.host,
                search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
                hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
                hostname: urlParsingNode.hostname,
                port: urlParsingNode.port,
                pathname: "/" === urlParsingNode.pathname.charAt(0) ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
            };
        }
        function urlIsSameOrigin(requestUrl) {
            var parsed = isString(requestUrl) ? urlResolve(requestUrl) : requestUrl;
            return parsed.protocol === originUrl.protocol && parsed.host === originUrl.host;
        }
        function $WindowProvider() {
            this.$get = valueFn(window);
        }
        function $FilterProvider($provide) {
            function register(name, factory) {
                if (isObject(name)) {
                    var filters = {};
                    return forEach(name, function(filter, key) {
                        filters[key] = register(key, filter);
                    }), filters;
                }
                return $provide.factory(name + suffix, factory);
            }
            var suffix = "Filter";
            this.register = register, this.$get = [ "$injector", function($injector) {
                return function(name) {
                    return $injector.get(name + suffix);
                };
            } ], register("currency", currencyFilter), register("date", dateFilter), register("filter", filterFilter), 
            register("json", jsonFilter), register("limitTo", limitToFilter), register("lowercase", lowercaseFilter), 
            register("number", numberFilter), register("orderBy", orderByFilter), register("uppercase", uppercaseFilter);
        }
        function filterFilter() {
            return function(array, expression, comparator) {
                if (!isArray(array)) return array;
                var comparatorType = typeof comparator, predicates = [];
                predicates.check = function(value) {
                    for (var j = 0; j < predicates.length; j++) if (!predicates[j](value)) return !1;
                    return !0;
                }, "function" !== comparatorType && (comparator = "boolean" === comparatorType && comparator ? function(obj, text) {
                    return angular.equals(obj, text);
                } : function(obj, text) {
                    return text = ("" + text).toLowerCase(), ("" + obj).toLowerCase().indexOf(text) > -1;
                });
                var search = function(obj, text) {
                    if ("string" == typeof text && "!" === text.charAt(0)) return !search(obj, text.substr(1));
                    switch (typeof obj) {
                      case "boolean":
                      case "number":
                      case "string":
                        return comparator(obj, text);

                      case "object":
                        switch (typeof text) {
                          case "object":
                            return comparator(obj, text);

                          default:
                            for (var objKey in obj) if ("$" !== objKey.charAt(0) && search(obj[objKey], text)) return !0;
                        }
                        return !1;

                      case "array":
                        for (var i = 0; i < obj.length; i++) if (search(obj[i], text)) return !0;
                        return !1;

                      default:
                        return !1;
                    }
                };
                switch (typeof expression) {
                  case "boolean":
                  case "number":
                  case "string":
                    expression = {
                        $: expression
                    };

                  case "object":
                    for (var key in expression) !function(path) {
                        "undefined" != typeof expression[path] && predicates.push(function(value) {
                            return search("$" == path ? value : value && value[path], expression[path]);
                        });
                    }(key);
                    break;

                  case "function":
                    predicates.push(expression);
                    break;

                  default:
                    return array;
                }
                for (var filtered = [], j = 0; j < array.length; j++) {
                    var value = array[j];
                    predicates.check(value) && filtered.push(value);
                }
                return filtered;
            };
        }
        function currencyFilter($locale) {
            var formats = $locale.NUMBER_FORMATS;
            return function(amount, currencySymbol) {
                return isUndefined(currencySymbol) && (currencySymbol = formats.CURRENCY_SYM), formatNumber(amount, formats.PATTERNS[1], formats.GROUP_SEP, formats.DECIMAL_SEP, 2).replace(/\u00A4/g, currencySymbol);
            };
        }
        function numberFilter($locale) {
            var formats = $locale.NUMBER_FORMATS;
            return function(number, fractionSize) {
                return formatNumber(number, formats.PATTERNS[0], formats.GROUP_SEP, formats.DECIMAL_SEP, fractionSize);
            };
        }
        function formatNumber(number, pattern, groupSep, decimalSep, fractionSize) {
            if (isNaN(number) || !isFinite(number)) return "";
            var isNegative = 0 > number;
            number = Math.abs(number);
            var numStr = number + "", formatedText = "", parts = [], hasExponent = !1;
            if (-1 !== numStr.indexOf("e")) {
                var match = numStr.match(/([\d\.]+)e(-?)(\d+)/);
                match && "-" == match[2] && match[3] > fractionSize + 1 ? numStr = "0" : (formatedText = numStr, 
                hasExponent = !0);
            }
            if (hasExponent) fractionSize > 0 && number > -1 && 1 > number && (formatedText = number.toFixed(fractionSize)); else {
                var fractionLen = (numStr.split(DECIMAL_SEP)[1] || "").length;
                isUndefined(fractionSize) && (fractionSize = Math.min(Math.max(pattern.minFrac, fractionLen), pattern.maxFrac));
                var pow = Math.pow(10, fractionSize);
                number = Math.round(number * pow) / pow;
                var fraction = ("" + number).split(DECIMAL_SEP), whole = fraction[0];
                fraction = fraction[1] || "";
                var i, pos = 0, lgroup = pattern.lgSize, group = pattern.gSize;
                if (whole.length >= lgroup + group) for (pos = whole.length - lgroup, i = 0; pos > i; i++) (pos - i) % group === 0 && 0 !== i && (formatedText += groupSep), 
                formatedText += whole.charAt(i);
                for (i = pos; i < whole.length; i++) (whole.length - i) % lgroup === 0 && 0 !== i && (formatedText += groupSep), 
                formatedText += whole.charAt(i);
                for (;fraction.length < fractionSize; ) fraction += "0";
                fractionSize && "0" !== fractionSize && (formatedText += decimalSep + fraction.substr(0, fractionSize));
            }
            return parts.push(isNegative ? pattern.negPre : pattern.posPre), parts.push(formatedText), 
            parts.push(isNegative ? pattern.negSuf : pattern.posSuf), parts.join("");
        }
        function padNumber(num, digits, trim) {
            var neg = "";
            for (0 > num && (neg = "-", num = -num), num = "" + num; num.length < digits; ) num = "0" + num;
            return trim && (num = num.substr(num.length - digits)), neg + num;
        }
        function dateGetter(name, size, offset, trim) {
            return offset = offset || 0, function(date) {
                var value = date["get" + name]();
                return (offset > 0 || value > -offset) && (value += offset), 0 === value && -12 == offset && (value = 12), 
                padNumber(value, size, trim);
            };
        }
        function dateStrGetter(name, shortForm) {
            return function(date, formats) {
                var value = date["get" + name](), get = uppercase(shortForm ? "SHORT" + name : name);
                return formats[get][value];
            };
        }
        function timeZoneGetter(date) {
            var zone = -1 * date.getTimezoneOffset(), paddedZone = zone >= 0 ? "+" : "";
            return paddedZone += padNumber(Math[zone > 0 ? "floor" : "ceil"](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2);
        }
        function ampmGetter(date, formats) {
            return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1];
        }
        function dateFilter($locale) {
            function jsonStringToDate(string) {
                var match;
                if (match = string.match(R_ISO8601_STR)) {
                    var date = new Date(0), tzHour = 0, tzMin = 0, dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear, timeSetter = match[8] ? date.setUTCHours : date.setHours;
                    match[9] && (tzHour = int(match[9] + match[10]), tzMin = int(match[9] + match[11])), 
                    dateSetter.call(date, int(match[1]), int(match[2]) - 1, int(match[3]));
                    var h = int(match[4] || 0) - tzHour, m = int(match[5] || 0) - tzMin, s = int(match[6] || 0), ms = Math.round(1e3 * parseFloat("0." + (match[7] || 0)));
                    return timeSetter.call(date, h, m, s, ms), date;
                }
                return string;
            }
            var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
            return function(date, format) {
                var fn, match, text = "", parts = [];
                if (format = format || "mediumDate", format = $locale.DATETIME_FORMATS[format] || format, 
                isString(date) && (date = NUMBER_STRING.test(date) ? int(date) : jsonStringToDate(date)), 
                isNumber(date) && (date = new Date(date)), !isDate(date)) return date;
                for (;format; ) match = DATE_FORMATS_SPLIT.exec(format), match ? (parts = concat(parts, match, 1), 
                format = parts.pop()) : (parts.push(format), format = null);
                return forEach(parts, function(value) {
                    fn = DATE_FORMATS[value], text += fn ? fn(date, $locale.DATETIME_FORMATS) : value.replace(/(^'|'$)/g, "").replace(/''/g, "'");
                }), text;
            };
        }
        function jsonFilter() {
            return function(object) {
                return toJson(object, !0);
            };
        }
        function limitToFilter() {
            return function(input, limit) {
                if (!isArray(input) && !isString(input)) return input;
                if (limit = int(limit), isString(input)) return limit ? limit >= 0 ? input.slice(0, limit) : input.slice(limit, input.length) : "";
                var i, n, out = [];
                for (limit > input.length ? limit = input.length : limit < -input.length && (limit = -input.length), 
                limit > 0 ? (i = 0, n = limit) : (i = input.length + limit, n = input.length); n > i; i++) out.push(input[i]);
                return out;
            };
        }
        function orderByFilter($parse) {
            return function(array, sortPredicate, reverseOrder) {
                function comparator(o1, o2) {
                    for (var i = 0; i < sortPredicate.length; i++) {
                        var comp = sortPredicate[i](o1, o2);
                        if (0 !== comp) return comp;
                    }
                    return 0;
                }
                function reverseComparator(comp, descending) {
                    return toBoolean(descending) ? function(a, b) {
                        return comp(b, a);
                    } : comp;
                }
                function compare(v1, v2) {
                    var t1 = typeof v1, t2 = typeof v2;
                    return t1 == t2 ? ("string" == t1 && (v1 = v1.toLowerCase(), v2 = v2.toLowerCase()), 
                    v1 === v2 ? 0 : v2 > v1 ? -1 : 1) : t2 > t1 ? -1 : 1;
                }
                if (!isArray(array)) return array;
                if (!sortPredicate) return array;
                sortPredicate = isArray(sortPredicate) ? sortPredicate : [ sortPredicate ], sortPredicate = map(sortPredicate, function(predicate) {
                    var descending = !1, get = predicate || identity;
                    return isString(predicate) && (("+" == predicate.charAt(0) || "-" == predicate.charAt(0)) && (descending = "-" == predicate.charAt(0), 
                    predicate = predicate.substring(1)), get = $parse(predicate)), reverseComparator(function(a, b) {
                        return compare(get(a), get(b));
                    }, descending);
                });
                for (var arrayCopy = [], i = 0; i < array.length; i++) arrayCopy.push(array[i]);
                return arrayCopy.sort(reverseComparator(comparator, reverseOrder));
            };
        }
        function ngDirective(directive) {
            return isFunction(directive) && (directive = {
                link: directive
            }), directive.restrict = directive.restrict || "AC", valueFn(directive);
        }
        function FormController(element, attrs) {
            function toggleValidCss(isValid, validationErrorKey) {
                validationErrorKey = validationErrorKey ? "-" + snake_case(validationErrorKey, "-") : "", 
                element.removeClass((isValid ? INVALID_CLASS : VALID_CLASS) + validationErrorKey).addClass((isValid ? VALID_CLASS : INVALID_CLASS) + validationErrorKey);
            }
            var form = this, parentForm = element.parent().controller("form") || nullFormCtrl, invalidCount = 0, errors = form.$error = {}, controls = [];
            form.$name = attrs.name || attrs.ngForm, form.$dirty = !1, form.$pristine = !0, 
            form.$valid = !0, form.$invalid = !1, parentForm.$addControl(form), element.addClass(PRISTINE_CLASS), 
            toggleValidCss(!0), form.$addControl = function(control) {
                assertNotHasOwnProperty(control.$name, "input"), controls.push(control), control.$name && (form[control.$name] = control);
            }, form.$removeControl = function(control) {
                control.$name && form[control.$name] === control && delete form[control.$name], 
                forEach(errors, function(queue, validationToken) {
                    form.$setValidity(validationToken, !0, control);
                }), arrayRemove(controls, control);
            }, form.$setValidity = function(validationToken, isValid, control) {
                var queue = errors[validationToken];
                if (isValid) queue && (arrayRemove(queue, control), queue.length || (invalidCount--, 
                invalidCount || (toggleValidCss(isValid), form.$valid = !0, form.$invalid = !1), 
                errors[validationToken] = !1, toggleValidCss(!0, validationToken), parentForm.$setValidity(validationToken, !0, form))); else {
                    if (invalidCount || toggleValidCss(isValid), queue) {
                        if (includes(queue, control)) return;
                    } else errors[validationToken] = queue = [], invalidCount++, toggleValidCss(!1, validationToken), 
                    parentForm.$setValidity(validationToken, !1, form);
                    queue.push(control), form.$valid = !1, form.$invalid = !0;
                }
            }, form.$setDirty = function() {
                element.removeClass(PRISTINE_CLASS).addClass(DIRTY_CLASS), form.$dirty = !0, form.$pristine = !1, 
                parentForm.$setDirty();
            }, form.$setPristine = function() {
                element.removeClass(DIRTY_CLASS).addClass(PRISTINE_CLASS), form.$dirty = !1, form.$pristine = !0, 
                forEach(controls, function(control) {
                    control.$setPristine();
                });
            };
        }
        function validate(ctrl, validatorName, validity, value) {
            return ctrl.$setValidity(validatorName, validity), validity ? value : undefined;
        }
        function textInputType(scope, element, attr, ctrl, $sniffer, $browser) {
            if (!$sniffer.android) {
                var composing = !1;
                element.on("compositionstart", function(data) {
                    composing = !0;
                }), element.on("compositionend", function() {
                    composing = !1;
                });
            }
            var listener = function() {
                if (!composing) {
                    var value = element.val();
                    toBoolean(attr.ngTrim || "T") && (value = trim(value)), ctrl.$viewValue !== value && (scope.$$phase ? ctrl.$setViewValue(value) : scope.$apply(function() {
                        ctrl.$setViewValue(value);
                    }));
                }
            };
            if ($sniffer.hasEvent("input")) element.on("input", listener); else {
                var timeout, deferListener = function() {
                    timeout || (timeout = $browser.defer(function() {
                        listener(), timeout = null;
                    }));
                };
                element.on("keydown", function(event) {
                    var key = event.keyCode;
                    91 === key || key > 15 && 19 > key || key >= 37 && 40 >= key || deferListener();
                }), $sniffer.hasEvent("paste") && element.on("paste cut", deferListener);
            }
            element.on("change", listener), ctrl.$render = function() {
                element.val(ctrl.$isEmpty(ctrl.$viewValue) ? "" : ctrl.$viewValue);
            };
            var patternValidator, match, pattern = attr.ngPattern;
            if (pattern) {
                var validateRegex = function(regexp, value) {
                    return validate(ctrl, "pattern", ctrl.$isEmpty(value) || regexp.test(value), value);
                };
                match = pattern.match(/^\/(.*)\/([gim]*)$/), match ? (pattern = new RegExp(match[1], match[2]), 
                patternValidator = function(value) {
                    return validateRegex(pattern, value);
                }) : patternValidator = function(value) {
                    var patternObj = scope.$eval(pattern);
                    if (!patternObj || !patternObj.test) throw minErr("ngPattern")("noregexp", "Expected {0} to be a RegExp but was {1}. Element: {2}", pattern, patternObj, startingTag(element));
                    return validateRegex(patternObj, value);
                }, ctrl.$formatters.push(patternValidator), ctrl.$parsers.push(patternValidator);
            }
            if (attr.ngMinlength) {
                var minlength = int(attr.ngMinlength), minLengthValidator = function(value) {
                    return validate(ctrl, "minlength", ctrl.$isEmpty(value) || value.length >= minlength, value);
                };
                ctrl.$parsers.push(minLengthValidator), ctrl.$formatters.push(minLengthValidator);
            }
            if (attr.ngMaxlength) {
                var maxlength = int(attr.ngMaxlength), maxLengthValidator = function(value) {
                    return validate(ctrl, "maxlength", ctrl.$isEmpty(value) || value.length <= maxlength, value);
                };
                ctrl.$parsers.push(maxLengthValidator), ctrl.$formatters.push(maxLengthValidator);
            }
        }
        function numberInputType(scope, element, attr, ctrl, $sniffer, $browser) {
            if (textInputType(scope, element, attr, ctrl, $sniffer, $browser), ctrl.$parsers.push(function(value) {
                var empty = ctrl.$isEmpty(value);
                return empty || NUMBER_REGEXP.test(value) ? (ctrl.$setValidity("number", !0), "" === value ? null : empty ? value : parseFloat(value)) : (ctrl.$setValidity("number", !1), 
                undefined);
            }), ctrl.$formatters.push(function(value) {
                return ctrl.$isEmpty(value) ? "" : "" + value;
            }), attr.min) {
                var minValidator = function(value) {
                    var min = parseFloat(attr.min);
                    return validate(ctrl, "min", ctrl.$isEmpty(value) || value >= min, value);
                };
                ctrl.$parsers.push(minValidator), ctrl.$formatters.push(minValidator);
            }
            if (attr.max) {
                var maxValidator = function(value) {
                    var max = parseFloat(attr.max);
                    return validate(ctrl, "max", ctrl.$isEmpty(value) || max >= value, value);
                };
                ctrl.$parsers.push(maxValidator), ctrl.$formatters.push(maxValidator);
            }
            ctrl.$formatters.push(function(value) {
                return validate(ctrl, "number", ctrl.$isEmpty(value) || isNumber(value), value);
            });
        }
        function urlInputType(scope, element, attr, ctrl, $sniffer, $browser) {
            textInputType(scope, element, attr, ctrl, $sniffer, $browser);
            var urlValidator = function(value) {
                return validate(ctrl, "url", ctrl.$isEmpty(value) || URL_REGEXP.test(value), value);
            };
            ctrl.$formatters.push(urlValidator), ctrl.$parsers.push(urlValidator);
        }
        function emailInputType(scope, element, attr, ctrl, $sniffer, $browser) {
            textInputType(scope, element, attr, ctrl, $sniffer, $browser);
            var emailValidator = function(value) {
                return validate(ctrl, "email", ctrl.$isEmpty(value) || EMAIL_REGEXP.test(value), value);
            };
            ctrl.$formatters.push(emailValidator), ctrl.$parsers.push(emailValidator);
        }
        function radioInputType(scope, element, attr, ctrl) {
            isUndefined(attr.name) && element.attr("name", nextUid()), element.on("click", function() {
                element[0].checked && scope.$apply(function() {
                    ctrl.$setViewValue(attr.value);
                });
            }), ctrl.$render = function() {
                var value = attr.value;
                element[0].checked = value == ctrl.$viewValue;
            }, attr.$observe("value", ctrl.$render);
        }
        function checkboxInputType(scope, element, attr, ctrl) {
            var trueValue = attr.ngTrueValue, falseValue = attr.ngFalseValue;
            isString(trueValue) || (trueValue = !0), isString(falseValue) || (falseValue = !1), 
            element.on("click", function() {
                scope.$apply(function() {
                    ctrl.$setViewValue(element[0].checked);
                });
            }), ctrl.$render = function() {
                element[0].checked = ctrl.$viewValue;
            }, ctrl.$isEmpty = function(value) {
                return value !== trueValue;
            }, ctrl.$formatters.push(function(value) {
                return value === trueValue;
            }), ctrl.$parsers.push(function(value) {
                return value ? trueValue : falseValue;
            });
        }
        function classDirective(name, selector) {
            return name = "ngClass" + name, function() {
                return {
                    restrict: "AC",
                    link: function(scope, element, attr) {
                        function ngClassWatchAction(newVal) {
                            if (selector === !0 || scope.$index % 2 === selector) {
                                var newClasses = flattenClasses(newVal || "");
                                oldVal ? equals(newVal, oldVal) || attr.$updateClass(newClasses, flattenClasses(oldVal)) : attr.$addClass(newClasses);
                            }
                            oldVal = copy(newVal);
                        }
                        function flattenClasses(classVal) {
                            if (isArray(classVal)) return classVal.join(" ");
                            if (isObject(classVal)) {
                                var classes = [];
                                return forEach(classVal, function(v, k) {
                                    v && classes.push(k);
                                }), classes.join(" ");
                            }
                            return classVal;
                        }
                        var oldVal;
                        scope.$watch(attr[name], ngClassWatchAction, !0), attr.$observe("class", function(value) {
                            ngClassWatchAction(scope.$eval(attr[name]));
                        }), "ngClass" !== name && scope.$watch("$index", function($index, old$index) {
                            var mod = 1 & $index;
                            if (mod !== old$index & 1) {
                                var classes = flattenClasses(scope.$eval(attr[name]));
                                mod === selector ? attr.$addClass(classes) : attr.$removeClass(classes);
                            }
                        });
                    }
                };
            };
        }
        var lowercase = function(string) {
            return isString(string) ? string.toLowerCase() : string;
        }, uppercase = function(string) {
            return isString(string) ? string.toUpperCase() : string;
        }, manualLowercase = function(s) {
            return isString(s) ? s.replace(/[A-Z]/g, function(ch) {
                return String.fromCharCode(32 | ch.charCodeAt(0));
            }) : s;
        }, manualUppercase = function(s) {
            return isString(s) ? s.replace(/[a-z]/g, function(ch) {
                return String.fromCharCode(-33 & ch.charCodeAt(0));
            }) : s;
        };
        "i" !== "I".toLowerCase() && (lowercase = manualLowercase, uppercase = manualUppercase);
        var msie, jqLite, jQuery, angularModule, nodeName_, slice = [].slice, push = [].push, toString = Object.prototype.toString, ngMinErr = minErr("ng"), angular = (window.angular, 
        window.angular || (window.angular = {})), uid = [ "0", "0", "0" ];
        msie = int((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]), isNaN(msie) && (msie = int((/trident\/.*; rv:(\d+)/.exec(lowercase(navigator.userAgent)) || [])[1])), 
        noop.$inject = [], identity.$inject = [];
        var trim = function() {
            return String.prototype.trim ? function(value) {
                return isString(value) ? value.trim() : value;
            } : function(value) {
                return isString(value) ? value.replace(/^\s\s*/, "").replace(/\s\s*$/, "") : value;
            };
        }();
        nodeName_ = 9 > msie ? function(element) {
            return element = element.nodeName ? element : element[0], element.scopeName && "HTML" != element.scopeName ? uppercase(element.scopeName + ":" + element.nodeName) : element.nodeName;
        } : function(element) {
            return element.nodeName ? element.nodeName : element[0].nodeName;
        };
        var SNAKE_CASE_REGEXP = /[A-Z]/g, version = {
            full: "1.2.12",
            major: 1,
            minor: 2,
            dot: 12,
            codeName: "cauliflower-eradication"
        }, jqCache = JQLite.cache = {}, jqName = JQLite.expando = "ng-" + new Date().getTime(), jqId = 1, addEventListenerFn = window.document.addEventListener ? function(element, type, fn) {
            element.addEventListener(type, fn, !1);
        } : function(element, type, fn) {
            element.attachEvent("on" + type, fn);
        }, removeEventListenerFn = window.document.removeEventListener ? function(element, type, fn) {
            element.removeEventListener(type, fn, !1);
        } : function(element, type, fn) {
            element.detachEvent("on" + type, fn);
        }, SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g, MOZ_HACK_REGEXP = /^moz([A-Z])/, jqLiteMinErr = minErr("jqLite"), JQLitePrototype = JQLite.prototype = {
            ready: function(fn) {
                function trigger() {
                    fired || (fired = !0, fn());
                }
                var fired = !1;
                "complete" === document.readyState ? setTimeout(trigger) : (this.on("DOMContentLoaded", trigger), 
                JQLite(window).on("load", trigger));
            },
            toString: function() {
                var value = [];
                return forEach(this, function(e) {
                    value.push("" + e);
                }), "[" + value.join(", ") + "]";
            },
            eq: function(index) {
                return jqLite(index >= 0 ? this[index] : this[this.length + index]);
            },
            length: 0,
            push: push,
            sort: [].sort,
            splice: [].splice
        }, BOOLEAN_ATTR = {};
        forEach("multiple,selected,checked,disabled,readOnly,required,open".split(","), function(value) {
            BOOLEAN_ATTR[lowercase(value)] = value;
        });
        var BOOLEAN_ELEMENTS = {};
        forEach("input,select,option,textarea,button,form,details".split(","), function(value) {
            BOOLEAN_ELEMENTS[uppercase(value)] = !0;
        }), forEach({
            data: jqLiteData,
            inheritedData: jqLiteInheritedData,
            scope: function(element) {
                return jqLite(element).data("$scope") || jqLiteInheritedData(element.parentNode || element, [ "$isolateScope", "$scope" ]);
            },
            isolateScope: function(element) {
                return jqLite(element).data("$isolateScope") || jqLite(element).data("$isolateScopeNoTemplate");
            },
            controller: jqLiteController,
            injector: function(element) {
                return jqLiteInheritedData(element, "$injector");
            },
            removeAttr: function(element, name) {
                element.removeAttribute(name);
            },
            hasClass: jqLiteHasClass,
            css: function(element, name, value) {
                if (name = camelCase(name), !isDefined(value)) {
                    var val;
                    return 8 >= msie && (val = element.currentStyle && element.currentStyle[name], "" === val && (val = "auto")), 
                    val = val || element.style[name], 8 >= msie && (val = "" === val ? undefined : val), 
                    val;
                }
                element.style[name] = value;
            },
            attr: function(element, name, value) {
                var lowercasedName = lowercase(name);
                if (BOOLEAN_ATTR[lowercasedName]) {
                    if (!isDefined(value)) return element[name] || (element.attributes.getNamedItem(name) || noop).specified ? lowercasedName : undefined;
                    value ? (element[name] = !0, element.setAttribute(name, lowercasedName)) : (element[name] = !1, 
                    element.removeAttribute(lowercasedName));
                } else if (isDefined(value)) element.setAttribute(name, value); else if (element.getAttribute) {
                    var ret = element.getAttribute(name, 2);
                    return null === ret ? undefined : ret;
                }
            },
            prop: function(element, name, value) {
                return isDefined(value) ? void (element[name] = value) : element[name];
            },
            text: function() {
                function getText(element, value) {
                    var textProp = NODE_TYPE_TEXT_PROPERTY[element.nodeType];
                    return isUndefined(value) ? textProp ? element[textProp] : "" : void (element[textProp] = value);
                }
                var NODE_TYPE_TEXT_PROPERTY = [];
                return 9 > msie ? (NODE_TYPE_TEXT_PROPERTY[1] = "innerText", NODE_TYPE_TEXT_PROPERTY[3] = "nodeValue") : NODE_TYPE_TEXT_PROPERTY[1] = NODE_TYPE_TEXT_PROPERTY[3] = "textContent", 
                getText.$dv = "", getText;
            }(),
            val: function(element, value) {
                if (isUndefined(value)) {
                    if ("SELECT" === nodeName_(element) && element.multiple) {
                        var result = [];
                        return forEach(element.options, function(option) {
                            option.selected && result.push(option.value || option.text);
                        }), 0 === result.length ? null : result;
                    }
                    return element.value;
                }
                element.value = value;
            },
            html: function(element, value) {
                if (isUndefined(value)) return element.innerHTML;
                for (var i = 0, childNodes = element.childNodes; i < childNodes.length; i++) jqLiteDealoc(childNodes[i]);
                element.innerHTML = value;
            },
            empty: jqLiteEmpty
        }, function(fn, name) {
            JQLite.prototype[name] = function(arg1, arg2) {
                var i, key;
                if (fn !== jqLiteEmpty && (2 == fn.length && fn !== jqLiteHasClass && fn !== jqLiteController ? arg1 : arg2) === undefined) {
                    if (isObject(arg1)) {
                        for (i = 0; i < this.length; i++) if (fn === jqLiteData) fn(this[i], arg1); else for (key in arg1) fn(this[i], key, arg1[key]);
                        return this;
                    }
                    for (var value = fn.$dv, jj = value === undefined ? Math.min(this.length, 1) : this.length, j = 0; jj > j; j++) {
                        var nodeValue = fn(this[j], arg1, arg2);
                        value = value ? value + nodeValue : nodeValue;
                    }
                    return value;
                }
                for (i = 0; i < this.length; i++) fn(this[i], arg1, arg2);
                return this;
            };
        }), forEach({
            removeData: jqLiteRemoveData,
            dealoc: jqLiteDealoc,
            on: function onFn(element, type, fn, unsupported) {
                if (isDefined(unsupported)) throw jqLiteMinErr("onargs", "jqLite#on() does not support the `selector` or `eventData` parameters");
                var events = jqLiteExpandoStore(element, "events"), handle = jqLiteExpandoStore(element, "handle");
                events || jqLiteExpandoStore(element, "events", events = {}), handle || jqLiteExpandoStore(element, "handle", handle = createEventHandler(element, events)), 
                forEach(type.split(" "), function(type) {
                    var eventFns = events[type];
                    if (!eventFns) {
                        if ("mouseenter" == type || "mouseleave" == type) {
                            var contains = document.body.contains || document.body.compareDocumentPosition ? function(a, b) {
                                var adown = 9 === a.nodeType ? a.documentElement : a, bup = b && b.parentNode;
                                return a === bup || !(!bup || 1 !== bup.nodeType || !(adown.contains ? adown.contains(bup) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(bup)));
                            } : function(a, b) {
                                if (b) for (;b = b.parentNode; ) if (b === a) return !0;
                                return !1;
                            };
                            events[type] = [];
                            var eventmap = {
                                mouseleave: "mouseout",
                                mouseenter: "mouseover"
                            };
                            onFn(element, eventmap[type], function(event) {
                                var target = this, related = event.relatedTarget;
                                (!related || related !== target && !contains(target, related)) && handle(event, type);
                            });
                        } else addEventListenerFn(element, type, handle), events[type] = [];
                        eventFns = events[type];
                    }
                    eventFns.push(fn);
                });
            },
            off: jqLiteOff,
            one: function(element, type, fn) {
                element = jqLite(element), element.on(type, function onFn() {
                    element.off(type, fn), element.off(type, onFn);
                }), element.on(type, fn);
            },
            replaceWith: function(element, replaceNode) {
                var index, parent = element.parentNode;
                jqLiteDealoc(element), forEach(new JQLite(replaceNode), function(node) {
                    index ? parent.insertBefore(node, index.nextSibling) : parent.replaceChild(node, element), 
                    index = node;
                });
            },
            children: function(element) {
                var children = [];
                return forEach(element.childNodes, function(element) {
                    1 === element.nodeType && children.push(element);
                }), children;
            },
            contents: function(element) {
                return element.childNodes || [];
            },
            append: function(element, node) {
                forEach(new JQLite(node), function(child) {
                    (1 === element.nodeType || 11 === element.nodeType) && element.appendChild(child);
                });
            },
            prepend: function(element, node) {
                if (1 === element.nodeType) {
                    var index = element.firstChild;
                    forEach(new JQLite(node), function(child) {
                        element.insertBefore(child, index);
                    });
                }
            },
            wrap: function(element, wrapNode) {
                wrapNode = jqLite(wrapNode)[0];
                var parent = element.parentNode;
                parent && parent.replaceChild(wrapNode, element), wrapNode.appendChild(element);
            },
            remove: function(element) {
                jqLiteDealoc(element);
                var parent = element.parentNode;
                parent && parent.removeChild(element);
            },
            after: function(element, newElement) {
                var index = element, parent = element.parentNode;
                forEach(new JQLite(newElement), function(node) {
                    parent.insertBefore(node, index.nextSibling), index = node;
                });
            },
            addClass: jqLiteAddClass,
            removeClass: jqLiteRemoveClass,
            toggleClass: function(element, selector, condition) {
                isUndefined(condition) && (condition = !jqLiteHasClass(element, selector)), (condition ? jqLiteAddClass : jqLiteRemoveClass)(element, selector);
            },
            parent: function(element) {
                var parent = element.parentNode;
                return parent && 11 !== parent.nodeType ? parent : null;
            },
            next: function(element) {
                if (element.nextElementSibling) return element.nextElementSibling;
                for (var elm = element.nextSibling; null != elm && 1 !== elm.nodeType; ) elm = elm.nextSibling;
                return elm;
            },
            find: function(element, selector) {
                return element.getElementsByTagName ? element.getElementsByTagName(selector) : [];
            },
            clone: jqLiteClone,
            triggerHandler: function(element, eventName, eventData) {
                var eventFns = (jqLiteExpandoStore(element, "events") || {})[eventName];
                eventData = eventData || [];
                var event = [ {
                    preventDefault: noop,
                    stopPropagation: noop
                } ];
                forEach(eventFns, function(fn) {
                    fn.apply(element, event.concat(eventData));
                });
            }
        }, function(fn, name) {
            JQLite.prototype[name] = function(arg1, arg2, arg3) {
                for (var value, i = 0; i < this.length; i++) isUndefined(value) ? (value = fn(this[i], arg1, arg2, arg3), 
                isDefined(value) && (value = jqLite(value))) : jqLiteAddNodes(value, fn(this[i], arg1, arg2, arg3));
                return isDefined(value) ? value : this;
            }, JQLite.prototype.bind = JQLite.prototype.on, JQLite.prototype.unbind = JQLite.prototype.off;
        }), HashMap.prototype = {
            put: function(key, value) {
                this[hashKey(key)] = value;
            },
            get: function(key) {
                return this[hashKey(key)];
            },
            remove: function(key) {
                var value = this[key = hashKey(key)];
                return delete this[key], value;
            }
        };
        var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m, FN_ARG_SPLIT = /,/, FN_ARG = /^\s*(_?)(\S+?)\1\s*$/, STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, $injectorMinErr = minErr("$injector"), $animateMinErr = minErr("$animate"), $AnimateProvider = [ "$provide", function($provide) {
            this.$$selectors = {}, this.register = function(name, factory) {
                var key = name + "-animation";
                if (name && "." != name.charAt(0)) throw $animateMinErr("notcsel", "Expecting class selector starting with '.' got '{0}'.", name);
                this.$$selectors[name.substr(1)] = key, $provide.factory(key, factory);
            }, this.classNameFilter = function(expression) {
                return 1 === arguments.length && (this.$$classNameFilter = expression instanceof RegExp ? expression : null), 
                this.$$classNameFilter;
            }, this.$get = [ "$timeout", function($timeout) {
                return {
                    enter: function(element, parent, after, done) {
                        after ? after.after(element) : (parent && parent[0] || (parent = after.parent()), 
                        parent.append(element)), done && $timeout(done, 0, !1);
                    },
                    leave: function(element, done) {
                        element.remove(), done && $timeout(done, 0, !1);
                    },
                    move: function(element, parent, after, done) {
                        this.enter(element, parent, after, done);
                    },
                    addClass: function(element, className, done) {
                        className = isString(className) ? className : isArray(className) ? className.join(" ") : "", 
                        forEach(element, function(element) {
                            jqLiteAddClass(element, className);
                        }), done && $timeout(done, 0, !1);
                    },
                    removeClass: function(element, className, done) {
                        className = isString(className) ? className : isArray(className) ? className.join(" ") : "", 
                        forEach(element, function(element) {
                            jqLiteRemoveClass(element, className);
                        }), done && $timeout(done, 0, !1);
                    },
                    enabled: noop
                };
            } ];
        } ], $compileMinErr = minErr("$compile");
        $CompileProvider.$inject = [ "$provide", "$$sanitizeUriProvider" ];
        var PREFIX_REGEXP = /^(x[\:\-_]|data[\:\-_])/i, $interpolateMinErr = minErr("$interpolate"), PATH_MATCH = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/, DEFAULT_PORTS = {
            http: 80,
            https: 443,
            ftp: 21
        }, $locationMinErr = minErr("$location");
        LocationHashbangInHtml5Url.prototype = LocationHashbangUrl.prototype = LocationHtml5Url.prototype = {
            $$html5: !1,
            $$replace: !1,
            absUrl: locationGetter("$$absUrl"),
            url: function(url, replace) {
                if (isUndefined(url)) return this.$$url;
                var match = PATH_MATCH.exec(url);
                return match[1] && this.path(decodeURIComponent(match[1])), (match[2] || match[1]) && this.search(match[3] || ""), 
                this.hash(match[5] || "", replace), this;
            },
            protocol: locationGetter("$$protocol"),
            host: locationGetter("$$host"),
            port: locationGetter("$$port"),
            path: locationGetterSetter("$$path", function(path) {
                return "/" == path.charAt(0) ? path : "/" + path;
            }),
            search: function(search, paramValue) {
                switch (arguments.length) {
                  case 0:
                    return this.$$search;

                  case 1:
                    if (isString(search)) this.$$search = parseKeyValue(search); else {
                        if (!isObject(search)) throw $locationMinErr("isrcharg", "The first argument of the `$location#search()` call must be a string or an object.");
                        this.$$search = search;
                    }
                    break;

                  default:
                    isUndefined(paramValue) || null === paramValue ? delete this.$$search[search] : this.$$search[search] = paramValue;
                }
                return this.$$compose(), this;
            },
            hash: locationGetterSetter("$$hash", identity),
            replace: function() {
                return this.$$replace = !0, this;
            }
        };
        var promiseWarning, $parseMinErr = minErr("$parse"), promiseWarningCache = {}, OPERATORS = {
            "null": function() {
                return null;
            },
            "true": function() {
                return !0;
            },
            "false": function() {
                return !1;
            },
            undefined: noop,
            "+": function(self, locals, a, b) {
                return a = a(self, locals), b = b(self, locals), isDefined(a) ? isDefined(b) ? a + b : a : isDefined(b) ? b : undefined;
            },
            "-": function(self, locals, a, b) {
                return a = a(self, locals), b = b(self, locals), (isDefined(a) ? a : 0) - (isDefined(b) ? b : 0);
            },
            "*": function(self, locals, a, b) {
                return a(self, locals) * b(self, locals);
            },
            "/": function(self, locals, a, b) {
                return a(self, locals) / b(self, locals);
            },
            "%": function(self, locals, a, b) {
                return a(self, locals) % b(self, locals);
            },
            "^": function(self, locals, a, b) {
                return a(self, locals) ^ b(self, locals);
            },
            "=": noop,
            "===": function(self, locals, a, b) {
                return a(self, locals) === b(self, locals);
            },
            "!==": function(self, locals, a, b) {
                return a(self, locals) !== b(self, locals);
            },
            "==": function(self, locals, a, b) {
                return a(self, locals) == b(self, locals);
            },
            "!=": function(self, locals, a, b) {
                return a(self, locals) != b(self, locals);
            },
            "<": function(self, locals, a, b) {
                return a(self, locals) < b(self, locals);
            },
            ">": function(self, locals, a, b) {
                return a(self, locals) > b(self, locals);
            },
            "<=": function(self, locals, a, b) {
                return a(self, locals) <= b(self, locals);
            },
            ">=": function(self, locals, a, b) {
                return a(self, locals) >= b(self, locals);
            },
            "&&": function(self, locals, a, b) {
                return a(self, locals) && b(self, locals);
            },
            "||": function(self, locals, a, b) {
                return a(self, locals) || b(self, locals);
            },
            "&": function(self, locals, a, b) {
                return a(self, locals) & b(self, locals);
            },
            "|": function(self, locals, a, b) {
                return b(self, locals)(self, locals, a(self, locals));
            },
            "!": function(self, locals, a) {
                return !a(self, locals);
            }
        }, ESCAPE = {
            n: "\n",
            f: "\f",
            r: "\r",
            t: "	",
            v: "",
            "'": "'",
            '"': '"'
        }, Lexer = function(options) {
            this.options = options;
        };
        Lexer.prototype = {
            constructor: Lexer,
            lex: function(text) {
                this.text = text, this.index = 0, this.ch = undefined, this.lastCh = ":", this.tokens = [];
                for (var token, json = []; this.index < this.text.length; ) {
                    if (this.ch = this.text.charAt(this.index), this.is("\"'")) this.readString(this.ch); else if (this.isNumber(this.ch) || this.is(".") && this.isNumber(this.peek())) this.readNumber(); else if (this.isIdent(this.ch)) this.readIdent(), 
                    this.was("{,") && "{" === json[0] && (token = this.tokens[this.tokens.length - 1]) && (token.json = -1 === token.text.indexOf(".")); else if (this.is("(){}[].,;:?")) this.tokens.push({
                        index: this.index,
                        text: this.ch,
                        json: this.was(":[,") && this.is("{[") || this.is("}]:,")
                    }), this.is("{[") && json.unshift(this.ch), this.is("}]") && json.shift(), this.index++; else {
                        if (this.isWhitespace(this.ch)) {
                            this.index++;
                            continue;
                        }
                        var ch2 = this.ch + this.peek(), ch3 = ch2 + this.peek(2), fn = OPERATORS[this.ch], fn2 = OPERATORS[ch2], fn3 = OPERATORS[ch3];
                        fn3 ? (this.tokens.push({
                            index: this.index,
                            text: ch3,
                            fn: fn3
                        }), this.index += 3) : fn2 ? (this.tokens.push({
                            index: this.index,
                            text: ch2,
                            fn: fn2
                        }), this.index += 2) : fn ? (this.tokens.push({
                            index: this.index,
                            text: this.ch,
                            fn: fn,
                            json: this.was("[,:") && this.is("+-")
                        }), this.index += 1) : this.throwError("Unexpected next character ", this.index, this.index + 1);
                    }
                    this.lastCh = this.ch;
                }
                return this.tokens;
            },
            is: function(chars) {
                return -1 !== chars.indexOf(this.ch);
            },
            was: function(chars) {
                return -1 !== chars.indexOf(this.lastCh);
            },
            peek: function(i) {
                var num = i || 1;
                return this.index + num < this.text.length ? this.text.charAt(this.index + num) : !1;
            },
            isNumber: function(ch) {
                return ch >= "0" && "9" >= ch;
            },
            isWhitespace: function(ch) {
                return " " === ch || "\r" === ch || "	" === ch || "\n" === ch || "" === ch || " " === ch;
            },
            isIdent: function(ch) {
                return ch >= "a" && "z" >= ch || ch >= "A" && "Z" >= ch || "_" === ch || "$" === ch;
            },
            isExpOperator: function(ch) {
                return "-" === ch || "+" === ch || this.isNumber(ch);
            },
            throwError: function(error, start, end) {
                end = end || this.index;
                var colStr = isDefined(start) ? "s " + start + "-" + this.index + " [" + this.text.substring(start, end) + "]" : " " + end;
                throw $parseMinErr("lexerr", "Lexer Error: {0} at column{1} in expression [{2}].", error, colStr, this.text);
            },
            readNumber: function() {
                for (var number = "", start = this.index; this.index < this.text.length; ) {
                    var ch = lowercase(this.text.charAt(this.index));
                    if ("." == ch || this.isNumber(ch)) number += ch; else {
                        var peekCh = this.peek();
                        if ("e" == ch && this.isExpOperator(peekCh)) number += ch; else if (this.isExpOperator(ch) && peekCh && this.isNumber(peekCh) && "e" == number.charAt(number.length - 1)) number += ch; else {
                            if (!this.isExpOperator(ch) || peekCh && this.isNumber(peekCh) || "e" != number.charAt(number.length - 1)) break;
                            this.throwError("Invalid exponent");
                        }
                    }
                    this.index++;
                }
                number = 1 * number, this.tokens.push({
                    index: start,
                    text: number,
                    json: !0,
                    fn: function() {
                        return number;
                    }
                });
            },
            readIdent: function() {
                for (var lastDot, peekIndex, methodName, ch, parser = this, ident = "", start = this.index; this.index < this.text.length && (ch = this.text.charAt(this.index), 
                "." === ch || this.isIdent(ch) || this.isNumber(ch)); ) "." === ch && (lastDot = this.index), 
                ident += ch, this.index++;
                if (lastDot) for (peekIndex = this.index; peekIndex < this.text.length; ) {
                    if (ch = this.text.charAt(peekIndex), "(" === ch) {
                        methodName = ident.substr(lastDot - start + 1), ident = ident.substr(0, lastDot - start), 
                        this.index = peekIndex;
                        break;
                    }
                    if (!this.isWhitespace(ch)) break;
                    peekIndex++;
                }
                var token = {
                    index: start,
                    text: ident
                };
                if (OPERATORS.hasOwnProperty(ident)) token.fn = OPERATORS[ident], token.json = OPERATORS[ident]; else {
                    var getter = getterFn(ident, this.options, this.text);
                    token.fn = extend(function(self, locals) {
                        return getter(self, locals);
                    }, {
                        assign: function(self, value) {
                            return setter(self, ident, value, parser.text, parser.options);
                        }
                    });
                }
                this.tokens.push(token), methodName && (this.tokens.push({
                    index: lastDot,
                    text: ".",
                    json: !1
                }), this.tokens.push({
                    index: lastDot + 1,
                    text: methodName,
                    json: !1
                }));
            },
            readString: function(quote) {
                var start = this.index;
                this.index++;
                for (var string = "", rawString = quote, escape = !1; this.index < this.text.length; ) {
                    var ch = this.text.charAt(this.index);
                    if (rawString += ch, escape) {
                        if ("u" === ch) {
                            var hex = this.text.substring(this.index + 1, this.index + 5);
                            hex.match(/[\da-f]{4}/i) || this.throwError("Invalid unicode escape [\\u" + hex + "]"), 
                            this.index += 4, string += String.fromCharCode(parseInt(hex, 16));
                        } else {
                            var rep = ESCAPE[ch];
                            string += rep ? rep : ch;
                        }
                        escape = !1;
                    } else if ("\\" === ch) escape = !0; else {
                        if (ch === quote) return this.index++, void this.tokens.push({
                            index: start,
                            text: rawString,
                            string: string,
                            json: !0,
                            fn: function() {
                                return string;
                            }
                        });
                        string += ch;
                    }
                    this.index++;
                }
                this.throwError("Unterminated quote", start);
            }
        };
        var Parser = function(lexer, $filter, options) {
            this.lexer = lexer, this.$filter = $filter, this.options = options;
        };
        Parser.ZERO = function() {
            return 0;
        }, Parser.prototype = {
            constructor: Parser,
            parse: function(text, json) {
                this.text = text, this.json = json, this.tokens = this.lexer.lex(text), json && (this.assignment = this.logicalOR, 
                this.functionCall = this.fieldAccess = this.objectIndex = this.filterChain = function() {
                    this.throwError("is not valid json", {
                        text: text,
                        index: 0
                    });
                });
                var value = json ? this.primary() : this.statements();
                return 0 !== this.tokens.length && this.throwError("is an unexpected token", this.tokens[0]), 
                value.literal = !!value.literal, value.constant = !!value.constant, value;
            },
            primary: function() {
                var primary;
                if (this.expect("(")) primary = this.filterChain(), this.consume(")"); else if (this.expect("[")) primary = this.arrayDeclaration(); else if (this.expect("{")) primary = this.object(); else {
                    var token = this.expect();
                    primary = token.fn, primary || this.throwError("not a primary expression", token), 
                    token.json && (primary.constant = !0, primary.literal = !0);
                }
                for (var next, context; next = this.expect("(", "[", "."); ) "(" === next.text ? (primary = this.functionCall(primary, context), 
                context = null) : "[" === next.text ? (context = primary, primary = this.objectIndex(primary)) : "." === next.text ? (context = primary, 
                primary = this.fieldAccess(primary)) : this.throwError("IMPOSSIBLE");
                return primary;
            },
            throwError: function(msg, token) {
                throw $parseMinErr("syntax", "Syntax Error: Token '{0}' {1} at column {2} of the expression [{3}] starting at [{4}].", token.text, msg, token.index + 1, this.text, this.text.substring(token.index));
            },
            peekToken: function() {
                if (0 === this.tokens.length) throw $parseMinErr("ueoe", "Unexpected end of expression: {0}", this.text);
                return this.tokens[0];
            },
            peek: function(e1, e2, e3, e4) {
                if (this.tokens.length > 0) {
                    var token = this.tokens[0], t = token.text;
                    if (t === e1 || t === e2 || t === e3 || t === e4 || !e1 && !e2 && !e3 && !e4) return token;
                }
                return !1;
            },
            expect: function(e1, e2, e3, e4) {
                var token = this.peek(e1, e2, e3, e4);
                return token ? (this.json && !token.json && this.throwError("is not valid json", token), 
                this.tokens.shift(), token) : !1;
            },
            consume: function(e1) {
                this.expect(e1) || this.throwError("is unexpected, expecting [" + e1 + "]", this.peek());
            },
            unaryFn: function(fn, right) {
                return extend(function(self, locals) {
                    return fn(self, locals, right);
                }, {
                    constant: right.constant
                });
            },
            ternaryFn: function(left, middle, right) {
                return extend(function(self, locals) {
                    return left(self, locals) ? middle(self, locals) : right(self, locals);
                }, {
                    constant: left.constant && middle.constant && right.constant
                });
            },
            binaryFn: function(left, fn, right) {
                return extend(function(self, locals) {
                    return fn(self, locals, left, right);
                }, {
                    constant: left.constant && right.constant
                });
            },
            statements: function() {
                for (var statements = []; ;) if (this.tokens.length > 0 && !this.peek("}", ")", ";", "]") && statements.push(this.filterChain()), 
                !this.expect(";")) return 1 === statements.length ? statements[0] : function(self, locals) {
                    for (var value, i = 0; i < statements.length; i++) {
                        var statement = statements[i];
                        statement && (value = statement(self, locals));
                    }
                    return value;
                };
            },
            filterChain: function() {
                for (var token, left = this.expression(); ;) {
                    if (!(token = this.expect("|"))) return left;
                    left = this.binaryFn(left, token.fn, this.filter());
                }
            },
            filter: function() {
                for (var token = this.expect(), fn = this.$filter(token.text), argsFn = []; ;) {
                    if (!(token = this.expect(":"))) {
                        var fnInvoke = function(self, locals, input) {
                            for (var args = [ input ], i = 0; i < argsFn.length; i++) args.push(argsFn[i](self, locals));
                            return fn.apply(self, args);
                        };
                        return function() {
                            return fnInvoke;
                        };
                    }
                    argsFn.push(this.expression());
                }
            },
            expression: function() {
                return this.assignment();
            },
            assignment: function() {
                var right, token, left = this.ternary();
                return (token = this.expect("=")) ? (left.assign || this.throwError("implies assignment but [" + this.text.substring(0, token.index) + "] can not be assigned to", token), 
                right = this.ternary(), function(scope, locals) {
                    return left.assign(scope, right(scope, locals), locals);
                }) : left;
            },
            ternary: function() {
                var middle, token, left = this.logicalOR();
                return (token = this.expect("?")) ? (middle = this.ternary(), (token = this.expect(":")) ? this.ternaryFn(left, middle, this.ternary()) : void this.throwError("expected :", token)) : left;
            },
            logicalOR: function() {
                for (var token, left = this.logicalAND(); ;) {
                    if (!(token = this.expect("||"))) return left;
                    left = this.binaryFn(left, token.fn, this.logicalAND());
                }
            },
            logicalAND: function() {
                var token, left = this.equality();
                return (token = this.expect("&&")) && (left = this.binaryFn(left, token.fn, this.logicalAND())), 
                left;
            },
            equality: function() {
                var token, left = this.relational();
                return (token = this.expect("==", "!=", "===", "!==")) && (left = this.binaryFn(left, token.fn, this.equality())), 
                left;
            },
            relational: function() {
                var token, left = this.additive();
                return (token = this.expect("<", ">", "<=", ">=")) && (left = this.binaryFn(left, token.fn, this.relational())), 
                left;
            },
            additive: function() {
                for (var token, left = this.multiplicative(); token = this.expect("+", "-"); ) left = this.binaryFn(left, token.fn, this.multiplicative());
                return left;
            },
            multiplicative: function() {
                for (var token, left = this.unary(); token = this.expect("*", "/", "%"); ) left = this.binaryFn(left, token.fn, this.unary());
                return left;
            },
            unary: function() {
                var token;
                return this.expect("+") ? this.primary() : (token = this.expect("-")) ? this.binaryFn(Parser.ZERO, token.fn, this.unary()) : (token = this.expect("!")) ? this.unaryFn(token.fn, this.unary()) : this.primary();
            },
            fieldAccess: function(object) {
                var parser = this, field = this.expect().text, getter = getterFn(field, this.options, this.text);
                return extend(function(scope, locals, self) {
                    return getter(self || object(scope, locals));
                }, {
                    assign: function(scope, value, locals) {
                        return setter(object(scope, locals), field, value, parser.text, parser.options);
                    }
                });
            },
            objectIndex: function(obj) {
                var parser = this, indexFn = this.expression();
                return this.consume("]"), extend(function(self, locals) {
                    var v, p, o = obj(self, locals), i = indexFn(self, locals);
                    return o ? (v = ensureSafeObject(o[i], parser.text), v && v.then && parser.options.unwrapPromises && (p = v, 
                    "$$v" in v || (p.$$v = undefined, p.then(function(val) {
                        p.$$v = val;
                    })), v = v.$$v), v) : undefined;
                }, {
                    assign: function(self, value, locals) {
                        var key = indexFn(self, locals), safe = ensureSafeObject(obj(self, locals), parser.text);
                        return safe[key] = value;
                    }
                });
            },
            functionCall: function(fn, contextGetter) {
                var argsFn = [];
                if (")" !== this.peekToken().text) do argsFn.push(this.expression()); while (this.expect(","));
                this.consume(")");
                var parser = this;
                return function(scope, locals) {
                    for (var args = [], context = contextGetter ? contextGetter(scope, locals) : scope, i = 0; i < argsFn.length; i++) args.push(argsFn[i](scope, locals));
                    var fnPtr = fn(scope, locals, context) || noop;
                    ensureSafeObject(context, parser.text), ensureSafeObject(fnPtr, parser.text);
                    var v = fnPtr.apply ? fnPtr.apply(context, args) : fnPtr(args[0], args[1], args[2], args[3], args[4]);
                    return ensureSafeObject(v, parser.text);
                };
            },
            arrayDeclaration: function() {
                var elementFns = [], allConstant = !0;
                if ("]" !== this.peekToken().text) do {
                    var elementFn = this.expression();
                    elementFns.push(elementFn), elementFn.constant || (allConstant = !1);
                } while (this.expect(","));
                return this.consume("]"), extend(function(self, locals) {
                    for (var array = [], i = 0; i < elementFns.length; i++) array.push(elementFns[i](self, locals));
                    return array;
                }, {
                    literal: !0,
                    constant: allConstant
                });
            },
            object: function() {
                var keyValues = [], allConstant = !0;
                if ("}" !== this.peekToken().text) do {
                    var token = this.expect(), key = token.string || token.text;
                    this.consume(":");
                    var value = this.expression();
                    keyValues.push({
                        key: key,
                        value: value
                    }), value.constant || (allConstant = !1);
                } while (this.expect(","));
                return this.consume("}"), extend(function(self, locals) {
                    for (var object = {}, i = 0; i < keyValues.length; i++) {
                        var keyValue = keyValues[i];
                        object[keyValue.key] = keyValue.value(self, locals);
                    }
                    return object;
                }, {
                    literal: !0,
                    constant: allConstant
                });
            }
        };
        var getterFnCache = {}, $sceMinErr = minErr("$sce"), SCE_CONTEXTS = {
            HTML: "html",
            CSS: "css",
            URL: "url",
            RESOURCE_URL: "resourceUrl",
            JS: "js"
        }, urlParsingNode = document.createElement("a"), originUrl = urlResolve(window.location.href, !0);
        $FilterProvider.$inject = [ "$provide" ], currencyFilter.$inject = [ "$locale" ], 
        numberFilter.$inject = [ "$locale" ];
        var DECIMAL_SEP = ".", DATE_FORMATS = {
            yyyy: dateGetter("FullYear", 4),
            yy: dateGetter("FullYear", 2, 0, !0),
            y: dateGetter("FullYear", 1),
            MMMM: dateStrGetter("Month"),
            MMM: dateStrGetter("Month", !0),
            MM: dateGetter("Month", 2, 1),
            M: dateGetter("Month", 1, 1),
            dd: dateGetter("Date", 2),
            d: dateGetter("Date", 1),
            HH: dateGetter("Hours", 2),
            H: dateGetter("Hours", 1),
            hh: dateGetter("Hours", 2, -12),
            h: dateGetter("Hours", 1, -12),
            mm: dateGetter("Minutes", 2),
            m: dateGetter("Minutes", 1),
            ss: dateGetter("Seconds", 2),
            s: dateGetter("Seconds", 1),
            sss: dateGetter("Milliseconds", 3),
            EEEE: dateStrGetter("Day"),
            EEE: dateStrGetter("Day", !0),
            a: ampmGetter,
            Z: timeZoneGetter
        }, DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/, NUMBER_STRING = /^\-?\d+$/;
        dateFilter.$inject = [ "$locale" ];
        var lowercaseFilter = valueFn(lowercase), uppercaseFilter = valueFn(uppercase);
        orderByFilter.$inject = [ "$parse" ];
        var htmlAnchorDirective = valueFn({
            restrict: "E",
            compile: function(element, attr) {
                return 8 >= msie && (attr.href || attr.name || attr.$set("href", ""), element.append(document.createComment("IE fix"))), 
                attr.href || attr.xlinkHref || attr.name ? void 0 : function(scope, element) {
                    var href = "[object SVGAnimatedString]" === toString.call(element.prop("href")) ? "xlink:href" : "href";
                    element.on("click", function(event) {
                        element.attr(href) || event.preventDefault();
                    });
                };
            }
        }), ngAttributeAliasDirectives = {};
        forEach(BOOLEAN_ATTR, function(propName, attrName) {
            if ("multiple" != propName) {
                var normalized = directiveNormalize("ng-" + attrName);
                ngAttributeAliasDirectives[normalized] = function() {
                    return {
                        priority: 100,
                        link: function(scope, element, attr) {
                            scope.$watch(attr[normalized], function(value) {
                                attr.$set(attrName, !!value);
                            });
                        }
                    };
                };
            }
        }), forEach([ "src", "srcset", "href" ], function(attrName) {
            var normalized = directiveNormalize("ng-" + attrName);
            ngAttributeAliasDirectives[normalized] = function() {
                return {
                    priority: 99,
                    link: function(scope, element, attr) {
                        attr.$observe(normalized, function(value) {
                            value && (attr.$set(attrName, value), msie && element.prop(attrName, attr[attrName]));
                        });
                    }
                };
            };
        });
        var nullFormCtrl = {
            $addControl: noop,
            $removeControl: noop,
            $setValidity: noop,
            $setDirty: noop,
            $setPristine: noop
        };
        FormController.$inject = [ "$element", "$attrs", "$scope" ];
        var formDirectiveFactory = function(isNgForm) {
            return [ "$timeout", function($timeout) {
                var formDirective = {
                    name: "form",
                    restrict: isNgForm ? "EAC" : "E",
                    controller: FormController,
                    compile: function() {
                        return {
                            pre: function(scope, formElement, attr, controller) {
                                if (!attr.action) {
                                    var preventDefaultListener = function(event) {
                                        event.preventDefault ? event.preventDefault() : event.returnValue = !1;
                                    };
                                    addEventListenerFn(formElement[0], "submit", preventDefaultListener), formElement.on("$destroy", function() {
                                        $timeout(function() {
                                            removeEventListenerFn(formElement[0], "submit", preventDefaultListener);
                                        }, 0, !1);
                                    });
                                }
                                var parentFormCtrl = formElement.parent().controller("form"), alias = attr.name || attr.ngForm;
                                alias && setter(scope, alias, controller, alias), parentFormCtrl && formElement.on("$destroy", function() {
                                    parentFormCtrl.$removeControl(controller), alias && setter(scope, alias, undefined, alias), 
                                    extend(controller, nullFormCtrl);
                                });
                            }
                        };
                    }
                };
                return formDirective;
            } ];
        }, formDirective = formDirectiveFactory(), ngFormDirective = formDirectiveFactory(!0), URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/, EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/i, NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/, inputType = {
            text: textInputType,
            number: numberInputType,
            url: urlInputType,
            email: emailInputType,
            radio: radioInputType,
            checkbox: checkboxInputType,
            hidden: noop,
            button: noop,
            submit: noop,
            reset: noop
        }, inputDirective = [ "$browser", "$sniffer", function($browser, $sniffer) {
            return {
                restrict: "E",
                require: "?ngModel",
                link: function(scope, element, attr, ctrl) {
                    ctrl && (inputType[lowercase(attr.type)] || inputType.text)(scope, element, attr, ctrl, $sniffer, $browser);
                }
            };
        } ], VALID_CLASS = "ng-valid", INVALID_CLASS = "ng-invalid", PRISTINE_CLASS = "ng-pristine", DIRTY_CLASS = "ng-dirty", NgModelController = [ "$scope", "$exceptionHandler", "$attrs", "$element", "$parse", function($scope, $exceptionHandler, $attr, $element, $parse) {
            function toggleValidCss(isValid, validationErrorKey) {
                validationErrorKey = validationErrorKey ? "-" + snake_case(validationErrorKey, "-") : "", 
                $element.removeClass((isValid ? INVALID_CLASS : VALID_CLASS) + validationErrorKey).addClass((isValid ? VALID_CLASS : INVALID_CLASS) + validationErrorKey);
            }
            this.$viewValue = Number.NaN, this.$modelValue = Number.NaN, this.$parsers = [], 
            this.$formatters = [], this.$viewChangeListeners = [], this.$pristine = !0, this.$dirty = !1, 
            this.$valid = !0, this.$invalid = !1, this.$name = $attr.name;
            var ngModelGet = $parse($attr.ngModel), ngModelSet = ngModelGet.assign;
            if (!ngModelSet) throw minErr("ngModel")("nonassign", "Expression '{0}' is non-assignable. Element: {1}", $attr.ngModel, startingTag($element));
            this.$render = noop, this.$isEmpty = function(value) {
                return isUndefined(value) || "" === value || null === value || value !== value;
            };
            var parentForm = $element.inheritedData("$formController") || nullFormCtrl, invalidCount = 0, $error = this.$error = {};
            $element.addClass(PRISTINE_CLASS), toggleValidCss(!0), this.$setValidity = function(validationErrorKey, isValid) {
                $error[validationErrorKey] !== !isValid && (isValid ? ($error[validationErrorKey] && invalidCount--, 
                invalidCount || (toggleValidCss(!0), this.$valid = !0, this.$invalid = !1)) : (toggleValidCss(!1), 
                this.$invalid = !0, this.$valid = !1, invalidCount++), $error[validationErrorKey] = !isValid, 
                toggleValidCss(isValid, validationErrorKey), parentForm.$setValidity(validationErrorKey, isValid, this));
            }, this.$setPristine = function() {
                this.$dirty = !1, this.$pristine = !0, $element.removeClass(DIRTY_CLASS).addClass(PRISTINE_CLASS);
            }, this.$setViewValue = function(value) {
                this.$viewValue = value, this.$pristine && (this.$dirty = !0, this.$pristine = !1, 
                $element.removeClass(PRISTINE_CLASS).addClass(DIRTY_CLASS), parentForm.$setDirty()), 
                forEach(this.$parsers, function(fn) {
                    value = fn(value);
                }), this.$modelValue !== value && (this.$modelValue = value, ngModelSet($scope, value), 
                forEach(this.$viewChangeListeners, function(listener) {
                    try {
                        listener();
                    } catch (e) {
                        $exceptionHandler(e);
                    }
                }));
            };
            var ctrl = this;
            $scope.$watch(function() {
                var value = ngModelGet($scope);
                if (ctrl.$modelValue !== value) {
                    var formatters = ctrl.$formatters, idx = formatters.length;
                    for (ctrl.$modelValue = value; idx--; ) value = formatters[idx](value);
                    ctrl.$viewValue !== value && (ctrl.$viewValue = value, ctrl.$render());
                }
                return value;
            });
        } ], ngModelDirective = function() {
            return {
                require: [ "ngModel", "^?form" ],
                controller: NgModelController,
                link: function(scope, element, attr, ctrls) {
                    var modelCtrl = ctrls[0], formCtrl = ctrls[1] || nullFormCtrl;
                    formCtrl.$addControl(modelCtrl), scope.$on("$destroy", function() {
                        formCtrl.$removeControl(modelCtrl);
                    });
                }
            };
        }, ngChangeDirective = valueFn({
            require: "ngModel",
            link: function(scope, element, attr, ctrl) {
                ctrl.$viewChangeListeners.push(function() {
                    scope.$eval(attr.ngChange);
                });
            }
        }), requiredDirective = function() {
            return {
                require: "?ngModel",
                link: function(scope, elm, attr, ctrl) {
                    if (ctrl) {
                        attr.required = !0;
                        var validator = function(value) {
                            return attr.required && ctrl.$isEmpty(value) ? void ctrl.$setValidity("required", !1) : (ctrl.$setValidity("required", !0), 
                            value);
                        };
                        ctrl.$formatters.push(validator), ctrl.$parsers.unshift(validator), attr.$observe("required", function() {
                            validator(ctrl.$viewValue);
                        });
                    }
                }
            };
        }, ngListDirective = function() {
            return {
                require: "ngModel",
                link: function(scope, element, attr, ctrl) {
                    var match = /\/(.*)\//.exec(attr.ngList), separator = match && new RegExp(match[1]) || attr.ngList || ",", parse = function(viewValue) {
                        if (!isUndefined(viewValue)) {
                            var list = [];
                            return viewValue && forEach(viewValue.split(separator), function(value) {
                                value && list.push(trim(value));
                            }), list;
                        }
                    };
                    ctrl.$parsers.push(parse), ctrl.$formatters.push(function(value) {
                        return isArray(value) ? value.join(", ") : undefined;
                    }), ctrl.$isEmpty = function(value) {
                        return !value || !value.length;
                    };
                }
            };
        }, CONSTANT_VALUE_REGEXP = /^(true|false|\d+)$/, ngValueDirective = function() {
            return {
                priority: 100,
                compile: function(tpl, tplAttr) {
                    return CONSTANT_VALUE_REGEXP.test(tplAttr.ngValue) ? function(scope, elm, attr) {
                        attr.$set("value", scope.$eval(attr.ngValue));
                    } : function(scope, elm, attr) {
                        scope.$watch(attr.ngValue, function(value) {
                            attr.$set("value", value);
                        });
                    };
                }
            };
        }, ngBindDirective = ngDirective(function(scope, element, attr) {
            element.addClass("ng-binding").data("$binding", attr.ngBind), scope.$watch(attr.ngBind, function(value) {
                element.text(value == undefined ? "" : value);
            });
        }), ngBindTemplateDirective = [ "$interpolate", function($interpolate) {
            return function(scope, element, attr) {
                var interpolateFn = $interpolate(element.attr(attr.$attr.ngBindTemplate));
                element.addClass("ng-binding").data("$binding", interpolateFn), attr.$observe("ngBindTemplate", function(value) {
                    element.text(value);
                });
            };
        } ], ngBindHtmlDirective = [ "$sce", "$parse", function($sce, $parse) {
            return function(scope, element, attr) {
                function getStringValue() {
                    return (parsed(scope) || "").toString();
                }
                element.addClass("ng-binding").data("$binding", attr.ngBindHtml);
                var parsed = $parse(attr.ngBindHtml);
                scope.$watch(getStringValue, function(value) {
                    element.html($sce.getTrustedHtml(parsed(scope)) || "");
                });
            };
        } ], ngClassDirective = classDirective("", !0), ngClassOddDirective = classDirective("Odd", 0), ngClassEvenDirective = classDirective("Even", 1), ngCloakDirective = ngDirective({
            compile: function(element, attr) {
                attr.$set("ngCloak", undefined), element.removeClass("ng-cloak");
            }
        }), ngControllerDirective = [ function() {
            return {
                scope: !0,
                controller: "@",
                priority: 500
            };
        } ], ngEventDirectives = {};
        forEach("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "), function(name) {
            var directiveName = directiveNormalize("ng-" + name);
            ngEventDirectives[directiveName] = [ "$parse", function($parse) {
                return {
                    compile: function($element, attr) {
                        var fn = $parse(attr[directiveName]);
                        return function(scope, element, attr) {
                            element.on(lowercase(name), function(event) {
                                scope.$apply(function() {
                                    fn(scope, {
                                        $event: event
                                    });
                                });
                            });
                        };
                    }
                };
            } ];
        });
        var ngIfDirective = [ "$animate", function($animate) {
            return {
                transclude: "element",
                priority: 600,
                terminal: !0,
                restrict: "A",
                $$tlb: !0,
                link: function($scope, $element, $attr, ctrl, $transclude) {
                    var block, childScope;
                    $scope.$watch($attr.ngIf, function(value) {
                        toBoolean(value) ? childScope || (childScope = $scope.$new(), $transclude(childScope, function(clone) {
                            clone[clone.length++] = document.createComment(" end ngIf: " + $attr.ngIf + " "), 
                            block = {
                                clone: clone
                            }, $animate.enter(clone, $element.parent(), $element);
                        })) : (childScope && (childScope.$destroy(), childScope = null), block && ($animate.leave(getBlockElements(block.clone)), 
                        block = null));
                    });
                }
            };
        } ], ngIncludeDirective = [ "$http", "$templateCache", "$anchorScroll", "$animate", "$sce", function($http, $templateCache, $anchorScroll, $animate, $sce) {
            return {
                restrict: "ECA",
                priority: 400,
                terminal: !0,
                transclude: "element",
                controller: angular.noop,
                compile: function(element, attr) {
                    var srcExp = attr.ngInclude || attr.src, onloadExp = attr.onload || "", autoScrollExp = attr.autoscroll;
                    return function(scope, $element, $attr, ctrl, $transclude) {
                        var currentScope, currentElement, changeCounter = 0, cleanupLastIncludeContent = function() {
                            currentScope && (currentScope.$destroy(), currentScope = null), currentElement && ($animate.leave(currentElement), 
                            currentElement = null);
                        };
                        scope.$watch($sce.parseAsResourceUrl(srcExp), function(src) {
                            var afterAnimation = function() {
                                !isDefined(autoScrollExp) || autoScrollExp && !scope.$eval(autoScrollExp) || $anchorScroll();
                            }, thisChangeId = ++changeCounter;
                            src ? ($http.get(src, {
                                cache: $templateCache
                            }).success(function(response) {
                                if (thisChangeId === changeCounter) {
                                    var newScope = scope.$new();
                                    ctrl.template = response;
                                    var clone = $transclude(newScope, function(clone) {
                                        cleanupLastIncludeContent(), $animate.enter(clone, null, $element, afterAnimation);
                                    });
                                    currentScope = newScope, currentElement = clone, currentScope.$emit("$includeContentLoaded"), 
                                    scope.$eval(onloadExp);
                                }
                            }).error(function() {
                                thisChangeId === changeCounter && cleanupLastIncludeContent();
                            }), scope.$emit("$includeContentRequested")) : (cleanupLastIncludeContent(), ctrl.template = null);
                        });
                    };
                }
            };
        } ], ngIncludeFillContentDirective = [ "$compile", function($compile) {
            return {
                restrict: "ECA",
                priority: -400,
                require: "ngInclude",
                link: function(scope, $element, $attr, ctrl) {
                    $element.html(ctrl.template), $compile($element.contents())(scope);
                }
            };
        } ], ngInitDirective = ngDirective({
            priority: 450,
            compile: function() {
                return {
                    pre: function(scope, element, attrs) {
                        scope.$eval(attrs.ngInit);
                    }
                };
            }
        }), ngNonBindableDirective = ngDirective({
            terminal: !0,
            priority: 1e3
        }), ngPluralizeDirective = [ "$locale", "$interpolate", function($locale, $interpolate) {
            var BRACE = /{}/g;
            return {
                restrict: "EA",
                link: function(scope, element, attr) {
                    var numberExp = attr.count, whenExp = attr.$attr.when && element.attr(attr.$attr.when), offset = attr.offset || 0, whens = scope.$eval(whenExp) || {}, whensExpFns = {}, startSymbol = $interpolate.startSymbol(), endSymbol = $interpolate.endSymbol(), isWhen = /^when(Minus)?(.+)$/;
                    forEach(attr, function(expression, attributeName) {
                        isWhen.test(attributeName) && (whens[lowercase(attributeName.replace("when", "").replace("Minus", "-"))] = element.attr(attr.$attr[attributeName]));
                    }), forEach(whens, function(expression, key) {
                        whensExpFns[key] = $interpolate(expression.replace(BRACE, startSymbol + numberExp + "-" + offset + endSymbol));
                    }), scope.$watch(function() {
                        var value = parseFloat(scope.$eval(numberExp));
                        return isNaN(value) ? "" : (value in whens || (value = $locale.pluralCat(value - offset)), 
                        whensExpFns[value](scope, element, !0));
                    }, function(newVal) {
                        element.text(newVal);
                    });
                }
            };
        } ], ngRepeatDirective = [ "$parse", "$animate", function($parse, $animate) {
            function getBlockStart(block) {
                return block.clone[0];
            }
            function getBlockEnd(block) {
                return block.clone[block.clone.length - 1];
            }
            var NG_REMOVED = "$$NG_REMOVED", ngRepeatMinErr = minErr("ngRepeat");
            return {
                transclude: "element",
                priority: 1e3,
                terminal: !0,
                $$tlb: !0,
                link: function($scope, $element, $attr, ctrl, $transclude) {
                    var trackByExp, trackByExpGetter, trackByIdExpFn, trackByIdArrayFn, trackByIdObjFn, lhs, rhs, valueIdentifier, keyIdentifier, expression = $attr.ngRepeat, match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/), hashFnLocals = {
                        $id: hashKey
                    };
                    if (!match) throw ngRepeatMinErr("iexp", "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.", expression);
                    if (lhs = match[1], rhs = match[2], trackByExp = match[3], trackByExp ? (trackByExpGetter = $parse(trackByExp), 
                    trackByIdExpFn = function(key, value, index) {
                        return keyIdentifier && (hashFnLocals[keyIdentifier] = key), hashFnLocals[valueIdentifier] = value, 
                        hashFnLocals.$index = index, trackByExpGetter($scope, hashFnLocals);
                    }) : (trackByIdArrayFn = function(key, value) {
                        return hashKey(value);
                    }, trackByIdObjFn = function(key) {
                        return key;
                    }), match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/), !match) throw ngRepeatMinErr("iidexp", "'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.", lhs);
                    valueIdentifier = match[3] || match[1], keyIdentifier = match[2];
                    var lastBlockMap = {};
                    $scope.$watchCollection(rhs, function(collection) {
                        var index, length, nextNode, arrayLength, childScope, key, value, trackById, trackByIdFn, collectionKeys, block, elementsToRemove, previousNode = $element[0], nextBlockMap = {}, nextBlockOrder = [];
                        if (isArrayLike(collection)) collectionKeys = collection, trackByIdFn = trackByIdExpFn || trackByIdArrayFn; else {
                            trackByIdFn = trackByIdExpFn || trackByIdObjFn, collectionKeys = [];
                            for (key in collection) collection.hasOwnProperty(key) && "$" != key.charAt(0) && collectionKeys.push(key);
                            collectionKeys.sort();
                        }
                        for (arrayLength = collectionKeys.length, length = nextBlockOrder.length = collectionKeys.length, 
                        index = 0; length > index; index++) if (key = collection === collectionKeys ? index : collectionKeys[index], 
                        value = collection[key], trackById = trackByIdFn(key, value, index), assertNotHasOwnProperty(trackById, "`track by` id"), 
                        lastBlockMap.hasOwnProperty(trackById)) block = lastBlockMap[trackById], delete lastBlockMap[trackById], 
                        nextBlockMap[trackById] = block, nextBlockOrder[index] = block; else {
                            if (nextBlockMap.hasOwnProperty(trackById)) throw forEach(nextBlockOrder, function(block) {
                                block && block.scope && (lastBlockMap[block.id] = block);
                            }), ngRepeatMinErr("dupes", "Duplicates in a repeater are not allowed. Use 'track by' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}", expression, trackById);
                            nextBlockOrder[index] = {
                                id: trackById
                            }, nextBlockMap[trackById] = !1;
                        }
                        for (key in lastBlockMap) lastBlockMap.hasOwnProperty(key) && (block = lastBlockMap[key], 
                        elementsToRemove = getBlockElements(block.clone), $animate.leave(elementsToRemove), 
                        forEach(elementsToRemove, function(element) {
                            element[NG_REMOVED] = !0;
                        }), block.scope.$destroy());
                        for (index = 0, length = collectionKeys.length; length > index; index++) {
                            if (key = collection === collectionKeys ? index : collectionKeys[index], value = collection[key], 
                            block = nextBlockOrder[index], nextBlockOrder[index - 1] && (previousNode = getBlockEnd(nextBlockOrder[index - 1])), 
                            block.scope) {
                                childScope = block.scope, nextNode = previousNode;
                                do nextNode = nextNode.nextSibling; while (nextNode && nextNode[NG_REMOVED]);
                                getBlockStart(block) != nextNode && $animate.move(getBlockElements(block.clone), null, jqLite(previousNode)), 
                                previousNode = getBlockEnd(block);
                            } else childScope = $scope.$new();
                            childScope[valueIdentifier] = value, keyIdentifier && (childScope[keyIdentifier] = key), 
                            childScope.$index = index, childScope.$first = 0 === index, childScope.$last = index === arrayLength - 1, 
                            childScope.$middle = !(childScope.$first || childScope.$last), childScope.$odd = !(childScope.$even = 0 === (1 & index)), 
                            block.scope || $transclude(childScope, function(clone) {
                                clone[clone.length++] = document.createComment(" end ngRepeat: " + expression + " "), 
                                $animate.enter(clone, null, jqLite(previousNode)), previousNode = clone, block.scope = childScope, 
                                block.clone = clone, nextBlockMap[block.id] = block;
                            });
                        }
                        lastBlockMap = nextBlockMap;
                    });
                }
            };
        } ], ngShowDirective = [ "$animate", function($animate) {
            return function(scope, element, attr) {
                scope.$watch(attr.ngShow, function(value) {
                    $animate[toBoolean(value) ? "removeClass" : "addClass"](element, "ng-hide");
                });
            };
        } ], ngHideDirective = [ "$animate", function($animate) {
            return function(scope, element, attr) {
                scope.$watch(attr.ngHide, function(value) {
                    $animate[toBoolean(value) ? "addClass" : "removeClass"](element, "ng-hide");
                });
            };
        } ], ngStyleDirective = ngDirective(function(scope, element, attr) {
            scope.$watch(attr.ngStyle, function(newStyles, oldStyles) {
                oldStyles && newStyles !== oldStyles && forEach(oldStyles, function(val, style) {
                    element.css(style, "");
                }), newStyles && element.css(newStyles);
            }, !0);
        }), ngSwitchDirective = [ "$animate", function($animate) {
            return {
                restrict: "EA",
                require: "ngSwitch",
                controller: [ "$scope", function() {
                    this.cases = {};
                } ],
                link: function(scope, element, attr, ngSwitchController) {
                    var selectedTranscludes, selectedElements, watchExpr = attr.ngSwitch || attr.on, selectedScopes = [];
                    scope.$watch(watchExpr, function(value) {
                        for (var i = 0, ii = selectedScopes.length; ii > i; i++) selectedScopes[i].$destroy(), 
                        $animate.leave(selectedElements[i]);
                        selectedElements = [], selectedScopes = [], (selectedTranscludes = ngSwitchController.cases["!" + value] || ngSwitchController.cases["?"]) && (scope.$eval(attr.change), 
                        forEach(selectedTranscludes, function(selectedTransclude) {
                            var selectedScope = scope.$new();
                            selectedScopes.push(selectedScope), selectedTransclude.transclude(selectedScope, function(caseElement) {
                                var anchor = selectedTransclude.element;
                                selectedElements.push(caseElement), $animate.enter(caseElement, anchor.parent(), anchor);
                            });
                        }));
                    });
                }
            };
        } ], ngSwitchWhenDirective = ngDirective({
            transclude: "element",
            priority: 800,
            require: "^ngSwitch",
            link: function(scope, element, attrs, ctrl, $transclude) {
                ctrl.cases["!" + attrs.ngSwitchWhen] = ctrl.cases["!" + attrs.ngSwitchWhen] || [], 
                ctrl.cases["!" + attrs.ngSwitchWhen].push({
                    transclude: $transclude,
                    element: element
                });
            }
        }), ngSwitchDefaultDirective = ngDirective({
            transclude: "element",
            priority: 800,
            require: "^ngSwitch",
            link: function(scope, element, attr, ctrl, $transclude) {
                ctrl.cases["?"] = ctrl.cases["?"] || [], ctrl.cases["?"].push({
                    transclude: $transclude,
                    element: element
                });
            }
        }), ngTranscludeDirective = ngDirective({
            controller: [ "$element", "$transclude", function($element, $transclude) {
                if (!$transclude) throw minErr("ngTransclude")("orphan", "Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found. Element: {0}", startingTag($element));
                this.$transclude = $transclude;
            } ],
            link: function($scope, $element, $attrs, controller) {
                controller.$transclude(function(clone) {
                    $element.empty(), $element.append(clone);
                });
            }
        }), scriptDirective = [ "$templateCache", function($templateCache) {
            return {
                restrict: "E",
                terminal: !0,
                compile: function(element, attr) {
                    if ("text/ng-template" == attr.type) {
                        var templateUrl = attr.id, text = element[0].text;
                        $templateCache.put(templateUrl, text);
                    }
                }
            };
        } ], ngOptionsMinErr = minErr("ngOptions"), ngOptionsDirective = valueFn({
            terminal: !0
        }), selectDirective = [ "$compile", "$parse", function($compile, $parse) {
            var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/, nullModelCtrl = {
                $setViewValue: noop
            };
            return {
                restrict: "E",
                require: [ "select", "?ngModel" ],
                controller: [ "$element", "$scope", "$attrs", function($element, $scope, $attrs) {
                    var nullOption, unknownOption, self = this, optionsMap = {}, ngModelCtrl = nullModelCtrl;
                    self.databound = $attrs.ngModel, self.init = function(ngModelCtrl_, nullOption_, unknownOption_) {
                        ngModelCtrl = ngModelCtrl_, nullOption = nullOption_, unknownOption = unknownOption_;
                    }, self.addOption = function(value) {
                        assertNotHasOwnProperty(value, '"option value"'), optionsMap[value] = !0, ngModelCtrl.$viewValue == value && ($element.val(value), 
                        unknownOption.parent() && unknownOption.remove());
                    }, self.removeOption = function(value) {
                        this.hasOption(value) && (delete optionsMap[value], ngModelCtrl.$viewValue == value && this.renderUnknownOption(value));
                    }, self.renderUnknownOption = function(val) {
                        var unknownVal = "? " + hashKey(val) + " ?";
                        unknownOption.val(unknownVal), $element.prepend(unknownOption), $element.val(unknownVal), 
                        unknownOption.prop("selected", !0);
                    }, self.hasOption = function(value) {
                        return optionsMap.hasOwnProperty(value);
                    }, $scope.$on("$destroy", function() {
                        self.renderUnknownOption = noop;
                    });
                } ],
                link: function(scope, element, attr, ctrls) {
                    function setupAsSingle(scope, selectElement, ngModelCtrl, selectCtrl) {
                        ngModelCtrl.$render = function() {
                            var viewValue = ngModelCtrl.$viewValue;
                            selectCtrl.hasOption(viewValue) ? (unknownOption.parent() && unknownOption.remove(), 
                            selectElement.val(viewValue), "" === viewValue && emptyOption.prop("selected", !0)) : isUndefined(viewValue) && emptyOption ? selectElement.val("") : selectCtrl.renderUnknownOption(viewValue);
                        }, selectElement.on("change", function() {
                            scope.$apply(function() {
                                unknownOption.parent() && unknownOption.remove(), ngModelCtrl.$setViewValue(selectElement.val());
                            });
                        });
                    }
                    function setupAsMultiple(scope, selectElement, ctrl) {
                        var lastView;
                        ctrl.$render = function() {
                            var items = new HashMap(ctrl.$viewValue);
                            forEach(selectElement.find("option"), function(option) {
                                option.selected = isDefined(items.get(option.value));
                            });
                        }, scope.$watch(function() {
                            equals(lastView, ctrl.$viewValue) || (lastView = copy(ctrl.$viewValue), ctrl.$render());
                        }), selectElement.on("change", function() {
                            scope.$apply(function() {
                                var array = [];
                                forEach(selectElement.find("option"), function(option) {
                                    option.selected && array.push(option.value);
                                }), ctrl.$setViewValue(array);
                            });
                        });
                    }
                    function setupAsOptions(scope, selectElement, ctrl) {
                        function render() {
                            var optionGroupName, optionGroup, option, existingParent, existingOptions, existingOption, key, groupLength, length, groupIndex, index, selected, lastElement, element, label, optionGroups = {
                                "": []
                            }, optionGroupNames = [ "" ], modelValue = ctrl.$modelValue, values = valuesFn(scope) || [], keys = keyName ? sortedKeys(values) : values, locals = {}, selectedSet = !1;
                            if (multiple) if (trackFn && isArray(modelValue)) {
                                selectedSet = new HashMap([]);
                                for (var trackIndex = 0; trackIndex < modelValue.length; trackIndex++) locals[valueName] = modelValue[trackIndex], 
                                selectedSet.put(trackFn(scope, locals), modelValue[trackIndex]);
                            } else selectedSet = new HashMap(modelValue);
                            for (index = 0; length = keys.length, length > index; index++) {
                                if (key = index, keyName) {
                                    if (key = keys[index], "$" === key.charAt(0)) continue;
                                    locals[keyName] = key;
                                }
                                if (locals[valueName] = values[key], optionGroupName = groupByFn(scope, locals) || "", 
                                (optionGroup = optionGroups[optionGroupName]) || (optionGroup = optionGroups[optionGroupName] = [], 
                                optionGroupNames.push(optionGroupName)), multiple) selected = isDefined(selectedSet.remove(trackFn ? trackFn(scope, locals) : valueFn(scope, locals))); else {
                                    if (trackFn) {
                                        var modelCast = {};
                                        modelCast[valueName] = modelValue, selected = trackFn(scope, modelCast) === trackFn(scope, locals);
                                    } else selected = modelValue === valueFn(scope, locals);
                                    selectedSet = selectedSet || selected;
                                }
                                label = displayFn(scope, locals), label = isDefined(label) ? label : "", optionGroup.push({
                                    id: trackFn ? trackFn(scope, locals) : keyName ? keys[index] : index,
                                    label: label,
                                    selected: selected
                                });
                            }
                            for (multiple || (nullOption || null === modelValue ? optionGroups[""].unshift({
                                id: "",
                                label: "",
                                selected: !selectedSet
                            }) : selectedSet || optionGroups[""].unshift({
                                id: "?",
                                label: "",
                                selected: !0
                            })), groupIndex = 0, groupLength = optionGroupNames.length; groupLength > groupIndex; groupIndex++) {
                                for (optionGroupName = optionGroupNames[groupIndex], optionGroup = optionGroups[optionGroupName], 
                                optionGroupsCache.length <= groupIndex ? (existingParent = {
                                    element: optGroupTemplate.clone().attr("label", optionGroupName),
                                    label: optionGroup.label
                                }, existingOptions = [ existingParent ], optionGroupsCache.push(existingOptions), 
                                selectElement.append(existingParent.element)) : (existingOptions = optionGroupsCache[groupIndex], 
                                existingParent = existingOptions[0], existingParent.label != optionGroupName && existingParent.element.attr("label", existingParent.label = optionGroupName)), 
                                lastElement = null, index = 0, length = optionGroup.length; length > index; index++) option = optionGroup[index], 
                                (existingOption = existingOptions[index + 1]) ? (lastElement = existingOption.element, 
                                existingOption.label !== option.label && lastElement.text(existingOption.label = option.label), 
                                existingOption.id !== option.id && lastElement.val(existingOption.id = option.id), 
                                lastElement[0].selected !== option.selected && lastElement.prop("selected", existingOption.selected = option.selected)) : ("" === option.id && nullOption ? element = nullOption : (element = optionTemplate.clone()).val(option.id).attr("selected", option.selected).text(option.label), 
                                existingOptions.push(existingOption = {
                                    element: element,
                                    label: option.label,
                                    id: option.id,
                                    selected: option.selected
                                }), lastElement ? lastElement.after(element) : existingParent.element.append(element), 
                                lastElement = element);
                                for (index++; existingOptions.length > index; ) existingOptions.pop().element.remove();
                            }
                            for (;optionGroupsCache.length > groupIndex; ) optionGroupsCache.pop()[0].element.remove();
                        }
                        var match;
                        if (!(match = optionsExp.match(NG_OPTIONS_REGEXP))) throw ngOptionsMinErr("iexp", "Expected expression in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_' but got '{0}'. Element: {1}", optionsExp, startingTag(selectElement));
                        var displayFn = $parse(match[2] || match[1]), valueName = match[4] || match[6], keyName = match[5], groupByFn = $parse(match[3] || ""), valueFn = $parse(match[2] ? match[1] : valueName), valuesFn = $parse(match[7]), track = match[8], trackFn = track ? $parse(match[8]) : null, optionGroupsCache = [ [ {
                            element: selectElement,
                            label: ""
                        } ] ];
                        nullOption && ($compile(nullOption)(scope), nullOption.removeClass("ng-scope"), 
                        nullOption.remove()), selectElement.empty(), selectElement.on("change", function() {
                            scope.$apply(function() {
                                var optionGroup, key, value, optionElement, index, groupIndex, length, groupLength, trackIndex, collection = valuesFn(scope) || [], locals = {};
                                if (multiple) {
                                    for (value = [], groupIndex = 0, groupLength = optionGroupsCache.length; groupLength > groupIndex; groupIndex++) for (optionGroup = optionGroupsCache[groupIndex], 
                                    index = 1, length = optionGroup.length; length > index; index++) if ((optionElement = optionGroup[index].element)[0].selected) {
                                        if (key = optionElement.val(), keyName && (locals[keyName] = key), trackFn) for (trackIndex = 0; trackIndex < collection.length && (locals[valueName] = collection[trackIndex], 
                                        trackFn(scope, locals) != key); trackIndex++) ; else locals[valueName] = collection[key];
                                        value.push(valueFn(scope, locals));
                                    }
                                } else if (key = selectElement.val(), "?" == key) value = undefined; else if ("" === key) value = null; else if (trackFn) {
                                    for (trackIndex = 0; trackIndex < collection.length; trackIndex++) if (locals[valueName] = collection[trackIndex], 
                                    trackFn(scope, locals) == key) {
                                        value = valueFn(scope, locals);
                                        break;
                                    }
                                } else locals[valueName] = collection[key], keyName && (locals[keyName] = key), 
                                value = valueFn(scope, locals);
                                ctrl.$setViewValue(value);
                            });
                        }), ctrl.$render = render, scope.$watch(render);
                    }
                    if (ctrls[1]) {
                        for (var emptyOption, selectCtrl = ctrls[0], ngModelCtrl = ctrls[1], multiple = attr.multiple, optionsExp = attr.ngOptions, nullOption = !1, optionTemplate = jqLite(document.createElement("option")), optGroupTemplate = jqLite(document.createElement("optgroup")), unknownOption = optionTemplate.clone(), i = 0, children = element.children(), ii = children.length; ii > i; i++) if ("" === children[i].value) {
                            emptyOption = nullOption = children.eq(i);
                            break;
                        }
                        selectCtrl.init(ngModelCtrl, nullOption, unknownOption), multiple && (ngModelCtrl.$isEmpty = function(value) {
                            return !value || 0 === value.length;
                        }), optionsExp ? setupAsOptions(scope, element, ngModelCtrl) : multiple ? setupAsMultiple(scope, element, ngModelCtrl) : setupAsSingle(scope, element, ngModelCtrl, selectCtrl);
                    }
                }
            };
        } ], optionDirective = [ "$interpolate", function($interpolate) {
            var nullSelectCtrl = {
                addOption: noop,
                removeOption: noop
            };
            return {
                restrict: "E",
                priority: 100,
                compile: function(element, attr) {
                    if (isUndefined(attr.value)) {
                        var interpolateFn = $interpolate(element.text(), !0);
                        interpolateFn || attr.$set("value", element.text());
                    }
                    return function(scope, element, attr) {
                        var selectCtrlName = "$selectController", parent = element.parent(), selectCtrl = parent.data(selectCtrlName) || parent.parent().data(selectCtrlName);
                        selectCtrl && selectCtrl.databound ? element.prop("selected", !1) : selectCtrl = nullSelectCtrl, 
                        interpolateFn ? scope.$watch(interpolateFn, function(newVal, oldVal) {
                            attr.$set("value", newVal), newVal !== oldVal && selectCtrl.removeOption(oldVal), 
                            selectCtrl.addOption(newVal);
                        }) : selectCtrl.addOption(attr.value), element.on("$destroy", function() {
                            selectCtrl.removeOption(attr.value);
                        });
                    };
                }
            };
        } ], styleDirective = valueFn({
            restrict: "E",
            terminal: !0
        });
        bindJQuery(), publishExternalAPI(angular), jqLite(document).ready(function() {
            angularInit(document, bootstrap);
        });
    }(window, document), !angular.$$csp() && angular.element(document).find("head").prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide{display:none !important;}ng\\:form{display:block;}</style>'), 
    define("angular", [ "jquery" ], function(global) {
        return function() {
            var ret;
            return ret || global.angular;
        };
    }(this)), function() {
        "use strict";
        define("RouteConfig", [], function() {
            var RouteConfig = function($routeProvider) {
                $routeProvider.when("/", {
                    templateUrl: "views/root.html",
                    menuId: "cluster",
                    controller: "RootController",
                    resolve: {
                        Resolver: "ClusterResolver"
                    }
                }).when("/osd", {
                    templateUrl: "views/osd.html",
                    menuId: "osd",
                    controller: "OSDController",
                    resolve: {
                        Resolver: "ClusterResolver"
                    }
                }).when("/osd/server/:fqdn", {
                    templateUrl: "views/osd-host.html",
                    menuId: "osd",
                    controller: "OSDHostController",
                    resolve: {
                        Resolver: "ClusterResolver"
                    }
                }).when("/pool", {
                    templateUrl: "views/pool.html",
                    menuId: "pool",
                    controller: "PoolController",
                    resolve: {
                        Resolver: "ClusterResolver"
                    }
                }).when("/tools", {
                    templateUrl: "views/tool.html",
                    menuId: "tools",
                    controller: "ToolController",
                    resolve: {
                        Resolver: "ClusterResolver"
                    }
                }).when("/pool/new", {
                    templateUrl: "views/pool-new.html",
                    menuId: "pool",
                    controller: "PoolNewController",
                    resolve: {
                        Resolver: "ClusterResolver"
                    }
                }).when("/first", {
                    templateUrl: "views/first.html",
                    menuId: "cluster",
                    controller: "FirstTimeController"
                }).when("/pool/modify/:id", {
                    templateUrl: "views/pool-modify.html",
                    menuId: "pool",
                    controller: "PoolModifyController",
                    resolve: {
                        Resolver: "ClusterResolver"
                    }
                }).when("/config", {
                    templateUrl: "views/osd-config.html",
                    menuId: "cluster",
                    controller: "OSDConfigController",
                    resolve: {
                        Resolver: "ClusterResolver"
                    }
                }).otherwise({
                    redirectTo: "/"
                });
            };
            return [ "$routeProvider", RouteConfig ];
        });
    }(), define("services/cluster-svc", [ "lodash" ], function(_) {
        "use strict";
        var ClusterService = function(Restangular, $location, ErrorService) {
            var djangoPaginationResponseExtractor = function(response) {
                if (void 0 !== response.count && void 0 !== response.results) {
                    var newResponse = response.results;
                    return newResponse.pagination = {
                        next: response.next,
                        previous: response.previous,
                        count: response.count
                    }, newResponse;
                }
                return response;
            }, restangular = Restangular.withConfig(function(RestangularConfigurer) {
                RestangularConfigurer.setBaseUrl("/api/v2").setResponseExtractor(djangoPaginationResponseExtractor).setErrorInterceptor(ErrorService.errorInterceptor);
            }), restangularFull = Restangular.withConfig(function(RestangularConfigurer) {
                RestangularConfigurer.setBaseUrl("/api/v2").setFullResponse(!0).setResponseExtractor(djangoPaginationResponseExtractor).setErrorInterceptor(ErrorService.errorInterceptor);
            }), Service = function() {
                this.restangular = restangular, this.restangularFull = restangularFull;
            };
            Service.prototype = _.extend(Service.prototype, {
                initialize: function() {
                    var self = this;
                    return this.getList().then(function(clusters) {
                        if (clusters.length) {
                            var cluster = _.first(clusters);
                            return self.clusterId = cluster.id, void (self.clusterModel = cluster);
                        }
                        self.clusterId = null, self.clusterModel = null, $location.path("/first");
                    });
                },
                getList: function() {
                    return this.restangular.all("cluster").getList().then(function(clusters) {
                        return clusters;
                    });
                },
                get: function(id) {
                    return this.cluster(id).get().then(function(cluster) {
                        return cluster;
                    });
                },
                cluster: function(id) {
                    return void 0 === id && (id = this.clusterId), this.restangular.one("cluster", id);
                },
                clusterFull: function(id) {
                    return void 0 === id && (id = this.clusterId), this.restangularFull.one("cluster", id);
                },
                base: function() {
                    return this.restangular;
                }
            });
            var service = new Service();
            return service;
        };
        return [ "Restangular", "$location", "ErrorService", ClusterService ];
    }), define("services/pool-svc", [ "lodash" ], function(_) {
        "use strict";
        var PoolService = function(ClusterService) {
            var Service = function() {
                this.restangular = ClusterService;
            };
            return Service.prototype = _.extend(Service.prototype, {
                getList: function() {
                    return this.restangular.cluster().all("pool").getList().then(function(pools) {
                        return pools;
                    });
                },
                get: function(id) {
                    return id = _.isString(id) ? parseInt(id, 10) : id, this.restangular.cluster().one("pool", id).get().then(function(pool) {
                        return pool;
                    });
                },
                remove: function(id) {
                    return id = _.isString(id) ? parseInt(id, 10) : id, this.restangular.clusterFull().one("pool", id).remove();
                },
                patch: function(id, update) {
                    return id = _.isString(id) ? parseInt(id, 10) : id, this.restangular.clusterFull().one("pool", id).patch(update);
                },
                create: function(pool) {
                    return this.restangular.clusterFull().all("pool").post(pool);
                },
                defaults: function() {
                    return this.restangular.cluster().one("pool").get({
                        defaults: ""
                    });
                }
            }), new Service();
        };
        return [ "ClusterService", PoolService ];
    }), define("services/server-svc", [ "lodash" ], function(_) {
        "use strict";
        var ServerService = function(ClusterService) {
            var Service = function() {
                this.restangular = ClusterService;
            };
            return Service.prototype = _.extend(Service.prototype, {
                getList: function() {
                    return this.restangular.cluster().all("server").getList().then(function(servers) {
                        return servers;
                    });
                },
                get: function(id) {
                    return this.restangular.cluster().one("server", id).get().then(function(server) {
                        return server;
                    });
                },
                getGrains: function(id) {
                    return this.restangular.base().one("server", id).one("grains").get().then(function(server) {
                        return server;
                    });
                }
            }), new Service();
        };
        return [ "ClusterService", ServerService ];
    }), define("services/key-svc", [ "lodash" ], function(_) {
        "use strict";
        var KeyService = function(Restangular, ErrorService) {
            var restangular = Restangular.withConfig(function(RestangularConfigurer) {
                RestangularConfigurer.setBaseUrl("/api/v2").setErrorInterceptor(ErrorService.errorInterceptor);
            }), restangularFull = Restangular.withConfig(function(RestangularConfigurer) {
                RestangularConfigurer.setBaseUrl("/api/v2").setFullResponse(!0).setErrorInterceptor(ErrorService.errorInterceptor);
            }), Service = function() {
                this.restangular = restangular, this.restangularFull = restangularFull;
            };
            return Service.prototype = _.extend(Service.prototype, {
                getList: function() {
                    return this.restangular.all("key").getList().then(function(keys) {
                        return keys;
                    });
                },
                get: function(id) {
                    return this.restangular.one("key", id).get().then(function(key) {
                        return key[0];
                    });
                },
                accept: function(ids) {
                    var accepted = _.map(ids, function(id) {
                        return {
                            id: id,
                            status: "accepted"
                        };
                    });
                    return this.restangularFull.all("key").patch(accepted);
                }
            }), new Service();
        };
        return [ "Restangular", "ErrorService", KeyService ];
    }), define("services/crush-svc", [ "lodash" ], function(_) {
        "use strict";
        var CrushService = function(ClusterService) {
            var Service = function() {
                this.restangular = ClusterService;
            };
            return Service.prototype = _.extend(Service.prototype, {
                getList: function() {
                    return this.restangular.cluster().all("crush_rule_set").getList().then(function(pools) {
                        return pools;
                    });
                },
                get: function(id) {
                    return this.restangular.cluster().one("crush_rule_set", id).get().then(function(pool) {
                        return pool[0];
                    });
                }
            }), new Service();
        };
        return [ "ClusterService", CrushService ];
    }), define("services/tool-svc", [ "lodash" ], function(_) {
        "use strict";
        var ToolService = function(ClusterService) {
            var Service = function() {
                this.restangular = ClusterService;
            };
            return Service.prototype = _.extend(Service.prototype, {
                log: function() {
                    return this.restangular.cluster().one("log").get().then(function(lines) {
                        return lines;
                    });
                },
                config: function(key) {
                    return key ? this.restangular.cluster().one("config").one(key).get().then(function(pair) {
                        return pair;
                    }) : this.restangular.cluster().all("config").getList().then(function(configs) {
                        return configs;
                    });
                }
            }), new Service();
        };
        return [ "ClusterService", ToolService ];
    }), define("services/request-svc", [ "lodash" ], function(_) {
        "use strict";
        var pageSize = 32, RequestService = function(ClusterService) {
            var Service = function() {
                this.restangular = ClusterService;
            };
            return Service.prototype = _.extend(Service.prototype, {
                getList: function() {
                    return this.restangular.cluster().customGETLIST("request", {
                        page_size: pageSize
                    }).then(function(requests) {
                        return requests;
                    });
                },
                get: function(id) {
                    return this.restangular.clusterFull().one("request", id).get().then(function(resp) {
                        return resp.data;
                    });
                },
                getComplete: function() {
                    return this.restangular.cluster().customGETLIST("request", {
                        state: "complete",
                        page_size: pageSize
                    });
                },
                getSubmitted: function() {
                    return this.restangular.cluster().customGETLIST("request", {
                        state: "submitted",
                        page_size: pageSize
                    });
                }
            }), new Service();
        };
        return [ "ClusterService", RequestService ];
    }), define("services/osd-svc", [ "lodash" ], function(_) {
        "use strict";
        var OSDService = function(ClusterService) {
            var Service = function() {
                this.restangular = ClusterService;
            };
            return Service.prototype = _.extend(Service.prototype, {
                getList: function() {
                    return this.restangular.cluster().getList("osd").then(function(osds) {
                        return osds;
                    });
                },
                getSet: function(ids) {
                    var idargs = _.reduce(ids, function(result, id) {
                        return result.push(id), result;
                    }, []);
                    return this.restangular.cluster().getList("osd", {
                        "id__in[]": idargs
                    }).then(function(osds) {
                        return osds;
                    });
                },
                get: function(id) {
                    return id = _.isString(id) ? parseInt(id, 10) : id, this.restangular.cluster().one("osd", id).get().then(function(osd) {
                        return osd;
                    });
                },
                patch: function(id, update) {
                    return id = _.isString(id) ? parseInt(id, 10) : id, this.restangular.clusterFull().one("osd", id).patch(update);
                },
                down: function(id) {
                    return this.patch(id, {
                        up: !1
                    });
                },
                out: function(id) {
                    return this.patch(id, {
                        "in": !1
                    });
                },
                "in": function(id) {
                    return this.patch(id, {
                        "in": !0
                    });
                },
                scrub: function(id) {
                    return id = _.isString(id) ? parseInt(id, 10) : id, this.restangular.clusterFull().one("osd", id).all("command").all("scrub").post({});
                },
                deep_scrub: function(id) {
                    return id = _.isString(id) ? parseInt(id, 10) : id, this.restangular.clusterFull().one("osd", id).all("command").all("deep_scrub").post({});
                },
                repair: function(id) {
                    return id = _.isString(id) ? parseInt(id, 10) : id, this.restangular.clusterFull().one("osd", id).all("command").all("repair").post({});
                }
            }), new Service();
        };
        return [ "ClusterService", OSDService ];
    }), define("services/osd-config-svc", [ "lodash" ], function(_) {
        "use strict";
        var OSDService = function(ClusterService) {
            var Service = function() {
                this.restangular = ClusterService;
            };
            return Service.prototype = _.extend(Service.prototype, {
                get: function() {
                    return this.restangular.cluster().one("osd_config").get().then(function(config) {
                        return config;
                    });
                },
                patch: function(config) {
                    return this.restangular.clusterFull().one("osd_config").patch(config);
                }
            }), new Service();
        };
        return [ "ClusterService", OSDService ];
    }), define("services/user-svc", [ "lodash" ], function(_) {
        "use strict";
        var UserService = function(Restangular, ErrorService) {
            var Service = function() {
                this.restangular = Restangular.withConfig(function(RestangularConfigurer) {
                    RestangularConfigurer.setBaseUrl("/api/v2").setErrorInterceptor(ErrorService.errorInterceptor);
                }), this.restv1 = Restangular.withConfig(function(RestangularConfigurer) {
                    RestangularConfigurer.setBaseUrl("/api/v1").setErrorInterceptor(ErrorService.errorInterceptor);
                });
            };
            return Service.prototype = _.extend(Service.prototype, {
                get: function(id) {
                    return this.restangular.one("user", id).get().then(function(lines) {
                        return lines;
                    });
                },
                me: function() {
                    return this.get("me");
                },
                logout: function() {
                    return this.restv1.one("auth").one("logout").get();
                }
            }), new Service();
        };
        return [ "Restangular", "ErrorService", UserService ];
    }), function() {
        "use strict";
        define("ApiModule", [ "angular", "services/cluster-svc", "services/pool-svc", "services/server-svc", "services/key-svc", "services/crush-svc", "services/tool-svc", "services/request-svc", "services/osd-svc", "services/osd-config-svc", "services/user-svc" ], function(angular, ClusterService, PoolService, ServerService, KeyService, CrushService, ToolService, RequestService, OSDService, OSDConfigService, UserService) {
            var moduleName = "myAPIModule";
            return angular.module(moduleName, [ "restangular" ]).factory("ClusterService", ClusterService).factory("PoolService", PoolService).factory("ServerService", ServerService).factory("KeyService", KeyService).factory("CrushService", CrushService).factory("ToolService", ToolService).factory("RequestService", RequestService).factory("OSDService", OSDService).factory("OSDConfigService", OSDConfigService).factory("UserService", UserService).factory("ClusterResolver", [ "ClusterService", function(service) {
                return service.initialize();
            } ]), moduleName;
        });
    }(), function(undefined) {
        function defaultParsingFlags() {
            return {
                empty: !1,
                unusedTokens: [],
                unusedInput: [],
                overflow: -2,
                charsLeftOver: 0,
                nullInput: !1,
                invalidMonth: null,
                invalidFormat: !1,
                userInvalidated: !1,
                iso: !1
            };
        }
        function padToken(func, count) {
            return function(a) {
                return leftZeroFill(func.call(this, a), count);
            };
        }
        function ordinalizeToken(func, period) {
            return function(a) {
                return this.lang().ordinal(func.call(this, a), period);
            };
        }
        function Language() {}
        function Moment(config) {
            checkOverflow(config), extend(this, config);
        }
        function Duration(duration) {
            var normalizedInput = normalizeObjectUnits(duration), years = normalizedInput.year || 0, months = normalizedInput.month || 0, weeks = normalizedInput.week || 0, days = normalizedInput.day || 0, hours = normalizedInput.hour || 0, minutes = normalizedInput.minute || 0, seconds = normalizedInput.second || 0, milliseconds = normalizedInput.millisecond || 0;
            this._milliseconds = +milliseconds + 1e3 * seconds + 6e4 * minutes + 36e5 * hours, 
            this._days = +days + 7 * weeks, this._months = +months + 12 * years, this._data = {}, 
            this._bubble();
        }
        function extend(a, b) {
            for (var i in b) b.hasOwnProperty(i) && (a[i] = b[i]);
            return b.hasOwnProperty("toString") && (a.toString = b.toString), b.hasOwnProperty("valueOf") && (a.valueOf = b.valueOf), 
            a;
        }
        function cloneMoment(m) {
            var i, result = {};
            for (i in m) m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i) && (result[i] = m[i]);
            return result;
        }
        function absRound(number) {
            return 0 > number ? Math.ceil(number) : Math.floor(number);
        }
        function leftZeroFill(number, targetLength, forceSign) {
            for (var output = "" + Math.abs(number), sign = number >= 0; output.length < targetLength; ) output = "0" + output;
            return (sign ? forceSign ? "+" : "" : "-") + output;
        }
        function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {
            var minutes, hours, milliseconds = duration._milliseconds, days = duration._days, months = duration._months;
            milliseconds && mom._d.setTime(+mom._d + milliseconds * isAdding), (days || months) && (minutes = mom.minute(), 
            hours = mom.hour()), days && mom.date(mom.date() + days * isAdding), months && mom.month(mom.month() + months * isAdding), 
            milliseconds && !ignoreUpdateOffset && moment.updateOffset(mom), (days || months) && (mom.minute(minutes), 
            mom.hour(hours));
        }
        function isArray(input) {
            return "[object Array]" === Object.prototype.toString.call(input);
        }
        function isDate(input) {
            return "[object Date]" === Object.prototype.toString.call(input) || input instanceof Date;
        }
        function compareArrays(array1, array2, dontConvert) {
            var i, len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0;
            for (i = 0; len > i; i++) (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) && diffs++;
            return diffs + lengthDiff;
        }
        function normalizeUnits(units) {
            if (units) {
                var lowered = units.toLowerCase().replace(/(.)s$/, "$1");
                units = unitAliases[units] || camelFunctions[lowered] || lowered;
            }
            return units;
        }
        function normalizeObjectUnits(inputObject) {
            var normalizedProp, prop, normalizedInput = {};
            for (prop in inputObject) inputObject.hasOwnProperty(prop) && (normalizedProp = normalizeUnits(prop), 
            normalizedProp && (normalizedInput[normalizedProp] = inputObject[prop]));
            return normalizedInput;
        }
        function makeList(field) {
            var count, setter;
            if (0 === field.indexOf("week")) count = 7, setter = "day"; else {
                if (0 !== field.indexOf("month")) return;
                count = 12, setter = "month";
            }
            moment[field] = function(format, index) {
                var i, getter, method = moment.fn._lang[field], results = [];
                if ("number" == typeof format && (index = format, format = undefined), getter = function(i) {
                    var m = moment().utc().set(setter, i);
                    return method.call(moment.fn._lang, m, format || "");
                }, null != index) return getter(index);
                for (i = 0; count > i; i++) results.push(getter(i));
                return results;
            };
        }
        function toInt(argumentForCoercion) {
            var coercedNumber = +argumentForCoercion, value = 0;
            return 0 !== coercedNumber && isFinite(coercedNumber) && (value = coercedNumber >= 0 ? Math.floor(coercedNumber) : Math.ceil(coercedNumber)), 
            value;
        }
        function daysInMonth(year, month) {
            return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        }
        function daysInYear(year) {
            return isLeapYear(year) ? 366 : 365;
        }
        function isLeapYear(year) {
            return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
        }
        function checkOverflow(m) {
            var overflow;
            m._a && -2 === m._pf.overflow && (overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1, 
            m._pf._overflowDayOfYear && (YEAR > overflow || overflow > DATE) && (overflow = DATE), 
            m._pf.overflow = overflow);
        }
        function isValid(m) {
            return null == m._isValid && (m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated, 
            m._strict && (m._isValid = m._isValid && 0 === m._pf.charsLeftOver && 0 === m._pf.unusedTokens.length)), 
            m._isValid;
        }
        function normalizeLanguage(key) {
            return key ? key.toLowerCase().replace("_", "-") : key;
        }
        function makeAs(input, model) {
            return model._isUTC ? moment(input).zone(model._offset || 0) : moment(input).local();
        }
        function loadLang(key, values) {
            return values.abbr = key, languages[key] || (languages[key] = new Language()), languages[key].set(values), 
            languages[key];
        }
        function unloadLang(key) {
            delete languages[key];
        }
        function getLangDefinition(key) {
            var j, lang, next, split, i = 0, get = function(k) {
                if (!languages[k] && hasModule) try {
                    require("./lang/" + k);
                } catch (e) {}
                return languages[k];
            };
            if (!key) return moment.fn._lang;
            if (!isArray(key)) {
                if (lang = get(key)) return lang;
                key = [ key ];
            }
            for (;i < key.length; ) {
                for (split = normalizeLanguage(key[i]).split("-"), j = split.length, next = normalizeLanguage(key[i + 1]), 
                next = next ? next.split("-") : null; j > 0; ) {
                    if (lang = get(split.slice(0, j).join("-"))) return lang;
                    if (next && next.length >= j && compareArrays(split, next, !0) >= j - 1) break;
                    j--;
                }
                i++;
            }
            return moment.fn._lang;
        }
        function removeFormattingTokens(input) {
            return input.match(/\[[\s\S]/) ? input.replace(/^\[|\]$/g, "") : input.replace(/\\/g, "");
        }
        function makeFormatFunction(format) {
            var i, length, array = format.match(formattingTokens);
            for (i = 0, length = array.length; length > i; i++) formatTokenFunctions[array[i]] ? array[i] = formatTokenFunctions[array[i]] : array[i] = removeFormattingTokens(array[i]);
            return function(mom) {
                var output = "";
                for (i = 0; length > i; i++) output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
                return output;
            };
        }
        function formatMoment(m, format) {
            return m.isValid() ? (format = expandFormat(format, m.lang()), formatFunctions[format] || (formatFunctions[format] = makeFormatFunction(format)), 
            formatFunctions[format](m)) : m.lang().invalidDate();
        }
        function expandFormat(format, lang) {
            function replaceLongDateFormatTokens(input) {
                return lang.longDateFormat(input) || input;
            }
            var i = 5;
            for (localFormattingTokens.lastIndex = 0; i >= 0 && localFormattingTokens.test(format); ) format = format.replace(localFormattingTokens, replaceLongDateFormatTokens), 
            localFormattingTokens.lastIndex = 0, i -= 1;
            return format;
        }
        function getParseRegexForToken(token, config) {
            var a, strict = config._strict;
            switch (token) {
              case "DDDD":
                return parseTokenThreeDigits;

              case "YYYY":
              case "GGGG":
              case "gggg":
                return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;

              case "Y":
              case "G":
              case "g":
                return parseTokenSignedNumber;

              case "YYYYYY":
              case "YYYYY":
              case "GGGGG":
              case "ggggg":
                return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;

              case "S":
                if (strict) return parseTokenOneDigit;

              case "SS":
                if (strict) return parseTokenTwoDigits;

              case "SSS":
                if (strict) return parseTokenThreeDigits;

              case "DDD":
                return parseTokenOneToThreeDigits;

              case "MMM":
              case "MMMM":
              case "dd":
              case "ddd":
              case "dddd":
                return parseTokenWord;

              case "a":
              case "A":
                return getLangDefinition(config._l)._meridiemParse;

              case "X":
                return parseTokenTimestampMs;

              case "Z":
              case "ZZ":
                return parseTokenTimezone;

              case "T":
                return parseTokenT;

              case "SSSS":
                return parseTokenDigits;

              case "MM":
              case "DD":
              case "YY":
              case "GG":
              case "gg":
              case "HH":
              case "hh":
              case "mm":
              case "ss":
              case "ww":
              case "WW":
                return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;

              case "M":
              case "D":
              case "d":
              case "H":
              case "h":
              case "m":
              case "s":
              case "w":
              case "W":
              case "e":
              case "E":
                return parseTokenOneOrTwoDigits;

              default:
                return a = new RegExp(regexpEscape(unescapeFormat(token.replace("\\", "")), "i"));
            }
        }
        function timezoneMinutesFromString(string) {
            string = string || "";
            var possibleTzMatches = string.match(parseTokenTimezone) || [], tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [], parts = (tzChunk + "").match(parseTimezoneChunker) || [ "-", 0, 0 ], minutes = +(60 * parts[1]) + toInt(parts[2]);
            return "+" === parts[0] ? -minutes : minutes;
        }
        function addTimeToArrayFromToken(token, input, config) {
            var a, datePartArray = config._a;
            switch (token) {
              case "M":
              case "MM":
                null != input && (datePartArray[MONTH] = toInt(input) - 1);
                break;

              case "MMM":
              case "MMMM":
                a = getLangDefinition(config._l).monthsParse(input), null != a ? datePartArray[MONTH] = a : config._pf.invalidMonth = input;
                break;

              case "D":
              case "DD":
                null != input && (datePartArray[DATE] = toInt(input));
                break;

              case "DDD":
              case "DDDD":
                null != input && (config._dayOfYear = toInt(input));
                break;

              case "YY":
                datePartArray[YEAR] = toInt(input) + (toInt(input) > 68 ? 1900 : 2e3);
                break;

              case "YYYY":
              case "YYYYY":
              case "YYYYYY":
                datePartArray[YEAR] = toInt(input);
                break;

              case "a":
              case "A":
                config._isPm = getLangDefinition(config._l).isPM(input);
                break;

              case "H":
              case "HH":
              case "h":
              case "hh":
                datePartArray[HOUR] = toInt(input);
                break;

              case "m":
              case "mm":
                datePartArray[MINUTE] = toInt(input);
                break;

              case "s":
              case "ss":
                datePartArray[SECOND] = toInt(input);
                break;

              case "S":
              case "SS":
              case "SSS":
              case "SSSS":
                datePartArray[MILLISECOND] = toInt(1e3 * ("0." + input));
                break;

              case "X":
                config._d = new Date(1e3 * parseFloat(input));
                break;

              case "Z":
              case "ZZ":
                config._useUTC = !0, config._tzm = timezoneMinutesFromString(input);
                break;

              case "w":
              case "ww":
              case "W":
              case "WW":
              case "d":
              case "dd":
              case "ddd":
              case "dddd":
              case "e":
              case "E":
                token = token.substr(0, 1);

              case "gg":
              case "gggg":
              case "GG":
              case "GGGG":
              case "GGGGG":
                token = token.substr(0, 2), input && (config._w = config._w || {}, config._w[token] = input);
            }
        }
        function dateFromConfig(config) {
            var i, date, currentDate, yearToUse, fixYear, w, temp, lang, weekday, week, input = [];
            if (!config._d) {
                for (currentDate = currentDateArray(config), config._w && null == config._a[DATE] && null == config._a[MONTH] && (fixYear = function(val) {
                    var int_val = parseInt(val, 10);
                    return val ? val.length < 3 ? int_val > 68 ? 1900 + int_val : 2e3 + int_val : int_val : null == config._a[YEAR] ? moment().weekYear() : config._a[YEAR];
                }, w = config._w, null != w.GG || null != w.W || null != w.E ? temp = dayOfYearFromWeeks(fixYear(w.GG), w.W || 1, w.E, 4, 1) : (lang = getLangDefinition(config._l), 
                weekday = null != w.d ? parseWeekday(w.d, lang) : null != w.e ? parseInt(w.e, 10) + lang._week.dow : 0, 
                week = parseInt(w.w, 10) || 1, null != w.d && weekday < lang._week.dow && week++, 
                temp = dayOfYearFromWeeks(fixYear(w.gg), week, weekday, lang._week.doy, lang._week.dow)), 
                config._a[YEAR] = temp.year, config._dayOfYear = temp.dayOfYear), config._dayOfYear && (yearToUse = null == config._a[YEAR] ? currentDate[YEAR] : config._a[YEAR], 
                config._dayOfYear > daysInYear(yearToUse) && (config._pf._overflowDayOfYear = !0), 
                date = makeUTCDate(yearToUse, 0, config._dayOfYear), config._a[MONTH] = date.getUTCMonth(), 
                config._a[DATE] = date.getUTCDate()), i = 0; 3 > i && null == config._a[i]; ++i) config._a[i] = input[i] = currentDate[i];
                for (;7 > i; i++) config._a[i] = input[i] = null == config._a[i] ? 2 === i ? 1 : 0 : config._a[i];
                input[HOUR] += toInt((config._tzm || 0) / 60), input[MINUTE] += toInt((config._tzm || 0) % 60), 
                config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
            }
        }
        function dateFromObject(config) {
            var normalizedInput;
            config._d || (normalizedInput = normalizeObjectUnits(config._i), config._a = [ normalizedInput.year, normalizedInput.month, normalizedInput.day, normalizedInput.hour, normalizedInput.minute, normalizedInput.second, normalizedInput.millisecond ], 
            dateFromConfig(config));
        }
        function currentDateArray(config) {
            var now = new Date();
            return config._useUTC ? [ now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() ] : [ now.getFullYear(), now.getMonth(), now.getDate() ];
        }
        function makeDateFromStringAndFormat(config) {
            config._a = [], config._pf.empty = !0;
            var i, parsedInput, tokens, token, skipped, lang = getLangDefinition(config._l), string = "" + config._i, stringLength = string.length, totalParsedInputLength = 0;
            for (tokens = expandFormat(config._f, lang).match(formattingTokens) || [], i = 0; i < tokens.length; i++) token = tokens[i], 
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0], parsedInput && (skipped = string.substr(0, string.indexOf(parsedInput)), 
            skipped.length > 0 && config._pf.unusedInput.push(skipped), string = string.slice(string.indexOf(parsedInput) + parsedInput.length), 
            totalParsedInputLength += parsedInput.length), formatTokenFunctions[token] ? (parsedInput ? config._pf.empty = !1 : config._pf.unusedTokens.push(token), 
            addTimeToArrayFromToken(token, parsedInput, config)) : config._strict && !parsedInput && config._pf.unusedTokens.push(token);
            config._pf.charsLeftOver = stringLength - totalParsedInputLength, string.length > 0 && config._pf.unusedInput.push(string), 
            config._isPm && config._a[HOUR] < 12 && (config._a[HOUR] += 12), config._isPm === !1 && 12 === config._a[HOUR] && (config._a[HOUR] = 0), 
            dateFromConfig(config), checkOverflow(config);
        }
        function unescapeFormat(s) {
            return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4) {
                return p1 || p2 || p3 || p4;
            });
        }
        function regexpEscape(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        }
        function makeDateFromStringAndArray(config) {
            var tempConfig, bestMoment, scoreToBeat, i, currentScore;
            if (0 === config._f.length) return config._pf.invalidFormat = !0, void (config._d = new Date(NaN));
            for (i = 0; i < config._f.length; i++) currentScore = 0, tempConfig = extend({}, config), 
            tempConfig._pf = defaultParsingFlags(), tempConfig._f = config._f[i], makeDateFromStringAndFormat(tempConfig), 
            isValid(tempConfig) && (currentScore += tempConfig._pf.charsLeftOver, currentScore += 10 * tempConfig._pf.unusedTokens.length, 
            tempConfig._pf.score = currentScore, (null == scoreToBeat || scoreToBeat > currentScore) && (scoreToBeat = currentScore, 
            bestMoment = tempConfig));
            extend(config, bestMoment || tempConfig);
        }
        function makeDateFromString(config) {
            var i, l, string = config._i, match = isoRegex.exec(string);
            if (match) {
                for (config._pf.iso = !0, i = 0, l = isoDates.length; l > i; i++) if (isoDates[i][1].exec(string)) {
                    config._f = isoDates[i][0] + (match[6] || " ");
                    break;
                }
                for (i = 0, l = isoTimes.length; l > i; i++) if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
                string.match(parseTokenTimezone) && (config._f += "Z"), makeDateFromStringAndFormat(config);
            } else config._d = new Date(string);
        }
        function makeDateFromInput(config) {
            var input = config._i, matched = aspNetJsonRegex.exec(input);
            input === undefined ? config._d = new Date() : matched ? config._d = new Date(+matched[1]) : "string" == typeof input ? makeDateFromString(config) : isArray(input) ? (config._a = input.slice(0), 
            dateFromConfig(config)) : isDate(input) ? config._d = new Date(+input) : "object" == typeof input ? dateFromObject(config) : config._d = new Date(input);
        }
        function makeDate(y, m, d, h, M, s, ms) {
            var date = new Date(y, m, d, h, M, s, ms);
            return 1970 > y && date.setFullYear(y), date;
        }
        function makeUTCDate(y) {
            var date = new Date(Date.UTC.apply(null, arguments));
            return 1970 > y && date.setUTCFullYear(y), date;
        }
        function parseWeekday(input, language) {
            if ("string" == typeof input) if (isNaN(input)) {
                if (input = language.weekdaysParse(input), "number" != typeof input) return null;
            } else input = parseInt(input, 10);
            return input;
        }
        function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
            return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
        }
        function relativeTime(milliseconds, withoutSuffix, lang) {
            var seconds = round(Math.abs(milliseconds) / 1e3), minutes = round(seconds / 60), hours = round(minutes / 60), days = round(hours / 24), years = round(days / 365), args = 45 > seconds && [ "s", seconds ] || 1 === minutes && [ "m" ] || 45 > minutes && [ "mm", minutes ] || 1 === hours && [ "h" ] || 22 > hours && [ "hh", hours ] || 1 === days && [ "d" ] || 25 >= days && [ "dd", days ] || 45 >= days && [ "M" ] || 345 > days && [ "MM", round(days / 30) ] || 1 === years && [ "y" ] || [ "yy", years ];
            return args[2] = withoutSuffix, args[3] = milliseconds > 0, args[4] = lang, substituteTimeAgo.apply({}, args);
        }
        function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
            var adjustedMoment, end = firstDayOfWeekOfYear - firstDayOfWeek, daysToDayOfWeek = firstDayOfWeekOfYear - mom.day();
            return daysToDayOfWeek > end && (daysToDayOfWeek -= 7), end - 7 > daysToDayOfWeek && (daysToDayOfWeek += 7), 
            adjustedMoment = moment(mom).add("d", daysToDayOfWeek), {
                week: Math.ceil(adjustedMoment.dayOfYear() / 7),
                year: adjustedMoment.year()
            };
        }
        function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
            var daysToAdd, dayOfYear, d = makeUTCDate(year, 0, 1).getUTCDay();
            return weekday = null != weekday ? weekday : firstDayOfWeek, daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (firstDayOfWeek > d ? 7 : 0), 
            dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1, {
                year: dayOfYear > 0 ? year : year - 1,
                dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
            };
        }
        function makeMoment(config) {
            var input = config._i, format = config._f;
            return null === input ? moment.invalid({
                nullInput: !0
            }) : ("string" == typeof input && (config._i = input = getLangDefinition().preparse(input)), 
            moment.isMoment(input) ? (config = cloneMoment(input), config._d = new Date(+input._d)) : format ? isArray(format) ? makeDateFromStringAndArray(config) : makeDateFromStringAndFormat(config) : makeDateFromInput(config), 
            new Moment(config));
        }
        function makeGetterAndSetter(name, key) {
            moment.fn[name] = moment.fn[name + "s"] = function(input) {
                var utc = this._isUTC ? "UTC" : "";
                return null != input ? (this._d["set" + utc + key](input), moment.updateOffset(this), 
                this) : this._d["get" + utc + key]();
            };
        }
        function makeDurationGetter(name) {
            moment.duration.fn[name] = function() {
                return this._data[name];
            };
        }
        function makeDurationAsGetter(name, factor) {
            moment.duration.fn["as" + name] = function() {
                return +this / factor;
            };
        }
        function makeGlobal(deprecate) {
            var warned = !1, local_moment = moment;
            "undefined" == typeof ender && (deprecate ? (global.moment = function() {
                return !warned && console && console.warn && (warned = !0, console.warn("Accessing Moment through the global scope is deprecated, and will be removed in an upcoming release.")), 
                local_moment.apply(null, arguments);
            }, extend(global.moment, local_moment)) : global.moment = moment);
        }
        for (var moment, i, VERSION = "2.5.1", global = this, round = Math.round, YEAR = 0, MONTH = 1, DATE = 2, HOUR = 3, MINUTE = 4, SECOND = 5, MILLISECOND = 6, languages = {}, momentProperties = {
            _isAMomentObject: null,
            _i: null,
            _f: null,
            _l: null,
            _strict: null,
            _isUTC: null,
            _offset: null,
            _pf: null,
            _lang: null
        }, hasModule = "undefined" != typeof module && module.exports && "undefined" != typeof require, aspNetJsonRegex = /^\/?Date\((\-?\d+)/i, aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/, isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/, formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, parseTokenOneOrTwoDigits = /\d\d?/, parseTokenOneToThreeDigits = /\d{1,3}/, parseTokenOneToFourDigits = /\d{1,4}/, parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, parseTokenDigits = /\d+/, parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, parseTokenT = /T/i, parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, parseTokenOneDigit = /\d/, parseTokenTwoDigits = /\d\d/, parseTokenThreeDigits = /\d{3}/, parseTokenFourDigits = /\d{4}/, parseTokenSixDigits = /[+-]?\d{6}/, parseTokenSignedNumber = /[+-]?\d+/, isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, isoFormat = "YYYY-MM-DDTHH:mm:ssZ", isoDates = [ [ "YYYYYY-MM-DD", /[+-]\d{6}-\d{2}-\d{2}/ ], [ "YYYY-MM-DD", /\d{4}-\d{2}-\d{2}/ ], [ "GGGG-[W]WW-E", /\d{4}-W\d{2}-\d/ ], [ "GGGG-[W]WW", /\d{4}-W\d{2}/ ], [ "YYYY-DDD", /\d{4}-\d{3}/ ] ], isoTimes = [ [ "HH:mm:ss.SSSS", /(T| )\d\d:\d\d:\d\d\.\d{1,3}/ ], [ "HH:mm:ss", /(T| )\d\d:\d\d:\d\d/ ], [ "HH:mm", /(T| )\d\d:\d\d/ ], [ "HH", /(T| )\d\d/ ] ], parseTimezoneChunker = /([\+\-]|\d\d)/gi, proxyGettersAndSetters = "Date|Hours|Minutes|Seconds|Milliseconds".split("|"), unitMillisecondFactors = {
            Milliseconds: 1,
            Seconds: 1e3,
            Minutes: 6e4,
            Hours: 36e5,
            Days: 864e5,
            Months: 2592e6,
            Years: 31536e6
        }, unitAliases = {
            ms: "millisecond",
            s: "second",
            m: "minute",
            h: "hour",
            d: "day",
            D: "date",
            w: "week",
            W: "isoWeek",
            M: "month",
            y: "year",
            DDD: "dayOfYear",
            e: "weekday",
            E: "isoWeekday",
            gg: "weekYear",
            GG: "isoWeekYear"
        }, camelFunctions = {
            dayofyear: "dayOfYear",
            isoweekday: "isoWeekday",
            isoweek: "isoWeek",
            weekyear: "weekYear",
            isoweekyear: "isoWeekYear"
        }, formatFunctions = {}, ordinalizeTokens = "DDD w W M D d".split(" "), paddedTokens = "M D H h m s w W".split(" "), formatTokenFunctions = {
            M: function() {
                return this.month() + 1;
            },
            MMM: function(format) {
                return this.lang().monthsShort(this, format);
            },
            MMMM: function(format) {
                return this.lang().months(this, format);
            },
            D: function() {
                return this.date();
            },
            DDD: function() {
                return this.dayOfYear();
            },
            d: function() {
                return this.day();
            },
            dd: function(format) {
                return this.lang().weekdaysMin(this, format);
            },
            ddd: function(format) {
                return this.lang().weekdaysShort(this, format);
            },
            dddd: function(format) {
                return this.lang().weekdays(this, format);
            },
            w: function() {
                return this.week();
            },
            W: function() {
                return this.isoWeek();
            },
            YY: function() {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY: function() {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY: function() {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY: function() {
                var y = this.year(), sign = y >= 0 ? "+" : "-";
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg: function() {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg: function() {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg: function() {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG: function() {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG: function() {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG: function() {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e: function() {
                return this.weekday();
            },
            E: function() {
                return this.isoWeekday();
            },
            a: function() {
                return this.lang().meridiem(this.hours(), this.minutes(), !0);
            },
            A: function() {
                return this.lang().meridiem(this.hours(), this.minutes(), !1);
            },
            H: function() {
                return this.hours();
            },
            h: function() {
                return this.hours() % 12 || 12;
            },
            m: function() {
                return this.minutes();
            },
            s: function() {
                return this.seconds();
            },
            S: function() {
                return toInt(this.milliseconds() / 100);
            },
            SS: function() {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS: function() {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS: function() {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z: function() {
                var a = -this.zone(), b = "+";
                return 0 > a && (a = -a, b = "-"), b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ: function() {
                var a = -this.zone(), b = "+";
                return 0 > a && (a = -a, b = "-"), b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z: function() {
                return this.zoneAbbr();
            },
            zz: function() {
                return this.zoneName();
            },
            X: function() {
                return this.unix();
            },
            Q: function() {
                return this.quarter();
            }
        }, lists = [ "months", "monthsShort", "weekdays", "weekdaysShort", "weekdaysMin" ]; ordinalizeTokens.length; ) i = ordinalizeTokens.pop(), 
        formatTokenFunctions[i + "o"] = ordinalizeToken(formatTokenFunctions[i], i);
        for (;paddedTokens.length; ) i = paddedTokens.pop(), formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
        for (formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3), extend(Language.prototype, {
            set: function(config) {
                var prop, i;
                for (i in config) prop = config[i], "function" == typeof prop ? this[i] = prop : this["_" + i] = prop;
            },
            _months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
            months: function(m) {
                return this._months[m.month()];
            },
            _monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
            monthsShort: function(m) {
                return this._monthsShort[m.month()];
            },
            monthsParse: function(monthName) {
                var i, mom, regex;
                for (this._monthsParse || (this._monthsParse = []), i = 0; 12 > i; i++) if (this._monthsParse[i] || (mom = moment.utc([ 2e3, i ]), 
                regex = "^" + this.months(mom, "") + "|^" + this.monthsShort(mom, ""), this._monthsParse[i] = new RegExp(regex.replace(".", ""), "i")), 
                this._monthsParse[i].test(monthName)) return i;
            },
            _weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
            weekdays: function(m) {
                return this._weekdays[m.day()];
            },
            _weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
            weekdaysShort: function(m) {
                return this._weekdaysShort[m.day()];
            },
            _weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
            weekdaysMin: function(m) {
                return this._weekdaysMin[m.day()];
            },
            weekdaysParse: function(weekdayName) {
                var i, mom, regex;
                for (this._weekdaysParse || (this._weekdaysParse = []), i = 0; 7 > i; i++) if (this._weekdaysParse[i] || (mom = moment([ 2e3, 1 ]).day(i), 
                regex = "^" + this.weekdays(mom, "") + "|^" + this.weekdaysShort(mom, "") + "|^" + this.weekdaysMin(mom, ""), 
                this._weekdaysParse[i] = new RegExp(regex.replace(".", ""), "i")), this._weekdaysParse[i].test(weekdayName)) return i;
            },
            _longDateFormat: {
                LT: "h:mm A",
                L: "MM/DD/YYYY",
                LL: "MMMM D YYYY",
                LLL: "MMMM D YYYY LT",
                LLLL: "dddd, MMMM D YYYY LT"
            },
            longDateFormat: function(key) {
                var output = this._longDateFormat[key];
                return !output && this._longDateFormat[key.toUpperCase()] && (output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function(val) {
                    return val.slice(1);
                }), this._longDateFormat[key] = output), output;
            },
            isPM: function(input) {
                return "p" === (input + "").toLowerCase().charAt(0);
            },
            _meridiemParse: /[ap]\.?m?\.?/i,
            meridiem: function(hours, minutes, isLower) {
                return hours > 11 ? isLower ? "pm" : "PM" : isLower ? "am" : "AM";
            },
            _calendar: {
                sameDay: "[Today at] LT",
                nextDay: "[Tomorrow at] LT",
                nextWeek: "dddd [at] LT",
                lastDay: "[Yesterday at] LT",
                lastWeek: "[Last] dddd [at] LT",
                sameElse: "L"
            },
            calendar: function(key, mom) {
                var output = this._calendar[key];
                return "function" == typeof output ? output.apply(mom) : output;
            },
            _relativeTime: {
                future: "in %s",
                past: "%s ago",
                s: "a few seconds",
                m: "a minute",
                mm: "%d minutes",
                h: "an hour",
                hh: "%d hours",
                d: "a day",
                dd: "%d days",
                M: "a month",
                MM: "%d months",
                y: "a year",
                yy: "%d years"
            },
            relativeTime: function(number, withoutSuffix, string, isFuture) {
                var output = this._relativeTime[string];
                return "function" == typeof output ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
            },
            pastFuture: function(diff, output) {
                var format = this._relativeTime[diff > 0 ? "future" : "past"];
                return "function" == typeof format ? format(output) : format.replace(/%s/i, output);
            },
            ordinal: function(number) {
                return this._ordinal.replace("%d", number);
            },
            _ordinal: "%d",
            preparse: function(string) {
                return string;
            },
            postformat: function(string) {
                return string;
            },
            week: function(mom) {
                return weekOfYear(mom, this._week.dow, this._week.doy).week;
            },
            _week: {
                dow: 0,
                doy: 6
            },
            _invalidDate: "Invalid date",
            invalidDate: function() {
                return this._invalidDate;
            }
        }), moment = function(input, format, lang, strict) {
            var c;
            return "boolean" == typeof lang && (strict = lang, lang = undefined), c = {}, c._isAMomentObject = !0, 
            c._i = input, c._f = format, c._l = lang, c._strict = strict, c._isUTC = !1, c._pf = defaultParsingFlags(), 
            makeMoment(c);
        }, moment.utc = function(input, format, lang, strict) {
            var c;
            return "boolean" == typeof lang && (strict = lang, lang = undefined), c = {}, c._isAMomentObject = !0, 
            c._useUTC = !0, c._isUTC = !0, c._l = lang, c._i = input, c._f = format, c._strict = strict, 
            c._pf = defaultParsingFlags(), makeMoment(c).utc();
        }, moment.unix = function(input) {
            return moment(1e3 * input);
        }, moment.duration = function(input, key) {
            var sign, ret, parseIso, duration = input, match = null;
            return moment.isDuration(input) ? duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            } : "number" == typeof input ? (duration = {}, key ? duration[key] = input : duration.milliseconds = input) : (match = aspNetTimeSpanJsonRegex.exec(input)) ? (sign = "-" === match[1] ? -1 : 1, 
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            }) : (match = isoDurationRegex.exec(input)) && (sign = "-" === match[1] ? -1 : 1, 
            parseIso = function(inp) {
                var res = inp && parseFloat(inp.replace(",", "."));
                return (isNaN(res) ? 0 : res) * sign;
            }, duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            }), ret = new Duration(duration), moment.isDuration(input) && input.hasOwnProperty("_lang") && (ret._lang = input._lang), 
            ret;
        }, moment.version = VERSION, moment.defaultFormat = isoFormat, moment.updateOffset = function() {}, 
        moment.lang = function(key, values) {
            var r;
            return key ? (values ? loadLang(normalizeLanguage(key), values) : null === values ? (unloadLang(key), 
            key = "en") : languages[key] || getLangDefinition(key), r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key), 
            r._abbr) : moment.fn._lang._abbr;
        }, moment.langData = function(key) {
            return key && key._lang && key._lang._abbr && (key = key._lang._abbr), getLangDefinition(key);
        }, moment.isMoment = function(obj) {
            return obj instanceof Moment || null != obj && obj.hasOwnProperty("_isAMomentObject");
        }, moment.isDuration = function(obj) {
            return obj instanceof Duration;
        }, i = lists.length - 1; i >= 0; --i) makeList(lists[i]);
        for (moment.normalizeUnits = function(units) {
            return normalizeUnits(units);
        }, moment.invalid = function(flags) {
            var m = moment.utc(NaN);
            return null != flags ? extend(m._pf, flags) : m._pf.userInvalidated = !0, m;
        }, moment.parseZone = function(input) {
            return moment(input).parseZone();
        }, extend(moment.fn = Moment.prototype, {
            clone: function() {
                return moment(this);
            },
            valueOf: function() {
                return +this._d + 6e4 * (this._offset || 0);
            },
            unix: function() {
                return Math.floor(+this / 1e3);
            },
            toString: function() {
                return this.clone().lang("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
            },
            toDate: function() {
                return this._offset ? new Date(+this) : this._d;
            },
            toISOString: function() {
                var m = moment(this).utc();
                return 0 < m.year() && m.year() <= 9999 ? formatMoment(m, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : formatMoment(m, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
            },
            toArray: function() {
                var m = this;
                return [ m.year(), m.month(), m.date(), m.hours(), m.minutes(), m.seconds(), m.milliseconds() ];
            },
            isValid: function() {
                return isValid(this);
            },
            isDSTShifted: function() {
                return this._a ? this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0 : !1;
            },
            parsingFlags: function() {
                return extend({}, this._pf);
            },
            invalidAt: function() {
                return this._pf.overflow;
            },
            utc: function() {
                return this.zone(0);
            },
            local: function() {
                return this.zone(0), this._isUTC = !1, this;
            },
            format: function(inputString) {
                var output = formatMoment(this, inputString || moment.defaultFormat);
                return this.lang().postformat(output);
            },
            add: function(input, val) {
                var dur;
                return dur = "string" == typeof input ? moment.duration(+val, input) : moment.duration(input, val), 
                addOrSubtractDurationFromMoment(this, dur, 1), this;
            },
            subtract: function(input, val) {
                var dur;
                return dur = "string" == typeof input ? moment.duration(+val, input) : moment.duration(input, val), 
                addOrSubtractDurationFromMoment(this, dur, -1), this;
            },
            diff: function(input, units, asFloat) {
                var diff, output, that = makeAs(input, this), zoneDiff = 6e4 * (this.zone() - that.zone());
                return units = normalizeUnits(units), "year" === units || "month" === units ? (diff = 432e5 * (this.daysInMonth() + that.daysInMonth()), 
                output = 12 * (this.year() - that.year()) + (this.month() - that.month()), output += (this - moment(this).startOf("month") - (that - moment(that).startOf("month"))) / diff, 
                output -= 6e4 * (this.zone() - moment(this).startOf("month").zone() - (that.zone() - moment(that).startOf("month").zone())) / diff, 
                "year" === units && (output /= 12)) : (diff = this - that, output = "second" === units ? diff / 1e3 : "minute" === units ? diff / 6e4 : "hour" === units ? diff / 36e5 : "day" === units ? (diff - zoneDiff) / 864e5 : "week" === units ? (diff - zoneDiff) / 6048e5 : diff), 
                asFloat ? output : absRound(output);
            },
            from: function(time, withoutSuffix) {
                return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
            },
            fromNow: function(withoutSuffix) {
                return this.from(moment(), withoutSuffix);
            },
            calendar: function() {
                var sod = makeAs(moment(), this).startOf("day"), diff = this.diff(sod, "days", !0), format = -6 > diff ? "sameElse" : -1 > diff ? "lastWeek" : 0 > diff ? "lastDay" : 1 > diff ? "sameDay" : 2 > diff ? "nextDay" : 7 > diff ? "nextWeek" : "sameElse";
                return this.format(this.lang().calendar(format, this));
            },
            isLeapYear: function() {
                return isLeapYear(this.year());
            },
            isDST: function() {
                return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone();
            },
            day: function(input) {
                var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
                return null != input ? (input = parseWeekday(input, this.lang()), this.add({
                    d: input - day
                })) : day;
            },
            month: function(input) {
                var dayOfMonth, utc = this._isUTC ? "UTC" : "";
                return null != input ? "string" == typeof input && (input = this.lang().monthsParse(input), 
                "number" != typeof input) ? this : (dayOfMonth = this.date(), this.date(1), this._d["set" + utc + "Month"](input), 
                this.date(Math.min(dayOfMonth, this.daysInMonth())), moment.updateOffset(this), 
                this) : this._d["get" + utc + "Month"]();
            },
            startOf: function(units) {
                switch (units = normalizeUnits(units)) {
                  case "year":
                    this.month(0);

                  case "month":
                    this.date(1);

                  case "week":
                  case "isoWeek":
                  case "day":
                    this.hours(0);

                  case "hour":
                    this.minutes(0);

                  case "minute":
                    this.seconds(0);

                  case "second":
                    this.milliseconds(0);
                }
                return "week" === units ? this.weekday(0) : "isoWeek" === units && this.isoWeekday(1), 
                this;
            },
            endOf: function(units) {
                return units = normalizeUnits(units), this.startOf(units).add("isoWeek" === units ? "week" : units, 1).subtract("ms", 1);
            },
            isAfter: function(input, units) {
                return units = "undefined" != typeof units ? units : "millisecond", +this.clone().startOf(units) > +moment(input).startOf(units);
            },
            isBefore: function(input, units) {
                return units = "undefined" != typeof units ? units : "millisecond", +this.clone().startOf(units) < +moment(input).startOf(units);
            },
            isSame: function(input, units) {
                return units = units || "ms", +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
            },
            min: function(other) {
                return other = moment.apply(null, arguments), this > other ? this : other;
            },
            max: function(other) {
                return other = moment.apply(null, arguments), other > this ? this : other;
            },
            zone: function(input) {
                var offset = this._offset || 0;
                return null == input ? this._isUTC ? offset : this._d.getTimezoneOffset() : ("string" == typeof input && (input = timezoneMinutesFromString(input)), 
                Math.abs(input) < 16 && (input = 60 * input), this._offset = input, this._isUTC = !0, 
                offset !== input && addOrSubtractDurationFromMoment(this, moment.duration(offset - input, "m"), 1, !0), 
                this);
            },
            zoneAbbr: function() {
                return this._isUTC ? "UTC" : "";
            },
            zoneName: function() {
                return this._isUTC ? "Coordinated Universal Time" : "";
            },
            parseZone: function() {
                return this._tzm ? this.zone(this._tzm) : "string" == typeof this._i && this.zone(this._i), 
                this;
            },
            hasAlignedHourOffset: function(input) {
                return input = input ? moment(input).zone() : 0, (this.zone() - input) % 60 === 0;
            },
            daysInMonth: function() {
                return daysInMonth(this.year(), this.month());
            },
            dayOfYear: function(input) {
                var dayOfYear = round((moment(this).startOf("day") - moment(this).startOf("year")) / 864e5) + 1;
                return null == input ? dayOfYear : this.add("d", input - dayOfYear);
            },
            quarter: function() {
                return Math.ceil((this.month() + 1) / 3);
            },
            weekYear: function(input) {
                var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
                return null == input ? year : this.add("y", input - year);
            },
            isoWeekYear: function(input) {
                var year = weekOfYear(this, 1, 4).year;
                return null == input ? year : this.add("y", input - year);
            },
            week: function(input) {
                var week = this.lang().week(this);
                return null == input ? week : this.add("d", 7 * (input - week));
            },
            isoWeek: function(input) {
                var week = weekOfYear(this, 1, 4).week;
                return null == input ? week : this.add("d", 7 * (input - week));
            },
            weekday: function(input) {
                var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
                return null == input ? weekday : this.add("d", input - weekday);
            },
            isoWeekday: function(input) {
                return null == input ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
            },
            get: function(units) {
                return units = normalizeUnits(units), this[units]();
            },
            set: function(units, value) {
                return units = normalizeUnits(units), "function" == typeof this[units] && this[units](value), 
                this;
            },
            lang: function(key) {
                return key === undefined ? this._lang : (this._lang = getLangDefinition(key), this);
            }
        }), i = 0; i < proxyGettersAndSetters.length; i++) makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ""), proxyGettersAndSetters[i]);
        makeGetterAndSetter("year", "FullYear"), moment.fn.days = moment.fn.day, moment.fn.months = moment.fn.month, 
        moment.fn.weeks = moment.fn.week, moment.fn.isoWeeks = moment.fn.isoWeek, moment.fn.toJSON = moment.fn.toISOString, 
        extend(moment.duration.fn = Duration.prototype, {
            _bubble: function() {
                var seconds, minutes, hours, years, milliseconds = this._milliseconds, days = this._days, months = this._months, data = this._data;
                data.milliseconds = milliseconds % 1e3, seconds = absRound(milliseconds / 1e3), 
                data.seconds = seconds % 60, minutes = absRound(seconds / 60), data.minutes = minutes % 60, 
                hours = absRound(minutes / 60), data.hours = hours % 24, days += absRound(hours / 24), 
                data.days = days % 30, months += absRound(days / 30), data.months = months % 12, 
                years = absRound(months / 12), data.years = years;
            },
            weeks: function() {
                return absRound(this.days() / 7);
            },
            valueOf: function() {
                return this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * toInt(this._months / 12);
            },
            humanize: function(withSuffix) {
                var difference = +this, output = relativeTime(difference, !withSuffix, this.lang());
                return withSuffix && (output = this.lang().pastFuture(difference, output)), this.lang().postformat(output);
            },
            add: function(input, val) {
                var dur = moment.duration(input, val);
                return this._milliseconds += dur._milliseconds, this._days += dur._days, this._months += dur._months, 
                this._bubble(), this;
            },
            subtract: function(input, val) {
                var dur = moment.duration(input, val);
                return this._milliseconds -= dur._milliseconds, this._days -= dur._days, this._months -= dur._months, 
                this._bubble(), this;
            },
            get: function(units) {
                return units = normalizeUnits(units), this[units.toLowerCase() + "s"]();
            },
            as: function(units) {
                return units = normalizeUnits(units), this["as" + units.charAt(0).toUpperCase() + units.slice(1) + "s"]();
            },
            lang: moment.fn.lang,
            toIsoString: function() {
                var years = Math.abs(this.years()), months = Math.abs(this.months()), days = Math.abs(this.days()), hours = Math.abs(this.hours()), minutes = Math.abs(this.minutes()), seconds = Math.abs(this.seconds() + this.milliseconds() / 1e3);
                return this.asSeconds() ? (this.asSeconds() < 0 ? "-" : "") + "P" + (years ? years + "Y" : "") + (months ? months + "M" : "") + (days ? days + "D" : "") + (hours || minutes || seconds ? "T" : "") + (hours ? hours + "H" : "") + (minutes ? minutes + "M" : "") + (seconds ? seconds + "S" : "") : "P0D";
            }
        });
        for (i in unitMillisecondFactors) unitMillisecondFactors.hasOwnProperty(i) && (makeDurationAsGetter(i, unitMillisecondFactors[i]), 
        makeDurationGetter(i.toLowerCase()));
        makeDurationAsGetter("Weeks", 6048e5), moment.duration.fn.asMonths = function() {
            return (+this - 31536e6 * this.years()) / 2592e6 + 12 * this.years();
        }, moment.lang("en", {
            ordinal: function(number) {
                var b = number % 10, output = 1 === toInt(number % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th";
                return number + output;
            }
        }), hasModule ? (module.exports = moment, makeGlobal(!0)) : "function" == typeof define && define.amd ? define("moment", [ "require", "exports", "module" ], function(require, exports, module) {
            return module.config && module.config() && module.config().noGlobal !== !0 && makeGlobal(module.config().noGlobal === undefined), 
            moment;
        }) : makeGlobal();
    }.call(this), function() {
        "use strict";
        define("requests/controllers/request", [ "lodash", "moment" ], function(_, moment) {
            var RequestController = function($timeout, $log, $scope, ClusterResolver, RequestService, RequestTrackingService, $aside) {
                function getPollTimeFn() {
                    var delayMs = 1250;
                    return function() {
                        return 2e4 > delayMs && (delayMs *= 2), delayMs;
                    };
                }
                ClusterResolver.then(function() {
                    function responseParser(response) {
                        response = _.map(response, function(request) {
                            var time = "complete" === request.state ? request.completed_at : request.requested_at, headline = request.headline, state = request.state;
                            return request.error && (state = "error"), {
                                headline: headline,
                                state: state,
                                reltime: moment(time).fromNow(),
                                time: moment(time).format(),
                                error_message: request.error_message
                            };
                        }), myAside.$scope.tasks = response, myAside.$scope.empty = 0 === response.length;
                    }
                    function refresh() {
                        $scope.timeout !== !1 && RequestService.getList().then(responseParser)["finally"](function() {
                            $timeout(refresh, $scope.pollTimeoutInMs());
                        });
                    }
                    var myAside = $aside({
                        title: "任务请求",
                        template: "views/request.html",
                        animation: "am-fade-and-slide-right",
                        backdropAnimation: "animation-fade",
                        show: !1,
                        container: ".RequestManagement"
                    });
                    $scope.timeout = !1, myAside.$scope.empty = !0, $scope.show = function() {
                        myAside.$scope.$show(), myAside.$scope.$hide = _.wrap(myAside.$scope.$hide, function($hide) {
                            $hide(), $scope.timeout = !1;
                        }), $scope.pollTimeoutInMs = getPollTimeFn(), $scope.timeout = !0, refresh();
                    };
                });
            };
            return [ "$timeout", "$log", "$scope", "ClusterResolver", "RequestService", "RequestTrackingService", "$aside", RequestController ];
        });
    }(), function(name, definition, global) {
        "function" == typeof define ? define("idbwrapper", definition) : "undefined" != typeof module && module.exports ? module.exports = definition() : global[name] = definition();
    }("IDBStore", function() {
        "use strict";
        var defaultErrorHandler = function(error) {
            throw error;
        }, defaults = {
            storeName: "Store",
            storePrefix: "IDBWrapper-",
            dbVersion: 1,
            keyPath: "id",
            autoIncrement: !0,
            onStoreReady: function() {},
            onError: defaultErrorHandler,
            indexes: []
        }, IDBStore = function(kwArgs, onStoreReady) {
            "undefined" == typeof onStoreReady && "function" == typeof kwArgs && (onStoreReady = kwArgs), 
            "[object Object]" != Object.prototype.toString.call(kwArgs) && (kwArgs = {});
            for (var key in defaults) this[key] = "undefined" != typeof kwArgs[key] ? kwArgs[key] : defaults[key];
            this.dbName = this.storePrefix + this.storeName, this.dbVersion = parseInt(this.dbVersion, 10) || 1, 
            onStoreReady && (this.onStoreReady = onStoreReady);
            var env = "object" == typeof window ? window : self;
            this.idb = env.indexedDB || env.webkitIndexedDB || env.mozIndexedDB, this.keyRange = env.IDBKeyRange || env.webkitIDBKeyRange || env.mozIDBKeyRange, 
            this.features = {
                hasAutoIncrement: !env.mozIndexedDB
            }, this.consts = {
                READ_ONLY: "readonly",
                READ_WRITE: "readwrite",
                VERSION_CHANGE: "versionchange",
                NEXT: "next",
                NEXT_NO_DUPLICATE: "nextunique",
                PREV: "prev",
                PREV_NO_DUPLICATE: "prevunique"
            }, this.openDB();
        };
        IDBStore.prototype = {
            constructor: IDBStore,
            version: "1.4.1",
            db: null,
            dbName: null,
            dbVersion: null,
            store: null,
            storeName: null,
            keyPath: null,
            autoIncrement: null,
            indexes: null,
            features: null,
            onStoreReady: null,
            onError: null,
            _insertIdCount: 0,
            openDB: function() {
                var openRequest = this.idb.open(this.dbName, this.dbVersion), preventSuccessCallback = !1;
                openRequest.onerror = function(error) {
                    var gotVersionErr = !1;
                    "error" in error.target ? gotVersionErr = "VersionError" == error.target.error.name : "errorCode" in error.target && (gotVersionErr = 12 == error.target.errorCode), 
                    gotVersionErr ? this.onError(new Error("The version number provided is lower than the existing one.")) : this.onError(error);
                }.bind(this), openRequest.onsuccess = function(event) {
                    if (!preventSuccessCallback) {
                        if (this.db) return void this.onStoreReady();
                        if (this.db = event.target.result, "string" == typeof this.db.version) return void this.onError(new Error("The IndexedDB implementation in this browser is outdated. Please upgrade your browser."));
                        if (!this.db.objectStoreNames.contains(this.storeName)) return void this.onError(new Error("Something is wrong with the IndexedDB implementation in this browser. Please upgrade your browser."));
                        var emptyTransaction = this.db.transaction([ this.storeName ], this.consts.READ_ONLY);
                        this.store = emptyTransaction.objectStore(this.storeName);
                        var existingIndexes = Array.prototype.slice.call(this.getIndexList());
                        this.indexes.forEach(function(indexData) {
                            var indexName = indexData.name;
                            if (!indexName) return preventSuccessCallback = !0, void this.onError(new Error("Cannot create index: No index name given."));
                            if (this.normalizeIndexData(indexData), this.hasIndex(indexName)) {
                                var actualIndex = this.store.index(indexName), complies = this.indexComplies(actualIndex, indexData);
                                complies || (preventSuccessCallback = !0, this.onError(new Error('Cannot modify index "' + indexName + '" for current version. Please bump version number to ' + (this.dbVersion + 1) + "."))), 
                                existingIndexes.splice(existingIndexes.indexOf(indexName), 1);
                            } else preventSuccessCallback = !0, this.onError(new Error('Cannot create new index "' + indexName + '" for current version. Please bump version number to ' + (this.dbVersion + 1) + "."));
                        }, this), existingIndexes.length && (preventSuccessCallback = !0, this.onError(new Error('Cannot delete index(es) "' + existingIndexes.toString() + '" for current version. Please bump version number to ' + (this.dbVersion + 1) + "."))), 
                        preventSuccessCallback || this.onStoreReady();
                    }
                }.bind(this), openRequest.onupgradeneeded = function(event) {
                    if (this.db = event.target.result, this.db.objectStoreNames.contains(this.storeName)) this.store = event.target.transaction.objectStore(this.storeName); else {
                        var optionalParameters = {
                            autoIncrement: this.autoIncrement
                        };
                        null !== this.keyPath && (optionalParameters.keyPath = this.keyPath), this.store = this.db.createObjectStore(this.storeName, optionalParameters);
                    }
                    var existingIndexes = Array.prototype.slice.call(this.getIndexList());
                    this.indexes.forEach(function(indexData) {
                        var indexName = indexData.name;
                        if (indexName || (preventSuccessCallback = !0, this.onError(new Error("Cannot create index: No index name given."))), 
                        this.normalizeIndexData(indexData), this.hasIndex(indexName)) {
                            var actualIndex = this.store.index(indexName), complies = this.indexComplies(actualIndex, indexData);
                            complies || (this.store.deleteIndex(indexName), this.store.createIndex(indexName, indexData.keyPath, {
                                unique: indexData.unique,
                                multiEntry: indexData.multiEntry
                            })), existingIndexes.splice(existingIndexes.indexOf(indexName), 1);
                        } else this.store.createIndex(indexName, indexData.keyPath, {
                            unique: indexData.unique,
                            multiEntry: indexData.multiEntry
                        });
                    }, this), existingIndexes.length && existingIndexes.forEach(function(_indexName) {
                        this.store.deleteIndex(_indexName);
                    }, this);
                }.bind(this);
            },
            deleteDatabase: function() {
                this.idb.deleteDatabase && this.idb.deleteDatabase(this.dbName);
            },
            put: function(key, value, onSuccess, onError) {
                null !== this.keyPath && (onError = onSuccess, onSuccess = value, value = key), 
                onError || (onError = defaultErrorHandler), onSuccess || (onSuccess = noop);
                var putRequest, hasSuccess = !1, result = null, putTransaction = this.db.transaction([ this.storeName ], this.consts.READ_WRITE);
                return putTransaction.oncomplete = function() {
                    var callback = hasSuccess ? onSuccess : onError;
                    callback(result);
                }, putTransaction.onabort = onError, putTransaction.onerror = onError, null !== this.keyPath ? (this._addIdPropertyIfNeeded(value), 
                putRequest = putTransaction.objectStore(this.storeName).put(value)) : putRequest = putTransaction.objectStore(this.storeName).put(value, key), 
                putRequest.onsuccess = function(event) {
                    hasSuccess = !0, result = event.target.result;
                }, putRequest.onerror = onError, putTransaction;
            },
            get: function(key, onSuccess, onError) {
                onError || (onError = defaultErrorHandler), onSuccess || (onSuccess = noop);
                var hasSuccess = !1, result = null, getTransaction = this.db.transaction([ this.storeName ], this.consts.READ_ONLY);
                getTransaction.oncomplete = function() {
                    var callback = hasSuccess ? onSuccess : onError;
                    callback(result);
                }, getTransaction.onabort = onError, getTransaction.onerror = onError;
                var getRequest = getTransaction.objectStore(this.storeName).get(key);
                return getRequest.onsuccess = function(event) {
                    hasSuccess = !0, result = event.target.result;
                }, getRequest.onerror = onError, getTransaction;
            },
            remove: function(key, onSuccess, onError) {
                onError || (onError = defaultErrorHandler), onSuccess || (onSuccess = noop);
                var hasSuccess = !1, result = null, removeTransaction = this.db.transaction([ this.storeName ], this.consts.READ_WRITE);
                removeTransaction.oncomplete = function() {
                    var callback = hasSuccess ? onSuccess : onError;
                    callback(result);
                }, removeTransaction.onabort = onError, removeTransaction.onerror = onError;
                var deleteRequest = removeTransaction.objectStore(this.storeName)["delete"](key);
                return deleteRequest.onsuccess = function(event) {
                    hasSuccess = !0, result = event.target.result;
                }, deleteRequest.onerror = onError, removeTransaction;
            },
            batch: function(dataArray, onSuccess, onError) {
                onError || (onError = defaultErrorHandler), onSuccess || (onSuccess = noop), "[object Array]" != Object.prototype.toString.call(dataArray) && onError(new Error("dataArray argument must be of type Array."));
                var batchTransaction = this.db.transaction([ this.storeName ], this.consts.READ_WRITE);
                batchTransaction.oncomplete = function() {
                    var callback = hasSuccess ? onSuccess : onError;
                    callback(hasSuccess);
                }, batchTransaction.onabort = onError, batchTransaction.onerror = onError;
                var count = dataArray.length, called = !1, hasSuccess = !1, onItemSuccess = function() {
                    count--, 0 !== count || called || (called = !0, hasSuccess = !0);
                };
                return dataArray.forEach(function(operation) {
                    var type = operation.type, key = operation.key, value = operation.value, onItemError = function(err) {
                        batchTransaction.abort(), called || (called = !0, onError(err, type, key));
                    };
                    if ("remove" == type) {
                        var deleteRequest = batchTransaction.objectStore(this.storeName)["delete"](key);
                        deleteRequest.onsuccess = onItemSuccess, deleteRequest.onerror = onItemError;
                    } else if ("put" == type) {
                        var putRequest;
                        null !== this.keyPath ? (this._addIdPropertyIfNeeded(value), putRequest = batchTransaction.objectStore(this.storeName).put(value)) : putRequest = batchTransaction.objectStore(this.storeName).put(value, key), 
                        putRequest.onsuccess = onItemSuccess, putRequest.onerror = onItemError;
                    }
                }, this), batchTransaction;
            },
            putBatch: function(dataArray, onSuccess, onError) {
                var batchData = dataArray.map(function(item) {
                    return {
                        type: "put",
                        value: item
                    };
                });
                return this.batch(batchData, onSuccess, onError);
            },
            removeBatch: function(keyArray, onSuccess, onError) {
                var batchData = keyArray.map(function(key) {
                    return {
                        type: "remove",
                        key: key
                    };
                });
                return this.batch(batchData, onSuccess, onError);
            },
            getBatch: function(keyArray, onSuccess, onError, arrayType) {
                onError || (onError = defaultErrorHandler), onSuccess || (onSuccess = noop), arrayType || (arrayType = "sparse"), 
                "[object Array]" != Object.prototype.toString.call(keyArray) && onError(new Error("keyArray argument must be of type Array."));
                var batchTransaction = this.db.transaction([ this.storeName ], this.consts.READ_ONLY);
                batchTransaction.oncomplete = function() {
                    var callback = hasSuccess ? onSuccess : onError;
                    callback(result);
                }, batchTransaction.onabort = onError, batchTransaction.onerror = onError;
                var data = [], count = keyArray.length, called = !1, hasSuccess = !1, result = null, onItemSuccess = function(event) {
                    event.target.result || "dense" == arrayType ? data.push(event.target.result) : "sparse" == arrayType && data.length++, 
                    count--, 0 === count && (called = !0, hasSuccess = !0, result = data);
                };
                return keyArray.forEach(function(key) {
                    var onItemError = function(err) {
                        called = !0, result = err, onError(err), batchTransaction.abort();
                    }, getRequest = batchTransaction.objectStore(this.storeName).get(key);
                    getRequest.onsuccess = onItemSuccess, getRequest.onerror = onItemError;
                }, this), batchTransaction;
            },
            getAll: function(onSuccess, onError) {
                onError || (onError = defaultErrorHandler), onSuccess || (onSuccess = noop);
                var getAllTransaction = this.db.transaction([ this.storeName ], this.consts.READ_ONLY), store = getAllTransaction.objectStore(this.storeName);
                return store.getAll ? this._getAllNative(getAllTransaction, store, onSuccess, onError) : this._getAllCursor(getAllTransaction, store, onSuccess, onError), 
                getAllTransaction;
            },
            _getAllNative: function(getAllTransaction, store, onSuccess, onError) {
                var hasSuccess = !1, result = null;
                getAllTransaction.oncomplete = function() {
                    var callback = hasSuccess ? onSuccess : onError;
                    callback(result);
                }, getAllTransaction.onabort = onError, getAllTransaction.onerror = onError;
                var getAllRequest = store.getAll();
                getAllRequest.onsuccess = function(event) {
                    hasSuccess = !0, result = event.target.result;
                }, getAllRequest.onerror = onError;
            },
            _getAllCursor: function(getAllTransaction, store, onSuccess, onError) {
                var all = [], hasSuccess = !1, result = null;
                getAllTransaction.oncomplete = function() {
                    var callback = hasSuccess ? onSuccess : onError;
                    callback(result);
                }, getAllTransaction.onabort = onError, getAllTransaction.onerror = onError;
                var cursorRequest = store.openCursor();
                cursorRequest.onsuccess = function(event) {
                    var cursor = event.target.result;
                    cursor ? (all.push(cursor.value), cursor["continue"]()) : (hasSuccess = !0, result = all);
                }, cursorRequest.onError = onError;
            },
            clear: function(onSuccess, onError) {
                onError || (onError = defaultErrorHandler), onSuccess || (onSuccess = noop);
                var hasSuccess = !1, result = null, clearTransaction = this.db.transaction([ this.storeName ], this.consts.READ_WRITE);
                clearTransaction.oncomplete = function() {
                    var callback = hasSuccess ? onSuccess : onError;
                    callback(result);
                }, clearTransaction.onabort = onError, clearTransaction.onerror = onError;
                var clearRequest = clearTransaction.objectStore(this.storeName).clear();
                return clearRequest.onsuccess = function(event) {
                    hasSuccess = !0, result = event.target.result;
                }, clearRequest.onerror = onError, clearTransaction;
            },
            _addIdPropertyIfNeeded: function(dataObj) {
                this.features.hasAutoIncrement || "undefined" != typeof dataObj[this.keyPath] || (dataObj[this.keyPath] = this._insertIdCount++ + Date.now());
            },
            getIndexList: function() {
                return this.store.indexNames;
            },
            hasIndex: function(indexName) {
                return this.store.indexNames.contains(indexName);
            },
            normalizeIndexData: function(indexData) {
                indexData.keyPath = indexData.keyPath || indexData.name, indexData.unique = !!indexData.unique, 
                indexData.multiEntry = !!indexData.multiEntry;
            },
            indexComplies: function(actual, expected) {
                var complies = [ "keyPath", "unique", "multiEntry" ].every(function(key) {
                    if ("multiEntry" == key && void 0 === actual[key] && expected[key] === !1) return !0;
                    if ("keyPath" == key && "[object Array]" == Object.prototype.toString.call(expected[key])) {
                        var exp = expected.keyPath, act = actual.keyPath;
                        if ("string" == typeof act) return exp.toString() == act;
                        if ("function" != typeof act.contains && "function" != typeof act.indexOf) return !1;
                        if (act.length !== exp.length) return !1;
                        for (var i = 0, m = exp.length; m > i; i++) if (!(act.contains && act.contains(exp[i]) || act.indexOf(-1 !== exp[i]))) return !1;
                        return !0;
                    }
                    return expected[key] == actual[key];
                });
                return complies;
            },
            iterate: function(onItem, options) {
                options = mixin({
                    index: null,
                    order: "ASC",
                    autoContinue: !0,
                    filterDuplicates: !1,
                    keyRange: null,
                    writeAccess: !1,
                    onEnd: null,
                    onError: defaultErrorHandler
                }, options || {});
                var directionType = "desc" == options.order.toLowerCase() ? "PREV" : "NEXT";
                options.filterDuplicates && (directionType += "_NO_DUPLICATE");
                var hasSuccess = !1, cursorTransaction = this.db.transaction([ this.storeName ], this.consts[options.writeAccess ? "READ_WRITE" : "READ_ONLY"]), cursorTarget = cursorTransaction.objectStore(this.storeName);
                options.index && (cursorTarget = cursorTarget.index(options.index)), cursorTransaction.oncomplete = function() {
                    return hasSuccess ? void (options.onEnd ? options.onEnd() : onItem(null)) : void options.onError(null);
                }, cursorTransaction.onabort = options.onError, cursorTransaction.onerror = options.onError;
                var cursorRequest = cursorTarget.openCursor(options.keyRange, this.consts[directionType]);
                return cursorRequest.onerror = options.onError, cursorRequest.onsuccess = function(event) {
                    var cursor = event.target.result;
                    cursor ? (onItem(cursor.value, cursor, cursorTransaction), options.autoContinue && cursor["continue"]()) : hasSuccess = !0;
                }, cursorTransaction;
            },
            query: function(onSuccess, options) {
                var result = [];
                return options = options || {}, options.onEnd = function() {
                    onSuccess(result);
                }, this.iterate(function(item) {
                    result.push(item);
                }, options);
            },
            count: function(onSuccess, options) {
                options = mixin({
                    index: null,
                    keyRange: null
                }, options || {});
                var onError = options.onError || defaultErrorHandler, hasSuccess = !1, result = null, cursorTransaction = this.db.transaction([ this.storeName ], this.consts.READ_ONLY);
                cursorTransaction.oncomplete = function() {
                    var callback = hasSuccess ? onSuccess : onError;
                    callback(result);
                }, cursorTransaction.onabort = onError, cursorTransaction.onerror = onError;
                var cursorTarget = cursorTransaction.objectStore(this.storeName);
                options.index && (cursorTarget = cursorTarget.index(options.index));
                var countRequest = cursorTarget.count(options.keyRange);
                return countRequest.onsuccess = function(evt) {
                    hasSuccess = !0, result = evt.target.result;
                }, countRequest.onError = onError, cursorTransaction;
            },
            makeKeyRange: function(options) {
                var keyRange, hasLower = "undefined" != typeof options.lower, hasUpper = "undefined" != typeof options.upper, isOnly = "undefined" != typeof options.only;
                switch (!0) {
                  case isOnly:
                    keyRange = this.keyRange.only(options.only);
                    break;

                  case hasLower && hasUpper:
                    keyRange = this.keyRange.bound(options.lower, options.upper, options.excludeLower, options.excludeUpper);
                    break;

                  case hasLower:
                    keyRange = this.keyRange.lowerBound(options.lower, options.excludeLower);
                    break;

                  case hasUpper:
                    keyRange = this.keyRange.upperBound(options.upper, options.excludeUpper);
                    break;

                  default:
                    throw new Error('Cannot create KeyRange. Provide one or both of "lower" or "upper" value, or an "only" value.');
                }
                return keyRange;
            }
        };
        var noop = function() {}, empty = {}, mixin = function(target, source) {
            var name, s;
            for (name in source) s = source[name], s !== empty[name] && s !== target[name] && (target[name] = s);
            return target;
        };
        return IDBStore.version = IDBStore.prototype.version, IDBStore;
    }, this), define("requests/services/request-tracking", [ "lodash", "idbwrapper", "moment" ], function(_, IDBStore, momentjs) {
        "use strict";
        var defaultTimer = 15e3, shortTimer = 5e3, myid = 0, requestTrackingService = function($q, $log, $timeout, RequestService, growl, $modal) {
            var Service = function() {
                this.myid = myid++, $log.debug("Creating Request Tracking Service [" + this.myid + "]"), 
                this.deferred = {};
                var self = this;
                this.requests = new IDBStore({
                    dbVersion: 2,
                    storeName: "InktankUserRequest",
                    keyPath: "id",
                    autoIncrement: !1,
                    onStoreReady: function() {
                        $log.info("Inktank User Request Store ready!"), self.timeout = $timeout(self.checkWorkToDo, shortTimer);
                    },
                    onError: function() {
                        $log.error("Your browser may be in incognito or private browsing mode. Request Tracking Disabled"), 
                        $modal({
                            html: !0,
                            title: '<span class="text-warning">警告</span>',
                            content: '<p>Request Tracking depends on a feature (<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API">IndexedDB</a>) in your browser which only works when you are not in <a href="https://support.mozilla.org/en-US/kb/private-browsing-browse-web-without-saving-info?redirectlocale=en-US&as=u&redirectslug=Private+Browsing&utm_source=inproduct" target="_blank">private</a> or incognito mode.</p><p>The application will still function, and you may view requested tasks via the notification menu (<i class="fa fa-bell"></i>).</p><p>Pop up event notifications however, will be disabled until you stop using private browsing.</p>',
                            show: !0
                        }), self.add = self.remove = function() {}, self.getTrackedTasks = function() {
                            return [];
                        }, self.getSubmitted = function() {
                            return [];
                        }, self.getLength = function() {
                            return 0;
                        };
                    }
                }), _.bindAll(this, "remove", "add", "checkWorkToDo", "processTasks", "getTrackedTasks", "getLength", "_resolvePromise", "_rejectPromise");
            };
            return Service.prototype = _.extend(Service.prototype, {
                add: function(id) {
                    var d = $q.defer();
                    if (null === id || void 0 === id) d.resolve(); else {
                        this.deferred[id] = d;
                        var self = this;
                        this.requests.put({
                            id: id,
                            timestamp: Date.now()
                        }, function(id) {
                            $log.debug("tracking new request " + id);
                        }, function(error) {
                            $log.error("error inserting request " + id + " error ", error), self._rejectPromise(id);
                        }), $timeout.cancel(this.timeout), this.timeout = $timeout(this.checkWorkToDo, 0);
                    }
                    return d.promise;
                },
                showError: function(request) {
                    growl.addErrorMessage("ERROR: " + request.headline + " - " + request.error_message, {
                        ttl: -1
                    });
                },
                showNotification: function(request) {
                    growl.addSuccessMessage(request.headline);
                },
                getLength: function() {
                    var d = $q.defer();
                    return this.requests.count(d.resolve, d.reject), d.promise;
                },
                getTrackedTasks: function() {
                    var d = $q.defer();
                    return this.requests.getAll(d.resolve, d.reject), d.promise;
                },
                _resolvePromise: function(ttID) {
                    this.deferred[ttID] && (this.deferred[ttID].resolve(ttID), delete this.deferred[ttID]);
                },
                _rejectPromise: function(ttID, error) {
                    this.deferred[ttID] && (this.deferred[ttID].reject(ttID, error), delete this.deferred[ttID]);
                },
                remove: function(ttID) {
                    var d = $q.defer();
                    this.requests.remove(ttID, d.resolve, d.reject);
                    var self = this;
                    return d.promise.then(function() {
                        $log.debug("Removed task id " + ttID), self._resolvePromise(ttID);
                    }, function(error) {
                        $log.error("Error removing task id " + ttID, error), self._rejectPromise(ttID, error);
                    }), d.promise;
                },
                processTasks: function(runningTasks, trackedTasks) {
                    _.each(trackedTasks, function(trackedTask) {
                        var ttID = trackedTask.id, foundTask = _.find(runningTasks, function(runningTask) {
                            return runningTask.id === ttID;
                        });
                        if (void 0 === foundTask) {
                            var self = this;
                            RequestService.get(ttID).then(function(request) {
                                if ($log.debug("Checking task " + ttID), request.error) self.showError(request), 
                                self.remove(ttID); else if ("complete" === request.state) $log.debug("Task " + ttID + " is complete"), 
                                self.showNotification(request), self.remove(ttID); else if ($log.debug("task " + ttID + " is still active."), 
                                trackedTask.timestamp) {
                                    var timestamp = momentjs(trackedTask.timestamp), now = momentjs();
                                    now.diff(timestamp, "days") >= 1 && ($log.warn("task " + ttID + " is older than 24 hours. Reaping old task."), 
                                    self.remove(ttID));
                                }
                            }, function(resp) {
                                $log.debug("Error " + resp.status + " checking task " + ttID, resp), 404 === resp.status && ($log.warn("Task " + ttID + " NOT FOUND"), 
                                self.remove(ttID));
                            });
                        } else $log.debug("Task " + ttID + " is still executing");
                    }, this), $log.debug("Server has " + runningTasks.length + " running tasks"), this.timeout = $timeout(this.checkWorkToDo, shortTimer);
                },
                checkWorkToDo: function() {
                    var self = this;
                    this.getLength().then(function(requestLen) {
                        return 0 === requestLen ? ($log.debug("[" + self.myid + "] No tasks to track. sleeping " + defaultTimer), 
                        void (self.timeout = $timeout(self.checkWorkToDo, defaultTimer))) : ($log.debug("[" + self.myid + "] tracking " + requestLen + " tasks"), 
                        void RequestService.getSubmitted().then(function(runningTasks) {
                            self.getTrackedTasks().then(_.partial(self.processTasks, runningTasks), function(error) {
                                $log.error("Unexpected DB error getting tracked task list ", error);
                            });
                        }, function(error) {
                            $log.error(error), self.timeout = $timeout(self.checkWorkToDo, defaultTimer);
                        }));
                    }, function(error) {
                        $log.error("Error Counting Request DB ", error), self.timeout = $timeout(self.checkWorkToDo, defaultTimer);
                    });
                }
            }), new Service();
        }, service = null;
        return function() {
            this.$get = [ "$q", "$log", "$timeout", "RequestService", "growl", "$modal", function($q, $log, $timeout, RequestService, growl, $modal) {
                return null === service && (service = requestTrackingService($q, $log, $timeout, RequestService, growl, $modal)), 
                service;
            } ];
        };
    }), function(window, angular, undefined) {
        "use strict";
        function $SanitizeProvider() {
            this.$get = [ "$$sanitizeUri", function($$sanitizeUri) {
                return function(html) {
                    var buf = [];
                    return htmlParser(html, htmlSanitizeWriter(buf, function(uri, isImage) {
                        return !/^unsafe/.test($$sanitizeUri(uri, isImage));
                    })), buf.join("");
                };
            } ];
        }
        function sanitizeText(chars) {
            var buf = [], writer = htmlSanitizeWriter(buf, angular.noop);
            return writer.chars(chars), buf.join("");
        }
        function makeMap(str) {
            var i, obj = {}, items = str.split(",");
            for (i = 0; i < items.length; i++) obj[items[i]] = !0;
            return obj;
        }
        function htmlParser(html, handler) {
            function parseStartTag(tag, tagName, rest, unary) {
                if (tagName = angular.lowercase(tagName), blockElements[tagName]) for (;stack.last() && inlineElements[stack.last()]; ) parseEndTag("", stack.last());
                optionalEndTagElements[tagName] && stack.last() == tagName && parseEndTag("", tagName), 
                unary = voidElements[tagName] || !!unary, unary || stack.push(tagName);
                var attrs = {};
                rest.replace(ATTR_REGEXP, function(match, name, doubleQuotedValue, singleQuotedValue, unquotedValue) {
                    var value = doubleQuotedValue || singleQuotedValue || unquotedValue || "";
                    attrs[name] = decodeEntities(value);
                }), handler.start && handler.start(tagName, attrs, unary);
            }
            function parseEndTag(tag, tagName) {
                var i, pos = 0;
                if (tagName = angular.lowercase(tagName)) for (pos = stack.length - 1; pos >= 0 && stack[pos] != tagName; pos--) ;
                if (pos >= 0) {
                    for (i = stack.length - 1; i >= pos; i--) handler.end && handler.end(stack[i]);
                    stack.length = pos;
                }
            }
            var index, chars, match, stack = [], last = html;
            for (stack.last = function() {
                return stack[stack.length - 1];
            }; html; ) {
                if (chars = !0, stack.last() && specialElements[stack.last()]) html = html.replace(new RegExp("(.*)<\\s*\\/\\s*" + stack.last() + "[^>]*>", "i"), function(all, text) {
                    return text = text.replace(COMMENT_REGEXP, "$1").replace(CDATA_REGEXP, "$1"), handler.chars && handler.chars(decodeEntities(text)), 
                    "";
                }), parseEndTag("", stack.last()); else if (0 === html.indexOf("<!--") ? (index = html.indexOf("--", 4), 
                index >= 0 && html.lastIndexOf("-->", index) === index && (handler.comment && handler.comment(html.substring(4, index)), 
                html = html.substring(index + 3), chars = !1)) : DOCTYPE_REGEXP.test(html) ? (match = html.match(DOCTYPE_REGEXP), 
                match && (html = html.replace(match[0], ""), chars = !1)) : BEGING_END_TAGE_REGEXP.test(html) ? (match = html.match(END_TAG_REGEXP), 
                match && (html = html.substring(match[0].length), match[0].replace(END_TAG_REGEXP, parseEndTag), 
                chars = !1)) : BEGIN_TAG_REGEXP.test(html) && (match = html.match(START_TAG_REGEXP), 
                match && (html = html.substring(match[0].length), match[0].replace(START_TAG_REGEXP, parseStartTag), 
                chars = !1)), chars) {
                    index = html.indexOf("<");
                    var text = 0 > index ? html : html.substring(0, index);
                    html = 0 > index ? "" : html.substring(index), handler.chars && handler.chars(decodeEntities(text));
                }
                if (html == last) throw $sanitizeMinErr("badparse", "The sanitizer was unable to parse the following block of html: {0}", html);
                last = html;
            }
            parseEndTag();
        }
        function decodeEntities(value) {
            if (!value) return "";
            var parts = spaceRe.exec(value), spaceBefore = parts[1], spaceAfter = parts[3], content = parts[2];
            return content && (hiddenPre.innerHTML = content.replace(/</g, "&lt;"), content = "textContent" in hiddenPre ? hiddenPre.textContent : hiddenPre.innerText), 
            spaceBefore + content + spaceAfter;
        }
        function encodeEntities(value) {
            return value.replace(/&/g, "&amp;").replace(NON_ALPHANUMERIC_REGEXP, function(value) {
                return "&#" + value.charCodeAt(0) + ";";
            }).replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        function htmlSanitizeWriter(buf, uriValidator) {
            var ignore = !1, out = angular.bind(buf, buf.push);
            return {
                start: function(tag, attrs, unary) {
                    tag = angular.lowercase(tag), !ignore && specialElements[tag] && (ignore = tag), 
                    ignore || validElements[tag] !== !0 || (out("<"), out(tag), angular.forEach(attrs, function(value, key) {
                        var lkey = angular.lowercase(key), isImage = "img" === tag && "src" === lkey || "background" === lkey;
                        validAttrs[lkey] !== !0 || uriAttrs[lkey] === !0 && !uriValidator(value, isImage) || (out(" "), 
                        out(key), out('="'), out(encodeEntities(value)), out('"'));
                    }), out(unary ? "/>" : ">"));
                },
                end: function(tag) {
                    tag = angular.lowercase(tag), ignore || validElements[tag] !== !0 || (out("</"), 
                    out(tag), out(">")), tag == ignore && (ignore = !1);
                },
                chars: function(chars) {
                    ignore || out(encodeEntities(chars));
                }
            };
        }
        var $sanitizeMinErr = angular.$$minErr("$sanitize"), START_TAG_REGEXP = /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/, END_TAG_REGEXP = /^<\s*\/\s*([\w:-]+)[^>]*>/, ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g, BEGIN_TAG_REGEXP = /^</, BEGING_END_TAGE_REGEXP = /^<\s*\//, COMMENT_REGEXP = /<!--(.*?)-->/g, DOCTYPE_REGEXP = /<!DOCTYPE([^>]*?)>/i, CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g, NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g, voidElements = makeMap("area,br,col,hr,img,wbr"), optionalEndTagBlockElements = makeMap("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"), optionalEndTagInlineElements = makeMap("rp,rt"), optionalEndTagElements = angular.extend({}, optionalEndTagInlineElements, optionalEndTagBlockElements), blockElements = angular.extend({}, optionalEndTagBlockElements, makeMap("address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul")), inlineElements = angular.extend({}, optionalEndTagInlineElements, makeMap("a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var")), specialElements = makeMap("script,style"), validElements = angular.extend({}, voidElements, blockElements, inlineElements, optionalEndTagElements), uriAttrs = makeMap("background,cite,href,longdesc,src,usemap"), validAttrs = angular.extend({}, uriAttrs, makeMap("abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,span,start,summary,target,title,type,valign,value,vspace,width")), hiddenPre = document.createElement("pre"), spaceRe = /^(\s*)([\s\S]*?)(\s*)$/;
        angular.module("ngSanitize", []).provider("$sanitize", $SanitizeProvider), angular.module("ngSanitize").filter("linky", [ "$sanitize", function($sanitize) {
            var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>]/, MAILTO_REGEXP = /^mailto:/;
            return function(text, target) {
                function addText(text) {
                    text && html.push(sanitizeText(text));
                }
                function addLink(url, text) {
                    html.push("<a "), angular.isDefined(target) && (html.push('target="'), html.push(target), 
                    html.push('" ')), html.push('href="'), html.push(url), html.push('">'), addText(text), 
                    html.push("</a>");
                }
                if (!text) return text;
                for (var match, url, i, raw = text, html = []; match = raw.match(LINKY_URL_REGEXP); ) url = match[0], 
                match[2] == match[3] && (url = "mailto:" + url), i = match.index, addText(raw.substr(0, i)), 
                addLink(url, match[0].replace(MAILTO_REGEXP, "")), raw = raw.substring(i + match[0].length);
                return addText(raw), $sanitize(html.join(""));
            };
        } ]);
    }(window, window.angular), define("angular-sanitize", [ "angular" ], function() {}), 
    function(window, angular, undefined) {
        "use strict";
        angular.module("ngAnimate", [ "ng" ]).factory("$$animateReflow", [ "$window", "$timeout", function($window, $timeout) {
            var requestAnimationFrame = $window.requestAnimationFrame || $window.webkitRequestAnimationFrame || function(fn) {
                return $timeout(fn, 10, !1);
            }, cancelAnimationFrame = $window.cancelAnimationFrame || $window.webkitCancelAnimationFrame || function(timer) {
                return $timeout.cancel(timer);
            };
            return function(fn) {
                var id = requestAnimationFrame(fn);
                return function() {
                    cancelAnimationFrame(id);
                };
            };
        } ]).config([ "$provide", "$animateProvider", function($provide, $animateProvider) {
            function extractElementNode(element) {
                for (var i = 0; i < element.length; i++) {
                    var elm = element[i];
                    if (elm.nodeType == ELEMENT_NODE) return elm;
                }
            }
            function isMatchingElement(elm1, elm2) {
                return extractElementNode(elm1) == extractElementNode(elm2);
            }
            var noop = angular.noop, forEach = angular.forEach, selectors = $animateProvider.$$selectors, ELEMENT_NODE = 1, NG_ANIMATE_STATE = "$$ngAnimateState", NG_ANIMATE_CLASS_NAME = "ng-animate", rootAnimateState = {
                running: !0
            };
            $provide.decorator("$animate", [ "$delegate", "$injector", "$sniffer", "$rootElement", "$timeout", "$rootScope", "$document", function($delegate, $injector, $sniffer, $rootElement, $timeout, $rootScope, $document) {
                function async(fn) {
                    return $timeout(fn, 0, !1);
                }
                function lookup(name) {
                    if (name) {
                        var matches = [], flagMap = {}, classes = name.substr(1).split(".");
                        ($sniffer.transitions || $sniffer.animations) && classes.push("");
                        for (var i = 0; i < classes.length; i++) {
                            var klass = classes[i], selectorFactoryName = selectors[klass];
                            selectorFactoryName && !flagMap[klass] && (matches.push($injector.get(selectorFactoryName)), 
                            flagMap[klass] = !0);
                        }
                        return matches;
                    }
                }
                function performAnimation(animationEvent, className, element, parentElement, afterElement, domOperation, doneCallback) {
                    function onBeforeAnimationsComplete(cancelled) {
                        if (fireDOMOperation(), cancelled === !0) return void closeAnimation();
                        var data = element.data(NG_ANIMATE_STATE);
                        data && (data.done = closeAnimation, element.data(NG_ANIMATE_STATE, data)), invokeRegisteredAnimationFns(animations, "after", closeAnimation);
                    }
                    function invokeRegisteredAnimationFns(animations, phase, allAnimationFnsComplete) {
                        function progress(index, phase) {
                            var phaseCompletionFlag = phase + "Complete", currentAnimation = animations[index];
                            currentAnimation[phaseCompletionFlag] = !0, (currentAnimation[endFnName] || noop)();
                            for (var i = 0; i < animations.length; i++) if (!animations[i][phaseCompletionFlag]) return;
                            allAnimationFnsComplete();
                        }
                        "after" == phase ? fireAfterCallbackAsync() : fireBeforeCallbackAsync();
                        var endFnName = phase + "End";
                        forEach(animations, function(animation, index) {
                            var animationPhaseCompleted = function() {
                                progress(index, phase);
                            };
                            return "before" != phase || "enter" != animationEvent && "move" != animationEvent ? void (animation[phase] ? animation[endFnName] = isClassBased ? animation[phase](element, className, animationPhaseCompleted) : animation[phase](element, animationPhaseCompleted) : animationPhaseCompleted()) : void animationPhaseCompleted();
                        });
                    }
                    function fireDOMCallback(animationPhase) {
                        element.triggerHandler("$animate:" + animationPhase, {
                            event: animationEvent,
                            className: className
                        });
                    }
                    function fireBeforeCallbackAsync() {
                        async(function() {
                            fireDOMCallback("before");
                        });
                    }
                    function fireAfterCallbackAsync() {
                        async(function() {
                            fireDOMCallback("after");
                        });
                    }
                    function fireDoneCallbackAsync() {
                        async(function() {
                            fireDOMCallback("close"), doneCallback && doneCallback();
                        });
                    }
                    function fireDOMOperation() {
                        fireDOMOperation.hasBeenRun || (fireDOMOperation.hasBeenRun = !0, domOperation());
                    }
                    function closeAnimation() {
                        if (!closeAnimation.hasBeenRun) {
                            closeAnimation.hasBeenRun = !0;
                            var data = element.data(NG_ANIMATE_STATE);
                            data && (isClassBased ? cleanup(element) : (data.closeAnimationTimeout = async(function() {
                                cleanup(element);
                            }), element.data(NG_ANIMATE_STATE, data))), fireDoneCallbackAsync();
                        }
                    }
                    var currentClassName, classes, node = extractElementNode(element);
                    if (node && (currentClassName = node.className, classes = currentClassName + " " + className), 
                    !node || !isAnimatableClassName(classes)) return fireDOMOperation(), fireBeforeCallbackAsync(), 
                    fireAfterCallbackAsync(), void closeAnimation();
                    var animationLookup = (" " + classes).replace(/\s+/g, ".");
                    parentElement || (parentElement = afterElement ? afterElement.parent() : element.parent());
                    var matches = lookup(animationLookup), isClassBased = "addClass" == animationEvent || "removeClass" == animationEvent, ngAnimateState = element.data(NG_ANIMATE_STATE) || {};
                    if (animationsDisabled(element, parentElement) || 0 === matches.length) return fireDOMOperation(), 
                    fireBeforeCallbackAsync(), fireAfterCallbackAsync(), void closeAnimation();
                    var animations = [], allowAnimations = isClassBased ? !(ngAnimateState.disabled || ngAnimateState.running && ngAnimateState.structural) : !0;
                    if (allowAnimations && forEach(matches, function(animation) {
                        if (!animation.allowCancel || animation.allowCancel(element, animationEvent, className)) {
                            var beforeFn, afterFn = animation[animationEvent];
                            "leave" == animationEvent ? (beforeFn = afterFn, afterFn = null) : beforeFn = animation["before" + animationEvent.charAt(0).toUpperCase() + animationEvent.substr(1)], 
                            animations.push({
                                before: beforeFn,
                                after: afterFn
                            });
                        }
                    }), 0 === animations.length) return fireDOMOperation(), fireBeforeCallbackAsync(), 
                    fireAfterCallbackAsync(), void fireDoneCallbackAsync();
                    var ONE_SPACE = " ", futureClassName = ONE_SPACE + currentClassName + ONE_SPACE;
                    if (ngAnimateState.running) {
                        $timeout.cancel(ngAnimateState.closeAnimationTimeout), cleanup(element), cancelAnimations(ngAnimateState.animations);
                        var isFullyClassBasedAnimation = isClassBased && !ngAnimateState.structural, isRevertingClassAnimation = isFullyClassBasedAnimation && ngAnimateState.className == className && animationEvent != ngAnimateState.event;
                        ngAnimateState.beforeComplete || isRevertingClassAnimation ? (ngAnimateState.done || noop)(!0) : isFullyClassBasedAnimation && (futureClassName = "removeClass" == ngAnimateState.event ? futureClassName.replace(ONE_SPACE + ngAnimateState.className + ONE_SPACE, ONE_SPACE) : futureClassName + ngAnimateState.className + ONE_SPACE);
                    }
                    var classNameToken = ONE_SPACE + className + ONE_SPACE;
                    return "addClass" == animationEvent && futureClassName.indexOf(classNameToken) >= 0 || "removeClass" == animationEvent && -1 == futureClassName.indexOf(classNameToken) ? (fireDOMOperation(), 
                    fireBeforeCallbackAsync(), fireAfterCallbackAsync(), void fireDoneCallbackAsync()) : (element.addClass(NG_ANIMATE_CLASS_NAME), 
                    element.data(NG_ANIMATE_STATE, {
                        running: !0,
                        event: animationEvent,
                        className: className,
                        structural: !isClassBased,
                        animations: animations,
                        done: onBeforeAnimationsComplete
                    }), void invokeRegisteredAnimationFns(animations, "before", onBeforeAnimationsComplete));
                }
                function cancelChildAnimations(element) {
                    var node = extractElementNode(element);
                    forEach(node.querySelectorAll("." + NG_ANIMATE_CLASS_NAME), function(element) {
                        element = angular.element(element);
                        var data = element.data(NG_ANIMATE_STATE);
                        data && (cancelAnimations(data.animations), cleanup(element));
                    });
                }
                function cancelAnimations(animations) {
                    var isCancelledFlag = !0;
                    forEach(animations, function(animation) {
                        animation.beforeComplete || (animation.beforeEnd || noop)(isCancelledFlag), animation.afterComplete || (animation.afterEnd || noop)(isCancelledFlag);
                    });
                }
                function cleanup(element) {
                    isMatchingElement(element, $rootElement) ? rootAnimateState.disabled || (rootAnimateState.running = !1, 
                    rootAnimateState.structural = !1) : (element.removeClass(NG_ANIMATE_CLASS_NAME), 
                    element.removeData(NG_ANIMATE_STATE));
                }
                function animationsDisabled(element, parentElement) {
                    if (rootAnimateState.disabled) return !0;
                    if (isMatchingElement(element, $rootElement)) return rootAnimateState.disabled || rootAnimateState.running;
                    do {
                        if (0 === parentElement.length) break;
                        var isRoot = isMatchingElement(parentElement, $rootElement), state = isRoot ? rootAnimateState : parentElement.data(NG_ANIMATE_STATE), result = state && (!!state.disabled || !!state.running);
                        if (isRoot || result) return result;
                        if (isRoot) return !0;
                    } while (parentElement = parentElement.parent());
                    return !0;
                }
                $rootElement.data(NG_ANIMATE_STATE, rootAnimateState), $rootScope.$$postDigest(function() {
                    $rootScope.$$postDigest(function() {
                        rootAnimateState.running = !1;
                    });
                });
                var classNameFilter = $animateProvider.classNameFilter(), isAnimatableClassName = classNameFilter ? function(className) {
                    return classNameFilter.test(className);
                } : function() {
                    return !0;
                };
                return {
                    enter: function(element, parentElement, afterElement, doneCallback) {
                        this.enabled(!1, element), $delegate.enter(element, parentElement, afterElement), 
                        $rootScope.$$postDigest(function() {
                            performAnimation("enter", "ng-enter", element, parentElement, afterElement, noop, doneCallback);
                        });
                    },
                    leave: function(element, doneCallback) {
                        cancelChildAnimations(element), this.enabled(!1, element), $rootScope.$$postDigest(function() {
                            performAnimation("leave", "ng-leave", element, null, null, function() {
                                $delegate.leave(element);
                            }, doneCallback);
                        });
                    },
                    move: function(element, parentElement, afterElement, doneCallback) {
                        cancelChildAnimations(element), this.enabled(!1, element), $delegate.move(element, parentElement, afterElement), 
                        $rootScope.$$postDigest(function() {
                            performAnimation("move", "ng-move", element, parentElement, afterElement, noop, doneCallback);
                        });
                    },
                    addClass: function(element, className, doneCallback) {
                        performAnimation("addClass", className, element, null, null, function() {
                            $delegate.addClass(element, className);
                        }, doneCallback);
                    },
                    removeClass: function(element, className, doneCallback) {
                        performAnimation("removeClass", className, element, null, null, function() {
                            $delegate.removeClass(element, className);
                        }, doneCallback);
                    },
                    enabled: function(value, element) {
                        switch (arguments.length) {
                          case 2:
                            if (value) cleanup(element); else {
                                var data = element.data(NG_ANIMATE_STATE) || {};
                                data.disabled = !0, element.data(NG_ANIMATE_STATE, data);
                            }
                            break;

                          case 1:
                            rootAnimateState.disabled = !value;
                            break;

                          default:
                            value = !rootAnimateState.disabled;
                        }
                        return !!value;
                    }
                };
            } ]), $animateProvider.register("", [ "$window", "$sniffer", "$timeout", "$$animateReflow", function($window, $sniffer, $timeout, $$animateReflow) {
                function afterReflow(element, callback) {
                    cancelAnimationReflow && cancelAnimationReflow(), animationReflowQueue.push(callback);
                    var node = extractElementNode(element);
                    element = angular.element(node), animationElementQueue.push(element);
                    var elementData = element.data(NG_ANIMATE_CSS_DATA_KEY), stagger = elementData.stagger, staggerTime = elementData.itemIndex * (Math.max(stagger.animationDelay, stagger.transitionDelay) || 0), animationTime = (elementData.maxDelay + elementData.maxDuration) * CLOSING_TIME_BUFFER;
                    closingAnimationTime = Math.max(closingAnimationTime, (staggerTime + animationTime) * ONE_SECOND), 
                    elementData.animationCount = animationCounter, cancelAnimationReflow = $$animateReflow(function() {
                        forEach(animationReflowQueue, function(fn) {
                            fn();
                        });
                        var elementQueueSnapshot = [], animationCounterSnapshot = animationCounter;
                        forEach(animationElementQueue, function(elm) {
                            elementQueueSnapshot.push(elm);
                        }), $timeout(function() {
                            closeAllAnimations(elementQueueSnapshot, animationCounterSnapshot), elementQueueSnapshot = null;
                        }, closingAnimationTime, !1), animationReflowQueue = [], animationElementQueue = [], 
                        cancelAnimationReflow = null, lookupCache = {}, closingAnimationTime = 0, animationCounter++;
                    });
                }
                function closeAllAnimations(elements, count) {
                    forEach(elements, function(element) {
                        var elementData = element.data(NG_ANIMATE_CSS_DATA_KEY);
                        elementData && elementData.animationCount == count && (elementData.closeAnimationFn || noop)();
                    });
                }
                function getElementAnimationDetails(element, cacheKey) {
                    var data = cacheKey ? lookupCache[cacheKey] : null;
                    if (!data) {
                        var transitionDelayStyle, animationDelayStyle, transitionDurationStyle, transitionPropertyStyle, transitionDuration = 0, transitionDelay = 0, animationDuration = 0, animationDelay = 0;
                        forEach(element, function(element) {
                            if (element.nodeType == ELEMENT_NODE) {
                                var elementStyles = $window.getComputedStyle(element) || {};
                                transitionDurationStyle = elementStyles[TRANSITION_PROP + DURATION_KEY], transitionDuration = Math.max(parseMaxTime(transitionDurationStyle), transitionDuration), 
                                transitionPropertyStyle = elementStyles[TRANSITION_PROP + PROPERTY_KEY], transitionDelayStyle = elementStyles[TRANSITION_PROP + DELAY_KEY], 
                                transitionDelay = Math.max(parseMaxTime(transitionDelayStyle), transitionDelay), 
                                animationDelayStyle = elementStyles[ANIMATION_PROP + DELAY_KEY], animationDelay = Math.max(parseMaxTime(animationDelayStyle), animationDelay);
                                var aDuration = parseMaxTime(elementStyles[ANIMATION_PROP + DURATION_KEY]);
                                aDuration > 0 && (aDuration *= parseInt(elementStyles[ANIMATION_PROP + ANIMATION_ITERATION_COUNT_KEY], 10) || 1), 
                                animationDuration = Math.max(aDuration, animationDuration);
                            }
                        }), data = {
                            total: 0,
                            transitionPropertyStyle: transitionPropertyStyle,
                            transitionDurationStyle: transitionDurationStyle,
                            transitionDelayStyle: transitionDelayStyle,
                            transitionDelay: transitionDelay,
                            transitionDuration: transitionDuration,
                            animationDelayStyle: animationDelayStyle,
                            animationDelay: animationDelay,
                            animationDuration: animationDuration
                        }, cacheKey && (lookupCache[cacheKey] = data);
                    }
                    return data;
                }
                function parseMaxTime(str) {
                    var maxValue = 0, values = angular.isString(str) ? str.split(/\s*,\s*/) : [];
                    return forEach(values, function(value) {
                        maxValue = Math.max(parseFloat(value) || 0, maxValue);
                    }), maxValue;
                }
                function getCacheKey(element) {
                    var parentElement = element.parent(), parentID = parentElement.data(NG_ANIMATE_PARENT_KEY);
                    return parentID || (parentElement.data(NG_ANIMATE_PARENT_KEY, ++parentCounter), 
                    parentID = parentCounter), parentID + "-" + extractElementNode(element).className;
                }
                function animateSetup(element, className, calculationDecorator) {
                    var cacheKey = getCacheKey(element), eventCacheKey = cacheKey + " " + className, stagger = {}, itemIndex = lookupCache[eventCacheKey] ? ++lookupCache[eventCacheKey].total : 0;
                    if (itemIndex > 0) {
                        var staggerClassName = className + "-stagger", staggerCacheKey = cacheKey + " " + staggerClassName, applyClasses = !lookupCache[staggerCacheKey];
                        applyClasses && element.addClass(staggerClassName), stagger = getElementAnimationDetails(element, staggerCacheKey), 
                        applyClasses && element.removeClass(staggerClassName);
                    }
                    calculationDecorator = calculationDecorator || function(fn) {
                        return fn();
                    }, element.addClass(className);
                    var timings = calculationDecorator(function() {
                        return getElementAnimationDetails(element, eventCacheKey);
                    }), maxDelay = Math.max(timings.transitionDelay, timings.animationDelay), maxDuration = Math.max(timings.transitionDuration, timings.animationDuration);
                    if (0 === maxDuration) return element.removeClass(className), !1;
                    var activeClassName = "";
                    return timings.transitionDuration > 0 ? blockTransitions(element) : blockKeyframeAnimations(element), 
                    forEach(className.split(" "), function(klass, i) {
                        activeClassName += (i > 0 ? " " : "") + klass + "-active";
                    }), element.data(NG_ANIMATE_CSS_DATA_KEY, {
                        className: className,
                        activeClassName: activeClassName,
                        maxDuration: maxDuration,
                        maxDelay: maxDelay,
                        classes: className + " " + activeClassName,
                        timings: timings,
                        stagger: stagger,
                        itemIndex: itemIndex
                    }), !0;
                }
                function blockTransitions(element) {
                    extractElementNode(element).style[TRANSITION_PROP + PROPERTY_KEY] = "none";
                }
                function blockKeyframeAnimations(element) {
                    extractElementNode(element).style[ANIMATION_PROP] = "none 0s";
                }
                function unblockTransitions(element) {
                    var prop = TRANSITION_PROP + PROPERTY_KEY, node = extractElementNode(element);
                    node.style[prop] && node.style[prop].length > 0 && (node.style[prop] = "");
                }
                function unblockKeyframeAnimations(element) {
                    var prop = ANIMATION_PROP, node = extractElementNode(element);
                    node.style[prop] && node.style[prop].length > 0 && (node.style[prop] = "");
                }
                function animateRun(element, className, activeAnimationComplete) {
                    function onEnd(cancelled) {
                        element.off(css3AnimationEvents, onAnimationProgress), element.removeClass(activeClassName), 
                        animateClose(element, className);
                        var node = extractElementNode(element);
                        for (var i in appliedStyles) node.style.removeProperty(appliedStyles[i]);
                    }
                    function onAnimationProgress(event) {
                        event.stopPropagation();
                        var ev = event.originalEvent || event, timeStamp = ev.$manualTimeStamp || ev.timeStamp || Date.now(), elapsedTime = parseFloat(ev.elapsedTime.toFixed(ELAPSED_TIME_MAX_DECIMAL_PLACES));
                        Math.max(timeStamp - startTime, 0) >= maxDelayTime && elapsedTime >= maxDuration && activeAnimationComplete();
                    }
                    var elementData = element.data(NG_ANIMATE_CSS_DATA_KEY), node = extractElementNode(element);
                    if (-1 == node.className.indexOf(className) || !elementData) return void activeAnimationComplete();
                    var timings = elementData.timings, stagger = elementData.stagger, maxDuration = elementData.maxDuration, activeClassName = elementData.activeClassName, maxDelayTime = Math.max(timings.transitionDelay, timings.animationDelay) * ONE_SECOND, startTime = Date.now(), css3AnimationEvents = ANIMATIONEND_EVENT + " " + TRANSITIONEND_EVENT, itemIndex = elementData.itemIndex, style = "", appliedStyles = [];
                    if (timings.transitionDuration > 0) {
                        var propertyStyle = timings.transitionPropertyStyle;
                        -1 == propertyStyle.indexOf("all") && (style += CSS_PREFIX + "transition-property: " + propertyStyle + ";", 
                        style += CSS_PREFIX + "transition-duration: " + timings.transitionDurationStyle + ";", 
                        appliedStyles.push(CSS_PREFIX + "transition-property"), appliedStyles.push(CSS_PREFIX + "transition-duration"));
                    }
                    if (itemIndex > 0) {
                        if (stagger.transitionDelay > 0 && 0 === stagger.transitionDuration) {
                            var delayStyle = timings.transitionDelayStyle;
                            style += CSS_PREFIX + "transition-delay: " + prepareStaggerDelay(delayStyle, stagger.transitionDelay, itemIndex) + "; ", 
                            appliedStyles.push(CSS_PREFIX + "transition-delay");
                        }
                        stagger.animationDelay > 0 && 0 === stagger.animationDuration && (style += CSS_PREFIX + "animation-delay: " + prepareStaggerDelay(timings.animationDelayStyle, stagger.animationDelay, itemIndex) + "; ", 
                        appliedStyles.push(CSS_PREFIX + "animation-delay"));
                    }
                    if (appliedStyles.length > 0) {
                        var oldStyle = node.getAttribute("style") || "";
                        node.setAttribute("style", oldStyle + " " + style);
                    }
                    return element.on(css3AnimationEvents, onAnimationProgress), element.addClass(activeClassName), 
                    elementData.closeAnimationFn = function() {
                        onEnd(), activeAnimationComplete();
                    }, onEnd;
                }
                function prepareStaggerDelay(delayStyle, staggerDelay, index) {
                    var style = "";
                    return forEach(delayStyle.split(","), function(val, i) {
                        style += (i > 0 ? "," : "") + (index * staggerDelay + parseInt(val, 10)) + "s";
                    }), style;
                }
                function animateBefore(element, className, calculationDecorator) {
                    return animateSetup(element, className, calculationDecorator) ? function(cancelled) {
                        cancelled && animateClose(element, className);
                    } : void 0;
                }
                function animateAfter(element, className, afterAnimationComplete) {
                    return element.data(NG_ANIMATE_CSS_DATA_KEY) ? animateRun(element, className, afterAnimationComplete) : (animateClose(element, className), 
                    void afterAnimationComplete());
                }
                function animate(element, className, animationComplete) {
                    var preReflowCancellation = animateBefore(element, className);
                    if (!preReflowCancellation) return void animationComplete();
                    var cancel = preReflowCancellation;
                    return afterReflow(element, function() {
                        unblockTransitions(element), unblockKeyframeAnimations(element), cancel = animateAfter(element, className, animationComplete);
                    }), function(cancelled) {
                        (cancel || noop)(cancelled);
                    };
                }
                function animateClose(element, className) {
                    element.removeClass(className), element.removeData(NG_ANIMATE_CSS_DATA_KEY);
                }
                function suffixClasses(classes, suffix) {
                    var className = "";
                    return classes = angular.isArray(classes) ? classes : classes.split(/\s+/), forEach(classes, function(klass, i) {
                        klass && klass.length > 0 && (className += (i > 0 ? " " : "") + klass + suffix);
                    }), className;
                }
                var TRANSITION_PROP, TRANSITIONEND_EVENT, ANIMATION_PROP, ANIMATIONEND_EVENT, CSS_PREFIX = "";
                window.ontransitionend === undefined && window.onwebkittransitionend !== undefined ? (CSS_PREFIX = "-webkit-", 
                TRANSITION_PROP = "WebkitTransition", TRANSITIONEND_EVENT = "webkitTransitionEnd transitionend") : (TRANSITION_PROP = "transition", 
                TRANSITIONEND_EVENT = "transitionend"), window.onanimationend === undefined && window.onwebkitanimationend !== undefined ? (CSS_PREFIX = "-webkit-", 
                ANIMATION_PROP = "WebkitAnimation", ANIMATIONEND_EVENT = "webkitAnimationEnd animationend") : (ANIMATION_PROP = "animation", 
                ANIMATIONEND_EVENT = "animationend");
                var cancelAnimationReflow, DURATION_KEY = "Duration", PROPERTY_KEY = "Property", DELAY_KEY = "Delay", ANIMATION_ITERATION_COUNT_KEY = "IterationCount", NG_ANIMATE_PARENT_KEY = "$$ngAnimateKey", NG_ANIMATE_CSS_DATA_KEY = "$$ngAnimateCSS3Data", ELAPSED_TIME_MAX_DECIMAL_PLACES = 3, CLOSING_TIME_BUFFER = 1.5, ONE_SECOND = 1e3, animationCounter = 0, lookupCache = {}, parentCounter = 0, animationReflowQueue = [], animationElementQueue = [], closingAnimationTime = 0;
                return {
                    allowCancel: function(element, animationEvent, className) {
                        var oldClasses = (element.data(NG_ANIMATE_CSS_DATA_KEY) || {}).classes;
                        if (!oldClasses || [ "enter", "leave", "move" ].indexOf(animationEvent) >= 0) return !0;
                        var parentElement = element.parent(), clone = angular.element(extractElementNode(element).cloneNode());
                        clone.attr("style", "position:absolute; top:-9999px; left:-9999px"), clone.removeAttr("id"), 
                        clone.empty(), forEach(oldClasses.split(" "), function(klass) {
                            clone.removeClass(klass);
                        });
                        var suffix = "addClass" == animationEvent ? "-add" : "-remove";
                        clone.addClass(suffixClasses(className, suffix)), parentElement.append(clone);
                        var timings = getElementAnimationDetails(clone);
                        return clone.remove(), Math.max(timings.transitionDuration, timings.animationDuration) > 0;
                    },
                    enter: function(element, animationCompleted) {
                        return animate(element, "ng-enter", animationCompleted);
                    },
                    leave: function(element, animationCompleted) {
                        return animate(element, "ng-leave", animationCompleted);
                    },
                    move: function(element, animationCompleted) {
                        return animate(element, "ng-move", animationCompleted);
                    },
                    beforeAddClass: function(element, className, animationCompleted) {
                        var cancellationMethod = animateBefore(element, suffixClasses(className, "-add"), function(fn) {
                            element.addClass(className);
                            var timings = fn();
                            return element.removeClass(className), timings;
                        });
                        return cancellationMethod ? (afterReflow(element, function() {
                            unblockTransitions(element), unblockKeyframeAnimations(element), animationCompleted();
                        }), cancellationMethod) : void animationCompleted();
                    },
                    addClass: function(element, className, animationCompleted) {
                        return animateAfter(element, suffixClasses(className, "-add"), animationCompleted);
                    },
                    beforeRemoveClass: function(element, className, animationCompleted) {
                        var cancellationMethod = animateBefore(element, suffixClasses(className, "-remove"), function(fn) {
                            var klass = element.attr("class");
                            element.removeClass(className);
                            var timings = fn();
                            return element.attr("class", klass), timings;
                        });
                        return cancellationMethod ? (afterReflow(element, function() {
                            unblockTransitions(element), unblockKeyframeAnimations(element), animationCompleted();
                        }), cancellationMethod) : void animationCompleted();
                    },
                    removeClass: function(element, className, animationCompleted) {
                        return animateAfter(element, suffixClasses(className, "-remove"), animationCompleted);
                    }
                };
            } ]);
        } ]);
    }(window, window.angular), define("angular-animate", [ "angular" ], function() {}), 
    !function(a, b) {
        "use strict";
        angular.module("mgcrea.ngStrap", [ "mgcrea.ngStrap.modal", "mgcrea.ngStrap.aside", "mgcrea.ngStrap.alert", "mgcrea.ngStrap.button", "mgcrea.ngStrap.select", "mgcrea.ngStrap.datepicker", "mgcrea.ngStrap.timepicker", "mgcrea.ngStrap.navbar", "mgcrea.ngStrap.tooltip", "mgcrea.ngStrap.popover", "mgcrea.ngStrap.dropdown", "mgcrea.ngStrap.typeahead", "mgcrea.ngStrap.scrollspy", "mgcrea.ngStrap.affix", "mgcrea.ngStrap.tab" ]), 
        angular.module("mgcrea.ngStrap.affix", [ "mgcrea.ngStrap.helpers.dimensions" ]).provider("$affix", function() {
            var a = this.defaults = {
                offsetTop: "auto"
            };
            this.$get = [ "$window", "dimensions", function(b, c) {
                function d(d, f) {
                    function g(a, b, c) {
                        var d = h(), e = i();
                        return t >= d ? "top" : null !== a && d + a <= b.top ? "middle" : null !== u && b.top + c + n >= e - u ? "bottom" : "middle";
                    }
                    function h() {
                        return l[0] === b ? b.pageYOffset : l[0] === b;
                    }
                    function i() {
                        return l[0] === b ? b.document.body.scrollHeight : l[0].scrollHeight;
                    }
                    var j = {}, k = angular.extend({}, a, f), l = k.target, m = "affix affix-top affix-bottom", n = 0, o = 0, p = null, q = null, r = d.parent();
                    if (k.offsetParent) if (k.offsetParent.match(/^\d+$/)) for (var s = 0; s < 1 * k.offsetParent - 1; s++) r = r.parent(); else r = angular.element(k.offsetParent);
                    var t = 0;
                    k.offsetTop && ("auto" === k.offsetTop && (k.offsetTop = "+0"), k.offsetTop.match(/^[-+]\d+$/) ? (n -= 1 * k.offsetTop, 
                    t = k.offsetParent ? c.offset(r[0]).top + 1 * k.offsetTop : c.offset(d[0]).top - c.css(d[0], "marginTop", !0) + 1 * k.offsetTop) : t = 1 * k.offsetTop);
                    var u = 0;
                    return k.offsetBottom && (u = k.offsetParent && k.offsetBottom.match(/^[-+]\d+$/) ? i() - (c.offset(r[0]).top + c.height(r[0])) + 1 * k.offsetBottom + 1 : 1 * k.offsetBottom), 
                    j.init = function() {
                        o = c.offset(d[0]).top + n, l.on("scroll", this.checkPosition), l.on("click", this.checkPositionWithEventLoop), 
                        this.checkPosition(), this.checkPositionWithEventLoop();
                    }, j.destroy = function() {
                        l.off("scroll", this.checkPosition), l.off("click", this.checkPositionWithEventLoop);
                    }, j.checkPositionWithEventLoop = function() {
                        setTimeout(this.checkPosition, 1);
                    }, j.checkPosition = function() {
                        var a = h(), b = c.offset(d[0]), f = c.height(d[0]), i = g(q, b, f);
                        p !== i && (p = i, d.removeClass(m).addClass("affix" + ("middle" !== i ? "-" + i : "")), 
                        "top" === i ? (q = null, d.css("position", k.offsetParent ? "" : "relative"), d.css("top", "")) : "bottom" === i ? (q = k.offsetUnpin ? -(1 * k.offsetUnpin) : b.top - a, 
                        d.css("position", k.offsetParent ? "" : "relative"), d.css("top", k.offsetParent ? "" : e[0].offsetHeight - u - f - o + "px")) : (q = null, 
                        d.css("position", "fixed"), d.css("top", n + "px")));
                    }, j.init(), j;
                }
                var e = angular.element(b.document.body);
                return d;
            } ];
        }).directive("bsAffix", [ "$affix", "$window", function(a, b) {
            return {
                restrict: "EAC",
                require: "^?bsAffixTarget",
                link: function(c, d, e, f) {
                    var g = {
                        scope: c,
                        offsetTop: "auto",
                        target: f ? f.$element : angular.element(b)
                    };
                    angular.forEach([ "offsetTop", "offsetBottom", "offsetParent", "offsetUnpin" ], function(a) {
                        angular.isDefined(e[a]) && (g[a] = e[a]);
                    });
                    var h = a(d, g);
                    c.$on("$destroy", function() {
                        g = null, h = null;
                    });
                }
            };
        } ]).directive("bsAffixTarget", function() {
            return {
                controller: [ "$element", function(a) {
                    this.$element = a;
                } ]
            };
        }), angular.module("mgcrea.ngStrap.alert", []).provider("$alert", function() {
            var a = this.defaults = {
                animation: "am-fade",
                prefixClass: "alert",
                placement: null,
                template: "alert/alert.tpl.html",
                container: !1,
                element: null,
                backdrop: !1,
                keyboard: !0,
                show: !0,
                duration: !1,
                type: !1
            };
            this.$get = [ "$modal", "$timeout", function(b, c) {
                function d(d) {
                    var e = {}, f = angular.extend({}, a, d);
                    e = b(f), f.type && (e.$scope.type = f.type);
                    var g = e.show;
                    return f.duration && (e.show = function() {
                        g(), c(function() {
                            e.hide();
                        }, 1e3 * f.duration);
                    }), e;
                }
                return d;
            } ];
        }).directive("bsAlert", [ "$window", "$location", "$sce", "$alert", function(a, b, c, d) {
            return a.requestAnimationFrame || a.setTimeout, {
                restrict: "EAC",
                scope: !0,
                link: function(a, b, e) {
                    var f = {
                        scope: a,
                        element: b,
                        show: !1
                    };
                    angular.forEach([ "template", "placement", "keyboard", "html", "container", "animation", "duration" ], function(a) {
                        angular.isDefined(e[a]) && (f[a] = e[a]);
                    }), angular.forEach([ "title", "content", "type" ], function(b) {
                        e[b] && e.$observe(b, function(d) {
                            a[b] = c.getTrustedHtml(d);
                        });
                    }), e.bsAlert && a.$watch(e.bsAlert, function(b) {
                        angular.isObject(b) ? angular.extend(a, b) : a.content = b;
                    }, !0);
                    var g = d(f);
                    b.on(e.trigger || "click", g.toggle), a.$on("$destroy", function() {
                        g.destroy(), f = null, g = null;
                    });
                }
            };
        } ]), angular.module("mgcrea.ngStrap.aside", [ "mgcrea.ngStrap.modal" ]).provider("$aside", function() {
            var a = this.defaults = {
                animation: "am-fade-and-slide-right",
                prefixClass: "aside",
                placement: "right",
                template: "aside/aside.tpl.html",
                contentTemplate: !1,
                container: !1,
                element: null,
                backdrop: !0,
                keyboard: !0,
                html: !1,
                show: !0
            };
            this.$get = [ "$modal", function(b) {
                function c(c) {
                    var d = {}, e = angular.extend({}, a, c);
                    return d = b(e);
                }
                return c;
            } ];
        }).directive("bsAside", [ "$window", "$location", "$sce", "$aside", function(a, b, c, d) {
            return a.requestAnimationFrame || a.setTimeout, {
                restrict: "EAC",
                scope: !0,
                link: function(a, b, e) {
                    var f = {
                        scope: a,
                        element: b,
                        show: !1
                    };
                    angular.forEach([ "template", "contentTemplate", "placement", "backdrop", "keyboard", "html", "container", "animation" ], function(a) {
                        angular.isDefined(e[a]) && (f[a] = e[a]);
                    }), angular.forEach([ "title", "content" ], function(b) {
                        e[b] && e.$observe(b, function(d) {
                            a[b] = c.getTrustedHtml(d);
                        });
                    }), e.bsAside && a.$watch(e.bsAside, function(b) {
                        angular.isObject(b) ? angular.extend(a, b) : a.content = b;
                    }, !0);
                    var g = d(f);
                    b.on(e.trigger || "click", g.toggle), a.$on("$destroy", function() {
                        g.destroy(), f = null, g = null;
                    });
                }
            };
        } ]), angular.module("mgcrea.ngStrap.button", [ "ngAnimate" ]).provider("$button", function() {
            var a = this.defaults = {
                activeClass: "active",
                toggleEvent: "click"
            };
            this.$get = function() {
                return {
                    defaults: a
                };
            };
        }).directive("bsCheckboxGroup", function() {
            return {
                restrict: "A",
                require: "ngModel",
                compile: function(a, b) {
                    a.attr("data-toggle", "buttons"), a.removeAttr("ng-model");
                    var c = a[0].querySelectorAll('input[type="checkbox"]');
                    angular.forEach(c, function(a) {
                        var c = angular.element(a);
                        c.attr("bs-checkbox", ""), c.attr("ng-model", b.ngModel + "." + c.attr("value"));
                    });
                }
            };
        }).directive("bsCheckbox", [ "$button", "$$animateReflow", function(a, b) {
            var c = a.defaults, d = /^(true|false|\d+)$/;
            return {
                restrict: "A",
                require: "ngModel",
                link: function(a, e, f, g) {
                    var h = c, i = "INPUT" === e[0].nodeName, j = i ? e.parent() : e, k = angular.isDefined(f.trueValue) ? f.trueValue : !0;
                    d.test(f.trueValue) && (k = a.$eval(f.trueValue));
                    var l = angular.isDefined(f.falseValue) ? f.falseValue : !1;
                    d.test(f.falseValue) && (l = a.$eval(f.falseValue));
                    var m = "boolean" != typeof k || "boolean" != typeof l;
                    m && (g.$parsers.push(function(a) {
                        return a ? k : l;
                    }), a.$watch(f.ngModel, function() {
                        g.$render();
                    })), g.$render = function() {
                        var a = angular.equals(g.$modelValue, k);
                        b(function() {
                            i && (e[0].checked = a), j.toggleClass(h.activeClass, a);
                        });
                    }, e.bind(h.toggleEvent, function() {
                        a.$apply(function() {
                            i || g.$setViewValue(!j.hasClass("active")), m || g.$render();
                        });
                    });
                }
            };
        } ]).directive("bsRadioGroup", function() {
            return {
                restrict: "A",
                require: "ngModel",
                compile: function(a, b) {
                    a.attr("data-toggle", "buttons"), a.removeAttr("ng-model");
                    var c = a[0].querySelectorAll('input[type="radio"]');
                    angular.forEach(c, function(a) {
                        angular.element(a).attr("bs-radio", ""), angular.element(a).attr("ng-model", b.ngModel);
                    });
                }
            };
        }).directive("bsRadio", [ "$button", "$$animateReflow", function(a, b) {
            var c = a.defaults, d = /^(true|false|\d+)$/;
            return {
                restrict: "A",
                require: "ngModel",
                link: function(a, e, f, g) {
                    var h = c, i = "INPUT" === e[0].nodeName, j = i ? e.parent() : e, k = d.test(f.value) ? a.$eval(f.value) : f.value;
                    g.$render = function() {
                        var a = angular.equals(g.$modelValue, k);
                        b(function() {
                            i && (e[0].checked = a), j.toggleClass(h.activeClass, a);
                        });
                    }, e.bind(h.toggleEvent, function() {
                        a.$apply(function() {
                            g.$setViewValue(k), g.$render();
                        });
                    });
                }
            };
        } ]), angular.module("mgcrea.ngStrap.datepicker", [ "mgcrea.ngStrap.helpers.dateParser", "mgcrea.ngStrap.tooltip" ]).provider("$datepicker", function() {
            var a = this.defaults = {
                animation: "am-fade",
                prefixClass: "datepicker",
                placement: "bottom-left",
                template: "datepicker/datepicker.tpl.html",
                trigger: "focus",
                container: !1,
                keyboard: !0,
                html: !1,
                delay: 0,
                useNative: !1,
                dateType: "date",
                dateFormat: "shortDate",
                autoclose: !1,
                minDate: -1 / 0,
                maxDate: 1 / 0,
                startView: 0,
                minView: 0,
                startWeek: 0
            };
            this.$get = [ "$window", "$document", "$rootScope", "$sce", "$locale", "dateFilter", "datepickerViews", "$tooltip", function(b, c, d, e, f, g, h, i) {
                function j(b, c, d) {
                    function e(a) {
                        a.selected = g.$isSelected(a.date);
                    }
                    function f() {
                        b[0].focus();
                    }
                    var g = i(b, angular.extend({}, a, d)), j = d.scope, m = g.$options, n = g.$scope;
                    m.startView && (m.startView -= m.minView);
                    var o = h(g);
                    g.$views = o.views;
                    var p = o.viewDate;
                    n.$mode = m.startView;
                    var q = g.$views[n.$mode];
                    n.$select = function(a) {
                        g.select(a);
                    }, n.$selectPane = function(a) {
                        g.$selectPane(a);
                    }, n.$toggleMode = function() {
                        g.setMode((n.$mode + 1) % g.$views.length);
                    }, g.update = function(a) {
                        angular.isDate(a) && !isNaN(a.getTime()) && (g.$date = a, q.update.call(q, a)), 
                        g.$build(!0);
                    }, g.select = function(a, b) {
                        angular.isDate(c.$dateValue) || (c.$dateValue = new Date(a)), c.$dateValue.setFullYear(a.getFullYear(), a.getMonth(), a.getDate()), 
                        !n.$mode || b ? (c.$setViewValue(c.$dateValue), c.$render(), m.autoclose && !b && g.hide(!0)) : (angular.extend(p, {
                            year: a.getFullYear(),
                            month: a.getMonth(),
                            date: a.getDate()
                        }), g.setMode(n.$mode - 1), g.$build());
                    }, g.setMode = function(a) {
                        n.$mode = a, q = g.$views[n.$mode], g.$build();
                    }, g.$build = function(a) {
                        a === !0 && q.built || (a !== !1 || q.built) && q.build.call(q);
                    }, g.$updateSelected = function() {
                        for (var a = 0, b = n.rows.length; b > a; a++) angular.forEach(n.rows[a], e);
                    }, g.$isSelected = function(a) {
                        return q.isSelected(a);
                    }, g.$selectPane = function(a) {
                        var b = q.steps, c = new Date(Date.UTC(p.year + (b.year || 0) * a, p.month + (b.month || 0) * a, p.date + (b.day || 0) * a));
                        angular.extend(p, {
                            year: c.getUTCFullYear(),
                            month: c.getUTCMonth(),
                            date: c.getUTCDate()
                        }), g.$build();
                    }, g.$onMouseDown = function(a) {
                        if (a.preventDefault(), a.stopPropagation(), k) {
                            var b = angular.element(a.target);
                            "button" !== b[0].nodeName.toLowerCase() && (b = b.parent()), b.triggerHandler("click");
                        }
                    }, g.$onKeyDown = function(a) {
                        if (/(38|37|39|40|13)/.test(a.keyCode) && !a.shiftKey && !a.altKey) {
                            if (a.preventDefault(), a.stopPropagation(), 13 === a.keyCode) return n.$mode ? n.$apply(function() {
                                g.setMode(n.$mode - 1);
                            }) : g.hide(!0);
                            q.onKeyDown(a), j.$digest();
                        }
                    };
                    var r = g.init;
                    g.init = function() {
                        return l && m.useNative ? (b.prop("type", "date"), void b.css("-webkit-appearance", "textfield")) : (k && (b.prop("type", "text"), 
                        b.attr("readonly", "true"), b.on("click", f)), void r());
                    };
                    var s = g.destroy;
                    g.destroy = function() {
                        l && m.useNative && b.off("click", f), s();
                    };
                    var t = g.show;
                    g.show = function() {
                        t(), setTimeout(function() {
                            g.$element.on(k ? "touchstart" : "mousedown", g.$onMouseDown), m.keyboard && b.on("keydown", g.$onKeyDown);
                        });
                    };
                    var u = g.hide;
                    return g.hide = function(a) {
                        g.$element.off(k ? "touchstart" : "mousedown", g.$onMouseDown), m.keyboard && b.off("keydown", g.$onKeyDown), 
                        u(a);
                    }, g;
                }
                var k = (angular.element(b.document.body), "createTouch" in b.document), l = /(ip(a|o)d|iphone|android)/gi.test(b.navigator.userAgent);
                return a.lang || (a.lang = f.id), j.defaults = a, j;
            } ];
        }).directive("bsDatepicker", [ "$window", "$parse", "$q", "$locale", "dateFilter", "$datepicker", "$dateParser", "$timeout", function(a, b, c, d, e, f, g) {
            var h = (f.defaults, /(ip(a|o)d|iphone|android)/gi.test(a.navigator.userAgent));
            return a.requestAnimationFrame || a.setTimeout, {
                restrict: "EAC",
                require: "ngModel",
                link: function(a, b, c, d) {
                    var i = {
                        scope: a,
                        controller: d
                    };
                    angular.forEach([ "placement", "container", "delay", "trigger", "keyboard", "html", "animation", "template", "autoclose", "dateType", "dateFormat", "startWeek", "useNative", "lang", "startView", "minView" ], function(a) {
                        angular.isDefined(c[a]) && (i[a] = c[a]);
                    }), h && i.useNative && (i.dateFormat = "yyyy-MM-dd");
                    var j = f(b, d, i);
                    i = j.$options, angular.forEach([ "minDate", "maxDate" ], function(a) {
                        angular.isDefined(c[a]) && c.$observe(a, function(b) {
                            if ("today" === b) {
                                var c = new Date();
                                j.$options[a] = +new Date(c.getFullYear(), c.getMonth(), c.getDate() + ("maxDate" === a ? 1 : 0), 0, 0, 0, "minDate" === a ? 0 : -1);
                            } else j.$options[a] = angular.isString(b) && b.match(/^".+"$/) ? +new Date(b.substr(1, b.length - 2)) : +new Date(b);
                            !isNaN(j.$options[a]) && j.$build(!1);
                        });
                    }), a.$watch(c.ngModel, function() {
                        j.update(d.$dateValue);
                    }, !0);
                    var k = g({
                        format: i.dateFormat,
                        lang: i.lang
                    });
                    d.$parsers.unshift(function(a) {
                        if (!a) return void d.$setValidity("date", !0);
                        var b = k.parse(a, d.$dateValue);
                        if (!b || isNaN(b.getTime())) d.$setValidity("date", !1); else {
                            var c = b.getTime() >= i.minDate && b.getTime() <= i.maxDate;
                            d.$setValidity("date", c), c && (d.$dateValue = b);
                        }
                        return "string" === i.dateType ? e(a, i.dateFormat) : "number" === i.dateType ? d.$dateValue.getTime() : "iso" === i.dateType ? d.$dateValue.toISOString() : d.$dateValue;
                    }), d.$formatters.push(function(a) {
                        var b = angular.isDate(a) ? a : new Date(a);
                        return d.$dateValue = b, d.$dateValue;
                    }), d.$render = function() {
                        b.val(isNaN(d.$dateValue.getTime()) ? "" : e(d.$dateValue, i.dateFormat));
                    }, a.$on("$destroy", function() {
                        j.destroy(), i = null, j = null;
                    });
                }
            };
        } ]).provider("datepickerViews", function() {
            function a(a, b) {
                for (var c = []; a.length > 0; ) c.push(a.splice(0, b));
                return c;
            }
            this.defaults = {
                dayFormat: "dd",
                daySplit: 7
            }, this.$get = [ "$locale", "$sce", "dateFilter", function(b, c, d) {
                return function(e) {
                    var f = e.$scope, g = e.$options, h = b.DATETIME_FORMATS.SHORTDAY, i = h.slice(g.startWeek).concat(h.slice(0, g.startWeek)), j = c.trustAsHtml('<th class="dow text-center">' + i.join('</th><th class="dow text-center">') + "</th>"), k = e.$date || new Date(), l = {
                        year: k.getFullYear(),
                        month: k.getMonth(),
                        date: k.getDate()
                    }, m = (6e4 * k.getTimezoneOffset(), [ {
                        format: "dd",
                        split: 7,
                        steps: {
                            month: 1
                        },
                        update: function(a, b) {
                            !this.built || b || a.getFullYear() !== l.year || a.getMonth() !== l.month ? (angular.extend(l, {
                                year: e.$date.getFullYear(),
                                month: e.$date.getMonth(),
                                date: e.$date.getDate()
                            }), e.$build()) : a.getDate() !== l.date && (l.date = e.$date.getDate(), e.$updateSelected());
                        },
                        build: function() {
                            for (var b, c = new Date(l.year, l.month, 1), h = new Date(+c - 864e5 * (c.getDay() + g.startWeek)), i = [], k = 0; 42 > k; k++) b = new Date(h.getFullYear(), h.getMonth(), h.getDate() + k), 
                            i.push({
                                date: b,
                                label: d(b, this.format),
                                selected: e.$date && this.isSelected(b),
                                muted: b.getMonth() !== l.month,
                                disabled: this.isDisabled(b)
                            });
                            f.title = d(c, "MMMM yyyy"), f.labels = j, f.rows = a(i, this.split), this.built = !0;
                        },
                        isSelected: function(a) {
                            return e.$date && a.getFullYear() === e.$date.getFullYear() && a.getMonth() === e.$date.getMonth() && a.getDate() === e.$date.getDate();
                        },
                        isDisabled: function(a) {
                            return a.getTime() < g.minDate || a.getTime() > g.maxDate;
                        },
                        onKeyDown: function(a) {
                            var b = e.$date.getTime();
                            37 === a.keyCode ? e.select(new Date(b - 864e5), !0) : 38 === a.keyCode ? e.select(new Date(b - 6048e5), !0) : 39 === a.keyCode ? e.select(new Date(b + 864e5), !0) : 40 === a.keyCode && e.select(new Date(b + 6048e5), !0);
                        }
                    }, {
                        name: "month",
                        format: "MMM",
                        split: 4,
                        steps: {
                            year: 1
                        },
                        update: function(a) {
                            this.built && a.getFullYear() === l.year ? a.getMonth() !== l.month && (angular.extend(l, {
                                month: e.$date.getMonth(),
                                date: e.$date.getDate()
                            }), e.$updateSelected()) : (angular.extend(l, {
                                year: e.$date.getFullYear(),
                                month: e.$date.getMonth(),
                                date: e.$date.getDate()
                            }), e.$build());
                        },
                        build: function() {
                            for (var b, c = (new Date(l.year, 0, 1), []), g = 0; 12 > g; g++) b = new Date(l.year, g, 1), 
                            c.push({
                                date: b,
                                label: d(b, this.format),
                                selected: e.$isSelected(b),
                                disabled: this.isDisabled(b)
                            });
                            f.title = d(b, "yyyy"), f.labels = !1, f.rows = a(c, this.split), this.built = !0;
                        },
                        isSelected: function(a) {
                            return e.$date && a.getFullYear() === e.$date.getFullYear() && a.getMonth() === e.$date.getMonth();
                        },
                        isDisabled: function(a) {
                            var b = +new Date(a.getFullYear(), a.getMonth() + 1, 0);
                            return b < g.minDate || a.getTime() > g.maxDate;
                        },
                        onKeyDown: function(a) {
                            var b = e.$date.getMonth();
                            37 === a.keyCode ? e.select(e.$date.setMonth(b - 1), !0) : 38 === a.keyCode ? e.select(e.$date.setMonth(b - 4), !0) : 39 === a.keyCode ? e.select(e.$date.setMonth(b + 1), !0) : 40 === a.keyCode && e.select(e.$date.setMonth(b + 4), !0);
                        }
                    }, {
                        name: "year",
                        format: "yyyy",
                        split: 4,
                        steps: {
                            year: 12
                        },
                        update: function(a, b) {
                            !this.built || b || parseInt(a.getFullYear() / 20, 10) !== parseInt(l.year / 20, 10) ? (angular.extend(l, {
                                year: e.$date.getFullYear(),
                                month: e.$date.getMonth(),
                                date: e.$date.getDate()
                            }), e.$build()) : a.getFullYear() !== l.year && (angular.extend(l, {
                                year: e.$date.getFullYear(),
                                month: e.$date.getMonth(),
                                date: e.$date.getDate()
                            }), e.$updateSelected());
                        },
                        build: function() {
                            for (var b, c = l.year - l.year % (3 * this.split), g = [], h = 0; 12 > h; h++) b = new Date(c + h, 0, 1), 
                            g.push({
                                date: b,
                                label: d(b, this.format),
                                selected: e.$isSelected(b),
                                disabled: this.isDisabled(b)
                            });
                            f.title = g[0].label + "-" + g[g.length - 1].label, f.labels = !1, f.rows = a(g, this.split), 
                            this.built = !0;
                        },
                        isSelected: function(a) {
                            return e.$date && a.getFullYear() === e.$date.getFullYear();
                        },
                        isDisabled: function(a) {
                            var b = +new Date(a.getFullYear() + 1, 0, 0);
                            return b < g.minDate || a.getTime() > g.maxDate;
                        },
                        onKeyDown: function(a) {
                            var b = e.$date.getFullYear();
                            37 === a.keyCode ? e.select(e.$date.setYear(b - 1), !0) : 38 === a.keyCode ? e.select(e.$date.setYear(b - 4), !0) : 39 === a.keyCode ? e.select(e.$date.setYear(b + 1), !0) : 40 === a.keyCode && e.select(e.$date.setYear(b + 4), !0);
                        }
                    } ]);
                    return {
                        views: g.minView ? Array.prototype.slice.call(m, g.minView) : m,
                        viewDate: l
                    };
                };
            } ];
        }), angular.module("mgcrea.ngStrap.dropdown", [ "mgcrea.ngStrap.tooltip" ]).provider("$dropdown", function() {
            var a = this.defaults = {
                animation: "am-fade",
                prefixClass: "dropdown",
                placement: "bottom-left",
                template: "dropdown/dropdown.tpl.html",
                trigger: "click",
                container: !1,
                keyboard: !0,
                html: !1,
                delay: 0
            };
            this.$get = [ "$window", "$tooltip", function(b, c) {
                function d(b, d) {
                    function g(a) {
                        return a.target !== b[0] ? a.target !== b[0] && h.hide() : void 0;
                    }
                    var h = {}, i = angular.extend({}, a, d);
                    h = c(b, i), h.$onKeyDown = function(a) {
                        if (/(38|40)/.test(a.keyCode)) {
                            a.preventDefault(), a.stopPropagation();
                            var b = angular.element(h.$element[0].querySelectorAll("li:not(.divider) a"));
                            if (b.length) {
                                var c;
                                angular.forEach(b, function(a, b) {
                                    f && f.call(a, ":focus") && (c = b);
                                }), 38 === a.keyCode && c > 0 ? c-- : 40 === a.keyCode && c < b.length - 1 ? c++ : angular.isUndefined(c) && (c = 0), 
                                b.eq(c)[0].focus();
                            }
                        }
                    };
                    var j = h.show;
                    h.show = function() {
                        j(), setTimeout(function() {
                            i.keyboard && h.$element.on("keydown", h.$onKeyDown), e.on("click", g);
                        });
                    };
                    var k = h.hide;
                    return h.hide = function() {
                        i.keyboard && h.$element.off("keydown", h.$onKeyDown), e.off("click", g), k();
                    }, h;
                }
                var e = angular.element(b.document.body), f = Element.prototype.matchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector;
                return d;
            } ];
        }).directive("bsDropdown", [ "$window", "$location", "$sce", "$dropdown", function(a, b, c, d) {
            return {
                restrict: "EAC",
                scope: !0,
                link: function(a, b, c) {
                    var e = {
                        scope: a
                    };
                    angular.forEach([ "placement", "container", "delay", "trigger", "keyboard", "html", "animation", "template" ], function(a) {
                        angular.isDefined(c[a]) && (e[a] = c[a]);
                    }), c.bsDropdown && a.$watch(c.bsDropdown, function(b) {
                        a.content = b;
                    }, !0);
                    var f = d(b, e);
                    a.$on("$destroy", function() {
                        f.destroy(), e = null, f = null;
                    });
                }
            };
        } ]), angular.module("mgcrea.ngStrap.helpers.dateParser", []).provider("$dateParser", [ "$localeProvider", function() {
            var a = Date.prototype, b = this.defaults = {
                format: "shortDate",
                strict: !1
            };
            this.$get = [ "$locale", function(c) {
                var d = function(d) {
                    function e(a) {
                        var b, c = Object.keys(m), d = [], e = [], f = a;
                        for (b = 0; b < c.length; b++) if (a.split(c[b]).length > 1) {
                            var g = f.search(c[b]);
                            a = a.split(c[b]).join(""), m[c[b]] && (d[g] = m[c[b]]);
                        }
                        return angular.forEach(d, function(a) {
                            e.push(a);
                        }), e;
                    }
                    function f(a) {
                        return a.replace(/\//g, "[\\/]").replace("/-/g", "[-]").replace(/\./g, "[.]").replace(/\\s/g, "[\\s]");
                    }
                    function g(a) {
                        var b, c = Object.keys(l), d = a;
                        for (b = 0; b < c.length; b++) d = d.split(c[b]).join("${" + b + "}");
                        for (b = 0; b < c.length; b++) d = d.split("${" + b + "}").join("(" + l[c[b]] + ")");
                        return a = f(a), new RegExp("^" + d + "$", [ "i" ]);
                    }
                    var h, i, j = angular.extend({}, b, d), k = {}, l = {
                        sss: "[0-9]{3}",
                        ss: "[0-5][0-9]",
                        s: j.strict ? "[1-5]?[0-9]" : "[0-5][0-9]",
                        mm: "[0-5][0-9]",
                        m: j.strict ? "[1-5]?[0-9]" : "[0-5][0-9]",
                        HH: "[01][0-9]|2[0-3]",
                        H: j.strict ? "[0][1-9]|[1][012]" : "[01][0-9]|2[0-3]",
                        hh: "[0][1-9]|[1][012]",
                        h: j.strict ? "[1-9]|[1][012]" : "[0]?[1-9]|[1][012]",
                        a: "AM|PM",
                        EEEE: c.DATETIME_FORMATS.DAY.join("|"),
                        EEE: c.DATETIME_FORMATS.SHORTDAY.join("|"),
                        dd: "[0-2][0-9]{1}|[3][01]{1}",
                        d: j.strict ? "[1-2]?[0-9]{1}|[3][01]{1}" : "[0-2][0-9]{1}|[3][01]{1}",
                        MMMM: c.DATETIME_FORMATS.MONTH.join("|"),
                        MMM: c.DATETIME_FORMATS.SHORTMONTH.join("|"),
                        MM: "[0][1-9]|[1][012]",
                        M: j.strict ? "[1-9]|[1][012]" : "[0][1-9]|[1][012]",
                        yyyy: "(?:(?:[1]{1}[0-9]{1}[0-9]{1}[0-9]{1})|(?:[2]{1}[0-9]{3}))(?![[0-9]])",
                        yy: "(?:(?:[0-9]{1}[0-9]{1}))(?![[0-9]])"
                    }, m = {
                        sss: a.setMilliseconds,
                        ss: a.setSeconds,
                        s: a.setSeconds,
                        mm: a.setMinutes,
                        m: a.setMinutes,
                        HH: a.setHours,
                        H: a.setHours,
                        hh: a.setHours,
                        h: a.setHours,
                        dd: a.setDate,
                        d: a.setDate,
                        a: function(a) {
                            var b = this.getHours();
                            return this.setHours(a.match(/pm/i) ? b + 12 : b);
                        },
                        MMMM: function(a) {
                            return this.setMonth(c.DATETIME_FORMATS.MONTH.indexOf(a));
                        },
                        MMM: function(a) {
                            return this.setMonth(c.DATETIME_FORMATS.SHORTMONTH.indexOf(a));
                        },
                        MM: function(a) {
                            return this.setMonth(1 * a - 1);
                        },
                        M: function(a) {
                            return this.setMonth(1 * a - 1);
                        },
                        yyyy: a.setFullYear,
                        yy: function(a) {
                            return this.setFullYear(2e3 + 1 * a);
                        },
                        y: a.setFullYear
                    };
                    return k.init = function() {
                        k.$format = c.DATETIME_FORMATS[j.format] || j.format, h = g(k.$format), i = e(k.$format);
                    }, k.isValid = function(a) {
                        return angular.isDate(a) ? !isNaN(a.getTime()) : h.test(a);
                    }, k.parse = function(a, b) {
                        if (angular.isDate(a)) return a;
                        var c = h.exec(a);
                        if (!c) return !1;
                        for (var d = b || new Date(0), e = 0; e < c.length - 1; e++) i[e] && i[e].call(d, c[e + 1]);
                        return d;
                    }, k.init(), k;
                };
                return d;
            } ];
        } ]), angular.module("mgcrea.ngStrap.helpers.debounce", []).constant("debounce", function(a, b, c) {
            var d, e, f, g, h;
            return function() {
                f = this, e = arguments, g = new Date();
                var i = function() {
                    var j = new Date() - g;
                    b > j ? d = setTimeout(i, b - j) : (d = null, c || (h = a.apply(f, e)));
                }, j = c && !d;
                return d || (d = setTimeout(i, b)), j && (h = a.apply(f, e)), h;
            };
        }).constant("throttle", function(a, b, c) {
            var d, e, f, g = null, h = 0;
            c || (c = {});
            var i = function() {
                h = c.leading === !1 ? 0 : new Date(), g = null, f = a.apply(d, e);
            };
            return function() {
                var j = new Date();
                h || c.leading !== !1 || (h = j);
                var k = b - (j - h);
                return d = this, e = arguments, 0 >= k ? (clearTimeout(g), g = null, h = j, f = a.apply(d, e)) : g || c.trailing === !1 || (g = setTimeout(i, k)), 
                f;
            };
        }), angular.module("mgcrea.ngStrap.helpers.dimensions", []).factory("dimensions", [ "$document", "$window", function() {
            var b = (angular.element, {}), c = b.nodeName = function(a, b) {
                return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase();
            };
            b.css = function(b, c, d) {
                var e;
                return e = b.currentStyle ? b.currentStyle[c] : a.getComputedStyle ? a.getComputedStyle(b)[c] : b.style[c], 
                d === !0 ? parseFloat(e) || 0 : e;
            }, b.offset = function(b) {
                var c = b.getBoundingClientRect(), d = b.ownerDocument;
                return {
                    width: b.offsetWidth,
                    height: b.offsetHeight,
                    top: c.top + (a.pageYOffset || d.documentElement.scrollTop) - (d.documentElement.clientTop || 0),
                    left: c.left + (a.pageXOffset || d.documentElement.scrollLeft) - (d.documentElement.clientLeft || 0)
                };
            }, b.position = function(a) {
                var e, f, g = {
                    top: 0,
                    left: 0
                };
                return "fixed" === b.css(a, "position") ? f = a.getBoundingClientRect() : (e = d(a), 
                f = b.offset(a), f = b.offset(a), c(e, "html") || (g = b.offset(e)), g.top += b.css(e, "borderTopWidth", !0), 
                g.left += b.css(e, "borderLeftWidth", !0)), {
                    width: a.offsetWidth,
                    height: a.offsetHeight,
                    top: f.top - g.top - b.css(a, "marginTop", !0),
                    left: f.left - g.left - b.css(a, "marginLeft", !0)
                };
            };
            var d = function(a) {
                var d = a.ownerDocument, e = a.offsetParent || d;
                if (c(e, "#document")) return d.documentElement;
                for (;e && !c(e, "html") && "static" === b.css(e, "position"); ) e = e.offsetParent;
                return e || d.documentElement;
            };
            return b.height = function(a, c) {
                var d = a.offsetHeight;
                return c ? d += b.css(a, "marginTop", !0) + b.css(a, "marginBottom", !0) : d -= b.css(a, "paddingTop", !0) + b.css(a, "paddingBottom", !0) + b.css(a, "borderTopWidth", !0) + b.css(a, "borderBottomWidth", !0), 
                d;
            }, b.width = function(a, c) {
                var d = a.offsetWidth;
                return c ? d += b.css(a, "marginLeft", !0) + b.css(a, "marginRight", !0) : d -= b.css(a, "paddingLeft", !0) + b.css(a, "paddingRight", !0) + b.css(a, "borderLeftWidth", !0) + b.css(a, "borderRightWidth", !0), 
                d;
            }, b;
        } ]), angular.module("mgcrea.ngStrap.helpers.parseOptions", []).provider("$parseOptions", function() {
            var a = this.defaults = {
                regexp: /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/
            };
            this.$get = [ "$parse", "$q", function(b, c) {
                function d(d, e) {
                    function f(a) {
                        return a.map(function(a, b) {
                            var c, d, e = {};
                            return e[k] = a, c = j(e), d = n(e) || b, {
                                label: c,
                                value: d
                            };
                        });
                    }
                    var g = {}, h = angular.extend({}, a, e);
                    g.$values = [];
                    var i, j, k, l, m, n, o;
                    return g.init = function() {
                        g.$match = i = d.match(h.regexp), j = b(i[2] || i[1]), k = i[4] || i[6], l = i[5], 
                        m = b(i[3] || ""), n = b(i[2] ? i[1] : k), o = b(i[7]);
                    }, g.valuesFn = function(a, b) {
                        return c.when(o(a, b)).then(function(a) {
                            return g.$values = a ? f(a) : {}, g.$values;
                        });
                    }, g.init(), g;
                }
                return d;
            } ];
        }), angular.module("mgcrea.ngStrap.modal", [ "mgcrea.ngStrap.helpers.dimensions" ]).provider("$modal", function() {
            var a = this.defaults = {
                animation: "am-fade",
                backdropAnimation: "am-fade",
                prefixClass: "modal",
                placement: "top",
                template: "modal/modal.tpl.html",
                contentTemplate: !1,
                container: !1,
                element: null,
                backdrop: !0,
                keyboard: !0,
                html: !1,
                show: !0
            };
            this.$get = [ "$window", "$rootScope", "$compile", "$q", "$templateCache", "$http", "$animate", "$timeout", "dimensions", function(c, d, e, f, g, h, i) {
                function j(b) {
                    function c(a) {
                        a.target === a.currentTarget && ("static" === g.backdrop ? f.focus() : f.hide());
                    }
                    var f = {}, g = angular.extend({}, a, b);
                    f.$promise = l(g.template);
                    var h = f.$scope = g.scope && g.scope.$new() || d.$new();
                    g.element || g.container || (g.container = "body"), g.scope || m([ "title", "content" ], function(a) {
                        g[a] && (h[a] = g[a]);
                    }), h.$hide = function() {
                        h.$$postDigest(function() {
                            f.hide();
                        });
                    }, h.$show = function() {
                        h.$$postDigest(function() {
                            f.show();
                        });
                    }, h.$toggle = function() {
                        h.$$postDigest(function() {
                            f.toggle();
                        });
                    }, g.contentTemplate && (f.$promise = f.$promise.then(function(a) {
                        var c = angular.element(a);
                        return l(g.contentTemplate).then(function(a) {
                            var d = k('[ng-bind="content"]', c[0]).removeAttr("ng-bind").html(a);
                            return b.template || d.next().remove(), c[0].outerHTML;
                        });
                    }));
                    var j, r, s = angular.element('<div class="' + g.prefixClass + '-backdrop"/>');
                    return f.$promise.then(function(a) {
                        angular.isObject(a) && (a = a.data), g.html && (a = a.replace(q, 'ng-bind-html="')), 
                        a = n.apply(a), j = e(a), f.init();
                    }), f.init = function() {
                        g.show && h.$$postDigest(function() {
                            f.show();
                        });
                    }, f.destroy = function() {
                        r && (r.remove(), r = null), s && (s.remove(), s = null), h.$destroy();
                    }, f.show = function() {
                        var a = g.container ? k(g.container) : null, b = g.container ? null : g.element;
                        r = f.$element = j(h, function() {}), r.css({
                            display: "block"
                        }).addClass(g.placement), g.animation && (g.backdrop && s.addClass(g.backdropAnimation), 
                        r.addClass(g.animation)), g.backdrop && i.enter(s, p, null, function() {}), i.enter(r, a, b, function() {}), 
                        h.$isShown = !0, h.$$phase || h.$digest();
                        var d = r[0];
                        o(function() {
                            d.focus();
                        }), p.addClass(g.prefixClass + "-open"), g.backdrop && (r.on("click", c), s.on("click", c)), 
                        g.keyboard && r.on("keyup", f.$onKeyUp);
                    }, f.hide = function() {
                        i.leave(r, function() {
                            p.removeClass(g.prefixClass + "-open");
                        }), g.backdrop && i.leave(s, function() {}), h.$isShown = !1, h.$$phase || h.$digest(), 
                        g.backdrop && (r.off("click", c), s.off("click", c)), g.keyboard && r.off("keyup", f.$onKeyUp);
                    }, f.toggle = function() {
                        h.$isShown ? f.hide() : f.show();
                    }, f.focus = function() {
                        r[0].focus();
                    }, f.$onKeyUp = function(a) {
                        27 === a.which && f.hide();
                    }, f;
                }
                function k(a, c) {
                    return angular.element((c || b).querySelectorAll(a));
                }
                function l(a) {
                    return f.when(g.get(a) || h.get(a)).then(function(b) {
                        return angular.isObject(b) ? (g.put(a, b.data), b.data) : b;
                    });
                }
                var m = angular.forEach, n = String.prototype.trim, o = c.requestAnimationFrame || c.setTimeout, p = angular.element(c.document.body), q = /ng-bind="/gi;
                return j;
            } ];
        }).directive("bsModal", [ "$window", "$location", "$sce", "$modal", function(a, b, c, d) {
            return {
                restrict: "EAC",
                scope: !0,
                link: function(a, b, e) {
                    var f = {
                        scope: a,
                        element: b,
                        show: !1
                    };
                    angular.forEach([ "template", "contentTemplate", "placement", "backdrop", "keyboard", "html", "container", "animation" ], function(a) {
                        angular.isDefined(e[a]) && (f[a] = e[a]);
                    }), angular.forEach([ "title", "content" ], function(b) {
                        e[b] && e.$observe(b, function(d) {
                            a[b] = c.getTrustedHtml(d);
                        });
                    }), e.bsModal && a.$watch(e.bsModal, function(b) {
                        angular.isObject(b) ? angular.extend(a, b) : a.content = b;
                    }, !0);
                    var g = d(f);
                    b.on(e.trigger || "click", g.toggle), a.$on("$destroy", function() {
                        g.destroy(), f = null, g = null;
                    });
                }
            };
        } ]), angular.module("mgcrea.ngStrap.navbar", []).provider("$navbar", function() {
            var a = this.defaults = {
                activeClass: "active",
                routeAttr: "data-match-route"
            };
            this.$get = function() {
                return {
                    defaults: a
                };
            };
        }).directive("bsNavbar", [ "$window", "$location", "$navbar", function(a, b, c) {
            var d = c.defaults;
            return {
                restrict: "A",
                link: function(a, c, e) {
                    var f = d;
                    angular.forEach(Object.keys(d), function(a) {
                        angular.isDefined(e[a]) && (f[a] = e[a]);
                    }), a.$watch(function() {
                        return b.path();
                    }, function(a) {
                        var b = c[0].querySelectorAll("li[" + f.routeAttr + "]");
                        angular.forEach(b, function(b) {
                            var c = angular.element(b), d = c.attr(f.routeAttr), e = new RegExp("^" + d.replace("/", "\\/") + "$", [ "i" ]);
                            e.test(a) ? c.addClass(f.activeClass) : c.removeClass(f.activeClass);
                        });
                    });
                }
            };
        } ]), angular.module("mgcrea.ngStrap.popover", [ "mgcrea.ngStrap.tooltip" ]).provider("$popover", function() {
            var a = this.defaults = {
                animation: "am-fade",
                placement: "right",
                template: "popover/popover.tpl.html",
                contentTemplate: !1,
                trigger: "click",
                keyboard: !0,
                html: !1,
                title: "",
                content: "",
                delay: 0,
                container: !1
            };
            this.$get = [ "$tooltip", function(b) {
                function c(c, d) {
                    var e = angular.extend({}, a, d), f = b(c, e);
                    return e.content && (f.$scope.content = e.content), f;
                }
                return c;
            } ];
        }).directive("bsPopover", [ "$window", "$location", "$sce", "$popover", function(a, b, c, d) {
            var e = a.requestAnimationFrame || a.setTimeout;
            return {
                restrict: "EAC",
                scope: !0,
                link: function(a, b, f) {
                    var g = {
                        scope: a
                    };
                    angular.forEach([ "template", "contentTemplate", "placement", "container", "delay", "trigger", "keyboard", "html", "animation" ], function(a) {
                        angular.isDefined(f[a]) && (g[a] = f[a]);
                    }), angular.forEach([ "title", "content" ], function(b) {
                        f[b] && f.$observe(b, function(d, f) {
                            a[b] = c.getTrustedHtml(d), angular.isDefined(f) && e(function() {
                                h && h.$applyPlacement();
                            });
                        });
                    }), f.bsPopover && a.$watch(f.bsPopover, function(b, c) {
                        angular.isObject(b) ? angular.extend(a, b) : a.content = b, angular.isDefined(c) && e(function() {
                            h && h.$applyPlacement();
                        });
                    }, !0);
                    var h = d(b, g);
                    a.$on("$destroy", function() {
                        h.destroy(), g = null, h = null;
                    });
                }
            };
        } ]), angular.module("mgcrea.ngStrap.scrollspy", [ "mgcrea.ngStrap.helpers.debounce", "mgcrea.ngStrap.helpers.dimensions" ]).provider("$scrollspy", function() {
            var a = this.$$spies = {}, c = this.defaults = {
                debounce: 150,
                throttle: 100,
                offset: 100
            };
            this.$get = [ "$window", "$document", "$rootScope", "dimensions", "debounce", "throttle", function(d, e, f, g, h, i) {
                function j(a, b) {
                    return a[0].nodeName && a[0].nodeName.toLowerCase() === b.toLowerCase();
                }
                function k(e) {
                    var k = angular.extend({}, c, e);
                    k.element || (k.element = n);
                    var o = j(k.element, "body"), p = o ? l : k.element, q = o ? "window" : k.id;
                    if (a[q]) return a[q].$$count++, a[q];
                    var r, s, t, u, v, w, x = {}, y = x.$trackedElements = [], z = [];
                    return x.init = function() {
                        this.$$count = 1, s = h(this.checkPosition, k.debounce), t = i(this.checkPosition, k.throttle), 
                        p.on("click", this.checkPositionWithEventLoop), l.on("resize", s), p.on("scroll", t), 
                        u = h(this.checkOffsets, k.debounce), f.$on("$viewContentLoaded", u), f.$on("$includeContentLoaded", u), 
                        u(), q && (a[q] = x);
                    }, x.destroy = function() {
                        this.$$count--, this.$$count > 0 || (p.off("click", this.checkPositionWithEventLoop), 
                        l.off("resize", s), p.off("scroll", s), f.$off("$viewContentLoaded", u), f.$off("$includeContentLoaded", u));
                    }, x.checkPosition = function() {
                        if (z.length) {
                            if (w = (o ? d.pageYOffset : p.prop("scrollTop")) || 0, v = Math.max(d.innerHeight, m.prop("clientHeight")), 
                            w < z[0].offsetTop && r !== z[0].target) return x.$activateElement(z[0]);
                            for (var a = z.length; a--; ) if (!angular.isUndefined(z[a].offsetTop) && null !== z[a].offsetTop && r !== z[a].target && !(w < z[a].offsetTop || z[a + 1] && w > z[a + 1].offsetTop)) return x.$activateElement(z[a]);
                        }
                    }, x.checkPositionWithEventLoop = function() {
                        setTimeout(this.checkPosition, 1);
                    }, x.$activateElement = function(a) {
                        if (r) {
                            var b = x.$getTrackedElement(r);
                            b && (b.source.removeClass("active"), j(b.source, "li") && j(b.source.parent().parent(), "li") && b.source.parent().parent().removeClass("active"));
                        }
                        r = a.target, a.source.addClass("active"), j(a.source, "li") && j(a.source.parent().parent(), "li") && a.source.parent().parent().addClass("active");
                    }, x.$getTrackedElement = function(a) {
                        return y.filter(function(b) {
                            return b.target === a;
                        })[0];
                    }, x.checkOffsets = function() {
                        angular.forEach(y, function(a) {
                            var c = b.querySelector(a.target);
                            a.offsetTop = c ? g.offset(c).top : null, k.offset && null !== a.offsetTop && (a.offsetTop -= 1 * k.offset);
                        }), z = y.filter(function(a) {
                            return null !== a.offsetTop;
                        }).sort(function(a, b) {
                            return a.offsetTop - b.offsetTop;
                        }), s();
                    }, x.trackElement = function(a, b) {
                        y.push({
                            target: a,
                            source: b
                        });
                    }, x.untrackElement = function(a, b) {
                        for (var c, d = y.length; d--; ) if (y[d].target === a && y[d].source === b) {
                            c = d;
                            break;
                        }
                        y = y.splice(c, 1);
                    }, x.activate = function(a) {
                        y[a].addClass("active");
                    }, x.init(), x;
                }
                var l = angular.element(d), m = angular.element(e.prop("documentElement")), n = angular.element(d.document.body);
                return k;
            } ];
        }).directive("bsScrollspy", [ "$rootScope", "debounce", "dimensions", "$scrollspy", function(a, b, c, d) {
            return {
                restrict: "EAC",
                link: function(a, b, c) {
                    var e = {
                        scope: a
                    };
                    angular.forEach([ "offset", "target" ], function(a) {
                        angular.isDefined(c[a]) && (e[a] = c[a]);
                    });
                    var f = d(e);
                    f.trackElement(e.target, b), a.$on("$destroy", function() {
                        f.untrackElement(e.target, b), f.destroy(), e = null, f = null;
                    });
                }
            };
        } ]).directive("bsScrollspyList", [ "$rootScope", "debounce", "dimensions", "$scrollspy", function() {
            return {
                restrict: "A",
                compile: function(a) {
                    var b = a[0].querySelectorAll("li > a[href]");
                    angular.forEach(b, function(a) {
                        var b = angular.element(a);
                        b.parent().attr("bs-scrollspy", "").attr("data-target", b.attr("href"));
                    });
                }
            };
        } ]), angular.module("mgcrea.ngStrap.select", [ "mgcrea.ngStrap.tooltip", "mgcrea.ngStrap.helpers.parseOptions" ]).provider("$select", function() {
            var a = this.defaults = {
                animation: "am-fade",
                prefixClass: "select",
                placement: "bottom-left",
                template: "select/select.tpl.html",
                trigger: "focus",
                container: !1,
                keyboard: !0,
                html: !1,
                delay: 0,
                multiple: !1,
                sort: !0,
                caretHtml: '&nbsp;<span class="caret"></span>',
                placeholder: "Choose among the following..."
            };
            this.$get = [ "$window", "$document", "$rootScope", "$tooltip", function(b, c, d, e) {
                function f(b, c, d) {
                    var f = {}, h = angular.extend({}, a, d);
                    f = e(b, h);
                    var i = d.scope, j = f.$scope;
                    j.$matches = [], j.$activeIndex = 0, j.$isMultiple = h.multiple, j.$activate = function(a) {
                        j.$$postDigest(function() {
                            f.activate(a);
                        });
                    }, j.$select = function(a) {
                        j.$$postDigest(function() {
                            f.select(a);
                        });
                    }, j.$isVisible = function() {
                        return f.$isVisible();
                    }, j.$isActive = function(a) {
                        return f.$isActive(a);
                    }, f.update = function(a) {
                        j.$matches = a, f.$updateActiveIndex();
                    }, f.activate = function(a) {
                        return h.multiple ? (j.$activeIndex.sort(), f.$isActive(a) ? j.$activeIndex.splice(j.$activeIndex.indexOf(a), 1) : j.$activeIndex.push(a), 
                        h.sort && j.$activeIndex.sort()) : j.$activeIndex = a, j.$activeIndex;
                    }, f.select = function(a) {
                        var d = j.$matches[a].value;
                        f.activate(a), c.$setViewValue(h.multiple ? j.$activeIndex.map(function(a) {
                            return j.$matches[a].value;
                        }) : d), c.$render(), i && i.$digest(), h.multiple || ("focus" === h.trigger ? b[0].blur() : f.$isShown && f.hide()), 
                        j.$emit("$select.select", d, a);
                    }, f.$updateActiveIndex = function() {
                        c.$modelValue && j.$matches.length ? j.$activeIndex = h.multiple && angular.isArray(c.$modelValue) ? c.$modelValue.map(function(a) {
                            return f.$getIndex(a);
                        }) : f.$getIndex(c.$modelValue) : j.$activeIndex >= j.$matches.length && (j.$activeIndex = h.multiple ? [] : 0);
                    }, f.$isVisible = function() {
                        return h.minLength && c ? j.$matches.length && c.$viewValue.length >= h.minLength : j.$matches.length;
                    }, f.$isActive = function(a) {
                        return h.multiple ? -1 !== j.$activeIndex.indexOf(a) : j.$activeIndex === a;
                    }, f.$getIndex = function(a) {
                        var b = j.$matches.length, c = b;
                        if (b) {
                            for (c = b; c-- && j.$matches[c].value !== a; ) ;
                            if (!(0 > c)) return c;
                        }
                    }, f.$onElementMouseDown = function(a) {
                        a.preventDefault(), a.stopPropagation(), f.$isShown ? b[0].blur() : b[0].focus();
                    }, f.$onMouseDown = function(a) {
                        if (a.preventDefault(), a.stopPropagation(), g) {
                            var b = angular.element(a.target);
                            b.triggerHandler("click");
                        }
                    }, f.$onKeyDown = function(a) {
                        if (/(38|40|13)/.test(a.keyCode)) {
                            if (a.preventDefault(), a.stopPropagation(), 13 === a.keyCode) return f.select(j.$activeIndex);
                            38 === a.keyCode && j.$activeIndex > 0 ? j.$activeIndex-- : 40 === a.keyCode && j.$activeIndex < j.$matches.length - 1 ? j.$activeIndex++ : angular.isUndefined(j.$activeIndex) && (j.$activeIndex = 0), 
                            j.$digest();
                        }
                    };
                    var k = f.init;
                    f.init = function() {
                        k(), b.on(g ? "touchstart" : "mousedown", f.$onElementMouseDown);
                    };
                    var l = f.destroy;
                    f.destroy = function() {
                        l(), b.off(g ? "touchstart" : "mousedown", f.$onElementMouseDown);
                    };
                    var m = f.show;
                    f.show = function() {
                        m(), h.multiple && f.$element.addClass("select-multiple"), setTimeout(function() {
                            f.$element.on(g ? "touchstart" : "mousedown", f.$onMouseDown), h.keyboard && b.on("keydown", f.$onKeyDown);
                        });
                    };
                    var n = f.hide;
                    return f.hide = function() {
                        f.$element.off(g ? "touchstart" : "mousedown", f.$onMouseDown), h.keyboard && b.off("keydown", f.$onKeyDown), 
                        n();
                    }, f;
                }
                var g = (angular.element(b.document.body), "createTouch" in b.document);
                return f.defaults = a, f;
            } ];
        }).directive("bsSelect", [ "$window", "$parse", "$q", "$select", "$parseOptions", function(a, b, c, d, e) {
            var f = d.defaults;
            return {
                restrict: "EAC",
                require: "ngModel",
                link: function(a, b, c, g) {
                    var h = {
                        scope: a
                    };
                    if (angular.forEach([ "placement", "container", "delay", "trigger", "keyboard", "html", "animation", "template", "placeholder", "multiple" ], function(a) {
                        angular.isDefined(c[a]) && (h[a] = c[a]);
                    }), "select" === b[0].nodeName.toLowerCase()) {
                        var i = b;
                        i.css("display", "none"), b = angular.element('<button type="button" class="btn btn-default"></button>'), 
                        i.after(b);
                    }
                    var j = e(c.ngOptions), k = d(b, g, h), l = j.$match[7].replace(/\|.+/, "").trim();
                    a.$watch(l, function() {
                        j.valuesFn(a, g).then(function(a) {
                            k.update(a), g.$render();
                        });
                    }, !0), a.$watch(c.ngModel, function() {
                        k.$updateActiveIndex();
                    }, !0), g.$render = function() {
                        var a, d;
                        h.multiple && angular.isArray(g.$modelValue) ? a = g.$modelValue.map(function(a) {
                            return d = k.$getIndex(a), angular.isDefined(d) ? k.$scope.$matches[d].label : !1;
                        }).filter(angular.isDefined).join(", ") : (d = k.$getIndex(g.$modelValue), a = angular.isDefined(d) ? k.$scope.$matches[d].label : !1), 
                        b.html((a ? a : c.placeholder || f.placeholder) + f.caretHtml);
                    }, a.$on("$destroy", function() {
                        k.destroy(), h = null, k = null;
                    });
                }
            };
        } ]), angular.module("mgcrea.ngStrap.tab", []).run([ "$templateCache", function(a) {
            a.put("$pane", "{{pane.content}}");
        } ]).provider("$tab", function() {
            var a = this.defaults = {
                animation: "am-fade",
                template: "tab/tab.tpl.html"
            };
            this.$get = function() {
                return {
                    defaults: a
                };
            };
        }).directive("bsTabs", [ "$window", "$animate", "$tab", function(a, b, c) {
            var d = c.defaults;
            return {
                restrict: "EAC",
                scope: !0,
                require: "?ngModel",
                templateUrl: function(a, b) {
                    return b.template || d.template;
                },
                link: function(a, b, c, e) {
                    var f = d;
                    angular.forEach([ "animation" ], function(a) {
                        angular.isDefined(c[a]) && (f[a] = c[a]);
                    }), c.bsTabs && a.$watch(c.bsTabs, function(b) {
                        a.panes = b;
                    }, !0), b.addClass("tabs"), f.animation && b.addClass(f.animation), a.active = a.activePane = 0, 
                    a.setActive = function(b) {
                        a.active = b, e && e.$setViewValue(b);
                    }, e && (e.$render = function() {
                        a.active = 1 * e.$modelValue;
                    });
                }
            };
        } ]), angular.module("mgcrea.ngStrap.timepicker", [ "mgcrea.ngStrap.helpers.dateParser", "mgcrea.ngStrap.tooltip" ]).provider("$timepicker", function() {
            var a = this.defaults = {
                animation: "am-fade",
                prefixClass: "timepicker",
                placement: "bottom-left",
                template: "timepicker/timepicker.tpl.html",
                trigger: "focus",
                container: !1,
                keyboard: !0,
                html: !1,
                delay: 0,
                useNative: !0,
                timeType: "date",
                timeFormat: "shortTime",
                autoclose: !1,
                minTime: -1 / 0,
                maxTime: 1 / 0,
                length: 5,
                hourStep: 1,
                minuteStep: 5
            };
            this.$get = [ "$window", "$document", "$rootScope", "$sce", "$locale", "dateFilter", "$tooltip", function(b, c, d, e, f, g, h) {
                function i(b, c, d) {
                    function e(a, c) {
                        if (b[0].createTextRange) {
                            var d = b[0].createTextRange();
                            d.collapse(!0), d.moveStart("character", a), d.moveEnd("character", c), d.select();
                        } else b[0].setSelectionRange ? b[0].setSelectionRange(a, c) : angular.isUndefined(b[0].selectionStart) && (b[0].selectionStart = a, 
                        b[0].selectionEnd = c);
                    }
                    function i() {
                        b[0].focus();
                    }
                    var l = h(b, angular.extend({}, a, d)), m = d.scope, n = l.$options, o = l.$scope, p = 0, q = c.$dateValue || new Date(), r = {
                        hour: q.getHours(),
                        meridian: q.getHours() < 12,
                        minute: q.getMinutes(),
                        second: q.getSeconds(),
                        millisecond: q.getMilliseconds()
                    }, s = f.DATETIME_FORMATS[n.timeFormat] || n.timeFormat, t = /(h+)[:]?(m+)[ ]?(a?)/i.exec(s).slice(1);
                    o.$select = function(a, b) {
                        l.select(a, b);
                    }, o.$moveIndex = function(a, b) {
                        l.$moveIndex(a, b);
                    }, o.$switchMeridian = function(a) {
                        l.switchMeridian(a);
                    }, l.update = function(a) {
                        angular.isDate(a) && !isNaN(a.getTime()) ? (l.$date = a, angular.extend(r, {
                            hour: a.getHours(),
                            minute: a.getMinutes(),
                            second: a.getSeconds(),
                            millisecond: a.getMilliseconds()
                        }), l.$build()) : l.$isBuilt || l.$build();
                    }, l.select = function(a, b, d) {
                        isNaN(c.$dateValue.getTime()) && (c.$dateValue = new Date(1970, 0, 1)), angular.isDate(a) || (a = new Date(a)), 
                        0 === b ? c.$dateValue.setHours(a.getHours()) : 1 === b && c.$dateValue.setMinutes(a.getMinutes()), 
                        c.$setViewValue(c.$dateValue), c.$render(), n.autoclose && !d && l.hide(!0);
                    }, l.switchMeridian = function(a) {
                        var b = (a || c.$dateValue).getHours();
                        c.$dateValue.setHours(12 > b ? b + 12 : b - 12), c.$render();
                    }, l.$build = function() {
                        var a, b, c = o.midIndex = parseInt(n.length / 2, 10), d = [];
                        for (a = 0; a < n.length; a++) b = new Date(1970, 0, 1, r.hour - (c - a) * n.hourStep), 
                        d.push({
                            date: b,
                            label: g(b, t[0]),
                            selected: l.$date && l.$isSelected(b, 0),
                            disabled: l.$isDisabled(b, 0)
                        });
                        var e, f = [];
                        for (a = 0; a < n.length; a++) e = new Date(1970, 0, 1, 0, r.minute - (c - a) * n.minuteStep), 
                        f.push({
                            date: e,
                            label: g(e, t[1]),
                            selected: l.$date && l.$isSelected(e, 1),
                            disabled: l.$isDisabled(e, 1)
                        });
                        var h = [];
                        for (a = 0; a < n.length; a++) h.push([ d[a], f[a] ]);
                        o.rows = h, o.showAM = !!t[2], o.isAM = (l.$date || d[c].date).getHours() < 12, 
                        l.$isBuilt = !0;
                    }, l.$isSelected = function(a, b) {
                        return l.$date ? 0 === b ? a.getHours() === l.$date.getHours() : 1 === b ? a.getMinutes() === l.$date.getMinutes() : void 0 : !1;
                    }, l.$isDisabled = function(a, b) {
                        var c;
                        return 0 === b ? c = a.getTime() + 6e4 * r.minute : 1 === b && (c = a.getTime() + 36e5 * r.hour), 
                        c < n.minTime || c > n.maxTime;
                    }, l.$moveIndex = function(a, b) {
                        var c;
                        0 === b ? (c = new Date(1970, 0, 1, r.hour + a * n.length, r.minute), angular.extend(r, {
                            hour: c.getHours()
                        })) : 1 === b && (c = new Date(1970, 0, 1, r.hour, r.minute + a * n.length * 5), 
                        angular.extend(r, {
                            minute: c.getMinutes()
                        })), l.$build();
                    }, l.$onMouseDown = function(a) {
                        if ("input" !== a.target.nodeName.toLowerCase() && a.preventDefault(), a.stopPropagation(), 
                        j) {
                            var b = angular.element(a.target);
                            "button" !== b[0].nodeName.toLowerCase() && (b = b.parent()), b.triggerHandler("click");
                        }
                    }, l.$onKeyDown = function(a) {
                        if (/(38|37|39|40|13)/.test(a.keyCode) && !a.shiftKey && !a.altKey) {
                            if (a.preventDefault(), a.stopPropagation(), 13 === a.keyCode) return l.hide(!0);
                            var b = new Date(l.$date), c = b.getHours(), d = g(b, "h").length, f = b.getMinutes(), h = g(b, "mm").length, i = /(37|39)/.test(a.keyCode), j = 2 + 1 * !!t[2];
                            if (i && (37 === a.keyCode ? p = 1 > p ? j - 1 : p - 1 : 39 === a.keyCode && (p = j - 1 > p ? p + 1 : 0)), 
                            0 === p) {
                                if (i) return e(0, d);
                                38 === a.keyCode ? b.setHours(c - n.hourStep) : 40 === a.keyCode && b.setHours(c + n.hourStep);
                            } else if (1 === p) {
                                if (i) return e(d + 1, d + 1 + h);
                                38 === a.keyCode ? b.setMinutes(f - n.minuteStep) : 40 === a.keyCode && b.setMinutes(f + n.minuteStep);
                            } else if (2 === p) {
                                if (i) return e(d + 1 + h + 1, d + 1 + h + 3);
                                l.switchMeridian();
                            }
                            l.select(b, p, !0), m.$digest();
                        }
                    };
                    var u = l.init;
                    l.init = function() {
                        return k && n.useNative ? (b.prop("type", "time"), void b.css("-webkit-appearance", "textfield")) : (j && (b.prop("type", "text"), 
                        b.attr("readonly", "true"), b.on("click", i)), void u());
                    };
                    var v = l.destroy;
                    l.destroy = function() {
                        k && n.useNative && b.off("click", i), v();
                    };
                    var w = l.show;
                    l.show = function() {
                        w(), setTimeout(function() {
                            l.$element.on(j ? "touchstart" : "mousedown", l.$onMouseDown), n.keyboard && b.on("keydown", l.$onKeyDown);
                        });
                    };
                    var x = l.hide;
                    return l.hide = function(a) {
                        l.$element.off(j ? "touchstart" : "mousedown", l.$onMouseDown), n.keyboard && b.off("keydown", l.$onKeyDown), 
                        x(a);
                    }, l;
                }
                var j = (angular.element(b.document.body), "createTouch" in b.document), k = /(ip(a|o)d|iphone|android)/gi.test(b.navigator.userAgent);
                return a.lang || (a.lang = f.id), i.defaults = a, i;
            } ];
        }).directive("bsTimepicker", [ "$window", "$parse", "$q", "$locale", "dateFilter", "$timepicker", "$dateParser", "$timeout", function(a, b, c, d, e, f, g) {
            var h = (f.defaults, /(ip(a|o)d|iphone|android)/gi.test(a.navigator.userAgent));
            return a.requestAnimationFrame || a.setTimeout, {
                restrict: "EAC",
                require: "ngModel",
                link: function(a, b, c, d) {
                    var i = {
                        scope: a,
                        controller: d
                    };
                    angular.forEach([ "placement", "container", "delay", "trigger", "keyboard", "html", "animation", "template", "autoclose", "timeType", "timeFormat", "useNative", "lang" ], function(a) {
                        angular.isDefined(c[a]) && (i[a] = c[a]);
                    }), h && i.useNative && (i.timeFormat = "HH:mm");
                    var j = f(b, d, i);
                    i = j.$options;
                    var k = g({
                        format: i.timeFormat,
                        lang: i.lang
                    });
                    angular.forEach([ "minTime", "maxTime" ], function(a) {
                        angular.isDefined(c[a]) && c.$observe(a, function(b) {
                            j.$options[a] = "now" === b ? new Date().setFullYear(1970, 0, 1) : angular.isString(b) && b.match(/^".+"$/) ? +new Date(b.substr(1, b.length - 2)) : k.parse(b), 
                            !isNaN(j.$options[a]) && j.$build();
                        });
                    }), a.$watch(c.ngModel, function() {
                        j.update(d.$dateValue);
                    }, !0), d.$parsers.unshift(function(a) {
                        if (!a) return void d.$setValidity("date", !0);
                        var b = k.parse(a, d.$dateValue);
                        if (!b || isNaN(b.getTime())) d.$setValidity("date", !1); else {
                            var c = b.getTime() >= i.minTime && b.getTime() <= i.maxTime;
                            d.$setValidity("date", c), c && (d.$dateValue = b);
                        }
                        return "string" === i.timeType ? e(a, i.timeFormat) : "number" === i.timeType ? d.$dateValue.getTime() : "iso" === i.timeType ? d.$dateValue.toISOString() : d.$dateValue;
                    }), d.$formatters.push(function(a) {
                        var b = angular.isDate(a) ? a : new Date(a);
                        return d.$dateValue = b, d.$dateValue;
                    }), d.$render = function() {
                        b.val(isNaN(d.$dateValue.getTime()) ? "" : e(d.$dateValue, i.timeFormat));
                    }, a.$on("$destroy", function() {
                        j.destroy(), i = null, j = null;
                    });
                }
            };
        } ]), angular.module("mgcrea.ngStrap.tooltip", [ "ngAnimate", "mgcrea.ngStrap.helpers.dimensions" ]).provider("$tooltip", function() {
            var a = this.defaults = {
                animation: "am-fade",
                prefixClass: "tooltip",
                container: !1,
                placement: "top",
                template: "tooltip/tooltip.tpl.html",
                contentTemplate: !1,
                trigger: "hover focus",
                keyboard: !1,
                html: !1,
                show: !1,
                title: "",
                type: "",
                delay: 0
            };
            this.$get = [ "$window", "$rootScope", "$compile", "$q", "$templateCache", "$http", "$animate", "$timeout", "dimensions", "$$animateReflow", function(c, d, e, f, g, h, i, j, k, l) {
                function m(b, c) {
                    function f() {
                        return "body" === j.container ? k.offset(b[0]) : k.position(b[0]);
                    }
                    function g(a, b, c, d) {
                        var e, f = a.split("-");
                        switch (f[0]) {
                          case "right":
                            e = {
                                top: b.top + b.height / 2 - d / 2,
                                left: b.left + b.width
                            };
                            break;

                          case "bottom":
                            e = {
                                top: b.top + b.height,
                                left: b.left + b.width / 2 - c / 2
                            };
                            break;

                          case "left":
                            e = {
                                top: b.top + b.height / 2 - d / 2,
                                left: b.left - c
                            };
                            break;

                          default:
                            e = {
                                top: b.top - d,
                                left: b.left + b.width / 2 - c / 2
                            };
                        }
                        if (!f[1]) return e;
                        if ("top" === f[0] || "bottom" === f[0]) switch (f[1]) {
                          case "left":
                            e.left = b.left;
                            break;

                          case "right":
                            e.left = b.left + b.width - c;
                        } else if ("left" === f[0] || "right" === f[0]) switch (f[1]) {
                          case "top":
                            e.top = b.top - d;
                            break;

                          case "bottom":
                            e.top = b.top + b.height;
                        }
                        return e;
                    }
                    var h = {}, j = h.$options = angular.extend({}, a, c);
                    h.$promise = o(j.template);
                    var m = h.$scope = j.scope && j.scope.$new() || d.$new();
                    j.delay && angular.isString(j.delay) && (j.delay = parseFloat(j.delay)), j.title && (h.$scope.title = j.title), 
                    m.$hide = function() {
                        m.$$postDigest(function() {
                            h.hide();
                        });
                    }, m.$show = function() {
                        m.$$postDigest(function() {
                            h.show();
                        });
                    }, m.$toggle = function() {
                        m.$$postDigest(function() {
                            h.toggle();
                        });
                    }, h.$isShown = !1;
                    var r, s;
                    j.contentTemplate && (h.$promise = h.$promise.then(function(a) {
                        var b = angular.element(a);
                        return o(j.contentTemplate).then(function(a) {
                            return n('[ng-bind="content"]', b[0]).removeAttr("ng-bind").html(a), b[0].outerHTML;
                        });
                    }));
                    var t, u, v, w;
                    return h.$promise.then(function(a) {
                        angular.isObject(a) && (a = a.data), j.html && (a = a.replace(q, 'ng-bind-html="')), 
                        a = p.apply(a), v = a, t = e(a), h.init();
                    }), h.init = function() {
                        j.delay && angular.isNumber(j.delay) && (j.delay = {
                            show: j.delay,
                            hide: j.delay
                        }), "self" === j.container ? w = b : j.container && (w = n(j.container));
                        var a = j.trigger.split(" ");
                        angular.forEach(a, function(a) {
                            "click" === a ? b.on("click", h.toggle) : "manual" !== a && (b.on("hover" === a ? "mouseenter" : "focus", h.enter), 
                            b.on("hover" === a ? "mouseleave" : "blur", h.leave));
                        }), j.show && m.$$postDigest(function() {
                            "focus" === j.trigger ? b[0].focus() : h.show();
                        });
                    }, h.destroy = function() {
                        for (var a = j.trigger.split(" "), c = a.length; c--; ) {
                            var d = a[c];
                            "click" === d ? b.off("click", h.toggle) : "manual" !== d && (b.off("hover" === d ? "mouseenter" : "focus", h.enter), 
                            b.off("hover" === d ? "mouseleave" : "blur", h.leave));
                        }
                        u && (u.remove(), u = null), m.$destroy();
                    }, h.enter = function() {
                        return clearTimeout(r), s = "in", j.delay && j.delay.show ? void (r = setTimeout(function() {
                            "in" === s && h.show();
                        }, j.delay.show)) : h.show();
                    }, h.show = function() {
                        var a = j.container ? w : null, c = j.container ? null : b;
                        u && u.remove(), u = h.$element = t(m, function() {}), u.css({
                            top: "0px",
                            left: "0px",
                            display: "block"
                        }).addClass(j.placement), j.animation && u.addClass(j.animation), j.type && u.addClass(j.prefixClass + "-" + j.type), 
                        i.enter(u, a, c, function() {}), h.$isShown = !0, m.$$phase || m.$digest(), l(h.$applyPlacement), 
                        j.keyboard && ("focus" !== j.trigger ? (h.focus(), u.on("keyup", h.$onKeyUp)) : b.on("keyup", h.$onFocusKeyUp));
                    }, h.leave = function() {
                        return clearTimeout(r), s = "out", j.delay && j.delay.hide ? void (r = setTimeout(function() {
                            "out" === s && h.hide();
                        }, j.delay.hide)) : h.hide();
                    }, h.hide = function(a) {
                        return h.$isShown ? (i.leave(u, function() {
                            u = null;
                        }), m.$$phase || m.$digest(), h.$isShown = !1, j.keyboard && u.off("keyup", h.$onKeyUp), 
                        a && "focus" === j.trigger ? b[0].blur() : void 0) : void 0;
                    }, h.toggle = function() {
                        h.$isShown ? h.leave() : h.enter();
                    }, h.focus = function() {
                        u[0].focus();
                    }, h.$applyPlacement = function() {
                        if (u) {
                            var a = f(), b = u.prop("offsetWidth"), c = u.prop("offsetHeight"), d = g(j.placement, a, b, c);
                            d.top += "px", d.left += "px", u.css(d);
                        }
                    }, h.$onKeyUp = function(a) {
                        27 === a.which && h.hide();
                    }, h.$onFocusKeyUp = function(a) {
                        27 === a.which && b[0].blur();
                    }, h;
                }
                function n(a, c) {
                    return angular.element((c || b).querySelectorAll(a));
                }
                function o(a) {
                    return f.when(g.get(a) || h.get(a)).then(function(b) {
                        return angular.isObject(b) ? (g.put(a, b.data), b.data) : b;
                    });
                }
                var p = String.prototype.trim, q = ("createTouch" in c.document, /ng-bind="/gi);
                return m;
            } ];
        }).directive("bsTooltip", [ "$window", "$location", "$sce", "$tooltip", "$$animateReflow", function(a, b, c, d, e) {
            return {
                restrict: "EAC",
                scope: !0,
                link: function(a, b, f) {
                    var g = {
                        scope: a
                    };
                    angular.forEach([ "template", "contentTemplate", "placement", "container", "delay", "trigger", "keyboard", "html", "animation", "type" ], function(a) {
                        angular.isDefined(f[a]) && (g[a] = f[a]);
                    }), angular.forEach([ "title" ], function(b) {
                        f[b] && f.$observe(b, function(d, f) {
                            a[b] = c.getTrustedHtml(d), angular.isDefined(f) && e(function() {
                                h && h.$applyPlacement();
                            });
                        });
                    }), f.bsTooltip && a.$watch(f.bsTooltip, function(b, c) {
                        angular.isObject(b) ? angular.extend(a, b) : a.content = b, angular.isDefined(c) && e(function() {
                            h && h.$applyPlacement();
                        });
                    }, !0);
                    var h = d(b, g);
                    a.$on("$destroy", function() {
                        h.destroy(), g = null, h = null;
                    });
                }
            };
        } ]), angular.module("mgcrea.ngStrap.typeahead", [ "mgcrea.ngStrap.tooltip", "mgcrea.ngStrap.helpers.parseOptions" ]).provider("$typeahead", function() {
            var a = this.defaults = {
                animation: "am-fade",
                prefixClass: "typeahead",
                placement: "bottom-left",
                template: "typeahead/typeahead.tpl.html",
                trigger: "focus",
                container: !1,
                keyboard: !0,
                html: !1,
                delay: 0,
                minLength: 1,
                limit: 6
            };
            this.$get = [ "$window", "$rootScope", "$tooltip", function(b, c, d) {
                function e(b, c) {
                    var e = {}, f = angular.extend({}, a, c), g = f.controller;
                    e = d(b, f);
                    var h = c.scope, i = e.$scope;
                    i.$matches = [], i.$activeIndex = 0, i.$activate = function(a) {
                        i.$$postDigest(function() {
                            e.activate(a);
                        });
                    }, i.$select = function(a) {
                        i.$$postDigest(function() {
                            e.select(a);
                        });
                    }, i.$isVisible = function() {
                        return e.$isVisible();
                    }, e.update = function(a) {
                        i.$matches = a, i.$activeIndex >= a.length && (i.$activeIndex = 0);
                    }, e.activate = function(a) {
                        i.$activeIndex = a;
                    }, e.select = function(a) {
                        var c = i.$matches[a].value;
                        g && (g.$setViewValue(c), g.$render(), h && h.$digest()), "focus" === f.trigger ? b[0].blur() : e.$isShown && e.hide(), 
                        i.$activeIndex = 0, i.$emit("$typeahead.select", c, a);
                    }, e.$isVisible = function() {
                        return f.minLength && g ? i.$matches.length && angular.isString(g.$viewValue) && g.$viewValue.length >= f.minLength : !!i.$matches.length;
                    }, e.$onMouseDown = function(a) {
                        a.preventDefault(), a.stopPropagation();
                    }, e.$onKeyDown = function(a) {
                        if (/(38|40|13)/.test(a.keyCode)) {
                            if (a.preventDefault(), a.stopPropagation(), 13 === a.keyCode) return e.select(i.$activeIndex);
                            38 === a.keyCode && i.$activeIndex > 0 ? i.$activeIndex-- : 40 === a.keyCode && i.$activeIndex < i.$matches.length - 1 ? i.$activeIndex++ : angular.isUndefined(i.$activeIndex) && (i.$activeIndex = 0), 
                            i.$digest();
                        }
                    };
                    var j = e.show;
                    e.show = function() {
                        j(), setTimeout(function() {
                            e.$element.on("mousedown", e.$onMouseDown), f.keyboard && b.on("keydown", e.$onKeyDown);
                        });
                    };
                    var k = e.hide;
                    return e.hide = function() {
                        e.$element.off("mousedown", e.$onMouseDown), f.keyboard && b.off("keydown", e.$onKeyDown), 
                        k();
                    }, e;
                }
                return angular.element(b.document.body), e.defaults = a, e;
            } ];
        }).directive("bsTypeahead", [ "$window", "$parse", "$q", "$typeahead", "$parseOptions", function(a, b, c, d, e) {
            var f = d.defaults;
            return {
                restrict: "EAC",
                require: "ngModel",
                link: function(a, b, c, g) {
                    var h = {
                        scope: a,
                        controller: g
                    };
                    angular.forEach([ "placement", "container", "delay", "trigger", "keyboard", "html", "animation", "template", "limit", "minLength" ], function(a) {
                        angular.isDefined(c[a]) && (h[a] = c[a]);
                    });
                    var i = h.limit || f.limit, j = e(c.ngOptions + " | filter:$viewValue | limitTo:" + i), k = d(b, h);
                    a.$watch(c.ngModel, function() {
                        j.valuesFn(a, g).then(function(a) {
                            a.length > i && (a = a.slice(0, i)), k.update(a);
                        });
                    }), a.$on("$destroy", function() {
                        k.destroy(), h = null, k = null;
                    });
                }
            };
        } ]);
    }(window, document), function() {
        "use strict";
        angular.module("mgcrea.ngStrap.alert").run([ "$templateCache", function(a) {
            a.put("alert/alert.tpl.html", '<div class="alert alert-dismissable" tabindex="-1" ng-class="[type ? \'alert-\' + type : null]"><button type="button" class="close" ng-click="$hide()">&times;</button> <strong ng-bind="title"></strong>&nbsp;<span ng-bind-html="content"></span></div>');
        } ]), angular.module("mgcrea.ngStrap.aside").run([ "$templateCache", function(a) {
            a.put("aside/aside.tpl.html", '<div class="aside" tabindex="-1" role="dialog"><div class="aside-dialog"><div class="aside-content"><div class="aside-header" ng-show="title"><button type="button" class="close" ng-click="$hide()">&times;</button><h4 class="aside-title" ng-bind="title"></h4></div><div class="aside-body" ng-bind="content"></div><div class="aside-footer"><button type="button" class="btn btn-default" ng-click="$hide()">Close</button></div></div></div></div>');
        } ]), angular.module("mgcrea.ngStrap.datepicker").run([ "$templateCache", function(a) {
            a.put("datepicker/datepicker.tpl.html", '<div class="dropdown-menu datepicker" ng-class="\'datepicker-mode-\' + $mode" style="max-width: 320px"><table style="table-layout: fixed; height: 100%; width: 100%"><thead><tr class="text-center"><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$selectPane(-1)"><i class="glyphicon glyphicon-chevron-left"></i></button></th><th colspan="{{ rows[0].length - 2 }}"><button tabindex="-1" type="button" class="btn btn-default btn-block text-strong" ng-click="$toggleMode()"><strong style="text-transform: capitalize" ng-bind="title"></strong></button></th><th><button tabindex="-1" type="button" class="btn btn-default pull-right" ng-click="$selectPane(+1)"><i class="glyphicon glyphicon-chevron-right"></i></button></th></tr><tr ng-show="labels" ng-bind-html="labels"></tr></thead><tbody><tr ng-repeat="(i, row) in rows" height="{{ 100 / rows.length }}%"><td class="text-center" ng-repeat="(j, el) in row"><button tabindex="-1" type="button" class="btn btn-default" style="width: 100%" ng-class="{\'btn-primary\': el.selected}" ng-click="$select(el.date)" ng-disabled="el.disabled"><span ng-class="{\'text-muted\': el.muted}" ng-bind="el.label"></span></button></td></tr></tbody></table></div>');
        } ]), angular.module("mgcrea.ngStrap.dropdown").run([ "$templateCache", function(a) {
            a.put("dropdown/dropdown.tpl.html", '<ul tabindex="-1" class="dropdown-menu" role="menu"><li role="presentation" ng-class="{divider: item.divider}" ng-repeat="item in content"><a role="menuitem" tabindex="-1" href="{{item.href}}" ng-if="!item.divider" ng-click="$eval(item.click);$hide()" ng-bind="item.text"></a></li></ul>');
        } ]), angular.module("mgcrea.ngStrap.modal").run([ "$templateCache", function(a) {
            a.put("modal/modal.tpl.html", '<div class="modal" tabindex="-1" role="dialog"><div class="modal-dialog"><div class="modal-content"><div class="modal-header" ng-show="title"><button type="button" class="close" ng-click="$hide()">&times;</button><h4 class="modal-title" ng-bind="title"></h4></div><div class="modal-body" ng-bind="content"></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="$hide()">Close</button></div></div></div></div>');
        } ]), angular.module("mgcrea.ngStrap.popover").run([ "$templateCache", function(a) {
            a.put("popover/popover.tpl.html", '<div class="popover"><div class="arrow"></div><h3 class="popover-title" ng-bind="title" ng-show="title"></h3><div class="popover-content" ng-bind="content"></div></div>');
        } ]), angular.module("mgcrea.ngStrap.select").run([ "$templateCache", function(a) {
            a.put("select/select.tpl.html", '<ul tabindex="-1" class="select dropdown-menu" ng-show="$isVisible()" role="select"><li role="presentation" ng-repeat="match in $matches" ng-class="{active: $isActive($index)}"><a style="cursor: default" role="menuitem" tabindex="-1" ng-click="$select($index, $event)"><span ng-bind="match.label"></span> <i class="glyphicon glyphicon-ok pull-right" ng-if="$isMultiple && $isActive($index)"></i></a></li></ul>');
        } ]), angular.module("mgcrea.ngStrap.tab").run([ "$templateCache", function(a) {
            a.put("tab/tab.tpl.html", '<ul class="nav nav-tabs"><li ng-repeat="pane in panes" ng-class="{active: $index == active}"><a data-toggle="tab" ng-click="setActive($index, $event)" data-index="{{$index}}">{{pane.title}}</a></li></ul><div class="tab-content"><div ng-repeat="pane in panes" class="tab-pane" ng-class="[$index == active ? \'active\' : \'\']" ng-include="pane.template || \'$pane\'"></div></div>');
        } ]), angular.module("mgcrea.ngStrap.timepicker").run([ "$templateCache", function(a) {
            a.put("timepicker/timepicker.tpl.html", '<div class="dropdown-menu timepicker" style="min-width: 0px;width: auto"><table height="100%"><thead><tr class="text-center"><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$moveIndex(-1, 0)"><i class="glyphicon glyphicon-chevron-up"></i></button></th><th>&nbsp;</th><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$moveIndex(-1, 1)"><i class="glyphicon glyphicon-chevron-up"></i></button></th></tr></thead><tbody><tr ng-repeat="(i, row) in rows"><td class="text-center"><button tabindex="-1" style="width: 100%" type="button" class="btn btn-default" ng-class="{\'btn-primary\': row[0].selected}" ng-click="$select(row[0].date, 0)" ng-disabled="row[0].disabled"><span ng-class="{\'text-muted\': row[0].muted}" ng-bind="row[0].label"></span></button></td><td><span ng-bind="i == midIndex ? \':\' : \' \'"></span></td><td class="text-center"><button tabindex="-1" ng-if="row[1].date" style="width: 100%" type="button" class="btn btn-default" ng-class="{\'btn-primary\': row[1].selected}" ng-click="$select(row[1].date, 1)" ng-disabled="row[1].disabled"><span ng-class="{\'text-muted\': row[1].muted}" ng-bind="row[1].label"></span></button></td><td ng-if="showAM">&nbsp;</td><td ng-if="showAM"><button tabindex="-1" ng-show="i == midIndex - !isAM * 1" style="width: 100%" type="button" ng-class="{\'btn-primary\': !!isAM}" class="btn btn-default" ng-click="$switchMeridian()" ng-disabled="el.disabled">AM</button> <button tabindex="-1" ng-show="i == midIndex + 1 - !isAM * 1" style="width: 100%" type="button" ng-class="{\'btn-primary\': !isAM}" class="btn btn-default" ng-click="$switchMeridian()" ng-disabled="el.disabled">PM</button></td></tr></tbody><tfoot><tr class="text-center"><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$moveIndex(1, 0)"><i class="glyphicon glyphicon-chevron-down"></i></button></th><th>&nbsp;</th><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$moveIndex(1, 1)"><i class="glyphicon glyphicon-chevron-down"></i></button></th></tr></tfoot></table></div>');
        } ]), angular.module("mgcrea.ngStrap.tooltip").run([ "$templateCache", function(a) {
            a.put("tooltip/tooltip.tpl.html", '<div class="tooltip in" ng-show="title"><div class="tooltip-arrow"></div><div class="tooltip-inner" ng-bind="title"></div></div>');
        } ]), angular.module("mgcrea.ngStrap.typeahead").run([ "$templateCache", function(a) {
            a.put("typeahead/typeahead.tpl.html", '<ul tabindex="-1" class="typeahead dropdown-menu" ng-show="$isVisible()" role="select"><li role="presentation" ng-repeat="match in $matches" ng-class="{active: $index == $activeIndex}"><a role="menuitem" tabindex="-1" ng-click="$select($index, $event)" ng-bind="match.label"></a></li></ul>');
        } ]);
    }(window, document), define("angular-strap", [ "angular", "angular-animate" ], function() {}), 
    angular.module("angular-growl", []), angular.module("angular-growl").directive("growl", [ "$rootScope", function($rootScope) {
        "use strict";
        return {
            restrict: "A",
            template: '<div class="growl">	<div class="growl-item alert" ng-repeat="message in messages" ng-class="computeClasses(message)">		<button type="button" class="close" ng-click="deleteMessage(message)">&times;</button>       <div ng-switch="message.enableHtml">           <div ng-switch-when="true" ng-bind-html="message.text"></div>           <div ng-switch-default ng-bind="message.text"></div>       </div>	</div></div>',
            replace: !1,
            scope: !0,
            controller: [ "$scope", "$timeout", "growl", function($scope, $timeout, growl) {
                function addMessage(message) {
                    $scope.messages.push(message), message.ttl && -1 !== message.ttl && $timeout(function() {
                        $scope.deleteMessage(message);
                    }, message.ttl);
                }
                var onlyUnique = growl.onlyUnique();
                $scope.messages = [], $rootScope.$on("growlMessage", function(event, message) {
                    var found;
                    onlyUnique ? (angular.forEach($scope.messages, function(msg) {
                        message.text === msg.text && message.severity === msg.severity && (found = !0);
                    }), found || addMessage(message)) : addMessage(message);
                }), $scope.deleteMessage = function(message) {
                    var index = $scope.messages.indexOf(message);
                    index > -1 && $scope.messages.splice(index, 1);
                }, $scope.computeClasses = function(message) {
                    return {
                        "alert-success": "success" === message.severity,
                        "alert-error": "error" === message.severity,
                        "alert-danger": "error" === message.severity,
                        "alert-info": "info" === message.severity,
                        "alert-warning": "warn" === message.severity
                    };
                };
            } ]
        };
    } ]), angular.module("angular-growl").provider("growl", function() {
        "use strict";
        var _ttl = null, _enableHtml = !1, _messagesKey = "messages", _messageTextKey = "text", _messageSeverityKey = "severity", _onlyUniqueMessages = !0;
        this.globalTimeToLive = function(ttl) {
            _ttl = ttl;
        }, this.globalEnableHtml = function(enableHtml) {
            _enableHtml = enableHtml;
        }, this.messagesKey = function(messagesKey) {
            _messagesKey = messagesKey;
        }, this.messageTextKey = function(messageTextKey) {
            _messageTextKey = messageTextKey;
        }, this.messageSeverityKey = function(messageSeverityKey) {
            _messageSeverityKey = messageSeverityKey;
        }, this.onlyUniqueMessages = function(onlyUniqueMessages) {
            _onlyUniqueMessages = onlyUniqueMessages;
        }, this.serverMessagesInterceptor = [ "$q", "growl", function($q, growl) {
            function checkResponse(response) {
                response.data[_messagesKey] && response.data[_messagesKey].length > 0 && growl.addServerMessages(response.data[_messagesKey]);
            }
            function success(response) {
                return checkResponse(response), response;
            }
            function error(response) {
                return checkResponse(response), $q.reject(response);
            }
            return function(promise) {
                return promise.then(success, error);
            };
        } ], this.$get = [ "$rootScope", "$filter", function($rootScope, $filter) {
            function broadcastMessage(message) {
                translate && (message.text = translate(message.text)), $rootScope.$broadcast("growlMessage", message);
            }
            function sendMessage(text, config, severity) {
                var message, _config = config || {};
                message = {
                    text: text,
                    severity: severity,
                    ttl: _config.ttl || _ttl,
                    enableHtml: _config.enableHtml || _enableHtml
                }, broadcastMessage(message);
            }
            function addWarnMessage(text, config) {
                sendMessage(text, config, "warn");
            }
            function addErrorMessage(text, config) {
                sendMessage(text, config, "error");
            }
            function addInfoMessage(text, config) {
                sendMessage(text, config, "info");
            }
            function addSuccessMessage(text, config) {
                sendMessage(text, config, "success");
            }
            function addServerMessages(messages) {
                var i, message, severity, length;
                for (length = messages.length, i = 0; length > i; i++) if (message = messages[i], 
                message[_messageTextKey] && message[_messageSeverityKey]) {
                    switch (message[_messageSeverityKey]) {
                      case "warn":
                        severity = "warn";
                        break;

                      case "success":
                        severity = "success";
                        break;

                      case "info":
                        severity = "info";
                        break;

                      case "error":
                        severity = "error";
                    }
                    sendMessage(message[_messageTextKey], void 0, severity);
                }
            }
            function onlyUnique() {
                return _onlyUniqueMessages;
            }
            var translate;
            try {
                translate = $filter("translate");
            } catch (e) {}
            return {
                addWarnMessage: addWarnMessage,
                addErrorMessage: addErrorMessage,
                addInfoMessage: addInfoMessage,
                addSuccessMessage: addSuccessMessage,
                addServerMessages: addServerMessages,
                onlyUnique: onlyUnique
            };
        } ];
    }), define("angular-growl", [ "angular" ], function() {}), function() {
        "use strict";
        define("requests/requestModule", [ "angular", "ApiModule", "./controllers/request", "./services/request-tracking", "angular-sanitize", "angular-animate", "angular-strap", "angular-growl" ], function(angular, APIModule, RequestController, RequestTrackingService) {
            var moduleName = "requestManagerModule";
            return angular.module(moduleName, [ "ngSanitize", "ngAnimate", "mgcrea.ngStrap", "angular-growl", APIModule ]).controller("RequestController", RequestController).provider("RequestTrackingService", RequestTrackingService).config([ "growlProvider", function(growlProvider) {
                growlProvider.globalTimeToLive(1e4);
            } ]), moduleName;
        });
    }(), function() {
        "use strict";
        define("helpers/grain-helpers", [ "lodash" ], function(_) {
            function formatCpuFlags(flags) {
                return flags ? flags.join(", ") : "";
            }
            function formatIPAddresses(ips) {
                return ips ? ips.join(", ") : "";
            }
            function formatInterfaces(interfaces) {
                return interfaces ? _.reduce(interfaces, function(results, value, key) {
                    return results.push(key + ": " + value), results;
                }, []).join(", ") : "";
            }
            return {
                formatCpuFlags: formatCpuFlags,
                formatIPAddresses: formatIPAddresses,
                formatInterfaces: formatInterfaces
            };
        });
    }(), function() {
        "use strict";
        var __split = String.prototype.split;
        define("helpers/server-helpers", [ "lodash", "helpers/grain-helpers" ], function(_, grainHelpers) {
            function makeFunctions($q, $scope, $rootScope, $log, $timeout, ServerService, KeyService, $modal) {
                function normalizeMinions(minions) {
                    var o;
                    return _.reduce(_.sortBy(minions, function(m) {
                        return m.id;
                    }), function(results, minion) {
                        var shortName = _.first(__split.call(minion.id, "."));
                        return o = {
                            id: minion.id,
                            status: minion.status,
                            shortName: shortName,
                            label: '<i class="fa fa-lg fa-fw fa-plus-circle"></i>'
                        }, "pre" === minion.status ? results.pre[minion.id] = o : results.accepted[minion.id] = o, 
                        results;
                    }, {
                        pre: {},
                        accepted: {}
                    });
                }
                function classifyMinions(all, extract) {
                    return _.reduce(_.flatten(all), function(result, minion) {
                        var entry = result.add[minion.id];
                        return entry ? (delete result.add[minion.id], entry.status !== minion.status && (minion.status = entry.status, 
                        result.change[minion.id] = minion)) : result.remove[minion.id] = !0, result;
                    }, {
                        add: extract,
                        change: {},
                        remove: {}
                    });
                }
                function removeDeletedMinions(all, remove) {
                    return _.isEmpty(remove) ? all : _.map(all, function(col) {
                        return _.filter(col, function(minion) {
                            return !remove[minion.id];
                        });
                    });
                }
                function updateChangedMinions(all, change) {
                    return _.isEmpty(change) ? all : _.map(all, function(col) {
                        return _.map(col, function(minion) {
                            return change[minion.id] ? change[minion.id] : minion;
                        });
                    });
                }
                function addNewMinions(all, addCollection) {
                    var adds = _.map(addCollection, function(value) {
                        return value;
                    });
                    return _.each(adds, function(add) {
                        var col = _.reduce(_.rest(all), function(curColumn, nextColumn) {
                            return curColumn.length <= nextColumn.length ? curColumn : nextColumn;
                        }, _.first(all));
                        col.push(add);
                    }), all;
                }
                function processMinionChanges(minions) {
                    $scope.minionsCounts = {
                        total: minions.length
                    };
                    var extract = normalizeMinions(minions), accepted = $scope.cols, pre = $scope.pcols, newAccepted = classifyMinions(accepted, extract.accepted);
                    accepted = removeDeletedMinions(accepted, newAccepted.remove), accepted = updateChangedMinions(accepted, newAccepted.change), 
                    accepted = addNewMinions(accepted, newAccepted.add);
                    var newPre = classifyMinions(pre, extract.pre);
                    return pre = removeDeletedMinions(pre, newPre.remove), pre = addNewMinions(pre, newPre.add), 
                    {
                        pre: pre,
                        accepted: accepted,
                        hidePre: 0 === _.flatten(pre).length
                    };
                }
                function acceptMinion(minion) {
                    minion.label = '<i class="fa fa-spinner fa-spin"></i>', KeyService.accept([ minion.id ]).then(function() {}, function(resp) {
                        var modal = $modal({
                            template: "views/custom-modal.html",
                            html: !0
                        });
                        modal.$scope.$hide = _.wrap(modal.$scope.$hide, function($hide) {
                            $hide();
                        }), 403 === resp.status ? (modal.$scope.title = '<i class="text-danger fa fa-exclamation-circle fa-lg"></i> 无法访问', 
                        modal.$scope.content = "错误 " + resp.status + "，请尝试重新加载该页面或者重新登陆</p>") : (modal.$scope.title = '<i class="text-danger fa fa-exclamation-circle fa-lg"></i> 异常错误', 
                        modal.$scope.content = '<i class="text-danger fa fa-exclamation-circle fa-lg"></i> 错误 ' + resp.status + "，请尝试重新加载该页面或者重新登陆。</p><h4>原始数据</h4><p><pre>" + resp.data + "</pre></p>");
                    });
                }
                function detailView(id) {
                    var promises = [ ServerService.getGrains(id), ServerService.get(id) ];
                    return $q.all(promises).then(function(results) {
                        return function(data) {
                            return data.cpu_flags = grainHelpers.formatCpuFlags(data.cpu_flags), data.ipv4 = grainHelpers.formatIPAddresses(data.ipv4), 
                            data.ipv6 = grainHelpers.formatIPAddresses(data.ipv6), data.ip_interfaces = grainHelpers.formatInterfaces(data.ip_interfaces), 
                            data.ceph_version = results[1].ceph_version, _.map([ "ceph_version", "lsb_distrib_description", "osarch", "kernelrelease", "saltversion", "cpu_model", "num_cpus", "cpu_flags", "mem_total", "ip_interfaces", "ipv4", "ipv6" ], function(key) {
                                return {
                                    key: key,
                                    value: data[key] || "Unknown"
                                };
                            });
                        }(results[0]);
                    });
                }
                return {
                    processMinionChanges: processMinionChanges,
                    detailView: detailView,
                    acceptMinion: acceptMinion
                };
            }
            return {
                makeFunctions: makeFunctions
            };
        });
    }(), function() {
        "use strict";
        define("helpers/cluster-settings-helpers", [ "lodash" ], function(_) {
            function makeFunctions($log, $scope, $timeout, $q, breadcrumbs, OSDConfigService, $modal, osdConfigKeys, RequestTrackingService) {
                function getDirtyOSDConfigKeys($scope) {
                    return _.reduce(osdConfigKeys, function(results, key) {
                        return $scope.osdmapForm[key].$dirty && (results[key] = $scope.osdconfigs[key]), 
                        results;
                    }, {});
                }
                var obj = {};
                return obj.initialize = function() {
                    var d = $q.defer();
                    return $timeout(function() {
                        $scope.$watch("button.radio", function() {
                            $scope.helpDiv = void 0, $scope.breadcrumbs = breadcrumbs[$scope.button.radio];
                        }), $scope.updateLabel = "更新", $scope.updatePrimary = !0, $scope.updateSuccess = !1, 
                        $scope.button = {
                            radio: "servers"
                        }, d.resolve(obj);
                    }, 0), d.promise;
                }, obj.helpInfo = function($event) {
                    var $el = angular.element($event.target), id = $el.attr("data-target");
                    void 0 !== id && ($log.debug("helpInfo " + $el.attr("data-target")), $scope.helpDiv = id);
                }, obj.reset = function() {
                    $scope.osdconfigs = angular.copy($scope.osdconfigsdefaults), $scope.osdmapForm.$setPristine(), 
                    $scope.helpDiv = void 0;
                }, obj.updateSettings = function() {
                    $scope.updateLabel = '<i class="fa fa-spinner fa-spin"></i>';
                    var patchList = getDirtyOSDConfigKeys($scope);
                    $log.debug(patchList);
                    var startTime = Date.now();
                    OSDConfigService.patch(patchList).then(function(resp) {
                        RequestTrackingService.add(resp.data.request_id);
                        var totalTime = Date.now() - startTime;
                        $log.debug("took " + totalTime + "ms");
                        var waitTimeout = totalTime > 1e3 ? 0 : 1e3 - totalTime;
                        $timeout(function() {
                            $scope.updatePrimary = !1, $scope.updateSuccess = !0, $scope.updateLabel = '<i class="fa fa-check-circle"></i>', 
                            $timeout(function() {
                                $scope.updateLabel = "更新", $scope.updatePrimary = !0, $scope.updateSuccess = !1, 
                                $scope.osdmapForm.$setPristine(), $scope.osdconfigsdefaults = angular.copy($scope.osdconfigs);
                            }, 1e3);
                        }, waitTimeout);
                    }, function(resp) {
                        var modal = $modal({
                            template: "views/custom-modal.html",
                            html: !0
                        });
                        modal.$scope.$hide = _.wrap(modal.$scope.$hide, function($hide) {
                            $hide();
                        }), 403 === resp.status ? (modal.$scope.title = '<i class="text-danger fa fa-exclamation-circle fa-lg"></i> 无法访问', 
                        modal.$scope.content = "错误 " + resp.status + "，请尝试重新加载该页面或者重新登陆。</p>") : (modal.$scope.title = '<i class="text-danger fa fa-exclamation-circle fa-lg"></i> 异常错误', 
                        modal.$scope.content = '<i class="text-danger fa fa-exclamation-circle fa-lg"></i> 错误 ' + resp.status + "，请尝试重新加载该页面或者重新登陆。</p><h4>原始数据</h4><p><pre>" + resp.data + "</pre></p>");
                    });
                }, obj.makeBreadcrumbs = function(name) {
                    return {
                        servers: [ {
                            text: "管理 (" + name + ")"
                        }, {
                            text: "集群",
                            active: !0
                        }, {
                            text: "主机",
                            active: !0
                        } ],
                        osdmap: [ {
                            text: "管理 (" + name + ")"
                        }, {
                            text: "集群",
                            active: !0
                        }, {
                            text: "集群设置",
                            active: !0
                        } ],
                        viewer: [ {
                            text: "管理 (" + name + ")"
                        }, {
                            text: "集群",
                            active: !0
                        }, {
                            text: "配置视图",
                            active: !0
                        } ]
                    };
                }, obj;
            }
            return {
                makeFunctions: makeFunctions
            };
        });
    }(), function() {
        "use strict";
        var __split = String.prototype.split;
        define("helpers/cluster-response-helpers", [ "lodash" ], function(_) {
            function makeFunctions($q, $timeout, osdConfigKeys) {
                function bucketMinions(minions) {
                    return _.reduce(_.sortBy(minions, function(m) {
                        return m.id;
                    }), function(results, minion, index) {
                        var shortName = _.first(__split.call(minion.id, "."));
                        return minion.shortName = shortName, results[index % 4].push({
                            id: minion.id,
                            status: minion.status,
                            shortName: shortName,
                            label: '<i class="fa fa-fw fa-lg fa-plus-circle"></i>'
                        }), results;
                    }, [ [], [], [], [] ]);
                }
                function configComparator(a, b) {
                    return a.key === b.key ? 0 : a.key < b.key ? -1 : 1;
                }
                function processConfigs(configs) {
                    var d = $q.defer();
                    return $timeout(function() {
                        d.resolve(_.map(configs.sort(configComparator), function(config) {
                            return {
                                key: config.key,
                                value: config.value
                            };
                        }));
                    }, 500), d.promise;
                }
                function osdConfigsInit(config) {
                    var d = $q.defer();
                    return d.resolve(_.reduce(osdConfigKeys, function(result, key) {
                        return result[key] = config[key], result;
                    }, {})), d.promise;
                }
                function makeBreadcrumbs(name) {
                    return {
                        servers: [ {
                            text: "管理 (" + name + ")"
                        }, {
                            text: "集群",
                            active: !0
                        }, {
                            text: "主机",
                            active: !0
                        } ],
                        osdmap: [ {
                            text: "管理 (" + name + ")"
                        }, {
                            text: "集群",
                            active: !0
                        }, {
                            text: "集群设置",
                            active: !0
                        } ],
                        viewer: [ {
                            text: "管理 (" + name + ")"
                        }, {
                            text: "集群",
                            active: !0
                        }, {
                            text: "配置视图",
                            active: !0
                        } ]
                    };
                }
                return {
                    bucketMinions: bucketMinions,
                    processConfigs: processConfigs,
                    osdConfigsInit: osdConfigsInit,
                    makeBreadcrumbs: makeBreadcrumbs
                };
            }
            return {
                makeFunctions: makeFunctions
            };
        });
    }(), function() {
        "use strict";
        define("helpers/modal-helpers", [ "lodash" ], function(_) {
            return {
                UnAuthorized: function($modal, options) {
                    return options = options || {}, $modal(_.extend({
                        title: "无法访问",
                        content: "无法访问API,可能是您的身份验证令牌无效，请尝试重新登陆！",
                        container: "body",
                        template: "views/custom-modal.html"
                    }, options));
                },
                UnexpectedError: function($modal, options) {
                    return options = options || {
                        status: "?"
                    }, $modal(_.extend({
                        title: "异常错误 (" + options.status + ")",
                        container: "body",
                        template: "views/custom-modal.html"
                    }, options));
                },
                SuccessfulRequest: function($modal, options) {
                    return options = options || {}, $modal(_.extend({
                        content: "这可能需要一段时间，我们会让你知道什么时候完成的，您还可以查看通知队列来检查您的请求的进展情况。",
                        container: "body",
                        template: "views/custom-modal.html",
                        backdrop: "static",
                        keyboard: !1
                    }, options));
                },
                makeOnError: function(modal, callback) {
                    return function(resp) {
                        modal.$scope.title = "异常错误 " + resp.status, modal.$scope.content = "<pre>" + resp.data + "</pre>", 
                        modal.$scope.$hide = _.wrap(modal.$scope.$hide, function($hide) {
                            $hide(), _.isFunction(callback) && callback.call(void 0);
                        }), modal.$scope.disableClose = !1, modal.$scope.$show();
                    };
                }
            };
        });
    }(), function() {
        "use strict";
        var osdConfigKeys = [ "noin", "noout", "noup", "nodown", "pause", "noscrub", "nodeep-scrub", "nobackfill", "norecover" ], SPINNER_ICON = '<i class="fa fa-fw fa-lg fa-spinner fa-spin"></i>', CHECK_CIRCLE_ICON = '<i class="fa fa-fw fa-lg fa-check-circle-o"></i>';
        define("controllers/root", [ "lodash", "helpers/server-helpers", "helpers/cluster-settings-helpers", "helpers/cluster-response-helpers", "helpers/modal-helpers" ], function(_, ServerHelpers, ClusterSettingsHelpers, ResponseHelpers, ModalHelpers) {
            var RootController = function($q, $log, $timeout, $rootScope, $location, $scope, KeyService, ClusterService, ToolService, ServerService, $modal, OSDConfigService, RequestTrackingService, config) {
                function refreshKeys() {
                    $log.debug("refreshing keys"), KeyService.getList().then(serverHelpers.processMinionChanges).then(function(all) {
                        $scope.cols = all.accepted, $scope.pcols = all.pre, $scope.hidePre = all.hidePre;
                    }), $rootScope.keyTimer = $timeout(refreshKeys, config.getPollTimeoutMs());
                }
                function approveAll() {
                    var minions = _.flatten($scope.pcols);
                    $scope.approveAllDisabled = !0, minions = _.map(minions, function(minion) {
                        return minion.label = SPINNER_ICON, minion.disabled = !0, minion.id;
                    });
                    var start = Date.now();
                    KeyService.accept(minions).then(function() {
                        var elapsed = Date.now() - start, timeout = 1e3 > elapsed ? 1e3 - elapsed : 0;
                        $timeout(function() {
                            minions = _.each(_.flatten($scope.pcols), function(minion) {
                                minion.label = CHECK_CIRCLE_ICON;
                            });
                        }, timeout);
                    }, ModalHelpers.makeOnError($modal({
                        show: !1,
                        html: !0,
                        template: "views/custom-modal.html",
                        backdrop: "static"
                    })));
                }
                if (null === ClusterService.id) return void $location.path(config.getFirstViewPath());
                $scope.clusterName = ClusterService.clusterModel.name;
                var serverHelpers = ServerHelpers.makeFunctions($q, $scope, $rootScope, $log, $timeout, ServerService, KeyService, $modal);
                $scope.acceptMinion = serverHelpers.acceptMinion, $scope.detailView = function(id) {
                    var modal = $modal({
                        title: id,
                        template: "views/detail-grains-modal.html",
                        show: !0
                    });
                    serverHelpers.detailView(id).then(function(pairs) {
                        modal.$scope.pairs = pairs;
                    });
                }, $scope.approveAll = approveAll;
                var responseHelpers = ResponseHelpers.makeFunctions($q, $timeout, osdConfigKeys), breadcrumbs = responseHelpers.makeBreadcrumbs($scope.clusterName);
                $scope.breadcrumbs = breadcrumbs.servers, ClusterSettingsHelpers.makeFunctions($log, $scope, $timeout, $q, breadcrumbs, OSDConfigService, $modal, osdConfigKeys, RequestTrackingService).initialize().then(function(cluster) {
                    $scope.helpInfo = cluster.helpInfo, $scope.reset = cluster.reset, $scope.updateSettings = cluster.updateSettings;
                });
                var promises = [ KeyService.getList(), ToolService.config(), OSDConfigService.get() ], start = Date.now();
                $q.all(promises).then(function(results) {
                    $rootScope.keyTimer = $timeout(refreshKeys, config.getPollTimeoutMs()), $scope.up = !0;
                    var elapsed = Date.now() - start, timeout = 600 > elapsed ? 600 - elapsed : 0;
                    $scope.hidePre = !0, $timeout(function() {
                        var minions = _.reduce(results[0], function(accumulator, minion) {
                            return "pre" === minion.status ? accumulator.pre.push(minion) : accumulator.accept.push(minion), 
                            accumulator;
                        }, {
                            accept: [],
                            pre: []
                        });
                        $scope.pcols = responseHelpers.bucketMinions(minions.pre), $scope.cols = responseHelpers.bucketMinions(minions.accept), 
                        $scope.hidePre = 0 === _.flatten(minions.pre).length;
                    }, timeout), responseHelpers.processConfigs(results[1]).then(function(configs) {
                        $scope.configs = configs;
                    }), responseHelpers.osdConfigsInit(results[2]).then(function(osdConfigs) {
                        $scope.osdconfigs = osdConfigs, $scope.osdconfigsdefaults = angular.copy(osdConfigs);
                    });
                });
            };
            return [ "$q", "$log", "$timeout", "$rootScope", "$location", "$scope", "KeyService", "ClusterService", "ToolService", "ServerService", "$modal", "OSDConfigService", "RequestTrackingService", "ConfigurationService", RootController ];
        });
    }(), function() {
        "use strict";
        define("helpers/error-helpers", [], function() {
            function makeFunctions($q, $log) {
                function intercept304Error(promise) {
                    return promise.then(function(resp) {
                        return resp;
                    }, function(resp) {
                        var d = $q.defer();
                        return 304 === resp.status ? ($log.debug("intercepting 304 and ignoring"), d.resolve({
                            status: 200,
                            data: {
                                request_id: null
                            }
                        }), d.promise) : (d.reject(resp), d.promise);
                    });
                }
                return {
                    intercept304Error: intercept304Error
                };
            }
            return {
                makeFunctions: makeFunctions
            };
        });
    }(), function() {
        "use strict";
        define("controllers/pool", [ "lodash", "helpers/modal-helpers", "helpers/error-helpers" ], function(_, ModalHelpers, ErrorHelpers) {
            var PoolController = function($q, $log, $scope, PoolService, ClusterService, $location, $modal, RequestTrackingService, $rootScope, $timeout, config) {
                function copyPools(pools) {
                    return _.reduce(pools, function(_pools, pool) {
                        return _pools.push({
                            name: pool.name,
                            id: pool.id,
                            size: pool.size,
                            pg_num: pool.pg_num
                        }), _pools;
                    }, []);
                }
                function updatePools(newValue, oldValue) {
                    var lookup = _.reduce(newValue, function(index, pool) {
                        return index[pool.id] = pool, index;
                    }, {}), newList = _.filter(oldValue, function(pool) {
                        return void 0 !== lookup[pool.id];
                    });
                    return newList = _.each(newList, function(pool) {
                        _.extend(pool, lookup[pool.id]), delete lookup[pool.id];
                    }), newList.concat(_.values(lookup));
                }
                function refreshPools() {
                    $log.debug("refreshing pools"), $rootScope.keyTimer && ($timeout.cancel($rootScope.keyTimer), 
                    $rootScope.keyTimer = void 0), PoolService.getList().then(function(pools) {
                        $scope.pools = updatePools(copyPools(pools), $scope.pools);
                    }), $rootScope.keyTimer = $timeout(refreshPools, config.getPollTimeoutMs());
                }
                if (null === ClusterService.clusterId) return void $location.path(config.getFirstViewPath());
                var errorHelper = ErrorHelpers.makeFunctions($q, $log);
                $scope.ttEdit = {
                    title: "编辑Pool"
                }, $scope.ttDelete = {
                    title: "删除Pool"
                }, $scope.ttCreate = {
                    title: "创建Pool"
                }, $scope.clusterName = ClusterService.clusterModel.name, $scope.breadcrumbs = [ {
                    text: "管理 (" + $scope.clusterName + ")"
                }, {
                    text: "Pools",
                    active: !0
                } ], $scope.up = !1;
                var start = Date.now();
                PoolService.getList().then(function(pools) {
                    var elapsed = Date.now() - start, timeout = 500 > elapsed ? 500 - elapsed : 0;
                    $timeout(function() {
                        $scope.pools = copyPools(pools);
                    }, timeout), $rootScope.keyTimer = $timeout(refreshPools, config.getPollTimeoutMs()), 
                    $scope.up = !0;
                }), $scope.create = function() {
                    $location.path("/pool/new");
                }, $scope.modify = function(id) {
                    $location.path("/pool/modify/" + id);
                }, $scope.remove = function(pool) {
                    $log.debug("deleting " + pool.id);
                    var modal = $modal({
                        title: "删除'" + pool.name + "' Pool， 你确定吗？",
                        content: "此操作完成后无法撤销，请确定后再执行！",
                        template: "views/delete-modal.html"
                    });
                    modal.$scope.id = pool.id, modal.$scope.confirm = function() {
                        modal.$scope.$hide(), errorHelper.intercept304Error(PoolService.remove(modal.$scope.id)).then(function(result) {
                            if (202 === result.status) {
                                RequestTrackingService.add(result.data.request_id).then(refreshPools);
                                var okmodal = ModalHelpers.SuccessfulRequest($modal, {
                                    title: "删除成功"
                                });
                                return void (okmodal.$scope.$hide = _.wrap(okmodal.$scope.$hide, function($hide) {
                                    $hide(), $location.path("/pool");
                                }));
                            }
                            $log.error("Unexpected response from PoolService.remove", result);
                        }, ModalHelpers.makeOnError($modal({
                            show: !1
                        }), function() {
                            $location.path("/pool");
                        }));
                    };
                };
            };
            return [ "$q", "$log", "$scope", "PoolService", "ClusterService", "$location", "$modal", "RequestTrackingService", "$rootScope", "$timeout", "ConfigurationService", PoolController ];
        });
    }(), function() {
        "use strict";
        define("helpers/osd-helpers", [ "lodash" ], function(_) {
            function formatOSDData(osd, pools) {
                var pairs = _.reduce([ "id", "uuid", "up", "in", "reweight", "server", "pools", "public_addr", "cluster_addr" ], function(result, key) {
                    var value = osd[key];
                    if (_.isObject(value) || _.isNumber(value) || _.isBoolean(value) || _.isString(value) && "" !== value) if ("up" === key || "in" === key) {
                        result.state = result.state || [];
                        var markup = '<div class="label label-danger">DOWN</div>';
                        "up" === key ? value && (markup = '<div class="label label-success">UP</div>') : markup = value ? '<div class="label label-success">IN</div>' : '<div class="label label-danger">OUT</div>', 
                        result.state.push(markup);
                    } else result[key] = value;
                    return result;
                }, {});
                return pairs.state && (pairs.state = pairs.state.join(" &nbsp; ")), pairs.reweight = Math.round(Math.min(100 * pairs.reweight, 100)) + "%", 
                pairs.id = "" + pairs.id, pairs.pools = _.reduce(pairs.pools, function(result, poolid) {
                    var pool = _.find(pools, function(pool) {
                        return pool.id === poolid;
                    });
                    return result.push(void 0 === pool ? poolid : pool.name), result;
                }, []).join(", "), pairs;
            }
            return {
                formatOSDData: formatOSDData
            };
        });
    }(), function() {
        "use strict";
        define("controllers/osd", [ "lodash", "helpers/osd-helpers" ], function(_, osdHelpers) {
            var OSDController = function($scope, ClusterService, ServerService, $location, OSDService, $modal, PoolService, $timeout, config) {
                if (null === ClusterService.clusterId) return void $location.path(config.getFirstViewPath());
                $scope.clusterName = ClusterService.clusterModel.name, $scope.breadcrumbs = [ {
                    text: "管理 (" + $scope.clusterName + ")"
                }, {
                    text: "OSD",
                    active: !0
                } ], $scope.displayOSD = function(id) {
                    OSDService.get(id).then(function(_osd) {
                        var modal = $modal({
                            title: "OSD " + _osd.id + " 信息",
                            template: "views/osd-info-modal.html"
                        });
                        PoolService.getList().then(function(pools) {
                            modal.$scope.pairs = osdHelpers.formatOSDData(_osd, pools);
                        });
                    });
                };
                var start = Date.now();
                ServerService.getList().then(function(servers) {
                    var elapsed = Date.now() - start, timeout = 500 > elapsed ? 500 - elapsed : 0;
                    $timeout(function() {
                        var _servers = _.reduce(servers, function(results, server) {
                            var services = _.reduce(server.services, function(serviceResults, service) {
                                return "osd" === service.type && (serviceResults.osdCount += 1, serviceResults.osdID.push(service.id)), 
                                serviceResults;
                            }, {
                                osdCount: 0,
                                osdID: []
                            });
                            return services.osdID = _.sortBy(services.osdID, function(id) {
                                return parseInt(id, 10);
                            }), OSDService.getSet(services.osdID).then(function(osds) {
                                services.state = _.reduce(osds, function(result, osd) {
                                    var state = 2;
                                    return osd.up || osd["in"] ? osd.up && osd["in"] || (state = 1) : state = 0, result.push(state), 
                                    result;
                                }, []);
                            }), results.push({
                                hostname: server.hostname,
                                fqdn: server.fqdn,
                                services: services
                            }), results;
                        }, []);
                        $scope.servers = _.sortBy(_servers, function(server) {
                            return server.fqdn;
                        });
                    }, timeout), $scope.up = !0;
                }), $scope.hostClickHandler = function(fqdn) {
                    $location.path("/osd/server/" + fqdn);
                };
            };
            return [ "$scope", "ClusterService", "ServerService", "$location", "OSDService", "$modal", "PoolService", "$timeout", "ConfigurationService", OSDController ];
        });
    }(), function() {
        "use strict";
        define("controllers/osd-host", [ "lodash", "helpers/modal-helpers", "helpers/osd-helpers", "helpers/error-helpers" ], function(_, ModalHelpers, OsdHelpers, ErrorHelpers) {
            var disableRepairCommand = !0, text = {
                down: '<i class="fa fa-arrow-circle-down fa-fw fa-lg"></i>&nbsp;DOWN',
                "in": '<i class="fa fa-sign-in fa-fw fa-lg"></i>&nbsp;IN',
                out: '<i class="fa fa-sign-out fa-fw fa-lg"></i>&nbsp;OUT',
                scrub: '<i class="fa fa-medkit fa-fw fa-lg"></i>&nbsp;SCRUB',
                deep_scrub: '<i class="fa fa-stethoscope fa-fw fa-lg"></i>&nbsp;DEEP SCRUB',
                repair: '<i class="fa fa-ambulance fa-fw fa-lg"></i>&nbsp;REPAIR',
                repairText: '<i class="fa fa-medkit fa-fw fa-lg"></i>',
                configText: '<i class="fa fa-gear fa-fw fa-lg"></i>',
                spinner: '<i class="fa fa-spinner fa-spin fa-fw fa-lg"></i>',
                success: '<i class="fa fa-check-circle-o fa-fw fa-lg"></i>'
            }, maxReweight = 100, OSDHostController = function($q, $log, $scope, $routeParams, ClusterService, ServerService, $location, OSDService, $modal, $timeout, RequestTrackingService, PoolService, config, $rootScope) {
                function formatOSDForUI(osd) {
                    osd.reweight = Math.min(osd.reweight * maxReweight, maxReweight), osd.reweight = Math.max(osd.reweight, 0), 
                    osd.reweight = Math.round(osd.reweight), osd._reweight = angular.copy(osd.reweight);
                }
                function generateConfigDropdown(result, handler) {
                    result.configDropdown = [], result.up && result.configDropdown.push({
                        text: text.down,
                        id: result.id,
                        cmd: "down",
                        index: result.index,
                        handler: handler
                    }), result["in"] ? result.configDropdown.push({
                        text: text.out,
                        id: result.id,
                        cmd: "out",
                        index: result.index,
                        handler: handler
                    }) : result.configDropdown.push({
                        text: text["in"],
                        id: result.id,
                        cmd: "in",
                        index: result.index,
                        handler: handler
                    });
                }
                function addUIMetadataToOSDData(osd, index) {
                    _.extend(osd, {
                        index: index,
                        repairText: text.repairText,
                        configText: text.configText,
                        hasError: !1,
                        editing: !1,
                        saved: !1,
                        editDisabled: !1
                    }), osd.valid_commands.length ? (disableRepairCommand && (osd.valid_commands = _.filter(osd.valid_commands, function(command) {
                        return "repair" !== command;
                    })), osd.repairDropdown = _.reduce(osd.valid_commands, function(newdropdown, cmd) {
                        return newdropdown.push({
                            text: text[cmd],
                            id: osd.id,
                            cmd: cmd,
                            index: index,
                            handler: repairClickHandler
                        }), newdropdown;
                    }, [])) : osd.repairDisabled = !0, generateConfigDropdown(osd, configClickHandler), 
                    formatOSDForUI(osd);
                }
                function requestRepairPermission(repairFn) {
                    return function($event, id, cmd, index) {
                        if ($event.preventDefault(), $event.stopPropagation(), "repair" === cmd) {
                            var modal = $modal({
                                html: !0,
                                title: '<i class="fa fa-fw fa-lg text-danger fa-exclamation-triangle"></i>修复OSD ' + id + "?",
                                backdrop: "static",
                                template: "views/osd-repair-warn-modal.html",
                                content: '在运行OSD修复之前，请确保你已经检查了擦洗输出的集群日志没有<strong class="text-info">错误</strong>，不这样做可能<span class="text-danger">永久丢失数据</span>。',
                                show: !0
                            });
                            modal.$scope.acceptFn = function() {
                                modal.$scope.$hide(), repairFn($event, id, cmd, index);
                            };
                        } else repairFn($event, id, cmd, index);
                    };
                }
                function makeCommandHandler(buttonLabel) {
                    return function($event, id, cmd, index) {
                        $event.preventDefault(), $log.debug("CLICKED osd " + id + " command " + cmd);
                        var osd = $scope.osds[index];
                        osd.disabled = !0, osd[buttonLabel] = text.spinner;
                        var start = Date.now(), modal = $modal({
                            html: !0,
                            title: "",
                            backdrop: "static",
                            template: "views/osd-cmd-modal.html",
                            show: !1
                        });
                        return errorHelpers.intercept304Error(OSDService[cmd].call(OSDService, id)).then(function(resp) {
                            var promise = RequestTrackingService.add(resp.data.request_id), elapsed = Date.now() - start, remaining = elapsed < config.getAnimationTimeoutMs() ? config.getAnimationTimeoutMs() - elapsed : 0;
                            modal.$scope.disableClose = !0, modal.$scope.$hide = _.wrap(modal.$scope.$hide, function($hide) {
                                $hide();
                            }), $timeout(function() {
                                osd[buttonLabel] = text.success, $timeout(function() {
                                    osd[buttonLabel] = text[buttonLabel], osd.disabled = !1, promise.then(function() {
                                        OSDService.get(id).then(function(_osd) {
                                            formatOSDForUI(_osd), _.extend(osd, _osd), osd.repairDisabled = !osd.up, osd.editDisabled = !osd.up || !osd["in"], 
                                            generateConfigDropdown(osd, configClickHandler);
                                        });
                                    });
                                }, config.getAnimationTimeoutMs());
                            }, remaining);
                        }, ModalHelpers.makeOnError(modal, function() {
                            osd[buttonLabel] = text[buttonLabel], osd.disabled = !1;
                        })), !1;
                    };
                }
                function refreshOSDModels() {
                    $log.debug("polling host " + $scope.fqdn), ServerService.get($scope.fqdn).then(function(server) {
                        var r = _.reduce(server.services, function(results, service) {
                            if ("osd" === service.type) {
                                var osd = {
                                    id: service.id,
                                    running: service.running
                                };
                                results.osds[osd.id] = osd, results.ids.push(osd.id);
                            }
                            return results;
                        }, {
                            osds: {},
                            ids: []
                        }), osds = $scope.osds;
                        OSDService.getSet(r.ids).then(function(newOsds) {
                            osds = _.filter(osds, function(osd) {
                                return void 0 !== newOsds[osd.id];
                            }), _.each(newOsds, function(nOsd, index) {
                                void 0 === osds[nOsd.id] && (addUIMetadataToOSDData(nOsd, index), osds[nOsd.id] = {}), 
                                nOsd.repairDisabled = !nOsd.up, nOsd.editDisabled = !nOsd.up || !nOsd["in"], nOsd.index = index, 
                                formatOSDForUI(nOsd), generateConfigDropdown(nOsd, configClickHandler), _.extend(osds[nOsd.id], nOsd);
                            });
                        }), $rootScope.keyTimer = $timeout(refreshOSDModels, config.getPollTimeoutMs());
                    });
                }
                var errorHelpers = ErrorHelpers.makeFunctions($q, $log);
                $scope.fqdn = $routeParams.fqdn, $scope.clusterName = ClusterService.clusterModel.name, 
                $scope.breadcrumbs = [ {
                    text: "管理 (" + $scope.clusterName + ")"
                }, {
                    text: "OSD",
                    href: "#/osd"
                }, {
                    text: "主机 (" + $scope.fqdn + ")",
                    active: !0
                } ], $scope.displayFn = function(id) {
                    OSDService.get(id).then(function(_osd) {
                        var modal = $modal({
                            title: "OSD " + _osd.id + " 信息",
                            template: "views/osd-info-modal.html"
                        });
                        PoolService.getList().then(function(pools) {
                            modal.$scope.pairs = OsdHelpers.formatOSDData(_osd, pools);
                        });
                    });
                }, $scope.changedFn = function(osd) {
                    return $log.debug("changed " + osd.id), osd.timeout && ($timeout.cancel(osd.timeout), 
                    osd.timeout = void 0), $rootScope.keyTimer && ($timeout.cancel($rootScope.keyTimer), 
                    $rootScope.keyTimer = $timeout(refreshOSDModels, config.getPollTimeoutMs())), $log.debug("reweight: " + osd.reweight), 
                    "" === osd.reweight || void 0 === osd.reweight ? void (osd.hasError = !0) : _.isNumber(osd.reweight) && (osd.reweight > maxReweight || osd.reweight < 0) ? void (osd.reweight = angular.copy(osd._reweight)) : _.isNaN(osd.reweight) ? void (osd.hasError = !0) : (osd.hasError = !1, 
                    void (osd.reweight !== osd._reweight && (osd.timeout = $timeout(function() {
                        osd.editing = !0;
                        var start = Date.now(), modal = $modal({
                            html: !0,
                            title: "",
                            backdrop: "static",
                            template: "views/osd-cmd-modal.html",
                            show: !1
                        });
                        errorHelpers.intercept304Error(OSDService.patch(osd.id, {
                            reweight: osd.reweight / maxReweight
                        })).then(function(resp) {
                            var promise = RequestTrackingService.add(resp.data.request_id), elapsed = Date.now() - start, remaining = elapsed < config.getAnimationTimeoutMs() ? config.getAnimationTimeoutMs() - elapsed : 0;
                            $timeout(function() {
                                osd.editing = !1, osd.saved = !0, $timeout(function() {
                                    osd.saved = !1;
                                }, config.getAnimationTimeoutMs()), promise.then(function() {
                                    osd._reweight = angular.copy(osd.reweight);
                                });
                            }, remaining);
                        }, ModalHelpers.makeOnError(modal));
                    }, config.getEditDebounceMs()))));
                };
                var configClickHandler = makeCommandHandler("configText"), repairClickHandler = requestRepairPermission(makeCommandHandler("repairText"));
                ServerService.get($scope.fqdn).then(function(server) {
                    $scope.server = server;
                    var r = _.reduce(server.services, function(results, service) {
                        if ("osd" === service.type) {
                            var osd = {
                                id: service.id,
                                running: service.running
                            };
                            results.osds[osd.id] = osd, results.ids.push(osd.id);
                        }
                        return results;
                    }, {
                        osds: {},
                        ids: []
                    });
                    OSDService.getSet(r.ids).then(function(osds) {
                        _.each(osds, function(osd, index) {
                            addUIMetadataToOSDData(osd, index), osd.repairDisabled = !osd.up, osd.editDisabled = !osd.up || !osd["in"], 
                            _.extend(r.osds[osd.id], osd);
                        }), $scope.osds = _.sortBy(_.values(r.osds), function(osd) {
                            return osd.id;
                        }), $scope.up = !0, $rootScope.keyTimer = $timeout(refreshOSDModels, config.getPollTimeoutMs());
                    });
                });
            };
            return [ "$q", "$log", "$scope", "$routeParams", "ClusterService", "ServerService", "$location", "OSDService", "$modal", "$timeout", "RequestTrackingService", "PoolService", "ConfigurationService", "$rootScope", OSDHostController ];
        });
    }(), function() {
        "use strict";
        define("helpers/pool-helpers", [ "lodash" ], function(_) {
            function roundUpToNextPowerOfTwo(num) {
                return num--, num |= num >> 1, num |= num >> 2, num |= num >> 4, num |= num >> 8, 
                num |= num >> 16, num++, num;
            }
            function calculatePGNum(osdcount, size, pgmax) {
                var pgnum = roundUpToNextPowerOfTwo(100 * osdcount / size);
                return pgnum > pgmax && (pgnum = pgmax), pgnum;
            }
            function validateMaxMin(fieldName, newValue, min, max) {
                return min > newValue ? (this[fieldName] = 1, !1) : newValue > max ? (this[fieldName] = max, 
                !1) : !0;
            }
            function getActiveRule(ruleset, maxPoolPgNum, size) {
                return _.reduce(ruleset.rules, function(result, rule) {
                    var active_rule = result.active_rule, osd_count = result.osd_count;
                    return size >= rule.min_size && size <= rule.max_size && (active_rule = rule.id, 
                    osd_count = rule.osd_count), {
                        min_size: Math.min(rule.min_size, result.min_size),
                        max_size: Math.max(rule.max_size, result.max_size),
                        active_rule: active_rule,
                        osd_count: osd_count
                    };
                }, {
                    min_size: maxPoolPgNum,
                    max_size: 1,
                    active_rule: 0,
                    osd_count: 0
                });
            }
            function makeReset($scope, options) {
                return options = options || {
                    pgnumReset: !0
                }, function() {
                    var defaults = $scope.defaults;
                    if ($scope.pool.name = defaults.name, $scope.pool.size = defaults.size, $scope.pool.crush_ruleset = defaults.crush_ruleset, 
                    options.pgnumReset) {
                        var ruleset = $scope.crushrulesets[defaults.crush_ruleset], limits = getActiveRule(ruleset, defaults.mon_max_pool_pg_num, $scope.pool.size), pgnum = calculatePGNum(limits.osd_count, $scope.pool.size, defaults.mon_max_pool_pg_num);
                        $scope.pool.pg_num !== pgnum && ($scope.pool.pg_num = pgnum);
                    } else $scope.pool.pg_num = defaults.pg_num;
                };
            }
            function addWatches($scope) {
                $scope.$watch("pool.name", function(newValue) {
                    return _.find($scope.poolNames, function(name) {
                        return name === newValue;
                    }) ? void $scope.poolForm.name.$setValidity("duplicate", !1) : ($scope.poolForm.name.$setValidity("duplicate", !0), 
                    void $scope.poolForm.name.$setValidity("server", !0));
                }), $scope.$watch("pool.size", function(newValue) {
                    if (!_.isNumber(newValue)) return void ($scope.poolForm.size.$error.number = !0);
                    if (!$scope.isEdit) {
                        var ruleset = $scope.crushrulesets[$scope.pool.crush_ruleset], limits = getActiveRule(ruleset, $scope.defaults.mon_max_pool_pg_num, newValue);
                        $scope.limits = limits, validateMaxMin.call($scope.pool, "size", newValue, limits.min_size, limits.max_size) && ($scope.pool.pg_num = calculatePGNum(limits.osd_count, newValue, $scope.defaults.mon_max_pool_pg_num), 
                        $scope.crushrulesets[$scope.pool.crush_ruleset].active_sub_rule = limits.active_rule);
                    }
                    $scope.poolForm.size.$setValidity("server", !0);
                }), $scope.$watch("pool.pg_num", function(newValue) {
                    return _.isNumber(newValue) ? ($scope.poolForm.pg_num.$error.number = !1, $scope.poolForm.pg_num.$pristine = !0, 
                    validateMaxMin.call($scope.pool, "pg_num", newValue, 1, $scope.defaults.mon_max_pool_pg_num), 
                    void $scope.poolForm.pg_num.$setValidity("server", !0)) : void ($scope.poolForm.pg_num.$error.number = !0);
                }), $scope.$watch("pool.crush_ruleset", function(newValue, oldValue) {
                    $scope.pool.size = $scope.defaults.size, $scope.crushrulesets[newValue].active_sub_rule = 0, 
                    $scope.crushrulesets[oldValue].active_sub_rule = 0, $scope.poolForm.crush_ruleset.$setValidity("server", !0);
                });
            }
            function normalizeCrushRulesets(crushrulesets) {
                return _.map(crushrulesets, function(set) {
                    var rules = _.map(set.rules, function(rule, index) {
                        return {
                            id: index,
                            name: rule.name,
                            min_size: rule.min_size,
                            max_size: rule.max_size,
                            osd_count: rule.osd_count
                        };
                    });
                    return {
                        id: set.id,
                        rules: rules,
                        active_sub_rule: 0
                    };
                });
            }
            function errorOnPoolSave($scope, $model) {
                return function(resp) {
                    var errorInField = !1, fields = [ "name", "size", "pg_num", "crush_ruleset" ];
                    _.each(fields, function(field) {
                        _.has(resp.data, field) && ($scope.poolForm[field].$setValidity("server", !1), $scope.poolForm[field].$error.server = resp.data[field].join(", "), 
                        errorInField = !0);
                    }), errorInField || ModalHelpers.makeOnError($modal({
                        show: !1
                    }))();
                };
            }
            function poolDefaults() {
                return {
                    name: "",
                    size: 2,
                    crush_ruleset: 0,
                    pg_num: 100
                };
            }
            return {
                calculatePGNum: calculatePGNum,
                validateMaxMin: validateMaxMin,
                roundUpToNextPowerOfTwo: roundUpToNextPowerOfTwo,
                getActiveRule: getActiveRule,
                makeReset: makeReset,
                addWatches: addWatches,
                defaults: poolDefaults,
                normalizeCrushRulesets: normalizeCrushRulesets,
                errorOnPoolSave: errorOnPoolSave
            };
        });
    }(), function() {
        "use strict";
        define("controllers/pool-new", [ "lodash", "helpers/pool-helpers", "helpers/modal-helpers" ], function(_, PoolHelpers, ModalHelpers) {
            var poolDefaults = PoolHelpers.defaults(), PoolNewController = function($location, $log, $q, $scope, PoolService, ClusterService, CrushService, ToolService, RequestTrackingService, $modal) {
                var self = this;
                $scope.clusterName = ClusterService.clusterModel.name, $scope.breadcrumbs = [ {
                    text: "管理 (" + $scope.clusterName + ")"
                }, {
                    text: "Pools",
                    href: "#/pool"
                }, {
                    text: "创建",
                    active: !0
                } ], $scope.isEdit = !1, $scope.cancel = function() {
                    $location.path("/pool");
                }, $scope.reset = PoolHelpers.makeReset($scope), $scope.ttReset = {
                    title: "重置"
                }, $scope.ttCancel = {
                    title: "取消"
                }, $scope.ttCreate = {
                    title: "创建"
                }, $scope.create = function() {
                    $scope.poolForm.$invalid || PoolService.create($scope.pool).then(function(resp) {
                        var modal;
                        return 202 === resp.status ? (RequestTrackingService.add(resp.data.request_id), 
                        modal = ModalHelpers.SuccessfulRequest($modal, {
                            title: "创建成功",
                            container: ".manageApp"
                        }), void (modal.$scope.$hide = _.wrap(modal.$scope.$hide, function($hide) {
                            $hide(), $location.path("/pool");
                        }))) : void $log.error("Unexpected response from PoolService.create", resp);
                    }, PoolHelpers.errorOnPoolSave($scope, $modal));
                };
                var promises = [ PoolService.defaults(), CrushService.getList(), ToolService.config("mon_max_pool_pg_num"), PoolService.getList() ];
                $q.all(promises).then(function(results) {
                    var result = _.chain(results), cephDefaults = result.shift().value();
                    self.crushrulesets = result.shift().value();
                    var mergedDefaults = _.extend(poolDefaults, {
                        size: cephDefaults.size,
                        crush_ruleset: cephDefaults.crush_ruleset,
                        mon_max_pool_pg_num: parseInt(result.shift().value().value, 10)
                    }), poolNames = _.pluck(result.shift().value(), "name");
                    $scope.poolNames = poolNames, $scope.defaults = mergedDefaults, $scope.crushrulesets = PoolHelpers.normalizeCrushRulesets(self.crushrulesets), 
                    $scope.pool = {
                        name: mergedDefaults.name,
                        size: mergedDefaults.size,
                        crush_ruleset: mergedDefaults.crush_ruleset,
                        pg_num: mergedDefaults.pg_num
                    }, PoolHelpers.addWatches($scope), $scope.up = !0;
                });
            };
            return [ "$location", "$log", "$q", "$scope", "PoolService", "ClusterService", "CrushService", "ToolService", "RequestTrackingService", "$modal", PoolNewController ];
        });
    }(), function() {
        "use strict";
        define("controllers/tools", [ "lodash", "moment" ], function(_, moment) {
            var ToolController = function($q, $timeout, $location, $scope, ClusterService, ToolService, config) {
                if (null === ClusterService.clusterId) return void $location.path(config.getFirstViewPath());
                $scope.clusterName = ClusterService.clusterModel.name, $scope.breadcrumbs = [ {
                    text: "管理 (" + $scope.clusterName + ")"
                }, {
                    text: "日志",
                    active: !0
                } ], $scope.logui = "spinner";
                var promises = [ ToolService.log() ];
                $q.all(promises).then(function(results) {
                    !function(logs) {
                        if (0 === logs.length) return void ($scope.logui = "empty");
                        var lines = _.filter(logs.lines.split("\n").reverse(), function(line) {
                            return !("" === line || void 0 === line);
                        });
                        $scope.logs = _.map(lines, function(log) {
                            var line = log.split(" ");
                            return {
                                timestamp: moment(line[0] + " " + line[1]).format("l HH:mm:SS ZZ"),
                                unit: line[2],
                                address: line[3] + " " + line[4],
                                rest: line.slice(6).join(" ")
                            };
                        }), $scope.logui = "logs";
                    }(results[0]), $scope.up = !0;
                });
            };
            return [ "$q", "$timeout", "$location", "$scope", "ClusterService", "ToolService", "ConfigurationService", ToolController ];
        });
    }(), function() {
        "use strict";
        define("controllers/pool-modify", [ "lodash", "helpers/pool-helpers", "helpers/modal-helpers", "helpers/error-helpers" ], function(_, PoolHelpers, ModalHelpers, ErrorHelpers) {
            var PoolModifyController = function($log, $q, $scope, PoolService, ClusterService, CrushService, ToolService, $location, $routeParams, $modal, RequestTrackingService) {
                var errorHelpers = ErrorHelpers.makeFunctions($q, $log);
                $scope.modify = !1, $scope.clusterName = ClusterService.clusterModel.name, $scope.breadcrumbs = [ {
                    text: "管理 (" + $scope.clusterName + ")"
                }, {
                    text: "Pools",
                    href: "#/pool"
                }, {
                    text: "编辑",
                    active: !0
                } ], $scope.id = $routeParams.id, $scope.isEdit = !0, $scope.cancel = function() {
                    $location.path("/pool");
                }, $scope.reset = PoolHelpers.makeReset($scope, {
                    pgnumReset: !1
                }), $scope.ttBack = {
                    title: "后退"
                }, $scope.ttReset = {
                    title: "重置"
                }, $scope.ttSave = {
                    title: "保存"
                }, $scope.ttDelete = {
                    title: "删除"
                }, $scope.remove = function(id) {
                    $log.debug("deleting " + id);
                    var modal = $modal({
                        title: "删除'" + $scope.pool.name + "' Pool，你确定吗？",
                        content: "此操作完成后无法撤销，请确定后再执行！",
                        template: "views/delete-modal.html"
                    });
                    modal.$scope.id = id, modal.$scope.confirm = function() {
                        modal.$scope.$hide(), errorHelpers.intercept304Error(PoolService.remove(modal.$scope.id)).then(function(result) {
                            if (202 === result.status) {
                                RequestTrackingService.add(result.data.request_id);
                                var okmodal = ModalHelpers.SuccessfulRequest($modal, {
                                    title: "删除成功"
                                });
                                return void (okmodal.$scope.$hide = _.wrap(okmodal.$scope.$hide, function($hide) {
                                    $hide(), $location.path("/pool");
                                }));
                            }
                            $log.error("Unexpected response from PoolService.remove", result);
                        }, ModalHelpers.makeOnError($modal({
                            show: !1
                        }), function() {
                            $location.path("/pool");
                        }));
                    };
                }, $scope.modify = function(id) {
                    if ($log.debug("pool " + id + ", form is dirty " + $scope.poolForm.$dirty), !$scope.poolForm.$invalid) {
                        var changes = _.reduce([ "name", "size", "pg_num", "crush_ruleset" ], function(result, key) {
                            return $scope.poolForm[key].$dirty && (result[key] = $scope.poolForm[key].$modelValue), 
                            result;
                        }, {});
                        $log.debug(changes), _.isEmpty(changes) || errorHelpers.intercept304Error(PoolService.patch(id, changes)).then(function(result) {
                            if (202 === result.status) {
                                RequestTrackingService.add(result.data.request_id);
                                var okmodal = ModalHelpers.SuccessfulRequest($modal, {
                                    title: "修改成功"
                                });
                                return void (okmodal.$scope.$hide = _.wrap(okmodal.$scope.$hide, function($hide) {
                                    $hide(), $location.path("/pool");
                                }));
                            }
                            $log.error("Unexpected response from PoolService.patch", result);
                        }, PoolHelpers.errorOnPoolSave($scope, $modal));
                    }
                };
                var promises = [ PoolService.get($scope.id), CrushService.getList() ];
                $q.all(promises).then(function(results) {
                    $scope.pool = results[0], $scope.defaults = angular.copy($scope.pool), this.crushrulesets = results[1], 
                    $scope.crushrulesets = PoolHelpers.normalizeCrushRulesets(this.crushrulesets), $scope.up = !0, 
                    PoolHelpers.addWatches($scope);
                }.bind(this));
            };
            return [ "$log", "$q", "$scope", "PoolService", "ClusterService", "CrushService", "ToolService", "$location", "$routeParams", "$modal", "RequestTrackingService", PoolModifyController ];
        });
    }(), function() {
        "use strict";
        define("navbar/controllers/navbar", [ "lodash" ], function() {
            var NavbarController = function($log, $scope) {
                $scope.navbarTemplate = "views/breadcrumb.html", $scope.title = {
                    dashboard: "概况",
                    bench: "工作台",
                    chart: "图表",
                    manage: "管理"
                }, $scope.dashboard = function() {
                    document.location = "/dashboard/";
                }, $scope.workbench = function() {
                    document.location = "/dashboard/?target=workbench";
                }, $scope.graph = function() {
                    document.location = "/dashboard/?target=graph";
                };
            };
            return [ "$log", "$scope", NavbarController ];
        });
    }(), function(window, angular, undefined) {
        "use strict";
        function $RouteProvider() {
            function inherit(parent, extra) {
                return angular.extend(new (angular.extend(function() {}, {
                    prototype: parent
                }))(), extra);
            }
            function pathRegExp(path, opts) {
                var insensitive = opts.caseInsensitiveMatch, ret = {
                    originalPath: path,
                    regexp: path
                }, keys = ret.keys = [];
                return path = path.replace(/([().])/g, "\\$1").replace(/(\/)?:(\w+)([\?|\*])?/g, function(_, slash, key, option) {
                    var optional = "?" === option ? option : null, star = "*" === option ? option : null;
                    return keys.push({
                        name: key,
                        optional: !!optional
                    }), slash = slash || "", "" + (optional ? "" : slash) + "(?:" + (optional ? slash : "") + (star && "(.+?)" || "([^/]+)") + (optional || "") + ")" + (optional || "");
                }).replace(/([\/$\*])/g, "\\$1"), ret.regexp = new RegExp("^" + path + "$", insensitive ? "i" : ""), 
                ret;
            }
            var routes = {};
            this.when = function(path, route) {
                if (routes[path] = angular.extend({
                    reloadOnSearch: !0
                }, route, path && pathRegExp(path, route)), path) {
                    var redirectPath = "/" == path[path.length - 1] ? path.substr(0, path.length - 1) : path + "/";
                    routes[redirectPath] = angular.extend({
                        redirectTo: path
                    }, pathRegExp(redirectPath, route));
                }
                return this;
            }, this.otherwise = function(params) {
                return this.when(null, params), this;
            }, this.$get = [ "$rootScope", "$location", "$routeParams", "$q", "$injector", "$http", "$templateCache", "$sce", function($rootScope, $location, $routeParams, $q, $injector, $http, $templateCache, $sce) {
                function switchRouteMatcher(on, route) {
                    var keys = route.keys, params = {};
                    if (!route.regexp) return null;
                    var m = route.regexp.exec(on);
                    if (!m) return null;
                    for (var i = 1, len = m.length; len > i; ++i) {
                        var key = keys[i - 1], val = "string" == typeof m[i] ? decodeURIComponent(m[i]) : m[i];
                        key && val && (params[key.name] = val);
                    }
                    return params;
                }
                function updateRoute() {
                    var next = parseRoute(), last = $route.current;
                    next && last && next.$$route === last.$$route && angular.equals(next.pathParams, last.pathParams) && !next.reloadOnSearch && !forceReload ? (last.params = next.params, 
                    angular.copy(last.params, $routeParams), $rootScope.$broadcast("$routeUpdate", last)) : (next || last) && (forceReload = !1, 
                    $rootScope.$broadcast("$routeChangeStart", next, last), $route.current = next, next && next.redirectTo && (angular.isString(next.redirectTo) ? $location.path(interpolate(next.redirectTo, next.params)).search(next.params).replace() : $location.url(next.redirectTo(next.pathParams, $location.path(), $location.search())).replace()), 
                    $q.when(next).then(function() {
                        if (next) {
                            var template, templateUrl, locals = angular.extend({}, next.resolve);
                            return angular.forEach(locals, function(value, key) {
                                locals[key] = angular.isString(value) ? $injector.get(value) : $injector.invoke(value);
                            }), angular.isDefined(template = next.template) ? angular.isFunction(template) && (template = template(next.params)) : angular.isDefined(templateUrl = next.templateUrl) && (angular.isFunction(templateUrl) && (templateUrl = templateUrl(next.params)), 
                            templateUrl = $sce.getTrustedResourceUrl(templateUrl), angular.isDefined(templateUrl) && (next.loadedTemplateUrl = templateUrl, 
                            template = $http.get(templateUrl, {
                                cache: $templateCache
                            }).then(function(response) {
                                return response.data;
                            }))), angular.isDefined(template) && (locals.$template = template), $q.all(locals);
                        }
                    }).then(function(locals) {
                        next == $route.current && (next && (next.locals = locals, angular.copy(next.params, $routeParams)), 
                        $rootScope.$broadcast("$routeChangeSuccess", next, last));
                    }, function(error) {
                        next == $route.current && $rootScope.$broadcast("$routeChangeError", next, last, error);
                    }));
                }
                function parseRoute() {
                    var params, match;
                    return angular.forEach(routes, function(route, path) {
                        !match && (params = switchRouteMatcher($location.path(), route)) && (match = inherit(route, {
                            params: angular.extend({}, $location.search(), params),
                            pathParams: params
                        }), match.$$route = route);
                    }), match || routes[null] && inherit(routes[null], {
                        params: {},
                        pathParams: {}
                    });
                }
                function interpolate(string, params) {
                    var result = [];
                    return angular.forEach((string || "").split(":"), function(segment, i) {
                        if (0 === i) result.push(segment); else {
                            var segmentMatch = segment.match(/(\w+)(.*)/), key = segmentMatch[1];
                            result.push(params[key]), result.push(segmentMatch[2] || ""), delete params[key];
                        }
                    }), result.join("");
                }
                var forceReload = !1, $route = {
                    routes: routes,
                    reload: function() {
                        forceReload = !0, $rootScope.$evalAsync(updateRoute);
                    }
                };
                return $rootScope.$on("$locationChangeSuccess", updateRoute), $route;
            } ];
        }
        function $RouteParamsProvider() {
            this.$get = function() {
                return {};
            };
        }
        function ngViewFactory($route, $anchorScroll, $animate) {
            return {
                restrict: "ECA",
                terminal: !0,
                priority: 400,
                transclude: "element",
                link: function(scope, $element, attr, ctrl, $transclude) {
                    function cleanupLastView() {
                        currentScope && (currentScope.$destroy(), currentScope = null), currentElement && ($animate.leave(currentElement), 
                        currentElement = null);
                    }
                    function update() {
                        var locals = $route.current && $route.current.locals, template = locals && locals.$template;
                        if (template) {
                            var newScope = scope.$new(), current = $route.current, clone = $transclude(newScope, function(clone) {
                                $animate.enter(clone, null, currentElement || $element, function() {
                                    !angular.isDefined(autoScrollExp) || autoScrollExp && !scope.$eval(autoScrollExp) || $anchorScroll();
                                }), cleanupLastView();
                            });
                            currentElement = clone, currentScope = current.scope = newScope, currentScope.$emit("$viewContentLoaded"), 
                            currentScope.$eval(onloadExp);
                        } else cleanupLastView();
                    }
                    var currentScope, currentElement, autoScrollExp = attr.autoscroll, onloadExp = attr.onload || "";
                    scope.$on("$routeChangeSuccess", update), update();
                }
            };
        }
        function ngViewFillContentFactory($compile, $controller, $route) {
            return {
                restrict: "ECA",
                priority: -400,
                link: function(scope, $element) {
                    var current = $route.current, locals = current.locals;
                    $element.html(locals.$template);
                    var link = $compile($element.contents());
                    if (current.controller) {
                        locals.$scope = scope;
                        var controller = $controller(current.controller, locals);
                        current.controllerAs && (scope[current.controllerAs] = controller), $element.data("$ngControllerController", controller), 
                        $element.children().data("$ngControllerController", controller);
                    }
                    link(scope);
                }
            };
        }
        var ngRouteModule = angular.module("ngRoute", [ "ng" ]).provider("$route", $RouteProvider);
        ngRouteModule.provider("$routeParams", $RouteParamsProvider), ngRouteModule.directive("ngView", ngViewFactory), 
        ngRouteModule.directive("ngView", ngViewFillContentFactory), ngViewFactory.$inject = [ "$route", "$anchorScroll", "$animate" ], 
        ngViewFillContentFactory.$inject = [ "$compile", "$controller", "$route" ];
    }(window, window.angular), define("angular-route", [ "angular" ], function() {}), 
    function() {
        "use strict";
        define("navbar/navbarModule", [ "angular", "./controllers/navbar", "angular-sanitize", "angular-route", "angular-animate" ], function(angular, navbarController) {
            var moduleName = "navbarModule";
            return angular.module(moduleName, [ "ngSanitize", "ngRoute", "ngAnimate" ]).controller("NavbarController", navbarController), 
            moduleName;
        });
    }(), function() {
        "use strict";
        define("services/menu", [ "lodash" ], function(_) {
            var Service = function() {
                this.menus = [ {
                    label: "集群",
                    id: "cluster",
                    href: "/",
                    active: !0
                }, {
                    label: "OSD",
                    id: "osd",
                    href: "/osd",
                    active: !1
                }, {
                    label: "Pools",
                    id: "pool",
                    href: "/pool",
                    active: !1
                }, {
                    label: "日志",
                    id: "tools",
                    href: "/tools",
                    active: !1
                } ];
            };
            return Service.prototype = _.extend(Service.prototype, {
                setActive: function(menuId) {
                    this.menus = _.map(this.menus, function(menu) {
                        return menu.active = menu.id === menuId, menu;
                    });
                },
                getMenus: function() {
                    return this.menus;
                }
            }), [ Service ];
        });
    }(), function() {
        "use strict";
        define("run", [ "angular" ], function() {
            var runBlock = function($rootScope, MenuService, $location, $timeout, $log) {
                $rootScope.$on("$routeChangeSuccess", function(event, to, from) {
                    MenuService.setActive(to.menuId), $rootScope.menus = MenuService.getMenus(), $log.debug("from " + (from && from.loadedTemplateUrl) + " to " + (to && to.loadedTemplateUrl), to, from), 
                    from && "views/root.html" === from.loadedTemplateUrl && $rootScope.keyTimer && ($timeout.cancel($rootScope.keyTimer), 
                    $rootScope.keyTimer = void 0, $log.debug("canceling root key timer")), from && "views/pool.html" === from.loadedTemplateUrl && $rootScope.keyTimer && ($timeout.cancel($rootScope.keyTimer), 
                    $rootScope.keyTimer = void 0, $log.debug("canceling pool key timer")), from && "views/osd-host.html" === from.loadedTemplateUrl && $rootScope.keyTimer && ($timeout.cancel($rootScope.keyTimer), 
                    $rootScope.keyTimer = void 0, $log.debug("canceling osd host key timer"));
                }), $rootScope.showRequests = function() {
                    angular.element(document.getElementsByClassName("RequestManagement")[0]).scope().show();
                }, $rootScope.switchView = function(view) {
                    $location.path(view);
                };
            };
            return [ "$rootScope", "MenuService", "$location", "$timeout", "$log", runBlock ];
        });
    }(), function() {
        "use strict";
        define("controllers/first", [ "lodash", "helpers/modal-helpers" ], function(_) {
            var clusterPollIntervalMs = 1e3, FirstTimeController = function($q, $log, $timeout, $location, $scope, KeyService, ClusterService, $modal) {
                var promises = [ KeyService.getList() ];
                $scope.addDisabled = !0, $scope.debug = !1, $scope.clusterDiscoveryTimedOut = !1, 
                $q.all(promises).then(function(results) {
                    return $scope.up = !0, null !== ClusterService.clusterId ? void $location.path("/") : void function(keys) {
                        $scope.hosts = _.reduce(keys, function(result, key) {
                            return "pre" === key.status ? result.pre.push(key) : "accepted" === key.status ? result.accepted.push(key) : result.blocked.push(key), 
                            result;
                        }, {
                            accepted: [],
                            pre: [],
                            blocked: []
                        }), $scope.addDisabled = !1, $scope.acceptAll = function() {
                            function checkClusterUp() {
                                ClusterService.getList().then(function(clusters) {
                                    return clusters.length ? ($timeout.cancel($scope.checkTimeout), $timeout.cancel($scope.remainingTimeout), 
                                    modal.$scope.remaining = "0", modal.$scope.closeDisabled = !1, void (modal.$scope.content = "Cluster Initialized.")) : void ($scope.checkTimeout = $timeout(checkClusterUp, clusterPollIntervalMs));
                                });
                            }
                            function decrement() {
                                modal.$scope.remaining--, $scope.remainingTimeout = $timeout(decrement, 1e3);
                            }
                            var ids = _.map($scope.hosts.pre, function(key) {
                                return key.id;
                            });
                            $log.debug(ids), $scope.addDisabled = !0;
                            var modal = $modal({
                                title: '<i class="text-success fa fa-check-circle fa-lg"></i> Accept Request Sent',
                                template: "views/new-install-modal.html",
                                content: '<p><i class="fa fa-spinner fa-spin"></i> Waiting for First Cluster to Join</p>',
                                backdrop: "static",
                                html: !0
                            });
                            modal.$scope.closeDisabled = !0;
                            var _$hide = modal.$scope.$hide;
                            modal.$scope.skipClusterCheck = function() {
                                _$hide(), $scope.clusterDiscoveryTimedOut = !0;
                            }, modal.$scope.$hide = _.wrap(_$hide, function($hide) {
                                $hide(), ClusterService.initialize().then(function() {
                                    $location.path("/");
                                });
                            }), modal.$scope.remaining = 180, KeyService.accept(ids).then(function(resp) {
                                $log.debug(resp), 204 === resp.status && ($scope.checkTimeout = $timeout(checkClusterUp, clusterPollIntervalMs), 
                                $timeout(function() {
                                    $timeout.cancel($scope.checkTimeout), $timeout.cancel($scope.remainingTimeout), 
                                    $scope.clusterDiscoveryTimedOut = !0, _$hide();
                                }, 18e4), $scope.remainingTimeout = $timeout(decrement, 0)), $scope.addDisabled = !1;
                            }, function(resp) {
                                modal.$scope.content = '<i class="text-danger fa fa-exclamation-circle fa-lg"></i> Error ' + resp.status + ". Please try reloading the page and logging in again.</p><h4>Raw Response</h4><p><pre>" + resp.data + "</pre></p>", 
                                $scope.addDisabled = !1;
                            });
                        };
                    }(results[0]);
                });
            };
            return [ "$q", "$log", "$timeout", "$location", "$scope", "KeyService", "ClusterService", "$modal", FirstTimeController ];
        });
    }(), function() {
        "use strict";
        define("controllers/userdropdown", [ "lodash" ], function() {
            var UserDropDownController = function($location, $scope, ClusterResolver, ClusterService, UserService, config, $modal, $http) {
                ClusterResolver.then(function() {
                    return null === ClusterService.clusterId ? void $location.path(config.getFirstViewPath()) : ($scope.userdropdownTemplate = "views/userdropdown.html", 
                    $scope.clusterName = ClusterService.clusterModel.name, void UserService.me().then(function(me) {
                        $scope.username = me.username, $scope.userdropdown = [ {
                            clazz: "fa fa-user fa-lg fa-2x fa-fw",
                            userinfo: !0
                        }, {
                            divider: !0
                        }, {
                            text: '<i class="fa fa-fw fa-info-circle"></i> 关于Calamari',
                            click: function($event) {
                                $event.preventDefault(), $event.stopPropagation();
                                var modal = $modal({
                                    title: '<i class="fa fa-lg fa-info-circle"></i>  关于Calamari',
                                    html: !0,
                                    template: "views/about-modal.html"
                                });
                                modal.$scope.version = {
                                    calamariAPI: "1",
                                    client: window.inktank.commit
                                }, $http.get("/api/v2/info").then(function(resp) {
                                    resp.data.version && (modal.$scope.version.calamariAPI = resp.data.version);
                                });
                            }
                        }, {
                            text: '<i class="fa fa-fw fa-power-off"></i> 登出',
                            click: function($event) {
                                $event.preventDefault(), $event.stopPropagation(), UserService.logout().then(function() {
                                    document.location = "/login/";
                                });
                            }
                        } ];
                    }));
                });
            };
            return [ "$location", "$scope", "ClusterResolver", "ClusterService", "UserService", "ConfigurationService", "$modal", "$http", UserDropDownController ];
        });
    }(), function() {
        "use strict";
        define("controllers/bell", [], function() {
            var BellController = function() {};
            return [ "$scope", BellController ];
        });
    }(), function() {
        "use strict";
        define("services/configuration", [ "lodash" ], function(_) {
            var Service = function() {};
            return Service.prototype = _.extend(Service.prototype, {
                getPollTimeoutMs: function() {
                    return 2e4;
                },
                getAnimationTimeoutMs: function() {
                    return 1e3;
                },
                getFirstViewPath: function() {
                    return "/first";
                },
                getEditDebounceMs: function() {
                    return 3e3;
                }
            }), [ Service ];
        });
    }(), define("services/error", [ "lodash" ], function(_) {
        "use strict";
        var ErrorService = function($log, $modal) {
            var once = _.once(function() {
                var modal = $modal({
                    title: '<i class="text-danger fa fa-exclamation-circle"></i>无法访问',
                    content: "您的登陆已过期，请尝试重新登陆。",
                    show: !0,
                    html: !0,
                    backdrop: "static"
                });
                modal.$scope.$hide = function() {
                    document.location = "/login/";
                };
            }), Service = {
                errorInterceptor: function(response) {
                    return 403 === response.status ? (once(), !1) : response;
                }
            };
            return Service;
        };
        return [ "$log", "$modal", "$location", ErrorService ];
    }), function() {
        "use strict";
        define("git", [ "angular" ], function() {
            var runBlock = function() {
                window.inktank = {
                    commit: "v1.2.2-32-931ee58-dirty"
                };
            };
            return [ runBlock ];
        });
    }(), function(window, angular, undefined) {
        "use strict";
        angular.module("ngCookies", [ "ng" ]).factory("$cookies", [ "$rootScope", "$browser", function($rootScope, $browser) {
            function push() {
                var name, value, browserCookies, updated;
                for (name in lastCookies) isUndefined(cookies[name]) && $browser.cookies(name, undefined);
                for (name in cookies) value = cookies[name], angular.isString(value) ? value !== lastCookies[name] && ($browser.cookies(name, value), 
                updated = !0) : angular.isDefined(lastCookies[name]) ? cookies[name] = lastCookies[name] : delete cookies[name];
                if (updated) {
                    updated = !1, browserCookies = $browser.cookies();
                    for (name in cookies) cookies[name] !== browserCookies[name] && (isUndefined(browserCookies[name]) ? delete cookies[name] : cookies[name] = browserCookies[name], 
                    updated = !0);
                }
            }
            var lastBrowserCookies, cookies = {}, lastCookies = {}, runEval = !1, copy = angular.copy, isUndefined = angular.isUndefined;
            return $browser.addPollFn(function() {
                var currentCookies = $browser.cookies();
                lastBrowserCookies != currentCookies && (lastBrowserCookies = currentCookies, copy(currentCookies, lastCookies), 
                copy(currentCookies, cookies), runEval && $rootScope.$apply());
            })(), runEval = !0, $rootScope.$watch(push), cookies;
        } ]).factory("$cookieStore", [ "$cookies", function($cookies) {
            return {
                get: function(key) {
                    var value = $cookies[key];
                    return value ? angular.fromJson(value) : value;
                },
                put: function(key, value) {
                    $cookies[key] = angular.toJson(value);
                },
                remove: function(key) {
                    delete $cookies[key];
                }
            };
        } ]);
    }(window, window.angular), define("angular-cookies", [ "angular" ], function() {}), 
    function(window, angular, undefined) {
        "use strict";
        function isValidDottedPath(path) {
            return null != path && "" !== path && "hasOwnProperty" !== path && MEMBER_NAME_REGEX.test("." + path);
        }
        function lookupDottedPath(obj, path) {
            if (!isValidDottedPath(path)) throw $resourceMinErr("badmember", 'Dotted member path "@{0}" is invalid.', path);
            for (var keys = path.split("."), i = 0, ii = keys.length; ii > i && obj !== undefined; i++) {
                var key = keys[i];
                obj = null !== obj ? obj[key] : undefined;
            }
            return obj;
        }
        function shallowClearAndCopy(src, dst) {
            dst = dst || {}, angular.forEach(dst, function(value, key) {
                delete dst[key];
            });
            for (var key in src) src.hasOwnProperty(key) && "$" !== key.charAt(0) && "$" !== key.charAt(1) && (dst[key] = src[key]);
            return dst;
        }
        var $resourceMinErr = angular.$$minErr("$resource"), MEMBER_NAME_REGEX = /^(\.[a-zA-Z_$][0-9a-zA-Z_$]*)+$/;
        angular.module("ngResource", [ "ng" ]).factory("$resource", [ "$http", "$q", function($http, $q) {
            function encodeUriSegment(val) {
                return encodeUriQuery(val, !0).replace(/%26/gi, "&").replace(/%3D/gi, "=").replace(/%2B/gi, "+");
            }
            function encodeUriQuery(val, pctEncodeSpaces) {
                return encodeURIComponent(val).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, pctEncodeSpaces ? "%20" : "+");
            }
            function Route(template, defaults) {
                this.template = template, this.defaults = defaults || {}, this.urlParams = {};
            }
            function resourceFactory(url, paramDefaults, actions) {
                function extractParams(data, actionParams) {
                    var ids = {};
                    return actionParams = extend({}, paramDefaults, actionParams), forEach(actionParams, function(value, key) {
                        isFunction(value) && (value = value()), ids[key] = value && value.charAt && "@" == value.charAt(0) ? lookupDottedPath(data, value.substr(1)) : value;
                    }), ids;
                }
                function defaultResponseInterceptor(response) {
                    return response.resource;
                }
                function Resource(value) {
                    shallowClearAndCopy(value || {}, this);
                }
                var route = new Route(url);
                return actions = extend({}, DEFAULT_ACTIONS, actions), forEach(actions, function(action, name) {
                    var hasBody = /^(POST|PUT|PATCH)$/i.test(action.method);
                    Resource[name] = function(a1, a2, a3, a4) {
                        var data, success, error, params = {};
                        switch (arguments.length) {
                          case 4:
                            error = a4, success = a3;

                          case 3:
                          case 2:
                            if (!isFunction(a2)) {
                                params = a1, data = a2, success = a3;
                                break;
                            }
                            if (isFunction(a1)) {
                                success = a1, error = a2;
                                break;
                            }
                            success = a2, error = a3;

                          case 1:
                            isFunction(a1) ? success = a1 : hasBody ? data = a1 : params = a1;
                            break;

                          case 0:
                            break;

                          default:
                            throw $resourceMinErr("badargs", "Expected up to 4 arguments [params, data, success, error], got {0} arguments", arguments.length);
                        }
                        var isInstanceCall = this instanceof Resource, value = isInstanceCall ? data : action.isArray ? [] : new Resource(data), httpConfig = {}, responseInterceptor = action.interceptor && action.interceptor.response || defaultResponseInterceptor, responseErrorInterceptor = action.interceptor && action.interceptor.responseError || undefined;
                        forEach(action, function(value, key) {
                            "params" != key && "isArray" != key && "interceptor" != key && (httpConfig[key] = copy(value));
                        }), hasBody && (httpConfig.data = data), route.setUrlParams(httpConfig, extend({}, extractParams(data, action.params || {}), params), action.url);
                        var promise = $http(httpConfig).then(function(response) {
                            var data = response.data, promise = value.$promise;
                            if (data) {
                                if (angular.isArray(data) !== !!action.isArray) throw $resourceMinErr("badcfg", "Error in resource configuration. Expected response to contain an {0} but got an {1}", action.isArray ? "array" : "object", angular.isArray(data) ? "array" : "object");
                                action.isArray ? (value.length = 0, forEach(data, function(item) {
                                    value.push(new Resource(item));
                                })) : (shallowClearAndCopy(data, value), value.$promise = promise);
                            }
                            return value.$resolved = !0, response.resource = value, response;
                        }, function(response) {
                            return value.$resolved = !0, (error || noop)(response), $q.reject(response);
                        });
                        return promise = promise.then(function(response) {
                            var value = responseInterceptor(response);
                            return (success || noop)(value, response.headers), value;
                        }, responseErrorInterceptor), isInstanceCall ? promise : (value.$promise = promise, 
                        value.$resolved = !1, value);
                    }, Resource.prototype["$" + name] = function(params, success, error) {
                        isFunction(params) && (error = success, success = params, params = {});
                        var result = Resource[name].call(this, params, this, success, error);
                        return result.$promise || result;
                    };
                }), Resource.bind = function(additionalParamDefaults) {
                    return resourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
                }, Resource;
            }
            var DEFAULT_ACTIONS = {
                get: {
                    method: "GET"
                },
                save: {
                    method: "POST"
                },
                query: {
                    method: "GET",
                    isArray: !0
                },
                remove: {
                    method: "DELETE"
                },
                "delete": {
                    method: "DELETE"
                }
            }, noop = angular.noop, forEach = angular.forEach, extend = angular.extend, copy = angular.copy, isFunction = angular.isFunction;
            return Route.prototype = {
                setUrlParams: function(config, params, actionUrl) {
                    var val, encodedVal, self = this, url = actionUrl || self.template, urlParams = self.urlParams = {};
                    forEach(url.split(/\W/), function(param) {
                        if ("hasOwnProperty" === param) throw $resourceMinErr("badname", "hasOwnProperty is not a valid parameter name.");
                        !new RegExp("^\\d+$").test(param) && param && new RegExp("(^|[^\\\\]):" + param + "(\\W|$)").test(url) && (urlParams[param] = !0);
                    }), url = url.replace(/\\:/g, ":"), params = params || {}, forEach(self.urlParams, function(_, urlParam) {
                        val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam], 
                        angular.isDefined(val) && null !== val ? (encodedVal = encodeUriSegment(val), url = url.replace(new RegExp(":" + urlParam + "(\\W|$)", "g"), encodedVal + "$1")) : url = url.replace(new RegExp("(/?):" + urlParam + "(\\W|$)", "g"), function(match, leadingSlashes, tail) {
                            return "/" == tail.charAt(0) ? tail : leadingSlashes + tail;
                        });
                    }), url = url.replace(/\/+$/, ""), url = url.replace(/\/\.(?=\w+($|\?))/, "."), 
                    config.url = url.replace(/\/\\\./, "/."), forEach(params, function(value, key) {
                        self.urlParams[key] || (config.params = config.params || {}, config.params[key] = value);
                    });
                }
            }, resourceFactory;
        } ]);
    }(window, window.angular), define("angular-resource", [ "angular" ], function() {}), 
    function() {
        var module = angular.module("restangular", []);
        module.provider("Restangular", function() {
            var Configurer = {};
            Configurer.init = function(object, config) {
                function RestangularResource(config, $http, url, configurer) {
                    var resource = {};
                    return _.each(_.keys(configurer), function(key) {
                        var value = configurer[key];
                        value.params = _.extend({}, value.params, config.defaultRequestParams[value.method.toLowerCase()]), 
                        _.isEmpty(value.params) && delete value.params, config.isSafe(value.method) ? resource[key] = function() {
                            return $http(_.extend(value, {
                                url: url
                            }));
                        } : resource[key] = function(data) {
                            return $http(_.extend(value, {
                                url: url,
                                data: data
                            }));
                        };
                    }), resource;
                }
                object.configuration = config;
                var safeMethods = [ "get", "head", "options", "trace", "getlist" ];
                config.isSafe = function(operation) {
                    return _.contains(safeMethods, operation.toLowerCase());
                };
                var absolutePattern = /^https?:\/\//i;
                config.isAbsoluteUrl = function(string) {
                    return _.isUndefined(config.absoluteUrl) || _.isNull(config.absoluteUrl) ? string && absolutePattern.test(string) : config.absoluteUrl;
                }, config.absoluteUrl = _.isUndefined(config.absoluteUrl) ? !1 : !0, object.setSelfLinkAbsoluteUrl = function(value) {
                    config.absoluteUrl = value;
                }, config.baseUrl = _.isUndefined(config.baseUrl) ? "" : config.baseUrl, object.setBaseUrl = function(newBaseUrl) {
                    return config.baseUrl = /\/$/.test(newBaseUrl) ? newBaseUrl.substring(0, newBaseUrl.length - 1) : newBaseUrl, 
                    this;
                }, config.extraFields = config.extraFields || [], object.setExtraFields = function(newExtraFields) {
                    return config.extraFields = newExtraFields, this;
                }, config.defaultHttpFields = config.defaultHttpFields || {}, object.setDefaultHttpFields = function(values) {
                    return config.defaultHttpFields = values, this;
                }, config.withHttpValues = function(httpLocalConfig, obj) {
                    return _.defaults(obj, httpLocalConfig, config.defaultHttpFields);
                }, config.encodeIds = _.isUndefined(config.encodeIds) ? !0 : config.encodeIds, object.setEncodeIds = function(encode) {
                    config.encodeIds = encode;
                }, config.defaultRequestParams = config.defaultRequestParams || {
                    get: {},
                    post: {},
                    put: {},
                    remove: {},
                    common: {}
                }, object.setDefaultRequestParams = function(param1, param2) {
                    var methods = [], params = param2 || param1;
                    return _.isUndefined(param2) ? methods.push("common") : _.isArray(param1) ? methods = param1 : methods.push(param1), 
                    _.each(methods, function(method) {
                        config.defaultRequestParams[method] = params;
                    }), this;
                }, object.requestParams = config.defaultRequestParams, config.defaultHeaders = config.defaultHeaders || {}, 
                object.setDefaultHeaders = function(headers) {
                    return config.defaultHeaders = headers, object.defaultHeaders = config.defaultHeaders, 
                    this;
                }, object.defaultHeaders = config.defaultHeaders, config.methodOverriders = config.methodOverriders || [], 
                object.setMethodOverriders = function(values) {
                    var overriders = _.extend([], values);
                    return config.isOverridenMethod("delete", overriders) && overriders.push("remove"), 
                    config.methodOverriders = overriders, this;
                }, config.jsonp = _.isUndefined(config.jsonp) ? !1 : config.jsonp, object.setJsonp = function(active) {
                    config.jsonp = active;
                }, config.isOverridenMethod = function(method, values) {
                    var search = values || config.methodOverriders;
                    return !_.isUndefined(_.find(search, function(one) {
                        return one.toLowerCase() === method.toLowerCase();
                    }));
                }, config.urlCreator = config.urlCreator || "path", object.setUrlCreator = function(name) {
                    if (!_.has(config.urlCreatorFactory, name)) throw new Error("URL Path selected isn't valid");
                    return config.urlCreator = name, this;
                }, config.restangularFields = config.restangularFields || {
                    id: "id",
                    route: "route",
                    parentResource: "parentResource",
                    restangularCollection: "restangularCollection",
                    cannonicalId: "__cannonicalId",
                    etag: "restangularEtag",
                    selfLink: "href",
                    get: "get",
                    getList: "getList",
                    put: "put",
                    post: "post",
                    remove: "remove",
                    head: "head",
                    trace: "trace",
                    options: "options",
                    patch: "patch",
                    getRestangularUrl: "getRestangularUrl",
                    getRequestedUrl: "getRequestedUrl",
                    putElement: "putElement",
                    addRestangularMethod: "addRestangularMethod",
                    getParentList: "getParentList",
                    clone: "clone",
                    ids: "ids",
                    httpConfig: "_$httpConfig",
                    reqParams: "reqParams",
                    one: "one",
                    all: "all",
                    several: "several",
                    oneUrl: "oneUrl",
                    allUrl: "allUrl",
                    customPUT: "customPUT",
                    customPOST: "customPOST",
                    customDELETE: "customDELETE",
                    customGET: "customGET",
                    customGETLIST: "customGETLIST",
                    customOperation: "customOperation",
                    doPUT: "doPUT",
                    doPOST: "doPOST",
                    doDELETE: "doDELETE",
                    doGET: "doGET",
                    doGETLIST: "doGETLIST",
                    fromServer: "$fromServer",
                    withConfig: "withConfig",
                    withHttpConfig: "withHttpConfig"
                }, object.setRestangularFields = function(resFields) {
                    return config.restangularFields = _.extend(config.restangularFields, resFields), 
                    this;
                }, config.isRestangularized = function(obj) {
                    return !!obj[config.restangularFields.one] || !!obj[config.restangularFields.all];
                }, config.setFieldToElem = function(field, elem, value) {
                    var properties = field.split("."), idValue = elem;
                    return _.each(_.initial(properties), function(prop) {
                        idValue[prop] = {}, idValue = idValue[prop];
                    }), idValue[_.last(properties)] = value, this;
                }, config.getFieldFromElem = function(field, elem) {
                    var properties = field.split("."), idValue = elem;
                    return _.each(properties, function(prop) {
                        idValue && (idValue = idValue[prop]);
                    }), angular.copy(idValue);
                }, config.setIdToElem = function(elem, id) {
                    return config.setFieldToElem(config.restangularFields.id, elem, id), this;
                }, config.getIdFromElem = function(elem) {
                    return config.getFieldFromElem(config.restangularFields.id, elem);
                }, config.isValidId = function(elemId) {
                    return "" !== elemId && !_.isUndefined(elemId) && !_.isNull(elemId);
                }, config.setUrlToElem = function(elem, url) {
                    return config.setFieldToElem(config.restangularFields.selfLink, elem, url), this;
                }, config.getUrlFromElem = function(elem) {
                    return config.getFieldFromElem(config.restangularFields.selfLink, elem);
                }, config.useCannonicalId = _.isUndefined(config.useCannonicalId) ? !1 : config.useCannonicalId, 
                object.setUseCannonicalId = function(value) {
                    return config.useCannonicalId = value, this;
                }, config.getCannonicalIdFromElem = function(elem) {
                    var cannonicalId = elem[config.restangularFields.cannonicalId], actualId = config.isValidId(cannonicalId) ? cannonicalId : config.getIdFromElem(elem);
                    return actualId;
                }, config.responseInterceptors = config.responseInterceptors || [], config.defaultResponseInterceptor = function(data, operation, what, url, response, deferred) {
                    return data;
                }, config.responseExtractor = function(data, operation, what, url, response, deferred) {
                    var interceptors = angular.copy(config.responseInterceptors);
                    interceptors.push(config.defaultResponseInterceptor);
                    var theData = data;
                    return _.each(interceptors, function(interceptor) {
                        theData = interceptor(theData, operation, what, url, response, deferred);
                    }), theData;
                }, object.addResponseInterceptor = function(extractor) {
                    return config.responseInterceptors.push(extractor), this;
                }, object.setResponseInterceptor = object.addResponseInterceptor, object.setResponseExtractor = object.addResponseInterceptor, 
                config.requestInterceptors = config.requestInterceptors || [], config.defaultInterceptor = function(element, operation, path, url, headers, params, httpConfig) {
                    return {
                        element: element,
                        headers: headers,
                        params: params,
                        httpConfig: httpConfig
                    };
                }, config.fullRequestInterceptor = function(element, operation, path, url, headers, params, httpConfig) {
                    var interceptors = angular.copy(config.requestInterceptors);
                    return interceptors.push(config.defaultInterceptor), _.reduce(interceptors, function(request, interceptor) {
                        return _.defaults(request, interceptor(element, operation, path, url, headers, params, httpConfig));
                    }, {});
                }, object.addRequestInterceptor = function(interceptor) {
                    return config.requestInterceptors.push(function(elem, operation, path, url, headers, params, httpConfig) {
                        return {
                            headers: headers,
                            params: params,
                            element: interceptor(elem, operation, path, url),
                            httpConfig: httpConfig
                        };
                    }), this;
                }, object.setRequestInterceptor = object.addRequestInterceptor, object.addFullRequestInterceptor = function(interceptor) {
                    return config.requestInterceptors.push(interceptor), this;
                }, object.setFullRequestInterceptor = object.addFullRequestInterceptor, config.errorInterceptor = config.errorInterceptor || function() {}, 
                object.setErrorInterceptor = function(interceptor) {
                    return config.errorInterceptor = interceptor, this;
                }, config.onBeforeElemRestangularized = config.onBeforeElemRestangularized || function(elem) {
                    return elem;
                }, object.setOnBeforeElemRestangularized = function(post) {
                    return config.onBeforeElemRestangularized = post, this;
                }, config.onElemRestangularized = config.onElemRestangularized || function(elem) {
                    return elem;
                }, object.setOnElemRestangularized = function(post) {
                    return config.onElemRestangularized = post, this;
                }, config.shouldSaveParent = config.shouldSaveParent || function() {
                    return !0;
                }, object.setParentless = function(values) {
                    return _.isArray(values) ? config.shouldSaveParent = function(route) {
                        return !_.contains(values, route);
                    } : _.isBoolean(values) && (config.shouldSaveParent = function() {
                        return !values;
                    }), this;
                }, config.suffix = _.isUndefined(config.suffix) ? null : config.suffix, object.setRequestSuffix = function(newSuffix) {
                    return config.suffix = newSuffix, this;
                }, config.transformers = config.transformers || {}, object.addElementTransformer = function(type, secondArg, thirdArg) {
                    var isCollection = null, transformer = null;
                    2 === arguments.length ? transformer = secondArg : (transformer = thirdArg, isCollection = secondArg);
                    var typeTransformers = config.transformers[type];
                    typeTransformers || (typeTransformers = config.transformers[type] = []), typeTransformers.push(function(coll, elem) {
                        return _.isNull(isCollection) || coll == isCollection ? transformer(elem) : elem;
                    });
                }, object.extendCollection = function(route, fn) {
                    return object.addElementTransformer(route, !0, fn);
                }, object.extendModel = function(route, fn) {
                    return object.addElementTransformer(route, !1, fn);
                }, config.transformElem = function(elem, isCollection, route, Restangular) {
                    if (!config.transformLocalElements && !elem[config.restangularFields.fromServer]) return elem;
                    var typeTransformers = config.transformers[route], changedElem = elem;
                    return typeTransformers && _.each(typeTransformers, function(transformer) {
                        changedElem = transformer(isCollection, changedElem);
                    }), config.onElemRestangularized(changedElem, isCollection, route, Restangular);
                }, config.transformLocalElements = _.isUndefined(config.transformLocalElements) ? !0 : config.transformLocalElements, 
                object.setTransformOnlyServerElements = function(active) {
                    config.transformLocalElements = !active;
                }, config.fullResponse = _.isUndefined(config.fullResponse) ? !1 : config.fullResponse, 
                object.setFullResponse = function(full) {
                    return config.fullResponse = full, this;
                }, config.urlCreatorFactory = {};
                var BaseCreator = function() {};
                BaseCreator.prototype.setConfig = function(config) {
                    return this.config = config, this;
                }, BaseCreator.prototype.parentsArray = function(current) {
                    for (var parents = []; current; ) parents.push(current), current = current[this.config.restangularFields.parentResource];
                    return parents.reverse();
                }, BaseCreator.prototype.resource = function(current, $http, localHttpConfig, callHeaders, callParams, what, etag, operation) {
                    var params = _.defaults(callParams || {}, this.config.defaultRequestParams.common), headers = _.defaults(callHeaders || {}, this.config.defaultHeaders);
                    etag && (config.isSafe(operation) ? headers["If-None-Match"] = etag : headers["If-Match"] = etag);
                    var url = this.base(current);
                    if (what) {
                        var add = "";
                        /\/$/.test(url) || (add += "/"), add += what, url += add;
                    }
                    return this.config.suffix && -1 === url.indexOf(this.config.suffix, url.length - this.config.suffix.length) && !this.config.getUrlFromElem(current) && (url += this.config.suffix), 
                    current[this.config.restangularFields.httpConfig] = void 0, RestangularResource(this.config, $http, url, {
                        getList: this.config.withHttpValues(localHttpConfig, {
                            method: "GET",
                            params: params,
                            headers: headers
                        }),
                        get: this.config.withHttpValues(localHttpConfig, {
                            method: "GET",
                            params: params,
                            headers: headers
                        }),
                        jsonp: this.config.withHttpValues(localHttpConfig, {
                            method: "jsonp",
                            params: params,
                            headers: headers
                        }),
                        put: this.config.withHttpValues(localHttpConfig, {
                            method: "PUT",
                            params: params,
                            headers: headers
                        }),
                        post: this.config.withHttpValues(localHttpConfig, {
                            method: "POST",
                            params: params,
                            headers: headers
                        }),
                        remove: this.config.withHttpValues(localHttpConfig, {
                            method: "DELETE",
                            params: params,
                            headers: headers
                        }),
                        head: this.config.withHttpValues(localHttpConfig, {
                            method: "HEAD",
                            params: params,
                            headers: headers
                        }),
                        trace: this.config.withHttpValues(localHttpConfig, {
                            method: "TRACE",
                            params: params,
                            headers: headers
                        }),
                        options: this.config.withHttpValues(localHttpConfig, {
                            method: "OPTIONS",
                            params: params,
                            headers: headers
                        }),
                        patch: this.config.withHttpValues(localHttpConfig, {
                            method: "PATCH",
                            params: params,
                            headers: headers
                        })
                    });
                };
                var Path = function() {};
                Path.prototype = new BaseCreator(), Path.prototype.base = function(current) {
                    var __this = this;
                    return _.reduce(this.parentsArray(current), function(acum, elem) {
                        var elemUrl, elemSelfLink = __this.config.getUrlFromElem(elem);
                        if (elemSelfLink) {
                            if (__this.config.isAbsoluteUrl(elemSelfLink)) return elemSelfLink;
                            elemUrl = elemSelfLink;
                        } else if (elemUrl = elem[__this.config.restangularFields.route], elem[__this.config.restangularFields.restangularCollection]) {
                            var ids = elem[__this.config.restangularFields.ids];
                            ids && (elemUrl += "/" + ids.join(","));
                        } else {
                            var elemId;
                            elemId = __this.config.useCannonicalId ? __this.config.getCannonicalIdFromElem(elem) : __this.config.getIdFromElem(elem), 
                            config.isValidId(elemId) && (elemUrl += "/" + (__this.config.encodeIds ? encodeURIComponent(elemId) : elemId));
                        }
                        return acum.replace(/\/$/, "") + "/" + elemUrl;
                    }, this.config.baseUrl);
                }, Path.prototype.fetchUrl = function(current, what) {
                    var baseUrl = this.base(current);
                    return what && (baseUrl += "/" + what), baseUrl;
                }, Path.prototype.fetchRequestedUrl = function(current, what) {
                    function sortedKeys(obj) {
                        var keys = [];
                        for (var key in obj) obj.hasOwnProperty(key) && keys.push(key);
                        return keys.sort();
                    }
                    function forEachSorted(obj, iterator, context) {
                        for (var keys = sortedKeys(obj), i = 0; i < keys.length; i++) iterator.call(context, obj[keys[i]], keys[i]);
                        return keys;
                    }
                    function encodeUriQuery(val, pctEncodeSpaces) {
                        return encodeURIComponent(val).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, pctEncodeSpaces ? "%20" : "+");
                    }
                    var url = this.fetchUrl(current, what), params = current[config.restangularFields.reqParams];
                    if (!params) return url;
                    var parts = [];
                    return forEachSorted(params, function(value, key) {
                        null != value && void 0 != value && (angular.isArray(value) || (value = [ value ]), 
                        angular.forEach(value, function(v) {
                            angular.isObject(v) && (v = angular.toJson(v)), parts.push(encodeUriQuery(key) + "=" + encodeUriQuery(v));
                        }));
                    }), url + (this.config.suffix || "") + (-1 === url.indexOf("?") ? "?" : "&") + parts.join("&");
                }, config.urlCreatorFactory.path = Path;
            };
            var globalConfiguration = {};
            Configurer.init(this, globalConfiguration), this.$get = [ "$http", "$q", function($http, $q) {
                function createServiceForConfiguration(config) {
                    function restangularizeBase(parent, elem, route, reqParams, fromServer) {
                        if (elem[config.restangularFields.route] = route, elem[config.restangularFields.getRestangularUrl] = _.bind(urlHandler.fetchUrl, urlHandler, elem), 
                        elem[config.restangularFields.getRequestedUrl] = _.bind(urlHandler.fetchRequestedUrl, urlHandler, elem), 
                        elem[config.restangularFields.addRestangularMethod] = _.bind(addRestangularMethodFunction, elem), 
                        elem[config.restangularFields.clone] = _.bind(copyRestangularizedElement, elem, elem), 
                        elem[config.restangularFields.reqParams] = _.isEmpty(reqParams) ? null : reqParams, 
                        elem[config.restangularFields.withHttpConfig] = _.bind(withHttpConfig, elem), elem[config.restangularFields.one] = _.bind(one, elem, elem), 
                        elem[config.restangularFields.all] = _.bind(all, elem, elem), elem[config.restangularFields.several] = _.bind(several, elem, elem), 
                        elem[config.restangularFields.oneUrl] = _.bind(oneUrl, elem, elem), elem[config.restangularFields.allUrl] = _.bind(allUrl, elem, elem), 
                        elem[config.restangularFields.fromServer] = !!fromServer, parent && config.shouldSaveParent(route)) {
                            var parentId = config.getIdFromElem(parent), parentUrl = config.getUrlFromElem(parent), restangularFieldsForParent = _.union(_.values(_.pick(config.restangularFields, [ "route", "parentResource" ])), config.extraFields), parentResource = _.pick(parent, restangularFieldsForParent);
                            config.isValidId(parentId) && config.setIdToElem(parentResource, parentId), config.isValidId(parentUrl) && config.setUrlToElem(parentResource, parentUrl), 
                            elem[config.restangularFields.parentResource] = parentResource;
                        } else elem[config.restangularFields.parentResource] = null;
                        return elem;
                    }
                    function one(parent, route, id) {
                        if (_.isNumber(route) || _.isNumber(parent)) {
                            var error = "You're creating a Restangular entity with the number ";
                            throw error += "instead of the route or the parent. You can't call .one(12)", new Error(error);
                        }
                        var elem = {};
                        return config.setIdToElem(elem, id), restangularizeElem(parent, elem, route, !1);
                    }
                    function all(parent, route) {
                        return restangularizeCollection(parent, [], route, !1);
                    }
                    function several(parent, route, ids) {
                        var collection = [];
                        return collection[config.restangularFields.ids] = Array.prototype.splice.call(arguments, 2), 
                        restangularizeCollection(parent, collection, route, !1);
                    }
                    function oneUrl(parent, route, url) {
                        if (!route) throw new Error("Route is mandatory when creating new Restangular objects.");
                        var elem = {};
                        return config.setUrlToElem(elem, url), restangularizeElem(parent, elem, route, !1);
                    }
                    function allUrl(parent, route, url) {
                        if (!route) throw new Error("Route is mandatory when creating new Restangular objects.");
                        var elem = {};
                        return config.setUrlToElem(elem, url), restangularizeCollection(parent, elem, route, !1);
                    }
                    function restangularizePromise(promise, isCollection, valueToFill) {
                        return promise.call = _.bind(promiseCall, promise), promise.get = _.bind(promiseGet, promise), 
                        promise[config.restangularFields.restangularCollection] = isCollection, isCollection && (promise.push = _.bind(promiseCall, promise, "push")), 
                        promise.$object = valueToFill, promise;
                    }
                    function promiseCall(method) {
                        var deferred = $q.defer(), callArgs = arguments, filledValue = {};
                        return this.then(function(val) {
                            var params = Array.prototype.slice.call(callArgs, 1), func = val[method];
                            func.apply(val, params), filledValue = val, deferred.resolve(val);
                        }), restangularizePromise(deferred.promise, this[config.restangularFields.restangularCollection], filledValue);
                    }
                    function promiseGet(what) {
                        var deferred = $q.defer(), filledValue = {};
                        return this.then(function(val) {
                            filledValue = val[what], deferred.resolve(filledValue);
                        }), restangularizePromise(deferred.promise, this[config.restangularFields.restangularCollection], filledValue);
                    }
                    function resolvePromise(deferred, response, data, filledValue) {
                        return _.extend(filledValue, data), config.fullResponse ? deferred.resolve(_.extend(response, {
                            data: data
                        })) : void deferred.resolve(data);
                    }
                    function stripRestangular(elem) {
                        if (_.isArray(elem)) {
                            var array = [];
                            return _.each(elem, function(value) {
                                array.push(stripRestangular(value));
                            }), array;
                        }
                        return _.omit(elem, _.values(_.omit(config.restangularFields, "id")));
                    }
                    function addCustomOperation(elem) {
                        elem[config.restangularFields.customOperation] = _.bind(customFunction, elem), _.each([ "put", "post", "get", "delete" ], function(oper) {
                            _.each([ "do", "custom" ], function(alias) {
                                var callFunction, callOperation = "delete" === oper ? "remove" : oper, name = alias + oper.toUpperCase();
                                callFunction = "put" !== callOperation && "post" !== callOperation ? customFunction : function(operation, elem, path, params, headers) {
                                    return _.bind(customFunction, this)(operation, path, params, headers, elem);
                                }, elem[name] = _.bind(callFunction, elem, callOperation);
                            });
                        }), elem[config.restangularFields.customGETLIST] = _.bind(fetchFunction, elem), 
                        elem[config.restangularFields.doGETLIST] = elem[config.restangularFields.customGETLIST];
                    }
                    function copyRestangularizedElement(fromElement) {
                        var copiedElement = angular.copy(fromElement);
                        return restangularizeElem(copiedElement[config.restangularFields.parentResource], copiedElement, copiedElement[config.restangularFields.route], !0);
                    }
                    function restangularizeElem(parent, element, route, fromServer, collection, reqParams) {
                        var elem = config.onBeforeElemRestangularized(element, !1, route), localElem = restangularizeBase(parent, elem, route, reqParams, fromServer);
                        return config.useCannonicalId && (localElem[config.restangularFields.cannonicalId] = config.getIdFromElem(localElem)), 
                        collection && (localElem[config.restangularFields.getParentList] = function() {
                            return collection;
                        }), localElem[config.restangularFields.restangularCollection] = !1, localElem[config.restangularFields.get] = _.bind(getFunction, localElem), 
                        localElem[config.restangularFields.getList] = _.bind(fetchFunction, localElem), 
                        localElem[config.restangularFields.put] = _.bind(putFunction, localElem), localElem[config.restangularFields.post] = _.bind(postFunction, localElem), 
                        localElem[config.restangularFields.remove] = _.bind(deleteFunction, localElem), 
                        localElem[config.restangularFields.head] = _.bind(headFunction, localElem), localElem[config.restangularFields.trace] = _.bind(traceFunction, localElem), 
                        localElem[config.restangularFields.options] = _.bind(optionsFunction, localElem), 
                        localElem[config.restangularFields.patch] = _.bind(patchFunction, localElem), addCustomOperation(localElem), 
                        config.transformElem(localElem, !1, route, service);
                    }
                    function restangularizeCollection(parent, element, route, fromServer, reqParams) {
                        var elem = config.onBeforeElemRestangularized(element, !0, route), localElem = restangularizeBase(parent, elem, route, reqParams, fromServer);
                        return localElem[config.restangularFields.restangularCollection] = !0, localElem[config.restangularFields.post] = _.bind(postFunction, localElem, null), 
                        localElem[config.restangularFields.remove] = _.bind(deleteFunction, localElem), 
                        localElem[config.restangularFields.head] = _.bind(headFunction, localElem), localElem[config.restangularFields.trace] = _.bind(traceFunction, localElem), 
                        localElem[config.restangularFields.putElement] = _.bind(putElementFunction, localElem), 
                        localElem[config.restangularFields.options] = _.bind(optionsFunction, localElem), 
                        localElem[config.restangularFields.patch] = _.bind(patchFunction, localElem), localElem[config.restangularFields.get] = _.bind(getById, localElem), 
                        localElem[config.restangularFields.getList] = _.bind(fetchFunction, localElem, null), 
                        addCustomOperation(localElem), config.transformElem(localElem, !0, route, service);
                    }
                    function restangularizeCollectionAndElements(parent, element, route) {
                        var collection = restangularizeCollection(parent, element, route, !1);
                        return _.each(collection, function(elem) {
                            restangularizeElem(parent, elem, route, !1);
                        }), collection;
                    }
                    function getById(id, reqParams, headers) {
                        return this.customGET(id.toString(), reqParams, headers);
                    }
                    function putElementFunction(idx, params, headers) {
                        var __this = this, elemToPut = this[idx], deferred = $q.defer(), filledArray = [];
                        return filledArray = config.transformElem(filledArray, !0, whatFetched, service), 
                        elemToPut.put(params, headers).then(function(serverElem) {
                            var newArray = copyRestangularizedElement(__this);
                            newArray[idx] = serverElem, filledArray = newArray, deferred.resolve(newArray);
                        }, function(response) {
                            deferred.reject(response);
                        }), restangularizePromise(deferred.promise, !0, filledArray);
                    }
                    function parseResponse(resData, operation, route, fetchUrl, response, deferred) {
                        var data = config.responseExtractor(resData, operation, route, fetchUrl, response, deferred), etag = response.headers("ETag");
                        return data && etag && (data[config.restangularFields.etag] = etag), data;
                    }
                    function fetchFunction(what, reqParams, headers) {
                        var __this = this, deferred = $q.defer(), operation = "getList", url = urlHandler.fetchUrl(this, what), whatFetched = what || __this[config.restangularFields.route], request = config.fullRequestInterceptor(null, operation, whatFetched, url, headers || {}, reqParams || {}, this[config.restangularFields.httpConfig] || {}), filledArray = [];
                        filledArray = config.transformElem(filledArray, !0, whatFetched, service);
                        var method = "getList";
                        return config.jsonp && (method = "jsonp"), urlHandler.resource(this, $http, request.httpConfig, request.headers, request.params, what, this[config.restangularFields.etag], operation)[method]().then(function(response) {
                            var resData = response.data, fullParams = response.config.params, data = parseResponse(resData, operation, whatFetched, url, response, deferred);
                            if (!_.isArray(data)) throw new Error("Response for getList SHOULD be an array and not an object or something else");
                            var processedData = _.map(data, function(elem) {
                                return __this[config.restangularFields.restangularCollection] ? restangularizeElem(__this[config.restangularFields.parentResource], elem, __this[config.restangularFields.route], !0, data) : restangularizeElem(__this, elem, what, !0, data);
                            });
                            processedData = _.extend(data, processedData), __this[config.restangularFields.restangularCollection] ? resolvePromise(deferred, response, restangularizeCollection(__this[config.restangularFields.parentResource], processedData, __this[config.restangularFields.route], !0, fullParams), filledArray) : resolvePromise(deferred, response, restangularizeCollection(__this, processedData, what, !0, fullParams), filledArray);
                        }, function(response) {
                            304 === response.status && __this[config.restangularFields.restangularCollection] ? resolvePromise(deferred, response, __this, filledArray) : config.errorInterceptor(response, deferred) !== !1 && deferred.reject(response);
                        }), restangularizePromise(deferred.promise, !0, filledArray);
                    }
                    function withHttpConfig(httpConfig) {
                        return this[config.restangularFields.httpConfig] = httpConfig, this;
                    }
                    function elemFunction(operation, what, params, obj, headers) {
                        var __this = this, deferred = $q.defer(), resParams = params || {}, route = what || this[config.restangularFields.route], fetchUrl = urlHandler.fetchUrl(this, what), callObj = obj || this, etag = callObj[config.restangularFields.etag] || ("post" != operation ? this[config.restangularFields.etag] : null);
                        _.isObject(callObj) && config.isRestangularized(callObj) && (callObj = stripRestangular(callObj));
                        var request = config.fullRequestInterceptor(callObj, operation, route, fetchUrl, headers || {}, resParams || {}, this[config.restangularFields.httpConfig] || {}), filledObject = {};
                        filledObject = config.transformElem(filledObject, !1, route, service);
                        var okCallback = function(response) {
                            var resData = response.data, fullParams = response.config.params, elem = parseResponse(resData, operation, route, fetchUrl, response, deferred);
                            elem ? "post" !== operation || __this[config.restangularFields.restangularCollection] ? resolvePromise(deferred, response, restangularizeElem(__this[config.restangularFields.parentResource], elem, __this[config.restangularFields.route], !0, null, fullParams), filledObject) : resolvePromise(deferred, response, restangularizeElem(__this, elem, what, !0, null, fullParams), filledObject) : resolvePromise(deferred, response, void 0, filledObject);
                        }, errorCallback = function(response) {
                            304 === response.status && config.isSafe(operation) ? resolvePromise(deferred, response, __this, filledObject) : config.errorInterceptor(response, deferred) !== !1 && deferred.reject(response);
                        }, callOperation = operation, callHeaders = _.extend({}, request.headers), isOverrideOperation = config.isOverridenMethod(operation);
                        return isOverrideOperation ? (callOperation = "post", callHeaders = _.extend(callHeaders, {
                            "X-HTTP-Method-Override": "remove" === operation ? "DELETE" : operation
                        })) : config.jsonp && "get" === callOperation && (callOperation = "jsonp"), config.isSafe(operation) ? isOverrideOperation ? urlHandler.resource(this, $http, request.httpConfig, callHeaders, request.params, what, etag, callOperation)[callOperation]({}).then(okCallback, errorCallback) : urlHandler.resource(this, $http, request.httpConfig, callHeaders, request.params, what, etag, callOperation)[callOperation]().then(okCallback, errorCallback) : urlHandler.resource(this, $http, request.httpConfig, callHeaders, request.params, what, etag, callOperation)[callOperation](request.element).then(okCallback, errorCallback), 
                        restangularizePromise(deferred.promise, !1, filledObject);
                    }
                    function getFunction(params, headers) {
                        return _.bind(elemFunction, this)("get", void 0, params, void 0, headers);
                    }
                    function deleteFunction(params, headers) {
                        return _.bind(elemFunction, this)("remove", void 0, params, void 0, headers);
                    }
                    function putFunction(params, headers) {
                        return _.bind(elemFunction, this)("put", void 0, params, void 0, headers);
                    }
                    function postFunction(what, elem, params, headers) {
                        return _.bind(elemFunction, this)("post", what, params, elem, headers);
                    }
                    function headFunction(params, headers) {
                        return _.bind(elemFunction, this)("head", void 0, params, void 0, headers);
                    }
                    function traceFunction(params, headers) {
                        return _.bind(elemFunction, this)("trace", void 0, params, void 0, headers);
                    }
                    function optionsFunction(params, headers) {
                        return _.bind(elemFunction, this)("options", void 0, params, void 0, headers);
                    }
                    function patchFunction(elem, params, headers) {
                        return _.bind(elemFunction, this)("patch", void 0, params, elem, headers);
                    }
                    function customFunction(operation, path, params, headers, elem) {
                        return _.bind(elemFunction, this)(operation, path, params, elem, headers);
                    }
                    function addRestangularMethodFunction(name, operation, path, defaultParams, defaultHeaders, defaultElem) {
                        var bindedFunction;
                        bindedFunction = "getList" === operation ? _.bind(fetchFunction, this, path) : _.bind(customFunction, this, operation, path);
                        var createdFunction = function(params, headers, elem) {
                            var callParams = _.defaults({
                                params: params,
                                headers: headers,
                                elem: elem
                            }, {
                                params: defaultParams,
                                headers: defaultHeaders,
                                elem: defaultElem
                            });
                            return bindedFunction(callParams.params, callParams.headers, callParams.elem);
                        };
                        config.isSafe(operation) ? this[name] = createdFunction : this[name] = function(elem, params, headers) {
                            return createdFunction(params, headers, elem);
                        };
                    }
                    function withConfigurationFunction(configurer) {
                        var newConfig = angular.copy(_.omit(config, "configuration"));
                        return Configurer.init(newConfig, newConfig), configurer(newConfig), createServiceForConfiguration(newConfig);
                    }
                    var service = {}, urlHandler = new config.urlCreatorFactory[config.urlCreator]();
                    return urlHandler.setConfig(config), Configurer.init(service, config), service.copy = _.bind(copyRestangularizedElement, service), 
                    service.withConfig = _.bind(withConfigurationFunction, service), service.one = _.bind(one, service, null), 
                    service.all = _.bind(all, service, null), service.several = _.bind(several, service, null), 
                    service.oneUrl = _.bind(oneUrl, service, null), service.allUrl = _.bind(allUrl, service, null), 
                    service.stripRestangular = _.bind(stripRestangular, service), service.restangularizeElement = _.bind(restangularizeElem, service), 
                    service.restangularizeCollection = _.bind(restangularizeCollectionAndElements, service), 
                    service;
                }
                return createServiceForConfiguration(globalConfiguration);
            } ];
        });
    }(), define("restangular", [ "angular", "lodash" ], function() {}), function() {
        "use strict";
        define("app", [ "lodash", "angular", "RouteConfig", "ApiModule", "requests/requestModule", "controllers/root", "controllers/pool", "controllers/osd", "controllers/osd-host", "controllers/pool-new", "controllers/tools", "controllers/pool-modify", "navbar/navbarModule", "services/menu", "run", "controllers/first", "controllers/userdropdown", "controllers/bell", "services/configuration", "services/error", "git", "angular-cookies", "angular-resource", "angular-sanitize", "angular-route", "angular-strap", "angular-animate", "restangular" ], function(_, angular, RouteConfig, APIModule, RequestModule, RootController, PoolController, OSDController, OSDHostController, PoolNewController, ToolsController, PoolModifyController, NavbarModule, MenuService, PostInitRunBlock, FirstTimeController, UserDropDownController, BellController, ConfigurationService, ErrorService, GitRunBlock) {
            var app = angular.module("manageApp", [ "ngAnimate", APIModule, RequestModule, NavbarModule, "ngCookies", "ngResource", "ngSanitize", "ngRoute", "mgcrea.ngStrap" ]).controller("RootController", RootController).controller("PoolController", PoolController).controller("PoolNewController", PoolNewController).controller("OSDController", OSDController).controller("OSDHostController", OSDHostController).controller("ToolController", ToolsController).controller("PoolModifyController", PoolModifyController).controller("FirstTimeController", FirstTimeController).controller("UserDropDownController", UserDropDownController).controller("BellController", BellController).service("MenuService", MenuService).service("ConfigurationService", ConfigurationService).service("ErrorService", ErrorService).run(PostInitRunBlock).run(GitRunBlock).config([ "$logProvider", function($logProvider) {
                $logProvider.debugEnabled(!1);
            } ]).config(RouteConfig);
            console.log(app), angular.element(document).ready(function() {
                _.each([ {
                    clazz: "manageApp",
                    module: [ "manageApp" ]
                } ], function(selector) {
                    try {
                        angular.bootstrap(document.getElementsByClassName(selector.clazz)[0], selector.module);
                    } catch (e) {
                        console.error("Failed to init " + selector.module, e);
                    }
                });
            });
        });
    }(), function() {
        "use strict";
        require.config({
            shim: {
                "angular-growl": {
                    deps: [ "angular" ]
                },
                "angular-resource": {
                    deps: [ "angular" ]
                },
                "angular-cookies": {
                    deps: [ "angular" ]
                },
                "angular-sanitize": {
                    deps: [ "angular" ]
                },
                "angular-route": {
                    deps: [ "angular" ]
                },
                "angular-strap": {
                    deps: [ "angular", "angular-animate" ]
                },
                "angular-animate": {
                    deps: [ "angular" ]
                },
                restangular: {
                    deps: [ "angular", "lodash" ]
                },
                bootstrap: {
                    deps: [ "jquery" ]
                },
                angular: {
                    deps: [ "jquery" ],
                    exports: "angular"
                }
            },
            paths: {
                jquery: "../bower_components/jquery/jquery",
                angular: "../bower_components/angular/angular",
                "angular-resource": "../bower_components/angular-resource/angular-resource",
                "angular-cookies": "../bower_components/angular-cookies/angular-cookies",
                "angular-sanitize": "../bower_components/angular-sanitize/angular-sanitize",
                "angular-route": "../bower_components/angular-route/angular-route",
                bootstrap: "../bower_components/bootstrap/dist/js/bootstrap",
                "angular-strap": "../bower_components/angular-strap/dist/angular-strap.min",
                "angular-animate": "../bower_components/angular-animate/angular-animate",
                restangular: "../bower_components/restangular/dist/restangular",
                lodash: "../bower_components/lodash/dist/lodash",
                moment: "../bower_components/momentjs/moment",
                "angular-growl": "../bower_components/angular-growl/build/angular-growl",
                idbwrapper: "../bower_components/idbwrapper/idbstore"
            }
        }), require([ "./app" ], function() {});
    }(), define("main", function() {});
}();