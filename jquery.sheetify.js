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
(function(window) {
    'use strict';

    var $ = window.jQuery;

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
            message: undefined,
			hideAfterMillis:0
        }, options );

		var target = this;

        switch( options.command ) {

            case REMOVE_COMMAND:
				$(target).children('.' + SHEETIFY_CSS_CONTAINER_CLASS).remove();
                break;
            default:
                // Remove any sheets from the current element
                $(target).sheetify({command:REMOVE_COMMAND});

                var border = {
                    t: parseNumberOrDefaultValue( target.css( 'border-top' ), 0 ),
                    b: parseNumberOrDefaultValue( target.css( 'border-bottom' ), 0 ),
                    l: parseNumberOrDefaultValue( target.css( 'border-left' ), 0 ),
                    r: parseNumberOrDefaultValue( target.css( 'border-right' ), 0 )
                };
                var h = parseNumberOrDefaultValue( target.innerHeight(true), 0 ),
                    w = parseNumberOrDefaultValue( target.innerWidth(false), 0 ),
                    l = parseNumberOrDefaultValue( target.offset().left + border.l, 0 ),
                    t = parseNumberOrDefaultValue( target.offset().top + border.t, 0 ),
                    r = parseNumberOrDefaultValue( l+w+border.r, 0 ),
                    b = parseNumberOrDefaultValue( t+h+ border.b, 0 ),
                    z = parseNumberOrDefaultValue( target.css( 'z-index' ), 1 );

                var sheet = createSheet( h, w, l, t, r, b, z );

				target.append(sheet);

                // Keeps the sheet's offset in sync with the target's offset.
                initTargetOffsetMirroring(target, sheet);

                // Render prompt text if input provided.
                if( options.message!==null&&options.message!==undefined ) {
                    var prompt = createPrompt();
                    sheet.append( prompt );
                    prompt.css( 'left', (target.innerWidth()-prompt.outerWidth(true))/2 );
                    prompt.css( 'top', (target.innerHeight()-prompt.outerHeight(true))/2 );
                }

				// If options.hideAfterMillis is greater than zero, we're going to invoke 'remove' command in that
				// amount of milliseconds after showing the sheet.
				if (options.hideAfterMillis>0) {
					setTimeout(function (){
						$(target).sheetify({command:REMOVE_COMMAND});
					}, options.hideAfterMillis);
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

        function initTargetOffsetMirroring($target, $sheet) {
            $target.resize(function() {
                $sheet.offset($target.offset());
            });
            $(window).resize(function() {
                $sheet.offset($target.offset());
            });
            $sheet.offset(target.offset());
        }

        function createPrompt() {
            var p =$( '<span></span>' ).html( options.message );
            p.addClass( SHEETIFY_CSS_PROMPT_CLASS );
            p.css( 'position', 'relative' );
            p.css( 'display', 'inline-block' );
            p.css( 'margin', 'auto auto' );
            p.css( 'line-height', '1.2em' );
            return p;
        }
    };

})(window);