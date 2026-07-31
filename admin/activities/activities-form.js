console.log("activities-form.js loaded");

// =========================================
// 활동 등록 모달
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
                        type="date"
                        if(!currentActivityId){

    document.getElementById("activity-date").value =
        new Date().toISOString().slice(0,10);

}
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

        confirmText: currentActivityId
    ? "수정"
    : "저장",

        cancelText: "취소",

        onConfirm: async () => {

            await handleActivitySubmit();

        }

    });

    const { data: grandparents, error } = await supabaseClient
        .from("grandparents")
        .select("id, name")
        .eq("status", "active")
        .order("name");
        console.log(grandparents);

    if (error) {
    console.error("조부모 조회 오류:", error);
    alert(error.message);
    return;
}

    const gpSelect =
        document.getElementById("grandparent-select");

    gpSelect.innerHTML =
        `<option value="">선택하세요</option>`;

    grandparents.forEach(gp => {

        gpSelect.innerHTML += `
            <option value="${gp.id}">
                ${gp.name}
            </option>
        `;

    });

    gpSelect.addEventListener(
        "change",
        loadGrandchildren
    );

    document
        .getElementById("start-time")
        .addEventListener("change", calcDuration);

    document
        .getElementById("end-time")
        .addEventListener("change", calcDuration);

};

async function loadGrandchildren() {

    const grandparentId =
        Number(document.getElementById("grandparent-select").value);

    const gcSelect =
        document.getElementById("grandchild-select");

    gcSelect.innerHTML =
        `<option value="">선택하세요</option>`;

    if (!grandparentId) return;

    const { data, error } = await supabaseClient
        .from("grandchildren")
        .select("id, name")
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

function calcDuration() {

    const start =
        document.getElementById("start-time").value;

    const end =
        document.getElementById("end-time").value;

    if (!start || !end) return;

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    let minutes =
        (eh * 60 + em) - (sh * 60 + sm);

    if (minutes < 0) {
        minutes += 24 * 60;
    }

    document
.getElementById("start-time")
.addEventListener("input", calcDuration);

document
.getElementById("end-time")
.addEventListener("input", calcDuration);
}

async function handleActivitySubmit() {
if(
    !document.getElementById("activity-date").value
){

    alert("활동일을 입력하세요.");

    return;

}

if(
    !document.getElementById("grandparent-select").value
){

    alert("조부모를 선택하세요.");

    return;

}

if(
    !document.getElementById("grandchild-select").value
){

    alert("손주를 선택하세요.");

    return;

}

if(
    !document.getElementById("start-time").value
){

    alert("시작시간을 입력하세요.");

    return;

}

if(
    !document.getElementById("end-time").value
){

    alert("종료시간을 입력하세요.");

    return;

}

    if(currentActivityId){

    const { error } = await supabaseClient

        .from("activities")

        .update(row)

        .eq("id", currentActivityId);

    if(error) throw error;

    alert("수정되었습니다.");

}else{

    const { error } = await supabaseClient

        .from("activities")

        .insert([row]);

    if(error) throw error;

    alert("등록되었습니다.");

}
    calcDuration();

    const payload = {

        activity_date:
            document.getElementById("activity-date").value,

        grandparent_id:
            Number(document.getElementById("grandparent-select").value),

        grandchild_id:
            Number(document.getElementById("grandchild-select").value),

        start_time:
            document.getElementById("start-time").value,

        end_time:
            document.getElementById("end-time").value,

        duration_minutes:
            Number(document.getElementById("duration-minutes").value)

    };

    const { error } = await supabaseClient
        .from("activities")
        .insert(payload);

    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    Modal.close();

loadActivities();

    if (typeof loadActivities === "function") {
        await loadActivities();
    }

    alert("저장되었습니다.");
currentActivityId=null;
}

function calcDuration() {

    const start = document.getElementById("start-time").value;
    const end = document.getElementById("end-time").value;

    if (!start || !end) {
        document.getElementById("duration-minutes").value = "";
        return;
    }

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    let startMinutes = sh * 60 + sm;
    let endMinutes = eh * 60 + em;

    // 자정을 넘긴 경우
    if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
    }

    document.getElementById("duration-minutes").value =
        endMinutes - startMinutes;
}

window.currentActivityId = null;

window.editActivity = async function(id){

    currentActivityId = id;

    const { data, error } = await supabaseClient
        .from("activities")
        .select("*")
        .eq("id", id)
        .single();

    if(error){
        alert(error.message);
        return;
    }

    await openActivityForm();

    document.getElementById("activity-date").value=data.activity_date;

    document.getElementById("start-time").value=data.start_time;

    document.getElementById("end-time").value=data.end_time;

    document.getElementById("duration-minutes").value=data.duration_minutes;

    document.getElementById("grandparent-select").value=data.grandparent_id;

    await loadGrandchildren();

    document.getElementById("grandchild-select").value=data.grandchild_id;

}

