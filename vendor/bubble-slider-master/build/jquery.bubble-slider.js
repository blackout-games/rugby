/*!
 * Bubble Slider
 * https://github.com/dahjson/bubble-slider
 * Copyright (c) Daniel Johnson
 * 
 * Extended by Jeremy Bell - Blackout Entertainment
 */
(function(t) {
  var BubbleSlider;
  return BubbleSlider = function() {
    function slider(s, e) {
      var i, h, l, o, a, u, r, n, b, m, c, p, d, f, g, S, v, F, C, x;
      this.element = s;
      this.opts = e;
      this.element.hide(), this.min = null != (h = this.element.attr("min")) ? h : e.min, this.max = null != (l = this.element.attr("max")) ? l : e.max, this.step = null != (p = this.element.attr("step")) ? p : e.step, this.value = null != (d = this.element.attr("value")) ? d : (e.max - e.min) / 2 + e.min, this.decimals = null != (f = this.element.data("decimals")) ? f : e.decimals, this.prefix = null != (g = this.element.data("prefix")) ? g : e.prefix, this.postfix = null != (S = this.element.data("postfix")) ? S : e.postfix, this.toggleBubble = null != (v = this.element.data("toggle-bubble")) ? v : e.toggleBubble, this.toggleLimit = null != (F = this.element.data("toggle-limit")) ? F : e.toggleLimit, this.bubbleColor = null != (C = this.element.data("bubble-color")) ? C : e.bubbleColor, this.bubbleFontScale = null != (o = this.element.data("bubble-font-scale")) ? o : e.bubbleFontScale, this.bubbleFontColor = null != (a = this.element.data("bubble-font-color")) ? a : e.bubbleFontColor, this.thumbScale = null != (u = this.element.data("thumb-scale")) ? u : e.thumbScale, this.thumbColor = null != (r = this.element.data("thumb-color")) ? r : e.thumbColor, this.thumbFontScale = null != (n = this.element.data("thumb-font-scale")) ? n : e.thumbFontScale, this.thumbFontColor = null != (b = this.element.data("thumb-font-color")) ? b : e.thumbFontColor, this.trackScale = null != (m = this.element.data("track-scale")) ? m : e.trackScale, this.trackColor = null != (c = this.element.data("track-color")) ? c : e.trackColor, this.min = parseFloat(this.removeCommas(this.min)), this.max = parseFloat(this.removeCommas(this.max)), this.step = parseFloat(this.removeCommas(this.step)), this.value = parseFloat(this.removeCommas(this.value)), this.decimals = parseFloat(this.removeCommas(this.decimals)), this.toggleLimit = parseFloat(this.removeCommas(this.toggleLimit)), this.bubbleFontScale = parseFloat(this.removeCommas(this.bubbleFontScale)), this.thumbScale = parseFloat(this.removeCommas(this.thumbScale)), this.thumbFontScale = parseFloat(this.removeCommas(this.thumbFontScale)), this.trackScale = parseFloat(this.removeCommas(this.trackScale)), this.slider = t("<div>").addClass("bubble-slider-wrap").insertAfter(this.element), this.minus = t("<div><span>-</span></div>").addClass("bubble-slider-minus").appendTo(this.slider), this.plus = t("<div><span>+</span></div>").addClass("bubble-slider-plus").appendTo(this.slider), this.track = t("<div>").addClass("bubble-slider-track").appendTo(this.slider), this.visibleTrack = t("<div>").addClass("bubble-slider-track-inner").appendTo(this.track), this.thumb = t("<div><span>").addClass("bubble-slider-thumb").appendTo(this.track), this.bubble = t("<div><span>").addClass("bubble-slider-bubble").appendTo(this.thumb), this.bubbleArrow = t("<div>").addClass("bubble-slider-bubble-arrow").prependTo(this.bubble), this.thumbSpan = this.thumb.find("span").first(), this.bubbleSpan = this.bubble.find("span").first(), 1 !== this.bubbleFontScale && (this.bubble.css({
        "font-size": parseFloat(this.bubble.css("font-size")) * this.bubbleFontScale + "px",
        "border-radius": parseFloat(this.bubble.css("border-radius")) * this.bubbleFontScale + "px"
      }), this.bubbleArrow.css({
        width: parseFloat(this.bubbleArrow.css("width")) * this.bubbleFontScale + "px",
        height: parseFloat(this.bubbleArrow.css("height")) * this.bubbleFontScale + "px"
      })), 1 !== this.thumbScale && this.thumb.css({
        width: parseFloat(this.thumb.css("width")) * this.thumbScale + "px",
        height: parseFloat(this.thumb.css("height")) * this.thumbScale + "px"
      }), 1 !== this.thumbFontScale && this.thumbSpan.css({
        "font-size": parseFloat(this.thumbSpan.css("font-size")) * this.thumbFontScale + "px"
      }), 1 !== this.trackScale && (this.minus.css({
        width: Math.round(parseFloat(this.minus.css("width")) * this.trackScale) + "px",
        height: Math.round(parseFloat(this.minus.css("height")) * this.trackScale) + "px",
        "font-size": Math.round(parseFloat(this.minus.css("font-size")) * this.trackScale) + "px"
      }), this.plus.css({
        width: Math.round(parseFloat(this.plus.css("width")) * this.trackScale) + "px",
        height: Math.round(parseFloat(this.plus.css("height")) * this.trackScale) + "px",
        "font-size": Math.round(parseFloat(this.plus.css("font-size")) * this.trackScale) + "px"
      }), this.track.css({
        left: parseFloat(this.minus.outerWidth()) + 0.2 * this.minus.outerWidth() + "px",
        right: parseFloat(this.plus.outerWidth()) + 0.2 * this.plus.outerWidth() + "px",
      })), 1 === this.bubbleFontScale && 1 === this.thumbScale && 1 === this.trackScale || (x = this.thumb.outerHeight() > this.plus.outerHeight() ? this.thumb.outerHeight() : this.plus.outerHeight(), i = this.bubble.outerHeight(), this.slider.css({
        margin: parseFloat(x) + parseFloat(i) + "px auto"
      })), this.bubbleColor && (this.bubbleArrow.css("background", this.bubbleColor), this.bubble.css("background", this.bubbleColor)), this.bubbleFontColor && this.bubbleSpan.css("color", this.bubbleFontColor), this.thumbColor && (this.minus.css("color", this.thumbColor), this.plus.css("color", this.thumbColor), this.thumb.css("background", this.thumbColor)), this.thumbFontColor && this.thumbSpan.css("color", this.thumbFontColor), this.trackColor && (this.minus.css("border-color", this.trackColor), this.plus.css("border-color", this.trackColor), this.track.css("background", this.trackColor)), this.dragging = !1, this.thumbOffset = this.thumb.outerWidth() / 2, this.setValue(this.value), this.positionThumb(this.value), this.toggleBubble && this.value.toString().length <= this.toggleLimit ? (this.bubble.hide(), this.thumbSpan.show()) : this.thumbSpan.hide(), this.thumb.css("-ms-touch-action", "none"), this.thumb.on("mousedown touchstart", function(t) {
        return function(s) {
          return t.dragging ? void 0 : (s.preventDefault(), t.dragging = !0, t.bubbleState(!0));
        };
      }(this)), this.thumb.parent().parent().parent().on("mousemove touchmove", function(t) {
        return function(s) {
          return t.dragging ? (s.preventDefault(), "touchmove" === s.type ? t.dragThumb(s.originalEvent.touches[0].pageX) : t.dragThumb(s.originalEvent.pageX)) : void 0;
        };
      }(this)).on("mouseup touchend", function(t) {
        return function(s) {
          return t.dragging ? (s.preventDefault(), t.dragging = !1, t.bubbleState(!1)) : void 0;
        };
      }(this)), this.track.on("mousedown touchstart", function(t) {
        return function(s) {
          return !t.dragging ? (s.preventDefault(), "touchstart" === s.type ? t.dragThumb(s.originalEvent.touches[0].pageX) : t.dragThumb(s.originalEvent.pageX)) : void 0, t.setValue(t.calcValue());
        };
      }(this)), this.minus.on("mousedown touchstart", function(t) {
        return function(s) {
          var e;
          var update = function(){
            if(t.minus.data('isPressing')){
              var e = t.value - t.step;
              e = Math.max(t.min, e);
              t.setValue(e);
              t.positionThumb(e);
              window.setTimeout(update,70);
            }
          };
          window.setTimeout(update,500);
          t.minus.data('isPressing',true);
          return s.preventDefault(), e = t.value - t.step, e = Math.max(t.min, e), t.setValue(e), t.positionThumb(e);
        };
      }(this)), this.minus.on("mouseup touchend", function(t) {
        return function() {
          t.minus.data('isPressing',false);
        };
      }(this)), this.plus.on("mousedown touchstart", function(t) {
        return function(s) {
          var e;
          var update = function(){
            if(t.plus.data('isPressing')){
              var e = t.value + t.step;
              e = Math.min(t.max, e);
              t.setValue(e);
              t.positionThumb(e);
              window.setTimeout(update,70);
            }
          };
          window.setTimeout(update,500);
          t.plus.data('isPressing',true);
          return s.preventDefault(), s.stopPropagation(), e = t.value + t.step, e = Math.min(t.max, e), t.setValue(e), t.positionThumb(e);
        };
      }(this)), this.plus.on("mouseup touchend", function(t) {
        return function() {
          t.plus.data('isPressing',false);
        };
      }(this)), t(window).on("resize onorientationchange", function(t) {
        return function() {
          return t.positionThumb(t.value);
        };
      }(this));
    }
    return slider.prototype.dragThumb = function(t) {
      var s, e, i;
      return e = this.track.offset().left + this.thumbOffset, s = this.track.offset().left + this.track.innerWidth() - this.thumbOffset, i = Math.max(e, t), i = Math.min(s, i), this.setValue(this.calcValue()), this.thumb.offset({
        left: i - this.thumbOffset
      });
    }, slider.prototype.calcValue = function() {
      var t;
      return t = this.normalize(this.thumb.position().left, 0, this.track.innerWidth() - 2 * this.thumbOffset), t * (this.max - this.min) + this.min;
    }, slider.prototype.setValue = function(t) {
      var s;
      var val = Math.round((t - this.min) / this.step) * this.step + this.min;
      this.element.val(val);
      var hasChanged = false;
      if(this.value!==val){
        hasChanged = true;
      }
      if(this.opts.onInput && typeof(this.opts.onInput)==='function' && hasChanged){
        this.opts.onInput(val);
      }
      return this.value = val, this.element.val(this.value), s = this.prefix + this.addCommas(this.value.toFixed(this.decimals)) + this.postfix, this.thumbSpan.text(s), this.bubbleSpan.text(s);
    }, slider.prototype.positionThumb = function(t) {
      var s;
      return s = this.normalize(t, this.min, this.max), this.thumb.offset({
        left: Math.round(s * (this.track.innerWidth() - 2 * this.thumbOffset) + this.track.offset().left)
      });
    }, slider.prototype.bubbleState = function(t) {
      if (this.toggleBubble) {
        if (t){
          return this.bubble.stop(!0, !0).fadeIn(300), this.thumbSpan.stop(!0, !0).fadeOut(200);
        }
        if (this.value.toString().length <= this.toggleLimit){
          return this.bubble.stop(!0, !0).fadeOut(300), this.thumbSpan.stop(!0, !0).fadeIn(200);
        }
      }
    }, slider.prototype.normalize = function(t, s, e) {
      return (t - s) / (e - s);
    }, slider.prototype.addCommas = function(t) {
      return t.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }, slider.prototype.removeCommas = function(t) {
      return t.toString().replace(/,/g, "");
    }, slider;
  }(), t.fn.bubbleSlider = function(e) {
    var i, h;
    return i = {
      min: 0,
      max: 100,
      step: 1,
      value: 50,
      decimals: 0,
      prefix: "",
      postfix: "",
      toggleBubble: !1,
      toggleLimit: 3,
      bubbleColor: "",
      bubbleFontScale: 1,
      bubbleFontColor: "",
      thumbScale: 1,
      thumbColor: "",
      thumbFontScale: 1,
      thumbFontColor: "",
      trackScale: 1,
      trackColor: ""
    }, h = t.extend({}, i, t.fn.bubbleSlider.defaults, e), new BubbleSlider(t(this), h);
  }, t(function() {
    return t(".bubble-slider").each(function() {
      return t(this).bubbleSlider();
    });
  });
})($);