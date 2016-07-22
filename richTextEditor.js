(function() {
  angular.module('textEditor',[]);

  angular.module('textEditor')
  .directive('textEditor', ['$timeout', function($timeout) {
    return {
      scope: {
        editorValue: "=",
        emojiCodes: "=",
        onEnter: "&"
      },
      template: "<p id='editorInput' class='richEditor' contenteditable='true'></p>",
      link: function(scope, el, attrs) {
        var editor = el.find('p');
        var editorId = angular.element(editor)[0].id;

        if(scope.emojiCodes) {
          updateEmojiCodes(scope.emojiCodes);
        }

        editor.bind('keyup', function(event) {
          _debouncedHandleKeyPress(event, editor, scope);
        });

        scope.$watch('editorValue', function(newVal, oldVal) {
          if(newVal == "") {
            editor.html("");
          }
        })

        updateEl = function(str) {
          var editorEl = document.getElementById(editorId);
          var selection = saveSelection(editorEl);
          console.log(selection);
          $timeout(function () {
            scope.editorValue = str;
            var result = angular.element(document.getElementById('result'));
            var newText = parseText(str);
            editor.html(newText);
            restoreSelection(editorEl, selection);

          },0);
        }
      }
    }
  }])

  var _debouncedHandleKeyPress = debounce(function(event, editor, scope) {
    var keyCode = event.keyCode;
    if(!keyCodes[keyCode]) {
      updateEl(editor.html());
    }

    if(keyCode == 13 && scope.onEnter) {
      updateEl(editor.html());
      scope.onEnter();
    }
  }, 100);

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
    32 : 'space',
    13 : 'enter'
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

  var saveSelection, restoreSelection;

  if (window.getSelection && document.createRange) {

      saveSelection = function(containerEl) {
          var range = window.getSelection().getRangeAt(0);
          var preSelectionRange = range.cloneRange();
          preSelectionRange.selectNodeContents(containerEl);
          preSelectionRange.setEnd(range.startContainer, range.startOffset);
          var start = preSelectionRange.toString().length;
          return {
            start: start,
            end: start + range.toString().length
          };
      };

      restoreSelection = function(containerEl, savedSel) {
          var charIndex = 0, range = document.createRange();
          range.setStart(containerEl, 0);
          range.collapse(true);
          var nodeStack = [containerEl], node, foundStart = false, stop = false;

          while (!stop && (node = nodeStack.pop())) {
              if (node.nodeType == 3) {
                  var nextCharIndex = charIndex + node.length;
                  if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                      range.setStart(node, savedSel.start - charIndex);
                      foundStart = true;
                  }
                  if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                      range.setEnd(node, savedSel.end - charIndex);
                      stop = true;
                  }
                  charIndex = nextCharIndex;
              } else {
                  var i = node.childNodes.length;
                  while (i--) {
                      nodeStack.push(node.childNodes[i]);
                  }
              }
          }

          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
      }
  } else if (document.selection) {
      saveSelection = function(containerEl) {
          var selectedTextRange = document.selection.createRange();
          var preSelectionTextRange = document.body.createTextRange();
          preSelectionTextRange.moveToElementText(containerEl);
          preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
          var start = preSelectionTextRange.text.length;

          return {
              start: start,
              end: start + selectedTextRange.text.length
          }
      };

      restoreSelection = function(containerEl, savedSel) {
          var textRange = document.body.createTextRange();
          textRange.moveToElementText(containerEl);
          textRange.collapse(true);
          textRange.moveEnd("character", savedSel.end);
          textRange.moveStart("character", savedSel.start);
          textRange.select();
      };
  }

  function debounce(func, wait, immediate) {
  	var timeout;
  	return function() {
  		var context = this, args = arguments;
  		var later = function() {
  			timeout = null;
  			if (!immediate) func.apply(context, args);
  		};
  		var callNow = immediate && !timeout;
  		clearTimeout(timeout);
  		timeout = setTimeout(later, wait);
  		if (callNow) func.apply(context, args);
  	};
  };

})(angular);
