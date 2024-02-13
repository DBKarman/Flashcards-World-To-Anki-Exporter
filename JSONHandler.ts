//Interfaces for Objects
interface ICard {
    front: string;
    back: string;
    deckId: number;
}
interface IDeck {
    name: string;
    deckId: number;
    category: string | null;
    cards?: ICard[];
}
interface ICategory {
    name: string;
    decks?: IDeck[];
}
interface IRootFlashcardsContainer {
    categories?: ICategory[];
    decks?: IDeck[];
}

//Create and return ICard
function CreateICard(_front: string, _back: string, _deckId: number): ICard {
    //Create object
    let card: ICard = {
        front: _front,
        back: _back,
        deckId: _deckId,
    };
    //Return object
    return card;
}

//Create and return IDeck
function CreateIDeck(
    _name: string,
    _deckId: number,
    _category: string | null
): IDeck {
    //Create object
    let deck: IDeck = {
        name: _name,
        deckId: _deckId,
        category: _category,
    };
    //Return object
    return deck;
}

//entry point for conversion
function ConvertJsonToAnkiText(json: JSON): string {
    //convert to :JSON
    //let json: JSON = JSON.parse(jsonString);

    // =====get and put all cards into ICard[]=====
    let allCardsArray: ICard[] = [];
    //loop through all Json.cards
    for (let i: number = 0; i < json["cards"].length; i++) {
        let jsonCard = json["cards"][i];

        //get the values
        let term: string = jsonCard["term"];
        let definition: string = jsonCard["definition"];
        let deckId: string = jsonCard["deckId"];

        //create card: ICard
        let card: ICard = CreateICard(term, definition, parseInt(deckId));

        //push it into the array
        allCardsArray.push(card);
    }
    console.log(`Number of cards: ${allCardsArray.length}`);

    //      get and put all decks into IDeck[]
    let allDecksArray: IDeck[] = [];
    //loop through all the Json.decks
    for (let i: number = 0; i < json["sets"].length; i++) {
        let jsonDeck = json["sets"][i];

        let deckName: string = jsonDeck["deckName"];
        let deckId: number = jsonDeck["deckId"];
        let category: string | null;

        //see whether the deck has a category
        if (jsonDeck["category"] == "" || jsonDeck["category"] === undefined) {
            // Deck has to category
            category = null;
        } //Deck has a category
        else {
            category = jsonDeck["category"];
        }

        //create object
        let deck: IDeck = CreateIDeck(deckName, deckId, category);

        //push it onto the decks array
        allDecksArray.push(deck);
    }
    console.log(`Number of decks: ${allDecksArray.length}`);

    let stat_numberOfCardsAssignedToDecks: number = 0;
    let stat_numberOfDecksWithUnfoundDecks: number = 0;
    let deckIdsNotFound: number[] = [];
    //***Very slow way to do it, can be optimised ALOT,***
    //Assign all cards to their respective decks
    allCardsArray.forEach((card) => {
        let deckFound: boolean = false;
        //find the deck with the corresponding deckId
        allDecksArray.forEach((deck) => {
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
            let deckIdWithNoMathingDeck = card.deckId;
            card.deckId = 1;

            stat_numberOfDecksWithUnfoundDecks++;

            //(for debuging purposes) if cards deckId (before it was changed to 1) doesnt exists in deckIdsNotFound AND wasnt found in decks, then add it to deckIdsNotFound
            let found: boolean = false;
            deckIdsNotFound.forEach((deckId) => {
                if (deckId == deckIdWithNoMathingDeck) {
                    found = true;
                }
            });
            if (!found) {
                deckIdsNotFound.push(deckIdWithNoMathingDeck);
            }
        }
    });
    console.log(
        `Number of cards assigned to decks: ${stat_numberOfCardsAssignedToDecks}`
    );
    console.log(
        `Number of cards which no deck were found: ${stat_numberOfDecksWithUnfoundDecks}`
    );
    console.log(deckIdsNotFound);

    //      Add the cards which have been ignored (they have no deck id) to a new deck called "Unrecognised Cards (Cards without a deck)"
    let deckForCardsWithoutDecks: IDeck = {
        name: "Unrecognised Cards (Cards without a deck)",
        deckId: 1,
        category: null,
    };
    allCardsArray.forEach((card) => {
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
    console.log(
        "====================================================================="
    );
    console.log(
        "Cards with no deck: " + deckForCardsWithoutDecks.cards?.length
    );
    console.log(
        "====================================================================="
    );

    //      Create array with names of all categories
    //Array full of the names of all existing categories
    let categoryNamesArray: string[] = [];
    //foreach deck in allDecksArray
    allDecksArray.forEach((deck) => {
        //if category is null skip
        if (deck.category === null) {
            //skip
        } else {
            //exists?
            let exists: boolean = false;
            for (let index = 0; index < categoryNamesArray.length; index++) {
                const categoryName = categoryNamesArray[index];

                //if it contains it
                if (categoryName == deck.category) {
                    exists = true;
                    break;
                }
            }

            //if category doesnt exist in categoryNamesArray add it
            if (!exists) {
                //add it to categoryNamesArray
                categoryNamesArray.push(deck.category as string);
            }
        }
    });
    console.log(`Number of categories named: ${categoryNamesArray.length}`);

    //      Convert all the category names in categoryNamesArray into :ICategory[] in allCategoriesArray
    //categories array
    let allCategoriesArray: ICategory[] = [];
    categoryNamesArray.forEach((categoryName) => {
        let category: ICategory = { name: categoryName };
        allCategoriesArray.push(category);
    });
    console.log(
        `Category names converted to ICategory: ${allCategoriesArray.length}`
    );

    //      add all flashcards with categories to respective category
    let stat_numberOfDecksAssignedToCategories: number = 0;
    //foreach category in allCategoriesArray
    allCategoriesArray.forEach((category) => {
        //initialise category
        category.decks = [];
        //foreach deck in allDecksArray
        allDecksArray.forEach((deck) => {
            //if deck category name == category name then add it
            if (category.name === deck.category) {
                //add it to the category
                category.decks?.push(deck);
                stat_numberOfDecksAssignedToCategories++;
            }
        });
    });
    console.log(
        `Category names decks assgined to categories: ${stat_numberOfDecksAssignedToCategories}`
    );

    //      Add all decks without categories to decksWithoutCategories
    //decks without categories
    let decksWithoutCategories: IDeck[] = [];
    allDecksArray.forEach((deck) => {
        if (deck.category === null || deck.category === undefined) {
            decksWithoutCategories.push(deck);
        }
    });
    console.log(
        `Decks detected without categories: ${decksWithoutCategories.length}`
    );

    //if deckForCardsWithoutDecks isnt empty then add it to decksWithoutCategories
    if (deckForCardsWithoutDecks.cards !== undefined) {
        decksWithoutCategories.push(deckForCardsWithoutDecks);
    }

    //      Create and add everything to rootFlashcardsContainer
    let rootContainer: IRootFlashcardsContainer = {};
    if (allCategoriesArray.length != 0) {
        rootContainer.categories = [];
    }
    if (decksWithoutCategories.length != 0) {
        rootContainer.decks = [];
    }
    //foreach category, add to rootContainer
    allCategoriesArray.forEach((category) => {
        rootContainer.categories?.push(category);
    });
    decksWithoutCategories.forEach((deck) => {
        rootContainer.decks?.push(deck);
    });
    console.log(
        `RootContainer Number of Categories: ${rootContainer.categories?.length}`
    );
    console.log(
        `RootContainer Number of Decks: ${rootContainer.decks?.length}`
    );

    let ankiTextFile: string =
        "#separator:tab\n#html:true\n#deck column:1\n#tags column:4\n";

    let stat_numberOfCardsInDecksWithCategoriesAddedToTextFile: number = 0;
    //      Convert to text file
    //add add all the decks with categories
    rootContainer.categories?.forEach((category) => {
        category.decks?.forEach((deck) => {
            deck.cards?.forEach((card) => {
                ankiTextFile += ConvertToAnkiText(
                    category.name + "::" + deck.name,
                    card.front,
                    card.back
                );
                stat_numberOfCardsInDecksWithCategoriesAddedToTextFile++;
            });
        });
    });
    let stat_numberOfCardsInDecksWithOUTCategoriesAddedToTextFile: number = 0;
    //add add all the decks without categories
    rootContainer.decks?.forEach((deck) => {
        deck.cards?.forEach((card) => {
            ankiTextFile += ConvertToAnkiText(deck.name, card.front, card.back);
            stat_numberOfCardsInDecksWithOUTCategoriesAddedToTextFile++;
        });
    });
    console.log(
        `Number of cards in decks WITH CATEGORIES appended to anki text file: ${stat_numberOfCardsInDecksWithCategoriesAddedToTextFile}`
    );
    console.log(
        `Number of cards in decks WITHOUT CATEGORIES appended to anki text file: ${stat_numberOfCardsInDecksWithOUTCategoriesAddedToTextFile}`
    );

    console.log(i);

    //return it
    return ankiTextFile;
}

let i: number = 0;
//converts the front and back of a card into a suitable format
//if it contains " then replace it with ""
function ConvertToAnkiText(
    category: string,
    front: string,
    back: string
): string {
    //deck::subdeck*\u009*"front"*\u009*"back"
    front = replaceWithHTMLEntities(front);
    back = replaceWithHTMLEntities(back);
    i++;
    return (
        category + "\u0009" + '"' + front + '"' + "\u0009" + '"' + back + '"\n'
    );
}

//Replaces all \" with "" and all \n with <br>
function replaceWithHTMLEntities(inputString) {
    // Replace all occurrences of \" with ""
    const doubleQuotesReplaced = inputString.replace(/\\"/g, '""');

    // Replace all occurrences of \n with <br>
    const newlinesReplaced = doubleQuotesReplaced.replace(/\n/g, '<br>');

    return newlinesReplaced;
}
