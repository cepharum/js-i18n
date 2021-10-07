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
import getManager from "../context/index.js";
import { Localization } from "../localization.js";
import { readonly } from "vue";

let adapter = null;

/**
 * initializes and caches an adapter for vue3 applications
 * @param {{reactive:Function}} vue vue library
 * @returns {null|*} adapter
 */
export function getVueAdapater( vue ) {
	if( adapter ) return adapter;
	const manager = getManager();
	const { reactive } = vue;
	if( !reactive ) {
		throw new Error( "detected wrong version of vue" );
	}
	adapter = reactive( {
		lookup: key => Localization.current.lookup( key ),
		localize: input => Localization.current.locale.selectLocalized( input ),
		locale: Localization.current.locale.tag
	} );
	manager.addEventListener( "cepharumLocaleChanged", e => {
		const localization = e.detail || Localization.current;
		adapter.lookup = key => localization.lookup( key );
		adapter.localize = input => localization.locale.selectLocalized( input );
		adapter.locale = localization.locale.tag;
	} );
	return readonly( adapter );
}

export default getVueAdapater;
