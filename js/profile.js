/**
 * Project Ichiko
 * Profile Page Script
 *
 * Handles profile loading, editing,
 * avatars, banners, and profile settings.
 */

import {supabaseClient} from "./supabase.js";


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

const profileAccuracy =
    document.getElementById("accuracy");

const showAccuracy =
    document.getElementById("show-accuracy");


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
const birthdaySection =
    document.getElementById("birthday-section");


// Avatar
const avatarButton =
    document.getElementById("avatar-button");

const avatarPopup =
    document.getElementById("avatar-popup");

const closeAvatarPopup =
    document.getElementById("close-avatar-popup");

const avatarGrid =
    document.getElementById("avatar-grid");

const avatarName =
    document.getElementById("avatar-name");

const avatarDescription =
    document.getElementById("avatar-description");


// Banner
const changeBannerButton =
    document.getElementById("change-banner-button");

const bannerPopup =
    document.getElementById("banner-popup");

const closeBannerPopup =
    document.getElementById("close-banner-popup");

const bannerGrid =
    document.getElementById("banner-grid");

const bannerName =
    document.getElementById("banner-name");

const bannerDescription =
    document.getElementById("banner-description");

// ==================== STATISTICS VISIBILITY ====================

const editStatisticsButton =
    document.getElementById("edit-statistics-button");

const statisticsVisibilityPopup =
    document.getElementById("statistics-visibility-popup");

const closeStatisticsVisibility =
    document.getElementById("close-statistics-visibility");

const cancelStatisticsVisibility =
    document.getElementById("cancel-statistics-visibility");

const saveStatisticsVisibility =
    document.getElementById("save-statistics-visibility");

const showQuestionsAnswered =
    document.getElementById("show-questions-answered");

const showCurrentStreak =
    document.getElementById("show-current-streak");

const showBestSurvival =
    document.getElementById("show-best-survival");

const statisticsVisibilityError =
    document.getElementById("statistics-visibility-error");

// ==============================
// Session
// ==============================

async function checkSession() {

    const {data, error} = await supabaseClient.auth.getSession();

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
    await loadAccuracy();
}


// ==============================
// Load Profile
// ==============================

async function loadProfile(userID) {

    const {data, error} = await supabaseClient
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

    // Display Name
    profileDisplayName.textContent = profile.display_name;

    // UID
    profileUID.textContent = profile.player_uid;

    // Bio
    profileBio.textContent =
        profile.bio || "Set your bio here";

    // Avatar
    profileAvatar.src =
        `assets/avatars/${profile.avatar_id}.webp`;

    // Banner
    profileBannerImage.src =
        `assets/banners/${profile.banner_id}.webp`;
}


// ==============================
// Edit Profile
// ==============================
const editDisplayName =
    document.getElementById("edit-display-name");

const editBio =
    document.getElementById("edit-bio");

const editBirthday =
    document.getElementById("edit-birthday");

const birthdayWarning =
    document.getElementById("birthday-warning");

const editProfileError =
    document.getElementById("edit-profile-error");

function openEditProfile() {

    editDisplayName.value = currentProfile.display_name;
    editBio.value = currentProfile.bio || "";

    if (currentProfile.birthday !== null) {

        editBirthday.value = currentProfile.birthday;
        editBirthday.disabled = true;

        birthdaySection.classList.add("birthday-locked");

    } else {

        editBirthday.value = "";
        editBirthday.disabled = false;

        birthdaySection.classList.remove("birthday-locked");
    }

    editProfilePopup.classList.remove("hidden");
}

function closeEditProfile() {
    editProfilePopup.classList.add("hidden");
}

async function saveProfile() {

    // Read input values
    const newDisplayName = editDisplayName.value.trim();
    const newBio = editBio.value.trim();
    const newBirthday = editBirthday.value;


    // Clear previous error
    editProfileError.classList.add("hidden");
    editProfileError.textContent = "";


    // Validate display name
    if (newDisplayName.length === 0) {

        editProfileError.textContent =
            "Display name cannot be empty.";

        editProfileError.classList.remove("hidden");

        return;
    }


    // Build profile update
    const updates = {
        display_name: newDisplayName,
        bio: newBio
    };


    // Only set birthday if one has never been set
    if (
        currentProfile.birthday === null &&
        newBirthday !== ""
    ) {
        updates.birthday = newBirthday;
    }


    // Update Supabase
    const {data, error} = await supabaseClient
        .from("profiles")
        .update(updates)
        .eq("id", currentUser.id)
        .select()
        .single();


    // Handle error
    if (error) {

        console.error("Failed to update profile:", error);

        editProfileError.textContent =
            "Failed to save profile.";

        editProfileError.classList.remove("hidden");

        return;
    }


    // Store updated profile
    currentProfile = data;


    // Refresh visible profile
    displayProfile(currentProfile);


    // Close popup
    closeEditProfile();
}


// ==============================
// Avatar
// ==============================

async function openAvatarPopup() {

    const {data: avatars, error: avatarError} =
        await supabaseClient
            .from("avatars")
            .select("*")
            .order("created_at");

    if (avatarError) {
        console.error("Failed to load avatars:", avatarError);
        return;
    }


    const {data: ownedAvatars, error: ownershipError} =
        await supabaseClient
            .from("user_avatars")
            .select("avatar_id")
            .eq("user_id", currentUser.id);

    if (ownershipError) {
        console.error(
            "Failed to load owned avatars:",
            ownershipError
        );
        return;
    }


    displayAvatarGrid(avatars, ownedAvatars);

    avatarPopup.classList.remove("hidden");
}

function displayAvatarGrid(avatars, ownedAvatars) {

    // Clear the current grid
    avatarGrid.innerHTML = "";


    // Go through every avatar in the catalog
    avatars.forEach(function (avatar) {

        // Check whether the current user owns this avatar
        const isOwned = ownedAvatars.some(function (owned) {
            return owned.avatar_id === avatar.id;
        });


        // Create avatar button
        const button = document.createElement("button");
        button.classList.add("cosmetic-item");

        button.dataset.avatarId = avatar.id;

        // Create wrapper
        const imageWrapper = document.createElement("div");
        imageWrapper.classList.add("cosmetic-image-wrapper");


        // Create avatar image
        const image = document.createElement("img");

        image.src = avatar.image_path;
        image.alt = avatar.name;

        imageWrapper.appendChild(image);


        // If avatar is locked
        if (!isOwned) {

            button.classList.add("locked");

            const lockIcon = document.createElement("span");

            lockIcon.classList.add("lock-icon");
            lockIcon.textContent = "🔒";

            imageWrapper.appendChild(lockIcon);
        }


        // If this is currently equipped
        if (avatar.id === currentProfile.avatar_id) {
            button.classList.add("selected");
        }


        // Add image/wrapper to button
        button.appendChild(imageWrapper);


        // Clicking any avatar shows its information
        button.addEventListener("click", function () {

            avatarName.textContent = avatar.name;

            if (isOwned) {

                avatarDescription.textContent =
                    avatar.description || "";

                selectAvatar(avatar.id);

            } else {

                avatarDescription.textContent =
                    avatar.unlock_description ||
                    "This avatar is currently locked.";
            }
        });


        // Add completed button to grid
        avatarGrid.appendChild(button);
    });
}

function closeAvatarSelector() {
    avatarPopup.classList.add("hidden");
}

async function selectAvatar(avatarID) {

    const {error} = await supabaseClient.rpc(
        "equip_avatar",
        {
            p_avatar_id: avatarID
        }
    );

    if (error) {
        console.error("Failed to equip avatar:", error);
        return;
    }


    // Update our local profile data
    currentProfile.avatar_id = avatarID;


    // Update the big profile avatar
    profileAvatar.src =
        `assets/avatars/${avatarID}.webp`;


    // Update which avatar has the selected border
    const avatarButtons =
        avatarGrid.querySelectorAll(".cosmetic-item");

    avatarButtons.forEach(function (button) {

        button.classList.remove("selected");

        if (button.dataset.avatarId === avatarID) {
            button.classList.add("selected");
        }

    });
}


// ==============================
// Banner
// ==============================

async function openBannerPopup() {

    const {data: banners, error: bannerError} =
        await supabaseClient
            .from("banners")
            .select("*")
            .order("created_at");

    if (bannerError) {
        console.error("Failed to load banners:", bannerError);
        return;
    }


    const {data: ownedBanners, error: ownershipError} =
        await supabaseClient
            .from("user_banners")
            .select("banner_id")
            .eq("user_id", currentUser.id);

    if (ownershipError) {
        console.error(
            "Failed to load owned banners:",
            ownershipError
        );
        return;
    }


    displayBannerGrid(banners, ownedBanners);

    bannerPopup.classList.remove("hidden");
}

function displayBannerGrid(banners, ownedBanners) {

    bannerGrid.innerHTML = "";

    banners.forEach(function (banner) {

        const isOwned = ownedBanners.some(function (owned) {
            return owned.banner_id === banner.id;
        });


        const button = document.createElement("button");

        button.classList.add("cosmetic-item");

        button.dataset.bannerId = banner.id;


        const imageWrapper = document.createElement("div");
        imageWrapper.classList.add("cosmetic-image-wrapper");


        const image = document.createElement("img");

        image.src = banner.image_path;
        image.alt = banner.name;

        imageWrapper.appendChild(image);


        if (!isOwned) {

            button.classList.add("locked");

            const lockIcon = document.createElement("span");

            lockIcon.classList.add("lock-icon");
            lockIcon.textContent = "🔒";

            imageWrapper.appendChild(lockIcon);
        }


        if (banner.id === currentProfile.banner_id) {
            button.classList.add("selected");
        }


        button.appendChild(imageWrapper);


        button.addEventListener("click", function () {

            bannerName.textContent = banner.name;

            if (isOwned) {

                bannerDescription.textContent =
                    banner.description || "";

                selectBanner(banner.id);

            } else {

                bannerDescription.textContent =
                    banner.unlock_description ||
                    "This banner is currently locked.";
            }
        });


        bannerGrid.appendChild(button);
    });
}

function closeBannerSelector() {
    bannerPopup.classList.add("hidden");
}


async function selectBanner(bannerID) {

    const {error} = await supabaseClient.rpc(
        "equip_banner",
        {
            p_banner_id: bannerID
        }
    );

    if (error) {
        console.error("Failed to equip banner:", error);
        return;
    }


    currentProfile.banner_id = bannerID;


    // Update main profile banner
    const selectedBanner =
        bannerGrid.querySelector(
            `[data-banner-id="${bannerID}"] img`
        );

    if (selectedBanner) {
        profileBannerImage.src = selectedBanner.src;
    }


    // Move selected outline
    const bannerButtons =
        bannerGrid.querySelectorAll(".cosmetic-item");

    bannerButtons.forEach(function (button) {

        button.classList.remove("selected");

        if (button.dataset.bannerId === bannerID) {
            button.classList.add("selected");
        }

    });
}

async function openStatisticsVisibility() {

    const {data, error} = await supabaseClient
        .from("profile_privacy")
        .select(`
        show_questions_answered,
        show_current_streak,
        show_best_survival,
        show_accuracy
    `)
        .eq("user_id", currentUser.id)
        .single();

    if (error) {
        console.error(
            "Failed to load statistics visibility:",
            error
        );
        return;
    }


    showQuestionsAnswered.checked =
        data.show_questions_answered;

    showCurrentStreak.checked =
        data.show_current_streak;

    showBestSurvival.checked =
        data.show_best_survival;

    showAccuracy.checked =
    data.show_accuracy;


    statisticsVisibilityPopup.classList.remove("hidden");
}

function closeStatisticsVisibilityPopup() {
    statisticsVisibilityPopup.classList.add("hidden");
}

async function saveStatisticsVisibilitySettings() {

    statisticsVisibilityError.classList.add("hidden");
    statisticsVisibilityError.textContent = "";


    const {error} = await supabaseClient
        .from("profile_privacy")
        .update({
            show_questions_answered:
            showQuestionsAnswered.checked,

            show_current_streak:
            showCurrentStreak.checked,

            show_best_survival:
            showBestSurvival.checked,

            show_accuracy:
            showAccuracy.checked
        })
        .eq("user_id", currentUser.id);


    if (error) {

        console.error(
            "Failed to save statistics visibility:",
            error
        );

        statisticsVisibilityError.textContent =
            "Failed to save visibility settings.";

        statisticsVisibilityError.classList.remove("hidden");

        return;
    }


    closeStatisticsVisibilityPopup();
}

async function loadAccuracy() {

    const { data: attempts, error } =
        await supabaseClient
            .from("daily_attempts")
            .select("score, current_question")
            .eq("user_id", currentUser.id);

    if (error) {
        console.error("Failed to load accuracy:", error);
        return;
    }


    let correctAnswers = 0;
    let totalAnswers = 0;


    attempts.forEach(function(attempt) {

        correctAnswers += attempt.score;

        totalAnswers += attempt.current_question;

    });


    if (totalAnswers === 0) {

        profileAccuracy.textContent = "--";
        return;

    }


    const accuracy =
        (correctAnswers / totalAnswers) * 100;


    profileAccuracy.textContent =
        `${Math.round(accuracy)}%`;
}

// ==============================
// Event Listeners
// ==============================

// Edit Profile
editProfileButton.addEventListener("click", openEditProfile);

closeEditProfileButton.addEventListener("click", closeEditProfile);

cancelEditProfileButton.addEventListener("click", closeEditProfile);

saveProfileButton.addEventListener("click", saveProfile);

// Avatar
avatarButton.addEventListener("click", openAvatarPopup);

closeAvatarPopup.addEventListener("click", closeAvatarSelector);

changeBannerButton.addEventListener(
    "click",
    openBannerPopup
);

closeBannerPopup.addEventListener(
    "click",
    closeBannerSelector
);

editStatisticsButton.addEventListener(
    "click",
    openStatisticsVisibility
);

closeStatisticsVisibility.addEventListener(
    "click",
    closeStatisticsVisibilityPopup
);

cancelStatisticsVisibility.addEventListener(
    "click",
    closeStatisticsVisibilityPopup
);

saveStatisticsVisibility.addEventListener(
    "click",
    saveStatisticsVisibilitySettings
);

// ==============================
// Start Page
// ==============================

checkSession();