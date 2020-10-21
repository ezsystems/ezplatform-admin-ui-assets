/* jshint expr: true, strict: false */
/* globals chai, describe, afterEach, beforeEach, it, Taggify */

var expect = chai.expect,
    CLASS_TAGGIFY = 'taggify',
    SELECTOR_TAGGIFY = '.' + CLASS_TAGGIFY,
    SELECTOR_INPUT = '.taggify__wrapper__input',
    SELECTOR_LABEL = '.taggify__wrapper__label',
    SELECTOR_TAGS = '.taggify__tags',
    SELECTOR_TAG = SELECTOR_TAGS + '__tag',
    SELECTOR_TAG_REMOVE = SELECTOR_TAG + '__remove',
    EVENT_TAGS_CREATED = 'tagsCreated',
    EVENT_TAG_REMOVED = 'tagRemoved',
    EVENT_KEYUP = 'keyup',
    EVENT_CLICK = 'click',
    KEY_COMMA = 188,
    TEST_TAG_NAME1 = 'sunpietro',
    TEST_TAG_NAME2 = 'sophii',
    LABEL_DEFAULT = 'Start typing ...',
    fireEvent = function (name, element, key) {
        var eventType = name === EVENT_CLICK ? 'MouseEvents' : 'HTMLEvents',
            event = document.createEvent(eventType);

        if (key) {
            event.keyCode = key;
        }

        event.initEvent(name, false, true);
        element.dispatchEvent(event);
    },
    destroyTaggify = function () {
        var oldTaggify = document.querySelector(SELECTOR_TAGGIFY);

        oldTaggify.parentNode.replaceChild(oldTaggify.cloneNode(false), oldTaggify);
    },
    createTestContainer = function () {
        var container = document.createElement('div');

        container.classList.add(CLASS_TAGGIFY);

        if (document.body.childNodes[0]) {
            document.body.insertBefore(container, document.body.childNodes[0]);
        } else {
            document.body.appendChild(container);
        }

        return container;
    },
    testRender = function () {
        var taggify = document.querySelector(SELECTOR_TAGGIFY),
            label = taggify.querySelector(SELECTOR_LABEL),
            input = taggify.querySelector(SELECTOR_INPUT);

        expect(taggify).to.contain(SELECTOR_INPUT);
        expect(taggify).to.contain(SELECTOR_LABEL);
        expect(taggify).to.contain(SELECTOR_TAGS);

        expect(input.id).to.match(/^(taggify-)\d{13}$/);
        expect(label).to.have.text(LABEL_DEFAULT);
        expect(label.for).to.be.equal(input.id);
    };

describe('Taggify', function () {
    describe('Taggify with default settings', function () {
        beforeEach(function () {
            createTestContainer();

            new Taggify();
        });

        afterEach(destroyTaggify);

        it('Should render the taggify element', testRender);

        describe('Events tests', function () {
            it('Should create a new tag based on user input', function (done) {
                var input = document.querySelector(SELECTOR_INPUT),
                    taggify = document.querySelector(SELECTOR_TAGGIFY),
                    tagsContainer = document.querySelector(SELECTOR_TAGS);

                input.value = TEST_TAG_NAME1;

                taggify.addEventListener(EVENT_TAGS_CREATED, function () {
                    expect(tagsContainer).to.contain(SELECTOR_TAG);
                    expect(tagsContainer.querySelectorAll(SELECTOR_TAG)).to.have.length(1);

                    done();
                });

                fireEvent(EVENT_KEYUP, input, KEY_COMMA);
            });

            it('Should create only one new tag based on user input', function (done) {
                var input = document.querySelector(SELECTOR_INPUT),
                    taggify = document.querySelector(SELECTOR_TAGGIFY),
                    tagsContainer = document.querySelector(SELECTOR_TAGS),
                    inputText = TEST_TAG_NAME1 + ', ' + TEST_TAG_NAME1;

                input.value = inputText;

                taggify.addEventListener(EVENT_TAGS_CREATED, function () {
                    expect(tagsContainer).to.contain(SELECTOR_TAG);
                    expect(tagsContainer.querySelectorAll(SELECTOR_TAG)).to.have.length(1);

                    done();
                });

                fireEvent(EVENT_KEYUP, input, KEY_COMMA);
            });

            it('Should create two new tags based on user input', function (done) {
                var input = document.querySelector(SELECTOR_INPUT),
                    taggify = document.querySelector(SELECTOR_TAGGIFY),
                    tagsContainer = document.querySelector(SELECTOR_TAGS),
                    inputText = TEST_TAG_NAME1 + ', ' + TEST_TAG_NAME2;

                input.value = inputText;

                taggify.addEventListener(EVENT_TAGS_CREATED, function () {
                    expect(tagsContainer).to.contain(SELECTOR_TAG);
                    expect(tagsContainer.querySelectorAll(SELECTOR_TAG)).to.have.length(2);

                    done();
                });

                fireEvent(EVENT_KEYUP, input, KEY_COMMA);
            });

            it('Should remove a selected tag when clicking on `X` button inside the tag', function (done) {
                var input = document.querySelector(SELECTOR_INPUT),
                    taggify = document.querySelector(SELECTOR_TAGGIFY),
                    tagsContainer = document.querySelector(SELECTOR_TAGS),
                    inputText = TEST_TAG_NAME1 + ', ' + TEST_TAG_NAME2;

                input.value = inputText;

                taggify.addEventListener(EVENT_TAGS_CREATED, function () {
                    expect(tagsContainer).to.contain(SELECTOR_TAG);
                    expect(tagsContainer.querySelectorAll(SELECTOR_TAG)).to.have.length(2);

                    tagsContainer.querySelector(SELECTOR_TAG_REMOVE).click();
                }, false);

                taggify.addEventListener(EVENT_TAG_REMOVED, function () {
                    expect(tagsContainer).to.contain(SELECTOR_TAG);
                    expect(tagsContainer.querySelectorAll(SELECTOR_TAG)).to.have.length(1);

                    done();
                }, false);

                fireEvent(EVENT_KEYUP, input, KEY_COMMA);
            });
        });
    });

    describe('Taggify with duplicates allowed', function () {
        beforeEach(function () {
            createTestContainer();

            new Taggify({allowDuplicates: true});
        });

        afterEach(destroyTaggify);

        it('Should render the taggify element', testRender);

        describe('Events tests', function () {
            it('Should create a new tag based on user input', function (done) {
                var input = document.querySelector(SELECTOR_INPUT),
                    taggify = document.querySelector(SELECTOR_TAGGIFY),
                    tagsContainer = document.querySelector(SELECTOR_TAGS);

                input.value = TEST_TAG_NAME1;

                taggify.addEventListener(EVENT_TAGS_CREATED, function () {
                    expect(tagsContainer).to.contain(SELECTOR_TAG);
                    expect(tagsContainer.querySelectorAll(SELECTOR_TAG)).to.have.length(1);

                    done();
                });

                fireEvent(EVENT_KEYUP, input, KEY_COMMA);
            });

            it('Should create 2 tags based on user input', function (done) {
                var input = document.querySelector(SELECTOR_INPUT),
                    taggify = document.querySelector(SELECTOR_TAGGIFY),
                    tagsContainer = document.querySelector(SELECTOR_TAGS),
                    inputText = TEST_TAG_NAME1 + ', ' + TEST_TAG_NAME1;

                input.value = inputText;

                taggify.addEventListener(EVENT_TAGS_CREATED, function () {
                    expect(tagsContainer).to.contain(SELECTOR_TAG);
                    expect(tagsContainer.querySelectorAll(SELECTOR_TAG)).to.have.length(2);

                    done();
                });

                fireEvent(EVENT_KEYUP, input, KEY_COMMA);
            });
        });
    });

    describe('Taggify with autocomplete on and default autocomplete callback', function () {
        beforeEach(function () {
            createTestContainer();

            new Taggify({autocomplete: true});
        });

        afterEach(destroyTaggify);

        it('Should render the taggify element', testRender);

        describe('Events tests', function () {
            it('Should create a new tag based on user input', function (done) {
                var input = document.querySelector(SELECTOR_INPUT),
                    taggify = document.querySelector(SELECTOR_TAGGIFY),
                    tagsContainer = document.querySelector(SELECTOR_TAGS);

                input.value = TEST_TAG_NAME1;

                taggify.addEventListener(EVENT_TAGS_CREATED, function () {
                    expect(tagsContainer).to.contain(SELECTOR_TAG);
                    expect(tagsContainer.querySelectorAll(SELECTOR_TAG)).to.have.length(1);

                    done();
                });

                fireEvent(EVENT_KEYUP, input, KEY_COMMA);
            });
        });
    });
});
