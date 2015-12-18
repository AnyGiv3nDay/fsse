var key = [2815074099, 1725469378, 4039046167, 874293617, 3063605751, 3133984764, 4097598161, 3620741625];
var iv = sjcl.codec.hex.toBits("7475383967656A693334307438397532");
sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();
var isLoaded=false;

$(document).ready(function(){
  

  if(window.location.href.indexOf("?preset=") > -1 && window.location.href.indexOf("?savename=") > -1){
       
    urlPreset = window.location.href.substring(window.location.href.indexOf("?preset=")+8, window.location.href.indexOf("?savename="));
    urlSaveName = window.location.href.substring(window.location.href.indexOf("?savename=")+10);
   
    preset(urlPreset,urlSaveName);
     

  }
});

function handleFileSelect(evt) {
   
  try {
    evt.stopPropagation();
    evt.preventDefault();
    var f = evt.target.files[0];
    var fileName = f.name;
    if (f.size > 1e7) {
      throw "File exceeds maximum size of 10MB"
    }
    if (f) {
      var reader = new FileReader;
      if (evt.target.id == "sav_file") {
        reader.onload = function (evt2) {
          try {
            decrypt(evt2, fileName, reader.result)
          } catch (e) {
            alert("Error: " + e)
          }
        };
        reader.readAsText(f)
      } else if (evt.target.id == "json_file") {
        reader.onload = function (evt2) {
          try {
            encrypt(evt2, fileName, reader.result)
          } catch (e) {
            alert("Error: " + e)
          }
        };
        reader.readAsText(f)
      }
    }
  } catch (e) {
    alert("Error: " + e)
  } finally {
    evt.target.value = null
  }
   
}

function decrypt(evt, fileName, base64Str) {
   
  var cipherBits = sjcl.codec.base64.toBits(base64Str);
  var prp = new sjcl.cipher.aes(key);
  var plainBits = sjcl.mode.cbc.decrypt(prp, cipherBits, iv);
  var jsonStr = sjcl.codec.utf8String.fromBits(plainBits);
  try {
    edit(fileName, JSON.parse(jsonStr));
  } catch (e) {
    throw "Decrypted file does not contain valid JSON: " + e
  }
   
}

function encrypt(fileName, save) {
   
  var compactJsonStr = JSON.stringify(save);
  var plainBits = sjcl.codec.utf8String.toBits(compactJsonStr);
  var prp = new sjcl.cipher.aes(key);
  var cipherBits = sjcl.mode.cbc.encrypt(prp, plainBits, iv);
  var base64Str = sjcl.codec.base64.fromBits(cipherBits);
  var blob = new Blob([base64Str], {
    type: "text/plain"
  });


  saveAs(blob, fileName.replace(".txt", ".sav").replace(".json", ".sav"))

   
}

document.getElementById("sav_file").addEventListener("change", function (e) {
   
  $('.box').removeClass('hover').addClass('ready');
  $('.instructions').hide();

  
  handleFileSelect(e);
   
}, false);

document.ondragover = document.ondrop = function (e) {
  e.preventDefault();
  return false;
};

$('body .container .box')
  .on('dragover', function (e) {
    $('.box').addClass('hover');
    $('.instructions').hide();
  })
  .on('dragleave', function (e) {
    $('.box').removeClass('hover');
    $('.instructions').show();
  })
  .on('drop', function (e) {
       
    $('.box').removeClass('hover').addClass('ready');
    $('.instructions').hide();

    var file = e.originalEvent.dataTransfer.files[0],
      fileName = file.name,
      reader = new FileReader();

    reader.onload = function (ev) {
      try {
        decrypt(ev, fileName, reader.result);
      } catch (err) {
        alert("Error: " + err);
      }
    };

    reader.readAsText(file);

    e.preventDefault();
    return false;

       
  });


// Modifications
function edit(fileName, save) {
  
   
  isLoaded=true;
  var scope = angular.element($('body').get(0)).scope();

  scope.$apply(function () {
    scope.save = save;
    scope.fileName = fileName;
  });

   
}

var app = angular.module('shelter', []);

app.controller('dwellerController', function ($scope) {

  $scope.section = 'vault';

  $scope.fileName = '';
  $scope.dweller = {};
  $scope.statsName = ['Unknown', 'S.', 'P.', 'E.', 'C.', 'I.', 'A.', 'L.'];

  var _save = {},
    _lunchboxCount = 0,
    _handyCount = 0;
	_petCarrierCount = 0;
  Object.defineProperty($scope, 'save', {
    get: function () {
      return _save
    },
    set: function (val) {
      _save = val;

      extractCount();
    }
  });

  Object.defineProperty($scope, 'lunchboxCount', {
    get: function () {
      return _lunchboxCount
    },
    set: function (val) {
      _lunchboxCount = val;

      updateCount();
    }
  });

  Object.defineProperty($scope, 'handyCount', {
    get: function () {
      return _handyCount
    },
    set: function (val) {
      _handyCount = val;

      updateCount();
    }
  });
  
  Object.defineProperty($scope, 'petCarrierCount', {
    get: function () {
      return _petCarrierCount
    },
    set: function (val) {
      _petCarrierCount = val;

      updateCount();
    }
  });
  
  

  $scope.editDweller = function (dweller) {
    $scope.dweller = dweller;
  };

  $scope.maxSpecial = function () {
    $scope.dweller.stats.stats[1].value = 10;
    $scope.dweller.stats.stats[2].value = 10;
    $scope.dweller.stats.stats[3].value = 10;
    $scope.dweller.stats.stats[4].value = 10;
    $scope.dweller.stats.stats[5].value = 10;
    $scope.dweller.stats.stats[6].value = 10;
    $scope.dweller.stats.stats[7].value = 10;
  };

  $scope.closeDweller = function (dweller) {
    $scope.dweller = {};
  };

  $scope.download = function () {
    encrypt($scope.fileName, $scope.save);
  };

  function extractCount() {

    
    if ($scope.save.vault.LunchBoxesByType.toString().indexOf("0") > -1){
      _lunchboxCount = $scope.save.vault.LunchBoxesByType.toString().match(/0/g).length;
    } else {
      _lunchboxCount = 0;
    }

    if ($scope.save.vault.LunchBoxesByType.toString().indexOf("1") > -1){
      _handyCount = $scope.save.vault.LunchBoxesByType.toString().match(/1/g).length;
    } else {
      _handyCount = 0;
    }

    if ($scope.save.vault.LunchBoxesByType.toString().indexOf("2") > -1){
      _petCarrierCount = $scope.save.vault.LunchBoxesByType.toString().match(/2/g).length;
    } else {
      _petCarrierCount = 0;
    }


    $scope.lunchboxCount = _lunchboxCount;
    $scope.handyCount = _handyCount;
    $scope.petCarrierCount = _petCarrierCount;

   
  }

  function updateCount() {
       
    var types = $scope.save.vault.LunchBoxesByType = [],
    count = $scope.save.vault.LunchBoxesCount = _lunchboxCount + _handyCount + _petCarrierCount;

    for (var i = 0; i < _lunchboxCount; i++){
      types.push(0);
    }

    for (var i = 0; i < _handyCount; i++){
      types.push(1);
    }

    for (var i = 0; i < _petCarrierCount; i++){
      types.push(2);
    }

  }

});



function preset(preset, saveFileName){
   
  if(isLoaded==true){
    if(window.location.href.indexOf("?") > -1){
      window.location.href = window.location.href.substring(0,window.location.href.indexOf("?")) +  "?preset=" + preset + "?savename=" + saveFileName;
    }else{
      window.location.href = window.location.href +  "?preset=" + preset + "?savename=" + saveFileName;

    }
    throw new Error("There already is a savefile loaded.")

  }
  file = "presets/" + preset + ".json";

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = readPreset;
  
  xhr.open("GET", file, true);
  xhr.send();


  function readPreset()
  {
     
    if (xhr.readyState == 4) {
      var resp = JSON.parse(xhr.responseText);
      $('.instructions').hide();
      edit(saveFileName, resp);

    }
     
  };

  
   
}
