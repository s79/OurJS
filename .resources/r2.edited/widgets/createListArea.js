/**
 * @name createListArea
 * @author sundongguo
 * @version 20081013
 *
 * 使用createListArea($target)创建一个列表组件。
 * $target是一个UL元素。
 *
 * ListArea.add(string);	//添加一个新元素，显示为string。
 * ListArea.remove();		//删除选定的元素。
 * ListArea.selected;		//选定的元素。
 */
//--------------------------------------------------[createListArea]
function createListArea($target)
{
	function select(event)
	{
		var $element=EventManager.getTargetElement(event);
		if($element==this)return;
		while($element.parentNode!=this)$element=$element.parentNode;
		if($element.className=="selected"||$element.className=="readonly")return;
		if(listArea.$selected)listArea.$selected.className="";
		listArea.$selected=$element;
		listArea.$selected.className="selected";
	}
	var listArea=
	{
		$selected:null,
		add:function(text)
		{
			var $li=$("<li>");
			$li.innerHTML=text;
			$target.appendChild($li);
		},
		remove:function()
		{
			$target.removeChild(listArea.$selected);
		}
	};
	EventManager.bind($target,"mousedown",select);
	return listArea;
}
