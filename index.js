'use strict';

module.exports = (hermione, opts = {}) => {
    const hooks = opts.hooks || {};
    const globalStyles = opts.globalStyles || {};
    const ignoreProps = ['ignoreElements', 'invisibleElements', 'hideElements'];
    const redrawProps = ['redrawElements'];
    const otherProps = ['animationDisabled', 'customCSS', 'redraw', 'redrawTimeout'];

    hermione.on(hermione.events.NEW_BROWSER, (browser) => {
        const baseAssertView = browser.assertView.bind(browser);

        browser.addCommand('assertView', async (name, selector, options = {}) => {
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

            options.redraw = options.redraw === true ? 'soft' : options.redraw;
            options.redrawElements = !options.redrawElements.length ? ['body'] : options.redrawElements;

            if (options.redraw) {
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

            await browser.execute(function(styleString, redraw, redrawElements) {
                var PREFIX = 'hermione-assert-view-extended';
                var head = document.head || document.getElementsByTagName('head')[0];
                var style = document.createElement('style');

                style.type = 'text/css';
                style.id = PREFIX + '-style';
                style.innerText = styleString;

                // Add styles before screenshot capturing.
                head.appendChild(style);

                // Force redraw elements
                if (redraw && redrawElements && redrawElements.length) {
                    redrawElements.forEach(function(selector) {
                        var element = document.querySelector(selector);

                        if (element) {
                            if (redraw === 'soft') {
                                // Repaint
                                window[PREFIX + '-styles'] = window[PREFIX + '-styles'] || {};
                                window[PREFIX + '-styles'][selector] = window[PREFIX + '-styles'][selector] || {};
                                window[PREFIX + '-styles'][selector].transform = element.style.transform;
                                element.style.transform = 'translateZ(0)';
                            } else if (redraw === 'medium') {
                                // Repaint
                                var oldStylesVisibility = element.style.visibility;

                                element.style.visibility = 'hidden';

                                setTimeout(function() {
                                    element.style.visibility = oldStylesVisibility;
                                }, 0);
                            } else if (redraw === 'hard') {
                                // Reflow and repaint
                                var oldStylesDisplay = element.style.display;

                                element.style.display = 'none';
                                // No need to store this anywhere, the reference is enough
                                element.offsetHeight;
                                element.style.display = oldStylesDisplay;
                            }
                        }
                    });
                }
            }, styleString, options.redraw, options.redrawElements);

            if (options.redraw && options.redrawTimeout) {
                await browser.pause(options.redrawTimeout);
            }

            await baseAssertView(name, selector, options);

            await browser.execute(function(redraw, redrawElements) {
                var PREFIX = 'hermione-assert-view-extended';
                var head = document.head || document.getElementsByTagName('head')[0];
                var style = document.getElementById(PREFIX + '-style');

                // Remove styles after screenshot capturing.
                head.removeChild(style);

                if (redraw === 'soft') {
                    redrawElements.forEach(function(selector) {
                        var element = document.querySelector(selector);

                        if (element) {
                            element.style.transform = window[PREFIX + '-styles'][selector].transform;
                        }
                    });
                }
            }, options.redraw, options.redrawElements);

            if (hooks.afterEach && typeof hooks.afterEach.call !== 'undefined') {
                await browser.then(() => hooks.afterEach.call({ browser }, name, selector, options));
            }
        }, true);
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
