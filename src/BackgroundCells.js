import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import { notify } from './utils/helpers'
import { dateCellSelection, getSlotAtX, pointInBox } from './utils/selection'
import Selection, { getBoundsForNode, isEvent, isShowMore } from './Selection'

const BackgroundCells = (props) => {
  const {
    range,
    getNow,
    getters,
    date: currentDate,
    components: { dateCellWrapper: Wrapper },
    localizer,
  } = props
  const [selecting, setSelecting] = useState(false)
  const containerRef = useRef(null)
  let selector = useRef(null)
  let _initial = useRef({ x: 0, y: 0 })
  let startIdx = useRef(-1)
  let endIdx = useRef(-1)

  useEffect(() => {
    if (props.selectable) {
      _selectable()
    }

    return () => {
      _teardownSelectable()
    }
  }, [props.selectable])

  const _selectable = () => {
    let node = containerRef.current

    selector.current = new Selection(props.container, {
      longPressThreshold: props.longPressThreshold,
    })

    let selectorClicksHandler = (point, actionType) => {
      if (!isEvent(node, point) && !isShowMore(node, point)) {
        let rowBox = getBoundsForNode(node)
        let { range, rtl } = props

        if (pointInBox(rowBox, point)) {
          let currentCell = getSlotAtX(rowBox, point.x, rtl, range.length)

          _selectSlot({
            startIdx: currentCell,
            endIdx: currentCell,
            action: actionType,
            box: point,
          })
        }
      }

      _initial.current = {}
      setSelecting(false)
    }

    selector.current.on('selecting', (box) => {
      let { range, rtl } = props

      if (!selecting) {
        notify(props.onSelectStart, [box])
        _initial.current = { x: box.x, y: box.y }
      }

      if (selector.current.isSelected(node)) {
        let nodeBox = getBoundsForNode(node)
        ;({ startIdx: startIdx.current, endIdx: endIdx.current } =
          dateCellSelection(_initial.current, nodeBox, box, range.length, rtl))
      }

      setSelecting(true)
    })

    selector.current.on('beforeSelect', (box) => {
      if (props.selectable !== 'ignoreEvents')
        return !isEvent(containerRef.current, box)

      return false
    })

    selector.current.on('click', (point) =>
      selectorClicksHandler(point, 'click')
    )

    selector.current.on('doubleClick', (point) =>
      selectorClicksHandler(point, 'doubleClick')
    )

    selector.current.on('select', (bounds) => {
      _selectSlot({
        startIdx: startIdx.current,
        endIdx: endIdx.current,
        action: 'select',
        bounds,
      })
      _initial.current = {}
      setSelecting(false)
      notify(props.onSelectEnd, [
        { startIdx: startIdx.current, endIdx: endIdx.current },
      ])
    })
  }

  const _teardownSelectable = () => {
    if (selector.current) {
      selector.current.teardown()
      selector.current = null
    }
  }

  const _selectSlot = ({ endIdx, startIdx, action, bounds, box }) => {
    if (endIdx !== -1 && startIdx !== -1) {
      props.onSelectSlot &&
        props.onSelectSlot({
          start: startIdx,
          end: endIdx,
          action,
          bounds,
          box,
          resourceId: props.resourceId,
        })
    }
  }

  let current = getNow()

  return (
    <div className={clsx(props.className, 'rbc-row-bg')} ref={containerRef}>
      {range.map((date, index) => {
        let selected =
          selecting && index >= startIdx.current && index <= endIdx.current
        const { className, style } = getters.dayProp(date)

        return (
          <Wrapper key={index} value={date} range={range}>
            <div
              style={style}
              className={clsx(
                'rbc-day-bg',
                className,
                selected && 'rbc-selected-cell',
                localizer.isSameDate(date, current) && 'rbc-today',
                currentDate &&
                  localizer.neq(currentDate, date, 'month') &&
                  'rbc-off-range-bg'
              )}
            />
          </Wrapper>
        )
      })}
    </div>
  )
}

BackgroundCells.propTypes = {
  date: PropTypes.instanceOf(Date),
  getNow: PropTypes.func.isRequired,
  getters: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  container: PropTypes.func,
  dayPropGetter: PropTypes.func,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,
  onSelectSlot: PropTypes.func.isRequired,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,
  range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  rtl: PropTypes.bool,
  type: PropTypes.string,
  resourceId: PropTypes.any,
  localizer: PropTypes.any,
}

export default BackgroundCells
