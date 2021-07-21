# taggify
Small library to create tags by typing

## How to use it?
The usage is simple:

1. Create container element where taggify will be installed, like:
    ```html
    <div class="taggify"></div>
    ```

2. Include Taggify library script to your HTML code:
    ```html
    <script src="taggify.min.js"></script>
    ```

3. Then start using in your JS script:
    ```html
    <script>
    (function () {
        'use strict';

        new window.Taggify();
    })();
    </script>
    ```

## Configuration
Taggify library uses a configuration object containing following properties:

### containerSelector {String}
Container selector to find HTML node to initialize taggify element. By default: `'.taggify'`

### containerNode {HTMLElement}
Container node to initialize taggify element. Will be used instead of `containerSelector`, if defined.

### autocomplete {Boolean}
Indicator whether to use autocomplete callback. By default: `false`

### autocompleteCallback {Function}
The autocomplete callback. It takes 2 params:
- _value_ - the taggify input value,
- _callback_ - the callback where data should be provided in order to generate tags

### inputDelay {Number}
The input event callback delay. After this time, the tags are created.
It's used to increase performance of the solution. By default: `100`

### inputLabel {String}
The text to display to a user as a label. By default: `'Start typing ...'`

### allowDuplicates {Boolean}
Indicator whether to allow duplicated tags. Used when autocomplete is turned off.
By default: `false`

### hotKeys {Array}
List of hot keys which generate tags when autocomplete is off.
The list contains key codes, like - _coma_ is 188, but _enter_ is 13.
By default: `[13, 188]`

### displayLabel {Boolean}
Flag indicating whether an input label should be displayed

## Methods

### updateTags
The method allows to create tags based on provided array of strings


```javascript
const tags = ['a','b','c'];

taggify.updateTags(tags);
```
