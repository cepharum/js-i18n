# js-i18n

an i18n service for Javascript

## License

MIT

## About

This module provides a commonly useful implementation for handling i18n and l10n in Javascript-based applications. 

## Installation

`npm i --save @cepharum/js-i18n`

## Usage

This library has been created with VueJS in mind, but it is suitable to work with any other Javascript-based framework as well.

### Translations

Translations are hierarchically organized in a tree of regular Javascript objects. Thus you may use a Javascript module or some JSON file to implement either set of translations.

```javascript
// German translations in a JS module
module.exports = {
	header: {
		headline: "Überschrift",
	},
	HOME: {
		WELCOME: "Herzlich Willkommen!",
	},
};
```

```json
{
	"header": {
		"headline": "Überschrift"
	},
	"HOME": {
		"WELCOME": "Herzlich Willkommen!"
	}
}
```

### Required: Setting up Supported Locales

Translations must be registered with provided Localizations Manager:

```javascript
import { Localization } from "@cepharum/js-i18n";
import TranslationsModule from "./de.js";

Localization.register( "de", TranslationsModule );
```

This would require to explicitly load translations of all locales to be probably used. An advanced initialization is provided by using `Localization.initialize()`:

```javascript
import { Localization } from "@cepharum/js-i18n";

Localization.initialize( locale => import( `./${locale.language}` ) )
	.then( currentLocale => {
		// TODO start your application here
	} );
```

This will try loading translations according to discovered sequence of locales accepted by current browser/user. In addition it helps with lazy-loading any translation:

```javascript
import { Localization } from "@cepharum/js-i18n";

Localization.initialize( locale => {
	switch ( locale.language ) {
		case "de" :
			return import( /* webpackChunkName: "de-de" */ `./de.js` );

		default :
			return import( `./${locale.language}.js` );
	}
} )
	.then( currentLocale => {
		// TODO start your application here
	} );
```

### Looking Up

The current locale's translations are available using `Localization.current`. The method `lookup()` is searching the tree for a translation matching path name into tree provided in first argument:

```javascript
Localization.current.lookup( "@home.welcome" );
```

Using the translations above this will return "Herzlich Willkommen!".

#### Look-Up Key Syntax

As you can see in example above the path name starts with a prefixing `@` which is followed by a period-separated sequence of one or more segments with each segment selecting property of next level in a tree of translations. Every such segment is processed case-insensitively and may consist of latin letters, digits, dash and underscore.

```
@<segment>.<segment>.<segment>
```

Neither length of path name nor the number of contained segments is limited.

#### Looking Up Everything

The `lookup()` method is testing whether first argument complies with the format described before.

* A well-formed look-up key is used to find a matching node in current locale's tree of translations. If there is no matching node in tree some provided fallback or `null` is returned instead.

* On providing some string that does not comply with the syntax of a look-up key it is returned as-is. 

Distinguishing between look-up keys and arbitrary strings is designed to help with passing every string to conveniently localize as much internationalized strings as possible while keeping all non-internationalized strings untouched.

#### Looking Up Threads of Tree

Usually looking up translations is designed to result in a leaf of tree, thus returning a string. However, on using shorter look-up keys a thread may be addressed and thus gets returned instead:

```javascript
Localization.current.lookup( "@home" );
```

This will return

```json
{
	"welcome": "Herzlich Willkommen!"
}
``` 

#### Fallbacks

You can explicitly provide a fallback in second argument to be used in case of look up fails:

```javascript
Localization.current.lookup( "@home.subtitle", "We are happy to see you here!" );
```

This wil return "We are happy to see you here!" when used with translations given above.

Optionally, fallback can be provided implicitly as part of look-up key:

```javascript
Localization.current.lookup( "@home.subtitle=We are here for you!", "We are happy to see you here!" );
```

This look-up key follows this basic syntax:

```
<look-up key> = <fallback>
```

The previously introduced look-up key is extended by an assigment operator to mark start of implicit fallback string. The implicit fallback is always preferred over the explicitly provided one, so the example above will return "We are here for you!" on mismatching tree of translations.

Implicit fallbacks may be arbitrary strings, but they can't be threads of tree. This limitation does not apply to explicit fallbacks. Thus, explicit fallbacks may be used with supporting different numeri and genera, as well.

#### Looking Up by Numerus

In third argument you may provide number of subjects/objects to be described by translation. A locale-specific function is used internally to map the provided number of items onto the name of a numerus. This name is then used to select another level in tree of translations.

```javascript
import { Localization } from "@cepharum/js-i18n";

Localization.register( "en", {
	search: { result: {
		singular: "There is %d product matching all filter criteria.",
		plural: "There are %d products matching all filter criteria.",
	} }
} );

Localization.select( "en" );

const translated = Localization.lookup( "@search.result", null, numSearchResults );

console.log( util.format( translated, numSearchResults ) );
```

If value in `numSearchResults` is `1`, this lookup will return the string _There is %d product matching all filter criteria._. Otherwise it is returning the plural form _There are %d products matching all filter criteria._.

This basic support for numerus-aware translations doesn't support proper translations of sentences with multiple numerus-aware elements. Here the term _all filter criteria_ is always in its plural form even though it might be possible to have a different translation in case of user was applying single filter, only.

#### Looking Up by Genus

In fourth argument you may provide name of genus to be used to find translation depending on a subject's or an object's genus. There is no fixed set of supported names. In addition, the name isn't processed using some locale-specific function like numerus before. Thus you should decide to have a reasonable set of names used throughout your whole set of translations. We'd consider using genera `male` and `female` here.

```javascript
import { Localization } from "@cepharum/js-i18n";

Localization.register( "en", {
	mail: { action: { pickRecipient: {
		male: "Send him a mail.",
		female: "Send her a mail.",
	} } }
} );

Localization.select( "en" );

console.log( Localization.lookup( "@mail.action.pickRecipient", null, null, gender ) );
```

If value in `genera` is `male`, this lookup will return the string _Send him a mail._ If value is `female` the returned string is _Send her a mail._ 

Due to the nature of looking up translations providing any other value for selecting genus results in a mismatch returning `null` unless providing fallback or having some _catch-all translation_:

```
Localization.register( "en", {
	mail: { action: { pickRecipient: {
		male: "Send him a mail.",
		female: "Send her a mail.",
		"*": "Pick as recipient.",
	} } }
} );
``` 

> Catch-all translations are supported for numerus and for genus, though this feature isn't considered stable and might be revised, replaced or removed in a future release.

#### Combining Numerus and Genus

You can also combine look-up by numerus and by genus. The key should address a thread of your tree of translations just like before. This should handle numerus first, genus second:

```javascript
import { Localization } from "@cepharum/js-i18n";

Localization.register( "en", {
	present: { action: {
		singular: {
			male: "Give him %d item.",
			female: "Give her %d item.",
		},
		plural: {
			male: "Give him %d items.",
			female: "Give her %d items.",
		},
	} }
} );

Localization.select( "en" );

console.log( Localization.lookup( "@present.action", null, numItems, gender ) );
```

### Filtering in VueJS

As mentioned before this i18n library has been designed for use with VueJS applications. It comes with a function suitable as a [filter](https://vuejs.org/v2/guide/filters.html#ad) for VueJS.

You should register localization as early as possible. Here we inject it in application's **main.js** initializing localization prior to actually starting VueJS framework using `Localization.initialize()`:

```javascript
import Vue from "vue";

import { Localization, Translate, Format } from "@cepharum/js-i18n";

Localization.initialize( locale => import( `../i18n/${locale.language}.js` ) )
	.then( () => {
		Vue.filter( "translate", Translate );
		Vue.filter( "format", Format );

		new Vue( {
			...
		} ).$mount( "#app" );
	} )
	.catch( error => {
		console.error( error );
	} );
```

Due to this initialization filters `translate` and `format` are available in template of either component:

```vue
<h1>{{ '@Header.Title=Welcome!' | translate }}</h1>
<p>{{ '@present.action=Give %d item(s) | translate( { number: numItems, genus: recipientGender } ) | format( numItems ) }}</p>
```

* Filter `translate` takes input string for looking up. Optional argument might be object providing number of items in property `number` and/or genus in property `genus`. The output is found translation, some fallback or provided string if it doesn't comply with look-up key syntax or on mismatch w/o provision of a fallback.

* Filter `format` has been implemented to help with filling placeholders in a resulting translation. It uses a subset of printf syntax. Its arguments are consecutively used as values of encountered placeholders. Every placeholder starts with a percent sign and ends with a type marker. Between these two options may be inserted. The syntax is similar to this pattern:

      '%' <fill> <width> <precision> <ref> <type marker>

  | type marker | example | remarks    |
  | ----------- | --- | --- |
  | % | `%%` | Replaces placeholder with literal `%`. |
  | s | `%s` | Inserts string value of next argument. |
  | d | `%d` | Inserts integer numeric value of next argument. |
  | x | `%x` | Inserts hexadecimal integer value of next argument using lowercase letters for digits a-f. |
  | X | `%X` | Inserts hexadecimal integer value of next argument using uppercase letters for digits A-F. |
  | f | `%f` | Inserts fixed-point numeric value of next argument. |
  | . | `%.` | Consumes next argument replacing placeholder with empty string. |
  
  Placeholders are processed from left to right with each regular placeholder consuming another argument provided on calling filter `format`. The placeholder `%.` can be used to skip a single argument without generating any output. 
  
  Another approach is using argument references. A reference consists of a dollar sign `$` followed by a positive integer value selecting argument in list of arguments by position with `1` referring to the first argument. Using a reference doesn't consume next argument. 
  
  > **Example:** The placeholder `%$1s` requests to inject value of argument as string no matter whether other placeholders might have consumed arguments before or not.
  
  The placeholder components `<fill>`, `<width>` and `<precision>` are all available to control vertical alignment of injected value:
  
  * `<width>` is a positive integer requesting to fill any value to generate at least this number of characters. Fill is applied left to the value, thus resulting in a right-aligned value.
  
  * `<precision>` is a positive integer requesting number of fractional digits to be displayed on decimal values. On all other types of placeholders this will result in a according number of space appended to the injected value to align it with decimal separator of decimal numbers.
  
  * The `<fill>` might be period, dash, underscore, space or `0`. It is selecting what character is used to fill value on behalf of `<width>`.
  
  In opposition to regular printf syntax `<width>` and `<precision>` are handled separately and thus `<width>` doesn't cover `<precision>`. The resulting width of a generated output is the sum of `<width>` and `<precision>` plus 1 for the separator in case of actually using `<precision>`.
  
  The `<sep>` is either `.` or `,` and controls what separator is used on processing decimal values.
  
  > **Examples:**
  >
  > * `%s` with `Hello` generates `Hello`.
  > * `%8s` with `Hello` generates `Hello` with 3 additional spaces to the left.
  > * `%4.2d` with `132.7865` generates `132.79` with 1 additional space to the left.
  > * `%,2d` with `132.7865` generates `132,79`.
  > * `%06,2d` with `132.7865` generates `000132,79`.
