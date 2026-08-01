console.log("checkin.js loaded");

document.addEventListener("DOMContentLoaded", init);

// =========================================
// 전역변수
// =========================================

let grandparent = null;
let grandchild = null;
let todayActivity = null;

// =========================================
// 시작
// =========================================

async function init() {

    const token =
        new URLSearchParams(location.search)
            .get("token");

    if (!token) {

        alert("잘못된 QR입니다.");

        return;

    }

    // =====================================
    // 손주 조회 (QR)
    // =====================================

    const {

        data: child,

        error: childError

    } = await supabaseClient

        .from("grandchildren")

        .select("*")

        .eq("qr_token", token)

        .single();

    if (childError || !child) {

        alert("QR 정보가 없습니다.");

        console.error(childError);

        return;

    }

    grandchild = child;

    // =====================================
    // 조부모 조회
    // =====================================

    const {

        data: gp,

        error: gpError

    } = await supabaseClient

        .from("grandparents")

        .select("*")

        .eq("id", grandchild.grandparent_id)

        .single();

    if (gpError || !gp) {

        alert("조부모 정보를 찾을 수 없습니다.");

        console.error(gpError);

        return;

    }

    grandparent = gp;

    // =====================================
    // 오늘 활동 조회
    // =====================================

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);

    const {

        data,

        error

    } = await supabaseClient

        .from("activities")

        .select("*")

        .eq("grandchild_id", grandchild.id)

        .eq("activity_date", today)

        .maybeSingle();

    if (error) {

        console.error(error);

    }

    todayActivity = data;



        // =====================================
    // 화면 표시
    // =====================================

    const info =
        document.getElementById("info");

    const btn =
        document.getElementById("btnAction");

    if (!todayActivity) {

        info.innerHTML = `

            <h2>${grandparent.name}</h2>

            <p><strong>손주</strong> : ${grandchild.name}</p>

            <p>오늘 활동을 시작합니다.</p>

        `;

        btn.textContent = "활동 시작";

    }

    else {

        info.innerHTML = `

            <h2>${grandparent.name}</h2>

            <p><strong>손주</strong> : ${grandchild.name}</p>

            <p>오늘 활동을 종료합니다.</p>

        `;

        btn.textContent = "활동 종료";

    }

    btn.style.display = "inline-block";

    btn.disabled = false;

    btn.onclick = saveActivity;

}

// =========================================
// 활동시간 계산
// =========================================

function calcMinutes(start, end) {

    const [sh, sm] =
        start.split(":").map(Number);

    const [eh, em] =
        end.split(":").map(Number);

    let diff =
        (eh * 60 + em) -
        (sh * 60 + sm);

    if (diff < 0) {

        diff += 1440;

    }

    return diff;

}

// =========================================
// 체크인 / 체크아웃
// =========================================

async function saveActivity() {

    const btn =
        document.getElementById("btnAction");

    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const lat =
                position.coords.latitude;

            const lng =
                position.coords.longitude;

            const now =
                new Date();

            const today =
                now.toISOString().slice(0, 10);

            const time =
                now.toTimeString().substring(0, 8);

            // =====================================
            // 체크인
            // =====================================

            if (!todayActivity) {

                const { error } =
                    await supabaseClient

                        .from("activities")

                        .insert({

                            activity_date: today,

                            grandparent_id:
                                grandparent.id,

                            grandchild_id:
                                grandchild.id,

                            start_time:
                                time,

                            checkin_time:
                                now.toISOString(),

                            duration_minutes:
                                0,

                            checkin_lat:
                                lat,

                            checkin_lng:
                                lng

                        });

                if (error) {

                    console.error(error);

                    alert(error.message);

                    btn.disabled = false;

                    return;

                }

                alert("체크인이 완료되었습니다.");

                location.reload();

                return;

            }

                        // =====================================
            // 체크아웃
            // =====================================

            const duration =
                calcMinutes(
                    todayActivity.start_time,
                    time
                );

            const { error } =
                await supabaseClient

                    .from("activities")

                    .update({

                        end_time:
                            time,

                        checkout_time:
                            now.toISOString(),

                        duration_minutes:
                            duration,

                        checkout_lat:
                            lat,

                        checkout_lng:
                            lng

                    })

                    .eq(
                        "id",
                        todayActivity.id
                    );

            if (error) {

                console.error(error);

                alert(error.message);

                btn.disabled = false;

                return;

            }

            alert("체크아웃이 완료되었습니다.");

            location.reload();

        },

        (err) => {

            console.error(err);

            alert("위치 권한을 허용해주세요.");

            btn.disabled = false;

        },

                   

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}