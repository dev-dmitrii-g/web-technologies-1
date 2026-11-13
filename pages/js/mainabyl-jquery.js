'use strict';

// jQuery DOM helpers shared by menu.js and subscriptions.js.

function makeElement(tagName, className, text) {
    const $element = $(`<${tagName}>`);
    if (className) {
        $element.addClass(className);
    }
    if (text !== undefined) {
        $element.text(text);
    }
    return $element;
}

function makeOption(text, value) {
    return $('<option>', { text, value });
}

function revealBlock($block, effect, duration, done) {
    return $block.stop(true, true).hide().removeClass('d-none')[effect](duration, done);
}

function getStateTargets($control) {
    return $control.is('fieldset') ? $control.find('.form-check-input') : $control;
}

function getFeedbackId($control) {
    return `${$control.attr('id')}-feedback`;
}

function clearFieldState($control) {
    $(`#${getFeedbackId($control)}`).remove();
    $control.removeAttr('aria-invalid aria-describedby');
    getStateTargets($control).removeClass('is-invalid is-valid');
}

function setFieldError($control, message) {
    clearFieldState($control);
    const feedbackId = getFeedbackId($control);
    const $feedback = makeElement('div', 'invalid-feedback d-block', `Error: ${message}`).attr('id', feedbackId);
    if ($control.is('fieldset')) {
        $feedback.appendTo($control);
    } else {
        $control.after($feedback);
    }
    $control.attr({ 'aria-invalid': 'true', 'aria-describedby': feedbackId });
    getStateTargets($control).addClass('is-invalid');
}

function setFieldValid($control) {
    clearFieldState($control);
    if (!$control.is('fieldset')) {
        $control.attr('aria-invalid', 'false').addClass('is-valid');
    }
}

function applyValidation($control, message) {
    if (message === '') {
        setFieldValid($control);
        return true;
    }
    setFieldError($control, message);
    return false;
}

function hasFieldError($control) {
    return $(`#${getFeedbackId($control)}`).length !== 0;
}
