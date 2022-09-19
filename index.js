'use strict';

module.exports = (hermione, opts = {}) => {
    const hooks = opts.hooks || {};
    const globalStyles = opts.globalStyles || {};
    const ignoreProps = ['ignoreElements', 'invisibleElements', 'hideElements'];
    const redrawProps = ['redrawElements'];
    const otherProps = ['animationDisabled', 'customCSS', 'redraw', 'redrawMode', 'redrawTimeout'];
    const redrawModeDefault = 'medium';

    hermione.on(hermione.events.NEW_BROWSER, (browser) => {
        browser.overwriteCommand('assertView', async (baseAssertView, name, selector, options = {}) => {
            options.excludeElements = normalize(options.excludeElements);

            // Merge global and local selectors without excluded selectors.
            ignoreProps.forEach(prop => {
                options[prop] = merge(
                    globalStyles[prop],
                    normalize(options[prop]),
                    options.excludeElements
                );
            });

            // Merge global and local selectors
            redrawProps.forEach(prop => {
                options[prop] = merge(globalStyles[prop], normalize(options[prop]));
            });

            // Remove captured selector from all types of ignore.
            ignoreProps.forEach(prop => {
                if (Array.isArray(options[prop])) {
                    options[prop] = options[prop].filter(selectorInside => selectorInside !== selector)
                }
            });

            // Merge other props
            otherProps.forEach(prop => {
                options[prop] = options[prop] !== undefined ? options[prop] : globalStyles[prop] || false;
            });

            let styleString = '';

            options.redrawMode = options.redrawMode || redrawModeDefault;
            options.redrawElements = options.redraw && !options.redrawElements.length ?
                ['body'] : options.redrawElements;

            if (options.redraw || (options.redrawElements && options.redrawElements.length)) {
                styleString += options.redrawElements.join(',') + '{ will-change: transform; }';
            }

            if (options.animationDisabled) {
                styleString += getAnimationDisabledStyles();
            }

            if (options.invisibleElements.length) {
                styleString += options.invisibleElements.join(',') + '{ opacity: 0 !important }';
            }

            if (options.hideElements.length) {
                styleString += options.hideElements.join(',') + '{ display: none !important }';
            }

            if (options.customCSS) {
                styleString += options.customCSS;
            }

            if (hooks.beforeEach && typeof hooks.beforeEach.call !== 'undefined') {
                await browser.then(() => hooks.beforeEach.call({ browser }, name, selector, options));
            }

            await browser.execute(function(styleString, redraw, redrawMode, redrawElements) {
                var PREFIX = 'hermione-assert-view-extended';
                var head = document.head || document.getElementsByTagName('head')[0];
                var style = document.createElement('style');

                style.type = 'text/css';
                style.id = PREFIX + '-style';
                style.innerText = styleString;

                // Add styles before screenshot capturing.
                head.appendChild(style);

                // Force redraw elements
                if (redraw || (redrawElements && redrawElements.length)) {
                    redrawElements.forEach(function(selector) {
                        var element = document.querySelector(selector);

                        if (element) {
                            switch (redrawMode) {
                                // Repaint
                                case 'soft':
                                    window[PREFIX + '-styles'] = window[PREFIX + '-styles'] || {};
                                    window[PREFIX + '-styles'][selector] = window[PREFIX + '-styles'][selector] || {};
                                    window[PREFIX + '-styles'][selector].transform = element.style.transform;
                                    element.style.transform = 'translateZ(0)';

                                    break;

                                // Reflow and repaint
                                case 'medium':
                                    var oldStylesOpacity = element.style.opacity;

                                    element.style.opacity = 0;
                                    // No need to store this anywhere, the reference is enough
                                    element.offsetHeight;
                                    element.style.opacity = oldStylesOpacity;

                                    break;

                                // Reflow and repaint
                                case 'hard':
                                    var oldStylesDisplay = element.style.display;

                                    element.style.display = 'none';
                                    // No need to store this anywhere, the reference is enough
                                    element.offsetHeight;
                                    element.style.display = oldStylesDisplay;

                                    break;
                            }
                        }
                    });
                }
            }, styleString, options.redraw, options.redrawMode, options.redrawElements);

            if (options.redraw && options.redrawTimeout) {
                await browser.pause(options.redrawTimeout);
            }

            await baseAssertView(name, selector, options);

            await browser.execute(function(redraw, redrawMode, redrawElements) {
                var PREFIX = 'hermione-assert-view-extended';
                var head = document.head || document.getElementsByTagName('head')[0];
                var style = document.getElementById(PREFIX + '-style');

                // Remove styles after screenshot capturing.
                head.removeChild(style);

                if ((redraw || (redrawElements && redrawElements.length)) && redrawMode === 'soft') {
                    redrawElements.forEach(function(selector) {
                        var element = document.querySelector(selector);

                        if (element) {
                            element.style.transform = window[PREFIX + '-styles'][selector].transform;
                        }
                    });
                }
            }, options.redraw, options.redrawMode, options.redrawElements);

            if (hooks.afterEach && typeof hooks.afterEach.call !== 'undefined') {
                await browser.then(() => hooks.afterEach.call({ browser }, name, selector, options));
            }
        });
    });
};

function merge(global = [], local = [], excludeElements = []) {
    return [].concat(global, local)
        .filter(selector => !excludeElements.includes(selector));
}

function normalize(input) {
    return typeof input === 'string' ? [input] : input;
}

function getAnimationDisabledStyles() {
    return `
        body, body *, body *:after, body *:before,
        body[class], body[class] *, body[class] *:after, body[class] *:before {
            -webkit-animation-duration: 0s !important;
            -moz-animation-duration: 0s !important;
            -ms-animation-duration: 0s !important;
            animation-duration: 0s !important;
            -webkit-transition-duration: 0s !important;
            -moz-transition-duration: 0s !important;
            -ms-transition-duration: 0s !important;
            transition-duration: 0s !important;
            -webkit-transition-delay: 0s !important;
            -moz-transition-delay: 0s !important;
            -ms-transition-delay: 0s !important;
            transition-delay: 0s !important;
        }
    `;
}
