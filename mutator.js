const _cache = {};

async function run(...callbacks) {
    let input = null;
    for (let callback of callbacks) {
        input = await callback(input);
    }
    return input;
}

async function loadComponents (names, baseURL="./", ext=".js") {
    for (let name of (names || [])) {
        let url = `${baseURL}/${name}${ext}`;
        if (url in _cache) {
            continue;
        }
        _cache[url] = true;
        let script = document.createElement("script");
        script.src = url;
        document.body.prepend(script);
        await new Promise(resolve => script.addEventListener("load", resolve));
    }
};

function mutate (element) {
    element = typeof element === "string" ? document.createElement(element) : element; 
    return (...mutators) => {
        console.log(mutators
            .reduce((muts, mut) => mut instanceof Array ? [...muts, ...mut] : [...muts, mut], []));
        mutators
            .reduce((muts, mut) => mut instanceof Array ? [...muts, ...mut] : [...muts, mut], [])
            .forEach(mutator => mutator(element));
        return element;
    };
};

function inlineHTML(html) {
    const div = document.createElement("div");
    // div.hidden = true;
    // document.body.appendChild(div);
    // div.innerHTML = html;
    const range = document.createRange();
    const fragment = range.createContextualFragment(html);
    console.log(fragment);
    // range.selectNode(div);
    div.appendChild(fragment);
    return mutate(div);
};

function domStyle(styles) {
	return element => {
		for (let [key, value] of Object.entries(styles || {})) {
			element.style[key] = value;
		}
	};
};

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

function lockElement(query) {
    return element => {
        const child = element.querySelector(query);
        if (child) {
            element.addEventListener("@lock", () => {
                child.disabled = true;
            });
            element.addEventListener("@unlock", () => {
                child.disabled = false;
            });
        }
    };
};

function lockElements(query) {
    return element => {
        const children = element.querySelectorAll(query);
        for (let child of (children || [])) {
            element.addEventListener("@lock", () => {
                child.disabled = true;
            });
            element.addEventListener("@unlock", () => {
                child.disabled = false;
            });
        }
    };
};