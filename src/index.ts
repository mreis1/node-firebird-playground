import {options} from './options';
var Firebird = require('node-firebird-dev');
//var Firebird = require('node-firebird');

let ISOLATION = {
    READ_UNCOMMITTED: Firebird.ISOLATION_READ_UNCOMMITTED,
    READ_COMMITED: Firebird.ISOLATION_READ_COMMITED,
    REPEATABLE_READ: Firebird.ISOLATION_REPEATABLE_READ,
    SERIALIZABLE: Firebird.ISOLATION_SERIALIZABLE,
    READ_COMMITED_READ_ONLY: Firebird.ISOLATION_READ_COMMITED_READ_ONLY
};

//https://github.com/yargs/yargs/blob/master/docs/advanced.md
const argv = require('yargs')
    .command({
        command: 'run <key> [value]',
        aliases: [],
        desc: 'Runs a sample',
        builder: (yargs) => {
            console.log(yargs);
            return yargs.default('value', 'true')
        },
        handler: (argv) => {
            console.log(`setting ${argv.key} to ${argv.value}`)
        }
    })
    .option('db', {
        default: 1
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


if (argv.db === 2) {
    options.database = 'C:\\DBS\\TEST_8859_1.fdb';
} else {
    options.database = 'C:\\DBS\\TEST_UTF8.fdb';
}

console.log(options);

// 5 = the number is count of opened sockets
var pool = Firebird.pool(5, options, (err) => {
    if (err) {
        console.log('Pool creation failed. ', err)
    } else {
        console.log('Pool creation succeed. ')
    }
});


export interface IProperty {
    key: string;
    type: 'blob' | 'text'
}
let BlobReadAll = async (rows, property: string | string[] | IProperty[], cb?: (...args) => void) => {
    let promStack = [];
    let properties = [];
    let p: IProperty[];

    // Convert string property into array of strings
    if (typeof property === 'string') {
        properties.push(property);
    } else if (!Array.isArray(property)) {
        throw new Error('Invalid call to blobReadAll');
    }


    properties = property as any;

    let propertiesAsArrayOfObj = [];
    properties.forEach((value) => {
            if (typeof value === 'string') {
                propertiesAsArrayOfObj.push({key: value, type: 'blob'} as IProperty)
            } else {
                propertiesAsArrayOfObj.push(value);
            }
    });
    p = propertiesAsArrayOfObj;

    p.forEach(() => {
        promStack.push([]);
    });

    /**
     * Reads a blob an returns it's content
     * Resolves the blob with the content
     * @param readFn
     * @param outputAs
     * @param cb
     * @private
     */
    let _read = (readFn, outputAs: 'utf8' | 'buffer', cb) => {
        return new Promise((resolve, reject) => {
            let t = typeof readFn;
            if (t === 'function') {

                readFn((err, name, e) => {
                    if (err) {
                        return reject(err);
                    }
                    if (typeof cb === 'function') {
                        cb(e);
                    }

                    let d = '';

                    e.on('data', (data) => {
                        d += data.toString('hex');
                    });

                    e.on('end', () => {
                        let b = Buffer.from(d, 'hex');
                        if (outputAs === 'buffer') {
                            resolve(b);
                        } else {
                            resolve(b.toString(outputAs));
                        }
                    })
                })
            }  else if (Buffer.isBuffer(readFn)) {
                resolve(outputAs === 'utf8' ? readFn.toString() : readFn);
            }
            else {
                resolve(null)
            }
        })
    };


    let promStack2 = (new Array(p.length)).fill([]);
    let results = [];
    for (let row of rows){
        let i = -1;
        for (let property of p) {
            i++;
            results[i] = results[i] || [];
            console.log('Reading ' + property.key);
            promStack2[i].push(_read(row[property.key], property.type === 'blob' ? 'buffer' : 'utf8', (e) => {}))
        }
    }

    let c0 = -1;
    for (let promStackCol of promStack2) {
        c0 ++;
        results.push(await Promise.all(promStackCol));
    }

    return results;
};

setTimeout(() => {

    var hrstart = process.hrtime()

// Get a free pool
    pool.get(function (err, db) {
        if (err)
            throw err;

        // db = DATABASE
        db.query('SELECT * FROM TEST_TABLE /*WHERE T_TABLE = 0*/', [],function (err, rows) {
            // IMPORTANT: release the pool connection
            console.log(rows);
            var m2 = Date.now()
            BlobReadAll(rows, [
                {key: 'T_MEMO', type: 'text'},
                {key: 'T_MEMO2', type: 'text'},
                {key: 'T_BLOB', type: 'blob'}
            ]) //'T_BLOB',
                .then((results) => {
                    let hrend = process.hrtime(hrstart)
                    console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
                    db.detach();
                })
                .catch((err) => {
                    console.log(err);
                    let hrend = process.hrtime(hrstart)
                    console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
                    db.detach();
                })
        });



    });
},300);

// Destroy pool
pool.destroy();
