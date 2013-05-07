/**
 * @fileOverview Widget - 月历
 * @author sundongguo@gmail.com
 * @version 20121024
 */

(function() {
//==================================================[Widget - 月历]
//--------------------------------------------------[Calendar]
  /**
   * “月历”可以显示指定月份的日期排列情况。
   * @name Calendar
   * @constructor
   * @fires update
   *   {string} month 显示的月份，格式为 YYYY-MM 的字符串。
   *   调用 update 方法后触发。
   * @fires cellupdate
   *   {Element} cell 已更新的单元格。
   *   {Date} date 已更新的日期。
   *   日期单元格更新后触发。每次调用 update 方法时，每个日期单元格都会更新一次。
   * @description
   *   <strong>启用方式：</strong>
   *   为一个 DIV 元素添加 'widget-calendar' 类，即可使该元素成为“月历”。
   *   <strong>结构约定：</strong>
   *   <ul>
   *     <li>“月历”初始化时，会在其内部自动追加一个表格元素，以显示指定月份的日期。</li>
   *     <li>当“月历”列出了一个月份的日期时，在上述表格元素中，每个单元格都会被添加用于表示星期几的类名 'sun'、'mon'、'tues'、'wed'、'thurs'、'fri'、'sat'，其中上一个月和下一个月的日期所在的单元格还会额外被添加类名 'prev' 和 'next'，今天的日期所在的单元格还会额外被添加类名 'today'。</li>
   *   </ul>
   *   <strong>新增行为：</strong>
   *   <ul>
   *     <li>如果“月历”在文档可用后即被解析完毕，且其 data-month 属性的值不为 '0000-00'，则其 update 方法会被自动调用。</li>
   *   </ul>
   *   <strong>默认样式：</strong>
   *   <pre class="lang-css">
   *   div.widget-calendar { visibility: hidden; }
   *   div.widget-calendar table { table-layout: fixed; border-collapse: separate; border-spacing: 1px; width: 218px; font: 14px/20px Verdana, Helvetica, Arial, SimSun, serif; cursor: default; }
   *   div.widget-calendar table td { padding: 0; border: 1px solid silver; border-radius: 2px; text-align: center; }
   *   div.widget-calendar thead td { border-color: white; color: navy; font-weight: bold; }
   *   div.widget-calendar tbody td { color: black; }
   *   div.widget-calendar tbody td.prev, div.widget-calendar tbody td.next { color: silver; }
   *   div.widget-calendar tbody td.today { font-weight: bold; text-decoration: underline; }
   *   </pre>
   * @description 可配置项
   *   data-month
   *     指定要显示哪一个月的“月历”，格式为 YYYY-MM。
   *     如果不指定本属性，则使用当前月份作为默认值。
   *     当需要将“月历”集成在其他功能中，只希望主动调用 update 方法进行更新时，应指定为 '0000-00'，这样就不会以当前月份作为默认值来自动调用 update 方法。
   *   data-first-day
   *     指定每周的第一天是星期几，取值范围为 0 - 6。
   *     如果不指定本属性，则使用 0 作为默认值，即每周的第一天为星期日。
   */

  /**
   * 当前显示的月份。
   * @name Calendar#month
   * @type string
   */

  /**
   * 显示或刷新指定月份的日期排列情况。
   * @name Calendar#update
   * @function
   * @param {string} [month] 月份，格式为 YYYY-MM 的字符串。
   *   如果该参数被省略，则使用本元素的 month 属性的值代替。
   * @returns {Element} 本元素。
   */

  Widget.register({
    type: 'calendar',
    selector: 'div.widget-calendar',
    styleRules: [
      'div.widget-calendar { visibility: hidden; }',
      'div.widget-calendar table { table-layout: fixed; border-collapse: separate; border-spacing: 1px; width: 218px; font: 14px/20px Verdana, Helvetica, Arial, SimSun, serif; cursor: default; }',
      'div.widget-calendar table td { padding: 0; border: 1px solid silver; border-radius: 2px; text-align: center; }',
      'div.widget-calendar thead td { border-color: white; color: navy; font-weight: bold; }',
      'div.widget-calendar tbody td { color: black; }',
      'div.widget-calendar tbody td.prev, div.widget-calendar tbody td.next { color: silver; }',
      'div.widget-calendar tbody td.today { font-weight: bold; text-decoration: underline; }'
    ],
    config: {
      month: '',
      firstDay: 0
    },
    methods: {
      update: function(month) {
        var $calendar = this.setStyle('visibility', 'visible');

        // 星期类名与文字。
        var dayNames = ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'];
        var dayTexts = ['日', '一', '二', '三', '四', '五', '六'];

        // 要显示的月份。
        if (month) {
          $calendar.month = month;
        }
        var showDate = Date.parseExact($calendar.month, 'YYYY-MM');
        var showY = showDate.getFullYear();
        var showM = showDate.getMonth();

        // 输出指定月份的日期。
        var firstDayOfWeek = $calendar.firstDay;
        var startIndex = (showDate.getDay() + 7 - firstDayOfWeek) % 7 || 7;
        var endIndex = startIndex + new Date(showY, showM + 1, 0).getDate();
        var today = Date.parseExact(new Date().format()).getTime();
        $calendar.elements.theadCells.forEach(function($cell, index) {
          $cell.className = dayNames[(index + firstDayOfWeek) % 7];
          $cell.innerText = dayTexts[(index + firstDayOfWeek) % 7];
        });
        $calendar.elements.tbodyCells.forEach(function($cell, index) {
          var date = new Date(showY, showM, index - startIndex + 1);
          // 星期几。
          $cell.className = dayNames[date.getDay()];
          // 日期区间。
          if (index < startIndex) {
            // 上个月的日期。
            $cell.addClass('prev');
          } else if (index < endIndex) {
            // 这个月的日期。
          } else {
            // 下个月的日期。
            $cell.addClass('next');
          }
          // 今天的日期。
          if (today === date.getTime()) {
            $cell.addClass('today');
          }
          // 输出日期。
          $cell.innerText = date.getDate();
          // 触发事件。
          $calendar.fire('cellupdate', {cell: $cell, date: date});
        });

        // 触发事件。
        $calendar.fire('update', {month: $calendar.month});

        return $calendar;

      }
    },
    initialize: function() {
      var $calendar = this;

      // 添加新元素。
      var $table = document.$('<table><thead></thead><tbody></tbody></table>').insertTo($calendar);
      var $thead = $table.getFirstChild();
      var $tbody = $table.getLastChild();
      var tr = $thead.insertRow(-1);
      for (var cell = 0; cell < 7; cell++) {
        tr.insertCell(-1);
      }
      for (var row = 0; row < 6; row++) {
        $tbody.appendChild(tr.cloneNode(true));
      }

      // 保存属性。
      $calendar.elements = {
        thead: $thead,
        tbody: $tbody,
        theadCells: $thead.findAll('td'),
        tbodyCells: $tbody.findAll('td')
      };
      if (!$calendar.month) {
        $calendar.month = new Date().format('YYYY-MM');
      }

      // 如果 month 不为 '0000-00' 则显示指定月份的“月历”。
      if ($calendar.month !== '0000-00') {
        document.on('afterdomready', function() {
          if ($calendar.style.visibility !== 'visible') {
            $calendar.update();
          }
        });
      }

    }
  });

})();
