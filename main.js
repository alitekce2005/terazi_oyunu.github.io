// Game state
        let gameState = {
            round: 1,
            eliminatedCount: 0,
            players: [
                { name: "Sen", health: 10, active: true, isBot: false, guess: 0, botType: null, history: [] },
                { name: "Kaos Bot", health: 10, active: true, isBot: true, guess: 0, botType: "KAOTIK", history: [] },
                { name: "Wild Bot", health: 10, active: true, isBot: true, guess: 0, botType: "VAHSI", history: [] },
                { name: "Rulo Bot", health: 10, active: true, isBot: true, guess: 0, botType: "RULET", history: [] },
                { name: "Şans Bot", health: 10, active: true, isBot: true, guess: 0, botType: "ŞANSLI", history: [] }
            ],
            gameLog: [],
            waitingForGuess: false
        };

        const botStrategies = {
            "KAOTIK": "🌪️ Kaotik",
            "VAHSI": "🦁 Vahşi", 
            "RULET": "🎰 Rulet",
            "ŞANSLI": "🍀 Şanslı"
        };

        function initGame() {
            createPlayers();
            updateDisplay();
            showMenu("Hoş geldiniz! Yepyeni öngörülemez botlara karşı kazanabilecek misin?");
        }

        function createPlayers() {
            const table = document.getElementById('gameTable');
            
            // Remove existing players
            const existingPlayers = table.querySelectorAll('.player');
            existingPlayers.forEach(p => p.remove());

            gameState.players.forEach((player, index) => {
                const playerDiv = document.createElement('div');
                playerDiv.className = `player ${player.isBot ? 'bot' : 'human'}`;
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
            // Update round info
            document.getElementById('roundInfo').textContent = `Round ${gameState.round}`;
            
            // Update players
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
            
            // Update rules
            updateRules();
            
            // Update game log
            updateGameLog();
        }

        function updateRules() {
            const rulesList = document.getElementById('rulesList');
            let rules = '<div class="rule-item">🎯 TEMEL: 0-100 arası sayı seç, ortalama x0.8\'e en yakın olan kazanır!</div>';
            
            if (gameState.eliminatedCount >= 1) {
                rules += '<div class="rule-item">🔴 KURAL 1: Aynı sayıyı seçenler -1 puan kaybeder!</div>';
            }
            if (gameState.eliminatedCount >= 2) {
                rules += '<div class="rule-item">🔴 KURAL 2: Tam doğru tahmin, diğerlerinin -2 puan kaybetmesine neden olur!</div>';
            }
            if (gameState.eliminatedCount >= 3) {
                rules += '<div class="rule-item">🔴 KURAL 3: Biri 0 seçerse, diğeri 100 seçerek kazanabilir!</div>';
            }
            
            rulesList.innerHTML = rules;
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

        function submitGuess() {
            const input = document.getElementById('guessInput');
            const guess = parseInt(input.value);
            
            if (isNaN(guess) || guess < 0 || guess > 100) {
                alert('Lütfen 0-100 arası geçerli bir sayı girin!');
                return;
            }
            
            gameState.players[0].guess = guess;
            gameState.waitingForGuess = false;
            
            document.getElementById('inputSection').style.display = 'none';
            
            addLog(`🧑 Sen: ${guess} tahmini yaptın`, 'log-round');
            
            setTimeout(() => {
                calculateBotGuesses();
            }, 1000);
        }

        function calculateBotGuesses() {
            addLog('🤖 Botlar çılgın tahminler yapıyor...', 'log-round');
            
            // Add thinking animation
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
                    // Tamamen öngörülemez - her round farklı davranış
                    const chaos = Math.random();
                    if (chaos < 0.25) {
                        // Aşırı düşük değerler
                        guess = Math.random() * 15;
                    } else if (chaos < 0.5) {
                        // Aşırı yüksek değerler
                        guess = 85 + Math.random() * 15;
                    } else if (chaos < 0.75) {
                        // Tamamen rastgele
                        guess = Math.random() * 100;
                    } else {
                        // Garip sayılar (tek/çift pattern)
                        guess = gameState.round % 2 === 0 ? 
                               Math.floor(Math.random() * 5) * 20 + 1 : // Tek sayılar
                               Math.floor(Math.random() * 5) * 20;     // Çift sayılar
                    }
                    break;
                    
                case "VAHSI":
                    // Aşırı uç değerlere gider, orta değerleri pek sevmez
                    const wildness = Math.random();
                    if (wildness < 0.4) {
                        // 0-20 arası
                        guess = Math.random() * 20;
                    } else if (wildness < 0.8) {
                        // 80-100 arası
                        guess = 80 + Math.random() * 20;
                    } else {
                        // Bazen 40-60 arası da seçer
                        guess = 40 + Math.random() * 20;
                    }
                    // Bazen önceki tahmininin tam tersini yapar
                    if (bot.history.length > 0 && Math.random() < 0.3) {
                        const lastGuess = bot.history[bot.history.length - 1].guess;
                        guess = 100 - lastGuess + (Math.random() - 0.5) * 20;
                    }
                    break;
                    
                case "RULET":
                    // Rulet wheel gibi - belirli sayılara odaklanır
                    const rouletteNumbers = [0, 7, 13, 21, 33, 42, 55, 69, 77, 88, 100];
                    const randomSpin = Math.random();
                    
                    if (randomSpin < 0.6) {
                        // Rulet sayılarından birini seç
                        guess = rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)];
                    } else if (randomSpin < 0.8) {
                        // Fibonacci benzeri sayılar
                        const fibLike = [1, 3, 8, 13, 21, 34, 55, 89];
                        guess = fibLike[Math.floor(Math.random() * fibLike.length)];
                    } else {
                        // Tamamen rastgele ama 10'un katları tercihi
                        guess = Math.floor(Math.random() * 11) * 10 + Math.floor(Math.random() * 10);
                    }
                    break;
                    
                case "ŞANSLI":
                    // Şanslı sayılara inanır ama çok rastgele
                    const luckyPatterns = Math.random();
                    
                    if (luckyPatterns < 0.2) {
                        // 7'nin katları ve benzeri "şanslı" sayılar
                        const luckyBases = [7, 13, 21, 27, 37, 49, 63, 77, 91];
                        guess = luckyBases[Math.floor(Math.random() * luckyBases.length)];
                    } else if (luckyPatterns < 0.4) {
                        // Çift rakamlar (11, 22, 33, etc.)
                        const digit = Math.floor(Math.random() * 10);
                        guess = digit * 11;
                    } else if (luckyPatterns < 0.6) {
                        // Reverse sayılar (12 -> 21, 34 -> 43)
                        const base = Math.floor(Math.random() * 90) + 10;
                        const reversed = parseInt(base.toString().split('').reverse().join(''));
                        guess = reversed <= 100 ? reversed : base;
                    } else {
                        // Önceki roundların toplam ortalamasına dayalı "şanslı" tahmin
                        if (bot.history.length > 0) {
                            const avgTarget = bot.history.reduce((sum, h) => sum + h.target, 0) / bot.history.length;
                            guess = Math.floor(avgTarget) + (Math.random() - 0.5) * 40;
                        } else {
                            guess = Math.random() * 100;
                        }
                    }
                    break;
            }
            
            // Ekstra randomness katmanı - bazen bot'un normal stratejisinden tamamen sapabilir
            if (Math.random() < 0.15) {
                guess = Math.random() * 100;
            }
            
            // Round sayısına göre ek kaos faktörü
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
            
            // Store history for bots
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
            
            // Show winner
            const winnerIndex = gameState.players.indexOf(winner);
            const winnerDiv = document.getElementById(`player-${winnerIndex}`);
            winnerDiv.classList.add('winner');
            
            addLog(`🏆 KAZANAN: ${winner.name} (Tahmin: ${winner.guess}, Fark: ${minDiff})`, 'log-result');
            
            setTimeout(() => {
                winnerDiv.classList.remove('winner');
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
            // Hide all guesses
            document.querySelectorAll('.player-guess').forEach(g => {
                g.classList.remove('show');
            });
            
            // Reset target info
            document.getElementById('targetInfo').textContent = 'Tahminlerinizi yapın...';
            
            // Show input section again
            document.getElementById('inputSection').style.display = 'block';
            document.getElementById('guessInput').value = '';
            
            gameState.waitingForGuess = true;
            updateDisplay();
            
            addLog(`🎯 Round ${gameState.round} başladı!`, 'log-round');
        }

        function endGame() {
            const remainingPlayers = gameState.players.filter(p => p.active);
            
            if (remainingPlayers.length === 1) {
                const winner = remainingPlayers[0];
                if (winner.isBot) {
                    showMenu(`😔 ${winner.name} (${botStrategies[winner.botType]}) seni yendi! Çılgın stratejisi işe yaradı! Toplam ${gameState.round-1} round oynandı.`);
                } else {
                    showMenu(`🎉 TEBRİKLER! Öngörülemez botları yendin! Müthiş analiz! Toplam ${gameState.round-1} round oynandı.`);
                }
            } else {
                showMenu(`💥 Kimse kazanamadı! Tüm oyuncular elendi. Toplam ${gameState.round-1} round oynandı.`);
            }
        }

        function startNewGame() {
            gameState = {
                round: 1,
                eliminatedCount: 0,
                players: [
                    { name: "Sen", health: 10, active: true, isBot: false, guess: 0, botType: null, history: [] },
                    { name: "Kaos Bot", health: 10, active: true, isBot: true, guess: 0, botType: "KAOTIK", history: [] },
                    { name: "Wild Bot", health: 10, active: true, isBot: true, guess: 0, botType: "VAHSI", history: [] },
                    { name: "Rulo Bot", health: 10, active: true, isBot: true, guess: 0, botType: "RULET", history: [] },
                    { name: "Şans Bot", health: 10, active: true, isBot: true, guess: 0, botType: "ŞANSLI", history: [] }
                ],
                gameLog: [],
                waitingForGuess: true
            };
            
            createPlayers();
            updateDisplay();
            hideMenu();
            
            // Show input section
            document.getElementById('inputSection').style.display = 'block';
            document.getElementById('guessInput').value = '';
            document.getElementById('targetInfo').textContent = 'Tahminlerinizi yapın...';
            
            addLog('🎮 YENİ OYUN BAŞLADI! Sen vs 4 Çılgın Bot!', 'log-round');
            addLog('🤖 Bu sefer botlar tamamen öngörülemez!', 'log-round');
        }

        function continueGame() {
            hideMenu();
        }

        function showRules() {
            const rules = `
                🎯 TEMEL KURAL: 0-100 arası bir sayı seçin. Tüm tahminlerin ortalaması x0.8'e en yakın olan kazanır!
                
                📈 PROGRESİF KURALLAR:
                • 1 kişi elendikten sonra: Aynı sayıyı seçenler -1 puan kaybeder
                • 2 kişi elendikten sonra: Tam doğru tahmin, diğerlerinin -2 puan kaybetmesine neden olur
                • 3 kişi elendikten sonra: Biri 0 seçerse, diğeri 100 seçerek özel kuralla kazanabilir
                
                🤖 YENİ ÇILGIN BOT STRATEJİLERİ:
                🌪️ Kaotik Bot: Tamamen öngörülemez, her round farklı davranır
                🦁 Vahşi Bot: Aşırı uç değerlere gider, orta değerleri sevmez
                🎰 Rulet Bot: Belirli "şanslı" sayılara odaklanır
                🍀 Şanslı Bot: Şanslı sayılara inanır ama çok rastgele
                
                ⚠️ DİKKAT: Bu botlar önceki versiyondan çok daha rastgele ve öngörülemez!
                💡 İPUCU: Artık bot davranışlarını tahmin etmek neredeyse imkansız!
            `;
            alert(rules);
        }

        function showMenu(message = '') {
            document.getElementById('menuMessage').textContent = message;
            document.getElementById('menuOverlay').style.display = 'flex';
            
            // Show continue button only if game is in progress
            const continueBtn = document.getElementById('continueBtn');
            if (gameState.round > 1 && gameState.players.filter(p => p.active).length > 1) {
                continueBtn.style.display = 'block';
            } else {
                continueBtn.style.display = 'none';
            }
        }

        function hideMenu() {
            document.getElementById('menuOverlay').style.display = 'none';
        }

        // Event listeners
        document.getElementById('guessInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitGuess();
            }
        });

        document.getElementById('guessInput').addEventListener('input', function(e) {
            const value = parseInt(e.target.value);
            const submitBtn = document.getElementById('submitBtn');
            
            if (isNaN(value) || value < 0 || value > 100) {
                submitBtn.disabled = true;
                e.target.style.borderColor = '#f44336';
            } else {
                submitBtn.disabled = false;
                e.target.style.borderColor = '#9c27b0';
            }
        });

        // Escape key to show menu
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (document.getElementById('menuOverlay').style.display === 'flex') {
                    hideMenu();
                } else {
                    showMenu('Oyun duraklatıldı');
                }
            }
        });

        // Touch events for mobile
        let touchStartY = 0;
        document.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', function(e) {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;
            
            // Swipe up to show menu
            if (diff > 50) {
                if (document.getElementById('menuOverlay').style.display !== 'flex') {
                    showMenu('Oyun duraklatıldı');
                }
            }
        });

        // Initialize game when page loads
        window.addEventListener('load', function() {
            initGame();
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            const table = document.getElementById('gameTable');
            const tableRect = table.getBoundingClientRect();
            
            document.querySelectorAll('.player').forEach((player, index) => {
                // Positions are handled by CSS, but we can add dynamic adjustments here if needed
            });
        });

        // Prevent zoom on mobile double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Add some visual feedback for interactions
        document.querySelectorAll('.menu-button, .submit-btn').forEach(button => {
            button.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 100);
            });
        });

        // Add particle effect for winner
        function createWinnerEffect(playerElement) {
            const rect = playerElement.getBoundingClientRect();
            
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 6px;
                    height: 6px;
                    background: gold;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1000;
                    left: ${rect.left + rect.width/2}px;
                    top: ${rect.top + rect.height/2}px;
                `;
                
                document.body.appendChild(particle);
                
                const angle = (i / 20) * Math.PI * 2;
                const velocity = 100 + Math.random() * 100;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                let x = rect.left + rect.width/2;
                let y = rect.top + rect.height/2;
                let opacity = 1;
                
                const animate = () => {
                    x += vx * 0.02;
                    y += vy * 0.02;
                    opacity -= 0.02;
                    
                    particle.style.left = x + 'px';
                    particle.style.top = y + 'px';
                    particle.style.opacity = opacity;
                    
                    if (opacity > 0) {
                        requestAnimationFrame(animate);
                    } else {
                        document.body.removeChild(particle);
                    }
                };
                
                setTimeout(() => requestAnimationFrame(animate), i * 50);
            }
        }

        // Enhanced winner display with particles
        function enhancedWinnerDisplay(winnerIndex) {
            const winnerDiv = document.getElementById(`player-${winnerIndex}`);
            winnerDiv.classList.add('winner');
            createWinnerEffect(winnerDiv);
        }

        // Add sound effects (optional - you can add audio files)
        function playSound(type) {
            // You can add sound effects here
            // const audio = new Audio(`sounds/${type}.mp3`);
            // audio.play().catch(() => {}); // Ignore errors if sound fails
        }

        // Performance optimization: Throttled resize handler
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                updateDisplay();
            }, 250);
        });