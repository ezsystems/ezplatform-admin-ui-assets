var Taggify = function (params) {
    var SUFFIX_LABEL = '__label',
        CLASS_TAGGIFY = 'taggify',
        CLASS_TAGGIFY_WRAPPER = CLASS_TAGGIFY + '__wrapper',
        CLASS_TAGGIFY_INPUT = CLASS_TAGGIFY + '__input',
        CLASS_TAGGIFY_LABEL = CLASS_TAGGIFY + SUFFIX_LABEL,
        CLASS_TAGGIFY_TAGS = CLASS_TAGGIFY + '__tags',
        CLASS_TAGGIFY_TAG = CLASS_TAGGIFY + '__tag',
        CLASS_TAGGIFY_TAG_LABEL = CLASS_TAGGIFY_TAG + '-label',
        CLASS_TAGGIFY_TAG_REMOVE = CLASS_TAGGIFY + '__btn--remove',
        SELECTOR_TAGGIFY = '.' + CLASS_TAGGIFY,
        EVENT_TAGS_CREATED = 'tagsCreated',
        EVENT_TAG_REMOVED = 'tagRemoved',
        EVENT_TAG_NOT_REMOVED = 'tagNotRemoved',
        DIV = 'div',
        TAG_DELIMITER = ', ',
        KEY_COMMA = 188,
        KEY_ENTER = 13,
        defaultAutocompleteCallback = function (value, callback) { callback(_createTagsArrayFromString(value)); },
        finalParams = {
            /**
             * Container node to load taggify
             *
             * @property containerNode
             * @type {HTMLElement}
             * @default null
             */
            containerNode: null,
            /**
             * Container selector to find HTML node to initialize taggify element
             *
             * @property containerSelector
             * @type {String}
             * @default '.taggify'
             */
            containerSelector: SELECTOR_TAGGIFY,
            /**
             * Indicator whether to use autocomplete callback
             *
             * @property autocomplete
             * @type {Boolean}
             * @default false
             */
            autocomplete: false,
            /**
             * The autocomplete callback.
             * The callback takes 2 params:
             *     * value      - the taggify input value,
             *     * callback   - the callback where data should be provided
             *                    in order to generate tags
             *
             * @property autocompleteCallback
             * @type {Function}
             * @default defaultAutocompleteCallback
             */
            autocompleteCallback: defaultAutocompleteCallback,
            /**
             * The input event callback delay. After this time, the tags are created.
             *
             * @property inputDelay
             * @type {Number}
             * @default 100
             */
            inputDelay: 100,
            /**
             * The text to display to a user as a label
             *
             * @property inputLabel
             * @type {String}
             * @default 'Start typing ...'
             */
            inputLabel: 'Start typing ...',
            /**
             * Indicator whether to allow duplicated tags.
             * Used when autocomplete is turned off.
             *
             * @property allowDuplicates
             * @type {Boolean}
             * @default false
             */
            allowDuplicates: false,
            /**
             * List of hot keys which generate tags when autocomplete is off.
             * The list contains key codes, like - coma is 188, but enter is 13.
             *
             * @property hotKeys
             * @type {Array}
             * @default [13, 188]
             */
            hotKeys: [KEY_COMMA, KEY_ENTER],
            /**
             * Should display input label?
             *
             * @property displayLabel
             * @type {Boolean}
             * @default true
             */
            displayLabel: true,
            /**
             * Should display input values?
             *
             * @property displayInputValues
             * @type {Boolean}
             * @default true
             */
            displayInputValues: true
        },
        taggifyId = CLASS_TAGGIFY + '-' + Date.now(),
        taggifyInput = document.createElement('input'),
        taggifyLabel = document.createElement('label'),
        taggifyTags = document.createElement(DIV),
        taggifyInputWrapper = document.createElement(DIV),
        paramKey,
        taggifyContainer,
        createdTags = [],
        timeoutInputKeyup,
        hasCustomEventConstructor = window.hasOwnProperty('CustomEvent'),
        /**
         * Fires a custom event on the Taggify container node
         *
         * @method _fire
         * @private
         * @param {String} eventName
         * @param {Object} props
         */
        _fire = function (eventName, props) {
            var event,
                eventConfig;

            if (hasCustomEventConstructor) {
                eventConfig = {
                    bubbles: true,
                    cancelable: false
                };

                if (props && Object.keys(props).length) {
                    eventConfig.detail = props;
                }

                event = new CustomEvent(eventName, eventConfig);
            } else {
                event = document.createEvent('CustomEvent');

                event.initEvent(eventName, false, true);
            }

            taggifyContainer.dispatchEvent(event);
        },
        /**
         * Creates a tags array from the string input
         *
         * @method _createTagsArrayFromString
         * @private
         * @param value {String} input value
         * @return {Array} array of tags
         */
        _createTagsArrayFromString = function (value) {
            var tagsMap = {};
            var inputTags = value.split(',');

            return inputTags
                .map(function (tag) {
                    return {
                        id: Math.floor((1 + Math.random()) * 0x10000).toString(16),
                        label: tag.trim()
                    };
                })
                .filter(function (tag) {
                    if (!finalParams.allowDuplicates) {
                        if (!tag.label.length || tagsMap[tag.label]) {
                            return false;
                        }

                        tagsMap[tag.label] = true;

                        return tag;
                    } else {
                        return !!tag.label.length;
                    }
                });
        },
        /**
         * Input keyup event callback.
         * Fired when autocomplete is turned off.
         * When a user types a comma or presses the enter key it starts creating tags from the input text.
         * A coma-separated text is converted into tags.
         *
         * @method _createTagsNoAutocomplete
         * @private
         * @param event {Object} input keyup event object
         */
        _createTagsNoAutocomplete = function (event) {
            var isHotKeyUsed = finalParams.hotKeys.some(function (key) {
                return (event.keyCode || event.which) === key;
            }),
                tags;

            if (isHotKeyUsed || event.type === 'blur') {
                tags = _createTagsArrayFromString(event.target.value);

                if (!finalParams.displayInputValues) {
                    tags = createdTags.concat(tags);
                }

                _createTags(tags);
            }
        },
        /**
         * Input keyup event handler.
         * Basing on provided config it either provides data to autocomplete callback
         * or creates tags from user input with a delay.
         *
         * @method _inputKeyupEventHandler
         * @private
         * @param event {Object} input keyup event object
         */
        _inputKeyupEventHandler = function (event) {
            window.clearTimeout(timeoutInputKeyup);

            timeoutInputKeyup = window.setTimeout(_createTagsFromInput.bind(null, event), finalParams.inputDelay);
        },
        /**
         * Creates tags from an event fired on input
         *
         * @method _createTagsFromInput
         * @param {Event} event
         */
        _createTagsFromInput = function (event) {
            if (finalParams.autocomplete) {
                finalParams.autocompleteCallback(event.target.value, _createTags);
            } else {
                _createTagsNoAutocomplete(event);
            }
        },
        /**
         * Creates tags
         *
         * @method _createTags
         * @private
         * @param tags {Array} an array of tag objects (id, label)
         */
        _createTags = function (tags) {
            var tagsFragment = document.createDocumentFragment(),
                tagsMap = {};

            if (!Array.isArray(tags)) {
                return;
            }

            if (createdTags.length) {
                tags = createdTags.concat(tags);
            }

            if (!finalParams.allowDuplicates) {
                tags = tags.filter(function (tag) {
                    if (tagsMap[tag.label]) {
                        return false;
                    }

                    tagsMap[tag.label] = true;

                    return true;
                });
            }

            tags.forEach(function (tag) {
                var elementTag = document.createElement(DIV),
                    elementTagLabel = document.createElement('span'),
                    elementTagRemove = document.createElement('button');

                elementTagLabel.classList.add(CLASS_TAGGIFY_TAG_LABEL);
                elementTagLabel.innerHTML = tag.label;

                elementTagRemove.classList.add(CLASS_TAGGIFY_TAG_REMOVE);
                elementTagRemove.innerHTML = 'x';

                elementTag.classList.add(CLASS_TAGGIFY_TAG);
                elementTag.dataset.tagText = tag.label;
                elementTag.dataset.tagId = tag.id;

                elementTag.appendChild(elementTagLabel);
                elementTag.appendChild(elementTagRemove);

                tagsFragment.appendChild(elementTag);
            });

            createdTags = tags;

            if (!finalParams.autocomplete) {
                taggifyTags.innerHTML = '';

                if (finalParams.displayInputValues) {
                    taggifyInput.value = tags.map(function (tag) { return tag.label; }).join(TAG_DELIMITER) + TAG_DELIMITER;
                } else {
                    taggifyInput.value = '';
                }
            } else {
                taggifyInput.value = '';
            }

            taggifyTags.appendChild(tagsFragment);

            _fire(EVENT_TAGS_CREATED, { tags: createdTags });
        },
        /**
         * Gets an element based on filtered using a provided callback
         *
         * @method _getElement
         * @private
         * @param element {HTMLElement} the HTML node element
         * @param callback {Function} the comparison callback to find element
         * @return element {HTMLElement|undefined}
         */
        _getElement = function (element, callback) {
            var parent = element.parentNode;

            if (!parent) { return undefined; }
            if (callback(element)) { return element; }

            return callback(parent) ? parent : _getElement(parent, callback);
        },
        /**
         * The comparison callback finding tag element
         *
         * @method _isTagCallback
         * @private
         * @param element {HTMLElement} the HTML node element
         * @return {Boolean}
         */
        _isTagCallback = function (element) { return (element.classList && element.classList.contains(CLASS_TAGGIFY_TAG)); },
        /**
         * The comparison callback finding remove tag button
         *
         * @method _isTagRemoveButtonCallback
         * @private
         * @param element {HTMLElement} the HTML node element
         * @return {Boolean}
         */
        _isTagRemoveButtonCallback = function (element) { return (element.classList && element.classList.contains(CLASS_TAGGIFY_TAG_REMOVE)); },
        /**
         * Click event handler.
         * Removes a selected tag.
         *
         * @method _removeTag
         * @private
         * @param event {Object} input keyup event object
         */
        _removeTag = function (event) {
            var tagRemoveBtn = _getElement(event.target, _isTagRemoveButtonCallback),
                inputText = '',
                tag;

            if (tagRemoveBtn) {
                tag = _getElement(event.target, _isTagCallback);

                createdTags = createdTags.filter(function (createdTag) {
                    var createdTagId = '' + createdTag.id,
                        tagId = '' + tag.dataset.tagId;

                    return createdTagId !== tagId;
                });

                if (!finalParams.autocomplete) {
                    inputText = createdTags.map(function (tag) { return tag.label; }).join(TAG_DELIMITER);
                    inputText = inputText.trim().length ? inputText + TAG_DELIMITER : '';
                }

                if (finalParams.displayInputValues) {
                    taggifyInput.value = inputText;
                }

                this.removeChild(tag);

                _fire(EVENT_TAG_REMOVED, { tags: createdTags });
            } else {
                _fire(EVENT_TAG_NOT_REMOVED);
            }
        };

    // merge the object with default config with an object with params provided by a developer
    for (paramKey in params) {
        if (params.hasOwnProperty(paramKey)) {
            finalParams[paramKey] = params[paramKey];
        }
    }

    taggifyContainer = finalParams.containerNode ?
        finalParams.containerNode :
        document.querySelector(finalParams.containerSelector);
    taggifyContainer.innerHTML = '';

    taggifyInputWrapper.classList.add(CLASS_TAGGIFY_WRAPPER);

    taggifyInput.id = taggifyId;
    taggifyInput.type = 'text';
    taggifyInput.classList.add(CLASS_TAGGIFY_INPUT);

    taggifyTags.classList.add(CLASS_TAGGIFY_TAGS);

    taggifyContainer.appendChild(taggifyInputWrapper);
    taggifyContainer.appendChild(taggifyTags);

    if (finalParams.displayLabel) {
        taggifyLabel.for = taggifyId;
        taggifyLabel.innerHTML = finalParams.inputLabel;

        taggifyLabel.setAttribute('for', taggifyId);
        taggifyLabel.classList.add(CLASS_TAGGIFY_LABEL);
        taggifyInputWrapper.appendChild(taggifyLabel);
    }

    taggifyInputWrapper.appendChild(taggifyInput);

    taggifyInput.addEventListener('keyup', _inputKeyupEventHandler, false);
    taggifyInput.addEventListener('blur', _createTagsFromInput, false);
    taggifyTags.addEventListener('click', _removeTag, false);

    return {
        /**
         * Updates list of tags
         *
         * @method updateTags
         * @param {Array} tags each tag is an object with a following structure: `{label: <String>, id: <String>}`
         * @returns {Taggify}
         */
        updateTags: function (tags) {
            if (finalParams.displayInputValues) {
                taggifyInput.value = tags.map(function (tag) {
                    return tag.label;
                }).join(', ');
            }

            _createTags(tags);

            return this;
        }
    }
};
