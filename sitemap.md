---
layout: clear
title: Карта сайта
---

<div class="sitemap-list">

<div class="sitemap-list__spoiler">
Красные ссылки содержат спойлеры и подробности игрового лора.
<br>
Открывайте их, только если готовы узнать важные сюжетные детали.
</div>

{% assign grouped_pages = "" | split: "" %}
{% for page in site.pages %}
{% assign path_parts = page.path | split: "/" %}
{% assign filename = path_parts | last %}
{% if path_parts[0] == "data" and filename != "index.md" %}
{% assign grouped_pages = grouped_pages | push: page %}
{% endif %}
{% endfor %}

{% assign sections = "" | split: "" %}
{% for page in grouped_pages %}
{% assign path_parts = page.path | split: "/" %}
{% if path_parts.size > 1 %}
{% assign section = path_parts[1] %}
{% unless sections contains section %}
{% assign sections = sections | push: section %}
{% endunless %}
{% endif %}
{% endfor %}

{% include sort_section_info.html items=sections level=1 expected_size=3 %}

{% for section_info in sorted_items %}
{% assign section = section_info[3] %}
{% assign section_protected = section_info[2] %}
{% assign section_title = section_info[1] %}
{% assign sort_key = section_info[0] %}

<h2 id="{{ section_title | slugify }}">{{ section_title }}</h2>
<ul {% if section_protected %}class="sitemap-list__protected"{% endif %}>
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

{% include render_pages.html pages=grouped_pages level=1 current_section=section expected_size=3 %}

{% for subsection_info in sorted_items %}
{% assign subsection = subsection_info[3] %}
{% assign subsection_protected = subsection_info[2] %}
{% assign subsection_title = subsection_info[1] %}

    <li>
        <h3>{{ subsection_title }}</h3>
        <ul {% if subsection_protected %}class="sitemap-list__protected"{% endif %}>
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
        
        {% include render_pages.html pages=grouped_pages level=2 current_section=subsection expected_size=4 %}

        {% for subsubsection_info in sorted_items %}
        {% assign subsubsection = subsubsection_info[3] %}
        {% assign subsubsection_protected = subsubsection_info[2] %}
        {% assign subsubsection_title = subsubsection_info[1] %}

            <li>
                <h4>{{ subsubsection_title }}</h4>
                <ul {% if subsubsection_protected %}class="sitemap-list__protected"{% endif %}>
                {% assign pages_with_order = "" | split: "" %}
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
                        {% assign pages_with_order = pages_with_order | push: page_info %}
                    {% endif %}
                {% endfor %}

                {% assign sorted_pages = pages_with_order | sort %}
                {% for page_info in sorted_pages %}
                {% assign page = page_info[2] %}
                        {% unless page.hidden == true %}
                            <li>
                                {% if page.nav_item != false %}
                                    <a 
                                        {% if page.protected %}class="sitemap-list__protected"{% endif %}
                                        href="{{ page.url | relative_url }}"
                                    >
                                        {{ page.title }}
                                    </a>
                                {% else %}
                                    {{ page.title }}
                                {% endif %}
                            </li>
                        {% endunless %}
                    {% endfor %}
                </ul>
            </li>
        {% endfor %}
        </ul>
    </li>
{% endfor %}
</ul>
{% endfor %}
</div>