// admin/js/auth.js

async function login() {

    const username = document
        .getElementById("username")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    if (!username) {

        alert("아이디를 입력하세요.");

        document.getElementById("username").focus();

        return;

    }

    if (!password) {

        alert("비밀번호를 입력하세요.");

        document.getElementById("password").focus();

        return;

    }

    const email = `${username}@grandcare.kr`;

    try {

        const { error } = await window.supabaseClient.auth.signInWithPassword({

            email,
            password

        });

        if (error) throw error;

        location.href = "dashboard/index.html";

    } catch (err) {

        console.error(err);

        alert("아이디 또는 비밀번호가 올바르지 않습니다.");

    }

}

document
    .getElementById("loginBtn")
    ?.addEventListener("click", login);

document
    .getElementById("password")
    ?.addEventListener("keydown", e => {

        if (e.key === "Enter") {

            login();

        }

    });