<script setup>
import Grid from './components/Grid.vue'
import Navigation from './components/Navigation.vue'
</script>

<template>
    <Grid>
        <Navigation />

        <div>
            <router-view></router-view>
        </div>
    </Grid>
</template>

<style>
html, body, #app {
    height: 100%;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body, h2 {
    margin: 0;
}

.h-100p {
    height: 100%;
}

.grid {
    display: grid;
}

.grid-layout-1 {
    grid-template-rows: auto 1fr;
}

.grid-layout-2 {
    grid-template-columns: auto 1fr;
}

.flex {
    display: flex;
}

.flex-jc-sb {
    justify-content: space-between;
}

.flex-ai-fs {
    align-items: flex-start;
}

.flex-fill-available {
    flex: 1
}

.p-1rem {
    padding: 1rem;
}

.pb-0 {
    padding-bottom: 0;
}

.ml-1rem {
    margin-left: 1rem;
}

.td-n {
    text-decoration: none;
}

.bb {
    border-bottom: 1px solid lightgrey;
}

.header {
    background-color: #36af8d;
    color: gold;
}

select, button {
    outline: 0;
    padding: 0.4rem;
}

.sidebar {
    width: 10rem;
    background-color: #21222c;
}

.sidebar-item {
    padding: 0.5rem 1rem;
    color: white;
    cursor: pointer;
    word-break: break-word;
}

.sidebar-item:hover {
    background-color: #ffffff0f;
}

.sidebar-item.active {
    background-color: #ffffff21;
}

.outline-0 {
    outline: 0;
}

[contenteditable].single-line {
    white-space: nowrap;
    width: 100%;
    overflow: hidden;
}

[contenteditable].single-line br {
    display: none;

}

[contenteditable].single-line * {
    display: inline;
    white-space: nowrap;
}

table {
    border-collapse: collapse;
}

table th, table td {
    border: 1px solid lightgrey;
    padding: 0.3rem;
}

table tr.clickable-row {
    vertical-align: middle;
}

table tr:hover.clickable-row td {
    background-color: rgb(218, 245, 255);
    cursor: pointer;
}

button.small {
    padding: 0.2rem;
}

.text-center {
    text-align: center;
}

input[type="search"] {
    border: 1px solid lightgrey;
    padding: 0.3rem 0.5rem;
}

input[type="search"]:focus {
    outline: 0;
    border-color: #36af8d;
}
</style>
