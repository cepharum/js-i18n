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

import { BaseEvent, BaseManager } from "./base.js";
import EventEmitter from "events";
let emitter = null;
let manager = null;

/**
 * returns and caches an instance of the manager
 * @returns {NodeManager} Manager instance
 */
export function getNodeManager() {
	if( manager == null ) {
		manager = new NodeManager();
	}
	return manager;
}

/**
 * Manager for Node context
 */
export class NodeManager extends BaseManager {
	/**
	 * constructor
	 */
	constructor() {
		super();
		if( emitter == null ) {
			emitter = new EventEmitter();
		}
	}


	/**
	 * @inheritDoc
	 */
	dispatchEvent( e ) {
		const { type, detail } = e;
		emitter.emit( type, detail );
	}

	/**
	 * @inheritDoc
	 */
	addEventListener( type, listener ) {
		emitter.on( type, detail => {
			listener( new BaseEvent( type, { detail } ) );
		} );
	}

	/**
	 * @inheritDoc
	 */
	removeEventListener( type, listener ) {
		emitter.removeListener( type, listener );
	}

	/**
	 * removes all Listener
	 * @param{string} type type of Event to remove
	 * @returns{void}
	 */
	 clear( type ) {
		emitter.removeAllListeners( type );
	}
}

export default NodeManager;
