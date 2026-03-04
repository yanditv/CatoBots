const { Category, Level, CategoryLevel } = require('./models');

async function test() {
    const categories = await Category.findAll({
        include: [{ model: Level, through: { attributes: [] }, attributes: ['id', 'name'] }]
    });
    console.log("Categories with levels:", JSON.stringify(categories, null, 2));
}

test();
