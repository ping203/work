const FishPlayer = require('./player');
const VietnamPlayer = require('./vietnamPlayer');
const versions = require('../../../../utils/imports').versions;

let ChannelPlayer = null;
switch (versions.PUB){
    case versions.GAMEPLAY.VIETNAM:
        ChannelPlayer = VietnamPlayer;
    case versions.GAMEPLAY.CHINA:
        ChannelPlayer = FishPlayer;
    default:
        break;
}

module.exports = ChannelPlayer;