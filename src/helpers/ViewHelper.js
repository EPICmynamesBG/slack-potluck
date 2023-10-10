
const _ = require('lodash');
const { getInstance } = require('./logger');

const logger = getInstance('ViewHelper');

class ViewHelper {
    constructor(client, viewId, payload) {
        this.client = client;
        this._originalViewId = viewId;
        this.activeViewId = viewId;
        this.payload = payload;
        this._originalTitle = undefined;
    }

    _getDefaultView(title = undefined, metadata = {}) {
        return {
            type: "modal",
            // View identifier
            callback_id: this._originalViewId,
            notify_on_close: true,
            clear_on_close: true,
            private_metadata: JSON.stringify(metadata),
            title: {
              type: "plain_text",
              text: title || this._originalTitle,
            },
            close: {
              type: "plain_text",
              text: "Close",
            },
            blocks: [
              {
                "type": "section",
                "text": {
                  "type": "plain_text",
                  "text": ":man-biking: Now loading..."
                }
              }
            ],
          };
    }

    async initLoading(title, metadata = {}) {
        this._originalTitle = title;
        var res = await this.client.views.open({
            token: this.payload.botToken,
            trigger_id: this.payload.triggerId,
            // Pass the view_id
            view_id: this._originalViewId,
            // View payload with updated blocks
            view: this._getDefaultView(title, metadata),
          });
        this.activeViewId = res.view.id;
        return res;
    }

    async update(view = {}, metadata = {}) {
        var res = await this.client.views.update({
            token: this.payload.botToken,
            // Pass the view_id
            view_id: this.activeViewId,
            // View payload with updated blocks
            view: {
              ...this._getDefaultView(undefined, metadata),
              ...view
            },
        });
        this.activeViewId = res.view.id;
        return res;
    }

    async close() {
        await this.update({
            submit: null,
            close: {
                type: "plain_text",
                text: "Close",
            },
            blocks: [
                {
                    type: 'section',
                    block_id: 'app.modal.error',
                    text: {
                        type: 'plain_text',
                        text: 'An unexpected error has occurred. Please close and retry.'
                    }
                }
            ]
        });
    }

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
