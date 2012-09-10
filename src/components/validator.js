/**
 * @fileOverview 组件 - 表单验证器。
 * @author sundongguo@gmail.com
 * @version 20120723
 */

execute(function($) {
//==================================================[Validator]
  /*
   * 说明：
   *   每个表单域包含的控件都会在发生 change 事件时验证其所属域。从表单域的角度看，以下将这种情况称为“主动验证”。
   *   当调用 validator.validate 方法时，会对所有尚未验证的域进行验证。以下将这种情况称为“被动验证”。
   *   无论是“主动验证”还是“被动验证”，验证的结果 status 和 statusText 都会被保存到 validator.resultSet 中。若其中 status 为 NaN 表示正在验证中，为 0 表示验证通过，其他值表示验证未通过。
   *   statusText 仅在需要显示详细错误信息有用，通常其值在后续处理是可以忽略的，只需要判断 status 是否为 0 即可。
   *
   * 执行 validator 方法时的流程：
   *   对可能存在的尚未验证的域进行“被动验证”。
   *   检查 validator.resultSet。
   *   如果有需要服务端验证的，触发 validating 事件，并在所有的服务端验证结束时，触发 validated(true/false) 事件。
   *   否则，根据检查结果触发 validated(true/false) 事件。
   *   在 validating 事件触发后，等待的所有服务端验证尚未结束前，如果任一控件触发了“主动验证”，则同时触发 validated(false)，本次验证按失败处理。
   */

  // 验证值是否符合规则，并保存状态。
  var validate = function(validator, name) {
    var $form = validator.element;
    var rules = validator.validationRules[name];
    var value = $form.getFieldValue(name);
    var resultSet = validator.resultSet;
    var result = resultSet[name] = {status: NaN, statusText: '验证中'};
    validator.fire('fieldvalidate', {name: name, value: value});
    if (rules.required && value.length === 0) {
      result.status = 1;
      result.statusText = '本项为必选项';
    }
    if (isNaN(result.status) && rules.equals && value !== $form.getFieldValue(rules.equals)) {
      result.status = 2;
      result.statusText = '两次输入的值不一致';
    }
    if (isNaN(result.status) && Number.isInteger(rules.minLength) && value.length < rules.minLength) {
      result.status = 3;
      result.statusText = '最小长度或最少数目小于限定值';
    }
    if (isNaN(result.status) && Number.isInteger(rules.maxLength) && value.length > rules.maxLength) {
      result.status = 4;
      result.statusText = '最大长度或最多数目大于限定值';
    }
    if (isNaN(result.status) && rules.formatVerify) {
      var formatVerifyResult = rules.formatVerify.call($form, value);
      result.status = formatVerifyResult.status;
      result.statusText = formatVerifyResult.statusText;
    }
    var serverSideVerify = rules.serverSideVerify;
    if (isNaN(result.status) && serverSideVerify) {
      if (rules.lastRequest) {
        rules.lastRequest.off('finish').abort();
      }
      rules.lastRequest = new Request(serverSideVerify.url, serverSideVerify.config)
          .on('start', function() {
            validator.fire('fieldvalidating', {name: name, value: value});
          })
          .on('finish', function(e) {
            delete rules.lastRequest;
            result.status = e.status;
            result.statusText = e.statusText;
            validator.fire('fieldvalidated', {name: name, value: value, status: result.status, statusText: result.statusText});
          })
          .send(value);
    } else {
      if (isNaN(result.status)) {
        result.status = 0;
        result.statusText = '验证通过';
      }
      validator.fire('fieldvalidated', {name: name, value: value, status: result.status, statusText: result.statusText});
    }
  };

//--------------------------------------------------[Validator Constructor]
  /**
   * 表单验证器。
   * @name Validator
   * @constructor
   * @param {Element} element 要验证的表单元素。
   * @param {Object} validationRules 要验证的表单域及规则，格式为 {name: rules, ...}。
   *   name 为要验证的表单域的名称，即本表单元素内对应的 INPUT/SELECT/TEXTAREA 元素的 name 属性值。
   *   rules 是一个对象，其<strong>可选的</strong>各个属性的要求和含义如下：
   *   {boolean} required 必填或必选项应设置为 true，否则应设置为 false 或省略。
   *   {string} equals 指定相关表单域的名称，限制该表单域的值与相关表单域的值一致。仅应在这两个表单域均只包含一个文本控件时指定，不能指定本表单域的名字。若无此类限制可省略此项。
   *   {number} minLength 当该表单域只包含一个文本控件时，限定输入文本的最小长度，否则限定选择项的最少数目。若无此类限制可省略此项。
   *   {number} maxLength 当该表单域只包含一个文本控件时，限定输入文本的最大长度，否则限定选择项的最多数目。若无此类限制可省略此项。
   *   {Function} formatVerify 用来对该表单域的值进行格式验证的函数，该函数被调用时传入该表单域的值，其 this 的值为本表单元素，返回值应为一个具备 status 和 statusText 属性的对象，以表示验证结果。若无此类限制可省略此项。
   *   {Object} serverSideVerify 指定对该表单域的值进行服务端验证，包含两个属性：url 和 config，详细内容请参考 Request 组件。注意利用 config.requestParser 和 config.responseParser 对请求和响应数据进行预处理。该表单域的值将被作为参数传入 send 方法，finish 事件对象应具备 status 和 statusText 属性，以表示验证结果。若不需要服务端验证可省略此项。
   *   进行验证的步骤为 required - equals - min/maxLength - formatVerify - serverSideVerify。
   * @fires fieldvalidate
   *   {string} name 本次验证的表单域的名称。
   *   {string|Array} value 本次验证的表单域的值。
   *   验证每个要验证的表单域开始时触发。
   * @fires fieldvalidating
   *   {string} name 本次验证的表单域的名称。
   *   {string|Array} value 本次验证的表单域的值。
   *   当一个表单域开始服务端异步验证时触发。
   * @fires fieldvalidated
   *   {string} name 本次验证的表单域的名称。
   *   {string|Array} value 本次验证的表单域的值。
   *   {number} status 状态码。
   *   {string} statusText 状态描述。
   *   验证每个要验证的表单域结束后触发。status 和 statusText 的预置值见下表：
   *   <table>
   *     <tr><th>status</th><th>statusText</th></tr>
   *     <tr><td>NaN</td><td>验证中</td></tr>
   *     <tr><td>0</td><td>验证通过</td></tr>
   *     <tr><td>1</td><td>本项为必选项</td></tr>
   *     <tr><td>2</td><td>两次输入的值不一致</td></tr>
   *     <tr><td>3</td><td>最小长度或最少数目小于限定值</td></tr>
   *     <tr><td>4</td><td>最大长度或最多数目大于限定值</td></tr>
   *   </table>
   *   可以在格式验证函数或服务端验证的结果解析函数中自定义 status 和 statusText，注意当 status 为 0 时即代表验证通过。
   * @fires validate
   *   调用 validate 方法时触发。
   * @fires validating
   *   调用 validate 方法后，某个表单域开始服务端异步验证时触发。即便有多个表单域都开始服务端异步验证，也仅会触发一次。
   * @fires validated
   *   {boolean} result 验证结果，仅当所有已配置的规则均验证通过时为 true，否则为 false。
   *   对所有已配置的规则验证结束后触发。
   */
  var Validator = new Component(function(element, validationRules) {
    var validator = this;

    // 保存属性。
    var $form = validator.element = $(element);
    validator.validationRules = validationRules;
    validator.resultSet = {};
    validator.isValidating = false;

    // 当验证结束时恢复默认状态。
    validator.on('validated.validation', function() {
      this.off('fieldvalidated.validate, fieldvalidate.validate').isValidating = false;
    });

    // 为控件绑定事件。
    Object.forEach(validationRules, function(rules, name) {
      Array.from($form.elements[name]).forEach(function(control) {
        var $control = $(control);
        $control.on('change.validation', function() {
          validate(validator, name);
        });
        // 如果设置了 equals 规则且已输入值，则在目标控件的值改变时重新检测本控件的值。
        var relatedName = rules.equals;
        if (relatedName) {
          $($form.elements[relatedName]).on('change.validation', function() {
            if ($control.value) {
              $control.fire('change');
            }
          });
        }
      });
    });

  });

//--------------------------------------------------[Validator.prototype.validate]
  /**
   * 对配置的所有规则进行验证。
   * @name Validator.prototype.validate
   * @function
   * @returns {Object} Validator 对象。
   */
  Validator.prototype.validate = function() {
    var validator = this;
    if (!validator.isValidating) {
      validator.isValidating = true;
      validator.fire('validate');
      // 对尚未验证的域进行验证。
      Object.forEach(validator.validationRules, function(rules, name) {
        if (!validator.resultSet.hasOwnProperty(name)) {
          validate(validator, name);
        }
      });
      // 所有域的验证结果均已收集完毕，开始分析。
      var validatingFields = ' ';
      var allValidationsPassed = true;
      Object.forEach(validator.resultSet, function(result, name) {
        if (isNaN(result.status)) {
          validatingFields += name + ' ';
        } else {
          allValidationsPassed = allValidationsPassed && result.status === 0;
        }
      });
      // 处理结果。
      if (validatingFields !== ' ') {
        // 有验证仍在进行。
        validator
            .on('fieldvalidate.validate', function() {
              validator.fire('validated', {result: false});
            })
            .on('fieldvalidated.validate', function(e) {
              if (validatingFields.contains(' ' + e.name + ' ')) {
                validatingFields = validatingFields.replace(' ' + e.name + ' ', ' ');
                allValidationsPassed = allValidationsPassed && e.status === 0;
                if (validatingFields === ' ') {
                  validator.fire('validated', {result: allValidationsPassed});
                }
              }
            })
            .fire('validating');
      } else {
        // 所有验证均已完成。
        validator.fire('validated', {result: allValidationsPassed});
      }
    }
    return validator;
  };

//--------------------------------------------------[Validator]
  window.Validator = Validator;

});
