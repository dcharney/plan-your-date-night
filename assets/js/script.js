var liquorSearchEl = $("#liquor-search");
var proteinSearchEl = $("#protein-search");
var circleIndicatorOneEl = $("#circle-indicator-1");
var circleIndicatorTwoEl = $("#circle-indicator-2");
var meals = [];
var mealResultsEl = $("#meal-results");
var drinks = [];


// push data from api to food array
var suggestMeal = function(data) {
    console.log(data);
    data.meals.forEach(element => {
        meals.push(element.strIngredient);
    });
}

//push data from api to drink array
var suggestLiquor = function(data) {
    data.drinks.forEach(element => {
        drinks.push(element.strIngredient1);
    });
}

var fetchMealIngredientList = function() {
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list")
    .then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                console.log(data);
                suggestMeal(data); // populate suggestions
            });
        } else {
            console.log("not feeling it...");
        }
    });
}

var fetchLiquorIngredientList = function() {
    fetch("https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list")
    .then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                suggestLiquor(data); // populate suggestions
            });
        } else {
            console.log("no good baby");
        }
    });
}

var fetchMealSearch = function(keyword) {
    fetch("https://www.themealdb.com/api/json/v1/1/filter.php?i=" + keyword)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    mealResults(data);
                });
            } else {
                console.log("not feeling it...");
            }
        });
}

var fetchLiquorSearch = function(keyword) {
    fetch("https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=" + keyword)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    console.log(data);
                });
            } else {
                console.log("no good baby");
            }
        });
}

var submitHandler = function(event) {
    // prevent from refreshing page
    event.preventDefault()

    // switch to second input field if on first one
    if(circleIndicatorOneEl.hasClass("active") ) {
        // removing visibility from first input and circle indicator
        proteinSearchEl.removeClass("active");
        circleIndicatorOneEl.removeClass("active");

        // adding visibility to second input and circle indicator and focus on input
        liquorSearchEl.addClass("active");
        circleIndicatorTwoEl.addClass("active");
        liquorSearchEl.focus();

    } else { // user is on second field(liquor input)
        // check if user added protein and liquor before sending data
        if(!proteinSearchEl.val() || proteinSearchEl.val() == " ") {
            console.log("no meal ingredient entered");
        } else {
            // fetch food function here
            fetchMealSearch(proteinSearchEl.val());
        }

        if(!liquorSearchEl.val() || liquorSearchEl.val() == " ") { // if not valid or just empty spaces
            console.log("no liquor entered");
        } else {
            fetchLiquorSearch(liquorSearchEl.val());
        }
        // scroll to results section after search
        scrollTo(0, $('#results-section').offset().top);
    }

}

//push meal array into results container
var mealResults = function(data) {
    data.meals.forEach(element => {
        //wrapper for ind. meals
        var singleMealDiv = document.createElement("div");
        //bg img
        var mealImg = document.createElement("img");
        //wrapper for title
        var mealHeader = document.createElement("div");
        // title
        var mealTitle = document.createElement("h6");

        // add classes needed to elements
        $(singleMealDiv).addClass("cell large-4 result-cell");
        $(mealHeader).addClass("result-bg");
        $(mealTitle).addClass("result");
       

        // add data-img of meal
        $(mealImg).attr("src", element.strMealThumb);
        // add text data-title of meal
        $(mealTitle).text(element.strMeal);
        // set meal id to cell id
        $(singleMealDiv).attr("id", element.idMeal);

        
        // put h4 in h4 wrapper
        mealHeader.append(mealTitle);
        // put h4 and img in cell
        singleMealDiv.append(mealImg, mealHeader);
        // append cell to results element
        mealResultsEl.append(singleMealDiv);

        //could we use a modal once clicking on a recipe to display ingredients or recipe and give close button option and recipe book option?
    });
}
 

// submit listener
$("#search-form").on("submit", submitHandler);

// auto complete meal search
fetchMealIngredientList();
proteinSearchEl.autocomplete({ 
    source: meals,
    appendTo: "#suggestions-wrapper",
    autoFocus: true
});

// auto complete liquor search
fetchLiquorIngredientList();
liquorSearchEl.autocomplete({ 
    source: drinks,
    appendTo: "#suggestions-wrapper",
    autoFocus: true
});