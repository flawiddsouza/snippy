export default function createConfirm(message) {
    const confirmModalDiv = document.createElement('div')

    confirmModalDiv.innerHTML  = `
        <div style="position: fixed; height: 100vh; width: 100vw; display: grid; place-items: center; background: #00000052; top: 0; z-index: 2">
            <div style="background-color: white; padding: 1rem">
                <div style="font-size: 1rem">${message}</div>
                <div style="margin-top: 1rem; text-align: right;">
                    <button class="button button-green" id="p-confirm">Confirm</button>
                    <button class="button" id="p-cancel" style="margin-left: 0.5rem">Cancel</button>
                </div>
            </div>
        </div>
    `

    document.body.appendChild(confirmModalDiv)

    return new Promise((resolve) => {
        const eventHandler = e => {
            if(e.target.id === 'p-confirm') {
                resolve(true)
            }

            if(e.target.id === 'p-cancel') {
                resolve(false)
            }

            if(e.target.id === 'p-confirm' || e.target.id === 'p-cancel') {
                document.removeEventListener('click', eventHandler)
                document.body.removeChild(confirmModalDiv)
            }
        }

        document.addEventListener('click', eventHandler)
    })
}
