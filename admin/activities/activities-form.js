console.log("activities-form.js loaded");

// =========================================
// 전역변수
// =========================================

window.currentActivityId = null;

// =========================================
// 활동 등록 / 수정 모달
// =========================================

window.openActivityForm = async function () {

    Modal.open({

        title: currentActivityId
            ? "활동 수정"
            : "활동 등록",

        body: `

        <div class="form-section">

            <div class="form-group">

                <label>활동일</label>

                <input
                    id="activity-date"
                    class="input"
                    type="date">

            </div>

            <div class="form-group">

                <label>조부모</label>

                <select
                    id="grandparent-select"
                    class="input">

                    <option value="">선택하세요</option>

                </select>

            </div>

            <div class="form-group">

                <label>손주</label>

                <select
                    id="grandchild-select"
                    class="input">

                    <option value="">선택하세요</option>

                </select>

            </div>

            <div class="form-group">

                <label>시작시간</label>

                <input
                    id="start-time"
                    class="input"
                    type="time">

            </div>

            <div class="form-group">

                <label>종료시간</label>

                <input
                    id="end-time"
                    class="input"
                    type="time">

            </div>

            <div class="form-group">

                <label>활동시간(분)</label>

                <input
                    id="duration-minutes"
                    class="input"
                    readonly>

            </div>

        </div>

        `,

        confirmText:
            currentActivityId
                ? "수정"
                : "저장",

        cancelText: "취소",

        onConfirm: async () => {

            await handleActivitySubmit();

        }

    });

    // =====================================
    // 기본 날짜
    // =====================================

    if (!currentActivityId) {

        document
            .getElementById("activity-date")
            .value =
            new Date()
                .toISOString()
                .slice(0, 10);

    }

        // =====================================
    // 조부모 목록 조회
    // =====================================

    const {

        data: grandparents,

        error

    } = await supabaseClient

        .from("grandparents")

        .select("id,name")

        .eq("status","active")

        .order("name");

    if(error){

        console.error(error);

        alert(error.message);

        Modal.close();

        return;

    }

    const gpSelect =
        document.getElementById("grandparent-select");

    gpSelect.innerHTML =
        `<option value="">선택하세요</option>`;

    grandparents.forEach(gp=>{

        gpSelect.innerHTML += `

            <option value="${gp.id}">

                ${gp.name}

            </option>

        `;

    });

    // =====================================
    // 이벤트 연결
    // =====================================

    gpSelect.addEventListener(

        "change",

        loadGrandchildren

    );

    document

        .getElementById("start-time")

        .addEventListener(

            "input",

            calcDuration

        );

    document

        .getElementById("end-time")

        .addEventListener(

            "input",

            calcDuration

        );

    // =====================================
    // 수정모드
    // =====================================

    if(currentActivityId){

        await loadActivity(currentActivityId);

    }

}

// =========================================
// 손주 조회
// =========================================

async function loadGrandchildren() {

    const grandparentId =
        Number(
            document
                .getElementById("grandparent-select")
                .value
        );

    const gcSelect =
        document.getElementById("grandchild-select");

    gcSelect.innerHTML =
        `<option value="">선택하세요</option>`;

    if (!grandparentId) return;

    const {

        data,

        error

    } = await supabaseClient

        .from("grandchildren")

        .select("id,name")

        .eq("grandparent_id", grandparentId)

        .eq("status", true)

        .order("name");

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    data.forEach(child => {

        gcSelect.innerHTML += `

            <option value="${child.id}">

                ${child.name}

            </option>

        `;

    });

}

// =========================================
// 수정 데이터 불러오기
// =========================================

async function loadActivity(id){

    const {

        data,

        error

    } = await supabaseClient

        .from("activities")

        .select("*")

        .eq("id", id)

        .single();

    if(error){

        alert(error.message);

        return;

    }

    document
        .getElementById("activity-date")
        .value = data.activity_date;

    document
        .getElementById("start-time")
        .value = data.start_time ?? "";

    document
        .getElementById("end-time")
        .value = data.end_time ?? "";

    document
        .getElementById("duration-minutes")
        .value = data.duration_minutes ?? "";

    document
        .getElementById("grandparent-select")
        .value = data.grandparent_id;

    await loadGrandchildren();

    document
        .getElementById("grandchild-select")
        .value = data.grandchild_id;

}

// =========================================
// 활동시간 계산
// =========================================

function calcDuration() {

    if (
    document
        .getElementById("duration-minutes")
        .value === ""
) {
    return;
}
    const start =
        document.getElementById("start-time").value;

    const end =
        document.getElementById("end-time").value;

    if (!start || !end) {

        document
            .getElementById("duration-minutes")
            .value = "";

        return;

    }

    const [sh, sm] =
        start.split(":").map(Number);

    const [eh, em] =
        end.split(":").map(Number);

    let startMinutes =
        sh * 60 + sm;

    let endMinutes =
        eh * 60 + em;

    if (endMinutes < startMinutes) {

    alert("종료시간은 시작시간보다 늦어야 합니다.");

    document
        .getElementById("duration-minutes")
        .value = "";

    return;

}

    document
        .getElementById("duration-minutes")
        .value =
        endMinutes - startMinutes;

}

// =========================================
// 저장
// =========================================

async function handleActivitySubmit() {

    calcDuration();
console.log(
    document.getElementById("duration-minutes").value
);
    const row = {

        activity_date:
            document
                .getElementById("activity-date")
                .value,

        grandparent_id:
            Number(
                document
                    .getElementById("grandparent-select")
                    .value
            ),

        grandchild_id:
            Number(
                document
                    .getElementById("grandchild-select")
                    .value
            ),

        start_time:
            document
                .getElementById("start-time")
                .value,

        end_time:
            document
                .getElementById("end-time")
                .value,

        duration_minutes:
            Number(
                document
                    .getElementById("duration-minutes")
                    .value
            )

    };

    // ============================
    // 입력 검사
    // ============================

    if (!row.activity_date) {

        alert("활동일을 입력하세요.");

        return;

    }

    if (!row.grandparent_id) {

        alert("조부모를 선택하세요.");

        return;

    }

    if (!row.grandchild_id) {

        alert("손주를 선택하세요.");

        return;

    }

    if (!row.start_time) {

        alert("시작시간을 입력하세요.");

        return;

    }

    if (!row.end_time) {

        alert("종료시간을 입력하세요.");

        return;

    }

    let error;

    if (currentActivityId) {

        ({ error } =
            await supabaseClient

                .from("activities")

                .update(row)

                .eq("id", currentActivityId));

    } else {

        ({ error } =
            await supabaseClient

                .from("activities")

                .insert(row));

    }

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    Modal.close();

    currentActivityId = null;

    if (typeof loadActivities === "function") {

        await loadActivities();

    }

    alert(
        currentActivityId
            ? "수정되었습니다."
            : "등록되었습니다."
    );

}