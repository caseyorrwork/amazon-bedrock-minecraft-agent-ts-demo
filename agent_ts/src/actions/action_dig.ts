const { Bot, Vec3 } = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder');

export async function action_dig(mcBot: any, mcData: any, parameters: any): Promise<[any, any]> {
    const { depth, width } = parameters;

    console.log('Depth:', depth);
    console.log('Width:', width);
    let length = 2;

    mcBot.entity.pitch = -1; // Look down...
    const block = mcBot.blockAtCursor(256); // Retrieve the block that the bot is currently targeting
    let startPosition = block.position;

    console.log('Target block:', block.name);
    let bot = mcBot;

    try {
        for (let y = 0; y > -depth; y--) {
            for (let x = 0; x < width; x++) {
                for (let z = 0; z < length; z++) {
                    const targetPos = startPosition.offset(x, y, z);
                    const targetBlock = bot.blockAt(targetPos);

                    if (targetBlock && targetBlock.name !== 'air') {
                        try {
                            await bot.dig(targetBlock);
                            await bot.waitForTicks(1);

                            const currentPos = bot.entity.position.clone().floor();
                            const relativePos = targetPos.minus(currentPos);

                            if (relativePos.y < 0) {
                                await bot.placeBlock(bot.blockAt(currentPos.offset(0, -1, 0)), new Vec3(0, 1, 0));
                            }

                            if (Math.abs(relativePos.x) > 1 || Math.abs(relativePos.z) > 1 || relativePos.y > 1) {
                                await bot.pathfinder.goto(new Bot.goals.GoalBlock(targetPos.x, targetPos.y + 1, targetPos.z));
                            }
                        } catch (error) {
                            console.error(`Error digging block at (${targetPos.x}, ${targetPos.y}, ${targetPos.z}):`, error);
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error('Error during circle digging operation:', err);
    }

    await mcBot.creative.flyTo(block.position.floored());
    mcBot.creative.stopFlying();

    const responseBody = { "message": "Done digging." };
    const responseState = 'REPROMPT';
    return [responseBody, responseState];
}
