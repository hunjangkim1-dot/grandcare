// -----------------------------
// 초기 실행
// -----------------------------

document.addEventListener("DOMContentLoaded", async () => {

  

    bindEvents();

    loadGrandchildren();

});

// -----------------------------
// 이벤트
// -----------------------------

function bindEvents() {

    document
        .getElementById("btnSearch")
        .addEventListener("click", loadGrandchildren);

    document
        .getElementById("searchKeyword")
        .addEventListener("keypress", (e) => {

            if (e.key === "Enter") {

                loadGrandchildren();

            }

        });

    document
        .getElementById("btnAddGrandchild")
        .addEventListener("click", () => {

            openGrandchildForm();

        });

}

// -----------------------------
// 목록 조회
// -----------------------------

async function loadGrandchildren() {

    const keyword = document
        .getElementById("searchKeyword")
        .value
        .trim();

    let query = supabaseClient
        .from("grandchildren")
        .select(`
            *,
            grandparents (
                name
            )
        `)
        .order("id", { ascending: false });

    if (keyword) {

        query = query.ilike("name", `%${keyword}%`);

    }

    const { data, error } = await query;

    if (error) {

        alert(error.message);

        return;

    }

    renderTable(data);

}

// -----------------------------
// 테이블 출력
// -----------------------------

function renderTable(list) {

    const tbody = document.getElementById("grandchildTable");

    if (!list.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-row">
                    등록된 손주가 없습니다.
                </td>
            </tr>
        `;

        return;

    }

    tbody.innerHTML = list.map(item => `

        <tr>

            <td>${item.id}</td>

            <td>${item.name ?? ""}</td>

            <td>${item.birth ?? ""}</td>

            <td>${item.gender ?? ""}</td>

            <td>${item.grandparents?.name ?? ""}</td>

            <td>${item.relationship ?? ""}</td>

            <td>${item.daycare_name ?? ""}</td>

            <td>${item.status ? "사용" : "중지"}</td>

            <td>

               <button
    class="btn btn-secondary btn-sm"
    onclick="editGrandchild(${item.id})">

    수정

</button>

<button
    class="btn btn-primary btn-sm"
    onclick="showQr('${item.qr_code}','${item.name}')">

    QR 보기

</button>

<button
    class="btn btn-danger btn-sm"
    onclick="deleteGrandchild(${item.id})">

    삭제

</button>

            </td>

        </tr>

    `).join("");

}

// -----------------------------
// 수정
// -----------------------------

async function editGrandchild(id) {

    const { data, error } = await supabaseClient
        .from("grandchildren")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {

        alert(error.message);

        return;

    }

    openGrandchildForm(data);

}

// -----------------------------
// 삭제
// -----------------------------

async function deleteGrandchild(id) {

    if (!confirm("삭제하시겠습니까?")) {

        return;

    }

    const { error } = await supabaseClient
        .from("grandchildren")
        .delete()
        .eq("id", id);

    if (error) {

        alert(error.message);

        return;

    }

    loadGrandchildren();

}

function showQr(qrCode, name){

    Modal.open({

        title: "QR 코드",

        body: `
            <div style="text-align:center">

                <h3>${name}</h3>

                <div id="qrArea"
                     style="margin:20px auto;"></div>

                <div style="
                    margin-top:15px;
                    font-size:18px;
                    font-weight:700;
                ">
                    ${qrCode}
                </div>

            </div>
        `,

        confirmText:"닫기",

        showCancel:false,

        onOpen:()=>{

            new QRCode(

                document.getElementById("qrArea"),

                {
                    text:qrCode,
                    width:220,
                    height:220
                }

            );

        }

    });

}

function showQr(qrCode, name) {

    Modal.open({

        title: "손주 QR",

        body: `

            <div style="text-align:center">

                <h3 style="margin-bottom:20px;">
                    ${name}
                </h3>

                <div id="qrArea"></div>

                <div style="
                    margin-top:20px;
                    font-size:20px;
                    font-weight:700;
                ">
                    ${qrCode}
                </div>

            </div>

        `,

        confirmText: "닫기",

        cancelText: "",

       onConfirm(){

    printQr(qrCode,name);

},

        onOpen() {

            new QRCode(

                document.getElementById("qrArea"),

                {

                    text: qrCode,

                    width: 180,

                    height: 180

                }

            );

        }

    });

}

function printQr(qrCode, name){

    const win = window.open("", "_blank");

    win.document.write(`
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>QR 출력</title>

<style>

body{

    font-family:"Malgun Gothic";

    text-align:center;

    padding:50px;

}

h1{

    font-size:32px;

}

h2{

    margin-top:40px;

}

#qrcode{

    margin:40px auto;

    width:250px;

}

.info{

    margin-top:25px;

    font-size:20px;

}

.notice{

    margin-top:40px;

    color:#666;

}

</style>

</head>

<body>

<h1>조부모 손주돌봄수당</h1>

<h2>${name}</h2>

<div id="qrcode"></div>

<div class="info">

관리번호<br>

<b>${qrCode}</b>

</div>

<div class="notice">

활동 시작과 종료 시

QR을 촬영하세요.

</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

<script>

new QRCode(

document.getElementById("qrcode"),

{

text:"${qrCode}",

width:250,

height:250

}

);

setTimeout(()=>{

window.print();

},500);

</script>

</body>

</html>

`);

    win.document.close();

}