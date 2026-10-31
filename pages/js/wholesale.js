
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(
        "main > section, main > div, main .card"
    );
    const buttons = document.querySelectorAll(
        "button, input[type='submit'], input[type='reset']"
    );
    const form = document.getElementById("wholesale-enquiry-form");

    sections.forEach((section, index) => {
        section.style.opacity = "0";
        section.style.transform = "translateY(20px)";
        section.style.transition =
    `opacity 0.2s ease ${index * 0.03}s, transform 0.2s ease ${index * 0.03}s`;
    });

    const showSection = section => {
        section.style.opacity = "1";
        section.style.transform = "translateY(0)";
    };

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    showSection(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => observer.observe(section));
    } else {
        sections.forEach(showSection);
    }

    buttons.forEach(button => {
        button.style.transition =
            "transform 0.2s ease, box-shadow 0.2s ease";

        button.addEventListener("mouseenter", () => {
            if (button.disabled) return;

            button.style.transform = "scale(1.04)";
            button.style.boxShadow = "0 4px 12px #0002";
        });

        button.addEventListener("mouseleave", () => {
            button.style.transform = "scale(1)";
            button.style.boxShadow = "";
        });
    });

 if (form) {
    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const result = document.getElementById(
            "wholesale-enquiry-form-result"
        );
        const error = document.getElementById(
            "wholesale-enquiry-form-error"
        );

        if (result) {
            result.classList.add("d-none");
        }

        if (error) {
            error.classList.add("d-none");
        }

        form.style.transition = "opacity 0.25s ease";
        form.style.opacity = "0.6";

        setTimeout(() => {
            form.style.opacity = "1";

            if (result) {
                result.textContent =
                    "Form submitted successfully. No data was sent or saved.";
                result.classList.remove("d-none");
            }

            form.reset();
        }, 300);
    });
 }
    });