function Button() {
    return inlineHTML(`
        <style>
            body {
                background-color: green;
            }
        </style>
        <style>
            .my-button {
                color: red;
            }
        </style>
        <button class="my-button">Hello world</button>
    `);
}