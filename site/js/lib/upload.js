var xhr = _this = this,
        new XMLHttpRequest(),
fd = new FormData(),
key = this.email + '/' + epoch.toString() + '/' + file.name;
 
// Populate the Post paramters.
fd.append('key', key);
fd.append('AWSAccessKeyId', 'XXXXXXXXXXXX');
fd.append('acl', 'private');
fd.append('success_action_redirect', "https://attachments.me/upload_callback")
fd.append('policy', "CnsiZXhwaXJhdGlvbiI6ICIyMDIwLTAxLTAxVDAwOjAwOjAwWiIsCiJjb25kaXRpb25zIjogWyAKICB7ImJ1Y2tldCI6ICJhdHRhY2htZW50c21lLWZpbGUtZHJvcCJ9LCAKICBbInN0YXJ0cy13aXRoIiwgIiRrZXkiLCAiIl0sCiAgeyJhY2wiOiAicHJpdmF0ZSJ9LAogIHsic3VjY2Vzc19hY3Rpb25fcmVkaXJlY3QiOiAiaHR0cHM6Ly9hdHRhY2htZW50cy5tZS91cGxvYWRfY2FsbGJhY2sifSwKICBbInN0YXJ0cy13aXRoIiwgIiRDb250ZW50LVR5cGUiLCAiIl0sCiAgWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsIDAsIDUyNDI4ODAwMF0KXQp9")
fd.append('signature',"IwZctkWS92kelyYv1KfIKqZotwo=")
fd.append('Content-Type', '$Content-Type')
// This file object is retrieved from a file input.
fd.append('file', file);
xhr.open('POST', 'https://attachmentsme-file-drop.s3.amazonaws.com', true);
 
// Keep track of upload progress so that we can message
// it to the user.
xhr.upload.addEventListener('progress', function(e) {
    if (firstProgressEvent) {
	_this.total += e.total;
	}
    firstProgressEvent = false;
    _this.loaded += (e.loaded - lastBytesLoaded);
    _this.onProgress(_this.loaded / _this.total);
}, false);
 
// If the upload completes we should decrement the uploads
// currently taking place.
xhr.onreadystatechange = function() {
    if (xhr.readyState != 4)  { return; }
    
    _this.uploadsInProgress --;
    
    // Explicitly trigger our upload complete endpoint. There's a bug with
    // redirects in Chrome which makes this necessary.
    xhr = new XMLHttpRequest();
    xhr.open("GET", "https://attachments.me/upload_callback?key=" + key, false);
    xhr.send(null);
};
