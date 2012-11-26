/**
 * @fileOverview Widget - 表单验证器。
 * @author sundongguo@gmail.com
 * @version 20121008
 */

(function() {
//==================================================[Widget - 表单验证器]
//--------------------------------------------------[valueValidator]
  var valueValidator = {
    required: function(control, value, ruleValue) {
      return ruleValue && value.length > 0 ? '' : (control.nodeType ? '必填项' : '必选项');
    },
    equals: function(control, value, ruleValue) {
      return value === control.form.getFieldValue(ruleValue) ? '' : '两次输入的密码不一致';
    },
    minLength: function(control, value, ruleValue) {
      return value.length >= ruleValue ? '' : (control.nodeType ? '不能少于 ' + ruleValue + ' 个字符' : '至少选择 ' + ruleValue + ' 项');
    },
    maxLength: function(control, value, ruleValue) {
      return value.length <= ruleValue ? '' : (control.nodeType ? '不能超过 ' + ruleValue + ' 个字符' : '最多选择 ' + ruleValue + ' 项');
    },
    type: function(_, value, ruleValue) {
      var result = true;
      if (value) {
        switch (ruleValue) {
          case 'number':
            result = /^([+-]?\d+)(\.\d+)?$/.test(value);
            break;
          case 'date':
            result = value === Date.from(value).format();
            break;
          case 'email':
            result = /^([\w-])+@([\w-])+((\.[\w-]+){1,3})$/.test(value);
            break;
          case 'phone':
            result = /^\d{11}?$/.test(value);
        }
      }
      return result ? '' : '格式错误';
    }
  };

//--------------------------------------------------[validateField]
  var validateField = function($form, name) {
    // 获取指定表单域的控件和值。
    var control = $form.elements[name];
    var value = $form.getFieldValue(name);

    // 取出验证相关的数据。
    var validationData = $form._validationData_;
    var ruleSet = validationData.rules[name];
    var messageSet = validationData.messages[name];
    var states = validationData.states;
    var requests = validationData.requests;

    // 开始验证表单域。
    states[name] = undefined;
    $form.fire('fieldvalidate', {name: name, value: value});

    // 首先进行 5 种内置规则的验证。
    var ruleNames = ['required', 'equals', 'minLength', 'maxLength', 'type'];
    var ruleName;
    var message;
    var errorMessage = '';
    while (!errorMessage && (ruleName = ruleNames.shift())) {
      if (ruleSet.hasOwnProperty(ruleName)) {
        message = valueValidator[ruleName](control, value, ruleSet[ruleName]);
        if (message) {
          errorMessage = messageSet && messageSet[name] && messageSet[name][ruleName] || message;
        }
      }
    }

    // 然后再执行 2 种自定规则的验证。
    var custom = ruleSet.custom;
    var remote = ruleSet.remote;
    if (!errorMessage && custom) {
      errorMessage = custom.call($form, value);
    }
    if (!errorMessage && remote) {
      // 需要服务端验证，在验证结束后异步触发 fieldvalidated 事件。
      if (requests[name]) {
        requests[name].off('finish').abort();
      }
      var requestData = {};
      requestData[remote.valueKey] = value;
      requests[name] = new Request(remote.url, remote.options)
          .on('finish', function(e) {
            delete requests[name];
            var errorMessage = remote.validateResult(e);
            states[name] = !errorMessage;
            $form.fire('fieldvalidated', {name: name, value: value, errorMessage: errorMessage});
          })
          .send(requestData);
    } else {
      // 不需要服务端验证，同步触发 fieldvalidated 事件。
      states[name] = !errorMessage;
      $form.fire('fieldvalidated', {name: name, value: value, errorMessage: errorMessage});
    }
  };

//--------------------------------------------------[Validator]
  /**
   * 表单验证器。
   * @name Validator
   * @constructor
   * @fires fieldvalidate
   *   {string} name 验证的表单域的名称。
   *   {string|Array} value 验证的表单域的值。
   *   当开始验证一个表单域时触发。
   * @fires fieldvalidated
   *   {string} name 验证的表单域的名称。
   *   {string|Array} value 验证的表单域的值。
   *   {string} errorMessage “错误信息”字符串，为空则表示验证通过。
   *   在一个表单域验证结束后触发。
   * @fires validate
   *   当表单验证开始时（即表单的 submit 事件发生时）触发。
   * @fires validated
   *   {boolean} result 验证结果，仅当所有已配置的规则均验证通过时为 true，否则为 false。
   *   在表单验证结束后触发。
   * @description
   *   <strong>应用场景：</strong>
   *   需要对一个表单的用户输入部分进行验证，并在不同的状态下显示相应的提示信息。
   *   <strong>使用方法：</strong>
   *   为 FORM 元素添加 'widget-validator' 类，即可使该元素成为表单验证器。
   *   其子元素中包含类名 'messages' 的为“提示信息的容器”，该元素还应指定 data-for="<var>name</var>" 属性，<var>name</var> 为该提示信息对应的表单域的名称。
   *   <strong>新增特性：</strong>
   *   该表单的 submit 事件的默认行为将被阻止。
   *   如果一个表单域配置了验证规则，当其中包含的任何控件的值被用户改变时，都将自动对该表单域进行验证，并触发 fieldvalidate 事件，验证结束后会触发 fieldvalidated 事件。根据验证结果，会在指定的位置显示提示信息。
   *   当表单的 submit 事件发生时，会自动对所有配置的验证规则涉及到的、且尚未验证的表单域进行验证，并触发 validate 事件，验证结束后会触发 validated 事件。如果没有需要服务端验证的表单域，validated 事件将同步触发，否则 validated 事件将在所有的服务端验证结束后异步触发。
   *   在等待的所有服务端验证尚未结束前，如果用户修改了任一控件的值，则会立即取消当前的服务端验证，并触发 validated 事件，本次验证按失败处理。
   *   对提交行为的后续处理应在该表单的 validated 事件监听器中根据验证结果进行。
   *   当该表单触发 reset 事件时，当前的验证结果和所有已显示的提示信息也会随之重置。
   *   要手动验证某一个表单域，触发其中任一控件的 change 事件即可。
   */

  /**
   * 添加验证规则。
   * @name Validator#addValidationRules
   * @function
   * @param {Object} rules 要验证的表单域的名称及规则，格式为 <dfn>{<var>name</var>: <var>ruleSet</var>, ...}</dfn>。
   *   属性名 <var>name</var> 为要验证的表单域的名称。
   *   属性值 <var>ruleSet</var> 为定义验证规则的对象，包括 5 种预置规则和 2 种自定规则。详情如下：
   *   <table>
   *     <tr><th>规则名称</th><th>值类型</th><th>详细描述</th></tr>
   *     <tr><td><dfn>required</dfn></td><td>boolean</td><td>限定该表单域是否为必填项或必选项。</td></tr>
   *     <tr><td><dfn>equals</dfn></td><td>string</td><td>限定该表单域的值与相关表单域的值一致，仅应在这两个表单域均只包含一个文本控件时指定。相关表单域不能为该表单域自身。</td></tr>
   *     <tr><td><dfn>minLength</dfn></td><td>number</td><td>当该表单域只包含一个文本控件时，限定输入文本的最小长度，否则限定选择项的最少数目。</td></tr>
   *     <tr><td><dfn>maxLength</dfn></td><td>number</td><td>当该表单域只包含一个文本控件时，限定输入文本的最大长度，否则限定选择项的最多数目。</td></tr>
   *     <tr><td><dfn>type</dfn></td><td>Array</td><td>限定数据的类型，值可以为 '<dfn>number</dfn>'、'<dfn>date</dfn>'、'<dfn>email</dfn>'、'<dfn>phone</dfn>' 中的任一个。</td></tr>
   *     <tr><td><dfn>custom</dfn></td><td>Function</td><td>用来对该表单域的值进行进一步验证的函数，该函数被调用时传入该表单域的值，其 this 的值为本表单元素，返回值应为一个“错误信息”字符串，为空则表示验证通过。</td></tr>
   *     <tr><td><dfn>remote</dfn></td><td>Object</td><td>指定对该表单域的值进行服务端验证，包含四个属性：<dfn>url</dfn>、<dfn>options</dfn>、<dfn>onSend</dfn>、<dfn>onReceive</dfn>。前两个属性为创建远程请求使用的 Request 的参数。<dfn>onSend</dfn> 是对该表单域的值进行预处理的函数，其返回值为要发送给服务端的数据。<dfn>onReceive</dfn> 是处理服务端返回信息的函数，该函数应该返回“错误信息”字符串，若“错误信息”字符串为空则表示验证通过。</td></tr>
   *   </table>
   *   验证将以上表列出的“规则名称”自上而下的顺序进行。
   *   若不需要某种类型的验证，在 <var>ruleSet</var> 中省略对应的项即可。
   * @returns {Element} 本元素。
   * @description
   *   新的配置将在下次使用到这些验证规则的时候生效。
   */

  /**
   * 删除验证规则。
   * @name Validator#removeValidationRules
   * @function
   * @param {Array} names 要删除验证规则的表单域的名称。
   * @returns {Element} 本元素。
   * @description
   *   删除某个表单域的验证规则将自动清除该针对该表单域的已显示的提示信息。
   */

  /**
   * 设置自定义提示信息，而不使用默认的提示信息。
   * @name Validator#setValidationMessages
   * @function
   * @param {Object} messages 要定义提示信息的表单域的名称及信息内容，格式为 <dfn>{<var>name</var>: <var>messageSet</var>, ...}</dfn>。
   *   属性名 <var>name</var> 为要自定义提示信息的表单域的名称。
   *   属性值 <var>messageSet</var> 为定义提示信息的对象，包括 4 种状态。详情如下：
   *   <table>
   *     <tr><th>状态</th><th>值类型</th><th>详细描述</th></tr>
   *     <tr><td><dfn>hint</dfn></td><td>string</td><td>输入提示，默认值为空字符串，即不显示输入提示。仅应为 text、password 和 textarea 类型的表单元素指定输入提示。</td></tr>
   *     <tr><td><dfn>validating</dfn></td><td>string</td><td>进行服务端验证时要显示的信息，默认值为 '<dfn>验证中……</dfn>'。</td></tr>
   *     <tr><td><dfn>valid</dfn></td><td>string</td><td>通过验证时要显示的信息，默认值为空字符串，即通过验证时不显示任何提示信息。</td></tr>
   *     <tr>
   *       <td><dfn>invalid</dfn></td>
   *       <td>string</td>
   *       <td>
   *       <span>未通过验证时要显示的信息，不同验证规则的默认值也不同：</span>
   *       <table>
   *         <tr><th>规则名称</th><th>提示信息默认值</th></tr>
   *         <tr><td><dfn>required</dfn></td><td>当该表单域只包含一个文本控件时为 '<dfn>必填项</dfn>'，否则为 '<dfn>必选项</dfn>'。</td></tr>
   *         <tr><td><dfn>equals</dfn></td><td>'<dfn>两次输入的密码不一致</dfn>'</td></tr>
   *         <tr><td><dfn>minLength</dfn></td><td>当该表单域只包含一个文本控件时为 '<dfn>不能少于 <var>n</var> 个字符</dfn>'，否则为 '<dfn>至少选择 <var>n</var> 项</dfn>'，其中 <var>n</var> 为配置验证规则时指定的值。</td></tr>
   *         <tr><td><dfn>maxLength</dfn></td><td>当该表单域只包含一个文本控件时为 '<dfn>不能超过 <var>n</var> 个字符</dfn>'，否则为 '<dfn>最多选择 <var>n</var> 项</dfn>'，其中 <var>n</var> 为配置验证规则时指定的值。</td></tr>
   *         <tr><td><dfn>type</dfn></td><td>'<dfn>格式错误</dfn>'</td></tr>
   *         <tr><td><dfn>custom</dfn></td><td>无默认值，提示信息为配置此种验证规则时验证函数的返回值。</td></tr>
   *         <tr><td><dfn>remote</dfn></td><td>无默认值，提示信息为配置此种验证规则时 onReceive 函数的返回值。</td></tr>
   *       </table>
   *       </td>
   *     </tr>
   *   </table>
   * @returns {Element} 本元素。
   * @description
   *   新的配置将在下次使用到这些提示信息的时候生效。
   */

  /**
   * 取消自定义的提示信息，使用默认的提示信息。
   * @name Validator#restoreValidationMessages
   * @function
   * @param {Array} names 要取消自定义的提示信息的表单域的名称。
   * @returns {Element} 本元素。
   * @description
   *   新的配置将在下次使用到这些提示信息的时候生效。
   */

  Widget.register('validator', {
    css: [
      '.widget-validator .panel { display: none; }',
      '.widget-validator .active { display: block; }'
    ],
    methods: {
      addValidationRules: function(rules) {
        var $form = this;
        var validationData = $form._validationData_;
        var associatedFields = validationData.associatedFields;
        // 清空关联表单域列表。
        Object.forEach(associatedFields, function(_, name) {
          delete associatedFields[name];
        });
        // 添加验证规则，并根据 equals 规则生成关联表单域列表。
        Object.forEach(Object.mixin(validationData.rules, rules), function(ruleSet, name) {
          var associatedName = ruleSet.equals;
          if (associatedName) {
            associatedFields[associatedName] = name;
          }
        });
        return $form;
      }
    },
    events: ['fieldvalidate', 'fieldvalidated', 'validate', 'validated'],
    initialize: function() {
      var $form = this;

      // 保存属性。
      var validationData = $form._validationData_ = {
        rules: {},
        messages: {},
        states: {},
        associatedFields: {},
        requests: {}
      };

      // 自动验证配置了验证规则的表单域。
      var rules = validationData.rules;
      var states = validationData.states;
      var associatedFields = validationData.associatedFields;
      var requests = validationData.requests;
      var isValidating = false;
      $form
          .on('change.validator', function(e) {
            // 表单控件的值发生改变时触发的验证。
            var name = e.target.name;
            if (rules[name]) {
              validateField($form, name);
            }
            // 如果有关联的表单域且该域（唯一的）的控件已输入值，则同时对该关联表单域进行验证。
            var associatedName = associatedFields[name];
            if (associatedName && $form.elements[associatedName].value) {
              validateField($form, associatedName);
            }
          })
          .on('submit.validator', function(e) {
            // 使表单内的活动元素触发 change 事件。
            // 单独添加一个监听器，以免验证过程发生异常时导致表单被提交。
            var activeElement = document.activeElement;
            if ($form.contains(activeElement)) {
              activeElement.blur();
            }
            e.preventDefault();
          })
          .on('submit.validator', function() {
            // 表单提交时触发的验证。
            if (!isValidating) {
              isValidating = true;
              $form.fire('validate');
              // 对尚未验证的表单域进行验证（true = 通过验证 / false = 未通过验证 / undefined = 验证中 / 无 = 尚未验证）。
              Object.forEach(rules, function(_, name) {
                if (!states.hasOwnProperty(name)) {
                  validateField($form, name);
                }
              });
              // 所有配置了验证规则的表单域都已有其对应的 state，分析验证结果。
              var validatingFields = [];
              var allFieldsAreValid = true;
              Object.forEach(states, function(state, name) {
                if (state === undefined) {
                  validatingFields.push(name);
                } else {
                  allFieldsAreValid = allFieldsAreValid && state;
                }
              });
              if (validatingFields.length) {
                // 有验证仍在进行。
                $form
                    .on('fieldvalidate.validator', function() {
                      $form.fire('validated', {result: false});
                    })
                    .on('fieldvalidated.validator', function(e) {
                      if (validatingFields.contains(e.name)) {
                        validatingFields.remove(e.name);
                        allFieldsAreValid = allFieldsAreValid && !e.errorMessage;
                        if (!validatingFields.length) {
                          $form.fire('validated', {result: allFieldsAreValid});
                        }
                      }
                    });
              } else {
                // 所有验证均已完成。
                $form.fire('validated', {result: allFieldsAreValid});
              }
            }
          })
          .on('reset.validator, validated.validator', function() {
            // 复位表单或验证完毕时，重置临时设定的状态。
            $form.off('fieldvalidate.validator, fieldvalidated.validator');
            isValidating = false;
          })
          .on('reset.validator', function() {
            // 复位表单时清理验证结果，并取消可能正在进行中的远程请求。
            Object.forEach(states, function(_, name) {
              delete states[name];
            });
            Object.forEach(requests, function(request, name) {
              request.off('finish').abort();
              delete request[name];
            });
          });

    }
  });

})();
