/**
 * @name createDropMenu
 * @author sundongguo
 * @version 20080916
 *
 * 使用var dropMenu=createDropMenu(config)创建一个下拉菜单。
 * config=
 * {
 * 	$target:	HTML元素，下拉菜单要替换的HTMLElement。
 * 	$value:		HTML表单元素，其值被自动指定为当前选定菜单的值（可选）。
 * 	options:	JSON，菜单的选项，格式为“{显示字符串:值,...}”（可选）。
 * 	selected:	String，默认值（可选）。
 * 	onChange:	函数，选定某选项后执行，传入该选项的显示字符串和值。这个函数只能被用户操作触发（可选）。
 * 	className:	字符串，广告切换器的基本样式。
 * }
 *
 * dropMenu.setOptions(options[,selected]);	JSON,String
 */
//--------------------------------------------------[createDropMenu]
var createDropMenu=function()
{
	function selectStart(event)
	{
		EventManager.preventDefault(event);
	}
	function oMDown(event)
	{
		EventManager.stopPropagation(event);
	}
	function oMOver(event)
	{
		this.className="over";
	}
	function oMOut(event)
	{
		this.className="";
	}
	return function(config)
	{
		function toggle()
		{
			var self=arguments.callee;
			if($options.offsetWidth)
			{
				$element.className=config.className;
				EventManager.unbind(document,"mousedown",self);
			}
			else
			{
				$element.className=config.className+" "+config.className.split(" ")[0]+"_active";
				setTimeout(function(){EventManager.bind(document,"mousedown",self);},0);
			}
		}
		function select()
		{
			var text=this.innerHTML;
			toggle();
			if(text==$value.innerHTML)return;
			$value.innerHTML=text;
			if(config.$value)config.$value.value=config.options[text];
			if(config.onChange)config.onChange(text,config.options[text]);
		}
		function setOptions(options,selected)
		{
			config.options=options;
			var text="";
			var aLi=$options.getElementsByTagName("li");
			while(aLi.length>0)
			{
				var $li=aLi[0];
				EventManager.unbind($li,"mouseover",oMOver);
				EventManager.unbind($li,"mouseout",oMOut);
				EventManager.unbind($li,"mouseup",select);
				$ul.removeChild($li);
			}
			for(var i in options)
			{
				var $li=$("<li>");
				$li.innerHTML=i;
				EventManager.bind($li,"mouseover",oMOver);
				EventManager.bind($li,"mouseout",oMOut);
				EventManager.bind($li,"mouseup",select);
				$ul.appendChild($li);
				if(!text)text=i;
				if(selected==i)text=selected;
			}
			$value.innerHTML=text;
			if(config.$value)config.$value.value=config.options[text];
		}
		//建立DOM。
		var $target=config.$target;
		var $element=$("<div>");
		$element.className=config.className;
		var $value=$("<div>");
		$value.className="value";
		var $options=$("<div>");
		$options.className="options";
		var $top=$("<div>");
		$top.className="top";
		var $bottom=$("<div>");
		$bottom.className="bottom";
		var $ul=$("<ul>");
		$options.appendChild($top);
		$options.appendChild($ul);
		$options.appendChild($bottom);
		$element.appendChild($value);
		$element.appendChild($options);
		$target.parentNode.insertBefore($element,$target);
		$target.parentNode.removeChild($target);
		//绑定事件
		EventManager.bind($element,"selectstart",selectStart);
		EventManager.bind($value,"mousedown",toggle);
		EventManager.bind($options,"mousedown",oMDown);
		//设置选项。
		if(config.options)setOptions(config.options,config.selected||null);
		//返回句柄。
		return {setOptions:setOptions};
	};
}();
