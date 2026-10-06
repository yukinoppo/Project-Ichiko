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
let friendPendingRemoval = null;


/* ==================================================
   DOM ELEMENTS
================================================== */
const backHomeButton =
    document.getElementById("back-home-button");

const playerProfileModal =
    document.getElementById("player-profile-modal");

const closePlayerProfileButton =
    document.getElementById("close-player-profile");

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

/* ---------- Public Profile Data ---------- */

const publicProfileBanner =
    document.getElementById("public-profile-banner-image");

const publicProfileAvatar =
    document.getElementById("public-profile-avatar");

const publicProfileName =
    document.getElementById("public-profile-name");

const publicProfileUID =
    document.getElementById("public-profile-uid");

const publicProfileBio =
    document.getElementById("public-profile-bio-text");

const publicStatAccuracy =
    document.getElementById("public-stat-accuracy");

const publicStatStreak =
    document.getElementById("public-stat-streak");

const publicStatSurvival =
    document.getElementById("public-stat-survival");

const publicProfileActions =
    document.getElementById("public-profile-actions");

/* ---------- Remove Friend Modal ---------- */

const removeFriendModal =
    document.getElementById("remove-friend-modal");

const removeFriendMessage =
    document.getElementById("remove-friend-message");

const cancelRemoveFriendButton =
    document.getElementById("cancel-remove-friend");

const confirmRemoveFriendButton =
    document.getElementById("confirm-remove-friend");


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
    await loadFriends();
    await loadFriendRequests();

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

    const {data, error} =
        await supabaseClient.rpc(
            "get_friends"
        );

    if (error) {

        console.error(
            "Failed to load friends:",
            error
        );

        return;
    }

    displayFriends(data);

    friendCount.textContent =
        data.length;
}


function displayFriends(friends) {

    // Remove anything currently displayed
    friendsList.innerHTML = "";


    // No friends
    if (friends.length === 0) {

        friendsList.innerHTML = `
            <div class="friends-empty">
                <h3>No Friends Yet</h3>
                <p>Search for a Player UID to add someone.</p>
            </div>
        `;

        return;
    }


    // Create one row for every friend
    friends.forEach(function (friend) {

        /* ---------- ROW ---------- */

        const row =
            document.createElement("div");

        row.classList.add("friend-row");


        /* ---------- AVATAR ---------- */

        const avatar =
            document.createElement("img");

        avatar.classList.add("friend-avatar");

        avatar.src =
            `assets/avatars/${friend.avatar_id}.webp`;

        avatar.alt =
            "Player Avatar";


        /* ---------- PLAYER DETAILS ---------- */

        const details =
            document.createElement("div");

        details.classList.add("friend-details");


        const name =
            document.createElement("span");

        name.classList.add("friend-name");

        name.textContent =
            friend.display_name;


        const uid =
            document.createElement("span");

        uid.classList.add("friend-uid");

        uid.textContent =
            `UID ${friend.player_uid}`;


        details.appendChild(name);
        details.appendChild(uid);


        /* ---------- VIEW PROFILE BUTTON ---------- */

        const viewProfileButton =
            document.createElement("button");

        viewProfileButton.classList.add(
            "view-profile-button"
        );

        viewProfileButton.textContent =
            "View Profile";

        viewProfileButton.type =
            "button";


        /* ---------- MORE OPTIONS ---------- */

        const moreArea =
            document.createElement("div");

        moreArea.classList.add(
            "friend-more-area"
        );


        const moreButton =
            document.createElement("button");

        moreButton.classList.add(
            "friend-more-button"
        );

        moreButton.type =
            "button";

        moreButton.textContent =
            "⋯";

        moreButton.setAttribute(
            "aria-label",
            "Friend options"
        );


        const moreMenu =
            document.createElement("div");

        moreMenu.classList.add(
            "friend-more-menu",
            "hidden"
        );


        const removeFriendButton =
            document.createElement("button");

        removeFriendButton.classList.add(
            "remove-friend-option"
        );

        removeFriendButton.type =
            "button";

        removeFriendButton.textContent =
            "Remove Friend";


        /* ---------- MORE MENU EVENTS ---------- */

        moreButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                const wasOpen =
                    !moreMenu.classList.contains(
                        "hidden"
                    );

                // Close every friend's menu first
                closeAllFriendMenus();

                // If this one wasn't already open,
                // open it now
                if (!wasOpen) {

                    moreMenu.classList.remove(
                        "hidden"
                    );

                }

            }
        );


        removeFriendButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                closeAllFriendMenus();

                openRemoveFriendConfirmation(
                    friend
                );

            }
        );


        /* ---------- PROFILE EVENTS ---------- */

        avatar.addEventListener(
            "click",
            function () {

                openPlayerProfile(
                    friend.player_uid
                );

            }
        );


        details.addEventListener(
            "click",
            function () {

                openPlayerProfile(
                    friend.player_uid
                );

            }
        );


        viewProfileButton.addEventListener(
            "click",
            function () {

                openPlayerProfile(
                    friend.player_uid
                );

            }
        );


        /* ---------- BUILD MORE MENU ---------- */

        moreMenu.appendChild(
            removeFriendButton
        );

        moreArea.appendChild(
            moreButton
        );

        moreArea.appendChild(
            moreMenu
        );


        /* ---------- BUILD ROW ---------- */

        row.appendChild(avatar);
        row.appendChild(details);
        row.appendChild(
            viewProfileButton
        );
        row.appendChild(moreArea);


        /* ---------- ADD ROW TO PAGE ---------- */

        friendsList.appendChild(row);

    });
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


    const { data, error } =
        await supabaseClient.rpc(
            "get_public_player_profile",
            {
                p_player_uid: playerUID
            }
        );


    if (error) {

        console.error(
            "Failed to search player:",
            error
        );

        searchResult.innerHTML = `
            <div class="friends-empty">
                <h3>Player not found</h3>
                <p>Check the Player UID and try again.</p>
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        searchResult.innerHTML = `
            <div class="friends-empty">
                <h3>Player not found</h3>
                <p>Check the Player UID and try again.</p>
            </div>
        `;

        return;
    }


    displaySearchResult(
        data[0]
    );
}


function displaySearchResult(player) {

    searchResult.innerHTML = "";


    /* ---------- CARD ---------- */

    const card =
        document.createElement("div");

    card.classList.add(
        "search-result-card"
    );


    /* ---------- AVATAR ---------- */

    const avatar =
        document.createElement("img");

    avatar.classList.add(
        "friend-avatar"
    );

    avatar.src =
        `assets/avatars/${player.avatar_id}.webp`;

    avatar.alt =
        "Player Avatar";


    /* ---------- DETAILS ---------- */

    const details =
        document.createElement("div");

    details.classList.add(
        "friend-details"
    );


    const name =
        document.createElement("span");

    name.classList.add(
        "friend-name"
    );

    name.textContent =
        player.display_name;


    const uid =
        document.createElement("span");

    uid.classList.add(
        "friend-uid"
    );

    uid.textContent =
        `UID ${player.player_uid}`;


    details.appendChild(name);
    details.appendChild(uid);


    /* ---------- ACTION AREA ---------- */

    const actions =
        document.createElement("div");

    actions.classList.add(
        "search-result-actions"
    );


    /* ---------- VIEW PROFILE ---------- */

    const viewProfileButton =
        document.createElement("button");

    viewProfileButton.classList.add(
        "view-profile-button"
    );

    viewProfileButton.type =
        "button";

    viewProfileButton.textContent =
        "View Profile";


    /* ---------- PROFILE EVENTS ---------- */

    avatar.addEventListener(
        "click",
        function () {

            openPlayerProfile(
                player.player_uid
            );

        }
    );


    details.addEventListener(
        "click",
        function () {

            openPlayerProfile(
                player.player_uid
            );

        }
    );


    viewProfileButton.addEventListener(
        "click",
        function () {

            openPlayerProfile(
                player.player_uid
            );

        }
    );


    actions.appendChild(
        viewProfileButton
    );


    /* ==================================================
       RELATIONSHIP ACTION
    ================================================== */


    /* ---------- YOURSELF ---------- */

    if (player.relationship === "self") {

        const selfButton =
            document.createElement("button");

        selfButton.classList.add(
            "add-friend-button"
        );

        selfButton.textContent =
            "You";

        selfButton.disabled = true;

        actions.appendChild(
            selfButton
        );

    }


    /* ---------- ALREADY FRIENDS ---------- */

    else if (
        player.relationship === "friends"
    ) {

        const friendsButton =
            document.createElement("button");

        friendsButton.classList.add(
            "add-friend-button"
        );

        friendsButton.textContent =
            "Friends ✓";

        friendsButton.disabled = true;

        actions.appendChild(
            friendsButton
        );

    }


    /* ---------- REQUEST SENT ---------- */

    else if (
        player.relationship ===
        "outgoing_request"
    ) {

        const requestSentButton =
            document.createElement("button");

        requestSentButton.classList.add(
            "add-friend-button"
        );

        requestSentButton.textContent =
            "Request Sent";

        requestSentButton.disabled = true;

        actions.appendChild(
            requestSentButton
        );

    }


    /* ---------- INCOMING REQUEST ---------- */

    else if (
        player.relationship ===
        "incoming_request"
    ) {

        const declineButton =
            document.createElement("button");

        declineButton.classList.add(
            "decline-request-button"
        );

        declineButton.type =
            "button";

        declineButton.textContent =
            "Decline";


        const acceptButton =
            document.createElement("button");

        acceptButton.classList.add(
            "accept-request-button"
        );

        acceptButton.type =
            "button";

        acceptButton.textContent =
            "Accept";


        declineButton.addEventListener(
            "click",
            async function () {

                await declineFriendRequest(
                    player.request_id
                );

                await searchPlayer();

            }
        );


        acceptButton.addEventListener(
            "click",
            async function () {

                await acceptFriendRequest(
                    player.request_id
                );

                await searchPlayer();

            }
        );


        actions.appendChild(
            declineButton
        );

        actions.appendChild(
            acceptButton
        );

    }


    /* ---------- NOT FRIENDS ---------- */

    else if (
        player.relationship === "none"
    ) {

        const addFriendButton =
            document.createElement("button");

        addFriendButton.classList.add(
            "add-friend-button"
        );

        addFriendButton.type =
            "button";

        addFriendButton.textContent =
            "Add Friend";


        addFriendButton.addEventListener(
            "click",
            async function () {

                await sendFriendRequest(
                    player.player_uid,
                    addFriendButton
                );

            }
        );


        actions.appendChild(
            addFriendButton
        );

    }


    /* ---------- BUILD CARD ---------- */

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

    const {error} =
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

    const {data, error} =
        await supabaseClient.rpc(
            "get_incoming_friend_requests"
        );

    if (error) {

        console.error(
            "Failed to load friend requests:",
            error
        );

        return;
    }

    displayFriendRequests(data);
    updateFriendsNotification(data.length);
}

function displayFriendRequests(requests) {

    // Clear whatever was previously displayed
    requestsList.innerHTML = "";

    // If there are no requests
    if (requests.length === 0) {

        requestsList.innerHTML = `
            <div class="friends-empty">
                <h3>No Friend Requests</h3>
                <p>You don't have any incoming friend requests.</p>
            </div>
        `;

        return;
    }


    // Build one row for each request
    requests.forEach(function (request) {

        const row =
            document.createElement("div");

        row.classList.add("request-row");

        const avatar =
            document.createElement("img");

        avatar.classList.add("friend-avatar");

        avatar.src =
            `assets/avatars/${request.avatar_id}.webp`;

        avatar.alt =
            "Player Avatar";

        const details =
            document.createElement("div");

        details.classList.add("friend-details");

        const name =
            document.createElement("span");

        name.classList.add("friend-name");

        name.textContent =
            request.display_name;


        const uid =
            document.createElement("span");

        uid.classList.add("friend-uid");

        uid.textContent =
            `UID ${request.player_uid}`;

        details.appendChild(name);
        details.appendChild(uid);

        avatar.addEventListener("click", function () {
            openPlayerProfile(request.player_uid);
        });

        details.addEventListener("click", function () {
            openPlayerProfile(request.player_uid);
        });

        const actions =
            document.createElement("div");

        actions.classList.add("request-actions");


        const acceptButton =
            document.createElement("button");

        acceptButton.classList.add(
            "accept-request-button"
        );

        acceptButton.textContent =
            "Accept";


        const declineButton =
            document.createElement("button");

        declineButton.classList.add(
            "decline-request-button"
        );

        declineButton.textContent =
            "Decline";

        acceptButton.addEventListener("click", function () {

            acceptFriendRequest(
                request.request_id
            );

        });


        declineButton.addEventListener("click", function () {

            declineFriendRequest(
                request.request_id
            );

        });

        actions.appendChild(acceptButton);
        actions.appendChild(declineButton);

        row.appendChild(avatar);
        row.appendChild(details);
        row.appendChild(actions);

        requestsList.appendChild(row);

    });
}

async function openPlayerProfile(playerUID) {

    const {data, error} =
        await supabaseClient.rpc(
            "get_public_player_profile",
            {
                p_player_uid: playerUID
            }
        );

    if (error) {

        console.error(
            "Failed to load player profile:",
            error
        );

        return;
    }

    if (!data || data.length === 0) {
        return;
    }

    const player = data[0];


    /* ---------- Profile Information ---------- */

    publicProfileBanner.src =
        `assets/banners/${player.banner_id}.webp`;

    publicProfileAvatar.src =
        `assets/avatars/${player.avatar_id}.webp`;

    publicProfileName.textContent =
        player.display_name;

    publicProfileUID.textContent =
        `UID ${player.player_uid}`;

    publicProfileBio.textContent =
        player.bio || "No bio set.";


    /* ---------- Statistics ---------- */

    publicStatAccuracy.textContent =
        player.accuracy === null
            ? "—"
            : `${player.accuracy}%`;

    publicStatStreak.textContent =
        player.current_streak === null
            ? "—"
            : player.current_streak;

    publicStatSurvival.textContent =
        player.best_survival === null
            ? "—"
            : player.best_survival;


    /* ---------- Relationship ---------- */

    displayProfileActions(player);


    /* ---------- Open Modal ---------- */

    playerProfileModal.classList.remove(
        "hidden"
    );
}

function displayProfileActions(player) {

    publicProfileActions.innerHTML = "";


    /* ---------- Your Own Profile ---------- */

    if (player.relationship === "self") {
        return;
    }


    /* ---------- Already Friends ---------- */

    if (player.relationship === "friends") {

        const button =
            document.createElement("button");

        button.classList.add(
            "public-profile-secondary-action"
        );

        button.textContent =
            "Friends ✓";

        button.disabled = true;

        publicProfileActions.appendChild(
            button
        );

        return;
    }


    /* ---------- Request Already Sent ---------- */

    if (
        player.relationship ===
        "outgoing_request"
    ) {

        const button =
            document.createElement("button");

        button.classList.add(
            "public-profile-secondary-action"
        );

        button.textContent =
            "Request Sent";

        button.disabled = true;

        publicProfileActions.appendChild(
            button
        );

        return;
    }


    /* ---------- They Sent You A Request ---------- */

    if (
        player.relationship ===
        "incoming_request"
    ) {

        const declineButton =
            document.createElement("button");

        declineButton.classList.add(
            "public-profile-secondary-action"
        );

        declineButton.textContent =
            "Decline";


        const acceptButton =
            document.createElement("button");

        acceptButton.classList.add(
            "public-profile-primary-action"
        );

        acceptButton.textContent =
            "Accept";


        declineButton.addEventListener(
            "click",
            async function () {

                await declineFriendRequest(
                    player.request_id
                );

                playerProfileModal.classList.add(
                    "hidden"
                );
            }
        );


        acceptButton.addEventListener(
            "click",
            async function () {

                await acceptFriendRequest(
                    player.request_id
                );

                playerProfileModal.classList.add(
                    "hidden"
                );
            }
        );


        publicProfileActions.appendChild(
            declineButton
        );

        publicProfileActions.appendChild(
            acceptButton
        );

        return;
    }


    /* ---------- Not Friends ---------- */

    if (player.relationship === "none") {

        const addButton =
            document.createElement("button");

        addButton.classList.add(
            "public-profile-primary-action"
        );

        addButton.textContent =
            "Add Friend";


        addButton.addEventListener(
            "click",
            async function () {

                await sendFriendRequest(
                    player.player_uid,
                    addButton
                );

            }
        );


        publicProfileActions.appendChild(
            addButton
        );
    }
}

/* ==================================================
   ACCEPT FRIEND REQUEST
================================================== */

async function acceptFriendRequest(requestID) {

    const {error} =
        await supabaseClient.rpc(
            "accept_friend_request",
            {
                p_request_id: requestID
            }
        );

    if (error) {

        console.error(
            "Failed to accept friend request:",
            error
        );

        return;
    }

    await loadFriendRequests();
    await loadFriends();
}


/* ==================================================
   DECLINE FRIEND REQUEST
================================================== */

async function declineFriendRequest(requestID) {

    const {error} =
        await supabaseClient.rpc(
            "decline_friend_request",
            {
                p_request_id: requestID
            }
        );

    if (error) {

        console.error(
            "Failed to decline friend request:",
            error
        );

        return;
    }

    await loadFriendRequests();
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
   FRIEND REMOVAL
================================================== */

function openRemoveFriendConfirmation(friend) {

    friendPendingRemoval = friend;

    removeFriendMessage.textContent =
        `Are you sure you want to remove ${friend.display_name} from your friends?`;

    removeFriendModal.classList.remove(
        "hidden"
    );
}

function closeAllFriendMenus() {

    const menus =
        document.querySelectorAll(
            ".friend-more-menu"
        );

    menus.forEach(function (menu) {
        menu.classList.add("hidden");
    });
}

async function removeFriend(playerUID) {

    const {error} =
        await supabaseClient.rpc(
            "remove_friend",
            {
                p_player_uid: playerUID
            }
        );

    if (error) {

        console.error(
            "Failed to remove friend:",
            error
        );

        return false;
    }


    await loadFriends();

    return true;
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
   PUBLIC PROFILE MODAL LISTENERS
================================================== */

closePlayerProfileButton.addEventListener(
    "click",
    function () {

        playerProfileModal.classList.add(
            "hidden"
        );

    }
);


playerProfileModal.addEventListener(
    "click",
    function (event) {

        if (event.target === playerProfileModal) {

            playerProfileModal.classList.add(
                "hidden"
            );

        }

    }
);

/* ==================================================
   FRIEND REMOVAL LISTENERS
================================================== */
cancelRemoveFriendButton.addEventListener(
    "click",
    function () {

        removeFriendModal.classList.add(
            "hidden"
        );

        friendPendingRemoval = null;

    }
);

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                ".friend-more-area"
            )
        ) {
            closeAllFriendMenus();
        }

    }
);

confirmRemoveFriendButton.addEventListener(
    "click",
    async function () {

        if (friendPendingRemoval === null) {
            return;
        }


        const success =
            await removeFriend(
                friendPendingRemoval.player_uid
            );


        if (!success) {
            return;
        }


        removeFriendModal.classList.add(
            "hidden"
        );

        friendPendingRemoval = null;

    }
);

removeFriendModal.addEventListener(
    "click",
    function (event) {

        if (event.target === removeFriendModal) {

            removeFriendModal.classList.add(
                "hidden"
            );

            friendPendingRemoval = null;

        }

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