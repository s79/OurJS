# OurJS - 简单轻便的 JS 前端开发框架 #

*更多内容请参考 [OurJS 简介/演示/文档](http://s79.github.com/OurJS/).*

OurJS 是一个适用于 WEB 开发的 JavaScript 框架，它能让开发者使用可预期的 API 自由的编程，写出具备良好的兼容性、可读性和扩展性的代码。

> 目前完全兼容 PC 端的 IE6+、Firefox、Chrome、Safari、Opera 以及其他使用 Trident 和 WebKit 内核的浏览器。
> 稍后还会对移动设备提供支持。


## 设计思想 ##
* **化繁为简**

## 特点 ##

* **功能完善** —— 提供的功能覆盖面广、细节完善，可灵活配置与组合，能实现 WEB 开发中的绝大多数需求。
* **语法自然** —— 所有 API 的语法均符合原生 JS 和 DOM 的语法习惯。
* **风格一致** —— 功能上有共同点的 API 在风格上也一致，便于理解和记忆。
* **易于扩展** —— 不论是要扩展框架本身，还是扩展应用，OurJS 均提供了简易的方式。


## 要求和限制 ##

OurJS 要求浏览器运行在“标准模式”下。

OurJS 只可以和非侵入式设计的框架或类库共存。


## 文件列表 ##

以下列出的文件位于 `src` 目录内：

<table>
  <tr>
    <th>描述</th><th>文件名</th>
  </tr>
  <tr>
    <td>Integrated</td><td>integrated\sizzle.js<br>integrated\json2.js</td>
  </tr>
  <tr>
    <td>Code Block Management</td><td>execute.js</td>
  </tr>
  <tr>
    <td>Modularization</td><td>modularization.js</td>
  </tr>
  <tr>
    <td>Components</td><td>switcher.js<br>request.js<br>animation.js<br>component.js</td>
  </tr>
  <tr>
    <td>Features</td><td>features.js</td>
  </tr>
  <tr>
    <td>DOM API Enhancements</td><td>dom.js</td>
  </tr>
  <tr>
    <td>Browser API Enhancements</td><td>browser.js</td>
  </tr>
  <tr>
    <td>JS API Enhancements</td><td>lang.js</td>
  </tr>
</table>

`our.js` 中包含以上列出的所有文件。
以下文件均为可选项，并不包含于 `our.js` 中。

<table>
  <tr>
    <td>可选组件</td><td>src/components/*.js</td>
  </tr>
  <tr>
    <td>可选插件</td><td>src/addons/*.js</td>
  </tr>
  <tr>
    <td>适配器</td><td>src/adapters/*.js</td>
  </tr>
</table>


## 许可 ##

OurJS 基于 MIT 许可协议发布，关于此协议的细节请查看 `LICENSE.md`。
