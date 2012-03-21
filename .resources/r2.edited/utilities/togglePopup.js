/**
 * @name togglePopup
 * @author sundongguo
 * @version 20080828
 *
 * 需要：ElementManager
 * 　　　FX.createAnimation
 *
 * 显示/隐藏目标元素，显示/隐藏的过程有动画效果。
 * 目标元素可以按照id前缀分组，如pop1_1，pop1_2为一组，同组的目标元素是互斥的，只能显示其中的一个。
 * 所有id无前缀的目标元素，将被划分为一组，如pop1，pop2。
 * togglePopup(id)
 * id:		目标元素的id。
 */
//--------------------------------------------------[togglePopup]
var togglePopup=function()
{
	var pool={};
	var group={}
	var animation=FX.createAnimation
	({
		before:function()
		{
			if(group.$target)
			{
				ElementManager.setOpacity(group.$target,0);
				group.$target.style.display="block";
			}
		},
		tween:function(n)
		{
			if(group.$current)ElementManager.setOpacity(group.$current,1-n);
			if(group.$target)ElementManager.setOpacity(group.$target,n);
		},
		after:function()
		{
			if(group.$current)
			{
				//再次设置透明度，以防执行stop方法时某元素的透明度不是1也不是0。
				ElementManager.setOpacity(group.$current,0);
				group.$current.style.display="none";
			}
			if(group.$target)
			{
				//同上。
				ElementManager.setOpacity(group.$target,1);
				group.$current=group.$target;
				delete group.$target;
			}
			else
			{
				delete group.$current;
			}
		},
		duration:100
	});
	return function(id)
	{
		//如果当前在播放动画则停止。
		animation.stop();
		//组名，从sId中截取，用以分组保存当前活动对话框。
		var groupName=id.substring(0,id.indexOf("_"));
		if(!pool[groupName])pool[groupName]={};
		group=pool[groupName];
		//获得目标。
		var $target=document.getElementById(id);
		if(!$target.offsetHeight)group.$target=$target;
		//播放动画。
		animation.play();
	};
}();
