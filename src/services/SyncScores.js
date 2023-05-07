const log = require("debug")("newsscore:SyncScores");
const Story = require('../models/story');
const ScoreAgent = require('../agents/ScoreAgent');
const { Op } = require("sequelize");

module.exports = async function SyncScores() {
    log(`sync scores`);

    const stories = await Story.findAll({
        where: {
            headline: null,
            content: {
                [Op.ne]: null
            },
            final_score: false,
            score: {
                [Op.gte]: process.env.NEWS_SCORE_CUTOFF
            }
        },
        order: [
            ['publish_date', 'DESC']
        ]

    });

    log(`found ${stories.length} candidate stories without final scores`);
    if (stories.length == 0) return;

    let i = 0;
    for (const story of stories) {
        const score = await ScoreAgent(story.llm_fields);
        log(`updating score for ${story.title} from ${story.score} -> ${score}`);
        await story.update({ score, final_score: true });

        if (++i % 10 == 0) {
            log(`sleeping for 15 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 15000));
        }
    }
}