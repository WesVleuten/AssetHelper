module.exports = function AssetHelper(options) {
    var opt = options;
    if (!opt.endpoint) throw new Error("endpoint is not set");
    if (!opt.accessKeyId) throw new Error("accessKeyId is not set");
    if (!opt.secretAccessKey) throw new Error("secretAccessKey is not set");
    if (!opt.bucketName) throw new Error("bucketName is not set");

    
    var publicDefault = null;
    if (opt.publicDefault) {
        publicDefault = opt.publicDefault;
    }

    var AWS = require('aws-sdk');
    var async = require('async');
    var bucketName = opt.bucketName;
    AWS.config.accessKeyId = opt.accessKeyId;
    AWS.config.secretAccessKey = opt.secretAccessKey;
    var endpoint = new AWS.Endpoint(opt.endpoint);
    var s3 = new AWS.S3({endpoint: endpoint});

    return {
        _s3: s3,
        bucketName: bucketName,
    
        upload: function(options, callback) {
            var opt = options;
            var filedata = opt.data;
            var filename = opt.name;
            var filepath = opt.path;
            var mime = opt.mime;
            var public = opt.public !== undefined ? opt.public : publicDefault;
            var meta = opt.meta;

            if (!filedata || !filename || !filepath) throw new Error('One of required parameters missing');

            var base64data = new Buffer(filedata, 'binary');

            var param = {
                Bucket: scope.bucketName + filepath,
                Key: filename,
                Body: base64data
            };
            
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
                if (err) return callback(err);
                callback(null);
            });
        },
    
        download: function(file, callback) {
    
        },

        metadata: function(file, callback) {

        },
    
        exists: function(file, callback) {
    
        }
    };
};
