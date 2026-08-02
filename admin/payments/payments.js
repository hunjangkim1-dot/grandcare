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

        ).padStart(2,"0")}`;

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

    if(!month){

        alert("지급월을 선택하세요.");

        return;

    }

    const startDate =

        `${month}-01`;

    const endDate =

        new Date(

            Number(month.substring(0,4)),

            Number(month.substring(5,7)),

            0

        )

        .toISOString()

        .slice(0,10);

    await loadPaymentList(

        startDate,

        endDate

    );

}

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

        ).padStart(2,"0")}`;

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

    if(!month){

        alert("지급월을 선택하세요.");

        return;

    }

    const startDate =

        `${month}-01`;

    const endDate =

        new Date(

            Number(month.substring(0,4)),

            Number(month.substring(5,7)),

            0

        )

        .toISOString()

        .slice(0,10);

    await loadPaymentList(

        startDate,

        endDate

    );

}

// =========================================
// 지급금액 계산
// =========================================

function calculatePayments(list) {

    list.forEach(item => {

        item.childCount =

            item.childSet.size;

        item.childNames =

            Array.from(

                item.childNames

            ).join(", ");

        item.hours =

            Math.floor(

                item.minutes / 60

            );

        item.eligible =

            item.minutes >= 2400;

        item.reason = "-";

        item.amount = 0;

        if (!item.eligible) {

            item.reason =

                "40시간 미달";

        }

        else if (item.childCount === 1) {

            item.amount =

                100000;

        }

        else if (item.childCount === 2) {

            item.amount =

                200000;

        }

        else if (item.childCount >= 3) {

            item.amount =

                300000;

        }

        else {

            item.reason =

                "돌봄 손주 없음";

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

        rows = rows.filter(

            item => item.eligible

        );

    }

    else if (filter === "excluded") {

        rows = rows.filter(

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

                <td>

                    ${item.name}

                </td>

                <td>

                    ${item.childNames}

                </td>

                <td>

                    ${item.hours}시간

                </td>

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

                <td>

                    ${item.bank ?? ""}

                </td>

                <td>

                    ${item.account ?? ""}

                </td>

                <td>

                    ${item.holder ?? ""}

                </td>

                <td>

                    ${item.reason}

                </td>

            </tr>

        `).join("");

}

// =========================================
// 요약
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

/* =========================================
   Empty Row
========================================= */

.empty-row{

    text-align:center;

    color:#888;

    padding:30px !important;

}

/* =========================================
   Button Area
========================================= */

.page-card:last-child{

    margin-top:24px;

}

.page-card:last-child .btn{

    min-width:190px;

}

/* =========================================
   Responsive
========================================= */

@media (max-width:1400px){

    .summary-grid{

        grid-template-columns:
            repeat(2,1fr);

    }

}

@media (max-width:1000px){

    .search-area{

        flex-direction:column;

        align-items:stretch;

    }

    .search-group .input{

        width:100%;

    }

    .summary-grid{

        grid-template-columns:1fr;

    }

}

/* =========================================
   Horizontal Scroll
========================================= */

.page-card{

    overflow-x:auto;

}

.table{

    min-width:1250px;

}

/* =========================================
   Sticky Header
========================================= */

.table thead th{

    position:sticky;

    top:0;

    z-index:1;

}