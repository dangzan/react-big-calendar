'use strict'

var _interopRequireDefault =
  require('@babel/runtime/helpers/interopRequireDefault').default
Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.default = void 0
var _slicedToArray2 = _interopRequireDefault(
  require('@babel/runtime/helpers/slicedToArray')
)
var _clsx = _interopRequireDefault(require('clsx'))
var _scrollbarSize = _interopRequireDefault(
  require('dom-helpers/scrollbarSize')
)
var _react = _interopRequireDefault(require('react'))
var _DateContentRow = _interopRequireDefault(require('./DateContentRow'))
var _Header = _interopRequireDefault(require('./Header'))
var _ResourceHeader = _interopRequireDefault(require('./ResourceHeader'))
var _helpers = require('./utils/helpers')
var TimeGridHeader = function TimeGridHeader(props) {
  var handleHeaderClick = function handleHeaderClick(date, view, e) {
    e.preventDefault()
    ;(0, _helpers.notify)(props.onDrillDown, [date, view])
  }
  function renderHeaderCells(range) {
    var localizer = props.localizer,
      getDrilldownView = props.getDrilldownView,
      getNow = props.getNow,
      dayProp = props.getters.dayProp,
      _props$components$hea = props.components.header,
      HeaderComponent =
        _props$components$hea === void 0
          ? _Header.default
          : _props$components$hea
    var today = getNow()
    return range.map(function (date, i) {
      var drilldownView = getDrilldownView(date)
      var label = localizer.format(date, 'dayFormat')
      var _dayProp = dayProp(date),
        className = _dayProp.className,
        style = _dayProp.style
      var header = /*#__PURE__*/ _react.default.createElement(HeaderComponent, {
        date: date,
        label: label,
        localizer: localizer,
      })
      return /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          key: i,
          style: style,
          className: (0, _clsx.default)(
            'rbc-header',
            className,
            localizer.isSameDate(date, today) && 'rbc-today'
          ),
        },
        drilldownView
          ? /*#__PURE__*/ _react.default.createElement(
              'button',
              {
                type: 'button',
                className: 'rbc-button-link',
                onClick: function onClick(e) {
                  return handleHeaderClick(date, drilldownView, e)
                },
              },
              header
            )
          : /*#__PURE__*/ _react.default.createElement('span', null, header)
      )
    })
  }
  // function renderRow(resource) {
  //   let {
  //     events,
  //     rtl,
  //     selectable,
  //     getNow,
  //     range,
  //     getters,
  //     localizer,
  //     accessors,
  //     components,
  //     resizable,
  //   } = props

  //   const resourceId = accessors.resourceId(resource)
  //   let eventsToDisplay = resource
  //     ? events.filter((event) => accessors.resource(event) === resourceId)
  //     : events

  //   return (
  //     <DateContentRow
  //       isAllDay
  //       rtl={rtl}
  //       getNow={getNow}
  //       minRows={2}
  //       // Add +1 to include showMore button row in the row limit
  //       maxRows={props.allDayMaxRows + 1}
  //       range={range}
  //       events={eventsToDisplay}
  //       resourceId={resourceId}
  //       className="rbc-allday-cell"
  //       selectable={selectable}
  //       selected={props.selected}
  //       components={components}
  //       accessors={accessors}
  //       getters={getters}
  //       localizer={localizer}
  //       onSelect={props.onSelectEvent}
  //       onShowMore={props.onShowMore}
  //       onDoubleClick={props.onDoubleClickEvent}
  //       onKeyPress={props.onKeyPressEvent}
  //       onSelectSlot={props.onSelectSlot}
  //       longPressThreshold={props.longPressThreshold}
  //       resizable={resizable}
  //     />
  //   )
  // }

  var width = props.width,
    rtl = props.rtl,
    resources = props.resources,
    range = props.range,
    events = props.events,
    getNow = props.getNow,
    accessors = props.accessors,
    selectable = props.selectable,
    components = props.components,
    getters = props.getters,
    scrollRef = props.scrollRef,
    localizer = props.localizer,
    isOverflowing = props.isOverflowing,
    _props$components = props.components,
    TimeGutterHeader = _props$components.timeGutterHeader,
    _props$components$res = _props$components.resourceHeader,
    ResourceHeaderComponent =
      _props$components$res === void 0
        ? _ResourceHeader.default
        : _props$components$res,
    resizable = props.resizable
  var style = {}
  if (isOverflowing) {
    style[rtl ? 'marginLeft' : 'marginRight'] = ''.concat(
      (0, _scrollbarSize.default)() - 1,
      'px'
    )
  }
  var groupedEvents = resources.groupEvents(events)
  return /*#__PURE__*/ _react.default.createElement(
    'div',
    {
      style: style,
      ref: scrollRef,
      className: (0, _clsx.default)(
        'rbc-time-header',
        isOverflowing && 'rbc-overflowing'
      ),
    },
    /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        className: 'rbc-label rbc-time-header-gutter',
        style: {
          width: width,
          minWidth: width,
          maxWidth: width,
        },
      },
      TimeGutterHeader &&
        /*#__PURE__*/ _react.default.createElement(TimeGutterHeader, null)
    ),
    resources.map(function (_ref, idx) {
      var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
        id = _ref2[0],
        resource = _ref2[1]
      return /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          className: 'rbc-time-header-content',
          key: id || idx,
        },
        resource &&
          /*#__PURE__*/ _react.default.createElement(
            'div',
            {
              className: 'rbc-row rbc-row-resource',
              key: 'resource_'.concat(idx),
            },
            /*#__PURE__*/ _react.default.createElement(
              'div',
              {
                className: 'rbc-header',
              },
              /*#__PURE__*/ _react.default.createElement(
                ResourceHeaderComponent,
                {
                  index: idx,
                  label: accessors.resourceTitle(resource),
                  resource: resource,
                }
              )
            )
          ),
        /*#__PURE__*/ _react.default.createElement(
          'div',
          {
            className: 'rbc-row rbc-time-header-cell'.concat(
              range.length <= 1 ? ' rbc-time-header-cell-single-day' : ''
            ),
          },
          renderHeaderCells(range)
        ),
        /*#__PURE__*/ _react.default.createElement(_DateContentRow.default, {
          isAllDay: true,
          rtl: rtl,
          getNow: getNow,
          minRows: 2,
          // Add +1 to include showMore button row in the row limit
          maxRows: props.allDayMaxRows + 1,
          range: range,
          events: groupedEvents.get(id) || [],
          resourceId: resource && id,
          className: 'rbc-allday-cell',
          selectable: selectable,
          selected: props.selected,
          components: components,
          accessors: accessors,
          getters: getters,
          localizer: localizer,
          onSelect: props.onSelectEvent,
          onShowMore: props.onShowMore,
          onDoubleClick: props.onDoubleClickEvent,
          onKeyPress: props.onKeyPressEvent,
          onSelectSlot: props.onSelectSlot,
          longPressThreshold: props.longPressThreshold,
          resizable: resizable,
        })
      )
    })
  )
}
var _default = TimeGridHeader
exports.default = _default
