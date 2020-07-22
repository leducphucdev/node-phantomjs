const Horseman = require('node-horseman'),
      validUrl = require('valid-url'),
      program = require('commander'),
      fs = require('fs'),
      util = require('util'),
      ActionFactory = require('./action_factory');

const readdir = util.promisify(fs.readdir);

program
  .version('1.0.0')
  .option('-x --action-to-perform [string]', 'The type of action to perform.')
  .option('-u --url [string]', 'Optional URL used by certain actions')
  .parse(process.argv);

/**
 * Path to the PhantomJS binary
 */
const PATH_TO_PHANTOM = `${__dirname}/bin/phantomjs`;

/**
 * Stores an array of actions support by this utility framework.
 * Populated on script load based on files present in the 'actions' directory
 */
const supportedActions = [];

/**
 * Loads a Horseman instance to facilitate interaction with PhantomJS
 */
const loadPhantomInstance = function () {

    const options = {
        phantomPath: PATH_TO_PHANTOM,
        loadImages: true,
        injectJquery: true,
        webSecurity: true,
        ignoreSSLErrors: true
    };

    const phantomInstance = new Horseman(options);

    phantomInstance.on('consoleMessage', function (msg) {
        throw 'Phantom page log: ', msg;
    });

    phantomInstance.on('error', function (msg) {
        throw 'Phantom page error: ', msg;
    });

    return phantomInstance;
};

/**
 * Triggers execution of the appropriate action
 */
const main = function () {
    if (!program.actionToPerform) {
        throw 'An action must be specified. Supported actions include: ', supportedActions.join(', ');
    } else if (supportedActions.indexOf(program.actionToPerform) < 0) {
        throw 'Invalid action specified. Supported actions include: ', supportedActions.join(', ');
    }

    if (!program.url) {
        throw 'Url not empty';
    }

    const phantomInstance = loadPhantomInstance();

    const factory = new ActionFactory(program.actionToPerform, phantomInstance);
        
    factory.execute(program.url);
};

/**
 * Run immediately on script load to determine available actions and attempt to run the specified action
 */
(async function() {
    // Generate an array of supported actions based on the files present in the 'actions' directory
    const files = await readdir('./actions');

    files.map(function (filename) {
        supportedActions.push(filename.split('.')[0]);
    });

    main();

})();