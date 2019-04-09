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

const Locale = require( "./locale" );

/**
 * @typedef {object<string,(string|Translations)>} Translations
 */

/**
 * Maps either registered locale into its manager instance.
 *
 * @type {Map<string,Localization>}
 */
const registeredLocales = new Map();

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
const ptnLookup = /^\s*@\s*((?:[a-z0-9_-]+\.)*[a-z0-9_-]+)(\s*=\s*([\s\S]*))?\s*$/i;


/**
 * Implements localization by providing translations for a selected locale
 * matching hierarchical lookup keys.
 */
class Localization {
	/**
	 * @param {Locale} locale locale to be managed, provided for mostly informational purposes, only
	 * @param {Translations} tree initial tree-like set of translations to be managed
	 * @param {function(number:int):string} numerusSelector retrieves name of property addressing translation for provided number of subjects
	 */
	constructor( locale, tree, { numerusSelector = null } = {} ) {
		if ( !( locale instanceof Locale ) ) {
			throw new TypeError( "invalid locale identifier" );
		}

		if ( !tree || typeof tree !== "object" || Array.isArray( tree ) ) {
			throw new TypeError( "invalid type of translations map" );
		}

		if ( numerusSelector != null && typeof numerusSelector !== "function" ) {
			throw new TypeError( "invalid numerus selector callback" );
		}

		Object.defineProperties( this, {
			/**
			 * Provides descriptor of managed locale.
			 *
			 * @name Localization#locale
			 * @property {Locale}
			 * @readonly
			 */
			locale: { value: locale },

			/**
			 * Exposes current locales tree of translations.
			 *
			 * @name Localization#tree
			 * @property {Translations}
			 * @readonly
			 */
			tree: { value: this.constructor.merge( {}, tree ) },

			/**
			 * Provides callback providing key for selecting translation with
			 * proper numerus according to some provided number of subjects.
			 *
			 * @name Localization#numerusSelector
			 * @property {function(number:int):string}
			 * @readonly
 			 */
			numerusSelector: { value: numerusSelector || ( n => ( parseFloat( n ) === 1 ? "singular" : "plural" ) ) },
		} );
	}

	/**
	 * Fetches current locale implicitly selecting one.
	 *
	 * @return {Localization} current locale's manager
	 */
	static get current() {
		if ( currentLocale == null ) {
			this.select( Locale.listAccepted(), true );

			if ( !currentLocale ) {
				throw new Error( "accessing locale manager failed due to lack of any registered locale" );
			}
		}

		return currentLocale;
	}

	/**
	 * Retrieves manager instance for registered locale matching best locale(s)
	 * of provided selector.
	 *
	 * @param {string|string[]} selector one or more locales to be tested
	 * @param {boolean} persist set true to make selected locale current one unless it is missing
	 * @returns {?Localization} found manager instance, null on missing any registered localization
	 */
	static select( selector, persist = false ) {
		let match = null;
		const list = Array.isArray( selector ) ? selector : [selector];
		const numAccepted = list.length;

		for ( let i = 0; i < numAccepted; i++ ) {
			let accepted = null;
			let bestLevel = 0;

			for ( const [ key, value ] of registeredLocales ) {
				if ( match == null ) {
					// choose first available locale as fallback
					match = value;
				}

				const level = Locale.compare( list[i], key );
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

		if ( match && persist ) {
			currentLocale = match;
		}

		return match;
	}

	/**
	 * Detects if a provided string is containing proper lookup string.
	 *
	 * @param {string} lookup string to be tested
	 * @return {boolean} true if string contains valid lookup string
	 */
	static isValidLookup( lookup ) {
		return Boolean( typeof lookup === "string" && ptnLookup.test( lookup ) );
	}


	/**
	 * Registers translations of another locale.
	 *
	 * @param {Locale|string} locale locale selector
	 * @param {Translations} translations tree of translations
	 * @param {function(number:int):string} numerusSelector retrieves property name
	 * @returns {Localization} fluent interface
	 */
	static register( locale, translations, numerusSelector = null ) {
		const _locale = locale instanceof Locale ? locale : new Locale( locale );

		if ( registeredLocales.has( _locale.tag ) ) {
			throw new TypeError( `translations for locale ${locale} have been registered before` );
		}

		if ( !translations || typeof translations !== "object" || Array.isArray( translations ) ) {
			throw new TypeError( "invalid type of translations map" );
		}

		registeredLocales.set( locale, new this( locale, translations, { numerusSelector } ) );

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
		for ( const [ registeredLocale, manager ] of registeredLocales ) {
			if ( Locale.compare( locale, registeredLocale ) ) {
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
								const destinationKey = key.toLowerCase();

								switch ( typeof value ) {
									case "string" :
									case "number" : {
										const existing = destination[destinationKey];
										if ( existing != null && typeof existing === "object" ) {
											throw new TypeError( "invalid scalar replacement for existing thread of translations" );
										}

										destination[destinationKey] = String( value );

										break;
									}

									case "object" :
										if ( Array.isArray( value ) ) {
											throw new TypeError( "invalid array in tree of translations" );
										}

										if ( value ) {
											if ( destination.hasOwnProperty( destinationKey ) ) {
												const existing = destination[destinationKey];
												if ( typeof existing !== "object" ) {
													throw new TypeError( "invalid non-scalar replacement for existing leaf of translations tree" );
												}

												if ( !existing ) {
													destination[destinationKey] = {};
												}
											} else {
												destination[destinationKey] = {};
											}

											this.merge( destination[destinationKey], value );
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
	 * @param {int} number number of addressed subjects in desired translation
	 * @param {string} genus explicitly required genus of translation
	 * @returns {?string} found translation, provided fallback on mismatch, lookup on providing invalid lookup
	 */
	lookup( path, fallback = null, number = null, genus = null ) {
		const match = ptnLookup.exec( path );
		if ( match ) {
			// provided input is a basically valid lookup
			// -> search translations for matching record
			const segments = String( match[1] ).trim().split( "." );
			const numSegments = segments.length;
			let node = this.tree;

			for ( let i = 0; i < numSegments; i++ ) {
				const key = String( segments[i] ).toLowerCase();

				if ( key ) {
					if ( typeof node === "object" && node && !Array.isArray( node ) && node.hasOwnProperty( key ) ) {
						node = node[key];
					} else {
						node = null;
						break;
					}
				}
			}

			for ( const ref of [ node, match[2] ? match[3] : fallback ] ) {
				if ( ref != null ) {
					let subnode = ref;

					if ( number != null && typeof subnode === "object" && subnode ) {
						const numerus = this.numerusSelector( number );

						if ( numerus && subnode.hasOwnProperty( numerus ) ) {
							subnode = subnode[numerus];
						} else if ( subnode.hasOwnProperty( "*" ) ) {
							subnode = subnode["*"];
						} else {
							subnode = null;
						}
					}

					if ( genus != null && typeof subnode === "object" && subnode ) {
						if ( subnode.hasOwnProperty( genus ) ) {
							subnode = subnode[genus];
						} else if ( subnode.hasOwnProperty( "*" ) ) {
							subnode = subnode["*"];
						} else {
							subnode = null;
						}
					}

					if ( subnode !== ref ) {
						if ( typeof subnode === "string" ) {
							return subnode;
						}

						continue;
					}

					return ref;
				}
			}

			return null;
		}

		// provided input is not a valid lookup -> pass through w/o modifying
		return path;
	}

	/**
	 * Initializes localizations management.
	 *
	 * @param {function(locale:string):Promise<Translations>} translationsLoader callback invoked to load translations of provided locale
	 * @param {function():string[]} localesDetector callback invoked to provide list of accepted locales
	 * @param {string} fallbackLocale identifier of locale to be always tried as fallback
	 * @returns {Promise<Locale>} promises accepted and available locale also set as current one
	 */
	static initialize( translationsLoader, localesDetector = null, fallbackLocale = null ) {
		const acceptedLocales = localesDetector ? localesDetector() : Locale.listAccepted();
		if ( !Array.isArray( acceptedLocales ) ) {
			return Promise.reject( new TypeError( "not a list of accepted locales" ) );
		}

		// normalize list of locales to be tested
		const numAccepted = acceptedLocales.length;
		const listedLocales = new Array( numAccepted );

		for ( let i = 0; i < numAccepted; i++ ) {
			const locale = acceptedLocales[i];

			if ( locale instanceof Locale ) {
				listedLocales[i] = locale;
				continue;
			}

			if ( !Locale.isValidLocale( locale ) ) {
				return Promise.reject( new TypeError( `invalid locale in list of accepted locales: ${locale}` ) );
			}

			listedLocales[i] = new Locale( locale );
		}

		// make sure to include explicitly selected fallback locale
		if ( fallbackLocale != null ) {
			let forcedLocale;

			if ( fallbackLocale instanceof Locale ) {
				forcedLocale = fallbackLocale;
			} else {
				if ( !Locale.isValidLocale( fallbackLocale ) ) {
					return Promise.reject( new TypeError( "invalid locale to be enforced" ) );
				}

				forcedLocale = new Locale( fallbackLocale );
			}

			for ( let i = 0; i < numAccepted; i++ ) {
				if ( Locale.compare( listedLocales, forcedLocale ) >= 2 ) {
					forcedLocale = null;
				}
			}

			if ( forcedLocale != null ) {
				listedLocales.push( forcedLocale );
			}
		}

		const loadNext = ( locales, current, numLocales, resolve, reject ) => {
			if ( current >= numLocales ) {
				reject( new TypeError( "missing support for any accepted locale" ) );
			} else {
				const locale = locales[current];

				try {
					const translations = translationsLoader( locale );
					if ( translations == null ) {
						loadNext( locales, current + 1, numLocales, resolve, reject );
					} else if ( translations instanceof Promise || ( typeof translations["then"] === "function" && typeof translations["catch"] === "function" ) ) {
						translations
							.then( _translations => {
								this.register( locale, _translations.default || _translations );
								resolve( locale );
							} )
							.catch( error => {
								console.error( error ); // eslint-disable-line no-console

								loadNext( locales, current + 1, numLocales, resolve, reject );
							} );
					} else {
						this.register( locale, translations.default || translations );
						resolve( locale );
					}
				} catch( error ) {
					loadNext( locales, current + 1, numLocales, resolve, reject );
				}
			}
		};

		// try to load first available locale in list
		return new Promise( ( resolve, reject ) => {
			loadNext( listedLocales, 0, numAccepted, resolve, reject );
		} );
	}
}

Localization._ptnLookup = ptnLookup;

exports = module.exports = Localization;
