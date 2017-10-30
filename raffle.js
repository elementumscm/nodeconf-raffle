const crypto = require('crypto');
const https = require('https');

const API = process.env.API || 'http://localhost:3000/users';

const startRaffle = (winners) => {
  const winnersCount = winners.length;

  let possibleWinner = -1;

  const spin = () => {
    const randomFactor = Math.random().toString();
    possibleWinner += 1;

    const shasum = crypto.createHash('SHA1');
    shasum.update(randomFactor);

    const result = shasum.digest('hex');

    process.stdout.write(`\x1b[32m${winners[possibleWinner % winnersCount]}\x1b[39m\n${randomFactor}\n`);

    if ([...result].splice(0, 1).join('') === '0') {
      return possibleWinner % winnersCount;
    }

    return false;
  };

  let speed = 100;

  const getLucky = () => {
    if (speed < 10) {
      speed = 105;
    } else if (speed === 100) {
      const found = spin();

      if (possibleWinner / winnersCount > 1 && found) {
        console.log('\n\n\n');
        console.log('😎 CONGRATULATIONS!!!');
        console.log('\n\n\n');
        console.log(`You are the lucky one among ${winners.length} finalists`);
        console.log('Thank you all for participating in the');
        console.log('Elementum Challenge');
        console.log('\n\n\n');

        return;
      }
    }

    console.log();
    speed -= 5;

    setTimeout(() => {
      getLucky();
    }, speed);
  };

  getLucky();
};

https.get(API, (response) => {
  let rawData = '';

  response.setEncoding('utf8');

  response.on('data', (chunk) => { rawData += chunk; });
  response.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      const finalistNames = parsedData
        .filter(participant => participant.step === 5)
        .map(({ name }) => name);

      const uniqueFinalists = [...new Set(finalistNames)];

      console.log(uniqueFinalists);
      startRaffle(uniqueFinalists);
    } catch (e) {
      console.error(e.message);
    }
  });
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
});
