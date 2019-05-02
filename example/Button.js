function Button() {
    return mutate("button")(
        parent => {
            parent.innerText = "hello world";

            parent.addEventListener("click", () => {
                alert("hi");
            });
        }
    );
}