/**
 * @name createGoTopButton
 * @author sundongguo
 * @version 20081117
 * @need $
 *       ElementManager
 *       EventManager
 *       FX
 *
 * 使用createGoTopButton(className)创建一个goTop按钮。
 * config.className:	样式。
 */
//--------------------------------------------------[createGoTopButton]
function createGoTopButton(className)
{
	EventManager.setOnDOMReady(function()
	{
		function mOver(){$top.style.backgroundPosition="left center";}
		function mOut(){$top.style.backgroundPosition="left top";}
		function mDown(){$top.style.backgroundPosition="left bottom";}
		function mClick(){window.scrollTo(0,0);}
		var $div1=$("<div>");
		$div1.className="setTopPath";
		var $div2=$("<div>");
		$div2.className=className;
		var $top=$("<div>");
		$top.className="go_top";
		var $btn=$("<div>")
		EventManager.bind($btn,"mouseover",mOver);
		EventManager.bind($btn,"mouseout",mOut);
		EventManager.bind($btn,"mouseup",mOver);
		EventManager.bind($btn,"mousedown",mDown);
		EventManager.bind($btn,"click",mClick);
		EventManager.bind(window,"scroll",function()
		{
			var top=document.documentElement.scrollTop||document.body.scrollTop;
			$top.style.visibility=top<100?"hidden":"visible";
		});
		$top.appendChild($btn);
		$div2.appendChild($top);
		$div1.appendChild($div2);
		document.body.insertBefore($div1,document.body.firstChild);
		ElementManager.setFixed($top,{bottom:75});
	});
}
