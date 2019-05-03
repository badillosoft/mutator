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
// - 2019/05/02 (v1.0 rev3)
// * Add `domEventCallback(event, callback)`
// * Remove `console.log` on `mutate`
// * Change `loadComponents` to `load`
// * Documentation of methods

/**
 * <strong>Aplicador</strong> Muta un elemento cualquiera mediante mutadores. La función 
 * encapsula un elemento y devuelve una segunda función que recibe en sus parámetros
 * mutadores (funciones de mutación) y se las aplica al elemento encapsulado.
 * @param {HTMLElement | string | any} element Elemento a mutar mediante los mutadores
 * @returns {function} Aplicador de mutadores
 * @example <caption>Sintaxis</caption>
 * // mutate(element)(
 * //   mutator_1(...config_1),
 * //   mutator_2(...config_2),
 * //   ...,
 * //   mutator_N(...config_N),
 * //);
 * mutate("button")(
 *  domAttribute({ innerText: "click here!" }),
 *  domStyle({ color: "blue" }),
 *  domEventCallback("click", () => alert("hi")),
 * );
 * @example <caption>Crear un aplicador a partir de un <code>string</code> sin mutadores</caption>
 * const button = mutate("button")();
 * document.body.appendChild(button);
 * @example <caption>Crear un aplicador a partir de un <code>string</code> con mutadores</caption>
 * const button = mutate("button")(
 *  domStyle({ color: "cornflowerblue" }),
 *  domAttribute({ innerText: "Hello world" }),
 * );
 * document.body.appendChild(button);
 * @example <caption>Crear una función que devuelva un aplicador configurado</caption>
 * const Button = (text, color) => mutate("button")(
 *  domStyle({ color }),
 *  domAttribute({ innerText: text }),
 * );
 * const button = Button("hello world", "crimson");
 * document.body.appendChild(button);
 * @example <caption>Aplicar mutadores a un elemento <code>DOM</code> existente</caption>
 * const button = document.createElement("button");
 * mutate(button)(
 *  domAttribute({ innerText: "hey you!" });
 * );
 * document.body.appendChild(button);
 */
function mutate(element) {
    element = typeof element === "string" ? document.createElement(element) : element;
    return (...mutators) => {
        mutators
            .reduce((muts, mut) => mut instanceof Array ? [...muts, ...mut] : [...muts, mut], [])
            .forEach(mutator => mutator(element));
        return element;
    };
};

/**
 * Genera una etiqueta <code>script</code> que carga el archivo desde la url. La url base por
 * defecto es relativa al archivo HTML que llama a los componentes, sin embargo, se puede
 * mandar a llamar cualquier CDN que almacene el script. Si la url ya ha sido consultada
 * previamente será ignorada.
 * @param {string} name Nombre físico del componente (nombre del archivo o ruta)
 * @param {string} baseURL Url de la ruta anterios al nombre del archivo
 * @param {string} ext Extensión del archivo
 * @example <caption>Cargar un <code>script</code> local</caption>
 * run(async () => {
 *  await load("example/Button");
 *  const button = Button();
 *  document.appendChild(button);
 * })
 * @example <caption>Cargar un <code>script</code> remoto</caption>
 * run(async () => {
 *  await load("https://cdn.jsdelivr.net/gh/badillosoft/mutator@master/example/Button");
 *  const button = Button();
 *  document.appendChild(button);
 * })
 */
async function load(name, baseURL = "./", ext = ".js") {
    window.mutator = window.mutator || {};
    const cache = window.mutator.cache = window.mutator.cache || {};
    const url = `${baseURL}/${name}${ext}`;
    if (url in cache) {
        return;
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

function domDataset(datasets, raw = false) {
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

function domEventCallback(event, callback) {
    return element => {
        element.addEventListener(event, callback);
    };
}

function domMapEvent(event, channel, mapper = (e => e)) {
    return element => {
        element.addEventListener(event, e => {
            const detail = e instanceof CustomEvent ? e.detail : e;
            element.dispatchEvent(new CustomEvent(channel, {
                detail: mapper(detail)
            }));
        });
    };
}

function domEventToState(event, state, mapper = (e => e), raw = false) {
    return element => {
        element.addEventListener(event, e => {
            const detail = e instanceof CustomEvent ? e.detail : e;
            const result = mapper(detail);
            domDataset({ [state]: JSON.stringify(result) }, raw);
        });
    };
}

function domStateToEvent(state, channel, mapper = (e => e), raw = false) {
    return element => {
        const detail = JSON.parse(element.getAttribute(raw ? `data-${state}` : state));
        element.dispatchEvent(new CustomEvent(channel, {
            detail: mapper(detail)
        }))
    };
}

function domProxyEvent(query, event, channel, mapper = (e => e)) {
    return element => {
        const child = element.querySelectorAll(query);
        child && child.addEventListener(event, e => {
            element.dispatchEvent(new CustomEvent(channel, {
                detail: mapper(e)
            }));
        });
    };
}