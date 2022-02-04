const tileDisplay = document.querySelector(".tile-container");
const keyboard = document.querySelector(".keyboard-container");
const messageDisplay = document.querySelector(".message-container");

let wordle;

const getWordle = () => {
	fetch("http://localhost:8000/word")
		.then((response) => response.json())
		.then((json) => {
			wordle = json.toUpperCase();
		})
		.catch((err) => console.log(err));
};

getWordle();

// array of keys
const keys = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", "ENTER", "Z", "X", "C", "V", "B", "N", "M", "<<"];

// array for each line of available guesses
const guessRows = [
	["", "", "", "", ""],
	["", "", "", "", ""],
	["", "", "", "", ""],
	["", "", "", "", ""],
	["", "", "", "", ""],
	["", "", "", "", ""],
];

let currentRow = 0;
let currentTile = 0;
let isGameOver = false;

guessRows.forEach((guessRow, guessRowIndex) => {
	// create a div for each available row (6x)
	const rowElement = document.createElement("div");
	rowElement.setAttribute("id", "guessRow-" + guessRowIndex);
	// create a tile for each available letter guess per row (5x)
	guessRow.forEach((guess, guessIndex) => {
		const tileElement = document.createElement("div");
		//give unique id to each tile
		tileElement.setAttribute("id", "guessRow-" + guessRowIndex + "-tile-" + guessIndex);
		//give each tile a class of tile
		tileElement.classList.add("tile");
		rowElement.append(tileElement);
	});
	tileDisplay.append(rowElement);
});

// create a keyboard where each key has a onClick listener
keys.forEach((key) => {
	const buttonElement = document.createElement("button");
	buttonElement.textContent = key;
	buttonElement.setAttribute("id", key);
	buttonElement.addEventListener("click", () => handleClick(key));
	keyboard.append(buttonElement);
});

// what happens on click?
const handleClick = (letter) => {
	if (!isGameOver) {
		// backspace gets deleted from board
		if (letter === "<<") {
			deleteLetter();
			return;
		}
		// enter press checks board
		if (letter === "ENTER") {
			checkRow();
			return;
		}
		//guessed letter is added to board
		addLetter(letter);
	}
};

// add a letter to the board
const addLetter = (letter) => {
	if (currentTile < 5 && currentRow < 6) {
		// grab a tile in order
		const tile = document.getElementById("guessRow-" + currentRow + "-tile-" + currentTile);
		// set the tile to the letter chosen
		tile.textContent = letter;
		// change the rows array to include each letter choice
		guessRows[currentRow][currentTile] = letter;
		// give a data attribute
		tile.setAttribute("data", letter);
		// move to next tile
		currentTile++;
	}
};

const deleteLetter = () => {
	if (currentTile > 0) {
		// move to previous tile
		currentTile--;
		// grab a tile in order
		const tile = document.getElementById("guessRow-" + currentRow + "-tile-" + currentTile);
		// reset tile to blank
		tile.textContent = "";
		// reset tile in array to blank
		guessRows[currentRow][currentTile] = "";
		// reset data attribute to blank
		tile.setAttribute("data", "letter");
	}
};

const checkRow = () => {
	// turn array of guesses to string
	const guess = guessRows[currentRow].join("");
	// only allow check on a full row
	if (currentTile > 4) {
		// call API to determine if the guess is a recognized word,
		// if it's not, the guess will no be submitted or checked
		fetch(`http://localhost:8000/check/?word=${guess}`)
			//take the response and turn it into json
			.then((response) => response.json())
			.then((json) => {
				if (json == "Entry word not found") {
					showMessage("Invalid word");
					return;
				} else {
					flipTile();
					if (wordle === guess) {
						showMessage("Awesome!");
						isGameOver = true;
						return;
					} else {
						if (currentRow >= 5) {
							isGameOver = true;
							showMessage("Game Over");
							return;
						}
						if (currentRow < 5) {
							currentRow++;
							currentTile = 0;
						}
					}
				}
			})
			.catch((err) => console.log(err));
	}
};

// show a message
const showMessage = (message) => {
	const messageElement = document.createElement("p");
	messageElement.textContent = message;
	messageDisplay.append(messageElement);
	setTimeout(() => messageDisplay.removeChild(messageElement), 3000);
};

const addColorToKeyboard = (keyLetter, color) => {
	const key = document.getElementById(keyLetter);
	key.classList.add(color);
};

const flipTile = () => {
	const rowTiles = document.querySelector("#guessRow-" + currentRow).childNodes;
	let checkWordle = wordle;
	const guess = [];

	rowTiles.forEach((tile) => {
		guess.push({ letter: tile.getAttribute("data"), color: "grey-overlay" });
	});

	guess.forEach((guess, index) => {
		if (guess.letter == wordle[index]) {
			guess.color = "green-overlay";
			checkWordle = checkWordle.replace(guess.letter, "");
		}
	});

	guess.forEach((guess) => {
		if (checkWordle.includes(guess.letter)) {
			guess.color = "yellow-overlay";
			checkWordle = checkWordle.replace(guess.letter, "");
		}
	});

	rowTiles.forEach((tile, index) => {
		setTimeout(() => {
			tile.classList.add("flip");
			tile.classList.add(guess[index].color);
			addColorToKeyboard(guess[index].letter, guess[index].color);
		}, 500 * index);
	});
};
