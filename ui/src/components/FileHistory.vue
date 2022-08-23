<script setup>
import { inject, ref, watch, onBeforeMount, onMounted } from 'vue'
import monaco from '../monaco-helper'
import dayjs from 'dayjs'

const loading = inject('loading')

const props = defineProps({
    snippetId: {
        type: Number,
        required: true
    },
    filename: {
        type: String,
        required: true
    }
})

const fileHistoryFiles = ref([])
const fileHistory = ref([])
const selectedFilename = ref(null)
const selectedFileHistory = ref(null)
const editorRef = ref(null)

let diffEditor = null
let originalModel = null
let modifiedModel = null

async function fetchFileHistoryFiles() {
    const response = await fetch(`/snippets/${props.snippetId}/file-history/files`)
    fileHistoryFiles.value = await response.json()
}

async function fetchFileHistory() {
    const response = await fetch(`/snippets/${props.snippetId}/file-history/files/${selectedFilename.value}`)
    fileHistory.value = await response.json()
    if(fileHistory.value.length > 0) {
        selectedFileHistory.value = fileHistory.value[0]
    }
}

function formatTimestamp(timestamp) {
    return dayjs(timestamp).format('DD-MMM-YY hh:mm:ss A')
}

onBeforeMount(() => {
    fetchFileHistoryFiles()
})

onMounted(() => {
    selectedFilename.value = props.filename

    diffEditor = monaco.editor.createDiffEditor(editorRef.value, {
        readOnly: true
    })

    originalModel = monaco.editor.createModel(
        '',
        'plain/text'
    )

    modifiedModel = monaco.editor.createModel(
        '',
        'plain/text'
    )

    diffEditor.setModel({
        original: originalModel,
        modified: modifiedModel
    })
})

watch(selectedFilename, () => {
    fileHistory.value = []
    selectedFileHistory.value = null
    fetchFileHistory()
})

watch(selectedFileHistory, () => {
    if(selectedFileHistory.value === null || diffEditor === null || originalModel === null || modifiedModel === null) {
        return
    }

    const historyItemIndex = fileHistory.value.findIndex(fileHistoryItem => fileHistoryItem.created === selectedFileHistory.value.created)

    let beforeSelectedFileHistory = selectedFileHistory.value

    if(historyItemIndex + 1 in fileHistory.value) {
        beforeSelectedFileHistory = fileHistory.value[historyItemIndex + 1]
    } else {
        beforeSelectedFileHistory = {
            code: '',
            language: selectedFileHistory.value.language
        }
    }

    originalModel.setValue(beforeSelectedFileHistory.code)
    monaco.editor.setModelLanguage(originalModel, beforeSelectedFileHistory.language)

    modifiedModel.setValue(selectedFileHistory.value.code)
    monaco.editor.setModelLanguage(modifiedModel, selectedFileHistory.value.language)

    diffEditor.revealLineNearTop(1)
})
</script>

<template>
    <div>
        <select style="width: 100%" v-model="selectedFilename">
            <option v-for="file in fileHistoryFiles" :value="file.filename">{{ file.filename }}<template v-if="file.status === 'DELETED'"> (Deleted)</template></option>
        </select>
    </div>
    <div style="margin-top: 1rem">
        <select style="width: 100%" v-model="selectedFileHistory">
            <option v-for="fileHistoryItem in fileHistory" :value="fileHistoryItem">
                {{ formatTimestamp(fileHistoryItem.created) }}<template v-if="fileHistoryItem.type === 'Last Saved'"> (Last Saved)</template>
            </option>
        </select>
    </div>
    <div style="margin-top: 1rem; height: 30rem;">
        <div ref="editorRef" style="height: 100%"></div>
    </div>
</template>
