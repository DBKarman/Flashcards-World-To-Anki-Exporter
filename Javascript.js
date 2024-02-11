let UploadedJSONFile;
async function HandleFile() {
    //create promise
    return new Promise((resolve, reject) => {
        //get the file
        const file = document.getElementById("JSONFile").files[0];

        //If file exists
        if (file) {
            //declare reader
            const reader = new FileReader();

            //try read
            reader.onload = function (e) {
                try {
                    UploadedJSONFile = JSON.parse(e.target.result);
                    resolve();
                } catch (error) {
                    outputDiv.innerHTML = "Error parsing JSON file.";
                    reject();
                }
            };

            reader.readAsText(file);
        } else {
            alert("please upload a file");
            reject();
        }
    });
}

//when the convert button is clicked,
$("#ConvertButton").click(async function () {
    await HandleFile();
    ConvertJSON();
});

function ConvertJSON() {
    let AnkiTextFile;
    try {
        AnkiTextFile = ConvertJsonToAnkiText(UploadedJSONFile);
    } catch {
        $("#convertFeedbackSpan").html("Could not convert");
    }

    // Create element with <a> tag
    const link = document.createElement("a");
    // Create a blog object with the file content which you want to add to the file
    const file = new Blob([AnkiTextFile], { type: "text/plain" });
    // Add file content in the object URL
    link.href = URL.createObjectURL(file);
    // Add file name
    link.download = "FlashCardsWorldImport.txt";
    // Add click event to <a> tag to save file.
    link.click();
    URL.revokeObjectURL(link.href);
}