/**
 * @fileOverview 组件 - 月历。
 * @author sundongguo@gmail.com
 * @version 20120329 (update from 20080528)
 */
execute(function($) {
//==================================================[Calendar]
  /*
   * 创建月历。
   */

//--------------------------------------------------[Calendar Constructor]
  /**
   * 月历。
   * @name Calendar
   * @constructor
   * @param {string} [className] 创建的最外层 DOM 元素的类名，默认为 'calendar'。
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Calendar.options 中。
   * @param {number} options.firstDayOfWeek 指定每周的第一天是星期几，取值范围为 0 - 6，默认为 0，即星期日。
   * @param {string} options.minDate 最小日期，格式为 YYYY-MM-DD，默认为 1900-01-01。
   * @param {string} options.maxDate 最大日期，格式为 YYYY-MM-DD，默认为 2100-12-31。
   * @fires render
   *   {string} renderedMonth 渲染的月份，格式为 YYYY-MM 的字符串。
   *   调用 render 方法后触发。
   * @fires cellUpdate
   *   {Element} cell 已更新的单元格。
   *   {Date} date 已更新的日期。
   *   日期单元格更新后触发，每次调用 render 方法时，每个日期单元格都会更新一次。
   */
  var Calendar = new Component(function(className) {
    var calendar = this;

    // 创建 DOM 结构。
    var $calendar = $('<div class="' + (className || 'calendar') + '"><div><span class="btn prev_year" data-action="prev_year">«</span><span class="btn prev_month" data-action="prev_month">‹</span><span class="year">0000</span><span>-</span><span class="month">00</span><span class="btn next_month" data-action="next_month">›</span><span class="btn next_year" data-action="next_year">»</span></div><table><thead></thead><tbody></tbody></table></div>');
    var $controlPanel = $calendar.getFirstChild();
    var controls = $controlPanel.find('*');
    var $prevYear = controls[0];
    var $prevMonth = controls[1];
    var $year = controls[2];
    var $month = controls[4];
    var $nextMonth = controls[5];
    var $nextYear = controls[6];
    var $thead = $controlPanel.getNextSibling().getFirstChild();
    var $tbody = $thead.getNextSibling();
    // 创建月历头。
    var tr = $thead.insertRow(-1);
    for (var cell = 0; cell < 7; cell++) {
      tr.insertCell(-1);
    }
    // 创建月历体。
    for (var row = 0; row < 6; row++) {
      $tbody.append(tr.cloneNode(true));
    }

    // 保存属性。
    calendar.elements = {
      container: $calendar,
      prevYear: $prevYear,
      prevMonth: $prevMonth,
      year: $year,
      month: $month,
      nextMonth: $nextMonth,
      nextYear: $nextYear,
      head: $thead,
      body: $tbody,
      headCells: $thead.find('td'),
      bodyCells: $tbody.find('td')
    };

    // 点击控制按钮，仅在控制按钮可见且没有被禁用的情况下有效。
    $controlPanel.on('click', function(event) {
      var $target = event.target;
      if ($target.offsetWidth && $target.hasClass('btn') && !$target.hasClass('disabled')) {
        var action = $target.getData('action');
        var year = Number.toInteger($year.innerText);
        var month = Number.toInteger($month.innerText);
        switch (action) {
          case 'prev_year':
            --year;
            break;
          case 'prev_month':
            if (month === 1) {
              month = 12;
              --year;
            } else {
              --month;
            }
            break;
          case 'next_month':
            if (month === 12) {
              month = 1;
              ++year;
            } else {
              ++month;
            }
            break;
          case 'next_year':
            ++year;
            break;
        }
        calendar.render(year + '-' + month.padZero(2));
      }
      return false;
    });

    // 鼠标滚轮支持（滚轮翻月，Shift + 滚轮翻年）。
    $calendar.on('mousewheel', function(event) {
      if (event.wheelUp) {
        (event.shiftKey ? $prevYear : $prevMonth).fire('click');
      }
      if (event.wheelDown) {
        (event.shiftKey ? $nextYear : $nextMonth).fire('click');
      }
      return false;
    });

    // 阻止一些浏览器的划选动作。
    $calendar.on('mousedown', function() {
      return false;
    });

  });

//--------------------------------------------------[Calendar.options]
  /**
   * 默认选项。
   * @name Calendar.options
   */
  Calendar.options = {
    firstDayOfWeek: 0,
    minDate: '1900-01-01',
    maxDate: '2100-12-31'
  };

//--------------------------------------------------[Calendar.prototype.getElement]
  /**
   * 获取月历的容器元素，以便选择插入 DOM 树的位置。
   * @name Calendar.prototype.getElement
   * @function
   * @returns {Element} 月历的容器元素。
   */
  Calendar.prototype.getElement = function() {
    return this.elements.container;
  };

//--------------------------------------------------[Calendar.prototype.render]
  /**
   * 渲染指定的月份。
   * @name Calendar.prototype.render
   * @function
   * @param {string} [month] 月份，格式为 YYYY-MM 的字符串。
   *   若该参数没有指定，则使用当前已渲染的月份（即刷新当前的月历）；若没有当前已渲染的月份，则使用当前系统时间所在的月份。
   * @returns {Calendar} Calendar 对象。
   */
  Calendar.prototype.render = function(month) {
    var calendar = this;
    var options = calendar.options;
    var elements = calendar.elements;

    // 获取最大、最小、要显示的年和月。
    var minDate = Date.from(options.minDate);
    var maxDate = Date.from(options.maxDate);
    var showDate = new Date(Math.limit((month ? Date.from(month, 'YYYY-MM') : (calendar.renderedMonth ? Date.from(calendar.renderedMonth, 'YYYY-MM') : new Date())).getTime(), minDate.getTime(), maxDate.getTime()));
    var minY = minDate.getFullYear();
    var maxY = maxDate.getFullYear();
    var showY = showDate.getFullYear();
    var minM = minDate.getMonth();
    var maxM = maxDate.getMonth();
    var showM = showDate.getMonth();

    // 设置控制按钮。
    if (showY === minY) {
      elements.prevYear.addClass('disabled').title = '上一年（超出范围）';
    } else {
      elements.prevYear.removeClass('disabled').title = '上一年';
    }
    if (showY === minY && showM === minM) {
      elements.prevMonth.addClass('disabled').title = '上一月（超出范围）';
    } else {
      elements.prevMonth.removeClass('disabled').title = '上一月';
    }
    if (showY === maxY && showM === maxM) {
      elements.nextMonth.addClass('disabled').title = '下一月（超出范围）';
    } else {
      elements.nextMonth.removeClass('disabled').title = '下一月';
    }
    if (showY === maxY) {
      elements.nextYear.addClass('disabled').title = '下一年（超出范围）';
    } else {
      elements.nextYear.removeClass('disabled').title = '下一年';
    }

    // 输出年份和月份。
    elements.year.innerText = showY;
    elements.month.innerText = (showM + 1).padZero(2);

    // 输出星期类名与文字。
    var dayNames = ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'];
    var dayTexts = ['日', '一', '二', '三', '四', '五', '六'];

    // 输出月历头和月历体。
    var y;
    var m;
    var d;
    var firstDayOfWeek = options.firstDayOfWeek;
    var startIndex = (new Date(showY, showM, 1).getDay() + 7 - firstDayOfWeek) % 7 || 7;
    var endIndex = startIndex + new Date(showY, showM + 1, 0).getDate();
    var today = Date.from(new Date().format()).getTime();
    elements.headCells.forEach(function($cell, index) {
      $cell.className = dayNames[(index + firstDayOfWeek) % 7];
      $cell.innerText = dayTexts[(index + firstDayOfWeek) % 7];
    });
    elements.bodyCells.forEach(function($cell, index) {
      var date = new Date(showY, showM, index - startIndex + 1);
      y = date.getFullYear();
      m = date.getMonth();
      d = date.getDate();
      // 星期几。
      $cell.className = dayNames[date.getDay()];
      // 日期区间。
      if (index < startIndex) {
        // 上个月的日期。
        $cell.addClass('prev_month');
      } else if (index < endIndex) {
        // 这个月的日期。
      } else {
        // 下个月的日期。
        $cell.addClass('next_month');
      }
      // 今天的日期。
      if (today === date.getTime()) {
        $cell.addClass('today');
      }
      // 输出日期。
      $cell.innerText = d;
      // 是否超出范围。
      if (date < minDate || date > maxDate) {
        $cell.addClass('disabled');
      } else {
        $cell.addClass('enabled');
      }
      // 触发 cellUpdate 事件，供单元格定制用。
      calendar.fire('cellUpdate', {cell: $cell, date: date});
    });

    // 渲染完毕，保存状态并触发 render 事件。
    calendar.renderedMonth = showDate.format('YYYY-MM');
    calendar.fire('render', {renderedMonth: calendar.renderedMonth});

    return calendar;

  };

//--------------------------------------------------[Calendar]
  window.Calendar = Calendar;

});
