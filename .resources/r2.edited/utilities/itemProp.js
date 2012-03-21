/**
 * @name <null>
 * @author sundongguo
 * @version 20081029
 * @need ElementManager
 *       EventManager
 *       createScrollbar
 *
 * 显示弹出信息框。
 * 【注意：该工具仅为“R2-道具展示”页面设计，不可重用。】
 * 数据可随意添加，写在道具列表的td的var元素中。
 * 信息弹出位置是点击的按钮位置。
 * 再次点击按钮或点击提示框的“关闭”按钮则关闭提示信息框。
 * 如果数据不能填充一个300x100的区域，则以最小的尺寸显示数据，优先扩大宽度，宽度到300px后仍无法显示完全，扩大其高度，如果高度到100px后仍无法显示完全，则以自定义的滚动框容纳数据。
 */
EventManager.setOnDOMReady(function()
{
	function openInfo()
	{
		var text=$more.getElementsByTagName("var")[0].innerHTML;
		//尝试无滚动条信息框。
		$info=$info_1
		$info.style.width="auto";
		$info_1_text.innerHTML=text;
		$info_content.appendChild($info);
		$info.style.width=($info.offsetWidth>300?300:$info.offsetWidth)+"px";
		if($info.offsetHeight<100)
		{
			$more.appendChild($info);
		}
		else
		{
			//使用有滚动条信息框。
			$info=$info_2;
			$more.appendChild($info);
			$info_2_text.innerHTML=text;
			setTimeout(function(){scrollBar.setScrollbar();},0);
		}
	}
	function closeInfo()
	{
		$info.parentNode.removeChild($info);
		$info=null;
		$more=null;
	}
	function tBodyClick(event)
	{
		var $element=EventManager.getTargetElement(event).parentNode;
		if($element.className=="cotBtn"&&$element.getElementsByTagName("var").length)
		{
			if($more===$element)
			{
				closeInfo();
			}
			else
			{
				if($info)closeInfo();
				$more=$element;
				openInfo();
			}
		}
	}
	//准备弹出框。
	var $info_content=$("<div>");
	$info_content.className="info_content";

	var $info_1=$("<div>");
	$info_1.className="info_1";
	var $info_1_text=$("<div>");
	$info_1_text.className="info_1_text";
	var $info_1_close=$("<div>");
	$info_1_close.className="info_1_close";
	$info_1_close.title="关闭";
	$info_1.appendChild($info_1_text);
	$info_1.appendChild($info_1_close);
	$info_content.appendChild($info_1);

	var $info_2=$("<div>");
	$info_2.className="info_2";
	var $info_2_content=$("<div>");
	$info_2_content.className="info_2_content";
	var $info_2_text=$("<div>");
	$info_2_text.className="info_2_text";
	var $info_2_track=$("<div>");
	$info_2_track.className="track";
	var $info_2_close=$("<div>");
	$info_2_close.className="info_2_close";
	$info_2_close.title="关闭";
	$info_2_content.appendChild($info_2_text);
	$info_2_content.appendChild($info_2_track);
	$info_2.appendChild($info_2_content);
	$info_2.appendChild($info_2_close);
	$info_content.appendChild($info_2);

	document.body.appendChild($info_content);
	//准备变量。
	var $more,$info;
	var scrollBar=createScrollbar({$box:$info_2_text,$track:$info_2_track});
	//绑定事件。
	EventManager.bind($info_1_close,"click",closeInfo);
	EventManager.bind($info_2_close,"click",closeInfo);
	var tables=document.body.getElementsByTagName("tbody");
	for(var t=tables.length;t;t--)
	{
		var $tBody=tables[t-1];
		var n=$tBody.rows[0].cells.length-1;
		var zIndex=10;
		EventManager.bind($tBody,"click",tBodyClick);
		for(var i=$tBody.rows.length;i;i--)
		{
			var $td=$tBody.rows[i-1].cells[n];
			var aDiv=$td.getElementsByTagName("div");
			for(var j=aDiv.length;j;j--)
			{
				var $div=aDiv[j-1];
				if($div.className=="cotBtn")$div.style.zIndex=zIndex++;
			}
		}
	}
});
