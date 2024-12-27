const ParallaxBackground = {
    bg: null,
    pageHeight: 0,
    init() {
        this.bg = document.querySelector('.bg');
        if (!this.bg) return;

        this.updateMetrics();
        this.bindEvents();
        this.updateBackground();
    },

    updateMetrics() {
        this.pageHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        ) - window.innerHeight;
    },

    bindEvents() {
        window.addEventListener('scroll', () => {
            this.updateBackground();
        });

        window.addEventListener('resize', () => {
            this.updateMetrics();
        });
    },

    updateBackground() {
        if (!this.bg) return;
        const scrollPercent = (window.scrollY / this.pageHeight) * 100;
        this.bg.style.backgroundPosition = `center ${scrollPercent}%`;
    }
};

export default ParallaxBackground;