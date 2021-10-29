/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/isrange
 */

/**
 * Checks if the object is a native DOM Range.
 *
 * @param {*} obj
 * @returns {Boolean}
 */
export default function isRange( obj ) {
	return Object.prototype.toString.apply( obj ) == '[object Range]';
}
