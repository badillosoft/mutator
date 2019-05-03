// Mutator JS
// Author: Alan Badillo Salas
// Email: badillo.soft@hotmail.com
// Github Account: badillosoft
// Github Repository: https://github.com/badillosoft/mutator
// Versión 1.0.0 (alpha)
// Changelog:
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
// - 2019/05/03 (v1.0 rev4)
// * Change `inlineHTML(html)`
// - 2019/05/03 (v1.0 rev5)
// * Add `domTarget([target])`
// * Add `domDelegate(query, ...mutators)`
// * Add `domRegistry(registers)`

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

/**
 * Ejecuta una serie de funciones, propagando una entrada nula, la cuál se actualiza
 * con el valor retornado por el callback y es pasado al siguiente. Si el callback
 * es asíncrono o devuelve una promesa, este esperará a que termine antes de
 * ejecutar el siguiente.
 * @param  {...any} callbacks Funciones a ejecutar, opcionalmente asíncronas
 * @returns {any} El resultado transformado de la cadena de ejecuciones
 * @example <caption>Ejecuta una función asíncrona que espera la carga de un <code>script</code></caption>
 * run(async () => {
 *  await load("example/Button");
 *  // TODO: Utilizar Button()
 * });
 * @example <caption>Espera a que se descarguen una serie de <code>scripts</code></caption>
 * run(() => {
 *  return Promise.all([
 *      load("example/Button"),
 *      load("example/Input"),
 *      // load more...
 *  ]);
 * }, () => {
 *  // TODO: Usar las funciones definidas en los scripts cargados previamente
 * });
 */
async function run(...callbacks) {
    let input = null;
    for (let callback of callbacks) {
        input = await callback(input);
    }
    return input;
}

/**
 * Crea un elemento DOM a partir de un fragmento HTML. Estos serán contenidos en un div por lo
 * que no es necesario definir un div principal. Si se define un query, en lugar de devolver
 * el div principal, buscará mediante query selector el elemento específico y lo devolverá.
 * De este modo se podrá usar una parte específica del fragmento HTML.
 * @param {string} html Fragmento HTML que representa la interfaz. Serán contenidos en un div
 * @param {string} query Query opcional para devolver un elemento específico usando `querySelector`
 * @returns {HTMLElement} Elemento DOM con un div que contiene la maquetación del fragmento
 * @example <caption>Crear un elemento DOM a partir de un fragmento HTML</caption>
 * const button = inlineHTML(`<button>hello</button>`);
 * // button es `<div><button>hello</button></div>`
 * @example <caption>Crear un elemento DOM a partir de un fragmento HTML usando un query</caption>
 * const button = inlineHTML(`<button>hello</button>`, "button");
 * // button es `<button>hello</button>`
 * @example <caption>Colocar una imagen el el body</caption>
 * const image = inlineHTML(`<img src="http://placehold.it/400">`, "img");
 * document.body.appendChild(image);
 */
function inlineHTML(html, query=null, ...mutators) {
    const div = document.createElement("div");
    // div.hidden = true;
    // document.body.appendChild(div);
    // div.innerHTML = html;
    const range = document.createRange();
    const fragment = range.createContextualFragment(html);
    //console.log(fragment);
    // range.selectNode(div);
    div.appendChild(fragment);

    const divSelected = query ? div.querySelector(query) : div;

    const divSelectedMutator = mutate(divSelected);

    divSelectedMutator(...mutators);

    return divSelected;
};

/**
 * Agrega los estilos especificados en el objeto de estilos. Cada clave equivale a los estilos
 * usados en DOM, por ejemplo, `color`, `backgroundColor`, `justifyContent`. Observa que son
 * las mismas propiedades que en CSS, sólo que al estilo datasets, usando la notación cammelCase
 * en lugar de guiones `-`. Los mutadores pueden ser aplicados mediante {@link mutate} o individualmente.
 * @param {Object.<string, string>} styles Objeto de estilos, cada clave equivale a element.style.keyName
 * @returns {function} Devuelve un mutador que puede ser utilizado por {@link mutate}
 * @example <caption>Muta los estilos de un botón</caption>
 * const button = inlineHTML(`<button>hello world</button>`, "button");
 * mutate(button)(domStyle({ backgroundColor: "black", color: "white", "border": "4px solid red" }));
 * @example <caption>Muta los estilos de una imagen</caption>
 * const image = inlineHTML(`<img src="http://placekitten.com/400">`, "img");
 * // Observa que el mutador se puede aplicar individualemente
 * domStyle({ border: "10px solid white", boxShadow: "0px 0px 4px 4px rgba(0, 0, 0, 0.2)" })(image);
 * @example <caption>Reutiliza un mutador</caption>
 * const imageMutator = domStyle({ border: "10px solid white", boxShadow: "0px 0px 4px 4px rgba(0, 0, 0, 0.2)" });
 * const image1 = inlineHTML(`<img src="http://placekitten.com/400">`, "img");
 * const image2 = inlineHTML(`<img src="http://placekitten.com/500">`, "img");
 * // Observa que el mutador se puede aplicar individualemente
 * imageMutator(image1);
 * imageMutator(image2);
 */
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

function domTarget(target=null) {
    return element => {
        if (typeof target === "string") {
            target = document.querySelector(target);
        }
        target = target || document.body;
        target.appendChild(element);
    };
}

function domRegistry(registers) {
    return element => {
        for (let [id, query] of Object.entries(registers)) {
            let i = 0;
            for (let child of [...(element.querySelectorAll(query) || [])]) {
                child.setAttribute(`data-id`, `${id}-${i++}`);
            }
        }
    };
};

function domDelegate(query, ...mutators) {
    return element => {
        for (let child of [...(element.querySelectorAll(query) || [])]) {
            let childMutator = mutate(child);
            childMutator(...mutators);
        }
    };
}