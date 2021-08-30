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
 * Matches locale identifier.
 *
 * @type {RegExp}
 */
const ptnLocale = /^\s*([a-z]{2,3})(?:[-_]([a-z]{2,3}))?(?:[@.]([a-z0-9-]+))?\s*$/i;


/**
 * Manages description of a single locale.
 */
class Locale {
	/**
	 * @param {string} locale identifier string of a locale
	 * @param {boolean} caseInsensitive if the identifier should be treated as case insensitive
	 */
	constructor( locale, caseInsensitive) {
		const match = ptnLocale.exec( caseInsensitive? locale.toLowerCase(): locale );
		if ( !match ) {
			throw new TypeError( "invalid locale identifier" );
		}

		const [ , _language, _region, _encoding ] = match;
		const language = _language? match[1].toLowerCase():_language;
		const region = _region?match[2].toLowerCase():_region;
		const encoding = _encoding?match[3].toLowerCase():_encoding;

		Object.defineProperties( this, {
			/**
			 * Provides tag of managed locale.
			 *
			 * @name Locale#tag
			 * @property {string}
			 * @readonly
			 */
			tag: { value: [
				language,
				region ? `-${region}` : "",
			].filter( i => i ).join( "" ) },

			/**
			 * Provides full tag of managed locale including its encoding.
			 *
			 * @name Localization#fullTag
			 * @property {string}
			 * @readonly
			 */
			fullTag: { value: [
				language,
				region ? `-${region}` : "",
				encoding ? `@${encoding}` : "",
			].filter( i => i ).join( "" ) },

			/**
			 * Provides language of managed locale.
			 *
			 * @name Localization#language
			 * @property {string}
			 * @readonly
			 */
			language: { value: language },

			/**
			 * Provides region of managed locale.
			 *
			 * @name Localization#region
			 * @property {?string}
			 * @readonly
			 */
			region: { value: region },

			/**
			 * Provides encoding to be used with locale.
			 *
			 * @name Localization#encoding
			 * @property {?string}
			 * @readonly
			 */
			encoding: { value: encoding || "utf8" },
		} );
	}

	/**
	 * Detects if a provided string is describing some locale.
	 *
	 * @param {string} locale string to be tested
	 * @return {boolean} true if string describes locale
	 */
	static isValidLocale( locale ) {
		return ptnLocale.test( locale );
	}

	/**
	 * Retrieves locale's identifier as its string-formatted representation.
	 *
	 * @return {string} locale's identifier
	 */
	toString() {
		return this.tag;
	}

	/**
	 * Detects if two provided locale descriptor address the same locale or not.
	 *
	 * @param {string|Locale} first first of two locales to compare with each other
	 * @param {string|Locale} second second of two locales to compare with each other
	 * @return {int} 0 if provided locales don't relate to each other,
	 *               1 if languages are equivalent w/o regards to any region selector,
	 *               2 if one of the locales is lacking region selector, but matches other locale by language,
	 *               3 if locales match exactly (also matching by region unless neither locale includes any region selector)
	 */
	static compare( first, second ) {
		if ( !first || !second ) {
			return 0;
		}

		let _first, _second;

		try {
			_first = first instanceof Locale ? first : new Locale( first );
			_second = second instanceof Locale ? second : new Locale( second );
		} catch( error ) {
			return 0;
		}

		if ( _first.language === _second.language ) {
			if ( _first.region && _second.region ) {
				return _first.region === _second.region ? 3 : 1;
			}

			return _first.region || _second.region ? 2 : 3;
		}

		return 0;
	}

	/**
	 * Provides list of accepted locales' identifiers.
	 *
	 * @return {string[]} list of accepted locales' identifiers
	 */
	static listAccepted() {
		let list;

		if ( typeof navigator === "undefined" ) {
			list = [process.env.LOCALE || "en"];
		} else if ( Array.isArray( navigator.languages ) ) {
			list = navigator.languages;
		} else {
			list = [navigator.language];
		}

		return list;
	}


	/**
	 * Localizes a property's value if it looks like a value providing different
	 * actual values per locale.
	 *
	 * @param {object<string,string>|*} value value to be localized
	 * @returns {string|*} localized or provided value
	 */
	selectLocalized( value ) {
		if ( typeof value === "object" && value && !Array.isArray( value ) ) {
			const locales = Object.keys( value );
			let wildcard = null;
			let fallback = null;

			for ( let li = 0, numLocales = locales.length; li < numLocales; li++ ) {
				const locale = locales[li].trim().toLowerCase();
				const match = ptnLocale.exec( locale );
				const [ , language, region, ] = match ? match : [];
				const normalized = match ? [ language, region ? `-${region}` : "", ].filter( i => i ).join( "" ) : locale;

				if ( normalized === this.tag ) {
					return value[locale];
				}

				switch ( normalized ) {
					case "*" :
					case "any" :
						wildcard = value[locale];
						break;

					case "en" :
						fallback = value[locale];
						break;
				}
			}

			return wildcard == null ? fallback == null ? value : fallback : wildcard;
		}

		return value;
	}
}

exports = module.exports = Locale;
