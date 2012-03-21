/**
 * @name toggleRemind
 * @author sundongguo
 * @version 20081030
 *
 * 需要：ElementManager
 *
 * 显示/隐藏提示信息。
 */
//--------------------------------------------------[toggleRemind]
function toggleRemind($form,names)
{
	function hideRemind()
	{
		if(this.tagName.toLowerCase()=="input")
		{
			$("r_"+this.name).style.display="none";
		}
		else
		{
			var $form=$("form");
			var $target=$form[this.id.substring(2)];
			this.style.display="none";
			$target.focus();
		}
	}
	function showRemind(name)
	{
		var $target=$form[name];
		var $remind=$("r_"+name);
		$remind.style.display="block";
		$target.parentNode.insertBefore($remind,$target);
		EventManager.bind($remind,"click",hideRemind);
		EventManager.bind($target,"focus",hideRemind);
	}
	for(var i=0;i<names.length;i++)showRemind(names[i]);
}
