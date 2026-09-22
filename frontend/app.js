const fileInput = document.getElementById("fileInput");
const chooseButton = document.getElementById("chooseButton");
const uploadButton = document.getElementById("uploadButton");

const uploadArea = document.getElementById("uploadArea");

const fileName = document.getElementById("fileName");

const progressContainer =
    document.getElementById("progressContainer");

const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressText");

const progressPercent =
    document.getElementById("progressPercent");

const status =
    document.getElementById("status");


let selectedFile = null;


/*
    Open file picker
*/

chooseButton.addEventListener("click", () => {
    fileInput.click();
});


/*
    File selected
*/

fileInput.addEventListener("change", () => {

    if (fileInput.files.length === 0) {
        return;
    }

    selectFile(fileInput.files[0]);
});


/*
    Select file
*/

function selectFile(file) {

    selectedFile = file;

    fileName.textContent =
        `${file.name} (${formatFileSize(file.size)})`;

    uploadButton.disabled = false;

    hideStatus();
}


/*
    Drag & Drop
*/

uploadArea.addEventListener("dragover", (event) => {

    event.preventDefault();

    uploadArea.classList.add("dragover");
});


uploadArea.addEventListener("dragleave", () => {

    uploadArea.classList.remove("dragover");
});


uploadArea.addEventListener("drop", (event) => {

    event.preventDefault();

    uploadArea.classList.remove("dragover");

    const files = event.dataTransfer.files;

    if (files.length === 0) {
        return;
    }

    selectFile(files[0]);
});




uploadButton.addEventListener("click", async () => {

    if (!selectedFile) {
        showStatus(
            "Please select a file first.",
            "error"
        );

        return;
    }

    await uploadFile(selectedFile);
});



async function uploadFile(file) {

    try {

        uploadButton.disabled = true;

        progressContainer.classList.remove("hidden");

        progressBar.style.width = "0%";

        progressPercent.textContent = "0%";

        progressText.textContent =
            "Preparing upload...";

        hideStatus();


     

        await simulateUpload();


        showStatus(
            "File uploaded successfully!",
            "success"
        );

        progressText.textContent =
            "Upload completed";

    } catch (error) {

        console.error(error);

        showStatus(
            "Upload failed. Please try again.",
            "error"
        );

    } finally {

        uploadButton.disabled = false;
    }
}



function simulateUpload() {

    return new Promise((resolve) => {

        let progress = 0;

        const interval = setInterval(() => {

            progress += 10;

            progressBar.style.width =
                `${progress}%`;

            progressPercent.textContent =
                `${progress}%`;

            progressText.textContent =
                "Uploading...";

            if (progress >= 100) {

                clearInterval(interval);

                setTimeout(resolve, 300);
            }

        }, 150);
    });
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

    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );

    return (
        parseFloat(
            (bytes / Math.pow(1024, index))
                .toFixed(2)
        )
        + " "
        + units[index]
    );
}



function showStatus(message, type) {

    status.textContent = message;

    status.className =
        `status ${type}`;

    status.classList.remove("hidden");
}



function hideStatus() {

    status.classList.add("hidden");
}