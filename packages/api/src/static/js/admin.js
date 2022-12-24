let mute = new XMLHttpRequest();
mute.open("POST", `${/[^/]*$/.exec(document.location.href)[0]}/remove`, true);
mute.setRequestHeader("Accept", "application/json");
mute.setRequestHeader("Content-Type", "application/json");

let remove = new XMLHttpRequest();
remove.open("POST", `${/[^/]*$/.exec(document.location.href)[0]}/remove`, true);
remove.setRequestHeader("Accept", "application/json");
remove.setRequestHeader("Content-Type", "application/json");

mute.onload = () => {
    switch (req.status) {
        case 200:
            window.location.reload(false);
            break;
        default:
            alert("An error occurred.");
            window.location.reload(false);
            break;
    }
}

remove.onload = () => {
    switch (req.status) {
        case 200:
            window.location.reload(false);
            break;
        default:
            alert("An error occurred.");
            window.location.reload(false);
            break;
    }
}

mute.onerror = () => {
    alert("An error occurred.");
    window.location.reload(false);
}

remove.onerror = () => {
    alert("An error occurred.");
    window.location.reload(false);
}

function muteServer(address) {
    mute.send(JSON.stringify({
        "address": address
    }));
}

function removeServer(address) {
    remove.send(JSON.stringify({
        "address": address
    }));
}