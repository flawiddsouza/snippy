<script setup>
import { ref, inject, watch, onMounted, onUnmounted } from 'vue'
import Header from './Header.vue'
import Grid from './Grid.vue'
import Sidebar from './Sidebar.vue'
import CodeEditor from './CodeEditor.vue'
import SingleLineInput from './SingleLineInput.vue'
import { useStore } from '../store'
import { useRouter, useRoute } from 'vue-router'
import createConfirm from '../createConfirm'

const store = useStore()
const router = useRouter()
const route = useRoute()
const loading = inject('loading')

const snippet = ref(null)
const activeFile = ref(null)
const headerInputRef = ref(null)
const showFileActions = ref(false)

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
    },
    {
        label: 'YAML',
        value: 'yaml',
        extension: 'yml'
    },
    {
        label: 'SQL',
        value: 'sql',
        extension: 'sql'
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

function getFilenameAndLanguage(filename, languageHint) {
    const filenameHasExtensionLanguage = languages.find(language => filename.endsWith('.' + language.extension))

    if(filenameHasExtensionLanguage) {
        return [filename, filenameHasExtensionLanguage.value]
    }

    const languageHintLanguage = languages.find(language => language.value === languageHint)

    return [filename + '.' + languageHintLanguage.extension, languageHint]
}

function addFile() {
    const newFilename = prompt('Enter filename:')
    if(newFilename) {
        const [ filename, language ] = getFilenameAndLanguage(newFilename, 'javascript')
        const newFile = {
            filename,
            language,
            code: ''
        }
        snippet.value.files.push(newFile)
        snippet.value.files.sort((a, b) => a.filename.localeCompare(b.filename))
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
        const addedSnippet = await store.addSnippet(snippet.value)
        router.push({
            name: 'View Snippet',
            params: {
                id: addedSnippet.id
            }
        })
    } else {
        await store.updateSnippet(snippet.value)
    }
    loader.hide()
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

function downloadActiveFile() {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([activeFile.value.code], { type: 'plain/text' }))
    a.download = activeFile.value.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

function renameActiveFile() {
    const newFilename = prompt('Enter new filename', activeFile.value.filename)
    if(!newFilename) {
        if(newFilename === '') {
            alert('File name cannot be empty')
        }
        hideFileActions()
        return
    }
    const [ filename, language ] = getFilenameAndLanguage(newFilename, activeFile.value.language)
    activeFile.value.filename = filename
    activeFile.value.language = language
    hideFileActions()
}

async function deleteActiveFile() {
    if(snippet.value.files.length === 1) {
        alert('Unable to delete as there\'s only one file in your snippet')
        hideFileActions()
        return
    }

    if(!await createConfirm('Are you sure?')) {
        return
    }

    if('id' in snippet.value === false) {
        snippet.value.files = snippet.value.files.filter(file => file.filename !== activeFile.value.filename)
        activeFile.value = snippet.value.files[0]
        return
    }

    const loader = loading.show()
    await fetch(`/snippets/${snippet.value.id}/${activeFile.value.filename}`, {
        method: 'DELETE'
    })
    loader.hide()
    loadSnippet()
}

function shareSnippet() {
    window.open(document.location.origin + `/snippet/${snippet.value.id}`)
}

function shareFile() {
    window.open(document.location.origin + `/snippet/${snippet.value.id}/${activeFile.value.filename}`)
}

function saveOnCtrlSEventHandler(e) {
    if(e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        save()
    }
}

async function toggleSharing() {
    const loader = loading.show()
    await fetch(`/snippets/${snippet.value.id}/toggle-sharing`, {
        method: 'PUT'
    })
    snippet.value.shared = !snippet.value.shared
    loader.hide()
}

function hideFileActions() {
    showFileActions.value = false
}

function clickedOutside(event) {
    const target = document.querySelector('.file-actions')
    const withinBoundaries = event.composedPath().includes(target)
    if (!withinBoundaries) {
        hideFileActions()
    }
}

watch(() => route.params.id, loadSnippet)
watch(headerInputRef, () => {
    headerInputRef.value.$el.innerHTML = snippet.value.title
})

onMounted(() => {
    loadSnippet()
    window.addEventListener('keydown', saveOnCtrlSEventHandler)
    window.addEventListener('click', clickedOutside)
})

onUnmounted(() => {
    window.removeEventListener('keydown', saveOnCtrlSEventHandler)
    window.removeEventListener('click', clickedOutside)
})
</script>

<template>
    <Grid v-if="snippet && activeFile">
        <Header>
            <SingleLineInput @input="snippet.title = $event" :ref="element => headerInputRef = element" />
            <div>
                <template v-if="snippet.id">
                    <button @click="toggleSharing">
                        <template v-if="snippet.shared">Disable Sharing</template>
                        <template v-else>Enable Sharing</template>
                    </button>
                    <button class="ml-1rem" @click="shareSnippet" :disabled="!snippet.shared">Share Snippet</button>
                </template>
                <div class="ml-1rem file-actions" style="display: inline-block; position: relative;">
                    <button @click="showFileActions = !showFileActions">File Actions</button>
                    <div style="position: absolute; z-index: 1; width: 7rem; top: 32px; background: #36af8d; padding: 0.3rem; left: -5px;" v-show="showFileActions">
                        <template v-if="snippet.id">
                            <div>
                                <button @click="shareFile" :disabled="!snippet.shared" style="width: 100%">Share</button>
                            </div>
                        </template>
                        <div style="margin-top: 0.2rem;" v-if="snippet.id"></div>
                        <div>
                            <button @click="downloadActiveFile" style="width: 100%">Download</button>
                        </div>
                        <div style="margin-top: 0.2rem;">
                            <button @click="renameActiveFile" style="width: 100%">Rename</button>
                        </div>
                        <div style="margin-top: 0.2rem;">
                            <button @click="deleteActiveFile" style="width: 100%">Delete</button>
                        </div>
                    </div>
                </div>
                <select class="ml-1rem" @change="changeLanguage">
                    <option :value="language.value" v-for="language in languages" :selected="language.value === activeFile.language">{{ language.label }}</option>
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
