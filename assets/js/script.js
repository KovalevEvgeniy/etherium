const Search = {
    data: [],
    init() {
        this.getData();
        const search = document.querySelector('.search input');
        search.addEventListener('input', this.debounce(this.search.bind(this), 300));
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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
        const content = document.querySelector('.content');

        if (query.length < 3) {
            result.style.display = 'none';
            content.style.display = 'block';
            return;
        }

        result.style.display = 'block';

        const results = document.querySelector('.results');
        const noResults = document.querySelector('.no-results');

        const filteredData = this.searchInSections(query);
        const groupedData = this.groupByPage(filteredData);

        if (groupedData.length === 0) {
            this.clear();
        } else {
            results.innerHTML = this.getItems(groupedData, query);
            results.style.display = 'block';
            content.style.display = 'none';
            noResults.style.display = 'none';
        }
    },

    searchInSections(query) {
        const baseUrl = window.location.origin.includes('github.io') ? '/etherium' : '';
        const matches = [];

        this.data.forEach(page => {
            page.sections.forEach(section => {
                if (
                    section.content.toLowerCase().includes(query) ||
                    section.title.toLowerCase().includes(query)
                ) {
                    matches.push({
                        pageTitle: page.title,
                        pageUrl: `${baseUrl}${page.url}`,
                        sectionTitle: section.title,
                        content: section.content,
                        id: section.id,
                        url: `${baseUrl}${page.url}${section.id ? '#' + section.id : ''}`
                    });
                }
            });
        });

        return matches;
    },

    groupByPage(matches) {
        const grouped = {};

        matches.forEach(match => {
            if (!grouped[match.pageTitle]) {
                grouped[match.pageTitle] = {
                    pageTitle: match.pageTitle,
                    pageUrl: match.pageUrl,
                    sections: []
                };
            }
            grouped[match.pageTitle].sections.push({
                sectionTitle: match.sectionTitle,
                content: match.content,
                url: match.url
            });
        });

        return Object.values(grouped);
    },

    formatContent(content, query) {
        const queryRegex = new RegExp(query, 'gi');
        const highlightMatch = text => text.replace(queryRegex, match => `<span class="highlight">${match}</span>`);
        const MAX_PARAGRAPHS = 3;
        const WORDS_AROUND = 5;

        const normalizedContent = content
            .replace(/\\n/g, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>\s*<p>/gi, '\n')
            .replace(/<\/?p>/gi, '');

        const paragraphs = normalizedContent
            .split('\n')
            .map(p => p.trim())
            .filter(p => p);

        const getMatchContext = paragraph => {
            // Находим все совпадения
            const matches = [...paragraph.matchAll(new RegExp(query, 'gi'))]
                .sort((a, b) => a.index - b.index);

            if (!matches.length) return '';

            // Создаем массив диапазонов для извлечения текста
            const ranges = matches.reduce((acc, match, index) => {
                const start = match.index;
                const end = start + match[0].length;

                // Находим начало и конец контекста
                const contextStart = Math.max(0,
                    paragraph.lastIndexOf(' ', Math.max(0, start - WORDS_AROUND * 7)) + 1);
                const contextEnd = Math.min(paragraph.length,
                    paragraph.indexOf(' ', end + WORDS_AROUND * 7) === -1
                        ? paragraph.length
                        : paragraph.indexOf(' ', end + WORDS_AROUND * 7));

                // Если это первый диапазон или он не пересекается с предыдущим
                if (index === 0 || contextStart > acc[acc.length - 1].end) {
                    acc.push({ start: contextStart, end: contextEnd });
                } else {
                    // Объединяем с предыдущим диапазоном
                    acc[acc.length - 1].end = contextEnd;
                }

                return acc;
            }, []);

            // Формируем итоговый текст из диапазонов
            return ranges.map((range, index) => {
                const text = paragraph.substring(range.start, range.end);
                const needStartEllipsis = range.start > 0;
                const needEndEllipsis = range.end < paragraph.length;

                return `${needStartEllipsis ? '... ' : ''}${text}${needEndEllipsis ? ' ...' : ''}`;
            }).join(' ');
        };

        const matchedParagraphs = paragraphs
            .filter(paragraph => paragraph.toLowerCase().includes(query.toLowerCase()))
            .slice(0, MAX_PARAGRAPHS)
            .map(paragraph => getMatchContext(paragraph))
            .filter(context => context)
            .map(context => highlightMatch(context))
            .map(context => `<p>${context}</p>`)
            .join('');

        const totalMatches = paragraphs.filter(paragraph =>
            paragraph.toLowerCase().includes(query.toLowerCase())
        ).length;

        const hasMoreMatches = totalMatches > MAX_PARAGRAPHS;
        const moreMatchesHtml = hasMoreMatches
            ? `<p class="more-matches">И ещё ${totalMatches - MAX_PARAGRAPHS} совпадений в этой секции...</p>`
            : '';

        return (matchedParagraphs && `${matchedParagraphs}${moreMatchesHtml}`) || '<p>...</p>';
    },

    getItems(groupedData, query) {
        return groupedData.map(page => {
            const sectionsHtml = page.sections.map(section => {
                const contentHtml = this.formatContent(section.content, query);
                const titleHighlight = section.sectionTitle ?
                    section.sectionTitle.replace(
                        new RegExp(query, 'gi'),
                        match => `<span class="highlight">${match}</span>`
                    ) : '';

                return `
                    <div class="search-section">
                        ${section.sectionTitle ? `<a href="${section.url}"><h4>${titleHighlight}</h4></a>` : ''}
                        <div class="search-content">
                            ${contentHtml}
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <li class="search-result-item">
                    <a href="${page.pageUrl}" class="page-title-link">
                        <h3>${page.pageTitle}</h3>
                    </a>
                    ${sectionsHtml}
                </li>
            `;
        }).join('');
    },

    clear() {
        const results = document.querySelector('.results');
        const noResults = document.querySelector('.no-results');
        const content = document.querySelector('.content');

        results.innerHTML = '';
        results.style.display = 'none';
        noResults.style.display = 'block';
        content.style.display = 'block';
    }
};

Search.init();