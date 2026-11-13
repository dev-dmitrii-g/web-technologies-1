(function () {
    "use strict";

    var forms = document.querySelectorAll(".needs-validation");

    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener(
            "submit",
            function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add("was-validated");
            },
            false,
        );
    });
})();

const form = document.getElementById("signup-form");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");
const passwordFeedback = document.getElementById("password-feedback");

function setValidationState(input, isValid) {
    if (isValid) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
    } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
    }
}

function validatePassword() {
    const val = password.value;
    const hasMinLength = val.length >= 8;
    const hasUpperCase = /[A-Z]/.test(val);
    const hasNumber = /\d/.test(val);

    const isValid = hasMinLength && hasUpperCase && hasNumber;

    if (!isValid) {
        const errors = [];
        if (!hasMinLength) errors.push("at least 8 characters");
        if (!hasUpperCase) errors.push("1 uppercase letter");
        if (!hasNumber) errors.push("1 number");
        passwordFeedback.textContent = `Password needs ${errors.join(", ")}.`;
    }

    setValidationState(password, isValid);

    if (confirmPassword.value !== "") {
        validateConfirmPassword();
    }

    return isValid;
}

function validateConfirmPassword() {
    const isValid =
        confirmPassword.value !== "" &&
        confirmPassword.value === password.value;
    setValidationState(confirmPassword, isValid);
    return isValid;
}

password.addEventListener("input", validatePassword);
confirmPassword.addEventListener("input", validateConfirmPassword);

form.addEventListener("submit", (event) => {
    const isPasswordValid = validatePassword();
    const isConfirmValid = validateConfirmPassword();

    if (!isPasswordValid || !isConfirmValid) {
        event.preventDefault();
        event.stopPropagation();
    }
});

document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.togglePassword);
        const icon = button.querySelector("i");
        const isPassword = input.type === "password";

        input.type = isPassword ? "text" : "password";
        icon.classList.toggle("bi-eye", !isPassword);
        icon.classList.toggle("bi-eye-slash", isPassword);
    });
});
