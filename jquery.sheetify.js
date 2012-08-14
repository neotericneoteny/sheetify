/*!
 * Sheetify is a jQuery Plugin used to render a translucent sheet on top of any HTML DOM element.  The sheet's opacity
 * level can range anywhere from fully opaque ({opacity:1}) to fully translucent ({opacity:0}) and the color of the
 * sheet can be any valid CSS color value (e.g, hexadecimal, rgb).  Each sheet's styling may be completely customized
 * through CSS by targeting the provided CSS class name, 'neo-overlay-sheet'.  To override the default CSS options,
 * append '!important' in the stylesheet declaration for each style.
 *
 * Copyright (c) 2012 Matthew A. Zimmer,
 * http://neotericneoteny.com
 * 
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */
(function($) {
	'use strict';

	// CSS Class Names
	var SHEETIFY_CSS_CONTAINER_CLASS = 'neo-overlay-sheet';
	var SHEETIFY_CSS_PROMPT_CLASS = 'prompt';

	// Commands
	var REMOVE_COMMAND = 'remove';
	var COVER_COMMAND = 'cover';

	$.fn.sheetify = function( options ) {

		options = $.extend({
			command : COVER_COMMAND,
			color : 'rgb(255,255,255)',
			opacity : 0.75,
			altClassName: undefined,
			message: undefined
		}, options );

		switch( options.command ) {

			case REMOVE_COMMAND:
				$( this ).children( '.'+SHEETIFY_CSS_CONTAINER_CLASS ).remove();
				break;
			default:
				// Remove any sheets from the current element
				$(this ).sheetify({command:REMOVE_COMMAND});

				var border = {
					t: parseNumberOrDefaultValue( this.css( 'border-top' ), 0 ),
					b: parseNumberOrDefaultValue( this.css( 'border-bottom' ), 0 ),
					l: parseNumberOrDefaultValue( this.css( 'border-left' ), 0 ),
					r: parseNumberOrDefaultValue( this.css( 'border-right' ), 0 )
				};
				var h = parseNumberOrDefaultValue( this.innerHeight(), 0 ),
					w = parseNumberOrDefaultValue( this.innerWidth(), 0 ),
					l = parseNumberOrDefaultValue( this.offset().left + border.l, 0 ),
					t = parseNumberOrDefaultValue( this.offset().top + border.t, 0 ),
					r = parseNumberOrDefaultValue( l+w+border.r, 0 ),
					b = parseNumberOrDefaultValue( t+h+ border.b, 0 ),
					z = parseNumberOrDefaultValue( this.css( 'z-index' ), 1 );

				var sheet = createSheet( h, w, l, t, r, b, z );
				this.append( sheet );

				// Render prompt text if input provided.
				if( options.message!==null&&options.message!==undefined ) {
					var prompt = createPrompt();
					sheet.append( prompt );
					prompt.css( 'left', (this.innerWidth()-prompt.outerWidth(true))/2 );
					prompt.css( 'top', (this.innerHeight()-prompt.outerHeight(true))/2 );
				}
		}

		function parseNumberOrDefaultValue(source, defaultValue,fn) {
			fn = fn?fn:parseFloat;
			return !isNaN(fn(source))?fn(source):defaultValue;
		}

		function createSheet( h, w, l, t, r, b, z ) {
			var sheet = $( '<div></div>' );

			sheet.addClass( SHEETIFY_CSS_CONTAINER_CLASS );
			sheet.css( 'position', 'absolute' );
			sheet.css( 'background-color', options.color );
			sheet.css( 'opacity', options.opacity );
			sheet.css( 'background-position', 'initial initial' );
			sheet.css( 'background-repeat', 'initial initial' );

			if( h !== undefined ) {
				sheet.css( 'height', h );
			}
			if( w !== undefined ) {
				sheet.css( 'width', w );
			}
			if( l !== undefined ) {
				sheet.css( 'left', l );
			}
			if( t !== undefined ) {
				sheet.css( 'top', t );
			}
			if( r !== undefined ) {
				sheet.css( 'right', r );
			}
			if( b !== undefined ) {
				sheet.css( 'bottom', b );
			}
			if( z !== undefined ) {
				sheet.css( 'z-index', z );
			}

			if( options.altClassName ) {
				sheet.addClass( options.altClassName );
			}

			return sheet;
		}

		function createPrompt() {
			var p =$( '<span></span>' ).html( options.message );
			p.addClass( SHEETIFY_CSS_PROMPT_CLASS );
			p.css( 'position', 'relative' );
			p.css( 'display', 'inline-block' );
			p.css( 'margin', 'auto auto' );
			return p;
		}
	};

})(jQuery);