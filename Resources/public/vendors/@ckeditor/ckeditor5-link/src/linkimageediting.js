/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkimageediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { Matcher } from 'ckeditor5/src/engine';
import { toMap } from 'ckeditor5/src/utils';

import LinkEditing from './linkediting';

import linkIcon from '../theme/icons/link.svg';

/**
 * The link image engine feature.
 *
 * It accepts the `linkHref="url"` attribute in the model for the {@link module:image/image~Image `<image>`} element
 * which allows linking images.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LinkImageEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ 'ImageEditing', LinkEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'LinkImageEditing';
	}

	init() {
		const editor = this.editor;

		editor.model.schema.extend( 'image', { allowAttributes: [ 'linkHref' ] } );

		editor.conversion.for( 'upcast' ).add( upcastLink() );
		editor.conversion.for( 'editingDowncast' ).add( downcastImageLink( { attachIconIndicator: true } ) );
		editor.conversion.for( 'dataDowncast' ).add( downcastImageLink( { attachIconIndicator: false } ) );

		// Definitions for decorators are provided by the `link` command and the `LinkEditing` plugin.
		this._enableAutomaticDecorators();
		this._enableManualDecorators();
	}

	/**
	 * Processes {@link module:link/link~LinkDecoratorAutomaticDefinition automatic decorators} definitions and
	 * attaches proper converters that will work when linking an image.`
	 *
	 * @private
	 */
	_enableAutomaticDecorators() {
		const editor = this.editor;
		const command = editor.commands.get( 'link' );
		const automaticDecorators = command.automaticDecorators;

		if ( automaticDecorators.length ) {
			editor.conversion.for( 'downcast' ).add( automaticDecorators.getDispatcherForLinkedImage() );
		}
	}

	/**
	 * Processes transformed {@link module:link/utils~ManualDecorator} instances and attaches proper converters
	 * that will work when linking an image.
	 *
	 * @private
	 */
	_enableManualDecorators() {
		const editor = this.editor;
		const command = editor.commands.get( 'link' );
		const manualDecorators = command.manualDecorators;

		for ( const decorator of command.manualDecorators ) {
			editor.model.schema.extend( 'image', { allowAttributes: decorator.id } );
			editor.conversion.for( 'downcast' ).add( downcastImageLinkManualDecorator( manualDecorators, decorator ) );
			editor.conversion.for( 'upcast' ).add( upcastImageLinkManualDecorator( manualDecorators, decorator ) );
		}
	}
}

// Returns a converter that consumes the 'href' attribute if a link contains an image.
//
// @private
// @returns {Function}
function upcastLink() {
	return dispatcher => {
		dispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
			const viewLink = data.viewItem;
			const imageInLink = getFirstImage( viewLink );

			if ( !imageInLink ) {
				return;
			}

			// There's an image inside an <a> element - we consume it so it won't be picked up by the Link plugin.
			const consumableAttributes = { attributes: [ 'href' ] };

			// Consume the `href` attribute so the default one will not convert it to $text attribute.
			if ( !conversionApi.consumable.consume( viewLink, consumableAttributes ) ) {
				// Might be consumed by something else - i.e. other converter with priority=highest - a standard check.
				return;
			}

			const linkHref = viewLink.getAttribute( 'href' );

			// Missing the 'href' attribute.
			if ( !linkHref ) {
				return;
			}

			// A full definition of the image feature.
			// figure > a > img: parent of the view link element is an image element (figure).
			let modelElement = data.modelCursor.parent;

			if ( !modelElement.is( 'element', 'image' ) ) {
				// a > img: parent of the view link is not the image (figure) element. We need to convert it manually.
				const conversionResult = conversionApi.convertItem( imageInLink, data.modelCursor );

				// Set image range as conversion result.
				data.modelRange = conversionResult.modelRange;

				// Continue conversion where image conversion ends.
				data.modelCursor = conversionResult.modelCursor;

				modelElement = data.modelCursor.nodeBefore;
			}

			if ( modelElement && modelElement.is( 'element', 'image' ) ) {
				// Set the linkHref attribute from link element on model image element.
				conversionApi.writer.setAttribute( 'linkHref', linkHref, modelElement );
			}
		}, { priority: 'high' } );
		// Using the same priority that `upcastImageLinkManualDecorator()` converter guarantees
		// that manual decorators will decorate the proper element.
	};
}

// Return a converter that adds the `<a>` element to data.
//
// @private
// @params {Object} options
// @params {Boolean} options.attachIconIndicator=false If set to `true`, an icon that informs about the linked image will be added.
// @returns {Function}
function downcastImageLink( options ) {
	return dispatcher => {
		dispatcher.on( 'attribute:linkHref:image', ( evt, data, conversionApi ) => {
			// The image will be already converted - so it will be present in the view.
			const viewFigure = conversionApi.mapper.toViewElement( data.item );
			const writer = conversionApi.writer;

			// But we need to check whether the link element exists.
			const linkInImage = Array.from( viewFigure.getChildren() ).find( child => child.name === 'a' );

			let linkIconIndicator;

			if ( options.attachIconIndicator ) {
				// Create an icon indicator for a linked image.
				linkIconIndicator = writer.createUIElement( 'span', { class: 'ck ck-link-image_icon' }, function( domDocument ) {
					const domElement = this.toDomElement( domDocument );
					domElement.innerHTML = linkIcon;

					return domElement;
				} );
			}

			// If so, update the attribute if it's defined or remove the entire link if the attribute is empty.
			if ( linkInImage ) {
				if ( data.attributeNewValue ) {
					writer.setAttribute( 'href', data.attributeNewValue, linkInImage );
				} else {
					const viewImage = Array.from( linkInImage.getChildren() ).find( child => child.name === 'img' );

					writer.move( writer.createRangeOn( viewImage ), writer.createPositionAt( viewFigure, 0 ) );
					writer.remove( linkInImage );
				}
			} else {
				// But if it does not exist. Let's wrap already converted image by newly created link element.
				// 1. Create an empty link element.
				const linkElement = writer.createContainerElement( 'a', { href: data.attributeNewValue } );

				// 2. Insert link inside the associated image.
				writer.insert( writer.createPositionAt( viewFigure, 0 ), linkElement );

				// 3. Move the image to the link.
				writer.move( writer.createRangeOn( viewFigure.getChild( 1 ) ), writer.createPositionAt( linkElement, 0 ) );

				// 4. Inset the linked image icon indicator while downcast to editing.
				if ( linkIconIndicator ) {
					writer.insert( writer.createPositionAt( linkElement, 'end' ), linkIconIndicator );
				}
			}
		} );
	};
}

// Returns a converter that decorates the `<a>` element when the image is the link label.
//
// @private
// @returns {Function}
function downcastImageLinkManualDecorator( manualDecorators, decorator ) {
	return dispatcher => {
		dispatcher.on( `attribute:${ decorator.id }:image`, ( evt, data, conversionApi ) => {
			const attributes = manualDecorators.get( decorator.id ).attributes;

			const viewFigure = conversionApi.mapper.toViewElement( data.item );
			const linkInImage = Array.from( viewFigure.getChildren() ).find( child => child.name === 'a' );

			// The <a> element was removed by the time this converter is executed.
			// It may happen when the base `linkHref` and decorator attributes are removed
			// at the same time (see #8401).
			if ( !linkInImage ) {
				return;
			}

			for ( const [ key, val ] of toMap( attributes ) ) {
				conversionApi.writer.setAttribute( key, val, linkInImage );
			}
		} );
	};
}

// Returns a converter that checks whether manual decorators should be applied to the link.
//
// @private
// @returns {Function}
function upcastImageLinkManualDecorator( manualDecorators, decorator ) {
	return dispatcher => {
		dispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
			const viewLink = data.viewItem;
			const imageInLink = getFirstImage( viewLink );

			// We need to check whether an image is inside a link because the converter handles
			// only manual decorators for linked images. See #7975.
			if ( !imageInLink ) {
				return;
			}

			const consumableAttributes = {
				attributes: manualDecorators.get( decorator.id ).attributes
			};

			const matcher = new Matcher( consumableAttributes );
			const result = matcher.match( viewLink );

			// The link element does not have required attributes or/and proper values.
			if ( !result ) {
				return;
			}

			// Check whether we can consume those attributes.
			if ( !conversionApi.consumable.consume( viewLink, result.match ) ) {
				return;
			}

			// At this stage we can assume that we have the `<image>` element.
			// `nodeBefore` comes after conversion: `<a><img></a>`.
			// `parent` comes with full image definition: `<figure><a><img></a></figure>.
			// See the body of the `upcastLink()` function.
			const modelElement = data.modelCursor.nodeBefore || data.modelCursor.parent;

			conversionApi.writer.setAttribute( decorator.id, true, modelElement );
		}, { priority: 'high' } );
		// Using the same priority that `upcastLink()` converter guarantees that the linked image was properly converted.
	};
}

// Returns the first image in a given view element.
//
// @private
// @param {module:engine/view/element~Element}
// @returns {module:engine/view/element~Element|undefined}
function getFirstImage( viewElement ) {
	return Array.from( viewElement.getChildren() ).find( child => child.name === 'img' );
}
