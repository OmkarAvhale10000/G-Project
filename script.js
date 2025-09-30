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
                // carpet: { x1: 8, y1: 6, x2: 13, y2: 11, encounterRate: 0.03 },
                road: [
                    { x1: 0, y1: 0, x2: 4, y2: 0},
                    { x1: 2, y1: 1, x2: 2, y2: 5},
                    { x1: 3, y1: 5, x2: 6, y2: 5},
                    { x1: 6, y1: 1, x2: 6, y2: 4},
                    { x1: 7, y1: 1, x2: 11, y2: 1},
                    { x1: 10, y1: 2, x2: 10, y2: 5},
                    { x1: 5, y1: 5, x2: 9, y2: 5},
                    { x1: 12, y1: 1, x2: 12, y2: 3},
                    { x1: 12, y1: 4, x2: 17, y2: 4},
                    { x1: 13, y1: 5, x2: 13, y2: 6},
                    { x1: 4, y1: 6, x2: 4, y2: 8},
                    { x1: 5, y1: 8, x2: 8, y2: 8},
                    { x1: 6, y1: 9, x2: 6, y2: 13},
                    { x1: 1, y1: 12, x2: 5, y2: 12},
                    { x1: 2, y1: 8, x2: 2, y2: 11},
                    { x1: 7, y1: 13, x2: 12, y2: 13},
                    { x1: 11, y1: 10, x2: 11, y2: 12},
                    { x1: 12, y1: 11, x2: 15, y2: 11},
                    { x1: 14, y1: 8, x2: 14, y2: 10},
                    { x1: 15, y1: 8, x2: 17, y2: 8},
                    { x1: 18, y1: 8, x2: 18, y2: 11}
                ],
                //tree: { x1: 0, y1: 1, x2: 1, y2: 5 },
                //Add more areas here like: entrance: { x1: 9, y1: 13, x2: 11, y2: 14 }
            }
        };
        
        // ✅ Universal function to check if (x,y) is in an area
        function isInArea(x, y, area) {
            // Case 1: single rectangle
            if (!Array.isArray(area)) {
                return (
                    x >= area.x1 && x <= area.x2 &&
                    y >= area.y1 && y <= area.y2
                );
            }

            // Case 2: array of rectangles
            return area.some(rect =>
                x >= rect.x1 && x <= rect.x2 &&
                y >= rect.y1 && y <= rect.y2
            );
        }

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
                name: 'firstDemon',
                type: 'type1',
                x: MAP_CONFIG.tileSize*3, y: MAP_CONFIG.tileSize*5,
                sprite: 'demon',
                level: 1,
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
            type1: {
                background: '#ff4757',
                icon: '👹'
                
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

        // =====================================
        // GAME STATE - Don't modify unless needed
        // =====================================
        const gameState = {
            player: {
                x: 0,
                y: 0,
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

            // ✅ Function to create one tile
            function createTile(x, y) {
                let tile = document.createElement("div");
                tile.style.left = x * MAP_CONFIG.tileSize + "px";
                tile.style.top = y * MAP_CONFIG.tileSize + "px";

                // Default background
                tile.className = "tile carpet";

                // Loop through all areas and assign classes
                for (const [areaName, area] of Object.entries(MAP_CONFIG.areas)) {
                    if (isInArea(x, y, area)) {
                        tile.classList.add(areaName);
                    }
                }

                return tile;
            }

            // ✅ Build the whole map
            for (let y = 0; y < MAP_CONFIG.height; y++) {
                for (let x = 0; x < MAP_CONFIG.width; x++) {
                    overworld.appendChild(createTile(x, y));
                }
            }

            // Add furniture from configuration
            addFurnitureFromConfig();
        }

        // Furniture/Objects Configuration - Easy to add new ones!
        const FURNITURE_CONFIG = [
            // Add new furniture here:
            //{ type: 'desk', x: 0, y: 1, width: 2, height: 1 },
            // { type: 'chair', x: 5, y: 11, width: 1, height: 1 },
        ];

        // Furniture Styles Configuration
        const FURNITURE_STYLES = {
            // computer: {
            //     backgroundImage: url("images/computer.png"),
            //     backgroundSize: cover,
            // },
            
            // chair: {
            //     background: 'linear-gradient(45deg, #654321 0%, #8B4513 50%, #654321 100%)',
            //     borderColor: '#4A2C17'
            // },

            // Add more furniture styles here
        };

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
                            // furniture.style.backgroundImage = style.backgroundImage;
                            // furniture.style.backgroundSize = style.backgroundSize;
                            furniture.style.background = style.background;
                            furniture.style.borderColor = style.borderColor;
                        }

                        overworld.appendChild(furniture);
                    }
                }
            });
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
                        furniture.style.backgroundImage = style.backgroundImage;
                        furniture.style.backgroundSize = style.backgroundSize;
                        //furniture.style.background = style.background;
                        //furniture.style.borderColor = style.borderColor;
                    }
                    
                    overworld.appendChild(furniture);
                }
            }
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
                    npcElement.style.animation = "walk 5s infinite ease-in-out";
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
            let img = document.getElementById('player');
            switch(e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    player.style.backgroundImage = "url('/images/MainCharImgs/UpChar.png')";
                    newY = Math.max(0, newY - speed);
                    break;
                case 's':
                case 'arrowdown':
                    player.style.backgroundImage = "url('/images/MainCharImgs/DownChar.png')";
                    newY = Math.min(560, newY + speed);
                    break;
                case 'a':
                case 'arrowleft':
                    player.style.backgroundImage = "url('/images/MainCharImgs/LeftChar.png')";
                    newX = Math.max(0, newX - speed);
                    break;
                case 'd':
                case 'arrowright':
                    player.style.backgroundImage = "url('/images/MainCharImgs/RightChar.png')";
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
            for (const area of Object.values(MAP_CONFIG.areas)) {
                // Only check areas with encounterRate
                if (area.encounterRate && isInArea(tileX, tileY, area) && Math.random() < area.encounterRate) {
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

        // =====================================
        // MAIN GAME INITIALIZATION
        // =====================================
        function initGame() {
            
            document.querySelector(".game-container").style.display = "none";
            document.getElementById("gameContainer").style.display = "flex"; 
                     
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
            const dialogBox = document.getElementById('dialogBox');
            dialogBox.textContent = ""; // Clear previous content

            // Create and append the message paragraph safely
            const p = document.createElement('p');
            p.textContent = message;
            dialogBox.appendChild(p);

            // Create and append the button
            const btn = document.createElement('button');
            btn.className = "dialog-btn";
            btn.textContent = "OK";
            btn.onclick = function() { closeDialog(!!callback); };
            dialogBox.appendChild(btn);
            
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

        function startGame() {
            initGame();
        } 

        window.addEventListener('load', () => {
            document.getElementById("gameContainer").style.display = "none";
        });
