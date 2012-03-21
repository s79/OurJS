/**
 * @name ElementManager
 * @author sundongguo
 * @version 20080828
 *
 * 管理与Element相关的内容。
 *
 * ElementManager.getDocumentWidth()	获取文档宽度（在IE浏览器下，当文档宽度小于窗口可见宽度时，返回窗口可见宽度。其他浏览器的文档宽度不会小于窗口可见宽度。）
 * ElementManager.getDocumentHeight()	获取文档高度
 * ElementManager.getWindowWidth()	获取窗口可见宽度
 * ElementManager.getWindowHeight()	获取窗口可见高度
 * ElementManager.getWindowSrollLeft()	获取窗口左边滚动像素数
 * ElementManager.getWindowSrollTop()	获取窗口顶部滚动像素数
 *
 * ElementManager.getComputedStyle($target,styleName)	获取目标元素的最终样式
 * ElementManager.setOpacity($target,opacity)		设置目标元素的透明度（0-100）
 *
 * ElementManager.hasClass($target,className)
 * ElementManager.addClass($target,className)
 * ElementManager.removeClass($target,className)
 * ElementManager.toggleClass($target,className)
 *
 * ElementManager.getPrevious()
 * ElementManager.getNext()
 * ElementManager.getFirst()
 * ElementManager.getLast()
 * ElementManager.getChildren()
 *
 * Plugins：
 * ElementManager.setFixed($target,position)	将指定元素固定在可视区域的指定位置（该元素需要绝对定位）
 * ElementManager.setMaskBehind($target)	创建一个在指定元素下的遮掩层
 */
//--------------------------------------------------[ElementManager]
var ElementManager=
{
	//IE5.5要用document.body.scrollWidth，同时其document.documentElement.clientWidth为0。
	//IE可能比getWindowsSize小。
	getDocumentWidth:function()
	{
		var width=document.documentElement.clientWidth?Math.max(document.body.scrollWidth,document.documentElement.scrollWidth):document.body.scrollWidth;
		if(window.ActiveXObject)width=Math.max(width,ElementManager.getWindowWidth());
		return width;
	},
	getDocumentHeight:function()
	{
		var height=document.documentElement.clientHeight?Math.max(document.body.scrollHeight,document.documentElement.scrollHeight):document.body.scrollHeight;
		if(window.ActiveXObject)height=Math.max(height,ElementManager.getWindowHeight());
		return height;
	},
	//Opera要用document.body.clientWidth。
	getWindowWidth:function()
	{
		var d=(parent==window)?document:parent.document;
		return window.opera?d.body.clientWidth:d.documentElement.clientWidth||d.body.clientWidth;
	},
	getWindowHeight:function()
	{
		var d=(parent==window)?document:parent.document;
		return window.opera?d.body.clientHeight:d.documentElement.clientHeight||d.body.clientHeight;
	},
	getWindowSrollLeft:function()
	{
		var d=(parent==window)?document:parent.document;
		var n=d.documentElement.scrollLeft||d.body.scrollLeft;
		n=(parent==window)?n:n-parent.document.getElementById("iframe").offsetLeft;
		return n;
	},
	getWindowSrollTop:function()
	{
		var d=(parent==window)?document:parent.document;
		var n=d.documentElement.scrollTop||d.body.scrollTop;
		n=(parent==window)?n:n-parent.document.getElementById("iframe").offsetTop;
		return n
	},
	getComputedStyle:function($target,styleName)
	{
		return document.defaultView?document.defaultView.getComputedStyle($target,null).getPropertyValue(styleName):$target.currentStyle[styleName.replace(/-[a-z]/g,function(){return arguments[0].charAt(1).toUpperCase();})];
	},
	setOpacity:function($target,opacity)
	{
		window.ActiveXObject?$target.style.filter="alpha(opacity="+opacity*100+")":$target.style.opacity=opacity;
	}
};
