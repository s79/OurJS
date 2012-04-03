/**
 * @fileOverview 组件 - 日历。
 * @author sundongguo@gmail.com
 * @version 20120329 (update from 20080528)
 */
(function() {
// 避免 $ 被覆盖。
  var $ = document.$;

//==================================================[Calendar]
  /*
   * 日历组件。
   */

//--------------------------------------------------[Calendar Constructor]
  /**
   * 日历选择组件。
   * @name Calendar
   * @memberOf components
   * @constructor
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Calendar.options 中。
   * @param {boolean} options.useStandardSequence 是否按照标准顺序排列日期。设置为 true 按照“周日 - 周六”的顺序排列，否则按照“周一 - 周日”的顺序排列。
   * @param {string} options.theme 主题样式，即创建的最外层 DOM 元素的 className。
   * @param {string} options.minDate 最小日期，格式为 yyyy-mm-dd，默认为 1900-01-01。
   * @param {string} options.maxDate 最大日期，格式为 yyyy-mm-dd，默认为 2100-12-31。
   * @param {Function} options.onSelect 选定日期后执行的函数，传入选定的日期，格式为 yyyy-mm-dd 的字符串。
   */
//  function Calendar(items, options) {
//
//  }

  /*
   * 使用var oCalendar=new Calendar()创建一个日历控件。
   * 使用oCalendar.setOptions(oConfig)设置该控件的选项。
   * 使用oCalendar.list()刷新该控件的显示日期。
   * 使用oCalendar.getDOM()获取该控件的DOM元素。
   * 访问oCalendar.selectedDate获取该控件已选定的日期，该属性是格式为yyyy-mm-dd的字符串参数。
   */
//--------------------------------------------------[Calendar]
  function Calendar() {
    function createButton() {
      function changeClassName(sState) {
        if (elButton.className.indexOf("-disabled") != -1) {
          return;
        }
        elButton.className = elButton.className.substring(0, elButton.className.indexOf("-")) + sState;
      }

      var elButton = document.createElement("button");
      elButton.onmouseover = elButton.onmouseup = function() {
        changeClassName("-over");
      };
      elButton.onmouseout = function() {
        changeClassName("-out");
      };
      elButton.onmousedown = function() {
        changeClassName("-down");
      };
      elButton.onclick = function() {
        if (this.className.indexOf("-disabled") > -1) {
          return;
        }
        var nY = parseInt(elY.innerHTML, 10);
        var nM = parseInt(elM.innerHTML, 10);
        switch (this.className.substring(0, 3)) {
          case "p_y":
            _this.list((nY - 1) + "-" + nM);
            break;
          case "p_m":
            if (nM == 1) {
              nM = 12;
              nY--;
            } else {
              nM--;
            }
            _this.list(nY + "-" + nM);
            break;
          case "n_m":
            if (nM == 12) {
              nM = 1;
              nY++;
            } else {
              nM++;
            }
            _this.list(nY + "-" + nM);
            break;
          case "n_y":
            _this.list((nY + 1) + "-" + nM);
            break;
        }
      };
      return elButton;
    }

    //建立主元素elBody。
    var elBody = document.createElement("div");
    //建立控制按钮。
    var elDiv = document.createElement("div");
    elDiv.appendChild(createButton());
    elDiv.appendChild(createButton());
    var elY = document.createElement("span");
    elDiv.appendChild(elY);
    var elDot = document.createElement("em");
    elDot.innerHTML = ".";
    elDiv.appendChild(elDot);
    var elM = document.createElement("span");
    elDiv.appendChild(elM);
    elDiv.appendChild(createButton());
    elDiv.appendChild(createButton());
    //建立日历列表。
    var elTable = document.createElement("table");
    elTable.cellPadding = 0;
    elTable.cellSpacing = 1;
    var elThead = document.createElement("thead");
    elTable.appendChild(elThead);
    var elTbody = document.createElement("tbody");
    elTable.appendChild(elTbody);
    var elTr = document.createElement("tr");
    elThead.appendChild(elTr);
    for (var i = 0; i < 7; i++) {
      var elTd = document.createElement("td");
      elTr.appendChild(elTd);
    }
    for (var i = 0; i < 6; i++) {
      elTbody.appendChild(elTr.cloneNode(true));
    }
    //绑定单击事件。
    elTable.onclick = function(event) {
      var elTarget = event ? event.target : window.event.srcElement;
      if (elTarget.className.indexOf("enabled") == -1) {
        return;
      }
      _this.selectedDate = elTarget.title;
      _this._options.onSelect();
    };
    //控制按钮->elBody
    elBody.appendChild(elDiv);
    //日历列表->elBody
    elBody.appendChild(elTable);

    var _this = this;
    _this._options =
    {
      minDate: "1900-01-01",
      maxDate: "2100-12-31",
      onSelect: function() {
        alert(_this.selectedDate);
      },
      standardSequence: true,
      baseClass: "calendar"
    };
    _this._elDOM = elBody;
  }

  Calendar.prototype = {
    setOptions: function(oOption) {
      for (var i in this._options) {
        if (i in oOption) {
          this._options[i] = oOption[i];
        }
      }
    },
    list: function(sYM) {
      function format(n) {
        return n < 10 ? "0" + n : n;
      }

      function splitYMD(sYMD) {
        var aYMD = sYMD.split(/\D+/);
        for (var i = 0; i < aYMD.length; i++) {
          aYMD[i] = parseInt(aYMD[i], 10);
        }
        return aYMD;
      }

      function getPreviousMonth(nY, nM) {
        return nM == 0 ? [nY - 1, 11] : [nY, nM - 1];
      }

      function getNextMonth(nY, nM) {
        return nM == 11 ? [nY + 1, 0] : [nY, nM + 1];
      }

      function getDays(nY, nM) {
        var aDays = [31, 29.28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return nM == 1 ? nY % 4 == 0 && (nY < 1582 || nY % 100 != 0 || nY % 400 == 0) ? 29 : 28 : aDays[nM];
      }

      function outOfRange(nYThis, nMThis, nDThis) {
        return nYThis < nYMin || nYThis > nYMax || nYThis == nYMin && nMThis < nMMin || nYThis == nYMax && nMThis > nMMax || nYThis == nYMin && nMThis == nMMin && nDThis < nDMin || nYThis == nYMax && nMThis == nMMax && nDThis > nDMax;
      }

      //如果省略参数，则取已选定值，如果无选定值，取系统当前日期。
      if (!sYM) {
        if (this.selectedDate) {
          sYM = this.selectedDate.substring(0, 7);
        }
        else {
          var dNow = new Date();
          sYM = dNow.getFullYear() + "-" + (dNow.getMonth() + 1);
        }
      }
      //设置样式。
      this._elDOM.className = this._options.baseClass;
      //临时数组。
      var aTemp = [];
      //取最大、最小、当前年月。
      aTemp = splitYMD(this._options.minDate);
      var nYMin = aTemp[0];          //最小年。
      var nMMin = aTemp[1] - 1;          //最小月。
      var nDMin = aTemp[2];          //最小日。
      aTemp = splitYMD(this._options.maxDate);
      var nYMax = aTemp[0];          //最大年。
      var nMMax = aTemp[1] - 1;          //最大月。
      var nDMax = aTemp[2];          //最大日。
      aTemp = splitYMD(sYM);
      var nYCurrent = aTemp[0];          //当前年。
      var nMCurrent = aTemp[1] - 1;        //当前月。
      //限定当前年月在最大-最小范围内。
      if (nYCurrent < nYMin) {
        nYCurrent = nYMin;
      }
      if (nYCurrent > nYMax) {
        nYCurrent = nYMax;
      }
      if (nYCurrent == nYMin && nMCurrent < nMMin) {
        nMCurrent = nMMin;
      }
      if (nYCurrent == nYMax && nMCurrent > nMMax) {
        nMCurrent = nMMax;
      }
      //设置调节按钮。
      var aButtons = this._elDOM.getElementsByTagName("button");
      aButtons[0].className = "p_y" + (nYCurrent == nYMin ? "-disabled" : "-out");
      aButtons[1].className = "p_m" + (nYCurrent == nYMin && nMCurrent == nMMin ? "-disabled" : "-out");
      aButtons[2].className = "n_m" + (nYCurrent == nYMax && nMCurrent == nMMax ? "-disabled" : "-out");
      aButtons[3].className = "n_y" + (nYCurrent == nYMax ? "-disabled" : "-out");
      //写年份、月份。
      var aYearAndMonth = this._elDOM.getElementsByTagName("span");
      aYearAndMonth[0].innerHTML = nYCurrent;
      aYearAndMonth[1].innerHTML = format(nMCurrent + 1);
      //写星期。
      var aDayText = ["一", "二", "三", "四", "五", "<span>六</span>"];
      aDayText[this._options.standardSequence ? "unshift" : "push"]("<span>日</span>");
      var elTable = this._elDOM.getElementsByTagName("table")[0];
      for (var i = 0; i < 7; i++) {
        elTable.rows[0].cells[i].innerHTML = aDayText[i];
      }
      //写日期。
      var nYSelected = 0;          //已选年。
      var nMSelected = 0;          //已选月。
      var nDSelected = 0;          //已选日。
      if (this.selectedDate) {
        aTemp = splitYMD(this.selectedDate);
        nYSelected = aTemp[0];
        nMSelected = aTemp[1] - 1;
        nDSelected = aTemp[2];
      }
      aTemp = getPreviousMonth(nYCurrent, nMCurrent);
      var nYPrevious = aTemp[0];        //上月年。
      var nMPrevious = aTemp[1];        //上月月。
      aTemp = getNextMonth(nYCurrent, nMCurrent);
      var nYNext = aTemp[0];          //下月年。
      var nMNext = aTemp[1];          //下月月。
      var nBPM = new Date(nYCurrent, nMCurrent, 1).getDay();  //上月可填补数。
      nBPM = this._options.standardSequence ? (nBPM == 0 ? 7 : nBPM) : (nBPM < 2 ? nBPM + 6 : nBPM - 1);
      var nDPM = getDays(nYPrevious, nMPrevious);    //上月天数。
      var nDCM = getDays(nYCurrent, nMCurrent);      //本月天数。
      var tempY, tempM, tempD;
      var aDays = this._elDOM.getElementsByTagName("tbody")[0].getElementsByTagName("td");
      for (var i = 0; i < aDays.length; i++) {
        var elDay = aDays[i];
        elDay.className = "";
        if (i < nBPM) {
          tempY = nYPrevious;
          tempM = nMPrevious;
          tempD = i - nBPM + nDPM + 1;
          elDay.className += " previous_month";
        }
        else if (i - nBPM < nDCM) {
          tempY = nYCurrent;
          tempM = nMCurrent;
          tempD = i - nBPM + 1;
          elDay.className += " this_month";
          if (nYCurrent == nYSelected && nMCurrent == nMSelected && tempD == nDSelected) {
            elDay.className += " current_day";
          }
        }
        else {
          tempY = nYNext;
          tempM = nMNext;
          tempD = i - nBPM - nDCM + 1;
          elDay.className += " next_month";
        }
        elDay.title = tempY + "-" + format(tempM + 1) + "-" + format(tempD);
        if (outOfRange(tempY, tempM, tempD)) {
          elDay.className += " disabled";
          elDay.title += "(超出范围)";
          elDay.onmouseover = elDay.onmouseout = null;
        }
        else {
          elDay.className += " enabled";
          //照顾IE5.5/IE6。
          elDay.onmouseover = function() {
            this.className = "hover " + this.className;
          };
          elDay.onmouseout = function() {
            this.className = this.className.substring(6);
          };
        }
        elDay.innerHTML = tempD;
      }
    },
    getDOM: function() {
      return this._elDOM;
    }
  };

  window.Calendar = Calendar;

//--------------------------------------------------[Calendar.options]
  /**
   * 默认选项。
   * @name Calendar.options
   * @memberOf components
   */
  Calendar.options = {
    useStandardSequence: true,
    theme: 'calendar',
    minDate: '1900-01-01',
    maxDate: '2100-12-31',
    onSelect: empty
  };

})();
