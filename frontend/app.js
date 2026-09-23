



const API_URL = "";



const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        const message =
            document.getElementById("loginMessage");


        if (!email || !password) {

            message.textContent =
                "Please enter your email and password.";

            return;
        }



        message.textContent =
            "Login functionality will be connected to Amazon Cognito.";

    });

}




const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("signupEmail").value.trim();

        const password =
            document.getElementById("signupPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        const message =
            document.getElementById("signupMessage");


        if (!name || !email || !password || !confirmPassword) {

            message.textContent =
                "Please fill in all fields.";

            return;
        }


        if (password.length < 8) {

            message.textContent =
                "Password must contain at least 8 characters.";

            return;
        }


        if (password !== confirmPassword) {

            message.textContent =
                "Passwords do not match.";

            return;
        }


    

        message.textContent =
            "Account registration will be connected to Amazon Cognito.";

    });

}




const fileInput =
    document.getElementById("fileInput");

const uploadBtn =
    document.getElementById("uploadBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const logoutBtn =
    document.getElementById("logoutBtn");




if (uploadBtn) {

    uploadBtn.addEventListener("click", function () {

        const file = fileInput.files[0];

        const message =
            document.getElementById("uploadMessage");


        if (!file) {

            message.textContent =
                "Please select a file first.";

            return;
        }


        message.textContent =
            `Selected file: ${file.name}`;

    });

}




if (refreshBtn) {

    refreshBtn.addEventListener("click", function () {

        loadFiles();

    });

}


async function loadFiles() {

    const container =
        document.getElementById("filesContainer");


    if (!container) {
        return;
    }


    


    container.innerHTML = `
        <p class="empty-message">
            Connect the API Gateway /files endpoint
            to display your cloud backups.
        </p>
    `;
}




if (logoutBtn) {

    logoutBtn.addEventListener("click", function () {

        /*
         * Cognito logout will be implemented here.
         */

        window.location.href = "login.html";

    });

}




if (document.getElementById("filesContainer")) {

    loadFiles();

}