const ParallaxBackground = {
    bg: null,
    pageHeight: 0,
    init() {
        this.bg = document.querySelector('.bg');
        console.log('this.bg', this.bg);
        if (!this.bg) return;

        this.updateMetrics();
        this.bindEvents();
    },

    updateMetrics() {
        // Получаем полную высоту страницы, включая прокручиваемую часть
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

        // Вычисляем процент прокрутки страницы
        const scrollPercent = (window.scrollY / this.pageHeight) * 100;

        // Устанавливаем background-position с использованием процентов
        this.bg.style.backgroundPosition = `center ${scrollPercent}%`;
    }
};

export default ParallaxBackground;