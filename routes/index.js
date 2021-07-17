var express = require('express');
require('../scripts/BuryBone');
require('../scripts/BuryLeash');
require('../scripts/BuryShib');
require('../scripts/TopDog');
require('../scripts/breakMerkle')
require('../scripts/checkMongoData')
require('../scripts/checkRewardDistribution')
// var app = express();

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'ok'
  });
});




module.exports = router;