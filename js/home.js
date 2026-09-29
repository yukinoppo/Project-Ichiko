import { startTutorial } from "./tutorial.js";

/**
 * Project Ichiko
 * Main homepage script
 *
 * Handles session validation and homepage functionality.
 */
/* ---------- SUPABASE SETUP ---------- */
const SUPABASE_URL = "https://lzxbsruzaqqjlqyhtvwx.supabase.co";
const SUPABASE_KEY = "sb_publishable_40Diyrrl6ZJUP_AssHf5WA_gTYSAhk7";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/* ---------- SESSION CHECK ---------- */
let currentUser = null;
let todaysAttempt = null;

async function checkSession() {

    const { data, error } = await supabaseClient.auth.getSession();

    if (data.session === null) {
        window.location.href = "index.html?reason=login-required";
        return;
    }

    const user = data.session.user;
    loadProfile(user.id);
    loadDailyStatus(user.id);

    currentUser = data.session.user;
}

/* ---------- LOAD PROFILE ---------- */

async function loadProfile(userID) {

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("display_name")
        .eq("id", userID)
        .single();

    if (error) {
        console.error("Error loading profile:", error);
        return;
    }

    const displayName = document.getElementById("display-name");
    displayName.textContent = data.display_name;
}


checkSession();

/* ---------- DOM ELEMENTS ---------- */


/* ---------- HOMEPAGE FUNCTIONS ---------- */

//Profile Dropdown Visibility
const profileButton = document.getElementById("profile-button");
const profileDropdown = document.getElementById("profile-dropdown");

profileButton.addEventListener("click", function() {
    profileDropdown.classList.toggle("hidden");
});

//Logout Button
const logoutButton = document.getElementById("logout-button");
const logoutScreen = document.getElementById("logout-screen");

logoutButton.addEventListener("click", async function(){
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert(error.message);
        return;
    }

    logoutScreen.classList.remove("hidden");
    window.location.href = "index.html";
});

//Dailies button
const dailiesButton = document.getElementById("daily-start-button");

dailiesButton.addEventListener("click", async function() {

    // If no attempt exists yet, create one
    if (todaysAttempt === null) {

        const { data: today, error: dateError } = await supabaseClient
            .rpc("get_juken_today");

        if (dateError) {
            console.error("Failed to get server date:", dateError);
            return;
        }

        // Make sure today's Daily exists
        const { error: challengeError } = await supabaseClient
            .rpc("get_or_create_daily_challenge");

        if (challengeError) {
            console.error("Failed to create Daily challenge:", challengeError);
            return;
        }

        const { error: insertError } = await supabaseClient
            .from("daily_attempts")
            .insert({
                user_id: currentUser.id,
                challenge_date: today
            });

        if (insertError) {
            console.error("Failed to create Daily attempt:", insertError);
            return;
        }
    }

    // New attempt OR existing unfinished attempt
    window.location.href = "daily.html";
});

//Daily check on load

async function loadDailyStatus(userID) {

    // authoritative JST date
    const { data: today, error: dateError } = await supabaseClient
        .rpc("get_juken_today");

    //query daily_attempts
    const { data, error } = await supabaseClient
        .from("daily_attempts")
        .select("current_question, completed")
        .eq("user_id", userID)
        .eq("challenge_date", today)
        .maybeSingle();

    const dailiesButton = document.getElementById("daily-start-button");
    const dailyCompleted = document.getElementById("daily-completed");
    const dailyProgress = document.querySelector(".daily-progress-text");

    if (data === null) {
        dailiesButton.textContent = "Start";
        dailiesButton.disabled = false;
        dailyProgress.classList.add("hidden");
        }
    else if (data.completed === true) {
        dailiesButton.textContent = "Finished";
        dailiesButton.disabled = true;
        dailyProgress.classList.add("hidden");
    }
    else {
        dailiesButton.textContent = "Continue";
        dailiesButton.disabled = false;
        dailyCompleted.textContent = data.current_question;
        dailyProgress.classList.remove("hidden");
    }

    todaysAttempt = data;

}

const testTutorialSteps = [
    {
        target: ".daily-challenge",
        title: "Daily Challenge",
        text: "Try to complete your Daily Challenge every day.",
        action: "next",
        position: "bottom"
    },

    {
        target: "#daily-start-button",
        title: "Start Your Daily",
        text: "Click here to start.",
        action: "click",
        position: "top"
    }
];

startTutorial(testTutorialSteps, function() {
    console.log("Tutorial complete!");
});