
export interface IProperty {
    key: string;
    type: 'blob' | 'text'
}
export let BlobReadAll = async (rows, property: string | string[] | IProperty[], cb?: (...args) => void) => {
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
