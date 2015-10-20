(function() {

    /**
     * LgHover构造函数
     * @param {Dom} contentEle 最初展示的内容的DOM节点
     */
    function LgHover(contentEle) {
        //元素
        this.ele = contentEle;
        this.cover = this.ele.nextElementSibling;
        this.parent = this.ele.parentNode;

        //元素的属性
        //相对于page的偏移
        this.offset = {
            left: getOffsetLeft(this.ele),
            top: getOffsetTop(this.ele),
            width: this.ele.offsetWidth,
            height: this.ele.offsetHeight
        };

        //元素中心点位置
        this.centerPoint = {
            x: this.offset.left + this.offset.width / 2,
            y: this.offset.top + this.offset.height / 2
        };

        //元素宽高比
        this.wHRatio = this.offset.width / this.offset.height;

        this.timer = [];

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

            //绑定事件
            this.parent.addEventListener('mouseenter', function(e) {
                self._onMouseEnter.call(self, e);
            }, false);

            this.parent.addEventListener('mouseleave', function(e) {
                self._onMouseLeave.call(self, e);
            }, false);
        },
        _onMouseLeave: function(e) {
            var mousePos = getMousePosition(e),
                centerPoint = this.getCenterPoint(),
                wHRatio = this.getCenterPoint();

            var dir = getDirection(centerPoint, mousePos, wHRatio);

            setCss(this.cover, this.leavePos[dir]);

            this.timer.forEach(function(timer) {
                clearTimeout(timer);
            });
        },
        _onMouseEnter: function(e) {
            var mousePos = getMousePosition(e),
                centerPoint = this.getCenterPoint(),
                wHRatio = this.getCenterPoint();

            var dir = getDirection(centerPoint, mousePos, wHRatio);

            that = this;

            setCss(this.cover, {
                'transition': 'none'
            });
            setCss(this.cover, this.leavePos[dir]);

            this.timer.push(setTimeout(function() {
                setCss(that.cover, {
                    'transition': 'all 0.3s ease',
                    'left': '0',
                    'top': '0'
                });
            }, 20));
        },
        getCenterPoint: function() {
            return this.centerPoint;
        },
        getWHRatio: function() {
            return this.wHRatio;
        }
    };

    function setCss(el, obj) {
        var style = el.style,
            key;
        for (key in obj) {
            style[key] = obj[key];

        }
    }

    /**
     * 获取事件发生时，鼠标的位置
     * @param  {Object} event 事件对象
     * @return {Object}       坐标对象
     */
    function getMousePosition(event) {
        //事件类型判断
        if (toString.call(event) !== '[object MouseEvent]') return;

        //鼠标在页面中的位置
        var mouseX = event.pageX || (event.clientX + document.documentElement.scrollLeft || document.body.scrollLeft),
            mouseY = event.pageY || (event.clientY + document.documentElement.scrollTop || document.body.scrollTop);

        return {
            x: mouseX,
            y: mouseY
        };
    }

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

    //获取元素相对于page的x轴偏移
    function getOffsetLeft(el) {
        var bd = document.body,
            html = document.documentElement;

        //offsetParent为body，但实际上为html
        //因为当设置html的paddingLeft和body的marginLeft后，offsetLeft发生了改变
        if (el.offsetParent === bd) return el.offsetLeft + parseInt(window.getComputedStyle(html, null)['border-left-width']) + html.offsetLeft;

        return el.offsetLeft + parseInt(window.getComputedStyle(el.offsetParent, null)['border-left-width']) + getOffsetLeft(el.offsetParent);
    }

    //获取元素相对于page的y轴偏移
    function getOffsetTop(el) {
        var bd = document.body,
            html = document.documentElement;

        //offsetParent为body，但实际上为html
        //因为当设置html的paddingTop和body的marginTop后，offsetTop发生了改变
        if (el.offsetParent === bd) return el.offsetTop + parseInt(window.getComputedStyle(html, null)['border-top-width']) + html.offsetTop;

        return el.offsetTop + parseInt(window.getComputedStyle(el.offsetParent, null)['border-top-width']) + getOffsetTop(el.offsetParent);
    }

    window.LgHover = LgHover;

})();
