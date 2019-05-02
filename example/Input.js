function Input() {
    return inlineHTML(`<input placeholder="type here...">`)(
        parent => {
            console.log(parent);

            const input = parent.querySelector("input");

            input.addEventListener("keyup", e => {
                e.key !== "Enter" || alert(input.value);
                parent.dataset.value = input.value;
            });
        }
    );
}