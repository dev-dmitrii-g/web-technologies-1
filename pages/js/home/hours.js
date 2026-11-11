$(function () {
    const $wrapper = $("#time-status-badge-wrapper");
    const template = $("#time-status-badge-template").html();
    if (!$wrapper.length || !template) return;

    const $status = $(template.trim());
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const openingTime = 9 * 60;
    const closingTime = 21 * 60;

    if (currentTime >= openingTime && currentTime < closingTime) {
        const remaining = closingTime - currentTime;
        $status.filter(".badge").text("Open Now");
        $status.filter(".text-muted").text(
            `Closes in ${Math.floor(remaining / 60)} hours ${remaining % 60} minutes`,
        );
    } else {
        $status.filter(".badge").text("Closed");
        $status.filter(".text-muted").text("Opens at 9:00 AM");
    }

    $wrapper.append($status);
});
