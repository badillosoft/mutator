function addClassListStyle(className) {
    return element => {
        element.classList.add(className);
    };
};

function removeClassListStyle(className) {
    return element => {
        element.classList.remove(className);
    };
};

function colorStyle(color) {
    return element => {
        element.style.color = color;
    };
};

function textContent(text) {
    return element => {
        element.innerText = text || "text";
    };
};

function addImage(url) {
    const image = document.createElement("img");
    image.src = url;
    return element => {
        element.appendChild(image);
    };
};

function galleryStyle() {
    return element => {
        element.style.display = "flex";
        element.style.flexWrap = "warp";
    };
};

function clickEvent(callback) {
    return element => {
        element.addEventListener("click", e => {
            const result = callback(e);
            element.dataset.result = JSON.stringify(result);
        });
    };
};