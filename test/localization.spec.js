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

const { describe, it } = require( "mocha" );
const Should = require( "should" );

const { Localization, Locale } = require( ".." );
describe( "Locale is a class that", () => {
	it( "exists", () => {
		Localization.should.be.ok();
	} );

	describe( "has static methods", () => {
		describe( "register", () => {
			beforeEach( () => {
				Localization.clear();
			} );
			afterEach( () => {
				Localization.clear();
			} );
			it( "that throws on repeated registration", () => {
				Localization.register( "de", {} );
				( () => Localization.register( "de" , {} ) ).should.throw();
			} );
			it( "that throws on missing translations map", () => {
				( () => Localization.register( "de" ) ).should.throw();
			} );
		} );
		describe( "current", () => {
			beforeEach( () => {
				Localization.clear();
			} );
			afterEach( () => {
				Localization.clear();
			} );
			it( "returns dummy when nothing has been registered yet", () => {
				Localization.hasCurrent.should.be.false();
				( () => Localization.current ).should.not.throw();
				Localization.current.locale.tag.should.eql( "any" );
			} );
			it( "returns accepted Locale if non has been chosen yet", () => {
				Localization.register( "en", {} );
				Localization.current.locale.tag.should.eql( "en" );
			} );
			it( "returns currentLocale it was chosen before", async () => {
				Localization.register( new Locale( "de" ), {} );
				await Localization.select( "de", true );
				Localization.current.locale.tag.should.eql( "de" );
			} );
		} );
		describe( "availableLocales", () => {
			beforeEach( () => {
				Localization.clear();
			} );
			afterEach( () => {
				Localization.clear();
			} );
			it( "returns an iterator", () => {
				( () => Localization.availableLocales ).should.not.throw();
				Localization.availableLocales.should.be.instanceof(Object);
				Localization.availableLocales.should.have.property("next")

			} );
			it( "returns iterator if accepted locales", () => {
				Localization.register( "en", {} );
				Localization.availableLocales.next().value.should.eql("en")
			} );
		} );
		describe( "updateTranslations", () => {
			it( "updates the local translations", async () => {
				Localization.register( new Locale( "de" ), {} );
				await Localization.select( "de", true );
				Should( Localization.current.lookup( "@foo" ) ).eql( null );
				Localization.updateTranslations( "any", { foo: "foo" } );
				Should( Localization.current.lookup( "@foo" ) ).eql( null );
				Localization.updateTranslations( "de", { foo: "foo" } );
				Localization.current.lookup( "@foo" ).should.eql( "foo" );
			} );
		} );
		describe( "merge", () => {
			it( "throws on illegal keys", () => {
				( () => Localization.merge( {}, { "  ": "" } ) ).should.throw();
				( () => Localization.merge( {}, { "hello ": "" } ) ).should.throw();
				( () => Localization.merge( {}, { "/ /": "" } ) ).should.throw();
			} );
			it( "throws on illegal values", () => {
				( () => Localization.merge( {}, { foo: [] } ) ).should.throw();
			} );
			it( "throws if trying to merge number value to key with existing object", () => {
				( () => Localization.merge( { foo: {} }, { foo: 1 } ) ).should.throw();
			} );
			it( "throws if source is not an object", () => {
				( () => Localization.merge( {}, [] ) ).should.throw();
				( () => Localization.merge( {}, 1 ) ).should.throw();
				( () => Localization.merge( {}, 0 ) ).should.throw();
				( () => Localization.merge( {}, -1 ) ).should.throw();
				( () => Localization.merge( {}, NaN ) ).should.throw();
				( () => Localization.merge( {}, Infinity ) ).should.throw();
				( () => Localization.merge( {}, -Infinity ) ).should.throw();
				( () => Localization.merge( {}, "foo" ) ).should.throw();
				( () => Localization.merge( {}, "" ) ).should.throw();
			} );
			it( "throws if trying to merge object value to key with existing non object value", () => {
				( () => Localization.merge( { foo: 1 }, { foo: {} } ) ).should.throw();
			} );
			it( "merges value to non-existing key", () => {
				const dest = {};
				Localization.merge( dest, { foo: "foo", one: "1", child: {} } );
				dest.foo.should.eql( "foo" );
				dest.one.should.eql( "1" );
				dest.child.should.eql( {} );
			} );
			it( "merges value to existing key", () => {
				let dest = { child: {} };
				Localization.merge( dest, { child: { foo: "foo", one: "1", } } );
				dest.child.foo.should.eql( "foo" );
				dest.child.one.should.eql( "1" );
				dest = { child: null };
				Localization.merge( dest, { child: { foo: "foo", one: "1", } } );
				dest.child.foo.should.eql( "foo" );
				dest.child.one.should.eql( "1" );
			} );
			it( "returns destination if no source was given", () => {
				const dest = {};
				Localization.merge( dest, null ).should.eql( dest );
				Localization.merge( "foo", null ).should.eql( "foo" );
				Localization.merge( 1, null ).should.eql( 1 );
				Should( Localization.merge( null, null ) ).eql( null );
			} );
		} );
		describe( "initialize", () => {
			it( "returns a Promise", () => {
				Localization.initialize( () => ( {} ) ).should.be.Promise();
			} );
			describe( "rejects", () => {
				it( "if localesDetector returns a non array", () => {
					Localization.initialize( () => ( {} ), () => "" ).should.be.rejected();
				} );
				it( "if localesDetector lists non Locale", () => {
					Localization.initialize( () => ( {} ), () => ["dede"] ).should.be.rejected();
				} );
				it( "invalid fallback Locale", () => {
					Localization.initialize( () => ( {} ), () => [ "de", new Locale( "en" ) ], "enen" ).should.be.rejected();
				} );
				it( "loader with missing locales", () => {
					Localization.initialize( () => null, () => ["de"] ).should.be.rejected();
				} );
				it( "invalid loader", () => {
					Localization.initialize( "loader" ).should.be.rejected();
				} );
			} );
			describe( "accepts", () => {
				it( "accepts fallback Locale", () => {
					Localization.initialize( () => ( {} ), () => [ "de", new Locale( "en" ) ], "en" ).should.not.be.rejected();
					Localization.initialize( () => ( {} ), () => [ "de", new Locale( "en" ) ], new Locale( "en" ) ).should.not.be.rejected();
					Localization.initialize( () => ( {} ), () => ["de"], new Locale( "en" ) ).should.not.be.rejected();
				} );
				it( "a list of Locales", () => {
					Localization.initialize( () => ( {} ), () => [ "de", new Locale( "en" ) ] ).should.not.be.rejected();
				} );
				it( "Promises as translation", () => {
					Localization.initialize( () => Promise.resolve( {} ) ).should.not.be.rejected();
				} );
				it( "accepts Promises as translation", () => {
					Localization.initialize( () => Promise.reject( new Error ), () => [ "en", "de" ] ).should.not.be.rejected();
				} );
				it("then provides these Locales", async () => {
					Localization.initialize(() => ({}), () => ["en", "de"]).should.not.be.rejected();
					let l10n = await Localization.select("de")
						l10n.locale.tag.should.eql("de");
					l10n = await Localization.select("en")
						l10n.locale.tag.should.eql("en");
				})
			} );

		} );
	} );

	describe( "can be constructed", () => {
		describe( "but throws if", () => {
			it( "numerus selector is not a function", () => {
				( () => new Localization( "de" ) ).should.throwError( TypeError );
				( () => new Localization( new Locale( "de" ) ) ).should.throwError( TypeError );
				( () => new Localization( new Locale( "de" ), {}, { numerusSelector: false } ) ).should.throwError( TypeError );
			} );

			describe( "and then provides methods", () => {
				it( "updateTemporary", () => {
					const de = new Localization( new Locale( "de" ), {} );
					de.updateTemporary( { foo: "foo" } );
					de.lookup( "@foo" ).should.eql( "foo" );
				} );
				it( "dropTemporary", () => {
					const de = new Localization( new Locale( "de" ), {} );
					de.updateTemporary( { foo: "foo" } );
					de.lookup( "@foo" ).should.eql( "foo" );
					de.dropTemporary();
					Should( de.lookup( "@foo" ) ).eql( null );
				} );
				it( "updateFallbacks", () => {
					const de = new Localization( new Locale( "de" ), {} );
					de.updateFallbacks( { foo: "foo" } );
					de.lookup( "@foo" ).should.eql( "foo" );
				} );
				it( "updateTranslations", () => {
					const de = new Localization( new Locale( "de" ), {} );
					de.updateTranslations( { foo: "foo" } );
					de.lookup( "@foo" ).should.eql( "foo" );
				} );
				describe( "lookup", () => {
					it( "supports numerus", () => {
						const any = new Localization( new Locale( "any" ), { foo: { "*": "foo" } } );
						any.lookup( "@foo", null, { number: 1 } ).should.eql( "foo" );
					} );
					it( "supports gender", () => {
						const any = new Localization( new Locale( "any" ), { foo: { "*": "foo" }, bar: { } } );
						any.lookup( "@foo", null, { gender: "male" } ).should.eql( "foo" );
						Should( any.lookup( "@bar", null, { gender: "male" } ) ).eql( null );
					} );
				} );
			} );
		} );
	} );
} );
