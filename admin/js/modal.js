// admin/js/modal.js
console.log("modal.js loaded");
const Modal = {

    overlay: null,

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

                </div>

            </div>

        `);

        this.overlay = document.getElementById("gc-modal");

        document
            .getElementById("gc-modal-close")
            .addEventListener("click", () => this.close());

        this.overlay.addEventListener("click", (e) => {

            if (e.target === this.overlay) {

                this.close();

            }

        });

        document.addEventListener("keydown", (e) => {

            if (e.key === "Escape") {

                this.close();

            }

        });

    },

    open(title, body) {

        document.getElementById("gc-modal-title").textContent = title;

        document.getElementById("gc-modal-body").innerHTML = body;

        this.overlay.style.display = "flex";

    },

    close() {

        this.overlay.style.display = "none";

        document.getElementById("gc-modal-body").innerHTML = "";

    }

};

window.Modal = Modal;