module.exports = class ActionFactory {
    class = {
        'hello_world': require('./actions/hello_world.js'),
        'get_links': require('./actions/get_links.js')
    }

    performAction;

    constructor(performAction, phantomInstance) {
        this.performAction = this.class[performAction];
        this.phantomInstance = phantomInstance
    }

    execute(url) {
        this.performAction(this.phantomInstance, url)
    }
};