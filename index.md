---
layout: default
title: Home
---

# CS 300 — Data Structures & Algorithms

Personal study notes for a university Data Structures & Algorithms course.
All implementations target C++17. Source on [GitHub](https://github.com/yeevon/DSA).

<table class="chapters">
  <thead>
    <tr>
      <th>Chapter</th>
      <th>Lectures</th>
      <th>Notes</th>
      <th>Practice Exercise</th>
    </tr>
  </thead>
  <tbody>
  {% for ch in site.data.chapters.required %}
    <tr>
      <td>
        <span class="ch-title">{{ ch.title }}</span>
        <span class="ch-sub">{{ ch.subtitle }}</span>
      </td>
      <td><a href="{{ '/lectures/' | append: ch.id | append: '/' | relative_url }}">Chapter {{ ch.n }} Lectures</a></td>
      <td><a href="{{ '/notes/' | append: ch.id | append: '/' | relative_url }}">Notes</a></td>
      <td><a href="{{ '/practice/' | append: ch.id | append: '/' | relative_url }}">Practice Exercise</a></td>
    </tr>
  {% endfor %}
  </tbody>
</table>

## Optional chapters

Deeper-dive notes outside the required course sequence.

<table class="chapters">
  <thead>
    <tr>
      <th>Chapter</th>
      <th>Lectures</th>
      <th>Notes</th>
      <th>Practice Exercise</th>
    </tr>
  </thead>
  <tbody>
  {% for ch in site.data.chapters.optional %}
    <tr>
      <td>
        <span class="ch-title">{{ ch.title }}</span>
        <span class="ch-sub">{{ ch.subtitle }}</span>
      </td>
      <td><a href="{{ '/lectures/' | append: ch.id | append: '/' | relative_url }}">Chapter {{ ch.n }} Lectures</a></td>
      <td><a href="{{ '/notes/' | append: ch.id | append: '/' | relative_url }}">Notes</a></td>
      <td><a href="{{ '/practice/' | append: ch.id | append: '/' | relative_url }}">Practice Exercise</a></td>
    </tr>
  {% endfor %}
  </tbody>
</table>
