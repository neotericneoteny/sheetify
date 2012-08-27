/*!
 * Sheetify is a jQuery plugin chiefly purposed to render a translucent sheet on top of any HTML DOM element.
 * The sheet's opacity level can range anywhere from fully opaque ({opacity:1}) to fully translucent ({opacity:0})
 * and the color of the sheet can be any valid CSS color value (e.g, hexadecimal, rgb).  Each sheet's styling may
 * be completely customized through CSS by targeting the provided CSS class name, 'neo-overlay-sheet'.  To override
 * the default CSS options, append '!important' in the stylesheet declaration for each style.
 *
 * Copyright (c) 2012 Matthew A. Zimmer,
 * http://neotericneoteny.com
 * 
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */
(function (window) {
	'use strict';

	var $ = window.jQuery;

	// CSS Class Names
	var SHEETIFY_CSS_CONTAINER_CLASS = 'neo-overlay-sheet';
	var SHEETIFY_CSS_PROMPT_CLASS = 'prompt';

	// Commands
	var REMOVE_COMMAND = 'remove';
	var COVER_COMMAND = 'cover';

	/**
	 * @param options An Object consisting of key/value pairs used to render a sheet overlay on top of the selector.
	 * As a convenience, passing a String instead of an Object will use the default sheet styles and render the
	 * provided text in the center fo the sheet.
	 */
	$.fn.sheetify = function (options) {
		var target = this;

		options = $.extend({
			command:COVER_COMMAND,
			color:'rgb(255,255,255)',
			opacity:0.75,
			altClassName:undefined, // One or more CSS classes separated by a single space
			message:arguments.length==1&&typeof(arguments[0])==='string'?arguments[0]:undefined,
			hideAfterMillis:0
		}, options);

		switch (options.command) {

			case REMOVE_COMMAND:
				$(target).children('.' + SHEETIFY_CSS_CONTAINER_CLASS).remove();
				break;
			default:
				// Remove any sheets from the current target
				$(target).sheetify({command:REMOVE_COMMAND});

				var prompt = null;
				var sheet = createSheet(target, options);
				target.append(sheet);

				// Render prompt text if input provided.
				if (options.message !== null && options.message !== undefined) {
					prompt = createPrompt();
					sheet.append(prompt);
					centerPrompt(prompt, target);
				}

				// Keeps the sheet's offset in sync with the target's offset.
				initTargetOffsetMirroring(target, sheet, prompt);


				// If options.hideAfterMillis is greater than zero, we're going to invoke 'remove' command in that
				// amount of milliseconds after showing the sheet.
				if (options.hideAfterMillis > 0) {
					setTimeout(function () {
						$(target).sheetify({command:REMOVE_COMMAND});
					}, options.hideAfterMillis);
				}
		}

		function parseNumberOrDefaultValue(source, defaultValue, fn) {
			fn = fn ? fn : parseFloat;
			return !isNaN(fn(source)) ? fn(source) : defaultValue;
		}

		function createSheet($target, $options) {
			var sheet = $('<div></div>');

			sheet.addClass(SHEETIFY_CSS_CONTAINER_CLASS);
			sheet.css('position', 'absolute');
			sheet.css('background-color', $options.color);
			sheet.css('opacity', $options.opacity);
			sheet.css('background-position', 'initial initial');
			sheet.css('background-repeat', 'initial initial');

			positionSheet(sheet, $target);

			if ($options.altClassName) {
				sheet.addClass($options.altClassName);
			}

			return sheet;
		}

		function positionSheet($sheet, $target) {
			var borders = getBorders($target);
			var dimensions = getDimensions($target);

			// If our target has a default position of 'static', we're going to assign it a
			// 'relative' position so we can position the sheet absolutely inside of the target's
			// coordinate plane.
			if(hasDefaultPositioning($target)) {
				$target.css('position', 'relative');
			}

			// If our target has a position of 'relative', we're going to position the sheet absolutely
			// inside of the target's coordinate plane.
			if(isRelativePositioned($target)) {
				if (dimensions.height !== undefined) {
					$sheet.css('height', 'auto');
				}
				if (dimensions.width !== undefined) {
					$sheet.css('width', 'auto');
				}
				if (dimensions.left !== undefined) {
					$sheet.css('left', 0);
				}
				if (dimensions.top !== undefined) {
					$sheet.css('top', 0);
				}
				if (dimensions.right !== undefined) {
					$sheet.css('right', 0);
				}
				if (dimensions.bottom !== undefined) {
					$sheet.css('bottom', 0);
				}
				if (dimensions.zIndex !== undefined) {
					$sheet.css('z-index', dimensions.zIndex * 1000);
				}

			// The target has a position other than relative so we're going to have to position
			// the sheet in the global coordinate plane.
			} else {
				if (dimensions.height !== undefined) {
					$sheet.css('height', dimensions.height);
				}
				if (dimensions.width !== undefined) {
					$sheet.css('width', dimensions.width);
				}
				if (dimensions.left !== undefined) {
					$sheet.css('left', dimensions.left);
				}
				if (dimensions.top !== undefined) {
					$sheet.css('top', dimensions.top);
				}
				if (dimensions.right !== undefined) {
					$sheet.css('right', dimensions.right);
				}
				if (dimensions.bottom !== undefined) {
					$sheet.css('bottom', dimensions.bottom);
				}
				if (dimensions.zIndex !== undefined) {
					$sheet.css('z-index', dimensions.zIndex * 999999);
				}
			}
		}

		function createPrompt() {
			var p = $('<span></span>').html(options.message);
			p.addClass(SHEETIFY_CSS_PROMPT_CLASS);
			p.css('position', 'relative');
			p.css('display', 'inline-block');
			p.css('margin', 'auto auto');
			p.css('line-height', '1.2em');
			p.css('font-size', '1em');
			p.css('color', '#121212');
			return p;
		}

		/**
		 * Listens for the window's 'resize' event and repositions the sheet and prompt accordingly.  This function
		 * also listens for the 'resize' event on our target object, however, due to jQuery's limitation of only
		 * listening to the 'resize' event on the window object the callback will never be called.
		 *
		 * Fortunately, Ben Alman wrote a sweet plugin which accommodates this need.  If your site needs this
		 * functionality, download Ben's plugin and everything will work as expected.
		 *
		 * jquery-resize-plugin - http://benalman.com/projects/jquery-resize-plugin/
		 *
		 * @param $target
		 * @param $sheet
		 * @param $prompt
		 */
		function initTargetOffsetMirroring($target, $sheet, $prompt) {
			// Listen for window's 'resize' event and reposition the sheet and prompt accordingly.
			$(window).resize(function () {
				positionSheet($sheet, $target);
				centerPrompt($prompt, $target);
			});

			// If Ben Alman's jquery-resize-plugin is activated alongside this plugin, the following 'resize' tracking
			// code will work as expected.
			$($target).resize(function () {
				positionSheet($sheet, $target);
				centerPrompt($prompt, $target);
			});

			positionSheet($sheet, $target);
			centerPrompt($prompt, $target);
		}

		function centerPrompt($prompt, $target) {
			$prompt.css('left', ($target.innerWidth() - $prompt.outerWidth(true)) / 2);
			$prompt.css('top', ($target.innerHeight() - $prompt.outerHeight(true)) / 2);
		}

		function getDimensions($target) {
			var border = getBorders($target),
				height = parseNumberOrDefaultValue($target.innerHeight(), 0),
				width = parseNumberOrDefaultValue($target.innerWidth(), 0),
				left = parseNumberOrDefaultValue($target.offset().left + border.left, 0),
				top = parseNumberOrDefaultValue($target.offset().top + border.top, 0),
				right = parseNumberOrDefaultValue(left+width, 0),
				bottom = parseNumberOrDefaultValue(top+height, 0),
				zIndex = parseNumberOrDefaultValue($target.css('z-index'), 1);

			return {
				height:height,
				width:width,
				left:left,
				top:top,
				right:right,
				bottom:bottom,
				zIndex:zIndex
			};
		}

		function getBorders($target) {
			return {
				top:parseNumberOrDefaultValue($target.css('border-top'), 0),
				bottom:parseNumberOrDefaultValue($target.css('border-bottom'), 0),
				left:parseNumberOrDefaultValue($target.css('border-left'), 0),
				right:parseNumberOrDefaultValue($target.css('border-right'), 0)
			};
		}

		function isRelativePositioned($target) {
			return $target.css('position') === 'relative';
		}

		function hasDefaultPositioning($target) {
			return $target.css('position') === 'static';
		}
	};

})(window);