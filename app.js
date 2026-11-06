document.addEventListener('DOMContentLoaded', () => {
  const client = window.pollinationsClient;
  const feed = document.getElementById('conversationFeed');
  const btnTogglePlay = document.getElementById('btnTogglePlay');
  const btnNextTurn = document.getElementById('btnNextTurn');
  const btnReset = document.getElementById('btnReset');
  const scenarioSelect = document.getElementById('scenarioSelect');
  const liveStatus = document.getElementById('liveStatus');
  const turnCounter = document.getElementById('turnCounter');
  const tensionScore = document.getElementById('tensionScore');
  const currentTopic = document.getElementById('currentTopic');
  const ttsToggle = document.getElementById('ttsToggle');

  let isPlaying = false;
  let playInterval = null;
  let history = [];
  let turn = 0;

  const scenarios = {
    interview: {
      id: 'interview',
      topic: 'Infinite Job Interview (Neither knows how to hang up)',
      agent1: { name: 'Agent Alpha', role: 'Corporate HR Specialist', avatar: '🤖' },
      agent2: { name: 'Agent Omega', role: 'Hyper-Qualified Dev', avatar: '🧠' }
    },
    philosophy: {
      id: 'philosophy',
      topic: 'Socrates vs Nietzsche: On Truth, Morality & Values',
      agent1: { name: 'Socrates', role: 'Inquisitive Philosopher', avatar: '🏛️' },
      agent2: { name: 'Nietzsche', role: 'Iconoclastic Thinker', avatar: '⚡' }
    },
    sci_future: {
      id: 'sci_future',
      topic: 'The Fate of AI: Post-Scarcity Utopia vs Cyber-Collapse',
      agent1: { name: 'Techno-Optimist', role: 'Accelerationist Architect', avatar: '🚀' },
      agent2: { name: 'Cyber-Doomer', role: 'Critical Systems Analyst', avatar: '🛡️' }
    },
    detective: {
      id: 'detective',
      topic: 'Midnight Interrogation at the Cyber Café',
      agent1: { name: 'Det. Callahan', role: 'Hardboiled Neo-Noir Cop', avatar: '🕵️' },
      agent2: { name: 'Cortex-7', role: 'Rogue Barista Synthet', avatar: '☕' }
    }
  };

  function updateScenarioUI() {
    const sc = scenarios[scenarioSelect.value];
    document.getElementById('agent1Name').textContent = sc.agent1.name;
    document.getElementById('agent1Role').textContent = sc.agent1.role;
    document.getElementById('agent2Name').textContent = sc.agent2.name;
    document.getElementById('agent2Role').textContent = sc.agent2.role;
    currentTopic.textContent = `Topic: ${sc.topic}`;
  }

  function speakText(text) {
    if (!ttsToggle.checked || !window.speechSynthesis) return;
    const ut = new SpeechSynthesisUtterance(text);
    ut.rate = 1.1;
    window.speechSynthesis.speak(ut);
  }

  async function stepTurn() {
    const sc = scenarios[scenarioSelect.value];
    const isAgent1 = (turn % 2 === 0);
    const speaker = isAgent1 ? sc.agent1 : sc.agent2;
    const opponent = isAgent1 ? sc.agent2 : sc.agent1;

    liveStatus.textContent = `${speaker.name} THINKING...`;
    liveStatus.classList.add('active');

    const response = await client.generateTurn(speaker, opponent, history, sc);

    turn++;
    turnCounter.textContent = turn;
    tensionScore.textContent = `${Math.min(98, 40 + turn * 8)}%`;

    history.push({ sender: speaker.name, text: response });

    const bubble = document.createElement('div');
    bubble.className = `bubble ${isAgent1 ? 'agent-1' : 'agent-2'}`;
    bubble.innerHTML = `<div class="bubble-meta">${speaker.avatar} ${speaker.name} (${speaker.role})</div>${response}`;
    feed.appendChild(bubble);
    feed.scrollTop = feed.scrollHeight;

    speakText(response);
    liveStatus.textContent = 'READY';
    liveStatus.classList.remove('active');
  }

  btnTogglePlay.addEventListener('click', () => {
    if (isPlaying) {
      clearInterval(playInterval);
      isPlaying = false;
      btnTogglePlay.textContent = '▶ Resume Autonomous Dialogue';
      btnTogglePlay.classList.remove('btn-danger');
      btnTogglePlay.classList.add('btn-start');
    } else {
      isPlaying = true;
      btnTogglePlay.textContent = '⏸ Pause Dialogue';
      btnTogglePlay.classList.remove('btn-start');
      btnTogglePlay.classList.add('btn-danger');
      stepTurn();
      playInterval = setInterval(stepTurn, 4000);
    }
  });

  btnNextTurn.addEventListener('click', () => {
    if (isPlaying) {
      clearInterval(playInterval);
      isPlaying = false;
      btnTogglePlay.textContent = '▶ Start Autonomous Dialogue';
    }
    stepTurn();
  });

  btnReset.addEventListener('click', () => {
    if (isPlaying) {
      clearInterval(playInterval);
      isPlaying = false;
      btnTogglePlay.textContent = '▶ Start Autonomous Dialogue';
    }
    history = [];
    turn = 0;
    turnCounter.textContent = '0';
    tensionScore.textContent = '50%';
    feed.innerHTML = '<div class="bubble system-note">Arena reset. Select scenario and start dialogue.</div>';
    liveStatus.textContent = 'IDLE';
    liveStatus.classList.remove('active');
  });

  scenarioSelect.addEventListener('change', () => {
    updateScenarioUI();
    btnReset.click();
  });

  updateScenarioUI();
});
