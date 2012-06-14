/**
 * @fileOverview 组件 - 日历。
 * @author sundongguo@gmail.com
 * @version 20120329 (update from 20080528)
 */
execute(function($) {
//==================================================[Calendar]
  /*
   * 日历选择组件。
   */

//--------------------------------------------------[Calendar Constructor]
  /**
   * 日历选择组件。
   * @name Calendar
   * @constructor
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Calendar.options 中。
   * @param {boolean} options.useStandardSequence 是否按照标准顺序排列日期。设置为 true 按照“周日 - 周六”的顺序排列，否则按照“周一 - 周日”的顺序排列。
   * @param {string} options.theme 主题样式，即创建的最外层 DOM 元素的 className。
   * @param {string} options.minDate 最小日期，格式为 yyyy-mm-dd，默认为 1900-01-01。
   * @param {string} options.maxDate 最大日期，格式为 yyyy-mm-dd，默认为 2100-12-31。
   * @param {string} options.date 选定日期，格式为 yyyy-mm-dd。
   * @fires select
   *   {string} date 选定的日期，格式为 yyyy-mm-dd 的字符串。
   *   选定日期后触发。
   */
  function Calendar(options) {
    var calendar = this;
    // 保存选项。
    options = calendar.setOptions(options).options;
    this.date = options.data || undefined;
    // 创建 DOM 基本结构。
    var $calendar = $('<div class="' + options.theme + '"><div><span class="btn prev_year" data-action="prev_year">«</span><span class="btn prev_month" data-action="prev_month">‹</span><span class="year">0000</span><span>.</span><span class="month">00</span><span class="btn next_month" data-action="next_month">›</span><span class="btn next_year" data-action="next_year">»</span></div><table><thead></thead><tbody></tbody></table></div>');
    var $controlPanel = $calendar.getFirst();
    var controls = $controlPanel.find('*');
    var $thead = $controlPanel.getNext().getFirst();
    var $tbody = $thead.getNext();
    // 创建日历头。
    var tr = $thead.insertRow(-1);
    for (var i = 0; i < 7; i++) {
      tr.insertCell(-1);
    }
    // 创建日历体。
    for (var row = 0; row < 6; row++) {
      $tbody.append(tr.cloneNode(true));
    }
    // 保存 DOM 元素。
    calendar.elements = {
      calendar: $calendar,
      prevYear: controls[0],
      prevMonth: controls[1],
      year: controls[2],
      month: controls[4],
      nextMonth: controls[5],
      nextYear: controls[6],
      headCells: $thead.find('td'),
      bodyCells: $tbody.find('td')
    };
    // 绑定事件。
    $calendar.on('mousedown', function() {
      return false;
    });
    $calendar.on('click', function(e) {
      var $target = e.target;
      if ($target.hasClass('btn') && !$target.hasClass('disabled')) {
        // 点击动作按钮。
        var action = $target.getData('action');
        var year = Number.toInteger(calendar.elements.year.innerText);
        var month = Number.toInteger(calendar.elements.month.innerText);
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
        calendar.render(year + '-' + month + '-01');
      } else if ($target.hasClass('enabled') && !$target.hasClass('selected_date')) {
        // 选中一个日期。
        calendar.date = $target.title;
//        calendar.render(calendar.date);
        // 触发 select 事件。
        calendar.fire('select', {date: calendar.date});
      }
      return false;
    });
  }

//--------------------------------------------------[Calendar.options]
  /**
   * 默认选项。
   * @name Calendar.options
   */
  Calendar.options = {
    useStandardSequence: true,
    theme: 'calendar',
    date: undefined,
    minDate: '1900-01-01',
    maxDate: '2100-12-31'
  };

//--------------------------------------------------[Calendar.prototype.render]
  /**
   * 为一位数字前补零，返回补零后的字符串。
   * @function
   * @private
   * @param {number} n 要补零的数字。
   * @return {string} 补零后的字符串。
   */
  function format(n) {
    return n < 10 ? '0' + n : n;
  }

  /**
   * 将字符串型日期 yyyy-MM-dd 转化为日期对象。
   * @function
   * @private
   * @param {string} dateString
   * @return {Date} 日期对象。
   */
  function parseDate(dateString) {
    var ymd = dateString.split('-').map(function(item) {
      return Number.toInteger(item);
    });
    return new Date(ymd[0], ymd[1] - 1, ymd[2]);
  }

  /**
   * 渲染指定年/月份的日历。
   * @name Calendar.prototype.render
   * @function
   * @param {string} dateString 字符串表示的日期，格式为 yyyy-MM-dd。
   * @returns {Calendar} Calendar 对象。
   */
  Calendar.prototype.render = function(dateString) {
    var options = this.options;
    // 获取最大、最小、要显示的时间。
    var minDate = parseDate(options.minDate);
    var maxDate = parseDate(options.maxDate);
    var showDate = new Date(Math.limit(dateString ? parseDate(dateString).getTime() : new Date().getTime(), minDate.getTime(), maxDate.getTime()));
    var minY = minDate.getFullYear();
    var maxY = maxDate.getFullYear();
    var showY = showDate.getFullYear();
    var minM = minDate.getMonth();
    var maxM = maxDate.getMonth();
    var showM = showDate.getMonth();
    // 设置控制按钮。
    this.elements.prevYear[showY === minY ? 'addClass' : 'removeClass']('disabled');
    this.elements.prevMonth[showY === minY && showM === minM ? 'addClass' : 'removeClass']('disabled');
    this.elements.nextMonth[showY === maxY && showM === maxM ? 'addClass' : 'removeClass']('disabled');
    this.elements.nextYear[showY === maxY ? 'addClass' : 'removeClass']('disabled');
    // 显示年份和月份。
    this.elements.year.innerText = showY;
    this.elements.month.innerText = format(showM + 1);
//    // 触发 render 事件。
//    this.fire('render', {year: showY, month: showM + 1});
    // 星期类名（数组下标与星期数字相等）。
    var dayNames = ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'];
    var dayTexts = ['日', '一', '二', '三', '四', '五', '六'];
    // 每周从周几开始。
    var startDay = options.useStandardSequence ? 0 : 1;
    // 输出日历头（头尾均可能出现星期日）。
    this.elements.headCells.forEach(function($cell, index) {
      $cell.className = dayNames[(index + startDay) % 7];
      $cell.innerText = dayTexts[(index + startDay) % 7];
    });
    // 计算本月第一天和最后一天应该在日历的第几个单元格显示。
    var date = new Date(showY, showM, 1);
    var y;
    var m;
    var d;
    var startIndex = date.getDay();
    startIndex = startDay ? (startIndex < 2 ? startIndex + 6 : startIndex - 1) : (startIndex === 0 ? 7 : startIndex);
    var endIndex = startIndex + new Date(showY, showM + 1, 0).getDate();
    // 选定的日期。
    var selectedDate = this.date ? new Date(Math.limit(parseDate(this.date).getTime(), minDate.getTime(), maxDate.getTime())) : null;
    // 输出日历体。
    this.elements.bodyCells.forEach(function($cell, index) {
      date = new Date(showY, showM, index - startIndex + 1);
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
      // 当前选定的日期。
      if (selectedDate && selectedDate.getTime() === date.getTime()) {
        $cell.addClass('selected_date');
      }
      // 输出日期。
      $cell.innerText = date.getDate();
      $cell.title = y + '-' + format(m + 1) + '-' + format(d);
      // 是否超出范围。
      if (date < minDate || date > maxDate) {
        $cell.title += '(超出范围)';
        $cell.addClass('disabled');
      } else {
        $cell.addClass('enabled');
      }
    });
    // 返回 Calendar 对象。
    return this;
  };

//--------------------------------------------------[Calendar.prototype.getElement]
  /**
   * 获取日历的容器元素，以便选择插入 DOM 树的位置。
   * @name Calendar.prototype.getElement
   * @function
   * @returns {Element} 日历的容器元素。
   */
  Calendar.prototype.getElement = function() {
    return this.elements.calendar;
  };

//--------------------------------------------------[Calendar]
  window.Calendar = new Component(Calendar, Calendar.options, Calendar.prototype);

});
