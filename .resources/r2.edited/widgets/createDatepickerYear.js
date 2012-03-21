/**
 * @name createDatePicker
 * @author sundongguo
 * @version 20080528
 *
 * 使用createDatePicker(sId)创建一个日历输入控件。
 * sId是目标元素。
 */
//--------------------------------------------------[createDatePicker]
function createDatePicker(sId)
{
	function toggle()
	{
		var self=arguments.callee;
		if(elCalendar.offsetHeight==0)
		{
			elDateBox.className="date_box date_box_show";
			calendar.list();
			elDateBox.parentNode.appendChild(elCalendar);
			document.onmousedown=self;
		}
		else
		{
			elDateBox.className="date_box date_box_hide";
			elDateBox.parentNode.removeChild(elCalendar);
			document.onmousedown=null;
		}
	}
	var calendar=new Calendar();
	var elCalendar=calendar.getDOM();
	var elDateBox=document.getElementById(sId);
	calendar.setOptions({
	minDate:"2008-05",
	maxDate:"2009-02",
	onSelect:function()
	{
		toggle();
		elDateBox.innerHTML=calendar.selectedDate;
		if(typeof setValue=="function")setValue(calendar.selectedDate);
	}
	});
	if(elDateBox.innerHTML!="")calendar.selectedDate=elDateBox.innerHTML;
	elDateBox.onmousedown=function(event)
	{
		toggle();
		event?event.stopPropagation():window.event.cancelBubble=true;
	};
	elCalendar.onmousedown=function(event)
	{
		event?event.stopPropagation():window.event.cancelBubble=true;
	};
}
