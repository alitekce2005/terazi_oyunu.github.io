// main.js - TERAZİ OYUNU FİNAL SÜRÜM

// Game state - Oyunun durumunu tutan ana obje
let gameState = {
    round: 1,
    eliminatedCount: 0,
    eliminationOrder: [], // Sıralamayı tutmak için (Kritik)
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

// Kurallar Butonu
const rulesBtn = document.getElementById('rulesToggleBtn');
if (rulesBtn) {
    rulesBtn.addEventListener('click', function() {
        const rulesBox = document.getElementById('floatingRulesBox');
        if(rulesBox) rulesBox.style.display = rulesBox.style.display === 'none' || rulesBox.style.display === '' ? 'block' : 'none';
    });
}

// Sayfa Yüklendiğinde Oyunu Başlat
window.addEventListener('load', function() {
    initGame();
    // Arkaplan efekti (Varsa çalıştırır, yoksa hata vermez)
    if (typeof createStarryBackground === 'function') createStarryBackground();
});

function initGame() {
    createPlayers();
    updateDisplay();
    const inputArea = document.getElementById('guessInputArea');
    if(inputArea) inputArea.style.display = 'block';
    
    const input = document.getElementById('tableGuessInput');
    if(input) input.value = '';
    
    const targetInfo = document.getElementById('targetInfo');
    if(targetInfo) targetInfo.textContent = 'Tahminlerinizi yapın...';
    
    addLog('🎮 YENİ OYUN BAŞLADI! Sen vs 4 Çılgın Bot!', 'log-round');
}

function createPlayers() {
    const table = document.getElementById('gameTable');
    if(!table) return;
    
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
    const roundInfo = document.getElementById('roundInfo');
    if(roundInfo) roundInfo.textContent = `Round ${gameState.round}`;
    
    updateRules();
    
    gameState.players.forEach((player, index) => {
        const playerDiv = document.getElementById(`player-${index}`);
        if (playerDiv) {
            const healthDiv = playerDiv.querySelector('.player-health');
            if(healthDiv) healthDiv.textContent = `❤️ ${player.health}`;
            
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
    if(!rules) return;
    
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
    if(!logDiv) return;
    
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
    if(!input) return;
    
    const guess = parseInt(input.value);

    if (isNaN(guess) || guess < 0 || guess > 100) {
        alert('Lütfen 0-100 arası geçerli bir sayı girin!');
        input.classList.add('invalid');
        return;
    }

    input.classList.remove('invalid');
    gameState.players[0].guess = guess;
    gameState.waitingForGuess = false;
    
    const inputArea = document.getElementById('guessInputArea');
    if(inputArea) inputArea.style.display = 'none';
    
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
            if(playerDiv) playerDiv.classList.add('thinking');
        }
    });

    setTimeout(() => {
        gameState.players.forEach((player, index) => {
            if (player.isBot && player.active) {
                player.guess = generateBotGuess(player);
                const playerDiv = document.getElementById(`player-${index}`);
                if(playerDiv) {
                    playerDiv.classList.remove('thinking');
                    const guessDiv = playerDiv.querySelector('.player-guess');
                    if(guessDiv) {
                        guessDiv.textContent = player.guess;
                        guessDiv.classList.add('show');
                    }
                }
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
    
    // Bot Stratejileri
    if (bot.botType === "KAOTIK") {
        const chaos = Math.random();
        if (chaos < 0.25) guess = Math.random() * 15;
        else if (chaos < 0.5) guess = 85 + Math.random() * 15;
        else if (chaos < 0.75) guess = Math.random() * 100;
        else guess = gameState.round % 2 === 0 ? Math.floor(Math.random() * 5) * 20 + 1 : Math.floor(Math.random() * 5) * 20;
    } 
    else if (bot.botType === "VAHSI") {
        const wildness = Math.random();
        if (wildness < 0.4) guess = Math.random() * 20;
        else if (wildness < 0.8) guess = 80 + Math.random() * 20;
        else guess = 40 + Math.random() * 20;
    } 
    else if (bot.botType === "RULET") {
        const rouletteNumbers = [0, 7, 13, 21, 33, 42, 55, 69, 77, 88, 100];
        if(Math.random() < 0.6) guess = rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)];
        else guess = Math.random() * 100;
    } 
    else { // Şanslı
        if (bot.history.length > 0) {
            const avgTarget = bot.history.reduce((sum, h) => sum + h.target, 0) / bot.history.length;
            guess = Math.floor(avgTarget) + (Math.random() - 0.5) * 40;
        } else {
            guess = Math.random() * 100;
        }
    }
    
    // Son dokunuş rastgeleliği
    guess = Math.max(0, Math.min(100, Math.round(guess + (Math.random() - 0.5) * 5)));
    return guess;
}

function calculateResults() {
    const activePlayers = gameState.players.filter(p => p.active);
    const guesses = activePlayers.map(p => p.guess);
    const average = guesses.reduce((sum, g) => sum + g, 0) / guesses.length;
    const target = Math.round(average * 0.8);

    const targetInfo = document.getElementById('targetInfo');
    if(targetInfo) targetInfo.innerHTML = `Ortalama: ${average.toFixed(2)}<br>Hedef (x0.8): ${target}`;

    // Geçmişe ekle
    gameState.players.forEach(player => {
        if (player.isBot && player.active) {
            player.history.push({ target, guess: player.guess });
        }
    });

    addLog(`📊 Ortalama: ${average.toFixed(2)}, Hedef: ${target}`, 'log-result');

    // Kural 1: Aynı sayı cezası (2 veya daha fazla kişi aynı sayıyı seçerse)
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

    // Kazananı bul
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

    // Kural 3: 0 ve 100 kuralı (Sonlara doğru)
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

    // Kazanan Efekti
    if(winner) {
        const winnerIndex = gameState.players.indexOf(winner);
        const winnerDiv = document.getElementById(`player-${winnerIndex}`);
        if(winnerDiv) {
            const ring = document.createElement('div');
            ring.className = 'winner-ring';
            winnerDiv.appendChild(ring);
            setTimeout(() => { if (ring.parentNode) ring.parentNode.removeChild(ring); }, 1500);
        }
        addLog(`🏆 KAZANAN: ${winner.name} (Tahmin: ${winner.guess}, Fark: ${minDiff})`, 'log-result');
    }

    setTimeout(() => { checkEliminations(); }, 3000);
}

function applyNormalRules(activePlayers, winner, exactGuess) {
    // Kural 2: Tam isabet cezası
    if (gameState.eliminatedCount >= 2 && exactGuess) {
        addLog('🔥 TAM DOĞRU TAHMİN! Diğer oyuncular -2 puan kaybediyor!', 'log-result');
        activePlayers.forEach(p => { if (p !== winner) p.health -= 2; });
    } else {
        activePlayers.forEach(p => { if (p !== winner) p.health--; });
    }
}

function checkEliminations() {
    let someoneEliminated = false;
    gameState.players.forEach((player, index) => {
        // Eğer oyuncu aktifse ama canı bittiyse -> Elendi
        if (player.active && player.health <= 0) {
            player.active = false;
            gameState.eliminatedCount++;
            someoneEliminated = true;
            
            // ELENME LİSTESİNE EKLE (Sıralama için)
            gameState.eliminationOrder.push(player);
            
            const playerDiv = document.getElementById(`player-${index}`);
            if(playerDiv) playerDiv.classList.add('eliminated');
            addLog(`💀 ${player.name} elendi!`, 'log-elimination');
        }
    });

    const remainingPlayers = gameState.players.filter(p => p.active);
    
    // Oyun Bitti mi? (1 kişi kaldıysa veya herkes elendiyse)
    if (remainingPlayers.length <= 1) {
        setTimeout(() => endGame(), 2000);
    } else {
        gameState.round++;
        setTimeout(() => nextRound(), 3000);
    }
}

function nextRound() {
    document.querySelectorAll('.player-guess').forEach(g => { g.classList.remove('show'); });
    
    const targetInfo = document.getElementById('targetInfo');
    if(targetInfo) targetInfo.textContent = 'Tahminlerinizi yapın...';
    
    const inputArea = document.getElementById('guessInputArea');
    if(inputArea) inputArea.style.display = 'block';
    
    const input = document.getElementById('tableGuessInput');
    if(input) input.value = '';
    
    gameState.waitingForGuess = true;
    updateDisplay();
    addLog(`🎯 Round ${gameState.round} başladı!`, 'log-round');
}

// --- OYUN SONU VE PUAN GÖNDERİMİ ---
function endGame() {
    gameState.gameActive = false;
    
    // Kalan son kişiyi (varsa) de listeye ekle
    const survivor = gameState.players.find(p => p.active);
    if (survivor) {
        gameState.eliminationOrder.push(survivor);
    }

    // Listeyi ters çevir: [1.olan, 2.olan, 3.olan, ...]
    const finalRanking = [...gameState.eliminationOrder].reverse();

    // İnsan oyuncunun (Sen) sırasını bul
    const myRankIndex = finalRanking.findIndex(p => !p.isBot);
    const myRank = myRankIndex + 1; // 1, 2, 3, 4 veya 5

    // Sıralamaya göre Dirhem puanı
    let earnedDirhems = 0;
    if (myRank === 1) earnedDirhems = 100;      // 1. Sıra: 100 Dirhem (500 Puan)
    else if (myRank === 2) earnedDirhems = 50;  // 2. Sıra: 50 Dirhem
    else if (myRank === 3) earnedDirhems = 20;  // 3. Sıra: 20 Dirhem
    else if (myRank === 4) earnedDirhems = 10;  // 4. Sıra: 10 Dirhem
    else earnedDirhems = 5;                     // 5. Sıra: 5 Dirhem

    // Skoru Ana Sisteme Gönder
    sendScoreToParent(earnedDirhems);

    // Ekrana Sonuç Mesajı Bas
    let message = '';
    if (myRank === 1) {
        message = `🎉 TEBRİKLER! ZİRVEDESİN!\n(+${earnedDirhems} Dirhem)`;
    } else {
        message = `Oyun Bitti! Sıralaman: ${myRank}.\n(+${earnedDirhems} Dirhem)`;
    }

    const msgEl = document.getElementById('gameOverMessage');
    if(msgEl) msgEl.innerText = message;
    
    const overlay = document.getElementById('gameOverOverlay');
    if(overlay) overlay.style.display = 'flex';
}

function startNewGame() {
    // State'i sıfırla
    gameState = {
        round: 1,
        eliminatedCount: 0,
        eliminationOrder: [], // Sıfırla
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
    
    const overlay = document.getElementById('gameOverOverlay');
    if(overlay) overlay.style.display = 'none';
    
    const inputArea = document.getElementById('guessInputArea');
    if(inputArea) inputArea.style.display = 'block';
    
    const input = document.getElementById('tableGuessInput');
    if(input) input.value = '';
    
    const targetInfo = document.getElementById('targetInfo');
    if(targetInfo) targetInfo.textContent = 'Tahminlerinizi yapın...';
    
    addLog('🎮 YENİ OYUN BAŞLADI! Sen vs 4 Çılgın Bot!', 'log-round');
}

// Event Listeners (Güvenli ekleme)
const tableInput = document.getElementById('tableGuessInput');
if(tableInput) {
    tableInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') submitTableGuess();
    });
    tableInput.addEventListener('input', function(e) {
        const value = parseInt(e.target.value);
        const submitBtn = document.getElementById('tableSubmitBtn');
        if(submitBtn) {
            if (isNaN(value) || value < 0 || value > 100) {
                submitBtn.disabled = true;
                e.target.classList.add('invalid');
            } else {
                submitBtn.disabled = false;
                e.target.classList.remove('invalid');
            }
        }
    });
}

// --- VERİ GÖNDERME FONKSİYONU ---
function sendScoreToParent(score) {
    window.parent.postMessage({
        type: 'GAME_OVER',
        gameId: 4,               // Terazi Oyunu ID'si
        score: score,            // Kazanılan Dirhem
        pointName: 'Dirhem'      // Puan Adı
    }, '*');
    console.log("Skor ana sisteme gönderildi:", score);
}

// --- ARKA PLAN EFEKTLERİ (Yıldızlar) ---
function createStarryBackground() {
    // Canvas yoksa oluştur
    if(document.querySelector('canvas')) return; // Zaten varsa tekrar oluşturma

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
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 2;
            this.speed = Math.random() * 0.5 + 0.1;
            this.opacity = Math.random() * 0.8 + 0.2;
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0) { this.x = canvas.width; this.reset(); }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    const stars = [];
    for (let i = 0; i < 150; i++) stars.push(new Star());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Arka plan rengi (Gradient)
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(15, 23, 42, 1)'); // Koyu lacivert
        gradient.addColorStop(1, 'rgba(30, 41, 59, 1)'); // Daha açık ton
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => { star.update(); star.draw(); });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    animate();
}