const  Currency = {
    rates: {
        mm: 1,
        cm: 10,
        zm: 100,
        bzm: 200,
        vd: 2,
        vt: 4000,
        usd: 0.02 // Это базовая стоимость медной монеты
    },

    init() {
        const input = document.querySelector('.currency-input');

        if (input) {
            document.querySelector('.currency-input').addEventListener('input', this.updateCurrencies.bind(this));
            document.querySelector('.currency-select').addEventListener('change', this.updateCurrencies.bind(this));
        }
    },

    updateCurrencies() {
        const input = document.querySelector('.currency-input');
        const select = document.querySelector('.currency-select');
        const selectedCurrency = select.value;
        const inputValue = parseFloat(input.value) || 0;

        // Переводим значение в другие валюты
        const baseValue = inputValue * this.rates[selectedCurrency];

        // Обновляем значения в таблице
        document.querySelector('.currency-mm').textContent = (baseValue / this.rates.mm).toFixed(2);
        document.querySelector('.currency-cm').textContent = (baseValue / this.rates.cm).toFixed(2);
        document.querySelector('.currency-zm').textContent = (baseValue / this.rates.zm).toFixed(2);
        document.querySelector('.currency-bzm').textContent = (baseValue / this.rates.bzm).toFixed(2);
        document.querySelector('.currency-vd').textContent = (baseValue / this.rates.vd).toFixed(2);
        document.querySelector('.currency-vt').textContent = (baseValue / this.rates.vt).toFixed(2);
        document.querySelector('.currency-usd').textContent = (baseValue / this.rates.usd).toFixed(2);
    }
}

export default Currency;