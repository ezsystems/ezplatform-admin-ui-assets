/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/iswindow
 */

/**
 * Checks if the object is a native DOM Window.
 *
 * @param {*} obj
 * @returns {Boolean}
 */
export default function isWindow( obj ) {
	const stringifiedObject = Object.prototype.toString.apply( obj );

	// Returns `true` for the `window` object in browser environments.
	if ( stringifiedObject == '[object Window]' ) {
		return true;
	}

	// Returns `true` for the `window` object in the Electron environment.
	if ( stringifiedObject == '[object global]' ) {
		return true;
	}

	return false;
}
