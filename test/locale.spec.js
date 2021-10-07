/**
 * (c) 2021 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2021 cepharum GmbH
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

import { describe, it, afterEach } from "mocha";
import "should";

import { Locale, Localization } from "../lib/index.js";

describe( "Locale is a class that", () => {
	afterEach( () => {
		Localization.clear();
	} );

	it( "exists", () => {
		Locale.should.be.ok();
	} );

	describe( "has static methods", () => {
		describe( "isValidLocale", () => {
			it( "that decides if a local is valid", () => {
				Locale.isValidLocale( "de-de" ).should.be.true();
				Locale.isValidLocale( "de" ).should.be.true();
				Locale.isValidLocale( "en" ).should.be.true();
				Locale.isValidLocale( "en-us" ).should.be.true();
				Locale.isValidLocale( "eng" ).should.be.true();
				Locale.isValidLocale( "" ).should.be.false();
				Locale.isValidLocale( "d" ).should.be.false();
				Locale.isValidLocale( "dede" ).should.be.false();
				Locale.isValidLocale( "de-de-de" ).should.be.false();
				Locale.isValidLocale( "de-" ).should.be.false();
			} );
		} );

		describe( "compare", () => {
			describe( "that compares two Locales, and returns", () => {
				it( "0 if provided locales don't relate to each other", () => {
					Locale.compare().should.eql( 0 );
					Locale.compare( "de" ).should.eql( 0 );
					Locale.compare( null, "de" ).should.eql( 0 );
					Locale.compare( "dede", "de" ).should.eql( 0 );
					Locale.compare( "de", "dede" ).should.eql( 0 );
					Locale.compare( "de", "" ).should.eql( 0 );
					Locale.compare( "de", "en" ).should.eql( 0 );
					Locale.compare( "de-de", "en-us" ).should.eql( 0 );
				} );
				it( "1 if languages are equivalent w/o regards to any region selector", () => {
					Locale.compare( "en-en", "en-us" ).should.eql( 1 );
					Locale.compare( "de-de", "de-by" ).should.eql( 1 );
					Locale.compare( "De-de", "de-by" ).should.eql( 1 );
					Locale.compare( "De-de", "dE-by" ).should.eql( 1 );
					Locale.compare( "de-de", "DE-by" ).should.eql( 1 );
					Locale.compare( new Locale( "de-de" ), "de-by" ).should.eql( 1 );
				} );
				it( " 2 if one of the locales is lacking region selector, but matches other locale by language", () => {
					Locale.compare( "en-en", "en" ).should.eql( 2 );
					Locale.compare( "en", "en-us" ).should.eql( 2 );
				} );
				it( "3 if locales match exactly (also matching by region unless neither locale includes any region selector", () => {
					Locale.compare( "de", "de" ).should.eql( 3 );
					Locale.compare( "de-de", "de-de" ).should.eql( 3 );
					Locale.compare( "De-de", "de-de" ).should.eql( 3 );
					Locale.compare( "dE-de", "de-de" ).should.eql( 3 );
					Locale.compare( "de-de", "de-De" ).should.eql( 3 );
					Locale.compare( "de-de", "de-dE" ).should.eql( 3 );
					Locale.compare( "De-de", "de-De" ).should.eql( 3 );
					Locale.compare( "De-de", "dE-De" ).should.eql( 3 );
					Locale.compare( "De-dE", "dE-De" ).should.eql( 3 );
				} );
			} );
		} );
		describe( "listAccepted", () => {
			it( "that provides list of accepted locales' identifiers", () => {
				Locale.listAccepted().should.not.be.empty();
			} );
		} );
	} );

	describe( "can be constructed", () => {
		describe( "but throws if", () => {
			it( "locale is missing", () => {
				( () => new Locale() ).should.throw();
				( () => new Locale( "" ) ).should.throw();
			} );
			it( "locale is not valid", () => {
				( () => new Locale( "dede" ) ).should.throw();
				( () => new Locale( "de-dede" ) ).should.throw();
			} );
		} );
		describe( "and then provides methods", () => {
			describe( "toString", () => {
				it( "that retrieves locale's identifier as its string-formatted representation", () => {
					new Locale( "de-de" ).toString().should.eql( "de-de" );
					new Locale( "De-dE" ).toString().should.eql( "de-de" );
					new Locale( "de" ).toString().should.eql( "de" );
				} );
			} );
			describe( "selectLocalized", () => {
				it( "that localizes a property's value", () => {
					new Locale( "foo" ).selectLocalized( { foo: "foo" } ).should.eql( "foo" );
					new Locale( "foo" ).selectLocalized( { foo: "foo", en: "bar" } ).should.eql( "foo" );
					new Locale( "foo" ).selectLocalized( { FOO: "foo", en: "bar" } ).should.eql( "foo" );
					new Locale( "foo" ).selectLocalized( { any: "foo" } ).should.eql( "foo" );
					new Locale( "foo" ).selectLocalized( { en: "foo" } ).should.eql( "foo" );
					new Locale( "foo" ).selectLocalized( { "*": "foo" } ).should.eql( "foo" );
				} );
			} );
		} );
	} );
} );
