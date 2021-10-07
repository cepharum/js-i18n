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
import getVueLocalization from "../lib/adapter/vue.js";
import Should from "should";
import * as vue from "vue";
import { Localization } from "../lib/index.js";

const{ reactive, isProxy, computed, readonly } = vue;

describe( "the vue adapter", () => {
	afterEach( () => {
		Localization.clear();
	} );
	it( "is a function", () => {
		getVueLocalization.should.be.a.Function();
	} );
	it( "throws when something other than the vue module is passed", () => {
		Should( () => getVueLocalization( { } ).should.be.ok() ).throw();
		Should( () => getVueLocalization( [] ).should.be.ok() ).throw();
		Should( () => getVueLocalization( "vue" ).should.be.ok() ).throw();
		Should( () => getVueLocalization( 123 ).should.be.ok() ).throw();
		Should( () => getVueLocalization( undefined ).should.be.ok() ).throw();
		Should( () => getVueLocalization( null ).should.be.ok() ).throw();
	} );
	it( "can be initialised by passing the vue module", () => {
		getVueLocalization( vue ).should.be.ok();
	} );
	it( "returns a reactive vue object", () => {
		vue.isReactive( getVueLocalization( vue ) ).should.be.true();
	} );
	it( "returns a reactive vue object that provides a locale tag", () => {
		const reactiveObject = getVueLocalization( vue );
		reactiveObject.locale.should.be.a.String();
	} );
	it( "returns a reactive vue object that provides a locale tag that is reactive", async () => {
		const reactiveObject = getVueLocalization( vue );
		Localization.register( "de", {
			test: "foo",
		} );
		Localization.register( "en", {
			test: "bar",
		} );
		reactiveObject.locale.should.eql( "any" );
		await Localization.select( "de", true );
		reactiveObject.locale.should.eql( "de" );
		await Localization.select( "en", true );
		reactiveObject.locale.should.eql( "en" );
	} );
	it( "returns reactive object that provides a localize function", () => {
		const reactiveObject = getVueLocalization( vue );
		reactiveObject.localize.should.be.a.Function();
	} );
	it( "returns reactive object that provides a localize function that is updated on LocaleChanged Event", async () => {
		const reactiveObject = getVueLocalization( vue );
		Localization.register( "de", {
			test: "foo",
		} );
		Localization.register( "en", {
			test: "bar",
		} );
		reactiveObject.locale.should.eql( "any" );
		reactiveObject.localize( {de: "foo", en: "bar"} ).should.be.a.eql( "bar" );
		await Localization.select( "de", true );
		reactiveObject.locale.should.eql( "de" );
		reactiveObject.localize( {de: "foo", en: "bar"} ).should.be.a.eql( "foo" );
		await Localization.select( "en", true );
		reactiveObject.locale.should.eql( "en" );
		reactiveObject.localize( {de: "foo", en: "bar"} ).should.be.a.eql( "bar" );
	} );
	it( "returns reactive object that provides a lookup function", () => {
		const reactiveObject = getVueLocalization( vue );
		reactiveObject.lookup.should.be.a.Function();
	} );
	it( "returns reactive object that provides a lookup function that is updated on LocaleChanged Event", async () => {
		const reactiveObject = getVueLocalization( vue );
		Localization.register( "de", {
			test: "foo",
		} );
		Localization.register( "en", {
			test: "bar",
		} );
		reactiveObject.locale.should.eql( "any" );
		Should(reactiveObject.lookup( "@test" )).be.null();
		await Localization.select( "de", true );
		reactiveObject.locale.should.eql( "de" );
		reactiveObject.lookup( "@test" ).should.be.a.eql( "foo" );
		await Localization.select( "en", true );
		reactiveObject.locale.should.eql( "en" );
		reactiveObject.lookup( "@test" ).should.be.a.eql( "bar" );
	} );
	it("is reactive", async () => {
		Localization.register( "de", {
			test: "foo",
		} );
		Localization.register( "en", {
			test: "bar",
		} );
		const reactiveObject = getVueLocalization( vue );
		const computedLookup = computed(() => reactiveObject.lookup("@test"))
		const computedLocalize = computed(() => reactiveObject.localize({de: "foo", en: "bar"}))
		await Localization.select( "de", true );
		reactiveObject.locale.should.eql("de");
		reactiveObject.localize({de: "foo", en: "bar"}).should.eql("foo");
		reactiveObject.lookup("@test").should.eql("foo");
		computedLookup.value.should.eql("foo");
		computedLocalize.value.should.eql("foo");
		await Localization.select("en", true);
		reactiveObject.locale.should.eql("en");
		reactiveObject.localize({de: "foo", en: "bar"}).should.eql("bar");
		reactiveObject.lookup("@test").should.eql("bar");
		computedLookup.value.should.eql("bar");
		computedLocalize.value.should.eql("bar");
	})
} );
