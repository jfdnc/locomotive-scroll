import { defaults } from './options';
import NativeScroll from './NativeScroll';
import SmoothScroll from './SmoothScroll';

export class Smooth {
    constructor() {
        super(...arguments);
        this.logWarnings();
        this.init();
    }

    logWarnings() {
        //check on the state of these
        if (!this.smooth && this.direction == 'horizontal')
            console.warn('🚨 `smooth:false` & `horizontal` direction are not yet compatible');
        if (!this.tablet.smooth && this.tablet.direction == 'horizontal')
            console.warn(
                '🚨 `smooth:false` & `horizontal` direction are not yet compatible (tablet)'
            );
        if (!this.smartphone.smooth && this.smartphone.direction == 'horizontal')
            console.warn(
                '🚨 `smooth:false` & `horizontal` direction are not yet compatible (smartphone)'
            );
    }

    init() {
        // SmoothScroll#checkContext very similar
        this.options.isMobile =
            /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
            window.innerWidth < this.tablet.breakpoint;
        this.options.isTablet =
            this.options.isMobile && window.innerWidth >= this.tablet.breakpoint;

        if (
            (this.smooth && !this.options.isMobile) ||
            (this.tablet.smooth && this.options.isTablet) ||
            (this.smartphone.smooth && this.options.isMobile && !this.options.isTablet)
        ) {
            this.scroll = new SmoothScroll(this.options);
        } else {
            this.scroll = new NativeScroll(this.options);
        }

        this.scroll.init();

        if (window.location.hash) {
            // Get the hash without the '#' and find the matching element
            const id = window.location.hash.slice(1, window.location.hash.length);
            let target = document.getElementById(id);

            // If found, scroll to the element
            if (target) this.scroll.scrollTo(target);
        }
    }

    update() {
        this.scroll.update();
    }

    start() {
        this.scroll.startScroll();
    }

    stop() {
        this.scroll.stopScroll();
    }

    scrollTo(target, options) {
        this.scroll.scrollTo(target, options);
    }

    setScroll(x, y) {
        this.scroll.setScroll(x, y);
    }

    on(event, func) {
        this.scroll.setEvents(event, func);
    }

    off(event, func) {
        this.scroll.unsetEvents(event, func);
    }

    destroy() {
        this.scroll.destroy();
    }
}

export default Smooth;
