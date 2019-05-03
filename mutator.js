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

function domAttribute(attributes) {
	return element => {
		for (let [key, value] of Object.entries(attributes || {})) {
			element[key] = value;
		}
	};
};

function domDataset(datasets, raw=false) {
	return element => {
		for (let [key, value] of Object.entries(datasets || {})) {
            if (raw) {
                element.setAttribute(`data-${key}`, value);
                continue;
            }
            element.dataset[key] = value;
		}
	};
};

function domClassList(classNames) {
	return element => {
		for (let [key, value] of Object.entries(classNames || {})) {
			element.classList[value ? "add" : "remove"](key);
		}
	};
};

function domMapEvent(event, channel, mapper=(e => e)) {
    return element => {
        element.addEventListener(event, e => {
            const detail = e instanceof CustomEvent ? e.detail : e;
            element.dispatchEvent(new CustomEvent(channel, {
                detail: mapper(detail)
            }));
        });
    };
}

function domEventToState(event, state, mapper=(e => e), raw=false) {
    return element => {
        element.addEventListener(event, e => {
            const detail = e instanceof CustomEvent ? e.detail : e;
            const result = mapper(detail);
            domDataset({ [state]: JSON.stringify(result) }, raw);
        });
    };
}

function domStateToEvent(state, channel, mapper=(e => e), raw=false) {
    return element => {
        const detail = JSON.parse(element.getAttribute( raw ? `data-${state}` : state));
        element.dispatchEvent(new CustomEvent(channel, {
            detail: mapper(detail)
        }))
    };
}

function domProxyEvent(query, event, channel, mapper=(e => e)) {
    return element => {
        const child = element.querySelectorAll(query);
        child && child.addEventListener(event, e => {
            element.dispatchEvent(new CustomEvent(channel, {
                detail: mapper(e)
            }));
        });
    };
}