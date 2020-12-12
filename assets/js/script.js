// gather elements
var mainEl = $("main");
var searchEl = $("#search-input");
var circleIndicatorOneEl = $("#circle-indicator-1");
var circleIndicatorTwoEl = $("#circle-indicator-2");

// build arrays to store local data
var suggestions = [];
var recipeBookData = [];

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
var prepAutocomplete = function(type) {
    // unpack search array
    var searchURL = type.listURL;
    var searchContainer = type.targetContainer;
    var searchElement = type.targetElement;

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
var generateResults = function(type, searchTerm) {
    // unpack type array
    var targetContainer = type.targetContainer;
    var indexSearchURL = type.indexSearchURL;

    // clear any existing result data from previous searches
    var recipeContainerId = "#" + type.type.toLowerCase() + "-result";
    var typeEl = $(recipeContainerId);
    typeEl.html("");
    
    // gather search result 
    fetch(indexSearchURL + searchTerm)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    data[targetContainer].forEach(element => {
                        generateRecipeElement("results", type, element);
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
//     data = api data for a single recipe
var generateRecipeElement = function(section, type, data) {
    // unpack type array
    var recipeIcon = "str" + type.type + "Thumb";
    var recipeTitle = "str" + type.type;
    var recipeIdNo = "id" + type.type;
    var recipeContainerId = "#" + type.type.toLowerCase() + "-" + section;
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
    $(img).attr("src", data[recipeIcon]);
    // add text data-title of drink
    $(h6).text(data[recipeTitle]);
    // set result id to cell id
    $(cellDiv).attr("id", data[recipeIdNo]);
    
    // put h4 in h4 wrapper
    h6Div.append(h6);
    // put h4 and img in cell
    cellDiv.append(img, h6Div);
    // append cell to results element
    typeEl.append(cellDiv);
}

// END RESULTS FUNCTIONS



// START MODAL FUNCTIONS

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
    var type = getTypeArr(recipeContainerId);

    // get api data for clicked result id
    fetch(type.idSearchURL + recipeId)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    openModal(type, data);
                })
            } else {
                console.log("no good baby");
            }
        });
}

// FUNCTION to distinguish between meal and drink results
// IN: some string that identifies if the data is meal or drink
// OUT: type array containing necessary search terms for meal or drink
var getTypeArr = function(someString) {
    // create empty array to hold type
    var type = [];

    // assign array to type based on string input
    if (someString.toLowerCase().includes("meal")) {
        type = meals;
    } else if (someString.toLowerCase().includes("drink")) {
        type = drinks;
    } else {
        console.log("invalid argument passed to getTypeArr");
    }
    return type
}

// FUNCTION to build and open modal to display api info of cell clicked
// IN: type array for meal or drink and api data of selected id
var openModal = function(type, data) {
    // unpack type array
    var targetContainer = type.targetContainer;
    
    // unpack data array
    var dataInfo = data[targetContainer][0];
    var modalId = dataInfo["id" + type.type];
    var modalTitle = dataInfo["str" + type.type];
    var modalInstructions = dataInfo.strInstructions;
    //modalInstructions = modalInstructions.replace('\n', '<<b></b>br>');
    var modalIcon = dataInfo["str" + type.type + "Thumb"];
    var modalSource = dataInfo.strSource;
    var saveText = "";

    // Filtering through the objects to find list of ingredients and put their values in an array
    var modalIngredients = [];
    for (var i = 0; i < 15; i++) { // ingredients list goes to 15 max in api
        if (dataInfo["strIngredient"+i]) {
            modalIngredients.push(" " + dataInfo["strIngredient"+i]); //added (" " + ) to add spaces after ingredient item
        };
    };

    // update modal properties per selected cell
    $("#result-name").text(modalTitle);
    
    // update icon image
    $("#result-highlight-img").html("<img src='" + modalIcon + "'/>");

    // update source address
    $("#source").attr("href",modalSource);

    // add descriptive details
    $("#instructions").text("Instructions: " + modalInstructions);
    $("#ingredients").text("Ingredients: " + modalIngredients);

    // switch save button text to remove from recipe book if result already saved
    var saveText = "";
    if (recipeBookData.some(recipe => recipe.id === modalId)) {
        saveText = "Remove from Recipe Book"
    } else {
        saveText = "Save to Recipe Book"
    }

    // add result type and id to save bttn for easier event handling
    $("#recipe-save-btn")
        .text(saveText)
        .attr('data-id', modalId)
        .attr('data-type', type.type);

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

    // add or remove var
    //var addRecipe = true;

    // save to recipe book / local storage
    var recipeData = {type: type, id: id};

    // Find if the array already has recipe as object by comparing the property value
    if (recipeBookData.some(recipe => recipe.id === id)) {
        console.log(recipeBookData);
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
    generateRecipeBook();
}

// END MODAL FUNCTIONS



// START RECIPE BOOK FUNCTIONS

// FUNCTION grabs saved recipe ids from local storage and builds info into recipe cells
var generateRecipeBook = function() {
    // clear any existing result data from previous searches
    $("#meal-recipes").html("");
    $("#drink-recipes").html("");

    // get recipes from local storage
    recipeBookData = JSON.parse(localStorage.getItem("recipeBookData"));

    // check if empty before loading
    if (recipeBookData) {
        // populate recipe book section with saved data
        recipeBookData.forEach(recipe => {
            var type = getTypeArr(recipe.type);
            fetch(type.idSearchURL + recipe.id)
                .then(function(response) {
                    if(response.ok) {
                        response.json().then(function(data) {
                            data[type.targetContainer].forEach(element => {
                                generateRecipeElement("recipes", type, element);
                            })
                        })
                    } else {
                        console.log("no good baby");
                    }
                });
        });
    } else {
        console.log("no local storage");
    }
}

// END RECIPE BOOK FUNCTIONS



// START UP FUNCTIONS

// assign search suggestions (autocomplete) to input elements
prepAutocomplete(meals);

// generate recipe book from local storage
generateRecipeBook();
 
// END START UP FUNCTIONS



// EVENT HANDLERS START

// add event handler to search section 
$("#search-form").on("submit", submitHandler);

// add event handler when a result cell is clicked
$(".recipes").on("click", recipeClicked);

// add event handler to save recipe button in modal
$("#recipe-save-btn").on("click", saveRecipe);

// EVENT HANDLERS END

