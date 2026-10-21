
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("brewing-question-form");
    const result = document.getElementById("brewing-question-form-result");
    const error = document.getElementById("brewing-question-form-error");
    const status = form ? form.querySelector(".small[aria-live]") : null;

    const items = document.querySelectorAll(
        "main > section, main > aside, main .row > section"
    );

    items.forEach(item => {
        item.style.opacity = "0";
        item.style.transform = "translateY(20px)";
        item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    });

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        items.forEach(item => observer.observe(item));
    } else {
        items.forEach(item => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
        });
    }

    document.querySelectorAll("main .card").forEach(card => {
        card.style.transition =
            "transform 0.25s ease, box-shadow 0.25s ease";

        card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-4px)";
            card.style.boxShadow = "0 8px 20px #0002";
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "translateY(0)";
            card.style.boxShadow = "";
        });
    });

    document.querySelectorAll(
        "button, input[type='submit'], input[type='reset']"
    ).forEach(button => {
        button.style.transition = "transform 0.2s ease";

        button.addEventListener("mouseenter", () => {
            if (!button.disabled) {
                button.style.transform = "scale(1.04)";
            }
        });

        button.addEventListener("mouseleave", () => {
            button.style.transform = "scale(1)";
        });
    });

    [result, error].forEach(message => {
        if (message) {
            message.style.transition = "opacity 0.4s ease";
        }
    });

    function showMessage(element) {
        if (!element) return;

        element.classList.remove("d-none");
        element.style.opacity = "0";

        requestAnimationFrame(() => {
            element.style.opacity = "1";
        });

        element.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

    function hideMessages() {
        [result, error].forEach(message => {
            if (message) {
                message.classList.add("d-none");
                message.style.opacity = "0";
            }
        });
    }

    if (form) {
        const dateInput = document.getElementById("brew-date");

        if (dateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const year = tomorrow.getFullYear();
            const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
            const day = String(tomorrow.getDate()).padStart(2, "0");

            dateInput.min = `${year}-${month}-${day}`;
        }

        form.addEventListener("submit", event => {
            event.preventDefault();
            hideMessages();

            if (!form.checkValidity()) {
                form.reportValidity();

                if (error) {
                    error.textContent =
                        "Please check the information and try again.";
                    showMessage(error);
                }

                if (status) {
                    status.textContent = "Please correct the form fields.";
                }

                return;
            }

            const name = document.getElementById("visitor-name").value.trim();
            const email = document.getElementById("visitor-email").value.trim();
            const phone = document.getElementById("visitor-phone").value.trim();
            const method = document.getElementById("brewing-method").value;
            const amount = Number(
                document.getElementById("coffee-amount").value
            );
            const question = document.getElementById("brewing-question").value.trim();

            if (
                name.length < 2 ||
                !email.includes("@") ||
                phone.length < 7 ||
                amount <= 0 ||
                question.length < 5
            ) {
                if (error) {
                    error.textContent =
                        "Please enter valid contact details and brewing information.";
                    showMessage(error);
                }

                if (status) {
                    status.textContent = "Please correct the form fields.";
                }

                return;
            }

            if (result) {
                result.textContent =
                    `Thank you, ${name}! Your ${method} brewing question has been recorded in this demo. No email has been sent.`;
                showMessage(result);
            }

            if (status) {
                status.textContent = "Form validation completed successfully.";
            }

            form.reset();
        });

        form.addEventListener("reset", () => {
            hideMessages();

            if (status) {
                status.textContent = "Form cleared.";
            }
        });

        const saveButton = Array.from(
            form.querySelectorAll("button")
        ).find(button => button.textContent.trim() === "Save Draft");

        if (saveButton) {
            saveButton.addEventListener("click", () => {
                const draft = {};

                form.querySelectorAll("input, select, textarea").forEach(field => {
                    if (!field.name || field.type === "submit" ||
                        field.type === "reset" || field.type === "button") {
                        return;
                    }

                    if (field.type === "radio") {
                        if (field.checked) {
                            draft[field.name] = field.value;
                        }
                    } else if (field.type === "checkbox") {
                        draft[field.name] = field.checked;
                    } else {
                        draft[field.name] = field.value;
                    }
                });

                try {
                    localStorage.setItem(
                        "brewing-question-draft",
                        JSON.stringify(draft)
                    );

                    if (status) {
                        status.textContent = "Draft saved in this browser.";
                    }
                } catch (e) {
                    if (status) {
                        status.textContent = "Unable to save the draft.";
                    }
                }
            });
        }
    }
});
