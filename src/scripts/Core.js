import { defaults } from './options';

export default class Core {
    addElements() {}
    resize() {}
    startScroll() {}
    stopScroll() {}

    /**
     * @param {object} options - see `scripts/options#defaults` for custom params
     */
    constructor(options = {}) {
        this.applyOptions(options);
        this.setupInitClass();
        this.setupLocalState();
        this.setupInstanceState();
        this.setupEventListeners();
    }

    /**
     * Sets local instance attibutes from `options` or `defaults`
     * @param {object} options 
     */
    applyOptions(options = {}) {
        Object.assign(this, defaults, this.getSupportedOptions(options));
    }

    /**
     * Filters to supported options
     * @param {object} options
     * @returns {object} supported options
     */
    getSupportedOptions(options = {}) {
        let supportedOptions = {}
        for(let key in options) {
            if(Object.keys(defaults).includes(key)) {
                supportedOptions[key] = options[key];
            }
        }
        return supportedOptions;
    }

    /**
     * Append scroll init class to html
     * @param {string} initClass 
     */
    setupInitClass(initClass = 'has-scroll-init') {
        this.initClass = initClass
        document.documentElement.classList.add(initClass);
    }
    /**
     * Remove scroll init class from html
     */
    removeInitClass() {
        this.initClass && document.documentElement.classList.remove(this.initClass);
    }

    /**
     * Initialize more defaults?
     * Should these live on `defaults`?
     */
    setupLocalState() {
         // what to `els` represent exactly?
         this.els = {};
         this.currentElements = {};
         this.listeners = {};
 
         // state property
         this.hasScrollTicking = false;
         this.hasCallEventSet = false;
    }

    /**
     * Sets up instance state
     * Instance of what?
     * Should this be its own class?
     */
    setupInstanceState() {
        this.instance = {
            scroll: {
                x: 0,
                y: 0
            },
            limit: {
                x: document.documentElement.offsetWidth,
                y: document.documentElement.offsetHeight
            },
            currentElements: {}
        };

        // additional setup for mobile checks
        if (this.isMobile) {
            if (this.isTablet) {
                this.context = 'tablet';
            } else {
                this.context = 'smartphone';
            }
        } else {
            this.context = 'desktop';
        }

        if (this.isMobile) this.direction = this[this.context].direction;
        if (this.direction === 'horizontal') {
            this.directionAxis = 'x';
        } else {
            this.directionAxis = 'y';
        }

        if (this.getDirection) {
            this.instance.direction = null;
        }

        if (this.getDirection) {
            this.instance.speed = 0;
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', this.checkResize, false);
    }

    removeEventListeners() {
        window.removeEventListener('resize', this.checkResize, false);
    }

    // TODO_JFD investigate how this is being used
    // seems overcomplicated
    init() {
        this.initEvents();
    }

    checkScroll = () => this.dispatchScroll();

    checkResize = () => {
        if (!this.resizeTick) {
            this.resizeTick = true;
            requestAnimationFrame(() => {
                this.resize();
                this.resizeTick = false;
            });
        }
    }

    checkEvent = (event) => {
        const name = event.type.replace('locomotive', '');
        const list = this.listeners[name];

        if (!list || list.length === 0) return;

        list.forEach((func) => {
            switch (name) {
                case 'scroll':
                    return func(this.instance);
                case 'call':
                    return func(this.callValue, this.callWay, this.callObj);
                default:
                    return func();
            }
        });
    }

    initEvents() {
        this.scrollToEls = this.el.querySelectorAll(`[data-${this.name}-to]`);
        this.setScrollTo = this.setScrollTo.bind(this);

        this.scrollToEls.forEach((el) => {
            el.addEventListener('click', this.setScrollTo, false);
        });
    }

    setScrollTo(event) {
        event.preventDefault();

        this.scrollTo(
            event.currentTarget.getAttribute(`data-${this.name}-href`) ||
                event.currentTarget.getAttribute('href'),
            {
                offset: event.currentTarget.getAttribute(`data-${this.name}-offset`)
            }
        );
    }

    detectElements(hasCallEventSet) {
        const scrollTop = this.instance.scroll.y;
        const scrollBottom = scrollTop + window.innerHeight;

        const scrollLeft = this.instance.scroll.x;
        const scrollRight = scrollLeft + window.innerWidth;

        Object.entries(this.els).forEach(([i, el]) => {
            if (el && (!el.inView || hasCallEventSet)) {
                if (this.direction === 'horizontal') {
                    if (scrollRight >= el.left && scrollLeft < el.right) {
                        this.setInView(el, i);
                    }
                } else {
                    if (scrollBottom >= el.top && scrollTop < el.bottom) {
                        this.setInView(el, i);
                    }
                }
            }

            if (el && el.inView) {
                if (this.direction === 'horizontal') {
                    let width = el.right - el.left;
                    el.progress =
                        (this.instance.scroll.x - (el.left - window.innerWidth)) /
                        (width + window.innerWidth);

                    if (scrollRight < el.left || scrollLeft > el.right) {
                        this.setOutOfView(el, i);
                    }
                } else {
                    let height = el.bottom - el.top;
                    el.progress =
                        (this.instance.scroll.y - (el.top - window.innerHeight)) /
                        (height + window.innerHeight);

                    if (scrollBottom < el.top || scrollTop > el.bottom) {
                        this.setOutOfView(el, i);
                    }
                }
            }
        });

        this.hasScrollTicking = false;
    }

    setInView(current, i) {
        this.els[i].inView = true;
        current.el.classList.add(current.class);

        this.currentElements[i] = current;

        if (current.call && this.hasCallEventSet) {
            this.dispatchCall(current, 'enter');

            if (!current.repeat) {
                this.els[i].call = false;
            }
        }
    }

    setOutOfView(current, i) {
        this.els[i].inView = false;

        Object.keys(this.currentElements).forEach((el) => {
            el === i && delete this.currentElements[el];
        });

        if (current.call && this.hasCallEventSet) {
            this.dispatchCall(current, 'exit');
        }

        if (current.repeat) {
            current.el.classList.remove(current.class);
        }
    }

    dispatchCall(current, way) {
        this.callWay = way;
        this.callValue = current.call.split(',').map((item) => item.trim());
        this.callObj = current;

        if (this.callValue.length == 1) this.callValue = this.callValue[0];

        const callEvent = new Event('locomotivecall');
        this.el.dispatchEvent(callEvent);
    }

    dispatchScroll() {
        const scrollEvent = new Event('locomotivescroll');
        this.el.dispatchEvent(scrollEvent);
    }

    setEvents(event, func) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        const list = this.listeners[event];
        list.push(func);

        if (list.length === 1) {
            this.el.addEventListener(`locomotive${event}`, this.checkEvent, false);
        }

        if (event === 'call') {
            this.hasCallEventSet = true;
            this.detectElements(true);
        }
    }

    unsetEvents(event, func) {
        if (!this.listeners[event]) return;

        const list = this.listeners[event];
        const index = list.indexOf(func);

        if (index < 0) return;

        list.splice(index, 1);

        if (list.index === 0) {
            this.el.removeEventListener(`locomotive${event}`, this.checkEvent, false);
        }
    }

    setScroll(x, y) {
        this.instance.scroll = {
            x: 0,
            y: 0
        };
    }

    destroy() {
        this.removeEventListeners();

        Object.keys(this.listeners).forEach((event) => {
            this.el.removeEventListener(`locomotive${event}`, this.checkEvent, false);
        });
        this.listeners = {};

        this.scrollToEls.forEach((el) => {
            el.removeEventListener('click', this.setScrollTo, false);
        });

        this.removeInitClass();
    }
}
