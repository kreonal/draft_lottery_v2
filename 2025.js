const teams = [
    { name: 'Kendall', oddsFirst: 25.00, oddsTop4: 40.67, seasonFinish: 9 },
    { name: 'Joey', oddsFirst: 20.00, oddsTop4: 32.53, seasonFinish: 10 },
    { name: 'Anthony', oddsFirst: 15.00, oddsTop4: 24.40, seasonFinish: 12 },
    { name: 'Zack', oddsFirst: 12.00, oddsTop4: 19.52, seasonFinish: 11 },
    { name: 'Alfred', oddsFirst: 6.00, oddsTop4: 9.76, seasonFinish: 13 },
    { name: 'Prashant', oddsFirst: 5.00, oddsTop4: 8.13, seasonFinish: 14 },
    { name: 'Rohan', oddsFirst: 4.00, oddsTop4: 6.51, seasonFinish: 16 },
    { name: 'Calvin', oddsFirst: 4.00, oddsTop4: 6.51, seasonFinish: 2 },
    { name: 'Shaun', oddsFirst: 3.00, oddsTop4: 4.88, seasonFinish: 15 },
    { name: 'Henry', oddsFirst: 3.00, oddsTop4: 4.88, seasonFinish: 8 },
    { name: 'Minh', oddsFirst: 2.00, oddsTop4: 3.25, seasonFinish: 5 },
    { name: 'Aaron', oddsFirst: 1.00, oddsTop4: 1.63, seasonFinish: 6 },
    { name: 'Matt', oddsFirst: 0.00, oddsTop4: 0.00, seasonFinish: 7 },
    { name: 'John', oddsFirst: 0.00, oddsTop4: 0.00, seasonFinish: 4 },
    { name: 'Karan', oddsFirst: 0.00, oddsTop4: 0.00, seasonFinish: 3 },
    { name: 'Nick', oddsFirst: 0.00, oddsTop4: 0.00, seasonFinish: 1 }
];

// Swap Minh and Joey for their final picks
const lockedTeams = ['Matt', 'John', 'Karan', 'Nick'];

// Sort teams by projected position
const sortedTeams = teams.filter(team => team.oddsFirst > 0).sort((a, b) => b.seasonFinish - a.seasonFinish);

let finalPicks = [];
let currentPickIndex = 12;  // Start from pick 12
let revealedTeams = new Set();  // Track revealed teams
let top4Teams = new Set();  // Track top 4 teams

function populateProjectedOrder() {
    const projectedOrderBody = document.getElementById('projectedOrder');
    const lockedOrderBody = document.getElementById('lockedOrder');
    projectedOrderBody.innerHTML = '';
    lockedOrderBody.innerHTML = '';

    // Populate lottery teams
    sortedTeams.forEach(team => {
        const row = document.createElement('tr');
        row.id = `row-${team.name}`;
        row.innerHTML = `
            <td>${team.name}</td>
            <td>${team.oddsFirst}%</td>
            <td>${team.oddsTop4}%</td>
            <td>${team.seasonFinish}</td>
        `;
        projectedOrderBody.appendChild(row);
    });

    // Populate locked teams
    lockedTeams.forEach(team => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${team}</td>
            <td>0.00%</td>
            <td>0.00%</td>
            <td>${teams.find(t => t.name === team).seasonFinish}</td>
        `;
        lockedOrderBody.appendChild(row);
    });
}

// Function to create the weighted array
function createWeightedArray(teams) {
    let weightedArray = [];
    teams.forEach(team => {
        for (let i = 0; i < team.oddsFirst; i++) {
            weightedArray.push(team.name);
        }
    });
    return weightedArray;
}

// Function to get a random integer
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Function to select top 4 picks
function selectTopPicks(teams, topCount) {
    let picks = [];
    let remainingTeams = [...teams];

    for (let i = 0; i < topCount; i++) {
        const weightedArray = createWeightedArray(remainingTeams);
        const randomIndex = getRandomInt(weightedArray.length);
        const winner = weightedArray[randomIndex];
        picks.push(winner);
        remainingTeams = remainingTeams.filter(team => team.name !== winner);
    }

    return picks;
}

// Function to sort remaining teams based on standings
function sortRemainingTeams(teams, pickedTeams) {
    return teams
        .filter(team => !pickedTeams.includes(team.name))
        .sort((a, b) => b.seasonFinish - a.seasonFinish)
        .map(team => team.name);
}

// Function to run the lottery
function runLottery() {
    if (teams.length < 4) {
        alert('Please add at least 4 teams');
        return;
    }

    const lotteryTeams = teams.filter(team => team.oddsFirst > 0);
    const topPicks = selectTopPicks(lotteryTeams, 4);
    const remainingTeams = sortRemainingTeams(lotteryTeams, topPicks);
    finalPicks = [...topPicks, ...remainingTeams, ...lockedTeams];

    currentPickIndex = 12;
    revealedTeams.clear();  // Reset revealed teams
    top4Teams = new Set(finalPicks.slice(0, 4));  // Track top 4 teams

    // Clear previous messages
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.innerHTML = '';

    updateCards();
}

// Function to update the cards
function updateCards() {
    const cardsContainer = document.getElementById('teamsList');
    cardsContainer.innerHTML = '<tr><th>Pick</th><th>Team</th></tr>';

    for (let i = 1; i <= 12; i++) {
        const row = document.createElement('tr');
        row.className = 'hidden';
        row.id = `card-${i}`;
        row.innerHTML = `
            <td>${i}</td>
            <td id="team-info-${i}"></td>
        `;
        row.onclick = () => revealNextPick(i);
        cardsContainer.appendChild(row);
    }

    // Locked teams
    lockedTeams.forEach((team, index) => {
        const row = document.createElement('tr');
        row.className = 'revealed';
        row.innerHTML = `
            <td>${13 + index}</td>
            <td>${team}</td>
        `;
        cardsContainer.appendChild(row);
    });
}

// Function to reveal the next pick
function revealNextPick(pickIndex) {
    const team = finalPicks[pickIndex - 1];
    const expectedPositions = sortedTeams.map(t => t.name);
    const teamInfo = document.getElementById(`team-info-${pickIndex}`);
    const card = document.getElementById(`card-${pickIndex}`);

    teamInfo.innerText = team;
    card.classList.add('revealed');
    currentPickIndex--;

    revealedTeams.add(team);  // Add to revealed teams

    // Check if the revealed team was supposed to be in the current pick
    if (pickIndex <= 12 && pickIndex >= 5) {
        const expectedTeam = sortedTeams[pickIndex - 1];
        if (team !== expectedTeam.name && top4Teams.has(expectedTeam.name)) {
            top4Teams.delete(expectedTeam.name);
            const messageContainer = document.getElementById('messageContainer');
            const message = document.createElement('p');
            message.innerText = `${expectedTeam.name} has moved into the top 4!`;
            messageContainer.appendChild(message);
        }
    }

    // Populate messages for remaining top 4 teams once pick 5 is revealed
    if (pickIndex === 5) {
        top4Teams.forEach(team => {
            if (!revealedTeams.has(team)) {
                const messageContainer = document.getElementById('messageContainer');
                const message = document.createElement('p');
                message.innerText = `${team} has moved into the top 4!`;
                messageContainer.appendChild(message);
            }
        });
    }
}

let currentSortColumn = 'seasonFinish';
let sortAscending = true;

// Function to sort the table
function sortTable(column) {
    sortAscending = currentSortColumn === column ? !sortAscending : true;
    currentSortColumn = column;

    teams.sort((a, b) => {
        if (a[currentSortColumn] < b[currentSortColumn]) {
            return sortAscending ? -1 : 1;
        }
        if (a[currentSortColumn] > b[currentSortColumn]) {
            return sortAscending ? 1 : -1;
        }
        return 0;
    });

    populateProjectedOrder();
}

// Call functions on page load
document.addEventListener('DOMContentLoaded', () => {
    populateProjectedOrder();
});
