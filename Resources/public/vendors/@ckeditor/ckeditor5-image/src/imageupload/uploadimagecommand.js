/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { FileRepository } from 'ckeditor5/src/upload';
import { Command } from 'ckeditor5/src/core';
import { toArray } from 'ckeditor5/src/utils';

import { insertImage, isImageAllowed } from '../image/utils';

/**
 * @module image/imageupload/uploadimagecommand
 */

/**
 * The upload image command.
 *
 * The command is registered by the {@link module:image/imageupload/imageuploadediting~ImageUploadEditing} plugin as `uploadImage`
 * and it is also available via aliased `imageUpload` name.
 *
 * In order to upload an image at the current selection position
 * (according to the {@link module:widget/utils~findOptimalInsertionPosition} algorithm),
 * execute the command and pass the native image file instance:
 *
 *		this.listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
 *			// Assuming that only images were pasted:
 *			const images = Array.from( data.dataTransfer.files );
 *
 *			// Upload the first image:
 *			editor.execute( 'uploadImage', { file: images[ 0 ] } );
 *		} );
 *
 * It is also possible to insert multiple images at once:
 *
 *		editor.execute( 'uploadImage', {
 *			file: [
 *				file1,
 *				file2
 *			]
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class UploadImageCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const imageElement = this.editor.model.document.selection.getSelectedElement();
		const isImage = imageElement && imageElement.name === 'image' || false;

		this.isEnabled = isImageAllowed( this.editor.model ) || isImage;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options Options for the executed command.
	 * @param {File|Array.<File>} options.file The image file or an array of image files to upload.
	 */
	execute( options ) {
		const editor = this.editor;
		const model = editor.model;

		const fileRepository = editor.plugins.get( FileRepository );

		for ( const file of toArray( options.file ) ) {
			uploadImage( model, fileRepository, file );
		}
	}
}

// Handles uploading single file.
//
// @param {module:engine/model/model~Model} model
// @param {File} file
function uploadImage( model, fileRepository, file ) {
	const loader = fileRepository.createLoader( file );

	// Do not throw when upload adapter is not set. FileRepository will log an error anyway.
	if ( !loader ) {
		return;
	}

	insertImage( model, { uploadId: loader.id } );
}
