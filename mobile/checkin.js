console.log("checkin.js loaded");

document.addEventListener("DOMContentLoaded", init);

let grandparent = null;
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

    // -----------------------------
    // 조부모 조회
    // -----------------------------

    const { data, error } = await supabaseClient

        .from("grandparents")

        .select("*")

        .eq("qr_token", token)

        .single();

    if (error || !data) {

        alert("QR 정보가 없습니다.");

        console.error(error);

        return;

    }

    grandparent = data;

    // -----------------------------
    // 오늘 활동 조회
    // -----------------------------

    const today =
        new Date().toISOString().slice(0, 10);

    const result = await supabaseClient

        .from("activities")

        .select("*")

        .eq("grandparent_id", grandparent.id)

        .eq("activity_date", today)

        .maybeSingle();

    todayActivity = result.data;

    const info =
        document.getElementById("info");

    const btn =
        document.getElementById("btnAction");

    if (!todayActivity) {

        info.innerHTML = `

            <h3>${grandparent.name}</h3>

            <p>오늘 활동을 시작합니다.</p>

        `;

        btn.textContent = "활동 종료";

    }

    else {

        info.innerHTML = `

            <h3>${grandparent.name}</h3>

            <p>활동을 종료합니다.</p>

        `;

        btn.textContent = "활동 종료";

    }

    

    btn.onclick = saveActivity;

}

// =========================================
// 체크인 / 체크아웃
// =========================================
// =========================================
// 활동시간 계산
// =========================================

function calcMinutes(start, end) {

    const [sh, sm] = start.split(":").map(Number);

    const [eh, em] = end.split(":").map(Number);

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

    // -----------------------------
    // GPS
    // -----------------------------

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

            // =============================
            // 체크인
            // =============================

            if (!todayActivity) {

                const { error } =
                    await supabaseClient

                        .from("activities")

                        .insert({

                            activity_date: today,

                            grandparent_id: grandparent.id,

                            start_time: time,

                            duration_minutes: 0,

                            checkin_lat: lat,

                            checkin_lng: lng

                        });

                if (error) {

                    alert(error.message);

                    console.error(error);

                    btn.disabled = false;

                    return;

                }

                alert("체크인 완료");

                location.reload();

                return;

            }

            // =============================
            // 체크아웃
            // =============================

            const duration =
                calcMinutes(
                    todayActivity.start_time,
                    time
                );

            const { error } =
                await supabaseClient

                    .from("activities")

                    .update({

                        end_time: time,

                        duration_minutes: duration,

                        checkout_lat: lat,

                        checkout_lng: lng

                    })

                    .eq("id", todayActivity.id);

            if (error) {

                alert(error.message);

                console.error(error);

                btn.disabled = false;

                return;

            }

            alert("체크아웃 완료");

            location.reload();

        },

        (err) => {

            alert("위치 권한을 허용해주세요.");

            console.error(err);

            btn.disabled = false;

        },

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}