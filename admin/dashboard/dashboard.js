console.log("dashboard.js loaded");

// =========================================
// 초기 실행
// =========================================

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await loadDashboard();

    }

);

// =========================================
// 대시보드
// =========================================

async function loadDashboard() {

    await Promise.all([

        loadGrandparentCount(),

        loadGrandchildCount(),

        loadTodayActivity(),

        loadMonthActivity(),

        loadTotalDuration(),

        loadRecentActivities(),

        loadTodayCheckin()
    ]);

}

// =========================================
// 등록 조부모 수
// =========================================

async function loadGrandparentCount() {

    const {

        count,

        error

    } = await supabaseClient

        .from("grandparents")

        .select("*", {

            count: "exact",

            head: true

        });

    if (error) {

        console.error(error);

        return;

    }

    document

        .getElementById("cardGrandparents")

        .textContent = `${count}명`;

}

// =========================================
// 등록 손주 수
// =========================================

async function loadGrandchildCount() {

    const {

        count,

        error

    } = await supabaseClient

        .from("grandchildren")

        .select("*", {

            count: "exact",

            head: true

        });

    if (error) {

        console.error(error);

        return;

    }

    document

        .getElementById("cardGrandchildren")

        .textContent = `${count}명`;

}

// =========================================
// 오늘 활동 건수
// =========================================

async function loadTodayActivity() {

    const today =

        new Date()

            .toISOString()

            .slice(0, 10);

    const {

        count,

        error

    } = await supabaseClient

        .from("activities")

        .select("*", {

            count: "exact",

            head: true

        })

        .eq("activity_date", today);

    if (error) {

        console.error(error);

        return;

    }

    document

        .getElementById("cardTodayActivity")

        .textContent = `${count}건`;

}

// =========================================
// 이번달 활동 건수
// =========================================

async function loadMonthActivity() {

    const now = new Date();

    const firstDay =

        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const {

        count,

        error

    } = await supabaseClient

        .from("activities")

        .select("*", {

            count: "exact",

            head: true

        })

        .gte("activity_date", firstDay);

    if (error) {

        console.error(error);

        return;

    }

    document

        .getElementById("cardMonthActivity")

        .textContent = `${count}건`;

}

// =========================================
// 카드 기본값
// =========================================

function setCardValue(id, value, suffix = "") {

    const el =
        document.getElementById(id);

    if (!el) return;

    el.textContent =
        `${value ?? 0}${suffix}`;

}

// =========================================
// 새로고침
// =========================================

window.refreshDashboard = async function () {

    await loadDashboard();

}

// =========================================
// 총 활동시간
// =========================================

async function loadTotalDuration() {

    const {

        data,

        error

    } = await supabaseClient

        .from("activities")

        .select("duration_minutes");

    if (error) {

        console.error(error);

        return;

    }

    let totalMinutes = 0;

    data.forEach(item => {

        totalMinutes +=
            item.duration_minutes || 0;

    });

    const hour =
        Math.floor(totalMinutes / 60);

    const minute =
        totalMinutes % 60;

    document

        .getElementById("totalDuration")

        .textContent =

        `${hour}시간 ${minute}분`;

}

// =========================================
// 최근 활동
// =========================================

async function loadRecentActivities() {

    const {

        data,

        error

    } = await supabaseClient

        .from("activities")

        .select(`
            *,
            grandparents(name),
            grandchildren(name)
        `)

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
        )

        .limit(5);

    const tbody =
        document.getElementById(
            "recentActivityTable"
        );

    if (error) {

        console.error(error);

        tbody.innerHTML = `

            <tr>

                <td colspan="6">

                    데이터를 불러오지 못했습니다.

                </td>

            </tr>

        `;

        return;

    }

    if (data.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6">

                    최근 활동이 없습니다.

                </td>

            </tr>

        `;

        return;

    }

    tbody.innerHTML =

        data.map(item => `

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

                    ${item.duration_minutes}분

                </td>

            </tr>

        `).join("");

}

// =========================================
// 오늘 체크인 중
// =========================================

async function loadTodayCheckin() {

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);

    const {

        data,

        error

    } = await supabaseClient

        .from("activities")

        .select(`
            *,
            grandparents(name),
            grandchildren(name)
        `)

        .eq(
            "activity_date",
            today
        )

        .is(
            "end_time",
            null
        )

        .order(
            "start_time",
            {
                ascending: true
            }
        );

    const box =
        document.getElementById(
            "todayCheckinList"
        );

    if (error) {

        console.error(error);

        box.innerHTML = `
            <div class="empty-row">
                데이터를 불러오지 못했습니다.
            </div>
        `;

        return;

    }

    if (data.length === 0) {

        box.innerHTML = `
            <div class="empty-row">
                현재 체크인 중인 활동이 없습니다.
            </div>
        `;

        return;

    }

    box.innerHTML =

        data.map(item => `

            <div class="checkin-item">

                <div>

                    <div class="checkin-name">

                        ${item.grandparents?.name ?? ""}

                    </div>

                    <div>

                        ${item.grandchildren?.name ?? ""}

                    </div>

                </div>

                <div class="checkin-time">

                    ${item.start_time?.substring(0,5)}

                </div>

            </div>

        `).join("");

}