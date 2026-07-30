// ======================================================
// GrandCare
// 조부모 등록/수정
// grandparents-form.js
// ======================================================

window.openRegisterForm = function (grandparent = null) {

    const isEdit = grandparent !== null;

    Modal.open(

        isEdit
            ? "조부모 정보 수정"
            : "조부모 등록",

        `
        <div class="form-section">

            <h3 class="section-title">기본정보</h3>

            <div class="form-group">
                <label>성명 <span class="required">*</span></label>
                <input
                    id="gp-name"
                    class="input"
                    type="text"
                    maxlength="20">
            </div>

            <div class="form-group">
                <label>생년월일 <span class="required">*</span></label>
                <input
                    id="gp-birth"
                    class="input"
                    type="date">
            </div>

            <div class="form-group">
                <label>연락처</label>
                <input
                    id="gp-phone"
                    class="input"
                    type="text"
                    maxlength="13"
                    placeholder="010-1234-5678">
            </div>

            <div class="form-group">
                <label>주소</label>
                <input
                    id="gp-address"
                    class="input"
                    type="text">
            </div>

        </div>


        <div class="form-section">

            <h3 class="section-title">계좌정보</h3>

            <div class="form-group">

                <label>금융기관명 <span class="required">*</span></label>

                <select
                    id="gp-bank-code"
                    class="input">

                </select>

            </div>

            <div class="form-group">

                <label>계좌번호 <span class="required">*</span></label>

                <input
                    id="gp-account"
                    class="input"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off">

            </div>

            <div class="form-group">

                <label>예금주 <span class="required">*</span></label>

                <input
                    id="gp-account-holder"
                    class="input"
                    type="text"
                    maxlength="20">

            </div>

        </div>


        <div class="form-section">

            <h3 class="section-title">기타</h3>

            <div class="form-group">

                <label>상태</label>

                <select
                    id="gp-status"
                    class="input">

                    <option value="active">
                        참여중
                    </option>

                    <option value="inactive">
                        중단
                    </option>

                </select>

            </div>

        </div>


        <div class="modal-footer">

            <button
                id="btnCancel"
                class="btn">

                취소

            </button>

           <button
    id="btnSave"
    class="btn btn-primary">

    ${isEdit ? "수정" : "저장"}

</button>

        </div>

        `

    );



    // ==========================
    // 금융기관 목록 생성
    // ==========================

    const bankSelect =
        document.getElementById("gp-bank-code");

    bankSelect.innerHTML =
        '<option value="">선택하세요</option>';

    CONSTANTS.BANKS.forEach(bank => {

        bankSelect.innerHTML += `

            <option value="${bank.code}">

                ${bank.code} | ${bank.name}

            </option>

        `;

    });
// ==========================
// 수정모드 데이터 표시
// ==========================

if (isEdit) {

    document.getElementById("gp-name").value =
        grandparent.name ?? "";

    document.getElementById("gp-birth").value =
        grandparent.birth ?? "";

    document.getElementById("gp-phone").value =
        grandparent.phone ?? "";

    document.getElementById("gp-address").value =
        grandparent.address ?? "";

    document.getElementById("gp-bank-code").value =
        grandparent.bank_code ?? "";

    document.getElementById("gp-account").value =
        grandparent.account ?? "";

    document.getElementById("gp-account-holder").value =
        grandparent.account_holder ?? "";

    document.getElementById("gp-status").value =
        grandparent.status ?? "active";

}


    // ==========================
    // 계좌번호 숫자만 입력
    // ==========================

    document

        .getElementById("gp-account")

        .addEventListener("input", function () {

            this.value =
                this.value.replace(/\D/g, "");

        });



    // ==========================
    // 연락처 자동 하이픈
    // ==========================

    document

        .getElementById("gp-phone")

        .addEventListener("input", function () {

            let value =
                this.value.replace(/\D/g, "");

            if (value.length > 11)
                value = value.substring(0, 11);

            if (value.length > 7) {

                value =
                    value.replace(
                        /(\d{3})(\d{4})(\d+)/,
                        "$1-$2-$3"
                    );

            }

            else if (value.length > 3) {

                value =
                    value.replace(
                        /(\d{3})(\d+)/,
                        "$1-$2"
                    );

            }

            this.value = value;

        });



    document

        .getElementById("btnCancel")

        .addEventListener("click", () => {

            Modal.close();

        });



   document

    .getElementById("btnSave")

    .addEventListener("click", () => {

        saveGrandparent(grandparent);

    });
// ======================================================
// 저장
// ======================================================

// ======================================================
// 저장(등록 / 수정)
// ======================================================

window.saveGrandparent = async function (grandparent = null) {

    const isEdit = grandparent !== null;

    const name =
        document.getElementById("gp-name").value.trim();

    const birth =
        document.getElementById("gp-birth").value;

    const phone =
        document.getElementById("gp-phone").value.trim();

    const address =
        document.getElementById("gp-address").value.trim();

    const bankCode =
        document.getElementById("gp-bank-code").value;

    const account =
        document.getElementById("gp-account").value.trim();

    const accountHolder =
        document.getElementById("gp-account-holder").value.trim();

    const status =
        document.getElementById("gp-status").value;

    if (!name) {
        alert("성명을 입력하세요.");
        document.getElementById("gp-name").focus();
        return;
    }

    if (!birth) {
        alert("생년월일을 입력하세요.");
        document.getElementById("gp-birth").focus();
        return;
    }

    if (!bankCode) {
        alert("금융기관을 선택하세요.");
        document.getElementById("gp-bank-code").focus();
        return;
    }

    if (!account) {
        alert("계좌번호를 입력하세요.");
        document.getElementById("gp-account").focus();
        return;
    }

    if (!accountHolder) {
        alert("예금주를 입력하세요.");
        document.getElementById("gp-account-holder").focus();
        return;
    }

    const btn =
        document.getElementById("btnSave");

    btn.disabled = true;

    btn.textContent =
        isEdit ? "수정중..." : "저장중...";

    try {

        let query =
            window.supabaseClient

                .from("grandparents")

                .select("id")

                .eq("name", name)

                .eq("birth", birth);

        if (isEdit) {

            query =
                query.neq("id", grandparent.id);

        }

        const {

            data: duplicated,

            error: duplicateError

        } = await query.limit(1);

        if (duplicateError)
            throw duplicateError;

        if (duplicated.length > 0) {

            alert("이미 등록된 조부모입니다.");

            btn.disabled = false;

            btn.textContent =
                isEdit ? "수정" : "저장";

            return;

        }

        const row = {

            name,

            birth,

            phone,

            address,

            bank_code: bankCode,

            account,

            account_holder: accountHolder,

            status

        };

        if (isEdit) {

            const { error } =
                await window.supabaseClient

                    .from("grandparents")

                    .update(row)

                    .eq("id", grandparent.id);

            if (error)
                throw error;

        }

        else {

            const qrCode =
                "HDG-" +

                crypto.randomUUID()

                    .replaceAll("-", "")

                    .substring(0, 8)

                    .toUpperCase();

            row.qr_code = qrCode;

            const { error } =
                await window.supabaseClient

                    .from("grandparents")

                    .insert([row]);

            if (error)
                throw error;

        }

        Modal.close();

        await loadGrandparents();

        alert(

            isEdit

                ? "조부모 정보가 수정되었습니다."

                : "조부모가 등록되었습니다."

        );

    }

    catch (err) {

        console.error(err);

        alert(

            "저장 중 오류가 발생했습니다.\n\n"

            + err.message

        );

    }

    finally {

        btn.disabled = false;

        btn.textContent =
            isEdit ? "수정" : "저장";

    }

};
               
}