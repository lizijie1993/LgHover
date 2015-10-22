# LgHover

拉勾网主页上见到的效果:鼠标从元素不同方向滑入/滑出，则cover页从对应方向滑入/滑出。

## 在线实例 Demo

[Demo](http://lizijie1993.github.io/LgHover/lgShow.html)

## HTML

```html
<ul>
    <li>
        <a href="#">
            <div class="content"></div>
            <div class="cover"></div>
        </a>
    </li>
    <li>
        <a href="#">
            <div class="content"></div>
            <div class="cover"></div>
        </a>
    </li>
    <li>
        <a href="#">
            <div class="content"></div>
            <div class="cover"></div>
        </a>
    </li>
</ul>
```

1. `.cover`元素紧跟`.content`元素；
2. 两者由一父元素包裹；
3. `li`可替换为其他块级元素(对应的css也需要改变),例如:
   
   ```html
    <div>
        <a href="#">
            <div class="content"></div>
            <div class="cover"></div>
        </a>
    </div>
   ```

4. 类名可自定义。

## CSS

```css
ul li {
    position: relative;
    width: 100px;
    height: 100px;
    overflow: hidden;
}

.content {
    height: 100%;
}

.cover {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 2;
    visibility: hidden;
}
```

## 使用方法 Usage

可以传入单个dom元素，也可以传入NodeList或数组。

```javascript
//单个dom元素
var content = document.querySelector('.content');

//Nodelist
var contents = document.querySeletorAll('.content');
```