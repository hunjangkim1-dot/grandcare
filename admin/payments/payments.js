console.log("payments.js loaded");


// =========================================
// 초기 실행
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        initMonth();

        document
            .getElementById("btnSearch")
            .addEventListener(
                "click",
                loadPayments
            );

        await loadPayments();

    }
);

// =========================================
// 지급월 기본값
// =========================================

function initMonth() {

    const now = new Date();

    const month =
        `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;

    document
        .getElementById("paymentMonth")
        .value = month;

}

// =========================================
// 조회
// =========================================

async function loadPayments() {

    const month =
        document
            .getElementById("paymentMonth")
            .value;

    if (!month) {

        alert("지급월을 선택하세요.");

        return;

    }

    const startDate =
        `${month}-01`;

    const endDate =
        new Date(
            Number(month.substring(0, 4)),
            Number(month.substring(5, 7)),
            0
        )
        .toISOString()
        .slice(0, 10);

    await loadPaymentList(
        startDate,
        endDate
    );

}



 

// =========================================
// 지급목록 조회
// =========================================

async function loadPaymentList(startDate, endDate) {

    const { data, error } = await supabaseClient

        .from("activities")

        .select(`
            grandparent_id,
            grandchild_id,
            duration_minutes,

            grandparents(
                id,
                name,
                bank_code,
                account,
                account_holder
            ),

            grandchildren(
                id,
                name
            )
        `)

        .gte("activity_date", startDate)

        .lte("activity_date", endDate);

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    const result = {};

    data.forEach(item => {

        const id = item.grandparent_id;

        if (!result[id]) {

            result[id] = {

                grandparent_id: id,

                name: item.grandparents?.name ?? "",

                bank: item.grandparents?.bank_code ?? "",

                account: item.grandparents?.account ?? "",

                holder: item.grandparents?.account_holder ?? "",

                minutes: 0,

                childSet: new Set(),

                childNames: new Set()

            };

        }

        result[id].minutes += item.duration_minutes || 0;

        result[id].childSet.add(item.grandchild_id);

        result[id].childNames.add(

            item.grandchildren?.name ?? ""

        );

    });

    calculatePayments(

        Object.values(result)

    );

}

// =========================================
// 지급금액 계산
// =========================================

function calculatePayments(list) {

    list.forEach(item => {

        // 실제 돌본 손주 수
        item.childCount =
            item.childSet.size;

        // 손주 이름 문자열
        item.childNames =
            Array
                .from(item.childNames)
                .join(", ");

        // 활동시간(분 → 시간)
        item.hours =
            Math.floor(
                item.minutes / 60
            );

        // 지급 대상 여부
        item.eligible =
            item.minutes >= 2400;

        // 기본값
        item.amount = 0;

        item.reason = "-";

        if (!item.eligible) {

            item.reason =
                "40시간 미달";

        }

        else {

            switch(item.childCount){

                case 1:

                    item.amount =
                        100000;

                    break;

                case 2:

                    item.amount =
                        200000;

                    break;

                default:

                    if(item.childCount >= 3){

                        item.amount =
                            300000;

                    }

                    else{

                        item.reason =
                            "돌봄 손주 없음";

                    }

                    break;

            }

        }

    });

    renderPaymentTable(list);

    renderSummary(list);

}

// =========================================
// 지급목록 출력
// =========================================

function renderPaymentTable(list) {

    const filter =
        document
            .getElementById("paymentFilter")
            .value;

    let rows = [...list];

    if (filter === "eligible") {

        rows =
            rows.filter(
                item => item.eligible
            );

    }

    else if (filter === "excluded") {

        rows =
            rows.filter(
                item => !item.eligible
            );

    }

    const tbody =
        document.getElementById(
            "paymentTable"
        );

    if (rows.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-row">
                    조회된 지급대상이 없습니다.
                </td>
            </tr>
        `;

        return;

    }

    tbody.innerHTML =

        rows.map(item => `

            <tr>

                <td>${item.name}</td>

                <td>${item.childNames}</td>

                <td>${item.hours}시간</td>

                <td>

                    <span class="${
                        item.eligible
                            ? "status-pass"
                            : "status-fail"
                    }">

                        ${
                            item.eligible
                                ? "지급대상"
                                : "40시간 미달"
                        }

                    </span>

                </td>

                <td class="payment-amount">

                    ${item.amount.toLocaleString()}원

                </td>

                <td>${item.bank}</td>

                <td>${item.account}</td>

                <td>${item.holder}</td>

                <td>${item.reason}</td>

            </tr>

        `).join("");

}

// =========================================
// 요약카드
// =========================================

function renderSummary(list) {

    const applicant =
        list.length;

    const eligible =
        list.filter(
            item => item.eligible
        ).length;

    const excluded =
        applicant - eligible;

    const totalAmount =
        list.reduce(
            (sum, item) =>
                sum + item.amount,
            0
        );

    document
        .getElementById("summaryApplicant")
        .textContent =
        `${applicant}명`;

    document
        .getElementById("summaryEligible")
        .textContent =
        `${eligible}명`;

    document
        .getElementById("summaryExcluded")
        .textContent =
        `${excluded}명`;

    document
        .getElementById("summaryAmount")
        .textContent =
        `${totalAmount.toLocaleString()}원`;

}