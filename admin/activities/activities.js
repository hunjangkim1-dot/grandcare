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

    tbody.innerHTML = `
        <tr>
            <td colspan="8">불러오는 중...</td>
        </tr>
    `;

    const { data, error } = await supabaseClient
        .from("activities")
        .select(`
            *,
            grandparents(name),
            grandchildren(name, daycare_name)
        `)
        .order("activity_date", { ascending: false });

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

    if (data.length === 0) {

       tbody.innerHTML = `
<tr>
    <td colspan="8">
        불러오는 중...
    </td>
</tr>
`;

tbody.innerHTML = `
<tr>
    <td colspan="8" class="empty-row">
        데이터를 불러오지 못했습니다.
    </td>
</tr>
`;

tbody.innerHTML = `
<tr>
<td colspan="8">
등록된 활동이 없습니다.
</td>
</tr>
`;

        return;

    }

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

<button
    class="btn btn-primary btn-sm"
    onclick="showQRCode(${item.id})">

QR

</button>

</td>
</td>

        </tr>
    `).join("");

}


document.addEventListener("DOMContentLoaded", () => {

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
