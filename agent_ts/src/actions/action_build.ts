const mineflayer = require('mineflayer');
const { Vector3 } = require('mineflayer');
const prompts = require('prompts');
const { randomInt } = require('crypto');
const { PathfindingStatus } = require('mineflayer-pathfinder');

const materials = [
    'minecraft:oak_planks',
    'minecraft:bricks',
    'minecraft:cobblestone',
    'minecraft:stone_bricks',
    'minecraft:granite',
    'minecraft:diorite',
    'minecraft:andesite',
];

const furnishings = [
    { type: 'minecraft:bed', position: new Vector3(0, 1, 0) },
    { type: 'minecraft:chest', position: new Vector3(2, 1, 0) },
    { type: 'minecraft:furnace', position: new Vector3(0, 1, 0) },
    { type: 'minecraft:crafting_table', position: new Vector3(2, 1, 0) },
    { type: 'minecraft:bookshelf', position: new Vector3(0, 1, 2) },
    { type: 'minecraft:jukebox', position: new Vector3(2, 1, 2) },
];

const generateRoom = () => {
    const roomSize = randomInt(3, 6);
    const floor = materials[randomInt(0, materials.length)];
    const walls = materials[randomInt(0, materials.length)];
    const furnishingCount = randomInt(1, 4);
    const roomFurnishings = [];

    for (let i = 0; i < furnishingCount; i++) {
        const furnishing = furnishings[randomInt(0, furnishings.length)];
        roomFurnishings.push(furnishing);
    }

    return { roomSize, floor, walls, furnishings: roomFurnishings };
};

export async function buildHouse(bot: any, numRooms: number): Promise<[any, any]> {
    const { playerPos } = bot.players[bot.player.username].entity;
    let currentPos = playerPos.offset(0, 0, 5);

    for (let i = 0; i < numRooms; i++) {
        const room = generateRoom();

        // Move to the room location
        const roomCenter = currentPos.offset(Math.floor(room.roomSize / 2), 1, Math.floor(room.roomSize / 2));
        const pathfinder = bot.pathfinder;
        const { status } = await pathfinder.findPathSync(roomCenter, { endRadius: 1 });

        if (status === PathfindingStatus.SUCCESSFUL) {
            await pathfinder.moveTo(roomCenter);
        } else {
            console.log('Failed to find path to room location');
            return;
        }

        // Build room floor
        for (let x = 0; x < room.roomSize; x++) {
            for (let z = 0; z < room.roomSize; z++) {
                const blockPos = currentPos.offset(x, 0, z);
                bot.setBlock(blockPos, room.floor);
            }
        }

        // Build room walls
        for (let x = 0; x < room.roomSize; x++) {
            for (let y = 1; y <= 3; y++) {
                const blockPos = currentPos.offset(x, y, 0);
                bot.setBlock(blockPos, room.walls);
                const blockPos2 = currentPos.offset(x, y, room.roomSize - 1);
                bot.setBlock(blockPos2, room.walls);
            }
        }

        for (let z = 1; z < room.roomSize - 1; z++) {
            for (let y = 1; y <= 3; y++) {
                const blockPos = currentPos.offset(0, y, z);
                bot.setBlock(blockPos, room.walls);
                const blockPos2 = currentPos.offset(room.roomSize - 1, y, z);
                bot.setBlock(blockPos2, room.walls);
            }
        }

        // Place furnishings
        for (const furnishing of room.furnishings) {
            const furnishingPos = currentPos.offset(furnishing.position.x, furnishing.position.y, furnishing.position.z);
            bot.setBlock(furnishingPos, furnishing.type);
        }

        currentPos = currentPos.offset(room.roomSize + 1, 0, 0);

    }

    return [null, null];
};