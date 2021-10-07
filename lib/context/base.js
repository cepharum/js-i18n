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

/**
 * base class for events emitable with manager
 */
export class BaseEvent {
	/**
	 * @param {string} type type of event
	 * @param {any} detail data to be carried by event
	 */
	constructor( type, { detail } = {} ) {
		this.type = type;
		this.detail = detail;
	}
}

/**
 * Base Manager that emits events and manages listener for those events
 */
export class BaseManager {
	/**
	 * Event class for emitable Events
	 * @returns {BaseEvent} Event class
	 */
	get Event() {
		return BaseEvent;
	}

	/**
	 * emits an event
	 *
	 * @param{BaseEvent} event event to be emitted
	 * @returns{void}
	 */
	dispatchEvent( event ) {
		throw new Error( "called method of base class" );
	}


	/**
	 * adds eventListener that is called when event with given type is emitted
	 *
	 * @param{string} type type of event that triggers the listener
	 * @param{function} listener functions that is called when event is emmitted
	 * @returns{void}
	 */
	addEventListener( type, listener ) {
		throw new Error( "called method of base class" );
	}

	/**
	 * removes eventListener that was previously added through addEventListener
	 *
	 * @param{string} type type of event that triggers the listener
	 * @param{function} listener functions that is called when event is emmitted
	 * @returns{void}
	 */
	removeEventListener( type, listener ) {
		throw new Error( "called method of base class" );
	}
}
