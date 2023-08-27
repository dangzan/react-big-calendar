'use strict'

var _interopRequireDefault =
  require('@babel/runtime/helpers/interopRequireDefault').default
Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.default = void 0
var _objectSpread2 = _interopRequireDefault(
  require('@babel/runtime/helpers/objectSpread2')
)
var _clsx = _interopRequireDefault(require('clsx'))
var _react = _interopRequireDefault(require('react'))
var _EventRowMixin = _interopRequireDefault(require('./EventRowMixin'))
var EventRow = function EventRow(props) {
  var segments = props.segments,
    slots = props.slotMetrics.slots,
    className = props.className
  var lastEnd = 1
  return /*#__PURE__*/ _react.default.createElement(
    'div',
    {
      className: (0, _clsx.default)(className, 'rbc-row'),
    },
    segments.reduce(function (row, _ref, li) {
      var event = _ref.event,
        left = _ref.left,
        right = _ref.right,
        span = _ref.span
      var key = '_lvl_' + li
      var gap = left - lastEnd
      var content = _EventRowMixin.default.renderEvent(props, event)
      if (gap)
        row.push(
          _EventRowMixin.default.renderSpan(slots, gap, ''.concat(key, '_gap'))
        )
      row.push(_EventRowMixin.default.renderSpan(slots, span, key, content))
      lastEnd = right + 1
      return row
    }, [])
  )
}
EventRow.defaultProps = (0, _objectSpread2.default)(
  {},
  _EventRowMixin.default.defaultProps
)
var _default = EventRow
exports.default = _default
