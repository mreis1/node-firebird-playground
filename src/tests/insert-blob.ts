import {BlobReadAll} from "../_/blob-read-all";
import * as fs from 'fs';
import * as path from "path";

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
        db.query('INSERT INTO TEST_TABLE(T_TABLE,T_BLOB, T_MEMO2, T_MEMO) VALUES (?,?,?,?)', [
            Date.now(),
            fs.createReadStream(path.join(process.cwd(), './assets/photo.jpg')),
            fs.createReadStream(path.join(process.cwd(), './assets/data.txt')),
            fs.createReadStream(path.join(process.cwd(), './assets/data.txt'))
        ], function (err, rows) {
            if (err) {
                return console.log(err);
            }
            let hrend = process.hrtime(hrstart);
            console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);
            db.detach();
        });

    });
}
