let req = new XMLHttpRequest();
req.open("POST", "https://lilo.northernsi.de/blog/post", true);
req.setRequestHeader("Accept", "application/json");
req.setRequestHeader("Content-Type", "application/json");

req.onload = () => {
    switch (req.status) {
        case 200:
            document.location.href = JSON.parse(req.responseText).id;
            break;
        default:
            alert("An error occurred.");
            break;
    }
}

req.onerror = () => {
    alert("An error occurred.");
}

function createBlog(title, message) {
    req.send(JSON.stringify({
        "title": title,
        "message": message
    }));
}