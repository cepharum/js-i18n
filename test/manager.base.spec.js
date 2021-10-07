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
import { describe, it } from "mocha";
import "should";
import { BaseManager, BaseEvent } from "../lib/context/base.js";

describe( "Base Manager is a base class that", () => {
	it( "can be constructed", () => {
		BaseManager.should.have.property( "constructor" );
		( () => new BaseManager() ).should.not.throw();
	} );

	it( "provides a BaseEvent class", () => {
		BaseEvent.should.have.property( "constructor" );
		( () => new BaseEvent() ).should.not.throw();
	} );

	it( "has method dispatchEvent, that is a placeholder and throws if invoked", () => {
		const manager = new BaseManager();
		manager.dispatchEvent.should.be.a.Function();
		manager.dispatchEvent.length.should.eql( 1 );
		( () => manager.dispatchEvent() ).should.throw();
	} );

	it( "has method addEventListener, that is a placeholder and throws if invoked", () => {
		const manager = new BaseManager();
		manager.addEventListener.should.be.a.Function();
		manager.addEventListener.length.should.eql( 2 );
		( () => manager.addEventListener() ).should.throw();
	} );

	it( "has method removeEventListener, that is a placeholder and throws if invoked", () => {
		const manager = new BaseManager();
		manager.removeEventListener.should.be.a.Function();
		manager.removeEventListener.length.should.eql( 2 );
		( () => manager.removeEventListener() ).should.throw();
	} );
} );
