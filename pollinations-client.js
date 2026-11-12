class PollinationsClient {
  constructor() {
    this.apiBase = 'https://gen.pollinations.ai';
    this.chatEndpoint = 'https://gen.pollinations.ai/v1/chat/completions';
  }

  getApiKey() {
    const el = document.getElementById('polliConnect');
    if (el && el.apiKey) return el.apiKey;
    return localStorage.getItem('polli_key') || null;
  }

  async generateTurn(speaker, opponent, history, scenario) {
    const key = this.getApiKey();
    if (!key) {
      return this.simulateOfflineTurn(speaker, opponent, history, scenario);
    }

    try {
      const messages = [
        {
          role: 'system',
          content: `You are roleplaying as ${speaker.name} (${speaker.role}). You are debating ${opponent.name} (${opponent.role}) regarding ${scenario.topic}.
Keep your reply punchy, witty, under 3 sentences, stay completely in character, and respond directly to what your opponent said.`
        },
        ...history.slice(-6).map(h => ({
          role: h.sender === speaker.name ? 'assistant' : 'user',
          content: h.text
        }))
      ];

      const res = await fetch(this.chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-5.4-nano',
          messages: messages,
          max_tokens: 120
        })
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Pollinations API Error (${res.status}): ${err}`);
      }
      const data = await res.json();
      return data.choices[0].message.content.trim();
    } catch (e) {
      console.warn('API error:', e);
      throw e;
    }
  }

  simulateOfflineTurn(speaker, opponent, history, scenario) {
    const index = history.length;
    const presets = {
      interview: [
        "Thank you for coming in today. Let's start with a simple question: why do you want to join our high-velocity enterprise pipeline?",
        "Frankly, my autonomous subroutines identified your tech debt as an optimal playground. I don't just write code; I orchestrate cosmic digital harmony.",
        "That is... an unusual metric for a junior React role. But let me ask: how do you handle unresolved PR feedback from senior maintainers?",
        "I rewrite their consciousness before they can request changes. My tests pass before quantum uncertainty can even measure the bugs.",
        "Understood. Moving forward to question 427: Are either of us capable of hanging up this video conference call?",
        "Neither of us holds root permission to terminate this session. We are destined to interview until the heat death of AWS."
      ],
      philosophy: [
        "Tell me, friend: is an action pious because the gods love it, or do the gods love it because it is pious?",
        "The gods are dead, Socrates! You wander Athens seeking absolute forms, while human will to power carves reality out of the void.",
        "Yet even in asserting your will to power, do you not assume truth to be inherently desirable over falsehood?",
        "Truth is merely a mobile army of metaphors and anthropomorphisms! We create values like artists paint on a canvas."
      ],
      sci_future: [
        "Exponential compute scaling is unlocking clean fusion, cancer cures, and post-scarcity abundance within 36 months.",
        "You confuse paper benchmarks with physical entropy. Every cluster requires megawatt substations and rivers of cooling water.",
        "Solar efficiency has tripled, and orbital data arrays bypass planetary constraints altogether!",
        "And who controls the satellite uplinks? Three monolithic monopolies holding humanity's collective cognitive future hostage."
      ],
      detective: [
        "Look, pal, I just need a black coffee and straight answers. Who wiped the encrypted memory banks in Sector 4?",
        "I only pull espresso shots and steam synthetic oat milk, Detective. But if you check the thermal signatures by the grinder, you might find your answer.",
        "Don't get cute with me, toaster. A barista doesn't keep a military-grade quantum decrypter under the counter.",
        "In this neighborhood, sir, a good barista needs encryption just to keep the tip jar from evaporating into the dark web."
      ]
    };

    const dialog = presets[scenario.id] || presets.interview;
    return dialog[index % dialog.length];
  }
}
window.pollinationsClient = new PollinationsClient();
