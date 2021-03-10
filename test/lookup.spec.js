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


const ValidNumerusOnlyThread = {
	name: {
		singular: "Fuchs",
		plural: "Füchse",
	},
};

const ValidGenusOnlyThread = {
	name: {
		male: "Fuchs",
		female: "Füchsin",
	},
};

const ValidNumerusGenusThread = {
	name: {
		singular: { male: "Fuchs", female: "Füchsin" },
		plural: { male: "Füchse", female: "Füchsinnen" },
	},
};

const InvalidGenusNumerusThread = {
	name: {
		male: { singular: "Fuchs", plural: "Füchse" },
		female: { singular: "Füchsin", plural: "Füchsinnen" },
	},
};


describe( "A locale manager instance", () => {
	describe( "provides method for detecting proper lookup strings which", () => {
		it( "accepts simple, single-segment lookups", () => {
			Localization.isValidLookup( "@segment" ).should.be.true();
			Localization.isValidLookup( "@a" ).should.be.true();
			Localization.isValidLookup( "@1" ).should.be.true();
			Localization.isValidLookup( "@0" ).should.be.true();
		} );

		it( "rejects simple lookups lacking prefix `@`", () => {
			Localization.isValidLookup( "segment" ).should.be.false();
			Localization.isValidLookup( "a" ).should.be.false();
			Localization.isValidLookup( "1" ).should.be.false();
			Localization.isValidLookup( "0" ).should.be.false();
		} );

		for ( const ws of " \r\n\t\f\v" ) {
			it( `rejects simple, single-segment lookups containing whitespace \\x${String( "0" + ws.codePointAt( 0 ).toString( 16 ) ).slice( -2 )}`, () => {
				Localization.isValidLookup( `@seg${ws}ment` ).should.be.false();
				Localization.isValidLookup( `@${ws}` ).should.be.false();
			} );
		}

		for ( const ch of "!*#+:,;$%&/()" ) {
			it( `rejects simple, single-segment lookups containing special character "${ch}"`, () => {
				Localization.isValidLookup( "@" + ch ).should.be.false();
				Localization.isValidLookup( "@" + ch + "segment" ).should.be.false();
				Localization.isValidLookup( "@segment" + ch ).should.be.false();
			} );
		}

		it( "accepts simple, multi-segment lookups", () => {
			Localization.isValidLookup( "@seg.ment" ).should.be.true();
			Localization.isValidLookup( "@seg.ment.ed" ).should.be.true();
		} );

		it( "rejects multiple periods in a row in a lookup", () => {
			Localization.isValidLookup( "@seg..ment" ).should.be.false();
			Localization.isValidLookup( "@seg.ment..ed" ).should.be.false();
		} );

		it( "accepts lookups starting with @", () => {
			Localization.isValidLookup( "@segment" ).should.be.true();
			Localization.isValidLookup( "@a" ).should.be.true();
			Localization.isValidLookup( "@1" ).should.be.true();
			Localization.isValidLookup( "@0" ).should.be.true();
			Localization.isValidLookup( "@seg.ment.ed" ).should.be.true();
		} );

		it( "accepts lookups with trailing or intermittent @", () => {
			Localization.isValidLookup( "@seg@ment" ).should.be.false();
			Localization.isValidLookup( "@segment@" ).should.be.false();
			Localization.isValidLookup( "@a@" ).should.be.false();
			Localization.isValidLookup( "@1@" ).should.be.false();
			Localization.isValidLookup( "@0@" ).should.be.false();
			Localization.isValidLookup( "@seg@ment" ).should.be.false();
			Localization.isValidLookup( "@seg.@ment.ed" ).should.be.false();
			Localization.isValidLookup( "@seg.me@nt.ed" ).should.be.false();
			Localization.isValidLookup( "@seg.ment@.ed" ).should.be.false();
			Localization.isValidLookup( "@seg.ment.ed@" ).should.be.false();
		} );

		for ( const ws of " \r\n\t\f\v" ) {
			it( `accepts leading whitespace \\x${String( "0" + ws.codePointAt( 0 ).toString( 16 ) ).slice( -2 )}`, () => {
				Localization.isValidLookup( `${ws}@segment` ).should.be.true();
				Localization.isValidLookup( `${ws}@a` ).should.be.true();
				Localization.isValidLookup( `${ws}@1` ).should.be.true();
				Localization.isValidLookup( `${ws}@0` ).should.be.true();
				Localization.isValidLookup( `${ws}@seg.ment.ed` ).should.be.true();
			} );
		}

		for ( const ws of " \r\n\t\f\v" ) {
			it( `accepts trailing whitespace \\x${String( "0" + ws.codePointAt( 0 ).toString( 16 ) ).slice( -2 )}`, () => {
				Localization.isValidLookup( `@segment${ws}` ).should.be.true();
				Localization.isValidLookup( `@a${ws}` ).should.be.true();
				Localization.isValidLookup( `@1${ws}` ).should.be.true();
				Localization.isValidLookup( `@0${ws}` ).should.be.true();
				Localization.isValidLookup( `@seg.ment.ed${ws}` ).should.be.true();
			} );
		}

		for ( const ws of " \r\n\t\f\v" ) {
			it( `accepts whitespace \\x${String( "0" + ws.codePointAt( 0 ).toString( 16 ) ).slice( -2 )} right after prefixing @`, () => {
				Localization.isValidLookup( `@${ws}segment` ).should.be.true();
				Localization.isValidLookup( `@${ws}a` ).should.be.true();
				Localization.isValidLookup( `@${ws}1` ).should.be.true();
				Localization.isValidLookup( `@${ws}0` ).should.be.true();
				Localization.isValidLookup( `@${ws}seg.ment.ed` ).should.be.true();
			} );
		}

		it( "rejects non-prefixed lookup with fallback", () => {
			Localization.isValidLookup( "some.segment=some fallback to use" ).should.be.false();
		} );

		it( "accepts prefixed lookup with fallback", () => {
			Localization.isValidLookup( "@some.segment=some fallback to use" ).should.be.true();
		} );

		for ( const ws of " \r\n\t\f\v" ) {
			it( `accepts whitespace \\x${String( "0" + ws.codePointAt( 0 ).toString( 16 ) ).slice( -2 )} before = starting implicit fallback`, () => {
				Localization.isValidLookup( `@some.segment${ws}=some fallback to use` ).should.be.true();
				Localization.isValidLookup( `@some.segment${ws}${ws}=some fallback to use` ).should.be.true();
			} );
		}

		for ( const ws of " \r\n\t\f\v" ) {
			it( `accepts whitespace \\x${String( "0" + ws.codePointAt( 0 ).toString( 16 ) ).slice( -2 )} after = starting implicit fallback`, () => {
				Localization.isValidLookup( `@some.segment=${ws}some fallback to use` ).should.be.true();
				Localization.isValidLookup( `@some.segment=${ws}${ws}some fallback to use` ).should.be.true();
			} );
		}
	} );

	describe( "provides method for looking up translations which", () => {
		it( "is a function", () => {
			new Localization( new Locale( "de" ), {} ).lookup.should.be.Function();
		} );

		it( "supports shallow selection of leaf node", () => {
			new Localization( new Locale( "de" ), {
				some: "übersetzt",
			} ).lookup( "@some" ).should.be.String().which.is.equal( "übersetzt" );
		} );

		it( "supports deep selection of leaf node", () => {
			new Localization( new Locale( "de" ), {
				some: { deep: { node: "übersetzt" } },
			} ).lookup( "@some.deep.node" ).should.be.String().which.is.equal( "übersetzt" );
		} );

		it( "supports shallow selection of thread node", () => {
			new Localization( new Locale( "de" ), {
				some: { deep: { node: "übersetzt" } },
			} ).lookup( "@some" ).should.be.Object().which.has.property( "deep" ).which.is.Object().and.has.property( "node" ).which.is.String().and.equal( "übersetzt" );
		} );

		it( "provides fallback on selected missing node preferring implicit fallback", () => {
			const tree = {
				some: "übersetzt",
			};

			Should( new Localization( new Locale( "de" ), tree ).lookup( "@other" ) ).be.null();

			new Localization( new Locale( "de" ), tree ).lookup( "@other", "my fallback" ).should.be.String().which.is.equal( "my fallback" );
			new Localization( new Locale( "de" ), tree ).lookup( "@other=my implicit fallback" ).should.be.String().which.is.equal( "my implicit fallback" );
			new Localization( new Locale( "de" ), tree ).lookup( "@other=my implicit fallback", "my fallback" ).should.be.String().which.is.equal( "my implicit fallback" );
		} );

		it( "passes (returns) invalid lookups", () => {
			const tree = {
				some: "übersetzt",
			};

			new Localization( new Locale( "de" ), tree ).lookup( "other" ).should.be.String().which.is.equal( "other" );
			new Localization( new Locale( "de" ), tree ).lookup( "other", "my fallback" ).should.be.String().which.is.equal( "other" );

			new Localization( new Locale( "de" ), tree ).lookup( "my implicit fallback" ).should.be.String().which.is.equal( "my implicit fallback" );
			new Localization( new Locale( "de" ), tree ).lookup( "my implicit fallback", "my fallback" ).should.be.String().which.is.equal( "my implicit fallback" );

			new Localization( new Locale( "de" ), tree ).lookup( "=my implicit fallback" ).should.be.String().which.is.equal( "=my implicit fallback" );
			new Localization( new Locale( "de" ), tree ).lookup( "=my implicit fallback", "my fallback" ).should.be.String().which.is.equal( "=my implicit fallback" );

			new Localization( new Locale( "de" ), tree ).lookup( "other=my implicit fallback" ).should.be.String().which.is.equal( "other=my implicit fallback" );
			new Localization( new Locale( "de" ), tree ).lookup( "other=my implicit fallback", "my fallback" ).should.be.String().which.is.equal( "other=my implicit fallback" );
		} );

		it( "obeys number of subjects when selecting thread node providing complex set of translation depending on numerus", () => {
			new Localization( new Locale( "de" ), ValidNumerusOnlyThread ).lookup( "@name", null, { number: 1 } ).should.be.String().which.is.equal( "Fuchs" );
			new Localization( new Locale( "de" ), ValidNumerusOnlyThread ).lookup( "@name", null, { number: 0 } ).should.be.String().which.is.equal( "Füchse" );
			new Localization( new Locale( "de" ), ValidNumerusOnlyThread ).lookup( "@name", null, { number: 2 } ).should.be.String().which.is.equal( "Füchse" );
		} );

		it( "obeys requested genus on selecting thread node providing complex set of translation depending on genus", () => {
			new Localization( new Locale( "de" ), ValidGenusOnlyThread ).lookup( "@name", null, { genus: "male" } ).should.be.String().which.is.equal( "Fuchs" );
			new Localization( new Locale( "de" ), ValidGenusOnlyThread ).lookup( "@name", null, { genus: "female" } ).should.be.String().which.is.equal( "Füchsin" );
		} );

		it( "obeys numerus and genus on selecting thread node providing complex set of translation depending on numerus and genus", () => {
			new Localization( new Locale( "de" ), ValidNumerusGenusThread ).lookup( "@name", null, { number: 1, genus: "male" } ).should.be.String().which.is.equal( "Fuchs" );
			new Localization( new Locale( "de" ), ValidNumerusGenusThread ).lookup( "@name", null, { number: 0, genus: "male" } ).should.be.String().which.is.equal( "Füchse" );
			new Localization( new Locale( "de" ), ValidNumerusGenusThread ).lookup( "@name", null, { number: 2, genus: "male" } ).should.be.String().which.is.equal( "Füchse" );

			new Localization( new Locale( "de" ), ValidNumerusGenusThread ).lookup( "@name", null, { number: 1, genus: "female" } ).should.be.String().which.is.equal( "Füchsin" );
			new Localization( new Locale( "de" ), ValidNumerusGenusThread ).lookup( "@name", null, { number: 0, genus: "female" } ).should.be.String().which.is.equal( "Füchsinnen" );
			new Localization( new Locale( "de" ), ValidNumerusGenusThread ).lookup( "@name", null, { number: 2, genus: "female" } ).should.be.String().which.is.equal( "Füchsinnen" );
		} );

		it( "ignores request for particular genus if translations don't distinguish accordingly", () => {
			new Localization( new Locale( "de" ), ValidNumerusOnlyThread ).lookup( "@name", null, { number: 1, genus: "male" } ).should.be.String().which.is.equal( "Fuchs" );
			new Localization( new Locale( "de" ), ValidNumerusOnlyThread ).lookup( "@name", null, { number: 0, genus: "male" } ).should.be.String().which.is.equal( "Füchse" );
			new Localization( new Locale( "de" ), ValidNumerusOnlyThread ).lookup( "@name", null, { number: 2, genus: "male" } ).should.be.String().which.is.equal( "Füchse" );

			new Localization( new Locale( "de" ), ValidNumerusOnlyThread ).lookup( "@name", null, { number: 1, genus: "female" } ).should.be.String().which.is.equal( "Fuchs" );
			new Localization( new Locale( "de" ), ValidNumerusOnlyThread ).lookup( "@name", null, { number: 0, genus: "female" } ).should.be.String().which.is.equal( "Füchse" );
			new Localization( new Locale( "de" ), ValidNumerusOnlyThread ).lookup( "@name", null, { number: 2, genus: "female" } ).should.be.String().which.is.equal( "Füchse" );
		} );

		it( "requires complex translations to distinguish numerus first and genus second", () => {
			new Localization( new Locale( "de" ), ValidNumerusGenusThread ).lookup( "@name", "fallback", { number: 1, genus: "male" } ).should.be.String().which.is.equal( "Fuchs" );
			new Localization( new Locale( "de" ), ValidNumerusGenusThread ).lookup( "@name", "fallback", { number: 0, genus: "male" } ).should.be.String().which.is.equal( "Füchse" );
			new Localization( new Locale( "de" ), ValidNumerusGenusThread ).lookup( "@name", "fallback", { number: 2, genus: "male" } ).should.be.String().which.is.equal( "Füchse" );

			new Localization( new Locale( "de" ), ValidNumerusGenusThread ).lookup( "@name", "fallback", { number: 1, genus: "female" } ).should.be.String().which.is.equal( "Füchsin" );
			new Localization( new Locale( "de" ), ValidNumerusGenusThread ).lookup( "@name", "fallback", { number: 0, genus: "female" } ).should.be.String().which.is.equal( "Füchsinnen" );
			new Localization( new Locale( "de" ), ValidNumerusGenusThread ).lookup( "@name", "fallback", { number: 2, genus: "female" } ).should.be.String().which.is.equal( "Füchsinnen" );

			new Localization( new Locale( "de" ), InvalidGenusNumerusThread ).lookup( "@name", "fallback", { number: 1, genus: "male" } ).should.be.String().which.is.equal( "fallback" );
			new Localization( new Locale( "de" ), InvalidGenusNumerusThread ).lookup( "@name", "fallback", { number: 0, genus: "male" } ).should.be.String().which.is.equal( "fallback" );
			new Localization( new Locale( "de" ), InvalidGenusNumerusThread ).lookup( "@name", "fallback", { number: 2, genus: "male" } ).should.be.String().which.is.equal( "fallback" );

			new Localization( new Locale( "de" ), InvalidGenusNumerusThread ).lookup( "@name", "fallback", { number: 1, genus: "female" } ).should.be.String().which.is.equal( "fallback" );
			new Localization( new Locale( "de" ), InvalidGenusNumerusThread ).lookup( "@name", "fallback", { number: 0, genus: "female" } ).should.be.String().which.is.equal( "fallback" );
			new Localization( new Locale( "de" ), InvalidGenusNumerusThread ).lookup( "@name", "fallback", { number: 2, genus: "female" } ).should.be.String().which.is.equal( "fallback" );
		} );

		describe( "retrieves fallback on looking up explicitly with", () => {
			it( "numerus in invalid thread distinguishing genus first", () => {
				for ( const number of [ 1, 0, 2 ] ) {
					new Localization( new Locale( "de" ), InvalidGenusNumerusThread ).lookup( "@name", "fallback", { number } ).should.be.String().which.is.equal( "fallback" );
				}
			} );

			it( "numerus in valid thread distinguishing numerus first and genus second", () => {
				for ( const number of [ 1, 0, 2 ] ) {
					new Localization( new Locale( "de" ), ValidNumerusGenusThread ).lookup( "@name", "fallback", { number } ).should.be.String().which.is.equal( "fallback" );
				}
			} );

			it( "genus in invalid thread distinguishing genus first", () => {
				new Localization( new Locale( "de" ), InvalidGenusNumerusThread ).lookup( "@name", "fallback", { genus: "male" } ).should.be.String().which.is.equal( "fallback" );
				new Localization( new Locale( "de" ), InvalidGenusNumerusThread ).lookup( "@name", "fallback", { genus: "female" } ).should.be.String().which.is.equal( "fallback" );
			} );

			it( "numerus and genus in invalid thread distinguishing genus first", () => {
				for ( const number of [ 1, 0, 2 ] ) {
					for ( const genus of [ "male", "female" ] ) {
						new Localization( new Locale( "de" ), InvalidGenusNumerusThread ).lookup( "@name", "fallback", { number, genus } ).should.be.String().which.is.equal( "fallback" );
					}
				}
			} );
		} );
	} );
} );
