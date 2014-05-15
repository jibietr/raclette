/*jshint strict:false, eqnull:true, node:true */

var http    = require('http'),
    OpenTok = require('opentok'),
    url     = require('url'),
    util    = require('util');

exports.index = function(req, res) {
  res.render('index');
};

exports.hostView = function(req, res) {
  res.render('host-view', {
    tbjs: req.config['TB.js'],
    apiKey: req.config.apiKey,
    session: req.opentokSession,
    token: req.opentok.generateToken({
      session_id: req.opentokSession,
      role:OpenTok.RoleConstants.MODERATOR,
      connection_data: 'host'
    })
  });
};

exports.participantView = function(req, res) {
  res.render('participant-view', {
    tbjs: req.config['TB.js'],
    apiKey: req.config.apiKey,
    session: req.opentokSession,
    token: req.opentok.generateToken({
      session_id: req.opentokSession,
      role: OpenTok.RoleConstants.PUBLISHER,
      connection_data: 'participant'
    })
  });
};

exports.pastArchives = function(req, res, next) {
  var offset = parseInt(req.query.offset), perPage = 5;
  if(!offset || isNaN(offset)) {
    offset = 0;
  }

  req.opentok.listArchives({ count: perPage, offset: offset }, function(err, archives, total) {
    if(err) {
      util.log('Error listing archives: ' + err.message);
      return next(err);
    }
    var showPrevious, showNext;
    if(offset > 0) {
      showPrevious = '/past-archives?offset=' + ((offset - perPage > 0) ? offset - perPage : 0);
    }
    if(total > offset + perPage) {
      showNext = '/past-archives?offset=' + (offset + perPage);
    }
    res.render('past-archives', {
      offset: offset,
      archives: archives,
      showPrevious: showPrevious,
      showNext: showNext
    });
  });
};

exports.downloadArchive = function(req, res, next) {
  req.opentok.getArchive(req.params.archive, function(err, archive) {
    if(err) {
      util.log('Error getting archive: ' + err.message);
      return next(err);
    }
    if(!archive.url || archive.status != 'available') {
      return next(Error('Archive is not available or has no URL'));
    }
    var movieURL = url.parse(archive.url);

    http.get({
      hostname: movieURL.hostname,
      port: movieURL.port || 80,
      path: movieURL.pathname
    }, function(movieRes) {
      if(movieRes.statusCode == 404) {
        next(Error('Archive file not found'));
        return;
      }
      if(movieRes.statusCode == 200) {
        res.setHeader('Content-Disposition', 'attachment; filename=archive-' +
          encodeURIComponent(archive.name || archive.id) + '.mp4');
      }
      res.setHeader('Server', 'Archiving Sample App');
      var skipKeys = ['x-amz-id-2', 'x-amz-request-id', 'server', 'content-disposition'];
      for(var key in movieRes.headers) {
        if(movieRes.headers.hasOwnProperty(key) && skipKeys.indexOf(key) < 0) {
          res.setHeader(key, movieRes.headers[key]);
        }
      }
      res.writeHead(movieRes.statusCode);
      movieRes.pipe(res);
    }).on('error', function(err) {
      util.log('Unable to get archive ' + archive.url + ': ' + err.message);
      next(Error('Error getting archive'));
    });

  });
};

exports.deleteArchive = function(req, res, next) {
  req.opentok.deleteArchive(req.params.archive, function(err) {
    if(err) {
      util.log('Error listing archives: ' + err.message);
      return next(err);
    }
    res.redirect('/past-archives');
  });
};

exports.startArchive = function(req, res, next) {
  req.opentok.startArchive(req.opentokSession, { name: 'Node.js Archiving Sample' },
    function(err, archive) {
    if(err) {
      util.log('Error starting archive: ' + err.message);
      return next(err);
    }
    res.send(archive);
  });
};

exports.stopArchive = function(req, res, next) {
  req.opentok.stopArchive(req.params.archive, function(err, archive) {
    if(err) {
      util.log('Error stopping archive: ' + err.message);
      return next(err);
    }
    res.send(archive);
  });
};
