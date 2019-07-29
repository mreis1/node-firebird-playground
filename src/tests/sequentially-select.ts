import {BlobReadAll} from "../_/blob-read-all";

module.exports = function (pool) {
    var hrstart = process.hrtime();
    // Get a free pool
    pool.get(function (err, db) {
        if (err) {
            /**
             * Note: "Error: Connection is closed." is thrown when we don't respect this statement:
             *
             * Firebird new wire protocol is not supported yet so for Firebird 3.0 you need to add the following in firebird.conf
             *    AuthServer = Legacy_Auth
             *    WireCrypt = Disabled
             */
            console.log('Failed to obtain pool connection ');
            throw err;
        }


        db.on('error', function (err) {
            console.log('Error event ...', err)
        });
        // db = DATABASE
        let rows = [];
        db.sequentially('SELECT * FROM TEST_TABLE /*WHERE T_TABLE = 0*/', [], function (row, index) {
            console.log('Row received ' + index);
            rows.push(row);
        }, (err) => {
            if (err) {
                 throw err;
            }

            let hrend = process.hrtime(hrstart);
            console.info('Query1: Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);

            /**
             * db.sequentially support issues:
             node-firebird works fine except with DOM_MEMO
             node-firebird-dev gets locked on first returned row
             */
            BlobReadAll(rows, [
                // {key: 'T_MEMO', type: 'text'},
                // {key: 'T_MEMO2', type: 'text'},
                {key: 'T_BLOB', type: 'blob'}
            ]) //'T_BLOB',
                .then((results) => {
                    let hrend = process.hrtime(hrstart);
                    console.info('Fetch Blob 2: Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);
                    db.detach();
                })
                .catch((err) => {
                    console.log(err);
                    let hrend = process.hrtime(hrstart);
                    console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);
                    db.detach();
                })


        });
    });
};
