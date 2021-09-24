'use strict';

const { Broadcast: B, Logger } = require('ranvier');

const logMethods = {
  'bug': Logger.error,
  'typo': Logger.warn,
  'suggestion': Logger.verbose
};

module.exports = {
  usage: 'bug <description>',
  aliases: ['typo', 'suggestion'],
  command: state => (args, player, arg0) => {
    if (!args) {
      return B.sayAt(player, '<b><yellow>Please describe the bug you have found.</yellow></b>');
    }

    const description = args;
    const type = arg0;

    const room = player.room;
    const roomData = {
      name: room.name,
      desc: room.description,
      entities = [...room.items, ...room.players, ...room.npcs].map(ent => ({name: ent.name, id: ent.id, desc: ent.description || '' }))
    };

    const roomJSON = JSON.stringify(roomData, null, 2);
    const playerJSON = JSON.stringify(player.serialize(), null, 2);

    const header = `REPORT\nType: ${type}\nReported By: ${player.name}\nRoom: ${room.title}\nTime: ${(new Date()).toISOString()}\nDescription: ${description}\n`;
    const details = `PlayerData: ${playerJSON}\nRoomData: ${roomJSON}`;

    const report = `${header}${details}`;

    const logMethod = logMethods[type] || Logger.verbose;
    logMethod(report);

    B.sayAt(player, `<b>Your ${type} report has been submitted as :</b>\n${description}`);
    B.sayAt(player, '<b>Thanks!</b>');

    if (Config.get('reportToAdmins')) {
      const message = `Report from ${this.name}: ${description}. See the server logs for more details.`;
      const minRole = type === 'bug' ? PlayerRoles.ADMIN : PlayerRoles.BUILDER;
      B.sayAt(new RoleAudience({ minRole, state }), message);
    }
  }
};
