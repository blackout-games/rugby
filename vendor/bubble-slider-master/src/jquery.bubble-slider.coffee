###!
# Bubble Slider
# https://github.com/dahjson/bubble-slider
# Copyright (c) Daniel Johnson
###

(($) -> # avoid conflicts with $

  class BubbleSlider

    constructor: (@element, options) ->

      # hide input field
      @element.hide()

      # get input field settings
      @min = @element.attr('min') ? options.min
      @max = @element.attr('max') ? options.max
      @step = @element.attr('step') ? options.step
      @value = @element.attr('value') ? (options.max - options.min) / 2 + options.min
      @decimals = @element.data('decimals') ? options.decimals
      @prefix = @element.data('prefix') ? options.prefix
      @postfix = @element.data('postfix') ? options.postfix
      @toggleBubble = @element.data('toggle-bubble') ? options.toggleBubble
      @toggleLimit = @element.data('toggle-limit') ? options.toggleLimit
      @bubbleColor = @element.data('bubble-color') ? options.bubbleColor
      @bubbleFontScale = @element.data('bubble-font-scale') ? options.bubbleFontScale
      @bubbleFontColor = @element.data('bubble-font-color') ? options.bubbleFontColor
      @thumbScale = @element.data('thumb-scale') ? options.thumbScale
      @thumbColor = @element.data('thumb-color') ? options.thumbColor
      @thumbFontScale = @element.data('thumb-font-scale') ? options.thumbFontScale
      @thumbFontColor = @element.data('thumb-font-color') ? options.thumbFontColor
      @trackScale = @element.data('track-scale') ? options.trackScale
      @trackColor = @element.data('track-color') ? options.trackColor

      # convert strings to numbers
      @min = parseFloat(@removeCommas(@min))
      @max = parseFloat(@removeCommas(@max))
      @step = parseFloat(@removeCommas(@step))
      @value = parseFloat(@removeCommas(@value))
      @decimals = parseFloat(@removeCommas(@decimals))
      @toggleLimit = parseFloat(@removeCommas(@toggleLimit))
      @bubbleFontScale = parseFloat(@removeCommas(@bubbleFontScale))
      @thumbScale = parseFloat(@removeCommas(@thumbScale))
      @thumbFontScale = parseFloat(@removeCommas(@thumbFontScale))
      @trackScale = parseFloat(@removeCommas(@trackScale))

      # create slider elements
      @slider = $('<div>').addClass('bubble-slider-wrap').insertAfter(@element)
      @minus = $('<div><span>-</span></div>').addClass('bubble-slider-minus').appendTo(@slider)
      @plus = $('<div><span>+</span></div>').addClass('bubble-slider-plus').appendTo(@slider)
      @track = $('<div>').addClass('bubble-slider-track').appendTo(@slider)
      @thumb = $('<div><span>').addClass('bubble-slider-thumb').appendTo(@track)
      @bubble = $('<div><span>').addClass('bubble-slider-bubble').appendTo(@thumb)
      @bubbleArrow = $('<div>').addClass('bubble-slider-bubble-arrow').prependTo(@bubble)

      # span elements
      @thumbSpan = @thumb.find('span').first()
      @bubbleSpan = @bubble.find('span').first()

      # size and scale elements
      if @bubbleFontScale != 1
        @bubble.css(
          'font-size': parseFloat(@bubble.css('font-size')) * @bubbleFontScale + 'px'
          'border-radius': parseFloat(@bubble.css('border-radius')) * @bubbleFontScale + 'px'
        )
        @bubbleArrow.css(
          'width': parseFloat(@bubbleArrow.css('width')) * @bubbleFontScale + 'px'
          'height': parseFloat(@bubbleArrow.css('height')) * @bubbleFontScale + 'px'
        )

      if @thumbScale != 1
        @thumb.css(
          'width': parseFloat(@thumb.css('width')) * @thumbScale + 'px'
          'height': parseFloat(@thumb.css('height')) * @thumbScale + 'px'
        )

      if @thumbFontScale != 1
        @thumbSpan.css(
          'font-size': parseFloat(@thumbSpan.css('font-size')) * @thumbFontScale + 'px'
        )

      if @trackScale != 1
        @minus.css(
          'width': Math.round(parseFloat(@minus.css('width')) * @trackScale) + 'px'
          'height': Math.round(parseFloat(@minus.css('height')) * @trackScale) + 'px'
          'font-size': Math.round(parseFloat(@minus.css('font-size')) * @trackScale) + 'px'
        )
        @plus.css(
          'width': Math.round(parseFloat(@plus.css('width')) * @trackScale) + 'px'
          'height': Math.round(parseFloat(@plus.css('height')) * @trackScale) + 'px'
          'font-size': Math.round(parseFloat(@plus.css('font-size')) * @trackScale) + 'px'
        )
        @track.css(
          'left': parseFloat(@minus.outerWidth()) + (@minus.outerWidth() * 0.2) + 'px'
          'right': parseFloat(@plus.outerWidth()) + (@plus.outerWidth()* 0.2) + 'px'
        )

      # adjust margin spacing
      if @bubbleFontScale != 1 or @thumbScale != 1 or @trackScale != 1
        trackHeight = if @thumb.outerHeight() > @plus.outerHeight() then @thumb.outerHeight() else @plus.outerHeight()
        bubbleHeight = @bubble.outerHeight()
        @slider.css(
          'margin': parseFloat(trackHeight) + parseFloat(bubbleHeight) + 'px auto'
        )

      # colorize elements
      if @bubbleColor
        @bubbleArrow.css('background', @bubbleColor)
        @bubble.css('background', @bubbleColor)
      if @bubbleFontColor
        @bubbleSpan.css('color', @bubbleFontColor)
      if @thumbColor
        @minus.css('color', @thumbColor)
        @plus.css('color', @thumbColor)
        @thumb.css('background', @thumbColor)
      if @thumbFontColor
        @thumbSpan.css('color', @thumbFontColor)
      if @trackColor
        @minus.css('border-color', @trackColor)
        @plus.css('border-color', @trackColor)
        @track.css('background', @trackColor)

      # other initial settings
      @dragging = false
      @thumbOffset = @thumb.outerWidth() / 2

      # set number value and thumb position
      @setValue(@value)
      @positionThumb(@value)

      # set initial bubble state
      if @toggleBubble and @value.toString().length <= @toggleLimit
        @bubble.hide()
        @thumbSpan.show()
      else
        @thumbSpan.hide()

      # disables default touch actions for IE on thumb
      @thumb.css('-ms-touch-action', 'none')

      # thumb events (mouse and touch)
      @thumb.on 'mousedown touchstart', (event) =>
        if not @dragging
          event.preventDefault()
          @dragging = true
          @bubbleState(true)
      $('html')
        .on 'mousemove touchmove', (event) =>
          if @dragging
            event.preventDefault()
            if event.type is 'touchmove'
              @dragThumb(event.originalEvent.touches[0].pageX)
            else
              @dragThumb(event.originalEvent.pageX)
        .on 'mouseup touchend', (event) =>
          if @dragging
            event.preventDefault()
            @dragging = false
            @bubbleState(false)

      # minus button
      @minus.on 'click', (event) =>
        event.preventDefault()
        newValue = @value - @step
        newValue = Math.max(@min, newValue)
        @setValue(newValue)
        @positionThumb(newValue)

      # plus button
      @plus.on 'click', (event) =>
        event.preventDefault()
        newValue = @value + @step
        newValue = Math.min(@max, newValue)
        @setValue(newValue)
        @positionThumb(newValue)

      # adjust for window resize
      $(window).on 'resize onorientationchange', =>
        @positionThumb(@value)

    # drag slider thumb
    dragThumb: (pageX) ->
      minPosition = @track.offset().left + @thumbOffset
      maxPosition = @track.offset().left + @track.innerWidth() - @thumbOffset

      # find new position for thumb
      newPosition = Math.max(minPosition, pageX)
      newPosition = Math.min(maxPosition, newPosition)

      @setValue(@calcValue()) # set slider number

      # set the new thumb position
      @thumb.offset({
        left: newPosition - @thumbOffset
      })

    # calculate value for slider
    calcValue: ->
      trackRatio = @normalize(@thumb.position().left, 0, @track.innerWidth() - @thumbOffset * 2)
      trackRatio * (@max - @min) + @min

    # set new value for slider
    setValue: (value) ->
      @value = Math.round((value - @min) / @step) * @step + @min # find step value
      @element.val(@value) # update hidden input number
      modValue = @prefix + @addCommas(@value.toFixed(@decimals)) + @postfix # modified number value
      @thumbSpan.text(modValue) # update thumb number
      @bubbleSpan.text(modValue) # update bubble number

    # position the thumb
    positionThumb: (value) ->
      thumbRatio = @normalize(value, @min, @max)
      # set the new thumb position
      @thumb.offset(
        left: Math.round(thumbRatio * (@track.innerWidth() - @thumbOffset * 2) + @track.offset().left)
      )

    # toggle bubble on or off
    bubbleState: (state) ->
      if @toggleBubble
        if state
          @bubble.stop(true, true).fadeIn(300)
          @thumbSpan.stop(true, true).fadeOut(200)
        else if @value.toString().length <= @toggleLimit
          @bubble.stop(true, true).fadeOut(300)
          @thumbSpan.stop(true, true).fadeIn(200)

    # normalize number scaled 0 - 1
    normalize: (number, min, max) ->
      (number - min) / (max - min)

    # add commas to number
    addCommas: (num) ->
      num.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")

    # remove commas from number
    removeCommas: (num) ->
      num.toString().replace(/,/g, '')

  # jQuery plugin
  $.fn.bubbleSlider = (options) ->

    # default options for plugin
    defaults =
      min: 0
      max: 100
      step: 1
      value: 50
      decimals: 0
      prefix: ''
      postfix: ''
      toggleBubble: false
      toggleLimit: 3
      bubbleColor: ''
      bubbleFontScale: 1
      bubbleFontColor: ''
      thumbScale: 1
      thumbColor: ''
      thumbFontScale: 1
      thumbFontColor: ''
      trackScale: 1
      trackColor: ''

    # merge defaults with user defaults and options
    settings = $.extend({}, defaults, $.fn.bubbleSlider.defaults, options)

    # instantiate class instance
    new BubbleSlider($(this), settings)

  # execute code
  $ ->
    # attach to elements with class name
    $('.bubble-slider').each ->
      $(this).bubbleSlider()

) @jQuery
