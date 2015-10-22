(function() {

    //引自张鑫旭老师
    //http://www.zhangxinxu.com/wordpress/2013/09/css3-animation-requestanimationframe-tween-%E5%8A%A8%E7%94%BB%E7%AE%97%E6%B3%95/
    (function() {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || // Webkit中此取消方法的名字变了
                window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());

    var utils = (function() {
        var obj = {};

        var _elementStyle = (function() {
            return document.createElement('div').style;
        })();

        //浏览器使用的前缀
        var _vender = (function() {
            var vendors = ['t', 'msT', 'mozT', 'webkitT', 'OT'],
                transform,
                i = 0,
                len = vendors.length;

            //选择transform是因为transform2D在IE9中已经支持，且需要前缀-ms-

            for (; i < len; i++) {
                transform = vendors[i] + 'ransform';
                if (transform in _elementStyle) {
                    return vendors[i].substr(0, vendors[i].length - 1);
                }
            }

            //不支持CSS3，返回false
            return false;
        })();

        //给属性添加前缀
        var _prefixStyle = function(style) {
            if (_vender === false) return false;
            if (_vender === '') return style;
            return _vender + style.charAt(0).toUpperCase() + style.substr(1);
        };

        /* 工具方法 */

        obj.getTime = function() {
            return Date.now ? Date.now() : new Date().getTime();
        };

        obj.extend = function(target, obj) {
            for (var key in obj) {
                target[key] = obj[key];
            }
        };

        obj.isArray = function(value) {
            return value instanceof Array;
        };

        obj.converToArray = function(arrayLike) {
            var array = [],
                len;
            try {
                array = Array.prototype.slice.call(arrayLike);
            } catch (e) {
                len = arrayLike.length;

                while (len--) {
                    array.push(arrayLike[len]);
                }
            }
            return array;
        };

        /* 事件相关 */

        //事件绑定及移除
        obj.addEvent = (function() {
            if (document.addEventListener) {
                return function(el, type, handler, capture) {
                    el.addEventListener(type, handler, !!capture);
                };
            } else {
                return function(el, type, handler) {
                    el.attachEvent('on' + type, handler);
                };
            }
        })();

        obj.removeEvent = (function() {
            if (document.removeEventListener) {
                return function(el, type, handler, capture) {
                    el.removeEventListener(type, handler, !!capture);
                };
            } else {
                return function(el, type, handler) {
                    el.detachEvent('on' + type, handler);
                };
            }
        })();

        //获取事件对象
        obj.getEvent = function(event) {
            return event || window.event;
        };

        /**
         * 获取事件发生时，鼠标的位置
         * @param  {Object} event 事件对象
         * @return {Object}       坐标对象
         */
        obj.getMousePagePosition = function(event) {
            event = obj.getEvent(event);

            //事件类型判断
            if (!(/mouse/g.test(event.type))) return;

            //鼠标在页面中的位置
            var mouseX = event.pageX || (event.clientX + document.documentElement.scrollLeft || document.body.scrollLeft),
                mouseY = event.pageY || (event.clientY + document.documentElement.scrollTop || document.body.scrollTop);

            return {
                x: mouseX,
                y: mouseY
            };
        };

        /* 元素属性相关 */

        //获元素相对于document的偏移量
        obj.getOffset = function(el) {

            var bd = document.body,
                html = document.documentElement,
                pos = {};

            //offsetParent为body，但实际上为html
            //未设置border时,IE返回字符串,导致NaN出现,因此添加||0
            if (el.offsetParent === bd) {
                pos.left = el.offsetLeft + (parseInt(obj.getStyle(html, 'borderLeftWidth')) || 0) + html.offsetLeft;
                pos.top = el.offsetTop + (parseInt(obj.getStyle(html, 'borderTopWidth')) || 0) + html.offsetTop;
            } else {
                pos.left = el.offsetLeft + (parseInt(obj.getStyle(el.offsetParent, 'borderLeftWidth')) || 0) + obj.getOffset(el.offsetParent).left;
                pos.top = el.offsetTop + (parseInt(obj.getStyle(el.offsetParent, 'borderTopWidth')) || 0) + obj.getOffset(el.offsetParent).top;
            }

            return pos;
        };

        obj.getStyle = (function() {
            if (window.getComputedStyle) {
                return function(el, style) {
                    return window.getComputedStyle(el, null)[style];
                };
            } else {
                return function(el, style) {
                    return el.currentStyle[style];
                };
            }
        })();

        //是否支持CSS3属性
        obj.extend(obj, {
            hasTransform: _prefixStyle('transform') in _elementStyle,
            hasPerspective: _prefixStyle('perspective') in _elementStyle,
            hasTransition: _prefixStyle('transition') in _elementStyle
        });

        obj.extend(obj, {
            transitionProperty: _prefixStyle('transition-property'),
            transitionDuration: _prefixStyle('transition-duration'),
            transitionTimingFunction: _prefixStyle('transition-timing-function'),
            transform: _prefixStyle('transform')
        });

        //缓动动画
        obj.extend(obj.ease = {}, {
            quadratic: {
                style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fn: function(k) {
                    return k * (2 - k);
                }
            },
            circular: {
                style: 'cubic-bezier(0.1, 0.57, 0.1, 1)', // Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
                fn: function(k) {
                    return Math.sqrt(1 - (--k * k));
                }
            },
            back: {
                style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                fn: function(k) {
                    var b = 4;
                    return (k = k - 1) * k * ((b + 1) * k + b) + 1;
                }
            },
            bounce: {
                style: '',
                fn: function(k) {
                    if ((k /= 1) < (1 / 2.75)) {
                        return 7.5625 * k * k;
                    } else if (k < (2 / 2.75)) {
                        return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
                    } else if (k < (2.5 / 2.75)) {
                        return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
                    } else {
                        return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
                    }
                }
            },
            elastic: {
                style: '',
                fn: function(k) {
                    var f = 0.22,
                        e = 0.4;

                    if (k === 0) {
                        return 0;
                    }
                    if (k == 1) {
                        return 1;
                    }

                    return (e * Math.pow(2, -10 * k) * Math.sin((k - f / 4) * (2 * Math.PI) / f) + 1);
                }
            }
        });
        return obj;

    })();

    /**
     * LgHover构造函数
     * @param {Dom} contentEle 最初展示的内容的DOM节点
     */
    function LgHover(contentEle) {

        if (!(this instanceof LgHover)) return new LgHover(contentEle);

        //元素
        this.ele = contentEle;
        this.cover = this.ele.nextElementSibling || this.ele.nextSibling; //兼容IE
        this.parent = this.ele.parentNode;

        this.coverStyle = this.cover.style; //缓存

        //元素相对于document的偏移及可见宽高
        this.offset = utils.getOffset(this.ele);

        utils.extend(this.offset, {
            width: this.ele.offsetWidth,
            height: this.ele.offsetHeight
        });

        //元素中心点位置
        this.centerPoint = {
            x: this.offset.left + this.offset.width / 2,
            y: this.offset.top + this.offset.height / 2
        };

        //元素宽高比
        this.wHRatio = this.offset.width / this.offset.height;

        //硬件加速
        this.translateZ = utils.hasPerspective ? 'translateZ(0)' : '';

        //cover移除时的位置
        this.leavePos = {
            'TOP': {
                'left': 0,
                'top': -this.offset.height
            },
            'RIGHT': {
                'left': this.offset.width,
                'top': 0
            },
            'BOTTOM': {
                'left': 0,
                'top': this.offset.height
            },
            'LEFT': {
                'left': -this.offset.width,
                'top': 0
            }
        };

        //cover元素是否正在移动
        this.isAnimating = false;

        this.timer = null;

        //初始化
        this._init();
    }

    LgHover.prototype = {
        constructor: LgHover,

        _init: function() {
            var self = this;

            this._translate(100, 100);

            //事件绑定
            utils.addEvent(this.parent, 'mouseenter', function(e) {
                e = utils.getEvent(e);
                self._onMouseEnter.call(self, e);
            });

            utils.addEvent(this.parent, 'mouseleave', function(e) {
                e = utils.getEvent(e);
                self._onMouseLeave.call(self, e);
            });

        },
        _onMouseLeave: function(e) {
            var dir = this.getDirection(utils.getMousePagePosition(e));

            this._scrollTo(this.leavePos[dir].left, this.leavePos[dir].top, 300);
        },
        _onMouseEnter: function(e) {
            var dir = this.getDirection(utils.getMousePagePosition(e));

            this._scrollTo(this.leavePos[dir].left, this.leavePos[dir].top, 0);

            //强制触发reflow
            this.cover.offsetLeft;

            this._scrollTo(0, 0, 300);
        },
        _scrollTo: function(x, y, time, easing) {

            easing = easing || utils.ease.circular;

            if (utils.hasTransition) {
                this.coverStyle[utils.transitionProperty] = 'all';
                this.coverStyle[utils.transitionDuration] = time + 'ms';
                this.coverStyle[utils.transitionTimingFunction] = easing.style;
                this._translate(x, y);
            } else {
                this._animate(x, y, time, easing.fn);
            }
        },
        //改变x、y坐标
        _translate: function(x, y) {
            x = Math.round(x);
            y = Math.round(y);

            if (utils.hasTransform) {
                this.coverStyle[utils.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;
            } else {
                this.coverStyle.left = x + 'px';
                this.coverStyle.top = y + 'px';
            }
        },
        /**
         * 过渡动画方法
         * @param  {Number} destX    目标x坐标
         * @param  {Number} destY    目标Y坐标
         * @param  {Number} duration 持续时间
         * @param  {Object} easingFn 过渡函数
         */
        _animate: function(destX, destY, duration, easingFn) {
            var that = this,
                pos = this.getComputedPosition(),
                startX = pos.x,
                startY = pos.y,
                startTime = utils.getTime(),
                destTime = startTime + duration;

            cancelAnimationFrame(this.timer);

            function step() {
                var now = utils.getTime(),
                    newX, newY,
                    easing;

                if (now >= destTime) {
                    that.isAnimating = false;
                    that._translate(destX, destY);

                    return;
                }

                now = (now - startTime) / duration;
                easing = easingFn(now);
                newX = (destX - startX) * easing + startX;
                newY = (destY - startY) * easing + startY;
                that._translate(newX, newY);

                if (that.isAnimating) {
                    that.timer = requestAnimationFrame(step);
                }
            }

            this.isAnimating = true;
            step();
        },
        getComputedPosition: function() {
            var matrix,
                x, y;

            if (utils.hasTransform) {
                matrix = utils.getStyle(this.cover, utils.transform).split(')')[0].split(', ');
                x = +(matrix[12] || matrix[4]);
                y = +(matrix[13] || matrix[5]);
            } else {
                x = +utils.getStyle(this.cover, 'left').replace(/[^-\d.]/g, '');
                y = +utils.getStyle(this.cover, 'top').replace(/[^-\d.]/g, '');
            }

            return {
                x: x,
                y: y
            };
        },
        /**
         * 获取鼠标移入/移除元素的边界
         * @param  {Object} mousePos    事件触发时鼠标位置
         * @return {String}             边界，'TOP'、'RIGHT'、'BOTTOM'、'LEFT'
         */
        getDirection: function(mousePos) {
            //若非正方形，将其长边缩放为短边长度
            var w = this.wHRatio > 1 ? (mousePos.x - this.centerPoint.x) / this.wHRatio : (mousePos.x - this.centerPoint.x),
                h = this.wHRatio < 1 ? (this.centerPoint.y - mousePos.y) * this.wHRatio : (this.centerPoint.y - mousePos.y);

            //触发事件时的角度
            var angle = Math.atan2(h, w) * 180 / Math.PI;

            //根据角度判断从哪个方向进入或离开元素
            if (angle >= -135 && angle < -45) {
                return 'BOTTOM';
            } else if (angle >= -45 && angle < 45) {
                return 'RIGHT';
            } else if (angle >= 45 && angle < 135) {
                return 'TOP';
            } else {
                return 'LEFT';
            }
        }
    };

    // 封装之后，可以根据contentEle的类型进行处理
    // 参数可以为单个dom节点或NodeList或数组
    window.lgHover = function(contentEle) {
        if (typeof contentEle.length === 'number') {
            var i = 0,
                len = contentEle.length,
                instances = [];
            if (!utils.isArray(contentEle)) {
                contentEle = utils.converToArray(contentEle);
            }
            for (; i < len; i++) {
                instances.push(window.lgHover(contentEle[i]));
            }
            return instances;
        } else {
            return new LgHover(contentEle);
        }
    };

})();
