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

function clickEvent(callback) {
    return element => {
        element.addEventListener("click", e => {
            const result = callback(e);
            element.dataset.result = JSON.stringify(result);
        });
    };
};