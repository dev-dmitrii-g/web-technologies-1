"use strict";

// jQuery is loaded by brewing-guides.html before this script.
$(function () {
    $("main > section, main > aside, main .row > section").each(function () {
        const $section = $(this);
        $section.css({ opacity: "0", transform: "translateY(20px)", transition: "all 0.6s ease" });

        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        $(entry.target).css({ opacity: "1", transform: "translateY(0)" });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(this);
        } else {
            $section.css({ opacity: "1", transform: "translateY(0)" });
        }
    });

    $("main .card")
        .css({ transition: "transform 0.25s ease, box-shadow 0.25s ease" })
        .on("mouseenter", function () {
            $(this).css({ transform: "translateY(-4px)", boxShadow: "0 8px 20px #0002" });
        })
        .on("mouseleave", function () {
            $(this).css({ transform: "", boxShadow: "" });
        });

    $("button, input[type='submit'], input[type='reset']")
        .css("transition", "transform 0.2s ease")
        .on("mouseenter", function () {
            if (!$(this).prop("disabled")) $(this).css("transform", "scale(1.04)");
        })
        .on("mouseleave", function () {
            $(this).css("transform", "");
        });

    const notesForm = document.getElementById("brewing-notes-form");
    const $notesList = $("#brewing-notes-list");
    const $notesStatus = $("#brewing-notes-status");
    const storageKey = "tokyo-coffee-brewing-notes";
    if (!notesForm || !$notesList.length) return;

    function loadNotes() {
        try {
            const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
            return Array.isArray(stored)
                ? stored.filter(note => note && typeof note.id === "string" && typeof note.method === "string")
                : [];
        } catch {
            return [];
        }
    }

    function saveNotes(notes) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(notes));
            return true;
        } catch {
            return false;
        }
    }

    let notes = loadNotes();

    function renderNotes() {
        $notesList.empty();

        if (notes.length === 0) {
            $notesList.append($("<p>", {
                class: "text-muted mb-0",
                text: "No brewing notes saved yet. Add your first brew above."
            }));
            return;
        }

        [...notes].reverse().forEach(note => {
            const date = new Date(note.createdAt);
            const dateLabel = Number.isNaN(date.getTime()) ? "Saved brew" : date.toLocaleString();
            const $card = $("<article>", { class: "card shadow-sm mb-3" });
            const $body = $("<div>", { class: "card-body" });
            $body.append($("<h3>", {
                class: "h5 card-title",
                text: `${note.method} · ${dateLabel}`
            }));
            $body.append($("<p>", {
                class: "small text-muted mb-2",
                text: `Coffee: ${note.coffeeGrams} g · Water: ${note.waterMl} ml · Grind: ${note.grind} · Brew time: ${note.brewTime}`
            }));
            if (note.result) {
                $body.append($("<p>", { class: "mb-3", text: note.result }));
            }
            $body.append($("<button>", {
                type: "button",
                class: "btn btn-outline-danger btn-sm",
                text: "Delete note",
                "data-note-id": note.id,
                "aria-label": `Delete ${note.method} brewing note`
            }));
            $card.append($body);
            $notesList.append($card);
        });
    }

    $(notesForm).on("submit", event => {
        event.preventDefault();

        if (!notesForm.checkValidity()) {
            notesForm.reportValidity();
            $notesStatus.text("Please complete the required brewing details.");
            return;
        }

        const note = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            method: $("#notes-method").val(),
            grind: $("#notes-grind").val(),
            coffeeGrams: Number($("#notes-coffee").val()),
            waterMl: Number($("#notes-water").val()),
            brewTime: $.trim($("#notes-time").val()),
            result: $.trim($("#notes-result").val() || ""),
            createdAt: new Date().toISOString()
        };
        const updatedNotes = [...notes, note];

        if (!saveNotes(updatedNotes)) {
            $notesStatus.text("Could not save the note. Browser storage may be full or unavailable.");
            return;
        }

        notes = updatedNotes;
        notesForm.reset();
        renderNotes();
        $notesStatus.text("Brewing note saved in this browser.");
    });

    $notesList.on("click", "[data-note-id]", function () {
        const noteId = $(this).attr("data-note-id");
        const updatedNotes = notes.filter(note => note.id !== noteId);
        if (!saveNotes(updatedNotes)) {
            $notesStatus.text("Could not delete the note. Browser storage may be unavailable.");
            return;
        }

        notes = updatedNotes;
        renderNotes();
        $notesStatus.text("Brewing note deleted from this browser.");
    });

    renderNotes();
});
