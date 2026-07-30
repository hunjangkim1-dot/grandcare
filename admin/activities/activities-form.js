console.log("activities-form.js loaded");

// =========================================
// 활동 등록 모달
// =========================================

window.openActivityForm = async function () {

    Modal.open({

    title: "활동 등록",

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

        </div>
    `,
    
});
const { data: grandparents, error } = await supabaseClient
    .from("grandparents")
    .select("id, name")
    .eq("status", "active")
    .order("name");

if (error) {
    console.error(error);
    alert("조부모 목록을 불러오지 못했습니다.");
    return;
}

const gpSelect = document.getElementById("grandparent-select");

gpSelect.innerHTML =
    `<option value="">선택하세요</option>`;

grandparents.forEach(gp => {

    gpSelect.innerHTML += `
        <option value="${gp.id}">
            ${gp.name}
        </option>
    `;

});
};