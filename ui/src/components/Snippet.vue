<script setup>
import { reactive, ref, inject, watch, onMounted } from 'vue'
import Header from './Header.vue'
import Grid from './Grid.vue'
import Sidebar from './Sidebar.vue'
import CodeEditor from './CodeEditor.vue'
import SingleLineInput from './SingleLineInput.vue'
import { useStore } from '../store'
import { useRouter, useRoute } from 'vue-router'

const store = useStore()
const router = useRouter()
const route = useRoute()
const loading = inject('loading')

const snippet = ref(null)
const activeFile = ref(null)
const headerInputRef = ref(null)

const languages = [
    {
        label: 'JavaScript',
        value: 'javascript',
        extension: 'js'
    },
    {
        label: 'TypeScript',
        value: 'typescript',
        extension: 'ts'
    },
    {
        label: 'JSON',
        value: 'json',
        extension: 'json'
    },
    {
        label: 'CSS',
        value: 'css',
        extension: 'css'
    },
    {
        label: 'SCSS',
        value: 'scss',
        extension: 'scss'
    },
    {
        label: 'HTML',
        value: 'html',
        extension: 'html'
    },
    {
        label: 'Python',
        value: 'python',
        extension: 'py'
    }
]

const languageExtensions = languages.reduce((prev, curr) => {
    prev[curr.value] = curr.extension
    return prev
}, {})

const sampleSnippetFiles = [
    {
        filename: 'main.js',
        language: 'javascript',
        code: '// Type your code here'
    }
]

function changeLanguage(e) {
    activeFile.value.language = e.target.value
    const existingExtension = '.' + activeFile.value.filename.split('.').pop()
    const newExtension = `.${languageExtensions[activeFile.value.language]}`
    activeFile.value.filename = activeFile.value.filename.replace(existingExtension, newExtension)
}

function addFile() {
    const filename = prompt('Enter filename:')
    if(filename) {
        const newFile = {
            filename: filename + '.js',
            language: 'javascript',
            code: ''
        }
        snippet.value.files.push(newFile)
        activeFile.value = newFile
    }
}

async function save() {
    if(snippet.value.title === '') {
        alert('Title required')
        return
    }
    const loader = loading.show()
    if(!route.params.id) {
        await store.addSnippet(snippet.value)
    } else {
        await store.updateSnippet(snippet.value)
    }
    loader.hide()
    router.push({
        name: 'Home'
    })
}

function setSnippet(snippetValue) {
    snippet.value = snippetValue
    activeFile.value = snippet.value.files[0]
    if(headerInputRef.value) {
        headerInputRef.value.$el.innerHTML = snippet.value.title
    }
}

async function loadSnippet() {
    if(!route.params.id) {
        setSnippet({
            title: '',
            files: sampleSnippetFiles
        })
        return
    }
    const loader = loading.show()
    const response = await fetch(`/snippets/${route.params.id}`)
    setSnippet(await response.json())
    loader.hide()
}

function renameActiveFile() {
    const existingExtension = '.' + activeFile.value.filename.split('.').pop()
    const existingFilename = activeFile.value.filename.replace(existingExtension, '')
    const newFilename = prompt('Enter new filename', existingFilename)
    if(!newFilename) {
        alert('File name cannot be empty')
        return
    }
    activeFile.value.filename = newFilename + existingExtension
}

function shareSnippet() {
    window.open(document.location.origin + `/snippet/${snippet.value.id}`)
}

watch(() => route.params.id, loadSnippet)
watch(headerInputRef, () => {
    headerInputRef.value.$el.innerHTML = snippet.value.title
})

onMounted(loadSnippet)
</script>

<template>
    <Grid v-if="snippet && activeFile">
        <Header>
            <SingleLineInput @input="snippet.title = $event" :ref="element => headerInputRef = element" />
            <div>
                <button @click="shareSnippet" v-if="snippet.id">Share Snippet</button>
                <button class="ml-1rem" @click="renameActiveFile">Rename File</button>
                <select class="ml-1rem" @change="changeLanguage">
                    <option :value="language.value" v-for="language in languages">{{ language.label }}</option>
                </select>
                <button class="ml-1rem" @click="save()">Save Snippet</button>
            </div>
        </Header>
        <div class="grid grid-layout-2">
            <Sidebar :files="snippet.files" v-model:activeFile="activeFile" @addfile="addFile" />
            <CodeEditor v-model="activeFile.code" v-model:language="activeFile.language" :key="route.path + '-' + route.params.id + '-' + activeFile.filename"></CodeEditor>
        </div>
    </Grid>
</template>
