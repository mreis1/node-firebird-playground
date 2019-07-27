export const options = {} as any;
options.host = process.env['FB_HOST'] || '127.0.0.1';
options.port = process.env['FB_PORT'] || 3050;
options.user = process.env['FB_USER'] || 'SYSDBA';
options.password = process.env['FB_PASSWORD'] || 'masterkey';
options.lowercase_keys = false; // set to true to lowercase keys
options.role = null;            // default
options.pageSize = 1024 * 16;        // default w
