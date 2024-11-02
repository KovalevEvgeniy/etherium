---
layout: default
title: Карта сайта
---

<ul>
    {% assign pages = site.pages | sort: "url" %}
    {% for page in pages %}
        {% assign level = page.url | split: '/' | size %}
        {% assign margin = level | minus: 3 | times: 20 %}

        {% if level > 2 and page.title %}
            <li style="margin-left: {{ margin }}px">
                <a href="{{ page.url | relative_url }}"><h{{ level }}>{{ page.title }}</h{{ level }}></a>
            </li>
        {% endif %}
    {% endfor %}
</ul>