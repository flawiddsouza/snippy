<script setup>
function pasteAsPlainText(e) {
    e.preventDefault()
    var text = (e.originalEvent || e).clipboardData.getData('text/plain')
    document.execCommand('insertHTML', false, text)
}

const emit = defineEmits(['input'])
</script>

<template>
    <h2 class="flex-fill-available outline-0 single-line" contenteditable spellcheck="false" @input="emit('input', $event.target.innerText)" @paste="pasteAsPlainText"></h2>
</template>
