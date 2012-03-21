/**
 * @name createFileBrowser
 * @author sundongguo
 * @version 20080911
 *
 * 使用createFileBrowser($target)创建一个文件浏览组件。
 * $target是默认的<input type="file" .../>的元素。
 *
 * 创建后的结构为：
 * <div class="browser"><input type="text" class="text"/><span><input type="file" .../></span></div>
 * 请参考以上结构定义其css。
 */
//--------------------------------------------------[createFileBrowser]
var createFileBrowser=function()
{
	function mouseover()
	{
		this.className="over";
	}
	function mouseout()
	{
		this.className="";
	}
	function change()
	{
		this.parentNode.previousSibling.value=this.value;
	}
	return function($target)
	{
		//建立DOM。
		var $div=$("<div>");
		$div.className="browser";
		var $text=$("<input>");
		$text.type="text";
		$text.className="text";
		$text.readOnly=true;
		var $span=$("<span>");
		$div.appendChild($text);
		$div.appendChild($span);
		$target.parentNode.insertBefore($div,$target);
		$span.appendChild($target);
		//绑定事件。
		EventManager.bind($target,"change",change);
		EventManager.bind($span,"mouseover",mouseover);
		EventManager.bind($span,"mouseout",mouseout);
	};
}();
