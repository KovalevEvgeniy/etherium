const  Currency = {
    rates: {
        mm: 1,
        cm: 10,
        zm: 100,
        bzm: 200,
        vd: 2,
        vt: 2000,
        usd: 5 // Это базовая стоимость медной монеты
    },

    init() {
        const input = document.querySelector('.currency-input');

        if (input) {
            document.querySelector('.currency-input').addEventListener('input', this.updateCurrencies.bind(this));
            document.querySelector('.currency-select').addEventListener('change', this.updateCurrencies.bind(this));
        }

        this.updateCurrencies();
    },

    updateCurrencies() {
        const input = document.querySelector('.currency-input');
        const select = document.querySelector('.currency-select');
        if (!input || !select) return;
        const selectedCurrency = select.value;
        const inputValue = parseFloat(input.value) || 0;

        // Переводим значение в другие валюты
        const baseValue = inputValue * this.rates[selectedCurrency];

        // Обновляем значения в таблице
        document.querySelector('.currency-mm').textContent = this.getVal(baseValue / this.rates.mm);
        document.querySelector('.currency-cm').textContent = this.getVal(baseValue / this.rates.cm);
        document.querySelector('.currency-zm').textContent = this.getVal(baseValue / this.rates.zm);
        document.querySelector('.currency-bzm').textContent = this.getVal(baseValue / this.rates.bzm);
        document.querySelector('.currency-vd').textContent = this.getVal(baseValue / this.rates.vd);
        document.querySelector('.currency-vt').textContent = this.getVal(baseValue / this.rates.vt);
        document.querySelector('.currency-usd').textContent = this.getVal(baseValue / this.rates.usd);
    },

    getVal(val) {
        return val < 0.01 ? '-' : (val)
    }
}

export default Currency;