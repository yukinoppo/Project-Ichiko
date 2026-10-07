import {startTutorial} from "./tutorial.js";

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

    const {data, error} =
        await supabaseClient.auth.getSession();

    if (error) {
        console.error("Session check failed:", error);
        return;
    }

    if (data.session === null) {
        window.location.href =
            "index.html?reason=login-required";
        return;
    }

    currentUser = data.session.user;

    await loadProfile(currentUser.id);

    loadDailyStatus(currentUser.id);
    loadFriendNotifications(currentUser.id);
}

/* ---------- LOAD PROFILE ---------- */

async function loadProfile(userID) {

    const {data, error} = await supabaseClient
        .from("profiles")
        .select("display_name, avatar_id, tutorial_step, tutorial_completed")
        .eq("id", userID)
        .single();

    if (error) {
        console.error("Error loading profile:", error);
        return;
    }

    const displayName = document.getElementById("display-name");
    displayName.textContent = data.display_name;

    homeProfileAvatar.src =
        `assets/avatars/${data.avatar_id}.webp`;


    handleTutorialProgress(data);
}


/* ---------- DOM ELEMENTS ---------- */
const homeProfileAvatar =
    document.getElementById("profile-picture");

const friendsButton =
    document.getElementById("friends-button");

const friendsNotification =
    document.getElementById("friends-notification");

const survivalButton =
    document.getElementById("survival-button");

/* ---------- HOMEPAGE FUNCTIONS ---------- */

//Profile Dropdown Visibility
const profileButton = document.getElementById("profile-button");
const profileDropdown = document.getElementById("profile-dropdown");

profileButton.addEventListener("click", function () {
    profileDropdown.classList.toggle("hidden");
});

const profileLink = document.querySelector(
    "#profile-dropdown a[href='profile.html']"
);

profileLink.addEventListener("click", async function (event) {

    if (currentTutorialProgress === 2) {

        event.preventDefault();

        const {error} = await supabaseClient
            .from("profiles")
            .update({
                tutorial_step: 3
            })
            .eq("id", currentUser.id);

        if (error) {
            console.error("Failed to save tutorial progress:", error);
            return;
        }

        window.location.href = "profile.html?tutorial=true";
    }
});

//Logout Button
const logoutButton = document.getElementById("logout-button");
const logoutScreen = document.getElementById("logout-screen");

logoutButton.addEventListener("click", async function () {
    const {error} = await supabaseClient.auth.signOut();

    if (error) {
        alert(error.message);
        return;
    }

    logoutScreen.classList.remove("hidden");
    window.location.href = "index.html";
});

//Dailies button
const dailiesButton = document.getElementById("daily-start-button");
let tutorialDailyMode = false;
let currentTutorialProgress = null;

dailiesButton.addEventListener("click", async function () {

    if (tutorialDailyMode === true) {
        window.location.href = "daily.html?tutorial=true";
        return;
    }

    // If no attempt exists yet, create one
    if (todaysAttempt === null) {

        const {data: today, error: dateError} = await supabaseClient
            .rpc("get_juken_today");

        if (dateError) {
            console.error("Failed to get server date:", dateError);
            return;
        }

        // Make sure today's Daily exists
        const {error: challengeError} = await supabaseClient
            .rpc("get_or_create_daily_challenge");

        if (challengeError) {
            console.error("Failed to create Daily challenge:", challengeError);
            return;
        }

        const {error: insertError} = await supabaseClient
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
    const {data: today, error: dateError} = await supabaseClient
        .rpc("get_juken_today");

    //query daily_attempts
    const {data, error} = await supabaseClient
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
    } else if (data.completed === true) {
        dailiesButton.textContent = "Finished";
        dailiesButton.disabled = true;
        dailyProgress.classList.add("hidden");
    } else {
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

const homeAfterDailyTutorialSteps = [
    {
        target: ".streak",
        title: "Daily Streak 🔥",
        text: "Complete your Dailies every day to build your streak. Keep it going to earn prizes!",
        action: "next",
        position: "bottom"
    },

    {
        target: ".currency",
        title: "Gems 💎",
        text: "Earn Gems by playing and completing challenges. You can use them for rewards in-game!",
        action: "next",
        position: "bottom"
    },

    {
        target: "#practice-button",
        title: "Practice",
        text: "Practice questions and learn topics you're not confident about.",
        action: "next",
        position: "top"
    },

    {
        target: "#survival-button",
        title: "Survival",
        text: "Test yourself in Survival, set high scores, and earn prizes!",
        action: "next",
        position: "top"
    },

    {
        target: "#ranked-button",
        title: "Ranked 🏆",
        text: "Compete with your friends, climb the leaderboards, and earn special prizes!",
        action: "next",
        position: "top"
    },

    {
        target: "#profile-button",
        title: "Profile & Settings",
        text: "Click here to find your profile and various settings.",
        action: "click",
        position: "bottom"
    },

    {
        target: "#profile-dropdown a[href='profile.html']",
        parentHighlight: "#profile-dropdown",
        title: "Your Profile",
        text: "Click here to learn how to customize your profile.",
        action: "click",
        position: "bottom"
    }
];

function handleTutorialProgress(profile) {

    currentTutorialProgress = profile.tutorial_step;

    if (profile.tutorial_completed === true) {
        return;
    }

    if (profile.tutorial_step === 0) {

        tutorialDailyMode = true;
        startTutorial(testTutorialSteps);
        return;

    } else if (profile.tutorial_step === 2) {

        startTutorial(homeAfterDailyTutorialSteps);
        return;
    }
}

/* ---------- FRIEND NOTIFICATIONS ---------- */

async function loadFriendNotifications(userID) {

    const { count, error } = await supabaseClient
        .from("friend_requests")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("receiver_id", userID);

    if (error) {
        console.error("Failed to load friend requests:", error);
        return;
    }

    updateFriendsNotification(count);
}

function updateFriendsNotification(count) {

    if (count <= 0) {
        friendsNotification.classList.add("hidden");
        return;
    }

    friendsNotification.textContent =
        count > 9 ? "9+" : count;

    friendsNotification.classList.remove("hidden");
}

// Survival Mode

survivalButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "survival.html";
    }
);

friendsButton.addEventListener("click", function() {
    window.location.href = "friends.html";
});

checkSession();