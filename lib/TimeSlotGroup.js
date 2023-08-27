'use strict'

var _interopRequireDefault =
  require('@babel/runtime/helpers/interopRequireDefault').default
Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.default = TimeSlotGroup
var _clsx = _interopRequireDefault(require('clsx'))
var _react = _interopRequireDefault(require('react'))
var _BackgroundWrapper = _interopRequireDefault(require('./BackgroundWrapper'))
function TimeSlotGroup(props) {
  var renderSlot = props.renderSlot,
    resource = props.resource,
    group = props.group,
    getters = props.getters,
    _props$components = props.components,
    _props$components2 = _props$components === void 0 ? {} : _props$components,
    _props$components2$ti = _props$components2.timeSlotWrapper,
    Wrapper =
      _props$components2$ti === void 0
        ? _BackgroundWrapper.default
        : _props$components2$ti
  var groupProps = getters ? getters.slotGroupProp(group) : {}
  return /*#__PURE__*/ _react.default.createElement(
    'div',
    Object.assign(
      {
        className: 'rbc-timeslot-group',
      },
      groupProps
    ),
    group.map(function (value, idx) {
      var slotProps = getters ? getters.slotProp(value, resource) : {}
      return /*#__PURE__*/ _react.default.createElement(
        Wrapper,
        {
          key: idx,
          value: value,
          resource: resource,
        },
        /*#__PURE__*/ _react.default.createElement(
          'div',
          Object.assign({}, slotProps, {
            className: (0, _clsx.default)('rbc-time-slot', slotProps.className),
          }),
          renderSlot && renderSlot(value, idx)
        )
      )
    })
  )
}
