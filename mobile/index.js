document.addEventListener(

    "DOMContentLoaded",

    startScanner

);

let scanner;

function startScanner(){

    scanner = new Html5Qrcode(

        "reader"

    );

    scanner.start(

        {

            facingMode:"environment"

        },

        {

            fps:10,

            qrbox:250

        },

        onScanSuccess

    );

}

async function onScanSuccess(qrCode){

    await scanner.stop();

    // QR로 손주 조회
    const { data: grandchild, error } = await supabaseClient

        .from("grandchildren")

        .select(`
            *,
            grandparents(
                id,
                name
            )
        `)

        .eq("qr_code", qrCode)

        .single();

    if(error || !grandchild){

        alert("등록되지 않은 QR입니다.");

        startScanner();

        return;

    }

    checkActivity(grandchild);

}

async function checkActivity(grandchild){

    const { data: running } = await supabaseClient

        .from("activities")

        .select("*")

        .eq(
            "grandparent_id",
            grandchild.grandparent_id
        )

        .eq(
            "grandchild_id",
            grandchild.id
        )

        .is(
            "checkout_time",
            null
        )

        .maybeSingle();

    if(running){

        showCheckout(grandchild,running);

    }else{

        showCheckin(grandchild);

    }

}

function showCheckout(grandchild, activity) {

    document.querySelector(".container").innerHTML = `

        <h2>

            ${grandchild.name}

        </h2>

        <p>

            현재 활동 중입니다.

        </p>

        <br>

        <button
            id="btnFinish">

            활동 종료

        </button>

    `;

    document

        .getElementById("btnFinish")

        .addEventListener(

            "click",

            () => finishActivity(activity)

        );

}

function getCurrentLocation() {

    return new Promise((resolve, reject) => {

        navigator.geolocation.getCurrentPosition(

            position => resolve(position),

            error => reject(error),

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }

        );

    });

}

async function startActivity(grandchild) {

    try {

        const position = await getCurrentLocation();

        const { latitude, longitude, accuracy } = position.coords;

        const now = new Date();

        const { error } = await supabaseClient

            .from("activities")

            .insert({

                grandparent_id: grandchild.grandparent_id,

                grandchild_id: grandchild.id,

                activity_date: now.toISOString().slice(0, 10),

                checkin_time: now.toISOString(),

                checkin_lat: latitude,

                checkin_lng: longitude,

                checkin_accuracy: accuracy

            });

        if (error) {

            alert(error.message);

            return;

        }

        showCheckinComplete(

            grandchild,

            now

        );

    }

    catch (err) {

        alert("GPS를 사용할 수 없습니다.");

    }

}

function showCheckinComplete(grandchild, now) {

    const time = now.toLocaleTimeString(
        "ko-KR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

    document.querySelector(".container").innerHTML = `

        <h2>

            활동이 시작되었습니다.

        </h2>

        <h3>

            ${grandchild.name}

        </h3>

        <p>

            시작시간

        </p>

        <h2>

            ${time}

        </h2>

        <br>

        <p>

            활동 종료 시

            QR을 다시 촬영해주세요.

        </p>

        <br>

        <button id="btnHome">

            확인

        </button>

    `;

    document

        .getElementById("btnHome")

        .addEventListener(

            "click",

            () => location.reload()

        );

}

document

    .getElementById("btnStart")

    .addEventListener(

        "click",

        () => startActivity(grandchild)

    );