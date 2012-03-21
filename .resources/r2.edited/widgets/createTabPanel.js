/**
 * @name createTabPanel
 * @author sundongguo
 * @version 20081020
 * @need ElementManager
 *       EventManager
 *
 * 使用var tabPanel=createTabPanel(baseId,total,active,onActive)创建一组标签。
 * tabPanel.setActive(n);
 *
 * tab对应的text区域的id命名规则：text-baseId_number
 */
//--------------------------------------------------[createTabPanel]
function createTabPanel(baseId,total,active,onActive)
{
	function setActive(n)
	{
		var $tab=$(baseId+"_"+n);
		var $text=$("text-"+baseId+"_"+n);
		if($tab==$tabDefault)return;
		if($tabDefault)$tabDefault.className=baseClass+"_off";
		if($textDefault)$textDefault.style.display="none";
		$tabDefault=$tab;
		$textDefault=$text;
		$tabDefault.className=baseClass+"_on";
		$textDefault.style.display="block";
		if(onActive instanceof Function)onActive(n);
	}
	function bindEvent(i)
	{
		EventManager.bind($(baseId+"_"+i),"click",function(){setActive(i);});
	}
	var $tabDefault=null;
	var $textDefault=null;
	var baseClass=null;
	for(var i=1;i<=total;i++)
	{
		var $tab=$(baseId+"_"+i);
		var $text=$("text-"+baseId+"_"+i);
		if(!baseClass)baseClass=$tab.className.substring(0,$tab.className.indexOf("_"));
		$tab.className=baseClass+"_off";
		$text.style.display="none";
		bindEvent(i);
	}
	//设置默认tab。
	active=active||1;
	setActive(active);
	//返回句柄。
	return {setActive:setActive};
}
