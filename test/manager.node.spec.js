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
import { describe, it, afterEach, beforeEach } from "mocha";
import Should from "should";
import NodeManager, { getNodeManager } from "../lib/context/node.js";
import getManager from "../lib/context/index.js";


import { Localization } from "../lib/index.js";

describe( "Localization is a class that in a node Environment", () => {
	beforeEach( () => {
		const manager = getNodeManager();
		manager.clear( "cepharumLocaleChanged" );
		Localization.clear();
	} );

	afterEach( () => {
		const manager = getNodeManager();
		manager.clear( "cepharumLocaleChanged" );
		Localization.clear();
	} );

	it( "index returns an instance of NodeManager", () => {
		getManager().should.be.instanceof( NodeManager );
	} );

	it( "that emits an event when the locale changes", () => {
		return new Promise( resolve => {
			const manager = getNodeManager();
			manager.addEventListener( "cepharumLocaleChanged", ( { detail } ) => {
				detail.should.be.instanceof( Localization );
				detail.locale.tag.should.eql( "de" );
				resolve();
			} );
			Localization.register( "de", {} );
			Localization.select( "de", true );
		} ).should.be.resolved();
	} );
	it( "that emits an event when clear() is called", () => {
		Localization.initialize( () => ( {} ) );
		return new Promise( resolve => {
			const manager = getNodeManager();
			const listener = ( { detail } ) => {
				Should( detail ).eql( null );
				resolve();
				manager.removeEventListener( "cepharumLocaleChanged", listener );
			};
			manager.addEventListener( "cepharumLocaleChanged", listener );
			Localization.clear();
		} ).should.be.resolved();
	} );
} );

