/**
 * @name dialog
 * @author sundongguo
 * @version 20081006
 *
 * 在父页显示/隐藏一个iframe对话框，如果对话框显示，则自动居中，并有遮掩层防止对该对话框之外的元素操作。
 * popup(classType,url)
 * classType:		对话框的尺寸类别。
 * url:			对话框内容地址。
 */
//--------------------------------------------------[popup]
function popup(classType,url)
{
	var $dialog=$("dialog");
	//首次调用，创建iframe元素。
	if(!$dialog)
	{
		$dialog=$("<iframe>");
		$dialog.id="dialog";
		$dialog.scrolling="no";
		$dialog.frameBorder="no";
		document.body.appendChild($dialog);
	}
	//打开。
	if(url)
	{
		$dialog.className="popSize"+classType;
		$dialog.src=url;
		if(!$dialog.offsetWidth)
		{
			togglePopup("dialog");
			ElementManager.setFixed($dialog,{left:"50%",top:"50%"});
			ElementManager.setMaskBehind($dialog);
		}
	}
	//关闭。
	else
	{
		if($dialog.offsetWidth)
		{
			togglePopup("dialog");
			ElementManager.setFixed($dialog);
			ElementManager.setMaskBehind();
		}
	}
}
