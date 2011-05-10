/**
 * These Days jQuery Slideshow Plugin v1.0
 * @link http://playground.thesedays.com/tdslideshow/
 * @author Keegan Street
 */
(function($) {

	var init, gotoSlide, doTransition, publicMethods, css3 = window.Modernizr && window.Modernizr.csstransitions;

	// Initialise plugin
	init = function(options) {
		var defaults = {
			timeout: 2000,
			speed: 1000,
			fastSpeed: 100,
			beforeTransition: null,
			currentClass: "current"
		};
		return this.each(function() {
			var $el = $(this), data = $el.data("tdslideshow");
			if (!data) {
				data = {};
				data.options = $.extend(defaults, options);
				data.$children = $el.children();
				data.currentIndex = 0;
				data.$current = data.$children.eq(0).addClass(data.options.currentClass);
				data.timeoutId = setTimeout(function() {
					doTransition($el);
				}, data.options.timeout);
				// Hide all images except first
				if (css3) {
					data.$current.siblings().css({'opacity': 0});
				} else {
					data.$current.siblings().hide();
				}
				// Attach the plugin data to the element
				$el.data("tdslideshow", data);
			}
		});
	};

	// Go directly to a slide
	gotoSlide = function(index) {
		return this.each(function() {
			doTransition($(this), index);
		});
	};

	// Show the next slide
	doTransition = function($el, nextIndex) {
		var data = $el.data("tdslideshow"), $next, speed, animationComplete;
		clearTimeout(data.timeoutId); // Stop any tdslideshow timers that are currently running on this element

		// Get next item
		if (typeof nextIndex === "number") {
			if (data.currentIndex === nextIndex) { return; } // Do not allow transitions from a slide to the same slide
			data.currentIndex = nextIndex;
			speed = data.options.fastSpeed;
			$el.addClass("fastSpeed");
		} else {
			data.currentIndex = data.$current.index() + 1;
			speed = data.options.speed;
			$el.removeClass("fastSpeed");
		}
		if (data.currentIndex >= data.$children.length) { data.currentIndex = 0; }
		$next = data.$children.eq(data.currentIndex);

		// Call optional callback before doing the animation
		if (typeof data.options.beforeTransition === "function") { data.options.beforeTransition.apply(this, [data.currentIndex]); }

		// Do animation
		data.$current.removeClass(data.options.currentClass);
		$next.addClass(data.options.currentClass);
		if (css3) { // Use CSS3 transitions if available
			$next.bind("transitionend oTransitionEnd webkitTransitionEnd", function() {
				$next.unbind("transitionend oTransitionEnd webkitTransitionEnd");
				animationComplete();
			});
			$next.css({opacity: 1});
		} else {
			$next.fadeIn(speed, function() { animationComplete(); });
		}

		// Callback for animation completion
		animationComplete = function() {
			if (css3) {
				data.$current.css({'opacity': 0});
			} else {
				data.$current.hide();
			}
			data.$current = $next;
			data.timeoutId = setTimeout(function() {
				doTransition($el);
			}, data.options.timeout);
			$el.data("tdslideshow", data);
		};
	};

	publicMethods = {
		init: init,
		gotoSlide: gotoSlide
	};

	$.fn.tdslideshow = function(method) {
		if (publicMethods[method]) {
			return publicMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === "object" || ! method) {
			return publicMethods.init.apply(this, arguments);
		} else {
			$.error("Method "+method+" does not exist on jQuery.tdslideshow");
		}
	};

}(jQuery));

