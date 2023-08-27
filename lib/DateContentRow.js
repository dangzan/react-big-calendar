'use strict'

var _interopRequireDefault =
  require('@babel/runtime/helpers/interopRequireDefault').default
var _interopRequireWildcard =
  require('@babel/runtime/helpers/interopRequireWildcard').default
Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.default = void 0
var _react = _interopRequireWildcard(require('react'))
var _clsx = _interopRequireDefault(require('clsx'))
var _querySelectorAll = _interopRequireDefault(
  require('dom-helpers/querySelectorAll')
)
var _height = _interopRequireDefault(require('dom-helpers/height'))
var _BackgroundCells = _interopRequireDefault(require('./BackgroundCells'))
var _EventRow = _interopRequireDefault(require('./EventRow'))
var _EventEndingRow = _interopRequireDefault(require('./EventEndingRow'))
var _NoopWrapper = _interopRequireDefault(require('./NoopWrapper'))
var _ScrollableWeekWrapper = _interopRequireDefault(
  require('./ScrollableWeekWrapper')
)
var DateSlotMetrics = _interopRequireWildcard(
  require('./utils/DateSlotMetrics')
)
var DateContentRow = /*#__PURE__*/ _react.default.forwardRef(function (
  props,
  ref
) {
  var accessors = props.accessors,
    className = props.className,
    components = props.components,
    container = props.container,
    date = props.date,
    getNow = props.getNow,
    getters = props.getters,
    isAllDay = props.isAllDay,
    localizer = props.localizer,
    longPressThreshold = props.longPressThreshold,
    onSelectSlot = props.onSelectSlot,
    onSelect = props.onSelect,
    onSelectEnd = props.onSelectEnd,
    onSelectStart = props.onSelectStart,
    onShowMore = props.onShowMore,
    onDoubleClick = props.onDoubleClick,
    onKeyPress = props.onKeyPress,
    range = props.range,
    renderForMeasure = props.renderForMeasure,
    renderHeader = props.renderHeader,
    resizable = props.resizable,
    resourceId = props.resourceId,
    rtl = props.rtl,
    selectable = props.selectable,
    selected = props.selected,
    showAllEvents = props.showAllEvents
  var containerRef = (0, _react.useRef)()
  var headingRowRef = (0, _react.useRef)()
  var eventRowRef = (0, _react.useRef)()
  var slotMetrics = DateSlotMetrics.getSlotMetrics()
  ;(0, _react.useImperativeHandle)(
    ref,
    function () {
      return {
        getRowLimit: getRowLimit,
      }
    },
    []
  )
  var handleSelectSlot = function handleSelectSlot(slot) {
    onSelectSlot(range.slice(slot.start, slot.end + 1), slot)
  }
  var handleShowMore = function handleShowMore(slot, target) {
    var metrics = slotMetrics(props)
    var row = (0, _querySelectorAll.default)(
      containerRef.current,
      '.rbc-row-bg'
    )[0]
    var cell
    if (row) cell = row.children[slot - 1]
    var events = metrics.getEventsForSlot(slot)
    onShowMore(events, range[slot - 1], cell, slot, target)
  }
  var getContainer = function getContainer() {
    return container ? container() : containerRef.current
  }
  function getRowLimit() {
    /* Guessing this only gets called on the dummyRow */
    var eventHeight = (0, _height.default)(eventRowRef.current)
    var headingHeight =
      headingRowRef !== null &&
      headingRowRef !== void 0 &&
      headingRowRef.current
        ? (0, _height.default)(headingRowRef.current)
        : 0
    var eventSpace = (0, _height.default)(containerRef.current) - headingHeight
    var rowLimit = Math.max(Math.floor(eventSpace / eventHeight), 1)
    return rowLimit
  }
  var renderHeadingCell = function renderHeadingCell(date, index) {
    var renderHeader = props.renderHeader,
      getNow = props.getNow,
      localizer = props.localizer
    return renderHeader({
      date: date,
      key: 'header_'.concat(index),
      className: (0, _clsx.default)(
        'rbc-date-cell',
        localizer.isSameDate(date, getNow()) && 'rbc-now'
      ),
      localizer: localizer,
    })
  }

  // I'm not sure this will ever run again
  var renderDummy = function renderDummy() {
    var className = props.className,
      range = props.range,
      renderHeader = props.renderHeader,
      showAllEvents = props.showAllEvents
    return /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        className: className,
        ref: containerRef,
      },
      /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          className: (0, _clsx.default)(
            'rbc-row-content',
            showAllEvents && 'rbc-row-content-scrollable'
          ),
        },
        renderHeader &&
          /*#__PURE__*/ _react.default.createElement(
            'div',
            {
              className: 'rbc-row',
              ref: headingRowRef,
            },
            range.map(renderHeadingCell)
          ),
        /*#__PURE__*/ _react.default.createElement(
          'div',
          {
            className: 'rbc-row',
            ref: eventRowRef,
          },
          /*#__PURE__*/ _react.default.createElement(
            'div',
            {
              className: 'rbc-row-segment',
            },
            /*#__PURE__*/ _react.default.createElement(
              'div',
              {
                className: 'rbc-event',
              },
              /*#__PURE__*/ _react.default.createElement(
                'div',
                {
                  className: 'rbc-event-content',
                },
                '\xA0'
              )
            )
          )
        )
      )
    )
  }
  if (renderForMeasure) return renderDummy()
  var metrics = slotMetrics(props)
  var levels = metrics.levels,
    extra = metrics.extra
  var ScrollableWeekComponent = showAllEvents
    ? _ScrollableWeekWrapper.default
    : _NoopWrapper.default
  var WeekWrapper = components.weekWrapper
  var eventRowProps = {
    selected: selected,
    accessors: accessors,
    getters: getters,
    localizer: localizer,
    components: components,
    onSelect: onSelect,
    onDoubleClick: onDoubleClick,
    onKeyPress: onKeyPress,
    resourceId: resourceId,
    slotMetrics: metrics,
    resizable: resizable,
  }

  // className is rbc-allday-cell

  return /*#__PURE__*/ _react.default.createElement(
    'div',
    {
      className: className,
      role: 'rowgroup',
      ref: containerRef,
    },
    /*#__PURE__*/ _react.default.createElement(_BackgroundCells.default, {
      localizer: localizer,
      date: date,
      getNow: getNow,
      rtl: rtl,
      range: range,
      selectable: selectable,
      container: getContainer,
      getters: getters,
      onSelectStart: onSelectStart,
      onSelectEnd: onSelectEnd,
      onSelectSlot: handleSelectSlot,
      components: components,
      longPressThreshold: longPressThreshold,
      resourceId: resourceId,
    }),
    /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        className: (0, _clsx.default)(
          'rbc-row-content',
          showAllEvents && 'rbc-row-content-scrollable'
        ),
        role: 'row',
      },
      renderHeader &&
        /*#__PURE__*/ _react.default.createElement(
          'div',
          {
            className: 'rbc-row ',
            ref: headingRowRef,
          },
          range.map(renderHeadingCell)
        ),
      /*#__PURE__*/ _react.default.createElement(
        ScrollableWeekComponent,
        null,
        /*#__PURE__*/ _react.default.createElement(
          WeekWrapper,
          Object.assign(
            {
              isAllDay: isAllDay,
            },
            eventRowProps
          ),
          levels.map(function (segs, idx) {
            return /*#__PURE__*/ _react.default.createElement(
              _EventRow.default,
              Object.assign(
                {
                  key: idx,
                  segments: segs,
                },
                eventRowProps
              )
            )
          }),
          !!extra.length &&
            /*#__PURE__*/ _react.default.createElement(
              _EventEndingRow.default,
              Object.assign(
                {
                  segments: extra,
                  onShowMore: handleShowMore,
                },
                eventRowProps
              )
            )
        )
      )
    )
  )
})
DateContentRow.defaultProps = {
  minRows: 0,
  maxRows: Infinity,
}
var _default = DateContentRow
exports.default = _default
