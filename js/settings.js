import {supabaseClient} from "./supabase.js";

/**
 * Project Ichiko
 * Settings Page
 *
 * Handles:
 * - Session validation
 * - Displaying account email
 * - Password reset email
 * - Returning to Home
 */

/* ========================================
   DOM ELEMENTS
======================================== */

const accountEmail =
    document.getElementById("account-email");

const changePasswordButton =
    document.getElementById("change-password-button");

const backHomeButton =
    document.getElementById("back-home-button");


/* ========================================
   CURRENT USER
======================================== */

let currentUser = null;


/* ========================================
   SESSION CHECK
======================================== */

async function checkSession() {

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {
        console.error(
            "Session check failed:",
            error
        );

        return;
    }

    if (data.session === null) {

        window.location.href =
            "index.html?reason=login-required";

        return;
    }

    currentUser = data.session.user;

    loadAccountInformation();
}


/* ========================================
   LOAD ACCOUNT INFORMATION
======================================== */

function loadAccountInformation() {

    accountEmail.textContent =
        currentUser.email ?? "No email found";
}


/* ========================================
   CHANGE PASSWORD
======================================== */

changePasswordButton.addEventListener(
    "click",
    async function() {

        if (currentUser === null) {
            return;
        }

        changePasswordButton.disabled = true;
        changePasswordButton.textContent =
            "Sending...";

        const { error } =
            await supabaseClient.auth
                .resetPasswordForEmail(
                    currentUser.email,
                    {
                        redirectTo:
                            `${window.location.origin}/reset-password.html`
                    }
                );

        if (error) {

            console.error(
                "Password reset failed:",
                error
            );

            alert(
                "Could not send the password reset email."
            );

            changePasswordButton.disabled = false;
            changePasswordButton.textContent =
                "Change Password";

            return;
        }

        alert(
            "A password reset link has been sent to your email."
        );

        changePasswordButton.disabled = false;
        changePasswordButton.textContent =
            "Email Sent";
    }
);


/* ========================================
   BACK TO HOME
======================================== */

backHomeButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "home.html";
    }
);


/* ========================================
   START
======================================== */

checkSession();