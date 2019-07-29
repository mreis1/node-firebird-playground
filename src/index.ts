import {options} from './options';

//https://github.com/yargs/yargs/blob/master/docs/advanced.md
const argv = require('yargs')
    // .command({
    //     command: 'run <key> [value]',
    //     aliases: [],
    //     desc: 'Runs a sample',
    //     builder: (yargs) => {
    //         console.log(yargs);
    //         return yargs.default('value', 'true')
    //     },
    //     handler: (argv) => {
    //         console.log(`setting ${argv.key} to ${argv.value}`)
    //     }
    // })
    .option('sample', {
        default: 1
    })
    .option('db', {
        default: 1 // 1 = TEST_8859_1; 2 = TEST_UTF8
    })
    .option('fb-module', {
        alias: 'fbm',
        default: 1 // 1 = node-firebird, 2 = node-firebird-dev
    })
    .option('pagesize', {
        default: 1024 * 16
    })
    .option('verbose', {
        alias: 'v',
        default: false
    })
    .help()
    .argv as any;

console.log({argv})

if (argv.db === 2) {
    options.database = 'C:\\DBS\\TEST_UTF8.fdb';
} else {
    options.database = 'C:\\DBS\\TEST_8859_1.fdb';
}



console.log(options);
var Firebird;

if (argv.fbm === 2) {
    Firebird = require('node-firebird-dev');
} else {
    Firebird = require('node-firebird');
}
let ISOLATION = {
    READ_UNCOMMITTED: Firebird.ISOLATION_READ_UNCOMMITTED,
    READ_COMMITED: Firebird.ISOLATION_READ_COMMITED,
    REPEATABLE_READ: Firebird.ISOLATION_REPEATABLE_READ,
    SERIALIZABLE: Firebird.ISOLATION_SERIALIZABLE,
    READ_COMMITED_READ_ONLY: Firebird.ISOLATION_READ_COMMITED_READ_ONLY
};



// 5 = the number is count of opened sockets
var pool = Firebird.pool(5, options, (err) => {
    if (err) {
        console.log('Pool creation failed. ', err)
    } else {
        console.log('Pool creation succeed. ')
    }
});



setTimeout(() => {
    console.log('Running sample: '+ argv.sample);
    switch (argv.sample) {
        case 1: require('./tests/blob-read')(pool); break;
        case 2: require('./tests/query-db-after-disconnect')(pool); break;
        case 3: require('./tests/insert-blob')(pool); break;
        case 4: require('./tests/sequentially-select')(pool); break;
        default: require('./tests/blob-read')(pool); break;
    }
},300);


// // Destroy pool
// pool.destroy((err) => {
//     if (err) {
//         return console.log('Pool not detroyed');
//     }
//     console.log('Pool destroyed')
// });
//
