function InputMinimalistStyle(styles = {}) {
    return {
        webKitApparence: "none",
        mozApparence: "none",
        msApparence: "none",
        oApparence: "none",
        apparence: "none",
        border: "0px",
        outline: "none",
        ...styles,
    };
}

function Input(domOptions={}, target) {
    return domCreator("input", {
        style: domOptions.style || {},
        attribute: domOptions.attribute || {},
        classList: domOptions.classList || {},
        dataset: domOptions.dataset || {},
        event: [
            {
                event: "keyup",
                channel: "#change",
                mapper: e => e.target.value,
            },
            {
                event: "keyup",
                channel: "#text",
                mapper: e => e.target.value, 
                activer: e => !!e.target.value
            },
            {
                event: "keyup",
                channel: "#empty",
                mapper: e => e.target.value, 
                activer: e => !e.target.value
            },
            {
                event: "keyup",
                channel: "#submit",
                mapper: e => e.target.value, 
                activer: e => e.key === "Enter"
            },
            ...(domOptions.event || [])
        ],
        state: [
            { 
                event: "#change",
                state: "text-change"
            },
            { 
                event: "#submit",
                state: "text-submit"
            },
            ...(domOptions.state || []) 
        ]
    }, target);
}