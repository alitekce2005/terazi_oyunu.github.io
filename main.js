// Game state
let gameState = {
    round: 1,
    eliminatedCount: 0,
    players: [
        { name: "Sen", health: 10, active: true, isBot: false, guess: 0, botType: null, history: [], colorClass: 'human' },
        { name: "Kaos Bot", health: 10, active: true, isBot: true, guess: 0, botType: "KAOTIK", history: [], colorClass: 'bot' },
        { name: "Wild Bot", health: 10, active: true, isBot: true, guess: 0, botType: "VAHSI", history: [], colorClass: 'bot' },
        { name: "Rulo Bot", health: 10, active: true, isBot: true, guess: 0, botType: "RULET", history: [], colorClass: 'bot' },
        { name: "Şans Bot", health: 10, active: true, isBot: true, guess: 0, botType: "ŞANSLI", history: [], colorClass: 'bot' }
    ],
    gameLog: [],
    waitingForGuess: true,
    gameActive: true
};

const botStrategies = {
    "KAOTIK": "🌪️ Kaotik",
    "VAHSI": "🦁 Vahşi",
    "RULET": "🎰 Rulet",
    "ŞANSLI": "🍀 Şanslı"
};

// Kurallar Butonu İşlevselliği
document.getElementById('rulesToggleBtn').addEventListener('click', function() {
    const rulesBox = document.getElementById('floatingRulesBox');
    rulesBox.style.display = rulesBox.style.display === 'none' || rulesBox.style.display === '' ? 'block' : 'none';
});

// Sayfa Yüklendiğinde Oyunu Başlat
window.addEventListener('load', function() {
    initGame();
});

function initGame() {
    createPlayers();
    updateDisplay();
    document.getElementById('guessInputArea').style.display = 'block';
    document.getElementById('tableGuessInput').value = '';
    document.getElementById('targetInfo').textContent = 'Tahminlerinizi yapın...';
    addLog('🎮 YENİ OYUN BAŞLADI! Sen vs 4 Çılgın Bot!', 'log-round');
    addLog('🤖 Bu sefer botlar tamamen öngörülemez!', 'log-round');
}

function createPlayers() {
    const table = document.getElementById('gameTable');
    const existingPlayers = table.querySelectorAll('.player');
    existingPlayers.forEach(p => p.remove());

    gameState.players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = `player ${player.colorClass}`;
        playerDiv.id = `player-${index}`;

        const guessDiv = document.createElement('div');
        guessDiv.className = 'player-guess';
        playerDiv.appendChild(guessDiv);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'player-name';
        nameDiv.textContent = player.name;
        playerDiv.appendChild(nameDiv);

        const healthDiv = document.createElement('div');
        healthDiv.className = 'player-health';
        healthDiv.textContent = `❤️ ${player.health}`;
        playerDiv.appendChild(healthDiv);

        table.appendChild(playerDiv);
    });
}

function updateDisplay() {
    document.getElementById('roundInfo').textContent = `Round ${gameState.round}`;
    updateRules();
    gameState.players.forEach((player, index) => {
        const playerDiv = document.getElementById(`player-${index}`);
        if (playerDiv) {
            const healthDiv = playerDiv.querySelector('.player-health');
            healthDiv.textContent = `❤️ ${player.health}`;
            if (!player.active) {
                playerDiv.classList.add('eliminated');
            } else {
                playerDiv.classList.remove('eliminated');
            }
        }
    });
    updateGameLog();
}

function updateRules() {
    const rules = document.querySelectorAll('#dynamicRulesList .rule-item');
    rules.forEach((rule, index) => {
        if (index <= gameState.eliminatedCount) {
            rule.classList.remove('inactive');
            rule.classList.add('active');
        } else {
            rule.classList.remove('active');
            rule.classList.add('inactive');
        }
    });
}

function updateGameLog() {
    const logDiv = document.getElementById('gameLog');
    logDiv.innerHTML = '';
    gameState.gameLog.slice(-10).forEach(log => {
        const logItem = document.createElement('div');
        logItem.className = `log-item ${log.type}`;
        logItem.innerHTML = log.message;
        logDiv.appendChild(logItem);
    });
    logDiv.scrollTop = logDiv.scrollHeight;
}

function addLog(message, type = 'log-result') {
    gameState.gameLog.push({ message, type });
    updateGameLog();
}

function submitTableGuess() {
    if (!gameState.gameActive) return;

    const input = document.getElementById('tableGuessInput');
    const guess = parseInt(input.value);

    if (isNaN(guess) || guess < 0 || guess > 100) {
        alert('Lütfen 0-100 arası geçerli bir sayı girin!');
        input.classList.add('invalid');
        return;
    }

    input.classList.remove('invalid');
    gameState.players[0].guess = guess;
    gameState.waitingForGuess = false;
    document.getElementById('guessInputArea').style.display = 'none';
    input.value = '';

    addLog(`🧑 Sen: ${guess} tahmini yaptın`, 'log-round');

    setTimeout(() => {
        calculateBotGuesses();
    }, 1000);
}

function calculateBotGuesses() {
    addLog('🤖 Botlar çılgın tahminler yapıyor...', 'log-round');

    gameState.players.forEach((player, index) => {
        if (player.isBot && player.active) {
            const playerDiv = document.getElementById(`player-${index}`);
            playerDiv.classList.add('thinking');
        }
    });

    setTimeout(() => {
        gameState.players.forEach((player, index) => {
            if (player.isBot && player.active) {
                player.guess = generateBotGuess(player);
                const playerDiv = document.getElementById(`player-${index}`);
                playerDiv.classList.remove('thinking');
                const guessDiv = playerDiv.querySelector('.player-guess');
                guessDiv.textContent = player.guess;
                guessDiv.classList.add('show');
                addLog(`🤖 ${player.name} (${botStrategies[player.botType]}): ${player.guess}`, 'log-round');
            }
        });

        setTimeout(() => {
            calculateResults();
        }, 2000);
    }, 2000);
}

function generateBotGuess(bot) {
    let guess = 50;
    switch (bot.botType) {
        case "KAOTIK":
            const chaos = Math.random();
            if (chaos < 0.25) {
                guess = Math.random() * 15;
            } else if (chaos < 0.5) {
                guess = 85 + Math.random() * 15;
            } else if (chaos < 0.75) {
                guess = Math.random() * 100;
            } else {
                guess = gameState.round % 2 === 0 ?
                    Math.floor(Math.random() * 5) * 20 + 1 :
                    Math.floor(Math.random() * 5) * 20;
            }
            break;
        case "VAHSI":
            const wildness = Math.random();
            if (wildness < 0.4) {
                guess = Math.random() * 20;
            } else if (wildness < 0.8) {
                guess = 80 + Math.random() * 20;
            } else {
                guess = 40 + Math.random() * 20;
            }
            if (bot.history.length > 0 && Math.random() < 0.3) {
                const lastGuess = bot.history[bot.history.length - 1].guess;
                guess = 100 - lastGuess + (Math.random() - 0.5) * 20;
            }
            break;
        case "RULET":
            const rouletteNumbers = [0, 7, 13, 21, 33, 42, 55, 69, 77, 88, 100];
            const randomSpin = Math.random();
            if (randomSpin < 0.6) {
                guess = rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)];
            } else if (randomSpin < 0.8) {
                const fibLike = [1, 3, 8, 13, 21, 34, 55, 89];
                guess = fibLike[Math.floor(Math.random() * fibLike.length)];
            } else {
                guess = Math.floor(Math.random() * 11) * 10 + Math.floor(Math.random() * 10);
            }
            break;
        case "ŞANSLI":
            const luckyPatterns = Math.random();
            if (luckyPatterns < 0.2) {
                const luckyBases = [7, 13, 21, 27, 37, 49, 63, 77, 91];
                guess = luckyBases[Math.floor(Math.random() * luckyBases.length)];
            } else if (luckyPatterns < 0.4) {
                const digit = Math.floor(Math.random() * 10);
                guess = digit * 11;
            } else if (luckyPatterns < 0.6) {
                const base = Math.floor(Math.random() * 90) + 10;
                const reversed = parseInt(base.toString().split('').reverse().join(''));
                guess = reversed <= 100 ? reversed : base;
            } else {
                if (bot.history.length > 0) {
                    const avgTarget = bot.history.reduce((sum, h) => sum + h.target, 0) / bot.history.length;
                    guess = Math.floor(avgTarget) + (Math.random() - 0.5) * 40;
                } else {
                    guess = Math.random() * 100;
                }
            }
            break;
    }

    if (Math.random() < 0.15) {
        guess = Math.random() * 100;
    }

    const roundChaos = (gameState.round % 3) * 0.1;
    if (Math.random() < roundChaos) {
        guess = guess + (Math.random() - 0.5) * 50;
    }

    return Math.max(0, Math.min(100, Math.round(guess)));
}

function calculateResults() {
    const activePlayers = gameState.players.filter(p => p.active);
    const guesses = activePlayers.map(p => p.guess);
    const average = guesses.reduce((sum, g) => sum + g, 0) / guesses.length;
    const target = Math.round(average * 0.8);

    document.getElementById('targetInfo').innerHTML = `Ortalama: ${average.toFixed(2)}<br>Hedef (x0.8): ${target}`;

    gameState.players.forEach(player => {
        if (player.isBot && player.active) {
            player.history.push({ target, guess: player.guess });
        }
    });

    addLog(`📊 Ortalama: ${average.toFixed(2)}, Hedef: ${target}`, 'log-result');

    // Rule 1: Same number penalty
    if (gameState.eliminatedCount >= 1) {
        const guessCount = {};
        activePlayers.forEach(p => {
            if (!guessCount[p.guess]) guessCount[p.guess] = [];
            guessCount[p.guess].push(p);
        });
        Object.entries(guessCount).forEach(([guess, players]) => {
            if (players.length > 1) {
                players.forEach(p => {
                    p.health--;
                    addLog(`⚠️ ${p.name} aynı sayı cezası aldı (-1)`, 'log-elimination');
                });
            }
        });
    }

    // Find winner
    let winner = null;
    let minDiff = Infinity;
    activePlayers.forEach(player => {
        const diff = Math.abs(player.guess - target);
        if (diff < minDiff) {
            minDiff = diff;
            winner = player;
        }
    });

    const exactGuess = minDiff === 0;

    // Rule 3: 0 and 100 rule
    if (gameState.eliminatedCount >= 3) {
        const hasZero = activePlayers.some(p => p.guess === 0);
        const hundredPlayer = activePlayers.find(p => p.guess === 100);
        if (hasZero && hundredPlayer) {
            addLog(`🔥 ÖZEL KURAL: ${hundredPlayer.name} 0 ve 100 kuralıyla kazandı!`, 'log-result');
            activePlayers.forEach(p => {
                if (p !== hundredPlayer) p.health--;
            });
            winner = hundredPlayer;
        } else {
            applyNormalRules(activePlayers, winner, exactGuess);
        }
    } else {
        applyNormalRules(activePlayers, winner, exactGuess);
    }

    // Show winner with ring effect
    const winnerIndex = gameState.players.indexOf(winner);
    const winnerDiv = document.getElementById(`player-${winnerIndex}`);
    const ring = document.createElement('div');
    ring.className = 'winner-ring';
    winnerDiv.appendChild(ring);

    setTimeout(() => {
        if (ring.parentNode) {
            ring.parentNode.removeChild(ring);
        }
    }, 1500);

    addLog(`🏆 KAZANAN: ${winner.name} (Tahmin: ${winner.guess}, Fark: ${minDiff})`, 'log-result');

    setTimeout(() => {
        checkEliminations();
    }, 3000);
}

function applyNormalRules(activePlayers, winner, exactGuess) {
    if (gameState.eliminatedCount >= 2 && exactGuess) {
        addLog('🔥 TAM DOĞRU TAHMİN! Diğer oyuncular -2 puan kaybediyor!', 'log-result');
        activePlayers.forEach(p => {
            if (p !== winner) p.health -= 2;
        });
    } else {
        activePlayers.forEach(p => {
            if (p !== winner) p.health--;
        });
    }
}

function checkEliminations() {
    let someoneEliminated = false;
    gameState.players.forEach((player, index) => {
        if (player.active && player.health <= 0) {
            player.active = false;
            gameState.eliminatedCount++;
            someoneEliminated = true;
            const playerDiv = document.getElementById(`player-${index}`);
            playerDiv.classList.add('eliminated');
            addLog(`💀 ${player.name} elendi!`, 'log-elimination');
        }
    });

    const remainingPlayers = gameState.players.filter(p => p.active);
    if (remainingPlayers.length <= 1) {
        setTimeout(() => endGame(), 2000);
    } else {
        gameState.round++;
        setTimeout(() => nextRound(), 3000);
    }
}

function nextRound() {
    document.querySelectorAll('.player-guess').forEach(g => {
        g.classList.remove('show');
    });

    document.getElementById('targetInfo').textContent = 'Tahminlerinizi yapın...';
    document.getElementById('guessInputArea').style.display = 'block';
    document.getElementById('tableGuessInput').value = '';
    gameState.waitingForGuess = true;

    updateDisplay();
    addLog(`🎯 Round ${gameState.round} başladı!`, 'log-round');
}

function endGame() {
    gameState.gameActive = false;
    const remainingPlayers = gameState.players.filter(p => p.active);
    let message = '';
    if (remainingPlayers.length === 1) {
        const winner = remainingPlayers[0];
        if (winner.isBot) {
            message = `😔 ${winner.name} (${botStrategies[winner.botType]}) seni yendi! Çılgın stratejisi işe yaradı! Toplam ${gameState.round-1} round oynandı.`;
        } else {
            message = `🎉 TEBRİKLER! Öngörülemez botları yendin! Müthiş analiz! Toplam ${gameState.round-1} round oynandı.`;
        }
    } else {
        message = `💥 Kimse kazanamadı! Tüm oyuncular elendi. Toplam ${gameState.round-1} round oynandı.`;
    }

    document.getElementById('gameOverMessage').textContent = message;
    document.getElementById('gameOverOverlay').style.display = 'flex';
}

function startNewGame() {
    gameState = {
        round: 1,
        eliminatedCount: 0,
        players: [
            { name: "Sen", health: 10, active: true, isBot: false, guess: 0, botType: null, history: [], colorClass: 'human' },
            { name: "Kaos Bot", health: 10, active: true, isBot: true, guess: 0, botType: "KAOTIK", history: [], colorClass: 'bot' },
            { name: "Wild Bot", health: 10, active: true, isBot: true, guess: 0, botType: "VAHSI", history: [], colorClass: 'bot' },
            { name: "Rulo Bot", health: 10, active: true, isBot: true, guess: 0, botType: "RULET", history: [], colorClass: 'bot' },
            { name: "Şans Bot", health: 10, active: true, isBot: true, guess: 0, botType: "ŞANSLI", history: [], colorClass: 'bot' }
        ],
        gameLog: [],
        waitingForGuess: true,
        gameActive: true
    };

    createPlayers();
    updateDisplay();
    document.getElementById('gameOverOverlay').style.display = 'none';
    document.getElementById('guessInputArea').style.display = 'block';
    document.getElementById('tableGuessInput').value = '';
    document.getElementById('targetInfo').textContent = 'Tahminlerinizi yapın...';

    addLog('🎮 YENİ OYUN BAŞLADI! Sen vs 4 Çılgın Bot!', 'log-round');
    addLog('🤖 Bu sefer botlar tamamen öngörülemez!', 'log-round');
}

// Event Listeners
document.getElementById('tableGuessInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        submitTableGuess();
    }
});

document.getElementById('tableGuessInput').addEventListener('input', function(e) {
    const value = parseInt(e.target.value);
    const submitBtn = document.getElementById('tableSubmitBtn');
    if (isNaN(value) || value < 0 || value > 100) {
        submitBtn.disabled = true;
        e.target.classList.add('invalid');
    } else {
        submitBtn.disabled = false;
        e.target.classList.remove('invalid');
    }
});

document.querySelectorAll('.table-submit-btn, .game-over-button').forEach(button => {
    button.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    });
});

function createStarryBackground() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Star {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 2;
            this.speed = Math.random() * 0.5 + 0.1;
            this.opacity = Math.random() * 0.8 + 0.2;
            this.color = this.generateStarColor();
        }

        generateStarColor() {
            const colors = [
                'rgba(255, 255, 255, ${this.opacity})',
                'rgba(173, 216, 230, ${this.opacity})',
                'rgba(255, 250, 205, ${this.opacity})'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x -= this.speed;
            if (this.x < 0) {
                this.x = canvas.width;
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace('${this.opacity}', this.opacity);
            ctx.fill();
        }
    }

    const stars = [];
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
    }

    function createParticleTrails() {
        const particleCount = 10;
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3,
                color: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`,
                speed: Math.random() * 2 - 1,
                angle: Math.random() * Math.PI * 2
            };

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Gradient arka plan
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.7)');
        gradient.addColorStop(0.5, 'rgba(118, 75, 162, 0.7)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0.7)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Yıldızları çiz
        stars.forEach(star => {
            star.update();
            star.draw();
        });

        // Ara sıra parçacık izleri oluştur
        if (Math.random() < 0.05) {
            createParticleTrails();
        }

        requestAnimationFrame(animate);
    }

    // Pencere yeniden boyutlandırıldığında canvas'ı güncelle
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    animate();
}

// Sayfa yüklendiğinde arka plan animasyonunu başlat
window.addEventListener('load', createStarryBackground);


