// =====================================
        // GAME CONFIGURATION - Easy to modify!
        // =====================================
        
        // Map Layout Configuration
        const MAP_CONFIG = {
            width: 20,
            height: 15,
            tileSize: 40,
            
            // Define different area types
            areas: {
                carpet: { x1: 8, y1: 6, x2: 13, y2: 11, encounterRate: 0.03 },
                // Add more areas here like: entrance: { x1: 9, y1: 13, x2: 11, y2: 14 }
            }
        };

        // Furniture/Objects Configuration - Easy to add new ones!
        const FURNITURE_CONFIG = [
            // Top bookshelf
            { type: 'bookshelf', x: 6, y: 1, width: 10, height: 1 },
            
            // Left side machines
            { type: 'machine', x: 2, y: 7, width: 1, height: 1 },
            { type: 'machine', x: 2, y: 8, width: 1, height: 1 },
            
            // Right side stairs
            { type: 'stairs', x: 17, y: 4, width: 1, height: 5 },
            
            // Center computer
            { type: 'computer', x: 11, y: 6, width: 1, height: 1 },
            
            // Add new furniture here:
            // { type: 'desk', x: 5, y: 10, width: 2, height: 1 },
            // { type: 'chair', x: 5, y: 11, width: 1, height: 1 },
        ];

        // NPC Configuration - Super easy to add new characters!
        const NPC_CONFIG = [
            {
                name: 'Professor Oak',
                type: 'npc',
                x: 320, y: 400,
                sprite: 'professor',
                dialog: 'Welcome to my lab! This world has been corrupted by dark energy. You must help restore balance!',
                interaction: 'dialog'
            },
            {
                name: 'Lab Intruder',
                type: 'criminal',
                x: 160, y: 320,
                sprite: 'criminal',
                level: 2,
                interaction: 'battle'
            },
            {
                name: 'Dark Scientist',
                type: 'criminal',
                x: 600, y: 280,
                sprite: 'criminal',
                level: 3,
                interaction: 'battle'
            },
            {
                name: 'Research Assistant',
                type: 'npc',
                x: 480, y: 450,
                sprite: 'assistant',
                dialog: 'The computer contains data about the dark creatures. Be careful!',
                interaction: 'dialog'
            },
            {
                name: 'Shadow Thief',
                type: 'criminal',
                x: 240, y: 200,
                sprite: 'criminal',
                level: 2,
                interaction: 'battle'
            }
            // Add new NPCs here:
            // {
            //     name: 'Gym Leader',
            //     type: 'gym_leader',
            //     x: 400, y: 200,
            //     sprite: 'gym_leader',
            //     level: 8,
            //     dialog: 'Challenge me for a badge!',
            //     interaction: 'gym_battle',
            //     badge_reward: true
            // }
        ];

        // Enemy Types for Wild Encounters
        const WILD_ENEMIES = [
            { name: 'Shadow Beast', level: [1, 2, 3] },
            { name: 'Dark Spirit', level: [1, 2, 3] },
            { name: 'Void Creature', level: [1, 2, 3] },
            // Add more: { name: 'Lab Rat', level: [1, 2] },
        ];

        // Sprite Styles Configuration
        const SPRITE_STYLES = {
            professor: {
                background: '#4ecdc4',
                icon: '👨‍🔬'
            },
            assistant: {
                background: '#45b7d1',
                icon: '👩‍💼'
            },
            criminal: {
                background: '#ff4757',
                icon: '👹'
            },
            gym_leader: {
                background: '#ffa726',
                icon: '🥋'
            },
            trader: {
                background: '#26de81',
                icon: '💰'
            }
            // Add more sprite types here
        };

        // Furniture Styles Configuration
        const FURNITURE_STYLES = {
            bookshelf: {
                background: 'linear-gradient(180deg, #8B4513 0%, #A0522D 20%, #8B4513 40%, #A0522D 60%, #8B4513 80%, #A0522D 100%)',
                borderColor: '#654321'
            },
            machine: {
                background: 'linear-gradient(45deg, #C0C0C0 0%, #A8A8A8 50%, #C0C0C0 100%)',
                borderColor: '#696969'
            },
            stairs: {
                background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 25%, #FF6347 50%, #FF4500 75%, #FF6347 100%)',
                borderColor: '#B22222'
            },
            computer: {
                background: 'linear-gradient(180deg, #4682B4 0%, #5F9EA0 50%, #4682B4 100%)',
                borderColor: '#2F4F4F'
            },
            desk: {
                background: 'linear-gradient(180deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
                borderColor: '#654321'
            },
            chair: {
                background: 'linear-gradient(45deg, #654321 0%, #8B4513 50%, #654321 100%)',
                borderColor: '#4A2C17'
            }
            // Add more furniture styles here
        };

        // =====================================
        // GAME STATE - Don't modify unless needed
        // =====================================
        const gameState = {
            player: {
                x: 400,
                y: 300,
                level: 1,
                exp: 0,
                expToNext: 100,
                hp: 100,
                maxHp: 100,
                badges: 0
            },
            currentEnemy: null,
            inBattle: false,
            inDialog: false,
            npcs: [],
            battleLog: []
        };

        // =====================================
        // MAP GENERATION FUNCTIONS
        // =====================================
        function generateWorld() {
            const overworld = document.getElementById('overworld');
            
            // Generate the floor tiles
            for (let x = 0; x < MAP_CONFIG.width; x++) {
                for (let y = 0; y < MAP_CONFIG.height; y++) {
                    const tile = document.createElement('div');
                    tile.className = 'tile wood-floor';
                    tile.style.left = x * MAP_CONFIG.tileSize + 'px';
                    tile.style.top = y * MAP_CONFIG.tileSize + 'px';
                    
                    // Check if this tile is in a special area
                    for (const [areaName, area] of Object.entries(MAP_CONFIG.areas)) {
                        if (x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2) {
                            tile.classList.add(areaName);
                        }
                    }
                    
                    overworld.appendChild(tile);
                }
            }

            // Add furniture from configuration
            addFurnitureFromConfig();
        }

        function addFurnitureFromConfig() {
            const overworld = document.getElementById('overworld');
            
            FURNITURE_CONFIG.forEach((furnitureItem, index) => {
                const { type, x, y, width, height } = furnitureItem;
                
                // Handle both single tiles and multi-tile furniture
                for (let fx = 0; fx < width; fx++) {
                    for (let fy = 0; fy < height; fy++) {
                        const furniture = document.createElement('div');
                        furniture.className = `furniture ${type}`;
                        furniture.style.left = (x + fx) * MAP_CONFIG.tileSize + 'px';
                        furniture.style.top = (y + fy) * MAP_CONFIG.tileSize + 'px';
                        furniture.style.width = MAP_CONFIG.tileSize + 'px';
                        furniture.style.height = MAP_CONFIG.tileSize + 'px';
                        furniture.dataset.furnitureId = index;
                        
                        // Apply styles from configuration
                        if (FURNITURE_STYLES[type]) {
                            const style = FURNITURE_STYLES[type];
                            furniture.style.background = style.background;
                            furniture.style.borderColor = style.borderColor;
                        }
                        
                        overworld.appendChild(furniture);
                    }
                }
            });
        }

        function spawnNPCs() {
            NPC_CONFIG.forEach((npcConfig, index) => {
                const npcElement = document.createElement('div');
                npcElement.className = `npc ${npcConfig.type}`;
                npcElement.style.left = npcConfig.x + 'px';
                npcElement.style.top = npcConfig.y + 'px';
                npcElement.onclick = () => interactWithNPC(index);
                npcElement.dataset.npcId = index;
                
                // Apply sprite styling
                if (SPRITE_STYLES[npcConfig.sprite]) {
                    const style = SPRITE_STYLES[npcConfig.sprite];
                    npcElement.style.background = style.background;
                }
                
                document.getElementById('overworld').appendChild(npcElement);
                gameState.npcs.push({...npcConfig}); // Copy the config
            });
            
            // Update NPC icons after they're added to DOM
            updateNPCSprites();
        }

        function updateNPCSprites() {
            gameState.npcs.forEach((npc, index) => {
                const npcElement = document.querySelector(`[data-npc-id="${index}"]`);
                if (npcElement && SPRITE_STYLES[npc.sprite]) {
                    npcElement.style.setProperty('--icon', `"${SPRITE_STYLES[npc.sprite].icon}"`);
                }
            });
        }

        function setupEventListeners() {
            document.addEventListener('keydown', handleKeyPress);
            document.addEventListener('keyup', handleKeyUp);
        }

        function handleKeyPress(e) {
            if (gameState.inBattle || gameState.inDialog) return;

            const player = document.getElementById('player');
            const speed = 40;
            let newX = gameState.player.x;
            let newY = gameState.player.y;

            switch(e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    newY = Math.max(0, newY - speed);
                    break;
                case 's':
                case 'arrowdown':
                    newY = Math.min(560, newY + speed);
                    break;
                case 'a':
                case 'arrowleft':
                    newX = Math.max(0, newX - speed);
                    break;
                case 'd':
                case 'arrowright':
                    newX = Math.min(760, newX + speed);
                    break;
                case ' ':
                    checkForInteractions();
                    return;
            }

            // Update player position
            gameState.player.x = newX;
            gameState.player.y = newY;
            player.style.left = newX + 'px';
            player.style.top = newY + 'px';

            // Add walking animation
            player.classList.add('walking');
            setTimeout(() => {
                player.classList.remove('walking');
            }, 200);

            // Check for random encounters based on area configuration
            const tileX = Math.floor(gameState.player.x / MAP_CONFIG.tileSize);
            const tileY = Math.floor(gameState.player.y / MAP_CONFIG.tileSize);
            
            // Check each defined area for encounters
            for (const [areaName, area] of Object.entries(MAP_CONFIG.areas)) {
                if (tileX >= area.x1 && tileX <= area.x2 && 
                    tileY >= area.y1 && tileY <= area.y2 && 
                    area.encounterRate && Math.random() < area.encounterRate) {
                    startWildBattle();
                    break;
                }
            }
        }

        function handleKeyUp(e) {
            // Handle key releases if needed
        }

        function startBattle(enemy) {
            gameState.inBattle = true;
            gameState.currentEnemy = {
                ...enemy,
                hp: enemy.level * 30 + 50,
                maxHp: enemy.level * 30 + 50
            };
            
            document.getElementById('battleScreen').style.display = 'flex';
            addBattleLog(`A wild ${enemy.name} appeared!`);
            updateBattleUI();
        }
            const playerX = gameState.player.x;
            const playerY = gameState.player.y;
            
            gameState.npcs.forEach((npc, index) => {
                const distance = Math.sqrt(
                    Math.pow(playerX - npc.x, 2) + Math.pow(playerY - npc.y, 2)
                );
                
                if (distance < 60) {
                    interactWithNPC(index);
                }
            });
        

        // =====================================
        // INTERACTION SYSTEM
        // =====================================
        function interactWithNPC(index) {
            const npc = gameState.npcs[index];
            
            switch(npc.interaction) {
                case 'battle':
                    startBattle(npc);
                    break;
                case 'gym_battle':
                    if (gameState.player.level >= 5) {
                        startBattle({...npc, isGymLeader: true});
                    } else {
                        showDialog('You need to be at least level 5 to challenge me!');
                    }
                    break;
                case 'dialog':
                    showDialog(npc.dialog, () => {
                        if (npc.badge_reward && gameState.player.level >= 5) {
                            gameState.player.badges++;
                            showDialog('Congratulations! You earned a badge!');
                            updateUI();
                        }
                    });
                    break;
                case 'shop':
                    // Future: implement shop system
                    showDialog('Shop coming soon!');
                    break;
                default:
                    showDialog(npc.dialog || `Hello! I'm ${npc.name}.`);
            }
        }

        function startWildBattle() {
            const randomEnemy = WILD_ENEMIES[Math.floor(Math.random() * WILD_ENEMIES.length)];
            const levelRange = randomEnemy.level;
            const randomLevel = levelRange[Math.floor(Math.random() * levelRange.length)];
            
            const enemy = {
                name: randomEnemy.name,
                level: randomLevel,
                type: 'wild'
            };
            
            startBattle(enemy);
        }

        // =====================================
        // UTILITY FUNCTIONS FOR EASY EXPANSION
        // =====================================
        
        // Add new NPC at runtime
        function addNewNPC(npcConfig) {
            const index = gameState.npcs.length;
            const npcElement = document.createElement('div');
            npcElement.className = `npc ${npcConfig.type}`;
            npcElement.style.left = npcConfig.x + 'px';
            npcElement.style.top = npcConfig.y + 'px';
            npcElement.onclick = () => interactWithNPC(index);
            npcElement.dataset.npcId = index;
            
            if (SPRITE_STYLES[npcConfig.sprite]) {
                const style = SPRITE_STYLES[npcConfig.sprite];
                npcElement.style.background = style.background;
                npcElement.style.setProperty('--icon', `"${style.icon}"`);
            }
            
            document.getElementById('overworld').appendChild(npcElement);
            gameState.npcs.push({...npcConfig});
        }

        // Remove NPC by index
        function removeNPC(index) {
            const npcElement = document.querySelector(`[data-npc-id="${index}"]`);
            if (npcElement) {
                npcElement.remove();
            }
            gameState.npcs.splice(index, 1);
        }

        // Add new furniture at runtime
        function addNewFurniture(furnitureConfig) {
            const { type, x, y, width = 1, height = 1 } = furnitureConfig;
            const overworld = document.getElementById('overworld');
            
            for (let fx = 0; fx < width; fx++) {
                for (let fy = 0; fy < height; fy++) {
                    const furniture = document.createElement('div');
                    furniture.className = `furniture ${type}`;
                    furniture.style.left = (x + fx) * MAP_CONFIG.tileSize + 'px';
                    furniture.style.top = (y + fy) * MAP_CONFIG.tileSize + 'px';
                    furniture.style.width = MAP_CONFIG.tileSize + 'px';
                    furniture.style.height = MAP_CONFIG.tileSize + 'px';
                    
                    if (FURNITURE_STYLES[type]) {
                        const style = FURNITURE_STYLES[type];
                        furniture.style.background = style.background;
                        furniture.style.borderColor = style.borderColor;
                    }
                    
                    overworld.appendChild(furniture);
                }
            }
        }

        // =====================================
        // MAIN GAME INITIALIZATION
        // =====================================
        function initGame() {
            generateWorld();
            spawnNPCs();
            updateUI();
            setupEventListeners();
        }

        function playerAttack(attackType) {
            if (!gameState.inBattle) return;

            let damage = 0;
            let attackName = '';
            
            switch(attackType) {
                case 'punch':
                    damage = Math.floor(Math.random() * 20) + 15;
                    attackName = 'Punch';
                    break;
                case 'kick':
                    damage = Math.floor(Math.random() * 25) + 20;
                    attackName = 'Kick';
                    break;
                case 'special':
                    damage = Math.floor(Math.random() * 35) + 25;
                    attackName = 'Special Attack';
                    break;
            }

            // Apply level bonus
            damage += gameState.player.level * 2;
            
            gameState.currentEnemy.hp = Math.max(0, gameState.currentEnemy.hp - damage);
            addBattleLog(`You used ${attackName}! Dealt ${damage} damage!`);
            
            // Damage animation
            document.getElementById('enemyCombatant').classList.add('damage-animation');
            setTimeout(() => {
                document.getElementById('enemyCombatant').classList.remove('damage-animation');
            }, 300);

            updateBattleUI();

            if (gameState.currentEnemy.hp <= 0) {
                setTimeout(() => enemyDefeated(), 1000);
            } else {
                setTimeout(() => enemyAttack(), 1500);
            }
        }

        function enemyAttack() {
            if (!gameState.inBattle) return;

            const damage = Math.floor(Math.random() * 15) + 10 + gameState.currentEnemy.level;
            gameState.player.hp = Math.max(0, gameState.player.hp - damage);
            
            addBattleLog(`${gameState.currentEnemy.name} attacked! You took ${damage} damage!`);
            
            // Damage animation
            document.getElementById('playerCombatant').classList.add('damage-animation');
            setTimeout(() => {
                document.getElementById('playerCombatant').classList.remove('damage-animation');
            }, 300);

            updateBattleUI();
            updateUI();

            if (gameState.player.hp <= 0) {
                setTimeout(() => playerDefeated(), 1000);
            }
        }

        function enemyDefeated() {
            const expGained = gameState.currentEnemy.level * 25 + 50;
            gameState.player.exp += expGained;
            
            addBattleLog(`${gameState.currentEnemy.name} was defeated! Gained ${expGained} EXP!`);
            
            // Check for level up
            if (gameState.player.exp >= gameState.player.expToNext) {
                levelUp();
            }
            
            setTimeout(() => endBattle(), 2000);
        }

        function levelUp() {
            gameState.player.level++;
            gameState.player.exp -= gameState.player.expToNext;
            gameState.player.expToNext = Math.floor(gameState.player.expToNext * 1.5);
            gameState.player.maxHp += 20;
            gameState.player.hp = gameState.player.maxHp; // Full heal on level up
            
            addBattleLog(`Level up! You reached level ${gameState.player.level}!`);
            
            // Level up animation
            document.getElementById('playerCombatant').classList.add('level-up-animation');
            setTimeout(() => {
                document.getElementById('playerCombatant').classList.remove('level-up-animation');
            }, 800);
        }

        function playerDefeated() {
            addBattleLog('You were defeated! You lost some EXP...');
            gameState.player.exp = Math.max(0, gameState.player.exp - 50);
            gameState.player.hp = Math.floor(gameState.player.maxHp * 0.5);
            setTimeout(() => endBattle(), 2000);
        }

        function attemptRun() {
            if (Math.random() < 0.7) {
                addBattleLog('Successfully escaped!');
                setTimeout(() => endBattle(), 1000);
            } else {
                addBattleLog('Could not escape!');
                setTimeout(() => enemyAttack(), 1500);
            }
        }

        function endBattle() {
            gameState.inBattle = false;
            gameState.currentEnemy = null;
            document.getElementById('battleScreen').style.display = 'none';
            gameState.battleLog = [];
            updateUI();
        }

        function addBattleLog(message) {
            gameState.battleLog.push(message);
            const battleText = document.getElementById('battleText');
            battleText.innerHTML = gameState.battleLog.join('<br>');
            battleText.scrollTop = battleText.scrollHeight;
        }

        function updateBattleUI() {
            if (!gameState.currentEnemy) return;

            // Update health bars
            const playerHealthPercent = (gameState.player.hp / gameState.player.maxHp) * 100;
            const enemyHealthPercent = (gameState.currentEnemy.hp / gameState.currentEnemy.maxHp) * 100;
            
            document.getElementById('playerHealthFill').style.width = playerHealthPercent + '%';
            document.getElementById('enemyHealthFill').style.width = enemyHealthPercent + '%';

            // Update stats
            document.getElementById('playerStats').innerHTML = `
                <strong>You</strong><br>
                Level: ${gameState.player.level}<br>
                HP: ${gameState.player.hp}/${gameState.player.maxHp}
            `;
            
            document.getElementById('enemyStats').innerHTML = `
                <strong>${gameState.currentEnemy.name}</strong><br>
                Level: ${gameState.currentEnemy.level}<br>
                HP: ${gameState.currentEnemy.hp}/${gameState.currentEnemy.maxHp}
            `;
        }

        function showDialog(message, callback) {
            gameState.inDialog = true;
            document.getElementById('dialogScreen').style.display = 'flex';
            document.getElementById('dialogBox').innerHTML = `
                <p>${message}</p>
                <button class="dialog-btn" onclick="closeDialog(${callback ? 'true' : 'false'})">OK</button>
            `;
            
            if (callback) {
                window.currentDialogCallback = callback;
            }
        }

        function closeDialog(hasCallback) {
            gameState.inDialog = false;
            document.getElementById('dialogScreen').style.display = 'none';
            
            if (hasCallback && window.currentDialogCallback) {
                window.currentDialogCallback();
                window.currentDialogCallback = null;
            }
        }

        function updateUI() {
            document.getElementById('playerLevel').textContent = gameState.player.level;
            document.getElementById('playerExp').textContent = gameState.player.exp;
            document.getElementById('expToNext').textContent = gameState.player.expToNext;
            document.getElementById('playerHpDisplay').textContent = gameState.player.hp;
            document.getElementById('badges').textContent = gameState.player.badges;
            
            const expPercent = (gameState.player.exp / gameState.player.expToNext) * 100;
            document.getElementById('expFill').style.width = expPercent + '%';
        }

        // Initialize the game when page loads
        window.addEventListener('load', initGame);