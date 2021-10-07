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
import { BaseManager } from "./base.js";
import * as lib from "../index.js";
let manager = null;

/**
 * returns and caches an instance of the manager
 * @returns {NodeManager} Manager instance
 */
export function getBrowserManager() {
	if( manager == null ) {
		manager = new BrowserManager();
	}
	return manager;
}

/**
 * Manager for Browser Context
 */
export class BrowserManager extends BaseManager {
	/**
	 * constructor that exposes api in window
	 * */
	constructor() {
		super();

		if( window.cepharumI18n ) {
			console.warn( "could not expose api, cepharumI18n was already registered" );
		} else {
			window.cepharumI18n = lib;
		}
	}

	/**
	 * @inheritDoc
	 */
	dispatchEvent( event ) {
		if( !( event instanceof this.Event ) ) throw new Error( "event should be instance of event class" );
		window.dispatchEvent( new CustomEvent( event.type, { detail: event.detail } ) );
	}

	/**
	 * @inheritDoc
	 */
	addEventListener( type, listener ) {
		window.addEventListener( type, listener );
	}

	/**
	 * @inheritDoc
	 */
	removeEventListener( type, listener ) {
		window.removeEventListener( type, listener );
	}
}

