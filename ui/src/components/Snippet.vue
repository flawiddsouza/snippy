<script setup>
import { reactive, ref } from 'vue'
import Header from './Header.vue'
import Grid from './Grid.vue'
import Sidebar from './Sidebar.vue'
import CodeEditor from './CodeEditor.vue'
import SingleLineInput from './SingleLineInput.vue'
import { useStore } from '../store'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const snippet = reactive({
    title: '',
    files: [
        {
            filename: 'main.js',
            language: 'javascript',
            code: 'Hi'
        }
    ]
})

const activeFile = ref(snippet.files[0])

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
    }
]

const languageExtensions = languages.reduce((prev, curr) => {
    prev[curr.value] = curr.extension
    return prev
}, {})

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
        snippet.files.push(newFile)
        activeFile.value = newFile
    }
}

function save() {
    store.addSnippet(snippet)
    router.push('/')
}
</script>

<template>
    <Grid>
        <Header>
            <SingleLineInput @input="snippet.title = $event" />
            <div>
                <select @change="changeLanguage">
                    <option :value="language.value" v-for="language in languages">{{ language.label }}</option>
                </select>
                <button class="ml-1rem" @click="save()">Save Snippet</button>
            </div>
        </Header>
        <div class="grid grid-layout-2">
            <Sidebar :files="snippet.files" v-model:activeFile="activeFile" @addfile="addFile" />
            <CodeEditor v-model="activeFile.code" v-model:language="activeFile.language" :key="activeFile.filename"></CodeEditor>
        </div>
    </Grid>
</template>
