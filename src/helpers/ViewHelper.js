
const _ = require('lodash');
const { getInstance } = require('./logger');

const logger = getInstance('ViewHelper');

class ViewHelper {
    static separateWithDivider(blockElements = [], includeEndingDivider = false) {
        const dividedBlocks = blockElements.reduce((arr, block) => {
            arr.push(block);
            arr.push({
                type: 'divider'
            });
            return arr;
        }, []);
        if (!includeEndingDivider) {
            dividedBlocks.pop();
        }
        return _.flatten(dividedBlocks);
    }

    static InitialValueMap = {
        'default': 'initial_value',
        'datetimepicker': 'initial_date_time'
    }

    static renderInputBlock(block, initialValue = undefined) {
        if (block.element.type === 'checkboxes') {
            logger.debug('Redirecting renderInputBlock to render checkbox');
            return this.renderSingleCheckboxInputBlock(block, initialValue);
        }
        const render = { ...block };
        const setField = this.InitialValueMap[block.element.type] || this.InitialValueMap['default'];
        if (initialValue) {
            render.element[setField] = initialValue;
        }
        return render;
    }

    static renderSingleCheckboxInputBlock(block, initiallySelected = false) {
        const render = { ...block };
        if (initiallySelected) {
            render.element.initial_options = render.element.options;
        }
        return render;
    }
}

module.exports = ViewHelper;
