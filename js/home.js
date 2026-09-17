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

async function checkSession() {

    const { data, error } = await supabaseClient.auth.getSession();

    if (data.session === null) {
        window.location.href = "index.html?reason=login-required";
        return;
    }

    const user = data.session.user;
    loadProfile(user.id);

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

    const { data: today, error: dateError } = await supabaseClient
        .rpc("get_juken_today");

    if (dateError) {
        console.error("Failed to get server date:", dateError);
        return;
    }

    const { data, error } = await supabaseClient
        .from("daily_attempts")
        .select("id, current_question, score, completed")
        .eq("user_id", currentUser.id)
        .eq("challenge_date", today)
        .maybeSingle();

    if (error) {
        console.error("Failed to check Daily attempt:", error);
        return;
    }

    if ( data !== null) {

        if (data.completed === true) {
            alert("Dailies already completed today.");
            return;

        } else {
            window.location.href = "daily.html";
            return;
        }

    } else {
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

        window.location.href = "daily.html";
    }
});