/**
 * @name Calendar
 * @author sundongguo
 * @version 20080528
 *
 * 使用var oCalendar=new Calendar()创建一个日历控件。
 * 使用oCalendar.setOptions(oConfig)设置该控件的选项。
 * 使用oCalendar.list()刷新该控件的显示日期。
 * 使用oCalendar.getDOM()获取该控件的DOM元素。
 * 访问oCalendar.selectedDate获取该控件已选定的日期，该属性是格式为yyyy-mm-dd的字符串参数。
 * oConfig.minDate:		最小日期，格式为yyyy-mm-dd，默认为1900-01-01。
 * oConfig.maxDate:		最大日期，格式为yyyy-mm-dd。
 * oConfig.onSelect:		点击选定某日期后执行的函数。
 * oConfig.standardSequence:	是否按照周日-周六的顺序排列日期，设置为true按照上述方法排列，否则按照周一-周日的顺序排列。
 * oConfig.baseClass:		日期控件的基本样式。
 */
//--------------------------------------------------[Calendar]
function Calendar()
{
	function createDOM()
	{
		function createButton()
		{
			function changeClassName(sState)
			{
				if(elButton.className.indexOf("-disabled")!=-1)return;
				elButton.className=elButton.className.substring(0,elButton.className.indexOf("-"))+sState;
			}
			var elButton=document.createElement("button");
			elButton.onmouseover=elButton.onmouseup=function()
			{
				changeClassName("-over");
			};
			elButton.onmouseout=function()
			{
				changeClassName("-out");
			};
			elButton.onmousedown=function()
			{
				changeClassName("-down");
			};
			elButton.onclick=function()
			{
				if(this.className.indexOf("-disabled")>-1)return;
				var nY=parseInt(elY.innerHTML,10);
				switch(this.className.substring(0,3))
				{
				case "p_y":
					_this.list(nY-1);
					break;
				case "n_y":
					_this.list(nY+1);
					break;
				}
			};
			return elButton;
		}
		//建立主元素elBody。
		var elBody=document.createElement("div");
		//建立控制按钮。
		var elDiv=document.createElement("div");
		elDiv.appendChild(createButton());
		var elY=document.createElement("span");
		elDiv.appendChild(elY);
		elDiv.appendChild(createButton());
		//建立月历列表。
		var elTable=document.createElement("table");
		elTable.cellPadding=0;
		elTable.cellSpacing=1;
		var elTbody=document.createElement("tbody");
		elTable.appendChild(elTbody);
		var elTr=document.createElement("tr");
		for(var i=0;i<3;i++)
		{
			var elTd=document.createElement("td");
			elTr.appendChild(elTd);
		}
		for(var i=0;i<4;i++)
		{
			elTbody.appendChild(elTr.cloneNode(true));
		}
		//绑定单击事件。
		elTable.onclick=function(event)
		{
			var elTarget=event?event.target:window.event.srcElement;
			if(elTarget.className.indexOf("enabled")==-1)return;
			_this.selectedDate=elTarget.title;
			_this._options.onSelect();
		};
		//控制按钮->elBody
		elBody.appendChild(elDiv);
		//日历列表->elBody
		elBody.appendChild(elTable);
		return elBody;
	}
	var _this=this;
	_this._options=
	{
		minDate:"1901-01",
		maxDate:"2100-12",
		onSelect:function(){_this.list();},
		baseClass:"calendar"
	};
	_this._elDOM=createDOM();
}
Calendar.prototype=
{
	setOptions:function(oOption)
	{
		for(var i in this._options)if(i in oOption)this._options[i]=oOption[i];
	},
	list:function(sY)
	{
		function format(n)
		{
			return n<10?"0"+n:n;
		}
		function splitYMD(sYMD)
		{
			var aYMD=sYMD.split(/\D+/);
			for(var i=0;i<aYMD.length;i++)aYMD[i]=parseInt(aYMD[i],10);
			return aYMD;
		}
		function outOfRange(nYThis,nMThis)
		{
			return nYThis==nYMin&&nMThis<nMMin||nYThis==nYMax&&nMThis>nMMax;
		}
		//如果省略参数，则取已选定值，如果无选定值，取系统当前日期。
		if(!sY)
		{
			if(this.selectedDate)
			{
				sY=this.selectedDate.substring(0,4);
			}
			else
			{
				var dNow=new Date();
				sY=dNow.getFullYear();
			}
		}
		//设置样式。
		this._elDOM.className=this._options.baseClass;
		//临时数组。
		var aTemp=[];
		//取最大、最小、目标年月。
		aTemp=splitYMD(this._options.minDate);
		var nYMin=aTemp[0];					//最小年。
		var nMMin=aTemp[1]-1;					//最小月。
		aTemp=splitYMD(this._options.maxDate);
		var nYMax=aTemp[0];					//最大年。
		var nMMax=aTemp[1]-1;					//最大月。
		var nYCurrent=parseInt(sY,10);				//当前年。
		//限定当前年在最大-最小范围内。
		if(nYCurrent<nYMin)nYCurrent=nYMin;
		if(nYCurrent>nYMax)nYCurrent=nYMax;
		//设置调节按钮。
		var aButtons=this._elDOM.getElementsByTagName("button");
		aButtons[0].className="p_y"+(nYCurrent==nYMin?"-disabled":"-out");
		aButtons[1].className="n_y"+(nYCurrent==nYMax?"-disabled":"-out");
		//写年份。
		this._elDOM.getElementsByTagName("span")[0].innerHTML=nYCurrent;
		//写月份。
		var nYSelected=0;					//已选年。
		var nMSelected=0;					//已选月。
		if(this.selectedDate)
		{
			aTemp=splitYMD(this.selectedDate);
			nYSelected=aTemp[0];
			nMSelected=aTemp[1]-1;
		}
		var aMonths=this._elDOM.getElementsByTagName("td");
		for(var i=0;i<aMonths.length;i++)
		{
			var elMonth=aMonths[i];
			elMonth.innerHTML=i+1;
			elMonth.title=nYCurrent+"-"+format(i+1);
			if(outOfRange(nYCurrent,i))
			{
				elMonth.className="disabled";
				elMonth.title+="(超出范围)";
				elMonth.onmouseover=elMonth.onmouseout=null;
			}
			else
			{
				elMonth.className="enabled";
				//照顾IE5.5/IE6。
				elMonth.onmouseover=function()
				{
					this.className="hover "+this.className;
				};
				elMonth.onmouseout=function()
				{
					this.className=this.className.substring(6);
				};
			}
			if(nYCurrent==nYSelected&&i==nMSelected)elMonth.className+=" selected";
		}
	},
	getDOM:function()
	{
		return this._elDOM;
	}
};
