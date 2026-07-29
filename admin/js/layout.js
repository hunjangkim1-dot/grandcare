// admin/js/layout.js

document.addEventListener("DOMContentLoaded", async () => {
    await loadComponent("sidebar", "../components/sidebar.html");
await loadComponent("header", "../components/header.html");
await loadComponent("modal", "../components/modal.html");

Modal.init();
    setActiveMenu();
    bindLogout();
});

/**
 * 공통 컴포넌트 불러오기
 */
async function loadComponent(targetId, url) {

    const target = document.getElementById(targetId);

    if (!target) return;

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`${url} 로드 실패`);
        }

        target.innerHTML = await response.text();

    } catch (error) {

        console.error(error);

    }

}

/**
 * 현재 메뉴 활성화
 */
function setActiveMenu() {

    const currentPage = location.pathname.split("/").pop();

    document.querySelectorAll(".sidebar-menu a").forEach(menu => {

        menu.classList.remove("active");

        const href = menu.getAttribute("href");

        if (href && href.endsWith(currentPage)) {

            menu.classList.add("active");

        }

    });

}

/**
 * 로그아웃
 */
function bindLogout() {

    const logoutBtn = document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async () => {

        if (!confirm("로그아웃 하시겠습니까?")) return;

        try {

            if (window.supabaseClient) {
                await window.supabaseClient.auth.signOut();
            }

        } catch (e) {

            console.error(e);

        }

        location.href = "../index.html";

    });

}

Modal.init();