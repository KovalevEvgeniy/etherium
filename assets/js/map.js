
const Map = {
    zones: null,
    labels: null,
    init() {
        this.labels = document.querySelectorAll('[data-zone-name]');
        this.collectZones()
        this.labels.forEach(label => {
            label.addEventListener('mouseenter', this.enterMapLayer.bind(this));
            label.addEventListener('mouseleave', this.leaveMapLayer.bind(this));
        });
    },
    collectZones () {
        let selector = ''
        this.labels.forEach(label => {
            selector += `.${label.dataset.zoneName},`;
        });
        this.zones = document.querySelectorAll(selector.slice(0, -1));
    },
    enterMapLayer (event) {
        const label = event.target;
        const name = label.dataset.zoneName;

        this.zones.forEach(zone => {
            if (!zone.classList.contains(name)) {
                zone.style.opacity = 0.1;
            }
        })
    },
    leaveMapLayer (event) {
        this.zones.forEach(zone => {
            zone.style.opacity = 1;
        })
    },
}

export default Map;