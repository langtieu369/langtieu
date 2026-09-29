"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipmentService = void 0;
const ItemInstanceService_1 = require("./ItemInstanceService");
exports.equipmentService = {
    equip(uid, instanceId) { return ItemInstanceService_1.itemInstanceService.equip(uid, instanceId); },
    stats(uid) { return ItemInstanceService_1.itemInstanceService.stats(uid); }
};
