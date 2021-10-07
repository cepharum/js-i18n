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
import { describe, it, afterEach, after, before } from "mocha";
import Should from "should";

import Localization from "../lib/localization.js";
import getManager from "../lib/context/index.js";
import {BrowserManager} from "../lib/context/browser.js";

let eventListener = {};
// eslint-disable-next-line require-jsdoc
function addEventListener( key, cb ) {
	eventListener[key] = cb;
}// eslint-disable-next-line require-jsdoc
function removeEventListener( key ) {
	eventListener[key] = undefined;
}
// eslint-disable-next-line require-jsdoc
function dispatchEvent( e ) {
	const listener = eventListener[e.type];
	if( listener ) listener( e );
}

describe( "Localization is a class in a Browser Environment", () => {
	before(function (){
		global.window = {
			addEventListener,
			dispatchEvent,
			removeEventListener,
		};

		global.CustomEvent = class {
			constructor( type, { detail } = {} ) {
				this.type = type;
				this.detail = detail;
			}
		};
	})

	afterEach( () => {
		getManager().removeEventListener("cepharumLocaleChanged");
		Localization.clear();
	} );

	after(function () {
		Localization.clear();
		global.CustomEvent = undefined;
		global.window = undefined;
	})

	it( "index returns an instance of BrowserManager", () => {
		getManager().should.be.instanceof( BrowserManager );
	} );

	it( "that emits an event when the locale changes", () => {
		return new Promise( resolve => {
			window.addEventListener( "cepharumLocaleChanged", ( { detail } ) => {
				detail.locale.tag.should.eql( "de" );
				resolve();
			} );
			Localization.register( "de", {} );
			Localization.select( "de", true );
		} ).should.be.resolved();
	} );

	it( "that emits an event when clear() is called", async () => {
		await Localization.initialize( () => ( {} ), () => ["de"] );
		return new Promise( resolve => {
			window.addEventListener( "cepharumLocaleChanged", ( { detail } ) => {
				Should( detail ).eql( null );
				resolve();
			} );
			Localization.clear();
		} ).should.be.resolved();
	} );

	it( "that emits an event through context when the locale changes", () => {
		return new Promise( resolve => {
			getManager().addEventListener( "cepharumLocaleChanged", ( { detail } ) => {
				detail.locale.tag.should.eql( "de" );
				resolve();
			} );
			Localization.register( "de", {} );
			Localization.select( "de", true );
		} ).should.be.resolved();
	} );

	it( "that emits an event through context when clear() is called", async () => {
		await Localization.initialize( () => ( {} ), () => ["de"] );
		return new Promise( resolve => {
			getManager().addEventListener( "cepharumLocaleChanged", ( { detail } ) => {
				Should( detail ).eql( null );
				resolve();
			} );
			Localization.clear();
		} ).should.be.resolved();
	} );

	it( "that exposes api in window", async () => {
		await Localization.initialize( () => ( {} ), () => ["de"] );
		Should(window.cepharumI18n).not.be.undefined();
		Should(window.cepharumI18n).have.property( "Locale" );
		Should(window.cepharumI18n).have.property( "Localization" );
		Should(window.cepharumI18n).have.property( "translate" );
		Should(window.cepharumI18n).have.property( "format" );
	} );

	it( "does warn if api already exposed in window", async () => {
		const warn = console.warn;
		let count = 0;
		console.warn = () => {count ++};
		new BrowserManager();
		new BrowserManager();
		console.warn = warn;
		count.should.be.greaterThan(0);
	} );

	it("browser manager throws if e non event is dispatched", () => {
		const manager = new BrowserManager();
		(() => manager.dispatchEvent("anything" )).should.throw();
		(() => manager.dispatchEvent([])).should.throw();
		(() => manager.dispatchEvent({})).should.throw();
		(() => manager.dispatchEvent(1)).should.throw();
	})
} );

