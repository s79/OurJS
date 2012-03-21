/**
 * @name setMinHeight
 * @author sundongguo
 * @version 20081120
 *
 * 需要：EventManager
 *
 * 为兼容IE6，设置元素的最小高度。
 */
//--------------------------------------------------[setMinHeight]
function setMinHeight(id,height)
{
	EventManager.setOnDOMReady(function(){
		var $target=$(id);
		$target.style.height=Math.max($target.offsetHeight,height)+"px";
	});
}
