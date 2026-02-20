const monuments = [
    { name: "Нясвіжскі замак", region: "Мінская вобласць" },
    { name: "Каложская царква", region: "Гродзенская вобласць" },
    { name: "Косаўскі палац", region: "Брэсцкая вобласць" },
    { name: "Мірскі замак", region: "Гродзенская вобласць" }
];

const catalog = document.getElementById('catalog');

monuments.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div>
            <h3>${item.name}</h3>
            <p>${item.region}</p>
        </div>
        <a href="#">Чытаць далей</a>
    `;
    catalog.appendChild(card);
});
