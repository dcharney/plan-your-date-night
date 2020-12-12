// gather elements
var mainEl = $("main");
var searchEl = $("#search-input");
var circleIndicatorOneEl = $("#circle-indicator-1");
var circleIndicatorTwoEl = $("#circle-indicator-2");

// build arrays to store local data
suggestions = [];

// create data arrays of api type specific parameters so single functions can be used for both
meals = {
    listURL:"https://www.themealdb.com/api/json/v1/1/list.php?i=list",
    indexSearchURL:"https://www.themealdb.com/api/json/v1/1/filter.php?i=",
    idSearchURL:"https://www.themealdb.com/api/json/v1/1/lookup.php?i=",
    targetContainer:"meals",
    targetElement:"strIngredient",
    searchTerm:"",
    type:"Meal"
}
drinks = {
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
        generateResults(meals);

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
        generateResults(drinks);

        // enable scrolling and scroll to results section
        mainEl.attr("overflow-y","scroll");
        mainEl[0].scrollTo(0, $('#results-section').offset().top);

        // reset search section
        searchEl.val("");
        searchEl.attr("placeholder","Search Liquor");
        prepAutocomplete(meals);
        circleIndicatorTwoEl.removeClass("active");
        circleIndicatorOneEl.addClass("active");
    }
}

// END SEARCH FUNCTIONS



// START RESULTS FUNCTIONS

// FUNCTION to gather the search results and build the results elements
// IN: Data Array containing result type and searched term
var generateResults = function(type) {
    // unpack type array
    var targetContainer = type.targetContainer;
    var indexSearchURL = type.indexSearchURL;
    var searchTerm = type.searchTerm;
    
    // gather search result 
    fetch(indexSearchURL + searchTerm)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    // run drink results for searched liquor; function
                    data[targetContainer].forEach(element => {
                        generateResultElement(type, element);
                    })
                });
            } else {
                console.log("the searched term did not respond valid data");
            }
        });
}

// FUNCTION to build and append a single result cell to a result container
// IN: element containing data from a single result
var generateResultElement = function(type, element) {
    // unpack type array
    var resultIcon = "str" + type.type + "Thumb";
    var resultTitle = "str" + type.type;
    var resultIdNo = "id" + type.type;
    var resultContainerId = "#" + type.type.toLowerCase() + "-results";
    var resultEl = $(resultContainerId);


    // cell wrapper for individual result
    var cellDiv = document.createElement("div");
    // bg img/ result icon
    var img = document.createElement("img");
    // div wrapper for title
    var h6Div = document.createElement("div");
    // title
    var h6 = document.createElement("h6");

    // add classes needed to elements
    $(cellDiv).addClass("cell large-4 result-cell");
    $(h6Div).addClass("result-bg");
    $(h6).addClass("result");

    // add data-img
    $(img).attr("src", element[resultIcon]);
    // add text data-title of drink
    $(h6).text(element[resultTitle]);
    // set result id to cell id
    $(cellDiv).attr("id", element[resultIdNo]);
    
    // put h4 in h4 wrapper
    h6Div.append(h6);
    // put h4 and img in cell
    cellDiv.append(img, h6Div);
    // append cell to results element
    resultEl.append(cellDiv)
}

// END RESULTS FUNCTIONS



// START MODAL FUNCTIONS

// FUNCTION to run whenever a result cell is clicked, generates a modal to display the corresponding api data for the selected cell
// IN: event object (cell being clicked)
var resultClicked = function(event) {
    // get container
    var container = $(event.target).closest(".result-cell");
    // get unique ip for api search
    var resultId = $(container).attr("id");

    // get result type (meal or drink)
    var type = getResultType(event);

    // fetch api data for modal
    fetchResultInfo(type, resultId);
}

// FUNCTION to distinguish between meal and drink results
// IN: event object (cell being clicked)
// OUT: type array containing necessary search terms for generating meal or drink modal
var getResultType = function(event) {
    // get result container id
    var resultContainer = $(event.target).closest(".results");
    var resultContainerId = resultContainer.attr("id");
    var type = "";

    // assign type based on id
    if (resultContainerId == "meal-results") {
        type = meals;
    } else if (resultContainerId == "drink-results") {
        type = drinks;
    }
    return type
}

// FUNCTION dafhaerhaerh
// IN: ASDLKGJLJ
var fetchResultInfo = function(type, resultId) {
    // unpack data array
    var idSearchURL = type.idSearchURL;

    // get api data for clicked result id
    fetch(idSearchURL + resultId)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    // display data in modal
                    openModal(type, data);
                })
            } else {
                console.log("no good baby");
            }
        });
}

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
    var saveText = "Save to Recipe Book";

    // add result type and id to save bttn for easier event handling
    $(".save-btn")
        .text(saveText)
        .attr('data-id', modalId)
        .attr('data-type', type.type);

    // open the modal 
    var modal = new Foundation.Reveal($('#result-modal'));
    modal.open();
}

// END MODAL FUNCTIONS



// START UP FUNCTIONS

// assign search suggestions (autocomplete) to input elements
prepAutocomplete(meals);
 
// END START UP FUNCTIONS



// EVENT HANDLERS START

// add event handler to search section 
$("#search-form").on("submit", submitHandler);

// run function when a result is selected
$(".results").on("click", resultClicked);

// EVENT HANDLERS END

