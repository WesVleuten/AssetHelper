const PromiseCallback = function(callback, func) {
    return new Promise((resolve, reject) => {
        func((result) => {
            resolve(result);
            if (typeof callback == 'function') {
                callback(null, result);
            }
        }, (error) => {
            reject(error);
            if (typeof callback == 'function') {
                callback(error);
            }
        })
    });
};

module.exports = function AssetHelper(options) {
    var opt = options;
    if (!opt.endpoint) throw new Error("endpoint is not set");
    if (!opt.accessKeyId) throw new Error("accessKeyId is not set");
    if (!opt.secretAccessKey) throw new Error("secretAccessKey is not set");
    if (!opt.bucketName) throw new Error("bucketName is not set");

    var AWS = require('aws-sdk');
    var bucketName = opt.bucketName;
    AWS.config.accessKeyId = opt.accessKeyId;
    AWS.config.secretAccessKey = opt.secretAccessKey;
    var endpoint = new AWS.Endpoint(opt.endpoint);
    var s3 = new AWS.S3({endpoint: endpoint});

    const getBaseParameters = function(path) {
        let patharr = path.split('/');
        let filename = patharr.pop();
        let filepath = patharr.join('/')

        return {
            Bucket: bucketName + filepath,
            Key: filename
        };
    };

    return {
        _s3: s3,
        bucketName: bucketName,
    
        uploadData: function({ path, data, mime=null, meta=null, public=false }, cb) {
            return new PromiseCallback(cb, (resolve, reject) => {

                let base64data = Buffer.from(data, 'binary');
    
                let param = getBaseParameters(path);
                param['Body'] = base64data;

                if (mime) {
                    param['ContentType'] = mime;
                }
                if (meta) {
                    param['Metadata'] = meta;
                }
                if (public) {
                    param['ACL'] = public ? 'public-read' : 'private';
                }
    
                s3.putObject(param, function(err, data) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        },

        uploadFile: function({ source, path, mime=null, meta=null, public=false }, cb) {
            return new PromiseCallback(cb, async (resolve, reject) => {
                const fs = require('fs-extra');
                try {
                    if (mime == null) {
                        const mimelib = require('mime');
                        mime = mimelib.getType(path);
                    }

                    const data = await fs.readFile(source, 'utf8');
                    return this.uploadData({
                        data,
                        path,
                        mime,
                        meta,
                        public,
                    });
                } catch(e) {
                    reject(e);
                }
            });
        },

        removeFile: function({ path }, cb) {
            return new PromiseCallback(cb, (resolve, reject) => {
                let param = getBaseParameters(path);
                s3.deleteObject(param, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        }
    };
};
