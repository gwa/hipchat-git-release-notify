#!/usr/bin/env node
var exec = require('child_process').exec,
  http = require('http');

var
  project = process.argv[2],
  url = process.argv[3];
  idroom = process.argv[4],
  token = process.argv[5],

getGitTag(function(tag) {
  if (tag) {
    sendNotification(
      project,
      tag,
      url,
      idroom,
      token
    );
  } else {
    console.log('no tag available');
  }
});

/*
'2953429',
'Zg7dtEKxQq5qoVDELjaDuJFP8cmQaLjdVRZ0e8eW'
*/

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
      'color': 'green',
      'notify': true,
      'message': project + ': <a href="' + url + '">' + tag + '</a> released.'
    });

    var req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        console.log('No more data in response.')
      })
    });

    req.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
    });

    // write data to request body
    req.write(postData);
    req.end();
}

// ----

/**
 * Returns either a git tag or hash
 */
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

function getGitBranch(callback) {
  executeShellCommand(
    'git rev-parse --abbrev-ref HEAD',
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
