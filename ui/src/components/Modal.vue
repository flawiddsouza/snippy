<script setup>
const props = defineProps({
    width: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['close'])

function closeModalOnBackgroundClick(e) {
    // document.body.contains(e.target) is needed when the clicked element is no longer in the DOM
    // if you don't add it, the orphaned e.target element will close the modal, as its "closest" will
    // not yield the .modal class element or any other elements for that matter
    // because it has been removed by the user
    if(e.target.closest('.modal') === null && document.body.contains(e.target)) {
        emit('close')
    }
}
</script>

<template>
    <div class="modal-container" @click="closeModalOnBackgroundClick">
        <div class="modal" :style="{ width }">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.modal-container {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background-color: #bababa59;
    z-index: 1;
    display: grid;
    place-items: center;
}

.modal {
    padding: 1rem;
    background-color: white;
}
</style>
