async function test() {
  const res = await fetch('http://localhost:3000/api/agent-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Suggest topics' }],
      ability: 'blueprint-ideation',
      funnelId: 'test',
      abilityContext: {
        funnelName: 'Test Funnel',
      }
    })
  });
  
  console.log(res.status, res.statusText);
  const text = await res.text();
  console.log(text);
}

test();
