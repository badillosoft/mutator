// Mutator JS
// Author: Alan Badillo Salas
// Email: badillo.soft@hotmail.com
// Github Account: badillosoft
// Github Repository: https://github.com/badillosoft/mutator
// Versión 1.0.0 (alpha)
// Revitions:
// - 2019/05/02 (v1.0 rev1)
// * Add `mutate(element)`
// * Add `async loadComponent(name[, baseURL, ext])`
// * Add `async run([async ]callback)`
// * Add `inlineHTML(html)`
// * Add `domStyle(styles)`
// * Add `domAttribute(attributes)`
// * Add `domDataset(datasets[, raw])`
// * Add `domClassList(...classNames)`
// * Add `domMapEvent(event, channel[, mapper])`
// * Add `domEventToState(event, state[, mapper, raw])`
// * Add `domStateToEvent(state, channel[, mapper, raw])`
// * Add `domProxyEvent(query, event, channel[, mapper])`
// - 2019/05/02 (v1.0 rev2)
// * Add this commentaries

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

async function loadComponents (name, baseURL="./", ext=".js") {
    window.mutator = window.mutator || {};
    const cache = window.mutator.cache = window.mutator.cache || {};
    const url = `${baseURL}/${name}${ext}`;
    if (url in cache) {
        continue;
    }
    cache[url] = new Date();
    const script = document.createElement("script");
    script.src = url;
    document.body.prepend(script);
    await new Promise(resolve => script.addEventListener("load", resolve));
};


async function run(...callbacks) {
    let input = null;
    for (let callback of callbacks) {
        input = await callback(input);
    }
    return input;
}

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
		for (let [className, mode] of Object.entries(classNames || {})) {
			element.classList[mode](className);
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