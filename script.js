const PASSWORD = "2909";
const TARGET_DAYS = 2558;
const screens = ["lock-screen","game-screen","proposal-screen","final-screen"];
const $ = (id)=>document.getElementById(id);
function show(id){screens.forEach(s=>$(s).classList.toggle("active",s===id));}

function animateDaysCounter(target = TARGET_DAYS, duration = 1800) {
  const el = $("daysCount");
  if (!el) return;
  const startTime = performance.now();
  el.classList.remove("counter-done");

  function frame(now) {
    const elapsed = now - startTime;
    let currentVal;

    // Show initial 0, 1, 2, 3, 4 clearly as requested
    if (elapsed < 280) {
      const step = Math.min(Math.floor(elapsed / 40), 7);
      const earlySequence = [0, 1, 2, 3, 4, 6, 9, 15];
      currentVal = earlySequence[step] ?? 15;
    } else {
      const remainingTime = duration - 280;
      const progress = Math.min(Math.max((elapsed - 280) / remainingTime, 0), 1);
      const ease = 1 - Math.pow(1 - progress, 3.2);
      currentVal = Math.floor(15 + (target - 15) * ease);
    }

    if (currentVal > target) currentVal = target;
    el.textContent = currentVal.toLocaleString();

    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      el.textContent = target.toLocaleString();
      el.classList.add("counter-done");
    }
  }

  requestAnimationFrame(frame);
}

const questions = [
  {q:"What's my favorite dessert?", a:["cake","chocolate cake","chocolate"]},
  {q:"What's our special password?", a:["2909"]}
];
let qi=0;
function setQuestion(){
  $("questionText").textContent=questions[qi].q;
  $("questionNo").textContent=qi+1;
  $("answerInput").value="";
  $("errorText").textContent="";
}
function checkAnswer(){
  const v=$("answerInput").value.trim().toLowerCase();
  const ok = (qi===1 ? v===PASSWORD : questions[qi].a.some(x=>v.includes(x)));
  if(!ok){$("errorText").textContent="Hmm... that's not the one. ♥ Try again, my love."; return;}
  if(qi===0){qi=1;setQuestion();}
  else startGame();
}
$("unlockBtn").addEventListener("click",checkAnswer);
$("answerInput").addEventListener("keydown",e=>{if(e.key==="Enter")checkAnswer()});

function handleImgError(img) {
  if (img.dataset.failed) return;
  const exts = [".jpeg", ".jpg", ".png", ".webp", ".svg"];
  const cur = img.getAttribute("src") || "";
  const curExt = exts.find(e => cur.toLowerCase().endsWith(e)) || ".jpeg";
  const curIdx = exts.indexOf(curExt);
  const nextIdx = curIdx + 1;
  if (nextIdx < exts.length) {
    img.src = cur.slice(0, -curExt.length) + exts[nextIdx];
  } else {
    img.dataset.failed = "1";
  }
}

const photos = Array.from({length:8},(_,i)=>`assets/photo-${String(i+1).padStart(2,"0")}.jpeg`);
let deck=[], first=null, lock=false, moves=0, matched=0;
function shuffle(a){return a.sort(()=>Math.random()-.5)}
function startGame(){
  show("game-screen");
  deck=shuffle([...photos,...photos].map((src,id)=>({src,id,key:src+id})));
  moves=0;matched=0;first=null;lock=false;
  $("moves").textContent="0 moves";$("pairs").textContent="0 / 8 pairs";
  $("board").innerHTML="";
  deck.forEach((item,i)=>{
    const b=document.createElement("button");b.className="card";b.dataset.i=i;
    b.innerHTML=`<div class="card-inner"><div class="face back">♥</div><div class="face front"><img src="${item.src}" onerror="handleImgError(this)" alt=""></div></div>`;
    b.onclick=()=>flip(b,i);$("board").appendChild(b);
  });
}
function flip(card,i){
  if(lock||card.classList.contains("flipped")||card.classList.contains("matched"))return;
  card.classList.add("flipped");
  if(!first){first={card,i};return;}
  moves++;$("moves").textContent=`${moves} moves`;
  const second={card,i};
  if(deck[first.i].src===deck[second.i].src){
    first.card.classList.add("matched");second.card.classList.add("matched");
    matched++;$("pairs").textContent=`${matched} / 8 pairs`;first=null;
    if(matched===8)setTimeout(()=>show("proposal-screen"),900);
  }else{
    lock=true;setTimeout(()=>{first.card.classList.remove("flipped");second.card.classList.remove("flipped");first=null;lock=false},650);
  }
}

function fillCollage(){
  $("collage").innerHTML="";
  photos.slice(0,8).forEach(src=>{
    const img=document.createElement("img");
    img.src=src;
    img.onerror=function(){handleImgError(this)};
    $("collage").appendChild(img);
  });
}
$("yesBtn").addEventListener("click",()=>show("final-screen"));
$("maybeBtn").addEventListener("click",()=>{
  $("maybeBtn").textContent="Think again 😌";
  $("yesBtn").animate([{transform:"scale(1)"},{transform:"scale(1.08)"},{transform:"scale(1)"}],{duration:500});
});
// Romantic Sound & Kiss Particles
function playRomanticChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const notes = [
      { f: 523.25, t: 0.0, d: 0.8 },
      { f: 659.25, t: 0.15, d: 0.8 },
      { f: 783.99, t: 0.3, d: 0.9 },
      { f: 987.77, t: 0.45, d: 1.0 },
      { f: 1046.50, t: 0.6, d: 1.4 },
      { f: 1318.51, t: 0.75, d: 1.6 }
    ];
    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);
      gain.gain.setValueAtTime(0, ctx.currentTime + n.t);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + n.t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + n.t + n.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + n.t);
      osc.stop(ctx.currentTime + n.t + n.d + 0.1);
    });
  } catch(e) {}
}

function spawnFlyingKisses(originEl) {
  const emojis = ["💋","💖","💕","✨","🌸","🧸","🌹","💗"];
  const rect = originEl ? originEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0 };
  const originX = rect.left + rect.width / 2;
  const originY = rect.top;

  for (let i = 0; i < 20; i++) {
    const span = document.createElement("span");
    span.className = "floating-kiss";
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const dx = (Math.random() - 0.5) * 260 + "px";
    const rot = (Math.random() - 0.5) * 90 + "deg";
    span.style.setProperty("--dx", dx);
    span.style.setProperty("--rot", rot);
    span.style.left = (originX + (Math.random() - 0.5) * 60) + "px";
    span.style.top = originY + "px";
    span.style.animationDelay = (i * 0.05) + "s";
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 2500);
  }
}

// Love Letter Envelope Interactions
const openLetterBtn = $("openLetterBtn");
const closeLetterBtn = $("closeLetterBtn");
const envelopeFlap = $("envelopeFlap");
const loveLetterModal = $("loveLetterModal");
const sendKissesBtn = $("sendKissesBtn");
const playMelodyBtn = $("playMelodyBtn");

if (openLetterBtn) {
  openLetterBtn.addEventListener("click", () => {
    if (envelopeFlap) envelopeFlap.classList.add("open");
    playRomanticChime();
    spawnFlyingKisses(openLetterBtn);
    setTimeout(() => {
      if (loveLetterModal) {
        loveLetterModal.style.display = "block";
        loveLetterModal.classList.add("open");
        loveLetterModal.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 380);
  });
}

if (closeLetterBtn) {
  closeLetterBtn.addEventListener("click", () => {
    if (loveLetterModal) {
      loveLetterModal.style.display = "none";
      loveLetterModal.classList.remove("open");
    }
    if (envelopeFlap) envelopeFlap.classList.remove("open");
    if (openLetterBtn) openLetterBtn.scrollIntoView({ behavior: "smooth" });
  });
}

if (sendKissesBtn) {
  sendKissesBtn.addEventListener("click", () => {
    playRomanticChime();
    spawnFlyingKisses(sendKissesBtn);
  });
}

if (playMelodyBtn) {
  playMelodyBtn.addEventListener("click", () => {
    playRomanticChime();
    spawnFlyingKisses(playMelodyBtn);
  });
}

$("restartBtn").addEventListener("click",()=>{
  qi=0;
  setQuestion();
  show("lock-screen");
  animateDaysCounter();
  if (loveLetterModal) {
    loveLetterModal.style.display = "none";
    loveLetterModal.classList.remove("open");
  }
  if (envelopeFlap) envelopeFlap.classList.remove("open");
});

fillCollage();
setQuestion();
animateDaysCounter();

