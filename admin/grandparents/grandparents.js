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

        window.grandparents = data;

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

// ======================================================
// 검색
// ======================================================

document

    .getElementById("searchKeyword")

    .addEventListener("keydown", e => {

        if (e.key === "Enter") {

            searchGrandparents();

        }

    });
window.searchGrandparents = function () {

    const keyword = document

        .getElementById("searchKeyword")

        .value

        .trim()

        .toLowerCase();

    if (!keyword) {

        renderTable(window.grandparents);

        return;

    }

    const filtered = window.grandparents.filter(item => {

        return (

            (item.name ?? "")
                .toLowerCase()
                .includes(keyword)

            ||

            (item.phone ?? "")
                .includes(keyword)

            ||

            (item.birth ?? "")
                .includes(keyword)

            ||

            (item.address ?? "")
                .toLowerCase()
                .includes(keyword)

            ||

            (item.account_holder ?? "")
                .toLowerCase()
                .includes(keyword)

        );

    });

    renderTable(filtered);

};

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

// ======================================================
// 조부모 수정
// ======================================================

window.editGrandparent = async function (id) {

    try {

        const {

            data,

            error

        } = await window.supabaseClient

            .from("grandparents")

            .select("*")

            .eq("id", id)

            .single();

        if (error)
            throw error;

        openRegisterForm(data);

    }

    catch (err) {

        console.error(err);

        alert(

            "정보를 불러오는 중 오류가 발생했습니다.\n\n"

            + err.message

        );

    }

};
window.showQRCode = async function(id){

    const { data, error } = await supabaseClient

        .from("grandparents")

        .select("name, qr_token")

        .eq("id", id)

        .single();

    if(error){

        alert(error.message);

        return;

    }

    Modal.open({

        title: data.name + " QR",

        body: `

            <div
                id="qrArea"
                style="display:flex;
                       justify-content:center;
                       padding:20px;">
            </div>

        `,

        confirmText:"닫기",

        cancelText:"",

        onConfirm:()=>Modal.close()

    });

    new QRCode(

        document.getElementById("qrArea"),

        {
            text:
                location.origin +
                "/grandCare/mobile/checkin.html?token=" +
                data.qr_token,

            width:220,

            height:220

        }

    );

}