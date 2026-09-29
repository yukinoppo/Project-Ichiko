// ========================================
// TUTORIAL STATE
// ========================================
let tutorialSteps = [];
let currentTutorialStep = 0;
let currentTarget = null;

let tutorialCompleteCallback = null;


// ========================================
// CREATE TUTORIAL UI
// ========================================

const tutorialOverlay = document.createElement("div");
tutorialOverlay.classList.add("tutorial-overlay", "tutorial-hidden");

const tutorialBox = document.createElement("div");
tutorialBox.classList.add("tutorial-box", "tutorial-hidden");

const tutorialStepText = document.createElement("p");
tutorialStepText.classList.add("tutorial-step");

const tutorialTitle = document.createElement("h2");
tutorialTitle.classList.add("tutorial-title");

const tutorialText = document.createElement("p");
tutorialText.classList.add("tutorial-text");

const tutorialActions = document.createElement("div");
tutorialActions.classList.add("tutorial-actions");

const tutorialNextButton = document.createElement("button");
tutorialNextButton.classList.add("tutorial-next-button");
tutorialNextButton.textContent = "Next";


// ========================================
// BUILD TUTORIAL UI
// ========================================

tutorialActions.appendChild(tutorialNextButton);

tutorialBox.appendChild(tutorialStepText);
tutorialBox.appendChild(tutorialTitle);
tutorialBox.appendChild(tutorialText);
tutorialBox.appendChild(tutorialActions);

document.body.appendChild(tutorialOverlay);
document.body.appendChild(tutorialBox);


// ========================================
// START TUTORIAL
// ========================================

function startTutorial(steps, onComplete) {

    tutorialSteps = steps;
    tutorialCompleteCallback = onComplete;

    currentTutorialStep = 0

    showTutorialStep();
}


// ========================================
// SHOW CURRENT STEP
// ========================================

function showTutorialStep() {

    const step = tutorialSteps[currentTutorialStep];

    removeHighlight();

    currentTarget = document.querySelector(step.target);

    currentTarget.classList.add("tutorial-highlight");

    tutorialStepText.textContent = (currentTutorialStep + 1) + " / " + tutorialSteps.length;

    tutorialTitle.textContent = step.title

    tutorialText.textContent = step.text;

    if (step.action === "next") {
        tutorialNextButton.classList.remove("tutorial-hidden");

    }

    else if (step.action === "click") {
        tutorialNextButton.classList.add("tutorial-hidden");

        currentTarget.addEventListener("click", handleTargetClick);
    }

    tutorialOverlay.classList.remove("tutorial-hidden");
    tutorialBox.classList.remove("tutorial-hidden");

    positionTutorialBox(currentTarget, step.position);

}

function handleTargetClick() {

    nextTutorialStep();
}


// ========================================
// NEXT STEP
// ========================================

function nextTutorialStep() {
    currentTutorialStep += 1;

    if (currentTutorialStep < tutorialSteps.length) {
        showTutorialStep();
    }

    else {
        finishTutorial();
    }

}

// ========================================
// POSITION TUTORIAL BOX
// ========================================

function positionTutorialBox(target, position) {

    const targetRect = target.getBoundingClientRect();
    const boxRect = tutorialBox.getBoundingClientRect();

    let top;
    let left;

    const gap = 16;
    const screenPadding = 16;

    if (position === "bottom") {

        top = targetRect.bottom + gap;

        left =
            targetRect.left
            + (targetRect.width / 2)
            - (boxRect.width / 2);

    } else if (position === "top") {

        top = targetRect.top - boxRect.height - gap;

        left =
            targetRect.left
            + (targetRect.width / 2)
            - (boxRect.width / 2);
    }

    if (top + boxRect.height > window.innerHeight - screenPadding) {

        top = targetRect.top - boxRect.height - gap;
    }

    if (top < screenPadding) {

        top = screenPadding;
    }


    tutorialBox.style.top = `${top}px`;
    tutorialBox.style.left = `${left}px`;

}


// ========================================
// REMOVE CURRENT HIGHLIGHT
// ========================================

function removeHighlight() {

    if (currentTarget !== null) {

        currentTarget.classList.remove("tutorial-highlight");
        currentTarget.classList.remove("pulse");

        currentTarget.removeEventListener("click", handleTargetClick);

        currentTarget = null;
    }
}


// ========================================
// FINISH TUTORIAL
// ========================================

function finishTutorial() {
    removeHighlight();

    tutorialOverlay.classList.add("tutorial-hidden");

    tutorialBox.classList.add("tutorial-hidden");

    tutorialSteps = [];
    currentTutorialStep = 0;

    if (typeof tutorialCompleteCallback === "function") {
        tutorialCompleteCallback();
        tutorialCompleteCallback = null;
    }
}


// ========================================
// NEXT BUTTON
// ========================================

tutorialNextButton.addEventListener("click", function() {

    nextTutorialStep();

});


// ========================================
// EXPORT
// ========================================

export {
    startTutorial
};