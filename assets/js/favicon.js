const Favicon = {
    template:`
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="120 120 300 300">
        <defs>
            <linearGradient id="beanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#COLOR1"/>
                <stop offset="100%" stop-color="#COLOR2"/>
            </linearGradient>
        </defs>

        <g transform="rotate(20 256 256) scale(1.1)">
            <path
                d="M256 370c-60 0-110-50-110-110s20-130 90-140c50-6 100 20 110 80 10 60-30 170-90 170z"
                fill="url(#beanGradient)"
                stroke="#COLOR3"
                stroke-width="10"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
            <circle cx="210" cy="240" r="20" fill="white" opacity="0.6" />
            <circle cx="270" cy="290" r="13" fill="white" opacity="0.8" />
        </g>
    </svg>`,
    init() {
        this.animateGradient();
    },
    updateFavicon(color1, color2, color3) {
        // Создание SVG с заменёнными цветами
        const svgContent = this.template.replace("#COLOR1", color1).replace("#COLOR2", color2).replace("#COLOR3", color3);
        const favicon = document.getElementById('favicon');
        favicon.setAttribute('href', `data:image/svg+xml,${encodeURIComponent(svgContent)}`);
    },
    animateGradient() {
        let hue1 = 0;
        let hue2 = 120;

        setInterval(() => {
            // Преобразование hue в цвет RGB
            const color1 = `hsl(${hue1}, 70%, 60%)`;
            const color2 = `hsl(${hue2}, 70%, 50%)`;
            const color3 = `hsl(${hue2}, 90%, 50%, 0.2)`;

            // Обновление фавикона
            this.updateFavicon(color1, color2, color3);

            // Изменение оттенков
            hue1 = (hue1 + 2) % 360;
            hue2 = (hue2 + 2) % 360;
        }, 100); // Частота обновления
    }
}

export default Favicon;