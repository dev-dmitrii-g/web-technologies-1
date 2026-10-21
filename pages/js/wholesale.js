
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section");
    const buttons = document.querySelectorAll("button, input[type='submit']");
    const form = document.getElementById("wholesale-enquiry-form");

    sections.forEach(section => {
        section.style.opacity = "0";
        section.style.transform = "translateY(25px)";
        section.style.transition = "opacity 0.7s ease, transform 0.7s ease";
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
        }, { threshold: 0.15 });

        sections.forEach(section => observer.observe(section));
    } else {
        sections.forEach(section => {
            section.style.opacity = "1";
            section.style.transform = "translateY(0)";
        });
    }

    buttons.forEach(button => {
        button.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";

        button.addEventListener("mouseenter", () => {
            button.style.transform = "scale(1.04)";
            button.style.boxShadow = "0 4px 12px #0002";
        });

        button.addEventListener("mouseleave", () => {
            button.style.transform = "scale(1)";
            button.style.boxShadow = "none";
        });
    });

    if (form) {
        form.addEventListener("submit", () => {
            if (form.checkValidity()) {
                form.style.transition = "opacity 0.3s ease";
                form.style.opacity = "0.7";

                setTimeout(() => {
                    form.style.opacity = "1";
                }, 300);
            }
        });
    }
});
