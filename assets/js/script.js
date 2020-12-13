// gather elements
var mainEl = $("main");
var searchEl = $("#search-input");
var circleIndicatorOneEl = $("#circle-indicator-1");
var circleIndicatorTwoEl = $("#circle-indicator-2");

// build arrays to store local data
var suggestions = [];
var recipeBookData = [];
var shoppingSelection = [];

// create data arrays of api type specific parameters so single functions can be used for both
var meals = {
    listURL:"https://www.themealdb.com/api/json/v1/1/list.php?i=list",
    indexSearchURL:"https://www.themealdb.com/api/json/v1/1/filter.php?i=",
    idSearchURL:"https://www.themealdb.com/api/json/v1/1/lookup.php?i=",
    targetContainer:"meals",
    targetElement:"strIngredient",
    searchTerm:"",
    type:"Meal"
}

var drinks = {
    listURL:"https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list",
    indexSearchURL:"https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=",
    idSearchURL:"https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=",
    targetContainer:"drinks",
    targetElement:"strIngredient1",
    searchTerm:"",
    type:"Drink"
}

// START AUTOCOMPLETE //

// FUNCTION to fetch list of options from api to populate array of suggestions for search feature
// IN: Array of values relevant to either meal or drink api
var prepAutocomplete = function(typeArr) {
    // unpack search array
    var searchURL = typeArr.listURL;
    var searchContainer = typeArr.targetContainer;
    var searchElement = typeArr.targetElement;

    // clear any existing suggestions
    suggestions = [];

    // fetch list of options from api url
    fetch(searchURL)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    data[searchContainer].forEach(element => {
                        suggestions.push(element[searchElement]);
                    });
                })
            } else {
                console.log("invalid api url");
            }
        });
    
    // assign suggestions to element
    searchEl.autocomplete({
        source: suggestions,
        appendTo: "#suggestions-wrapper",
        autoFocus: true
    });
}

// END AUTOCOMPLETE //



// START SEARCH FUNCTIONS

// FUNCTION to run whenever the input element on the search section is submitted, depending on the conditions of the submit (meal or drink), this function will trigger the appropriate respone
// IN: event
var submitHandler = function(event) {
    // prevent from refreshing page
    event.preventDefault();

    // check if current submission is valid
    if (!searchEl.val() || searchEl.val() == " ") {
        console.log("please enter a valid search term");
        return;
    }

    // if meal is being submitted, transition to drink search
    if (circleIndicatorOneEl.hasClass("active")) {
        // save current search term
        meals.searchTerm = searchEl.val();

        // populate results
        generateResults(meals, searchEl.val());

        // clear input and update placeholder
        searchEl.val("");
        searchEl.attr("placeholder","Search Liquor");

        // update suggestions array
        prepAutocomplete(drinks);

        // update circle indication
        circleIndicatorOneEl.removeClass("active");
        circleIndicatorTwoEl.addClass("active");
        
    } else { 
        // save current search term
        drinks.searchTerm = searchEl.val();

        // populate results
        generateResults(drinks, searchEl.val());

        // enable scrolling and scroll to results section
        mainEl.attr("overflow-y","scroll");
        mainEl[0].scrollTo(0, $('#results-section').offset().top);

        // reset search section
        searchEl.val("");
        searchEl.attr("placeholder","Search Liquor");
        prepAutocomplete(meals);
        circleIndicatorTwoEl.removeClass("active");
        circleIndicatorOneEl.addClass("active");

        // allow free scrolling of page
        mainEl.css("overflow-y","scroll");
    }
}

// END SEARCH FUNCTIONS



// START RESULTS FUNCTIONS

// FUNCTION to gather the search results and build the results elements
// IN: Data Array containing result type and searched term
var generateResults = function(typeArr, searchTerm) {
    // unpack type array
    var targetContainer = typeArr.targetContainer;
    var indexSearchURL = typeArr.indexSearchURL;

    // clear any existing result data from previous searches
    var recipeContainerId = "#" + typeArr.type.toLowerCase() + "-result";
    var typeEl = $(recipeContainerId);
    typeEl.html("");
    
    // gather search result 
    fetch(indexSearchURL + searchTerm)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    data[targetContainer].forEach(element => {
                        var recipeData = gatherApiData(typeArr, element);
                        generateRecipeElement("results", typeArr, recipeData);
                    })
                });
            } else {
                console.log("the searched term did not respond valid data");
            }
        });
}

// FUNCTION to build and append a single recipe cell to the appropriate recipes container
// IN: section = string to determine which <section> recipe cells are being added to
//     type = Data Array containing search specific terms for the element data type (meal v. drink)
//     data = custom array of recipe data
var generateRecipeElement = function(section, typeArr, recipeData) {
    var recipeContainerId = "#" + typeArr.type.toLowerCase() + "-" + section;
    var typeEl = $(recipeContainerId);

    // cell wrapper for individual result
    var cellDiv = document.createElement("div");
    // bg img/ result icon
    var img = document.createElement("img");
    // div wrapper for title
    var h6Div = document.createElement("div");
    // title
    var h6 = document.createElement("h6");

    // add classes needed to elements
    $(cellDiv).addClass("cell large-4 recipe-cell");
    $(h6Div).addClass("recipe-bg");
    $(h6).addClass("recipe");

    // add data-img
    $(img).attr("src", recipeData.icon);
    // add text data-title of drink
    $(h6).text(recipeData.title);
    // set result id to cell id
    $(cellDiv).attr("id", recipeData.id);
    
    // put h4 in h4 wrapper
    h6Div.append(h6);
    // put h4 and img in cell
    cellDiv.append(img, h6Div);
    // append cell to results element
    typeEl.append(cellDiv);
}

// END RESULTS FUNCTIONS



// START MODAL FUNCTIONS

// FUNCTION to distinguish between meal and drink results
// IN: some string that identifies if the data is meal or drink
// OUT: type array containing necessary search terms for meal or drink
var getTypeArr = function(someString) {
    // create empty array to hold type
    var typeArr = [];

    // assign array to type based on string input
    if (someString.toLowerCase().includes("meal")) {
        typeArr = meals;
    } else if (someString.toLowerCase().includes("drink")) {
        typeArr = drinks;
    } else {
        console.log("invalid argument passed to getTypeArr");
    }
    return typeArr
}

// FUNCTION to gather all desired values from api and reformat into a recipe data array
// IN data object from api
// OUT reformated array containing relevant recipe info
var gatherApiData = function(typeArr, apiData) {
    // unpack type array
    var targetContainer = typeArr.targetContainer;

    // enables this function to be used for both index and id search results
    var dataInfo = [];
    try { dataInfo =  apiData[targetContainer][0]}
    catch { dataInfo = apiData}

    // unpack data array
    var recipeId = dataInfo["id" + typeArr.type];
    var recipeTitle = dataInfo["str" + typeArr.type];
    var recipeInstructions = dataInfo.strInstructions;
    //modalInstructions = modalInstructions.replace('\n', '<<b></b>br>');
    var recipeIcon = dataInfo["str" + typeArr.type + "Thumb"];
    var recipeSource = dataInfo.strSource;

    // Filtering through the objects to find list of ingredients and put their values in an array
    var recipeIngredients = [];
    for (var i = 0; i < 15; i++) { // ingredients list goes to 15 max in api
        if (dataInfo["strIngredient"+i]) {
            recipeIngredients.push(" " + dataInfo["strIngredient"+i]); //added (" " + ) to add spaces after ingredient item
        };
    };

    // build new data structure to hold recipe info
    var recipeData = {
        id: recipeId,
        title: recipeTitle,
        instructions: recipeInstructions,
        icon: recipeIcon,
        source: recipeSource,
        ingredients: recipeIngredients
    }

    return recipeData
}


// FUNCTION to run whenever a result cell is clicked, generates a modal to display the corresponding api data for the selected cell
// IN: event object (cell being clicked)
var recipeClicked = function(event) {
    // get container
    var container = $(event.target).closest(".recipe-cell");
    // get unique ip for api search
    var recipeId = $(container).attr("id");

    // get result type (meal or drink)
    var recipeContainer = $(event.target).closest(".recipes");
    var recipeContainerId = recipeContainer.attr("id");
    var typeArr = getTypeArr(recipeContainerId);

    // get api data for clicked result id
    fetch(typeArr.idSearchURL + recipeId)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    var recipeData = gatherApiData(typeArr, data);
                    openModal(typeArr, recipeData);
                })
            } else {
                console.log("no good baby");
            }
        });
}

// FUNCTION to build and open modal to display api info of cell clicked
// IN: type array for meal or drink and custon recipe array of data of selected id
var openModal = function(typeArr, recipeData) {
    // initialize save button text
    var saveText = "";

    // update modal properties per selected cell
    $("#result-name").text(recipeData.title);
    
    // update icon image
    $("#result-highlight-img").html("<img id=\"recipe-icon\" src='" + recipeData.icon + "'/>");

    // update source address
    $("#source").attr("href",recipeData.source);

    // add descriptive details
    $("#instructions").text("Instructions: " + recipeData.instructions);
    $("#ingredients").text("Ingredients: " + recipeData.ingredients);

    // switch save button text to remove from recipe book if result already saved
    var saveText = "";
    if (recipeBookData.some(recipe => recipe.id === recipeData.id)) {
        saveText = "Remove from Recipe Book"
    } else {
        saveText = "Save to Recipe Book"
    }

    // add attributes to buttons for easier event handling
    $("#recipe-save-btn")
        .text(saveText)
        .attr('data-id', recipeData.id)
        .attr('data-type', typeArr.type);
    $("#save-shop-btn")
        .attr('data-id', recipeData.id)
        .attr('data-type', typeArr.type);

    // open the modal 
    var modal = new Foundation.Reveal($('#result-modal'));
    modal.open();
}

// FUNCTION to save the id of the currently selected modal to the recipe book array
// IN: event object (modal save button)
var saveRecipe = function(event) {
    // grab type and id from button
    var id = $(event.target).attr("data-id");
    var type = $(event.target).attr("data-type");

    // save to recipe book / local storage
    var recipeData = {type: type, id: id};

    // Find if the array already has recipe as object by comparing the property value
    if (recipeBookData.some(recipe => recipe.id === id)) {
        // delete if already saved (clicked "remove from recipe book)") by
        // updating recipe book var to not include this recipe
        recipeBookData = recipeBookData.filter(recipe => recipe.id !== id);
        // update local storage to array
        localStorage.setItem('recipeBookData', JSON.stringify(recipeBookData));
        // remove from recipe book
        // addRecipe = false;
        // update text of modal
        $("#recipe-save-btn").text("Save To Recipe Book");

    } else { 
        // not a duplicate so save (clicked "save to recipe book")
        recipeBookData.push(recipeData);
        // update local storage to array
        localStorage.setItem('recipeBookData', JSON.stringify(recipeBookData));
        // add to recipe book
        // addRecipe = true;
        // update text of modal
        $("#recipe-save-btn").text("Remove From Recipe Book");
    }

    // populate to recipe book right away 
    updateRecipeBook();
}

// FUNCTION runs when save shopping list button on modal is clicked
// grabs the data of the recipe currently open in the modal and uses it to rebuild the shopping list
// also saves the current recipes in the shopping list so will stay when page refreshes
var saveShoppingList = function(event) {
    // grab type from button
    var recipeId = $(event.target).attr("data-id");
    var typeArr = getTypeArr($(event.target).attr("data-type"));

    // run function to rebuild shopping list for input type
    // grab data from current modal instead of fetching from api
    var recipeIcon = $("#recipe-icon").attr("src");
    var recipeTitle = $("#result-name").text();
    var recipeIngredients = $("#ingredients").text().split(':').pop().split(",");
    // build input array for function
    var recipeData = {icon:recipeIcon, title:recipeTitle, ingredients:recipeIngredients};
    //run function
    updateShoppingList(typeArr, recipeData);

    // save recipes currently open in shopping list to local storage
    // build data structure to save
    var recipeData = {type: typeArr.type, id: recipeId}; 

    // get recipe selection from local storage
    shoppingSelection = JSON.parse(localStorage.getItem("shoppingSelection"));

    // initialize array if selection is blank
    if (!shoppingSelection) {shoppingSelection = [{},{}]};

    // add recipe to appropriate type
    if (recipeData.type === "Meal") {
        shoppingSelection[0] = recipeData;
    } else {
        shoppingSelection[1] = recipeData;
    };

    // push to local storage
    localStorage.setItem('shoppingSelection', JSON.stringify(shoppingSelection));
}

// END MODAL FUNCTIONS

// START RECIPE BOOK FUNCTIONS

// FUNCTION grabs saved recipe ids from local storage and builds info into recipe cells
// only called when page reloads
var generateShoppingList = function() {
    // get recipe selection from local storage
    shoppingSelection = JSON.parse(localStorage.getItem("shoppingSelection"));

    // check if empty before loading
    if (shoppingSelection) {
        // populate shopping lists with data from api
        shoppingSelection.forEach(recipe => {
            var typeArr = getTypeArr(recipe.type);
            fetch(typeArr.idSearchURL + recipe.id)
                .then(function(response) {
                    if (response.ok) {
                        response.json().then(function(data) {
                            var recipeData = gatherApiData(typeArr, data);
                            updateShoppingList(typeArr, recipeData);
                            });
                    } else {
                        console.log("no good baby");
                    }
                });
        });

    } else {
        console.log("no recipes selected for shopping list");
        shoppingSelection = [];
    }
}

// FUNCTION to populate shopping list with info from recipe
// IN type array to distinguish meal or drink
// IN custom array of recipe data
var updateShoppingList = function(typeArr, recipeData) {
    // gather target elements
    var parent = $("." + typeArr.type.toLowerCase() + "-shopping-card");
    var cardIcon = parent.find(".shopping-image");
    var cardTitle = parent.find(".recipe-title");
    var cardList = parent.find("#shopping-list");

    // assign data
    cardIcon.attr("src",recipeData.icon);
    cardTitle.text(recipeData.title);
    // clear previous list
    cardList.html("");
    recipeData.ingredients.forEach(ingredient => {
        var ingredientEl = document.createElement("li");
        $(ingredientEl).text(ingredient);
        cardList.append(ingredientEl);
    });
}

// END RECIPE BOOK FUNCTIONS

// START RECIPE BOOK FUNCTIONS

// FUNCTION grabs saved recipe ids from local storage and builds info into recipe cells
var updateRecipeBook = function() {
    // clear any existing result data from previous searches
    $("#meal-recipes").html("");
    $("#drink-recipes").html("");

    // get recipes from local storage
    recipeBookData = JSON.parse(localStorage.getItem("recipeBookData"));

    // check if empty before loading
    if (recipeBookData) {
        // populate recipe book section with saved data
        recipeBookData.forEach(recipe => {
            var typeArr = getTypeArr(recipe.type);
            fetch(typeArr.idSearchURL + recipe.id)
                .then(function(response) {
                    if(response.ok) {
                        response.json().then(function(data) {
                            var recipeData = gatherApiData(typeArr, data);
                            generateRecipeElement("recipes", typeArr, recipeData);
                        })
                    } else {
                        console.log("no good baby");
                    }
                });
        });
    } else {
        console.log("no recipes in local storage");
        recipeBookData = [];
    }
}

// END RECIPE BOOK FUNCTIONS



// START UP FUNCTIONS

// assign search suggestions (autocomplete) to input elements
prepAutocomplete(meals);

// generate shopping list from previous selection in local storage
generateShoppingList();
// generate recipe book from local storage
updateRecipeBook();
 
// END START UP FUNCTIONS



// EVENT HANDLERS START

// add event handler to search section 
$("#search-form").on("submit", submitHandler);

// add event handler when a result cell is clicked
$(".recipes").on("click", recipeClicked);

// add event handler to save recipe button in modal
$("#recipe-save-btn").on("click", saveRecipe);
// add event handler to update shopping list button in modal
$("#save-shop-btn").on("click", saveShoppingList);

// EVENT HANDLERS END

