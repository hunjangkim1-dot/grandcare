// admin/js/modal.js

console.log("modal.js loaded");

const Modal = {

    overlay: null,
    confirmCallback: null,

    init() {

        if (document.getElementById("gc-modal")) return;

        document.body.insertAdjacentHTML("beforeend", `

            <div id="gc-modal" class="modal-overlay">

                <div class="modal">

                    <div class="modal-header">

                        <h3 id="gc-modal-title"></h3>

                        <button id="gc-modal-close" class="modal-close">
                            ×
                        </button>

                    </div>

                    <div id="gc-modal-body" class="modal-body"></div>

                    <div class="modal-footer">

                        <button
                            id="gc-modal-cancel"
                            class="btn">

                            취소

                        </button>

                        <button
                            id="gc-modal-confirm"
                            class="btn btn-primary">

                            저장

                        </button>

                    </div>

                </div>

            </div>

        `);

        this.overlay = document.getElementById("gc-modal");

        // 닫기 버튼
        document
            .getElementById("gc-modal-close")
            .addEventListener("click", () => this.close());

        // 취소 버튼
        document
            .getElementById("gc-modal-cancel")
            .addEventListener("click", () => this.close());

        // 저장 버튼
        document
            .getElementById("gc-modal-confirm")
            .addEventListener("click", async () => {

                if (typeof this.confirmCallback === "function") {

                    await this.confirmCallback();

                }

            });

        // 바깥 클릭
        this.overlay.addEventListener("click", (e) => {

            if (e.target === this.overlay) {

                this.close();

            }

        });

        // ESC
        document.addEventListener("keydown", (e) => {

            if (this.overlay.style.display !== "flex") return;

            if (e.key === "Escape") {

                this.close();

            }

            if (e.key === "Enter") {

                const active = document.activeElement;

                if (
                    active &&
                    active.tagName !== "TEXTAREA"
                ) {

                    document
                        .getElementById("gc-modal-confirm")
                        .click();

                }

            }

        });

    },

    open(options) {

        const {

           title = "",
    body = "",
    confirmText = "저장",
    cancelText = "취소",
    onConfirm = null,
    onOpen = null

        } = options;

        this.confirmCallback = onConfirm;

        document.getElementById("gc-modal-title").textContent = title;

        document.getElementById("gc-modal-body").innerHTML = body;

        document.getElementById("gc-modal-confirm").textContent = confirmText;

        document.getElementById("gc-modal-cancel").textContent = cancelText;

        this.overlay.style.display = "flex";

if (typeof onOpen === "function") {

    setTimeout(() => {

        onOpen();

    }, 0);

}

    },

    close() {

        this.overlay.style.display = "none";

        this.confirmCallback = null;

        document.getElementById("gc-modal-title").textContent = "";

        document.getElementById("gc-modal-body").innerHTML = "";

    }

};

window.Modal = Modal;