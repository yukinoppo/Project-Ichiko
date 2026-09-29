import { supabaseClient } from "./supabase.js";

// ================================
// GLOBAL VARIABLES
// ================================

let currentUser = null;

let dailyChallenge = null;
let dailyAttempt = null;

let currentQuestion = null;
let selectedAnswer = null;
let answerSubmitted = false;

const DAILY_QUESTION_COUNT = 4;


// ================================
// HTML ELEMENTS
// ================================
const questionCard = document.getElementById("question-card");

const dailyGame = document.getElementById("daily-game");
const dailyResults = document.getElementById("daily-results");
const resultScore = document.getElementById("result-score");

const questionText = document.getElementById("question-text");

const answerA = document.getElementById("answer-a");
const answerB = document.getElementById("answer-b");
const answerC = document.getElementById("answer-c");
const answerD = document.getElementById("answer-d");

const answerButtons = document.querySelectorAll(".answer-button");

const questionSubject = document.getElementById("question-subject");
const questionTopic = document.getElementById("question-topic");

const currentQuestionNumber =
    document.getElementById("current-question-number");

const progressFill =
    document.getElementById("daily-progress-fill");

const answerFeedback =
    document.getElementById("answer-feedback");

const feedbackText =
    document.getElementById("feedback-text");

const nextQuestionButton =
    document.getElementById("next-question-button");


// ================================
// SESSION
// ================================

async function checkSession() {

    const { data, error } = await supabaseClient.auth.getSession();

    if (data.session === null) {
        window.location.href = "index.html?reason=login-required";
        return;
    }

    currentUser = data.session.user;
    loadDaily();
}

//Answer Buttons
answerButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        // Save which answer was selected
        selectedAnswer = button.dataset.answer;

        // Remove selected style from every button
        answerButtons.forEach(function(answerButton) {
            answerButton.classList.remove("selected");
        });

        // Highlight the button they just clicked
        button.classList.add("selected");

    });

});

//Submit and Next Button
nextQuestionButton.addEventListener("click", function() {

    if (answerSubmitted === false) {

        if (selectedAnswer === null) {
            return;
        }

        handleAnswer(selectedAnswer);

    } else {

        nextQuestion();

    }

});



// ================================
// LOAD DAILY
// ================================

async function loadDaily() {

    // Get today's Daily Challenge
    const { data: challenge, error: challengeError } =
        await supabaseClient
            .rpc("get_or_create_daily_challenge");

    if (challengeError) {
        console.error("Failed to load Daily Challenge:", challengeError);
        return;
    }

    dailyChallenge = challenge;

    // Get player's attempt for this Daily
    const { data: attempt, error: attemptError } =
        await supabaseClient
            .from("daily_attempts")
            .select("id, current_question, score, completed")
            .eq("user_id", currentUser.id)
            .eq("challenge_date", dailyChallenge.challenge_date)
            .maybeSingle();

    if (attemptError) {
        console.error("Failed to load Daily attempt:", attemptError);
        return;
    }

    // YOUR LOGIC STARTS HERE
    if (attempt === null) {
        window.location.href = "home.html";
        return;
    }

    if (attempt.completed === true) {
        //return results
    }

    dailyAttempt = attempt;

    loadQuestion();
}


// ================================
// LOAD QUESTION
// ================================

async function loadQuestion() {

    const questionID = dailyChallenge.question_ids[dailyAttempt.current_question];

    const { data: question, error: questionError } =
        await supabaseClient
            .from("questions")
            .select(`
                id,
                subject,
                topic,
                question_text,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_answer
            `)
            .eq("id", questionID)
            .single();


    if (questionError) {
        console.error("Failed to load question:", questionError);
        return;
    }


    // Save the question globally
    currentQuestion = question;


    // Put it on the screen
    displayQuestion();
}


// ================================
// DISPLAY QUESTION
// ================================

function displayQuestion() {

    selectedAnswer = null;
    answerSubmitted = false;

    answerButtons.forEach(function(button) {
    button.disabled = false;
    button.classList.remove("selected", "correct", "wrong");
    });

    answerFeedback.classList.add("hidden");
    feedbackText.textContent = "";

    nextQuestionButton.textContent = "Submit";

    questionText.textContent = currentQuestion.question_text;
    questionTopic.textContent = currentQuestion.topic;
    questionSubject.textContent = currentQuestion.subject;

    answerA.textContent = currentQuestion.option_a;
    answerB.textContent = currentQuestion.option_b;
    answerC.textContent = currentQuestion.option_c;
    answerD.textContent = currentQuestion.option_d;
}


// ================================
// ANSWER CLICK
// ================================

async function handleAnswer(selectedAnswer) {
    let newScore = dailyAttempt.score;

    if (selectedAnswer === null) {
        alert("Please select an answer.");
        return;
    }

    answerButtons.forEach(function(button) {
    button.classList.remove("selected");
});

    if (selectedAnswer === currentQuestion.correct_answer) {
        const selectedButton = document.querySelector(
        `[data-answer="${selectedAnswer}"]`
        );

        selectedButton.classList.add("correct");

        feedbackText.textContent = "Correct!";
        answerFeedback.classList.remove("hidden");
        newScore += 1;
    }

    else {
        const selectedButton = document.querySelector(
        `[data-answer="${selectedAnswer}"]`
    );
        const correctButton = document.querySelector(
        `[data-answer="${currentQuestion.correct_answer}"]`
        );

        selectedButton.classList.add("wrong");
        correctButton.classList.add("correct");

        feedbackText.textContent = "Incorrect!";
        answerFeedback.classList.remove("hidden");
    }

    const newCurrentQuestion = dailyAttempt.current_question + 1;

    const { error } = await supabaseClient
    .from("daily_attempts")
    .update({
        current_question: newCurrentQuestion,
        score: newScore
    })
    .eq("id", dailyAttempt.id);

    if (error) {
        console.error("Failed to save Daily progress:", error);
        return;
    }

// Supabase update succeeded, so update our local copy
    dailyAttempt.current_question = newCurrentQuestion;
    dailyAttempt.score = newScore;

// Answer has now been submitted
    answerSubmitted = true;

// Prevent changing the answer after submitting
    answerButtons.forEach(function(button) {
        button.disabled = true;
    });

// Change Submit button into Next
    nextQuestionButton.textContent = "Next";
}


// ================================
// NEXT QUESTION
// ================================

async function nextQuestion() {

    if (dailyAttempt.current_question < DAILY_QUESTION_COUNT) {
        loadQuestion();
        return;
    }

    completeDaily();
}

// ================================
// COMPLETE DAILY
// ================================

async function completeDaily() {
    const completedTime = new Date().toISOString();

    const { error } = await supabaseClient
        .from("daily_attempts")
        .update({
            completed: true,
            completed_at: completedTime,
            score: dailyAttempt.score
        })
        .eq("id", dailyAttempt.id);

    if (error) {
        console.error("Failed to complete Daily:", error);
        return;
    }

    // Supabase succeeded, update local data
    dailyAttempt.completed = true;

    questionCard.classList.add("hidden");
    answerFeedback.classList.add("hidden");

    dailyGame.classList.add("hidden");
    dailyResults.classList.remove("hidden");

    resultScore.textContent = dailyAttempt.score;
}

// ================================
// START PAGE
// ================================

checkSession();