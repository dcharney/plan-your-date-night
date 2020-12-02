var liquorSearchEl = $("#liquor-search");
var proteinSearchEl = $("#protein-search");
var circleIndicatorOneEl = $("#circle-indicator-1");
var circleIndicatorTwoEl = $("#circle-indicator-2");
var meals = [];
var mealResultsEl = $("#meal-results");
var drinks = [];


// push data from api to food array
var suggestMeal = function(data) {
    
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

// fetch clicked meal from results
var fetchMealInfo = function(idMeal) {
    // search by id
    fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + idMeal)
        .then(function(response) {
            console.log(response);
            if(response.ok) {
                response.json().then(function(data) {
                    openMealModal(data);
                });
            } else {
                console.log("no good baby");
            }  
        });
}

var openMealModal = function(data) {
    var dataInfo = data.meals[0];
    var mealName = dataInfo.strMeal;
    var instructions = dataInfo.strInstructions;
    var img = dataInfo.strMealThumb;
    var ingredients = [];

    // Filtering through the objects to find ingredients and put their values in an array
    for(var i = 0; i < 15; i++) { // ingredients list goes to 15 max in api
        if(dataInfo["strIngredient"+i]){
            ingredients.push(dataInfo["strIngredient"+i]);
        };
    }
    console.log(
        mealName,
        instructions,
        img,
        ingredients
    );

    var modal = new Foundation.Reveal($('#meal-modal'));
    modal.open();
}

var mealClicked = function(event) {
     // find meals container
    var meal = $(event.target).closest(".result-cell");
    // get id (unique meal id needed for api search)
    var idMeal = $(meal).attr("id");

    fetchMealInfo(idMeal);
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

// meal selected listener
$(mealResultsEl).on("click", mealClicked);