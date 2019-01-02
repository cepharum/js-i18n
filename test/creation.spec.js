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
require( "should" );

const { Localization, Locale } = require( ".." );

describe( "Creating a locale manager instance", () => {
	it( "requires locale and tree of translations on construction", () => {
		( () => new Localization() ).should.throw();
		( () => new Localization( new Locale( "de" ) ) ).should.throw();
		( () => new Localization( new Locale( "de" ), {} ) ).should.not.throw();
	} );

	it( "requires valid locale on construction", () => {
		( () => new Localization( "", {} ) ).should.throw();
		( () => new Localization( {}, {} ) ).should.throw();
		( () => new Localization( null, {} ) ).should.throw();
		( () => new Localization( " some text ", {} ) ).should.throw();
		( () => new Localization( "de#de", {} ) ).should.throw();
		( () => new Localization( "de-de+utf8", {} ) ).should.throw();

		( () => new Localization( "de", {} ) ).should.throw();
		( () => new Localization( "de-de", {} ) ).should.throw();
		( () => new Localization( "de_de", {} ) ).should.throw();
		( () => new Localization( "de-de@utf8", {} ) ).should.throw();
		( () => new Localization( "de_de@utf8", {} ) ).should.throw();
		( () => new Localization( "de-de.utf-8", {} ) ).should.throw();
		( () => new Localization( "de_de.utf-8", {} ) ).should.throw();

		( () => new Localization( new Locale( "de" ), {} ) ).should.not.throw();
		( () => new Localization( new Locale( "de-de" ), {} ) ).should.not.throw();
		( () => new Localization( new Locale( "de_de" ), {} ) ).should.not.throw();
		( () => new Localization( new Locale( "de-de@utf8" ), {} ) ).should.not.throw();
		( () => new Localization( new Locale( "de_de@utf8" ), {} ) ).should.not.throw();
		( () => new Localization( new Locale( "de-de.utf-8" ), {} ) ).should.not.throw();
		( () => new Localization( new Locale( "de_de.utf-8" ), {} ) ).should.not.throw();
	} );
} );
