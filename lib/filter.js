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

const { Localization } = require( "./localization" );


/**
 * Exposes filter function e.g. for registration via `Vue.filter()`.
 *
 * @param {string} lookup some string to be looked up for matching translation
 * @param {int} number number of subjects to be described in requested translation
 * @param {string} genus explicitly required genus of translation
 * @returns {string} optionally translated string
 */
exports = module.exports = function( lookup, { number = null, genus = null } = {} ) {
	const locale = Localization.current;

	if ( locale ) {
		return locale.lookup( lookup, lookup, number, genus );
	}

	const match = Localization._ptnLookup.exec( lookup );

	return match[3] ? match[4] : lookup;
};
