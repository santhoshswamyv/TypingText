// Variable Declarations

let paragraph;
let checkedDifficulty;
let mistakes = 0;
let stopCountingMistakes = false;
let timerId = null;
let timer = 0;
let previousMistake = false;

// Field Variables

let generatedParagraph = document.getElementById("generatedParagraph");
let responseDiv = document.getElementById("responseDiv");
let currentResponse = document.getElementById("currentResponse");
let readyBtn = document.getElementById("readyBtn");
let resetBtn = document.getElementById("resetBtn");

async function startTypingTest() {
    readyBtn.disabled = true;
    let difficulty = document.getElementsByName("difficulty");
    let isChecked = false;
    for (let idx = 0; idx < difficulty.length; idx++) {
        if(difficulty[idx].checked){
            isChecked = true;
            checkedDifficulty = difficulty[idx].id == "easyDifficulty" ? "EASY" : 
                                difficulty[idx].id == "mediumDifficulty" ? "MEDIUM" : "HARD";
            break;
        }   
    }

    if (!isChecked) {
        showAlert("Information","Choose Difficulty to Begin..!");
        return;
    }

    paragraph = await generateRandomParagraph(checkedDifficulty);
    
    if (paragraph == null) {
        showAlert("Information", "Error While Fetching Paragraph..!");
        return;
    }

    document.querySelector(".difficulty").style.display = "none";
    document.querySelector(".stats").style.display = "flex";
    readyBtn.style.display = "none";
    resetBtn.style.display = "block";

    generatedParagraph.innerHTML = paragraph;
    generatedParagraph.style.display = "block" ;
    responseDiv.style.display = "block" ;
    currentResponse.disabled = false;
    currentResponse.focus();
}

function resetTypingTest(){
    window.location.reload();
}

function validateResponse(event) {
    
    if(timerId == null){
        timerFunc("START");
    }

    let currentIndex = currentResponse.value.length;
    let key = event.key;
    
    if(event.keyCode == 8){
        return
    }

    if(paragraph.length == currentIndex){
        event.preventDefault();
        return
    }
    
    if(key !== paragraph[currentIndex]){
        let keyCode = event.keyCode;
        if(keyCode >= 65 && keyCode <= 90 || keyCode == 32){
            if (!previousMistake) {
                mistakes++;
                previousMistake = true;
            }
        }
        event.preventDefault();
    }else{
        previousMistake = false;
    }

    autoScrollParagraph(currentIndex);
    updateField("mistakes",mistakes);
}

// Helper Functions

async function generateRandomParagraph(difficulty) {
    let noOfParagraph;
    let noOfSentence;


    switch (difficulty) {
        case "EASY":
            noOfParagraph = 1;
            noOfSentence = 5;
            break;
        case "MEDIUM":
            noOfParagraph = 2;
            noOfSentence = 7;
            break;
        case "HARD":
            noOfParagraph = 3;
            noOfSentence = 10;
            break;
        default:
            showAlert("Information" , "Invalid Difficulty");
            return null;
    }

    //let url = `http://metaphorpsum.com/paragraphs/${noOfParagraph}/${noOfSentence}`;
    let url = `https://baconipsum.com/api/?type=all-meat&paras=${noOfParagraph}/&sentences=${noOfSentence}&format=text`;
    
    const response = await fetch(url)

    if (!response.ok) {
        return null;
    }

    return (await response.text()).replace(/\n/g," ");
}

function updateField(fieldId,fieldValue){
    document.getElementById(fieldId).innerHTML = fieldValue;
}

function timerFunc(type){
    if(type == "START"){
        if (timerId == null) {
            timerId = setInterval(updateTimer,1000)
        }
    }

    if(type == "STOP"){
        let len = document.getElementById("currentResponse").value.length;
        if(len === paragraph.length){
            clearInterval(timerId);
            currentResponse.disabled = true;
            let resMsg = ("You Have Completed the " + checkedDifficulty + " Mode in " + timer ) + 
                            (timer <= 1 ? " Second " : " Seconds ")  + ("With " + mistakes ) +
                            (mistakes <= 1 ? " Mistake" : " Mistakes"); 
            showAlert("Result",resMsg);
        }
    }
}

function updateTimer(){
    timer = timer + 1;
    updateField("timer",timer);
}

function showAlert(title, message) {
    document.getElementById("alertTitle").innerText = title;
    document.getElementById("alertMessage").innerText = message;
    document.getElementById("customAlert").style.display = "flex";
}

function closeAlert() {
    document.getElementById("customAlert").style.display = "none";
}

function autoGrow(el) {
    el.style.height = "auto";

    const maxHeight = parseFloat(getComputedStyle(el).maxHeight);
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";

    el.scrollTop = el.scrollHeight;

    renderParagraph(el.value.length);
}


function autoScrollParagraph(currentIndex) {
    const lineHeight = parseFloat(
        getComputedStyle(generatedParagraph).lineHeight
    );

    if (generatedParagraph.scrollHeight <= lineHeight * 1.2) return;

    const progress = currentIndex / paragraph.length;
    generatedParagraph.scrollTop =
        (generatedParagraph.scrollHeight - generatedParagraph.clientHeight) * progress;
}

function renderParagraph(index) {
    const typed = paragraph.slice(0, index);
    const remaining = paragraph.slice(index);

    generatedParagraph.innerHTML = 
        `<span class="typed">${typed}</span>` +
        `<span class="remaining">${remaining}</span>`;
}


