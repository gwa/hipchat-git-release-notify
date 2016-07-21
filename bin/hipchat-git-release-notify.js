#!/usr/bin/env node
var exec = require('child_process').exec,
  http = require('http');

var
  project = process.argv[2],
  url     = process.argv[3],
  idroom  = process.argv[4],
  token   = process.argv[5];

// Try to get local git tag or hash and send a notification to the HipChat room.
getGitTag(function(tag) {
  if (tag) {
    sendNotification(
      project,
      tag,
      url,
      idroom,
      token
    );
    return;
  }

  getGitHash(function(hash) {
    if (hash) {
      sendNotification(
        project,
        hash,
        url,
        idroom,
        token
      );
      return;
    }

    console.log('no tag/hash available');
  });
});

// ----

function sendNotification(project, tag, url, idroom, token) {
  var options = {
      host: 'api.hipchat.com',
      path: '/v2/room/' + idroom + '/notification?auth_token=' + token,
      headers: {
        'Content-type': 'application/json'
      },
      method: 'POST'
    },
    postData = JSON.stringify({
      'notify': true,
      'message': project + ': <a href="' + url + '">' + tag + '</a> released.'
    });

    var req = http.request(options, function(res) {
      console.log(`STATUS: ${res.statusCode}`);
      // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        console.log('No more data in response.')
      })
    });

    req.on('error', function(e) {
      console.log(`problem with request: ${e.message}`);
    });

    // write data to request body
    req.write(postData);
    req.end();
}

// ----

function getGitTag(callback) {
  var parseError = function(response) {
    var pattern = /([a-f0-9]{40})/,
      matches = response.match(pattern);

    if (matches && matches[1]) {
      return matches[1];
    }

    return null;
  };

  executeShellCommand(
    'git describe --exact-match --tags',
    function (response) {
      callback(response);
    },
    function (error, stdout, stderr) {
      var matched = parseError(stderr);
      callback(matched);
    }
  );
}

function getGitHash(callback) {
  executeShellCommand(
    'git log -n 1 --pretty=format:"%H"',
    function (response) {
      callback(response);
    },
    function (error, stdout, stderr) {
      console.log(stderr);
      callback(null);
    }
  );
}

function executeShellCommand(command, onsuccess, onerror) {
  if (typeof onerror === 'undefined') {
    onerror = function(error, stdout, stderr) {
      console.log(error, stdout, stderr);
    };
  }

  exec(command, function (error, stdout, stderr) {
    if (error !== null) {
      onerror(error, stdout, stderr);
      return;
    }
    onsuccess(stdout);
  });
}
