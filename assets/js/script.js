const Search = {
    data: [],
    init() {
        this.getData();
        const search = document.querySelector('.search input');
        search.addEventListener('input', this.search.bind(this));
    },
    getData() {
        const baseUrl = window.location.origin.includes('github.io') ? '/etherium' : '';
        fetch(`${baseUrl}/search.json`)
            .then(response => response.json())
            .then(data => {
                this.data = data;
            });
    },
    search(e) {
        const query = e.target.value.toLowerCase().trim();
        const result = document.querySelector('.result');

        if (query.length < 3) {
            result.style.display = 'none';
            return;
        }

        result.style.display = 'block';

        const results = document.querySelector('.results');
        const noResults = document.querySelector('.no-results');

        const filteredData = this.data.filter(item => {
            return item.content.toLowerCase().includes(query);
        });

        if (filteredData.length === 0) {
            this.clear();
        } else {
            results.innerHTML = this.getItems(filteredData, query);
            results.style.display = 'block';
            noResults.style.display = 'none';
        }

    },
    getItems(data, query) {
        const queryRegex = new RegExp(query, 'gi');

        return data.map(item => {
            const text = item.content
                .split('\n')
                .filter(paragraph => paragraph.toLowerCase().includes(query.toLowerCase()))
                .map(paragraph => {
                    return paragraph.replace(queryRegex, match => `<span class="highlight">${match}</span>`);
                })
                .map(paragraph => `<p>${paragraph}</p>`)
                .filter((paragraph, index) => index < 3)
                .join('');

            return `
            <li>
                <h3>${item.title}</h3>
                ${text}
                <a href="${item.url}">Перейти</a>
            </li>
        `;
        }).join('');
    },
    clear() {
        const results = document.querySelector('.results');
        const noResults = document.querySelector('.no-results');

        results.innerHTML = '';
        results.style.display = 'none';
        noResults.style.display = 'block';
    }
}

Search.init();