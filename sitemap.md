---
layout: default
title: Карта сайта
---

<ul>
    {% assign all_pages = site.pages %}
    {% assign sorted_pages = all_pages | sort: "title" %}

    {% for page in sorted_pages %}
        {% assign level = page.url | split: '/' | size %}
        {% if level == 3 and page.title and page.order %}
            <li>
                <a href="{{ page.url | relative_url }}"><h3>{{ page.title }}</h3></a>
                
                <ul>
                {% for subpage in sorted_pages %}
                    {% if subpage.url contains page.url and subpage.url != page.url and subpage.title and subpage.order %}
                        {% assign sublevel = subpage.url | split: '/' | size %}
                        {% assign margin = sublevel | minus: 4 | times: 20 %}
                        <li style="margin-left: {{ margin }}px">
                            <a href="{{ subpage.url | relative_url }}"><h{{ sublevel }}>{{ subpage.title }}</h{{ sublevel }}></a>
                        </li>
                    {% endif %}
                {% endfor %}
                
                {% for subpage in sorted_pages %}
                    {% if subpage.url contains page.url and subpage.url != page.url and subpage.title and subpage.order == nil %}
                        {% assign sublevel = subpage.url | split: '/' | size %}
                        {% assign margin = sublevel | minus: 4 | times: 20 %}
                        <li style="margin-left: {{ margin }}px">
                            <a href="{{ subpage.url | relative_url }}"><h{{ sublevel }}>{{ subpage.title }}</h{{ sublevel }}></a>
                        </li>
                    {% endif %}
                {% endfor %}
                </ul>
            </li>
        {% endif %}
    {% endfor %}

    {% for page in sorted_pages %}
        {% assign level = page.url | split: '/' | size %}
        {% if level == 3 and page.title and page.order == nil %}
            <li>
                <a href="{{ page.url | relative_url }}"><h3>{{ page.title }}</h3></a>
                
                <ul>
                {% for subpage in sorted_pages %}
                    {% if subpage.url contains page.url and subpage.url != page.url and subpage.title and subpage.order %}
                        {% assign sublevel = subpage.url | split: '/' | size %}
                        {% assign margin = sublevel | minus: 4 | times: 20 %}
                        <li style="margin-left: {{ margin }}px">
                            <a href="{{ subpage.url | relative_url }}"><h{{ sublevel }}>{{ subpage.title }}</h{{ sublevel }}></a>
                        </li>
                    {% endif %}
                {% endfor %}
                
                {% for subpage in sorted_pages %}
                    {% if subpage.url contains page.url and subpage.url != page.url and subpage.title and subpage.order == nil %}
                        {% assign sublevel = subpage.url | split: '/' | size %}
                        {% assign margin = sublevel | minus: 4 | times: 20 %}
                        <li style="margin-left: {{ margin }}px">
                            <a href="{{ subpage.url | relative_url }}"><h{{ sublevel }}>{{ subpage.title }}</h{{ sublevel }}></a>
                        </li>
                    {% endif %}
                {% endfor %}
                </ul>
            </li>
        {% endif %}
    {% endfor %}
</ul>