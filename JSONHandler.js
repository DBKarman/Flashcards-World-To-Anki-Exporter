//Create and return ICard
function CreateICard(_front, _back, _deckId) {
    //Create object
    var card = {
        front: _front,
        back: _back,
        deckId: _deckId,
    };
    //Return object
    return card;
}
//Create and return IDeck
function CreateIDeck(_name, _deckId, _category) {
    //Create object
    var deck = {
        name: _name,
        deckId: _deckId,
        category: _category,
    };
    //Return object
    return deck;
}
//entry point for conversion
function ConvertJsonToAnkiText(json) {
    //convert to :JSON
    //let json: JSON = JSON.parse(jsonString);
    var _a, _b, _c, _d, _e;
    // =====get and put all cards into ICard[]=====
    var allCardsArray = [];
    //loop through all Json.cards
    for (var i_1 = 0; i_1 < json["cards"].length; i_1++) {
        var jsonCard = json["cards"][i_1];
        //get the values
        var term = jsonCard["term"];
        var definition = jsonCard["definition"];
        var deckId = jsonCard["deckId"];
        //create card: ICard
        var card = CreateICard(term, definition, parseInt(deckId));
        //push it into the array
        allCardsArray.push(card);
    }
    console.log("Number of cards: ".concat(allCardsArray.length));
    //      get and put all decks into IDeck[]
    var allDecksArray = [];
    //loop through all the Json.decks
    for (var i_2 = 0; i_2 < json["sets"].length; i_2++) {
        var jsonDeck = json["sets"][i_2];
        var deckName = jsonDeck["deckName"];
        var deckId = jsonDeck["deckId"];
        var category = void 0;
        //see whether the deck has a category
        if (jsonDeck["category"] == "" || jsonDeck["category"] === undefined) {
            // Deck has to category
            category = null;
        } //Deck has a category
        else {
            category = jsonDeck["category"];
        }
        //create object
        var deck = CreateIDeck(deckName, deckId, category);
        //push it onto the decks array
        allDecksArray.push(deck);
    }
    console.log("Number of decks: ".concat(allDecksArray.length));
    var stat_numberOfCardsAssignedToDecks = 0;
    var stat_numberOfDecksWithUnfoundDecks = 0;
    var deckIdsNotFound = [];
    //***Very slow way to do it, can be optimised ALOT,***
    //Assign all cards to their respective decks
    allCardsArray.forEach(function (card) {
        var deckFound = false;
        //find the deck with the corresponding deckId
        allDecksArray.forEach(function (deck) {
            //if deckID == deckID then add it
            if (deck["deckId"] == card["deckId"]) {
                //Initialise deck.cards if it isnt initialised
                if (deck.cards === undefined) {
                    deck.cards = [];
                }
                //add the card to deck
                deck.cards.push(card);
                stat_numberOfCardsAssignedToDecks++;
                //if the card was assigned to a deck then deckFound = true;
                deckFound = true;
            }
        });
        //if deck not found
        if (!deckFound) {
            //save the deckId and then change it to 1
            var deckIdWithNoMathingDeck_1 = card.deckId;
            card.deckId = 1;
            stat_numberOfDecksWithUnfoundDecks++;
            //(for debuging purposes) if cards deckId (before it was changed to 1) doesnt exists in deckIdsNotFound AND wasnt found in decks, then add it to deckIdsNotFound 
            var found_1 = false;
            deckIdsNotFound.forEach(function (deckId) {
                if (deckId == deckIdWithNoMathingDeck_1) {
                    found_1 = true;
                }
            });
            if (!found_1) {
                deckIdsNotFound.push(deckIdWithNoMathingDeck_1);
            }
        }
    });
    console.log("Number of cards assigned to decks: ".concat(stat_numberOfCardsAssignedToDecks));
    console.log("Number of cards which no deck were found: ".concat(stat_numberOfDecksWithUnfoundDecks));
    console.log(deckIdsNotFound);
    //      Add the cards which have been ignored (they have no deck id) to a new deck called "Unrecognised Cards (Cards without a deck)"
    var deckForCardsWithoutDecks = { name: "Unrecognised Cards (Cards without a deck)", deckId: 1, category: null };
    allCardsArray.forEach(function (card) {
        //if deck id is 1 (for the unorganised cards)
        if (card.deckId == 1) {
            //if not initialised initialise it
            if (deckForCardsWithoutDecks.cards === undefined) {
                deckForCardsWithoutDecks.cards = [];
            }
            //add it to the new deck for cards with no decks
            deckForCardsWithoutDecks.cards.push(card);
        }
    });
    console.log("=====================================================================");
    console.log("Cards with no deck: " + ((_a = deckForCardsWithoutDecks.cards) === null || _a === void 0 ? void 0 : _a.length));
    console.log("=====================================================================");
    //      Create array with names of all categories
    //Array full of the names of all existing categories
    var categoryNamesArray = [];
    //foreach deck in allDecksArray
    allDecksArray.forEach(function (deck) {
        //if category is null skip
        if (deck.category === null) {
            //skip
        }
        else {
            //exists?
            var exists = false;
            for (var index = 0; index < categoryNamesArray.length; index++) {
                var categoryName = categoryNamesArray[index];
                //if it contains it
                if (categoryName == deck.category) {
                    exists = true;
                    break;
                }
            }
            //if category doesnt exist in categoryNamesArray add it
            if (!exists) {
                //add it to categoryNamesArray
                categoryNamesArray.push(deck.category);
            }
        }
    });
    console.log("Number of categories named: ".concat(categoryNamesArray.length));
    //      Convert all the category names in categoryNamesArray into :ICategory[] in allCategoriesArray
    //categories array
    var allCategoriesArray = [];
    categoryNamesArray.forEach(function (categoryName) {
        var category = { name: categoryName };
        allCategoriesArray.push(category);
    });
    console.log("Category names converted to ICategory: ".concat(allCategoriesArray.length));
    //      add all flashcards with categories to respective category
    var stat_numberOfDecksAssignedToCategories = 0;
    //foreach category in allCategoriesArray
    allCategoriesArray.forEach(function (category) {
        //initialise category
        category.decks = [];
        //foreach deck in allDecksArray
        allDecksArray.forEach(function (deck) {
            var _a;
            //if deck category name == category name then add it
            if (category.name === deck.category) {
                //add it to the category
                (_a = category.decks) === null || _a === void 0 ? void 0 : _a.push(deck);
                stat_numberOfDecksAssignedToCategories++;
            }
        });
    });
    console.log("Category names decks assgined to categories: ".concat(stat_numberOfDecksAssignedToCategories));
    //      Add all decks without categories to decksWithoutCategories
    //decks without categories
    var decksWithoutCategories = [];
    allDecksArray.forEach(function (deck) {
        if (deck.category === null || deck.category === undefined) {
            decksWithoutCategories.push(deck);
        }
    });
    console.log("Decks detected without categories: ".concat(decksWithoutCategories.length));
    //if deckForCardsWithoutDecks isnt empty then add it to decksWithoutCategories
    if (deckForCardsWithoutDecks.cards !== undefined) {
        decksWithoutCategories.push(deckForCardsWithoutDecks);
    }
    //      Create and add everything to rootFlashcardsContainer
    var rootContainer = {};
    if (allCategoriesArray.length != 0) {
        rootContainer.categories = [];
    }
    if (decksWithoutCategories.length != 0) {
        rootContainer.decks = [];
    }
    //foreach category, add to rootContainer
    allCategoriesArray.forEach(function (category) {
        var _a;
        (_a = rootContainer.categories) === null || _a === void 0 ? void 0 : _a.push(category);
    });
    decksWithoutCategories.forEach(function (deck) {
        var _a;
        (_a = rootContainer.decks) === null || _a === void 0 ? void 0 : _a.push(deck);
    });
    console.log("RootContainer Number of Categories: ".concat((_b = rootContainer.categories) === null || _b === void 0 ? void 0 : _b.length));
    console.log("RootContainer Number of Decks: ".concat((_c = rootContainer.decks) === null || _c === void 0 ? void 0 : _c.length));
    var ankiTextFile = "#separator:tab\n#html:true\n#deck column:1\n#tags column:4\n";
    var stat_numberOfCardsInDecksWithCategoriesAddedToTextFile = 0;
    //      Convert to text file
    //add add all the decks with categories
    (_d = rootContainer.categories) === null || _d === void 0 ? void 0 : _d.forEach(function (category) {
        var _a;
        (_a = category.decks) === null || _a === void 0 ? void 0 : _a.forEach(function (deck) {
            var _a;
            (_a = deck.cards) === null || _a === void 0 ? void 0 : _a.forEach(function (card) {
                ankiTextFile += ConvertToAnkiText(category.name + "::" + deck.name, card.front, card.back);
                stat_numberOfCardsInDecksWithCategoriesAddedToTextFile++;
            });
        });
    });
    var stat_numberOfCardsInDecksWithOUTCategoriesAddedToTextFile = 0;
    //add add all the decks without categories
    (_e = rootContainer.decks) === null || _e === void 0 ? void 0 : _e.forEach(function (deck) {
        var _a;
        (_a = deck.cards) === null || _a === void 0 ? void 0 : _a.forEach(function (card) {
            ankiTextFile += ConvertToAnkiText(deck.name, card.front, card.back);
            stat_numberOfCardsInDecksWithOUTCategoriesAddedToTextFile++;
        });
    });
    console.log("Number of cards in decks WITH CATEGORIES appended to anki text file: ".concat(stat_numberOfCardsInDecksWithCategoriesAddedToTextFile));
    console.log("Number of cards in decks WITHOUT CATEGORIES appended to anki text file: ".concat(stat_numberOfCardsInDecksWithOUTCategoriesAddedToTextFile));
    console.log(i);
    //return it
    return ankiTextFile;
}
var i = 0;
//converts the front and back of a card into a suitable format
//if it contains " then replace it with ""
function ConvertToAnkiText(category, front, back) {
    //deck::subdeck*\u009*"front"*\u009*"back"
    front = replaceWithHTMLEntities(front);
    back = replaceWithHTMLEntities(back);
    i++;
    return (category + "\u0009" + '"' + front + '"' + "\u0009" + '"' + back + '"\n');
}
//Replaces all special characters with HTML entities 
function replaceWithHTMLEntities(str) {
    var result = '';
    for (var i_3 = 0; i_3 < str.length; i_3++) {
        var charCode = str.charCodeAt(i_3);
        if ((charCode >= 65 && charCode <= 90) || // A-Z
            (charCode >= 97 && charCode <= 122) || // a-z
            charCode == 32) { // space
            result += str[i_3];
        }
        else {
            result += '&#' + charCode + ';';
        }
    }
    return result;
}
