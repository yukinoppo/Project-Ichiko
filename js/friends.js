import {supabaseClient} from "./supabase.js";
import {startTutorial} from "./tutorial.js";


/**
 * Project Ichiko
 * Friends Page
 *
 * Handles:
 * - Session validation
 * - Player information
 * - Friend list
 * - Player UID search
 * - Friend requests
 * - Friends notifications
 * - Friends tutorial
 */


/* ==================================================
   STATE
================================================== */

let currentUser = null;
let currentProfile = null;


/* ==================================================
   DOM ELEMENTS
================================================== */
const backHomeButton =
    document.getElementById("back-home-button");

/* ---------- Top Bar ---------- */

const profileButton =
    document.getElementById("profile-button");

const profileDropdown =
    document.getElementById("profile-dropdown");

const profilePicture =
    document.getElementById("profile-picture");

const displayName =
    document.getElementById("display-name");

const logoutButton =
    document.getElementById("logout-button");

const friendsButton =
    document.getElementById("friends-button");

const friendsNotification =
    document.getElementById("friends-notification");


/* ---------- Tabs ---------- */

const friendsTab =
    document.getElementById("friends-tab");

const searchTab =
    document.getElementById("search-tab");

const requestsTab =
    document.getElementById("requests-tab");


/* ---------- Panels ---------- */

const friendsPanel =
    document.getElementById("friends-panel");

const searchPanel =
    document.getElementById("search-panel");

const requestsPanel =
    document.getElementById("requests-panel");


/* ---------- Friend List ---------- */

const friendsList =
    document.getElementById("friends-list");

const friendCount =
    document.getElementById("friend-count");


/* ---------- Player Search ---------- */

const playerUIDInput =
    document.getElementById("player-uid-input");

const searchPlayerButton =
    document.getElementById("search-player-button");

const searchResult =
    document.getElementById("search-result");


/* ---------- Friend Requests ---------- */

const requestsList =
    document.getElementById("requests-list");

const requestCount =
    document.getElementById("request-count");


/* ==================================================
   TAB GROUPS
================================================== */

const tabs = [
    friendsTab,
    searchTab,
    requestsTab
];

const panels = [
    friendsPanel,
    searchPanel,
    requestsPanel
];


/* ==================================================
   SESSION
================================================== */

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

    // Later:
    // await loadFriends();
    // await loadFriendRequests();
    // handleTutorialProgress(currentProfile);
}


/* ==================================================
   PROFILE
================================================== */

async function loadProfile(userID) {

    const {data, error} =
        await supabaseClient
            .from("profiles")
            .select(`
                display_name,
                player_uid,
                avatar_id,
                tutorial_step,
                tutorial_completed
            `)
            .eq("id", userID)
            .single();

    if (error) {
        console.error(
            "Failed to load profile:",
            error
        );

        return;
    }

    currentProfile = data;

    displayName.textContent =
        data.display_name;

    profilePicture.src =
        `assets/avatars/${data.avatar_id}.webp`;
}


/* ==================================================
   TAB NAVIGATION
================================================== */

function switchTab(selectedTab, selectedPanel) {

    tabs.forEach(function (tab) {
        tab.classList.remove("active");
    });

    panels.forEach(function (panel) {
        panel.classList.add("hidden");
    });

    selectedTab.classList.add("active");
    selectedPanel.classList.remove("hidden");
}


/* ==================================================
   FRIEND LIST
================================================== */

async function loadFriends() {

    // We'll build this next.

}


function displayFriends(friends) {

    // Eventually:
    // friendsList.innerHTML = "";
    //
    // Loop through friends
    // Create player rows
    // Add View Profile buttons

}


/* ==================================================
   PLAYER SEARCH
================================================== */

async function searchPlayer() {

    const playerUID =
        playerUIDInput.value.trim();

    if (playerUID === "") {
        return;
    }

    const {data, error} =
        await supabaseClient
            .from("profiles")
            .select(`
                display_name,
                player_uid,
                avatar_id
            `)
            .eq("player_uid", playerUID)
            .maybeSingle();

    if (error) {
        console.error(
            "Failed to search player:",
            error
        );

        return;
    }

    if (data === null) {

        searchResult.innerHTML = `
            <div class="friends-empty">
                <h3>Player not found</h3>
                <p>Check the Player UID and try again.</p>
            </div>
        `;

        return;
    }

    displaySearchResult(data);
}


function displaySearchResult(player) {

    searchResult.innerHTML = "";

    const card =
        document.createElement("div");

    card.classList.add("search-result-card");


    const avatar =
        document.createElement("img");

    avatar.classList.add("friend-avatar");

    avatar.src =
        `assets/avatars/${player.avatar_id}.webp`;

    avatar.alt =
        "Player Avatar";


    const details =
        document.createElement("div");

    details.classList.add("friend-details");


    const name =
        document.createElement("span");

    name.classList.add("friend-name");

    name.textContent =
        player.display_name;


    const uid =
        document.createElement("span");

    uid.classList.add("friend-uid");

    uid.textContent =
        `UID ${player.player_uid}`;


    const actions =
        document.createElement("div");

    actions.classList.add(
        "search-result-actions"
    );


    const viewProfileButton =
        document.createElement("button");

    viewProfileButton.classList.add(
        "view-profile-button"
    );

    viewProfileButton.textContent =
        "View Profile";


    const addFriendButton =
        document.createElement("button");

    addFriendButton.classList.add(
        "add-friend-button"
    );

    addFriendButton.textContent =
        "Add Friend";

    addFriendButton.addEventListener(
        "click",
        function () {

            sendFriendRequest(
                player.player_uid,
                addFriendButton
            );

        }
    );


    details.appendChild(name);
    details.appendChild(uid);

    actions.appendChild(
        viewProfileButton
    );

    actions.appendChild(
        addFriendButton
    );

    card.appendChild(avatar);
    card.appendChild(details);
    card.appendChild(actions);

    searchResult.appendChild(card);
}


/* ==================================================
   SEND FRIEND REQUEST
================================================== */

async function sendFriendRequest(
    playerUID,
    button
) {

    const { error } =
        await supabaseClient.rpc(
            "send_friend_request",
            {
                p_player_uid: playerUID
            }
        );

    if (error) {

        console.error(
            "Failed to send friend request:",
            error
        );

        return;
    }

    button.textContent =
        "Request Sent";

    button.disabled = true;
}


/* ==================================================
   FRIEND REQUESTS
================================================== */

async function loadFriendRequests() {

    // Load incoming requests for currentUser.

}


function displayFriendRequests(requests) {

    // Build incoming request rows.

}


/* ==================================================
   ACCEPT FRIEND REQUEST
================================================== */

async function acceptFriendRequest(requestID) {

    // We'll call:
    //
    // supabaseClient.rpc(
    //     "accept_friend_request",
    //     { p_request_id: requestID }
    // );

}


/* ==================================================
   DECLINE FRIEND REQUEST
================================================== */

async function declineFriendRequest(requestID) {

    // We'll call:
    //
    // supabaseClient.rpc(
    //     "decline_friend_request",
    //     { p_request_id: requestID }
    // );

}


/* ==================================================
   FRIEND NOTIFICATIONS
================================================== */

function updateFriendsNotification(count) {

    if (count <= 0) {

        friendsNotification.classList.add("hidden");
        requestCount.classList.add("hidden");

        return;
    }

    const displayedCount =
        count > 9 ? "9+" : count;

    friendsNotification.textContent =
        displayedCount;

    requestCount.textContent =
        displayedCount;

    friendsNotification.classList.remove("hidden");
    requestCount.classList.remove("hidden");
}


/* ==================================================
   PROFILE DROPDOWN
================================================== */

profileButton.addEventListener(
    "click",
    function () {

        profileDropdown.classList.toggle("hidden");

    }
);


/* ==================================================
   LOGOUT
================================================== */

logoutButton.addEventListener(
    "click",
    async function () {

        const {error} =
            await supabaseClient.auth.signOut();

        if (error) {

            console.error(
                "Logout failed:",
                error
            );

            return;
        }

        window.location.href =
            "index.html";
    }
);


/* ==================================================
   TAB EVENTS
================================================== */

friendsTab.addEventListener(
    "click",
    function () {

        switchTab(
            friendsTab,
            friendsPanel
        );
    }
);


searchTab.addEventListener(
    "click",
    function () {

        switchTab(
            searchTab,
            searchPanel
        );
    }
);


requestsTab.addEventListener(
    "click",
    function () {

        switchTab(
            requestsTab,
            requestsPanel
        );
    }
);


/* ==================================================
   SEARCH EVENTS
================================================== */

searchPlayerButton.addEventListener(
    "click",
    function () {

        searchPlayer();

    }
);


/* Allow Enter to search */

playerUIDInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            searchPlayer();
        }

    }
);


/* ==================================================
   FRIENDS BUTTON
================================================== */

friendsButton.addEventListener(
    "click",
    function () {

        /*
         * We're already on the Friends page,
         * so clicking the Friends icon returns
         * to the main Friends tab.
         */

        switchTab(
            friendsTab,
            friendsPanel
        );

    }
);


/* ==================================================
   TUTORIAL
================================================== */

function handleTutorialProgress(profile) {

    /*
     * Leave this empty for now.
     *
     * Later we'll define the Friends tutorial here
     * once we know its final place in the full
     * Project Ichiko tutorial.
     */

}

backHomeButton.addEventListener(
    "click",
    function () {
        window.location.href = "home.html";
    }
);

/* ==================================================
   INITIALIZE PAGE
================================================== */

checkSession();