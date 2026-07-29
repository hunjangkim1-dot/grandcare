// -----------------------------
// 손주 등록/수정 폼
// -----------------------------

async function openGrandchildForm(grandchild = null) {

    // 조부모 목록 조회
    const { data: grandparents, error } = await supabaseClient
        .from("grandparents")
        .select("id, name")
        .eq("status", "active")
        .order("name");

    if (error) {
        alert(error.message);
        return;
    }

    const options = grandparents.map(g => `
        <option value="${g.id}"
            ${grandchild?.grandparent_id == g.id ? "selected" : ""}>
            ${g.name}
        </option>
    `).join("");

    const html = `
        <div class="form-group">
            <label>조부모</label>
            <select id="grandparentId" class="input">
                <option value="">선택하세요</option>
                ${options}
            </select>
        </div>

        <div class="form-group">
            <label>성명</label>
            <input
                id="name"
                class="input"
                value="${grandchild?.name ?? ""}">
        </div>

        <div class="form-group">
            <label>생년월일</label>
            <input
                type="date"
                id="birth"
                class="input"
                value="${grandchild?.birth ?? ""}">
        </div>

        <div class="form-group">
            <label>성별</label>

            <select id="gender" class="input">

                <option value="남"
                    ${grandchild?.gender == "남" ? "selected" : ""}>
                    남
                </option>

                <option value="여"
                    ${grandchild?.gender == "여" ? "selected" : ""}>
                    여
                </option>

            </select>

        </div>

        <div class="form-group">
            <label>관계</label>
            <input
                id="relationship"
                class="input"
                placeholder="손자 / 손녀"
                value="${grandchild?.relationship ?? ""}">
        </div>

        <div class="form-group">
            <label>어린이집 / 유치원</label>
            <input
                id="daycareName"
                class="input"
                value="${grandchild?.daycare_name ?? ""}">
        </div>
    `;

    Modal.open({

    title: grandchild ? "손주 수정" : "손주 등록",

    body: html,

    onConfirm: () => saveGrandchild(grandchild)

});

}

// -----------------------------
// 저장
// -----------------------------

async function saveGrandchild(grandchild = null) {

    const data = {

        grandparent_id: document.getElementById("grandparentId").value,

        name: document.getElementById("name").value.trim(),

        birth: document.getElementById("birth").value,

        gender: document.getElementById("gender").value,

        relationship: document.getElementById("relationship").value.trim(),

        daycare_name: document.getElementById("daycareName").value.trim(),

        status: true

    };

    if (!data.grandparent_id) {
        alert("조부모를 선택하세요.");
        return;
    }

    if (!data.name) {
        alert("성명을 입력하세요.");
        return;
    }

    let result;

    if (grandchild) {

        result = await supabaseClient
            .from("grandchildren")
            .update(data)
            .eq("id", grandchild.id);

    } else {

        result = await supabaseClient
            .from("grandchildren")
            .insert(data);

    }

    if (result.error) {

        alert(result.error.message);

        return;

    }

    Modal.close();

    loadGrandchildren();

}