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
let eventListener = {}
function addEventListener( key, cb ){
	eventListener[key] = cb;
}
function dispatchEvent( e ){
	let listener = eventListener[e.name];
	if( listener ) listener( e );
}
global.window = {
	addEventListener,
	dispatchEvent
}

global.CustomEvent = class {
	constructor(typeArg, {detail} = {}) {
		this.name = typeArg;
		this.detail = detail;
	}
}

const { describe, it } = require( "mocha" );
const Should = require( "should" );

const { Localization } = require( ".." );
describe( "Localization is a class that", () => {
	afterEach(()=> {
		eventListener = {};
	})
	it("that emits an event when the locale changes", () => {
		return new Promise(resolve => {
			addEventListener("cepharumLocaleChanged", ({detail}) => {
				detail.locale.tag.should.eql("de");
				resolve();
			})
			Localization.register("de", {});
			Localization.select("de", true);
		}).should.be.resolved();
	})
	it("that emits an event when clear() is called", () => {
			return new Promise(resolve => {
				addEventListener("cepharumLocaleChanged", ({detail}) => {
					Should(detail).eql(null);
					resolve();
				})
				Localization.clear();
			}).should.be.resolved();
		})
	it("exposes api in window", () => {
		window.cepharumI18n.should.not.be.undefined();
		window.cepharumI18n.should.have.property("Locale");
		window.cepharumI18n.should.have.property("Localization");
		window.cepharumI18n.should.have.property("Translate");
		window.cepharumI18n.should.have.property("Format");
	})
} );

