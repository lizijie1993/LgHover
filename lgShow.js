(function() {

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
            if (toString.call(event) !== '[object MouseEvent]') return;

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
            //因为当设置html的paddingLeft和body的marginLeft后，offsetLeft发生了改变
            //因为当设置html的paddingTop和body的marginTop后，offsetTop发生了改变
            if (el.offsetParent === bd) {
                pos.left = el.offsetLeft + parseInt(window.getComputedStyle(html, null)['border-left-width']) + html.offsetLeft;
                pos.top = el.offsetTop + parseInt(window.getComputedStyle(html, null)['border-top-width']) + html.offsetTop;
            } else {
                pos.left = el.offsetLeft + parseInt(window.getComputedStyle(el.offsetParent, null)['border-left-width']) + obj.getOffset(el.offsetParent).left;
                pos.top = el.offsetTop + parseInt(window.getComputedStyle(el.offsetParent, null)['border-top-width']) + obj.getOffset(el.offsetParent).top;
            }
            return pos;
        };

        obj.getStyle = (function() {
            if (window.getComputedStyle) {
                return function(el, style) {
                    window.getComputedStyle(el, null)[style];
                };
            } else {
                return function(el, style) {
                    el.currentStyle[style];
                };
            }
        })();

        //是否支持CSS3属性
        obj.extend(obj, {
            hasTransform: _prefixStyle('transform') in _elementStyle,
            hasTransition: _prefixStyle('transition') in _elementStyle
        });

        obj.extend(obj, {
            transition: _prefixStyle('transition'),
            transform: _prefixStyle('transform')
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
        this.cover = this.ele.nextElementSibling;
        this.parent = this.ele.parentNode;

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

        //初始化
        this._init();
    }

    LgHover.prototype = {
        constructor: LgHover,
        leavePos: {
            'TOP': {
                'left': '0',
                'top': '-100%'
            },
            'RIGHT': {
                'left': '100%',
                'top': '0'
            },
            'BOTTOM': {
                'left': '0',
                'top': '100%'
            },
            'LEFT': {
                'left': '-100%',
                'top': '0'
            }
        },
        _init: function() {
            var self = this;

            //事件绑定
            utils.addEvent(this.parent, 'mouseenter', function(e) {
                self._onMouseEnter.call(self, e);
            });

            utils.addEvent(this.parent, 'mouseleave', function(e) {
                self._onMouseLeave.call(self, e);
            });

        },
        _onMouseLeave: function(e) {
            var mousePos = utils.getMousePagePosition(e),
                centerPoint = this.getCenterPoint(),
                wHRatio = this.getCenterPoint();

            var dir = getDirection(centerPoint, mousePos, wHRatio);

            this._translate(this.leavePos[dir].left, this.leavePos[dir].top);
        },
        _onMouseEnter: function(e) {
            var mousePos = utils.getMousePagePosition(e),
                centerPoint = this.getCenterPoint(),
                wHRatio = this.getCenterPoint();

            var dir = getDirection(centerPoint, mousePos, wHRatio);

            that = this;

            this.cover.style[utils.transition] = 'none';

            this._translate(this.leavePos[dir].left, this.leavePos[dir].top);

            //阻止reflow合并
            utils.getStyle(this.cover, 'left');

            that.cover.style[utils.transition] = 'all 0.3s ease';
            that._translate(0, 0);
        },
        _translate: function(x, y) {
            x = typeof x === 'number' ? Math.round(x) + 'px' : x;
            y = typeof y === 'number' ? Math.round(y) + 'px' : y;

            this.cover.style.left = x;
            this.cover.style.top = y;
        },
        getCenterPoint: function() {
            return this.centerPoint;
        },
        getWHRatio: function() {
            return this.wHRatio;
        }
    };

    /**
     * 获取鼠标移入/移除元素的边界
     * @param  {Object} centerPoint 元素中心点坐标
     * @param  {Object} mousePos    事件触发时鼠标位置
     * @param  {Number} wHRatio     元素宽高比
     * @return {String}             边界，'TOP'、'RIGHT'、'BOTTOM'、'LEFT'
     */
    function getDirection(centerPoint, mousePos, wHRatio) {
        //若非正方形，将其长边缩放为短边长度
        var w = wHRatio > 1 ? (mousePos.x - centerPoint.x) / wHRatio : (mousePos.x - centerPoint.x),
            h = wHRatio < 1 ? (centerPoint.y - mousePos.y) * wHRatio : (centerPoint.y - mousePos.y);

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
