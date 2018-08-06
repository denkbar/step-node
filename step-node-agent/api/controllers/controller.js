module.exports = function Controller (agentContext, fileManager) {
  let exports = {}

  const fs = require('fs');
  const path = require("path");
  const OutputBuilder = require('./output')

  exports.filemanager = fileManager;

  exports.reserveToken = function (req, res) {
    exports.reserveToken_(req.params.tokenId)
    res.json({})
  }

  exports.reserveToken_ = function (tokenId) {
    console.log('[Controller] Reserving token: ' + tokenId)
  }

  exports.releaseToken = function (req, res) {
    exports.releaseToken_(req.params.tokenId)
    res.json({})
  }

  exports.releaseToken_ = function (tokenId) {
    console.log('[Controller] Releasing token: ' + tokenId)
    
    let session = agentContext.tokenSessions[tokenId]
    if (session){
        // call close() for each closeable object in the session:
    	Object.entries(session).forEach(function(element) {
    		if (typeof element[1]['close'] == 'function') {
    			console.log('[Controller] Closing closeable object \''+element[0]+'\' for token: ' + tokenId)
    			element[1].close();
    		}
    	});
    } else {
    	console.log('[Controller] No session founds for token: ' + tokenId)
    }
  }
  exports.process = function (req, res) {
    const tokenId = req.params.tokenId
    const keywordName = req.body.function
    const argument = req.body.argument
    const properties = req.body.properties

    exports.process_(tokenId, keywordName, argument, properties, function (payload) {
      res.json(payload)
    })
  }

  exports.process_ = function (tokenId, keywordName, argument, properties, callback) {
    const outputBuilder = new OutputBuilder(callback)

    try {
      const filepathPromise = exports.filemanager.loadOrGetKeywordFile(agentContext.controllerUrl + '/grid/file/', properties['$node.js.file.id'], properties['$node.js.file.version'], keywordName)

      filepathPromise.then(function (keywordPackageFile) {
        console.log('[Controller] Executing keyword ' + keywordName + ' using filepath ' + keywordPackageFile)
        exports.executeKeyword(keywordName, keywordPackageFile, tokenId, argument, properties, outputBuilder, agentContext)
      }, function (err) {
        console.log('[Controller] Error while attempting to run keyword ' + keywordName + ' :' + err)
      })
    } catch (e) {
      outputBuilder.fail(e)
    }
  }

  exports.executeKeyword = async function (keywordName, keywordPackageFile, tokenId, argument, properties, outputBuilder, agentContext) {

    try{
      //const keywordDir = agentContext.properties['keyworddir'];
      var kwDir = path.resolve(keywordPackageFile+"/keywords");

      console.log('[Controller] Search keyword file in ' + kwDir + ' for token ' + tokenId)

      var keywordFunction = searchAndRequireKeyword(kwDir, keywordName);

      if (keywordFunction) {
        console.log('[Controller] Found keyword for token ' + tokenId);
        let session = agentContext.tokenSessions[tokenId]

        if (!session) session = {}

        console.log('[Controller] Executing keyword ' + keywordName + ' on token ' + tokenId)
        
        try {
        	await keywordFunction(argument, outputBuilder, session, properties)
            console.log('[Controller] Keyword successfully executed on token ' + tokenId)
        } catch(e) {
        	var onError = searchAndRequireKeyword(kwDir, "onError");
        	if (onError) {
        		if (await onError(e)) {
                    console.log('[Controller] Keyword execution failed and the onError function returned \'true\' on token ' + tokenId)
                    outputBuilder.fail(e)
        		} else {
                  console.log('[Controller] Keyword execution failed but the onError function returned \'false\' on token ' + tokenId)
        		  outputBuilder.send();
        		}
        	} else {
                console.log('[Controller] Keyword execution failed and no onError function found on token ' + tokenId)
        		outputBuilder.fail(e)
        	}
        }
      }
      else {
        outputBuilder.fail('Unable to find keyword ' + keywordName)
      }
    } catch (e) {
      outputBuilder.fail('An error occured while attempting to execute the keyword ' + keywordName + '. Exception was: ' + JSON.stringify(e))
    }
  }

  function searchAndRequireKeyword(kwDir, keywordName) {
    var keywordFunction;
    var kwFiles = fs.readdirSync(kwDir);
    kwFiles.every(function(kwFile) {
      if(kwFile.endsWith(".js")) {
        const kwMod = require(kwDir+"/"+kwFile);
        if(kwMod[keywordName]) {
          keywordFunction = kwMod[keywordName];
          return false;
        }
      }
      return true;
    })
    return keywordFunction;
  }

  return exports
}