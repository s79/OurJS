/**
 * @name getSubMenu
 * @author sundongguo
 * @version 20080908
 *
 * 需要：$
 *
 * 创建子菜单。
 * 子菜单只能激活一个。
 *
 * 使用getSubMenu(id)讲目标元素包装为子菜单对象subMenu并返回。
 * 使用subMenu.setActive(linkAddress)激活某菜单项。
 * 如果是点击了某菜单项，激活该菜单的同时也会跳转该链接。
 * 如果点击的菜单项下边有子菜单，则相当于点击了该菜单项下属的第一个子菜单（方法执行，非事件模拟）。
 *
 * 规则：
 * 有a就是菜单项。
 * 以下“打开”指展开某菜单项的子菜单，“选定”为选定某菜单项。
 * 样式类为lists为一级菜单，有子菜单并打开为lists_o，无子菜单并选定为lists_s。
 * 无样式类的为二级菜单，如选定其样式为s。
 * <ul id="submenu">
 *	<li><img src="..." alt="..."></li>
 *	<li class="lists_o">
 *		<a href="...">菜单1</a>
 *		<ul>
 *			<li><a href="...">菜单1-1</a></li>
 *			<li class="s"><a href="...">菜单1-2</a></li>
 *		</ul>
 *	</li>
 *	<li><a href="...">菜单2</a></li>
 * </ul>
 */
//--------------------------------------------------[toggleMenu]
var getSubMenu=function()
{
	var menuItems=null;
	var $current1=null;
	var $current2=null;
	function setActive(linkAddress)
	{
		if($current1)$current1.className="lists";
		if($current2)$current2.className="";
		for(var i=menuItems.length-1;i>-1;i--)
		{
			if(menuItems[i].href==linkAddress)
			{
				var $li=menuItems[i].parentNode;
				if($li.className=="")
				{
					$current1=$li.parentNode.parentNode;
					$current2=$li;
					$current1.className="lists_o";
					$current2.className="s";
				}
				else
				{
					$current1=$li;
					$current2=null;
					$current1.className="lists_s";
				}
				break;
			}
		}
	}
	function click(event)
	{
		var $target=EventManager.getTargetElement(event);
		if($target.tagName.toLowerCase()=="a")subMenu.setActive($target.href);
	}
	function focus(event)
	{
		this.blur();
	}
	return function(id)
	{
		if(menuItems)
		{
			alert("getSubMenu\n本页已创建了一个子菜单，不能重复创建！");
			return;
		}
		var $target=$(id);
		menuItems=$target.getElementsByTagName("a");
		//去除焦点虚线框。
		for(var i=0;i<menuItems.length;i++)EventManager.bind(menuItems[i],"focus",focus);
		EventManager.bind($target,"click",click);
		return {setActive:setActive};
	};
}();
