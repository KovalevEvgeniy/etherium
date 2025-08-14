---
layout: clear
title: Полный компендиум мира Этериума
---

*Собрание всех знаний о мире Этериума в одном месте*

{% comment %} Подключаем оглавление (вся логика внутри инклюда) {% endcomment %}
{% include compendium_toc.html %}

---

{% comment %} Начинаем рендерить контент {% endcomment %}
{% for section_info in sorted_items %}
{% assign section = section_info[3] %}
{% assign section_protected = section_info[2] %}
{% assign section_title = section_info[1] %}
{% assign sort_key = section_info[0] %}

{% comment %} Пропускаем скрытые и защищенные разделы {% endcomment %}
{% unless section == "hidden" or section_protected == true %}

## {{ section_title }}

{% assign subsections = "" | split: "" %}
{% for page in grouped_pages %}
{% assign path_parts = page.path | split: "/" %}
{% if path_parts[1] == section and path_parts.size > 3 %}
{% assign subsection = path_parts[2] %}
{% unless subsections contains subsection %}
{% assign subsections = subsections | push: subsection %}
{% endunless %}
{% endif %}
{% endfor %}

{% include sort_section_info.html items=subsections level=2 expected_size=4 %}

{% comment %} Сначала включаем основные страницы раздела {% endcomment %}
{% assign section_pages = "" | split: "" %}
{% for page in grouped_pages %}
{% assign path_parts = page.path | split: "/" %}
{% if path_parts[1] == section and path_parts.size == 3 %}
{% assign page_info = "" | split: "" %}
{% assign page_order = 999999 %}
{% if page.order %}
{% assign page_order = page.order %}
{% endif %}
{% assign page_info = page_info | push: page_order %}
{% assign page_info = page_info | push: page.title %}
{% assign page_info = page_info | push: page %}
{% assign section_pages = section_pages | push: page_info %}
{% endif %}
{% endfor %}

{% assign sorted_section_pages = section_pages | sort %}
{% for page_info in sorted_section_pages %}
{% assign page = page_info[2] %}
{% unless page.hidden == true or page.protected == true %}

### {{ page.title }}

{% assign content_without_frontmatter = page.content %}
{{ content_without_frontmatter }}

---

{% endunless %}
{% endfor %}

{% comment %} Затем обрабатываем подразделы {% endcomment %}
{% for subsection_info in sorted_items %}
{% assign subsection = subsection_info[3] %}
{% assign subsection_protected = subsection_info[2] %}
{% assign subsection_title = subsection_info[1] %}

{% comment %} Пропускаем защищенные подразделы {% endcomment %}
{% unless subsection_protected == true %}

### {{ subsection_title }}

{% assign subsubsections = "" | split: "" %}
{% for page in grouped_pages %}
{% assign path_parts = page.path | split: "/" %}
{% if path_parts[1] == section and path_parts[2] == subsection and path_parts.size > 4 %}
{% assign subsubsection = path_parts[3] %}
{% unless subsubsections contains subsubsection %}
{% assign subsubsections = subsubsections | push: subsubsection %}
{% endunless %}
{% endif %}
{% endfor %}

{% include sort_section_info.html items=subsubsections level=3 expected_size=5 %}

{% comment %} Страницы подраздела {% endcomment %}
{% assign subsection_pages = "" | split: "" %}
{% for page in grouped_pages %}
{% assign path_parts = page.path | split: "/" %}
{% if path_parts[1] == section and path_parts[2] == subsection and path_parts.size == 4 %}
{% assign page_info = "" | split: "" %}
{% assign page_order = 999999 %}
{% if page.order %}
{% assign page_order = page.order %}
{% endif %}
{% assign page_info = page_info | push: page_order %}
{% assign page_info = page_info | push: page.title %}
{% assign page_info = page_info | push: page %}
{% assign subsection_pages = subsection_pages | push: page_info %}
{% endif %}
{% endfor %}

{% assign sorted_subsection_pages = subsection_pages | sort %}
{% for page_info in sorted_subsection_pages %}
{% assign page = page_info[2] %}
{% unless page.hidden == true or page.protected == true %}

#### {{ page.title }}

{% assign content_without_frontmatter = page.content %}
{{ content_without_frontmatter }}

---

{% endunless %}
{% endfor %}

{% comment %} Обрабатываем подподразделы {% endcomment %}
{% for subsubsection_info in sorted_items %}
{% assign subsubsection = subsubsection_info[3] %}
{% assign subsubsection_protected = subsubsection_info[2] %}
{% assign subsubsection_title = subsubsection_info[1] %}

{% comment %} Пропускаем защищенные подподразделы {% endcomment %}
{% unless subsubsection_protected == true %}

#### {{ subsubsection_title }}

{% assign subsubsection_pages = "" | split: "" %}
{% for page in grouped_pages %}
{% assign path_parts = page.path | split: "/" %}
{% if path_parts[1] == section and path_parts[2] == subsection and path_parts[3] == subsubsection %}
{% assign page_info = "" | split: "" %}
{% assign page_order = 999999 %}
{% if page.order %}
{% assign page_order = page.order %}
{% endif %}
{% assign page_info = page_info | push: page_order %}
{% assign page_info = page_info | push: page.title %}
{% assign page_info = page_info | push: page %}
{% assign subsubsection_pages = subsubsection_pages | push: page_info %}
{% endif %}
{% endfor %}

{% assign sorted_subsubsection_pages = subsubsection_pages | sort %}
{% for page_info in sorted_subsubsection_pages %}
{% assign page = page_info[2] %}
{% unless page.hidden == true or page.protected == true %}

##### {{ page.title }}

{% assign content_without_frontmatter = page.content %}
{{ content_without_frontmatter }}

---

{% endunless %}
{% endfor %}

{% endunless %}
{% endfor %}

{% endunless %}
{% endfor %}

{% endunless %}
{% endfor %}