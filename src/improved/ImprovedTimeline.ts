import {
  Clock,
  ClockRange,
  Color,
  defined,
  destroyObject,
  DeveloperError,
  getElement,
  JulianDate,
  Scene,
  TimeInterval,
  Timeline,
  TimelineHighlightRange,
  TimelineTrack,
} from "cesium"

let timelineWheelDelta = 1e12

const timelineMouseMode = {
  none: 0,
  scrub: 1,
  slide: 2,
  zoom: 3,
  touchOnly: 4,
}
const timelineTouchMode = {
  none: 0,
  scrub: 1,
  slideZoom: 2,
  singleTap: 3,
  ignore: 4,
}

const timelineTicScales = [
  0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0, 15.0, 30.0, 60.0, 120.0, 300.0, 600.0,
  900.0, 1800.0, 3600.0, 7200.0, 14400.0, 21600.0, 43200.0, 86400.0, 172800.0, 345600.0, 604800.0, 1296000.0, 2592000.0,
  5184000.0, 7776000.0, 15552000.0, 31536000.0, 63072000.0, 126144000.0, 157680000.0, 315360000.0, 630720000.0,
  1261440000.0, 1576800000.0, 3153600000.0, 6307200000.0, 12614400000.0, 15768000000.0, 31536000000.0,
]

const timelineMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/**
 * @description 时间轴 {@link Timeline} 的改进版本
 * @beta 用于解决在视窗画幅缩放、拉伸的情况下放大缩小时间轴操作定位错误的问题
 * @alias ImprovedTimeline
 * @constructor
 *
 * @param {Element} container The parent HTML container node for this widget.
 * @param {Clock} clock The clock to use.
 */
export class ImprovedTimeline {
  /**
   * @private
   */
  smallestTicInPixels = 7.0

  container: Element
  _scene: Scene
  _topDiv: HTMLDivElement

  _endJulian?: JulianDate
  _epochJulian?: JulianDate
  _lastXPos?: number
  _scrubElement?: HTMLDivElement
  _startJulian?: JulianDate
  _timeBarSecondsSpan?: number
  _clock: Clock
  _scrubJulian: JulianDate
  _mainTicSpan: number = -1
  _mouseMode: number = timelineMouseMode.none
  _touchMode: number = timelineTouchMode.none
  _touchState = { centerX: 0, spanX: 0 }
  _mouseX: number = 0
  _timelineDrag: number = 0
  _timelineDragLocation?: number
  _lastHeight?: number
  _lastWidth?: number

  _timeBarEle: HTMLDivElement
  _trackContainer: HTMLDivElement
  _trackListEle: HTMLCanvasElement
  _needleEle: HTMLDivElement
  _rulerEle: HTMLDivElement
  _context: CanvasRenderingContext2D

  _trackList: TimelineTrack[] = []
  _highlightRanges: TimelineHighlightRange[] = []

  _onMouseDown: EventListener
  _onMouseUp: EventListener
  _onMouseMove: EventListener
  _onMouseWheel: EventListener
  _onTouchStart: EventListener
  _onTouchMove: EventListener
  _onTouchEnd: EventListener

  constructor(container: string | Element, clock: Clock, scene: Scene) {
    if (!defined(container)) {
      throw new DeveloperError("container is required.")
    }
    if (!defined(clock)) {
      throw new DeveloperError("clock is required.")
    }
    if (!defined(scene)) {
      throw new DeveloperError("scene is required.")
    }

    container = getElement(container)

    const ownerDocument = container.ownerDocument

    this._scene = scene
    /**
     * Gets the parent container.
     * @type {Element}
     */
    this.container = container

    const topDiv = ownerDocument.createElement("div")
    topDiv.className = "cesium-timeline-main"
    container.appendChild(topDiv)
    this._topDiv = topDiv

    this._clock = clock
    this._scrubJulian = clock.currentTime

    this._topDiv.innerHTML =
      '<div class="cesium-timeline-bar"></div><div class="cesium-timeline-trackContainer">' +
      '<canvas class="cesium-timeline-tracks" width="10" height="1">' +
      '</canvas></div><div class="cesium-timeline-needle"></div><span class="cesium-timeline-ruler"></span>'
    this._timeBarEle = this._topDiv.childNodes[0] as HTMLDivElement
    this._trackContainer = this._topDiv.childNodes[1] as HTMLDivElement
    this._trackListEle = this._topDiv.childNodes[1].childNodes[0] as HTMLCanvasElement
    this._needleEle = this._topDiv.childNodes[2] as HTMLDivElement
    this._rulerEle = this._topDiv.childNodes[3] as HTMLDivElement
    this._context = this._trackListEle.getContext("2d")!

    this.zoomTo(clock.startTime, clock.stopTime)

    this._onMouseDown = createMouseDownCallback(this)
    this._onMouseUp = createMouseUpCallback(this)
    this._onMouseMove = createMouseMoveCallback(this)
    this._onMouseWheel = createMouseWheelCallback(this)
    this._onTouchStart = createTouchStartCallback(this)
    this._onTouchMove = createTouchMoveCallback(this)
    this._onTouchEnd = createTouchEndCallback(this)

    const timeBarEle = this._timeBarEle
    ownerDocument.addEventListener("mouseup", this._onMouseUp, false)
    ownerDocument.addEventListener("mousemove", this._onMouseMove, false)
    timeBarEle.addEventListener("mousedown", this._onMouseDown, false)
    timeBarEle.addEventListener("DOMMouseScroll", this._onMouseWheel, false) // Mozilla mouse wheel
    timeBarEle.addEventListener("mousewheel", this._onMouseWheel, false)
    timeBarEle.addEventListener("touchstart", this._onTouchStart, false)
    timeBarEle.addEventListener("touchmove", this._onTouchMove, false)
    timeBarEle.addEventListener("touchend", this._onTouchEnd, false)
    timeBarEle.addEventListener("touchcancel", this._onTouchEnd, false)

    this._topDiv.oncontextmenu = () => false

    clock.onTick.addEventListener(this.updateFromClock, this)
    this.updateFromClock()
  }

  /**
   * @private
   */
  addEventListener(
    type: any,
    listener: (this: HTMLDivElement, ev: any) => any,
    useCapture: boolean | AddEventListenerOptions
  ) {
    this._topDiv.addEventListener(type, listener, useCapture)
  }

  /**
   * @private
   */
  removeEventListener(
    type: any,
    listener: (this: HTMLDivElement, ev: any) => any,
    useCapture: boolean | AddEventListenerOptions
  ) {
    this._topDiv.removeEventListener(type, listener, useCapture)
  }

  /**
   * @returns {boolean} true if the object has been destroyed, false otherwise.
   */
  isDestroyed() {
    return false
  }

  /**
   * Destroys the widget.  Should be called if permanently
   * removing the widget from layout.
   */
  destroy() {
    this._clock.onTick.removeEventListener(this.updateFromClock, this)

    const doc = this.container.ownerDocument
    doc.removeEventListener("mouseup", this._onMouseUp, false)
    doc.removeEventListener("mousemove", this._onMouseMove, false)

    const timeBarEle = this._timeBarEle
    timeBarEle.removeEventListener("mousedown", this._onMouseDown, false)
    timeBarEle.removeEventListener("DOMMouseScroll", this._onMouseWheel, false) // Mozilla mouse wheel
    timeBarEle.removeEventListener("mousewheel", this._onMouseWheel, false)
    timeBarEle.removeEventListener("touchstart", this._onTouchStart, false)
    timeBarEle.removeEventListener("touchmove", this._onTouchMove, false)
    timeBarEle.removeEventListener("touchend", this._onTouchEnd, false)
    timeBarEle.removeEventListener("touchcancel", this._onTouchEnd, false)
    this.container.removeChild(this._topDiv)
    destroyObject(this)
  }

  /**
   * @private
   */
  addHighlightRange(color: Color, heightInPx: number, base: number) {
    const newHighlightRange = new TimelineHighlightRange(color, heightInPx, base)
    this._highlightRanges.push(newHighlightRange)
    this.resize()
    return newHighlightRange
  }

  /**
   * @private
   */
  addTrack(interval: TimeInterval, heightInPx: number, color: Color, backgroundColor: Color) {
    const newTrack = new TimelineTrack(interval, heightInPx, color, backgroundColor)
    this._trackList.push(newTrack)
    this._lastHeight = undefined
    this.resize()
    return newTrack
  }

  /**
   * Sets the view to the provided times.
   *
   * @param {JulianDate} startTime The start time.
   * @param {JulianDate} stopTime The stop time.
   */
  zoomTo(startTime: JulianDate, stopTime: JulianDate) {
    if (!defined(startTime)) {
      throw new DeveloperError("startTime is required.")
    }
    if (!defined(stopTime)) {
      throw new DeveloperError("stopTime is required")
    }
    if (JulianDate.lessThanOrEquals(stopTime, startTime)) {
      throw new DeveloperError("Start time must come before end time.")
    }

    this._startJulian = startTime
    this._endJulian = stopTime
    this._timeBarSecondsSpan = JulianDate.secondsDifference(stopTime, startTime)

    // If clock is not unbounded, clamp timeline range to clock.
    if (this._clock && this._clock.clockRange !== ClockRange.UNBOUNDED) {
      const clockStart = this._clock.startTime
      const clockEnd = this._clock.stopTime
      const clockSpan = JulianDate.secondsDifference(clockEnd, clockStart)
      const startOffset = JulianDate.secondsDifference(clockStart, this._startJulian)
      const endOffset = JulianDate.secondsDifference(clockEnd, this._endJulian)

      if (this._timeBarSecondsSpan >= clockSpan) {
        // if new duration longer than clock range duration, clamp to full range.
        this._timeBarSecondsSpan = clockSpan
        this._startJulian = this._clock.startTime
        this._endJulian = this._clock.stopTime
      } else if (startOffset > 0) {
        // if timeline start is before clock start, shift right
        this._endJulian = JulianDate.addSeconds(this._endJulian, startOffset, new JulianDate())
        this._startJulian = clockStart
        this._timeBarSecondsSpan = JulianDate.secondsDifference(this._endJulian, this._startJulian)
      } else if (endOffset < 0) {
        // if timeline end is after clock end, shift left
        this._startJulian = JulianDate.addSeconds(this._startJulian, endOffset, new JulianDate())
        this._endJulian = clockEnd
        this._timeBarSecondsSpan = JulianDate.secondsDifference(this._endJulian, this._startJulian)
      }
    }

    this._makeTics()

    const evt = document.createEvent("Event") as any
    evt.initEvent("setzoom", true, true)
    evt.startJulian = this._startJulian
    evt.endJulian = this._endJulian
    evt.epochJulian = this._epochJulian
    evt.totalSpan = this._timeBarSecondsSpan
    evt.mainTicSpan = this._mainTicSpan
    this._topDiv.dispatchEvent(evt)
  }

  /**
   * @private
   */
  zoomFrom(amount: number) {
    let centerSec = JulianDate.secondsDifference(this._scrubJulian, this._startJulian!)
    if (amount > 1 || centerSec < 0 || centerSec > this._timeBarSecondsSpan!) {
      centerSec = this._timeBarSecondsSpan! * 0.5
    } else {
      centerSec += centerSec - this._timeBarSecondsSpan! * 0.5
    }
    const centerSecFlip = this._timeBarSecondsSpan! - centerSec
    this.zoomTo(
      JulianDate.addSeconds(this._startJulian!, centerSec - centerSec * amount, new JulianDate()),
      JulianDate.addSeconds(this._endJulian!, centerSecFlip * amount - centerSecFlip, new JulianDate())
    )
  }

  /**
   * @private
   */
  makeLabel(time: JulianDate) {
    const gregorian = JulianDate.toGregorianDate(time)
    const millisecond = gregorian.millisecond
    let millisecondString = " UTC"
    if (millisecond > 0 && this._timeBarSecondsSpan! < 3600) {
      millisecondString = Math.floor(millisecond).toString()
      while (millisecondString.length < 3) {
        millisecondString = `0${millisecondString}`
      }
      millisecondString = `.${millisecondString}`
    }

    return `${timelineMonthNames[gregorian.month - 1]} ${gregorian.day} ${
      gregorian.year
    } ${twoDigits(gregorian.hour)}:${twoDigits(gregorian.minute)}:${twoDigits(gregorian.second)}${millisecondString}`
  }

  /**
   * @private
   */
  _makeTics() {
    const timeBar = this._timeBarEle

    const seconds = JulianDate.secondsDifference(this._scrubJulian, this._startJulian!)
    const xPos = Math.round((seconds * this._topDiv.clientWidth) / this._timeBarSecondsSpan!)
    const scrubX = xPos - 8
    let tic
    const widget = this

    this._needleEle.style.left = `${xPos.toString()}px`

    let tics = ""

    const minimumDuration = 0.01
    const maximumDuration = 31536000000.0 // ~1000 years
    const epsilon = 1e-10

    // If time step size is known, enter it here...
    let minSize = 0

    let duration = this._timeBarSecondsSpan!
    if (duration < minimumDuration) {
      duration = minimumDuration
      this._timeBarSecondsSpan = minimumDuration
      this._endJulian = JulianDate.addSeconds(this._startJulian!, minimumDuration, new JulianDate())
    } else if (duration > maximumDuration) {
      duration = maximumDuration
      this._timeBarSecondsSpan = maximumDuration
      this._endJulian = JulianDate.addSeconds(this._startJulian!, maximumDuration, new JulianDate())
    }

    let timeBarWidth = this._timeBarEle.clientWidth
    if (timeBarWidth < 10) {
      timeBarWidth = 10
    }
    const startJulian = this._startJulian

    // epsilonTime: a small fraction of one pixel width of the timeline, measured in seconds.
    const epsilonTime = Math.min((duration / timeBarWidth) * 1e-5, 0.4)

    // epochJulian: a nearby time to be considered "zero seconds", should be a round-ish number by human standards.
    let epochJulian
    const gregorianDate = JulianDate.toGregorianDate(startJulian!)
    if (duration > 315360000) {
      // 3650+ days visible, epoch is start of the first visible century.
      epochJulian = JulianDate.fromDate(new Date(Date.UTC(Math.floor(gregorianDate.year / 100) * 100, 0)))
    } else if (duration > 31536000) {
      // 365+ days visible, epoch is start of the first visible decade.
      epochJulian = JulianDate.fromDate(new Date(Date.UTC(Math.floor(gregorianDate.year / 10) * 10, 0)))
    } else if (duration > 86400) {
      // 1+ day(s) visible, epoch is start of the year.
      epochJulian = JulianDate.fromDate(new Date(Date.UTC(gregorianDate.year, 0)))
    } else {
      // Less than a day on timeline, epoch is midnight of the visible day.
      epochJulian = JulianDate.fromDate(new Date(Date.UTC(gregorianDate.year, gregorianDate.month, gregorianDate.day)))
    }

    // startTime: Seconds offset of the left side of the timeline from epochJulian.
    const startTime = JulianDate.secondsDifference(
      this._startJulian!,
      JulianDate.addSeconds(epochJulian, epsilonTime, new JulianDate())
    )
    // endTime: Seconds offset of the right side of the timeline from epochJulian.
    let endTime = startTime + duration
    this._epochJulian = epochJulian

    const getStartTic = (ticScale: number) => {
      return Math.floor(startTime / ticScale) * ticScale
    }

    const getNextTic = (tic: number, ticScale: number) => {
      return Math.ceil(tic / ticScale + 0.5) * ticScale
    }

    const getAlpha = (time: number) => {
      return (time - startTime) / duration
    }

    const remainder = (x: number, y: number) => {
      //return x % y;
      return x - y * Math.round(x / y)
    }

    // Width in pixels of a typical label, plus padding
    this._rulerEle.innerHTML = this.makeLabel(
      JulianDate.addSeconds(this._endJulian!, -minimumDuration, new JulianDate())
    )
    let sampleWidth = this._rulerEle.offsetWidth + 20
    if (sampleWidth < 30) {
      // Workaround an apparent IE bug with measuring the width after going full-screen from inside an iframe.
      sampleWidth = 180
    }

    const origMinSize = minSize
    minSize -= epsilon

    const renderState = {
      y: undefined as unknown as number,
      startTime: startTime,
      startJulian: startJulian,
      epochJulian: epochJulian,
      duration: duration,
      timeBarWidth: timeBarWidth,
      getAlpha: getAlpha,
    }
    this._highlightRanges.forEach((highlightRange) => {
      tics += highlightRange.render(renderState)
    })

    // Calculate tic mark label spacing in the TimeBar.
    let mainTic = 0.0,
      subTic = 0.0,
      tinyTic = 0.0
    // Ideal labeled tic as percentage of zoom interval
    let idealTic = sampleWidth / timeBarWidth
    if (idealTic > 1.0) {
      // Clamp to width of window, for thin windows.
      idealTic = 1.0
    }
    // Ideal labeled tic size in seconds
    idealTic *= this._timeBarSecondsSpan!
    let ticIndex = -1,
      smallestIndex = -1

    const ticScaleLen = timelineTicScales.length
    let i
    for (i = 0; i < ticScaleLen; ++i) {
      const sc = timelineTicScales[i]
      ++ticIndex
      mainTic = sc
      // Find acceptable main tic size not smaller than ideal size.
      if (sc > idealTic && sc > minSize) {
        break
      }
      if (smallestIndex < 0 && timeBarWidth * (sc / this._timeBarSecondsSpan!) >= this.smallestTicInPixels) {
        smallestIndex = ticIndex
      }
    }
    if (ticIndex > 0) {
      while (ticIndex > 0) {
        // Compute sub-tic size that evenly divides main tic.
        --ticIndex
        if (Math.abs(remainder(mainTic, timelineTicScales[ticIndex])) < 0.00001) {
          if (timelineTicScales[ticIndex] >= minSize) {
            subTic = timelineTicScales[ticIndex]
          }
          break
        }
      }

      if (smallestIndex >= 0) {
        while (smallestIndex < ticIndex) {
          // Compute tiny tic size that evenly divides sub-tic.
          if (
            Math.abs(remainder(subTic, timelineTicScales[smallestIndex])) < 0.00001 &&
            timelineTicScales[smallestIndex] >= minSize
          ) {
            tinyTic = timelineTicScales[smallestIndex]
            break
          }
          ++smallestIndex
        }
      }
    }

    minSize = origMinSize
    if (minSize > epsilon && tinyTic < 0.00001 && Math.abs(minSize - mainTic) > epsilon) {
      tinyTic = minSize
      if (minSize <= mainTic + epsilon) {
        subTic = 0.0
      }
    }

    let lastTextLeft = -999999,
      textWidth
    if (timeBarWidth * (tinyTic / this._timeBarSecondsSpan!) >= 3.0) {
      for (tic = getStartTic(tinyTic); tic <= endTime; tic = getNextTic(tic, tinyTic)) {
        tics += `<span class="cesium-timeline-ticTiny" style="left: ${Math.round(
          timeBarWidth * getAlpha(tic)
        ).toString()}px;"></span>`
      }
    }
    if (timeBarWidth * (subTic / this._timeBarSecondsSpan!) >= 3.0) {
      for (tic = getStartTic(subTic); tic <= endTime; tic = getNextTic(tic, subTic)) {
        tics += `<span class="cesium-timeline-ticSub" style="left: ${Math.round(
          timeBarWidth * getAlpha(tic)
        ).toString()}px;"></span>`
      }
    }
    if (timeBarWidth * (mainTic / this._timeBarSecondsSpan!) >= 2.0) {
      this._mainTicSpan = mainTic
      endTime += mainTic
      tic = getStartTic(mainTic)
      const leapSecond = JulianDate.computeTaiMinusUtc(epochJulian)
      while (tic <= endTime) {
        let ticTime = JulianDate.addSeconds(startJulian!, tic - startTime, new JulianDate())
        if (mainTic > 2.1) {
          const ticLeap = JulianDate.computeTaiMinusUtc(ticTime)
          if (Math.abs(ticLeap - leapSecond) > 0.1) {
            tic += ticLeap - leapSecond
            ticTime = JulianDate.addSeconds(startJulian!, tic - startTime, new JulianDate())
          }
        }
        const ticLeft = Math.round(timeBarWidth * getAlpha(tic))
        const ticLabel = this.makeLabel(ticTime)
        this._rulerEle.innerHTML = ticLabel
        textWidth = this._rulerEle.offsetWidth
        if (textWidth < 10) {
          // IE iframe fullscreen sampleWidth workaround, continued.
          textWidth = sampleWidth
        }
        const labelLeft = ticLeft - (textWidth / 2 - 1)
        if (labelLeft > lastTextLeft) {
          lastTextLeft = labelLeft + textWidth + 5
          tics +=
            `<span class="cesium-timeline-ticMain" style="left: ${ticLeft.toString()}px;"></span>` +
            `<span class="cesium-timeline-ticLabel" style="left: ${labelLeft.toString()}px;">${ticLabel}</span>`
        } else {
          tics += `<span class="cesium-timeline-ticSub" style="left: ${ticLeft.toString()}px;"></span>`
        }
        tic = getNextTic(tic, mainTic)
      }
    } else {
      this._mainTicSpan = -1
    }

    tics += `<span class="cesium-timeline-icon16" style="left:${scrubX}px;bottom:0;background-position: 0 0;"></span>`
    timeBar.innerHTML = tics
    this._scrubElement = timeBar.lastChild as HTMLDivElement

    // Clear track canvas.
    this._context.clearRect(0, 0, this._trackListEle.width, this._trackListEle.height)

    renderState.y = 0
    this._trackList.forEach((track) => {
      track.render(widget._context, renderState)
      renderState.y += track.height
    })
  }

  /**
   * @private
   */
  updateFromClock() {
    this._scrubJulian = this._clock.currentTime
    const scrubElement = this._scrubElement
    if (defined(this._scrubElement)) {
      const seconds = JulianDate.secondsDifference(this._scrubJulian, this._startJulian!)
      const xPos = Math.round((seconds * this._topDiv.clientWidth) / this._timeBarSecondsSpan!)
      if (this._lastXPos !== xPos) {
        this._lastXPos = xPos

        scrubElement!.style.left = `${xPos - 8}px`
        this._needleEle.style.left = `${xPos}px`
      }
    }
    if (defined(this._timelineDragLocation)) {
      this._setTimeBarTime(
        this._timelineDragLocation,
        (this._timelineDragLocation * this._timeBarSecondsSpan!) / this._topDiv.clientWidth
      )

      this.zoomTo(
        JulianDate.addSeconds(this._startJulian!, this._timelineDrag, new JulianDate()),
        JulianDate.addSeconds(this._endJulian!, this._timelineDrag, new JulianDate())
      )
    }
  }

  /**
   * @private
   */
  _setTimeBarTime(xPos: number, seconds: number) {
    xPos = Math.round(xPos)
    this._scrubJulian = JulianDate.addSeconds(this._startJulian!, seconds, new JulianDate())
    if (this._scrubElement) {
      const scrubX = xPos - 8
      this._scrubElement.style.left = `${scrubX.toString()}px`
      this._needleEle.style.left = `${xPos.toString()}px`
    }

    const evt = document.createEvent("Event") as any
    evt.initEvent("settime", true, true)
    evt.clientX = xPos
    evt.timeSeconds = seconds
    evt.timeJulian = this._scrubJulian
    evt.clock = this._clock
    this._topDiv.dispatchEvent(evt)
  }

  /**
   * Resizes the widget to match the container size.
   */
  resize() {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    if (width === this._lastWidth && height === this._lastHeight) {
      return
    }

    this._trackContainer.style.height = `${height}px`

    let trackListHeight = 1
    this._trackList.forEach((track) => {
      trackListHeight += track.height
    })
    this._trackListEle.style.height = `${trackListHeight.toString()}px`
    this._trackListEle.width = this._trackListEle.clientWidth
    this._trackListEle.height = trackListHeight
    this._makeTics()

    this._lastXPos = undefined
    this._lastWidth = width
    this._lastHeight = height
  }
}

const twoDigits = (num: number) => {
  return num < 10 ? `0${num.toString()}` : num.toString()
}

const createMouseDownCallback = (timeline: ImprovedTimeline) => {
  return (e: any) => {
    if (timeline._mouseMode !== timelineMouseMode.touchOnly) {
      if (e.button === 0) {
        timeline._mouseMode = timelineMouseMode.scrub
        if (timeline._scrubElement) {
          timeline._scrubElement.style.backgroundPosition = "-16px 0"
        }
        timeline._onMouseMove(e)
      } else {
        timeline._mouseX = e.clientX
        if (e.button === 2) {
          timeline._mouseMode = timelineMouseMode.zoom
        } else {
          timeline._mouseMode = timelineMouseMode.slide
        }
      }
    }
    e.preventDefault()
  }
}

const createMouseUpCallback = (timeline: ImprovedTimeline) => {
  return (_: any) => {
    timeline._mouseMode = timelineMouseMode.none
    if (timeline._scrubElement) {
      timeline._scrubElement.style.backgroundPosition = "0 0"
    }
    timeline._timelineDrag = 0
    timeline._timelineDragLocation = undefined
  }
}

const createMouseMoveCallback = (timeline: ImprovedTimeline) => {
  return (e: any) => {
    let dx
    const rect = timeline._scene.canvas.getBoundingClientRect()
    const scaleX = rect.width / timeline._scene.canvas.width
    if (timeline._mouseMode === timelineMouseMode.scrub) {
      e.preventDefault()
      const x = (e.clientX - timeline._topDiv.getBoundingClientRect().left) / scaleX
      if (x < 0) {
        timeline._timelineDragLocation = 0
        timeline._timelineDrag = -0.01 * timeline._timeBarSecondsSpan!
      } else if (x > timeline._topDiv.clientWidth) {
        timeline._timelineDragLocation = timeline._topDiv.clientWidth
        timeline._timelineDrag = 0.01 * timeline._timeBarSecondsSpan!
      } else {
        timeline._timelineDragLocation = undefined
        timeline._setTimeBarTime(x, (x * timeline._timeBarSecondsSpan!) / timeline._topDiv.clientWidth)
      }
    } else if (timeline._mouseMode === timelineMouseMode.slide) {
      dx = timeline._mouseX - e.clientX
      timeline._mouseX = e.clientX
      if (dx !== 0) {
        const dsec = (dx * timeline._timeBarSecondsSpan!) / timeline._topDiv.clientWidth
        timeline.zoomTo(
          JulianDate.addSeconds(timeline._startJulian!, dsec, new JulianDate()),
          JulianDate.addSeconds(timeline._endJulian!, dsec, new JulianDate())
        )
      }
    } else if (timeline._mouseMode === timelineMouseMode.zoom) {
      dx = timeline._mouseX - e.clientX
      timeline._mouseX = e.clientX
      if (dx !== 0) {
        timeline.zoomFrom(Math.pow(1.01, dx))
      }
    }
  }
}

const createMouseWheelCallback = (timeline: ImprovedTimeline) => {
  return (e: any) => {
    let dy = e.wheelDeltaY || e.wheelDelta || -e.detail
    timelineWheelDelta = Math.max(Math.min(Math.abs(dy), timelineWheelDelta), 1)
    dy /= timelineWheelDelta
    timeline.zoomFrom(Math.pow(1.05, -dy))
  }
}

const createTouchStartCallback = (timeline: ImprovedTimeline) => {
  return (e: any) => {
    const len = e.touches.length
    let seconds, xPos
    const leftX = timeline._topDiv.getBoundingClientRect().left
    e.preventDefault()
    timeline._mouseMode = timelineMouseMode.touchOnly
    if (len === 1) {
      seconds = JulianDate.secondsDifference(timeline._scrubJulian, timeline._startJulian!)
      xPos = Math.round((seconds * timeline._topDiv.clientWidth) / timeline._timeBarSecondsSpan! + leftX)
      if (Math.abs(e.touches[0].clientX - xPos) < 50) {
        timeline._touchMode = timelineTouchMode.scrub
        if (timeline._scrubElement) {
          timeline._scrubElement.style.backgroundPosition = len === 1 ? "-16px 0" : "0 0"
        }
      } else {
        timeline._touchMode = timelineTouchMode.singleTap
        timeline._touchState.centerX = e.touches[0].clientX - leftX
      }
    } else if (len === 2) {
      timeline._touchMode = timelineTouchMode.slideZoom
      timeline._touchState.centerX = (e.touches[0].clientX + e.touches[1].clientX) * 0.5 - leftX
      timeline._touchState.spanX = Math.abs(e.touches[0].clientX - e.touches[1].clientX)
    } else {
      timeline._touchMode = timelineTouchMode.ignore
    }
  }
}

const createTouchEndCallback = (timeline: ImprovedTimeline) => {
  return (e: any) => {
    const len = e.touches.length,
      leftX = timeline._topDiv.getBoundingClientRect().left
    if (timeline._touchMode === timelineTouchMode.singleTap) {
      timeline._touchMode = timelineTouchMode.scrub
      timeline._onTouchMove(e)
    } else if (timeline._touchMode === timelineTouchMode.scrub) {
      timeline._onTouchMove(e)
    }
    timeline._mouseMode = timelineMouseMode.touchOnly
    if (len !== 1) {
      timeline._touchMode = len > 0 ? timelineTouchMode.ignore : timelineTouchMode.none
    } else if (timeline._touchMode === timelineTouchMode.slideZoom) {
      timeline._touchState.centerX = e.touches[0].clientX - leftX
    }
    if (timeline._scrubElement) {
      timeline._scrubElement.style.backgroundPosition = "0 0"
    }
  }
}

const createTouchMoveCallback = (timeline: ImprovedTimeline) => {
  return (e: any) => {
    let dx,
      x,
      len,
      newCenter,
      newSpan,
      newStartTime,
      zoom = 1
    const leftX = timeline._topDiv.getBoundingClientRect().left
    if (timeline._touchMode === timelineTouchMode.singleTap) {
      timeline._touchMode = timelineTouchMode.slideZoom
    }
    timeline._mouseMode = timelineMouseMode.touchOnly
    if (timeline._touchMode === timelineTouchMode.scrub) {
      e.preventDefault()
      if (e.changedTouches.length === 1) {
        x = e.changedTouches[0].clientX - leftX
        if (x >= 0 && x <= timeline._topDiv.clientWidth) {
          timeline._setTimeBarTime(x, (x * timeline._timeBarSecondsSpan!) / timeline._topDiv.clientWidth)
        }
      }
    } else if (timeline._touchMode === timelineTouchMode.slideZoom) {
      len = e.touches.length
      if (len === 2) {
        newCenter = (e.touches[0].clientX + e.touches[1].clientX) * 0.5 - leftX
        newSpan = Math.abs(e.touches[0].clientX - e.touches[1].clientX)
      } else if (len === 1) {
        newCenter = e.touches[0].clientX - leftX
        newSpan = 0
      }

      if (defined(newCenter)) {
        if (newSpan! > 0 && timeline._touchState.spanX > 0) {
          // Zoom and slide
          zoom = timeline._touchState.spanX / newSpan!
          newStartTime = JulianDate.addSeconds(
            timeline._startJulian!,
            (timeline._touchState.centerX * timeline._timeBarSecondsSpan! -
              newCenter * timeline._timeBarSecondsSpan! * zoom) /
              timeline._topDiv.clientWidth,
            new JulianDate()
          )
        } else {
          // Slide to newCenter
          dx = timeline._touchState.centerX - newCenter
          newStartTime = JulianDate.addSeconds(
            timeline._startJulian!,
            (dx * timeline._timeBarSecondsSpan!) / timeline._topDiv.clientWidth,
            new JulianDate()
          )
        }

        timeline.zoomTo(
          newStartTime,
          JulianDate.addSeconds(newStartTime, timeline._timeBarSecondsSpan! * zoom, new JulianDate())
        )
        timeline._touchState.centerX = newCenter
        timeline._touchState.spanX = newSpan!
      }
    }
  }
}
