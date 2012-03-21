//--------------------------------------------------[fireOnLoadEvent]
(function()
{
	function fireOnLoadEvent()
	{
		if(typeof init=="function")init();
	}
	if(window.addEventListener)
	{
		window.addEventListener("load",fireOnLoadEvent,false);
	}
	else if(window.attachEvent)
	{
		window.attachEvent("onload",fireOnLoadEvent);
	}
	else
	{
		window.onload=fireOnLoadEvent;
	}
})();
