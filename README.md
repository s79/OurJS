# OurJS - 简单轻便的 JS 前端开发框架 #

*更多内容请参考 [OurJS 简介/演示/文档](http://s79.github.com/OurJS/).*

OurJS 是一个可以让工作变得更简单的、适合 WEB 开发的 JavaScript 框架，它能让开发者写出清晰易读，并具备良好的兼容性和扩展性的代码。

> 目前完全兼容 PC 端的 IE6+、Firefox、Chrome、Safari、Opera 以及其他使用 Trident 和 WebKit 内核的浏览器。
> 稍后还会对移动设备提供支持。


## 特点 ##

* **语法自然** —— 所有 API 的语法均符合原生 JS 和 DOM 的语法习惯。
* **风格一致** —— 功能上有共同点的 API 也有共同的风格，便于记忆，并可以通过熟悉的 API 推测出其他 API 的用法。
* **功能完善** —— 提供覆盖面广、粒度恰当的功能和组件，可以通过灵活的配置和组合来设计复杂的功能。
* **易于扩展** —— 不论是要扩展框架本身，还是扩展应用，OurJS 均提供了简易的方式。


## 要求和限制 ##

OurJS 会强制浏览器运行在“标准模式”下。

OurJS 只可以和非侵入式设计的类库共存。


## 文件列表 ##

以下列出的文件位于 `src` 目录内：

<table>
  <tr>
    <th>描述</th><td>文件名</td>
  </tr>
  <tr>
    <td rowspan="2">Plugins</td><td>plugins\sizzle.js</td>
  </tr>
  <tr>
    <td>plugins\json2.js</td>
  </tr>
  <tr>
    <td>Code Block Management</td><td>execute.js</td>
  </tr>
  <tr>
    <td>Modularization</td><td>modularization.js</td>
  </tr>
  <tr>
    <td rowspan="3">Components</td><td>request.js</td>
  </tr>
  <tr>
    <td>animation.js</td>
  </tr>
  <tr>
    <td>component.js</td>
  </tr>
  <tr>
    <td rowspan="2">Browser API Enhancements</td><td>dom.js</td>
  </tr>
  <tr>
    <td>browser.js</td>
  </tr>
  <tr>
    <td>JS API Enhancements</td><td>lang.js</td>
  </tr>
</table>

`our.js` 中包含以上列出的所有文件。
`src/components/*.js` 是各可选组件的源文件，并不包含于 `our.js` 中。


## 许可 ##

OurJS 基于 MIT 许可协议发布，关于此协议的细节请查看 `LICENSE.md`。


