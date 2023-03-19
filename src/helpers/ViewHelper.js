const _ = require('lodash');

class ViewHelper {
    static separateWithDivider(blockElements = []) {
        const dividedBlocks = blockElements.reduce((arr, block) => {
            arr.push(block);
            arr.push({
                type: 'divider'
            });
            return arr;
        }, []);
        dividedBlocks.pop();
        return _.flatten(dividedBlocks);
    }
}

module.exports = ViewHelper;
