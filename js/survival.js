import {supabaseClient} from "./supabase.js";
import {startTutorial} from "./tutorial.js";

// ============================================================
// PROJECT ICHIKO
// Survival Mode — Frontend Prototype
// ============================================================


// ------------------------------------------------------------
// TEMPORARY QUESTION DATA
//
// These are dummy questions only.
//
// Later:
// Supabase will send us the actual Survival test.
// ------------------------------------------------------------

const SURVIVAL_TEST_ID = 1;

let survivalQuestions = [];

let currentAttemptId = null;
let currentTestId = null;

let attemptExpiresAt = null;




// ============================================================
// TEST STATE
//
// Think of this like one big Python dictionary describing
// the current Survival run.
// ============================================================

let currentQuestionIndex = 0;

let answers =
    new Array(survivalQuestions.length)
        .fill(null);

let flaggedQuestions =
    new Array(survivalQuestions.length)
        .fill(false);


let remainingSeconds = 0;

let timerInterval = null;

let testStarted = false;

let testSubmitted = false;

let reviewMode = false;

let finalScore = 0;

let timeUsedSeconds = 0;

let reviewSource = null;

// ============================================================
// DOM ELEMENTS
// ============================================================

const startScreen =
    document.getElementById(
        "survival-start-screen"
    );

const testScreen =
    document.getElementById(
        "survival-test-screen"
    );


const backHomeButton =
    document.getElementById(
        "back-home-button"
    );

const startTestButton =
    document.getElementById(
        "start-test-button"
    );


const timerElement =
    document.getElementById(
        "survival-timer"
    );

const questionProgress =
    document.getElementById(
        "question-progress"
    );

const mobileQuestionProgress =
    document.getElementById(
        "mobile-question-progress"
    );

const questionNumber =
    document.getElementById(
        "question-number"
    );

const questionSubject =
    document.getElementById(
        "question-subject"
    );

const questionText =
    document.getElementById(
        "question-text"
    );

const answerOptions =
    document.getElementById(
        "answer-options"
    );


const flagQuestionButton =
    document.getElementById(
        "flag-question-button"
    );


const previousQuestionButton =
    document.getElementById(
        "previous-question-button"
    );

const nextQuestionButton =
    document.getElementById(
        "next-question-button"
    );


const questionGrid =
    document.getElementById(
        "question-grid"
    );

const answeredCount =
    document.getElementById(
        "answered-count"
    );


const questionNavigator =
    document.getElementById(
        "question-navigator"
    );

const openNavigatorButton =
    document.getElementById(
        "open-navigator-button"
    );

const closeNavigatorButton =
    document.getElementById(
        "close-navigator-button"
    );

const navigatorOverlay =
    document.getElementById(
        "navigator-overlay"
    );

const navigatorSubmitButton =
    document.getElementById(
        "navigator-submit-button"
    );


const submitModalOverlay =
    document.getElementById(
        "submit-modal-overlay"
    );

const submitAnswered =
    document.getElementById(
        "submit-answered"
    );

const submitUnanswered =
    document.getElementById(
        "submit-unanswered"
    );

const submitFlagged =
    document.getElementById(
        "submit-flagged"
    );

const submitTimeRemaining =
    document.getElementById(
        "submit-time-remaining"
    );

const returnToTestButton =
    document.getElementById(
        "return-to-test-button"
    );

const confirmSubmitButton =
    document.getElementById(
        "confirm-submit-button"
    );


const resultsScreen =
    document.getElementById(
        "survival-results-screen"
    );

const resultScore =
    document.getElementById(
        "result-score"
    );

const resultTotal =
    document.getElementById(
        "result-total"
    );

const resultPercentage =
    document.getElementById(
        "result-percentage"
    );

const resultTimeUsed =
    document.getElementById(
        "result-time-used"
    );

const subjectResults =
    document.getElementById(
        "subject-results"
    );

const reviewAnswersButton =
    document.getElementById(
        "review-answers-button"
    );

const resultsHomeButton =
    document.getElementById(
        "results-home-button"
    );

const reviewExplanation =
    document.getElementById(
        "review-explanation"
    );

const reviewExplanationText =
    document.getElementById(
        "review-explanation-text"
    );

const recentSurvivalList =
    document.getElementById(
        "recent-survival-list"
    );

const recentSurvivalSection =
    document.getElementById(
        "recent-survival-section"
    );

const survivalTestTitle =
    document.getElementById(
        "survival-test-title"
    );

const survivalTestDescription =
    document.getElementById(
        "survival-test-description"
    );

const survivalQuestionCount =
    document.getElementById(
        "survival-question-count"
    );

const survivalTimeLimit =
    document.getElementById(
        "survival-time-limit"
    );

const survivalMaterials =
    document.getElementById(
        "survival-materials"
    );

// ============================================================
// QUESTION MATERIAL / IMAGES
// ============================================================

const questionMaterial =
    document.getElementById(
        "question-material"
    );

const materialPassagePane =
    document.getElementById(
        "material-passage-pane"
    );

const materialTitle =
    document.getElementById(
        "material-title"
    );

const materialPassageText =
    document.getElementById(
        "material-passage-text"
    );

const materialImagePane =
    document.getElementById(
        "material-image-pane"
    );

const materialImage =
    document.getElementById(
        "material-image"
    );

const questionImageContainer =
    document.getElementById(
        "question-image-container"
    );

const questionImage =
    document.getElementById(
        "question-image"
    );

// ============================================================
// START SURVIVAL
// ============================================================

async function startSurvival() {

    startTestButton.disabled = true;
    startTestButton.textContent = "Preparing Challenge...";

    try {

        // ====================================================
        // Ask Supabase to create OR resume our attempt
        // ====================================================

        const {data, error} = await supabaseClient.rpc(
            "start_survival_test",
            {
                p_survival_test_id: SURVIVAL_TEST_ID
            }
        );

        if (error) {
            throw error;
        }

        console.log("Survival attempt:", data);


        // ====================================================
        // Store attempt information
        // ====================================================

        currentAttemptId = data.attempt_id;
        currentTestId = data.test_id;
        attemptExpiresAt = data.expires_at;


        // ====================================================
        // Convert database questions into our frontend format
        // ====================================================

        survivalQuestions = data.questions.map(question => ({
            id: question.question_id,

            position: question.position,

            subject: question.subject,

            topic: question.topic,

            subtopic: question.subtopic,

            questionType: question.question_type,

            question: question.prompt,

            choices: question.choices,

            material: question.material,

            questionImagePath:
            question.question_image_path,

            questionImageAlt:
            question.question_image_alt
        }));


        // ====================================================
        // Restore saved answers
        // ====================================================

        answers = data.questions.map(question => {

            if (
                question.saved_answer === null ||
                question.saved_answer === undefined
            ) {
                return null;
            }

            return question.saved_answer;
        });


        // ====================================================
        // Restore flags
        // ====================================================

        flaggedQuestions = data.questions.map(
            question => question.is_flagged === true
        );


        // ====================================================
        // Reset frontend state
        // ====================================================

        currentQuestionIndex = 0;

        testStarted = true;
        testSubmitted = false;

        reviewMode = false;
        reviewSource = null;


        // ====================================================
        // Calculate timer from SERVER expiration time
        // ====================================================

        const expiresAt =
            new Date(data.expires_at).getTime();

        const serverTime =
            new Date(data.server_time).getTime();

        remainingSeconds = Math.max(
            0,
            Math.floor(
                (expiresAt - serverTime) / 1000
            )
        );


        // ====================================================
        // Show test
        // ====================================================

        startScreen.classList.add("hidden");
        resultsScreen.classList.add("hidden");
        recentSurvivalSection.classList.add("hidden");

        testScreen.classList.remove("hidden");
        testScreen.classList.remove("review-mode");


        const timerBox =
            timerElement.closest(".timer-box");

        if (timerBox) {
            timerBox.style.display = "";
        }


        navigatorSubmitButton.style.display = "block";
        navigatorSubmitButton.textContent =
            "Submit Challenge";


        // ====================================================
        // Build test UI
        // ====================================================

        createQuestionNavigator();

        displayQuestion();

        updateAnsweredCount();

        updateTimerDisplay();

        startTimer();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Failed to start Survival:",
            error
        );

        alert(
            "Could not start the Survival challenge. Please try again."
        );

    } finally {

        startTestButton.disabled = false;
        startTestButton.textContent = "Start Challenge";

    }
}

// ============================================================
// DISPLAY QUESTION MATERIAL
// ============================================================

function displayQuestionMaterial(question) {

    // Reset everything first

    questionMaterial.classList.add("hidden");

    materialPassagePane.classList.add("hidden");

    materialImagePane.classList.add("hidden");

    questionImageContainer.classList.add("hidden");


    materialPassageText.textContent = "";

    materialImage.removeAttribute("src");
    materialImage.alt = "";

    questionImage.removeAttribute("src");
    questionImage.alt = "";


    const material =
        question.material;


    // ========================================================
    // SHARED PASSAGE
    // ========================================================

    if (
        material &&
        material.passage_text
    ) {

        questionMaterial.classList.remove(
            "hidden"
        );

        materialPassagePane.classList.remove(
            "hidden"
        );

        materialTitle.textContent =
            material.title ||
            "Source Material";

        materialPassageText.textContent =
            material.passage_text;
    }


    // ========================================================
    // SHARED IMAGE
    // ========================================================

    if (
        material &&
        material.image_path
    ) {

        questionMaterial.classList.remove(
            "hidden"
        );

        materialImagePane.classList.remove(
            "hidden"
        );

        materialImage.src =
            getSurvivalAssetUrl(
                material.image_path
            );

        materialImage.alt =
            material.image_alt || "";
    }


    // ========================================================
    // QUESTION-SPECIFIC IMAGE
    // ========================================================

    if (question.questionImagePath) {

        questionImageContainer.classList.remove(
            "hidden"
        );

        questionImage.src =
    getSurvivalAssetUrl(
        question.questionImagePath
    );

        questionImage.alt =
            question.questionImageAlt || "";
    }
}

// ============================================================
// DISPLAY QUESTION
// ============================================================

function displayQuestion() {

    const question =
        survivalQuestions[
            currentQuestionIndex
        ];

    displayQuestionMaterial(
        question
    );

    // Question number

    questionNumber.textContent =
        `QUESTION ${String(
            currentQuestionIndex + 1
        ).padStart(2, "0")}`;


    // Subject

    questionSubject.textContent =
        question.subject;


    // Main progress

    questionProgress.textContent =
        `Question ${
            currentQuestionIndex + 1
        } / ${
            survivalQuestions.length
        }`;


    mobileQuestionProgress.textContent =
        `${
            currentQuestionIndex + 1
        } / ${
            survivalQuestions.length
        }`;


    // Question text

    questionText.textContent =
        question.question;


    // Remove previous answer buttons

    answerOptions.innerHTML = "";


    // Build answers

    question.choices.forEach(
        function(choice, choiceIndex) {

            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";

            button.className =
                "answer-option";


            // If already selected,
            // restore selected appearance.

            if (
                answers[currentQuestionIndex]
                === choiceIndex
            ) {

                button.classList.add(
                    "selected"
                );
            }


            const letter =
                String.fromCharCode(
                    65 + choiceIndex
                );


            button.innerHTML = `
                <span class="answer-letter">
                    ${letter}
                </span>

                <span class="answer-text">
                    ${choice}
                </span>
            `;


            if (!reviewMode) {

                button.addEventListener(
                    "click",
                    function () {

                        selectAnswer(
                            choiceIndex
                        );

                    }
                );

}

            if (reviewMode) {

                reviewExplanation.classList.remove(
                    "hidden"
                );


                reviewExplanationText.textContent =
                    question.explanation;

            } else {

                reviewExplanation.classList.add(
                    "hidden"
                );

            }

// ----------------------------------------
// Review styling
// ----------------------------------------

            if (reviewMode) {

                const playerAnswer =
                    answers[
                        currentQuestionIndex
                        ];


                const correctAnswer =
                    question.correctAnswer;


                // Correct answer

                if (
                    choiceIndex ===
                    correctAnswer
                ) {

                    button.classList.add(
                        "review-correct"
                    );


                    const label =
                        document.createElement(
                            "span"
                        );


                    label.className =
                        "review-answer-label correct";


                    label.textContent =
                        "Correct";


                    button.appendChild(
                        label
                    );

                }


                // Player chose wrong answer

                if (
                    choiceIndex ===
                    playerAnswer
                    &&
                    playerAnswer !==
                    correctAnswer
                ) {

                    button.classList.add(
                        "review-wrong"
                    );


                    const label =
                        document.createElement(
                            "span"
                        );


                    label.className =
                        "review-answer-label wrong";


                    label.textContent =
                        "Your Answer";


                    button.appendChild(
                        label
                    );

                }

            }

            answerOptions.appendChild(
                button
            );

        }
    );


    // Previous disabled on Q1

    previousQuestionButton.disabled =
        currentQuestionIndex === 0;


    // Last question becomes Submit

    if (
        currentQuestionIndex ===
        survivalQuestions.length - 1
    ) {

        if (reviewMode) {

            nextQuestionButton.textContent =
                "Finish Review";

        } else {

            nextQuestionButton.textContent =
                "Submit";

        }

    } else {

        nextQuestionButton.textContent =
            "Next ›";

    }

    updateFlagButton();

    updateQuestionNavigator();

    updateAnsweredCount();
}

async function saveCurrentQuestionState(questionIndex) {

    const question =
        survivalQuestions[questionIndex];

    if (!question || !currentAttemptId) {
        return;
    }

    const { error } = await supabaseClient.rpc(
        "save_survival_answer",
        {
            p_attempt_id: currentAttemptId,
            p_question_id: question.id,
            p_answer: answers[questionIndex],
            p_is_flagged: flaggedQuestions[questionIndex]
        }
    );

    if (error) {

        console.error(
            "Failed to save Survival answer:",
            error
        );

        throw error;
    }
}

// ============================================================
// SELECT ANSWER
// ============================================================

async function selectAnswer(choiceIndex) {

    const questionIndex =
        currentQuestionIndex;

    const previousAnswer =
        answers[questionIndex];


    // Update immediately so the UI feels responsive
    answers[questionIndex] =
        choiceIndex;

    displayQuestion();


    try {

        await saveCurrentQuestionState(
            questionIndex
        );

    } catch (error) {

        // Saving failed.
        // Restore the previous local state.
        answers[questionIndex] =
            previousAnswer;

        displayQuestion();

        alert(
            "Your answer could not be saved. Please try again."
        );
    }
}


// ============================================================
// NEXT QUESTION
// ============================================================

function goToNextQuestion() {

    if (
        currentQuestionIndex <
        survivalQuestions.length - 1
    ) {

        currentQuestionIndex++;

        displayQuestion();

        return;
    }


    // ----------------------------------------
    // End of review
    // ----------------------------------------

    if (reviewMode) {

    finishReview();

    return;
}


    // ----------------------------------------
    // Normal test submission
    // ----------------------------------------

    submitSurvival();
}

// ============================================================
// PREVIOUS QUESTION
// ============================================================

function goToPreviousQuestion() {

    if (currentQuestionIndex === 0) {
        return;
    }


    currentQuestionIndex--;

    displayQuestion();
}


// ============================================================
// GO DIRECTLY TO QUESTION
// ============================================================

function goToQuestion(index) {

    if (
        index < 0 ||
        index >= survivalQuestions.length
    ) {

        return;
    }


    currentQuestionIndex = index;

    displayQuestion();

    closeMobileNavigator();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ============================================================
// FLAG QUESTION
// ============================================================

async function toggleFlag() {

    const questionIndex =
        currentQuestionIndex;

    const previousFlag =
        flaggedQuestions[
            questionIndex
        ];


    // Update immediately
    flaggedQuestions[
        questionIndex
    ] = !previousFlag;


    updateFlagButton();

    updateQuestionNavigator();


    try {

        await saveCurrentQuestionState(
            questionIndex
        );

    } catch (error) {

        // Restore old flag if saving failed
        flaggedQuestions[
            questionIndex
        ] = previousFlag;


        updateFlagButton();

        updateQuestionNavigator();


        alert(
            "Your flag could not be saved. Please try again."
        );
    }
}


// ============================================================
// FLAG BUTTON APPEARANCE
// ============================================================

function updateFlagButton() {

    const flagged =
        flaggedQuestions[
            currentQuestionIndex
        ];


    if (flagged) {

        flagQuestionButton.classList.add(
            "flagged"
        );

        flagQuestionButton.innerHTML =
            "<span>⚑</span><span>Flagged</span>";

    }

    else {

        flagQuestionButton.classList.remove(
            "flagged"
        );

        flagQuestionButton.innerHTML =
            "<span>⚑</span><span>Flag</span>";

    }
}


// ============================================================
// CREATE QUESTION NAVIGATOR
// ============================================================

function createQuestionNavigator() {

    questionGrid.innerHTML = "";


    survivalQuestions.forEach(
        function(question, index) {

            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";

            button.className =
                "question-grid-button";

            button.textContent =
                index + 1;


            button.addEventListener(
                "click",
                function() {

                    goToQuestion(index);

                }
            );


            questionGrid.appendChild(
                button
            );

        }
    );
}


// ============================================================
// UPDATE QUESTION NAVIGATOR
// ============================================================

function updateQuestionNavigator() {

    const buttons =
        questionGrid.querySelectorAll(
            ".question-grid-button"
        );


    buttons.forEach(
        function(button, index) {

            button.classList.remove(
                "answered",
                "current",
                "flagged"
            );


            // Answered

            if (answers[index] !== null) {

                button.classList.add(
                    "answered"
                );

            }


            // Current

            if (
                index ===
                currentQuestionIndex
            ) {

                button.classList.add(
                    "current"
                );

            }


            // Flagged

            if (flaggedQuestions[index]) {

                button.classList.add(
                    "flagged"
                );

            }

        }
    );
}


// ============================================================
// ANSWERED COUNT
// ============================================================

function updateAnsweredCount() {

    const totalAnswered =
        answers.filter(
            function(answer) {

                return answer !== null;

            }
        ).length;


    answeredCount.textContent =
        `${totalAnswered} / ${survivalQuestions.length} answered`;
}


// ============================================================
// TIMER
// ============================================================

function startTimer() {

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    updateRemainingTime();

    timerInterval = setInterval(() => {

        updateRemainingTime();

        if (remainingSeconds <= 0) {

            clearInterval(timerInterval);

            timerInterval = null;

            submitSurvival(true);
        }

    }, 1000);
}

function updateRemainingTime() {

    if (!attemptExpiresAt) {
        return;
    }

    const expiresAt =
        new Date(attemptExpiresAt).getTime();

    const now =
        Date.now();

    remainingSeconds = Math.max(
        0,
        Math.ceil(
            (expiresAt - now) / 1000
        )
    );

    updateTimerDisplay();
}


// ============================================================
// TIMER DISPLAY
// ============================================================
function formatTime(totalSeconds) {

    const minutes =
        Math.floor(
            totalSeconds / 60
        );


    const seconds =
        totalSeconds % 60;


    return (
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`
    );
}

function updateTimerDisplay() {

    timerElement.textContent =
        formatTime(
            remainingSeconds
        );


    const timerBox =
        timerElement.closest(
            ".timer-box"
        );


    if (remainingSeconds <= 300) {

        timerBox.classList.add(
            "warning"
        );

    }

    else {

        timerBox.classList.remove(
            "warning"
        );

    }
}


// ============================================================
// SUBMIT
//
// Temporary.
//
// Next step:
// proper confirmation modal + results screen.
// ============================================================

function submitSurvival(automatic = false) {

    if (testSubmitted) {
        return;
    }


    // Timer reached zero.
    // No confirmation needed.

    if (automatic) {

        finalizeSubmission();

        return;
    }


    openSubmitModal();
}

// ============================================================
// OPEN SUBMIT CONFIRMATION
// ============================================================

function openSubmitModal() {

    const totalAnswered =
        answers.filter(
            answer =>
                answer !== null
        ).length;


    const unanswered =
        survivalQuestions.length -
        totalAnswered;


    const flagged =
        flaggedQuestions.filter(
            flagged =>
                flagged
        ).length;


    submitAnswered.textContent =
        totalAnswered;


    submitUnanswered.textContent =
        unanswered;


    submitFlagged.textContent =
        flagged;


    submitTimeRemaining.textContent =
        formatTime(
            remainingSeconds
        );


    submitModalOverlay.classList.remove(
        "hidden"
    );


    closeMobileNavigator();
}


// ============================================================
// CLOSE SUBMIT CONFIRMATION
// ============================================================

function closeSubmitModal() {

    submitModalOverlay.classList.add(
        "hidden"
    );
}


// ============================================================
// FINAL SUBMISSION
// ============================================================

async function finalizeSubmission() {

    if (testSubmitted) {
        return;
    }


    // Prevent double clicking while submitting
    confirmSubmitButton.disabled = true;

    navigatorSubmitButton.disabled = true;


    try {

        // ====================================================
        // Ask Supabase to grade + finalize the attempt
        // ====================================================

        const { data, error } =
            await supabaseClient.rpc(
                "submit_survival_test",
                {
                    p_attempt_id:
                        currentAttemptId
                }
            );


        if (error) {
            throw error;
        }


        console.log(
            "Survival result:",
            data
        );


        // ====================================================
        // Submission succeeded
        // ====================================================

        testSubmitted = true;


        if (timerInterval) {

            clearInterval(
                timerInterval
            );

            timerInterval = null;
        }


        closeSubmitModal();


        // ====================================================
        // Store server result
        // ====================================================

        finalScore =
            data.score;

        timeUsedSeconds =
            data.time_used_seconds;


        // ====================================================
        // Show REAL server result
        // ====================================================

        showResults(
            data
        );
        loadRecentSurvivalAttempts();


    } catch (error) {

        console.error(
            "Failed to submit Survival:",
            error
        );


        alert(
            "Your challenge could not be submitted. Please try again."
        );


    } finally {

        confirmSubmitButton.disabled =
            false;

        navigatorSubmitButton.disabled =
            false;
    }
}




// ============================================================
// MOBILE NAVIGATOR
// ============================================================

function openMobileNavigator() {

    questionNavigator.classList.add(
        "mobile-open"
    );

    navigatorOverlay.classList.add(
        "visible"
    );
}


function closeMobileNavigator() {

    questionNavigator.classList.remove(
        "mobile-open"
    );

    navigatorOverlay.classList.remove(
        "visible"
    );
}

// ============================================================
// RESULTS
// ============================================================

function showResults(result) {

    testScreen.classList.add(
        "hidden"
    );


    resultsScreen.classList.remove(
        "hidden"
    );


    resultScore.textContent =
        finalScore;


    resultTotal.textContent =
        result.total_questions;


    const percentage =
    result.total_questions > 0
        ? Math.round(
            (
                result.score /
                result.total_questions
            ) * 100
        )
        : 0;


    resultPercentage.textContent =
        `${percentage}%`;


    resultTimeUsed.textContent =
        formatTime(
            timeUsedSeconds
        );


    displaySubjectResults(
        result.subjects
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ============================================================
// SUBJECT BREAKDOWN
// ============================================================

function displaySubjectResults(subjects) {

    subjectResults.innerHTML = "";


    subjects.forEach(
        function(result) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "subject-result-row";


            const subjectName =
                document.createElement(
                    "span"
                );

            subjectName.textContent =
                result.subject;


            const score =
                document.createElement(
                    "strong"
                );

            score.textContent =
                `${result.correct} / ${result.total}`;


            row.appendChild(
                subjectName
            );

            row.appendChild(
                score
            );


            subjectResults.appendChild(
                row
            );
        }
    );
}

async function startReview() {

    if (!currentAttemptId) {
        return;
    }


    reviewSource = "current";


    await loadSurvivalReview(
        currentAttemptId
    );
}



async function loadSurvivalReview(
    attemptId
) {

    reviewAnswersButton.disabled = true;


    try {

        const { data, error } =
            await supabaseClient.rpc(
                "get_survival_review",
                {
                    p_attempt_id:
                        attemptId
                }
            );


        if (error) {
            throw error;
        }


        // ----------------------------------------
        // Questions
        // ----------------------------------------

        survivalQuestions =
            data.questions.map(
                question => ({

                    id:
                        question.question_id,

                    position:
                        question.position,

                    subject:
                        question.subject,

                    topic:
                        question.topic,

                    subtopic:
                        question.subtopic,

                    questionType:
                        question.question_type,

                    question:
                        question.prompt,

                    choices:
                    question.choices,

                    material:
                    question.material,

                    questionImagePath:
                    question.question_image_path,

                    questionImageAlt:
                    question.question_image_alt,

                    correctAnswer:
                    question.correct_answer,

                    explanation:
                    question.explanation

                })
            );


        // ----------------------------------------
        // Student answers
        // ----------------------------------------

        answers =
            data.questions.map(
                question =>
                    question.user_answer ??
                    null
            );


        // ----------------------------------------
        // Flags
        // ----------------------------------------

        flaggedQuestions =
            data.questions.map(
                question =>
                    question.is_flagged === true
            );


        // ----------------------------------------
        // Enter review
        // ----------------------------------------

        reviewMode = true;

        currentQuestionIndex = 0;


        startScreen.classList.add(
            "hidden"
        );

        recentSurvivalSection.classList.add(
            "hidden"
        );

        resultsScreen.classList.add(
            "hidden"
        );

        testScreen.classList.remove(
            "hidden"
        );

        testScreen.classList.add(
            "review-mode"
        );


        const timerBox =
            timerElement.closest(
                ".timer-box"
            );

        if (timerBox) {
            timerBox.style.display =
                "none";
        }


        navigatorSubmitButton.style.display =
            "block";

        navigatorSubmitButton.textContent =
            "Finish Review";


        createQuestionNavigator();

        displayQuestion();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Failed to load Survival review:",
            error
        );


        alert(
            "Could not load your Survival review."
        );


    } finally {

        reviewAnswersButton.disabled =
            false;
    }
}

function finishReview() {

    if (!reviewMode) {
        return;
    }


    reviewMode = false;


    testScreen.classList.add(
        "hidden"
    );

    testScreen.classList.remove(
        "review-mode"
    );


    const timerBox =
        timerElement.closest(
            ".timer-box"
        );

    if (timerBox) {
        timerBox.style.display = "";
    }


    // ----------------------------------------
    // Came from history
    // ----------------------------------------

    if (reviewSource === "history") {

        resultsScreen.classList.add(
            "hidden"
        );

        startScreen.classList.remove(
            "hidden"
        );

        recentSurvivalSection.classList.remove(
            "hidden"
        );


    // ----------------------------------------
    // Came directly from results
    // ----------------------------------------

    } else {

        startScreen.classList.add(
            "hidden"
        );

        resultsScreen.classList.remove(
            "hidden"
        );
    }


    reviewSource = null;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function formatSurvivalTime(totalSeconds) {

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;


    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

async function loadRecentSurvivalAttempts() {

    if (!recentSurvivalList) {
        return;
    }


    const { data, error } =
        await supabaseClient.rpc(
            "get_recent_survival_attempts"
        );


    if (error) {

        console.error(
            "Failed to load recent Survival attempts:",
            error
        );

        return;
    }


    recentSurvivalList.innerHTML = "";


    if (!data || data.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.className =
            "recent-survival-empty";

        emptyMessage.textContent =
            "No completed challenges yet.";


        recentSurvivalList.appendChild(
            emptyMessage
        );

        return;
    }


    data.forEach(attempt => {

        const record =
            document.createElement("div");

        record.className =
            "recent-survival-record";


        // ----------------------------------------
        // Main information
        // ----------------------------------------

        const info =
            document.createElement("div");

        info.className =
            "recent-survival-info";


        const title =
            document.createElement("strong");

        title.className =
            "recent-survival-title";

        title.textContent =
            attempt.title;


        const details =
            document.createElement("span");

        details.className =
            "recent-survival-details";

        details.textContent =
            `${attempt.score} / ${attempt.total_questions}`
            + `  •  ${attempt.percentage}%`
            + `  •  ${formatSurvivalTime(attempt.time_used_seconds)}`;


        info.appendChild(title);
        info.appendChild(details);


        // ----------------------------------------
        // Review button
        // ----------------------------------------

        const reviewButton =
            document.createElement("button");

        reviewButton.type =
            "button";

        reviewButton.className =
            "recent-survival-review";

        reviewButton.textContent =
            "Review";


        reviewButton.addEventListener(
            "click",
            () => {
                startHistoricalReview(
                    attempt.attempt_id
                );
            }
        );


        record.appendChild(info);
        record.appendChild(reviewButton);

        recentSurvivalList.appendChild(
            record
        );
    });
}

async function startHistoricalReview(
    attemptId
) {

    reviewSource = "history";

    await loadSurvivalReview(
        attemptId
    );
}

function formatTestDuration(totalSeconds) {

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;


    if (seconds === 0) {

        return `${minutes} min`;

    }


    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

async function loadSurvivalTestInfo() {

    try {

        const { data, error } =
            await supabaseClient.rpc(
                "get_survival_test_info",
                {
                    p_survival_test_id:
                        SURVIVAL_TEST_ID
                }
            );


        if (error) {
            throw error;
        }


        // ----------------------------------------
        // Title
        // ----------------------------------------

        survivalTestTitle.textContent =
            data.title;


        // ----------------------------------------
        // Description
        // ----------------------------------------

        survivalTestDescription.textContent =
            data.description ?? "";


        // ----------------------------------------
        // Question count
        // ----------------------------------------

        survivalQuestionCount.textContent =
            data.question_count;


        // ----------------------------------------
        // Time limit
        // ----------------------------------------

        survivalTimeLimit.textContent =
            formatTestDuration(
                data.time_limit_seconds
            );

        // ----------------------------------------
        // Allowed materials
        // ----------------------------------------

        survivalMaterials.innerHTML = "";

        const materials =
            data.allowed_materials ?? [];


        if (materials.length > 0) {

            materials.forEach(material => {

                const item =
                    document.createElement("div");

                item.className =
                    "permitted-item";


                const symbol =
                    document.createElement("span");

                symbol.className =
                    "permitted-symbol";

                symbol.textContent =
                    "◇";


                const text =
                    document.createElement("span");

                text.textContent =
                    material;


                item.appendChild(symbol);
                item.appendChild(text);

                survivalMaterials.appendChild(item);
            });

        } else {

            const item =
                document.createElement("div");

            item.className =
                "permitted-item";


            const symbol =
                document.createElement("span");

            symbol.className =
                "permitted-symbol";

            symbol.textContent =
                "◇";


            const text =
                document.createElement("span");

            text.textContent =
                "No additional materials";


            item.appendChild(symbol);
            item.appendChild(text);

            survivalMaterials.appendChild(item);
        }


    } catch (error) {

        console.error(
            "Failed to load Survival test information:",
            error
        );

    }
}

function getSurvivalAssetUrl(path) {
    if (!path) {
        return null;
    }

    const { data } = supabaseClient
        .storage
        .from("survival-assets")
        .getPublicUrl(path);

    return data.publicUrl;
}

// ============================================================
// EVENT LISTENERS
// ============================================================


// Back to Home

backHomeButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "home.html";

    }
);


// Start

startTestButton.addEventListener(
    "click",
    startSurvival
);


// Previous

previousQuestionButton.addEventListener(
    "click",
    goToPreviousQuestion
);


// Next / Submit

nextQuestionButton.addEventListener(
    "click",
    goToNextQuestion
);


// Flag

flagQuestionButton.addEventListener(
    "click",
    toggleFlag
);


// Mobile navigator

openNavigatorButton.addEventListener(
    "click",
    openMobileNavigator
);


closeNavigatorButton.addEventListener(
    "click",
    closeMobileNavigator
);


navigatorOverlay.addEventListener(
    "click",
    closeMobileNavigator
);

// Submit from question navigator

navigatorSubmitButton.addEventListener(
    "click",
    function() {

        if (reviewMode) {

            finishReview();

        }

        else {

            openSubmitModal();

        }

    }
);


// Return from submit confirmation

returnToTestButton.addEventListener(
    "click",
    closeSubmitModal
);


// Confirm final submission

confirmSubmitButton.addEventListener(
    "click",
    finalizeSubmission
);


// Review answers

reviewAnswersButton.addEventListener(
    "click",
    startReview
);


// Results → Home

resultsHomeButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "home.html";

    }
);

// ============================================================
// PAGE INITIALIZATION
// ============================================================

loadSurvivalTestInfo();
loadRecentSurvivalAttempts();