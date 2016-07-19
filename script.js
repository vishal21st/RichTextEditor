(function() {
  angular.module('textEditor',[]);

  angular.module('textEditor')
  .directive('textEditor', ['$timeout', function($timeout) {
    return {
      scope: {
        editorValue: "=",
        emojiCodes: "="
      },
      template: "<p id='editorInput' class='richEditor' contenteditable='true'></p>",
      link: function(scope, el, attrs) {
        var editor = el.find('p');
        var editorId = angular.element(editor)[0].id;

        if(scope.emojiCodes) {
          updateEmojiCodes(scope.emojiCodes);
        }

        editor.bind('keyup', function(event) {
          var keyCode = event.keyCode;
          if(!keyCodes[keyCode]) {
            updateEl(editor.html());
          }
        });

        scope.$watch('editorValue', function(newVal, oldVal) {
          if(newVal == "") {
            editor.html("");
          }
        })

        updateEl = function(str) {
          $timeout(function () {
            scope.editorValue = str;
            var result = angular.element(document.getElementById('result'));
            var newText = parseText(str);
            editor.html(newText);
            placeCaretAtEnd(editorId);
          },0);
        }
      }
    }
  }])


  var emojiCodes =  {
    ':)': { pattern: ":\\)",
            img: "<img src='emoji.jpg' class='emoji smile'></img>",
            type: "smile"
          },

    '<3': { pattern : "\\&lt;3",
            img: "<img src='emoji.jpg' class='emoji love'></img>",
            type: "love"
         }
  }

  var keyCodes = {
    37 : 'arrowLeft' ,
    38: 'arrowRight',
    40: 'arrowDown',
    39: 'arrowTop',
    32 : 'space'
  }

  function updateEmojiCodes(codes) {
    for(key in codes) {
      emojiCodes[key] = codes[key];
    }
  }

  function parseText (str) {
    var _str = str;
    for(var key in emojiCodes) {
      var pattern = new RegExp(emojiCodes[key].pattern,'g');
      _str = _str.replace(pattern, emojiCodes[key].img);
    }
    return _str;
  }

  function placeCaretAtEnd(elementId) {
    var el = document.getElementById(elementId);
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
  }

})(angular);
