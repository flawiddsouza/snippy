// html and css for loader take from vue-loading-overlay library

export default {
    install: (app, options) => {
        app.config.globalProperties.$loading = {
            show() {
                let loader = document.createElement('div')
                loader.innerHTML = `
                    <style>
                    .vld-overlay {
                        bottom: 0;
                        left: 0;
                        position: absolute;
                        right: 0;
                        top: 0;
                        align-items: center;
                        display: none;
                        justify-content: center;
                        overflow: hidden;
                        z-index: 1
                    }

                    .vld-overlay.is-active {
                        display: flex
                    }

                    .vld-overlay.is-full-page {
                        z-index: 999;
                        position: fixed
                    }

                    .vld-overlay .vld-background {
                        bottom: 0;
                        left: 0;
                        position: absolute;
                        right: 0;
                        top: 0;
                        background: #fff;
                        opacity: 0.5
                    }

                    .vld-overlay .vld-icon, .vld-parent {
                        position: relative
                    }
                    </style>
                    <div tabindex="0" aria-label="Loading" class="vld-overlay is-active is-full-page" aria-busy="true" style="">
                        <div class="vld-background" style="background: black; opacity: 0.5;"></div>
                        <div class="vld-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" height="128" width="128" fill="white">
                                <rect x="0" y="13" width="4" height="5">
                                    <animate attributeName="height" attributeType="XML" values="5;21;5" begin="0s" dur="0.6s" repeatCount="indefinite"></animate><animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0s" dur="0.6s" repeatCount="indefinite"></animate></rect><rect x="10" y="13" width="4" height="5"><animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate><animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate></rect><rect x="20" y="13" width="4" height="5"><animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate><animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate>
                                </rect>
                            </svg>
                        </div>
                    </div>
                `
                document.body.appendChild(loader)
                loader.hide = loader.remove
                return loader
            }
        }
        app.provide('loading', app.config.globalProperties.$loading)
    }
}
