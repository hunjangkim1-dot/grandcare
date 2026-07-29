// admin/grandparents/grandparents.js

const TABLE = "grandparents";

let grandparentList = [];

document.addEventListener("DOMContentLoaded", () => {

    Modal.init();

    bindEvents();

    loadGrandparents();

});

function bindEvents() {

    document
        .getElementById("btnSearch")
        ?.addEventListener("click", searchGrandparents);

    document
        .getElementById("searchKeyword")
        ?.addEventListener("keydown", (e) => {

            if (e.key === "Enter") {

                searchGrandparents();

            }

        });

    document
        .getElementById("btnAddGrandparent")
        ?.addEventListener("click", () => {

            openRegisterForm();

        });

}

/* ======================================
   조회
====================================== */

async function loadGrandparents() {

    const tbody = document.getElementById("grandparentTable");

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-row">
                불러오는 중...
            </td>
        </tr>
    `;

    try {

        const { data, error } = await window.supabaseClient

            .from(TABLE)

            .select("*")

            .order("created_at", { ascending: false });

        if (error) throw error;

        grandparentList = data ?? [];

        renderTable(grandparentList);

    }

    catch (err) {

        console.error(err);

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">
                    데이터를 불러오지 못했습니다.
                </td>
            </tr>
        `;

    }

}

/* ======================================
   검색
====================================== */

function searchGrandparents() {

    const keyword = document
        .getElementById("searchKeyword")
        .value
        .trim()
        .toLowerCase();

    if (!keyword) {

        renderTable(grandparentList);

        return;

    }

    const result = grandparentList.filter(item =>

        (item.name ?? "")
            .toLowerCase()
            .includes(keyword)

    );

    renderTable(result);

}

/* ======================================
   출력
====================================== */

function renderTable(list) {

    const tbody = document.getElementById("grandparentTable");

    if (list.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">
                    등록된 조부모가 없습니다.
                </td>
            </tr>
        `;

        return;

    }

    tbody.innerHTML = "";

    list.forEach((item, index) => {

        tbody.insertAdjacentHTML("beforeend", `

            <tr>

                <td>${index + 1}</td>

                <td>${item.name ?? ""}</td>

                <td>${item.birth_date ?? ""}</td>

                <td>${item.phone ?? ""}</td>

                <td>

                    <span class="badge badge-success">

                        ${item.status === "active" ? "참여중" : "중단"}

                    </span>

                </td>

                <td>

                    <button
                        class="btn"
                        onclick="editGrandparent('${item.id}')">

                        수정

                    </button>

                    <button
                        class="btn btn-danger"
                        onclick="deleteGrandparent('${item.id}')">

                        삭제

                    </button>

                </td>

            </tr>

        `);

    });

}

/* ======================================
   삭제
====================================== */

async function deleteGrandparent(id) {

    if (!confirm("삭제하시겠습니까?")) {

        return;

    }

    try {

        const { error } = await window.supabaseClient

            .from(TABLE)

            .delete()

            .eq("id", id);

        if (error) throw error;

        loadGrandparents();

    }

    catch (err) {

        console.error(err);

        alert("삭제에 실패했습니다.");

    }

}