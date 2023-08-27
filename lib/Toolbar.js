'use strict'

var _interopRequireDefault =
  require('@babel/runtime/helpers/interopRequireDefault').default
Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.default = void 0
var _react = _interopRequireDefault(require('react'))
var _clsx = _interopRequireDefault(require('clsx'))
var _constants = require('./utils/constants')
var Toolbar = function Toolbar(_ref) {
  var messages = _ref.localizer.messages,
    label = _ref.label,
    view = _ref.view,
    views = _ref.views,
    onNavigate = _ref.onNavigate,
    onView = _ref.onView
  var handleNavigate = function handleNavigate(action) {
    onNavigate(action)
  }
  var handleView = function handleView(viewName) {
    onView(viewName)
  }
  var viewNamesGroup = function viewNamesGroup(messages) {
    if (views.length > 1) {
      return views.map(function (name) {
        return /*#__PURE__*/ _react.default.createElement(
          'button',
          {
            type: 'button',
            key: name,
            className: (0, _clsx.default)({
              'rbc-active': view === name,
            }),
            onClick: function onClick() {
              return handleView(name)
            },
          },
          messages[name]
        )
      })
    }
  }
  return /*#__PURE__*/ _react.default.createElement(
    'div',
    {
      className: 'rbc-toolbar',
    },
    /*#__PURE__*/ _react.default.createElement(
      'span',
      {
        className: 'rbc-btn-group',
      },
      /*#__PURE__*/ _react.default.createElement(
        'button',
        {
          type: 'button',
          onClick: function onClick() {
            return handleNavigate(_constants.navigate.TODAY)
          },
        },
        messages.today
      ),
      /*#__PURE__*/ _react.default.createElement(
        'button',
        {
          type: 'button',
          onClick: function onClick() {
            return handleNavigate(_constants.navigate.PREVIOUS)
          },
        },
        messages.previous
      ),
      /*#__PURE__*/ _react.default.createElement(
        'button',
        {
          type: 'button',
          onClick: function onClick() {
            return handleNavigate(_constants.navigate.NEXT)
          },
        },
        messages.next
      )
    ),
    /*#__PURE__*/ _react.default.createElement(
      'span',
      {
        className: 'rbc-toolbar-label',
      },
      label
    ),
    /*#__PURE__*/ _react.default.createElement(
      'span',
      {
        className: 'rbc-btn-group',
      },
      viewNamesGroup(messages)
    )
  )
}
var _default = Toolbar
exports.default = _default
