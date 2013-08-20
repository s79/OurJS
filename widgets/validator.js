/**
 * @fileOverview Widget - 表单验证器
 * @author sundongguo@gmail.com
 * @version 20130812
 */

(function() {
//==================================================[Widget - 表单验证器]
//--------------------------------------------------[states]
  var NOT_VERIFIED = 0;
  var VERIFYING = 1;
  var VALID = 2;
  var INVALID = 3;

//--------------------------------------------------[validateField]
  var validateField = function($form, name) {
    // 获取指定表单域的值及其验证数据。
    var value = $form.getFieldValue(name);
    var data = $form.validationData[name];
    var local = data.local;
    var remote = data.remote;

    // 如果上一次的服务端验证没有完成则取消之（此处状态若为验证中则必有 request 对象存在）。
    if (data.state === VERIFYING) {
      remote.request.abort();
    }

    // 开始验证表单域。
    data.state = VERIFYING;
    $form.fire('fieldvalidate', {name: name, value: value});

    var errorMessage = '';
    if (local) {
      errorMessage = local.call($form, value);
    }
    if (!errorMessage && remote) {
      // 需要服务端验证，在验证结束后异步触发 fieldvalidated 事件。
      remote.request
          .on('abort.validatefield, timeout.validatefield', function(e) {
            data.state = INVALID;
            $form.fire('fieldvalidated', {name: name, value: value, passed: false, errorMessage: e.type.toUpperCase()});
          })
          .on('complete.validatefield', function(e) {
            var errorMessage = remote.getResult.call($form, e);
            var passed = !errorMessage;
            data.state = passed ? VALID : INVALID;
            $form.fire('fieldvalidated', {name: name, value: value, passed: passed, errorMessage: errorMessage});
          })
          .on('finish.validatefield', function() {
            this.off('abort.validatefield, timeout.validatefield, complete.validatefield, finish.validatefield');
          })
          .send(remote.getData(value));
    } else {
      // 不需要服务端验证，同步触发 fieldvalidated 事件。
      var passed = !errorMessage;
      data.state = passed ? VALID : INVALID;
      $form.fire('fieldvalidated', {name: name, value: value, passed: passed, errorMessage: errorMessage});
    }
  };

//--------------------------------------------------[Validator]
  /**
   * “表单验证器”可以在表单提交的时候根据配置的“验证规则”对表单域的值（而不是某一个控件的值）进行验证，并能在不同的状态下显示相应的提示信息。
   * @启用方式
   *   为一个 FORM 元素添加 'widget-validator' 类，即可使该元素成为“表单验证器”。
   * @结构约定
   *   <form method="get" action="." class="widget-validator">
   *     <p class="state" data-for="account">
   *       <input name="account" type="text" value="">
   *       <span class="message" data-for="account"></span>
   *     </p>
   *     <p class="state" data-for="password">
   *       <input name="password" type="password">
   *       <span class="message" data-for="password"></span>
   *     </p>
   *   </form>
   * * “表单验证器”的后代元素中，类名包含 'state' 的为“状态指示器”，类名包含 'message' 的为“提示信息容器”。这些元素还应指定 data-for="<var>name</var>" 属性，<var>name</var> 为这些元素对应的表单域的名称。
   * * 一个表单域最多只能有一个“状态指示器”和一个“提示信息容器”（如果指定了多个则只有第一个生效），并且它们必须在对应的表单域“验证规则”被解析时可访问。
   * @默认样式
   * @可配置项
   * @新增行为
   * * 如果一个表单域配置了“验证规则”，当其中包含的任何控件的值被用户改变时，都将对该表单域进行验证并触发 fieldvalidate 事件，验证结束后会触发 fieldvalidated 事件。
   *   如果一个表单域未能通过验证，提示信息会被注入为该表单域指定的“提示信息容器”中。
   *   要手动验证某一个表单域，触发其中任一控件的 change 事件即可。
   * * 当某个表单域的输入或验证状态发生变化时，“状态指示器”也会被加入对应的类名，类名可能是 input（输入中）、validating（验证中）、valid （通过验证）或 invalid（未通过验证）的组合，可以利用此特性在各种状态下显示不同的内容。
   * * 该表单的 submit 事件的默认行为将被阻止，当该表单触发 submit 事件时，会对所有已配置的“验证规则”涉及到的、且尚未验证的表单域进行验证，并触发 validate 事件，验证结束后会触发 validated 事件。
   *   如果没有需要服务端验证的表单域，validated 事件将同步触发，否则 validated 事件将在所有的服务端验证结束后异步触发。
   *   如果用户在验证开始后、可能存在的服务端验证尚未全部结束之前修改了任一正在验证中的控件的值，则会立即取消当前的服务端验证，并触发 validated 事件，本次验证按失败处理。
   * * 当该表单触发 reset 事件时，当前的验证状态和所有已显示的提示信息也会随之重置。
   * @新增属性
   * @新增方法
   *   addValidationRules
   *     添加“验证规则”。
   *     这些“验证规则”将在下次被使用的时候生效。
   *     参数：
   *       {Object} rules 要验证的表单域的名称及规则，格式为 <dfn>{<var>name</var>: <var>ruleSet</var>, ...}</dfn>。
   *       属性名 <var>name</var> 为要验证的表单域的名称。
   *       属性值 <var>ruleSet</var> 为定义“验证规则”的对象，该对象可以指定的规则有以下三个，它们都是可选的：
   *       <table>
   *         <thead>
   *         <tr><th>规则名称</th><th>值类型</th><th>详细描述</th></tr>
   *         </thead>
   *         <tbody>
   *         <tr><td><dfn>related</dfn></td><td>Array</td><td>在验证本表单域的值时，也会对指定的关联表单域（可以为多个）进行验证。</td></tr>
   *         <tr><td><dfn>local</dfn></td><td>Function</td><td>指定对该表单域的值进行客户端验证时使用的函数。该函数被调用时会传入该表单域的值，其 this 的值为本表单元素，其返回值应为一个“提示信息”字符串，若该字符串为空则表示验证通过。</td></tr>
   *         <tr><td><dfn>remote</dfn></td><td>Object</td><td>指定对该表单域的值进行服务端验证时使用的配置。该对象必须包含三个属性：<dfn>request</dfn>、<dfn>getData</dfn> 和 <dfn>getResult</dfn>。<br><dfn>request</dfn> 为 Request 的实例（细节请参考 Request 的说明文档）。<br><dfn>getData</dfn> 是获取待验证的数据的函数，该函数被调用时会传入该表单域的值，其 this 的值为本表单元素，其返回值将作为 <dfn>request</dfn> 对象的 send 方法的参数使用。<br><dfn>getResult</dfn> 是获取验证结果的函数，该函数被调用时传入的参数与 <dfn>request</dfn> 的 complete 事件监听器被调用时传入的参数一致，其 this 的值为本表单元素，其返回值应为一个“提示信息”字符串，若该字符串为空则表示验证通过。</td></tr>
   *         </tbody>
   *       </table>
   *     返回值：
   *       {Element} 本元素。
   *   removeValidationRules
   *     删除“验证规则”。
   *     删除某个表单域的“验证规则”时，该表单域已显示的提示信息也将被清除。
   *     参数：
   *       {Array} names 包含要删除“验证规则”的表单域的名称的数组。
   *     返回值：
   *       {Element} 本元素。
   * @新增事件
   *   fieldvalidate
   *     当开始验证一个表单域时触发。
   *     属性：
   *       {string} name 验证的表单域的名称。
   *       {string|Array} value 验证的表单域的值。
   *   fieldvalidated
   *     在一个表单域验证结束后触发。
   *     属性：
   *       {string} name 验证的表单域的名称。
   *       {string|Array} value 验证的表单域的值。
   *       {boolean} passed 本表单域的值是否已通过验证。
   *       {string} errorMessage “提示信息”字符串，若验证通过则为空字符串。
   *   validate
   *     当表单验证开始时（即表单的 submit 事件发生时）触发。
   *   validated
   *     在表单验证结束后触发。
   *     属性：
   *       {boolean} passed 本表单所有已配置验证规则的域的值是否已全部通过验证。
   *       {Array} invalidFields 尚未通过验证的字段，若验证通过则为空数组。
   */

  Widget.register({
    type: 'validator',
    selector: 'form.widget-validator',
    methods: {
      addValidationRules: function(rules) {
        var $validator = this;
        var validationData = $validator.validationData;
        // 删除已存在的“验证规则”。
        $validator.removeValidationRules(Object.keys(rules));
        // 添加新的“验证规则”。
        Object.forEach(rules, function(rule, name) {
          Object.mixin(validationData[name] = {state: NOT_VERIFIED}, rule, {whiteList: ['related', 'local', 'remote']});
        });
        // 重新查找 DOM 树，生成新的“状态指示器”列表和“提示信息容器”列表。
        $validator.findAll('.state').forEach(function($stateIndicator) {
          var name = $stateIndicator.getData('for');
          if (validationData.hasOwnProperty(name) && !validationData[name].stateIndicator) {
            validationData[name].stateIndicator = $stateIndicator;
          }
        });
        $validator.findAll('.message').forEach(function($messageContainer) {
          var name = $messageContainer.getData('for');
          if (validationData.hasOwnProperty(name) && !validationData[name].messageContainer) {
            validationData[name].messageContainer = $messageContainer;
          }
        });
        return $validator;
      },
      removeValidationRules: function(names) {
        var $validator = this;
        var validationData = $validator.validationData;
        // 删除“验证规则”。
        names.forEach(function(name) {
          if (validationData.hasOwnProperty(name)) {
            var data = validationData[name];
            if (data.state === VERIFYING) {
              data.remote.request.abort();
            }
            if (data.stateIndicator) {
              data.stateIndicator.removeClass('input, validating, valid, invalid');
            }
            if (data.messageContainer) {
              data.messageContainer.innerHTML = '';
            }
            delete validationData[name];
          }
        });
        return $validator;
      }
    },
    initialize: function() {
      var $validator = this;

      // 保存验证数据。
      var validationData = $validator.validationData = {};

      // 添加新行为。
      var isValidating = false;
      $validator
          .on('focusin.validator, focusout.validator', function(e) {
            // 表单控件获取或失去焦点时更改“状态指示器”的类名。
            var name = e.target.name;
            if (validationData.hasOwnProperty(name)) {
              var $stateIndicator = validationData[name].stateIndicator;
              if ($stateIndicator) {
                // 以下 submit.validator 事件监听器中使用了延时，此处也应使用，以避免提示信息闪烁。
                setTimeout(function() {
                  $stateIndicator[e.type === 'focusin' ? 'addClass' : 'removeClass']('input');
                }, 0);
              }
            }
          })
          .on('change.validator', function(e) {
            // 表单控件的值发生改变时触发的验证。
            var name = e.target.name;
            if (validationData.hasOwnProperty(name)) {
              // 对本表单域进行验证。
              validateField($validator, name);
              // 如果有关联的表单域，则同时对该关联表单域进行验证。
              var relatedFields = validationData[name].related;
              if (relatedFields) {
                relatedFields.forEach(function(relatedFieldName) {
                  validateField($validator, relatedFieldName);
                });
              }
            }
          })
          .on('submit.validator', function(e) {
            // 使表单内的活动控件触发 change 事件。单独添加一个监听器，以免验证过程发生异常时导致表单被提交。
            var activeElement = document.activeElement;
            if ($validator.contains(activeElement)) {
              activeElement.blur();
            }
            e.preventDefault();
          })
          .on('submit.validator', function() {
            // 加入延时来解决 IE6 在文本框内按下回车会先触发表单的 submit 事件后触发文本框的 change 事件的问题。
            setTimeout(function() {
              // 表单提交时触发的验证。
              if (!isValidating) {
                isValidating = true;
                $validator.fire('validate');
                // 对尚未验证的表单域进行验证。
                Object.forEach(validationData, function(data, name) {
                  if (data.state === NOT_VERIFIED) {
                    validateField($validator, name);
                  }
                });
                // 分析验证状态。
                var verifyingFields = [];
                var invalidFields = [];
                var allFieldsAreValid = true;
                Object.forEach(validationData, function(data, name) {
                  switch (data.state) {
                    case VERIFYING:
                      verifyingFields.push(name);
                      break;
                    case INVALID:
                      invalidFields.push(name);
                      allFieldsAreValid = false;
                      break;
                  }
                });
                if (verifyingFields.length) {
                  // 有验证仍在进行。
                  $validator
                      .on('fieldvalidate.checkRemote', function(e) {
                        var name = e.name;
                        if (!invalidFields.contains(name)) {
                          invalidFields.push(name);
                        }
                        $validator.fire('validated', {passed: false, invalidFields: invalidFields});
                      })
                      .on('fieldvalidated.checkRemote', function(e) {
                        var name = e.name;
                        var passed = e.passed;
                        if (verifyingFields.contains(name)) {
                          verifyingFields.remove(name);
                          if (passed === false) {
                            invalidFields.push(name);
                          }
                          allFieldsAreValid = allFieldsAreValid && passed;
                          if (!verifyingFields.length) {
                            $validator.fire('validated', {passed: allFieldsAreValid, invalidFields: invalidFields});
                          }
                        }
                      });
                } else {
                  // 所有验证均已完成。
                  $validator.fire('validated', {passed: allFieldsAreValid, invalidFields: invalidFields});
                }
              }
            }, 0);
          })
          .on('reset.validator, validated.validator', function() {
            // 复位表单或验证完毕时，重置临时设定的状态。
            $validator.off('fieldvalidate.checkRemote, fieldvalidated.checkRemote');
            isValidating = false;
          })
          .on('reset.validator', function() {
            // 复位表单时取消可能正在进行中的远程请求，复位各表单域的验证状态，并清空提示信息。
            Object.forEach(validationData, function(data) {
              if (data.state === VERIFYING) {
                data.remote.request.abort();
              }
              data.state = NOT_VERIFIED;
              if (data.stateIndicator) {
                data.stateIndicator.removeClass('validating, valid, invalid');
              }
              if (data.messageContainer) {
                data.messageContainer.innerHTML = '';
              }
            });
          })
          .on('fieldvalidate.validator, fieldvalidated.validator', function(e) {
            // 表单域开始验证及验证完毕时更改提示信息。
            var name = e.name;
            if (validationData.hasOwnProperty(name)) {
              var data = validationData[name];
              var $stateIndicator = data.stateIndicator;
              var $messageContainer = data.messageContainer;
              if ($stateIndicator) {
                $stateIndicator.removeClass('validating, valid, invalid').addClass(e.type === 'fieldvalidate' ? 'validating' : (e.passed ? 'valid' : 'invalid'));
              }
              if ($messageContainer && e.type === 'fieldvalidated') {
                $messageContainer.innerHTML = e.errorMessage;
              }
            }
          });

    }
  });

})();
