/*

Copyright 2013 tadruj

Project home: https://github.com/tadruj/s3upload-coffee-javascript

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

*/

(function() {

  window.S3Upload = (function() {

    S3Upload.prototype.s3_sign_put_url = '/signS3put';

    S3Upload.prototype.file_dom_selector = '#file_upload';

    S3Upload.prototype.onFinishS3Put = function(public_url, file) {
      return console.log('base.onFinishS3Put()', public_url, file);
    };

    S3Upload.prototype.onProgress = function(percent, status, public_url, file) {
      return console.log('base.onProgress()', percent, status, public_url, file);
    };

    S3Upload.prototype.onError = function(status, file) {
      return console.log('base.onError()', status, file);
    };

    function S3Upload(options) {
      console.log("init s3 upload");
      if (options == null) {
        options = {};
      }
      // extend this with options from class passed on runtime
      _.extend(this, options);
      /*if (this.file_dom_selector) {
        this.handleFileSelect($(this.file_dom_selector).get(0));
      }*/
      //this.uploadTest();
      if(this.obj_to_upload){
        this.uploadObject(this.obj_to_upload);
      }    
    }


    S3Upload.prototype.handleFileSelect = function(file_element) {
      var f, files, output, _i, _len, _results;
      this.onProgress(0, 'Upload started.');
      files = file_element.files;
      output = [];
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        f = files[_i];
        _results.push(this.uploadFile(f));
      }
      return _results;
    };

   
    S3Upload.prototype.createCORSRequest = function(method, url) {
      var xhr;
      xhr = new XMLHttpRequest();
      if (xhr.withCredentials != null) {
        xhr.open(method, url, true);
      } else if (typeof XDomainRequest !== "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
      } else {
        xhr = null;
      }
      return xhr;
    };

    S3Upload.prototype.executeOnSignedUrl = function(obj, callback, opts) {
      var name, this_s3upload, type, xhr;
      this_s3upload = this;
      xhr = new XMLHttpRequest();
      type = opts && opts.type || obj.type;
      name = opts && opts.name || obj.name;
      // ask for request here...
      console.log("execute on singed url");
      xhr.open('GET', this.s3_sign_put_url + '?s3_object_type=' + type + '&s3_object_name=' + encodeURIComponent(name), true);
      xhr.onreadystatechange = function(e) {
        var result;
        if (this.readyState === 4 && this.status === 200) {
          try {
            result = JSON.parse(this.responseText);
          } catch (error) {
            this_s3upload.onError('Signing server returned some ugly/empty JSON: "' + this.responseText + '"');
            return false;
          }
          return callback(result.signed_request, result.url);
        } else if (this.readyState === 4 && this.status !== 200) {
          return this_s3upload.onError('Could not contact request signing server. Status = ' + this.status);
        }
      };
      return xhr.send();
    };

    S3Upload.prototype.uploadToS3 = function(file, url, public_url, opts) {
      var this_s3upload, type, xhr;
      this_s3upload = this;
      type = opts && opts.type || file.type;
      console.log("upload to s3");
      xhr = this.createCORSRequest('PUT', url);
      console.log(file);

      if (!xhr) {
        this.onError('CORS not supported');
      } else {
        xhr.onload = function() {
          if (xhr.status === 200) {
            this_s3upload.onProgress(100, 'Upload completed.', public_url, file);
            return this_s3upload.onFinishS3Put(public_url, file);
          } else {
            return this_s3upload.onError('Upload error: ' + xhr.status, file);
          }
        };
        xhr.onerror = function() {
          return this_s3upload.onError('XHR error.', file);
        };
        xhr.upload.onprogress = function(e) {
          var percentLoaded;
          if (e.lengthComputable) {
            percentLoaded = Math.round((e.loaded / e.total) * 100);
            return this_s3upload.onProgress(percentLoaded, (percentLoaded === 100 ? 'Finalizing.' : 'Uploading.'), public_url, file);
          }
        };
      }
      xhr.setRequestHeader('Content-Type', type);
      xhr.setRequestHeader('x-amz-acl', 'private');
      return xhr.send(file);
    };

    // question: how do we pass content?
    S3Upload.prototype.uploadObjectToS3 = function(obj, url, public_url, opts) {
      var this_s3upload, type, xhr;
      this_s3upload = this;
      type = obj.type;
      console.log("upload object to s3");
      xhr = this.createCORSRequest('PUT', url); 
      console.log(obj);
      console.log(type);
      if (!xhr) {
        this.onError('CORS not supported');
      } else {
        xhr.onload = function() {
          if (xhr.status === 200) {
            this_s3upload.onProgress(100, 'Upload completed.', public_url, obj);
            return this_s3upload.onFinishS3Put(public_url, obj);
          } else {
            return this_s3upload.onError('Upload error: ' + xhr.status, obj);
          }
        };
        xhr.onerror = function() {
          return this_s3upload.onError('XHR error.', obj);
        };
        xhr.upload.onprogress = function(e) {
          var percentLoaded;
          if (e.lengthComputable) {
            percentLoaded = Math.round((e.loaded / e.total) * 100);
            return this_s3upload.onProgress(percentLoaded, (percentLoaded === 100 ? 'Finalizing.' : 'Uploading.'), public_url, obj);
          }
        };
      }
      xhr.setRequestHeader('Content-Type', type);
      xhr.setRequestHeader('x-amz-acl', 'private');
      return xhr.send("hi there");
    };


    S3Upload.prototype.validate = function(file) {
      return null;
    };

    S3Upload.prototype.uploadFile = function(file, opts) {
      var error, this_s3upload;
      error = this.validate(file);
      if (error) {
        this.onError(error, file);
        return null;
      }
      this_s3upload = this;
      return this.executeOnSignedUrl(file, function(signedURL, publicURL) {
        return this_s3upload.uploadToS3(file, signedURL, publicURL, opts);
      }, opts);
    };


    S3Upload.prototype.uploadTest = function(opts) {
      var error, this_s3upload;
      //error = this.validate(file);
      /*if (error) {
        this.onError(error, file);
        return null;
      }*/
      file = {};
      file.type = "txt";
      file.name = "hello_world.txt";
      this_s3upload = this;
      return this.executeOnSignedUrl(file, function(signedURL, publicURL) {
        return this_s3upload.uploadToS3(file, signedURL, publicURL, opts);
      }, opts);
    };

    S3Upload.prototype.uploadObject = function(obj,opts) {
      var error, this_s3upload;
      //error = this.validate(file);
      /*if (error) {
        this.onError(error, file);
        return null;
      }*/
      console.log("upload object");

      //obj.name = "test";
      //obj.type = "text2";
      this_s3upload = this;
      return this.executeOnSignedUrl(obj, function(signedURL, publicURL) {
        return this_s3upload.uploadObjectToS3(obj, signedURL, publicURL, opts);
      }, opts);
    };


    return S3Upload;

  })();

}).call(this);
