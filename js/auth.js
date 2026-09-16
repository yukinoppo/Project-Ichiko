/**
 * Project Ichiko
 * Main authentication page script
 *
 * Handles login/register UI behavior and authentication.
 */

//Supabase Table Stuff
const SUPABASE_URL = "https://lzxbsruzaqqjlqyhtvwx.supabase.co";
const SUPABASE_KEY = "sb_publishable_40Diyrrl6ZJUP_AssHf5WA_gTYSAhk7";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

//Get buttons
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");

//Get forms
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

//Register clicked
registerTab.addEventListener("click", function() {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
});

//Login clicked
loginTab.addEventListener("click", function() {
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});

//Registration
registerForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const username = document.getElementById("register-username").value;
    const displayName = document.getElementById("register-display-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,

        options: {
            data: {
                username: username,
                display_name: displayName
            }
        }
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Account created successfully!");

    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");

});

//Login
loginForm.addEventListener("submit", async function(event){

    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Login successful!");
    window.location.href = "home.html";

});