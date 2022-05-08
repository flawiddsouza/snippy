<script setup>
import { ref, onMounted, watch } from 'vue'
import monaco from '../monaco-helper'

let editor = null
const editorRef = ref(null)

const props = defineProps({
    modelValue: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['update:modelValue', 'update:modelLanguage'])

watch(() => props.language, () => {
    monaco.editor.setModelLanguage(editor.getModel(), props.language)
})

onMounted(() => {
    editor = monaco.editor.create(editorRef.value, {
        value: props.modelValue,
        language: props.language,
        theme: 'vs-dark',
        padding: {
            top: 15
        },
        automaticLayout: true
    })

    editor.getModel().onDidChangeContent(e => {
        emit('update:modelValue', editor.getValue())
    })

    editor.focus()
})
</script>

<template>
    <div :ref="(element) => editorRef = element"></div>
</template>

<style>
/* from: https://stackoverflow.com/a/71876526/4932305 */
.monaco-editor {
    position: absolute !important;
}
</style>
