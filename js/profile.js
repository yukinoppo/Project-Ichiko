/**
 * Project Ichiko
 * Profile Page Script
 *
 * Handles profile loading, editing,
 * avatars, banners, and profile settings.
 */

import { supabaseClient } from "./supabase.js";


// ==============================
// Global Variables
// ==============================

let currentUser = null;
let currentProfile = null;


// ==============================
// DOM Elements
// ==============================

// Main Profile
const profileDisplayName =
    document.getElementById("profile-display-name");

const profileUID =
    document.getElementById("profile-uid");

const profileBio =
    document.getElementById("profile-bio");

const profileAvatar =
    document.getElementById("profile-avatar");

const profileBannerImage =
    document.getElementById("profile-banner-image");


// Edit Profile
const editProfileButton =
    document.getElementById("edit-profile-button");

const editProfilePopup =
    document.getElementById("edit-profile-popup");

const closeEditProfileButton =
    document.getElementById("close-edit-profile");

const cancelEditProfileButton =
    document.getElementById("cancel-edit-profile");

const saveProfileButton =
    document.getElementById("save-profile-button");


// Avatar
const avatarButton =
    document.getElementById("avatar-button");

const avatarPopup =
    document.getElementById("avatar-popup");

const closeAvatarPopup =
    document.getElementById("close-avatar-popup");


// Banner
const changeBannerButton =
    document.getElementById("change-banner-button");

const bannerPopup =
    document.getElementById("banner-popup");

const closeBannerPopup =
    document.getElementById("close-banner-popup");


// ==============================
// Session
// ==============================

// ==============================
// Session
// ==============================

async function checkSession() {

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Session check failed:", error);
        return;
    }

    if (data.session === null) {
        window.location.href = "index.html?reason=login-required";
        return;
    }

    currentUser = data.session.user;

    await loadProfile(currentUser.id);
}


// ==============================
// Load Profile
// ==============================

async function loadProfile(userID) {

    const { data, error } = await supabaseClient
        .from("profiles")
        .select(`
            display_name,
            player_uid,
            bio,
            avatar_id,
            banner_id,
            birthday,
            tutorial_step,
            tutorial_completed
        `)
        .eq("id", userID)
        .single();

    if (error) {
        console.error("Error loading profile:", error);
        return;
    }

    currentProfile = data;

    displayProfile(data);
}


// ==============================
// Display Profile
// ==============================

function displayProfile(profile) {

    // Display name

    // UID

    // Bio

    // Avatar

    // Banner
}


// ==============================
// Edit Profile
// ==============================

function openEditProfile() {

    // Fill inputs with existing profile data

    // Open popup
}


function closeEditProfile() {

    // Close popup
}


async function saveProfile() {

    // Read input values

    // Validate

    // Update Supabase

    // Update currentProfile

    // Refresh displayed profile

    // Close popup
}


// ==============================
// Avatar
// ==============================

function openAvatarPopup() {

}


function closeAvatarSelector() {

}


async function selectAvatar(avatarID) {

    // Check ownership later

    // Save equipped avatar

    // Refresh profile
}


// ==============================
// Banner
// ==============================

function openBannerPopup() {

}


function closeBannerSelector() {

}


async function selectBanner(bannerID) {

    // Check ownership later

    // Save equipped banner

    // Refresh profile
}


// ==============================
// Event Listeners
// ==============================

// Edit profile


// Avatar


// Banner


// ==============================
// Start Page
// ==============================

checkSession();