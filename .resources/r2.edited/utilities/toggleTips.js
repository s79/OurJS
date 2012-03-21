/**
 * @name toggleTips
 * @author sundongguo
 * @version 20081013
 *
 * 需要：EventManager
 *
 * 显示/隐藏提示信息。
 * 在一组信息中显示/隐藏其中的一个，该组信息中的各个信息是互斥的。
 *
 * 必须按照特定的格式写HTML代码。格式如下：
 * <div id="tips">
 * 	<p>handler</p>
 * 	<div>tip</div>
 *	...
 * </div
 *
 * toggleTips($target)
 * $target:	目标元素的id。
 */
//--------------------------------------------------[toggleTips]
var toggleTips=function()
{
	var $currentTip=null;
	function toggle(event)
	{
		$tip=this.nextSibling;
		if($tip.nodeType!=1)$tip=$tip.nextSibling;
		if($tip.offsetWidth)
		{
			$tip.style.display="none";
			$currentTip=null;
		}
		else
		{
			if($currentTip)$currentTip.style.display="none";
			$currentTip=$tip;
			$currentTip.style.display="block";
		}
	}
	return function($target)
	{
		var $tipHandlers=$target.getElementsByTagName("p");
		for(var i=0;i<$tipHandlers.length;i++)EventManager.bind($tipHandlers[i],"click",toggle);
	};
}();
