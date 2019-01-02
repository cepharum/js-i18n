/**
 * (c) 2019 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author: cepharum
 */

/**
 * @typedef {object<string,(string|Translations)>} Translations
 */

/**
 * Exposes filter function for replacing marker in provide template string with
 * values of additionally provided arguments.
 *
 * @param {string} template template string to be qualified
 * @param {*} args one of several arguments providing value to be injected into template
 * @returns {string} qualified string
 */
exports = module.exports = function( template, ...args ) {
	let cursor = 0;

	return String( template ).replace( /%([0 ._-])?(?:([1-9][0-9]*)(?:([.,])([0-9]+))?)?(?:\$(\d+))?([%sdfxX.])/g, ( all, fill, pre, sep, post, ref, marker ) => {
		let preValue = "";
		let postValue = "";

		switch ( marker ) {
			case "s" :
				preValue = String( ref == null ? args[cursor++] : args[parseInt( ref ) - 1] );
				break;

			case "d" :
				preValue = parseInt( ref == null ? args[cursor++] : args[parseInt( ref ) - 1] ).toString( 10 );
				break;

			case "X" :
			case "x" :
				preValue = parseInt( ref == null ? args[cursor++] : args[parseInt( ref ) - 1] ).toString( 16 );
				if ( marker === "X" ) {
					preValue = preValue.toUpperCase();
				}
				break;

			case "f" : {
				const value = String( parseFloat( ref == null ? args[cursor++] : args[parseInt( ref ) - 1] ).toFixed( Math.max( 0, post || 10 ) ) );
				const index = value.indexOf( "." );

				if ( index < 0 ) {
					preValue = value;
				} else {
					preValue = value.substring( 0, index );
					postValue = value.substring( index );
					if ( isNaN( post ) ) {
						postValue = postValue.replace( /0+$/, "" );
						if ( postValue === "." ) {
							postValue = "";
						}
					}

					if ( sep !== "." ) {
						postValue = sep + postValue.substring( 1 );
					}
				}
				break;
			}

			case "." :
				cursor++;
				return "";

			case "%" :
				return "%";
		}

		let preFill = "";
		let postFill = "";

		if ( pre > 0 ) {
			while ( preFill.length + preValue.length < pre ) {
				preFill += fill || " ";
			}
		}

		if ( post > 0 ) {
			while ( postFill.length + postValue.length <= post ) {
				postFill += " ";
			}
		}

		return preFill + preValue + postValue + postFill;
	} );
};
