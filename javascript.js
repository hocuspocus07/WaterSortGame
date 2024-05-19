let tubeContainer = document.getElementById('tubeContainer');
let colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];
let gameStatus = true;
let tubeCount = 8;
let moveStack = [];

function createTubes() {
    for (let i = 0; i < tubeCount; i++) {
        let tube = document.createElement('div');
        tube.classList.add('tube');
        tube.addEventListener('click', tubeClicked);
        tube.classList.add(`tube-${i + 1}`);
        tubeContainer.appendChild(tube);
    }
}
function addColors() {
    let tubes = document.querySelectorAll('.tube');
    let chosenTubes = new Set(); // To ensure that in a particular tube, 4 colors are added only once
    let colorSegments = [];

    // Add each color 4 times to the array
    colors.forEach(color => {
        for (let i = 0; i < 4; i++) {
            colorSegments.push(color);
        }
    });
    while (colorSegments.length > 0) {
        tubes.forEach(tube => {
            if (colorSegments.length > 0) {
                for (let i = 0; i < tubeCount - 2; i++) {
                    let tubeIndex;
                    do {
                        tubeIndex = parseInt(Math.random() * tubes.length);
                    } while (chosenTubes.has(tubeIndex));

                    let tube = tubes[tubeIndex];
                    chosenTubes.add(tubeIndex);
                    for (let j = 0; j < 4; j++) {
                        let randomIndex = Math.floor(Math.random() * colorSegments.length);
                        let color = colorSegments.splice(randomIndex, 1)[0];
                        let colorSegment = document.createElement('div');
                        colorSegment.classList.add('color');
                        colorSegment.classList.add(`${color}`);
                        colorSegment.style.backgroundColor = color;
                        tube.appendChild(colorSegment);
                    }
                }
            }
        })
    }
}
let firstClickedTube = null;
let secondClickedTube = null;
function tubeClicked(event) {
    if (!gameStatus) return;
    if (!firstClickedTube) {
        // Handle the first click
        firstClickedTube = event.currentTarget;
        firstClickedTube.classList.add('selected');
        firstClickedTube.style.transform = 'scale(1.2)';
    } else {
        // Handle the second click
        secondClickedTube = event.currentTarget;

        // Proceed with color exchange
        exchangeColors(firstClickedTube, secondClickedTube);

        // Reset the selection
        firstClickedTube.style.transform = 'scale(1)';
        firstClickedTube.classList.remove('selected'); // Remove selection
        firstClickedTube = null;
        secondClickedTube = null;
    }
}
function exchangeColors(firstClickedTube, secondClickedTube) {
    let colorSegments1 = Array.from(firstClickedTube.children);
    let colorSegments2 = Array.from(secondClickedTube.children);
    // Check if atleast one color is present in the tube
    if (colorSegments1.length > 0) {
        // Check if the second tube is empty or does it have a same color
        if (colorSegments2.length === 0 || colorSegments1[colorSegments1.length - 1].style.backgroundColor === colorSegments2[colorSegments2.length - 1].style.backgroundColor) {

            if (colorSegments2.length < 4) {
                let lastColor = colorSegments1[colorSegments1.length - 1].style.backgroundColor;
                let moveCount = 0;
                // Count consecutive same colors
                for (let i = colorSegments1.length - 1; i >= 0; i--) {
                    if (colorSegments1[i].style.backgroundColor === lastColor) {
                        moveCount++;
                    } else {
                        break;
                    }
                }
                // Ensure the move doesn't exceed the capacity of the second tube
                let movedColors = [];
                if (colorSegments2.length + moveCount <= 4) {
                    for (let i = 0; i < moveCount; i++) {
                        let segmentToMove = firstClickedTube.lastChild;
                        movedColors.push(segmentToMove.style.backgroundColor);
                        secondClickedTube.appendChild(segmentToMove);
                    }
                    logLastMove(firstClickedTube, secondClickedTube, movedColors);
                    checkTubeFill(secondClickedTube);
                } else {
                    let maxMove = 4 - colorSegments2.length;//Since the maximum allowed colors are 4, and whatever the moveCount will be, one less color should be moved to the second tube
                    for (let i = 0; i < maxMove; i++) {
                        let segmentToMove = firstClickedTube.lastChild;
                        movedColors.push(segmentToMove.style.backgroundColor);
                        secondClickedTube.appendChild(segmentToMove);
                    }
                    logLastMove(firstClickedTube, secondClickedTube, movedColors);
                }
            } else {
                console.log("Second tube is full");//If the second tube already contains four colors
            }
        } else {
            console.log("Colors do not match");//If colors don't match
        }
    } else {
        console.log("One or both tubes are empty, cannot exchange colors.");//If the first tube is empty or if both tubes are empty
    }
}
function logLastMove(fromTube, toTube, movedColors) {
    let move = {
        fromTube: fromTube,
        toTube: toTube,
        movedColors: movedColors
    };
    moveStack.push(move);

    let logger = document.getElementById('logMoves');
    if (movedColors.length == 2) {
        movedColors.pop(movedColors[1]);
    }
    if (movedColors.length == 3) {
        movedColors.pop(movedColors[1]);
        movedColors.pop(movedColors[1]);
    }//Handled the case of same colors
    // Create a new div for the move log entry
    let moveInfo = document.createElement('div');
    moveInfo.id = "move";

    // Create color circle
    let colorDiv = '';
    for (let color of movedColors) {
        colorDiv += `<div class="colorSquare" style="background-color: ${color};"></div>`;
    }

    // Set the inner HTML of the moveInfo div
    moveInfo.innerHTML = `${fromTube.classList[1]} &ensp; <img src="move.png" width="30" height="20">&ensp; ${toTube.classList[1]} &ensp;${colorDiv}`;

    // Append the moveInfo div to the logger
    logger.appendChild(moveInfo);
    logger.scrollTop = logger.scrollHeight;
}

function undoLastMove() {
    if (moveStack.length === 0) return;
    
    let lastMove = moveStack.pop();
    let logger = document.getElementById('logMoves');
    
    // Remove the last move element from the log
    let lastMoveElement = logger.lastElementChild;
    if (lastMoveElement) {
        logger.removeChild(lastMoveElement);
    }
    let fromTube = lastMove.fromTube;
    let toTube = lastMove.toTube;
    let movedColors = lastMove.movedColors;
    let lastColor = toTube.children.length > 0 ? toTube.children[0].style.backgroundColor : null; //get the top color of the last clicked tube
    toTube.addEventListener('click', tubeClicked);
    let sameColors = 0;
    // Count consecutive same colors
    for (let i = toTube.children.length - 1; i >= 0; i--) {
        if (toTube.children[i].style.backgroundColor === lastColor) {
            sameColors++;
        } else {
            break;
        }
    }
    if (toTube.children.length === 4&&sameColors===4) {
        tubesFilled--;
    }
    // Move the segments back from the toTube to the fromTube
    for (let i = 0; i < movedColors.length; i++) {
        let segmentToMoveBack = toTube.lastChild;
        fromTube.appendChild(segmentToMoveBack);
    }
}
document.getElementById('undo').addEventListener('click', undoLastMove);

let tubesFilled = 0;
function checkTubeFill(secondClickedTube) {
    let colorSegments = secondClickedTube.children;
    if (colorSegments.length !== 4) {
        return false;//Tube isn't filled yet
    }

    let firstColor = colorSegments[0].style.backgroundColor;

    for (let i = 1; i < colorSegments.length; i++) {
        if (colorSegments[i].style.backgroundColor !== firstColor) {
            return false;//Tube is full but they're not of same color
        }
    }
    tubesFilled++;
    checkWin();
    secondClickedTube.removeEventListener('click', tubeClicked);
    return true;
}
function checkWin() {
    if (tubesFilled === colors.length) {
        gameStatus = false;
        let message = document.getElementById('tubeContainer');
        message.innerHTML = '';
        document.body.style.backgroundImage = 'url(win.gif)';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundPosition = 'center';
    }
}
function resetValues() {
    gameStatus = true;
    tubeContainer.innerHTML = '';
    createTubes();
    addColors();
    tubesFilled = 0;
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundPosition = '';
    document.getElementById('logMoves').innerHTML = '';
    moveStack = [];
}
document.getElementById('reset').addEventListener('click', resetValues);
addEventListener('DOMContentLoaded', function () {
    createTubes();
    addColors();
})