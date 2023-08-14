import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import Selection, { getBoundsForNode, isEvent } from './Selection'
import * as TimeSlotUtils from './utils/TimeSlots'
import { isSelected } from './utils/selection'

import { notify } from './utils/helpers'
import * as DayEventLayout from './utils/DayEventLayout'
import TimeSlotGroup from './TimeSlotGroup'
import TimeGridEvent from './TimeGridEvent'
import { DayLayoutAlgorithmPropType } from './utils/propTypes'

import DayColumnWrapper from './DayColumnWrapper'

// isNow is true if the DayColumn's date is today
const DayColumn = ({ ...props }) => {
  const {
    accessors,
    components: { eventContainerWrapper: EventContainer, ...components },
    date,
    dayLayoutAlgorithm,
    getNow,
    getters: { dayProp, ...getters },
    isNow,
    localizer,
    longPressThreshold,
    max,
    min,
    onDoubleClickEvent,
    onKeyPressEvent,
    onSelectEvent,
    onSelecting,
    onSelectSlot,
    resizable,
    resource,
    rtl,
    selected,
    selectable,
    step,
    timeslots,
  } = props
  const [timeIndicatorPosition, setTimeIndicatorPosition] = useState(null)
  const [timeIndicatorTimeoutId, setTimeIndicatorTimeoutId] = useState(null)
  const [intervalTriggered, setIntervalTriggered] = useState(false)
  const [selector, setSelector] = useState(null)
  const [selectionState, setSelectionState] = useState({
    selecting: false,
    top: '',
    height: '',
    start: null,
    startDate: Date,
    end: null,
    endDate: Date,
  })

  const prevPropsRef = useRef(null)
  const prevTimeIndicatorPositionRef = useRef(null)
  const containerRef = useRef(null)
  let slotMetrics = TimeSlotUtils.getSlotMetrics(props)

  // storing timeIndicatorPosition for comparison later
  useEffect(() => {
    prevTimeIndicatorPositionRef.current = timeIndicatorPosition
  }, [timeIndicatorPosition])

  // storing previous props to do comparison later with current props
  useEffect(() => {
    prevPropsRef.current = props
  }, [isNow, getNow, localizer, date])

  // refactor of UNSAFE_componentWillReceiveProps
  useEffect(() => {
    if (selectable && !prevPropsRef.current.selectable) _selectable()
    if (!selectable && prevPropsRef.current.selectable) teardownSelectable()
    if (timeIndicatorTimeoutId) {
      clearTimeIndicatorInterval(timeIndicatorTimeoutId)
    }
    slotMetrics = slotMetrics.update(props)
  }, [props])

  // refactor of componentDidMount
  useEffect(() => {
    selectable && _selectable()
    if (isNow) {
      setTimeIndicatorPositionUpdateInterval()
    }

    return () => {
      teardownSelectable()
      if (timeIndicatorTimeoutId) {
        clearTimeIndicatorInterval(timeIndicatorTimeoutId)
      }
    }
  }, [])

  // refactor of componentDidUpdate
  useEffect(() => {
    const getNowChanged = localizer.neq(
      prevPropsRef.current.getNow(),
      getNow(),
      'minutes'
    )

    if (prevPropsRef.current.isNow !== isNow || getNowChanged) {
      clearTimeIndicatorInterval()

      if (isNow) {
        const tail =
          !getNowChanged &&
          localizer.eq(prevPropsRef.current.date, date, 'minutes') &&
          prevTimeIndicatorPositionRef.current === timeIndicatorPosition
        setTimeIndicatorPositionUpdateInterval(tail)
      }
    } else if (
      isNow &&
      (localizer.neq(prevPropsRef.current.min, min, 'minutes') ||
        localizer.neq(prevPropsRef.current.max, max, 'minutes'))
    ) {
      positionTimeIndicator()
    }
  }, [isNow, getNow, localizer, date, min, max])

  /**
   * @param tail {Boolean} - whether `positionTimeIndicator` call should be
   *   deferred or called upon setting interval (`true` - if deferred);
   */
  function setTimeIndicatorPositionUpdateInterval(tail = false) {
    if (!intervalTriggered && !tail) {
      positionTimeIndicator()
    }

    let timeIndicatorTimeout = setTimeout(() => {
      setIntervalTriggered(true)
      positionTimeIndicator()
      setTimeIndicatorPositionUpdateInterval()
    }, 60000)
    setTimeIndicatorTimeoutId(timeIndicatorTimeout)
  }
  function clearTimeIndicatorInterval() {
    setIntervalTriggered(false)
    clearTimeout(timeIndicatorTimeoutId)
    setTimeIndicatorTimeoutId(null)
  }

  function positionTimeIndicator() {
    const current = getNow()

    if (current >= min && current <= max) {
      const top = slotMetrics.getCurrentTimePosition(current)
      setIntervalTriggered(true)
      setTimeIndicatorPosition(top)
    } else {
      clearTimeIndicatorInterval()
    }
  }

  let selectDates = {
    start: selectionState.startDate,
    end: selectionState.endDate,
  }

  const { className, style } = dayProp(max)

  const DayColumnWrapperComponent =
    components.dayColumnWrapper || DayColumnWrapper

  return (
    <DayColumnWrapperComponent
      ref={containerRef}
      date={date}
      style={style}
      className={clsx(
        className,
        'rbc-day-slot',
        'rbc-time-column',
        isNow && 'rbc-now',
        isNow && 'rbc-today', // WHY
        selectionState.selecting && 'rbc-slot-selecting'
      )}
      slotMetrics={slotMetrics}
    >
      {slotMetrics.groups.map((grp, idx) => (
        <TimeSlotGroup
          key={idx}
          group={grp}
          resource={resource}
          getters={getters}
          components={components}
        />
      ))}
      <EventContainer
        localizer={localizer}
        resource={resource}
        accessors={accessors}
        getters={getters}
        components={components}
        slotMetrics={slotMetrics}
      >
        <div className={clsx('rbc-events-container', rtl && 'rtl')}>
          {renderEvents({
            events: props.backgroundEvents,
            isBackgroundEvent: true,
          })}
          {renderEvents({ events: props.events })}
        </div>
      </EventContainer>

      {selectionState.selecting && (
        <div
          className="rbc-slot-selection"
          style={{ top: selectionState.top, height: selectionState.height }}
        >
          <span>{localizer.format(selectDates, 'selectRangeFormat')}</span>
        </div>
      )}
      {isNow && intervalTriggered && (
        <div
          className="rbc-current-time-indicator"
          style={{ top: `${timeIndicatorPosition}%` }}
        />
      )}
    </DayColumnWrapperComponent>
  )

  function renderEvents({ events, isBackgroundEvent }) {
    const { messages } = localizer

    let styledEvents = DayEventLayout.getStyledEvents({
      events,
      accessors,
      slotMetrics,
      minimumStartDifference: Math.ceil((step * timeslots) / 2),
      dayLayoutAlgorithm,
    })

    return styledEvents.map(({ event, style }, idx) => {
      let end = accessors.end(event)
      let start = accessors.start(event)
      let format = 'eventTimeRangeFormat'
      let label

      const startsBeforeDay = slotMetrics.startsBeforeDay(start)
      const startsAfterDay = slotMetrics.startsAfterDay(end)

      if (startsBeforeDay) format = 'eventTimeRangeEndFormat'
      else if (startsAfterDay) format = 'eventTimeRangeStartFormat'

      if (startsBeforeDay && startsAfterDay) label = messages.allDay
      else label = localizer.format({ start, end }, format)

      let continuesPrior = startsBeforeDay || slotMetrics.startsBefore(start)
      let continuesAfter = startsAfterDay || slotMetrics.startsAfter(end)

      return (
        <TimeGridEvent
          style={style}
          event={event}
          label={label}
          key={'evt_' + idx}
          getters={getters}
          rtl={rtl}
          components={components}
          continuesPrior={continuesPrior}
          continuesAfter={continuesAfter}
          accessors={accessors}
          resource={resource}
          selected={isSelected(event, selected)}
          onClick={(e) => select({ ...event, sourceResource: resource }, e)}
          onDoubleClick={(e) => doubleClick(event, e)}
          isBackgroundEvent={isBackgroundEvent}
          onKeyPress={(e) => keyPress(event, e)}
          resizable={resizable}
        />
      )
    })
  }

  function _selectable() {
    let node = containerRef.current
    const selector = new Selection(() => node, {
      longPressThreshold: longPressThreshold,
    })

    setSelector(selector)

    let maybeSelect = (box) => {
      let tempSelectionState = getTempSelectionState(box)
      let { startDate: start, endDate: end } = tempSelectionState

      if (onSelecting) {
        if (
          (localizer.eq(selectionState.startDate, start, 'minutes') &&
            localizer.eq(selectionState.endDate, end, 'minutes')) ||
          onSelecting({ start, end, resourceId: resource }) === false
        )
          return
      }

      if (
        selectionState.start !== tempSelectionState.start ||
        selectionState.end !== tempSelectionState.end ||
        selectionState.selecting !== tempSelectionState.selecting
      ) {
        setSelectionState(tempSelectionState)
      }
    }

    let getTempSelectionState = (point) => {
      let currentSlot = slotMetrics.closestSlotFromPoint(
        point,
        getBoundsForNode(node)
      )
      let initialSlot = !selectionState.selecting ? currentSlot : undefined

      if (localizer.lte(initialSlot, currentSlot)) {
        currentSlot = slotMetrics.nextSlot(currentSlot)
      } else if (localizer.gt(initialSlot, currentSlot)) {
        initialSlot = slotMetrics.nextSlot(initialSlot)
      }

      const selectRange = slotMetrics.getRange(
        localizer.min(initialSlot, currentSlot),
        localizer.max(initialSlot, currentSlot)
      )

      return {
        ...selectRange,
        selecting: true,
        top: `${selectRange.top}%`,
        height: `${selectRange.height}%`,
      }
    }

    let selectorClicksHandler = (box, actionType) => {
      if (!isEvent(containerRef.current, box)) {
        const { startDate, endDate } = getTempSelectionState(box)
        selectSlot({
          startDate,
          endDate,
          action: actionType,
          box,
        })
      }
      setSelectionState({ ...selectionState, selecting: false })
    }

    selector.on('selecting', maybeSelect)
    selector.on('selectStart', maybeSelect)

    selector.on('beforeSelect', (box) => {
      if (selectable !== 'ignoreEvents') return

      return !isEvent(containerRef.current, box)
    })

    selector.on('click', (box) => selectorClicksHandler(box, 'click'))

    selector.on('doubleClick', (box) =>
      selectorClicksHandler(box, 'doubleClick')
    )

    selector.on('select', (bounds) => {
      if (selectionState.selecting) {
        selectSlot({ ...selectionState, action: 'select', bounds })
        setSelectionState({ ...selectionState, selecting: false })
      }
    })

    selector.on('reset', () => {
      if (selectionState.selecting) {
        setSelectionState({ ...selectionState, selecting: false })
      }
    })
  }

  function teardownSelectable() {
    if (!selector) return
    selector.teardown()
    setSelector(null)
  }

  function selectSlot({ startDate, endDate, action, bounds, box }) {
    let current = startDate,
      slots = []

    while (localizer.lte(current, endDate)) {
      slots.push(current)
      current = new Date(+current + step * 60 * 1000) // using Date ensures not to create an endless loop the day DST begins
    }

    notify(onSelectSlot, {
      slots,
      start: startDate,
      end: endDate,
      resourceId: resource,
      action,
      bounds,
      box,
    })
  }

  function select(...args) {
    notify(onSelectEvent, args)
  }

  function doubleClick(...args) {
    notify(onDoubleClickEvent, args)
  }

  function keyPress(...args) {
    notify(onKeyPressEvent, args)
  }
}

DayColumn.propTypes = {
  events: PropTypes.array.isRequired,
  backgroundEvents: PropTypes.array.isRequired,
  step: PropTypes.number.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  min: PropTypes.instanceOf(Date).isRequired,
  max: PropTypes.instanceOf(Date).isRequired,
  getNow: PropTypes.func.isRequired,
  isNow: PropTypes.bool,

  rtl: PropTypes.bool,
  resizable: PropTypes.bool,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  showMultiDayTimes: PropTypes.bool,
  culture: PropTypes.string,
  timeslots: PropTypes.number,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  eventOffset: PropTypes.number,
  longPressThreshold: PropTypes.number,

  onSelecting: PropTypes.func,
  onSelectSlot: PropTypes.func.isRequired,
  onSelectEvent: PropTypes.func.isRequired,
  onDoubleClickEvent: PropTypes.func.isRequired,
  onKeyPressEvent: PropTypes.func,

  className: PropTypes.string,
  dragThroughEvents: PropTypes.bool,
  resource: PropTypes.any,

  dayLayoutAlgorithm: DayLayoutAlgorithmPropType,
}

DayColumn.defaultProps = {
  dragThroughEvents: true,
  timeslots: 2,
}

export default DayColumn
