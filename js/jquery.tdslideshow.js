/**
 * These Days jQuery Slideshow Plugin v1.0.2
 * @link http://playground.thesedays.com/tdslideshow/
 * @author Keegan Street
 */
(function ($) {

	var init, gotoSlide, stop, doTransition, publicMethods;

	// If you have already included Modernizr with a test for CSS Transitions, you can delete this line
	var Modernizr=function(a,b,c){function A(a,b){var c=a.charAt(0).toUpperCase()+a.substr(1),d=(a+" "+n.join(c+" ")+c).split(" ");return z(d,b)}function z(a,b){for(var d in a)if(k[a[d]]!==c)return b=="pfx"?a[d]:!0;return!1}function y(a,b){return!!~(""+a).indexOf(b)}function x(a,b){return typeof a===b}function w(a,b){return v(prefixes.join(a+";")+(b||""))}function v(a){k.cssText=a}var d="2.0.6",e={},f=!0,g=b.documentElement,h=b.head||b.getElementsByTagName("head")[0],i="modernizr",j=b.createElement(i),k=j.style,l,m=Object.prototype.toString,n="Webkit Moz O ms Khtml".split(" "),o={},p={},q={},r=[],s,t={}.hasOwnProperty,u;!x(t,c)&&!x(t.call,c)?u=function(a,b){return t.call(a,b)}:u=function(a,b){return b in a&&x(a.constructor.prototype[b],c)},o.csstransitions=function(){return A("transitionProperty")};for(var B in o)u(o,B)&&(s=B.toLowerCase(),e[s]=o[B](),r.push((e[s]?"":"no-")+s));v(""),j=l=null,e._version=d,e._domPrefixes=n,e.testProp=function(a){return z([a])},e.testAllProps=A,g.className=g.className.replace(/\bno-js\b/,"")+(f?" js "+r.join(" "):"");return e}(this,this.document);

	// Initialise plugin
	init = function (options) {
		var defaults = {
			timeout: 2000,
			speed: 1000,
			fastSpeed: 100,
			beforeTransition: null,
			currentClass: 'current'
		};
		return this.each(function () {
			var $el = $(this), data = $el.data('tdslideshow');
			if (!data) {
				data = {};
				data.animating = false;
				data.stopped = false;
				data.options = $.extend(defaults, options);
				data.$children = $el.children();
				data.currentIndex = 0;
				data.$current = data.$children.eq(0).addClass(data.options.currentClass);
				data.timeoutId = setTimeout(function () {
					doTransition($el);
				}, data.options.timeout);
				// Hide all images except first
				if (Modernizr.csstransitions) {
					data.$current.siblings().css({'opacity': 0});
				} else {
					data.$current.siblings().hide();
				}
				// Attach the plugin data to the element
				$el.data('tdslideshow', data);
			}
		});
	};

	// Go directly to a slide
	gotoSlide = function (index) {
		return this.each(function () {
			doTransition($(this), index);
		});
	};

	// Stop the slideshow
	stop = function () {
		return this.each(function () {
			var $el = $(this), data = $el.data('tdslideshow');
			if (!data || !data.timeoutId) {
				return;
			}
			data.stopped = true;
			clearTimeout(data.timeoutId);
			$el.data('tdslideshow', data);
		});
	};

	// Show the next slide
	doTransition = function ($el, nextIndex) {
		var data = $el.data('tdslideshow'), $next, speed, animationComplete;
		if (!data) { // Exit because element is removed from DOM
			return;
		}
		if (data.animating) { // Do not play two animations at the same time
			return;
		}
		data.animating = true;

		// Get next item
		if (typeof nextIndex === 'number') {
			if (data.currentIndex === nextIndex) { // Do not allow transitions from a slide to the same slide
				data.animating = false;
				return;
			}
			data.currentIndex = nextIndex;
			speed = data.options.fastSpeed;
			$el.addClass('fastSpeed');
		} else {
			data.currentIndex = data.$current.index() + 1;
			speed = data.options.speed;
			$el.removeClass('fastSpeed');
		}
		if (data.currentIndex >= data.$children.length) {
			data.currentIndex = 0;
		}
		$next = data.$children.eq(data.currentIndex);

		// Stop any tdslideshow timers that are currently running on this element
		clearTimeout(data.timeoutId);

		// Call optional callback before doing the animation
		if (typeof data.options.beforeTransition === 'function') {
			data.options.beforeTransition.apply(this, [data.currentIndex]);
		}

		// Do animation
		data.$current.removeClass(data.options.currentClass);
		$next.addClass(data.options.currentClass);
		if (Modernizr.csstransitions) { // Use CSS transitions if available
			$next.bind('transitionend oTransitionEnd webkitTransitionEnd', function () {
				$next.unbind('transitionend oTransitionEnd webkitTransitionEnd');
				animationComplete();
			});
			$next.css({opacity: 1});
		} else {
			$next.fadeIn(speed, function () {
				animationComplete();
			});
		}

		// Callback for animation completion
		animationComplete = function () {
			if (Modernizr.csstransitions) {
				data.$current.css({'opacity': 0});
			} else {
				data.$current.hide();
			}
			data.$current = $next;
			if (data.stopped) {
				delete data.timeoutId;
			} else {
				data.timeoutId = setTimeout(function () {
					doTransition($el);
				}, data.options.timeout);
			}
			data.animating = false;
			$el.data('tdslideshow', data);
		};
	};

	publicMethods = {
		init: init,
		gotoSlide: gotoSlide,
		stop: stop
	};

	$.fn.tdslideshow = function (method) {
		if (publicMethods[method]) {
			return publicMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return publicMethods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.tdslideshow');
		}
	};

}(jQuery));

