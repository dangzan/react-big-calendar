import React, { useImperativeHandle, useRef } from 'react'
import clsx from 'clsx'
import qsa from 'dom-helpers/querySelectorAll'
import getHeight from 'dom-helpers/height'
import PropTypes from 'prop-types'
import BackgroundCells from './BackgroundCells'
import EventRow from './EventRow'
import EventEndingRow from './EventEndingRow'
import NoopWrapper from './NoopWrapper'
import ScrollableWeekWrapper from './ScrollableWeekWrapper'
import * as DateSlotMetrics from './utils/DateSlotMetrics'

const DateContentRow = React.forwardRef((props, ref) => {
  const {
    accessors,
    className,
    components,
    container,
    date,
    getNow,
    getters,
    isAllDay,
    localizer,
    longPressThreshold,
    onSelectSlot,
    onSelect,
    onSelectEnd,
    onSelectStart,
    onDoubleClick,
    onKeyPress,
    range,
    renderForMeasure,
    renderHeader,
    resizable,
    resourceId,
    rtl,
    selectable,
    selected,
    showAllEvents,
  } = props

  const containerRef = useRef()
  const headingRowRef = useRef()
  const eventRowRef = useRef()

  const slotMetrics = DateSlotMetrics.getSlotMetrics()

  useImperativeHandle(
    ref,
    () => ({
      getRowLimit,
    }),
    []
  )

  const handleSelectSlot = (slot) => {
    onSelectSlot(range.slice(slot.start, slot.end + 1), slot)
  }

  const handleShowMore = (slot, target) => {
    const { range, onShowMore } = props
    let metrics = slotMetrics(props)
    let row = qsa(containerRef.current, '.rbc-row-bg')[0]

    let cell
    if (row) cell = row.children[slot - 1]

    let events = metrics.getEventsForSlot(slot)
    onShowMore(events, range[slot - 1], cell, slot, target)
  }

  const getContainer = () => {
    return container ? container() : containerRef.current
  }

  function getRowLimit() {
    /* Guessing this only gets called on the dummyRow */
    const eventHeight = getHeight(eventRowRef.current)
    const headingHeight = headingRowRef?.current
      ? getHeight(headingRowRef.current)
      : 0
    const eventSpace = getHeight(containerRef.current) - headingHeight

    return Math.max(Math.floor(eventSpace / eventHeight), 1)
  }

  const renderHeadingCell = (date, index) => {
    let { renderHeader, getNow, localizer } = props

    return renderHeader({
      date,
      key: `header_${index}`,
      className: clsx(
        'rbc-date-cell',
        localizer.isSameDate(date, getNow()) && 'rbc-now'
      ),
    })
  }

  const renderDummy = () => {
    let { className, range, renderHeader, showAllEvents } = props
    return (
      <div className={className} ref={containerRef}>
        <div
          className={clsx(
            'rbc-row-content',
            showAllEvents && 'rbc-row-content-scrollable'
          )}
        >
          {renderHeader && (
            <div className="rbc-row" ref={headingRowRef}>
              {range.map(renderHeadingCell)}
            </div>
          )}
          <div className="rbc-row" ref={eventRowRef}>
            <div className="rbc-row-segment">
              <div className="rbc-event">
                <div className="rbc-event-content">&nbsp;</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (renderForMeasure) return renderDummy()

  let metrics = slotMetrics(props)
  let { levels, extra } = metrics

  let ScrollableWeekComponent = showAllEvents
    ? ScrollableWeekWrapper
    : NoopWrapper
  let WeekWrapper = components.weekWrapper

  const eventRowProps = {
    selected,
    accessors,
    getters,
    localizer,
    components,
    onSelect,
    onDoubleClick,
    onKeyPress,
    resourceId,
    slotMetrics: metrics,
    resizable,
  }

  return (
    <div className={className} role="rowgroup" ref={containerRef}>
      <BackgroundCells
        localizer={localizer}
        date={date}
        getNow={getNow}
        rtl={rtl}
        range={range}
        selectable={selectable}
        container={getContainer}
        getters={getters}
        onSelectStart={onSelectStart}
        onSelectEnd={onSelectEnd}
        onSelectSlot={handleSelectSlot}
        components={components}
        longPressThreshold={longPressThreshold}
        resourceId={resourceId}
      />

      <div
        className={clsx(
          'rbc-row-content',
          showAllEvents && 'rbc-row-content-scrollable'
        )}
        role="row"
      >
        {renderHeader && (
          <div className="rbc-row " ref={headingRowRef}>
            {range.map(renderHeadingCell)}
          </div>
        )}
        <ScrollableWeekComponent>
          <WeekWrapper isAllDay={isAllDay} {...eventRowProps}>
            {levels.map((segs, idx) => (
              <EventRow key={idx} segments={segs} {...eventRowProps} />
            ))}
            {!!extra.length && (
              <EventEndingRow
                segments={extra}
                onShowMore={handleShowMore}
                {...eventRowProps}
              />
            )}
          </WeekWrapper>
        </ScrollableWeekComponent>
      </div>
    </div>
  )
})

DateContentRow.propTypes = {
  date: PropTypes.instanceOf(Date),
  events: PropTypes.array.isRequired,
  range: PropTypes.array.isRequired,

  rtl: PropTypes.bool,
  resizable: PropTypes.bool,
  resourceId: PropTypes.any,
  renderForMeasure: PropTypes.bool,
  renderHeader: PropTypes.func,

  container: PropTypes.func,
  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onShowMore: PropTypes.func,
  showAllEvents: PropTypes.bool,
  onSelectSlot: PropTypes.func,
  onSelect: PropTypes.func,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onKeyPress: PropTypes.func,
  dayPropGetter: PropTypes.func,

  getNow: PropTypes.func.isRequired,
  isAllDay: PropTypes.bool,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  minRows: PropTypes.number.isRequired,
  maxRows: PropTypes.number.isRequired,
}

DateContentRow.defaultProps = {
  minRows: 0,
  maxRows: Infinity,
}

export default DateContentRow
