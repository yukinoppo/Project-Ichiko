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

async function checkSession() {

    const { data, error } = await supabaseClient.auth.getSession();

    if (data.session === null) {
        window.location.href = "index.html?reason=login-required";
        return;
    }

    const user = data.session.user;
    loadProfile(user.id);
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