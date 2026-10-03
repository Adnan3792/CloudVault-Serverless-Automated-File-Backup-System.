
const CLIENT_ID = CONFIG.CLIENT_ID;
const COGNITO_DOMAIN = CONFIG.COGNITO_DOMAIN;
const API_BASE_URL = CONFIG.API_BASE_URL;
const LOGIN_REDIRECT_URI = CONFIG.LOGIN_REDIRECT_URI;
const LOGOUT_REDIRECT_URI = CONFIG.LOGOUT_REDIRECT_URI;



async function handleCallback() {

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
        return;
    }

    try {

        const response = await fetch(
            `${COGNITO_DOMAIN}/oauth2/token`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    client_id: CLIENT_ID,
                    code: code,
                    redirect_uri: LOGIN_REDIRECT_URI
                })
            }
        );

        const tokens = await response.json();

        if (!response.ok) {

            console.error(
                "Token exchange failed:",
                tokens
            );

            alert("Login failed.");

            return;
        }

        console.log(
            "Authentication successful."
        );

        sessionStorage.setItem(
            "access_token",
            tokens.access_token
        );

        sessionStorage.setItem(
            "id_token",
            tokens.id_token
        );

        if (tokens.refresh_token) {

            sessionStorage.setItem(
                "refresh_token",
                tokens.refresh_token
            );
        }

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

        window.location.href = "index.html";

    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );

        alert("Unable to complete login.");
    }
}


function isAuthenticated() {

    return sessionStorage.getItem(
        "access_token"
    ) !== null;
}


function getAccessToken() {

    return sessionStorage.getItem(
        "access_token"
    );
}


function getIdToken() {

    return sessionStorage.getItem(
        "id_token"
    );
}




function logout() {

    sessionStorage.clear();

    const logoutUrl =
        `${COGNITO_DOMAIN}/logout` +
        `?client_id=${CLIENT_ID}` +
        `&logout_uri=${encodeURIComponent(
            LOGOUT_REDIRECT_URI
        )}`;

    window.location.href = logoutUrl;
}




function getUserInformation() {

    const idToken = getIdToken();

    if (!idToken) {
        return null;
    }

    try {

        const payload =
            idToken.split(".")[1];

        const decodedPayload =
            JSON.parse(atob(payload));

        return decodedPayload;

    } catch (error) {

        console.error(
            "Unable to decode user information:",
            error
        );

        return null;
    }
}


function displayUserInformation() {

    const user = getUserInformation();

    const emailElement =
        document.getElementById("userEmail");

    if (!emailElement) {
        return;
    }

    if (user && user.email) {

        emailElement.textContent =
            user.email;

    } else {

        emailElement.textContent =
            "User";
    }
}




function getAuthHeaders() {

    return {
        "Authorization":
            `Bearer ${getAccessToken()}`,

        "Content-Type":
            "application/json"
    };
}



async function loadFiles() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/files`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${getAccessToken()}`
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                `Failed to load files: ${response.status}`
            );
        }

        const files =
            await response.json();

        displayFiles(files);

    } catch (error) {

        console.error(
            "Error loading files:",
            error
        );
    }
}




function displayFiles(files) {

    const container =
        document.getElementById("filesContainer");

    if (!container) {
        console.warn("filesContainer element not found.");
        return;
    }

    container.innerHTML = "";

    if (!files || files.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No files available.
            </p>
        `;

        return;
    }

    files.forEach(file => {

        const fileElement =
            document.createElement("div");

        fileElement.className = "file-item";

        const encodedName =
            encodeURIComponent(file.name);

        fileElement.innerHTML = `

            <div>
                <div class="file-name">
                    ${escapeHtml(file.name)}
                </div>

                <small>
                    ${formatFileSize(file.size)}
                </small>
            </div>

            <div class="file-actions">

                <button
                    class="download-btn"
                    onclick="downloadFile('${encodedName}')">
                    Download
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteFile('${encodedName}')">
                    Delete
                </button>

            </div>
        `;

        container.appendChild(fileElement);
    });
}


async function uploadFile(file) {

    if (!file) {

        alert("Please select a file.");

        return;
    }

    try {

        console.log(
            "Requesting upload URL..."
        );



        const response = await fetch(
            `${API_BASE_URL}/upload`,
            {
                method: "POST",

                headers:
                    getAuthHeaders(),

                body: JSON.stringify({
                    filename: file.name
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            console.error(
                "Upload URL error:",
                data
            );

            throw new Error(
                data.error ||
                "Unable to get upload URL."
            );
        }

        
        console.log(
            "Uploading file to S3..."
        );

        const uploadResponse =
            await fetch(
                data.upload_url,
                {
                    method: "PUT",
                    body: file
                }
            );

        if (!uploadResponse.ok) {

            throw new Error(
                `S3 upload failed: ${uploadResponse.status}`
            );
        }

        console.log(
            "File uploaded successfully."
        );

        alert(
            "File uploaded successfully!"
        );


        await loadFiles();

    } catch (error) {

        console.error(
            "Upload error:",
            error
        );

        alert(
            "Upload failed: " +
            error.message
        );
    }
}




async function downloadFile(
    encodedFilename
) {

    const filename =
        decodeURIComponent(
            encodedFilename
        );

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/download`,
                {
                    method: "POST",

                    headers:
                        getAuthHeaders(),

                    body: JSON.stringify({
                        filename: filename
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to generate download URL."
            );
        }

     

        const link =
            document.createElement("a");

        link.href =
            data.download_url;

        link.download =
            data.filename;

        link.target = "_blank";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

    } catch (error) {

        console.error(
            "Download error:",
            error
        );

        alert(
            "Download failed: " +
            error.message
        );
    }
}




async function deleteFile(
    encodedFilename
) {

    const filename =
        decodeURIComponent(
            encodedFilename
        );

    const confirmed =
        confirm(
            `Are you sure you want to delete "${filename}"?`
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/files`,
                {
                    method: "DELETE",

                    headers:
                        getAuthHeaders(),

                    body: JSON.stringify({
                        filename: filename
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to delete file."
            );
        }

        console.log(
            "File deleted:",
            data
        );

        alert(
            "File deleted successfully."
        );

        await loadFiles();

    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Delete failed: " +
            error.message
        );
    }
}




function refreshFiles() {

    loadFiles();
}


function formatFileSize(bytes) {

    if (bytes === 0) {
        return "0 Bytes";
    }

    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];

    const i =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );

    return (
        parseFloat(
            (bytes /
                Math.pow(1024, i)
            ).toFixed(2)
        ) +
        " " +
        units[i]
    );
}


function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}



document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await handleCallback();

        if (!isAuthenticated()) {
            return;
        }

        displayUserInformation();

        // Upload button
        const uploadBtn =
            document.getElementById("uploadBtn");

        const fileInput =
            document.getElementById("fileInput");

        uploadBtn.addEventListener(
            "click",
            async () => {

                const file =
                    fileInput.files[0];

                if (!file) {
                    alert("Please select a file.");
                    return;
                }

                uploadBtn.disabled = true;
                uploadBtn.textContent = "Uploading...";

                try {

                    await uploadFile(file);

                    fileInput.value = "";

                } finally {

                    uploadBtn.disabled = false;
                    uploadBtn.textContent = "Upload File";
                }
            }
        );


       
        const refreshBtn =
            document.getElementById("refreshBtn");

        refreshBtn.addEventListener(
            "click",
            async () => {

                refreshBtn.disabled = true;
                refreshBtn.textContent = "Refreshing...";

                try {
                    await loadFiles();
                } finally {
                    refreshBtn.disabled = false;
                    refreshBtn.textContent = "Refresh";
                }
            }
        );


       
        const logoutBtn =
            document.getElementById("logoutBtn");

        logoutBtn.addEventListener(
            "click",
            logout
        );


        await loadFiles();
    }
);