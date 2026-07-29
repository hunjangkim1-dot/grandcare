// -----------------------------
// 초기 실행
// -----------------------------

document.addEventListener("DOMContentLoaded", async () => {

  

    bindEvents();

    loadGrandchildren();

});

// -----------------------------
// 이벤트
// -----------------------------

function bindEvents() {

    document
        .getElementById("btnSearch")
        .addEventListener("click", loadGrandchildren);

    document
        .getElementById("searchKeyword")
        .addEventListener("keypress", (e) => {

            if (e.key === "Enter") {

                loadGrandchildren();

            }

        });

    document
        .getElementById("btnAddGrandchild")
        .addEventListener("click", () => {

            openGrandchildForm();

        });

}

// -----------------------------
// 목록 조회
// -----------------------------

async function loadGrandchildren() {

    const keyword = document
        .getElementById("searchKeyword")
        .value
        .trim();

    let query = supabaseClient
        .from("grandchildren")
        .select(`
            *,
            grandparents (
                name
            )
        `)
        .order("id", { ascending: false });

    if (keyword) {

        query = query.ilike("name", `%${keyword}%`);

    }

    const { data, error } = await query;

    if (error) {

        alert(error.message);

        return;

    }

    renderTable(data);

}

// -----------------------------
// 테이블 출력
// -----------------------------

function renderTable(list) {

    const tbody = document.getElementById("grandchildTable");

    if (!list.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-row">
                    등록된 손주가 없습니다.
                </td>
            </tr>
        `;

        return;

    }

    tbody.innerHTML = list.map(item => `

        <tr>

            <td>${item.id}</td>

            <td>${item.name ?? ""}</td>

            <td>${item.birth ?? ""}</td>

            <td>${item.gender ?? ""}</td>

            <td>${item.grandparents?.name ?? ""}</td>

            <td>${item.relationship ?? ""}</td>

            <td>${item.daycare_name ?? ""}</td>

            <td>${item.status ? "사용" : "중지"}</td>

            <td>

                <button
    class="btn btn-sm btn-primary"
    onclick="editGrandchild(${item.id})">

    수정

</button>

<button
    class="btn btn-sm btn-danger"
    onclick="deleteGrandchild(${item.id})">

    삭제

</button>

            </td>

        </tr>

    `).join("");

}

// -----------------------------
// 수정
// -----------------------------

async function editGrandchild(id) {

    const { data, error } = await supabaseClient
        .from("grandchildren")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {

        alert(error.message);

        return;

    }

    openGrandchildForm(data);

}

// -----------------------------
// 삭제
// -----------------------------

async function deleteGrandchild(id) {

    if (!confirm("삭제하시겠습니까?")) {

        return;

    }

    const { error } = await supabaseClient
        .from("grandchildren")
        .delete()
        .eq("id", id);

    if (error) {

        alert(error.message);

        return;

    }

    loadGrandchildren();

}