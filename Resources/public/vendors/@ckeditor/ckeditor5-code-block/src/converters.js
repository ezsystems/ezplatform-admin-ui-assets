/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/converters
 */

import {
	rawSnippetTextToModelDocumentFragment,
	getPropertyAssociation
} from './utils';

/**
 * A model-to-view (both editing and data) converter for the `codeBlock` element.
 *
 * Sample input:
 *
 *		<codeBlock language="javascript">foo();<softBreak></softBreak>bar();</codeBlock>
 *
 * Sample output (editing):
 *
 *		<pre data-language="JavaScript"><code class="language-javascript">foo();<br />bar();</code></pre>
 *
 * Sample output (data, see {@link module:code-block/converters~modelToDataViewSoftBreakInsertion}):
 *
 *		<pre><code class="language-javascript">foo();\nbar();</code></pre>
 *
 * @param {module:engine/model/model~Model} model
 * @param {Array.<module:code-block/codeblock~CodeBlockLanguageDefinition>} languageDefs The normalized language
 * configuration passed to the feature.
 * @param {Boolean} [useLabels=false] When `true`, the `<pre>` element will get a `data-language` attribute with a
 * human–readable label of the language. Used only in the editing.
 * @returns {Function} Returns a conversion callback.
 */
export function modelToViewCodeBlockInsertion( model, languageDefs, useLabels = false ) {
	// Language CSS classes:
	//
	//		{
	//			php: 'language-php',
	//			python: 'language-python',
	//			javascript: 'js',
	//			...
	//		}
	const languagesToClasses = getPropertyAssociation( languageDefs, 'language', 'class' );

	// Language labels:
	//
	//		{
	//			php: 'PHP',
	//			python: 'Python',
	//			javascript: 'JavaScript',
	//			...
	//		}
	const languagesToLabels = getPropertyAssociation( languageDefs, 'language', 'label' );

	return ( evt, data, conversionApi ) => {
		const { writer, mapper, consumable } = conversionApi;

		if ( !consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const codeBlockLanguage = data.item.getAttribute( 'language' );
		const targetViewPosition = mapper.toViewPosition( model.createPositionBefore( data.item ) );
		const preAttributes = {};

		// Attributes added only in the editing view.
		if ( useLabels ) {
			preAttributes[ 'data-language' ] = languagesToLabels[ codeBlockLanguage ];
			preAttributes.spellcheck = 'false';
		}

		const pre = writer.createContainerElement( 'pre', preAttributes );
		const code = writer.createContainerElement( 'code', {
			class: languagesToClasses[ codeBlockLanguage ] || null
		} );

		writer.insert( writer.createPositionAt( pre, 0 ), code );
		writer.insert( targetViewPosition, pre );
		mapper.bindElements( data.item, code );
	};
}

/**
 * A model-to-data view converter for the new line (`softBreak`) separator.
 *
 * Sample input:
 *
 *		<codeBlock ...>foo();<softBreak></softBreak>bar();</codeBlock>
 *
 * Sample output:
 *
 *		<pre><code ...>foo();\nbar();</code></pre>
 *
 * @param {module:engine/model/model~Model} model
 * @returns {Function} Returns a conversion callback.
 */
export function modelToDataViewSoftBreakInsertion( model ) {
	return ( evt, data, conversionApi ) => {
		if ( data.item.parent.name !== 'codeBlock' ) {
			return;
		}

		const { writer, mapper, consumable } = conversionApi;

		if ( !consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const position = mapper.toViewPosition( model.createPositionBefore( data.item ) );

		writer.insert( position, writer.createText( '\n' ) );
	};
}

/**
 * A view-to-model converter for `<pre>` with the `<code>` HTML.
 *
 * Sample input:
 *
 *		<pre><code class="language-javascript">foo();\nbar();</code></pre>
 *
 * Sample output:
 *
 *		<codeBlock language="javascript">foo();<softBreak></softBreak>bar();</codeBlock>
 *
 * @param {module:engine/view/view~View} editingView
 * @param {Array.<module:code-block/codeblock~CodeBlockLanguageDefinition>} languageDefs The normalized language
 * configuration passed to the feature.
 * @returns {Function} Returns a conversion callback.
 */
export function dataViewToModelCodeBlockInsertion( editingView, languageDefs ) {
	// Language names associated with CSS classes:
	//
	//		{
	//			'language-php': 'php',
	//			'language-python': 'python',
	//			js: 'javascript',
	//			...
	//		}
	const classesToLanguages = getPropertyAssociation( languageDefs, 'class', 'language' );
	const defaultLanguageName = languageDefs[ 0 ].language;

	return ( evt, data, conversionApi ) => {
		const viewItem = data.viewItem;
		const viewChild = viewItem.getChild( 0 );

		if ( !viewChild || !viewChild.is( 'element', 'code' ) ) {
			return;
		}

		const { consumable, writer } = conversionApi;

		if ( !consumable.test( viewItem, { name: true } ) || !consumable.test( viewChild, { name: true } ) ) {
			return;
		}

		const codeBlock = writer.createElement( 'codeBlock' );
		const viewChildClasses = [ ...viewChild.getClassNames() ];

		// As we're to associate each class with a model language, a lack of class (empty class) can be
		// also associated with a language if the language definition was configured so. Pushing an empty
		// string to make sure the association will work.
		if ( !viewChildClasses.length ) {
			viewChildClasses.push( '' );
		}

		// Figure out if any of the <code> element's class names is a valid programming
		// language class. If so, use it on the model element (becomes the language of the entire block).
		for ( const className of viewChildClasses ) {
			const language = classesToLanguages[ className ];

			if ( language ) {
				writer.setAttribute( 'language', language, codeBlock );
				break;
			}
		}

		// If no language value was set, use the default language from the config.
		if ( !codeBlock.hasAttribute( 'language' ) ) {
			writer.setAttribute( 'language', defaultLanguageName, codeBlock );
		}

		// HTML elements are invalid content for `<code>`.
		// Read only text nodes.
		const textData = [ ...editingView.createRangeIn( viewChild ) ]
			.filter( current => current.type === 'text' )
			.map( ( { item } ) => item.data )
			.join( '' );
		const fragment = rawSnippetTextToModelDocumentFragment( writer, textData );

		writer.append( fragment, codeBlock );

		// Let's try to insert code block.
		if ( !conversionApi.safeInsert( codeBlock, data.modelCursor ) ) {
			return;
		}

		consumable.consume( viewItem, { name: true } );
		consumable.consume( viewChild, { name: true } );

		conversionApi.updateConversionResult( codeBlock, data );
	};
}
