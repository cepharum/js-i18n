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
 * Maps either registered locale into its manager instance.
 *
 * @type {Map<string,Localization>}
 */
const locales = new Map();

/**
 * Refers to current locale's manager instance.
 *
 * @type {?Localization}
 */
let currentLocale = null;

/**
 * Matches lookup strings.
 *
 * @type {RegExp}
 */
const ptnLookup = /^(?:@?((?:[^\s.]+\.)*[^\s.]+))(\s*=\s*(.*))?$/;


/**
 * Implements localization by providing translations for a selected locale
 * matching hierarchical lookup keys.
 */
export class Localization {
	/**
	 * @param {Translations} tree initial tree-like set of translations to be managed
	 */
	constructor( tree ) {
		if ( !tree || typeof tree !== "object" || Array.isArray( tree ) ) {
			throw new TypeError( "invalid type of translations map" );
		}

		Object.defineProperties( this, {
			/**
			 * Exposes current locales tree of translations.
			 *
			 * @name Localization#tree
			 * @property {Translations}
			 * @readonly
			 */
			tree: { value: this.constructor.merge( {}, tree ) },
		} );
	}

	/**
	 * Fetches current locale implicitly selecting one.
	 *
	 * @return {Localization} current locale's manager
	 */
	static get current() {
		if ( currentLocale == null ) {
			let list = [process.env.LOCALE || "en"];

			if ( navigator ) {
				if ( Array.isArray( navigator.languages ) ) {
					list = navigator.languages;
				} else {
					list = [navigator.language];
				}
			}

			currentLocale = this.select( list );
		}

		return locales[currentLocale];
	}

	/**
	 * Retrieves manager instance for registered locale matching best locale(s)
	 * of provided selector.
	 *
	 * @param {string|string[]} selector one or more locales to be tested
	 * @returns {?Localization} found manager instance, null on missing any registered localization
	 */
	static select( selector ) {
		let match = null;
		const list = Array.isArray( selector ) ? selector : [selector];
		const numAccepted = list.length;

		for ( let i = 0; i < numAccepted; i++ ) {
			let accepted = null;
			let bestLevel = 0;

			for ( const [ key, value ] of locales ) {
				if ( match == null ) {
					// choose first available locale as fallback
					match = value;
				}

				const level = this.compare( list[i], key );
				if ( level > bestLevel ) {
					accepted = value;
					bestLevel = level;
				}
			}

			if ( accepted != null ) {
				match = accepted;
				break;
			}
		}

		return match;
	}

	/**
	 * Detects if a provided string is describing some locale.
	 *
	 * @param {string} locale string to be tested
	 * @return {boolean} true if string describes locale
	 */
	static isValidLocale( locale ) {
		return /^[a-z]{2,3}(?:[-_][a-zA-Z]{2,3})?/.test( locale );
	}

	/**
	 * Detects if two provided locale descriptor address the same locale or not.
	 *
	 * @param {string} first first of two locales to compare with each other
	 * @param {string} second second of two locales to compare with each other
	 * @return {int} 0 if provided locales don't relate to each other,
	 *               1 if languages are equivalent w/o regards to any region selector,
	 *               2 if one of the locales is lacking region selector, but matches other locale by language,
	 *               3 if locales match exactly (also matching by region unless neither locale includes any region selector)
	 */
	static compare( first, second ) {
		if ( !first || !second ) {
			return 0;
		}

		const _first = String( first ).toLowerCase().replace( /@.*$/, "" ).split( /[-_]/ );
		const _second = String( second ).toLowerCase().replace( /@.*$/, "" ).split( /[-_]/ );

		if ( _first[0] && _second[0] ) {
			if ( _first[0] === _second[0] ) {
				if ( _first[1] && _second[1] ) {
					return _first[1] === _second[1] ? 3 : 1;
				}

				return _first[1] || _second[1] ? 2 : 3;
			}
		}

		return 0;
	}

	/**
	 * Registers translations of another locale.
	 *
	 * @param {string} locale locale selector
	 * @param {Translations} translations tree of translations
	 * @returns {Localization} fluent interface
	 */
	static registerTranslations( locale, translations ) {
		if ( !this.isValidLocale( locale ) ) {
			throw new TypeError( "invalid locale" );
		}

		if ( locales.has( locale ) ) {
			throw new TypeError( `translations for locale ${locale} have been registered before` );
		}

		if ( !translations || typeof translations !== "object" || Array.isArray( translations ) ) {
			throw new TypeError( "invalid type of translations map" );
		}

		locales.set( locale, new this( translations ) );

		return this;
	}

	/**
	 * Merges provided tree of translations with internally managed one
	 * preferring entries in the former of those in the latter.
	 *
	 * @param {Translations} tree tree of translations to be merged
	 * @return {Localization} fluent interface
	 */
	updateTranslations( tree ) {
		this.constructor.merge( this.tree, tree );

		return this;
	}

	/**
	 * Merges provided tree of translations with all registered locale managers
	 * matching selected locale.
	 *
	 * @param {string} locale locale of provided tree of translations
	 * @param {Translations} tree tree of translations to be merged
	 * @return {Localization} fluent interface
	 */
	static updateTranslations( locale, tree ) {
		for ( const [ registeredLocale, manager ] of locales ) {
			if ( this.compare( locale, registeredLocale ) ) {
				this.merge( manager.tree, tree );
			}
		}

		return this;
	}

	/**
	 * Deeply merges elements of destination into source.
	 *
	 * @param {object} destination destination for merging into
	 * @param {object} source source to be merged
	 * @returns {object} merged tree as provided as destination
	 */
	static merge( destination, source ) {
		if ( source != null ) {
			switch ( typeof source ) {
				case "object" :
					if ( !Array.isArray( source ) ) {
						Object.keys( source )
							.forEach( key => {
								if ( key === "__proto__" ) {
									return;
								}

								if ( !key || /[.\s]/.test( key ) ) {
									throw new TypeError( `invalid key in tree of translations: ${key}` );
								}

								const value = source[key];

								switch ( typeof value ) {
									case "string" :
									case "number" :
									case "function" : {
										const existing = destination[key];
										if ( existing != null && typeof existing === "object" ) {
											throw new TypeError( "invalid scalar replacement for existing thread of translations" );
										}

										destination[key] = value;

										break;
									}

									case "object" :
										if ( !Array.isArray( value ) ) {
											throw new TypeError( "invalid array in tree of translations" );
										}

										if ( value ) {
											if ( !destination.hasOwnProperty( key ) ) {
												destination[key] = {};
											}

											this.merge( value, destination[key] );
										}
								}
							} );
						break;
					}

				// falls through
				default :
					throw new TypeError( "invalid type of source" );
			}
		}

		return destination;
	}

	/**
	 * Looks up node in tree of translations selected by its path of keys.
	 *
	 * @param {string} path period-separated sequence of key names each selecting next descendant in tree of translations
	 * @param {?string} fallback fallback to return on mismatch
	 * @param {int} numerus number of addressed subjects in desired translation
	 * @param {string} genus explicitly required genus of translation
	 * @returns {?string} found translation, provided fallback on mismatch
	 */
	lookup( path, fallback = null, numerus = 1, genus = null ) {
		const match = ptnLookup.exec( path );
		if ( match ) {
			if ( match[1] ) {
				const segments = String( path ).trim().split( "." );
				const numSegments = segments.length;
				let node = this.tree;

				for ( let i = 0; i < numSegments; i++ ) {
					const key = segments[i];

					if ( key ) {
						if ( node.hasOwnProperty( key ) ) {
							node = node[key];
						} else {
							return match[2] ? match[3] : fallback;
						}
					}
				}

				return node;
			}

			if ( match[2] ) {
				return match[3];
			}
		}

		return fallback;
	}
}

/**
 * Exposes filter function e.g. for registration via `Vue.filter()`.
 *
 * @param {string} lookup some string to be looked up for matching translation
 * @param {int} numerus number of addressed subjects in desired translation
 * @param {string} genus explicitly required genus of translation
 * @returns {string} optionally translated string
 */
export function filter( lookup, { numerus = 1, genus = null } = {} ) {
	const locale = currentLocale == null ? Localization.current : currentLocale;

	if ( locale ) {
		return locale.lookup( lookup, lookup, numerus, genus );
	}

	const match = ptnLookup.exec( lookup );

	return match[2] ? match[3] : lookup;
}
