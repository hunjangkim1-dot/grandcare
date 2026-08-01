// -----------------------------
// 초기 실행
// -----------------------------

document.addEventListener("DOMContentLoaded", () => {

    loadActivities();

});

// -----------------------------
// 목록 조회
// -----------------------------

async function loadActivities() {

    const tbody = document.getElementById("activityTable");
const startDate =
    document.getElementById("searchStartDate").value;

const endDate =
    document.getElementById("searchEndDate").value;

const grandparentId =
    document.getElementById("searchGrandparent").value;
    tbody.innerHTML = `
        <tr>
            <td colspan="8">불러오는 중...</td>
        </tr>
    `;

    let query =
    supabaseClient
        .from("activities")
        .select(`
            *,
            grandparents(name),
            grandchildren(name, daycare_name)
        `);

if (startDate) {

    query =
        query.gte("activity_date", startDate);

}

if (endDate) {

    query =
        query.lte("activity_date", endDate);

}

if (grandparentId) {

    query =
        query.eq("grandparent_id", grandparentId);

}

const { data, error } =
    await query.order(
        "activity_date",
        { ascending: false }
    );

    if (error) {

        console.error(error);

        tbody.innerHTML = `
            <tr>
                <td colspan="8">데이터를 불러오지 못했습니다.</td>
            </tr>
        `;

        return;

    }

    renderTable(data);

}

// -----------------------------
// 테이블 출력
// -----------------------------

function renderTable(data) {

    const tbody = document.getElementById("activityTable");

    if (data.length === 

    tbody.innerHTML = data.map(item => `
        <tr>

            <td>${item.activity_date}</td>

            <td>${item.grandparents?.name ?? ""}</td>

            <td>${item.grandchildren?.name ?? ""}</td>

            <td>${item.start_time}</td>

            <td>${item.end_time}</td>

            <td>${item.duration_minutes}분</td>

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


document.addEventListener("DOMContentLoaded", () => {
document
    .getElementById("btnSearch")
    .addEventListener(
        "click",
        loadActivities
    );
    loadActivities();

    document
        .getElementById("btnAddActivity")
        .addEventListener("click", openActivityForm);

});

window.deleteActivity = async function(id){

    if(!confirm("삭제하시겠습니까?")) return;

    const { error } = await supabaseClient

        .from("activities")

        .delete()

        .eq("id",id);

    if(error){

        alert(error.message);

        return;

    }

    loadActivities();

}
