---
layout: default
title: Карта сайта
---

<ul>
    {% assign all_pages = site.pages | sort: "title" %}
    {% assign top_level_pages = "" | split: "" %}
    {% assign ordered_pages = "" | split: "" %}
    {% assign unordered_pages = "" | split: "" %}

    {% for page in all_pages %}
        {% assign level = page.url | split: '/' | size %}
        {% if level == 3 %}
            {% if page.order %}
                {% assign ordered_pages = ordered_pages | push: page %}
            {% else %}
                {% assign unordered_pages = unordered_pages | push: page %}
            {% endif %}
        {% endif %}
    {% endfor %}
    
    {% assign ordered_pages = ordered_pages | sort: "order" %}
    {% assign unordered_pages = unordered_pages | sort: "title" %}
    
    {% for page in ordered_pages %}
        {% if page.title %}
            <li>
                <a href="{{ page.url | relative_url }}"><h3>{{ page.title }}</h3></a>
                
                <ul>
                {% assign subpages_ordered = "" | split: "" %}
                {% assign subpages_unordered = "" | split: "" %}
                
                {% for subpage in all_pages %}
                    {% if subpage.url contains page.url and subpage.url != page.url and subpage.title %}
                        {% if subpage.order %}
                            {% assign subpages_ordered = subpages_ordered | push: subpage %}
                        {% else %}
                            {% assign subpages_unordered = subpages_unordered | push: subpage %}
                        {% endif %}
                    {% endif %}
                {% endfor %}
                
                {% assign subpages_ordered = subpages_ordered | sort: "order" %}
                {% assign subpages_unordered = subpages_unordered | sort: "title" %}
                
                {% for subpage in subpages_ordered %}
                    {% assign sublevel = subpage.url | split: '/' | size %}
                    {% assign margin = sublevel | minus: 4 | times: 20 %}
                    <li style="margin-left: {{ margin }}px">
                        <a href="{{ subpage.url | relative_url }}"><h{{ sublevel }}>{{ subpage.title }}</h{{ sublevel }}></a>
                    </li>
                {% endfor %}
                
                {% for subpage in subpages_unordered %}
                    {% assign sublevel = subpage.url | split: '/' | size %}
                    {% assign margin = sublevel | minus: 4 | times: 20 %}
                    <li style="margin-left: {{ margin }}px">
                        <a href="{{ subpage.url | relative_url }}"><h{{ sublevel }}>{{ subpage.title }}</h{{ sublevel }}></a>
                    </li>
                {% endfor %}
                </ul>
            </li>
        {% endif %}
    {% endfor %}

    {% for page in unordered_pages %}
        {% if page.title %}
            <li>
                <a href="{{ page.url | relative_url }}"><h3>{{ page.title }}</h3></a>
                
                <ul>
                {% assign subpages_ordered = "" | split: "" %}
                {% assign subpages_unordered = "" | split: "" %}
                
                {% for subpage in all_pages %}
                    {% if subpage.url contains page.url and subpage.url != page.url and subpage.title %}
                        {% if subpage.order %}
                            {% assign subpages_ordered = subpages_ordered | push: subpage %}
                        {% else %}
                            {% assign subpages_unordered = subpages_unordered | push: subpage %}
                        {% endif %}
                    {% endif %}
                {% endfor %}
                
                {% assign subpages_ordered = subpages_ordered | sort: "order" %}
                {% assign subpages_unordered = subpages_unordered | sort: "title" %}
                
                {% for subpage in subpages_ordered %}
                    {% assign sublevel = subpage.url | split: '/' | size %}
                    {% assign margin = sublevel | minus: 4 | times: 20 %}
                    <li style="margin-left: {{ margin }}px">
                        <a href="{{ subpage.url | relative_url }}"><h{{ sublevel }}>{{ subpage.title }}</h{{ sublevel }}></a>
                    </li>
                {% endfor %}
                
                {% for subpage in subpages_unordered %}
                    {% assign sublevel = subpage.url | split: '/' | size %}
                    {% assign margin = sublevel | minus: 4 | times: 20 %}
                    <li style="margin-left: {{ margin }}px">
                        <a href="{{ subpage.url | relative_url }}"><h{{ sublevel }}>{{ subpage.title }}</h{{ sublevel }}></a>
                    </li>
                {% endfor %}
                </ul>
            </li>
        {% endif %}
    {% endfor %}
</ul>