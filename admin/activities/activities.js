console.log("activities.js loaded");

// =========================================
// 초기 실행
// =========================================

document.addEventListener("DOMContentLoaded", async () => {

    await loadGrandparentFilter();

    await loadActivities();

    document

        .getElementById("btnSearch")

        .addEventListener(

            "click",

            loadActivities

        );

    document

        .getElementById("btnAddActivity")

        .addEventListener(

            "click",

            openActivityForm

        );

});

// =========================================
// 활동 목록 조회
// =========================================

async function loadActivities() {

    const tbody =

        document.getElementById("activityTable");

    tbody.innerHTML = `

        <tr>

            <td colspan="7">

                불러오는 중...

            </td>

        </tr>

    `;

    const startDate =
    document
        .getElementById("startDate")
        .value;

const endDate =
    document
        .getElementById("endDate")
        .value;

    const grandparentId =

        document

            .getElementById("searchGrandparent")

            .value;

    let query =

        supabaseClient

            .from("activities")

            .select(`

                *,

                grandparents(name),

                grandchildren(name)

            `);

                // =====================================
    // 검색조건
    // =====================================

    if (startDate) {

        query =
            query.gte(
                "activity_date",
                startDate
            );

    }

    if (endDate) {

        query =
            query.lte(
                "activity_date",
                endDate
            );

    }

    if (grandparentId) {

        query =
            query.eq(
                "grandparent_id",
                grandparentId
            );

    }

    // =====================================
    // 조회
    // =====================================

    const {

        data,

        error

    } = await query

        .order(
            "activity_date",
            {
                ascending: false
            }
        )

        .order(
            "start_time",
            {
                ascending: false
            }
        );

    if (error) {

        console.error(error);

        tbody.innerHTML = `

            <tr>

                <td colspan="7">

                    데이터를 불러오지 못했습니다.

                </td>

            </tr>

        `;

        return;

    }

    renderTable(data);

}

// =========================================
// 테이블 출력
// =========================================

function renderTable(data) {

    const tbody =
        document.getElementById("activityTable");

    if (data.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="7" class="empty-row">

                    등록된 활동이 없습니다.

                </td>

            </tr>

        `;

        return;

    }

    tbody.innerHTML = data.map(item => `

        <tr>

            <td>

                ${item.activity_date}

            </td>

            <td>

                ${item.grandparents?.name ?? ""}

            </td>

            <td>

                ${item.grandchildren?.name ?? ""}

            </td>

            <td>

                ${item.start_time?.substring(0,5) ?? ""}

            </td>

            <td>

                ${item.end_time?.substring(0,5) ?? ""}

            </td>

            <td>

                ${item.duration_minutes ?? 0}분

            </td>

            <td>

                <button
                    class="btn btn-sm"
                    onclick="editActivity(${item.id})">

                    수정

                </button>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="deleteActivity(${item.id})">

                    삭제

                </button>

            </td>

        </tr>

    `).join("");

}

// =========================================
// 조부모 검색 콤보
// =========================================

async function loadGrandparentFilter() {

    const select =
        document.getElementById("searchGrandparent");

    if (!select) return;

    const {

        data,

        error

    } = await supabaseClient

        .from("grandparents")

        .select("id,name")

        .eq("status", "active")

        .order("name");

    if (error) {

        console.error(error);

        return;

    }

    select.innerHTML = `

        <option value="">

            전체

        </option>

    `;

    data.forEach(gp => {

        select.innerHTML += `

            <option value="${gp.id}">

                ${gp.name}

            </option>

        `;

    });

}

// =========================================
// 활동 삭제
// =========================================

window.deleteActivity = async function (id) {

    if (!confirm("삭제하시겠습니까?")) {

        return;

    }

    const { error } = await supabaseClient

        .from("activities")

        .delete()

        .eq("id", id);

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    await loadActivities();

}

// =========================================
// 활동 수정
// =========================================

window.editActivity = function (id) {

    currentActivityId = id;

    openActivityForm();

}