/*
 * Even bots need to rest sometimes.
 *
 * That's why we created an example that demonstrates how easy it is
 * to find and use a bed properly.
 *
 * You can ask the bot to sleep or wake up by sending a chat message.
 */
var mineflayer = require('../');

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node sleeper.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "sleeper",
  password: process.argv[5],
  verbose: true,
});

bot.on('chat', function(username, message) {
  if(username === bot.username) return;
  switch(message) {
    case 'sleep':
      goToSleep();
      break;
    case 'wakeup':
      wakeUp();
      break;
  }
});

bot.on('sleep', function() {
  bot.chat("Good night!");
});
bot.on('wake', function() {
  bot.chat("Good morning!");
});

function goToSleep() {
  var bed = findBlock({
    matching: 26
  });
  if(bed) {
    bot.sleep(bed, function(err) {
      if(err) {
        bot.chat("I can't sleep: " + err.message);
      } else {
        bot.chat("I'm sleeping");
      }
    });
  } else {
    bot.chat("No nearby bed");
  }
}

function wakeUp() {
  bot.wake(function(err) {
    if(err) {
      bot.chat("I can't wake up: " + err.message);
    } else {
      bot.chat("I woke up");
    }
  });
}

function findBlock(options) {
  if(!Array.isArray(options.matching)) {
    options.matching = [ options.matching ];
  }
  options.point = options.point || bot.entity.position;
  options.maxDistance = options.maxDistance || 16;
  options.check = options.check || isMatchingType;
  var cursor = mineflayer.vec3();
  var point = options.point;
  var max = options.maxDistance;
  var found;
  for(cursor.x = point.x - max; cursor.x < point.x + max; cursor.x++) {
    for(cursor.y = point.y - max; cursor.y < point.y + max; cursor.y++) {
      for(cursor.z = point.z - max; cursor.z < point.z + max; cursor.z++) {
        found = bot.blockAt(cursor);
        if (options.check(found)) return found;
      }
    }
  }

  function isMatchingType(block) {
    return options.matching.indexOf(block.type) >= 0;
  }
}
