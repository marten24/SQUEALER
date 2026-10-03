    function applyFilter() {
    const userType = document.getElementById("userType").value;
    const username = document.getElementById("username").value;
    const popularity = document.getElementById("popularity").value;

    window.location.href = `/manageUsers?type=${userType}&username=${username}&popularity=${popularity}`;

}
    async function toggleBlock(userId) {
    await toggleUserBlockStatus(userId, true);
    location.reload();
}

    async function toggleUnblock(userId) {
    await toggleUserBlockStatus(userId, false);
    location.reload();
}


    async function toggleUserBlockStatus(userId, blockStatus) {
    const response = await fetch(`/toggleBlockStatus?id=${userId}&block=${blockStatus}`, {
    method: 'POST',
});

    if (!response.ok) {
    console.error('Errore durante la richiesta al server');
}
}


    async function updateDailyChars(userId) {
    const dailyCharsInput = document.getElementById(`dailyChars_${userId}`);
    const newValue = dailyCharsInput.value;

    await updateChars(userId, 'day_ch_l', newValue);
    location.reload();
}

    async function updateWeeklyChars(userId) {
    const weeklyCharsInput = document.getElementById(`weeklyChars_${userId}`);
    const newValue = weeklyCharsInput.value;

    await updateChars(userId, 'wek_ch_l', newValue);
    location.reload();
}

    async function updateMonthlyChars(userId) {
    const monthlyCharsInput = document.getElementById(`monthlyChars_${userId}`);
    const newValue = monthlyCharsInput.value;

    await updateChars(userId, 'mon_ch_l', newValue);
    location.reload();
}
    async function updateChars(userId, columnName, newValue) {
    const response = await fetch(`/updateChars?id=${userId}&column=${columnName}&value=${newValue}`, {
    method: 'POST',
});

    if (!response.ok) {
    console.error('Errore durante la richiesta al server');
}
}
