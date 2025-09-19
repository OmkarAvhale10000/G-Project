/* Pixel-art bedroom map + movement + on-screen controls
   - Draws bed, PC, rug, stairs, shelf in pixel art on canvas
   - Crisp pixel scaling, no external images
   - Movement via D-pad (touch/click) or keyboard
   - Keeps simple battle / save-load logic
*/

// CONFIG: change PIXEL_SCALE to scale the sprite block size (integer)
const PIXEL_SCALE = 2; // 1 = native, >1 scales pixels larger. We keep canvas fixed so we use el drawing with TILE.
const TILE = 16; // base tile pixels (we will scale while drawing)
const MAP_TILES_X = 22; // using a wider internal grid to match GBA view proportions
const MAP_TILES_Y = 18;

// we will render on a 352x288 canvas (matches GBA-ish) using tile size = 16 -> 22x18 grid (352/16=22, 288/16=18)
const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// DOM refs
const msgEl = document.getElementById("message");
const hpEl = document.getElementById("hp");
const lvlEl = document.getElementById("lvl");
const expEl = document.getElementById("exp");
const attackBtn = document.getElementById("attack");
const potionBtn = document.getElementById("potion");
const searchBtn = document.getElementById("search");
const fleeBtn = document.getElementById("flee");
const saveBtn = document.getElementById("save");
const loadBtn = document.getElementById("load");
const resetBtn = document.getElementById("reset");

// overlay buttons
const padButtons = document.querySelectorAll(".pad");
const btnA = document.getElementById("btn-a");
const btnB = document.getElementById("btn-b");

// MAP layout codes:
// 0 = floor, 1 = wall, 2 = bed, 3 = PC, 4 = rug, 5 = stairs, 6 = shelf/table
// We'll craft a bedroom layout array sized 22x18 (mostly floor + a room in center-left)
let MAP = new Array(MAP_TILES_Y).fill(0).map(()=> new Array(MAP_TILES_X).fill(0));

// fill borders as walls
for(let y=0;y<MAP_TILES_Y;y++){
  for(let x=0;x<MAP_TILES_X;x++){
    if(x===0 || y===0 || x===MAP_TILES_X-1 || y===MAP_TILES_Y-1) MAP[y][x] = 1;
  }
}

// carve a room in the center-left to resemble Pokemon bedroom placement
const roomX = 3, roomY = 2, roomW = 12, roomH = 12;
for(let y=roomY;y<roomY+roomH;y++){
  for(let x=roomX;x<roomX+roomW;x++){
    MAP[y][x] = 0; // floor
  }
}
// room walls
for(let x=roomX;x<roomX+roomW;x++){ MAP[roomY][x]=1; MAP[roomY+roomH-1][x]=1; }
for(let y=roomY;y<roomY+roomH;y++){ MAP[y][roomX]=1; MAP[y][roomX+roomW-1]=1; }

// place bed near left inside room
MAP[roomY+3][roomX+1] = 2;
// place PC (console) centered near rug
MAP[roomY+5][roomX+5] = 3;
// place rug center
MAP[roomY+4][roomX+3] = 4;
MAP[roomY+4][roomX+4] = 4;
MAP[roomY+5][roomX+3] = 4;
MAP[roomY+5][roomX+4] = 4;
// place stairs top-right of room
MAP[roomY+1][roomX+roomW-2] = 5;
MAP[roomY+2][roomX+roomW-2] = 5;
// shelf/table (bookshelf) in top-left of room
MAP[roomY+1][roomX+1] = 6;

// player initial position in front of PC
let state = {
  player: { x: roomX+5, y: roomY+6, hp:40, maxHp:40, atk:6, def:2, lvl:1, exp:0 },
  inventory:{ potions:2, weapons:[{name:'Rusty Blade', power:2}] },
  inBattle:false, enemy:null
};

// small enemy pool
const enemies = [
  {name:'Dark Thug',hp:18,atk:5,def:1,exp:12, loot:{type:'potion',amount:1}},
  {name:'Shadow Bandit',hp:26,atk:7,def:2,exp:18, loot:{type:'weapon',item:{name:'Shiv',power:3}}},
  {name:'Gloom Brute',hp:40,atk:10,def:3,exp:30, loot:{type:'weapon',item:{name:'Heavy Club',power:5}}}
];

// Drawing helpers: draw a tile using small pixel-art blocks (no images)
function draw(){
  // clear
  ctx.fillStyle = "#000000"; ctx.fillRect(0,0,canvas.width,canvas.height);

  // draw background floor tiles (with simple basket-weave pattern like screenshot)
  for(let y=0;y<MAP_TILES_Y;y++){
    for(let x=0;x<MAP_TILES_X;x++){
      const code = MAP[y][x];
      const px = x * TILE;
      const py = y * TILE;
      drawTile(code, px, py);
    }
  }

  // draw player (pixel-art)
  drawPlayer(state.player.x * TILE, state.player.y * TILE);

  // if in battle, draw a small enemy marker to right area
  if(state.inBattle && state.enemy){
    // draw enemy sprite in top-right of room area
    const ex = (roomX + roomW - 2) * TILE + 4;
    const ey = (roomY + 2) * TILE + 4;
    drawEnemy(ex, ey);
  }
  updateUI();
}

// Draw tile types
function drawTile(code, px, py){
  if(code === 1){ // wall (wooden)
    // base
    ctx.fillStyle = "#C59B3A"; ctx.fillRect(px,py,TILE,TILE);
    // parquet pattern
    ctx.fillStyle = "#B8872F";
    ctx.fillRect(px+2,py+2, TILE-4, 6);
    ctx.fillRect(px+2,py+10, TILE-4, 4);
  }
  else if(code === 0){ // floor (darker wooden)
    ctx.fillStyle = "#D7B25B"; ctx.fillRect(px,py,TILE,TILE);
    // light grid lines to give tiles look
    ctx.fillStyle = "#C69A45";
    ctx.fillRect(px+1,py+1, TILE-2, 1);
    ctx.fillRect(px+1,py+TILE-3, TILE-2, 1);
  }
  else if(code === 2){ // bed
    // bed base
    ctx.fillStyle = "#C59B3A"; ctx.fillRect(px,py,TILE*2,TILE*2);
    // mattress
    ctx.fillStyle = "#ffffff"; ctx.fillRect(px+2,py+2,TILE*2-4,TILE-1);
    // pillow
    ctx.fillStyle = "#dfefff"; ctx.fillRect(px+2,py+2,10,8);
    // frame shadow
    ctx.strokeStyle = "#b07f2d"; ctx.strokeRect(px,py,TILE*2,TILE*2);
  }
  else if(code === 3){ // PC / Machine
    ctx.fillStyle = "#2c3540"; ctx.fillRect(px,py,TILE,TILE);
    ctx.fillStyle = "#a8d0f0"; ctx.fillRect(px+2,py+2,TILE-4,TILE-6); // screen
    ctx.fillStyle = "#1b2230"; ctx.fillRect(px+3,py+TILE-5, TILE-6, 3); // base
  }
  else if(code === 4){ // rug (green with dotted pattern)
    ctx.fillStyle = "#1e6b3f"; ctx.fillRect(px,py,TILE,TILE);
    ctx.fillStyle = "#ffffff"; // border
    ctx.fillRect(px+2,py+2, TILE-4, 2);
    ctx.fillRect(px+2,py+TILE-4, TILE-4, 2);
    // dotted pattern
    ctx.fillStyle = "#9bd89d";
    for(let i=4;i<TILE-4;i+=6) for(let j=4;j<TILE-6;j+=6) ctx.fillRect(px+i,py+j,2,2);
  }
  else if(code === 5){ // stairs
    ctx.fillStyle = "#7f5a2b"; ctx.fillRect(px,py,TILE,TILE);
    // steps
    ctx.fillStyle = "#b7863b";
    for(let s=0;s<4;s++) ctx.fillRect(px+2,py+TILE-4 - (s*3), TILE-4, 2);
  }
  else if(code === 6){ // bookshelf / table
    ctx.fillStyle = "#3a2a18"; ctx.fillRect(px,py,TILE,TILE);
    // books
    ctx.fillStyle = "#d45a5a"; ctx.fillRect(px+2,py+2,4,10);
    ctx.fillStyle = "#5aa8d4"; ctx.fillRect(px+8,py+2,4,10);
    ctx.fillStyle = "#ccbf5a"; ctx.fillRect(px+12,py+2,4,10);
  } else {
    // fallback floor
    ctx.fillStyle = "#d7b25b"; ctx.fillRect(px,py,TILE,TILE);
  }
}

// Draw simple player with red cap + yellow body (pixel-art)
function drawPlayer(px, py){
  // center within tile
  const cx = px + (TILE/2) - 6;
  const cy = py + (TILE/2) - 8;
  // hat
  ctx.fillStyle = "#cf2b2b"; ctx.fillRect(cx, cy, 12, 4);
  ctx.fillRect(cx+2, cy+4, 8, 4);
  // face
  ctx.fillStyle = "#ffd7b0"; ctx.fillRect(cx+3, cy+8, 6, 6);
  // body
  ctx.fillStyle = "#ffd84b"; ctx.fillRect(cx+2, cy+14, 8, 8);
  // legs
  ctx.fillStyle = "#2b2b2b"; ctx.fillRect(cx+2, cy+22, 4, 4);
  ctx.fillRect(cx+6, cy+22, 4, 4);
}

// draw enemy marker (small red square)
function drawEnemy(px, py){
  ctx.fillStyle = "#c43f3f"; ctx.fillRect(px,py, TILE-8, TILE-8);
  ctx.fillStyle = "#681e1e"; ctx.fillRect(px+2,py+2, TILE-12, TILE-12);
}

// UI updates
function setMessage(txt){ msgEl.textContent = txt; }
function updateUI(){
  const p = state.player;
  hpEl.textContent = `HP: ${p.hp}/${p.maxHp}`;
  lvlEl.textContent = `Lvl: ${p.lvl}`;
  expEl.textContent = `EXP: ${p.exp}/${p.lvl*20}`;
}

// movement & interaction
function canMove(nx, ny){
  if(nx < 0 || ny < 0 || nx >= MAP_TILES_X || ny >= MAP_TILES_Y) return false;
  // disallow wall tiles
  return MAP[ny][nx] !== 1;
}

let lastDir = 'down';
function move(dir){
  if(state.inBattle){ setMessage("You can't move during a fight!"); return; }
  lastDir = dir;
  const p = state.player;
  let nx = p.x, ny = p.y;
  if(dir === 'up') ny--;
  if(dir === 'down') ny++;
  if(dir === 'left') nx--;
  if(dir === 'right') nx++;
  if(!canMove(nx, ny)){ setMessage("A dark wall blocks the way."); draw(); return; }
  p.x = nx; p.y = ny;
  setMessage(`You moved ${dir}.`);
  // interactions: if on rug, show message; if near PC, allow interact
  const tile = MAP[ny][nx];
  if(tile === 2) setMessage("You see a bed here. It's comfy.");
  if(tile === 3) setMessage("A mysterious console stands here. Press A to interact.");
  if(tile === 5) setMessage("Stairs leading up — a new floor lies above.");
  // random encounter on floor tiles
  if(tile === 0 && Math.random() < 0.12) startBattle();
  draw();
}

// Interact (A)
function interact(){
  // check tile in front of player using lastDir
  const p = state.player;
  let fx = p.x, fy = p.y;
  if(lastDir === 'up') fy--;
  if(lastDir === 'down') fy++;
  if(lastDir === 'left') fx--;
  if(lastDir === 'right') fx++;
  if(fx < 0 || fy < 0 || fx >= MAP_TILES_X || fy >= MAP_TILES_Y) { setMessage("Nothing."); return; }
  const tile = MAP[fy][fx];
  if(tile === 3){
    setMessage("You used the console. No internet here... yet.");
    // small effect: give 1 potion
    state.inventory.potions++;
    setMessage("Console gave you a potion!");
  } else {
    setMessage("You look around, nothing interesting.");
  }
  draw();
}

// Battle system
function startBattle(){
  const template = JSON.parse(JSON.stringify(enemies[Math.floor(Math.random()*enemies.length)]));
  state.enemy = template;
  state.inBattle = true;
  setMessage(`A hostile criminal appears: ${state.enemy.name}!`);
  draw();
}
function playerAttack(){
  if(!state.inBattle || !state.enemy) return;
  const p = state.player, e = state.enemy;
  const weaponPower = state.inventory.weapons.reduce((a,b)=>a+(b.power||0),0);
  const base = Math.max(1, p.atk + weaponPower - e.def);
  const dmg = Math.floor(base * (0.8 + Math.random()*0.4));
  e.hp -= dmg;
  setMessage(`You hit ${e.name} for ${dmg} damage.`);
  if(e.hp <= 0){ winBattle(); return; }
  setTimeout(()=> enemyAttack(), 300);
}
function enemyAttack(){
  if(!state.inBattle || !state.enemy) return;
  const e = state.enemy, p = state.player;
  const dmg = Math.max(1, e.atk - p.def + Math.floor(Math.random()*2));
  p.hp -= dmg;
  if(p.hp <= 0){ p.hp = 0; setMessage(`${e.name} defeated you...`); setTimeout(()=> loseBattle(), 700); }
  else setMessage(`${e.name} hits you for ${dmg} damage.`);
  draw();
}
function usePotion(){
  if(!state.inBattle) { setMessage("No battle active."); return; }
  if(state.inventory.potions <= 0) { setMessage("No potions left."); return; }
  state.inventory.potions--;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + 20);
  setMessage("You used a potion and healed 20 HP.");
  setTimeout(()=> enemyAttack(), 300);
  draw();
}
function searchEnemy(){
  if(!state.inBattle || !state.enemy) return;
  setMessage("You search the enemy...");
  if(Math.random() < 0.45){
    const loot = state.enemy.loot;
    if(loot.type === 'potion'){ state.inventory.potions += loot.amount; setMessage("Found a potion!"); }
    else if(loot.type === 'weapon'){ state.inventory.weapons.push(loot.item); setMessage(`Found weapon: ${loot.item.name}`); }
    state.inBattle = false; state.enemy = null;
  } else {
    setMessage("Search failed! Enemy attacks.");
    setTimeout(()=> enemyAttack(), 300);
  }
  draw();
}
function flee(){
  if(!state.inBattle) { setMessage("No fight."); return; }
  if(Math.random() < 0.55){ setMessage("You fled successfully."); state.inBattle = false; state.enemy = null; draw(); }
  else { setMessage("Escape failed!"); setTimeout(()=> enemyAttack(), 300); }
}
function winBattle(){
  const e = state.enemy;
  setMessage(`You defeated ${e.name}! +${e.exp} EXP`);
  // loot
  if(e.loot){
    if(e.loot.type === 'potion') state.inventory.potions += e.loot.amount;
    if(e.loot.type === 'weapon') state.inventory.weapons.push(e.loot.item);
  }
  state.player.exp += e.exp;
  checkLevel();
  state.inBattle = false; state.enemy = null;
  draw();
}
function loseBattle(){
  setMessage("You were defeated. Revived at bed.");
  state.player.hp = state.player.maxHp;
  state.inBattle = false; state.enemy = null;
  draw();
}
function checkLevel(){
  const p = state.player;
  const need = p.lvl * 20;
  if(p.exp >= need){
    p.exp -= need; p.lvl++; p.maxHp += 8; p.atk+=2; p.def+=1; p.hp = p.maxHp;
    setMessage(`Level up! Reached level ${p.lvl}.`);
  }
}

// input wiring
document.addEventListener("keydown", (e)=>{
  if(e.key === "ArrowUp" || e.key === 'w') move('up');
  if(e.key === "ArrowDown" || e.key === 's') move('down');
  if(e.key === "ArrowLeft" || e.key === 'a') move('left');
  if(e.key === "ArrowRight" || e.key === 'd') move('right');
  if(e.key === 'Enter') interact();
  if(e.key === 'z') playerAttack();
  if(e.key === 'x') usePotion();
});

// overlay pad buttons (touch+click)
padButtons.forEach(btn=>{
  const dir = btn.dataset.dir;
  btn.addEventListener('click', ()=> move(dir));
  btn.addEventListener('touchstart', (e)=>{ e.preventDefault(); move(dir); });
});

// A/B overlay buttons
btnA.addEventListener('click', ()=> interact());
btnA.addEventListener('touchstart', (e)=>{ e.preventDefault(); interact(); });
btnB.addEventListener('click', ()=> playerAttack());
btnB.addEventListener('touchstart', (e)=>{ e.preventDefault(); playerAttack(); });

// HUD buttons
attackBtn.addEventListener('click', playerAttack);
potionBtn.addEventListener('click', usePotion);
searchBtn.addEventListener('click', searchEnemy);
fleeBtn.addEventListener('click', flee);

// save/load
saveBtn.addEventListener('click', ()=>{
  localStorage.setItem('darkdim-save', JSON.stringify({state, MAP}));
  setMessage("Saved to localStorage.");
});
loadBtn.addEventListener('click', ()=>{
  const raw = localStorage.getItem('darkdim-save');
  if(!raw){ setMessage("No save found."); return; }
  try{
    const data = JSON.parse(raw);
    if(data.state){ state = data.state; MAP = data.MAP || MAP; setMessage("Loaded save."); draw(); }
    else setMessage("Save invalid.");
  } catch(e){ setMessage("Failed to load."); }
});
resetBtn.addEventListener('click', ()=>{
  if(!confirm("Reset game to defaults?")) return;
  // reset minimal
  state = {
    player:{ x: roomX+5, y: roomY+6, hp:40, maxHp:40, atk:6, def:2, lvl:1, exp:0 },
    inventory:{ potions:2, weapons:[{name:'Rusty Blade', power:2}] },
    inBattle:false, enemy:null
  };
  setMessage("Game reset.");
  draw();
});

// initial draw
setMessage("Pixel bedroom loaded. Use D-pad or arrow keys.");
draw();