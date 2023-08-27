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
var _objectWithoutProperties2 = _interopRequireDefault(
  require('@babel/runtime/helpers/objectWithoutProperties')
)
var _react = _interopRequireDefault(require('react'))
var _clsx = _interopRequireDefault(require('clsx'))
var _excluded = [
  'style',
  'className',
  'event',
  'selected',
  'isAllDay',
  'onSelect',
  'onDoubleClick',
  'onKeyPress',
  'localizer',
  'continuesPrior',
  'continuesAfter',
  'accessors',
  'getters',
  'children',
  'components',
  'slotStart',
  'slotEnd',
]
var EventCell = function EventCell(props) {
  var style = props.style,
    className = props.className,
    event = props.event,
    selected = props.selected,
    isAllDay = props.isAllDay,
    onSelect = props.onSelect,
    _onDoubleClick = props.onDoubleClick,
    _onKeyPress = props.onKeyPress,
    localizer = props.localizer,
    continuesPrior = props.continuesPrior,
    continuesAfter = props.continuesAfter,
    accessors = props.accessors,
    getters = props.getters,
    children = props.children,
    _props$components = props.components,
    Event = _props$components.event,
    EventWrapper = _props$components.eventWrapper,
    slotStart = props.slotStart,
    slotEnd = props.slotEnd,
    otherProps = (0, _objectWithoutProperties2.default)(props, _excluded)
  var title = accessors.title(event)
  var tooltip = accessors.tooltip(event)
  var end = accessors.end(event)
  var start = accessors.start(event)
  var allDay = accessors.allDay(event)
  var showAsAllDay =
    isAllDay ||
    allDay ||
    localizer.diff(start, localizer.ceil(end, 'day'), 'day') > 1
  var userProps = getters.eventProp(event, start, end, selected)
  var content = /*#__PURE__*/ _react.default.createElement(
    'div',
    {
      className: 'rbc-event-content',
      title: tooltip || undefined,
    },
    Event
      ? /*#__PURE__*/ _react.default.createElement(Event, {
          event: event,
          continuesPrior: continuesPrior,
          continuesAfter: continuesAfter,
          title: title,
          isAllDay: allDay,
          localizer: localizer,
          slotStart: slotStart,
          slotEnd: slotEnd,
        })
      : title
  )
  return /*#__PURE__*/ _react.default.createElement(
    EventWrapper,
    Object.assign({}, props, {
      type: 'date',
    }),
    /*#__PURE__*/ _react.default.createElement(
      'div',
      Object.assign({}, otherProps, {
        tabIndex: 0,
        style: (0, _objectSpread2.default)(
          (0, _objectSpread2.default)({}, userProps.style),
          style
        ),
        className: (0, _clsx.default)(
          'rbc-event',
          className,
          userProps.className,
          {
            'rbc-selected': selected,
            'rbc-event-allday': showAsAllDay,
            'rbc-event-continues-prior': continuesPrior,
            'rbc-event-continues-after': continuesAfter,
          }
        ),
        onClick: function onClick(e) {
          return onSelect && onSelect(event, e)
        },
        onDoubleClick: function onDoubleClick(e) {
          return _onDoubleClick && _onDoubleClick(event, e)
        },
        onKeyPress: function onKeyPress(e) {
          return _onKeyPress && _onKeyPress(event, e)
        },
      }),
      typeof children === 'function' ? children(content) : content
    )
  )
}
var _default = EventCell
exports.default = _default
