// Voter registration system with localStorage persistence
let voters = [];
const candidates = ['Hassan Sheekh Mohamuud', 'Mohamed Abdullaahi Farmaajo', 'Mohamed Hussein Rooble', 'Sheekh Shariif Sheekh Ahmed'];
let votes = {};
let currentVoterPhone = null; 

// Load persisted data 
try {
    const storedVoters = localStorage.getItem('voters');
    if (storedVoters) voters = JSON.parse(storedVoters);
} catch (err) {
    console.error('Error reading voters from localStorage:', err);
}

try {
    const storedVotes = localStorage.getItem('votes');
    if (storedVotes) votes = JSON.parse(storedVotes);
} catch (err) {
    console.error('Error reading votes from localStorage:', err);
}

// Ensure every candidate has a votes entry
candidates.forEach(c => { if (typeof votes[c] === 'undefined') votes[c] = 0; });

// Ensure every loaded voter has a 'voted' boolean (default false)
voters = voters.map(v => ({ ...v, voted: !!v.voted }));

document.getElementById('startVoting').addEventListener('click', function() {
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('voters').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const loginPhone = document.getElementById('loginPhone').value.trim();
    const voter = voters.find(v => v.phone === loginPhone);
    if (voter) {
        // Prevent voting again if this voter already voted
        if (voter.voted) {
            alert('You have already voted. Thank you.');
            // show results instead of voting
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('resultsSection').style.display = 'block';
            displayResults();
            this.reset();
            return;
        }

        // allow voting and remember who is voting now
        currentVoterPhone = loginPhone;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('votingSection').style.display = 'block';
    } else {
        alert('Voter not found. Please register first.');
    }
    this.reset();
});

document.getElementById('voteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const candidate = document.querySelector('input[name="candidate"]:checked').value;
    votes[candidate]++;
    document.getElementById('votingSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    displayResults();
    // Persist votes
    try { localStorage.setItem('votes', JSON.stringify(votes)); } catch (err) { console.error('Failed to save votes', err); }
    // Mark current voter as having voted (if we have a logged-in phone)
    if (currentVoterPhone) {
        const idx = voters.findIndex(v => v.phone === currentVoterPhone);
        if (idx !== -1) {
            voters[idx].voted = true;
            try { localStorage.setItem('voters', JSON.stringify(voters)); } catch (err) { console.error('Failed to save voters', err); }
        }
        // Clear current voter after voting
        currentVoterPhone = null;
    }
    this.reset();
});

document.getElementById('voteButton').addEventListener('dblclick', function() {
    document.getElementById('voteForm').dispatchEvent(new Event('submit'));
});

function displayResults() {
    const list = document.getElementById('resultsList');
    list.innerHTML = '';

    // Calculate totals and determine winner(s)
    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
    const results = candidates.map(c => ({ name: c, count: votes[c] || 0 }));

    // Sort descending so top candidates appear first
    results.sort((a, b) => b.count - a.count);

    const maxVotes = results.length ? results[0].count : 0;
    const winners = (maxVotes > 0) ? results.filter(r => r.count === maxVotes).map(r => r.name) : [];

    if (totalVotes === 0) {
        const info = document.createElement('li');
        info.textContent = 'No votes yet — be the first to vote!';
        list.appendChild(info);
        return;
    }

    results.forEach(r => {
        const li = document.createElement('li');
        // Simple display: "Name — X votes" (no raw objects or extra meta)
        li.textContent = `${r.name} — ${r.count} votes`;

        // Mark winner/tie and append a small badge (keep the line text-only, then add badge span)
        if (winners.includes(r.name) && maxVotes > 0) {
            if (winners.length > 1) {
                li.classList.add('tie');
                const badge = document.createElement('span');
                badge.className = 'label-tie';
                badge.textContent = 'Tie';
                li.appendChild(badge);
            } else {
                li.classList.add('winner');
                const badge = document.createElement('span');
                badge.className = 'label-winner';
                badge.textContent = 'Winner';
                li.appendChild(badge);
            }
        }

        list.appendChild(li);
    });
}

document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const age = parseInt(document.getElementById('age').value);
    const gender = document.querySelector('input[name="gender"]:checked') ? document.querySelector('input[name="gender"]:checked').value : '';
    const phone = document.getElementById('phone').value.trim();
    const district = document.getElementById('district').value;

    // Check for duplicate phone
    const existingVoter = voters.find(v => v.phone === phone);
    if (existingVoter) {
        alert('This phone number is already registered. You cannot register again.');
        return;
    }

    // Validation
    let errors = [];
    if (name.split(' ').length < 3) {
        errors.push('Name must have at least 3 words.');
    }
    if (age <= 18) {
        errors.push('Age must be greater than 18.');
    }
    if (!gender) {
        errors.push('Please select gender.');
    }
    if (!phone.startsWith('25261')) {
        errors.push('Phone number must start with 25261.');
    }
    if (!district) {
        errors.push('Please select a district.');
    }

    if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
    }

    // Add voter
    const voter = { name, age, gender, phone, district, voted: false };
    voters.push(voter);
    displayVoters();
    // Persist voters
    try { localStorage.setItem('voters', JSON.stringify(voters)); } catch (err) { console.error('Failed to save voters', err); }

    // Reset form
    this.reset();
});

function displayVoters() {
    const list = document.getElementById('votersList');
    list.innerHTML = '';
    voters.forEach((voter, index) => {
        const li = document.createElement('li');
        li.textContent = `${voter.name} - ${voter.district}` + (voter.voted ? ' (voted)' : '');
        li.addEventListener('click', () => showDetails(index));
        list.appendChild(li);
    });
}

function showDetails(index) {
    const voter = voters[index];
    const details = document.createElement('div');
    details.className = 'details';
    details.innerHTML = `
        <strong>Name:</strong> ${voter.name}<br>
        <strong>Age:</strong> ${voter.age}<br>
        <strong>Gender:</strong> ${voter.gender}<br>
        <strong>Phone:</strong> ${voter.phone}<br>
        <strong>District:</strong> ${voter.district}
    `;
    // Remove previous details
    const existing = document.querySelector('.details');
    if (existing) existing.remove();
    document.getElementById('voters').appendChild(details);
}

// Initial render of persisted data
displayVoters();
// Do not auto-show results UI, but ensure results list reflects persisted votes
displayResults();