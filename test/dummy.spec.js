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
import Should from "should";

import * as index from "../lib/index.js";
const { Localization } = index;

describe( "A dummy instance of current Localization", () => {
	afterEach( () => {
		Localization.clear();
	} );

	it( "is available", () => {
		Should.exist( Localization.current );
	} );

	describe( "is returned by static getter if Localization is not initialized", () => {
		it( "does not throw initially", () => {
			( () => Localization.current ).should.not.throw();
		} );
	} );

	describe( "lookup will always return fallback while using dummy", () => {
		it( "that always returns fallback", () => {
			Localization.current.lookup( "@other", "my fallback" ).should.be.String().which.is.equal( "my fallback" );
		} );
	} );

	describe( "a static getter tells if there is a current instance", () => {
		it( "returns false if not initialized", () => {
			Should.exist( Localization.hasCurrent );
			Localization.hasCurrent.should.be.false();
		} );

		it( "returns true if initialized", async () => {
			Localization.register( "de", {} );
			const l10n = await Localization.select( "de", true );
			l10n.locale.tag.should.be.eql("de")
			Localization.hasCurrent.should.be.true();
		} );
	} );
} );
